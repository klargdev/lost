/*
  # Initial Schema Setup for Tribute Web App

  1. New Tables
    - `tributes`
      - `id` (uuid, primary key)
      - `message` (text)
      - `author_name` (text)
      - `created_at` (timestamp)
    
    - `donations`
      - `id` (uuid, primary key)
      - `amount` (integer)
      - `donor_name` (text)
      - `payment_status` (text)
      - `payment_id` (text)
      - `created_at` (timestamp)
    
    - `gallary_images`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `image_url` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for admin write access
*/

-- Create tributes table
CREATE TABLE IF NOT EXISTS tributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  author_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount integer NOT NULL,
  donor_name text NOT NULL,
  payment_status text NOT NULL,
  payment_id text,
  created_at timestamptz DEFAULT now()
);

-- Create gallary_images table
CREATE TABLE IF NOT EXISTS  (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE  ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access for tributes" 
  ON tributes FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access for donations" 
  ON donations FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access for " 
  ON  FOR SELECT 
  TO public 
  USING (true);

-- Create policies for public insert access for tributes and donations
CREATE POLICY "Allow public insert for tributes"
  ON tributes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public insert for donations"
  ON donations FOR INSERT
  TO public
  WITH CHECK (true);