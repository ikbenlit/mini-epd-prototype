# Technisch Ontwerp (TO) - Verpleegkundige Overdracht Dashboard

**Projectnaam:** Verpleegkundige Overdracht Dashboard
**Versie:** v1.0
**Datum:** 05-12-2024
**Auteur:** Claude (AI-assisted)

---

## 1. Doel en relatie met PRD en FO

**Doel van dit document:**
Dit Technisch Ontwerp beschrijft **hoe** het Overdracht Dashboard technisch wordt gebouwd. Het vertaalt de functionele specificaties uit FO v1.1 naar concrete technische implementatie.

**Relatie met andere documenten:**
- PRD: `prd-overdracht-dashboard-v1.md` - wat en waarom
- FO: `fo-overdracht-dashboard-v1.1.md` - hoe functioneel
- TO: dit document - hoe technisch

**Technische haalbaarheidsanalyse:**
| Aspect | Status | Toelichting |
|--------|--------|-------------|
| Database tabellen | Deels aanwezig | patients, encounters, observations, reports, risk_assessments, conditions aanwezig. nursing_logs moet worden toegevoegd |
| Frontend framework | Aanwezig | Next.js 15 App Router met EPD layout |
| UI componenten | Aanwezig | shadcn/ui (Card, Button, Badge, Dialog, etc.) |
| AI integratie | Aanwezig | Claude API via behandelplan/generate pattern |
| Authentication | Aanwezig | Supabase Auth met RLS |

---

## 2. Technische Architectuur Overzicht

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js 15)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  /epd/overdracht/           /epd/dagregistratie/[patientId]         │
│  ├── page.tsx               ├── page.tsx                             │
│  │   (Overzicht Grid)       │   (Dagregistratie Module)              │
│  │                          │                                        │
│  └── [patientId]/           └── components/                          │
│      └── page.tsx               ├── log-list.tsx                     │
│          (Patiënt Detail)       ├── log-form.tsx                     │
│                                 └── log-card.tsx                     │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                         API Routes (Next.js)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  /api/overdracht/                                                    │
│  ├── patients/route.ts      GET - Patiënten voor vandaag            │
│  ├── [patientId]/route.ts   GET - Detail data voor patiënt          │
│  └── generate/route.ts      POST - AI samenvatting genereren        │
│                                                                      │
│  /api/nursing-logs/                                                  │
│  ├── route.ts               GET/POST - CRUD nursing logs            │
│  └── [logId]/route.ts       PATCH/DELETE - Update/delete log        │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                         Database (Supabase)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Bestaand:                   Nieuw:                                  │
│  ├── patients               ├── nursing_logs                        │
│  ├── encounters             │                                        │
│  ├── observations           │                                        │
│  ├── reports                │                                        │
│  ├── risk_assessments       │                                        │
│  ├── conditions             │                                        │
│  ├── intakes                │                                        │
│  └── ai_events              │                                        │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                         External Services                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Claude API (Anthropic)     AI samenvatting generatie                │
│  Supabase Auth              Session-based authentication             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Techstack Selectie

| Component | Technologie | Argumentatie | Bestaand |
|-----------|-------------|--------------|----------|
| Frontend | Next.js 15 (App Router) | Bestaande codebase, SSR, TypeScript | Ja |
| Backend | Next.js API Routes | Co-located met frontend | Ja |
| Database | Supabase (PostgreSQL) | Realtime, auth included, RLS | Ja |
| AI | Claude claude-sonnet-4-20250514 | Bestaande integratie, Nederlands | Ja |
| Styling | TailwindCSS + shadcn/ui | Bestaande componenten | Ja |
| Validation | Zod | Type-safe validatie, bestaand pattern | Ja |
| State | React Server Components + Client | Minimale client state | Ja |

---

## 4. Datamodel

### 4.1 Nieuwe Tabel: nursing_logs

```sql
-- Migratie: create_nursing_logs_table
CREATE TABLE public.nursing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Timing
  shift_date DATE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Content
  category TEXT NOT NULL CHECK (category IN (
    'medicatie', 'adl', 'gedrag', 'incident', 'observatie'
  )),
  content TEXT NOT NULL CHECK (char_length(content) <= 500),

  -- Overdracht markering
  include_in_handover BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes voor performance
CREATE INDEX idx_nursing_logs_patient ON nursing_logs(patient_id);
CREATE INDEX idx_nursing_logs_shift ON nursing_logs(shift_date);
CREATE INDEX idx_nursing_logs_handover ON nursing_logs(patient_id, include_in_handover)
  WHERE include_in_handover = true;
CREATE INDEX idx_nursing_logs_timestamp ON nursing_logs(patient_id, timestamp DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_nursing_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER nursing_logs_updated_at
  BEFORE UPDATE ON nursing_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_nursing_logs_updated_at();

-- Comments
COMMENT ON TABLE nursing_logs IS
  'Operationele verpleegkundige dagregistraties - kort, snel, met overdracht-markering';
COMMENT ON COLUMN nursing_logs.shift_date IS
  'Datum van de dienst (voor filtering per dag)';
COMMENT ON COLUMN nursing_logs.include_in_handover IS
  'True als deze notitie relevant is voor overdracht';
```

### 4.2 RLS Policies voor nursing_logs

```sql
-- Enable RLS
ALTER TABLE nursing_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users kunnen lezen
CREATE POLICY "nursing_logs_select_authenticated" ON nursing_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users kunnen inserten
CREATE POLICY "nursing_logs_insert_authenticated" ON nursing_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Policy: Eigen logs kunnen updaten
CREATE POLICY "nursing_logs_update_own" ON nursing_logs
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Policy: Eigen logs kunnen deleten
CREATE POLICY "nursing_logs_delete_own" ON nursing_logs
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());
```

### 4.3 TypeScript Types

```typescript
// lib/types/nursing-log.ts

import { z } from 'zod';

export const NursingLogCategory = z.enum([
  'medicatie',
  'adl',
  'gedrag',
  'incident',
  'observatie'
]);

export type NursingLogCategory = z.infer<typeof NursingLogCategory>;

export const NursingLogSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  shift_date: z.string(), // ISO date
  timestamp: z.string(), // ISO datetime
  category: NursingLogCategory,
  content: z.string().min(1).max(500),
  include_in_handover: z.boolean(),
  created_by: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type NursingLog = z.infer<typeof NursingLogSchema>;

export const CreateNursingLogSchema = z.object({
  patient_id: z.string().uuid(),
  category: NursingLogCategory,
  content: z.string().min(1).max(500),
  timestamp: z.string().optional(), // Default: now
  include_in_handover: z.boolean().default(false),
});

export type CreateNursingLog = z.infer<typeof CreateNursingLogSchema>;

export const UpdateNursingLogSchema = z.object({
  category: NursingLogCategory.optional(),
  content: z.string().min(1).max(500).optional(),
  timestamp: z.string().optional(),
  include_in_handover: z.boolean().optional(),
});

export type UpdateNursingLog = z.infer<typeof UpdateNursingLogSchema>;

// Category display mapping
export const CATEGORY_CONFIG: Record<NursingLogCategory, {
  label: string;
  icon: string;
  color: string;
}> = {
  medicatie: { label: 'Medicatie', icon: 'Pill', color: 'blue' },
  adl: { label: 'ADL/verzorging', icon: 'Utensils', color: 'green' },
  gedrag: { label: 'Gedragsobservatie', icon: 'User', color: 'purple' },
  incident: { label: 'Incident', icon: 'AlertTriangle', color: 'red' },
  observatie: { label: 'Algemene observatie', icon: 'FileText', color: 'gray' },
};
```

### 4.4 Bestaande Tabellen (queries)

```typescript
// Overdracht context queries

// 1. Patiënten voor vandaag (via actieve encounters)
const patientsToday = supabase
  .from('encounters')
  .select(`
    patient_id,
    patients!inner (
      id, name_given, name_family, birth_date, gender
    )
  `)
  .gte('period_start', todayStart)
  .lte('period_start', todayEnd)
  .in('status', ['planned', 'in-progress']);

// 2. Vitale functies (observations) vandaag
const vitalsToday = supabase
  .from('observations')
  .select('*')
  .eq('patient_id', patientId)
  .eq('category', 'vital-signs')
  .gte('effective_datetime', todayStart)
  .order('effective_datetime', { ascending: false });

// 3. Rapportages laatste 24 uur
const reportsLast24h = supabase
  .from('reports')
  .select('*')
  .eq('patient_id', patientId)
  .gte('created_at', last24h)
  .is('deleted_at', null)
  .order('created_at', { ascending: false });

// 4. Actieve risico's (via intake)
const activeRisks = supabase
  .from('risk_assessments')
  .select(`
    *,
    intakes!inner (patient_id)
  `)
  .eq('intakes.patient_id', patientId)
  .in('risk_level', ['hoog', 'zeer_hoog', 'gemiddeld']);

// 5. Actieve diagnoses
const activeConditions = supabase
  .from('conditions')
  .select('*')
  .eq('patient_id', patientId)
  .eq('clinical_status', 'active');
```

---

## 5. API Ontwerp

### 5.1 Overdracht Endpoints

| Endpoint | Method | Input | Output | Auth |
|----------|--------|-------|--------|------|
| `/api/overdracht/patients` | GET | `?date=YYYY-MM-DD` | `PatientOverzicht[]` | Required |
| `/api/overdracht/[patientId]` | GET | - | `PatientDetail` | Required |
| `/api/overdracht/generate` | POST | `{ patientId }` | `AISamenvatting` | Required |

### 5.2 Nursing Logs Endpoints

| Endpoint | Method | Input | Output | Auth |
|----------|--------|-------|--------|------|
| `/api/nursing-logs` | GET | `?patientId&date` | `NursingLog[]` | Required |
| `/api/nursing-logs` | POST | `CreateNursingLog` | `NursingLog` | Required |
| `/api/nursing-logs/[logId]` | PATCH | `UpdateNursingLog` | `NursingLog` | Required |
| `/api/nursing-logs/[logId]` | DELETE | - | `204` | Required |

### 5.3 Response Types

```typescript
// lib/types/overdracht.ts

// Patiënt overzicht (lijst view)
export interface PatientOverzicht {
  id: string;
  name_given: string[];
  name_family: string;
  birth_date: string;
  gender: string;
  alerts: {
    high_risk_count: number;
    abnormal_vitals_count: number;
    marked_logs_count: number;
  };
}

// Patiënt detail (detail view)
export interface PatientDetail {
  patient: {
    id: string;
    name_given: string[];
    name_family: string;
    name_prefix?: string;
    birth_date: string;
    gender: string;
  };
  vitals: VitalSign[];
  reports: Report[];
  nursingLogs: NursingLog[];
  risks: RiskAssessment[];
  conditions: Condition[];
}

// Vitale functie met interpretatie
export interface VitalSign {
  id: string;
  code_display: string;
  value_quantity_value: number;
  value_quantity_unit: string;
  interpretation_code?: string; // 'H' | 'L' | 'N'
  effective_datetime: string;
  source_id: string;
}

// AI Samenvatting output
export interface AISamenvatting {
  samenvatting: string;
  aandachtspunten: Aandachtspunt[];
  actiepunten: string[];
  generatedAt: string;
  durationMs: number;
}

export interface Aandachtspunt {
  tekst: string;
  urgent: boolean;
  bron: {
    type: 'observatie' | 'rapportage' | 'dagnotitie' | 'risico';
    id: string;
    datum: string;
    label: string;
  };
}
```

---

## 6. AI Integratie

### 6.1 AI Overdracht Generator

**Locatie:** `/api/overdracht/generate/route.ts`

**Pattern:** Gebaseerd op bestaande `behandelplan/generate` implementatie.

```typescript
// lib/ai/overdracht-prompt.ts

export const OVERDRACHT_SYSTEM_PROMPT = `Je bent een ervaren verpleegkundige die overdrachten maakt in een GGZ-instelling.

Je taak: Maak een beknopte, relevante overdracht voor de opvolgende dienst.

## Outputformaat (JSON)
{
  "samenvatting": "1-2 zinnen over de patiënt en wat er speelt",
  "aandachtspunten": [
    {
      "tekst": "Beschrijving van het aandachtspunt",
      "urgent": true/false,
      "bron": {
        "type": "observatie|rapportage|dagnotitie|risico",
        "id": "source-id",
        "datum": "DD-MM-YYYY HH:mm",
        "label": "Korte beschrijving bron"
      }
    }
  ],
  "actiepunten": [
    "Concrete actie voor opvolgende dienst"
  ]
}

## Regels
1. Taal: Nederlands, zakelijk, beknopt
2. Focus op: veranderingen, afwijkingen, aandachtspunten
3. Elke aandachtspunt MOET een bronverwijzing hebben
4. Maximum 5 aandachtspunten, 3 actiepunten
5. Markeer urgent=true voor:
   - Medicatie-weigering
   - Incidenten
   - Sterk afwijkende vitals
   - Hoog-risico situaties
`;

export function buildOverdrachtUserPrompt(context: OverdrachtContext): string {
  const lines: string[] = [
    `PATIENT: ${context.patientName}, ${context.age} jaar, ${context.gender}`,
    '',
    'DIAGNOSES:',
    ...context.conditions.map(c =>
      `- ${c.code_display} (source: conditions/${c.id})`
    ),
    '',
    'VITALE FUNCTIES (vandaag):',
    ...context.vitals.map(v =>
      `- ${v.code_display}: ${v.value_quantity_value} ${v.value_quantity_unit} ` +
      `[${interpretationLabel(v.interpretation_code)}] ` +
      `(source: observations/${v.id}, ${formatTime(v.effective_datetime)})`
    ),
    '',
    'RAPPORTAGES (laatste 24u):',
    ...context.reports.map(r =>
      `- [${formatTime(r.created_at)}] ${r.type}: "${truncate(r.content, 200)}" ` +
      `(source: reports/${r.id})`
    ),
    '',
    'DAGREGISTRATIES (relevant voor overdracht):',
    ...context.nursingLogs.map(l =>
      `- [${formatTime(l.timestamp)}] [${l.category.toUpperCase()}] ${l.content} ` +
      `(source: nursing_logs/${l.id})`
    ),
    '',
    'RISICOS:',
    ...context.risks.map(r =>
      `- [${r.risk_level.toUpperCase()}] ${r.risk_type}: "${truncate(r.rationale, 150)}" ` +
      `(source: risk_assessments/${r.id})`
    ),
  ];

  return lines.join('\n');
}
```

### 6.2 AI Event Logging

```typescript
// Uitbreiding ai_events.kind enum
// Voeg toe: 'overdracht_generate'

await supabase.from('ai_events').insert({
  kind: 'overdracht_generate',
  patient_id: patientId,
  request: {
    vitalCount: context.vitals.length,
    reportCount: context.reports.length,
    logCount: context.nursingLogs.length,
    riskCount: context.risks.length,
  },
  response: {
    aandachtspuntenCount: result.aandachtspunten.length,
    actiepuntenCount: result.actiepunten.length,
    urgentCount: result.aandachtspunten.filter(a => a.urgent).length,
  },
  duration_ms: durationMs,
});
```

---

## 7. Frontend Componenten

### 7.1 Nieuwe Routes

```
app/epd/
├── overdracht/
│   ├── page.tsx                    # Overzicht grid
│   ├── [patientId]/
│   │   └── page.tsx                # Patiënt detail
│   └── components/
│       ├── patient-card.tsx        # Card in overzicht grid
│       ├── vitals-block.tsx        # Vitale functies blok
│       ├── reports-block.tsx       # Rapportages blok
│       ├── nursing-logs-block.tsx  # Dagnotities blok
│       ├── risks-block.tsx         # Risico's blok
│       └── ai-summary-block.tsx    # AI samenvatting blok
│
└── dagregistratie/
    └── [patientId]/
        ├── page.tsx                # Dagregistratie module
        └── components/
            ├── log-list.tsx        # Lijst van notities
            ├── log-form.tsx        # Quick entry form
            └── log-card.tsx        # Individuele notitie card
```

### 7.2 Component Hergebruik

| Nieuw Component | Hergebruik van | Locatie |
|-----------------|----------------|---------|
| patient-card.tsx | Card (shadcn), Badge | components/ui/ |
| ai-summary-block.tsx | AIButton pattern | behandelplan/ |
| log-form.tsx | Form patterns | screening/activity-log.tsx |
| risks-block.tsx | Card, Badge | intakes/risk/ |

### 7.3 Sidebar Uitbreiding

```typescript
// app/epd/components/epd-sidebar.tsx
// Voeg toe aan navigatie items:

{
  title: 'Overdracht',
  href: '/epd/overdracht',
  icon: ClipboardList,
  badge: alertCount > 0 ? alertCount : undefined,
},
```

---

## 8. Security & Compliance

### 8.1 Authentication Flow

```
User Request
    │
    ▼
┌─────────────────┐
│ Supabase Auth   │ ← Session cookie
│ (JWT validation)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ RLS Policies    │ ← auth.uid() check
│ (Row filtering) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ API Response    │
└─────────────────┘
```

### 8.2 Security Checklist

- [x] **Authentication:** Supabase Auth (bestaand)
- [x] **Authorization:** RLS policies op nursing_logs
- [x] **Data Encryption:** PostgreSQL at rest, HTTPS in transit
- [x] **Input Validation:** Zod schemas op alle endpoints
- [x] **CORS:** Via Next.js middleware (bestaand)
- [x] **Audit Trail:** ai_events tabel voor AI calls

### 8.3 AVG/GDPR Compliance

- **Data minimalisatie:** nursing_logs max 500 chars
- **Retention:** nursing_logs cleanup na 30 dagen (fase 2)
- **Audit:** created_by tracking op alle records
- **Access logging:** Via Supabase logs

---

## 9. Performance & Scalability

### 9.1 Performance Targets

| Metric | Target | Implementatie |
|--------|--------|---------------|
| Overzicht load | < 2s | Parallel queries, index op encounters |
| Detail load | < 1.5s | Batch queries via Promise.all() |
| Log submit | < 500ms | Direct insert, optimistic UI |
| AI response | < 5s | Claude claude-sonnet-4-20250514, max_tokens=2048 |

### 9.2 Database Indexes

```sql
-- Bestaande indexes (verificatie)
CREATE INDEX IF NOT EXISTS idx_encounters_period ON encounters(period_start);
CREATE INDEX IF NOT EXISTS idx_observations_patient_datetime ON observations(patient_id, effective_datetime DESC);
CREATE INDEX IF NOT EXISTS idx_reports_patient_created ON reports(patient_id, created_at DESC);

-- Nieuwe indexes voor overdracht
CREATE INDEX idx_nursing_logs_patient ON nursing_logs(patient_id);
CREATE INDEX idx_nursing_logs_shift ON nursing_logs(shift_date);
CREATE INDEX idx_nursing_logs_handover ON nursing_logs(patient_id, include_in_handover)
  WHERE include_in_handover = true;
```

### 9.3 Query Optimalisatie

```typescript
// Parallelle queries voor detail pagina
export async function getPatientDetail(patientId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: patient },
    { data: vitals },
    { data: reports },
    { data: nursingLogs },
    { data: risks },
    { data: conditions },
  ] = await Promise.all([
    supabase.from('patients').select('*').eq('id', patientId).single(),
    supabase.from('observations')
      .select('*')
      .eq('patient_id', patientId)
      .eq('category', 'vital-signs')
      .gte('effective_datetime', today)
      .order('effective_datetime', { ascending: false }),
    supabase.from('reports')
      .select('*')
      .eq('patient_id', patientId)
      .gte('created_at', last24h)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    supabase.from('nursing_logs')
      .select('*')
      .eq('patient_id', patientId)
      .eq('shift_date', today)
      .order('timestamp', { ascending: false }),
    // Risks via intakes join
    supabase.from('risk_assessments')
      .select('*, intakes!inner(patient_id)')
      .eq('intakes.patient_id', patientId),
    supabase.from('conditions')
      .select('*')
      .eq('patient_id', patientId)
      .eq('clinical_status', 'active'),
  ]);

  return { patient, vitals, reports, nursingLogs, risks, conditions };
}
```

---

## 10. Deployment & Implementatie

### 10.1 Implementatie Volgorde

```
Fase 1: Database (1 migratie)
├── nursing_logs tabel
├── RLS policies
└── Indexes

Fase 2: API Routes
├── /api/nursing-logs (CRUD)
├── /api/overdracht/patients
├── /api/overdracht/[patientId]
└── /api/overdracht/generate

Fase 3: Frontend - Dagregistratie
├── /epd/dagregistratie/[patientId]/page.tsx
├── Log form component
└── Log list component

Fase 4: Frontend - Overdracht
├── /epd/overdracht/page.tsx
├── /epd/overdracht/[patientId]/page.tsx
├── Info blokken (vitals, reports, logs, risks)
└── AI samenvatting blok

Fase 5: Integratie
├── Sidebar link toevoegen
├── AI prompt refinement
└── Testing & polish
```

### 10.2 Migratie Commands

```bash
# Database migratie
npx supabase migration new create_nursing_logs_table

# TypeScript types regenereren
npx supabase gen types typescript --linked > lib/supabase/database.types.ts
```

---

## 11. Monitoring & Logging

### 11.1 Key Metrics

| Metric | Doel | Bron |
|--------|------|------|
| AI success rate | > 95% | ai_events.kind = 'overdracht_generate' |
| Avg AI duration | < 5s | ai_events.duration_ms |
| Log creations/day | Tracking | nursing_logs.created_at |
| Handover marks % | Tracking | nursing_logs.include_in_handover |

### 11.2 Error Tracking

```typescript
// Sentry error context (bestaand pattern)
Sentry.setContext('overdracht', {
  patientId,
  vitalCount: vitals.length,
  reportCount: reports.length,
  logCount: nursingLogs.length,
});
```

---

## 12. Risico's & Technische Mitigatie

| Risico | Impact | Waarschijnlijkheid | Mitigatie |
|--------|--------|-------------------|-----------|
| Claude API down | Hoog | Laag | Graceful error, toon data zonder AI |
| Veel patiënten (>50) | Middel | Middel | Pagination in overzicht, lazy loading |
| Lege data (geen vitals) | Laag | Hoog | Empty states per blok, instructieve tekst |
| AI hallucinaties | Hoog | Laag | Bronverwijzingen verplicht, validatie |
| Performance nursing_logs | Middel | Laag | Indexes, 30-dagen cleanup (fase 2) |

---

## 13. Bijlagen & Referenties

### 13.1 Projectdocumenten

| Document | Status |
|----------|--------|
| PRD Overdracht Dashboard v1.0 | Gereed |
| FO Overdracht Dashboard v1.1 | Gereed |
| TO Overdracht Dashboard v1.0 | Gereed (dit document) |

### 13.2 Code Locaties

| Wat | Locatie |
|-----|---------|
| AI prompt pattern | `lib/ai/behandelplan-prompt.ts` |
| API route pattern | `app/api/reports/route.ts` |
| shadcn components | `components/ui/` |
| Supabase client | `lib/auth/server.ts` |
| Database types | `lib/supabase/database.types.ts` |

### 13.3 Externe Documentatie

| Bron | URL |
|------|-----|
| Next.js App Router | https://nextjs.org/docs/app |
| Supabase RLS | https://supabase.com/docs/guides/auth/row-level-security |
| Claude API | https://docs.anthropic.com/en/api |
| shadcn/ui | https://ui.shadcn.com |

---

## Changelog

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 05-12-2024 | Claude | Initieel TO gebaseerd op FO v1.1 |

---

**Einde Technisch Ontwerp - Overdracht Dashboard v1.0**
