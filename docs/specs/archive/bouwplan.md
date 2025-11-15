# 🚀 Mission Control — Bouwplan Mini-EPD Prototype

**Projectnaam:** Mini-EPD Prototype
**Versie:** v1.0
**Datum:** 10-11-2025
**Auteur:** Development Team PinkRoccade GGZ

---

## 1. Doel en context

🎯 **Doel:** Een werkend mini-EPD prototype bouwen dat tijdens de AI-inspiratiesessie bij PinkRoccade GGZ de kernprocessen uit de GGZ demonstreert: **intake → probleemclassificatie → behandelplan**.

📘 **Toelichting:** Dit project focust op het zichtbaar maken van AI-waarde (samenvatten, structureren, plan genereren) in een herkenbare GGZ-workflow. De demo duurt maximaal 10 minuten en toont hoe AI zorgmedewerkers kan ondersteunen bij administratieve taken. Het systeem wordt gebouwd met fictieve data voor demonstratiedoeleinden.

**Belangrijkste doelen:**
- Demonstreren van AI-toegevoegde waarde in ECD-processen
- Herkenbare workflow voor GGZ-professionals
- Inspiratie bieden voor AI-integratie in bestaande systemen
- Direct bruikbare output (samenvattingen, behandelplannen) genereren

---

## 2. Uitgangspunten

### 2.1 Technische Stack

🎯 **Doel:** Complete technologie stack voor het mini-EPD prototype.

**Frontend:**
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS v3.4 (fallback vanaf v4 bij problemen)
- **UI Componenten:** shadcn/ui of eigen headless componenten
- **Rich Text Editor:** TipTap (ProseMirror basis)
- **Iconen:** lucide-react
- **State Management:** Zustand + React Context API

**Backend:**
- **API:** Next.js Route Handlers (server-side)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **AI Integration:** Claude API (Anthropic)

**DevOps & Tooling:**
- **Hosting:** Vercel (EU region)
- **Version Control:** Git/GitHub
- **Type Safety:** TypeScript
- **Validation:** Zod
- **Testing:** Vitest (unit) + Playwright (E2E)
- **PDF Export (stretch):** Chromium via Playwright/Puppeteer

### 2.2 Projectkaders

🎯 **Doel:** Vaste kaders waarbinnen het project wordt ontwikkeld.

- **Tijd:** 3 weken totale bouwtijd voor MVP
- **Demo deadline:** Augustus 2025 (AI-inspiratiesessie)
- **Budget:** Beperkt voor externe API calls (Claude AI)
- **Team:** 1-2 developers + 1 consultant/product owner
- **Data:** Uitsluitend fictieve demo-data (geen productiegegevens)
- **Scope:** MVP features voor 10-minuten demo
- **Gebruikers:** Demo-users met volledige toegang (simplified auth)
- **Compliance:** Geen medische certificering vereist (demo only)

### 2.3 Programmeer Uitgangspunten

🎯 **Doel:** Code-kwaliteit principes en development best practices.

**Core Principles:**

- **DRY (Don't Repeat Yourself)**
  - Herbruikbare React componenten in `/src/components/ui/`
  - Shared utility functions in `/src/lib/utils/`
  - Centrale API client voor Supabase queries
  - Gedeelde prompt templates voor AI calls

- **SOC (Separation of Concerns)**
  - UI componenten gescheiden van business logic
  - Database queries in dedicated service layers (`/src/lib/services/`)
  - AI prompts in `/src/lib/ai/prompts/`
  - Styling via Tailwind classes, geen inline styles
  - Route handlers voor server-side operaties

- **KISS (Keep It Simple, Stupid)**
  - Directe Supabase queries zonder ORM overhead
  - Eenvoudige state management met Zustand
  - Minimale abstractie voor MVP scope
  - Clear component naming (e.g., `ClientList`, `IntakeEditor`)

- **YAGNI (You Aren't Gonna Need It)**
  - Geen multi-tenant setup voor demo
  - Basis auth zonder rollenbeheer
  - Skip complex caching voor MVP
  - Geen realtime features voor eerste versie

- **Security**
  - API keys alleen server-side (`ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
  - Input sanitization met Zod schemas
  - Row Level Security (RLS) policies in Supabase
  - CORS configuratie voor API endpoints
  - XSS protection via React's default escaping

---

## 3. Epics & Stories Overzicht

🎯 **Doel:** Complete overzicht van alle development epics met technische details.

| Epic ID | Epic Naam | Stories | Points | Status | Priority | Dependencies |
|---------|-----------|---------|--------|--------|----------|--------------|
| EP00 | Project Setup & Configuration | 5 | 13 | Done | Critical | - |
| EP01 | Database & Data Model | 4 | 21 | Not Started | Critical | EP00 |
| EP02 | Authentication & Authorization | 3 | 8 | Not Started | High | EP00, EP01 |
| EP03 | Client Management | 5 | 21 | Not Started | High | EP01, EP02 |
| EP04 | Intake Module | 6 | 34 | Not Started | Critical | EP03 |
| EP05 | Problem Profile (DSM-light) | 4 | 21 | Not Started | High | EP04 |
| EP06 | Treatment Plan Module | 5 | 34 | Not Started | High | EP05 |
| EP07 | AI Integration | 5 | 34 | Not Started | Critical | EP04 |
| EP08 | Dashboard & Navigation | 4 | 13 | Not Started | Medium | EP03 |
| EP09 | UI Components & Styling | 5 | 21 | Not Started | Medium | EP00 |
| EP10 | Testing & Quality Assurance | 4 | 13 | Not Started | High | All |
| EP11 | Deployment & Demo Prep | 4 | 13 | Not Started | Critical | All |
| EP12 | Stretch Features | 3 | 21 | Not Started | Low | EP06 |

**Totaal:** 57 stories | 257 story points

---

## 4. Epics & Stories (Uitwerking)

### Epic EP00 — Project Setup & Configuration
**Epic Doel:** Complete development omgeving met alle tools en dependencies geconfigureerd.

| Story ID | Story Title | Points | Status | Dependencies |
|----------|-------------|--------|--------|--------------|
| EP00-ST01 | Next.js project opzetten | 3 | Done | - |
| EP00-ST02 | Tailwind CSS en UI libraries installeren | 3 | Done | EP00-ST01 |
| EP00-ST03 | Supabase project aanmaken | 3 | Done | EP00-ST01 |
| EP00-ST04 | Environment variables configureren | 2 | Done | EP00-ST03 |
| EP00-ST05 | Git repository opzetten | 2 | Done | EP00-ST01 |

**Story Details:**

**EP00-ST01:** Als developer wil ik een Next.js project opzetten zodat ik kan beginnen met development
- ✅ Next.js 14+ met App Router
- ✅ TypeScript configuratie
- ✅ Folder structuur volgens conventions
- ✅ Development server draait op localhost:3000

**EP00-ST02:** Als developer wil ik Tailwind CSS en UI libraries installeren zodat ik consistent kan stylen
- ✅ Tailwind CSS v3.4 werkend
- ✅ tailwind.config.ts met custom theme
- ✅ lucide-react icons beschikbaar
- ✅ shadcn/ui setup (components.json, utils.ts)

**EP00-ST03:** Als developer wil ik Supabase project aanmaken zodat ik database en auth kan gebruiken
- ✅ Supabase project in EU region (dqugbrpwtisgyxscpefg)
- ✅ Connection string in .env.local
- ✅ Supabase client configured (lib/supabase/client.ts + server.ts)
- ✅ TypeScript types generation script (pnpm run types:generate)

**EP00-ST04:** Als developer wil ik environment variables configureren zodat services veilig verbonden zijn
- ✅ .env.local met alle keys (SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY)
- ✅ .env.example voor team
- ⏳ Vercel environment variables (bij deployment EP11)
- ✅ Validation bij startup (throws error if missing)

**EP00-ST05:** Als developer wil ik Git repository opzetten zodat code versiebeheerd is
- ✅ GitHub repository
- ✅ .gitignore configuratie
- ⏳ Branch protection rules
- ✅ Initial commit met setup

**Technische implementatie details:**
- **Database:** Gebruik Supabase EU-region (Frankfurt/London)
- **Environment variables:**
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  ANTHROPIC_API_KEY
  ```
- **Folder structuur:**
  ```
  /src
    /app (routes)
    /components
    /lib (utilities, services)
    /types
  ```

---

### Epic EP01 — Database & Data Model
**Epic Doel:** Complete database schema met alle tabellen en relaties volgens TO specificatie.

| Story ID | Story Title | Points | Status | Dependencies |
|----------|-------------|--------|--------|--------------|
| EP01-ST01 | Database tabellen creëren | 8 | Not Started | EP00-ST03 |
| EP01-ST02 | Row Level Security policies implementeren | 5 | Not Started | EP01-ST01 |
| EP01-ST03 | Database migrations opzetten | 3 | Not Started | EP01-ST01 |
| EP01-ST04 | Demo data seeden | 5 | Not Started | EP01-ST01 |

**Story Details:**

**EP01-ST01:** Als developer wil ik database tabellen creëren zodat data opgeslagen kan worden
- ⏳ Tables: clients, intake_notes, problem_profiles, treatment_plans, ai_events
- ⏳ Correct data types (UUID, JSONB, etc.)
- ⏳ Foreign key constraints
- ⏳ Timestamps (created_at, updated_at)

**EP01-ST02:** Als developer wil ik Row Level Security policies implementeren zodat data veilig is
- ⏳ RLS enabled op alle tables
- ⏳ Policies voor authenticated users
- ⏳ Test queries werken correct
- ⏳ Service role bypass werkt

**EP01-ST03:** Als developer wil ik database migrations opzetten zodat schema versiebeheerd is
- ⏳ Supabase migrations folder
- ⏳ Initial migration script
- ⏳ Rollback mogelijk
- ⏳ Documentation

**EP01-ST04:** Als developer wil ik demo data seeden zodat er test content beschikbaar is
- ⏳ 3+ test cliënten
- ⏳ Intake notes per cliënt
- ⏳ Minimaal 1 compleet dossier
- ⏳ Seed script: `npm run seed`

**Technische implementatie details:**
- **Database Schema (zie TO §2.3):**
  - `clients`: id (UUID), first_name, last_name, birth_date, created_at, updated_at
  - `intake_notes`: id, client_id (FK), title, tag (CHECK), content_json (JSONB), content_text
  - `problem_profiles`: id, client_id (FK), category (CHECK), severity (CHECK), remarks
  - `treatment_plans`: id, client_id (FK), version, status (CHECK), plan (JSONB)
  - `ai_events`: id, kind, client_id, request, response, duration_ms

- **RLS Policies (zie TO §2.4):**
  ```sql
  CREATE POLICY "Allow all for authenticated users" ON [table]
    FOR ALL USING (auth.uid() IS NOT NULL);
  ```

---

### Epic EP02 — Authentication & Authorization
**Epic Doel:** Werkende authenticatie met Supabase Auth voor demo gebruikers.

| Story ID | Story Title | Points | Status | Dependencies |
|----------|-------------|--------|--------|--------------|
| EP02-ST01 | Login implementeren | 3 | Not Started | EP00-ST03, EP01-ST02 |
| EP02-ST02 | Protected routes implementeren | 3 | Not Started | EP02-ST01 |
| EP02-ST03 | Logout functionaliteit | 2 | Not Started | EP02-ST01 |

**Story Details:**

**EP02-ST01:** Als gebruiker wil ik kunnen inloggen zodat ik toegang krijg tot het systeem
- ⏳ Login pagina op /auth/login
- ⏳ Email/password of magic link
- ⏳ Session management
- ⏳ Redirect naar dashboard

**EP02-ST02:** Als developer wil ik protected routes implementeren zodat alleen ingelogde users toegang hebben
- ⏳ Middleware voor auth check
- ⏳ Redirect naar login indien nodig
- ⏳ Loading states tijdens auth
- ⏳ Session refresh

**EP02-ST03:** Als gebruiker wil ik kunnen uitloggen zodat mijn sessie beëindigd wordt
- ⏳ Logout button in header
- ⏳ Session cleanup
- ⏳ Redirect naar login
- ⏳ Clear local state

**Technische implementatie details:**
- **Auth flow:** Email/password voor demo (magic link als backup)
- **Middleware:** Check auth in `middleware.ts`
- **Protected routes:** Alles behalve `/auth/*`
- **Session:** Supabase JWT tokens

---

### Epic EP03 — Client Management
**Epic Doel:** Complete CRUD functionaliteit voor cliëntbeheer.

| Story ID | Story Title | Points | Status | Dependencies |
|----------|-------------|--------|--------|--------------|
| EP03-ST01 | Cliëntenlijst tonen | 5 | Not Started | EP01-ST01, EP02-ST02 |
| EP03-ST02 | Nieuwe cliënt aanmaken | 5 | Not Started | EP03-ST01 |
| EP03-ST03 | Cliëntgegevens bekijken | 5 | Not Started | EP03-ST01 |
| EP03-ST04 | Cliëntgegevens bewerken | 3 | Not Started | EP03-ST03 |
| EP03-ST05 | Zustand store voor client state | 3 | Not Started | EP00-ST01 |

**Story Details:**

**EP03-ST01:** Als behandelaar wil ik een cliëntenlijst zien zodat ik overzicht heb
- ⏳ Tabel met: ClientID, Naam, Geboortedatum, Laatste update
- ⏳ Zoekbalk voor naam/ID
- ⏳ Pagination bij >20 items
- ⏳ Loading skeleton

**EP03-ST02:** Als behandelaar wil ik een nieuwe cliënt aanmaken zodat ik kan starten met intake
- ⏳ Modal/drawer met formulier
- ⏳ Velden: Voornaam, Achternaam, Geboortedatum
- ⏳ Auto-generated UUID
- ⏳ Validatie met Zod
- ⏳ Success toast

**EP03-ST03:** Als behandelaar wil ik cliëntgegevens bekijken zodat ik het dossier kan inzien
- ⏳ Route: /clients/[id]
- ⏳ Breadcrumb navigatie
- ⏳ Tabs: Overzicht, Intakes, Profiel, Plan
- ⏳ 404 handling

**EP03-ST04:** Als behandelaar wil ik cliëntgegevens bewerken zodat ik updates kan maken
- ⏳ Edit mode in detail view
- ⏳ Form validation
- ⏳ Optimistic updates
- ⏳ Error handling

**EP03-ST05:** Als developer wil ik Zustand store voor client state zodat data consistent blijft
- ⏳ clientStore.ts setup
- ⏳ Actions: setSelectedClient, updateClient
- ⏳ Persistent state waar nodig
- ⏳ TypeScript types

**Technische implementatie details:**
- **API endpoints:**
  - `POST /api/clients` - Create
  - `GET /api/clients` - List with search
  - `GET /api/clients/[id]` - Get single
  - `PATCH /api/clients/[id]` - Update
- **Zustand store:** Central state voor selected client
- **Validatie:** Zod schemas voor alle forms

---

### Epic EP04 — Intake Module
**Epic Doel:** Rich text editor voor intake verslagen met TipTap integratie.

| Story ID | Story Title | Points | Status | Dependencies |
|----------|-------------|--------|--------|--------------|
| EP04-ST01 | TipTap editor implementeren | 8 | Not Started | EP03-ST03 |
| EP04-ST02 | Intake verslagen opslaan | 5 | Not Started | EP04-ST01 |
| EP04-ST03 | Tags toevoegen aan verslagen | 3 | Not Started | EP04-ST02 |
| EP04-ST04 | Oude intakes bekijken | 5 | Not Started | EP04-ST02 |
| EP04-ST05 | Tekst extractie voor search | 5 | Not Started | EP04-ST02 |
| EP04-ST06 | AI-rail implementeren | 8 | Not Started | EP04-ST01 |

**Story Details:**

**EP04-ST01:** Als behandelaar wil ik TipTap editor gebruiken zodat ik rijk opgemaakte notities kan maken
- ⏳ TipTap met StarterKit
- ⏳ Toolbar: Bold, Italic, Lists, etc.
- ⏳ Placeholder text
- ⏳ Content als ProseMirror JSON

**EP04-ST02:** Als behandelaar wil ik intake verslagen opslaan zodat ze bewaard blijven
- ⏳ Save button + Ctrl/Cmd+S
- ⏳ Store in intake_notes table
- ⏳ Auto-save indicator
- ⏳ Success/error toasts

**EP04-ST03:** Als behandelaar wil ik tags toevoegen aan verslagen zodat ik ze kan categoriseren
- ⏳ Tag dropdown: Intake/Evaluatie/Plan
- ⏳ Tag badge in lijst
- ⏳ Filter op tag mogelijk
- ⏳ Validation

**EP04-ST04:** Als behandelaar wil ik oude intakes bekijken zodat ik historie kan inzien
- ⏳ Lijst van intakes per cliënt
- ⏳ Sorteer op datum
- ⏳ Click to view/edit
- ⏳ Read-only mode optie

**EP04-ST05:** Als developer wil ik tekst extractie implementeren voor search
- ⏳ Extract plain text van ProseMirror
- ⏳ Store in content_text field
- ⏳ Full-text search mogelijk
- ⏳ Performance optimization

**EP04-ST06:** Als behandelaar wil ik de AI-rail zien zodat AI-resultaten preview kan bekijken
- ⏳ Rechter paneel (40% breedte)
- ⏳ Collapsible/expandable
- ⏳ Preview area voor AI output
- ⏳ Action buttons: Invoegen/Annuleren

**Technische implementatie details:**
- **TipTap setup:**
  ```typescript
  import StarterKit from '@tiptap/starter-kit'
  const editor = useEditor({
    extensions: [StarterKit],
    content: prosemirrorJSON
  })
  ```
- **Storage:** content_json (JSONB) + content_text (TEXT)
- **API:** `/api/intakes` endpoints

---

### Epic EP05 — Problem Profile (DSM-light)
**Epic Doel:** DSM-light categorisatie systeem met severity bepaling.

| Story ID | Story Title | Points | Status | Dependencies |
|----------|-------------|--------|--------|--------------|
| EP05-ST01 | Probleem categorie selecteren | 5 | Not Started | EP04-ST02 |
| EP05-ST02 | Severity aangeven | 3 | Not Started | EP05-ST01 |
| EP05-ST03 | Opmerkingen toevoegen | 3 | Not Started | EP05-ST01 |
| EP05-ST04 | AI-suggestie paneel | 10 | Not Started | EP04-ST02, EP07-ST03 |

**Story Details:**

**EP05-ST01:** Als behandelaar wil ik een probleem categorie selecteren zodat ik kan classificeren
- ⏳ Dropdown met 6 categorieën (zie FO §4.4)
- ⏳ Beschrijving per categorie
- ⏳ Validation required field
- ⏳ Store in problem_profiles

**EP05-ST02:** Als behandelaar wil ik severity aangeven zodat ernst duidelijk is
- ⏳ Button group: Laag/Middel/Hoog
- ⏳ Kleur-coded badges
- ⏳ Hover tooltips met uitleg
- ⏳ Required validation

**EP05-ST03:** Als behandelaar wil ik opmerkingen toevoegen zodat ik context kan geven
- ⏳ Textarea voor vrije tekst
- ⏳ Character limit (500)
- ⏳ Optional field
- ⏳ Markdown support

**EP05-ST04:** Als behandelaar wil ik AI-suggestie paneel gebruiken zodat classificatie sneller gaat
- ⏳ Knop "AI > Analyseer intake"
- ⏳ Suggestie paneel rechts
- ⏳ Shows: categorie, severity, rationale
- ⏳ Accepteer/Negeer buttons
- ⏳ Source highlighting in intake (zie TO §5.4)

**Technische implementatie details:**
- **Categorieën (enum):**
  - stemming_depressie
  - angst
  - gedrag_impuls
  - middelen_gebruik
  - cognitief
  - context_psychosociaal
- **Severity badges:** Tailwind classes volgens UX stylesheet
- **AI highlighting:** TipTap Decorations API

---

### Epic EP06 — Treatment Plan Module
**Epic Doel:** Genereren en beheren van gestructureerde behandelplannen.

| Story ID | Story Title | Points | Status | Dependencies |
|----------|-------------|--------|--------|--------------|
| EP06-ST01 | Behandelplan genereren | 10 | Not Started | EP05-ST01, EP07-ST04 |
| EP06-ST02 | Doelen bewerken | 8 | Not Started | EP06-ST01 |
| EP06-ST03 | Interventies specificeren | 5 | Not Started | EP06-ST01 |
| EP06-ST04 | Meetmomenten plannen | 5 | Not Started | EP06-ST01 |
| EP06-ST05 | Plan publiceren | 6 | Not Started | EP06-ST02 |

**Story Details:**

**EP06-ST01:** Als behandelaar wil ik een behandelplan genereren zodat ik snel een opzet heb
- ⏳ Knop "AI > Genereer behandelplan"
- ⏳ Uses intake + profile als context
- ⏳ Genereert 4 secties
- ⏳ Loading state tijdens generatie

**EP06-ST02:** Als behandelaar wil ik doelen bewerken zodat ze SMART geformuleerd zijn
- ⏳ Lijst van doelen (bullets)
- ⏳ Inline editing mogelijk
- ⏳ Add/remove doelen
- ⏳ Regenerate per doel optie

**EP06-ST03:** Als behandelaar wil ik interventies specificeren zodat behandeling duidelijk is
- ⏳ Interventie lijst
- ⏳ Type + frequentie + duur
- ⏳ Voorgestelde interventies
- ⏳ Custom toevoegen

**EP06-ST04:** Als behandelaar wil ik meetmomenten plannen zodat voortgang gemeten wordt
- ⏳ Timeline met meetmomenten
- ⏳ Na X sessies format
- ⏳ Evaluatie types
- ⏳ Calendar integration (stretch)

**EP06-ST05:** Als behandelaar wil ik plan publiceren zodat het definitief wordt
- ⏳ Concept vs Gepubliceerd status
- ⏳ Versioning (v1, v2, etc.)
- ⏳ Published timestamp
- ⏳ Read-only na publicatie
- ⏳ Nieuwe versie mogelijk

**Technische implementatie details:**
- **Plan structuur (JSONB):**
  ```typescript
  {
    doelen: string[],
    interventies: string[],
    frequentie: string,
    meetmomenten: string[]
  }
  ```
- **Status flow:** concept → gepubliceerd → nieuwe versie
- **API:** `/api/treatment-plan` endpoints

---

### Epic EP07 — AI Integration
**Epic Doel:** Claude AI integratie voor alle AI-powered features.

| Story ID | Story Title | Points | Status | Dependencies |
|----------|-------------|--------|--------|--------------|
| EP07-ST01 | Claude API client configureren | 5 | Not Started | EP00-ST04 |
| EP07-ST02 | Intake samenvatten met AI | 8 | Not Started | EP07-ST01, EP04-ST06 |
| EP07-ST03 | Problemen extraheren met AI | 8 | Not Started | EP07-ST01 |
| EP07-ST04 | Behandelplan genereren met AI | 8 | Not Started | EP07-ST01 |
| EP07-ST05 | AI events loggen | 5 | Not Started | EP07-ST01, EP01-ST01 |

**Story Details:**

**EP07-ST01:** Als developer wil ik Claude API client configureren zodat AI calls mogelijk zijn
- ⏳ Anthropic SDK setup
- ⏳ Server-side only implementation
- ⏳ Error handling
- ⏳ Rate limiting logic

**EP07-ST02:** Als behandelaar wil ik intake samenvatten met AI zodat ik snel overzicht heb
- ⏳ Endpoint: /api/ai/summarize
- ⏳ 5-8 bullet points output
- ⏳ Nederlands, klinisch neutraal
- ⏳ Max 5 sec response time

**EP07-ST03:** Als behandelaar wil ik problemen extraheren met AI zodat classificatie sneller gaat
- ⏳ Endpoint: /api/ai/extract
- ⏳ Returns: category, severity, rationale
- ⏳ Source sentences identificatie
- ⏳ Highlighting support

**EP07-ST04:** Als behandelaar wil ik behandelplan genereren met AI zodat ik een goede basis heb
- ⏳ Endpoint: /api/ai/generate-plan
- ⏳ SMART doelen formulering
- ⏳ Evidence-based interventies
- ⏳ Structured JSON output

**EP07-ST05:** Als developer wil ik AI events loggen zodat gebruik gemonitord wordt
- ⏳ Store in ai_events table
- ⏳ Track: prompt, response, duration
- ⏳ Cost calculation
- ⏳ Error logging

**Technische implementatie details:**
- **Claude model:** claude-3-5-sonnet-20241022
- **Prompt templates:** `/src/lib/ai/prompts/`
- **Temperature:** 0.3 (deterministic)
- **Max tokens:** Per endpoint verschillend
- **Security:** API key alleen server-side

---

### Epic EP08 — Dashboard & Navigation
**Epic Doel:** Configureerbaar dashboard met tegels en navigatie.

| Story ID | Story Title | Points | Status | Dependencies |
|----------|-------------|--------|--------|--------------|
| EP08-ST01 | Dashboard met tegels | 5 | Not Started | EP03-ST03 |
| EP08-ST02 | Tegels configureren | 3 | Not Started | EP08-ST01 |
| EP08-ST03 | Breadcrumb navigatie | 2 | Not Started | EP03-ST03 |
| EP08-ST04 | Sidebar navigatie | 3 | Not Started | EP03-ST03 |

**Story Details:**

**EP08-ST01:** Als behandelaar wil ik een dashboard zien zodat ik overzicht heb per cliënt
- ⏳ 5 tegels (zie FO §4.2)
- ⏳ Responsive grid layout
- ⏳ Data uit verschillende tables
- ⏳ Click naar detail

**EP08-ST02:** Als behandelaar wil ik tegels configureren zodat ik kan personaliseren
- ⏳ Settings icon → modal
- ⏳ Checkboxes per tegel
- ⏳ LocalStorage persistence
- ⏳ Instant preview

**EP08-ST03:** Als gebruiker wil ik breadcrumb navigatie zodat ik weet waar ik ben
- ⏳ Breadcrumb in header
- ⏳ Clickable segments
- ⏳ Current page highlight
- ⏳ Responsive truncation

**EP08-ST04:** Als gebruiker wil ik sidebar navigatie zodat ik tussen modules kan wisselen
- ⏳ Vertical navigation
- ⏳ Active state indicator
- ⏳ Icons + labels
- ⏳ Collapsible op mobile

**Technische implementatie details:**
- **Tegels:** Basisgegevens, Laatste Intake, Probleemprofiel, Behandelplan, Afspraken
- **Grid:** Tailwind Grid met responsive breakpoints
- **State:** Zustand voor tegel configuratie

---

### Epic EP09 — UI Components & Styling
**Epic Doel:** Consistente UI componenten volgens UX stylesheet.

| Story ID | Story Title | Points | Status | Dependencies |
|----------|-------------|--------|--------|--------------|
| EP09-ST01 | Basis componenten bouwen | 5 | Not Started | EP00-ST02 |
| EP09-ST02 | Toast notificaties | 3 | Not Started | EP09-ST01 |
| EP09-ST03 | Loading states | 3 | Not Started | EP09-ST01 |
| EP09-ST04 | Formulier componenten | 5 | Not Started | EP09-ST01 |
| EP09-ST05 | Dark mode (stretch) | 5 | Not Started | EP09-ST01 |

**Story Details:**

**EP09-ST01:** Als developer wil ik basis componenten bouwen zodat UI consistent is
- ⏳ Button, Card, Input, Select
- ⏳ Consistent met UX stylesheet
- ⏳ TypeScript props
- ⏳ Storybook (optional)

**EP09-ST02:** Als developer wil ik toast notificaties implementeren zodat feedback duidelijk is
- ⏳ Success/Error/Info/Warning
- ⏳ Auto-dismiss na 5 sec
- ⏳ Queue multiple toasts
- ⏳ Accessible (aria-live)

**EP09-ST03:** Als developer wil ik loading states implementeren zodat gebruiker weet dat er geladen wordt
- ⏳ Skeleton loaders
- ⏳ Spinners voor buttons
- ⏳ Progress bars voor AI
- ⏳ Consistent animation

**EP09-ST04:** Als developer wil ik formulier componenten maken zodat input consistent is
- ⏳ Form wrapper met validation
- ⏳ Error messages styling
- ⏳ Required field indicators
- ⏳ Help text support

**EP09-ST05:** Als developer wil ik dark mode ondersteunen (stretch) zodat gebruikers kunnen kiezen
- ⏳ Theme toggle button
- ⏳ System preference detect
- ⏳ Persist preference
- ⏳ All components support

**Technische implementatie details:**
- **Kleuren:** Zie UX stylesheet (§2-4)
- **Component library:** shadcn/ui of custom
- **Icons:** lucide-react consistent gebruik

---

### Epic EP10 — Testing & Quality Assurance
**Epic Doel:** Comprehensive testing voor stabiele demo.

| Story ID | Story Title | Points | Status | Dependencies |
|----------|-------------|--------|--------|--------------|
| EP10-ST01 | Unit tests schrijven | 5 | Not Started | All features |
| EP10-ST02 | E2E tests schrijven | 5 | Not Started | All features |
| EP10-ST03 | Smoke tests uitvoeren | 2 | Not Started | All features |
| EP10-ST04 | Accessibility testen | 1 | Not Started | EP09 |

**Story Details:**

**EP10-ST01:** Als developer wil ik unit tests schrijven zodat business logic getest is
- ⏳ Vitest setup
- ⏳ Utils & services tests
- ⏳ 80% coverage /lib folder
- ⏳ CI integration

**EP10-ST02:** Als developer wil ik E2E tests schrijven zodat kritieke flows werken
- ⏳ Playwright setup
- ⏳ Happy path: intake → profile → plan
- ⏳ Error scenarios
- ⏳ Cross-browser

**EP10-ST03:** Als team wil ik smoke tests uitvoeren zodat demo stabiel is
- ⏳ Manual test checklist
- ⏳ All features tested
- ⏳ Performance acceptable
- ⏳ No console errors

**EP10-ST04:** Als developer wil ik accessibility testen zodat app toegankelijk is
- ⏳ Keyboard navigation
- ⏳ Screen reader support
- ⏳ WCAG AA contrast
- ⏳ Focus management

**Technische implementatie details:**
- **Test scenarios:** Zie FO §9 demo-scenario
- **Performance:** <3s initial load, <5s AI responses
- **Browser support:** Chrome, Firefox, Safari latest

---

### Epic EP11 — Deployment & Demo Prep
**Epic Doel:** Production-ready deployment en demo voorbereiding.

| Story ID | Story Title | Points | Status | Dependencies |
|----------|-------------|--------|--------|--------------|
| EP11-ST01 | Vercel deployment configureren | 3 | Not Started | All features |
| EP11-ST02 | Demo data prepareren | 5 | Not Started | EP01-ST04 |
| EP11-ST03 | Demo script schrijven | 3 | Not Started | All features |
| EP11-ST04 | Dry-run uitvoeren | 2 | Not Started | EP11-ST01 |

**Story Details:**

**EP11-ST01:** Als developer wil ik Vercel deployment configureren zodat app live is
- ⏳ Vercel project setup
- ⏳ EU region (Amsterdam)
- ⏳ Environment variables
- ⏳ Custom domain (optional)

**EP11-ST02:** Als team wil ik demo data prepareren zodat presentatie smooth verloopt
- ⏳ 3 complete test cliënten
- ⏳ Realistic intake texts
- ⏳ Pre-generated AI responses
- ⏳ Backup data ready

**EP11-ST03:** Als presenter wil ik demo script hebben zodat presentatie gestructureerd is
- ⏳ 10-minute script
- ⏳ Key talking points
- ⏳ Backup scenarios
- ⏳ Q&A anticipatie

**EP11-ST04:** Als team wil ik dry-run doen zodat demo succesvol verloopt
- ⏳ Complete run-through
- ⏳ Timing verified (< 10 min)
- ⏳ Technical issues fixed
- ⏳ Feedback processed

**Technische implementatie details:**
- **Deployment checklist:**
  - Environment variables set
  - Database migrations run
  - Seed data loaded
  - SSL certificate active
  - Monitoring enabled

---

### Epic EP12 — Stretch Features (Optional)
**Epic Doel:** Extra features indien tijd beschikbaar.

| Story ID | Story Title | Points | Status | Dependencies |
|----------|-------------|--------|--------|--------------|
| EP12-ST01 | Afspraken plannen | 8 | Not Started | EP08-ST01 |
| EP12-ST02 | PDF export | 8 | Not Started | EP06-ST05 |
| EP12-ST03 | Leesbaarheid verbeteren met AI | 5 | Not Started | EP07-ST01 |

**Story Details:**

**EP12-ST01:** Als behandelaar wil ik afspraken kunnen plannen zodat agenda gekoppeld is
- ⏳ Calendar view
- ⏳ Create/edit appointments
- ⏳ Link to client
- ⏳ Dashboard widget

**EP12-ST02:** Als behandelaar wil ik PDF export zodat ik rapporten kan delen
- ⏳ Export button
- ⏳ Professional layout
- ⏳ All sections included
- ⏳ Download trigger

**EP12-ST03:** Als behandelaar wil ik leesbaarheid verbeteren met AI zodat tekst B1-niveau wordt
- ⏳ Endpoint: /api/ai/readability
- ⏳ B1 niveau output
- ⏳ Preserve medical accuracy
- ⏳ Preview before apply

---

## 5. Kwaliteit & Testplan

🎯 **Doel:** Borging van kwaliteit voor stabiele demo.

### Test Types
| Test Type | Scope | Tools | Coverage Target |
|-----------|-------|-------|-----------------|
| Unit Tests | Services, utilities, validators | Vitest | 80% /lib folder |
| Integration Tests | API endpoints, database queries | Vitest + MSW | All critical endpoints |
| E2E Tests | Complete user flows | Playwright | 3 happy paths, 2 error paths |
| Performance Tests | Load time, API response | Lighthouse | LCP <2.5s, FID <100ms |
| Accessibility Tests | WCAG compliance | axe-core | AA compliance |
| Security Tests | Auth, XSS, SQL injection | Manual + automated | OWASP top 10 |

### Critical Test Scenarios
1. **New Client Flow**
   - Create client → Add intake → Generate summary → Extract problems → Create plan
   - Expected time: <2 minutes
   - All data persisted correctly

2. **AI Integration Flow**
   - Large intake text (2000+ words) → All AI features work
   - Response time <5 seconds per call
   - Graceful degradation if AI fails

3. **Error Handling**
   - Network failure → Appropriate error messages
   - Invalid input → Clear validation feedback
   - AI timeout → Fallback behavior

### Demo Checklist
- [ ] Login with demo account works
- [ ] Create new client (auto-generated ID)
- [ ] Write intake with TipTap editor
- [ ] AI summarize returns Dutch bullets
- [ ] Problem extraction with highlighting
- [ ] Treatment plan generation (SMART goals)
- [ ] Publish plan (version 1)
- [ ] Dashboard shows all data correctly
- [ ] Navigation breadcrumbs work
- [ ] No console errors
- [ ] Performance acceptable (<3s loads)
- [ ] Mobile view responsive

---

## 6. Demo & Presentatieplan

🎯 **Doel:** Succesvolle 10-minuten demo tijdens AI-inspiratiesessie.

### Demo Timeline
| Time | Activity | Key Points | Backup Plan |
|------|----------|------------|-------------|
| 0:00-1:00 | **Intro** | Context mini-EPD, AI-toegevoegde waarde | Slides ready |
| 1:00-2:30 | **Nieuwe cliënt** | Quick entry, auto ClientID, immediate start | Pre-created client |
| 2:30-5:00 | **Intake + AI** | TipTap editor, AI summarize, source highlighting | Cached AI response |
| 5:00-7:00 | **Profile + Plan** | DSM categorization, AI-generated plan, SMART goals | Manual input ready |
| 7:00-8:30 | **Publiceren** | Version control, status change, dashboard update | Screenshots |
| 8:30-10:00 | **Q&A** | Interactive discussion, next steps | FAQ prepared |

### Technical Setup
- **Primary:** Live on Vercel (stable internet required)
- **Backup 1:** Local development server
- **Backup 2:** Recorded video demo
- **Backup 3:** Static screenshots

### Key Messages
1. AI vermindert administratieve last met 50%
2. Consistente kwaliteit van documentatie
3. Meer tijd voor cliëntcontact
4. Evidence-based suggesties
5. Privacy-first design (geen echte data)

---

## 7. Risico's & Mitigatie

🎯 **Doel:** Proactieve risico management voor succesvolle oplevering.

| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| **Claude API rate limits** | Hoog | Hoog | Response caching, queue implementation, fallback to OpenAI | Developer |
| **TipTap complexiteit** | Medium | Hoog | Start simple, incremental features, fallback to textarea | Developer |
| **Supabase RLS policies fout** | Medium | Hoog | Extensive testing, service role fallback, monitoring | Developer |
| **AI output inconsistent** | Hoog | Medium | Prompt versioning, temperature tuning, validation layer | Developer |
| **Demo internet uitval** | Laag | Hoog | Local setup ready, mobile hotspot backup, video recording | Presenter |
| **Tijd tekort voor features** | Medium | Medium | MoSCoW prioritization, MVP focus, stretch clearly marked | PM |
| **Browser compatibility** | Laag | Medium | Test on Chrome/Safari/Firefox, polyfills where needed | QA |
| **Performance issues** | Medium | Medium | Lazy loading, code splitting, CDN for assets | Developer |
| **Security vulnerability** | Laag | Hoog | Pen test, OWASP checklist, security headers | Developer |

---

## 8. Referenties

🎯 **Doel:** Koppeling naar alle relevante projectdocumentatie.

### Mission Control Documents
- **PRD** — [Product Requirements Document](./prd-mini-ecd.md) - Business requirements en scope
- **FO** — [Functioneel Ontwerp](./fo-mini-ecd.md) - User flows en functionele specificaties
- **TO** — [Technisch Ontwerp](./to-mini-ecd.md) - Architectuur en database design
- **UX/UI** — [Stylesheet](./ux-stylesheet.md) - Kleuren en design system
- **API** — [API Access Document](./api-acces-mini-ecd.md) - Endpoints en authenticatie

### External Resources
- **Repository:** `https://github.com/pinkroccade/mini-epd-prototype`
- **Deployment:** `https://mini-epd.vercel.app`
- **Supabase:** `https://app.supabase.com/project/[project-id]`
- **Claude AI:** `https://docs.anthropic.com/claude/reference`
- **TipTap Docs:** `https://tiptap.dev`
- **Next.js Docs:** `https://nextjs.org/docs`

### Development Resources
- **Component Library:** `https://ui.shadcn.com`
- **Icons:** `https://lucide.dev`
- **Tailwind:** `https://tailwindcss.com`

---

## 9. Technische Notities

### Database Queries Examples
```typescript
// Get client with full dossier
const { data: client } = await supabase
  .from('clients')
  .select(`
    *,
    intake_notes (*),
    problem_profiles (*),
    treatment_plans (*)
  `)
  .eq('id', clientId)
  .single()

// Search clients
const { data: clients } = await supabase
  .from('clients')
  .select('*')
  .ilike('last_name', `%${searchQuery}%`)
  .order('updated_at', { ascending: false })
```

### AI Prompt Templates
```typescript
// Summarize prompt
const SUMMARIZE_PROMPT = `
Vat het onderstaande intake-verslag samen in 5-8 bullets.
Schrijf in Nederlands, klinisch neutraal, zonder persoonlijke informatie.

Intake verslag:
{intakeText}
`

// Extract problems prompt
const EXTRACT_PROMPT = `
Analyseer de intake en bepaal:
1. DSM-light categorie (kies uit: stemming_depressie, angst, gedrag_impuls, middelen_gebruik, cognitief, context_psychosociaal)
2. Severity (laag, middel, hoog)
3. Rationale (2-3 zinnen)
4. Bronzinnen uit de tekst

Intake:
{intakeText}
`
```

### Component Structure
```typescript
// Example component with proper typing
interface ClientCardProps {
  client: Client
  onClick?: (id: string) => void
  isSelected?: boolean
}

export function ClientCard({ client, onClick, isSelected }: ClientCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={() => onClick?.(client.id)}
    >
      <CardHeader>
        <CardTitle>{client.first_name} {client.last_name}</CardTitle>
        <CardDescription>
          {format(new Date(client.birth_date), 'dd-MM-yyyy')}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
```

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 10-11-2025 | Development Team | Initiële versie met complete epic breakdown |