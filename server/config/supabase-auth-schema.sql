-- Add user_id column to expenses table
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add user_id column to house_details table
ALTER TABLE house_details ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE house_details ENABLE ROW LEVEL SECURITY;

-- Create policy for expenses table - select
CREATE POLICY "Users can view their own expenses" 
ON expenses FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for expenses table - insert
CREATE POLICY "Users can insert their own expenses" 
ON expenses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy for expenses table - update
CREATE POLICY "Users can update their own expenses" 
ON expenses FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy for expenses table - delete
CREATE POLICY "Users can delete their own expenses" 
ON expenses FOR DELETE 
USING (auth.uid() = user_id);

-- Create policy for house_details table - select
CREATE POLICY "Users can view their own house details" 
ON house_details FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for house_details table - insert
CREATE POLICY "Users can insert their own house details" 
ON house_details FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy for house_details table - update
CREATE POLICY "Users can update their own house details" 
ON house_details FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy for house_details table - delete
CREATE POLICY "Users can delete their own house details" 
ON house_details FOR DELETE 
USING (auth.uid() = user_id);

-- Optional: Create a profile table to store additional user info
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles table - select (users can only view their own profile)
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Create policy for profiles table - update (users can only update their own profile)
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Create trigger to set updated_at on profiles
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on profiles
CREATE TRIGGER set_updated_at_on_profiles
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
