# Bouwplan — Agenda Module

**Projectnaam:** Mini-EPD Agenda Module
**Versie:** v1.0
**Datum:** 02-12-2024
**Auteur:** Colin

---

## 1. Doel en context

**Doel:** Een volledige agendafunctionaliteit bouwen voor het Mini-EPD systeem waarmee behandelaars afspraken kunnen plannen, beheren en koppelen aan EPD-documenten.

**Toelichting:** De agenda is een kernfunctionaliteit binnen elk EPD-systeem. Momenteel bestaat er alleen een placeholder pagina op `/epd/agenda`. Deze module bouwt voort op de bestaande `encounters` tabel (FHIR-compliant) en breidt deze uit met volledige kalenderfunctionaliteit en bidirectionele koppelingen met rapportages.

**Kernfunctionaliteiten:**
- Kalenderweergaven (dag/week/werkdagen)
- Afspraakbeheer (maken, verzetten, annuleren)
- Patiënt-selectie bij afspraken
- Koppeling afspraak ↔ verslag (bidirectioneel)

---

## 2. Uitgangspunten

### 2.1 Technische Stack

| Component | Technologie |
|-----------|-------------|
| **Frontend** | Next.js 14 (App Router) + React 18 + TypeScript |
| **UI Components** | shadcn/ui (Radix primitives) + Tailwind CSS |
| **Calendar Library** | FullCalendar (@fullcalendar/react) |
| **Datepicker** | shadcn/ui Calendar (bestaand) |
| **Database** | Supabase (PostgreSQL) |
| **Date Handling** | date-fns (al in project) |
| **State Management** | React Server Components + Server Actions |

### 2.2 Projectkaders

| Aspect | Waarde |
|--------|--------|
| **Scope** | MVP met uitbreidingsmogelijkheden |
| **Data** | Bestaande `encounters` tabel + uitbreiding `reports` |
| **Integratie** | Naadloos met bestaande patient/intake flows |
| **Gebruikers** | Behandelaars (practitioners) |

### 2.3 Programmeer Uitgangspunten

**Bestaande patronen volgen:**
- Server Actions voor mutaties (`actions.ts` per route)
- API routes voor complexe queries
- FHIR-compliant datastructuren
- shadcn/ui component styling

**Code Quality:**
- TypeScript strict mode
- Zod validatie voor alle inputs
- Error boundaries voor UI failures
- Optimistic updates waar mogelijk

---

## 3. Epics & Stories Overzicht

| Epic ID | Titel | Doel | Status | Stories |
|---------|-------|------|--------|---------|
| E0 | Database & Types | Schema uitbreiden, types genereren | ✅ Done | 3 |
| E1 | Calendar Views | Dag/week/werkdagen weergaven | ✅ Done | 4 |
| E2 | Afspraak CRUD | Maken, bewerken, annuleren | ✅ Done | 5 |
| E3 | Patiënt Integratie | Selectie, zoeken, quick-create | ✅ Done | 3 |
| E4 | EPD Koppeling | Verslag ↔ Afspraak bidirectioneel | ✅ Done | 4 |
| E5 | Polish & Testing | UX verfijning, edge cases | ⏳ To Do | 3 |

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 — Database & Types

**Epic Doel:** Database schema uitbreiden voor report-encounter koppeling en TypeScript types updaten.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E0.S1 | Migration: encounter_id toevoegen aan reports | `encounter_id` en `intake_id` kolommen bestaan, foreign keys werken | ✅ | — | 2 |
| E0.S2 | Index toevoegen voor performance | `idx_reports_encounter`, `idx_encounters_period` indices bestaan | ✅ | E0.S1 | 1 |
| E0.S3 | TypeScript types regenereren | `database.types.ts` bevat nieuwe kolommen | ✅ | E0.S2 | 1 |

**Technical Notes:**
```sql
-- Migration E0.S1
ALTER TABLE reports
ADD COLUMN encounter_id UUID REFERENCES encounters(id) ON DELETE SET NULL,
ADD COLUMN intake_id UUID REFERENCES intakes(id) ON DELETE SET NULL;

-- Migration E0.S2
CREATE INDEX idx_reports_encounter ON reports(encounter_id);
CREATE INDEX idx_reports_intake ON reports(intake_id);
CREATE INDEX idx_encounters_period ON encounters(period_start, period_end);
CREATE INDEX idx_encounters_practitioner ON encounters(practitioner_id);
```

---

### Epic 1 — Calendar Views

**Epic Doel:** Interactieve kalenderweergaven met dag, week en werkdagen views.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E1.S1 | FullCalendar installatie & setup | Library geïnstalleerd, basis component rendert | ✅ | E0.S3 | 2 |
| E1.S2 | Dag view implementeren | Uurblokken 08:00-18:00, afspraken zichtbaar | ✅ | E1.S1 | 3 |
| E1.S3 | Week view implementeren | 7-dagen grid, drag-resize werkt | ✅ | E1.S2 | 3 |
| E1.S4 | Werkdagen view (ma-vr) | Filter voor weekend, business hours highlight | ✅ | E1.S3 | 2 |

**Technical Notes:**
```bash
pnpm add @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

**Component Structuur:**
```
app/epd/agenda/
├── page.tsx                 # Server component, data fetching
├── components/
│   ├── agenda-calendar.tsx  # FullCalendar wrapper (client)
│   ├── agenda-toolbar.tsx   # View switcher, date nav
│   ├── agenda-sidebar.tsx   # Mini calendar + filters
│   └── appointment-card.tsx # Event rendering
├── actions.ts               # Server actions
└── types.ts                 # Agenda-specific types
```

**Styling:**
- FullCalendar CSS overschrijven met Tailwind
- Consistent met shadcn/ui design tokens
- Dark mode support (later)

---

### Epic 2 — Afspraak CRUD

**Epic Doel:** Volledige afspraakbeheer functionaliteit.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E2.S1 | Afspraak aanmaken modal | Form met alle velden, validatie, opslaan werkt | ⏳ | E1.S2 | 5 |
| E2.S2 | Afspraak bewerken | Click op event → edit modal, wijzigingen opslaan | ⏳ | E2.S1 | 3 |
| E2.S3 | Afspraak verzetten (drag-drop) | Drag event naar nieuwe tijd, confirm dialog | ⏳ | E2.S2 | 3 |
| E2.S4 | Afspraak annuleren | Soft delete (status=cancelled), confirm dialog | ⏳ | E2.S2 | 2 |
| E2.S5 | Afspraak details view | Click voor volledige info, quick actions | ⏳ | E2.S2 | 2 |

**Appointment Modal Fields:**

| Veld | Type | Verplicht | Bron |
|------|------|-----------|------|
| Patiënt | Patient selector | Ja | patients tabel |
| Datum | Date picker | Ja | — |
| Starttijd | Time picker | Ja | — |
| Eindtijd | Time picker | Nee | — |
| Type | Select | Ja | encounter types |
| Locatie | Select | Nee | class_code |
| Behandelaar | Select | Ja | practitioners |
| Notities | Textarea | Nee | — |

**Appointment Types (type_code):**
- `intake` - Intakegesprek
- `behandeling` - Behandelsessie
- `follow-up` - Vervolggesprek
- `telefonisch` - Telefonisch contact
- `huisbezoek` - Huisbezoek
- `online` - Online consult
- `crisis` - Crisiscontact
- `overig` - Overig

**Status Flow:**
```
planned → in-progress → completed
    ↓
cancelled
```

---

### Epic 3 — Patiënt Integratie

**Epic Doel:** Naadloze patiëntselectie bij het maken van afspraken.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E3.S1 | Patient search component | Zoeken op naam, BSN, clientnummer | ⏳ | E2.S1 | 3 |
| E3.S2 | Recent patients dropdown | Laatste 5 patiënten snel selecteren | ⏳ | E3.S1 | 2 |
| E3.S3 | Quick patient info | Naam, geboortedatum, actieve intake tonen | ⏳ | E3.S2 | 2 |

**Patient Selector Component:**
```typescript
interface PatientSelectorProps {
  value?: string;                    // patient_id
  onChange: (patientId: string) => void;
  showRecentPatients?: boolean;
  allowCreate?: boolean;             // Future: quick create
}
```

---

### Epic 4 — EPD Koppeling

**Epic Doel:** Bidirectionele koppeling tussen afspraken en verslagen.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E4.S1 | Verslag maken vanuit afspraak | Button op appointment → report composer met encounter_id | ✅ | E2.S5 | 3 |
| E4.S2 | Afspraak koppelen vanuit verslag | In rapportage: link naar bestaande/nieuwe afspraak | ✅ | E4.S1 | 3 |
| E4.S3 | Gekoppelde items tonen | In afspraak details: linked reports zichtbaar | ✅ | E4.S2 | 2 |
| E4.S4 | Navigatie tussen afspraak ↔ verslag | Click-through links beide kanten | ✅ | E4.S3 | 2 |

**Integration Points:**

```
┌─────────────────┐                ┌─────────────────┐
│    Agenda       │                │   Rapportage    │
│                 │                │                 │
│  [Afspraak]     │───────────────▶│  [Verslag]      │
│   └─ + Verslag  │                │   └─ encounter  │
│                 │◀───────────────│   └─ + Koppel   │
└─────────────────┘                └─────────────────┘
        │                                  │
        ▼                                  ▼
┌─────────────────────────────────────────────────────┐
│                    encounters                        │
│  id, patient_id, period_start, period_end, ...      │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│                     reports                          │
│  id, patient_id, encounter_id, intake_id, ...       │
└─────────────────────────────────────────────────────┘
```

**Report Composer Updates:**
- Nieuwe prop: `encounterId?: string`
- Pre-fill patient_id vanuit encounter
- Toon encounter info (datum, type) in composer

---

### Epic 5 — Polish & Testing

**Epic Doel:** UX verfijning en edge case handling.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E5.S1 | Loading states & skeletons | Alle async operaties hebben loading feedback | ⏳ | E4.S4 | 2 |
| E5.S2 | Error handling | User-friendly errors, retry mogelijkheden | ⏳ | E5.S1 | 2 |
| E5.S3 | Responsive design | Mobile-friendly, touch gestures | ⏳ | E5.S2 | 3 |

---

## 5. Kwaliteit & Testplan

### Test Types

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit Tests | Date utilities, validators | Vitest |
| Integration | API endpoints, database | Playwright |
| Smoke Tests | Kritieke flows | Manual |
| Visual | UI consistency | Manual |

### Manual Test Checklist

**Afspraak Flow:**
- [ ] Nieuwe afspraak aanmaken met alle velden
- [ ] Afspraak bewerken (tijd, type, notities)
- [ ] Afspraak verzetten via drag-drop
- [ ] Afspraak annuleren met bevestiging
- [ ] Patiënt zoeken en selecteren

**Calendar Views:**
- [ ] Dag view toont correcte uren
- [ ] Week view toont 7 dagen
- [ ] Werkdagen view filtert weekend
- [ ] Navigatie (vorige/volgende) werkt
- [ ] Vandaag button springt naar huidige dag

**EPD Koppeling:**
- [ ] Verslag maken vanuit afspraak
- [ ] Afspraak koppelen vanuit verslag
- [ ] Gekoppelde items zijn zichtbaar
- [ ] Navigatie werkt beide kanten

---

## 6. Data Model

### Encounters (uitgebreid)

```typescript
interface Encounter {
  id: string;
  identifier: string;
  status: 'planned' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
  class_code: string;           // AMB, VR, HH (home health)
  class_display: string;
  type_code: string;            // intake, behandeling, follow-up, etc.
  type_display: string;
  patient_id: string;
  practitioner_id: string;
  organization_id?: string;
  period_start: string;         // ISO datetime
  period_end?: string;
  notes?: string;
  intake_id?: string;
  created_at: string;
  updated_at: string;
}
```

### Reports (uitgebreid)

```typescript
interface Report {
  id: string;
  patient_id: string;
  created_by?: string;
  type: 'behandeladvies' | 'vrije_notitie' | 'intake' | 'voortgang' | 'crisis' | 'contact';
  content: string;
  encounter_id?: string;        // NEW: koppeling met afspraak
  intake_id?: string;           // NEW: koppeling met intake
  // ... existing fields
}
```

### Calendar Event (voor FullCalendar)

```typescript
interface CalendarEvent {
  id: string;
  title: string;                // Patient naam
  start: Date;
  end?: Date;
  extendedProps: {
    encounter: Encounter;
    patient: Patient;
    linkedReports: Report[];
  };
  backgroundColor?: string;     // Based on type
  borderColor?: string;
}
```

---

## 7. API Endpoints

### Nieuwe Endpoints

| Methode | Endpoint | Beschrijving |
|---------|----------|--------------|
| GET | `/api/agenda/encounters` | Haal afspraken op (met filters) |
| POST | `/api/agenda/encounters` | Nieuwe afspraak aanmaken |
| PUT | `/api/agenda/encounters/[id]` | Afspraak bewerken |
| PATCH | `/api/agenda/encounters/[id]/cancel` | Afspraak annuleren |
| GET | `/api/agenda/encounters/[id]/reports` | Gekoppelde verslagen |

### Query Parameters (GET encounters)

```typescript
interface EncounterFilters {
  start_date: string;           // ISO date
  end_date: string;
  practitioner_id?: string;
  patient_id?: string;
  status?: string[];
  type_code?: string[];
}
```

---

## 8. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| FullCalendar styling conflicten | Middel | Middel | CSS isolation, custom theme |
| Performance bij veel afspraken | Laag | Hoog | Pagination, date range filtering |
| Timezone issues | Middel | Hoog | Altijd UTC opslaan, lokaal tonen |
| Drag-drop UX op mobile | Middel | Middel | Touch-friendly alternatives |
| Concurrent edits | Laag | Middel | Optimistic locking, conflict resolution |

---

## 9. UI/UX Specificaties

### Agenda Layout

```
┌────────────────────────────────────────────────────────────────┐
│ EPD Header                                              [User] │
├────────┬───────────────────────────────────────────────────────┤
│        │  Agenda                          [+ Nieuwe Afspraak]  │
│  Nav   │───────────────────────────────────────────────────────│
│        │  [< Vorige] [Vandaag] [Volgende >]    [Dag|Week|Werk] │
│        │───────────────────────────────────────────────────────│
│        │  ┌──────────┐                                         │
│        │  │ December │  ┌─────────────────────────────────────┐│
│        │  │ 2024     │  │  Ma  │  Di  │  Wo  │  Do  │  Vr    ││
│        │  │ [Cal]    │  │──────┼──────┼──────┼──────┼────────││
│        │  └──────────┘  │ 08:00│      │      │      │        ││
│        │                │──────│ [Pnt]│      │      │        ││
│        │  Filters:      │ 09:00│      │ [Int]│      │        ││
│        │  □ Intakes     │──────│      │      │      │        ││
│        │  □ Behandeling │ 10:00│      │      │ [Beh]│        ││
│        │  □ Telefonisch │──────│      │      │      │        ││
│        │                │ ...  │      │      │      │        ││
│        │                └─────────────────────────────────────┘│
└────────┴───────────────────────────────────────────────────────┘
```

### Afspraak Card (in kalender)

```
┌─────────────────────┐
│ 09:00 - 10:00       │
│ ● Jan de Vries      │
│ Intakegesprek       │
│ [📝] [✏️]           │
└─────────────────────┘
```

### Afspraak Modal

```
┌─────────────────────────────────────────┐
│ Nieuwe Afspraak                    [X]  │
├─────────────────────────────────────────┤
│                                         │
│ Patiënt *                               │
│ ┌─────────────────────────────────────┐ │
│ │ 🔍 Zoek patiënt...                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Datum *              Tijd *             │
│ ┌──────────────┐    ┌──────┐ - ┌──────┐│
│ │ 02-12-2024   │    │09:00 │   │10:00 ││
│ └──────────────┘    └──────┘   └──────┘│
│                                         │
│ Type afspraak *                         │
│ ┌─────────────────────────────────────┐ │
│ │ Intakegesprek                    ▼  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Locatie                                 │
│ ┌─────────────────────────────────────┐ │
│ │ Praktijk                         ▼  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Notities                                │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│            [Annuleren]  [Opslaan]       │
└─────────────────────────────────────────┘
```

---

## 10. Referenties

**Interne Documenten:**
- FO Mini-EPD v1.2
- TO Mini-EPD v1.2
- Screening-Intake Bouwplan

**Libraries:**
- [FullCalendar React](https://fullcalendar.io/docs/react)
- [shadcn/ui Calendar](https://ui.shadcn.com/docs/components/calendar)
- [date-fns](https://date-fns.org/)

**Database:**
- `encounters` tabel (FHIR Encounter)
- `reports` tabel
- `patients` tabel
- `practitioners` tabel

---

## 11. Glossary

| Term | Betekenis |
|------|-----------|
| Encounter | FHIR term voor een contact/afspraak moment |
| period_start | Starttijd van een afspraak (ISO datetime) |
| class_code | Type locatie (AMB=ambulant, VR=virtueel, HH=thuis) |
| type_code | Type afspraak (intake, behandeling, etc.) |
| Bidirectioneel | Koppeling werkt beide kanten op |

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 02-12-2024 | Colin | Initiële versie |
