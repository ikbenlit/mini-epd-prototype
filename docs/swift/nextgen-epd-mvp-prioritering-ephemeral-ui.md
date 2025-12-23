# MVP & Prioritering Ephemeral UI EPD

**Document:** MVP Scope en Implementatie Prioritering
**Datum:** december 2024
**Status:** Definitief

---

## 1. MVP Definitie

### 1.1 Eén Zin

> **MVP = Een Command Center waarmee je met tekst of voice een dagnotitie of rapportage maakt, met automatische patient herkenning.**

### 1.2 MVP Scope

```
┌─────────────────────────────────────────────────────────────┐
│                        MVP SCOPE                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  IN SCOPE (Must Have)                                       │
│  ─────────────────────                                      │
│  ✓ Command Center pagina                                    │
│  ✓ Text input met intent herkenning                         │
│  ✓ Voice input (Deepgram - bestaat al)                      │
│  ✓ Dagnotitie blok                                          │
│  ✓ Zoeken blok                                              │
│  ✓ Patient pre-fill uit input                               │
│  ✓ Fallback blok-picker                                     │
│                                                             │
│  SHOULD HAVE (Demo Enhanced)                                │
│  ───────────────────────────                                │
│  ○ Rapportage blok                                          │
│  ○ Overdracht blok met AI                                   │
│  ○ Recent actions tracking                                  │
│  ○ Context bar (dienst info)                                │
│                                                             │
│  OUT OF SCOPE (v1)                                          │
│  ─────────────────                                          │
│  ✗ Behandelplan blok                                        │
│  ✗ Intake blok                                              │
│  ✗ Agenda blok                                              │
│  ✗ Metingen blok                                            │
│  ✗ Ambient listening                                        │
│  ✗ Multi-user realtime                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Waarom Deze Scope?

| Keuze | Rationale |
|-------|-----------|
| Dagnotitie eerst | Hoogste frequentie (20x/dag), simpelste form |
| Zoeken als fundament | Elke actie begint met "wie" - zonder zoeken geen pre-fill |
| Voice must-have | "Ik draag handschoenen" - zorg context vereist hands-free |
| Fallback verplicht | Vertrouwen: nooit een doodlopende straat |
| Geen behandelplan | Te complex, lage frequentie, bestaande UI voldoet |

---

## 2. Hergebruik Bestaande Code

### 2.1 Direct Herbruikbaar

| Component | Locatie | Hergebruik |
|-----------|---------|------------|
| **Speech Recorder** | `components/speech-recorder.tsx` | 100% - drop-in |
| **Deepgram API** | `api/deepgram/transcribe/route.ts` | 100% - werkt |
| **Toast System** | `lib/hooks/use-toast.ts` | 100% - feedback |
| **Command (cmdk)** | `components/ui/command.tsx` | 90% - zoek basis |
| **Dagregistratie Form** | `app/epd/dagregistratie/` | 80% - wrap als blok |
| **Report Types** | `lib/types/report.ts` | 100% - validatie |
| **Verpleegkundig API** | `api/reports/route.ts` | 100% - save |

### 2.2 Gedeeltelijk Herbruikbaar

| Component | Locatie | Aanpassing Nodig |
|-----------|---------|------------------|
| **Patient List** | `app/epd/verpleegrapportage/` | → PatientCard voor zoeken |
| **EPD Layout** | `app/epd/layout.tsx` | → Command Center layout |
| **Report Composer** | `app/epd/patients/[id]/rapportage/` | → RapportageBlock wrapper |

### 2.3 Nieuw te Bouwen

| Component | Geschatte Effort | Prioriteit |
|-----------|------------------|------------|
| `/app/command-center/page.tsx` | 4h | P1 |
| `/api/intent/classify/route.ts` | 6h | P1 |
| `CommandInput.tsx` | 3h | P1 |
| `BlockContainer.tsx` | 2h | P1 |
| `DagnotitieBlock.tsx` | 3h | P1 |
| `ZoekenBlock.tsx` | 4h | P1 |
| `FallbackPicker.tsx` | 2h | P1 |
| `PatientResolver.ts` | 2h | P1 |
| `useCommandCenter.ts` (store) | 3h | P1 |
| **Totaal MVP** | **~29h** | - |

---

## 3. Prioritering: MoSCoW

### 3.1 Must Have (Release Blocker)

```
M1. Command Center Layout
    └── Centrale pagina met input field
    └── Route: /command-center

M2. Intent Classification
    └── API endpoint dat input analyseert
    └── Returns: { intent, entities, confidence }

M3. Dagnotitie Blok
    └── Simpele form: patient, categorie, tekst
    └── Pre-fill support
    └── 1-click save

M4. Zoeken Blok
    └── Patient search met cmdk
    └── PatientCard met quick actions
    └── Set active patient

M5. Voice Input
    └── Deepgram integratie in Command input
    └── Live transcript display

M6. Fallback Picker
    └── Grid met blok icons
    └── Toont bij lage confidence of onbekende intent

M7. Patient Pre-fill
    └── Entity extraction uit input
    └── Patient name → ID resolver
```

### 3.2 Should Have (Demo Value)

```
S1. Rapportage Blok
    └── Wrapper rond bestaande ReportComposer
    └── Voice dictation in editor
    └── AI structurering knop

S2. Overdracht Blok
    └── AI samenvatting (API bestaat)
    └── Multi-patient view
    └── Bronverwijzingen

S3. Recent Actions
    └── Badge strip onder input
    └── Click to re-open

S4. Context Bar
    └── "Ochtend dienst | 8 patiënten"
    └── Shift awareness
```

### 3.3 Could Have (Nice to Have)

```
C1. Categorie Herkenning
    └── "medicatie" → Medicatie category
    └── Keyword mapping

C2. Animaties
    └── Block slide-in
    └── Pre-fill highlight
    └── Success celebration

C3. Keyboard Shortcuts
    └── Cmd+K → focus input
    └── Enter → submit
    └── Esc → close block

C4. Onboarding Hints
    └── "Probeer: notitie jan"
    └── First-time user guidance
```

### 3.4 Won't Have (Explicit Out)

```
W1. Behandelplan Blok - te complex, lage frequentie
W2. Intake Blok - wizard is complex, 1x/maand
W3. Agenda Blok - bestaande werkt, lage urgentie
W4. Metingen Blok - lage waarde-perceptie
W5. Ambient Listening - v2+ feature
W6. Offline Mode - v2+ feature
```

---

## 4. Implementatie Volgorde

### 4.1 Dependency Graph

```
                    ┌─────────────────┐
                    │ Command Center  │
                    │     Layout      │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  Voice   │  │  Intent  │  │ Fallback │
        │  Input   │  │   API    │  │  Picker  │
        └────┬─────┘  └────┬─────┘  └──────────┘
             │              │
             │      ┌───────┴───────┐
             │      │               │
             ▼      ▼               ▼
        ┌──────────────┐    ┌──────────────┐
        │   Zoeken     │    │  Dagnotitie  │
        │    Blok      │    │    Blok      │
        └──────┬───────┘    └──────────────┘
               │
               ▼
        ┌──────────────┐
        │  Pre-fill    │
        │   Logic      │
        └──────────────┘
```

### 4.2 Sprint Planning

#### Sprint 1: Foundation (Dag 1-3)

| # | Taak | Afhankelijk van | Output |
|---|------|-----------------|--------|
| 1.1 | Command Center page layout | - | `/app/command-center/page.tsx` |
| 1.2 | CommandInput component | 1.1 | Text input met submit |
| 1.3 | BlockContainer wrapper | 1.1 | Generic block frame |
| 1.4 | Zustand store setup | - | `useCommandCenter` hook |
| 1.5 | Voice integratie | 1.2 | Mic button in input |

**Deliverable:** Command Center opent, voice werkt, geen blokken nog.

#### Sprint 2: Intent & Zoeken (Dag 4-6)

| # | Taak | Afhankelijk van | Output |
|---|------|-----------------|--------|
| 2.1 | Intent API route | - | `/api/intent/classify` |
| 2.2 | Entity extraction | 2.1 | Patient name uit tekst |
| 2.3 | Patient search API | - | `/api/patients/search` |
| 2.4 | ZoekenBlock | 1.3, 2.3 | Patient cards + select |
| 2.5 | Fallback picker | 1.3 | Grid met blok icons |

**Deliverable:** "zoek jan" werkt, patient selectie mogelijk.

#### Sprint 3: Dagnotitie Flow (Dag 7-9)

| # | Taak | Afhankelijk van | Output |
|---|------|-----------------|--------|
| 3.1 | DagnotitieBlock | 1.3 | Quick entry form |
| 3.2 | Pre-fill logic | 2.2, 3.1 | Patient + categorie auto |
| 3.3 | Save flow | 3.1 | Toast + recent badge |
| 3.4 | Intent → Block routing | 2.1, 3.1 | "notitie jan" → block |

**Deliverable:** "notitie voor jan: medicatie gegeven" werkt end-to-end.

#### Sprint 4: Polish & Demo (Dag 10-12)

| # | Taak | Afhankelijk van | Output |
|---|------|-----------------|--------|
| 4.1 | RapportageBlock | 1.3 | Wrapper rond composer |
| 4.2 | Recent actions strip | 3.3 | Clickable badges |
| 4.3 | Animaties | All | Smooth transitions |
| 4.4 | Demo scenarios | All | 3 happy paths |
| 4.5 | Bug fixes | All | Stability |

**Deliverable:** Demo-ready voor stakeholders.

---

## 5. Technische Beslissingen

### 5.1 State Management

**Besluit:** Zustand

```typescript
// stores/command-center.ts
interface CommandCenterState {
  // Active state
  activeBlock: 'dagnotitie' | 'zoeken' | 'rapportage' | 'overdracht' | null
  activePatient: Patient | null

  // Input state
  inputValue: string
  isListening: boolean
  transcript: string

  // Pre-fill data
  prefillData: {
    patientName?: string
    category?: string
    text?: string
  }

  // History
  recentActions: Action[]

  // Actions
  processInput: (text: string) => Promise<void>
  openBlock: (type: BlockType, prefill?: object) => void
  closeBlock: () => void
  setActivePatient: (patient: Patient) => void
}
```

### 5.2 Intent Classification

**Besluit:** Two-tier approach

```typescript
// Tier 1: Local keyword matching (instant)
const quickMatch = (input: string) => {
  if (/notitie|dagnotitie/i.test(input)) return { intent: 'dagnotitie', confidence: 0.9 }
  if (/zoek|vind|wie is/i.test(input)) return { intent: 'zoeken', confidence: 0.9 }
  if (/overdracht|dienst/i.test(input)) return { intent: 'overdracht', confidence: 0.9 }
  if (/rapport|gesprek/i.test(input)) return { intent: 'rapportage', confidence: 0.85 }
  return null
}

// Tier 2: Claude API (fallback)
const aiClassify = async (input: string) => {
  // Only called if quickMatch returns null or low confidence
}
```

### 5.3 Patient Resolution

**Besluit:** Fuzzy search met Supabase

```typescript
// Fuzzy match op naam
const searchPatients = async (query: string) => {
  const { data } = await supabase
    .from('patients')
    .select('id, name, birth_date')
    .ilike('name', `%${query}%`)
    .limit(5)
  return data
}

// Als 1 match → auto-select
// Als >1 match → toon ZoekenBlock
// Als 0 matches → "Geen patient gevonden"
```

### 5.4 Block Architecture

**Besluit:** Wrapper pattern

```typescript
// Elk blok krijgt dezelfde interface
interface BlockProps {
  prefill?: Record<string, unknown>
  onComplete: (result: unknown) => void
  onClose: () => void
}

// BlockContainer handelt header, minimize, close
<BlockContainer title="Dagnotitie" icon={FileText}>
  <DagnotitieBlock prefill={prefill} onComplete={handleComplete} />
</BlockContainer>
```

---

## 6. Risico's & Mitigaties

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| Intent accuracy <80% | Medium | Hoog | Fallback picker altijd zichtbaar |
| Voice niet goed in NL | Laag | Medium | Deepgram NL model + tekst fallback |
| Pre-fill verkeerde patient | Medium | Hoog | Altijd confirmation, nooit blind save |
| Latency AI calls | Medium | Medium | Local-first matching, AI als backup |
| Demo deadline druk | Medium | Hoog | Scope strict houden, no feature creep |

---

## 7. Success Metrics

### 7.1 MVP Success (Must Hit)

| Metric | Target | Hoe Meten |
|--------|--------|-----------|
| "notitie jan" → save | <30 sec | Timestamp logs |
| Intent accuracy | >85% | Correct block / total |
| Voice transcription | >90% accuracy | Manual review sample |
| Fallback usage | <25% | Picker clicks / total |

### 7.2 Demo Success

| Metric | Target |
|--------|--------|
| 3 scenario's foutloos | 100% |
| Stakeholder "wow" moment | Ja |
| Concrete vervolgafspraak | Ja |

---

## 8. Definition of Done

### 8.1 Per Sprint

- [ ] Alle taken in sprint completed
- [ ] Geen console errors
- [ ] Happy path werkt
- [ ] Code reviewed

### 8.2 MVP Done

- [ ] Command Center bereikbaar op `/command-center`
- [ ] Voice input werkt
- [ ] "notitie voor [patient]" opent DagnotitieBlock
- [ ] "zoek [naam]" toont PatientCards
- [ ] Pre-fill werkt voor patient naam
- [ ] Fallback picker werkt
- [ ] Save + toast feedback werkt
- [ ] Geen blocking bugs
- [ ] 3 demo scenario's gedocumenteerd

---

## 9. Demo Scenario's

### Scenario 1: Snelle Dagnotitie (30 sec)

```
1. Open Command Center
2. Type of spreek: "notitie voor Jan de Vries: medicatie uitgereikt"
3. System:
   - Herkent intent: dagnotitie
   - Herkent patient: Jan de Vries
   - Pre-fills categorie: Medicatie
   - Pre-fills tekst: "medicatie uitgereikt"
4. User: Review → Opslaan
5. Toast: "Notitie opgeslagen"
6. Recent badge verschijnt
```

### Scenario 2: Patient Zoeken + Notitie (45 sec)

```
1. Type: "notitie marie"
2. System: Meerdere "Marie" gevonden
3. Toont: ZoekenBlock met 3 matches
4. User: Selecteert "Marie van den Berg"
5. System: Opent DagnotitieBlock met patient ingevuld
6. User: Typt notitie → Opslaan
```

### Scenario 3: Voice Flow (40 sec)

```
1. Klik mic button
2. Spreek: "Mevrouw Jansen heeft goed gegeten en haar medicatie ingenomen"
3. System:
   - Transcribeert real-time
   - Herkent: patient = Jansen, categorie = ADL + Medicatie
4. Toont: DagnotitieBlock met alles ingevuld
5. User: Review → Opslaan
```

---

## 10. Appendix: File Structure

```
app/
├── command-center/
│   ├── page.tsx                    # Main Command Center
│   └── components/
│       ├── command-input.tsx       # Text + voice input
│       ├── voice-indicator.tsx     # Listening state UI
│       ├── block-container.tsx     # Generic block wrapper
│       ├── fallback-picker.tsx     # Block selection grid
│       └── recent-actions.tsx      # Recent badges strip

├── api/
│   └── intent/
│       └── classify/
│           └── route.ts            # Intent classification API

components/
└── building-blocks/
    ├── dagnotitie-block.tsx        # Quick entry form
    ├── zoeken-block.tsx            # Patient search
    ├── rapportage-block.tsx        # Report composer wrapper
    └── overdracht-block.tsx        # Handover summary

stores/
└── command-center.ts               # Zustand store

lib/
├── intent/
│   ├── classifier.ts               # Intent classification logic
│   ├── entity-extractor.ts         # Extract patient, category
│   └── patient-resolver.ts         # Name → Patient lookup
└── types/
    └── command-center.ts           # TypeScript types
```

---

*Dit document is de single source of truth voor MVP scope en prioritering.*
