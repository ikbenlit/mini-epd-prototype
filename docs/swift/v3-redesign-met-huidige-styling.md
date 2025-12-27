# 🎨 Swift v3.0 Redesign — Van Command Center naar Medical Scribe

**Datum:** 27-12-2024
**Versie:** v3.0 Design Specification
**Samengesteld door:** AI Assistant

---

## 📋 Inhoudsopgave

1. [Executive Summary](#executive-summary)
2. [Van v2.1 naar v3.0: Wat verandert](#van-v21-naar-v30-wat-verandert)
3. [Huidige UX/Styling (v2.1)](#huidige-uxstyling-v21)
4. [Nieuwe UX/Styling (v3.0)](#nieuwe-uxstyling-v30)
5. [Wat blijft hetzelfde](#wat-blijft-hetzelfde)
6. [Wat wijzigt](#wat-wijzigt)
7. [Implementatie Strategie](#implementatie-strategie)
8. [Design Tokens & Styling](#design-tokens--styling)

---

## Executive Summary

Swift v3.0 transformeert van een **command-line style interface** naar een **conversational medical scribe chatbot**. De kernprincipes van Ephemeral UI blijven behouden, maar de interactie verschuift van transactioneel naar relationeel.

### Kernveranderingen

| Aspect | v2.1 (Command Center) | v3.0 (Medical Scribe) |
|--------|----------------------|----------------------|
| **Input model** | Command-line ("notitie jan medicatie") | Natuurlijke conversatie ("Ik heb medicatie gegeven aan Jan") |
| **UI paradigma** | Centered blocks (ephemeral) | Split-screen: Chat (40%) + Artifacts (60%) |
| **Context** | Per commando | Doorlopende conversatiegeschiedenis |
| **AI rol** | Intent classifier | Converserende medical scribe |
| **Interactie** | Transactioneel (one-shot) | Relationeel (follow-up mogelijk) |

### Wat blijft

✅ **Ephemeral UI principe** — UI verschijnt/verdwijnt wanneer nodig
✅ **Alle bestaande blocks** — DagnotatieBlock, ZoekenBlock, OverdrachtBlock, etc.
✅ **Color system** — Shift colors, category colors, design tokens
✅ **Keyboard shortcuts** — ⌘K, Escape, Enter, 1-9
✅ **Voice input** — Deepgram integratie blijft werken
✅ **Context Bar** — Shift, patient, user info

### Wat wijzigt

🔄 **Layout** — 4-zone → Split-screen (chat + artifacts)
🔄 **Input** — Command input → Chat input met conversatie
🔄 **Canvas Area** → Artifact Area (rechts, 60%)
🔄 **Recent Strip** → Optioneel (kan geïntegreerd in chat)
🔄 **AI Engine** — Intent classifier → Medical scribe chatbot

---

## Van v2.1 naar v3.0: Wat verandert

### v2.1 Layout (Huidig)

```
┌─────────────────────────────────────────────────────────────────┐
│  🕐 Ochtend | 8 ptn              Jan de Vries ▼        👤 SV   │  ← Context Bar (48px)
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ┌─────────────────────┐                      │
│                    │                     │                      │
│                    │   ACTIVE BLOCK      │                      │  ← Canvas Area (flex)
│                    │   (centered)        │                      │
│                    │                     │                      │
│                    └─────────────────────┘                      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Recent: [📝 Jan-Med] [🔄 Overdracht] [🔍 Marie]               │  ← Recent Strip (48px)
├─────────────────────────────────────────────────────────────────┤
│  🎤  Typ of spreek wat je wilt doen...                    ⌘K   │  ← Command Input (64px)
└─────────────────────────────────────────────────────────────────┘
```

### v3.0 Layout (Nieuw)

```
┌─────────────────────────────────────────────────────────────────┐
│  🕐 Ochtend | 8 ptn              Jan de Vries ▼        👤 SV   │  ← Context Bar (48px)
├──────────────────────────────┬──────────────────────────────────┤
│                              │                                  │
│  CHAT PANEL (40%)            │  ARTIFACT AREA (60%)             │
│                              │                                  │
│  👤 "Ik heb net medicatie    │  ┌────────────────────────────┐ │
│     gegeven aan Jan"         │  │ 📝 Dagnotitie              │ │
│                              │  │                            │ │
│  🤖 Ik maak een dagnotitie   │  │ Patiënt: Jan de Vries ✓   │ │
│     voor Jan de Vries.       │  │ Categorie: Medicatie ✓    │ │
│     Categorie: Medicatie.    │  │                            │ │
│                              │  │ [Opslaan]                  │ │
│     Wil je nog iets          │  └────────────────────────────┘ │
│     toevoegen?               │                                  │
│                              │                                  │
│  👤 "Nee, opslaan"           │                                  │
│                              │                                  │
│  🤖 ✓ Notitie opgeslagen     │                                  │
│                              │                                  │
├──────────────────────────────┤                                  │
│ 💬 Typ of spreek...     🎤   │                                  │  ← Chat Input (64px)
└──────────────────────────────┴──────────────────────────────────┘
```

---

## Huidige UX/Styling (v2.1)

### Layout Zones

| Zone | Hoogte | Functie | Component |
|------|--------|---------|-----------|
| **Context Bar** | 48px (h-12) | Dienst, actieve patiënt, user | `context-bar.tsx` |
| **Canvas Area** | flex-1 | Waar blocks verschijnen (centered) | `canvas-area.tsx` |
| **Recent Strip** | 48px (h-12) | Laatste acties, quick access | `recent-strip.tsx` |
| **Command Input** | 64px (h-16) | Command-line style input + voice | `command-input.tsx` |

### Context Bar (Blijft grotendeels hetzelfde)

**Huidige implementatie:**
```tsx
<header className="h-12 border-b border-slate-200 flex items-center px-4 justify-between">
  {/* Left: Logo + Shift */}
  <div className="flex items-center gap-4">
    <Link href="/epd">Swift</Link>
    <ShiftIcon /> {/* Sunrise/Sun/Sunset/Moon */}
    <span>{shiftLabel}</span> {/* Ochtenddienst/Middagdienst/etc. */}
  </div>

  {/* Center: Active Patient */}
  <div className="flex items-center gap-2">
    <Avatar>{initials}</Avatar>
    <span>{patientName}</span>
    <button onClick={clearPatient}><X /></button>
  </div>

  {/* Right: User */}
  <div className="flex items-center gap-2">
    <User />
    <span>Verpleegkundige</span>
  </div>
</header>
```

**Dienst kleuren:**
| Dienst | Tijd | Kleur | Icon |
|--------|------|-------|------|
| Ochtend | 07:00-15:00 | `text-amber-600` (#F59E0B) | Sunrise |
| Middag | 15:00-23:00 | `text-yellow-600` (#3B82F6) | Sun |
| Avond | 15:00-23:00 | `text-orange-600` | Sunset |
| Nacht | 23:00-07:00 | `text-indigo-600` (#6366F1) | Moon |

### Command Input (Wijzigt naar Chat Input)

**Huidige states:**
- **Default**: "Typ of spreek wat je wilt doen..." + mic icon
- **Typing**: Tekst + cursor
- **Listening**: 🔴 + waveform + live transcript
- **Processing**: "Even kijken wat je bedoelt..."

**Styling:**
```css
height: 64px (h-16)
background: #FFFFFF
border: 1px #E2E8F0, 2px #3B82F6 (focus)
border-radius: 16px
shadow: lg
font-size: 18px
position: fixed bottom, 24px padding
```

### Block Styling (Blijft hetzelfde)

**Block sizes:**
| Size | Max-width | Use case |
|------|-----------|----------|
| Small | 480px | Quick entry (notitie, zoeken, meting) |
| Medium | 640px | Forms (rapportage, behandelplan) |
| Large | 900px | Overzichten (overdracht, patiëntenlijst) |
| XLarge | 1100px | Wizards (intake volledig) |

**Categorie kleuren (verpleegkundig):**
| Categorie | Background | Accent | Icon | Keyboard |
|-----------|------------|--------|------|----------|
| Medicatie | `#FEF6DC` | `#F59E0B` | 💊 | 1 |
| ADL | `#E8F8EF` | `#16A34A` | 🍽️ | 2 |
| Observatie | `#EFF6FF` | `#3B82F6` | 👁️ | 3 |
| Incident | `#FEF2F2` | `#DC2626` | ⚠️ | 4 |
| Algemeen | `#F1F5F9` | `#64748B` | 💬 | 5 |

### Keyboard Shortcuts (Blijft hetzelfde)

| Key | Action |
|-----|--------|
| `⌘K` / `Ctrl+K` | Focus command input (blijft focus chat input) |
| `Escape` | Close active block (blijft) |
| `Enter` | Submit (blijft) |
| `⌘Enter` / `Ctrl+Enter` | Quick submit (blijft) |
| `↑` `↓` | Navigate results / history |
| `1-9` | Quick select in FallbackPicker |
| `Space` (empty input) | Start voice (blijft) |

### Voice Input (Blijft hetzelfde)

**Flow:**
1. User klikt mic of drukt spatie (bij lege input)
2. Deepgram start streaming transcription
3. Live transcript verschijnt in input field
4. Pauze detectie (1.5 sec stilte) → auto-submit
5. Of user klikt "Stop" → submit

---

## Nieuwe UX/Styling (v3.0)

### Layout Zones (Gewijzigd)

| Zone | Breedte | Functie | Component |
|------|---------|---------|-----------|
| **Context Bar** | 100% x 48px | Dienst, actieve patiënt, user | `context-bar.tsx` (ongewijzigd) |
| **Chat Panel** | 40% x flex | Conversatie met medical scribe | `chat-panel.tsx` (nieuw) |
| **Artifact Area** | 60% x flex | Waar blocks/artifacts verschijnen | `artifact-area.tsx` (nieuw) |
| **Chat Input** | 40% x 64px | Conversational input + voice | `chat-input.tsx` (herzien) |

### Chat Panel (Nieuw)

**Message Types:**

| Type | Alignment | Background | Border | Icon |
|------|-----------|------------|--------|------|
| User message | Right | Amber-50 (#FFFBEB) | Amber-200 | 👤 |
| Assistant text | Left | Slate-100 (#F1F5F9) | Slate-200 | 🤖 |
| Assistant action | Left | Slate-100 | Slate-200 | 📝/🔍/🔄 (klikbaar) |
| System message | Center | - | - | ✓ |
| Error message | Left | Red-50 | Red-200 | ⚠️ |

**Message Styling:**
```css
/* User message */
.message-user {
  align-self: flex-end;
  background: #FFFBEB;
  border: 1px solid #FED7AA;
  border-radius: 16px;
  border-top-right-radius: 4px;
  max-width: 80%;
  padding: 12px 16px;
  margin: 4px 0;
}

/* Assistant message */
.message-assistant {
  align-self: flex-start;
  background: #F1F5F9;
  border: 1px solid #CBD5E1;
  border-radius: 16px;
  border-top-left-radius: 4px;
  max-width: 80%;
  padding: 12px 16px;
  margin: 4px 0;
}
```

**Gedrag:**
- Auto-scroll naar laatste message
- Scroll-lock wanneer gebruiker omhoog scrollt
- "Scroll to bottom" knop bij nieuwe messages (↓)
- Max 100 messages in view (pagination voor oudere)
- Streaming indicator tijdens AI response (pulsating dots)

### Chat Input (Herzien)

**States (blijven grotendeels hetzelfde):**

| State | Weergave | Trigger |
|-------|----------|---------|
| Default | "Typ of spreek..." + mic icon | — |
| Typing | Cursor + getypte tekst | Keyboard input |
| Listening | 🔴 + waveform + live transcript | Mic click of spatie |
| Processing | Disabled, "Denkt na..." | Na submit |
| Streaming | Disabled, streaming in chat | Tijdens AI response |

**Keyboard Shortcuts (uitgebreid):**

| Key | Actie |
|-----|-------|
| `Enter` | Submit message |
| `⌘Enter` / `Ctrl+Enter` | Force submit (ook tijdens streaming) |
| `Escape` | Clear input / cancel voice |
| `↑` | Vorige message (edit history) |
| `Space` (leeg) | Start voice recording |
| `⌘K` | Focus input |

### Artifact Area (Nieuw)

**Layout opties:**

| Situatie | Weergave |
|----------|----------|
| Geen artifact | Placeholder met voorbeelden |
| Eén artifact | Full width, centered |
| Meerdere artifacts | Tabs bovenaan (max 3) |

**Placeholder State:**
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                    💬 Artifacts verschijnen hier           │
│                                                            │
│     Vraag me iets, bijvoorbeeld:                          │
│     • "Notitie voor Jan: medicatie gegeven"               │
│     • "Zoek Marie van den Berg"                           │
│     • "Maak overdracht voor deze dienst"                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Artifact Lifecycle:**
1. Intent detected in chat → AI response: "Ik maak een dagnotitie..."
2. Artifact appears → Slide-in animation (200ms, from right)
3. Pre-filled met extracted entities
4. User interacts → Edits fields, kan blijven chatten
5. User saves → Toast + chat confirmation + artifact closes (optioneel)

**Artifact Animation:**
```css
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

### Responsive Breakpoints (Nieuw)

| Viewport | Chat Panel | Artifact Area |
|----------|------------|---------------|
| Desktop (>1200px) | 40% | 60% |
| Tablet (768-1200px) | 45% | 55% |
| Mobile (<768px) | Full screen toggle | Full screen toggle |

---

## Wat blijft hetzelfde

### ✅ Components die NIET wijzigen

1. **Context Bar** — `context-bar.tsx`
   - Shift indicator met kleuren
   - Patient selector
   - User info

2. **Alle Block componenten** — `blocks/*.tsx`
   - `DagnotatieBlock` ✅
   - `ZoekenBlock` ✅
   - `OverdrachtBlock` ✅ (wel uitbreiding AI-filtering)
   - `RapportageBlock` ✅
   - `AgendaBlock` ✅
   - `MetingenBlock` ✅
   - `PatientContextCard` ✅

3. **Voice Input** — `lib/swift/use-swift-voice.ts`
   - Deepgram streaming transcription
   - Live transcript
   - Pauze detectie

4. **Store** — `stores/swift-store.ts`
   - activePatient, shift, activeBlock
   - Wordt uitgebreid, maar bestaande state blijft

5. **Design Tokens**
   - Color palette
   - Category colors
   - Shift colors
   - Typography
   - Spacing

### ✅ Gedrag dat NIET wijzigt

- Keyboard shortcuts (⌘K, Escape, Enter, etc.)
- Voice recording flow
- Block prefill logic
- Patient search
- Category selection (1-9 keys)
- Toast notifications
- Error handling (offline banner, retry logic)

---

## Wat wijzigt

### 🔄 Components die WIJZIGEN

1. **CommandCenter** — `command-center.tsx`
   - **Van:** 4-zone layout (context | canvas | recent | input)
   - **Naar:** Split-screen layout (context | chat+artifact | input)
   - **Effort:** 3-5 dagen

2. **CommandInput** → **ChatInput** — `command-input.tsx`
   - **Van:** Single-line command input
   - **Naar:** Multi-line chat input (onderaan chat panel, 40% width)
   - **Blijft:** Voice input, keyboard shortcuts, states
   - **Effort:** 3 dagen

3. **CanvasArea** → **ArtifactArea** — `canvas-area.tsx`
   - **Van:** Centered block display
   - **Naar:** Right-side artifact area (60% width) met tabs
   - **Effort:** 1 week

4. **RecentStrip** — `recent-strip.tsx`
   - **Van:** Fixed bar onderaan canvas
   - **Naar:** Optioneel (kan geïntegreerd in chat history of verwijderd)
   - **Effort:** 1 dag (verwijderen of integreren)

### 🆕 Components die NIEUW zijn

1. **ChatPanel** — `chat-panel.tsx`
   - Scrollable message list
   - User/assistant message bubbles
   - Streaming indicator
   - Action links
   - **Effort:** 1 week

2. **ChatMessage** — `chat-message.tsx`
   - Message bubble component
   - Different types (user, assistant, system, error)
   - **Effort:** 2 dagen

3. **StreamingIndicator** — `streaming-indicator.tsx`
   - Pulsating dots tijdens AI response
   - **Effort:** 1 dag

4. **ChatActionLink** — `chat-action-link.tsx`
   - Klikbare links in assistant messages naar artifacts
   - **Effort:** 1 dag

5. **ArtifactContainer** — `artifact-container.tsx`
   - Wrapper met tabs (max 3 artifacts)
   - Tab switching
   - **Effort:** 3 dagen

6. **LinkedEvidence** — `linked-evidence.tsx`
   - Voor OverdrachtBlock: links naar bronnotities
   - **Effort:** 2 dagen

### 🔄 Backend/API die WIJZIGT

1. **Intent Classification** — `/api/intent/classify`
   - **Van:** Simple pattern matching + AI fallback
   - **Naar:** Blijft werken, maar wordt geïntegreerd in chat API
   - **Effort:** 1 dag (integratie)

2. **Nieuwe Chat API** — `/api/swift/chat`
   - Medical scribe chatbot endpoint
   - Streaming responses (SSE)
   - Conversatiegeschiedenis als input
   - Action objects in response
   - **Effort:** 1.5 week

3. **Overdracht AI-Filtering** — `/api/overdracht/generate`
   - **Van:** Alle notities samenvatten
   - **Naar:** + Filtering op behandelrelevantie (voor psychiater)
   - **Effort:** 1 week

---

## Implementatie Strategie

### Fase 1: Foundation (Week 1-2)

**Doel:** Split-screen layout werkend krijgen zonder chat functionaliteit

**Taken:**
1. CommandCenter layout wijzigen naar split-screen (40/60)
2. ChatPanel skeleton (nog zonder AI, gewoon tekst weergave)
3. ArtifactArea component (wrapper voor bestaande blocks)
4. Store uitbreiden met chat state (chatMessages, isStreaming)

**Deliverable:** Split-screen layout zichtbaar, bestaande blocks werken in artifact area

**Risico's:**
- Responsive design voor mobile/tablet
- Block positioning in artifact area (60% width i.p.v. centered)

---

### Fase 2: Chat API & Conversatie (Week 3-4)

**Doel:** Conversatie met medical scribe werkend krijgen

**Taken:**
1. Chat API endpoint bouwen (`/api/swift/chat`)
2. Medical scribe system prompt
3. Streaming responses (SSE) implementeren
4. ChatMessage componenten bouwen
5. Intent detection in conversatie
6. Action object generation

**Deliverable:** Werkende conversatie die artifacts kan openen

**Risico's:**
- AI prompt engineering (natuurlijk klinken + betrouwbaar)
- Performance bij lange conversaties
- Kosten (Claude API calls)

---

### Fase 3: Artifact Area & Polish (Week 5-6)

**Doel:** Meerdere artifacts, polish, AI-filtering

**Taken:**
1. Meerdere artifacts ondersteuning (tabs, max 3)
2. Slide-in animaties
3. AI-filtering voor psychiater overdracht
4. Linked evidence UI
5. Error handling & edge cases
6. Performance optimalisatie

**Deliverable:** Volledige v3.0 functionaliteit

---

### Fase 4: Testing & Refinement (Week 7-8)

**Doel:** Production-ready maken

**Taken:**
1. User testing
2. Bug fixes
3. Performance tuning
4. Documentatie
5. Migration plan (feature flag)

**Deliverable:** Production-ready v3.0

---

## Design Tokens & Styling

### Colors (Blijft hetzelfde)

```css
/* App colors */
--bg-app: #F8FAFC;
--bg-surface: #FFFFFF;
--text-primary: #0F172A;
--text-secondary: #475569;
--border: #E2E8F0;
--brand: #3B82F6;
--success: #16A34A;
--warning: #EAB308;
--error: #DC2626;

/* Shift colors */
--shift-ochtend: #F59E0B;
--shift-middag: #EAB308;
--shift-avond: #FB923C;
--shift-nacht: #6366F1;

/* Category colors */
--cat-medicatie-bg: #FEF6DC;
--cat-medicatie-accent: #F59E0B;
--cat-adl-bg: #E8F8EF;
--cat-adl-accent: #16A34A;
--cat-observatie-bg: #EFF6FF;
--cat-observatie-accent: #3B82F6;
--cat-incident-bg: #FEF2F2;
--cat-incident-accent: #DC2626;
--cat-algemeen-bg: #F1F5F9;
--cat-algemeen-accent: #64748B;
```

### Chat Message Colors (Nieuw)

```css
/* Chat message colors */
--chat-user-bg: #FFFBEB;
--chat-user-border: #FED7AA;
--chat-assistant-bg: #F1F5F9;
--chat-assistant-border: #CBD5E1;
--chat-system-text: #64748B;
--chat-error-bg: #FEF2F2;
--chat-error-border: #FECACA;
```

### Typography (Blijft hetzelfde)

```css
/* Font sizes */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */

/* Font weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing (Blijft hetzelfde)

```css
/* Spacing scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Border Radius (Blijft hetzelfde)

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 16px;
--radius-full: 9999px;
```

---

## Conclusie

Het v3.0 redesign is **haalbaar binnen 6-8 weken** omdat:

1. ✅ **Sterke foundation** — Alle blocks, voice input, design tokens blijven werken
2. ✅ **Incrementele wijziging** — Geen complete rewrite, layout + conversatie laag toevoegen
3. ✅ **Bestaande patterns** — Chat API pattern bestaat al (`/api/docs/chat`)
4. ✅ **Design continuïteit** — Kleuren, typography, spacing blijven hetzelfde

**Grootste uitdagingen:**
- Medical scribe prompt engineering (natuurlijk + betrouwbaar)
- Chat state management (Zustand store uitbreiden)
- Performance bij lange conversaties

**Grootste voordelen:**
- Natuurlijkere interactie (relationeel i.p.v. transactioneel)
- Follow-up vragen mogelijk
- Context behouden tijdens werk
- Overeenkomsten met ChatGPT/Claude (bekend voor gebruikers)

---

## Referenties

- **FO v3.0:** `fo-swift-medical-scribe-v3.md` — Functioneel ontwerp
- **Haalbaarheid:** `haalbaarheidsanalyse-v3.md` — Feasibility analysis
- **UX v2.1:** `archive/swift-ux-v2.1.md` — Huidige UX/styling
- **Bouwplan v2:** `bouwplan-swift-v2.md` — Development roadmap
