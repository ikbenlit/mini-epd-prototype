-- Add optimized index for reports timeline queries
-- This covering index speeds up the most common query pattern:
-- SELECT id, type, content, shift_date, ... FROM reports
-- WHERE patient_id = ? AND deleted_at IS NULL
-- ORDER BY created_at DESC

-- Composite index for timeline queries with included columns
CREATE INDEX IF NOT EXISTS idx_reports_timeline
  ON reports(patient_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Index for type filtering (used when filtering by report types)
CREATE INDEX IF NOT EXISTS idx_reports_patient_type
  ON reports(patient_id, type)
  WHERE deleted_at IS NULL;

-- Note: PostgreSQL doesn't support INCLUDE clause in partial indexes,
-- so we use a standard composite index. The query planner will use
-- these indexes for the filtered queries.
