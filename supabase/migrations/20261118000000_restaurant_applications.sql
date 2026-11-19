-- Migration: Restaurant Partner Applications and Approval Workflow
-- Enforces server-side ADMIN approval, immutable roles via client, and strict RLS.

-- 1. Ensure automatic auth.users -> public.users trigger is present and secure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''), split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    'CUSTOMER'
  )
  ON CONFLICT (id) DO UPDATE
  SET name = CASE WHEN public.users.name IS NULL OR public.users.name = '' THEN EXCLUDED.name ELSE public.users.name END,
      email = EXCLUDED.email;

  -- If restaurant partner registration details are included in metadata,
  -- automatically register the pending application under CUSTOMER role
  IF NULLIF(TRIM(NEW.raw_user_meta_data->>'restaurant_name'), '') IS NOT NULL THEN
    INSERT INTO public.restaurant_applications (
      user_id,
      restaurant_name,
      restaurant_address,
      contact_phone,
      status
    ) VALUES (
      NEW.id,
      SUBSTRING(TRIM(NEW.raw_user_meta_data->>'restaurant_name') FROM 1 FOR 150),
      COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'restaurant_address'), ''), 'Pending address'),
      SUBSTRING(COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'contact_phone'), ''), 'Pending phone') FROM 1 FOR 20),
      'PENDING'
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Create public.restaurant_applications table with column lengths aligned to public.restaurants
CREATE TABLE IF NOT EXISTS public.restaurant_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  restaurant_name VARCHAR(150) NOT NULL,
  restaurant_address TEXT NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Partial unique index: at most one pending application per user
CREATE UNIQUE INDEX IF NOT EXISTS one_pending_application_per_user
  ON public.restaurant_applications(user_id)
  WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_restaurant_applications_user_id
  ON public.restaurant_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_restaurant_applications_status
  ON public.restaurant_applications(status);

-- 4. Automatic updated_at trigger (reuses public.set_updated_at())
DROP TRIGGER IF EXISTS set_restaurant_applications_updated_at ON public.restaurant_applications;
CREATE TRIGGER set_restaurant_applications_updated_at
  BEFORE UPDATE ON public.restaurant_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.restaurant_applications ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "Users can view own restaurant application" ON public.restaurant_applications;
CREATE POLICY "Users can view own restaurant application"
  ON public.restaurant_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Customers can submit own restaurant application" ON public.restaurant_applications;
CREATE POLICY "Customers can submit own restaurant application"
  ON public.restaurant_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'PENDING'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'CUSTOMER'
    )
  );

DROP POLICY IF EXISTS "Admins can view all restaurant applications" ON public.restaurant_applications;
CREATE POLICY "Admins can view all restaurant applications"
  ON public.restaurant_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- NOTICE: No UPDATE or DELETE policies are granted to anyone.
-- Application status transitions happen exclusively via the protected database functions below.

-- 7. Approval Function (SECURITY DEFINER, derives admin from auth.uid())
CREATE OR REPLACE FUNCTION public.approve_restaurant_application(
  p_application_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID := auth.uid();
  v_app RECORD;
  v_restaurant_id UUID;
BEGIN
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Enforce actual ADMIN role authorization inside the function
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = v_admin_id AND role = 'ADMIN'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: only administrators can approve applications';
  END IF;

  SELECT * INTO v_app
  FROM public.restaurant_applications
  WHERE id = p_application_id
  FOR UPDATE;

  IF v_app IS NULL THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_app.status <> 'PENDING' THEN
    RAISE EXCEPTION 'Application is not pending (current status: %)', v_app.status;
  END IF;

  -- 1. Upgrade user role in public.users to RESTAURANT_MANAGER
  -- Allowed because this function is SECURITY DEFINER owned by postgres
  UPDATE public.users
  SET role = 'RESTAURANT_MANAGER'
  WHERE id = v_app.user_id;

  -- 2. Create or activate restaurant linked to manager_id
  INSERT INTO public.restaurants (
    manager_id,
    name,
    address,
    phone,
    description,
    status
  ) VALUES (
    v_app.user_id,
    v_app.restaurant_name,
    v_app.restaurant_address,
    v_app.contact_phone,
    'Verified partner kitchen',
    'ACTIVE'
  )
  ON CONFLICT (manager_id) DO UPDATE
  SET name = EXCLUDED.name,
      address = EXCLUDED.address,
      phone = EXCLUDED.phone,
      status = 'ACTIVE'
  RETURNING id INTO v_restaurant_id;

  -- 3. Mark application as APPROVED
  UPDATE public.restaurant_applications
  SET status = 'APPROVED',
      reviewed_by = v_admin_id,
      reviewed_at = now()
  WHERE id = p_application_id;

  RETURN v_restaurant_id;
END;
$$;

-- 8. Rejection Function (SECURITY DEFINER, derives admin from auth.uid())
CREATE OR REPLACE FUNCTION public.reject_restaurant_application(
  p_application_id UUID,
  p_notes TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID := auth.uid();
  v_app RECORD;
BEGIN
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Enforce actual ADMIN role authorization inside the function
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = v_admin_id AND role = 'ADMIN'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: only administrators can reject applications';
  END IF;

  SELECT * INTO v_app
  FROM public.restaurant_applications
  WHERE id = p_application_id
  FOR UPDATE;

  IF v_app IS NULL THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_app.status <> 'PENDING' THEN
    RAISE EXCEPTION 'Application is not pending (current status: %)', v_app.status;
  END IF;

  UPDATE public.restaurant_applications
  SET status = 'REJECTED',
      admin_notes = p_notes,
      reviewed_by = v_admin_id,
      reviewed_at = now()
  WHERE id = p_application_id;
END;
$$;

-- 9. Explicitly revoke EXECUTE from PUBLIC and anon, grant only to authenticated
REVOKE ALL ON FUNCTION public.approve_restaurant_application(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_restaurant_application(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.reject_restaurant_application(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reject_restaurant_application(UUID, TEXT) TO authenticated;

-- Ensure function ownership is postgres so SECURITY DEFINER bypasses prevent_user_role_change
ALTER FUNCTION public.approve_restaurant_application(UUID) OWNER TO postgres;
ALTER FUNCTION public.reject_restaurant_application(UUID, TEXT) OWNER TO postgres;
