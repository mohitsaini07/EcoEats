-- Migration: Fix user delete foreign key constraints
-- Problem: Deleting a user from auth.users cascades to public.users, but
--          restaurants.manager_id and orders.user_id have ON DELETE RESTRICT,
--          which blocks the deletion.
-- Solution: Change these two FKs to ON DELETE SET NULL so that:
--   - The restaurant row is preserved (with manager_id = NULL)
--   - The order row is preserved (with user_id = NULL)
--   - Historical transaction data is never lost
--   - A trigger auto-closes restaurants when their manager is removed
--
-- The downstream RESTRICT constraints (orders.restaurant_id, payments.order_id,
-- carts.restaurant_id) are NOT affected because the parent rows (restaurants,
-- orders) are preserved — only the user reference is nullified.
--
-- Additionally, cart_items.cart_id has ON DELETE RESTRICT, which blocks the
-- cascade from users → carts → cart_items. Cart items are transient (not
-- historical), so they should CASCADE with their parent cart.

BEGIN;

-- 1. restaurants.manager_id: RESTRICT → SET NULL
--    Allow the column to be nullable first.
ALTER TABLE public.restaurants
  ALTER COLUMN manager_id DROP NOT NULL;

ALTER TABLE public.restaurants
  DROP CONSTRAINT restaurants_manager_id_fkey;

ALTER TABLE public.restaurants
  ADD CONSTRAINT restaurants_manager_id_fkey
    FOREIGN KEY (manager_id)
    REFERENCES public.users(id)
    ON DELETE SET NULL;

-- 2. orders.user_id: RESTRICT → SET NULL
--    Allow the column to be nullable first.
ALTER TABLE public.orders
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.orders
  DROP CONSTRAINT orders_user_id_fkey;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users(id)
    ON DELETE SET NULL;

-- 3. cart_items.cart_id: RESTRICT → CASCADE
--    Cart items are transient and should be deleted with their parent cart.
ALTER TABLE public.cart_items
  DROP CONSTRAINT cart_items_cart_id_fkey;

ALTER TABLE public.cart_items
  ADD CONSTRAINT cart_items_cart_id_fkey
    FOREIGN KEY (cart_id)
    REFERENCES public.carts(id)
    ON DELETE CASCADE;

-- 4. Auto-close restaurants when their manager is removed.
--    When manager_id becomes NULL (via SET NULL cascade), set status to CLOSED.
--    Per AGENTS.md: "Prefer CLOSED over deleting historical restaurants."
CREATE OR REPLACE FUNCTION public.close_restaurant_on_manager_removed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.manager_id IS NOT NULL AND NEW.manager_id IS NULL THEN
    NEW.status := 'CLOSED';
  END IF;
  RETURN NEW;
END;
$$;

-- Drop if exists to make migration idempotent
DROP TRIGGER IF EXISTS close_restaurant_on_manager_removed ON public.restaurants;

CREATE TRIGGER close_restaurant_on_manager_removed
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.close_restaurant_on_manager_removed();

COMMIT;
