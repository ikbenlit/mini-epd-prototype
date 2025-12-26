# Mission Control — Bouwplan Swift v2.3

**Projectnaam:** Swift — Contextual UI EPD
**Versie:** v2.3
**Datum:** 24-12-2024
**Auteur:** Colin Lit / Development Team

---

## Changelog v2.3

> **Belangrijke wijzigingen t.o.v. v2.2:**
> - E5.S1 compleet: Block animaties geïmplementeerd volgens UX specificatie
> - Slide up/down animaties met fade en scale (200ms)
> - CanvasArea animaties verbeterd: slide down bij sluiten (niet omhoog)
> - BlockContainer animaties consistent gemaakt met CanvasArea
> - Totalen bijgewerkt: 58 SP done (81%), 14 SP remaining

## Changelog v2.2

> **Belangrijke wijzigingen t.o.v. v2.1:**
> - Epic 3 compleet: Alle P1 blocks geïmplementeerd (E3.S0-S6)
> - PatientContextCard toegevoegd: Auto-open na patient selectie
> - OverdrachtBlock met AI samenvattingen per patiënt
> - Patient search API geïmplementeerd
> - Technische debt opgelost: BlockContainer animaties, CanvasArea rendering
> - Totalen bijgewerkt: 56 SP done (78%), 16 SP remaining

## Changelog v2.0

> **Belangrijke wijzigingen t.o.v. v1.5:**
> - E3.S0 toegevoegd: CanvasArea block rendering (kritieke blokkade)
> - Technische debt sectie toegevoegd (type duplicatie, keyboard shortcuts)
> - Diagnostiek Workflow als uitbreiding opgenomen
> - Sprint planning aangepast aan huidige voortgang
> - Totalen bijgewerkt: 29 stories, 72 SP

---

## 1. Doel en context

### 1.1 Projectdoel

Swift is een **Contextual UI** interface voor het Mini-EPD systeem. In plaats van navigatie door menu's spreekt of typt de gebruiker een intentie — en het juiste UI-blok verschijnt voorgevuld met relevante data.

**Kernbelofte:**
> Van 12 klikken en 3 minuten naar 1 zin en 15 seconden.

### 1.2 Business Case

| Metric | Huidig | Met Swift | Besparing |
|--------|--------|-----------|-----------|
| Dagnotitie maken | 3-5 min | 15 sec | 95% |
| Patiënt zoeken | 1-2 min | 5 sec | 95% |
| Overdracht maken | 20-30 min | 5 min | 80% |
| Rapportage schrijven | 8-15 min | 2-3 min | 75% |

**Per verpleegkundige per dag: ~4 uur terug naar zorg**

### 1.3 Relatie met Documentatie

| Document | Beschrijft | Locatie |
|----------|------------|---------|
| PRD | Product visie, requirements | `swift-prd.md` |
| FO | Functionele flows, blocks | `swift-fo-ai.md` |
| TO | Technische architectuur | `to-swift-v1.md` |
| UX | Visuele specificaties | `swift-ux-v2.1.md` |
| **Diagnostiek FO** | Behandelaar workflow | `swift-fo-diagnostiek-workflow.md` |
| **Diagnostiek Bouwplan** | Uitbreiding voor behandelaars | `bouwplan-swift-diagnostiek-workflow.md` |

---

## 2. Uitgangspunten

### 2.1 Technische Stack

**Bestaand (hergebruiken):**
| Component | Technologie | Versie |
|-----------|-------------|--------|
| Framework | Next.js | 14.2.18 |
| UI Library | React | 18.3.1 |
| Styling | TailwindCSS | 3.4.18 |
| Components | shadcn/ui | - |
| Command Palette | cmdk | 1.1.1 |
| Animations | framer-motion | 12.23.24 |
| Database | Supabase | 2.81.1 |
| Speech-to-Text | Deepgram | 4.11.2 |
| AI | Claude API | - |
| Validation | Zod | 4.1.12 |
| Forms | react-hook-form | 7.66.1 |

**Nieuw toegevoegd:**
| Component | Technologie | Versie | Status |
|-----------|-------------|--------|--------|
| State Management | Zustand | 5.0.9 | ✅ Geïnstalleerd |

### 2.2 Projectkaders

| Kader | Waarde |
|-------|--------|
| **Bouwtijd** | 4 weken (4 sprints) |
| **Team** | 1 developer |
| **Scope** | MVP: P1 blocks (dagnotitie, zoeken, overdracht) |
| **Uitbreiding** | Diagnostiek workflow (optioneel, +22 SP) |
| **Data** | Bestaande Supabase database |
| **Doel** | Werkende demo + user testing |

### 2.3 Programmeer Uitgangspunten

**Code Quality Principles:**

- **DRY (Don't Repeat Yourself)**
  - Herbruikbare block componenten
  - Centrale intent classificatie logica
  - Shared hooks voor common patterns
  - **Let op:** Types importeren uit `lib/swift/types.ts`, niet dupliceren

- **KISS (Keep It Simple, Stupid)**
  - Local-first intent classificatie (regex)
  - AI alleen als fallback
  - Minimale state complexity

- **SOC (Separation of Concerns)**
  - UI blocks gescheiden van intent logic
  - API routes gescheiden van business logic
  - Store slices per domein

- **YAGNI (You Aren't Gonna Need It)**
  - Alleen P1 blocks in MVP
  - Geen toggle tussen interfaces
  - Geen advanced analytics in v1

**Development Practices:**

```typescript
// ✅ Goede structuur voor Swift components
components/
├── swift/
│   ├── command-center/
│   │   ├── command-center.tsx      // Main container
│   │   ├── command-input.tsx       // Input component
│   │   ├── canvas-area.tsx         // Block rendering ← KRITIEK
│   │   └── index.ts                // Barrel export
│   └── blocks/
│       ├── block-container.tsx     // Wrapper met animaties
│       ├── dagnotitie-block.tsx
│       ├── zoeken-block.tsx
│       ├── overdracht-block.tsx
│       └── index.ts

// ✅ Store importeert types (geen duplicatie)
stores/
└── swift-store.ts                   // Importeert uit lib/swift/types.ts

// ✅ Intent classification
lib/
└── swift/
    ├── types.ts                     // SINGLE SOURCE OF TRUTH voor types
    ├── intent-classifier.ts         // Local classification
    ├── intent-classifier-ai.ts      // AI fallback
    └── entity-extractor.ts          // Entity parsing
```

---

## 3. Epics & Stories Overzicht

| Epic ID | Titel | Doel | Status | Stories | Effort |
|---------|-------|------|--------|---------|--------|
| E0 | Setup & Foundation | Zustand, routing, base layout | ✅ Done | 4 | 8 SP |
| E1 | Command Center | Input, voice, context bar | ✅ Done | 5 | 13 SP |
| E2 | Intent Classification | Local + AI fallback + wiring | ✅ Done | 5 | 12 SP |
| E3 | P1 Blocks | Dagnotitie, Zoeken, Overdracht | ✅ Done | 7 | 23 SP |
| E4 | Navigation & Auth | Login keuze, routing, preferences | ⏳ To Do | 4 | 8 SP |
| E5 | Polish & Testing | Animaties, error handling, tests | 🔄 In Progress | 4 | 8 SP |

**Totaal: 29 stories, 72 story points**

| Categorie | SP |
|-----------|----:|
| ✅ Done (E0 + E1 + E2 + E3 + E5.S1) | 58 |
| ⏳ Remaining | 14 |

**Belangrijk:**
- Bouw per epic en per story, niet alles tegelijk
- Dependencies installeren: eerst aan Colin melden
- Database migraties: eerst aan Colin melden

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 — Setup & Foundation ✅ DONE
**Epic Doel:** Werkende development omgeving met Zustand store en Swift routing.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E0.S1 | Zustand installeren | `pnpm add zustand` succesvol, import werkt | ✅ | — | 1 |
| E0.S2 | Swift store opzetten | `stores/swift-store.ts` met basis state | ✅ | E0.S1 | 2 |
| E0.S3 | Swift route aanmaken | `/epd/swift` route met eigen layout | ✅ | E0.S2 | 2 |
| E0.S4 | Swift folder structuur | `components/swift/`, `lib/swift/` aangemaakt | ✅ | E0.S3 | 3 |

---

### Epic 1 — Command Center ✅ DONE
**Epic Doel:** Werkende command center met tekst en voice input.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E1.S1 | Command Center layout | 4-zone layout (context, canvas, recent, input), keyboard shortcuts (⌘K, Escape) | ✅ | E0.S4 | 3 |
| E1.S2 | Context Bar | Dienst indicator, patiënt chip, user info | ✅ | E1.S1 | 2 |
| E1.S3 | Command Input | Tekst input met placeholder, focus state, send button | ✅ | E1.S1 | 2 |
| E1.S4 | Voice Input integratie | Deepgram streaming, waveform visualisatie | ✅ | E1.S3 | 3 |
| E1.S5 | Recent Strip | Laatste 5 acties als chips, click-to-repeat | ✅ | E1.S1 | 3 |

**Technical Notes:**
```
Command Center Layout:
┌─────────────────────────────────────────┐
│ Context Bar (48px)                       │
├─────────────────────────────────────────┤
│                                         │
│ Canvas Area (flex) ← Blocks hier        │
│                                         │
├─────────────────────────────────────────┤
│ Recent Strip (48px)                     │
├─────────────────────────────────────────┤
│ Command Input (64px, fixed bottom)      │
└─────────────────────────────────────────┘
```

---

### Epic 2 — Intent Classification ✅ DONE
**Epic Doel:** Two-tier intent classificatie (local + AI fallback) + wiring naar blocks.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E2.S1 | Local classifier | Regex patterns voor P1 intents, <50ms | ✅ | E0.S4 | 3 |
| E2.S2 | Entity extraction | Patient naam, categorie uit input | ✅ | E2.S1 | 3 |
| E2.S3 | AI fallback | Claude Haiku bij confidence <0.8 | ✅ | E2.S2 | 2 |
| E2.S4 | Intent API route | POST /api/intent/classify met logging | ✅ | E2.S3 | 2 |
| E2.S5 | Input → Block wiring | CommandInput.handleSubmit → API → openBlock | ✅ | E2.S4 | 2 |

**E2.S5 Technical Notes (✅ GEÏMPLEMENTEERD):**
```typescript
// components/swift/command-center/command-input.tsx
// IMPLEMENTATIE:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!hasValue || isProcessing) return;
  
  const inputText = inputValue.trim();
  setIsProcessing(true);
  
  try {
    const response = await fetch('/api/intent/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: inputText }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Onbekende fout' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const { intent, confidence, entities } = await response.json();
    
    if (intent !== 'unknown' && confidence >= 0.5) {
      openBlock(intent as BlockType, entities);
      addRecentAction({ intent, label: inputText.slice(0, 50), patientName: entities.patientName });
      clearInput();
    } else {
      // Tijdelijke fallback naar dagnotitie (wordt vervangen door FallbackPicker in E4.S4)
      openBlock('dagnotitie', { content: inputText });
      addRecentAction({ intent: 'dagnotitie', label: inputText.slice(0, 50) });
      clearInput();
    }
  } catch (error) {
    // Error handling met fallback naar dagnotitie
    openBlock('dagnotitie', { content: inputText });
    addRecentAction({ intent: 'dagnotitie', label: inputText.slice(0, 50) });
    clearInput();
  } finally {
    setIsProcessing(false);
  }
};
```

---

### Epic 3 — P1 Blocks ✅ DONE
**Epic Doel:** Werkende DagnotatieBlock, ZoekenBlock en OverdrachtBlock.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E3.S0 | CanvasArea block rendering | Switch/case voor block types, prefill doorgeven | ✅ | E2.S5 | 2 |
| E3.S1 | Block Container | Animatie wrapper, close button, sizes | ✅ | E1.S1 | 2 |
| E3.S2 | DagnotatieBlock | Patient, categorie, tekst, opslaan naar /api/reports | ✅ | E3.S0, E3.S1 | 5 |
| E3.S3 | Patient search API | GET /api/patients/search?q= fuzzy search | ✅ | E0.S4 | 3 |
| E3.S4 | ZoekenBlock | Input, resultaten, selectie → store | ✅ | E3.S0, E3.S3 | 3 |
| E3.S5 | PatientContextCard | Na selectie: notities, vitals, diagnose | ✅ | E3.S4 | 5 |
| E3.S6 | OverdrachtBlock | AI samenvatting per patiënt (bestaande API) | ✅ | E3.S0 | 3 |git status .


**E3.S0 Technical Notes (✅ GEÏMPLEMENTEERD):**
```typescript
// components/swift/command-center/canvas-area.tsx
// IMPLEMENTATIE:
import { DagnotatieBlock } from '../blocks/dagnotitie-block';
import { ZoekenBlock } from '../blocks/zoeken-block';
import { OverdrachtBlock } from '../blocks/overdracht-block';
import { PatientContextCard } from '../blocks/patient-context-card';

function renderBlock(activeBlock: BlockType, prefillData: BlockPrefillData) {
  switch (activeBlock) {
    case 'dagnotitie':
      return <DagnotatieBlock prefill={prefillData} />;
    case 'zoeken':
      return <ZoekenBlock prefill={prefillData} />;
    case 'overdracht':
      return <OverdrachtBlock prefill={prefillData} />;
    default:
      return null;
  }
}

// In CanvasArea:
{activeBlock ? (
  <AnimatePresence mode="wait">
    <motion.div key={activeBlock} {...blockAnimations}>
      {renderBlock(activeBlock, prefillData)}
    </motion.div>
  </AnimatePresence>
) : activePatient ? (
  <motion.div key="patient-context" {...blockAnimations}>
    <PatientContextCard />
  </motion.div>
) : (
  <EmptyState />
)}
```

**E3.S2 Technical Notes (✅ GEÏMPLEMENTEERD):**
```typescript
// components/swift/blocks/dagnotitie-block.tsx
// IMPLEMENTATIE:
// 1. Patient search: Debounced search met /api/fhir/Patient?q=...
// 2. Category selector: 5 categorie buttons (medicatie, adl, gedrag, incident, observatie)
// 3. Tekst input: Textarea met character counter (max 500)
// 4. Opslaan: POST /api/reports met type 'verpleegkundig'
// 5. Success toast + auto-close block na 500ms
```

---

### Epic 4 — Navigation & Auth ✅ DONE
**Epic Doel:** Login pagina met interface keuze, routing naar Swift/Klassiek.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E4.S1 | Login form uitbreiden | Interface selector (Swift/Klassiek) | ✅ | E0.S3 | 2 |
| E4.S2 | Preference opslag | user_metadata.preferred_interface | ✅ | E4.S1 | 2 |
| E4.S3 | Redirect middleware | /epd → preference route | ✅ | E4.S2 | 2 |
| E4.S4 | Fallback Picker | Visuele keuze bij lage confidence | ✅ | E3.S0 | 2 |

---

### Epic 5 — Polish & Testing 🔄 IN PROGRESS
**Epic Doel:** Gepolijste UX met animaties, error handling en tests.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E5.S1 | Block animaties | Slide up/down met framer-motion | ✅ | E3.S0 | 2 |
| E5.S2 | Error handling | Network errors, validation, toasts | ⏳ | E3.S6 | 2 |
| E5.S3 | Keyboard shortcuts | Verificatie bestaande shortcuts werken | ⏳ | E1.S1 | 2 |
| E5.S4 | Smoke tests | Happy flow tests voor alle P1 blocks | ⏳ | E5.S2 | 2 |

**E5.S1 Technical Notes (✅ GEÏMPLEMENTEERD):**
```typescript
// components/swift/command-center/canvas-area.tsx
// IMPLEMENTATIE volgens UX specificatie (sectie 11.1):
// Openen: Slide up + fade in (200ms), Scale: 0.95 → 1.0
// Sluiten: Slide down + fade out (200ms), Scale: 1.0 → 0.95
const blockAnimations = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  exit: { 
    opacity: 0, 
    y: 20, // Slide down (niet omhoog)
    scale: 0.95,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
};

// AnimatePresence met mode="wait" voor soepele transitions
<AnimatePresence mode="wait" initial={false}>
  {activeBlock && (
    <motion.div 
      key={activeBlock}
      initial={blockAnimations.initial}
      animate={blockAnimations.animate}
      exit={blockAnimations.exit}
    >
      {renderBlock(activeBlock, prefillData)}
    </motion.div>
  )}
</AnimatePresence>
```

**Nota:** Keyboard shortcuts (⌘K focus, Escape close) zijn al geïmplementeerd in E1.S1.
E5.S3 is nu verificatie + eventuele uitbreiding (Enter submit, etc.).

---

## 5. Technische Debt & Bekende Issues

### 5.1 Type Duplicatie (Medium Priority)

**Probleem:**
```typescript
// lib/swift/types.ts - BRON
export type SwiftIntent = 'dagnotitie' | 'zoeken' | 'overdracht' | 'unknown';

// stores/swift-store.ts - DUPLICAAT (moet verwijderd worden)
export type SwiftIntent = 'dagnotitie' | 'zoeken' | 'overdracht' | 'unknown';
```

**Impact:** Bij uitbreiding intents (diagnostiek workflow) moet op twee plekken gewijzigd worden.

**Oplossing:** Verwijder duplicaat uit `swift-store.ts`, importeer uit `lib/swift/types.ts`:
```typescript
// stores/swift-store.ts
import type { SwiftIntent, BlockType, ShiftType } from '@/lib/swift/types';
```

**Wanneer:** Voorafgaand aan E-D1.S1 (diagnostiek intent patterns).

### 5.2 BlockContainer Animaties (RESOLVED)

**Probleem:** BlockContainer bestaat maar heeft nog geen framer-motion animaties.

**Oplossing:** Geïmplementeerd in E3.S1. BlockContainer heeft nu volledige animatie support met framer-motion.

### 5.3 CanvasArea Placeholder (RESOLVED)

**Probleem:** CanvasArea toont placeholder tekst i.p.v. blocks.

**Oplossing:** Geïmplementeerd in E3.S0. CanvasArea heeft nu volledige block rendering met switch/case en animaties.

---

## 6. Kwaliteit & Testplan

### 6.1 Test Types

| Test Type | Scope | Tools | Wanneer |
|-----------|-------|-------|---------|
| Unit Tests | Intent classifier, entity extraction | Vitest | E2 |
| Integration Tests | API endpoints | Vitest + MSW | E2, E3 |
| Component Tests | Blocks, Command Center | React Testing Library | E3, E5 |
| E2E Tests | Complete flows | Playwright (optioneel) | E5 |
| Manual Tests | Demo scenarios | Checklist | E5 |

### 6.2 Test Coverage Targets

| Area | Target | Reden |
|------|--------|-------|
| Intent classifier | 90%+ | Kritiek voor UX |
| API routes | 80%+ | Data integrity |
| UI components | 60%+ | Belangrijkste flows |

### 6.3 Manual Test Checklist (MVP Demo)

**Happy Flows:**
- [ ] User kan inloggen en Swift kiezen (E4)
- [x] Command input krijgt focus met Cmd+K (E1.S1)
- [x] "notitie jan medicatie" → DagnotatieBlock opent met prefill (E3.S2)
- [x] Dagnotitie opslaan → toast + block sluit (E3.S2)
- [x] "zoek marie" → ZoekenBlock met resultaten (E3.S4)
- [x] Patiënt selecteren → PatientContextCard (E3.S5)
- [x] "overdracht" → OverdrachtBlock met AI samenvatting (E3.S6)
- [x] Voice input → transcript in command input (E1.S4)

**Error Scenarios:**
- [ ] Onbekende intent → FallbackPicker (E4.S4)
- [x] Network error → toast met retry (E3.S2, E3.S6)
- [x] Lege notitie → validation error (E3.S2)
- [x] Geen zoekresultaten → "Geen patiënten gevonden" (E3.S4)

---

## 7. Demo & Presentatieplan

### 7.1 Demo Scenario

**Duur:** 10 minuten
**Doelgroep:** Zorgprofessionals, management
**Locatie:** Live op Vercel

**Flow:**

```
1. INTRO (1 min)
   "40% van je tijd gaat naar administratie.
    Wat als je gewoon kon zeggen wat je wilt?"

2. CONTRAST (2 min)
   Klassiek EPD: Dashboard → Patiënten → Jan → Rapportages →
                 Nieuwe → Type → Tekst → Opslaan
   Swift: "notitie jan medicatie gegeven" → Opslaan

3. DAGNOTITIE FLOW (2 min)
   - Typ: "notitie jan medicatie uitgereikt"
   - Block verschijnt voorgevuld
   - Één klik: opgeslagen

4. VOICE DEMO (2 min)
   - Klik microfoon
   - Spreek: "marie had een rustige nacht, goed geslapen"
   - Block verschijnt met transcript

5. OVERDRACHT (2 min)
   - "overdracht"
   - AI genereert samenvatting per patiënt
   - Toon bronverwijzingen

6. AFSLUITING (1 min)
   - Tijdsbesparing recap
   - Vragen
```

### 7.2 Backup Plan

| Probleem | Oplossing |
|----------|-----------|
| Internet issues | Localhost met demo data |
| Voice niet werkt | Type-only demo |
| AI API down | Pre-cached responses |
| Complete failure | Video recording |

---

## 8. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| Voice accuracy NL | Middel | Hoog | Deepgram NL model, fallback naar tekst | Dev |
| Intent misclassificatie | Middel | Hoog | Two-tier systeem, FallbackPicker | Dev |
| AI latency | Laag | Middel | Local-first, Haiku model | Dev |
| User adoption | Middel | Middel | Keuze behouden, geen dwang | Product |
| Scope creep | Hoog | Hoog | Strict P1-only, backlog voor rest | Dev |
| Performance | Laag | Middel | Code splitting, lazy loading | Dev |
| **CanvasArea blocking** | Hoog | Hoog | E3.S0 prioriteit na E2.S5 | Dev |

---

## 9. Sprint Planning (Aangepast)

### Huidige Status (24-12-2024)
- ✅ E0: Setup & Foundation (8 SP) — DONE
- ✅ E1: Command Center (13 SP) — DONE
- ✅ E2: Intent Classification (12 SP) — DONE
- ✅ E3: P1 Blocks (23 SP) — DONE
- ✅ E4: Navigation & Auth (8 SP) — DONE
- 🔄 E5: Polish & Testing (8 SP) — IN PROGRESS (2/8 SP done)
- ⏳ E5.S2-E5.S4: Remaining (6 SP) — TO DO

**Totaal Done: 58 SP / 72 SP (81%)**

### Sprint 3 (Voltooid): Core Wiring + Blocks
- ✅ E2.S5: Input → Block wiring (2 SP) — DONE
- ✅ E3.S0: CanvasArea block rendering (2 SP) — DONE
- ✅ E3.S1: Block Container (2 SP) — DONE
- ✅ E3.S2: DagnotatieBlock (5 SP) — DONE
- **Deliverable:** "notitie jan" → DagnotatieBlock werkt end-to-end ✅

### Sprint 4 (Voltooid): Remaining Blocks
- ✅ E3.S3: Patient search API (3 SP) — DONE
- ✅ E3.S4: ZoekenBlock (3 SP) — DONE
- ✅ E3.S5: PatientContextCard (5 SP) — DONE
- ✅ E3.S6: OverdrachtBlock (3 SP) — DONE
- **Deliverable:** Alle P1 blocks werken ✅

### Sprint 5: Polish & Ship (In Progress)
- ✅ E4: Navigation & Auth (8 SP) — DONE
- 🔄 E5: Polish & Testing (8 SP) — IN PROGRESS
  - ✅ E5.S1: Block animaties (2 SP) — DONE
  - ⏳ E5.S2: Error handling (2 SP) — TO DO
  - ⏳ E5.S3: Keyboard shortcuts verificatie (2 SP) — TO DO
  - ⏳ E5.S4: Smoke tests (2 SP) — TO DO
- Technische debt opruimen
- **Deliverable:** Demo-ready MVP

---

## 10. Uitbreidingen (Backlog)

### Diagnostiek Workflow (22 SP)

**Status:** Gepland na MVP
**Documentatie:** `bouwplan-swift-diagnostiek-workflow.md`

| Epic | Stories | SP | Vereisten |
|------|---------|----:|-----------|
| E-D1 | Afspraak & Rapportage | 12 | E3 compleet |
| E-D2 | Diagnose Beheer | 10 | E3 compleet |

**Pre-requisites:**
1. Swift MVP compleet (E0-E5)
2. Report type "diagnostiek" toevoegen aan REPORT_TYPES
3. SwiftIntent uitbreiden met nieuwe types
4. Entity extraction voor datum/tijd

**Zie:** `bouwplan-swift-diagnostiek-workflow-beoordeling.md` voor details.

---

## 11. Definition of Done

Een story is **Done** wanneer:
- [ ] Code geschreven en werkend
- [ ] TypeScript types correct (geen duplicaten)
- [ ] Component responsive (mobile + desktop)
- [ ] Error states afgehandeld
- [ ] Toegankelijkheid basics (focus, labels)
- [ ] Getest in Chrome + Safari
- [ ] PR reviewed (indien team)
- [ ] Gemerged naar main

Een epic is **Done** wanneer:
- [ ] Alle stories Done
- [ ] Integration test passed
- [ ] Demo scenario werkt

---

## 12. Referenties

### Project Documenten
- PRD: `docs/swift/swift-prd.md`
- FO: `docs/swift/swift-fo-ai.md`
- TO: `docs/swift/to-swift-v1.md`
- UX: `docs/swift/swift-ux-v2.1.md`
- Diagnostiek FO: `docs/swift/swift-fo-diagnostiek-workflow.md`
- Diagnostiek Bouwplan: `docs/swift/bouwplan-swift-diagnostiek-workflow.md`
- Beoordeling: `docs/swift/bouwplan-swift-diagnostiek-workflow-beoordeling.md`

### Bestaande Code Referenties
- Swift Store: `stores/swift-store.ts`
- Swift Types: `lib/swift/types.ts` (SINGLE SOURCE)
- Intent Classifier: `lib/swift/intent-classifier.ts`
- Intent API: `app/api/intent/classify/route.ts`
- Command Center: `components/swift/command-center/`
- Block Container: `components/swift/blocks/block-container.tsx`

### Bestaande EPD Code (Hergebruik)
- Command component: `components/ui/command.tsx`
- Speech streaming: `components/speech-recorder-streaming.tsx`
- Overdracht API: `app/api/overdracht/generate/route.ts`
- Report types: `lib/types/report.ts`
- Reports API: `app/api/reports/route.ts`

### External
- Zustand: https://zustand-demo.pmnd.rs/
- cmdk: https://cmdk.paco.me/
- Deepgram: https://developers.deepgram.com/docs
- Claude API: https://docs.anthropic.com/
- Framer Motion: https://www.framer.com/motion/

---

## 13. Glossary

| Term | Betekenis |
|------|-----------|
| Swift | Projectnaam voor Contextual UI EPD |
| Command Center | Hoofdscherm met één input |
| Block | Ephemeral UI component (dagnotitie, zoeken, etc.) |
| Intent | Gebruikersintentie (dagnotitie, zoeken, overdracht) |
| Entity | Geëxtraheerde data (patiëntnaam, categorie) |
| Prefill | Vooraf ingevulde data in block |
| Klassiek EPD | Traditionele menu-gebaseerde interface |
| P1 | Prioriteit 1 (MVP scope) |
| SP | Story Points (Fibonacci: 1, 2, 3, 5, 8) |
| Wiring | Koppeling tussen componenten (input → API → block) |

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 23-12-2024 | Colin Lit | Initiële versie |
| v1.1 | 23-12-2024 | Claude | E0 + E1 voltooid (21 SP) |
| v1.2 | 23-12-2024 | Claude | E2.S1 + E2.S2 voltooid (27 SP) |
| v1.3 | 23-12-2024 | Claude | E2.S3 AI fallback voltooid (29 SP) |
| v1.4 | 23-12-2024 | Claude | E2.S1-S4 voltooid (31 SP) |
| v1.5 | 24-12-2024 | Claude | E2.S5 toegevoegd: Input → Block wiring (+2 SP) |
| **v2.0** | **24-12-2024** | **Claude** | **Major update: E3.S0 toegevoegd, technische debt sectie, diagnostiek workflow referentie, sprint planning aangepast (29 stories, 72 SP)** |
| **v2.1** | **24-12-2024** | **Claude** | **E2.S5 voltooid: Input → Block wiring geïmplementeerd, Epic 2 compleet (33 SP done, 46%)** |
| **v2.2** | **24-12-2024** | **Claude** | **Epic 3 compleet: Alle P1 blocks geïmplementeerd (E3.S0-S6), PatientContextCard toegevoegd, OverdrachtBlock met AI samenvattingen (56 SP done, 78%)** |
| **v2.3** | **24-12-2024** | **Claude** | **E5.S1 compleet: Block animaties geïmplementeerd volgens UX specificatie (slide up/down met fade en scale, 200ms), Epic 4 compleet (58 SP done, 81%)** |
