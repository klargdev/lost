-- Fix Storage Bucket Policies for gallary_images
-- This script will set proper policies for the storage.objects table

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access for gallary_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to gallary_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous users to upload to gallary_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own objects in gallary_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own objects in gallary_images" ON storage.objects;

-- Create new policies
-- 1. Public read access
CREATE POLICY "Allow public read access for gallary_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallary_images');

-- 2. Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload to gallary_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallary_images');

-- 3. Allow anonymous users to upload (for development)
CREATE POLICY "Allow anonymous users to upload to gallary_images"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'gallary_images');

-- 4. Allow users to update their own objects
CREATE POLICY "Allow users to update their own objects in gallary_images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gallary_images');

-- 5. Allow users to delete their own objects
CREATE POLICY "Allow users to delete their own objects in gallary_images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallary_images');

-- Verify the policies
SELECT 
  policyname,
  tablename,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM 
  pg_policies
WHERE 
  tablename = 'objects' AND
  schemaname = 'storage'
ORDER BY 
  policyname; 