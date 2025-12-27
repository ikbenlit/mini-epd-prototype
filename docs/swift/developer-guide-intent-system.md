# Developer Guide: Swift Intent System

**Document:** Developer Guide - Intent Classification & Extension
**Versie:** 1.0
**Datum:** 27-12-2024
**Auteur:** Colin Lit
**Audience:** Developers die Swift intents willen begrijpen of uitbreiden

---

## 📚 Inhoudsopgave

1. [Overzicht](#1-overzicht)
2. [Architectuur](#2-architectuur)
3. [Hoe het werkt](#3-hoe-het-werkt)
4. [Bestaande Intents](#4-bestaande-intents)
5. [Een nieuw intent toevoegen](#5-een-nieuw-intent-toevoegen)
6. [Best Practices](#6-best-practices)
7. [Troubleshooting](#7-troubleshooting)
8. [Testing](#8-testing)
9. [Referenties](#9-referenties)

---

## 1. Overzicht

### Wat is het Intent System?

Het Swift Intent System is een **two-tier classificatie systeem** dat natuurlijke taal input van gebruikers analyseert en vertaalt naar concrete acties binnen de applicatie.

**Doel:**
- Gebruikers kunnen in natuurlijke taal (Nederlands) communiceren met Swift
- Systeem herkent de intentie achter de input
- Opent het juiste artifact (UI component) met de juiste pre-filled data

**Voorbeeld:**

```
User input: "notitie jan medicatie"
           ↓
Intent classification: 'dagnotitie'
           ↓
Entities extracted: { patient: "jan", category: "medicatie" }
           ↓
Action: Open DagnotatieBlock met pre-filled patient + category
```

### Waarom Two-Tier?

| Tier | Methode | Snelheid | Accuracy | Use Case |
|------|---------|----------|----------|----------|
| **Tier 1** | Local regex patterns | <50ms | Hoog voor directe matches | "notitie jan", "afspraken vandaag" |
| **Tier 2** | AI (Claude Haiku) | ~400ms | Hoog voor complexe/ambigue input | "ik wil iets plannen voor volgende week" |

**Voordelen:**
- ✅ **Snelheid:** 90%+ van queries worden lokaal afgehandeld (<50ms)
- ✅ **Kosten:** Alleen AI call bij onduidelijke input
- ✅ **Betrouwbaarheid:** Fallback naar AI als local match faalt
- ✅ **Flexibiliteit:** Makkelijk om nieuwe patterns toe te voegen

---

## 2. Architectuur

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INPUT                              │
│  "maak afspraak met jan morgen 14:00"                       │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│              TIER 1: Local Pattern Classifier                │
│              (lib/swift/intent-classifier.ts)                │
│                                                              │
│  • Regex-based pattern matching                             │
│  • Client-side execution                                    │
│  • Returns: { intent, confidence, processingTimeMs }        │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
                 ┌─────────────┐
                 │ Confidence  │
                 │   >= 0.8?   │
                 └──┬──────┬───┘
                    │ YES  │ NO
                    ↓      ↓
        ┌───────────┘      └──────────────────────────────────┐
        │                                                      │
        ↓                                                      ↓
┌──────────────┐                        ┌─────────────────────────────────┐
│ Use Local    │                        │ TIER 2: AI Fallback Classifier  │
│ Result       │                        │ (lib/swift/intent-classifier-ai │
└──────┬───────┘                        │         .ts)                    │
       │                                │                                 │
       │                                │ • Claude Haiku API call         │
       │                                │ • Server-side only              │
       │                                │ • Advanced entity extraction    │
       │                                └─────────────┬───────────────────┘
       │                                              │
       └──────────────────┬───────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│                  INTENT ROUTER                               │
│               (swift-store.ts / Chat API)                    │
│                                                              │
│  • Maps intent → artifact type                              │
│  • Applies confidence thresholds                            │
│  • Triggers verduidelijkingsvragen bij lage confidence      │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────────────────┐
│                  ARTIFACT MANAGER                            │
│                                                              │
│  • Opens appropriate artifact (DagnotatieBlock, etc.)       │
│  • Pre-fills extracted entities                             │
│  • Manages artifact lifecycle                               │
└──────────────────────────────────────────────────────────────┘
```

### Core Files

| File | Locatie | Rol | Execution |
|------|---------|-----|-----------|
| **intent-classifier.ts** | `/lib/swift/` | Local pattern matching | Client-side |
| **intent-classifier-ai.ts** | `/lib/swift/` | AI fallback classifier | Server-side |
| **types.ts** | `/lib/swift/` | Type definitions | Both |
| **swift-store.ts** | `/stores/` | State management + routing | Client-side |
| **chat/route.ts** | `/app/api/swift/` | Chat API met streaming | Server-side |

---

## 3. Hoe het werkt

### Step-by-Step Flow

#### Step 1: User Input

```typescript
// User types in chat input
const userInput = "notitie jan medicatie";
```

#### Step 2: Local Classification (Tier 1)

```typescript
// lib/swift/intent-classifier.ts
import { classifyIntent } from '@/lib/swift/intent-classifier';

const result = classifyIntent(userInput);
// Returns:
{
  intent: 'dagnotitie',
  confidence: 0.9,
  matchedPattern: '/^notitie\\s+\\w+/',
  processingTimeMs: 12
}
```

**How it works:**

```typescript
const INTENT_PATTERNS = {
  dagnotitie: [
    { pattern: /^notitie\s+\w+/i, weight: 0.95 },
    { pattern: /^dagnotitie\b/i, weight: 1.0 },
    // ... meer patterns
  ],
  zoeken: [
    { pattern: /^zoek\b/i, weight: 1.0 },
    { pattern: /^wie\s+is\b/i, weight: 1.0 },
    // ...
  ],
  // ...
};

// Test all patterns, return highest weight match
for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
  for (const { pattern, weight } of patterns) {
    if (pattern.test(userInput)) {
      // Found a match!
      return { intent, confidence: weight };
    }
  }
}
```

#### Step 3: Confidence Check

```typescript
import { isHighConfidence, shouldUseAIFallback } from '@/lib/swift/intent-classifier';

if (isHighConfidence(result)) {
  // confidence >= 0.8
  // → Use local result, skip AI
  return result;
}

if (shouldUseAIFallback(result.confidence)) {
  // confidence < 0.8
  // → Trigger AI classification
  const aiResult = await classifyIntentWithAI(userInput);
  return aiResult;
}
```

#### Step 4a: AI Fallback (Tier 2) - If Needed

```typescript
// lib/swift/intent-classifier-ai.ts (SERVER-SIDE ONLY)
import { classifyIntentWithAI } from '@/lib/swift/intent-classifier-ai';

const aiResult = await classifyIntentWithAI("ik wil een gesprek plannen");
// Returns:
{
  intent: 'create_appointment',
  confidence: 0.75,
  entities: {
    patientName: undefined,  // Missing!
    content: "een gesprek plannen"
  },
  source: 'ai',
  processingTimeMs: 380,
  reasoning: "Gebruiker wil afspraak maken, maar patient ontbreekt"
}
```

**How it works:**

1. Sends user input to Claude Haiku API
2. Uses structured system prompt with intent definitions
3. Expects JSON response with intent + entities + confidence
4. Validates response with Zod schema

```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 256,
    temperature: 0,
    system: INTENT_CLASSIFIER_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Classificeer: "${input}"` }],
  }),
});

const parsed = JSON.parse(response);
const validated = AIIntentResponseSchema.parse(parsed);
```

#### Step 5: Intent Routing

```typescript
// In swift-store.ts or chat API
function handleIntent(intent: SwiftIntent, entities: ExtractedEntities, confidence: number) {

  // Confidence too low → ask clarification
  if (confidence < 0.7) {
    return {
      type: 'clarification_needed',
      question: generateClarificationQuestion(intent, entities)
    };
  }

  // Route to appropriate artifact
  switch (intent) {
    case 'dagnotitie':
      return openArtifact({
        type: 'DagnotatieBlock',
        mode: 'create',
        prefill: {
          patient: entities.patientName,
          category: entities.category,
          content: entities.content
        }
      });

    case 'zoeken':
      return openArtifact({
        type: 'ZoekenBlock',
        prefill: { query: entities.patientName }
      });

    case 'agenda_query':
      return openArtifact({
        type: 'AgendaBlock',
        mode: 'list',
        prefill: { dateRange: entities.dateRange }
      });

    // ... etc
  }
}
```

#### Step 6: Artifact Opens

```typescript
// Artifact Manager opens the correct component
<AgendaBlock
  mode="list"
  dateRange={{ start: today, end: today, label: 'vandaag' }}
/>
```

---

## 4. Bestaande Intents

### Intent Overzicht

| Intent | Beschrijving | Artifacts | Entities |
|--------|--------------|-----------|----------|
| **dagnotitie** | Notitie maken voor patiënt | DagnotatieBlock | patientName, category, content |
| **zoeken** | Patiënt zoeken | ZoekenBlock, PatientContextCard | patientName |
| **overdracht** | Dienst overdracht genereren | OverdrachtBlock | — |
| **agenda_query** | Afspraken opvragen | AgendaBlock (list) | dateRange |
| **create_appointment** | Nieuwe afspraak maken | AgendaBlock (create) | patient, datetime, type, location |
| **cancel_appointment** | Afspraak annuleren | AgendaBlock (cancel) | identifier |
| **reschedule_appointment** | Afspraak verzetten | AgendaBlock (reschedule) | identifier, newDatetime |
| **unknown** | Niet herkend | Fallback picker | — |

### Pattern Examples

**Dagnotitie:**
```typescript
dagnotitie: [
  { pattern: /^dagnotitie\b/i, weight: 1.0 },
  { pattern: /^notitie\b/i, weight: 1.0 },
  { pattern: /^notitie\s+\w+/i, weight: 0.95 },              // "notitie jan"
  { pattern: /^\w+\s+(medicatie|adl|gedrag|incident)/i, weight: 0.9 }, // "jan medicatie"
]
```

**Zoeken:**
```typescript
zoeken: [
  { pattern: /^zoek\b/i, weight: 1.0 },
  { pattern: /^wie\s+is\b/i, weight: 1.0 },                  // "wie is jan"
  { pattern: /^vind\s+\w+/i, weight: 1.0 },                  // "vind marie"
  { pattern: /^[A-Z][a-z]+$/i, weight: 0.5 },               // Single capitalized word
]
```

**Agenda Query:**
```typescript
agenda_query: [
  { pattern: /^afspraken?\b/i, weight: 1.0 },                // "afspraken"
  { pattern: /^agenda\b/i, weight: 1.0 },                    // "agenda"
  { pattern: /^wat\s+zijn\s+(mijn\s+)?afspraken/i, weight: 1.0 },
  { pattern: /^volgende\s+afspraak/i, weight: 0.95 },
]
```

---

## 5. Een nieuw intent toevoegen

### Voorbeeld: "metingen" intent

Stel je wilt een nieuw intent toevoegen voor het invoeren van vitale metingen (bloeddruk, temperatuur, etc.).

**Gewenste flow:**
```
User: "bloeddruk jan 120/80"
→ Intent: 'metingen'
→ Entities: { patient: "jan", type: "bloeddruk", value: "120/80" }
→ Opens: MetingenBlock met pre-filled data
```

### Step 1: Update Types

**File:** `lib/swift/types.ts`

```typescript
// Add new intent to enum
export type SwiftIntent =
  | 'dagnotitie'
  | 'zoeken'
  | 'overdracht'
  | 'agenda_query'
  | 'create_appointment'
  | 'cancel_appointment'
  | 'reschedule_appointment'
  | 'metingen'           // ← NEW
  | 'unknown';

// Extend ExtractedEntities
export interface ExtractedEntities {
  // Existing fields
  patientName?: string;
  category?: VerpleegkundigCategory;
  content?: string;
  // ... other existing fields

  // NEW: Metingen-specific entities
  metingType?: 'bloeddruk' | 'temperatuur' | 'pols' | 'saturatie' | 'gewicht';
  metingValue?: string;
  metingUnit?: string;
  metingTimestamp?: Date;
}
```

### Step 2: Add Local Patterns

**File:** `lib/swift/intent-classifier.ts`

```typescript
const INTENT_PATTERNS: Record<Exclude<SwiftIntent, 'unknown'>, PatternConfig[]> = {
  // ... existing patterns

  // NEW: Metingen patterns
  metingen: [
    // Exact commands
    { pattern: /^meting\b/i, weight: 1.0 },
    { pattern: /^metingen\b/i, weight: 1.0 },
    { pattern: /^vitale\s+functies\b/i, weight: 1.0 },

    // Type-specific patterns
    { pattern: /^bloeddruk\b/i, weight: 1.0 },
    { pattern: /^temperatuur\b/i, weight: 1.0 },
    { pattern: /^pols\b/i, weight: 0.95 },
    { pattern: /^saturatie\b/i, weight: 0.95 },
    { pattern: /^gewicht\b/i, weight: 0.95 },

    // Pattern: "bloeddruk [naam]" or "[naam] bloeddruk"
    { pattern: /^bloeddruk\s+\w+/i, weight: 0.95 },
    { pattern: /^\w+\s+bloeddruk/i, weight: 0.9 },

    // Pattern: "bloeddruk [naam] [waarde]"
    { pattern: /^bloeddruk\s+\w+\s+\d+/i, weight: 0.98 },

    // Pattern with value patterns
    { pattern: /\d{2,3}\/\d{2,3}/i, weight: 0.7 },  // "120/80" format
    { pattern: /\d+\s*graden?/i, weight: 0.7 },     // "38 graden"
  ],
};
```

**Pattern Weight Guidelines:**
- **1.0** = Exact, unambiguous match ("meting", "bloeddruk")
- **0.9-0.95** = Strong match with context ("bloeddruk jan")
- **0.8-0.89** = Good match, minor ambiguity
- **0.7-0.79** = Partial match, needs additional context
- **<0.7** = Weak match, likely needs AI fallback

### Step 3: Update AI System Prompt

**File:** `lib/swift/intent-classifier-ai.ts`

```typescript
const INTENT_CLASSIFIER_SYSTEM_PROMPT = `Je bent een intent classifier voor Swift EPD.

Classificeer de intentie in één van deze categorieën:

**Bestaande intents:**
1. dagnotitie - Notitie maken
2. zoeken - Patiënt zoeken
3. overdracht - Dienst overdracht
4-7. [agenda intents...]

**Nieuwe intent:**
8. **metingen** - Vitale functies invoeren
   Voorbeelden: "bloeddruk jan 120/80", "temperatuur marie 38 graden", "pols invoeren"
   Extraheer: patientName, metingType, metingValue, metingUnit

   Types: bloeddruk, temperatuur, pols, saturatie, gewicht

   Value patterns:
   - Bloeddruk: "120/80" (systolisch/diastolisch)
   - Temperatuur: "38" of "38 graden" of "38.5"
   - Pols: "72" of "72 bpm"
   - Saturatie: "98" of "98%"
   - Gewicht: "75" of "75 kg"

9. unknown - Onduidelijk

**Response format:**
{
  "intent": "...",
  "confidence": 0.0-1.0,
  "entities": {
    "patientName": "jan",
    "metingType": "bloeddruk",
    "metingValue": "120/80",
    "metingUnit": "mmHg"  // optioneel
  }
}
`;
```

**Update Zod Schema:**

```typescript
const AIIntentResponseSchema = z.object({
  intent: z.enum([
    'dagnotitie',
    'zoeken',
    'overdracht',
    'agenda_query',
    'create_appointment',
    'cancel_appointment',
    'reschedule_appointment',
    'metingen',          // ← ADD
    'unknown'
  ]),
  confidence: z.number().min(0).max(1),
  entities: z.object({
    patientName: z.string().optional(),
    category: z.enum(['medicatie', 'adl', 'gedrag', 'incident', 'observatie']).optional(),
    content: z.string().optional(),
    // ... existing fields

    // NEW
    metingType: z.enum(['bloeddruk', 'temperatuur', 'pols', 'saturatie', 'gewicht']).optional(),
    metingValue: z.string().optional(),
    metingUnit: z.string().optional(),
  }).optional(),
  reasoning: z.string().optional(),
});
```

### Step 4: Add Intent Routing

**File:** `stores/swift-store.ts` or chat API route

```typescript
function openArtifactForIntent(
  intent: SwiftIntent,
  entities: ExtractedEntities,
  confidence: number
): ArtifactConfig | null {

  // Confidence check
  if (confidence < 0.7) {
    return null; // Trigger clarification
  }

  switch (intent) {
    // ... existing cases

    // NEW
    case 'metingen':
      // Validate required entities
      if (!entities.patientName || !entities.metingType) {
        return null; // Need more info
      }

      return {
        type: 'MetingenBlock',
        mode: 'create',
        prefill: {
          patient: entities.patientName,
          type: entities.metingType,
          value: entities.metingValue,
          unit: entities.metingUnit,
          timestamp: entities.metingTimestamp || new Date()
        }
      };

    default:
      return null;
  }
}
```

### Step 5: Create the Artifact Component

**File:** `components/swift/artifacts/blocks/metingen-block.tsx`

```typescript
interface MetingenBlockProps {
  mode: 'create' | 'view';
  prefill?: {
    patient?: { id: string; name: string };
    type?: MetingType;
    value?: string;
    unit?: string;
    timestamp?: Date;
  };
  onClose?: () => void;
}

export function MetingenBlock({ mode, prefill, onClose }: MetingenBlockProps) {
  const [formData, setFormData] = useState({
    patientId: prefill?.patient?.id || '',
    type: prefill?.type || 'bloeddruk',
    value: prefill?.value || '',
    unit: prefill?.unit || getDefaultUnit(prefill?.type),
    timestamp: prefill?.timestamp || new Date(),
  });

  const handleSubmit = async () => {
    // Call server action to save measurement
    await createMeasurement(formData);
    // Show success toast
    toast.success('Meting opgeslagen!');
    onClose?.();
  };

  return (
    <div className="metingen-block">
      <header>
        <h3>📊 Vitale Functies</h3>
        <button onClick={onClose}>×</button>
      </header>

      <form>
        {/* Patient selector */}
        <PatientSelect
          value={formData.patientId}
          onChange={(id) => setFormData({ ...formData, patientId: id })}
          defaultName={prefill?.patient?.name}
        />

        {/* Type selector */}
        <Select
          label="Type meting"
          value={formData.type}
          onChange={(type) => setFormData({ ...formData, type })}
        >
          <option value="bloeddruk">Bloeddruk</option>
          <option value="temperatuur">Temperatuur</option>
          <option value="pols">Pols</option>
          <option value="saturatie">Saturatie</option>
          <option value="gewicht">Gewicht</option>
        </Select>

        {/* Value input */}
        <Input
          label="Waarde"
          type="text"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          placeholder={getPlaceholder(formData.type)}
        />

        {/* Unit (auto-filled based on type) */}
        <Input
          label="Eenheid"
          value={formData.unit}
          readOnly
        />

        {/* Timestamp */}
        <DateTimePicker
          label="Tijdstip"
          value={formData.timestamp}
          onChange={(timestamp) => setFormData({ ...formData, timestamp })}
        />

        <footer>
          <Button variant="secondary" onClick={onClose}>
            Annuleren
          </Button>
          <Button onClick={handleSubmit}>
            💾 Opslaan
          </Button>
        </footer>
      </form>
    </div>
  );
}

function getDefaultUnit(type?: MetingType): string {
  switch (type) {
    case 'bloeddruk': return 'mmHg';
    case 'temperatuur': return '°C';
    case 'pols': return 'bpm';
    case 'saturatie': return '%';
    case 'gewicht': return 'kg';
    default: return '';
  }
}
```

### Step 6: Register Artifact Type

**File:** `stores/swift-store.ts` or artifact registry

```typescript
export type ArtifactType =
  | 'DagnotatieBlock'
  | 'ZoekenBlock'
  | 'PatientContextCard'
  | 'OverdrachtBlock'
  | 'AgendaBlock'
  | 'MetingenBlock'     // ← ADD
  ;

// Add to artifact component mapping
const ARTIFACT_COMPONENTS = {
  DagnotatieBlock: lazy(() => import('@/components/swift/artifacts/blocks/dagnotitie-block')),
  ZoekenBlock: lazy(() => import('@/components/swift/artifacts/blocks/zoeken-block')),
  // ... existing
  MetingenBlock: lazy(() => import('@/components/swift/artifacts/blocks/metingen-block')), // ← ADD
};
```

### Step 7: Test

**Manual Testing Checklist:**

```typescript
// Test cases for 'metingen' intent

// ✅ Local pattern matches (high confidence)
"bloeddruk jan 120/80"           → intent: metingen, conf: 0.98
"temperatuur marie"               → intent: metingen, conf: 1.0
"pols"                            → intent: metingen, conf: 0.95

// ✅ AI fallback (ambiguous)
"jan zijn bloeddruk invoeren"    → AI: intent: metingen, conf: 0.85
"ik wil vitale functies noteren" → AI: intent: metingen, conf: 0.75

// ✅ Edge cases
"bloeddruk"                       → Missing patient, show clarification
"jan"                             → Likely 'zoeken', not 'metingen'
"bloeddruk 120/80"                → Missing patient, show clarification

// ✅ Artifact opens correctly
"bloeddruk jan 120/80"            → MetingenBlock opens with prefill
                                    - patient: "jan"
                                    - type: "bloeddruk"
                                    - value: "120/80"
                                    - unit: "mmHg"

// ✅ Voice input works
[Voice] "bloeddruk jan honderdtwintig tachtig"
→ Transcript: "bloeddruk jan honderdtwintig tachtig"
→ AI parses: value: "120/80"
→ Opens MetingenBlock
```

**Unit Tests:**

```typescript
// __tests__/intent-classifier.test.ts
import { classifyIntent } from '@/lib/swift/intent-classifier';

describe('Intent Classifier - Metingen', () => {
  it('should classify "bloeddruk jan 120/80" as metingen', () => {
    const result = classifyIntent('bloeddruk jan 120/80');
    expect(result.intent).toBe('metingen');
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it('should classify "temperatuur" as metingen', () => {
    const result = classifyIntent('temperatuur');
    expect(result.intent).toBe('metingen');
    expect(result.confidence).toBe(1.0);
  });

  it('should have low confidence for "jan bloeddruk"', () => {
    const result = classifyIntent('jan bloeddruk');
    expect(result.intent).toBe('metingen');
    expect(result.confidence).toBeLessThan(0.95);
  });
});
```

---

## 6. Best Practices

### Pattern Design

**✅ DO:**

```typescript
// Clear, specific patterns first
{ pattern: /^bloeddruk\b/i, weight: 1.0 }
{ pattern: /^temperatuur\b/i, weight: 1.0 }

// Then patterns with context
{ pattern: /^bloeddruk\s+\w+/i, weight: 0.95 }  // "bloeddruk jan"

// Finally, partial matches
{ pattern: /\d{2,3}\/\d{2,3}/i, weight: 0.7 }   // "120/80" format
```

**❌ DON'T:**

```typescript
// Too broad - will match everything
{ pattern: /./i, weight: 1.0 }

// Too specific - will never match natural language
{ pattern: /^bloeddruk\s+jan\s+120\/80$/i, weight: 1.0 }

// Overlapping high-weight patterns (creates ambiguity)
{ pattern: /^notitie\b/i, weight: 1.0 }
{ pattern: /^notitie\s+/i, weight: 1.0 }  // Redundant!
```

### Confidence Weights

**Guidelines:**

| Weight Range | Use Case | Example |
|--------------|----------|---------|
| **1.0** | Exact keyword match, no ambiguity | `/^bloeddruk\b/i` |
| **0.9-0.95** | Strong match with minimal context | `/^bloeddruk\s+\w+/i` |
| **0.8-0.89** | Good match, some context needed | `/^\w+\s+bloeddruk/i` |
| **0.7-0.79** | Partial match, may need AI | `/\d{2,3}\/\d{2,3}/i` |
| **<0.7** | Weak match, definitely needs AI | — |

**Threshold decisions:**

```typescript
if (confidence >= 0.8) {
  // High confidence → Use local result
  return openArtifact(intent, entities);
}

if (confidence >= 0.7) {
  // Medium confidence → Open artifact + confirmation in chat
  openArtifact(intent, entities);
  return chatResponse("Klopt dit? [intent description]");
}

if (confidence >= 0.5) {
  // Low confidence → Ask clarification
  return chatResponse(generateClarificationQuestion(intent, entities));
}

// confidence < 0.5
// Very low → Show fallback picker or generic help
return showFallbackPicker();
```

### Entity Extraction

**Local extraction (basic):**

```typescript
// Extract from regex capture groups
const pattern = /^bloeddruk\s+(\w+)\s+(\d+\/\d+)/i;
const match = pattern.exec(input);

if (match) {
  return {
    intent: 'metingen',
    entities: {
      patientName: match[1],  // "jan"
      metingValue: match[2],   // "120/80"
    }
  };
}
```

**AI extraction (advanced):**

Let the AI handle complex parsing:
- Relative dates: "morgen", "volgende week dinsdag"
- Number words: "honderdtwintig tachtig" → "120/80"
- Implicit entities: "deze patiënt" (uses context)

### Performance Optimization

**✅ DO:**

```typescript
// Pre-compile regex patterns (happens at module load)
const PATTERNS = {
  bloeddruk: /^bloeddruk\b/i,
  temperatuur: /^temperatuur\b/i,
};

// Early exit on perfect match
if (confidence === 1.0) break;

// Cache frequent queries (if applicable)
const cache = new Map<string, ClassificationResult>();
```

**❌ DON'T:**

```typescript
// Don't create regex in loop
for (const input of inputs) {
  const pattern = new RegExp(`^${keyword}\\b`, 'i'); // ❌ Slow!
}

// Don't make unnecessary AI calls
if (confidence >= 0.8) {
  const aiResult = await classifyWithAI(input); // ❌ Waste of time & money
}
```

### Error Handling

**Always validate:**

```typescript
// Validate AI response
try {
  const parsed = JSON.parse(aiResponse);
  const validated = AIIntentResponseSchema.parse(parsed);
  return validated;
} catch (error) {
  console.error('AI classification error:', error);
  // Fallback to unknown intent
  return {
    intent: 'unknown',
    confidence: 0,
    source: 'ai',
  };
}

// Validate entity presence before opening artifact
if (!entities.patientName) {
  // Ask clarification instead of opening empty artifact
  return askClarification("Met welke patiënt?");
}
```

---

## 7. Troubleshooting

### Common Issues

#### Issue 1: Intent not being recognized

**Symptoms:**
```
User: "bloeddruk jan"
Result: intent: 'unknown', confidence: 0
```

**Debugging:**

```typescript
// 1. Check if pattern exists
console.log(INTENT_PATTERNS.metingen);
// Should show array of patterns

// 2. Test pattern manually
const pattern = /^bloeddruk\b/i;
console.log(pattern.test("bloeddruk jan"));
// Should be true

// 3. Check pattern order (first match wins)
// If pattern is below a more generic pattern, it may never be tested

// 4. Check case sensitivity
const pattern = /^Bloeddruk\b/;  // ❌ Won't match "bloeddruk"
const pattern = /^bloeddruk\b/i; // ✅ Case insensitive
```

**Solution:**
```typescript
// Add or fix pattern
metingen: [
  { pattern: /^bloeddruk\b/i, weight: 1.0 },  // ← Ensure this exists
  // ...
]
```

#### Issue 2: Wrong intent detected

**Symptoms:**
```
User: "jan bloeddruk"
Result: intent: 'zoeken', confidence: 0.5  // ❌ Should be 'metingen'
```

**Cause:** Pattern for 'zoeken' matches first:

```typescript
zoeken: [
  { pattern: /^[A-Z][a-z]+$/i, weight: 0.5 },  // Matches "jan"
]
```

**Solution:** Add more specific patterns with higher weight:

```typescript
metingen: [
  { pattern: /^\w+\s+bloeddruk/i, weight: 0.9 },  // "jan bloeddruk" → metingen
]

// Or: Lower weight of generic patterns
zoeken: [
  { pattern: /^[A-Z][a-z]+$/i, weight: 0.3 },  // Lower weight
]
```

#### Issue 3: AI fallback not triggering

**Symptoms:**
```
User: "ik wil de bloeddruk invoeren"
Result: intent: 'unknown', confidence: 0  // AI should have helped
```

**Debugging:**

```typescript
// 1. Check confidence threshold
if (result.confidence < 0.8) {
  // Should trigger AI
  const aiResult = await classifyIntentWithAI(input);
}

// 2. Check API key
console.log(process.env.ANTHROPIC_API_KEY);  // Should be set

// 3. Check AI is only called server-side
// AI classifier should NEVER run in browser
```

**Solution:**
```typescript
// Ensure AI fallback is in server-side code only
// app/api/swift/chat/route.ts (✅ Server-side)
// components/client-component.tsx (❌ Client-side, won't work)
```

#### Issue 4: Entities not extracted

**Symptoms:**
```
User: "bloeddruk jan 120/80"
Result: intent: 'metingen', entities: {}  // ❌ Should extract patient + value
```

**Cause:** Local classifier only does basic regex matching. Complex entity extraction requires AI or custom parsing.

**Solutions:**

**Option A:** Add local entity extraction:

```typescript
// In intent-classifier.ts
const pattern = /^bloeddruk\s+(\w+)\s+(.+)/i;
const match = pattern.exec(input);

if (match) {
  return {
    intent: 'metingen',
    confidence: 0.95,
    entities: {
      patientName: match[1],    // "jan"
      metingValue: match[2],     // "120/80"
    }
  };
}
```

**Option B:** Let AI handle entity extraction:

```typescript
// Trigger AI when entities are crucial
if (result.intent === 'metingen' && !result.entities?.patientName) {
  // Local matched intent, but missing entities → Use AI for entity extraction
  const aiResult = await classifyIntentWithAI(input);
  return {
    intent: result.intent,
    confidence: result.confidence,
    entities: aiResult.entities,  // Use AI-extracted entities
  };
}
```

#### Issue 5: Slow performance

**Symptoms:**
- Local classification takes >100ms
- UI feels sluggish

**Debugging:**

```typescript
const result = classifyIntent(input);
console.log(`Classification took ${result.processingTimeMs}ms`);

// Target: <50ms
// Acceptable: <100ms
// Slow: >100ms
```

**Common causes:**

1. **Too many patterns** (>100 patterns total)
   - Solution: Consolidate similar patterns

2. **Complex regex** (catastrophic backtracking)
   ```typescript
   // ❌ BAD: Can cause exponential backtracking
   { pattern: /^(a+)+b/, weight: 1.0 }

   // ✅ GOOD: Simple, efficient patterns
   { pattern: /^a+b/, weight: 1.0 }
   ```

3. **Not breaking early on perfect match**
   ```typescript
   // ✅ Add early exit
   if (bestMatch?.confidence === 1.0) break;
   ```

---

## 8. Testing

### Unit Tests

**File:** `__tests__/intent-classifier.test.ts`

```typescript
import { classifyIntent } from '@/lib/swift/intent-classifier';

describe('Intent Classifier', () => {
  describe('Dagnotitie intent', () => {
    it('should recognize "notitie jan"', () => {
      const result = classifyIntent('notitie jan');
      expect(result.intent).toBe('dagnotitie');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('should recognize "jan medicatie"', () => {
      const result = classifyIntent('jan medicatie');
      expect(result.intent).toBe('dagnotitie');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('Zoeken intent', () => {
    it('should recognize "zoek jan"', () => {
      const result = classifyIntent('zoek jan');
      expect(result.intent).toBe('zoeken');
      expect(result.confidence).toBe(1.0);
    });

    it('should recognize "wie is jan"', () => {
      const result = classifyIntent('wie is jan');
      expect(result.intent).toBe('zoeken');
      expect(result.confidence).toBe(1.0);
    });
  });

  describe('Performance', () => {
    it('should classify in less than 50ms', () => {
      const result = classifyIntent('notitie jan medicatie');
      expect(result.processingTimeMs).toBeLessThan(50);
    });
  });

  describe('Confidence thresholds', () => {
    it('should return high confidence for exact matches', () => {
      const result = classifyIntent('dagnotitie');
      expect(result.confidence).toBe(1.0);
    });

    it('should return lower confidence for partial matches', () => {
      const result = classifyIntent('jan');
      expect(result.confidence).toBeLessThan(0.8);
    });
  });
});
```

### Integration Tests

**File:** `__tests__/intent-flow.test.ts`

```typescript
import { classifyIntent } from '@/lib/swift/intent-classifier';
import { classifyIntentWithAI } from '@/lib/swift/intent-classifier-ai';
import { openArtifactForIntent } from '@/stores/swift-store';

describe('Intent Flow Integration', () => {
  it('should open DagnotatieBlock for "notitie jan medicatie"', async () => {
    // Step 1: Classify
    const result = classifyIntent('notitie jan medicatie');
    expect(result.intent).toBe('dagnotitie');

    // Step 2: Route to artifact
    const artifact = openArtifactForIntent(
      result.intent,
      { patientName: 'jan', category: 'medicatie' },
      result.confidence
    );

    expect(artifact).toEqual({
      type: 'DagnotatieBlock',
      mode: 'create',
      prefill: {
        patient: 'jan',
        category: 'medicatie',
      }
    });
  });

  it('should trigger AI fallback for ambiguous input', async () => {
    // Step 1: Local classification (low confidence)
    const localResult = classifyIntent('ik wil iets noteren');
    expect(localResult.confidence).toBeLessThan(0.8);

    // Step 2: AI fallback
    const aiResult = await classifyIntentWithAI('ik wil iets noteren');
    expect(aiResult.intent).toBe('dagnotitie');
    expect(aiResult.confidence).toBeGreaterThan(0.5);
  });
});
```

### Manual Test Scenarios

**Checklist:** `docs/swift/manual-test-intents.md`

```markdown
# Manual Test Scenarios - Intent System

## Dagnotitie
- [ ] "notitie jan" → Opens DagnotatieBlock with patient "jan"
- [ ] "jan medicatie" → Opens DagnotatieBlock with patient + category
- [ ] "dagnotitie" → Opens DagnotatieBlock empty
- [ ] "schrijf observatie voor marie" → AI fallback, extracts patient + category

## Zoeken
- [ ] "zoek jan" → Opens ZoekenBlock with query "jan"
- [ ] "wie is marie" → Opens ZoekenBlock
- [ ] "Jan" (single word) → Low confidence, shows options

## Agenda
- [ ] "afspraken vandaag" → Opens AgendaBlock (list, today)
- [ ] "maak afspraak jan morgen 14:00" → Opens AgendaBlock (create, prefilled)
- [ ] "annuleer jan" → Opens AgendaBlock (cancel, shows matches)

## Voice Input
- [ ] [Voice] "notitie jan medicatie" → Transcribes correctly, opens artifact
- [ ] [Voice] "bloeddruk jan honderdtwintig tachtig" → AI parses numbers

## Edge Cases
- [ ] Empty input → intent: unknown
- [ ] Gibberish → intent: unknown, triggers fallback picker
- [ ] Mixed language → AI tries to parse, may ask clarification
```

---

## 9. Referenties

### Code Locations

| Component | File Path |
|-----------|-----------|
| **Local Classifier** | `/lib/swift/intent-classifier.ts` |
| **AI Classifier** | `/lib/swift/intent-classifier-ai.ts` |
| **Type Definitions** | `/lib/swift/types.ts` |
| **State Management** | `/stores/swift-store.ts` |
| **Chat API** | `/app/api/swift/chat/route.ts` |
| **Artifacts** | `/components/swift/artifacts/blocks/` |

### External Resources

- **Regex Testing:** [regex101.com](https://regex101.com/)
- **Claude API Docs:** [docs.anthropic.com](https://docs.anthropic.com)
- **Zod Validation:** [zod.dev](https://zod.dev/)
- **TypeScript Handbook:** [typescriptlang.org](https://www.typescriptlang.org/docs/)

### Related Documentation

- **Swift FO v3.0:** `docs/swift/fo-swift-medical-scribe-v3.md`
- **Agenda FO:** `docs/swift/fo-swift-agenda-planning.md`
- **Bouwplan:** `docs/swift/bouwplan-swift-standalone-module.md`
- **Architecture Decision Records:** `docs/architecture/`

---

## 📋 Quick Reference Card

### Adding a New Intent - Checklist

- [ ] **Step 1:** Add intent to `SwiftIntent` type (`lib/swift/types.ts`)
- [ ] **Step 2:** Extend `ExtractedEntities` with new fields
- [ ] **Step 3:** Add patterns to `INTENT_PATTERNS` (`intent-classifier.ts`)
- [ ] **Step 4:** Update AI system prompt (`intent-classifier-ai.ts`)
- [ ] **Step 5:** Update Zod schema for AI response
- [ ] **Step 6:** Add routing logic (`swift-store.ts`)
- [ ] **Step 7:** Create artifact component (`components/swift/artifacts/blocks/`)
- [ ] **Step 8:** Register artifact type in component mapping
- [ ] **Step 9:** Write unit tests
- [ ] **Step 10:** Manual testing
- [ ] **Step 11:** Update documentation

### Pattern Weight Quick Guide

```typescript
1.0    // "bloeddruk" - exact match
0.95   // "bloeddruk jan" - strong match with context
0.9    // "jan bloeddruk" - good match, reversed order
0.8    // partial match with good context
0.7    // partial match, may need AI
<0.7   // weak match, likely needs AI fallback
```

### Common Regex Patterns

```typescript
// Keywords
/^bloeddruk\b/i               // Starts with "bloeddruk"
/\bbloeddruk\b/i              // Contains "bloeddruk" (word boundary)

// With patient name
/^bloeddruk\s+(\w+)/i         // "bloeddruk jan" - captures "jan"
/^(\w+)\s+bloeddruk/i         // "jan bloeddruk" - captures "jan"

// With values
/\d{2,3}\/\d{2,3}/            // "120/80" - blood pressure format
/\d+\s*graden?/i              // "38 graden" - temperature
/\d+\s*%/                     // "98%" - percentage

// Case insensitive
/pattern/i                    // 'i' flag = case insensitive

// Word boundary
/\bword\b/                    // Only matches whole word "word"
```

---

**Document Version:** 1.0
**Last Updated:** 27-12-2024
**Maintainer:** Swift Development Team

**Questions?** Check the troubleshooting section or reach out to the team.
