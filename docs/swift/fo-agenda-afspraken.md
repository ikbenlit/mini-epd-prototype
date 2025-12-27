# 🧩 Functioneel Ontwerp (FO) – Swift Agenda & Afspraken

**Projectnaam:** Swift - Agenda & Afspraken Module
**Versie:** v1.0
**Datum:** 27-12-2024
**Auteur:** Colin Lit

---

## 1. Doel en relatie met het PRD

🎯 **Doel van dit document:**
Dit Functioneel Ontwerp beschrijft **hoe** de agenda- en afsprakenfunctionaliteit binnen Swift werkt. Swift is een conversational medical scribe interface waarin gebruikers via natuurlijke taal (Nederlands) afspraken kunnen opvragen, aanmaken, wijzigen en annuleren. Dit FO beschrijft de gebruikerservaring, UI-interacties en AI-functionaliteit.

📘 **Relatie met andere documenten:**
- **PRD:** Ephemeral UI visie (`nextgen-epd-prd-ephemeral-ui-epd.md`) - Conversational interface voor EPD
- **Swift FO v3.0:** `fo-swift-medical-scribe-v3.md` - Basis conversational interface architectuur
- **Klassieke Agenda:** `/app/epd/agenda` - Bestaande visuele kalender (blijft bestaan voor complexe planning)
- **Bouwplan:** `bouwplan-swift-standalone-module.md` - Development roadmap

**Kernprincipe:**
> Gebruikers kunnen via natuurlijke taal (chat of spraak) snel afspraken beheren zonder door menu's te klikken. Voor visueel overzicht en complexe planning blijft de klassieke kalender beschikbaar. Swift is de **snelle, hands-free** interface; klassieke agenda is de **visuele planner**.

**Toegevoegde waarde:**

| Aspect | Klassieke Agenda | Swift Agenda |
|--------|------------------|--------------|
| **Gebruik** | Visuele weekplanning | Quick actions, queries |
| **Input** | Klikken, formulieren | Natuurlijke taal, spraak |
| **Snelheid** | ~30-60 sec voor nieuwe afspraak | ~10-15 sec via chat/voice |
| **Ideaal voor** | Weekplanning, drag-drop | Tijdens telefoongesprek, hands-free |

---

## 2. Overzicht van de belangrijkste onderdelen

🎯 **Doel:** Overzicht van de functionaliteit binnen de Swift Agenda module.

### Hoofdonderdelen

1. **Agenda Queries** - Afspraken opvragen ("afspraken vandaag", "wat is volgende afspraak")
2. **Quick Create** - Snel afspraak maken ("maak afspraak jan morgen 14:00")
3. **Cancel Flow** - Afspraak annuleren ("annuleer afspraak jan")
4. **Reschedule Flow** - Afspraak verzetten ("verzet 14:00 naar 15:00")
5. **AgendaBlock** - UI component toont afspraken lijst en formulieren
6. **Intent Detection** - AI herkent wat gebruiker wil doen

### Artifact: AgendaBlock

Het **AgendaBlock** is het centrale UI-component met 4 modes:

| Mode | Functie | Trigger |
|------|---------|---------|
| **List View** | Toont chronologische lijst afspraken | "afspraken vandaag" |
| **Create Form** | Formulier voor nieuwe afspraak | "maak afspraak jan" |
| **Cancel View** | Confirmation dialog | "annuleer afspraak" |
| **Reschedule Form** | Datum/tijd aanpassing | "verzet afspraak" |

---

## 3. User Stories

🎯 **Doel:** Beschrijven wat gebruikers moeten kunnen doen vanuit hun perspectief.

### Primaire User Stories (P1)

| ID | Rol | Doel / Actie | Verwachte waarde | Prio |
|----|-----|--------------|------------------|------|
| **US-24** | Verpleegkundige | Snel overzicht afspraken vandaag | "afspraken vandaag" → lijst in AgendaBlock, <3 sec | 🔴 P1 |
| **US-25** | Verpleegkundige | Check volgende afspraak tijdens werk | "wat is mijn volgende afspraak?" → directe info | 🔴 P1 |
| **US-27** | Verpleegkundige | Snelle afspraak tijdens telefoongesprek | "maak afspraak jan morgen 14:00" → prefilled form, <15 sec | 🔴 P1 |
| **US-28** | Verpleegkundige | Context-aware planning | "maak afspraak met deze patiënt" → gebruikt actieve patiënt | 🔴 P1 |
| **US-29** | Verpleegkundige | Voice input tijdens consult | Hands-free afspraak maken via spraak | 🔴 P1 |
| **US-30** | Verpleegkundige | Annuleren via chat | "annuleer afspraak jan" → confirmation → done | 🔴 P1 |
| **US-31** | Verpleegkundige | Snel verzetten | "verzet 14:00 naar 15:00" → tijd update | 🔴 P1 |

### Secundaire User Stories (P2)

| ID | Rol | Doel / Actie | Verwachte waarde | Prio |
|----|-----|--------------|------------------|------|
| **US-26** | Verpleegkundige | Weekoverzicht bekijken | "agenda deze week" → gefilterde lijst | 🟡 P2 |
| **US-32** | Verpleegkundige | Disambiguation bij meerdere matches | Systeem vraagt "Welke Jan?" → lijst opties | 🟡 P2 |

---

## 4. Functionele werking per onderdeel

🎯 **Doel:** Per hoofdonderdeel beschrijven wat de gebruiker kan doen en wat het systeem doet.

### 4.1 Agenda Query (Afspraken opvragen)

**Wat doet de gebruiker:**
- Typt of spreekt: "afspraken vandaag", "wat is mijn volgende afspraak", "agenda morgen"

**Wat doet het systeem:**
1. **Intent detection:** Herkent dat gebruiker afspraken wil opvragen
2. **Datum parsing:** Vertaalt "vandaag", "morgen", "deze week" naar datumbereik
3. **Data ophalen:** Haalt afspraken op uit database
4. **AI response:** Chat toont samenvatting: "Je hebt vandaag 3 afspraken..."
5. **AgendaBlock opent:** Rechts verschijnt lijst met afspraken

**AgendaBlock List View bevat:**
- Header met datumbereik ("Afspraken Vandaag - 27 december")
- Per afspraak: tijd, patiënt (klikbaar), type badge, locatie
- Actions per afspraak: [Details] [Annuleren]
- Footer: Link naar volledige klassieke agenda

**States:**
- **Loading:** Spinner tijdens data fetch
- **Lijst met afspraken:** Chronologisch geordend
- **Empty state:** "Geen afspraken gevonden voor [datum]" + knop "Maak nieuwe afspraak"
- **Error:** "Fout bij ophalen afspraken" + link naar klassieke agenda

**Voorbeeld interactie:**
```
User: "afspraken vandaag"
           ↓
AI: "Je hebt vandaag 3 afspraken:
     - 09:00 Intake Jan de Vries
     - 11:30 Behandeling Marie Jansen
     - 14:00 Vervolggesprek Piet Bakker"
           ↓
[AgendaBlock opens rechts met lijst van 3 afspraken]
```

---

### 4.2 Quick Create (Afspraak maken)

**Wat doet de gebruiker:**
- Typt: "maak afspraak jan morgen 14:00"
- Of spreekt via voice input (spatie-knop)

**Wat doet het systeem:**
1. **Intent detection:** Herkent 'create_appointment' intent
2. **Entity extraction:**
   - Patient: "jan" (fuzzy search in database)
   - Datum: "morgen" → parses naar 28-12-2024
   - Tijd: "14:00"
   - Type: default "behandeling" (kan gespecificeerd worden: "maak intake...")
3. **AI response:** "Ik maak een afspraak voor Jan de Vries op 28 december om 14:00."
4. **AgendaBlock opent:** Create form met pre-filled velden
5. **Gebruiker bevestigt of past aan**
6. **Opslaan:** Server action → database → toast "Afspraak aangemaakt!"

**AgendaBlock Create Form bevat:**
- **Patiënt:** Autocomplete dropdown (pre-filled "Jan de Vries")
- **Datum:** Date picker (pre-filled: 28-12-2024)
- **Tijd:** Time picker (pre-filled: 14:00)
- **Type:** Radio buttons (Intake, Behandeling, Vervolg, Telefonisch, Crisis, etc.)
- **Locatie:** Radio buttons (Praktijk, Online, Thuis)
- **Notities:** Optionele textarea
- **Conflict warning:** "⚠️ Je hebt al een afspraak om 14:00 met Marie" (indien van toepassing)
- **Actions:** [Annuleren] [✓ Afspraak maken]

**Form validatie:**
- Patiënt is verplicht
- Datum kan niet in het verleden
- Tijd moet binnen 07:00-20:00

**Voorbeeld interactie (voice):**
```
User: [Drukt spatie] "maak intake met Jan de Vries morgen 14:00"
           ↓
[Deepgram transcribeert live]
           ↓
AI: "Ik maak een intake-afspraak voor Jan de Vries op 28 december om 14:00."
           ↓
[AgendaBlock create form opent met prefill]
           ↓
User: [Klikt "Afspraak maken"]
           ↓
Toast: "✓ Afspraak aangemaakt!"
Chat: "Afspraak ingepland voor Jan de Vries op 28 december om 14:00."
```

**Edge cases:**
- **Patiënt niet gevonden:** "Ik vond geen patiënt met de naam 'jan'. Bedoel je Jan de Vries of Jan Bakker?" (disambiguation)
- **Meerdere Jan's:** Toont lijst met opties in AgendaBlock
- **Tijd onduidelijk:** "Hoe laat wil je de afspraak plannen?"
- **Incomplete info:** "maak afspraak" → vraagt eerst om patiënt, dan datum/tijd

---

### 4.3 Cancel Flow (Afspraak annuleren)

**Wat doet de gebruiker:**
- Typt: "annuleer afspraak jan" of "annuleer de 14:00 afspraak"

**Wat doet het systeem:**
1. **Intent detection:** Herkent 'cancel_appointment'
2. **Search matching appointments:**
   - Op patiëntnaam: zoekt "jan"
   - Op tijd: zoekt afspraak om 14:00 vandaag
3. **Disambiguation (indien meerdere):**
   - Toont lijst van matching afspraken in AgendaBlock
   - Gebruiker selecteert welke
4. **Confirmation dialog:**
   - Toont details van geselecteerde afspraak
   - Waarschuwing: "Deze actie kan niet ongedaan worden gemaakt"
5. **Bevestigen:** Status → 'cancelled', toast + chat confirmation

**AgendaBlock Cancel View:**

**Single Match:**
```
┌─────────────────────────────────────────┐
│ ❌ Afspraak Annuleren              [×] │
├─────────────────────────────────────────┤
│                                         │
│ Wil je deze afspraak annuleren?        │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 28-12-2024 14:00 - 15:00            │ │
│ │ Jan de Vries - Intake               │ │
│ │ Praktijk                            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ⚠️ Actie kan niet ongedaan gemaakt     │
│                                         │
├─────────────────────────────────────────┤
│ [Terug]              [✓ Annuleren]     │
└─────────────────────────────────────────┘
```

**Multiple Matches (Disambiguation):**
```
┌─────────────────────────────────────────┐
│ ❌ Afspraak Annuleren              [×] │
├─────────────────────────────────────────┤
│ Welke afspraak wil je annuleren?       │
│                                         │
│ ○ 28-12 09:00 - Jan de Vries (Intake)  │
│ ○ 28-12 14:00 - Jan de Vries (Vervolg) │
│ ○ 03-01 11:00 - Jan de Vries (Behndl)  │
│                                         │
├─────────────────────────────────────────┤
│ [Annuleren]           [Volgende →]     │
└─────────────────────────────────────────┘
```

**Voorbeeld interactie:**
```
User: "annuleer afspraak jan"
           ↓
[Systeem vindt 3 afspraken met "jan"]
           ↓
AI: "Je hebt 3 afspraken met Jan. Welke wil je annuleren?"
           ↓
[AgendaBlock toont disambiguation list]
           ↓
User: [Selecteert 14:00 afspraak]
           ↓
[Confirmation dialog]
           ↓
User: [Klikt "Annuleren"]
           ↓
Toast: "Afspraak geannuleerd"
Chat: "Afspraak met Jan de Vries op 28 december om 14:00 is geannuleerd."
```

---

### 4.4 Reschedule Flow (Afspraak verzetten)

**Wat doet de gebruiker:**
- Typt: "verzet 14:00 naar 15:00" of "verzet jan naar dinsdag"

**Wat doet het systeem:**
1. **Intent detection:** Herkent 'reschedule_appointment'
2. **Parse old & new time:**
   - Oude afspraak: "14:00" vandaag
   - Nieuwe tijd: "15:00"
3. **Find appointment:** Zoekt matching afspraak
4. **AgendaBlock opent:** Edit form
5. **Conflict check:** Controleert of nieuwe tijd vrij is
6. **Bevestigen:** Update afspraak → toast + chat

**AgendaBlock Reschedule Form:**
```
┌─────────────────────────────────────────┐
│ 🔄 Afspraak Verzetten             [×]  │
├─────────────────────────────────────────┤
│                                         │
│ Afspraak                                │
│ Jan de Vries - Intake                   │
│                                         │
│ Huidige tijd                            │
│ 28-12-2024  14:00 - 15:00               │
│ (strikethrough)                         │
│                                         │
│ Nieuwe datum/tijd *                     │
│ [28-12-2024 ▼]  [15:00 ▼]              │
│                                         │
│ ✅ Geen conflicten gevonden             │
│                                         │
├─────────────────────────────────────────┤
│ [Annuleren]          [✓ Verzetten]     │
└─────────────────────────────────────────┘
```

**Voorbeeld interactie:**
```
User: "verzet de 14:00 naar 15:00"
           ↓
AI: "Ik verzet je afspraak van 14:00 met Jan naar 15:00."
           ↓
[AgendaBlock reschedule form opent]
           ↓
User: [Bevestigt of past aan]
           ↓
User: [Klikt "Verzetten"]
           ↓
Toast: "Afspraak verzet naar 15:00"
Chat: "Afspraak verzet naar 15:00."
```

---

### 4.5 AgendaBlock States & Lifecycle

**Artifact Lifecycle:**
1. **Closed (default):** Geen artifact zichtbaar
2. **Opening:** Slide-in animation (200ms from right)
3. **Active:** Gebruiker kan interacteren
4. **Submitting:** Form disabled, spinner op submit button
5. **Success:** Toast + chat confirmation → artifact sluit (of blijft voor volgende)
6. **Error:** Error message in artifact, re-enable form

**Max artifacts:** 3 tegelijk (tabs bovenaan bij meerdere)
- Bij 4e artifact: oudste sluit automatisch

**Keyboard shortcuts:**
- `⌘K` / `Ctrl+K` - Focus chat input
- `Escape` - Sluit artifact
- `Enter` - Submit form (in form fields)

---

## 5. UI-overzicht (visuele structuur)

🎯 **Doel:** Inzicht geven in de globale schermopbouw.

### Split-Screen Layout (Command Center)

```
┌───────────────────────────────────────────────────────────────┐
│ Context Bar: 🕐 Ochtend | 8 ptn    Jan de Vries ▼      👤 SV │
├─────────────────────────────┬─────────────────────────────────┤
│                             │                                 │
│  CHAT PANEL (40%)           │  ARTIFACT AREA (60%)            │
│                             │                                 │
│  👤 "afspraken vandaag"     │  ┌───────────────────────────┐ │
│                             │  │ 📅 Afspraken Vandaag      │ │
│  🤖 Je hebt vandaag 3       │  │                           │ │
│     afspraken:              │  │ 09:00 - Intake            │ │
│     - 09:00 Intake Jan      │  │ Jan de Vries              │ │
│     - 11:30 Behandeling     │  │ 📍 Praktijk               │ │
│     - 14:00 Vervolg         │  │ [Details] [Annuleren]     │ │
│                             │  │                           │ │
│  👤 "maak afspraak jan      │  │ 11:30 - Behandeling       │ │
│     morgen 14:00"           │  │ Marie Jansen              │ │
│                             │  │ 🌐 Online                 │ │
│  🤖 Ik maak een afspraak    │  │ [Details] [Annuleren]     │ │
│     voor Jan de Vries...    │  │                           │ │
│                             │  │ 14:00 - Vervolg           │ │
│     [AgendaBlock opent →]   │  │ Piet Bakker               │ │
│                             │  │ 📍 Praktijk               │ │
│                             │  │ [Details] [Annuleren]     │ │
│                             │  │                           │ │
│                             │  │ [📅 Open volledige        │ │
│                             │  │     agenda →]             │ │
│                             │  └───────────────────────────┘ │
│                             │                                 │
├─────────────────────────────┤                                 │
│ 💬 Typ of spreek...    🎤   │                                 │
└─────────────────────────────┴─────────────────────────────────┘
```

### AgendaBlock Modes (UI varianten)

**Mode 1: List View**
- Header: Datum range + close button
- Body: Scrollable lijst van appointment cards
- Footer: Link naar klassieke agenda

**Mode 2: Create Form**
- Header: "Nieuwe Afspraak" + close button
- Body: Form velden (patient, datum, tijd, type, locatie, notities)
- Footer: [Annuleren] [✓ Afspraak maken]

**Mode 3: Cancel View**
- Header: "Afspraak Annuleren" + close button
- Body: Appointment details + warning message
- Footer: [Terug] [✓ Annuleren]

**Mode 4: Reschedule Form**
- Header: "Afspraak Verzetten" + close button
- Body: Huidige tijd (readonly) + nieuwe tijd (editable)
- Footer: [Annuleren] [✓ Verzetten]

### Design Tokens

**Colors:**
- Primary: Teal-700 (#0F766E)
- User message: Amber-50 bg, amber-200 border
- AI message: Slate-100 bg, slate-300 border
- Appointment types: Blauw (intake), groen (behandeling), rood (crisis)

**Spacing:**
- Context bar: h-12 (48px)
- Chat/artifact gap: 16px
- Card spacing: space-y-4

**Typography:**
- Chat messages: text-sm
- Headers: text-base font-medium

---

## 6. Interacties met AI (functionele beschrijving)

🎯 **Doel:** Uitleggen waar AI in de flow voorkomt en wat de gebruiker ziet.

### AI-functies

| Locatie | AI-actie | Trigger | Input | Output |
|---------|----------|---------|-------|--------|
| **Chat Input** | Intent detection | User message | "afspraken vandaag" | Intent: 'agenda_query', confidence: 1.0 |
| **Chat Input** | Entity extraction | User message | "maak afspraak jan morgen 14:00" | Patient: "jan", date: tomorrow, time: "14:00" |
| **Chat Input** | Verduidelijkingsvraag | Incomplete info | "maak afspraak" | "Met welke patiënt wil je afspreken?" |
| **Chat Panel** | Streaming response | Intent detected | — | "Je hebt vandaag 3 afspraken..." (typed effect) |
| **Patient Search** | Fuzzy matching | "jan" input | Database query | Matches: "Jan de Vries", "Jan Bakker" |
| **Date Parser** | Natural language parsing | "morgen", "volgende week dinsdag" | Date string | ISO date: 2024-12-28 |

### AI Intent Detection (Two-Tier)

**Tier 1: Local Pattern Matching (<50ms)**
- Fast regex-based matching
- Client-side execution
- Confidence >= 0.8 → direct gebruiken

Voorbeelden:
- "afspraken vandaag" → Pattern: `/^afspraken?\b/i` → Match! (confidence: 1.0)
- "maak afspraak" → Pattern: `/^maak\s+afspraak/i` → Match! (confidence: 1.0)

**Tier 2: AI Fallback (Claude Haiku) (~400ms)**
- Voor onduidelijke/complexe input
- Server-side execution
- Triggered als local confidence <0.8

Voorbeelden:
- "ik wil graag een gesprek plannen" → AI: intent: 'create_appointment', confidence: 0.75
- "verzet hem naar volgende week" → AI: intent: 'reschedule', confidence: 0.7 (patient onduidelijk)

**Confidence Thresholds:**

| Confidence | Actie | Voorbeeld |
|------------|-------|-----------|
| **>0.9** | Direct artifact openen | "afspraken vandaag" |
| **0.7-0.9** | Artifact + bevestigingsvraag | "maak afspraak jan" (tijd ontbreekt) |
| **0.5-0.7** | Verduidelijkingsvraag in chat | "maak afspraak" |
| **<0.5** | Fallback: "Ik begrijp het niet" | Gibberish input |

### Voice Input (Deepgram)

**Functionaliteit:**
- Live transcription tijdens spreken
- Pause detection (1.5s stilte) → auto-submit
- Nederlands language model

**User experience:**
1. User drukt spatie (of klikt mic icon)
2. Mic wordt rood 🔴, waveform animatie
3. Live transcript verschijnt in input field
4. Na 1.5s stilte: auto-submit
5. Intent detection + artifact opening

**Voorbeeld:**
```
User: [Drukt spatie]
→ Mic: 🔴 LIVE
→ User spreekt: "maak afspraak met jan morgen om twee uur"
→ Transcript: "maak afspraak met jan morgen om twee uur"
→ [1.5s pause]
→ Auto-submit
→ AI parses: "twee uur" → "14:00"
→ AgendaBlock opent
```

---

## 7. Gebruikersrollen en rechten

🎯 **Doel:** Beschrijven welke rollen toegang hebben tot agenda functionaliteit.

| Rol | Toegang | Beperkingen |
|-----|---------|-------------|
| **Verpleegkundige** | Eigen afspraken maken/wijzigen/annuleren | Alleen eigen practitioner_id |
| **Behandelaar** | Eigen afspraken + caseload patiënten | Alleen eigen + team afspraken |
| **Manager** | Lezen alle afspraken | Geen create/update/delete |
| **Demo-user** | Volledige functionaliteit met fictieve data | Alleen lezen |

**Permissies:**

| Actie | Verpleegkundige | Behandelaar | Manager |
|-------|-----------------|-------------|---------|
| **Agenda query** (eigen) | ✅ | ✅ | ✅ |
| **Agenda query** (team) | ❌ | ✅ | ✅ |
| **Create appointment** | ✅ | ✅ | ❌ |
| **Cancel appointment** (eigen) | ✅ | ✅ | ❌ |
| **Reschedule** (eigen) | ✅ | ✅ | ❌ |

**Database-level (RLS):**
- Filter op `practitioner_id = current_user_id`
- Voor managers: read-only view

---

## 8. Bijlagen & Referenties

🎯 **Doel:** Linken naar overige documenten.

### Gerelateerde Documenten

**Swift Documentatie:**
- **Swift FO v3.0:** `docs/swift/fo-swift-medical-scribe-v3.md` - Basis conversational interface
- **Swift Bouwplan:** `docs/swift/bouwplan-swift-standalone-module.md` - Development roadmap
- **Developer Guide Intent System:** `docs/swift/developer-guide-intent-system.md` - Technische details intent detection
- **Scalability Architecture:** `docs/swift/architecture-intent-scalability.md` - Schaalbaarheid optimalisaties

**Agenda Implementatie:**
- **Klassieke Agenda:** `/app/epd/agenda` - Bestaande visuele kalender
- **Agenda Actions:** `/app/epd/agenda/actions.ts` - Server actions (wordt hergebruikt)
- **Encounters Schema:** Database schema voor afspraken

**Design & UX:**
- **PRD Ephemeral UI:** Conversational interface visie
- **UX Research:** Chat + artifacts pattern analyse

### Technische Specs (voor developers)

- **Gedetailleerd FO Agenda Planning:** `docs/swift/fo-swift-agenda-planning.md` - Uitgebreide technische specificatie
- **Intent Classifier:** `lib/swift/intent-classifier.ts` - Local pattern matching
- **AI Classifier:** `lib/swift/intent-classifier-ai.ts` - Claude Haiku fallback
- **Types:** `lib/swift/types.ts` - TypeScript type definitions

### Out of Scope (Toekomstige Versies)

❌ **Niet in MVP:**
- Full calendar grid view (blijft in klassieke agenda)
- Drag-and-drop rescheduling
- Recurring appointments ("elke dinsdag om 10:00")
- Beschikbaarheidscheck ("wanneer ben ik vrij")
- Conflict detection & resolution
- Multi-practitioner scheduling
- SMS/email notificaties

---

## Wijzigingslog

| Versie | Datum | Wijzigingen | Auteur |
|--------|-------|-------------|--------|
| v1.0 | 27-12-2024 | Initial version - Agenda & afspraken functionaliteit in Swift volgens FO template | Colin Lit |

---

**Goedkeuring:**

- [ ] Product Owner: _________________________
- [ ] Lead Developer: _________________________
- [ ] UX Designer: _________________________

**Status:** Draft - Ter review

**Volgende stappen:**
1. Review met stakeholders
2. UX wireframes maken op basis van dit FO
3. Technical implementation planning
4. User testing scenario's opstellen
