# 🚀 Mission Control — Bouwplan Swift: Diagnostiek Workflow

**Projectnaam:** Swift — Diagnostiek Workflow  
**Versie:** v1.0  
**Datum:** 23-12-2024  
**Auteur:** Colin Lit / Development Team

---

## 1. Doel en context

🎯 **Doel:**  
Implementeren van de complete diagnostiek workflow in Swift: van het plannen van een diagnostiek-afspraak, via het schrijven van een rapportage, tot het bekijken en stellen van diagnoses. Deze workflow stelt behandelaars in staat om een volledig diagnostiek-traject door te lopen via natuurlijke taal zonder menu-navigatie.

**Kernbelofte:**
> Een behandelaar kan een volledig diagnostiek-traject doorlopen: "afspraak diagnostiek jan morgen 10:00" → "rapportage diagnostiek gesprek met jan" → "diagnose toevoegen jan F41.1" — alles in één vloeiende flow.

📘 **Context:**  
Dit bouwplan beschrijft de implementatie van de diagnostiek workflow als uitbreiding op Swift. Het bouwt voort op de Swift foundation (Command Center, Intent Classification) en voegt specifieke blocks toe voor behandelaars.

**Relatie met documentatie:**
- **FO Diagnostiek:** `swift-fo-diagnostiek-workflow.md` — Complete use case beschrijving
- **FO Algemeen:** `swift-fo-ai.md` — Algemene Swift functionaliteit
- **Bouwplan Swift:** `bouwplan-swift-v1.md` — Hoofd Swift bouwplan
- **UX/UI:** `swift-ux-v2.1.md` — Visuele specificaties

---

## 2. Uitgangspunten

### 2.1 Technische Stack

**Bestaand (hergebruiken):**
| Component | Technologie | Status | Hergebruik |
|-----------|-------------|--------|------------|
| Swift Foundation | Command Center, Intent Classification | ✅ | Basis voor alle blocks |
| Appointment Modal | `app/epd/agenda/components/appointment-modal.tsx` | ✅ | 80% hergebruik |
| Rapportage Composer | `app/epd/patients/[id]/rapportage/components/report-composer.tsx` | ✅ | 80% hergebruik |
| Diagnose Form | `app/epd/patients/[id]/diagnose/components/diagnosis-detail-form.tsx` | ✅ | 80% hergebruik |
| Diagnose Actions | `app/epd/patients/[id]/diagnose/actions.ts` | ✅ | 90% hergebruik |
| FHIR Patient API | `/api/fhir/Patient` | ✅ | Patient search |
| Reports API | `/api/reports` | ✅ | Rapportage opslaan |

**Nieuw te bouwen:**
| Component | Technologie | Reden |
|-----------|-------------|-------|
| AfspraakBlock | React component | Swift wrapper rond appointment modal |
| RapportageBlock | React component | Swift wrapper rond report composer |
| DiagnoseBlock | React component | Overzicht component |
| DiagnoseFormBlock | React component | Swift wrapper rond diagnose form |
| Appointments API | Next.js API route | Encounter CRUD voor Swift |
| Diagnoses API | Next.js API route | Diagnose CRUD voor Swift |

### 2.2 Projectkaders

| Kader | Waarde |
|-------|--------|
| **Bouwtijd** | 2 weken (2 sprints) |
| **Team** | 1 developer |
| **Scope** | Diagnostiek workflow: Afspraak → Rapportage → Diagnose |
| **Data** | Bestaande Supabase database (encounters, conditions, reports) |
| **Doel** | Werkende behandelaar workflow voor demo |

### 2.3 Programmeer Uitgangspunten

**Code Quality Principles:**

- **DRY (Don't Repeat Yourself)**
  - Hergebruik bestaande componenten (appointment-modal, report-composer, diagnose-form)
  - Centrale API routes voor encounters en diagnoses
  - Shared hooks voor common patterns

- **KISS (Keep It Simple, Stupid)**
  - Swift blocks zijn wrappers rond bestaande componenten
  - Minimale aanpassingen aan bestaande code
  - Hergebruik bestaande validatie en error handling

- **SOC (Separation of Concerns)**
  - Swift blocks gescheiden van klassieke EPD componenten
  - API routes als wrapper rond bestaande actions
  - Business logic blijft in bestaande actions

- **YAGNI (You Aren't Gonna Need It)**
  - Alleen diagnostiek workflow in scope
  - Geen andere behandelaar workflows (intake, behandelplan, etc.)
  - Geen advanced features (herhalende afspraken, etc.)

**Development Practices:**

- **Hergebruik Strategie**
  ```typescript
  // ✅ Hergebruik bestaande componenten
  // components/swift/blocks/afspraak-block.tsx
  import { AppointmentModal } from '@/app/epd/agenda/components/appointment-modal';
  
  // Aanpassen voor Swift context:
  // - Prefill vanuit intent
  // - Encounter_id teruggeven na opslaan
  // - Swift styling (dark theme)
  
  // ✅ Hergebruik bestaande actions
  // app/api/appointments/route.ts
  import { createEncounter, updateEncounter } from '@/app/epd/agenda/actions';
  
  // Wrapper rond bestaande logica met Swift-specifieke validatie
  ```

- **Error Handling**
  - Hergebruik bestaande error handling uit actions
  - Nederlandse foutmeldingen consistent met Swift
  - Toast notifications voor user feedback

- **Security**
  - Hergebruik Supabase RLS policies
  - Authenticatie via bestaande Supabase Auth
  - Input validation met Zod (bestaande schemas)

---

## 3. Epics & Stories Overzicht

| Epic ID | Titel | Doel | Status | Stories | Effort | Opmerkingen |
|---------|-------|------|--------|---------|--------|-------------|
| E-D1 | Afspraak & Rapportage | Afspraak plannen + rapportage koppelen | ⏳ To Do | 3 | 11 SP | Hergebruik appointment modal |
| E-D2 | Diagnose Beheer | Diagnose bekijken, toevoegen, bijstellen | ⏳ To Do | 3 | 10 SP | Hergebruik diagnose form |

**Totaal: 6 stories, 21 story points**

**Belangrijk:**
- Bouw per epic en per story
- Hergebruik bestaande componenten waar mogelijk
- Minimale aanpassingen aan bestaande code
- Database migraties: eerst aan Colin melden

---

## 4. Epics & Stories (Uitwerking)

### Epic D1 — Afspraak & Rapportage

**Epic Doel:** Werkende flow van diagnostiek-afspraak plannen tot rapportage schrijven met encounter koppeling.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E-D1.S1 | Intent patterns uitbreiden | Afspraak en rapportage intents herkend | ⏳ To Do | Swift foundation | 2 |
| E-D1.S2 | AfspraakBlock | Patiënt, datum/tijd, type, encounter_id terug | ⏳ To Do | E-D1.S1 | 5 |
| E-D1.S3 | RapportageBlock uitbreiden | Encounter_id koppeling, type "diagnostiek" | ⏳ To Do | E-D1.S2 | 4 |

**Technical Notes:**

```typescript
// E-D1.S1: Intent patterns toevoegen aan lib/swift/intent-classifier.ts
afspraak_maken: [
  /^afspraak\s+(diagnostiek|behandeling)\s+(\w+)/i,
  /^plan\s+(\w+)\s+(morgen|vandaag|volgende week)/i,
  /^afspraak\s+(\w+)\s+(morgen|vandaag)\s+(\d{1,2}:\d{2})/i,
],

rapportage: [
  /^rapportage\s+(diagnostiek|behandeling)\s+(\w+)/i,
  /^gesprek gehad met\s+(\w+)/i,
  /^verslag\s+(\w+)/i,
],

// E-D1.S2: AfspraakBlock
// components/swift/blocks/afspraak-block.tsx
// Hergebruik: app/epd/agenda/components/appointment-modal.tsx
// Aanpassingen:
// - Prefill vanuit intent (patient, date, time, type)
// - Dark theme styling (Swift context)
// - Encounter_id teruggeven via callback
// - Vereenvoudigde UI (geen linked reports sectie)

// E-D1.S3: RapportageBlock uitbreiden
// components/swift/blocks/rapportage-block.tsx
// Hergebruik: app/epd/patients/[id]/rapportage/components/report-composer.tsx
// Aanpassingen:
// - Encounter_id in prefill
// - Type "diagnostiek" toevoegen aan report types
// - Encounter link tonen indien gekoppeld
```

**API Routes:**

```typescript
// E-D1.S2: Appointments API
// app/api/appointments/route.ts
export async function POST(request: NextRequest) {
  // Wrapper rond app/epd/agenda/actions.ts createEncounter
  // Retourneert encounter_id voor volgende stap
}

// E-D1.S3: Reports API uitbreiden
// app/api/reports/route.ts (bestaand)
// Uitbreiden met encounter_id parameter
```

---

### Epic D2 — Diagnose Beheer

**Epic Doel:** Werkende diagnose overzicht en diagnose aanmaken/bijstellen met ICD-10 zoeker.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E-D2.S1 | Intent patterns uitbreiden | Diagnose intents herkend | ⏳ To Do | Swift foundation | 2 |
| E-D2.S2 | DiagnoseBlock | Overzicht diagnoses, filter actief/inactief | ⏳ To Do | E-D2.S1 | 3 |
| E-D2.S3 | DiagnoseFormBlock | ICD-10 zoeker, type, status, ernst | ⏳ To Do | E-D2.S2 | 5 |

**Technical Notes:**

```typescript
// E-D2.S1: Intent patterns toevoegen
diagnose_bekijken: [
  /^diagnose\s+(\w+)/i,
  /^diagnoses van\s+(\w+)/i,
  /^wat zijn de diagnoses/i,
],

diagnose_toevoegen: [
  /^diagnose toevoegen\s+(\w+)\s+([A-Z]\d+\.\d+)/i,
  /^(\w+)\s+heeft\s+([A-Z]\d+\.\d+)/i,
  /^diagnose\s+(\w+)\s+([A-Z]\d+\.\d+)/i,
],

diagnose_wijzigen: [
  /^diagnose wijzigen\s+(\w+)/i,
  /^diagnose bijstellen/i,
],

// E-D2.S2: DiagnoseBlock
// components/swift/blocks/diagnose-block.tsx
// Hergebruik logica van: app/epd/patients/[id]/diagnose/page.tsx
// Aanpassingen:
// - Swift styling (dark theme)
// - Filter tabs: Actief / Inactief / Alle
// - Klik op diagnose → DiagnoseFormBlock (edit mode)
// - "Nieuwe diagnose" knop → DiagnoseFormBlock (create mode)

// E-D2.S3: DiagnoseFormBlock
// components/swift/blocks/diagnose-form-block.tsx
// Hergebruik: app/epd/patients/[id]/diagnose/components/diagnosis-detail-form.tsx
// Aanpassingen:
// - ICD-10 zoeker met fuzzy search (verbeteren)
// - Swift styling
// - Prefill vanuit intent (ICD-10 code)
// - Encounter_id koppeling (optioneel)
```

**API Routes:**

```typescript
// E-D2.S2 + E-D2.S3: Diagnoses API
// app/api/diagnoses/route.ts
export async function GET(request: NextRequest) {
  // GET /api/diagnoses/:patientId
  // Wrapper rond app/epd/patients/[id]/diagnose/actions.ts getPatientDiagnoses
}

export async function POST(request: NextRequest) {
  // POST /api/diagnoses
  // Wrapper rond app/epd/patients/[id]/diagnose/actions.ts createPatientDiagnosis
}

export async function PATCH(request: NextRequest) {
  // PATCH /api/diagnoses/:id
  // Wrapper rond app/epd/patients/[id]/diagnose/actions.ts updatePatientDiagnosis
}
```

---

## 5. Kwaliteit & Testplan

### 5.1 Test Types

| Test Type | Scope | Tools | Wanneer | Verantwoordelijke |
|-----------|-------|-------|---------|-------------------|
| Unit Tests | Intent patterns, entity extraction | Vitest | E-D1.S1, E-D2.S1 | Developer |
| Integration Tests | API endpoints | Vitest + MSW | E-D1.S2, E-D1.S3, E-D2.S3 | Developer |
| Component Tests | Blocks | React Testing Library | E-D1.S2, E-D1.S3, E-D2.S2, E-D2.S3 | Developer |
| Manual Tests | Complete workflow | Checklist | E-D2.S3 | QA / Developer |

### 5.2 Test Coverage Targets

| Area | Target | Reden |
|------|--------|-------|
| Intent patterns | 85%+ | Correcte intent herkenning |
| Entity extraction | 80%+ | Pre-fill correctheid |
| API routes | 80%+ | Data integrity |
| Block components | 60%+ | Belangrijkste flows |

### 5.3 Manual Test Checklist (Diagnostiek Workflow)

**Happy Flow:**
- [ ] "afspraak diagnostiek met jan morgen 10:00" → AfspraakBlock opent
- [ ] Afspraak opslaan → encounter_id teruggegeven
- [ ] "rapportage diagnostiek gesprek met jan" → RapportageBlock met encounter koppeling
- [ ] Rapportage opslaan → gekoppeld aan encounter
- [ ] "diagnose jan" → DiagnoseBlock met overzicht
- [ ] "diagnose toevoegen jan F41.1" → DiagnoseFormBlock met ICD-10 pre-filled
- [ ] Diagnose opslaan → toegevoegd aan overzicht
- [ ] Klik op diagnose → DiagnoseFormBlock (edit mode)
- [ ] Status wijzigen → diagnose bijgewerkt

**Error Scenarios:**
- [ ] Geen patiënt gevonden → ZoekenBlock
- [ ] Ongeldige datum → validatie fout
- [ ] ICD-10 code niet gevonden → validatie fout
- [ ] Encounter niet gevonden → rapportage zonder koppeling
- [ ] Network error → toast met retry

---

## 6. Demo & Presentatieplan

### 6.1 Demo Scenario

**Duur:** 5 minuten  
**Doelgroep:** Behandelaars, psychologen, psychiaters  
**Locatie:** Live op Vercel

**Flow:**

```
1. INTRO (30 sec)
   "Behandelaars besteden veel tijd aan administratie.
    Swift maakt diagnostiek-trajecten sneller."

2. AFSPRAAK PLANNEN (1 min)
   - Typ: "afspraak diagnostiek met jan morgen 10:00"
   - AfspraakBlock verschijnt voorgevuld
   - Opslaan → afspraak aangemaakt

3. RAPPORTAGE SCHRIJVEN (1.5 min)
   - Typ: "rapportage diagnostiek gesprek met jan"
   - RapportageBlock verschijnt met encounter koppeling
   - Schrijf/dicteer verslag
   - Opslaan → gekoppeld aan afspraak

4. DIAGNOSE STELLEN (2 min)
   - Typ: "diagnose jan"
   - DiagnoseBlock toont overzicht
   - Typ: "diagnose toevoegen jan F41.1"
   - DiagnoseFormBlock met ICD-10 pre-filled
   - Vul type, status, ernst in
   - Opslaan → diagnose toegevoegd

5. AFSLUITING (20 sec)
   - Complete flow in 5 minuten
   - Vragen
```

### 6.2 Backup Plan

| Probleem | Oplossing |
|----------|-----------|
| Internet issues | Localhost met demo data |
| AI API down | Pre-cached responses |
| Encounter niet gevonden | Demo met pre-made encounter |
| Complete failure | Video recording |

---

## 7. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| Hergebruik componenten complex | Middel | Hoog | Stapsgewijs aanpassen, tests per stap | Dev |
| ICD-10 zoeker niet accuraat | Middel | Middel | Fuzzy search verbeteren, externe API optie | Dev |
| Encounter koppeling faalt | Laag | Middel | Duidelijke UX, optionele koppeling | Dev |
| Datum parsing onnauwkeurig | Middel | Laag | Fallback naar date picker | Dev |
| Bestaande code breaking changes | Laag | Hoog | Wrapper pattern, geen directe wijzigingen | Dev |

---

## 8. Sprint Planning

### Sprint 1 (Week 1): Afspraak & Rapportage
- E-D1.S1: Intent patterns uitbreiden (2 SP)
- E-D1.S2: AfspraakBlock (5 SP)
- E-D1.S3: RapportageBlock uitbreiden (4 SP)
- **Deliverable:** Afspraak en rapportage flow werkend

### Sprint 2 (Week 2): Diagnose Beheer
- E-D2.S1: Intent patterns uitbreiden (2 SP)
- E-D2.S2: DiagnoseBlock (3 SP)
- E-D2.S3: DiagnoseFormBlock (5 SP)
- Bug fixes + demo prep
- **Deliverable:** Complete diagnostiek workflow werkend

---

## 9. Definition of Done

Een story is **Done** wanneer:
- [ ] Code geschreven en werkend
- [ ] TypeScript types correct
- [ ] Component responsive (mobile + desktop)
- [ ] Error states afgehandeld
- [ ] Hergebruik bestaande code geïmplementeerd
- [ ] Geen breaking changes in bestaande code
- [ ] Getest in Chrome + Safari
- [ ] Demo scenario werkt

Een epic is **Done** wanneer:
- [ ] Alle stories Done
- [ ] Integration test passed
- [ ] Complete workflow werkt end-to-end

---

## 10. Referenties

### Project Documenten
- FO Diagnostiek: `docs/swift/swift-fo-diagnostiek-workflow.md`
- FO Algemeen: `docs/swift/swift-fo-ai.md`
- Bouwplan Swift: `docs/swift/bouwplan-swift-v1.md`
- UX: `docs/swift/swift-ux-v2.1.md`

### Bestaande Code Referenties (Hergebruik)

| Component | Locatie | Hergebruik % | Aanpassingen |
|-----------|---------|--------------|-------------|
| Appointment Modal | `app/epd/agenda/components/appointment-modal.tsx` | 80% | Prefill, dark theme, encounter_id callback |
| Report Composer | `app/epd/patients/[id]/rapportage/components/report-composer.tsx` | 80% | Encounter koppeling, type "diagnostiek" |
| Diagnose Page | `app/epd/patients/[id]/diagnose/page.tsx` | 70% | Overzicht logica, Swift styling |
| Diagnose Form | `app/epd/patients/[id]/diagnose/components/diagnosis-detail-form.tsx` | 80% | ICD-10 zoeker verbeteren, Swift styling |
| Diagnose Actions | `app/epd/patients/[id]/diagnose/actions.ts` | 90% | Direct hergebruik via API wrapper |
| Encounter Actions | `app/epd/agenda/actions.ts` | 90% | Direct hergebruik via API wrapper |

### External
- ICD-10 codes: https://www.who.int/standards/classifications/classification-of-diseases
- FHIR Encounter: https://www.hl7.org/fhir/encounter.html
- FHIR Condition: https://www.hl7.org/fhir/condition.html

---

## 11. Glossary & Abbreviations

| Term | Betekenis |
|------|-----------|
| Encounter | Afspraak/contactmoment (FHIR term) |
| Condition | Diagnose (FHIR term) |
| ICD-10 | International Classification of Diseases versie 10 |
| Hoofddiagnose | Primaire diagnose |
| Nevendiagnose | Secundaire diagnose |
| Clinical Status | Status van diagnose (actief, inactief, resolved, etc.) |
| Severity | Ernst van diagnose (mild, matig, ernstig) |

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 23-12-2024 | Claude | Initiële versie - Apart bouwplan voor diagnostiek workflow |

