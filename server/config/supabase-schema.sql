-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Purchase', 'Renovation', 'Maintenance', 'Tax', 'Insurance', 'Utility', 'Other')),
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  payment_method VARCHAR(50) CHECK (payment_method IN ('Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Check', 'Other')),
  receipt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create house_details table
CREATE TABLE IF NOT EXISTS house_details (
  id SERIAL PRIMARY KEY,
  address JSONB NOT NULL,
  purchase_details JSONB NOT NULL,
  property_details JSONB,
  loan_details JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_expenses_modtime
BEFORE UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_house_details_modtime
BEFORE UPDATE ON house_details
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create RLS (Row Level Security) policies
-- This is a simplified example. In a real-world application, you would
-- want to set up more granular policies based on user authentication

-- Enable RLS on tables
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE house_details ENABLE ROW LEVEL SECURITY;

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
