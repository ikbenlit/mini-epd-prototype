# Mission Control - Bouwplan

Projectnaam: Swift Agenda Planning Module  
Versie: v1.0  
Datum: 27-12-2025  
Auteur: Colin Lit  

---

## 1. Doel en context
Doel: een Swift Agenda Planning module bouwen waarmee gebruikers via chat afspraken kunnen opvragen, aanmaken, annuleren en verzetten, met een AgendaBlock artifact als visuele bevestiging.  
Toelichting: dit bouwt voort op het Swift conversatie‑model en hergebruikt de klassieke agenda (`/app/epd/agenda`) als full view. De Swift‑variant focust op snelle queries en quick actions.

---

## 2. Uitgangspunten

### 2.1 Technische Stack
- Frontend: Next.js App Router + React + TypeScript
- Styling: Tailwind CSS + shadcn/ui components
- State: Zustand (Swift store) + React Query for data caching
- Backend: Next.js route handlers + Supabase (encounters table)
- AI/Intent: Two-tier system (Local regex <50ms + Claude Haiku fallback ~400ms)
- Date/Time: date-fns library (al aanwezig)
- Auth: Supabase Auth (server-side guard via `lib/auth/server.ts`)
- Voice: Deepgram (existing integration voor voice input)

### 2.2 Projectkaders
- Scope (MVP): agenda_query, create_appointment, cancel_appointment, reschedule_appointment + AgendaBlock.
- Out of scope: drag-and-drop, recurring, availability, conflict resolution UI, multi-practitioner.
- Geen nieuwe dependencies zonder akkoord.
- Geen database migraties in MVP.
- Reuse bestaande agenda actions waar mogelijk.

### 2.3 Programmeer uitgangspunten
- DRY: hergebruik `app/epd/agenda/actions.ts` (getEncounters, createEncounter, cancelEncounter, rescheduleEncounter).
- KISS: snelle API routes + simpele AgendaBlock UI.
- SOC: intent parsing, data fetching en UI gescheiden.
- YAGNI: alleen P1/P2 uit FO, geen extra planner features.

### 2.4 Performance Targets
| Metric | Target | Actual (Expected) |
|--------|--------|-------------------|
| Local pattern match | <50ms | ~10-15ms |
| Local + entity extraction | <100ms | ~30-50ms |
| AI fallback (cold) | <800ms | ~400-600ms |
| AI fallback (warm) | <500ms | ~200-400ms |
| Total (local path) | <150ms | ~50-80ms |
| Total (AI path) | <1000ms | ~500-700ms |

### 2.5 Confidence Thresholds
| Confidence | Actie | Voorbeeld |
|------------|-------|-----------|
| **>0.9** | Direct artifact openen met prefill | "afspraken vandaag" |
| **0.7-0.9** | Artifact + bevestigingsvraag | "maak afspraak jan morgen" (tijd ontbreekt) |
| **0.5-0.7** | Verduidelijkingsvraag in chat | "maak afspraak" (patient/tijd ontbreekt) |
| **<0.5** | Fallback: "Ik begrijp het niet" | Gibberish input |

---

## 3. Epics & Stories Overzicht
| Epic ID | Titel | Doel | Status | Stories | Opmerkingen |
|---------|-------|------|--------|---------|-------------|
| E0 | Alignment & scope | MVP afbakenen en keuzes vastleggen | Done | 2 | FO‑based |
| E1 | Intent & entity layer | Agenda intents + entities toevoegen | Done | 4 | Swift intent stack |
| E2 | Date/time parsing | NLP‑helpers voor datum/tijd | Done | 3 | Geen nieuwe deps |
| E3 | Backend integratie | Agenda data APIs + reuse actions | Done | 4 | Auth vereist |
| E4 | AgendaBlock UI | List/create/cancel/reschedule views | To Do | 5 | Swift artifact |
| E5 | Chat orchestration | Action routing + prompt update | To Do | 3 | Swift chat API |
| E6 | QA & docs | Testplan + docs update | To Do | 3 | Manual QA |

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 — Alignment & scope
Epic doel: MVP scope, UX flows en beslissingen vastleggen.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E0.S1 | Scope + out-of-scope vastleggen | P1/P2 lijst bevestigd, OOS lijst bevestigd | Done | - | 1 |
| E0.S2 | UX flow beschrijven | Entry/exit, artifact gedrag en fallback flows gedocumenteerd | Done | E0.S1 | 2 |

UX flow (MVP):
- Entry: user is in Swift chat; agenda intents open AgendaBlock when confidence >= 0.7.
- Exit: close artifact via tab close; for full view use link to `/epd/agenda` from the AgendaBlock footer.
- Queries: default to today when clear; ask a clarification question when date range is missing or ambiguous.
- Create: require patient + date + time; use active patient when user says "deze patient"; otherwise ask in chat.
- Cancel/reschedule: if multiple matches, show disambiguation list in AgendaBlock; confirm before final action.
- Fallback: if intent confidence < 0.7, keep artifact closed and ask for missing details.

---

### Epic 1 — Intent & entity layer
Epic doel: agenda intent types en entities toevoegen aan Swift.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E1.S1 | SwiftIntent uitbreiden | Agenda intent names toegevoegd in types/store | Done | E0.S1 | 2 |
| E1.S2 | Local intent patterns | Regex patterns voor agenda intents in `intent-classifier.ts` | Done | E1.S1 | 3 |
| E1.S3 | AI fallback prompt | Prompt in `intent-classifier-ai.ts` uitgebreid met agenda intents | Done | E1.S1 | 3 |
| E1.S4 | Entities schema | `ExtractedEntities` uitgebreid met date/time/identifier | Done | E1.S1 | 2 |

**Technical notes:**

**E1.S1 - SwiftIntent type uitbreiding:**
- File: `lib/swift/types.ts`
- Houd `SwiftIntent` single source of truth (voorkom duplicatie).
- SwiftIntent (na uitbreiding):
  ```ts
  type SwiftIntent =
    | 'dagnotitie'
    | 'zoeken'
    | 'overdracht'
    | 'agenda_query'          // 🆕
    | 'create_appointment'    // 🆕
    | 'cancel_appointment'    // 🆕
    | 'reschedule_appointment'// 🆕
    | 'unknown';
  ```

**E1.S2 - Local pattern examples:**
- File: `lib/swift/intent-classifier.ts`
- Toevoegen aan `INTENT_PATTERNS`:
  ```ts
  agenda_query: [
    { pattern: /^afspraken?\\b/i, weight: 1.0 },
    { pattern: /^agenda\\b/i, weight: 1.0 },
    { pattern: /^(wat|wanneer)\\s+is\\s+(mijn\\s+)?volgende\\s+afspraak/i, weight: 1.0 },
  ],
  create_appointment: [
    { pattern: /^maak\\s+afspraak\\b/i, weight: 1.0 },
    { pattern: /^plan\\s+(een\\s+)?(intake|afspraak)\\b/i, weight: 1.0 },
  ],
  cancel_appointment: [
    { pattern: /^annuleer\\s+(de\\s+)?afspraak/i, weight: 1.0 },
  ],
  reschedule_appointment: [
    { pattern: /^verzet\\s+(de\\s+)?afspraak/i, weight: 1.0 },
    { pattern: /^\\d{1,2}:\\d{2}\\s+naar\\s+\\d{1,2}:\\d{2}/i, weight: 0.9 },
  ],
  ```

**E1.S3 - AI System Prompt addition:**
- File: `lib/swift/intent-classifier-ai.ts`
- Toevoegen aan `INTENT_CLASSIFIER_SYSTEM_PROMPT`:
  - Agenda intent descriptions + voorbeelden
  - Entity extraction instructies (patientName, dateRange, datetime, type, identifier, newDatetime)
  - Response format met nieuwe entities

**E1.S4 - ExtractedEntities uitbreiding:**
- File: `lib/swift/types.ts`
- Toevoegen:
  ```ts
  interface ExtractedEntities {
    // Bestaande entities
    patientName?: string;
    category?: VerpleegkundigCategory;
    content?: string;

    // 🆕 Agenda entities
    dateRange?: {
      start: Date;
      end: Date;
      label: 'vandaag' | 'morgen' | 'deze week' | 'volgende week' | 'custom';
    };
    datetime?: {
      date: Date;
      time: string; // "HH:mm" format
    };
    appointmentType?: 'intake' | 'behandeling' | 'follow-up' | 'telefonisch' |
                      'huisbezoek' | 'online' | 'crisis' | 'overig';
    location?: 'praktijk' | 'online' | 'thuis';
    identifier?: {
      type: 'patient' | 'time' | 'both';
      patientName?: string;
      patientId?: string;
      time?: string;
      date?: Date;
      encounterId?: string;
    };
    newDatetime?: {
      date: Date;
      time: string;
    };
  }
  ```

---

### Epic 2 — Date/time parsing
Epic doel: datum/tijd interpretatie uit natuurlijke taal.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E2.S1 | Date parser utility | `lib/swift/date-time-parser.ts` met relatieve datums | Done | E1.S4 | 3 |
| E2.S2 | Time parser utility | Tijd normalisatie (14:00, half drie) | Done | E2.S1 | 2 |
| E2.S3 | Entity extraction hook | Entity extractor gebruikt parser output | Done | E2.S2 | 2 |

**Technical notes:**

**E2.S1 - Date parser implementation:**
- File: `lib/swift/date-time-parser.ts`
- Functie: `parseRelativeDate(input: string): Date | DateRange | null`
- Ondersteunt:
  - "vandaag", "morgen", "overmorgen"
  - "maandag", "dinsdag", ... (next weekday)
  - "deze week", "volgende week" (returns DateRange)
  - Fallback naar date-fns `parse()` voor "30 december", "28-12-2024"
- Gebruik `date-fns` helpers: `addDays()`, `startOfWeek()`, `endOfWeek()`, `addWeeks()`

**E2.S2 - Time parser implementation:**
- Functie: `parseTime(input: string): string | null`
- Ondersteunt:
  - "14:00" → "14:00"
  - "14" → "14:00"
  - "twee uur" → "14:00"
  - "half drie" → "14:30"
  - "kwart voor drie" → "14:45"
- Returns `HH:mm` format string

**E2.S3 - Integration:**
- Parser functies worden aangeroepen in entity extraction flow
- Local pattern matching extraheert ruwe strings ("morgen", "14:00")
- Parser functies normaliseren naar Date/time formats
- AI fallback gebruikt parser voor validation

---

### Epic 3 — Backend integratie
Epic doel: agenda data ontsluiten voor Swift blocks.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E3.S1 | Agenda query API | Endpoint voor afspraken op datumrange (auth) | Done | E1.S4 | 3 |
| E3.S2 | Create appointment API | Endpoint die `createEncounter` aanroept | Done | E3.S1 | 3 |
| E3.S3 | Cancel/reschedule API | Endpoints die `cancelEncounter`/`rescheduleEncounter` aanroepen | Done | E3.S1 | 3 |
| E3.S4 | Patient match API | Fuzzy patiënt matching + disambiguation lijst | Done | E1.S4 | 2 |

**Technical notes:**

**E3.S1 - Agenda query endpoint:**
- Route: `GET /api/swift/agenda?start=2024-12-27&end=2024-12-27`
- Auth: via `createClient()` from `lib/auth/server.ts`
- Hergebruik: `getEncounters()` from `app/epd/agenda/actions.ts`
- Response: `{ appointments: Encounter[] }`
- Filters: practitioner_id = current user, status = 'planned', period_start in range
- Order: chronological (period_start ASC)

**E3.S2 - Create appointment endpoint:**
- Route: `POST /api/swift/agenda/create`
- Body: `{ patientId, datetime: { date, time }, type, location, notes? }`
- Validation: Zod schema, Dutch error messages
- Hergebruik: `createEncounter()` from `app/epd/agenda/actions.ts`
- Mapping:
  - type → typeCode (FHIR encounter type)
  - location → classCode ('AMB' = praktijk, 'VR' = online, 'HH' = thuis)
  - datetime → periodStart/periodEnd (1 hour duration default)
- Response: `{ encounterId, success: true }`

**E3.S3 - Cancel/Reschedule endpoints:**
- Route: `POST /api/swift/agenda/cancel`
- Body: `{ encounterId }`
- Hergebruik: `cancelEncounter(encounterId)` (soft delete: status → 'cancelled')

- Route: `POST /api/swift/agenda/reschedule`
- Body: `{ encounterId, newDatetime: { date, time } }`
- Hergebruik: `rescheduleEncounter(encounterId, periodStart, periodEnd)`

**E3.S4 - Patient search endpoint:**
- Route: `GET /api/swift/patients/search?q=jan`
- Fuzzy match op patient name (ILIKE %query%)
- Response: `{ patients: Array<{ id, name, bsn }> }`
- Limit: 10 resultaten
- Used voor: disambiguation bij meerdere matches

---

### Epic 4 — AgendaBlock UI
Epic doel: Swift artifact voor agenda flows.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E4.S1 | AgendaBlock skeleton | Block met tabs/modes (list/create/cancel/reschedule) | Done | E3.S1 | 3 |
| E4.S2 | List view | Lijst met afspraken + empty state | Done | E4.S1 | 3 |
| E4.S3 | Create form | Prefill + validatie + submit | Done | E4.S1 | 5 |
| E4.S4 | Cancel view | Disambiguation + confirm flow | Done | E4.S1 | 3 |
| E4.S5 | Reschedule view | Edit form met nieuwe tijd | Done | E4.S1 | 3 |

**Technical notes:**

**E4.S1 - AgendaBlock component structure:**
- File: `components/swift/artifacts/blocks/agenda-block.tsx`
- Props interface:
  ```ts
  interface AgendaBlockProps {
    mode: 'list' | 'create' | 'cancel' | 'reschedule';
    appointments?: Encounter[];
    dateRange?: { start: Date; end: Date; label: string };
    prefillData?: {
      patient?: { id: string; name: string };
      datetime?: { date: Date; time: string };
      type?: EncounterType;
      location?: EncounterLocation;
    };
    disambiguationOptions?: Encounter[];
    onClose?: () => void;
  }
  ```
- Architecture: switch statement op mode → render juiste sub-component
- Styling: max-width 600px, max-height 80vh, overflow-y auto

**E4.S2 - List view:**
- Component: `<AgendaListView />`
- Layout:
  - Header: Datum label (e.g., "Afspraken Vandaag - 27 december") + close button
  - Body: Scrollable lijst van appointment cards
  - Footer: Link naar `/epd/agenda` ("📅 Open volledige agenda →")
- Appointment card bevat:
  - Tijd (09:00 - 10:00)
  - Patient naam (klikbaar → opens PatientContextCard)
  - Type badge met color coding (intake=blauw, behandeling=groen, crisis=rood)
  - Locatie icon (📍 Praktijk, 🌐 Online, 🏠 Thuis)
  - Actions: [Details] [Annuleren]
- Empty state: "📭 Geen afspraken gevonden" + [Maak nieuwe afspraak] button

**E4.S3 - Create form:**
- Component: `<AgendaCreateForm />`
- Fields:
  - Patiënt* (autocomplete, pre-filled)
  - Datum* (date picker, pre-filled)
  - Tijd* (time picker 07:00-20:00, pre-filled)
  - Type* (radio buttons: Intake, Behandeling, Vervolg, Telefonisch, Huisbezoek, Crisis)
  - Locatie* (radio buttons: Praktijk, Online, Thuis)
  - Notities (textarea, optioneel, max 500 chars)
- Validation:
  - Patient required
  - Date cannot be in past
  - Time within 07:00-20:00
- Conflict warning: "⚠️ Conflict: Je hebt al een afspraak om 14:00 met Marie" (optional feature)
- Submit: [Annuleren] [✓ Afspraak maken]
- States: initial → validating → submitting → success/error

**E4.S4 - Cancel view:**
- Component: `<AgendaCancelView />`
- Submode 1: Disambiguation (multiple matches)
  - Radio list met opties: "○ 28-12-2024 09:00 - Jan de Vries (Intake)"
  - [Annuleren] [Volgende →] buttons
- Submode 2: Confirmation (single match or after disambiguation)
  - Appointment details card
  - Warning: "⚠️ Deze actie kan niet ongedaan worden gemaakt."
  - [Terug] [✓ Annuleren] buttons

**E4.S5 - Reschedule view:**
- Component: `<AgendaRescheduleForm />`
- Layout:
  - Afspraak details (readonly)
  - Huidige datum/tijd (readonly, strikethrough styling)
  - Nieuwe datum/tijd* (editable date + time pickers, pre-filled)
  - Conflict check: "✅ Geen conflicten gevonden" or warning
  - [Annuleren] [✓ Verzetten] buttons

**Styling specs:**
- Colors: Teal-700 primary, appointment type badges (zie FO sectie 13.3)
- Animations: slide-in from right 200ms, fade-out on close
- Typography: text-sm voor body, text-base voor headers
- Spacing: 16px padding, 12px card gaps

---

### Epic 5 — Chat orchestration
Epic doel: agenda intents laten landen in juiste artifact.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E5.S1 | Action routing | Agenda intents openen AgendaBlock met juiste mode | To Do | E4.S1 | 2 |
| E5.S2 | Chat prompt update | `/api/swift/chat` prompt bevat agenda sectie + action format | To Do | E1.S3 | 2 |
| E5.S3 | Error states | User-friendly errors + link naar `/epd/agenda` | To Do | E3.S1 | 2 |

**Technical notes:**

**E5.S1 - Intent router implementation:**
- Location: Swift store of artifact manager
- Functie: `openArtifactForIntent(intent, entities, confidence)`
- Logic:
  ```ts
  if (confidence < 0.7) return null; // Trigger verduidelijkingsvraag

  switch (intent) {
    case 'agenda_query':
      return { type: 'AgendaBlock', mode: 'list', prefill: { dateRange } };
    case 'create_appointment':
      if (!entities.patientName) return null; // Need patient
      return { type: 'AgendaBlock', mode: 'create', prefill: { patient, datetime, type, location } };
    case 'cancel_appointment':
      return { type: 'AgendaBlock', mode: 'cancel', prefill: { identifier } };
    case 'reschedule_appointment':
      if (!entities.identifier) return null; // Need to know which appointment
      return { type: 'AgendaBlock', mode: 'reschedule', prefill: { identifier, newDatetime } };
  }
  ```

**E5.S2 - Chat API system prompt addition:**
- File: `app/api/swift/chat/route.ts`
- Toevoegen aan system prompt:
  ```markdown
  ## Agenda & Afspraken Beheer

  Je helpt gebruikers met agenda-gerelateerde taken.

  ### Intents die je herkent:
  1. **agenda_query** - Afspraken opvragen
     Voorbeelden: "afspraken vandaag", "wat is volgende", "agenda morgen"
     Actie: Toon lijst van afspraken in AgendaBlock

  2. **create_appointment** - Nieuwe afspraak maken
     Voorbeelden: "maak afspraak met Jan morgen 14:00", "plan intake"
     Required: patient, date, time
     Optional: type (default: behandeling), location (default: praktijk)

  3. **cancel_appointment** - Afspraak annuleren
     Voorbeelden: "annuleer afspraak Jan", "cancel 14:00"
     Actie: Toon confirmation dialog

  4. **reschedule_appointment** - Afspraak verzetten
     Voorbeelden: "verzet 14:00 naar 15:00", "verzet Jan naar dinsdag"
     Actie: Toon edit form met oude + nieuwe tijd

  ### Entity Extraction:
  - Patient: extraheer volledige naam, gebruik activePatient als user zegt "deze patiënt"
  - Date/Time: parse relatieve datums ("morgen", "dinsdag"), validate geen verleden
  - Type: intake, behandeling, follow-up, telefonisch (default: behandeling)
  - Location: praktijk, online, thuis (default: praktijk)

  ### Verduidelijkingsvragen:
  Stel vragen bij:
  - Meerdere patiënten met zelfde naam
  - Onduidelijke datum
  - Ontbrekende tijd bij create
  - Meerdere matches bij cancel/reschedule
  ```

**E5.S3 - Error handling:**
- Server errors: "Er ging iets mis bij het ophalen van je afspraken. Probeer het opnieuw of [open de volledige agenda](/epd/agenda)."
- Auth errors: Redirect naar `/login`
- Validation errors: Dutch messages ("Datum kan niet in het verleden liggen")
- Network errors: Retry logic + user-friendly message

---

### Epic 6 — QA & docs
Epic doel: kwaliteit borgen en documentatie updaten.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E6.S1 | Manual test checklist | Scenarios uit FO opgenomen | To Do | E5.S3 | 2 |
| E6.S2 | Docs update | Bouwplan + release note bijgewerkt | To Do | E6.S1 | 1 |
| E6.S3 | Regression checks | Swift en klassieke agenda blijven werken | To Do | E6.S1 | 2 |

---

## 5. Kwaliteit & Testplan

Test types:
| Test Type | Scope | Tools | Verantwoordelijke |
|-----------|-------|-------|-------------------|
| Lint | App code | pnpm lint | Developer |
| Type check | TypeScript | pnpm build | Developer |
| Smoke tests | Agenda intents + artifact flows | Manual checklist (20 scenarios) | Developer/UX |
| Regression | /epd/agenda klassiek | Manual checklist | Developer |

### Manual Test Checklist (uit FO, 20 scenarios):

| # | Scenario | Expected Result | Priority | Status |
|---|----------|-----------------|----------|--------|
| 1 | "afspraken vandaag" | AgendaBlock list view, toont vandaag's afspraken | P1 | ⬜ |
| 2 | "wat is volgende afspraak" | Chat response met eerstvolgende, AgendaBlock toont details | P1 | ⬜ |
| 3 | "maak afspraak jan morgen 14:00" | Create form met prefill, patient gevonden | P1 | ⬜ |
| 4 | Voice: "maak intake marie vrijdag 10:00" | Transcript correct, create form opent | P2 | ⬜ |
| 5 | "maak afspraak" (incomplete) | Verduidelijkingsvraag: "Met welke patiënt?" | P1 | ⬜ |
| 6 | "maak afspraak onbekende patient" | Patient search fallback, suggesties | P2 | ⬜ |
| 7 | Create form submit → success | Toast, chat confirmation, artifact sluit | P1 | ⬜ |
| 8 | "annuleer afspraak jan" (1 match) | Confirmation dialog, direct match | P1 | ⬜ |
| 9 | "annuleer afspraak jan" (3 matches) | Disambiguation radio list | P1 | ⬜ |
| 10 | Cancel confirm → success | Afspraak status=cancelled, toast | P1 | ⬜ |
| 11 | "verzet 14:00 naar 15:00" | Reschedule form, tijd pre-filled | P1 | ⬜ |
| 12 | Reschedule submit → success | Tijd updated, toast confirmation | P1 | ⬜ |
| 13 | Conflict warning (overlapping) | Warning banner in create form | P2 | ⬜ |
| 14 | Click patient name in list | PatientContextCard opent | P2 | ⬜ |
| 15 | Click "Details" button | Navigates to /epd/agenda with filter | P2 | ⬜ |
| 16 | Empty state (geen afspraken) | Placeholder met "Maak nieuwe afspraak" | P1 | ⬜ |
| 17 | Server error tijdens query | Error in chat, geen artifact | P1 | ⬜ |
| 18 | Date in past validation | "Kan geen afspraken in verleden maken" | P1 | ⬜ |
| 19 | Context-aware: "maak afspraak deze patient" | Gebruikt active patient uit context | P2 | ⬜ |
| 20 | Multiple artifacts (3 max) | Agenda + Dagnotitie + Context card, tabs | P2 | ⬜ |

### Regression Test Checklist:

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| R1 | Klassieke agenda `/epd/agenda` werkt nog | Kan afspraken zien/maken/wijzigen | ⬜ |
| R2 | Swift dagnotitie intent ongewijzigd | "dagnotitie jan medicatie" opent DagnotatieBlock | ⬜ |
| R3 | Swift zoeken intent ongewijzigd | "zoek jan" opent ZoekenBlock | ⬜ |
| R4 | Swift overdracht intent ongewijzigd | "overdracht" opent OverdrachtBlock | ⬜ |
| R5 | Auth guard op alle endpoints | Geen auth → 401/redirect | ⬜ |

### Performance Test Targets:

| Metric | Target | Test Method |
|--------|--------|-------------|
| Local pattern match | <50ms | Browser DevTools Network tab |
| Create form open | <150ms total | Lighthouse/manual timing |
| AI fallback | <1000ms | DevTools, onduidelijke input |
| List view render (10 items) | <100ms | React DevTools Profiler |

---

## 6. User Stories (uit FO)

### Primaire User Stories (P1 - MVP):

| ID | Als | Wil ik | Zodat | Acceptatie |
|----|-----|--------|-------|------------|
| US-24 | Verpleegkundige | Snel overzicht afspraken vandaag | Ik weet waar ik moet zijn | "afspraken vandaag" → lijst in AgendaBlock, <3 sec |
| US-25 | Verpleegkundige | Check volgende afspraak tijdens werk | Ik op tijd ben | "wat is mijn volgende afspraak?" → directe info |
| US-27 | Verpleegkundige | Snelle afspraak tijdens telefoongesprek | Ik direct kan plannen | "maak afspraak jan morgen 14:00" → prefilled form, <15 sec |
| US-28 | Verpleegkundige | Context-aware planning | Ik niet steeds naam hoef te typen | "maak afspraak met deze patiënt" → gebruikt actieve patiënt |
| US-29 | Verpleegkundige | Voice input tijdens consult | Ik hands-free kan werken | Spraak → afspraak maken |
| US-30 | Verpleegkundige | Annuleren via chat | Ik snel kan annuleren | "annuleer afspraak jan" → confirmation → done |
| US-31 | Verpleegkundige | Snel verzetten | Ik afspraken flexibel kan aanpassen | "verzet 14:00 naar 15:00" → tijd update |

### Secundaire User Stories (P2 - Nice to Have):

| ID | Als | Wil ik | Zodat | Acceptatie |
|----|-----|--------|-------|------------|
| US-26 | Verpleegkundige | Weekoverzicht bekijken | Ik kan plannen | "agenda deze week" → gefilterde lijst |
| US-32 | Verpleegkundige | Disambiguation bij meerdere matches | Systeem helpt kiezen | Systeem vraagt "Welke Jan?" → lijst opties |

---

## 7. File Structuur (na implementatie)

```
lib/swift/
├── types.ts                         # SwiftIntent + ExtractedEntities uitbreidingen
├── intent-classifier.ts              # Local patterns voor agenda intents
├── intent-classifier-ai.ts           # AI prompt uitbreidingen
└── date-time-parser.ts               # 🆕 Date/time parsing utilities

app/api/swift/
├── agenda/
│   ├── route.ts                      # 🆕 GET agenda query endpoint
│   ├── create/route.ts               # 🆕 POST create appointment
│   ├── cancel/route.ts               # 🆕 POST cancel appointment
│   └── reschedule/route.ts           # 🆕 POST reschedule appointment
├── patients/
│   └── search/route.ts               # 🆕 GET fuzzy patient search
└── chat/route.ts                     # Updated: agenda system prompt

components/swift/artifacts/blocks/
├── agenda-block.tsx                  # 🆕 Main AgendaBlock component
├── agenda-list-view.tsx              # 🆕 List mode
├── agenda-create-form.tsx            # 🆕 Create mode
├── agenda-cancel-view.tsx            # 🆕 Cancel mode
└── agenda-reschedule-form.tsx        # 🆕 Reschedule mode

app/epd/agenda/
└── actions.ts                        # ♻️ Hergebruikt (getEncounters, createEncounter, etc.)
```

---

## 8. Demo & Presentatieplan
Doel: korte demo van agenda planning via Swift (5 minuten).

**Demo Flow:**
1. **Agenda query**: "afspraken vandaag" → lijst met 3 afspraken
2. **Quick create**: "maak afspraak met Jan morgen 14:00" → create form → submit → success toast
3. **Cancel flow**: "annuleer afspraak Jan" → disambiguation (3 matches) → select → confirm → success
4. **Reschedule**: "verzet de 14:00 naar 15:00" → edit form → submit → success
5. **Fallback**: Link naar klassieke agenda tonen via footer

**Key Messaging:**
- Swift = snelle queries en actions (10-15 sec)
- Klassieke agenda = visuele planning en overzicht
- Voice input = hands-free werken tijdens consult

---

## 9. Risico's & Mitigatie
| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| Intent ambigu | Hoog | Middel | Disambiguation + fallback prompt | UX |
| Date/time parsing faalt | Middel | Middel | AI fallback + clear prompts | Dev |
| API auth issues | Laag | Hoog | Central auth guard + error messaging | Dev |
| Scope creep | Hoog | Middel | MVP guardrails | PO |

---

## 10. Sprint Planning & Implementatie Volgorde

### Voorgestelde Sprint Indeling (3 sprints):

**Sprint 1: Foundation (E1 + E2)**
- Focus: Intent layer + date/time parsing
- Stories: E1.S1, E1.S2, E1.S3, E1.S4, E2.S1, E2.S2, E2.S3
- Total: 17 SP
- Oplevering: Intent detection + entity extraction werkend, nog geen UI
- Test: Console log check van extracted entities

**Sprint 2: Backend + UI Foundation (E3 + E4.S1-S2)**
- Focus: API endpoints + AgendaBlock basis
- Stories: E3.S1, E3.S2, E3.S3, E3.S4, E4.S1, E4.S2
- Total: 14 SP
- Oplevering: Agenda query werkend met list view
- Test: "afspraken vandaag" end-to-end

**Sprint 3: UI Completion + Integration (E4.S3-S5 + E5 + E6)**
- Focus: Create/cancel/reschedule forms + orchestration
- Stories: E4.S3, E4.S4, E4.S5, E5.S1, E5.S2, E5.S3, E6.S1, E6.S2, E6.S3
- Total: 20 SP
- Oplevering: MVP compleet
- Test: Alle 20 test scenarios

**Total MVP: 51 SP (~3 sprints à 2 weken = 6 weken)**

### Implementatie Volgorde (binnen stories):

Voor elke story, volg deze volgorde:
1. **Types first**: Definieer interfaces/types
2. **Backend**: API endpoints + server actions
3. **Frontend**: UI components
4. **Integration**: Wire backend ↔ frontend
5. **Test**: Manual test scenario's

### Critical Path:
```
E1.S1 (types) → E1.S2 (patterns) → E1.S4 (entities) → E2 (parsers) →
E3.S1 (query API) → E4.S1 (skeleton) → E4.S2 (list view) →
E5.S1 (routing) → Milestone: Basic Query Werkend

E3.S2 (create API) → E4.S3 (create form) → Milestone: Create Werkend

E3.S3 (cancel API) → E4.S4 (cancel view) → Milestone: Cancel Werkend

E4.S5 (reschedule) → E5.S2 (prompt) → E6 (QA) → MVP Done
```

---

## 11. Evaluatie & Lessons Learned
Te documenteren na oplevering:
- Welke intents vaak misclassificeren?
- Hoe snel users afspraken kunnen plannen?
- Zijn extra agenda features nodig?

---

## 12. Referenties & Documentatie

### Primaire Documenten:
- **FO Agenda Afspraken**: `docs/swift/fo-agenda-afspraken.md` - Gebruikersgericht FO
- **FO Agenda Planning**: `docs/swift/fo-swift-agenda-planning.md` - Technisch FO met detailed specs
- **Swift FO v3**: `docs/swift/fo-swift-medical-scribe-v3.md` - Basis conversational interface
- **Swift Bouwplan Core**: `docs/swift/bouwplan-swift-standalone-module.md` - Development roadmap

### Code Referenties:
- **Bestaande Agenda**: `app/epd/agenda` - Klassieke kalender (wordt hergebruikt)
- **Agenda Actions**: `app/epd/agenda/actions.ts` - Server actions (getEncounters, createEncounter, etc.)
- **Swift Chat API**: `app/api/swift/chat/route.ts` - Conversational endpoint
- **Intent Classifier**: `lib/swift/intent-classifier.ts` - Local pattern matching
- **AI Classifier**: `lib/swift/intent-classifier-ai.ts` - Claude Haiku fallback
- **Swift Types**: `lib/swift/types.ts` - SwiftIntent & ExtractedEntities

### Libraries & Dependencies:
- **date-fns**: Date/time utilities (already installed)
- **Zod**: API validation schemas (already installed)
- **React Query**: Data caching (already installed)
- **shadcn/ui**: UI components (already installed)
- **Deepgram**: Voice input (already integrated)

### External References:
- [FHIR Encounter Resource](https://www.hl7.org/fhir/encounter.html) - Encounter data model
- [date-fns Documentation](https://date-fns.org/) - Date manipulation
- [React Query Best Practices](https://tanstack.com/query/latest) - Caching patterns

---

## 13. Glossary & Abbreviations

| Term | Betekenis |
|------|-----------|
| **Epic** | Grote feature of fase, bevat meerdere stories |
| **Story** | Kleine uitvoerbare taak (user story) |
| **SP** | Story Points - schatting van complexiteit |
| **MVP** | Minimum Viable Product |
| **FO** | Functioneel Ontwerp |
| **P1/P2** | Priority 1 (must have) / Priority 2 (nice to have) |
| **SSE** | Server-Sent Events |
| **RLS** | Row Level Security (Supabase) |
| **NLP** | Natural Language Processing |
| **Artifact** | Swift UI component (AgendaBlock, DagnotatieBlock, etc.) |
| **Intent** | Gebruikersintentie (agenda_query, create_appointment, etc.) |
| **Entity** | Geëxtraheerde data uit user input (patient, date, time) |
| **Disambiguation** | Verduidelijking bij meerdere matches |
| **Confidence** | Zekerheid van intent classificatie (0.0-1.0) |
| **Two-tier** | Local pattern matching + AI fallback systeem |
| **FHIR** | Fast Healthcare Interoperability Resources |
| **Encounter** | Afspraak/contact in FHIR terminologie |

### Domain-Specific Terms:

| Term | Betekenis |
|------|-----------|
| **Klassieke Agenda** | Bestaande visuele kalender in `/epd/agenda` |
| **Swift Agenda** | Nieuwe conversational agenda interface |
| **AgendaBlock** | Swift artifact voor agenda functionaliteit |
| **Verpleegkundige** | Primaire gebruikersrol (nurse/healthcare provider) |
| **Practitioner** | FHIR term voor zorgverlener |
| **Quick Create** | Snel afspraak maken via natuurlijke taal |
| **Hands-free** | Werken met voice input (geen typen nodig) |

---

## Versiehistorie

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 27-12-2025 | Colin Lit | Initiele versie - basis epics en stories |
| v1.1 | 27-12-2025 | Claude Code | Uitgebreid met technische details uit FO's: patterns, entities, API specs, UI components, test scenarios, sprint planning, file structuur |

---

## Quick Reference Card

**Voor Developers - Start Here:**
1. Lees Epic 0 voor scope
2. Begin met E1.S1 (types uitbreiden)
3. Volg implementatie volgorde (sectie 10)
4. Check test scenarios (sectie 5)
5. Zie file structuur (sectie 7) voor waar code moet komen

**Voor Product Owners:**
- MVP scope: sectie 2.2
- User stories: sectie 6
- Demo plan: sectie 8
- Risico's: sectie 9

**Voor QA:**
- Test checklist: sectie 5 (20 scenarios)
- Regression tests: sectie 5
- Performance targets: sectie 2.4

**Voor Designers:**
- UI components: Epic 4 technical notes
- Styling specs: E4.S1-E4.S5
- User flows: FO documenten (zie sectie 12)
