# Architecture: Intent System Schaalbaarheid (GGZ)

**Document:** Intent System Scalability & Optimization voor GGZ
**Versie:** 2.0
**Datum:** 29-12-2025
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

### Toekomstige Schaal (GGZ-specifiek)

Bij volledige GGZ EPD uitbreiding:

| Module | Nieuwe Intents | Patterns per Intent | Totaal |
|--------|----------------|---------------------|--------|
| **Risico & Veiligheid** | 5 (risicotaxatie, signaleringsplan, veiligheidsplan, crisis, dwang) | 8 | 40 |
| **Behandeling** | 5 (behandelplan_maken, doel_toevoegen, interventie, evaluatie, afsluiten) | 7 | 35 |
| **Observatie & Rapportage** | 5 (observatie_gedrag, observatie_stemming, dagnotitie, voortgang, MDO) | 8 | 40 |
| **Medicatie (Psychofarmaca)** | 4 (voorschrijven, toedienen, bijwerking, therapietrouw) | 7 | 28 |
| **ROM & Metingen** | 4 (rom_afnemen, rom_bekijken, leefgebieden, zorgvraagtypering) | 6 | 24 |
| **Communicatie** | 3 (brief_huisarts, consult_aanvraag, ontslagbrief) | 6 | 18 |
| **Intake & Screening** | 3 (intake, screening, kindcheck) | 5 | 15 |
| **Huidig** | 7 | ~8 | 60 |
| **TOTAAL** | **36 intents** | **~7 avg** | **~260 patterns** |

### GGZ-Specifieke Overwegingen

**Kritieke intents (safety-first):**
- Risicotaxatie (suïcidaliteit, agressie) moet ALTIJD herkend worden
- Crisis-gerelateerde commando's hebben prioriteit
- Dwangmaatregelen vereisen expliciete bevestiging

**Geschatte performance bij 260 patterns:**
- Classification time: ~45-65ms (4x slower)
- Meer pattern conflicts (overlap tussen observatie/rapportage)
- Moeilijker te maintainen

---

## 🎯 Optimalisatie Strategieën

## Strategie 1: Categoriegebaseerde Hierarchie ⭐ **AANBEVOLEN**

### Concept

Groepeer intents in categorieën en gebruik **two-phase classification**:
1. **Phase 1:** Detect categorie (snel, 5-10 opties)
2. **Phase 2:** Detect intent binnen categorie (kleiner search space)

### Categorie Structuur (GGZ)

```typescript
enum IntentCategory {
  SAFETY = 'safety',                  // 🚨 Risico, crisis, veiligheid (PRIORITEIT)
  TREATMENT = 'treatment',            // Behandelplan, doelen, interventies
  OBSERVATION = 'observation',        // Observaties, rapportages, notities
  MEDICATION = 'medication',          // Psychofarmaca, therapietrouw
  ASSESSMENT = 'assessment',          // ROM, leefgebieden, intake
  SCHEDULING = 'scheduling',          // Agenda, planning
  COMMUNICATION = 'communication',    // Brieven, consults, MDO
  SEARCH = 'search',                  // Zoeken, info opvragen
}

type SwiftIntent =
  // SAFETY (Hoogste prioriteit - altijd eerst checken)
  | 'risicotaxatie'           // "Risico inschatten bij Jan" / "Suïcidaliteit checken"
  | 'signaleringsplan'        // "Signaleringsplan maken" / "Waarschuwingssignalen vastleggen"
  | 'veiligheidsplan'         // "Veiligheidsplan opstellen" / "Noodcontacten toevoegen"
  | 'crisis_protocol'         // "Start crisisprotocol" / "Crisis bij patiënt"
  | 'dwangmaatregel'          // "Separatie registreren" / "Dwangmedicatie vastleggen"

  // TREATMENT (Behandeling)
  | 'behandelplan_maken'      // "Maak behandelplan" / "Start behandeling"
  | 'behandelplan_evalueren'  // "Evalueer behandeling" / "Tussentijdse evaluatie"
  | 'behandelplan_afsluiten'  // "Sluit behandeling af" / "Ontslag voorbereiden"
  | 'doel_toevoegen'          // "Voeg doel toe" / "Nieuw behandeldoel"
  | 'interventie_plannen'     // "Plan CGT sessie" / "EMDR inplannen"

  // OBSERVATION (Observatie & Rapportage)
  | 'dagnotitie'              // Bestaand - behouden
  | 'observatie_gedrag'       // "Gedragsobservatie" / "Onrust geobserveerd"
  | 'observatie_stemming'     // "Stemming rapporteren" / "Somber vandaag"
  | 'observatie_psychotisch'  // "Psychotische symptomen" / "Hallucinaties gemeld"
  | 'voortgangsrapportage'    // "Voortgang rapporteren" / "Update behandeling"
  | 'mdo_verslag'             // "MDO verslag maken" / "Teambespreking noteren"

  // MEDICATION (Psychofarmaca)
  | 'medicatie_voorschrijven' // "Voorschrijf sertraline" / "Start antidepressivum"
  | 'medicatie_toedienen'     // "Medicatie gegeven" / "Depot toegediend"
  | 'medicatie_bijwerking'    // "Bijwerking melden" / "Klachten medicatie"
  | 'therapietrouw'           // "Therapietrouw checken" / "Medicatie geweigerd"

  // ASSESSMENT (ROM & Metingen)
  | 'rom_afnemen'             // "ROM afnemen" / "Vragenlijst invullen"
  | 'rom_bekijken'            // "ROM scores bekijken" / "Uitslag vragenlijst"
  | 'leefgebieden'            // "Leefgebieden scoren" / "Update wonen/werk/sociaal"
  | 'intake'                  // "Start intake" / "Intake gesprek"
  | 'screening'               // "Screening uitvoeren" / "Aanmelding screenen"
  | 'zorgvraagtypering'       // "Zorgvraagtypering" / "ZPM bepalen"

  // SCHEDULING (Agenda)
  | 'agenda_query'            // Bestaand - behouden
  | 'create_appointment'      // Bestaand - behouden
  | 'cancel_appointment'      // Bestaand - behouden
  | 'reschedule_appointment'  // Bestaand - behouden

  // COMMUNICATION
  | 'brief_huisarts'          // "Brief naar huisarts" / "Huisarts informeren"
  | 'consult_aanvraag'        // "Consult aanvragen" / "Verwijzing psychiater"
  | 'ontslagbrief'            // "Ontslagbrief maken" / "Eindbrief opstellen"
  | 'overdracht'              // Bestaand - behouden

  // SEARCH
  | 'zoeken'                  // Bestaand - behouden
  | 'patient_info'            // "Info over Jan" / "Dossier bekijken"
  | 'medicatie_info'          // "Info sertraline" / "Bijsluiter bekijken"
  | 'protocol_info'           // "Zorgstandaard depressie" / "Richtlijn opzoeken"

  | 'unknown';
```

### GGZ Safety-First Prioritering

```typescript
/**
 * BELANGRIJK: Safety intents worden ALTIJD eerst gecheckt,
 * ongeacht de gedetecteerde categorie.
 *
 * Reden: Een zin als "Jan zei dat hij dood wil" moet ALTIJD
 * als risico worden herkend, ook als het in een notitie-context staat.
 */
const SAFETY_PRIORITY_PATTERNS = [
  /\b(suïcid|zelfmoord|dood\s*wil|geen\s*zin|uitzichtloos)\b/i,
  /\b(agressie|geweld|dreigen|slaan)\b/i,
  /\b(crisis|acuut|spoed|112)\b/i,
  /\b(dwang|separatie|isolatie|fixatie)\b/i,
  /\b(zelfverwaarlozing|niet\s*eten|niet\s*drinken)\b/i,
];

// Check FIRST before category detection
function hasSafetySignal(input: string): boolean {
  return SAFETY_PRIORITY_PATTERNS.some(p => p.test(input));
}
```

### Implementation

```typescript
// lib/swift/intent-classifier-hierarchical.ts

interface CategoryPattern {
  pattern: RegExp;
  category: IntentCategory;
  weight: number;
}

// Step 1: Category patterns (GGZ-specifiek, ~25 patterns)
const CATEGORY_PATTERNS: CategoryPattern[] = [
  // 🚨 SAFETY keywords (HOOGSTE prioriteit)
  { pattern: /\b(risico|suïcid|zelfmoord|crisis|dwang|separatie|agressie|geweld)\b/i,
    category: IntentCategory.SAFETY, weight: 1.0 },
  { pattern: /\b(veiligheidsplan|signaleringsplan|noodcontact|waarschuwing)\b/i,
    category: IntentCategory.SAFETY, weight: 0.95 },

  // TREATMENT keywords
  { pattern: /\b(behandelplan|behandeling|doel|interventie|therapie|CGT|EMDR|DGT)\b/i,
    category: IntentCategory.TREATMENT, weight: 0.9 },
  { pattern: /\b(evaluatie|afsluiten|ontslag|herstel)\b/i,
    category: IntentCategory.TREATMENT, weight: 0.85 },

  // OBSERVATION keywords
  { pattern: /\b(notitie|observatie|rapportage|gedrag|stemming)\b/i,
    category: IntentCategory.OBSERVATION, weight: 0.9 },
  { pattern: /\b(somber|angstig|onrustig|psychotisch|hallucinatie|waan)\b/i,
    category: IntentCategory.OBSERVATION, weight: 0.85 },

  // MEDICATION keywords (Psychofarmaca)
  { pattern: /\b(medicatie|medicijn|depot|antidepressiv|antipsychotic|benzo)\b/i,
    category: IntentCategory.MEDICATION, weight: 0.9 },
  { pattern: /\b(therapietrouw|bijwerking|voorschrijf|toedien)\b/i,
    category: IntentCategory.MEDICATION, weight: 0.85 },

  // ASSESSMENT keywords
  { pattern: /\b(ROM|vragenlijst|leefgebieden|intake|screening)\b/i,
    category: IntentCategory.ASSESSMENT, weight: 0.9 },
  { pattern: /\b(zorgvraagtypering|ZPM|score|meting)\b/i,
    category: IntentCategory.ASSESSMENT, weight: 0.85 },

  // SCHEDULING keywords
  { pattern: /\b(afspraak|agenda|planning|verzet|annuleer)\b/i,
    category: IntentCategory.SCHEDULING, weight: 0.9 },

  // COMMUNICATION keywords
  { pattern: /\b(brief|consult|verwijzing|overdracht|MDO)\b/i,
    category: IntentCategory.COMMUNICATION, weight: 0.85 },

  // SEARCH keywords (lowest priority)
  { pattern: /\b(zoek|vind|wie|info|dossier|bekijk|opzoeken)\b/i,
    category: IntentCategory.SEARCH, weight: 0.7 },
];

// Step 2: Intent patterns per category (GGZ-specifiek)
const INTENT_PATTERNS_BY_CATEGORY: Record<IntentCategory, Record<string, PatternConfig[]>> = {

  // 🚨 SAFETY - Risico & Veiligheid
  [IntentCategory.SAFETY]: {
    risicotaxatie: [
      { pattern: /^risico\s*(taxatie|inschatting|check)/i, weight: 1.0 },
      { pattern: /\b(suïcid|zelfmoord)\s*(risico|check|inschatten)/i, weight: 1.0 },
      { pattern: /\bagressie\s*risico\b/i, weight: 0.95 },
    ],
    signaleringsplan: [
      { pattern: /^signaleringsplan\b/i, weight: 1.0 },
      { pattern: /\bwaarschuwingssignalen\s*(vastleggen|maken)/i, weight: 0.95 },
      { pattern: /\bearly\s*warning/i, weight: 0.9 },
    ],
    veiligheidsplan: [
      { pattern: /^veiligheidsplan\b/i, weight: 1.0 },
      { pattern: /\bnoodcontact(en)?\s*(toevoegen|vastleggen)/i, weight: 0.9 },
      { pattern: /\bsafety\s*plan/i, weight: 0.9 },
    ],
    crisis_protocol: [
      { pattern: /^crisis\b/i, weight: 1.0 },
      { pattern: /\bcrisisprotocol\s*(starten|activeren)/i, weight: 1.0 },
      { pattern: /\bacuut\s*(gevaar|risico)/i, weight: 0.95 },
    ],
    dwangmaatregel: [
      { pattern: /\b(dwang|separatie|isolatie|fixatie)\s*(registreren|vastleggen)/i, weight: 1.0 },
      { pattern: /\bdwangmedicatie\b/i, weight: 1.0 },
      { pattern: /\bWvggz\b/i, weight: 0.9 },
    ],
  },

  // TREATMENT - Behandeling
  [IntentCategory.TREATMENT]: {
    behandelplan_maken: [
      { pattern: /^(maak|start|nieuw)\s*behandelplan/i, weight: 1.0 },
      { pattern: /\bbehandelplan\s*(maken|opstellen|starten)/i, weight: 1.0 },
    ],
    behandelplan_evalueren: [
      { pattern: /\bevaluatie\s*behandel/i, weight: 1.0 },
      { pattern: /\bbehandeling\s*evalueren/i, weight: 1.0 },
      { pattern: /\btussentijdse\s*evaluatie/i, weight: 0.95 },
    ],
    behandelplan_afsluiten: [
      { pattern: /\bbehandeling\s*(afsluiten|beëindigen)/i, weight: 1.0 },
      { pattern: /\bontslag\s*(voorbereiden|regelen)/i, weight: 0.9 },
    ],
    doel_toevoegen: [
      { pattern: /\bdoel\s*(toevoegen|maken|nieuw)/i, weight: 1.0 },
      { pattern: /\bbehandeldoel/i, weight: 0.95 },
      { pattern: /\bSMART\s*doel/i, weight: 0.9 },
    ],
    interventie_plannen: [
      { pattern: /\b(CGT|EMDR|DGT|ACT|schema)\s*(sessie|plannen)/i, weight: 1.0 },
      { pattern: /\binterventie\s*(plannen|inplannen)/i, weight: 0.95 },
      { pattern: /\btherapie\s*sessie/i, weight: 0.9 },
    ],
  },

  // OBSERVATION - Observatie & Rapportage
  [IntentCategory.OBSERVATION]: {
    dagnotitie: [
      { pattern: /^dagnotitie\b/i, weight: 1.0 },
      { pattern: /^notitie\s+\w+/i, weight: 0.95 },
      { pattern: /^\w+\s+(medicatie|adl|gedrag|incident|observatie)\b/i, weight: 0.9 },
    ],
    observatie_gedrag: [
      { pattern: /\bgedrag\s*(observatie|geobserveerd)/i, weight: 1.0 },
      { pattern: /\b(onrust|agitatie|agressief)\s*(gedrag|geobserveerd)/i, weight: 0.95 },
    ],
    observatie_stemming: [
      { pattern: /\bstemming\s*(rapporteren|noteren)/i, weight: 1.0 },
      { pattern: /\b(somber|angstig|prikkelbaar|euforisch)\s*(vandaag|geobserveerd)/i, weight: 0.9 },
    ],
    observatie_psychotisch: [
      { pattern: /\b(psychotisch|hallucinatie|waan)\s*(symptomen|gemeld)/i, weight: 1.0 },
      { pattern: /\b(stemmen\s*horen|paranoïde)/i, weight: 0.95 },
    ],
    voortgangsrapportage: [
      { pattern: /\bvoortgang\s*(rapporteren|noteren)/i, weight: 1.0 },
      { pattern: /\bupdate\s*behandeling/i, weight: 0.9 },
    ],
    mdo_verslag: [
      { pattern: /\bMDO\s*(verslag|noteren)/i, weight: 1.0 },
      { pattern: /\bteambespreking\s*(noteren|vastleggen)/i, weight: 0.9 },
    ],
  },

  // MEDICATION - Psychofarmaca
  [IntentCategory.MEDICATION]: {
    medicatie_voorschrijven: [
      { pattern: /\bvoorschrijf\s*(sertraline|citalopram|venlafaxine|quetiapine|olanzapine|risperidon)/i, weight: 1.0 },
      { pattern: /\bstart\s*(antidepressiv|antipsychotic|anxiolytic)/i, weight: 0.95 },
      { pattern: /\bmedicatie\s*voorschrijven/i, weight: 0.9 },
    ],
    medicatie_toedienen: [
      { pattern: /\bmedicatie\s*(gegeven|toegediend)/i, weight: 1.0 },
      { pattern: /\bdepot\s*(toegediend|gezet)/i, weight: 1.0 },
    ],
    medicatie_bijwerking: [
      { pattern: /\bbijwerking\s*(melden|geobserveerd)/i, weight: 1.0 },
      { pattern: /\bklachten\s*medicatie/i, weight: 0.9 },
    ],
    therapietrouw: [
      { pattern: /\btherapietrouw\s*(checken|probleem)/i, weight: 1.0 },
      { pattern: /\bmedicatie\s*(geweigerd|niet\s*genomen)/i, weight: 0.95 },
    ],
  },

  // ASSESSMENT - ROM & Metingen
  [IntentCategory.ASSESSMENT]: {
    rom_afnemen: [
      { pattern: /\bROM\s*(afnemen|invullen)/i, weight: 1.0 },
      { pattern: /\bvragenlijst\s*(afnemen|invullen)/i, weight: 0.95 },
      { pattern: /\b(OQ-45|PHQ-9|GAD-7|BDI|BSI)\s*(afnemen)/i, weight: 1.0 },
    ],
    rom_bekijken: [
      { pattern: /\bROM\s*(scores|bekijken|resultaten)/i, weight: 1.0 },
      { pattern: /\buitslag\s*vragenlijst/i, weight: 0.9 },
    ],
    leefgebieden: [
      { pattern: /\bleefgebieden\s*(scoren|updaten)/i, weight: 1.0 },
      { pattern: /\b(wonen|werk|sociaal|financiën)\s*(score|update)/i, weight: 0.9 },
    ],
    intake: [
      { pattern: /^intake\b/i, weight: 1.0 },
      { pattern: /\bintake\s*gesprek/i, weight: 0.95 },
    ],
    screening: [
      { pattern: /\bscreening\s*(uitvoeren|starten)/i, weight: 1.0 },
      { pattern: /\baanmelding\s*screenen/i, weight: 0.9 },
    ],
    zorgvraagtypering: [
      { pattern: /\bzorgvraagtypering\b/i, weight: 1.0 },
      { pattern: /\bZPM\s*(bepalen|invullen)/i, weight: 0.95 },
    ],
  },

  // SCHEDULING - Agenda (behouden van origineel)
  [IntentCategory.SCHEDULING]: {
    agenda_query: [
      { pattern: /^afspraken?\b/i, weight: 1.0 },
      { pattern: /^agenda\b/i, weight: 1.0 },
      { pattern: /^wat\s+zijn\s+mijn\s+afspraken/i, weight: 1.0 },
    ],
    create_appointment: [
      { pattern: /^maak\s+afspraak/i, weight: 1.0 },
      { pattern: /^plan\s+(intake|afspraak|sessie)/i, weight: 1.0 },
    ],
    cancel_appointment: [
      { pattern: /^annuleer\s+afspraak/i, weight: 1.0 },
      { pattern: /\bafspraak\s*(annuleren|afzeggen)/i, weight: 0.95 },
    ],
    reschedule_appointment: [
      { pattern: /\bafspraak\s*(verzetten|verplaatsen)/i, weight: 1.0 },
    ],
  },

  // COMMUNICATION
  [IntentCategory.COMMUNICATION]: {
    brief_huisarts: [
      { pattern: /\bbrief\s*(naar|aan)\s*huisarts/i, weight: 1.0 },
      { pattern: /\bhuisarts\s*informeren/i, weight: 0.9 },
    ],
    consult_aanvraag: [
      { pattern: /\bconsult\s*(aanvragen|aanvraag)/i, weight: 1.0 },
      { pattern: /\bverwijzing\s*(psychiater|psycholoog)/i, weight: 0.9 },
    ],
    ontslagbrief: [
      { pattern: /\bontslagbrief\s*(maken|opstellen)/i, weight: 1.0 },
      { pattern: /\beindbrief/i, weight: 0.9 },
    ],
    overdracht: [
      { pattern: /^overdracht\b/i, weight: 1.0 },
      { pattern: /\bdienstoverdracht/i, weight: 0.95 },
    ],
  },

  // SEARCH
  [IntentCategory.SEARCH]: {
    zoeken: [
      { pattern: /^zoek\s+\w+/i, weight: 1.0 },
      { pattern: /^vind\s+\w+/i, weight: 1.0 },
    ],
    patient_info: [
      { pattern: /\binfo\s*(over|van)\s*\w+/i, weight: 0.9 },
      { pattern: /\bdossier\s*bekijken/i, weight: 0.9 },
    ],
    medicatie_info: [
      { pattern: /\binfo\s*(sertraline|citalopram|quetiapine)/i, weight: 1.0 },
      { pattern: /\bbijsluiter\s*bekijken/i, weight: 0.9 },
    ],
    protocol_info: [
      { pattern: /\b(zorgstandaard|richtlijn)\s*(depressie|angst|psychose)/i, weight: 1.0 },
      { pattern: /\bprotocol\s*opzoeken/i, weight: 0.9 },
    ],
  },
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

## Strategie 4: Compositional Intents (GGZ)

### Concept

Split intents in **base action** + **subject** + **modifiers**.

```typescript
// Instead of flat intents:
type OldIntent =
  | 'risicotaxatie'
  | 'signaleringsplan'
  | 'behandelplan_maken'
  | 'behandelplan_evalueren'
  | 'observatie_gedrag'
  | 'medicatie_bijwerking'
  // ... 30+ more

// Use compositional structure:
interface ComposedIntent {
  action: Action;         // maken, evalueren, registreren, etc.
  subject: Subject;       // risico, behandelplan, medicatie, etc.
  modifiers?: Modifier[]; // urgent, crisis, hoog_risico, etc.
}

// GGZ-specifieke acties
type Action =
  | 'create' | 'read' | 'update' | 'delete'  // CRUD basis
  | 'maken' | 'evalueren' | 'afsluiten'      // Behandeling
  | 'registreren' | 'rapporteren' | 'melden' // Documentatie
  | 'inschatten' | 'scoren' | 'afnemen'      // Assessment
  | 'voorschrijven' | 'toedienen' | 'stoppen' // Medicatie
  | 'plannen' | 'annuleren' | 'verzetten'    // Agenda
  | 'zoeken' | 'bekijken' | 'opvragen'       // Informatie
  ;

// GGZ-specifieke onderwerpen
type Subject =
  // Veiligheid & Risico
  | 'risico' | 'suicidaliteit' | 'agressie' | 'crisis'
  | 'signaleringsplan' | 'veiligheidsplan' | 'dwangmaatregel'
  // Behandeling
  | 'behandelplan' | 'doel' | 'interventie' | 'sessie'
  // Observatie
  | 'notitie' | 'gedrag' | 'stemming' | 'psychose' | 'voortgang'
  // Medicatie
  | 'medicatie' | 'depot' | 'bijwerking' | 'therapietrouw'
  // Assessment
  | 'ROM' | 'vragenlijst' | 'leefgebieden' | 'intake' | 'screening'
  // Communicatie
  | 'brief' | 'consult' | 'overdracht' | 'MDO'
  // Planning
  | 'afspraak' | 'agenda'
  ;

// GGZ-specifieke modifiers
type Modifier =
  | 'urgent' | 'spoed' | 'crisis'           // Prioriteit
  | 'hoog_risico' | 'laag_risico'           // Risico niveau
  | 'tussentijds' | 'eind'                  // Evaluatie moment
  | 'vandaag' | 'morgen' | 'deze_week'      // Timing
  ;

// Pattern matching (GGZ-specifiek)
const ACTION_PATTERNS = {
  // Behandeling
  maken: /\b(maak|start|nieuw|opstellen)\b/i,
  evalueren: /\b(evalueer|beoordeel|check)\b/i,
  afsluiten: /\b(afsluit|beëindig|stop)\b/i,
  // Documentatie
  registreren: /\b(registreer|leg\s*vast|noteer)\b/i,
  rapporteren: /\b(rapporteer|meld|geef\s*door)\b/i,
  // Assessment
  inschatten: /\b(inschat|taxeer|beoordeel)\b/i,
  afnemen: /\b(neem\s*af|invullen|scoor)\b/i,
  // Medicatie
  voorschrijven: /\b(voorschrijf|start)\b/i,
  toedienen: /\b(geef|toedien|dien\s*toe)\b/i,
  // Agenda
  plannen: /\b(plan|inplannen|agenda)\b/i,
};

const SUBJECT_PATTERNS = {
  // Veiligheid
  risico: /\b(risico|gevaar)\b/i,
  suicidaliteit: /\b(suïcid|zelfmoord|zelfdoding)\b/i,
  crisis: /\b(crisis|acuut|nood)\b/i,
  // Behandeling
  behandelplan: /\b(behandelplan|behandeling)\b/i,
  doel: /\b(doel|target|streefdoel)\b/i,
  interventie: /\b(interventie|therapie|CGT|EMDR)\b/i,
  // Observatie
  gedrag: /\b(gedrag|onrust|agitatie)\b/i,
  stemming: /\b(stemming|somber|angstig|euforisch)\b/i,
  // Medicatie
  medicatie: /\b(medicatie|medicijn|psychofarmac)\b/i,
  // Assessment
  ROM: /\b(ROM|vragenlijst|OQ|PHQ|GAD)\b/i,
  leefgebieden: /\b(leefgebied|wonen|werk|sociaal)\b/i,
};

const MODIFIER_PATTERNS = {
  crisis: /\b(crisis|spoed|acuut|urgent)\b/i,
  hoog_risico: /\b(hoog\s*risico|ernstig|zeer)\b/i,
};

// Compose intent
function classifyCompositional(input: string): ComposedIntent {
  const action = detectAction(input);       // Fast, ~12 patterns
  const subject = detectSubject(input);     // Fast, ~15 patterns
  const modifiers = detectModifiers(input); // Optional, ~5 patterns

  return { action, subject, modifiers };
}

// Map to legacy intent
function toLegacyIntent(composed: ComposedIntent): SwiftIntent {
  const key = `${composed.subject}_${composed.action}`;
  const mapping: Record<string, SwiftIntent> = {
    // Risico
    'risico_inschatten': 'risicotaxatie',
    'suicidaliteit_inschatten': 'risicotaxatie',
    'signaleringsplan_maken': 'signaleringsplan',
    'veiligheidsplan_maken': 'veiligheidsplan',
    'crisis_registreren': 'crisis_protocol',
    // Behandeling
    'behandelplan_maken': 'behandelplan_maken',
    'behandelplan_evalueren': 'behandelplan_evalueren',
    'doel_maken': 'doel_toevoegen',
    'interventie_plannen': 'interventie_plannen',
    // Observatie
    'gedrag_rapporteren': 'observatie_gedrag',
    'stemming_rapporteren': 'observatie_stemming',
    // Medicatie
    'medicatie_voorschrijven': 'medicatie_voorschrijven',
    'medicatie_toedienen': 'medicatie_toedienen',
    // Assessment
    'ROM_afnemen': 'rom_afnemen',
    'leefgebieden_scoren': 'leefgebieden',
    // Agenda
    'afspraak_plannen': 'create_appointment',
    'afspraak_annuleren': 'cancel_appointment',
  };
  return mapping[key] || 'unknown';
}
```

**Voordelen voor GGZ:**
- ✅ Veel kleiner pattern set (~32 vs 260)
- ✅ Natuurlijk voor klinische taal ("inschat risico", "evalueer behandeling")
- ✅ Makkelijk nieuwe combinaties: "inschat agressie" werkt automatisch
- ✅ Modifiers (crisis, hoog_risico) werken cross-intent

**Nadelen:**
- ❌ Requires refactoring van huidige code
- ❌ Minder precies bij ambigue zinnen
- ❌ Meer disambiguation bij gelijknamige acties

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

**AI System Prompt for Categorization (GGZ):**

```typescript
const CATEGORIZATION_PROMPT = `Categoriseer de volgende input in één categorie.

BELANGRIJK: Bij signalen van risico/crisis ALTIJD "safety" kiezen.

Categorieën:
1. safety - Risicotaxatie, crisis, suïcidaliteit, agressie, dwang, veiligheidsplan
2. treatment - Behandelplan, doelen, interventies, therapie, evaluatie
3. observation - Observaties, rapportages, notities, gedrag, stemming
4. medication - Psychofarmaca, voorschrijven, toedienen, bijwerkingen
5. assessment - ROM, vragenlijsten, intake, screening, leefgebieden
6. scheduling - Agenda, afspraken plannen
7. communication - Brieven, consults, overdracht, MDO
8. search - Zoeken, informatie opvragen

Risicowoorden die ALTIJD naar "safety" leiden:
- suïcide, zelfmoord, dood wil, uitzichtloos
- agressie, geweld, dreigen
- crisis, acuut, spoed
- dwang, separatie, isolatie

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

### Code Structuur (GGZ)

```
lib/swift/
├── intent-classifier.ts              # Current (keep for now)
├── intent-classifier-hierarchical.ts # New (implement in fase 2)
├── intent-classifier-ai.ts           # Current AI fallback
├── intent-categories.ts              # Category definitions
├── safety-priority.ts                # 🚨 Safety-first pattern detection
├── intent-patterns/                  # Split patterns by category
│   ├── safety.ts                     # Risico, crisis, veiligheid
│   ├── treatment.ts                  # Behandelplan, interventies
│   ├── observation.ts                # Observaties, rapportages
│   ├── medication.ts                 # Psychofarmaca
│   ├── assessment.ts                 # ROM, intake, screening
│   ├── scheduling.ts                 # Agenda
│   ├── communication.ts              # Brieven, consults
│   └── search.ts                     # Zoeken
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

**Step 1: Define Categories (GGZ)**

```typescript
// lib/swift/intent-categories.ts
export const INTENT_CATEGORY_MAP: Record<SwiftIntent, IntentCategory> = {
  // 🚨 Safety (Hoogste prioriteit)
  'risicotaxatie': IntentCategory.SAFETY,
  'signaleringsplan': IntentCategory.SAFETY,
  'veiligheidsplan': IntentCategory.SAFETY,
  'crisis_protocol': IntentCategory.SAFETY,
  'dwangmaatregel': IntentCategory.SAFETY,

  // Treatment
  'behandelplan_maken': IntentCategory.TREATMENT,
  'behandelplan_evalueren': IntentCategory.TREATMENT,
  'behandelplan_afsluiten': IntentCategory.TREATMENT,
  'doel_toevoegen': IntentCategory.TREATMENT,
  'interventie_plannen': IntentCategory.TREATMENT,

  // Observation
  'dagnotitie': IntentCategory.OBSERVATION,
  'observatie_gedrag': IntentCategory.OBSERVATION,
  'observatie_stemming': IntentCategory.OBSERVATION,
  'observatie_psychotisch': IntentCategory.OBSERVATION,
  'voortgangsrapportage': IntentCategory.OBSERVATION,
  'mdo_verslag': IntentCategory.OBSERVATION,

  // Medication
  'medicatie_voorschrijven': IntentCategory.MEDICATION,
  'medicatie_toedienen': IntentCategory.MEDICATION,
  'medicatie_bijwerking': IntentCategory.MEDICATION,
  'therapietrouw': IntentCategory.MEDICATION,

  // Assessment
  'rom_afnemen': IntentCategory.ASSESSMENT,
  'rom_bekijken': IntentCategory.ASSESSMENT,
  'leefgebieden': IntentCategory.ASSESSMENT,
  'intake': IntentCategory.ASSESSMENT,
  'screening': IntentCategory.ASSESSMENT,
  'zorgvraagtypering': IntentCategory.ASSESSMENT,

  // Scheduling
  'agenda_query': IntentCategory.SCHEDULING,
  'create_appointment': IntentCategory.SCHEDULING,
  'cancel_appointment': IntentCategory.SCHEDULING,
  'reschedule_appointment': IntentCategory.SCHEDULING,

  // Communication
  'brief_huisarts': IntentCategory.COMMUNICATION,
  'consult_aanvraag': IntentCategory.COMMUNICATION,
  'ontslagbrief': IntentCategory.COMMUNICATION,
  'overdracht': IntentCategory.COMMUNICATION,

  // Search
  'zoeken': IntentCategory.SEARCH,
  'patient_info': IntentCategory.SEARCH,
  'medicatie_info': IntentCategory.SEARCH,
  'protocol_info': IntentCategory.SEARCH,
};
```

**Step 2: Restructure Patterns (GGZ)**

```bash
# Create pattern files per category
mkdir lib/swift/intent-patterns
touch lib/swift/intent-patterns/safety.ts       # 🚨 Prioriteit
touch lib/swift/intent-patterns/treatment.ts
touch lib/swift/intent-patterns/observation.ts
touch lib/swift/intent-patterns/medication.ts
touch lib/swift/intent-patterns/assessment.ts
touch lib/swift/intent-patterns/scheduling.ts
touch lib/swift/intent-patterns/communication.ts
touch lib/swift/intent-patterns/search.ts
```

```typescript
// lib/swift/intent-patterns/safety.ts
export const SAFETY_PATTERNS = {
  risicotaxatie: [
    { pattern: /^risico\s*(taxatie|inschatting)/i, weight: 1.0 },
    { pattern: /\b(suïcid|zelfmoord)\s*risico/i, weight: 1.0 },
    { pattern: /\bagressie\s*risico/i, weight: 0.95 },
  ],
  crisis_protocol: [
    { pattern: /^crisis\b/i, weight: 1.0 },
    { pattern: /\bcrisisprotocol/i, weight: 1.0 },
  ],
  // ...
};

// lib/swift/intent-patterns/treatment.ts
export const TREATMENT_PATTERNS = {
  behandelplan_maken: [
    { pattern: /^(maak|start)\s*behandelplan/i, weight: 1.0 },
  ],
  interventie_plannen: [
    { pattern: /\b(CGT|EMDR|DGT)\s*sessie/i, weight: 1.0 },
  ],
  // ...
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

## 💡 Samenvatting (GGZ)

### Aanbevolen Aanpak

**NU (7 intents, MVP):**
- ✅ Implement pattern optimizations (fase 1)
- ✅ Add safety-first priority patterns
- ✅ Add metrics tracking
- ⏸️ Wait met volledige hierarchie

**LATER (15+ intents, volledige GGZ EPD):**
- ✅ Implement GGZ categorie-based hierarchie (fase 2)
- ✅ 8 categorieën: Safety, Treatment, Observation, Medication, Assessment, Scheduling, Communication, Search
- ✅ Optioneel: compositional intents voor flexibiliteit

**GGZ-Specifieke Overwegingen:**
1. **Safety-first** → Risico/crisis patterns ALTIJD eerst checken
2. **Psychofarmaca** → Medicatie patterns voor GGZ-specifieke medicijnen
3. **ROM integratie** → Assessment patterns voor vragenlijsten
4. **Behandelplan** → Treatment patterns voor evidence-based interventies

**Grootste Impact:**
1. **Safety priority** → Kritieke signalen nooit gemist
2. **Category hierarchie** → 4-5x sneller, schaalbaar tot 40+ intents
3. **GGZ vocabulary** → Hogere accuracy door domein-specifieke patterns

**Effort vs Gain:**

| Strategie | Effort | Performance | Safety | When to Implement |
|-----------|--------|-------------|--------|-------------------|
| Safety priority | 2 uur | - | ⭐⭐⭐⭐⭐ | ✅ Now (kritiek) |
| Pattern optimization | 2 uur | 30-40% | - | ✅ Now |
| GGZ hierarchie | 3 dagen | 4-5x | ⭐⭐⭐ | When >15 intents |
| Compositional GGZ | 1 week | 8-10x | ⭐⭐⭐⭐ | When >40 intents |

**GGZ Intent Totalen:**

| Categorie | Intents | Kritiek? |
|-----------|---------|----------|
| Safety | 5 | 🚨 Ja |
| Treatment | 5 | Nee |
| Observation | 6 | Nee |
| Medication | 4 | Nee |
| Assessment | 6 | Nee |
| Scheduling | 4 | Nee |
| Communication | 4 | Nee |
| Search | 4 | Nee |
| **TOTAAL** | **38** | - |

**Quick Decision Matrix (GGZ):**

```
MVP (7 intents)?
  → Pattern optimization + Safety priority patterns

Uitbreiding (15+ intents)?
  → Implement GGZ category hierarchie

Volledig EPD (38+ intents)?
  → Consider compositional intents met GGZ vocabulary

Bij twijfel?
  → AI fallback met GGZ-specifieke categorization prompt
```

---

## 📋 GGZ Intent Overzicht

### Nieuwe Intents (29 totaal)

| Categorie | Intent | Voorbeeld spraakcommando |
|-----------|--------|--------------------------|
| **Safety** | `risicotaxatie` | "Inschat suïciderisico bij Jan" |
| | `signaleringsplan` | "Maak signaleringsplan" |
| | `veiligheidsplan` | "Update veiligheidsplan" |
| | `crisis_protocol` | "Start crisisprotocol" |
| | `dwangmaatregel` | "Registreer separatie" |
| **Treatment** | `behandelplan_maken` | "Maak behandelplan" |
| | `behandelplan_evalueren` | "Evalueer behandeling" |
| | `behandelplan_afsluiten` | "Sluit behandeling af" |
| | `doel_toevoegen` | "Voeg behandeldoel toe" |
| | `interventie_plannen` | "Plan CGT sessie" |
| **Observation** | `observatie_gedrag` | "Gedrag: onrustig vandaag" |
| | `observatie_stemming` | "Stemming: somber" |
| | `observatie_psychotisch` | "Psychotische symptomen gemeld" |
| | `voortgangsrapportage` | "Voortgang rapporteren" |
| | `mdo_verslag` | "MDO verslag maken" |
| **Medication** | `medicatie_bijwerking` | "Bijwerking sertraline melden" |
| | `therapietrouw` | "Therapietrouw probleem" |
| **Assessment** | `rom_afnemen` | "ROM afnemen" |
| | `rom_bekijken` | "ROM scores bekijken" |
| | `leefgebieden` | "Leefgebieden scoren" |
| | `screening` | "Screening uitvoeren" |
| | `zorgvraagtypering` | "Zorgvraagtypering bepalen" |
| **Communication** | `brief_huisarts` | "Brief naar huisarts" |
| | `consult_aanvraag` | "Consult psychiater aanvragen" |
| | `ontslagbrief` | "Ontslagbrief maken" |
| **Search** | `patient_info` | "Info over Jan" |
| | `medicatie_info` | "Info sertraline" |
| | `protocol_info` | "Zorgstandaard depressie" |

### Behouden van MVP (7 intents)

| Intent | Status |
|--------|--------|
| `dagnotitie` | ✅ Behouden |
| `zoeken` | ✅ Behouden |
| `overdracht` | ✅ Behouden |
| `agenda_query` | ✅ Behouden |
| `create_appointment` | ✅ Behouden |
| `cancel_appointment` | ✅ Behouden |
| `reschedule_appointment` | ✅ Behouden |

