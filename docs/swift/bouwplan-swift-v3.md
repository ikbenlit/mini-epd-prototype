# 🚀 Mission Control — Bouwplan Swift v3.0

💡 **Transformatie:** Van Command Center naar Medical Scribe Chatbot Interface

---

**Projectnaam:** Swift Medical Scribe v3.0
**Versie:** v3.0
**Datum:** 27-12-2024
**Auteur:** Colin Lit

---

## 1. Doel en context

🎯 **Doel:** Swift transformeren van een command-line style interface naar een conversational medical scribe chatbot met split-screen layout (chat links, artifacts rechts).

📘 **Context:**
De huidige Swift v2.1 werkt met een command-line paradigma waar gebruikers kort commando's typen ("notitie jan medicatie"). Dit werkt goed, maar voelt transactioneel aan. Gebruikers willen doorvragen, context behouden, en natuurlijker interacteren met het systeem.

**De transformatie:**
- **Van:** Command-line input → Centered blocks → Recent strip
- **Naar:** Chat conversation → Split-screen (40/60) → Artifacts rechts

**Waarom deze verandering:**
1. **Natuurlijkere interactie** — Voelt als praten met collega i.p.v. commando's typen
2. **Context behoud** — Conversatiegeschiedenis blijft zichtbaar
3. **Follow-up mogelijk** — Gebruiker kan doorvragen zonder opnieuw te beginnen
4. **Bekende UX** — Lijkt op ChatGPT Canvas / Claude Artifacts (bekend voor gebruikers)

**Referenties:**
- **FO v3.0:** `fo-swift-medical-scribe-v3.md` — Functioneel ontwerp medical scribe
- **Haalbaarheid:** `haalbaarheidsanalyse-v3.md` — Feasibility analysis (6-8 weken, haalbaar)
- **UX Analyse:** `v3-redesign-met-huidige-styling.md` — Wat blijft vs. wijzigt
- **UX v2.1:** `archive/swift-ux-v2.1.md` — Huidige UX/styling

---

## 2. Uitgangspunten

### 2.1 Technische Stack

**Frontend:**
- Next.js 14 (App Router) ✅ Bestaand
- React 18 met TypeScript ✅ Bestaand
- Tailwind CSS + shadcn/ui ✅ Bestaand
- Lucide Icons ✅ Bestaand
- Zustand (state management) ✅ Bestaand

**Backend & Database:**
- Supabase (PostgreSQL + Auth) ✅ Bestaand
- FHIR-inspired datamodel ✅ Bestaand
- Row Level Security (RLS) ✅ Bestaand

**AI/ML Services:**
- Anthropic Claude API (Sonnet 4.5) ✅ Bestaand
- Deepgram (speech-to-text) ✅ Bestaand
- Streaming API responses (SSE) 🆕 Nieuw patroon voor chat

**Hosting & Deploy:**
- Vercel (production deployment) ✅ Bestaand
- Environment variables via `.env.local` ✅ Bestaand

**Nieuwe Dependencies:**
- Geen nieuwe externe libraries nodig
- Hergebruik van bestaande `/api/docs/chat` streaming pattern

### 2.2 Projectkaders

**Tijd:**
- **Totaal:** 6-8 weken bouwtijd
- **Fase 1 (Foundation):** Week 1-2
- **Fase 2 (Chat API):** Week 3-4
- **Fase 3 (Artifacts & Polish):** Week 5-6
- **Fase 4 (Testing):** Week 7-8

**Team:**
- 1 developer (full-time)
- AI assistant (Claude Code) voor development support

**Scope:**
- **In scope:** Alle P1 intents (dagnotitie, zoeken, overdracht, patient context)
- **Out of scope:** P2/P3 intents blijven werken maar geen redesign
- **Feature flag:** v3.0 achter feature flag zodat v2.1 beschikbaar blijft

**Data:**
- Alle bestaande Supabase data blijft werken
- Geen database migraties nodig
- Alleen nieuwe API endpoints + frontend components

**Risicomanagement:**
- Incremental rollout via feature flag
- v2.1 blijft beschikbaar als fallback
- A/B testing mogelijk voor user feedback

### 2.3 Programmeer Uitgangspunten

**Code Quality Principles:**

- **DRY (Don't Repeat Yourself)**
  - Herbruikbare chat components (`ChatMessage`, `ChatBubble`)
  - Centrale config voor message types
  - Shared utilities voor streaming responses

- **KISS (Keep It Simple, Stupid)**
  - Geen overengineering van chat state
  - Eenvoudige Zustand store uitbreiding
  - Geen nieuwe frameworks/libraries indien niet nodig

- **SOC (Separation of Concerns)**
  - Chat UI gescheiden van artifact logic
  - Message rendering gescheiden van streaming logic
  - API calls in dedicated `/lib/swift/chat-api.ts`

- **YAGNI (You Aren't Gonna Need It)**
  - Bouw alleen conversation features die in FO staan
  - Geen "nice to have" features (bijv. message editing, reactions)
  - Start met max 3 artifacts, niet meer

**Development Practices:**

- **Code Organization**
  ```
  components/swift/
  ├── chat/                    # 🆕 Nieuwe chat components
  │   ├── chat-panel.tsx
  │   ├── chat-message.tsx
  │   ├── chat-input.tsx
  │   └── streaming-indicator.tsx
  ├── artifacts/               # 🆕 Nieuwe artifact wrapper
  │   ├── artifact-container.tsx
  │   └── artifact-tab.tsx
  ├── blocks/                  # ✅ Bestaand, blijft werken
  │   ├── dagnotitie-block.tsx
  │   ├── zoeken-block.tsx
  │   └── overdracht-block.tsx
  └── command-center/          # 🔄 Wijzigt naar split-screen
      ├── command-center.tsx
      ├── context-bar.tsx      # ✅ Blijft ongewijzigd
      └── offline-banner.tsx   # ✅ Blijft ongewijzigd
  ```

- **Error Handling**
  - Hergebruik bestaande `lib/swift/error-handler.ts`
  - Chat-specific error states (connection lost, stream interrupted)
  - User-friendly foutmeldingen in chat ("Er ging iets mis, probeer opnieuw")

- **Security**
  - API keys blijven server-side (Claude API key)
  - Chat messages niet persistent opgeslagen (alleen in session state)
  - RLS rules blijven gelden voor artifacts

- **Performance**
  - Virtual scrolling voor lange chat histories (>100 messages)
  - Debounce op typing indicator (300ms)
  - Lazy load artifacts (alleen renderen wanneer actief)
  - Streaming responses via SSE (Server-Sent Events)

- **Testing**
  - Manual smoke tests voor alle chat flows
  - Integration tests voor `/api/swift/chat` endpoint
  - Edge case testing (stream interruption, long messages, etc.)

**Voorbeeld implementatie:**
```typescript
// ✅ DRY - Herbruikbare message component
interface ChatMessageProps {
  type: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp?: Date;
}

export function ChatMessage({ type, content, timestamp }: ChatMessageProps) {
  const styles = MESSAGE_STYLES[type]; // Centrale config
  return (
    <div className={cn('message', styles.container)}>
      {/* ... */}
    </div>
  );
}

// ✅ SOC - API logic gescheiden
// In /lib/swift/chat-api.ts
export async function sendChatMessage(
  message: string,
  history: ChatMessage[]
): Promise<ReadableStream> {
  const response = await fetch('/api/swift/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
  return response.body!;
}

// ✅ KISS - Simpele state management
interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  addMessage: (msg: ChatMessage) => void;
}

const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  addMessage: (msg) => set((s) => ({
    messages: [...s.messages, msg]
  })),
}));
```

---

## 3. Epics & Stories Overzicht

🎯 **Doel:** De bouw opdelen in 6 logische epics met concrete deliverables.

**Epic Structuur:**

| Epic ID | Titel | Doel | Status | Stories | Story Points | Opmerkingen |
|---------|-------|------|--------|---------|--------------|-------------|
| E0 | Pre-work & Planning | Design tokens, component audit, system prompt | ✅ **Compleet** | 3/3 | 5 SP | Docs aangemaakt |
| E1 | Foundation - Split-screen | Layout naar 40/60 split | ✅ **Compleet** | 3/3 | 12 SP | E1.S1 geskipt (geen feature flag) |
| E2 | Chat Panel & Messages | Chat UI zonder AI | ✅ **Compleet** | 5/5 | 13 SP | Scrolling, input, shortcuts |
| E3 | Chat API & Medical Scribe | AI conversatie werkend | ✅ **Compleet** | 6/6 | 21 SP | Artifact opening werkend! |
| E4 | Artifact Area & Tabs | Meerdere artifacts mogelijk | ✅ **Compleet** | 3/4 | 10 SP | E4.S4 geskipt (placeholder in E4.S1) |
| E5 | AI-Filtering & Polish | Psychiater filtering, polish | ⏳ In Progress | 1/5 | 13 SP (5 SP compleet) | Week 6 |
| E6 | Testing & Refinement | QA, bugs, performance | ⏳ To Do | 0/4 | 8 SP | Week 7-8 |

**Totaal:** 31 stories, **82 Story Points** (~7 weken à 12 SP/week, 3 SP geannuleerd door E4.S4 skip)
**Voortgang:** ✅ 22/31 stories compleet, 3 geskipt (63 SP / 82 SP = **77%**)

**Belangrijk:**
- ⚠️ Voer niet in 1x het volledige plan uit. Bouw per epic en per story.
- ⚠️ Dependencies/migraties moeten eerst aan Colin worden gemeld.
- Feature flag vanaf E1: `FEATURE_FLAG_SWIFT_V3=true` in `.env.local`

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 — Pre-work & Planning ✅ **COMPLEET**

**Epic Doel:** Voorbereiding werk voordat development start. Design tokens verificatie, component audit, medical scribe system prompt.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E0.S1 | Design tokens audit | Alle kleuren/spacing/typography gedocumenteerd in v3 doc | ✅ **Compleet** | — | 1 |
| E0.S2 | Component inventory | Lijst van alle blocks die herbruikbaar zijn | ✅ **Compleet** | — | 2 |
| E0.S3 | Medical scribe system prompt | Eerste versie prompt voor `/api/swift/chat`, getest met Claude | ✅ **Compleet** | — | 2 |

**Technical Notes:**
- E0.S1: Check of alle tokens uit v2.1 nog kloppen voor v3.0 ✅
- E0.S2: Maak lijst van blocks die NIET wijzigen vs. die WEL wijzigen ✅
- E0.S3: Prompt moet Nederlands zijn, vriendelijk maar professioneel, intent detection ✅

**Deliverables:**
- ✅ `docs/swift/e0-design-tokens-and-components.md` — Design tokens audit + component inventory
- ✅ `docs/swift/e0-medical-scribe-system-prompt.md` — Medical scribe prompt v1.0

---

### Epic 1 — Foundation - Split-screen Layout ✅ **COMPLEET**

**Epic Doel:** CommandCenter omzetten naar split-screen layout (40% chat, 60% artifacts).

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| ~~E1.S1~~ | ~~Feature flag setup~~ | ~~`FEATURE_FLAG_SWIFT_V3` in `.env` + conditional rendering~~ | ❌ **GESKIPT** | — | ~~1~~ |
| E1.S2 | CommandCenter layout wijzigen | Split-screen grid (40/60), context bar blijft | ✅ **Compleet** | E0.S2 | 5 |
| E1.S3 | Placeholder componenten | ChatPanel (welcome msg), ArtifactArea (placeholder) | ✅ **Compleet** | E1.S2 | 2 |
| E1.S4 | Responsive breakpoints | Desktop/tablet/mobile toggle tussen chat/artifact | ✅ **Compleet** | E1.S3 | 5 |

**Technical Notes:**
```tsx
// E1.S2 - Layout structuur
<div className="flex flex-col h-screen">
  <ContextBar /> {/* Blijft ongewijzigd */}

  <div className="flex flex-1 overflow-hidden">
    {/* Chat Panel - 40% */}
    <div className="w-[40%] border-r">
      <ChatPanel /> {/* Placeholder in E1.S3 */}
    </div>

    {/* Artifact Area - 60% */}
    <div className="w-[60%]">
      <ArtifactArea /> {/* Placeholder in E1.S3 */}
    </div>
  </div>
</div>
```

**Responsive breakpoints (E1.S4):**
- Desktop (>1200px): 40/60 split zichtbaar
- Tablet (768-1200px): 45/55 split
- Mobile (<768px): Toggle tussen chat en artifact (full screen)

**Deliverables:**
- ✅ `components/swift/chat/chat-panel.tsx` — Chat placeholder met welcome message
- ✅ `components/swift/artifacts/artifact-area.tsx` — Artifact placeholder met voorbeelden
- ✅ `components/swift/command-center/command-center.tsx` — Gerefactored naar split-screen (40/60)
- ✅ Responsive breakpoints: `lg:w-[40%]` en `lg:w-[60%]` (desktop), `w-full` (mobile)
- ✅ Build succesvol zonder errors

**Note:** E1.S1 (Feature flag) geskipt — we werken op separate branch `swift` i.p.v. feature flag

---

### Epic 2 — Chat Panel & Messages ✅ **COMPLEET**

**Epic Doel:** Chat UI werkend krijgen zonder AI (gebruikers kunnen typen en zien messages verschijnen).

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E2.S1 | Store uitbreiding | `chatMessages`, `isStreaming` in swift-store.ts | ✅ **Compleet** | E1.S4 | 2 |
| E2.S2 | ChatMessage component | User/assistant/system/error message types met styling | ✅ **Compleet** | E2.S1 | 3 |
| E2.S3 | ChatPanel component | Scrollable message list, auto-scroll, scroll-lock | ✅ **Compleet** | E2.S2 | 5 |
| E2.S4 | ChatInput component | Tekst input onderaan chat (40% width), enter to send | ✅ **Compleet** | E2.S3 | 2 |
| E2.S5 | Keyboard shortcuts | ⌘K focus, Escape clear, Enter submit | ✅ **Compleet** | E2.S4 | 1 |

**Technical Notes:**

**E2.S1 - Store uitbreiding:**
```typescript
// stores/swift-store.ts
interface SwiftStore {
  // Bestaand
  activePatient: Patient | null;
  activeBlock: BlockType | null;
  shift: ShiftType;

  // Nieuw voor chat
  chatMessages: ChatMessage[];
  isStreaming: boolean;
  pendingAction: Action | null;

  // Actions
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  setStreaming: (streaming: boolean) => void;
}
```

**E2.S2 - Message styling:**
```tsx
// components/swift/chat/chat-message.tsx
const MESSAGE_STYLES = {
  user: {
    container: 'self-end bg-amber-50 border-amber-200',
    borderRadius: 'rounded-2xl rounded-tr-sm',
  },
  assistant: {
    container: 'self-start bg-slate-100 border-slate-200',
    borderRadius: 'rounded-2xl rounded-tl-sm',
  },
  system: {
    container: 'self-center bg-transparent text-slate-500 text-sm',
    borderRadius: '',
  },
  error: {
    container: 'self-start bg-red-50 border-red-200',
    borderRadius: 'rounded-2xl',
  },
};
```

**E2.S3 - Auto-scroll gedrag:**
- Auto-scroll naar laatste message bij nieuwe message
- Scroll-lock wanneer user omhoog scrollt (detecteer scroll position)
- "↓ Scroll to bottom" knop verschijnt bij nieuwe messages tijdens scroll-lock

**E2.S4 - Chat input:**
- Onderaan chat panel (40% width)
- Multi-line support (Shift+Enter voor new line)
- Enter submit (tenzij Shift pressed)
- Placeholder: "Typ of spreek..."

**E2.S5 - Keyboard shortcuts:**
- ⌘K / Ctrl+K: Focus chat input (global)
- Escape: Clear input (local)
- Enter: Submit message
- Shift+Enter: New line

**Deliverables:**
- ✅ `stores/swift-store.ts` (+87 regels) — Chat state: chatMessages[], isStreaming, pendingAction, actions
- ✅ `components/swift/chat/chat-message.tsx` (76 regels) — Message component met 4 types (user/assistant/system/error)
- ✅ `components/swift/chat/chat-panel.tsx` (148 regels) — Scrollable message list, auto-scroll, scroll-lock, keyboard shortcuts
- ✅ `components/swift/chat/chat-input.tsx` (184 regels) — Multi-line input, Enter submit, Shift+Enter new line, forwardRef
- ✅ Keyboard shortcuts: ⌘K focus, Escape clear, Enter submit, Shift+Enter new line
- ✅ Auto-scroll met scroll-lock detection (100px threshold)
- ✅ "Scroll naar beneden" button bij scroll-lock
- ✅ Cross-platform support (macOS + Windows/Linux)
- ✅ Build succesvol zonder errors

**Git Commits:**
- `e3ff72c` — E2.S1 & E2.S2 (Store uitbreiding + ChatMessage component)
- `b5e245e` — E2.S3 (ChatPanel scrolling functionaliteit)
- `8f6f24f` — E2.S4 (ChatInput component met keyboard shortcuts)
- `d2931a3` — E2.S5 (Global keyboard shortcuts ⌘K focus)

---

### Epic 3 — Chat API & Medical Scribe ⏳ **IN PROGRESS**

**Epic Doel:** AI conversatie werkend krijgen met intent detection en artifact opening.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E3.S1 | Chat API endpoint skeleton | `/api/swift/chat` route met SSE setup | ✅ **Compleet** | E2.S5 | 3 |
| E3.S2 | Streaming response logic | Claude API streaming werkt, chunks naar frontend | ✅ **Compleet** | E3.S1 | 5 |
| E3.S3 | Medical scribe system prompt | Prompt met role, intents, examples, Nederlands | ✅ **Compleet** | E3.S2 | 3 |
| E3.S4 | Intent detection in response | AI genereert action objects (intent + entities) | ✅ **Compleet** | E3.S3 | 5 |
| ~~E3.S5~~ | ~~Frontend streaming handling~~ | ~~useChatStream hook, message chunks renderen~~ | ❌ **GESKIPT** | ~~E3.S4~~ | ~~3~~ |
| E3.S6 | Artifact opening from chat | Action object opent juiste block met prefill | ✅ **Compleet** | E3.S4 | 2 |

**Technical Notes:**

**E3.S1 - API Route:**
```typescript
// app/api/swift/chat/route.ts
export async function POST(req: Request) {
  const { message, messages, context } = await req.json();

  // Streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Claude API streaming logic
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

**E3.S3 - System Prompt (samenvatting):**
```
Je bent een medische assistent (medical scribe) voor Swift, een Nederlands GGZ EPD.

Je rol:
- Help zorgmedewerkers met documentatie en administratie
- Voer natuurlijke gesprekken in het Nederlands
- Herken intents en voer acties uit wanneer nodig
- Stel verduidelijkingsvragen bij onduidelijkheid
- Wees vriendelijk maar professioneel

Intents die je herkent:
- dagnotitie: notitie maken voor patiënt
- zoeken: patiënt zoeken
- rapportage: behandelrapportage schrijven
- overdracht: dienst overdracht maken

Wanneer je een intent herkent, voeg een JSON action object toe:
{
  "type": "action",
  "intent": "dagnotitie",
  "entities": { "patient": "Jan de Vries", "category": "medicatie" },
  "confidence": 0.95
}

Context:
- Actieve patiënt: {{activePatient}}
- Dienst: {{shift}}
- Recente acties: {{recentActions}}
```

**E3.S4 - Action object format:**
```typescript
interface Action {
  type: 'action';
  intent: IntentType;
  entities: {
    patient?: string;
    patientId?: string;
    category?: VerpleegkundigCategory;
    content?: string;
  };
  confidence: number;
  artifact?: {
    type: BlockType;
    prefill: BlockPrefillData;
  };
}
```

**E3.S5 - Frontend streaming:**
```typescript
// lib/swift/use-chat-stream.ts
export function useChatStream() {
  const addMessage = useSwiftStore((s) => s.addChatMessage);
  const setStreaming = useSwiftStore((s) => s.setStreaming);

  const sendMessage = async (message: string) => {
    setStreaming(true);
    const response = await fetch('/api/swift/chat', {
      method: 'POST',
      body: JSON.stringify({ message, messages: /* ... */ }),
    });

    const reader = response.body!.getReader();
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      accumulatedText += chunk;

      // Update message in UI
      addMessage({ type: 'assistant', content: accumulatedText });
    }

    setStreaming(false);
  };

  return { sendMessage };
}
```

**E3.S6 - Artifact opening:**
- Parse action object uit AI response
- Open juiste block via `openBlock(artifact.type, artifact.prefill)`
- Block verschijnt rechts in artifact area

**Deliverables (E3.S1 & E3.S2 compleet):**
- ✅ `app/api/swift/chat/route.ts` (307 regels) — SSE API endpoint met Claude streaming
- ✅ `lib/swift/chat-api.ts` (109 regels) — Client helper voor streaming
- ✅ `components/swift/chat/chat-panel.tsx` (updated) — Streaming integration
- ✅ Claude API integration (Sonnet 4, 2048 tokens, temp 0.7)
- ✅ Real-time streaming via Server-Sent Events
- ✅ Event parsing (content_block_delta, message_stop, error)
- ✅ Simple system prompt met context (patiënt + dienst)
- ✅ Rate limiting (20 req/min per user)
- ✅ Authentication + error handling
- ✅ Conversation history (max 20 messages)

**Deliverables (E3.S3 compleet):**
- ✅ `buildMedicalScribePrompt()` functie (243 regels) — Volledige medical scribe prompt v1.0
- ✅ Intent detection instructies: dagnotitie, zoeken, overdracht, rapportage
- ✅ P1 & P2 intents met triggers en entities
- ✅ Confidence thresholds (>0.9, 0.7-0.9, 0.5-0.7, <0.5)
- ✅ JSON action object format met examples
- ✅ Context injection (activePatient, shift)
- ✅ Verduidelijkingsvragen en error handling
- ✅ Nederlands tone of voice (vriendelijk, professioneel, to-the-point)
- ✅ 4 voorbeelden: dagnotitie, zoeken, verduidelijking, onduidelijke intent
- ✅ Build succesvol zonder type errors

**Deliverables (E3.S4 compleet):**
- ✅ `lib/swift/action-parser.ts` (149 regels) — JSON action parser met Zod validatie
- ✅ `parseActionFromResponse()` — Extract JSON from ```json code blocks
- ✅ `extractJsonBlock()` — Markdown code block regex matching
- ✅ `removeJsonBlocks()` — Clean text content zonder JSON
- ✅ `shouldOpenArtifact()` — Confidence threshold check (≥0.7)
- ✅ `getConfidenceLabel()` — User-friendly labels (Zeer zeker, Redelijk zeker, etc.)
- ✅ `validateArtifactType()` — Intent/artifact type matching validation
- ✅ ChatPanel: Action parsing in onDone callback
- ✅ ChatPanel: setPendingAction voor artifact opening (E3.S6)
- ✅ ChatMessage: Action badge met intent + confidence indicator
- ✅ Store: updateLastMessage met optional action parameter
- ✅ Action schema validation: intent, entities, confidence, artifact
- ✅ Visual feedback: Sparkles icon, CheckCircle voor high confidence
- ✅ Console logging voor debugging action detection
- ✅ Build succesvol zonder type errors

**Git Commits:**
- `a51acf6` — E3.S1 & E3.S2 (Chat API + Claude streaming)
- `8efac84` — E3.S3 (Medical scribe system prompt v1.0)
- (to be committed) — E3.S4 (Intent detection in response)

**Note E3.S5 - GESKIPT:**
E3.S5 (useChatStream hook) is geskipt omdat:
- Streaming logica al werkend geïmplementeerd in ChatPanel (E3.S2)
- Inline implementatie is voldoende voor huidige use case
- Geen andere components gebruiken streaming (YAGNI principe)
- Refactor naar hook kan later indien nodig
- Dependencies: E3.S6 nu afhankelijk van E3.S4 i.p.v. E3.S5

**Deliverables (E3.S6 compleet):**
- ✅ `components/swift/artifacts/artifact-area.tsx` (updated) — Renders active blocks
- ✅ ArtifactArea: DagnotatieBlock, ZoekenBlock, OverdrachtBlock rendering
- ✅ ArtifactArea: Placeholder state wanneer geen block actief
- ✅ CommandCenter: useEffect voor pendingAction handling
- ✅ CommandCenter: openBlock() aanroep met artifact type + prefill
- ✅ CommandCenter: setPendingAction(null) na verwerking
- ✅ Console logging: "[CommandCenter] Processing pending action"
- ✅ Console logging: "[CommandCenter] Opening artifact: [type] with prefill"
- ✅ Block opening flow: Chat → Action → PendingAction → Block opens
- ✅ Build succesvol zonder errors

**Git Commits:**
- `a51acf6` — E3.S1 & E3.S2 (Chat API + Claude streaming)
- `8efac84` — E3.S3 (Medical scribe system prompt v1.0)
- `9b85448` — E3.S4 (Intent detection in response)
- `5b10176` — E3.S5 skip documentatie
- (to be committed) — E3.S6 (Artifact opening from chat)

**🎉 EPIC 3 COMPLEET!** Alle stories (5 compleet, 1 geskipt) afgerond. Medical scribe chat werkt end-to-end!

---

### Epic 4 — Artifact Area & Tabs ✅ **COMPLEET**

**Epic Doel:** Meerdere artifacts tegelijk mogelijk met tabs, slide-in animaties.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E4.S1 | ArtifactContainer component | Wrapper met tabs bovenaan, max 3 artifacts | ✅ **Compleet** | E3.S6 | 5 |
| E4.S2 | Artifact lifecycle management | Open/close/switch tussen artifacts in store | ✅ **Compleet** | E4.S1 | 3 |
| E4.S3 | Slide-in animatie | Artifact slide-in van rechts (200ms ease-out) | ✅ **Compleet** | E4.S2 | 2 |
| ~~E4.S4~~ | ~~Placeholder state~~ | ~~"Artifacts verschijnen hier" met voorbeelden~~ | ❌ **GESKIPT** | ~~E4.S3~~ | ~~3~~ |

**Technical Notes:**

**E4.S1 - ArtifactContainer:**
```tsx
// components/swift/artifacts/artifact-container.tsx
interface Artifact {
  id: string;
  type: BlockType;
  prefill: BlockPrefillData;
  title: string;
}

export function ArtifactContainer() {
  const { openArtifacts, activeArtifactId } = useSwiftStore();

  if (openArtifacts.length === 0) {
    return <ArtifactPlaceholder />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tabs - alleen tonen bij >1 artifact */}
      {openArtifacts.length > 1 && (
        <div className="flex border-b">
          {openArtifacts.map((artifact) => (
            <ArtifactTab key={artifact.id} artifact={artifact} />
          ))}
        </div>
      )}

      {/* Active artifact */}
      <div className="flex-1 overflow-auto">
        {renderArtifact(activeArtifact)}
      </div>
    </div>
  );
}
```

**E4.S2 - Store uitbreiding:**
```typescript
interface SwiftStore {
  // ... bestaand

  // Artifact state
  openArtifacts: Artifact[];  // Max 3
  activeArtifactId: string | null;

  // Actions
  openArtifact: (artifact: Artifact) => void;
  closeArtifact: (id: string) => void;
  switchArtifact: (id: string) => void;
}

// Logic: max 3 artifacts, oudste wordt gesloten bij 4e
const openArtifact = (artifact: Artifact) => {
  set((state) => {
    let artifacts = [...state.openArtifacts];
    if (artifacts.length >= 3) {
      artifacts = artifacts.slice(1); // Remove oldest
    }
    return {
      openArtifacts: [...artifacts, artifact],
      activeArtifactId: artifact.id,
    };
  });
};
```

**E4.S3 - Animatie:**
```css
/* globals.css */
@keyframes artifact-enter {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.artifact-enter {
  animation: artifact-enter 200ms ease-out;
}
```

**E4.S4 - Placeholder:**
```tsx
function ArtifactPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500">
      <div className="text-4xl mb-4">💬</div>
      <h3 className="text-lg font-medium mb-2">Artifacts verschijnen hier</h3>
      <p className="text-sm mb-4">Vraag me iets, bijvoorbeeld:</p>
      <ul className="text-sm space-y-1">
        <li>• "Notitie voor Jan: medicatie gegeven"</li>
        <li>• "Zoek Marie van den Berg"</li>
        <li>• "Maak overdracht voor deze dienst"</li>
      </ul>
    </div>
  );
}
```

**Deliverables (E4.S1 compleet):**
- ✅ `stores/swift-store.ts` — Artifact interface gedefineerd (id, type, prefill, title, createdAt)
- ✅ `components/swift/artifacts/artifact-tab.tsx` (60 regels) — Tab component met close button
- ✅ `components/swift/artifacts/artifact-container.tsx` (127 regels) — Container met tabs + rendering
- ✅ ArtifactTab: Active state styling, hover effects, close button
- ✅ ArtifactTab: Title truncation, tooltip, min/max width
- ✅ ArtifactContainer: Tabs alleen bij >1 artifact
- ✅ ArtifactContainer: renderArtifactBlock() voor alle block types
- ✅ ArtifactContainer: getArtifactTitle() helper functie
- ✅ ArtifactContainer: Placeholder state wanneer geen artifacts
- ✅ Conditional rendering: DagnotatieBlock, ZoekenBlock, OverdrachtBlock, FallbackPicker
- ✅ Build succesvol zonder errors

**Git Commits:**
- (to be committed) — E4.S1 (ArtifactContainer component)

**Deliverables (E4.S2 compleet):**
- ✅ `stores/swift-store.ts` — openArtifacts[], activeArtifactId state
- ✅ Store actions: openArtifact(), closeArtifact(), switchArtifact(), closeAllArtifacts()
- ✅ openArtifact: Auto-generate ID + timestamp, max 3 logic (remove oldest)
- ✅ closeArtifact: Filter out artifact, auto-switch to last remaining
- ✅ switchArtifact: Verify exists, set activeArtifactId
- ✅ closeAllArtifacts: Clear all artifacts + active ID
- ✅ Console logging: "[Store] Opening artifact:", "[Store] Closing artifact:", etc.
- ✅ ArtifactArea: Refactored to use ArtifactContainer
- ✅ ArtifactArea: Pass store actions (switchArtifact, closeArtifact)
- ✅ CommandCenter: openArtifact() i.p.v. openBlock()
- ✅ CommandCenter: getArtifactTitle() voor artifact titles
- ✅ CommandCenter: Escape key → closeAllArtifacts()
- ✅ Integration: Chat → Action → openArtifact → Tabs + Container
- ✅ Build succesvol zonder errors

**Git Commits:**
- `855744c` — E4.S1 (ArtifactContainer component)
- `f6c422b` — E4.S2 (Artifact lifecycle management)

**Deliverables (E4.S3 compleet):**
- ✅ `app/globals.css` — artifact-enter keyframes + animation class
- ✅ Keyframes: translateX(100%) → translateX(0) met opacity fade-in
- ✅ Animation: 200ms ease-out (conform bouwplan)
- ✅ Reduced motion support: animation: none voor prefers-reduced-motion
- ✅ ArtifactContainer: artifact-enter class op content wrapper
- ✅ Key prop op wrapper div (activeArtifact.id) → re-triggers animatie bij switch
- ✅ Smooth slide-in van rechts bij artifact open/switch
- ✅ Build succesvol zonder errors

**Git Commits:**
- (to be committed) — E4.S3 (Slide-in animatie)

**Note E4.S4 - GESKIPT:**
E4.S4 (Placeholder state) is geskipt omdat:
- Placeholder al volledig geïmplementeerd in E4.S1 (lines 79-92 artifact-container.tsx)
- Bevat emoji (📋), titel, en voorbeelden zoals gespecificeerd in bouwplan
- Geen extra werk nodig, acceptatiecriteria al behaald
- Story Points niet meegeteld in totaal (3 SP geannuleerd)

**🎉 EPIC 4 COMPLEET!** Alle stories (3 compleet, 1 geskipt) afgerond. Artifact systeem volledig functioneel met tabs, lifecycle management, en smooth animaties!

**Epic 4 Samenvatting:**
- **Status:** ✅ Compleet (3/4 stories, 10 SP)
- **Duur:** Stories E4.S1-E4.S3
- **Geskipt:** E4.S4 (placeholder al in E4.S1)
- **Impact:** Artifact systeem met tabs, max 3 concurrent, smooth animaties

**Belangrijkste Features:**
1. **ArtifactContainer (E4.S1)** - Tab interface, max 3 artifacts, placeholder state
2. **Lifecycle Management (E4.S2)** - Open/close/switch artifacts, auto-cleanup bij 4e
3. **Slide-in Animaties (E4.S3)** - 200ms ease-out, reduced motion support

**Files Gewijzigd:**
- `components/swift/artifacts/artifact-container.tsx` - Container met tabs
- `components/swift/artifacts/artifact-tab.tsx` - Tab component met close button
- `components/swift/artifacts/artifact-area.tsx` - Wrapper component
- `stores/swift-store.ts` - Artifact state management
- `app/globals.css` - artifact-enter keyframes

**Git Commits:**
- `855744c` - E4.S1 (ArtifactContainer component)
- `f6c422b` - E4.S2 (Artifact lifecycle management)
- `a10a4c3` - E4.S3 (Slide-in animaties) + Epic 4 compleet

**Voortgang:** 58 SP / 82 SP (71%) - Ready voor Epic 5!

---

### Epic 5 — AI-Filtering & Polish

**Epic Doel:** AI-filtering voor psychiater overdracht, linked evidence, final polish.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E5.S1 | AI-filtering psychiater | `/api/overdracht/generate` filtert op behandelrelevantie | ✅ | E4.S4 | 5 |
| E5.S2 | Linked evidence UI | Bronnotitie links in OverdrachtBlock, hover preview | ⏳ | E5.S1 | 3 |
| E5.S3 | Voice input integratie | Bestaande Deepgram blijft werken in chat input | ⏳ | E2.S4 | 2 |
| E5.S4 | Error states & offline | Chat error messages, offline banner margin fix | ⏳ | E3.S2 | 2 |
| E5.S5 | Polish & animations | Smooth transitions, loading states, toast confirmations | ⏳ | E5.S4 | 1 |

**Technical Notes:**

**E5.S1 - AI-filtering psychiater (Swift OverdrachtBlock):**

**Context:**
- OverdrachtBlock is een Swift artifact (geopend via chat)
- Toont patient lijst met AI samenvattingen
- Gebruikt bestaande `/api/overdracht/generate` endpoint
- Verpleegkundigen hebben items gemarkeerd met `include_in_handover = true`

**Implementatie - Role Toggle in OverdrachtBlock:**
```tsx
// components/swift/blocks/overdracht-block.tsx

export function OverdrachtBlock({ prefill }: OverdrachtBlockProps) {
  const [period, setPeriod] = useState<PeriodValue>('1d');
  const [filterRole, setFilterRole] = useState<'verpleegkundige' | 'psychiater'>('verpleegkundige'); // 🆕

  // Update generateSummary to include filterRole
  const generateSummary = useCallback(async (patientId: string) => {
    const response = await retryFetch(
      () => safeFetch(
        '/api/overdracht/generate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId,
            period,
            filterForRole: filterRole // 🆕 Add role parameter
          }),
        },
        { operation: 'Overdracht genereren' }
      ),
      3,
      1000
    );
    // ...
  }, [period, filterRole]); // 🆕 Add filterRole dependency

  return (
    <BlockContainer title={config.title} size={config.size}>
      <div className="space-y-6">
        {/* 🆕 Role Selector - NIEUW */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Voor wie is deze overdracht?</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFilterRole('verpleegkundige')}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                filterRole === 'verpleegkundige'
                  ? 'bg-slate-900 text-white border-2 border-slate-700'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              )}
            >
              Verpleegkundige
            </button>
            <button
              type="button"
              onClick={() => setFilterRole('psychiater')}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                filterRole === 'psychiater'
                  ? 'bg-violet-600 text-white border-2 border-violet-700'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              )}
            >
              Psychiater
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {filterRole === 'psychiater'
              ? 'Alleen behandelrelevante informatie (medicatie, risico\'s, gedrag)'
              : 'Volledige overdracht voor collega verpleegkundige'
            }
          </p>
        </div>

        {/* Period Selector - blijft hetzelfde */}
        {/* ... */}
      </div>
    </BlockContainer>
  );
}
```

**API Schema Update:**
```typescript
// lib/types/overdracht.ts
export const GenerateOverdrachtSchema = z.object({
  patientId: z.string().uuid('Patient ID moet een geldige UUID zijn'),
  period: z.enum(['1d', '3d', '7d', '14d']).optional().default('1d'),
  filterForRole: z.enum(['psychiater', 'verpleegkundige']).optional().default('verpleegkundige'), // 🆕
});

export type GenerateOverdrachtInput = z.infer<typeof GenerateOverdrachtSchema>;
```

**API Route Update:**
```typescript
// app/api/overdracht/generate/route.ts

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = GenerateOverdrachtSchema.safeParse(body);

  const { patientId, period, filterForRole } = result.data; // 🆕 Extract filterForRole

  // Load context (data loading blijft HETZELFDE - altijd include_in_handover=true)
  const context = await loadOverdrachtContext(supabase, patientId, period);

  // Call Claude API with role-specific prompt
  const aiResult = await callClaudeAPI(context, filterForRole); // 🆕 Pass role

  // ...
}

// 🆕 Update callClaudeAPI signature
async function callClaudeAPI(
  context: OverdrachtContext,
  role: 'psychiater' | 'verpleegkundige' = 'verpleegkundige' // 🆕 Add parameter
): Promise<{
  samenvatting: string;
  aandachtspunten: Aandachtspunt[];
  actiepunten: string[];
}> {
  const systemPrompt = buildSystemPrompt(role); // 🆕 Role-specific prompt
  const userPrompt = buildOverdrachtUserPrompt(context); // Blijft hetzelfde

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0.3,
      system: systemPrompt, // 🆕 Role-specific
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  // ... rest blijft hetzelfde
}
```

**AI Prompt - Role-specific Filtering:**
```typescript
// lib/ai/overdracht-prompt.ts

// 🆕 New function for role-specific prompts
export function buildSystemPrompt(role: 'psychiater' | 'verpleegkundige'): string {
  const basePrompt = OVERDRACHT_SYSTEM_PROMPT; // Bestaande prompt voor verpleegkundige

  if (role === 'psychiater') {
    return `${basePrompt}

## PSYCHIATER FILTERING
Je maakt overdracht voor een PSYCHIATER. Filter STRIKT op behandelrelevantie.

De verpleegkundige heeft al items geselecteerd (include_in_handover=true), maar jij moet VERDER FILTEREN.

✅ WEL RELEVANT (include in samenvatting):
- Medicatie-issues: weigering, bijwerkingen, dosisaanpassingen, therapietrouw
- Stemming/gedrag: veranderingen van baseline, afwijkend gedrag, agitatie
- Risico-signalen: suïcidale uitingen, automutilatie, agressie
- Psychotische symptomen: wanen, hallucinaties, desorganisatie, paranoia
- Crisis/dwang: separatie, fixatie, dwangmedicatie, vrijheidsbeperkende maatregelen
- Afwijkende vitals: HH (kritiek hoog), LL (kritiek laag) met behandelimpact

❌ FILTER UIT (niet in samenvatting):
- Routine medicatie: "medicatie volgens schema", "zonder problemen", "ingenomen conform afspraak"
- ADL activiteiten: douchen, aankleden, eten, drinken (tenzij significant afwijkend/weigering)
- Sociale activiteiten: "deelgenomen aan groepstherapie", "gesprek gehad", "koffie gedronken"
- Standaard observaties: "rustige dag", "geen bijzonderheden", "normaal functioneren"
- Routine vitals: bloeddruk/pols binnen normaalwaarden (N interpretatie)
- Dagstructuur: "dagprogramma gevolgd", "aanwezig bij activiteit"

VUISTREGEL: Include ALLEEN als een psychiater op basis van deze info een BEHANDELBESLISSING kan nemen.

Beperkingen:
- Maximum 3 aandachtspunten (ALLEEN behandelrelevant, geen routine items)
- Maximum 2 actiepunten (ALLEEN actionable voor psychiater)
- Bij twijfel of iets relevant is → FILTER UIT

Voorbeelden:
✅ INCLUDE: "Jan weigerde haloperidol, zegt dat medicatie hem controleert" → Medicatie-compliance issue
✅ INCLUDE: "Marie uitte suïcidale gedachten tijdens gesprek" → Risicosignaal, urgent
✅ INCLUDE: "Piet verbaal en fysiek agressief, separatie 30 min" → Crisis, gedragsverandering
❌ FILTER: "Jan heeft goed gegeten, ontbijt en lunch zonder problemen" → Routine ADL
❌ FILTER: "Marie deelgenomen aan groepstherapie" → Sociale activiteit, geen issues
❌ FILTER: "Piet heeft medicatie ingenomen volgens schema" → Routine medicatie

Geef je antwoord als PURE JSON, zonder markdown code blocks.`;
  }

  // Verpleegkundige gebruikt bestaande prompt (geen filtering)
  return basePrompt;
}

// Bestaande OVERDRACHT_SYSTEM_PROMPT blijft voor verpleegkundige view
export const OVERDRACHT_SYSTEM_PROMPT = `Je bent een ervaren verpleegkundige die overdrachten maakt in een GGZ-instelling.
...`; // Blijft hetzelfde
```

**Filtering Logic:**
```
┌─────────────────────────────────────────────────────────────┐
│                    Report Filtering Flow                     │
└─────────────────────────────────────────────────────────────┘

Stap 1 (Server - ALTIJD):
  ├─ Filter: include_in_handover = true
  └─ Result: Alleen aangevinkte items (bijv. 8 reports)

Stap 2 (AI - Role-afhankelijk):
  ├─ Verpleegkundige: Geen extra filtering (toon alle 8 reports)
  └─ Psychiater: Filter op behandelrelevantie (bijv. 3 relevante reports)

Output:
  ├─ Verpleegkundige: 5 aandachtspunten, 3 actiepunten (volledige context)
  └─ Psychiater: 2-3 aandachtspunten, 1-2 actiepunten (behandelrelevant)
```

**Deliverables (E5.S1 - COMPLEET):**
- ✅ `lib/types/overdracht.ts` (+1 regel) — GenerateOverdrachtSchema met filterForRole parameter
- ✅ `lib/ai/overdracht-prompt.ts` (+52 regels) — buildSystemPrompt(role) functie met psychiater filtering regels
- ✅ `app/api/overdracht/generate/route.ts` (+8/-8 regels) — callClaudeAPI signature met role parameter
- ✅ `components/swift/blocks/overdracht-block.tsx` (+43 regels) — Role toggle UI (Verpleegkundige/Psychiater)
- ✅ API call updated met filterForRole in request body (line 143)
- ✅ Psychiater prompt: max 3 aandachtspunten, 2 actiepunten, strict filtering op behandelrelevantie
- ✅ Verpleegkundige prompt: blijft hetzelfde (geen extra filtering, base prompt)
- ✅ UI: Role selector (grid 2 cols) met beschrijving per rol ("Alle gemarkeerde items" vs "Behandelrelevante items")
- ✅ Build succesvol zonder errors (pnpm build)
- ✅ filterRole state + useCallback dependency update in generateSummary

**Acceptatiecriteria:**
1. ✅ Role toggle zichtbaar in OverdrachtBlock ("Doelgroep" selector met 2 knoppen)
2. ✅ Default role = "verpleegkundige" (backwards compatible)
3. ✅ Psychiater view filtert op behandelrelevantie (medicatie-issues, gedrag, risico, crisis)
4. ✅ Psychiater view filtert UIT: routine medicatie, ADL, sociale activiteiten, dagstructuur
5. ✅ Verpleegkundige view blijft werken zoals voorheen (alle aangevinkte items, max 5 aandachtspunten)
6. ✅ AI prompt duidelijk onderscheid tussen WEL/NIET relevant voor psychiater (✅/❌ voorbeelden in prompt)
7. ✅ Build succesvol, geen type errors

**Git Commits:**
- `c6616d8` — E5.S1 (AI-filtering psychiater voor overdracht, 104 insertions, 8 deletions)

---

**E5.S2 - Linked evidence:**
```tsx
// components/swift/shared/linked-evidence.tsx
interface LinkedEvidenceProps {
  sourceNotes: Report[];
  highlightedText: string;
}

export function LinkedEvidence({ sourceNotes, highlightedText }: LinkedEvidenceProps) {
  return (
    <Popover>
      <PopoverTrigger className="underline decoration-dotted cursor-pointer">
        {highlightedText}
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          {sourceNotes.map((note) => (
            <div key={note.id} className="text-sm">
              <div className="font-medium">{note.author} - {note.timestamp}</div>
              <div className="text-slate-600">{note.content}</div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**E5.S3 - Voice input:**
- Bestaande `use-swift-voice.ts` hook blijft werken
- Integreren in ChatInput component
- Mic icon rechts van input field
- Live transcript verschijnt in input tijdens recording

**E5.S4 - Error states:**
```tsx
// Error message types in chat
const ERROR_MESSAGES = {
  network: "Er ging iets mis met de verbinding. Probeer het opnieuw.",
  stream_interrupted: "De verbinding werd onderbroken. Probeer je bericht opnieuw te versturen.",
  rate_limit: "Even geduld, er zijn te veel aanvragen. Wacht 30 seconden.",
  unknown: "Er is een fout opgetreden. Probeer het later opnieuw.",
};
```

**Deliverable:** AI-filtering werkt, linked evidence klikbaar, voice input geïntegreerd

---

### Epic 6 — Testing & Refinement

**Epic Doel:** Volledige QA, bug fixes, performance tuning, documentatie.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E6.S1 | Manual smoke tests | Alle P1 flows werken zonder crashes (checklist) | ⏳ | E5.S5 | 3 |
| E6.S2 | Performance optimalisatie | Chat scroll performance, virtual scrolling >100 msgs | ⏳ | E6.S1 | 3 |
| E6.S3 | Bug fixes | Alle gemelde bugs opgelost, edge cases getest | ⏳ | E6.S2 | 1 |
| E6.S4 | Documentatie update | README, CLAUDE.md, migration guide | ⏳ | E6.S3 | 1 |

**Technical Notes:**

**E6.S1 - Test checklist:**
```markdown
### P1 Flow Tests

**Dagnotitie via conversatie:**
- [ ] User typt "Ik heb medicatie gegeven aan Jan"
- [ ] AI herkent intent (dagnotitie) en patient (Jan)
- [ ] DagnotatieBlock opent met prefill
- [ ] User kan opslaan → Toast confirmation
- [ ] Chat toont "✓ Notitie opgeslagen"

**Patiënt zoeken:**
- [ ] User typt "Zoek Marie van den Berg"
- [ ] ZoekenBlock opent rechts
- [ ] Patient search werkt
- [ ] Selecteren patient → PatientContextCard opent

**Overdracht maken:**
- [ ] User typt "Maak overdracht"
- [ ] OverdrachtBlock opent
- [ ] AI genereert samenvattingen
- [ ] Psychiater ziet alleen behandelrelevante info
- [ ] Linked evidence klikbaar

**Follow-up conversatie:**
- [ ] User typt "Voeg toe: goed geslapen"
- [ ] AI begrijpt context (laatste artifact = dagnotitie)
- [ ] Tekst wordt toegevoegd aan artifact

**Meerdere artifacts:**
- [ ] User opent 3 artifacts achter elkaar
- [ ] Tabs verschijnen bovenaan
- [ ] Switching tussen artifacts werkt
- [ ] 4e artifact openen → oudste sluit automatisch

**Voice input:**
- [ ] Mic icon werkt
- [ ] Deepgram transcriptie verschijnt live
- [ ] Pauze detectie → auto-submit
- [ ] Voice message wordt verwerkt zoals typed message

**Error handling:**
- [ ] Offline → banner verschijnt
- [ ] Stream interrupted → error message in chat
- [ ] Rate limit → friendly message + retry suggestion
- [ ] Network error → retry button
```

**E6.S2 - Performance:**
- Virtual scrolling met `react-window` of `@tanstack/react-virtual` (>100 messages)
- Debounce typing indicator (300ms)
- Memoize message components (`React.memo`)
- Lazy load artifacts (niet renderen tot actief)

**E6.S3 - Edge cases:**
- Zeer lange messages (>1000 chars)
- Special characters in patient names
- Concurrent artifact opening
- Browser back/forward navigation
- Tab close tijdens streaming

**E6.S4 - Documentatie:**
- Update `CLAUDE.md` met v3.0 architecture
- Migration guide voor users (v2.1 → v3.0)
- Developer README met chat API docs
- Prompt versioning doc

**Deliverable:** Production-ready v3.0, alle tests passed, gedocumenteerd

---

## 5. Kwaliteit & Testplan

🎯 **Doel:** Borgen kwaliteit van v3.0 via gestructureerd testplan.

### Test Types

| Test Type | Scope | Tools | Verantwoordelijke |
|-----------|-------|-------|-------------------|
| **Manual Smoke Tests** | Alle P1 flows + edge cases | Checklist (zie E6.S1) | Developer |
| **Integration Tests** | `/api/swift/chat` endpoint | Playwright / Jest | Developer |
| **Performance Tests** | Chat scroll, streaming latency | Chrome DevTools, Lighthouse | Developer |
| **User Acceptance** | Real-world flows met zorgmedewerkers | User feedback sessie | PM + Developer |
| **Security Tests** | API keys, RLS, XSS in chat | Manual audit | Developer |

### Test Coverage Targets

- **Manual smoke tests:** 100% van P1 flows (dagnotitie, zoeken, overdracht, patient context)
- **Integration tests:** `/api/swift/chat` endpoint (streaming, action generation)
- **Performance:** Chat scroll <16ms frame time, streaming latency <500ms

### Manual Test Checklist

**Pre-deployment checklist:**
- [ ] Feature flag `FEATURE_FLAG_SWIFT_V3=true` werkt
- [ ] v2.1 nog steeds beschikbaar (fallback)
- [ ] Alle P1 flows getest (zie E6.S1)
- [ ] Edge cases getest (lange messages, concurrent actions, etc.)
- [ ] Mobile responsive (toggle tussen chat/artifact)
- [ ] Keyboard shortcuts werken (⌘K, Escape, Enter)
- [ ] Voice input geïntegreerd en werkend
- [ ] Error states tonen user-friendly messages
- [ ] Offline banner werkt
- [ ] Performance: scroll smooth, streaming <500ms latency
- [ ] AI-filtering psychiater werkt (alleen behandelrelevante info)
- [ ] Linked evidence klikbaar en toont bronnotities
- [ ] Toast notifications bij save/error
- [ ] Browser back/forward navigation werkt

### Acceptance Criteria (MVP)

**Minimaal werkend voor release:**
1. ✅ Split-screen layout werkend (desktop/tablet/mobile)
2. ✅ Conversatie met medical scribe voelt natuurlijk (niet robotisch)
3. ✅ Artifacts openen binnen 2 sec na intent detection
4. ✅ AI-filtering psychiater >85% accuracy (behandelrelevante info)
5. ✅ Voice input geïntegreerd en werkend
6. ✅ P1 flows (dagnotitie, zoeken, overdracht, patient context) 100% werkend
7. ✅ Error handling: netwerk errors, offline, stream interrupted
8. ✅ Performance: <500ms streaming latency, smooth scroll

---

## 6. Demo & Presentatieplan

🎯 **Doel:** Presenteren van v3.0 aan stakeholders en users voor feedback.

### Demo Scenario

**Duur:** 15 minuten
**Doelgroep:** Zorgmedewerkers (verpleegkundigen + psychiaters), product team
**Locatie:** Vercel staging environment (`swift-v3-staging.vercel.app`)

**Flow:**

1. **Intro (2 min):**
   - Context: "We hebben Swift getransformeerd naar een conversational interface"
   - Toon v2.1 vs. v3.0 screenshot (voor/na)

2. **Dagnotitie flow (3 min):**
   - Typ: "Ik heb net medicatie gegeven aan Jan de Vries"
   - AI herkent intent, DagnotatieBlock opent rechts met prefill
   - Toon follow-up: "Voeg toe: hij voelt zich beter vandaag"
   - Opslaan → Chat confirmation

3. **Patiënt zoeken + context (3 min):**
   - Typ: "Wie is Marie van den Berg?"
   - ZoekenBlock opent, selecteer patient
   - PatientContextCard toont laatste notities, vitals, diagnose
   - Chat vraag: "Wat was er gisteren met Marie?"
   - AI antwoordt met context uit notities

4. **Overdracht met AI-filtering (4 min):**
   - Typ: "Maak overdracht voor deze dienst"
   - OverdrachtBlock opent
   - Toon psychiater view: alleen behandelrelevante info
   - Klik op linked evidence → bronnotitie preview
   - Toon verschil tussen verpleegkundige vs. psychiater view

5. **Voice input (2 min):**
   - Klik mic icon
   - Spreek: "Notitie voor Jan: bloeddruk gemeten, 135 over 85"
   - Live transcript verschijnt
   - DagnotatieBlock opent met prefill

6. **Q&A (1 min):**
   - Vragen beantwoorden
   - Feedback verzamelen

**Backup Plan:**
- Lokale versie klaar bij internet/API issues
- Pre-recorded video als complete fallback
- Screenshots voor elk stap

---

## 7. Risico's & Mitigatie

🎯 **Doel:** Risico's vroeg signaleren en mitigeren.

| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| **AI prompt niet natuurlijk genoeg** | Hoog | Hoog | Iteratief testen met users, prompt versioning, A/B testing | Developer |
| **Streaming latency >1s** | Middel | Hoog | Claude Haiku model overwegen (sneller), caching, local patterns voor snelle acties | Developer |
| **Performance bij >100 messages** | Middel | Middel | Virtual scrolling, pagination, max 100 messages in view | Developer |
| **Chat state memory leak** | Middel | Middel | Proper cleanup in useEffect, memory profiling | Developer |
| **AI kosten te hoog** | Middel | Middel | Rate limiting, local pattern matching eerst, cache responses | PM |
| **Mobile UX awkward** | Hoog | Middel | Extensive mobile testing, toggle UX refinement | Developer |
| **v2.1 users niet willen switchen** | Hoog | Laag | Feature flag (optioneel), user onboarding, feedback loop | PM |
| **Intent detection accuracy <80%** | Middel | Hoog | Hybrid approach (local + AI), confidence thresholds, fallback picker | Developer |
| **Browser compatibility issues** | Laag | Middel | Test Chrome/Safari/Firefox, SSE polyfill if needed | Developer |
| **Concurrent artifact state bugs** | Middel | Middel | Thorough testing, max 3 artifacts enforced, state validation | Developer |

**Top 3 Risks & Mitigation:**

1. **AI Prompt Engineering (Kans: Hoog, Impact: Hoog)**
   - **Mitigatie:** Start met simpele prompt v1 in E0.S3, iteratief verfijnen met user feedback, prompt versioning (v1, v2, v3), A/B testing tussen prompts
   - **Success metric:** >80% user satisfaction "voelt natuurlijk aan"

2. **Performance - Streaming Latency (Kans: Middel, Impact: Hoog)**
   - **Mitigatie:** Local patterns voor P1 intents (dagnotitie, zoeken) → <100ms, AI alleen voor complex/conversational, Claude Haiku overwegen, response caching
   - **Success metric:** <500ms tot eerste AI token, <2s tot artifact open

3. **Mobile UX Toggle (Kans: Hoog, Impact: Middel)**
   - **Mitigatie:** Extensive mobile testing, bottom sheet voor artifact (native feel), swipe gestures, user testing met zorgmedewerkers
   - **Success metric:** >70% mobile users vindt toggle intuïtief

---

## 8. Evaluatie & Lessons Learned

🎯 **Doel:** Reflecteren na elke epic en einde project.

**Na elke epic (weekly retro):**
- Wat ging goed deze week?
- Welke blockers hadden we?
- Welke AI-prompts werkten het beste?
- Waar liepen we vertraging op?
- Wat passen we aan voor volgende epic?

**Na project (final retro):**

**Te documenteren:**
1. **Successen:**
   - Welke componenten zijn herbruikbaar voor volgende projecten?
   - Welke development patterns werkten goed?
   - Welke AI-prompts waren meest effectief?

2. **Uitdagingen:**
   - Waar liepen we vast?
   - Welke technical debt ontstond?
   - Welke estimates waren te optimistisch/pessimistisch?

3. **Metrics:**
   - Actual time spent vs. estimated (story points)
   - User satisfaction score (survey)
   - Performance metrics (latency, scroll FPS)
   - AI kosten (Claude API usage)

4. **Next Steps:**
   - P2/P3 features roadmap
   - Technical debt payoff plan
   - User feedback integration plan

**Template voor lessons learned:**
```markdown
## Epic X - Lessons Learned

### What went well
- ...

### What didn't go well
- ...

### Action items for next epic
- ...

### Reusable components/patterns
- ...
```

---

## 9. Referenties

🎯 **Doel:** Koppelen aan overige Mission Control-documenten.

**Mission Control Documents:**
- **PRD Ephemeral UI:** `docs/swift/archive/nextgen-epd-prd-ephemeral-ui-epd.md` — Product vision
- **FO v3.0:** `docs/swift/fo-swift-medical-scribe-v3.md` — Functioneel ontwerp medical scribe
- **Haalbaarheid:** `docs/swift/haalbaarheidsanalyse-v3.md` — Feasibility analysis
- **UX v2.1:** `docs/swift/archive/swift-ux-v2.1.md` — Huidige UX/styling
- **UX Analyse v3:** `docs/swift/v3-redesign-met-huidige-styling.md` — Wat blijft vs. wijzigt
- **Bouwplan v2:** `docs/swift/bouwplan-swift-v2.md` — Previous roadmap (v2.1)

**Technical Resources:**
- Repository: `https://github.com/[org]/mini-epd-prototype`
- Staging: `https://swift-v3-staging.vercel.app` (to be created)
- Production: `https://mini-epd.vercel.app` (existing)
- Component Library: `components/swift/` folder
- API Documentation: `/docs/api/` (to be created)

**External References:**
- [ChatGPT Canvas UX](https://altar.io/next-gen-of-human-ai-collaboration/) — Inspiration
- [Claude Artifacts](https://docs.anthropic.com) — Pattern reference
- [Abridge Linked Evidence](https://www.abridge.com/product) — Evidence linking pattern
- [Anthropic Streaming API](https://docs.anthropic.com/en/api/streaming) — SSE implementation

---

## 10. Glossary & Abbreviations

| Term | Betekenis |
|------|-----------|
| **Epic** | Grote feature of fase in development (bevat meerdere stories) |
| **Story** | Kleine, uitvoerbare taak binnen een epic |
| **Story Points** | Schatting van complexiteit (Fibonacci: 1, 2, 3, 5, 8, 13, 21) |
| **SP** | Story Points (afkorting) |
| **MVP** | Minimum Viable Product |
| **P1/P2/P3** | Priority tiers (P1 = kritiek, P2 = belangrijk, P3 = waardevol) |
| **SSE** | Server-Sent Events (streaming protocol) |
| **DRY** | Don't Repeat Yourself |
| **KISS** | Keep It Simple, Stupid |
| **SOC** | Separation of Concerns |
| **YAGNI** | You Aren't Gonna Need It |
| **RLS** | Row Level Security (Supabase) |
| **Intent** | Gebruikersintentie (dagnotitie, zoeken, overdracht, etc.) |
| **Artifact** | UI-component die verschijnt in artifact area (block) |
| **Block** | Herbruikbare UI-component (DagnotatieBlock, ZoekenBlock, etc.) |
| **Prefill** | Vooringevulde data in artifact o.b.v. AI entity extraction |
| **Medical Scribe** | AI-assistent die medische documentatie ondersteunt |
| **Linked Evidence** | Klikbare links naar bronnotities in AI-samenvatting |

---

## 11. Story Points Reference

**Fibonacci schaal voor story points:**

| Points | Complexiteit | Geschatte tijd | Voorbeelden |
|--------|--------------|----------------|-------------|
| 1 | Trivial | 1-2 uur | Feature flag setup, config wijziging |
| 2 | Simple | 2-4 uur | Component skeleton, store uitbreiding (1 field) |
| 3 | Small | 4-8 uur | Simpele component met state, basic API endpoint |
| 5 | Medium | 1-2 dagen | Complex component, API met business logic |
| 8 | Large | 2-3 dagen | Feature met meerdere componenten, integrations |
| 13 | Very Large | 3-5 dagen | Epic-level feature, major refactor |
| 21 | Extra Large | 1 week+ | Waarschijnlijk te groot, split in kleinere stories |

**Velocity tracking:**
- **Target velocity:** ~12 SP per week (1 developer)
- **Sprint length:** 1 week
- **Total project:** 86 SP ≈ 7 weken (met buffer = 8 weken)

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 27-12-2024 | Colin Lit | Initiële versie - complete bouwplan v3.0 |
