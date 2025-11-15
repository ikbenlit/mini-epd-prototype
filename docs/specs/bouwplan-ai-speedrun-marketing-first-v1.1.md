# 🚀 Mission Control – Bouwplan AI Speedrun / Mini-ECD

🎯 **Projectnaam:** AI Speedrun - Mini-ECD Prototype  
**Versie:** v1.1 (Actueel)  
**Datum:** 15-11-2024  
**Auteur:** Colin van der Heijden (AI Speedrun / ikbenlit.nl)  
**Laatste Update:** 15-11-2024

---

## 1. Doel en context

🎯 **Doel:** Een werkend EPD-prototype bouwen in 4 weken dat demonstreert hoe "Software on Demand" traditionele ontwikkeling disrupts: van €100.000+ en 12-24 maanden naar €200 build cost en 4 weken doorlooptijd.

📘 **Toelichting:** Dit project dient een drievoudig doel:
1. **Demo voor GGZ-sector:** Tonen van AI-waarde in EPD-workflows (intake → profiel → plan) tijdens inspiratiesessies
2. **LinkedIn Build in Public:** Wekelijkse transparante updates die viral marketing genereren voor AI consultancy
3. **Software on Demand Proof:** Bewijs dat enterprise-kwaliteit software nu in weken ipv jaren gebouwd kan worden

Het systeem toont praktische AI-integratie: intake samenvattingen in seconden ipv uren, automatische DSM-classificatie, en behandelplannen die direct bruikbaar zijn. Alles met fictieve demo-data, privacy-first design.

---

## 2. Uitgangspunten

### 2.1 Technische Stack
🎯 **Doel:** Modern, bewezen technologie stack voor snelle development en lage run costs.

**Frontend:**
- **Framework:** Next.js 15 (App Router) - Single repo voor marketing + EPD
- **Styling:** Tailwind CSS v3.4 (fallback van v4 bij problemen)
- **UI Components:** shadcn/ui voor snelheid + consistentie
- **Rich Text:** TipTap editor (ProseMirror basis)
- **Icons:** Lucide React
- **State:** Zustand + React Context (simpel maar effectief)

**Backend:**
- **API:** Next.js Route Handlers (server-side)
- **Database:** Supabase (PostgreSQL + Auth + Storage) - EU region
- **AI:** Claude 3.5 Sonnet (Anthropic) - Superieur voor Nederlands
- **Hosting:** Vercel (EU region Amsterdam)

**Development & Tools:**
- **Version Control:** GitHub (public repo voor transparantie)
- **Type Safety:** TypeScript overal
- **Package Manager:** pnpm (sneller dan npm)
- **AI Pair Programming:** Cursor IDE
- **Testing:** Vitest + Playwright (basis coverage)

### 2.2 Projectkaders
🎯 **Doel:** Realistische constraints voor 4-weken sprint.

- **Tijd:** 4 weken part-time (80-120 uur totaal)
- **Budget:** €200 totaal (€50/maand runtime target)
- **Team:** 1 developer (Colin) + AI tools als co-pilot
- **Data:** 100% fictieve demo data
- **Scope:** MVP voor 10-min demo + marketing site
- **Launch:** LinkedIn viral series + demo sessies

### 2.3 Programmeer Uitgangspunten
🎯 **Doel:** Code quality zonder over-engineering voor MVP.

**Core Principles:**
- **DRY:** Herbruikbare componenten, centrale configs
- **KISS:** Simpele oplossingen boven complexiteit
- **SOC:** UI/logic/data layers gescheiden
- **YAGNI:** Alleen bouwen wat nu nodig is

**Development Practices:**
- **Iteratief:** Ship daily, perfect later
- **AI-First:** Laat Claude/Cursor heavy lifting doen
- **Copy-Paste OK:** Voor MVP snelheid > perfectie
- **Error Handling:** User-friendly messages overal
- **Security:** API keys server-side, RLS in Supabase

---

## 3. Epics & Stories Overzicht

🎯 **Doel:** 8 duidelijke epics voor 4-weken development sprint - **Marketing First Strategy**.

| Epic ID | Titel | Doel | Status | Story Count | Week |
|---------|-------|------|--------|-------------|------|
| **WEEK 1 - FOUNDATION & MARKETING** |||||
| E0 | Project Setup | Next.js + Supabase + Vercel running | 🔄 In Progress (60%) | 5 | 1 |
| E1 | Marketing Website | Landing + build log + lead capture | ⏳ To Do | 6 | 1 |
| **WEEK 2 - EPD CORE** |||||
| E2 | Database & Auth | Schema + RLS + demo users | ⏳ To Do | 4 | 2 |
| E3 | Core UI & Client Module | Layout + Client CRUD + Navigation | ⏳ To Do | 5 | 2 |
| **WEEK 3 - AI MAGIC** |||||
| E4 | Intake & AI Integration | TipTap + Claude API + Prompts | ⏳ To Do | 6 | 3 |
| E5 | Profile & Plan | DSM + behandelplan flows | ⏳ To Do | 4 | 3 |
| **WEEK 4 - POLISH & LAUNCH** |||||
| E6 | Onboarding System | Walkthrough + tooltips + help | ⏳ To Do | 4 | 4 |
| E7 | Performance & Launch | Optimization + demo prep | ⏳ To Do | 4 | 4 |

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 – Project Setup 🔄
**Epic Doel:** Development environment volledig operationeel.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E0.S1 | Next.js 15 project init | App Router, TypeScript, dev server draait | ✅ Af | 2 |
| E0.S2 | Tailwind + shadcn setup | Custom theme, componenten installeren | 🔄 Gedeeltelijk | 3 |
| E0.S3 | Supabase project aanmaken | EU region, connection string werkend | ✅ Af | 2 |
| E0.S4 | GitHub repo + Vercel deploy | Auto-deploy on push, preview URLs | ✅ Af | 2 |
| E0.S5 | Environment variables | .env.local + Vercel secrets configured | ✅ Af | 1 |

**Technical Notes:**
- Supabase project ID: `dqugbrpwtisgyxscpefg`
- Deploy URL: `https://aispeedrun.vercel.app`
- Package manager: `pnpm` voor snelheid

**Implementation Status:**
- ✅ Next.js 15 + TypeScript initialized
- ✅ Tailwind CSS v3.4 + PostCSS configured
- ⏳ shadcn/ui: basis setup gedaan, componenten nog niet geinstaleerd
- ✅ Supabase clients (server + client) aangemaakt
- ⏳ Migrations folder aangemaakt, nog geen database schema
- ✅ Environment variables geconfigureerd

---

### Epic 1 – Marketing Website ⏳
**Epic Doel:** Public facing website voor Software on Demand story - WEEK 1 PRIORITY.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E1.S1 | Landing page hero | Comparison table, live counter, CTAs | ⏳ To Do | 5 |
| E1.S2 | Build metrics backend | Supabase table, API endpoint, tracking | ⏳ To Do | 3 |
| E1.S3 | Build log timeline | Week entries, expandable sections | ⏳ To Do | 3 |
| E1.S4 | ROI calculator | Interactive inputs, real-time calculation | ⏳ To Do | 3 |
| E1.S5 | Contact form + leads | Form validation, Supabase storage | ⏳ To Do | 2 |
| E1.S6 | Demo info page | Credentials, video embed, feature comparison | ⏳ To Do | 2 |

**Content Strategy Week 1:**
- **Day 1-2:** Landing page live → LinkedIn post "Building in public starts NOW"
- **Day 3-4:** Build log structure → LinkedIn post "Transparantie: alle uren en kosten"
- **Day 5-6:** ROI calculator → LinkedIn post "Bereken zelf: €100k vs €200"
- **Day 7:** Week 1 retrospective → LinkedIn post "Week 1: Marketing site in 30 uur"

**Implementation Details:**
```typescript
// Route structure (nog aanmaken)
/app
  /(marketing)
    /page.tsx              // Landing page
    /build-log/page.tsx    // Timeline
    /demo/page.tsx         // Demo info
    /how-it-works/page.tsx // Explainer + ROI
    /contact/page.tsx      // Lead capture
```

**Current Status:**
- ⏳ Standaard Next.js homepage nog in plaats
- ⏳ Geen marketing routes aangemaakt
- ⏳ Geen database tables voor build_metrics en leads

**Next Steps:**
1. Standaard homepage vervangen met Landing page
2. Marketing routes structure opzetten
3. Hero section component bouwen
4. Database schema aanmaken voor build_metrics

---

### Epic 2 – Database & Auth
**Epic Doel:** Complete database schema met auth en demo data - WEEK 2 START.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E2.S1 | Database schema creëren | 5 tables volgens TO, migrations | ⏳ To Do | 5 |
| E2.S2 | RLS policies implementeren | Secure by default, auth.uid() checks | ⏳ To Do | 3 |
| E2.S3 | Demo auth flow | Magic link login, demo users | ⏳ To Do | 3 |
| E2.S4 | Seed data script | 3+ clients met complete dossiers | ⏳ To Do | 2 |

**Database Tables:**
```sql
- clients (id, first_name, last_name, birth_date, client_id)
- intake_notes (id, client_id, content_json, content_text, ai_summary)
- problem_profiles (id, client_id, category, severity, rationale)
- treatment_plans (id, client_id, version, status, plan_json)
- ai_events (id, kind, request, response, duration_ms, cost_cents)
```

**Current Status:**
- ⏳ Supabase migrations folder leeg
- ⏳ Geen SQL schema aangemaakt
- ⏳ Geen RLS policies

---

### Epic 3 – Core UI & Client Module
**Epic Doel:** Responsive layout met client management - WEEK 2 PARALLEL.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E3.S1 | Layout skeleton | Topbar + sidebar + main content area | ⏳ To Do | 3 |
| E3.S2 | Navigation routing | /clients, /clients/[id] werkend | ⏳ To Do | 2 |
| E3.S3 | Client list view | Search, filter, pagination | ⏳ To Do | 3 |
| E3.S4 | Create client flow | Form validation, auto client-ID | ⏳ To Do | 2 |
| E3.S5 | Responsive design | Mobile + tablet + desktop perfect | ⏳ To Do | 3 |

**UX Principles:**
- Primary color: `#22C55E` (green-500)
- Mobile-first approach
- Keyboard shortcuts support

---

### Epic 4 – Intake & AI Integration 🎯
**Epic Doel:** TipTap editor met Claude AI volledig werkend - WEEK 3 FOCUS.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E4.S1 | TipTap editor setup | Rich text, auto-save, formatting | ⏳ To Do | 5 |
| E4.S2 | Claude API setup | Server-side calls, error handling | ⏳ To Do | 3 |
| E4.S3 | Intake summarization | 5-8 bullets, source highlighting | ⏳ To Do | 5 |
| E4.S4 | Problem extraction | DSM categories, severity scoring | ⏳ To Do | 5 |
| E4.S5 | B1 readability rewrite | Simplify language on demand | ⏳ To Do | 3 |
| E4.S6 | Cost tracking | Log tokens, estimate costs | ⏳ To Do | 2 |

**Prompt Engineering Week 3:**
```typescript
const SUMMARIZE_PROMPT = `
Vat het intakeverslag samen in 5-8 bullets.
Focus op: hoofdklacht, triggers, impact, context.
Schrijf neutraal, professioneel, Nederlands B1.
`;

const EXTRACT_PROMPT = `
Analyseer de intake en bepaal:
1. DSM-light categorie
2. Severity (laag, middel, hoog)
3. Rationale (2-3 zinnen)
`;
```

---

### Epic 5 – Profile & Treatment Plan
**Epic Doel:** Complete workflow van intake naar behandelplan - WEEK 3 COMPLETION.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E5.S1 | Problem profile UI | DSM cards, severity badges | ⏳ To Do | 3 |
| E5.S2 | Manual profile editing | Override AI suggestions | ⏳ To Do | 2 |
| E5.S3 | Treatment plan UI | Goals, interventions, timeline | ⏳ To Do | 3 |
| E5.S4 | Publish workflow | Concept → Published states | ⏳ To Do | 2 |

**DSM-Light Categories:**
- Stemming/Depressie
- Angst
- Gedrag/Impuls
- Middelen
- Cognitief
- Context/Psychosociaal

---

### Epic 6 – Onboarding System
**Epic Doel:** Modern onboarding experience - WEEK 4 UX FOCUS.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E6.S1 | Onboarding walkthrough | 5 steps, 3 minutes, react-joyride | ⏳ To Do | 5 |
| E6.S2 | Context tooltips | First-use hints, dismissable | ⏳ To Do | 3 |
| E6.S3 | Help icons system | On-demand help panels | ⏳ To Do | 2 |
| E6.S4 | Progress tracking | LocalStorage + Supabase sync | ⏳ To Do | 2 |

**Onboarding Features:**
- Welcome modal met skip optie
- Contextual tooltips bij eerste gebruik
- Help iconen op complexe features
- Progress tracking in localStorage

---

### Epic 7 – Performance & Launch
**Epic Doel:** Production ready met perfecte demo - WEEK 4 FINALE.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E7.S1 | Performance optimization | <3s loads, code splitting, lazy loading | ⏳ To Do | 3 |
| E7.S2 | Mobile responsive check | All screens perfect on mobile | ⏳ To Do | 2 |
| E7.S3 | Demo dry-run | Full 10-min demo zonder issues | ⏳ To Do | 2 |
| E7.S4 | Production deployment | Environment vars, monitoring setup | ⏳ To Do | 2 |

**Launch Checklist Week 4:**
- [ ] Performance audit (Lighthouse > 90)
- [ ] Mobile responsive check
- [ ] Demo script finalized
- [ ] LinkedIn announcement post ready

---

## 5. Kwaliteit & Testplan

🎯 **Doel:** MVP kwaliteit met focus op demo-stabiliteit.

### Test Strategy
| Type | Coverage | Priority | Tools |
|------|----------|----------|-------|
| Unit Tests | Business logic (80%) | Medium | Vitest |
| Integration | API endpoints | High | Supertest |
| E2E Tests | Happy paths | Critical | Playwright |
| Manual | Complete demo flow | Critical | Checklist |

### Demo Checklist
- [ ] Login werkt foutloos
- [ ] Client aanmaken < 10 seconden
- [ ] AI samenvatting < 5 seconden
- [ ] Behandelplan generatie < 10 seconden
- [ ] Alle UI elementen responsive
- [ ] Geen console errors
- [ ] Performance > 90 Lighthouse

---

## 6. Demo & Presentatieplan

🎯 **Doel:** Perfecte 10-minuten demo voor meerdere doelgroepen.

### Demo Scenario's

**A. GGZ Professional Demo (10 min)**
1. **Intro** (1 min): "Van 30 min documentatie naar 3 minuten"
2. **Live intake** (2 min): TipTap editor, real-time typing
3. **AI magic** (4 min): Samenvatting → Profiel → Plan
4. **ROI pitch** (2 min): Tijdsbesparing calculator
5. **Q&A** (1 min): "Hoe past dit in jullie workflow?"

**B. LinkedIn Audience Demo (5 min)**
1. **Problem** (30s): "Enterprise software is broken"
2. **Solution** (30s): "Software on Demand"
3. **Speed run** (2 min): Week 1-4 highlights
4. **Live product** (1 min): Quick tour
5. **CTA** (1 min): "Build YOUR software in 4 weeks"

**C. Tech Consultancy Pitch (15 min)**
1. **Market opportunity** (3 min): SaaS disruption
2. **Technical deep-dive** (5 min): Architecture choices
3. **Cost breakdown** (3 min): TCO analysis
4. **Case study** (3 min): EPD build metrics
5. **Partnership model** (1 min): White-label options

### Backup Plans
- **Plan A:** Live on aispeedrun.nl
- **Plan B:** Local development server
- **Plan C:** Recorded video (Loom)
- **Plan D:** Screenshots deck

---

## 6.5 Week 1: Marketing Website Implementation Guide

🎯 **Doel:** Marketing site live in 30 uur met directe LinkedIn content generatie.

### Day 1-2: Landing Page Foundation
**Focus:** Hero section + comparison table werkend

```typescript
// app/(marketing)/page.tsx
export default function LandingPage() {
  return (
    <main>
      <HeroSection />        // "Software on Demand" pitch
      <ComparisonTable />    // Traditional vs AI Speedrun
      <ProblemSection />     // Why enterprise software fails
      <SolutionSection />    // How we fix it
      <LiveProofSection />   // Real-time metrics
      <CTASection />        // Lead capture
    </main>
  )
}
```

**Key Components Day 1:**
- `HeroSection`: Animated counter, gradient background
- `ComparisonTable`: Responsive table met visual contrast
- `LiveMetricsDisplay`: Hardcoded initially, database later

**LinkedIn Post Day 1:**
"🚀 Building a €100k EPD for €200. Day 1: Marketing site live. 
Traditional: 6 months planning. Us: 6 hours coding.
Follow along: [link]"

### Day 3-4: Build Log & Metrics
**Focus:** Transparantie dashboard + build tracking

```typescript
// Database schema for metrics
create table build_metrics (
  week_number int unique,
  development_hours decimal,
  infrastructure_cost decimal,
  ai_api_cost decimal,
  features_completed text[],
  blog_post_url text
);

// API endpoint
app/api/build-metrics/route.ts
```

**LinkedIn Post Day 3:**
"📊 Radical transparency: Every hour tracked, every euro counted.
Week 1: 12 hours, €35 costs so far.
Check our build log: [link]"

### Day 5-6: ROI Calculator & Lead Capture
**Focus:** Interactive calculator + contact form

```typescript
// components/marketing/ROICalculator.tsx
export function ROICalculator() {
  const [hours, setHours] = useState(10)
  const [rate, setRate] = useState(75)
  const [users, setUsers] = useState(5)
  
  const savings = hours * 4 * rate * users
  const breakEven = 200 / (savings - 50)
  
  return (
    // Interactive sliders + real-time calculation
  )
}
```

**LinkedIn Post Day 5:**
"💰 Calculate YOUR savings: Our ROI calculator is live.
Average result: 5400% ROI in year 1.
Try it: [link]"

### Day 7: Week 1 Retrospective
**Focus:** Polish + performance + retrospective post

**Checklist:**
- [ ] Lighthouse score > 90
- [ ] Mobile responsive perfect
- [ ] Form submissions working
- [ ] Analytics tracking active
- [ ] Week 1 metrics in database

**LinkedIn Post Day 7:**
"✅ Week 1 complete: Marketing site from 0 to production.
- 30 hours development
- €50 total costs  
- 5 leads already
Next week: Building the actual EPD. Who's watching? 👀"

### Technical Deliverables Week 1:
1. **Routes Created:**
   - `/` - Landing page
   - `/build-log` - Timeline view
   - `/demo` - Demo information
   - `/how-it-works` - Explainer + ROI
   - `/contact` - Lead form

2. **Database Tables:**
   - `build_metrics` - Week tracking
   - `leads` - Form submissions

3. **Components Library:**
   - Marketing layout wrapper
   - Metric cards
   - Timeline entry
   - ROI calculator
   - Lead capture form

4. **Content Created:**
   - 4 LinkedIn posts
   - Landing page copy
   - Demo video script
   - Email templates

---

## 7. Risico's & Mitigatie

🎯 **Doel:** Proactief risicomanagement voor succesvolle launch.

| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| **TipTap complexiteit** | Hoog | Hoog | Start basic, incrementeel uitbreiden | Colin |
| **Claude API kosten** | Medium | Medium | Caching layer, response limits | Colin |
| **Vercel build limiet** | Laag | Hoog | Optimize bundle, lazy loading | Colin |
| **Demo timing (>10 min)** | Medium | Medium | Oefen 10x, timer visible | Colin |
| **LinkedIn algorithm change** | Laag | Medium | Multi-channel: Twitter/email | Colin |
| **Supabase RLS bugs** | Medium | Hoog | Extensive testing, fallback auth | Colin |
| **AI output inconsistent** | Hoog | Medium | Prompt versioning, examples | Colin |
| **Scope creep** | Hoog | High | Strict MVP focus, "Phase 2" list | Colin |

**Mitigatie Strategie:**
- Daily commits (ship small)
- Weekly LinkedIn updates (build momentum)
- Feature flags (disable broken features)
- Public repo (community help)

---

## 8. Evaluatie & Lessons Learned

🎯 **Doel:** Continue verbetering en kennisdeling.

### Week 1 Review (Te documenteren)
- [ ] Setup sneller/langzamer dan verwacht?
- [ ] Supabase vs Firebase trade-offs?
- [ ] shadcn/ui productivity boost?

### Week 2 Review
- [ ] TipTap learning curve?
- [ ] Client module complexiteit?
- [ ] UI/UX feedback van early testers?

### Week 3 Review
- [ ] Claude API betrouwbaarheid?
- [ ] Prompt engineering iterations?
- [ ] Performance bottlenecks?

### Week 4 Review
- [ ] Marketing site conversie?
- [ ] Demo feedback?
- [ ] Total hours vs estimate?

### Post-Launch Metrics
- **Development:** ___ uur totaal (target: 80-120)
- **Costs:** €___ totaal (target: <€200)
- **LinkedIn:** ___ followers gained
- **Leads:** ___ Software on Demand inquiries
- **Demo's:** ___ uitgevoerd
- **Media:** ___ mentions/articles

---

## 9. Referenties

🎯 **Doel:** Alle projectdocumentatie op één plek.

### Mission Control Documents
- **PRD v1.2** – Product Requirements (Business & Marketing)
- **FO v2.0** – Functioneel Ontwerp (Flows & Features)
- **TO v1.2** – Technisch Ontwerp (Architecture & Database)
- **UX Stylesheet** – Design System & Components
- **API Access** – Endpoints & Authentication

### Project Resources
- **Repository:** `github.com/colinvanderheijden/aispeedrun`
- **Production:** `https://aispeedrun.nl`
- **Staging:** `https://aispeedrun-staging.vercel.app`
- **Supabase:** `app.supabase.com/project/dqugbrpwtisgyxscpefg`
- **LinkedIn Series:** `linkedin.com/in/colinvanderheijden`

### External Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Claude API](https://docs.anthropic.com)
- [TipTap Editor](https://tiptap.dev)
- [Vercel Docs](https://vercel.com/docs)

---

## 10. Glossary & Abbreviations

| Term | Betekenis |
|------|-----------|
| **EPD** | Elektronisch Patiënten Dossier |
| **ECD** | Elektronisch Cliënten Dossier |
| **DSM** | Diagnostic and Statistical Manual |
| **GGZ** | Geestelijke Gezondheidszorg |
| **SMART** | Specifiek, Meetbaar, Acceptabel, Realistisch, Tijdgebonden |
| **RLS** | Row Level Security (Supabase) |
| **ISR** | Incremental Static Regeneration |
| **CTA** | Call To Action |
| **TCO** | Total Cost of Ownership |
| **MVP** | Minimum Viable Product |
| **B1** | Taal niveau (intermediate Dutch) |

---

## 11. Voortgang Samenvatting

### Huidige Status (15-11-2024)
- **Algemeen:** Project geïnitieerd, 10% compleet
- **Epic 0 (Project Setup):** 60% compleet - Basis infrastructure klaar, migrations nog leeg
- **Epic 1-7:** 0% compleet - Nog niet begonnen

### Voltooide Items
- ✅ Next.js 15 project initialized met App Router
- ✅ Tailwind CSS v3.4 + PostCSS configured
- ✅ Supabase project aangemaakt (dqugbrpwtisgyxscpefg)
- ✅ Supabase clients (server & browser) aangemaakt
- ✅ Environment variables setup
- ✅ GitHub repo initialized
- ✅ Vercel connected

### Lopende Werk
- 🔄 shadcn/ui setup completen
- 🔄 Database schema finaliseren

### Volgende Prioriteiten (Week 1)
1. ⏳ Standaard Next.js homepage vervangen
2. ⏳ Marketing routes setup
3. ⏳ Landing page hero section bouwen
4. ⏳ Database schema implementeren
5. ⏳ Supabase tables aanmaken met migrations

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 15-11-2024 | Colin | Initiële versie op basis van PRD v1.2 + FO v2.0 + TO v1.2 |
| v1.1 | 15-11-2024 | Colin | Actualisering met huidige implementatiestatus en voortgang |
