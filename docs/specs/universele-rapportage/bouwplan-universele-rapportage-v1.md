# 🚀 Mission Control — Bouwplan Universele Rapportage

💡 **Tip:** Dit bouwplan is gegenereerd op basis van het Functioneel Ontwerp (FO) en Technisch Ontwerp (TO).
Het bevat concrete epics, stories en acceptatiecriteria voor de implementatie van de Universele Rapportage functie.

---

**Projectnaam:** Mini-EPD - Universele Rapportage Functie
**Versie:** v1.0 (Week 2 MVP)
**Datum:** 23-11-2024
**Auteur:** Colin van der Heijden (AI Speedrun)

---

## 1. Doel en context

🎯 **Doel:** Bouwen van een AI-first rapportage systeem dat behandelaren in staat stelt om snel en intuïtief verslagen vast te leggen via spraak of tekst, waarbij AI automatisch het type rapportage herkent.

📘 **Toelichting:**
De Universele Rapportage functie is een fundamentele verandering in hoe EPD-systemen werken. In plaats van 47 verschillende formulieren en velden, krijgen behandelaren één universele interface:

**Traditioneel EPD workflow:**
```
Zoek juiste formulier → Vul velden in → Categoriseer handmatig → Save
Tijdsduur: 2-5 minuten
```

**AI Speedrun workflow:**
```
Klik "Rapporteer" → Spreek of typ → AI classificeert → Klaar
Tijdsduur: <30 seconden
```

**Context binnen AI Speedrun:**
- **Week 2 MVP:** Text/voice input + AI classificatie (behandeladvies vs vrije notitie) + tijdlijn
- **Week 3:** Meerdere rapportage types + structured data extraction
- **Week 4:** Dashboard metrics + advanced features

**Relatie met andere documenten:**
- [FO v1.0](./fo-universele-rapportage-v1.md) - Functionele specificaties, user stories, UI wireframes
- [TO v1.0](./to-universele-rapportage-v1.md) - Technische architectuur, API design, security

---

## 2. Uitgangspunten

### 2.1 Technische Stack

🎯 **Doel:** Benoem de technologieën en frameworks die worden gebruikt.

**Frontend:**
- **Framework:** Next.js 14.2.18 (App Router) ✅ *Al in gebruik*
- **React:** 18.3.1 (Server Components waar mogelijk)
- **TypeScript:** 5.x (strict mode)
- **UI Components:** shadcn/ui (Radix UI) 🆕 *Te installeren*
  - Dialog component (generiek, andere flows)
  - Tabs/Drawer componenten voor split view
  - Toast component voor feedback
  - Dropdown voor type selectie
- **Rich Text:** TipTap Editor ✅ *Al in gebruik* (behandeladvies module)
- **Styling:** TailwindCSS 3.4.x ✅ *Al in gebruik*
- **Icons:** Lucide React ✅ *Al in gebruik*

**Backend:**
- **API Routes:** Next.js API Routes (App Router) ✅ *Bestaand patroon*
- **Server Actions:** Next.js Server Actions ✅ *Bestaand patroon*
- **Database:** Supabase PostgreSQL ✅ *Al in gebruik*
- **ORM:** Supabase JS Client (type-safe) ✅ *Al in gebruik*
- **Validation:** Zod 3.x ✅ *Al in gebruik*

**AI/ML Services:**
- **Speech-to-Text:** Deepgram Nova 2 ✅ *Al geïntegreerd* (`/api/deepgram/transcribe`)
  - Model: `nova-2`
  - Language: `nl` (Nederlands)
  - Pricing: ~€0.0048/min
- **AI Classification:** Claude 3.5 Sonnet 🆕 *Nieuwe integratie*
  - Model: `claude-sonnet-4-20250514`
  - Provider: Anthropic
  - Pricing: ~€0.0009 per classificatie
  - API Key: Beschikbaar in `.env.local` (uncomment)

**Hosting & Infrastructure:**
- **Hosting:** Vercel (Edge Network) ✅ *Al in gebruik*
- **Database Hosting:** Supabase Cloud (EU region) ✅ *Al in gebruik*
- **Auth:** Supabase Auth (JWT) ✅ *Al in gebruik*

**Development Tools:**
- **Package Manager:** pnpm ✅ *Al in gebruik*
- **Linting:** ESLint ✅ *Al in gebruik*
- **Formatting:** Prettier (indien geconfigureerd)
- **Type Generation:** Supabase CLI (`npx supabase gen types`)

### 2.2 Projectkaders

🎯 **Doel:** Benoem de vaste kaders waarbinnen het project wordt ontwikkeld.

**Tijd:**
- **Week 2 MVP:** 15 uur bouwtijd (geschat)
- **Fasering:** 4 epics à 3-5 uur
- **Buffer:** 2 uur voor onvoorziene issues
- **Deadline:** Eind Week 2 (demo-ready)

**Budget:**
- **AI Kosten (geschat):** €0.60/maand voor 100 rapportages
  - Deepgram: €0.48/maand (100 min audio)
  - Claude: €0.09/maand (100 classificaties)
- **Hosting:** Gratis (Vercel Free tier voldoende voor MVP)
- **Database:** Gratis (Supabase Free tier)

**Team:**
- **Developer:** 1 full-stack developer (solo)
- **Tools:** Claude Code, GitHub Copilot (AI assistentie)

**Data:**
- **Patient data:** FHIR-compliant (al in database)
- **Demo data:** Bestaande patients + intakes hergebruiken
- **Privacy:** GDPR/NEN7510 compliant vanaf dag 1 (RLS policies)

**Doel:**
- **Intern:** Werkende voice-to-text rapportage voor behandelaren
- **Extern:** Demo-ready voor LinkedIn video (30 sec)
- **Learning:** Proof-of-concept voor AI-first EPD paradigma

**Scope Beperkingen (Week 2 MVP):**
- ✅ **In scope:**
  - Voice-to-text input (via Deepgram)
  - Manual text input (rich text editor)
  - AI classificatie (2 types: behandeladvies, vrije notitie)
  - Timeline view (chronologische rapportages)
  - CRUD operations (create, read, delete)
  - Button in patient layout (niet floating)

- ❌ **Out of scope (Week 3+):**
  - Meerdere rapportage types (intake, voortgang, crisis)
  - Structured data extraction (DSM codes, medicatie)
  - Audio opslag (alleen transcript)
  - Search/filter functionaliteit
  - PDF export
  - Auto-routing naar behandelplan tab
  - Versioning systeem

### 2.3 Programmeer Uitgangspunten

🎯 **Doel:** Vastleggen van code-kwaliteit principes en development best practices.

**Code Quality Principles:**

**DRY (Don't Repeat Yourself)**
- ✅ Refactor `speech-recorder.tsx` naar `/components/` (herbruikbaar)
- ✅ Centrale type definitions in `/lib/types/report.ts`
- ✅ Gedeelde API error handling patterns
- ✅ Hergebruik bestaande TipTap editor configuratie

**KISS (Keep It Simple, Stupid)**
- ✅ Start met 2 rapportage types (niet 7)
- ✅ Split view zonder meerstaps wizard
- ✅ Soft delete (geen hard delete + archivering)
- ✅ Fallback to manual input (geen complexe AI retry logic)

**SOC (Separation of Concerns)**
- ✅ API routes gescheiden van UI (`/app/api/reports/`)
- ✅ Server Actions voor data mutations (`actions.ts`)
- ✅ Components gescheiden van business logic
- ✅ Type definitions gescheiden van implementatie

**YAGNI (You Aren't Gonna Need It)**
- ✅ Geen versioning systeem (Week 2)
- ✅ Geen audio opslag (alleen transcript)
- ✅ Geen dashboard widgets (alleen timeline)
- ✅ Geen advanced search (alleen lijst)

**Development Practices:**

**Code Organization:**
```
/app/epd/patients/[id]/
  ├── layout.tsx                # Sidebar + header + composer anchor
  ├── rapportage/
  │   ├── page.tsx              # Split-view workspace (server)
  │   ├── actions.ts            # Server actions
  │   └── components/
  │       ├── rapportage-workspace.tsx
  │       ├── report-composer.tsx
  │       ├── report-timeline.tsx
  │       └── report-card.tsx
/app/api/
  ├── reports/
  │   ├── route.ts              # GET, POST
  │   ├── [reportId]/route.ts   # GET, PATCH, DELETE
  │   └── classify/route.ts     # AI classification
  └── deepgram/
      └── transcribe/route.ts   # Existing
/components/
  └── speech-recorder.tsx       # Refactored (generic)
/lib/
  ├── types/report.ts           # Type definitions
  └── prompts/classify.ts       # AI prompt templates
```

**Error Handling:**
```typescript
// API routes
try {
  const result = await classifyWithClaude(content);
  return NextResponse.json(result);
} catch (error) {
  console.error('[Classify] Error:', error);
  // Fallback strategy
  return NextResponse.json({
    type: 'vrije_notitie',
    confidence: 0.5,
    reasoning: 'AI classificatie mislukt'
  });
}

// Client components
try {
  const response = await fetch('/api/reports/classify');
  if (!response.ok) throw new Error('Classification failed');
} catch (error) {
  toast.error('Classificatie mislukt. Kies handmatig een type.');
}
```

**Security:**
- ✅ DEEPGRAM_API_KEY, ANTHROPIC_API_KEY in environment variables (nooit in code)
- ✅ Input validation met Zod schemas op alle API endpoints
- ✅ RLS policies op reports table (patient_id based)
- ✅ CORS: Vercel default (alleen eigen domein)
- ✅ Rate limiting: Vercel Edge Functions (100 req/min)

**Performance:**
- ✅ Server Components waar mogelijk (timeline view)
- ✅ Lazy loading: Modal component (dynamic import)
- ✅ Database indexes op patient_id, created_at
- ✅ Response caching: 60 sec voor GET /api/reports

**Documentation:**
- ✅ README met setup instructies (update bestaande)
- ✅ Inline comments voor AI prompts
- ✅ TypeScript types = zelf-documenterende code
- ✅ Migration file comments (rollback SQL)

---


### 2.4 Split View MVP (FO Samenvatting)

Het aanvullende [FO Split View MVP](./fo-rapportage-split-view-mvp.md) vertaalt zich naar de volgende functionele randvoorwaarden:

1. **Header navigatie** – "Nieuwe rapportage" navigeert of scrollt altijd naar `#rapportage-composer`; composer-element is focusbaar (`tabIndex=-1`).
2. **Dual-pane workspace** – timeline/filter + KPI's links, composer rechts; create/delete synchroniseert beide kolommen realtime.
3. **Filters** – huidige MVP bevat tekstzoeker en typefilter; backlog: auteur/datumfilters, AI-chips en reset.
4. **Composer** – textarea, spraak, AI-classificatie en referentiekaart gebaseerd op geselecteerde timeline-entry; sticky CTA en (toekomst) autosave/draft.
5. **Timeline** – selecteerbare kaarten met keyboard support en delete; inline expand en virtualization volgen in backlog.
6. **Mobiele drawer** – responsive tabs/drawer zodat timeline ↔ composer ook mobiel werkt (nog te bouwen).

Deze richtlijnen vervangen de oude modal-flow en vormen de basis voor de resterende stories binnen Epic 2/E3.

## 3. Epics & Stories Overzicht

🎯 **Doel:** De bouw opdelen in logische epics (fases) met stories (subfases).

**Epic Structuur:**

| Epic ID | Titel | Doel | Geschatte Tijd | Stories | Status | Opmerkingen |
|---------|-------|------|----------------|---------|--------|-------------|
| **E0** | Foundation & Refactoring | Herbruikbare componenten + database setup | 3 uur | 4 | ✅ Done | Speech-recorder refactor kritiek |
| **E1** | Backend & API | API routes, database, server actions | 4 uur | 5 | ✅ Done | RLS policies essentieel |
| **E2** | UI Components | Modal, timeline, cards, integration | 5 uur | 5 | ✅ Done | Grootste epic |
| **E3** | Integration & Testing | End-to-end flows, error handling | 3 uur | 4 | ⏳ To Do | Demo-ready maken |

**Totaal:** 15 uur (18 stories)

**Dependencies:**
```
E0 (Foundation)
  ↓
E1 (Backend) ← Must complete E0.S3 (DB migration) first
  ↓
E2 (UI) ← Needs E1.S1-S4 (API routes) complete
  ↓
E3 (Integration) ← Needs all above
```

---

## 4. Epics & Stories (Uitwerking)

🎯 **Doel:** Verdeel complexe epics in beheersbare stories voor meer overzicht.

### Epic 0 — Foundation & Refactoring

**Epic Doel:** Werkende basis met herbruikbare componenten en database schema klaar voor nieuwe features.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points | Geschatte Tijd |
|----------|--------------|---------------------|--------|------------------|--------------|----------------|
| **E0.S1** | Refactor speech-recorder component | Component verplaatst naar `/components/speech-recorder.tsx`, generieke props interface, werkt in behandeladvies (geen breaking changes) | ✅ | — | 3 | 45 min |
| **E0.S2** | Install Shadcn UI components | `npx shadcn add dialog toast dropdown-menu` succesvol, components beschikbaar in `/components/ui/` | ✅ | E0.S1 | 1 | 15 min |
| **E0.S3** | Create reports table migration | SQL migration file aangemaakt, `reports` table bestaat in database, indexes aanwezig, RLS enabled | ✅ | E0.S2 | 5 | 1 uur |
| **E0.S4** | Add environment variables | `DEEPGRAM_API_KEY` toegevoegd aan `.env.local`, `ANTHROPIC_API_KEY` uncommented, beide keys getest (API calls werken) | ✅ | E0.S3 | 1 | 15 min |

**Technical Notes:**

**E0.S1 - Speech Recorder Refactor:**
```typescript
// Before (behandeladvies specific):
// app/epd/patients/[id]/intakes/[intakeId]/behandeladvies/components/speech-recorder.tsx

// After (generic):
// components/speech-recorder.tsx
interface SpeechRecorderProps {
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SpeechRecorder({ onTranscript, disabled, className }: SpeechRecorderProps) {
  // Generic implementation
}
```

**E0.S3 - Database Migration:**
```sql
-- supabase/migrations/[timestamp]_create_reports_table.sql
-- See TO document section 4 for complete SQL
CREATE TABLE reports (...);
CREATE INDEX idx_reports_patient_id ON reports(patient_id);
-- RLS policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
```

**E0.S4 - Environment Variables:**
```bash
# .env.local
DEEPGRAM_API_KEY=your_deepgram_key_here
ANTHROPIC_API_KEY=sk-ant-... # Uncomment existing key
```

**Testing E0:**
- [ ] Speech recorder werkt in behandeladvies module (regression test)
- [ ] Dialog component opent/sluit correct
- [ ] Database migration succesvol: `npx supabase db push`
- [ ] API test calls naar Deepgram en Claude succesvol

---

### Epic 1 — Backend & API

**Epic Doel:** Werkende API endpoints en server actions voor alle CRUD operaties en AI classificatie.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points | Geschatte Tijd |
|----------|--------------|---------------------|--------|------------------|--------------|----------------|
| **E1.S1** | Create /api/reports (GET, POST) | `GET /api/reports?patientId=uuid` returns reports list, `POST /api/reports` creates new report, Zod validation werkt, errors return proper status codes | ✅ | E0.S3, E0.S4 | 5 | 1 uur |
| **E1.S2** | Create /api/reports/[reportId] | `GET/PATCH/DELETE` werken, soft delete implemented (`deleted_at`), RLS policies enforce access control | ✅ | E1.S1 | 3 | 45 min |
| **E1.S3** | Create /api/reports/classify | Claude API integration werkt, prompt template implemented, confidence thresholds applied, fallback to 'vrije_notitie' on error | ✅ | E1.S1, E0.S4 | 5 | 1 uur |
| **E1.S4** | Server actions (rapportage/actions.ts) | `getReports()`, `createReport()`, `deleteReport()` implemented, `revalidatePath()` called, type-safe met database types | ✅ | E1.S1, E1.S2 | 2 | 30 min |
| **E1.S5** | RLS policies voor reports | Users can only see own patients' reports, can only create/edit/delete own reports, policies tested (no unauthorized access) | ✅ | E1.S1, E1.S2 | 3 | 45 min |

**Technical Notes:**

**E1.S1 - Main API Route:**
```typescript
// app/api/reports/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');

  // Validation
  if (!patientId) {
    return NextResponse.json(
      { error: 'patientId is required' },
      { status: 400 }
    );
  }

  // Query with Supabase (RLS auto-applied)
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  // ...
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Zod validation
  const validated = CreateReportSchema.parse(body);

  // Insert to database
  // ...
}
```

**E1.S3 - AI Classification:**
```typescript
// app/api/reports/classify/route.ts
import Anthropic from '@anthropic-ai/sdk';

const CLASSIFICATION_PROMPT = `
Je bent een classificatie-assistent voor een GGZ EPD-systeem.
[Complete prompt from TO document]
`;

export async function POST(request: NextRequest) {
  const { content } = await request.json();

  // Validation
  if (!content || content.length < 20) {
    return NextResponse.json(
      { error: 'Content moet minimaal 20 karakters bevatten' },
      { status: 400 }
    );
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      temperature: 0.0,
      system: CLASSIFICATION_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Classificeer de volgende rapportage:\n\n${content}`,
        },
      ],
    });

    const result = JSON.parse(message.content[0].text);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Claude API error:', error);

    // Fallback
    return NextResponse.json({
      type: 'vrije_notitie',
      confidence: 0.5,
      reasoning: 'AI classificatie mislukt. Kies handmatig een type.',
    });
  }
}
```

**E1.S5 - RLS Policies:**
```sql
-- See TO document section 4 for complete policies
CREATE POLICY reports_select_policy ON reports
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE practitioner_id = auth.uid()
    )
  );
```

**Testing E1:**
- [ ] GET /api/reports returns correct reports for patient
- [ ] POST /api/reports creates report with correct fields
- [ ] AI classification returns valid JSON with type + confidence
- [ ] Server actions revalidate path (timeline updates)
- [ ] RLS: User A cannot see User B's patient reports

---

### Epic 2 — UI Components

**Epic Doel:** Gebruiksvriendelijke split-view interface met timeline, filters, composer en responsive gedrag.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points | Geschatte Tijd |
|----------|--------------|---------------------|--------|------------------|--------------|----------------|
| **E2.S1** | Rapportage workspace (split view) | Timeline en composer staan gelijktijdig op de pagina, header-knop scrollt naar `#rapportage-composer`, geselecteerde entry toont referentiekaart | ✅ | E1.S1, E1.S4 | 5 | 1.5 uur |
| **E2.S2** | Filterbare timeline component | Zoek/typefilter, selecteerbare kaarten met keyboard support, delete, lege staat | ✅ | E2.S1 | 3 | 1 uur |
| **E2.S3** | Report composer component | Textarea (20-5000 chars), speech recorder, AI-classificatie, referentie invoegen, sticky CTA + toasts | ✅ | E2.S1 | 3 | 1.5 uur |
| **E2.S4** | Responsive mobiele drawer | Tabs/drawer UX waarmee timeline ↔ composer gewisseld kan worden op <1024px, behoudt draft state | ✅ | E2.S1 | 3 | 1.5 uur |
| **E2.S5** | Autosave + advanced filters | Drafts (localStorage/Supabase), auteurs- en datumfilters, AI-chips en load-more timeline voor >50 items | ✅ | E2.S2, E2.S3 | 5 | 2 uur |

**Technical Notes:**

**E2.S1 - Rapportage Workspace:**
```typescript
// app/epd/patients/[id]/rapportage/components/rapportage-workspace.tsx
export function RapportageWorkspace({ patientId, patientName, initialReports }) {
  const [reports, setReports] = useState(initialReports);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="lg:w-2/5">
        <FilterPanel ... />
        <ReportTimeline
          reports={filteredReports}
          patientId={patientId}
          selectedReportId={selectedReportId}
          onSelect={(report) => setSelectedReportId(report.id)}
          onDeleteSuccess={(id) => setReports((prev) => prev.filter((r) => r.id !== id))}
        />
      </aside>
      <ReportComposer
        patientId={patientId}
        patientName={patientName}
        selectedReport={reports.find((r) => r.id === selectedReportId) ?? null}
        onReportCreated={(report) => setReports((prev) => [report, ...prev])}
      />
    </div>
  );
}
```

**E2.S3 - Report Composer:**
```typescript
export function ReportComposer({ patientId, patientName, selectedReport, onReportCreated }) {
  const [content, setContent] = useState('');
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const draftStorageKey = `rapportage-draft-${patientId}`;

  async function analyzeWithAI() { /* POST /api/reports/classify */ }

  async function saveReport() {
    const created = await createReport(patientId, {
      type: selectedType,
      content,
      ai_confidence: classification?.confidence,
      ai_reasoning: classification?.reasoning,
    });
    toast({ title: 'Rapportage opgeslagen', description: `${patientName} heeft nu een nieuwe notitie...` });
    onReportCreated?.(created);
    setContent('');
    localStorage.removeItem(draftStorageKey);
  }

  return (
    <section id="rapportage-composer" tabIndex={-1}>
      <textarea ... />
      <SpeechRecorder ... />
      <ReferenceCard selectedReport={selectedReport} />
      <AutosaveHint lastSaved={lastAutosave} />
      <footer>
        <Button onClick={analyzeWithAI}>Analyseer met AI</Button>
        <Button onClick={saveReport}>Opslaan</Button>
      </footer>
    </section>
  );
}
```

**E2.S4 - Mobiele Drawer/Tabs:**
```tsx
const isMobile = useMediaQuery('(max-width: 1023px)');
const [activeTab, setActiveTab] = useState<'timeline' | 'composer'>('timeline');

return (
  {isMobile && (
    <div className="flex rounded-full border ...">
      <button onClick={() => setActiveTab('timeline')}>Timeline</button>
      <button onClick={() => setActiveTab('composer')}>Nieuwe rapportage</button>
    </div>
  )}

  <div className="flex flex-col gap-6 lg:flex-row">
    {(!isMobile || activeTab === 'timeline') && <TimelinePane ... />}
    {(!isMobile || activeTab === 'composer') && <ReportComposer ... />}
  </div>
)
```

**E2.S5 - Filters & Autosave:**
```tsx
const [authorFilter, setAuthorFilter] = useState<'all' | string>('all');
const [dateFrom, setDateFrom] = useState('');
const [aiFilter, setAiFilter] = useState<'all' | 'ai' | 'manual'>('all');

const filteredReports = reports.filter((report) => {
  const matchesAuthor = authorFilter === 'all' || report.created_by === authorFilter;
  const matchesAI = aiFilter === 'all' || (aiFilter === 'ai'
    ? report.ai_confidence !== null
    : report.ai_confidence === null);
  const createdAt = report.created_at ? new Date(report.created_at) : null;
  const matchesFrom = !dateFrom || (createdAt && createdAt >= new Date(dateFrom));
  const matchesTo = !dateTo || (createdAt && createdAt <= new Date(`${dateTo}T23:59:59`));
  return matchesAuthor && matchesAI && matchesFrom && matchesTo;
});

useEffect(() => {
  const timeout = setTimeout(() => {
    localStorage.setItem(draftStorageKey, JSON.stringify({ content, type: selectedType, updatedAt: new Date().toISOString() }));
    setLastAutosave(new Date());
  }, 800);
  return () => clearTimeout(timeout);
}, [content, selectedType, draftStorageKey]);
```

- [ ] Headerknop scrollt naar composer binnen rapportagepagina en navigeert vanuit andere tabs.
- [ ] Timeline toont bestaande rapportages, filters werken (tekst, type, auteur, datum, AI-chips) en selectie highlight.
- [ ] Delete verwijdert item, toasts tonen feedback, KPI's updaten, "Meer rapportages laden" werkt.
- [ ] Composer accepteert tekst (20-5000 chars), speechinput vult textarea, AI-classificatie vult type.
- [ ] Autosave-indicator toont laatste timestamp; draft wordt hersteld na reload, verwijderd na succesvolle save.
- [ ] "Voeg referentie toe" plaatst quote block met meta en linkt naar geselecteerde entry.
- [ ] Mobiele layout toont tabs/drawer (timeline ↔ composer) en behoudt draft/selection state.

---

### Epic 3 — Integration & Testing

**Epic Doel:** End-to-end flows testen, error handling implementeren, demo-ready maken.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points | Geschatte Tijd |
|----------|--------------|---------------------|--------|------------------|--------------|----------------|
| **E3.S1** | Wire composer workspace to API routes | Save button calls `/api/reports`, workspace reset + KPI/timeline refresh, toast shown, composer focus behouden | ✅ | E2.S1, E2.S2, E1.S1 | 3 | 45 min |
| **E3.S2** | Test voice → classify → save flow | Complete flow: speak → transcript → analyze → AI classification → save → timeline update, works without errors | ✅ | E3.S1 | 3 | 45 min |
| **E3.S3** | Test manual text input flow | Type text → analyze → override AI → save → timeline update, character validation works, error messages shown | ✅ | E3.S1 | 2 | 30 min |
| **E3.S4** | Error handling & loading states | Deepgram timeout → fallback naar tekst, Claude failure → default type, netwerkfouten → toasts en retry hints, loading states op alle async stappen | ✅ | E3.S2, E3.S3 | 3 | 45 min |

**Technical Notes:**

**E3.S1 - API Integration:**
```typescript
// In ReportComposer component
async function saveReport() {
  setIsSaving(true);

  try {
    const created = await createReport(patientId, {
      type: selectedType,
      content,
      ai_confidence: classification?.confidence,
      ai_reasoning: classification?.reasoning,
    });

    toast({
      title: 'Rapportage opgeslagen',
      description: `${patientName} heeft nu een nieuwe notitie in de tijdlijn.`,
    });

    onReportCreated?.(created); // update timeline + KPI's client-side
    setContent('');
    router.refresh();
  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Opslaan mislukt',
      description: error instanceof Error ? error.message : 'Probeer opnieuw',
    });
  } finally {
    setIsSaving(false);
  }
}
```

**E3.S4 - Error Handling:**
```typescript
// Speech recorder error
try {
  const response = await fetch('/api/deepgram/transcribe', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Deepgram error');

  const { transcript } = await response.json();
  onTranscript(transcript);
} catch (error) {
  console.error('Transcription failed:', error);
  setError('Spraakherkenning mislukt. Typ je rapportage handmatig.');
  // Disable voice button, show manual input
}

// AI classification error
try {
  const response = await fetch('/api/reports/classify', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });

  const result = await response.json();
  setClassification(result);
} catch (error) {
  // Fallback already handled in API route
  setClassification({
    type: 'vrije_notitie',
    confidence: 0.5,
    reasoning: 'AI niet beschikbaar',
  });
}
```

**Testing E3:**

**Manual Test Checklist (Demo Readiness):**
- [ ] **Happy Flow (Voice):**
  - [ ] Klik "Nieuwe Rapportage" button
  - [ ] Start voice recording
  - [ ] Stop recording → transcript verschijnt
  - [ ] Klik "Analyseer met AI"
  - [ ] AI toont classificatie (confidence > 0.85)
  - [ ] Klik "Opslaan"
  - [ ] Toast: "Rapportage opgeslagen"
  - [ ] Timeline toont nieuwe rapportage bovenaan

- [ ] **Happy Flow (Manual Text):**
  - [ ] Scroll/focus naar composer via headerknop
  - [ ] Typ behandeladvies tekst (>20 chars)
  - [ ] Klik "Analyseer"
  - [ ] AI classificeert correct als "behandeladvies"
  - [ ] Klik "Opslaan"
  - [ ] Rapportage verschijnt in timeline

- [ ] **Override Flow:**
  - [ ] Typ "Telefonisch contact, afspraak verzet"
  - [ ] AI classificeert als "behandeladvies" (incorrect)
  - [ ] Wijzig dropdown naar "vrije_notitie"
  - [ ] Opslaan werkt
  - [ ] Type in database is "vrije_notitie"

- [ ] **Error Scenarios:**
  - [ ] Text < 20 chars → Error message shown
  - [ ] Network offline → User-friendly error
  - [ ] Deepgram timeout → Manual input fallback
  - [ ] Claude timeout → Default to vrije_notitie

- [ ] **Performance:**
  - [ ] Composer render/focus < 100ms
  - [ ] AI classification < 3 sec (p95)
  - [ ] Timeline render < 200ms (10 items)

- [ ] **Cross-browser:**
  - [ ] Chrome: All features work
  - [ ] Firefox: All features work
  - [ ] Safari: All features work (MediaRecorder check)

---

## 5. Kwaliteit & Testplan

🎯 **Doel:** Vastleggen hoe de kwaliteit van het project wordt geborgd.

### Test Types

| Test Type | Scope | Tools | Verantwoordelijke | Week 2 MVP Status |
|-----------|-------|-------|-------------------|-------------------|
| **Unit Tests** | Zod validation schemas | Vitest / Jest | Developer | ⏭️ Future (Week 3) |
| **Integration Tests** | API endpoints | Playwright | Developer | ⏭️ Future (Week 3) |
| **Manual Tests** | Complete user flows | Checklist (zie E3.S4) | Developer | ✅ Week 2 MVP |
| **Performance Tests** | Response times | Browser DevTools | Developer | ✅ Week 2 MVP |
| **Security Tests** | RLS policies, auth | Manual verification | Developer | ✅ Week 2 MVP |

### Test Coverage Targets (Week 2 MVP)

**Manual Testing Focus:**
- ✅ **Happy Flows:** 100% coverage (voice + manual text)
- ✅ **Error Scenarios:** 4 kritieke scenarios getest
- ✅ **Security:** RLS policies verified
- ✅ **Performance:** Response time targets validated

**Automated Testing (Week 3+):**
- Unit tests: 80%+ coverage op validation schemas
- Integration tests: Alle API endpoints
- E2E tests: 3 happy flows

### Performance Targets (from TO)

| Metric | Target | Measurement Tool |
|--------|--------|------------------|
| Composer render | < 100 ms | Chrome DevTools |
| GET /api/reports | < 500 ms (p95) | Network tab |
| POST /api/reports | < 800 ms (p95) | Network tab |
| Deepgram transcribe | < 2 sec (p95) | Network tab |
| Claude classify | < 3 sec (p95) | Network tab |
| Timeline render | < 200 ms (50 items) | React DevTools |

### Security Checklist (Week 2 MVP)

- [x] **Environment Variables:** API keys in `.env.local` (not in code)
- [x] **RLS Policies:** reports table heeft patient-based access control
- [x] **Input Validation:** Zod schemas op alle POST/PATCH endpoints
- [x] **SQL Injection:** Prevented (Supabase parameterized queries)
- [x] **XSS:** React auto-escapes (DOMPurify voor rich text)
- [ ] **Rate Limiting:** Vercel default (test: 100 req/min limit)
- [x] **CORS:** Vercel default (alleen eigen domein)
- [x] **HTTPS:** Vercel Edge (TLS 1.3)

### GDPR/AVG Compliance (Week 2 MVP)

- [x] **Data Minimalisatie:** Alleen noodzakelijke velden opgeslagen
- [x] **Transparency:** AI classificatie zichtbaar voor user
- [x] **User Control:** Manual override mogelijk
- [x] **Soft Delete:** `deleted_at` timestamp (herstel mogelijk)
- [x] **Consent:** Geen AI training op data (Claude/Deepgram contractueel)
- [ ] **Audit Logging:** Week 3+ (AI calls loggen naar database)
- [ ] **Data Export:** Week 4 (JSON/PDF export)

---

## 6. Demo & Presentatieplan

🎯 **Doel:** Beschrijven hoe de demo wordt gepresenteerd of getest.

### Demo Scenario (30-seconden LinkedIn Video)

**Duur:** 30 seconden
**Doelgroep:** GGZ professionals, EPD stakeholders, AI enthusiasts
**Platform:** LinkedIn post met video
**Format:** Screen recording met voiceover

**Script:**

| Timestamp | Visual | Voiceover |
|-----------|--------|-----------|
| **0-5 sec** | Client dossier open, 47 formulieren in sidebar (fade effect) | "Traditionele EPD's hebben 47 formulieren." |
| **6-10 sec** | Klik op "🎤 Nieuwe Rapportage" button, pagina scrollt naar composer in split view | "Wij hebben 1 knop." |
| **11-18 sec** | Typ snel: "Op basis van intakegesprek advies ik CGT traject...", klik "Analyseer" | "Je typt wat je denkt." |
| **19-23 sec** | AI classificatie verschijnt: "✓ Behandeladvies (92%)", klik "Opslaan" | "AI begrijpt wat het is." |
| **24-28 sec** | Timeline view update, rapportage verschijnt bovenaan | "En zet het automatisch op de juiste plek." |
| **29-30 sec** | Fade to logo + text: "AI Speedrun EPD - 25 seconden. Klaar." | "25 seconden. Klaar." |

**Belangrijke Visuele Elementen:**
- ✅ Smooth scroll/composer focus animaties
- ✅ Duidelijke button clicks (cursor highlight)
- ✅ AI classificatie badge (92% confidence)
- ✅ Real-time timeline update
- ✅ Teal theme kleuren (brand consistency)

**Recording Setup:**
- **Tool:** OBS Studio / Loom / QuickTime
- **Resolution:** 1920x1080 (Full HD)
- **Aspect Ratio:** 16:9 (LinkedIn native)
- **Framerate:** 30 FPS
- **Audio:** Voiceover recorded separately (Audacity)
- **Editing:** DaVinci Resolve / iMovie

**Backup Plan:**
- Pre-recorded video als live demo faalt
- Screenshots met annotations als fallback
- Localhost versie klaar bij internet issues

### Extended Demo (10 minuten - Optioneel)

**Voor:** Internal stakeholders / management presentation

**Flow:**
1. **Context** (2 min): Probleem traditionele EPD's (demo 47 formulieren)
2. **Voice Demo** (3 min): Live voice-to-text rapportage
3. **AI Classificatie** (2 min): Verschillende types testen
4. **Timeline** (2 min): Historiek tonen, CRUD operations
5. **Q&A** (1 min): Vragen beantwoorden

---

## 7. Risico's & Mitigatie

🎯 **Doel:** Risico's vroeg signaleren en voorzien van oplossingen.

**Risico's uit TO document (section 11) met implementatie focus:**

| Risico | Kans | Impact | Mitigatie | Owner | Status |
|--------|------|--------|-----------|-------|--------|
| **Deepgram API down tijdens demo** | Laag | Hoog | ✅ Fallback: Manual text input blijft werken<br>✅ Pre-recorded demo video backup<br>✅ Test API 1 uur voor demo | Developer | ⏳ Plan |
| **Claude API down of timeout** | Laag | Hoog | ✅ Fallback: Default to 'vrije_notitie' (implemented in API)<br>✅ Manual type selection altijd mogelijk<br>✅ Retry logic (1x) in API route | Developer | ⏳ Plan |
| **Speech recorder niet supported (Safari)** | Middel | Middel | ✅ Feature detection: Hide voice button if MediaRecorder unavailable<br>✅ Graceful degradation naar text-only input<br>✅ Test op Safari 14+ | Developer | ⏳ To Test |
| **Incorrect AI classification (>15%)** | Middel | Laag | ✅ Manual override dropdown (altijd beschikbaar)<br>✅ User feedback: Override rate = accuracy metric<br>✅ Prompt tuning (Week 3) | Developer | ⏳ Monitor |
| **Database migration fails** | Laag | Hoog | ✅ Test migration op staging DB first<br>✅ Rollback SQL in migration comments<br>✅ Backup database voor productie deploy | Developer | ⏳ Plan |
| **RLS policies te restrictief** | Middel | Hoog | ✅ Test met 2+ users (different practitioners)<br>✅ Verify: User A ziet GEEN reports van User B's patients<br>✅ Admin override policy (Week 3) | Developer | ⏳ To Test |
| **Cost overrun (AI calls)** | Laag | Laag | ✅ Rate limiting: 10 classificaties/min per user<br>✅ Cost monitoring: Log alle API calls<br>✅ Alert bij >€5/dag (Week 3) | Developer | ⏳ Plan |
| **Performance degradatie (>50 reports)** | Middel | Middel | ✅ Pagination: 50 items per page<br>✅ Database indexes: patient_id, created_at<br>✅ Load test met 100+ reports | Developer | ⏳ To Test |
| **GDPR compliance issue** | Laag | Hoog | ✅ RLS policies vanaf dag 1<br>✅ Soft delete (herstelbaar)<br>✅ Geen AI training (contractueel)<br>✅ Data minimalisatie | Developer | ✅ Implemented |

### Critical Path Risks (Week 2 MVP)

**Blocker Risks (kunnen MVP stop zetten):**
1. ❌ **Database migration fails in productie**
   - Mitigatie: Test op staging first, rollback SQL ready
   - Contingency: Revert to previous version, fix migration offline

2. ❌ **RLS policies blokkeren alle access**
   - Mitigatie: Disable RLS during testing, enable pre-deploy
   - Contingency: Emergency disable RLS (temporary), fix policies

3. ❌ **Split-view components conflicteren met bestaande UI**
   - Mitigatie: Test timeline/composer layout isolated first
   - Contingency: Schakel tijdelijk terug naar eenvoudige composer (full-width)

**High-Impact Risks (kunnen demo verpesten):**
1. ⚠️ **Live demo: Internet uitval**
   - Mitigatie: Localhost backup ready, pre-recorded video

2. ⚠️ **Live demo: AI API rate limit**
   - Mitigatie: Pre-warm API (test calls 10 min voor demo)
   - Contingency: Skip AI classificatie, toon manual flow

### Scope Creep Risks

**Features die NIET in Week 2 MVP:**
- ❌ Meerdere rapportage types (alleen 2: behandeladvies, vrije notitie)
- ❌ Audio opslag (alleen transcript)
- ❌ Search/filter functionaliteit
- ❌ Auto-routing naar behandelplan tab
- ❌ PDF export
- ❌ Dashboard widgets

**Hoe voorkomen:**
- ✅ Strict adherence aan FO Week 2 scope
- ✅ "Week 3" label op alle out-of-scope features
- ✅ Demo script focuses on core value prop (snelheid, AI classificatie)

---

## 8. Evaluatie & Lessons Learned

🎯 **Doel:** Reflecteren op het proces en verbeteringen vastleggen.

**Te documenteren na Week 2 MVP:**

### Wat ging goed?
- Hergebruik bestaande Deepgram integratie (time saver)
- FHIR-compliant database schema (solid foundation)
- TypeScript + Zod (type safety prevented bugs)
- Shadcn/ui (snelle UI development)

### Wat ging niet goed?
- [Te vullen na implementatie]
- Mogelijk: RLS policy debugging tijdrovend
- Mogelijk: Deepgram Nederlands accuracy lager dan verwacht
- Mogelijk: Modal state management complexer dan gedacht

### AI Tools Effectiviteit
- **Claude Code:** [Score 1-10] - Code generation, refactoring
- **GitHub Copilot:** [Score 1-10] - Autocomplete, boilerplate
- **ChatGPT/Claude:** [Score 1-10] - Prompt engineering, debugging

### Best Performing Prompts
```
# Claude Classification Prompt
[Effectiveness: TBD after testing]
- Confidence threshold: 0.85 voor auto-accept
- False positive rate: < 15% target
- User override rate: [Track in Week 3]

# Deepgram Configuration
- Model: nova-2
- Language: nl
- Accuracy: [Measure in testing]
```

### Waar liepen we vertraging op?
- [Epic/Story ID]: [Reden] - [Extra tijd]
- Voorbeeld: E1.S5 (RLS policies) - Complexe patient access logic - +2 uur

### Wat doen we volgende keer anders?
- Test RLS policies earlier (niet eind Epic 1)
- Build UI mockup in Figma first (minder iteraties)
- Set up error tracking (Sentry) vanaf dag 1

### Herbruikbare Componenten (voor volgende projecten)
- ✅ `SpeechRecorder` - Generic voice-to-text component
- ✅ AI classification pattern (Claude API + fallback)
- ✅ RLS policy templates (patient-based access)
- ✅ Zod validation schemas (reports CRUD)

### Metrics na Week 2
- **Total development time:** [Track actual vs 15 uur estimate]
- **Bug count:** [Critical, High, Medium, Low]
- **AI classification accuracy:** [% correct op first try]
- **Performance metrics:** [Actual vs targets]

---

## 9. Referenties

🎯 **Doel:** Koppelen aan de overige Mission Control-documenten.

### Mission Control Documents

**Core Specifications:**
- **[FO v1.0](./fo-universele-rapportage-v1.md)** — Functioneel Ontwerp (935 regels)
  - User stories, UI wireframes, flows, acceptatiecriteria
- **[FO Split View MVP](./fo-rapportage-split-view-mvp.md)** — Functionele uitwerking split timeline/composer
  - User stories voor dual-pane UX, filters, mobiel drawer, referentiegedrag
- **[TO v1.0](./to-universele-rapportage-v1.md)** — Technisch Ontwerp
  - Architectuur, API specs, database schema, security
- **[Bouwplan v1.0](./bouwplan-universele-rapportage-v1.md)** — Dit document
  - Epics, stories, timeline, risico's

**Supporting Documents:**
- Migration Plan: `/docs/migratie-clients-naar-patients.md` (FHIR compliance)
- Existing Bouwplan: `/docs/specs/UI/bouwplan-mini-epd-v1.0.md` (overall project)
- Templates: `/docs/templates/` (PRD, FO, TO templates)

### External Resources

**Tech Documentation:**
- Next.js 14: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Deepgram API: https://developers.deepgram.com/docs
- Claude API: https://docs.anthropic.com/claude/reference
- shadcn/ui: https://ui.shadcn.com
- TipTap: https://tiptap.dev/docs

**Code Repository:**
- GitHub: `/home/colin/development/15-mini-epd-prototype`
- Main branch: `main`
- Feature branch: `feature/universele-rapportage` (suggested)

**Key Directories:**
```
/app/epd/patients/[id]/rapportage/   # New module
/app/api/reports/                     # New API routes
/components/speech-recorder.tsx       # Refactored component
/lib/types/report.ts                  # New types
/supabase/migrations/                 # Database migrations
/docs/specs/universele-rapportage/    # All specs
```

**Environment Setup:**
```bash
# Required environment variables
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DEEPGRAM_API_KEY=...                 # Add this
ANTHROPIC_API_KEY=sk-ant-...         # Uncomment this
```

**Deployment:**
- Staging: Vercel preview (PR deploys)
- Production: `https://mini-epd.vercel.app` (main branch)
- Database: Supabase Cloud (EU region)

---

## 10. Glossary & Abbreviations

| Term | Betekenis |
|------|-----------|
| **Epic** | Grote feature of fase in development (bevat meerdere stories) |
| **Story** | Kleine, uitvoerbare taak binnen een epic |
| **Story Points** | Schatting van complexiteit (Fibonacci: 1, 2, 3, 5, 8) |
| **MVP** | Minimum Viable Product (Week 2 scope) |
| **RLS** | Row Level Security (Supabase database access control) |
| **FHIR** | Fast Healthcare Interoperability Resources (data standard) |
| **FO** | Functioneel Ontwerp (functional design document) |
| **TO** | Technisch Ontwerp (technical design document) |
| **AI Speedrun** | Project name voor AI-first EPD development |
| **DRY** | Don't Repeat Yourself (code principle) |
| **KISS** | Keep It Simple, Stupid (design principle) |
| **SOC** | Separation of Concerns (architecture principle) |
| **YAGNI** | You Aren't Gonna Need It (scope principle) |
| **Deepgram** | Speech-to-text API service (Nova 2 model) |
| **Claude** | AI model by Anthropic (classification) |
| **Supabase** | PostgreSQL database + auth platform |
| **Shadcn/ui** | Headless UI component library (Radix) |
| **Zod** | TypeScript-first schema validation library |

**EPD-specific Terms:**
| Term | Betekenis |
|------|-----------|
| **Behandeladvies** | Treatment advice/plan (rapportage type) |
| **Vrije notitie** | Free-form note (rapportage type) |
| **Intake** | Initial patient assessment process |
| **Screening** | Pre-intake assessment phase |
| **GGZ** | Geestelijke Gezondheidszorg (mental healthcare) |
| **NEN7510** | Dutch healthcare information security standard |
| **AVG/GDPR** | Privacy regulation (EU) |

---

## 11. Sprint Planning & Timeline

🎯 **Doel:** Concrete planning voor Week 2 MVP implementatie.

### Week 2 Timeline (5 werkdagen @ 3 uur/dag = 15 uur)

**Dag 1 (Maandag): Epic 0 - Foundation**
- ⏰ **09:00-10:00** (1u): E0.S1 - Refactor speech-recorder
- ⏰ **10:00-10:30** (0.5u): E0.S2 - Install Shadcn components
- ⏰ **10:30-12:00** (1.5u): E0.S3 - Database migration
  - ✅ Milestone: Database schema live

**Dag 2 (Dinsdag): Epic 1 - Backend (Deel 1)**
- ⏰ **09:00-10:30** (1.5u): E1.S1 - /api/reports (GET, POST)
- ⏰ **10:30-11:30** (1u): E1.S2 - /api/reports/[reportId]
- ✅ Milestone: CRUD API endpoints werken

**Dag 3 (Woensdag): Epic 1 - Backend (Deel 2)**
- ⏰ **09:00-10:30** (1.5u): E1.S3 - AI classification endpoint
- ⏰ **10:30-11:00** (0.5u): E1.S4 - Server actions
- ⏰ **11:00-12:00** (1u): E1.S5 - RLS policies
  - ✅ Milestone: Backend compleet, getest

**Dag 4 (Donderdag): Epic 2 - UI Components**
- ⏰ **09:00-10:30** (1.5u): E2.S1 - Rapportage Modal
- ⏰ **10:30-12:00** (1.5u): E2.S2 - Timeline view
  - ✅ Milestone: UI componenten werken isolated

**Dag 5 (Vrijdag): Epic 2 + Epic 3 - Integration**
- ⏰ **09:00-09:30** (0.5u): E2.S3, E2.S4, E2.S5 - Finishing touches
- ⏰ **09:30-10:30** (1u): E3.S1, E3.S2 - Wire everything together
- ⏰ **10:30-11:30** (1u): E3.S3, E3.S4 - Testing & error handling
- ⏰ **11:30-12:00** (0.5u): Demo prep, recording
  - ✅ Milestone: MVP compleet, demo-ready

### Buffer Time Management

**Buffers ingebouwd:**
- Dag 1-4: 30 min/dag buffer (totaal 2 uur)
- Dag 5: Extra 30 min voor demo polish

**Als achterstand:**
- Prioriteer E3.S2 (voice flow) - Core demo scenario
- Skip E2.S5 (toast) - Nice to have
- Simplify E2.S1 (split view) - Basic versie voldoet

### Daily Standup (Solo Developer)

**Dagelijkse reflectie (5 min einde dag):**
- ✅ Wat is af?
- ⚠️ Waar liep ik tegen aan?
- 📋 Wat doe ik morgen?
- ⏰ Ben ik on track? (actueel vs plan)

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 23-11-2024 | Colin van der Heijden | Initiële versie - Week 2 MVP scope, 18 stories, 15 uur |

---

**Einde Bouwplan - Universele Rapportage Functie**

🚀 **Ready to build!**
