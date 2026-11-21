-- Migration: Add image_url to food_listings and configure listing-images storage
--
-- 1. Add image_url column to public.food_listings
ALTER TABLE public.food_listings 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Configure storage bucket for listing images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images', 
  'listing-images', 
  true, 
  10485760, 
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 3. Configure storage bucket selection policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'buckets' AND policyname = 'Allow public select on buckets'
  ) THEN
    CREATE POLICY "Allow public select on buckets" ON storage.buckets FOR SELECT USING (true);
  END IF;
END
$$;

-- 4. Storage object policies for listing-images
DO $$
BEGIN
  -- Public read access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access for listing-images'
  ) THEN
    CREATE POLICY "Public Access for listing-images" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'listing-images');
  END IF;

  -- Authenticated user insert
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated upload to listing-images'
  ) THEN
    CREATE POLICY "Authenticated upload to listing-images" 
    ON storage.objects FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'listing-images');
  END IF;

  -- Authenticated user update
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated update to listing-images'
  ) THEN
    CREATE POLICY "Authenticated update to listing-images" 
    ON storage.objects FOR UPDATE TO authenticated 
    USING (bucket_id = 'listing-images');
  END IF;

  -- Authenticated user delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated delete from listing-images'
  ) THEN
    CREATE POLICY "Authenticated delete from listing-images" 
    ON storage.objects FOR DELETE TO authenticated 
    USING (bucket_id = 'listing-images');
  END IF;
END
$$;
