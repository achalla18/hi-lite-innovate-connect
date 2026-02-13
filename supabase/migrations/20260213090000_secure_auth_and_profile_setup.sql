/*
  # Secure auth + account setup hardening

  1. Profile hardening
    - add `profile_completed` flag
    - add validation constraints for lengths
    - enforce 1:1 relation with auth.users
  2. Account audit
    - add `account_events` table for sign-up/profile-completion events
  3. Automation
    - add trigger to create profile/settings rows for new auth users
*/

ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS profile_completed boolean NOT NULL DEFAULT false;

ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_name_length_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_name_length_check
      CHECK (name IS NULL OR char_length(name) BETWEEN 2 AND 120);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_about_length_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_about_length_check
      CHECK (about IS NULL OR char_length(about) <= 1000);
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS account_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('signup', 'profile_completed', 'login_success')),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE account_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'account_events'
      AND policyname = 'Users can read their own account events'
  ) THEN
    CREATE POLICY "Users can read their own account events"
      ON account_events
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'account_events'
      AND policyname = 'Users can insert their own account events'
  ) THEN
    CREATE POLICY "Users can insert their own account events"
      ON account_events
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION create_app_profile_and_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url, profile_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url',
    false
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.account_events (user_id, event_type, metadata)
  VALUES (NEW.id, 'signup', jsonb_build_object('email_confirmed', NEW.email_confirmed_at IS NOT NULL));

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_auth_user_created_profile_and_settings'
      AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created_profile_and_settings
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION create_app_profile_and_settings();
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION mark_profile_completed_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF COALESCE(OLD.profile_completed, false) = false
     AND COALESCE(NEW.profile_completed, false) = true THEN
    INSERT INTO public.account_events (user_id, event_type, metadata)
    VALUES (NEW.id, 'profile_completed', jsonb_build_object('source', 'profile_setup'));
  END IF;

  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_profile_updated_account_events'
      AND tgrelid = 'public.profiles'::regclass
  ) THEN
    CREATE TRIGGER on_profile_updated_account_events
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION mark_profile_completed_event();
  END IF;
END
$$;
