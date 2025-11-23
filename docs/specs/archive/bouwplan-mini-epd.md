# 🚀 Mission Control — Bouwplan Mini-EPD

💡 **Dit bouwplan beschrijft de implementatie van een FHIR-compliant Mini-EPD voor GGZ-instellingen.**
Het project volgt internationale standaarden (FHIR R4) en Nederlandse specificaties (MedMIJ, ZIBs) voor toekomstige interoperabiliteit.

---

**Projectnaam:** Mini-EPD Prototype
**Versie:** v1.0
**Datum:** 21 november 2024
**Auteur:** Colin Lit (ikbenlit.nl)

---

## 1. Doel en context

🎯 **Doel:**
Een werkend MVP bouwen van een Elektronisch Patiënten Dossier (EPD) voor GGZ-instellingen, volledig gebaseerd op FHIR R4 standaarden. Het systeem ondersteunt de complete workflow: intake → diagnostiek → behandelplan → monitoring.

📘 **Context:**
Het Mini-EPD is gebouwd met toekomstige integratie in gedachten:
- **MedMIJ**: Patiënten kunnen hun dossier raadplegen via PGO-apps
- **Koppeltaal**: Integratie met eHealth apps voor behandelactiviteiten
- **Landelijk Schakelpunt (LSP)**: Medicatie-uitwisseling met andere zorgverleners

Het datamodel bestaat uit **13 FHIR resources** die samen het complete GGZ-traject ondersteunen, van aanmelding tot behandelplan, inclusief doelen, toestemmingen en waarschuwingen.

**Referentie documenten:**
- `docs/datamodel-documentatie.md` - Volledige uitleg van het FHIR datamodel
- `docs/archive/schemas/20241121_fhir_ggz_schema.sql` - Database schema implementatie (archived)

---

## 2. Uitgangspunten

### 2.1 Technische Stack

**Frontend:**
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Lucide Icons
- **State Management:** React Context + Zustand (voor complexe state)
- **Forms:** React Hook Form + Zod validation
- **Datum/Tijd:** date-fns

**Backend:**
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (met RLS policies)
- **API:** Next.js API Routes + Supabase Client
- **Real-time:** Supabase Realtime (optioneel)

**Development & Deployment:**
- **Package Manager:** pnpm
- **TypeScript:** Strict mode enabled
- **Linting:** ESLint + Prettier
- **Version Control:** Git + GitHub
- **Hosting:** Vercel
- **Database Hosting:** Supabase Cloud

**Security:**
- Row Level Security (RLS) op alle tabellen
- BSN encryptie met pgcrypto
- HTTPS/TLS voor alle communicatie
- Environment variables voor secrets

### 2.2 Projectkaders

**Tijd:**
- **Fase 1 (MVP):** 6-8 weken development
- **Fase 2:** +4 weken voor uitbreidingen
- **Fase 3:** +6 weken voor integraties (MedMIJ/Koppeltaal)

**Team:**
- 1-2 Full-stack developers
- 1 GGZ-consultant (domeinkennis)
- 1 UX designer (parttime)

**Scope MVP (Fase 1):**
- Behandelaren kunnen inloggen
- Cliënten aanmaken en beheren
- Intake registreren (Encounters)
- Diagnoses vastleggen (DSM-5)
- Observaties/ROM-metingen toevoegen
- Behandelplannen opstellen met doelen
- Waarschuwingen/flags beheren
- Documenten genereren en opslaan

**Out of scope voor MVP:**
- AI-assistentie voor intake
- MedMIJ/Koppeltaal integratie
- Medicatie voorschrijven (alleen registreren)
- Facturatie/declaratie
- Agenda/afspraken systeem
- Multi-tenancy (meerdere instellingen)

**Data:**
- Fictieve demo-data voor development
- Productiedata pas na security audit
- Privacy by design: alle BSN versleuteld

### 2.3 Programmeer Uitgangspunten

**Code Quality Principles:**

- **DRY (Don't Repeat Yourself)**
  - Herbruikbare React componenten in `/components/shared`
  - Shared utilities in `/lib/utils`
  - Database queries in `/lib/db` helpers
  - Zod schemas hergebruiken voor forms en API validatie

- **KISS (Keep It Simple, Stupid)**
  - Start met Server Components (RSC) waar mogelijk
  - Client Components alleen waar interactiviteit nodig is
  - Directe Supabase queries boven complexe ORMs
  - Flat component structure (vermijd over-nesting)

- **SOC (Separation of Concerns)**
  - `/app` - Next.js routing en pages
  - `/components` - React componenten (split: `/ui`, `/features`, `/shared`)
  - `/lib` - Business logic, utilities, database helpers
  - `/types` - TypeScript types en interfaces
  - `/styles` - Globale styles (Tailwind in components)

- **YAGNI (You Aren't Gonna Need It)**
  - Bouw alleen FHIR resources die nodig zijn voor MVP
  - Geen premature optimalisatie (caching, CDN, etc.)
  - Start zonder real-time features (toevoegen als nodig)

**Development Practices:**

- **Code Organization**
  ```
  /app
    /(auth)          # Auth routes (login, signup)
    /(dashboard)     # Protected routes
      /clients       # Cliënt overzicht
      /clients/[id]  # Cliënt detail
    /api             # API routes
  /components
    /ui              # shadcn/ui components
    /features        # Feature-specific components
    /shared          # Shared components
  /lib
    /db              # Supabase helpers
    /validations     # Zod schemas
    /utils           # Utilities
  /types             # TypeScript definitions
  ```

- **Error Handling**
  - Try-catch op alle async database calls
  - Toast notifications voor user feedback
  - Error boundaries voor React component crashes
  - Structured logging naar console (development) en monitoring (production)

- **Security**
  - Alle Supabase queries via RLS policies
  - Input sanitization met Zod schemas
  - BSN encryption via database function
  - No sensitive data in client-side code
  - CORS properly configured
  - Rate limiting op API routes

- **Performance**
  - Server Components by default
  - Dynamic imports voor zware componenten
  - Optimize images met next/image
  - Database indexes op frequently queried fields
  - Pagination voor lijsten (100 items max per page)

- **Testing**
  - Unit tests: `/lib` utilities en helpers
  - Integration tests: API routes
  - E2E tests: Kritieke flows (Playwright)
  - Manual testing checklist voor demo

- **Documentation**
  - README met setup instructies
  - JSDoc voor public functions
  - Inline comments voor FHIR-specifieke logica
  - Database schema comments (al aanwezig in SQL)

**TypeScript Conventions:**
```typescript
// ✅ FHIR-compliant type naming
type FHIRPatient = {
  id: string;
  identifier_bsn: string;
  name_family: string;
  name_given: string[];
  birth_date: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  // ...
};

// ✅ Database helper pattern
export async function getPatientById(id: string): Promise<FHIRPatient | null> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(`Failed to fetch patient: ${error.message}`);
  return data;
}

// ✅ Form validation with Zod
const patientSchema = z.object({
  identifier_bsn: z.string().length(9, 'BSN must be 9 digits'),
  name_family: z.string().min(1, 'Achternaam is verplicht'),
  name_given: z.array(z.string()).min(1, 'Voornaam is verplicht'),
  birth_date: z.string().date(),
  gender: z.enum(['male', 'female', 'other', 'unknown']),
});
```

---

## 3. Epics & Stories Overzicht

🎯 **Overzicht van alle development fases**

| Epic ID | Titel | Doel | Status | Stories | Story Points | Opmerkingen |
|---------|-------|------|--------|---------|--------------|-------------|
| E0 | Setup & Configuratie | Repo, Next.js, Supabase, TypeScript | ⏳ To Do | 5 | 10 | Foundation |
| E1 | Database Migratie | Schema toepassen, seed data, RLS testen | ⏳ To Do | 4 | 13 | FHIR schema |
| E2 | Auth & Practitioners | Login, behandelaar profiel, session management | ⏳ To Do | 4 | 13 | Supabase Auth |
| E3 | Patients & Organizations | Cliënt CRUD, instelling setup | ⏳ To Do | 3 | 13 | Basis entities |
| E4 | Encounters & Intake | Contactmoment registratie, intake workflow | ⏳ To Do | 4 | 21 | Core workflow |
| E5 | Conditions & Diagnostiek | DSM-5 diagnoses, severity, verification | ⏳ To Do | 3 | 13 | Clinical data |
| E6 | Observations & Metingen | ROM-scores, risico's, vitale functies | ⏳ To Do | 4 | 21 | Metingen |
| E7 | Medications | Medicatie registratie, dosering, status | ⏳ To Do | 3 | 8 | Med tracking |
| E8 | Care Plans & Goals | Behandelplan, doelen, activiteiten | ⏳ To Do | 4 | 21 | Planning |
| E9 | Consents & Flags | Toestemmingen, waarschuwingen, AVG | ⏳ To Do | 4 | 13 | Compliance |
| E10 | Documents | Verslagen, brieven, PDF generatie | ⏳ To Do | 3 | 13 | Documenten |
| E11 | Dashboard & UX | Overview, navigatie, search, filters | ⏳ To Do | 5 | 21 | Interface |
| E12 | Testing & QA | Unit tests, E2E, security audit | ⏳ To Do | 4 | 13 | Quality |
| E13 | Deployment & Docs | Production deploy, gebruikersdocs | ⏳ To Do | 3 | 8 | Launch |

**Totaal:** 53 stories, ~200 story points (~8-10 weken @ 20-25 points/week)

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 — Setup & Configuratie
**Epic Doel:** Werkende development omgeving met Next.js, Supabase en alle tooling.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E0.S1 | Repository aanmaken | GitHub repo + lokale clone, `.gitignore`, README | ⏳ | — | 1 |
| E0.S2 | Next.js 15 project setup | `npx create-next-app`, TypeScript, App Router | ⏳ | E0.S1 | 2 |
| E0.S3 | Tailwind + shadcn/ui installeren | Tailwind config, shadcn init, theme setup | ⏳ | E0.S2 | 2 |
| E0.S4 | Supabase project aanmaken | Supabase project, connection string, env vars | ⏳ | E0.S2 | 3 |
| E0.S5 | Development tooling | ESLint, Prettier, Husky (pre-commit), VS Code config | ⏳ | E0.S3 | 2 |

**Technical Notes:**
- Next.js 15 met App Router (geen Pages Router)
- pnpm als package manager voor monorepo-ready setup
- `.env.local` template: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- ESLint config: `next/core-web-vitals` + custom rules voor FHIR naming

**Acceptance:**
- `pnpm dev` start development server
- Tailwind werkt, shadcn componenten importeerbaar
- Supabase client connecteert zonder errors

---

### Epic 1 — Database Migratie
**Epic Doel:** FHIR schema toegepast, RLS werkend, seed data aanwezig.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E1.S1 | SQL schema toepassen | `20241121_fhir_ggz_schema.sql` uitvoeren in Supabase | ⏳ | E0.S4 | 3 |
| E1.S2 | TypeScript types genereren | `supabase gen types` → `/types/supabase.ts` | ⏳ | E1.S1 | 2 |
| E1.S3 | RLS policies testen | Verify auth users can only see own data | ⏳ | E1.S1 | 5 |
| E1.S4 | Seed data script | Demo practitioner, organization, 3 patients | ⏳ | E1.S2 | 3 |

**Technical Notes:**
- Migratie via Supabase Dashboard SQL Editor of CLI
- Verify ENUMs: `gender_type`, `encounter_status`, `condition_clinical_status`, etc.
- Test RLS: Create test user, verify row-level filtering works
- Seed script: `/lib/db/seed.ts` met faker.js voor realistische data

**Acceptance:**
- Alle 13 tabellen aanwezig met indexes
- RLS enabled op alle tabellen
- Seed data zichtbaar voor test user

**FHIR Resources Coverage:**
- ✅ Practitioners
- ✅ Organizations
- ✅ Patients
- ✅ Encounters
- ✅ Conditions
- ✅ Observations
- ✅ MedicationStatements
- ✅ CarePlans + Activities
- ✅ Goals
- ✅ Consents
- ✅ Flags
- ✅ DocumentReferences

---

### Epic 2 — Auth & Practitioners
**Epic Doel:** Behandelaren kunnen inloggen en hun profiel beheren.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E2.S1 | Supabase Auth setup | Email/password login, session management | ⏳ | E1.S1 | 3 |
| E2.S2 | Login/signup flows | `/login`, `/signup` pages met forms | ⏳ | E2.S1 | 5 |
| E2.S3 | Practitioner profiel koppelen | Auto-create practitioner record on signup | ⏳ | E2.S2 | 3 |
| E2.S4 | Profiel pagina | View/edit: naam, BIG-nummer, kwalificaties | ⏳ | E2.S3 | 2 |

**Technical Notes:**
- Supabase Auth met email magic links of password
- Database trigger: On `auth.users` insert → create `practitioners` record
- Middleware voor protected routes: `/app/(dashboard)` layout
- Session stored in cookies (httpOnly, secure)

**Acceptance:**
- User kan signup → email verify → login
- Practitioner record automatisch aangemaakt
- Protected routes redirecten naar login als unauthenticated
- Profiel edits saven naar database

**Data Model:**
```typescript
// practitioners table
{
  id: UUID (PK)
  user_id: UUID (FK → auth.users)
  identifier_big: string (BIG-nummer)
  identifier_agb: string
  name_given: string[]
  name_family: string
  qualification: string[] // ["GZ-psycholoog"]
  telecom_email: string
  active: boolean
}
```

---

### Epic 3 — Patients & Organizations
**Epic Doel:** Cliënten CRUD operaties en organisatie management.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E3.S1 | Organization seed | Default organization voor development | ⏳ | E1.S4 | 2 |
| E3.S2 | Patients lijst pagina | `/clients` met tabel, search, filters | ⏳ | E2.S4 | 5 |
| E3.S3 | Patient CRUD | Create/Update/Delete patient + validatie | ⏳ | E3.S2 | 6 |

**Technical Notes:**
- Organizations: Minimaal 1 nodig voor MVP (later multi-tenant)
- Patients lijst: Paginatie (50 per page), search op naam/BSN
- BSN validatie: 11-proef check + encryptie via pgcrypto
- Patient form: Multi-step wizard (Personal → Address → Insurance → Emergency)

**Acceptance:**
- Default organization in seed data
- Lijst toont alle patients met search/filter
- Nieuwe patient toevoegen werkt met volledige validatie
- BSN opgeslagen encrypted (niet leesbaar in database)

**Patient Form Fields:**
```
Stap 1: Persoonlijke gegevens
- BSN (verplicht, 9 cijfers, 11-proef)
- Achternaam, voorvoegsel, voornamen
- Geboortedatum, geslacht

Stap 2: Contactgegevens
- Adres (straat, huisnummer, postcode, plaats)
- Telefoon, email

Stap 3: Verzekering
- Zorgverzekeraar
- Polisnummer
- Huisarts (naam + AGB-code)

Stap 4: Noodcontact
- Naam contactpersoon
- Relatie
- Telefoonnummer
```

---

### Epic 4 — Encounters & Intake
**Epic Doel:** Registratie van contactmomenten en intake workflow.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E4.S1 | Encounter tijdlijn | `/clients/[id]` toont encounters chronologisch | ⏳ | E3.S3 | 5 |
| E4.S2 | Nieuw encounter formulier | Create encounter: type, datum, reden | ⏳ | E4.S1 | 5 |
| E4.S3 | Intake workflow | Guided form: anamnese, klachten, context | ⏳ | E4.S2 | 8 |
| E4.S4 | Encounter detail pagina | View/edit encounter + gekoppelde data | ⏳ | E4.S3 | 3 |

**Technical Notes:**
- Encounter types: `intake`, `diagnostiek`, `behandeling`, `follow-up`, `crisis`
- Status flow: `planned` → `in-progress` → `completed`
- Intake form: Vrije tekst velden + gestructureerde data
- Linking: Encounter → Conditions/Observations/Documents

**Acceptance:**
- Timeline toont encounters met status badges
- Nieuw encounter aanmaken met datum/tijd picker
- Intake form volledig invulbaar en opslaanbaar
- Detail pagina toont alle gekoppelde resources

**Encounter Data Model:**
```typescript
{
  id: UUID
  status: 'planned' | 'in-progress' | 'completed' | ...
  class_code: 'AMB' | 'IMP' | 'EMER'
  type_code: 'intake' | 'diagnostiek' | 'behandeling'
  patient_id: UUID (FK)
  practitioner_id: UUID (FK)
  period_start: DateTime
  period_end?: DateTime
  reason_display: string[]
  notes: string (Markdown)
}
```

---

### Epic 5 — Conditions & Diagnostiek
**Epic Doel:** DSM-5 diagnoses vastleggen met status en ernst.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E5.S1 | DSM-5 codes database | Seed DSM-5 codes (top 50 GGZ diagnoses) | ⏳ | E1.S4 | 3 |
| E5.S2 | Diagnose toevoegen | Form: select DSM-5, severity, status | ⏳ | E4.S4, E5.S1 | 5 |
| E5.S3 | Problemlijst pagina | `/clients/[id]/conditions` - active diagnoses | ⏳ | E5.S2 | 5 |

**Technical Notes:**
- DSM-5 codes: Aparte lookup tabel of JSON import
- ICD-10 mapping voor facturatie (later)
- Clinical status: `active`, `remission`, `resolved`
- Verification: `provisional`, `confirmed`
- Link diagnose aan encounter (wanneer gesteld)

**Acceptance:**
- Behandelaar kan diagnose selecteren uit DSM-5 lijst
- Ernst vastleggen: mild, moderate, severe
- Status updaten: active → remission → resolved
- Problemlijst toont alleen active/relapse conditions

**DSM-5 Voorbeelden:**
```
F32.2 - Depressieve episode, ernstig
F41.1 - Gegeneraliseerde angststoornis
F60.3 - Emotioneel instabiele persoonlijkheidsstoornis
F84.0 - Autismespectrumstoornis
F20.0 - Schizofrenie
```

---

### Epic 6 — Observations & Metingen
**Epic Doel:** ROM-metingen, risico-inschattingen en observaties registreren.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E6.S1 | Observation types definiëren | ROM codes, risk types, vitals | ⏳ | E1.S4 | 3 |
| E6.S2 | ROM-meting toevoegen | PHQ-9, GAD-7, OQ-45 met score | ⏳ | E4.S4, E6.S1 | 5 |
| E6.S3 | Risico-inschatting | Suïcidaliteit, agressie, verwaarlozing | ⏳ | E6.S2 | 5 |
| E6.S4 | Observaties tijdlijn | Grafiek met ROM-scores over tijd | ⏳ | E6.S3 | 8 |

**Technical Notes:**
- Observation categories: `survey` (ROM), `social-history`, `exam`, `vital-signs`
- Value types: `quantity` (numeric), `string`, `boolean`, `codeableConcept`
- Interpretation: `H` (high), `L` (low), `N` (normal)
- Charting: Recharts of Chart.js voor trend visualisatie

**Acceptance:**
- Behandelaar kan ROM-vragenlijst invullen met scores
- Risico-inschatting opslaan met severity (low/medium/high)
- Timeline toont metingen chronologisch
- Grafiek toont PHQ-9 trend over tijd

**ROM Vragenlijsten:**
```typescript
const romInstruments = [
  {
    code: 'PHQ-9',
    display: 'Patient Health Questionnaire-9',
    category: 'survey',
    range: { min: 0, max: 27 },
    interpretation: {
      '0-4': 'Minimaal',
      '5-9': 'Licht',
      '10-14': 'Matig',
      '15-19': 'Matig-ernstig',
      '20-27': 'Ernstig'
    }
  },
  {
    code: 'GAD-7',
    display: 'Generalized Anxiety Disorder-7',
    category: 'survey',
    range: { min: 0, max: 21 },
    // ...
  }
];
```

---

### Epic 7 — Medications
**Epic Doel:** Medicatie gebruik registreren (geen voorschrijf-functionaliteit).

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E7.S1 | ATC codes database | Seed veelgebruikte GGZ medicatie | ⏳ | E1.S4 | 2 |
| E7.S2 | Medicatie toevoegen | Form: naam, dosering, status, reden | ⏳ | E4.S4, E7.S1 | 3 |
| E7.S3 | Medicatielijst | `/clients/[id]/medications` - active meds | ⏳ | E7.S2 | 3 |

**Technical Notes:**
- MedicationStatement (niet MedicationRequest - geen voorschrijven)
- ATC codes: WHO classificatie (https://www.whocc.no/atc/)
- Status: `active`, `completed`, `stopped`
- Dosage: Vrije tekst + gestructureerde fields

**Acceptance:**
- Medicatie toevoegen uit lijst of vrije tekst
- Dosering vastleggen (bijv. "50mg 1x daags")
- Lijst toont alleen active medications
- Stop-reden registreren bij status change

**Veelgebruikte GGZ Medicatie:**
```
N06AB06 - Sertraline (SSRI)
N06AB04 - Citalopram (SSRI)
N06AX16 - Venlafaxine (SNRI)
N05BA01 - Diazepam (Benzodiazepine)
N06AA09 - Amitriptyline (TCA)
N05AH03 - Olanzapine (Antipsychoticum)
```

---

### Epic 8 — Care Plans & Goals
**Epic Doel:** Behandelplannen opstellen met doelen en activiteiten.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E8.S1 | CarePlan wizard | Multi-step: diagnoses selecteren, doelen opstellen | ⏳ | E5.S3 | 8 |
| E8.S2 | Goals (doelen) beheren | SMART-doelen met target metrics | ⏳ | E8.S1 | 5 |
| E8.S3 | Activities toevoegen | Behandelactiviteiten: CGT, ROM, opdrachten | ⏳ | E8.S1 | 5 |
| E8.S4 | CarePlan overzicht | Dashboard met status, voortgang, timeline | ⏳ | E8.S3 | 3 |

**Technical Notes:**
- CarePlan addresses multiple Conditions
- Goals linked to CarePlan with target dates
- Activities: status flow `not-started` → `in-progress` → `completed`
- Koppeltaal-ready: Activities kunnen externe app referenties bevatten

**Acceptance:**
- Wizard leidt door behandelplan opstellen
- Doelen formuleren met meetbare criteria (SMART)
- Activiteiten toevoegen met frequentie en verantwoordelijke
- Overzicht toont voortgang per doel

**CarePlan Voorbeeld:**
```yaml
Titel: "Behandelplan Depressie"
Status: active
Periode: 2024-01-01 → 2024-06-30
Diagnoses: [F32.2 - Depressie ernstig]

Doelen:
  1. PHQ-9 score < 10 binnen 12 weken
  2. Herstel dagelijks functioneren (werk/sociaal)
  3. Medicatie-compliance > 90%

Activiteiten:
  - Individuele CGT: 1x/week, 12 sessies
  - ROM-meting PHQ-9: Elke 4 weken
  - Medicatie: Sertraline 50mg dagelijks
  - Huiswerk: Dagboek bijhouden
```

---

### Epic 9 — Consents & Flags
**Epic Doel:** Toestemmingen (AVG) en waarschuwingen beheren.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E9.S1 | Consent types definiëren | Treatment, privacy, advance directive | ⏳ | E1.S4 | 2 |
| E9.S2 | Consent registreren | Form: type, scope, geldigheid, documenten | ⏳ | E3.S3, E9.S1 | 5 |
| E9.S3 | Flags (waarschuwingen) | Create: safety, clinical, behavioral alerts | ⏳ | E4.S4, E5.S3 | 3 |
| E9.S4 | Alert banner in dossier | Rood banner bovenaan bij high-priority flags | ⏳ | E9.S3 | 3 |

**Technical Notes:**
- Consent scopes: `patient-privacy`, `treatment`, `advance-directive`, `research`
- Flags categories: `safety`, `clinical`, `behavioral`, `administrative`
- Priority: `high`, `medium`, `low`
- Flags visible on ALL patient views (banner)

**Acceptance:**
- Toestemming registreren met status active/inactive
- Wilsverklaring uploaden als PDF attachment
- Waarschuwing aanmaken met prioriteit
- High-priority flags tonen rode banner

**Flag Voorbeelden:**
```typescript
const flagExamples = [
  {
    category: 'safety',
    code: 'suicide-risk',
    display: 'HOOG SUÏCIDERISICO - Concrete plannen',
    priority: 'high',
    description: 'Middelen aanwezig, geen steun systeem'
  },
  {
    category: 'behavioral',
    code: 'aggression',
    display: 'Agressie naar vrouwelijke hulpverleners',
    priority: 'medium',
    description: 'Alleen mannelijke behandelaar inzetten'
  },
  {
    category: 'clinical',
    code: 'allergy',
    display: 'Allergie: Penicilline (anafylaxie)',
    priority: 'high'
  }
];
```

---

### Epic 10 — Documents
**Epic Doel:** Documenten genereren, opslaan en beheren.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E10.S1 | Document types | intake-verslag, behandelplan, brief, rapport | ⏳ | E1.S4 | 2 |
| E10.S2 | Markdown editor | Rich text editor voor verslagen (TipTap/Lexical) | ⏳ | E4.S4 | 5 |
| E10.S3 | Document genereren | Auto-generate uit encounter/careplan data | ⏳ | E8.S4, E10.S2 | 6 |

**Technical Notes:**
- Content stored as Markdown in `content_attachment_data`
- Document status: `current`, `superseded`, `entered-in-error`
- Templates voor: intake verslag, behandelplan, brief huisarts
- PDF export via React-PDF of Puppeteer (server-side)

**Acceptance:**
- Markdown editor werkt met formatting
- Template selecteren en invullen
- Auto-fill data uit intake/encounter
- PDF export downloaden

**Document Templates:**
```markdown
# Intakeverslag

**Cliënt:** {{patient.name}}
**BSN:** {{patient.bsn}}
**Datum intake:** {{encounter.date}}
**Behandelaar:** {{practitioner.name}}

## Aanmeldingsreden
{{encounter.reason_display}}

## Klachten
{{encounter.notes}}

## Diagnose(s)
{{#conditions}}
- {{code_display}} ({{clinical_status}})
{{/conditions}}

## Behandelvoorstel
{{careplan.description}}
```

---

### Epic 11 — Dashboard & UX
**Epic Doel:** Overzichtelijke interface met navigatie en search.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E11.S1 | Layout component | Sidebar nav, topbar, breadcrumbs | ⏳ | E2.S4 | 5 |
| E11.S2 | Dashboard homepage | Recent clients, stats, quick actions | ⏳ | E3.S2, E11.S1 | 5 |
| E11.S3 | Global search | Cmd+K: zoeken op cliënt, diagnose, document | ⏳ | E3.S3, E5.S3 | 8 |
| E11.S4 | Client detail tabs | Overview, Encounters, Conditions, Plans, Docs | ⏳ | E4.S4, E8.S4 | 3 |
| E11.S5 | Mobile responsive | Responsive design voor tablet/mobile | ⏳ | E11.S4 | 5 |

**Technical Notes:**
- Sidebar: Collapsible met icon-only mode
- Search: Algolia-style met keyboard shortcuts (Cmd+K)
- Tabs: URL-based routing (`/clients/[id]?tab=conditions`)
- Mobile: Bottom navigation bar voor primary actions

**Acceptance:**
- Layout rendering op alle schermformaten
- Dashboard toont key metrics en recent activity
- Search werkt binnen 500ms, toont relevante results
- Tabs navigation werkt met browser back/forward
- Mobile view usable op iPhone/Android

**Dashboard Widgets:**
```typescript
const dashboardWidgets = [
  {
    title: 'Actieve Cliënten',
    value: 42,
    trend: '+3 deze week'
  },
  {
    title: 'Geplande Afspraken',
    value: 8,
    subtitle: 'Vandaag'
  },
  {
    title: 'Open Behandelplannen',
    value: 15,
    action: 'Bekijk alle'
  }
];
```

---

### Epic 12 — Testing & QA
**Epic Doel:** Getest en stabiel systeem klaar voor gebruik.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E12.S1 | Unit tests schrijven | `/lib` utilities en validators > 80% coverage | ⏳ | All epics | 5 |
| E12.S2 | Integration tests | API routes, database operations | ⏳ | All epics | 5 |
| E12.S3 | E2E tests (Playwright) | Happy flows: login → client → intake → plan | ⏳ | E11.S5 | 8 |
| E12.S4 | Security audit | RLS policies, input validation, XSS/injection | ⏳ | E12.S3 | 5 |

**Technical Notes:**
- Unit tests: Vitest + Testing Library
- Integration tests: Supabase test instance
- E2E: Playwright met test database
- Security: OWASP Top 10 checklist

**Acceptance:**
- 80%+ unit test coverage
- Alle API routes getest
- 3 happy flows + 2 error scenarios in E2E
- Security audit passed (geen critical findings)

**Test Scenarios:**
```yaml
Happy Flows:
  1. Login → Dashboard → Nieuwe cliënt aanmaken
  2. Client selecteren → Intake registreren → Diagnose toevoegen
  3. Behandelplan opstellen → Doelen definiëren → Opslaan

Error Scenarios:
  1. Invalid BSN → Error message shown
  2. Duplicate patient → Conflict warning
```

---

### Epic 13 — Deployment & Docs
**Epic Doel:** Live productie omgeving + gebruikersdocumentatie.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E13.S1 | Vercel deployment | Production build, env vars, custom domain | ⏳ | E12.S4 | 3 |
| E13.S2 | Supabase productie | Production database, backups, monitoring | ⏳ | E12.S4 | 3 |
| E13.S3 | Gebruikersdocumentatie | Handleiding voor behandelaren (screenshots) | ⏳ | E11.S5 | 2 |

**Technical Notes:**
- Vercel: EU region (Amsterdam)
- Supabase: Pro plan met daily backups
- Monitoring: Sentry for errors, Vercel Analytics
- Docs: Markdown in `/docs/user-guide/`

**Acceptance:**
- App live op custom domain
- Database backups automatisch
- Gebruikershandleiding compleet
- Monitoring dashboards configured

---

## 5. Kwaliteit & Testplan

### Test Types

| Test Type | Scope | Tools | Verantwoordelijke | Coverage Target |
|-----------|-------|-------|-------------------|-----------------|
| Unit Tests | `/lib` utilities, validators, helpers | Vitest + Testing Library | Developer | 80%+ |
| Integration Tests | API routes, Supabase queries | Vitest + Supabase Test | Developer | 100% API routes |
| E2E Tests | User flows: login → intake → plan | Playwright | QA / Developer | 5 critical flows |
| Performance Tests | Page load times, query speed | Lighthouse, React Profiler | Developer | LCP < 2.5s |
| Security Tests | RLS, input validation, auth | Manual + OWASP checklist | Security Lead | 0 critical issues |
| Accessibility Tests | WCAG 2.1 AA compliance | axe DevTools, Lighthouse | Developer | 0 violations |

### Test Coverage Targets

**Unit Tests (80%+ coverage):**
- `/lib/validations/*` - Zod schemas
- `/lib/utils/*` - Helper functions
- `/lib/db/*` - Database query builders

**Integration Tests (100% API routes):**
- `/app/api/patients/*` - CRUD operations
- `/app/api/encounters/*` - Encounter management
- `/app/api/conditions/*` - Diagnose operations
- `/app/api/careplans/*` - Treatment planning

**E2E Tests (Critical Flows):**
1. **Authentication Flow**
   - Sign up → Email verify → Login → Dashboard
2. **Patient Management**
   - Create patient → Edit → Search → View details
3. **Clinical Workflow**
   - Select patient → New encounter → Add diagnosis → Save
4. **Treatment Planning**
   - Create care plan → Add goals → Add activities → Publish
5. **Document Generation**
   - Select encounter → Generate report → Export PDF

### Manual Test Checklist (Pre-Release)

**Functionality:**
- [ ] User kan inloggen met email/password
- [ ] Nieuwe cliënt aanmaken werkt (inclusief BSN validatie)
- [ ] Intake formulier opslaan zonder data loss
- [ ] Diagnose toevoegen uit DSM-5 lijst
- [ ] ROM-meting (PHQ-9) invullen en opslaan
- [ ] Behandelplan wizard doorlopen
- [ ] Waarschuwing toont rode banner
- [ ] Document genereren en PDF downloaden
- [ ] Navigatie werkt zonder JavaScript errors
- [ ] Logout werkt en cleared session

**Performance:**
- [ ] Homepage load < 2.5s (LCP)
- [ ] Client lijst pagina < 1s render tijd
- [ ] Search results binnen 500ms
- [ ] Database queries < 100ms (p95)

**Security:**
- [ ] RLS policies: Users see only own patients
- [ ] BSN encrypted in database
- [ ] No sensitive data in browser console
- [ ] Session expires after 1 hour inactivity
- [ ] XSS prevention: User input sanitized

**UX/UI:**
- [ ] Mobile view responsive (iPhone 12, Pixel 5)
- [ ] Tablet view usable (iPad)
- [ ] Dark mode consistent (if implemented)
- [ ] Forms show validation errors inline
- [ ] Success/error toasts display correctly
- [ ] Keyboard navigation works (Tab, Enter, Esc)

**Browser Compatibility:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## 6. Demo & Presentatieplan

**Geen externe demo gepland voor MVP - intern gebruikerstest.**

### Internal Testing Scenario

**Duur:** 30 minuten
**Doelgroep:** Interne stakeholders + 2 GGZ-behandelaren (testgebruikers)
**Locatie:** Staging environment (Vercel preview)

**Test Flow:**
1. **Setup** (5 min)
   - Test accounts aanmaken
   - Demo-data seeden
   - Systeem walkthrough

2. **Basis Workflow** (10 min)
   - Login als behandelaar
   - Dashboard verkennen
   - Nieuwe cliënt aanmaken (fictief)
   - Intake registreren

3. **Klinische Data** (10 min)
   - Diagnose toevoegen (DSM-5)
   - ROM-meting invullen
   - Risico-inschatting
   - Behandelplan opstellen

4. **Review & Feedback** (5 min)
   - Wat werkt goed?
   - Wat ontbreekt?
   - Usability issues?
   - Feature requests

**Success Criteria:**
- Alle test flows compleet zonder crashes
- Behandelaren kunnen workflow volgen zonder uitleg
- Data wordt correct opgeslagen
- Geen kritieke bugs gevonden

**Backup Plan:**
- Lokale versie klaar bij hosting issues
- Screenshots voor elk scherm
- Pre-recorded video demo

---

## 7. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| FHIR complexity onderschat | Hoog | Hoog | Start simpel, itereer, gebruik FHIR profielen only where needed | Tech Lead |
| Database schema wijzigingen | Middel | Hoog | Gebruik Supabase migrations, version control alle schema changes | Developer |
| RLS policies te complex | Middel | Hoog | Start met brede policies voor MVP, verfijn later, test exhaustively | Developer |
| BSN encryptie performance | Laag | Middel | Index op encrypted field, benchmark queries, cache waar mogelijk | Developer |
| Type generation sync issues | Middel | Middel | Automate `supabase gen types` in CI/CD, git hooks | DevOps |
| Scope creep (extra features) | Hoog | Middel | Strict MVP scope, feature freeze 2 weken voor launch | PM |
| Security vulnerability (RLS bypass) | Laag | Kritiek | Security audit, penetration testing, bug bounty | Security |
| Third-party dependencies vulnerabilities | Middel | Hoog | Dependabot alerts, regular updates, minimize dependencies | Developer |
| Supabase rate limits | Laag | Middel | Monitor usage, optimize queries, upgrade plan if needed | DevOps |
| GDPR compliance issues | Middel | Kritiek | Legal review, data privacy impact assessment, clear consent flows | Legal/PM |
| User adoption resistance | Middel | Hoog | Involve end-users early, training sessions, gradual rollout | PM |

**Kritieke Risico's (Actie Vereist):**

1. **FHIR Complexity → Mitigatie:**
   - Gebruik alleen FHIR resources die echt nodig zijn
   - Don't implement full FHIR API in MVP (alleen data model)
   - Documentatie: `datamodel-documentatie.md` als referentie

2. **GDPR Compliance → Mitigatie:**
   - BSN encryption (already in schema)
   - Consent management (Epic 9)
   - Data retention policy definiëren
   - Privacy by design in alle features

3. **Security (RLS bypass) → Mitigatie:**
   - Epic 12.S4: Dedicated security audit
   - Test met multiple user accounts
   - Verify policies in Supabase dashboard
   - Logging van alle data access

---

## 8. Evaluatie & Lessons Learned

**Te documenteren na MVP launch (na Epic 13):**

### Retrospective Vragen

**Wat ging goed?**
- Welke development practices werkten?
- Welke tooling was meest effectief?
- Welke FHIR resources waren eenvoudig te implementeren?

**Wat kan beter?**
- Waar liepen we vertraging op?
- Welke technische schuld hebben we opgebouwd?
- Welke features waren overcomplicated?

**Technische Learnings:**
- FHIR implementation patterns die werkten
- Supabase best practices
- Next.js App Router gotchas
- TypeScript tips voor FHIR types

**Process Learnings:**
- Sprint velocity (actual vs. estimated story points)
- Communication gaps
- Documentation gaps
- Testing coverage vs. bugs found

**Next Iteration:**
- Features voor Fase 2 (prioritering)
- Refactoring candidates
- Performance optimizations
- UX improvements

### Metrics Tracking

**Development Metrics:**
- Actual story points per epic vs. estimated
- Bug count per epic
- Code churn (lines added/removed)
- Test coverage achieved

**User Metrics (Post-Launch):**
- Daily active users
- Feature adoption rate
- User feedback score
- Support tickets volume

---

## 9. Referenties

### Mission Control Documents

**Project Documentation:**
- **Datamodel Documentatie** — `docs/datamodel-documentatie.md`
- **Database Schema** — `docs/archive/schemas/20241121_fhir_ggz_schema.sql` (archived)
- **Bouwplan Template** — `docs/templates/bouwplan_template.md`

**To Be Created:**
- [ ] PRD — Product Requirements Document
- [ ] FO — Functioneel Ontwerp
- [ ] TO — Technisch Ontwerp
- [ ] UX/UI — Design specificatie
- [ ] API Documentation — Supabase API endpoints

### External Resources

**FHIR & Healthcare Standards:**
- FHIR R4 Specification: https://hl7.org/fhir/R4/
- MedMIJ GGZ Basisgegevens: https://informatiestandaarden.nictiz.nl/wiki/MedMij:V2020.01/OntwerpGGZ
- Koppeltaal: https://www.koppeltaal.nl/
- ZIBs (ZorgInformatieBouwstenen): https://zibs.nl/
- DSM-5 Codes: American Psychiatric Association
- MedicatieProces 9.0: https://informatiestandaarden.nictiz.nl/wiki/mp:V9

**Technical Stack Documentation:**
- Next.js 15: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- TypeScript: https://www.typescriptlang.org/docs/
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/

**Development Tools:**
- Repository: `https://github.com/[org]/mini-epd-prototype`
- Deployment: `https://mini-epd.vercel.app` (to be configured)
- Design: [Figma link] (to be created)
- Project Management: [Jira/Linear/GitHub Projects]

---

## 10. Glossary & Abbreviations

### Project Terms

| Term | Betekenis |
|------|-----------|
| Epic | Grote feature of fase in development (bevat meerdere stories) |
| Story | Kleine, uitvoerbare taak binnen een epic |
| Story Points | Schatting van complexiteit (Fibonacci: 1, 2, 3, 5, 8, 13, 21) |
| MVP | Minimum Viable Product - eerste werkende versie |
| RLS | Row Level Security - database-level access control |
| BSN | Burgerservicenummer - Nederlands persoonsnummer |

### Development Principles

| Term | Betekenis |
|------|-----------|
| DRY | Don't Repeat Yourself - geen duplicate code |
| KISS | Keep It Simple, Stupid - eenvoud boven complexiteit |
| SOC | Separation of Concerns - logische scheiding van code |
| YAGNI | You Aren't Gonna Need It - alleen bouwen wat nodig is |

### FHIR Healthcare Terms

| Term | Betekenis |
|------|-----------|
| FHIR | Fast Healthcare Interoperability Resources - internationale standaard |
| HL7 | Health Level 7 - internationale gezondheidsdata standaard organisatie |
| ZIB | ZorgInformatieBouwsteen - Nederlandse gezondheidsdata standaard |
| DSM-5 | Diagnostic and Statistical Manual of Mental Disorders (5e editie) |
| ICD-10 | International Classification of Diseases (10e revisie) |
| ATC | Anatomical Therapeutic Chemical - medicatie classificatie systeem |
| ROM | Routine Outcome Monitoring - vragenlijsten voor behandeleffect |
| MedMIJ | Nederlands afsprakenstelsel voor patiëntportalen (PGO) |
| PGO | Persoonlijke Gezondheidsomgeving - patiënt app voor eigen dossier |
| Koppeltaal | Standaard voor koppeling EPD met eHealth apps |
| LSP | Landelijk Schakelpunt - nationale medicatie-uitwisseling |

### FHIR Resources

| Resource | Betekenis |
|----------|-----------|
| Patient | Patiënt/cliënt |
| Practitioner | Behandelaar/zorgverlener |
| Organization | Zorginstelling |
| Encounter | Contactmoment (intake, sessie, etc.) |
| Condition | Diagnose of probleem |
| Observation | Meting of observatie (ROM, risico, etc.) |
| MedicationStatement | Medicatiegebruik |
| CarePlan | Behandelplan |
| Goal | Behandeldoel |
| Consent | Toestemming of wilsverklaring |
| Flag | Waarschuwing of alert |
| DocumentReference | Document (verslag, brief, etc.) |

### Technical Abbreviations

| Term | Betekenis |
|------|-----------|
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| RSC | React Server Components |
| RLS | Row Level Security |
| UUID | Universally Unique Identifier |
| JWT | JSON Web Token |
| HTTPS | HTTP Secure |
| TLS | Transport Layer Security |
| CORS | Cross-Origin Resource Sharing |
| XSS | Cross-Site Scripting |
| SQL | Structured Query Language |
| REST | Representational State Transfer |
| JSON | JavaScript Object Notation |

---

## Versiehistorie

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 21 november 2024 | Colin Lit | Initiële versie - Complete bouwplan gebaseerd op FHIR schema |

---

## Appendix A: Story Point Estimatie

**Fibonacci Scale:**
- **1 punt:** Triviale taak (< 2 uur) - bijv. config change, minor text update
- **2 punten:** Simpele taak (2-4 uur) - bijv. basic form, simple component
- **3 punten:** Gemiddelde taak (4-8 uur) - bijv. CRUD page, database query
- **5 punten:** Complexe taak (1-2 dagen) - bijv. multi-step form, complex logic
- **8 punten:** Zeer complex (2-3 dagen) - bijv. integration, advanced feature
- **13 punten:** Epic-sized (3-5 dagen) - overweeg opsplitsen in kleinere stories
- **21+ punten:** Te groot - MOET worden opgesplitst

**Velocity Estimatie:**
- 1 developer, full-time: ~20-25 story points per 2-week sprint
- 2 developers, full-time: ~40-50 story points per 2-week sprint
- Accounting for: meetings, code review, bugfixes, unknowns

**Project Totals:**
- **Total Story Points:** ~200
- **Estimated Duration:** 8-10 weken @ 25 points/week
- **Buffer:** +20% voor onvoorzien = 10-12 weken totaal

---

## Appendix B: Database Schema Overzicht

**13 Core Tables (FHIR Resources):**

1. `practitioners` - Behandelaren (BIG, AGB, kwalificaties)
2. `organizations` - GGZ-instellingen (AGB, KVK)
3. `patients` - Cliënten (BSN encrypted, demographics)
4. `encounters` - Contactmomenten (intake, behandeling, etc.)
5. `conditions` - Diagnoses (DSM-5, ICD-10, severity)
6. `observations` - Metingen (ROM, risico's, vitals)
7. `medication_statements` - Medicatie (ATC codes, dosering)
8. `care_plans` - Behandelplannen
9. `care_plan_activities` - Behandelactiviteiten
10. `goals` - Behandeldoelen (SMART, meetbaar)
11. `consents` - Toestemmingen (AVG, wilsverklaringen)
12. `flags` - Waarschuwingen (suïcide, agressie, allergie)
13. `document_references` - Documenten (verslagen, brieven)

**Key Database Features:**
- Row Level Security (RLS) op alle tabellen
- Automatic `updated_at` triggers
- UUID primary keys
- ENUM types voor type-safety
- Foreign key constraints
- Indexes op frequently queried fields
- BSN encryption via pgcrypto

**Schema File:** `docs/archive/schemas/20241121_fhir_ggz_schema.sql` (archived)

---

**🎯 Dit bouwplan is gereed voor implementatie. Volgende stap: Start Epic 0 (Setup & Configuratie).**
