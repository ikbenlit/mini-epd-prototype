-- ================================================
-- Demo Users Seed Data
-- Created: 2024-11-15
-- Epic: E2 - Database & Auth
-- Story: E2.S3 - Demo auth flow
-- ================================================
-- This migration creates demo user accounts in Supabase Auth
-- These accounts are used for public demos and presentations
-- ================================================

-- Note: This SQL creates the demo users in the auth.users table
-- The actual signup should be done via Supabase Auth API or Dashboard
-- for proper password hashing and email confirmation handling

-- ================================================
-- DEMO USER ACCOUNTS TO CREATE
-- ================================================
-- These users should be created via Supabase Dashboard or Auth API:
--
-- 1. Interactive Demo User
--    Email: demo@mini-ecd.demo
--    Password: Demo2024!
--    Access Level: Full access (can create/edit/delete)
--
-- 2. Read-Only Demo User
--    Email: readonly@mini-ecd.demo
--    Password: Demo2024!
--    Access Level: Read-only (can only view)
--
-- 3. Presenter Demo User (for live sessions)
--    Email: presenter@mini-ecd.demo
--    Password: Demo2024!
--    Access Level: Full access
--

-- ================================================
-- DEMO_USERS TRACKING TABLE (Optional - for future enhancement)
-- ================================================
-- Table to track demo user sessions and usage
-- This is optional for MVP but useful for analytics

CREATE TABLE IF NOT EXISTS demo_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL DEFAULT 'read_only'
    CHECK (access_level IN ('read_only', 'interactive', 'presenter')),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'),
  usage_count INTEGER DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Metadata for tracking
  notes TEXT -- Internal notes about this demo account
);

-- Index for quick lookups
CREATE INDEX idx_demo_users_user_id ON demo_users(user_id);
CREATE INDEX idx_demo_users_expires_at ON demo_users(expires_at);

-- ================================================
-- RLS POLICIES FOR DEMO_USERS TABLE
-- ================================================
-- Only authenticated users can view demo_users info
-- Only service role can manage demo_users

ALTER TABLE demo_users ENABLE ROW LEVEL SECURITY;

-- Users can view demo_users table (for checking if account is demo)
CREATE POLICY "Authenticated users can view demo users"
  ON demo_users
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only service role can insert/update/delete
-- (Regular users cannot modify via SQL, only via API with service role key)

-- ================================================
-- AUTOMATIC UPDATED_AT TRIGGER
-- ================================================
CREATE TRIGGER update_demo_users_updated_at
  BEFORE UPDATE ON demo_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- HELPER FUNCTION: Check if user is demo user
-- ================================================
CREATE OR REPLACE FUNCTION is_demo_user(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM demo_users
    WHERE user_id = check_user_id
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- HELPER FUNCTION: Get demo user access level
-- ================================================
CREATE OR REPLACE FUNCTION get_demo_access_level(check_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  level TEXT;
BEGIN
  SELECT access_level INTO level
  FROM demo_users
  WHERE user_id = check_user_id
    AND (expires_at IS NULL OR expires_at > NOW());

  RETURN level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- COMMENTS
-- ================================================
COMMENT ON TABLE demo_users IS
  'Tracking table for demo user accounts. Links auth.users to demo account metadata.';

COMMENT ON COLUMN demo_users.access_level IS
  'Access level: read_only (view only), interactive (full CRUD), presenter (full access + special features)';

COMMENT ON COLUMN demo_users.expires_at IS
  'Optional expiration date for demo account. NULL means no expiration.';

COMMENT ON COLUMN demo_users.usage_count IS
  'Number of times this demo account has been used (incremented on login)';

COMMENT ON FUNCTION is_demo_user IS
  'Check if a user_id belongs to an active demo account';

COMMENT ON FUNCTION get_demo_access_level IS
  'Get the access level for a demo user. Returns NULL if not a demo user or expired.';

-- ================================================
-- INSTRUCTIONS FOR CREATING DEMO USERS
-- ================================================
-- Run these commands in your application code or via Supabase Dashboard:
--
-- Method 1: Via Supabase Dashboard
-- 1. Go to Authentication > Users
-- 2. Click "Add User"
-- 3. Add email + password
-- 4. Confirm email manually
-- 5. Then insert into demo_users table:
--
-- INSERT INTO demo_users (user_id, access_level, notes)
-- VALUES (
--   (SELECT id FROM auth.users WHERE email = 'demo@mini-ecd.demo'),
--   'interactive',
--   'Main demo account for presentations and LinkedIn demos'
-- );
--
-- Method 2: Via API (recommended for automation)
-- See: docs/DEMO_USERS_SETUP.md for setup script

-- ================================================
-- SEED DATA (to be inserted after users are created in auth.users)
-- ================================================
-- This will be executed by a separate seed script after demo users
-- are created in Supabase Auth

-- Note: Uncomment and run AFTER creating the auth.users manually
-- or via the API setup script

/*
INSERT INTO demo_users (user_id, access_level, notes, expires_at)
VALUES
  (
    (SELECT id FROM auth.users WHERE email = 'demo@mini-ecd.demo'),
    'interactive',
    'Main interactive demo account - full CRUD access',
    NULL  -- No expiration
  ),
  (
    (SELECT id FROM auth.users WHERE email = 'readonly@mini-ecd.demo'),
    'read_only',
    'Read-only demo account - view only access',
    NULL  -- No expiration
  ),
  (
    (SELECT id FROM auth.users WHERE email = 'presenter@mini-ecd.demo'),
    'presenter',
    'Presenter account for live demo sessions',
    NULL  -- No expiration
  )
ON CONFLICT (user_id) DO NOTHING;
*/
