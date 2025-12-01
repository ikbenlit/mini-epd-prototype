# Product Requirements Document (PRD) — AI Documentatie Assistent

**Projectnaam:** Mini-ECD – AI Documentatie Assistent
**Versie:** v1.0
**Datum:** 01-12-2025
**Auteur:** Colin Lit
**Status:** Draft – Ready for Review

---

## 1. Doelstelling

**Doel van deze sectie:** Beschrijf waarom dit product wordt gebouwd en wat het beoogde resultaat is.

**Toelichting:** Een intelligente chat-assistent die eindgebruikers van het EPD helpt door vragen te beantwoorden op basis van de systeemdocumentatie. De focus ligt op het direct beschikbaar maken van informatie zonder dat gebruikers zelf door documentatie hoeven te zoeken.

> **Kernbelofte:** Direct antwoord op vragen over het EPD systeem, 24/7 beschikbaar via een handige chat widget.

**Type:** MVP Feature binnen Mini-ECD Prototype — Eerste AI-integratie als opstap naar complexere features (zoals AI Pre-fill Behandelplan)

**Relatie tot andere features:** Dit is de eerste AI-integratie die:
1. De Claude API infrastructuur opzet
2. Streaming responses implementeert
3. AI UI patterns (amber thema) in productie brengt
4. Als fundament dient voor toekomstige AI features

---

## 2. Doelgroep

**Doel:** Schets wie de eindgebruikers en stakeholders zijn.

### Primaire gebruikers

| Rol | Behoefte | Pijnpunt nu |
|-----|----------|-------------|
| **GGZ Behandelaar** | Snel antwoord op "hoe werkt X?" | Documentatie doorzoeken kost tijd |
| **Verpleegkundige** | Hulp bij onbekende functies | Moet collega's vragen of zelf uitzoeken |
| **Nieuwe medewerker** | Systeem leren kennen | Geen interactieve onboarding |

### Secundaire stakeholders

- **Demo-bezoekers:** Product owners/managers die AI-mogelijkheden willen zien
- **Developers:** Technische professionals geïnteresseerd in AI-integratie patterns
- **Support team:** (toekomst) Minder support tickets door self-service

---

## 3. Kernfunctionaliteiten (MVP-scope)

**Doel:** Afbakenen van de minimale werkende functies.

### 3.1 Floating Chat Widget

| Aspect | Specificatie |
|--------|--------------|
| **Positie** | Rechtsonder in EPD interface |
| **Trigger** | Amber knop met Sparkles icon |
| **Paneel** | 384px breed, max 80vh hoog |
| **Animatie** | Slide-in van onder + fade |

### 3.2 Documentatie-gebaseerde Antwoorden

| Aspect | Specificatie |
|--------|--------------|
| **Knowledge Base** | 14 MDX bestanden in `/content/nl/documentatie/` |
| **Taal** | Nederlands (input en output) |
| **Scope** | Alleen informatie uit documentatie |
| **Eerlijkheid** | "Weet ik niet" bij ontbrekende info |

**Beschikbare documentatie:**
- `authentication.mdx` - Inloggen en authenticatie
- `client-management.mdx` - Cliëntbeheer
- `intake-system.mdx` - Intake proces
- `screening-system.mdx` - Screening functionaliteit
- `treatment-planning.mdx` - Behandelplannen
- `interface-design.mdx` - UI uitleg
- `spraakgestuurde-verslaglegging.mdx` - Spraakfuncties
- `voice-controlled-reporting.mdx` - Voice features (EN)
- `verpleegkundige-overdracht.mdx` - Overdracht workflow
- `fhir-datamodel.mdx` - Data model uitleg
- `fhir-api.mdx` - API documentatie
- `release-notes-system.mdx` - Release notes
- `build-errors-fix.mdx` - Troubleshooting
- `webpack-module-resolution.mdx` - Technische docs

### 3.3 Streaming Responses

| Aspect | Specificatie |
|--------|--------------|
| **Model** | Claude claude-sonnet-4-20250514 |
| **Streaming** | Server-Sent Events (SSE) |
| **UX** | Tekst verschijnt woord-voor-woord |
| **Timeout** | 30 seconden max |

### 3.4 Sessie-based Conversatie

| Aspect | Specificatie |
|--------|--------------|
| **Persistentie** | Alleen tijdens browser sessie |
| **Context** | Volledige conversatie wordt meegestuurd |
| **Welkomstbericht** | Automatisch bij openen widget |
| **Opslag** | React state (geen database) |

---

## 4. Gebruikersflows (Demo- en MVP-flows)

**Doel:** Laten zien hoe de gebruiker stap-voor-stap door het systeem gaat.

### Flow 1: Happy Path — Vraag Stellen

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Gebruiker werkt in EPD en heeft vraag                    │
│    ↓                                                        │
│ 2. Klikt op amber chat-knop rechtsonder                     │
│    ↓                                                        │
│ 3. Widget opent met welkomstbericht                         │
│    ↓                                                        │
│ 4. Typt vraag: "Hoe maak ik een intake aan?"               │
│    ↓                                                        │
│ 5. Ziet streaming antwoord verschijnen                      │
│    ↓                                                        │
│ 6. Stelt eventueel vervolgvraag                             │
│    ↓                                                        │
│ 7. Sluit widget en gaat verder met werk                     │
└─────────────────────────────────────────────────────────────┘
```

**Doorlooptijd:** < 30 seconden voor antwoord

### Flow 2: Vraag Buiten Scope

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Gebruiker vraagt: "Wat is de beste behandeling voor X?"  │
│    ↓                                                        │
│ 2. Assistent antwoordt:                                     │
│    "Die informatie heb ik niet. Ik kan alleen helpen met    │
│     vragen over hoe het EPD systeem werkt. Probeer:         │
│     - Hoe maak ik een behandelplan?                         │
│     - Hoe werkt de screening?"                              │
└─────────────────────────────────────────────────────────────┘
```

### Flow 3: Technische Vraag

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Developer vraagt: "Hoe werkt de FHIR API?"              │
│    ↓                                                        │
│ 2. Assistent geeft technische uitleg uit fhir-api.mdx       │
│    ↓                                                        │
│ 3. Verwijst naar relevante endpoints en voorbeelden         │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Niet in Scope

**Doel:** Duidelijk maken wat (nog) niet wordt gebouwd.

| Feature | Reden |
|---------|-------|
| Conversatie opslaan in database | Complexiteit, privacy overwegingen |
| Meerdere AI providers | Alleen Claude voor nu |
| RAG / Vector search | Documentatie past in context window |
| Proactieve suggesties | Focus op vraag-antwoord eerst |
| Voice input | Aparte feature (spraakherkenning bestaat al) |
| Multi-language | Alleen Nederlands voor MVP |
| Admin dashboard voor prompts | Hardcoded prompts voor nu |
| Feedback/rating systeem | Post-MVP |

---

## 6. Succescriteria

**Doel:** Objectieve meetlat voor een geslaagde oplevering.

| Criterium | Target | Meetmethode |
|-----------|--------|-------------|
| **Response Time** | First token < 2 sec | Console timing |
| **Antwoord Kwaliteit** | Relevant en correct | User feedback |
| **Widget Laadtijd** | < 100ms | Performance metrics |
| **Error Rate** | < 5% API failures | Error logging |
| **Demo Doorlooptijd** | Vraag → Antwoord < 30 sec | Live demo |
| **Beschikbaarheid** | Widget altijd zichtbaar in EPD | Visual check |

---

## 7. Risico's & Mitigatie

**Doel:** Risico's vroeg signaleren en plannen hoe ermee om te gaan.

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| **AI hallucineert informatie** | Hoog | Strikte system prompt; "alleen uit docs"; duidelijk AI label |
| **Documentatie te groot voor context** | Middel | ~119KB past; monitoring van token usage |
| **API rate limits / kosten** | Middel | Geen caching nodig (sessie-based); prompt optimalisatie |
| **Trage response (>5s)** | Middel | Streaming UX; skeleton loader; timeout handling |
| **Privacy vragen in chat** | Laag | Geen logging; sessie-only; duidelijke scope communicatie |

---

## 8. Roadmap / Vervolg (Post-MVP)

**Doel:** Richting geven aan toekomstige uitbreidingen.

### Fase 2: Enhanced Assistant (Q1 2026)

1. **Conversatie Persistentie** — Gesprekken opslaan per gebruiker
2. **Feedback Systeem** — Thumbs up/down op antwoorden
3. **Suggestie Chips** — Voorgestelde vragen tonen
4. **Context Awareness** — Weet op welke pagina gebruiker zit

### Fase 3: Proactive Help (Q2 2026)

5. **Onboarding Flow** — Guided tour via chat
6. **Error Recovery** — Automatisch hulp bij errors
7. **Tooltip Integration** — AI uitleg bij complexe UI elementen

### Fase 4: Advanced AI (Q2-Q3 2026)

8. **AI Pre-fill Behandelplan** — Zie `prd-ai-prefill-behandelplan-v1.md`
9. **Multi-provider Support** — OpenAI/Gemini fallback
10. **RAG Implementation** — Voor grotere knowledge bases

---

## 9. Bijlagen & Referenties

**Doel:** Bronnen koppelen voor context en consistentie.

### Project Documentatie

- PRD AI Pre-fill Behandelplan (`prd-ai-prefill-behandelplan-v1.md`)
- PRD Mini-ECD v1.2 (`prd-mini-ecd-v1_2.md`)
- Functioneel Ontwerp v2 (`fo-mini-ecd-v2.md`)
- UX Stylesheet (`ux-stylesheet.md`)

### Externe Referenties

- [Claude API Documentation](https://docs.anthropic.com)
- [Anthropic Streaming Guide](https://docs.anthropic.com/en/api/streaming)

---

## Appendix A: Technische Specificatie

### A.1 Architectuur

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  DocsChatWidget │────▶│ /api/docs/chat   │────▶│ Claude API  │
│  (React State)  │◀────│ (Streaming SSE)  │◀────│ (streaming) │
└─────────────────┘     └──────────────────┘     └─────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │ knowledge-base.ts│
                        │ (laadt 14 MDX)   │
                        └──────────────────┘
```

### A.2 Bestandsstructuur

**Nieuwe bestanden:**

```
lib/
  docs/
    knowledge-base.ts         # Documentatie loader

app/
  api/
    docs/
      chat/
        route.ts              # Streaming API endpoint

components/
  docs-chat/
    docs-chat-widget.tsx      # Floating widget container
    chat-messages.tsx         # Message list component
    chat-input.tsx            # Input met send button
    use-docs-chat.ts          # Custom hook voor state
```

**Te wijzigen:**

```
app/epd/components/epd-layout-client.tsx  # Widget toevoegen
```

### A.3 API Endpoint

```
POST /api/docs/chat
```

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Hoe maak ik een intake?" },
    { "role": "assistant", "content": "Om een intake aan te maken..." }
  ],
  "userMessage": "En hoe voeg ik notities toe?"
}
```

**Response:** Server-Sent Events stream

```
event: content_block_delta
data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Om "}}

event: content_block_delta
data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"notities "}}
...
```

### A.4 System Prompt

```
Je bent een vriendelijke documentatie assistent voor het Mini-ECD,
een GGZ EPD (Elektronisch Patiënt Dossier) systeem.

## Jouw rol
- Beantwoord vragen over hoe het EPD systeem werkt
- Help gebruikers functies te vinden en te gebruiken
- Verwijs naar relevante documentatie secties

## Belangrijke regels
- Je ENIGE kennisbron is de onderstaande documentatie
- Beantwoord vragen ALLEEN op basis van deze informatie
- Als informatie ontbreekt: zeg eerlijk dat je het niet weet
- Verzin NOOIT informatie die niet in de documentatie staat
- Geef GEEN medisch advies of behandelsuggesties

## Jouw publiek
Zorgprofessionals (behandelaars, verpleegkundigen) die het EPD gebruiken.

## Stijl
- Schrijf in het Nederlands
- Wees beknopt maar vriendelijk
- Gebruik bullet points voor stappen
- Verwijs naar specifieke menu's en knoppen waar relevant

---
DOCUMENTATIE:

{content van alle 14 MDX bestanden}

---
```

### A.5 Component Specificaties

**DocsChatWidget:**
- Positie: `fixed bottom-6 right-6`
- Z-index: `z-50`
- Trigger: 56x56px amber gradient button
- Panel: 384px breed, max 80vh hoog
- Animatie: `animate-in slide-in-from-bottom-4 fade-in`

**ChatMessages:**
- Scroll: `overflow-y-auto`
- User bubbles: rechts, `bg-amber-100`
- Assistant bubbles: links, `bg-slate-100`
- Streaming indicator: pulserende cursor

**ChatInput:**
- Textarea: auto-resize, max 4 regels
- Send button: amber, disabled tijdens loading
- Enter: verstuur (Shift+Enter: nieuwe regel)

---

## Appendix B: UI States

### Widget States

| State | Weergave | Actie |
|-------|----------|-------|
| **Gesloten** | Amber floating button | Klik → Open |
| **Open - Idle** | Chat panel met welkomst | Type vraag |
| **Open - Loading** | Streaming indicator | Wacht |
| **Open - Streaming** | Tekst verschijnt | Lees |
| **Open - Error** | Foutmelding | Retry knop |

### Welkomstbericht

> "Hallo! Ik ben de documentatie assistent voor het Mini-ECD.
> Stel gerust vragen over hoe het systeem werkt, bijvoorbeeld:
> - Hoe maak ik een nieuwe intake aan?
> - Hoe werkt de spraakherkenning?
> - Waar vind ik de screening resultaten?"

---

*Document gegenereerd als onderdeel van AI Speedrun — Week 3*
