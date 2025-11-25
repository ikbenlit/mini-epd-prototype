-- ============================================================================
-- SEED REPORTS DATA: Rapportages voor AI samenvatting demo
-- ============================================================================
-- Created: 2024-11-24
-- Purpose: Populate reports table with realistic test data for demonstrating
--          AI summarization and report analysis features
-- ============================================================================

-- ============================================================================
-- STEP 1: Get patient and practitioner IDs
-- ============================================================================
DO $$
DECLARE
  patient_colin_id UUID;
  patient_jan_id UUID;
  patient_optimus_id UUID;
  practitioner_sarah_id UUID := '10000000-0000-0000-0000-000000000001'::uuid;
  practitioner_mark_id UUID := '10000000-0000-0000-0000-000000000002'::uuid;
  practitioner_lisa_id UUID := '10000000-0000-0000-0000-000000000003'::uuid;
BEGIN
  -- Get patient IDs
  SELECT id INTO patient_colin_id FROM patients WHERE name_family = 'Lit' AND 'Colin' = ANY(name_given);
  SELECT id INTO patient_jan_id FROM patients WHERE name_family = 'de Vriesh' AND 'Jan' = ANY(name_given);
  SELECT id INTO patient_optimus_id FROM patients WHERE name_family = 'Prime' AND 'Optimus' = ANY(name_given);

  -- ============================================================================
  -- STEP 2: Colin Lit - Depressie behandeling rapportages
  -- ============================================================================

  -- Report 1: Intake rapport Colin
  INSERT INTO reports (
    id,
    patient_id,
    type,
    content,
    created_by,
    created_at,
    structured_data,
    ai_confidence,
    ai_reasoning
  ) VALUES (
    '30000000-0000-0000-0000-000000000001'::uuid,
    patient_colin_id,
    'behandeladvies',
    E'Intake gesprek met Colin Lit, 28 jaar. Cliënt presenteert zich met matige tot ernstige depressieve klachten en slaapproblemen die sinds ongeveer 3 maanden aanwezig zijn. Aanleiding is een combinatie van werkdruk en een recente relatiebreuk.\n\nKlachten:\n- Sombere stemming vrijwel de hele dag\n- Verlies van interesse en plezier in activiteiten\n- Slaapproblemen (moeite met inslapen, vroeg wakker worden)\n- Verminderde concentratie\n- Gevoelens van waardeloosheid\n- Afgenomen eetlust met gewichtsverlies (5kg in 2 maanden)\n\nROM meetinstrumenten:\n- PHQ-9: 14 (matig ernstige depressie)\n- GAD-7: 8 (milde angst)\n\nBehandeladvies:\nStart met Cognitieve Gedragstherapie (CGT) gericht op gedragsactivatie en cognitieve herstructurering. Focus op:\n1. Normaliseren van slaap-waakritme\n2. Opbouwen van plezierige activiteiten\n3. Uitdagen van negatieve gedachten\n4. Stress management technieken\n\nVoorgestelde frequentie: wekelijks, 12-16 sessies. Overleg met huisarts over eventuele medicamenteuze ondersteuning indien na 6 weken geen verbetering.',
    practitioner_sarah_id,
    '2024-10-15 11:30:00+00',
    jsonb_build_object(
      'diagnosis_codes', ARRAY['F32.1', 'F51.0'],
      'rom_scores', jsonb_build_object('PHQ-9', 14, 'GAD-7', 8),
      'treatment_plan', jsonb_build_object(
        'type', 'CGT',
        'sessions', 12,
        'frequency', 'wekelijks'
      )
    ),
    0.92,
    'Clearly structured intake report with treatment advice section'
  ) ON CONFLICT (id) DO NOTHING;

  -- Report 2: Behandelsessie 2 Colin - Vrije notitie
  INSERT INTO reports (
    id,
    patient_id,
    type,
    content,
    created_by,
    created_at,
    structured_data
  ) VALUES (
    '30000000-0000-0000-0000-000000000002'::uuid,
    patient_colin_id,
    'vrije_notitie',
    E'Tweede sessie CGT met Colin. Besproken hoe de week is verlopen. Colin geeft aan dat hij kleine stappen heeft gezet met de gedragsactivatie oefeningen. Hij is 3x gaan wandelen en heeft 1x contact gehad met een vriend.\n\nPositief: Colin merkt dat de wandelingen hem even afleiden van piekeren. Slaap is iets verbeterd, gemiddeld 6 uur per nacht.\n\nAandachtspunten: Colin blijft negatief denken over zijn werk situatie. "Ik ben niet goed genoeg" is een terugkerende gedachte. Hebben gedachtenregistratie oefening gedaan om deze gedachten te identificeren en uitdagen.\n\nHuiswerk: Dagelijks één plezierige activiteit plannen en uitvoeren. Gedachtenregistratie bijhouden van negatieve gedachten over werk.\n\nVolgende sessie: Verdiepen in cognitieve herstructurering, specifiek gericht op perfectionisme en werk-gerelateerde cognities.',
    practitioner_sarah_id,
    '2024-10-22 11:00:00+00',
    jsonb_build_object(
      'session_number', 2,
      'homework_compliance', 'goed',
      'mood_trend', 'licht verbeterd'
    )
  ) ON CONFLICT (id) DO NOTHING;

  -- Report 3: Behandelsessie 4 Colin - Vrije notitie
  INSERT INTO reports (
    id,
    patient_id,
    type,
    content,
    created_by,
    created_at,
    structured_data
  ) VALUES (
    '30000000-0000-0000-0000-000000000003'::uuid,
    patient_colin_id,
    'vrije_notitie',
    E'Vierde sessie. Duidelijke vooruitgang zichtbaar. Colin rapporteert dat zijn stemming is verbeterd en dat hij meer energie heeft. PHQ-9 deze week: 9 (milde depressie).\n\nColin heeft deze week succesvol meerdere sociale activiteiten ondernomen en begint weer plezier te ervaren. Hij merkt dat de negatieve gedachten minder frequent zijn en dat hij ze sneller kan herkennen en uitdagen.\n\nWe hebben gewerkt aan zijn perfectionistische normen m.b.t. werk. Colin begint te zien dat zijn hoge eisen aan zichzelf bijdragen aan stress en somberheid. Hij heeft afgesproken om realistische doelen te stellen en meer zelfcompassie te oefenen.\n\nSlaap is verder genormaliseerd, gemiddeld 7-8 uur per nacht. Eetlust is ook toegenomen.\n\nVervolg: Komende sessies focus op relapse preventie en omgaan met terugval in oude patronen.',
    practitioner_sarah_id,
    '2024-11-05 10:30:00+00',
    jsonb_build_object(
      'session_number', 4,
      'phq9_score', 9,
      'treatment_progress', 'goed'
    )
  ) ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- STEP 3: Jan de Vriesh - Angststoornis behandeling rapportages
  -- ============================================================================

  -- Report 4: Intake rapport Jan
  INSERT INTO reports (
    id,
    patient_id,
    type,
    content,
    created_by,
    created_at,
    structured_data,
    ai_confidence,
    ai_reasoning
  ) VALUES (
    '30000000-0000-0000-0000-000000000004'::uuid,
    patient_jan_id,
    'behandeladvies',
    E'Intake met Jan de Vriesh (35 jaar). Hoofdklacht: gegeneraliseerde angststoornis met uitgebreide piekersymptomen en fysieke spanningsklachten. Jan maakt zich voortdurend zorgen over uiteenlopende onderwerpen (werk, gezondheid, relatie, financiën).\n\nPresenterende klachten:\n- Excessief en moeilijk te controleren piekeren\n- Rusteloosheid en gespannenheid\n- Moeite met concentreren\n- Prikkelbaarheid\n- Spierspanning (vooral nek en schouders)\n- Slaapstoornissen\n- Vermijdingsgedrag\n\nROM instrumenten:\n- GAD-7: 16 (matig ernstige angst)\n- PHQ-9: 11 (matige depressie, secundair aan angst)\n- PSWQ (Penn State Worry Questionnaire): 68 (klinisch significant)\n\nComorbiditeit: Relationele problematiek. Partner ervaart last van Jans constante geruststelling zoeken.\n\nBehandelplan:\nAcceptance and Commitment Therapy (ACT) met focus op:\n1. Psycho-educatie over angst en piekeren\n2. Mindfulness en acceptatie technieken\n3. Defusie van angstige gedachten\n4. Waarden clarificatie\n5. Committed action richting waarden\n6. Relatie counseling waar nodig\n\nDuur: 16-20 sessies, wekelijks/tweewekelijks. Evaluatie na 8 sessies.',
    practitioner_mark_id,
    '2024-11-01 15:45:00+00',
    jsonb_build_object(
      'diagnosis_codes', ARRAY['F41.1', 'Z63.0'],
      'rom_scores', jsonb_build_object('GAD-7', 16, 'PHQ-9', 11, 'PSWQ', 68),
      'treatment_plan', jsonb_build_object(
        'type', 'ACT',
        'sessions', 16,
        'frequency', 'wekelijks'
      )
    ),
    0.95,
    'Clear treatment advice structure with specific ACT intervention plan'
  ) ON CONFLICT (id) DO NOTHING;

  -- Report 5: Behandelsessie 3 Jan - Vrije notitie
  INSERT INTO reports (
    id,
    patient_id,
    type,
    content,
    created_by,
    created_at,
    structured_data
  ) VALUES (
    '30000000-0000-0000-0000-000000000005'::uuid,
    patient_jan_id,
    'vrije_notitie',
    E'Derde sessie ACT met Jan. Vandaag gefocust op mindfulness en acceptance. Jan vindt het moeilijk om de piekeren "los te laten" zoals hij het zelf verwoordt. We hebben uitgelegd dat het niet gaat om het loslaten maar om een andere relatie met de gedachten te ontwikkelen.\n\nOefening: Leaves on a stream mindfulness oefening gedaan. Jan merkte dat hij steeds weer mee ging in zijn gedachten in plaats van ze te observeren. Dit is normaal in het begin. Hebben afgesproken dat hij dit thuis 10 minuten per dag gaat oefenen.\n\nBespreking van metafoor: Passagiers op de bus. Jan herkent dat zijn angstige gedachten als passagiers proberen de controle over te nemen. We hebben gesproken over het verschil tussen chauffeur zijn versus passagier.\n\nHuiswerk: Dagelijkse mindfulness oefening, observeren van piekeren zonder erin mee te gaan, en bijhouden welke waarden belangrijk zijn in zijn leven.\n\nJan blijft vragen om "praktische tips" om het piekeren te stoppen. Uitgelegd dat dit juist het probleem is - de strijd met de gedachten versterkt ze. Focus blijft op acceptatie en psychologische flexibiliteit.',
    practitioner_mark_id,
    '2024-11-15 14:30:00+00',
    jsonb_build_object(
      'session_number', 3,
      'act_component', 'acceptance and mindfulness',
      'homework_assigned', true
    )
  ) ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- STEP 4: Optimus Prime - Diagnostiek rapportages (Easter egg)
  -- ============================================================================

  -- Report 6: Diagnostisch onderzoek Optimus
  INSERT INTO reports (
    id,
    patient_id,
    type,
    content,
    created_by,
    created_at,
    structured_data,
    ai_confidence,
    ai_reasoning
  ) VALUES (
    '30000000-0000-0000-0000-000000000006'::uuid,
    patient_optimus_id,
    'behandeladvies',
    E'Diagnostisch onderzoek Optimus Prime. Cliënt, van niet-Nederlandse oorsprong, presenteert zich met unieke symptomatologie die niet binnen standaard DSM-5 classificaties past.\n\nObservaties tijdens onderzoek:\n- Opvallend metallic timbre in stem\n- Zeer systematische en logische denkwijze\n- Uitstekende geheugen en informatieverwerkingscapaciteit\n- Moeite met emotionele expressie en herkenning\n- Sterke focus op "missie" en "verantwoordelijkheid voor anderen"\n- Rapporteert "transformatie processen" die mogelijk metaforisch bedoeld zijn\n\nWAIS-IV resultaten:\n- Verbaal begrip: 145 (zeer superieur)\n- Perceptuele redeneren: 150 (zeer superieur)\n- Werkgeheugen: 155 (zeer superieur)\n- Verwerkingssnelheid: 148 (zeer superieur)\n\nEmotionele functies:\n- Alexithymie kenmerken aanwezig\n- Moeite met identificeren en benoemen emoties\n- Compensatie door extreem hoog functionerend cognitief systeem\n\nProvisional diagnostische indruk:\n- Mogelijk autisme spectrum stoornis (ASS) met zeer hoog IQ\n- Differentiaal diagnostiek: unieke neurodivergentie\n\nAdvies:\n- Verder specialistisch onderzoek geïndiceerd\n- Focus op emotionele ontwikkeling en sociale vaardigheden indien cliënt dit wenst\n- Mogelijk contact met expertise centrum voor hoogbegaafdheid\n- Overwegen of behandeling geïndiceerd is gezien hoog functioneringsniveau',
    practitioner_lisa_id,
    '2024-11-10 12:00:00+00',
    jsonb_build_object(
      'diagnosis_codes', ARRAY['Z03.2'],
      'test_results', jsonb_build_object(
        'WAIS-IV', jsonb_build_object(
          'Verbal', 145,
          'Perceptual', 150,
          'Working_Memory', 155,
          'Processing', 148
        )
      ),
      'notes', 'Zeer uitzonderlijk profiel, verder onderzoek aanbevolen'
    ),
    0.78,
    'Structured diagnostic report though clinical presentation is atypical'
  ) ON CONFLICT (id) DO NOTHING;

  -- Report 7: Follow-up observatie Optimus
  INSERT INTO reports (
    id,
    patient_id,
    type,
    content,
    created_by,
    created_at,
    structured_data
  ) VALUES (
    '30000000-0000-0000-0000-000000000007'::uuid,
    patient_optimus_id,
    'vrije_notitie',
    E'Follow-up gesprek met Optimus over diagnostische bevindingen. Cliënt geeft aan zich niet "gebroken" te voelen en vraagt zich af of behandeling wel nodig is.\n\nOptimus legt uit dat zijn wijze van functioneren voor hem naturel is en dat hij vooral moeite heeft met het begrijpen van "menselijke emotionele complexiteit" zoals hij het noemt. Hij functioneert zeer goed in zijn werk (iets met zware voertuigen en logistiek management) en heeft een groep vrienden die hem accepteren zoals hij is.\n\nHoofdvraag: Hoe om te gaan met sociale situaties waar emotionele intelligentie vereist is? Optimus wil graag leren om beter te navigeren in sociale interacties zonder dat dit zijn authentieke zelf in gevaar brengt.\n\nAfgesproken: Geen formele behandeling nodig. Wel aangeboden om enkele consultatieve sessies te doen gericht op:\n1. Psycho-educatie over verschillende neurodiversiteit\n2. Social skills coaching (indien gewenst)\n3. Strategieën voor emotieherkenning en -regulatie\n\nOptimus gaf aan hier over na te denken. Deur staat open voor follow-up indien gewenst.',
    practitioner_lisa_id,
    '2024-11-17 10:00:00+00',
    jsonb_build_object(
      'follow_up', 'optioneel',
      'client_preference', 'consultative approach'
    )
  ) ON CONFLICT (id) DO NOTHING;

  -- ============================================================================
  -- STEP 5: Extra realistische rapportages voor diverse use cases
  -- ============================================================================

  -- Report 8: Korte crisis interventie notitie - Colin
  INSERT INTO reports (
    id,
    patient_id,
    type,
    content,
    created_by,
    created_at,
    structured_data
  ) VALUES (
    '30000000-0000-0000-0000-000000000008'::uuid,
    patient_colin_id,
    'vrije_notitie',
    E'Tussentijds telefonisch contact met Colin. Hij belde omdat hij een moeilijke week had en twijfelde of hij wel vooruitgang boekt. Geruststelling gegeven dat terugval in oude patronen normaal is tijdens behandeling.\n\nColin had een conflict op werk gehad en merkte dat oude gedachtenpatronen terugkwamen. Hebben kort doorgenomen welke copingstrategieën hij heeft geleerd. Colin besefte dat hij vergeten was zijn gedachtenregistratie bij te houden.\n\nAfgesproken: Extra sessie inplannen komende week om dit te bespreken. Colin voelt zich na gesprek rustiger en heeft vertrouwen dat hij de tools heeft om hiermee om te gaan.',
    practitioner_sarah_id,
    '2024-10-28 16:30:00+00',
    jsonb_build_object(
      'contact_type', 'telefonisch',
      'crisis_level', 'laag',
      'extra_session', true
    )
  ) ON CONFLICT (id) DO NOTHING;

  -- Report 9: Voortgangsrapportage Colin na 8 sessies
  INSERT INTO reports (
    id,
    patient_id,
    type,
    content,
    created_by,
    created_at,
    structured_data,
    ai_confidence,
    ai_reasoning
  ) VALUES (
    '30000000-0000-0000-0000-000000000009'::uuid,
    patient_colin_id,
    'behandeladvies',
    E'Voortgangsrapportage na 8 sessies CGT voor Colin Lit.\n\nBehandelverloop:\nColin heeft 8 sessies CGT gevolgd gericht op depressieve klachten. De behandeling bestond uit gedragsactivatie, cognitieve herstructurering en slaaphygiëne. Colin heeft goed meegewerkt en huiswerkopdrachten consequent uitgevoerd.\n\nKlinische vooruitgang:\n- PHQ-9 intake: 14 → Huidig: 6 (minimale depressie)\n- GAD-7 intake: 8 → Huidig: 4 (minimale angst)\n- Stemming duidelijk verbeterd\n- Slaap genormaliseerd (7-8 uur per nacht)\n- Gewicht gestabiliseerd\n- Sociaal functioneren verbeterd\n- Werkprestaties hersteld\n\nIngezette interventies die succesvol waren:\n1. Gedragsactivatie - opbouw plezierige en noodzakelijke activiteiten\n2. Cognitieve herstructurering - uitdagen perfectionisme en zwart-wit denken\n3. Slaaphygiëne protocol\n4. Stress management technieken\n5. Sociale activatie\n\nBehandeladvies:\n- Afbouwen naar tweewekelijkse sessies (nog 4 sessies)\n- Focus op relapse preventie\n- Identificeren early warning signs\n- Opstellen terugvalpreventieplan\n- Evaluatie na totaal 12 sessies voor mogelijke afsluiting\n\nPrognose: Goed. Colin heeft effectieve copingvaardigheden ontwikkeld en toont goede zelfinzicht. Risico op terugval is gereduceerd door gerichte preventie strategieën.',
    practitioner_sarah_id,
    '2024-11-12 09:00:00+00',
    jsonb_build_object(
      'session_count', 8,
      'rom_intake', jsonb_build_object('PHQ-9', 14, 'GAD-7', 8),
      'rom_current', jsonb_build_object('PHQ-9', 6, 'GAD-7', 4),
      'clinical_progress', 'significant improvement',
      'prognosis', 'good'
    ),
    0.98,
    'Well-structured progress report with clear outcome data and treatment recommendations'
  ) ON CONFLICT (id) DO NOTHING;

  -- Report 10: Lange complexe notitie Jan - relatiedynamiek
  INSERT INTO reports (
    id,
    patient_id,
    type,
    content,
    created_by,
    created_at,
    structured_data
  ) VALUES (
    '30000000-0000-0000-0000-000000000010'::uuid,
    patient_jan_id,
    'vrije_notitie',
    E'Uitgebreide sessie met Jan waarin we dieper zijn ingegaan op de relatiedynamiek en hoe zijn angststoornis zijn partnerrelatie beïnvloedt.\n\nJan vertelt dat zijn partner (Emma) steeds gefrustreerder raakt door zijn constante geruststelling zoeken. Hij belt haar meerdere keren per dag op werk om bevestiging te krijgen dat alles goed is. Emma heeft aangegeven dat dit voor haar belastend is en dat ze zich gecontroleerd voelt.\n\nVoor Jan is dit gedrag een copingmechanisme om zijn angst te reguleren. Hij beseft intellectueel dat dit zijn relatie schaadt maar voelt dat hij de drang niet kan weerstaan. Dit past binnen het ACT model van experiential avoidance - Jan probeert zijn angstige gevoelens te vermijden door geruststelling te zoeken.\n\nWe hebben gewerkt aan:\n1. Bewustwording van de functie van het gedrag (korte termijn angstreductie vs lange termijn schade)\n2. Identificeren van waarden in zijn relatie (verbinding, vertrouwen, autonomie)\n3. Het conflict tussen zijn gedrag en zijn waarden zichtbaar maken\n4. Alternatieve manieren om met angst om te gaan (mindfulness, self-compassion)\n\nJan werd emotioneel tijdens dit gesprek toen hij besefte hoeveel druk hij op Emma legt. Dit is een belangrijk moment van zelfinzicht. We hebben samen een plan gemaakt:\n- Jan gaat dagelijks max 1x bellen voor geruststelling (exposure)\n- Emma en Jan gaan samen een gesprek hebben over grenzen\n- Jan gaat zijn angstige gevoelens opschrijven in plaats van direct contact zoeken\n- Mogelijk relatietherapie sessies indien Jan en Emma dit beiden wensen\n\nHuiswerk: Jan gaat Emma een brief schrijven waarin hij uitlegt wat hij leert in therapie en hoe hij wil werken aan hun relatie. Deze brief gaan we volgende sessie bespreken voordat hij hem geeft.',
    practitioner_mark_id,
    '2024-11-22 15:00:00+00',
    jsonb_build_object(
      'session_number', 6,
      'focus', 'relationship dynamics',
      'emotional_breakthrough', true,
      'homework', 'write letter to partner'
    )
  ) ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '✓ Seeded 10 report records';
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  report_count INTEGER;
  report_types_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO report_count FROM reports WHERE deleted_at IS NULL;
  SELECT COUNT(DISTINCT type) INTO report_types_count FROM reports WHERE deleted_at IS NULL;

  RAISE NOTICE '=== REPORTS SEED DATA SUMMARY ===';
  RAISE NOTICE 'Total Reports: %', report_count;
  RAISE NOTICE 'Report Types: %', report_types_count;

  IF report_count >= 10 THEN
    RAISE NOTICE '✓ All report demo data seeded successfully!';
  ELSE
    RAISE WARNING '⚠ Some report demo data may be missing';
  END IF;
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✓ 10 realistische rapportages created:
--   COLIN LIT (Depressie):
--     - Intake behandeladvies met uitgebreide DSM classificatie
--     - 2 Behandelsessie notities
--     - Crisis interventie notitie
--     - Voortgangsrapportage na 8 sessies
--
--   JAN DE VRIESH (Angststoornis):
--     - Intake behandeladvies met ACT behandelplan
--     - Behandelsessie ACT mindfulness
--     - Uitgebreide relatiedynamiek sessie
--
--   OPTIMUS PRIME (Diagnostiek - Easter egg):
--     - Uitgebreid diagnostisch rapport
--     - Follow-up observatie notitie
--
-- USE CASES voor AI Samenvatting:
-- ✓ Verschillende lengtes (kort tot zeer uitgebreid)
-- ✓ Verschillende types (behandeladvies vs vrije_notitie)
-- ✓ Verschillende patiënten en problematiek
-- ✓ ROM scores en gestructureerde data
-- ✓ AI confidence scores voor ML training
-- ✓ Realistische klinische taal en structuur
--
-- Perfect voor demonstratie van:
-- - AI samenvatting per patiënt
-- - Extractie van behandelplannen
-- - Timeline visualisatie
-- - ROM score tracking
-- - Classificatie behandeladvies vs notitie
-- ============================================================================
