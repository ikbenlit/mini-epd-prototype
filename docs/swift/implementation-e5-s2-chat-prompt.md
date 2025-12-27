# Epic 5.S2 Implementation: Chat Prompt Update

**Story**: E5.S2 - Chat prompt update
**Date**: 2025-12-27
**Status**: ✅ Complete
**Story Points**: 2 SP

---

## 🎯 Objective

Update the Swift chat API system prompt to include agenda intent descriptions, entity extraction rules, and action format examples.

---

## 📝 Implementation Summary

### File Modified

**`app/api/swift/chat/route.ts`** - Function: `buildMedicalScribePrompt()`

### Changes Made

#### 1. Added Agenda Intents to P2 Section

Added 4 new agenda intents to the P2 (belangrijk, middenfrequent) section:

**agenda_query** - Afspraken opvragen
- Triggers: "afspraken vandaag", "agenda morgen", "wat is mijn volgende afspraak", "afspraken deze week"
- Entities: `dateRange` (vandaag/morgen/deze week/volgende week)
- Action: Toon lijst van afspraken in AgendaBlock

**create_appointment** - Nieuwe afspraak maken
- Triggers: "maak afspraak [patient]", "plan intake [patient]", "afspraak maken met [patient] [datum] [tijd]"
- Entities: `patientName`, `datetime`, `appointmentType`, `location`
- Required: `patientName` OR `patientId`, `datetime`
- Optional: `appointmentType` (default: behandeling), `location` (default: praktijk)
- Action: Open create form met pre-fill

**cancel_appointment** - Afspraak annuleren
- Triggers: "annuleer afspraak [patient]", "cancel [tijd]", "afspraak van [patient] annuleren"
- Entities: `identifier` (patient naam/tijd combinatie voor matching)
- Action: Toon confirmation dialog, bij meerdere matches: disambiguation

**reschedule_appointment** - Afspraak verzetten
- Triggers: "verzet afspraak [patient]", "verzet [oude tijd] naar [nieuwe tijd]", "[patient] naar [nieuwe datum]"
- Entities: `identifier`, `newDatetime`
- Required: `identifier`
- Action: Toon edit form met oude en nieuwe tijd

#### 2. Extended Clarification Questions

Added agenda-specific clarification examples:
- "Voor welke datum wil je de afspraak maken?" (datum ontbreekt bij create_appointment)
- "Op welk tijdstip?" (tijd ontbreekt bij create_appointment)
- "Welke afspraak wil je verzetten?" (identifier onduidelijk bij reschedule/cancel)

#### 3. Added Agenda Examples

**Voorbeeld 5: Agenda query**
```json
{
  "type": "action",
  "intent": "agenda_query",
  "entities": {
    "dateRange": {
      "start": "2025-12-27",
      "end": "2025-12-27",
      "label": "vandaag"
    }
  },
  "confidence": 0.98,
  "artifact": {
    "type": "agenda_query",
    "prefill": {
      "dateRange": {...}
    }
  }
}
```

**Voorbeeld 6: Afspraak maken (compleet)**
```json
{
  "type": "action",
  "intent": "create_appointment",
  "entities": {
    "patientName": "Jan",
    "datetime": {
      "date": "2025-12-28",
      "time": "14:00"
    },
    "appointmentType": "behandeling",
    "location": "praktijk"
  },
  "confidence": 0.95,
  "artifact": {
    "type": "create_appointment",
    "prefill": {...}
  }
}
```

**Voorbeeld 7: Afspraak maken (incompleet)**
User: "Plan intake Marie"
Response: "Voor welke datum en tijd wil je de intake voor Marie plannen?"
(Geen JSON action omdat datetime ontbreekt)

**Voorbeeld 8: Afspraak verzetten**
```json
{
  "type": "action",
  "intent": "reschedule_appointment",
  "entities": {
    "identifier": {
      "type": "time",
      "time": "14:00"
    },
    "newDatetime": {
      "date": "2025-12-27",
      "time": "15:00"
    }
  },
  "confidence": 0.92,
  "artifact": {
    "type": "reschedule_appointment",
    "prefill": {...}
  }
}
```

---

## 🔑 Key Prompt Additions

### Entity Structure for Agenda Intents

**dateRange** (agenda_query):
```json
{
  "start": "YYYY-MM-DD",
  "end": "YYYY-MM-DD",
  "label": "vandaag" | "morgen" | "deze week" | "volgende week"
}
```

**datetime** (create_appointment, reschedule_appointment):
```json
{
  "date": "YYYY-MM-DD",
  "time": "HH:mm"
}
```

**identifier** (cancel_appointment, reschedule_appointment):
```json
{
  "type": "patient" | "time" | "both",
  "patientName"?: "string",
  "patientId"?: "uuid",
  "time"?: "HH:mm",
  "date"?: "YYYY-MM-DD",
  "encounterId"?: "uuid"
}
```

**appointmentType** (create_appointment):
- intake
- behandeling (default)
- follow-up
- telefonisch
- huisbezoek
- online
- crisis

**location** (create_appointment):
- praktijk (default)
- online
- thuis

---

## ✅ Acceptance Criteria

| Criterion | Status | Notes |
|-----------|--------|-------|
| Agenda intents described in prompt | ✅ | 4 intents added to P2 section |
| Entity extraction rules documented | ✅ | All entities with types and defaults |
| Required vs optional entities specified | ✅ | Clear for each intent |
| Clarification question examples | ✅ | 3 new agenda-specific examples |
| Action format examples | ✅ | 4 complete examples with JSON |
| Confidence thresholds mentioned | ✅ | Inherited from base prompt (≥0.7) |
| TypeScript compilation | ✅ | 0 errors |

---

## 📊 Prompt Structure

The updated prompt now includes:

```
Je rol
├── Kernkwaliteiten
└── Tone of voice

Wat je DOET
├── 1. Intents herkennen
│   ├── P1 Intents (dagnotitie, zoeken, overdracht)
│   └── P2 Intents (rapportage, agenda_query, create_appointment,
│                    cancel_appointment, reschedule_appointment) ✨ NEW
├── 2. Verduidelijkingsvragen stellen (+ agenda examples) ✨ UPDATED
├── 3. Action objects genereren
└── 4. Follow-up conversatie

Wat je NIET doet
Context die beschikbaar is

Voorbeelden
├── Voorbeeld 1-4 (bestaand)
├── Voorbeeld 5: Agenda query ✨ NEW
├── Voorbeeld 6: Afspraak maken (compleet) ✨ NEW
├── Voorbeeld 7: Afspraak maken (incompleet) ✨ NEW
└── Voorbeeld 8: Afspraak verzetten ✨ NEW

Error Handling
```

---

## 🧪 Testing Scenarios

### Scenario 1: Agenda Query - High Confidence
**Input**: "afspraken vandaag"
**Expected Claude Response**:
- Text: "Ik toon je de afspraken voor vandaag."
- JSON: `{ intent: "agenda_query", confidence: 0.98, entities: { dateRange: {...} } }`

### Scenario 2: Create Appointment - Complete
**Input**: "maak afspraak met Jan morgen 14:00"
**Expected Claude Response**:
- Text: "Ik maak een afspraak voor Jan morgen om 14:00."
- JSON: `{ intent: "create_appointment", confidence: 0.95, entities: { patientName, datetime } }`

### Scenario 3: Create Appointment - Incomplete
**Input**: "plan intake Marie"
**Expected Claude Response**:
- Text: "Voor welke datum en tijd wil je de intake voor Marie plannen?"
- JSON: None (confidence < 0.7 due to missing datetime)

### Scenario 4: Reschedule - Time Based
**Input**: "verzet 14:00 naar 15:00"
**Expected Claude Response**:
- Text: "Ik verzet de afspraak van 14:00 naar 15:00."
- JSON: `{ intent: "reschedule_appointment", confidence: 0.92, entities: { identifier, newDatetime } }`

### Scenario 5: Cancel - Patient Based
**Input**: "annuleer afspraak Jan"
**Expected Claude Response**:
- Text: Confirmation or disambiguation if multiple Jans
- JSON: `{ intent: "cancel_appointment", entities: { identifier: { type: "patient", patientName: "Jan" } } }`

---

## 🎯 Prompt Engineering Techniques Used

1. **Clear Intent Definitions**: Each intent has triggers, entities, and actions clearly defined
2. **Required/Optional Distinction**: Helps Claude decide when to ask clarification questions
3. **Confidence Guidance**: Thresholds guide when to open artifacts vs ask questions
4. **Concrete Examples**: 4 full examples with expected JSON structure
5. **Error Cases**: Example 7 shows incomplete input handling
6. **Entity Templates**: JSON structures show exact format expected
7. **Natural Language Triggers**: Multiple trigger phrases per intent

---

## 💡 Design Decisions

### Why P2 Instead of P1?
Agenda management is important but not as critical/frequent as dagnotitie (P1). Healthcare workers make notes constantly but schedule appointments less frequently.

### Why Include Defaults?
- `appointmentType`: "behandeling" (most common case)
- `location`: "praktijk" (most common location)

This reduces friction - users don't need to specify every detail.

### Why identifier Instead of encounterId?
The `identifier` structure allows flexible matching:
- By patient name: "annuleer afspraak Jan"
- By time: "cancel 14:00"
- By combination: "verzet Jan's afspraak"

The backend (Epic 3 API + Epic 4 UI) handles the disambiguation.

### Why Separate Examples for Complete/Incomplete?
Shows Claude two paths:
1. Complete data → Generate action (Example 6)
2. Incomplete data → Ask question (Example 7)

This demonstrates the confidence threshold logic clearly.

---

## 🚀 Next Steps

**E5.S3** - Error states
- Add error handling for API failures
- Add fallback links to `/epd/agenda`
- Handle offline/network errors gracefully

---

## 📁 Files Modified

```
✅ app/api/swift/chat/route.ts               (Updated system prompt)
✅ docs/swift/bouwplan-swift-agenda-planning.md  (E5.S2 → Done)
✅ docs/swift/implementation-e5-s2-chat-prompt.md (New documentation)
```

---

**Implementation Status**: ✅ Complete
**Ready for**: E5.S3 (Error states)
**Prompt Length**: ~525 lines (was ~325 lines) - increased by ~60%
