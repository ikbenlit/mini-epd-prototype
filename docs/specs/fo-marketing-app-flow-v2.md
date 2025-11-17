# 🧩 Functioneel Ontwerp (FO) – Marketing & App Flow v2.1

**Projectnaam:** AI Speedrun - Mini-EPD Prototype
**Versie:** v2.1 (Vereenvoudigde User Journey)
**Datum:** 17-11-2024
**Auteur:** Colin Lit

---

## 1. Doel en relatie met het PRD

🎯 **Doel van dit document:**
Dit Functioneel Ontwerp beschrijft de **vereenvoudigde user journey** voor de AI Speedrun marketing website en EPD applicatie. Het lost de huidige UX problemen op (broken links, onduidelijke navigatie) en introduceert een heldere scheiding tussen marketing en applicatie.

📘 **Toelichting aan de lezer:**
Versie 2.0 is een refactor van de huidige implementatie (v1.2). De belangrijkste wijzigingen:
- **Marketing vereenvoudigd**: Van lange manifesto naar compacte statement + timeline met features
- **Geen separate EPD demo pagina**: Features worden getoond in timeline op homepage en op login pagina
- **Duidelijke app routing**: `/epd/*` namespace voor alle EPD functionaliteit
- **Werkende flows**: Alle CTA's en login links gaan naar bestaande pagina's
- **Coming Soon strategie**: Eerlijke communicatie tijdens Week 2 development

Dit document is niet-technisch en beschrijft wat gebruikers zien en kunnen doen.

---

## 2. Overzicht van de belangrijkste onderdelen

🎯 **Doel:** De 4 kernmodules van de applicatie

**Marketing Modules (Publiek):**
1. **Marketing Homepage** (`/`) - Vereenvoudigde landing met hero, statement en timeline (met features)
2. **Contact & Leads** (`/contact`) - Lead capture formulier

**Auth & App Modules (Protected/Semi-Protected):**
3. **Login & Authentication** (`/login`) - Magic link + demo credentials + features showcase
4. **EPD App Dashboard** (`/epd/clients`) - Coming Soon placeholder (Week 2+)

---

## 3. User Stories

🎯 **Doel:** Wat gebruikers kunnen en willen doen

### Prioriteit: Hoog (MVP Critical)

| ID | Rol | Doel / Actie | Verwachte waarde | Status |
|----|-----|--------------|------------------|--------|
| US-01 | Marketing bezoeker | Homepage bekijken met project statement en voortgang | Begrijpen wat AI Speedrun doet en volgen van build progress + features zien | ✅ Te implementeren |
| US-02 | Marketing bezoeker | EPD features bekijken in timeline | Zien wat het prototype kan (features getoond in timeline op homepage) | ✅ Te implementeren |
| US-03 | Marketing bezoeker | Contact opnemen voor lead | Interesse tonen in Software on Demand services | ✅ Bestaand |
| US-04 | Demo gebruiker | Inloggen met demo credentials | Toegang tot EPD app prototype | ✅ Bestaand (fix redirect) |
| US-05 | Demo gebruiker | Coming Soon dashboard zien | Weten dat app in Week 2 komt + verwachtingen managen | ✅ Te implementeren |
| US-06 | Terugkerende gebruiker | Direct naar login navigeren | Snel inloggen zonder homepage te moeten bezoeken | ✅ Te implementeren (nav link) |

### Prioriteit: Middel (Nice to Have)

| ID | Rol | Doel / Actie | Verwachte waarde | Status |
|----|-----|--------------|------------------|--------|
| US-07 | Ingelogde gebruiker | Uitloggen | Sessie beëindigen en terug naar marketing | 🔄 Toekomstig |
| US-08 | Marketing bezoeker | Wekelijkse updates volgen via timeline | Build in public transparantie ervaren | ✅ Te implementeren |
| US-09 | Stakeholder | ROI vergelijking zien | Business case begrijpen (traditioneel vs AI) | ⏸️ On hold |

### Prioriteit: Laag (Future Enhancement)

| ID | Rol | Doel / Actie | Verwachte waarde | Status |
|----|-----|--------------|------------------|--------|
| US-10 | Developer | Interactieve ROI calculator gebruiken | Eigen business case berekenen | ⏸️ On hold |
| US-11 | LinkedIn volger | Build metrics dashboard zien | Real-time tracking van uren en kosten | ⏸️ On hold |

---

## 4. Functionele werking per onderdel

🎯 **Doel:** Per module beschrijven wat gebruikers kunnen doen

### 4.1 Marketing Homepage (`/`)

**Doel:** Compacte, krachtige introductie van Software on Demand concept met build-in-public transparantie.

**Secties (van boven naar beneden):**

1. **Hero Section** (behouden zoals nu)
   - Full-viewport quote van Jensen Huang: "Software is eating the world"
   - Dot-shader achtergrond (subtiel, opacity 0.02)
   - Scroll indicator

2. **Statement Section** (NIEUW - vervangt lange manifesto)
   - **Heading**: "Software on Demand: Van €100k naar €200"
   - **3-4 Paragrafen** in problem → solution → proof format:
     - *Problem*: Enterprise software kost €100.000+ en duurt 12-24 maanden
     - *Solution*: AI-powered development verkort dit naar 4 weken en €200
     - *Proof*: Dit EPD is het bewijs - gebouwd in 4 weken, build in public
     - *CTA*: Volg de voortgang hieronder
   - **Visueel**: Clean, serif typography (Crimson Text), breathing room

3. **Timeline Section** (NIEUW - build in public met features showcase)
   - **Component**: Aceternity UI Timeline (21st.dev)
   - **Content structure** per week:
     - Week nummer + datum range (bijv. "Week 1 • Nov 11-17")
     - Status badge: Completed / In Progress / Planned
     - Korte beschrijving (3-4 zinnen): wat is er gebouwd
     - **Features showcase** (NIEUW): 
       - Per week worden relevante EPD features getoond
       - Feature cards met: Titel, beschrijving, tijdswinst (bijv. "30 min → 5 sec")
       - Icons per feature type (Brain voor AI, Zap voor snelheid, etc.)
       - Visuele highlight van wat er die week gebouwd is
     - Metrics cards: Development hours, Infrastructure cost
     - Achievements lijst: Bullets met voltooide features
     - Optioneel: Screenshot of visual van die week
   - **Interactie**: Scroll-based animation (timeline ontvouwt)
   - **Data source**: `content/nl/timeline.json` (met features array per week)

4. **CTA Section** (vereenvoudigd)
   - **Primary CTA**: "Probeer het prototype" → `/login` (direct naar login met features)
   - **Secondary CTA**: "Volg voortgang" → Scroll to timeline (anchor link `#timeline`)
   - **Tertiary**: "Contact" → `/contact`
   - **Visueel**: Button hierarchy duidelijk (primary = green, secondary = outline)

**Verwijderd uit v1.2:**
- Lange manifesto content (8000+ woorden)
- Separate EPD demo pagina (`/epd`) - features nu in timeline
- Comparison table (verwijderd - niet meer nodig)
- Multiple insight boxes
- Statement sections met dark backgrounds

**States:**
- **Normal**: Alle content zichtbaar
- **Loading**: Skeleton voor timeline items
- **Empty state**: (niet van toepassing - statische content)

**Navigatie:**
- Top: MinimalNav (Home, Contact, Login) - EPD Prototype link verwijderd
- Footer: Copyright + link naar ikbenlit.nl

---

### 4.2 ~~EPD Demo Info Pagina (`/epd`)~~ VERWIJDERD

**Status:** Deze pagina is verwijderd in v2.1. Features worden nu getoond in:
- Timeline op homepage (`/`)
- Features showcase op login pagina (`/login`)

**Reden:** Vereenvoudiging van user journey - gebruikers zien features direct in context van build progress en kunnen direct naar login gaan.

---

### 4.3 Contact & Lead Capture (`/contact`)

**Doel:** Lead acquisition voor Software on Demand consultancy.

**Functionaliteit:** (behouden zoals nu - werkt al)
- Form fields: Naam, Email, Bericht
- Client-side validation (Zod)
- Submit → API `/api/leads` → Supabase `leads` table
- Success state: "Bedankt! We nemen contact op"
- Error state: "Er ging iets mis. Probeer opnieuw"

**Navigatie:**
- Terug naar homepage via nav

---

### 4.4 Login & Authentication (`/login`)

**Doel:** Flexibele auth met magic link (productie) en demo credentials (MVP), inclusief features showcase.

**Layout:** Split-screen design (zoals `sign-in.tsx` component)
- **Links (60%)**: Features showcase met visuals
- **Rechts (40%)**: Login formulier

**Features Showcase Sectie (Links):**
- **Grid layout** met feature cards:
  - AI-Gestuurde Intake (30 min → 5 sec)
  - Automatische DSM Classificatie (15 min → 3 sec)
  - Behandelplan Generatie (45 min → 10 sec)
  - B1 Readability (30 min → 3 sec)
- **Visuals**: Icons, stat cards, of screenshots per feature
- **Metrics**: Tijdswinst per feature prominent getoond
- **Design**: Inspiratie van `components/ui/sign-in.tsx` collage layout

**Login Form Sectie (Rechts):**

**Twee tabs/modes:**

1. **Magic Link Login** (voor productie users)
   - Email input
   - "Stuur Magic Link" button
   - Success: "Check je email voor login link"
   - Nieuwe users: Account wordt automatisch aangemaakt
   - Callback: `/auth/callback` → redirect naar `/epd/clients`

2. **Demo Credentials Login** (voor demo)
   - Email + Password inputs
   - Toggle show/hide password
   - "Login" button
   - Quick demo button: Auto-fill + submit
   - Success: Redirect naar `/epd/clients`
   - Error: "Ongeldige credentials"

**Demo credentials info box:**
- Gele achtergrond
- Credentials in monospace font
- Copy-paste friendly

**States:**
- Loading: "Inloggen..." spinner
- Error: Red error message
- Success: Green message + redirect
- Mobile: Features sectie wordt boven login form getoond (stack layout)

**Navigatie:**
- Link in MinimalNav: "Login"
- Logo → terug naar `/`

---

### 4.5 EPD App - Coming Soon Dashboard (`/epd/clients`)

**Doel:** Eerlijke communicatie dat app in Week 2 gebouwd wordt, manage expectations.

**Functionaliteit:** (NIEUW - te bouwen)

**Layout:**
```
┌────────────────────────────────────────────┐
│ Header: Logo | "EPD Dashboard" | Logout    │
├────────────────────────────────────────────┤
│                                            │
│   [Icon] Coming Soon                       │
│                                            │
│   EPD Dashboard - In Ontwikkeling          │
│                                            │
│   Week 2 (Nov 18-24): Client management    │
│   Week 3 (Nov 25-Dec 1): AI integrations   │
│                                            │
│   [Mockup screenshot placeholder]          │
│                                            │
│   [Button: Terug naar Info] [Logout]       │
│                                            │
└────────────────────────────────────────────┘
```

**Content:**
- **Heading**: "EPD Dashboard - Coming Week 2"
- **Beschrijving**:
  - "De EPD applicatie wordt momenteel gebouwd."
  - "Bekijk de voortgang op de homepage (timeline sectie)"
- **Timeline preview**:
  - Week 2: Client management & CRUD
  - Week 3: AI integrations (intake, profiel, plan)
  - Week 4: Polish & onboarding
- **Mockup/Screenshot**: Wireframe of visual preview van wat komt
- **Actions**:
  - Button: "Terug naar Prototype Info" → `/epd`
  - Button: "Logout" → `/auth/logout` → redirect `/`

**States:**
- **Authenticated**: Normale weergave
- **Not authenticated**: Redirect naar `/login` (middleware)

**Navigatie:**
- Logo → `/epd/clients` (blijf in app context)
- "Terug naar Info" → `/epd` (exit app)
- Logout → `/` (marketing)

**Future states (Week 2+):**
- Replace Coming Soon met werkende client lijst
- Zelfde layout, andere content

---

## 5. UI-overzicht (visuele structuur)

🎯 **Doel:** Globale schermopbouw voor developers en designers

### 5.1 Marketing Layout (alle publieke paginas)

```
┌─────────────────────────────────────────────────────┐
│ MinimalNav (fixed top)                              │
│ [Logo] Home | Contact | Login                      │
├─────────────────────────────────────────────────────┤
│ ReadingProgress (scroll-based bar)                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│               Page Content                          │
│          (hero, statement, timeline,                │
│           features, forms, etc.)                    │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Footer: © AI Speedrun | ikbenlit.nl                │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Minimal navigation: scroll-based color change
- Reading progress bar (client component)
- No sidebar
- Full-width content
- Mobile: Hamburger menu

### 5.2 EPD App Layout (protected paginas)

```
┌─────────────────────────────────────────────────────┐
│ App Header                                          │
│ [Logo: EPD] EPD Dashboard          [User] [Logout] │
├─────────────────────────────────────────────────────┤
│                                                     │
│                  Main Content                       │
│             (coming soon state                      │
│              of client list future)                 │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Footer: Terug naar Info | ikbenlit.nl              │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Separate header (geen MinimalNav)
- User state visible
- Logout prominent
- Exit to marketing link
- Future: Sidebar toevoegen voor app nav

---

## 6. Navigatie Flows & User Journeys

🎯 **Doel:** Visualiseren hoe gebruikers door de applicatie bewegen

### Flow 1: Marketing Bezoeker → Lead

```
Landing (/)
  ↓
Lees Statement + Timeline (met features)
  ↓
Decision Point:
  ├─→ "Probeer het prototype" → /login
  │     ↓
  │   Zie features showcase + login form
  │     ↓
  │   Login met demo credentials
  │     ↓
  │   /epd/clients (Coming Soon)
  │
  └─→ "Contact" → /contact
        ↓
      Vul formulier in
        ↓
      Lead opgeslagen ✓
```

### Flow 2: Demo Gebruiker → EPD App

```
Direct naar /login (nav link)
  ↓
Kies: Magic Link OF Demo Credentials
  ↓
[Demo pad]
Fill demo@mini-ecd.demo + Demo2024!
  ↓
Submit
  ↓
Auth success → Middleware redirect
  ↓
/epd/clients (Coming Soon)
  ↓
Options:
  ├─→ "Terug naar Info" → /epd
  └─→ "Logout" → /
```

### Flow 3: Terugkerende Gebruiker (Week 2+)

```
Homepage / or direct /login
  ↓
Login (magic link of credentials)
  ↓
/epd/clients (werkende app)
  ↓
Client lijst → Client detail
  ↓
Intake → AI → Profiel → Plan
  ↓
Logout → terug naar marketing
```

### Flow 4: Build-in-Public Volger

```
LinkedIn post → Homepage
  ↓
Scroll naar Timeline (met features per week)
  ↓
Lees weekly updates + zie features
  ↓
Decision:
  ├─→ "Probeer demo" → /login (met features showcase)
  ├─→ "Contact" → /contact
  └─→ Exit (volg op LinkedIn)
```

---

## 7. Interacties met AI (functionele beschrijving)

🎯 **Doel:** Waar AI voorkomt in toekomstige EPD app (Week 3+)

📘 **Toelichting:** Deze sectie beschrijft toekomstige AI features die nog niet in Coming Soon state zitten.

| Locatie | AI-actie | Trigger | Input | Output | Timing |
|---------|----------|---------|-------|--------|--------|
| Intake Editor | Samenvatten | Button "AI Samenvatten" | TipTap editor content (max 20k chars) | 5-8 bullets in rechterpaneel | ~3-5 sec |
| Intake Editor | B1 Leesbaarheid | Button "Vereenvoudig taal" | Selected text of hele intake | Herschreven versie in B1 Nederlands | ~5 sec |
| Profiel Tab | Extract Problemen | Button "AI Analyse" | Intake content | DSM-light categorie + severity + rationale | ~5-8 sec |
| Plan Tab | Genereer Plan | Button "Genereer Behandelplan" | Profiel + intake data | 4 secties: Doelen, Interventies, Freq/Duur, Meetmomenten | ~10-15 sec |

**AI-rail (rechterpaneel) gedrag:**
- Slides in vanaf rechts bij AI actie
- Loading state: Spinner + "AI analyseert..."
- Result state: Content + bronverwijzingen
- Actions: "Invoegen", "Regenereer", "Annuleer"
- Preview mode: Highlight waar content ingevoegd wordt

**Cost tracking** (toekomstig):
- Alle AI calls worden gelogd in `ai_events` table
- Dashboard toont: Aantal calls, tokens gebruikt, geschatte kosten
- Target: <€5/maand voor MVP demo use

---

## 8. Routes & Toegangsrechten

🎯 **Doel:** Duidelijk overzicht welke routes publiek of protected zijn

### Publieke Routes (geen auth vereist)

| Route | Naam | Functie | Status |
|-------|------|---------|--------|
| `/` | Marketing Homepage | Statement + Timeline (met features) | ✅ Refactor |
| `/contact` | Contact Form | Lead capture | ✅ Bestaand |
| `/login` | Login Pagina | Auth flow + features showcase | ✅ Refactor |
| `/auth/callback` | OAuth Callback | Magic link handler | ✅ Bestaand |

**Verwijderd:**
- `/epd` - EPD Demo Info pagina (features nu in timeline en login)

### Protected Routes (auth vereist)

| Route | Naam | Functie | Status |
|-------|------|---------|--------|
| `/epd/clients` | EPD Dashboard | Coming Soon (Week 2: Client lijst) | ⏳ Te bouwen |
| `/epd/clients/[id]` | Client Detail | Client dossier (Week 2) | 🔄 Toekomstig |
| `/epd/clients/[id]/intake` | Intake Editor | TipTap + AI (Week 3) | 🔄 Toekomstig |
| `/epd/clients/[id]/profile` | Probleem Profiel | DSM-light + AI (Week 3) | 🔄 Toekomstig |
| `/epd/clients/[id]/plan` | Behandelplan | SMART doelen + AI (Week 3) | 🔄 Toekomstig |

### API Routes

| Route | Naam | Functie | Auth | Status |
|-------|------|---------|------|--------|
| `/api/leads` | Lead Submission | POST contact form data | No | ✅ Bestaand |
| `/api/ai/summarize` | AI Summarize | POST intake → bullets | Yes | 🔄 Week 3 |
| `/api/ai/categorize` | AI Categorize | POST intake → DSM profile | Yes | 🔄 Week 3 |
| `/api/ai/plan` | AI Plan Generator | POST profile → treatment plan | Yes | 🔄 Week 3 |
| `/auth/logout` | Logout | Supabase signOut | Yes | ✅ Bestaand |

### Middleware Logic (simplified)

```typescript
// Public routes (no redirect)
const publicRoutes = [
  '/', '/contact', '/login',
  '/auth/callback', '/auth/logout'
]

// Logic
if (!user && !isPublicRoute) {
  redirect('/login?redirect=' + pathname)
}

if (user && pathname === '/login') {
  redirect('/epd/clients')
}
```

---

## 9. Content Management Strategie

🎯 **Doel:** Hoe content beheerd en bijgewerkt wordt

### Timeline Content (Build-in-Public updates)

**Locatie**: `content/timeline/` of `content/nl/timeline.json`

**Structuur per week**:
```json
{
  "weekNumber": 1,
  "title": "Week 1 • Nov 11-17",
  "status": "completed", // completed | in_progress | planned
  "description": "Marketing site foundation. Hero, statement setup, database schema aangemaakt.",
  "features": [
    {
      "title": "AI-Gestuurde Intake",
      "description": "Schrijf een intakeverslag en krijg binnen seconden een gestructureerde samenvatting",
      "time": "< 5 seconden",
      "traditional": "15-20 minuten handmatig",
      "icon": "Brain"
    },
    {
      "title": "Automatische DSM Classificatie",
      "description": "Het systeem analyseert de intake en stelt DSM-categorieën voor",
      "time": "< 3 seconden",
      "traditional": "10-15 minuten analyse",
      "icon": "Zap"
    }
  ],
  "metrics": {
    "developmentHours": 30,
    "infrastructureCost": 50,
    "totalCost": 50
  },
  "achievements": [
    "Landing page met hero + statement",
    "Timeline component met features",
    "Contact form + lead capture API",
    "Database schema (5 core tables)",
    "Supabase Auth + RLS policies"
  ],
  "visual": "/timeline/week-1-screenshot.png" // optional
}
```

**Update frequency**: Einde van elke week (zaterdag/zondag)

**Ownership**: Handmatig door Colin via JSON edit

**Alternative**: MDX files met frontmatter voor meer flexibiliteit

### Static Content (niet-timeline)

| Content Type | Locatie | Format | Update Freq |
|--------------|---------|--------|-------------|
| Navigation | `content/nl/navigation.json` | JSON | Ad-hoc |
| Timeline (met features) | `content/nl/timeline.json` | JSON | Weekly |
| EPD Features (voor login) | `content/nl/epd.json` | JSON | Rarely |
| Metadata (SEO) | `content/nl/metadata.json` | JSON | Once |

---

## 10. Gebruikersrollen en rechten

🎯 **Doel:** Wie kan wat binnen de applicatie

| Rol | Toegang tot | Beperkingen | Auth Method |
|-----|-------------|-------------|-------------|
| **Anonymous Visitor** | Marketing pages (/, /contact, /login) | Geen EPD app toegang | - |
| **Demo User** | Alles (marketing + EPD app) | Fictieve data only, geen wijzigingen persistent | Email/password (demo credentials) |
| **Magic Link User** | Marketing + EPD app (toekomstig) | Eigen dossiers (RLS) | Magic link email |
| **Admin** (toekomstig) | Alle dossiers + metrics | - | Special credentials |

**RLS (Row Level Security) in Supabase:**
- Elke gebruiker ziet alleen eigen clients/notes/profiles/plans
- Policy: `auth.uid() = created_by`
- Demo users delen fictieve dataset
- Real users: isolated per user_id

---

## 11. States & Edge Cases

🎯 **Doel:** Hoe systeem omgaat met uitzonderlijke situaties

### Marketing Website

| Scenario | Gedrag |
|----------|--------|
| Timeline data niet beschikbaar | Toon skeleton loading + "Updates coming soon" |
| Image load failure | Fallback naar placeholder met initials |
| Form submission error | Retry optie + error message + support email |
| Slow network | Progressive loading, defer non-critical content |

### Login Flow

| Scenario | Gedrag |
|----------|--------|
| Ongeldige demo credentials | Error: "Credentials incorrect. Gebruik demo@mini-ecd.demo" |
| Magic link expired | Error + "Request new link" button |
| Already logged in | Direct redirect naar `/epd/clients` |
| Network error tijdens auth | Error message + retry button |

### EPD App (Coming Soon)

| Scenario | Gedrag |
|----------|--------|
| User bezoekt direct `/epd/clients` | Middleware check → redirect `/login` als niet ingelogd |
| Logout tijdens session | Redirect naar `/` + success toast |
| Session expired | Redirect naar `/login` + "Session verlopen, log opnieuw in" |

### Week 2+ (Toekomstig - Client CRUD)

| Scenario | Gedrag |
|----------|--------|
| Lege state (geen clients) | "Voeg je eerste cliënt toe" + CTA button |
| Delete confirmation | Modal: "Weet je zeker? Alle dossiers worden verwijderd" |
| Concurrent edit conflict | Toast: "Data is veranderd, herlaad pagina" |
| AI API failure | Retry 3x, dan error + support contact |

---

## 12. Bijlagen & Referenties

🎯 **Doel:** Linken naar gerelateerde documenten

**Mission Control Documents:**
- **PRD v1.2** (`docs/specs/prd-mini-ecd-v2.md`) - Product Requirements & Business Case
- **TO v1.2** (`docs/specs/to-mini-ecd-v1_2.md`) - Technische Architectuur & Database Schema
- **Bouwplan v1.6** (`docs/specs/bouwplan-ai-speedrun-marketing-first-v1.1.md`) - Epic & Story Planning
- **UX Stylesheet** (`docs/specs/ux-stylesheet.md`) - Design System & Tailwind Config
- **API Specs** (`docs/specs/api-acces-mini-ecd.md`) - Endpoint Documentation

**External Resources:**
- [Aceternity UI Timeline](https://21st.dev/r/timeline) - Timeline component inspiratie
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth) - Authentication flows
- [Next.js 15 Routing](https://nextjs.org/docs/app/building-your-application/routing) - App Router patterns

**Design References:**
- `docs/design/timeline-comp.tsx` - Timeline component voorbeeld
- Bestaande marketing components in `app/(marketing)/components/`

---

## 13. Implementatie Prioriteiten (voor Developers)

🎯 **Doel:** Volgorde van bouwen voor maximale impact

### 🔴 Critical (Week 1 fixes - nu)

1. **Verwijder EPD demo pagina** (15 min)
   - Delete `/app/(marketing)/epd/page.tsx`
   - Update navigation (verwijder "EPD Prototype" link)
   - Update middleware (verwijder `/epd` uit public routes)

2. **Coming Soon page** (30 min)
   - Create `/epd/clients/page.tsx`
   - Simple layout + logout
   - Middleware redirect update

### 🟡 High Priority (Week 1-2 refactor)

3. **Timeline component met features** (3-4 uur)
   - Install/copy Aceternity timeline
   - Create timeline content JSON met features array
   - Add features showcase per week item
   - Add to homepage

4. **Homepage vereenvoudiging** (2-3 uur)
   - Remove manifesto long-form
   - Add statement section
   - Integrate timeline (met features)
   - Update CTA: "Probeer het prototype" → `/login`

5. **Login pagina met features showcase** (2-3 uur)
   - Split-screen layout (features links, login rechts)
   - Features grid component (hergebruik van EPD features)
   - Mobile responsive (stack layout)
   - Integreer bestaande login functionaliteit

### 🟢 Medium Priority (Week 2 app build)

5. **EPD App foundation** (Week 2)
   - Client CRUD
   - App layout met sidebar
   - Navigation tussen contexts

6. **AI integrations** (Week 3)
   - API endpoints
   - TipTap editor
   - AI-rail components

---

## Changelog

| Versie | Datum | Auteur | Wijzigingen |
|--------|-------|--------|-------------|
| v2.0 | 17-11-2024 | Colin | Initiële versie - Refactor van v1.2 implementatie. Nieuwe timeline approach, vereenvoudigde marketing, /epd/* routing, coming soon strategie |
| v2.1 | 17-11-2024 | Colin | Verwijderd: Separate EPD demo pagina (/epd). Features nu in timeline op homepage en features showcase op login pagina. Vereenvoudigde user journey. |

---

**Einde Functioneel Ontwerp v2.1**
