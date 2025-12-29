# 🧩 Functioneel Ontwerp (FO) — Swift Swift Assistent Chatbot

**Projectnaam:** Swift — Swift Assistent Chatbot Interface  
**Versie:** v3.0  
**Datum:** 27-12-2024  
**Auteur:** Colin Lit

---

## 1. Doel en relatie met het PRD

🎯 **Doel van dit document:**
Dit Functioneel Ontwerp beschrijft het **redesign** van Swift naar een Swift Assistent chatbot interface. De gebruiker voert een natuurlijke conversatie met een AI-assistent die intents herkent, acties uitvoert, en relevante UI-componenten toont in een split-screen layout.

📘 **Relatie met andere documenten:**
- **PRD:** `nextgen-epd-prd-ephemeral-ui-epd.md` — Ephemeral UI visie
- **UX/UI:** `swift-ux-v2.1.md` — Visuele specificaties (wordt herzien)
- **UX Research:** `nextgen-epd-onderzoeksverslag-ux-ui-patterns.md` — Marktanalyse
- **Bouwplan:** `bouwplan-swift-v2.md` — Development roadmap

**Kernprincipe:**
> De gebruiker voert een natuurlijke conversatie met een Swift Assistent assistent. De assistent herkent intents, voert acties uit, en toont relevante UI-componenten (artifacts) rechts in beeld. De conversatie blijft zichtbaar en doorlopend — zoals ChatGPT Canvas of Claude Artifacts.

**Belangrijkste wijzigingen t.o.v. v2.0:**

| Aspect | v2.0 (Command Center) | v3.0 (Swift Assistent) |
|--------|----------------------|----------------------|
| Input model | Command-line stijl | Natuurlijke conversatie |
| UI paradigma | Blocks die verschijnen/verdwijnen | Chat links, artifacts rechts |
| Context | Per commando | Doorlopende conversatiegeschiedenis |
| AI rol | Intent classifier | Converserende Swift Assistent |
| Interactie | Transactioneel | Relationeel, follow-up mogelijk |

---

## 2. Overzicht van de belangrijkste onderdelen

🎯 **Doel:** Overzicht van alle modules en hun relaties.

### 2.1 Systeemcomponenten

| # | Component | Beschrijving | Type |
|---|-----------|--------------|------|
| 1 | **Command Center** | Hoofdscherm met split-screen layout | Scherm |
| 2 | **Context Bar** | Dienst, actieve patiënt, user info | UI Zone |
| 3 | **Chat Panel** | Doorlopende conversatie (links, 40%) | UI Zone |
| 4 | **Artifact Area** | Waar blocks verschijnen (rechts, 60%) | UI Zone |
| 5 | **Chat Input** | Tekst + voice input (onderaan chat) | UI Zone |
| 6 | **Chat API** | Medical scribe chatbot endpoint | Backend |
| 7 | **Intent Engine** | Herkent intents in conversatie (hybrid) | Backend |
| 8 | **Context Manager** | Beheert sessie context + chat history | Backend |

### 2.2 Artifacts (Bouwblokken)

| Prio | Artifact | Functie | Trigger voorbeelden |
|------|----------|---------|---------------------|
| P1 | **DagnotatieBlock** | Snelle notitie invoer | "medicatie gegeven aan jan" |
| P1 | **ZoekenBlock** | Patiënt zoeken | "wie is jan de vries" |
| P1 | **PatientContextCard** | Patiënt overzicht | Na zoeken / selectie |
| P1 | **OverdrachtBlock** | Dienst overdracht met AI-filtering | "maak overdracht" |
| P2 | **RapportageBlock** | Behandelrapportage | "gesprek gehad met jan" |
| P2 | **AgendaBlock** | Afspraken | "mijn afspraken vandaag" |
| P2 | **MetingenBlock** | Vitale functies | "bloeddruk invoeren" |

**Belangrijk:** Artifacts blijven functioneel hetzelfde als v2.0 blocks, maar verschijnen nu rechts in een persistent panel.

### 2.3 Rol-specifieke Views

| Rol | Primaire workflow | Artifact focus |
|-----|-------------------|----------------|
| **Verpleegkundige** | Notities maken tijdens dienst | DagnotatieBlock, RapportageBlock |
| **Psychiater** | Gefilterde overdracht lezen | OverdrachtBlock met AI-samenvatting |

---

## 3. User Stories

🎯 **Doel:** Beschrijven wat gebruikers moeten kunnen doen, vanuit hun perspectief.

### 3.1 Nieuwe Stories (v3.0)

| ID | Rol | Doel / Actie | Verwachte waarde | Prio |
|----|-----|--------------|------------------|------|
| US-15 | Alle gebruikers | Natuurlijke conversatie voeren met assistent | Voelt als praten met collega | 🔴 P1 |
| US-16 | Alle gebruikers | Conversatiegeschiedenis zien | Context behouden tijdens werk | 🔴 P1 |
| US-17 | Alle gebruikers | Doorvragen zonder opnieuw te beginnen | Flexibele workflow | 🔴 P1 |
| US-18 | Alle gebruikers | Assistent stelt verduidelijkingsvragen | Minder fouten, betere data | 🟡 P2 |
| US-19 | Alle gebruikers | Meerdere acties in één conversatie | Efficiënte workflow | 🟡 P2 |
| US-20 | Verpleegkundige | Notities maken via spraak of typen | Hands-free documentatie | 🔴 P1 |
| US-21 | Verpleegkundige | Zien welke notities relevant zijn voor psychiater | Transparantie in filtering | 🟡 P2 |
| US-22 | Psychiater | Alleen behandelrelevante info zien | Geen ruis, focus op behandeling | 🔴 P1 |
| US-23 | Psychiater | Doorklikken naar originele bron | Verificatie en context | 🔴 P1 |

### 3.2 Bestaande Stories (herzien)

| ID | Rol | Doel / Actie | Wijziging v3.0 |
|----|-----|--------------|----------------|
| US-01 | Verpleegkundige | Dagnotitie maken | Via conversatie: "Ik heb medicatie gegeven aan Jan" |
| US-02 | Verpleegkundige | Patiënt zoeken | Via conversatie: "Wie is Jan de Vries?" |
| US-04 | Verpleegkundige | Overdracht maken | Via conversatie: "Maak overdracht voor deze dienst" |

---

## 4. Functionele werking per onderdeel

🎯 **Doel:** Per component beschrijven wat de gebruiker kan doen en wat het systeem doet.

### 4.1 Command Center (Hoofdscherm)

**Beschrijving:**
Split-screen layout met chat links (40%) en artifacts rechts (60%). De gebruiker voert een natuurlijke conversatie met de Swift Assistent assistent.

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  🕐 Ochtend | 8 ptn              Jan de Vries ▼        👤 SV   │
│                           CONTEXT BAR                           │
├──────────────────────────────┬──────────────────────────────────┤
│                              │                                  │
│  CHAT PANEL (40%)            │  ARTIFACT AREA (60%)             │
│                              │                                  │
│  👤 "Ik heb net medicatie    │  ┌────────────────────────────┐ │
│     gegeven aan Jan"         │  │ 📝 Dagnotitie              │ │
│                              │  │                            │ │
│  🤖 Ik maak een dagnotitie   │  │ Patiënt: Jan de Vries ✓   │ │
│     voor Jan de Vries.       │  │ Categorie: Medicatie ✓    │ │
│     Categorie: Medicatie.    │  │                            │ │
│                              │  │ Notitie:                   │ │
│     Wil je nog iets          │  │ ┌────────────────────────┐│ │
│     toevoegen?               │  │ │ medicatie gegeven      ││ │
│                              │  │ └────────────────────────┘│ │
│  👤 "Nee, opslaan"           │  │                            │ │
│                              │  │ ☐ Relevant voor psychiater │ │
│  🤖 ✓ Notitie opgeslagen     │  │                            │ │
│     voor Jan de Vries.       │  │ [Annuleren]  [💾 Opslaan]  │ │
│                              │  └────────────────────────────┘ │
│                              │                                  │
├──────────────────────────────┤                                  │
│ 💬 Typ of spreek...     🎤   │                                  │
└──────────────────────────────┴──────────────────────────────────┘
```

**Gedrag:**
- Bij laden: Chat input heeft focus, artifact area toont placeholder
- Keyboard shortcut `⌘K` focust chat input vanaf elke plek
- Artifacts verschijnen rechts met slide-in animatie (200ms)
- Chat blijft zichtbaar en scrollbaar tijdens werk met artifacts
- Meerdere artifacts mogelijk via tabs (max 3 tegelijk)

**States:**

| State | Chat Panel | Artifact Area |
|-------|------------|---------------|
| Initial | Welcome message | Placeholder: "Artifacts verschijnen hier" |
| Conversing | Chat history + streaming response | Ongewijzigd of artifact |
| Action triggered | Chat continues | Artifact slide-in |
| Working | Chat beschikbaar | Artifact actief |
| Completed | Success message in chat | Artifact sluit of blijft |

---

### 4.2 Context Bar

**Functie:** Toont essentiële context: dienst, actieve patiënt, gebruiker.

**Elementen:**

| Element | Beschrijving | Interactie |
|---------|--------------|------------|
| Dienst indicator | 🕐 Ochtend / Middag / Nacht + patiëntentelling | Geen |
| Actieve patiënt | Dropdown met recent geselecteerde patiënten | Klik opent selector |
| User info | Avatar + initialen | Klik opent menu |

**Dienst kleuren:**

| Dienst | Tijd | Kleur |
|--------|------|-------|
| Ochtend | 07:00-15:00 | Amber (#F59E0B) |
| Middag | 15:00-23:00 | Blue (#3B82F6) |
| Nacht | 23:00-07:00 | Indigo (#6366F1) |

---

### 4.3 Chat Panel

**Functie:** Toont doorlopende conversatie met Swift Assistent assistent.

**Elementen:**

| Element | Beschrijving |
|---------|--------------|
| Chat Messages | Scrollbare lijst van user en assistant messages |
| Message Bubbles | User: rechts, amber bg / Assistant: links, slate bg |
| Streaming Indicator | Pulsating dots tijdens AI response |
| Action Links | Klikbare links naar gerelateerde artifacts |
| Timestamps | Optioneel, alleen bij pauzes >5 minuten |

**Message Types:**

| Type | Weergave | Voorbeeld |
|------|----------|-----------|
| User message | Rechts, amber | "medicatie gegeven aan jan" |
| Assistant text | Links, slate | "Ik maak een dagnotitie..." |
| Assistant action | Links, met icon | "📝 Dagnotitie geopend" (klikbaar) |
| System message | Centered, subtle | "✓ Notitie opgeslagen" |
| Error message | Links, red border | "Er ging iets mis. Probeer opnieuw." |

**Gedrag:**
- Auto-scroll naar laatste message
- Scroll-lock wanneer gebruiker omhoog scrollt
- "Scroll to bottom" knop bij nieuwe messages
- Max 100 messages in view (pagination voor oudere)

---

### 4.4 Chat Input

**Functie:** Tekst + voice input voor conversatie met Swift Assistent.

**States:**

| State | Weergave | Trigger |
|-------|----------|---------|
| Default | "Typ of spreek..." + mic icon | — |
| Typing | Cursor + getypte tekst | Keyboard input |
| Listening | 🔴 + waveform + live transcript | Mic click of spatie |
| Processing | Disabled, "Denkt na..." | Na submit |
| Streaming | Disabled, streaming in chat | Tijdens AI response |

**Keyboard Shortcuts:**

| Key | Actie |
|-----|-------|
| `Enter` | Submit message |
| `⌘Enter` / `Ctrl+Enter` | Force submit (ook tijdens streaming) |
| `Escape` | Clear input / cancel voice |
| `↑` | Vorige message (edit history) |
| `Space` (leeg) | Start voice recording |
| `⌘K` | Focus input |

**Voice Flow:**
1. User klikt mic of drukt spatie (bij lege input)
2. Deepgram start streaming transcription
3. Live transcript verschijnt in input field
4. Pauze detectie (1.5 sec stilte) → auto-submit
5. Of user klikt "Stop" → submit

---

### 4.5 Artifact Area

**Functie:** Toont actieve artifacts (blocks) rechts van de chat.

**Layout opties:**

| Situatie | Weergave |
|----------|----------|
| Geen artifact | Placeholder met voorbeelden |
| Eén artifact | Full width, centered |
| Meerdere artifacts | Tabs bovenaan (max 3) |

**Artifact Lifecycle:**

```
┌─────────────────────────────────────────────────────────────┐
│  1. Intent detected in chat                                 │
│     → AI response: "Ik maak een dagnotitie..."             │
│     → Action object attached to response                    │
├─────────────────────────────────────────────────────────────┤
│  2. Artifact appears                                        │
│     → Slide-in animation (200ms, from right)               │
│     → Pre-filled with extracted entities                   │
│     → Focus moves to first editable field                  │
├─────────────────────────────────────────────────────────────┤
│  3. User interacts                                          │
│     → Edits fields in artifact                             │
│     → Can continue chatting (e.g., "voeg toe: sliep goed") │
│     → Chat updates artifact in real-time                   │
├─────────────────────────────────────────────────────────────┤
│  4. User saves or cancels                                   │
│     → Success: toast + chat confirmation + artifact closes │
│     → Cancel: artifact closes, no confirmation             │
└─────────────────────────────────────────────────────────────┘
```

**Placeholder State:**

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                    💬 Artifacts verschijnen hier           │
│                                                            │
│     Vraag me iets, bijvoorbeeld:                          │
│     • "Notitie voor Jan: medicatie gegeven"               │
│     • "Zoek Marie van den Berg"                           │
│     • "Maak overdracht voor deze dienst"                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### 4.6 Swift Assistent Chat API

**Functie:** Chatbot endpoint die conversatie voert en intents herkent.

**Endpoint:** `POST /api/swift/chat`

**Request:**

```typescript
interface ChatRequest {
  message: string;                    // User message
  messages: ChatMessage[];            // Conversation history (max 20)
  context: {
    activePatient?: Patient;          // Currently selected patient
    shift: 'ochtend' | 'middag' | 'nacht';
    userId: string;
    recentActions: RecentAction[];    // Last 5 actions
  };
}
```

**Response (Server-Sent Events):**

```typescript
// Text chunk (streaming)
{ type: 'text', content: string }

// Action detected (end of response)
{ 
  type: 'action',
  intent: Intent,
  entities: ExtractedEntities,
  confidence: number,
  artifact?: {
    type: ArtifactType,
    prefill: PrefillData
  }
}

// Done
{ type: 'done' }
```

**System Prompt (samenvatting):**

```
Je bent een medische assistent (Swift Assistent) voor Swift, een Nederlands GGZ EPD.

Je rol:
- Help zorgmedewerkers met documentatie en administratie
- Voer natuurlijke gesprekken in het Nederlands
- Herken intents en voer acties uit wanneer nodig
- Stel verduidelijkingsvragen bij onduidelijkheid
- Wees vriendelijk maar professioneel

Intents die je herkent:
- dagnotitie: notitie maken voor patiënt
- zoeken: patiënt zoeken
- rapportage: behandelrapportage schrijven
- overdracht: dienst overdracht maken
- metingen: vitale functies invoeren
- agenda: afspraken bekijken

Wanneer je een intent herkent, voeg een JSON action object toe aan je response.

Huidige context:
- Actieve patiënt: {activePatient}
- Dienst: {shift}
- Recente acties: {recentActions}
```

---

### 4.7 Intent Engine (Hybrid)

**Functie:** Herkent intents in conversatie met two-tier approach.

**Tier 1: Local Pattern Matching (<50ms)**

| Pattern | Intent | Entities |
|---------|--------|----------|
| "notitie [naam]" | dagnotitie | patient: naam |
| "zoek [naam]" | zoeken | query: naam |
| "overdracht" | overdracht | — |
| "bloeddruk [naam]" | metingen | patient: naam, type: bloeddruk |

**Tier 2: AI Classification (via Chat API)**

Wanneer local patterns geen match geven of confidence <0.8, bepaalt de Chat API het intent op basis van conversatie-context.

**Voorbeelden:**

| Conversatie | Intent | Methode |
|-------------|--------|---------|
| "notitie jan medicatie" | dagnotitie | Local (direct match) |
| "Ik heb net een gesprek gehad" | rapportage | AI (context needed) |
| "Hij geeft aan zich beter te voelen" | (context) | AI (follow-up) |
| "Wie was die mevrouw van kamer 12?" | zoeken | AI (indirect) |

---

### 4.8 AI-Filtering voor Psychiater (Overdracht)

**Functie:** Filtert verpleegkundige rapportages naar behandelrelevante informatie.

**Wat WEL naar psychiater gaat:**

| Categorie | Voorbeelden |
|-----------|-------------|
| Medicatie-issues | Weigering, bijwerkingen, therapierespons |
| Stemming/gedrag verandering | t.o.v. baseline, significante shifts |
| Risico-signalen | Suïcidale uitingen, zelfbeschadiging, agressie |
| Signaleringsplan triggers | Oranje/rood fase signalen |
| Psychotische symptomen | Hallucinaties, wanen |
| Behandelplan stagnatie | Geen voortgang op doelen |

**Wat NIET naar psychiater gaat:**

| Categorie | Voorbeelden |
|-----------|-------------|
| Routine medicatie | "Medicatie volgens schema ingenomen" |
| ADL activiteiten | "Heeft gedoucht", "Ontbijt genuttigd" |
| Standaard observaties | "Rustige dag", "Goed geslapen" |
| Sociale activiteiten | "Bezoek gehad", "Mee naar dagactiviteit" |

**Linked Evidence:**
Elke zin in de AI-samenvatting linkt naar de originele verpleegkundige notitie. De psychiater kan hover-to-preview of click-to-expand gebruiken.

**UI in OverdrachtBlock:**

```
┌────────────────────────────────────────────────────────────┐
│ 🔄 Overdracht Ochtend → Middag                    [×]     │
│    07:00 - 15:00 | 8 patiënten                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Behandelrelevant (3 patiënten)                           │
│  ───────────────────────────────────────────────────────  │
│                                                            │
│  ▼ Jan de Vries                              ⚠️ Alert     │
│    Weigerde ochtendmedicatie. Geeft aan last te hebben   │
│    van bijwerkingen (duizeligheid). Stemming somberder   │
│    dan gisteren.                                          │
│    📎 3 bronnotities  [Bekijk bronnen]                    │
│                                                            │
│  ▶ Marie van den Berg                                     │
│  ▶ Piet Jansen                                            │
│                                                            │
│  ─────────────────────────────────────────────────────── │
│  Geen bijzonderheden (5 patiënten)                        │
│  [Toon allen ▼]                                           │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  [📋 Kopieer] [📤 Naar EPD] [✓ Gezien]                    │
└────────────────────────────────────────────────────────────┘
```

---

## 5. User Flows

🎯 **Doel:** Laten zien hoe de gebruiker stap-voor-stap door het systeem gaat.

### Flow 1: Dagnotitie via Conversatie

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Verpleegkundige opent Swift                              │
│    → Chat: welcome message                                  │
│    → Artifact: placeholder                                  │
├─────────────────────────────────────────────────────────────┤
│ 2. Verpleegkundige typt: "Medicatie gegeven aan Jan"       │
│    → Message verschijnt in chat                             │
├─────────────────────────────────────────────────────────────┤
│ 3. AI Response (streaming):                                 │
│    "Ik maak een dagnotitie voor Jan de Vries.              │
│     Categorie: Medicatie. Wil je nog iets toevoegen?"      │
│    → Action: intent=dagnotitie, patient=Jan, cat=Medicatie │
├─────────────────────────────────────────────────────────────┤
│ 4. DagnotatieBlock verschijnt rechts:                      │
│    → Patient: Jan de Vries ✓ (pre-filled)                  │
│    → Categorie: Medicatie ✓ (pre-filled)                   │
│    → Text: "Medicatie gegeven" (pre-filled)                │
├─────────────────────────────────────────────────────────────┤
│ 5. Verpleegkundige: "Nee, opslaan"                         │
│    → Of: klikt direct op Opslaan knop                       │
├─────────────────────────────────────────────────────────────┤
│ 6. Resultaat:                                               │
│    → Toast: "✓ Notitie opgeslagen"                         │
│    → Chat: "Notitie opgeslagen voor Jan de Vries."         │
│    → Artifact sluit (of blijft voor volgende)              │
├─────────────────────────────────────────────────────────────┤
│ TIJD: ~15 seconden                                          │
└─────────────────────────────────────────────────────────────┘
```

### Flow 2: Overdracht met AI-Filtering (Psychiater)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Psychiater opent Swift                                   │
│    → Chat: "Goedemorgen! Wil je de overdracht bekijken?"   │
├─────────────────────────────────────────────────────────────┤
│ 2. Psychiater: "Ja, laat zien"                             │
│    → Of: "Overdracht ochtend"                               │
├─────────────────────────────────────────────────────────────┤
│ 3. AI Response:                                             │
│    "Ik haal de overdracht op. 3 patiënten hebben           │
│     behandelrelevante updates."                             │
│    → OverdrachtBlock verschijnt rechts                      │
├─────────────────────────────────────────────────────────────┤
│ 4. OverdrachtBlock toont:                                   │
│    → Gefilterde samenvatting (alleen behandelrelevant)     │
│    → Patiënten gesorteerd op urgentie                       │
│    → "Geen bijzonderheden" sectie ingeklapt                │
├─────────────────────────────────────────────────────────────┤
│ 5. Psychiater klikt op "📎 3 bronnotities" bij Jan         │
│    → Slide-in panel met originele verpleegkundige notities │
│    → Timestamps en auteurs zichtbaar                        │
├─────────────────────────────────────────────────────────────┤
│ 6. Psychiater in chat: "Wat was er gisteren met Jan?"      │
│    → AI antwoordt met context uit eerdere notities         │
│    → Geen nieuw artifact nodig                              │
├─────────────────────────────────────────────────────────────┤
│ 7. Psychiater klikt "✓ Gezien"                             │
│    → Overdracht gemarkeerd als gelezen                      │
│    → Chat: "Overdracht gemarkeerd als gezien."             │
└─────────────────────────────────────────────────────────────┘
```

### Flow 3: Rapportage met Verduidelijkingsvragen

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Verpleegkundige: "Ik heb een gesprek gehad"             │
├─────────────────────────────────────────────────────────────┤
│ 2. AI: "Met welke patiënt had je het gesprek?"             │
│    → Geen artifact (verduidelijking nodig)                  │
├─────────────────────────────────────────────────────────────┤
│ 3. Verpleegkundige: "Jan"                                   │
├─────────────────────────────────────────────────────────────┤
│ 4. AI: "Ik maak een rapportage voor Jan de Vries.          │
│     Wat wil je vastleggen?"                                 │
│    → RapportageBlock verschijnt rechts (leeg)              │
├─────────────────────────────────────────────────────────────┤
│ 5. Verpleegkundige: "Hij voelt zich beter, minder angstig" │
│    → Tekst verschijnt in RapportageBlock                   │
├─────────────────────────────────────────────────────────────┤
│ 6. AI: "Genoteerd. Wil je dit als voortgangsgesprek        │
│     opslaan of is er meer?"                                 │
├─────────────────────────────────────────────────────────────┤
│ 7. Verpleegkundige: "Opslaan als voortgang"                │
│    → Rapportage opgeslagen met tag "Voortgangsgesprek"     │
│    → Toast + chat confirmation                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Interacties met AI

🎯 **Doel:** Uitleggen waar AI in de flow voorkomt en wat de gebruiker ziet.

| Locatie | AI-actie | Trigger | Output |
|---------|----------|---------|--------|
| Chat | Conversatie + intent detection | Elke user message | Streaming text + action object |
| Chat | Verduidelijkingsvraag | Onduidelijke intent | Vraag in chat (geen artifact) |
| Chat | Follow-up verwerking | User antwoord op vraag | Update artifact of nieuwe info |
| OverdrachtBlock | Relevantie-filtering | "overdracht" intent | Gefilterde samenvatting |
| OverdrachtBlock | Samenvatting generatie | Per patiënt | Behandelrelevante bullets |
| RapportageBlock | Tekst structureren | "Structureer" knop | Gestructureerde tekst |
| RapportageBlock | B1-niveau herschrijven | "Vereenvoudig" knop | Herschreven tekst |

**Confidence Thresholds:**

| Confidence | Actie |
|------------|-------|
| >0.9 | Direct artifact openen met prefill |
| 0.7-0.9 | Artifact openen + bevestigingsvraag in chat |
| 0.5-0.7 | Verduidelijkingsvraag in chat, geen artifact |
| <0.5 | Fallback: "Ik begrijp je niet helemaal. Kun je het anders formuleren?" |

---

## 7. Gebruikersrollen en rechten

🎯 **Doel:** Beschrijven welke rollen toegang hebben tot welke onderdelen.

| Rol | Toegang | Artifacts | AI-filtering |
|-----|---------|-----------|--------------|
| **Verpleegkundige** | Eigen dienst patiënten | Alle P1/P2 artifacts | Input: alle notities |
| **Psychiater** | Alle patiënten in behandeling | OverdrachtBlock (read), PatientContextCard | Output: gefilterde samenvatting |
| **Behandelaar** | Eigen caseload | Alle artifacts | Beide views beschikbaar |

**Permissies per Artifact:**

| Artifact | Verpleegkundige | Psychiater | Behandelaar |
|----------|-----------------|------------|-------------|
| DagnotatieBlock | ✅ Create | ❌ | ✅ Create |
| RapportageBlock | ✅ Create | 👁️ Read | ✅ Create |
| OverdrachtBlock | ✅ Create | 👁️ Read (filtered) | ✅ Both |
| PatientContextCard | 👁️ Read | 👁️ Read | 👁️ Read |

---

## 8. Technische Specificaties

### 8.1 API Routes

| Route | Method | Functie | Status |
|-------|--------|---------|--------|
| `/api/swift/chat` | POST | Medical scribe chatbot | 🆕 Nieuw |
| `/api/swift/overdracht/generate` | POST | AI-gefilterde overdracht | 🔄 Herzien |
| `/api/intent/classify` | POST | Intent classification | ✅ Bestaat |
| `/api/patients/search` | GET | Patient search | ✅ Bestaat |
| `/api/reports` | POST | Report opslaan | ✅ Bestaat |

### 8.2 Store Uitbreiding

```typescript
interface SwiftStore {
  // Bestaande state
  activePatient: Patient | null;
  activeBlock: BlockType | null;
  shift: 'ochtend' | 'middag' | 'nacht';
  
  // Chat state (nieuw)
  chatMessages: ChatMessage[];
  isStreaming: boolean;
  pendingAction: Action | null;
  
  // Artifact state (nieuw)
  openArtifacts: Artifact[];  // Max 3
  activeArtifactId: string | null;
  
  // Actions
  addChatMessage: (message: ChatMessage) => void;
  processAction: (action: Action) => void;
  openArtifact: (artifact: Artifact) => void;
  closeArtifact: (id: string) => void;
}
```

### 8.3 Component Structuur

```
components/swift/
├── command-center/
│   ├── command-center.tsx       # Split-screen container
│   ├── context-bar.tsx          # Header met dienst/patient
│   ├── chat-panel.tsx           # 🆕 Chat messages
│   ├── chat-input.tsx           # Herzien: conversational
│   └── artifact-area.tsx        # 🆕 Artifact container
├── chat/
│   ├── chat-message.tsx         # 🆕 Individual message
│   ├── chat-action-link.tsx     # 🆕 Clickable action
│   └── streaming-indicator.tsx  # 🆕 Typing dots
├── artifacts/
│   ├── artifact-container.tsx   # 🆕 Wrapper met tabs
│   ├── dagnotitie-block.tsx     # Bestaand
│   ├── zoeken-block.tsx         # Bestaand
│   ├── overdracht-block.tsx     # Herzien: met filtering UI
│   ├── rapportage-block.tsx     # Bestaand
│   └── patient-context-card.tsx # Bestaand
└── shared/
    ├── linked-evidence.tsx      # 🆕 Bron-verwijzing component
    └── relevance-badge.tsx      # 🆕 "Behandelrelevant" indicator
```

---

## 9. UI Specificaties

### 9.1 Layout Breakpoints

| Viewport | Chat Panel | Artifact Area |
|----------|------------|---------------|
| Desktop (>1200px) | 40% | 60% |
| Tablet (768-1200px) | 45% | 55% |
| Mobile (<768px) | Full screen toggle | Full screen toggle |

### 9.2 Chat Message Styling

| Element | User Message | Assistant Message |
|---------|--------------|-------------------|
| Alignment | Right | Left |
| Background | Amber-50 (#FFFBEB) | Slate-100 (#F1F5F9) |
| Border | Amber-200 | Slate-200 |
| Max width | 80% | 80% |
| Border radius | 16px (top-right: 4px) | 16px (top-left: 4px) |

### 9.3 Artifact Animation

```css
/* Slide-in from right */
@keyframes artifact-enter {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.artifact-enter {
  animation: artifact-enter 200ms ease-out;
}
```

---

## 10. Bijlagen & Referenties

🎯 **Doel:** Linken naar overige documenten.

### Project Documentatie
- PRD Ephemeral UI: `nextgen-epd-prd-ephemeral-ui-epd.md`
- UX/UI Specs: `swift-ux-v2.1.md`
- UX Research: `nextgen-epd-onderzoeksverslag-ux-ui-patterns.md`
- Bouwplan: `bouwplan-swift-v2.md`
- Project Status: `PROJECT-STATUS-2024-12-27.md`

### Externe Referenties
- [ChatGPT Canvas UX Analysis](https://altar.io/next-gen-of-human-ai-collaboration/)
- [Claude Artifacts Documentation](https://docs.anthropic.com)
- [Abridge Linked Evidence](https://www.abridge.com/product)
- [GGZ Zorgstandaarden](https://www.ggzstandaarden.nl)

---

## Wijzigingslog

| Versie | Datum | Wijzigingen |
|--------|-------|-------------|
| v2.0 | 23-12-2024 | Command Center met ephemeral blocks |
| v2.1 | 23-12-2024 | Prioriteitenlijst, intent mapping, P3 blocks |
| v3.0 | 27-12-2024 | **Redesign:** Chat + Artifact interface, Swift Assistent conversatie, AI-filtering voor psychiater |
