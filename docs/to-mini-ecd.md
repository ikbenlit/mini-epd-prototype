# ⚙️ Technisch Ontwerp — Mini‑ECD (MVP)

**Datum:** aug 2025
**Scope:** MVP voor demo tijdens AI‑inspiratiesessie (≤10 min)
**Bronnen:** PRD (v1.1), UX/UI‑specificatie, FO (MVP)

---

## 0) TL;DR Stack & Keuzes

* **Framework**: **Next.js** (App Router)
* **UI**: **Tailwind CSS** (v4; fallback v3.4 bij frictie) + **lucide-react** iconen; lichte componentlaag (shadcn/ui of eigen + headless)
* **Editor**: **TipTap** (ProseMirror) met StarterKit + BasicNodes
* **Auth & Data**: **Supabase** (PostgreSQL + Auth + Storage)
* **AI**: **Claude** (Anthropic) via API
* **Hosting**: **Vercel** (Next.js)
* **PDF (stretch)**: server‑side HTML→PDF via **Chromium (playwright/puppeteer)** of cloud‑functie.
* **Test**: **Vitest** (unit) + **Playwright** (e2e).

> ✅ Past bij MVP: minimale libs, AI‑calls server‑side, EU‑dataregio (Supabase EU), TipTap voor rijke tekst.

---

## 1) Architectuur

### 1.1 Overzicht

```
Browser (UI)
  └─ Next.js (App Router)
       ├─ Supabase (PostgreSQL + Auth + Storage)
       ├─ Claude AI (Anthropic)
       └─ (Stretch) PDF service (Chromium in serverless)
```

* **Server‑side AI‑calls**: keys blijven op de server; UI krijgt alleen resultaten.
* **Dataflow (kern)**: Intake (TipTap) → AI‑samenvat → AI‑extract → Probleemprofiel → AI‑plan → Plan (concept → publiceer).

### 1.2 Routing & lagen

* **Pages** (App Router): `/clients`, `/clients/[id]` (tabs: overzicht/intakes/profiel/plan).
* **API** (Next.js Route Handlers): `/api/clients`, `/api/intakes`, `/api/problem-profile`, `/api/treatment-plan`, `/api/ai/*`.

### 1.3 State

De state van de applicatie wordt beheerd met **React Context API** + **Zustand** (lichtgewicht state library). Dit is eenvoudig genoeg voor de MVP-scope. State wordt georganiseerd in `src/lib/stores/` of `src/contexts/`.

*   **`clientStore.ts` (Zustand)**: Beheert de state gerelateerd aan cliëntdata.
    *   `selectedClientId: string | null`: Houdt het ID van de actieve cliënt bij. Dit is de centrale spil van de applicatie-staat.
    *   `clients: Client[]`: De lijst van alle cliënten voor de overzichtspagina.
    *   `currentClientDossier: Dossier | null`: Reageert op wijzigingen in `selectedClientId`. Wanneer de ID verandert, haalt de store automatisch de volledige dossierinhoud (intakes, profiel, plan) op via Supabase.

*   **`uiStore.ts` (Zustand)**: Beheert globale UI-state.
    *   `toasts: ToastMessage[]`: Een array met actieve 'toast'-notificaties die globaal getoond kunnen worden.

*   **Dataflow Patroon**:
    1.  De UI update `selectedClientId` via Zustand action.
    2.  De store triggert een Supabase query om dossierdata op te halen.
    3.  React componenten die subscribed zijn via `useClientStore()` updaten automatisch.

*   **Alternatief (MVP)**: Voor kleinere state kan ook React Context + `useState` volstaan zonder externe library.

Dit patroon zorgt voor een efficiënte, voorspelbare en reactieve dataflow door de hele applicatie.

---

## 2) Data‑model (Supabase / PostgreSQL)

### 2.1 Entiteiten

* **clients** — basisgegevens
* **intake\_notes** — TipTap JSON + afgeleide velden
* **problem\_profiles** — DSM‑light categorie + severity
* **treatment\_plans** — JSONB plan (doelen/interventies/frequentie/meetmomenten), versie/status
* **ai\_events** — prompts/completions (telemetrie, debugging)
* *(Stretch)* **appointments**, **reports**

### 2.2 Relaties (PostgreSQL)

```
clients (id UUID PRIMARY KEY)
├── intake_notes (client_id → clients.id, FK)
├── problem_profiles (client_id → clients.id, FK)
└── treatment_plans (client_id → clients.id, FK)

ai_events (id UUID PRIMARY KEY, client_id + note_id als optionele FKs)
```

**Row Level Security (RLS)**: Alle tables hebben RLS policies voor auth.users().

### 2.3 Tables (PostgreSQL schema)

> **NB**: Enums als TEXT met CHECK constraints; plan inhoud als JSONB voor flexibiliteit in MVP.

```typescript
// PostgreSQL Tables Schema (TypeScript types)

// clients table
interface Client {
  id: string; // UUID (auto-generated)
  first_name: string;
  last_name: string;
  birth_date: string; // DATE (ISO 8601: YYYY-MM-DD)
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

// intake_notes table
interface IntakeNote {
  id: string; // UUID
  client_id: string; // FK → clients.id
  title?: string;
  tag: 'Intake' | 'Evaluatie' | 'Plan'; // TEXT with CHECK
  content_json: object; // JSONB (ProseMirror document)
  content_text?: string; // TEXT (for full-text search)
  author?: string; // FK → auth.users.id (optioneel)
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

// problem_profiles table
interface ProblemProfile {
  id: string; // UUID
  client_id: string; // FK → clients.id
  category: 'stemming_depressie' | 'angst' | 'gedrag_impuls' |
           'middelen_gebruik' | 'cognitief' | 'context_psychosociaal'; // TEXT with CHECK
  severity: 'laag' | 'middel' | 'hoog'; // TEXT with CHECK
  remarks?: string; // TEXT
  source_note_id?: string; // FK → intake_notes.id
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

// treatment_plans table
interface TreatmentPlan {
  id: string; // UUID
  client_id: string; // FK → clients.id
  version: number; // INTEGER
  status: 'concept' | 'gepubliceerd'; // TEXT with CHECK
  plan: { // JSONB
    doelen: string[];
    interventies: string[];
    frequentie: string;
    meetmomenten: string[];
  };
  created_by?: string; // FK → auth.users.id
  created_at: string; // TIMESTAMPTZ
  published_at?: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

// ai_events table (telemetrie)
interface AiEvent {
  id: string; // UUID
  kind: 'summarize' | 'readability' | 'extract' | 'plan'; // TEXT with CHECK
  client_id?: string; // FK → clients.id (nullable)
  note_id?: string; // FK → intake_notes.id (nullable)
  request: object; // JSONB
  response: object; // JSONB
  duration_ms: number; // INTEGER
  created_at: string; // TIMESTAMPTZ
}
```

**SQL voorbeelden** voor table creation beschikbaar in `/supabase/migrations/`.
**Supabase TypeScript types** kunnen automatisch gegenereerd worden via `supabase gen types typescript`.

### 2.4 Row Level Security (basis)

Voor demo kunnen RLS policies simpel zijn: **alle rows zichtbaar voor authenticated users**. In productie: per organisatie/therapeut scheiden met `org_id` kolom.

```sql
-- Demo RLS policies (apply to all tables)
-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_events ENABLE ROW LEVEL SECURITY;

-- Authenticated users kunnen alles lezen/schrijven (demo only!)
CREATE POLICY "Allow all for authenticated users" ON clients
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all for authenticated users" ON intake_notes
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all for authenticated users" ON problem_profiles
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all for authenticated users" ON treatment_plans
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all for authenticated users" ON ai_events
  FOR ALL USING (auth.uid() IS NOT NULL);
```

**Productie**: Voeg `org_id` toe en filter op `auth.jwt() ->> 'org_id'`.

---

## 3) API & Endpoints (Next.js Route Handlers)

### 3.1 CRUD

* `POST /api/clients` — create

* `GET /api/clients?query=` — list/search

* `GET /api/clients/:id` — detail

* `PATCH /api/clients/:id` — update

* `POST /api/intakes` — create intake

* `GET /api/intakes?clientId=` — list

* `GET /api/intakes/:id` — detail

* `PATCH /api/intakes/:id` — update

* `POST /api/problem-profile` — create/update current

* `GET /api/problem-profile?clientId=` — latest

* `POST /api/treatment-plan` — create (concept)

* `PATCH /api/treatment-plan/:id/publish` — publish vN

### 3.2 AI‑acties

* `POST /api/ai/summarize` — TipTap JSON → bullets
* `POST /api/ai/readability` — TipTap JSON → B1
* `POST /api/ai/extract` — TipTap JSON → {category, severity, rationale}
* `POST /api/ai/generate-plan` — {noteId | profile} → plan JSON

**Patroon**: alle AI‑endpoints valideren input, roepen Claude API aan server‑side, loggen in `ai_events`, geven **preview** terug. UI beslist *Insert/Apply*.

---

## 4) AI‑integratie (Claude / Anthropic)

### 4.1 Model & API

* **Model**: Claude 3.5 Sonnet (of nieuwere versie) via Anthropic API.
* **Regio**: Anthropic API is globally distributed; data blijft binnen EU waar mogelijk.
* **SDK**: `@anthropic-ai/sdk` (officiële Node.js SDK).

### 4.2 Prompt‑templates (schets)

* **Summarize**: *“Vat het onderstaande intake‑verslag samen in 5–8 bullets. Schrijf in NL, klinisch neutraal, zonder PII.”*
* **Readability (B1)**: *“Herschrijf leesbaar op B1‑niveau. Behoud medische betekenis, vermijd jargon waar mogelijk.”*
* **Extract**: *"Haal uit de tekst: DSM‑light categorie (uit 6), severity (laag/middel/hoog), met korte toelichting en quote‑bronnen."*
* **Plan**: *"Genereer behandelplan (Doelen, Interventies, Frequentie/Duur, Meetmomenten) op basis van intake/profiel. SMART‑formuleer doelen."*

**Parameters (startwaarden)**:
- `model`: "claude-3-5-sonnet-20241022" (of nieuwer)
- `temperature`: 0.3 (deterministischer)
- `max_tokens`: passend per taak (samenvat 800–1200, plan 1600–2400)

**Veiligheid**: PII-verwijdering in post-processing (heuristiek); gebruik system prompt voor extra context guards.

---

## 5) Frontend implementatie

### 5.1 UI‑skelet

* **Layout**: Topbar (cliëntcontext) + LeftNav (dossier) + Main (detail) + Toast area.
* **Componenten**: Button, Card, Input, Select, Tabs, Badge, Dialog, Drawer, Toast, Tooltip, Breadcrumb.

### 5.2 TipTap

* **Nodes**: paragraph, heading, bold/italic/underline, bullet/ordered list, blockquote, code (optioneel).
* **Opslag**: `content_json` (ProseMirror doc).
* **AI‑Right‑rail**: tabs: Samenvatten, B1, Extract; acties **Preview → Insert**.

### 5.4 Haalbaarheidsonderzoek: AI Source Highlighting

Een belangrijke UX-vereiste is het visueel aanduiden (highlighten) van de bronzinnen in de intaketekst die de AI heeft gebruikt voor een suggestie. Dit is technisch goed haalbaar.

**Aanpak:**

1.  **Backend API Aanpassing**: Het AI-endpoint (bv. `/api/ai/extract`) moet niet alleen de suggestie retourneren, maar ook een array van de exacte bronzinnen (`sourceSentences: string[]`).
2.  **Frontend TipTap Implementatie**:
    *   De frontend gebruikt de [TipTap Decorations API](https://tiptap.dev/api/decorations) om de highlighting te realiseren. Decorations passen styling toe zonder de onderliggende content te wijzigen.
    *   Bij ontvangst van de `sourceSentences` doorzoekt de frontend het TipTap-document naar de posities (`from`, `to`) van deze zinnen.
    *   Voor elke gevonden positie wordt een `Decoration.inline(from, to, { class: 'ai-source-highlight' })` aangemaakt.
3.  **Styling**: Een simpele CSS-klasse `.ai-source-highlight` (bv. met een lichtgele achtergrond) wordt toegevoegd aan de globale stylesheet.
4.  **Lifecycle**: De highlights worden gewist zodra de gebruiker de suggestie accepteert, negeert, of een nieuwe AI-actie initieert.

**Conclusie**: De aanpak is robuust en de complexiteit is laag tot gemiddeld. Het wordt meegenomen in de PoC voor de TipTap-editor.

### 5.3 Toetsenbord & UX

* `Ctrl/Cmd+S` opslaan, `Ctrl/Cmd+K` zoek, `Ctrl/Cmd+N` nieuw verslag.
* Leeg‑staten met CTA’s; skeletons bij laden; non‑blocking spinners bij AI.

---

## 6) Security, Privacy & Compliance (MVP‑proof)

* **Data**: uitsluitend fictieve demo‑data; geen echte PII.
* **Regio's**: EU‑hosting (Supabase EU: Frankfurt/London; Claude API global).
* **Secret handling**: API keys via Vercel Envs; nooit in client bundelen.
* **RLS Policies**: minimaal aan; authenticated users krijgen toegang (demo).
* **Audit (lichtgewicht)**: `ai_events` + timestamps op alle tables.
* **CORS**: beperken tot demo‑domain.

---

## 7) Deployment & Environments

* **Dev**: `.env.local` met Supabase keys + Claude API key
* **Preview/Prod**: Vercel project → `VERCEL_ENV` gates; RLS policies via Supabase migrations.
* **Supabase**: EU-regio (Frankfurt of London), schema deploy via `supabase db push` of migrations.

### 7.1 Environment variables (voorbeeld)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...            # Public anon key (frontend safe)
SUPABASE_SERVICE_ROLE_KEY=eyJ...                # Service role key (server only!)

# Claude AI
ANTHROPIC_API_KEY=sk-ant-...                    # Claude API key (server only!)

# App
NEXT_PUBLIC_APP_URL=https://mini-ecd.example
NODE_ENV=production
```

**Security**:
- `SUPABASE_SERVICE_ROLE_KEY` en `ANTHROPIC_API_KEY` alleen server-side gebruiken
- Vercel Environment Variables voor productie
- Gebruik `.env.local` voor lokale ontwikkeling (niet in git!)

---

## 8) Setup stappen (korte gids)

1. **Repo & deps**: init Next.js (App Router) + Tailwind + TipTap + Supabase client + Anthropic SDK.
2. **Supabase**: project aanmaken (EU-regio) → Tables uit §2.3 aanmaken via migrations → RLS policies activeren.
3. **Env**: Vercel + lokale `.env.local` vullen (Supabase keys + Claude API key).
4. **Endpoints**: CRUD + AI‑routes implementeren als Next.js Route Handlers (server‑side).
5. **Screens**: Clients list/detail, Intake editor + AI‑rail, Profiel form, Plan cards.
6. **Smoke test**: Flow A/B/C end‑to‑end met mock data.
7. **(Optioneel)** PDF export & afspraken tab.

---

## 9) Test & Kwaliteit

* **Unit**: parsers, validators, AI‑response mappers (Zod schemas).
* **E2E (Playwright)**: Flow A/B/C met seeded data.
* **Prompt tests**: vaste inputs → snapshot op kernvelden (niet volledige tekst).

---

## 10) Bekende beperkingen & risico's

* **TipTap** content search: extra index/afgeleide `content_text` nodig voor snelle zoek (PostgreSQL full-text search).
* **Claude API rate limits**: monitor gebruik; overweeg caching voor veelvoorkomende prompts.
* **Serverless PDF**: kan cold‑start of memory issues geven → overweeg queue/edge function.
* **RLS Policies (demo)**: simplistisch; voor productie per organisatie/rol modelleren met `org_id`.

---

## 11) Wat ontbrak nog in je stack (aanvullingen)

* **Tailwind CSS** (UI‑basis) en **iconen (lucide-react)**.
* **Auth**: Supabase Auth (magic link, email/password, of OAuth).
* **Validatie**: **Zod** voor request/response schemas.
* **Logging**: lichte audit via `ai_events` table + Next.js middleware.
* **Testing**: Vitest/Playwright.
* **PDF (stretch)**: keuze voor renderer (Puppeteer/Playwright).
* **Type‑safety**: Supabase auto-generated types via `supabase gen types typescript`.

---

## 12) Roadmap na demo

* Rollen & rechten, multi‑tenant (org\_id) + stricte RLS policies.
* Templates per zorgpad (verslag/plan).
* Trendanalyse (meetmomenten) + grafieken.
* Integraties (PinkRoccade modules), exportprofielen.
* Real-time collaboratie via Supabase Realtime (optioneel).

---
