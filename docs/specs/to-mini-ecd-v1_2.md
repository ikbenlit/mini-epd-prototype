# ⚙️ Technisch Ontwerp — Mini‑ECD (v1.2)

**Datum:** nov 2025
**Scope:** MVP voor LinkedIn Build in Public Serie + Demo (≤10 min)
**Bronnen:** PRD (v1.2), FO (v1.2), UX/UI‑specificatie, Bouwplan

---

## 0) TL;DR Stack & Keuzes

* **Framework**: **Next.js** (App Router) - single repo voor marketing + EPD
* **UI**: **Tailwind CSS** (v4; fallback v3.4 bij frictie) + **lucide-react** iconen; lichte componentlaag (shadcn/ui of eigen + headless)
* **Editor**: **TipTap** (ProseMirror) met StarterKit + BasicNodes
* **Auth & Data**: **Supabase** (PostgreSQL + Auth + Storage)
* **AI**: **Claude** (Anthropic) via API
* **Hosting**: **Vercel** (Next.js)
* **Onboarding**: **react-joyride** voor walkthroughs + custom tooltip system
* **PDF (stretch)**: server‑side HTML→PDF via **Chromium (playwright/puppeteer)** of cloud‑functie
* **Test**: **Vitest** (unit) + **Playwright** (e2e)

> ✅ Past bij MVP: minimale libs, AI‑calls server‑side, EU‑dataregio (Supabase EU), TipTap voor rijke tekst, marketing website in dezelfde app voor SEO/speed.

---

## 1) Architectuur

### 1.1 Overzicht

```
Browser (UI)
  └─ Next.js (App Router)
       ├─ Marketing Site (/, /build-log, /demo, /contact)
       ├─ Protected EPD App (/clients/*, /dashboard)
       ├─ Supabase (PostgreSQL + Auth + Storage)
       ├─ Claude AI (Anthropic)
       └─ (Stretch) PDF service (Chromium in serverless)
```

* **Server‑side AI‑calls**: keys blijven op de server; UI krijgt alleen resultaten
* **Single Next.js app**: Marketing en EPD in één repo voor efficiëntie
* **Dataflow (kern)**: Intake (TipTap) → AI‑samenvat → AI‑extract → Probleemprofiel → AI‑plan → Plan (concept → publiceer)

### 1.2 Routing & lagen

**Route Groepen (Next.js App Router):**

```
/app
  /(marketing)                    # Public routes
    /page.tsx                     # Landing page
    /build-log
      /page.tsx                   # Timeline overview
      /[week]/page.tsx            # Week detail
    /demo/page.tsx                # Demo info + credentials
    /how-it-works/page.tsx        # Software on Demand explainer
    /contact/page.tsx             # Lead capture form
    /layout.tsx                   # Marketing layout (geen sidebar)
  
  /(app)                          # Protected routes
    /layout.tsx                   # App layout (met sidebar nav)
    /clients
      /page.tsx                   # Client list
      /[id]
        /page.tsx                 # Client dashboard (tabs)
        /intakes/page.tsx         # Intake module
        /profile/page.tsx         # Problem profile
        /plan/page.tsx            # Treatment plan
    /onboarding/page.tsx          # First-time walkthrough
  
  /api                            # API routes (server‑side)
    /clients/route.ts             # CRUD clients
    /intakes/route.ts             # CRUD intakes
    /problem-profile/route.ts     # CRUD profiles
    /treatment-plan/route.ts      # CRUD plans
    /ai
      /summarize/route.ts         # AI summarize
      /readability/route.ts       # AI B1 rewrite
      /extract/route.ts           # AI extract problems
      /generate-plan/route.ts     # AI generate plan
    /build-metrics/route.ts       # Build tracking (hours, costs)
    /leads/route.ts               # Lead form submissions
```

**Routing Strategie:**
- Marketing routes: public, geen auth check
- App routes: protected met middleware auth check
- API routes: server-side only, verschillende auth levels per endpoint
- Shared components in `/components/shared/`
- Marketing-specific in `/components/marketing/`
- App-specific in `/components/app/`

### 1.3 State

De state van de applicatie wordt beheerd met **React Context API** + **Zustand** (lichtgewicht state library). Dit is eenvoudig genoeg voor de MVP-scope.

**State Stores:**

*   **`clientStore.ts` (Zustand)**: Client data state
    *   `selectedClientId: string | null`: Actieve client ID
    *   `clients: Client[]`: Lijst van alle clients
    *   `currentClientDossier: Dossier | null`: Complete dossier data

*   **`uiStore.ts` (Zustand)**: Globale UI state
    *   `toasts: ToastMessage[]`: Actieve toast notificaties
    *   `onboardingCompleted: boolean`: Onboarding status
    *   `tooltipsSeen: string[]`: Welke tooltips al gezien
    *   `sidebarCollapsed: boolean`: Sidebar state

*   **`buildMetricsStore.ts` (Zustand)**: Build tracking (NIEUW)
    *   `totalHours: number`: Totaal development uren
    *   `totalCosts: number`: Totale kosten (infrastructure + AI)
    *   `weeklyBreakdown: WeekMetrics[]`: Per-week data
    *   `featuresCompleted: number`: Aantal features af

*   **Dataflow Patroon**:
    1.  UI update `selectedClientId` via Zustand action
    2.  Store triggert Supabase query om dossier op te halen
    3.  React componenten die subscribed zijn via `useClientStore()` updaten automatisch

---

## 2) Data‑model (Supabase / PostgreSQL)

### 2.1 Entiteiten

**Bestaande tabellen:**
* **clients** — basisgegevens
* **intake_notes** — TipTap JSON + afgeleide velden
* **problem_profiles** — DSM‑light categorie + severity
* **treatment_plans** — JSONB plan (doelen/interventies/frequentie/meetmomenten), versie/status
* **ai_events** — prompts/completions (telemetrie, debugging)

**Nieuwe tabellen (v1.2):**
* **onboarding_progress** — tracking per user welke stappen gedaan
* **build_metrics** — wekelijkse uren/kosten voor transparantie
* **leads** — contact form submissions van marketing site
* **demo_users** — special demo accounts met read-only access

### 2.2 Relaties (PostgreSQL)

```
clients (id UUID PRIMARY KEY)
├── intake_notes (client_id → clients.id, FK)
├── problem_profiles (client_id → clients.id, FK)
└── treatment_plans (client_id → clients.id, FK)

ai_events (id UUID PRIMARY KEY, client_id + note_id als optionele FKs)

onboarding_progress (user_id → auth.users.id, FK)

build_metrics (id UUID PRIMARY KEY, week_number UNIQUE)

leads (id UUID PRIMARY KEY)

demo_users (id UUID PRIMARY KEY, user_id → auth.users.id, FK)
```

**Row Level Security (RLS)**: Alle tables hebben RLS policies voor auth.users().

### 2.3 Tables (PostgreSQL schema)

> **NB**: Bestaande tables blijven ongewijzigd, nieuwe tables voor v1.2 features.

```typescript
// BESTAANDE TABLES (ongewijzigd)
// clients, intake_notes, problem_profiles, treatment_plans, ai_events
// Zie originele TO voor deze schemas

// NIEUWE TABLES (v1.2)

// onboarding_progress table
interface OnboardingProgress {
  id: string; // UUID
  user_id: string; // FK → auth.users.id
  walkthrough_completed: boolean; // Main walkthrough done
  tooltips_seen: string[]; // Array of tooltip IDs seen
  last_step_completed: string; // Last completed step ID
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

// build_metrics table (voor transparantie)
interface BuildMetrics {
  id: string; // UUID
  week_number: number; // 1-4 (UNIQUE constraint)
  week_start_date: string; // DATE
  week_end_date: string; // DATE
  development_hours: number; // DECIMAL(5,2)
  infrastructure_cost: number; // DECIMAL(8,2) in EUR
  ai_api_cost: number; // DECIMAL(8,2) in EUR
  features_completed: string[]; // TEXT[] array of feature names
  blog_post_url?: string; // TEXT (LinkedIn post link)
  notes?: string; // TEXT (internal notes)
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

// leads table
interface Lead {
  id: string; // UUID
  name: string; // TEXT
  email: string; // TEXT
  company?: string; // TEXT
  message: string; // TEXT
  source: 'landing' | 'build-log' | 'demo' | 'contact'; // TEXT with CHECK
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected'; // TEXT with CHECK
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

// demo_users table
interface DemoUser {
  id: string; // UUID
  user_id: string; // FK → auth.users.id (UNIQUE)
  access_level: 'read_only' | 'interactive'; // TEXT with CHECK
  expires_at?: string; // TIMESTAMPTZ (optional expiry)
  usage_count: number; // INTEGER (track demo usage)
  created_at: string; // TIMESTAMPTZ
}
```

**SQL voorbeelden** voor nieuwe tables:

```sql
-- onboarding_progress
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  walkthrough_completed BOOLEAN DEFAULT FALSE,
  tooltips_seen TEXT[] DEFAULT '{}',
  last_step_completed TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- build_metrics
CREATE TABLE build_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INTEGER UNIQUE CHECK (week_number BETWEEN 1 AND 4),
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  development_hours DECIMAL(5,2) DEFAULT 0,
  infrastructure_cost DECIMAL(8,2) DEFAULT 0,
  ai_api_cost DECIMAL(8,2) DEFAULT 0,
  features_completed TEXT[] DEFAULT '{}',
  blog_post_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  source TEXT CHECK (source IN ('landing', 'build-log', 'demo', 'contact')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- demo_users
CREATE TABLE demo_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  access_level TEXT DEFAULT 'read_only' CHECK (access_level IN ('read_only', 'interactive')),
  expires_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.4 Row Level Security (basis)

**Bestaande RLS policies blijven:** authenticated users voor EPD tables.

**Nieuwe RLS policies:**

```sql
-- onboarding_progress: users can only see/update their own
CREATE POLICY "Users can manage own onboarding" ON onboarding_progress
  FOR ALL USING (auth.uid() = user_id);

-- build_metrics: read-only for all (public transparency)
CREATE POLICY "Anyone can read build metrics" ON build_metrics
  FOR SELECT USING (true);

-- Only service role can insert/update build metrics
CREATE POLICY "Service role can manage metrics" ON build_metrics
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- leads: insert for anonymous, service role can manage
CREATE POLICY "Anyone can submit leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage leads" ON leads
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- demo_users: service role only
CREATE POLICY "Service role manages demo users" ON demo_users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
```

---

## 3) API & Endpoints (Next.js Route Handlers)

### 3.1 CRUD (bestaand, ongewijzigd)

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

### 3.2 AI‑acties (bestaand, ongewijzigd)

* `POST /api/ai/summarize` — TipTap JSON → bullets
* `POST /api/ai/readability` — TipTap JSON → B1
* `POST /api/ai/extract` — TipTap JSON → {category, severity, rationale}
* `POST /api/ai/generate-plan` — {noteId | profile} → plan JSON

### 3.3 Nieuwe Endpoints (v1.2)

**Onboarding:**
* `GET /api/onboarding/progress` — get user onboarding state
* `PATCH /api/onboarding/progress` — update progress (complete step, mark tooltip seen)
* `POST /api/onboarding/reset` — reset walkthrough (for testing)

**Build Metrics:**
* `GET /api/build-metrics` — get all weeks data (public, no auth)
* `GET /api/build-metrics/current` — get current week stats
* `POST /api/build-metrics` — create/update week data (service role only)

**Leads:**
* `POST /api/leads` — submit lead form (no auth required)
* `GET /api/leads` — list all leads (service role only)
* `PATCH /api/leads/:id` — update lead status (service role only)

**Demo Access:**
* `POST /api/demo/create-user` — generate demo credentials
* `GET /api/demo/validate` — check if user is demo user
* `POST /api/demo/track-usage` — increment demo usage counter

**Patroon**: 
- Public endpoints (leads, build metrics GET) → no auth
- User endpoints (onboarding) → auth.uid() check
- Admin endpoints (leads management, metrics POST) → service role check

---

## 4) AI‑integratie (Claude / Anthropic)

### 4.1 Model & API (ongewijzigd)

* **Model**: Claude 3.5 Sonnet (of nieuwere versie) via Anthropic API
* **Regio**: Anthropic API is globally distributed; data blijft binnen EU waar mogelijk
* **SDK**: `@anthropic-ai/sdk` (officiële Node.js SDK)

### 4.2 Prompt‑templates (ongewijzigd)

Zie originele TO § 4.2 voor prompt details (Summarize, Readability, Extract, Plan).

**Parameters (startwaarden):**
- `model`: "claude-3-5-sonnet-20241022" (of nieuwer)
- `temperature`: 0.3 (deterministischer)
- `max_tokens`: passend per taak (samenvat 800‑1200, plan 1600‑2400)

### 4.3 Cost Tracking (NIEUW)

Voor transparantie in de Build in Public serie:

**Implementation:**
```typescript
// lib/ai/cost-tracker.ts
interface AICostTracker {
  trackCompletion(request: AIRequest, response: AIResponse): Promise<void>
  getCurrentWeekCosts(): Promise<number>
  getTotalCosts(): Promise<number>
}

// Na elke AI call:
const cost = calculateCost(response.usage) // based on token count
await db.ai_events.create({
  kind: 'summarize',
  request, response,
  cost_eur: cost,
  duration_ms: elapsed
})

// Aggregate in build_metrics table wekelijks
```

**Cost Calculation:**
- Input tokens: $3 / 1M tokens
- Output tokens: $15 / 1M tokens
- Convert USD → EUR based on current rate
- Store in `ai_events.cost_eur` en aggregate naar `build_metrics.ai_api_cost`

---

## 5) Frontend implementatie

### 5.1 UI‑skelet (aangepast voor dual-site)

**Marketing Layout:**
```
┌─────────────────────────────────────────────────┐
│ Header: Logo | Nav (Build Log, Demo, Contact)  │
├─────────────────────────────────────────────────┤
│                                                 │
│           Main Content Area                     │
│           (full width, no sidebar)              │
│                                                 │
├─────────────────────────────────────────────────┤
│ Footer: Social Links | Cost Counter | CTA      │
└─────────────────────────────────────────────────┘
```

**App Layout (protected):**
```
┌─────────────────────────────────────────────────┐
│ Topbar: Client Context | User Menu | Help      │
├───────────┬─────────────────────────────────────┤
│ Sidebar   │  Main Content Area                  │
│ Nav       │  (Dashboard/Intake/Profile/Plan)    │
│           │                                     │
│ - Clients │                                     │
│ - Dashboard│                                    │
│ - Intake  │                                     │
│ - Profile │                                     │
│ - Plan    │                                     │
├───────────┴─────────────────────────────────────┤
│ Toast Area (bottom right)                       │
└─────────────────────────────────────────────────┘
```

### 5.2 TipTap (ongewijzigd)

Zie originele TO § 5.2 voor TipTap implementatie details.

### 5.3 AI Source Highlighting (ongewijzigd)

Zie originele TO § 5.4 voor highlighting implementatie met TipTap Decorations API.

### 5.4 Onboarding System (NIEUW)

**Architectuur:**

```typescript
// components/onboarding/OnboardingProvider.tsx
export function OnboardingProvider({ children }) {
  const { onboardingCompleted, tooltipsSeen } = useUiStore()
  const { mutate: updateProgress } = useOnboardingMutation()
  
  // Check if should show walkthrough
  useEffect(() => {
    if (!onboardingCompleted && isFirstTimeUser) {
      startWalkthrough()
    }
  }, [])
  
  return (
    <OnboardingContext.Provider value={{ ... }}>
      {children}
      <Joyride
        steps={WALKTHROUGH_STEPS}
        run={showWalkthrough}
        continuous
        showProgress
        showSkipButton
      />
    </OnboardingContext.Provider>
  )
}

// components/onboarding/ContextualTooltip.tsx
export function ContextualTooltip({ 
  id, 
  content, 
  trigger = 'hover',
  showOnFirstUse = true 
}) {
  const { tooltipsSeen, markTooltipSeen } = useUiStore()
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    if (showOnFirstUse && !tooltipsSeen.includes(id)) {
      setIsVisible(true)
    }
  }, [])
  
  const handleDismiss = () => {
    setIsVisible(false)
    markTooltipSeen(id)
  }
  
  return (
    <Tooltip
      open={isVisible}
      content={
        <>
          {content}
          <button onClick={handleDismiss}>Toon niet meer</button>
        </>
      }
    />
  )
}

// components/onboarding/HelpIcon.tsx
export function HelpIcon({ topic }) {
  return (
    <Popover>
      <PopoverTrigger>
        <HelpCircle className="w-4 h-4" />
      </PopoverTrigger>
      <PopoverContent>
        {HELP_CONTENT[topic]}
      </PopoverContent>
    </Popover>
  )
}
```

**Walkthrough Steps:**
```typescript
const WALKTHROUGH_STEPS = [
  {
    target: '.welcome-screen',
    content: 'Welkom bij Mini-ECD! AI bespaart je 50% administratietijd.',
    placement: 'center'
  },
  {
    target: '.new-client-button',
    content: 'Start met een nieuwe cliënt aanmaken.',
    placement: 'bottom'
  },
  {
    target: '.intake-editor',
    content: 'Schrijf je intake hier. Probeer de AI samenvatten knop!',
    placement: 'top'
  },
  {
    target: '.dashboard-tiles',
    content: 'Je dashboard toont alle belangrijke info. Klik op tegels voor details.',
    placement: 'bottom'
  },
  {
    target: '.help-menu',
    content: 'Je bent klaar! Help is altijd beschikbaar via dit menu.',
    placement: 'left'
  }
]
```

**Contextual Tooltips (voorbeelden):**
```typescript
const CONTEXTUAL_TOOLTIPS = {
  'first-ai-summarize': {
    trigger: 'first-use',
    content: 'AI kan je intake samenvatten in 5 seconden. Probeer het!'
  },
  'first-dsm-dropdown': {
    trigger: 'first-use',
    content: 'Laat AI een suggestie doen op basis van de intake'
  },
  'first-plan-publish': {
    trigger: 'first-use',
    content: 'Publiceren maakt het plan definitief en verhoogt versienummer'
  }
}
```

**State Persistence:**
```typescript
// localStorage backup for onboarding state
const ONBOARDING_STORAGE_KEY = 'mini-ecd-onboarding'

interface OnboardingState {
  completed: boolean
  lastStep: string
  tooltipsSeen: string[]
  version: string // voor migratie bij updates
}

// Sync met database maar fallback naar localStorage
```

**Dependencies:**
- `react-joyride`: ^2.5.0 (walkthrough library)
- Custom Tooltip component (shadcn/ui basis)
- Custom HelpIcon component

### 5.5 Marketing Site Components (NIEUW)

**Landing Page (`/app/(marketing)/page.tsx`):**

```typescript
export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <LiveProofSection /> {/* EPD build showcase */}
      <StackShowcase />
      <CTASection />
    </main>
  )
}

// components/marketing/LiveProofSection.tsx
function LiveProofSection() {
  const { data: metrics } = useBuildMetrics()
  
  return (
    <section>
      <h2>Live Bewijs: Van €100k naar €50/mnd</h2>
      <BuildMetricsDisplay metrics={metrics} />
      <ComparisonTable
        traditional={{ time: '24 maanden', cost: '€100k+', team: '5+ devs' }}
        softwareOnDemand={{ time: '4 weken', cost: '€200', team: '1 dev + AI' }}
      />
      <Link href="/build-log">Volg de volledige build →</Link>
    </section>
  )
}

// components/marketing/BuildMetricsDisplay.tsx
function BuildMetricsDisplay({ metrics }) {
  const totalHours = metrics.reduce((sum, w) => sum + w.development_hours, 0)
  const totalCost = metrics.reduce((sum, w) => sum + w.infrastructure_cost + w.ai_api_cost, 0)
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <MetricCard label="Totaal uren" value={totalHours} />
      <MetricCard label="Totale kosten" value={`€${totalCost}`} />
      <MetricCard label="Features" value={metrics.flatMap(w => w.features_completed).length} />
    </div>
  )
}
```

**Build Log (`/app/(marketing)/build-log/page.tsx`):**

```typescript
export default function BuildLogPage() {
  const { data: weeks } = useBuildMetrics()
  
  return (
    <main>
      <header>
        <h1>Build Log: 4 Weken naar Werkend EPD</h1>
        <LiveCounter totalHours={...} totalCost={...} />
      </header>
      
      <Timeline>
        {weeks.map(week => (
          <WeekEntry
            key={week.week_number}
            weekNumber={week.week_number}
            hours={week.development_hours}
            cost={week.infrastructure_cost + week.ai_api_cost}
            features={week.features_completed}
            blogPostUrl={week.blog_post_url}
            notes={week.notes}
          />
        ))}
      </Timeline>
      
      <CTASection />
    </main>
  )
}

// components/marketing/WeekEntry.tsx
function WeekEntry({ weekNumber, hours, cost, features, blogPostUrl, notes }) {
  return (
    <article className="border-l-4 border-primary pl-4">
      <h3>Week {weekNumber}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>{hours}u</strong> development tijd
        </div>
        <div>
          <strong>€{cost}</strong> kosten
        </div>
      </div>
      
      <h4>Features Geleverd:</h4>
      <ul>
        {features.map(f => <li key={f}>{f}</li>)}
      </ul>
      
      {notes && (
        <details>
          <summary>Technische details</summary>
          <Markdown>{notes}</Markdown>
        </details>
      )}
      
      {blogPostUrl && (
        <LinkedInEmbed url={blogPostUrl} />
      )}
    </article>
  )
}
```

**Lead Capture Form:**

```typescript
// components/marketing/LeadCaptureForm.tsx
export function LeadCaptureForm({ source }) {
  const { mutate: submitLead, isLoading } = useLeadMutation()
  
  const handleSubmit = async (data) => {
    await submitLead({
      ...data,
      source, // 'landing' | 'build-log' | 'demo' | 'contact'
    })
    
    // Track conversion
    trackEvent('lead_submitted', { source })
    
    // Redirect to thank you page
    router.push('/thank-you')
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Input name="name" label="Naam" required />
      <Input name="email" label="Email" type="email" required />
      <Input name="company" label="Bedrijf (optioneel)" />
      <Textarea name="message" label="Vertel over je project" required />
      <Button type="submit" loading={isLoading}>
        Start Software on Demand gesprek
      </Button>
    </form>
  )
}
```

### 5.6 Build Metrics Tracking (NIEUW)

**Admin Dashboard voor metrics:**

```typescript
// app/(app)/admin/metrics/page.tsx (protected, admin only)
export default function MetricsAdminPage() {
  const { data: metrics, mutate } = useBuildMetrics()
  const [editMode, setEditMode] = useState(false)
  
  return (
    <main>
      <h1>Build Metrics Management</h1>
      
      {metrics.map(week => (
        <WeekMetricsForm
          key={week.week_number}
          week={week}
          onSave={mutate}
          editable={editMode}
        />
      ))}
      
      <Button onClick={() => setEditMode(!editMode)}>
        {editMode ? 'Save' : 'Edit'}
      </Button>
    </main>
  )
}

// components/admin/WeekMetricsForm.tsx
function WeekMetricsForm({ week, onSave, editable }) {
  return (
    <form>
      <Input
        label="Development Hours"
        type="number"
        step="0.5"
        value={week.development_hours}
        disabled={!editable}
      />
      <Input
        label="Infrastructure Cost (EUR)"
        type="number"
        step="0.01"
        value={week.infrastructure_cost}
        disabled={!editable}
      />
      <Input
        label="AI API Cost (EUR)"
        type="number"
        step="0.01"
        value={week.ai_api_cost}
        disabled={!editable}
      />
      <TagInput
        label="Features Completed"
        value={week.features_completed}
        disabled={!editable}
      />
      <Input
        label="LinkedIn Post URL"
        value={week.blog_post_url}
        disabled={!editable}
      />
      <Textarea
        label="Technical Notes (Markdown)"
        value={week.notes}
        disabled={!editable}
      />
    </form>
  )
}
```

**Public API voor real-time display:**

```typescript
// app/api/build-metrics/route.ts
export async function GET() {
  const metrics = await db.build_metrics
    .select('*')
    .order('week_number', { ascending: true })
  
  const summary = {
    totalHours: sum(metrics.map(w => w.development_hours)),
    totalCost: sum(metrics.map(w => w.infrastructure_cost + w.ai_api_cost)),
    totalFeatures: metrics.flatMap(w => w.features_completed).length,
    currentWeek: getCurrentWeek(),
    weeks: metrics
  }
  
  return NextResponse.json(summary)
}

// Gebruikt door:
// - Landing page live counter
// - Build log timeline
// - Marketing materials
```

### 5.7 Demo Account System (NIEUW)

**Demo credentials generatie:**

```typescript
// app/api/demo/create-user/route.ts
export async function POST() {
  // Generate unique demo user
  const { user, error } = await supabase.auth.signUp({
    email: `demo-${nanoid()}@mini-ecd.demo`,
    password: generateSecurePassword(),
    options: {
      data: {
        role: 'demo_user',
        access_level: 'read_only'
      }
    }
  })
  
  // Create demo_users entry
  await db.demo_users.insert({
    user_id: user.id,
    access_level: 'read_only',
    expires_at: addDays(new Date(), 7) // 7 days access
  })
  
  return NextResponse.json({
    email: user.email,
    password: temporaryPassword,
    expiresAt: ...
  })
}

// Demo user restrictions via RLS + middleware
// - Can view all data
// - Cannot create/edit/delete
// - AI features disabled or limited
```

**Demo usage tracking:**

```typescript
// middleware.ts addition
if (isDemoUser(user)) {
  await db.demo_users
    .update({ usage_count: increment(1) })
    .eq('user_id', user.id)
  
  // Limit to X actions per session
  if (sessionActionCount > DEMO_LIMIT) {
    return redirect('/demo/upgrade')
  }
}
```

---

## 6) Security, Privacy & Compliance (MVP‑proof)

### 6.1 Bestaande maatregelen (ongewijzigd)

* **Data**: uitsluitend fictieve demo‑data; geen echte PII
* **Regio's**: EU‑hosting (Supabase EU: Frankfurt/London; Claude API global)
* **Secret handling**: API keys via Vercel Envs; nooit in client bundelen
* **RLS Policies**: minimaal aan; authenticated users krijgen toegang (demo)
* **Audit (lichtgewicht)**: `ai_events` + timestamps op alle tables
* **CORS**: beperken tot demo‑domain

### 6.2 Nieuwe overwegingen (v1.2)

**Marketing site security:**
* Public routes accessible zonder auth
* Lead form heeft rate limiting (max 5 submissions per IP per hour)
* CSRF protection voor alle form submissions
* Input sanitization voor lead messages

**Demo accounts:**
* Automatic expiry na 7 dagen
* Usage limits (max 50 acties per sessie)
* No data persistence for demo users (reset weekly)
* Separate RLS policies restricting write access

**Build metrics:**
* Public read access OK (transparency is feature)
* Write access only via service role
* No sensitive business data exposed

**Onboarding data:**
* Per-user only (RLS enforced)
* Non-sensitive data (just UI state)
* LocalStorage backup voor offline resilience

---

## 7) Deployment & Environments

### 7.1 Environment variables (aangepast)

```bash
# Supabase (ongewijzigd)
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Claude AI (ongewijzigd)
ANTHROPIC_API_KEY=sk-ant-...

# App (ongewijzigd)
NEXT_PUBLIC_APP_URL=https://mini-ecd.example
NODE_ENV=production

# NEW: Marketing & Analytics
NEXT_PUBLIC_LINKEDIN_TRACKING_ID=xxx (optional)
VERCEL_ANALYTICS_ID=xxx (optional)
CONTACT_EMAIL=colin@ikbenlit.nl
LEAD_NOTIFICATION_WEBHOOK=https://... (optional Slack/Discord webhook)

# NEW: Demo System
DEMO_USER_EXPIRY_DAYS=7
DEMO_USAGE_LIMIT=50
```

### 7.2 Deployment strategie

**Single deployment voor beide sites:**
- Marketing routes (/, /build-log, etc.) statically generated waar mogelijk
- App routes protected via middleware
- API routes server-side only
- Shared components bundle optimization

**Build configuration:**
```javascript
// next.config.js
module.exports = {
  experimental: {
    serverActions: true // voor form submissions
  },
  images: {
    domains: ['avatars.githubusercontent.com'] // voor LinkedIn embeds
  },
  // Marketing pages static waar mogelijk
  generateStaticParams: async () => {
    return [
      { slug: 'build-log' },
      { slug: 'demo' },
      { slug: 'how-it-works' },
      { slug: 'contact' }
    ]
  }
}
```

### 7.3 Performance optimizations

**Marketing site:**
- Static generation voor /build-log pages
- ISR (Incremental Static Regeneration) voor build metrics (revalidate every 1 hour)
- Image optimization voor screenshots/demo video
- Code splitting: marketing bundle separate van app bundle

**App (EPD):**
- Dynamic imports voor heavy components (TipTap, Joyride)
- React.lazy voor modals/drawers
- SWR caching voor client data
- Debounced auto-save (500ms)

---

## 8) Setup stappen (uitgebreid voor v1.2)

1. **Repo & deps**: init Next.js (App Router) + Tailwind + TipTap + Supabase client + Anthropic SDK + react-joyride
2. **Supabase**: 
   - Project aanmaken (EU-regio)
   - Tables uit § 2.3 aanmaken via migrations (bestaand + nieuw)
   - RLS policies activeren (bestaand + nieuw)
   - Seed data voor demo clients
3. **Env**: Vercel + lokale `.env.local` vullen (alle vars uit § 7.1)
4. **Routing setup**:
   - Create route groups (marketing) en (app)
   - Setup layouts voor beide
   - Middleware voor auth protection
5. **Marketing site**:
   - Landing page componenten
   - Build log timeline
   - Lead capture form
   - Build metrics API + display
6. **Onboarding**:
   - OnboardingProvider component
   - Joyride walkthrough steps
   - Contextual tooltips
   - Help icon system
7. **EPD App** (bestaande setup):
   - Clients list/detail
   - Intake editor + AI-rail
   - Profiel form
   - Plan cards
8. **Demo system**:
   - Demo user creation API
   - Usage tracking
   - Read-only RLS policies
9. **Testing**:
   - E2E flows (marketing → app)
   - Onboarding walkthrough
   - Demo account restrictions
   - Build metrics tracking
10. **Smoke test**: Volledige flow A/B/C + marketing site navigatie

---

## 9) Test & Kwaliteit

### 9.1 Bestaande tests (ongewijzigd)

* **Unit**: parsers, validators, AI‑response mappers (Zod schemas)
* **E2E (Playwright)**: Flow A/B/C met seeded data
* **Prompt tests**: vaste inputs → snapshot op kernvelden

### 9.2 Nieuwe test scenarios (v1.2)

**Onboarding flow:**
```typescript
test('First-time user sees walkthrough', async ({ page }) => {
  await page.goto('/clients')
  await expect(page.locator('.joyride-overlay')).toBeVisible()
  await page.click('button:has-text("Volgende")')
  // ... verify all steps
  await page.click('button:has-text("Klaar")')
  await expect(page.locator('.joyride-overlay')).not.toBeVisible()
})

test('Contextual tooltip shows on first AI use', async ({ page }) => {
  // Navigate to intake
  await page.click('.ai-summarize-button')
  await expect(page.locator('[data-tooltip-id="first-ai-summarize"]')).toBeVisible()
  await page.click('button:has-text("Toon niet meer")')
  // Verify it doesn't show again
})
```

**Marketing site:**
```typescript
test('Landing page shows live build metrics', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('text=/Totaal uren: \\d+/')).toBeVisible()
  await expect(page.locator('text=/Totale kosten: €\\d+/')).toBeVisible()
})

test('Lead form submission works', async ({ page }) => {
  await page.goto('/contact')
  await page.fill('input[name="name"]', 'Test Lead')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('textarea[name="message"]', 'Test message')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/thank-you')
})
```

**Demo account:**
```typescript
test('Demo user cannot create new clients', async ({ page }) => {
  await loginAsDemoUser(page)
  await page.goto('/clients')
  await expect(page.locator('button:has-text("+ Nieuwe cliënt")')).toBeDisabled()
})

test('Demo user expires after 7 days', async ({ page }) => {
  // Create demo user with backdated created_at
  const demoUser = await createDemoUser({ daysAgo: 8 })
  await page.goto('/login')
  await page.fill('input[name="email"]', demoUser.email)
  await page.fill('input[name="password"]', demoUser.password)
  await page.click('button[type="submit"]')
  await expect(page.locator('text=/Demo account expired/')).toBeVisible()
})
```

---

## 10) Bekende beperkingen & risico's

### 10.1 Bestaand (ongewijzigd)

* **TipTap** content search: extra index/afgeleide `content_text` nodig
* **Claude API rate limits**: monitor gebruik; overweeg caching
* **Serverless PDF**: kan cold‑start issues geven
* **RLS Policies (demo)**: simplistisch; voor productie per organisatie/rol

### 10.2 Nieuwe risico's (v1.2)

**Marketing site:**
* **SEO crawling**: Vercel's static generation moet correct werken voor indexing
* **LinkedIn embed performance**: Third-party script kan slow zijn → lazy load
* **Lead spam**: Rate limiting + honeypot field needed

**Onboarding:**
* **Joyride conflicts**: Kan botsen met andere modals/tooltips → zorgvuldige z-index management
* **State sync**: LocalStorage en database kunnen out-of-sync raken → reconciliation logic
* **Mobile experience**: Walkthrough mogelijk onoverzichtelijk op kleine schermen → responsive steps

**Build metrics:**
* **Manual data entry errors**: Admin moet correct data invoeren → validation + previews
* **Real-time updates**: ISR cache kan outdated zijn → balance tussen freshness en performance
* **Public transparency**: Moeten comfortable zijn met kosten/tijd delen → is feature, not bug

**Demo accounts:**
* **Abuse potential**: Demo accounts kunnen spammed worden → strikte rate limits + CAPTCHA
* **Data pollution**: Demo users kunnen test data maken → periodic cleanup script
* **Expiry edge cases**: Gebruiker kan mid-sessie expiren → graceful handling

---

## 11) Roadmap na demo

### 11.1 EPD uitbreidingen (ongewijzigd)

* Rollen & rechten, multi‑tenant (org_id) + stricte RLS policies
* Templates per zorgpad (verslag/plan)
* Trendanalyse (meetmomenten) + grafieken
* Integraties (PinkRoccade modules), exportprofielen
* Real-time collaboratie via Supabase Realtime

### 11.2 Marketing & business (NIEUW)

**SEO & Content:**
* Blog systeem voor lange-form content
* Case studies van andere Software on Demand projecten
* Video tutorials en demo's
* Podcast series "Build in Public"

**Conversion optimization:**
* A/B testing op CTAs
* Exit-intent popups met lead magnet
* Live chat voor sales questions
* ROI calculator interactive tool

**Analytics & tracking:**
* Detailed funnel metrics (waar droppen users af)
* Heatmaps op landing pages
* Lead source attribution
* Conversion rate per channel

**Community building:**
* Newsletter voor wekelijkse updates
* Discord/Slack community voor Software on Demand enthusiasts
* Open office hours voor vragen
* Guest posts van andere builders

---

## 12) Appendix: Component Library Overview

### 12.1 Shared Components

```
/components
  /shared
    /ui               # shadcn/ui base components
      /button.tsx
      /input.tsx
      /card.tsx
      /toast.tsx
      /tooltip.tsx
    /layouts
      /AppLayout.tsx      # Protected app layout
      /MarketingLayout.tsx # Public marketing layout
    /navigation
      /Breadcrumb.tsx
      /Sidebar.tsx
      /TopBar.tsx
```

### 12.2 Marketing Components

```
/components
  /marketing
    /HeroSection.tsx
    /ProblemSection.tsx
    /SolutionSection.tsx
    /LiveProofSection.tsx
    /StackShowcase.tsx
    /CTASection.tsx
    /BuildMetricsDisplay.tsx
    /ComparisonTable.tsx
    /WeekEntry.tsx
    /LeadCaptureForm.tsx
    /LinkedInEmbed.tsx
```

### 12.3 App Components

```
/components
  /app
    /clients
      /ClientList.tsx
      /ClientCard.tsx
      /ClientForm.tsx
    /intake
      /IntakeEditor.tsx
      /AIRail.tsx
      /SourceHighlight.tsx
    /profile
      /ProblemProfileForm.tsx
      /AISuggestionPanel.tsx
    /plan
      /TreatmentPlanCards.tsx
      /PlanVersioning.tsx
```

### 12.4 Onboarding Components

```
/components
  /onboarding
    /OnboardingProvider.tsx
    /WalkthroughSteps.tsx
    /ContextualTooltip.tsx
    /HelpIcon.tsx
    /ProgressTracker.tsx
```

---

## 13) Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Marketing Site** |
| First Contentful Paint (FCP) | <1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | <2.5s | Lighthouse |
| Time to Interactive (TTI) | <3.5s | Lighthouse |
| Cumulative Layout Shift (CLS) | <0.1 | Lighthouse |
| **App (EPD)** |
| Initial Load | <3s | Custom timing |
| Route Navigation | <500ms | Custom timing |
| AI Summarize | <5s | Custom timing |
| AI Extract | <5s | Custom timing |
| AI Plan Generate | <8s | Custom timing |
| Auto-save | <1s | Custom timing |
| **API** |
| CRUD Operations | <200ms | Server logs |
| AI Endpoints | <8s | Server logs |
| Build Metrics GET | <100ms | Server logs |

---

## 14) Technische Debt Register

**Items om na MVP aan te pakken:**

1. **Authentication**: Huidige setup is basic (email/password), upgrade naar OAuth providers (Google, LinkedIn)
2. **Error boundaries**: Ontbreken op route-level, alleen app-wide → add per feature
3. **Optimistic updates**: Alleen voor auto-save, niet voor alle mutations → consistentere UX
4. **Image optimization**: Marketing site gebruikt mogelijk grote images → WebP conversie + responsive
5. **Accessibility audit**: Basis WCAG AA, maar niet full audit → comprehensive test
6. **i18n**: Currently NL-only, internationalization structure ontbreekt → prepare for EN version
7. **Monitoring**: Geen structured logging yet → add Sentry/LogRocket voor production
8. **Rate limiting**: Basic op form submissions, niet comprehensive → add per-user limits
9. **Email templates**: Lead notifications zijn plain text → branded HTML templates
10. **Demo cleanup**: Manual process, needs automated cron job → weekly data wipe

---

**Versiehistorie:**

| Versie | Datum | Wijzigingen |
|--------|-------|-------------|
| v1.0 | aug 2025 | Initiële versie |
| v1.1 | aug 2025 | State management details toegevoegd |
| v1.2 | nov 2025 | Marketing website, onboarding system, build metrics tracking, demo accounts toegevoegd |

---

**Einde Technisch Ontwerp v1.2**
