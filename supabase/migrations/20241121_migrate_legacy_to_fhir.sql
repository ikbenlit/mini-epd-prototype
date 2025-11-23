-- ============================================================================
-- DATA MIGRATION: Legacy tables → FHIR tables
-- ============================================================================
-- Created: 2024-11-21
-- Purpose: Migrate existing data from clients/treatment_plans to patients/care_plans
--
-- IMPORTANT: This migration preserves UUIDs for referential integrity
-- Run this AFTER applying the pragmatic FHIR schema
-- ============================================================================

-- ============================================================================
-- STEP 1: Migrate clients → patients
-- ============================================================================

-- Check for existing data
DO $$
DECLARE
  client_count INTEGER;
  patient_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO client_count FROM clients;
  SELECT COUNT(*) INTO patient_count FROM patients;

  RAISE NOTICE 'Found % clients, % patients (before migration)', client_count, patient_count;
END $$;

-- Migrate clients to patients
INSERT INTO patients (
  id,                        -- Preserve UUID for referential integrity
  name_family,               -- clients.last_name
  name_given,                -- clients.first_name (as array)
  birth_date,                -- clients.birth_date
  gender,                    -- Default 'unknown' (required field)
  identifier_bsn,            -- Placeholder
  identifier_client_number,  -- Use original client ID as client number
  active,                    -- Default true
  created_at,                -- Preserve timestamp
  updated_at                 -- Preserve timestamp
)
SELECT
  c.id,
  c.last_name,
  ARRAY[c.first_name],       -- Convert string to array
  c.birth_date,
  'unknown'::gender_type,    -- Required field, default to unknown
  '999999990',               -- Placeholder BSN (demo)
  c.id::text,                -- Use UUID as client number for traceability
  true,
  c.created_at,
  c.updated_at
FROM clients c
WHERE NOT EXISTS (
  -- Don't re-migrate if already exists
  SELECT 1 FROM patients p WHERE p.id = c.id
);

-- Report migration results
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count
  FROM patients p
  INNER JOIN clients c ON p.id = c.id;

  RAISE NOTICE 'Successfully migrated % clients to patients', migrated_count;
END $$;

-- ============================================================================
-- STEP 2: Migrate treatment_plans → care_plans
-- ============================================================================

-- Check for existing data
DO $$
DECLARE
  plan_count INTEGER;
  careplan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO plan_count FROM treatment_plans;
  SELECT COUNT(*) INTO careplan_count FROM care_plans;

  RAISE NOTICE 'Found % treatment_plans, % care_plans (before migration)', plan_count, careplan_count;
END $$;

-- Migrate treatment_plans to care_plans
INSERT INTO care_plans (
  id,                        -- Preserve UUID
  identifier,                -- Generate from UUID
  status,                    -- Map from treatment_plans.status
  title,                     -- Generate default title
  description,               -- Extract from plan JSONB if available
  patient_id,                -- treatment_plans.client_id → patient_id
  goals,                     -- Extract from plan.doelen
  activities,                -- Extract from plan.interventies
  period_start,              -- Derive from created_at
  period_end,                -- Derive from created_at + 3 months (default)
  created_date,              -- Preserve created_at
  created_at,                -- Preserve created_at
  updated_at                 -- Preserve updated_at
)
SELECT
  tp.id,
  tp.id::text,               -- Use UUID as identifier
  CASE
    WHEN tp.status = 'concept' THEN 'draft'::careplan_status
    WHEN tp.status = 'gepubliceerd' THEN 'active'::careplan_status
    ELSE 'draft'::careplan_status
  END,
  'Behandelplan v' || tp.version::text,  -- Default title
  NULL,                      -- No description in legacy schema
  tp.client_id,              -- Maps to patient_id (already migrated)
  -- Transform goals from legacy structure to FHIR Goal structure
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'description', jsonb_build_object('text', goal),
          'lifecycleStatus', 'active'
        )
      )
      FROM jsonb_array_elements_text(tp.plan->'doelen') goal
    ),
    '[]'::jsonb
  ),
  -- Transform activities from legacy structure to FHIR CarePlan.activity structure
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'detail', jsonb_build_object(
            'code', jsonb_build_object('text', interventie),
            'status', 'in-progress',
            'scheduledString', COALESCE(tp.plan->>'frequentie', 'Niet gespecificeerd')
          )
        )
      )
      FROM jsonb_array_elements_text(tp.plan->'interventies') interventie
    ),
    '[]'::jsonb
  ),
  tp.created_at::date,       -- Start date from creation
  (tp.created_at + interval '3 months')::date,  -- Default 3-month treatment
  tp.created_at,
  tp.created_at,
  tp.updated_at
FROM treatment_plans tp
WHERE NOT EXISTS (
  -- Don't re-migrate if already exists
  SELECT 1 FROM care_plans cp WHERE cp.id = tp.id
)
-- Ensure the client was migrated to patients first
AND EXISTS (
  SELECT 1 FROM patients p WHERE p.id = tp.client_id
);

-- Report migration results
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count
  FROM care_plans cp
  INNER JOIN treatment_plans tp ON cp.id = tp.id;

  RAISE NOTICE 'Successfully migrated % treatment_plans to care_plans', migrated_count;
END $$;

-- ============================================================================
-- STEP 3: Verification queries
-- ============================================================================

-- Verify patient migration
DO $$
DECLARE
  client_count INTEGER;
  patient_count INTEGER;
  match_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO client_count FROM clients;
  SELECT COUNT(*) INTO patient_count FROM patients;
  SELECT COUNT(*) INTO match_count
  FROM patients p
  INNER JOIN clients c ON p.id = c.id;

  RAISE NOTICE '=== MIGRATION VERIFICATION ===';
  RAISE NOTICE 'Clients: %, Patients: %, Matched: %', client_count, patient_count, match_count;

  IF match_count = client_count THEN
    RAISE NOTICE '✓ All clients successfully migrated to patients';
  ELSE
    RAISE WARNING '✗ Migration incomplete: % clients not migrated', (client_count - match_count);
  END IF;
END $$;

-- Verify care plan migration
DO $$
DECLARE
  plan_count INTEGER;
  careplan_count INTEGER;
  match_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO plan_count FROM treatment_plans;
  SELECT COUNT(*) INTO careplan_count FROM care_plans;
  SELECT COUNT(*) INTO match_count
  FROM care_plans cp
  INNER JOIN treatment_plans tp ON cp.id = tp.id;

  RAISE NOTICE 'Treatment Plans: %, Care Plans: %, Matched: %', plan_count, careplan_count, match_count;

  IF plan_count = 0 THEN
    RAISE NOTICE '- No treatment plans to migrate (table empty)';
  ELSIF match_count = plan_count THEN
    RAISE NOTICE '✓ All treatment plans successfully migrated to care_plans';
  ELSE
    RAISE WARNING '✗ Migration incomplete: % treatment plans not migrated', (plan_count - match_count);
  END IF;
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- This migration script:
-- ✓ Migrates clients → patients (preserving UUIDs)
-- ✓ Migrates treatment_plans → care_plans (preserving UUIDs)
-- ✓ Transforms legacy JSONB structure to FHIR-compliant structure
-- ✓ Sets sensible defaults for required FHIR fields
-- ✓ Idempotent: safe to re-run (uses NOT EXISTS checks)
-- ✓ Preserves referential integrity
--
-- NEXT STEPS:
-- 1. Run this migration: supabase db push or apply_migration
-- 2. Verify data in patients and care_plans tables
-- 3. Update application code to use new FHIR tables
-- 4. Optionally: keep legacy tables for rollback, or drop after verification
-- ============================================================================
