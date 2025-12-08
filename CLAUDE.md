# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mini-EPD Prototype - A Dutch electronic patient dossier (EPD) system for healthcare providers. Built with Next.js 14 App Router, Supabase (PostgreSQL + Auth), and Tailwind CSS. Primary language is Dutch for UI text.

## Development Commands

```bash
pnpm dev              # Development server at localhost:3000
pnpm build            # Production build (fails on type errors)
pnpm lint             # ESLint check
pnpm types:generate   # Regenerate Supabase types after schema changes
```

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `ANTHROPIC_API_KEY` - Claude API for AI features
- `DEEPGRAM_API_KEY` - Deepgram for speech-to-text

## Architecture

### Data Layer
- **Supabase** for PostgreSQL database and authentication
- **FHIR-inspired** data model: patients, observations, conditions, encounters
- **Row Level Security (RLS)** on all tables - check policies before writing queries
- Types generated to `lib/supabase/database.types.ts`
- Server client: `lib/auth/server.ts` (for Server Components/API routes)
- Client: `lib/supabase/client.ts` (for Client Components)

### API Structure (`app/api/`)
- `/api/reports` - Unified CRUD for all report types (verpleegkundig, observatie, incident, etc.)
- `/api/overdracht` - Handover data: patients, patient details, AI summary generation
- `/api/verpleegrapportage` - Patient data for nursing report views
- `/api/behandelplan` - Treatment plan management

**API Route Pattern**: All routes use Zod validation, return Dutch error messages, and get the current user via `createClient()` from `lib/auth/server.ts`.

### EPD Modules (`app/epd/`)
- `/epd/verpleegrapportage` - Overdracht overzicht (patiënten met AI-samenvatting)
- `/epd/verpleegrapportage/rapportage` - Rapportage invoer workspace (timeline view)
- `/epd/patients/[id]` - Patient dossier with intakes, conditions, observations
- `/epd/agenda` - Appointment calendar (FullCalendar)
- `/epd/clients` - Client management

### Key Patterns

**Report Types** (stored in `reports` table):
```typescript
type ReportType = 'voortgang' | 'observatie' | 'incident' | 'medicatie' |
                  'contact' | 'crisis' | 'intake' | 'behandeladvies' |
                  'vrije_notitie' | 'verpleegkundig';
```

**Verpleegkundig Categories** (in `structured_data.category`):
```typescript
type Category = 'medicatie' | 'adl' | 'gedrag' | 'incident' | 'observatie';
```

**Shift Date Logic**: Reports created before 07:00 are assigned to the previous day's shift.

**Soft Delete**: Reports use `deleted_at` timestamp, not hard delete.

### AI Integration
- Claude API for generating handover summaries (`/api/overdracht/generate`)
- Deepgram for speech-to-text (`/api/deepgram`)
- AI responses validated with Zod schemas

### UI Components
- shadcn/ui components in `components/ui/`
- Lucide React for icons
- date-fns with Dutch locale for date formatting
- Timeline views grouped by day and day-part (nacht/ochtend/middag/avond)

## Database Migrations

Located in `supabase/migrations/`. Migration naming: `YYYYMMDD_description.sql`

After schema changes:
1. Create migration file in `supabase/migrations/`
2. Apply with Supabase CLI or dashboard
3. Run `pnpm types:generate` to update TypeScript types

## Type System

- `lib/supabase/database.types.ts` - Auto-generated from Supabase schema (do not edit)
- `lib/types/*.ts` - Manual type definitions that extend/refine generated types

## Documentation

- Specs in `docs/specs/` organized by module
- Release notes in `docs/releasenotes/`
