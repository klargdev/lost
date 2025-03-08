-- Create image groups table
CREATE TABLE IF NOT EXISTS public.image_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create image metadata table
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

-- Create RLS policies for image_groups
ALTER TABLE public.image_groups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read image groups
CREATE POLICY "Allow public read access to image groups" 
  ON public.image_groups FOR SELECT USING (true);

-- Allow authenticated users to insert, update, delete image groups
CREATE POLICY "Allow authenticated users to manage image groups" 
  ON public.image_groups FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for image_metadata
ALTER TABLE public.image_metadata ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read image metadata
CREATE POLICY "Allow public read access to image metadata" 
  ON public.image_metadata FOR SELECT USING (true);

-- Allow authenticated users to insert, update, delete image metadata
CREATE POLICY "Allow authenticated users to manage image metadata" 
  ON public.image_metadata FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Insert default image groups
INSERT INTO public.image_groups (name, description)
VALUES 
  ('Family', 'Family photos and memories'),
  ('Friends', 'Photos with friends'),
  ('Memories', 'Special moments and memories')
ON CONFLICT (name) DO NOTHING;

-- Create a stored procedure to create the image_groups table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_image_groups_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'image_groups'
  ) THEN
    -- Create the table
    CREATE TABLE public.image_groups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
    
    -- Create RLS policies
    ALTER TABLE public.image_groups ENABLE ROW LEVEL SECURITY;
    
    -- Allow anyone to read image groups
    CREATE POLICY "Allow public read access to image groups" 
      ON public.image_groups FOR SELECT USING (true);
    
    -- Allow authenticated users to insert, update, delete image groups
    CREATE POLICY "Allow authenticated users to manage image groups" 
      ON public.image_groups FOR ALL 
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
    
    -- Insert default groups
    INSERT INTO public.image_groups (name, description)
    VALUES 
      ('Family', 'Family photos and memories'),
      ('Friends', 'Photos with friends'),
      ('Memories', 'Special moments and memories');
  END IF;
  
  -- Check if the metadata table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'image_metadata'
  ) THEN
    -- Create the table
    CREATE TABLE public.image_metadata (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      filename TEXT NOT NULL UNIQUE,
      caption TEXT,
      group_id UUID REFERENCES public.image_groups(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS image_metadata_group_id_idx ON public.image_metadata(group_id);
    CREATE INDEX IF NOT EXISTS image_metadata_filename_idx ON public.image_metadata(filename);
    
    -- Create RLS policies
    ALTER TABLE public.image_metadata ENABLE ROW LEVEL SECURITY;
    
    -- Allow anyone to read image metadata
    CREATE POLICY "Allow public read access to image metadata" 
      ON public.image_metadata FOR SELECT USING (true);
    
    -- Allow authenticated users to insert, update, delete image metadata
    CREATE POLICY "Allow authenticated users to manage image metadata" 
      ON public.image_metadata FOR ALL 
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END;
$$;
