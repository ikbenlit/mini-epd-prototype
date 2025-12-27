-- ============================================================================
-- SEED VERPLEEGKUNDIGE OVERDRACHT DATA
-- ============================================================================
-- Created: 2024-12-27
-- Purpose: Populate reports table with realistic nursing handover data
--          to demonstrate the verpleegkundige overdracht (nursing handover) features
-- ============================================================================

DO $$
DECLARE
  patient_colin_id UUID;
  patient_jan_id UUID;
  patient_optimus_id UUID;
  practitioner_sarah_id UUID := '10000000-0000-0000-0000-000000000001'::uuid;
  practitioner_mark_id UUID := '10000000-0000-0000-0000-000000000002'::uuid;
  practitioner_lisa_id UUID := '10000000-0000-0000-0000-000000000003'::uuid;

  -- Datums voor realistische tijdlijn
  vandaag DATE := CURRENT_DATE;
  gisteren DATE := CURRENT_DATE - INTERVAL '1 day';
  eergisteren DATE := CURRENT_DATE - INTERVAL '2 days';
BEGIN
  -- Get patient IDs
  SELECT id INTO patient_colin_id FROM patients WHERE name_family = 'Lit' AND 'Colin' = ANY(name_given);
  SELECT id INTO patient_jan_id FROM patients WHERE name_family = 'de Vriesh' AND 'Jan' = ANY(name_given);
  SELECT id INTO patient_optimus_id FROM patients WHERE name_family = 'Prime' AND 'Optimus' = ANY(name_given);

  -- ============================================================================
  -- VANDAAG - Diverse rapportages gedurende de dag
  -- ============================================================================

  -- NACHT (02:00) - Colin - Observatie
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_colin_id, 'verpleegkundig',
    'Patiënt slaapt rustig. Geen bijzonderheden.',
    practitioner_lisa_id,
    vandaag + TIME '02:00:00',
    gisteren, -- Nachtdienst hoort bij vorige dag
    false,
    jsonb_build_object('category', 'observatie')
  ) ON CONFLICT DO NOTHING;

  -- OCHTEND (07:30) - Colin - ADL
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_colin_id, 'verpleegkundig',
    'Patiënt zelfstandig gedoucht en aangekleed. Heeft ontbijt genuttigd (brood, yoghurt). Stemming lijkt iets somberder dan gisteren.',
    practitioner_sarah_id,
    vandaag + TIME '07:30:00',
    vandaag,
    true, -- Belangrijk voor overdracht: stemming somberder
    jsonb_build_object('category', 'adl')
  ) ON CONFLICT DO NOTHING;

  -- OCHTEND (08:15) - Colin - Medicatie
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_colin_id, 'verpleegkundig',
    'Ochtendmedicatie toegediend: Sertraline 50mg. Patiënt heeft goed ingenomen.',
    practitioner_sarah_id,
    vandaag + TIME '08:15:00',
    vandaag,
    false,
    jsonb_build_object('category', 'medicatie')
  ) ON CONFLICT DO NOTHING;

  -- OCHTEND (10:00) - Jan - Gedragsobservatie (belangrijk!)
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_jan_id, 'verpleegkundig',
    'Patiënt geagiteerd en gespannen. Heeft meerdere keren om geruststelling gevraagd. Gesprek gevoerd, maar blijft piekeren over gezondheid. Ademhalingsoefening gedaan.',
    practitioner_sarah_id,
    vandaag + TIME '10:00:00',
    vandaag,
    true, -- Belangrijk voor overdracht
    jsonb_build_object('category', 'gedrag')
  ) ON CONFLICT DO NOTHING;

  -- OCHTEND (11:00) - Optimus - Observatie
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_optimus_id, 'verpleegkundig',
    'Patiënt werkt geconcentreerd aan zijn cognitieve oefeningen. Sociaal contact beperkt, maar dit lijkt karakteristiek voor hem.',
    practitioner_sarah_id,
    vandaag + TIME '11:00:00',
    vandaag,
    false,
    jsonb_build_object('category', 'observatie')
  ) ON CONFLICT DO NOTHING;

  -- MIDDAG (13:30) - Jan - Medicatie
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_jan_id, 'verpleegkundig',
    'Middagmedicatie toegediend: Oxazepam 10mg (SOS, ivm toegenomen angst). Effect na 30 min: patiënt rustiger.',
    practitioner_mark_id,
    vandaag + TIME '13:30:00',
    vandaag,
    true, -- SOS medicatie is belangrijk
    jsonb_build_object('category', 'medicatie')
  ) ON CONFLICT DO NOTHING;

  -- MIDDAG (14:00) - Colin - Gedragsobservatie
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_colin_id, 'verpleegkundig',
    'Patiënt heeft deelgenomen aan groepstherapie. Gaf aan zich vandaag moe te voelen. Heeft zich teruggetrokken op kamer na de sessie.',
    practitioner_mark_id,
    vandaag + TIME '14:00:00',
    vandaag,
    false,
    jsonb_build_object('category', 'gedrag')
  ) ON CONFLICT DO NOTHING;

  -- MIDDAG (15:00) - Optimus - ADL
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_optimus_id, 'verpleegkundig',
    'Patiënt neemt zelfstandig maaltijden. Blijft voorkeur houden voor vaste routine en structuur.',
    practitioner_mark_id,
    vandaag + TIME '15:00:00',
    vandaag,
    false,
    jsonb_build_object('category', 'adl')
  ) ON CONFLICT DO NOTHING;

  -- AVOND (18:30) - Colin - Medicatie
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_colin_id, 'verpleegkundig',
    'Avondmedicatie toegediend: Sertraline 50mg, Melatonine 3mg. Goed ingenomen.',
    practitioner_lisa_id,
    vandaag + TIME '18:30:00',
    vandaag,
    false,
    jsonb_build_object('category', 'medicatie')
  ) ON CONFLICT DO NOTHING;

  -- AVOND (19:45) - Jan - Observatie (belangrijk!)
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_jan_id, 'verpleegkundig',
    'Na avondeten gesprek met partner (Emma) via telefoon. Gesprek verliep goed. Patiënt minder gespannen daarna. Belangrijk: oefent met minder vaak bellen om geruststelling.',
    practitioner_lisa_id,
    vandaag + TIME '19:45:00',
    vandaag,
    true, -- Positieve ontwikkeling
    jsonb_build_object('category', 'observatie')
  ) ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- GISTEREN - Volledige dag voor context
  -- ============================================================================

  -- OCHTEND (08:00) - Colin - ADL (gisteren)
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_colin_id, 'verpleegkundig',
    'Patiënt wakker om 07:00. Gedoucht en aangekleed zonder problemen. Ontbijt goed gegeten.',
    practitioner_sarah_id,
    gisteren + TIME '08:00:00',
    gisteren,
    false,
    jsonb_build_object('category', 'adl')
  ) ON CONFLICT DO NOTHING;

  -- OCHTEND (09:00) - Colin - Medicatie (gisteren)
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_colin_id, 'verpleegkundig',
    'Ochtendmedicatie: Sertraline 50mg toegediend en ingenomen.',
    practitioner_sarah_id,
    gisteren + TIME '09:00:00',
    gisteren,
    false,
    jsonb_build_object('category', 'medicatie')
  ) ON CONFLICT DO NOTHING;

  -- MIDDAG (13:00) - Jan - Incident (belangrijk!)
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_jan_id, 'verpleegkundig',
    'Patiënt in paniek ivm vermeende hartkloppingen. Vitale functies gecontroleerd (bloeddruk, hartslag normaal). Arts geïnformeerd. Na gesprek en ademhalingsoefeningen gekalmeerd.',
    practitioner_mark_id,
    gisteren + TIME '13:00:00',
    gisteren,
    true,
    jsonb_build_object('category', 'incident')
  ) ON CONFLICT DO NOTHING;

  -- MIDDAG (14:30) - Colin - Gedragsobservatie (gisteren)
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_colin_id, 'verpleegkundig',
    'Therapiesessie met psycholoog. Patiënt gaf na afloop aan zich begrepen te voelen. Stemming leek opgewekt.',
    practitioner_mark_id,
    gisteren + TIME '14:30:00',
    gisteren,
    false,
    jsonb_build_object('category', 'gedrag')
  ) ON CONFLICT DO NOTHING;

  -- AVOND (20:00) - Jan - Medicatie (gisteren)
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_jan_id, 'verpleegkundig',
    'Avondmedicatie: Paroxetine 20mg, Melatonine 3mg toegediend.',
    practitioner_lisa_id,
    gisteren + TIME '20:00:00',
    gisteren,
    false,
    jsonb_build_object('category', 'medicatie')
  ) ON CONFLICT DO NOTHING;

  -- AVOND (21:30) - Optimus - Observatie (gisteren)
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_optimus_id, 'verpleegkundig',
    'Patiënt leest op kamer. Geeft aan niet moe te zijn. Gaat naar bed rond 23:00 (vaste routine).',
    practitioner_lisa_id,
    gisteren + TIME '21:30:00',
    gisteren,
    false,
    jsonb_build_object('category', 'observatie')
  ) ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- EERGISTEREN - Enkele belangrijke rapportages voor geschiedenis
  -- ============================================================================

  -- OCHTEND (10:00) - Colin - Gedragsobservatie (eergisteren)
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_colin_id, 'verpleegkundig',
    'Intake gesprek met familie. Moeder op bezoek. Goed contact. Patiënt emotioneel maar opgelucht na gesprek.',
    practitioner_sarah_id,
    eergisteren + TIME '10:00:00',
    eergisteren,
    true, -- Belangrijk: familiecontact
    jsonb_build_object('category', 'gedrag')
  ) ON CONFLICT DO NOTHING;

  -- MIDDAG (14:00) - Jan - Gedragsobservatie (eergisteren)
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_jan_id, 'verpleegkundig',
    'Mindfulness groep. Patiënt heeft moeite met stilzitten en concentratie. Blijft piekeren. Individuele nabespreking gehad.',
    practitioner_mark_id,
    eergisteren + TIME '14:00:00',
    eergisteren,
    false,
    jsonb_build_object('category', 'gedrag')
  ) ON CONFLICT DO NOTHING;

  -- AVOND (19:00) - Optimus - ADL (eergisteren)
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_optimus_id, 'verpleegkundig',
    'Patiënt heeft zelfstandig avondmaaltijd gebruikt. Keurig opgeruimd. Houdt zich goed aan afdelingregels.',
    practitioner_lisa_id,
    eergisteren + TIME '19:00:00',
    eergisteren,
    false,
    jsonb_build_object('category', 'adl')
  ) ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- Extra rapportages voor diversiteit - 3 dagen geleden
  -- ============================================================================

  -- Medicatie wijziging (belangrijk voor overdracht)
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_colin_id, 'verpleegkundig',
    'Medicatie aangepast door psychiater: Sertraline verhoogd van 25mg naar 50mg. Start vandaag. Extra observatie op bijwerkingen.',
    practitioner_sarah_id,
    CURRENT_DATE - INTERVAL '3 days' + TIME '10:00:00',
    CURRENT_DATE - INTERVAL '3 days',
    true, -- Medicatiewijziging is altijd belangrijk
    jsonb_build_object('category', 'medicatie')
  ) ON CONFLICT DO NOTHING;

  -- Incident met goede afloop
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_jan_id, 'verpleegkundig',
    'Patiënt wilde afdeling verlaten tijdens piekmoment. Gesprek gevoerd over contractafspraken. Patiënt kon uiteindelijk zelf kalmeren en bleef. Geen dwangmiddelen nodig.',
    practitioner_mark_id,
    CURRENT_DATE - INTERVAL '3 days' + TIME '15:30:00',
    CURRENT_DATE - INTERVAL '3 days',
    true,
    jsonb_build_object('category', 'incident')
  ) ON CONFLICT DO NOTHING;

  RAISE NOTICE '✓ Seeded verpleegkundige overdracht rapportages';
  RAISE NOTICE '  - Colin Lit: % rapportages', (SELECT COUNT(*) FROM reports WHERE patient_id = patient_colin_id AND type = 'verpleegkundig');
  RAISE NOTICE '  - Jan de Vriesh: % rapportages', (SELECT COUNT(*) FROM reports WHERE patient_id = patient_jan_id AND type = 'verpleegkundig');
  RAISE NOTICE '  - Optimus Prime: % rapportages', (SELECT COUNT(*) FROM reports WHERE patient_id = patient_optimus_id AND type = 'verpleegkundig');
  RAISE NOTICE '  - Overdracht items: %', (SELECT COUNT(*) FROM reports WHERE type = 'verpleegkundig' AND include_in_handover = true);
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  verpleegkundig_count INTEGER;
  overdracht_count INTEGER;
  categories_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO verpleegkundig_count
    FROM reports
    WHERE type = 'verpleegkundig' AND deleted_at IS NULL;

  SELECT COUNT(*) INTO overdracht_count
    FROM reports
    WHERE type = 'verpleegkundig' AND include_in_handover = true AND deleted_at IS NULL;

  SELECT COUNT(DISTINCT structured_data->>'category') INTO categories_count
    FROM reports
    WHERE type = 'verpleegkundig' AND deleted_at IS NULL;

  RAISE NOTICE '=== VERPLEEGKUNDIGE OVERDRACHT SEED SUMMARY ===';
  RAISE NOTICE 'Totaal verpleegkundige rapportages: %', verpleegkundig_count;
  RAISE NOTICE 'Overdracht items (include_in_handover=true): %', overdracht_count;
  RAISE NOTICE 'Verschillende categorieën: %', categories_count;

  IF verpleegkundig_count >= 20 THEN
    RAISE NOTICE '✓ Verpleegkundige overdracht data succesvol ingevoerd!';
  ELSE
    RAISE WARNING '⚠ Mogelijk niet alle data ingevoerd';
  END IF;
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✓ Realistische verpleegkundige rapportages over 4 dagen
-- ✓ Alle categorieën vertegenwoordigd:
--   - medicatie (medicatie toediening, wijzigingen)
--   - adl (douchen, eten, zelfverzorging)
--   - gedrag (observaties, groepstherapie, gesprekken)
--   - incident (paniek, conflict, crises)
--   - observatie (algemene observaties)
-- ✓ Verschillende tijdstippen (nacht, ochtend, middag, avond)
-- ✓ Include_in_handover flags voor belangrijke items
-- ✓ Shift_date correct berekend (nachtdienst voor 07:00 = vorige dag)
--
-- GEBRUIK:
-- - Verpleegkundige overdracht module (/epd/verpleegrapportage)
-- - Timeline visualisatie per dagdeel
-- - AI samenvatting generatie
-- - Handover filtering (include_in_handover=true)
-- ============================================================================
