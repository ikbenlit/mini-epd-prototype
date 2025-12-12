# Diagnose Module - Implementatieplan

## Overzicht
Implementatie van een verbeterde diagnosemodule voor het Mini-EPD prototype met:
- ICD-10 classificatie (publiek domein, geen licentie nodig)
- Autocomplete zoekfunctionaliteit
- Consistente UX/UI volgens bestaande EPD patterns

## Documentatie Status ✅
- [x] PRD v1.1 - `docs/specs/diagnose/prd-diagnose-module-v1.md`
- [x] FO v1.1 - `docs/specs/diagnose/fo-diagnose-module-v1.md`
- [x] TO v1.0 - `docs/specs/diagnose/to-diagnose-module-v1.md`
- [x] UX/UI Specificaties (zie hieronder)

---

## UX/UI Design Beslissingen

### Kleurenschema (conform ux-stylesheet.md)
| Element | Kleur | Hex |
|---------|-------|-----|
| Primary action (knoppen) | Teal | `#0D9488` (teal-600) |
| Borders | Slate | `#E2E8F0` (slate-200) |
| Text primary | Slate | `#0F172A` (slate-900) |
| Text secondary | Slate | `#64748B` (slate-500) |
| Error | Red | `#DC2626` |
| Success toast | Green | `#16A34A` |

### Badge Kleuren (Ernst/Status)
| Type | Achtergrond | Tekst |
|------|-------------|-------|
| Ernst: Licht | `#E5E7EB` | `#374151` |
| Ernst: Matig | `#FEF3C7` | `#92400E` |
| Ernst: Ernstig | `#FEE2E2` | `#991B1B` |
| Status: Actief | `#ECFDF5` | `#16A34A` |
| Status: In remissie | `#EFF6FF` | `#3B82F6` |
| Status: Opgelost | `#F1F5F9` | `#64748B` |
| HOOFD badge | `#0D9488` | `#FFFFFF` |

### Component Patterns (hergebruik bestaande)
- **Card layout**: Zoals `anamnese-manager.tsx` en `risk-manager.tsx`
- **Modal/Dialog**: Zoals `appointment-modal.tsx`
- **Form styling**: Bestaande input/select classes
- **Empty state**: Zoals `intake-list.tsx`

---

## Implementatie Stappenplan

### Epic 1: Data & Types (~1 uur)

**Story 1.1: ICD-10 Codelijst JSON**
```
lib/data/icd10-ggz-codes.json
```
- ~50 meest voorkomende GGZ codes
- Categorieën: Depressie, Angst, Trauma, OCD, Persoonlijkheid, etc.
- Velden: code, display, category, keywords

**Story 1.2: TypeScript Types**
```
lib/types/icd10.ts
```
- ICD10Code interface
- ICD10Category interface

**Story 1.3: Zod Validatie Schema**
```
lib/schemas/diagnosis.ts
```
- diagnosisSchema met code, severity, status validatie

---

### Epic 2: UI Componenten (~3-4 uur)

**Story 2.1: Installeer cmdk**
```bash
pnpm add cmdk
```

**Story 2.2: ICD10Combobox Component**
```
app/epd/patients/[id]/intakes/[intakeId]/diagnosis/components/icd10-combobox.tsx
```
- Autocomplete met cmdk
- Client-side filtering
- Snelkeuze bij leeg veld
- Keyboard navigatie

**Story 2.3: DiagnosisCard Component**
```
app/epd/patients/[id]/intakes/[intakeId]/diagnosis/components/diagnosis-card.tsx
```
- Code + beschrijving header
- Ernst/Status/Datum badges
- HOOFD badge voor hoofddiagnose
- Expandable onderbouwing
- Bewerk/Verwijder acties

**Story 2.4: DiagnosisModal Component**
```
app/epd/patients/[id]/intakes/[intakeId]/diagnosis/components/diagnosis-modal.tsx
```
- Dialog wrapper
- ICD10Combobox integratie
- Ernst dropdown (Licht/Matig/Ernstig)
- Status dropdown (Actief/In remissie/Opgelost)
- Type radio (Hoofd/Nevendiagnose)
- DSM-5 referentie tekstveld (optioneel)
- Onderbouwing textarea
- Validatie met zod

---

### Epic 3: Integratie (~2 uur)

**Story 3.1: Refactor DiagnosisManager**
```
app/epd/patients/[id]/intakes/[intakeId]/diagnosis/components/diagnosis-manager.tsx
```
- Vervang inline form door modal trigger
- Integreer DiagnosisCard voor lijst
- Lege staat met dashed border
- + Nieuwe diagnose knop

**Story 3.2: Update Server Actions**
```
app/epd/patients/[id]/intakes/[intakeId]/actions.ts
```
- Wijzig code_system naar 'ICD-10'
- Voeg updateDiagnosis() functie toe
- Uitbreid DiagnosisPayload type

**Story 3.3: Toast Integratie**
- Succes toast bij opslaan
- Succes toast bij verwijderen
- Error handling

---

### Epic 4: Polish (~1 uur)

**Story 4.1: Empty State**
- Dashed border container
- Icon + tekst
- Prominente CTA knop

**Story 4.2: Loading States**
- Button spinner bij opslaan
- Disabled state tijdens transitie

**Story 4.3: Validatie Feedback**
- Inline errors onder velden
- Focus op eerste error veld

---

## Kritieke Bestanden

### Te wijzigen
- `app/epd/patients/[id]/intakes/[intakeId]/diagnosis/components/diagnosis-manager.tsx`
- `app/epd/patients/[id]/intakes/[intakeId]/actions.ts`

### Nieuw aan te maken
- `lib/data/icd10-ggz-codes.json`
- `lib/types/icd10.ts`
- `lib/schemas/diagnosis.ts`
- `app/epd/.../diagnosis/components/icd10-combobox.tsx`
- `app/epd/.../diagnosis/components/diagnosis-card.tsx`
- `app/epd/.../diagnosis/components/diagnosis-modal.tsx`

### Dependencies
- `cmdk` (toe te voegen)

---

## Acceptatiecriteria

1. **Zoekfunctie**: Zoeken op "depressie" toont F32.x codes binnen 200ms
2. **Code selectie**: Selecteren vult beschrijving automatisch in
3. **Validatie**: Opslaan zonder code toont inline error
4. **CRUD**: Toevoegen, bewerken, verwijderen werkt correct
5. **Badges**: Ernst en status tonen correcte kleuren
6. **Hoofddiagnose**: Maximaal 1 per intake, duidelijk gemarkeerd
7. **Build**: `pnpm build` slaagt zonder errors

---

## Geschatte Doorlooptijd
- Epic 1: 1 uur
- Epic 2: 3-4 uur
- Epic 3: 2 uur
- Epic 4: 1 uur
- **Totaal: ~7-8 uur**
