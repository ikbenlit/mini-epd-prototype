-- ================================================
-- Speech Usage Telemetry Table
-- Created: 2025-11-26
-- Epic: Performance ROI - Speech telemetry
-- ================================================

CREATE TABLE IF NOT EXISTS speech_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id TEXT,
  intake_id TEXT,
  report_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('start', 'stop', 'final')),
  context TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_speech_usage_events_created ON speech_usage_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_speech_usage_events_context ON speech_usage_events(context);

ALTER TABLE speech_usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for authenticated users" ON speech_usage_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow select own telemetry" ON speech_usage_events
  FOR SELECT
  USING (auth.uid() = user_id);
