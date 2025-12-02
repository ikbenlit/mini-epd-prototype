-- ============================================================================
-- Migration: Add encounter_id and intake_id columns to reports table
-- Epic: E0 - Database & Types
-- Story: E0.S1 - encounter_id toevoegen aan reports
-- ============================================================================
-- This migration adds bidirectional linking between reports and encounters/intakes
-- allowing reports to be associated with specific appointments and intake sessions.
-- ============================================================================

-- Add encounter_id column
-- Links reports to specific encounters (appointments)
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS encounter_id UUID REFERENCES encounters(id) ON DELETE SET NULL;

-- Add intake_id column
-- Links reports to specific intake sessions
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS intake_id UUID REFERENCES intakes(id) ON DELETE SET NULL;

-- Add comments for documentation
COMMENT ON COLUMN reports.encounter_id IS 'Link report to specific encounter/appointment (FHIR Encounter reference)';
COMMENT ON COLUMN reports.intake_id IS 'Link report to specific intake session';

-- ============================================================================
-- Verification
-- ============================================================================
DO $$
BEGIN
  -- Check encounter_id column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'encounter_id'
  ) THEN
    RAISE NOTICE '✓ encounter_id column added to reports table';
  ELSE
    RAISE EXCEPTION 'encounter_id column not found in reports table';
  END IF;

  -- Check intake_id column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'intake_id'
  ) THEN
    RAISE NOTICE '✓ intake_id column added to reports table';
  ELSE
    RAISE EXCEPTION 'intake_id column not found in reports table';
  END IF;

  RAISE NOTICE '============================================';
  RAISE NOTICE 'Migration E0.S1 completed successfully';
  RAISE NOTICE '============================================';
END $$;
