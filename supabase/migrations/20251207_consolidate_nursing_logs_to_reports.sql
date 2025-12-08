-- Migration: Consolidate nursing_logs into reports table
-- Adds 'verpleegkundig' type and migrates all nursing_logs data

-- Step 1: Drop and recreate type constraint to include 'verpleegkundig'
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_type_check;
ALTER TABLE reports ADD CONSTRAINT reports_type_check CHECK (type IN (
  'behandeladvies',
  'vrije_notitie',
  'intake',
  'voortgang',
  'crisis',
  'contact',
  'observatie',
  'incident',
  'medicatie',
  'verpleegkundig'  -- NEW: for short nursing notes (was nursing_logs)
));

-- Step 2: Add new columns for verpleegkundig reports
ALTER TABLE reports ADD COLUMN IF NOT EXISTS include_in_handover BOOLEAN DEFAULT false;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS shift_date DATE;

-- Step 3: Drop the minimum content length constraint (verpleegkundig can be shorter)
-- We'll handle validation in the application layer based on type
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_content_length;
ALTER TABLE reports ADD CONSTRAINT reports_content_length CHECK (
  CASE
    WHEN type = 'verpleegkundig' THEN char_length(content) <= 500
    ELSE char_length(content) >= 20 AND char_length(content) <= 5000
  END
);

-- Step 4: Create index for handover queries
CREATE INDEX IF NOT EXISTS idx_reports_handover
  ON reports(patient_id, shift_date)
  WHERE include_in_handover = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reports_shift_date
  ON reports(shift_date)
  WHERE deleted_at IS NULL;

-- Step 5: Migrate nursing_logs data to reports
-- Note: nursing_logs.created_by is auth.users.id, but we need to look up the practitioner
INSERT INTO reports (
  id,
  patient_id,
  created_by,
  type,
  content,
  structured_data,
  include_in_handover,
  shift_date,
  created_at,
  updated_at
)
SELECT
  nl.id,
  nl.patient_id,
  p.id as created_by,  -- Look up practitioner from auth user
  'verpleegkundig' as type,
  nl.content,
  jsonb_build_object(
    'category', nl.category,
    'original_timestamp', nl.timestamp
  ) as structured_data,
  nl.include_in_handover,
  nl.shift_date::date,
  nl.created_at,
  nl.updated_at
FROM nursing_logs nl
LEFT JOIN practitioners p ON p.user_id = nl.created_by::uuid;

-- Step 6: Drop nursing_logs table
DROP TABLE IF EXISTS nursing_logs;

-- Step 7: Add comments
COMMENT ON COLUMN reports.include_in_handover IS 'Whether this report should be included in shift handover summaries';
COMMENT ON COLUMN reports.shift_date IS 'The shift date this report belongs to (for night shifts before 7am, this is the previous day)';
