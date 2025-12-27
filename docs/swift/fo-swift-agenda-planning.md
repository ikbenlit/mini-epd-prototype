# 🧩 Functioneel Ontwerp (FO) — Swift Agenda Planning

**Projectnaam:** Swift — Agenda Planning Module
**Versie:** v1.0
**Datum:** 27-12-2024
**Auteur:** Colin Lit

---

## 1. Doel en Context

🎯 **Doel van dit document:**
Dit Functioneel Ontwerp beschrijft de **agenda/afspraken planning functionaliteit** binnen Swift. De gebruiker kan via natuurlijke conversatie afspraken bekijken, aanmaken, wijzigen en annuleren. Het systeem biedt een snelle, hands-free interface die de bestaande visuele kalender (`/epd/agenda`) aanvult.

📘 **Relatie met andere documenten:**
- **Swift FO v3.0:** `fo-swift-medical-scribe-v3.md` — Basis conversational interface
- **Bouwplan Swift:** `bouwplan-swift-standalone-module.md` — Development roadmap
- **Klassieke Agenda:** `/app/epd/agenda` — Bestaande visuele kalender implementatie

**Kernprincipe:**
> De gebruiker vraagt via chat om agenda-informatie of spreekt een planningsintentie uit. Swift herkent het intent, toont relevante afspraken in een AgendaBlock artifact, en faciliteert quick actions via natuurlijke taal. Voor complexe visuele planning blijft de gebruiker de klassieke kalender gebruiken.

**Toegevoegde Waarde:**

| Aspect | Klassieke Agenda | Swift Agenda |
|--------|------------------|--------------|
| Gebruik | Visuele planning, overzicht | Quick actions, queries |
| Input | Klikken, formulieren | Natuurlijke taal, spraak |
| Snelheid | ~30-60 sec voor nieuwe afspraak | ~10-15 sec via conversatie |
| Context | Vereist manuele navigatie | Context-aware (actieve patiënt) |
| Ideaal voor | Weekplanning, drag-drop | Telefoon intake, snelle check |

---

## 2. Scope & Prioritering

### 2.1 In Scope (MVP)

✅ **P1 - Must Have:**
- Agenda queries: "afspraken vandaag", "wat is volgende afspraak"
- AgendaBlock artifact met lijst-weergave
- Quick create: "maak afspraak met Jan morgen 14:00"
- Annuleren via chat: "annuleer afspraak van Jan"
- Reschedule: "verzet 14:00 naar 15:00"

✅ **P2 - Should Have:**
- Disambiguation bij meerdere matches
- Voice input support voor alle commando's
- Link naar klassieke agenda voor full view
- Context-aware suggestions (recent patients)

### 2.2 Out of Scope (Toekomstige Versies)

❌ **Niet in MVP:**
- Full calendar grid weergave (blijft in `/epd/agenda`)
- Drag-and-drop rescheduling
- Recurring appointments ("elke dinsdag om 10:00")
- Beschikbaarheidscheck ("wanneer ben ik vrij")
- Conflict detection & resolution
- Multi-practitioner scheduling
- SMS/email notificaties

---

## 3. Systeemcomponenten

| # | Component | Beschrijving | Type |
|---|-----------|--------------|------|
| 1 | **Chat Panel** | Natuurlijke taal input voor agenda commando's | UI Zone |
| 2 | **AgendaBlock** | Artifact toont afspraken lijst en forms | Artifact |
| 3 | **Intent Engine** | Herkent agenda intents (query/create/cancel/reschedule) | Backend |
| 4 | **Encounter Actions** | Reuse bestaande server actions uit `/epd/agenda/actions.ts` | Backend |
| 5 | **Patient Search** | Fuzzy matching voor patiëntnamen | Backend |
| 6 | **Date/Time Parser** | NLP voor datum/tijd extractie uit natuurlijke taal | Backend |

---

## 4. User Stories

### 4.1 Agenda Queries

| ID | Rol | Doel / Actie | Verwachte waarde | Prio |
|----|-----|--------------|------------------|------|
| US-24 | Verpleegkundige | Snel overzicht van afspraken vandaag | "Afspraken vandaag" → lijst in AgendaBlock | 🔴 P1 |
| US-25 | Verpleegkundige | Check volgende afspraak tijdens werk | "Wat is mijn volgende afspraak?" → directe info | 🔴 P1 |
| US-26 | Verpleegkundige | Weekoverzicht bekijken | "Agenda deze week" → gefilterde lijst | 🟡 P2 |

### 4.2 Afspraak Aanmaken

| ID | Rol | Doel / Actie | Verwachte waarde | Prio |
|----|-----|--------------|------------------|------|
| US-27 | Verpleegkundige | Snelle afspraak tijdens telefoongesprek | "Maak intake Jan morgen 14:00" → prefilled form | 🔴 P1 |
| US-28 | Verpleegkundige | Context-aware planning | "Maak afspraak met deze patiënt" → gebruikt active patient | 🔴 P1 |
| US-29 | Verpleegkundige | Voice input tijdens consult | Hands-free afspraak maken | 🟡 P2 |

### 4.3 Afspraak Wijzigen

| ID | Rol | Doel / Actie | Verwachte waarde | Prio |
|----|-----|--------------|------------------|------|
| US-30 | Verpleegkundige | Annuleren via chat | "Annuleer afspraak Jan" → confirmation → done | 🔴 P1 |
| US-31 | Verpleegkundige | Snel verzetten | "Verzet 14:00 naar 15:00" → tijd update | 🔴 P1 |
| US-32 | Verpleegkundige | Disambiguation bij meerdere matches | Systeem vraagt "Welke Jan?" → lijst opties | 🟡 P2 |

---

## 5. Intent System Integratie

🎯 **Doel:** Beschrijven hoe de agenda intents integreren met het bestaande Swift two-tier intent systeem.

### 5.1 Bestaande Intent Architectuur

Swift gebruikt een **hybride two-tier classificatie systeem** voor intent detection:

**Tier 1: Local Pattern Matching** (`lib/swift/intent-classifier.ts`)
- Fast regex-based matching
- Client-side execution
- Target: <50ms response time
- Confidence threshold: ≥0.8 → direct gebruiken, geen AI nodig

**Tier 2: AI Fallback** (`lib/swift/intent-classifier-ai.ts`)
- Claude Haiku API voor onduidelijke input
- Server-side execution (~200-500ms)
- Triggered wanneer local confidence <0.8
- Entity extraction + reasoning

**Huidige Intents (voor agenda toevoeging):**

```typescript
type SwiftIntent =
  | 'dagnotitie'  // Notitie maken voor patiënt
  | 'zoeken'      // Patiënt zoeken
  | 'overdracht'  // Dienst overdracht
  | 'unknown';    // Niet herkend
```

### 5.2 Nieuwe Intent Types

**Na integratie:**

```typescript
type SwiftIntent =
  | 'dagnotitie'
  | 'zoeken'
  | 'overdracht'
  | 'agenda_query'          // 🆕 Afspraken opvragen
  | 'create_appointment'    // 🆕 Nieuwe afspraak
  | 'cancel_appointment'    // 🆕 Afspraak annuleren
  | 'reschedule_appointment'// 🆕 Afspraak verzetten
  | 'unknown';
```

### 5.3 Tier 1: Local Pattern Extensions

**Toevoegen aan `INTENT_PATTERNS` in `intent-classifier.ts`:**

```typescript
const INTENT_PATTERNS: Record<Exclude<SwiftIntent, 'unknown'>, PatternConfig[]> = {
  // ... bestaande patterns (dagnotitie, zoeken, overdracht)

  // 🆕 Agenda query patterns
  agenda_query: [
    { pattern: /^afspraken?\b/i, weight: 1.0 },
    { pattern: /^agenda\b/i, weight: 1.0 },
    { pattern: /^wat\s+zijn\s+(mijn\s+)?afspraken/i, weight: 1.0 },
    { pattern: /^(wat|wanneer)\s+is\s+(mijn\s+)?volgende\s+afspraak/i, weight: 1.0 },
    { pattern: /^afspraken\s+(vandaag|morgen|deze\s+week|volgende\s+week)/i, weight: 0.95 },
    { pattern: /^(vandaag|morgen|deze\s+week)\s+afspraken/i, weight: 0.9 },
    { pattern: /^toon\s+agenda/i, weight: 0.9 },
    { pattern: /^planning\s+(vandaag|morgen|week)/i, weight: 0.85 },
  ],

  // 🆕 Create appointment patterns
  create_appointment: [
    { pattern: /^maak\s+afspraak\b/i, weight: 1.0 },
    { pattern: /^plan\s+(een\s+)?(intake|afspraak)\b/i, weight: 1.0 },
    { pattern: /^afspraak\s+(maken|plannen|inplannen)\b/i, weight: 0.95 },
    { pattern: /^nieuwe?\s+afspraak\b/i, weight: 0.95 },
    { pattern: /^(intake|behandeling|gesprek)\s+\w+\s+(morgen|vandaag|volgende)/i, weight: 0.85 },
    { pattern: /^(intake|behandeling)\s+(met\s+)?\w+/i, weight: 0.8 },
  ],

  // 🆕 Cancel appointment patterns
  cancel_appointment: [
    { pattern: /^annuleer\s+(de\s+)?afspraak/i, weight: 1.0 },
    { pattern: /^cancel\s+(de\s+)?afspraak/i, weight: 1.0 },
    { pattern: /^verwijder\s+afspraak/i, weight: 0.95 },
    { pattern: /^afspraak\s+annuleren/i, weight: 0.95 },
    { pattern: /^annuleer\s+\w+/i, weight: 0.7 }, // "annuleer jan"
  ],

  // 🆕 Reschedule appointment patterns
  reschedule_appointment: [
    { pattern: /^verzet\s+(de\s+)?afspraak/i, weight: 1.0 },
    { pattern: /^verplaats\s+(de\s+)?afspraak/i, weight: 1.0 },
    { pattern: /^verschuif\s+afspraak/i, weight: 0.95 },
    { pattern: /^afspraak\s+verzetten/i, weight: 0.95 },
    { pattern: /^\d{1,2}:\d{2}\s+naar\s+\d{1,2}:\d{2}/i, weight: 0.9 }, // "14:00 naar 15:00"
    { pattern: /^verzet\s+\w+\s+naar/i, weight: 0.85 }, // "verzet jan naar dinsdag"
  ],
};
```

**Voorbeelden van local matches:**

| User Input | Matched Pattern | Confidence | Time |
|------------|----------------|------------|------|
| "afspraken vandaag" | `/^afspraken?\b/i` | 1.0 | ~8ms |
| "maak afspraak jan morgen 14:00" | `/^maak\s+afspraak\b/i` | 1.0 | ~10ms |
| "verzet 14:00 naar 15:00" | `/^\d{1,2}:\d{2}\s+naar/i` | 0.9 | ~12ms |
| "annuleer afspraak" | `/^annuleer\s+afspraak/i` | 1.0 | ~9ms |

### 5.4 Tier 2: AI System Prompt Extension

**Update in `INTENT_CLASSIFIER_SYSTEM_PROMPT` (`intent-classifier-ai.ts`):**

```typescript
const INTENT_CLASSIFIER_SYSTEM_PROMPT = `Je bent een intent classifier voor Swift EPD.

Classificeer de intentie van een zorgmedewerker in één van deze categorieën:

**Bestaande intents:**
1. **dagnotitie** - Notitie maken over patiënt
   Voorbeelden: "notitie jan medicatie", "marie rustige nacht", "schrijf observatie"

2. **zoeken** - Patiënt zoeken of info opvragen
   Voorbeelden: "zoek jan", "wie is marie", "dossier van piet"

3. **overdracht** - Dienst overdracht/samenvatting
   Voorbeelden: "overdracht", "wat moet ik weten", "dienst afronden"

**Nieuwe agenda intents:**
4. **agenda_query** - Afspraken opvragen
   Voorbeelden: "afspraken vandaag", "wat is mijn volgende afspraak", "agenda morgen"
   Extraheer: dateRange { start, end, label: "vandaag"|"morgen"|"deze week"|"volgende week" }

5. **create_appointment** - Nieuwe afspraak maken
   Voorbeelden: "maak afspraak jan morgen 14:00", "plan intake vrijdag", "gesprek met marie"
   Extraheer: patientName, date, time, type (intake|behandeling|follow-up|telefonisch|crisis)

6. **cancel_appointment** - Afspraak annuleren
   Voorbeelden: "annuleer jan", "cancel afspraak van 14:00", "verwijder intake morgen"
   Extraheer: identifier { type: "patient"|"time"|"both", patientName?, time?, date? }

7. **reschedule_appointment** - Afspraak verzetten
   Voorbeelden: "verzet jan naar dinsdag", "14:00 wordt 15:00", "verplaats naar morgen"
   Extraheer: identifier (oude afspraak), newDatetime { date, time }

8. **unknown** - Intentie onduidelijk

**Response format:**
{
  "intent": "...",
  "confidence": 0.0-1.0,
  "entities": {
    "patientName": "...",           // Voor alle patient-gerelateerde acties
    "category": "medicatie|adl|...", // Alleen voor dagnotitie
    "content": "...",               // Alleen voor dagnotitie
    "dateRange": {                  // Voor agenda_query
      "start": "2024-12-27",
      "end": "2024-12-27",
      "label": "vandaag"
    },
    "date": "2024-12-28",           // Voor create/reschedule
    "time": "14:00",                // Voor create/reschedule
    "type": "intake",               // Voor create_appointment
    "identifier": {                 // Voor cancel/reschedule
      "type": "patient",
      "patientName": "Jan"
    },
    "newDatetime": {                // Alleen voor reschedule
      "date": "2024-12-31",
      "time": "15:00"
    }
  },
  "reasoning": "Korte uitleg van classificatie"
}

**Belangrijke regels:**
- Bij twijfel tussen intents: kies het meest specifieke
- Als cruciale info ontbreekt (patient/tijd): lower confidence (0.5-0.7)
- "deze patiënt" zonder context: gebruik activePatient indien beschikbaar
- Relatieve datums parsen: "morgen", "dinsdag", "volgende week"
- Tijden normaliseren: "twee uur" → "14:00", "half drie" → "14:30"
`;
```

**AI Fallback voorbeelden:**

| User Input | Local Result | AI Triggered? | AI Response |
|------------|--------------|---------------|-------------|
| "afspraken vandaag" | confidence 1.0 | ❌ No | — |
| "ik wil graag een gesprek plannen" | confidence 0.0 | ✅ Yes | intent: create_appointment, conf: 0.75 |
| "verzet hem naar volgende week" | confidence 0.0 | ✅ Yes | intent: reschedule, conf: 0.7 (patient onduidelijk) |
| "kan ik marie ergens tussen proppen" | confidence 0.0 | ✅ Yes | intent: create_appointment, conf: 0.65 |

### 5.5 Entity Extraction Schema

**Uitbreiding van `ExtractedEntities` type:**

```typescript
interface ExtractedEntities {
  // Bestaande entities (dagnotitie, zoeken)
  patientName?: string;
  category?: VerpleegkundigCategory;
  content?: string;

  // 🆕 Agenda-specifieke entities
  dateRange?: {
    start: Date;
    end: Date;
    label: 'vandaag' | 'morgen' | 'deze week' | 'volgende week' | 'custom';
  };

  datetime?: {
    date: Date;      // ISO date
    time: string;    // "HH:mm" format
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
    encounterId?: string; // Als eenduidig gevonden
  };

  newDatetime?: {  // Alleen voor reschedule
    date: Date;
    time: string;
  };
}
```

### 5.6 Confidence Flow Diagram

```
User Input: "maak afspraak jan morgen 14:00"
      ↓
┌─────────────────────────────────────────────────┐
│ TIER 1: Local Pattern Matching                  │
│ Pattern: /^maak\s+afspraak\b/i                  │
│ Match: ✅ Weight 1.0                             │
│ Confidence: 1.0                                 │
│ Processing: ~10ms                               │
└─────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────┐
│ Confidence Check: 1.0 >= 0.8                    │
│ Decision: ✅ Skip AI, use local result          │
└─────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────┐
│ Basic Entity Extraction (local)                 │
│ - Patient: "jan" (fuzzy search needed)          │
│ - Date: "morgen" → parse to tomorrow's date     │
│ - Time: "14:00"                                 │
│ - Type: default to 'behandeling'                │
└─────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────┐
│ Intent Router                                    │
│ Intent: 'create_appointment'                    │
│ Action: Open AgendaBlock (mode: create)         │
└─────────────────────────────────────────────────┘
      ↓
   [AgendaBlock create form met prefill]
```

```
User Input: "ik wil graag iets regelen voor volgende week"
      ↓
┌─────────────────────────────────────────────────┐
│ TIER 1: Local Pattern Matching                  │
│ Match: ❌ No direct pattern match                │
│ Confidence: 0.0                                 │
└─────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────┐
│ Confidence Check: 0.0 < 0.8                     │
│ Decision: ✅ Trigger AI Fallback                │
└─────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────┐
│ TIER 2: AI Classification (Claude Haiku)        │
│ Prompt: "Classificeer: ..."                     │
│ Response:                                       │
│   intent: "create_appointment"                  │
│   confidence: 0.65                              │
│   entities: { dateRange: "volgende week" }      │
│   reasoning: "Patient en tijd ontbreken"       │
│ Processing: ~380ms                              │
└─────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────┐
│ Confidence Check: 0.65 (0.5-0.7 range)          │
│ Decision: ⚠️ Verduidelijkingsvraag nodig        │
└─────────────────────────────────────────────────┘
      ↓
   Chat: "Met welke patiënt wil je een afspraak maken?"
   [Geen artifact geopend]
```

### 5.7 Intent Router Integration

**Artifact routing logic (in `swift-store.ts` of artifact manager):**

```typescript
function openArtifactForIntent(
  intent: SwiftIntent,
  entities: ExtractedEntities,
  confidence: number
): ArtifactConfig | null {

  // Confidence too low voor direct artifact
  if (confidence < 0.7) {
    return null; // Trigger verduidelijkingsvraag in chat
  }

  switch (intent) {
    // Bestaande intents
    case 'dagnotitie':
      return {
        type: 'DagnotatieBlock',
        prefill: {
          patient: entities.patientName,
          category: entities.category,
          content: entities.content
        }
      };

    case 'zoeken':
      return {
        type: 'ZoekenBlock',
        prefill: { query: entities.patientName }
      };

    case 'overdracht':
      return {
        type: 'OverdrachtBlock',
        prefill: {}
      };

    // 🆕 Agenda intents
    case 'agenda_query':
      return {
        type: 'AgendaBlock',
        mode: 'list',
        prefill: {
          dateRange: entities.dateRange || getTodayRange()
        }
      };

    case 'create_appointment':
      // Check required entities
      if (!entities.patientName) {
        return null; // Need patient name
      }
      return {
        type: 'AgendaBlock',
        mode: 'create',
        prefill: {
          patient: { name: entities.patientName },
          datetime: entities.datetime,
          type: entities.appointmentType || 'behandeling',
          location: entities.location || 'praktijk'
        }
      };

    case 'cancel_appointment':
      return {
        type: 'AgendaBlock',
        mode: 'cancel',
        prefill: {
          identifier: entities.identifier
        }
      };

    case 'reschedule_appointment':
      if (!entities.identifier) {
        return null; // Need to know which appointment
      }
      return {
        type: 'AgendaBlock',
        mode: 'reschedule',
        prefill: {
          identifier: entities.identifier,
          newDatetime: entities.newDatetime
        }
      };

    case 'unknown':
    default:
      return null;
  }
}
```

### 5.8 Performance Metrics

**Target response times:**

| Stage | Target | Actual (Expected) |
|-------|--------|-------------------|
| Local pattern match | <50ms | ~10-15ms |
| Local + entity extraction | <100ms | ~30-50ms |
| AI fallback (cold) | <800ms | ~400-600ms |
| AI fallback (warm) | <500ms | ~200-400ms |
| Total (local path) | <150ms | ~50-80ms |
| Total (AI path) | <1000ms | ~500-700ms |

**Optimization strategies:**
- Cache frequently used date ranges (today, tomorrow, this week)
- Pre-compile regex patterns
- Parallel entity extraction waar mogelijk
- AI response streaming voor betere UX tijdens wachttijd

---

## 6. Conversational Patterns & Use Cases

🎯 **Doel:** Beschrijven van typische conversational patterns en verwachte systeemgedrag per intent type.

### 6.1 Agenda Query Patterns

**Intent:** `agenda_query`

**Conversational Examples:**

| User Input | Confidence | Extracted Entities | System Response |
|------------|-----------|-------------------|-----------------|
| "afspraken vandaag" | 1.0 | dateRange: today | "Je hebt vandaag 3 afspraken..." → AgendaBlock |
| "wat is mijn volgende afspraak" | 1.0 | dateRange: from now | "Je volgende afspraak is om 14:00..." |
| "agenda morgen" | 1.0 | dateRange: tomorrow | "Morgen heb je 2 afspraken..." |
| "laat agenda zien" | 0.85 | dateRange: today (implied) | AgendaBlock (today) |

**Edge Cases:**
- Geen afspraken: "Je hebt vandaag geen afspraken" + Empty state
- Onduidelijke periode: "Voor welke dag bedoel je?" (verduidelijkingsvraag)
- Historical query: "afspraken gisteren" → allowed, toont verleden

### 6.2 Create Appointment Patterns

**Intent:** `create_appointment`

**Complete Information Flow:**

```
User: "maak afspraak jan de vries morgen 14:00"
Confidence: 1.0
Entities: patient ✓, date ✓, time ✓

System: "Ik maak een afspraak voor Jan de Vries op 28 dec om 14:00."
AgendaBlock: create form met prefill
```

**Partial Information Flow:**

```
User: "maak afspraak met jan"
Confidence: 0.75
Entities: patient ✓, date ❌, time ❌

System: "Voor wanneer wil je de afspraak plannen?"
[Geen artifact]

User: "morgen 14:00"
System: "Oké!" → AgendaBlock opens
```

**Context-Aware:**

```
Active patient: Marie Jansen
User: "maak afspraak met deze patiënt"
Entities: patient from context ✓

System: "Voor wanneer wil je afspreken met Marie?"
```

### 6.3 Cancel Appointment Patterns

**Intent:** `cancel_appointment`

**Single Match:**
```
User: "annuleer afspraak jan morgen"
Matches: 1
System: Confirmation dialog → Cancel
```

**Multiple Matches:**
```
User: "annuleer jan"
Matches: 3
System: "Welke afspraak?" → Disambiguation list
```

**Time-Based:**
```
User: "annuleer de 14:00"
Matches: 1 (today implied)
System: Confirmation → Cancel
```

### 6.4 Reschedule Appointment Patterns

**Intent:** `reschedule_appointment`

**Time Change Only:**
```
User: "verzet 14:00 naar 15:00"
Entities: old time ✓, new time ✓, date: today
System: Reschedule form → Update
```

**Date + Time:**
```
User: "verzet jan naar dinsdag 10:00"
Entities: patient ✓, new date ✓, new time ✓
System: Edit form → Update
```

---

## 7. Entity Extraction - Detailed Specification

### 7.1 Required Entities per Intent

```typescript
// agenda_query
{
  dateRange: {
    start: Date;
    end: Date;
    label: 'vandaag' | 'morgen' | 'deze week' | 'volgende week';
  }
}

// create_appointment
{
  patient: {
    name: string;
    id?: string;        // Als gevonden
    confidence: number;
  };
  datetime: {
    date: Date;
    time: string;       // "14:00"
  };
  type?: 'intake' | 'behandeling' | 'follow-up' | 'telefonisch' | 'crisis';
  location?: 'praktijk' | 'online' | 'thuis';
}

// cancel_appointment / reschedule_appointment
{
  identifier: {
    type: 'patient' | 'time' | 'both';
    patient?: string;
    time?: string;
    date?: Date;
  };
  newDatetime?: {      // Alleen voor reschedule
    date: Date;
    time: string;
  };
}
```

### 5.3 Confidence Thresholds

| Confidence | Actie | Voorbeeld |
|------------|-------|-----------|
| >0.9 | Direct artifact openen met prefill | "maak afspraak jan de vries morgen 14:00" |
| 0.7-0.9 | Artifact + bevestigingsvraag | "maak afspraak jan morgen" (tijd onduidelijk) |
| 0.5-0.7 | Verduidelijkingsvraag in chat | "maak afspraak" (patient/tijd ontbreekt) |
| <0.5 | Fallback + suggestie | "Ik begrijp het niet. Bedoel je een afspraak maken?" |

---

## 8. AgendaBlock Artifact - UI Specificatie

### 8.1 Modes

Het AgendaBlock heeft **4 modes**, afhankelijk van het intent:

| Mode | Trigger Intent | Primaire UI |
|------|----------------|-------------|
| **List View** | `agenda_query` | Chronologische lijst van afspraken |
| **Create Form** | `create_appointment` | Form met prefilled patient/datetime |
| **Cancel View** | `cancel_appointment` | Lijst met "Annuleren" knoppen + confirmation |
| **Edit Form** | `reschedule_appointment` | Editable datetime picker |

### 8.2 List View (Mode: List)

**Triggered by:** "afspraken vandaag", "agenda morgen", "wat is volgende afspraak"

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│ 📅 Afspraken Vandaag                          [×]   │
│    Donderdag 27 december 2024                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 09:00 - 10:00                   🔵 Intake     │ │
│  │ Jan de Vries                                  │ │
│  │ 📍 Praktijk                                   │ │
│  │ [Details] [Annuleren]                         │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 11:30 - 12:30                   🟢 Behandeling│ │
│  │ Marie Jansen                                  │ │
│  │ 🌐 Online                                     │ │
│  │ [Details] [Annuleren]                         │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 14:00 - 15:00                   🔵 Vervolg    │ │
│  │ Piet Bakker                                   │ │
│  │ 📍 Praktijk                                   │ │
│  │ Notities: Bespreek medicatie aanpassing      │ │
│  │ [Details] [Annuleren]                         │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [📅 Open volledige agenda →]                        │
└─────────────────────────────────────────────────────┘
```

**Elementen:**

| Element | Beschrijving | Interactie |
|---------|--------------|------------|
| **Header** | Datum label + close button | Klik × → sluit artifact |
| **Afspraak Card** | Per afspraak: tijd, patient, type, locatie, notities | Klik card → expand details |
| **Patient Name** | Klikbaar | Klik → opent PatientContextCard |
| **Details Button** | Navigeert naar klassieke agenda | Opent `/epd/agenda` met filter op deze afspraak |
| **Annuleren Button** | Trigger cancel flow | Opent confirmation dialog |
| **Footer Link** | Link naar full agenda | Navigeert naar `/epd/agenda` |

**Empty State:**

```
┌─────────────────────────────────────────────────────┐
│ 📅 Afspraken Vandaag                          [×]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│                   📭                                │
│                                                     │
│        Geen afspraken gevonden                      │
│        voor vandaag                                 │
│                                                     │
│   [Maak nieuwe afspraak]                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 8.3 Create Form (Mode: Create)

**Triggered by:** "maak afspraak jan morgen 14:00", "plan intake"

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│ 📝 Nieuwe Afspraak                            [×]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Patiënt *                                          │
│  ┌───────────────────────────────────────────────┐ │
│  │ Jan de Vries                              ✓  │ │
│  └───────────────────────────────────────────────┘ │
│  (Pre-filled, editable met autocomplete)            │
│                                                     │
│  Datum *                          Tijd *            │
│  ┌──────────────────────┐  ┌──────────────────┐   │
│  │ 28-12-2024 ▼        │  │ 14:00 ▼         │   │
│  └──────────────────────┘  └──────────────────┘   │
│  (Pre-filled: "morgen")     (Pre-filled: "14:00")  │
│                                                     │
│  Type *                                             │
│  ┌───────────────────────────────────────────────┐ │
│  │ ○ Intake       ● Behandeling   ○ Vervolg     │ │
│  │ ○ Telefonisch  ○ Huisbezoek    ○ Crisis      │ │
│  └───────────────────────────────────────────────┘ │
│  (Default: Behandeling)                             │
│                                                     │
│  Locatie *                                          │
│  ┌───────────────────────────────────────────────┐ │
│  │ ● Praktijk     ○ Online         ○ Thuis       │ │
│  └───────────────────────────────────────────────┘ │
│  (Default: Praktijk)                                │
│                                                     │
│  Notities (optioneel)                               │
│  ┌───────────────────────────────────────────────┐ │
│  │                                               │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ⚠️ Conflict: Je hebt al een afspraak om 14:00    │
│     met Marie Jansen. Wil je toch doorgaan?        │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [Annuleren]                    [✓ Afspraak maken] │
└─────────────────────────────────────────────────────┘
```

**Form Fields:**

| Field | Type | Required | Validation | Prefill Source |
|-------|------|----------|------------|----------------|
| **Patiënt** | Autocomplete | ✅ | Must exist in DB | NLP entity extraction |
| **Datum** | Date picker | ✅ | Cannot be in past | NLP ("morgen", "dinsdag") |
| **Tijd** | Time picker | ✅ | 07:00-20:00 range | NLP ("14:00", "ochtend") |
| **Type** | Radio group | ✅ | One of predefined types | NLP ("intake") or default |
| **Locatie** | Radio group | ✅ | praktijk/online/thuis | NLP or default: praktijk |
| **Notities** | Textarea | ❌ | Max 500 chars | — |

**Conflict Detection (Optional):**

```typescript
// Check overlapping appointments
const hasConflict = await checkConflict({
  practitionerId: currentUser.id,
  startTime: formData.datetime,
  endTime: addHours(formData.datetime, 1), // Assume 1 hour
});

if (hasConflict) {
  showWarning("⚠️ Conflict: Je hebt al een afspraak om ...");
}
```

**States:**

| State | UI Behavior |
|-------|-------------|
| **Initial** | Form with prefilled values, "Afspraak maken" enabled |
| **Validating** | Disable form, show spinner |
| **Conflict Warning** | Show warning banner, keep form enabled |
| **Submitting** | Disable form, "Afspraak maken" → spinner |
| **Success** | Toast + chat confirmation, artifact closes |
| **Error** | Error message in form, re-enable |

### 8.4 Cancel View (Mode: Cancel)

**Triggered by:** "annuleer afspraak Jan", "cancel de 14:00 afspraak"

**Flow 1: Single Match**

```
┌─────────────────────────────────────────────────────┐
│ ❌ Afspraak Annuleren                         [×]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Wil je deze afspraak annuleren?                   │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 28-12-2024 14:00 - 15:00                      │ │
│  │ Jan de Vries - Intake                         │ │
│  │ Praktijk                                      │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ⚠️ Deze actie kan niet ongedaan worden gemaakt.   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [Terug]                          [✓ Annuleren]    │
└─────────────────────────────────────────────────────┘
```

**Flow 2: Multiple Matches (Disambiguation)**

```
┌─────────────────────────────────────────────────────┐
│ ❌ Afspraak Annuleren                         [×]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Welke afspraak wil je annuleren?                  │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ ○ 28-12-2024 09:00 - Jan de Vries (Intake)   │ │
│  │   Praktijk                                    │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ ○ 28-12-2024 14:00 - Jan de Vries (Vervolg)  │ │
│  │   Online                                      │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ ○ 03-01-2025 11:00 - Jan de Vries (Behandel) │ │
│  │   Praktijk                                    │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [Annuleren]                   [Volgende →]        │
└─────────────────────────────────────────────────────┘
```

**After Selection:**
→ Returns to single match confirmation flow

### 8.5 Edit Form (Mode: Reschedule)

**Triggered by:** "verzet 14:00 naar 15:00", "verzet Jan naar dinsdag"

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│ 🔄 Afspraak Verzetten                         [×]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Afspraak                                           │
│  ┌───────────────────────────────────────────────┐ │
│  │ Jan de Vries - Intake                         │ │
│  └───────────────────────────────────────────────┘ │
│  (Readonly)                                         │
│                                                     │
│  Huidige datum/tijd                                 │
│  ┌───────────────────────────────────────────────┐ │
│  │ 28-12-2024  14:00 - 15:00                     │ │
│  └───────────────────────────────────────────────┘ │
│  (Readonly, strikethrough)                          │
│                                                     │
│  Nieuwe datum/tijd *                                │
│  ┌──────────────────────┐  ┌──────────────────┐   │
│  │ 28-12-2024 ▼        │  │ 15:00 ▼         │   │
│  └──────────────────────┘  └──────────────────┘   │
│  (Editable, pre-filled met NLP extracted waarden)  │
│                                                     │
│  ✅ Geen conflicten gevonden                        │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [Annuleren]                       [✓ Verzetten]   │
└─────────────────────────────────────────────────────┘
```

---

## 9. User Flows - Gedetailleerd

### 9.1 Flow: Agenda Query (Simple)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User Input                                          │
│ ──────────────────────────────────────────────────────────  │
│ User (chat): "Wat zijn mijn afspraken vandaag?"            │
│                                                             │
│ [Enter pressed]                                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Intent Detection                                    │
│ ──────────────────────────────────────────────────────────  │
│ System:                                                     │
│ - Pattern match: "afspraken vandaag" → agenda_query        │
│ - Confidence: 0.95                                          │
│ - Entities extracted: { dateRange: { start: today,         │
│                                       end: today,           │
│                                       label: 'vandaag' }}   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: AI Response (Streaming)                             │
│ ──────────────────────────────────────────────────────────  │
│ Assistant (chat): "Je hebt vandaag 3 afspraken:            │
│ - 09:00 Intake Jan de Vries                                 │
│ - 11:30 Behandeling Marie Jansen                            │
│ - 14:00 Vervolggesprek Piet Bakker"                        │
│                                                             │
│ [Streaming indicator → full text]                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Artifact Opens                                      │
│ ──────────────────────────────────────────────────────────  │
│ AgendaBlock (mode: list):                                   │
│ - Slide-in animation from right (200ms)                     │
│ - Shows 3 appointment cards                                 │
│ - Chronological order                                       │
│ - Each card: patient (clickable), time, type, location     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: User Interaction (Optional)                         │
│ ──────────────────────────────────────────────────────────  │
│ User:                                                       │
│ Option A: Klik "Jan de Vries" → PatientContextCard opent   │
│ Option B: Klik "Annuleren" → Cancel flow start             │
│ Option C: Klik "Details" → Navigate to /epd/agenda         │
│ Option D: Close artifact (×)                                │
│ Option E: Continue chatting (artifact blijft open)          │
└─────────────────────────────────────────────────────────────┘

TIMING: ~2-3 seconds total
```

### 9.2 Flow: Quick Create (Voice Input)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Voice Activation                                    │
│ ──────────────────────────────────────────────────────────  │
│ User: [Druk spatie in lege input field]                    │
│                                                             │
│ System:                                                     │
│ - Mic icon turns red 🔴                                     │
│ - Deepgram streaming starts                                 │
│ - Waveform animation appears                                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Speech Input                                        │
│ ──────────────────────────────────────────────────────────  │
│ User (speaking): "Maak intake met Jan de Vries morgen       │
│                   om twee uur"                              │
│                                                             │
│ System:                                                     │
│ - Live transcript appears in input field:                   │
│   "maak intake met jan de vries morgen om twee uur"        │
│ - Pause detection: 1.5s silence → auto-submit              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: NLP Entity Extraction                               │
│ ──────────────────────────────────────────────────────────  │
│ System (Chat API):                                          │
│ - Intent: create_appointment (confidence: 0.94)             │
│ - Entities:                                                 │
│   {                                                         │
│     patient: {                                              │
│       name: "Jan de Vries",                                 │
│       id: "uuid-123",  // Found in DB                       │
│       confidence: 0.91                                      │
│     },                                                      │
│     datetime: {                                             │
│       date: "2024-12-28",  // "morgen" parsed               │
│       time: "14:00"        // "twee uur" normalized         │
│     },                                                      │
│     type: "intake"                                          │
│   }                                                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: AI Confirmation                                     │
│ ──────────────────────────────────────────────────────────  │
│ Assistant (chat): "Ik maak een intake-afspraak voor        │
│ Jan de Vries op 28 december om 14:00. Klopt dat?"          │
│                                                             │
│ [Streaming response completes]                              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: AgendaBlock Opens (Create Form)                     │
│ ──────────────────────────────────────────────────────────  │
│ AgendaBlock (mode: create):                                 │
│ - Slide-in animation                                        │
│ - Pre-filled fields:                                        │
│   • Patiënt: "Jan de Vries" ✓ (locked)                     │
│   • Datum: "28-12-2024" (editable)                          │
│   • Tijd: "14:00" (editable)                                │
│   • Type: "Intake" selected                                 │
│   • Locatie: "Praktijk" (default)                           │
│   • Notities: empty                                         │
│ - Focus: first editable field (Datum)                       │
│ - "Afspraak maken" button enabled                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: User Review & Submit                                │
│ ──────────────────────────────────────────────────────────  │
│ User:                                                       │
│ Option A: Direct klik "Afspraak maken" (accept prefill)    │
│ Option B: Adjust tijd naar 15:00 → klik "Afspraak maken"   │
│ Option C: Via chat: "Zet tijd op 15:00" → form updates     │
│                                                             │
│ [User clicks "Afspraak maken"]                              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Server Action                                       │
│ ──────────────────────────────────────────────────────────  │
│ System:                                                     │
│ - Disable form (spinner on button)                          │
│ - Call createEncounter({                                    │
│     patientId: "uuid-123",                                  │
│     practitionerId: currentUser.id,                         │
│     periodStart: "2024-12-28T14:00:00",                     │
│     periodEnd: "2024-12-28T15:00:00",                       │
│     typeCode: "intake",                                     │
│     classCode: "AMB"  // Praktijk                           │
│   })                                                        │
│ - revalidatePath('/epd/agenda')                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: Success Feedback                                    │
│ ──────────────────────────────────────────────────────────  │
│ System:                                                     │
│ - Toast notification: "✓ Afspraak aangemaakt!"             │
│ - Chat message: "Afspraak ingepland voor Jan de Vries      │
│   op 28 december om 14:00."                                 │
│ - AgendaBlock: Closes with fade-out animation               │
│ - Chat input: Re-enabled, ready for next command            │
└─────────────────────────────────────────────────────────────┘

TIMING: ~10-15 seconds total (incl. voice input)
```

### 9.3 Flow: Cancel with Disambiguation

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User Request                                        │
│ ──────────────────────────────────────────────────────────  │
│ User (chat): "Annuleer afspraak van Jan"                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Intent + Identifier Extraction                      │
│ ──────────────────────────────────────────────────────────  │
│ System:                                                     │
│ - Intent: cancel_appointment (confidence: 0.96)             │
│ - Entities: { identifier: { type: 'patient',               │
│                              patient: 'Jan' }}              │
│ - Query DB for matching appointments:                       │
│   SELECT * FROM encounters                                  │
│   WHERE patient.name ILIKE '%Jan%'                          │
│     AND status = 'planned'                                  │
│     AND period_start >= NOW()                               │
│   → Returns 3 matches                                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Disambiguation Required                             │
│ ──────────────────────────────────────────────────────────  │
│ Assistant (chat): "Je hebt 3 afspraken met Jan.            │
│ Welke wil je annuleren?"                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: AgendaBlock Shows Options                           │
│ ──────────────────────────────────────────────────────────  │
│ AgendaBlock (mode: cancel, submode: disambiguation):        │
│ - Radio list met 3 opties:                                  │
│   ○ 28-12-2024 09:00 - Jan de Vries (Intake) - Praktijk   │
│   ○ 28-12-2024 14:00 - Jan de Vries (Vervolg) - Online    │
│   ○ 03-01-2025 11:00 - Jan de Vries (Behandeling)         │
│ - [Volgende →] button disabled tot selectie                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: User Selects                                        │
│ ──────────────────────────────────────────────────────────  │
│ User: Klikt radio button bij "28-12-2024 14:00"            │
│ [Volgende →] button enabled                                 │
│ User: Klikt [Volgende →]                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Confirmation Dialog                                 │
│ ──────────────────────────────────────────────────────────  │
│ AgendaBlock (mode: cancel, submode: confirm):               │
│ - Shows selected appointment                                │
│ - Warning: "Deze actie kan niet ongedaan worden gemaakt."  │
│ - Buttons: [Terug] [✓ Annuleren]                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: User Confirms                                       │
│ ──────────────────────────────────────────────────────────  │
│ User: Klikt [✓ Annuleren]                                  │
│                                                             │
│ System:                                                     │
│ - Call cancelEncounter(encounterId)                         │
│ - Updates status to 'cancelled' (soft delete)               │
│ - revalidatePath('/epd/agenda')                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: Success                                             │
│ ──────────────────────────────────────────────────────────  │
│ System:                                                     │
│ - Toast: "Afspraak geannuleerd"                            │
│ - Chat: "Afspraak met Jan de Vries op 28 december          │
│   om 14:00 is geannuleerd."                                 │
│ - AgendaBlock closes                                        │
└─────────────────────────────────────────────────────────────┘

TIMING: ~20-30 seconds (incl. disambiguation)
```

### 9.4 Flow: Reschedule (Quick)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User Request                                        │
│ ──────────────────────────────────────────────────────────  │
│ User (chat): "Verzet de 14:00 afspraak naar 15:00"         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Intent + Time Extraction                            │
│ ──────────────────────────────────────────────────────────  │
│ System:                                                     │
│ - Intent: reschedule_appointment (confidence: 0.93)         │
│ - Entities: {                                               │
│     identifier: { type: 'time', time: '14:00' },            │
│     newDatetime: { time: '15:00' }                          │
│   }                                                         │
│ - Query today's appointments at 14:00 → 1 match found      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: AI Response                                         │
│ ──────────────────────────────────────────────────────────  │
│ Assistant (chat): "Ik verzet je afspraak van 14:00         │
│ met Jan de Vries naar 15:00."                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: AgendaBlock Edit Form                               │
│ ──────────────────────────────────────────────────────────  │
│ AgendaBlock (mode: reschedule):                             │
│ - Shows current details (readonly, strikethrough)           │
│ - Editable nieuwe tijd field: "15:00" (pre-filled)          │
│ - Conflict check: ✅ Geen conflicten                        │
│ - [✓ Verzetten] button enabled                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: User Confirms                                       │
│ ──────────────────────────────────────────────────────────  │
│ User: Klikt [✓ Verzetten]                                  │
│                                                             │
│ System:                                                     │
│ - Call rescheduleEncounter(encounterId, {                   │
│     periodStart: '2024-12-27T15:00',                        │
│     periodEnd: '2024-12-27T16:00'                           │
│   })                                                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Success                                             │
│ ──────────────────────────────────────────────────────────  │
│ System:                                                     │
│ - Toast: "Afspraak verzet naar 15:00"                      │
│ - Chat: "Afspraak verzet naar 15:00."                      │
│ - AgendaBlock closes                                        │
└─────────────────────────────────────────────────────────────┘

TIMING: ~10 seconds
```

---

## 10. Edge Cases & Error Handling

### 10.1 Patient Name Ambiguity

**Scenario:** Gebruiker zegt "Jan", maar er zijn 3 patiënten met naam Jan

**Handling:**
```
User: "Maak afspraak met Jan morgen 14:00"

AI: "Ik vond 3 patiënten met de naam Jan. Welke bedoel je?"

AgendaBlock (patient selector):
┌─────────────────────────────────────────────┐
│ Selecteer patiënt:                          │
│ ○ Jan de Vries (BSN: 123456789)            │
│ ○ Jan Bakker (BSN: 987654321)              │
│ ○ Jan Jansen (BSN: 456789123)              │
│ [Annuleren] [Volgende →]                    │
└─────────────────────────────────────────────┘

User: Selecteert "Jan de Vries" → Form continues met pre-fill
```

### 10.2 Date/Time Parse Failure

**Scenario:** Onduidelijke tijdaanduiding

```
User: "Maak afspraak met Jan overovermorgen"

AI: "Ik begrijp 'overovermorgen' niet. Kun je een datum
     opgeven? Bijvoorbeeld: morgen, dinsdag, of 30 december."

[Geen AgendaBlock geopend]

User: "30 december"

AI: "Hoe laat wil je de afspraak plannen?"

User: "14:00"

AI: "Ik maak een afspraak voor Jan de Vries op 30 december om 14:00."
[AgendaBlock opens met pre-fill]
```

### 10.3 Appointment in Past

**Scenario:** Gebruiker probeert afspraak in verleden te maken

```
User: "Maak afspraak met Jan gisteren 14:00"

AI: "Ik kan geen afspraken in het verleden maken.
     Bedoelde je morgen?"

[Geen AgendaBlock]

User: "Ja, morgen"

AI: "Oké, ik maak de afspraak voor morgen 14:00."
[AgendaBlock opens]
```

### 10.4 No Appointments Found

**Scenario:** Query zonder resultaten

```
User: "Afspraken volgende week"

AI: "Je hebt volgende week geen afspraken ingepland."

AgendaBlock (empty state):
┌─────────────────────────────────────────────┐
│ 📭 Geen afspraken                           │
│    Volgende week                            │
│    [Maak nieuwe afspraak]                   │
└─────────────────────────────────────────────┘
```

### 10.5 Server Error

**Scenario:** Database of API failure

```
User: "Afspraken vandaag"

[Server error during getEncounters()]

AI: "Er ging iets mis bij het ophalen van je afspraken.
     Probeer het opnieuw of open de volledige agenda."

[Link naar /epd/agenda in chat message]

[Geen AgendaBlock]
```

### 10.6 Conflict Detection Warning

**Scenario:** Overlapping appointment

```
User: "Maak afspraak Jan morgen 14:00"

[Existing appointment: Marie Jansen 14:00-15:00]

AgendaBlock form shows:
⚠️ Conflict: Je hebt al een afspraak om 14:00
   met Marie Jansen. Wil je toch doorgaan?

[Afspraak maken] button blijft enabled
User kan kiezen: aanpassen of door submit gaan
```

---

## 11. System Prompt Extension

**Toevoeging aan `/api/swift/chat` system prompt:**

```markdown
## Agenda & Afspraken Beheer

Je helpt gebruikers met agenda-gerelateerde taken.

### Intents die je herkent:

1. **agenda_query** - Afspraken opvragen
   Voorbeelden: "afspraken vandaag", "wat is volgende", "agenda morgen"
   Actie: Toon lijst van afspraken in AgendaBlock

2. **create_appointment** - Nieuwe afspraak maken
   Voorbeelden: "maak afspraak met Jan morgen 14:00", "plan intake"
   Actie: Open create form met extracted entities
   Required: patient, date, time
   Optional: type (default: behandeling), location (default: praktijk)

3. **cancel_appointment** - Afspraak annuleren
   Voorbeelden: "annuleer afspraak Jan", "cancel 14:00"
   Actie: Toon confirmation dialog

4. **reschedule_appointment** - Afspraak verzetten
   Voorbeelden: "verzet 14:00 naar 15:00", "verzet Jan naar dinsdag"
   Actie: Toon edit form met oude + nieuwe tijd

### Entity Extraction:

**Patient:**
- Extraheer volledige naam indien mogelijk
- Bij onduidelijkheid: vraag verduidelijking
- Gebruik activePatient uit context als user zegt "deze patiënt"

**Date/Time:**
- Parse relatieve datums: "morgen", "dinsdag", "volgende week"
- Parse tijden: "14:00", "twee uur", "half drie"
- Bij onduidelijkheid: vraag specifieke datum/tijd
- Valideer: geen datums in verleden (behalve queries)

**Type:**
- intake, behandeling, follow-up, telefonisch, huisbezoek, crisis
- Default: behandeling (als niet gespecificeerd)

**Location:**
- praktijk, online, thuis
- Default: praktijk

### Response Format:

Bij succesvolle intent detection, voeg action object toe:

```json
{
  "type": "action",
  "intent": "create_appointment",
  "entities": {
    "patient": { "name": "Jan de Vries", "id": "uuid", "confidence": 0.91 },
    "datetime": { "date": "2024-12-28", "time": "14:00" },
    "type": "intake",
    "location": "praktijk"
  },
  "confidence": 0.94,
  "artifact": {
    "type": "AgendaBlock",
    "mode": "create",
    "prefill": { /* extracted entities */ }
  }
}
```

### Verduidelijkingsvragen:

Stel vragen bij:
- Meerdere patiënten met zelfde naam
- Onduidelijke datum ("volgende keer", "binnenkort")
- Ontbrekende tijd bij create
- Meerdere matches bij cancel/reschedule

Voorbeelden:
- "Welke Jan bedoel je? Jan de Vries of Jan Bakker?"
- "Op welke datum wil je de afspraak plannen?"
- "Hoe laat wil je afspreken?"
```

---

## 12. Technical Implementation

### 12.1 Date/Time Parser Utility

```typescript
// lib/swift/date-time-parser.ts

export function parseRelativeDate(input: string): Date | null {
  const today = new Date();

  const patterns = {
    'vandaag': () => today,
    'morgen': () => addDays(today, 1),
    'overmorgen': () => addDays(today, 2),
    'maandag': () => getNextWeekday(today, 1),
    'dinsdag': () => getNextWeekday(today, 2),
    // ... etc
    'deze week': () => ({ start: startOfWeek(today), end: endOfWeek(today) }),
    'volgende week': () => ({
      start: startOfWeek(addWeeks(today, 1)),
      end: endOfWeek(addWeeks(today, 1))
    }),
  };

  const normalized = input.toLowerCase().trim();

  for (const [pattern, fn] of Object.entries(patterns)) {
    if (normalized.includes(pattern)) {
      return fn();
    }
  }

  // Fallback: try date-fns parse
  return parseDate(input, 'dd-MM-yyyy', today);
}

export function parseTime(input: string): string | null {
  // "14:00" → "14:00"
  if (/^\d{1,2}:\d{2}$/.test(input)) return input;

  // "14" → "14:00"
  if (/^\d{1,2}$/.test(input)) return `${input.padStart(2, '0')}:00`;

  // "twee uur" → "14:00" (NLP via AI)
  // "half drie" → "14:30"
  const timeWords = {
    'één': '13:00', 'een': '13:00',
    'twee': '14:00',
    'drie': '15:00',
    'half drie': '14:30',
    // ... etc
  };

  return timeWords[input.toLowerCase()] || null;
}
```

### 12.2 AgendaBlock Component Structure

```typescript
// components/swift/artifacts/blocks/agenda-block.tsx

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

export function AgendaBlock({ mode, ...props }: AgendaBlockProps) {
  switch (mode) {
    case 'list':
      return <AgendaListView {...props} />;
    case 'create':
      return <AgendaCreateForm {...props} />;
    case 'cancel':
      return <AgendaCancelView {...props} />;
    case 'reschedule':
      return <AgendaRescheduleForm {...props} />;
  }
}
```

### 12.3 Server Actions (Reuse Existing)

```typescript
// Reuse from app/epd/agenda/actions.ts
import {
  getEncounters,
  createEncounter,
  cancelEncounter,
  rescheduleEncounter
} from '@/app/epd/agenda/actions';

// Usage in AgendaBlock:
const appointments = await getEncounters(startDate, endDate, practitionerId);

const newEncounter = await createEncounter({
  patientId: formData.patientId,
  practitionerId: currentUser.id,
  periodStart: combineDatetime(formData.date, formData.time),
  periodEnd: addHours(combineDatetime(formData.date, formData.time), 1),
  typeCode: formData.type,
  classCode: formData.location === 'praktijk' ? 'AMB' :
             formData.location === 'online' ? 'VR' : 'HH',
  typeDisplay: ENCOUNTER_TYPE_LABELS[formData.type],
  classDisplay: LOCATION_LABELS[formData.location],
  notes: formData.notes || undefined,
});
```

### 12.4 Conflict Detection (Optional)

```typescript
// lib/swift/conflict-checker.ts

export async function checkAppointmentConflict({
  practitionerId,
  startTime,
  endTime,
  excludeId,
}: {
  practitionerId: string;
  startTime: Date;
  endTime: Date;
  excludeId?: string;
}): Promise<Encounter | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('encounters')
    .select('*')
    .eq('practitioner_id', practitionerId)
    .eq('status', 'planned')
    .or(`period_start.lte.${endTime.toISOString()},period_end.gte.${startTime.toISOString()}`)
    .neq('id', excludeId || '')
    .single();

  return data;
}
```

---

## 13. UI Styling Specifications

### 13.1 AgendaBlock Dimensions

```css
.agenda-block {
  width: 100%;
  max-width: 600px;
  min-height: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.agenda-block-header {
  height: 48px;
  padding: 12px 16px;
  border-bottom: 1px solid theme('colors.slate.200');
}

.agenda-block-content {
  padding: 16px;
}

.agenda-block-footer {
  padding: 12px 16px;
  border-top: 1px solid theme('colors.slate.200');
  display: flex;
  justify-content: space-between;
}
```

### 13.2 Appointment Card Styling

```css
.appointment-card {
  background: white;
  border: 1px solid theme('colors.slate.200');
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 150ms ease;
}

.appointment-card:hover {
  border-color: theme('colors.teal.500');
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.appointment-card-time {
  font-size: 16px;
  font-weight: 600;
  color: theme('colors.slate.900');
}

.appointment-card-patient {
  font-size: 14px;
  color: theme('colors.teal.700');
  cursor: pointer;
  text-decoration: underline;
}

.appointment-card-patient:hover {
  color: theme('colors.teal.900');
}

.appointment-card-meta {
  font-size: 12px;
  color: theme('colors.slate.500');
  margin-top: 4px;
}
```

### 13.3 Type Badges

```typescript
const TYPE_COLORS = {
  intake: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  behandeling: { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  'follow-up': { bg: '#e0e7ff', border: '#6366f1', text: '#4338ca' },
  telefonisch: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  huisbezoek: { bg: '#fce7f3', border: '#ec4899', text: '#9f1239' },
  crisis: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
};
```

---

## 14. Testing Scenarios

### 14.1 Manual Test Checklist

| # | Scenario | Expected Result | Status |
|---|----------|-----------------|--------|
| 1 | "afspraken vandaag" | AgendaBlock list view, toont vandaag's afspraken | ⬜ |
| 2 | "wat is volgende afspraak" | Chat response met eerstvolgende, AgendaBlock toont details | ⬜ |
| 3 | "maak afspraak jan morgen 14:00" | Create form met prefill, patient gevonden | ⬜ |
| 4 | Voice: "maak intake marie vrijdag 10:00" | Transcript correct, create form opent | ⬜ |
| 5 | "maak afspraak" (incomplete) | Verduidelijkingsvraag: "Met welke patiënt?" | ⬜ |
| 6 | "maak afspraak onbekende patient" | Patient search fallback, suggesties | ⬜ |
| 7 | Create form submit → success | Toast, chat confirmation, artifact sluit | ⬜ |
| 8 | "annuleer afspraak jan" (1 match) | Confirmation dialog, direct match | ⬜ |
| 9 | "annuleer afspraak jan" (3 matches) | Disambiguation radio list | ⬜ |
| 10 | Cancel confirm → success | Afspraak status=cancelled, toast | ⬜ |
| 11 | "verzet 14:00 naar 15:00" | Reschedule form, tijd pre-filled | ⬜ |
| 12 | Reschedule submit → success | Tijd updated, toast confirmation | ⬜ |
| 13 | Conflict warning (overlapping) | Warning banner in create form | ⬜ |
| 14 | Click patient name in list | PatientContextCard opent | ⬜ |
| 15 | Click "Details" button | Navigates to /epd/agenda with filter | ⬜ |
| 16 | Empty state (geen afspraken) | Placeholder met "Maak nieuwe afspraak" | ⬜ |
| 17 | Server error tijdens query | Error in chat, geen artifact | ⬜ |
| 18 | Date in past validation | "Kan geen afspraken in verleden maken" | ⬜ |
| 19 | Context-aware: "maak afspraak deze patient" | Gebruikt active patient uit context | ⬜ |
| 20 | Multiple artifacts (3 max) | Agenda + Dagnotitie + Context card, tabs | ⬜ |

---

## 15. Performance & Optimization

### 15.1 Query Optimization

```typescript
// Efficient date range queries met indexed columns
const { data } = await supabase
  .from('encounters')
  .select(`
    id,
    period_start,
    period_end,
    type_code,
    type_display,
    class_code,
    notes,
    status,
    patient:patients!inner(id, name, bsn)
  `)
  .eq('practitioner_id', userId)
  .gte('period_start', startDate.toISOString())
  .lte('period_start', endDate.toISOString())
  .eq('status', 'planned')
  .order('period_start', { ascending: true });

// Index: idx_encounters_practitioner_period (practitioner_id, period_start)
```

### 15.2 Client-Side Caching

```typescript
// React Query caching voor frequently accessed data
const { data: todayAppointments } = useQuery({
  queryKey: ['appointments', 'today', userId],
  queryFn: () => getEncounters(startOfDay(today), endOfDay(today), userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnMount: 'always',
});
```

---

## 16. Bijlagen & Referenties

### 16.1 Related Documentation

- Swift Medical Scribe FO: `fo-swift-medical-scribe-v3.md`
- Swift Bouwplan: `bouwplan-swift-standalone-module.md`
- Klassieke Agenda Implementatie: `/app/epd/agenda`
- Date/Time Utilities: `date-fns` library

### 16.2 External References

- [FHIR Encounter Resource](https://www.hl7.org/fhir/encounter.html)
- [date-fns Documentation](https://date-fns.org/)
- [React Query Best Practices](https://tanstack.com/query/latest)

---

## 17. Wijzigingslog

| Versie | Datum | Wijzigingen |
|--------|-------|-------------|
| v1.0 | 27-12-2024 | **Initial:** Agenda planning functionaliteit in Swift - queries, quick create, cancel, reschedule |

---

**Goedkeuring:**

- [ ] Product Owner: _________________________
- [ ] Lead Developer: _________________________
- [ ] UX Designer: _________________________

**Volgende stappen:**
1. Review & approval FO
2. Epic 6 stories toevoegen aan bouwplan
3. Implementation start (3 stories, ~8 SP)
