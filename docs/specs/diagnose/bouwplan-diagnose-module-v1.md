# Mission Control — Bouwplan Diagnose Module

**Projectnaam:** Diagnose Module - Mini EPD
**Versie:** v1.1
**Datum:** 11-12-2024
**Auteur:** Colin Lit

---

## 1. Doel en context

**Doel:** De bestaande diagnose-functionaliteit uitbreiden naar een volwaardige module met doorzoekbare ICD-10 classificatie, verbeterde UX en hoofd-/nevendiagnose ondersteuning.

**Toelichting:**
De huidige implementatie (`diagnosis-manager.tsx`) is een basic formulier met handmatige code-invoer. Dit bouwplan beschrijft de upgrade naar:
- Doorzoekbare **ICD-10 codelijst** (~50 GGZ-codes, client-side filtering)
- **Modal-based invoer** (in plaats van inline formulier)
- **Diagnose cards** met visuele status badges
- Hoofd-/nevendiagnose markering
- DSM-5 referentieveld (vrije tekst)

**Referentiedocumenten:**
- PRD: `docs/specs/diagnose/prd-diagnose-module-v1.md` (v1.1)
- FO: `docs/specs/diagnose/fo-diagnose-module-v1.md` (v1.1)
- TO: `docs/specs/diagnose/to-diagnose-module-v1.md` (v1.0)

---

## 2. Uitgangspunten

### 2.1 Technische Stack
- **Frontend:** Next.js 14 App Router + Tailwind CSS + shadcn/ui
- **Database:** Supabase PostgreSQL (bestaande `conditions` tabel)
- **UI Components:** shadcn/ui Dialog, Command (cmdk), Badge, Card
- **Form Handling:** react-hook-form + zod
- **Icons:** Lucide React

### 2.2 Projectkaders
- **Scope:** Prototype voor demo
- **Data:** Statische ICD-10 JSON (~50 codes), geen API call
- **Licentie:** ICD-10 = publiek domein (WHO). DSM-5 vereist licentie.
- **AI:** Optioneel / post-MVP

### 2.3 Programmeer Uitgangspunten

**Code Quality Principles:**
- **DRY:** Herbruikbare ICD-10 zoekcomponent, diagnose types
- **KISS:** Client-side filtering (geen server call voor 50 codes)
- **SOC:** Modal logica gescheiden van lijst weergave
- **YAGNI:** Geen AI-suggesties in v1, geen patiënt-breed overzicht

**Development Practices:**
- Bestaande `conditions` tabel gebruiken (geen schema wijzigingen)
- Server actions in bestaande `actions.ts` uitbreiden
- shadcn/ui Command component voor autocomplete

---

## 3. Epics & Stories Overzicht

| Epic ID | Titel | Doel | Status | Stories | Opmerkingen |
|---------|-------|------|--------|---------|-------------|
| E0 | Data & Types | ICD-10 codelijst en TypeScript types | ✅ Gereed | 3 | JSON + types + schema |
| E1 | UI Componenten | Nieuwe componenten voor diagnose UI | ⏳ To Do | 4 | Modal, Combobox, Card |
| E2 | Integratie | Bestaande code refactoren | ⏳ To Do | 3 | Actions + Manager refactor |
| E3 | Polish & Test | Afronding en testen | ⏳ To Do | 2 | States + handmatige tests |

**Belangrijk:** Voer niet in 1x het volledige plan uit. Bouw per epic en per story.
**Belangrijk:** Installatie van `cmdk` dependency moet eerst aan Colin worden gemeld.

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 — Data & Types
**Epic Doel:** Statische ICD-10 codelijst en TypeScript types voor de module.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E0.S1 | ICD-10 JSON codelijst maken | `lib/data/icd10-ggz-codes.json` met ~50 GGZ-codes, categorieën, keywords | ✅ | — | 3 |
| E0.S2 | TypeScript types voor ICD-10 | `lib/types/icd10.ts` met interfaces en helper functies | ✅ | E0.S1 | 1 |
| E0.S3 | Zod validatieschema | `lib/schemas/diagnosis.ts` voor form validatie met Nederlandse foutmeldingen | ✅ | E0.S2 | 1 |

**Technical Notes:**
- ICD-10 codes: F32.x (depressie), F40.x-F41.x (angst), F43.x (trauma), F60.x (persoonlijkheid), etc.
- Keywords toevoegen voor betere zoekresultaten
- Code format: `/^F\d{2}(\.\d{1,2})?$/`

---

#### E0.S1 — ICD-10 JSON Codelijst

**Doel:** Statische JSON met ~50 GGZ-relevante ICD-10 codes voor client-side filtering.

**Locatie:** `lib/data/icd10-ggz-codes.json`

**Data structuur:**
```json
{
  "version": "ICD-10-GM 2024",
  "source": "WHO (publiek domein)",
  "categories": [
    {
      "name": "Depressieve stoornissen",
      "codes": [
        { "code": "F32.0", "display": "Lichte depressieve episode", "keywords": ["depressie", "licht"] }
      ]
    }
  ],
  "frequentCodes": ["F32.1", "F41.1", "F43.1", "F41.0", "F60.3"]
}
```

**Categorie indeling (~55 codes):**
| Categorie | Codes | Aantal |
|-----------|-------|--------|
| Depressieve stoornissen | F32.x, F33.x | 7 |
| Angststoornissen | F40.x, F41.x | 8 |
| Trauma/stress | F43.x | 4 |
| OCD | F42.x | 3 |
| Bipolaire stoornissen | F31.x | 4 |
| Persoonlijkheidsstoornissen | F60.x | 7 |
| ADHD | F90.x | 2 |
| Autisme | F84.x | 2 |
| Eetstoornissen | F50.x | 3 |
| Schizofrenie/psychose | F20.x, F23.x | 3 |
| Middelengebruik | F10.x-F19.x | 6 |
| Somatoforme/dissociatief | F44.x, F45.x | 4 |
| Slaapstoornissen | F51.x | 2 |

**Acceptatiecriteria:**
- [ ] JSON is valid en parsed zonder errors
- [ ] Alle codes hebben `code`, `display` en `keywords` velden
- [ ] Keywords zijn in het Nederlands
- [ ] `frequentCodes` bevat top 5 meest gebruikte GGZ-codes

---

#### E0.S2 — TypeScript Types

**Doel:** Type-safe interfaces voor ICD-10 data en diagnose operaties.

**Locatie:** `lib/types/icd10.ts`

**Te implementeren types:**
```typescript
// Data types
interface ICD10Code {
  code: string;
  display: string;
  keywords: string[];
}

interface ICD10Category {
  name: string;
  codes: ICD10Code[];
}

interface ICD10CodeList {
  version: string;
  source: string;
  categories: ICD10Category[];
  frequentCodes: string[];
}

// Diagnose types (FHIR compatible)
type DiagnosisSeverity = 'licht' | 'matig' | 'ernstig';
type DiagnosisClinicalStatus = 'active' | 'remission' | 'resolved' | ...;
type DiagnosisType = 'primary' | 'secondary';

// Helper type
type FlatICD10Code = ICD10Code & { category: string };
```

**Helper functies:**
```typescript
flattenICD10Codes(codeList): FlatICD10Code[]
searchICD10Codes(codes, query, maxResults): FlatICD10Code[]
getFrequentCodes(codes, frequentIds): FlatICD10Code[]
```

**Acceptatiecriteria:**
- [ ] Alle types exporteren correct
- [ ] Helper functies zijn type-safe
- [ ] `searchICD10Codes` zoekt op code, display en keywords
- [ ] `pnpm build` slaagt zonder type errors

---

#### E0.S3 — Zod Validatieschema

**Doel:** Form validatie met Nederlandse foutmeldingen.

**Locatie:** `lib/schemas/diagnosis.ts`

**Schema velden:**
| Veld | Type | Verplicht | Validatie |
|------|------|-----------|-----------|
| `code` | string | Ja | Regex: `/^F\d{2}(\.\d{1,2})?$/` |
| `description` | string | Ja | Min 1, max 200 tekens |
| `severity` | enum | Ja | licht / matig / ernstig |
| `diagnosisType` | enum | Ja | primary / secondary |
| `status` | enum | Ja | active / remission / resolved / entered-in-error |
| `dsm5Reference` | string | Nee | Max 100 tekens |
| `notes` | string | Nee | Max 500 tekens |

**Exports:**
```typescript
// Constants
export const DIAGNOSIS_SEVERITIES = ['licht', 'matig', 'ernstig'] as const;
export const DIAGNOSIS_TYPES = ['primary', 'secondary'] as const;
export const DIAGNOSIS_STATUSES = ['active', 'remission', 'resolved', 'entered-in-error'] as const;

// Schemas
export const diagnosisSchema = z.object({...});
export const diagnosisPayloadSchema = diagnosisSchema.extend({ patientId, intakeId });
export const diagnosisUpdateSchema = diagnosisSchema.partial().extend({ id });

// Types
export type DiagnosisFormData = z.infer<typeof diagnosisSchema>;
export type DiagnosisPayload = z.infer<typeof diagnosisPayloadSchema>;

// Defaults
export const diagnosisDefaults: DiagnosisFormData = {...};
```

**Acceptatiecriteria:**
- [ ] Alle foutmeldingen zijn in het Nederlands
- [ ] `diagnosisDefaults` heeft correcte default waarden
- [ ] Schema's zijn compatibel met react-hook-form
- [ ] `pnpm build` slaagt zonder type errors

---

### Epic 1 — UI Componenten
**Epic Doel:** Nieuwe React componenten voor de diagnose-UI.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E1.S1 | ICD-10 Combobox component | Autocomplete zoeken in ICD-10 codes, debounce, max 8 resultaten | ⏳ | E0.S1, E0.S2 | 3 |
| E1.S2 | Diagnose Modal component | Dialog met form, validatie, opslaan/bewerken | ⏳ | E0.S3, E1.S1 | 5 |
| E1.S3 | Diagnose Card component | Weergave per diagnose met badges, expand/collapse, acties | ⏳ | — | 2 |
| E1.S4 | cmdk dependency installeren | `pnpm add cmdk` uitvoeren (Colin) | ⏳ | — | 1 |

**Technical Notes:**
- **E1.S4:** Colin moet `pnpm add cmdk` goedkeuren/uitvoeren
- Gebruik shadcn/ui patterns voor consistentie
- Command component voor autocomplete (cmdk based)

---

#### E1.S1 — ICD-10 Combobox Component

**Doel:** Autocomplete zoekcomponent voor ICD-10 codes met keyboard navigatie.

**Locatie:** `app/epd/patients/[id]/intakes/[intakeId]/diagnosis/components/icd10-combobox.tsx`

**Props interface:**
```typescript
interface ICD10ComboboxProps {
  value: string;                    // Geselecteerde code (bijv. "F32.1")
  onSelect: (code: FlatICD10Code) => void;  // Callback bij selectie
  placeholder?: string;             // Default: "Zoek op code of beschrijving..."
  disabled?: boolean;
}
```

**Functionaliteit:**
| Feature | Beschrijving |
|---------|--------------|
| Zoeken | Filter op code (F32), display (depressie) en keywords |
| Debounce | 200ms delay voor filtering |
| Max resultaten | 8 items in dropdown |
| Snelkeuze | Bij leeg veld: toon top 5 veelgebruikte codes |
| Keyboard | Arrow keys navigatie, Enter selecteert, Escape sluit |
| Display | Code vetgedrukt, beschrijving normaal |

**UI States:**
| State | Weergave |
|-------|----------|
| Leeg veld | Placeholder + snelkeuze dropdown |
| Typing | Zoekresultaten dropdown |
| Geen resultaten | "Geen codes gevonden voor '{query}'" |
| Geselecteerd | Geselecteerde code + beschrijving in input |

**Acceptatiecriteria:**
- [ ] Zoeken werkt op code, display en keywords
- [ ] Debounce voorkomt te veel renders
- [ ] Max 8 resultaten worden getoond
- [ ] Snelkeuze toont top 5 bij leeg veld
- [ ] Keyboard navigatie werkt correct
- [ ] Focus management correct (blur sluit dropdown)

---

#### E1.S2 — Diagnose Modal Component

**Doel:** Modal dialog voor toevoegen en bewerken van diagnoses.

**Locatie:** `app/epd/patients/[id]/intakes/[intakeId]/diagnosis/components/diagnosis-modal.tsx`

**Props interface:**
```typescript
interface DiagnosisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  intakeId: string;
  diagnosis?: Condition;  // undefined = nieuw, Condition = bewerk
  onSuccess: () => void;  // Callback na succesvol opslaan
}
```

**Form velden:**
| Veld | Component | Verplicht | Notes |
|------|-----------|-----------|-------|
| ICD-10 Code | ICD10Combobox | Ja | Autocomplete |
| Ernst | Select | Ja | licht / matig / ernstig |
| Diagnose type | RadioGroup | Ja | Hoofd / Neven |
| Status | Select | Ja | Actief / In remissie / Opgelost |
| DSM-5 referentie | Input | Nee | Vrije tekst |
| Onderbouwing | Textarea | Nee | Max 500 tekens |

**Gedrag:**
| Scenario | Actie |
|----------|-------|
| Nieuw | Lege form met defaults |
| Bewerk | Form voorgevuld met bestaande data |
| Submit | Validatie → Server action → onSuccess → Close |
| Validatiefout | Inline errors onder velden |
| Server error | Toast met foutmelding |

**UI Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Nieuwe diagnose / Diagnose bewerken               [✕]       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ICD-10 Code *                                               │
│ [Combobox: Zoek op code of beschrijving...]                 │
│                                                              │
│ Ernst *                         Diagnose type *             │
│ [Select: Matig ▼]              ○ Hoofddiagnose              │
│                                 ● Nevendiagnose              │
│                                                              │
│ Status *                                                    │
│ [Select: Actief ▼]                                          │
│                                                              │
│ DSM-5 referentie (optioneel)                                │
│ [Input: bijv. Major Depressive Disorder]                    │
│                                                              │
│ Onderbouwing (optioneel)                                    │
│ [Textarea: Klinische redenering...]                         │
│                                                              │
│                              [Annuleren]  [Opslaan]         │
└─────────────────────────────────────────────────────────────┘
```

**Acceptatiecriteria:**
- [ ] Modal opent/sluit correct
- [ ] Form validatie werkt met Nederlandse foutmeldingen
- [ ] ICD-10 combobox integreert correct
- [ ] Bewerk modus vult form voor met bestaande data
- [ ] Opslaan roept juiste server action aan
- [ ] Loading state tijdens opslaan
- [ ] Modal sluit na succesvolle actie

---

#### E1.S3 — Diagnose Card Component

**Doel:** Visuele weergave van een diagnose met acties.

**Locatie:** `app/epd/patients/[id]/intakes/[intakeId]/diagnosis/components/diagnosis-card.tsx`

**Props interface:**
```typescript
interface DiagnosisCardProps {
  diagnosis: Condition;
  isPrimary?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}
```

**UI Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ F32.1 — Matige depressieve episode      HOOFD    [⋮]       │
├─────────────────────────────────────────────────────────────┤
│ Ernst: Matig  │  Status: Actief  │  15 nov 2024            │
├─────────────────────────────────────────────────────────────┤
│ ▼ Onderbouwing                                              │
│ Patiënt voldoet aan 6 van de 9 criteria...                 │
└─────────────────────────────────────────────────────────────┘
```

**Elementen:**
| Element | Beschrijving |
|---------|--------------|
| Code + beschrijving | Vetgedrukt, altijd zichtbaar |
| HOOFD badge | Groen, alleen bij isPrimary |
| Status badge | Kleur per status (groen/blauw/grijs/rood) |
| Ernst | Tekst weergave |
| Datum | Format: d MMM yyyy (NL locale) |
| Onderbouwing | Ingeklapt, expand via chevron |
| Context menu | Bewerk, Verwijder |

**Status badge kleuren:**
| Status | Kleur | Tekst |
|--------|-------|-------|
| active | Groen | Actief |
| remission | Blauw | In remissie |
| resolved | Grijs | Opgelost |
| entered-in-error | Rood | Foutief |

**Acceptatiecriteria:**
- [ ] Card toont alle diagnose informatie
- [ ] HOOFD badge alleen zichtbaar bij isPrimary
- [ ] Status badge heeft correcte kleur
- [ ] Onderbouwing is expand/collapse
- [ ] Context menu met Bewerk/Verwijder
- [ ] Loading state bij verwijderen

---

#### E1.S4 — cmdk Dependency Installeren

**Doel:** Command menu library installeren voor autocomplete functionaliteit.

**Commando:**
```bash
pnpm add cmdk
```

**Alternatief (indien cmdk niet gewenst):**
Custom autocomplete bouwen met:
- `@radix-ui/react-popover` (reeds aanwezig)
- `@radix-ui/react-scroll-area`
- Custom filtering logic

**Acceptatiecriteria:**
- [ ] `pnpm add cmdk` uitgevoerd door Colin
- [ ] Package toegevoegd aan `package.json`
- [ ] `pnpm install` succesvol
- [ ] `pnpm build` slaagt

---

### Epic 2 — Integratie
**Epic Doel:** Bestaande code refactoren en nieuwe componenten integreren.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E2.S1 | Server actions uitbreiden | `updateDiagnosis` functie, code_system naar ICD-10 | ⏳ | E0.S3 | 2 |
| E2.S2 | DiagnosisManager refactoren | Vervang inline form door modal, gebruik DiagnosisCard | ⏳ | E1.S2, E1.S3 | 3 |
| E2.S3 | Page.tsx aanpassen | Pagina tekst updaten, imports aanpassen | ⏳ | E2.S2 | 1 |

---

#### E2.S1 — Server Actions Uitbreiden

**Doel:** Bestaande server actions aanpassen en uitbreiden voor nieuwe functionaliteit.

**Locatie:** `app/epd/patients/[id]/intakes/[intakeId]/actions.ts`

**Wijzigingen in `createDiagnosis`:**
```typescript
// Huidige implementatie
code_system: undefined  // of 'DSM-5'

// Nieuwe implementatie
code_system: 'ICD-10',
category: payload.diagnosisType === 'primary' ? 'primary-diagnosis' : 'encounter-diagnosis',
```

**Nieuwe functie `updateDiagnosis`:**
```typescript
export async function updateDiagnosis(
  diagnosisId: string,
  payload: DiagnosisUpdatePayload
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('conditions')
    .update({
      code_code: payload.code,
      code_display: payload.description,
      clinical_status: payload.status,
      severity_display: payload.severity,
      note: payload.notes,
      category: payload.diagnosisType === 'primary' ? 'primary-diagnosis' : 'encounter-diagnosis',
      updated_at: new Date().toISOString(),
    })
    .eq('id', diagnosisId);

  if (error) {
    return { success: false, error: 'Diagnose bijwerken mislukt' };
  }

  revalidatePath(`/epd/patients/[id]/intakes/[intakeId]/diagnosis`);
  return { success: true };
}
```

**Acceptatiecriteria:**
- [ ] `createDiagnosis` zet code_system op 'ICD-10'
- [ ] `createDiagnosis` zet category correct (primary/encounter)
- [ ] `updateDiagnosis` functie werkt correct
- [ ] Path revalidatie na create/update/delete
- [ ] Foutafhandeling met Nederlandse meldingen

---

#### E2.S2 — DiagnosisManager Refactoren

**Doel:** Bestaande component vervangen door nieuwe UI met modal en cards.

**Locatie:** `app/epd/patients/[id]/intakes/[intakeId]/diagnosis/components/diagnosis-manager.tsx`

**Huidige structuur (te vervangen):**
```
- Inline diagnose lijst
- Inline toevoeg formulier
- Verwijder buttons
```

**Nieuwe structuur:**
```
- DiagnosisCard lijst (met sorteer: hoofd eerst)
- [+ Nieuwe diagnose] button → opent DiagnosisModal
- DiagnosisModal (create/edit)
- Verwijder bevestiging dialog
```

**State management:**
```typescript
const [modalOpen, setModalOpen] = useState(false);
const [editingDiagnosis, setEditingDiagnosis] = useState<Condition | undefined>();
const [deletingId, setDeletingId] = useState<string | null>(null);
```

**Gedrag:**
| Actie | Effect |
|-------|--------|
| [+ Nieuwe diagnose] | `setModalOpen(true)`, `setEditingDiagnosis(undefined)` |
| Card: Bewerk | `setModalOpen(true)`, `setEditingDiagnosis(diagnosis)` |
| Card: Verwijder | Confirm dialog → `deleteDiagnosis()` |
| Modal: Opslaan | `create/updateDiagnosis()` → close modal |

**Acceptatiecriteria:**
- [ ] Inline form verwijderd
- [ ] DiagnosisCard voor elke diagnose
- [ ] Hoofddiagnoses worden eerst getoond
- [ ] Modal opent voor nieuw/bewerk
- [ ] Verwijderen met bevestiging
- [ ] Loading states correct

---

#### E2.S3 — Page.tsx Aanpassen

**Doel:** Server component aanpassen voor nieuwe module.

**Locatie:** `app/epd/patients/[id]/intakes/[intakeId]/diagnosis/page.tsx`

**Wijzigingen:**
```typescript
// Huidige tekst
<p className="text-sm text-slate-600">
  Registreer DSM-5 diagnoses gekoppeld aan deze intake.
</p>

// Nieuwe tekst
<p className="text-sm text-slate-600">
  Registreer diagnoses met ICD-10 classificatie gekoppeld aan deze intake.
</p>
```

**Acceptatiecriteria:**
- [ ] Tekst verwijst naar ICD-10 i.p.v. DSM-5
- [ ] Imports zijn correct
- [ ] Pagina laadt zonder errors

---

### Epic 3 — Polish & Test
**Epic Doel:** Afronding met correcte feedback en handmatige tests.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E3.S1 | Empty states en feedback | Toast bij acties, lege staat tekst, loading indicators | ⏳ | E2.S2 | 1 |
| E3.S2 | Handmatige tests uitvoeren | Alle test scenario's doorlopen en documenteren | ⏳ | E3.S1 | 1 |

---

#### E3.S1 — Empty States en Feedback

**Doel:** Consistente feedback en lege staten voor goede UX.

**Empty states:**
| Context | Tekst | Actie |
|---------|-------|-------|
| Geen diagnoses | "Nog geen diagnoses geregistreerd." | [+ Nieuwe diagnose] button prominent |
| Geen zoekresultaten | "Geen codes gevonden voor '{query}'" | — |

**Toast feedback:**
| Actie | Type | Tekst |
|-------|------|-------|
| Diagnose opgeslagen | Success | "Diagnose opgeslagen" |
| Diagnose bijgewerkt | Success | "Diagnose bijgewerkt" |
| Diagnose verwijderd | Success | "Diagnose verwijderd" |
| Opslaan mislukt | Error | "Opslaan mislukt: {error}" |

**Loading indicators:**
| Context | Indicator |
|---------|-----------|
| Modal opslaan | Button disabled + spinner |
| Verwijderen | Card disabled + spinner |

**Acceptatiecriteria:**
- [ ] Lege staat toont correcte tekst en button
- [ ] Toast feedback bij alle acties
- [ ] Loading indicators zichtbaar
- [ ] Geen UI jumps tijdens laden

---

#### E3.S2 — Handmatige Tests

**Doel:** Alle functionaliteit testen en documenteren.

**Test scenario's:**
| # | Scenario | Stappen | Verwacht resultaat | Status |
|---|----------|---------|-------------------|--------|
| 1 | Zoek op beschrijving | Type "depressie" in combobox | Toont F32.x codes | ⏳ |
| 2 | Zoek op code | Type "F41" in combobox | Toont angststoornissen | ⏳ |
| 3 | Selecteer code | Klik op F32.1 in dropdown | Vult code + beschrijving | ⏳ |
| 4 | Validatie | Opslaan zonder code | Toont foutmelding | ⏳ |
| 5 | Nieuwe diagnose | Vul form in → Opslaan | Card verschijnt in lijst | ⏳ |
| 6 | Bewerk diagnose | Klik Bewerk → wijzig → Opslaan | Card toont nieuwe data | ⏳ |
| 7 | Verwijder diagnose | Klik Verwijder → Bevestig | Card verdwijnt | ⏳ |
| 8 | Snelkeuze | Focus op lege combobox | Toont top 5 codes | ⏳ |
| 9 | Hoofddiagnose | Selecteer "Hoofddiagnose" | HOOFD badge zichtbaar | ⏳ |
| 10 | Build | `pnpm build` | Geen errors | ⏳ |

**Acceptatiecriteria:**
- [ ] Alle scenario's doorlopen
- [ ] Eventuele bugs gedocumenteerd
- [ ] `pnpm build` slaagt
- [ ] `pnpm lint` geen errors

---

## 5. Kwaliteit & Testplan

### Test Types
| Test Type | Scope | Tools | Verantwoordelijke |
|-----------|-------|-------|-------------------|
| Type Check | Alle nieuwe files | `pnpm build` | Developer |
| Lint | Alle nieuwe files | `pnpm lint` | Developer |
| Manual Tests | Diagnose flows | Handmatig | Developer |

### Manual Test Checklist (voor demo)
- [ ] ICD-10 zoeken werkt op code en beschrijving
- [ ] Nieuwe diagnose toevoegen via modal
- [ ] Bestaande diagnose bewerken
- [ ] Diagnose verwijderen met bevestiging
- [ ] Hoofddiagnose markeren (visuele badge)
- [ ] Ernst en status selecteren
- [ ] Onderbouwing toevoegen en bekijken
- [ ] Lege staat correct weergegeven
- [ ] Toast feedback bij opslaan/verwijderen
- [ ] Build slaagt zonder errors

---

## 6. Bestandsstructuur (Na Implementatie)

```
app/epd/patients/[id]/intakes/[intakeId]/diagnosis/
├── page.tsx                           # Server component (aangepast)
└── components/
    ├── diagnosis-manager.tsx          # Refactored: lijst + modal trigger
    ├── diagnosis-card.tsx             # Nieuw: diagnose weergave
    ├── diagnosis-modal.tsx            # Nieuw: invoer/bewerk modal
    └── icd10-combobox.tsx             # Nieuw: autocomplete zoeken

lib/data/
└── icd10-ggz-codes.json               # Nieuw: statische codelijst (55 codes)

lib/types/
└── icd10.ts                           # Nieuw: ICD-10 TypeScript types

lib/schemas/
└── diagnosis.ts                       # Nieuw: Zod validatieschema
```

---

## 7. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| cmdk dependency te groot | Laag | Laag | ~10KB gzipped, acceptabel | Developer |
| ICD-10 codes incompleet voor demo | Laag | Middel | Start met 55, uitbreiden op verzoek | Developer |
| Bestaande diagnoses breken | Laag | Hoog | Backward compatible, DSM-5 data blijft | Developer |
| Modal UX niet intuïtief | Middel | Middel | Volg shadcn/ui patterns | Developer |

---

## 8. Dependency Check

### Benodigde nieuwe dependency
```bash
pnpm add cmdk
```

### Bestaande dependencies (geen actie)
- `@radix-ui/react-dialog` — Dialog voor modal
- `@radix-ui/react-select` — Dropdowns
- `react-hook-form` — Form handling
- `@hookform/resolvers` — Zod integration
- `zod` — Validatie
- `lucide-react` — Icons
- `date-fns` — Datum formatting

---

## 9. Referenties

**Mission Control Documents:**
- PRD: `docs/specs/diagnose/prd-diagnose-module-v1.md`
- FO: `docs/specs/diagnose/fo-diagnose-module-v1.md`
- TO: `docs/specs/diagnose/to-diagnose-module-v1.md`

**Bestaande Implementatie:**
- `app/epd/patients/[id]/intakes/[intakeId]/diagnosis/` — Huidige pagina
- `app/epd/patients/[id]/intakes/[intakeId]/actions.ts` — Server actions
- `lib/supabase/database.types.ts` — Database types (conditions)

**Externe Bronnen:**
- [WHO ICD-10 (publiek domein)](https://www.who.int/standards/classifications/classification-of-diseases)
- [shadcn/ui Command](https://ui.shadcn.com/docs/components/command)
- [cmdk documentation](https://cmdk.paco.me/)

---

## 10. Glossary

| Term | Betekenis |
|------|-----------|
| ICD-10 | International Classification of Diseases, 10e revisie (WHO) |
| DSM-5 | Diagnostic and Statistical Manual of Mental Disorders (APA) |
| GGZ | Geestelijke gezondheidszorg |
| cmdk | Command menu library voor React (autocomplete) |
| FHIR | Fast Healthcare Interoperability Resources (standaard) |

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 11-12-2024 | Colin Lit | Initiële versie |
| v1.1 | 11-12-2024 | Colin Lit | Uitgebreide story beschrijvingen, E0 gereed |
