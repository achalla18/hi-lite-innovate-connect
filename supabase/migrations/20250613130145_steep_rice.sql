/*
  # Create login history table

  1. New Tables
    - `login_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `ip_address` (text)
      - `user_agent` (text)
      - `device_type` (text)
      - `location` (text)
      - `success` (boolean)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `login_history` table
    - Add policy for authenticated users to read their own login history
*/

CREATE TABLE IF NOT EXISTS login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ip_address text,
  user_agent text,
  device_type text,
  location text,
  success boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own login history"
  ON login_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to record login history
CREATE OR REPLACE FUNCTION record_login_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO login_history (user_id, success)
  VALUES (NEW.id, true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to record login history on successful login
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION record_login_history();