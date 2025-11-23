-- ============================================================================
-- SEED DEFAULT ORGANIZATION
-- ============================================================================
-- Created: 2025-11-22
-- Purpose: Create default GGZ organization for development/demo
-- Epic: E3.S1 - Organization seed
-- ============================================================================

-- Create demo GGZ organization
INSERT INTO organizations (
  id,
  identifier_agb,
  identifier_kvk,
  name,
  alias,
  type_code,
  type_display,
  telecom_phone,
  telecom_email,
  telecom_website,
  address_line,
  address_city,
  address_postal_code,
  address_country,
  active
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'AGB-DEMO-001',
  '12345678',
  'Demo GGZ Instelling',
  ARRAY['Demo GGZ', 'DGGZ'],
  'prov',
  'Healthcare Provider',
  '030-1234567',
  'info@demo-ggz.nl',
  'https://demo-ggz.nl',
  ARRAY['Demonstratiestraat 1'],
  'Utrecht',
  '3511 AB',
  'NL',
  true
)
ON CONFLICT (id) DO UPDATE SET
  identifier_agb = EXCLUDED.identifier_agb,
  identifier_kvk = EXCLUDED.identifier_kvk,
  name = EXCLUDED.name,
  alias = EXCLUDED.alias,
  type_code = EXCLUDED.type_code,
  type_display = EXCLUDED.type_display,
  telecom_phone = EXCLUDED.telecom_phone,
  telecom_email = EXCLUDED.telecom_email,
  telecom_website = EXCLUDED.telecom_website,
  address_line = EXCLUDED.address_line,
  address_city = EXCLUDED.address_city,
  address_postal_code = EXCLUDED.address_postal_code,
  address_country = EXCLUDED.address_country,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Verification
DO $$
DECLARE
  org_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO org_count FROM organizations WHERE identifier_agb = 'AGB-DEMO-001';

  IF org_count > 0 THEN
    RAISE NOTICE '✓ Default organization created/updated successfully';
    RAISE NOTICE 'Organization: Demo GGZ Instelling (AGB-DEMO-001)';
  ELSE
    RAISE WARNING '✗ Failed to create default organization';
  END IF;
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✓ Created Demo GGZ Instelling with identifier AGB-DEMO-001
-- ✓ Idempotent: safe to re-run (uses ON CONFLICT)
-- ✓ Required for E3.S1 acceptance criteria
--
-- This organization is referenced by:
-- - Encounters (organization_id foreign key)
-- - Practitioners (organizational affiliation)
-- - Care plans (care team organization)
-- ============================================================================
