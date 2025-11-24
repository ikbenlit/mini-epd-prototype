# ⚙️ Technisch Ontwerp (TO) — Universele Rapportage

**Projectnaam:** Mini-EPD - Universele Rapportage Functie
**Versie:** v1.0 (Week 2 MVP)
**Datum:** 23-11-2024
**Auteur:** Colin van der Heijden (AI Speedrun)

---

## 1. Doel en relatie met PRD en FO

🎯 **Doel van dit document:**
Het Technisch Ontwerp (TO) beschrijft **hoe** het systeem technisch wordt gebouwd. Waar het FO de functionaliteit beschrijft, gaat het TO over architectuur, techstack, data en infrastructuur.

📘 **Relatie met andere documenten:**
- **FO v1.0** ([fo-universele-rapportage-v1.md](./fo-universele-rapportage-v1.md)): Functionele specificaties, user stories, UI flows
- **PRD v1.2**: AI Speedrun Week 2 MVP scope
- **Bestaande codebase**: Next.js 14 + Supabase + FHIR-compliant schema

**Belangrijkste technische uitdaging:**
Het bouwen van een AI-first rapportage systeem dat:
1. Voice-to-text verwerkt (Deepgram)
2. Automatisch rapportage type classificeert (Claude)
3. Naadloos integreert in bestaande patient workflow
4. GDPR/NEN7510 compliant blijft

---

## 2. Technische Architectuur Overzicht

🎯 **Doel:** Globaal beeld van de systeemarchitectuur.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Patient Layout (app/epd/patients/[id]/layout.tsx)   │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  "Nieuwe Rapportage" Button (Header/Sidebar)  │  │  │
│  │  └───────────────────┬────────────────────────────┘  │  │
│  │                      │ onClick                        │  │
│  │                      ▼                                │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Rapportage Modal (Dialog Component)          │  │  │
│  │  │  ┌──────────────────────────────────────────┐ │  │  │
│  │  │  │  1. Text Input / Rich Text Editor       │ │  │  │
│  │  │  │  2. Speech Recorder (Deepgram)           │ │  │  │
│  │  │  │  3. AI Classification Display            │ │  │  │
│  │  │  │  4. Manual Type Dropdown Override        │ │  │  │
│  │  │  └──────────────────────────────────────────┘ │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Timeline View (rapportage/page.tsx)          │  │  │
│  │  │  - Chronological list of reports               │  │  │
│  │  │  - Filter by type                               │  │  │
│  │  │  - CRUD operations                              │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ HTTPS/TLS 1.3
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js 14 Server (Vercel Edge)                │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  API Routes (app/api/)                             │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  /api/reports                                │  │    │
│  │  │  - GET: List reports for patient             │  │    │
│  │  │  - POST: Create new report                   │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  /api/reports/[reportId]                     │  │    │
│  │  │  - GET/PATCH/DELETE: CRUD operations         │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  /api/reports/classify                       │  │    │
│  │  │  - POST: AI classification (Claude)          │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  /api/deepgram/transcribe (existing)         │  │    │
│  │  │  - POST: Audio → Text (Deepgram)             │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Server Actions (app/epd/patients/.../actions.ts)  │    │
│  │  - getReports(patientId)                            │    │
│  │  - createReport(data)                               │    │
│  │  - deleteReport(reportId)                           │    │
│  │  - revalidatePath() for cache invalidation          │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                    │                    │
                    │                    │
        ┌───────────▼──────────┐    ┌───▼─────────────────┐
        │  External AI APIs    │    │  Supabase           │
        │  ┌────────────────┐  │    │  (PostgreSQL)       │
        │  │ Deepgram       │  │    │                     │
        │  │ Nova 2 Model   │  │    │  ┌───────────────┐ │
        │  │ (Speech→Text)  │  │    │  │ reports       │ │
        │  └────────────────┘  │    │  │ - patient_id  │ │
        │                      │    │  │ - type        │ │
        │  ┌────────────────┐  │    │  │ - content     │ │
        │  │ Claude 3.5     │  │    │  │ - ai_data     │ │
        │  │ Sonnet         │  │    │  └───────────────┘ │
        │  │ (Classify)     │  │    │                     │
        │  └────────────────┘  │    │  RLS Policies       │
        │                      │    │  Auth + Security    │
        └──────────────────────┘    └─────────────────────┘
```

### Data Flow (Voice → AI → Database)

```
User speaks
    ↓
MediaRecorder API (browser)
    ↓
Audio blob (audio/webm)
    ↓
POST /api/deepgram/transcribe
    ↓
Deepgram API (Nova 2)
    ↓
Transcript text (string)
    ↓
Display in text area
    ↓
User clicks "Analyseer"
    ↓
POST /api/reports/classify { content: "..." }
    ↓
Claude API (classification prompt)
    ↓
{ type: "behandeladvies", confidence: 0.92 }
    ↓
Display classification + manual override option
    ↓
User confirms/overrides → clicks "Opslaan"
    ↓
POST /api/reports { patient_id, type, content, ai_confidence }
    ↓
Supabase INSERT INTO reports
    ↓
revalidatePath(/rapportage)
    ↓
Timeline view refreshes
```

---

## 3. Techstack Selectie

🎯 **Doel:** Onderbouwde keuze van technologieën.

| Component | Technologie | Versie | Argumentatie | Alternatieven |
|-----------|-------------|--------|--------------|---------------|
| **Frontend Framework** | Next.js | 14.2.18 | Al in gebruik, App Router, SSR, goede DX | Remix, SvelteKit |
| **React** | React | 18.3.1 | Ecosystem, team expertise, Server Components | Vue, Svelte |
| **UI Components** | shadcn/ui | Latest | Headless (Radix), customizable, TypeScript | MUI, Chakra UI |
| **Rich Text Editor** | TipTap | ^2.x | Al in gebruik (behandeladvies), extensible | Slate, Quill |
| **Styling** | TailwindCSS | ^3.4 | Utility-first, al in codebase | CSS Modules, styled-components |
| **Backend** | Next.js API Routes | 14.x | Co-located met frontend, TypeScript | Express, Fastify |
| **Database** | Supabase (PostgreSQL) | Latest | Al in gebruik, RLS, real-time, auth | PlanetScale, Neon |
| **ORM/Query** | Supabase JS Client | ^2.x | Type-safe, auto-generated types | Prisma, Drizzle |
| **Speech-to-Text** | Deepgram | Nova 2 | Laagste latency, Nederlands support, al geïntegreerd | OpenAI Whisper, Google Speech |
| **AI Classification** | Claude 3.5 Sonnet | 20250514 | Beste reasoning, Nederlands, geen training op data | GPT-4, Gemini |
| **Type Safety** | TypeScript | ^5.x | Al in gebruik, compile-time safety | Flow, JSDoc |
| **Validation** | Zod | ^3.x | Runtime validation, type inference | Yup, Joi |
| **Hosting** | Vercel | - | Zero-config Next.js, Edge Network | Netlify, Railway |

### Argumentatie per keuze

**Waarom Deepgram over OpenAI Whisper?**
- ✅ Lagere latency (real-time streaming mogelijk)
- ✅ Nederlands model specifiek getraind
- ✅ Al werkende implementatie in codebase
- ✅ Betere prijs/performance ratio
- ❌ Nadeel: Kleinere model dan Whisper-large

**Waarom Claude over GPT-4 voor classificatie?**
- ✅ Expliciete no-training guarantee (privacy)
- ✅ Betere reasoning voor Nederlandse tekst
- ✅ Lower cost voor korte classificatie taken
- ✅ Betere JSON compliance
- ❌ Nadeel: Kleinere context window (200K vs OpenAI's 128K)

**Waarom shadcn/ui over volledige component library?**
- ✅ Headless = volledige styling controle
- ✅ Copy-paste = geen dependency bloat
- ✅ Radix = accessibility out-of-the-box
- ✅ Tailwind integratie = consistent met codebase

---

## 4. Datamodel

🎯 **Doel:** Structuur van de data in de database.

### Primary Table: `reports`

**Locatie:** Supabase PostgreSQL
**Migratie bestand:** `supabase/migrations/[timestamp]_create_reports_table.sql`

```sql
-- Reports table voor Universele Rapportage
CREATE TABLE reports (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES practitioners(id) ON DELETE SET NULL,

  -- Content
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'behandeladvies',
    'vrije_notitie',
    'intake',          -- Week 3+
    'voortgang',       -- Week 3+
    'crisis',          -- Week 3+
    'contact'          -- Week 3+
  )),
  content TEXT NOT NULL CHECK (char_length(content) >= 20),

  -- AI Metadata
  ai_confidence DECIMAL(3,2) CHECK (ai_confidence >= 0.0 AND ai_confidence <= 1.0),
  ai_reasoning TEXT,

  -- Structured Data (Week 3+)
  structured_data JSONB DEFAULT '{}',
  -- Example: { "dsm_codes": ["F41.0"], "medication": ["Sertraline 50mg"] }

  -- Audio (Week 3+)
  audio_url TEXT,
  audio_duration_seconds INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  updated_by UUID REFERENCES practitioners(id),

  -- Versioning (Week 3+)
  version VARCHAR(10),
  parent_report_id UUID REFERENCES reports(id),

  -- Soft Delete
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT reports_content_length CHECK (char_length(content) <= 5000)
);

-- Indexes for Performance
CREATE INDEX idx_reports_patient_id ON reports(patient_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_reports_type ON reports(type)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_reports_created_at ON reports(created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_reports_created_by ON reports(created_by);

-- Composite index for patient timeline queries
CREATE INDEX idx_reports_patient_created ON reports(patient_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Full-text search index (Week 3+)
CREATE INDEX idx_reports_content_fts ON reports USING gin(to_tsvector('dutch', content))
  WHERE deleted_at IS NULL;

-- Row Level Security Policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see reports for their assigned patients
CREATE POLICY reports_select_policy ON reports
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE EXISTS (
        SELECT 1 FROM practitioner_patient_assignments
        WHERE practitioner_id = auth.uid()
        AND patient_id = patients.id
      )
    )
  );

-- Policy: Users can only create reports for their assigned patients
CREATE POLICY reports_insert_policy ON reports
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    patient_id IN (
      SELECT id FROM patients
      WHERE EXISTS (
        SELECT 1 FROM practitioner_patient_assignments
        WHERE practitioner_id = auth.uid()
        AND patient_id = patients.id
      )
    )
  );

-- Policy: Users can only update their own reports
CREATE POLICY reports_update_policy ON reports
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Policy: Users can only soft-delete their own reports
CREATE POLICY reports_delete_policy ON reports
  FOR UPDATE
  USING (created_by = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (deleted_at IS NOT NULL);

-- Comments for documentation
COMMENT ON TABLE reports IS 'Universal reporting system - AI-powered classification';
COMMENT ON COLUMN reports.type IS 'Report type: behandeladvies, vrije_notitie, etc.';
COMMENT ON COLUMN reports.ai_confidence IS 'AI classification confidence (0.0-1.0)';
COMMENT ON COLUMN reports.structured_data IS 'Extracted entities (DSM codes, medication, etc.)';
COMMENT ON COLUMN reports.audio_url IS 'Supabase Storage URL for audio recording';
```

### Supporting Types (TypeScript)

**Locatie:** `lib/types/report.ts`

```typescript
import { Database } from '@/lib/supabase/database.types';
import { z } from 'zod';

// Base report type from database
export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
export type ReportUpdate = Database['public']['Tables']['reports']['Update'];

// Report type enum
export const REPORT_TYPES = [
  'behandeladvies',
  'vrije_notitie',
  // Week 3+:
  // 'intake',
  // 'voortgang',
  // 'crisis',
  // 'contact'
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

// Zod validation schema for creating a report
export const CreateReportSchema = z.object({
  patient_id: z.string().uuid('Patient ID moet een geldige UUID zijn'),
  type: z.enum(REPORT_TYPES, {
    message: 'Type moet behandeladvies of vrije_notitie zijn',
  }),
  content: z
    .string()
    .min(20, 'Rapportage moet minimaal 20 karakters bevatten')
    .max(5000, 'Rapportage mag maximaal 5000 karakters bevatten'),
  ai_confidence: z.number().min(0).max(1).optional(),
  ai_reasoning: z.string().optional(),
});

export type CreateReportInput = z.infer<typeof CreateReportSchema>;

// AI Classification result
export interface ClassificationResult {
  type: ReportType;
  confidence: number; // 0.0 - 1.0
  reasoning?: string;
}

// Report list response
export interface ReportListResponse {
  reports: Report[];
  total: number;
}
```

### Entity Relationship Diagram

```
practitioners (auth.users)
      │
      │ created_by (FK)
      │
      ▼
   reports ◄────────────────┐
      │                     │
      │ patient_id (FK)     │ parent_report_id (FK, versioning)
      │                     │
      ▼                     │
   patients                 │
                            │
   reports ─────────────────┘
   (parent)
```

**Relaties:**
- `reports.patient_id` → `patients.id` (1:N)
- `reports.created_by` → `practitioners.id` (1:N)
- `reports.parent_report_id` → `reports.id` (1:1, self-referencing voor versioning)

---

## 5. API Ontwerp

🎯 **Doel:** Overzicht van belangrijkste endpoints.

### REST API Endpoints

| Endpoint | Method | Input | Output | Auth | Beschrijving |
|----------|--------|-------|--------|------|--------------|
| `/api/reports` | GET | `?patientId=uuid` | `ReportListResponse` | Required | Haal alle rapporten op voor patient |
| `/api/reports` | POST | `CreateReportInput` | `Report` | Required | Creëer nieuw rapport |
| `/api/reports/[reportId]` | GET | - | `Report` | Required | Haal specifiek rapport op |
| `/api/reports/[reportId]` | PATCH | `Partial<CreateReportInput>` | `Report` | Required | Update rapport |
| `/api/reports/[reportId]` | DELETE | - | `{ success: true }` | Required | Soft-delete rapport |
| `/api/reports/classify` | POST | `{ content: string }` | `ClassificationResult` | Required | AI classificatie |
| `/api/deepgram/transcribe` | POST | `FormData` (audio) | `{ transcript: string }` | Required | Speech-to-text (bestaand) |

### Detailed API Specifications

#### GET /api/reports

**Query Parameters:**
```typescript
{
  patientId: string; // UUID (required)
  type?: ReportType; // Filter by type (optional)
  limit?: number;    // Pagination (default: 50, max: 100)
  offset?: number;   // Pagination (default: 0)
}
```

**Response (200 OK):**
```json
{
  "reports": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "type": "behandeladvies",
      "content": "Op basis van...",
      "ai_confidence": 0.92,
      "ai_reasoning": "Bevat woorden: advies, traject",
      "created_at": "2024-11-23T14:30:00Z",
      "created_by": "uuid"
    }
  ],
  "total": 42
}
```

**Error Responses:**
- `400 Bad Request`: Missing patientId parameter
- `401 Unauthorized`: No valid session
- `403 Forbidden`: User not authorized for this patient
- `500 Internal Server Error`: Database error

#### POST /api/reports

**Request Body:**
```json
{
  "patient_id": "uuid",
  "type": "behandeladvies",
  "content": "Op basis van het intakegesprek...",
  "ai_confidence": 0.92,
  "ai_reasoning": "Bevat woorden: advies, traject, sessies"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "type": "behandeladvies",
  "content": "Op basis van het intakegesprek...",
  "ai_confidence": 0.92,
  "created_at": "2024-11-23T14:30:00Z",
  "created_by": "uuid"
}
```

**Validation:**
- Content length: 20-5000 characters
- Type: Must be in REPORT_TYPES enum
- Patient ID: Must exist and be accessible to user
- AI confidence: 0.0-1.0 (if provided)

#### POST /api/reports/classify

**Request Body:**
```json
{
  "content": "Op basis van het intakegesprek advies ik een CGT traject..."
}
```

**Response (200 OK):**
```json
{
  "type": "behandeladvies",
  "confidence": 0.92,
  "reasoning": "Tekst bevat behandeladviezen met concrete interventies en sessie aantallen"
}
```

**Error Handling:**
- `400 Bad Request`: Content too short (<20 chars)
- `429 Too Many Requests`: Rate limit exceeded (Claude API)
- `500 Internal Server Error`: AI API failure
- `503 Service Unavailable`: AI API timeout

**Fallback strategie:**
```typescript
try {
  const result = await classifyWithClaude(content);
  return result;
} catch (error) {
  // Fallback to 'vrije_notitie' met lage confidence
  return {
    type: 'vrije_notitie',
    confidence: 0.5,
    reasoning: 'AI classificatie niet beschikbaar, handmatig type kiezen aanbevolen'
  };
}
```

### Server Actions

**Locatie:** `app/epd/patients/[id]/rapportage/actions.ts`

```typescript
'use server';

import { createClient } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import type { Report, CreateReportInput } from '@/lib/types/report';

export async function getReports(patientId: string): Promise<Report[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw new Error('Kon rapporten niet ophalen');
  return data || [];
}

export async function createReport(input: CreateReportInput): Promise<Report> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reports')
    .insert({
      patient_id: input.patient_id,
      type: input.type,
      content: input.content,
      ai_confidence: input.ai_confidence,
      ai_reasoning: input.ai_reasoning,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/epd/patients/${input.patient_id}/rapportage`);
  revalidatePath(`/epd/patients/${input.patient_id}`);

  return data;
}

export async function deleteReport(
  patientId: string,
  reportId: string
): Promise<void> {
  const supabase = await createClient();

  // Soft delete
  const { error } = await supabase
    .from('reports')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', reportId);

  if (error) throw new Error(error.message);

  revalidatePath(`/epd/patients/${patientId}/rapportage`);
}
```

### Authentication & Authorization

**Mechanisme:** Supabase Auth (JWT)
- Session cookie: `sb-<project-ref>-auth-token`
- HTTP-only: Ja
- SameSite: Lax
- Secure: Ja (HTTPS only)

**Authorization Flow:**
1. User logged in via Supabase Auth
2. JWT token in cookie
3. API route extracts user ID: `auth.uid()`
4. RLS policies check patient access
5. Query succeeds/fails based on access

**CSRF Protection:**
- SameSite cookies (Lax)
- Next.js automatic CSRF tokens
- Vercel Edge Functions origin validation

---

## 6. Security & Compliance

🎯 **Doel:** Beschrijf security maatregelen en compliance vereisten.

### Security Checklist

- [x] **Authentication:** Supabase Auth (email/password, OAuth support)
- [x] **Authorization:** Row Level Security (RLS) policies op patient_id
- [x] **Data Encryption:**
  - At rest: PostgreSQL encryption (Supabase default)
  - In transit: HTTPS/TLS 1.3 (Vercel Edge)
- [x] **Input Validation:**
  - Zod schemas op alle endpoints
  - SQL injection: Prevented via Supabase parameterized queries
  - XSS: React auto-escapes, DOMPurify voor rich text
- [x] **Rate Limiting:**
  - Vercel Edge Functions: 100 req/min per IP
  - Claude API: SDK built-in retry logic
  - Deepgram: 150 concurrent requests limit
- [x] **CORS:** Restrictive origins (alleen eigen domein)
- [x] **Secrets Management:**
  - Environment variables (Vercel)
  - Niet in code gecommit
  - `.env.local` in `.gitignore`

### GDPR/AVG Compliance

**Data Minimalisatie:**
- Alleen noodzakelijke velden opgeslagen
- Geen audio opslag in Week 2 MVP (alleen transcript)
- Geen tracking/analytics op medische data

**Consent & Transparency:**
- User ziet AI classificatie (transparency)
- Manual override mogelijk (user control)
- Geen AI training op data (Claude/Deepgram contractueel)

**Right to Deletion:**
- Soft delete strategie (`deleted_at` timestamp)
- Hard delete na 30 dagen (Week 4 cron job)
- Cascade delete bij patient verwijdering

**Right to Data Portability:**
- JSON export functie (Week 4)
- Markdown export voor human-readable backup

**Data Processing Agreement:**
- **Deepgram:** EU data residency available, GDPR compliant
- **Claude (Anthropic):** Geen training op user data, SOC 2 Type II certified
- **Supabase:** EU hosting (Frankfurt/Amsterdam), GDPR compliant

### NEN7510 Overwegingen

**Voor zorginstellingen (GGZ):**

1. **Toegangscontrole:**
   - Practitioner kan alleen eigen patients zien (RLS)
   - Manager role: read-only access (Week 3)
   - Audit log voor data access (Week 4)

2. **Logging van Dossier Toegang:**
   ```sql
   -- Week 4: Audit trail table
   CREATE TABLE audit_logs (
     id UUID PRIMARY KEY,
     user_id UUID NOT NULL,
     resource_type TEXT,
     resource_id UUID,
     action TEXT, -- 'read', 'create', 'update', 'delete'
     timestamp TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. **Encryptie Gevoelige Velden:**
   - BSN: Al encrypted in `patients` table
   - Rapport content: Encrypted at rest (PostgreSQL)
   - Audio files (Week 3): Supabase Storage encryption

4. **Bewaartermijnen:**
   - Rapporten: 15 jaar (NEN7510 richtlijn)
   - Soft delete: 30 dagen herstel periode
   - Hard delete: Na 15 jaar via retention policy

### Privacy by Design Principles

1. **Proactive not Reactive:**
   - RLS vanaf dag 1
   - Soft delete defaults
   - Audit logging architecture

2. **Privacy as Default:**
   - Minimale data storage
   - Geen cookies buiten auth
   - Opt-in voor audio opslag

3. **Embedded into Design:**
   - RLS policies = database level
   - Type-safe queries = minder bugs
   - Validatie = server + client

---

## 7. AI/LLM Integratie

🎯 **Doel:** Technische details van AI-gebruik.

### Speech-to-Text: Deepgram Nova 2

**Model:** `nova-2` (latest general model)
**Language:** `nl` (Nederlands)
**API Endpoint:** `https://api.deepgram.com/v1/listen`

**Existing Implementation:**
```typescript
// app/api/deepgram/transcribe/route.ts (already exists)
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const audioFile = formData.get('audio') as File;

  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

  const response = await fetch('https://api.deepgram.com/v1/listen', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${deepgramApiKey}`,
      'Content-Type': audioFile.type, // audio/webm
    },
    body: await audioFile.arrayBuffer(),
  });

  const data = await response.json();
  const transcript = data.results?.channels[0]?.alternatives[0]?.transcript || '';

  return NextResponse.json({ transcript });
}
```

**Configuration:**
- **Tier:** Pay-as-you-go (no subscription)
- **Pricing:** ~€0.0048 per minuut audio (Nova 2 model)
- **Latency:** ~500ms voor 30 sec audio
- **Accuracy:** 85-90% voor Nederlands (algemeen)

**Error Handling:**
```typescript
// components/speech-recorder.tsx
try {
  const response = await fetch('/api/deepgram/transcribe', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Deepgram error: ${response.status}`);
  }

  const { transcript } = await response.json();
  onTranscript(transcript);
} catch (error) {
  console.error('Transcription failed:', error);
  setError('Spraakherkenning mislukt. Probeer opnieuw of typ handmatig.');
}
```

### AI Classification: Claude 3.5 Sonnet

**Model:** `claude-sonnet-4-20250514`
**API Endpoint:** `https://api.anthropic.com/v1/messages`
**Library:** `@anthropic-ai/sdk`

**Implementation:**
```typescript
// app/api/reports/classify/route.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      temperature: 0.0, // Deterministic for classification
      system: CLASSIFICATION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Classificeer de volgende rapportage:\n\n${content}`,
        },
      ],
    });

    const responseText = message.content[0].text;
    const result = JSON.parse(responseText) as ClassificationResult;

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

**Classification Prompt:**
```typescript
const CLASSIFICATION_SYSTEM_PROMPT = `
Je bent een classificatie-assistent voor een GGZ EPD-systeem.

Je taak is om rapportages te classificeren als één van deze types:

**behandeladvies**:
- Bevat een concreet behandelplan, voorstel of advies
- Noemt behandeldoelen, interventies, aanpak, of aantal sessies
- Signaalwoorden: "advies", "stel voor", "plan", "traject", "sessies", "behandeling", "interventie"
- Voorbeelden:
  * "Ik stel voor een CGT traject van 12 sessies"
  * "Behandelplan: focus op angstreductie via exposure"
  * "Advies: start met psycho-educatie, evaluatie na 6 weken"

**vrije_notitie**:
- Alles wat NIET duidelijk een behandeladvies is
- Algemene observaties, opmerkingen, aantekeningen
- Administratieve notities (afspraak verzetten, telefoontje)
- Informele updates zonder concreet plan
- Voorbeelden:
  * "Telefonisch contact, afspraak verzet naar donderdag"
  * "Cliënt was opgeruimd en gemotiveerd"
  * "Korte check-in, geen bijzonderheden"

Return ALLEEN valid JSON in dit exacte format (geen markdown, geen extra tekst):
{
  "type": "behandeladvies" | "vrije_notitie",
  "confidence": 0.0 - 1.0,
  "reasoning": "Korte uitleg waarom (1-2 zinnen)"
}

Wees streng: alleen duidelijke behandeladviezen met concrete plannen krijgen type "behandeladvies".
Bij twijfel, kies "vrije_notitie" met confidence < 0.7.
`;
```

**Confidence Thresholds:**
```typescript
// Client-side interpretation
function interpretConfidence(confidence: number) {
  if (confidence >= 0.85) {
    return {
      level: 'high',
      message: '✓ AI is zeer zeker'
    };
  } else if (confidence >= 0.70) {
    return {
      level: 'medium',
      message: '⚠️ AI is redelijk zeker, controleer type'
    };
  } else {
    return {
      level: 'low',
      message: '❌ AI is onzeker, kies handmatig een type'
    };
  }
}
```

### Cost Management

**Deepgram:**
- Pricing: ~€0.0048/min voor Nova 2
- Estimate: 100 rapportages/maand @ 1 min = €0.48/maand
- Safety: Max 5 min recording limit (client-side)

**Claude:**
- Pricing: $3/MTok input, $15/MTok output (Claude Sonnet 4.5)
- Average classification:
  - Input: ~200 tokens (system + user content)
  - Output: ~50 tokens (JSON response)
  - Cost: ~$0.0009 per classificatie
- Estimate: 100 classificaties/maand = €0.09/maand

**Total AI cost estimate:** ~€0.60/maand voor 100 rapportages

**Optimalisaties:**
- Cache identical prompts (client-side deduplication)
- Rate limiting (max 10 classificaties/min per user)
- Fallback to manual selection if API fails

### Monitoring & Quality

**Metrics to track:**
- AI classification accuracy (user overrides = incorrect)
- Response times (p50, p95, p99)
- Error rates per API
- Cost per day/week/month

**Quality Assurance (Week 4):**
- User feedback loop: "Was deze classificatie correct?"
- Dashboard met accuracy metrics
- A/B testing verschillende prompts

---

## 8. Performance & Scalability

🎯 **Doel:** Hoe schaalt het systeem bij groei?

### Performance Targets

| Metric | Target | Measured At |
|--------|--------|-------------|
| **Page Load** | < 2 sec | First Contentful Paint |
| **Modal Open** | < 100 ms | Button click → Modal visible |
| **API Response (GET reports)** | < 500 ms | p95 |
| **API Response (POST report)** | < 800 ms | p95 (incl. DB write) |
| **Deepgram Transcribe** | < 2 sec | p95 voor 30 sec audio |
| **Claude Classify** | < 3 sec | p95 |
| **Timeline Render** | < 200 ms | 50 reports |

### Caching Strategie

**Client-Side:**
```typescript
// Next.js App Router caching
export const revalidate = 60; // Revalidate every 60 seconds

// React Server Components
async function ReportTimeline({ patientId }: Props) {
  const reports = await getReports(patientId); // Cached via RSC
  // ...
}
```

**API Response Caching:**
```typescript
// app/api/reports/route.ts
export async function GET(request: NextRequest) {
  const response = NextResponse.json(data);

  // Cache for 1 minute
  response.headers.set(
    'Cache-Control',
    'private, max-age=60, stale-while-revalidate=120'
  );

  return response;
}
```

**Database Query Optimization:**
```sql
-- Index usage for timeline query
EXPLAIN ANALYZE
SELECT * FROM reports
WHERE patient_id = 'uuid'
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 50;

-- Expected: Index Scan using idx_reports_patient_created
-- Execution time: < 10ms
```

### Scalability Strategie

**Horizontal Scaling:**
- **Frontend:** Vercel Edge Network (auto-scales, global CDN)
- **Backend:** Serverless functions (Vercel Functions, auto-scale to 0)
- **Database:** Supabase (connection pooling, read replicas for >10K users)

**Vertical Scaling:**
- **Database:** Supabase Pro tier (4GB RAM → 8GB if needed)
- **API Routes:** Vercel Pro (longer execution time if needed)

**Load Testing Targets:**
- 100 concurrent users
- 1000 reports created/day
- 10,000 reports in database
- Sub-second response times maintained

### Lazy Loading & Pagination

**Timeline Pagination:**
```typescript
// app/epd/patients/[id]/rapportage/page.tsx
export default async function RapportagePage({
  params,
  searchParams
}: Props) {
  const page = parseInt(searchParams.page || '1');
  const limit = 50;
  const offset = (page - 1) * limit;

  const reports = await getReports(params.id, { limit, offset });

  return (
    <>
      <ReportTimeline reports={reports} />
      <Pagination currentPage={page} total={reports.total} />
    </>
  );
}
```

**Infinite Scroll (Week 3 alternative):**
```typescript
// Client component met react-query
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['reports', patientId],
  queryFn: ({ pageParam = 0 }) => getReports(patientId, { offset: pageParam }),
  getNextPageParam: (lastPage, allPages) => {
    return allPages.length * 50;
  },
});
```

---

## 9. Deployment & CI/CD

🎯 **Doel:** Hoe wordt het systeem gedeployed en getest?

### Omgevingen

| Omgeving | URL | Branch | Database | Doel |
|----------|-----|--------|----------|------|
| **Development** | `localhost:3000` | feature/* | Local Supabase (optioneel) | Lokale dev |
| **Preview** | `*-git-*.vercel.app` | PR branches | Staging DB | PR reviews |
| **Production** | `mini-epd.vercel.app` | main | Production DB | Live app |

### CI/CD Pipeline

```
Developer commits → GitHub
    ↓
GitHub Actions Trigger
    ↓
┌─────────────────────┐
│   Build & Test      │
│ - npm run lint      │
│ - npm run type-check│
│ - npm run build     │
└─────────────────────┘
    ↓
┌─────────────────────┐
│   Vercel Deploy     │
│ - Preview (PR)      │
│ - Production (main) │
└─────────────────────┘
    ↓
┌─────────────────────┐
│   Post-Deploy       │
│ - Run migrations    │
│ - Smoke tests       │
│ - Update changelog  │
└─────────────────────┘
```

### Deployment Checklist

**Pre-Deploy:**
- [ ] Environment variables set (Vercel dashboard)
  - `DEEPGRAM_API_KEY`
  - `ANTHROPIC_API_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Database migrations dry-run (staging)
- [ ] Type generation updated (`npx supabase gen types typescript`)
- [ ] Build succeeds locally (`pnpm build`)
- [ ] No TypeScript errors (`pnpm type-check`)

**Deploy:**
- [ ] Merge PR to main
- [ ] Vercel auto-deploys
- [ ] Run migrations: `npx supabase db push` (production)
- [ ] Verify migration success (Supabase dashboard)

**Post-Deploy:**
- [ ] Smoke test: Create report via UI
- [ ] Check Deepgram transcription works
- [ ] Check Claude classification works
- [ ] Monitor Sentry for errors (first 10 min)
- [ ] Update changelog in `/docs/CHANGELOG.md`

### Database Migrations

**Workflow:**
```bash
# 1. Create migration locally
npx supabase migration new create_reports_table

# 2. Write SQL in generated file
# supabase/migrations/[timestamp]_create_reports_table.sql

# 3. Apply to local DB (if running)
npx supabase db reset

# 4. Test migration
npm run dev
# Test creating reports

# 5. Generate updated types
npx supabase gen types typescript --linked > lib/supabase/database.types.ts

# 6. Commit migration file
git add supabase/migrations/[timestamp]_create_reports_table.sql
git add lib/supabase/database.types.ts
git commit -m "feat: add reports table migration"

# 7. Push to remote (Vercel auto-deploys)
git push origin main

# 8. Apply to production DB
npx supabase db push --linked
```

**Rollback Strategy:**
```sql
-- Always include rollback SQL in migration comments
-- Migration: create_reports_table.sql

-- UP
CREATE TABLE reports (...);

-- DOWN (rollback)
-- DROP TABLE IF EXISTS reports CASCADE;
-- Run manually if needed: npx supabase db execute --file rollback.sql
```

---

## 10. Monitoring & Logging

🎯 **Doel:** Hoe monitoren we het systeem in productie?

### Tools

| Tool | Purpose | Setup |
|------|---------|-------|
| **Vercel Analytics** | Traffic, performance, Web Vitals | Built-in (free tier) |
| **Vercel Logs** | Server-side logs, API errors | Built-in |
| **Supabase Logs** | Database queries, RLS denials | Supabase Dashboard |
| **Sentry** (Week 3) | Error tracking, stack traces | SDK integration |
| **LogRocket** (Week 4) | Session replay, user behavior | SDK integration |

### Key Metrics

**Application Health:**
- ✅ Uptime: 99.9% target (Vercel SLA)
- ✅ Error rate: < 1% of requests
- ✅ API response time: p95 < 1 sec

**AI Performance:**
- ✅ Deepgram success rate: > 98%
- ✅ Claude classification accuracy: > 85% (based on user overrides)
- ✅ AI response time: p95 < 3 sec

**User Engagement (Week 3):**
- Reports created per day
- Voice vs manual text ratio
- Classification override rate (= AI inaccuracy)

### Logging Strategy

**Server-Side Logging:**
```typescript
// app/api/reports/classify/route.ts
export async function POST(request: NextRequest) {
  console.log('[Classify] Request received', {
    contentLength: content.length,
    timestamp: new Date().toISOString(),
  });

  try {
    const result = await classifyWithClaude(content);

    console.log('[Classify] Success', {
      type: result.type,
      confidence: result.confidence,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Classify] Error', {
      error: error.message,
      stack: error.stack,
    });

    // Fallback
    return NextResponse.json(fallbackResult);
  }
}
```

**Client-Side Error Tracking (Week 3):**
```typescript
// app/providers.tsx
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
});
```

### Alerts & Notifications (Week 4)

**Alert Triggers:**
- Error rate > 5% (15 min window)
- API response time > 5 sec (p95)
- Deepgram API failures > 10/hour
- Claude API failures > 10/hour

**Notification Channels:**
- Email: Developer inbox
- Slack: #alerts channel (if team)
- Vercel dashboard: Built-in alerts

---

## 11. Risico's & Technische Mitigatie

🎯 **Doel:** Technische risico's vroegtijdig identificeren.

| Risico | Impact | Waarschijnlijkheid | Mitigatie | Status |
|--------|--------|-------------------|-----------|--------|
| **Deepgram API down** | Hoog | Laag | Fallback: Manual text input, geen voice | ✅ Implemented |
| **Claude API down** | Hoog | Laag | Fallback: Default to 'vrije_notitie', manual override | ✅ Implemented |
| **Database overload** | Hoog | Laag | Connection pooling (Supabase), indexes, pagination | ✅ Implemented |
| **Cost overrun (AI)** | Middel | Middel | Rate limiting, token limits, monitoring dashboard | ⚠️ Week 3 |
| **Privacy breach** | Kritiek | Laag | RLS policies, input validation, audit logs, encryption | ✅ Implemented |
| **Incorrect AI classification** | Middel | Middel | Manual override, user feedback, prompt tuning | ✅ Implemented |
| **Poor voice recognition (Nederlands)** | Middel | Middel | Manual text fallback, user can edit transcript | ✅ Implemented |
| **Browser compatibility (MediaRecorder)** | Laag | Laag | Feature detection, graceful degradation to text-only | ⚠️ Week 3 |
| **Vendor lock-in (Supabase)** | Laag | Laag | Abstract DB layer, SQL migrations portable | ⏭️ Future |

### Detailed Mitigation Plans

#### AI API Failures

**Scenario:** Deepgram or Claude API is down or times out.

**Detection:**
```typescript
const TIMEOUT_MS = 5000;

const fetchWithTimeout = async (url: string, options: any) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};
```

**Fallback:**
- Deepgram failure → Show manual text input, hide voice button
- Claude failure → Default to 'vrije_notitie', show warning message

**User Messaging:**
```typescript
const ERROR_MESSAGES = {
  deepgram: 'Spraakherkenning tijdelijk niet beschikbaar. Typ je rapportage handmatig.',
  claude: 'AI classificatie niet beschikbaar. Kies handmatig een type uit de dropdown.',
  network: 'Netwerkfout. Controleer je internetverbinding.',
};
```

#### Cost Overrun Prevention

**Rate Limiting (per user):**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

export async function checkRateLimit(userId: string) {
  const { success, remaining } = await ratelimit.limit(userId);
  if (!success) {
    throw new Error('Rate limit exceeded. Probeer over 1 minuut opnieuw.');
  }
  return remaining;
}
```

**Cost Monitoring Dashboard (Week 4):**
- Deepgram: Track minutes used per day
- Claude: Track tokens used per day
- Alert when daily spend > €5

---

## 12. Bijlagen & Referenties

🎯 **Doel:** Linken naar tech docs en tooling.

### Projectdocumenten

**Interne docs:**
- [FO Universele Rapportage v1.0](./fo-universele-rapportage-v1.md) - Functioneel ontwerp
- [PRD v1.2](../prd-mini-ecd-v1_2.md) - Product requirements (indien bestaat)
- [Bouwplan v1.1](../UI/bouwplan-mini-epd-v1.0.md) - Development roadmap
- [Migration Plan](../../migratie-clients-naar-patients.md) - Patients module migration

### Tech Documentatie

**Core Stack:**
- Next.js: https://nextjs.org/docs
- React: https://react.dev/reference/react
- TypeScript: https://www.typescriptlang.org/docs
- TailwindCSS: https://tailwindcss.com/docs

**Database & Auth:**
- Supabase: https://supabase.com/docs
- PostgreSQL: https://www.postgresql.org/docs
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security

**AI Services:**
- Deepgram API: https://developers.deepgram.com/docs
- Claude API: https://docs.anthropic.com/claude/reference
- Anthropic SDK: https://github.com/anthropics/anthropic-sdk-typescript

**UI Libraries:**
- shadcn/ui: https://ui.shadcn.com
- Radix UI: https://www.radix-ui.com/primitives/docs
- TipTap: https://tiptap.dev/docs/editor/introduction

**Deployment:**
- Vercel: https://vercel.com/docs
- Vercel CLI: https://vercel.com/docs/cli

### Code Repositories

**Main Repository:**
- GitHub: `/home/colin/development/15-mini-epd-prototype`
- Branch: `main` (production)
- Feature branches: `feature/universele-rapportage`

**Key Directories:**
```
/app/epd/patients/[id]/rapportage/   - Rapportage module
/app/api/reports/                     - API routes
/components/speech-recorder.tsx       - Reusable voice component
/lib/types/report.ts                  - TypeScript types
/supabase/migrations/                 - Database migrations
/docs/specs/universele-rapportage/    - This document
```

### Environment Variables

**Required for deployment:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Server-side only

# AI Services
DEEPGRAM_API_KEY=... # Speech-to-text
ANTHROPIC_API_KEY=sk-ant-... # Claude classification

# Optional (Week 3+)
SENTRY_DSN=https://...  # Error tracking
UPSTASH_REDIS_REST_URL=https://... # Rate limiting
```

---

## 13. Implementatie Planning

🎯 **Doel:** Stapsgewijze implementatie roadmap.

### Week 2 MVP Scope

**Fase 1: Foundation (3 uur)**
- [x] Refactor `speech-recorder.tsx` naar `/components/`
- [ ] Create `reports` table migration
- [ ] Install Shadcn Dialog, Toast components
- [ ] Add `DEEPGRAM_API_KEY` to `.env.local`

**Fase 2: Backend (4 uur)**
- [ ] Create `/api/reports/route.ts` (GET, POST)
- [ ] Create `/api/reports/[reportId]/route.ts` (GET, PATCH, DELETE)
- [ ] Create `/api/reports/classify/route.ts` (Claude integration)
- [ ] Create server actions in `rapportage/actions.ts`
- [ ] Add RLS policies for reports table

**Fase 3: UI Components (5 uur)**
- [ ] Update `rapportage/page.tsx` (timeline view)
- [ ] Create `rapportage-modal.tsx` component
- [ ] Create `report-timeline.tsx` component
- [ ] Create `report-card.tsx` component
- [ ] Add "Nieuwe Rapportage" button to patient layout

**Fase 4: Integration & Testing (3 uur)**
- [ ] Wire up modal to API routes
- [ ] Test voice → transcript → classify → save flow
- [ ] Test manual text input flow
- [ ] Test timeline display & CRUD operations
- [ ] Error handling & loading states

**Totaal: 15 uur (Week 2 MVP)**

### Week 3+ Roadmap

**Structured Data Extraction:**
- Extract DSM codes from behandeladvies
- Extract medication names
- Parse dates and deadlines

**Enhanced Voice:**
- Real-time streaming (Deepgram WebSocket)
- Audio playback of recordings
- Supabase Storage for audio files

**Timeline Enhancements:**
- Filtering by type, date range
- Search in content (full-text search)
- Export to PDF/Markdown

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 23-11-2024 | Colin van der Heijden | Initiële versie - Week 2 MVP scope |

---

**Einde Technisch Ontwerp - Universele Rapportage Functie**
