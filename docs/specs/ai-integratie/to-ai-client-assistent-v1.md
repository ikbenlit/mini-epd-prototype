# ⚙️ Technisch Ontwerp (TO) – AI Cliënt Assistent

**Projectnaam:** Mini-ECD – AI Cliënt Assistent
**Versie:** v1.0
**Datum:** 01-12-2025
**Auteur:** Colin Lit

---

## 1. Doel en relatie met PRD en FO

**Doel van dit document:**
Dit TO beschrijft de technische implementatie van de AI Cliënt Assistent: een uitbreiding op de bestaande AI Documentatie Assistent die vragen over specifieke cliënten kan beantwoorden.

**Relatie met PRD:**
- PRD beschrijft *wat* we bouwen: cliënt-aware chat die rapportages, risico's en behandeladvies kan samenvatten
- TO beschrijft *hoe* we dit technisch realiseren binnen de bestaande architectuur

**Scope:**
- Uitbreiding van bestaande `docs-chat` component
- Nieuwe context loader voor cliëntdata
- Vraagtype-detectie (cliënt vs. documentatie)
- Cliënt-specifieke prompt templates

---

## 2. Technische Architectuur Overzicht

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │ DocsChatWidget  │  │ PatientContext   │  │ ChatSuggestions│  │
│  │ (uitgebreid)    │──│ (bestaand)       │  │ (dynamisch)    │  │
│  └────────┬────────┘  └────────┬─────────┘  └────────────────┘  │
│           │                    │                                 │
└───────────┼────────────────────┼─────────────────────────────────┘
            │                    │
            ▼                    ▼
┌───────────────────────────────────────────────────────────────────┐
│                    API Route: /api/docs/chat                       │
│  ┌──────────────────┐  ┌───────────────────┐  ┌────────────────┐  │
│  │ QuestionDetector │  │ ClientContextLoader│  │ PromptBuilder  │  │
│  │ (nieuw)          │  │ (nieuw)            │  │ (uitgebreid)   │  │
│  └────────┬─────────┘  └─────────┬──────────┘  └───────┬────────┘  │
│           │                      │                     │           │
│           └──────────────────────┼─────────────────────┘           │
│                                  ▼                                 │
│                         ┌───────────────┐                          │
│                         │ Claude API    │                          │
│                         │ (streaming)   │                          │
│                         └───────────────┘                          │
└───────────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────┐
│                      Supabase (PostgreSQL)                         │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │ patients │  │ reports  │  │ intakes    │  │ risk_assessments│  │
│  │ (6 rows) │  │ (21 rows)│  │ (9 rows)   │  │ (via intake)    │  │
│  └──────────┘  └──────────┘  └────────────┘  └─────────────────┘  │
│  ┌──────────────┐  ┌────────────┐                                  │
│  │ screenings   │  │ care_plans │                                  │
│  │ (5 rows)     │  │ (0 rows)   │                                  │
│  └──────────────┘  └────────────┘                                  │
└───────────────────────────────────────────────────────────────────┘
```

---

## 3. Techstack Selectie

| Component | Technologie | Argumentatie |
|-----------|-------------|--------------|
| Frontend | Next.js 15 + React | Bestaande stack, geen wijziging |
| State | PatientContext | Bestaande context, hergebruiken |
| API | Next.js API Routes | Bestaande `/api/docs/chat` uitbreiden |
| AI | Claude claude-sonnet-4-20250514 | Huidige model, goed voor Nederlands |
| Database | Supabase (PostgreSQL) | Bestaand, RLS enabled |
| Streaming | Server-Sent Events | Bestaande implementatie |

**Geen nieuwe dependencies nodig** - alles bouwt voort op bestaande technologie.

---

## 4. Datamodel Analyse

### 4.1 Beschikbare data per cliënt

Op basis van database-analyse is de volgende data beschikbaar:

| Tabel | Veld | Beschikbaar | Bruikbaar voor AI |
|-------|------|-------------|-------------------|
| **patients** | name, birth_date, status | ✅ 6 patiënten | Context header |
| **reports** | content, type, created_at | ✅ 21 rapportages | Samenvatting rapportages |
| **intakes** | treatment_advice (JSONB), notes | ✅ 9 intakes | Behandeladvies vragen |
| **screenings** | request_for_help, decision | ✅ 5 screenings | Hulpvraag/beslissing |
| **risk_assessments** | risk_type, risk_level, rationale | ⚠️ 0 rows (via intake) | Risico-overzicht |
| **care_plans** | goals, activities (JSONB) | ⚠️ 0 rows | Behandelplan doelen |

### 4.2 Datastructuur voorbeelden

**Reports (content):**
```
S – Subjectief: Cliënt geeft aan dat piekergedachten over werk...
O – Objectief: Cliënt verschijnt op tijd en verzorgd...
E – Evaluatie: Er is sprake van lichte verbetering...
P – Plan: Cliënt gaat komende week dagelijks...
```

**Intakes (treatment_advice JSONB):**
```json
{
  "advice": "<p>Doorzetten naar behandeling</p>",
  "outcome": "in_zorg",
  "program": "FACT",
  "department": "Volwassenen",
  "psychologist": "Colin"
}
```

### 4.3 Context Loading Query

```sql
-- Rapportages (laatste 5)
SELECT type, content, created_at
FROM reports
WHERE patient_id = $1 AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 5;

-- Intakes met behandeladvies
SELECT title, department, status, treatment_advice, notes
FROM intakes
WHERE patient_id = $1
ORDER BY created_at DESC
LIMIT 3;

-- Screening hulpvraag
SELECT request_for_help, decision, decision_notes
FROM screenings
WHERE patient_id = $1
ORDER BY created_at DESC
LIMIT 1;

-- Risico-assessments (via intake)
SELECT ra.risk_type, ra.risk_level, ra.rationale, ra.assessment_date
FROM risk_assessments ra
JOIN intakes i ON ra.intake_id = i.id
WHERE i.patient_id = $1
ORDER BY ra.assessment_date DESC
LIMIT 5;
```

---

## 5. API Ontwerp

### 5.1 Bestaande API's Analyse

**FHIR API's (bestaand):**

| Endpoint | Methode | Bruikbaar voor AI Chat |
|----------|---------|------------------------|
| `/api/fhir/Patient/[id]` | GET | ⚠️ Beperkt - alleen demographics |
| `/api/fhir/Patient` | GET/POST | ❌ Niet nodig |
| `/api/fhir/Practitioner/[id]` | GET | ❌ Niet relevant |

**REST API's (bestaand):**

| Endpoint | Methode | Data | Bruikbaar |
|----------|---------|------|-----------|
| `/api/reports?patientId=` | GET | Rapportages met content | ✅ **Zeer bruikbaar** |
| `/api/intakes/[id]` | GET | Intake + treatment_advice | ✅ **Zeer bruikbaar** |
| `/api/screenings/[id]` | GET | Hulpvraag + beslissing + activities | ✅ **Zeer bruikbaar** |

### 5.2 Data Access Strategie

**Overwogen opties:**

| Optie | Beschrijving | Voordelen | Nadelen |
|-------|--------------|-----------|---------|
| **A: Bestaande API's** | Fetch naar `/api/reports`, `/api/intakes`, etc. | Hergebruik, consistentie | Extra HTTP overhead, intakes/screenings list endpoints ontbreken |
| **B: Directe Supabase** | Server-side queries in API route | Sneller, 1 DB roundtrip, RLS automatisch | Duplicatie van query logic |
| **C: FHIR $summary** | Nieuw endpoint `GET /api/fhir/Patient/[id]/$summary` | FHIR-compliant, extern bruikbaar | Meeste werk, overkill voor MVP |

**Gekozen: Optie B - Directe Supabase queries**

Argumentatie:
1. **Performance**: 1 database roundtrip vs. 3-4 HTTP calls
2. **Simpliciteit**: Geen nieuwe endpoints nodig voor MVP
3. **Security**: RLS policies werken automatisch op server-side queries
4. **Latency**: ~50ms vs. ~200ms+ bij HTTP calls

**Post-MVP overweging:** Een FHIR `$summary` operation kan waardevol zijn voor externe systeem-integraties.

### 5.3 Chat endpoint uitbreiden

**Endpoint:** `POST /api/docs/chat`

**Huidige input:**
```typescript
{
  messages: Array<{ role: 'user' | 'assistant', content: string }>
}
```

**Uitgebreide input:**
```typescript
{
  messages: Array<{ role: 'user' | 'assistant', content: string }>,
  clientId?: string  // UUID van actieve patiënt (optioneel)
}
```

**Response:** Ongewijzigd (SSE streaming)

### 5.4 Nieuwe interne modules

```typescript
// lib/docs/question-type-detector.ts
export type QuestionType = 'client' | 'documentation' | 'ambiguous'

export function detectQuestionType(
  question: string,
  hasClientContext: boolean
): QuestionType

// lib/docs/client-context-loader.ts
export interface ClientContext {
  patient: { name: string; birthDate: string; status: string }
  reports: Array<{ type: string; content: string; date: string }>
  intakes: Array<{ title: string; treatmentAdvice: object }>
  screening: { requestForHelp: string; decision: string } | null
  riskAssessments: Array<{ type: string; level: string; rationale: string }>
}

export async function loadClientContext(
  clientId: string
): Promise<ClientContext>

// lib/docs/client-prompt-builder.ts
export function buildClientPrompt(
  context: ClientContext,
  question: string
): string
```

---

## 6. Security & Compliance

### 6.1 Bestaande beveiliging (behouden)

| Maatregel | Status | Implementatie |
|-----------|--------|---------------|
| **Authentication** | ✅ | Supabase Auth, sessie vereist |
| **RLS Policies** | ✅ | Alle tabellen hebben RLS enabled |
| **Rate Limiting** | ✅ | 10 req/min per user (in-memory) |
| **HTTPS** | ✅ | Vercel enforced |

### 6.2 Aanvullende maatregelen

| Maatregel | Implementatie |
|-----------|---------------|
| **Client ID validatie** | UUID format check + bestaat in database |
| **Context isolatie** | Alleen data van opgegeven clientId laden |
| **Geen logging cliëntdata** | AI responses niet loggen naar ai_events |
| **Token limit** | Max 4000 tokens context om data-lekkage te beperken |

### 6.3 Privacy overwegingen

```typescript
// NIET loggen naar ai_events bij cliënt-vragen
if (questionType === 'client') {
  // Skip ai_events insert - geen cliëntdata in logs
}

// Wel loggen bij documentatie-vragen (bestaand gedrag)
if (questionType === 'documentation') {
  await logAiEvent({ kind: 'chat', request, response })
}
```

---

## 7. AI/LLM Integratie

### 7.1 Vraagtype Detectie

**Heuristiek voor detectie:**

```typescript
const CLIENT_KEYWORDS = [
  'rapportage', 'risico', 'behandeladvies', 'screening',
  'hulpvraag', 'samenvatting', 'dossier', 'deze cliënt',
  'zijn/haar', 'behandeling', 'medicatie', 'diagnose'
]

const DOC_KEYWORDS = [
  'hoe', 'waar', 'wat is', 'tutorial', 'handleiding',
  'functie', 'knop', 'menu', 'systeem', 'epd'
]

function detectQuestionType(question: string, hasClientContext: boolean): QuestionType {
  if (!hasClientContext) return 'documentation'

  const q = question.toLowerCase()
  const clientScore = CLIENT_KEYWORDS.filter(k => q.includes(k)).length
  const docScore = DOC_KEYWORDS.filter(k => q.includes(k)).length

  if (clientScore > docScore) return 'client'
  if (docScore > clientScore) return 'documentation'
  return 'ambiguous' // Fallback naar documentation
}
```

### 7.2 Client Prompt Template

```typescript
const CLIENT_SYSTEM_PROMPT = `Je bent een EPD-assistent die vragen beantwoordt over een specifieke cliënt.

BELANGRIJKE REGELS:
1. Beantwoord ALLEEN op basis van de gegeven context
2. Als informatie ontbreekt, zeg dit eerlijk
3. Geef NOOIT medisch advies of diagnoses
4. Verzin NOOIT informatie die niet in de context staat
5. Antwoord beknopt en professioneel

CLIËNT: {patientName}
GEBOORTEDATUM: {birthDate}
STATUS: {status}

RAPPORTAGES (laatste {reportCount}):
{reportsFormatted}

BEHANDELADVIES:
{treatmentAdviceFormatted}

SCREENING/HULPVRAAG:
{screeningFormatted}

RISICO-ASSESSMENTS:
{riskAssessmentsFormatted}
`
```

### 7.3 Fallback bij ambigue vragen

Bij `questionType === 'ambiguous'`:
- Default naar documentatie-modus
- Toon hint: "Bedoelde je een vraag over de documentatie of over deze cliënt?"

---

## 8. Performance & Scalability

### 8.1 Performance Targets

| Metric | Target | Huidige baseline |
|--------|--------|------------------|
| Context laden | < 200ms | N.v.t. (nieuw) |
| Vraagtype detectie | < 10ms | N.v.t. (nieuw) |
| Eerste token | < 3 sec | ~2 sec (docs) |
| Totale response | < 10 sec | ~5-8 sec (docs) |

### 8.2 Optimalisaties

```typescript
// Parallel laden van context
const [reports, intakes, screening, risks] = await Promise.all([
  loadReports(clientId),
  loadIntakes(clientId),
  loadScreening(clientId),
  loadRiskAssessments(clientId)
])

// Token budget management
const MAX_CONTEXT_TOKENS = 4000
const contextText = truncateToTokenLimit(
  formatContext(reports, intakes, screening, risks),
  MAX_CONTEXT_TOKENS
)
```

### 8.3 Caching strategie

| Data | Cache | TTL |
|------|-------|-----|
| Cliënt context | Geen | - |
| Documentatie chunks | In-memory | Session |
| Rate limit state | In-memory | 60 sec |

**Geen caching van cliëntdata** - altijd verse data uit database voor medische nauwkeurigheid.

---

## 9. Haalbaarheidsanalyse

### 9.1 Technische haalbaarheid: ✅ HOOG

| Aspect | Beoordeling | Toelichting |
|--------|-------------|-------------|
| **Datamodel** | ✅ Compleet | Alle benodigde tabellen bestaan en bevatten data |
| **API structuur** | ✅ Eenvoudig | Kleine uitbreiding op bestaande endpoint |
| **Frontend** | ✅ Minimaal | PatientContext bestaat al |
| **AI integratie** | ✅ Bewezen | Zelfde Claude API als documentatie-chat |

### 9.2 Data beschikbaarheid

| Categorie | PRD Requirement | Database Status |
|-----------|-----------------|-----------------|
| Rapportages | ✅ | 21 rows, SOAP-format content |
| Behandeladvies | ✅ | JSONB in intakes.treatment_advice |
| Risico's | ⚠️ | Tabel bestaat, 0 rows (seed data nodig) |
| Screening | ✅ | 5 rows, hulpvraag veld beschikbaar |

### 9.3 Geschatte implementatietijd

| Component | Schatting |
|-----------|-----------|
| `question-type-detector.ts` | 2 uur |
| `client-context-loader.ts` | 3 uur |
| `client-prompt-builder.ts` | 2 uur |
| API route uitbreiding | 2 uur |
| Frontend (indicator + suggestions) | 3 uur |
| Testing & refinement | 4 uur |
| **Totaal** | **~16 uur** |

### 9.4 Risico's en mitigatie

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| **Geen risk_assessments data** | Middel | Seed data toevoegen of feature uitstellen |
| **Token overflow** | Laag | Truncatie met prioriteit (nieuwste eerst) |
| **Hallucinatie** | Hoog | Strikte prompt + "ik weet het niet" response |
| **Performance** | Laag | Parallel queries, geen joins |

---

## 10. Conclusie & Aanbeveling

### Haalbaarheid: ✅ JA

De AI Cliënt Assistent is technisch haalbaar binnen de huidige architectuur:

1. **Datamodel is compleet** - Alle benodigde tabellen bestaan met RLS
2. **Geen nieuwe dependencies** - Bouwt voort op bestaande stack
3. **Minimale frontend wijzigingen** - PatientContext hergebruiken
4. **Bewezen AI integratie** - Zelfde Claude API als docs-chat

### Aanbevolen aanpak

1. **Fase 1:** Seed data voor risk_assessments (test coverage)
2. **Fase 2:** Backend modules (detector, loader, prompt builder)
3. **Fase 3:** API route uitbreiding
4. **Fase 4:** Frontend indicator en dynamische suggestions
5. **Fase 5:** Integratie testing met echte cliëntdata

---

## 11. Bijlagen & Referenties

### Projectdocumenten
| Document | Locatie |
|----------|---------|
| PRD | `docs/specs/ai-integratie/prd-ai-client-assistent-v1.md` |
| Bestaande docs-chat | `components/docs-chat/` |
| API route | `app/api/docs/chat/route.ts` |
| PatientContext | `contexts/patient-context.tsx` |

### Database schema
- Volledige schema via `mcp__supabase__list_tables`
- RLS policies actief op alle tabellen

---

## Versiehistorie

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 01-12-2025 | Colin Lit | Initiële versie met haalbaarheidsanalyse |
| v1.1 | 01-12-2025 | Colin Lit | FHIR/REST API analyse toegevoegd, data access strategie onderbouwd |
