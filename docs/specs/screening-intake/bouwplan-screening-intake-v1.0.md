# 🚀 Mission Control — Bouwplan Screening & Intake

💡 **Tip:** Dit document is opgesteld op basis van `fo-screening-intake-v1_0.md`.

---

**Projectnaam:** AI Speedrun - Mini EPD v1.2
**Versie:** v1.0
**Datum:** 22-11-2025
**Auteur:** Antigravity (i.s.m. Colin)

---

## 1. Doel en context
🎯 **Doel:** Het realiseren van de volledige screening- en intakeflow voor GGZ-professionals, van aanmelding tot behandeladvies.
📘 **Toelichting:** Dit bouwplan vertaalt het Functioneel Ontwerp (FO) naar concrete ontwikkelstappen. De focus ligt op het bouwen van de fundering (zonder AI in eerste instantie) zodat cliënten kunnen worden geregistreerd, gescreend en geïntaked volgens de specificaties.

---

## 2. Uitgangspunten

### 2.1 Technische Stack
- **Frontend:** Next.js (App Router) + Tailwind CSS + Lucide Icons
- **Backend:** Supabase (PostgreSQL + Auth)
- **State Management:** React Query / Server Actions
- **UI Library:** shadcn/ui (of vergelijkbaar)

### 2.2 Projectkaders
- **Scope:** Zoals beschreven in FO v1.0 (MVP).
- **Data:** Gebruik van Supabase voor persistentie.
- **AI:** Nog niet in scope voor deze fase (komt in latere iteratie).

### 2.3 Programmeer Uitgangspunten
- **DRY & SOC:** Strikte scheiding tussen UI en data-fetching (Server Actions / Services).
- **Types:** Volledig getypeerd met TypeScript (Database types genereren uit Supabase).
- **Componenten:** Herbruikbare componenten voor veelvoorkomende patronen (bijv. `SectionCard`, `StatusBadge`).

---

## 3. Epics & Stories Overzicht

| Epic ID | Titel | Doel | Status | Stories |
|---------|-------|------|--------|---------|
| E1 | Database & Types | Datamodel implementeren in Supabase | ✅ Done | 3 |
| E2 | Cliëntenbeheer | Lijstweergave en aanmaken cliënten | 🔨 In Progress | 3 |
| E3 | Screening Module | Screening tab en functionaliteit | ⏳ To Do | 4 |
| E4 | Intake Core | Intake overzicht en navigatie | ✅ Done | 3 |
| E5 | Intake Details | Specifieke tabbladen (Contact, Risico, etc.) | ⏳ To Do | 5 |
| E6 | Diagnose & Advies | Diagnose stelling en behandeladvies | ⏳ To Do | 3 |

---

## 4. Epics & Stories (Uitwerking)

### Epic 1 — Database & Types ✅
**Doel:** Een solide datamodel in Supabase dat voldoet aan de eisen uit het FO.
**Status:** Done - Alle stories voltooid op 22-11-2025

| Story ID | Status | Beschrijving | Acceptatiecriteria |
|----------|--------|--------------|---------------------|
| E1.S1 | ✅ Done | Tabellen aanmaken | Migration `20251122_screening_intake_schema.sql` aangemaakt met:<br>- Patient status kolom (`episode_status` enum)<br>- Screening module (3 tabellen: `screenings`, `screening_activities`, `screening_documents`)<br>- Intake module (4 tabellen: `intakes`, `anamneses`, `examinations`, `risk_assessments`)<br>- `encounters` tabel uitgebreid met `intake_id` kolom<br>- `care_plans` uitgebreid met intake referenties |
| E1.S2 | ✅ Done | Migration toepassen | Migration succesvol toegepast op Supabase database met:<br>- Foreign keys en constraints<br>- RLS policies voor alle nieuwe tabellen<br>- Indexes voor performance<br>- Triggers voor `updated_at` timestamps |
| E1.S3 | ✅ Done | TypeScript Types genereren | Types gegenereerd met `supabase gen types` en geëxporteerd naar `lib/supabase/database.types.ts`<br>- 2148+ regels TypeScript types<br>- Alle nieuwe tabellen en enums geëxporteerd |

### Epic 2 — Cliëntenbeheer (Level 1) 🔨
**Doel:** Behandelaars kunnen cliënten vinden en nieuwe cliënten aanmaken.
**Status:** In Progress - 2 van 3 stories voltooid op 22-11-2025

| Story ID | Status | Beschrijving | Acceptatiecriteria |
|----------|--------|--------------|---------------------|
| E2.S1 | ✅ Done | Cliëntenlijst | Tabel met zoekfunctie, filters en status badges:<br>- `patient-list.tsx` geüpdatet met client-side search bar<br>- Status filter dropdown (alle/screening/actief/afgerond/afgemeld)<br>- StatusBadge component met color-coded badges<br>- Tabel kolommen: Status, Naam, BSN, Laatst gewijzigd<br>- API route `/api/fhir/Patient` ondersteunt status filtering<br>- FHIR transform aangepast voor status extension |
| E2.S2 | ✅ Done | Nieuwe Cliënt Flow | Formulier voor aanmaken cliënt met John Doe logica:<br>- `patient-form.tsx` compleet herschreven met alle FO velden<br>- John Doe checkbox met conditional BSN requirement<br>- BSN validatie met Modulo-11 check<br>- Alle velden: naam, BSN, geboortedatum, geslacht, adres (straat, postcode, plaats), contact (telefoon, email), verzekering (verzekeraar, polisnummer)<br>- Warning messages voor John Doe patiënten<br>- Status altijd 'planned' voor nieuwe patiënten<br>- Redirect naar patient detail page na aanmaken<br>- FHIR transform ondersteunt insurance extension (bidirectioneel) |
| E2.S3 | ⏳ To Do | Cliënt Header & Nav | Context-aware header en sidebar navigatie (Level 2). |

### Epic 3 — Screening Module (Level 2)
**Doel:** Faciliteren van het screeningsproces.

| Story ID | Beschrijving | Acceptatiecriteria |
|----------|--------------|---------------------|
| E3.S1 | Activiteitenlog | Tijdlijn component met toevoeg-functionaliteit. |
| E3.S2 | Documenten & Hulpvraag | Upload functionaliteit en tekstveld voor hulpvraag. |
| E3.S3 | Screeningsbesluit | Formulier voor besluit (geschikt/niet geschikt) + status update logica. |
| E3.S4 | Basisgegevens Tab | Read-only weergave met edit-modus voor NAW gegevens. |

### Epic 4 — Intake Core (Level 2) ✅
**Doel:** Beheer van intakes (meerdere per cliënt mogelijk).
**Status:** Done - Alle stories voltooid op 22-11-2025

| Story ID | Status | Beschrijving | Acceptatiecriteria |
|----------|--------|--------------|---------------------|
| E4.S1 | ✅ Done | Intake Overzicht | Kaartweergave van alle intakes per cliënt:<br>- `IntakeCard` component met status badges<br>- `IntakeList` component voor grid weergave<br>- Server Action `getIntakesByClientId` voor data fetching<br>- Geïntegreerd in `IntakeTab` op cliënt detail pagina |
| E4.S2 | ✅ Done | Nieuwe Intake | Modal/page voor starten nieuwe intake:<br>- `NewIntakeForm` met Zod validatie<br>- Velden: Titel, Afdeling, Startdatum<br>- Server Action `createIntake` voor aanmaken record<br>- Redirect naar intake lijst na succes |
| E4.S3 | ✅ Done | Intake Layout | Sub-navigatie (tabs) binnen een specifieke intake:<br>- `IntakeLayout` met `IntakeHeader` en `IntakeTabs`<br>- Header toont titel, status, en datums<br>- Tabs voor navigatie naar sub-onderdelen (Algemeen, Contact, etc.)<br>- Server Action `getIntakeById` voor ophalen details |

### Epic 5 — Intake Details (Tabs)
**Doel:** Inhoudelijke registratie van de intake.

| Story ID | Beschrijving | Acceptatiecriteria |
|----------|--------------|---------------------|
| E5.S1 | Tab Algemeen | Overzicht van intake details, status en notities. |
| E5.S2 | Tab Contactmomenten | CRUD voor contactmomenten (datum, type, verslag). |
| E5.S3 | Tab Kindcheck | Formulier voor kindcheck registratie. |
| E5.S4 | Tab Risicotaxatie | Formulier voor risico-inschatting. |
| E5.S5 | Tabs Anamnese, Onderzoek, ROM | Generieke of specifieke formulieren voor deze onderdelen. |

### Epic 6 — Diagnose & Advies
**Doel:** Afronding van de intake met diagnose en advies.

| Story ID | Beschrijving | Acceptatiecriteria |
|----------|--------------|---------------------|
| E6.S1 | Diagnose Tab | Toevoegen DSM-5 diagnoses (code, ernst, toelichting). |
| E6.S2 | Behandeladvies Tab | Rich text editor voor advies + doorzet-logica. |
| E6.S3 | Intake Afronding | Status transitie naar 'Afgerond' en update cliënt status. |

---

## 5. Kwaliteit & Testplan

### Test Types
- **Unit Tests:** Voor complexe validatielogica (bijv. BSN check).
- **Manual Testing:** Doorlopen van de volledige flow van 'Nieuwe Cliënt' tot 'Intake Afgerond'.

### Manual Test Checklist
- [ ] Nieuwe cliënt aanmaken (John Doe & Regulier).
- [ ] Screening doorlopen en besluit nemen.
- [ ] Intake starten en contactmoment toevoegen.
- [ ] Diagnose toevoegen en behandeladvies opstellen.
- [ ] Intake afronden en controleren of status update.

---

## 6. Risico's & Mitigatie

| Risico | Mitigatie |
|--------|-----------|
| Complexiteit datamodel | Starten met strikte types en ERD validatie. |
| Navigatie diepte (Level 3?) | Duidelijke breadcrumbs en 'terug' knoppen implementeren. |
| Performance bij veel data | Paginering op lijsten en lazy loading van tabs. |

---
