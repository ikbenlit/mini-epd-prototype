# Onderzoeksverslag: UX/UI Patterns voor Ephemeral UI EPD

**Document:** UX/UI Research & Best Practices
**Datum:** december 2024
**Status:** Definitief
**Onderzoeksmethode:** Desk research, marktanalyse, design pattern analyse

---

## 1. Executive Summary

Dit onderzoek analyseert de beste UX/UI patterns voor het Ephemeral UI EPD concept. De conclusie is dat een **hybrid approach** de beste keuze is: natural language input gecombineerd met voorgedefinieerde, gestructureerde UI-bouwblokken.

**Kernbevindingen:**
- Ambient Clinical Intelligence is de dominante trend (markt groeit 37% per jaar)
- Pure conversational UI is te onvoorspelbaar voor zorg
- Command palette pattern (cmdk) is de beste basis voor intent-input
- Two-tier intent classification (local + AI fallback) biedt optimale snelheid
- Fallback UI is essentieel voor vertrouwen

---

## 2. Marktanalyse: Ambient Clinical Intelligence

### 2.1 Marktomvang & Groei

| Metric | Waarde | Bron |
|--------|--------|------|
| Marktwaarde 2024 | $468 miljoen | Nova One Advisor |
| Verwacht 2034 | $11,5 miljard | Nova One Advisor |
| CAGR | 37,87% | Nova One Advisor |
| Clinical documentation share | 18% van markt | Nova One Advisor |
| NLP-powered agents | 33% marktaandeel | Nova One Advisor |

### 2.2 Belangrijkste Spelers

| Vendor | Product | Aanpak | Adoptie |
|--------|---------|--------|---------|
| **Microsoft/Nuance** | DAX Copilot | Ambient listening → full note | Stanford, Kaiser |
| **Suki AI** | Suki Assistant | Voice commands + dictatie | 72% sneller documentatie |
| **Abridge** | Abridge | Ambient → structured notes | Sutter Health, UPMC |
| **DeepScribe** | DeepScribe | Specialty-focused (oncologie) | Enterprise |
| **Ambience** | AI Scribe | Ambient + Epic integratie | Cleveland Clinic (4000+ artsen) |

### 2.3 Adoptie bij Grote Zorginstellingen (2024)

| Instelling | Tool | Schaal | Resultaat |
|------------|------|--------|-----------|
| Stanford Health | DAX Copilot | Volledig uitgerold | Significante tijdsbesparing |
| Cleveland Clinic | Ambience AI Scribe | 4000+ providers | 80+ specialismen |
| Sutter Health | Abridge | 100 clinici pilot | April 2024 start |
| Kaiser/TPMG | Ambient AI | 10.000 artsen | 303.266 encounters in 10 weken |

### 2.4 Kernprobleem dat Wordt Opgelost

> "Artsen besteden tot **4,5 uur per dag** aan EHR data invoer"
> — NEJM Catalyst Research

> "De flow van EHR systemen matcht niet met de workflow van de clinicus, wat frustratie en tijdverlies veroorzaakt"
> — Healthcare IT News

---

## 3. UX Pattern Analyse

### 3.1 Ephemeral UI Concept

**Definitie** (Hilal Koyuncu, ex-Google designer):
> "UI die alleen verschijnt wanneer nodig en verdwijnt na gebruik"

**Kenmerken:**
| Eigenschap | Beschrijving |
|------------|--------------|
| On-demand | Interface materialiseert bij intentie |
| Hyper-contextual | Gebouwd voor één gebruiker's momentane doel |
| Transient | Vernietigd wanneer doel bereikt is |
| Task-optimal | Elk element dient het directe doel |

**Voordelen:**
- Zero learning curve
- Infinite scalability
- Accessibility by default (past zich aan)

**Risico's:**
> "Constant veranderende UIs kunnen usability problemen veroorzaken. Gebruikers leunen op design standaarden."
> — Roger Wong, Generative UI Analysis

**Mitigatie:** Gebruik voorgedefinieerde bouwblokken, geen AI-gegenereerde UI.

### 3.2 Command Palette Pattern

**Oorsprong:** Sublime Text, VS Code (IDE's voor developers)

**Moderne adoptie:** Superhuman, Linear, Figma, Slack, Raycast, Notion

**Best Practices (Superhuman):**

| Principe | Implementatie |
|----------|---------------|
| Fuzzy search | "jn dvr" matcht "Jan de Vries" |
| Recent first | Laatst gebruikte items bovenaan |
| Keyboard-first | Enter = bevestigen, Esc = annuleren |
| Single source | Alles op één plek |
| Contextual | Relevante acties per context |

**Wanneer gebruiken:**
- Producten met veel features
- Power users die efficiency waarderen
- Keyboard-heavy workflows

**Libraries:**
| Library | Kenmerken |
|---------|-----------|
| cmdk | Fast, unstyled, React, headless |
| Kbar | Portable, extensible |
| Kmenu | Animated, accessible |

### 3.3 Natural Language Interface (NLI) Patterns

**Definitie:**
> "Een platform dat interactie tussen computer en mens mogelijk maakt via natuurlijke taal"

**Best Practices:**

| Principe | Beschrijving |
|----------|--------------|
| Focus op intent | Begrijp wat de gebruiker wil bereiken |
| Handle ambiguity | Vraag verduidelijking bij onduidelijkheid |
| Define scope | Maak duidelijk wat het systeem kan |
| Confidence thresholds | Stel drempels in voor zekerheid |
| Balanced training | Voorkom bias in intent herkenning |

**Reader vs Writer Intents:**
- **Reader intent:** Informatie ophalen, geen actie
- **Writer intent:** Actie uitvoeren, geen informatie tonen

**Belangrijke waarschuwing:**
> "NLIs presteren het best in nauw gedefinieerde domeinen. Open-ended interactions overschrijden hun capaciteiten."
> — Explosion AI

### 3.4 Voice Interface Patterns

**Push-to-Talk vs Ambient:**

| Aspect | Push-to-Talk | Ambient Listening |
|--------|--------------|-------------------|
| Privacy | Hoog (expliciet) | Laag (altijd aan) |
| Nauwkeurigheid | Hoger (gericht) | Lager (ruis) |
| Gebruiksgemak | Actie vereist | Hands-free |
| Batterij/resources | Laag | Hoog |
| Enterprise adoptie | Growing | Dominant (Suki, Abridge) |

**Aanbeveling voor MVP:** Push-to-talk (privacy, nauwkeurigheid, eenvoudiger te bouwen)

---

## 4. Healthcare UX Trends 2024-2025

### 4.1 Dominante Trends

| Trend | Beschrijving | Relevantie |
|-------|--------------|------------|
| **AI-powered documentation** | Ambient listening, auto-notes | Direct relevant |
| **Reduced cognitive load** | Minder klikken, minder schermen | Kernprincipe |
| **Voice-first input** | Hands-free tijdens zorg | Must-have |
| **Personalization** | Interface past zich aan gebruiker aan | Nice-to-have |
| **Mobile-responsive** | Werkt op alle devices | Vereist |

### 4.2 Anti-Patterns (Wat te Vermijden)

| Anti-pattern | Waarom slecht | Alternatief |
|--------------|---------------|-------------|
| Modal op modal | Cognitive overload | Max 1 laag diep |
| "Weet je het zeker?" | Vertraagt, twijfel zaaien | Undo in plaats van confirm |
| Verplichte velden overal | Blokkeert snelle invoer | Alleen essentiële velden |
| Loading spinners | Wachten = frustratie | Optimistic UI |
| Sessie verlopen | Werk kwijt | Auto-save drafts |

### 4.3 EHR-Specifieke UX Principes

**Van Arkenea EHR Interface Guide:**
- Streamlined dashboards met customizable workflows
- Responsive designs voor verschillende schermgroottes
- Enhanced visual hierarchy met betere typografie
- Eliminatie van onnodige klikken en context switching
- Generous white space

---

## 5. Aanbevolen Architectuur

### 5.1 Hybrid Approach

De beste UX combineert:
1. **Natural language input** (command palette + voice)
2. **Structured UI output** (voorgedefinieerde bouwblokken)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   INPUT LAYER: Natural Language                             │
│   ─────────────────────────────────────────────────────     │
│   "notitie jan: medicatie gegeven"                          │
│                                                             │
│              ↓ Intent Classification                        │
│                                                             │
│   OUTPUT LAYER: Structured UI                               │
│   ─────────────────────────────────────────────────────     │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Patient: [Jan de Vries ▼]     ← pre-filled          │   │
│   │ Categorie: [Medicatie ▼]      ← pre-filled          │   │
│   │ Tekst: medicatie gegeven      ← pre-filled          │   │
│   │                                                      │   │
│   │ [Opslaan]  [Aanpassen]                              │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Waarom hybrid:**
- Natural language voor snelle input
- Structured UI voor verificatie en correctie
- Best of both worlds: snelheid + controle

### 5.2 Two-Tier Intent Classification

```
┌─────────────────────────────────────────────────────────────┐
│ TIER 1: Local Pattern Matching (<50ms)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Input              → Intent         → Entities              │
│ ─────────────────────────────────────────────────────────   │
│ "notitie jan"      → dagnotitie     → patient: jan          │
│ "zoek marie"       → zoeken         → query: marie          │
│ "overdracht"       → overdracht     → (none)                │
│ "gesprek met piet" → rapportage     → patient: piet         │
│                                                             │
│ Confidence: >0.9 → Direct uitvoeren                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
              Als geen match of <0.9 confidence
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ TIER 2: AI Classification (<500ms)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Input: "ik heb net iets besproken"                          │
│                                                             │
│ AI Output:                                                  │
│ {                                                           │
│   "intent": "rapportage",                                   │
│   "confidence": 0.75,                                       │
│   "clarification_needed": true,                             │
│   "clarification": "Met welke patiënt?"                     │
│ }                                                           │
│                                                             │
│ 0.7-0.9 → "Bedoelde je...?" met opties                     │
│ <0.7   → Fallback naar visuele picker                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 UI Layout Aanbeveling

```
┌─────────────────────────────────────────────────────────────┐
│                    COMMAND CENTER                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🎤  Wat wil je doen?                     [Cmd+K]    │   │
│  │     ________________________________________________│   │
│  │                                                      │   │
│  │  💡 notitie jan · zoek marie · overdracht           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Context: Ochtend dienst · 8 patiënten · Dr. Jansen        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │         ACTIEF BOUWBLOK (ephemeral)                 │   │
│  │                                                      │   │
│  │  - Voorgedefinieerde structured form                │   │
│  │  - Pre-filled velden highlighted (gele flash)       │   │
│  │  - Minimal required fields                          │   │
│  │  - 1-click save                                     │   │
│  │  - Undo beschikbaar (geen confirm dialog)           │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Recent: [Jan ✓ 14:32] [Marie ✓ 14:28] [Overdracht 14:00]  │
│                                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│  │  📝    │ │  🔍    │ │  📋    │ │  🔄    │  FALLBACK    │
│  │Notitie │ │ Zoeken │ │Rapport │ │Overdr. │  PICKER      │
│  └────────┘ └────────┘ └────────┘ └────────┘  (altijd)    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Differentiatie t.o.v. Markt

### 6.1 Vergelijking met Bestaande Oplossingen

| Aspect | Suki/Abridge/DAX | Ephemeral UI EPD |
|--------|------------------|------------------|
| Luistermodus | Ambient (altijd aan) | Push-to-talk (expliciet) |
| Output | Full generated notes | Pre-filled structured forms |
| Pricing | Enterprise ($$$) | Open source / self-hosted |
| Markt | US healthcare | Nederlandse GGZ |
| Scope | Alleen documentatie | Multi-task intent routing |
| Verificatie | Post-hoc review | Inline confirmation |
| EHR integratie | Epic, Cerner focus | Supabase (eigen) |

### 6.2 Unique Selling Points

1. **Intent-based routing** - Niet alleen transcriberen, maar routeren naar juiste bouwblok
2. **Pre-fill magic** - Velden automatisch ingevuld, gebruiker bevestigt alleen
3. **GGZ vocabulaire** - Getraind op Nederlandse GGZ terminologie
4. **Privacy-first** - Push-to-talk, geen ambient listening
5. **Open architectuur** - Niet locked-in bij enterprise vendor

---

## 7. Implementatie Aanbevelingen

### 7.1 Technology Stack

| Component | Aanbeveling | Rationale |
|-----------|-------------|-----------|
| Command input | cmdk library | Industry standard, headless, accessible |
| Voice | Deepgram (bestaand) | Al geïntegreerd, goed Nederlands |
| Intent (local) | Regex + keyword matching | <50ms, geen API call |
| Intent (AI) | Claude API | Al geïntegreerd, goed Nederlands |
| State | Zustand | Lightweight, geen provider nesting |
| UI blocks | shadcn/ui (bestaand) | Consistent met rest van app |

### 7.2 Implementatie Volgorde

| Fase | Component | Prioriteit |
|------|-----------|------------|
| 1 | Command Center layout | Must have |
| 1 | Fallback picker | Must have |
| 1 | Local intent matching | Must have |
| 2 | Voice input integratie | Must have |
| 2 | Dagnotitie block | Must have |
| 2 | Zoeken block | Must have |
| 3 | AI intent fallback | Should have |
| 3 | Rapportage block | Should have |
| 4 | Overdracht block | Could have |
| 4 | Animaties & polish | Could have |

### 7.3 Success Metrics

| Metric | Target | Meetmethode |
|--------|--------|-------------|
| Time-to-first-input | <2 sec | Timestamp logging |
| Task completion (notitie) | <30 sec | Timestamp logging |
| Intent accuracy | >90% | Correct block / total |
| Fallback usage | <15% | Picker clicks / total |
| Voice adoption | >40% | Voice / total inputs |

---

## 8. Bronnen

### Marktonderzoek
- [AI Voice Agents in Healthcare Market](https://www.novaoneadvisor.com/report/ai-voice-agents-in-healthcare-market) - Nova One Advisor
- [Healthcare UX/UI Design Trends 2025](https://www.excellentwebworld.com/healthcare-ux-ui-design-trends/) - Excellent WebWorld
- [AI and Healthcare UX/UI 2024-2025](https://www.graphitedigital.com/insights/ai-impact-ux-ui-design-healthcare) - Graphite Digital

### Ambient Clinical Intelligence
- [Stanford DAX Implementation](https://med.stanford.edu/news/all-news/2024/03/ambient-listening-notes.html) - Stanford Medicine
- [Cleveland Clinic Ambient AI](https://consultqd.clevelandclinic.org/less-typing-more-talking-how-ambient-ai-is-reshaping-clinical-workflow-at-cleveland-clinic) - Cleveland Clinic
- [Ambient AI Scribes - NEJM](https://catalyst.nejm.org/doi/full/10.1056/CAT.23.0404) - NEJM Catalyst
- [Ambient Listening in Healthcare](https://healthtechmagazine.net/article/2024/08/ambient-listening-in-healthcare-perfcon) - HealthTech Magazine

### Ephemeral UI
- [Ephemeral UI in AI-Generated Interfaces](https://isolutions.medium.com/ephemeral-ui-in-ai-generated-on-demand-interfaces-81dbc8cd4579) - iSolutions
- [Generative UI and the Ephemeral Interface](https://rogerwong.me/2025/11/generative-ui-and-the-ephemeral-interface/) - Roger Wong
- [Ephemeral Web-Based Applications](https://www.nngroup.com/articles/ephemeral-web-based-applications/) - Nielsen Norman Group
- [Future of AI UI/UX: Ephemeral Interfaces](https://hertzfelt.io/blog/the-future-of-ai-ui-ux-ephemeral-interfaces-and-stateless-design-paradigms) - Hertzfelt Labs

### Command Palette
- [Command Palette UX Patterns](https://medium.com/design-bootcamp/command-palette-ux-patterns-1-d6b6e68f30c1) - Alicja Suska
- [How to Build a Remarkable Command Palette](https://blog.superhuman.com/how-to-build-a-remarkable-command-palette/) - Superhuman
- [Command Palette UI Design](https://mobbin.com/glossary/command-palette) - Mobbin
- [Command Palette Resources](https://www.commandpalette.org/) - commandpalette.org

### Natural Language Interfaces
- [5 Principles for Good NLU Design](https://www.voiceflow.com/pathways/5-principles-for-good-natural-language-understanding-nlu-design) - Voiceflow
- [Natural Language Interface](https://www.uxtweak.com/ux-glossary/natural-language-interface/) - UXtweak
- [A Natural Language UI is Just a UI](https://explosion.ai/blog/natural-user-interface) - Explosion AI

### Healthcare AI Vendors
- [Suki AI](https://www.suki.ai/) - Suki Assistant
- [DeepScribe](https://www.deepscribe.ai/resources/best-ai-medical-scribes) - AI Medical Scribes
- [Abridge](https://www.trendingaitools.com/ai-tools/abridge/) - Clinical Documentation

### EHR Design
- [EHR Interface Design Guide 2026](https://arkenea.com/blog/ehr-interface/) - Arkenea
- [EMR/EHR UI/UX Principles](https://www.purrweb.com/blog/emr-ehr-interface-design/) - Purrweb
- [EHR Redesign for Burnout](https://www.healthcareitnews.com/news/pandemic-era-burnout-how-ehr-vendors-are-redesigning-ui-and-ux-battle-stress) - Healthcare IT News

---

## 9. Conclusie

De beste UX/UI voor het Ephemeral UI EPD is een **hybrid approach**:

1. **Input:** Command palette (cmdk) + push-to-talk voice
2. **Processing:** Two-tier intent classification (local-first, AI-fallback)
3. **Output:** Voorgedefinieerde, structured UI-bouwblokken met pre-fill
4. **Safety net:** Altijd zichtbare fallback picker

Deze aanpak combineert:
- De snelheid van natural language input
- De voorspelbaarheid van structured UI
- De betrouwbaarheid van voorgedefinieerde componenten
- De flexibiliteit van AI-assisted intent recognition

Het resultaat: een interface die **voelt als magie** ("het begrijpt me!") maar **werkt als een betrouwbaar tool** (geen verrassingen, altijd een uitweg).

---

*Onderzoeksverslag gegenereerd op basis van desk research december 2024*
