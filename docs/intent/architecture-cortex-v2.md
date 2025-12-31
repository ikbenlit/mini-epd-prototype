# 🧠 Cortex V2 - Uitgebreid Architectuurplan

**Project:** Cortex Intent System V2  
**Versie:** 2.0  
**Datum:** 29-12-2025  
**Status:** Technisch Ontwerp  

---

## Inhoudsopgave

1. [Executive Summary](#1-executive-summary)
2. [Architectuur Overview](#2-architectuur-overview)
3. [Data Models & Types](#3-data-models--types)
4. [Layer 1: Reflex Arc](#4-layer-1-reflex-arc)
5. [Layer 2: Intent Orchestrator](#5-layer-2-intent-orchestrator)
6. [Layer 3: Nudge](#6-layer-3-nudge)
7. [API Design](#7-api-design)
8. [Frontend Components](#8-frontend-components)
9. [State Management](#9-state-management)
10. [Implementatie Roadmap](#10-implementatie-roadmap)
11. [Testing Strategy](#11-testing-strategy)
12. [Migratie Plan](#12-migratie-plan)

---

## 1. Executive Summary

### Huidige Situatie (V1)
Het huidige Cortex systeem is **reactief**: gebruiker geeft commando → systeem voert uit. Het werkt met single-intent classificatie en heeft een two-tier architectuur (lokaal regex + AI fallback).

### Doel V2: "The Cortex"
Transformatie naar een **agentic systeem** dat:
- **Multi-intents** begrijpt ("Zeg Jan af **en** maak notitie")
- **Context-aware** is (snapt wie "hij" is, wat "morgen" betekent)
- **Proactief** suggesties geeft (na wondzorg → "Controle inplannen?")
- **Nooit** "Ik snap het niet" zegt (altijd een poging tot begrip)

### Kernprincipe
> "We stoppen met optimaliseren voor milliseconden en starten met optimaliseren voor intelligentie."

---

## 2. Architectuur Overview

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
│  │  • High-confidence simple commands only (>=0.7)                      │   │
│  │  • Examples: "agenda", "zoek jan", "notitie"                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Decision: Confidence >= 0.7 AND no escalation triggers? ──► EXECUTE      │
│            Otherwise ──► Pass to Layer 2                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    [Complex/Multi-intent/Low confidence]
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
│  Speech  │───►│  Input  │───►│   Classify  │───►│ Execute  │───►│  Safety   │
│  /Text   │    │  Buffer │    │   (L1/L2)   │    │  Chain   │    │   Nudge   │
└──────────┘    └─────────┘    └─────────────┘    └──────────┘    └───────────┘
                                     │                  │               │
                                     ▼                  ▼               ▼
                              ┌─────────────┐    ┌──────────┐    ┌───────────┐
                              │   Cortex    │    │  Artifact │    │ Suggestion│
                              │   Store     │◄───│  Updates  │    │   Toast   │
                              └─────────────┘    └──────────┘    └───────────┘
```

---

## 3. Data Models & Types

### 3.1 Core Types (lib/cortex/types.ts)

```typescript
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

// ============================================================================
// CONTEXT TYPES (NEW in V2)
// ============================================================================

/**
 * Full context passed to AI for intelligent classification
 */
export interface CortexContext {
  // Active patient (if any)
  activePatient: {
    id: string;
    name: string;
    recentNotes?: string[];     // Last 3 note summaries
    upcomingAppointments?: {
      date: Date;
      type: string;
    }[];
  } | null;

  // Current UI state
  currentView: 'dashboard' | 'patient-detail' | 'agenda' | 'reports' | 'chat';
  
  // Time context
  shift: ShiftType;
  currentTime: Date;
  
  // Today's agenda (for disambiguation)
  agendaToday: {
    time: string;
    patientName: string;
    patientId: string;
    type: string;
  }[];

  // Recent intents (for continuity)
  recentIntents: {
    intent: CortexIntent;
    patientName?: string;
    timestamp: Date;
  }[];

  // User preferences (adaptive confidence)
  userPreferences?: {
    confirmationLevel: 'always' | 'destructive' | 'never';
    frequentIntents: CortexIntent[];
  };
}

// ============================================================================
// INTENT CHAIN (Multi-Intent Support - NEW in V2)
// ============================================================================

/**
 * A chain of actions derived from a single user input
 */
export interface IntentChain {
  id: string;
  originalInput: string;
  createdAt: Date;
  
  // Array of actions to execute
  actions: IntentAction[];
  
  // Overall chain status
  status: 'pending' | 'executing' | 'completed' | 'partial' | 'failed';
  
  // Processing metadata
  meta: {
    source: 'local' | 'ai';
    processingTimeMs: number;
    aiReasoning?: string;
  };
}

/**
 * A single action within an intent chain
 */
export interface IntentAction {
  id: string;
  sequence: number;  // Order in chain (1, 2, 3...)
  
  // Classification
  intent: CortexIntent;
  confidence: number;
  
  // Extracted data
  entities: ExtractedEntities;
  
  // Execution state
  status: 'pending' | 'confirming' | 'executing' | 'success' | 'failed' | 'skipped';
  
  // Confirmation handling
  requiresConfirmation: boolean;
  confirmationMessage?: string;
  
  // Error handling
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
  
  // Timing
  startedAt?: Date;
  completedAt?: Date;
}

// ============================================================================
// ENTITY TYPES (Enhanced)
// ============================================================================

export interface ExtractedEntities {
  // Patient reference
  patientName?: string;
  patientId?: string;
  patientResolution?: 'explicit' | 'context' | 'pronoun';  // How we found the patient

  // Dagnotitie
  category?: VerpleegkundigCategory;
  content?: string;
  severity?: 'low' | 'medium' | 'high';  // Sentiment analysis

  // Search
  query?: string;

  // Agenda
  dateRange?: DateRange;
  datetime?: {
    date: Date;
    time: string;
    isRelative: boolean;  // "morgen" vs "15 januari"
  };
  appointmentType?: AppointmentType;
  location?: 'praktijk' | 'online' | 'thuis';

  // Reschedule
  identifier?: AppointmentIdentifier;
  newDatetime?: {
    date: Date;
    time: string;
  };

  // Raw AI extraction (for debugging)
  _raw?: Record<string, unknown>;
}

export interface DateRange {
  start: Date;
  end: Date;
  label: 'vandaag' | 'morgen' | 'deze week' | 'volgende week' | 'custom';
}

export interface AppointmentIdentifier {
  type: 'patient' | 'time' | 'both' | 'id';
  patientName?: string;
  patientId?: string;
  time?: string;
  date?: Date;
  encounterId?: string;
}

export type AppointmentType = 
  | 'intake' 
  | 'behandeling' 
  | 'follow-up' 
  | 'telefonisch'
  | 'huisbezoek' 
  | 'online' 
  | 'crisis' 
  | 'overig';

// ============================================================================
// NUDGE TYPES (NEW in V2)
// ============================================================================

/**
 * A suggestion generated by the Nudge layer
 */
export interface NudgeSuggestion {
  id: string;
  
  // What triggered this suggestion
  trigger: {
    actionId: string;
    intent: CortexIntent;
    entities: ExtractedEntities;
  };
  
  // The suggestion itself
  suggestion: {
    intent: CortexIntent;
    entities: Partial<ExtractedEntities>;
    message: string;           // "Wondcontrole inplannen over 3 dagen?"
    rationale: string;         // "Bij wondzorg hoort standaard een controle"
  };
  
  // UI state
  status: 'pending' | 'accepted' | 'dismissed' | 'expired';
  
  // Priority and timing
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;
  
  createdAt: Date;
}

/**
 * Protocol rule for generating suggestions
 */
export interface ProtocolRule {
  id: string;
  name: string;
  description: string;
  
  // When to trigger
  trigger: {
    intent: CortexIntent;
    conditions?: ProtocolCondition[];
  };
  
  // What to suggest
  suggestion: {
    intent: CortexIntent;
    message: string;
    prefillFrom: (source: ExtractedEntities) => Partial<ExtractedEntities>;
  };
  
  // Rule metadata
  priority: 'low' | 'medium' | 'high';
  category: 'medicatie' | 'wondzorg' | 'veiligheid' | 'administratief';
  enabled: boolean;
}

export interface ProtocolCondition {
  field: keyof ExtractedEntities;
  operator: 'equals' | 'contains' | 'exists' | 'matches';
  value?: string | RegExp;
}

// ============================================================================
// CLASSIFICATION RESULT TYPES
// ============================================================================

/**
 * Result from Layer 1 (Local Reflex)
 */
export interface LocalClassificationResult {
  intent: CortexIntent;
  confidence: number;
  matchedPattern?: string;
  processingTimeMs: number;
  
  // Decision
  shouldEscalateToAI: boolean;
  escalationReason?: 'low_confidence' | 'multi_intent_detected' | 'needs_context';
}

/**
 * Result from Layer 2 (AI Orchestrator)
 */
export interface AIClassificationResult {
  chain: IntentChain;
  
  // AI metadata
  model: string;
  tokensUsed: number;
  processingTimeMs: number;
  
  // Clarification (if needed)
  needsClarification: boolean;
  clarificationQuestion?: string;
  clarificationOptions?: string[];
}

/**
 * Combined classification result
 */
export interface ClassificationResult {
  // The final intent chain
  chain: IntentChain;
  
  // Which layer handled it
  handledBy: 'reflex' | 'orchestrator';
  
  // Timing
  totalProcessingTimeMs: number;
  
  // Debug info
  debug?: {
    localResult?: LocalClassificationResult;
    aiResult?: AIClassificationResult;
  };
}
```

### 3.2 Store Types (stores/cortex-store.ts additions)

```typescript
// Add to existing CortexStore interface

interface CortexStoreV2 extends CortexStore {
  // Context (enhanced)
  context: CortexContext;

  // Intent Chain state
  activeChain: IntentChain | null;
  chainHistory: IntentChain[];
  
  // Nudge state
  pendingSuggestions: NudgeSuggestion[];
  suggestionHistory: NudgeSuggestion[];
  
  // Actions
  setContext: (context: Partial<CortexContext>) => void;
  
  // Chain actions
  startChain: (chain: IntentChain) => void;
  updateActionStatus: (chainId: string, actionId: string, status: IntentAction['status']) => void;
  completeChain: (chainId: string) => void;
  
  // Nudge actions
  addSuggestion: (suggestion: NudgeSuggestion) => void;
  acceptSuggestion: (suggestionId: string) => void;
  dismissSuggestion: (suggestionId: string) => void;
}
```

---

## 4. Layer 1: Reflex Arc

### 4.1 Doel
Razendsnelle (<20ms) afhandeling van **simpele, eenduidige commando's** met hoge confidence.

### 4.2 Wanneer Layer 1 afhandelt
- Confidence >= 0.7
- Geen "en", "daarna", "ook" (multi-intent signals)
- Geen context-afhankelijke woorden ("hij", "haar", "die afspraak")
- Geen tijdsrelaties die interpretatie nodig hebben

### 4.3 Implementatie (lib/cortex/reflex-classifier.ts)

```typescript
/**
 * Layer 1: Reflex Arc
 * 
 * Fast, local pattern matching for simple commands.
 * Escalates to Layer 2 when complexity is detected.
 */

import type { LocalClassificationResult, CortexIntent } from './types';

// Multi-intent signal words
const MULTI_INTENT_SIGNALS = [
  /\ben\b/i,        // "X en Y"
  /\bdaarna\b/i,    // "X daarna Y"
  /\book\b/i,       // "X ook Y"  
  /\beerst\b/i,     // "eerst X dan Y"
  /\bdan\b/i,       // "X dan Y"
  /\bvervolgens\b/i,
];

// Context-dependent words (need AI to resolve)
const CONTEXT_SIGNALS = [
  /\bhij\b/i,
  /\bzij\b/i,
  /\bhaar\b/i,
  /\bhem\b/i,
  /\bdie\b/i,       // "die afspraak"
  /\bdeze\b/i,      // "deze patiënt"
  /\bdezelfde\b/i,
];

// Intent patterns with weights
const REFLEX_PATTERNS: Record<CortexIntent, Array<{ pattern: RegExp; weight: number }>> = {
  dagnotitie: [
    { pattern: /^dagnotitie\b/i, weight: 1.0 },
    { pattern: /^notitie\s+\w+\s+(medicatie|adl|gedrag|incident|observatie)\b/i, weight: 0.95 },
    { pattern: /^notitie\s+\w+/i, weight: 0.9 },
    { pattern: /^(medicatie|adl|gedrag|incident|observatie)\s+\w+/i, weight: 0.85 },
  ],
  
  zoeken: [
    { pattern: /^zoek\s+\w+$/i, weight: 1.0 },
    { pattern: /^vind\s+\w+$/i, weight: 1.0 },
    { pattern: /^wie\s+is\s+\w+/i, weight: 0.95 },
    { pattern: /^dossier\s+\w+$/i, weight: 0.9 },
  ],
  
  agenda_query: [
    { pattern: /^agenda\s*(vandaag|morgen)?$/i, weight: 1.0 },
    { pattern: /^afspraken\s*(vandaag|morgen|deze week)?$/i, weight: 0.95 },
    { pattern: /^wat\s+staat\s+er\s+(vandaag|morgen)/i, weight: 0.9 },
  ],
  
  overdracht: [
    { pattern: /^overdracht$/i, weight: 1.0 },
    { pattern: /^dienst\s+afronden$/i, weight: 0.95 },
  ],
  
  create_appointment: [
    { pattern: /^maak\s+afspraak\b/i, weight: 0.85 },
    { pattern: /^plan\s+(intake|afspraak)\b/i, weight: 0.85 },
  ],
  
  cancel_appointment: [
    { pattern: /^annuleer\s+afspraak\b/i, weight: 0.9 },
    { pattern: /^zeg\s+\w+\s+af\b/i, weight: 0.85 },
  ],
  
  reschedule_appointment: [
    { pattern: /^verzet\s+afspraak\b/i, weight: 0.85 },
    { pattern: /^verplaats\s+\w+\s+naar\b/i, weight: 0.8 },
  ],
  
  unknown: [],
};

/**
 * Check if input contains signals that require AI processing
 */
function detectComplexity(input: string): { 
  hasMultiIntent: boolean; 
  hasContextDependency: boolean;
  signals: string[];
} {
  const signals: string[] = [];
  
  const hasMultiIntent = MULTI_INTENT_SIGNALS.some(pattern => {
    if (pattern.test(input)) {
      signals.push(`multi-intent: ${pattern.source}`);
      return true;
    }
    return false;
  });
  
  const hasContextDependency = CONTEXT_SIGNALS.some(pattern => {
    if (pattern.test(input)) {
      signals.push(`context: ${pattern.source}`);
      return true;
    }
    return false;
  });
  
  return { hasMultiIntent, hasContextDependency, signals };
}

/**
 * Classify input using local patterns
 */
export function classifyWithReflex(input: string): LocalClassificationResult {
  const startTime = performance.now();
  const trimmedInput = input.trim();
  
  // Step 1: Check for complexity signals
  const complexity = detectComplexity(trimmedInput);
  
  if (complexity.hasMultiIntent) {
    return {
      intent: 'unknown',
      confidence: 0,
      processingTimeMs: performance.now() - startTime,
      shouldEscalateToAI: true,
      escalationReason: 'multi_intent_detected',
    };
  }
  
  if (complexity.hasContextDependency) {
    return {
      intent: 'unknown',
      confidence: 0,
      processingTimeMs: performance.now() - startTime,
      shouldEscalateToAI: true,
      escalationReason: 'needs_context',
    };
  }
  
  // Step 2: Pattern matching
  let bestMatch: { intent: CortexIntent; confidence: number; pattern: string } | null = null;
  
  for (const [intent, patterns] of Object.entries(REFLEX_PATTERNS)) {
    for (const { pattern, weight } of patterns) {
      if (pattern.test(trimmedInput)) {
        if (!bestMatch || weight > bestMatch.confidence) {
          bestMatch = {
            intent: intent as CortexIntent,
            confidence: weight,
            pattern: pattern.source,
          };
        }
      }
    }
  }
  
  const processingTimeMs = performance.now() - startTime;
  
  // Step 3: Decide on escalation
  if (!bestMatch || bestMatch.confidence < CONFIDENCE_THRESHOLD) {
    return {
      intent: bestMatch?.intent || 'unknown',
      confidence: bestMatch?.confidence || 0,
      matchedPattern: bestMatch?.pattern,
      processingTimeMs,
      shouldEscalateToAI: true,
      escalationReason: 'low_confidence',
    };
  }
  
  // High confidence match - handle locally
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

## 5. Layer 2: Intent Orchestrator

### 5.1 Doel
AI-gedreven analyse voor:
- **Complexe zinnen** met lage confidence
- **Multi-intents** ("X en Y")
- **Context-afhankelijke** verwijzingen ("hij", "die afspraak")
- **Disambiguation** bij twijfel

### 5.2 Context Injection

De AI krijgt altijd volledige context mee:

```typescript
/**
 * Build context for AI classification
 */
export function buildCortexContext(store: CortexStore): CortexContext {
  return {
    activePatient: store.activePatient ? {
      id: store.activePatient.id,
      name: `${store.activePatient.name_given[0]} ${store.activePatient.name_family}`,
    } : null,
    
    currentView: determineCurrentView(),
    shift: store.shift,
    currentTime: new Date(),
    
    agendaToday: [], // Populated from API
    
    recentIntents: store.recentActions.slice(0, 5).map(a => ({
      intent: a.intent,
      patientName: a.patientName,
      timestamp: a.timestamp,
    })),
  };
}
```

### 5.3 Implementatie (lib/cortex/orchestrator.ts)

```typescript
/**
 * Layer 2: Intent Orchestrator
 * 
 * AI-powered classification with context awareness and multi-intent support.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { 
  CortexContext, 
  IntentChain, 
  IntentAction,
  AIClassificationResult 
} from './types';

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

Voorbeeld:
- "Zeg Jan af en maak notitie: ziek" → 2 intents
- "Plan intake marie morgen 14:00" → 1 intent

## Pronoun Resolution
Gebruik de context om "hij/zij/die" op te lossen:
- Als er een actieve patiënt is, verwijst "hij/zij" daar waarschijnlijk naar
- "Die afspraak" verwijst naar de meest recente genoemde afspraak

## Output Format
Antwoord ALLEEN met valid JSON:

{
  "actions": [
    {
      "intent": "cancel_appointment",
      "confidence": 0.95,
      "entities": {
        "patientName": "Jan",
        "patientResolution": "explicit"
      },
      "requiresConfirmation": true,
      "confirmationMessage": "Afspraak van Jan annuleren?"
    },
    {
      "intent": "dagnotitie", 
      "confidence": 0.9,
      "entities": {
        "patientName": "Jan",
        "patientResolution": "context",
        "content": "ziek"
      },
      "requiresConfirmation": false
    }
  ],
  "reasoning": "Gebruiker wil twee dingen: afspraak annuleren EN notitie maken. 'Jan' expliciet genoemd voor annulering, impliciet voor notitie.",
  "needsClarification": false
}

Als je twijfelt, stel een verduidelijkingsvraag:
{
  "actions": [],
  "needsClarification": true,
  "clarificationQuestion": "Bedoel je een notitie maken of een afspraak inplannen?",
  "clarificationOptions": ["Notitie maken", "Afspraak inplannen"]
}`;

/**
 * Format context for AI prompt
 */
function formatContextForPrompt(context: CortexContext): string {
  const lines: string[] = [];
  
  // Active patient
  if (context.activePatient) {
    lines.push(`🧑 Actieve patiënt: ${context.activePatient.name} (ID: ${context.activePatient.id})`);
  } else {
    lines.push(`🧑 Actieve patiënt: Geen`);
  }
  
  // Current view
  lines.push(`📍 Huidige weergave: ${context.currentView}`);
  
  // Time
  lines.push(`⏰ Tijd: ${context.currentTime.toLocaleTimeString('nl-NL')} (${context.shift}dienst)`);
  
  // Today's agenda
  if (context.agendaToday.length > 0) {
    lines.push(`📅 Agenda vandaag:`);
    context.agendaToday.slice(0, 5).forEach(apt => {
      lines.push(`   - ${apt.time}: ${apt.patientName} (${apt.type})`);
    });
  }
  
  // Recent intents
  if (context.recentIntents.length > 0) {
    lines.push(`🕐 Recente acties:`);
    context.recentIntents.slice(0, 3).forEach(ri => {
      lines.push(`   - ${ri.intent}${ri.patientName ? ` (${ri.patientName})` : ''}`);
    });
  }
  
  return lines.join('\n');
}

/**
 * Classify with AI Orchestrator
 */
export async function classifyWithOrchestrator(
  input: string,
  context: CortexContext
): Promise<AIClassificationResult> {
  const startTime = performance.now();
  
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
  
  // Parse JSON response
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
}

/**
 * Parse AI JSON response with error handling
 */
function parseAIResponse(rawText: string): {
  actions: Array<{
    intent: CortexIntent;
    confidence: number;
    entities: ExtractedEntities;
    requiresConfirmation?: boolean;
    confirmationMessage?: string;
  }>;
  reasoning?: string;
  needsClarification?: boolean;
  clarificationQuestion?: string;
  clarificationOptions?: string[];
} {
  // Strip markdown code blocks
  let jsonText = rawText.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.slice(7);
  }
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith('```')) {
    jsonText = jsonText.slice(0, -3);
  }
  
  try {
    return JSON.parse(jsonText.trim());
  } catch (error) {
    console.error('Failed to parse AI response:', error, rawText);
    return {
      actions: [{
        intent: 'unknown',
        confidence: 0.3,
        entities: {},
      }],
      reasoning: 'Failed to parse AI response',
    };
  }
}
```

---

## 6. Layer 3: Nudge

### 6.1 Doel
Proactieve suggesties na succesvolle acties op basis van medische protocollen en domeinkennis.

### 6.2 Protocol Rules

```typescript
/**
 * Layer 3: Nudge
 *
 * Post-action intelligence that suggests follow-up actions
 * based on medical protocols and domain knowledge.
 */

import type {
  IntentAction,
  NudgeSuggestion,
  ProtocolRule,
  ExtractedEntities
} from './types';

// ============================================================================
// PROTOCOL RULES DATABASE
// ============================================================================

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
  
  // Incident Protocol
  {
    id: 'incident-melding',
    name: 'Incidentmelding',
    description: 'Bij ernstige incidenten altijd MIC-melding overwegen',
    trigger: {
      intent: 'dagnotitie',
      conditions: [
        { field: 'category', operator: 'equals', value: 'incident' },
        { field: 'severity', operator: 'equals', value: 'high' },
      ],
    },
    suggestion: {
      intent: 'dagnotitie',
      message: 'MIC-melding aanmaken voor dit incident?',
      prefillFrom: (source) => ({
        patientName: source.patientName,
        patientId: source.patientId,
        category: 'incident',
        content: `MIC: ${source.content}`,
      }),
    },
    priority: 'high',
    category: 'veiligheid',
    enabled: true,
  },
  
  // Crisis Protocol (van de UX simulatie)
  {
    id: 'crisis-signalering',
    name: 'Suïcidaliteit signalering',
    description: 'Bij signalen van suïcidaliteit crisisprotocol checken',
    trigger: {
      intent: 'dagnotitie',
      conditions: [
        { field: 'content', operator: 'matches', value: /suïcid|zelfmoord|dood|uitzichtloos|geen zin/i },
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
  
  // Afspraak verzet Protocol
  {
    id: 'afspraak-bellen',
    name: 'Patiënt informeren',
    description: 'Bij annulering patiënt informeren',
    trigger: {
      intent: 'cancel_appointment',
      conditions: [],
    },
    suggestion: {
      intent: 'dagnotitie',
      message: 'Bellen genoteerd? Patiënt geïnformeerd over annulering?',
      prefillFrom: (source) => ({
        patientName: source.patientName,
        patientId: source.patientId,
        category: 'observatie',
        content: 'Telefonisch geïnformeerd over geannuleerde afspraak',
      }),
    },
    priority: 'low',
    category: 'administratief',
    enabled: true,
  },
];

// ============================================================================
// NUDGE ENGINE
// ============================================================================

/**
 * Check if a condition matches the entities
 */
function checkCondition(
  condition: ProtocolCondition,
  entities: ExtractedEntities
): boolean {
  const value = entities[condition.field];
  
  switch (condition.operator) {
    case 'equals':
      return value === condition.value;
      
    case 'contains':
      return typeof value === 'string' && 
             typeof condition.value === 'string' &&
             value.toLowerCase().includes(condition.value.toLowerCase());
      
    case 'exists':
      return value !== undefined && value !== null && value !== '';
      
    case 'matches':
      return typeof value === 'string' && 
             condition.value instanceof RegExp &&
             condition.value.test(value);
      
    default:
      return false;
  }
}

/**
 * Evaluate all protocol rules against a completed action
 */
export function evaluateNudge(
  completedAction: IntentAction
): NudgeSuggestion[] {
  const suggestions: NudgeSuggestion[] = [];
  
  for (const rule of PROTOCOL_RULES) {
    if (!rule.enabled) continue;
    
    // Check if trigger intent matches
    if (rule.trigger.intent !== completedAction.intent) continue;
    
    // Check all conditions
    const conditionsMet = !rule.trigger.conditions || 
      rule.trigger.conditions.every(cond => 
        checkCondition(cond, completedAction.entities)
      );
    
    if (!conditionsMet) continue;
    
    // Generate suggestion
    const suggestion: NudgeSuggestion = {
      id: crypto.randomUUID(),
      trigger: {
        actionId: completedAction.id,
        intent: completedAction.intent,
        entities: completedAction.entities,
      },
      suggestion: {
        intent: rule.suggestion.intent,
        entities: rule.suggestion.prefillFrom(completedAction.entities),
        message: rule.suggestion.message,
        rationale: rule.description,
      },
      status: 'pending',
      priority: rule.priority,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      createdAt: new Date(),
    };
    
    suggestions.push(suggestion);
  }
  
  // Sort by priority (high first)
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
```

---

## 7. API Design

### 7.1 Intent Classification API (Enhanced)

**Endpoint:** `POST /api/cortex/classify`

```typescript
// app/api/cortex/classify/route.ts (V2)

import { NextRequest, NextResponse } from 'next/server';
import { classifyWithReflex } from '@/lib/cortex/reflex-classifier';
import { classifyWithOrchestrator } from '@/lib/cortex/orchestrator';
import { evaluateNudge } from '@/lib/cortex/nudge';
import { extractEntities } from '@/lib/cortex/entity-extractor';
import type { ClassificationResult, CortexContext } from '@/lib/cortex/types';

// Request schema
interface ClassifyRequest {
  input: string;
  context: CortexContext;
  options?: {
    forceAI?: boolean;
    skipSafetyNet?: boolean;
  };
}

// Response schema
interface ClassifyResponse {
  chain: IntentChain;
  handledBy: 'reflex' | 'orchestrator';
  
  // Clarification (if needed)
  needsClarification?: boolean;
  clarificationQuestion?: string;
  clarificationOptions?: string[];
  
  // Nudge suggestions (if any)
  suggestions?: NudgeSuggestion[];
  
  // Debug info (dev only)
  debug?: object;
}

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    const body: ClassifyRequest = await request.json();
    const { input, context, options } = body;
    
    // Step 1: Try Reflex Arc (Layer 1)
    const reflexResult = classifyWithReflex(input);
    
    let result: ClassificationResult;
    
    if (reflexResult.shouldEscalateToAI || options?.forceAI) {
      // Step 2: Escalate to Orchestrator (Layer 2)
      const aiResult = await classifyWithOrchestrator(input, context);
      
      result = {
        chain: aiResult.chain,
        handledBy: 'orchestrator',
        totalProcessingTimeMs: performance.now() - startTime,
        debug: process.env.NODE_ENV === 'development' ? {
          reflexResult,
          aiResult: { ...aiResult, chain: undefined },
        } : undefined,
      };
      
      // Handle clarification
      if (aiResult.needsClarification) {
        return NextResponse.json({
          ...result,
          needsClarification: true,
          clarificationQuestion: aiResult.clarificationQuestion,
          clarificationOptions: aiResult.clarificationOptions,
        });
      }
    } else {
      // Handle locally with Reflex Arc
      const entities = extractEntities(input, reflexResult.intent);
      
      result = {
        chain: {
          id: crypto.randomUUID(),
          originalInput: input,
          createdAt: new Date(),
          actions: [{
            id: crypto.randomUUID(),
            sequence: 1,
            intent: reflexResult.intent,
            confidence: reflexResult.confidence,
            entities,
            status: 'pending',
            requiresConfirmation: false,
          }],
          status: 'pending',
          meta: {
            source: 'local',
            processingTimeMs: reflexResult.processingTimeMs,
          },
        },
        handledBy: 'reflex',
        totalProcessingTimeMs: performance.now() - startTime,
      };
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: 'Classificatie mislukt' },
      { status: 500 }
    );
  }
}
```

### 7.2 Action Execution API

**Endpoint:** `POST /api/cortex/execute`

```typescript
// app/api/cortex/execute/route.ts

interface ExecuteRequest {
  chainId: string;
  actionId: string;
  confirmed?: boolean;  // For actions requiring confirmation
}

interface ExecuteResponse {
  success: boolean;
  action: IntentAction;
  suggestions?: NudgeSuggestion[];  // From Nudge
  error?: string;
}
```

### 7.3 Context API

**Endpoint:** `GET /api/cortex/context`

Returns current context for AI classification:
- Active patient
- Today's agenda  
- Recent actions
- Current shift

---

## 8. Frontend Components

### 8.1 Component Hierarchy

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

### 8.2 ActionChainCard Component

```tsx
// components/cortex/chat/action-chain-card.tsx

'use client';

import { useState } from 'react';
import { Check, X, Loader2, AlertCircle } from 'lucide-react';
import type { IntentChain, IntentAction } from '@/lib/cortex/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActionChainCardProps {
  chain: IntentChain;
  onConfirm: (actionId: string) => void;
  onSkip: (actionId: string) => void;
  onRetry: (actionId: string) => void;
}

const STATUS_ICONS = {
  pending: <div className="w-2 h-2 rounded-full bg-slate-300" />,
  confirming: <AlertCircle className="w-4 h-4 text-amber-500" />,
  executing: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
  success: <Check className="w-4 h-4 text-green-500" />,
  failed: <X className="w-4 h-4 text-red-500" />,
  skipped: <X className="w-4 h-4 text-slate-400" />,
};

const INTENT_LABELS: Record<string, string> = {
  dagnotitie: 'Notitie',
  zoeken: 'Zoeken',
  overdracht: 'Overdracht',
  agenda_query: 'Agenda',
  create_appointment: 'Afspraak maken',
  cancel_appointment: 'Afspraak annuleren',
  reschedule_appointment: 'Afspraak verzetten',
};

export function ActionChainCard({ 
  chain, 
  onConfirm, 
  onSkip,
  onRetry 
}: ActionChainCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
        <span className="text-sm text-slate-600">
          {chain.actions.length} {chain.actions.length === 1 ? 'actie' : 'acties'} gedetecteerd
        </span>
      </div>
      
      {/* Actions */}
      <div className="divide-y divide-slate-100">
        {chain.actions.map((action, index) => (
          <ActionItem
            key={action.id}
            action={action}
            index={index}
            onConfirm={() => onConfirm(action.id)}
            onSkip={() => onSkip(action.id)}
            onRetry={() => onRetry(action.id)}
          />
        ))}
      </div>
      
      {/* AI Reasoning (collapsible) */}
      {chain.meta.aiReasoning && (
        <details className="px-4 py-2 bg-slate-50 border-t border-slate-200">
          <summary className="text-xs text-slate-500 cursor-pointer">
            AI Redenering
          </summary>
          <p className="mt-1 text-xs text-slate-600">
            {chain.meta.aiReasoning}
          </p>
        </details>
      )}
    </div>
  );
}

function ActionItem({ 
  action, 
  index,
  onConfirm,
  onSkip,
  onRetry
}: { 
  action: IntentAction; 
  index: number;
  onConfirm: () => void;
  onSkip: () => void;
  onRetry: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className={cn(
      "px-4 py-3",
      action.status === 'confirming' && "bg-amber-50",
      action.status === 'failed' && "bg-red-50",
    )}>
      {/* Main row */}
      <div className="flex items-center gap-3">
        {/* Sequence number */}
        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
          {index + 1}
        </span>
        
        {/* Status icon */}
        {STATUS_ICONS[action.status]}
        
        {/* Intent label */}
        <span className="font-medium text-slate-900">
          {INTENT_LABELS[action.intent] || action.intent}
        </span>
        
        {/* Entity preview */}
        {action.entities.patientName && (
          <span className="text-slate-500">
            • {action.entities.patientName}
          </span>
        )}
        
        {/* Confidence badge */}
        <span className={cn(
          "ml-auto text-xs px-2 py-0.5 rounded-full",
          action.confidence >= 0.9 && "bg-green-100 text-green-700",
          action.confidence >= 0.7 && action.confidence < 0.9 && "bg-amber-100 text-amber-700",
          action.confidence < 0.7 && "bg-red-100 text-red-700",
        )}>
          {Math.round(action.confidence * 100)}%
        </span>
      </div>
      
      {/* Confirmation buttons */}
      {action.status === 'confirming' && action.confirmationMessage && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-amber-700">
            {action.confirmationMessage}
          </span>
          <Button size="sm" onClick={onConfirm}>
            Bevestig
          </Button>
          <Button size="sm" variant="ghost" onClick={onSkip}>
            Overslaan
          </Button>
        </div>
      )}
      
      {/* Error state */}
      {action.status === 'failed' && action.error && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-red-700">
            {action.error.message}
          </span>
          {action.error.recoverable && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              Opnieuw
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
```

### 8.3 NudgeToast Component (Layer 3 UI)

```tsx
// components/cortex/command-center/nudge-toast.tsx

'use client';

import { useEffect, useState } from 'react';
import { X, Lightbulb, ArrowRight } from 'lucide-react';
import type { NudgeSuggestion } from '@/lib/cortex/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NudgeToastProps {
  suggestion: NudgeSuggestion;
  onAccept: (suggestionId: string) => void;
  onDismiss: (suggestionId: string) => void;
}

const PRIORITY_STYLES = {
  high: 'border-red-200 bg-red-50',
  medium: 'border-amber-200 bg-amber-50',
  low: 'border-blue-200 bg-blue-50',
};

export function NudgeToast({
  suggestion,
  onAccept,
  onDismiss
}: NudgeToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(100);
  
  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Countdown timer
  useEffect(() => {
    if (!suggestion.expiresAt) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const expires = new Date(suggestion.expiresAt!).getTime();
      const total = expires - new Date(suggestion.createdAt).getTime();
      const remaining = expires - now;
      
      if (remaining <= 0) {
        onDismiss(suggestion.id);
      } else {
        setTimeLeft(Math.round((remaining / total) * 100));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [suggestion, onDismiss]);
  
  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 max-w-sm rounded-lg border shadow-lg transition-all duration-300",
        PRIORITY_STYLES[suggestion.priority],
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 rounded-t-lg overflow-hidden">
        <div 
          className="h-full bg-slate-400 transition-all duration-1000"
          style={{ width: `${timeLeft}%` }}
        />
      </div>
      
      {/* Content */}
      <div className="p-4 pt-5">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">
              {suggestion.suggestion.message}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {suggestion.suggestion.rationale}
            </p>
          </div>
          
          <button
            onClick={() => onDismiss(suggestion.id)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          <Button 
            size="sm" 
            onClick={() => onAccept(suggestion.id)}
            className="gap-1"
          >
            Ja, doe maar
            <ArrowRight className="w-3 h-3" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onDismiss(suggestion.id)}
          >
            Nee, bedankt
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 8.4 ClarificationCard Component

```tsx
// components/cortex/chat/clarification-card.tsx

'use client';

import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClarificationCardProps {
  question: string;
  options: string[];
  onSelect: (option: string) => void;
}

export function ClarificationCard({ 
  question, 
  options, 
  onSelect 
}: ClarificationCardProps) {
  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
      <div className="flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        
        <div>
          <p className="text-sm text-slate-700">{question}</p>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {options.map((option) => (
              <Button
                key={option}
                size="sm"
                variant="outline"
                onClick={() => onSelect(option)}
                className="bg-white"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 9. State Management

### 9.1 Enhanced Cortex Store

```typescript
// stores/cortex-store.ts (V2 additions)

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  CortexContext,
  IntentChain,
  IntentAction,
  NudgeSuggestion,
} from '@/lib/cortex/types';

interface CortexStoreV2 {
  // ============ CONTEXT ============
  context: CortexContext;
  setContext: (context: Partial<CortexContext>) => void;
  
  // ============ INTENT CHAINS ============
  activeChain: IntentChain | null;
  chainHistory: IntentChain[];
  
  // Chain actions
  startChain: (chain: IntentChain) => void;
  updateActionStatus: (
    chainId: string, 
    actionId: string, 
    status: IntentAction['status'],
    error?: IntentAction['error']
  ) => void;
  confirmAction: (chainId: string, actionId: string) => void;
  skipAction: (chainId: string, actionId: string) => void;
  completeChain: (chainId: string) => void;
  
  // ============ NUDGE ============
  suggestions: NudgeSuggestion[];
  
  addSuggestion: (suggestion: NudgeSuggestion) => void;
  acceptSuggestion: (suggestionId: string) => void;
  dismissSuggestion: (suggestionId: string) => void;
  clearExpiredSuggestions: () => void;
  
  // ============ CLARIFICATION ============
  pendingClarification: {
    question: string;
    options: string[];
    originalInput: string;
  } | null;
  
  setClarification: (clarification: CortexStoreV2['pendingClarification']) => void;
  answerClarification: (answer: string) => void;
}

export const useCortexStoreV2 = create<CortexStoreV2>()(
  devtools(
    persist(
      (set, get) => ({
        // Context
        context: {
          activePatient: null,
          currentView: 'dashboard',
          shift: 'ochtend',
          currentTime: new Date(),
          agendaToday: [],
          recentIntents: [],
        },
        
        setContext: (partial) => set((state) => ({
          context: { ...state.context, ...partial },
        })),
        
        // Chains
        activeChain: null,
        chainHistory: [],
        
        startChain: (chain) => set({
          activeChain: chain,
        }),
        
        updateActionStatus: (chainId, actionId, status, error) => set((state) => {
          if (state.activeChain?.id !== chainId) return state;
          
          const actions = state.activeChain.actions.map(action => 
            action.id === actionId 
              ? { 
                  ...action, 
                  status,
                  error,
                  ...(status === 'executing' ? { startedAt: new Date() } : {}),
                  ...(status === 'success' || status === 'failed' ? { completedAt: new Date() } : {}),
                }
              : action
          );
          
          return {
            activeChain: {
              ...state.activeChain,
              actions,
            },
          };
        }),
        
        confirmAction: (chainId, actionId) => set((state) => {
          if (state.activeChain?.id !== chainId) return state;
          
          return {
            activeChain: {
              ...state.activeChain,
              actions: state.activeChain.actions.map(action =>
                action.id === actionId
                  ? { ...action, status: 'executing' as const }
                  : action
              ),
            },
          };
        }),
        
        skipAction: (chainId, actionId) => set((state) => {
          if (state.activeChain?.id !== chainId) return state;
          
          return {
            activeChain: {
              ...state.activeChain,
              actions: state.activeChain.actions.map(action =>
                action.id === actionId
                  ? { ...action, status: 'skipped' as const }
                  : action
              ),
            },
          };
        }),
        
        completeChain: (chainId) => set((state) => {
          if (state.activeChain?.id !== chainId) return state;
          
          const completedChain = {
            ...state.activeChain,
            status: 'completed' as const,
          };
          
          return {
            activeChain: null,
            chainHistory: [completedChain, ...state.chainHistory].slice(0, 20),
          };
        }),
        
        // Suggestions
        suggestions: [],
        
        addSuggestion: (suggestion) => set((state) => ({
          suggestions: [...state.suggestions, suggestion],
        })),
        
        acceptSuggestion: (suggestionId) => set((state) => ({
          suggestions: state.suggestions.map(s =>
            s.id === suggestionId
              ? { ...s, status: 'accepted' as const }
              : s
          ),
        })),
        
        dismissSuggestion: (suggestionId) => set((state) => ({
          suggestions: state.suggestions.filter(s => s.id !== suggestionId),
        })),
        
        clearExpiredSuggestions: () => set((state) => ({
          suggestions: state.suggestions.filter(s => 
            !s.expiresAt || new Date(s.expiresAt) > new Date()
          ),
        })),
        
        // Clarification
        pendingClarification: null,
        
        setClarification: (clarification) => set({
          pendingClarification: clarification,
        }),
        
        answerClarification: (answer) => {
          const { pendingClarification } = get();
          if (!pendingClarification) return;
          
          // Re-classify with the clarified input
          // This would trigger a new classification request
          set({ pendingClarification: null });
        },
      }),
      {
        name: 'cortex-store-v2',
        partialize: (state) => ({
          chainHistory: state.chainHistory.slice(0, 10),
        }),
      }
    ),
    { name: 'cortex-v2' }
  )
);
```

---

## 10. Implementatie Roadmap

### Fase 1: Hybrid Foundation (Week 1-2)

| # | Task | Beschrijving | Effort |
|---|------|--------------|--------|
| 1.1 | Context Types | Nieuwe types voor CortexContext | S |
| 1.2 | Context API | GET /api/cortex/context endpoint | M |
| 1.3 | Context Injection | Update AI classifier om context te ontvangen | M |
| 1.4 | Reflex Complexity Detection | Multi-intent en context signals detectie | S |
| 1.5 | Clarification UI | ClarificationCard component | S |

**Deliverable:** AI begrijpt context en geeft verduidelijkingsvragen

### Fase 2: Multi-Intent Support (Week 3-4)

| # | Task | Beschrijving | Effort |
|---|------|--------------|--------|
| 2.1 | IntentChain Types | Nieuwe types voor chains en actions | M |
| 2.2 | Orchestrator Prompt | AI prompt voor multi-intent parsing | M |
| 2.3 | Chain Store | Zustand state voor chains | M |
| 2.4 | ActionChainCard | UI voor meerdere acties | L |
| 2.5 | Chain Execution | Sequential action execution met confirmations | L |

**Deliverable:** "Zeg Jan af en maak notitie" werkt

### Fase 3: Nudge (Week 5-6)

| # | Task | Beschrijving | Effort |
|---|------|--------------|--------|
| 3.1 | Protocol Rules | Rule definitions voor wondzorg, medicatie | M |
| 3.2 | Nudge Engine | evaluateNudge functie | M |
| 3.3 | NudgeToast | UI component met timer | M |
| 3.4 | Suggestion Flow | Accept/dismiss handling | S |
| 3.5 | Protocol Admin | Admin UI voor regels (optional) | L |

**Deliverable:** Proactieve suggesties na acties

### Fase 4: Polish & Optimization (Week 7-8)

| # | Task | Beschrijving | Effort |
|---|------|--------------|--------|
| 4.1 | Error Handling | Graceful degradation, rollbacks | M |
| 4.2 | Performance | Caching, parallel requests | M |
| 4.3 | Analytics | Telemetry voor classificatie success | S |
| 4.4 | Testing | E2E tests voor hele flow | L |
| 4.5 | Documentation | API docs, user guide | S |

---

## 11. Testing Strategy

### 11.1 Unit Tests

```typescript
// lib/cortex/__tests__/reflex-classifier.test.ts

import { classifyWithReflex } from '../reflex-classifier';

describe('Reflex Classifier', () => {
  describe('Simple intents (should NOT escalate)', () => {
    it('handles "notitie jan medicatie"', () => {
      const result = classifyWithReflex('notitie jan medicatie');
      expect(result.intent).toBe('dagnotitie');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.shouldEscalateToAI).toBe(false);
    });
    
    it('handles "agenda vandaag"', () => {
      const result = classifyWithReflex('agenda vandaag');
      expect(result.intent).toBe('agenda_query');
      expect(result.shouldEscalateToAI).toBe(false);
    });
  });
  
  describe('Complex intents (SHOULD escalate)', () => {
    it('escalates multi-intent: "zeg jan af en maak notitie"', () => {
      const result = classifyWithReflex('zeg jan af en maak notitie');
      expect(result.shouldEscalateToAI).toBe(true);
      expect(result.escalationReason).toBe('multi_intent_detected');
    });
    
    it('escalates context-dependent: "maak notitie voor hem"', () => {
      const result = classifyWithReflex('maak notitie voor hem');
      expect(result.shouldEscalateToAI).toBe(true);
      expect(result.escalationReason).toBe('needs_context');
    });
    
    it('escalates low confidence', () => {
      const result = classifyWithReflex('help jan met iets');
      expect(result.shouldEscalateToAI).toBe(true);
      expect(result.escalationReason).toBe('low_confidence');
    });
  });
});
```

### 11.2 Integration Tests

```typescript
// __tests__/api/intent-classify.test.ts

describe('POST /api/cortex/classify', () => {
  describe('Multi-intent handling', () => {
    it('returns chain with multiple actions', async () => {
      const response = await fetch('/api/cortex/classify', {
        method: 'POST',
        body: JSON.stringify({
          input: 'Zeg de afspraak van Jan af en maak een notitie dat hij ziek is',
          context: mockContext,
        }),
      });
      
      const data = await response.json();
      
      expect(data.chain.actions).toHaveLength(2);
      expect(data.chain.actions[0].intent).toBe('cancel_appointment');
      expect(data.chain.actions[1].intent).toBe('dagnotitie');
    });
  });
  
  describe('Context resolution', () => {
    it('resolves "hij" to active patient', async () => {
      const response = await fetch('/api/cortex/classify', {
        method: 'POST',
        body: JSON.stringify({
          input: 'Maak notitie voor hem',
          context: {
            ...mockContext,
            activePatient: { id: '123', name: 'Jan de Vries' },
          },
        }),
      });
      
      const data = await response.json();
      
      expect(data.chain.actions[0].entities.patientName).toBe('Jan de Vries');
      expect(data.chain.actions[0].entities.patientResolution).toBe('pronoun');
    });
  });
});
```

### 11.3 Test Zinnen Dataset

```json
// lib/cortex/__tests__/test-sentences.json
{
  "single_intent": [
    { "input": "notitie jan medicatie", "expected": ["dagnotitie"] },
    { "input": "zoek marie", "expected": ["zoeken"] },
    { "input": "agenda morgen", "expected": ["agenda_query"] }
  ],
  "multi_intent": [
    { 
      "input": "Zeg Jan af en maak notitie dat hij griep heeft",
      "expected": ["cancel_appointment", "dagnotitie"],
      "entities": [
        { "patientName": "Jan" },
        { "patientName": "Jan", "content": "griep" }
      ]
    },
    {
      "input": "Plan intake marie morgen 14:00 en bel haar huisarts",
      "expected": ["create_appointment", "dagnotitie"],
      "entities": [
        { "patientName": "Marie", "time": "14:00" },
        { "patientName": "Marie" }
      ]
    }
  ],
  "context_dependent": [
    {
      "input": "Maak notitie voor hem",
      "context": { "activePatient": { "name": "Piet" } },
      "expected": ["dagnotitie"],
      "entities": [{ "patientName": "Piet", "patientResolution": "pronoun" }]
    }
  ],
  "ambiguous": [
    {
      "input": "Plan wondzorg",
      "shouldClarify": true,
      "clarificationOptions": ["Notitie maken", "Afspraak inplannen"]
    }
  ]
}
```

---

## 12. Migratie Plan

### 12.1 Backward Compatibility

Het V2 systeem moet naast V1 kunnen draaien tijdens de migratie:

```typescript
// lib/cortex/intent-classifier-adapter.ts

import { classifyIntent as classifyV1 } from './intent-classifier';
import { classifyWithReflex } from './reflex-classifier';
import { classifyWithOrchestrator } from './orchestrator';

const USE_V2 = process.env.NEXT_PUBLIC_CORTEX_V2 === 'true';

export async function classifyIntent(
  input: string,
  context?: CortexContext
): Promise<ClassificationResult> {
  if (!USE_V2) {
    // V1 path - single intent
    const result = classifyV1(input);
    return {
      chain: {
        id: crypto.randomUUID(),
        originalInput: input,
        actions: [{
          id: crypto.randomUUID(),
          sequence: 1,
          intent: result.intent,
          confidence: result.confidence,
          entities: {},
          status: 'pending',
          requiresConfirmation: false,
        }],
        status: 'pending',
        meta: { source: 'local', processingTimeMs: result.processingTimeMs },
        createdAt: new Date(),
      },
      handledBy: 'reflex',
      totalProcessingTimeMs: result.processingTimeMs,
    };
  }
  
  // V2 path - full cortex
  const reflex = classifyWithReflex(input);
  
  if (!reflex.shouldEscalateToAI) {
    // Handle locally
    return buildLocalResult(input, reflex);
  }
  
  // Escalate to AI
  return classifyWithOrchestrator(input, context!);
}
```

### 12.2 Feature Flags

```typescript
// lib/config/feature-flags.ts

export const FEATURE_FLAGS = {
  // V2 Features
  CORTEX_V2_ENABLED: process.env.NEXT_PUBLIC_CORTEX_V2 === 'true',
  CORTEX_MULTI_INTENT: process.env.NEXT_PUBLIC_CORTEX_MULTI_INTENT === 'true',
  CORTEX_NUDGE: process.env.NEXT_PUBLIC_CORTEX_NUDGE === 'true',
  CORTEX_CONTEXT_INJECTION: process.env.NEXT_PUBLIC_CORTEX_CONTEXT === 'true',

  // Rollout percentage (A/B testing)
  CORTEX_V2_ROLLOUT: parseInt(process.env.NEXT_PUBLIC_CORTEX_V2_ROLLOUT || '0', 10),
};

export function isCortexV2Enabled(userId?: string): boolean {
  if (!FEATURE_FLAGS.CORTEX_V2_ENABLED) return false;

  // A/B test based on user ID hash
  if (userId && FEATURE_FLAGS.CORTEX_V2_ROLLOUT < 100) {
    const hash = simpleHash(userId);
    return hash % 100 < FEATURE_FLAGS.CORTEX_V2_ROLLOUT;
  }
  
  return true;
}
```

### 12.3 Rollout Strategie

| Week | Rollout % | Features | Monitoring |
|------|-----------|----------|------------|
| 1 | 0% (dev only) | Context injection | Error rates |
| 2 | 10% | + Multi-intent | Classification accuracy |
| 3 | 25% | + Safety Net | Suggestion acceptance rate |
| 4 | 50% | Full V2 | User feedback |
| 5 | 75% | Full V2 | Performance metrics |
| 6 | 100% | Full V2 | Final review |

---

## Bijlagen

### A. Glossary

| Term | Definitie |
|------|-----------|
| **Intent** | De actie die de gebruiker wil uitvoeren (bijv. "dagnotitie") |
| **IntentChain** | Lijst van intents geëxtraheerd uit één uiting |
| **Reflex Arc** | Layer 1 - snelle lokale pattern matching |
| **Orchestrator** | Layer 2 - AI-gedreven classificatie |
| **Nudge** | Layer 3 - proactieve suggesties |
| **Entity** | Geëxtraheerde data (patiëntnaam, datum, etc.) |
| **Artifact** | UI component voor een specifieke taak |

### B. Referenties

- [FO Cortex Intent System V2](./fo-cortex-intent-system-v2.md)
- [UX Simulatie Next Level](./ux-simulation-intent-next-level.md)  
- [UX Evaluatie Schaalbaarheid](./ux-evaluation-intent-scalability.md)
- [Architecture Proposal V2](./intent-architecture-v2-proposal.md)

### C. Versie Historie

| Versie | Datum | Auteur | Wijzigingen |
|--------|-------|--------|-------------|
| 2.0 | 29-12-2025 | Colin Lit | Initieel document |

