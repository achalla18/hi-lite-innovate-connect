/*
  # Update clubs table with additional fields

  1. Changes
    - Add `is_private` boolean field to clubs table
    - Add `tags` text array field to clubs table
    - Add `cover_image_url` text field to clubs table
    - Add `owner_id` uuid field to clubs table
  
  2. Security
    - Add policy for creating clubs
    - Add policy for updating clubs
*/

-- Add new columns to clubs table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'is_private') THEN
    ALTER TABLE clubs ADD COLUMN is_private boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'tags') THEN
    ALTER TABLE clubs ADD COLUMN tags text[] DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'cover_image_url') THEN
    ALTER TABLE clubs ADD COLUMN cover_image_url text DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubs' AND column_name = 'owner_id') THEN
    ALTER TABLE clubs ADD COLUMN owner_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Create policies for clubs table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clubs' AND policyname = 'Users can create clubs') THEN
    CREATE POLICY "Users can create clubs"
      ON clubs
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = owner_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clubs' AND policyname = 'Club owners can update clubs') THEN
    CREATE POLICY "Club owners can update clubs"
      ON clubs
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = owner_id);
  END IF;
END $$;

-- Create trigger for updated_at if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_clubs_updated_at') THEN
    CREATE TRIGGER handle_clubs_updated_at
    BEFORE UPDATE ON clubs
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;