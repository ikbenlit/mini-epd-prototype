# 📋 Beoordeling Bouwplan Swift: Diagnostiek Workflow

**Datum:** 23-12-2024  
**Beoordelaar:** AI Code Review  
**Versie:** v1.0

---

## Executive Summary

**Algemene Beoordeling:** ✅ **HAALBAAR met enkele kritieke aanvullingen**

Het bouwplan is goed gestructureerd en bouwt slim voort op bestaande componenten. De geschatte 21 story points voor 2 weken zijn realistisch, maar er zijn enkele belangrijke technische hiaten die eerst opgelost moeten worden voordat de implementatie kan starten.

**Kritieke Bevindingen:**
1. ❌ **Report type "diagnostiek" ontbreekt** in `REPORT_TYPES` enum
2. ❌ **Swift intent types** moeten uitgebreid worden met nieuwe intents
3. ⚠️ **Entity extraction** voor datum/tijd parsing ontbreekt in plan
4. ⚠️ **Intake selectie** voor diagnoses niet duidelijk uitgewerkt
5. ✅ **Hergebruik componenten** is goed geanalyseerd en realistisch

**Blokkerende Bevindingen (Swift Foundation - 24-12-2024):**
6. 🔴 **E2.S5 Input → Block wiring ontbreekt** - handleSubmit is placeholder
7. 🔴 **CanvasArea block rendering ontbreekt** - Blocks worden niet gerenderd
8. 🔴 **P1 Blocks (E3) niet geïmplementeerd** - DagnotatieBlock, ZoekenBlock, OverdrachtBlock bestaan niet
9. ⚠️ **Type duplicatie** - SwiftIntent in zowel types.ts als swift-store.ts

---

## 1. Compleetheid Analyse

### 1.1 ✅ Sterke Punten

**Goed Gedocumenteerd:**
- Duidelijke epic/story breakdown met acceptatiecriteria
- Realistische effort schattingen (21 SP voor 2 weken)
- Goede referenties naar bestaande code
- Testplan met concrete checklists
- Risico analyse met mitigaties

**Technische Analyse:**
- Correcte identificatie van hergebruikbare componenten
- Wrapper pattern goed uitgelegd
- API routes strategie is logisch

### 1.2 ❌ Ontbrekende Elementen

#### Kritiek: Report Type "diagnostiek"

**Probleem:**  
Het bouwplan noemt het toevoegen van report type "diagnostiek" (regel 179), maar dit type bestaat niet in de `REPORT_TYPES` enum.

**Huidige situatie:**
```typescript
// lib/types/report.ts
export const REPORT_TYPES = [
  'voortgang', 'observatie', 'incident', 'medicatie', 'contact',
  'crisis', 'intake', 'behandeladvies', 'vrije_notitie', 'verpleegkundig'
] as const;
```

**Impact:**  
- Database validatie zal falen bij POST `/api/reports` met type "diagnostiek"
- Zod schema moet uitgebreid worden
- Mogelijk database constraint check nodig

**Aanbeveling:**  
Voeg story toe: **E-D1.S0: Report type "diagnostiek" toevoegen** (1 SP)
- Update `REPORT_TYPES` enum
- Update Zod schema `CreateReportSchema`
- Database migratie indien nodig (check constraints)

#### Kritiek: Swift Intent Types Uitbreiding

**Probleem:**  
Het bouwplan beschrijft nieuwe intent patterns, maar de `SwiftIntent` type definitie moet uitgebreid worden.

**Huidige situatie:**
```typescript
// lib/swift/types.ts
export type SwiftIntent = 'dagnotitie' | 'zoeken' | 'overdracht' | 'unknown';
```

**Nodig:**
```typescript
export type SwiftIntent = 
  | 'dagnotitie' 
  | 'zoeken' 
  | 'overdracht' 
  | 'afspraak_maken'      // NIEUW
  | 'rapportage'          // NIEUW
  | 'diagnose_bekijken'   // NIEUW
  | 'diagnose_toevoegen'  // NIEUW
  | 'diagnose_wijzigen'   // NIEUW
  | 'unknown';
```

**Impact:**  
- TypeScript compile errors zonder deze uitbreiding
- Block configs moeten uitgebreid worden
- Intent classifier moet nieuwe types ondersteunen

**Aanbeveling:**  
Voeg toe aan E-D1.S1 en E-D2.S1:
- Update `SwiftIntent` type
- Update `BLOCK_CONFIGS` met nieuwe block types
- Update `BlockType` type (exclude 'unknown')

#### Waarschuwing: Entity Extraction voor Datum/Tijd

**Probleem:**  
Het bouwplan beschrijft intent patterns die datum/tijd moeten extraheren (bijv. "morgen 10:00"), maar er is geen plan voor entity extraction van deze waarden.

**Voorbeeld uit plan:**
```
/^afspraak\s+(\w+)\s+(morgen|vandaag)\s+(\d{1,2}:\d{2})/i
```

**Ontbrekend:**
- Functie om "morgen" → Date object te converteren
- Functie om "10:00" → tijd te parseren
- Validatie van datum/tijd combinaties
- Fallback naar date picker bij onduidelijke input

**Huidige situatie:**  
`lib/swift/entity-extractor.ts` bestaat, maar bevat alleen patient name extraction.

**Aanbeveling:**  
Voeg toe aan E-D1.S1:
- `extractDateTime(input: string): { date?: Date; time?: string }`
- Integratie met date-fns voor Nederlandse datum parsing
- Fallback logica voor onduidelijke input

#### Waarschuwing: Intake Selectie voor Diagnoses

**Probleem:**  
Het bouwplan beschrijft diagnose toevoegen, maar `DiagnosisDetailForm` vereist een `intakeId` (encounter_id). Het plan beschrijft niet hoe dit wordt bepaald vanuit Swift context.

**Huidige situatie:**
```typescript
// app/epd/patients/[id]/diagnose/components/diagnosis-detail-form.tsx
// Vereist: intakes array en selectedIntakeId
```

**Vragen:**
- Moet Swift automatisch de laatste intake selecteren?
- Moet Swift een intake selector tonen?
- Kan diagnose zonder intake (direct encounter koppeling)?

**Aanbeveling:**  
Voeg toe aan E-D2.S3:
- Beslissing: automatisch laatste intake of selector tonen
- Documenteer in acceptatiecriteria
- Update DiagnoseFormBlock implementatie

### 1.3 ⚠️ Onduidelijkheden

#### Appointment Modal Hergebruik

**Vraag:**  
Het plan zegt "80% hergebruik" van `AppointmentModal`, maar deze component is een Dialog met veel interne state. Hoe wordt dit geïntegreerd in Swift blocks?

**Huidige situatie:**
- `AppointmentModal` is een volledig Dialog component
- Swift blocks gebruiken `BlockContainer` (geen Dialog)
- Dark theme styling moet aangepast worden

**Aanbeveling:**  
Clarificeer in E-D1.S2:
- Option A: Extract form logica naar shared component, wrapper in beide contexts
- Option B: Hergebruik AppointmentModal maar wrap in BlockContainer (mogelijk styling issues)
- Option C: Nieuwe Swift-specifieke component met shared business logic

#### Encounter ID Callback Pattern

**Vraag:**  
Het plan zegt "encounter_id teruggeven via callback", maar hoe wordt dit gebruikt voor de volgende stap (rapportage)?

**Scenario:**
1. User: "afspraak diagnostiek jan morgen 10:00"
2. AfspraakBlock → encounter_id = "abc-123"
3. User: "rapportage diagnostiek gesprek met jan"
4. Hoe weet RapportageBlock dat encounter_id "abc-123" moet gebruiken?

**Aanbeveling:**  
Clarificeer:
- Option A: Swift store houdt laatste encounter_id bij per patient
- Option B: User moet encounter expliciet selecteren
- Option C: AI fallback om encounter te matchen op datum/tijd

---

## 2. Haalbaarheid Analyse

### 2.1 ✅ Realistische Schattingen

**Story Points Breakdown:**
- E-D1.S1: 2 SP (intent patterns) → **Realistisch**
- E-D1.S2: 5 SP (AfspraakBlock) → **Realistisch** (met hergebruik)
- E-D1.S3: 4 SP (RapportageBlock) → **Realistisch**
- E-D2.S1: 2 SP (intent patterns) → **Realistisch**
- E-D2.S2: 3 SP (DiagnoseBlock) → **Realistisch**
- E-D2.S3: 5 SP (DiagnoseFormBlock) → **Realistisch**

**Totaal: 21 SP voor 2 weken = ~10 SP/week**  
Dit is haalbaar voor 1 developer met goede focus.

### 2.2 ⚠️ Risico's op Vertraging

**Hoog Risico:**
1. **Appointment Modal Integratie** (E-D1.S2)
   - Hergebruik Dialog component in Block context kan complex zijn
   - Styling aanpassingen kunnen meer tijd kosten dan geschat
   - **Mitigatie:** Start met proof-of-concept, pas schatting aan indien nodig

2. **Datum/Tijd Parsing** (E-D1.S1)
   - Nederlandse datum parsing ("morgen", "volgende week") kan edge cases hebben
   - Tijdzone handling voor afspraken
   - **Mitigatie:** Gebruik date-fns met Nederlandse locale, test grondig

**Middel Risico:**
1. **ICD-10 Zoeker Verbetering** (E-D2.S3)
   - Plan zegt "fuzzy search verbeteren" maar geeft geen specificaties
   - Bestaande zoeker werkt al redelijk goed
   - **Mitigatie:** Eerst testen of verbetering nodig is, anders scope verkleinen

2. **Encounter Koppeling** (E-D1.S3)
   - Automatische koppeling tussen afspraak en rapportage kan complex zijn
   - **Mitigatie:** Start met optionele koppeling, voeg automatische matching later toe

### 2.3 ✅ Goede Foundation

**Bestaande Componenten:**
- ✅ AppointmentModal bestaat en is goed gestructureerd
- ✅ ReportComposer bestaat en ondersteunt al `linkedEncounterId`
- ✅ DiagnosisDetailForm bestaat met ICD-10 zoeker
- ✅ Actions bestaan en zijn herbruikbaar
- ✅ ICD-10 zoeker werkt al met fuzzy search

**Bestaande Infrastructuur:**
- ✅ Swift foundation (Command Center, Intent Classification) werkt
- ✅ Block system bestaat (`BlockContainer`)
- ✅ API routes pattern is duidelijk
- ✅ Supabase RLS policies zijn al geïmplementeerd

---

## 3. Technische Aanbevelingen

### 3.1 Kritieke Toevoegingen

#### Story E-D1.S0: Report Type "diagnostiek" (NIEUW - 1 SP)

**Beschrijving:**  
Voeg report type "diagnostiek" toe aan het systeem.

**Acceptatiecriteria:**
- [ ] `REPORT_TYPES` enum bevat "diagnostiek"
- [ ] Zod schema `CreateReportSchema` accepteert "diagnostiek"
- [ ] Database constraint check (indien nodig)
- [ ] QuickActions component toont "diagnostiek" optie (indien van toepassing)

**Technical Notes:**
```typescript
// lib/types/report.ts
export const REPORT_TYPES = [
  // ... bestaande types
  'diagnostiek', // NIEUW
] as const;
```

#### Story E-D1.S1 Uitbreiding: Entity Extraction

**Toevoegen aan E-D1.S1:**
- [ ] `extractDateTime(input: string)` functie
- [ ] Nederlandse datum parsing ("morgen", "vandaag", "volgende week")
- [ ] Tijd parsing ("10:00", "14:30")
- [ ] Fallback naar date picker bij onduidelijke input

**Technical Notes:**
```typescript
// lib/swift/entity-extractor.ts
export function extractDateTime(input: string): {
  date?: Date;
  time?: string;
  confidence: number;
} {
  // Parse "morgen 10:00" → { date: tomorrow, time: "10:00" }
  // Parse "vandaag 14:30" → { date: today, time: "14:30" }
  // Return confidence voor fallback beslissing
}
```

#### Story E-D2.S3 Uitbreiding: Intake Selectie

**Clarificatie nodig:**
- [ ] Beslissing: automatisch laatste intake of selector?
- [ ] Documenteer in acceptatiecriteria
- [ ] Implementeer gekozen aanpak

**Aanbeveling:**  
Automatisch laatste intake selecteren, met optie om te wijzigen:
```typescript
// DiagnoseFormBlock
const intakes = await getPatientIntakes(patientId);
const defaultIntakeId = intakes[0]?.id; // Laatste intake
// Toon dropdown indien meerdere intakes beschikbaar
```

### 3.2 Verbeteringen

#### Intent Patterns Verbeteren

**Huidige patterns zijn te specifiek:**
```typescript
// Te specifiek - mist veel variaties
/^afspraak\s+(diagnostiek|behandeling)\s+(\w+)/i
```

**Aanbeveling:**  
Voeg meer variaties toe:
```typescript
afspraak_maken: [
  // Basis patterns
  { pattern: /^afspraak\s+(diagnostiek|behandeling)\s+(\w+)/i, weight: 1.0 },
  { pattern: /^plan\s+(diagnostiek|behandeling)\s+(\w+)/i, weight: 0.95 },
  
  // Met datum/tijd
  { pattern: /^afspraak\s+(\w+)\s+(morgen|vandaag)\s+(\d{1,2}:\d{2})/i, weight: 1.0 },
  { pattern: /^plan\s+(\w+)\s+(morgen|vandaag)\s+(\d{1,2}:\d{2})/i, weight: 0.95 },
  
  // Zonder type (default diagnostiek)
  { pattern: /^afspraak\s+(\w+)\s+(morgen|vandaag)/i, weight: 0.85 },
  
  // Alleen "afspraak" met patient naam
  { pattern: /^afspraak\s+(\w+)/i, weight: 0.7 },
],
```

#### API Routes Specificatie

**Huidige beschrijving is te vaag:**
```typescript
// app/api/appointments/route.ts
export async function POST(request: NextRequest) {
  // Wrapper rond app/epd/agenda/actions.ts createEncounter
  // Retourneert encounter_id voor volgende stap
}
```

**Aanbeveling:**  
Specificeer volledige API contract:
```typescript
// POST /api/appointments
// Request body:
{
  patientId: string;
  periodStart: string; // ISO 8601
  periodEnd?: string;
  typeCode: 'diagnostiek' | 'behandeling' | ...;
  typeDisplay: string;
  classCode: 'AMB' | 'HH' | 'VR';
  classDisplay: string;
  notes?: string;
}

// Response:
{
  success: boolean;
  data?: {
    id: string; // encounter_id
    // ... andere encounter velden
  };
  error?: string;
}
```

---

## 4. Testplan Verbeteringen

### 4.1 Ontbrekende Test Cases

**Entity Extraction Tests:**
- [ ] "morgen 10:00" → correcte datum + tijd
- [ ] "vandaag 14:30" → correcte datum + tijd
- [ ] "volgende week maandag" → correcte datum
- [ ] "afspraak jan" → alleen patient, geen datum → fallback date picker
- [ ] "afspraak jan morgen" → patient + datum, geen tijd → fallback time picker

**Encounter Koppeling Tests:**
- [ ] Afspraak aanmaken → encounter_id opgeslagen
- [ ] Rapportage met encounter_id → correct gekoppeld
- [ ] Rapportage zonder encounter_id → optioneel (geen error)
- [ ] Meerdere encounters opzelfde dag → juiste selectie

**Diagnose Intake Tests:**
- [ ] Patiënt met 1 intake → automatisch geselecteerd
- [ ] Patiënt met meerdere intakes → laatste geselecteerd
- [ ] Patiënt zonder intakes → error/fallback

### 4.2 Integration Test Scenarios

**End-to-End Flow:**
```
1. "afspraak diagnostiek jan morgen 10:00"
   → AfspraakBlock opent
   → Patient "jan" gevonden
   → Datum: morgen
   → Tijd: 10:00
   → Type: diagnostiek
   → Opslaan → encounter_id = "abc-123"

2. "rapportage diagnostiek gesprek met jan"
   → RapportageBlock opent
   → Patient "jan" gevonden
   → Type: diagnostiek
   → Encounter: "abc-123" (laatste encounter van jan)
   → Content invoeren
   → Opslaan → report gekoppeld aan encounter

3. "diagnose jan"
   → DiagnoseBlock opent
   → Overzicht diagnoses van jan
   → Filter: Actief

4. "diagnose toevoegen jan F41.1"
   → DiagnoseFormBlock opent
   → Patient: jan
   → ICD-10: F41.1 (pre-filled)
   → Intake: laatste intake (automatisch)
   → Type: nevendiagnose (default)
   → Opslaan → diagnose toegevoegd
```

---

## 5. Swift Foundation Status (24-12-2024)

> **BELANGRIJK:** De diagnostiek workflow bouwt voort op de Swift foundation (bouwplan-swift-v1.md).
> De foundation is nog niet compleet, waardoor de diagnostiek workflow nog niet kan starten.

### 5.1 Foundation Status Overzicht

| Epic | Status | Impact op Diagnostiek |
|------|--------|----------------------|
| E0 Setup & Foundation | ✅ Done | Geen blokkade |
| E1 Command Center | ✅ Done | Geen blokkade |
| E2 Intent Classification | ⏳ In Progress | 🔴 **BLOKKADE** |
| E3 P1 Blocks | ⏳ To Do | 🔴 **BLOKKADE** |
| E4 Navigation & Auth | ⏳ To Do | Geen blokkade |
| E5 Polish & Testing | ⏳ To Do | Geen blokkade |

### 5.2 Blokkerende Issues

#### 🔴 Blokkade 1: E2.S5 Input → Block Wiring

**Huidige situatie:**
```typescript
// components/swift/command-center/command-input.tsx:120
const handleSubmit = async (e: React.FormEvent) => {
  // TODO: Process intent (E2)
  console.log('Submit:', inputValue);
  clearInput();
};
```

**Probleem:**
De intent classificatie API bestaat (`/api/intent/classify`), maar wordt niet aangeroepen.
Het resultaat wordt niet gebruikt om `openBlock()` aan te roepen.

**Impact:**
Zonder deze wiring kan geen enkel block geopend worden via tekst/spraak input.

**Story toegevoegd aan bouwplan-swift-v1.md (v1.5):**
```markdown
| E2.S5 | Input → Block wiring | CommandInput submit → API → openBlock | ⏳ | E2.S4 | 2 |
```

#### 🔴 Blokkade 2: CanvasArea Block Rendering

**Huidige situatie:**
```typescript
// components/swift/command-center/canvas-area.tsx:18
{activeBlock ? (
  <div className="text-slate-400">Block: {activeBlock}</div>  // ← Placeholder!
) : (
  <EmptyState />
)}
```

**Probleem:**
De CanvasArea toont alleen placeholder tekst, niet de daadwerkelijke block componenten.
Er is geen switch/case of dynamic import voor de block types.

**Impact:**
Zelfs als E2.S5 werkt, worden blocks niet zichtbaar.

**Aanbeveling:**
Voeg story E3.S0 toe aan bouwplan-swift-v1.md:
```markdown
| E3.S0 | CanvasArea block rendering | Switch/case voor block types, prefill doorgeven | ⏳ | E2.S5 | 2 |
```

#### 🔴 Blokkade 3: P1 Blocks Bestaan Niet

**Huidige situatie:**
```typescript
// components/swift/blocks/index.ts
export { BlockContainer } from './block-container';

// Commented out - bestaan niet:
// export { DagnotatieBlock } from './dagnotitie-block';
// export { ZoekenBlock } from './zoeken-block';
// export { OverdrachtBlock } from './overdracht-block';
```

**Probleem:**
De diagnostiek workflow voegt nieuwe blocks toe (AfspraakBlock, RapportageBlock, DiagnoseBlock),
maar de basis P1 blocks waar deze op voortbouwen bestaan nog niet.

**Impact:**
- DagnotatieBlock is nodig als referentie voor RapportageBlock
- ZoekenBlock is nodig voor patient selectie in alle flows
- BlockContainer bestaat wel, maar is nog niet getest met echte content

**Aanbeveling:**
Implementeer eerst E3.S2 (DagnotatieBlock) als proof-of-concept voordat diagnostiek workflow start.

#### ⚠️ Waarschuwing: Type Duplicatie

**Huidige situatie:**
```typescript
// lib/swift/types.ts
export type SwiftIntent = 'dagnotitie' | 'zoeken' | 'overdracht' | 'unknown';

// stores/swift-store.ts (DUPLICAAT)
export type SwiftIntent = 'dagnotitie' | 'zoeken' | 'overdracht' | 'unknown';
```

**Impact:**
Bij uitbreiding van intents voor diagnostiek workflow moet dit op twee plekken bijgewerkt worden.
Vergeten leidt tot TypeScript errors.

**Aanbeveling:**
Verwijder duplicaat uit `swift-store.ts`, importeer uit `types.ts`.

### 5.3 Dependency Chain voor Diagnostiek

```
Swift Foundation (moet eerst af)
├── E2.S5 Input → Block wiring          ← BLOKKADE
│   └── handleSubmit() roept API aan
│   └── openBlock() bij succes
│
├── E3.S0 CanvasArea block rendering    ← BLOKKADE (ontbreekt in plan)
│   └── Switch/case voor block types
│   └── Prefill data doorgeven
│
├── E3.S2 DagnotatieBlock               ← BLOKKADE
│   └── Referentie voor RapportageBlock
│   └── Test case voor block rendering
│
└── E3.S3 Patient Search API            ← BLOKKADE
    └── Nodig voor patient selectie

Diagnostiek Workflow (kan dan starten)
├── E-D1.S0 Report type "diagnostiek"
├── E-D1.S1 Intent patterns uitbreiden
├── E-D1.S2 AfspraakBlock
├── E-D1.S3 RapportageBlock
├── E-D2.S1 Diagnose intent patterns
├── E-D2.S2 DiagnoseBlock
└── E-D2.S3 DiagnoseFormBlock
```

### 5.4 Geschatte Effort voor Foundation Completion

| Story | SP | Status |
|-------|----|----|
| E2.S5 Input → Block wiring | 2 | ⏳ Nieuw toegevoegd |
| E3.S0 CanvasArea rendering | 2 | ⏳ Aanbevolen |
| E3.S2 DagnotatieBlock | 5 | ⏳ Gepland |
| E3.S3 Patient Search API | 3 | ⏳ Gepland |
| **Subtotaal** | **12** | |

**Totale effort voor werkende demo:**
- Swift Foundation completion: 12 SP
- Diagnostiek Workflow: 22 SP
- **Totaal: 34 SP**

---

## 6. Conclusie & Aanbevelingen

### 6.1 Algemene Beoordeling

**Compleetheid Diagnostiek Plan:** ⚠️ **7/10**
- Goede structuur en breakdown
- Enkele kritieke technische details ontbreken
- Entity extraction niet volledig uitgewerkt

**Compleetheid Swift Foundation:** ⚠️ **5/10**
- E0-E2.S4 solide geïmplementeerd
- E2.S5 wiring ontbreekt (kritiek)
- E3 blocks niet gebouwd (kritiek)
- CanvasArea rendering niet in plan

**Haalbaarheid:** ⚠️ **6/10** (was 8/10)
- Foundation moet eerst af voordat diagnostiek kan starten
- Extra 12 SP nodig voor foundation completion
- Totale effort: 34 SP i.p.v. 22 SP

### 6.2 Aanbevelingen voor Start

**Voor Start:**
1. ✅ Voeg E-D1.S0 toe: Report type "diagnostiek" (1 SP)
2. ✅ Uitbreid E-D1.S1: Entity extraction voor datum/tijd (extra 1 SP)
3. ✅ Clarificeer E-D2.S3: Intake selectie strategie
4. ✅ Update `SwiftIntent` type definitie
5. ✅ Proof-of-concept AppointmentModal integratie

**Tijdens Implementatie:**
1. Start met E-D1.S0 (report type) - basis voor alles
2. Test entity extraction grondig voordat je verder gaat
3. Itereer op AppointmentModal integratie (mogelijk meer tijd nodig)
4. Houd rekening met edge cases in datum parsing

**Na Implementatie:**
1. Uitgebreide end-to-end tests
2. Performance testen (intent classification snelheid)
3. UX feedback verzamelen
4. Documentatie updaten

### 6.3 Aangepaste Story Breakdown

**Swift Foundation (moet eerst af):**
- E2.S5: Input → Block wiring (2 SP) ⭐ NIEUW
- E3.S0: CanvasArea block rendering (2 SP) ⭐ AANBEVOLEN
- E3.S2: DagnotatieBlock (5 SP)
- E3.S3: Patient Search API (3 SP)
- **Subtotaal Foundation: 12 SP**

**Epic D1 — Afspraak & Rapportage (12 SP totaal):**
- E-D1.S0: Report type "diagnostiek" toevoegen (1 SP) ⭐ NIEUW
- E-D1.S1: Intent patterns + entity extraction (3 SP) ⬆️ +1 SP
- E-D1.S2: AfspraakBlock (5 SP)
- E-D1.S3: RapportageBlock uitbreiden (4 SP)

**Epic D2 — Diagnose Beheer (10 SP totaal):**
- E-D2.S1: Intent patterns uitbreiden (2 SP)
- E-D2.S2: DiagnoseBlock (3 SP)
- E-D2.S3: DiagnoseFormBlock (5 SP)

**Totalen:**
- Swift Foundation completion: 12 SP
- Diagnostiek Workflow: 22 SP
- **Totaal: 34 SP**

### 6.4 Finale Oordeel

⚠️ **HOLD - Foundation eerst afronden**

Het diagnostiek bouwplan is goed gestructureerd, maar kan nog niet starten omdat de Swift foundation incompleet is.

**Kritieke blokkades:**
1. E2.S5 (handleSubmit wiring) - toegevoegd aan bouwplan v1.5
2. E3.S0 (CanvasArea rendering) - moet nog toegevoegd worden
3. E3.S2 (DagnotatieBlock) - moet gebouwd worden als referentie
4. E3.S3 (Patient Search API) - nodig voor alle patient selectie

**Aanbevolen volgorde:**
```
Week 1: Foundation completion (12 SP)
├── E2.S5 Input → Block wiring
├── E3.S0 CanvasArea rendering
├── E3.S2 DagnotatieBlock
└── E3.S3 Patient Search API

Week 2-3: Diagnostiek Workflow (22 SP)
├── E-D1.S0 Report type
├── E-D1.S1 Intent patterns
├── E-D1.S2 AfspraakBlock
├── E-D1.S3 RapportageBlock
├── E-D2.S1 Diagnose patterns
├── E-D2.S2 DiagnoseBlock
└── E-D2.S3 DiagnoseFormBlock
```

**GO voor implementatie** zodra foundation stories zijn afgerond.

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 23-12-2024 | AI Review | Initiële beoordeling |
| v1.1 | 24-12-2024 | Claude | Swift Foundation status toegevoegd (sectie 5), blokkerende issues geïdentificeerd, finale oordeel aangepast naar HOLD |

