# Mini-ECD Interface Mocks & User Flow

## User Flow Overview
```
START
  ↓
[Cliënten Lijst] ←──────────────────┐
  ↓ (klik op cliënt)                │
  ↓                                 │
[Dashboard - Bas Jansen] ←─────┐   │
  ↓                            │   │
  ├─→ [Intakes]                │   │
  ├─→ [Probleemprofiel]        │   │
  ├─→ [Behandelplan]           │   │
  └─→ [Agenda]                 │   │
       ↓                       │   │
  (sidebar menu switch)────────┘   │
       ↓                           │
  (← Cliënten button)──────────────┘
       ↓
  (header search) → Quick switch to other client
       ↓
  [Dashboard - Anna de Vries]
```

---

## Mock 1: Cliënten Lijst (Entry Point)
```
┌────────────────────────────────────────────────────────────────┐
│  Mini-ECD                                    [Zoek cliënt...]  │
└────────────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────────────────────────────┐
│             │                                                  │
│ Dashboard   │  Cliënten               [+ Nieuwe Cliënt]       │
│ Cliënten ◄  │                                                  │
│ Agenda      │  [Zoek op naam, BSN, of cliënt ID...........]   │
│ Rapportage  │                                                  │
│             │  Naam          ID      Geb        Status         │
│             │  ────────────────────────────────────────        │
│             │  Bas Jansen    CL0002  20-11-1992 ● Actief      │
│             │  Anna de Vries CL0001  15-03-1988 ● Actief      │
│             │  Peter Smit    CL0003  22-07-1995 ● Wachtlijst  │
│             │  Maria Jansen  CL0004  11-09-1990 ● Actief      │
│             │                                                  │
│             │                                                  │
└─────────────┴──────────────────────────────────────────────────┘

User actions:
→ Type in zoekbalk: filters lijst real-time
→ Klik op rij (bijv. Bas Jansen): navigeer naar zijn Dashboard
→ Klik [+ Nieuwe Cliënt]: open modal/form om nieuwe cliënt toe te voegen
```

---

## Mock 2: Dashboard (Client Dossier - Bas Jansen)
```
┌────────────────────────────────────────────────────────────────┐
│  Mini-ECD     Bas Jansen ▼                  [Zoek cliënt...]  │
│               ID: CL0002 | Geb: 20-11-1992                     │
└────────────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────────────────────────────┐
│             │                                                  │
│ ← Cliënten  │  Dashboard Overzicht                            │
│ ─────────   │                                                  │
│ Dashboard ◄ │  ┌──────────────┬──────────────┬──────────────┐ │
│ Intakes     │  │Cliëntinfo    │Laatste Intake│Probleemprofiel│ │
│ Probleem    │  │              │              │               │ │
│ Behandel    │  │ID: CL0002    │12-10-2023    │Hoog ●        │ │
│ Agenda      │  │Naam: Bas J.  │              │Angststoornis │ │
│             │  │Geb: 20-11-92 │"Bas komt op  │Panietstoornis│ │
│             │  │Verz: [naam]  │gesprek..."   │met agorafobie│ │
│             │  │              │              │              │ │
│             │  │              │Lees meer →   │Bekijk →      │ │
│             │  └──────────────┴──────────────┴──────────────┘ │
│             │                                                  │
│             │  ┌────────────────────────────────────────────┐  │
│             │  │ Behandelplan                              │  │
│             │  │                                           │  │
│             │  │ Geen behandelplan gevonden.               │  │
│             │  │                                           │  │
│             │  │      [+ Maak behandelplan]                │  │
│             │  └────────────────────────────────────────────┘  │
│             │                                                  │
│             │  ┌────────────────────────────────────────────┐  │
│             │  │ Afspraken                                 │  │
│             │  │                                           │  │
│             │  │ Laatste Afspraak                          │  │
│             │  │ │ 14-11-2025, 16:26 - Intake              │  │
│             │  │                                           │  │
│             │  │ Eerstvolgende 3 Afspraken                 │  │
│             │  │ │ 22-11-2025, 16:26 - Psycho-educatie     │  │
│             │  │ │ 29-11-2025, 16:26 - Exposure therapie   │  │
│             │  │ │ 06-12-2025, 16:26 - Evaluatie           │  │
│             │  └────────────────────────────────────────────┘  │
│             │                                                  │
└─────────────┴──────────────────────────────────────────────────┘

User actions:
→ Klik "← Cliënten": terug naar cliëntenlijst
→ Klik "Bas Jansen ▼": dropdown met recente/favoriete cliënten
→ Type in [Zoek cliënt]: autocomplete zoeken, direct switchen
→ Klik sidebar item (bijv. Intakes): navigeer naar dat scherm
→ Klik "Lees meer" of "Bekijk": navigeer naar detail scherm
→ Klik [+ Maak behandelplan]: open behandelplan wizard
```

---

## Mock 3: Intakes (Client Dossier - Bas Jansen)
```
┌────────────────────────────────────────────────────────────────┐
│  Mini-ECD     Bas Jansen ▼                  [Zoek cliënt...]  │
│               ID: CL0002 | Geb: 20-11-1992                     │
└────────────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────────────────────────────┐
│             │                                                  │
│ ← Cliënten  │  Intakes                    [+ Nieuwe Intake]   │
│ ─────────   │                                                  │
│ Dashboard   │  Datum      Type        Status    Samenvatting  │
│ Intakes   ◄ │  ─────────────────────────────────────────────  │
│ Probleem    │                                                  │
│ Behandel    │  12-10-2023 Intake      ●Afgerond               │
│ Agenda      │  14:30      gesprek                             │
│             │             Eerste intake. Cliënt presenteert   │
│             │             zich met angst- en paniekkl...      │
│             │                                      [Bekijk]   │
│             │  ───────────────────────────────────────────────│
│             │                                                  │
│             │  05-10-2023 Telefonisch ●Afgerond               │
│             │  10:15      intake                              │
│             │             Korte telefonische screening.       │
│             │             Doorverwijzing naar intake...       │
│             │                                      [Bekijk]   │
│             │  ───────────────────────────────────────────────│
│             │                                                  │
│             │  28-09-2023 Intake      ●Afgerond               │
│             │  16:00      gesprek                             │
│             │             Geen show. Cliënt niet verschenen,  │
│             │             geen afmelding...                   │
│             │                                      [Bekijk]   │
│             │                                                  │
└─────────────┴──────────────────────────────────────────────────┘

User actions:
→ Klik [+ Nieuwe Intake]: open intake form/wizard
→ Klik [Bekijk]: open intake detail (zie Mock 4)
→ Hover over rij: highlight, [Bekijk] button wordt prominent
→ Sidebar/header navigation: zelfde als Dashboard
```

---

## Mock 4: Intake Detail (Slide-in Panel)
```
┌────────────────────────────────────────────────────────────────┐
│  Mini-ECD     Bas Jansen ▼                  [Zoek cliënt...]  │
│               ID: CL0002 | Geb: 20-11-1992                     │
└────────────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────┬───────────────────────┐
│             │                          │                       │
│ ← Cliënten  │  Intakes     [+ Nieuwe]  │ Intake - 12-10-2023 ✕ │
│ ─────────   │                          │ ─────────────────────│
│ Dashboard   │  Datum    Type    Status │ Algemene informatie  │
│ Intakes   ◄ │  ───────────────────     │                      │
│ Probleem    │                          │ Datum & tijd:        │
│ Behandel    │  12-10 Intake ●Afgr.     │ 12-10-2023, 14:30    │
│ Agenda      │  [row highlighted]       │                      │
│             │         [Bekijk]         │ Type: Intake gesprek │
│             │  ─────────────────       │ Behandelaar: [naam]  │
│             │                          │ Duur: 60 minuten     │
│             │  05-10 Telef. ●Afgr.     │                      │
│             │         [Bekijk]         │ ───────────────────  │
│             │  ─────────────────       │                      │
│             │                          │ Gespreksnotities     │
│             │  28-09 Intake ●Afgr.     │                      │
│             │         [Bekijk]         │ Bas komt op gesprek  │
│             │                          │ vanwege spannings-   │
│             │                          │ klachten en paniek-  │
│             │                          │ aanvallen. Hij be-   │
│             │                          │ schrijft situaties   │
│             │                          │ in het openbaar...   │
│             │                          │                      │
│             │                          │ Anamnese: Klachten   │
│             │                          │ bestaan sinds 1 jaar │
│             │                          │ Begonnen na stress-  │
│             │                          │ volle periode...     │
│             │                          │                      │
│             │                          │ [scrollable content] │
│             │                          │                      │
│             │                          │ ───────────────────  │
│             │                          │                      │
│             │                          │ [Verwijderen] [Bewerken]│
│             │                          │                      │
└─────────────┴──────────────────────────┴───────────────────────┘

User actions:
→ Klik ✕: sluit panel, terug naar Intakes lijst
→ Klik [Bewerken]: open intake in edit mode
→ Klik [Verwijderen]: confirmatie dialog → verwijder intake
→ Scroll in panel: bekijk volledige notities
→ Klik buiten panel (op main content): sluit panel
```

---

## Mock 5: Client Switcher (Dropdown from Header)
```
┌────────────────────────────────────────────────────────────────┐
│  Mini-ECD   ┌─────────────────────────┐  [Zoek cliënt...]    │
│             │ Bas Jansen ▼            │                       │
│             │ ID: CL0002 | 20-11-1992 │                       │
│             ├─────────────────────────┤                       │
│             │ Recente cliënten:       │                       │
│             │ ─────────────────────   │                       │
│             │ ● Anna de Vries         │                       │
│             │   CL0001 | 15-03-1988   │                       │
│             │                         │                       │
│             │ ● Peter Smit            │                       │
│             │   CL0003 | 22-07-1995   │                       │
│             │                         │                       │
│             │ ─────────────────────   │                       │
│             │ [Alle cliënten →]       │                       │
│             └─────────────────────────┘                       │
└────────────────────────────────────────────────────────────────┘

User actions:
→ Klik op naam in dropdown: switch naar die cliënt (blijf op zelfde scherm type)
→ Klik [Alle cliënten →]: ga naar cliëntenlijst
→ Klik buiten dropdown: sluit dropdown
```

---

## Complete User Flow Scenarios

### Scenario 1: Nieuwe intake toevoegen
```
1. User zit in [Cliënten Lijst]
2. Klik op "Bas Jansen" rij
3. Navigeer naar [Dashboard - Bas Jansen]
4. Klik sidebar "Intakes"
5. Navigeer naar [Intakes - Bas Jansen]
6. Klik [+ Nieuwe Intake]
7. Open intake form modal
8. Vul gegevens in, klik [Opslaan]
9. Modal sluit, nieuwe intake verschijnt bovenaan lijst
```

### Scenario 2: Tussen cliënten switchen tijdens werk
```
1. User zit in [Intakes - Bas Jansen]
2. Type "Anna" in header zoekbalk
3. Zie autocomplete resultaat "Anna de Vries"
4. Klik op resultaat
5. Navigeer naar [Intakes - Anna de Vries] (zelfde scherm type)
```

### Scenario 3: Van detail terug naar overzicht
```
1. User zit in [Dashboard - Bas Jansen]
2. Klik "Lees meer" op Intake card
3. Navigeer naar [Intakes - Bas Jansen]
4. Klik [Bekijk] op specifieke intake
5. Intake detail panel opent
6. Lees notities, klik ✕
7. Panel sluit, terug op [Intakes - Bas Jansen]
8. Klik "← Cliënten" in sidebar
9. Navigeer naar [Cliënten Lijst]
```

### Scenario 4: Quick client switch via dropdown
```
1. User zit in [Behandelplan - Bas Jansen]
2. Klik "Bas Jansen ▼" in header
3. Dropdown opent met recente cliënten
4. Klik "Anna de Vries"
5. Navigeer naar [Behandelplan - Anna de Vries]
```

---

## Navigation Rules

### Sidebar "← Cliënten" button:
- Altijd zichtbaar in client dossier views
- Navigeert naar [Cliënten Lijst]
- Keyboard shortcut: Esc (of Alt+C)

### Header client dropdown:
- Toont laatste 3-5 bezochte cliënten
- Link naar volledige cliëntenlijst onderaan
- Switchen behoudt huidige scherm type (Dashboard→Dashboard, Intakes→Intakes)

### Header zoekbalk:
- Live autocomplete tijdens typen
- Zoekt op: naam, BSN, cliënt ID
- Enter of klik op resultaat: switch naar Dashboard van die cliënt
- Keyboard shortcut: Cmd/Ctrl+K

### Sidebar menu items:
- Tonen alleen client-specifieke items als client geselecteerd
- Active state altijd duidelijk gemarkeerd
- Klikken navigeert binnen hetzelfde client dossier

---

## State Persistence

### User komt terug in app:
- Heropent laatste bezochte scherm
- Als dat een client dossier was: toon die client
- Als sessie verlopen: start bij [Cliënten Lijst]

### Browser refresh:
- URL bepaalt welk scherm getoond wordt
- `/clients` → Cliënten lijst
- `/clients/CL0002/dashboard` → Dashboard van Bas
- `/clients/CL0002/intakes` → Intakes van Bas

### Recent clients lijst:
- Wordt bijgewerkt bij elke client switch
- Max 5 items
- Gesorteerd op laatst bezocht (nieuwste bovenaan)