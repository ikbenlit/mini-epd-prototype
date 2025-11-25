-- ============================================================================
-- VERIFY REPORTS SEED DATA
-- ============================================================================
-- Quick verification queries to check if reports were seeded successfully
-- ============================================================================

-- Count total reports
SELECT
  COUNT(*) as total_reports,
  COUNT(DISTINCT patient_id) as unique_patients,
  COUNT(DISTINCT created_by) as unique_practitioners
FROM reports
WHERE deleted_at IS NULL;

-- Reports per type
SELECT
  type,
  COUNT(*) as count
FROM reports
WHERE deleted_at IS NULL
GROUP BY type;

-- Reports per patient
SELECT
  p.name_given[1] || ' ' || p.name_family as patient_name,
  COUNT(r.id) as report_count,
  MIN(r.created_at) as first_report,
  MAX(r.created_at) as last_report
FROM reports r
JOIN patients p ON r.patient_id = p.id
WHERE r.deleted_at IS NULL
GROUP BY p.id, p.name_given, p.name_family
ORDER BY report_count DESC;

-- Recent reports with details
SELECT
  p.name_given[1] || ' ' || p.name_family as patient_name,
  pr.name_given[1] || ' ' || pr.name_family as practitioner_name,
  r.type,
  r.created_at,
  LENGTH(r.content) as content_length,
  r.ai_confidence,
  r.structured_data->>'session_number' as session_number
FROM reports r
JOIN patients p ON r.patient_id = p.id
LEFT JOIN practitioners pr ON r.created_by = pr.id
WHERE r.deleted_at IS NULL
ORDER BY r.created_at DESC
LIMIT 10;

-- Reports with ROM scores
SELECT
  p.name_given[1] || ' ' || p.name_family as patient_name,
  r.created_at,
  r.structured_data->'rom_scores' as rom_scores,
  r.type
FROM reports r
JOIN patients p ON r.patient_id = p.id
WHERE r.deleted_at IS NULL
  AND r.structured_data ? 'rom_scores'
ORDER BY r.created_at;
