-- Comprehensive SQL script to fix Row Level Security (RLS) policies for gallery images
-- Run this in the Supabase SQL Editor to fix permission issues

-- 1. First, disable RLS temporarily to allow modifications
ALTER TABLE IF EXISTS public.image_metadata DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.image_groups DISABLE ROW LEVEL SECURITY;

-- 2. Ensure tables exist with correct structure
CREATE TABLE IF NOT EXISTS public.image_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.image_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL UNIQUE,
  caption TEXT,
  group_id UUID REFERENCES public.image_groups(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS image_metadata_group_id_idx ON public.image_metadata(group_id);
CREATE INDEX IF NOT EXISTS image_metadata_filename_idx ON public.image_metadata(filename);

-- 4. Insert default image groups if they don't exist
INSERT INTO public.image_groups (name, description)
VALUES 
  ('Family', 'Family photos and memories'),
  ('Friends', 'Photos with friends'),
  ('Memories', 'Special moments and memories')
ON CONFLICT (name) DO NOTHING;

-- 5. Drop ALL existing policies to start fresh
-- First, get a list of all policies for these tables
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND (tablename = 'image_groups' OR tablename = 'image_metadata')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 
                      policy_record.policyname, 
                      policy_record.tablename);
    END LOOP;
END
$$;

-- 6. Re-enable RLS
ALTER TABLE public.image_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_metadata ENABLE ROW LEVEL SECURITY;

-- 7. Create new, more permissive policies

-- For image_groups table
-- Allow anyone to read image groups
CREATE POLICY "Allow public read access to image groups"
  ON public.image_groups FOR SELECT
  USING (true);

-- Allow anyone to insert, update, delete image groups (more permissive for development)
CREATE POLICY "Allow anyone to manage image groups"
  ON public.image_groups FOR ALL
  USING (true)
  WITH CHECK (true);

-- For image_metadata table
-- Allow anyone to read image metadata
CREATE POLICY "Allow public read access to image metadata"
  ON public.image_metadata FOR SELECT
  USING (true);

-- Allow anyone to insert, update, delete image metadata (more permissive for development)
CREATE POLICY "Allow anyone to manage image metadata"
  ON public.image_metadata FOR ALL
  USING (true)
  WITH CHECK (true);

-- 8. Verify storage bucket policies
-- Note: This is a reminder to check storage bucket policies in the Supabase dashboard
-- Storage > Buckets > gallary_images > Policies
-- Ensure there's a policy allowing uploads with:
-- - Operation: INSERT
-- - FOR: authenticated and anonymous users
-- - WITH CHECK: true

-- 9. Verify the changes
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  schemaname = 'public'
  AND (tablename = 'image_groups' OR tablename = 'image_metadata')
ORDER BY
  tablename, policyname; 