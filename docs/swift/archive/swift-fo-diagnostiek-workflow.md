# 🧩 Functioneel Ontwerp (FO) — Swift: Diagnostiek Workflow

**Projectnaam:** Swift — Contextual UI EPD  
**Versie:** v1.0  
**Datum:** 23-12-2024  
**Auteur:** Colin Lit

---

## 1. Doel en relatie met het PRD

🎯 **Doel van dit document:**
Dit Functioneel Ontwerp beschrijft **hoe** de diagnostiek workflow in Swift functioneel werkt — van het plannen van een diagnostiek-afspraak tot het stellen en bijstellen van diagnoses. Dit document focust specifiek op de complete flow die behandelaars doorlopen tijdens een diagnostiek-traject.

📘 **Relatie met andere documenten:**
- **PRD:** `swift-prd.md` — Product visie en requirements
- **FO Algemeen:** `swift-fo-ai.md` — Algemene Swift functionaliteit
- **Bouwplan:** `bouwplan-swift-v1.md` — Technische implementatie planning
- **UX/UI:** `swift-ux-v2.1.md` — Visuele specificaties

**Kernprincipe:**
> Een behandelaar kan een volledig diagnostiek-traject doorlopen via natuurlijke taal: van afspraak plannen, via rapportage schrijven, tot diagnose stellen — alles in één vloeiende flow zonder menu-navigatie.

---

## 2. Overzicht van de belangrijkste onderdelen

🎯 **Doel:** Overzicht van de modules en blocks binnen de diagnostiek workflow.

### 2.1 Workflow Componenten

| # | Component | Beschrijving | Type |
|---|-----------|--------------|------|
| 1 | **AfspraakBlock** | Diagnostiek-afspraak plannen | Block |
| 2 | **RapportageBlock** | Verslag schrijven na afspraak | Block |
| 3 | **DiagnoseBlock** | Overzicht van diagnoses | Block |
| 4 | **DiagnoseFormBlock** | Diagnose aanmaken/bijstellen | Block |

### 2.2 Workflow Flow

```
Afspraak Plannen → Rapportage Schrijven → Diagnose Bekijken → Diagnose Aanmaken/Bijstellen
```

### 2.3 Relatie met Bestaande Blocks

| Block | Relatie met Diagnostiek Workflow |
|-------|----------------------------------|
| **ZoekenBlock** | Wordt gebruikt voor patiëntselectie |
| **PatientContextCard** | Toont actieve diagnoses in overzicht |
| **AgendaBlock** | Toont geplande diagnostiek-afspraken |

---

## 3. User Stories

🎯 **Doel:** Beschrijven wat behandelaars moeten kunnen doen tijdens een diagnostiek-traject.

### 3.1 Diagnostiek Workflow Stories

| ID | Rol | Doel / Actie | Verwachte waarde | Prio |
|----|-----|--------------|------------------|------|
| US-D01 | Behandelaar | Diagnostiek-afspraak plannen via spraak/tekst | Afspraak in < 30 sec zonder menu-navigatie | 🟡 P2 |
| US-D02 | Behandelaar | Rapportage schrijven en koppelen aan afspraak | Verslag automatisch gekoppeld aan encounter | 🟡 P2 |
| US-D03 | Behandelaar | Alle diagnoses van patiënt bekijken | Overzicht in één oogopslag | 🟡 P2 |
| US-D04 | Behandelaar | Nieuwe diagnose toevoegen met ICD-10 zoeker | Diagnose toegevoegd met correcte code | 🟡 P2 |
| US-D05 | Behandelaar | Bestaande diagnose bijstellen (status, ernst) | Wijzigingen direct zichtbaar | 🟡 P2 |

### 3.2 User Story Details

**US-D01: Diagnostiek-afspraak plannen**
> Als behandelaar wil ik een diagnostiek-afspraak kunnen plannen door te zeggen "afspraak diagnostiek met Jan morgen 10:00" zodat ik snel kan plannen zonder door menu's te navigeren.

**US-D02: Rapportage koppelen aan afspraak**
> Als behandelaar wil ik een rapportage kunnen schrijven die automatisch gekoppeld wordt aan de diagnostiek-afspraak zodat ik niet handmatig hoef te koppelen.

**US-D03: Diagnoses bekijken**
> Als behandelaar wil ik alle diagnoses van een patiënt kunnen bekijken door te zeggen "diagnose Jan" zodat ik snel een overzicht heb zonder te navigeren.

**US-D04: Diagnose toevoegen**
> Als behandelaar wil ik een nieuwe diagnose kunnen toevoegen met een ICD-10 zoeker zodat ik de juiste code kan vinden zonder handmatig te zoeken.

**US-D05: Diagnose bijstellen**
> Als behandelaar wil ik een bestaande diagnose kunnen bijstellen (status, ernst) zodat ik diagnoses kan actualiseren na behandeling.

---

## 4. Functionele werking per onderdeel

🎯 **Doel:** Per component beschrijven wat de gebruiker kan doen en wat het systeem doet.

### 4.1 AfspraakBlock

**Functie:** Diagnostiek-afspraak plannen via natuurlijke taal.

**Trigger patterns:**
- "afspraak diagnostiek met [patient] [datum] [tijd]"
- "plan diagnostiek voor [patient] morgen"
- "afspraak [patient] volgende week dinsdag 10:00"

**Pre-fill logica:**

| Extracted | Pre-fill |
|-----------|----------|
| patient_name → match | Patiënt selector |
| "diagnostiek" keyword | Type = Diagnostiek |
| "morgen", "vandaag", datum | Datum picker |
| Tijd (10:00, 14:30) | Starttijd |
| Geen tijd | Default 09:00 |

**Form velden:**

| Veld | Type | Verplicht | Default |
|------|------|-----------|---------|
| Patiënt | Dropdown + search | Ja | Pre-filled of ZoekenBlock |
| Datum | Date picker | Ja | Pre-filled of vandaag |
| Starttijd | Time picker | Ja | Pre-filled of 09:00 |
| Eindtijd | Time picker | Nee | Starttijd + 1 uur |
| Type | Dropdown | Ja | Diagnostiek (pre-selected) |
| Locatie | Dropdown | Nee | AMB |

**Afspraak types:**
- Diagnostiek
- Behandeling
- Evaluatie
- Consult
- Overig

**Acties:**

| Knop | Actie | Keyboard |
|------|-------|----------|
| Opslaan | POST naar API, sluit block, retourneert encounter_id | `⌘Enter` |
| Annuleren | Sluit block zonder opslaan | `Escape` |

**Na opslaan:**
1. Toast: "✓ Afspraak diagnostiek met Jan de Vries aangemaakt voor morgen 10:00"
2. Block verdwijnt (200ms animatie)
3. Recent strip: badge "[📅 Jan - Diagnostiek]"
4. Encounter_id wordt opgeslagen in context voor volgende stap

**API:**
```
POST /api/appointments
Body: {
  patient_id: string,
  period_start: datetime,
  period_end: datetime,
  type_code: 'diagnostiek',
  class_code: 'AMB',
  notes?: string
}
Response: {
  id: string (encounter_id),
  success: boolean
}
```

---

### 4.2 RapportageBlock (Uitgebreid)

**Functie:** Verslag schrijven na diagnostiek-afspraak, gekoppeld aan encounter.

**Trigger patterns:**
- "rapportage diagnostiek gesprek met [patient]"
- "verslag van diagnostiek afspraak [patient]"
- "rapportage [patient]" (als recente diagnostiek-afspraak bestaat)

**Pre-fill logica:**

| Extracted | Pre-fill |
|-----------|----------|
| patient_name → match | Patiënt selector |
| "diagnostiek" keyword | Type = Diagnostiek |
| Recente encounter (diagnostiek) | Encounter_id gekoppeld |
| Geen encounter | Geen koppeling, suggestie tonen |

**Form velden:**

| Veld | Type | Verplicht | Default |
|------|------|-----------|---------|
| Patiënt | Dropdown | Ja | Pre-filled |
| Gekoppeld aan | Link naar encounter | Nee | Recente diagnostiek-afspraak |
| Type | Button group | Ja | Diagnostiek (pre-selected) |
| Inhoud | Rich text editor | Ja | Leeg |
| Datum/tijd | DateTime | Ja | Nu |

**Rapportage types:**
- Diagnostiek
- Gesprek
- Evaluatie
- Telefonisch
- Consult

**AI acties:**

| Actie | Beschrijving | Output |
|-------|--------------|--------|
| ✨ Samenvatten | Bullets van kernpunten | Zijpaneel |
| 📖 B1-niveau | Herschrijf leesbaar | Zijpaneel |
| 🔍 Problemen | Extraheer klinische issues | Zijpaneel |

**Acties:**

| Knop | Actie | Keyboard |
|------|-------|----------|
| Opslaan | POST naar API met encounter_id, sluit block | `⌘Enter` |
| Annuleren | Sluit block zonder opslaan | `Escape` |

**Na opslaan:**
1. Toast: "✓ Rapportage opgeslagen en gekoppeld aan afspraak"
2. Block verdwijnt
3. Recent strip: badge "[📋 Jan - Diagnostiek]"

**API:**
```
POST /api/reports
Body: {
  patient_id: string,
  encounter_id: string, // Nieuwe: koppeling aan afspraak
  type: 'diagnostiek',
  content: string (HTML),
  timestamp: datetime
}
```

---

### 4.3 DiagnoseBlock

**Functie:** Overzicht van alle diagnoses van een patiënt.

**Trigger patterns:**
- "diagnose [patient]"
- "diagnoses van [patient]"
- "wat zijn de diagnoses van [patient]"
- Klik op "Diagnoses" in PatientContextCard

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ 🏥 Diagnoses van Jan de Vries                    [×]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Filter: [Actief ✓] [Inactief] [Alle]                       │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ F41.1 Gegeneraliseerde angststoornis                  │   │
│ │ Status: Actief | Ernst: Matig                         │   │
│ │ Toegevoegd: 15 nov 2024 | Intake: Intake 1           │   │
│ │ [Bewerken] [Details]                                  │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ F32.1 Depressieve stoornis                            │   │
│ │ Status: Actief | Ernst: Mild                         │   │
│ │ Toegevoegd: 20 dec 2024 | Intake: Intake 2           │   │
│ │ [Bewerken] [Details]                                  │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ [+ Nieuwe diagnose toevoegen]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Gedrag:**
- Toont lijst met diagnoses, gesorteerd op datum (nieuwste eerst)
- Filter tabs: Actief / Inactief / Alle
- Per diagnose: code, omschrijving, status, ernst, datum, intake
- Klik op diagnose → DiagnoseFormBlock (edit mode)
- Klik "Nieuwe diagnose" → DiagnoseFormBlock (create mode)

**Empty state:**
"Geen diagnoses gevonden voor [patient]. [+ Nieuwe diagnose toevoegen]"

**API:**
```
GET /api/diagnoses/:patientId
Response: {
  diagnoses: [
    {
      id: string,
      code_code: string,
      code_display: string,
      clinical_status: 'active' | 'inactive' | 'resolved',
      severity_display: string,
      recorded_date: datetime,
      encounter_id: string,
      intake?: {
        id: string,
        title: string
      }
    }
  ]
}
```

---

### 4.4 DiagnoseFormBlock

**Functie:** Diagnose aanmaken of bijstellen met ICD-10 zoeker.

**Trigger patterns:**
- "diagnose toevoegen [patient] [ICD-10 code]"
- "diagnose wijzigen [patient]"
- "diagnose bijstellen [patient]"
- Klik op diagnose in DiagnoseBlock
- Klik "Nieuwe diagnose" in DiagnoseBlock

**Pre-fill logica (create mode):**

| Extracted | Pre-fill |
|-----------|----------|
| patient_name → match | Patiënt selector (read-only) |
| ICD-10 code (F41.1) | Code + omschrijving via zoeker |
| Geen code | ICD-10 zoeker open |

**Pre-fill logica (edit mode):**

| Veld | Pre-fill |
|------|----------|
| Patiënt | Read-only, huidige waarde |
| ICD-10 code | Huidige code |
| Omschrijving | Huidige omschrijving |
| Type | Huidige type (hoofd/neven) |
| Status | Huidige status |
| Ernst | Huidige ernst |
| Intake | Huidige intake koppeling |
| Toelichting | Huidige toelichting |

**Form velden:**

| Veld | Type | Verplicht | Default |
|------|------|-----------|---------|
| Patiënt | Read-only | Ja | Pre-filled |
| ICD-10 zoeker | Search + dropdown | Ja | Leeg of pre-filled |
| Code | Text (read-only na selectie) | Ja | Uit zoeker |
| Omschrijving | Text (read-only na selectie) | Ja | Uit zoeker |
| Type | Radio buttons | Ja | Hoofddiagnose |
| Status | Dropdown | Ja | Actief |
| Ernst | Dropdown | Nee | Geen |
| Intake koppeling | Dropdown | Nee | Geen |
| Toelichting | Textarea | Nee | Leeg |

**ICD-10 zoeker gedrag:**
- Fuzzy search tijdens typen (minimaal 2 karakters)
- Resultaten dropdown met code + omschrijving
- Bij selectie: code en omschrijving worden ingevuld
- Zoek op code (F41.1) of omschrijving (angst)

**Status opties:**
- Actief
- Inactief
- Resolved
- Remission
- Recurrence
- Relapse

**Ernst opties:**
- Geen
- Mild
- Matig
- Ernstig

**Type opties:**
- Hoofddiagnose
- Nevendiagnose

**Acties:**

| Knop | Actie | Keyboard |
|------|-------|----------|
| Opslaan | POST/PATCH naar API, sluit block | `⌘Enter` |
| Annuleren | Sluit block zonder opslaan | `Escape` |
| Verwijderen | Bevestigingsdialog → soft delete | - |

**Na opslaan:**
1. Toast: "✓ Diagnose F41.1 - Gegeneraliseerde angststoornis toegevoegd" (of "bijgewerkt")
2. Block verdwijnt
3. DiagnoseBlock wordt automatisch getoond met nieuwe/bijgewerkte diagnose

**API:**
```
POST /api/diagnoses
Body: {
  patient_id: string,
  encounter_id?: string,
  code_code: string,
  code_display: string,
  code_system: 'ICD-10',
  clinical_status: 'active' | 'inactive' | 'resolved',
  severity_display?: string,
  category: 'primary-diagnosis' | 'encounter-diagnosis',
  note?: string
}

PATCH /api/diagnoses/:id
Body: {
  code_code?: string,
  code_display?: string,
  clinical_status?: string,
  severity_display?: string,
  category?: string,
  note?: string
}
```

---

## 5. UI-overzicht (visuele structuur)

🎯 **Doel:** Globale schermopbouw voor diagnostiek workflow blocks.

### 5.1 AfspraakBlock Layout

```
┌─────────────────────────────────────────────────────────────┐
│ 📅 Nieuwe Afspraak                                [−] [×]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Patiënt *                                                   │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Jan de Vries                                 ✓     │   │
│ │ 59 jaar • Kamer 12B                      [← Auto]   │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ Datum *              Van *          Tot                     │
│ ┌─────────────┐     ┌─────────┐   ┌─────────┐              │
│ │ 2024-12-24  │     │ 10:00   │   │ 11:00   │              │
│ └─────────────┘     └─────────┘   └─────────┘              │
│                                                             │
│ Type afspraak *                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ [Diagnostiek ▼]                                       │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ Locatie                                                     │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ [AMB ▼]                                               │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ Notities (optioneel)                                        │
│ ┌───────────────────────────────────────────────────────┐   │
│ │                                                       │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│                                    [Annuleren] [Opslaan]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 RapportageBlock Layout (met encounter koppeling)

```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Rapportage                                    [−] [×]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Patiënt: Jan de Vries                              [Wijzig] │
│                                                             │
│ Gekoppeld aan: Afspraak diagnostiek - 24 dec 2024 10:00    │
│                                                             │
│ Type                                                       │
│ [Diagnostiek ✓] [Gesprek] [Evaluatie] [Telefonisch]       │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ [B] [I] [•] [1.] ["]                     🎤 Dicteer  │   │
│ ├───────────────────────────────────────────────────────┤   │
│ │                                                       │   │
│ │ Verslag van diagnostiek gesprek...                   │   │
│ │                                                       │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ AI-acties                                                   │
│ [✨ Samenvatten] [📖 B1-niveau] [🔍 Problemen extraheren]   │
│                                                             │
│                                    [Annuleren] [Opslaan]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 DiagnoseBlock Layout

```
┌─────────────────────────────────────────────────────────────┐
│ 🏥 Diagnoses van Jan de Vries                    [−] [×]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Filter: [Actief ✓] [Inactief] [Alle]                       │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ F41.1 Gegeneraliseerde angststoornis                  │   │
│ │ Status: Actief | Ernst: Matig                         │   │
│ │ Toegevoegd: 15 nov 2024 | Intake: Intake 1           │   │
│ │                                                       │   │
│ │ [Bewerken] [Details]                                  │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ F32.1 Depressieve stoornis                            │   │
│ │ Status: Actief | Ernst: Mild                         │   │
│ │ Toegevoegd: 20 dec 2024 | Intake: Intake 2           │   │
│ │                                                       │   │
│ │ [Bewerken] [Details]                                  │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ [+ Nieuwe diagnose toevoegen]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 DiagnoseFormBlock Layout

```
┌─────────────────────────────────────────────────────────────┐
│ 🏥 Nieuwe Diagnose                               [−] [×]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Patiënt: Jan de Vries (read-only)                          │
│                                                             │
│ ICD-10 Code *                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 🔍 Zoek ICD-10 code of omschrijving...               │   │
│ │                                                       │   │
│ │ Resultaten:                                           │   │
│ │ • F41.1 Gegeneraliseerde angststoornis               │   │
│ │ • F41.0 Paniekstoornis                                │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ Code: F41.1 (read-only na selectie)                        │
│ Omschrijving: Gegeneraliseerde angststoornis (read-only)   │
│                                                             │
│ Type *                                                      │
│ ○ Hoofddiagnose  ● Nevendiagnose                           │
│                                                             │
│ Status *                                                    │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ [Actief ▼]                                           │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ Ernst                                                       │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ [Geen ▼]                                             │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ Intake koppeling                                            │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ [Geen ▼]                                             │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ Toelichting (optioneel)                                     │
│ ┌───────────────────────────────────────────────────────┐   │
│ │                                                       │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│                                    [Annuleren] [Opslaan]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Interacties met AI (functionele beschrijving)

🎯 **Doel:** Waar AI in de diagnostiek workflow voorkomt.

| Locatie | AI-actie | Trigger | Output |
|---------|----------|---------|--------|
| RapportageBlock | Samenvatten | Klik knop "✨ Samenvatten" | Bullets van kernpunten in zijpaneel |
| RapportageBlock | B1-niveau | Klik knop "📖 B1-niveau" | Herschreven tekst in zijpaneel |
| RapportageBlock | Extract problemen | Klik knop "🔍 Problemen" | Gestructureerde lijst met categorie + severity |
| DiagnoseFormBlock | ICD-10 suggestie | Typ in zoeker | Fuzzy search resultaten met relevante codes |

**AI Response Handling:**
- Alle AI outputs tonen in dedicated preview area (zijpaneel)
- Gebruiker moet expliciet accepteren/invoegen
- Bewerken altijd mogelijk
- Annuleren zonder gevolgen

---

## 7. Complete Workflow Flow

🎯 **Doel:** Stap-voor-stap beschrijving van de complete diagnostiek workflow.

### Flow 1: Van Afspraak tot Diagnose (Happy Path)

```
┌─────────────────────────────────────────────────────────────┐
│ STAP 1: AFSPRAAK PLANNEN                                   │
│                                                             │
│ Behandelaar: "afspraak diagnostiek met Jan morgen 10:00"  │
│ → AfspraakBlock verschijnt met pre-fill                    │
│ → Behandelaar controleert → klikt Opslaan                 │
│ → Encounter aangemaakt, encounter_id opgeslagen            │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ STAP 2: RAPPORTAGE SCHRIJVEN (na afspraak)                 │
│                                                             │
│ Behandelaar: "rapportage diagnostiek gesprek met Jan"      │
│ → RapportageBlock verschijnt                               │
│ → Encounter_id automatisch gekoppeld                       │
│ → Behandelaar schrijft/dicteert verslag                    │
│ → Optioneel: AI samenvatten                                │
│ → Klikt Opslaan → Rapportage gekoppeld aan encounter       │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ STAP 3: DIAGNOSE BEKIJKEN                                  │
│                                                             │
│ Behandelaar: "diagnose Jan"                                │
│ → DiagnoseBlock verschijnt met lijst diagnoses            │
│ → Filter: Actief (default)                                 │
│ → Behandelaar ziet overzicht                               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ STAP 4: DIAGNOSE TOEVOEGEN                                 │
│                                                             │
│ Behandelaar: "diagnose toevoegen Jan F41.1"                │
│ → DiagnoseFormBlock verschijnt                             │
│ → ICD-10 code F41.1 pre-filled                             │
│ → Behandelaar vult type, status, ernst in                 │
│ → Koppelt aan intake (optioneel)                           │
│ → Klikt Opslaan → Diagnose toegevoegd                      │
│ → DiagnoseBlock wordt getoond met nieuwe diagnose          │
└─────────────────────────────────────────────────────────────┘
```

### Flow 2: Diagnose Bijstellen

```
┌─────────────────────────────────────────────────────────────┐
│ Behandelaar: "diagnose wijzigen Jan"                       │
│ → DiagnoseBlock verschijnt                                  │
│ → Behandelaar klikt op diagnose F41.1                      │
│ → DiagnoseFormBlock verschijnt (edit mode)                 │
│ → Alle velden pre-filled met huidige waarden               │
│ → Behandelaar wijzigt status: Actief → Resolved            │
│ → Behandelaar wijzigt ernst: Matig → Mild                  │
│ → Voegt toelichting toe                                    │
│ → Klikt Opslaan → Diagnose bijgewerkt                      │
│ → DiagnoseBlock wordt getoond met bijgewerkte diagnose     │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Edge Cases & Alternatieve Flows

### Edge Case 1: Meerdere patiënten metzelfde naam
- **Situatie:** Input "diagnose Jan" → meerdere matches
- **Gedrag:** ZoekenBlock verschijnt met resultaten
- **Actie:** Behandelaar selecteert juiste patiënt
- **Vervolg:** DiagnoseBlock voor geselecteerde patiënt

### Edge Case 2: Geen recente afspraak voor rapportage
- **Situatie:** Input "rapportage Jan" → geen encounter gevonden
- **Gedrag:** RapportageBlock opent zonder encounter-koppeling
- **Suggestie:** "Geen recente diagnostiek-afspraak gevonden. Wil je een afspraak koppelen?"
- **Actie:** Optioneel AfspraakBlock openen

### Edge Case 3: ICD-10 code niet gevonden
- **Situatie:** Input "diagnose toevoegen Jan F99.9" → code bestaat niet
- **Gedrag:** Validatie fout: "ICD-10 code F99.9 niet gevonden"
- **Actie:** ICD-10 zoeker blijft open voor correctie

### Edge Case 4: Diagnose al bestaat
- **Situatie:** Input "diagnose toevoegen Jan F41.1" → diagnose bestaat al
- **Gedrag:** Waarschuwing: "Diagnose F41.1 bestaat al. Wil je deze bijwerken?"
- **Actie:** Optioneel DiagnoseFormBlock openen in edit mode

### Edge Case 5: Onvolledige input
- **Situatie:** Input "afspraak diagnostiek" (geen patiënt/datum)
- **Gedrag:** Systeem vraagt om ontbrekende informatie
- **Actie:** ZoekenBlock voor patiënt, datum/tijd picker voor planning

---

## 9. Success Criteria

De diagnostiek workflow is succesvol wanneer:

1. ✅ Behandelaar kan diagnostiek-afspraak plannen in < 30 seconden
2. ✅ Rapportage kan worden geschreven en automatisch gekoppeld aan afspraak
3. ✅ Alle diagnoses van een patiënt zijn in één overzicht zichtbaar
4. ✅ Nieuwe diagnose kan worden toegevoegd met ICD-10 zoeker
5. ✅ Bestaande diagnose kan worden bijgewerkt (status, ernst, etc.)
6. ✅ Alle acties zijn traceerbaar (wie, wanneer, wat)
7. ✅ Workflow kan volledig worden doorlopen zonder menu-navigatie

---

## 10. Bijlagen & Referenties

**Projectdocumenten:**
- PRD: `swift-prd.md`
- FO Algemeen: `swift-fo-ai.md`
- Bouwplan: `bouwplan-swift-v1.md`
- UX/UI: `swift-ux-v2.1.md`
- Taken analyse: `taken-en-vragen-analyse.md`

**Bestaande Code Referenties:**
- Diagnose pagina: `app/epd/patients/[id]/diagnose/page.tsx`
- Diagnose actions: `app/epd/patients/[id]/diagnose/actions.ts`
- Appointment modal: `app/epd/agenda/components/appointment-modal.tsx`
- Rapportage workspace: `app/epd/patients/[id]/rapportage/components/rapportage-workspace-v2.tsx`

**Database Schema:**
- `conditions` tabel voor diagnoses
- `encounters` tabel voor afspraken
- `reports` tabel voor rapportages

---

## Wijzigingslog

| Versie | Datum | Wijzigingen |
|--------|-------|-------------|
| 1.0 | 23-12-2024 | Initiële versie - Diagnostiek workflow beschrijving |

