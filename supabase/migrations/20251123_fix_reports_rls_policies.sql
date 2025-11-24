-- Migration: Fix RLS policies for reports table (prototype - open access)
-- All authenticated users can read/write all reports

-- Drop existing restrictive policies
DROP POLICY IF EXISTS reports_select_policy ON reports;
DROP POLICY IF EXISTS reports_insert_policy ON reports;
DROP POLICY IF EXISTS reports_update_policy ON reports;
DROP POLICY IF EXISTS reports_delete_policy ON reports;

-- Create simple policies: all authenticated users can do everything
CREATE POLICY reports_select_policy ON reports
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY reports_insert_policy ON reports
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY reports_update_policy ON reports
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY reports_delete_policy ON reports
  FOR UPDATE
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL)
  WITH CHECK (auth.role() = 'authenticated' AND deleted_at IS NOT NULL);

-- Comment for documentation
COMMENT ON POLICY reports_select_policy ON reports IS 'Prototype: All authenticated users can read all reports';
COMMENT ON POLICY reports_insert_policy ON reports IS 'Prototype: All authenticated users can create reports';
COMMENT ON POLICY reports_update_policy ON reports IS 'Prototype: All authenticated users can update reports';
COMMENT ON POLICY reports_delete_policy ON reports IS 'Prototype: All authenticated users can soft-delete reports';
