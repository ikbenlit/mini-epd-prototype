# 🚀 Bouwplan — Mini EPD Prototype

**Projectnaam:** Mini EPD Prototype
**Versie:** v1.0
**Datum:** 19-11-2025
**Auteur:** Development Team

---

## 1. Doel en Context

🎯 **Doel:** Een werkend MVP bouwen van een desktop EPD (Electronisch Patiënten Dossier) systeem voor de geestelijke gezondheidszorg met AI-ondersteuning.

**Context:**
Het Mini EPD is een modern dossier systeem voor behandelaren in de GGZ. Het ondersteunt de volledige workflow van intake tot behandelplan met AI-assistentie voor:
- Intake notities en samenvattingen
- DSM-light diagnose classificatie
- SMART behandelplan generatie

**Scope MVP:**
- Desktop-only (min-width 1280px, optimized voor 1440-1920px)
- Two-level navigation systeem (Behandelaar ↔ Client Dossier context)
- 5 core database tables (clients, intake_notes, problem_profiles, treatment_plans, ai_events)
- TipTap rich text editor voor notities
- AI features: summarize, classify, generate plans

**Referenties:**
- Interface Design: `docs/specs/UI/interface-design-plan.md`
- User Flows: `docs/specs/UI/mocks-ui-flow.md`
- Database Schema: `supabase/migrations/20241115000002_create_epd_core_tables.sql`

---

## 2. Uitgangspunten

### 2.1 Technische Stack

- **Frontend:** Next.js 15 + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI + shadcn/ui patterns
- **Icons:** Lucide React
- **Rich Text:** TipTap (ProseMirror)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/password + OAuth)
- **AI/ML:** OpenAI API / Vertex AI (Gemini) - TBD
- **Hosting:** Vercel
- **State Management:** React Context + URL state

### 2.2 Projectkaders

- **Platform:** Desktop only (MVP), no mobile optimization
- **Timeline:** Iteratief, focus op core workflows eerst
- **Data:** Demo data, geen echte patiëntgegevens
- **Team:** 1-2 developers
- **Performance:** Target < 2s page load, < 5s AI responses

### 2.3 Programmeer Uitgangspunten

**Code Quality Principles:**

- **DRY:** Herbruikbare componenten (`/components/epd/`, `/lib/epd/`)
- **SOC:**
  - UI components in `/app/epd/components/`
  - Business logic in `/lib/epd/`
  - Database queries in `/lib/supabase/queries/`
  - API routes in `/app/api/`
- **KISS:** Geen premature abstraction, iteratief verfijnen
- **YAGNI:** Alleen Week 1-2 features, AI features in Week 3

**Development Practices:**

- **Error Handling:** Try-catch op alle async ops, user-friendly messages
- **Security:**
  - RLS policies op alle tables
  - API keys in environment variables
  - Input validation op alle forms
- **Performance:**
  - Server Components waar mogelijk
  - Client Components alleen voor interactiviteit
  - Lazy loading voor AI features
  - Debounce op search (300ms)
- **Accessibility:**
  - WCAG AA compliance
  - Keyboard navigation (Tab, Enter, Escape)
  - ARIA labels op alle interactive elements
  - Focus states visible

---

## 3. Epics & Stories Overzicht

| Epic ID | Titel | Doel | Status | Stories | Opmerkingen |
|---------|-------|------|--------|---------|-------------|
| E0 | Setup & Configuratie | Repo, database, auth werkend | ✅ | 3 | Grotendeels klaar |
| E1 | Layout & Navigation | Two-level context systeem | 🔄 | 4 | In progress |
| E2 | Cliënten Management | CRUD clients, search/filter | ⏳ | 5 | Week 1-2 |
| E3 | Intake Systeem | TipTap editor, CRUD notes | ⏳ | 6 | Week 1-2 |
| E4 | Diagnose & Probleemprofiel | DSM-light categories, manual entry | ⏳ | 4 | Week 2 |
| E5 | Behandelplan | SMART goals, interventions, versioning | ⏳ | 5 | Week 2-3 |
| E6 | AI Integration | Summarize, classify, generate (Week 3) | ⏳ | 4 | Week 3 |
| E7 | Testing & Polish | QA, accessibility, performance | ⏳ | 3 | Ongoing |

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 — Setup & Configuratie

**Status:** ✅ Grotendeels gereed

| Story ID | Beschrijving | AC | Status | Points |
|----------|--------------|-----|--------|--------|
| E0.S1 | Repository + Next.js 15 setup | App draait lokaal op :3000 | ✅ | 2 |
| E0.S2 | Supabase project + schema | 5 core tables aangemaakt | ✅ | 3 |
| E0.S3 | Auth flows (login/logout) | Email/password werkt, OAuth ready | ✅ | 5 |

**Tech Notes:**
- Database migrations in `supabase/migrations/`
- Auth flows in `app/auth/` (callback, logout, reset-password)
- Environment vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### Epic 1 — Layout & Navigation

**Doel:** Two-level context systeem werkend met context-aware sidebar en header

| Story ID | Beschrijving | AC | Status | Points |
|----------|--------------|-----|--------|--------|
| E1.S1 | EPD root layout | Fixed header + sidebar layout | 🔄 | 3 |
| E1.S2 | Context-aware sidebar | Level 1 vs Level 2 menu dynamisch | 🔄 | 5 |
| E1.S3 | Context-aware header | Client dropdown in Level 2, search bar | 🔄 | 5 |
| E1.S4 | URL-based context detection | Layout past zich aan op basis van URL | ⏳ | 3 |

**Tech Notes:**

**Routing structure:**
```
/epd/dashboard              → Behandelaar dashboard (Level 1)
/epd/clients                → Cliënten lijst (Level 1)
/epd/clients/[id]           → Client dashboard (Level 2)
/epd/clients/[id]/intake    → Intake sectie (Level 2)
/epd/clients/[id]/diagnose  → Diagnose sectie (Level 2)
/epd/clients/[id]/plan      → Behandelplan (Level 2)
```

**Context detection logic:**
```typescript
const isClientDossier = pathname.includes('/clients/') &&
                        pathname.match(/\/clients\/[^\/]+/);
const clientId = isClientDossier ? pathname.split('/')[3] : null;
```

**Components:**
- `app/epd/layout.tsx` - Root EPD layout met context detection
- `app/epd/components/epd-header.tsx` - Context-aware header
- `app/epd/components/epd-sidebar.tsx` - Context-aware sidebar

---

### Epic 2 — Cliënten Management

**Doel:** CRUD voor cliënten, search/filter, recent clients

| Story ID | Beschrijving | AC | Status | Points |
|----------|--------------|-----|--------|--------|
| E2.S1 | Cliënten lijst view | Table met search, filters werkend | ⏳ | 5 |
| E2.S2 | Nieuwe cliënt formulier | Modal/page met validatie, opslaan werkt | ⏳ | 5 |
| E2.S3 | Client detail edit | Bestaande client gegevens bewerken | ⏳ | 3 |
| E2.S4 | Search & filter functionaliteit | Real-time zoeken op naam, BSN, ID | ⏳ | 5 |
| E2.S5 | Recent clients tracking | localStorage, max 5 items, dropdown | ⏳ | 3 |

**Tech Notes:**

**Database queries:**
```typescript
// lib/supabase/queries/clients.ts
export async function getClients(filters: ClientFilters) {
  const query = supabase
    .from('clients')
    .select('id, first_name, last_name, birth_date, created_at')
    .order('last_name', { ascending: true });

  if (filters.search) {
    query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
  }

  return query;
}
```

**Search debounce:**
```typescript
const debouncedSearch = useMemo(
  () => debounce((value: string) => setSearchQuery(value), 300),
  []
);
```

**Components:**
- `app/epd/clients/page.tsx` - Cliënten lijst
- `app/epd/clients/components/client-list.tsx`
- `app/epd/clients/components/client-search.tsx`
- `app/epd/clients/new/page.tsx` - Nieuwe cliënt form

---

### Epic 3 — Intake Systeem

**Doel:** TipTap editor voor intake notities met CRUD functionaliteit

| Story ID | Beschrijving | AC | Status | Points |
|----------|--------------|-----|--------|--------|
| E3.S1 | TipTap editor setup | Rich text editor werkend, formatting | ⏳ | 8 |
| E3.S2 | Intake lijst view | Toon alle intakes per client, sorteerbaar | ⏳ | 3 |
| E3.S3 | Nieuwe intake aanmaken | Editor opent, opslaan werkt, JSONB storage | ⏳ | 5 |
| E3.S4 | Intake detail slide-in | 400px panel, scroll, edit/delete | ⏳ | 5 |
| E3.S5 | Content text extraction | JSONB → plain text voor search index | ⏳ | 3 |
| E3.S6 | Auto-save drafts | localStorage, 30s interval, restore on return | ⏳ | 5 |

**Tech Notes:**

**TipTap configuration:**
```typescript
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const editor = useEditor({
  extensions: [StarterKit],
  content: initialContent,
  onUpdate: ({ editor }) => {
    const json = editor.getJSON()
    const text = editor.getText()
    // Save to state/DB
  }
})
```

**Database structure:**
```sql
intake_notes (
  id UUID,
  client_id UUID,
  title TEXT,
  tag TEXT ('Intake', 'Evaluatie', 'Plan'),
  content_json JSONB,  -- TipTap document
  content_text TEXT,   -- Plain text for FTS
  created_at TIMESTAMPTZ
)
```

**Components:**
- `app/epd/clients/[id]/intake/page.tsx` - Intake lijst
- `app/epd/clients/[id]/intake/components/intake-editor.tsx`
- `app/epd/clients/[id]/intake/components/intake-detail-panel.tsx`

---

### Epic 4 — Diagnose & Probleemprofiel

**Doel:** DSM-light categorieën met severity tracking (manual entry MVP)

| Story ID | Beschrijving | AC | Status | Points |
|----------|--------------|-----|--------|--------|
| E4.S1 | DSM categories grid UI | 6 categorieën visueel, severity badges | ⏳ | 5 |
| E4.S2 | Problem profile CRUD | Aanmaken/bewerken/verwijderen per categorie | ⏳ | 5 |
| E4.S3 | Severity indicator | Laag/Middel/Hoog visueel duidelijk | ⏳ | 2 |
| E4.S4 | Source linking | Link diagnose → intake note (bronverwijzing) | ⏳ | 3 |

**Tech Notes:**

**DSM-light categories:**
```typescript
const DSM_CATEGORIES = [
  { id: 'stemming_depressie', label: 'Stemming & Depressie', color: 'blue' },
  { id: 'angst', label: 'Angst', color: 'purple' },
  { id: 'gedrag_impuls', label: 'Gedrag & Impuls', color: 'red' },
  { id: 'middelen_gebruik', label: 'Middelengebruik', color: 'orange' },
  { id: 'cognitief', label: 'Cognitief', color: 'green' },
  { id: 'context_psychosociaal', label: 'Context & Psychosociaal', color: 'teal' },
] as const;
```

**Severity levels:**
```typescript
type Severity = 'laag' | 'middel' | 'hoog';

const SEVERITY_CONFIG = {
  laag: { label: 'Laag', color: 'green', dots: 1 },
  middel: { label: 'Middel', color: 'yellow', dots: 3 },
  hoog: { label: 'Hoog', color: 'red', dots: 5 },
};
```

**Components:**
- `app/epd/clients/[id]/diagnose/page.tsx`
- `app/epd/clients/[id]/diagnose/components/dsm-categories.tsx`
- `app/epd/clients/[id]/diagnose/components/severity-indicator.tsx`

---

### Epic 5 — Behandelplan

**Doel:** SMART doelen tracking met interventies en versioning

| Story ID | Beschrijving | AC | Status | Points |
|----------|--------------|-----|--------|--------|
| E5.S1 | Treatment plan data model | JSONB structure + versioning | ⏳ | 3 |
| E5.S2 | SMART goals editor | Lijst van doelen, progress tracking | ⏳ | 8 |
| E5.S3 | Interventies sectie | Evidence-based methoden lijst | ⏳ | 5 |
| E5.S4 | Frequentie & planning | Sessie planning, duration estimate | ⏳ | 3 |
| E5.S5 | Plan versioning | v1, v2, concept/gepubliceerd status | ⏳ | 5 |

**Tech Notes:**

**Treatment plan JSONB structure:**
```typescript
interface TreatmentPlan {
  doelen: Array<{
    id: string;
    beschrijving: string;
    specifiek: string;      // S - Specific
    meetbaar: string;        // M - Measurable
    acceptabel: boolean;     // A - Acceptable
    realistisch: boolean;    // R - Realistic
    tijdgebonden: string;    // T - Time-bound
    voortgang: number;       // 0-100%
  }>;
  interventies: Array<{
    naam: string;            // "CGT", "ACT", "EMDR"
    beschrijving: string;
    doel_ids: string[];      // Links to goals
  }>;
  frequentie: {
    sessies_per_week: number;
    totaal_sessies: number;
    duur_minuten: number;
  };
  meetmomenten: Array<{
    week: number;
    beschrijving: string;
  }>;
}
```

**Versioning logic:**
```typescript
// When creating new version:
const latestVersion = await getLatestPlanVersion(clientId);
const newVersion = latestVersion ? latestVersion.version + 1 : 1;

// Publish: concept → gepubliceerd
await supabase
  .from('treatment_plans')
  .update({ status: 'gepubliceerd', published_at: new Date() })
  .eq('id', planId);
```

**Components:**
- `app/epd/clients/[id]/plan/page.tsx`
- `app/epd/clients/[id]/plan/components/smart-goals.tsx`
- `app/epd/clients/[id]/plan/components/interventions.tsx`
- `app/epd/clients/[id]/plan/components/plan-version-selector.tsx`

---

### Epic 6 — AI Integration (Week 3)

**Doel:** AI-powered features voor summarize, classify, generate

| Story ID | Beschrijving | AC | Status | Points |
|----------|--------------|-----|--------|--------|
| E6.S1 | AI API configuratie | OpenAI/Vertex setup, test call works | ⏳ | 3 |
| E6.S2 | Intake samenvatting | /api/ai/summarize endpoint, <5s response | ⏳ | 8 |
| E6.S3 | Diagnose classificatie | /api/ai/classify endpoint, DSM mapping | ⏳ | 8 |
| E6.S4 | Behandelplan generatie | /api/ai/generate-plan, SMART goals output | ⏳ | 13 |

**Tech Notes:**

**API Routes:**
```
POST /api/ai/summarize     - Samenvatting van intake note
POST /api/ai/classify      - DSM-light classificatie
POST /api/ai/generate-plan - Behandelplan generatie
```

**AI Events logging:**
```typescript
await supabase.from('ai_events').insert({
  kind: 'summarize',
  client_id: clientId,
  note_id: noteId,
  request: { prompt, model },
  response: { output, tokens },
  duration_ms: responseTime,
});
```

**Prompt templates:**
```typescript
const SUMMARIZE_PROMPT = `
Je bent een GGZ-professional. Vat de volgende intake notitie samen in 3-5 bullet points.
Focus op: klachten, achtergrond, observaties.

Notitie:
{content}
`;
```

**Components:**
- `app/api/ai/summarize/route.ts`
- `app/api/ai/classify/route.ts`
- `app/api/ai/generate-plan/route.ts`
- `lib/ai/prompts.ts`
- `lib/ai/client.ts` (OpenAI/Vertex wrapper)

---

### Epic 7 — Testing & Polish

**Doel:** QA, accessibility audit, performance optimization

| Story ID | Beschrijving | AC | Status | Points |
|----------|--------------|-----|--------|--------|
| E7.S1 | Manual test scenarios | Alle happy flows werken zonder errors | ⏳ | 5 |
| E7.S2 | Accessibility audit | WCAG AA compliance, keyboard nav werkt | ⏳ | 5 |
| E7.S3 | Performance optimization | Lighthouse score >90, <2s load | ⏳ | 3 |

---

## 5. Kwaliteit & Testplan

### Test Types

| Test Type | Scope | Verantwoordelijke |
|-----------|-------|-------------------|
| Manual Testing | Happy flows, edge cases | Developer |
| Accessibility | Keyboard nav, screen reader | Developer |
| Performance | Lighthouse, load times | Developer |

### Manual Test Checklist

**Level 1 - Behandelaar Context:**
- [ ] Login werkt (email/password)
- [ ] Dashboard toont correct (caseload, aandachtspunten)
- [ ] Cliënten lijst laadt, search werkt
- [ ] Nieuwe cliënt aanmaken werkt
- [ ] Klik op client → switch naar Level 2

**Level 2 - Client Dossier Context:**
- [ ] Client dashboard toont correct (info, laatste intake, diagnose)
- [ ] Sidebar toont "← Cliënten" button
- [ ] Header toont client dropdown
- [ ] Navigatie tussen secties werkt (Intake, Diagnose, Plan)
- [ ] "← Cliënten" button → terug naar Level 1

**Intake:**
- [ ] TipTap editor opent, formatting werkt
- [ ] Opslaan intake werkt (JSONB + text extraction)
- [ ] Intake lijst toont alle notities
- [ ] Slide-in detail panel opent/sluit correct
- [ ] Bewerken intake werkt

**Diagnose:**
- [ ] DSM categories grid toont 6 categorieën
- [ ] Severity indicator werkt (laag/middel/hoog)
- [ ] Problem profile aanmaken/bewerken werkt
- [ ] Bronverwijzing naar intake note werkt

**Behandelplan:**
- [ ] SMART goals toevoegen/bewerken werkt
- [ ] Interventies sectie werkt
- [ ] Progress tracking werkt (0-100%)
- [ ] Versioning werkt (v1, v2, concept/gepubliceerd)

**AI Features (Week 3):**
- [ ] Samenvatting genereert binnen 5 seconden
- [ ] Classificatie geeft valide DSM categories
- [ ] Behandelplan generator werkt, output is bruikbaar
- [ ] AI events worden gelogd

**Accessibility:**
- [ ] Alle interactive elements keyboard accessible
- [ ] Focus states zichtbaar
- [ ] ARIA labels correct
- [ ] Color contrast WCAG AA

---

## 6. Demo & Presentatieplan

**Duur:** 15 minuten
**Doelgroep:** Stakeholders, GGZ-professionals
**Demo Scenario:**

1. **Login** (1 min) - Toon authenticatie flow
2. **Behandelaar Dashboard** (2 min) - Overzicht caseload, aandachtspunten
3. **Nieuwe Cliënt** (2 min) - Voeg "Bas Jansen" toe
4. **Intake Notitie** (3 min) - TipTap editor, rich text, opslaan
5. **AI Samenvatting** (2 min) - Genereer samenvatting (Week 3 feature)
6. **Diagnose** (2 min) - DSM classificatie, severity
7. **Behandelplan** (2 min) - SMART goals, interventies
8. **Q&A** (1 min)

**Backup Plan:**
- Localhost als Vercel deployment faalt
- Pre-seeded demo data
- Screenshots als fallback

---

## 7. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| TipTap integratie complex | Middel | Hoog | Start met StarterKit, uitbreiden later | Dev |
| AI API rate limits | Hoog | Middel | Caching, response fallbacks, debounce | Dev |
| Context switching bugs | Middel | Hoog | Uitgebreide URL-based state tests | Dev |
| Performance met grote datasets | Middel | Middel | Pagination, lazy loading, indexing | Dev |
| RLS policies te open (demo) | Laag | Hoog | Duidelijke comments, productie checklist | Dev |
| Two-level navigation verwarrend | Middel | Middel | User testing, clear visual feedback | Dev |

---

## 8. Evaluatie & Lessons Learned

**Te documenteren na MVP:**
- Welke onderdelen namen meer tijd dan verwacht?
- TipTap editor challenges en oplossingen
- AI prompt engineering insights (Week 3)
- Two-level navigation UX feedback
- Performance bottlenecks en optimalisaties
- Herbruikbare patterns voor volgende projecten

---

## 9. Referenties

**Mission Control Documents:**
- **Interface Design:** `docs/specs/UI/interface-design-plan.md`
- **User Flows:** `docs/specs/UI/mocks-ui-flow.md`
- **Database Schema:** `supabase/migrations/20241115000002_create_epd_core_tables.sql`

**Codebase:**
- **Repository:** `/home/colin/development/15-mini-epd-prototype`
- **EPD App:** `app/epd/`
- **Components:** `components/ui/`, `app/epd/components/`
- **Database Queries:** `lib/supabase/queries/`
- **Migrations:** `supabase/migrations/`

**External Resources:**
- Next.js 15 Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- TipTap Docs: https://tiptap.dev
- Radix UI: https://radix-ui.com
- Tailwind CSS: https://tailwindcss.com

---

## 10. Glossary & Abbreviations

| Term | Betekenis |
|------|-----------|
| EPD | Electronisch Patiënten Dossier |
| GGZ | Geestelijke Gezondheidszorg |
| DSM | Diagnostic and Statistical Manual (psychiatric classification) |
| DSM-light | Vereenvoudigde categorisatie (6 hoofdgroepen) |
| SMART | Specific, Measurable, Acceptable, Realistic, Time-bound |
| TipTap | Rich text editor gebouwd op ProseMirror |
| RLS | Row Level Security (Supabase/PostgreSQL) |
| Level 1 | Behandelaar Context (caseload overzicht) |
| Level 2 | Client Dossier Context (individuele cliënt focus) |
| Context Switch | Navigatie tussen Level 1 ↔ Level 2 |
| FTS | Full-Text Search |
| JSONB | PostgreSQL JSON Binary data type |

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 19-11-2025 | Development Team | Initiële versie op basis van UI specs |
