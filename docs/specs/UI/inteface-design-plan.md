# Mini-ECD Interface Design - Complete MVP Specification

## Technical Specs
- Target: Desktop only, min-width 1280px
- Optimized for: 1440px - 1920px screens
- Framework: Next.js 15, TailwindCSS, shadcn/ui
- No mobile optimization in MVP

---

## Navigation Architecture

### Two-Level Context System

**LEVEL 1: Behandelaar Context** (No client selected)
- Sidebar shows: Dashboard | Cliënten | Agenda | Rapportage
- Header: No client dropdown (or disabled/empty)
- Focus: Behandelaar's caseload, tasks, and global views

**LEVEL 2: Client Dossier Context** (Client selected)
- Sidebar shows: ← Cliënten | Dashboard | Intake | Diagnose | Behandelplan | Rapportage
- Header: Shows selected client with dropdown "Bas Jansen ▼"
- Focus: Individual client data and treatment information

**Context Switch Trigger:**
- Clicking a client row in the cliënten lijst switches from Level 1 → Level 2
- Clicking "← Cliënten" in sidebar switches from Level 2 → Level 1

---

## Layout Components

### Header Bar (Fixed, 60px height)
- Background: White with subtle bottom border
- Padding: 16px vertical, 24px horizontal
- Layout (flex, space-between):
  - **Left**: "Mini-ECD" text/logo (medium weight)
  - **Center**: Context-aware client selector
    - **In Behandelaar Context**: Empty or behandelaar name (optional)
    - **In Client Dossier Context**: Client dropdown "Bas Jansen ▼" (clickable)
      - Sub-text below: "ID: CL0002 | Geb: 20-11-1992" (small, muted)
      - Dropdown shows recent clients for quick switching
  - **Right**: Search input "Zoek cliënt..." with icon (rounded, light border)
    - Always available for quick client lookup

### Sidebar (Fixed left, 240px width)
- Background: Very light gray
- Padding: 16px

**Context-Aware Navigation:**

**BEHANDELAAR CONTEXT (Level 1) - No client selected:**
- Dashboard (icon + text) → Behandelaar dashboard (caseload, taken, aandachtspunten)
- Cliënten (icon + text) → Caseload overzicht met zoek/filter
- Agenda (icon + text) → Behandelaar agenda (alle afspraken)
- Rapportage (icon + text) → BI dashboards en statistieken

**CLIENT DOSSIER CONTEXT (Level 2) - Client selected:**
- "← Cliënten" button (full width, left-aligned, subtle hover) → Terug naar behandelaar context
- Subtle horizontal divider (8px margin bottom)
- Dashboard (icon + text) → Client dossier overzicht (afgelopen/komende afspraken)
- Intake (icon + text) → Intake gesprekken en notities
- Diagnose (icon + text) → DSM-classificatie, probleemprofiel
- Behandelplan (icon + text) → Doelen, interventies, planning
- Rapportage (icon + text) → Client-specifieke voortgang en metrics

**Styling:**
- Each item: 12px padding vertical, 12px padding horizontal
- Icons: 20px, 12px gap to text
- Item spacing: 4px between items
- Active state: highlighted background, emphasized text, left border accent
- Hover state: subtle background change
- Text: medium weight, 15px

### Main Content Area (Scrollable)
- Background: White
- Padding: 32px all sides
- Min-height: calc(100vh - 60px)

---

## LEVEL 1 SCREENS: Behandelaar Context

---

## Screen 1A: Behandelaar Dashboard

### Sidebar
- **Dashboard** ← ACTIVE
- Cliënten
- Agenda
- Rapportage

### Main Content
**Page title:** "Dashboard" (large, semi-bold)
**Subtitle:** "Welkom terug, [Behandelaar naam]" (optional)

**Content (to be further defined):**
- Caseload overzicht (aantal actieve cliënten, wachtlijst, etc.)
- Aandachtspunten (urgente taken, follow-ups)
- Behandelplannen die nog niet definitief zijn
- Berichten en notificaties
- Recente activiteit
- Aankomende afspraken (vandaag/deze week)

**Note:** Detailed content and layout to be specified in later iteration.

---

## Screen 1B: Cliënten (Search/List View)

### Sidebar
- Dashboard
- **Cliënten** ← ACTIVE
- Agenda
- Rapportage

### Header
- No client dropdown in center (behandelaar context)
- Search bar available in top right

### Main Content
**Top bar:**
- Title: "Cliënten" (large, semi-bold, left)
- Button: "+ Nieuwe Cliënt" (primary style, right)
- Space-between layout

**Search & Filter bar (below title):**
- Full-width input field
- Placeholder: "Zoek op naam, BSN, of cliënt ID..."
- Icon: magnifying glass left side
- Filter options (to be specified):
  - Afdeling filter
  - Team filter
  - Status filter (Actief, Wachtlijst, Afgesloten)
- 16px margin bottom

**Recent clients section (optional):**
- "Recent bekeken" subtitle (small, muted)
- 3-5 most recent client cards (compact)
- Horizontal scroll or grid

**Client list (table/card hybrid):**

Header row:
- Columns: Naam | ID | Geboortedatum | Status | Laatste Contact
- Subtle bottom border, muted text, small size

Client rows (3-4 visible):

Row 1:
- Naam: "Bas Jansen"
- ID: "CL0002"
- Geboortedatum: "20-11-1992"
- Status: "Actief" (green badge)
- Laatste contact: "12-10-2023"
- Hover state: subtle background, pointer cursor
- Click: navigates to client dashboard

Row 2:
- Naam: "Anna de Vries"
- ID: "CL0001"
- Geboortedatum: "15-03-1988"
- Status: "Actief" (green badge)
- Laatste contact: "08-10-2023"

Row 3:
- Naam: "Peter Smit"
- ID: "CL0003"
- Geboortedatum: "22-07-1995"
- Status: "Wachtlijst" (yellow badge)
- Laatste contact: "01-10-2023"

**Empty state (if no clients):**
- Centered icon (users/people illustration)
- Text: "Nog geen cliënten"
- Subtext: "Voeg je eerste cliënt toe om te beginnen"
- "+ Nieuwe Cliënt" button (primary, centered)

**Layout structure:**
```
┌─────────────────────────────────────────────────┐
│ Header: Logo | (no client) | Search              │
├───────────┬─────────────────────────────────────┤
│Dashboard  │ Cliënten         [+ Nieuwe Cliënt]  │
│Cliënten ← │                                      │
│Agenda     │ [Zoek op naam, BSN, of cliënt ID]   │
│Rapportage │ [Filters: Afdeling, Team, Status]   │
│           │                                      │
│           │ Naam      ID      Geb    Status      │
│           │ ──────────────────────────────────   │
│           │ Bas J.    CL0002  20-11  Actief      │
│           │ Anna dV   CL0001  15-03  Actief      │
│           │ Peter S.  CL0003  22-07  Wachtlijst  │
└───────────┴─────────────────────────────────────┘
```

**User action to switch context:**
- Click on a client row (e.g., "Bas Jansen") → Switches to Level 2 (Client Dossier Context)

---

## Screen 1C: Behandelaar Agenda

### Sidebar
- Dashboard
- Cliënten
- **Agenda** ← ACTIVE
- Rapportage

### Main Content
**Page title:** "Agenda" (large, semi-bold)

**Content (to be further defined):**
- Calendar view (week/month)
- Behandelaar's appointments (all clients)
- Appointment details: time, client, type
- Create new appointment button

**Note:** Detailed content and layout to be specified in later iteration.

---

## Screen 1D: Behandelaar Rapportage

### Sidebar
- Dashboard
- Cliënten
- Agenda
- **Rapportage** ← ACTIVE

### Main Content
**Page title:** "Rapportage" (large, semi-bold)

**Content (to be further defined):**
- BI-style dashboards
- KPI's (aantal cliënten, gemiddelde behandelduur, etc.)
- Trends en statistieken
- Export functionaliteit

**Note:** Detailed content and layout to be specified in later iteration.

---

## LEVEL 2 SCREENS: Client Dossier Context

**Context Switch:** User clicked on a client in the cliënten lijst

---

## Screen 2A: Client Dashboard (Dossier Overzicht)

### Header
- **Center**: "Bas Jansen ▼" dropdown visible
  - Sub-text: "ID: CL0002 | Geb: 20-11-1992"
  - Dropdown shows recent clients for quick switching
- **Right**: Search bar still available

### Sidebar
- "← Cliënten" button at top (returns to behandelaar context)
- Horizontal divider
- **Dashboard** ← ACTIVE
- Intake
- Diagnose
- Behandelplan
- Rapportage

### Main Content
**Page title:** "Dossier Overzicht" (large, semi-bold, 16px margin bottom)

**Grid layout:**

**Row 1: 3 equal columns (gap: 24px)**

Column 1 - Cliëntinformatie card:
- Card style: white bg, subtle border, 8px radius, 16px padding
- Title: "Cliëntinformatie" (medium, semi-bold)
- List layout:
  - Label: Value pairs, stacked vertically
  - Cliënt ID: CL0002
  - Naam: Bas Jansen
  - Geboortedatum: 20-11-1992
  - Leeftijd: 31 jaar (computed)
  - Verzekering: [naam verzekeraar]
  - BSN: [nummer]
- Labels: muted, small
- Values: normal weight, darker
- Action: "Bewerken →" link (small, at bottom)

Column 2 - Laatste Intake card:
- Card style: same as column 1
- Title: "Laatste Intake"
- Date/time: "12-10-2023, 14:30" (small, muted)
- Preview text (3 lines max):
  "Bas komt op gesprek vanwege spanningsklachten en paniekeaanvallen. Hij beschrijft situaties in het openbaar vervoer en drukke winkels als triggerend..."
- "Bekijk intake →" link (small, at bottom) → navigates to Intake section

Column 3 - Diagnose card:
- Card style: same as above
- Title: "Diagnose"
- Status badge: "Hoog" (red/warning bg, red text, rounded pill, inline with title)
- Subtitle: "Angststoornissen" (medium weight)
- Description text:
  "Panietstoornis met agorafobie. De frequentie van paniekeaanvallen en het vermijdingsgedrag zijn..."
- "Bekijk diagnose →" link (small, at bottom) → navigates to Diagnose section

**Row 2: Full width (margin top: 24px)**

Behandelplan card:
- Card style: same
- Title: "Behandelplan"
- If exists: Show summary with status badge (Concept, Actief, Afgerond)
- If not exists (empty state):
  - Light gray background section inside card
  - Centered text: "Geen behandelplan gevonden."
  - "+ Maak behandelplan" button (secondary style, centered below)
- "Bekijk behandelplan →" link → navigates to Behandelplan section

**Row 3: Full width (margin top: 24px)**

Afspraken card:
- Card style: same
- Title: "Afspraken"

Section 1:
- Subtitle: "Afgelopen Afspraak" (small, muted, 8px margin bottom)
- Item: "14-11-2025, 16:26 - Intake gesprek" (with subtle icon left)
- Shows: type, duration, practitioner (if available)

Divider line (subtle, 16px margin vertical)

Section 2:
- Subtitle: "Komende Afspraken" (small, muted)
- Item 1: "22-11-2025, 16:26 - Psycho-educatie"
- Item 2: "29-11-2025, 16:26 - Exposure therapie sessie"
- Item 3: "06-12-2025, 16:26 - Evaluatie gesprek"
- Each with subtle left border accent (blue)
- Shows: date, time, type
- If no appointments: "Geen geplande afspraken" (muted text)

**Layout structure:**
```
┌──────────────────────────────────────────────────┐
│ Header: Logo | Bas Jansen ▼ | Search             │
│              | ID: CL0002 | Geb: 20-11-1992      │
├──────────┬───────────────────────────────────────┤
│← Cliënten│ Dossier Overzicht                     │
│──────    │                                       │
│Dashboard │ ┌─────────┬─────────┬──────────┐     │
│Intake    │ │  Info   │ Intake  │ Diagnose │     │
│Diagnose  │ │  Card   │  Card   │  Card    │     │
│Behandel  │ └─────────┴─────────┴──────────┘     │
│Rapport   │ ┌──────────────────────────────┐     │
│          │ │    Behandelplan Card         │     │
│          │ └──────────────────────────────┘     │
│          │ ┌──────────────────────────────┐     │
│          │ │    Afspraken Card            │     │
│          │ └──────────────────────────────┘     │
└──────────┴───────────────────────────────────────┘
```

---

## Screen 2B: Intake (Client Dossier)

### Header
- **Center**: "Bas Jansen ▼" with ID and birthdate
- **Right**: Search bar available

### Sidebar
- "← Cliënten" button (returns to behandelaar context)
- Divider
- Dashboard
- **Intake** ← ACTIVE
- Diagnose
- Behandelplan
- Rapportage

### Main Content
**Breadcrumb:** "Intakes > Overzicht"

**Top bar (flex, space-between):**
- Title: "Intakes" (large, semi-bold, left)
- Button: "+ Nieuwe Intake" (primary style, right)

**Intakes list (16px margin top):**

Header row:
- Columns: Datum | Type | Status | Samenvatting | Acties
- Subtle bottom border, muted text, small font
- 8px padding bottom

Intake item 1 (card-like row):
- Padding: 16px vertical
- Bottom border (subtle)
- Hover state: light background

Content:
- Date: "12-10-2023, 14:30" (medium weight)
- Type: "Intake gesprek" (small badge/pill, light blue bg)
- Status: "Afgerond" (small badge/pill, green bg)
- Summary: "Eerste intake. Cliënt presenteert zich met angst- en paniekkl..." (truncated ~60 chars, lighter weight)
- Actions: "Bekijk" button (small, secondary style, becomes prominent on row hover)

Intake item 2:
- Date: "05-10-2023, 10:15"
- Type: "Telefonische intake" (badge)
- Status: "Afgerond" (green badge)
- Summary: "Korte telefonische screening. Doorverwijzing naar intake..."
- Actions: "Bekijk" button

Intake item 3:
- Date: "28-09-2023, 16:00"
- Type: "Intake gesprek" (badge)
- Status: "Afgerond" (green badge)
- Summary: "Geen show. Cliënt niet verschenen, geen afmelding..."
- Actions: "Bekijk" button

**Empty state (alternative if no intakes):**
- Centered layout
- Icon: document/clipboard illustration (gray, 64px)
- Text: "Nog geen intakes" (medium, semi-bold)
- Subtext: "Klik op 'Nieuwe Intake' om te beginnen" (small, muted)
- "+ Nieuwe Intake" button (primary, centered, 16px margin top)

**Layout structure:**
```
┌──────────────────────────────────────────────────┐
│ Header: Logo | Bas Jansen ▼ | Search             │
│              | ID: CL0002 | Geb: 20-11-1992      │
├──────────┬───────────────────────────────────────┤
│← Cliënten│ Intake             [+ Nieuwe Intake]  │
│──────    │                                       │
│Dashboard │ Datum    Type     Status  Samenvat..  │
│Intake  ← │ ─────────────────────────────────     │
│Diagnose  │ 12-10    Intake   Afgr.   Eerste...   │
│Behandel  │ 05-10    Telef.   Afgr.   Korte...    │
│Rapport   │ 28-09    Intake   Afgr.   Geen sh...  │
│          │                                       │
└──────────┴───────────────────────────────────────┘
```

---

## Screen 2C: Diagnose (Client Dossier)

### Header
- **Center**: "Bas Jansen ▼" with ID and birthdate
- **Right**: Search bar available

### Sidebar
- "← Cliënten" button (returns to behandelaar context)
- Divider
- Dashboard
- Intake
- **Diagnose** ← ACTIVE
- Behandelplan
- Rapportage

### Main Content
**Top bar:**
- Title: "Diagnose & Probleemprofiel" (large, semi-bold, left)
- Button: "AI Analyse" (primary style with sparkles icon, right)

**DSM-light Categorieën:**
- Visual grid/dashboard showing classified problem areas
- Categories:
  - Stemming & Depressie (blauw)
  - Angst (paars)
  - Gedrag & Impuls (rood)
  - Middelengebruik (oranje)
  - Cognitief (groen)
  - Context & Psychosociaal (teal)

**Ernst Indicatie:**
- Visual indicator: Laag (green) | Middel (yellow) | Hoog (red)
- Linked to intake sources (bronverwijzing)

**Content (to be further defined in Week 3):**
- AI-generated classification based on intake notes
- Manual override/editing capability
- Timeline/history of diagnoses
- Notes and observations section

**Layout structure:**
```
┌──────────────────────────────────────────────────┐
│ Header: Logo | Bas Jansen ▼ | Search             │
├──────────┬───────────────────────────────────────┤
│← Cliënten│ Diagnose & Probleemprofiel [AI Analyse]│
│──────    │                                       │
│Dashboard │ DSM-light Categorieën:                │
│Intake    │ ┌────────┬────────┬────────┐         │
│Diagnose← │ │Stemming│ Angst  │ Gedrag │         │
│Behandel  │ │ Hoog   │Middel  │  Laag  │         │
│Rapport   │ └────────┴────────┴────────┘         │
│          │ ┌──────────────────────────┐         │
│          │ │ Ernst: ●●●○○ (Hoog)     │         │
│          │ │ Bronnen: Intake 12-10   │         │
│          │ └──────────────────────────┘         │
└──────────┴───────────────────────────────────────┘
```

---

## Screen 2D: Behandelplan (Client Dossier)

### Header
- **Center**: "Bas Jansen ▼" with ID and birthdate
- **Right**: Search bar available

### Sidebar
- "← Cliënten" button (returns to behandelaar context)
- Divider
- Dashboard
- Intake
- Diagnose
- **Behandelplan** ← ACTIVE
- Rapportage

### Main Content
**Top bar:**
- Title: "Behandelplan" (large, semi-bold, left)
- Buttons: 
  - "Genereer Plan" (primary style with AI icon, right)
  - "Nieuwe Versie" (secondary style, if plan exists)

**Plan Structuur:**
1. **SMART Doelen** section
   - Specifieke, Meetbare, Acceptabele, Realistische, Tijdgebonden doelen
   - Multiple goals per plan
   - Status tracking per goal

2. **Interventies** section
   - Evidence-based behandelmethoden (CGT, ACT, EMDR, etc.)
   - Linked to specific goals
   - Description and rationale

3. **Frequentie & Planning** section
   - Sessie planning
   - Behandelintensiteit
   - Duration estimate

4. **Meetmomenten** section
   - Evaluation schedule
   - Progress measurements
   - Review dates

**Versioning:**
- Multiple versions per client (v1, v2, etc.)
- Status: Concept | Actief | Afgerond
- Timestamp and practitioner info

**Content (to be further defined in Week 3):**
- AI plan generator based on intake + diagnose
- JSONB data structure for flexibility
- PDF export functionality

**Layout structure:**
```
┌──────────────────────────────────────────────────┐
│ Header: Logo | Bas Jansen ▼ | Search             │
├──────────┬───────────────────────────────────────┤
│← Cliënten│ Behandelplan      [Genereer Plan]    │
│──────    │                                       │
│Dashboard │ Versie 1 - Actief | 12-10-2023       │
│Intake    │                                       │
│Diagnose  │ 1. SMART Doelen                       │
│Behandel← │ ┌──────────────────────────────┐     │
│Rapport   │ │ • Verminderen paniekeaanv..  │     │
│          │ │ • Uitbreiden sociale activ.. │     │
│          │ └──────────────────────────────┘     │
│          │ 2. Interventies                       │
│          │ ┌──────────────────────────────┐     │
│          │ │ • CGT - Cognitieve herstr... │     │
│          │ │ • Exposure therapie          │     │
│          │ └──────────────────────────────┘     │
└──────────┴───────────────────────────────────────┘
```

---

## Screen 2E: Rapportage (Client Dossier)

### Header
- **Center**: "Bas Jansen ▼" with ID and birthdate
- **Right**: Search bar available

### Sidebar
- "← Cliënten" button (returns to behandelaar context)
- Divider
- Dashboard
- Intake
- Diagnose
- Behandelplan
- **Rapportage** ← ACTIVE

### Main Content
**Page title:** "Rapportage & Voortgang" (large, semi-bold)

**Content (to be further defined):**
- Client-specific progress metrics
- Treatment timeline
- Session attendance
- Goal achievement tracking
- Measurement instruments (ROM, questionnaires)
- Graphs and visualizations
- Export functionality (PDF, CSV)

**Layout structure:**
```
┌──────────────────────────────────────────────────┐
│ Header: Logo | Bas Jansen ▼ | Search             │
├──────────┬───────────────────────────────────────┤
│← Cliënten│ Rapportage & Voortgang               │
│──────    │                                       │
│Dashboard │ ┌──────────────────────────────┐     │
│Intake    │ │ Behandelduur: 8 weken        │     │
│Diagnose  │ │ Sessies: 6 van 12            │     │
│Behandel  │ │ Voortgang: ████████░░░░ 67%  │     │
│Rapport ← │ └──────────────────────────────┘     │
│          │                                       │
│          │ Doelvoortgang:                        │
│          │ [Graph/Chart placeholder]             │
└──────────┴───────────────────────────────────────┘
```

---

## Intake Detail View (Modal/Slide-in)

**Trigger:** Click "Bekijk" button on any intake item

**Display options:**
1. Slide-in panel from right (400px width, overlays content)
2. Modal overlay (centered, 600px width, backdrop blur)

**Recommended: Slide-in panel** (keeps context visible)

### Slide-in Panel Structure

**Header (sticky):**
- Background: light gray
- Padding: 16px
- Title: "Intake - 12-10-2023" (medium, semi-bold)
- Close button: "×" (top right, large, clickable)

**Content (scrollable):**

Section 1 - Algemene informatie:
- Background: white
- Padding: 16px
- Title: "Algemene informatie" (small, semi-bold, 8px margin bottom)
- Items (label: value):
  - Datum & tijd: 12-10-2023, 14:30
  - Type: Intake gesprek
  - Behandelaar: [naam]
  - Duur: 60 minuten

Divider (subtle, 16px margin vertical)

Section 2 - Gespreksnotities:
- Title: "Gespreksnotities" (small, semi-bold)
- Text area (full content, scrollable if long):
  "Bas komt op gesprek vanwege spanningsklachten en paniekeaanvallen. Hij beschrijft situaties in het openbaar vervoer en drukke winkels als triggerend. De aanvallen kenmerken zich door hartkloppingen, duizeligheid en benauwdheid.
  
  Anamnese: Klachten bestaan sinds ongeveer 1 jaar. Begonnen na stressvolle periode op werk. Eerste aanval in supermarkt, sindsdien toenemend vermijdingsgedrag.
  
  Observatie: Cliënt presenteert zich alert en coöperatief. Spreekt openlijk over klachten. Lichte spanning zichtbaar bij bespreken van aanvallen..."

Divider

Section 3 - AI Samenvatting (optional for MVP):
- Background: very light blue (distinguish from manual notes)
- Padding: 12px
- Icon: sparkles/AI icon (small, top left)
- Title: "AI Samenvatting" (small, semi-bold)
- Generated text: bullet points with key findings
- Font: slightly smaller than main text

Divider

**Footer (sticky bottom):**
- Background: light gray
- Padding: 16px
- Buttons layout (flex, space-between):
  - Left: "Verwijderen" button (destructive/red style, subtle)
  - Right: "Bewerken" button (secondary style)

---

## Design Tokens Reference

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Border Radius
- Small (badges): 12px
- Medium (buttons): 6px
- Large (cards): 8px

### Typography Scale
- Page title: 28px, semi-bold
- Card title: 18px, semi-bold
- Section title: 14px, semi-bold
- Body text: 15px, normal
- Small text: 13px, normal
- Tiny text: 12px, normal

### Shadows
- Card: 0 1px 3px rgba(0,0,0,0.1)
- Card hover: 0 4px 6px rgba(0,0,0,0.1)
- Modal: 0 20px 25px rgba(0,0,0,0.15)

### Common Patterns

**Card component:**
- White background
- Border: 1px solid (light gray)
- Border radius: 8px
- Padding: 16px
- Shadow: subtle (see above)

**Badge/pill component:**
- Small font size (13px)
- Padding: 4px 12px
- Border radius: 12px (full rounded)
- Background: contextual (green for success, yellow for warning, etc.)
- Font weight: medium

**Button styles:**
- Primary: solid background, white text, medium weight
- Secondary: border outline, normal text
- Destructive: red color scheme
- Padding: 8px 16px
- Border radius: 6px

**List/table row:**
- Padding: 16px vertical
- Border bottom: 1px solid (light gray)
- Hover: light background change
- Cursor: pointer (if clickable)

---

## Interaction Notes

### Navigation flow:
1. Start: Behandelaar Dashboard (Level 1)
2. Sidebar navigation: Dashboard | Cliënten | Agenda | Rapportage
3. Click "Cliënten" → Cliënten list view
4. Click client row → Context switch to Level 2 (Client Dossier)
5. Sidebar changes to: ← Cliënten | Dashboard | Intake | Diagnose | Behandelplan | Rapportage
6. Header shows selected client: "Bas Jansen ▼" with dropdown
7. Navigate within client dossier using sidebar menu
8. Click "← Cliënten" → Context switch back to Level 1
9. Header client dropdown always available (in Level 2) for quick client switching
10. Header search always available for quick client lookup

### State management:
- Active menu item: always visible (highlighted)
- Breadcrumbs: show current location
- Empty states: guide users to next action
- Loading states: skeleton screens for cards (not specified, but recommended)

### Accessibility considerations:
- All interactive elements: keyboard accessible
- Focus states: visible outlines
- Color contrast: WCAG AA minimum
- Alt text for icons (not visible, but in code)

---

## Technical Implementation Notes

### Routing structure (Next.js):
```
LEVEL 1: Behandelaar Context
/epd/dashboard              → Behandelaar dashboard (caseload, taken, aandachtspunten)
/epd/clients                → Cliënten list (zoek, filter, recent)
/epd/agenda                 → Behandelaar agenda (alle afspraken)
/epd/reports                → BI rapportage (statistieken, KPI's)

LEVEL 2: Client Dossier Context
/epd/clients/[id]           → Client dashboard (dossier overzicht)
/epd/clients/[id]/intake    → Intake lijst en notities
/epd/clients/[id]/intake/[intakeId] → Intake detail (modal/slide-in)
/epd/clients/[id]/diagnose  → Diagnose en probleemprofiel
/epd/clients/[id]/plan      → Behandelplan (SMART doelen, interventies)
/epd/clients/[id]/reports   → Client rapportage (voortgang, metrics)

Utility routes:
/epd/clients/new            → Nieuwe cliënt formulier
/epd/clients/[id]/edit      → Cliënt gegevens bewerken
```

### Component structure:
```
app/epd/
├── layout.tsx                      // Root EPD layout (detects context)
├── components/
│   ├── epd-header.tsx             // Context-aware header
│   └── epd-sidebar.tsx            // Context-aware sidebar
│
├── dashboard/
│   └── page.tsx                   // Behandelaar dashboard
│
├── clients/
│   ├── page.tsx                   // Cliënten lijst (Level 1)
│   ├── components/
│   │   ├── client-list.tsx
│   │   ├── client-search.tsx
│   │   └── client-filters.tsx
│   ├── new/
│   │   └── page.tsx               // Nieuwe cliënt form
│   └── [id]/
│       ├── layout.tsx             // Client dossier layout (Level 2 context)
│       ├── page.tsx               // Client dashboard (dossier overzicht)
│       ├── edit/
│       │   └── page.tsx           // Edit client
│       ├── intake/
│       │   ├── page.tsx           // Intake lijst
│       │   ├── components/
│       │   │   ├── intake-list.tsx
│       │   │   └── intake-editor.tsx
│       │   └── [intakeId]/
│       │       └── page.tsx       // Intake detail (modal/slide-in)
│       ├── diagnose/
│       │   ├── page.tsx           // Diagnose & probleemprofiel
│       │   └── components/
│       │       ├── dsm-categories.tsx
│       │       └── severity-indicator.tsx
│       ├── plan/
│       │   ├── page.tsx           // Behandelplan
│       │   └── components/
│       │       ├── smart-goals.tsx
│       │       ├── interventions.tsx
│       │       └── plan-generator.tsx
│       └── reports/
│           ├── page.tsx           // Client rapportage
│           └── components/
│               ├── progress-chart.tsx
│               └── metrics-dashboard.tsx
│
├── agenda/
│   └── page.tsx                   // Behandelaar agenda
│
└── reports/
    └── page.tsx                   // BI rapportage (behandelaar)
```

### Key Implementation Details:

**app/epd/layout.tsx:**
- Detects current context (Level 1 vs Level 2) based on URL
- Passes context to EPDSidebar and EPDHeader
- Manages global state for selected client

**app/epd/clients/[id]/layout.tsx:**
- Wraps all client dossier pages
- Fetches client data and provides to children
- Ensures sidebar shows Level 2 navigation
- Ensures header shows client dropdown

**Context Detection Logic:**
```typescript
// In app/epd/layout.tsx
const isClientDossier = pathname.includes('/clients/') && 
                        pathname.match(/\/clients\/[^\/]+\/?[^\/]*$/);
const clientId = isClientDossier ? pathname.split('/')[3] : null;
```

### Data requirements:
- Client list: id, name, bsn, birthdate, status, last_contact
- Dashboard: aggregate data from intakes, problem profile, treatment plan
- Intakes: date, type, status, summary, full_notes, practitioner
- Problem profile: severity, diagnoses, notes
- Treatment plan: goals, interventions, status
- Appointments: date, type, notes

---

## Out of Scope for MVP
- Mobile responsive design
- Dark mode
- Multi-user roles/permissions
- Advanced filtering (beyond search)
- Bulk actions
- Export functionality
- Calendar integration
- Notifications system
- Audit logs
- Custom fields
- Templates for intakes/plans

These can be added post-MVP based on user feedback.