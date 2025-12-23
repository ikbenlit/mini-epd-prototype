# Mission Control — Bouwplan Swift v1.0

**Projectnaam:** Swift — Contextual UI EPD
**Versie:** v1.0
**Datum:** 23-12-2024
**Auteur:** Colin Lit / Development Team

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

**Nieuw toe te voegen:**
| Component | Technologie | Versie | Reden |
|-----------|-------------|--------|-------|
| State Management | Zustand | ^4.5.0 | Lightweight, TypeScript-first |

### 2.2 Projectkaders

| Kader | Waarde |
|-------|--------|
| **Bouwtijd** | 4 weken (4 sprints) |
| **Team** | 1 developer |
| **Scope** | MVP: P1 blocks (dagnotitie, zoeken, overdracht) |
| **Data** | Bestaande Supabase database |
| **Doel** | Werkende demo + user testing |

### 2.3 Programmeer Uitgangspunten

**Code Quality Principles:**

- **DRY (Don't Repeat Yourself)**
  - Herbruikbare block componenten
  - Centrale intent classificatie logica
  - Shared hooks voor common patterns

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
│   │   └── index.ts                // Barrel export
│   └── blocks/
│       ├── dagnotitie-block.tsx
│       ├── zoeken-block.tsx
│       └── index.ts

// ✅ Store slice pattern
stores/
└── swift-store.ts                   // Single store file

// ✅ Intent classification
lib/
└── swift/
    ├── intent-classifier.ts         // Local classification
    ├── intent-classifier-ai.ts      // AI fallback
    └── types.ts                     // Type definitions
```

---

## 3. Epics & Stories Overzicht

| Epic ID | Titel | Doel | Status | Stories | Effort |
|---------|-------|------|--------|---------|--------|
| E0 | Setup & Foundation | Zustand, routing, base layout | ✅ Done | 4 | 8 SP |
| E1 | Command Center | Input, voice, context bar | ✅ Done | 5 | 13 SP |
| E2 | Intent Classification | Local + AI fallback | ⏳ To Do | 4 | 10 SP |
| E3 | P1 Blocks | Dagnotitie, Zoeken, Overdracht | ⏳ To Do | 6 | 21 SP |
| E4 | Navigation & Auth | Login keuze, routing, preferences | ⏳ To Do | 4 | 8 SP |
| E5 | Polish & Testing | Animaties, error handling, tests | ⏳ To Do | 4 | 8 SP |

**Totaal: 27 stories, 68 story points (21 SP done, 47 SP remaining)**

**Belangrijk:**
- Bouw per epic en per story, niet alles tegelijk
- Dependencies installeren: eerst aan Colin melden
- Database migraties: eerst aan Colin melden

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 — Setup & Foundation
**Epic Doel:** Werkende development omgeving met Zustand store en Swift routing.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E0.S1 | Zustand installeren | `pnpm add zustand` succesvol, import werkt | ✅ | — | 1 |
| E0.S2 | Swift store opzetten | `stores/swift-store.ts` met basis state | ✅ | E0.S1 | 2 |
| E0.S3 | Swift route aanmaken | `/epd/swift` route met eigen layout | ✅ | E0.S2 | 2 |
| E0.S4 | Swift folder structuur | `components/swift/`, `lib/swift/` aangemaakt | ✅ | E0.S3 | 3 |

**Technical Notes:**
```bash
# E0.S1: Dependency installatie
pnpm add zustand
```

```typescript
// E0.S2: Store structuur
// stores/swift-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface SwiftStore {
  // Context
  activePatient: Patient | null;
  shift: 'nacht' | 'ochtend' | 'middag' | 'avond';

  // Block state
  activeBlock: BlockType | null;
  prefillData: Record<string, unknown>;

  // Actions
  setActivePatient: (patient: Patient | null) => void;
  openBlock: (type: BlockType, prefill?: Record<string, unknown>) => void;
  closeBlock: () => void;
}
```

---

### Epic 1 — Command Center
**Epic Doel:** Werkende command center met tekst en voice input.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E1.S1 | Command Center layout | 4-zone layout (context, canvas, recent, input) | ✅ | E0.S4 | 3 |
| E1.S2 | Context Bar | Dienst, patiënt dropdown, user info | ✅ | E1.S1 | 2 |
| E1.S3 | Command Input | Tekst input met placeholder, focus state | ✅ | E1.S1 | 2 |
| E1.S4 | Voice Input integratie | Deepgram streaming in command input | ✅ | E1.S3 | 3 |
| E1.S5 | Recent Strip | Laatste 5 acties als chips | ✅ | E1.S1 | 3 |

**Technical Notes:**
```
Command Center Layout:
┌─────────────────────────────────────────┐
│ Context Bar (48px)                       │
├─────────────────────────────────────────┤
│                                         │
│ Canvas Area (flex)                      │
│                                         │
├─────────────────────────────────────────┤
│ Recent Strip (48px)                     │
├─────────────────────────────────────────┤
│ Command Input (64px, fixed bottom)      │
└─────────────────────────────────────────┘
```

---

### Epic 2 — Intent Classification
**Epic Doel:** Two-tier intent classificatie (local + AI fallback).

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E2.S1 | Local classifier | Regex patterns voor P1 intents, <50ms | ⏳ | E0.S4 | 3 |
| E2.S2 | Entity extraction | Patient naam, categorie uit input | ⏳ | E2.S1 | 3 |
| E2.S3 | AI fallback | Claude Haiku bij confidence <0.8 | ⏳ | E2.S2 | 2 |
| E2.S4 | Intent API route | POST /api/intent/classify | ⏳ | E2.S3 | 2 |

**Technical Notes:**
```typescript
// E2.S1: Local classifier patterns
const INTENT_PATTERNS = {
  dagnotitie: [
    /^notitie\s+(\w+)/i,
    /^(\w+)\s+(medicatie|adl|gedrag|incident)/i,
    /dagnotitie/i,
  ],
  zoeken: [
    /^zoek\s+(\w+)/i,
    /^wie is\s+(\w+)/i,
    /^vind\s+(\w+)/i,
  ],
  overdracht: [
    /^overdracht/i,
    /^dienst (klaar|afronden)/i,
    /^wat moet ik weten/i,
  ],
};
```

---

### Epic 3 — P1 Blocks
**Epic Doel:** Werkende DagnotatieBlock, ZoekenBlock en OverdrachtBlock.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E3.S1 | Block Container | Animatie wrapper, close button, sizes | ⏳ | E1.S1 | 2 |
| E3.S2 | DagnotatieBlock | Patient, categorie, tekst, opslaan | ⏳ | E3.S1, E2.S2 | 5 |
| E3.S3 | Patient search API | GET /api/patients/search?q= fuzzy search | ⏳ | E0.S4 | 3 |
| E3.S4 | ZoekenBlock | Input, resultaten, selectie → store | ⏳ | E3.S1, E3.S3 | 3 |
| E3.S5 | PatientContextCard | Na selectie: notities, vitals, diagnose | ⏳ | E3.S4 | 5 |
| E3.S6 | OverdrachtBlock | AI samenvatting per patiënt (bestaande API) | ⏳ | E3.S1 | 3 |

**Technical Notes:**
```typescript
// E3.S2: DagnotatieBlock prefill
interface DagnotitieBlockProps {
  prefill?: {
    patientId?: string;
    patientName?: string;
    category?: VerpleegkundigCategory;
    content?: string;
  };
  onSave: () => void;
  onCancel: () => void;
}

// Gebruikt bestaande POST /api/reports
```

---

### Epic 4 — Navigation & Auth
**Epic Doel:** Login pagina met interface keuze, routing naar Swift/Klassiek.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E4.S1 | Login form uitbreiden | Interface selector (Swift/Klassiek) | ⏳ | E0.S3 | 2 |
| E4.S2 | Preference opslag | user_metadata.preferred_interface | ⏳ | E4.S1 | 2 |
| E4.S3 | Redirect middleware | /epd → preference route | ⏳ | E4.S2 | 2 |
| E4.S4 | Fallback Picker | Visuele keuze bij lage confidence | ⏳ | E3.S1 | 2 |

**Technical Notes:**
```typescript
// E4.S2: Preference in Supabase
await supabase.auth.updateUser({
  data: {
    preferred_interface: 'swift', // of 'classic'
    remember_interface_choice: true,
  },
});
```

---

### Epic 5 — Polish & Testing
**Epic Doel:** Gepolijste UX met animaties, error handling en tests.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E5.S1 | Block animaties | Slide up/down met framer-motion | ⏳ | E3.S1 | 2 |
| E5.S2 | Error handling | Network errors, validation, toasts | ⏳ | E3.S6 | 2 |
| E5.S3 | Keyboard shortcuts | Cmd+K focus, Escape close, Enter submit | ⏳ | E1.S3 | 2 |
| E5.S4 | Smoke tests | Happy flow tests voor alle P1 blocks | ⏳ | E5.S2 | 2 |

**Technical Notes:**
```typescript
// E5.S1: Framer Motion animaties
const blockVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.95 },
};

// E5.S3: Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      inputRef.current?.focus();
    }
    if (e.key === 'Escape') {
      closeBlock();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## 5. Kwaliteit & Testplan

### 5.1 Test Types

| Test Type | Scope | Tools | Wanneer |
|-----------|-------|-------|---------|
| Unit Tests | Intent classifier, entity extraction | Vitest | E2 |
| Integration Tests | API endpoints | Vitest + MSW | E2, E3 |
| Component Tests | Blocks, Command Center | React Testing Library | E3, E5 |
| E2E Tests | Complete flows | Playwright (optioneel) | E5 |
| Manual Tests | Demo scenarios | Checklist | E5 |

### 5.2 Test Coverage Targets

| Area | Target | Reden |
|------|--------|-------|
| Intent classifier | 90%+ | Kritiek voor UX |
| API routes | 80%+ | Data integrity |
| UI components | 60%+ | Belangrijkste flows |

### 5.3 Manual Test Checklist (MVP Demo)

**Happy Flows:**
- [ ] User kan inloggen en Swift kiezen
- [ ] Command input krijgt focus met Cmd+K
- [ ] "notitie jan medicatie" → DagnotatieBlock opent met prefill
- [ ] Dagnotitie opslaan → toast + block sluit
- [ ] "zoek marie" → ZoekenBlock met resultaten
- [ ] Patiënt selecteren → PatientContextCard
- [ ] "overdracht" → OverdrachtBlock met AI samenvatting
- [ ] Voice input → transcript in command input

**Error Scenarios:**
- [ ] Onbekende intent → FallbackPicker
- [ ] Network error → toast met retry
- [ ] Lege notitie → validation error
- [ ] Geen zoekresultaten → "Geen patiënten gevonden"

---

## 6. Demo & Presentatieplan

### 6.1 Demo Scenario

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

### 6.2 Backup Plan

| Probleem | Oplossing |
|----------|-----------|
| Internet issues | Localhost met demo data |
| Voice niet werkt | Type-only demo |
| AI API down | Pre-cached responses |
| Complete failure | Video recording |

---

## 7. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| Voice accuracy NL | Middel | Hoog | Deepgram NL model, fallback naar tekst | Dev |
| Intent misclassificatie | Middel | Hoog | Two-tier systeem, FallbackPicker | Dev |
| AI latency | Laag | Middel | Local-first, Haiku model | Dev |
| User adoption | Middel | Middel | Keuze behouden, geen dwang | Product |
| Scope creep | Hoog | Hoog | Strict P1-only, backlog voor rest | Dev |
| Performance | Laag | Middel | Code splitting, lazy loading | Dev |

---

## 8. Sprint Planning

### Sprint 1 (Week 1): Foundation
- E0: Setup & Foundation (8 SP)
- E1.S1-S3: Command Center basics (7 SP)
- **Deliverable:** Swift route met command input

### Sprint 2 (Week 2): Intent & Blocks
- E1.S4-S5: Voice + Recent (6 SP)
- E2: Intent Classification (10 SP)
- **Deliverable:** Werkende intent classificatie

### Sprint 3 (Week 3): P1 Blocks
- E3: Alle P1 blocks (21 SP)
- **Deliverable:** DagnotatieBlock, ZoekenBlock, OverdrachtBlock

### Sprint 4 (Week 4): Polish & Ship
- E4: Navigation & Auth (8 SP)
- E5: Polish & Testing (8 SP)
- **Deliverable:** Demo-ready MVP

---

## 9. Definition of Done

Een story is **Done** wanneer:
- [ ] Code geschreven en werkend
- [ ] TypeScript types correct
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

## 10. Referenties

### Project Documenten
- PRD: `docs/swift/swift-prd.md`
- FO: `docs/swift/swift-fo-ai.md`
- TO: `docs/swift/to-swift-v1.md`
- UX: `docs/swift/swift-ux-v2.1.md`

### Bestaande Code Referenties
- Command component: `components/ui/command.tsx`
- Speech streaming: `components/speech-recorder-streaming.tsx`
- Overdracht API: `app/api/overdracht/generate/route.ts`
- Report types: `lib/types/report.ts`

### External
- Zustand: https://zustand-demo.pmnd.rs/
- cmdk: https://cmdk.paco.me/
- Deepgram: https://developers.deepgram.com/docs
- Claude API: https://docs.anthropic.com/

---

## 11. Glossary

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

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 23-12-2024 | Colin Lit | Initiële versie |
| v1.1 | 23-12-2024 | Claude | E0 + E1 voltooid (21 SP) |
