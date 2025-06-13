/*
  # Create club members table and related functionality

  1. New Tables
    - `club_members` - Tracks club membership with roles
      - `id` (uuid, primary key)
      - `club_id` (uuid, references clubs)
      - `user_id` (uuid, references users)
      - `role` (text, member role: 'owner', 'admin', 'member')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on club_members table
    - Add policies for viewing, joining, and managing club memberships
*/

-- Create club_members table
CREATE TABLE IF NOT EXISTS club_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(club_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Club members are viewable by everyone"
  ON club_members
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can join clubs"
  ON club_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'member');

CREATE POLICY "Club owners can manage members"
  ON club_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_id = club_members.club_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can leave clubs"
  ON club_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update club member count
CREATE OR REPLACE FUNCTION update_club_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE clubs
    SET member_count = (
      SELECT COUNT(*) FROM club_members
      WHERE club_id = NEW.club_id
    )
    WHERE id = NEW.club_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE clubs
    SET member_count = (
      SELECT COUNT(*) FROM club_members
      WHERE club_id = OLD.club_id
    )
    WHERE id = OLD.club_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update member count
CREATE TRIGGER update_club_member_count_trigger
AFTER INSERT OR DELETE ON club_members
FOR EACH ROW EXECUTE FUNCTION update_club_member_count();

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER handle_club_members_updated_at
BEFORE UPDATE ON club_members
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();