-- Migration: Add DELETE RLS policy for food_listings
-- Allows managers to delete food listings belonging to their own restaurant.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'food_listings' 
      AND policyname = 'Managers can delete their food listings'
  ) THEN
    CREATE POLICY "Managers can delete their food listings" 
    ON public.food_listings
    FOR DELETE TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = food_listings.restaurant_id 
          AND r.manager_id = auth.uid()
      )
    );
  END IF;
END
$$;
