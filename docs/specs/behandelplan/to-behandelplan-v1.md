# Technisch Ontwerp (TO) — Behandelplan Module

**Projectnaam:** Mini-EPD Prototype - AI Speedrun
**Versie:** v1.0
**Datum:** 03-12-2024
**Auteur:** Colin Lit

---

## 1. Doel en relatie met PRD en FO

**Doel van dit document:**
Dit Technisch Ontwerp beschrijft **hoe** de Behandelplan module technisch wordt gebouwd. Het PRD beschrijft het *wat*, het FO het *hoe functioneel*, en dit TO de *technische implementatie*.

**Gerelateerde documenten:**
- PRD: `prd-behandelplan-v2-final.md`
- FO: `fo-behandelplan-v1.md`
- Implementatieplan: `~/.claude/plans/effervescent-toasting-beaver.md`

**Scope:**
- Foundation first: Types → Database → Components → AI → UI
- Simple JSON API (geen streaming)
- Simpele leefgebieden visualisatie (progress bars, geen radar chart)

---

## 2. Technische Architectuur Overzicht

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js 14)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ Behandelplan    │  │ Leefgebieden    │  │ SMART Doelen                │  │
│  │ Page            │  │ Components      │  │ Components                  │  │
│  │ (Server Comp)   │  │ (Client Comp)   │  │ (Client Comp)               │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────────┬──────────────┘  │
│           │                    │                          │                  │
│           └────────────────────┴──────────────────────────┘                  │
│                                    │                                         │
│                         ┌──────────▼──────────┐                             │
│                         │   Server Actions    │                             │
│                         │   (behandelplan/    │                             │
│                         │    actions.ts)      │                             │
│                         └──────────┬──────────┘                             │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────┐
│                              API ROUTES                                      │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐  │
│  │                    /api/behandelplan/generate                          │  │
│  │                         (POST - AI Generation)                         │  │
│  └─────────────────────────────────┬─────────────────────────────────────┘  │
│                                    │                                         │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐  │
│  │                    /api/behandelplan/regenerate-section                │  │
│  │                         (POST - Micro-regeneration)                    │  │
│  └─────────────────────────────────┬─────────────────────────────────────┘  │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                  │
│  ┌─────────────────┐              │              ┌─────────────────────┐    │
│  │   Supabase      │◄─────────────┴──────────────►   Claude API        │    │
│  │   (PostgreSQL)  │                              │   (Anthropic)      │    │
│  │   - care_plans  │                              │   - claude-sonnet  │    │
│  │   - patients    │                              │   - JSON response  │    │
│  │   - intakes     │                              │                    │    │
│  └─────────────────┘                              └─────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Techstack Selectie

### Bestaande Stack (hergebruiken)

| Component | Technologie | Status | Argumentatie |
|-----------|-------------|--------|--------------|
| Frontend | Next.js 14.2.18 | ✅ Bestaand | React framework, SSR, App Router |
| Backend | Next.js API Routes | ✅ Bestaand | Co-located, TypeScript |
| Database | Supabase PostgreSQL | ✅ Bestaand | RLS, FHIR-compliant schema |
| AI | Claude Sonnet | ✅ Bestaand | API key geconfigureerd |
| Styling | TailwindCSS 3.4 | ✅ Bestaand | Utility-first, shadcn/ui |
| Icons | Lucide React | ✅ Bestaand | Consistent icon set |
| Editor | TipTap | ✅ Bestaand | Rich text editor |
| Validation | Zod | ✅ Bestaand | Schema validation |

### Nieuwe Dependencies

| Component | Technologie | Nodig voor | Alternatief |
|-----------|-------------|------------|-------------|
| Charts | Recharts 2.x | Radar chart (stretch) | ❌ Later toevoegen |

**Conclusie:** Geen nieuwe dependencies nodig voor MVP. Recharts alleen bij stretch goal.

---

## 4. Datamodel

### 4.1 Bestaande Tabellen (hergebruiken)

```sql
-- FHIR CarePlan (hoofdtabel voor behandelplannen)
care_plans (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  title TEXT,
  status careplan_status,  -- draft | active | completed | revoked
  intent TEXT,
  goals JSONB,             -- Array van doelen
  activities JSONB,        -- Array van interventies
  based_on_intake_id UUID,
  based_on_anamneses UUID[],
  based_on_examinations UUID[],
  based_on_risk_assessments UUID[],
  care_team_ids UUID[],
  author_id UUID,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Conditions (diagnoses - input voor AI)
conditions (
  id UUID,
  patient_id UUID,
  code TEXT,               -- DSM-5 code
  code_system TEXT,
  display_text TEXT,
  category TEXT,
  clinical_status TEXT,
  severity TEXT,           -- laag | middel | hoog
  encounter_id UUID
)

-- Intakes (bron voor AI context)
intakes (
  id UUID,
  patient_id UUID,
  status intake_status,
  treatment_advice JSONB,
  kindcheck_data JSONB,
  notes TEXT
)
```

### 4.2 Nieuwe Velden / Migratie

```sql
-- Migratie: Leefgebieden toevoegen aan intakes
ALTER TABLE intakes
ADD COLUMN life_domains JSONB;

-- Migratie: Behandelplan specifieke velden aan care_plans
ALTER TABLE care_plans
ADD COLUMN version INTEGER DEFAULT 1,
ADD COLUMN published_at TIMESTAMP,
ADD COLUMN behandelstructuur JSONB,
ADD COLUMN evaluatiemomenten JSONB,
ADD COLUMN veiligheidsplan JSONB;

-- Constraint voor versie-beheer
ALTER TABLE care_plans
ADD CONSTRAINT unique_patient_version UNIQUE (patient_id, version);
```

### 4.3 JSONB Structuren

**life_domains (in intakes):**
```typescript
interface LifeDomainScore {
  domain: 'dlv' | 'wonen' | 'werk' | 'sociaal' | 'vrijetijd' | 'financien' | 'gezondheid'
  baseline: number       // 1-5
  current: number        // 1-5
  target: number         // 1-5
  notes: string
  priority: 'laag' | 'middel' | 'hoog'
}

// life_domains: LifeDomainScore[]
```

**goals (in care_plans):**
```typescript
interface SmartGoal {
  id: string
  title: string
  description: string
  clientVersion: string      // B1-taal
  lifeDomain: LifeDomain
  priority: 'hoog' | 'middel' | 'laag'
  measurability: string
  timelineWeeks: number
  status: 'niet_gestart' | 'bezig' | 'gehaald' | 'bijgesteld'
  progress: number           // 0-100
}
```

**activities (in care_plans):**
```typescript
interface Intervention {
  id: string
  name: string
  description: string
  rationale: string
  linkedGoalIds: string[]
}
```

**behandelstructuur:**
```typescript
interface Behandelstructuur {
  duur: string              // "8 weken"
  frequentie: string        // "Wekelijks"
  aantalSessies: number     // 8
  vorm: string              // "Individueel"
}
```

**evaluatiemomenten:**
```typescript
interface Evaluatiemoment {
  id: string
  type: 'tussentijds' | 'eind' | 'crisis'
  weekNumber: number
  plannedDate: string
  actualDate?: string
  status: 'gepland' | 'afgerond' | 'overgeslagen'
  outcome?: string
  lifeDomainUpdates?: LifeDomainScore[]
}
```

### 4.4 ERD

```
patients ─1:N─ intakes ─1:1─ life_domains (JSONB)
    │              │
    │              └────────── anamneses ─────────┐
    │              └────────── examinations ──────┤
    │              └────────── risk_assessments ──┤
    │                                             │
    └─1:N─ care_plans ────────────────────────────┘
              │                    (based_on_*)
              ├── goals (JSONB)
              ├── activities (JSONB)
              ├── behandelstructuur (JSONB)
              ├── evaluatiemomenten (JSONB)
              └── veiligheidsplan (JSONB)

    └─1:N─ conditions (diagnoses - input voor AI)
```

---

## 5. API Ontwerp

### 5.1 Endpoints Overzicht

| Endpoint | Method | Input | Output | Auth |
|----------|--------|-------|--------|------|
| `/api/behandelplan/generate` | POST | GenerateInput | GeneratedPlan | Required |
| `/api/behandelplan/regenerate-section` | POST | RegenerateInput | RegeneratedSection | Required |

### 5.2 POST /api/behandelplan/generate

**Request:**
```typescript
interface GenerateInput {
  patientId: string           // UUID
  intakeId: string            // UUID
  conditionId?: string        // UUID (optioneel, haalt anders laatste op)
  extraInstructions?: string  // Optionele aanvullende instructies
}
```

**Response:**
```typescript
interface GeneratedPlan {
  behandelstructuur: Behandelstructuur
  doelen: SmartGoal[]
  interventies: Intervention[]
  evaluatiemomenten: Evaluatiemoment[]
  veiligheidsplan?: Veiligheidsplan  // Alleen bij severity "Hoog"
}
```

**Error Responses:**
- `400`: Validation error (missing fields, invalid UUIDs)
- `401`: Unauthorized
- `404`: Patient/Intake/Condition not found
- `422`: Insufficient data for generation (no intake notes, no diagnosis)
- `500`: AI API error
- `503`: AI service unavailable

### 5.3 POST /api/behandelplan/regenerate-section

**Request:**
```typescript
interface RegenerateInput {
  patientId: string
  carePlanId: string
  sectionType: 'goal' | 'intervention'
  sectionId: string
  instruction?: string        // Extra instructie voor AI
  currentPlan: GeneratedPlan  // Context van huidige plan
}
```

**Response:**
```typescript
interface RegeneratedSection {
  type: 'goal' | 'intervention'
  original: SmartGoal | Intervention
  regenerated: SmartGoal | Intervention
}
```

### 5.4 Zod Validation Schemas

```typescript
// lib/types/behandelplan.ts

export const GenerateInputSchema = z.object({
  patientId: z.string().uuid(),
  intakeId: z.string().uuid(),
  conditionId: z.string().uuid().optional(),
  extraInstructions: z.string().max(500).optional(),
});

export const RegenerateInputSchema = z.object({
  patientId: z.string().uuid(),
  carePlanId: z.string().uuid(),
  sectionType: z.enum(['goal', 'intervention']),
  sectionId: z.string().uuid(),
  instruction: z.string().max(200).optional(),
  currentPlan: GeneratedPlanSchema,
});
```

---

## 6. Security & Compliance

### 6.1 Security Checklist

- [x] **Authentication:** Supabase Auth (bestaand)
- [x] **Authorization:** Row Level Security op care_plans
- [x] **Data Encryption:** At rest (PostgreSQL), in transit (HTTPS)
- [x] **Input Validation:** Zod schemas op alle endpoints
- [ ] **Rate Limiting:** Toe te voegen op AI endpoints (10 req/min)
- [x] **CORS:** Restrictive origins (bestaand)
- [x] **Secrets:** Environment variables (ANTHROPIC_API_KEY)

### 6.2 RLS Policies voor care_plans

```sql
-- Bestaande RLS policy uitbreiden
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;

-- Behandelaars kunnen alleen eigen patiënten zien
CREATE POLICY "Users can view care plans for their patients"
ON care_plans FOR SELECT
USING (
  auth.uid() IN (
    SELECT practitioner_id FROM patient_practitioners
    WHERE patient_id = care_plans.patient_id
  )
);

-- Behandelaars kunnen care plans maken voor eigen patiënten
CREATE POLICY "Users can create care plans for their patients"
ON care_plans FOR INSERT
WITH CHECK (
  auth.uid() = author_id
);

-- Behandelaars kunnen eigen care plans updaten
CREATE POLICY "Users can update their care plans"
ON care_plans FOR UPDATE
USING (auth.uid() = author_id);
```

### 6.3 AVG/GDPR Overwegingen

- **Data minimalisatie:** Alleen noodzakelijke velden in AI prompt
- **Geen BSN/identificerende data naar AI:** Alleen intake notities en scores
- **Audit trail:** Bestaande `ai_events` tabel loggen van AI calls
- **Consent:** AI-gebruik gedekt onder behandelrelatie

---

## 7. AI/LLM Integratie

### 7.1 AI Stack

| Component | Waarde |
|-----------|--------|
| Provider | Anthropic |
| Model | claude-3-5-sonnet-20240620 (of claude-sonnet-4) |
| Library | Native fetch (geen SDK nodig) |
| Caching | Geen (elke generatie is uniek) |
| Fallback | Error message + manual mode optie |

### 7.2 Prompt Template

```typescript
// lib/ai/behandelplan-prompt.ts

export const BEHANDELPLAN_SYSTEM_PROMPT = `
Je bent een ervaren GGZ-behandelaar die behandelplannen opstelt.
Je maakt SMART doelen die recovery-gericht en evidence-based zijn.

INSTRUCTIES:
1. Genereer 2-4 SMART doelen gebaseerd op de intake en diagnose
2. Focus op leefgebieden met prioriteit "Hoog"
3. Verdeel doelen over minimaal 2 verschillende leefgebieden
4. Maak concrete, meetbare doelen (geen vage termen)
5. Genereer voor elk doel een B1-taal versie (cliënt-vriendelijk)
6. Kies evidence-based interventies passend bij de DSM-categorie
7. Plan 8-12 sessies afhankelijk van severity
8. Voeg veiligheidsplan toe alleen bij severity "Hoog"

OUTPUT FORMAT:
Retourneer ALLEEN valide JSON volgens het volgende schema:
{
  "behandelstructuur": {
    "duur": "8 weken",
    "frequentie": "Wekelijks",
    "aantalSessies": 8,
    "vorm": "Individueel"
  },
  "doelen": [...],
  "interventies": [...],
  "evaluatiemomenten": [...],
  "veiligheidsplan": null | {...}
}
`;

export function buildUserPrompt(context: PlanContext): string {
  return `
CLIËNT CONTEXT:
- Intake notities: ${context.intakeNotes}
- DSM-categorie: ${context.dsmCategory}
- Severity: ${context.severity}

LEEFGEBIEDEN SCORES:
${context.lifeDomains.map(d =>
  `- ${d.domain}: ${d.baseline}/5 (prioriteit: ${d.priority})`
).join('\n')}

${context.extraInstructions ? `EXTRA INSTRUCTIES:\n${context.extraInstructions}` : ''}

Genereer nu een behandelplan.
`;
}
```

### 7.3 Evidence-Based Mapping

```typescript
// lib/ai/intervention-mapping.ts

export const INTERVENTION_MAPPING: Record<string, InterventionSuggestion[]> = {
  'angststoornissen': [
    { name: 'CGT', sessions: { laag: 8, middel: 10, hoog: 14 } },
    { name: 'Exposure therapie', sessions: { laag: 6, middel: 8, hoog: 12 } },
    { name: 'ACT', sessions: { laag: 8, middel: 10, hoog: 12 } },
  ],
  'stemmingsklachten': [
    { name: 'CGT', sessions: { laag: 8, middel: 10, hoog: 14 } },
    { name: 'IPT', sessions: { laag: 8, middel: 12, hoog: 16 } },
    { name: 'Gedragsactivatie', sessions: { laag: 6, middel: 8, hoog: 10 } },
  ],
  'trauma_ptss': [
    { name: 'EMDR', sessions: { laag: 6, middel: 10, hoog: 16 } },
    { name: 'Narratieve therapie', sessions: { laag: 8, middel: 12, hoog: 16 } },
  ],
  'persoonlijkheid': [
    { name: 'Schematherapie', sessions: { laag: 16, middel: 24, hoog: 40 } },
    { name: 'MBT', sessions: { laag: 16, middel: 24, hoog: 40 } },
  ],
};
```

### 7.4 API Call Implementatie

```typescript
// app/api/behandelplan/generate/route.ts

export async function POST(request: NextRequest) {
  // 1. Validate input
  const body = await request.json();
  const input = GenerateInputSchema.parse(body);

  // 2. Load context from database
  const context = await loadPlanContext(input);

  // 3. Build prompt
  const messages = [
    { role: 'system', content: BEHANDELPLAN_SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(context) },
  ];

  // 4. Call Claude API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4096,
      temperature: 0.3,
      messages,
    }),
  });

  // 5. Parse and validate response
  const result = await response.json();
  const plan = GeneratedPlanSchema.parse(
    JSON.parse(result.content[0].text)
  );

  // 6. Log to ai_events
  await logAIEvent('behandelplan_generate', input, plan);

  return NextResponse.json(plan);
}
```

---

## 8. Performance & Scalability

### 8.1 Performance Targets

| Metric | Target | Huidige Baseline |
|--------|--------|------------------|
| Page load (FCP) | < 1.5s | ~1s (andere pagina's) |
| API response | < 500ms | ~300ms (intakes) |
| AI generation | < 8s | N/A (nieuw) |
| Auto-save | < 500ms | ~300ms (reports) |

### 8.2 Optimalisaties

**Frontend:**
- Server Components voor initial load (geen client JS voor data)
- Skeleton loaders tijdens AI generatie
- Optimistic updates voor status wijzigingen

**Backend:**
- Parallel database queries voor context loading
- Geen caching van AI responses (elke generatie uniek)
- Connection pooling via Supabase (bestaand)

**AI:**
- Max tokens: 4096 (voldoende voor plan JSON)
- Temperature: 0.3 (consistent maar niet robotisch)
- Retry logic: 2x met exponential backoff

---

## 9. Deployment & CI/CD

### 9.1 Omgevingen (bestaand)

| Omgeving | URL | Database |
|----------|-----|----------|
| Development | localhost:3000 | Local Supabase |
| Preview | Vercel preview | Supabase preview branch |
| Production | [main domain] | Supabase production |

### 9.2 Migratie Workflow (Cloud-only)

```bash
# Geen lokale Supabase instantie - direct naar cloud

# Optie 1: Via Supabase MCP tool
mcp__supabase__apply_migration(name, query)

# Optie 2: Via Supabase CLI
npx supabase db push --linked

# Types genereren na migratie
mcp__supabase__generate_typescript_types
```

**Let op:** Geen `supabase db reset` mogelijk - migraties zijn direct productie.

### 9.3 Deployment Checklist

- [ ] Environment variables in Vercel dashboard
- [ ] Database migraties toegepast
- [ ] TypeScript types gegenereerd (`supabase gen types typescript`)
- [ ] Build succesvol (`pnpm build`)
- [ ] Smoke test op preview environment

---

## 10. Monitoring & Logging

### 10.1 AI Event Logging (bestaand)

```sql
-- Bestaande ai_events tabel
ai_events (
  id UUID,
  kind TEXT,           -- 'behandelplan_generate' | 'behandelplan_regenerate'
  request JSONB,       -- Input parameters
  response JSONB,      -- Generated plan
  duration_ms INTEGER,
  created_at TIMESTAMP
)
```

### 10.2 Metrics te Tracken

| Metric | Doel | Actie bij Overschrijding |
|--------|------|--------------------------|
| AI success rate | > 95% | Check prompts, input validation |
| AI response time p95 | < 8s | Optimize prompt size |
| Error rate | < 2% | Alert + investigate |

---

## 11. Risico's & Technische Mitigatie

| Risico | Impact | Kans | Mitigatie |
|--------|--------|------|-----------|
| AI genereert invalide JSON | Hoog | Middel | Zod validation, retry logic, fallback |
| AI API down/rate limited | Hoog | Laag | Error message, manual mode optie |
| Grote intake teksten (token limit) | Middel | Middel | Truncate/summarize intake eerst |
| Inconsistente B1-taal kwaliteit | Middel | Middel | Post-processing, behandelaar review |
| Performance bij grote plannen | Laag | Laag | Pagination, lazy loading |

---

## 12. Implementatie Volgorde

### Stap 1: Types & Database (2-3 uur)

**Bestanden:**
```
lib/types/
├── behandelplan.ts      # Nieuwe types + Zod schemas
└── leefgebieden.ts      # Life domain types

supabase/migrations/
└── xxx_add_behandelplan_fields.sql
```

### Stap 2: Leefgebieden Componenten (3-4 uur)

**Bestanden:**
```
components/behandelplan/
├── leefgebieden-form.tsx    # Intake formulier (7 sliders)
├── leefgebieden-scores.tsx  # Progress bar weergave
└── leefgebieden-badge.tsx   # Domain tag/badge
```

### Stap 3: AI Generatie (3-4 uur)

**Bestanden:**
```
lib/ai/
├── behandelplan-prompt.ts   # System + user prompts
└── intervention-mapping.ts  # Evidence-based mapping

app/api/behandelplan/
├── generate/route.ts        # POST endpoint
└── regenerate-section/route.ts  # Micro-regeneratie
```

### Stap 4: Behandelplan UI (6-8 uur)

**Bestanden:**
```
app/epd/patients/[id]/behandelplan/
├── page.tsx                 # Server component (vervang placeholder)
├── actions.ts               # Server actions (CRUD)
└── components/
    ├── behandelplan-view.tsx
    ├── goals-section.tsx
    ├── goal-card.tsx
    ├── interventions-section.tsx
    └── generate-button.tsx
```

---

## 13. Bijlagen & Referenties

### Projectdocumenten
- [PRD Behandelplan v2.0](./prd-behandelplan-v2-final.md)
- [FO Behandelplan v1.0](./fo-behandelplan-v1.md)
- [UX Stylesheet](../ux-stylesheet.md)

### Tech Documentatie
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Anthropic Claude: https://docs.anthropic.com/claude/reference

### Bestaande Code Referenties
- API pattern: `/app/api/reports/classify/route.ts`
- Server actions: `/app/epd/patients/[id]/intakes/[intakeId]/actions.ts`
- Types pattern: `/lib/types/report.ts`
- AI integration: `/app/api/docs/chat/route.ts`

---

**Document Status:** v1.0 Draft
**Volgende Review:** Na implementatie Stap 1-2
**Eigenaar:** Colin van Zeeland
