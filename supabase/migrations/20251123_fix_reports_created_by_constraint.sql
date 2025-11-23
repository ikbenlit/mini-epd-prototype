-- Migration: Fix reports created_by constraint for prototype
-- Remove foreign key constraint to practitioners table
-- For prototype: store auth user ID directly without FK constraint

-- Drop the foreign key constraints
ALTER TABLE reports
  DROP CONSTRAINT IF EXISTS reports_created_by_fkey;

ALTER TABLE reports
  DROP CONSTRAINT IF EXISTS reports_updated_by_fkey;

-- Add comments for clarity
COMMENT ON COLUMN reports.created_by IS 'Auth user ID (from auth.users) - no FK constraint in prototype';
COMMENT ON COLUMN reports.updated_by IS 'Auth user ID (from auth.users) - no FK constraint in prototype';

-- Note: In production, you would:
-- 1. Ensure all practitioners have user_id populated
-- 2. Look up practitioner.id from practitioners WHERE user_id = auth.uid()
-- 3. Restore FK constraints for data integrity
