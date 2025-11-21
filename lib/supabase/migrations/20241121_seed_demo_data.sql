-- ============================================================================
-- SEED DEMO DATA: Practitioners, Patients, Encounters
-- ============================================================================
-- Created: 2024-11-21
-- Purpose: Populate FHIR tables with realistic demo data for testing
-- ============================================================================

-- ============================================================================
-- STEP 1: Seed Practitioners (Behandelaren)
-- ============================================================================

-- Get the demo organization ID
DO $$
DECLARE
  demo_org_id UUID;
BEGIN
  SELECT id INTO demo_org_id FROM organizations WHERE identifier_agb = 'AGB-DEMO-001';
  RAISE NOTICE 'Demo organization ID: %', demo_org_id;
END $$;

-- Practitioner 1: Dr. Sarah de Vries (GZ-psycholoog)
INSERT INTO practitioners (
  id,
  identifier_big,
  identifier_agb,
  name_prefix,
  name_given,
  name_family,
  qualification,
  telecom_phone,
  telecom_email,
  active
)
VALUES (
  '10000000-0000-0000-0000-000000000001'::uuid,
  '79012345601',
  '03012345',
  'Dr.',
  ARRAY['Sarah'],
  'de Vries',
  ARRAY['GZ-psycholoog', 'Cognitieve gedragstherapie', 'EMDR'],
  '06-12345678',
  's.devries@demo-ggz.nl',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Practitioner 2: Drs. Mark Jansen (Psychotherapeut)
INSERT INTO practitioners (
  id,
  identifier_big,
  identifier_agb,
  name_prefix,
  name_given,
  name_family,
  qualification,
  telecom_phone,
  telecom_email,
  active
)
VALUES (
  '10000000-0000-0000-0000-000000000002'::uuid,
  '79023456702',
  '03023456',
  'Drs.',
  ARRAY['Mark'],
  'Jansen',
  ARRAY['Psychotherapeut', 'Schematherapie', 'Acceptance and Commitment Therapy'],
  '06-23456789',
  'm.jansen@demo-ggz.nl',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Practitioner 3: Lisa van den Berg (Klinisch psycholoog)
INSERT INTO practitioners (
  id,
  identifier_big,
  identifier_agb,
  name_prefix,
  name_given,
  name_family,
  qualification,
  telecom_phone,
  telecom_email,
  active
)
VALUES (
  '10000000-0000-0000-0000-000000000003'::uuid,
  '79034567803',
  '03034567',
  NULL,
  ARRAY['Lisa'],
  'van den Berg',
  ARRAY['Klinisch psycholoog', 'Diagnostiek', 'ROM-coördinator'],
  '06-34567890',
  'l.vandenberg@demo-ggz.nl',
  true
)
ON CONFLICT (id) DO NOTHING;

RAISE NOTICE '✓ Seeded 3 practitioners';

-- ============================================================================
-- STEP 2: Update existing patients with complete data
-- ============================================================================

-- Get patient IDs from migrated clients
DO $$
DECLARE
  patient_colin_id UUID;
  patient_jan_id UUID;
  patient_optimus_id UUID;
BEGIN
  -- Get Colin's patient ID
  SELECT id INTO patient_colin_id FROM patients WHERE name_family = 'Lit' AND 'Colin' = ANY(name_given);

  -- Get Jan's patient ID
  SELECT id INTO patient_jan_id FROM patients WHERE name_family = 'de Vriesh' AND 'Jan' = ANY(name_given);

  -- Get Optimus's patient ID
  SELECT id INTO patient_optimus_id FROM patients WHERE name_family = 'Prime' AND 'Optimus' = ANY(name_given);

  -- Update Colin with complete data
  UPDATE patients
  SET
    gender = 'male',
    telecom_phone = '06-11111111',
    telecom_email = 'colin.lit@example.com',
    address_line = ARRAY['Kerkstraat 12'],
    address_city = 'Amsterdam',
    address_postal_code = '1012 AB',
    insurance_company = 'VGZ',
    insurance_number = 'VGZ-123456',
    general_practitioner_name = 'Dr. A. Huisarts',
    general_practitioner_agb = '12345678'
  WHERE id = patient_colin_id;

  -- Update Jan with complete data
  UPDATE patients
  SET
    gender = 'male',
    telecom_phone = '06-22222222',
    telecom_email = 'jan.devriesh@example.com',
    address_line = ARRAY['Hoofdstraat 45'],
    address_city = 'Utrecht',
    address_postal_code = '3511 AB',
    insurance_company = 'CZ',
    insurance_number = 'CZ-789012',
    general_practitioner_name = 'Dr. B. Dokter',
    general_practitioner_agb = '23456789'
  WHERE id = patient_jan_id;

  -- Update Optimus with complete data (easter egg patient)
  UPDATE patients
  SET
    gender = 'other',
    telecom_phone = '06-99999999',
    address_line = ARRAY['Cybertron Base 1'],
    address_city = 'Eindhoven',
    address_postal_code = '5600 AA',
    insurance_company = 'Menzis',
    insurance_number = 'MEN-PRIME-01'
  WHERE id = patient_optimus_id;

  RAISE NOTICE '✓ Updated 3 existing patients with complete data';
END $$;

-- ============================================================================
-- STEP 3: Seed Encounters (Contactmomenten)
-- ============================================================================

-- Get organization ID
DO $$
DECLARE
  demo_org_id UUID;
  patient_colin_id UUID;
  patient_jan_id UUID;
  patient_optimus_id UUID;
  practitioner_sarah_id UUID := '10000000-0000-0000-0000-000000000001'::uuid;
  practitioner_mark_id UUID := '10000000-0000-0000-0000-000000000002'::uuid;
  practitioner_lisa_id UUID := '10000000-0000-0000-0000-000000000003'::uuid;
BEGIN
  -- Get IDs
  SELECT id INTO demo_org_id FROM organizations WHERE identifier_agb = 'AGB-DEMO-001';
  SELECT id INTO patient_colin_id FROM patients WHERE name_family = 'Lit' AND 'Colin' = ANY(name_given);
  SELECT id INTO patient_jan_id FROM patients WHERE name_family = 'de Vriesh' AND 'Jan' = ANY(name_given);
  SELECT id INTO patient_optimus_id FROM patients WHERE name_family = 'Prime' AND 'Optimus' = ANY(name_given);

  -- Encounter 1: Colin's intake with Dr. Sarah de Vries (completed)
  INSERT INTO encounters (
    id,
    status,
    class_code,
    class_display,
    type_code,
    type_display,
    priority_code,
    priority_display,
    patient_id,
    practitioner_id,
    organization_id,
    period_start,
    period_end,
    reason_code,
    reason_display,
    notes
  )
  VALUES (
    '20000000-0000-0000-0000-000000000001'::uuid,
    'completed',
    'AMB',
    'Ambulatory',
    'intake',
    'Intake gesprek',
    'routine',
    'Routine',
    patient_colin_id,
    practitioner_sarah_id,
    demo_org_id,
    '2024-10-15 10:00:00+00',
    '2024-10-15 11:00:00+00',
    ARRAY['F32.1', 'F51.0'],
    ARRAY['Matige depressieve episode', 'Insomnia'],
    'Eerste intake gesprek. Cliënt presenteert zich met depressieve klachten en slaapproblemen sinds 3 maanden. PHQ-9 score: 14.'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Encounter 2: Jan's intake with Drs. Mark Jansen (completed)
  INSERT INTO encounters (
    id,
    status,
    class_code,
    class_display,
    type_code,
    type_display,
    priority_code,
    priority_display,
    patient_id,
    practitioner_id,
    organization_id,
    period_start,
    period_end,
    reason_code,
    reason_display,
    notes
  )
  VALUES (
    '20000000-0000-0000-0000-000000000002'::uuid,
    'completed',
    'AMB',
    'Ambulatory',
    'intake',
    'Intake gesprek',
    'routine',
    'Routine',
    patient_jan_id,
    practitioner_mark_id,
    demo_org_id,
    '2024-11-01 14:00:00+00',
    '2024-11-01 15:30:00+00',
    ARRAY['F41.1', 'Z63.0'],
    ARRAY['Gegeneraliseerde angststoornis', 'Relatieproblemen'],
    'Intake gesprek. Cliënt geeft aan last te hebben van voortdurende piekeren en angstklachten. GAD-7 score: 16. Ook relationele problematiek.'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Encounter 3: Colin's 2nd session (planned)
  INSERT INTO encounters (
    id,
    status,
    class_code,
    class_display,
    type_code,
    type_display,
    priority_code,
    priority_display,
    patient_id,
    practitioner_id,
    organization_id,
    period_start,
    reason_code,
    reason_display,
    notes
  )
  VALUES (
    '20000000-0000-0000-0000-000000000003'::uuid,
    'planned',
    'AMB',
    'Ambulatory',
    'behandeling',
    'Behandelsessie',
    'routine',
    'Routine',
    patient_colin_id,
    practitioner_sarah_id,
    demo_org_id,
    '2024-11-25 10:00:00+00',
    ARRAY['F32.1'],
    ARRAY['Matige depressieve episode'],
    'Tweede sessie CGT gepland. Focus op gedragsactivatie en cognitieve herstructurering.'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Encounter 4: Optimus diagnostiek with Lisa (completed - easter egg)
  INSERT INTO encounters (
    id,
    status,
    class_code,
    class_display,
    type_code,
    type_display,
    patient_id,
    practitioner_id,
    organization_id,
    period_start,
    period_end,
    reason_code,
    reason_display,
    notes
  )
  VALUES (
    '20000000-0000-0000-0000-000000000004'::uuid,
    'completed',
    'AMB',
    'Ambulatory',
    'diagnostiek',
    'Diagnostisch onderzoek',
    patient_optimus_id,
    practitioner_lisa_id,
    demo_org_id,
    '2024-11-10 09:00:00+00',
    '2024-11-10 11:00:00+00',
    ARRAY['Z03.2'],
    ARRAY['Observatie voor vermoede psychische aandoening'],
    'Diagnostisch onderzoek. Cliënt vertoont opvallende communicatiepatronen en metallic spraakpatroon. Nader onderzoek geïndiceerd.'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Encounter 5: Jan's follow-up (in-progress)
  INSERT INTO encounters (
    id,
    status,
    class_code,
    class_display,
    type_code,
    type_display,
    patient_id,
    practitioner_id,
    organization_id,
    period_start,
    reason_code,
    reason_display,
    notes
  )
  VALUES (
    '20000000-0000-0000-0000-000000000005'::uuid,
    'in-progress',
    'AMB',
    'Ambulatory',
    'behandeling',
    'Behandelsessie',
    patient_jan_id,
    practitioner_mark_id,
    demo_org_id,
    NOW(),
    ARRAY['F41.1'],
    ARRAY['Gegeneraliseerde angststoornis'],
    'Sessie 3: ACT technieken. Werk aan psychologische flexibiliteit en acceptatie.'
  )
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✓ Seeded 5 encounters';
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  practitioner_count INTEGER;
  patient_count INTEGER;
  encounter_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO practitioner_count FROM practitioners;
  SELECT COUNT(*) INTO patient_count FROM patients;
  SELECT COUNT(*) INTO encounter_count FROM encounters;

  RAISE NOTICE '=== SEED DATA SUMMARY ===';
  RAISE NOTICE 'Practitioners: %', practitioner_count;
  RAISE NOTICE 'Patients: %', patient_count;
  RAISE NOTICE 'Encounters: %', encounter_count;

  IF practitioner_count >= 3 AND patient_count >= 3 AND encounter_count >= 5 THEN
    RAISE NOTICE '✓ All demo data seeded successfully!';
  ELSE
    RAISE WARNING '⚠ Some demo data may be missing';
  END IF;
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✓ 3 Practitioners created (Sarah, Mark, Lisa)
-- ✓ 3 Patients updated with complete data (Colin, Jan, Optimus)
-- ✓ 5 Encounters created:
--   - 2 completed intakes
--   - 1 planned session
--   - 1 completed diagnostiek
--   - 1 in-progress behandeling
--
-- NEXT STEPS:
-- 1. Test frontend with demo data
-- 2. Create conditions (diagnoses) for patients
-- 3. Create care_plans (behandelplannen)
-- 4. Add observations (ROM scores)
-- ============================================================================
