# Haalbaarheidsanalyse: Swift Cortex V2

**Datum:** 29-12-2025
**Auteur:** Claude Code (Opus 4.5)
**Status:** Analyse compleet

---

## Executive Summary

**Conclusie: HAALBAAR met gefaseerde aanpak**

De Swift Cortex V2 architectuur is **goed haalbaar** binnen de bestaande codebase. De huidige implementatie biedt een solide fundament met ~70% van de benodigde infrastructuur al aanwezig. De voorgestelde V2 architectuur sluit naadloos aan op bestaande patterns.

| Aspect | Score | Toelichting |
|--------|-------|-------------|
| **Technische haalbaarheid** | 🟢 Hoog | Bestaande architectuur is compatibel |
| **Complexiteit** | 🟡 Middel | Multi-intent en Nudge zijn nieuwe concepten |
| **Risico** | 🟢 Laag | Incrementeel te bouwen, backward compatible |
| **MVP Scope** | 🟢 Realistisch | 6 user stories, goed afgebakend |

---

## 1. Vergelijking: Huidige Staat vs V2 Visie

### 1.1 Architectuur Mapping

| V2 Concept | Huidige Implementatie | Gap |
|------------|----------------------|-----|
| **Layer 1: Reflex Arc** | ✅ `intent-classifier.ts` (60 patterns) | Minimaal - voeg complexity detection toe |
| **Layer 2: Orchestrator** | ✅ `intent-classifier-ai.ts` (Haiku) | Middel - upgrade prompt voor multi-intent |
| **Layer 3: Nudge** | ❌ Niet aanwezig | Nieuw te bouwen |
| **Context Injection** | 🟡 Basis aanwezig (`activePatient`, `shift`) | Uitbreiden met `agendaToday`, `recentIntents` |
| **Multi-Intent Chains** | ❌ Single intent model | Data model refactor nodig |
| **Entity Extraction** | ✅ `entity-extractor.ts` | Minimaal - voeg `patientResolution` toe |
| **Date/Time Parsing** | ✅ `date-time-parser.ts` | Geen gap |

### 1.2 Bestaande Bestanden (Assets)

```
lib/cortex/
├── types.ts                 ✅ Basis types, uitbreiden met IntentChain
├── intent-classifier.ts     ✅ Layer 1 basis, voeg signals detection toe
├── intent-classifier-ai.ts  ✅ Layer 2 basis, upgrade prompt
├── entity-extractor.ts      ✅ Compleet, kleine uitbreiding
├── date-time-parser.ts      ✅ Compleet, geen wijzigingen
├── action-parser.ts         ✅ Refactor voor chains
├── chat-api.ts              ✅ Behouden
├── error-handler.ts         ✅ Recent toegevoegd
└── [NIEUW] reflex-classifier.ts   → Upgrade van intent-classifier
└── [NIEUW] orchestrator.ts        → Upgrade van intent-classifier-ai
└── [NIEUW] nudge.ts               → Nieuw te bouwen

stores/
└── cortex-store.ts           ✅ Uitbreiden met chain state + suggestions

components/cortex/
├── chat/                    ✅ Bestaand, voeg ActionChainCard toe
├── artifacts/               ✅ Bestaand, geen wijzigingen
├── command-center/          ✅ Bestaand, voeg NudgeToast toe
└── [NIEUW] nudge-toast.tsx
└── [NIEUW] chat/action-chain-card.tsx
└── [NIEUW] chat/clarification-card.tsx
```

---

## 2. Gap Analyse per V2 Feature

### 2.1 Multi-Intent Support (US-MVP-01)

**Huidige situatie:**
```typescript
// Huidige single-intent response
interface ClassificationResult {
  intent: CortexIntent;
  confidence: number;
}
```

**V2 vereist:**
```typescript
// Multi-intent chain
interface IntentChain {
  actions: IntentAction[];  // Array i.p.v. single
  status: 'pending' | 'executing' | 'completed';
}
```

**Impact:**
- `types.ts`: Nieuwe interfaces toevoegen (~50 regels)
- `orchestrator.ts`: Nieuwe AI prompt met multi-intent instructies (~150 regels)
- `cortex-store.ts`: Chain state toevoegen (~30 regels)
- `action-chain-card.tsx`: Nieuwe UI component (~150 regels)

**Effort: M (Medium)**

---

### 2.2 Context Awareness (US-MVP-02, US-MVP-03)

**Huidige situatie:**
```typescript
// In chat API - basic context
context: {
  activePatient?: { id, first_name, last_name },
  shift?: ShiftType
}
```

**V2 vereist:**
```typescript
interface CortexContext {
  activePatient: { id, name, recentNotes?, upcomingAppointments? };
  currentView: string;
  shift: ShiftType;
  currentTime: Date;
  agendaToday: Appointment[];
  recentIntents: RecentIntent[];
}
```

**Impact:**
- Nieuwe `GET /api/cortex/context` endpoint (~80 regels)
- Context builder utility (~50 regels)
- Store uitbreiding voor context sync (~20 regels)

**Effort: S (Small)**

---

### 2.3 Hybrid Reflex/Cortex Switch (US-MVP-04, US-MVP-05)

**Huidige situatie:**
- `intent-classifier.ts` heeft al confidence threshold (0.8)
- AI fallback via `intent-classifier-ai.ts` werkt al

**V2 verschil:**
- Expliciete "complexity signals" detectie (multi-intent woorden: "en", "daarna")
- Context-afhankelijke woorden detectie ("hij", "haar", "deze")

**Impact:**
- Upgrade `intent-classifier.ts` → `reflex-classifier.ts` (~100 regels diff)
- Voeg `MULTI_INTENT_SIGNALS` en `CONTEXT_SIGNALS` regex arrays toe

**Effort: S (Small)** - Grootste deel al gebouwd

---

### 2.4 Nudge / Proactive Suggestions (US-MVP-06)

**Huidige situatie:**
- Niet aanwezig

**V2 vereist:**
- Protocol Rules database
- `evaluateNudge()` functie
- `NudgeToast` component
- Store state voor suggestions

**Impact:**
- `nudge.ts`: Nieuwe module (~200 regels)
- `nudge-toast.tsx`: Nieuw component (~100 regels)
- Store uitbreiding (~40 regels)
- Integratie in action execution flow

**Effort: L (Large)** - Volledig nieuw concept

---

## 3. Risico Analyse

### 3.1 Technische Risico's

| Risico | Impact | Kans | Mitigatie |
|--------|--------|------|-----------|
| AI Prompt instabiliteit | Multi-intent parsing faalt | Laag | Uitgebreide test dataset, fallback naar single |
| Performance degradatie | Latency >2s | Laag | Haiku is snel, cache context |
| State complexity | Race conditions | Middel | Zustand immer middleware, clear action flow |
| Backward compatibility | V1 features breken | Laag | Feature flags, adapter pattern |

### 3.2 Scope Risico's

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Feature creep | MVP te groot | Strikte scope (6 stories) |
| Protocol complexity | Nudge te ambitieus | Begin met 1 hardcoded regel |
| Over-engineering | Te veel abstractie | "Working software" first |

---

## 4. Implementatie Strategie

### 4.1 Aanbevolen Fasering

```
Fase 1: Foundation (Week 1)
├── CortexContext type definitie
├── GET /api/cortex/context endpoint
├── Reflex complexity detection upgrade
├── Feature flag: CORTEX_V2_ENABLED
└── Deliverable: Context beschikbaar, backward compatible

Fase 2: Multi-Intent (Week 2)
├── IntentChain types
├── Orchestrator AI prompt upgrade
├── ActionChainCard component
├── Store chain state
└── Deliverable: "Zeg af en maak notitie" werkt

Fase 3: Nudge MVP (Week 3)
├── 1 hardcoded protocol regel (wondzorg)
├── NudgeToast component
├── Trigger na dagnotitie
└── Deliverable: Proactieve suggestie demo

Fase 4: Polish (Week 4)
├── ClarificationCard component
├── Error handling
├── UI animaties
└── Deliverable: Demo-ready prototype
```

### 4.2 Backward Compatibility

De V2 architectuur kan naast V1 draaien:

```typescript
// lib/cortex/classifier-adapter.ts
export async function classifyIntent(input: string, context?: CortexContext) {
  if (!FEATURE_FLAGS.CORTEX_V2_ENABLED) {
    return classifyV1(input);  // Bestaande flow
  }

  const reflex = classifyWithReflex(input);
  if (!reflex.shouldEscalateToAI) {
    return buildLocalResult(input, reflex);
  }
  return classifyWithOrchestrator(input, context);
}
```

---

## 5. Effort Schatting

### 5.1 Per Component

| Component | Nieuw | Wijziging | Effort |
|-----------|-------|-----------|--------|
| `types.ts` | 150 regels | - | S |
| `reflex-classifier.ts` | 200 regels | upgrade | M |
| `orchestrator.ts` | 250 regels | upgrade | M |
| `nudge.ts` | 200 regels | nieuw | M |
| `cortex-store.ts` | - | +100 regels | S |
| `action-chain-card.tsx` | 180 regels | nieuw | M |
| `nudge-toast.tsx` | 100 regels | nieuw | S |
| `clarification-card.tsx` | 60 regels | nieuw | S |
| `/api/cortex/context` | 80 regels | nieuw | S |
| `/api/intent/classify` | 150 regels | nieuw | M |
| Tests | 300 regels | nieuw | M |

**Totaal: ~1770 nieuwe regels code**

### 5.2 Tijdsinschatting

| Fase | Effort | Complexiteit |
|------|--------|--------------|
| Fase 1: Foundation | 2-3 dagen | Laag |
| Fase 2: Multi-Intent | 3-4 dagen | Middel |
| Fase 3: Nudge | 2-3 dagen | Middel |
| Fase 4: Polish | 2-3 dagen | Laag |

**Totaal: 9-13 werkdagen voor MVP**

---

## 6. Aanbevelingen

### 6.1 DO's

1. **Start met Foundation** - Context injection is low-risk, high-value
2. **Gebruik feature flags** - Mogelijkheid om V2 uit te schakelen
3. **Test sentences dataset** - Bouw corpus van 50+ test zinnen voordat je multi-intent bouwt
4. **Behoud V1 patterns** - De 60 bestaande regex patterns zijn waardevol

### 6.2 DON'T's

1. **Niet alle protocollen tegelijk** - Begin met 1 Nudge regel
2. **Geen over-engineering** - De `ProtocolRule` interface is voor later
3. **Niet de store herschrijven** - Extend, niet replace
4. **Geen rollout strategie nodig** - Dit is een prototype

### 6.3 Quick Wins

1. **Context endpoint** - Direct te bouwen, verbetert AI kwaliteit
2. **Complexity detection** - 10 regels code, grote impact
3. **Processing indicator** - Al aanwezig (`isStreaming`), polish

---

## 7. Conclusie

### Haalbaarheid: ✅ JA

De Swift Cortex V2 architectuur is **volledig haalbaar** binnen de bestaande codebase:

1. **70% infrastructuur bestaat al** - Classifier, entity extraction, store, chat API
2. **Incrementeel te bouwen** - Elke fase levert werkende software
3. **Backward compatible** - Geen breaking changes voor bestaande features
4. **Realistische scope** - 6 user stories, ~1770 regels code
5. **Risico's beheersbaar** - Feature flags, fallbacks, tests

### Kritieke Succesfactoren

1. **Test dataset eerst** - Bouw 50+ test zinnen voordat je multi-intent implementeert
2. **Feature flags** - Zorg dat V2 uitschakelbaar is
3. **Iteratief bouwen** - Elke fase moet demo-baar zijn
4. **Scope discipline** - Niet alle protocollen, alleen wondzorg voor MVP

### Volgende Stap

Start met **Fase 1: Foundation** - de CortexContext API endpoint. Dit is:
- Low risk
- Onafhankelijk van andere features
- Direct waarde toevoegend aan bestaande AI classificatie
- In 1-2 dagen te bouwen

---

## Bijlagen

### A. Bestaande Code Referenties

| Bestand | Regels | Functie |
|---------|--------|---------|
| `lib/cortex/types.ts` | ~180 | Type definities |
| `lib/cortex/intent-classifier.ts` | ~200 | Layer 1 classifier |
| `lib/cortex/intent-classifier-ai.ts` | ~100 | Layer 2 AI fallback |
| `lib/cortex/entity-extractor.ts` | ~250 | Entity extraction |
| `lib/cortex/date-time-parser.ts` | ~200 | Datum/tijd parsing |
| `lib/cortex/action-parser.ts` | ~150 | Action routing |
| `stores/cortex-store.ts` | ~200 | Zustand state |

### B. V2 Documentatie Verwijzingen

- `architecture-swift-cortex-v2.md` - Uitgebreid technisch plan
- `fo-swift-intent-system-v2.md` - Functioneel ontwerp
- `intent-architecture-v2-proposal.md` - Architectuur voorstel
- `mvp-userstories-intent-system.md` - MVP scope

### C. Versie Historie

| Versie | Datum | Auteur | Wijzigingen |
|--------|-------|--------|-------------|
| 1.0 | 29-12-2025 | Claude Code | Initiële analyse |
