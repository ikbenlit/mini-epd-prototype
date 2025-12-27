-- ============================================================================
-- SEED VERPLEEGKUNDIGE OVERDRACHT DATA (Aangepaste versie)
-- ============================================================================
-- Created: 2024-12-27
-- Purpose: Populate reports table with realistic nursing handover data
--          Works with existing patients in your database
-- ============================================================================

DO $$
DECLARE
  -- Use existing patients from your database
  patient_piet_id UUID := '2abadccb-7c29-4ea4-94b1-538a3927824c'::uuid;  -- Piet Janssen
  patient_jan_id UUID := 'd16935c9-e0fe-4972-832f-175b7a38f9b9'::uuid;    -- Jan de Vriesh
  patient_optimus_id UUID := 'a94ac0ce-ff90-404b-ac62-592db93df76e'::uuid; -- Optimus Prime

  -- Practitioners (assuming these exist from your setup)
  practitioner_sarah_id UUID := '10000000-0000-0000-0000-000000000001'::uuid;
  practitioner_mark_id UUID := '10000000-0000-0000-0000-000000000002'::uuid;
  practitioner_lisa_id UUID := '10000000-0000-0000-0000-000000000003'::uuid;

  -- Datums voor realistische tijdlijn
  vandaag DATE := CURRENT_DATE;
  gisteren DATE := CURRENT_DATE - INTERVAL '1 day';
  eergisteren DATE := CURRENT_DATE - INTERVAL '2 days';
BEGIN

  -- ============================================================================
  -- VANDAAG - Diverse rapportages gedurende de dag
  -- ============================================================================

  -- NACHT (02:00) - Piet - Observatie
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_piet_id, 'verpleegkundig',
    'Patiënt slaapt rustig. Geen bijzonderheden.',
    practitioner_lisa_id,
    vandaag + TIME '02:00:00',
    gisteren, -- Nachtdienst hoort bij vorige dag
    false,
    jsonb_build_object('category', 'observatie')
  );

  -- OCHTEND (07:30) - Piet - ADL
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_piet_id, 'verpleegkundig',
    'Patiënt zelfstandig gedoucht en aangekleed. Heeft ontbijt genuttigd (brood, yoghurt). Stemming lijkt iets somberder dan gisteren.',
    practitioner_sarah_id,
    vandaag + TIME '07:30:00',
    vandaag,
    true, -- Belangrijk voor overdracht: stemming somberder
    jsonb_build_object('category', 'adl')
  );

  -- OCHTEND (08:15) - Piet - Medicatie
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_piet_id, 'verpleegkundig',
    'Ochtendmedicatie toegediend: Sertraline 50mg. Patiënt heeft goed ingenomen.',
    practitioner_sarah_id,
    vandaag + TIME '08:15:00',
    vandaag,
    false,
    jsonb_build_object('category', 'medicatie')
  );

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
  );

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
  );

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
  );

  -- MIDDAG (14:00) - Piet - Gedragsobservatie
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_piet_id, 'verpleegkundig',
    'Patiënt heeft deelgenomen aan groepstherapie. Gaf aan zich vandaag moe te voelen. Heeft zich teruggetrokken op kamer na de sessie.',
    practitioner_mark_id,
    vandaag + TIME '14:00:00',
    vandaag,
    false,
    jsonb_build_object('category', 'gedrag')
  );

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
  );

  -- AVOND (18:30) - Piet - Medicatie
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_piet_id, 'verpleegkundig',
    'Avondmedicatie toegediend: Sertraline 50mg, Melatonine 3mg. Goed ingenomen.',
    practitioner_lisa_id,
    vandaag + TIME '18:30:00',
    vandaag,
    false,
    jsonb_build_object('category', 'medicatie')
  );

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
  );

  -- ============================================================================
  -- GISTEREN - Volledige dag voor context
  -- ============================================================================

  -- OCHTEND (08:00) - Piet - ADL (gisteren)
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_piet_id, 'verpleegkundig',
    'Patiënt wakker om 07:00. Gedoucht en aangekleed zonder problemen. Ontbijt goed gegeten.',
    practitioner_sarah_id,
    gisteren + TIME '08:00:00',
    gisteren,
    false,
    jsonb_build_object('category', 'adl')
  );

  -- OCHTEND (09:00) - Piet - Medicatie (gisteren)
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_piet_id, 'verpleegkundig',
    'Ochtendmedicatie: Sertraline 50mg toegediend en ingenomen.',
    practitioner_sarah_id,
    gisteren + TIME '09:00:00',
    gisteren,
    false,
    jsonb_build_object('category', 'medicatie')
  );

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
  );

  -- MIDDAG (14:30) - Piet - Gedragsobservatie (gisteren)
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_piet_id, 'verpleegkundig',
    'Therapiesessie met psycholoog. Patiënt gaf na afloop aan zich begrepen te voelen. Stemming leek opgewekt.',
    practitioner_mark_id,
    gisteren + TIME '14:30:00',
    gisteren,
    false,
    jsonb_build_object('category', 'gedrag')
  );

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
  );

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
  );

  -- ============================================================================
  -- EERGISTEREN - Enkele belangrijke rapportages voor geschiedenis
  -- ============================================================================

  -- OCHTEND (10:00) - Piet - Gedragsobservatie (eergisteren)
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_piet_id, 'verpleegkundig',
    'Intake gesprek met familie. Moeder op bezoek. Goed contact. Patiënt emotioneel maar opgelucht na gesprek.',
    practitioner_sarah_id,
    eergisteren + TIME '10:00:00',
    eergisteren,
    true, -- Belangrijk: familiecontact
    jsonb_build_object('category', 'gedrag')
  );

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
  );

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
  );

  -- ============================================================================
  -- Extra rapportages voor diversiteit - 3 dagen geleden
  -- ============================================================================

  -- Medicatie wijziging (belangrijk voor overdracht)
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_piet_id, 'verpleegkundig',
    'Medicatie aangepast door psychiater: Sertraline verhoogd van 25mg naar 50mg. Start vandaag. Extra observatie op bijwerkingen.',
    practitioner_sarah_id,
    CURRENT_DATE - INTERVAL '3 days' + TIME '10:00:00',
    CURRENT_DATE - INTERVAL '3 days',
    true, -- Medicatiewijziging is altijd belangrijk
    jsonb_build_object('category', 'medicatie')
  );

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
  );

  -- Extra rapportages voor meer volume
  -- VANDAAG - Extra observaties
  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_piet_id, 'verpleegkundig',
    'Patiënt wandelt buiten met medepatiënt. Ziet er ontspannen uit.',
    practitioner_mark_id,
    vandaag + TIME '16:00:00',
    vandaag,
    false,
    jsonb_build_object('category', 'observatie')
  );

  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_jan_id, 'verpleegkundig',
    'Patiënt heeft deelgenomen aan creatieve therapie. Maakte schilderij. Leek meer ontspannen tijdens activiteit.',
    practitioner_mark_id,
    vandaag + TIME '16:30:00',
    vandaag,
    false,
    jsonb_build_object('category', 'gedrag')
  );

  INSERT INTO reports (
    patient_id, type, content, created_by, created_at, shift_date,
    include_in_handover, structured_data
  ) VALUES (
    patient_optimus_id, 'verpleegkundig',
    'Avondmedicatie: Melatonine 3mg ingenomen.',
    practitioner_lisa_id,
    vandaag + TIME '21:00:00',
    vandaag,
    false,
    jsonb_build_object('category', 'medicatie')
  );

  RAISE NOTICE '✓ Verpleegkundige overdracht rapportages toegevoegd';
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  verpleegkundig_count INTEGER;
  overdracht_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO verpleegkundig_count
    FROM reports
    WHERE type = 'verpleegkundig' AND deleted_at IS NULL;

  SELECT COUNT(*) INTO overdracht_count
    FROM reports
    WHERE type = 'verpleegkundig' AND include_in_handover = true AND deleted_at IS NULL;

  RAISE NOTICE '=== VERPLEEGKUNDIGE OVERDRACHT SEED SUMMARY ===';
  RAISE NOTICE 'Totaal verpleegkundige rapportages: %', verpleegkundig_count;
  RAISE NOTICE 'Overdracht items (belangrijk): %', overdracht_count;
  RAISE NOTICE '✓ Data succesvol ingevoerd!';
END $$;
