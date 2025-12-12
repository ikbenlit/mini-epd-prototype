# ⚙️ Technisch Ontwerp (TO) – Diagnose Module

**Projectnaam:** Diagnose Module - Mini EPD
**Versie:** v1.0
**Datum:** 11-12-2024
**Auteur:** Colin Lit

---

## 1. Doel en relatie met PRD en FO

🎯 **Doel van dit document:**
Het Technisch Ontwerp beschrijft **hoe** de diagnosemodule technisch wordt geïmplementeerd. Dit document vertaalt het FO naar concrete code-structuren, database-wijzigingen en componenten.

📘 **Toelichting:**
De diagnosemodule bouwt voort op de bestaande `conditions` tabel (FHIR-inspired) en breidt de huidige basic UI uit met een doorzoekbare ICD-10 codelijst en verbeterde UX.

**Relatie met documenten:**
- PRD: `docs/specs/diagnose/prd-diagnose-module-v1.md` (v1.1)
- FO: `docs/specs/diagnose/fo-diagnose-module-v1.md` (v1.1)

---

## 2. Technische Architectuur Overzicht

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │ DiagnosisTab    │───▶│ DiagnosisModal  │───▶│ ICD10Search │ │
│  │ (page.tsx)      │    │ (Dialog)        │    │ (Combobox)  │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│           │                      │                              │
│           ▼                      ▼                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               Server Actions (actions.ts)                │   │
│  │  • createDiagnosis()  • updateDiagnosis()  • deleteDiagnosis() │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                         │
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │  patients   │◀──▶│  conditions │◀──▶│     intakes         │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Statische Data (JSON)                         │
│                                                                  │
│  lib/data/icd10-ggz-codes.json  (~50 codes, client-side)        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Dependency Analyse

### Bestaande dependencies (reeds aanwezig)

| Dependency | Versie | Gebruik |
|------------|--------|---------|
| `@radix-ui/react-dialog` | ^1.1.15 | Modal voor diagnose invoer |
| `@radix-ui/react-select` | ^2.2.6 | Dropdowns (ernst, status) |
| `lucide-react` | ^0.553.0 | Icons (Search, Plus, Trash) |
| `date-fns` | ^4.1.0 | Datum formatting |
| `zod` | ^4.1.12 | Input validatie |
| `react-hook-form` | ^7.66.1 | Form handling |
| `@hookform/resolvers` | ^5.2.2 | Zod resolver |

### Nieuwe dependency (toe te voegen)

| Dependency | Versie | Gebruik | Alternatief |
|------------|--------|---------|-------------|
| `cmdk` | ^1.0.0 | Autocomplete/Combobox voor ICD-10 zoeken | Custom met Radix Popover |

**Aanbeveling:** Voeg `cmdk` toe voor de autocomplete functionaliteit. Dit is de standaard voor shadcn/ui Command component.

```bash
pnpm add cmdk
```

**Alternatief:** Bouw custom autocomplete met bestaande `@radix-ui/react-popover` + input. Minder features maar geen extra dependency.

---

## 4. Database Schema

### Bestaande `conditions` tabel (geen wijzigingen nodig)

De huidige `conditions` tabel is al FHIR-compliant en bevat alle benodigde velden:

```sql
-- Bestaande tabel (lib/supabase/database.types.ts:291-369)
conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  encounter_id UUID REFERENCES intakes(id),  -- Gekoppelde intake

  -- ICD-10/DSM-5 classificatie
  code_code TEXT NOT NULL,                    -- "F32.1"
  code_display TEXT NOT NULL,                 -- "Matige depressieve episode"
  code_system TEXT DEFAULT 'ICD-10',          -- "ICD-10" of "DSM-5"

  -- Status (FHIR enums)
  clinical_status condition_clinical_status DEFAULT 'active',
    -- active | recurrence | relapse | inactive | remission | resolved
  verification_status condition_verification_status DEFAULT 'confirmed',
    -- unconfirmed | provisional | differential | confirmed | refuted | entered-in-error

  -- Ernst
  severity_code TEXT,                         -- "mild" | "moderate" | "severe"
  severity_display TEXT,                      -- "Licht" | "Matig" | "Ernstig"

  -- Timing
  onset_datetime TIMESTAMPTZ,
  recorded_date DATE DEFAULT CURRENT_DATE,

  -- Extra
  note TEXT,                                  -- Onderbouwing
  category TEXT DEFAULT 'encounter-diagnosis',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Optionele schema-uitbreiding (later)

Voor de toekomst kunnen deze velden worden toegevoegd via migratie:

```sql
-- Optioneel: nieuwe velden voor uitgebreide functionaliteit
ALTER TABLE conditions ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;
ALTER TABLE conditions ADD COLUMN IF NOT EXISTS dsm5_reference TEXT;
```

**Besluit:** Voor het prototype gebruiken we de bestaande velden. `is_primary` kan worden afgeleid uit volgorde of in `note` worden vastgelegd.

---

## 5. Statische ICD-10 Data

### Bestandslocatie

```
lib/data/icd10-ggz-codes.json
```

### Data structuur

```typescript
// lib/types/icd10.ts
export interface ICD10Code {
  code: string;        // "F32.1"
  display: string;     // "Matige depressieve episode"
  category: string;    // "Depressie"
  keywords?: string[]; // ["depressief", "somber", "neerslachtig"]
}

export interface ICD10Category {
  name: string;
  codes: ICD10Code[];
}
```

### Voorbeeld data (~50 codes)

```json
{
  "version": "ICD-10-GM 2024",
  "source": "WHO (publiek domein)",
  "categories": [
    {
      "name": "Depressieve stoornissen",
      "codes": [
        { "code": "F32.0", "display": "Lichte depressieve episode", "keywords": ["depressie", "licht"] },
        { "code": "F32.1", "display": "Matige depressieve episode", "keywords": ["depressie", "matig"] },
        { "code": "F32.2", "display": "Ernstige depressieve episode zonder psychotische kenmerken", "keywords": ["depressie", "ernstig"] },
        { "code": "F32.3", "display": "Ernstige depressieve episode met psychotische kenmerken", "keywords": ["depressie", "psychose"] },
        { "code": "F33.0", "display": "Recidiverende depressieve stoornis, huidige episode licht", "keywords": ["recidiverend"] },
        { "code": "F33.1", "display": "Recidiverende depressieve stoornis, huidige episode matig", "keywords": ["recidiverend"] },
        { "code": "F33.2", "display": "Recidiverende depressieve stoornis, huidige episode ernstig", "keywords": ["recidiverend"] }
      ]
    },
    {
      "name": "Angststoornissen",
      "codes": [
        { "code": "F40.0", "display": "Agorafobie", "keywords": ["angst", "plein", "open ruimte"] },
        { "code": "F40.1", "display": "Sociale fobie", "keywords": ["sociaal", "angst", "vermijding"] },
        { "code": "F40.2", "display": "Specifieke fobie", "keywords": ["fobie", "specifiek"] },
        { "code": "F41.0", "display": "Paniekstoornis", "keywords": ["paniek", "aanval"] },
        { "code": "F41.1", "display": "Gegeneraliseerde angststoornis", "keywords": ["gad", "piekeren", "angst"] },
        { "code": "F41.2", "display": "Gemengde angststoornis en depressieve stoornis", "keywords": ["gemengd"] }
      ]
    },
    {
      "name": "Trauma- en stressorgerelateerde stoornissen",
      "codes": [
        { "code": "F43.0", "display": "Acute stressreactie", "keywords": ["stress", "acuut"] },
        { "code": "F43.1", "display": "Posttraumatische stressstoornis", "keywords": ["ptss", "trauma"] },
        { "code": "F43.2", "display": "Aanpassingsstoornis", "keywords": ["aanpassing", "stress"] }
      ]
    }
  ]
}
```

---

## 6. Component Structuur

### Bestandsstructuur

```
app/epd/patients/[id]/intakes/[intakeId]/diagnosis/
├── page.tsx                          # Server component (bestaand)
└── components/
    ├── diagnosis-manager.tsx         # Refactor: lijst + modal trigger
    ├── diagnosis-card.tsx            # Nieuwe: diagnose weergave card
    ├── diagnosis-modal.tsx           # Nieuwe: invoer/bewerk modal
    └── icd10-combobox.tsx            # Nieuwe: autocomplete zoeken

lib/data/
└── icd10-ggz-codes.json              # Statische codelijst

lib/types/
└── icd10.ts                          # TypeScript types
```

### Component specificaties

#### 1. `DiagnosisModal` (nieuw)

```typescript
// components/diagnosis-modal.tsx
interface DiagnosisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  intakeId: string;
  diagnosis?: Condition; // undefined = nieuw, anders = bewerk
}

// Features:
// - Dialog wrapper (Radix)
// - Form met react-hook-form + zod
// - ICD10Combobox voor code selectie
// - Dropdowns voor ernst/status
// - Textarea voor onderbouwing
```

#### 2. `ICD10Combobox` (nieuw)

```typescript
// components/icd10-combobox.tsx
interface ICD10ComboboxProps {
  value: string;
  onSelect: (code: ICD10Code) => void;
  placeholder?: string;
}

// Features:
// - cmdk Command component
// - Client-side filtering op code + display + keywords
// - Debounce 200ms
// - Max 8 resultaten
// - Snelkeuze bij leeg veld (top 5)
```

#### 3. `DiagnosisCard` (nieuw)

```typescript
// components/diagnosis-card.tsx
interface DiagnosisCardProps {
  diagnosis: Condition;
  isPrimary?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

// Features:
// - Code + beschrijving
// - Ernst + status badges
// - Datum
// - Expand/collapse voor onderbouwing
// - Context menu (bewerk, verwijder)
```

---

## 7. Server Actions Refactor

### Huidige actions (aanpassen)

```typescript
// app/epd/patients/[id]/intakes/[intakeId]/actions.ts

// Bestaand - werkt, kleine aanpassing code_system
export async function createDiagnosis(payload: DiagnosisPayload) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('conditions').insert({
    patient_id: payload.patientId,
    encounter_id: payload.intakeId,
    code_code: payload.code,
    code_display: payload.description,
    code_system: 'ICD-10',  // Wijzig van 'DSM-5' naar 'ICD-10'
    clinical_status: payload.status || 'active',
    severity_display: payload.severity || null,
    note: payload.notes,
    recorded_date: new Date().toISOString(),
  });
  // ...
}

// Nieuw - update functie
export async function updateDiagnosis(
  diagnosisId: string,
  payload: Partial<DiagnosisPayload>
) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from('conditions')
    .update({
      code_code: payload.code,
      code_display: payload.description,
      clinical_status: payload.status,
      severity_display: payload.severity,
      note: payload.notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', diagnosisId);
  // ...
}
```

### Uitgebreide payload type

```typescript
export interface DiagnosisPayload {
  patientId: string;
  intakeId: string;
  code: string;
  description: string;
  severity?: 'licht' | 'matig' | 'ernstig';
  status?: 'active' | 'remission' | 'resolved' | 'entered-in-error';
  notes?: string;
  dsm5Reference?: string;  // Optioneel vrije tekst veld
}
```

---

## 8. Zod Validatie Schema

```typescript
// lib/schemas/diagnosis.ts
import { z } from 'zod';

export const diagnosisSchema = z.object({
  code: z.string()
    .min(1, 'ICD-10 code is verplicht')
    .regex(/^F\d{2}(\.\d{1,2})?$/, 'Ongeldige ICD-10 code'),
  description: z.string()
    .min(1, 'Beschrijving is verplicht')
    .max(200, 'Beschrijving mag maximaal 200 tekens zijn'),
  severity: z.enum(['licht', 'matig', 'ernstig']),
  status: z.enum(['active', 'remission', 'resolved', 'entered-in-error'])
    .default('active'),
  notes: z.string()
    .max(500, 'Onderbouwing mag maximaal 500 tekens zijn')
    .optional(),
  dsm5Reference: z.string()
    .max(100, 'DSM-5 referentie mag maximaal 100 tekens zijn')
    .optional(),
});

export type DiagnosisFormData = z.infer<typeof diagnosisSchema>;
```

---

## 9. Implementatie Stappenplan

### Fase 1: Data & Types (1-2 uur)
1. Creëer `lib/data/icd10-ggz-codes.json` met ~50 codes
2. Creëer `lib/types/icd10.ts` met TypeScript types
3. Creëer `lib/schemas/diagnosis.ts` met Zod schema

### Fase 2: Componenten (3-4 uur)
4. Installeer `cmdk` dependency
5. Creëer `ICD10Combobox` component
6. Creëer `DiagnosisModal` component
7. Creëer `DiagnosisCard` component

### Fase 3: Integratie (2 uur)
8. Refactor `diagnosis-manager.tsx` naar nieuwe componenten
9. Update server actions (ICD-10, update functie)
10. Test flows: toevoegen, bewerken, verwijderen

### Fase 4: Polish (1 uur)
11. Lege staten en error handling
12. Loading states
13. Toast feedback

---

## 10. Testen

### Handmatige test scenario's

| # | Scenario | Verwacht resultaat |
|---|----------|-------------------|
| 1 | Zoek "depressie" | Toont F32.x codes |
| 2 | Zoek "F41" | Toont angststoornissen |
| 3 | Selecteer code | Vult beschrijving automatisch |
| 4 | Opslaan zonder code | Validatiefout |
| 5 | Bewerk bestaande | Modal met voorgevulde waarden |
| 6 | Verwijder diagnose | Bevestiging + toast |
| 7 | Leeg veld | Toont top 5 snelkeuze |

### Build verificatie

```bash
pnpm build  # Moet slagen zonder type errors
```

---

## 11. Risico's & Mitigatie

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| cmdk bundle size | Laag | ~10KB gzipped, acceptabel |
| ICD-10 codes incompleet | Laag | Start met 50, uitbreiden op aanvraag |
| Performance filtering | Laag | 50 codes is instant client-side |
| Bestaande data breekt | Middel | Backward compatible, DSM-5 data blijft werken |

---

## 12. Bijlagen & Referenties

### Projectdocumenten
- PRD: `docs/specs/diagnose/prd-diagnose-module-v1.md`
- FO: `docs/specs/diagnose/fo-diagnose-module-v1.md`

### Bestaande code
- `app/epd/patients/[id]/intakes/[intakeId]/diagnosis/` — Huidige implementatie
- `app/epd/patients/[id]/intakes/[intakeId]/actions.ts` — Server actions
- `lib/supabase/database.types.ts` — Database types

### Externe referenties
- [cmdk documentation](https://cmdk.paco.me/)
- [shadcn/ui Command](https://ui.shadcn.com/docs/components/command)
- [ICD-10-GM 2024](https://www.dimdi.de/dynamic/de/klassifikationen/icd/icd-10-gm/)

---

*Document laatst bijgewerkt: 11-12-2024*
