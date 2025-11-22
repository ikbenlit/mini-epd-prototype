-- ============================================================================
-- SCREENING & INTAKE SCHEMA - Mini EPD v1.2
-- ============================================================================
-- Created: 2025-11-22
-- Purpose: Complete database schema for screening and intake workflow
-- Based on: FO v1.0 Chapter 10 (Data Requirements)
--
-- Architecture decisions:
-- - Separate tables for reusable content (anamneses, examinations, risk_assessments)
-- - JSONB for context-bound data (kindcheck, treatment_advice)
-- - Reuse existing FHIR tables where possible (observations, conditions, encounters)
-- ============================================================================

-- ============================================================================
-- STEP 1: Add patient status for EpisodeOfCare workflow
-- ============================================================================

-- Create enum for patient/episode status (FHIR EpisodeOfCare.status)
CREATE TYPE episode_status AS ENUM (
  'planned',      -- Aangemeld / In screening
  'active',       -- Intake t/m behandeling (in zorg)
  'finished',     -- Behandeling afgerond
  'cancelled'     -- Niet geschikt / afgemeld
);

-- Add status column to patients table
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS status episode_status DEFAULT 'planned',
ADD COLUMN IF NOT EXISTS is_john_doe BOOLEAN DEFAULT false;

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);

COMMENT ON COLUMN patients.status IS 'Episode of care status: planned (screening) → active (in zorg) → finished/cancelled';
COMMENT ON COLUMN patients.is_john_doe IS 'Crisis admission without complete personal data (BSN optional)';

-- ============================================================================
-- STEP 2: Screening module tables
-- ============================================================================

-- 2.1 Main screening table (FO 10.2)
CREATE TABLE IF NOT EXISTS screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Hulpvraag (FO 4.3 Sectie 3)
  request_for_help TEXT,

  -- Screeningsbesluit (FO 4.3 Sectie 4)
  decision TEXT CHECK (decision IN ('geschikt', 'niet_geschikt')),
  decision_department TEXT, -- Volwassenen, Jeugd, Forensisch, Verslaving, Ouderen, FACT
  decision_notes TEXT,
  decision_date TIMESTAMPTZ,
  decision_by UUID REFERENCES practitioners(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_screenings_patient ON screenings(patient_id);
CREATE INDEX idx_screenings_decision ON screenings(decision);

COMMENT ON TABLE screenings IS 'Screening process per patient: request for help, activities, documents, and decision';

-- Enable RLS
ALTER TABLE screenings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users" ON screenings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON screenings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON screenings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 2.2 Screening activities / timeline (FO 10.3)
CREATE TABLE IF NOT EXISTS screening_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screening_id UUID NOT NULL REFERENCES screenings(id) ON DELETE CASCADE,

  activity_text TEXT NOT NULL,
  created_by UUID REFERENCES practitioners(id),
  created_by_name TEXT, -- Denormalized for display
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_screening_activities_screening ON screening_activities(screening_id);
CREATE INDEX idx_screening_activities_created_at ON screening_activities(created_at DESC);

COMMENT ON TABLE screening_activities IS 'Activity log / timeline during screening process (FO 4.3 Sectie 1)';

-- Enable RLS
ALTER TABLE screening_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users" ON screening_activities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON screening_activities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2.3 Screening documents (FO 10.4)
CREATE TABLE IF NOT EXISTS screening_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screening_id UUID NOT NULL REFERENCES screenings(id) ON DELETE CASCADE,

  file_name TEXT NOT NULL,
  file_type TEXT, -- PDF, DOC, DOCX, JPG, PNG
  file_size INTEGER, -- bytes
  file_path TEXT, -- Storage path or URL

  document_type TEXT CHECK (document_type IN ('verwijsbrief', 'verhuisbericht', 'indicatie', 'overig')),

  uploaded_by UUID REFERENCES practitioners(id),
  uploaded_by_name TEXT, -- Denormalized
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_screening_documents_screening ON screening_documents(screening_id);

COMMENT ON TABLE screening_documents IS 'Uploaded documents during screening (referral letters, etc.)';

-- Enable RLS
ALTER TABLE screening_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users" ON screening_documents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON screening_documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON screening_documents
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- STEP 3: Intake module tables
-- ============================================================================

-- 3.1 Main intake table (FO 10.5)
CREATE TABLE IF NOT EXISTS intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Intake metadata
  title TEXT NOT NULL, -- "Aanvang zorg", "Overplaatsing Forensisch"
  department TEXT NOT NULL, -- Volwassenen, Jeugd, Forensisch, etc.
  psychologist_id UUID REFERENCES practitioners(id),

  -- Status and dates
  status TEXT NOT NULL DEFAULT 'bezig' CHECK (status IN ('bezig', 'afgerond')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,

  -- General notes (FO 4.4.3)
  notes TEXT,

  -- Context-bound data (JSONB for flexibility)
  kindcheck_data JSONB DEFAULT '{}',
  treatment_advice JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intakes_patient ON intakes(patient_id);
CREATE INDEX idx_intakes_status ON intakes(status);
CREATE INDEX idx_intakes_psychologist ON intakes(psychologist_id);

COMMENT ON TABLE intakes IS 'Intake sessions per patient (multiple possible per patient, e.g., department transfer)';
COMMENT ON COLUMN intakes.kindcheck_data IS 'Child safety check data (JSONB): children_present, ages, concerns, actions';
COMMENT ON COLUMN intakes.treatment_advice IS 'Treatment advice (JSONB): advice_text, target_department, care_program';

-- Enable RLS
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users" ON intakes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON intakes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON intakes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 3.2 Extend encounters table for intake contacts (FO 10.6)
-- Reuse existing FHIR encounters table, add intake_id reference
ALTER TABLE encounters
ADD COLUMN IF NOT EXISTS intake_id UUID REFERENCES intakes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_encounters_intake ON encounters(intake_id);

COMMENT ON COLUMN encounters.intake_id IS 'Link encounter to specific intake (null for other encounter types)';

-- 3.3 Anamneses table (FO 10.9) - Separate for reusability
CREATE TABLE IF NOT EXISTS anamneses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES intakes(id) ON DELETE CASCADE,

  anamnese_date DATE NOT NULL DEFAULT CURRENT_DATE,
  anamnese_type TEXT NOT NULL CHECK (anamnese_type IN (
    'psychiatrisch',
    'sociaal',
    'medisch',
    'familie',
    'ontwikkeling',
    'overig'
  )),

  content TEXT NOT NULL, -- Rich text / markdown
  notes TEXT,

  created_by UUID REFERENCES practitioners(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_anamneses_intake ON anamneses(intake_id);
CREATE INDEX idx_anamneses_type ON anamneses(anamnese_type);

COMMENT ON TABLE anamneses IS 'Anamnesis records (psychiatric, social, medical, family, developmental) - reusable in care plans';

-- Enable RLS
ALTER TABLE anamneses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users" ON anamneses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON anamneses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON anamneses
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 3.4 Examinations table (FO 10.10) - Separate for reusability
CREATE TABLE IF NOT EXISTS examinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES intakes(id) ON DELETE CASCADE,

  examination_date DATE NOT NULL DEFAULT CURRENT_DATE,
  examination_type TEXT NOT NULL CHECK (examination_type IN (
    'bloedonderzoek',
    'neuropsychologisch',
    'psychodiagnostiek',
    'iq_test',
    'persoonlijkheid',
    'medisch', -- EEG, ECG, etc.
    'overig'
  )),

  performed_by TEXT,
  reason TEXT,
  findings TEXT NOT NULL,
  document_url TEXT, -- Link to uploaded report
  notes TEXT,

  created_by UUID REFERENCES practitioners(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_examinations_intake ON examinations(intake_id);
CREATE INDEX idx_examinations_type ON examinations(examination_type);

COMMENT ON TABLE examinations IS 'Medical and psychological examinations - reusable in care plans';

-- Enable RLS
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users" ON examinations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON examinations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON examinations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 3.5 Risk assessments table (FO 10.8) - Separate for history tracking
CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES intakes(id) ON DELETE CASCADE,

  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  risk_type TEXT NOT NULL CHECK (risk_type IN (
    'suicidaliteit',
    'agressie',
    'zelfverwaarlozing',
    'middelenmisbruik',
    'verward_gedrag',
    'overig'
  )),

  risk_level TEXT NOT NULL CHECK (risk_level IN ('laag', 'gemiddeld', 'hoog', 'zeer_hoog')),
  rationale TEXT NOT NULL,
  measures TEXT, -- Maatregelen
  evaluation_date DATE,
  notes TEXT,

  created_by UUID REFERENCES practitioners(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_risk_assessments_intake ON risk_assessments(intake_id);
CREATE INDEX idx_risk_assessments_type ON risk_assessments(risk_type);
CREATE INDEX idx_risk_assessments_level ON risk_assessments(risk_level);

COMMENT ON TABLE risk_assessments IS 'Risk assessments (suicide, aggression, etc.) with history tracking';

-- Enable RLS
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users" ON risk_assessments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON risk_assessments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON risk_assessments
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================================
-- STEP 4: Extend care_plans for intake references
-- ============================================================================

-- Add columns to reference intake components in care plans
ALTER TABLE care_plans
ADD COLUMN IF NOT EXISTS based_on_intake_id UUID REFERENCES intakes(id),
ADD COLUMN IF NOT EXISTS based_on_anamneses UUID[],
ADD COLUMN IF NOT EXISTS based_on_examinations UUID[],
ADD COLUMN IF NOT EXISTS based_on_risk_assessments UUID[];

COMMENT ON COLUMN care_plans.based_on_intake_id IS 'Primary intake this care plan is based on';
COMMENT ON COLUMN care_plans.based_on_anamneses IS 'Array of anamnese IDs referenced in this care plan';
COMMENT ON COLUMN care_plans.based_on_examinations IS 'Array of examination IDs referenced in this care plan';
COMMENT ON COLUMN care_plans.based_on_risk_assessments IS 'Array of risk assessment IDs referenced in this care plan';

-- ============================================================================
-- STEP 5: Triggers for updated_at timestamps
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_screenings_updated_at BEFORE UPDATE ON screenings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intakes_updated_at BEFORE UPDATE ON intakes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anamneses_updated_at BEFORE UPDATE ON anamneses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_examinations_updated_at BEFORE UPDATE ON examinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_assessments_updated_at BEFORE UPDATE ON risk_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 6: Helper views for common queries
-- ============================================================================

-- View: Active intakes with patient info
CREATE OR REPLACE VIEW active_intakes_overview AS
SELECT
  i.id,
  i.title,
  i.status,
  i.start_date,
  i.end_date,
  i.department,
  p.name_family,
  p.name_given,
  p.birth_date,
  pr.name_family as psychologist_name,
  COUNT(DISTINCT e.id) as contact_count,
  COUNT(DISTINCT c.id) as diagnosis_count
FROM intakes i
JOIN patients p ON i.patient_id = p.id
LEFT JOIN practitioners pr ON i.psychologist_id = pr.id
LEFT JOIN encounters e ON e.intake_id = i.id
LEFT JOIN conditions c ON c.patient_id = p.id AND c.encounter_id IN (
  SELECT id FROM encounters WHERE intake_id = i.id
)
WHERE i.status = 'bezig'
GROUP BY i.id, p.name_family, p.name_given, p.birth_date, pr.name_family;

COMMENT ON VIEW active_intakes_overview IS 'Overview of active intakes with patient info and counts';

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- This migration creates:
-- ✓ Patient status column (episode_status enum)
-- ✓ Screenings module (3 tables: screenings, activities, documents)
-- ✓ Intakes module (4 new tables + extend encounters)
--   - intakes (with JSONB for kindcheck, treatment_advice)
--   - anamneses (separate for reusability)
--   - examinations (separate for reusability)
--   - risk_assessments (separate for history)
-- ✓ Care plan extensions (reference intake components)
-- ✓ RLS policies for all tables
-- ✓ Indexes for performance
-- ✓ Helper views
--
-- Reuses existing FHIR tables:
-- ✓ observations (for ROM measurements)
-- ✓ conditions (for diagnoses/DSM-5)
-- ✓ encounters (extended with intake_id for contacts)
-- ✓ practitioners (for users/psychologists)
--
-- Total new tables: 7
-- Extended tables: 3 (patients, encounters, care_plans)
-- ============================================================================
