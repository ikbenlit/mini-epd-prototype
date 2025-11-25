# Reports Seed Data Documentatie

Deze documentatie beschrijft hoe je testdata voor rapportages kunt inladen om AI-samenvattingsfunctionaliteit te demonstreren.

## Overzicht

De seed data bevat **10 realistische rapportages** verdeeld over 3 patiënten:

### Patiënten & Rapportages

#### 1. Colin Lit - Depressie Behandeling (5 rapportages)
- **Intake behandeladvies** - Uitgebreide intake met DSM classificatie, ROM scores en CGT behandelplan
- **Sessie 2 notitie** - Voortgang gedragsactivatie
- **Sessie 4 notitie** - Significante vooruitgang, PHQ-9 verbeterd
- **Crisis interventie** - Tussentijds telefonisch contact
- **Voortgangsrapportage** - Evaluatie na 8 sessies met ROM vergelijking

**Gebruik voor demonstratie:**
- Timeline visualisatie van behandelverloop
- ROM score tracking (PHQ-9: 14 → 6)
- Behandeleffectiviteit analyse
- Crisis moment herkenning

#### 2. Jan de Vriesh - Angststoornis (3 rapportages)
- **Intake behandeladvies** - GAD diagnose met ACT behandelplan
- **Sessie 3 notitie** - Mindfulness en acceptance technieken
- **Sessie 6 notitie** - Uitgebreide relatiedynamiek analyse

**Gebruik voor demonstratie:**
- ACT interventie tracking
- Relationele problematiek identificatie
- Emotionele doorbraken herkennen
- Lange vorm notities samenvatten

#### 3. Optimus Prime - Diagnostiek (2 rapportages) 🤖
- **Diagnostisch rapport** - Uitgebreid neuropsychologisch onderzoek met WAIS-IV scores
- **Follow-up notitie** - Bespreking diagnostische bevindingen

**Gebruik voor demonstratie:**
- Complexe diagnostiek samenvatten
- Test resultaten extractie
- Atypische presentaties herkennen
- Easter egg functionaliteit 😊

## Installatie Methoden

### Methode 1: SQL Migratie (Aanbevolen voor development)

```bash
# Voer de SQL migratie uit via Supabase CLI
npx supabase db push

# Of direct via psql
psql $DATABASE_URL -f supabase/migrations/20251124_seed_reports_data.sql
```

**Voordelen:**
- Snelste methode
- Idempotent (ON CONFLICT DO NOTHING)
- Onderdeel van migratie geschiedenis

### Methode 2: TypeScript Seed Script

```bash
# Zorg dat environment variables zijn ingesteld
export NEXT_PUBLIC_SUPABASE_URL="your-project-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Voer het seed script uit
pnpm tsx scripts/seed-reports.ts
```

**Voordelen:**
- Meer flexibel voor aanpassingen
- Betere error handling en feedback
- Makkelijk uit te breiden met extra logica

## Data Structuur

### Report Types

```typescript
type ReportType = 'behandeladvies' | 'vrije_notitie';
```

- **behandeladvies**: Gestructureerde rapportages met diagnoses en behandelplannen
- **vrije_notitie**: Vrije vorm sessie notities

### Structured Data Examples

#### Behandeladvies
```json
{
  "diagnosis_codes": ["F32.1", "F51.0"],
  "rom_scores": {
    "PHQ-9": 14,
    "GAD-7": 8
  },
  "treatment_plan": {
    "type": "CGT",
    "sessions": 12,
    "frequency": "wekelijks"
  }
}
```

#### Sessie Notitie
```json
{
  "session_number": 4,
  "phq9_score": 9,
  "treatment_progress": "goed"
}
```

### AI Confidence Scores

Sommige rapportages bevatten AI confidence scores voor ML training:

```typescript
{
  ai_confidence: 0.92,  // 0.0 - 1.0
  ai_reasoning: "Clearly structured intake report with treatment advice section"
}
```

## Use Cases voor AI Demonstratie

### 1. Automatische Samenvatting
```
Input: Lange rapportage (1000+ woorden)
Output: Beknopte samenvatting (200 woorden) met key points
```

### 2. ROM Score Extractie
```
Input: Behandelverloop van Colin (5 rapportages)
Output: PHQ-9 timeline: [14, -, 9, -, 6]
        Trend: Significante verbetering
```

### 3. Behandelplan Identificatie
```
Input: Intake rapportages
Output:
  - Colin: CGT, 12 sessies, wekelijks
  - Jan: ACT, 16 sessies, wekelijks
  - Optimus: Geen behandeling, consultatief
```

### 4. Rapportage Classificatie
```
Input: Rapport content
Output: Type: behandeladvies (confidence: 0.92)
```

### 5. Crisis Moment Detectie
```
Input: Alle rapportages van patiënt
Output: Crisis interventie gedetecteerd op 2024-10-28
        Severity: laag
        Actie: extra sessie gepland
```

### 6. Thematische Analyse
```
Input: Jan's rapportages
Output: Terugkerende thema's:
  - Piekeren / worry
  - Relatiedynamiek
  - Geruststelling zoeken
  - Mindfulness challenges
```

## Query Voorbeelden

### Alle rapportages voor een patiënt
```sql
SELECT
  r.*,
  p.name_given || ' ' || p.name_family as patient_name,
  pr.name_given || ' ' || pr.name_family as practitioner_name
FROM reports r
JOIN patients p ON r.patient_id = p.id
LEFT JOIN practitioners pr ON r.created_by = pr.id
WHERE p.name_family = 'Lit' AND 'Colin' = ANY(p.name_given)
ORDER BY r.created_at ASC;
```

### ROM scores over tijd
```sql
SELECT
  created_at,
  structured_data->'rom_scores' as rom_scores,
  structured_data->'session_number' as session
FROM reports
WHERE patient_id = 'colin-lit-uuid'
  AND structured_data ? 'rom_scores'
ORDER BY created_at;
```

### Behandeladvies rapportages
```sql
SELECT
  p.name_family,
  r.content,
  r.structured_data->'treatment_plan' as treatment_plan,
  r.ai_confidence
FROM reports r
JOIN patients p ON r.patient_id = p.id
WHERE r.type = 'behandeladvies'
  AND r.ai_confidence > 0.9
ORDER BY r.created_at DESC;
```

## Data Reset

Om de seed data opnieuw in te laden:

```sql
-- Verwijder bestaande reports (soft delete)
UPDATE reports
SET deleted_at = NOW()
WHERE created_at >= '2024-10-15'
  AND created_at <= '2024-11-22';

-- Of hard delete (wees voorzichtig!)
DELETE FROM reports
WHERE created_at >= '2024-10-15'
  AND created_at <= '2024-11-22';
```

Dan kun je de seed scripts opnieuw uitvoeren.

## Uitbreidingen

### Meer rapportages toevoegen

Edit `scripts/seed-reports.ts` en voeg nieuwe entries toe aan `seedReportsData`:

```typescript
{
  patient_family_name: 'Lit',
  patient_given_name: 'Colin',
  practitioner_index: 1,
  type: 'vrije_notitie',
  content: 'Nieuwe sessie notitie...',
  created_at: '2024-11-25T10:00:00Z',
  structured_data: {
    session_number: 9,
    // ... meer data
  }
}
```

### Andere patiënten

Voeg eerst nieuwe patiënt toe aan de database, en gebruik dan dezelfde structuur in het seed script.

## Troubleshooting

### "Patient not found" error
- Controleer of de seed data voor patients is geladen
- Verifieer de naam spelling (case-sensitive!)
- Check of `name_given` een array is

### "Foreign key violation" error
- Zorg dat practitioners zijn geladen (zie `20241121_seed_demo_data.sql`)
- Verifieer dat de practitioner IDs kloppen

### Duplicate key errors
- De SQL migratie gebruikt `ON CONFLICT DO NOTHING`
- Het TypeScript script zal dubbele entries overslaan
- Als je opnieuw wilt seeden, verwijder eerst de oude data

## Next Steps

Na het laden van seed data:

1. **Test de rapportage UI** - Ga naar `/epd/patients/[id]/rapportage`
2. **Implementeer AI samenvatting** - Gebruik Claude API om rapportages samen te vatten
3. **Bouw timeline visualisatie** - Toon chronologisch overzicht van behandeling
4. **ROM tracking dashboard** - Visualiseer scores over tijd
5. **Zoek functionaliteit** - Full-text search over rapportage content

## Contact & Support

Voor vragen over de seed data of uitbreidingen, zie de main project README of open een issue in het project.

---

**Created:** 2024-11-24
**Last Updated:** 2024-11-24
**Version:** 1.0
