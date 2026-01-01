# Bouwplan — Cortex Intent System V2

**Projectnaam:** Cortex V2 - Agentic Intent Architecture
**Versie:** v1.3
**Datum:** 01-01-2026
**Auteur:** Colin Lit

---

## 1. Doel en context

**Doel:** Bouwen van een werkend MVP/prototype van het Cortex V2 Intent System dat de transformatie demonstreert van een reactief "spraakgestuurd toetsenbord" naar een **AI Collega** die context begrijpt, meerdere intenties verwerkt en proactief meedenkt.

**Context:** Het huidige Cortex systeem (V1) is reactief: gebruiker geeft commando → systeem voert uit. V2 introduceert een three-layer architectuur die intelligentie boven snelheid prioriteert.

**Kernprincipe:**
> "We stoppen met optimaliseren voor milliseconden en starten met optimaliseren voor intelligentie."

**Beoogd resultaat:** Een demonstreerbaar prototype dat:
- **Multi-intents** begrijpt ("Zeg Jan af **en** maak notitie")
- **Context-aware** is (snapt wie "hij" is, wat "morgen" betekent)
- **Proactief** suggesties geeft (na wondzorg → "Controle inplannen?")
- **Nooit** "Ik snap het niet" zegt (altijd een poging tot begrip)

**Referenties:**
- PRD: `docs/intent/prd-cortex-v2.md`
- FO: `docs/intent/fo-cortex-intent-system-v2.md`
- TO: `docs/intent/to-cortex-v2.md`
- Architectuur: `docs/intent/architecture-cortex-v2.md`
- MVP User Stories: `docs/intent/mvp-userstories-intent-system.md`

---

## 2. Dev Quick Start

### Voor je begint

**Lees eerst (5 min):**
- Dit bouwplan (je bent hier)
- TO sectie 4.1 voor volledige type definities: `docs/intent/to-cortex-v2.md`

**Codebase oriëntatie:**
```
lib/cortex/                    # Cortex logic (V1 + V2)
├── types.ts                   # ✅ Bestaand - UITBREIDEN
├── intent-classifier.ts       # ✅ Bestaand V1 - NIET AANPASSEN
├── intent-classifier-ai.ts    # ✅ Bestaand V1 AI - referentie
├── entity-extractor.ts        # ✅ Bestaand - hergebruiken
├── reflex-classifier.ts       # 🆕 NIEUW in E1
├── orchestrator.ts            # 🆕 NIEUW in E2
├── nudge.ts                   # 🆕 NIEUW in E4
└── logger.ts                  # 🆕 NIEUW in E0

stores/
└── cortex-store.ts            # ✅ Bestaand - UITBREIDEN in E0.S4

components/cortex/
├── chat/
│   ├── action-chain-card.tsx  # 🆕 NIEUW in E3
│   └── clarification-card.tsx # 🆕 NIEUW in E3
└── command-center/
    └── nudge-toast.tsx        # 🆕 NIEUW in E4

app/api/cortex/
├── context/route.ts           # 🆕 NIEUW in E0.S2
└── classify/route.ts          # 🆕 NIEUW in E2.S5

lib/config/
└── feature-flags.ts           # 🆕 NIEUW in E0.S3
```

**Werkwijze per story:**
1. Lees story + done criteria
2. Check bestaande code (zie "Bestaande code" sectie per epic)
3. Implementeer
4. Run `pnpm lint` en `pnpm build`
5. Test handmatig of met test command
6. Commit met story ID: `feat(cortex): E0.S1 - CortexContext types`

**Belangrijke conventies:**
- TypeScript strict mode
- Nederlandse gebruikersteksten, Engelse code/comments
- Zod voor runtime validatie waar nodig
- Graceful degradation bij AI failures

---

## 3. Uitgangspunten

### 3.1 Technische Stack

| Component | Technologie | Argumentatie |
|-----------|-------------|--------------|
| **Frontend** | Next.js 15, React, TailwindCSS | Bestaande stack, App Router |
| **Backend** | Next.js API Routes | Co-located met frontend |
| **Database** | Supabase (PostgreSQL) | Realtime, RLS, auth included |
| **AI Model** | Claude 3.5 Haiku | Snel (~400ms), goedkoop, excellent Nederlands |
| **State** | Zustand | Lightweight, devtools, persist |
| **UI** | shadcn/ui | Bestaande component library |

### 3.2 Projectkaders

| Kader | Waarde |
|-------|--------|
| **Type release** | MVP / Public Prototype ("Build in Public") |
| **Bouwtijd** | 11-15 werkdagen |
| **Budget** | N.v.t. (prototype) |
| **Team** | 1 developer + AI-assistentie |
| **Data** | Mock-data, geen productie EPD-koppeling |
| **Doel** | Demonstratie van "Agency" concept |

### 3.3 Programmeer Uitgangspunten

**Code Quality Principles:**
- **DRY** - Herbruikbare components en utility functions
- **KISS** - Eenvoudige oplossingen, geen premature optimization
- **SOC** - UI gescheiden van business logic, API calls in service layers
- **YAGNI** - Alleen bouwen wat nu nodig is voor MVP

**Development Practices:**
- TypeScript strict mode
- Zod schemas voor runtime validatie
- Error handling met user-friendly Nederlandse meldingen
- Graceful degradation bij AI failures

---

## 4. Epics & Stories Overzicht

### MVP Scope (✅ In Scope)

| Epic ID | Titel | Doel | Status | Stories | Story Points |
|---------|-------|------|--------|---------|--------------|
| **E0** | Foundation & Context | Types, API, feature flags | ✅ Done | 5 | 8 SP |
| **E1** | Reflex Arc (Layer 1) | Snelle lokale classificatie | ✅ Done | 4 | 6 SP |
| **E2** | Intent Orchestrator (Layer 2) | AI-gedreven multi-intent | ✅ Done | 6 | 13 SP |
| **E3** | UI Components | ActionChainCard, ClarificationCard | ✅ Done | 4 | 8 SP |
| **E4** | Nudge MVP (Layer 3) | Proactieve suggesties | ⏳ To Do | 3 | 5 SP |
| **E5** | Integration & Polish | End-to-end flow, testing | ⏳ To Do | 4 | 8 SP |

**Totaal MVP: 26 stories, 48 Story Points**

### Post-MVP Scope (❌ Niet in Scope)

| Feature | Reden | Prioriteit |
|---------|-------|------------|
| Complete medische protocollen | Te complex voor prototype | Post-MVP |
| Rollback/Undo | Vereist transactie-systeem | Post-MVP |
| Offline mode | Prototype veronderstelt internet | Low |
| Advanced error handling | Retry-mechanismes, circuit breakers | Post-MVP |
| Analytics & learning | Telemetry opslag, model training | Post-MVP |
| NEN7510 compliance | Productie-beveiliging | Post-MVP (kritiek) |
| Externe integraties | Teams, ECD-koppelingen | Post-MVP |

**Belangrijk:** Voer niet in 1x het volledige plan uit. Bouw per epic en per story.

---

## 5. Epics & Stories (Uitwerking)

### Epic 0 — Foundation & Context

**Epic Doel:** Werkende basis met types, context API en feature flags voor gecontroleerde rollout.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E0.S1 | **CortexContext types** definiëren | Types in `lib/cortex/types.ts` voor context, intents, chains | ✅ | — | 2 |
| E0.S2 | **GET /api/cortex/context** endpoint | Retourneert actieve patiënt, agenda, recente acties | ✅ | E0.S1 | 2 |
| E0.S3 | **Feature flags** setup | `CORTEX_V2_ENABLED`, `CORTEX_MULTI_INTENT`, `CORTEX_NUDGE`, `CORTEX_LOGGING` | ✅ | — | 1 |
| E0.S4 | **CortexStore V2** extensions | Zustand store met context, chains, suggestions state | ✅ | E0.S1 | 2 |
| E0.S5 | **Classification logging** utility | Dev logging + production sanitization | ✅ | E0.S1 | 1 |

**Deliverable:** Context beschikbaar, types gedefinieerd, backward compatible

---

#### 🔧 Dev Context & Instructies — Epic 0

**Bestaande code (NIET VERVANGEN, wel uitbreiden):**
```
lib/cortex/
├── types.ts              # Bestaande types: CortexIntent, ExtractedEntities, BlockType
├── intent-classifier.ts  # V1 classifier (niet aanpassen in E0)
├── entity-extractor.ts   # Entity extraction (hergebruiken)
└── index.ts              # Exports (uitbreiden)

stores/
└── cortex-store.ts       # Bestaande store met ChatMessage, Artifact, RecentAction
```

**E0.S1 — CortexContext types**

*Bestand:* `lib/cortex/types.ts`
*Actie:* Voeg NIEUWE types toe NA bestaande types. Behoud alle bestaande exports.

*Toe te voegen types:*
- `CortexContext` - Context voor AI classificatie
- `IntentChain` - Multi-intent container
- `IntentAction` - Enkele actie in een chain
- `NudgeSuggestion` - Proactieve suggestie
- `LocalClassificationResult` - Reflex output (uitbreiding van bestaande `ClassificationResult`)
- `EscalationReason` - Waarom Reflex escaleert

*Voorbeeld signature:*
```typescript
export interface CortexContext {
  activePatient: { id: string; name: string; } | null;
  currentView: 'dashboard' | 'patient-detail' | 'agenda' | 'reports' | 'chat';
  shift: ShiftType;  // Hergebruik bestaande type
  // ... zie TO sectie 4.1 voor volledige definitie
}
```

*Done criteria:*
- [x] `pnpm lint` slaagt
- [x] Bestaande imports (`CortexIntent`, `ExtractedEntities`) werken nog
- [x] Nieuwe types geëxporteerd via `lib/cortex/index.ts`

---

**E0.S2 — Context API endpoint**

*Bestand:* `app/api/cortex/context/route.ts` (NIEUW)
*Actie:* Maak GET endpoint die context verzamelt uit store/database.

*Endpoint gedrag:*
- Haal actieve patiënt uit request context of store
- Haal agenda vandaag uit Supabase (mock data voor MVP)
- Retourneer `CortexContext` object

*Voorbeeld response:*
```json
{
  "context": {
    "activePatient": { "id": "123", "name": "Jan de Vries" },
    "currentView": "patient-detail",
    "shift": "ochtend",
    "currentTime": "2025-12-31T10:00:00Z",
    "agendaToday": [
      { "time": "14:00", "patientName": "Marie", "type": "intake" }
    ],
    "recentIntents": []
  }
}
```

*Done criteria:*
- [x] `GET /api/cortex/context` retourneert 200 met valid JSON
- [x] Response matcht `CortexContext` type

---

**E0.S3 — Feature flags**

*Bestand:* `lib/config/feature-flags.ts` (NIEUW)
*Actie:* Maak feature flag utility met env var support.

*Flags te implementeren:*
```typescript
export const FEATURE_FLAGS = {
  CORTEX_V2_ENABLED: process.env.NEXT_PUBLIC_CORTEX_V2 === 'true',
  CORTEX_MULTI_INTENT: process.env.NEXT_PUBLIC_CORTEX_MULTI_INTENT === 'true',
  CORTEX_NUDGE: process.env.NEXT_PUBLIC_CORTEX_NUDGE === 'true',
  CORTEX_LOGGING: process.env.NEXT_PUBLIC_CORTEX_LOGGING === 'true',
};
```

*Done criteria:*
- [x] Flags werken in dev (hardcoded `true`)
- [x] Flags leesbaar vanuit components

---

**E0.S4 — CortexStore V2 extensions**

*Bestand:* `stores/cortex-store.ts`
*Actie:* UITBREIDEN met nieuwe state en actions. Behoud bestaande `useCortexStore`.

*Toe te voegen state:*
- `context: CortexContext` - Huidige context
- `activeChain: IntentChain | null` - Actieve multi-intent chain
- `chainHistory: IntentChain[]` - Geschiedenis
- `suggestions: NudgeSuggestion[]` - Pending nudges
- `pendingClarification` - Clarification state

*Toe te voegen actions:*
- `setContext()`, `startChain()`, `updateActionStatus()`, `completeChain()`
- `addSuggestion()`, `acceptSuggestion()`, `dismissSuggestion()`

*Done criteria:*
- [x] Bestaande store werkt nog (backward compatible)
- [x] Nieuwe state observable in React DevTools
- [x] `pnpm lint` slaagt

---

**E0.S5 — Classification logging**

*Bestand:* `lib/cortex/logger.ts` (NIEUW)
*Actie:* Logging utility met PII sanitization.

*Functies:*
- `logClassification(result)` - Log naar console (dev) of API (prod)
- `sanitizeForLogging(input)` - Verwijder namen, BSN, telefoonnummers

*Voorbeeld:*
```typescript
// Input: "notitie Jan Jansen medicatie"
// Output: "notitie [NAAM] medicatie"
```

*Done criteria:*
- [x] Dev logs tonen classificatie resultaten
- [x] Namen worden gesanitized in productie mode

---

### Epic 1 — Reflex Arc (Layer 1)

**Epic Doel:** Razendsnelle (<20ms) afhandeling van simpele, eenduidige commando's.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E1.S1 | **Pattern matching** implementeren | Regex patterns voor alle intent types met weights | ✅ | E0.S1 | 2 |
| E1.S2 | **Escalatie triggers** detectie | Multi-intent signals, context signals, relative time | ✅ | E1.S1 | 2 |
| E1.S3 | **Ambiguity detection** | Top-2 score delta < 0.1 → escaleer | ✅ | E1.S1 | 1 |
| E1.S4 | **Unit tests** Reflex classifier | Test suite voor simpele en complexe inputs | ✅ | E1.S1-S3 | 1 |

**Deliverable:** Simpele commando's werken direct (<20ms)

---

#### 🔧 Dev Context & Instructies — Epic 1

**Bestaande code (ter referentie):**
```
lib/cortex/
├── intent-classifier.ts  # V1 classifier - REFERENTIE, niet aanpassen
│                         # Bevat INTENT_PATTERNS die je kunt hergebruiken
└── types.ts              # ClassificationResult type bestaat al
```

**Relatie V1 → V2:**
De bestaande `intent-classifier.ts` heeft al regex patterns en weights. De nieuwe `reflex-classifier.ts` bouwt hierop voort maar voegt toe:
- Escalatie logica (wanneer naar AI sturen)
- Ambiguity detection (top-2 vergelijking)
- Multi-intent signal detectie

---

**E1.S1 — Pattern matching**

*Bestand:* `lib/cortex/reflex-classifier.ts` (NIEUW)
*Actie:* Maak nieuwe classifier gebaseerd op V1 patterns, maar met escalatie-aware logic.

*Kernfunctie:*
```typescript
export function classifyWithReflex(input: string): LocalClassificationResult {
  // 1. Check escalatie triggers EERST
  // 2. Pattern matching met weights
  // 3. Return result met shouldEscalateToAI flag
}
```

*Hergebruik van V1:*
- Kopieer `INTENT_PATTERNS` uit `intent-classifier.ts`
- Pas weights aan: alleen >= 0.7 is "high confidence"
- Voeg `secondBestIntent` tracking toe

*Constants:*
```typescript
export const CONFIDENCE_THRESHOLD = 0.7;
export const AMBIGUITY_THRESHOLD = 0.1;
```

*Done criteria:*
- [x] "agenda vandaag" → `{ intent: 'agenda_query', shouldEscalateToAI: false }`
- [x] Processing time < 20ms
- [x] Bestaande V1 classifier blijft werken (backward compatible)

---

**E1.S2 — Escalatie triggers**

*Bestand:* `lib/cortex/reflex-classifier.ts`
*Actie:* Voeg `detectEscalationTriggers()` functie toe.

*Trigger patterns:*
```typescript
const MULTI_INTENT_SIGNALS = /\b(en|daarna|ook|eerst|dan|vervolgens)\b/i;
const CONTEXT_SIGNALS = /\b(hij|zij|hem|haar|zijn|die|deze|dat|dezelfde)\b/i;
const RELATIVE_TIME_SIGNALS = /\b(morgen|overmorgen|volgende week|over \d+ dagen?)\b/i;
```

*Logic:*
- Als EEN trigger matcht → `shouldEscalateToAI: true`
- Return `escalationReason` voor logging

*Done criteria:*
- [x] "Zeg Jan af en maak notitie" → escalates (`multi_intent_detected`)
- [x] "Maak notitie voor hem" → escalates (`needs_context`)
- [x] "Plan afspraak morgen" → escalates (`relative_time`)

---

**E1.S3 — Ambiguity detection**

*Bestand:* `lib/cortex/reflex-classifier.ts`
*Actie:* Track top-2 matches en vergelijk scores.

*Logic:*
```typescript
// Na pattern matching
const delta = bestMatch.confidence - secondBestMatch.confidence;
if (delta < AMBIGUITY_THRESHOLD) {
  return { ...result, shouldEscalateToAI: true, escalationReason: 'ambiguous' };
}
```

*Voorbeeld:*
- "plan wondzorg" matcht zowel `create_appointment` (0.72) als `dagnotitie` (0.68)
- Delta = 0.04 < 0.1 → escaleer naar AI

*Done criteria:*
- [x] Ambigue input triggert escalatie
- [x] `secondBestIntent` en `secondBestConfidence` in result

---

**E1.S4 — Unit tests**

*Bestand:* `lib/cortex/__tests__/reflex-classifier.test.ts` (NIEUW)
*Actie:* Test suite met Vitest.

*Test cases:*
```typescript
describe('Reflex Classifier', () => {
  describe('Simple intents - should NOT escalate', () => {
    test('"agenda vandaag"', ...);
    test('"zoek marie"', ...);
    test('"notitie jan medicatie"', ...);
  });
  
  describe('Complex intents - SHOULD escalate', () => {
    test('"zeg jan af en maak notitie"', ...);  // multi_intent
    test('"maak notitie voor hem"', ...);        // needs_context
    test('"plan afspraak morgen 14:00"', ...);   // relative_time
  });
  
  describe('Ambiguous intents - SHOULD escalate', () => {
    test('"plan wondzorg"', ...);  // ambiguous
  });
});
```

*Done criteria:*
- [x] `pnpm tsx lib/cortex/__tests__/reflex-classifier.test.ts` slaagt (25 tests)
- [x] Coverage voor alle escalatie scenarios

---

### Epic 2 — Intent Orchestrator (Layer 2)

**Epic Doel:** AI-gedreven analyse voor complexe zinnen, multi-intents en context resolution.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E2.S1 | **System prompt** voor Orchestrator | Prompt met context, intent types, output format | ✅ | E0.S1 | 2 |
| E2.S2 | **Context formatting** voor AI | `formatContextForPrompt()` functie | ✅ | E0.S2 | 1 |
| E2.S3 | **AI classification** endpoint | `classifyWithOrchestrator()` met Claude 3.5 Haiku | ✅ | E2.S1, E2.S2 | 3 |
| E2.S4 | **IntentChain parsing** | JSON response naar IntentChain met actions | ✅ | E2.S3 | 2 |
| E2.S5 | **POST /api/cortex/classify** | Hybrid endpoint: Reflex → Orchestrator fallback | ✅ | E1.S1-S3, E2.S3-S4 | 3 |
| E2.S6 | **Graceful fallback** | Bij AI failure → fallback naar Reflex-only | ✅ | E2.S5 | 2 |

**Deliverable:** "Zeg Jan af en maak notitie" wordt correct geparsed naar 2 acties

---

#### 🔧 Dev Context & Instructies — Epic 2

**Bestaande code (ter referentie):**
```
lib/cortex/
├── intent-classifier-ai.ts  # V1 AI classifier - bevat Anthropic setup
├── chat-api.ts              # Bestaande chat API calls
└── entity-extractor.ts      # Entity extraction (hergebruiken)

app/api/cortex/             # Bestaande API routes (indien aanwezig)
```

**Dependencies:**
- `@anthropic-ai/sdk` is al geïnstalleerd
- `ANTHROPIC_API_KEY` in `.env.local`

---

**E2.S1 — System prompt**

*Bestand:* `lib/cortex/orchestrator.ts` (NIEUW)
*Actie:* Definieer `ORCHESTRATOR_SYSTEM_PROMPT` constant.

*Prompt structuur:*
```typescript
const ORCHESTRATOR_SYSTEM_PROMPT = `Je bent de Intent Orchestrator voor Cortex...

## Je Taak
Analyseer de gebruikersinput en extraheer ALLE intenties.

## Context die je krijgt
- Actieve patiënt, Agenda vandaag, Recente acties, Huidige weergave

## Intent Types
1. dagnotitie, 2. zoeken, 3. overdracht, 4. agenda_query, 
5. create_appointment, 6. cancel_appointment, 7. reschedule_appointment

## Multi-Intent Detectie
Let op: "en", "daarna", "ook", "eerst", "dan", "vervolgens"

## Pronoun Resolution
"hij/zij" → actieve patiënt

## Output Format
ALLEEN valid JSON (geen markdown):
{ "actions": [...], "reasoning": "...", "needsClarification": false }
`;
```

*Zie TO sectie 8.3 voor volledige prompt.*

*Done criteria:*
- [x] Prompt is duidelijk en in het Nederlands
- [x] JSON output format gedocumenteerd

---

**E2.S2 — Context formatting**

*Bestand:* `lib/cortex/orchestrator.ts`
*Actie:* `formatContextForPrompt(context: CortexContext): string`

*Output format:*
```
🧑 Actieve patiënt: Jan de Vries (ID: 123)
📍 Huidige weergave: patient-detail
⏰ Tijd: 10:30 (ochtenddienst)
📅 Agenda vandaag:
   - 14:00: Marie (intake)
   - 15:30: Piet (follow-up)
```

*Done criteria:*
- [x] Context leesbaar voor AI
- [x] Graceful handling van null values

---

**E2.S3 — AI classification**

*Bestand:* `lib/cortex/orchestrator.ts`
*Actie:* `classifyWithOrchestrator()` async functie.

*Implementatie outline:*
```typescript
export async function classifyWithOrchestrator(
  input: string,
  context: CortexContext
): Promise<AIClassificationResult> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  
  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 512,
    temperature: 0,  // Consistente output
    system: ORCHESTRATOR_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `## Context\n${formatContextForPrompt(context)}\n\n## Input\n"${input}"` }],
  });
  
  // Parse JSON response
  // Build IntentChain
  // Return result
}
```

*Done criteria:*
- [x] Multi-intent input → meerdere actions in response
- [x] Processing time ~400ms (acceptabel)
- [x] Tokens usage gelogd

---

**E2.S4 — IntentChain parsing**

*Bestand:* `lib/cortex/orchestrator.ts`
*Actie:* `parseAIResponse()` functie met error handling.

*Parsing logic:*
```typescript
function parseAIResponse(rawText: string): ParsedResponse {
  // 1. Strip markdown code blocks (```json ... ```)
  // 2. JSON.parse met try/catch
  // 3. Validate tegen schema
  // 4. Fallback naar { actions: [{ intent: 'unknown' }] } bij parse error
}
```

*Edge cases:*
- AI retourneert markdown code fence → strip
- Invalid JSON → fallback to unknown
- Missing fields → defaults

*Done criteria:*
- [x] Valid JSON correct geparsed
- [x] Invalid JSON → graceful fallback
- [x] IntentChain correct opgebouwd

---

**E2.S5 — Hybrid classify endpoint**

*Bestand:* `app/api/cortex/classify/route.ts` (NIEUW)
*Actie:* POST endpoint die Reflex → Orchestrator flow implementeert.

*Flow:*
```typescript
export async function POST(request: NextRequest) {
  const { input, context } = await request.json();
  
  // Step 1: Try Reflex
  const reflexResult = classifyWithReflex(input);
  
  // Step 2: Escalate if needed
  if (reflexResult.shouldEscalateToAI) {
    const aiResult = await classifyWithOrchestrator(input, context);
    return NextResponse.json({ ...aiResult, handledBy: 'orchestrator' });
  }
  
  // Step 3: Return Reflex result
  return NextResponse.json({ chain: buildChainFromReflex(reflexResult), handledBy: 'reflex' });
}
```

*Done criteria:*
- [x] Simpele input → Reflex (geen AI call)
- [x] Complexe input → Orchestrator
- [x] Response bevat `handledBy` field

---

**E2.S6 — Graceful fallback**

*Bestand:* `lib/cortex/orchestrator.ts`
*Actie:* try/catch rond AI call met fallback naar Reflex.

*Fallback scenarios:*
- Anthropic API 503 → use Reflex result
- Timeout (>5s) → use Reflex result
- Parse error → use Reflex result met warning

*Voorbeeld:*
```typescript
try {
  return await classifyWithOrchestrator(input, context);
} catch (error) {
  console.error('[Cortex] AI failed, fallback to Reflex:', error);
  return buildFallbackResult(classifyWithReflex(input));
}
```

*Done criteria:*
- [x] AI failure → geen crash
- [x] User ziet resultaat (mogelijk minder intelligent)
- [x] Error gelogd voor monitoring

---

### Epic 3 — UI Components

**Epic Doel:** Visuele feedback voor multi-intent flows en clarification.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E3.S1 | **ActionChainCard** component | Stacked cards met sequence, status, confidence | ✅ | E0.S1 | 3 |
| E3.S2 | **ActionItem** sub-component | Status icons, confirmation buttons, error states | ✅ | E3.S1 | 2 |
| E3.S3 | **ClarificationCard** component | Vraag + keuze-knoppen bij ambigue input | ✅ | — | 2 |
| E3.S4 | **Processing indicator** | Spinner/skeleton bij AI-acties | ✅ | — | 1 |

**Deliverable:** Multi-intent flows visueel weergegeven

---

#### 🔧 Dev Context & Instructies — Epic 3

**Bestaande code (ter referentie):**
```
components/
├── cortex/
│   ├── chat/           # Bestaande chat components
│   ├── blocks/         # Artifact blocks (dagnotitie, agenda, etc.)
│   ├── command-center/ # Command center layout
│   └── artifacts/      # Artifact containers
└── ui/
    ├── button.tsx      # shadcn/ui button
    ├── card.tsx        # shadcn/ui card
    └── badge.tsx       # shadcn/ui badge
```

**Styling conventies:**
- TailwindCSS utility classes
- shadcn/ui component patterns
- `cn()` utility voor conditional classes

---

**E3.S1 — ActionChainCard component**

*Bestand:* `components/cortex/chat/action-chain-card.tsx` (NIEUW)
*Actie:* Container voor multi-intent flow weergave.

*Props interface:*
```typescript
interface ActionChainCardProps {
  chain: IntentChain;
  onConfirm: (actionId: string) => void;
  onSkip: (actionId: string) => void;
  onRetry: (actionId: string) => void;
}
```

*Structuur:*
```tsx
<div className="bg-white rounded-lg border">
  {/* Header: "2 acties gedetecteerd" */}
  {/* ActionItem per actie */}
  {/* Collapsible AI reasoning */}
</div>
```

*Done criteria:*
- [x] Toont alle acties in chain
- [x] Header toont aantal acties
- [x] AI reasoning collapsible (details/summary)

---

**E3.S2 — ActionItem sub-component**

*Bestand:* `components/cortex/chat/action-chain-card.tsx` (in zelfde file of apart)
*Actie:* Enkele actie row met status en controls.

*Status icons mapping:*
```typescript
const STATUS_ICONS = {
  pending: <div className="w-2 h-2 rounded-full bg-slate-300" />,
  confirming: <AlertCircle className="w-4 h-4 text-amber-500" />,
  executing: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
  success: <Check className="w-4 h-4 text-green-500" />,
  failed: <X className="w-4 h-4 text-red-500" />,
  skipped: <X className="w-4 h-4 text-slate-400" />,
};
```

*Confidence badge kleuren:*
```typescript
confidence >= 0.9  → "bg-green-100 text-green-700"
confidence >= 0.7  → "bg-amber-100 text-amber-700"
confidence < 0.7   → "bg-red-100 text-red-700"
```

*Intent labels (Nederlands):*
```typescript
const INTENT_LABELS = {
  dagnotitie: 'Notitie',
  zoeken: 'Zoeken',
  cancel_appointment: 'Afspraak annuleren',
  // ...
};
```

*Done criteria:*
- [x] Status icon correct per status
- [x] Confidence badge met juiste kleur
- [x] Confirmation buttons bij `confirming` status
- [x] Retry button bij `failed` status

---

**E3.S3 — ClarificationCard component**

*Bestand:* `components/cortex/chat/clarification-card.tsx` (NIEUW)
*Actie:* UI voor verduidelijkingsvragen.

*Props interface:*
```typescript
interface ClarificationCardProps {
  question: string;           // "Bedoel je een notitie of afspraak?"
  options: string[];          // ["Notitie maken", "Afspraak inplannen"]
  onSelect: (option: string) => void;
}
```

*Voorbeeld weergave:*
```
┌─────────────────────────────────────────┐
│ 💡 Bedoel je een notitie of afspraak?   │
│                                         │
│ [Notitie maken]  [Afspraak inplannen]   │
└─────────────────────────────────────────┘
```

*Done criteria:*
- [x] Vraag duidelijk zichtbaar
- [x] Knoppen voor elke optie
- [x] Click triggert `onSelect` callback

---

**E3.S4 — Processing indicator**

*Bestand:* Integreer in `components/cortex/chat/` of bestaande chat components
*Actie:* Toon "denk" indicator wanneer AI werkt.

*Wanneer tonen:*
- Na user input, tijdens classificatie
- Alleen bij AI calls (niet bij Reflex)

*Varianten:*
```tsx
// Optie 1: Simpele spinner met tekst
<div className="flex items-center gap-2 text-slate-500">
  <Loader2 className="w-4 h-4 animate-spin" />
  <span>Even nadenken...</span>
</div>

// Optie 2: Skeleton loader (chat message style)
<div className="animate-pulse bg-slate-100 rounded-lg h-20" />
```

*Done criteria:*
- [x] Indicator zichtbaar tijdens AI call
- [x] Verdwijnt zodra response binnen is
- [x] Geen "frozen" UI gevoel

---

### Epic 4 — Nudge MVP (Layer 3)

**Epic Doel:** Proactieve suggesties na succesvolle acties (proof of concept).

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E4.S1 | **Protocol rules** definiëren | Wondzorg-controle regel (hardcoded) | ⏳ | E0.S1 | 1 |
| E4.S2 | **evaluateNudge** functie | Check protocol rules na actie completion | ⏳ | E4.S1 | 2 |
| E4.S3 | **NudgeToast** component | Toast met countdown timer, accept/dismiss | ⏳ | E0.S4 | 2 |

**Demo Case:**
```
Actie: Notitie "wond verzorgd" → Suggestie: "Wondcontrole inplannen over 3 dagen?"
```

**Deliverable:** Proactieve suggestie getoond na wondzorg notitie

---

#### 🔧 Dev Context & Instructies — Epic 4

**Concept uitleg:**
Nudge is een "post-action" systeem. Nadat een actie succesvol is uitgevoerd, checkt het systeem of er een protocol-regel matcht. Zo ja → toon suggestie.

**Bestaande code:**
- Geen bestaande nudge code
- `stores/cortex-store.ts` moet uitgebreid worden met suggestions state (E0.S4)

---

**E4.S1 — Protocol rules**

*Bestand:* `lib/cortex/nudge.ts` (NIEUW)
*Actie:* Definieer `ProtocolRule` interface en hardcoded regels.

*MVP regels (1-2 voor demo):*
```typescript
export const PROTOCOL_RULES: ProtocolRule[] = [
  {
    id: 'wondzorg-controle',
    name: 'Wondcontrole na verzorging',
    trigger: {
      intent: 'dagnotitie',
      conditions: [
        { field: 'content', operator: 'contains', value: 'wond' },
      ],
    },
    suggestion: {
      intent: 'create_appointment',
      message: 'Wondcontrole inplannen over 3 dagen?',
      prefillFrom: (source) => ({
        patientName: source.patientName,
        appointmentType: 'follow-up',
      }),
    },
    priority: 'medium',
    enabled: true,
  },
];
```

*Condition operators:*
- `equals` - exact match
- `contains` - substring (case insensitive)
- `matches` - regex match
- `exists` - field is not null/empty

*Done criteria:*
- [ ] ProtocolRule type gedefinieerd
- [ ] Minimaal 1 werkende regel (wondzorg)

---

**E4.S2 — evaluateNudge functie**

*Bestand:* `lib/cortex/nudge.ts`
*Actie:* Check alle regels tegen een voltooide actie.

*Functie signature:*
```typescript
export function evaluateNudge(completedAction: IntentAction): NudgeSuggestion[] {
  // 1. Filter enabled rules
  // 2. Check trigger.intent match
  // 3. Check all conditions
  // 4. Build suggestion if match
  // 5. Sort by priority (high first)
}
```

*Condition checker:*
```typescript
function checkCondition(condition: ProtocolCondition, entities: ExtractedEntities): boolean {
  const value = entities[condition.field];
  switch (condition.operator) {
    case 'contains':
      return typeof value === 'string' && value.toLowerCase().includes(condition.value.toLowerCase());
    // ...
  }
}
```

*Done criteria:*
- [ ] Notitie met "wond" → NudgeSuggestion returned
- [ ] Notitie zonder "wond" → empty array
- [ ] Suggesties gesorteerd op priority

---

**E4.S3 — NudgeToast component**

*Bestand:* `components/cortex/command-center/nudge-toast.tsx` (NIEUW)
*Actie:* Toast UI met countdown en actions.

*Props interface:*
```typescript
interface NudgeToastProps {
  suggestion: NudgeSuggestion;
  onAccept: (suggestionId: string) => void;
  onDismiss: (suggestionId: string) => void;
}
```

*Features:*
- Progress bar countdown (5 minuten default)
- Priority-based styling:
  - `high` → `border-red-200 bg-red-50`
  - `medium` → `border-amber-200 bg-amber-50`
  - `low` → `border-blue-200 bg-blue-50`
- Accept/Dismiss buttons
- Auto-dismiss na expiry

*Countdown implementatie:*
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) onDismiss(suggestion.id);
    setTimeLeft(remaining / total * 100);
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

*Done criteria:*
- [ ] Toast verschijnt na matching actie
- [ ] Progress bar animeert
- [ ] Accept triggert nieuwe actie
- [ ] Dismiss verwijdert toast

---

### Epic 5 — Integration & Polish

**Epic Doel:** End-to-end flow werkend, getest en demo-ready.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E5.S1 | **CommandCenter V3** integratie | ActionChainCard, NudgeToast in chat panel | ⏳ | E3, E4 | 3 |
| E5.S2 | **Chain execution** flow | Sequential action execution met confirmations | ⏳ | E5.S1 | 2 |
| E5.S3 | **Integration tests** | E2E tests voor hele flow | ⏳ | E5.S1-S2 | 2 |
| E5.S4 | **Demo scenario** voorbereiden | Happy path + edge cases gedocumenteerd | ⏳ | E5.S3 | 1 |

**Demo Flow (5 minuten):**
1. Simpel commando → Reflex (direct)
2. Multi-intent commando → Orchestrator (ActionChainCard)
3. Context-dependent → Pronoun resolution
4. Wondzorg notitie → Nudge suggestie

**Deliverable:** Demo-ready prototype

---

#### 🔧 Dev Context & Instructies — Epic 5

**Bestaande code (aan te passen):**
```
components/cortex/
├── command-center/
│   ├── command-center.tsx    # Hoofd container
│   ├── chat-panel.tsx        # Chat interface (indien aanwezig)
│   └── index.ts              # Exports
└── chat/
    └── chat-messages.tsx     # Message rendering
```

**Feature flag check:**
Alle V2 features achter feature flags voor backward compatibility.

---

**E5.S1 — CommandCenter V3 integratie**

*Bestanden:*
- `components/cortex/command-center/command-center.tsx` (AANPASSEN)
- Eventueel chat panel component

*Actie:* Integreer nieuwe components in bestaande UI.

*Integratie punten:*
```tsx
// In chat messages rendering
{result.chain.actions.length > 1 ? (
  <ActionChainCard 
    chain={result.chain} 
    onConfirm={handleConfirm}
    onSkip={handleSkip}
    onRetry={handleRetry}
  />
) : (
  // Bestaande single-action UI
)}

// Nudge toast (fixed position)
{suggestions.length > 0 && (
  <NudgeToast 
    suggestion={suggestions[0]}
    onAccept={handleAcceptSuggestion}
    onDismiss={handleDismissSuggestion}
  />
)}
```

*Feature flag wrapper:*
```tsx
import { FEATURE_FLAGS } from '@/lib/config/feature-flags';

{FEATURE_FLAGS.CORTEX_MULTI_INTENT && chain.actions.length > 1 && (
  <ActionChainCard ... />
)}
```

*Done criteria:*
- [ ] ActionChainCard toont bij multi-intent
- [ ] NudgeToast verschijnt na matching actie
- [ ] V1 UI werkt nog als flags uit staan

---

**E5.S2 — Chain execution flow**

*Bestand:* `lib/cortex/chain-executor.ts` (NIEUW) of in store actions
*Actie:* Sequentiële uitvoering van acties in een chain.

*Flow:*
```typescript
async function executeChain(chain: IntentChain): Promise<void> {
  for (const action of chain.actions) {
    // 1. Update status → 'confirming' (als requiresConfirmation)
    // 2. Wacht op user confirmation OF skip
    // 3. Update status → 'executing'
    // 4. Execute action
    // 5. Update status → 'success' of 'failed'
    // 6. Trigger Nudge evaluation
  }
}
```

*Confirmation handling:*
```typescript
// Als action.requiresConfirmation === true
// Wacht tot user op "Bevestig" of "Overslaan" klikt
// Store: pendingConfirmation state
```

*Done criteria:*
- [ ] Acties worden sequentieel uitgevoerd
- [ ] Confirmation dialog werkt
- [ ] Failed action stopt niet hele chain
- [ ] Nudge triggered na success

---

**E5.S3 — Integration tests**

*Bestand:* `__tests__/integration/cortex-v2.test.ts` (NIEUW)
*Actie:* E2E tests voor complete flows.

*Test scenarios:*
```typescript
describe('Cortex V2 Integration', () => {
  describe('Classification Flow', () => {
    test('simple input → Reflex handles', async () => {
      const response = await fetch('/api/cortex/classify', {
        method: 'POST',
        body: JSON.stringify({ input: 'agenda vandaag', context: mockContext }),
      });
      expect(response.handledBy).toBe('reflex');
    });
    
    test('multi-intent → Orchestrator handles', async () => {
      const response = await fetch('/api/cortex/classify', {
        method: 'POST',
        body: JSON.stringify({ input: 'zeg jan af en maak notitie', context: mockContext }),
      });
      expect(response.handledBy).toBe('orchestrator');
      expect(response.chain.actions).toHaveLength(2);
    });
  });
  
  describe('Nudge Flow', () => {
    test('wondzorg notitie → suggestion', ...);
  });
});
```

*Done criteria:*
- [ ] `pnpm test __tests__/integration/` slaagt
- [ ] Coverage voor happy paths
- [ ] AI calls gemockt voor deterministische tests

---

**E5.S4 — Demo scenario**

*Bestand:* `docs/intent/demo-script-cortex-v2.md` (NIEUW)
*Actie:* Documenteer demo flow met exacte zinnen en verwachte resultaten.

*Demo script (5 minuten):*
```markdown
## Demo: Cortex V2 - Van Reactief naar Proactief

### Setup
- Open EPD met patiënt "Jan de Vries"
- Shift: Ochtenddienst

### Scene 1: Snelheid (30 sec)
**Zeg:** "Agenda vandaag"
**Verwacht:** Direct resultaat (<20ms), geen spinner
**Highlight:** "Dit is Layer 1 - de Reflex Arc"

### Scene 2: Multi-Intent (1.5 min)
**Zeg:** "Zeg Jan af en maak notitie dat hij griep heeft"
**Verwacht:** ActionChainCard met 2 acties
**Highlight:** "Het systeem begrijpt dat dit twee dingen zijn"

### Scene 3: Context (1 min)
**Zeg:** "Maak notitie voor haar" (met Marie open)
**Verwacht:** Notitie voor Marie
**Highlight:** "Het snapt wie 'haar' is"

### Scene 4: Proactiviteit (1.5 min)
**Zeg:** "Notitie: wond verzorgd, ziet er goed uit"
**Verwacht:** NudgeToast - "Wondcontrole inplannen?"
**Highlight:** "Het denkt mee over vervolgacties"

### Backup
- Als AI down: toon Reflex-only (graceful degradation)
- Pre-seeded data beschikbaar
```

*Done criteria:*
- [ ] Demo script geschreven
- [ ] Test data geseeded
- [ ] Backup scenario getest

---

## 6. Kwaliteit & Testplan

### Test Types

| Test Type | Scope | Tools | Verantwoordelijke |
|-----------|-------|-------|-------------------|
| Unit Tests | Reflex classifier, entity extractor, nudge | Vitest | Developer |
| Integration Tests | API endpoints, AI responses | Vitest + MSW | Developer |
| E2E Tests | Complete flows | Playwright | Developer |
| Manual Tests | Demo scenarios | Checklist | Developer |

### Test Coverage Targets

- **Unit tests:** Reflex classifier, entity extractor
- **Integration tests:** `/api/cortex/classify`, `/api/cortex/context`
- **E2E tests:** Multi-intent flow, Nudge flow

### Manual Test Checklist (MVP)

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | "Agenda vandaag" | Direct resultaat (<20ms), geen spinner |
| 2 | "Zoek Jan" | Direct zoekresultaat |
| 3 | "Zeg Jan af en maak notitie: ziek" | 2 acties in ActionChainCard |
| 4 | "Maak notitie voor hem" (met actieve patiënt) | Patiëntnaam correct resolved |
| 5 | "Plan afspraak morgen 14:00" | Datum correct berekend |
| 6 | "Notitie: wond verzorgd" | NudgeToast verschijnt |
| 7 | Ambigue input | ClarificationCard met opties |
| 8 | AI API down | Graceful fallback naar Reflex |

### Test Zinnen Dataset

```json
{
  "single_intent": [
    { "input": "notitie jan medicatie", "expected": ["dagnotitie"] },
    { "input": "zoek marie", "expected": ["zoeken"] },
    { "input": "agenda vandaag", "expected": ["agenda_query"] }
  ],
  "multi_intent": [
    {
      "input": "Zeg Jan af en maak notitie dat hij griep heeft",
      "expected": ["cancel_appointment", "dagnotitie"]
    }
  ],
  "context_dependent": [
    {
      "input": "Maak notitie voor hem",
      "context": { "activePatient": { "name": "Piet" } },
      "expected": ["dagnotitie"],
      "entities": [{ "patientResolution": "pronoun" }]
    }
  ]
}
```

---

## 7. Demo & Presentatieplan

### Demo Scenario

**Duur:** 5 minuten
**Doelgroep:** Developers, stakeholders, social media (Build in Public)
**Locatie:** Localhost of Vercel preview

### Demo Flow

| Stap | Actie | Doel | Tijd |
|------|-------|------|------|
| 1 | "Agenda vandaag" | Toon Reflex snelheid | 30s |
| 2 | "Zeg Jan af en maak notitie: hij heeft griep" | Toon Multi-intent + ActionChainCard | 1.5m |
| 3 | "Maak notitie voor haar" (met Marie open) | Toon Pronoun resolution | 1m |
| 4 | "Plan afspraak morgen 14:00" | Toon Relatieve tijd | 30s |
| 5 | "Wond verzorgd, ziet er goed uit" | Toon Nudge suggestie | 1.5m |

### Backup Plan

- Lokale versie bij internet issues
- Pre-seeded data als AI API niet reageert
- Screenshots als complete fallback

---

## 8. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| **AI output inconsistent** | Middel | Hoog | Temperature=0, strikte JSON schema, fallback to unknown | Dev |
| **Multi-intent parsing faalt** | Laag | Hoog | Uitgebreide test dataset, fallback naar single intent | Dev |
| **Anthropic API down** | Laag | Middel | Graceful degradation naar Reflex-only | Dev |
| **Scope creep** | Hoog | Middel | Strikte MVP scope, 6 user stories max | PM |
| **Privacy breach (logs)** | Laag | Hoog | Input sanitization, geen PII in production logs | Dev |
| **False positive Nudge** | Middel | Laag | Specifieke regex met word boundaries | Dev |
| **Performance degradatie** | Laag | Middel | Caching, monitoring, threshold tuning | Dev |

---

## 9. MVP User Stories Mapping

De MVP User Stories uit `mvp-userstories-intent-system.md` zijn als volgt verdeeld:

### Thema 1: De Slimme Assistent (Core Intelligence)

| User Story | Epic | Stories |
|------------|------|---------|
| **US-MVP-01:** Twee acties in één zin | E2 | E2.S1-S5 |
| **US-MVP-02:** Verwijzen naar "deze patiënt" of "hij" | E2 | E2.S2-S4 |
| **US-MVP-03:** Impliciete tijd ("morgen") | E1, E2 | E1.S2, E2.S2 |

### Thema 2: Hybride Snelheid (Architecture)

| User Story | Epic | Stories |
|------------|------|---------|
| **US-MVP-04:** Simpele commando's direct (<20ms) | E1 | E1.S1-S4 |
| **US-MVP-05:** Zien dat systeem nadenkt | E3 | E3.S4 |

### Thema 3: De Partner (Proactivity)

| User Story | Epic | Stories |
|------------|------|---------|
| **US-MVP-06:** Proactieve suggestie (wondzorg) | E4 | E4.S1-S3 |

---

## 10. Succescriteria

### Functionele Criteria

| Criterium | Target | Meetmethode |
|-----------|--------|-------------|
| Multi-intent herkenning | "X en Y" zinnen correct gesplitst | Test dataset |
| Pronoun resolution | "hij/zij" correct resolved | Test met actieve patiënt |
| Reflex hit rate | >70% lokaal afgehandeld | Logging metrics |
| AI latency p95 | <800ms | Performance monitoring |
| Nudge trigger | Wondzorg → suggestie getoond | Manual test |

### UX Criteria

| Criterium | Target |
|-----------|--------|
| Geen "Ik begrijp het niet" | Altijd poging tot begrip of clarification |
| Processing feedback | Spinner bij AI-acties |
| Demo duur | Volledige flow in ≤5 minuten |

### Technische Criteria

| Criterium | Target |
|-----------|--------|
| Reflex latency | <20ms |
| AI fallback werkt | Bij Anthropic 503 → graceful degradation |
| Geen PII in logs | Input gesanitized |

---

## 11. Referenties

### Mission Control Documents

| Document | Locatie |
|----------|---------|
| PRD | `docs/intent/prd-cortex-v2.md` |
| FO | `docs/intent/fo-cortex-intent-system-v2.md` |
| TO | `docs/intent/to-cortex-v2.md` |
| Architectuur | `docs/intent/architecture-cortex-v2.md` |
| MVP User Stories | `docs/intent/mvp-userstories-intent-system.md` |
| Haalbaarheidsanalyse | `docs/intent/haalbaarheidsanalyse-cortex-v2.md` |

### Tech Documentatie

- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Anthropic: https://docs.anthropic.com
- Zustand: https://docs.pmnd.rs/zustand

---

## 12. Glossary

| Term | Betekenis |
|------|-----------|
| **Cortex** | Het intent classificatie systeem (voorheen "Swift") |
| **Reflex Arc** | Layer 1 - snelle lokale pattern matching (<20ms) |
| **Orchestrator** | Layer 2 - AI-gedreven classificatie (~400ms) |
| **Nudge** | Layer 3 - proactieve suggesties na acties |
| **IntentChain** | Lijst van intents uit één gebruikersinput |
| **Entity** | Geëxtraheerde data (patiëntnaam, datum, etc.) |
| **Artifact** | UI component voor een specifieke taak |
| **Escalatie** | Doorsturen van Reflex naar Orchestrator |

---

## Versiehistorie

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 30-12-2025 | Colin Lit | Initiële versie op basis van PRD, FO, TO, Architecture docs |
| v1.1 | 31-12-2025 | Colin Lit | Dev-instructies per epic toegevoegd, file mappings, done criteria |
| v1.2 | 01-01-2026 | Colin Lit | Epic 2 (Intent Orchestrator) compleet - alle 6 stories afgerond |
| v1.3 | 01-01-2026 | Colin Lit | Epic 3 (UI Components) compleet - ActionChainCard, ActionItem, ClarificationCard, ProcessingIndicator |
