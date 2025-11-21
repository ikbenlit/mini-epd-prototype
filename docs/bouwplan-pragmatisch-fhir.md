# 🚀 Bouwplan Mini-EPD — Pragmatische FHIR Aanpak

💡 **Focus: Data-uitwisselbaarheid met MedMIJ/FHIR bouwstenen voor prototype**

Dit bouwplan beschrijft een **pragmatische implementatie** van FHIR resources gericht op **interoperabiliteit** en **API-based data-uitwisseling**. Niet alle 13 FHIR resources worden geïmplementeerd—alleen wat nodig is voor een werkend, uitwisselbaar prototype.

---

**Projectnaam:** Mini-EPD Prototype (Pragmatic FHIR Edition)
**Versie:** v2.0 (Pragmatisch)
**Datum:** 21 november 2024
**Auteur:** Colin Lit (ikbenlit.nl)

## 📊 Voortgang

**Voltooide Epics:** 2 van 7 (29%)
**Voltooide Story Points:** 34 van 117 (29%)
**Status:** ✅ Epic 1 & 2 Gereed - FHIR Foundation Complete!

| Epic | Status | Voltooiingsdatum |
|------|--------|------------------|
| E0 - Setup & Config | ✅ Gereed | Pre-project |
| E1 - FHIR Core Schema | ✅ Gereed | 21 november 2024 |
| E2 - Patients & Practitioners | ✅ Gereed | 21 november 2024 |
| E3 - Encounters (Intake) | ⏳ To Do | - |
| E4 - Conditions (DSM-5) | ⏳ To Do | - |
| E5 - CarePlans (Treatment) 🎯 | ⏳ To Do | - |
| E6 - Observations (ROM) | ⏳ To Do | - |
| E7 - API Polish & Demo | ⏳ To Do | - |

**Huidige Sprint:** Epic 3 - Encounters (Intake)

---

## 1. Doel en Context

🎯 **Primair Doel:**
Een werkend EPD-prototype bouwen waarbij **behandelplannen en klinische data uitwisselbaar** zijn via FHIR-compliant API's. Het systeem moet data kunnen **exporteren én importeren** in standaard FHIR JSON formaat.

📘 **Context:**
Dit is een **pragmatisch prototype** met focus op:
- ✅ **Data-uitwisselbaarheid**: Andere systemen kunnen jouw data lezen/schrijven
- ✅ **MedMIJ/FHIR bouwstenen**: Basis voor toekomstige certificering
- ✅ **API-first**: Behandelplannen via `GET /api/fhir/CarePlan/{id}`
- ⚠️ **Goed genoeg AVG**: Niet 100% compliant, maar verantwoord voor prototype
- ⚠️ **Geen complete features**: Focus op kern, rest komt later

**Wat dit NIET is:**
- ❌ Volledig production-ready EPD
- ❌ 100% MedMIJ-gecertificeerd
- ❌ Compleet consent management systeem
- ❌ Multi-tenant SaaS platform

**Referentie documenten:**
- `docs/datamodel-documentatie.md` - FHIR uitleg
- `lib/supabase/20241121_fhir_ggz_schema.sql` - Volledig schema (gebruiken we deels)

---

## 2. Uitgangspunten

### 2.1 Technische Stack

**Frontend:**
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Lucide Icons
- **Forms:** React Hook Form + Zod validation
- **FHIR Utilities:** Custom hooks voor FHIR transformaties

**Backend:**
- **Database:** Supabase (PostgreSQL) ✅ Al actief
- **Auth:** Supabase Auth ✅ Al actief (20 users)
- **API:** Next.js API Routes (FHIR-compliant endpoints)
- **FHIR Validation:** @hapi/fhir (optioneel, voor strikte validatie)

**FHIR Implementation:**
- **FHIR Version:** R4
- **Resources:** Patient, Practitioner, Encounter, Condition, Observation, CarePlan
- **Format:** application/fhir+json
- **API Style:** RESTful (geen GraphQL voor FHIR endpoints)

**Development & Deployment:**
- **Package Manager:** pnpm
- **TypeScript:** Strict mode enabled
- **Database Migrations:** Supabase migrations (versioned)
- **Hosting:** Vercel ✅ Waarschijnlijk al actief
- **Database Hosting:** Supabase Cloud ✅ Actief

### 2.2 Projectkaders

**Tijd:**
- **Fase 1 (Core FHIR):** 4 weken
- **Fase 2 (CarePlan API):** 2 weken
- **Fase 3 (Polish + Demo):** 2 weken
- **Totaal:** 8 weken voor werkend prototype

**Team:**
- 1 Full-stack developer (jij)
- GGZ-consultant (als sparringpartner)

**Scope Pragmatisch Prototype:**

✅ **WEL Implementeren:**
- FHIR Resources: Patient, Practitioner, Encounter, Condition, Observation, CarePlan
- CRUD UI voor alle bovenstaande resources
- RESTful FHIR API endpoints voor data export/import
- Migratie van huidige `clients` → `patients`, `treatment_plans` → `care_plans`
- Basis ROM-metingen (PHQ-9, GAD-7)
- DSM-5 diagnose registratie
- Demo data seeding

❌ **NIET Implementeren (Later/Out of Scope):**
- MedicationStatements (medicatie tracking)
- Consents (AVG consent management)
- Flags (safety waarschuwingen)
- DocumentReferences (documenten/verslagen)
- Goals als aparte tabel (embedded in CarePlan JSON)
- Activities als aparte tabel (embedded in CarePlan JSON)
- BSN encryptie (gebruik placeholder BSN voor demo)
- Multi-tenancy (1 organisatie hardcoded)
- MedMIJ certificering (wel compatible datastructuur)
- OAuth2/SMART-on-FHIR (simpele bearer token auth)

**Data:**
- Demo/fictieve data (geen productie)
- BSN placeholders (geen echte BSN's)
- Privacy by design maar geen volledige AVG audit

### 2.3 Programmeer Uitgangspunten

**FHIR-Specific Principles:**

- **FHIR Compliance > Perfectie**
  - Volg FHIR R4 spec waar relevant
  - Pragmatisch bij optionele velden
  - Documenteer deviaties in comments

- **API-First Development**
  - Elke resource MOET via API beschikbaar zijn
  - FHIR JSON als primaire output format
  - Database structure volgt FHIR resource definitie

- **Hybrid Approach**
  - Behoud bestaande tabellen waar mogelijk (`clients`, `intake_notes`, `ai_events`)
  - Voeg FHIR tabellen toe waar nodig (`patients`, `care_plans`, etc.)
  - Migreer data incrementeel (geen "big bang")

**Code Quality Principles:**

- **DRY (Don't Repeat Yourself)**
  - Herbruikbare FHIR transform functies
  - Centrale FHIR type definitions
  - Shared validation schemas (Zod + FHIR)

- **KISS (Keep It Simple, Stupid)**
  - Eenvoudige FHIR mapping (geen complexe HL7v2 conversies)
  - Embedded JSON voor goals/activities (geen aparte tabellen)
  - Straightforward API endpoints (geen HATEOAS links voor MVP)

- **SOC (Separation of Concerns)**
  - `/lib/fhir/` - FHIR transformaties en validators
  - `/lib/db/` - Database queries
  - `/app/api/fhir/` - FHIR API endpoints
  - `/components/` - UI componenten

**Development Practices:**

- **Code Organization**
  ```
  /app
    /(dashboard)        # Protected routes
      /patients
      /encounters
      /care-plans       # Treatment planning
    /api
      /fhir             # FHIR endpoints
        /Patient
        /CarePlan
        /Condition
        /Observation
  /lib
    /fhir               # FHIR utilities
      /transforms       # DB → FHIR, FHIR → DB
      /validators       # FHIR validation
      /types            # FHIR TypeScript types
    /db                 # Database helpers
  ```

- **FHIR Transformation Pattern**
  ```typescript
  // Database → FHIR JSON
  export function dbCarePlanToFHIR(dbRow: CarePlanRow): FHIRCarePlan {
    return {
      resourceType: "CarePlan",
      id: dbRow.id,
      status: dbRow.status,
      intent: dbRow.intent,
      subject: {
        reference: `Patient/${dbRow.patient_id}`,
        display: dbRow.patient_name
      },
      // ... mapping logic
    };
  }

  // FHIR JSON → Database
  export function fhirCarePlanToDB(fhir: FHIRCarePlan): CarePlanInsert {
    return {
      id: fhir.id,
      status: fhir.status,
      patient_id: extractIdFromReference(fhir.subject.reference),
      // ... mapping logic
    };
  }
  ```

- **API Response Format**
  ```typescript
  // All FHIR endpoints return application/fhir+json
  return Response.json(fhirResource, {
    headers: {
      'Content-Type': 'application/fhir+json',
      'X-FHIR-Version': '4.0.1'
    }
  });
  ```

- **Error Handling**
  - FHIR OperationOutcome voor API errors
  - User-friendly messages in UI
  - Structured logging voor debugging

- **Security**
  - RLS policies per FHIR resource
  - Bearer token auth voor API (simpel, geen OAuth2)
  - Input validation met Zod + FHIR schema validation

---

## 3. Epics & Stories Overzicht

🎯 **Pragmatische implementatie: 8 epics, 32 stories, ~120 story points**

| Epic ID | Titel | Doel | Status | Stories | Story Points | Weken |
|---------|-------|------|--------|---------|--------------|-------|
| E0 | Setup & Config ✅ | Next.js, Supabase (done) | ✅ Gereed | 5 | 10 | 0 |
| E1 | FHIR Core Schema ✅ | 6 FHIR tabellen + migratie | ✅ Gereed | 5 | 21 | 1.5 |
| E2 | Patients & Practitioners ✅ | FHIR Patient/Practitioner CRUD + API | ✅ Gereed | 4 | 13 | 1 |
| E3 | Encounters (Intake) | Contactmoment registratie + API | ⏳ To Do | 4 | 13 | 1 |
| E4 | Conditions (DSM-5) | Diagnose registratie + API | ⏳ To Do | 4 | 13 | 1 |
| E5 | **CarePlans (Treatment)** 🎯 | Behandelplan CRUD + FHIR API | ⏳ To Do | 5 | 21 | 2 |
| E6 | Observations (ROM) | ROM-metingen + API | ⏳ To Do | 4 | 13 | 1 |
| E7 | API Polish & Demo | Swagger docs, demo scenario, testing | ⏳ To Do | 4 | 13 | 0.5 |

**Totaal:** 35 stories, ~117 story points, **8 weken @ 15 points/week**

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 — Setup & Configuratie ✅
**Status:** GEREED (al gedaan in huidige setup)

**Wat is al actief:**
- ✅ Next.js project
- ✅ Supabase project + connection
- ✅ Supabase Auth (20 users)
- ✅ RLS enabled op tabellen
- ✅ Demo users systeem
- ✅ Basis tabellen: clients, intake_notes, treatment_plans, ai_events

**Geen actie vereist - ga door naar Epic 1**

---

### Epic 1 — FHIR Core Schema & Migratie ✅
**Epic Doel:** FHIR-compliant database tabellen toevoegen en bestaande data migreren.
**Status:** GEREED (21 november 2024)

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E1.S1 | Pragmatisch FHIR schema maken | Nieuw schema: `20241121_pragmatic_fhir_schema.sql` met 6 resources + embedded goals/activities | ✅ Gereed | E0 | 5 |
| E1.S2 | Migratie toepassen | SQL uitvoeren in Supabase, verify tabellen | ✅ Gereed | E1.S1 | 3 |
| E1.S3 | TypeScript types genereren | `supabase gen types` → `/types/database.ts` | ✅ Gereed | E1.S2 | 2 |
| E1.S4 | Data migratie script | `clients` → `patients`, `treatment_plans` → `care_plans` | ✅ Gereed | E1.S3 | 8 |
| E1.S5 | Seed data FHIR | Demo practitioners, organizations, FHIR patients | ✅ Gereed | E1.S4 | 3 |

**Technical Notes:**

**E1.S1: Nieuw Schema Bestand Maken**

Het originele schema `20241121_fhir_ggz_schema.sql` bevat alle 13 FHIR resources. Voor de pragmatische aanpak maken we een **nieuw schema bestand**: `lib/supabase/20241121_pragmatic_fhir_schema.sql`

**Verschillen met origineel schema:**

| Aspect | Origineel Schema | Pragmatisch Schema |
|--------|------------------|-------------------|
| Resources | 13 tabellen | **7 tabellen** (6 FHIR + 1 org) |
| Goals | Aparte `goals` tabel | **Embedded in `care_plans.goals` JSONB** |
| Activities | Aparte `care_plan_activities` tabel | **Embedded in `care_plans.activities` JSONB** |
| Medications | `medication_statements` tabel | ❌ Niet geïmplementeerd |
| Consents | `consents` tabel | ❌ Niet geïmplementeerd |
| Flags | `flags` tabel | ❌ Niet geïmplementeerd |
| Documents | `document_references` tabel | ❌ Niet geïmplementeerd |
| BSN encryptie | `pgcrypto` encryptie | **Placeholder BSN** (demo) |

**FHIR Resources Implementeren (7 tabellen):**
```sql
-- Core 6 FHIR resources + 1 organization
CREATE TABLE practitioners (...);       -- FHIR Practitioner
CREATE TABLE organizations (...);       -- FHIR Organization (1 default)
CREATE TABLE patients (...);            -- FHIR Patient (BSN placeholder)
CREATE TABLE encounters (...);          -- FHIR Encounter
CREATE TABLE conditions (...);          -- FHIR Condition (DSM-5)
CREATE TABLE observations (...);        -- FHIR Observation (ROM)
CREATE TABLE care_plans (...);          -- FHIR CarePlan (goals/activities embedded!)

-- Behouden:
✅ clients (legacy, read-only na migratie)
✅ intake_notes (blijft bestaan, later DocumentReference)
✅ treatment_plans (legacy, read-only na migratie)
✅ ai_events (blijft bestaan)
✅ demo_users (blijft bestaan)
```

**Belangrijk verschil: care_plans tabel**
```sql
-- Pragmatisch: Embedded goals en activities
CREATE TABLE care_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ... andere velden ...

  -- PRAGMATISCH: JSONB embedded ipv aparte tabellen
  goals JSONB DEFAULT '[]'::jsonb,
  activities JSONB DEFAULT '[]'::jsonb,

  -- Goals structure: [{description, target}, ...]
  -- Activities structure: [{detail: {code, status, scheduledTiming}}, ...]
);

-- VS Origineel: Aparte tabellen
-- CREATE TABLE goals (...);                -- ❌ Niet in pragmatisch schema
-- CREATE TABLE care_plan_activities (...); -- ❌ Niet in pragmatisch schema
```

**Migratie Strategie:**
```typescript
// scripts/migrate-to-fhir.ts
async function migrateClientsToPatients() {
  const clients = await supabase.from('clients').select('*');

  for (const client of clients.data) {
    await supabase.from('patients').insert({
      id: client.id,  // Behoud UUID voor referential integrity
      identifier_bsn: '999999990',  // Placeholder BSN
      identifier_client_number: client.id,
      name_family: client.last_name,
      name_given: [client.first_name],
      birth_date: client.birth_date,
      gender: 'unknown',
      active: true,
      created_at: client.created_at,
      updated_at: client.updated_at
    });
  }

  console.log(`✅ Migrated ${clients.data.length} clients → patients`);
}

async function migrateTreatmentPlansToCarePlans() {
  const plans = await supabase
    .from('treatment_plans')
    .select('*, clients(first_name, last_name)');

  for (const plan of plans.data) {
    const goals = plan.plan.doelen?.map(doel => ({
      description: { text: doel },
      // FHIR Goal structure embedded
    })) || [];

    const activities = plan.plan.interventies?.map(interventie => ({
      detail: {
        code: { text: interventie },
        status: 'not-started',
        // FHIR Activity structure embedded
      }
    })) || [];

    await supabase.from('care_plans').insert({
      id: plan.id,
      patient_id: plan.client_id,
      status: plan.status === 'gepubliceerd' ? 'active' : 'draft',
      intent: 'plan',
      title: `Behandelplan v${plan.version}`,
      category_code: 'ggz-behandelplan',
      category_display: 'GGZ Behandelplan',
      goals: goals,  // JSONB embedded
      activities: activities,  // JSONB embedded (pragmatisch!)
      period_start: plan.created_at,
      created_date: plan.created_at,
      created_by: plan.created_by
    });
  }

  console.log(`✅ Migrated ${plans.data.length} treatment_plans → care_plans`);
}
```

**Acceptance:**
- ✅ 6 FHIR tabellen aanwezig in Supabase
- ✅ TypeScript types gegenereerd
- ✅ Bestaande data gemigreerd (clients → patients, treatment_plans → care_plans)
- ✅ Legacy tabellen read-only (geen DELETE policies)
- ✅ Seed data met 3 demo patients, 2 practitioners, 1 organization

**FHIR Schema Details:**
```sql
-- Simplified: Goals en Activities embedded in JSONB
CREATE TABLE care_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,

  status careplan_status NOT NULL DEFAULT 'draft',
  intent TEXT NOT NULL DEFAULT 'plan',

  title TEXT NOT NULL,
  description TEXT,

  patient_id UUID REFERENCES patients(id) NOT NULL,
  encounter_id UUID REFERENCES encounters(id),
  author_id UUID REFERENCES practitioners(id),

  period_start DATE,
  period_end DATE,

  category_code TEXT DEFAULT 'ggz-behandelplan',
  category_display TEXT DEFAULT 'GGZ Behandelplan',

  -- PRAGMATISCH: Embedded JSON ipv aparte tabellen
  goals JSONB DEFAULT '[]'::jsonb,  -- Array van FHIR Goal structures
  activities JSONB DEFAULT '[]'::jsonb,  -- Array van FHIR Activity structures

  addresses_condition_ids UUID[],  -- Welke diagnoses behandeld

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN care_plans.goals IS 'FHIR Goal structures embedded as JSONB array';
COMMENT ON COLUMN care_plans.activities IS 'FHIR CarePlan.activity structures embedded as JSONB array';
```

---

### Epic 2 — Patients & Practitioners ✅
**Epic Doel:** FHIR Patient en Practitioner CRUD + API endpoints.
**Status:** GEREED (21 november 2024)

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E2.S1 | FHIR transforms library | DB → FHIR, FHIR → DB functies | ✅ Gereed | E1.S5 | 5 |
| E2.S2 | Patient API endpoints | GET/POST/PUT `/api/fhir/Patient` | ✅ Gereed | E2.S1 | 3 |
| E2.S3 | Practitioner API endpoints | GET/POST `/api/fhir/Practitioner` | ✅ Gereed | E2.S1 | 2 |
| E2.S4 | Patient UI (CRUD) | `/epd/patients` lijst + detail + forms | ✅ Gereed | E2.S2 | 3 |

**Technical Notes:**

**FHIR Transform Library:**
```typescript
// lib/fhir/transforms/patient.ts
import type { FHIRPatient, Database } from '@/types';

type PatientRow = Database['public']['Tables']['patients']['Row'];

export function dbPatientToFHIR(row: PatientRow): FHIRPatient {
  return {
    resourceType: "Patient",
    id: row.id,
    identifier: [
      {
        system: "http://fhir.nl/fhir/NamingSystem/bsn",
        value: row.identifier_bsn
      },
      {
        system: "urn:oid:2.16.840.1.113883.2.4.3.11.999.7.6",
        value: row.identifier_client_number || row.id
      }
    ],
    name: [{
      use: "official",
      family: row.name_family,
      given: row.name_given,
      prefix: row.name_prefix ? [row.name_prefix] : undefined
    }],
    birthDate: row.birth_date,
    gender: row.gender as "male" | "female" | "other" | "unknown",
    telecom: [
      row.telecom_phone && {
        system: "phone",
        value: row.telecom_phone,
        use: "mobile"
      },
      row.telecom_email && {
        system: "email",
        value: row.telecom_email
      }
    ].filter(Boolean),
    address: row.address_line ? [{
      use: "home",
      line: row.address_line,
      city: row.address_city,
      postalCode: row.address_postal_code,
      country: row.address_country || "NL"
    }] : undefined,
    active: row.active,
    meta: {
      lastUpdated: row.updated_at
    }
  };
}

export function fhirPatientToDB(fhir: FHIRPatient): Partial<PatientRow> {
  const bsn = fhir.identifier?.find(i =>
    i.system === "http://fhir.nl/fhir/NamingSystem/bsn"
  )?.value;

  const name = fhir.name?.[0];
  const address = fhir.address?.[0];
  const phone = fhir.telecom?.find(t => t.system === "phone")?.value;
  const email = fhir.telecom?.find(t => t.system === "email")?.value;

  return {
    id: fhir.id,
    identifier_bsn: bsn || '999999990',
    name_family: name?.family || '',
    name_given: name?.given || [],
    name_prefix: name?.prefix?.[0],
    birth_date: fhir.birthDate,
    gender: fhir.gender || 'unknown',
    telecom_phone: phone,
    telecom_email: email,
    address_line: address?.line,
    address_city: address?.city,
    address_postal_code: address?.postalCode,
    address_country: address?.country || 'NL',
    active: fhir.active ?? true
  };
}
```

**API Endpoints:**
```typescript
// app/api/fhir/Patient/route.ts
import { dbPatientToFHIR, fhirPatientToDB } from '@/lib/fhir/transforms/patient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('_id');

  let query = supabase.from('patients').select('*');

  if (id) {
    query = query.eq('id', id).single();
    const { data, error } = await query;

    if (error || !data) {
      return Response.json({
        resourceType: "OperationOutcome",
        issue: [{
          severity: "error",
          code: "not-found",
          diagnostics: "Patient not found"
        }]
      }, { status: 404 });
    }

    return Response.json(dbPatientToFHIR(data), {
      headers: { 'Content-Type': 'application/fhir+json' }
    });
  }

  // Search all patients
  const { data, error } = await query;

  return Response.json({
    resourceType: "Bundle",
    type: "searchset",
    total: data?.length || 0,
    entry: data?.map(row => ({
      resource: dbPatientToFHIR(row)
    })) || []
  }, {
    headers: { 'Content-Type': 'application/fhir+json' }
  });
}

export async function POST(request: Request) {
  const fhirPatient = await request.json();
  const dbPatient = fhirPatientToDB(fhirPatient);

  const { data, error } = await supabase
    .from('patients')
    .insert(dbPatient)
    .select()
    .single();

  if (error) {
    return Response.json({
      resourceType: "OperationOutcome",
      issue: [{
        severity: "error",
        code: "processing",
        diagnostics: error.message
      }]
    }, { status: 400 });
  }

  return Response.json(dbPatientToFHIR(data), {
    status: 201,
    headers: {
      'Content-Type': 'application/fhir+json',
      'Location': `/api/fhir/Patient/${data.id}`
    }
  });
}
```

**Acceptance:** ✅ **VOLTOOID**
- ✅ `/api/fhir/Patient` GET/POST/PUT werkend (`app/api/fhir/Patient/route.ts`, `app/api/fhir/Patient/[id]/route.ts`)
- ✅ `/api/fhir/Practitioner` GET/POST werkend (`app/api/fhir/Practitioner/route.ts`, `app/api/fhir/Practitioner/[id]/route.ts`)
- ✅ FHIR JSON output correct volgens spec (met `Content-Type: application/fhir+json`)
- ✅ Patient lijst UI toont alle patients (`/epd/patients`)
- ✅ Patient detail pagina toont FHIR data (`/epd/patients/[id]`)
- ✅ Patient create/edit forms werken (`/epd/patients/new`, `/epd/patients/[id]`)
- ✅ FHIR transforms library compleet (`lib/fhir/transforms/patient.ts`, `lib/fhir/transforms/practitioner.ts`)
- ✅ TypeScript compilatie succesvol zonder errors

---

### Epic 3 — Encounters (Intake)
**Epic Doel:** Contactmoment registratie met FHIR Encounter resource.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E3.S1 | Encounter FHIR transforms | DB ↔ FHIR functies | ⏳ | E2.S4 | 3 |
| E3.S2 | Encounter API endpoints | GET/POST/PUT `/api/fhir/Encounter` | ⏳ | E3.S1 | 3 |
| E3.S3 | Encounter tijdlijn UI | `/patients/[id]/encounters` chronologisch | ⏳ | E3.S2 | 4 |
| E3.S4 | Nieuw encounter formulier | Create intake/behandeling/follow-up | ⏳ | E3.S3 | 3 |

**Technical Notes:**

**Encounter Types (GGZ):**
```typescript
const encounterTypes = [
  { code: 'intake', display: 'Intakegesprek' },
  { code: 'diagnostiek', display: 'Diagnostisch onderzoek' },
  { code: 'behandeling', display: 'Behandelsessie' },
  { code: 'follow-up', display: 'Follow-up gesprek' },
  { code: 'crisis', display: 'Crisisinterventie' }
];

const encounterClass = [
  { code: 'AMB', display: 'Ambulatory (polikliniek)' },
  { code: 'IMP', display: 'Inpatient (kliniek)' },
  { code: 'VR', display: 'Virtual (online)' }
];
```

**Encounter → Intake Notes Koppeling:**
```typescript
// Behoud intake_notes, link naar encounter
async function linkIntakeNoteToEncounter(noteId: string, encounterId: string) {
  await supabase
    .from('intake_notes')
    .update({
      encounter_id: encounterId,  // Add column via migration
      tag: 'Intake'
    })
    .eq('id', noteId);
}
```

**Acceptance:**
- ✅ `/api/fhir/Encounter` CRUD werkend
- ✅ Timeline toont encounters per patient
- ✅ Intake notes gekoppeld aan encounters
- ✅ Status flow: planned → in-progress → completed
- ✅ Encounter detail pagina met notes

---

### Epic 4 — Conditions (DSM-5)
**Epic Doel:** Diagnose registratie met FHIR Condition resource.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E4.S1 | DSM-5 codes seed | Top 50 GGZ diagnoses in database | ⏳ | E1.S5 | 2 |
| E4.S2 | Condition FHIR transforms | DB ↔ FHIR functies | ⏳ | E3.S4 | 3 |
| E4.S3 | Condition API endpoints | GET/POST/PUT `/api/fhir/Condition` | ⏳ | E4.S2 | 3 |
| E4.S4 | Diagnose UI | Problemlijst + diagnose toevoegen form | ⏳ | E4.S3 | 5 |

**Technical Notes:**

**DSM-5 Seed Data:**
```typescript
// scripts/seed-dsm5-codes.ts
const dsm5Codes = [
  {
    code: 'F32.2',
    display: 'Depressieve episode, ernstig zonder psychotische kenmerken',
    system: 'http://hl7.org/fhir/sid/icd-10',
    category: 'stemming'
  },
  {
    code: 'F41.1',
    display: 'Gegeneraliseerde angststoornis',
    system: 'http://hl7.org/fhir/sid/icd-10',
    category: 'angst'
  },
  {
    code: 'F60.31',
    display: 'Borderline persoonlijkheidsstoornis',
    system: 'http://hl7.org/fhir/sid/icd-10',
    category: 'persoonlijkheid'
  },
  {
    code: 'F20.0',
    display: 'Paranoïde schizofrenie',
    system: 'http://hl7.org/fhir/sid/icd-10',
    category: 'psychotisch'
  },
  {
    code: 'F84.0',
    display: 'Autismespectrumstoornis',
    system: 'http://hl7.org/fhir/sid/icd-10',
    category: 'ontwikkeling'
  }
  // ... 45 more
];
```

**Condition FHIR Example:**
```json
{
  "resourceType": "Condition",
  "id": "condition-123",
  "clinicalStatus": {
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
      "code": "active"
    }]
  },
  "verificationStatus": {
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
      "code": "confirmed"
    }]
  },
  "category": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/condition-category",
      "code": "encounter-diagnosis"
    }]
  }],
  "severity": {
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "24484000",
      "display": "Severe"
    }]
  },
  "code": {
    "coding": [{
      "system": "http://hl7.org/fhir/sid/icd-10",
      "code": "F32.2",
      "display": "Depressieve episode, ernstig"
    }]
  },
  "subject": {
    "reference": "Patient/patient-456"
  },
  "encounter": {
    "reference": "Encounter/encounter-789"
  },
  "onsetDateTime": "2024-01-15",
  "recordedDate": "2024-01-15T14:30:00Z",
  "recorder": {
    "reference": "Practitioner/practitioner-1"
  }
}
```

**Acceptance:**
- ✅ DSM-5 codes in database (lookup tabel of JSONB)
- ✅ `/api/fhir/Condition` CRUD werkend
- ✅ Problemlijst toont active diagnoses
- ✅ Diagnose toevoegen met DSM-5 autocomplete
- ✅ Status updates: active → remission → resolved

---

### Epic 5 — CarePlans (Treatment Plans) 🎯
**Epic Doel:** FHIR-compliant behandelplannen met volledige CRUD en API export/import.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E5.S1 | CarePlan FHIR transforms | DB ↔ FHIR functies (incl. goals/activities) | ⏳ | E4.S4 | 5 |
| E5.S2 | CarePlan API endpoints | GET/POST/PUT `/api/fhir/CarePlan` | ⏳ | E5.S1 | 5 |
| E5.S3 | CarePlan wizard UI | Multi-step: diagnoses → doelen → interventies | ⏳ | E5.S2 | 8 |
| E5.S4 | CarePlan detail pagina | Overzicht + voortgang + edit | ⏳ | E5.S3 | 2 |
| E5.S5 | API testen & validatie | Import/export test met externe FHIR tool | ⏳ | E5.S4 | 1 |

**Technical Notes:**

**CarePlan FHIR Transform (Uitgebreid):**
```typescript
// lib/fhir/transforms/careplan.ts
import type { FHIRCarePlan, Database } from '@/types';

type CarePlanRow = Database['public']['Tables']['care_plans']['Row'] & {
  patient: Database['public']['Tables']['patients']['Row'];
  author: Database['public']['Tables']['practitioners']['Row'];
  conditions: Database['public']['Tables']['conditions']['Row'][];
};

export function dbCarePlanToFHIR(row: CarePlanRow): FHIRCarePlan {
  return {
    resourceType: "CarePlan",
    id: row.id,
    identifier: [{
      system: "urn:oid:2.16.840.1.113883.2.4.3.11.999.7.6",
      value: row.identifier
    }],
    status: row.status as "draft" | "active" | "on-hold" | "revoked" | "completed",
    intent: row.intent as "proposal" | "plan" | "order",
    category: [{
      coding: [{
        system: "http://hl7.org/fhir/care-plan-category",
        code: row.category_code || "ggz-behandelplan",
        display: row.category_display || "GGZ Behandelplan"
      }]
    }],
    title: row.title,
    description: row.description,
    subject: {
      reference: `Patient/${row.patient_id}`,
      display: `${row.patient.name_given.join(' ')} ${row.patient.name_family}`
    },
    encounter: row.encounter_id ? {
      reference: `Encounter/${row.encounter_id}`
    } : undefined,
    period: {
      start: row.period_start,
      end: row.period_end
    },
    created: row.created_date,
    author: row.author_id ? {
      reference: `Practitioner/${row.author_id}`,
      display: `${row.author.name_given.join(' ')} ${row.author.name_family}`
    } : undefined,
    addresses: row.addresses_condition_ids?.map(conditionId => ({
      reference: `Condition/${conditionId}`
    })) || [],
    // GOALS: Embedded JSONB → FHIR Goal array
    goal: (row.goals as any[])?.map((goal: any) => ({
      description: {
        text: goal.description || goal.text
      },
      target: goal.target ? [{
        measure: goal.target.measure,
        detailQuantity: goal.target.detailQuantity,
        dueDate: goal.target.dueDate
      }] : undefined
    })) || [],
    // ACTIVITIES: Embedded JSONB → FHIR Activity array
    activity: (row.activities as any[])?.map((activity: any) => ({
      detail: {
        code: {
          text: activity.code?.text || activity.description
        },
        status: activity.status || "not-started",
        scheduledTiming: activity.scheduledTiming,
        performer: activity.performer ? [{
          reference: `Practitioner/${activity.performer}`
        }] : undefined,
        description: activity.description,
        location: activity.location
      }
    })) || [],
    meta: {
      lastUpdated: row.updated_at
    }
  };
}

export function fhirCarePlanToDB(fhir: FHIRCarePlan): Partial<CarePlanRow> {
  // Extract patient ID from reference
  const patientId = fhir.subject?.reference?.replace('Patient/', '');
  const authorId = fhir.author?.reference?.replace('Practitioner/', '');
  const encounterId = fhir.encounter?.reference?.replace('Encounter/', '');

  // Extract condition IDs
  const conditionIds = fhir.addresses?.map(addr =>
    addr.reference?.replace('Condition/', '')
  ).filter(Boolean) as string[];

  // Convert FHIR goals to JSONB
  const goals = fhir.goal?.map(goal => ({
    description: goal.description?.text,
    target: goal.target?.[0] ? {
      measure: goal.target[0].measure,
      detailQuantity: goal.target[0].detailQuantity,
      dueDate: goal.target[0].dueDate
    } : undefined
  }));

  // Convert FHIR activities to JSONB
  const activities = fhir.activity?.map(activity => ({
    code: {
      text: activity.detail?.code?.text
    },
    status: activity.detail?.status || 'not-started',
    scheduledTiming: activity.detail?.scheduledTiming,
    performer: activity.detail?.performer?.[0]?.reference?.replace('Practitioner/', ''),
    description: activity.detail?.description,
    location: activity.detail?.location
  }));

  return {
    id: fhir.id,
    status: fhir.status || 'draft',
    intent: fhir.intent || 'plan',
    title: fhir.title || '',
    description: fhir.description,
    patient_id: patientId,
    encounter_id: encounterId,
    author_id: authorId,
    period_start: fhir.period?.start,
    period_end: fhir.period?.end,
    category_code: fhir.category?.[0]?.coding?.[0]?.code || 'ggz-behandelplan',
    category_display: fhir.category?.[0]?.coding?.[0]?.display || 'GGZ Behandelplan',
    addresses_condition_ids: conditionIds,
    goals: goals as any,  // JSONB
    activities: activities as any,  // JSONB
    created_date: fhir.created
  };
}
```

**API Endpoint met Join:**
```typescript
// app/api/fhir/CarePlan/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabase
    .from('care_plans')
    .select(`
      *,
      patient:patients(*),
      author:practitioners(*),
      conditions:conditions(*)
    `)
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return Response.json({
      resourceType: "OperationOutcome",
      issue: [{
        severity: "error",
        code: "not-found",
        diagnostics: "CarePlan not found"
      }]
    }, { status: 404 });
  }

  const fhirCarePlan = dbCarePlanToFHIR(data);

  return Response.json(fhirCarePlan, {
    headers: {
      'Content-Type': 'application/fhir+json',
      'X-FHIR-Version': '4.0.1'
    }
  });
}

// POST: Import FHIR CarePlan
export async function POST(request: Request) {
  const fhirCarePlan = await request.json() as FHIRCarePlan;

  // Validate FHIR structure (basic)
  if (fhirCarePlan.resourceType !== 'CarePlan') {
    return Response.json({
      resourceType: "OperationOutcome",
      issue: [{
        severity: "error",
        code: "invalid",
        diagnostics: "resourceType must be 'CarePlan'"
      }]
    }, { status: 400 });
  }

  const dbCarePlan = fhirCarePlanToDB(fhirCarePlan);

  const { data, error } = await supabase
    .from('care_plans')
    .insert(dbCarePlan)
    .select()
    .single();

  if (error) {
    return Response.json({
      resourceType: "OperationOutcome",
      issue: [{
        severity: "error",
        code: "processing",
        diagnostics: error.message
      }]
    }, { status: 400 });
  }

  return Response.json(dbCarePlanToFHIR(data), {
    status: 201,
    headers: {
      'Content-Type': 'application/fhir+json',
      'Location': `/api/fhir/CarePlan/${data.id}`
    }
  });
}
```

**UI Wizard:**
```typescript
// components/features/care-plans/CarePlanWizard.tsx
const steps = [
  {
    title: 'Diagnoses selecteren',
    description: 'Welke aandoeningen worden behandeld?',
    component: ConditionSelector
  },
  {
    title: 'Doelen formuleren',
    description: 'Wat willen we bereiken? (SMART)',
    component: GoalsEditor
  },
  {
    title: 'Interventies plannen',
    description: 'Welke behandelactiviteiten?',
    component: ActivitiesEditor
  },
  {
    title: 'Review & Opslaan',
    description: 'Controleer en publiceer behandelplan',
    component: CarePlanReview
  }
];
```

**Acceptance:**
- ✅ `/api/fhir/CarePlan` GET/POST/PUT werkend
- ✅ FHIR JSON import/export werkt correct
- ✅ Wizard UI compleet doorloopbaar
- ✅ Goals embedded in JSONB (geen aparte tabel)
- ✅ Activities embedded in JSONB (geen aparte tabel)
- ✅ Koppeling naar diagnoses werkt
- ✅ **TEST:** Export CarePlan → Import in ander systeem (bijv. Postman/Insomnia)

---

### Epic 6 — Observations (ROM)
**Epic Doel:** ROM-metingen registreren met FHIR Observation resource.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E6.S1 | ROM instrument definitions | PHQ-9, GAD-7 definities in code | ⏳ | E5.S5 | 2 |
| E6.S2 | Observation FHIR transforms | DB ↔ FHIR functies | ⏳ | E6.S1 | 3 |
| E6.S3 | Observation API endpoints | GET/POST `/api/fhir/Observation` | ⏳ | E6.S2 | 3 |
| E6.S4 | ROM formulieren UI | PHQ-9, GAD-7 invullen + opslaan | ⏳ | E6.S3 | 5 |

**Technical Notes:**

**ROM Instrument Definitions:**
```typescript
// lib/rom/instruments.ts
export const romInstruments = {
  'PHQ-9': {
    code: '44249-1',  // LOINC code
    system: 'http://loinc.org',
    display: 'PHQ-9 (Patient Health Questionnaire)',
    category: 'survey',
    valueType: 'quantity',
    range: { min: 0, max: 27 },
    interpretation: {
      '0-4': 'Minimaal',
      '5-9': 'Licht',
      '10-14': 'Matig',
      '15-19': 'Matig-ernstig',
      '20-27': 'Ernstig'
    }
  },
  'GAD-7': {
    code: '69737-5',  // LOINC code
    system: 'http://loinc.org',
    display: 'GAD-7 (Generalized Anxiety Disorder)',
    category: 'survey',
    valueType: 'quantity',
    range: { min: 0, max: 21 },
    interpretation: {
      '0-4': 'Minimaal',
      '5-9': 'Licht',
      '10-14': 'Matig',
      '15-21': 'Ernstig'
    }
  }
};
```

**Observation FHIR Example:**
```json
{
  "resourceType": "Observation",
  "id": "obs-phq9-123",
  "status": "final",
  "category": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
      "code": "survey"
    }]
  }],
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "44249-1",
      "display": "PHQ-9 total score"
    }]
  },
  "subject": {
    "reference": "Patient/patient-456"
  },
  "encounter": {
    "reference": "Encounter/encounter-789"
  },
  "effectiveDateTime": "2024-01-15T10:30:00Z",
  "issued": "2024-01-15T10:35:00Z",
  "performer": [{
    "reference": "Practitioner/practitioner-1"
  }],
  "valueQuantity": {
    "value": 18,
    "unit": "score",
    "system": "http://unitsofmeasure.org",
    "code": "{score}"
  },
  "interpretation": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
      "code": "H",
      "display": "High"
    }],
    "text": "Matig-ernstige depressie"
  }]
}
```

**Acceptance:**
- ✅ `/api/fhir/Observation` GET/POST werkend
- ✅ PHQ-9 formulier werkt (9 vragen, totaalscore)
- ✅ GAD-7 formulier werkt (7 vragen, totaalscore)
- ✅ Timeline toont ROM-metingen per patient
- ✅ Interpretatie automatisch berekend (bijv. "Matig-ernstig")

---

### Epic 7 — API Polish & Demo
**Epic Doel:** API documentatie, testing en demo scenario voorbereiden.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E7.S1 | Swagger/OpenAPI docs | `/api/docs` met alle FHIR endpoints | ⏳ | E6.S4 | 5 |
| E7.S2 | FHIR validatie toevoegen | @hapi/fhir validator integreren | ⏳ | E7.S1 | 3 |
| E7.S3 | Import/Export testen | CarePlan export → import in andere tool | ⏳ | E7.S2 | 3 |
| E7.S4 | Demo scenario script | Volledige flow: patient → intake → plan → API | ⏳ | E7.S3 | 2 |

**Technical Notes:**

**Swagger Documentation:**
```typescript
// app/api/docs/route.ts
import { generateOpenAPISpec } from '@/lib/openapi';

export async function GET() {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'Mini-EPD FHIR API',
      version: '1.0.0',
      description: 'FHIR R4 compliant API voor GGZ data-uitwisseling'
    },
    servers: [{
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      description: 'Development server'
    }],
    paths: {
      '/api/fhir/Patient': {
        get: {
          summary: 'Search patients',
          tags: ['Patient'],
          responses: {
            '200': {
              description: 'FHIR Bundle met Patient resources',
              content: {
                'application/fhir+json': {
                  schema: { $ref: '#/components/schemas/PatientBundle' }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create patient',
          tags: ['Patient'],
          requestBody: {
            content: {
              'application/fhir+json': {
                schema: { $ref: '#/components/schemas/Patient' }
              }
            }
          },
          responses: {
            '201': { description: 'Patient created' }
          }
        }
      },
      '/api/fhir/CarePlan/{id}': {
        get: {
          summary: 'Get CarePlan by ID',
          tags: ['CarePlan'],
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }],
          responses: {
            '200': {
              description: 'FHIR CarePlan resource',
              content: {
                'application/fhir+json': {
                  schema: { $ref: '#/components/schemas/CarePlan' }
                }
              }
            }
          }
        }
      }
      // ... alle andere endpoints
    },
    components: {
      schemas: {
        Patient: { /* FHIR Patient schema */ },
        CarePlan: { /* FHIR CarePlan schema */ }
      }
    }
  };

  return Response.json(spec);
}
```

**Demo Scenario:**
```markdown
# Demo Scenario: Data Uitwisselbaarheid

## Stap 1: Patient aanmaken
1. Open UI: `/patients/new`
2. Vul in: Jan de Vries, 1980-05-15, man
3. Opslaan → Patient ID: `patient-123`

## Stap 2: Intake registreren
1. Open: `/patients/patient-123/encounters/new`
2. Type: Intakegesprek
3. Notitie toevoegen via intake_notes
4. Opslaan → Encounter ID: `encounter-456`

## Stap 3: Diagnose toevoegen
1. Open: `/patients/patient-123/conditions/new`
2. Zoek: F32.2 (Depressieve episode)
3. Ernst: Ernstig, Status: Active
4. Opslaan → Condition ID: `condition-789`

## Stap 4: ROM-meting
1. Open: `/patients/patient-123/observations/new`
2. Instrument: PHQ-9
3. Invullen → Score: 18
4. Opslaan → Observation ID: `obs-123`

## Stap 5: Behandelplan opstellen
1. Open: `/patients/patient-123/care-plans/new`
2. Wizard:
   - Diagnose: F32.2 selecteren
   - Doel: "PHQ-9 < 10 binnen 12 weken"
   - Interventie: "CGT 1x/week, 12 sessies"
3. Opslaan → CarePlan ID: `careplan-abc`

## Stap 6: API Export (DEMO!)
```bash
# Export CarePlan als FHIR JSON
curl http://localhost:3000/api/fhir/CarePlan/careplan-abc \
  -H "Accept: application/fhir+json" \
  > careplan-export.json

# Toon in Postman of browser
cat careplan-export.json | jq
```

## Stap 7: API Import (DEMO!)
```bash
# Edit careplan-export.json (verander status naar "on-hold")
# Import in nieuw systeem
curl -X POST http://andere-epd.com/api/fhir/CarePlan \
  -H "Content-Type: application/fhir+json" \
  -d @careplan-export.json

# → Success! Behandelplan geïmporteerd in ander EPD
```

**Result:** Data-uitwisselbaarheid aangetoond ✅
```

**Acceptance:**
- ✅ Swagger UI beschikbaar op `/api/docs`
- ✅ Alle FHIR endpoints gedocumenteerd
- ✅ FHIR validatie werkt (optional, strikte mode)
- ✅ Demo scenario compleet doorlopen zonder errors
- ✅ Export/Import test succesvol met externe tool

---

## 5. Kwaliteit & Testplan

### Test Types

| Test Type | Scope | Tools | Coverage Target |
|-----------|-------|-------|-----------------|
| Unit Tests | FHIR transforms, utilities | Vitest | 80%+ voor `/lib/fhir` |
| Integration Tests | API endpoints | Vitest + Supertest | 100% FHIR endpoints |
| FHIR Validation | FHIR JSON output | @hapi/fhir validator | All resources valid |
| Manual Testing | UI flows + API export/import | Manual checklist | 5 critical flows |
| Performance | API response times | Lighthouse, k6 | < 500ms p95 |

### FHIR Compliance Testing

**Validator Setup:**
```bash
npm install @hapi/fhir-validator
```

```typescript
// tests/fhir-validation.test.ts
import { Validator } from '@hapi/fhir-validator';

const validator = new Validator();

test('CarePlan output is valid FHIR R4', async () => {
  const carePlan = await fetch('/api/fhir/CarePlan/test-123')
    .then(r => r.json());

  const result = validator.validate(carePlan, {
    resourceType: 'CarePlan',
    version: 'R4'
  });

  expect(result.valid).toBe(true);
  expect(result.errors).toEqual([]);
});
```

### Manual Test Checklist

**FHIR API Tests:**
- [ ] GET `/api/fhir/Patient` returns Bundle
- [ ] GET `/api/fhir/Patient/[id]` returns single Patient
- [ ] POST `/api/fhir/Patient` creates new patient
- [ ] PUT `/api/fhir/Patient/[id]` updates patient
- [ ] GET `/api/fhir/CarePlan/[id]` returns valid FHIR JSON
- [ ] POST `/api/fhir/CarePlan` accepts FHIR JSON import
- [ ] All FHIR responses have `Content-Type: application/fhir+json`
- [ ] Invalid requests return FHIR OperationOutcome

**Data Uitwisselbaarheid:**
- [ ] Export CarePlan → Import in Postman succeeds
- [ ] Export Patient → Validate with online FHIR validator
- [ ] Import external FHIR CarePlan → Saves to database correctly
- [ ] Swagger docs accessible and accurate

**UI Tests:**
- [ ] Patient CRUD werkt zonder errors
- [ ] Encounter timeline toont chronologisch
- [ ] Condition toevoegen met DSM-5 autocomplete
- [ ] CarePlan wizard compleet doorloopbaar
- [ ] ROM formulier berekent totaalscore correct

---

## 6. Migratie & Deployment Plan

### Database Migratie (Van Simpel → FHIR)

**Fase 1: Schema Toevoegen (Non-destructive)**
```sql
-- Voeg FHIR tabellen toe (NIET vervangen)
-- Behoud: clients, intake_notes, treatment_plans, ai_events

-- Nieuwe tabellen:
CREATE TABLE practitioners (...);
CREATE TABLE organizations (...);
CREATE TABLE patients (...);  -- Naast clients
CREATE TABLE encounters (...);
CREATE TABLE conditions (...);
CREATE TABLE observations (...);
CREATE TABLE care_plans (...);  -- Naast treatment_plans
```

**Fase 2: Data Migratie**
```bash
# Run migratie script
pnpm run migrate:to-fhir

# Output:
✅ Migrated 3 clients → 3 patients
✅ Migrated 0 treatment_plans → 0 care_plans
✅ Created 1 default organization
✅ Created 2 demo practitioners
```

**Fase 3: Legacy Tabellen (Read-Only)**
```sql
-- RLS policies aanpassen: clients/treatment_plans read-only
CREATE POLICY "Legacy: Read only" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

-- Geen INSERT/UPDATE/DELETE policies
```

**Fase 4: UI Cutover**
```typescript
// Feature flag in code
const USE_FHIR_SCHEMA = process.env.NEXT_PUBLIC_USE_FHIR === 'true';

// Gradual rollout
if (USE_FHIR_SCHEMA) {
  // Gebruik patients tabel
  const patient = await supabase.from('patients').select('*');
} else {
  // Fallback naar clients tabel
  const client = await supabase.from('clients').select('*');
}
```

### Deployment Strategie

**Vercel Deployment:**
```bash
# Preview deployment (test)
vercel deploy --preview

# Production deployment
vercel deploy --prod
```

**Environment Variables (Vercel):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_USE_FHIR=true
NEXT_PUBLIC_API_URL=https://mini-epd.vercel.app
```

---

## 7. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| FHIR mapping errors | Hoog | Hoog | Unit tests voor alle transforms, FHIR validator | Developer |
| Data migratie data loss | Middel | Kritiek | Backup voor migratie, rollback script, test eerst op staging | Developer |
| API performance issues | Middel | Middel | Database indexes, query optimization, pagination | Developer |
| FHIR compliance gaps | Middel | Middel | Strikte validator tests, documenteer deviaties | Developer |
| Scope creep (extra features) | Hoog | Middel | Strikte MVP scope, "nice to have" backlog | PM |
| Browser compatibility | Laag | Laag | Test op Chrome/Firefox/Safari | Developer |
| Supabase rate limits | Laag | Middel | Monitor usage, optimize queries | DevOps |

**Kritieke Risico's:**

1. **FHIR Mapping Errors → Mitigatie:**
   - 80%+ test coverage op transform functies
   - FHIR validator in CI/CD pipeline
   - Manual testing met externe FHIR tools (Postman, Hapi validator)

2. **Data Migratie Data Loss → Mitigatie:**
   - VOLLEDIGE backup voor migratie starten
   - Rollback script ready (`scripts/rollback-migration.ts`)
   - Test migratie eerst op Supabase staging branch
   - Dry-run mode in migratie script

3. **API Performance → Mitigatie:**
   - Database indexes op foreign keys
   - Pagination op alle list endpoints (max 50 per page)
   - Query optimization met `explain analyze`

---

## 8. Demo & Presentatieplan

### Demo Scenario: "Data Uitwisselbaarheid in Actie"

**Duur:** 15 minuten
**Doelgroep:** Stakeholders, potentiële partners
**Doel:** Tonen dat data uitwisselbaar is via FHIR API

**Flow:**

**Deel 1: UI Demo (5 min)**
1. Inloggen als behandelaar
2. Nieuwe patient aanmaken (Jan de Vries)
3. Intake registreren met notities
4. Diagnose toevoegen (F32.2 - Depressie)
5. ROM-meting invullen (PHQ-9 score: 18)
6. Behandelplan opstellen via wizard

**Deel 2: API Export Demo (5 min)**
7. Open browser DevTools / Postman
8. `GET /api/fhir/CarePlan/{id}` → Toon FHIR JSON
9. Copy JSON naar clipboard
10. Paste in online FHIR Validator → Valid! ✅
11. Toon Swagger docs: `/api/docs`

**Deel 3: API Import Demo (5 min)**
12. Edit FHIR JSON (verander status naar "on-hold")
13. `POST /api/fhir/CarePlan` met gewijzigde JSON
14. Refresh UI → Behandelplan geïmporteerd! ✅
15. Conclusie: **Data is uitwisselbaar tussen systemen**

**Success Criteria:**
- Volledige flow zonder crashes
- FHIR JSON valideert correct
- Import/export werkt bidirectioneel
- Audience begrijpt data-uitwisselbaarheid

**Backup Plan:**
- Pre-recorded video van API calls
- Screenshots van alle stappen
- Lokale versie klaar bij internet issues

---

## 9. Evaluatie & Lessons Learned

**Na MVP completion (na Epic 7):**

### Technische Evaluatie

**FHIR Implementation:**
- Welke FHIR resources waren makkelijk/moeilijk?
- Welke pragmatische keuzes (embedded JSON) werkten goed?
- Welke deviaties van FHIR spec hebben we?
- Hoe goed valideren externe tools onze output?

**Database:**
- Hoe verliep de migratie?
- Prestatie van JSONB voor goals/activities?
- RLS policies effectief?
- Indexing strategie optimaal?

**API Design:**
- Zijn endpoints intuïtief?
- Prestatie acceptabel?
- Error handling duidelijk?
- Swagger docs compleet?

### Process Evaluatie

**Velocity:**
- Actual story points vs estimated
- Welke epics liepen uit?
- Waar onderschat/overschat?

**Development Workflow:**
- FHIR-first approach effectief?
- Hybrid schema strategie goed?
- Testing strategie adequaat?

**Blockers:**
- Waar liepen we vast?
- Technische schuld ontstaan?
- Dependencies issues?

### User Feedback

**Usability:**
- Is de API makkelijk te gebruiken?
- Zijn FHIR transforms correct?
- UI intuïtief genoeg?

**Features:**
- Wat ontbreekt er nog?
- Welke features overbodig?
- Wat moet gerefactored?

---

## 10. Referenties

### Mission Control Documents

**Project Documentation:**
- **Datamodel Documentatie** — `docs/datamodel-documentatie.md`
- **Volledig FHIR Schema** — `lib/supabase/20241121_fhir_ggz_schema.sql` (gebruiken we deels)
- **Bouwplan Template** — `docs/templates/bouwplan_template.md`
- **Origineel Bouwplan** — `docs/bouwplan-mini-epd.md` (volledig, 13 resources)

### FHIR & Healthcare Standards

**FHIR Specificaties:**
- FHIR R4 Specification: https://hl7.org/fhir/R4/
- FHIR Patient: https://hl7.org/fhir/R4/patient.html
- FHIR CarePlan: https://hl7.org/fhir/R4/careplan.html
- FHIR Condition: https://hl7.org/fhir/R4/condition.html
- FHIR Observation: https://hl7.org/fhir/R4/observation.html
- FHIR Encounter: https://hl7.org/fhir/R4/encounter.html

**Nederlandse Standaarden:**
- MedMIJ GGZ: https://informatiestandaarden.nictiz.nl/wiki/MedMij:V2020.01/OntwerpGGZ
- ZIBs: https://zibs.nl/
- FHIR Validator (online): https://validator.fhir.org/

**Tools:**
- HAPI FHIR Validator: https://hapifhir.io/hapi-fhir/docs/validation/introduction.html
- Postman FHIR Collection: https://www.postman.com/fhir

### Technical Stack

- Next.js 15: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- TypeScript: https://www.typescriptlang.org/docs/
- FHIR TypeScript Types: https://github.com/Asymmetrik/node-fhir-server-core

---

## 11. Glossary & Abbreviations

### FHIR Resources (Geïmplementeerd)

| Resource | Betekenis | API Endpoint |
|----------|-----------|--------------|
| Patient | Patiënt/cliënt | `/api/fhir/Patient` |
| Practitioner | Behandelaar | `/api/fhir/Practitioner` |
| Encounter | Contactmoment | `/api/fhir/Encounter` |
| Condition | Diagnose | `/api/fhir/Condition` |
| Observation | Meting (ROM) | `/api/fhir/Observation` |
| CarePlan | Behandelplan | `/api/fhir/CarePlan` |

### FHIR Resources (Niet Geïmplementeerd)

| Resource | Reden |
|----------|-------|
| MedicationStatement | Out of scope voor MVP |
| Consent | AVG niet 100% vereist |
| Flag | Safety features later |
| DocumentReference | Documenten later |
| Goal | Embedded in CarePlan (pragmatisch) |
| Activity | Embedded in CarePlan (pragmatisch) |

### Technical Terms

| Term | Betekenis |
|------|-----------|
| FHIR R4 | Fast Healthcare Interoperability Resources, versie 4 |
| MedMIJ | Nederlands afsprakenstelsel voor patiëntportalen |
| ZIB | ZorgInformatieBouwsteen (NL healthcare data standard) |
| DSM-5 | Diagnostic and Statistical Manual (psychiatrie) |
| ROM | Routine Outcome Monitoring (vragenlijsten) |
| RLS | Row Level Security (database access control) |
| BSN | Burgerservicenummer (NL social security number) |
| LOINC | Logical Observation Identifiers Names and Codes |
| ICD-10 | International Classification of Diseases |

---

## Appendix A: Story Point Estimatie

**Fibonacci Scale:**
- **1 punt:** < 2 uur (trivial)
- **2 punten:** 2-4 uur (simpel)
- **3 punten:** 4-8 uur (gemiddeld)
- **5 punten:** 1-2 dagen (complex)
- **8 punten:** 2-3 dagen (zeer complex)
- **13 punten:** 3-5 dagen (epic-sized, overweeg split)

**Velocity:**
- 1 developer, full-time: ~15 story points per week (pragmatisch MVP tempo)
- Total: ~117 story points
- Duration: **8 weken** @ 15 points/week

---

## Appendix B: FHIR Schema Vergelijking

**Volledig Schema (origineel bouwplan):**
- 13 FHIR resources
- Aparte tabellen voor goals, activities
- Consent management
- Flags & waarschuwingen
- Medicatie tracking
- Document management
- ~200 story points, 10-12 weken

**Pragmatisch Schema (dit bouwplan):**
- 6 FHIR resources (core)
- Goals/activities embedded in CarePlan JSONB
- Geen consents (later)
- Geen flags (later)
- Geen medicatie (later)
- Geen documents (later)
- ~117 story points, **8 weken**

**Verschil:**
- ⬇️ 54% minder resources
- ⬇️ 42% minder development tijd
- ✅ Data-uitwisselbaarheid behouden
- ✅ MedMIJ-compatible datastructuur
- ✅ Schaalbaar naar volledig schema later

---

## Appendix C: API Endpoints Overzicht

**Geïmplementeerde FHIR Endpoints:**

```
GET    /api/fhir/Patient              → Bundle(Patient[])
GET    /api/fhir/Patient/{id}         → Patient
POST   /api/fhir/Patient              → Patient (created)
PUT    /api/fhir/Patient/{id}         → Patient (updated)

GET    /api/fhir/Practitioner         → Bundle(Practitioner[])
GET    /api/fhir/Practitioner/{id}    → Practitioner
POST   /api/fhir/Practitioner         → Practitioner

GET    /api/fhir/Encounter            → Bundle(Encounter[])
GET    /api/fhir/Encounter/{id}       → Encounter
POST   /api/fhir/Encounter            → Encounter
PUT    /api/fhir/Encounter/{id}       → Encounter

GET    /api/fhir/Condition            → Bundle(Condition[])
GET    /api/fhir/Condition/{id}       → Condition
POST   /api/fhir/Condition            → Condition
PUT    /api/fhir/Condition/{id}       → Condition

GET    /api/fhir/Observation          → Bundle(Observation[])
GET    /api/fhir/Observation/{id}     → Observation
POST   /api/fhir/Observation          → Observation

GET    /api/fhir/CarePlan             → Bundle(CarePlan[])
GET    /api/fhir/CarePlan/{id}        → CarePlan 🎯
POST   /api/fhir/CarePlan             → CarePlan 🎯
PUT    /api/fhir/CarePlan/{id}        → CarePlan 🎯
```

**Swagger Documentation:**
```
GET    /api/docs                      → OpenAPI 3.0 spec
GET    /api/docs/ui                   → Swagger UI (interactive)
```

**Response Format:**
- Content-Type: `application/fhir+json`
- Header: `X-FHIR-Version: 4.0.1`
- Errors: FHIR OperationOutcome

---

**🎯 Dit pragmatische bouwplan is klaar voor implementatie!**

**Volgende stap:** Start Epic 1 (FHIR Core Schema & Migratie)

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v2.0 | 21 november 2024 | Colin Lit | Pragmatische FHIR versie - 6 core resources, 8 weken, data-uitwisselbaarheid focus |
| v1.0 | 21 november 2024 | Colin Lit | Originele versie - 13 FHIR resources, 10-12 weken |
