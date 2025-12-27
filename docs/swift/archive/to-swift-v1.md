# Technisch Ontwerp (TO) – Swift: Contextual UI EPD

**Projectnaam:** Swift (Contextual UI EPD)
**Versie:** v1.0
**Datum:** 23-12-2024
**Auteur:** Claude Code / Development Team

---

## 1. Doel en relatie met PRD en FO

### Doel van dit document
Het Technisch Ontwerp beschrijft **hoe** Swift technisch wordt gebouwd. Waar het PRD (swift-prd.md) het *wat* beschrijft en het FO (swift-fo-ai.md) het *hoe functioneel*, gaat dit TO over architectuur, componenten, data flows en implementatie details.

### Relatie met andere documenten
| Document | Beschrijft | Status |
|----------|------------|--------|
| `swift-prd.md` | Product visie, user stories, scope | Definitief |
| `swift-fo-ai.md` | Functionele flows, blocks, intent mapping | Definitief |
| `swift-ux-v2.1.md` | UI specs, design tokens, layouts | Definitief |
| Dit document (TO) | Technische implementatie | Definitief |

---

## 2. Technische Architectuur Overzicht

### 2.1 High-Level Architectuur

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SUAVE FRONTEND                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     COMMAND CENTER                               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │   │
│  │  │ Text Input   │  │ Voice Input  │  │ Context Bar          │   │   │
│  │  │ (cmdk)       │  │ (Deepgram)   │  │ (user/patient/shift) │   │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────────────────┘   │   │
│  │         │                 │                                      │   │
│  │         └────────┬────────┘                                      │   │
│  │                  ▼                                               │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │              INTENT CLASSIFIER                            │   │   │
│  │  │  ┌─────────────────┐    ┌─────────────────────────────┐  │   │   │
│  │  │  │ Tier 1: Local   │───▶│ Tier 2: AI (Claude)         │  │   │   │
│  │  │  │ Regex + Keywords│    │ Fallback bij lage confidence │  │   │   │
│  │  │  │ (<50ms)         │    │ (<500ms)                     │  │   │   │
│  │  │  └─────────────────┘    └─────────────────────────────┘  │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │                  │                                               │   │
│  │                  ▼                                               │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │              BLOCK CONTAINER (Ephemeral)                  │   │   │
│  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │   │   │
│  │  │  │Dagno-  │ │Zoeken  │ │Rappor- │ │Over-   │ │Fallback│  │   │   │
│  │  │  │titie   │ │Block   │ │tage    │ │dracht  │ │Picker  │  │   │   │
│  │  │  │Block   │ │        │ │Block   │ │Block   │ │        │  │   │   │
│  │  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘  │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     ZUSTAND STORE                                │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │   │
│  │  │ Context  │ │ Active   │ │ Recent   │ │ Block State      │    │   │
│  │  │ State    │ │ Patient  │ │ Actions  │ │ (pre-fill data)  │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS API ROUTES                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ /api/intent  │  │ /api/patients│  │ /api/reports │                  │
│  │ /classify    │  │ /search      │  │ (bestaand)   │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ /api/over-   │  │ /api/deepgram│  │ /api/docs/   │                  │
│  │ dracht       │  │ (bestaand)   │  │ chat         │                  │
│  │ (bestaand)   │  │              │  │ (bestaand)   │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL + RLS + Auth + Realtime                                     │
│                                                                         │
│  Tabellen: patients, reports, observations, conditions, care_plans,     │
│            intakes, practitioners, ai_events                            │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Hiërarchie

```
app/
├── epd/
│   └── swift/                          # Nieuwe Swift module
│       ├── page.tsx                    # Main entry point
│       └── layout.tsx                  # Swift-specific layout
│
components/
├── swift/                              # Nieuwe folder
│   ├── command-center/
│   │   ├── command-center.tsx          # Main container
│   │   ├── command-input.tsx           # Text + voice input
│   │   ├── context-bar.tsx             # User/patient/shift info
│   │   └── voice-indicator.tsx         # Recording state
│   │
│   ├── blocks/
│   │   ├── block-container.tsx         # Animation wrapper
│   │   ├── dagnotitie-block.tsx        # Quick note entry
│   │   ├── zoeken-block.tsx            # Patient search
│   │   ├── rapportage-block.tsx        # Full report
│   │   ├── overdracht-block.tsx        # AI summary
│   │   └── fallback-picker.tsx         # Manual block selection
│   │
│   ├── shared/
│   │   ├── patient-card.tsx            # Compact patient info
│   │   ├── recent-actions.tsx          # Recent activity list
│   │   └── keyboard-hints.tsx          # Shortcut overlay
│   │
│   └── index.ts                        # Barrel exports
│
stores/                                  # Nieuwe folder
│   └── swift-store.ts                  # Zustand store
│
lib/
├── swift/                              # Nieuwe folder
│   ├── intent-classifier.ts            # Local classification
│   ├── entity-extractor.ts             # Extract patient, category
│   ├── block-registry.ts               # Block definitions
│   └── types.ts                        # Swift-specific types
│
hooks/
│   ├── use-swift-store.ts              # Store hook
│   ├── use-intent.ts                   # Intent classification hook
│   └── use-keyboard-shortcuts.ts       # Cmd+K etc.
```

---

## 3. Techstack Selectie

### 3.1 Bestaande Stack (hergebruiken)

| Component | Technologie | Versie | Status |
|-----------|-------------|--------|--------|
| Framework | Next.js | 14.2.18 | ✅ Bestaand |
| UI Library | React | 18.3.1 | ✅ Bestaand |
| Styling | TailwindCSS | 3.4.18 | ✅ Bestaand |
| Components | shadcn/ui | - | ✅ Bestaand |
| Command Palette | cmdk | 1.1.1 | ✅ Bestaand |
| Animations | framer-motion | 12.23.24 | ✅ Bestaand |
| Database | Supabase | 2.81.1 | ✅ Bestaand |
| Speech-to-Text | Deepgram | 4.11.2 | ✅ Bestaand |
| AI | Claude API | - | ✅ Bestaand |
| Validation | Zod | 4.1.12 | ✅ Bestaand |
| Forms | react-hook-form | 7.66.1 | ✅ Bestaand |
| Icons | lucide-react | 0.553.0 | ✅ Bestaand |
| Dates | date-fns | 4.1.0 | ✅ Bestaand |

### 3.2 Nieuwe Dependencies (toe te voegen)

| Component | Technologie | Versie | Reden | Alternatieven |
|-----------|-------------|--------|-------|---------------|
| State Management | Zustand | ^4.5.0 | Lightweight, geen providers, TypeScript-first | Jotai, Redux Toolkit |

**Installatie:**
```bash
pnpm add zustand
```

**Waarom Zustand?**
- 3KB gzipped (vs Redux 7KB)
- Geen Provider wrapping nodig
- TypeScript-first met goede inference
- Middleware support (devtools, persist)
- Past bij de "minimal overhead" filosofie van Swift

---

## 4. Datamodel

### 4.1 Bestaande Tabellen (hergebruiken)

```sql
-- Patients (bestaand)
patients (
  id UUID PRIMARY KEY,
  name_given TEXT,
  name_family TEXT,
  name_prefix TEXT,
  birth_date DATE,
  gender TEXT,
  created_at TIMESTAMP
)

-- Reports (bestaand) - gebruikt voor dagnotities
reports (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  type TEXT,                              -- 'verpleegkundig' voor dagnotities
  content TEXT,
  structured_data JSONB,                  -- { category: 'medicatie'|'adl'|... }
  include_in_handover BOOLEAN,
  shift_date DATE,
  created_at TIMESTAMP,
  created_by UUID,
  deleted_at TIMESTAMP                    -- Soft delete
)

-- Observations (bestaand) - vitals
observations (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  code_display TEXT,
  value_quantity_value NUMERIC,
  value_quantity_unit TEXT,
  effective_datetime TIMESTAMP
)

-- Conditions (bestaand) - diagnoses
conditions (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  code_display TEXT,
  clinical_status TEXT,
  onset_datetime TIMESTAMP
)
```

### 4.2 Nieuwe Tabellen

```sql
-- Intent Events (nieuw) - voor analytics en training
CREATE TABLE intent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),

  -- Input
  raw_input TEXT NOT NULL,
  input_source TEXT NOT NULL,             -- 'text' | 'voice'

  -- Classification result
  intent TEXT NOT NULL,                   -- 'dagnotitie' | 'zoeken' | ...
  confidence NUMERIC(3,2) NOT NULL,       -- 0.00 - 1.00
  tier TEXT NOT NULL,                     -- 'local' | 'ai'

  -- Extracted entities
  entities JSONB,                         -- { patient_name, category, ... }

  -- Outcome
  block_opened TEXT,                      -- Which block was actually opened
  action_completed BOOLEAN,               -- Did user complete the action?

  -- Performance
  classification_ms INTEGER,              -- Time to classify

  -- Context
  context JSONB                           -- { activePatient, shift, ... }
);

-- Index voor analytics queries
CREATE INDEX idx_intent_events_created ON intent_events(created_at);
CREATE INDEX idx_intent_events_intent ON intent_events(intent);
CREATE INDEX idx_intent_events_user ON intent_events(user_id);

-- RLS Policy
ALTER TABLE intent_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own events" ON intent_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own events" ON intent_events
  FOR SELECT USING (auth.uid() = user_id);
```

### 4.3 TypeScript Types

```typescript
// lib/swift/types.ts

// Intent types
export const SUAVE_INTENTS = [
  'dagnotitie',
  'zoeken',
  'rapportage',
  'overdracht',
  'patient_info',
  'agenda',
  'onbekend',
] as const;

export type SwiftIntent = (typeof SUAVE_INTENTS)[number];

// Classification result
export interface IntentClassification {
  intent: SwiftIntent;
  confidence: number;           // 0.0 - 1.0
  tier: 'local' | 'ai';
  entities: ExtractedEntities;
  clarificationNeeded?: boolean;
  clarificationPrompt?: string;
}

// Extracted entities from input
export interface ExtractedEntities {
  patientName?: string;
  patientId?: string;           // If resolved
  category?: VerpleegkundigCategory;
  content?: string;
  timeRange?: string;
  reportType?: ReportType;
}

// Block state
export interface BlockState {
  type: SwiftIntent | null;
  isOpen: boolean;
  prefillData: Partial<ExtractedEntities>;
  animationState: 'entering' | 'visible' | 'exiting' | 'hidden';
}

// Context state
export interface SwiftContext {
  user: {
    id: string;
    name: string;
    role: string;
  } | null;
  activePatient: {
    id: string;
    name: string;
    roomNumber?: string;
  } | null;
  shift: 'nacht' | 'ochtend' | 'middag' | 'avond';
  recentPatients: Array<{
    id: string;
    name: string;
    lastAction: string;
    timestamp: Date;
  }>;
  recentActions: Array<{
    type: string;
    patientName: string;
    timestamp: Date;
    success: boolean;
  }>;
}

// Store state
export interface SwiftStore {
  // Context
  context: SwiftContext;
  setActivePatient: (patient: SwiftContext['activePatient']) => void;
  addRecentAction: (action: SwiftContext['recentActions'][0]) => void;

  // Block
  block: BlockState;
  openBlock: (type: SwiftIntent, prefillData?: Partial<ExtractedEntities>) => void;
  closeBlock: () => void;

  // Input
  inputValue: string;
  setInputValue: (value: string) => void;
  isVoiceActive: boolean;
  setVoiceActive: (active: boolean) => void;

  // Classification
  isClassifying: boolean;
  lastClassification: IntentClassification | null;
}
```

---

## 5. API Ontwerp

### 5.1 Nieuwe Endpoints

#### POST /api/intent/classify

Classifieert gebruikersinput naar intent + entities.

```typescript
// Request
interface ClassifyRequest {
  input: string;
  source: 'text' | 'voice';
  context?: {
    activePatientId?: string;
    shift?: string;
  };
}

// Response
interface ClassifyResponse {
  intent: SwiftIntent;
  confidence: number;
  tier: 'local' | 'ai';
  entities: ExtractedEntities;
  clarificationNeeded?: boolean;
  clarificationPrompt?: string;
  classificationMs: number;
}

// Example
POST /api/intent/classify
{
  "input": "notitie jan medicatie gegeven",
  "source": "voice",
  "context": { "shift": "ochtend" }
}

// Response
{
  "intent": "dagnotitie",
  "confidence": 0.95,
  "tier": "local",
  "entities": {
    "patientName": "jan",
    "category": "medicatie",
    "content": "medicatie gegeven"
  },
  "classificationMs": 12
}
```

#### GET /api/patients/search

Fuzzy search voor patiënten.

```typescript
// Request
GET /api/patients/search?q=jan&limit=5

// Response
interface SearchResponse {
  patients: Array<{
    id: string;
    name: string;
    birthDate: string;
    roomNumber?: string;
    primaryDiagnosis?: string;
    matchScore: number;
  }>;
  totalCount: number;
}

// Example Response
{
  "patients": [
    {
      "id": "uuid-1",
      "name": "Jan de Vries",
      "birthDate": "1965-03-15",
      "roomNumber": "K204",
      "primaryDiagnosis": "F41.1 Gegeneraliseerde angststoornis",
      "matchScore": 0.95
    },
    {
      "id": "uuid-2",
      "name": "Janneke van den Berg",
      "birthDate": "1978-08-22",
      "roomNumber": "K108",
      "matchScore": 0.72
    }
  ],
  "totalCount": 2
}
```

### 5.2 Bestaande Endpoints (hergebruiken)

| Endpoint | Method | Gebruik in Swift |
|----------|--------|------------------|
| `/api/reports` | POST | DagnotatieBlock, RapportageBlock |
| `/api/reports/[id]` | PATCH/DELETE | Edit/delete notities |
| `/api/overdracht/generate` | POST | OverdrachtBlock AI summary |
| `/api/overdracht/patients` | GET | Patiënten met updates |
| `/api/overdracht/[patientId]` | GET | Patient detail data |
| `/api/deepgram/token` | GET | Streaming voice token |
| `/api/deepgram/transcribe` | POST | Batch transcription |

### 5.3 API Route Implementatie

```typescript
// app/api/intent/classify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { z } from 'zod';
import { classifyIntentLocal } from '@/lib/swift/intent-classifier';
import { classifyIntentAI } from '@/lib/swift/intent-classifier-ai';

const ClassifySchema = z.object({
  input: z.string().min(1).max(500),
  source: z.enum(['text', 'voice']),
  context: z.object({
    activePatientId: z.string().uuid().optional(),
    shift: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const result = ClassifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validatiefout', details: result.error.issues },
        { status: 400 }
      );
    }

    const { input, source, context } = result.data;
    const supabase = await createClient();

    // Check auth
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    // Tier 1: Local classification
    const localResult = classifyIntentLocal(input);

    let classification = localResult;
    let tier: 'local' | 'ai' = 'local';

    // Tier 2: AI fallback if confidence < 0.8
    if (localResult.confidence < 0.8) {
      const aiResult = await classifyIntentAI(input, context);
      if (aiResult.confidence > localResult.confidence) {
        classification = aiResult;
        tier = 'ai';
      }
    }

    const classificationMs = Date.now() - startTime;

    // Log event for analytics
    await supabase.from('intent_events').insert({
      user_id: authData.user.id,
      raw_input: input,
      input_source: source,
      intent: classification.intent,
      confidence: classification.confidence,
      tier,
      entities: classification.entities,
      classification_ms: classificationMs,
      context,
    });

    return NextResponse.json({
      ...classification,
      tier,
      classificationMs,
    });

  } catch (error) {
    console.error('Intent classification error:', error);
    return NextResponse.json(
      { error: 'Classificatie mislukt' },
      { status: 500 }
    );
  }
}
```

---

## 6. Security & Compliance

### 6.1 Security Maatregelen

| Maatregel | Implementatie | Status |
|-----------|---------------|--------|
| **Authentication** | Supabase Auth (session-based) | ✅ Bestaand |
| **Authorization** | Row Level Security (RLS) op alle tabellen | ✅ Bestaand |
| **Input Validation** | Zod schemas op alle endpoints | ✅ Bestaand |
| **Data Encryption** | At rest (Supabase), in transit (HTTPS) | ✅ Bestaand |
| **CORS** | Restrictive origins | ✅ Bestaand |
| **Rate Limiting** | Vercel Edge (100 req/min) | ✅ Bestaand |

### 6.2 RLS Policies voor Nieuwe Tabel

```sql
-- intent_events: alleen eigen events
ALTER TABLE intent_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own events" ON intent_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own events" ON intent_events
  FOR SELECT USING (auth.uid() = user_id);

-- Admins kunnen alle events lezen (voor analytics)
CREATE POLICY "Admins read all events" ON intent_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM practitioners
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
```

### 6.3 Privacy & AVG

| Aspect | Implementatie |
|--------|---------------|
| **Data Minimalisatie** | Alleen noodzakelijke velden in intent_events |
| **Voice Data** | Wordt NIET opgeslagen - alleen transcript |
| **Patient Data** | Bestaande RLS policies van toepassing |
| **Logging** | Audit trail via ai_events en intent_events |
| **Consent** | Gebruiker activeert voice expliciet (push-to-talk) |

---

## 7. AI/LLM Integratie

### 7.1 Intent Classification (Tier 2)

```typescript
// lib/swift/intent-classifier-ai.ts

const INTENT_CLASSIFICATION_PROMPT = `
Je bent een intent classifier voor een Nederlands EPD systeem.
Analyseer de gebruikersinput en bepaal:
1. De intent (dagnotitie, zoeken, rapportage, overdracht, patient_info, agenda, onbekend)
2. Geëxtraheerde entities (patiëntnaam, categorie, content, etc.)
3. Confidence score (0.0 - 1.0)

Categorieën voor dagnotities: medicatie, adl, gedrag, incident, observatie

Antwoord ALLEEN in JSON format:
{
  "intent": "string",
  "confidence": number,
  "entities": {
    "patientName": "string of null",
    "category": "string of null",
    "content": "string of null"
  },
  "clarificationNeeded": boolean,
  "clarificationPrompt": "string of null"
}
`;

export async function classifyIntentAI(
  input: string,
  context?: { activePatientId?: string; shift?: string }
): Promise<IntentClassification> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',  // Snelste model voor classificatie
      max_tokens: 256,
      temperature: 0.1,
      system: INTENT_CLASSIFICATION_PROMPT,
      messages: [{
        role: 'user',
        content: `Input: "${input}"\nContext: ${JSON.stringify(context || {})}`
      }],
    }),
  });

  // Parse response...
}
```

### 7.2 Model Selectie

| Taak | Model | Reden |
|------|-------|-------|
| Intent Classification | claude-3-5-haiku | Snel (<200ms), goedkoop, voldoende accuraat |
| Overdracht Summary | claude-sonnet-4 | Complexer, betere Nederlandse output |
| Report Structuring | claude-3-5-haiku | Snel, kosten-effectief |

### 7.3 Cost Management

```typescript
// Token limits en caching
const AI_CONFIG = {
  intentClassification: {
    model: 'claude-3-5-haiku-20241022',
    maxTokens: 256,
    cacheKey: (input: string) => `intent:${hash(input.toLowerCase())}`,
    cacheTTL: 300,  // 5 min - zelfde input = zelfde intent
  },
  overdrachtSummary: {
    model: 'claude-sonnet-4-20250514',
    maxTokens: 2048,
    cacheKey: (patientId: string, period: string) =>
      `overdracht:${patientId}:${period}:${today()}`,
    cacheTTL: 3600,  // 1 uur - data verandert niet snel
  },
};
```

---

## 8. Performance & Scalability

### 8.1 Performance Targets

| Metric | Target | Meetmethode |
|--------|--------|-------------|
| Command Center render | <100ms | React DevTools |
| Local intent classification | <50ms | API response time |
| AI intent classification | <500ms | API response time |
| Block animation | 60fps | Chrome DevTools |
| Voice-to-text | <1s | Deepgram streaming |
| Patient search | <200ms | API response time |

### 8.2 Optimalisatie Strategieën

```typescript
// 1. Debounced input voor classificatie
const debouncedClassify = useMemo(
  () => debounce(classifyIntent, 150),
  []
);

// 2. Optimistic UI voor notities
const saveNotitie = async (data: NotitieData) => {
  // Direct toevoegen aan UI
  addOptimisticAction({
    type: 'dagnotitie',
    patientName: data.patientName,
    status: 'saving',
  });

  // Async opslaan
  try {
    await api.reports.create(data);
    markActionComplete();
  } catch (error) {
    rollbackAction();
    showError();
  }
};

// 3. Prefetching voor patient search
const prefetchPatients = () => {
  // Prefetch recent patients bij mount
  queryClient.prefetchQuery({
    queryKey: ['patients', 'recent'],
    queryFn: fetchRecentPatients,
  });
};

// 4. Code splitting voor blocks
const DagnotatieBlock = dynamic(
  () => import('@/components/swift/blocks/dagnotitie-block'),
  { loading: () => <BlockSkeleton /> }
);
```

### 8.3 Bundle Size Impact

| Component | Estimated Size | Mitigation |
|-----------|----------------|------------|
| Zustand | ~3KB gzipped | Minimal overhead |
| Swift components | ~15KB gzipped | Code splitting |
| Intent classifier | ~2KB gzipped | - |
| **Total Swift** | ~20KB gzipped | Lazy loaded |

---

## 9. Deployment & CI/CD

### 9.1 Feature Flag Strategie

```typescript
// lib/feature-flags.ts
export const FEATURES = {
  swift: {
    enabled: process.env.NEXT_PUBLIC_SUAVE_ENABLED === 'true',
    allowedUsers: ['admin', 'developer'],  // Role-based rollout
  },
};

// Usage in layout
export default function EPDLayout({ children }) {
  const { user } = useAuth();

  if (FEATURES.swift.enabled &&
      FEATURES.swift.allowedUsers.includes(user?.role)) {
    return <SwiftLayout>{children}</SwiftLayout>;
  }

  return <TraditionalLayout>{children}</TraditionalLayout>;
}
```

### 9.2 Migration Plan

```
FASE 1: Parallel (Week 1-2)
├── Swift naast bestaande EPD
├── Toggle via feature flag
└── Alleen voor developers

FASE 2: Beta (Week 3-4)
├── Swift default voor geselecteerde users
├── Fallback naar traditioneel EPD
└── Feedback verzamelen

FASE 3: Rollout (Week 5+)
├── Swift default voor alle users
├── Traditioneel EPD als fallback optie
└── Metrics monitoren
```

### 9.3 Database Migration

```bash
# Nieuwe migration file
supabase/migrations/20241223_add_intent_events.sql
```

---

## 10. Monitoring & Logging

### 10.1 Metrics Dashboard

```typescript
// Swift-specifieke metrics
const SUAVE_METRICS = {
  // Intent accuracy
  intentAccuracy: {
    query: `
      SELECT
        intent,
        tier,
        AVG(confidence) as avg_confidence,
        COUNT(*) as count,
        SUM(CASE WHEN action_completed THEN 1 ELSE 0 END)::float / COUNT(*) as completion_rate
      FROM intent_events
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY intent, tier
    `,
    threshold: { completion_rate: 0.8 },
  },

  // Voice adoption
  voiceAdoption: {
    query: `
      SELECT
        input_source,
        COUNT(*) as count
      FROM intent_events
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY input_source
    `,
    target: { voice_percentage: 0.4 },
  },

  // Fallback usage
  fallbackUsage: {
    query: `
      SELECT
        COUNT(*) FILTER (WHERE intent = 'onbekend') as fallback_count,
        COUNT(*) as total_count
      FROM intent_events
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `,
    threshold: { fallback_rate: 0.15 },
  },

  // Performance
  classificationLatency: {
    query: `
      SELECT
        tier,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY classification_ms) as p50,
        percentile_cont(0.95) WITHIN GROUP (ORDER BY classification_ms) as p95
      FROM intent_events
      WHERE created_at > NOW() - INTERVAL '1 hour'
      GROUP BY tier
    `,
    threshold: { local_p95: 50, ai_p95: 500 },
  },
};
```

### 10.2 Error Tracking

```typescript
// Sentry integration voor Swift
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['/api/intent', '/api/patients'],
    }),
  ],
  beforeSend(event) {
    // Tag Swift-specifieke errors
    if (event.request?.url?.includes('/swift')) {
      event.tags = { ...event.tags, module: 'swift' };
    }
    return event;
  },
});
```

---

## 11. Risico's & Technische Mitigatie

| Risico | Impact | Waarschijnlijkheid | Mitigatie |
|--------|--------|-------------------|-----------|
| **Voice recognition accuracy** | Hoog | Middel | Deepgram NL model testen, fallback naar tekst |
| **Intent misclassificatie** | Hoog | Middel | Two-tier systeem, fallback picker altijd zichtbaar |
| **AI API latency** | Middel | Laag | Local-first classificatie, Haiku model voor snelheid |
| **Claude API outage** | Hoog | Laag | Graceful degradation naar local-only, error messages |
| **Browser compatibility (voice)** | Middel | Laag | Feature detection, fallback messaging |
| **User adoption resistance** | Middel | Middel | Feature flag, dual-mode, training |
| **Performance regression** | Middel | Laag | Lazy loading, code splitting, monitoring |

### 11.1 Fallback Strategieën

```typescript
// Intent classification fallback chain
const classifyWithFallbacks = async (input: string) => {
  try {
    // 1. Try local first
    const local = classifyIntentLocal(input);
    if (local.confidence >= 0.9) return local;

    // 2. Try AI if available
    if (isAIAvailable()) {
      try {
        const ai = await classifyIntentAI(input);
        return ai.confidence > local.confidence ? ai : local;
      } catch (error) {
        console.warn('AI classification failed, using local:', error);
        return local;
      }
    }

    // 3. Return local result or unknown
    return local.confidence >= 0.5
      ? local
      : { intent: 'onbekend', confidence: 0, tier: 'local' };

  } catch (error) {
    // 4. Ultimate fallback
    return { intent: 'onbekend', confidence: 0, tier: 'local' };
  }
};
```

---

## 12. Implementatie Volgorde

### Sprint 1: Foundation (Week 1)
- [ ] Zustand store setup
- [ ] Command Center layout
- [ ] Basic text input
- [ ] Local intent classifier
- [ ] Fallback picker

### Sprint 2: Core Blocks (Week 2)
- [ ] DagnotatieBlock
- [ ] ZoekenBlock + `/api/patients/search`
- [ ] Patient pre-fill logic
- [ ] Voice input integratie

### Sprint 3: Advanced (Week 3)
- [ ] AI intent fallback
- [ ] OverdrachtBlock (AI summary)
- [ ] RapportageBlock
- [ ] Keyboard shortcuts

### Sprint 4: Polish (Week 4)
- [ ] Animaties & microinteracties
- [ ] Metrics dashboard
- [ ] Error handling refinement
- [ ] Demo scenario's

---

## 13. Navigatie & Onboarding Flow

### 13.1 User Journey Overzicht

De toegang tot Swift verloopt via een duidelijke keuze op de login pagina, na storytelling op de landingspagina.

```
┌─────────────────────────────────────────────────────────────────┐
│                         LANDINGSPAGINA                           │
│                         ─────────────                            │
│                                                                  │
│   • Storytelling (probleem → oplossing)                         │
│   • Interactive demo (probeer zonder login)                      │
│   • Side-by-side vergelijking (12 klikken vs 1 zin)             │
│   • Video demo                                                   │
│   • CTA: "Aan de slag" → gaat naar /login                       │
│                                                                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          LOGIN PAGINA                            │
│                          ───────────                             │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                          │   │
│   │   [Bestaand login formulier]                            │   │
│   │                                                          │   │
│   │   ─────────────────────────────────────────────────     │   │
│   │                                                          │   │
│   │   Kies je werkwijze:                                    │   │
│   │                                                          │   │
│   │   ○ ✨ Swift — Spreek of typ, het systeem begrijpt      │   │
│   │   ○ 📋 Klassiek — Vertrouwde menu's en formulieren      │   │
│   │                                                          │   │
│   │   ☐ Onthoud mijn keuze                                  │   │
│   │                                                          │   │
│   │                              [Inloggen]                  │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
        ┌───────────────┐           ┌───────────────┐
        │  /epd/swift   │           │ /epd/dashboard│
        │  Command      │           │ Klassiek EPD  │
        │  Center       │           │ met sidebar   │
        └───────────────┘           └───────────────┘
```

### 13.2 Route Structuur

| Route | Beschrijving | Layout |
|-------|--------------|--------|
| `/` | Landingspagina met storytelling | Marketing layout |
| `/login` | Login + interface keuze | Auth layout |
| `/epd/swift` | Swift Command Center | Swift layout (geen sidebar) |
| `/epd/dashboard` | Klassiek EPD dashboard | EPD layout (met sidebar) |
| `/epd/patients/...` | Klassiek patiënt routes | EPD layout (met sidebar) |

### 13.3 Interface Keuze Logica

```typescript
// lib/auth/interface-preference.ts

export type InterfacePreference = 'swift' | 'classic';

export interface UserPreferences {
  preferred_interface: InterfacePreference;
  remember_choice: boolean;
}

// Opslaan in Supabase user_metadata
export async function saveInterfacePreference(
  supabase: SupabaseClient,
  preference: InterfacePreference,
  remember: boolean
) {
  const { error } = await supabase.auth.updateUser({
    data: {
      preferred_interface: preference,
      remember_interface_choice: remember,
    },
  });

  if (error) throw error;
}

// Ophalen bij login
export async function getInterfacePreference(
  supabase: SupabaseClient
): Promise<InterfacePreference | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.user_metadata?.remember_interface_choice) {
    return null; // Toon keuze scherm
  }

  return user.user_metadata.preferred_interface || null;
}
```

### 13.4 Login Form Uitbreiding

```typescript
// app/login/components/login-form.tsx

interface LoginFormData {
  email: string;
  password: string;
  interface_choice: 'swift' | 'classic';
  remember_choice: boolean;
}

// Na succesvolle login
const handleLoginSuccess = async (data: LoginFormData) => {
  // Sla preference op
  await saveInterfacePreference(
    supabase,
    data.interface_choice,
    data.remember_choice
  );

  // Redirect naar gekozen interface
  if (data.interface_choice === 'swift') {
    router.push('/epd/swift');
  } else {
    router.push('/epd/dashboard');
  }
};
```

### 13.5 Redirect Middleware

```typescript
// middleware.ts

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check of user ingelogd is
  const supabase = createMiddlewareClient({ req: request });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session && pathname.startsWith('/epd')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Als user naar /epd gaat (zonder specifiek pad)
  if (session && pathname === '/epd') {
    const preference = session.user.user_metadata?.preferred_interface;

    if (preference === 'swift') {
      return NextResponse.redirect(new URL('/epd/swift', request.url));
    } else if (preference === 'classic') {
      return NextResponse.redirect(new URL('/epd/dashboard', request.url));
    }

    // Geen preference opgeslagen → naar dashboard (default)
    return NextResponse.redirect(new URL('/epd/dashboard', request.url));
  }

  return NextResponse.next();
}
```

### 13.6 Admin Interface Management

Alleen admins kunnen de interface preference van andere users aanpassen.

```typescript
// app/api/admin/users/[userId]/interface/route.ts

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const supabase = await createClient();

  // Check of huidige user admin is
  const { data: currentUser } = await supabase.auth.getUser();
  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('role')
    .eq('user_id', currentUser?.user?.id)
    .single();

  if (practitioner?.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 });
  }

  // Update target user's preference
  const body = await request.json();
  const { interface_preference } = body;

  // Admin API call om user metadata te updaten
  // (vereist service_role key)
  await supabaseAdmin.auth.admin.updateUserById(params.userId, {
    user_metadata: { preferred_interface: interface_preference },
  });

  return NextResponse.json({ success: true });
}
```

### 13.7 Geen Toggle in Interface

Belangrijk: Er is **geen toggle** om te wisselen tussen Swift en Klassiek binnen de interfaces zelf. Dit voorkomt verwarring en zorgt voor een consistente ervaring.

| Waar | Toggle aanwezig? |
|------|------------------|
| Landingspagina | N.v.t. (storytelling) |
| Login pagina | Ja (eenmalige keuze) |
| Swift interface | Nee |
| Klassiek EPD | Nee |
| Admin panel | Ja (per user instelling) |

Om van interface te wisselen moet de gebruiker:
1. Uitloggen
2. Opnieuw inloggen
3. Andere keuze maken (als "onthoud" uit stond)

Of een admin kan de preference aanpassen.

---

## 14. Bijlagen & Referenties

### Projectdocumenten
- [swift-prd.md](./swift-prd.md) - Product Requirements
- [swift-fo-ai.md](./swift-fo-ai.md) - Functioneel Ontwerp
- [swift-ux-v2.1.md](./swift-ux-v2.1.md) - UX/UI Specificaties
- [taken-en-vragen-analyse.md](./taken-en-vragen-analyse.md) - Intent Mapping

### Tech Documentatie
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Zustand: https://zustand-demo.pmnd.rs/
- cmdk: https://cmdk.paco.me/
- Deepgram: https://developers.deepgram.com/docs
- Claude API: https://docs.anthropic.com/

### Bestaande Codebase Referenties
- Command component: `components/ui/command.tsx`
- Speech streaming: `components/speech-recorder-streaming.tsx`
- Overdracht API: `app/api/overdracht/generate/route.ts`
- Report types: `lib/types/report.ts`
