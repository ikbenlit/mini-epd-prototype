-- ============================================================================
-- Migration: Add performance indices for agenda module
-- Epic: E0 - Database & Types
-- Story: E0.S2 - Index toevoegen voor performance
-- ============================================================================

-- Index for reports.encounter_id (find reports linked to an encounter)
CREATE INDEX IF NOT EXISTS idx_reports_encounter ON reports(encounter_id)
  WHERE encounter_id IS NOT NULL AND deleted_at IS NULL;

-- Index for reports.intake_id (find reports linked to an intake)
CREATE INDEX IF NOT EXISTS idx_reports_intake ON reports(intake_id)
  WHERE intake_id IS NOT NULL AND deleted_at IS NULL;

-- Index for encounters.period (date range queries for calendar views)
CREATE INDEX IF NOT EXISTS idx_encounters_period ON encounters(period_start, period_end);

-- Index for encounters.practitioner (filter by behandelaar)
CREATE INDEX IF NOT EXISTS idx_encounters_practitioner ON encounters(practitioner_id)
  WHERE practitioner_id IS NOT NULL;

-- ============================================================================
-- Verification
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✓ Migration E0.S2 completed - indices created';
END $$;
