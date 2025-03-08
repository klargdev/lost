-- First, disable RLS temporarily to allow us to insert the default groups
ALTER TABLE public.image_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_metadata DISABLE ROW LEVEL SECURITY;

-- Create image groups table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.image_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create image metadata table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.image_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL UNIQUE,
  caption TEXT,
  group_id UUID REFERENCES public.image_groups(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS image_metadata_group_id_idx ON public.image_metadata(group_id);
CREATE INDEX IF NOT EXISTS image_metadata_filename_idx ON public.image_metadata(filename);

-- Insert default image groups (this will work now that RLS is disabled)
INSERT INTO public.image_groups (name, description)
VALUES
  ('Family', 'Family photos and memories'),
  ('Friends', 'Photos with friends'),
  ('Memories', 'Special moments and memories')
ON CONFLICT (name) DO NOTHING;

-- Now re-enable RLS
ALTER TABLE public.image_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_metadata ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to image groups" ON public.image_groups;
DROP POLICY IF EXISTS "Allow authenticated users to manage image groups" ON public.image_groups;
DROP POLICY IF EXISTS "Allow public read access to image metadata" ON public.image_metadata;
DROP POLICY IF EXISTS "Allow authenticated users to manage image metadata" ON public.image_metadata;

DROP POLICY IF EXISTS "Allow anon read access to image groups" ON public.image_groups;
DROP POLICY IF EXISTS "Allow anon read access to image metadata" ON public.image_metadata;

-- Create new policies for image_groups
-- Allow anyone to read image groups
CREATE POLICY "Allow public read access to image groups"
  ON public.image_groups FOR SELECT
  USING (true);

-- Allow authenticated users to insert, update, and delete image groups
CREATE POLICY "Allow authenticated users to manage image groups"
  ON public.image_groups FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create new policies for image_metadata
-- Allow anyone to read image metadata
CREATE POLICY "Allow public read access to image metadata"
  ON public.image_metadata FOR SELECT
  USING (true);

-- Allow authenticated users to insert, update, and delete image metadata
CREATE POLICY "Allow authenticated users to manage image metadata"
  ON public.image_metadata FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated'); 