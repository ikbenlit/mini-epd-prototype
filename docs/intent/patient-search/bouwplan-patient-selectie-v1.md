# Bouwplan Patient Selectie v1.3

**Projectnaam:** Patient Selectie UX Verbetering
**Versie:** v1.3
**Datum:** 03-01-2025
**Auteur:** Colin Lit

---

## 1. Doel en context

**Doel:** De patient selectie flow in Cortex verbeteren van een multi-stap proces naar een snelle, inline ervaring met @mentions en een persistent patient sidebar.

**Context:**
De huidige patient selectie in Cortex vereist meerdere stappen:
1. User typt intent ("notitie medicatie Jan")
2. Cortex vraagt "Welke patient bedoel je?"
3. ZoekenBlock opent in artifact area
4. User klikt patient
5. User moet opnieuw intent typen

Dit kost tijd en zorgt voor context verlies. De nieuwe aanpak introduceert:
- **@Mention systeem** - Selecteer patient direct in chat input
- **Patient Sidebar** - Collapsible overlay voor snelle patient selectie
- **Smart Defaults** - Gebruik activePatient automatisch in alle blocks

**Referenties:**
- **UX Analyse:** `docs/intent/patient-search/ux-analyse-patient-selectie.md`
- **Cortex Bouwplan:** `docs/archive/swift/bouwplan-swift-v3.md`
- **Store:** `stores/cortex-store.ts`
- **ZoekenBlock:** `components/cortex/blocks/zoeken-block.tsx` (bron voor extracties)

---

## 2. Uitgangspunten

### 2.1 Technische Stack

**Bestaand (hergebruiken):**
- Next.js 14 (App Router)
- React 18 met TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- `/api/patients/search` endpoint
- ZoekenBlock logica (extract naar hooks)

**Nieuw:**
- `lib/cortex/hooks/use-patient-search.ts` - Extracted hook
- `lib/cortex/hooks/use-patient-selection.ts` - Extracted hook
- `lib/fhir/patient-mapper.ts` - FHIR mapping utility
- `components/cortex/shared/patient-list-item.tsx` - Shared component
- `components/cortex/patient-sidebar/` - Sidebar components
- `components/cortex/command-center/patient-mention-dropdown.tsx` - Mention dropdown

### 2.2 Projectkaders

**Tijd:**
- Fase 0 (Refactor): 0.5 week
- Fase 1 (Sidebar): 0.5 week
- Fase 2 (@Mention): 1 week
- Fase 3 (Smart Defaults): 0.5 week
- **Totaal:** ~2.5 weken

**Team:**
- 1 developer (Colin)
- AI assistant (Claude Code)

**Scope:**
- **In scope:** Refactor, Patient Sidebar, @Mention, Smart Defaults
- **Out of scope:** Preview Cards (P2), mention chips (P2), localStorage persistence
- **Dependencies:** Geen nieuwe npm packages

### 2.3 Programmeer Uitgangspunten

**DRY (Don't Repeat Yourself):**
- Extract bestaande ZoekenBlock logica naar hooks
- Geen duplicatie van search/selection code
- Shared `PatientListItem` voor sidebar en dropdown

**KISS (Keep It Simple):**
- Sidebar als collapsible overlay, niet 3-kolom layout
- Search state lokaal in component, niet in store
- @mention zonder visuele chips (eerst tekst, chips later)
- Keyboard nav: alleen Enter + Escape voor MVP

**SOC (Separation of Concerns):**
- FHIR mapping in utility, niet in component
- API calls in dedicated functions
- Selection logic in hook, UI in component

**YAGNI (You Aren't Gonna Need It):**
- Geen `patientSearchQuery` in store (local state)
- Geen `patientSearchResults` in store (local state)
- Geen `pendingIntent` (hergebruik `pendingAction`)
- Geen localStorage voor recent patients (session only)
- Geen arrow key navigation (MVP: Enter/Escape)

---

## 3. Epics & Stories Overzicht

| Epic ID | Titel | Doel | Status | Stories | Story Points |
|---------|-------|------|--------|---------|--------------|
| E0 | Refactor & Extract | DRY: extract bestaande code naar hooks | ✅ Done | 4 | 4 SP |
| E1 | Patient Sidebar | Collapsible overlay sidebar | ✅ Done | 4 | 6 SP |
| E2 | @Mention Systeem | Inline patient selectie in chat | ⏳ To Do | 5 | 8 SP |
| E3 | Smart Defaults | ActivePatient auto-use in blocks | ⏳ To Do | 3 | 5 SP |

**Totaal:** 16 stories, **23 Story Points** (~2.5 weken)

**Belangrijk:**
- **Fase 0 eerst!** Extract bestaande code voor hergebruik
- Bouw per epic en per story
- Test elke story voor commit

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 — Refactor & Extract

**Epic Doel:** Bestaande ZoekenBlock logica extracten naar herbruikbare hooks en utilities (DRY principe).

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E0.S1 | Extract `usePatientSearch` hook | Hook werkt, ZoekenBlock refactored | ✅ | — | 1 |
| E0.S2 | Extract `PatientListItem` component | Component werkt in ZoekenBlock | ✅ | E0.S1 | 1 |
| E0.S3 | Extract `mapFhirToDbPatient` utility | Utility werkt, ZoekenBlock refactored | ✅ | — | 1 |
| E0.S4 | Extract `usePatientSelection` hook | Hook werkt met store integration | ✅ | E0.S3 | 1 |

**Technical Notes:**

**E0.S1 - usePatientSearch:**
```typescript
// lib/cortex/hooks/use-patient-search.ts
// Extract van ZoekenBlock:50-113

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { safeFetch, getErrorInfo } from '@/lib/cortex/error-handler';

export interface PatientSearchResult {
  id: string;
  name: string;
  birthDate: string;
  identifier_bsn?: string;
  identifier_client_number?: string;
  matchScore: number;
}

interface UsePatientSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  limit?: number;
}

export function usePatientSearch(options: UsePatientSearchOptions = {}) {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    limit = 10,
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PatientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const searchPatients = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minQueryLength) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await safeFetch(
        `/api/patients/search?q=${encodeURIComponent(searchQuery)}&limit=${limit}`,
        undefined,
        { operation: 'Patient zoeken' }
      );
      const data = await response.json();
      setResults(data.patients || []);
    } catch (error) {
      console.error('Failed to search patients:', error);
      const errorInfo = getErrorInfo(error, { operation: 'Patient zoeken' });
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.description,
      });
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [toast, minQueryLength, limit]);

  // Debounced search effect
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (query.length >= minQueryLength) {
      timeoutRef.current = setTimeout(() => {
        searchPatients(query);
      }, debounceMs);
    } else {
      setResults([]);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, debounceMs, minQueryLength, searchPatients]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    searchPatients, // Voor handmatige trigger (bijv. prefill)
  };
}
```

**E0.S2 - PatientListItem:**
```typescript
// components/cortex/shared/patient-list-item.tsx
// Extract van ZoekenBlock:275-326

import { cn } from '@/lib/utils';
import { Loader2, Check, User } from 'lucide-react';
import type { PatientSearchResult } from '@/lib/cortex/hooks/use-patient-search';

interface PatientListItemProps {
  patient: PatientSearchResult;
  isSelected?: boolean;
  isLoading?: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
}

export function PatientListItem({
  patient,
  isSelected = false,
  isLoading = false,
  onClick,
  size = 'md',
}: PatientListItemProps) {
  const age = patient.birthDate
    ? new Date().getFullYear() - new Date(patient.birthDate).getFullYear()
    : null;

  const initials = patient.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        'w-full px-3 py-2 rounded-lg border text-left transition-colors',
        size === 'sm' && 'py-1.5',
        isLoading
          ? 'bg-slate-100 border-slate-300 cursor-wait'
          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={cn(
          'rounded-full bg-blue-600 flex items-center justify-center text-white font-medium shrink-0',
          size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-xs'
        )}>
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            'font-medium text-slate-900 truncate',
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}>
            {patient.name}
            {age && <span className="text-slate-500 font-normal"> ({age} jaar)</span>}
          </div>
          {size === 'md' && (patient.identifier_bsn || patient.identifier_client_number) && (
            <div className="flex items-center gap-3 mt-0.5">
              {patient.identifier_bsn && (
                <span className="text-xs text-slate-500">BSN: {patient.identifier_bsn}</span>
              )}
              {patient.identifier_client_number && (
                <span className="text-xs text-slate-500">Client: {patient.identifier_client_number}</span>
              )}
            </div>
          )}
        </div>

        {/* Status icon */}
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 shrink-0" />
        ) : (
          <Check className="h-4 w-4 text-slate-400 shrink-0" />
        )}
      </div>
    </button>
  );
}
```

**E0.S3 - mapFhirToDbPatient:**
```typescript
// lib/fhir/patient-mapper.ts
// Extract van ZoekenBlock:146-187

import type { Database } from '@/lib/supabase/database.types';

type Patient = Database['public']['Tables']['patients']['Row'];

interface FhirPatient {
  id: string;
  name?: Array<{ family?: string; given?: string[] }>;
  birthDate?: string;
  gender?: string;
  active?: boolean;
  identifier?: Array<{ system?: string; value?: string }>;
}

const GENDER_MAP: Record<string, Patient['gender']> = {
  male: 'male',
  female: 'female',
  other: 'other',
  unknown: 'unknown',
};

export function mapFhirToDbPatient(fhir: FhirPatient): Patient {
  const gender = GENDER_MAP[fhir.gender?.toLowerCase() || 'unknown'] || 'unknown';

  return {
    id: fhir.id,
    name_family: fhir.name?.[0]?.family || '',
    name_given: fhir.name?.[0]?.given || [],
    birth_date: fhir.birthDate || '',
    gender,
    active: fhir.active !== false,
    identifier_bsn: fhir.identifier?.find(
      (id) => id.system === 'http://fhir.nl/fhir/NamingSystem/bsn'
    )?.value || null,
    identifier_client_number: fhir.identifier?.find(
      (id) => id.system?.includes('client') || id.system?.includes('999.7.6')
    )?.value || null,
    // Null defaults for optional fields
    status: null,
    created_at: null,
    updated_at: null,
    address_line: null,
    address_city: null,
    address_postal_code: null,
    address_country: null,
    telecom_email: null,
    telecom_phone: null,
    name_prefix: null,
    name_use: null,
    emergency_contact_name: null,
    emergency_contact_phone: null,
    emergency_contact_relationship: null,
    general_practitioner_name: null,
    general_practitioner_agb: null,
    insurance_company: null,
    insurance_number: null,
    is_john_doe: null,
  };
}
```

**E0.S4 - usePatientSelection:**
```typescript
// lib/cortex/hooks/use-patient-selection.ts

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCortexStore } from '@/stores/cortex-store';
import { safeFetch, getErrorInfo } from '@/lib/cortex/error-handler';
import { mapFhirToDbPatient } from '@/lib/fhir/patient-mapper';
import type { PatientSearchResult } from './use-patient-search';

interface UsePatientSelectionOptions {
  onSuccess?: (patientName: string) => void;
  addToRecent?: boolean;
}

export function usePatientSelection(options: UsePatientSelectionOptions = {}) {
  const { onSuccess, addToRecent = true } = options;
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { toast } = useToast();

  const { setActivePatient, addRecentPatient, addRecentAction } = useCortexStore();

  const selectPatient = async (patient: PatientSearchResult) => {
    setIsSelecting(true);
    setSelectedId(patient.id);

    try {
      // Fetch full FHIR patient data
      const response = await safeFetch(
        `/api/fhir/Patient/${patient.id}`,
        undefined,
        { operation: 'Patient data ophalen' }
      );
      const fhirPatient = await response.json();

      // Map to DB format
      const dbPatient = mapFhirToDbPatient(fhirPatient);

      // Update store
      setActivePatient(dbPatient);

      if (addToRecent) {
        addRecentPatient(dbPatient);
        addRecentAction({
          intent: 'zoeken',
          label: `Patient geselecteerd: ${patient.name}`,
          patientName: patient.name,
        });
      }

      toast({
        title: 'Patient geselecteerd',
        description: `${patient.name} is nu actief`,
      });

      onSuccess?.(patient.name);

      return dbPatient;
    } catch (error) {
      console.error('Failed to select patient:', error);
      const errorInfo = getErrorInfo(error, { operation: 'Patient selecteren' });
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.description,
      });
      return null;
    } finally {
      setIsSelecting(false);
      setSelectedId(null);
    }
  };

  return {
    selectPatient,
    isSelecting,
    selectedId,
  };
}
```

**Deliverables E0:** ✅ Completed 03-01-2025
- `lib/cortex/hooks/use-patient-search.ts` (116 regels)
- `lib/cortex/hooks/use-patient-selection.ts` (98 regels)
- `lib/cortex/hooks/index.ts` (7 regels)
- `lib/fhir/patient-mapper.ts` (109 regels)
- `components/cortex/shared/patient-list-item.tsx` (114 regels)
- ZoekenBlock refactored: 349 → 127 regels (-64%)

---

### Epic 1 — Patient Sidebar

**Epic Doel:** Collapsible overlay sidebar voor snelle patient selectie.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E1.S1 | `recentPatients` in store | Max 5, nieuwste eerst, geen duplicaten | ✅ | E0.S4 | 1 |
| E1.S2 | PatientSidebar component | Overlay sidebar met search + recent | ✅ | E1.S1 | 2 |
| E1.S3 | Toggle button + Cmd+P shortcut | Knop in ContextBar, keyboard shortcut | ✅ | E1.S2 | 2 |
| E1.S4 | Click-to-select flow | Selectie sluit sidebar, zet activePatient | ✅ | E1.S3 | 1 |

**Technical Notes:**

**E1.S1 - Store uitbreiding (minimal):**
```typescript
// stores/cortex-store.ts - Alleen toevoegen:

// In interface:
recentPatients: Patient[];
patientSidebarOpen: boolean;

addRecentPatient: (patient: Patient) => void;
togglePatientSidebar: () => void;

// In initialState:
recentPatients: [],
patientSidebarOpen: false,

// In actions:
addRecentPatient: (patient) => set((state) => ({
  recentPatients: [
    patient,
    ...state.recentPatients.filter(p => p.id !== patient.id)
  ].slice(0, 5)
}), false, 'addRecentPatient'),

togglePatientSidebar: () => set((state) => ({
  patientSidebarOpen: !state.patientSidebarOpen
}), false, 'togglePatientSidebar'),
```

**E1.S2 - PatientSidebar (overlay):**
```typescript
// components/cortex/patient-sidebar/patient-sidebar.tsx

'use client';

import { useEffect, useRef } from 'react';
import { X, Search, Clock, Users } from 'lucide-react';
import { useCortexStore } from '@/stores/cortex-store';
import { usePatientSearch } from '@/lib/cortex/hooks/use-patient-search';
import { usePatientSelection } from '@/lib/cortex/hooks/use-patient-selection';
import { PatientListItem } from '@/components/cortex/shared/patient-list-item';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function PatientSidebar() {
  const { patientSidebarOpen, togglePatientSidebar, recentPatients } = useCortexStore();
  const { query, setQuery, results, isSearching } = usePatientSearch({ limit: 5 });
  const { selectPatient, isSelecting, selectedId } = usePatientSelection({
    onSuccess: () => togglePatientSidebar(),
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (patientSidebarOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [patientSidebarOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && patientSidebarOpen) {
        togglePatientSidebar();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [patientSidebarOpen, togglePatientSidebar]);

  if (!patientSidebarOpen) return null;

  const showResults = query.length >= 2;
  const showRecent = !showResults && recentPatients.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={togglePatientSidebar}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Patienten
          </h2>
          <button
            onClick={togglePatientSidebar}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Zoek patient..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Search Results */}
          {showResults && (
            <div className="space-y-1">
              {isSearching ? (
                <p className="text-sm text-slate-500 text-center py-4">Zoeken...</p>
              ) : results.length > 0 ? (
                results.map((patient) => (
                  <PatientListItem
                    key={patient.id}
                    patient={patient}
                    isLoading={selectedId === patient.id}
                    onClick={() => selectPatient(patient)}
                    size="sm"
                  />
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  Geen resultaten voor "{query}"
                </p>
              )}
            </div>
          )}

          {/* Recent Patients */}
          {showRecent && (
            <div>
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Recent
              </h3>
              <div className="space-y-1">
                {recentPatients.map((patient) => (
                  <PatientListItem
                    key={patient.id}
                    patient={{
                      id: patient.id,
                      name: `${patient.name_given?.[0] || ''} ${patient.name_family || ''}`.trim(),
                      birthDate: patient.birth_date || '',
                      identifier_bsn: patient.identifier_bsn || undefined,
                      identifier_client_number: patient.identifier_client_number || undefined,
                      matchScore: 1,
                    }}
                    isLoading={selectedId === patient.id}
                    onClick={() => selectPatient({
                      id: patient.id,
                      name: `${patient.name_given?.[0] || ''} ${patient.name_family || ''}`.trim(),
                      birthDate: patient.birth_date || '',
                      matchScore: 1,
                    })}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!showResults && !showRecent && (
            <p className="text-sm text-slate-500 text-center py-8">
              Typ om te zoeken of selecteer een recente patient
            </p>
          )}
        </div>
      </div>
    </>
  );
}
```

**E1.S3 - Toggle in ContextBar + shortcut:**
```typescript
// In ContextBar, add button:
<button
  onClick={togglePatientSidebar}
  className="p-2 hover:bg-slate-100 rounded-lg"
  title="Patienten (Cmd+P)"
>
  <Users className="w-4 h-4" />
</button>

// Global shortcut (in CommandCenter):
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
      e.preventDefault();
      togglePatientSidebar();
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [togglePatientSidebar]);
```

**Deliverables E1:** ✅ Completed 03-01-2025
- `stores/cortex-store.ts` - recentPatients, patientSidebarOpen state + actions
- `components/cortex/patient-sidebar/patient-sidebar.tsx` (195 regels)
- `components/cortex/patient-sidebar/index.ts` (1 regel)
- `components/cortex/command-center/context-bar.tsx` - Users toggle button
- `components/cortex/command-center/command-center.tsx` - Cmd+P shortcut, PatientSidebar integratie

---

### Epic 2 — @Mention Systeem

**Epic Doel:** Inline patient selectie via @naam in de chat input.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E2.S1 | @-detectie in CommandInput | Detecteer @ + query, track positie | ⏳ | E0.S1 | 2 |
| E2.S2 | PatientMentionDropdown | Dropdown met resultaten, positioned above | ⏳ | E2.S1 | 2 |
| E2.S3 | Enter/Escape handling | Enter selecteert, Escape sluit | ⏳ | E2.S2 | 1 |
| E2.S4 | Mention verwerking | Replace @query met naam, track mention | ⏳ | E2.S3 | 2 |
| E2.S5 | API integratie | Mention data meesturen naar /api/cortex/chat | ⏳ | E2.S4 | 1 |

**Technical Notes:**

**E2.S1 - @ detectie:**
```typescript
// In CommandInput - state toevoegen:
interface MentionState {
  active: boolean;
  query: string;
  startIndex: number;
}

const [mentionState, setMentionState] = useState<MentionState | null>(null);
const [selectedMentions, setSelectedMentions] = useState<Array<{
  patientId: string;
  patientName: string;
  startIndex: number;
  endIndex: number;
}>>([]);

// In handleInputChange:
const handleInputChange = (value: string) => {
  setInputValue(value);

  // Detect @ mention
  const lastAtIndex = value.lastIndexOf('@');
  if (lastAtIndex !== -1) {
    const textAfterAt = value.slice(lastAtIndex + 1);
    // Check if there's no space after @ (still typing mention)
    if (!textAfterAt.includes(' ') && textAfterAt.length > 0) {
      setMentionState({
        active: true,
        query: textAfterAt,
        startIndex: lastAtIndex,
      });
      return;
    }
  }
  setMentionState(null);
};
```

**E2.S2 - PatientMentionDropdown:**
```typescript
// components/cortex/command-center/patient-mention-dropdown.tsx

'use client';

import { useEffect, useRef } from 'react';
import { usePatientSearch } from '@/lib/cortex/hooks/use-patient-search';
import { PatientListItem } from '@/components/cortex/shared/patient-list-item';
import { Loader2 } from 'lucide-react';

interface PatientMentionDropdownProps {
  query: string;
  onSelect: (patient: { id: string; name: string }) => void;
  onClose: () => void;
}

export function PatientMentionDropdown({
  query,
  onSelect,
  onClose,
}: PatientMentionDropdownProps) {
  const { results, isSearching } = usePatientSearch({
    debounceMs: 150,  // Faster for dropdown
    limit: 5,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Set query directly (hook manages debounce)
  useEffect(() => {
    // The hook will auto-search when we update via setQuery
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-0 mb-2 w-72 bg-white border rounded-lg shadow-lg z-50 overflow-hidden"
    >
      {isSearching ? (
        <div className="p-3 flex items-center justify-center text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-sm">Zoeken...</span>
        </div>
      ) : results.length > 0 ? (
        <div className="p-1 space-y-0.5">
          {results.map((patient) => (
            <PatientListItem
              key={patient.id}
              patient={patient}
              onClick={() => onSelect({ id: patient.id, name: patient.name })}
              size="sm"
            />
          ))}
        </div>
      ) : query.length >= 2 ? (
        <div className="p-3 text-sm text-slate-500 text-center">
          Geen resultaten voor "@{query}"
        </div>
      ) : (
        <div className="p-3 text-sm text-slate-500 text-center">
          Typ minimaal 2 karakters
        </div>
      )}
    </div>
  );
}
```

**E2.S3 & E2.S4 - Keyboard + mention verwerking:**
```typescript
// In CommandInput:

const handleMentionSelect = (patient: { id: string; name: string }) => {
  if (!mentionState) return;

  // Replace @query with patient name
  const beforeMention = inputValue.slice(0, mentionState.startIndex);
  const afterMention = inputValue.slice(mentionState.startIndex + mentionState.query.length + 1);
  const newValue = `${beforeMention}@${patient.name}${afterMention}`;

  setInputValue(newValue);

  // Track mention
  setSelectedMentions(prev => [...prev, {
    patientId: patient.id,
    patientName: patient.name,
    startIndex: mentionState.startIndex,
    endIndex: mentionState.startIndex + patient.name.length + 1,
  }]);

  setMentionState(null);
};

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (mentionState?.active) {
    if (e.key === 'Escape') {
      e.preventDefault();
      setMentionState(null);
    }
    // Enter handled by dropdown item click
  }
  // ... existing key handling
};
```

**E2.S5 - API payload:**
```typescript
// In handleSubmit:

const handleSubmit = async () => {
  // Clean message (remove @ symbols for display)
  const cleanedMessage = inputValue;

  const payload = {
    message: cleanedMessage,
    messages: chatMessages.slice(-20),
    context: { activePatient, shift },
    mentions: selectedMentions.map(m => ({
      patientId: m.patientId,
      patientName: m.patientName,
    })),
  };

  // ... send to API

  // Clear mentions after submit
  setSelectedMentions([]);
};
```

**Deliverables E2:**
- `components/cortex/command-center/patient-mention-dropdown.tsx`
- CommandInput updates voor @ detectie, keyboard, mention tracking
- API payload uitbreiding met mentions array

---

### Epic 3 — Smart Defaults

**Epic Doel:** ActivePatient automatisch gebruiken in blocks wanneer geen patient expliciet genoemd.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E3.S1 | DagnotatieBlock auto-prefill | Als geen prefill patient, gebruik activePatient | ⏳ | E2.S5 | 2 |
| E3.S2 | Andere blocks activePatient | OverdrachtBlock, Appointment blocks | ⏳ | E3.S1 | 2 |
| E3.S3 | Re-route na patient selectie | Gebruik `pendingAction` voor re-route | ⏳ | E3.S2 | 1 |

**Technical Notes:**

**E3.S1 - DagnotatieBlock:**
```typescript
// In DagnotatieBlock - update initialisatie:

const activePatient = useCortexStore(s => s.activePatient);

// Prefill met fallback naar activePatient
const [patientId, setPatientId] = useState<string>(
  prefill?.patientId || activePatient?.id || ''
);
const [patientName, setPatientName] = useState<string>(
  prefill?.patientName ||
  (activePatient
    ? `${activePatient.name_given?.[0] || ''} ${activePatient.name_family || ''}`.trim()
    : '')
);

// Update als activePatient wijzigt (alleen als geen prefill)
useEffect(() => {
  if (!prefill?.patientId && activePatient) {
    setPatientId(activePatient.id);
    setPatientName(
      `${activePatient.name_given?.[0] || ''} ${activePatient.name_family || ''}`.trim()
    );
  }
}, [activePatient, prefill?.patientId]);
```

**E3.S3 - Re-route met pendingAction:**
```typescript
// In usePatientSelection hook - extend onSuccess:

const { pendingAction, setPendingAction, openArtifact } = useCortexStore();

// After successful selection:
if (pendingAction && !pendingAction.entities.patientId) {
  // Re-open artifact with patient info
  openArtifact({
    type: pendingAction.artifact?.type || pendingAction.intent,
    title: `${pendingAction.intent} - ${patient.name}`,
    prefill: {
      ...pendingAction.entities,
      patientId: dbPatient.id,
      patientName: patient.name,
    },
  });
  setPendingAction(null);
}
```

**Deliverables E3:**
- DagnotatieBlock update met activePatient fallback
- Andere blocks update (OverdrachtBlock, CreateAppointmentBlock, etc.)
- usePatientSelection update voor pendingAction re-route

---

## 5. Kwaliteit & Testplan

### Test Checklist

**Epic 0 - Refactor:**
- [ ] `usePatientSearch` hook werkt standalone
- [ ] `PatientListItem` rendert correct
- [ ] `mapFhirToDbPatient` mapped correct
- [ ] ZoekenBlock werkt nog na refactor
- [ ] Geen regressies in bestaande functionaliteit

**Epic 1 - Sidebar:**
- [ ] Cmd+P opent/sluit sidebar
- [ ] Zoeken toont resultaten
- [ ] Recent patients tonen
- [ ] Click selecteert patient
- [ ] Escape sluit sidebar
- [ ] Backdrop click sluit sidebar

**Epic 2 - @Mention:**
- [ ] @ toont dropdown
- [ ] Typen filtert resultaten
- [ ] Enter selecteert (via click)
- [ ] Escape sluit dropdown
- [ ] @Naam vervangt @query
- [ ] Mention data in API payload

**Epic 3 - Smart Defaults:**
- [ ] DagnotatieBlock prefilled met activePatient
- [ ] Andere blocks prefilled
- [ ] pendingAction re-route werkt

---

## 6. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| Refactor breekt ZoekenBlock | Medium | Hoog | Stapsgewijze extract, test na elke stap |
| Sidebar overlay storend | Laag | Medium | Backdrop transparant, easy dismiss |
| @mention performance | Laag | Medium | Debounce 150ms, max 5 results |
| Mobile UX sidebar | Medium | Medium | Later itereren, focus eerst desktop |

---

## 7. Referenties

**Project Documents:**
- UX Analyse: `docs/intent/patient-search/ux-analyse-patient-selectie.md`
- Cortex Bouwplan: `docs/archive/swift/bouwplan-swift-v3.md`

**Code References:**
- ZoekenBlock (bron): `components/cortex/blocks/zoeken-block.tsx`
- CommandInput: `components/cortex/command-center/command-input.tsx`
- Store: `stores/cortex-store.ts`
- Patient Search API: `app/api/patients/search/route.ts`

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 03-01-2025 | Colin Lit | Initiele versie |
| v1.1 | 03-01-2025 | Colin Lit | Review: DRY/KISS/SOC/YAGNI toegepast, Epic 0 toegevoegd, SP gereduceerd van 38 naar 23 |
| v1.2 | 03-01-2025 | Colin Lit | Epic 0 compleet: 4 stories done, ZoekenBlock refactored (-64% code) |
| v1.3 | 03-01-2025 | Claude Code | Epic 1 compleet: Patient Sidebar met Cmd+P, search, recent patients |
