# Product Requirements Document (PRD) – Cortex V2

**Projectnaam:** Cortex Intent System V2
**Versie:** v1.0
**Datum:** 30-12-2025
**Auteur:** Colin Lit (Antigravity AI)

---

## 1. Doelstelling

**Waarom bouwen we dit?**

Het huidige Cortex systeem (V1) is **reactief**: de gebruiker geeft een commando, het systeem voert uit. Hoewel dit snel werkt (<100ms), mist het de intelligentie die zorgprofessionals nodig hebben. V2 transformeert Cortex van een "spraakgestuurd toetsenbord" naar een **AI Collega**.

**Beoogd resultaat:**
> Een werkend prototype dat de kernwaarde van "Agency" demonstreert: het systeem begrijpt **meerdere intenties** in één zin, is **context-aware** (snapt wie "hij" is en wat "morgen" betekent), en geeft **proactieve suggesties** op basis van medische logica.

**Type release:** MVP / Public Prototype ("Build in Public")

**Kernprincipe:**
> "We stoppen met optimaliseren voor milliseconden en starten met optimaliseren voor intelligentie."

---

## 2. Doelgroep

### Primaire gebruikers

| Rol | Behoeften | Pijnpunten V1 |
|-----|-----------|---------------|
| **Verpleegkundige** | Snelheid, handen-vrij werken, administratieve lastenverlichting | "Ik moet drie losse commando's geven voor één situatie" |
| **Psycholoog** | Nuance, cliënt-context, emotionele lading | "Het systeem snapt niet dat 'uitzichtloos' een alarmsignaal is" |
| **Psychiater/Regiebehandelaar** | Veiligheid, medicatie-checks, overzicht | "Ik wil dat het systeem meedenkt over labwaardes en interacties" |

### Stakeholders

- **Product Owner:** Waarde aantonen, haalbaarheid bewaken
- **Developers:** Technische implementatie, AI-integratie
- **UX Designer:** "Invisible Interface" - minder frictie, meer begrip

### Gebruikersquote (uit UX simulatie)

> **Regiebehandelaar:** "'Ontlasten' betekent dat ik mijn *intentie* uitspreek, niet mijn *administratie*. Mijn intentie is 'Zorg voor Jan regelen'. De administratie (agenda, brief, notitie) is jullie probleem."

---

## 3. Kernfunctionaliteiten (MVP-scope)

### 3.1 The Three-Layer Cortex Model

| Layer | Functie | Latency | Voorbeeld |
|-------|---------|---------|-----------|
| **Layer 1: Reflex Arc** | Lokale regex voor simpele commando's | <20ms | "Agenda vandaag", "Zoek Jan" |
| **Layer 2: Intent Orchestrator** | AI-classificatie voor complexe/multi-intent zinnen | ~400ms | "Zeg Jan af en maak notitie: grieperig" |
| **Layer 3: Nudge Engine** | Proactieve suggesties na acties | async | "Wondcontrole inplannen over 3 dagen?" |

### 3.2 MVP Features

1. **Hybrid Architecture**
   - Naadloze switch tussen Reflex (lokaal) en Orchestrator (AI)
   - Confidence threshold: >= 0.7 voor lokale afhandeling
   - Ambiguity detection: escaleer bij top-2 score delta < 0.1

2. **Multi-Intent Support**
   - Herkenning van signaalwoorden: "en", "daarna", "ook", "eerst"
   - Opsplitsen in Action Chain met sequentiële uitvoering
   - UI: Stacked Cards met progressie-indicatie

3. **Context Awareness**
   - Pronoun resolution: "hij/zij" → actieve patiënt
   - Relatieve tijd: "morgen", "volgende week" → concrete datum
   - Context injection: ActivePatient, CurrentView, AgendaToday, RecentIntents

4. **UI Feedback**
   - Processing indicator bij AI-acties
   - ActionChainCard voor meerdere acties
   - ClarificationCard bij ambigue input

5. **Basic Nudge (Proof of Concept)**
   - Hardcoded protocol: Wondzorg → Wondcontrole suggestie
   - NudgeToast met accept/dismiss en countdown timer

### 3.3 Ondersteunde Intents

| Intent | Beschrijving | Layer |
|--------|--------------|-------|
| `dagnotitie` | Notitie/rapportage maken | Reflex + Orchestrator |
| `zoeken` | Patiënt zoeken | Reflex |
| `agenda_query` | Agenda bekijken | Reflex |
| `overdracht` | Dienst overdracht | Reflex |
| `create_appointment` | Afspraak maken | Orchestrator |
| `cancel_appointment` | Afspraak annuleren | Orchestrator |
| `reschedule_appointment` | Afspraak verzetten | Orchestrator |

---

## 4. Gebruikersflows (MVP-flows)

### Flow 1: Multi-Intent Commando

```
Gebruiker: "Zeg Jan af voor vandaag en maak notitie: hij heeft griep"
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ Layer 1 (Reflex): Detecteert "en" → Escaleer        │
└─────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ Layer 2 (Orchestrator): Parse naar 2 acties         │
│ 1. cancel_appointment (Jan, vandaag)                │
│ 2. dagnotitie (Jan, "hij heeft griep")              │
└─────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ UI: ActionChainCard                                 │
│ ┌─────────────────────────────────────┐             │
│ │ ✅ 1. Afspraak Jan geannuleerd      │             │
│ ├─────────────────────────────────────┤             │
│ │ ⏳ 2. Notitie: "hij heeft griep"    │             │
│ └─────────────────────────────────────┘             │
└─────────────────────────────────────────────────────┘
```

### Flow 2: Context-Aware Pronoun Resolution

```
Context: Patiënt "Marie de Vries" is geopend in dossier

Gebruiker: "Maak notitie voor haar: medicatie ingenomen"
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ Layer 2: Resolves "haar" → Marie de Vries           │
│ patientResolution: "pronoun"                        │
└─────────────────────────────────────────────────────┘
    │
    ▼
Notitie aangemaakt voor Marie de Vries
```

### Flow 3: Proactieve Suggestie (Nudge)

```
Gebruiker: "Notitie: wond verzorgd, ziet er goed uit"
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ Notitie opgeslagen ✅                                │
└─────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ Layer 3 (Nudge): Protocol "wondzorg-controle" match │
└─────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ NudgeToast (bottom-right)                           │
│ 💡 "Wondcontrole inplannen over 3 dagen?"           │
│ [Ja, doe maar] [Nee, bedankt]                       │
└─────────────────────────────────────────────────────┘
```

### Flow 4: Simpel Commando (Reflex)

```
Gebruiker: "Agenda vandaag"
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ Layer 1 (Reflex): Match "agenda" pattern            │
│ Confidence: 1.0 → Direct uitvoeren                  │
│ Latency: <20ms                                      │
└─────────────────────────────────────────────────────┘
    │
    ▼
Agenda artifact opent direct (geen spinner)
```

---

## 5. Niet in Scope

De volgende features vallen **bewust buiten** de MVP:

| Feature | Reden | Post-MVP? |
|---------|-------|-----------|
| **Complete medische protocollen** | Te complex voor prototype | Ja, rule-engine |
| **Rollback/Undo** | Vereist transactie-systeem | Ja |
| **Offline mode** | Prototype veronderstelt internet | Nee (low priority) |
| **Advanced error handling** | Retry-mechanismes, circuit breakers | Ja |
| **Analytics & learning** | Telemetry opslag, model training | Ja |
| **Productie-beveiliging** | NEN7510 compliance, audit logs | Ja (kritiek voor productie) |
| **Externe integraties** | Teams, ECD-koppelingen | Ja |
| **Adaptive confidence** | User-specific thresholds | Nice-to-have |
| **Sentiment analysis** | Emotionele lading detectie | Nice-to-have |

---

## 6. Succescriteria

### Functionele criteria

| Criterium | Target | Meetmethode |
|-----------|--------|-------------|
| Multi-intent herkenning | "X en Y" zinnen correct gesplitst | Test dataset (50+ zinnen) |
| Pronoun resolution | "hij/zij/hem/haar" correct resolved | Test met actieve patiënt context |
| Reflex hit rate | >70% lokaal afgehandeld | Logging metrics |
| AI latency p95 | <800ms | Performance monitoring |
| Nudge trigger | Wondzorg → suggestie getoond | Manual test |

### UX criteria

| Criterium | Target |
|-----------|--------|
| Geen "Ik begrijp het niet" | Altijd een poging tot begrip, eventueel met clarification |
| Processing feedback | Spinner bij AI-acties, geen "bevroren" scherm |
| Demo duur | Volledige flow demonstreerbaar in ≤5 minuten |

### Technische criteria

| Criterium | Target |
|-----------|--------|
| Reflex latency | <20ms |
| AI fallback werkt | Bij Anthropic 503 → graceful degradation naar Reflex |
| Geen PII in logs | Input gesanitized voor productie logging |

---

## 7. Risico's & Mitigatie

| Risico | Impact | Kans | Mitigatie |
|--------|--------|------|-----------|
| **AI output inconsistent** | Hoog | Middel | Strikte JSON schema, temperature=0, fallback to unknown |
| **Multi-intent parsing faalt** | Hoog | Laag | Uitgebreide test dataset, fallback naar single intent |
| **Scope creep** | Middel | Hoog | Strikte MVP scope, 6 user stories max |
| **Privacy breach (logs)** | Hoog | Laag | Input sanitization, geen PII in production logs |
| **Anthropic API down** | Middel | Laag | Graceful degradation naar Reflex-only mode |
| **Performance degradatie** | Middel | Laag | Caching, monitoring, threshold tuning |
| **False positive Nudge** | Laag | Middel | Specifieke regex, word boundaries, test edge cases |

---

## 8. Roadmap / Vervolg (Post-MVP)

### Fase 1: MVP (Nu)
- Hybrid architecture (Reflex + Orchestrator)
- Multi-intent support
- Context awareness
- Basic Nudge (wondzorg)

### Fase 2: Enhanced Nudge (Post-MVP)
- Meerdere protocol rules (medicatie, crisis)
- Admin UI voor rule management
- NLP/AI voor complexere matching

### Fase 3: Productie-ready
- NEN7510 compliance
- Audit logging
- Advanced error handling (retry, circuit breaker)
- Rollback support

### Fase 4: Intelligence
- Adaptive confidence (user-specific thresholds)
- Sentiment analysis
- Learning from corrections
- Predictive suggestions

### Fase 5: Integraties
- ECD-koppelingen (PinkRoccade, Nedap)
- Teams/Slack integratie
- Voice-first mobile app

---

## 9. Bijlagen & Referenties

### Gerelateerde documenten

| Document | Locatie | Beschrijving |
|----------|---------|--------------|
| FO Cortex V2 | `docs/intent/fo-cortex-intent-system-v2.md` | Functioneel ontwerp |
| TO Cortex V2 | `docs/intent/to-cortex-v2.md` | Technisch ontwerp |
| Architectuur V2 | `docs/intent/architecture-cortex-v2.md` | Uitgebreid architectuurplan |
| Haalbaarheidsanalyse | `docs/intent/haalbaarheidsanalyse-cortex-v2.md` | Gap analyse en effort schatting |
| MVP User Stories | `docs/intent/mvp-userstories-intent-system.md` | User stories en acceptatiecriteria |
| UX Evaluatie | `docs/intent/ux-evaluation-intent-scalability.md` | UX perspectief op architectuur |
| UX Simulatie | `docs/intent/ux-simulation-intent-next-level.md` | Brainstorm "Next Level" features |

### Tech stack

- **Frontend:** Next.js 15, React, TailwindCSS, shadcn/ui
- **State:** Zustand
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **AI:** Claude 3.5 Haiku (Anthropic)

### Versie historie

| Versie | Datum | Auteur | Wijzigingen |
|--------|-------|--------|-------------|
| 1.0 | 30-12-2025 | Colin Lit | Initieel document |
