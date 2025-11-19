# Mini-ECD Interface Design - Complete MVP Specification

## Technical Specs
- Target: Desktop only, min-width 1280px
- Optimized for: 1440px - 1920px screens
- Framework: Next.js 15, TailwindCSS, shadcn/ui
- No mobile optimization in MVP

---

## Layout Components (Consistent across all views)

### Header Bar (Fixed, 60px height)
- Background: White with subtle bottom border
- Padding: 16px vertical, 24px horizontal
- Layout (flex, space-between):
  - **Left**: "Mini-ECD" text/logo (medium weight)
  - **Center**: Client dropdown "Bas Jansen ▼" (clickable)
    - Sub-text below: "ID: CL0002 | Geb: 20-11-1992" (small, muted)
  - **Right**: Search input "Zoek cliënt..." with icon (rounded, light border)

### Sidebar (Fixed left, 240px width)
- Background: Very light gray
- Padding: 16px

**Top section (when in client dossier):**
- "← Cliënten" button (full width, left-aligned, subtle hover)
- Subtle horizontal divider (8px margin bottom)

**Menu items:**
- Dashboard (icon + text)
- Intakes (icon + text)
- Probleemprofiel (icon + text)
- Behandelplan (icon + text)
- Agenda (icon + text)

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

## Screen 1: Cliënten (Search/List View)

### Sidebar (different in this view)
- No "← Cliënten" button (we're already here)
- Menu items:
  - Dashboard (global, for practitioner)
  - **Cliënten** ← ACTIVE
  - Agenda (global, all appointments)
  - Rapportage (global, statistics)

### Main Content
**Top bar:**
- Title: "Cliënten" (large, semi-bold, left)
- Button: "+ Nieuwe Cliënt" (primary style, right)
- Space-between layout

**Search bar (below title):**
- Full-width input field
- Placeholder: "Zoek op naam, BSN, of cliënt ID..."
- Icon: magnifying glass left side
- 16px margin bottom

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
│Rapportage │                                      │
│           │ Naam      ID      Geb    Status      │
│           │ ──────────────────────────────────   │
│           │ Bas J.    CL0002  20-11  Actief      │
│           │ Anna dV   CL0001  15-03  Actief      │
│           │ Peter S.  CL0003  22-07  Wachtlijst  │
└───────────┴─────────────────────────────────────┘
```

---

## Screen 2: Dashboard (Client Dossier)

### Header
- Same as default, but with "Bas Jansen ▼" visible in center

### Sidebar
- "← Cliënten" button at top
- Horizontal divider
- **Dashboard** ← ACTIVE
- Intakes
- Probleemprofiel
- Behandelplan
- Agenda

### Main Content
**Breadcrumb:** "Dashboard > Overzicht" (small, muted)

**Page title:** "Dashboard Overzicht" (large, semi-bold, 16px margin bottom)

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
  - Verzekering: [naam verzekeraar]
  - BSN: [nummer]
- Labels: muted, small
- Values: normal weight, darker

Column 2 - Laatste Intake card:
- Card style: same as column 1
- Title: "Laatste Intake Notitie"
- Date/time: "Intake - 12-10-2023" (small, muted)
- Preview text (3 lines max):
  "Bas komt op gesprek vanwege spanningsklachten en paniekeaanvallen. Hij beschrijft situaties in het openbaar vervoer en drukke winkels als triggerend. De aanvallen kenmerken zich door..."
- "Lees meer →" link (small, at bottom)

Column 3 - Probleemprofiel card:
- Card style: same as above
- Title: "Probleemprofiel"
- Status badge: "Hoog" (red/warning bg, red text, rounded pill, inline with title)
- Subtitle: "Angststoornissen" (medium weight)
- Description text:
  "Opmerkingen: Panietstoornis met agorafobie. De frequentie van paniekeaanvallen en het vermijdingsgedrag zijn..."
- "Bekijk profiel →" link (small, at bottom)

**Row 2: Full width (margin top: 24px)**

Behandelplan card:
- Card style: same
- Title: "Behandelplan"
- Empty state:
  - Light gray background section inside card
  - Centered text: "Geen behandelplan gevonden."
  - "+ Maak behandelplan" button (secondary style, centered below)

**Row 3: Full width (margin top: 24px)**

Afspraken card:
- Card style: same
- Title: "Afspraken"

Section 1:
- Subtitle: "Laatste Afspraak" (small, muted, 8px margin bottom)
- Item: "14-11-2025, 16:26 - Intake" (with subtle icon left)

Divider line (subtle, 16px margin vertical)

Section 2:
- Subtitle: "Eerstvolgende 3 Afspraken" (small, muted)
- Item 1: "22-11-2025, 16:26 - Psycho-educatie"
- Item 2: "29-11-2025, 16:26 - Exposure therapie sessie"
- Item 3: "06-12-2025, 16:26 - Evaluatie gesprek"
- Each with subtle left border accent (blue)

**Layout structure:**
```
┌──────────────────────────────────────────────────┐
│ Header: Logo | Bas Jansen ▼ | Search             │
├──────────┬───────────────────────────────────────┤
│← Cliënten│ Dashboard Overzicht                   │
│──────    │                                       │
│Dashboard │ ┌─────────┬─────────┬──────────┐     │
│Intakes   │ │  Info   │ Intake  │ Problem  │     │
│Probleem  │ │  Card   │  Card   │  Card    │     │
│Behandel  │ └─────────┴─────────┴──────────┘     │
│Agenda    │ ┌──────────────────────────────┐     │
│          │ │    Behandelplan Card         │     │
│          │ └──────────────────────────────┘     │
│          │ ┌──────────────────────────────┐     │
│          │ │    Afspraken Card            │     │
│          │ └──────────────────────────────┘     │
└──────────┴───────────────────────────────────────┘
```

---

## Screen 3: Intakes (Client Dossier)

### Header
- Same, "Bas Jansen ▼" in center

### Sidebar
- "← Cliënten" button
- Divider
- Dashboard
- **Intakes** ← ACTIVE
- Probleemprofiel
- Behandelplan
- Agenda

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
├──────────┬───────────────────────────────────────┤
│← Cliënten│ Intakes            [+ Nieuwe Intake]  │
│──────    │                                       │
│Dashboard │ Datum    Type     Status  Samenvat..  │
│Intakes ← │ ─────────────────────────────────     │
│Probleem  │ 12-10    Intake   Afgr.   Eerste...   │
│Behandel  │ 05-10    Telef.   Afgr.   Korte...    │
│Agenda    │ 28-09    Intake   Afgr.   Geen sh...  │
│          │                                       │
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
1. Start: Cliënten list view
2. Click client row → Navigate to Dashboard (with client in header + sidebar)
3. Sidebar shows "← Cliënten" to go back
4. Header search always available for quick switch
5. Header client dropdown shows recent/favorite clients

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
/clients                    → Cliënten list
/clients/[id]/dashboard     → Dashboard view
/clients/[id]/intakes       → Intakes view
/clients/[id]/intakes/[intakeId] → Intake detail (modal)
/clients/[id]/probleemprofiel
/clients/[id]/behandelplan
/clients/[id]/agenda
```

### Component structure:
```
app/
├── layout.tsx (header + sidebar logic)
├── clients/
│   ├── page.tsx (list view)
│   └── [id]/
│       ├── layout.tsx (client-specific sidebar)
│       ├── dashboard/page.tsx
│       ├── intakes/
│       │   ├── page.tsx (list)
│       │   └── [intakeId]/page.tsx (detail modal)
│       └── ...
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