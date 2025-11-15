-- ================================================
-- RLS Policy Tests
-- Created: 2024-11-15
-- Epic: E2 - Database & Auth
-- Story: E2.S2 - RLS policies implementeren
-- ================================================
-- This file contains test queries to verify RLS policies
-- Run these queries manually to verify RLS is working correctly
-- ================================================

-- ================================================
-- TEST 1: Verify RLS is enabled on all tables
-- ================================================
-- Expected: All tables should have rowsecurity = true

SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected output:
-- ai_events        | true
-- clients          | true
-- intake_notes     | true
-- problem_profiles | true
-- treatment_plans  | true

-- ================================================
-- TEST 2: Check all RLS policies exist
-- ================================================
-- Expected: Each table should have 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- except ai_events which has only 2 (SELECT, INSERT)

SELECT
  tablename,
  COUNT(*) as policy_count,
  STRING_AGG(cmd, ', ' ORDER BY cmd) as commands
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Expected output:
-- ai_events        | 2 | INSERT, SELECT
-- clients          | 4 | DELETE, INSERT, SELECT, UPDATE
-- intake_notes     | 4 | DELETE, INSERT, SELECT, UPDATE
-- problem_profiles | 4 | DELETE, INSERT, SELECT, UPDATE
-- treatment_plans  | 4 | DELETE, INSERT, SELECT, UPDATE

-- ================================================
-- TEST 3: Verify policy predicates use auth.uid()
-- ================================================
-- Expected: All policies should check auth.uid() IS NOT NULL

SELECT
  tablename,
  policyname,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND qual NOT LIKE '%auth.uid()%'
ORDER BY tablename, policyname;

-- Expected output: Empty (no policies without auth.uid() check)

-- ================================================
-- TEST 4: Simulate authenticated user query
-- ================================================
-- This test simulates what happens when an authenticated user
-- tries to access data. In production, auth.uid() would return
-- the user's actual UUID.

-- Note: These queries will work in the SQL editor when logged in,
-- but will fail when run as unauthenticated

-- Test SELECT permission (should succeed when authenticated)
-- SELECT * FROM clients LIMIT 1;

-- Test INSERT permission (should succeed when authenticated)
-- INSERT INTO clients (first_name, last_name, birth_date)
-- VALUES ('Test', 'User', '1990-01-01');

-- Test UPDATE permission (should succeed when authenticated)
-- UPDATE clients SET first_name = 'Updated' WHERE id = 'some-uuid';

-- Test DELETE permission (should succeed when authenticated)
-- DELETE FROM clients WHERE id = 'some-uuid';

-- ================================================
-- TEST 5: Verify ai_events immutability
-- ================================================
-- Expected: ai_events should NOT have UPDATE or DELETE policies
-- (except for service role via RLS bypass)

SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'ai_events'
  AND cmd IN ('UPDATE', 'DELETE')
ORDER BY cmd;

-- Expected output: Empty (no UPDATE or DELETE policies for regular users)

-- ================================================
-- TEST 6: Check foreign key relationships
-- ================================================
-- Expected: All foreign keys should be properly set up

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Expected output:
-- intake_notes     | client_id       | clients       | id | CASCADE
-- problem_profiles | client_id       | clients       | id | CASCADE
-- problem_profiles | source_note_id  | intake_notes  | id | SET NULL
-- treatment_plans  | client_id       | clients       | id | CASCADE
-- ai_events        | client_id       | clients       | id | SET NULL
-- ai_events        | note_id         | intake_notes  | id | SET NULL

-- ================================================
-- PRODUCTION MIGRATION PATH
-- ================================================
-- When moving to production, enhance policies with org_id filtering:
--
-- 1. Add org_id column to all tables:
--    ALTER TABLE clients ADD COLUMN org_id UUID REFERENCES organizations(id);
--
-- 2. Update policies to filter by organization:
--    CREATE POLICY "Users can view own org clients"
--      ON clients
--      FOR SELECT
--      USING (
--        auth.uid() IS NOT NULL AND
--        org_id = (SELECT org_id FROM users WHERE id = auth.uid())
--      );
--
-- 3. Add role-based access:
--    CREATE POLICY "Admins can view all"
--      ON clients
--      FOR SELECT
--      USING (
--        auth.uid() IS NOT NULL AND
--        EXISTS (
--          SELECT 1 FROM users
--          WHERE id = auth.uid() AND role = 'admin'
--        )
--      );

-- ================================================
-- SECURITY NOTES
-- ================================================
-- 1. Current policies are MVP-level: all authenticated users can access all data
-- 2. In production, add org_id filtering for multi-tenancy
-- 3. ai_events table is append-only for regular users (audit trail)
-- 4. Service role can bypass RLS for admin operations
-- 5. All policies use auth.uid() for security
-- 6. Foreign key CASCADE ensures orphaned records are cleaned up
