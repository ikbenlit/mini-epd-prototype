# Technisch Ontwerp (TO) – Cortex V2

**Projectnaam:** Cortex Intent System V2
**Versie:** v1.1
**Datum:** 30-12-2025
**Auteur:** Colin Lit (Antigravity AI)

---

## 1. Doel en relatie met PRD en FO

**Doel van dit document:**
Dit Technisch Ontwerp (TO) beschrijft **hoe** het Cortex V2 systeem technisch wordt gebouwd. Het document vertaalt de functionele specificaties uit het FO naar concrete architectuur, techstack, datamodellen en implementatiedetails.

**Relatie met andere documenten:**
- **FO:** `fo-cortex-intent-system-v2.md` - Beschrijft het *wat* en *waarom*
- **Architectuur:** `architecture-cortex-v2.md` - High-level architectuurvisie
- **MVP Scope:** `mvp-userstories-intent-system.md` - User stories en acceptatiecriteria
- **Haalbaarheid:** `haalbaarheidsanalyse-cortex-v2.md` - Gap analyse en effort schatting

**Kernprincipe:**
> "We stoppen met optimaliseren voor milliseconden en starten met optimaliseren voor intelligentie."

---

## 2. Technische Architectuur Overzicht

### 2.1 The Three-Layer Cortex Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INPUT                                         │
│                    "Zeg Jan af en maak notitie: grieperig"                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: REFLEX ARC                                              [<20ms]   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Local Regex Pattern Matching                                      │   │
│  │  • High-confidence simple commands only (>= 0.7)                     │   │
│  │  • Examples: "agenda", "zoek jan", "notitie"                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Decision: Confidence >= 0.7 AND no escalation triggers? → EXECUTE         │
│            Otherwise → Pass to Layer 2                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    [Complex/Multi-intent/Low confidence/Ambiguous]
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 2: INTENT ORCHESTRATOR (AI CORTEX)                       [~400ms]    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Claude 3.5 Haiku (fast, cheap, smart)                             │   │
│  │  • Context injection: ActivePatient, CurrentView, Agenda, History    │   │
│  │  • Multi-intent parsing: splits "X en Y" into action chain           │   │
│  │  • Entity disambiguation: "hij" → active patient                     │   │
│  │  • Clarification questions if truly ambiguous                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Output: IntentChain { actions: [Action1, Action2, ...] }                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  EXECUTION ENGINE                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Sequential or parallel action execution                           │   │
│  │  • Confirmation dialogs for destructive actions                      │   │
│  │  • Rollback support for failed chains                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                            [Action Completed]
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 3: NUDGE (POST-ACTION INTELLIGENCE)                       [async]    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Protocol Rules Engine: medical domain knowledge                   │   │
│  │  • Trigger evaluation: "Does this action warrant a follow-up?"       │   │
│  │  • Suggestion generation: "Wondcontrole inplannen?"                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Output: Suggestion Toast / Follow-up Card                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Diagram

```
┌──────────┐    ┌─────────┐    ┌─────────────┐    ┌──────────┐    ┌───────────┐
│  Speech  │───►│  Input  │───►│   Classify  │───►│ Execute  │───►│  Nudge    │
│  /Text   │    │  Buffer │    │   (L1/L2)   │    │  Chain   │    │  Engine   │
└──────────┘    └─────────┘    └─────────────┘    └──────────┘    └───────────┘
                                     │                  │               │
                                     ▼                  ▼               ▼
                              ┌─────────────┐    ┌──────────┐    ┌───────────┐
                              │   Cortex    │    │ Artifact  │    │ Suggestion│
                              │   Store     │◄───│ Updates   │    │   Toast   │
                              └─────────────┘    └──────────┘    └───────────┘
```

---

## 3. Techstack Selectie

| Component | Technologie | Argumentatie | Alternatieven |
|-----------|-------------|--------------|---------------|
| Frontend | Next.js 15 | React framework, App Router, TypeScript | SvelteKit, Remix |
| Backend | Next.js API Routes | Co-located met frontend, Server Actions | Express, FastAPI |
| Database | Supabase (PostgreSQL) | Realtime, RLS, auth included | Firebase, PlanetScale |
| AI Model | Claude 3.5 Haiku | Snel (~400ms), goedkoop, Nederlands | GPT-4o-mini, Gemini Flash |
| State Management | Zustand | Lightweight, devtools, persist | Redux, Jotai |
| Styling | TailwindCSS | Utility-first, shadcn/ui compatibel | styled-components |
| Hosting | Vercel | Zero-config Next.js, edge functions | Netlify, Railway |

---

## 4. Datamodel

### 4.1 Core Types (`lib/cortex/types.ts`)

```typescript
// ============================================================================
// THRESHOLDS & CONSTANTS
// ============================================================================

/** Minimum score om lokaal af te handelen (industry standard: 0.7) */
export const CONFIDENCE_THRESHOLD = 0.7;

/** Minimum verschil tussen top-2 scores om niet-ambigue te zijn */
export const AMBIGUITY_THRESHOLD = 0.1;

// ============================================================================
// INTENT TYPES
// ============================================================================

export type CortexIntent =
  | 'dagnotitie'
  | 'zoeken'
  | 'overdracht'
  | 'agenda_query'
  | 'create_appointment'
  | 'cancel_appointment'
  | 'reschedule_appointment'
  | 'unknown';

export type EscalationReason =
  | 'low_confidence'
  | 'ambiguous'
  | 'multi_intent_detected'
  | 'needs_context'
  | 'relative_time';

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface CortexContext {
  activePatient: {
    id: string;
    name: string;
    recentNotes?: string[];
    upcomingAppointments?: {
      date: Date;
      type: string;
    }[];
  } | null;

  currentView: 'dashboard' | 'patient-detail' | 'agenda' | 'reports' | 'chat';
  shift: ShiftType;
  currentTime: Date;

  agendaToday: {
    time: string;
    patientName: string;
    patientId: string;
    type: string;
  }[];

  recentIntents: {
    intent: CortexIntent;
    patientName?: string;
    timestamp: Date;
  }[];

  userPreferences?: {
    confirmationLevel: 'always' | 'destructive' | 'never';
    frequentIntents: CortexIntent[];
  };
}

// ============================================================================
// CLASSIFICATION RESULT TYPES
// ============================================================================

export interface LocalClassificationResult {
  intent: CortexIntent;
  confidence: number;

  /** Op-één-na-beste match voor ambiguity detection */
  secondBestIntent?: CortexIntent;
  secondBestConfidence?: number;

  matchedPattern?: string;
  processingTimeMs: number;

  shouldEscalateToAI: boolean;
  escalationReason?: EscalationReason;
}

// ============================================================================
// INTENT CHAIN (Multi-Intent Support)
// ============================================================================

export interface IntentChain {
  id: string;
  originalInput: string;
  createdAt: Date;

  actions: IntentAction[];
  status: 'pending' | 'executing' | 'completed' | 'partial' | 'failed';

  meta: {
    source: 'local' | 'ai';
    processingTimeMs: number;
    aiReasoning?: string;
  };
}

export interface IntentAction {
  id: string;
  sequence: number;

  intent: CortexIntent;
  confidence: number;
  entities: ExtractedEntities;

  status: 'pending' | 'confirming' | 'executing' | 'success' | 'failed' | 'skipped';
  requiresConfirmation: boolean;
  confirmationMessage?: string;

  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };

  startedAt?: Date;
  completedAt?: Date;
}

// ============================================================================
// ENTITY TYPES
// ============================================================================

export interface ExtractedEntities {
  patientName?: string;
  patientId?: string;
  patientResolution?: 'explicit' | 'context' | 'pronoun';

  category?: VerpleegkundigCategory;
  content?: string;
  severity?: 'low' | 'medium' | 'high';

  query?: string;

  dateRange?: DateRange;
  datetime?: {
    date: Date;
    time: string;
    isRelative: boolean;
  };
  appointmentType?: AppointmentType;
  location?: 'praktijk' | 'online' | 'thuis';

  identifier?: AppointmentIdentifier;
  newDatetime?: {
    date: Date;
    time: string;
  };

  _raw?: Record<string, unknown>;
}

// ============================================================================
// NUDGE TYPES
// ============================================================================

export interface NudgeSuggestion {
  id: string;

  trigger: {
    actionId: string;
    intent: CortexIntent;
    entities: ExtractedEntities;
  };

  suggestion: {
    intent: CortexIntent;
    entities: Partial<ExtractedEntities>;
    message: string;
    rationale: string;
  };

  status: 'pending' | 'accepted' | 'dismissed' | 'expired';
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;
  createdAt: Date;
}

export interface ProtocolRule {
  id: string;
  name: string;
  description: string;

  trigger: {
    intent: CortexIntent;
    conditions?: ProtocolCondition[];
  };

  suggestion: {
    intent: CortexIntent;
    message: string;
    prefillFrom: (source: ExtractedEntities) => Partial<ExtractedEntities>;
  };

  priority: 'low' | 'medium' | 'high';
  category: 'medicatie' | 'wondzorg' | 'veiligheid' | 'administratief';
  enabled: boolean;
}
```

### 4.2 Database Schema (Logging)

```sql
-- Classification logs for analytics
CREATE TABLE classification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,

  -- Input
  input TEXT NOT NULL,
  input_length INTEGER NOT NULL,

  -- Classification result
  layer TEXT NOT NULL CHECK (layer IN ('reflex', 'cortex')),
  intent TEXT NOT NULL,
  confidence NUMERIC(3,2) NOT NULL,

  -- Reflex specifics
  second_best_intent TEXT,
  second_best_confidence NUMERIC(3,2),
  matched_pattern TEXT,

  -- Escalation
  escalated BOOLEAN NOT NULL DEFAULT false,
  escalation_reason TEXT,

  -- Cortex specifics
  tokens_used INTEGER,
  ai_model TEXT,
  ai_reasoning TEXT,

  -- Performance
  processing_time_ms INTEGER NOT NULL,

  -- Context (geanonimiseerd)
  has_active_patient BOOLEAN NOT NULL DEFAULT false,
  current_view TEXT,

  -- Outcome
  action_executed BOOLEAN,
  user_corrected BOOLEAN,
  corrected_intent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index voor analytics queries
CREATE INDEX idx_classification_logs_layer ON classification_logs(layer);
CREATE INDEX idx_classification_logs_escalated ON classification_logs(escalated);
CREATE INDEX idx_classification_logs_created_at ON classification_logs(created_at);
```

---

## 5. API Ontwerp

### 5.1 Intent Classification API

**Endpoint:** `POST /api/cortex/classify`

```typescript
// Request
interface ClassifyRequest {
  input: string;
  context: CortexContext;
  options?: {
    forceAI?: boolean;
    skipLogging?: boolean;
  };
}

// Response
interface ClassifyResponse {
  chain: IntentChain;
  handledBy: 'reflex' | 'orchestrator';

  needsClarification?: boolean;
  clarificationQuestion?: string;
  clarificationOptions?: string[];

  suggestions?: NudgeSuggestion[];

  debug?: {
    localResult?: LocalClassificationResult;
    aiResult?: AIClassificationResult;
  };
}
```

### 5.2 Action Execution API

**Endpoint:** `POST /api/cortex/execute`

```typescript
interface ExecuteRequest {
  chainId: string;
  actionId: string;
  confirmed?: boolean;
}

interface ExecuteResponse {
  success: boolean;
  action: IntentAction;
  suggestions?: NudgeSuggestion[];
  error?: string;
}
```

### 5.3 Context API

**Endpoint:** `GET /api/cortex/context`

Returns current context for AI classification:
- Active patient met recent notes
- Today's agenda
- Recent actions
- Current shift

```typescript
interface ContextResponse {
  context: CortexContext;
  timestamp: Date;
}
```

### 5.4 API Response Codes

| Code | Betekenis | Wanneer |
|------|-----------|---------|
| 200 | OK | Succesvolle classificatie/executie |
| 400 | Bad Request | Ongeldige input |
| 401 | Unauthorized | Niet ingelogd |
| 422 | Unprocessable | AI kon input niet verwerken |
| 429 | Too Many Requests | Rate limit (100 req/min) |
| 500 | Server Error | Interne fout |
| 503 | Service Unavailable | AI provider down |

---

## 6. Security & Compliance

### 6.1 Security Checklist

- [x] **Authentication:** Supabase Auth (session-based)
- [x] **Authorization:** Row Level Security (RLS) policies
- [x] **Data Encryption:** At rest (PostgreSQL), in transit (HTTPS)
- [x] **Input Validation:** Zod schemas op alle endpoints
- [ ] **Rate Limiting:** Vercel Edge Functions (100 req/min)
- [x] **CORS:** Restrictive origins (alleen eigen domein)
- [x] **Secrets Management:** Environment variables

### 6.2 Data Privacy (AVG/GDPR)

- **Data minimalisatie:** Classification logs bevatten geen PII
- **Context anonimisatie:** Alleen boolean `has_active_patient`, geen namen
- **Audit trail:** Logging van alle classificaties voor debugging
- **Right to deletion:** Logs kunnen per sessie verwijderd worden

### 6.3 NEN7510 Overwegingen

- Toegangscontrole per rol (behandelaar, manager, admin)
- Medische dossier toegang gelogd
- AI-verwerking valt onder "verwerker" regels

---

## 7. Layer 1: Reflex Arc

### 7.1 Doel

Razendsnelle (<20ms) afhandeling van **simpele, eenduidige commando's** met hoge confidence.

### 7.2 Escalatie Criteria

Layer 1 (Reflex) escaleert naar Layer 2 (Cortex) wanneer **één of meer** van de volgende triggers aanwezig is:

#### 1. Lage Confidence
- **Trigger:** Beste match scoort < 0.7
- **Reden:** Systeem is niet zeker genoeg
- **Voorbeeld:** "doe iets met de planning" → score 0.45

#### 2. Ambigue Match
- **Trigger:** Verschil tussen #1 en #2 score < 0.1
- **Reden:** Systeem twijfelt tussen twee intents
- **Voorbeeld:** "plan wondzorg" → create_appointment (0.72) vs dagnotitie (0.68)

#### 3. Multi-Intent Signaalwoorden
- **Trigger:** Input bevat conjuncties die meerdere acties suggereren
- **Detectie:** `/\b(en|daarna|ook|eerst|dan|vervolgens)\b/i`
- **Reden:** Waarschijnlijk meerdere intents in één zin
- **Voorbeeld:** "Zeg Jan af **en** maak notitie"

#### 4. Context-Afhankelijke Woorden
- **Trigger:** Input bevat pronouns of verwijswoorden
- **Detectie:** `/\b(hij|zij|hem|haar|zijn|die|deze|dat|dezelfde)\b/i`
- **Reden:** AI moet context raadplegen om te resolven
- **Voorbeeld:** "Maak notitie voor **hem**" → wie is "hem"?

#### 5. Relatieve Tijdsaanduidingen
- **Trigger:** Input bevat relatieve tijd die berekening vereist
- **Detectie:** `/\b(morgen|overmorgen|volgende week|over \d+ dagen?|vanmiddag|vanavond)\b/i`
- **Reden:** Datum moet berekend worden op basis van huidige tijd
- **Voorbeeld:** "Plan afspraak **morgen** 14:00"

### 7.3 Implementatie

```typescript
// lib/cortex/reflex-classifier.ts

import type { LocalClassificationResult, CortexIntent, EscalationReason } from './types';
import { CONFIDENCE_THRESHOLD, AMBIGUITY_THRESHOLD } from './types';

// Multi-intent signaalwoorden
const MULTI_INTENT_SIGNALS = /\b(en|daarna|ook|eerst|dan|vervolgens)\b/i;

// Context-afhankelijke woorden (pronouns, verwijzingen)
const CONTEXT_SIGNALS = /\b(hij|zij|hem|haar|zijn|die|deze|dat|dezelfde)\b/i;

// Relatieve tijdsaanduidingen
const RELATIVE_TIME_SIGNALS = /\b(morgen|overmorgen|volgende week|over \d+ dagen?|vanmiddag|vanavond)\b/i;

// Intent patterns met weights
const REFLEX_PATTERNS: Record<CortexIntent, Array<{ pattern: RegExp; weight: number }>> = {
  dagnotitie: [
    { pattern: /^dagnotitie\b/i, weight: 1.0 },
    { pattern: /^notitie\s+\w+\s+(medicatie|adl|gedrag|incident|observatie)\b/i, weight: 0.95 },
    { pattern: /^notitie\s+\w+/i, weight: 0.85 },
    { pattern: /^(medicatie|adl|gedrag|incident|observatie)\s+\w+/i, weight: 0.8 },
  ],

  zoeken: [
    { pattern: /^zoek\s+\w+$/i, weight: 1.0 },
    { pattern: /^vind\s+\w+$/i, weight: 1.0 },
    { pattern: /^wie\s+is\s+\w+/i, weight: 0.95 },
    { pattern: /^dossier\s+\w+$/i, weight: 0.85 },
  ],

  agenda_query: [
    { pattern: /^agenda\s*(vandaag)?$/i, weight: 1.0 },
    { pattern: /^afspraken\s*(vandaag|deze week)?$/i, weight: 0.95 },
    { pattern: /^wat\s+staat\s+er\s+vandaag/i, weight: 0.85 },
  ],

  overdracht: [
    { pattern: /^overdracht$/i, weight: 1.0 },
    { pattern: /^dienst\s+afronden$/i, weight: 0.95 },
  ],

  create_appointment: [
    { pattern: /^maak\s+afspraak\b/i, weight: 0.8 },
    { pattern: /^plan\s+(intake|afspraak)\b/i, weight: 0.8 },
  ],

  cancel_appointment: [
    { pattern: /^annuleer\s+afspraak\b/i, weight: 0.85 },
    { pattern: /^zeg\s+\w+\s+af\b/i, weight: 0.8 },
  ],

  reschedule_appointment: [
    { pattern: /^verzet\s+afspraak\b/i, weight: 0.8 },
    { pattern: /^verplaats\s+\w+\s+naar\b/i, weight: 0.75 },
  ],

  unknown: [],
};

/**
 * Detecteer escalatie triggers in de input
 */
function detectEscalationTriggers(input: string): {
  shouldEscalate: boolean;
  reasons: EscalationReason[];
} {
  const reasons: EscalationReason[] = [];

  if (MULTI_INTENT_SIGNALS.test(input)) {
    reasons.push('multi_intent_detected');
  }

  if (CONTEXT_SIGNALS.test(input)) {
    reasons.push('needs_context');
  }

  if (RELATIVE_TIME_SIGNALS.test(input)) {
    reasons.push('relative_time');
  }

  return {
    shouldEscalate: reasons.length > 0,
    reasons
  };
}

/**
 * Classify input using local patterns
 */
export function classifyWithReflex(input: string): LocalClassificationResult {
  const startTime = performance.now();
  const trimmedInput = input.trim();

  // STAP 1: Check escalatie triggers
  const triggers = detectEscalationTriggers(trimmedInput);

  if (triggers.shouldEscalate) {
    return {
      intent: 'unknown',
      confidence: 0,
      processingTimeMs: performance.now() - startTime,
      shouldEscalateToAI: true,
      escalationReason: triggers.reasons[0],
    };
  }

  // STAP 2: Pattern matching - verzamel alle matches
  const matches: Array<{ intent: CortexIntent; confidence: number; pattern: string }> = [];

  for (const [intent, patterns] of Object.entries(REFLEX_PATTERNS)) {
    for (const { pattern, weight } of patterns) {
      if (pattern.test(trimmedInput)) {
        matches.push({
          intent: intent as CortexIntent,
          confidence: weight,
          pattern: pattern.source,
        });
      }
    }
  }

  // Sorteer op confidence (hoogste eerst)
  matches.sort((a, b) => b.confidence - a.confidence);

  const processingTimeMs = performance.now() - startTime;
  const bestMatch = matches[0];
  const secondBestMatch = matches[1];

  // STAP 3: Geen match gevonden
  if (!bestMatch) {
    return {
      intent: 'unknown',
      confidence: 0,
      processingTimeMs,
      shouldEscalateToAI: true,
      escalationReason: 'low_confidence',
    };
  }

  // STAP 4: Confidence check
  if (bestMatch.confidence < CONFIDENCE_THRESHOLD) {
    return {
      intent: bestMatch.intent,
      confidence: bestMatch.confidence,
      matchedPattern: bestMatch.pattern,
      processingTimeMs,
      shouldEscalateToAI: true,
      escalationReason: 'low_confidence',
    };
  }

  // STAP 5: Ambiguity check
  if (secondBestMatch &&
      bestMatch.confidence - secondBestMatch.confidence < AMBIGUITY_THRESHOLD) {
    return {
      intent: bestMatch.intent,
      confidence: bestMatch.confidence,
      secondBestIntent: secondBestMatch.intent,
      secondBestConfidence: secondBestMatch.confidence,
      matchedPattern: bestMatch.pattern,
      processingTimeMs,
      shouldEscalateToAI: true,
      escalationReason: 'ambiguous',
    };
  }

  // STAP 6: High confidence, unambiguous match - handle locally
  return {
    intent: bestMatch.intent,
    confidence: bestMatch.confidence,
    matchedPattern: bestMatch.pattern,
    processingTimeMs,
    shouldEscalateToAI: false,
  };
}
```

---

## 8. Layer 2: Intent Orchestrator

### 8.1 Doel

AI-gedreven analyse voor:
- **Complexe zinnen** met lage confidence
- **Multi-intents** ("X en Y")
- **Context-afhankelijke** verwijzingen ("hij", "die afspraak")
- **Disambiguation** bij twijfel

### 8.2 AI Model Selectie

| Criterium | Claude 3.5 Haiku | GPT-4o-mini | Gemini Flash |
|-----------|------------------|-------------|--------------|
| Latency | ~400ms | ~500ms | ~300ms |
| Cost/1K tokens | $0.25 | $0.15 | $0.075 |
| Dutch quality | Excellent | Good | Good |
| JSON reliability | Excellent | Good | Medium |

**Keuze:** Claude 3.5 Haiku vanwege superieure Nederlandse taalverwerking en JSON output betrouwbaarheid.

> **Model Versie Note:** We gebruiken `claude-3-5-haiku-20241022`. Check periodiek de [Anthropic model docs](https://docs.anthropic.com/en/docs/about-claude/models) voor nieuwere versies.

### 8.3 System Prompt

```typescript
const ORCHESTRATOR_SYSTEM_PROMPT = `Je bent de Intent Orchestrator voor Cortex, een Nederlands EPD systeem.

## Je Taak
Analyseer de gebruikersinput en extraheer ALLE intenties, ook als er meerdere zijn.

## Context die je krijgt
- Actieve patiënt: wie de gebruiker momenteel bekijkt
- Agenda vandaag: afspraken voor vandaag
- Recente acties: wat de gebruiker net deed
- Huidige weergave: waar in de app de gebruiker is

## Intent Types
1. **dagnotitie** - Notitie/rapportage maken
2. **zoeken** - Patiënt zoeken
3. **overdracht** - Dienst overdracht
4. **agenda_query** - Agenda bekijken
5. **create_appointment** - Afspraak maken
6. **cancel_appointment** - Afspraak annuleren
7. **reschedule_appointment** - Afspraak verzetten

## Multi-Intent Detectie
Let op woorden als: "en", "daarna", "ook", "eerst", "dan", "vervolgens"

## Pronoun Resolution
Gebruik de context om "hij/zij/die" op te lossen:
- Als er een actieve patiënt is, verwijst "hij/zij" daar waarschijnlijk naar
- "Die afspraak" verwijst naar de meest recente genoemde afspraak

## Output Format
Antwoord ALLEEN met valid JSON (geen markdown):
{
  "actions": [...],
  "reasoning": "...",
  "needsClarification": false
}`;
```

### 8.4 Implementatie

```typescript
// lib/cortex/orchestrator.ts

import { classifyWithReflex } from './reflex-classifier';

/**
 * Classify with AI Orchestrator, with graceful fallback to Reflex on failure
 */
export async function classifyWithOrchestrator(
  input: string,
  context: CortexContext
): Promise<AIClassificationResult> {
  const startTime = performance.now();

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const contextPrompt = formatContextForPrompt(context);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 512,
      temperature: 0,
      system: ORCHESTRATOR_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `## Context
${contextPrompt}

## Input
"${input}"

Analyseer en extraheer alle intenties.`,
      },
    ],
  });

  const processingTimeMs = performance.now() - startTime;
  const rawText = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed = parseAIResponse(rawText);

  // Build IntentChain
  const chain: IntentChain = {
    id: crypto.randomUUID(),
    originalInput: input,
    createdAt: new Date(),
    actions: parsed.actions.map((action, index) => ({
      id: crypto.randomUUID(),
      sequence: index + 1,
      intent: action.intent,
      confidence: action.confidence,
      entities: action.entities,
      status: 'pending',
      requiresConfirmation: action.requiresConfirmation ?? false,
      confirmationMessage: action.confirmationMessage,
    })),
    status: 'pending',
    meta: {
      source: 'ai',
      processingTimeMs,
      aiReasoning: parsed.reasoning,
    },
  };

    return {
      chain,
      model: 'claude-3-5-haiku-20241022',
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      processingTimeMs,
      needsClarification: parsed.needsClarification ?? false,
      clarificationQuestion: parsed.clarificationQuestion,
      clarificationOptions: parsed.clarificationOptions,
    };

  } catch (error) {
    // Graceful degradation: fallback to Reflex-only
    console.error('[Cortex] AI Orchestrator failed, falling back to Reflex:', error);

    const reflexResult = classifyWithReflex(input);
    const processingTimeMs = performance.now() - startTime;

    // Build minimal chain from Reflex result
    const fallbackChain: IntentChain = {
      id: crypto.randomUUID(),
      originalInput: input,
      createdAt: new Date(),
      actions: reflexResult.intent !== 'unknown' ? [{
        id: crypto.randomUUID(),
        sequence: 1,
        intent: reflexResult.intent,
        confidence: reflexResult.confidence,
        entities: {},
        status: 'pending',
        requiresConfirmation: false,
      }] : [],
      status: reflexResult.intent !== 'unknown' ? 'pending' : 'failed',
      meta: {
        source: 'local', // Indicate fallback
        processingTimeMs,
        aiReasoning: 'AI unavailable - fallback to local classification',
      },
    };

    return {
      chain: fallbackChain,
      model: 'fallback-reflex',
      tokensUsed: 0,
      processingTimeMs,
      needsClarification: false,
    };
  }
}
```

---

## 9. Layer 3: Nudge Engine

### 9.1 Doel

Proactieve suggesties na succesvolle acties op basis van medische protocollen.

### 9.2 Protocol Rules (MVP)

```typescript
// lib/cortex/nudge.ts

export const PROTOCOL_RULES: ProtocolRule[] = [
  // Wondzorg Protocol
  {
    id: 'wondzorg-controle',
    name: 'Wondcontrole na verzorging',
    description: 'Bij wondzorg hoort standaard een vervolgcontrole',
    trigger: {
      intent: 'dagnotitie',
      conditions: [
        { field: 'category', operator: 'equals', value: 'adl' },
        { field: 'content', operator: 'contains', value: 'wond' },
      ],
    },
    suggestion: {
      intent: 'create_appointment',
      message: 'Wondcontrole inplannen over 3 dagen?',
      prefillFrom: (source) => ({
        patientName: source.patientName,
        patientId: source.patientId,
        appointmentType: 'follow-up',
        content: 'Wondcontrole',
      }),
    },
    priority: 'medium',
    category: 'wondzorg',
    enabled: true,
  },

  // Medicatie Protocol
  {
    id: 'medicatie-evaluatie',
    name: 'Evaluatie na medicatiestart',
    description: 'Nieuwe medicatie vereist evaluatie na 2 weken',
    trigger: {
      intent: 'dagnotitie',
      conditions: [
        { field: 'category', operator: 'equals', value: 'medicatie' },
        { field: 'content', operator: 'matches', value: /start|gestart|nieuw/i },
      ],
    },
    suggestion: {
      intent: 'create_appointment',
      message: 'Medicatie-evaluatie inplannen over 2 weken?',
      prefillFrom: (source) => ({
        patientName: source.patientName,
        patientId: source.patientId,
        appointmentType: 'follow-up',
        content: 'Medicatie-evaluatie',
      }),
    },
    priority: 'medium',
    category: 'medicatie',
    enabled: true,
  },

  // Crisis Protocol
  {
    id: 'crisis-signalering',
    name: 'Suïcidaliteit signalering',
    description: 'Bij signalen van suïcidaliteit crisisprotocol checken',
    trigger: {
      intent: 'dagnotitie',
      conditions: [
        {
          field: 'content',
          operator: 'matches',
          // Specifiekere regex om false positives te voorkomen (bijv. "doodmoe")
          // Matcht: suïcide, zelfmoord, doodswens, wil dood, uitzichtloos, geen zin meer
          // Matcht NIET: doodmoe, doodsaai, etc.
          value: /suïcid|zelfmoord|doodswens|\bwil\s+dood\b|levenseinde|uitzichtloos|geen\s+zin\s+(meer|in)/i,
        },
      ],
    },
    suggestion: {
      intent: 'unknown', // Special action: show crisis protocol
      message: 'Crisisprotocol raadplegen? Signaleringsplan updaten?',
      prefillFrom: (source) => ({
        patientName: source.patientName,
        patientId: source.patientId,
      }),
    },
    priority: 'high',
    category: 'veiligheid',
    enabled: true,
  },
];

/**
 * Note: Protocol rules zijn hardcoded voor MVP.
 * Post-MVP: overweeg een admin UI of database-driven rules.
 *
 * Regex validatie tips:
 * - Test altijd met edge cases ("doodmoe", "doodsaai")
 * - Gebruik word boundaries (\b) waar mogelijk
 * - Overweeg NLP/AI voor complexere matching in productie
 */
```

---

## 10. Logging & Metrics

### 10.1 Classification Log Structure

Elke classificatie wordt gelogd voor analyse en verbetering:

```typescript
// lib/cortex/logger.ts

interface ClassificationLog {
  // Identificatie
  id: string;
  timestamp: Date;
  sessionId: string;

  // Input
  input: string;
  inputLength: number;

  // Classificatie resultaat
  layer: 'reflex' | 'cortex';
  intent: CortexIntent;
  confidence: number;

  // Bij Reflex
  secondBestIntent?: CortexIntent;
  secondBestConfidence?: number;
  matchedPattern?: string;

  // Escalatie info
  escalated: boolean;
  escalationReason?: EscalationReason;

  // Bij Cortex (AI)
  tokensUsed?: number;
  aiModel?: string;
  aiReasoning?: string;

  // Performance
  processingTimeMs: number;

  // Context (geanonimiseerd)
  hasActivePatient: boolean;
  currentView: string;

  // Outcome (later in te vullen)
  actionExecuted?: boolean;
  userCorrected?: boolean;
  correctedIntent?: CortexIntent;
}
```

### 10.2 Metrics om te monitoren

| Metric | Doel | Actie bij afwijking |
|--------|------|---------------------|
| **Reflex hit rate** | >70% lokaal afgehandeld | Threshold tunen of regex uitbreiden |
| **Escalation reasons** | Verdeling monitoren | Veel 'ambiguous' → patterns verbeteren |
| **AI latency p95** | <800ms | Model of prompt optimaliseren |
| **User corrections** | <5% | Intent definities of training verbeteren |

### 10.3 Privacy: Input Sanitization

> **Let op:** Raw input kan PII bevatten (bijv. "notitie voor Jan Jansen medicatie").
> We sanitizen input voordat we loggen naar productie.

```typescript
// lib/cortex/sanitize.ts

/**
 * Verwijdert potentiële PII uit input voor logging
 * - Namen (2+ woorden met hoofdletters)
 * - BSN-achtige nummers (9 cijfers)
 * - Telefoonnummers
 */
export function sanitizeForLogging(input: string): string {
  return input
    // Vervang potentiële namen (Hoofdletter + woord patronen)
    .replace(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g, '[NAAM]')
    // Vervang BSN-achtige nummers
    .replace(/\b\d{9}\b/g, '[BSN]')
    // Vervang telefoonnummers
    .replace(/\b(?:06|0\d{2})[-\s]?\d{7,8}\b/g, '[TELEFOON]')
    // Vervang email adressen
    .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL]');
}
```

### 10.4 Log implementatie

```typescript
// lib/cortex/logger.ts

import { ClassificationLog } from './types';
import { sanitizeForLogging } from './sanitize';

export function logClassification(log: ClassificationLog): void {
  // Development: console (raw input OK voor debugging)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Cortex Classification]', {
      input: log.input.substring(0, 50),
      layer: log.layer,
      intent: log.intent,
      confidence: log.confidence,
      escalated: log.escalated,
      escalationReason: log.escalationReason,
      timeMs: log.processingTimeMs,
    });
  }

  // Production: sanitize input voordat we loggen
  if (process.env.NODE_ENV === 'production') {
    const sanitizedLog = {
      ...log,
      input: sanitizeForLogging(log.input),
    };

    // Fire-and-forget naar Supabase
    fetch('/api/cortex/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedLog),
    }).catch(console.error);
  }
}
```

---

## 11. Frontend Components

### 11.1 Component Hierarchy

```
CommandCenter (v3.0)
├── ContextBar
├── ChatPanel
│   ├── ChatMessages
│   │   ├── UserMessage
│   │   ├── AssistantMessage
│   │   │   └── ActionChainCard (NEW)
│   │   │       ├── ActionItem
│   │   │       ├── ActionItem
│   │   │       └── ConfirmationDialog
│   │   └── ClarificationCard (NEW)
│   └── ChatInput
├── ArtifactArea
│   ├── ArtifactTabs
│   └── ArtifactContainer
└── NudgeToast (NEW - Layer 3)
```

### 11.2 ActionChainCard Component

```tsx
// components/cortex/chat/action-chain-card.tsx

interface ActionChainCardProps {
  chain: IntentChain;
  onConfirm: (actionId: string) => void;
  onSkip: (actionId: string) => void;
  onRetry: (actionId: string) => void;
}

// Toont meerdere acties in één card met:
// - Sequence numbers (1, 2, 3...)
// - Status icons (pending, executing, success, failed)
// - Confidence badges
// - Confirmation buttons voor destructieve acties
// - Collapsible AI reasoning
```

### 11.3 NudgeToast Component

```tsx
// components/cortex/command-center/nudge-toast.tsx

interface NudgeToastProps {
  suggestion: NudgeSuggestion;
  onAccept: (suggestionId: string) => void;
  onDismiss: (suggestionId: string) => void;
}

// Toont proactieve suggestie met:
// - Progress bar countdown (5 minuten)
// - Priority-based styling (red/amber/blue)
// - Accept/Dismiss buttons
// - Rationale tekst
```

---

## 12. State Management

### 12.1 Cortex Store Extensions

```typescript
// stores/cortex-store.ts (V2 additions)

interface CortexStoreV2 extends CortexStore {
  // Context
  context: CortexContext;
  setContext: (context: Partial<CortexContext>) => void;

  // Intent Chains
  activeChain: IntentChain | null;
  chainHistory: IntentChain[];

  startChain: (chain: IntentChain) => void;
  updateActionStatus: (chainId: string, actionId: string, status: IntentAction['status']) => void;
  completeChain: (chainId: string) => void;

  // Nudge
  suggestions: NudgeSuggestion[];

  addSuggestion: (suggestion: NudgeSuggestion) => void;
  acceptSuggestion: (suggestionId: string) => void;
  dismissSuggestion: (suggestionId: string) => void;

  // Clarification
  pendingClarification: {
    question: string;
    options: string[];
    originalInput: string;
  } | null;

  setClarification: (clarification: ...) => void;
  answerClarification: (answer: string) => void;
}
```

---

## 13. Performance & Scalability

### 13.1 Performance Targets

| Metric | Target | Gemeten |
|--------|--------|---------|
| Reflex classificatie | <20ms | ~5ms |
| AI classificatie | <800ms | ~400ms |
| Page load (FCP) | <2s | - |
| API response (excl. AI) | <500ms | - |

### 13.2 Caching Strategie

- **Context API:** 30 seconden cache (agenda wijzigt niet snel)
- **AI responses:** Geen cache (context-afhankelijk)
- **Protocol rules:** In-memory (statisch)

### 13.3 Scalability

- **Frontend:** Vercel Edge Network (CDN)
- **Backend:** Serverless functions (auto-scaling)
- **Database:** Supabase (vertical scaling)
- **AI:** Queue systeem voor batch processing (toekomst)

---

## 14. Deployment & CI/CD

### 14.1 Omgevingen

| Omgeving | URL | Branch | Doel |
|----------|-----|--------|------|
| Development | localhost:3000 | - | Lokaal ontwikkelen |
| Preview | *.vercel.app | PR branches | Review builds |
| Production | app.example.com | main | Live applicatie |

### 14.2 Feature Flags

```typescript
// lib/config/feature-flags.ts

export const FEATURE_FLAGS = {
  CORTEX_V2_ENABLED: process.env.NEXT_PUBLIC_CORTEX_V2 === 'true',
  CORTEX_MULTI_INTENT: process.env.NEXT_PUBLIC_CORTEX_MULTI_INTENT === 'true',
  CORTEX_NUDGE: process.env.NEXT_PUBLIC_CORTEX_NUDGE === 'true',
  CORTEX_LOGGING: process.env.NEXT_PUBLIC_CORTEX_LOGGING === 'true',
};
```

### 14.3 Deployment Checklist

- [ ] Environment variables set (Vercel dashboard)
- [ ] Feature flags configured
- [ ] Database migrations run
- [ ] Smoke tests passed
- [ ] Monitoring configured

---

## 15. Testing Strategy

### 15.1 Test Categorieën

| Type | Scope | Tools |
|------|-------|-------|
| Unit | Reflex classifier, entity extractor | Vitest |
| Integration | API endpoints, AI responses | Vitest + MSW |
| E2E | Complete flows | Playwright |

### 15.2 Test Zinnen Dataset

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
  ],
  "ambiguous": [
    {
      "input": "Plan wondzorg",
      "shouldEscalate": true
    }
  ]
}
```

---

## 16. Risico's & Technische Mitigatie

| Risico | Impact | Kans | Mitigatie |
|--------|--------|------|-----------|
| AI API down | Hoog | Laag | Graceful degradation naar Reflex-only |
| Hallucinated intents | Middel | Middel | Strikte JSON schema, fallback to unknown |
| Performance degradatie | Middel | Laag | Monitoring, caching, threshold tuning |
| Privacy breach (logs) | Hoog | Laag | Anonimisatie, geen PII in logs |
| Cost overrun (AI) | Middel | Middel | Token limits, usage monitoring |

---

## 17. Implementatie Roadmap

### Fase 1: Foundation (3-4 dagen)

| Task | Effort | Status |
|------|--------|--------|
| CortexContext types | S | Pending |
| GET /api/cortex/context endpoint | M | Pending |
| Reflex complexity detection | S | Pending |
| Feature flags setup | S | Pending |

**Deliverable:** Context beschikbaar, backward compatible

### Fase 2: Multi-Intent (4-5 dagen)

| Task | Effort | Status |
|------|--------|--------|
| IntentChain types | M | Pending |
| Orchestrator AI prompt | M | Pending |
| ActionChainCard component | L | Pending |
| Store chain state | M | Pending |

**Deliverable:** "Zeg Jan af en maak notitie" werkt

### Fase 3: Nudge MVP (2-3 dagen)

| Task | Effort | Status |
|------|--------|--------|
| Protocol rules (wondzorg) | S | Pending |
| evaluateNudge functie | M | Pending |
| NudgeToast component | M | Pending |

**Deliverable:** Proactieve suggestie demo

### Fase 4: Polish (2-3 dagen)

| Task | Effort | Status |
|------|--------|--------|
| ClarificationCard | S | Pending |
| Error handling | M | Pending |
| Logging infrastructure | M | Pending |

**Deliverable:** Demo-ready prototype

**Totaal: 11-15 werkdagen**

---

## 18. Bijlagen & Referenties

### A. Gerelateerde Documenten

| Document | Locatie |
|----------|---------|
| FO Intent System V2 | `docs/intent/fo-cortex-intent-system-v2.md` |
| Architectuur V2 | `docs/intent/architecture-cortex-v2.md` |
| MVP User Stories | `docs/intent/mvp-userstories-intent-system.md` |
| Haalbaarheidsanalyse | `docs/intent/haalbaarheidsanalyse-cortex-v2.md` |

### B. Tech Documentatie

- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Anthropic: https://docs.anthropic.com
- Zustand: https://docs.pmnd.rs/zustand

### C. Versie Historie

| Versie | Datum | Auteur | Wijzigingen |
|--------|-------|--------|-------------|
| 1.0 | 30-12-2025 | Colin Lit | Initieel document met sanity check aanbevelingen verwerkt |
