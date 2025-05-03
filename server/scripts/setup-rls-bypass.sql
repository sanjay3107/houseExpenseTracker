-- Function to temporarily disable RLS for seeding data
-- This should only be used during development/testing

-- Create a function that can be called to disable RLS temporarily
CREATE OR REPLACE FUNCTION disable_rls()
RETURNS void AS $$
BEGIN
  -- Temporarily disable RLS on expenses table
  ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
  
  -- Temporarily disable RLS on house_details table
  ALTER TABLE house_details DISABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to re-enable RLS after seeding
CREATE OR REPLACE FUNCTION enable_rls()
RETURNS void AS $$
BEGIN
  -- Re-enable RLS on expenses table
  ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
  
  -- Re-enable RLS on house_details table
  ALTER TABLE house_details ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION disable_rls() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION enable_rls() TO anon, authenticated;
