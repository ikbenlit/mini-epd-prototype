# Analyse Ephemeral UI EPD - Multi-Perspectief Review

**Document:** Analyse PRD Ephemeral UI EPD v1.0
**Datum:** december 2024
**Reviewers:** Lead Developer, UX Designer, Frontend Developer, Product Owner

---

## 1. Lead Developer Perspectief

### 1.1 Technische Haalbaarheid

**Verdict:** ✅ Haalbaar met bestaande stack

De PRD vraagt om functionaliteit die grotendeels al bestaat in de codebase. De technische uitdaging zit niet in de bouwblokken zelf, maar in de orchestratielaag.

**Wat we al hebben:**
| Component | Status | Kwaliteit |
|-----------|--------|-----------|
| Next.js 14 App Router | ✅ | Production-ready |
| Supabase Auth + RLS | ✅ | Volledig geconfigureerd |
| Claude API integratie | ✅ | Werkt voor behandelplan + overdracht |
| Deepgram STT | ✅ | Streaming + batch transcriptie |
| TipTap Rich Text | ✅ | Met voice-insert support |
| shadcn/ui + Tailwind | ✅ | 20+ componenten |

**Wat nieuw gebouwd moet worden:**

```
Prioriteit 1 (Kritiek):
├── /api/intent/classify     # AI intent classificatie
├── /app/command-center      # Nieuwe entry point
└── stores/commandCenter.ts  # State management

Prioriteit 2 (Bouwblok wrappers):
├── components/building-blocks/BlockContainer.tsx
├── components/building-blocks/PatientResolver.tsx
└── components/building-blocks/EntityExtractor.tsx

Prioriteit 3 (Nieuwe blokken):
├── ZoekenBlock.tsx          # Patient search UI
└── MetingenBlock.tsx        # Vitals input form
```

### 1.2 Architectuurbeslissingen

**State Management:**
Aanbeveling: **Zustand** boven Context API
- Command Center heeft complexe state (activeBlock, activePatient, transcript, recentActions)
- Zustand is al impliciet beschikbaar via React patterns in codebase
- Geen prop drilling, geen provider nesting

```typescript
// Voorgestelde store structuur
interface CommandCenterStore {
  // UI State
  activeBlock: BlockType | null;
  isListening: boolean;
  transcript: string;

  // Context
  activePatient: Patient | null;
  recentActions: Action[];
  shiftInfo: ShiftInfo;

  // Pre-fill data extracted from intent
  prefillData: Record<string, unknown>;
}
```

**Intent Classification:**
Aanbeveling: **Streaming response** met confidence threshold

```typescript
// Twee-staps flow
1. Quick classification (<100ms): regex + keyword matching
2. AI fallback (>100ms): Claude voor ambigue input

// Voorbeeld
"notitie jan" → Quick match: intent=dagnotitie, patient="jan"
"ik heb net iets besproken" → AI needed: wat? met wie?
```

**API Design:**
```
POST /api/intent/classify
  Input:  { text: string, context: { activePatient?, shift? } }
  Output: { intent, confidence, entities, clarification? }

GET /api/context
  Output: { user, shift, patients, pendingItems }
```

### 1.3 Risico's & Mitigaties

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Intent misclassificatie | Hoog | Fallback naar blok-selector UI |
| Latency AI calls | Medium | Local-first matching, AI als fallback |
| Entity extraction fout | Medium | "Bedoelde je X?" confirmation flow |
| State sync issues | Medium | Optimistic UI + server reconciliation |
| Voice in lawaaierige omgeving | Medium | Push-to-talk, geen continuous listening |

### 1.4 Technische Schuld Risico

**Laag risico** - We bouwen bovenop bestaande patterns:
- Bestaande API routes blijven werken
- Bouwblokken zijn wrappers rond bestaande componenten
- Geen database schema wijzigingen nodig
- Geen breaking changes voor huidige EPD flows

### 1.5 Aanbeveling

**Go/No-Go:** ✅ GO

Start met Command Center + Intent API + 2 blokken (Rapportage, Dagnotitie).
Itereer op basis van intent accuracy metrics voordat we alle 8 blokken bouwen.

---

## 2. UX Designer Perspectief

### 2.1 Concept Evaluatie

**De belofte:** Van 12 klikken naar 1 zin.

Dit is een fundamentele paradigma-shift. Geen menu's, geen navigatie-leren, geen "waar zit dat ook alweer?" De gebruiker spreekt intentie, het systeem reageert.

**Sterktes van het concept:**

1. **Cognitive load reductie** - Zorgverleners hoeven geen mentaal model van het EPD te hebben
2. **Context-awareness** - Systeem weet wie je bent, welke dienst, welke patiënten
3. **Hands-free potentieel** - Voice-first past bij zorg (handschoenen, hygiëne)
4. **Ephemeral = focus** - Alleen wat je nu nodig hebt, geen afleiding

**Zorgen:**

1. **Discoverability** - Hoe weet de gebruiker wat mogelijk is?
2. **Error recovery** - Wat als het systeem verkeerd begrijpt?
3. **Power users** - Willen sommigen toch sneltoetsen/directe toegang?
4. **Trust** - "Heeft het systeem mijn notitie wel opgeslagen?"

### 2.2 Interaction Design Analyse

**Command Center Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🎤  Wat wil je doen?                                │   │
│  │     ____________________________________________     │   │
│  │                                                      │   │
│  │  💡 Voorbeelden: "notitie voor Jan", "overdracht",  │   │
│  │     "mijn afspraken", "zoek Marie"                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Context: Ochtend dienst · 8 patiënten · 2 actiepunten     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         [ Actief bouwblok verschijnt hier ]         │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Recent: [Jan - Notitie ✓] [Overdracht 14:00]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Kritieke UX Momenten:**

| Moment | Risico | Design Oplossing |
|--------|--------|------------------|
| Eerste gebruik | "Wat kan ik zeggen?" | Voorbeelden tonen, onboarding hints |
| Ambigue input | Frustratie bij verkeerde interpretatie | "Bedoelde je..." met opties |
| Mid-task switch | Context verlies | "Opslaan als concept?" modal |
| Na voltooiing | Onzekerheid of het werkte | Duidelijke bevestiging + undo optie |
| Geen match | Doodlopende straat | Fallback naar visuele blok-picker |

### 2.3 Microinteracties

**Voice Input Feedback:**
```
[Idle]      →  Grijze microfoon
[Listening] →  Pulserende blauwe ring + live transcript
[Processing]→  Spinner + "Even denken..."
[Matched]   →  Groene check + smooth transition naar blok
[Unclear]   →  Oranje indicator + clarificatie vraag
```

**Blok Transities:**
- **In:** Slide-up met fade (200ms)
- **Minimize:** Collapse naar badge in "Recent" row
- **Close:** Fade-out met success toast

**Pre-fill Animatie:**
Wanneer systeem velden invult op basis van intent:
- Velden highlighten kort (geel flash)
- Sequential fill (niet alles tegelijk)
- "Automatisch ingevuld" label bij pre-filled velden

### 2.4 Accessibility Overwegingen

| Aspect | Vereiste | Implementatie |
|--------|----------|---------------|
| Keyboard-only | Moet volledig werken zonder voice | Tab navigation, Enter to submit |
| Screen readers | Blok-wissels aangekondigd | ARIA live regions |
| Motor impairments | Grote touch targets | Min 44x44px buttons |
| Cognitieve load | Niet te veel tegelijk | Max 1 actief blok |

### 2.5 Fallback Strategie

**De "Noodrem":**
Als conversational interface faalt, moet er altijd een visuele fallback zijn.

```
┌─────────────────────────────────────────────────────────────┐
│  Ik begreep dat niet helemaal. Wat wil je doen?            │
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ 📝      │ │ 👤      │ │ 📋      │ │ 🔄      │           │
│  │Notitie  │ │ Intake  │ │ Plan    │ │Overdracht│          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ 🔍      │ │ 📅      │ │ 💊      │ │ 📊      │           │
│  │ Zoeken  │ │ Agenda  │ │Medicatie│ │Metingen │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### 2.6 Aanbeveling

**Go/No-Go:** ✅ GO met voorwaarden

1. Bouw de fallback picker EERST - dit is je vangnet
2. Investeer in microinteracties - ze maken of breken de "magie"
3. User testing na eerste 2 blokken - niet na alle 8
4. Metrics verzamelen: intent accuracy, tijd-tot-taak, fallback usage

---

## 3. Frontend Developer Perspectief

### 3.1 Component Architectuur

**Huidige staat:** Goed gestructureerd, maar bouwblok-specifiek

We moeten bestaande componenten wrappen om ze "ephemeral" te maken. Dit vereist een abstractielaag.

**Voorgestelde structuur:**

```
components/
├── building-blocks/
│   ├── core/
│   │   ├── BlockContainer.tsx      # Wrapper met header, minimize, close
│   │   ├── BlockHeader.tsx         # Titel + acties
│   │   ├── BlockFooter.tsx         # Save/Cancel buttons
│   │   └── PrefilledField.tsx      # Highlight voor auto-filled
│   │
│   ├── rapportage/
│   │   ├── RapportageBlock.tsx     # Wrapper rond ReportComposer
│   │   └── RapportageBlock.types.ts
│   │
│   ├── dagnotitie/
│   │   ├── DagnotitieBlock.tsx     # Quick entry form
│   │   └── DagnotitieBlock.types.ts
│   │
│   ├── zoeken/
│   │   ├── ZoekenBlock.tsx         # cmdk-based search
│   │   ├── PatientCard.tsx         # Search result card
│   │   └── ZoekenBlock.types.ts
│   │
│   └── ... (andere blokken)
│
├── command-center/
│   ├── CommandInput.tsx            # Text + voice input
│   ├── VoiceIndicator.tsx          # Listening state UI
│   ├── ContextBar.tsx              # Shift info, patient count
│   ├── RecentActions.tsx           # Minimized blocks
│   ├── BlockPicker.tsx             # Fallback grid
│   └── ClarificationDialog.tsx     # "Bedoelde je...?"
```

### 3.2 Hergebruik Analyse

**Direct herbruikbaar (copy):**
```typescript
// Volledig herbruikbaar
import { RichTextEditor } from '@/components/rich-text-editor'
import { SpeechRecorder } from '@/components/speech-recorder'
import { Timeline } from '@/components/ui/timeline'
import { Command } from '@/components/ui/command'  // voor zoeken

// Bestaande forms met minimale aanpassing
ReportComposer       → RapportageBlock (wrap + simplify)
BehandelplanView     → BehandelplanBlock (read-only + edit mode toggle)
AgendaCalendar       → AgendaBlock (date-filtered view)
```

**Moet gerefactored worden:**
```typescript
// Te gekoppeld aan page-specifieke logica
IntakeTabs          → Moet ontkoppeld van [intakeId] routing
VitalsBlock         → Alleen display, geen input form
PatientList         → Moet naar PatientCard + search results
```

**Nieuw te bouwen:**
```typescript
// Helemaal nieuw
CommandInput.tsx        // ~150 lines
BlockContainer.tsx      // ~100 lines
ZoekenBlock.tsx         // ~200 lines
MetingenBlock.tsx       // ~150 lines
DagnotitieBlock.tsx     // ~120 lines (simplified from ReportComposer)
ClarificationDialog.tsx // ~80 lines
```

### 3.3 State Management Implementatie

**Keuze: Zustand**

```typescript
// stores/command-center-store.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface CommandCenterState {
  // Block state
  activeBlock: BlockType | null
  blockData: Record<string, unknown>
  minimizedBlocks: MinimizedBlock[]

  // Context
  activePatient: Patient | null
  shiftInfo: ShiftInfo | null

  // Voice
  isListening: boolean
  transcript: string
  interimTranscript: string

  // Recent
  recentActions: Action[]

  // Actions
  openBlock: (type: BlockType, prefill?: Record<string, unknown>) => void
  closeBlock: () => void
  minimizeBlock: () => void
  setActivePatient: (patient: Patient | null) => void
  setTranscript: (text: string) => void
  addRecentAction: (action: Action) => void
}

export const useCommandCenter = create<CommandCenterState>()(
  devtools(
    persist(
      (set, get) => ({
        // ... implementation
      }),
      { name: 'command-center' }
    )
  )
)
```

### 3.4 Intent Handling Flow

```typescript
// hooks/use-intent.ts
export function useIntent() {
  const { openBlock, setActivePatient, activePatient } = useCommandCenter()

  const processInput = async (text: string) => {
    // 1. Quick local match
    const quickMatch = quickClassify(text)
    if (quickMatch.confidence > 0.9) {
      return handleIntent(quickMatch)
    }

    // 2. AI classification
    const result = await fetch('/api/intent/classify', {
      method: 'POST',
      body: JSON.stringify({
        text,
        context: { activePatient }
      })
    }).then(r => r.json())

    // 3. Handle result
    if (result.clarification_needed) {
      return { type: 'clarify', question: result.clarification_question }
    }

    if (result.entities.patient_name && !activePatient) {
      const patient = await resolvePatient(result.entities.patient_name)
      if (patient.length > 1) {
        return { type: 'select_patient', options: patient }
      }
      setActivePatient(patient[0])
    }

    openBlock(result.intent, result.entities)
    return { type: 'success', block: result.intent }
  }

  return { processInput }
}
```

### 3.5 Performance Optimalisatie

**Bundle splitting:**
```typescript
// Lazy load blokken
const RapportageBlock = dynamic(
  () => import('@/components/building-blocks/rapportage/RapportageBlock'),
  { loading: () => <BlockSkeleton /> }
)

const BehandelplanBlock = dynamic(
  () => import('@/components/building-blocks/behandelplan/BehandelplanBlock'),
  { loading: () => <BlockSkeleton /> }
)
```

**Prefetching:**
```typescript
// Prefetch meest gebruikte blokken bij mount
useEffect(() => {
  import('@/components/building-blocks/rapportage/RapportageBlock')
  import('@/components/building-blocks/dagnotitie/DagnotitieBlock')
}, [])
```

**Voice optimization:**
```typescript
// Reuse Deepgram connection
const deepgramRef = useRef<DeepgramConnection | null>(null)

// Start listening immediately on mic click (no API call delay)
// Token already fetched at mount
```

### 3.6 Testing Strategy

```typescript
// Kritieke test scenarios
describe('CommandCenter', () => {
  it('opens RapportageBlock for "notitie voor jan"')
  it('asks clarification for ambiguous input')
  it('pre-fills patient when mentioned by name')
  it('falls back to BlockPicker on unknown intent')
  it('minimizes block and shows in recent')
  it('restores minimized block on click')
})

describe('Intent Classification', () => {
  it('handles Dutch medical vocabulary')
  it('extracts patient name from natural speech')
  it('returns low confidence for gibberish')
})
```

### 3.7 Aanbeveling

**Go/No-Go:** ✅ GO

**Geschatte effort:**

| Component | Uren | Complexiteit |
|-----------|------|--------------|
| CommandCenter layout | 4h | Low |
| CommandInput + Voice | 6h | Medium |
| BlockContainer abstraction | 4h | Medium |
| RapportageBlock wrapper | 3h | Low |
| DagnotitieBlock (new) | 5h | Medium |
| ZoekenBlock (new) | 6h | Medium |
| Intent API route | 4h | Medium |
| Zustand store | 3h | Low |
| Animations/transitions | 4h | Low |
| **Totaal MVP** | **~40h** | - |

---

## 4. Product Owner Perspectief

### 4.1 Business Case Analyse

**Doelstelling:** Demo-ready voor Nedap gesprek (7 jan)

Dit is een **showcase project** met twee doelen:
1. Thought leadership positionering
2. Concrete gespreksstarter voor enterprise partnerships

**ROI Potentieel:**

| Metric | Traditioneel EPD | Ephemeral UI | Impact |
|--------|------------------|--------------|--------|
| Tijd per rapportage | 3-5 min | <1 min | 70% reductie |
| Klikken per actie | 8-15 | 1-3 | 80% reductie |
| Training tijd | 2-4 dagen | 1 uur | 90% reductie |
| Error rate (verkeerde scherm) | 15% | <5% | 70% reductie |

### 4.2 Scope Prioritering

**Must Have (Demo MVP):**
- [ ] Command Center met text input
- [ ] Voice input (Deepgram werkt al)
- [ ] 2 werkende blokken: Rapportage + Dagnotitie
- [ ] Intent classification (happy path)
- [ ] Pre-fill van patient naam
- [ ] Visuele fallback (blok picker)

**Should Have (Demo Enhanced):**
- [ ] Overdracht blok met AI samenvatting
- [ ] Zoeken blok
- [ ] Recent actions tracking
- [ ] Context bar (dienst info)
- [ ] Animaties en polish

**Could Have (Post-Demo):**
- [ ] Behandelplan blok
- [ ] Agenda blok
- [ ] Metingen blok
- [ ] Intake blok
- [ ] Multi-patient context switching

**Won't Have (v1):**
- Offline mode
- Mobile native app
- Multi-user realtime
- FHIR integratie
- Full ambient listening

### 4.3 Risico Assessment

| Risico | Waarschijnlijkheid | Impact | Mitigatie |
|--------|-------------------|--------|-----------|
| Demo niet klaar 7 jan | Medium | Hoog | Focus op 2 blokken, polish later |
| Intent accuracy <85% | Medium | Hoog | Fallback UI prominent aanwezig |
| Voice werkt niet live | Laag | Medium | Tekst input als backup |
| Nedap niet geïnteresseerd | Medium | Medium | Parallel outreach naar andere partijen |
| "Speeltje" perceptie | Medium | Medium | Focus op tijdsbesparing metrics |

### 4.4 Stakeholder Waarde

**Voor Zorgverleners:**
- Minder administratie, meer tijd voor zorg
- Geen menu-navigatie stress
- Voice input tijdens handeling

**Voor Zorgorganisaties:**
- Lagere training kosten
- Hogere EPD adoptie
- Minder documentatie-fouten

**Voor IT/Beheer:**
- Moderne tech stack (Next.js, Supabase)
- AI-first architectuur
- Schaalbaar en maintainable

### 4.5 Demo Scenario's

**Scenario 1: De Drukke Ochtend (2 min)**
```
Verpleegkundige start dienst → Command Center opent
"Mijn patiënten vandaag" → Overzicht met prioriteiten
"Notitie voor Jan de Vries: medicatie uitgereikt, geen bijzonderheden"
→ Dagnotitie pre-filled, 1-click save
```

**Scenario 2: Na een Gesprek (1 min)**
```
Behandelaar na sessie → Voice inspreken
"Ik heb net een gesprek gehad met mevrouw Jansen over haar angstklachten"
→ Rapportage blok opent, patient pre-filled
→ AI structureert de dictatie
→ Save
```

**Scenario 3: Overdracht (1 min)**
```
Dienst eindigt → "Overdracht"
→ AI genereert samenvatting van de dag
→ Aandachtspunten gemarkeerd
→ Klaar voor collega
```

### 4.6 Success Metrics

**Demo Success:**
- [ ] 3 scenario's foutloos uitvoeren
- [ ] <5 seconden van input tot blok open
- [ ] "Wow" reactie van stakeholders
- [ ] Concrete vervolgafspraak

**Product Success (post-launch):**
- Intent accuracy >85%
- Fallback usage <20%
- Tijd-tot-taak 50% lager dan traditioneel
- User satisfaction >4/5

### 4.7 Go-to-Market

**Fase 1: Internal Demo (Week 1-2)**
- Bouwen MVP
- Interne testing

**Fase 2: Stakeholder Demo (Week 3)**
- Nedap presentatie (7 jan)
- LinkedIn content (4 posts gepland)

**Fase 3: Pilot (Q1 2025)**
- 1 zorginstelling
- Real user feedback
- Iteratie op intent accuracy

**Fase 4: Scale (Q2 2025)**
- Meerdere instellingen
- Enterprise features
- Mogelijke partnership/overname gesprekken

### 4.8 Aanbeveling

**Go/No-Go:** ✅ GO

**Voorwaarden:**
1. Scope beperken tot 2-3 blokken voor demo
2. Fallback UI is verplicht (geen "het werkt alleen met AI")
3. Realistische demo verwachtingen (happy path)
4. LinkedIn content parallel voorbereiden

---

## 5. Gezamenlijke Conclusie

### Consensus: ✅ GO

Alle vier de perspectieven zijn positief, met de volgende gedeelde voorwaarden:

**Kritieke Succesfactoren:**
1. **Fallback first** - Bouw de visuele blok-picker voordat je intent bouwt
2. **Scope discipline** - 2 blokken voor demo, niet 8
3. **Intent accuracy** - Meet en optimaliseer continue
4. **User testing vroeg** - Niet wachten tot alles "af" is

**Gedeelde Risico's:**
- Intent misclassificatie (mitigatie: fallback UI)
- Demo deadline druk (mitigatie: scope beperken)
- "Speeltje" perceptie (mitigatie: focus op metrics)

**Next Steps:**
1. [ ] Command Center basis layout (Frontend)
2. [ ] Intent classification API (Lead Dev)
3. [ ] UX mockups voor microinteracties (UX)
4. [ ] Demo scenario scripts (PO)

---

## Appendix: Decision Log

| Beslissing | Optie Gekozen | Rationale |
|------------|---------------|-----------|
| State management | Zustand | Lightweight, geen provider nesting |
| Intent approach | Local + AI fallback | Snelheid + accuracy balans |
| Voice library | Deepgram (bestaand) | Al geïntegreerd, werkt goed |
| Blok architectuur | Wrapper pattern | Maximaal hergebruik bestaande code |
| Demo scope | 2-3 blokken | Realistische deadline |

---

*Document gegenereerd op basis van PRD analyse en codebase review.*
