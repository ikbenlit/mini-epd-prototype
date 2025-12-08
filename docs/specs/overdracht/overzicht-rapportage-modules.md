# Overzicht Rapportage Modules

**Versie:** 1.0
**Datum:** 07-12-2024
**Status:** Actueel overzicht van de huidige implementatie

---

## 1. Drie Rapportage Modules

Het EPD heeft drie verschillende modules voor het vastleggen en delen van patiëntinformatie:

| Module | Doel | Gebruiker | Route |
|--------|------|-----------|-------|
| **Rapportage** | Behandelinhoudelijke verslagen (decursus) | Arts, behandelaar | `/epd/patients/[id]/rapportage` |
| **Dagregistratie** | Operationele verpleegkundige notities | Verpleegkundige | `/epd/dagregistratie` |
| **Overdracht** | Samenvatting voor dienstoverdracht | Verpleegkundige | `/epd/overdracht` |

---

## 2. Rapportage Module (Decursus)

### Doel
Behandelinhoudelijke verslaglegging in het patiëntdossier. Dit is het "officiële" behandelverloop.

### Route
`/epd/patients/[id]/rapportage`

### Kenmerken
- Per patiënt (vanuit patiëntdossier)
- Verschillende rapportage types: voortgang, observatie, evaluatie, etc.
- Gestructureerde invoer met templates
- Koppeling aan encounters/contactmomenten
- Onderdeel van het medisch dossier
- Spraak-naar-tekst ondersteuning

### UI Structuur
```
┌─────────────────────────────────────────────────────────────┐
│ Rapportage - [Patiëntnaam]                                  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────────────────┐ │
│ │ Quick Actions       │ │ Composer                        │ │
│ │ [Voortgang]         │ │ Type: Voortgang                 │ │
│ │ [Observatie]        │ │ ┌─────────────────────────────┐ │ │
│ │ [Evaluatie]         │ │ │ Tekst invoer...             │ │ │
│ │ ...                 │ │ │                             │ │ │
│ └─────────────────────┘ │ └─────────────────────────────┘ │ │
│                         │ [Opslaan]                       │ │
│ ┌─────────────────────┐ └─────────────────────────────────┘ │
│ │ Timeline            │                                     │
│ │ ─────────────────── │                                     │
│ │ 14:30 Voortgang     │                                     │
│ │ 10:15 Observatie    │                                     │
│ │ Gisteren            │                                     │
│ │ 16:00 Evaluatie     │                                     │
│ └─────────────────────┘                                     │
└─────────────────────────────────────────────────────────────┘
```

### Data
- Tabel: `reports`
- Velden: `patient_id`, `type`, `content`, `encounter_id`, `created_at`, `created_by`

---

## 3. Dagregistratie Module (Nursing Logs)

### Doel
Snelle operationele notities tijdens de dienst. Korte registraties van gebeurtenissen die niet in het behandelverloop horen maar wel relevant kunnen zijn voor overdracht.

### Routes
| Route | Beschrijving |
|-------|--------------|
| `/epd/dagregistratie` | **Ronde-view** - Alle patiënten, snel wisselen |
| `/epd/dagregistratie/[patientId]` | **Per patiënt** - Vanuit overdracht detail |

### Kenmerken
- Korte notities (max 500 karakters)
- Categorieën: Medicatie, ADL, Gedrag, Incident, Observatie
- Tijdstip aanpasbaar
- **Overdracht markering** - checkbox om te bepalen of notitie in overdracht komt
- Periode selector (vandaag, gisteren, 3 dagen, 7 dagen)

### UI Structuur - Ronde View
```
┌─────────────────────────────────────────────────────────────┐
│ [← Overdracht]                          [Periode: Vandaag ▼]│
│                                                             │
│ Dagregistratie Ronde                                        │
│ Zaterdag 7 december 2024 • 3 patiënten                      │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────┐ ┌───────────────────┐ │
│ │ Patiënt: [Jan de Vries (3)    ▼]  │ │ Ronde overzicht   │ │
│ │                                   │ │ ───────────────── │ │
│ │ ┌─ Nieuwe notitie ──────────────┐ │ │ ● Jan de Vries  3 │ │
│ │ │ [Med][ADL][Gedr][Inc][Obs]    │ │ │ ○ Maria Jansen  1 │ │
│ │ │ [09:30] [Notitie...]    [+]   │ │ │ ○ Piet Bakker   — │ │
│ │ │ [✓ Opnemen in overdracht]     │ │ │                   │ │
│ │ └───────────────────────────────┘ │ │                   │ │
│ │                                   │ │                   │ │
│ │ ┌─ Notities vandaag (3) ────────┐ │ │                   │ │
│ │ │ 14:30 [Medicatie] Insuline  ✓ │ │ │                   │ │
│ │ │ 12:00 [ADL] Hulp bij douchen  │ │ │                   │ │
│ │ │ 09:15 [Observatie] Rustig     │ │ │                   │ │
│ │ └───────────────────────────────┘ │ │                   │ │
│ └───────────────────────────────────┘ └───────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### UI Structuur - Per Patiënt
```
┌─────────────────────────────────────────────────────────────┐
│ [← Terug naar patiënt]              [Naar overdracht →]     │
│                                                             │
│ Dagregistratie                       [Periode: Vandaag ▼]   │
│ Jan de Vries (78 jaar) • zaterdag 7 december 2024           │
├─────────────────────────────────────────────────────────────┤
│ ┌─ Nieuwe notitie ────────────────────────────────────────┐ │
│ │ Categorie: [Med] [ADL] [Gedrag] [Incident] [Observatie] │ │
│ │ Tijdstip:  [09:30 ▼]                                    │ │
│ │ Notitie:   [......................................]     │ │
│ │ [✓ Opnemen in overdracht]              [+ Toevoegen]    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Samenvatting ──────────────────────────────────────────┐ │
│ │ [3] Notities  [1] Voor overdracht  [0] Incidenten       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Notities (3) ──────────────────────────────────────────┐ │
│ │ 14:30 [Medicatie] Insuline toegediend         ✓ [✎][🗑] │ │
│ │ 12:00 [ADL] Hulp bij douchen                    [✎][🗑] │ │
│ │ 09:15 [Observatie] Rustige nacht gehad          [✎][🗑] │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data
- Tabel: `nursing_logs`
- Velden: `patient_id`, `category`, `content`, `timestamp`, `shift_date`, `include_in_handover`, `created_by`

---

## 4. Overdracht Module

### Doel
Gestructureerd overzicht voor dienstoverdracht. Combineert informatie uit verschillende bronnen tot een samenvatting.

### Routes
| Route | Beschrijving |
|-------|--------------|
| `/epd/overdracht` | Overzicht alle patiënten met activiteit |
| `/epd/overdracht/[patientId]` | Detail per patiënt met AI-samenvatting |

### Kenmerken
- Automatisch overzicht van patiënten met recente activiteit
- Alert badges (hoog risico, afwijkende vitals, gemarkeerde notities)
- Informatie blokken: Vitals, Rapportages, Dagnotities, Risico's
- **AI-gegenereerde samenvatting** met bronverwijzingen

### UI Structuur - Overzicht
```
┌─────────────────────────────────────────────────────────────┐
│ Overdracht                              [Dagregistratie →]  │
│ Zaterdag 7 december 2024 • 3 patiënten                      │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ Jan de Vries    │ │ Maria Jansen    │ │ Piet Bakker     │ │
│ │ 78 jaar, M      │ │ 65 jaar, V      │ │ 82 jaar, M      │ │
│ │                 │ │                 │ │                 │ │
│ │ [⚠ 1 hoog]      │ │ [1 notitie]     │ │ [2 afwijkend]   │ │
│ │ [2 afwijkend]   │ │                 │ │                 │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### UI Structuur - Detail
```
┌─────────────────────────────────────────────────────────────┐
│ [← Terug naar overzicht]                  [Dagregistratie →]│
│                                                             │
│ Jan de Vries                    [⚠ 1 hoog] [2 afwijkend]    │
│ 78 jaar • Man • Diabetes Mellitus                           │
│ Overdracht voor zaterdag 7 december                         │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────┐ ┌─────────────────────┐ │
│ │ Vitale functies                 │ │ AI Samenvatting     │ │
│ │ ───────────────────────────     │ │ ─────────────────── │ │
│ │ Bloeddruk: 145/92 ⚠ Hoog        │ │ [Genereer]          │ │
│ │ Pols: 78                        │ │                     │ │
│ │ Temp: 37.2                      │ │ Of gegenereerde     │ │
│ │ Glucose: 12.4 ⚠ Hoog            │ │ samenvatting met    │ │
│ ├─────────────────────────────────┤ │ bronverwijzingen    │ │
│ │ Rapportages (24u)               │ │                     │ │
│ │ ───────────────────────────     │ │ [1] Vitals          │ │
│ │ 14:00 Voortgangsrapportage      │ │ [2] Rapportage      │ │
│ │ 10:30 Observatie arts           │ │ [3] Dagnotitie      │ │
│ ├─────────────────────────────────┤ │                     │ │
│ │ Dagnotities (overdracht)        │ │                     │ │
│ │ ───────────────────────────     │ │                     │ │
│ │ 14:30 [Med] Insuline ✓          │ │                     │ │
│ │ + 2 andere (niet gemarkeerd)    │ │                     │ │
│ ├─────────────────────────────────┤ │                     │ │
│ │ Risico's                        │ │                     │ │
│ │ ───────────────────────────     │ │                     │ │
│ │ Valrisico: HOOG                 │ │                     │ │
│ │ Decubitus: Laag                 │ │                     │ │
│ └─────────────────────────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data bronnen
- `observations` (vitals)
- `reports` (behandelrapportages)
- `nursing_logs` (dagnotities met `include_in_handover = true`)
- `risk_assessments` (risico's)
- `conditions` (diagnoses)

---

## 5. Samenhang en Dataflow

### Hoe de modules samenwerken

```
┌──────────────────────────────────────────────────────────────────┐
│                        INVOER                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Rapportage Module              Dagregistratie Module            │
│  /epd/patients/[id]/rapportage  /epd/dagregistratie              │
│  ┌─────────────────────┐        ┌─────────────────────┐          │
│  │ Behandelverslagen   │        │ Operationele notities│          │
│  │ - Voortgang         │        │ - Medicatie          │          │
│  │ - Observatie        │        │ - ADL                │          │
│  │ - Evaluatie         │        │ - Gedrag             │          │
│  │ - Consult           │        │ - Incident           │          │
│  └──────────┬──────────┘        │ - Observatie         │          │
│             │                   └──────────┬───────────┘          │
│             │                              │                      │
│             │  ┌───────────────────────────┘                      │
│             │  │  [✓ Opnemen in overdracht]                       │
│             │  │                                                  │
│             ▼  ▼                                                  │
├──────────────────────────────────────────────────────────────────┤
│                        UITVOER                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Overdracht Module                                               │
│  /epd/overdracht/[patientId]                                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│  │  │ Vitals      │ │ Rapportages │ │ Dagnotities │           │ │
│  │  │ (24u)       │ │ (24u)       │ │ (gemarkeerd)│           │ │
│  │  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘           │ │
│  │         │               │               │                   │ │
│  │         └───────────────┼───────────────┘                   │ │
│  │                         ▼                                   │ │
│  │              ┌─────────────────────┐                        │ │
│  │              │   AI Samenvatting   │                        │ │
│  │              │   met bronnen [1-n] │                        │ │
│  │              └─────────────────────┘                        │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Verschil Rapportage vs Dagregistratie

| Aspect | Rapportage | Dagregistratie |
|--------|------------|----------------|
| **Doel** | Behandelverloop (decursus) | Operationele registratie |
| **Lengte** | Lang, gedetailleerd | Kort (max 500 chars) |
| **Invoer** | Per patiënt | Per patiënt of ronde |
| **Structuur** | Rapportage types | Categorieën |
| **In overdracht** | Automatisch (24u) | Alleen als gemarkeerd |
| **Medisch dossier** | Ja | Nee (operationeel) |
| **Spraak-invoer** | Ja | Nee |

### Navigatie tussen modules

```
                    ┌─────────────────────┐
                    │ /epd/overdracht     │
                    │ (Patiëntenlijst)    │
                    └─────────┬───────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
    │ /epd/overdracht │ │ /epd/dag-   │ │ /epd/patients/  │
    │ /[patientId]    │ │ registratie │ │ [id]/rapportage │
    │ (Detail)        │ │ (Ronde)     │ │ (Decursus)      │
    └────────┬────────┘ └──────┬──────┘ └─────────────────┘
             │                 │
             │    ┌────────────┘
             ▼    ▼
    ┌─────────────────────┐
    │ /epd/dagregistratie │
    │ /[patientId]        │
    │ (Per patiënt)       │
    └─────────────────────┘
```

---

## 6. Componenten Overzicht

### Rapportage Module
| Component | Bestand | Functie |
|-----------|---------|---------|
| `RapportageWorkspaceV2` | `rapportage-workspace-v2.tsx` | Hoofdcontainer met panels |
| `ReportComposer` | `report-composer.tsx` | Invoer nieuwe rapportage |
| `QuickActions` | `quick-actions.tsx` | Type selectie knoppen |
| `ReportTimeline` | `report-timeline.tsx` | Tijdlijn van rapportages |
| `ReportViewEditModal` | `report-view-edit-modal.tsx` | Bekijk/bewerk modal |

### Dagregistratie Module
| Component | Bestand | Functie |
|-----------|---------|---------|
| `DagregistratieWorkspace` | `dagregistratie-workspace.tsx` | Ronde-view container |
| `PatientSelector` | `patient-selector.tsx` | Patiënt dropdown |
| `RondeOverview` | `ronde-overview.tsx` | Overzicht sidebar |
| `LogForm` | `log-form.tsx` | Notitie invoer |
| `LogList` | `log-list.tsx` | Notities lijst |
| `PeriodSelector` | `period-selector.tsx` | Periode dropdown |

### Overdracht Module
| Component | Bestand | Functie |
|-----------|---------|---------|
| `PatientGrid` | `patient-grid.tsx` | Patiënten kaarten grid |
| `PatientCard` | `patient-card.tsx` | Individuele patiënt kaart |
| `VitalsBlock` | `vitals-block.tsx` | Vitale functies blok |
| `ReportsBlock` | `reports-block.tsx` | Rapportages blok |
| `NursingLogsBlock` | `nursing-logs-block.tsx` | Dagnotities blok |
| `RisksBlock` | `risks-block.tsx` | Risico's blok |
| `AISummaryBlock` | `ai-summary-block.tsx` | AI samenvatting |

---

## 7. API Endpoints

| Endpoint | Methode | Module | Functie |
|----------|---------|--------|---------|
| `/api/reports` | GET, POST | Rapportage | CRUD rapportages |
| `/api/reports/[id]` | GET, PATCH, DELETE | Rapportage | Specifieke rapportage |
| `/api/nursing-logs` | GET, POST | Dagregistratie | CRUD nursing logs |
| `/api/nursing-logs/[id]` | PATCH, DELETE | Dagregistratie | Specifieke log |
| `/api/overdracht/patients` | GET | Overdracht | Patiënten met activiteit |
| `/api/overdracht/[patientId]` | GET | Overdracht | Detail data |
| `/api/overdracht/generate` | POST | Overdracht | AI samenvatting |

---

## 8. Database Tabellen

### reports
```sql
- id: uuid
- patient_id: uuid (FK)
- encounter_id: uuid (FK, nullable)
- type: text (voortgang, observatie, evaluatie, etc.)
- content: text
- created_at: timestamptz
- created_by: uuid (FK)
- deleted_at: timestamptz (soft delete)
```

### nursing_logs
```sql
- id: uuid
- patient_id: uuid (FK)
- category: text (medicatie, adl, gedrag, incident, observatie)
- content: text (max 500)
- timestamp: timestamptz
- shift_date: date (voor filtering)
- include_in_handover: boolean
- created_by: uuid (FK)
- created_at: timestamptz
```

---

## 9. Openstaande Punten

1. **Ronde/caseload**: Geen mechanisme om "mijn patiënten" te definiëren
2. **Autorisatie**: Alle gebruikers zien alle patiënten
3. **Afdelingen**: Geen afdeling/groep structuur
4. **Archivering**: Geen archivering van oude nursing logs
5. **Spraak-invoer**: Alleen bij rapportage, niet bij dagregistratie
