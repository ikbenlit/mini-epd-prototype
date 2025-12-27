# Test Plan - Epic 3: Backend Integration

**Epic**: Swift Agenda Planning - Backend Integration
**Version**: 1.0
**Date**: 2025-12-27
**Status**: ✅ Implementation Complete

---

## 🎯 Overview

Epic 3 implements the backend API layer for Swift Agenda Planning, providing RESTful endpoints for:
- Querying appointments by date range
- Creating new appointments
- Canceling appointments
- Rescheduling appointments
- Searching for patients (for disambiguation)

All endpoints include:
- ✅ Authentication via Supabase Auth
- ✅ Input validation with Zod schemas
- ✅ Dutch error messages
- ✅ Security checks (user owns the resource)
- ✅ Reuse of existing server actions

---

## 📋 Implementation Summary

### Story E3.S1: Agenda Query API ✅
**File**: `app/api/swift/agenda/route.ts`
- **Endpoint**: `GET /api/swift/agenda?start=YYYY-MM-DD&end=YYYY-MM-DD`
- **Auth**: Required (Supabase)
- **Filters**: Automatically filters by current user's practitioner_id
- **Response**: List of appointments (encounters) with patient details

### Story E3.S2: Create Appointment API ✅
**File**: `app/api/swift/agenda/create/route.ts`
- **Endpoint**: `POST /api/swift/agenda/create`
- **Body**: `{ patientId, datetime: { date, time }, type, location, notes? }`
- **Validation**: Date cannot be in past, appointment type and location must be valid
- **Mapping**:
  - `type` → FHIR encounter typeCode
  - `location` → FHIR classCode (AMB/VR/HH)
  - Duration: 1 hour default

### Story E3.S3: Cancel/Reschedule APIs ✅
**Files**:
- `app/api/swift/agenda/cancel/route.ts`
- `app/api/swift/agenda/reschedule/route.ts`

**Cancel Endpoint**: `POST /api/swift/agenda/cancel`
- **Body**: `{ encounterId }`
- **Security**: Verifies user owns the appointment
- **Validation**: Cannot cancel already cancelled appointment
- **Action**: Soft delete (status → 'cancelled')

**Reschedule Endpoint**: `POST /api/swift/agenda/reschedule`
- **Body**: `{ encounterId, newDatetime: { date, time } }`
- **Security**: Verifies user owns the appointment
- **Validation**: Cannot reschedule to past, cannot reschedule cancelled appointments
- **Duration**: Preserves original appointment duration

### Story E3.S4: Patient Search API ✅
**File**: `app/api/swift/patients/search/route.ts`
- **Endpoint**: `GET /api/swift/patients/search?q=<query>`
- **Search**: Fuzzy match on name_family and name_given
- **Limit**: 10 results
- **Response**: Array of patients with id, name, bsn, birthDate

---

## 🧪 Manual Test Scenarios

### Test Category 1: Agenda Query (E3.S1)

#### Test 1.1: Query appointments for today
**Prerequisites**: User is logged in, has appointments for today
```bash
curl -X GET 'http://localhost:3000/api/swift/agenda?start=2025-12-27&end=2025-12-27' \
  -H 'Cookie: <session-cookie>'
```
**Expected**:
- Status: 200
- Response: `{ appointments: [...], count: N, dateRange: { start, end } }`
- Appointments filtered by current user

#### Test 1.2: Query with missing parameters
```bash
curl -X GET 'http://localhost:3000/api/swift/agenda?start=2025-12-27' \
  -H 'Cookie: <session-cookie>'
```
**Expected**:
- Status: 400
- Error: "start en end parameters zijn verplicht"

#### Test 1.3: Query with invalid date format
```bash
curl -X GET 'http://localhost:3000/api/swift/agenda?start=invalid&end=2025-12-27' \
  -H 'Cookie: <session-cookie>'
```
**Expected**:
- Status: 400
- Error: "start moet een geldige datum zijn"

#### Test 1.4: Query without authentication
```bash
curl -X GET 'http://localhost:3000/api/swift/agenda?start=2025-12-27&end=2025-12-27'
```
**Expected**:
- Status: 401
- Error: "Niet geautoriseerd. Log opnieuw in."

---

### Test Category 2: Create Appointment (E3.S2)

#### Test 2.1: Create valid appointment
**Prerequisites**: User is logged in, valid patient ID available
```bash
curl -X POST 'http://localhost:3000/api/swift/agenda/create' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <session-cookie>' \
  -d '{
    "patientId": "<uuid>",
    "datetime": {
      "date": "2025-12-28",
      "time": "14:00"
    },
    "type": "intake",
    "location": "praktijk",
    "notes": "Eerste afspraak"
  }'
```
**Expected**:
- Status: 201
- Response: `{ success: true, encounterId: "<uuid>", appointment: {...} }`
- Appointment visible in agenda

#### Test 2.2: Create appointment in the past
```bash
curl -X POST 'http://localhost:3000/api/swift/agenda/create' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <session-cookie>' \
  -d '{
    "patientId": "<uuid>",
    "datetime": {
      "date": "2020-01-01",
      "time": "14:00"
    },
    "type": "intake",
    "location": "praktijk"
  }'
```
**Expected**:
- Status: 400
- Error: "Kan geen afspraken in het verleden maken"

#### Test 2.3: Create appointment with invalid type
```bash
curl -X POST 'http://localhost:3000/api/swift/agenda/create' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <session-cookie>' \
  -d '{
    "patientId": "<uuid>",
    "datetime": {
      "date": "2025-12-28",
      "time": "14:00"
    },
    "type": "invalid_type",
    "location": "praktijk"
  }'
```
**Expected**:
- Status: 400
- Error: "type moet een geldig afspraaktype zijn"

#### Test 2.4: Create appointment with missing required fields
```bash
curl -X POST 'http://localhost:3000/api/swift/agenda/create' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <session-cookie>' \
  -d '{
    "patientId": "<uuid>",
    "datetime": {
      "date": "2025-12-28"
    },
    "type": "intake",
    "location": "praktijk"
  }'
```
**Expected**:
- Status: 400
- Error: Contains validation error about missing time

---

### Test Category 3: Cancel Appointment (E3.S3a)

#### Test 3.1: Cancel valid appointment
**Prerequisites**: User has an upcoming appointment
```bash
curl -X POST 'http://localhost:3000/api/swift/agenda/cancel' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <session-cookie>' \
  -d '{
    "encounterId": "<uuid>"
  }'
```
**Expected**:
- Status: 200
- Response: `{ success: true, encounterId: "<uuid>", message: "Afspraak succesvol geannuleerd" }`
- Appointment status updated to 'cancelled'

#### Test 3.2: Cancel already cancelled appointment
```bash
curl -X POST 'http://localhost:3000/api/swift/agenda/cancel' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <session-cookie>' \
  -d '{
    "encounterId": "<uuid-of-cancelled-appointment>"
  }'
```
**Expected**:
- Status: 400
- Error: "Deze afspraak is al geannuleerd"

#### Test 3.3: Cancel non-existent appointment
```bash
curl -X POST 'http://localhost:3000/api/swift/agenda/cancel' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <session-cookie>' \
  -d '{
    "encounterId": "00000000-0000-0000-0000-000000000000"
  }'
```
**Expected**:
- Status: 404
- Error: "Afspraak niet gevonden"

#### Test 3.4: Cancel appointment owned by another user
**Prerequisites**: Have another user's appointment ID
```bash
curl -X POST 'http://localhost:3000/api/swift/agenda/cancel' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <session-cookie>' \
  -d '{
    "encounterId": "<uuid-of-other-users-appointment>"
  }'
```
**Expected**:
- Status: 403
- Error: "Je hebt geen toegang tot deze afspraak"

---

### Test Category 4: Reschedule Appointment (E3.S3b)

#### Test 4.1: Reschedule valid appointment
**Prerequisites**: User has an upcoming appointment
```bash
curl -X POST 'http://localhost:3000/api/swift/agenda/reschedule' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <session-cookie>' \
  -d '{
    "encounterId": "<uuid>",
    "newDatetime": {
      "date": "2025-12-29",
      "time": "15:00"
    }
  }'
```
**Expected**:
- Status: 200
- Response: `{ success: true, encounterId: "<uuid>", appointment: {...}, message: "Afspraak succesvol verzet" }`
- Appointment period_start and period_end updated

#### Test 4.2: Reschedule to past date
```bash
curl -X POST 'http://localhost:3000/api/swift/agenda/reschedule' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <session-cookie>' \
  -d '{
    "encounterId": "<uuid>",
    "newDatetime": {
      "date": "2020-01-01",
      "time": "15:00"
    }
  }'
```
**Expected**:
- Status: 400
- Error: "Kan geen afspraken in het verleden verzetten"

#### Test 4.3: Reschedule cancelled appointment
```bash
curl -X POST 'http://localhost:3000/api/swift/agenda/reschedule' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <session-cookie>' \
  -d '{
    "encounterId": "<uuid-of-cancelled-appointment>",
    "newDatetime": {
      "date": "2025-12-29",
      "time": "15:00"
    }
  }'
```
**Expected**:
- Status: 400
- Error: "Kan een geannuleerde afspraak niet verzetten"

#### Test 4.4: Reschedule with preserved duration
**Prerequisites**: Create an appointment with 2-hour duration
```bash
# First, create appointment manually with 2-hour duration
# Then reschedule it
curl -X POST 'http://localhost:3000/api/swift/agenda/reschedule' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <session-cookie>' \
  -d '{
    "encounterId": "<uuid>",
    "newDatetime": {
      "date": "2025-12-29",
      "time": "10:00"
    }
  }'
```
**Expected**:
- Status: 200
- Response period_end is 2 hours after period_start (preserves original duration)

---

### Test Category 5: Patient Search (E3.S4)

#### Test 5.1: Search for existing patient
**Prerequisites**: Patient "Jan de Vries" exists in database
```bash
curl -X GET 'http://localhost:3000/api/swift/patients/search?q=jan' \
  -H 'Cookie: <session-cookie>'
```
**Expected**:
- Status: 200
- Response: `{ patients: [{id, name, bsn, birthDate}], count: N, query: "jan" }`
- Results include matching patients

#### Test 5.2: Search with partial name
```bash
curl -X GET 'http://localhost:3000/api/swift/patients/search?q=vri' \
  -H 'Cookie: <session-cookie>'
```
**Expected**:
- Status: 200
- Response includes patients with "vri" in their name (e.g., "de Vries")

#### Test 5.3: Search with no matches
```bash
curl -X GET 'http://localhost:3000/api/swift/patients/search?q=zzzzzzz' \
  -H 'Cookie: <session-cookie>'
```
**Expected**:
- Status: 200
- Response: `{ patients: [], count: 0, query: "zzzzzzz" }`

#### Test 5.4: Search without query parameter
```bash
curl -X GET 'http://localhost:3000/api/swift/patients/search' \
  -H 'Cookie: <session-cookie>'
```
**Expected**:
- Status: 400
- Error: "Query parameter 'q' is verplicht"

#### Test 5.5: Search with empty query
```bash
curl -X GET 'http://localhost:3000/api/swift/patients/search?q=' \
  -H 'Cookie: <session-cookie>'
```
**Expected**:
- Status: 400
- Error: "Zoekterm mag niet leeg zijn"

---

## 🔐 Security Checklist

| Check | Status | Notes |
|-------|--------|-------|
| All endpoints require authentication | ✅ | Returns 401 if not authenticated |
| User can only access their own appointments | ✅ | Filtered by practitioner_id |
| User cannot cancel/reschedule others' appointments | ✅ | Ownership verification in place |
| Input validation on all endpoints | ✅ | Zod schemas with Dutch error messages |
| SQL injection prevention | ✅ | Using Supabase client with parameterized queries |
| XSS prevention | ✅ | No direct HTML rendering |
| CSRF protection | ✅ | Next.js built-in CSRF protection |

---

## 🐛 Known Issues / Edge Cases

### Issue 1: Patient Search Query Performance
- **Description**: The patient search uses `ilike` which may be slow on large datasets
- **Mitigation**: Limited to 10 results
- **Future**: Consider adding database index on name_family/name_given

### Issue 2: Timezone Handling
- **Description**: All dates stored in UTC, client must handle timezone conversion
- **Current**: Using ISO string format
- **Future**: Consider explicit timezone handling in API

### Issue 3: Appointment Conflicts
- **Description**: No conflict detection when creating/rescheduling appointments
- **Status**: Out of scope for MVP
- **Future**: Add conflict warning in Epic 4 (UI layer)

---

## 📊 Test Results Summary

| Story | Total Tests | Passed | Failed | Blocked | Coverage |
|-------|-------------|--------|--------|---------|----------|
| E3.S1 | 4 | - | - | - | Auth, Validation, Happy Path |
| E3.S2 | 4 | - | - | - | Validation, Security, Happy Path |
| E3.S3a | 4 | - | - | - | Security, Validation, Happy Path |
| E3.S3b | 4 | - | - | - | Security, Validation, Duration |
| E3.S4 | 5 | - | - | - | Search, Validation, Empty State |
| **Total** | **21** | **TBD** | **TBD** | **TBD** | **All scenarios** |

---

## 🚀 Next Steps

After manual testing is complete:

1. ✅ **Epic 3 Complete** → Move to Epic 4 (AgendaBlock UI)
2. 📝 **Update Build Plan** → Mark Epic 3 stories as "Done"
3. 🧪 **Integration Testing** → Test with actual UI when Epic 4 is ready
4. 📚 **API Documentation** → Generate OpenAPI/Swagger docs (optional)

---

## 📁 Files Created

```
app/api/swift/
├── agenda/
│   ├── route.ts                  # E3.S1: Query endpoint
│   ├── create/
│   │   └── route.ts              # E3.S2: Create endpoint
│   ├── cancel/
│   │   └── route.ts              # E3.S3a: Cancel endpoint
│   └── reschedule/
│       └── route.ts              # E3.S3b: Reschedule endpoint
└── patients/
    └── search/
        └── route.ts              # E3.S4: Patient search endpoint
```

---

## 🎓 Lessons Learned

1. **Zod Validation**: Use `validation.error.issues` not `validation.error.errors`
2. **Database Column Names**: Check generated types carefully (e.g., `identifier_bsn` vs `bsn`)
3. **Security First**: Always verify resource ownership before mutations
4. **Reuse Actions**: Existing server actions (`getEncounters`, `createEncounter`, etc.) work perfectly
5. **Type Safety**: TypeScript catches errors early - run `pnpm exec tsc` before testing

---

**Test Plan Status**: ✅ Ready for Manual Testing
**Implementation Status**: ✅ Complete (All 4 stories)
**Type Check**: ✅ Passing
**Next Epic**: Epic 4 - AgendaBlock UI
