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

| Epic ID | Epic Naam | Totaal Stories | Story Points | Status | Priority | Dependencies |
|---------|-----------|----------------|--------------|--------|----------|--------------|
| EP00 | Project Setup & Configuration | 5 | 13 | Not Started | Critical | - |
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

| Story ID | Story Description | Acceptance Criteria | Story Points | Status | Dependencies |
|----------|-------------------|---------------------|--------------|--------|--------------|
| EP00-ST01 | **Als developer wil ik een Next.js project opzetten zodat ik kan beginnen met development** | ✅ Next.js 14+ met App Router<br>✅ TypeScript configuratie<br>✅ Folder structuur volgens conventions<br>✅ Development server draait op localhost:3000 | 3 | Not Started | - |
| EP00-ST02 | **Als developer wil ik Tailwind CSS en UI libraries installeren zodat ik consistent kan stylen** | ✅ Tailwind CSS v3.4 werkend<br>✅ tailwind.config.ts met custom theme<br>✅ lucide-react icons beschikbaar<br>✅ shadcn/ui setup (of besluit voor custom) | 3 | Not Started | EP00-ST01 |
| EP00-ST03 | **Als developer wil ik Supabase project aanmaken zodat ik database en auth kan gebruiken** | ✅ Supabase project in EU region<br>✅ Connection string in .env.local<br>✅ Supabase client configured<br>✅ TypeScript types generation script | 3 | Not Started | EP00-ST01 |
| EP00-ST04 | **Als developer wil ik environment variables configureren zodat services veilig verbonden zijn** | ✅ .env.local met alle keys<br>✅ .env.example voor team<br>✅ Vercel environment variables<br>✅ Validation bij startup | 2 | Not Started | EP00-ST03 |
| EP00-ST05 | **Als developer wil ik Git repository opzetten zodat code versiebeheerd is** | ✅ GitHub repository<br>✅ .gitignore configuratie<br>✅ Branch protection rules<br>✅ Initial commit met setup | 2 | Not Started | EP00-ST01 |

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

| Story ID | Story Description | Acceptance Criteria | Story Points | Status | Dependencies |
|----------|-------------------|---------------------|--------------|--------|--------------|
| EP01-ST01 | **Als developer wil ik database tabellen creëren zodat data opgeslagen kan worden** | ✅ Tables: clients, intake_notes, problem_profiles, treatment_plans, ai_events<br>✅ Correct data types (UUID, JSONB, etc.)<br>✅ Foreign key constraints<br>✅ Timestamps (created_at, updated_at) | 8 | Not Started | EP00-ST03 |
| EP01-ST02 | **Als developer wil ik Row Level Security policies implementeren zodat data veilig is** | ✅ RLS enabled op alle tables<br>✅ Policies voor authenticated users<br>✅ Test queries werken correct<br>✅ Service role bypass werkt | 5 | Not Started | EP01-ST01 |
| EP01-ST03 | **Als developer wil ik database migrations opzetten zodat schema versiebeheerd is** | ✅ Supabase migrations folder<br>✅ Initial migration script<br>✅ Rollback mogelijk<br>✅ Documentation | 3 | Not Started | EP01-ST01 |
| EP01-ST04 | **Als developer wil ik demo data seeden zodat er test content beschikbaar is** | ✅ 3+ test cliënten<br>✅ Intake notes per cliënt<br>✅ Minimaal 1 compleet dossier<br>✅ Seed script: `npm run seed` | 5 | Not Started | EP01-ST01 |

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

| Story ID | Story Description | Acceptance Criteria | Story Points | Status | Dependencies |
|----------|-------------------|---------------------|--------------|--------|--------------|
| EP02-ST01 | **Als gebruiker wil ik kunnen inloggen zodat ik toegang krijg tot het systeem** | ✅ Login pagina op /auth/login<br>✅ Email/password of magic link<br>✅ Session management<br>✅ Redirect naar dashboard | 3 | Not Started | EP00-ST03, EP01-ST02 |
| EP02-ST02 | **Als developer wil ik protected routes implementeren zodat alleen ingelogde users toegang hebben** | ✅ Middleware voor auth check<br>✅ Redirect naar login indien nodig<br>✅ Loading states tijdens auth<br>✅ Session refresh | 3 | Not Started | EP02-ST01 |
| EP02-ST03 | **Als gebruiker wil ik kunnen uitloggen zodat mijn sessie beëindigd wordt** | ✅ Logout button in header<br>✅ Session cleanup<br>✅ Redirect naar login<br>✅ Clear local state | 2 | Not Started | EP02-ST01 |

**Technische implementatie details:**
- **Auth flow:** Email/password voor demo (magic link als backup)
- **Middleware:** Check auth in `middleware.ts`
- **Protected routes:** Alles behalve `/auth/*`
- **Session:** Supabase JWT tokens

---

### Epic EP03 — Client Management
**Epic Doel:** Complete CRUD functionaliteit voor cliëntbeheer.

| Story ID | Story Description | Acceptance Criteria | Story Points | Status | Dependencies |
|----------|-------------------|---------------------|--------------|--------|--------------|
| EP03-ST01 | **Als behandelaar wil ik een cliëntenlijst zien zodat ik overzicht heb** | ✅ Tabel met: ClientID, Naam, Geboortedatum, Laatste update<br>✅ Zoekbalk voor naam/ID<br>✅ Pagination bij >20 items<br>✅ Loading skeleton | 5 | Not Started | EP01-ST01, EP02-ST02 |
| EP03-ST02 | **Als behandelaar wil ik een nieuwe cliënt aanmaken zodat ik kan starten met intake** | ✅ Modal/drawer met formulier<br>✅ Velden: Voornaam, Achternaam, Geboortedatum<br>✅ Auto-generated UUID<br>✅ Validatie met Zod<br>✅ Success toast | 5 | Not Started | EP03-ST01 |
| EP03-ST03 | **Als behandelaar wil ik cliëntgegevens bekijken zodat ik het dossier kan inzien** | ✅ Route: /clients/[id]<br>✅ Breadcrumb navigatie<br>✅ Tabs: Overzicht, Intakes, Profiel, Plan<br>✅ 404 handling | 5 | Not Started | EP03-ST01 |
| EP03-ST04 | **Als behandelaar wil ik cliëntgegevens bewerken zodat ik updates kan maken** | ✅ Edit mode in detail view<br>✅ Form validation<br>✅ Optimistic updates<br>✅ Error handling | 3 | Not Started | EP03-ST03 |
| EP03-ST05 | **Als developer wil ik Zustand store voor client state zodat data consistent blijft** | ✅ clientStore.ts setup<br>✅ Actions: setSelectedClient, updateClient<br>✅ Persistent state waar nodig<br>✅ TypeScript types | 3 | Not Started | EP00-ST01 |

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

| Story ID | Story Description | Acceptance Criteria | Story Points | Status | Dependencies |
|----------|-------------------|---------------------|--------------|--------|--------------|
| EP04-ST01 | **Als behandelaar wil ik TipTap editor gebruiken zodat ik rijk opgemaakte notities kan maken** | ✅ TipTap met StarterKit<br>✅ Toolbar: Bold, Italic, Lists, etc.<br>✅ Placeholder text<br>✅ Content als ProseMirror JSON | 8 | Not Started | EP03-ST03 |
| EP04-ST02 | **Als behandelaar wil ik intake verslagen opslaan zodat ze bewaard blijven** | ✅ Save button + Ctrl/Cmd+S<br>✅ Store in intake_notes table<br>✅ Auto-save indicator<br>✅ Success/error toasts | 5 | Not Started | EP04-ST01 |
| EP04-ST03 | **Als behandelaar wil ik tags toevoegen aan verslagen zodat ik ze kan categoriseren** | ✅ Tag dropdown: Intake/Evaluatie/Plan<br>✅ Tag badge in lijst<br>✅ Filter op tag mogelijk<br>✅ Validation | 3 | Not Started | EP04-ST02 |
| EP04-ST04 | **Als behandelaar wil ik oude intakes bekijken zodat ik historie kan inzien** | ✅ Lijst van intakes per cliënt<br>✅ Sorteer op datum<br>✅ Click to view/edit<br>✅ Read-only mode optie | 5 | Not Started | EP04-ST02 |
| EP04-ST05 | **Als developer wil ik tekst extractie implementeren voor search** | ✅ Extract plain text van ProseMirror<br>✅ Store in content_text field<br>✅ Full-text search mogelijk<br>✅ Performance optimization | 5 | Not Started | EP04-ST02 |
| EP04-ST06 | **Als behandelaar wil ik de AI-rail zien zodat AI-resultaten preview kan bekijken** | ✅ Rechter paneel (40% breedte)<br>✅ Collapsible/expandable<br>✅ Preview area voor AI output<br>✅ Action buttons: Invoegen/Annuleren | 8 | Not Started | EP04-ST01 |

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

| Story ID | Story Description | Acceptance Criteria | Story Points | Status | Dependencies |
|----------|-------------------|---------------------|--------------|--------|--------------|
| EP05-ST01 | **Als behandelaar wil ik een probleem categorie selecteren zodat ik kan classificeren** | ✅ Dropdown met 6 categorieën (zie FO §4.4)<br>✅ Beschrijving per categorie<br>✅ Validation required field<br>✅ Store in problem_profiles | 5 | Not Started | EP04-ST02 |
| EP05-ST02 | **Als behandelaar wil ik severity aangeven zodat ernst duidelijk is** | ✅ Button group: Laag/Middel/Hoog<br>✅ Kleur-coded badges<br>✅ Hover tooltips met uitleg<br>✅ Required validation | 3 | Not Started | EP05-ST01 |
| EP05-ST03 | **Als behandelaar wil ik opmerkingen toevoegen zodat ik context kan geven** | ✅ Textarea voor vrije tekst<br>✅ Character limit (500)<br>✅ Optional field<br>✅ Markdown support | 3 | Not Started | EP05-ST01 |
| EP05-ST04 | **Als behandelaar wil ik AI-suggestie paneel gebruiken zodat classificatie sneller gaat** | ✅ Knop "AI > Analyseer intake"<br>✅ Suggestie paneel rechts<br>✅ Shows: categorie, severity, rationale<br>✅ Accepteer/Negeer buttons<br>✅ Source highlighting in intake (zie TO §5.4) | 10 | Not Started | EP04-ST02, EP07-ST03 |

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

| Story ID | Story Description | Acceptance Criteria | Story Points | Status | Dependencies |
|----------|-------------------|---------------------|--------------|--------|--------------|
| EP06-ST01 | **Als behandelaar wil ik een behandelplan genereren zodat ik snel een opzet heb** | ✅ Knop "AI > Genereer behandelplan"<br>✅ Uses intake + profile als context<br>✅ Genereert 4 secties<br>✅ Loading state tijdens generatie | 10 | Not Started | EP05-ST01, EP07-ST04 |
| EP06-ST02 | **Als behandelaar wil ik doelen bewerken zodat ze SMART geformuleerd zijn** | ✅ Lijst van doelen (bullets)<br>✅ Inline editing mogelijk<br>✅ Add/remove doelen<br>✅ Regenerate per doel optie | 8 | Not Started | EP06-ST01 |
| EP06-ST03 | **Als behandelaar wil ik interventies specificeren zodat behandeling duidelijk is** | ✅ Interventie lijst<br>✅ Type + frequentie + duur<br>✅ Voorgestelde interventies<br>✅ Custom toevoegen | 5 | Not Started | EP06-ST01 |
| EP06-ST04 | **Als behandelaar wil ik meetmomenten plannen zodat voortgang gemeten wordt** | ✅ Timeline met meetmomenten<br>✅ Na X sessies format<br>✅ Evaluatie types<br>✅ Calendar integration (stretch) | 5 | Not Started | EP06-ST01 |
| EP06-ST05 | **Als behandelaar wil ik plan publiceren zodat het definitief wordt** | ✅ Concept vs Gepubliceerd status<br>✅ Versioning (v1, v2, etc.)<br>✅ Published timestamp<br>✅ Read-only na publicatie<br>✅ Nieuwe versie mogelijk | 6 | Not Started | EP06-ST02 |

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

| Story ID | Story Description | Acceptance Criteria | Story Points | Status | Dependencies |
|----------|-------------------|---------------------|--------------|--------|--------------|
| EP07-ST01 | **Als developer wil ik Claude API client configureren zodat AI calls mogelijk zijn** | ✅ Anthropic SDK setup<br>✅ Server-side only implementation<br>✅ Error handling<br>✅ Rate limiting logic | 5 | Not Started | EP00-ST04 |
| EP07-ST02 | **Als behandelaar wil ik intake samenvatten met AI zodat ik snel overzicht heb** | ✅ Endpoint: /api/ai/summarize<br>✅ 5-8 bullet points output<br>✅ Nederlands, klinisch neutraal<br>✅ Max 5 sec response time | 8 | Not Started | EP07-ST01, EP04-ST06 |
| EP07-ST03 | **Als behandelaar wil ik problemen extraheren met AI zodat classificatie sneller gaat** | ✅ Endpoint: /api/ai/extract<br>✅ Returns: category, severity, rationale<br>✅ Source sentences identificatie<br>✅ Highlighting support | 8 | Not Started | EP07-ST01 |
| EP07-ST04 | **Als behandelaar wil ik behandelplan genereren met AI zodat ik een goede basis heb** | ✅ Endpoint: /api/ai/generate-plan<br>✅ SMART doelen formulering<br>✅ Evidence-based interventies<br>✅ Structured JSON output | 8 | Not Started | EP07-ST01 |
| EP07-ST05 | **Als developer wil ik AI events loggen zodat gebruik gemonitord wordt** | ✅ Store in ai_events table<br>✅ Track: prompt, response, duration<br>✅ Cost calculation<br>✅ Error logging | 5 | Not Started | EP07-ST01, EP01-ST01 |

**Technische implementatie details:**
- **Claude model:** claude-3-5-sonnet-20241022
- **Prompt templates:** `/src/lib/ai/prompts/`
- **Temperature:** 0.3 (deterministic)
- **Max tokens:** Per endpoint verschillend
- **Security:** API key alleen server-side

---

### Epic EP08 — Dashboard & Navigation
**Epic Doel:** Configureerbaar dashboard met tegels en navigatie.

| Story ID | Story Description | Acceptance Criteria | Story Points | Status | Dependencies |
|----------|-------------------|---------------------|--------------|--------|--------------|
| EP08-ST01 | **Als behandelaar wil ik een dashboard zien zodat ik overzicht heb per cliënt** | ✅ 5 tegels (zie FO §4.2)<br>✅ Responsive grid layout<br>✅ Data uit verschillende tables<br>✅ Click naar detail | 5 | Not Started | EP03-ST03 |
| EP08-ST02 | **Als behandelaar wil ik tegels configureren zodat ik kan personaliseren** | ✅ Settings icon → modal<br>✅ Checkboxes per tegel<br>✅ LocalStorage persistence<br>✅ Instant preview | 3 | Not Started | EP08-ST01 |
| EP08-ST03 | **Als gebruiker wil ik breadcrumb navigatie zodat ik weet waar ik ben** | ✅ Breadcrumb in header<br>✅ Clickable segments<br>✅ Current page highlight<br>✅ Responsive truncation | 2 | Not Started | EP03-ST03 |
| EP08-ST04 | **Als gebruiker wil ik sidebar navigatie zodat ik tussen modules kan wisselen** | ✅ Vertical navigation<br>✅ Active state indicator<br>✅ Icons + labels<br>✅ Collapsible op mobile | 3 | Not Started | EP03-ST03 |

**Technische implementatie details:**
- **Tegels:** Basisgegevens, Laatste Intake, Probleemprofiel, Behandelplan, Afspraken
- **Grid:** Tailwind Grid met responsive breakpoints
- **State:** Zustand voor tegel configuratie

---

### Epic EP09 — UI Components & Styling
**Epic Doel:** Consistente UI componenten volgens UX stylesheet.

| Story ID | Story Description | Acceptance Criteria | Story Points | Status | Dependencies |
|----------|-------------------|---------------------|--------------|--------|--------------|
| EP09-ST01 | **Als developer wil ik basis componenten bouwen zodat UI consistent is** | ✅ Button, Card, Input, Select<br>✅ Consistent met UX stylesheet<br>✅ TypeScript props<br>✅ Storybook (optional) | 5 | Not Started | EP00-ST02 |
| EP09-ST02 | **Als developer wil ik toast notificaties implementeren zodat feedback duidelijk is** | ✅ Success/Error/Info/Warning<br>✅ Auto-dismiss na 5 sec<br>✅ Queue multiple toasts<br>✅ Accessible (aria-live) | 3 | Not Started | EP09-ST01 |
| EP09-ST03 | **Als developer wil ik loading states implementeren zodat gebruiker weet dat er geladen wordt** | ✅ Skeleton loaders<br>✅ Spinners voor buttons<br>✅ Progress bars voor AI<br>✅ Consistent animation | 3 | Not Started | EP09-ST01 |
| EP09-ST04 | **Als developer wil ik formulier componenten maken zodat input consistent is** | ✅ Form wrapper met validation<br>✅ Error messages styling<br>✅ Required field indicators<br>✅ Help text support | 5 | Not Started | EP09-ST01 |
| EP09-ST05 | **Als developer wil ik dark mode ondersteunen (stretch) zodat gebruikers kunnen kiezen** | ✅ Theme toggle button<br>✅ System preference detect<br>✅ Persist preference<br>✅ All components support | 5 | Not Started | EP09-ST01 |

**Technische implementatie details:**
- **Kleuren:** Zie UX stylesheet (§2-4)
- **Component library:** shadcn/ui of custom
- **Icons:** lucide-react consistent gebruik

---

### Epic EP10 — Testing & Quality Assurance
**Epic Doel:** Comprehensive testing voor stabiele demo.

| Story ID | Story Description | Acceptance Criteria | Story Points | Status | Dependencies |
|----------|-------------------|---------------------|--------------|--------|--------------|
| EP10-ST01 | **Als developer wil ik unit tests schrijven zodat business logic getest is** | ✅ Vitest setup<br>✅ Utils & services tests<br>✅ 80% coverage /lib folder<br>✅ CI integration | 5 | Not Started | All features |
| EP10-ST02 | **Als developer wil ik E2E tests schrijven zodat kritieke flows werken** | ✅ Playwright setup<br>✅ Happy path: intake → profile → plan<br>✅ Error scenarios<br>✅ Cross-browser | 5 | Not Started | All features |
| EP10-ST03 | **Als team wil ik smoke tests uitvoeren zodat demo stabiel is** | ✅ Manual test checklist<br>✅ All features tested<br>✅ Performance acceptable<br>✅ No console errors | 2 | Not Started | All features |
| EP10-ST04 | **Als developer wil ik accessibility testen zodat app toegankelijk is** | ✅ Keyboard navigation<br>✅ Screen reader support<br>✅ WCAG AA contrast<br>✅ Focus management | 1 | Not Started | EP09 |

**Technische implementatie details:**
- **Test scenarios:** Zie FO §9 demo-scenario
- **Performance:** <3s initial load, <5s AI responses
- **Browser support:** Chrome, Firefox, Safari latest

---

### Epic EP11 — Deployment & Demo Prep
**Epic Doel:** Production-ready deployment en demo voorbereiding.

| Story ID | Story Description | Acceptance Criteria | Story Points | Status | Dependencies |
|----------|-------------------|---------------------|--------------|--------|--------------|
| EP11-ST01 | **Als developer wil ik Vercel deployment configureren zodat app live is** | ✅ Vercel project setup<br>✅ EU region (Amsterdam)<br>✅ Environment variables<br>✅ Custom domain (optional) | 3 | Not Started | All features |
| EP11-ST02 | **Als team wil ik demo data prepareren zodat presentatie smooth verloopt** | ✅ 3 complete test cliënten<br>✅ Realistic intake texts<br>✅ Pre-generated AI responses<br>✅ Backup data ready | 5 | Not Started | EP01-ST04 |
| EP11-ST03 | **Als presenter wil ik demo script hebben zodat presentatie gestructureerd is** | ✅ 10-minute script<br>✅ Key talking points<br>✅ Backup scenarios<br>✅ Q&A anticipatie | 3 | Not Started | All features |
| EP11-ST04 | **Als team wil ik dry-run doen zodat demo succesvol verloopt** | ✅ Complete run-through<br>✅ Timing verified (< 10 min)<br>✅ Technical issues fixed<br>✅ Feedback processed | 2 | Not Started | EP11-ST01 |

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

| Story ID | Story Description | Acceptance Criteria | Story Points | Status | Dependencies |
|----------|-------------------|---------------------|--------------|--------|--------------|
| EP12-ST01 | **Als behandelaar wil ik afspraken kunnen plannen zodat agenda gekoppeld is** | ✅ Calendar view<br>✅ Create/edit appointments<br>✅ Link to client<br>✅ Dashboard widget | 8 | Not Started | EP08-ST01 |
| EP12-ST02 | **Als behandelaar wil ik PDF export zodat ik rapporten kan delen** | ✅ Export button<br>✅ Professional layout<br>✅ All sections included<br>✅ Download trigger | 8 | Not Started | EP06-ST05 |
| EP12-ST03 | **Als behandelaar wil ik leesbaarheid verbeteren met AI zodat tekst B1-niveau wordt** | ✅ Endpoint: /api/ai/readability<br>✅ B1 niveau output<br>✅ Preserve medical accuracy<br>✅ Preview before apply | 5 | Not Started | EP07-ST01 |

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