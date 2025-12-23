# Taken & Vragen Analyse: EPD Functionaliteit

**Document:** Wat moet de nieuwe UI kunnen?
**Datum:** december 2024
**Doel:** Inventarisatie van alle taken en vragen die het EPD beantwoordt

---

## 1. Overzicht Huidige EPD Modules

Op basis van de codebase analyse:

```
/epd
├── dashboard/           # Overzicht
├── patients/            # Patiëntbeheer
│   ├── [id]/
│   │   ├── basisgegevens/   # NAW, contactgegevens
│   │   ├── intakes/         # Intake trajecten
│   │   │   └── [intakeId]/
│   │   │       ├── anamnese/      # Voorgeschiedenis
│   │   │       ├── examination/   # Onderzoek
│   │   │       ├── diagnosis/     # Diagnose (ICD-10)
│   │   │       ├── risk/          # Risicotaxatie
│   │   │       ├── kindcheck/     # Kindcheck
│   │   │       ├── contacts/      # Contactpersonen
│   │   │       ├── behandeladvies/# Behandeladvies
│   │   │       └── rom/           # ROM vragenlijsten
│   │   ├── diagnose/        # Diagnosebeheer
│   │   ├── behandelplan/    # Behandelplan
│   │   ├── rapportage/      # Rapportages
│   │   └── screening/       # Screening
├── verpleegrapportage/  # Verpleegkundig overzicht
│   ├── overdracht/      # Overdrachtsrapportage
│   └── rapportage/      # Dagrapportage per patiënt
├── agenda/              # Afspraken
├── clients/             # Client overzicht
└── reports/             # Rapportages overzicht
```

---

## 2. Categorieën van Vragen

### 2.1 ZOEKEN & VINDEN (Wie/Wat/Waar)

| Vraag | Huidige UI | Data |
|-------|------------|------|
| Wie is [naam]? | patients/ → zoeken | patients |
| Waar is [patiënt] opgenomen? | patients/[id] | encounters |
| Welke diagnoses heeft [patiënt]? | patients/[id]/diagnose | conditions |
| Wat is het behandelplan van [patiënt]? | patients/[id]/behandelplan | care_plans |
| Welke medicatie gebruikt [patiënt]? | - (nog niet) | - |
| Wie zijn de contactpersonen van [patiënt]? | intakes/[id]/contacts | contacts |
| Wat is de risicoscore van [patiënt]? | intakes/[id]/risk | risk_assessments |

### 2.2 RAPPORTEREN & DOCUMENTEREN (Vastleggen)

| Taak | Huidige UI | Data |
|------|------------|------|
| Dagnotitie maken | verpleegrapportage/rapportage | reports (type: verpleegkundig) |
| Rapportage schrijven | patients/[id]/rapportage | reports |
| Intake vastleggen | patients/[id]/intakes/new | intakes |
| Anamnese invullen | intakes/[id]/anamnese | anamneses |
| Onderzoek documenteren | intakes/[id]/examination | examinations |
| Diagnose toevoegen | patients/[id]/diagnose | conditions |
| Behandeladvies schrijven | intakes/[id]/behandeladvies | - |
| Risicotaxatie invullen | intakes/[id]/risk | risk_assessments |
| Kindcheck uitvoeren | intakes/[id]/kindcheck | - |

### 2.3 SAMENVATTEN & OVERDRAGEN (Communiceren)

| Taak | Huidige UI | Data |
|------|------------|------|
| Overdracht maken | verpleegrapportage/overdracht | AI samenvatting |
| Samenvatting van vandaag | - | reports (shift_date) |
| Wat is er gebeurd met [patiënt]? | verpleegrapportage/rapportage | reports, vitals |
| Aandachtspunten voor collega | overdracht | include_in_handover |

### 2.4 PLANNEN & ORGANISEREN (Agenda)

| Taak | Huidige UI | Data |
|------|------------|------|
| Mijn afspraken vandaag | agenda/ | appointments |
| Afspraken van [patiënt] | - | appointments |
| Afspraak inplannen | agenda/ (FullCalendar) | appointments |
| Wie zie ik deze week? | agenda/ | appointments |

### 2.5 BEHANDELEN & VOLGEN (Zorgpad)

| Taak | Huidige UI | Data |
|------|------------|------|
| Behandelplan opstellen | patients/[id]/behandelplan | care_plans |
| Doelen formuleren | behandelplan | care_plans.goals |
| Voortgang evalueren | - | - |
| ROM afnemen | intakes/[id]/rom | - |

---

## 3. Frequentie & Prioriteit Matrix

### 3.1 Hoogfrequent (meerdere keren per dag)

| Taak | Freq/dag | Huidige klikken | Ephemeral target |
|------|----------|-----------------|------------------|
| **Dagnotitie maken** | 10-20x | 5-8 | 1 zin |
| **Patiënt zoeken** | 15-20x | 3-5 | 1 zin |
| **Laatste notities bekijken** | 10-15x | 4-6 | 1 zin |
| **Overdracht maken** | 2-3x | 8-12 | 1 zin |

### 3.2 Middenfrequent (dagelijks)

| Taak | Freq/dag | Huidige klikken | Ephemeral target |
|------|----------|-----------------|------------------|
| **Rapportage schrijven** | 3-5x | 6-10 | 1 zin + dicteren |
| **Diagnose bekijken** | 3-5x | 4-6 | 1 zin |
| **Behandelplan raadplegen** | 2-3x | 4-6 | 1 zin |
| **Afspraken bekijken** | 2-3x | 3-4 | 1 zin |

### 3.3 Laagfrequent (wekelijks/maandelijks)

| Taak | Frequentie | Huidige klikken | Ephemeral target |
|------|------------|-----------------|------------------|
| **Intake starten** | 1x/week | 10-15 | Wizard |
| **Behandelplan maken** | 1x/maand | 15-20 | Wizard + AI |
| **Diagnose toevoegen** | 1x/week | 6-8 | 1 zin |
| **Risicotaxatie** | 1x/maand | 10-15 | Wizard |

---

## 4. Mapping naar Ephemeral UI Bouwblokken

### 4.1 Must Have (MVP)

| Bouwblok | Beantwoordt vragen | Prioriteit |
|----------|-------------------|------------|
| **Dagnotitie** | "notitie voor jan: medicatie gegeven" | P1 |
| **Zoeken** | "wie is jan", "zoek marie" | P1 |
| **Overdracht** | "overdracht maken", "samenvatting dienst" | P1 |

### 4.2 Should Have

| Bouwblok | Beantwoordt vragen | Prioriteit |
|----------|-------------------|------------|
| **Rapportage** | "gesprek gehad met jan", "rapportage maken" | P2 |
| **Patiënt Info** | "diagnoses van jan", "behandelplan jan" | P2 |
| **Agenda** | "mijn afspraken", "wanneer zie ik jan" | P2 |

### 4.3 Could Have

| Bouwblok | Beantwoordt vragen | Prioriteit |
|----------|-------------------|------------|
| **Behandelplan** | "plan opstellen voor jan" | P3 |
| **Diagnose** | "diagnose toevoegen: F41.1" | P3 |
| **Risico** | "risicotaxatie jan" | P3 |
| **Intake** | "nieuwe intake starten" | P3 |

---

## 5. Intent Classificatie Mapping

### 5.1 Schrijf-intents (Writer)

```
┌─────────────────────────────────────────────────────────────┐
│ INTENT: dagnotitie                                          │
├─────────────────────────────────────────────────────────────┤
│ Trigger patterns:                                           │
│ • "notitie [patient]"                                       │
│ • "dagnotitie"                                              │
│ • "[patient] medicatie gegeven"                             │
│ • "[patient] heeft gegeten"                                 │
│ • "incident bij [patient]"                                  │
│                                                             │
│ Entities:                                                   │
│ • patient_name: string                                      │
│ • category: medicatie|adl|gedrag|incident|observatie        │
│ • content: string (optioneel)                               │
│                                                             │
│ Pre-fill:                                                   │
│ • Patient selector                                          │
│ • Category dropdown                                         │
│ • Tekstveld                                                 │
│ • include_in_handover checkbox                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ INTENT: rapportage                                          │
├─────────────────────────────────────────────────────────────┤
│ Trigger patterns:                                           │
│ • "rapportage [patient]"                                    │
│ • "gesprek gehad met [patient]"                             │
│ • "verslag maken"                                           │
│ • "sessie met [patient]"                                    │
│                                                             │
│ Entities:                                                   │
│ • patient_name: string                                      │
│ • report_type: voortgang|observatie|contact|crisis          │
│                                                             │
│ Pre-fill:                                                   │
│ • Patient selector                                          │
│ • Type dropdown                                             │
│ • Rich text editor                                          │
│ • AI structureren knop                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ INTENT: diagnose_toevoegen                                  │
├─────────────────────────────────────────────────────────────┤
│ Trigger patterns:                                           │
│ • "diagnose [patient]: [code]"                              │
│ • "diagnose toevoegen"                                      │
│ • "[patient] heeft [diagnose]"                              │
│                                                             │
│ Entities:                                                   │
│ • patient_name: string                                      │
│ • icd10_code: string (optioneel)                            │
│ • diagnosis_text: string (optioneel)                        │
│                                                             │
│ Pre-fill:                                                   │
│ • Patient selector                                          │
│ • ICD-10 zoeken combobox                                    │
│ • Clinical status                                           │
│ • Severity                                                  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Lees-intents (Reader)

```
┌─────────────────────────────────────────────────────────────┐
│ INTENT: zoeken                                              │
├─────────────────────────────────────────────────────────────┤
│ Trigger patterns:                                           │
│ • "zoek [naam]"                                             │
│ • "wie is [naam]"                                           │
│ • "vind [naam]"                                             │
│ • "[naam]"  (als geen andere intent matcht)                 │
│                                                             │
│ Entities:                                                   │
│ • search_query: string                                      │
│                                                             │
│ Output:                                                     │
│ • PatientCards met quick actions                            │
│ • Selectie → set active patient                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ INTENT: patient_info                                        │
├─────────────────────────────────────────────────────────────┤
│ Trigger patterns:                                           │
│ • "diagnoses van [patient]"                                 │
│ • "behandelplan [patient]"                                  │
│ • "info [patient]"                                          │
│ • "dossier [patient]"                                       │
│ • "risico's [patient]"                                      │
│                                                             │
│ Entities:                                                   │
│ • patient_name: string                                      │
│ • info_type: diagnoses|behandelplan|risico|alles            │
│                                                             │
│ Output:                                                     │
│ • Collapsible info cards                                    │
│ • Quick actions (bewerken, toevoegen)                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ INTENT: overdracht                                          │
├─────────────────────────────────────────────────────────────┤
│ Trigger patterns:                                           │
│ • "overdracht"                                              │
│ • "overdracht maken"                                        │
│ • "samenvatting dienst"                                     │
│ • "wat is er gebeurd vandaag"                               │
│                                                             │
│ Entities:                                                   │
│ • time_range: afgelopen 8 uur (default)                     │
│ • patient_filter: string[] (optioneel)                      │
│                                                             │
│ Output:                                                     │
│ • AI-samenvatting per patiënt                               │
│ • Bronverwijzingen                                          │
│ • Aandachtspunten                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ INTENT: agenda                                              │
├─────────────────────────────────────────────────────────────┤
│ Trigger patterns:                                           │
│ • "mijn afspraken"                                          │
│ • "afspraken vandaag"                                       │
│ • "wanneer zie ik [patient]"                                │
│ • "planning deze week"                                      │
│                                                             │
│ Entities:                                                   │
│ • date_range: vandaag|deze week|datum                       │
│ • patient_name: string (optioneel)                          │
│                                                             │
│ Output:                                                     │
│ • Afsprakenlijst                                            │
│ • Quick action: nieuwe afspraak                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Data Requirements per Intent

### 6.1 Database Tabellen per Bouwblok

| Bouwblok | Read | Write |
|----------|------|-------|
| **Dagnotitie** | patients | reports |
| **Zoeken** | patients, conditions, care_plans | - |
| **Rapportage** | patients, intakes | reports |
| **Overdracht** | patients, reports, vitals, risk_assessments | - |
| **Patient Info** | patients, conditions, care_plans, risk_assessments | - |
| **Diagnose** | patients, conditions | conditions |
| **Agenda** | patients, appointments, practitioners | appointments |
| **Behandelplan** | patients, conditions, intakes, anamneses | care_plans |

### 6.2 API Routes per Bouwblok

| Bouwblok | Bestaande API | Nieuw nodig? |
|----------|---------------|--------------|
| **Dagnotitie** | POST /api/reports | Nee |
| **Zoeken** | GET /api/patients/search | Ja (fuzzy) |
| **Rapportage** | POST /api/reports | Nee |
| **Overdracht** | GET /api/overdracht, POST /api/overdracht/generate | Nee |
| **Patient Info** | GET /api/verpleegrapportage/[patientId] | Uitbreiden |
| **Diagnose** | - | Ja |
| **Agenda** | - | Ja |
| **Behandelplan** | POST /api/behandelplan/generate | Nee |

---

## 7. Contextual Awareness

### 7.1 Impliciete Context

| Context | Bron | Gebruik |
|---------|------|---------|
| **Huidige gebruiker** | Auth session | Filter "mijn patiënten" |
| **Huidige dienst** | Tijd (ochtend/middag/avond/nacht) | Shift-based filtering |
| **Laatst bekeken patiënt** | Session state | Pre-fill suggestie |
| **Recente acties** | Session state | Quick access |

### 7.2 Expliciete Context

| Context | Trigger | Effect |
|---------|---------|--------|
| **Actieve patiënt** | Zoeken + selecteren | Pre-fill alle volgende acties |
| **Dienst overdracht** | "overdracht" | Filter op afgelopen X uur |
| **Specifieke datum** | "afspraken morgen" | Filter op datum |

---

## 8. Voice Command Examples

### 8.1 Dagnotitie Flow

```
Voice: "Jan de Vries heeft zijn medicatie ingenomen, geen bijzonderheden"

Intent: dagnotitie
Entities:
  - patient_name: "Jan de Vries"
  - category: "medicatie" (extracted from "medicatie ingenomen")
  - content: "heeft zijn medicatie ingenomen, geen bijzonderheden"

Pre-fill:
  ┌─────────────────────────────────────────────────────────────┐
  │ 📝 Dagnotitie voor Jan de Vries                             │
  │ ─────────────────────────────────────────────────────────   │
  │ Categorie: [Medicatie ▼]  ← auto-selected                   │
  │ Tijd: [14:32]                                               │
  │                                                             │
  │ ┌─────────────────────────────────────────────────────┐     │
  │ │ heeft zijn medicatie ingenomen, geen bijzonderheden │     │
  │ └─────────────────────────────────────────────────────┘     │
  │                                                             │
  │ ☑ Opnemen in overdracht                                     │
  │                                                             │
  │ [Opslaan]                                                   │
  └─────────────────────────────────────────────────────────────┘
```

### 8.2 Zoeken Flow

```
Voice: "Zoek Marie"

Intent: zoeken
Entities:
  - search_query: "Marie"

Output:
  ┌─────────────────────────────────────────────────────────────┐
  │ 🔍 Zoekresultaten voor "Marie"                              │
  │ ─────────────────────────────────────────────────────────   │
  │                                                             │
  │ ┌─────────────────────────────────────────────────────┐     │
  │ │ Marie van den Berg                                   │     │
  │ │ 15-03-1985 · Kamer 12 · F41.1 Gegeneraliseerde angst│     │
  │ │ [Notitie] [Dossier] [Rapportage]                    │     │
  │ └─────────────────────────────────────────────────────┘     │
  │                                                             │
  │ ┌─────────────────────────────────────────────────────┐     │
  │ │ Marie Jansen                                         │     │
  │ │ 22-08-1972 · Kamer 8 · F32.1 Depressieve episode    │     │
  │ │ [Notitie] [Dossier] [Rapportage]                    │     │
  │ └─────────────────────────────────────────────────────┘     │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
```

### 8.3 Overdracht Flow

```
Voice: "Overdracht maken"

Intent: overdracht
Entities:
  - time_range: "afgelopen 8 uur" (default)

Output:
  ┌─────────────────────────────────────────────────────────────┐
  │ 🔄 Overdracht Ochtend dienst                                │
  │ ─────────────────────────────────────────────────────────   │
  │ 06:00 - 14:00 · 5 patiënten met updates                     │
  │                                                             │
  │ ▼ Jan de Vries (3 notities)                                 │
  │   ⚠ Aandachtspunt: onrustig vannacht                        │
  │   • 07:30 Medicatie uitgereikt ✓                            │
  │   • 08:45 Ontbijt genuttigd                                 │
  │   • 11:00 Gesprek met psycholoog                            │
  │                                                             │
  │ ▼ Marie van den Berg (2 notities)                           │
  │   • 08:00 ADL ondersteuning                                 │
  │   • 10:30 Bezoek familie                                    │
  │                                                             │
  │ ───────────────────────────────────────────────────────     │
  │ AI Samenvatting:                                            │
  │ "Rustige ochtend. Aandacht voor Jan de Vries die            │
  │  vannacht onrustig was. Marie ontving familiebezoek..."     │
  │                                                             │
  │ [Kopiëren] [Printen] [Doorsturen]                           │
  └─────────────────────────────────────────────────────────────┘
```

---

## 9. Conclusie: Minimale Intent Set

### 9.1 MVP (6 intents)

| Intent | Type | Frequentie | Complexiteit |
|--------|------|------------|--------------|
| `dagnotitie` | Writer | Zeer hoog | Laag |
| `zoeken` | Reader | Zeer hoog | Laag |
| `overdracht` | Reader | Hoog | Medium |
| `rapportage` | Writer | Hoog | Medium |
| `patient_info` | Reader | Hoog | Laag |
| `agenda` | Reader | Medium | Laag |

### 9.2 Fallback

| Intent | Actie |
|--------|-------|
| `onbekend` | Toon blok-picker met 6 opties |
| `ambigue` | "Bedoelde je...?" met opties |
| `lage_confidence` | Toon blok-picker |

### 9.3 Training Data Nodig

Per intent minimaal 20-30 voorbeeldzinnen in het Nederlands, inclusief:
- Formele vorm ("Ik wil een notitie maken")
- Informele vorm ("notitie jan")
- Met context ("jan medicatie")
- Zonder context ("notitie maken")
- Met typo's ("noitie jan")
- Voice transcriptie varianten

---

*Dit document dient als basis voor de intent classificatie en UI bouwblokken.*
