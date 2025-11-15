-- ================================================
-- EPD Core Tables Migration
-- Created: 2024-11-15
-- Epic: E2 - Database & Auth
-- Story: E2.S1 - Database schema creëren
-- ================================================
-- This migration creates the 5 core EPD tables:
-- 1. clients - basic client information
-- 2. intake_notes - TipTap JSON content + derived fields
-- 3. problem_profiles - DSM-light categories + severity
-- 4. treatment_plans - Treatment plan JSONB with versioning
-- 5. ai_events - AI API telemetry and debugging
-- ================================================

-- ================================================
-- TABLE 1: clients
-- ================================================
-- Stores basic client information
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT clients_name_not_empty CHECK (
    LENGTH(TRIM(first_name)) > 0 AND LENGTH(TRIM(last_name)) > 0
  )
);

-- Index for searching clients by name
CREATE INDEX idx_clients_name ON clients(last_name, first_name);

-- ================================================
-- TABLE 2: intake_notes
-- ================================================
-- Stores intake notes with TipTap/ProseMirror JSON content
CREATE TABLE intake_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT,
  tag TEXT CHECK (tag IN ('Intake', 'Evaluatie', 'Plan')),
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_text TEXT, -- Derived text for full-text search
  author UUID, -- FK to auth.users.id (optional for MVP)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT intake_notes_content_not_empty CHECK (
    content_json IS NOT NULL
  )
);

-- Indexes for performance
CREATE INDEX idx_intake_notes_client ON intake_notes(client_id);
CREATE INDEX idx_intake_notes_created ON intake_notes(created_at DESC);

-- Full-text search index on content_text (for future search functionality)
CREATE INDEX idx_intake_notes_fts ON intake_notes USING gin(to_tsvector('dutch', content_text));

-- ================================================
-- TABLE 3: problem_profiles
-- ================================================
-- Stores DSM-light problem categorization
CREATE TABLE problem_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'stemming_depressie',
    'angst',
    'gedrag_impuls',
    'middelen_gebruik',
    'cognitief',
    'context_psychosociaal'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('laag', 'middel', 'hoog')),
  remarks TEXT,
  source_note_id UUID REFERENCES intake_notes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_problem_profiles_client ON problem_profiles(client_id);
CREATE INDEX idx_problem_profiles_category ON problem_profiles(category);

-- ================================================
-- TABLE 4: treatment_plans
-- ================================================
-- Stores treatment plans with versioning
CREATE TABLE treatment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'concept' CHECK (status IN ('concept', 'gepubliceerd')),
  plan JSONB NOT NULL DEFAULT '{
    "doelen": [],
    "interventies": [],
    "frequentie": "",
    "meetmomenten": []
  }'::jsonb,
  created_by UUID, -- FK to auth.users.id (optional for MVP)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT treatment_plans_version_positive CHECK (version > 0),
  CONSTRAINT treatment_plans_plan_structure CHECK (
    plan ? 'doelen' AND
    plan ? 'interventies' AND
    plan ? 'frequentie' AND
    plan ? 'meetmomenten'
  ),
  -- Ensure published plans have published_at timestamp
  CONSTRAINT treatment_plans_published_timestamp CHECK (
    (status = 'gepubliceerd' AND published_at IS NOT NULL) OR
    (status = 'concept')
  ),
  -- Unique version per client
  UNIQUE(client_id, version)
);

-- Indexes
CREATE INDEX idx_treatment_plans_client ON treatment_plans(client_id);
CREATE INDEX idx_treatment_plans_status ON treatment_plans(status);
CREATE INDEX idx_treatment_plans_version ON treatment_plans(client_id, version DESC);

-- ================================================
-- TABLE 5: ai_events
-- ================================================
-- Telemetry and debugging for AI API calls
CREATE TABLE ai_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('summarize', 'readability', 'extract', 'plan')),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  note_id UUID REFERENCES intake_notes(id) ON DELETE SET NULL,
  request JSONB NOT NULL DEFAULT '{}'::jsonb,
  response JSONB NOT NULL DEFAULT '{}'::jsonb,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT ai_events_duration_non_negative CHECK (duration_ms >= 0)
);

-- Indexes for analytics and debugging
CREATE INDEX idx_ai_events_kind ON ai_events(kind);
CREATE INDEX idx_ai_events_client ON ai_events(client_id);
CREATE INDEX idx_ai_events_created ON ai_events(created_at DESC);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================
-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_events ENABLE ROW LEVEL SECURITY;

-- Demo RLS policies: All authenticated users can access all data
-- (For MVP/demo purposes only - in production, use org_id or user_id filtering)

CREATE POLICY "Allow all for authenticated users" ON clients
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all for authenticated users" ON intake_notes
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all for authenticated users" ON problem_profiles
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all for authenticated users" ON treatment_plans
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all for authenticated users" ON ai_events
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ================================================
-- TRIGGER FUNCTIONS FOR updated_at
-- ================================================
-- Automatically update updated_at timestamp on row updates

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intake_notes_updated_at
  BEFORE UPDATE ON intake_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problem_profiles_updated_at
  BEFORE UPDATE ON problem_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatment_plans_updated_at
  BEFORE UPDATE ON treatment_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- COMMENTS (PostgreSQL Documentation)
-- ================================================
COMMENT ON TABLE clients IS 'Basic client information for EPD system';
COMMENT ON TABLE intake_notes IS 'Intake notes stored as TipTap/ProseMirror JSON with derived text field for search';
COMMENT ON TABLE problem_profiles IS 'DSM-light problem categorization with severity scoring';
COMMENT ON TABLE treatment_plans IS 'Treatment plans with JSONB structure and versioning support';
COMMENT ON TABLE ai_events IS 'Telemetry and debugging log for AI API calls';

COMMENT ON COLUMN intake_notes.content_json IS 'ProseMirror/TipTap document structure (JSONB)';
COMMENT ON COLUMN intake_notes.content_text IS 'Plain text extraction for full-text search indexing';
COMMENT ON COLUMN treatment_plans.version IS 'Incremental version number, unique per client';
COMMENT ON COLUMN treatment_plans.status IS 'Draft status: concept (editable) or gepubliceerd (locked)';
COMMENT ON COLUMN ai_events.duration_ms IS 'API call duration in milliseconds for performance monitoring';
