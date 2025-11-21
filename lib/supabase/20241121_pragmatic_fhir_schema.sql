-- ============================================================================
-- PRAGMATIC FHIR GGZ EPD SCHEMA
-- ============================================================================
-- Created: 2024-11-21
-- Version: Pragmatic v2.0
-- Description: Simplified FHIR schema for prototype focused on data interoperability
--
-- Differences from full schema (20241121_fhir_ggz_schema.sql):
-- - Only 7 tables (6 FHIR resources + organizations)
-- - Goals embedded in care_plans.goals JSONB (not separate table)
-- - Activities embedded in care_plans.activities JSONB (not separate table)
-- - No medications, consents, flags, documents tables
-- - BSN placeholders (no encryption for demo)
-- - Keeps existing tables: clients, intake_notes, treatment_plans, ai_events
-- ============================================================================

-- ============================================================================
-- ENABLE EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: pgcrypto not needed for pragmatic version (no BSN encryption)

-- ============================================================================
-- ENUM TYPES (for type safety)
-- ============================================================================

-- FHIR Gender
DO $$ BEGIN
  CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'unknown');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- FHIR Encounter Status
DO $$ BEGIN
  CREATE TYPE encounter_status AS ENUM (
    'planned', 'in-progress', 'on-hold', 'completed',
    'cancelled', 'entered-in-error', 'unknown'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- FHIR Condition Clinical Status
DO $$ BEGIN
  CREATE TYPE condition_clinical_status AS ENUM (
    'active', 'recurrence', 'relapse', 'inactive',
    'remission', 'resolved', 'unknown'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- FHIR Condition Verification Status
DO $$ BEGIN
  CREATE TYPE condition_verification_status AS ENUM (
    'unconfirmed', 'provisional', 'differential',
    'confirmed', 'refuted', 'entered-in-error'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- FHIR Observation Status
DO $$ BEGIN
  CREATE TYPE observation_status AS ENUM (
    'registered', 'preliminary', 'final', 'amended',
    'corrected', 'cancelled', 'entered-in-error', 'unknown'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- FHIR CarePlan Status
DO $$ BEGIN
  CREATE TYPE careplan_status AS ENUM (
    'draft', 'active', 'on-hold', 'revoked',
    'completed', 'entered-in-error', 'unknown'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TABLE: practitioners (FHIR: Practitioner)
-- Behandelaren/professionals
-- ============================================================================
CREATE TABLE IF NOT EXISTS practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- FHIR Practitioner fields
  identifier_big TEXT UNIQUE, -- BIG-nummer (optioneel)
  identifier_agb TEXT, -- AGB-code

  -- Name (HumanName)
  name_prefix TEXT, -- "Drs.", "Dr."
  name_given TEXT[] NOT NULL, -- Voornamen
  name_family TEXT NOT NULL, -- Achternaam
  name_suffix TEXT, -- "PhD", "MSc"

  -- Qualification
  qualification TEXT[], -- ["GZ-psycholoog", "Psychotherapeut"]

  -- Contact
  telecom_phone TEXT,
  telecom_email TEXT,

  -- Active
  active BOOLEAN DEFAULT true,

  -- Link to auth user
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE practitioners IS 'FHIR: Practitioner - Behandelaren en zorgprofessionals';

-- ============================================================================
-- TABLE: organizations (FHIR: Organization)
-- GGZ-instellingen
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- FHIR Organization fields
  identifier_agb TEXT UNIQUE, -- AGB-code instelling
  identifier_kvk TEXT, -- KVK-nummer

  -- Name
  name TEXT NOT NULL,
  alias TEXT[], -- Alternative names

  -- Type
  type_code TEXT DEFAULT 'prov', -- healthcare provider
  type_display TEXT DEFAULT 'Healthcare Provider',

  -- Contact
  telecom_phone TEXT,
  telecom_email TEXT,
  telecom_website TEXT,

  -- Address
  address_line TEXT[],
  address_city TEXT,
  address_postal_code TEXT,
  address_country TEXT DEFAULT 'NL',

  -- Active
  active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE organizations IS 'FHIR: Organization - GGZ-instellingen';

-- ============================================================================
-- TABLE: patients (FHIR: Patient / ZIB: Patient)
-- Cliënten/patiënten
-- ============================================================================
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- FHIR Patient.identifier
  -- PRAGMATIC: No encryption, use placeholder BSN for demo
  identifier_bsn TEXT DEFAULT '999999990', -- Placeholder BSN
  identifier_client_number TEXT, -- Interne cliëntnummer

  -- FHIR Patient.name (HumanName)
  name_family TEXT NOT NULL, -- Achternaam
  name_given TEXT[] NOT NULL, -- Voornamen array
  name_prefix TEXT, -- Voorvoegsel (van, de, etc)
  name_use TEXT DEFAULT 'official', -- official, maiden, nickname

  -- FHIR Patient.birthDate
  birth_date DATE NOT NULL,

  -- FHIR Patient.gender
  gender gender_type NOT NULL,

  -- FHIR Patient.telecom (ContactPoint)
  telecom_phone TEXT,
  telecom_email TEXT,

  -- FHIR Patient.address (Address)
  address_line TEXT[], -- Straat + huisnummer
  address_city TEXT,
  address_postal_code TEXT,
  address_country TEXT DEFAULT 'NL',

  -- Insurance (ZIB: Payer)
  insurance_company TEXT, -- Zorgverzekeraar
  insurance_number TEXT, -- Polisnummer

  -- FHIR Patient.contact (naasten)
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone TEXT,

  -- FHIR Patient.active
  active BOOLEAN DEFAULT true,

  -- FHIR Patient.generalPractitioner (huisarts)
  general_practitioner_name TEXT,
  general_practitioner_agb TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE patients IS 'FHIR: Patient / ZIB: Patient - Cliënten/patiënten (pragmatic version with placeholder BSN)';
COMMENT ON COLUMN patients.identifier_bsn IS 'Placeholder BSN for demo (not encrypted in pragmatic version)';

-- ============================================================================
-- TABLE: encounters (FHIR: Encounter / ZIB: Contact)
-- Contactmomenten (intake, behandelsessie, etc)
-- ============================================================================
CREATE TABLE IF NOT EXISTS encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- FHIR Encounter.identifier
  identifier TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,

  -- FHIR Encounter.status
  status encounter_status NOT NULL DEFAULT 'planned',

  -- FHIR Encounter.class
  class_code TEXT NOT NULL, -- AMB (ambulatory), IMP (inpatient), EMER (emergency), VR (virtual)
  class_display TEXT NOT NULL,

  -- FHIR Encounter.type
  type_code TEXT NOT NULL, -- intake, diagnostiek, behandeling, follow-up, crisis
  type_display TEXT NOT NULL,

  -- FHIR Encounter.priority
  priority_code TEXT, -- routine, urgent, emergency
  priority_display TEXT,

  -- FHIR Encounter.subject (patient)
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,

  -- FHIR Encounter.participant (behandelaar)
  practitioner_id UUID REFERENCES practitioners(id),

  -- FHIR Encounter.serviceProvider (instelling)
  organization_id UUID REFERENCES organizations(id),

  -- FHIR Encounter.period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ,

  -- FHIR Encounter.reasonCode
  reason_code TEXT[], -- DSM-5 codes, SNOMED codes
  reason_display TEXT[], -- Human-readable reason

  -- FHIR Encounter.hospitalization (indien opname)
  admission_source TEXT,
  discharge_disposition TEXT,

  -- Free text notes
  notes TEXT,

  -- Link to intake_notes (existing table)
  intake_note_id UUID REFERENCES intake_notes(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE encounters IS 'FHIR: Encounter / ZIB: Contact - Contactmomenten (intake, behandeling, etc)';
COMMENT ON COLUMN encounters.intake_note_id IS 'Link to existing intake_notes table for backwards compatibility';

-- ============================================================================
-- TABLE: conditions (FHIR: Condition / ZIB: Problem)
-- DSM-5 diagnoses en problemlijst
-- ============================================================================
CREATE TABLE IF NOT EXISTS conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- FHIR Condition.identifier
  identifier TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,

  -- FHIR Condition.clinicalStatus
  clinical_status condition_clinical_status NOT NULL DEFAULT 'active',

  -- FHIR Condition.verificationStatus
  verification_status condition_verification_status NOT NULL DEFAULT 'provisional',

  -- FHIR Condition.category
  category TEXT NOT NULL DEFAULT 'encounter-diagnosis', -- of 'problem-list-item'

  -- FHIR Condition.severity
  severity_code TEXT, -- mild, moderate, severe
  severity_display TEXT,

  -- FHIR Condition.code (DSM-5 / ICD-10)
  code_system TEXT NOT NULL DEFAULT 'http://hl7.org/fhir/sid/icd-10',
  code_code TEXT NOT NULL, -- "F32.2", "F41.1"
  code_display TEXT NOT NULL, -- "Depressieve episode, ernstig"

  -- FHIR Condition.bodySite (indien relevant)
  body_site_code TEXT,
  body_site_display TEXT,

  -- FHIR Condition.subject (patient)
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,

  -- FHIR Condition.encounter (wanneer gesteld)
  encounter_id UUID REFERENCES encounters(id),

  -- FHIR Condition.onsetDateTime / abatementDateTime
  onset_datetime TIMESTAMPTZ,
  onset_age INTEGER, -- Leeftijd bij ontstaan (optioneel)
  abatement_datetime TIMESTAMPTZ,
  abatement_age INTEGER,

  -- FHIR Condition.recordedDate
  recorded_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- FHIR Condition.recorder (wie legde vast)
  recorder_id UUID REFERENCES practitioners(id),

  -- FHIR Condition.asserter (wie stelde diagnose)
  asserter_id UUID REFERENCES practitioners(id),

  -- FHIR Condition.note
  note TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE conditions IS 'FHIR: Condition / ZIB: Problem - DSM-5 diagnoses en problemlijst';

-- ============================================================================
-- TABLE: observations (FHIR: Observation)
-- ROM-scores, risico's, klachten, metingen
-- ============================================================================
CREATE TABLE IF NOT EXISTS observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- FHIR Observation.identifier
  identifier TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,

  -- FHIR Observation.status
  status observation_status NOT NULL DEFAULT 'final',

  -- FHIR Observation.category
  category TEXT NOT NULL, -- vital-signs, social-history, exam, survey, therapy

  -- FHIR Observation.code (wat werd geobserveerd)
  code_system TEXT NOT NULL, -- SNOMED, LOINC, custom
  code_code TEXT NOT NULL,
  code_display TEXT NOT NULL,

  -- FHIR Observation.subject (patient)
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,

  -- FHIR Observation.encounter
  encounter_id UUID REFERENCES encounters(id),

  -- FHIR Observation.effectiveDateTime
  effective_datetime TIMESTAMPTZ NOT NULL,

  -- FHIR Observation.issued
  issued TIMESTAMPTZ DEFAULT NOW(),

  -- FHIR Observation.performer (wie deed observatie)
  performer_id UUID REFERENCES practitioners(id),

  -- FHIR Observation.value[x] (polymorf!)
  value_type TEXT NOT NULL, -- quantity, string, boolean, codeableConcept
  value_quantity_value NUMERIC,
  value_quantity_unit TEXT,
  value_quantity_comparator TEXT, -- <, <=, >=, >
  value_string TEXT,
  value_boolean BOOLEAN,
  value_codeable_concept JSONB, -- {system, code, display}

  -- FHIR Observation.interpretation
  interpretation_code TEXT, -- H (high), L (low), N (normal)
  interpretation_display TEXT,

  -- FHIR Observation.note
  note TEXT,

  -- FHIR Observation.bodySite
  body_site TEXT,

  -- FHIR Observation.method
  method_code TEXT,
  method_display TEXT,

  -- Reference range (normaalwaarden)
  reference_range_low NUMERIC,
  reference_range_high NUMERIC,
  reference_range_text TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE observations IS 'FHIR: Observation - ROM-scores, risico-inschattingen, metingen';

-- ============================================================================
-- TABLE: care_plans (FHIR: CarePlan)
-- Behandelplannen met embedded goals en activities
-- ============================================================================
CREATE TABLE IF NOT EXISTS care_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- FHIR CarePlan.identifier
  identifier TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,

  -- FHIR CarePlan.status
  status careplan_status NOT NULL DEFAULT 'draft',

  -- FHIR CarePlan.intent
  intent TEXT NOT NULL DEFAULT 'plan', -- proposal, plan, order, option

  -- FHIR CarePlan.category
  category_code TEXT DEFAULT 'ggz-behandelplan',
  category_display TEXT DEFAULT 'GGZ Behandelplan',

  -- FHIR CarePlan.title
  title TEXT NOT NULL,

  -- FHIR CarePlan.description
  description TEXT,

  -- FHIR CarePlan.subject (patient)
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,

  -- FHIR CarePlan.encounter (intake waar uit voortkomt)
  encounter_id UUID REFERENCES encounters(id),

  -- FHIR CarePlan.period
  period_start DATE,
  period_end DATE,

  -- FHIR CarePlan.created
  created_date TIMESTAMPTZ DEFAULT NOW(),

  -- FHIR CarePlan.author (regiebehandelaar)
  author_id UUID REFERENCES practitioners(id),

  -- FHIR CarePlan.contributor
  contributor_ids UUID[], -- Array van practitioner IDs

  -- FHIR CarePlan.careTeam
  care_team_ids UUID[], -- Array van practitioner IDs

  -- FHIR CarePlan.addresses (welke diagnoses)
  addresses_condition_ids UUID[], -- Array van condition IDs

  -- ========================================================================
  -- PRAGMATIC APPROACH: EMBEDDED GOALS AND ACTIVITIES
  -- ========================================================================
  -- FHIR CarePlan.goal (behandeldoelen als JSONB array)
  goals JSONB DEFAULT '[]'::jsonb,
  -- Structure: [
  --   {
  --     "description": {"text": "PHQ-9 score < 10"},
  --     "target": [{
  --       "measure": {"coding": [{"system": "...", "code": "44249-1"}]},
  --       "detailQuantity": {"value": 10, "comparator": "<"},
  --       "dueDate": "2024-06-30"
  --     }]
  --   }
  -- ]

  -- FHIR CarePlan.activity (behandelactiviteiten als JSONB array)
  activities JSONB DEFAULT '[]'::jsonb,
  -- Structure: [
  --   {
  --     "detail": {
  --       "code": {"text": "Cognitieve gedragstherapie"},
  --       "status": "in-progress",
  --       "scheduledTiming": {"repeat": {"frequency": 1, "period": 1, "periodUnit": "wk"}},
  --       "performer": ["practitioner-id"],
  --       "description": "Individuele CGT sessies, 12 weken",
  --       "location": "Polikliniek"
  --     }
  --   }
  -- ]
  -- ========================================================================

  -- FHIR CarePlan.note
  note TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE care_plans IS 'FHIR: CarePlan - Behandelplannen met embedded goals en activities (pragmatic approach)';
COMMENT ON COLUMN care_plans.goals IS 'FHIR Goal structures embedded as JSONB array (pragmatic: no separate table)';
COMMENT ON COLUMN care_plans.activities IS 'FHIR CarePlan.activity structures embedded as JSONB array (pragmatic: no separate table)';

-- ============================================================================
-- INDEXES (voor performance)
-- ============================================================================

-- Practitioners
CREATE INDEX IF NOT EXISTS idx_practitioners_user_id ON practitioners(user_id);
CREATE INDEX IF NOT EXISTS idx_practitioners_active ON practitioners(active);

-- Patients
CREATE INDEX IF NOT EXISTS idx_patients_bsn ON patients(identifier_bsn);
CREATE INDEX IF NOT EXISTS idx_patients_active ON patients(active);
CREATE INDEX IF NOT EXISTS idx_patients_client_number ON patients(identifier_client_number);

-- Encounters
CREATE INDEX IF NOT EXISTS idx_encounters_patient_id ON encounters(patient_id);
CREATE INDEX IF NOT EXISTS idx_encounters_practitioner_id ON encounters(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_encounters_status ON encounters(status);
CREATE INDEX IF NOT EXISTS idx_encounters_period_start ON encounters(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_encounters_intake_note_id ON encounters(intake_note_id);

-- Conditions
CREATE INDEX IF NOT EXISTS idx_conditions_patient_id ON conditions(patient_id);
CREATE INDEX IF NOT EXISTS idx_conditions_encounter_id ON conditions(encounter_id);
CREATE INDEX IF NOT EXISTS idx_conditions_clinical_status ON conditions(clinical_status);
CREATE INDEX IF NOT EXISTS idx_conditions_code ON conditions(code_code);

-- Observations
CREATE INDEX IF NOT EXISTS idx_observations_patient_id ON observations(patient_id);
CREATE INDEX IF NOT EXISTS idx_observations_encounter_id ON observations(encounter_id);
CREATE INDEX IF NOT EXISTS idx_observations_category ON observations(category);
CREATE INDEX IF NOT EXISTS idx_observations_effective_datetime ON observations(effective_datetime DESC);
CREATE INDEX IF NOT EXISTS idx_observations_code ON observations(code_code);

-- Care Plans
CREATE INDEX IF NOT EXISTS idx_care_plans_patient_id ON care_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_plans_status ON care_plans(status);
CREATE INDEX IF NOT EXISTS idx_care_plans_author_id ON care_plans(author_id);
CREATE INDEX IF NOT EXISTS idx_care_plans_encounter_id ON care_plans(encounter_id);

-- GIN indexes for JSONB columns (for efficient querying)
CREATE INDEX IF NOT EXISTS idx_care_plans_goals_gin ON care_plans USING GIN (goals);
CREATE INDEX IF NOT EXISTS idx_care_plans_activities_gin ON care_plans USING GIN (activities);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - basis setup
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;

-- Voor MVP: authenticated users kunnen alles zien (later verfijnen)

-- Practitioners: can read/update their own record
DROP POLICY IF EXISTS "Practitioners can view own record" ON practitioners;
CREATE POLICY "Practitioners can view own record" ON practitioners
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Practitioners can update own record" ON practitioners;
CREATE POLICY "Practitioners can update own record" ON practitioners
  FOR UPDATE USING (user_id = auth.uid());

-- Patients: authenticated users can view/create/update
DROP POLICY IF EXISTS "Authenticated users can view patients" ON patients;
CREATE POLICY "Authenticated users can view patients" ON patients
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert patients" ON patients;
CREATE POLICY "Authenticated users can insert patients" ON patients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update patients" ON patients;
CREATE POLICY "Authenticated users can update patients" ON patients
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Encounters: authenticated users can view/create/update
DROP POLICY IF EXISTS "Authenticated users can view encounters" ON encounters;
CREATE POLICY "Authenticated users can view encounters" ON encounters
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert encounters" ON encounters;
CREATE POLICY "Authenticated users can insert encounters" ON encounters
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update encounters" ON encounters;
CREATE POLICY "Authenticated users can update encounters" ON encounters
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Conditions: authenticated users can view/create/update
DROP POLICY IF EXISTS "Authenticated users can view conditions" ON conditions;
CREATE POLICY "Authenticated users can view conditions" ON conditions
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert conditions" ON conditions;
CREATE POLICY "Authenticated users can insert conditions" ON conditions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update conditions" ON conditions;
CREATE POLICY "Authenticated users can update conditions" ON conditions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Observations: authenticated users can view/create
DROP POLICY IF EXISTS "Authenticated users can view observations" ON observations;
CREATE POLICY "Authenticated users can view observations" ON observations
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert observations" ON observations;
CREATE POLICY "Authenticated users can insert observations" ON observations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Care Plans: authenticated users can view/create/update
DROP POLICY IF EXISTS "Authenticated users can view care plans" ON care_plans;
CREATE POLICY "Authenticated users can view care plans" ON care_plans
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert care plans" ON care_plans;
CREATE POLICY "Authenticated users can insert care plans" ON care_plans
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update care plans" ON care_plans;
CREATE POLICY "Authenticated users can update care plans" ON care_plans
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================================
-- FUNCTIONS - updated_at trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DROP TRIGGER IF EXISTS set_updated_at ON practitioners;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON practitioners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON organizations;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON patients;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON encounters;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON encounters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON conditions;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON conditions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON care_plans;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON care_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (demo/development)
-- ============================================================================

-- Default organization
INSERT INTO organizations (id, name, identifier_agb, active)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Demo GGZ Instelling',
  'AGB-DEMO-001',
  true
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✅ Created 7 tables: practitioners, organizations, patients, encounters, conditions, observations, care_plans
-- ✅ Goals and activities embedded in care_plans JSONB (pragmatic approach)
-- ✅ No medications, consents, flags, documents tables (out of scope)
-- ✅ Simplified BSN (placeholder for demo)
-- ✅ RLS enabled on all tables
-- ✅ Indexes for performance
-- ✅ Triggers for updated_at
-- ✅ 1 default organization seeded
--
-- NEXT STEPS:
-- 1. Run this migration in Supabase
-- 2. Generate TypeScript types: supabase gen types
-- 3. Create data migration script: clients → patients, treatment_plans → care_plans
-- 4. Seed demo data: practitioners, patients, encounters
-- ============================================================================
