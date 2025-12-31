# Bouwplan — Cortex Intent System V2

**Projectnaam:** Cortex V2 - Agentic Intent Architecture
**Versie:** v1.0
**Datum:** 30-12-2025
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

## 2. Uitgangspunten

### 2.1 Technische Stack

| Component | Technologie | Argumentatie |
|-----------|-------------|--------------|
| **Frontend** | Next.js 15, React, TailwindCSS | Bestaande stack, App Router |
| **Backend** | Next.js API Routes | Co-located met frontend |
| **Database** | Supabase (PostgreSQL) | Realtime, RLS, auth included |
| **AI Model** | Claude 3.5 Haiku | Snel (~400ms), goedkoop, excellent Nederlands |
| **State** | Zustand | Lightweight, devtools, persist |
| **UI** | shadcn/ui | Bestaande component library |

### 2.2 Projectkaders

| Kader | Waarde |
|-------|--------|
| **Type release** | MVP / Public Prototype ("Build in Public") |
| **Bouwtijd** | 11-15 werkdagen |
| **Budget** | N.v.t. (prototype) |
| **Team** | 1 developer + AI-assistentie |
| **Data** | Mock-data, geen productie EPD-koppeling |
| **Doel** | Demonstratie van "Agency" concept |

### 2.3 Programmeer Uitgangspunten

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

## 3. Epics & Stories Overzicht

### MVP Scope (✅ In Scope)

| Epic ID | Titel | Doel | Status | Stories | Story Points |
|---------|-------|------|--------|---------|--------------|
| **E0** | Foundation & Context | Types, API, feature flags | ⏳ To Do | 5 | 8 SP |
| **E1** | Reflex Arc (Layer 1) | Snelle lokale classificatie | ⏳ To Do | 4 | 6 SP |
| **E2** | Intent Orchestrator (Layer 2) | AI-gedreven multi-intent | ⏳ To Do | 5 | 13 SP |
| **E3** | UI Components | ActionChainCard, ClarificationCard | ⏳ To Do | 4 | 8 SP |
| **E4** | Nudge MVP (Layer 3) | Proactieve suggesties | ⏳ To Do | 3 | 5 SP |
| **E5** | Integration & Polish | End-to-end flow, testing | ⏳ To Do | 4 | 8 SP |

**Totaal MVP: 25 stories, 48 Story Points**

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

## 4. Epics & Stories (Uitwerking)

### Epic 0 — Foundation & Context

**Epic Doel:** Werkende basis met types, context API en feature flags voor gecontroleerde rollout.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E0.S1 | **CortexContext types** definiëren | Types in `lib/cortex/types.ts` voor context, intents, chains | ⏳ | — | 2 |
| E0.S2 | **GET /api/cortex/context** endpoint | Retourneert actieve patiënt, agenda, recente acties | ⏳ | E0.S1 | 2 |
| E0.S3 | **Feature flags** setup | `CORTEX_V2_ENABLED`, `CORTEX_MULTI_INTENT`, `CORTEX_NUDGE` | ⏳ | — | 1 |
| E0.S4 | **CortexStore V2** extensions | Zustand store met context, chains, suggestions state | ⏳ | E0.S1 | 2 |
| E0.S5 | **Classification logging** utility | Dev logging + production sanitization | ⏳ | E0.S1 | 1 |

**Technical Notes:**
- Types gebaseerd op TO sectie 4.1
- Context injection voor AI classificatie
- Feature flags voor graduele rollout

**Deliverable:** Context beschikbaar, types gedefinieerd, backward compatible

---

### Epic 1 — Reflex Arc (Layer 1)

**Epic Doel:** Razendsnelle (<20ms) afhandeling van simpele, eenduidige commando's.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E1.S1 | **Pattern matching** implementeren | Regex patterns voor alle intent types met weights | ⏳ | E0.S1 | 2 |
| E1.S2 | **Escalatie triggers** detectie | Multi-intent signals, context signals, relative time | ⏳ | E1.S1 | 2 |
| E1.S3 | **Ambiguity detection** | Top-2 score delta < 0.1 → escaleer | ⏳ | E1.S1 | 1 |
| E1.S4 | **Unit tests** Reflex classifier | Test suite voor simpele en complexe inputs | ⏳ | E1.S1-S3 | 1 |

**Technical Notes:**
- Confidence threshold: >= 0.7 voor lokale afhandeling
- Escalatie redenen: `low_confidence`, `ambiguous`, `multi_intent_detected`, `needs_context`, `relative_time`
- Implementatie in `lib/cortex/reflex-classifier.ts`

**Escalatie Triggers:**
```
Multi-intent:     /\b(en|daarna|ook|eerst|dan|vervolgens)\b/i
Context:          /\b(hij|zij|hem|haar|zijn|die|deze|dat|dezelfde)\b/i
Relatieve tijd:   /\b(morgen|overmorgen|volgende week|over \d+ dagen?)\b/i
```

**Deliverable:** Simpele commando's werken direct (<20ms)

---

### Epic 2 — Intent Orchestrator (Layer 2)

**Epic Doel:** AI-gedreven analyse voor complexe zinnen, multi-intents en context resolution.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E2.S1 | **System prompt** voor Orchestrator | Prompt met context, intent types, output format | ⏳ | E0.S1 | 2 |
| E2.S2 | **Context formatting** voor AI | `formatContextForPrompt()` functie | ⏳ | E0.S2 | 1 |
| E2.S3 | **AI classification** endpoint | `classifyWithOrchestrator()` met Claude 3.5 Haiku | ⏳ | E2.S1, E2.S2 | 3 |
| E2.S4 | **IntentChain parsing** | JSON response naar IntentChain met actions | ⏳ | E2.S3 | 2 |
| E2.S5 | **POST /api/cortex/classify** | Hybrid endpoint: Reflex → Orchestrator fallback | ⏳ | E1.S1-S3, E2.S3-S4 | 3 |
| E2.S6 | **Graceful fallback** | Bij AI failure → fallback naar Reflex-only | ⏳ | E2.S5 | 2 |

**Technical Notes:**
- Model: `claude-3-5-haiku-20241022`
- Temperature: 0 voor consistente output
- Max tokens: 512
- Fallback bij Anthropic 503 → Reflex-only mode

**AI Output Format:**
```json
{
  "actions": [{ "intent": "...", "confidence": 0.95, "entities": {...} }],
  "reasoning": "...",
  "needsClarification": false
}
```

**Deliverable:** "Zeg Jan af en maak notitie" wordt correct geparsed naar 2 acties

---

### Epic 3 — UI Components

**Epic Doel:** Visuele feedback voor multi-intent flows en clarification.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E3.S1 | **ActionChainCard** component | Stacked cards met sequence, status, confidence | ⏳ | E0.S1 | 3 |
| E3.S2 | **ActionItem** sub-component | Status icons, confirmation buttons, error states | ⏳ | E3.S1 | 2 |
| E3.S3 | **ClarificationCard** component | Vraag + keuze-knoppen bij ambigue input | ⏳ | — | 2 |
| E3.S4 | **Processing indicator** | Spinner/skeleton bij AI-acties | ⏳ | — | 1 |

**Technical Notes:**
- Status icons: pending, confirming, executing, success, failed, skipped
- Confidence badges: groen (>=0.9), amber (0.7-0.9), rood (<0.7)
- Collapsible AI reasoning

**Component Hierarchy:**
```
ActionChainCard
├── Header (aantal acties)
├── ActionItem (per actie)
│   ├── Sequence number
│   ├── Status icon
│   ├── Intent label
│   ├── Entity preview
│   ├── Confidence badge
│   └── Confirmation/Error buttons
└── AI Reasoning (collapsible)
```

**Deliverable:** Multi-intent flows visueel weergegeven

---

### Epic 4 — Nudge MVP (Layer 3)

**Epic Doel:** Proactieve suggesties na succesvolle acties (proof of concept).

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E4.S1 | **Protocol rules** definiëren | Wondzorg-controle regel (hardcoded) | ⏳ | E0.S1 | 1 |
| E4.S2 | **evaluateNudge** functie | Check protocol rules na actie completion | ⏳ | E4.S1 | 2 |
| E4.S3 | **NudgeToast** component | Toast met countdown timer, accept/dismiss | ⏳ | E0.S4 | 2 |

**Technical Notes:**
- MVP: alleen wondzorg-controle protocol
- Toast expiry: 5 minuten
- Priority styling: high (red), medium (amber), low (blue)

**Demo Case:**
```
Actie: Notitie "wond verzorgd" → Suggestie: "Wondcontrole inplannen over 3 dagen?"
```

**Deliverable:** Proactieve suggestie getoond na wondzorg notitie

---

### Epic 5 — Integration & Polish

**Epic Doel:** End-to-end flow werkend, getest en demo-ready.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E5.S1 | **CommandCenter V3** integratie | ActionChainCard, NudgeToast in chat panel | ⏳ | E3, E4 | 3 |
| E5.S2 | **Chain execution** flow | Sequential action execution met confirmations | ⏳ | E5.S1 | 2 |
| E5.S3 | **Integration tests** | E2E tests voor hele flow | ⏳ | E5.S1-S2 | 2 |
| E5.S4 | **Demo scenario** voorbereiden | Happy path + edge cases gedocumenteerd | ⏳ | E5.S3 | 1 |

**Technical Notes:**
- Backward compatible met V1 via feature flags
- Test dataset met 50+ zinnen (single, multi, context-dependent, ambiguous)

**Demo Flow (5 minuten):**
1. Simpel commando → Reflex (direct)
2. Multi-intent commando → Orchestrator (ActionChainCard)
3. Context-dependent → Pronoun resolution
4. Wondzorg notitie → Nudge suggestie

**Deliverable:** Demo-ready prototype

---

## 5. Kwaliteit & Testplan

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

## 6. Demo & Presentatieplan

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

## 7. Risico's & Mitigatie

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

## 8. MVP User Stories Mapping

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

## 9. Succescriteria

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

## 10. Referenties

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

## 11. Glossary

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
