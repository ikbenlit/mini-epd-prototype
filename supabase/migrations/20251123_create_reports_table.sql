-- Migration: create reports table for universal reporting

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_by UUID REFERENCES practitioners(id),
  type TEXT NOT NULL CHECK (type IN (
    'behandeladvies',
    'vrije_notitie',
    'intake',
    'voortgang',
    'crisis',
    'contact'
  )),
  content TEXT NOT NULL CHECK (char_length(content) >= 20),
  ai_confidence NUMERIC(3,2) CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  ai_reasoning TEXT,
  structured_data JSONB DEFAULT '{}'::jsonb,
  audio_url TEXT,
  audio_duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  updated_by UUID REFERENCES practitioners(id),
  version TEXT,
  parent_report_id UUID REFERENCES reports(id),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT reports_content_length CHECK (char_length(content) <= 5000)
);

CREATE INDEX IF NOT EXISTS idx_reports_patient_id ON reports(patient_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reports_created_by ON reports(created_by);

CREATE INDEX IF NOT EXISTS idx_reports_patient_created ON reports(patient_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reports_content_fts ON reports USING gin(to_tsvector('dutch', content))
  WHERE deleted_at IS NULL;

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY reports_select_policy ON reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM practitioners p
      WHERE p.id = reports.created_by
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY reports_insert_policy ON reports
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM practitioners p
      WHERE p.id = reports.created_by
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY reports_update_policy ON reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM practitioners p
      WHERE p.id = reports.created_by
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM practitioners p
      WHERE p.id = reports.created_by
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY reports_delete_policy ON reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM practitioners p
      WHERE p.id = reports.created_by
        AND p.user_id = auth.uid()
    )
    AND deleted_at IS NULL
  )
  WITH CHECK (deleted_at IS NOT NULL);

COMMENT ON TABLE reports IS 'Universal reporting system - AI-powered classification';
COMMENT ON COLUMN reports.type IS 'Report type: behandeladvies, vrije_notitie, etc.';
COMMENT ON COLUMN reports.ai_confidence IS 'AI classification confidence (0.0-1.0)';
COMMENT ON COLUMN reports.structured_data IS 'Extracted entities (DSM codes, medication, etc.)';
COMMENT ON COLUMN reports.audio_url IS 'Supabase Storage URL for audio recording';
