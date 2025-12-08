# Seed Data: Verpleegkundige Notities

Handmatig verpleegkundige notities toevoegen aan de database via SQL.

## Stap 1: Patient ID opzoeken

Zoek eerst de UUID van de patient:

```sql
SELECT id, name_given, name_family
FROM patients
WHERE name_family ILIKE '%achternaam%'
ORDER BY name_family;
```

## Stap 2: Notities invoegen

### Beschikbare categorieën

| Categorie | Beschrijving |
|-----------|--------------|
| `medicatie` | Medicatie gerelateerde notities |
| `adl` | ADL/verzorging (eten, wassen, etc.) |
| `gedrag` | Gedragsobservaties |
| `incident` | Incidenten en ongewenste gebeurtenissen |
| `observatie` | Algemene observaties |

### SQL Template

Vervang `'PATIENT_UUID_HIER'` met de gevonden patient ID:

```sql
-- Verpleegkundige notities voor een patient
INSERT INTO reports (patient_id, type, content, structured_data, include_in_handover, shift_date, created_at)
VALUES
  -- Medicatie notitie
  ('PATIENT_UUID_HIER', 'verpleegkundig',
   'Medicatie uitgereikt om 08:00. Patient nam zonder problemen in.',
   '{"category": "medicatie"}', false, CURRENT_DATE, NOW()),

  -- ADL notitie
  ('PATIENT_UUID_HIER', 'verpleegkundig',
   'Geholpen met ochtendzorg. Zelfstandig tanden gepoetst.',
   '{"category": "adl"}', false, CURRENT_DATE, NOW()),

  -- Gedragsobservatie
  ('PATIENT_UUID_HIER', 'verpleegkundig',
   'Rustige ochtend. Patient las de krant in de huiskamer.',
   '{"category": "gedrag"}', false, CURRENT_DATE, NOW()),

  -- Incident
  ('PATIENT_UUID_HIER', 'verpleegkundig',
   'Licht gestruikeld bij opstaan uit stoel. Geen letsel. Valrisico besproken.',
   '{"category": "incident"}', true, CURRENT_DATE, NOW()),

  -- Algemene observatie (voor overdracht)
  ('PATIENT_UUID_HIER', 'verpleegkundig',
   'Sliep onrustig vannacht. Klaagt over hoofdpijn. Arts informeren.',
   '{"category": "observatie"}', true, CURRENT_DATE, NOW());
```

### Met specifieke tijdstippen

```sql
INSERT INTO reports (patient_id, type, content, structured_data, include_in_handover, shift_date, created_at)
VALUES
  -- Nachtdienst (voor 07:00 = vorige dag shift_date)
  ('PATIENT_UUID_HIER', 'verpleegkundig',
   'Twee keer wakker geworden. Om 03:00 toiletgang, om 05:30 onrustig.',
   '{"category": "observatie"}', true,
   CURRENT_DATE - INTERVAL '1 day',  -- shift_date = gisteren
   CURRENT_DATE + TIME '05:30'),     -- created_at = vandaag 05:30

  -- Ochtend
  ('PATIENT_UUID_HIER', 'verpleegkundig',
   'Ontbijt goed gegeten. Koffie met melk.',
   '{"category": "adl"}', false, CURRENT_DATE, CURRENT_DATE + TIME '08:30'),

  -- Middag
  ('PATIENT_UUID_HIER', 'verpleegkundig',
   'Bezoek van dochter. Positieve stemming.',
   '{"category": "gedrag"}', false, CURRENT_DATE, CURRENT_DATE + TIME '14:00'),

  -- Avond
  ('PATIENT_UUID_HIER', 'verpleegkundig',
   'Avondmedicatie gegeven. Slaapmedicatie om 21:00.',
   '{"category": "medicatie"}', true, CURRENT_DATE, CURRENT_DATE + TIME '21:00');
```

## Velden uitleg

| Veld | Waarde | Toelichting |
|------|--------|-------------|
| `type` | `'verpleegkundig'` | Altijd deze waarde voor korte notities |
| `content` | string (1-500 tekens) | De notitie tekst |
| `structured_data` | `'{"category": "..."}'` | JSON met categorie |
| `include_in_handover` | `true/false` | Tonen in overdracht |
| `shift_date` | `CURRENT_DATE` | Dienstdatum (voor 07:00 = vorige dag) |
| `created_at` | `NOW()` | Aanmaaktijd |

## Voorbeelddata per categorie

### Medicatie voorbeelden
```sql
('PATIENT_UUID', 'verpleegkundig', 'Paracetamol 500mg gegeven om 10:00 i.v.m. hoofdpijn.', '{"category": "medicatie"}', false, CURRENT_DATE, NOW()),
('PATIENT_UUID', 'verpleegkundig', 'PRN lorazepam geweigerd. Patient wilde eerst ontspanningsoefeningen proberen.', '{"category": "medicatie"}', true, CURRENT_DATE, NOW()),
('PATIENT_UUID', 'verpleegkundig', 'Insuline toegediend voor avondeten. BG: 8.2 mmol/L.', '{"category": "medicatie"}', false, CURRENT_DATE, NOW())
```

### ADL voorbeelden
```sql
('PATIENT_UUID', 'verpleegkundig', 'Volledig geholpen met douchen. Huid intact, geen bijzonderheden.', '{"category": "adl"}', false, CURRENT_DATE, NOW()),
('PATIENT_UUID', 'verpleegkundig', 'Lunch: halve boterham gegeten, 1 kopje soep. Eetlust matig.', '{"category": "adl"}', true, CURRENT_DATE, NOW()),
('PATIENT_UUID', 'verpleegkundig', 'Continentie: 1x incontinent voor urine. Verschoond.', '{"category": "adl"}', false, CURRENT_DATE, NOW())
```

### Gedrag voorbeelden
```sql
('PATIENT_UUID', 'verpleegkundig', 'Goede dag. Actief deelgenomen aan groepsactiviteit.', '{"category": "gedrag"}', false, CURRENT_DATE, NOW()),
('PATIENT_UUID', 'verpleegkundig', 'Teruggetrokken gedrag. Wil op kamer blijven. Gesprek aangeboden.', '{"category": "gedrag"}', true, CURRENT_DATE, NOW()),
('PATIENT_UUID', 'verpleegkundig', 'Conflict met medebewoner over TV. Situatie de-escaleerd door afleiding.', '{"category": "gedrag"}', true, CURRENT_DATE, NOW())
```

### Incident voorbeelden
```sql
('PATIENT_UUID', 'verpleegkundig', 'Val uit bed om 04:00. Geen zichtbaar letsel. Arts geinformeerd.', '{"category": "incident"}', true, CURRENT_DATE, NOW()),
('PATIENT_UUID', 'verpleegkundig', 'Agressief gedrag richting personeel. Time-out op kamer. Gesprek na 30 min.', '{"category": "incident"}', true, CURRENT_DATE, NOW()),
('PATIENT_UUID', 'verpleegkundig', 'Verslikking tijdens eten. Heimlich niet nodig, spontaan uitgekucht.', '{"category": "incident"}', true, CURRENT_DATE, NOW())
```

### Observatie voorbeelden
```sql
('PATIENT_UUID', 'verpleegkundig', 'Temperatuur 37.8. Licht verhoogd. Monitoren.', '{"category": "observatie"}', true, CURRENT_DATE, NOW()),
('PATIENT_UUID', 'verpleegkundig', 'Zuurstof saturatie stabiel: 96% op kamerlucht.', '{"category": "observatie"}', false, CURRENT_DATE, NOW()),
('PATIENT_UUID', 'verpleegkundig', 'Nieuwe rode plek op stuit. Decubitus preventie protocol gestart.', '{"category": "observatie"}', true, CURRENT_DATE, NOW())
```

## Alles verwijderen voor een patient

```sql
-- Soft delete (aanbevolen)
UPDATE reports
SET deleted_at = NOW()
WHERE patient_id = 'PATIENT_UUID'
  AND type = 'verpleegkundig';

-- Hard delete (definitief)
DELETE FROM reports
WHERE patient_id = 'PATIENT_UUID'
  AND type = 'verpleegkundig';
```

---

## Kant-en-klare seed data (Colin Lit & Jan de Vriesh)

Kopieer onderstaande SQL en voer uit in Supabase SQL Editor.
**Let op:** Vervang de UUIDs eerst met de juiste waarden uit je database.

```sql
-- Seed data voor Colin Lit en Jan de Vriesh (afgelopen week)
-- Kopieer en plak direct in Supabase SQL Editor

INSERT INTO reports (patient_id, type, content, structured_data, include_in_handover, shift_date, created_at)
VALUES
  -- ═══════════════════════════════════════════════════════════════════════════
  -- COLIN LIT (f3fb1396-d326-450a-9f00-d60340f25deb)
  -- ═══════════════════════════════════════════════════════════════════════════

  -- Vandaag
  ('f3fb1396-d326-450a-9f00-d60340f25deb', 'verpleegkundig',
   'Ochtendmedicatie uitgereikt. Inname zonder problemen.',
   '{"category": "medicatie"}', false, CURRENT_DATE, CURRENT_DATE + TIME '08:15'),

  ('f3fb1396-d326-450a-9f00-d60340f25deb', 'verpleegkundig',
   'Rustige ochtend. Zat in huiskamer te lezen.',
   '{"category": "gedrag"}', false, CURRENT_DATE, CURRENT_DATE + TIME '10:30'),

  -- Gisteren
  ('f3fb1396-d326-450a-9f00-d60340f25deb', 'verpleegkundig',
   'Geholpen met douchen. Huid intact, geen bijzonderheden.',
   '{"category": "adl"}', false, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day' + TIME '09:00'),

  ('f3fb1396-d326-450a-9f00-d60340f25deb', 'verpleegkundig',
   'Klaagt over slecht slapen. Piekert veel. Gesprek aangeboden.',
   '{"category": "observatie"}', true, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day' + TIME '14:30'),

  ('f3fb1396-d326-450a-9f00-d60340f25deb', 'verpleegkundig',
   'Avondmedicatie gegeven incl. slaapmedicatie.',
   '{"category": "medicatie"}', false, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day' + TIME '21:00'),

  -- 3 dagen geleden
  ('f3fb1396-d326-450a-9f00-d60340f25deb', 'verpleegkundig',
   'Goede dag gehad. Deelgenomen aan groepsactiviteit.',
   '{"category": "gedrag"}', false, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '3 days' + TIME '16:00'),

  ('f3fb1396-d326-450a-9f00-d60340f25deb', 'verpleegkundig',
   'Lunch volledig opgegeten. Eetlust lijkt verbeterd.',
   '{"category": "adl"}', false, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '3 days' + TIME '12:30'),

  -- 5 dagen geleden
  ('f3fb1396-d326-450a-9f00-d60340f25deb', 'verpleegkundig',
   'Somber vanmorgen. Wilde niet uit bed komen. Na gesprek toch opgestaan.',
   '{"category": "gedrag"}', true, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '5 days' + TIME '09:30'),

  ('f3fb1396-d326-450a-9f00-d60340f25deb', 'verpleegkundig',
   'Paracetamol gegeven i.v.m. hoofdpijn.',
   '{"category": "medicatie"}', false, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '5 days' + TIME '11:00'),

  -- 6 dagen geleden
  ('f3fb1396-d326-450a-9f00-d60340f25deb', 'verpleegkundig',
   'Bezoek van partner gehad. Positief gesprek, stemming opgeklaard.',
   '{"category": "observatie"}', false, CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE - INTERVAL '6 days' + TIME '15:00'),

  -- ═══════════════════════════════════════════════════════════════════════════
  -- JAN DE VRIESH (d16935c9-e0fe-4972-832f-175b7a38f9b9)
  -- ═══════════════════════════════════════════════════════════════════════════

  -- Vandaag
  ('d16935c9-e0fe-4972-832f-175b7a38f9b9', 'verpleegkundig',
   'Onrustige nacht. Meerdere keren wakker, piekeren over financien.',
   '{"category": "observatie"}', true, CURRENT_DATE, CURRENT_DATE + TIME '07:15'),

  ('d16935c9-e0fe-4972-832f-175b7a38f9b9', 'verpleegkundig',
   'PRN lorazepam aangeboden, geweigerd. Wil eerst ademhalingsoefeningen proberen.',
   '{"category": "medicatie"}', true, CURRENT_DATE, CURRENT_DATE + TIME '09:45'),

  -- Gisteren
  ('d16935c9-e0fe-4972-832f-175b7a38f9b9', 'verpleegkundig',
   'Teruggetrokken gedrag. Hele ochtend op kamer gebleven.',
   '{"category": "gedrag"}', true, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day' + TIME '11:00'),

  ('d16935c9-e0fe-4972-832f-175b7a38f9b9', 'verpleegkundig',
   'Halve boterham lunch. Eetlust matig.',
   '{"category": "adl"}', false, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day' + TIME '12:45'),

  -- 2 dagen geleden
  ('d16935c9-e0fe-4972-832f-175b7a38f9b9', 'verpleegkundig',
   'Gespannen tijdens groepstherapie. Eerder vertrokken.',
   '{"category": "gedrag"}', true, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '2 days' + TIME '10:30'),

  ('d16935c9-e0fe-4972-832f-175b7a38f9b9', 'verpleegkundig',
   'Avondmedicatie geweigerd, later alsnog ingenomen na gesprek.',
   '{"category": "medicatie"}', true, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '2 days' + TIME '21:30'),

  -- 4 dagen geleden
  ('d16935c9-e0fe-4972-832f-175b7a38f9b9', 'verpleegkundig',
   'Licht gestruikeld in gang. Geen letsel. Was duizelig, bloeddruk gecontroleerd: 118/72.',
   '{"category": "incident"}', true, CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE - INTERVAL '4 days' + TIME '14:00'),

  ('d16935c9-e0fe-4972-832f-175b7a38f9b9', 'verpleegkundig',
   'Na incident rustiger. Middagdutje gedaan.',
   '{"category": "observatie"}', false, CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE - INTERVAL '4 days' + TIME '16:30'),

  -- 5 dagen geleden
  ('d16935c9-e0fe-4972-832f-175b7a38f9b9', 'verpleegkundig',
   'Goede dag. Wandeling gemaakt op terrein met begeleiding.',
   '{"category": "gedrag"}', false, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '5 days' + TIME '11:00'),

  ('d16935c9-e0fe-4972-832f-175b7a38f9b9', 'verpleegkundig',
   'Zelfstandig gedoucht. Compliment gegeven voor zelfstandigheid.',
   '{"category": "adl"}', false, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '5 days' + TIME '08:30'),

  -- 7 dagen geleden
  ('d16935c9-e0fe-4972-832f-175b7a38f9b9', 'verpleegkundig',
   'Intake gesprek met nieuwe psychiater gehad. Medicatie wordt geevalueerd.',
   '{"category": "observatie"}', true, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '7 days' + TIME '10:00');
```

### Snelle opschoning (indien nodig)

```sql
-- Verwijder alle seed notities van afgelopen week
UPDATE reports
SET deleted_at = NOW()
WHERE type = 'verpleegkundig'
  AND created_at >= CURRENT_DATE - INTERVAL '7 days';
```

---

**Tip:** Voer SQL uit via Supabase Dashboard > SQL Editor of via `psql`.
