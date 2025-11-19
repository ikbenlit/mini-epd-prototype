# 🚀 Mission Control – Bouwplan AI Speedrun EPD v2.1

**Projectnaam:** AI Speedrun - Mini-EPD Prototype  
**Versie:** v2.1 (Vereenvoudigde User Journey + Teal Design System)  
**Datum:** 17-11-2024  
**Auteur:** Colin Lit  
**Laatste Update:** 17-11-2024

---

## 1. Doel en context

🎯 **Doel:** Een werkend EPD-prototype bouwen in 4 weken dat demonstreert hoe "Software on Demand" traditionele ontwikkeling disrupts: van €100.000+ en 12-24 maanden naar €200 build cost en 4 weken doorlooptijd.

📘 **Toelichting:** Dit project dient een drievoudig doel:
1. **Demo voor GGZ-sector:** Tonen van AI-waarde in EPD-workflows (intake → profiel → plan) tijdens inspiratiesessies
2. **LinkedIn Build in Public:** Wekelijkse transparante updates die viral marketing genereren voor AI consultancy
3. **Software on Demand Proof:** Bewijs dat enterprise-kwaliteit software nu in weken ipv jaren gebouwd kan worden

**Nieuwe Strategie (v2.1):**
- **Vereenvoudigde user journey:** Geen separate EPD demo pagina meer
- **Features in timeline:** Build-in-public transparantie met features showcase per week
- **Login met features:** Directe showcase van EPD capabilities op login pagina
- **Teal-first design:** Modern, innovatief brand identity (#0D9488)

Het systeem toont praktische AI-integratie: intake samenvattingen in seconden ipv uren, automatische DSM-classificatie, en behandelplannen die direct bruikbaar zijn. Alles met fictieve demo-data, privacy-first design.

**Referenties:**
- **FO v2.1:** `docs/specs/fo-marketing-app-flow-v2.md` - Vereenvoudigde user journey
- **UX Plan v2.0:** `docs/specs/ux-implementation-plan-v2.md` - Teal-first design system

---

## 2. Uitgangspunten

### 2.1 Technische Stack

🎯 **Doel:** Modern, bewezen technologie stack voor snelle development en lage run costs.

**Frontend:**
- **Framework:** Next.js 15 (App Router) - Single repo voor marketing + EPD
- **Styling:** Tailwind CSS v3.4 met teal-first design system
- **UI Components:** shadcn/ui + custom components (Timeline, AIButton)
- **Rich Text:** TipTap editor (ProseMirror basis) - Week 3
- **Icons:** Lucide React
- **Animations:** Framer Motion (voor timeline scroll effects)
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

**Design System:**
- **Primary Color:** Teal (#0D9488 / teal-600) - Innovation signal
- **AI Color:** Amber (#F59E0B / amber-500) - AI actions
- **Neutral:** Slate scale voor professional foundation
- **Typography:** Crimson Text (serif) + Inter (sans) + JetBrains Mono

---

## 3. Epics & Stories Overzicht

🎯 **Doel:** 8 duidelijke epics voor 4-weken development sprint - **Marketing First Strategy met vereenvoudigde user journey**.

| Epic ID | Titel | Doel | Status | Story Count | Week |
|---------|-------|------|--------|-------------|------|
| **WEEK 1 - FOUNDATION & MARKETING REFACTOR** |||||
| E0 | Project Setup | Next.js + Supabase + Vercel running | ✅ Compleet | 5 | 1 |
| E1 | Marketing Website Refactor | Homepage met timeline + login met features | 🔄 In Progress | 7 | 1 |
| E2 | Design System Migration | Teal-first colors + component updates | ✅ Compleet | 5 | 1 |
| **WEEK 2 - EPD CORE** |||||
| E3 | Database & Auth | Schema + RLS + demo users | ✅ Compleet | 4 | 2 |
| E4 | Core UI & Client Module | Layout + Client CRUD + Navigation | ⏳ To Do | 5 | 2 |
| **WEEK 3 - AI MAGIC** |||||
| E5 | Intake & AI Integration | TipTap + Claude API + Prompts | ⏳ To Do | 6 | 3 |
| E6 | Profile & Plan | DSM + behandelplan flows | ⏳ To Do | 4 | 3 |
| **WEEK 4 - POLISH & LAUNCH** |||||
| E7 | Onboarding System | Walkthrough + tooltips + help | ⏳ To Do | 4 | 4 |
| E8 | Performance & Launch | Optimization + demo prep | ⏳ To Do | 4 | 4 |

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 — Project Setup

**Epic Doel:** Werkende development omgeving met alle benodigde tools en dependencies.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E0.S1 | Repository aanmaken | GitHub repo + lokale clone, `.gitignore` config | ✅ | — | 1 |
| E0.S2 | Next.js project initialisatie | Next.js 15 App Router draait, dev server start | ✅ | E0.S1 | 2 |
| E0.S3 | Supabase setup | Project aangemaakt, database connected, Auth enabled | ✅ | E0.S2 | 3 |
| E0.S4 | Dependencies installeren | Tailwind, shadcn/ui, Framer Motion, Lucide geïnstalleerd | ✅ | E0.S2 | 2 |
| E0.S5 | Environment variables | `.env.local` + Vercel vars geconfigureerd | ✅ | E0.S3 | 1 |

**Technical Notes:**
- Gebruik `pnpm` voor snellere installs
- `.env.example` committen voor team onboarding
- Supabase project in EU region (Amsterdam)

---

### Epic 1 — Marketing Website Refactor

**Epic Doel:** Vereenvoudigde marketing homepage met timeline (features showcase) en login pagina met features.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E1.S1 | Verwijder EPD demo pagina | `/epd` route verwijderd, navigation updated | ⏳ | E0.S5 | 1 |
| E1.S2 | Homepage vereenvoudigen | Manifesto content verwijderd, statement section toegevoegd | ⏳ | E1.S1 | 3 |
| E1.S3 | Timeline component integreren | Aceternity timeline met features per week | ⏳ | E1.S2 | 5 |
| E1.S4 | Timeline content structuur | `content/nl/timeline.json` met features array | ⏳ | E1.S3 | 2 |
| E1.S5 | Login pagina refactor | Split-screen layout: features links, login rechts | ⏳ | E1.S1 | 4 |
| E1.S6 | Features showcase component | Herbruikbare feature cards voor timeline + login | ⏳ | E1.S3, E1.S5 | 3 |
| E1.S7 | CTA updates | Homepage CTA naar `/login`, navigation cleanup | ⏳ | E1.S2, E1.S5 | 1 |

**Technical Notes:**
- Timeline component: `components/ui/timeline.tsx` (Aceternity UI pattern)
- Features data: `content/nl/timeline.json` (met features array per week)
- Login layout: Inspiratie van `components/ui/sign-in.tsx`
- Mobile: Stack layout voor login pagina (features boven, form onder)

**Content Structure:**
```json
// content/nl/timeline.json
{
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Week 1 • Nov 11-17",
      "status": "completed",
      "description": "...",
      "features": [
        {
          "title": "AI-Gestuurde Intake",
          "description": "...",
          "time": "< 5 seconden",
          "traditional": "15-20 minuten handmatig",
          "icon": "Brain"
        }
      ],
      "metrics": { ... },
      "achievements": [ ... ]
    }
  ]
}
```

---

### Epic 2 — Design System Migration

**Epic Doel:** Teal-first design system implementeren (migratie van blue naar teal).

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E2.S1 | Tailwind config update | Teal brand colors, amber AI colors | ✅ | E0.S4 | 2 |
| E2.S2 | Global CSS variables | `--primary`, `--info` naar teal | ✅ | E2.S1 | 1 |
| E2.S3 | Component color updates | Buttons, links, navigation naar teal | ✅ | E2.S2 | 3 |
| E2.S4 | AIButton component | Amber gradient button voor AI actions | ✅ | E2.S1 | 2 |
| E2.S5 | Contrast testing | WCAG AA compliance voor teal colors | ✅ | E2.S3 | 1 |

**Technical Notes:**
- Primary: `teal-700` (#0F766E) - **5.47:1 contrast op white (WCAG AA compliant)**
- AI actions: `amber-600` (#D97706) gradient → `amber-700` (#B45309)
- Test contrast: Automated script `scripts/test-contrast.ts`
- WCAG compliance: 7/11 AA Normal (4.5:1), 11/11 AA Large (3:1) ✅
- Documentation: `docs/design/wcag-compliance.md`

**Implementation Summary:**
- ✅ Tailwind config: Teal-700 als DEFAULT voor betere contrast
- ✅ CSS variables: Alle `--color-brand`, `--color-info`, `--color-input-focus` → teal-700
- ✅ Components updated: sign-in, timeline, reading-progress, modern-side-bar
- ✅ AIButton component: Amber-600→700 gradient, 3 variants, fully accessible
- ✅ Contrast tested: All combinations pass WCAG AA for intended use cases

**Color Palette (Final):**
```typescript
// tailwind.config.ts
colors: {
  brand: {
    600: '#0D9488', // UI components (3.74:1 on white)
    700: '#0F766E', // PRIMARY text (5.47:1 on white - WCAG AA)
    800: '#115E59', // Hover states
    DEFAULT: '#0F766E',
  },
  ai: {
    600: '#D97706', // AI buttons (3.19:1 - AA Large)
    700: '#B45309', // AI hover (5.02:1 - AA Normal)
  }
}
```

---

### Epic 3 — Database & Auth

**Epic Doel:** Werkend datamodel met seed data, auth flow en RLS policies.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E3.S1 | Database schema | 5 core tables: clients, intake_notes, problem_profiles, treatment_plans, ai_events | ✅ | E0.S3 | 5 |
| E3.S2 | RLS policies | Row-level security per table (user isolation) | ✅ | E3.S1 | 3 |
| E3.S3 | Demo users seed | demo@mini-ecd.demo account aangemaakt | ✅ | E3.S2 | 1 |
| E3.S4 | Auth flow | Magic link + password login werkend | ✅ | E3.S3 | 2 |

**Technical Notes:**
- Schema: PostgreSQL via Supabase
- RLS: `auth.uid() = created_by` pattern
- Demo users: Shared dataset voor demo purposes
- Auth: Supabase Auth (magic link + password)

---

### Epic 4 — Core UI & Client Module

**Epic Doel:** EPD app foundation: layout, client CRUD, navigation.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E4.S1 | Coming Soon dashboard | `/epd/clients` placeholder met roadmap | ⏳ | E3.S4 | 2 |
| E4.S2 | App layout | Header + sidebar + main content area | ⏳ | E4.S1 | 3 |
| E4.S3 | Client list page | CRUD operations, table view, filters | ⏳ | E4.S2 | 5 |
| E4.S4 | Client detail page | Tabs: Intake, Profile, Plan (placeholders) | ⏳ | E4.S3 | 3 |
| E4.S5 | Navigation & routing | App routes, breadcrumbs, logout flow | ⏳ | E4.S2 | 2 |

**Technical Notes:**
- Layout: Separate van marketing (app header vs MinimalNav)
- Client CRUD: Forms met validation (Zod)
- Routing: `/epd/clients` namespace
- Mobile: Responsive table → card layout

---

### Epic 5 — Intake & AI Integration

**Epic Doel:** TipTap editor + Claude API voor intake samenvatting en B1 readability.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E5.S1 | TipTap editor setup | Rich text editor in client detail | ⏳ | E4.S4 | 4 |
| E5.S2 | Claude API endpoints | `/api/ai/summarize`, `/api/ai/simplify` | ⏳ | E0.S5 | 5 |
| E5.S3 | AI-rail component | Right panel voor AI suggestions | ⏳ | E5.S2 | 4 |
| E5.S4 | Prompt engineering | Nederlands prompts voor samenvatting | ⏳ | E5.S2 | 3 |
| E5.S5 | AI event logging | Log alle AI calls naar `ai_events` table | ⏳ | E5.S2 | 2 |
| E5.S6 | Error handling | Retry logic, user-friendly errors | ⏳ | E5.S2 | 2 |

**Technical Notes:**
- TipTap: ProseMirror-based editor
- Claude: 3.5 Sonnet voor Nederlands
- Prompts: Templates in `/lib/prompts/`
- Cost tracking: Log tokens + estimated costs

---

### Epic 6 — Profile & Plan

**Epic Doel:** DSM-light classificatie + SMART behandelplan generatie.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E6.S1 | Profile tab UI | DSM categories + severity selector | ⏳ | E4.S4 | 3 |
| E6.S2 | AI categorize endpoint | `/api/ai/categorize` met DSM-light output | ⏳ | E5.S2 | 4 |
| E6.S3 | Plan tab UI | SMART doelen form + interventies | ⏳ | E4.S4 | 3 |
| E6.S4 | AI plan generator | `/api/ai/plan` met 4 secties output | ⏳ | E6.S2 | 5 |

**Technical Notes:**
- DSM-light: 6 categorieën (stemming, angst, gedrag, etc.)
- Plan structuur: JSONB in database (flexibel)
- AI output: Structured JSON voor consistentie

---

### Epic 7 — Onboarding System

**Epic Doel:** User guidance voor eerste gebruik (tooltips, walkthrough).

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E7.S1 | First-time user detection | Check `user_metadata.onboarded` flag | ⏳ | E4.S2 | 1 |
| E7.S2 | Tooltip system | React Joyride of custom tooltips | ⏳ | E7.S1 | 3 |
| E7.S3 | Help documentation | In-app help modal met shortcuts | ⏳ | E7.S2 | 2 |
| E7.S4 | Skip onboarding | Option om walkthrough te skippen | ⏳ | E7.S2 | 1 |

**Technical Notes:**
- Tooltips: Highlight key features (AI buttons, etc.)
- Help: Keyboard shortcuts, feature overview
- Optional: Skip voor returning users

---

### Epic 8 — Performance & Launch

**Epic Doel:** Optimization, testing, demo preparation.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E8.S1 | Performance optimization | Lighthouse > 90, LCP < 2.5s | ⏳ | E7.S4 | 3 |
| E8.S2 | Accessibility audit | WCAG AA compliance, keyboard nav | ⏳ | E8.S1 | 2 |
| E8.S3 | Demo dry-run | 10-min demo scenario werkt | ⏳ | E8.S2 | 2 |
| E8.S4 | Production deployment | Live op Vercel, monitoring setup | ⏳ | E8.S3 | 2 |

**Technical Notes:**
- Performance: Image optimization, code splitting
- Accessibility: Focus states, ARIA labels
- Demo: Pre-seeded data, backup plan
- Monitoring: Vercel Analytics + error tracking

---

## 5. Kwaliteit & Testplan

🎯 **Doel:** Vastleggen hoe de kwaliteit van het project wordt geborgd.

### Test Types

| Test Type | Scope | Tools | Verantwoordelijke |
|-----------|-------|-------|-------------------|
| Unit Tests | Business logic, utilities | Vitest | Developer |
| Integration Tests | API endpoints, database | Playwright | Developer |
| Smoke Tests | Kritieke user flows | Manual checklist | Developer |
| Performance Tests | Load times, API response | Lighthouse | Developer |
| Accessibility Tests | WCAG AA compliance | axe DevTools | Developer |

### Test Coverage Targets

- **Unit tests:** 80%+ coverage op `/lib` folder
- **Integration tests:** Alle API endpoints
- **Smoke tests:** 5 happy flows + 3 error scenarios

### Manual Test Checklist (voor demo)

**Marketing Site:**
- [ ] Homepage laadt met hero + statement + timeline
- [ ] Timeline scrollt en toont features per week
- [ ] Login pagina toont features showcase + form
- [ ] Navigation werkt (Home, Contact, Login)
- [ ] Mobile responsive (timeline, login layout)

**EPD App:**
- [ ] User kan inloggen (magic link + demo credentials)
- [ ] Coming Soon dashboard toont roadmap
- [ ] Client CRUD werkt (Week 2)
- [ ] Intake editor werkt met TipTap (Week 3)
- [ ] AI samenvatting genereert binnen 5 sec (Week 3)
- [ ] Profile + Plan tabs werken (Week 3)
- [ ] Navigatie werkt zonder errors
- [ ] Mobile view is responsive
- [ ] Error states tonen user-friendly messages

**Design System:**
- [ ] Teal colors consistent overal
- [ ] Amber AI buttons duidelijk
- [ ] Contrast ratios WCAG AA compliant
- [ ] Focus states zichtbaar

---

## 6. Demo & Presentatieplan

🎯 **Doel:** Beschrijven hoe de demo wordt gepresenteerd.

### Demo Scenario

**Duur:** 10 minuten  
**Doelgroep:** GGZ innovatiemanagers + bestuurders  
**Locatie:** Live op Vercel (backup: localhost)

**Flow:**
1. **Intro** (1 min): Homepage - Statement + Timeline overview
2. **Features showcase** (2 min): Timeline scrollen, features per week zien
3. **Login** (1 min): Login pagina met features showcase
4. **EPD demo** (4 min):
   - Client lijst
   - Nieuwe intake maken
   - AI samenvatting genereren
   - Profile + Plan tabs
5. **Afsluiting** (2 min): Vragen + LinkedIn build-in-public link

**Backup Plan:**
- Lokale versie klaar bij internet issues
- Pre-seeded data als AI API niet reageert
- Screenshots als complete fallback

---

## 7. Risico's & Mitigatie

🎯 **Doel:** Risico's vroeg signaleren en voorzien van oplossingen.

| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| Teal design niet goed ontvangen | Laag | Middel | Rollback plan (1 uur), hybrid approach mogelijk | Developer |
| Timeline component complex | Middel | Middel | Aceternity UI pattern gebruiken, simplify indien nodig | Developer |
| Features data structuur te complex | Middel | Laag | Start simpel, iteratief uitbreiden | Developer |
| AI-output inconsistent | Hoog | Hoog | Snapshot tests, prompt versioning, fallback responses | Developer |
| API rate limits tijdens demo | Middel | Hoog | Caching, pre-warmed responses, backup data | Developer |
| Tijdsdruk deadline | Hoog | Middel | Prioriteer MVP features, cut scope indien nodig | Developer |
| Login pagina layout niet responsive | Laag | Middel | Test op mobile early, stack layout fallback | Developer |

---

## 8. Evaluatie & Lessons Learned

🎯 **Doel:** Reflecteren op het proces en verbeteringen vastleggen.

**Te documenteren na project:**
- Wat ging goed? Wat niet?
- Was teal-first design de juiste keuze?
- Werkt vereenvoudigde user journey beter?
- Welke AI-tools waren het meest effectief?
- Welke prompts werkten het beste?
- Waar liepen we vertraging op?
- Wat doen we volgende keer anders?
- Herbruikbare componenten voor volgende projecten

---

## 9. Referenties

🎯 **Doel:** Koppelen aan de overige Mission Control-documenten.

**Mission Control Documents:**
- **PRD v1.2** — `docs/specs/prd-mini-ecd-v2.md` - Product Requirements & Business Case
- **FO v2.1** — `docs/specs/fo-marketing-app-flow-v2.md` - Functioneel Ontwerp (vereenvoudigde user journey)
- **UX Plan v2.0** — `docs/specs/ux-implementation-plan-v2.md` - Teal-first design system
- **TO v1.2** — `docs/specs/to-mini-ecd-v1_2.md` - Technische Architectuur & Database Schema
- **API Specs** — `docs/specs/api-acces-mini-ecd.md` - Endpoint Documentation

**External Resources:**
- Repository: GitHub (public voor transparantie)
- Deployment: Vercel (EU region Amsterdam)
- Design: Tailwind CSS + shadcn/ui
- Documentation: `/docs` folder in repo

---

## 10. Glossary & Abbreviations

| Term | Betekenis |
|------|-----------|
| Epic | Grote feature of fase in development (bevat meerdere stories) |
| Story | Kleine, uitvoerbare taak binnen een epic |
| Story Points | Schatting van complexiteit (Fibonacci: 1, 2, 3, 5, 8, 13) |
| MVP | Minimum Viable Product |
| DRY | Don't Repeat Yourself |
| KISS | Keep It Simple, Stupid |
| SOC | Separation of Concerns |
| YAGNI | You Aren't Gonna Need It |
| RLS | Row Level Security (Supabase) |
| WCAG | Web Content Accessibility Guidelines |
| LCP | Largest Contentful Paint (performance metric) |

---

## Versiehistorie

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v2.1 | 17-11-2024 | Colin | Nieuw bouwplan op basis van FO v2.1 (vereenvoudigde user journey) en UX Plan v2.0 (teal-first design). Verwijderd: EPD demo pagina. Nieuw: Timeline met features, login met features showcase. |
| v1.6 | 15-11-2024 | Colin | Eerdere versie met separate EPD demo pagina |

---

**Status:** Ready for Week 1 Implementation  
**Next Action:** Begin Epic 1 (Marketing Website Refactor)  
**Owner:** Colin Lit  
**Timeline:** Week 1-4 (4 weken sprint)

