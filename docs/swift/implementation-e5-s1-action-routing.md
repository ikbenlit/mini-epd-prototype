# Epic 5.S1 Implementation: Action Routing

**Story**: E5.S1 - Action routing
**Date**: 2025-12-27
**Status**: ✅ Complete
**Story Points**: 2 SP

---

## 🎯 Objective

Implement intent routing logic that maps agenda intents to the AgendaBlock artifact with the appropriate mode and prefill data.

---

## 📝 Implementation Summary

### 1. Updated Action Parser Schemas

**File**: `lib/swift/action-parser.ts`

Added agenda intents to validation schemas:
- `agenda_query`
- `create_appointment`
- `cancel_appointment`
- `reschedule_appointment`

### 2. Created Intent Routing Function

**Function**: `routeIntentToArtifact(intent, entities, confidence)`

**Purpose**: Maps intents to artifact configurations with:
- Artifact type
- Title
- Prefill data

**Logic**:
```typescript
if (confidence < 0.7) return null; // Trigger fallback

switch (intent) {
  case 'agenda_query':
    return { type: 'agenda_query', title: 'Agenda', prefill: { dateRange } };

  case 'create_appointment':
    if (!patientName && !patientId) return null; // Missing required entity
    return { type: 'create_appointment', title: 'Nieuwe afspraak', prefill: {...} };

  case 'cancel_appointment':
    return { type: 'cancel_appointment', title: 'Afspraak annuleren', prefill: {...} };

  case 'reschedule_appointment':
    if (!identifier) return null; // Need to know which appointment
    return { type: 'reschedule_appointment', title: 'Afspraak verzetten', prefill: {...} };

  // ... other intents (dagnotitie, zoeken, overdracht)
}
```

**Key Features**:
- ✅ Confidence threshold (0.7) enforcement
- ✅ Required entity validation (patient for create, identifier for reschedule)
- ✅ Returns null to trigger clarification when needed
- ✅ Proper prefill data extraction for each intent

### 3. Updated Command Input

**File**: `components/swift/command-center/command-input.tsx`

**Changes**:
1. Import `routeIntentToArtifact` from action-parser
2. Add `openArtifact` to store hooks
3. Replace legacy `openBlock` logic with routing:

```typescript
// OLD (direct block opening):
if (intent !== 'unknown' && confidence >= 0.5) {
  openBlock(intent as BlockType, entities);
}

// NEW (routing with artifact system):
const artifactConfig = routeIntentToArtifact(intent, entities, confidence);
if (artifactConfig) {
  openArtifact({
    type: artifactConfig.type,
    title: artifactConfig.title,
    prefill: artifactConfig.prefill,
  });
}
```

---

## 🔑 Key Routing Rules

| Intent | Artifact Type | Required Entities | Mode |
|--------|---------------|-------------------|------|
| `agenda_query` | `agenda_query` | None | List view with date filter |
| `create_appointment` | `create_appointment` | `patientName` OR `patientId` | Create form |
| `cancel_appointment` | `cancel_appointment` | None | Cancel view (may need disambiguation) |
| `reschedule_appointment` | `reschedule_appointment` | `identifier` | Reschedule form |

---

## 📊 Confidence Thresholds

| Confidence | Action | Example |
|------------|--------|---------|
| **≥ 0.7** | Open artifact directly | "afspraken vandaag" → AgendaBlock opens |
| **< 0.7** | Show fallback picker | Low confidence → User chooses intent manually |
| **Missing required entity** | Show fallback picker | "maak afspraak" (no patient) → Clarification needed |

---

## 🔄 Data Flow

```
User Input
    ↓
Intent Classification API (/api/intent/classify)
    ↓
{ intent, entities, confidence }
    ↓
routeIntentToArtifact()
    ↓
Artifact Config { type, title, prefill } OR null
    ↓
openArtifact() OR openBlock('fallback')
    ↓
AgendaBlock renders with prefilled data
```

---

## 📁 Files Modified

```
lib/swift/action-parser.ts
├── Updated ActionSchema with agenda intents
├── Updated artifact type enum
├── Added routeIntentToArtifact() function
└── Updated validateArtifactType() for agenda intents

components/swift/command-center/command-input.tsx
├── Import routeIntentToArtifact
├── Use openArtifact from store
└── Replace direct block opening with routing logic
```

---

## ✅ Acceptance Criteria

| Criterion | Status | Notes |
|-----------|--------|-------|
| Agenda intents open AgendaBlock | ✅ | Via routing function |
| Correct mode selected | ✅ | Based on intent type |
| Prefill data passed correctly | ✅ | Mapped from entities |
| Confidence threshold enforced | ✅ | < 0.7 shows fallback |
| Required entities validated | ✅ | Returns null when missing |
| TypeScript type safety | ✅ | No compilation errors |

---

## 🧪 Testing Scenarios

### Scenario 1: High Confidence Agenda Query
**Input**: "afspraken vandaag"
**Expected**:
- Intent: `agenda_query`
- Confidence: ~0.95
- Result: AgendaBlock opens in list mode with today's date range

### Scenario 2: Create Appointment with Patient
**Input**: "maak afspraak jan morgen 14:00"
**Expected**:
- Intent: `create_appointment`
- Entities: `{ patientName: "jan", datetime: {...} }`
- Result: AgendaBlock opens in create mode with prefilled patient and time

### Scenario 3: Create Appointment without Patient (Missing Entity)
**Input**: "maak afspraak morgen 14:00"
**Expected**:
- Intent: `create_appointment`
- Entities: `{ datetime: {...} }` (no patient)
- Result: FallbackPicker opens (routing returns null due to missing required entity)

### Scenario 4: Low Confidence
**Input**: "agenda ding morgen"
**Expected**:
- Intent: `agenda_query` (maybe)
- Confidence: < 0.7
- Result: FallbackPicker opens (routing returns null due to low confidence)

### Scenario 5: Reschedule with Identifier
**Input**: "verzet 14:00 naar 15:00"
**Expected**:
- Intent: `reschedule_appointment`
- Entities: `{ identifier: {...}, newDatetime: {...} }`
- Result: AgendaBlock opens in reschedule mode

---

## 🚀 Next Steps

1. **E5.S2**: Update chat API prompt to include agenda intent examples
2. **E5.S3**: Add error state handling with fallback links
3. **E6**: Manual QA testing of complete agenda flow

---

## 💡 Lessons Learned

1. **Artifact System**: Modern approach using `openArtifact()` is cleaner than legacy `openBlock()`
2. **Centralized Routing**: Single function makes intent mapping maintainable and testable
3. **Validation Early**: Checking required entities in routing prevents incomplete forms
4. **Confidence Thresholds**: 0.7 threshold balances automation with user control
5. **Type Safety**: TypeScript schemas ensure consistency across intent types

---

**Implementation Status**: ✅ Complete
**Ready for**: E5.S2 (Chat prompt update)
**Estimated Testing Time**: 15-20 minutes (manual testing with various inputs)
