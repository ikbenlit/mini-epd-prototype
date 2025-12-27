# 🎨 UX/UI Design Document — Swift: Diagnostiek Workflow

**Projectnaam:** Swift — Diagnostiek Workflow  
**Versie:** v1.0  
**Datum:** 23-12-2024  
**Auteur:** Colin Lit

---

## 1. Visie: Behandelaar Workflow via Natuurlijke Taal

### 1.1 Het Probleem voor Behandelaars

```
TRADITIONEEL EPD - DIAGNOSTIEK WORKFLOW
┌──────────────────────────────────────────────────────────────────┐
│ Menu → Patiënten → Jan → Agenda → Nieuwe Afspraak →            │
│ Type: Diagnostiek → Datum/Tijd → Opslaan                        │
│                                                                 │
│ Menu → Patiënten → Jan → Rapportages → Nieuw →                 │
│ Type: Diagnostiek → Koppel Afspraak → Zoek → Selecteer →      │
│ Schrijf verslag → Opslaan                                       │
│                                                                 │
│ Menu → Patiënten → Jan → Diagnoses → Nieuw →                   │
│ Zoek ICD-10 → Selecteer → Vul formulier → Opslaan              │
└──────────────────────────────────────────────────────────────────┘

Resultaat: 15-20 klikken, 10-15 minuten per diagnostiek-traject
```

### 1.2 De Swift Oplossing

```
SWIFT - DIAGNOSTIEK WORKFLOW
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  "afspraak diagnostiek met jan morgen 10:00"                   │
│  → AfspraakBlock verschijnt voorgevuld                          │
│  → Opslaan (1 klik)                                            │
│                                                                 │
│  "rapportage diagnostiek gesprek met jan"                       │
│  → RapportageBlock verschijnt met encounter koppeling          │
│  → Schrijf/dicteer → Opslaan (1 klik)                          │
│                                                                 │
│  "diagnose toevoegen jan F41.1"                                 │
│  → DiagnoseFormBlock verschijnt met ICD-10 pre-filled          │
│  → Vul aan → Opslaan (1 klik)                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Resultaat: 3 zinnen, 3 klikken, 3-5 minuten per traject
```

### 1.3 Core Design Principles (Diagnostiek Workflow)

| Principe | Betekenis voor Diagnostiek |
|----------|---------------------------|
| **Conversational** | "afspraak diagnostiek jan morgen 10:00" werkt direct |
| **Contextual** | Systeem onthoudt encounter_id tussen stappen |
| **Ephemeral** | Blocks verschijnen wanneer nodig, verdwijnen na opslaan |
| **Complete Flow** | Van afspraak tot diagnose in één vloeiende flow |

---

## 2. Intent Mapping voor Diagnostiek Workflow

### 2.1 Diagnostiek Intents

| Intent | Trigger patterns | Block | Prio | Freq |
|--------|-----------------|-------|------|------|
| `afspraak_maken` | "afspraak diagnostiek met [patient] [datum] [tijd]"<br>"plan diagnostiek voor [patient] morgen"<br>"afspraak [patient] volgende week dinsdag 10:00" | `AfspraakBlock` | 🟡 P2 | 2-3x/week |
| `rapportage` | "rapportage diagnostiek gesprek met [patient]"<br>"verslag van diagnostiek afspraak [patient]"<br>"rapportage [patient]" (als recente afspraak) | `RapportageBlock` | 🟡 P2 | 3-5x/week |
| `diagnose_bekijken` | "diagnose [patient]"<br>"diagnoses van [patient]"<br>"wat zijn de diagnoses van [patient]" | `DiagnoseBlock` | 🟡 P2 | 3-5x/week |
| `diagnose_toevoegen` | "diagnose toevoegen [patient] [ICD-10]"<br>"[patient] heeft [ICD-10]"<br>"diagnose [patient] [ICD-10]" | `DiagnoseFormBlock` | 🟡 P2 | 1-2x/week |
| `diagnose_wijzigen` | "diagnose wijzigen [patient]"<br>"diagnose bijstellen [patient]" | `DiagnoseFormBlock` (edit) | 🟡 P2 | 1x/week |

### 2.2 Context-Triggered UI (Proactief)

| Trigger | Conditie | Wat verschijnt | Prio |
|---------|----------|----------------|------|
| **Recente afspraak** | Na afspraak opslaan | Suggestie: "Rapportage schrijven?" | 🟡 P2 |
| **Rapportage zonder diagnose** | Na rapportage opslaan | Suggestie: "Diagnose toevoegen?" | 🟡 P2 |
| **Diagnose verouderd** | Diagnose > 6 maanden oud | Suggestie: "Diagnose bijwerken?" | 🟢 P3 |

---

## 3. Screen Architecture

### 3.1 Diagnostiek Blocks in Swift Layout

Alle diagnostiek blocks verschijnen in de **Canvas Area** van Swift:

```
┌─────────────────────────────────────────────────────────────────┐
│  🕐 Ochtend | 8 ptn                  Jan de Vries ▼  👤 SV │
│                        CONTEXT BAR                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ┌─────────────────────┐                      │
│                    │                     │                      │
│                    │  DIAGNOSTIEK BLOCK  │                      │
│                    │  (AfspraakBlock /   │                      │
│                    │   RapportageBlock / │                      │
│                    │   DiagnoseBlock /    │                      │
│                    │   DiagnoseFormBlock) │                      │
│                    │                     │                      │
│                    └─────────────────────┘                      │
│                                                                 │
│                         CANVAS AREA                             │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Recent: [📅 Jan-Diag] [📋 Jan-Rapp] [🏥 Jan-Diag]            │
│                       RECENT STRIP                              │
├─────────────────────────────────────────────────────────────────┤
│  🎤  Typ of spreek wat je wilt doen...                    ⌘K  │
│                       COMMAND INPUT                             │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Block Sizes voor Diagnostiek

| Block | Size | Max-width | Reden |
|-------|------|-----------|-------|
| AfspraakBlock | Medium | 640px | Form met meerdere velden |
| RapportageBlock | Large | 900px | Rich text editor + AI acties |
| DiagnoseBlock | Medium | 640px | Overzicht lijst |
| DiagnoseFormBlock | Medium | 640px | Form met ICD-10 zoeker |

---

## 4. Component Specifications

### 4.1 AfspraakBlock

**Functie:** Diagnostiek-afspraak plannen met pre-fill vanuit intent.

```
┌─────────────────────────────────────────────────────────────────┐
│  📅 Nieuwe Afspraak                                [−] [×]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Patiënt *                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Jan de Vries                                     ✓     │   │
│  │  59 jaar • Kamer 12B                      [← Auto]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Datum *              Van *          Tot                        │
│  ┌─────────────┐     ┌─────────┐   ┌─────────┐                │
│  │ 2024-12-24  │     │ 10:00   │   │ 11:00   │                │
│  └─────────────┘     └─────────┘   └─────────┘                │
│                                                                 │
│  Type afspraak *                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Diagnostiek ▼]                                        │   │
│  │  • Diagnostiek                                           │   │
│  │  • Behandeling                                           │   │
│  │  • Evaluatie                                             │   │
│  │  • Consult                                               │   │
│  │  • Overig                                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Locatie                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [AMB ▼]                                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Notities (optioneel)                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                    [Annuleren]  [💾 Opslaan]  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Pre-fill Indicatoren:**
- Patiënt naam: **Bold** + checkmark
- Datum: **Highlighted** achtergrond
- Tijd: **Highlighted** achtergrond
- Type: **Pre-selected** in dropdown

**Keyboard Shortcuts:**
- `⌘Enter` / `Ctrl+Enter`: Opslaan
- `Escape`: Annuleren
- `Tab`: Navigeer tussen velden

**Na Opslaan:**
1. Toast: "✓ Afspraak diagnostiek met Jan de Vries aangemaakt voor morgen 10:00"
2. Block verdwijnt (200ms slide-down animatie)
3. Recent strip: badge "[📅 Jan - Diagnostiek]"
4. Encounter_id opgeslagen in Swift store voor volgende stap

---

### 4.2 RapportageBlock (Uitgebreid)

**Functie:** Verslag schrijven na diagnostiek-afspraak met encounter koppeling.

```
┌─────────────────────────────────────────────────────────────────┐
│  📋 Rapportage                                    [−] [×]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Patiënt: Jan de Vries                              [Wijzig]   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔗 Gekoppeld aan: Afspraak diagnostiek                │   │
│  │     24 dec 2024 10:00 - 11:00                          │   │
│  │     [Ontkoppelen]                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Type                                                           │
│  [Diagnostiek ✓] [Gesprek] [Evaluatie] [Telefonisch] [Consult]│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [B] [I] [•] [1.] ["]                     🎤 Dicteer     │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  Verslag van diagnostiek gesprek met Jan de Vries...   │   │
│  │                                                         │   │
│  │  [Rich text editor met formatting toolbar]             │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  AI-acties                                                      │
│  [✨ Samenvatten] [📖 B1-niveau] [🔍 Problemen extraheren]      │
│                                                                 │
│                                    [Annuleren]  [💾 Opslaan]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Encounter Koppeling:**
- **Zichtbaar:** Als recente diagnostiek-afspraak bestaat
- **Styling:** Link badge met encounter details
- **Actie:** Klik "Ontkoppelen" om koppeling te verwijderen
- **Empty state:** "Geen recente diagnostiek-afspraak gevonden. [+ Koppel afspraak]"

**AI Acties (Zijpaneel):**
- **✨ Samenvatten:** Bullets van kernpunten
- **📖 B1-niveau:** Herschreven tekst (leesbaar voor patiënt)
- **🔍 Problemen:** Gestructureerde lijst met categorie + severity

**Keyboard Shortcuts:**
- `⌘Enter` / `Ctrl+Enter`: Opslaan
- `Escape`: Annuleren
- `⌘B` / `Ctrl+B`: Bold
- `⌘I` / `Ctrl+I`: Italic
- `Space` (leeg): Start dicteer

**Na Opslaan:**
1. Toast: "✓ Rapportage opgeslagen en gekoppeld aan afspraak"
2. Block verdwijnt
3. Recent strip: badge "[📋 Jan - Diagnostiek]"
4. Suggestie: "Diagnose toevoegen?" (als nog geen diagnose)

---

### 4.3 DiagnoseBlock

**Functie:** Overzicht van alle diagnoses van een patiënt.

```
┌─────────────────────────────────────────────────────────────────┐
│  🏥 Diagnoses van Jan de Vries                    [−] [×]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Filter: [Actief ✓] [Inactief] [Alle]                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  F41.1 Gegeneraliseerde angststoornis                   │   │
│  │  Status: ● Actief  |  Ernst: Matig                      │   │
│  │  Toegevoegd: 15 nov 2024  |  Intake: Intake 1         │   │
│  │                                                         │   │
│  │  [✏️ Bewerken]  [📄 Details]                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  F32.1 Depressieve stoornis                             │   │
│  │  Status: ● Actief  |  Ernst: Mild                      │   │
│  │  Toegevoegd: 20 dec 2024  |  Intake: Intake 2         │   │
│  │                                                         │   │
│  │  [✏️ Bewerken]  [📄 Details]                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  F41.0 Paniekstoornis                                   │   │
│  │  Status: ○ Inactief  |  Ernst: -                        │   │
│  │  Toegevoegd: 10 sep 2024  |  Intake: Intake 1         │   │
│  │                                                         │   │
│  │  [✏️ Bewerken]  [📄 Details]                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [+ Nieuwe diagnose toevoegen]                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Filter Tabs:**
- **Actief:** Alleen diagnoses met status "active" (default)
- **Inactief:** Alleen diagnoses met status "inactive" of "resolved"
- **Alle:** Alle diagnoses

**Diagnose Card:**
- **Code:** ICD-10 code (F41.1) in monospace font
- **Omschrijving:** Volledige naam in bold
- **Status:** Dot indicator (● = actief, ○ = inactief)
- **Ernst:** Badge met kleur (Mild = groen, Matig = geel, Ernstig = rood)
- **Metadata:** Datum + Intake link

**Empty State:**
```
┌─────────────────────────────────────────────────────────────┐
│  Geen diagnoses gevonden voor Jan de Vries                 │
│                                                             │
│  [+ Nieuwe diagnose toevoegen]                             │
└─────────────────────────────────────────────────────────────┘
```

**Keyboard Shortcuts:**
- `Escape`: Sluit block
- `Enter` (op diagnose): Open DiagnoseFormBlock (edit mode)
- `N`: Nieuwe diagnose toevoegen

---

### 4.4 DiagnoseFormBlock

**Functie:** Diagnose aanmaken of bijstellen met ICD-10 zoeker.

```
┌─────────────────────────────────────────────────────────────────┐
│  🏥 Nieuwe Diagnose                               [−] [×]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Patiënt: Jan de Vries (read-only)                             │
│                                                                 │
│  ICD-10 Code *                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔍 Zoek ICD-10 code of omschrijving...                │   │
│  │                                                         │   │
│  │  Resultaten (bij typen):                               │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  • F41.1 Gegeneraliseerde angststoornis         │   │   │
│  │  │  • F41.0 Paniekstoornis                          │   │   │
│  │  │  • F41.2 Gemengde angst- en depressieve stoornis│   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Code: F41.1 (read-only na selectie)                           │
│  Omschrijving: Gegeneraliseerde angststoornis (read-only)     │
│                                                                 │
│  Type *                                                        │
│  ○ Hoofddiagnose  ● Nevendiagnose                            │
│                                                                 │
│  Status *                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Actief ▼]                                             │   │
│  │  • Actief                                               │   │
│  │  • Inactief                                             │   │
│  │  • Resolved                                             │   │
│  │  • Remission                                            │   │
│  │  • Recurrence                                           │   │
│  │  • Relapse                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Ernst                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Geen ▼]                                               │   │
│  │  • Geen                                                 │   │
│  │  • Mild                                                 │   │
│  │  • Matig                                                │   │
│  │  • Ernstig                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Intake koppeling (optioneel)                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Geen ▼]                                               │   │
│  │  • Geen                                                 │   │
│  │  • Intake 1 - 15 nov 2024                              │   │
│  │  • Intake 2 - 20 dec 2024                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Toelichting (optioneel)                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                    [Annuleren]  [💾 Opslaan]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**ICD-10 Zoeker Gedrag:**
- **Trigger:** Typ minimaal 2 karakters
- **Search:** Fuzzy search op code (F41.1) of omschrijving (angst)
- **Results:** Dropdown met max 10 resultaten
- **Selectie:** Klik op resultaat → code + omschrijving worden ingevuld (read-only)
- **Pre-fill:** Als ICD-10 code in intent → automatisch zoeken en invullen

**Status Kleuren:**
- **Actief:** Groen dot (●)
- **Inactief:** Grijs dot (○)
- **Resolved:** Blauw dot (●)

**Ernst Badges:**
- **Geen:** Geen badge
- **Mild:** Groen badge
- **Matig:** Geel badge
- **Ernstig:** Rood badge

**Edit Mode:**
- Alle velden pre-filled met huidige waarden
- Patiënt read-only
- Code + omschrijving read-only (wijzig via zoeker)
- Status, ernst, type, toelichting bewerkbaar

**Keyboard Shortcuts:**
- `⌘Enter` / `Ctrl+Enter`: Opslaan
- `Escape`: Annuleren
- `Tab`: Navigeer tussen velden
- `↑` `↓` (in zoeker): Navigeer resultaten
- `Enter` (in zoeker): Selecteer resultaat

**Na Opslaan:**
1. Toast: "✓ Diagnose F41.1 - Gegeneraliseerde angststoornis toegevoegd"
2. Block verdwijnt
3. DiagnoseBlock wordt automatisch getoond met nieuwe/bijgewerkte diagnose

---

## 5. Interaction Flows

### 5.1 Happy Path: Complete Diagnostiek Workflow (3-5 minuten)

```
┌─────────────────────────────────────────────────────────────────┐
│ STAP 1: AFSPRAAK PLANNEN (30 sec)                             │
│                                                                 │
│ Behandelaar: "afspraak diagnostiek met jan morgen 10:00"     │
│ → AfspraakBlock verschijnt met pre-fill                        │
│   ✓ Patiënt: Jan de Vries [highlighted]                       │
│   ✓ Datum: morgen [highlighted]                               │
│   ✓ Tijd: 10:00 [highlighted]                                  │
│   ✓ Type: Diagnostiek [pre-selected]                          │
│ → Behandelaar review → klikt Opslaan                          │
│ → Toast: "✓ Afspraak aangemaakt"                              │
│ → Encounter_id opgeslagen                                      │
└─────────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAP 2: RAPPORTAGE SCHRIJVEN (2 min)                          │
│                                                                 │
│ Behandelaar: "rapportage diagnostiek gesprek met jan"         │
│ → RapportageBlock verschijnt                                   │
│   ✓ Patiënt: Jan de Vries                                      │
│   ✓ Gekoppeld aan: Afspraak diagnostiek - morgen 10:00        │
│   ✓ Type: Diagnostiek [pre-selected]                           │
│ → Behandelaar schrijft/dicteert verslag                        │
│ → Optioneel: AI samenvatten                                    │
│ → Klikt Opslaan                                               │
│ → Toast: "✓ Rapportage gekoppeld aan afspraak"                │
└─────────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAP 3: DIAGNOSE BEKIJKEN (30 sec)                             │
│                                                                 │
│ Behandelaar: "diagnose jan"                                    │
│ → DiagnoseBlock verschijnt met overzicht                       │
│ → Filter: Actief (default)                                     │
│ → Behandelaar ziet bestaande diagnoses                        │
└─────────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAP 4: DIAGNOSE TOEVOEGEN (1 min)                             │
│                                                                 │
│ Behandelaar: "diagnose toevoegen jan F41.1"                   │
│ → DiagnoseFormBlock verschijnt                                 │
│   ✓ Patiënt: Jan de Vries [read-only]                          │
│   ✓ ICD-10: F41.1 [pre-filled]                                 │
│   ✓ Omschrijving: Gegeneraliseerde angststoornis [pre-filled] │
│ → Behandelaar vult type, status, ernst in                     │
│ → Koppelt aan intake (optioneel)                               │
│ → Klikt Opslaan                                               │
│ → Toast: "✓ Diagnose toegevoegd"                               │
│ → DiagnoseBlock wordt getoond met nieuwe diagnose             │
└─────────────────────────────────────────────────────────────────┘

TOTAAL: ~4 minuten (was: 10-15 minuten)
```

### 5.2 Diagnose Bijstellen Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Behandelaar: "diagnose wijzigen jan"                          │
│ → DiagnoseBlock verschijnt                                     │
│ → Behandelaar klikt op diagnose F41.1                          │
│ → DiagnoseFormBlock verschijnt (edit mode)                    │
│   ✓ Alle velden pre-filled met huidige waarden                │
│ → Behandelaar wijzigt:                                        │
│   - Status: Actief → Resolved                                  │
│   - Ernst: Matig → Mild                                        │
│   - Toelichting: "Na behandeling verbeterd"                    │
│ → Klikt Opslaan                                               │
│ → Toast: "✓ Diagnose bijgewerkt"                               │
│ → DiagnoseBlock wordt getoond met bijgewerkte diagnose        │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Proactieve Suggesties Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Na Afspraak opslaan:                                           │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ 💡 Rapportage schrijven voor deze afspraak?              │   │
│ │                              [Ja] [Later] [×]             │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│ Na Rapportage opslaan (zonder diagnose):                       │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ 💡 Diagnose toevoegen voor Jan de Vries?                 │   │
│ │                              [Ja] [Later] [×]             │   │
│ └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Visual Design Tokens

### 6.1 Block Colors (Dark Theme - Swift Context)

| Element | Hex | Gebruik |
|---------|-----|---------|
| Block Background | `#1E293B` | Block achtergrond |
| Block Border | `#334155` | Block rand |
| Text Primary | `#F1F5F9` | Hoofdtekst |
| Text Secondary | `#94A3B8` | Subtekst |
| Accent | `#3B82F6` | Primaire acties |
| Success | `#10B981` | Bevestigingen |
| Warning | `#F59E0B` | Waarschuwingen |
| Error | `#EF4444` | Fouten |

### 6.2 Status Colors

| Status | Dot | Badge | Hex |
|--------|-----|-------|-----|
| Actief | ● | - | `#10B981` |
| Inactief | ○ | - | `#64748B` |
| Resolved | ● | - | `#3B82F6` |

### 6.3 Ernst Badges

| Ernst | Badge | Hex |
|-------|-------|-----|
| Geen | - | - |
| Mild | Badge | `#10B981` |
| Matig | Badge | `#F59E0B` |
| Ernstig | Badge | `#EF4444` |

### 6.4 ICD-10 Code Styling

| Element | Font | Size | Color |
|---------|------|------|-------|
| Code | Monospace | 14px | `#F1F5F9` |
| Omschrijving | Sans-serif | 16px | `#F1F5F9` |

---

## 7. Keyboard Navigation

### 7.1 AfspraakBlock

| Key | Action |
|-----|--------|
| `⌘Enter` / `Ctrl+Enter` | Opslaan |
| `Escape` | Annuleren |
| `Tab` | Navigeer tussen velden |
| `↑` `↓` | Navigeer dropdown opties |

### 7.2 RapportageBlock

| Key | Action |
|-----|--------|
| `⌘Enter` / `Ctrl+Enter` | Opslaan |
| `Escape` | Annuleren |
| `⌘B` / `Ctrl+B` | Bold |
| `⌘I` / `Ctrl+I` | Italic |
| `Space` (leeg) | Start dicteer |

### 7.3 DiagnoseBlock

| Key | Action |
|-----|--------|
| `Escape` | Sluit block |
| `Enter` (op diagnose) | Open DiagnoseFormBlock (edit) |
| `N` | Nieuwe diagnose |
| `↑` `↓` | Navigeer diagnoses |

### 7.4 DiagnoseFormBlock

| Key | Action |
|-----|--------|
| `⌘Enter` / `Ctrl+Enter` | Opslaan |
| `Escape` | Annuleren |
| `Tab` | Navigeer tussen velden |
| `↑` `↓` (in zoeker) | Navigeer resultaten |
| `Enter` (in zoeker) | Selecteer resultaat |

---

## 8. Error States & Edge Cases

### 8.1 AfspraakBlock Errors

**Geen patiënt gevonden:**
```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Patiënt "Jan" niet gevonden                            │
│                                                             │
│  [🔍 Zoek patiënt]                                         │
└─────────────────────────────────────────────────────────────┘
```

**Ongeldige datum:**
```
┌─────────────────────────────────────────────────────────────┐
│  Datum *                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  morgen                                    ❌       │   │
│  └─────────────────────────────────────────────────────┘   │
│  ⚠️ Ongeldige datum. Gebruik formaat: DD-MM-YYYY          │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 RapportageBlock Errors

**Geen encounter gevonden:**
```
┌─────────────────────────────────────────────────────────────┐
│  Geen recente diagnostiek-afspraak gevonden                │
│                                                             │
│  [+ Koppel afspraak]                                       │
└─────────────────────────────────────────────────────────────┘
```

**Lege rapportage:**
```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Rapportage mag niet leeg zijn                           │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 DiagnoseFormBlock Errors

**ICD-10 code niet gevonden:**
```
┌─────────────────────────────────────────────────────────────┐
│  ICD-10 Code *                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  F99.9                                    ❌        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ⚠️ ICD-10 code F99.9 niet gevonden                       │
└─────────────────────────────────────────────────────────────┘
```

**Diagnose bestaat al:**
```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Diagnose F41.1 bestaat al voor Jan de Vries            │
│                                                             │
│  [✏️ Bestaande diagnose bewerken]  [✕ Annuleren]           │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Responsive Design

### 9.1 Mobile (< 768px)

**AfspraakBlock:**
- Full-width block
- Stacked form velden
- Date/time pickers full-width
- Bottom sheet voor dropdowns

**RapportageBlock:**
- Full-width block
- Rich text editor full-width
- AI acties als buttons onder editor
- Bottom sheet voor encounter koppeling

**DiagnoseBlock:**
- Full-width block
- Diagnose cards stacked
- Filter tabs als chips
- Swipe to edit

**DiagnoseFormBlock:**
- Full-width block
- Form velden stacked
- ICD-10 zoeker full-width
- Bottom sheet voor dropdowns

### 9.2 Tablet (768px - 1024px)

- Blocks blijven medium/large size
- Form velden kunnen naast elkaar (waar logisch)
- Dropdowns blijven inline

---

## 10. Accessibility

### 10.1 Screen Reader Support

- Alle form velden hebben labels
- Status changes worden aangekondigd
- Error messages zijn toegankelijk
- Keyboard navigation volledig ondersteund

### 10.2 Focus Management

- Focus blijft in block na openen
- Focus naar eerste veld bij nieuwe block
- Focus naar error veld bij validatie fout
- Focus naar recent strip na sluiten

### 10.3 Color Contrast

- Alle tekst voldoet aan WCAG AA (4.5:1)
- Status indicators hebben tekst labels
- Error states hebben icon + tekst

---

## 11. Animation & Transitions

### 11.1 Block Animations

**Openen:**
- Slide up + fade in (200ms)
- Scale: 0.95 → 1.0

**Sluiten:**
- Slide down + fade out (200ms)
- Scale: 1.0 → 0.95

**Pre-fill Highlight:**
- Pulse animatie (2x) bij pre-filled velden
- Duration: 600ms

### 11.2 Toast Notifications

- Slide in from bottom (300ms)
- Auto-dismiss na 3 seconden
- Hover: pause auto-dismiss

---

## 12. Component Checklist

### 🟡 P2: Diagnostiek Workflow Blocks

- [ ] AfspraakBlock
  - [ ] Pre-fill vanuit intent
  - [ ] Encounter_id teruggeven
  - [ ] Dark theme styling
  - [ ] Keyboard shortcuts
  - [ ] Error states

- [ ] RapportageBlock (uitgebreid)
  - [ ] Encounter koppeling
  - [ ] Type "diagnostiek"
  - [ ] Rich text editor
  - [ ] AI acties
  - [ ] Dark theme styling

- [ ] DiagnoseBlock
  - [ ] Overzicht diagnoses
  - [ ] Filter tabs (Actief/Inactief/Alle)
  - [ ] Diagnose cards
  - [ ] Empty state
  - [ ] Dark theme styling

- [ ] DiagnoseFormBlock
  - [ ] ICD-10 zoeker (fuzzy search)
  - [ ] Pre-fill vanuit intent
  - [ ] Edit mode
  - [ ] Status + ernst selectie
  - [ ] Dark theme styling

---

## 13. Summary: De Transformatie voor Behandelaars

```
VAN:                                    NAAR:
────────────────────────────────────────────────────────────────

15-20 klikken per traject        →      3 zinnen + 3 klikken
10-15 minuten per traject        →      3-5 minuten
Menu navigatie                   →      Natuurlijke taal
Handmatige koppeling             →      Automatische koppeling
ICD-10 handmatig zoeken          →      Fuzzy search + pre-fill
Vergeten rapportage             →      Proactieve suggesties

TIJDSBESPARING:
─────────────────────────────────────────────────────────────────
Afspraak plannen:     2-3 min  →  30 sec     (85% sneller)
Rapportage schrijven: 5-8 min  →  2 min      (75% sneller)
Diagnose toevoegen:   3-5 min  →  1 min      (80% sneller)

Per behandelaar per week: ~2 uur terug naar patiëntcontact
```

---

## Wijzigingslog

| Versie | Datum | Wijzigingen |
|--------|-------|-------------|
| 1.0 | 23-12-2024 | Initiële versie - UX/UI specificaties voor diagnostiek workflow |

