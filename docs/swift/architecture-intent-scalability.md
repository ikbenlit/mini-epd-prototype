# Architecture: Intent System Schaalbaarheid

**Document:** Intent System Scalability & Optimization
**Versie:** 1.0
**Datum:** 27-12-2024
**Auteur:** Colin Lit

---

## 📊 Probleem Analyse

### Huidige Situatie

**Aantal intents:** 7 (dagnotitie, zoeken, overdracht, + 4 agenda intents)
**Patterns per intent:** ~5-10
**Totaal patterns:** ~60

**Performance nu:**
- Classification time: ~10-15ms
- O(n) linear search door alle patterns
- Acceptable voor huidige schaal

### Toekomstige Schaal (geschat)

Bij volledige EPD uitbreiding:

| Module | Nieuwe Intents | Patterns per Intent | Totaal |
|--------|----------------|---------------------|--------|
| **Medicatie** | 5 (voorschrijven, toedienen, stop, bijwerking, controle) | 8 | 40 |
| **Diagnostiek** | 4 (lab aanvragen, uitslagen, röntgen, echo) | 6 | 24 |
| **Behandelplan** | 4 (maken, wijzigen, evalueren, afsluiten) | 7 | 28 |
| **Verpleegkundige acties** | 6 (wondverzorging, katheter, infuus, etc.) | 5 | 30 |
| **Communicatie** | 3 (brief, consult aanvraag, telefoonnota) | 6 | 18 |
| **Rapportages** | 5 (MDO, intake, evaluatie, ontslagbrief) | 7 | 35 |
| **Huidig** | 7 | ~8 | 60 |
| **TOTAAL** | **34 intents** | **~7 avg** | **~235 patterns** |

**Geschatte performance bij 235 patterns:**
- Classification time: ~40-60ms (4x slower)
- Meer pattern conflicts (overlap)
- Moeilijker te maintainen

---

## 🎯 Optimalisatie Strategieën

## Strategie 1: Categoriegebaseerde Hierarchie ⭐ **AANBEVOLEN**

### Concept

Groepeer intents in categorieën en gebruik **two-phase classification**:
1. **Phase 1:** Detect categorie (snel, 5-10 opties)
2. **Phase 2:** Detect intent binnen categorie (kleiner search space)

### Categorie Structuur

```typescript
enum IntentCategory {
  DOCUMENTATION = 'documentation',    // Notities, rapportages
  PATIENT_CARE = 'patient_care',     // Medicatie, metingen, acties
  SCHEDULING = 'scheduling',          // Agenda, planning
  COMMUNICATION = 'communication',    // Brieven, consults
  DIAGNOSTIC = 'diagnostic',          // Lab, beeldvorming
  ADMINISTRATIVE = 'administrative',  // Overdracht, MDO
  SEARCH = 'search',                  // Zoeken, info opvragen
}

type SwiftIntent =
  // DOCUMENTATION
  | 'dagnotitie'
  | 'rapportage_intake'
  | 'rapportage_evaluatie'
  | 'rapportage_ontslag'
  | 'vrije_notitie'

  // PATIENT_CARE
  | 'medicatie_toedienen'
  | 'medicatie_voorschrijven'
  | 'medicatie_stop'
  | 'meting_vitaal'
  | 'wondverzorging'
  | 'katheter_verzorging'

  // SCHEDULING
  | 'agenda_query'
  | 'create_appointment'
  | 'cancel_appointment'
  | 'reschedule_appointment'

  // DIAGNOSTIC
  | 'lab_aanvraag'
  | 'lab_uitslag'
  | 'rontgen_aanvraag'
  | 'echo_aanvraag'

  // COMMUNICATION
  | 'brief_huisarts'
  | 'consult_aanvraag'
  | 'telefoonnota'

  // ADMINISTRATIVE
  | 'overdracht'
  | 'mdo_verslag'

  // SEARCH
  | 'zoeken'
  | 'patient_info'
  | 'medicatie_info'

  | 'unknown';
```

### Implementation

```typescript
// lib/swift/intent-classifier-hierarchical.ts

interface CategoryPattern {
  pattern: RegExp;
  category: IntentCategory;
  weight: number;
}

// Step 1: Category patterns (small set, ~20 patterns)
const CATEGORY_PATTERNS: CategoryPattern[] = [
  // DOCUMENTATION keywords
  { pattern: /\b(notitie|rapportage|verslag|schrijf|document)\b/i,
    category: IntentCategory.DOCUMENTATION, weight: 0.9 },

  // PATIENT_CARE keywords
  { pattern: /\b(medicatie|toedien|voorschrijf|bloeddruk|temperatuur|pols|wond|katheter|infuus)\b/i,
    category: IntentCategory.PATIENT_CARE, weight: 0.9 },

  // SCHEDULING keywords
  { pattern: /\b(afspraak|agenda|planning|verzet|annuleer|plan)\b/i,
    category: IntentCategory.SCHEDULING, weight: 0.95 },

  // DIAGNOSTIC keywords
  { pattern: /\b(lab|bloed|urine|röntgen|echo|scan|onderzoek)\b/i,
    category: IntentCategory.DIAGNOSTIC, weight: 0.9 },

  // COMMUNICATION keywords
  { pattern: /\b(brief|consult|telefoon|contact|specialist)\b/i,
    category: IntentCategory.COMMUNICATION, weight: 0.85 },

  // ADMINISTRATIVE keywords
  { pattern: /\b(overdracht|mdo|bespreking|overleg)\b/i,
    category: IntentCategory.ADMINISTRATIVE, weight: 0.9 },

  // SEARCH keywords (should be last, lowest priority)
  { pattern: /\b(zoek|vind|wie|waar|wanneer|info|gegevens)\b/i,
    category: IntentCategory.SEARCH, weight: 0.7 },
];

// Step 2: Intent patterns per category (smaller sets)
const INTENT_PATTERNS_BY_CATEGORY: Record<IntentCategory, Record<string, PatternConfig[]>> = {
  [IntentCategory.DOCUMENTATION]: {
    dagnotitie: [
      { pattern: /^dagnotitie\b/i, weight: 1.0 },
      { pattern: /^notitie\b/i, weight: 1.0 },
      { pattern: /^\w+\s+(medicatie|adl|gedrag)/i, weight: 0.9 },
    ],
    rapportage_intake: [
      { pattern: /^intake\b/i, weight: 1.0 },
      { pattern: /\bintake\s+(verslag|rapportage)\b/i, weight: 1.0 },
    ],
    vrije_notitie: [
      { pattern: /^vrije\s+notitie\b/i, weight: 1.0 },
      { pattern: /^schrijf\b/i, weight: 0.8 },
    ],
  },

  [IntentCategory.PATIENT_CARE]: {
    medicatie_toedienen: [
      { pattern: /^medicatie\s+(geven|toedienen)/i, weight: 1.0 },
      { pattern: /^(geef|toedienen)\s+medicatie/i, weight: 1.0 },
      { pattern: /^\w+\s+medicatie\s+(gegeven|toegediend)/i, weight: 0.95 },
    ],
    medicatie_voorschrijven: [
      { pattern: /^voorschrijf\s+medicatie/i, weight: 1.0 },
      { pattern: /^medicatie\s+voorschrijven/i, weight: 1.0 },
      { pattern: /^start\s+medicatie/i, weight: 0.95 },
    ],
    meting_vitaal: [
      { pattern: /^(bloeddruk|temperatuur|pols|saturatie)\b/i, weight: 1.0 },
      { pattern: /^vitale\s+(functies|metingen)/i, weight: 1.0 },
      { pattern: /^\w+\s+(bloeddruk|temperatuur)/i, weight: 0.9 },
    ],
  },

  [IntentCategory.SCHEDULING]: {
    agenda_query: [
      { pattern: /^afspraken?\b/i, weight: 1.0 },
      { pattern: /^agenda\b/i, weight: 1.0 },
      { pattern: /^wat\s+zijn\s+mijn\s+afspraken/i, weight: 1.0 },
    ],
    create_appointment: [
      { pattern: /^maak\s+afspraak/i, weight: 1.0 },
      { pattern: /^plan\s+(intake|afspraak)/i, weight: 1.0 },
    ],
    cancel_appointment: [
      { pattern: /^annuleer\s+afspraak/i, weight: 1.0 },
    ],
  },

  // ... other categories
};

// Two-phase classification
export function classifyIntentHierarchical(input: string): ClassificationResult {
  const startTime = performance.now();

  // PHASE 1: Detect category (fast, ~20 patterns)
  let bestCategory: IntentCategory | null = null;
  let categoryConfidence = 0;

  for (const { pattern, category, weight } of CATEGORY_PATTERNS) {
    if (pattern.test(input)) {
      if (weight > categoryConfidence) {
        bestCategory = category;
        categoryConfidence = weight;
      }
    }
  }

  // If no category detected, use SEARCH as fallback
  if (!bestCategory || categoryConfidence < 0.5) {
    bestCategory = IntentCategory.SEARCH;
  }

  // PHASE 2: Detect intent within category (smaller search space)
  const categoryIntents = INTENT_PATTERNS_BY_CATEGORY[bestCategory];
  let bestIntent: SwiftIntent = 'unknown';
  let intentConfidence = 0;

  for (const [intent, patterns] of Object.entries(categoryIntents)) {
    for (const { pattern, weight } of patterns) {
      if (pattern.test(input)) {
        if (weight > intentConfidence) {
          bestIntent = intent as SwiftIntent;
          intentConfidence = weight;
        }
        if (weight === 1.0) break; // Perfect match
      }
    }
    if (intentConfidence === 1.0) break;
  }

  const processingTimeMs = performance.now() - startTime;

  return {
    intent: bestIntent,
    confidence: Math.min(categoryConfidence, intentConfidence), // Take lowest
    category: bestCategory,
    processingTimeMs,
  };
}
```

### Performance Impact

**Voor 34 intents met 235 patterns:**

| Metric | Flat Structure | Hierarchical | Improvement |
|--------|----------------|--------------|-------------|
| Avg patterns tested | 117 (~50%) | 10 + 12 = 22 | **5.3x faster** |
| Worst case | 235 (all) | 20 + 35 = 55 | **4.3x faster** |
| Best case | 1 | 1 + 1 = 2 | Similar |
| Estimated time | ~50ms | ~12ms | **4.2x faster** |

**Complexity:**
- Flat: O(n) where n = total patterns
- Hierarchical: O(c + i) where c = category patterns, i = intent patterns in category
- Typically: c ≈ 20, i ≈ 10-15 → O(30-35) vs O(235)

---

## Strategie 2: Keyword Index / Trie Structure

### Concept

Pre-index patterns by first keyword voor instant lookup.

```typescript
// Build index at startup
const KEYWORD_INDEX = new Map<string, IntentPattern[]>();

// Index building
for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
  for (const pattern of patterns) {
    const keywords = extractKeywords(pattern);
    for (const keyword of keywords) {
      if (!KEYWORD_INDEX.has(keyword)) {
        KEYWORD_INDEX.set(keyword, []);
      }
      KEYWORD_INDEX.get(keyword)!.push({ intent, pattern });
    }
  }
}

// Fast lookup
function classifyWithIndex(input: string): ClassificationResult {
  const firstWord = input.trim().split(/\s+/)[0].toLowerCase();

  // O(1) lookup
  const candidatePatterns = KEYWORD_INDEX.get(firstWord) || [];

  // Test only relevant patterns (typically 3-10 instead of 235)
  for (const { intent, pattern } of candidatePatterns) {
    if (pattern.test(input)) {
      return { intent, confidence: pattern.weight };
    }
  }

  // Fallback: test all patterns (rare)
  return classifyFull(input);
}
```

**Voordelen:**
- ✅ O(1) lookup voor common patterns
- ✅ Makkelijk te implementeren
- ✅ Backward compatible

**Nadelen:**
- ❌ Misses patterns zonder duidelijk keyword
- ❌ Extra memory overhead
- ❌ Requires maintenance of index

---

## Strategie 3: Intent Prioriteit (Analytics-Driven)

### Concept

Order intents op basis van gebruiksfrequentie.

```typescript
interface IntentMetrics {
  intent: SwiftIntent;
  frequency: number;        // Times used
  avgConfidence: number;    // Average confidence
  avgProcessingTime: number;
}

// Track usage
const INTENT_STATS = new Map<SwiftIntent, IntentMetrics>();

function trackIntentUsage(intent: SwiftIntent, confidence: number, time: number) {
  const stats = INTENT_STATS.get(intent) || {
    intent,
    frequency: 0,
    avgConfidence: 0,
    avgProcessingTime: 0,
  };

  stats.frequency++;
  stats.avgConfidence = (stats.avgConfidence * (stats.frequency - 1) + confidence) / stats.frequency;
  stats.avgProcessingTime = (stats.avgProcessingTime * (stats.frequency - 1) + time) / stats.frequency;

  INTENT_STATS.set(intent, stats);
}

// Periodically reorder patterns based on frequency
function optimizePatternOrder() {
  const sorted = Array.from(INTENT_STATS.values())
    .sort((a, b) => b.frequency - a.frequency);

  // Rebuild INTENT_PATTERNS with high-frequency intents first
  const optimized = {};
  for (const { intent } of sorted) {
    optimized[intent] = INTENT_PATTERNS[intent];
  }

  return optimized;
}
```

**Impact:**

Als 80% van queries 3 intents gebruikt (dagnotitie, agenda_query, zoeken):
- Average patterns tested: 15 instead of 117
- **7.8x speedup** for common cases

---

## Strategie 4: Compositional Intents

### Concept

Split intents in **base action** + **subject** + **modifiers**.

```typescript
// Instead of flat intents:
type OldIntent =
  | 'medicatie_toedienen'
  | 'medicatie_voorschrijven'
  | 'medicatie_stop'
  | 'medicatie_bijwerking'
  | 'lab_aanvraag'
  | 'lab_uitslag'
  | 'rontgen_aanvraag'
  // ... 30+ more

// Use compositional structure:
interface ComposedIntent {
  action: Action;         // toedienen, voorschrijven, aanvragen, etc.
  subject: Subject;       // medicatie, lab, röntgen, etc.
  modifiers?: Modifier[]; // urgent, herhaling, etc.
}

type Action =
  | 'create' | 'read' | 'update' | 'delete'  // CRUD
  | 'toedienen' | 'voorschrijven' | 'stop'   // Medicatie-specific
  | 'aanvragen' | 'bekijken' | 'afmelden'    // Request-specific
  ;

type Subject =
  | 'medicatie' | 'lab' | 'rontgen' | 'echo'
  | 'afspraak' | 'notitie' | 'brief'
  ;

type Modifier =
  | 'urgent' | 'spoed' | 'herhaling'
  ;

// Pattern matching
const ACTION_PATTERNS = {
  toedienen: /\b(geef|toedien|gegeven)\b/i,
  voorschrijven: /\b(voorschrijf|start|begin)\b/i,
  stop: /\b(stop|afbouwen|be[eë]indig)\b/i,
  aanvragen: /\b(vraag|aanvraag|aanvragen)\b/i,
};

const SUBJECT_PATTERNS = {
  medicatie: /\b(medicatie|medicijn|tablet|pil)\b/i,
  lab: /\b(lab|bloed|urine)\b/i,
  rontgen: /\b(r[oö]ntgen|x-?ray)\b/i,
};

// Compose intent
function classifyCompositional(input: string): ComposedIntent {
  const action = detectAction(input);    // Fast, ~10 patterns
  const subject = detectSubject(input);  // Fast, ~10 patterns
  const modifiers = detectModifiers(input); // Optional, ~5 patterns

  return { action, subject, modifiers };
}

// Map to legacy intent
function toLegacyIntent(composed: ComposedIntent): SwiftIntent {
  const key = `${composed.subject}_${composed.action}`;
  const mapping = {
    'medicatie_toedienen': 'medicatie_toedienen',
    'medicatie_voorschrijven': 'medicatie_voorschrijven',
    'lab_aanvragen': 'lab_aanvraag',
    // ... etc
  };
  return mapping[key] || 'unknown';
}
```

**Voordelen:**
- ✅ Veel kleiner pattern set (~25 vs 235)
- ✅ Makkelijker om nieuwe combinaties toe te voegen
- ✅ Natuurlijker voor AI reasoning

**Nadelen:**
- ❌ Requires refactoring
- ❌ Less precise than specific patterns
- ❌ May need disambiguation more often

---

## Strategie 5: Smarter AI Routing (Hybrid Approach)

### Concept

Use **AI for categorization** (fast, cheap) then **local patterns** for specific intent.

```typescript
// Step 1: AI categorizes (very fast with Haiku)
const category = await categorizeWithAI(input); // ~100ms

// Step 2: Local patterns within category
const intent = classifyLocalInCategory(input, category); // ~5ms

// Total: ~105ms (but higher accuracy than pure local)
```

**AI System Prompt for Categorization:**

```typescript
const CATEGORIZATION_PROMPT = `Categoriseer de volgende input in één categorie:

Categorieën:
1. documentation - Notities, verslagen maken
2. patient_care - Medicatie, metingen, verzorging
3. scheduling - Agenda, afspraken
4. diagnostic - Lab, beeldvorming
5. communication - Brieven, consults
6. administrative - Overdracht, MDO
7. search - Zoeken, informatie opvragen

Antwoord met ALLEEN de categorie naam (lowercase).

Input: "${input}"
Categorie:`;
```

**Performance:**
- Categorization: ~100ms (AI call)
- Intent detection: ~5ms (local, small set)
- **Total: ~105ms** (vs ~50ms pure local, but more accurate)

**Trade-off:**
- Slower than pure local (2x)
- But handles ambiguous cases better
- Cheaper than full AI classification (smaller prompt)

---

## Strategie 6: Pattern Optimization

### Specific Optimizations

#### A. Pre-compiled Regex

```typescript
// ❌ BAD: Compile regex on every call
function classify(input: string) {
  const pattern = new RegExp(`^${keyword}\\b`, 'i');
  return pattern.test(input);
}

// ✅ GOOD: Pre-compile at module load
const PATTERNS = {
  dagnotitie: /^dagnotitie\b/i,
  zoeken: /^zoek\b/i,
};

function classify(input: string) {
  return PATTERNS.dagnotitie.test(input);
}
```

**Impact:** 10-20% faster

#### B. Early Exit on Perfect Match

```typescript
for (const { pattern, weight } of patterns) {
  if (pattern.test(input)) {
    bestMatch = { pattern, weight };

    // Early exit for perfect match
    if (weight === 1.0) {
      break; // Don't test remaining patterns
    }
  }
}
```

**Impact:** 30-50% faster for common exact matches

#### C. Pattern Ordering

```typescript
// Order patterns by likelihood (high weight first)
const patterns = [
  { pattern: /^exact\b/i, weight: 1.0 },        // Most likely
  { pattern: /^exact\s+\w+/i, weight: 0.95 },   // Second
  { pattern: /\bpartial\b/i, weight: 0.7 },     // Less likely
];
```

**Impact:** 20-40% faster on average

---

## 📊 Aanbevolen Implementatie Roadmap

### Fase 1: Quick Wins (Week 1)

**Implementeer nu (backward compatible):**

1. ✅ **Pattern Optimization**
   - Pre-compile all regex
   - Add early exit on perfect match
   - Reorder patterns by weight (high first)
   - **Effort:** 2 uur
   - **Gain:** 30-40% sneller

2. ✅ **Intent Metrics Tracking**
   - Add analytics to track intent frequency
   - Log classification times
   - **Effort:** 4 uur
   - **Gain:** Data voor fase 2

### Fase 2: Hierarchie (Week 2-3)

**Implementeer categorieën:**

3. ✅ **Category-based Classification**
   - Define 7 categories
   - Build category patterns
   - Restructure INTENT_PATTERNS by category
   - Add two-phase classifier
   - Keep old classifier for fallback
   - **Effort:** 2 dagen
   - **Gain:** 4-5x sneller, better scalability

4. ✅ **A/B Testing**
   - Test old vs new classifier
   - Compare accuracy & performance
   - **Effort:** 1 dag
   - **Gain:** Confidence in new approach

### Fase 3: Advanced (Maand 2)

**Optioneel, als nodig:**

5. ⚠️ **Keyword Index** (if performance still issue)
   - Build keyword → pattern index
   - **Effort:** 1 dag
   - **Gain:** Extra 2x sneller

6. ⚠️ **Compositional Intents** (if too many intents)
   - Refactor to action + subject
   - **Effort:** 1 week
   - **Gain:** Smaller pattern set, easier to extend

---

## 🎯 Concrete Voorstel voor Swift

### Voor Huidige Situatie (7 intents)

**Aanbeveling:** **Blijf bij huidige flat structure** + pattern optimizations

**Waarom:**
- Current performance is acceptable (<20ms)
- Complexity niet worth it voor 7 intents
- Quick wins genoeg (pre-compile, early exit)

**Implementeer WEL:**
- ✅ Pattern optimization (fase 1)
- ✅ Intent metrics tracking (voor later)

### Voor Toekomst (15+ intents)

**Aanbeveling:** **Overstap naar categorie-based hierarchie**

**Trigger points:**
- Wanneer >15 intents
- Wanneer classification >30ms
- Wanneer veel pattern conflicts

**Implementatie:**
1. Define 7 categories
2. Categorize existing intents
3. Build two-phase classifier
4. Keep old classifier als fallback
5. A/B test

### Code Structuur

```
lib/swift/
├── intent-classifier.ts              # Current (keep for now)
├── intent-classifier-hierarchical.ts # New (implement in fase 2)
├── intent-classifier-ai.ts           # Current AI fallback
├── intent-categories.ts              # Category definitions
├── intent-patterns/                  # Split patterns by category
│   ├── documentation.ts
│   ├── patient-care.ts
│   ├── scheduling.ts
│   ├── diagnostic.ts
│   ├── communication.ts
│   ├── administrative.ts
│   └── search.ts
└── types.ts
```

---

## 📈 Performance Benchmarks

### Target Metrics

| Metric | Current | Phase 1 Target | Phase 2 Target | Phase 3 Target |
|--------|---------|----------------|----------------|----------------|
| **Avg classification time** | 12ms | 8ms | 5ms | 3ms |
| **95th percentile** | 25ms | 15ms | 12ms | 8ms |
| **Max intents supported** | 10 | 15 | 40 | 100+ |
| **Memory usage** | 100KB | 120KB | 150KB | 200KB |

### Test Suite

```typescript
// __tests__/performance.test.ts

describe('Intent Classification Performance', () => {
  it('should classify in <10ms (avg)', () => {
    const inputs = generateTestInputs(1000);
    const times = inputs.map(input => {
      const start = performance.now();
      classifyIntent(input);
      return performance.now() - start;
    });

    const avg = times.reduce((a, b) => a + b) / times.length;
    expect(avg).toBeLessThan(10);
  });

  it('should classify in <30ms (p95)', () => {
    const times = [...]; // from above
    const p95 = percentile(times, 95);
    expect(p95).toBeLessThan(30);
  });

  it('should handle 40 intents efficiently', () => {
    const classifierWith40Intents = buildClassifier(40);
    const time = measureClassification(classifierWith40Intents);
    expect(time).toBeLessThan(15);
  });
});
```

---

## 🔧 Migration Guide

### Van Flat naar Hierarchical

**Step 1: Define Categories**

```typescript
// lib/swift/intent-categories.ts
export const INTENT_CATEGORY_MAP: Record<SwiftIntent, IntentCategory> = {
  // Documentation
  'dagnotitie': IntentCategory.DOCUMENTATION,
  'rapportage_intake': IntentCategory.DOCUMENTATION,

  // Patient Care
  'meting_vitaal': IntentCategory.PATIENT_CARE,
  'medicatie_toedienen': IntentCategory.PATIENT_CARE,

  // Scheduling
  'agenda_query': IntentCategory.SCHEDULING,
  'create_appointment': IntentCategory.SCHEDULING,

  // Search
  'zoeken': IntentCategory.SEARCH,

  // ... etc
};
```

**Step 2: Restructure Patterns**

```bash
# Create pattern files per category
mkdir lib/swift/intent-patterns
touch lib/swift/intent-patterns/documentation.ts
touch lib/swift/intent-patterns/patient-care.ts
# ... etc
```

```typescript
// lib/swift/intent-patterns/documentation.ts
export const DOCUMENTATION_PATTERNS = {
  dagnotitie: [
    { pattern: /^dagnotitie\b/i, weight: 1.0 },
    // ...
  ],
  rapportage_intake: [
    // ...
  ],
};
```

**Step 3: Build Hierarchical Classifier**

```typescript
// lib/swift/intent-classifier-hierarchical.ts
import { DOCUMENTATION_PATTERNS } from './intent-patterns/documentation';
import { PATIENT_CARE_PATTERNS } from './intent-patterns/patient-care';
// ... import all

export const PATTERNS_BY_CATEGORY = {
  [IntentCategory.DOCUMENTATION]: DOCUMENTATION_PATTERNS,
  [IntentCategory.PATIENT_CARE]: PATIENT_CARE_PATTERNS,
  // ...
};
```

**Step 4: Feature Flag**

```typescript
// Use feature flag for gradual rollout
const USE_HIERARCHICAL_CLASSIFIER = process.env.NEXT_PUBLIC_USE_HIERARCHICAL === 'true';

export function classifyIntent(input: string) {
  if (USE_HIERARCHICAL_CLASSIFIER) {
    return classifyIntentHierarchical(input);
  }
  return classifyIntentFlat(input); // Old implementation
}
```

**Step 5: A/B Test & Monitor**

```typescript
// Log both results for comparison
const flatResult = classifyIntentFlat(input);
const hierarchicalResult = classifyIntentHierarchical(input);

analytics.track('intent_classification_comparison', {
  input,
  flatIntent: flatResult.intent,
  flatConfidence: flatResult.confidence,
  flatTime: flatResult.processingTimeMs,
  hierarchicalIntent: hierarchicalResult.intent,
  hierarchicalConfidence: hierarchicalResult.confidence,
  hierarchicalTime: hierarchicalResult.processingTimeMs,
  agreement: flatResult.intent === hierarchicalResult.intent,
});

// Use hierarchical if enabled
return USE_HIERARCHICAL_CLASSIFIER ? hierarchicalResult : flatResult;
```

---

## 💡 Samenvatting

### Aanbevolen Aanpak

**NU (0-7 intents):**
- ✅ Implement pattern optimizations (fase 1)
- ✅ Add metrics tracking
- ⏸️ Wait met hierarchie

**LATER (15+ intents):**
- ✅ Implement categorie-based hierarchie (fase 2)
- ✅ Optioneel: keyword index of compositional intents

**Grootste Impact:**
1. **Category hierarchie** → 4-5x sneller, schaalbaar tot 40+ intents
2. **Pattern optimization** → 30-40% sneller, makkelijk win
3. **Priority ordering** → 7-8x sneller voor common cases

**Effort vs Gain:**

| Strategie | Effort | Performance Gain | Scalability Gain | When to Implement |
|-----------|--------|------------------|------------------|-------------------|
| Pattern optimization | 2 uur | 30-40% | Low | ✅ Now |
| Category hierarchie | 2 dagen | 4-5x | High | When >15 intents |
| Keyword index | 1 dag | 2x extra | Medium | If still slow |
| Compositional | 1 week | 8-10x | Very High | When >40 intents |
| AI categorization | 3 dagen | 0x (slower) | High (accuracy) | If accuracy issues |

**Quick Decision Matrix:**

```
Current intents < 10?
  → Pattern optimization only

Current intents 10-20?
  → Pattern optimization + start planning hierarchie

Current intents 20-40?
  → Implement category hierarchie NOW

Current intents >40?
  → Consider compositional intents
```

