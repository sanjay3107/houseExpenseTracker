-- Update RLS policies for development purposes
-- This script only updates the RLS policies without recreating tables or triggers

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON expenses;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON house_details;
DROP POLICY IF EXISTS "Allow read access to anonymous users" ON expenses;
DROP POLICY IF EXISTS "Allow read access to anonymous users" ON house_details;
DROP POLICY IF EXISTS "Allow full access to all users" ON expenses;
DROP POLICY IF EXISTS "Allow full access to all users" ON house_details;

-- Create policies for both authenticated and anonymous users (for development purposes)
-- In production, you would want to restrict this further

-- Allow full access to expenses table for both authenticated and anonymous users
CREATE POLICY "Allow full access to all users" ON expenses
  USING (true)
  WITH CHECK (true);

-- Allow full access to house_details table for both authenticated and anonymous users
CREATE POLICY "Allow full access to all users" ON house_details
  USING (true)
  WITH CHECK (true);
