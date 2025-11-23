# 🚀 Migratieplan: `/clients/` → `/patients/` Route Consolidatie

**Datum:** 2025-11-22
**Versie:** 1.0
**Status:** ✅ Voltooid
**Gekozen Strategie:** Custom API (Optie B)

---

## 📋 Executive Summary

**Doel:** Consolideer beide routes naar één FHIR-compliant `/patients/` route met Custom API voor Intakes.

**Inschatting:** 10-12 story points (2-3 werkdagen)
**Risico Level:** Medium
**Breaking Changes:** Ja (mitigated door redirects)

---

## 🔧 Fase 0 — Schema & Runbook

**Status:** ✅ Repo gealigneerd (feb 2026). Alle Supabase-migraties leven nu in `supabase/migrations/` en kunnen in één keer worden toegepast met de standaard CLI.

### Benodigde migraties
- `20241115000001_create_leads_table.sql`
- `20241115000002_create_epd_core_tables.sql`
- `20241115000004_create_demo_users.sql`
- `20241121_migrate_legacy_to_fhir.sql`
- `20241121_seed_demo_data.sql`
- `20251119094908_auth_hook_duplicate_email.sql`
- `20251122_screening_intake_schema.sql`
- `20251122_seed_default_organization.sql`

### Runbook
1. Start Supabase lokaal (`supabase start`) of log in op de gewenste omgeving.
2. Draai alle migraties: `supabase db reset --use-migrations` (dev) of `supabase db push` (staging/production). Hiermee wordt het schema gelijkgetrokken met `supabase/migrations/`.
3. Seed basisdata: `pnpm ts-node scripts/seed-organization.ts` (voegt default organisatie + demo practitioners toe) en `pnpm ts-node scripts/apply-organization-seed.sh` indien nodig.
4. Controleer dat er geen drifts zijn: `supabase db diff` mag geen output produceren.
5. Smoke-test FHIR + Custom API:
   - `curl -s http://localhost:3000/api/fhir/Patient?_count=1`
   - `curl -s http://localhost:3000/api/intakes?patientId=<uuid>`
6. Handmatige datafix (eenmalig): archiveer legacy `/clients/` records met `UPDATE clients SET archived=true` of verwijder de oude tabellen na validatie. Nieuwe dossiers worden uitsluitend via `patients` beheerd.
7. Documenteer de uitvoering in release-notes (datum, operator, eventuele afwijkingen).

> Let op: RLS policies staan aan op alle nieuwe tabellen (`screenings`, `screening_activities`, `screening_documents`, `intakes`, enz.). Voer `supabase tests` of `supabase db lint` uit vlak na het toepassen om zeker te zijn dat policies geladen zijn.

---

## 🎯 Probleem Statement

Momenteel bestaan er twee parallelle implementaties voor patiënt/cliënt beheer:

1. **`/app/epd/clients/`** - Oudere implementatie (17-19 nov)
   - Directe Supabase queries
   - Bevat werkende Intake module (Epic 4)
   - Niet FHIR-compliant

2. **`/app/epd/patients/`** - Nieuwere implementatie (21-22 nov)
   - FHIR API compliant
   - Betere features (BSN validatie, filters, paginatie)
   - Intake nog placeholder

**Impact:**
- Verwarring over canonical route
- Code duplicatie
- Inconsistente architectuur
- Moeilijke maintenance

---

## 📊 Huidige Situatie Analyse

### `/clients/` Route Inventory

**✅ Volledig Geïmplementeerd:**

| Component | LOC | Functionaliteit |
|-----------|-----|-----------------|
| `intakes/components/intake-list.tsx` | 50 | Lijst van alle intakes per cliënt |
| `intakes/components/intake-card.tsx` | 70 | Individuele intake kaart display |
| `intakes/components/new-intake-form.tsx` | 137 | Formulier nieuwe intake (Zod validatie) |
| `intakes/[intakeId]/components/intake-header.tsx` | 65 | Header met titel, status, datums |
| `intakes/[intakeId]/components/intake-tabs.tsx` | 52 | Tab navigatie binnen intake |
| `intakes/[intakeId]/page.tsx` | 52 | Intake detail algemene informatie |
| `intakes/[intakeId]/layout.tsx` | 29 | Layout wrapper voor intake detail |
| `intakes/actions.ts` | 83 | Server actions (CRUD operations) |

**Total:** ~538 LOC werkende functionaliteit

**Server Actions (Supabase-based):**
```typescript
export async function getIntakesByClientId(clientId: string)
export async function createIntake(input: CreateIntakeInput)
export async function getIntakeById(intakeId: string)
```

**⏳ Placeholders (geen migratie nodig):**
- Profile Tab ("Coming Soon Week 3")
- Plan Tab ("Coming Soon Week 3")
- Reports pagina
- Diagnose pagina

**📦 Basis Functionaliteit (inferieur aan /patients/):**
- Client list (geen status/gender filters, geen paginatie)
- Client form (geen BSN validatie, geen John Doe)
- Dashboard (basic, geen unique features)

### `/patients/` Route Inventory

**✅ Al Geïmplementeerd (Superieur):**
- Patient list met advanced filtering
- Patient form met BSN 11-proef validatie
- John Doe support
- Delete functionaliteit (two-step confirmation)
- Modern layout (ClientHeader + ClientSidebar)
- Dashboard met quick actions

**❌ Ontbreekt (te migreren van /clients/):**
- Intake module (volledig)

---

## 🎯 Gekozen Architectuur: Custom API (Optie B)

### Waarom Custom API?

**✅ Voordelen:**
- Snellere implementatie (1-2 dagen vs 3-4 dagen)
- Eenvoudiger data model (direct mapping naar `intakes` tabel)
- Minder transformatie logica nodig
- Bestaande database schema hergebruiken
- Type safety met TypeScript

**⚠️ Trade-offs:**
- Niet FHIR Encounter-compliant (maar acceptabel voor MVP)
- Toekomstige refactor naar FHIR mogelijk nodig
- Aparte API naast FHIR Patient/Practitioner

**🔮 Toekomst Path:**
- Behoud Custom API voor Intakes in MVP
- Plan FHIR Encounter mapping in latere fase (Epic 5/6)
- Incrementele migratie mogelijk zonder breaking changes

### API Specificatie

**Endpoint:** `/api/intakes`

**Routes:**
```typescript
GET    /api/intakes?patientId={id}        // List intakes for patient
POST   /api/intakes                        // Create new intake
GET    /api/intakes/{intakeId}             // Get intake by ID
PUT    /api/intakes/{intakeId}             // Update intake
DELETE /api/intakes/{intakeId}             // Delete intake
```

**Request/Response Types:**
```typescript
interface Intake {
  id: string;
  patient_id: string;
  title: string;
  department: 'Volwassenen' | 'Jeugd' | 'Ouderen';
  status: 'Open' | 'Afgerond';
  start_date: string;
  end_date?: string;
  notes?: string;
  psychologist_id?: string;
  created_at: string;
  updated_at: string;
}

interface CreateIntakeInput {
  patient_id: string;
  title: string;
  department: 'Volwassenen' | 'Jeugd' | 'Ouderen';
  start_date: string;
}

interface IntakeListResponse {
  intakes: Intake[];
  total: number;
}
```

---

## 🗺️ Gedetailleerd Migratieplan

### Fase 1: Intake API Ontwikkeling (3 SP)

**Doel:** Bouw Custom API voor Intake operaties

#### 1.1 API Route Setup (1 SP)

**Bestanden aan te maken:**
```
app/api/intakes/
├── route.ts              // GET (list), POST (create)
└── [intakeId]/
    └── route.ts          // GET, PUT, DELETE
```

**Implementatie:**
- Supabase client met RLS
- Error handling
- Input validatie (Zod schemas)
- Response formatting

**Acceptatie Criteria:**
- [x] GET `/api/intakes?patientId={id}` retourneert alle intakes
- [x] POST `/api/intakes` creëert nieuwe intake
- [x] GET `/api/intakes/{id}` retourneert specifieke intake
- [x] PUT `/api/intakes/{id}` update intake
- [x] DELETE `/api/intakes/{id}` verwijdert intake
- [x] Alle endpoints hebben error handling
- [x] Input validatie werkt

#### 1.2 Type Definitions (0.5 SP) ✅

**Bestand:** `lib/types/intake.ts`

**Inhoud:**
- ✅ Intake interface
- ✅ CreateIntakeInput, UpdateIntakeInput types
- ✅ IntakeListResponse type
- ✅ Zod validation schemas

#### 1.3 Server Actions Refactor (1.5 SP) ✅

**Bestand:** `app/epd/patients/[id]/intakes/actions.ts`

**Wijzigingen:**
```typescript
// VOOR (Supabase direct):
const { data } = await supabase.from('intakes').select('*')

// NA (API call):
const response = await fetch(`/api/intakes?patientId=${patientId}`)
const data = await response.json()
```

**Updates:**
- ✅ `getIntakesByClientId` → `getIntakesByPatientId`
- ✅ `createIntake` - gebruik POST `/api/intakes`
- ✅ `getIntakeById` - gebruik GET `/api/intakes/{id}`
- ✅ Cookies worden doorgegeven aan fetch calls
- ✅ Error handling voor auth redirects

**Complexiteit:** Medium
**Risico:** Laag

---

### Fase 2: Component Migratie (3 SP)

**Doel:** Verplaats alle Intake componenten naar `/patients/`

#### 2.1 Directory Structuur (0.5 SP) ✅

**Creëer structuur:**
```
app/epd/patients/[id]/intakes/
├── components/
│   ├── intake-card.tsx ✅
│   ├── intake-list.tsx ✅
│   └── new-intake-form.tsx ✅
├── [intakeId]/
│   ├── components/
│   │   ├── intake-header.tsx ✅
│   │   └── intake-tabs.tsx ✅
│   ├── layout.tsx ✅
│   └── page.tsx ✅
├── new/
│   └── page.tsx ✅
└── actions.ts ✅
```

#### 2.2 Kopieer en Pas Aan (2 SP) ✅

**Voor elk component:**
1. ✅ Kopieer van `/clients/[id]/intakes/` naar `/patients/[id]/intakes/`
2. ✅ Update imports:
   - `clientId` → `patientId` (props en variabelen)
   - `/epd/clients/` → `/epd/patients/` (routes)
   - Type imports naar `@/lib/types/intake`
3. ✅ Update server action calls (gebruik nieuwe actions.ts)
4. ✅ Import paden gecorrigeerd

**Specifieke wijzigingen:**

**intake-list.tsx:**
- ✅ Props: `clientId` → `patientId`
- ✅ Link urls: `/clients/` → `/patients/`

**new-intake-form.tsx:**
- ✅ Form field: `patient_id` ipv `client_id`
- ✅ Redirect: `/patients/` ipv `/clients/`

**intake-header.tsx:**
- ✅ Breadcrumb: `/patients/` ipv `/clients/`
- ✅ Type imports gecorrigeerd

**Complexiteit:** Laag (copy-paste + find/replace)
**Risico:** Laag

#### 2.3 Verwijder Placeholder (0.5 SP) ✅

**Bestand:** `app/epd/patients/[id]/intake/page.tsx`

**Actie:** ✅ Verwijder placeholder, vervang door redirect:
```typescript
export default async function IntakeRedirect({ params }) {
  const { id } = await params;
  redirect(`/epd/patients/${id}/intakes`);
}
```

---

### Fase 3: Navigatie Integratie (2 SP)

**Doel:** Integreer Intake tab in patient navigatie

#### 3.1 Update ClientSidebar (1 SP) ✅

**Bestand:** `app/epd/patients/[id]/components/client-sidebar.tsx`

**Wijzigingen:**
- ✅ Maak "Intake" tab interactief (verwijder placeholder styling)
- ✅ Link naar `/patients/{id}/intakes`
- ✅ Active state logic voor subroutes
- Optioneel: Badge met aantal openstaande intakes (nog niet geïmplementeerd)

#### 3.2 Update Dashboard (1 SP) ✅

**Bestand:** `app/epd/patients/[id]/page.tsx`

**Wijzigingen:**
- ✅ Update "Volgende stappen" sectie
- ✅ Verwijs naar intake functionaliteit
- ✅ Intake quick action card linkt naar nieuwe route
- ✅ Optioneel: Toon recent intake in dashboard (geïmplementeerd)

**Complexiteit:** Laag
**Risico:** Laag

---

### Fase 4: Route Consolidatie (2 SP)

**Doel:** Deprecate `/clients/` en setup redirects

#### 4.1 Catch-all Redirect (1 SP) ✅

**Bestand:** `app/epd/clients/[...path]/route.ts` (nieuw)

**Implementatie:**
```typescript
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const searchParams = request.nextUrl.searchParams;
  const newPath = `/epd/patients/${path.join('/')}`;
  const newUrl = new URL(newPath, request.url);
  searchParams.forEach((value, key) => {
    newUrl.searchParams.set(key, value);
  });
  redirect(newUrl.toString());
}
```

**Test scenarios:**
- ✅ `/epd/clients` → `/epd/patients` (via `page.tsx` redirect)
- ✅ `/epd/clients/{id}` → `/epd/patients/{id}`
- ✅ `/epd/clients/{id}/intakes` → `/epd/patients/{id}/intakes`
- ✅ `/epd/clients/{id}/intakes/{intakeId}` → `/epd/patients/{id}/intakes/{intakeId}`
- ✅ Query parameters worden behouden

#### 4.2 Archive Old Code (0.5 SP) ✅

**Acties:**
- ✅ `mkdir -p app/epd/_archive`
- ✅ `mv app/epd/clients app/epd/_archive/clients_backup_20251122`
- ✅ Redirect routes teruggeplaatst in `app/epd/clients/`
- ✅ Oude code volledig gearchiveerd

#### 4.3 Update Documentatie (0.5 SP) ✅

**Bestanden bij te werken:**
- ✅ `docs/specs/UI/bouwplan-mini-epd-v1.0.md` - Update `/clients/` naar `/patients/`
- ✅ `CHANGELOG.md` - Entry toegevoegd met breaking changes
- ✅ `docs/migratie-clients-naar-patients.md` - Dit document bijgewerkt
- `docs/bouwplan-mini-epd.md` - Nog te updaten indien aanwezig
- `README.md` - Nog te updaten indien screenshots/links aanwezig

**Changelog:**
- ✅ Entry toegevoegd aan `CHANGELOG.md` met breaking changes en mitigatie

**Complexiteit:** Laag
**Risico:** Laag

---

### Fase 5: Testing & Validatie (2 SP)

**Doel:** Verifieer feature parity en stabiliteit

#### 5.1 Functionele Tests (1 SP)

**Test Checklist:**

**Intake List:**
- [ ] Navigeer naar `/patients/{id}/intakes`
- [ ] Lijst toont alle intakes voor patient
- [ ] Empty state toont bij geen intakes
- [ ] "Nieuwe intake" button werkt

**Nieuwe Intake:**
- [ ] Formulier opent via "Nieuwe intake" button
- [ ] Alle velden valideren correct
- [ ] Submit creëert intake in database
- [ ] Redirect naar intake lijst na succes
- [ ] Intake verschijnt in lijst

**Intake Detail:**
- [ ] Klik op intake card opent detail
- [ ] Header toont correcte titel, status, datums
- [ ] Tabs tonen (ook al zijn ze placeholder)
- [ ] Algemene informatie tab toont data
- [ ] Notities sectie werkt

**Navigatie:**
- [ ] Sidebar "Intake" tab is actief
- [ ] Breadcrumbs kloppen
- [ ] Terug naar patiënten werkt

**Redirects:**
- [ ] `/clients/{id}` → `/patients/{id}` werkt
- [ ] `/clients/{id}/intakes` → `/patients/{id}/intakes` werkt
- [ ] Query parameters behouden blijven

#### 5.2 API Tests (0.5 SP)

**Test alle endpoints:**
```bash
# List intakes
curl http://localhost:3000/api/intakes?patientId={uuid}

# Create intake
curl -X POST http://localhost:3000/api/intakes \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"uuid","title":"Test","department":"Volwassenen","start_date":"2025-11-22"}'

# Get intake
curl http://localhost:3000/api/intakes/{intakeId}

# Update intake
curl -X PUT http://localhost:3000/api/intakes/{intakeId} \
  -d '{"status":"Afgerond"}'

# Delete intake
curl -X DELETE http://localhost:3000/api/intakes/{intakeId}
```

**Verifieer:**
- [ ] Response status codes correct (200, 201, 404, etc.)
- [ ] Response bodies bevatten verwachte data
- [ ] Errors worden netjes afgehandeld
- [ ] RLS policies werken (unauthorized access blocked)

#### 5.3 Regressie Tests (0.5 SP)

**Verifieer bestaande functionaliteit:**
- [ ] Patient list werkt nog
- [ ] Patient create/update/delete werkt nog
- [ ] Screening tab (placeholder) werkt nog
- [ ] Andere tabs onveranderd

**Complexiteit:** Medium
**Risico:** Medium

---

## 📈 Story Point Breakdown

| Fase | Taak | SP | Complexiteit | Risico |
|------|------|------|--------------|--------|
| 1.1 | API Route Setup | 1 | Medium | Laag |
| 1.2 | Type Definitions | 0.5 | Laag | Laag |
| 1.3 | Server Actions Refactor | 1.5 | Medium | Laag |
| 2.1 | Directory Structuur | 0.5 | Laag | Laag |
| 2.2 | Kopieer en Pas Aan | 2 | Laag | Laag |
| 2.3 | Verwijder Placeholder | 0.5 | Laag | Laag |
| 3.1 | Update ClientSidebar | 1 | Laag | Laag |
| 3.2 | Update Dashboard | 1 | Laag | Laag |
| 4.1 | Catch-all Redirect | 1 | Medium | Laag |
| 4.2 | Archive Old Code | 0.5 | Laag | Laag |
| 4.3 | Update Documentatie | 0.5 | Laag | Laag |
| 5.1 | Functionele Tests | 1 | Medium | Medium |
| 5.2 | API Tests | 0.5 | Medium | Medium |
| 5.3 | Regressie Tests | 0.5 | Laag | Laag |
| **TOTAAL** | | **12 SP** | **Laag-Medium** | **Laag-Medium** |

**Geschatte Tijdsduur:** 2-3 werkdagen (16-24 uur development tijd)

---

## ⚠️ Risico's en Mitigatie

| Risico | Impact | Waarschijnlijkheid | Mitigatie |
|--------|--------|-------------------|-----------|
| Breaking changes in productie | Hoog | Laag | Redirects + grondige testing |
| Data inconsistentie (intakes) | Hoog | Laag | Gebruik dezelfde database tabel |
| Gemiste edge cases | Medium | Medium | Uitgebreide test checklist |
| Performance issues (API overhead) | Laag | Laag | Cache strategie, index optimization |
| Type errors na migratie | Medium | Medium | TypeScript strict mode, thorough testing |

---

## 🎯 Acceptatie Criteria (Definition of Done)

**Functioneel:**
- [x] Alle Intake functionaliteit werkt in `/patients/` route
- [x] Feature parity met originele `/clients/` implementatie
- [x] Redirects werken voor alle `/clients/` URLs
- [x] Geen broken links in applicatie

**Technisch:**
- [x] API endpoints geïmplementeerd en werkend
- [x] Type definitions compleet (`lib/types/intake.ts`)
- [x] Error handling geïmplementeerd (inclusief auth redirects)
- [x] Cookies worden correct doorgegeven aan API calls
- [ ] RLS policies getest (nog te valideren)

**Testing:**
- [x] Basis functionele tests uitgevoerd (componenten werken)
- [x] API tests uitgevoerd (endpoints werken)
- [x] Import paden gecorrigeerd
- [x] Geen TypeScript errors
- [ ] Volledige regressie tests (nog te doen)

**Documentatie:**
- [x] Bouwplannen bijgewerkt (`bouwplan-mini-epd-v1.0.md`)
- [x] CHANGELOG.md entry toegevoegd
- [x] API documentatie beschikbaar (`docs/api/intakes-api.md`)
- [x] Migration guide voor developers (dit document)

**Cleanup:**
- [x] Oude `/clients/` code gearchiveerd
- [x] Geen duplicate code
- [x] Import paden gecorrigeerd
- [ ] Console warnings/errors check (nog te doen)

---

## 🚀 Implementatie Volgorde (Aanbevolen)

### Dag 1: API Foundation
1. **Ochtend:** Fase 1.1 + 1.2 (API routes + types)
2. **Middag:** Fase 1.3 (Server actions refactor)
3. **Eind dag:** Fase 5.2 (API tests)

**Deliverable:** Werkende Intake API

### Dag 2: Component Migratie
1. **Ochtend:** Fase 2.1 + 2.2 (Kopieer componenten)
2. **Middag:** Fase 2.3 + 3.1 + 3.2 (Navigatie integratie)
3. **Eind dag:** Fase 5.1 (Functionele tests)

**Deliverable:** Werkende Intake module in `/patients/`

### Dag 3: Consolidatie & Cleanup
1. **Ochtend:** Fase 4.1 + 4.2 (Redirects + archive)
2. **Middag:** Fase 4.3 (Documentatie)
3. **Eind dag:** Fase 5.3 (Regressie tests)

**Deliverable:** Volledige migratie afgerond

---

## 📦 Deliverables Checklist

**Code:**
- [x] `/app/api/intakes/` - API routes (GET, POST)
- [x] `/app/api/intakes/[intakeId]/` - API routes (GET, PUT, DELETE)
- [x] `/app/epd/patients/[id]/intakes/` - Volledige module
- [x] `/app/epd/clients/[...path]/route.ts` - Redirect (catch-all)
- [x] `/app/epd/clients/page.tsx` - Root redirect
- [x] `/lib/types/intake.ts` - Type definitions

**Documentatie:**
- [x] `docs/migratie-clients-naar-patients.md` - Dit document (bijgewerkt)
- [x] `docs/api/intakes-api.md` - API documentatie
- [x] Updated bouwplannen (`bouwplan-mini-epd-v1.0.md`)
- [x] CHANGELOG.md entry

**Tests:**
- [ ] Test rapport met resultaten
- [ ] Screenshot van werkende features
- [ ] Performance metrics (optioneel)

**Archief:**
- [ ] `/app/epd/_archive/clients_backup_20251122/` - Oude code

---

## 🔮 Toekomstige Verbeteringen (Out of Scope)

**FHIR Compliance:**
- Migreer Custom Intake API naar FHIR Encounter
- Mapping van `intakes` tabel naar FHIR resources
- Implementeer FHIR search parameters

**Features:**
- Intake status workflow (bezig → afgerond met validaties)
- Intake templates per afdeling
- Notities met rich text editor
- Document attachments per intake
- Intake duplicatie/klonen
- Bulk operations (meerdere intakes tegelijk)

**Performance:**
- API response caching
- Optimistic UI updates
- Lazy loading van intake details
- Pagination voor intake lists (bij >50 intakes)

**Analytics:**
- Intake completion metrics
- Average intake duration per afdeling
- Psychologist workload dashboard

---

## 📞 Ondersteuning en Vragen

**Contact:**
- Developer: Colin Lit
- Email: colin@ikbenlit.nl

**Resources:**
- Bouwplan Screening & Intake: `docs/specs/screening-intake/bouwplan-screening-intake-v1.0.md`
- FHIR Bouwplan: `docs/bouwplan-pragmatisch-fhir.md`
- Database Schema: `supabase/migrations/20251122_screening_intake_schema.sql`

---

**Versie Historie:**
- v1.0 (2025-11-22): Initial migration plan met Custom API strategie
