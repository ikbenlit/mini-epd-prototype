# ⚙️ Technisch Ontwerp (TO) – Agenda Module

**Projectnaam:** Mini-EPD Agenda Module
**Versie:** v1.0
**Datum:** 02-12-2024
**Auteur:** Colin

---

## 1. Doel en relatie met PRD en FO

🎯 **Doel van dit document:**
Het Technisch Ontwerp beschrijft **hoe** de Agenda Module technisch wordt geïmplementeerd. Dit document vertaalt de functionele specificaties uit het FO naar concrete technische oplossingen, architectuur en implementatiedetails.

📘 **Document hiërarchie:**
```
PRD (Wat & Waarom) → FO (Hoe functioneel) → TO (Hoe technisch)
```

**Referenties:**
- PRD: `prd-agenda-module-v1_0.md` — Scope, user stories, success criteria
- FO: `fo-agenda-module-v1_0.md` — Functionele werking, UX, flows
- Bestaande codebase: `/home/colin/development/15-mini-epd-prototype`

**Scope:**
- MVP implementatie van agenda module
- Integratie met bestaande EPD modules (patients, rapportage)
- FullCalendar integratie
- FHIR-compliant data model (Encounter resource)

---

## 2. Technische Architectuur Overzicht

🎯 **Doel:** Globaal beeld van de systeemarchitectuur.

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js 14 (App Router)                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │   │
│  │  │ EPD Layout  │  │   Agenda    │  │   Shared Components     │  │   │
│  │  │  + Sidebar  │  │   Module    │  │  (shadcn/ui, forms)     │  │   │
│  │  └─────────────┘  └──────┬──────┘  └─────────────────────────┘  │   │
│  │                          │                                       │   │
│  │                   ┌──────┴──────┐                                │   │
│  │                   │ FullCalendar│                                │   │
│  │                   │   React     │                                │   │
│  │                   └─────────────┘                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │     API Layer           │
                    │  (Next.js API Routes    │
                    │   + Server Actions)     │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Supabase    │      │   Supabase      │      │   Deepgram      │
│   PostgreSQL  │      │   Auth          │      │   (Audio→Text)  │
│   (Data)      │      │   (Identity)    │      │                 │
└───────────────┘      └─────────────────┘      └─────────────────┘
```

### 2.2 Agenda Module Architecture

```
app/epd/agenda/
├── page.tsx                      # Server Component - data fetching
├── layout.tsx                    # Optional: agenda-specific layout
├── loading.tsx                   # Suspense fallback
├── error.tsx                     # Error boundary
│
├── components/
│   ├── calendar-view.tsx         # FullCalendar wrapper (Client)
│   ├── calendar-toolbar.tsx      # Navigation, view switcher
│   ├── appointment-modal.tsx     # Create/Edit form (Client)
│   ├── appointment-detail.tsx    # Popup/popover detail view
│   ├── conflict-dialog.tsx       # Double booking warning
│   ├── patient-search.tsx        # Autocomplete combobox
│   └── appointment-card.tsx      # Event rendering in calendar
│
├── hooks/
│   ├── use-appointments.ts       # Data fetching hook (SWR/React Query)
│   ├── use-appointment-mutations.ts  # Create/Update/Delete
│   └── use-conflict-check.ts     # Real-time conflict detection
│
├── lib/
│   ├── calendar-config.ts        # FullCalendar configuration
│   ├── appointment-utils.ts      # Date/time helpers
│   └── conflict-detection.ts     # Overlap logic
│
├── actions.ts                    # Server Actions (mutations)
└── types.ts                      # Module-specific types
```

### 2.3 Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CREATE APPOINTMENT FLOW                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. User clicks time slot                                           │
│     │                                                                │
│     ▼                                                                │
│  2. Modal opens (Client Component)                                  │
│     │                                                                │
│     ▼                                                                │
│  3. User fills form + patient search                                │
│     │                                                                │
│     ├──► Patient Search API (/api/patients/search)                  │
│     │         │                                                      │
│     │         ▼                                                      │
│     │    Supabase Query (patients table)                            │
│     │         │                                                      │
│     │         ▼                                                      │
│     │    Return patient list                                        │
│     │                                                                │
│     ▼                                                                │
│  4. User clicks "Save"                                              │
│     │                                                                │
│     ▼                                                                │
│  5. Client-side validation (Zod)                                    │
│     │                                                                │
│     ▼                                                                │
│  6. Conflict check (Server Action)                                  │
│     │                                                                │
│     ├──► No conflict ──► Create appointment                         │
│     │                         │                                      │
│     │                         ▼                                      │
│     │                    Supabase INSERT (encounters)               │
│     │                         │                                      │
│     │                         ▼                                      │
│     │                    Optimistic UI update                       │
│     │                         │                                      │
│     │                         ▼                                      │
│     │                    Toast: "Afspraak opgeslagen"               │
│     │                                                                │
│     └──► Conflict ──► Show Conflict Dialog                          │
│              │                                                       │
│              ├──► "Wijzigen" ──► Back to form                       │
│              │                                                       │
│              └──► "Toch inplannen" ──► Create with flag             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Techstack Selectie

🎯 **Doel:** Onderbouwde keuze van technologieën.

### 3.1 Core Stack (Bestaand)

| Component | Technologie | Versie | Argumentatie |
|-----------|-------------|--------|--------------|
| **Framework** | Next.js | 14.2.18 | Bestaande codebase, App Router, Server Components |
| **Runtime** | React | 18.3.1 | Bestaande codebase |
| **Language** | TypeScript | ^5 | Type safety, bestaande patterns |
| **Database** | Supabase PostgreSQL | - | Bestaande infra, RLS, realtime |
| **Auth** | Supabase Auth | ^0.7.0 | Bestaande implementatie |
| **Styling** | TailwindCSS | ^3.4.18 | Bestaande design system |
| **UI Components** | shadcn/ui | - | Bestaande component library |
| **Forms** | React Hook Form | ^7.66.1 | Bestaande pattern |
| **Validation** | Zod | ^4.1.12 | Bestaande pattern |
| **Date Handling** | date-fns | ^4.1.0 | Bestaande utility |

### 3.2 Nieuwe Dependencies (Agenda-specifiek)

| Component | Technologie | Versie | Argumentatie | Alternatieven |
|-----------|-------------|--------|--------------|---------------|
| **Calendar** | FullCalendar | ^6.1.x | Feature-rijk, React support, drag-drop | react-big-calendar, custom |
| **FC Core** | @fullcalendar/core | ^6.1.x | Base package | - |
| **FC React** | @fullcalendar/react | ^6.1.x | React wrapper | - |
| **FC DayGrid** | @fullcalendar/daygrid | ^6.1.x | Month/week grid view | - |
| **FC TimeGrid** | @fullcalendar/timegrid | ^6.1.x | Day/week time view | - |
| **FC Interaction** | @fullcalendar/interaction | ^6.1.x | Drag-drop, resize | - |
| **Data Fetching** | SWR | ^2.x | Caching, revalidation, optimistic | React Query |

### 3.3 Package Installation

```bash
# FullCalendar packages
pnpm add @fullcalendar/core @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction

# Data fetching (optional, can use existing pattern)
pnpm add swr
```

### 3.4 Techstack Decision: FullCalendar

**Waarom FullCalendar:**
- ✅ Mature library (10+ jaar development)
- ✅ Comprehensive API voor alle agenda features
- ✅ Built-in drag-drop met event resizing
- ✅ Mobile-responsive out of the box
- ✅ Goede TypeScript support
- ✅ Styling customizable via CSS variables
- ✅ Grote community, veel voorbeelden

**Risico's & Mitigatie:**
| Risico | Mitigatie |
|--------|-----------|
| Styling conflicts met Tailwind | CSS isolation, custom CSS variables |
| Bundle size (~200KB) | Tree-shaking, alleen noodzakelijke plugins |
| Learning curve | Spike in week 1, prototype first |

---

## 4. Datamodel

🎯 **Doel:** Structuur van de data in de database.

### 4.1 Bestaande Tabel: `encounters`

De `encounters` tabel bestaat al en is FHIR-compliant. We gebruiken deze voor afspraken.

```sql
-- Bestaande tabel structuur (uit database.types.ts)
CREATE TABLE encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relaties
  patient_id UUID NOT NULL REFERENCES patients(patient_id),
  practitioner_id UUID REFERENCES practitioners(practitioner_id),
  intake_id UUID REFERENCES intakes(id),
  intake_note_id UUID REFERENCES intake_notes(id),
  organization_id UUID REFERENCES organizations(id),

  -- Timing (FHIR Period)
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ,

  -- Classification (FHIR Coding)
  class_code TEXT,           -- 'AMB' (ambulatory), 'VR' (virtual)
  class_display TEXT,
  type_code TEXT,            -- 'intake', 'treatment', 'followup'
  type_display TEXT,         -- 'Intakegesprek', 'Behandeling', 'Follow-up'

  -- Status (FHIR enum)
  status encounter_status NOT NULL DEFAULT 'planned',
  -- Values: planned, in-progress, on-hold, completed, cancelled (actual DB enum)

  -- Priority (optional)
  priority_code TEXT,
  priority_display TEXT,

  -- Reason (array for multiple reasons)
  reason_code TEXT[],
  reason_display TEXT[],

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  identifier TEXT            -- External identifier if needed
);

-- Indexes for performance
CREATE INDEX idx_encounters_patient ON encounters(patient_id);
CREATE INDEX idx_encounters_practitioner ON encounters(practitioner_id);
CREATE INDEX idx_encounters_period ON encounters(period_start, period_end);
CREATE INDEX idx_encounters_status ON encounters(status);
```

### 4.2 Nieuw: Encounter-Report Linking (E0 Migration)

```sql
-- Migration: Add encounter_id to reports table
ALTER TABLE reports
ADD COLUMN encounter_id UUID REFERENCES encounters(id);

-- Index for quick lookups
CREATE INDEX idx_reports_encounter ON reports(encounter_id);

-- Optional: Backfill existing reports based on matching dates/patients
-- (Post-MVP task)
```

### 4.3 Type Definitions

```typescript
// lib/types/encounter.ts

import { z } from 'zod';
import type { Database } from '@/lib/supabase/database.types';

// Base types from database
export type Encounter = Database['public']['Tables']['encounters']['Row'];
export type EncounterInsert = Database['public']['Tables']['encounters']['Insert'];
export type EncounterUpdate = Database['public']['Tables']['encounters']['Update'];
export type EncounterStatus = Database['public']['Enums']['encounter_status'];

// Appointment types (subset of FHIR encounter types for GGZ)
export const AppointmentType = {
  INTAKE: 'intake',
  TREATMENT: 'treatment',
  FOLLOWUP: 'followup',
} as const;

export type AppointmentTypeValue = typeof AppointmentType[keyof typeof AppointmentType];

export const AppointmentTypeDisplay: Record<AppointmentTypeValue, string> = {
  intake: 'Intakegesprek',
  treatment: 'Behandeling',
  followup: 'Follow-up',
};

export const AppointmentTypeDuration: Record<AppointmentTypeValue, number> = {
  intake: 60,
  treatment: 45,
  followup: 30,
};

// Zod Schemas for validation
export const CreateAppointmentSchema = z.object({
  patient_id: z.string().uuid('Patient ID moet een geldige UUID zijn'),
  period_start: z.string().datetime('Ongeldige datum/tijd'),
  duration_minutes: z.number().min(15).max(120),
  type_code: z.enum(['intake', 'treatment', 'followup']),
  notes: z.string().max(500).optional(),
});

export const UpdateAppointmentSchema = CreateAppointmentSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['planned', 'in-progress', 'on-hold', 'completed', 'cancelled']).optional(),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>;

// Extended type with relations
export interface AppointmentWithPatient extends Encounter {
  patient: {
    patient_id: string;
    name_family: string;
    name_given: string[];
    birth_date: string;
    gender: string;
  };
  reports?: {
    id: string;
    created_at: string;
  }[];
}

// FullCalendar event type
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  extendedProps: {
    patient_id: string;
    patient_name: string;
    type_code: AppointmentTypeValue;
    type_display: string;
    status: EncounterStatus;
    notes?: string;
    has_report: boolean;
  };
  backgroundColor?: string;
  borderColor?: string;
  classNames?: string[];
}
```

### 4.4 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  practitioners  │       │   encounters    │       │    patients     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ practitioner_id │◄──────│ practitioner_id │       │ patient_id      │
│ name_family     │   1:N │ patient_id      │──────►│ name_family     │
│ name_given[]    │       │ period_start    │   N:1 │ name_given[]    │
│ ...             │       │ period_end      │       │ birth_date      │
└─────────────────┘       │ type_code       │       │ gender          │
                          │ status          │       │ ...             │
                          │ notes           │       └─────────────────┘
                          │ ...             │
                          └────────┬────────┘
                                   │
                                   │ 1:N (optional)
                                   ▼
                          ┌─────────────────┐
                          │    reports      │
                          ├─────────────────┤
                          │ id              │
                          │ encounter_id    │ ◄── NEW (E0 migration)
                          │ patient_id      │
                          │ type            │
                          │ content         │
                          │ ...             │
                          └─────────────────┘
```

---

## 5. API Ontwerp

🎯 **Doel:** Overzicht van endpoints en server actions.

### 5.1 API Routes

| Endpoint | Method | Input | Output | Auth | Gebruik |
|----------|--------|-------|--------|------|---------|
| `/api/appointments` | GET | `?start=&end=&practitioner_id=` | `Appointment[]` | Required | Kalender data laden |
| `/api/appointments` | POST | `CreateAppointmentInput` | `Appointment` | Required | Nieuwe afspraak |
| `/api/appointments/[id]` | GET | - | `AppointmentWithPatient` | Required | Detail ophalen |
| `/api/appointments/[id]` | PATCH | `UpdateAppointmentInput` | `Appointment` | Required | Afspraak wijzigen |
| `/api/appointments/[id]` | DELETE | - | `{ success: true }` | Required | Soft delete (status=cancelled) |
| `/api/appointments/conflicts` | POST | `{ start, end, exclude_id? }` | `Appointment[]` | Required | Conflict check |
| `/api/patients/search` | GET | `?q=&limit=` | `Patient[]` | Required | Patient autocomplete |

### 5.2 Server Actions (Preferred for Mutations)

```typescript
// app/epd/agenda/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/auth/server';
import { CreateAppointmentSchema, UpdateAppointmentSchema } from './types';
import type { CreateAppointmentInput, UpdateAppointmentInput } from './types';

export async function createAppointment(input: CreateAppointmentInput) {
  // 1. Validate input
  const validated = CreateAppointmentSchema.parse(input);

  // 2. Get authenticated user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Niet ingelogd');

  // 3. Get practitioner_id from user
  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('practitioner_id')
    .eq('user_id', user.id)
    .single();

  // 4. Calculate period_end
  const periodStart = new Date(validated.period_start);
  const periodEnd = new Date(periodStart.getTime() + validated.duration_minutes * 60000);

  // 5. Insert encounter
  const { data, error } = await supabase
    .from('encounters')
    .insert({
      patient_id: validated.patient_id,
      practitioner_id: practitioner?.practitioner_id,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      type_code: validated.type_code,
      type_display: AppointmentTypeDisplay[validated.type_code],
      status: 'planned',
      notes: validated.notes,
      class_code: 'AMB',
      class_display: 'ambulatory',
    })
    .select()
    .single();

  if (error) throw error;

  // 6. Revalidate cache
  revalidatePath('/epd/agenda');

  return data;
}

export async function updateAppointment(input: UpdateAppointmentInput) {
  const validated = UpdateAppointmentSchema.parse(input);
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};

  if (validated.period_start) {
    updateData.period_start = validated.period_start;
    if (validated.duration_minutes) {
      const start = new Date(validated.period_start);
      updateData.period_end = new Date(start.getTime() + validated.duration_minutes * 60000).toISOString();
    }
  }

  if (validated.type_code) {
    updateData.type_code = validated.type_code;
    updateData.type_display = AppointmentTypeDisplay[validated.type_code];
  }

  if (validated.status) updateData.status = validated.status;
  if (validated.notes !== undefined) updateData.notes = validated.notes;

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('encounters')
    .update(updateData)
    .eq('id', validated.id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/epd/agenda');
  return data;
}

export async function cancelAppointment(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('encounters')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/epd/agenda');
  return data;
}

export async function checkConflicts(
  start: string,
  end: string,
  excludeId?: string
): Promise<Encounter[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Niet ingelogd');

  // Get practitioner_id
  const { data: practitioner } = await supabase
    .from('practitioners')
    .select('practitioner_id')
    .eq('user_id', user.id)
    .single();

  if (!practitioner) return [];

  // Query overlapping appointments
  let query = supabase
    .from('encounters')
    .select('*')
    .eq('practitioner_id', practitioner.practitioner_id)
    .neq('status', 'cancelled')
    .lt('period_start', end)
    .gt('period_end', start);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}
```

### 5.3 API Route Implementation

```typescript
// app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return NextResponse.json(
        { error: 'start en end parameters zijn verplicht' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    // Get practitioner
    const { data: practitioner } = await supabase
      .from('practitioners')
      .select('practitioner_id')
      .eq('user_id', user.id)
      .single();

    // Fetch appointments with patient data
    const { data, error } = await supabase
      .from('encounters')
      .select(`
        *,
        patient:patients(patient_id, name_family, name_given, birth_date, gender),
        reports(id, created_at)
      `)
      .eq('practitioner_id', practitioner?.practitioner_id)
      .gte('period_start', start)
      .lte('period_start', end)
      .neq('status', 'cancelled')
      .order('period_start', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ appointments: data });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Kon afspraken niet laden' },
      { status: 500 }
    );
  }
}
```

### 5.4 Patient Search API

```typescript
// app/api/patients/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    // Build search query
    let dbQuery = supabase
      .from('patients')
      .select('patient_id, name_family, name_given, birth_date, gender')
      .limit(limit);

    if (query.length >= 2) {
      // Search on name (case-insensitive)
      dbQuery = dbQuery.or(`name_family.ilike.%${query}%,name_given.cs.{${query}}`);
    }

    const { data, error } = await dbQuery.order('name_family');

    if (error) throw error;

    return NextResponse.json({ patients: data });
  } catch (error) {
    console.error('Error searching patients:', error);
    return NextResponse.json(
      { error: 'Zoeken mislukt' },
      { status: 500 }
    );
  }
}
```

---

## 6. Component Implementatie

🎯 **Doel:** Technische details van UI componenten.

### 6.1 Calendar View Component

```typescript
// app/epd/agenda/components/calendar-view.tsx
'use client';

import { useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';
import { nl } from 'date-fns/locale';

import { useAppointments } from '../hooks/use-appointments';
import { useAppointmentMutations } from '../hooks/use-appointment-mutations';
import { transformToCalendarEvents } from '../lib/appointment-utils';
import { AppointmentModal } from './appointment-modal';
import { AppointmentDetail } from './appointment-detail';
import { CalendarToolbar } from './calendar-toolbar';

interface CalendarViewProps {
  initialDate?: Date;
  initialView?: 'timeGridDay' | 'timeGridWeek' | 'timeGridWorkWeek';
}

export function CalendarView({
  initialDate = new Date(),
  initialView = 'timeGridWeek'
}: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null);

  // Data fetching
  const { appointments, isLoading, mutate } = useAppointments();
  const { updateAppointment } = useAppointmentMutations();

  // State for modals
  const [selectedSlot, setSelectedSlot] = useState<DateSelectArg | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Transform appointments to FullCalendar events
  const events = useMemo(() =>
    transformToCalendarEvents(appointments),
    [appointments]
  );

  // Handlers
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    setSelectedSlot(selectInfo);
    setIsModalOpen(true);
  }, []);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo.event.toPlainObject() as CalendarEvent);
    setIsDetailOpen(true);
  }, []);

  const handleEventDrop = useCallback(async (dropInfo: EventDropArg) => {
    const { event, revert } = dropInfo;

    try {
      await updateAppointment({
        id: event.id,
        period_start: event.start!.toISOString(),
        duration_minutes: (event.end!.getTime() - event.start!.getTime()) / 60000,
      });
      mutate(); // Revalidate
    } catch (error) {
      revert(); // Rollback on error
      toast.error('Kon afspraak niet verzetten');
    }
  }, [updateAppointment, mutate]);

  // Navigation handlers for toolbar
  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();
  const handleToday = () => calendarRef.current?.getApi().today();
  const handleViewChange = (view: string) => calendarRef.current?.getApi().changeView(view);

  return (
    <div className="flex flex-col h-full">
      <CalendarToolbar
        calendarRef={calendarRef}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={handleViewChange}
        onNewAppointment={() => setIsModalOpen(true)}
      />

      <div className="flex-1 min-h-0">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={initialView}
          initialDate={initialDate}

          // Localization
          locale="nl"
          firstDay={1} // Monday

          // Time settings
          slotMinTime="08:00:00"
          slotMaxTime="18:00:00"
          slotDuration="00:30:00"

          // Business hours
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: '08:00',
            endTime: '18:00',
          }}

          // Events
          events={events}

          // Interaction
          selectable={true}
          selectMirror={true}
          editable={true}
          eventResizableFromStart={true}

          // Callbacks
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}

          // Styling
          height="100%"
          headerToolbar={false} // We use custom toolbar
          nowIndicator={true}
          dayMaxEvents={true}

          // Loading
          loading={(loading) => setIsLoading(loading)}
        />
      </div>

      {/* Modals */}
      <AppointmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        defaultValues={selectedSlot ? {
          date: selectedSlot.start,
          startTime: selectedSlot.start,
        } : undefined}
        onSuccess={() => {
          setIsModalOpen(false);
          setSelectedSlot(null);
          mutate();
        }}
      />

      <AppointmentDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        appointment={selectedEvent}
        onEdit={() => {
          setIsDetailOpen(false);
          setIsModalOpen(true);
        }}
        onDelete={() => {
          mutate();
          setIsDetailOpen(false);
        }}
      />
    </div>
  );
}
```

### 6.2 Appointment Modal Component

```typescript
// app/epd/agenda/components/appointment-modal.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition, useEffect } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { PatientSearch } from './patient-search';
import { ConflictDialog } from './conflict-dialog';
import { createAppointment, updateAppointment, checkConflicts } from '../actions';
import { CreateAppointmentSchema, AppointmentType, AppointmentTypeDuration } from '../types';

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: {
    date?: Date;
    startTime?: Date;
    appointment?: Appointment; // For edit mode
  };
  onSuccess: () => void;
}

export function AppointmentModal({
  open,
  onOpenChange,
  defaultValues,
  onSuccess,
}: AppointmentModalProps) {
  const [isPending, startTransition] = useTransition();
  const [conflicts, setConflicts] = useState<Encounter[]>([]);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const isEdit = !!defaultValues?.appointment;

  const form = useForm({
    resolver: zodResolver(CreateAppointmentSchema),
    defaultValues: {
      patient_id: defaultValues?.appointment?.patient_id || '',
      period_start: defaultValues?.startTime?.toISOString() ||
                    defaultValues?.date?.toISOString() ||
                    new Date().toISOString(),
      duration_minutes: defaultValues?.appointment
        ? /* calculate from period_end - period_start */ 45
        : 45,
      type_code: defaultValues?.appointment?.type_code || 'treatment',
      notes: defaultValues?.appointment?.notes || '',
    },
  });

  // Auto-update duration when type changes
  const typeCode = form.watch('type_code');
  useEffect(() => {
    if (!isEdit) {
      form.setValue('duration_minutes', AppointmentTypeDuration[typeCode as keyof typeof AppointmentTypeDuration]);
    }
  }, [typeCode, isEdit, form]);

  // Real-time conflict check
  const periodStart = form.watch('period_start');
  const durationMinutes = form.watch('duration_minutes');

  useEffect(() => {
    if (periodStart && durationMinutes) {
      const start = new Date(periodStart);
      const end = new Date(start.getTime() + durationMinutes * 60000);

      checkConflicts(
        start.toISOString(),
        end.toISOString(),
        defaultValues?.appointment?.id
      ).then(setConflicts);
    }
  }, [periodStart, durationMinutes, defaultValues?.appointment?.id]);

  const onSubmit = async (data: CreateAppointmentInput) => {
    // Check for conflicts before submit
    if (conflicts.length > 0) {
      setShowConflictDialog(true);
      return;
    }

    await saveAppointment(data);
  };

  const saveAppointment = async (data: CreateAppointmentInput, ignoreConflict = false) => {
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateAppointment({ ...data, id: defaultValues.appointment!.id });
        } else {
          await createAppointment(data);
        }
        onSuccess();
        toast.success(isEdit ? 'Afspraak gewijzigd' : 'Afspraak opgeslagen');
      } catch (error) {
        toast.error('Er ging iets mis');
      }
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Afspraak bewerken' : 'Nieuwe afspraak'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Patient Search */}
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <PatientSearch
                value={form.watch('patient_id')}
                onChange={(patientId) => form.setValue('patient_id', patientId)}
                error={form.formState.errors.patient_id?.message}
              />
            </div>

            {/* Date & Time (inline) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Datum *</Label>
                <Input
                  type="date"
                  {...form.register('period_start')}
                  className={form.formState.errors.period_start ? 'border-red-500' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Tijd *</Label>
                <Input
                  type="time"
                  step="1800"
                  {...form.register('period_start')}
                />
              </div>
            </div>

            {/* Inline conflict warning */}
            {conflicts.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm">
                <p className="font-medium text-amber-800">
                  ⚠️ Overlap met: {conflicts[0].patient?.name_family} {format(new Date(conflicts[0].period_start), 'HH:mm')}
                </p>
              </div>
            )}

            {/* Duration (radio buttons) */}
            <div className="space-y-2">
              <Label>Duur</Label>
              <RadioGroup
                value={String(form.watch('duration_minutes'))}
                onValueChange={(v) => form.setValue('duration_minutes', Number(v))}
                className="flex gap-4"
              >
                {[30, 45, 60, 90].map((min) => (
                  <div key={min} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(min)} id={`dur-${min}`} />
                    <Label htmlFor={`dur-${min}`} className="font-normal">
                      {min} min
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Type (radio buttons) */}
            <div className="space-y-2">
              <Label>Type *</Label>
              <RadioGroup
                value={form.watch('type_code')}
                onValueChange={(v) => form.setValue('type_code', v)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intake" id="type-intake" />
                  <Label htmlFor="type-intake" className="font-normal">Intake</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="treatment" id="type-treatment" />
                  <Label htmlFor="type-treatment" className="font-normal">Behandeling</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="followup" id="type-followup" />
                  <Label htmlFor="type-followup" className="font-normal">Follow-up</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Notes (collapsible) */}
            {!showNotes ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowNotes(true)}
                className="text-slate-600"
              >
                + Notitie toevoegen
              </Button>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="notes">Notities</Label>
                <Textarea
                  {...form.register('notes')}
                  placeholder="Optionele notities..."
                  rows={3}
                />
                <p className="text-xs text-slate-500 text-right">
                  {form.watch('notes')?.length || 0}/500
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuleren
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Opslaan...' : 'Opslaan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Conflict Dialog */}
      <ConflictDialog
        open={showConflictDialog}
        onOpenChange={setShowConflictDialog}
        conflicts={conflicts}
        onModify={() => {
          setShowConflictDialog(false);
          // Focus time field
        }}
        onProceed={() => {
          setShowConflictDialog(false);
          saveAppointment(form.getValues(), true);
        }}
      />
    </>
  );
}
```

### 6.3 Patient Search Component

```typescript
// app/epd/agenda/components/patient-search.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { Search, X, Loader2 } from 'lucide-react';

interface Patient {
  patient_id: string;
  name_family: string;
  name_given: string[];
  birth_date: string;
  gender: string;
}

interface PatientSearchProps {
  value: string;
  onChange: (patientId: string) => void;
  error?: string;
}

export function PatientSearch({ value, onChange, error }: PatientSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Load recent patients on mount
  useEffect(() => {
    fetch('/api/patients/recent')
      .then(res => res.json())
      .then(data => setRecentPatients(data.patients || []));
  }, []);

  // Search patients when query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setPatients([]);
      return;
    }

    setIsLoading(true);
    fetch(`/api/patients/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(res => res.json())
      .then(data => {
        setPatients(data.patients || []);
        setHighlightedIndex(0);
      })
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = query.length >= 2 ? patients : recentPatients;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(i => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (items[highlightedIndex]) {
          selectPatient(items[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }, [query, patients, recentPatients, highlightedIndex]);

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    onChange(patient.patient_id);
    setIsOpen(false);
    setQuery('');
  };

  const clearSelection = () => {
    setSelectedPatient(null);
    onChange('');
    setQuery('');
    inputRef.current?.focus();
  };

  const formatPatientName = (p: Patient) =>
    `${p.name_given?.join(' ') || ''} ${p.name_family}`.trim();

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Render selected patient chip
  if (selectedPatient) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 border rounded-md bg-slate-50",
        error && "border-red-500"
      )}>
        <span className="flex-1">{formatPatientName(selectedPatient)}</span>
        <button
          type="button"
          onClick={clearSelection}
          className="p-1 hover:bg-slate-200 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const displayItems = query.length >= 2 ? patients : recentPatients;
  const showRecent = query.length < 2 && recentPatients.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Zoek patient (naam of BSN)..."
          className={cn(
            "w-full pl-10 pr-10 py-2 border rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-teal-500",
            error && "border-red-500"
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (displayItems.length > 0 || query.length >= 2) && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-64 overflow-auto">
          {showRecent && (
            <div className="px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-50">
              Recente patiënten
            </div>
          )}

          {query.length >= 2 && patients.length === 0 && !isLoading && (
            <div className="px-3 py-2 text-sm text-slate-500">
              Geen patiënt gevonden
            </div>
          )}

          {displayItems.map((patient, index) => (
            <button
              key={patient.patient_id}
              type="button"
              onClick={() => selectPatient(patient)}
              className={cn(
                "w-full px-3 py-2 text-left hover:bg-slate-50",
                index === highlightedIndex && "bg-slate-100"
              )}
            >
              <div className="font-medium">
                {formatPatientName(patient)}
              </div>
              <div className="text-sm text-slate-500">
                {patient.gender === 'male' ? '♂' : '♀'}{' '}
                {new Date(patient.birth_date).toLocaleDateString('nl-NL')}{' '}
                ({calculateAge(patient.birth_date)} jaar)
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 7. Security & Compliance

🎯 **Doel:** Beschrijf security maatregelen en compliance vereisten.

### 7.1 Security Checklist

| Maatregel | Implementatie | Status |
|-----------|---------------|--------|
| **Authentication** | Supabase Auth (bestaand) | ✅ |
| **Authorization** | Row Level Security (RLS) policies | 🔧 Toe te voegen |
| **Data Encryption** | At rest (PostgreSQL), in transit (HTTPS) | ✅ |
| **Input Validation** | Zod schemas op alle endpoints | ✅ |
| **CORS** | Next.js default (same-origin) | ✅ |
| **CSRF** | SameSite cookies | ✅ |
| **Rate Limiting** | Vercel Edge (basic) | ✅ |

### 7.2 Row Level Security Policies

```sql
-- Encounters: Users can only see/modify their own appointments
CREATE POLICY "Users can view own encounters"
ON encounters FOR SELECT
USING (
  practitioner_id IN (
    SELECT practitioner_id FROM practitioners
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own encounters"
ON encounters FOR INSERT
WITH CHECK (
  practitioner_id IN (
    SELECT practitioner_id FROM practitioners
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own encounters"
ON encounters FOR UPDATE
USING (
  practitioner_id IN (
    SELECT practitioner_id FROM practitioners
    WHERE user_id = auth.uid()
  )
);

-- No DELETE policy - we use soft delete (status = 'cancelled')
```

### 7.3 Data Privacy (AVG/GDPR)

| Vereiste | Implementatie |
|----------|---------------|
| **Data minimalisatie** | Alleen noodzakelijke velden in encounters |
| **Doelbinding** | Data alleen voor afspraakbeheer |
| **Bewaartermijn** | Conform zorgsector: 15 jaar (post-MVP) |
| **Inzagerecht** | Via patient dossier (bestaand) |
| **Verwijderrecht** | Soft delete, anonimisatie (post-MVP) |

### 7.4 Audit Logging (Post-MVP)

```typescript
// Future: Audit log structure
interface AuditLog {
  id: string;
  timestamp: Date;
  user_id: string;
  action: 'create' | 'update' | 'delete' | 'view';
  entity_type: 'encounter';
  entity_id: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  ip_address?: string;
}
```

---

## 8. Performance & Scalability

🎯 **Doel:** Hoe performt en schaalt het systeem?

### 8.1 Performance Targets

| Metric | Target | Meting |
|--------|--------|--------|
| **Page load (FCP)** | < 1.5s | Vercel Analytics |
| **Calendar render** | < 500ms | Console timing |
| **API response** | < 200ms | Server logs |
| **Patient search** | < 300ms | User perception |
| **Conflict check** | < 100ms | Inline, non-blocking |

### 8.2 Optimization Strategies

**Database:**
```sql
-- Indexes voor snelle queries
CREATE INDEX idx_encounters_period ON encounters(period_start, period_end);
CREATE INDEX idx_encounters_practitioner_period
ON encounters(practitioner_id, period_start);
CREATE INDEX idx_patients_name ON patients(name_family, name_given);
```

**Frontend:**
- FullCalendar lazy loading per view
- SWR caching met stale-while-revalidate
- Optimistic updates voor instant feedback
- Skeleton loading states

**Data Fetching:**
```typescript
// SWR configuration
const { data, mutate } = useSWR(
  `/api/appointments?start=${start}&end=${end}`,
  fetcher,
  {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
    keepPreviousData: true, // Smooth transitions
  }
);
```

### 8.3 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Appointments (week) | SWR | 5 min | On mutation |
| Patient search | None | - | Real-time |
| Recent patients | LocalStorage | 1 hour | On new appointment |
| Calendar config | Static | ∞ | Build time |

---

## 9. Deployment & CI/CD

🎯 **Doel:** Hoe wordt het systeem gedeployed?

### 9.1 Deployment Pipeline

```
Git Push (feature branch)
    │
    ▼
GitHub Actions
    │
    ├── Lint (ESLint)
    ├── Type Check (tsc)
    ├── Build (next build)
    │
    ▼
Vercel Preview Deploy
    │
    ▼
PR Review + Merge to main
    │
    ▼
Vercel Production Deploy
    │
    ▼
Supabase Migrations (manual or via CLI)
```

### 9.2 Environment Variables

```bash
# Bestaande variabelen (geen wijziging nodig)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Geen nieuwe env vars nodig voor agenda module
```

### 9.3 Database Migrations

```bash
# E0: Add encounter_id to reports
supabase migration new add_encounter_id_to_reports

# Migration file content:
ALTER TABLE reports ADD COLUMN encounter_id UUID REFERENCES encounters(id);
CREATE INDEX idx_reports_encounter ON reports(encounter_id);

# Apply migration
supabase db push
```

### 9.4 Pre-deployment Checklist

- [ ] Database migration applied
- [ ] TypeScript types regenerated (`pnpm types:generate`)
- [ ] All tests passing
- [ ] Preview deployment tested
- [ ] Performance acceptable (Lighthouse > 90)
- [ ] Mobile responsive verified

---

## 10. Monitoring & Logging

🎯 **Doel:** Hoe monitoren we het systeem?

### 10.1 Monitoring Stack (Bestaand)

| Tool | Gebruik |
|------|---------|
| **Vercel Analytics** | Traffic, Web Vitals |
| **Vercel Logs** | Server-side errors |
| **Console** | Client-side debugging |
| **Supabase Dashboard** | Database metrics |

### 10.2 Key Metrics voor Agenda

| Metric | Alert threshold | Monitoring |
|--------|-----------------|------------|
| API error rate | > 5% | Vercel Logs |
| Page load time | > 3s | Web Vitals |
| Calendar render errors | Any | Console + Sentry (post-MVP) |
| Database query time | > 1s | Supabase logs |

### 10.3 Logging Strategy

```typescript
// Server-side logging
console.log('[AGENDA] Creating appointment:', { patient_id, period_start });
console.error('[AGENDA] Error creating appointment:', error);

// Client-side (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('[Calendar] Events loaded:', events.length);
}
```

---

## 11. Risico's & Technische Mitigatie

🎯 **Doel:** Technische risico's vroegtijdig identificeren.

### 11.1 Risico Matrix

| Risico | Impact | Kans | Mitigatie |
|--------|--------|------|-----------|
| **FullCalendar styling conflicts** | Middel | Middel | CSS isolation, early spike, fallback naar simpel grid |
| **Timezone bugs** | Hoog | Middel | TIMESTAMPTZ in DB, date-fns-tz, test zomertijd |
| **Performance bij veel events** | Middel | Laag | Pagination, lazy loading, date range queries |
| **Drag-drop mobile issues** | Laag | Hoog | Mobile: disable drag, use edit button |
| **Concurrent edit conflicts** | Middel | Laag | Optimistic locking met updated_at check |
| **Browser compatibility** | Laag | Laag | FullCalendar supports all modern browsers |

### 11.2 Fallback Strategies

**FullCalendar fallback:**
Als FullCalendar te complex blijkt:
1. Simpele CSS Grid kalender met custom events
2. Agenda-lijst view als alternatief
3. Week view prioriteit, dag view stretch

**Timezone fallback:**
```typescript
// Always store UTC, display local
const displayTime = formatInTimeZone(
  appointment.period_start,
  'Europe/Amsterdam',
  'HH:mm'
);
```

---

## 12. Testing Strategy

🎯 **Doel:** Hoe testen we de implementatie?

### 12.1 Test Types

| Type | Coverage | Tools |
|------|----------|-------|
| **Unit tests** | Utils, transformers | Vitest |
| **Component tests** | Modal, search | Testing Library |
| **Integration tests** | API routes | Vitest + MSW |
| **E2E tests** | Core flows | Playwright (post-MVP) |

### 12.2 Critical Test Cases

```typescript
// Conflict detection tests
describe('checkConflicts', () => {
  it('detects overlap at start', () => {
    // Existing: 14:00-15:00
    // New: 13:30-14:30 → should conflict
  });

  it('detects overlap at end', () => {
    // Existing: 14:00-15:00
    // New: 14:30-15:30 → should conflict
  });

  it('allows adjacent appointments', () => {
    // Existing: 14:00-15:00
    // New: 15:00-16:00 → no conflict
  });

  it('excludes cancelled appointments', () => {
    // Cancelled at 14:00
    // New: 14:00 → no conflict
  });
});

// Date handling tests
describe('appointment utils', () => {
  it('calculates end time correctly', () => {
    const start = new Date('2024-12-05T14:00:00Z');
    const end = calculateEndTime(start, 60);
    expect(end.toISOString()).toBe('2024-12-05T15:00:00.000Z');
  });

  it('handles timezone correctly', () => {
    // Test Amsterdam timezone edge cases
  });
});
```

---

## 13. Implementation Epics

🎯 **Doel:** High-level implementatie volgorde.

### Epic Overview

| Epic | Naam | Story Points | Dependency |
|------|------|--------------|------------|
| **E0** | Database & Types | 3 | - |
| **E1** | Calendar Views | 8 | E0 |
| **E2** | Appointment CRUD | 8 | E0 |
| **E3** | Patient Integration | 5 | E2 |
| **E4** | EPD Linking | 5 | E2, E3 |
| **E5** | Polish & Testing | 5 | E1-E4 |
| **Total** | | **34** | |

### E0: Database & Types (Day 1)

- [ ] Migration: Add encounter_id to reports
- [ ] Regenerate TypeScript types
- [ ] Create lib/types/encounter.ts
- [ ] Create lib/types/appointment.ts with Zod schemas

### E1: Calendar Views (Days 2-4)

- [ ] Install FullCalendar packages
- [ ] Create calendar-view.tsx component
- [ ] Implement day/week/workdays views
- [ ] Add toolbar navigation
- [ ] Style calendar with Tailwind
- [ ] Add loading/error states

### E2: Appointment CRUD (Days 5-7)

- [ ] Create server actions (create, update, cancel)
- [ ] Implement appointment modal
- [ ] Add conflict detection
- [ ] Implement drag-drop reschedule
- [ ] Add confirmation dialogs

### E3: Patient Integration (Days 8-9)

- [ ] Create patient search component
- [ ] Implement autocomplete with debounce
- [ ] Add recent patients feature
- [ ] Integrate with appointment modal

### E4: EPD Linking (Days 10-11)

- [ ] Create appointment detail popup
- [ ] Add "Maak verslag" navigation
- [ ] Pass encounter_id to rapportage
- [ ] Show report icon on appointments

### E5: Polish & Testing (Days 12-14)

- [ ] Mobile responsiveness
- [ ] Keyboard shortcuts
- [ ] Edge case testing
- [ ] Performance optimization
- [ ] Documentation

---

## 14. Bijlagen & Referenties

### 14.1 Project Documenten

| Document | Locatie |
|----------|---------|
| PRD Agenda Module | `docs/specs/agenda/prd-agenda-module-v1_0.md` |
| FO Agenda Module | `docs/specs/agenda/fo-agenda-module-v1_0.md` |
| Database Types | `lib/supabase/database.types.ts` |

### 14.2 Technische Documentatie

| Resource | URL |
|----------|-----|
| Next.js 14 | https://nextjs.org/docs |
| FullCalendar React | https://fullcalendar.io/docs/react |
| Supabase | https://supabase.com/docs |
| shadcn/ui | https://ui.shadcn.com/docs |
| date-fns | https://date-fns.org/docs |
| SWR | https://swr.vercel.app |

### 14.3 Bestaande Codebase Referenties

| Pattern | Locatie | Hergebruik |
|---------|---------|------------|
| Server Actions | `app/epd/patients/[id]/intakes/actions.ts` | CRUD pattern |
| Form Validation | `lib/types/intake.ts` | Zod schemas |
| API Routes | `app/api/intakes/route.ts` | Error handling |
| Modal Dialogs | `components/ui/dialog.tsx` | UI component |
| Patient Types | `lib/types/client.ts` | Helper functions |

---

## Changelog

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 02-12-2024 | Colin | Initieel TO op basis van PRD v1.0 en FO v1.1 |

---

**Document Status:** ✅ Klaar voor review
**Volgende stap:** → E0 Database Migration implementeren
