# 📊 Haalbaarheidsanalyse: Swift Medical Scribe v3.0

**Datum:** 27-12-2024  
**Document:** `fo-swift-medical-scribe-v3.md`  
**Auteur:** AI Assistant

---

## Executive Summary

Het v3.0 redesign van Swift naar een medical scribe chatbot interface is **haalbaar**, maar vereist significante architecturale wijzigingen. De bestaande foundation (Command Center, blocks, intent classification) kan worden hergebruikt, maar de conversatie-laag en split-screen layout zijn nieuw.

**Kernbevindingen:**
- ✅ **Sterke foundation:** Bestaande blocks, intent API, en voice input kunnen worden hergebruikt
- ⚠️ **Grote wijzigingen:** Conversatie-interface, chat API, en split-screen layout zijn nieuw
- ✅ **AI-infrastructuur:** Streaming chat API bestaat al (docs-chat), kan worden aangepast
- ⚠️ **Complexiteit:** Conversatiegeschiedenis en context management vereisen nieuwe state management

**Geschatte effort:** 6-8 weken (1 developer, full-time)

---

## 1. Inventarisatie Bestaande Componenten

### 1.1 ✅ Wat bestaat al en kan worden hergebruikt

| Component | Status | Locatie | Hergebruik |
|-----------|--------|---------|------------|
| **Command Center** | ✅ Done | `components/swift/command-center/` | ⚠️ Layout wijzigen naar split-screen |
| **Context Bar** | ✅ Done | `components/swift/command-center/context-bar.tsx` | ✅ Direct hergebruikbaar |
| **Blocks (Artifacts)** | ✅ Done | `components/swift/blocks/` | ✅ Direct herbruikbaar |
| **Intent Classification** | ✅ Done | `/api/intent/classify` | ✅ Herbruikbaar, maar moet worden uitgebreid |
| **Voice Input** | ✅ Done | `lib/swift/use-swift-voice.ts` | ✅ Direct herbruikbaar |
| **Swift Store** | ✅ Done | `stores/swift-store.ts` | ⚠️ Uitbreiden met chat state |
| **Overdracht API** | ✅ Done | `/api/overdracht/generate` | ✅ Bestaat, maar AI-filtering voor psychiater moet worden toegevoegd |
| **Streaming Chat API** | ✅ Bestaat | `/api/docs/chat` | ✅ Pattern kan worden gekopieerd |

### 1.2 🆕 Wat nieuw moet worden gebouwd

| Component | Complexiteit | Geschatte Effort |
|-----------|-------------|------------------|
| **Chat Panel** | Medium | 1 week |
| **Chat Input (conversational)** | Low | 3 dagen |
| **Chat API (`/api/swift/chat`)** | High | 1.5 week |
| **Artifact Area (split-screen)** | Medium | 1 week |
| **Chat Message Components** | Low | 3 dagen |
| **Conversation History Management** | Medium | 1 week |
| **AI-filtering voor psychiater** | Medium | 1 week |
| **Linked Evidence UI** | Low | 3 dagen |

**Totaal nieuwe componenten:** ~6-7 weken

---

## 2. Gedetailleerde Analyse per Sectie

### 2.1 Command Center → Split-Screen Layout

**Huidige situatie:**
- 4-zone layout: Context Bar | Canvas Area | Recent Strip | Command Input
- Blocks verschijnen in Canvas Area (centered, full-width)

**Vereiste wijziging:**
- Split-screen: Chat Panel (40%) links, Artifact Area (60%) rechts
- Recent Strip kan worden verwijderd of geïntegreerd in chat

**Haalbaarheid:** ✅ **Goed**
- Layout wijziging is relatief eenvoudig met CSS Grid/Flexbox
- Bestaande blocks blijven werken, alleen positioning wijzigt
- **Effort:** 3-5 dagen

**Risico's:**
- Responsive design voor mobile/tablet vereist toggle tussen chat en artifact
- Keyboard shortcuts moeten worden aangepast

---

### 2.2 Chat Panel & Conversatie

**Huidige situatie:**
- Geen chat interface
- Command Input stuurt direct naar intent classification

**Vereiste wijziging:**
- Nieuwe Chat Panel component met message bubbles
- Conversatiegeschiedenis (max 100 messages)
- Streaming responses (zoals docs-chat)

**Haalbaarheid:** ✅ **Goed**
- Pattern bestaat al in `components/docs-chat/`
- `use-docs-chat.ts` hook kan worden aangepast voor Swift
- **Effort:** 1 week

**Risico's:**
- Performance bij lange conversaties (pagination nodig)
- State management voor chat history (Zustand store uitbreiden)

---

### 2.3 Medical Scribe Chat API

**Huidige situatie:**
- `/api/intent/classify` retourneert alleen intent + entities
- Geen conversatie, geen streaming

**Vereiste wijziging:**
- Nieuwe `/api/swift/chat` endpoint
- Streaming responses (SSE)
- Conversatiegeschiedenis als input
- Action objects in response (intent + entities + artifact prefill)

**Haalbaarheid:** ⚠️ **Middelmatig**
- Pattern bestaat in `/api/docs/chat` (streaming met Claude)
- Moet worden uitgebreid met:
  - Intent detection tijdens conversatie
  - Action object generation
  - Context management (activePatient, shift, recentActions)
- **Effort:** 1.5 week

**Risico's:**
- AI prompt engineering voor medical scribe persona
- Performance bij hoge load (rate limiting nodig)
- Kosten (Claude API calls per message)

**Aanbeveling:**
```typescript
// Hybrid approach: local intent first, AI voor conversatie
1. Local pattern matching (<50ms) → direct action
2. Als geen match → AI chat API met conversatie context
3. AI detecteert intent + genereert response + action object
```

---

### 2.4 Intent Engine (Hybrid)

**Huidige situatie:**
- Two-tier: local patterns → AI fallback
- Werkt goed voor directe commando's

**Vereiste wijziging:**
- Local patterns blijven voor snelle acties
- AI chat API voor conversatie + follow-up vragen
- Confidence thresholds voor artifact opening

**Haalbaarheid:** ✅ **Goed**
- Bestaande intent classifier blijft werken
- Chat API gebruikt AI voor conversatie + intent detection
- **Effort:** 3 dagen (integratie)

---

### 2.5 Artifact Area (Split-Screen)

**Huidige situatie:**
- Blocks verschijnen centered in Canvas Area
- Eén block tegelijk

**Vereiste wijziging:**
- Artifacts rechts (60% width)
- Meerdere artifacts mogelijk (tabs, max 3)
- Slide-in animatie van rechts

**Haalbaarheid:** ✅ **Goed**
- Bestaande blocks blijven werken
- Nieuwe wrapper component met tabs
- **Effort:** 1 week

**Risico's:**
- State management voor meerdere open artifacts
- Tab switching UX

---

### 2.6 AI-Filtering voor Psychiater

**Huidige situatie:**
- `/api/overdracht/generate` genereert samenvatting voor alle notities
- Geen filtering op behandelrelevantie

**Vereiste wijziging:**
- AI-filtering: alleen behandelrelevante notities
- Linked evidence: elke zin linkt naar bronnotitie
- UI: "Behandelrelevant" vs "Geen bijzonderheden" secties

**Haalbaarheid:** ⚠️ **Middelmatig**
- AI prompt moet worden uitgebreid met filtering criteria
- Linked evidence vereist tracking van bronnotities per zin
- **Effort:** 1 week

**Risico's:**
- AI filtering accuracy (false negatives = belangrijke info gemist)
- Linked evidence parsing (welke zin komt van welke notitie?)

**Aanbeveling:**
- Start met simpele keyword-based filtering als fallback
- AI filtering als primary, met optie om "alles te tonen"

---

### 2.7 Store Uitbreiding

**Huidige situatie:**
```typescript
interface SwiftStore {
  activePatient: Patient | null;
  activeBlock: BlockType | null;
  prefillData: BlockPrefillData;
  // ... geen chat state
}
```

**Vereiste wijziging:**
```typescript
interface SwiftStore {
  // Bestaand
  activePatient: Patient | null;
  activeBlock: BlockType | null;
  
  // Nieuw: Chat state
  chatMessages: ChatMessage[];
  isStreaming: boolean;
  pendingAction: Action | null;
  
  // Nieuw: Artifact state
  openArtifacts: Artifact[];  // Max 3
  activeArtifactId: string | null;
}
```

**Haalbaarheid:** ✅ **Goed**
- Zustand store is makkelijk uit te breiden
- **Effort:** 2 dagen

---

## 3. Technische Risico's & Uitdagingen

### 3.1 🔴 Hoge Risico's

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| **AI Prompt Engineering** | High | Medical scribe persona moet natuurlijk klinken, maar ook betrouwbaar zijn. Iteratief testen met echte gebruikers. |
| **Performance bij lange conversaties** | Medium | Pagination voor chat history, max 100 messages in view. Virtual scrolling overwegen. |
| **AI Kosten** | Medium | Rate limiting, caching van responses waar mogelijk. Local patterns gebruiken voor snelle acties. |
| **State Management Complexiteit** | Medium | Duidelijke scheiding tussen chat state en artifact state. UseReducer overwegen voor complexe state. |

### 3.2 🟡 Middelmatige Risico's

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| **Responsive Design** | Medium | Mobile: toggle tussen chat en artifact. Tablet: 45/55 split. |
| **Linked Evidence Parsing** | Medium | AI moet structured output geven met bronverwijzingen per zin. Fallback: keyword matching. |
| **Conversatie Context Verlies** | Low | Context manager bewaart actieve patiënt, shift, recente acties. Max 20 messages in API call. |

### 3.3 🟢 Lage Risico's

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| **Block Migratie** | Low | Bestaande blocks blijven werken, alleen wrapper wijzigt. |
| **Voice Input** | Low | Bestaande implementatie blijft werken. |

---

## 4. Migratie Strategie

### 4.1 Fase 1: Foundation (Week 1-2)
- ✅ Split-screen layout implementeren
- ✅ Chat Panel component bouwen
- ✅ Store uitbreiden met chat state
- ✅ Basis chat API endpoint

**Deliverable:** Werkende split-screen met chat (zonder AI)

### 4.2 Fase 2: Chat API & Conversatie (Week 3-4)
- ✅ Medical scribe chat API implementeren
- ✅ Streaming responses
- ✅ Intent detection in conversatie
- ✅ Action object generation

**Deliverable:** Werkende conversatie met artifact opening

### 4.3 Fase 3: Artifact Area (Week 5)
- ✅ Artifact Area component met tabs
- ✅ Meerdere artifacts ondersteuning
- ✅ Slide-in animaties

**Deliverable:** Meerdere artifacts tegelijk mogelijk

### 4.4 Fase 4: AI-Filtering & Polish (Week 6-7)
- ✅ AI-filtering voor psychiater overdracht
- ✅ Linked evidence UI
- ✅ Error handling & edge cases
- ✅ Performance optimalisatie

**Deliverable:** Volledige v3.0 functionaliteit

### 4.5 Fase 5: Testing & Refinement (Week 8)
- ✅ User testing
- ✅ Bug fixes
- ✅ Performance tuning
- ✅ Documentatie

**Deliverable:** Production-ready v3.0

---

## 5. Aanbevelingen

### 5.1 ✅ Doen

1. **Hergebruik bestaande patterns**
   - Kopieer `use-docs-chat.ts` hook als basis voor Swift chat
   - Hergebruik streaming pattern van `/api/docs/chat`

2. **Incrementele migratie**
   - Behoud oude Command Center tijdens ontwikkeling
   - Feature flag voor nieuwe interface
   - A/B testing mogelijkheid

3. **Local-first approach**
   - Gebruik local patterns voor snelle acties (zoals nu)
   - AI alleen voor conversatie en complexe queries

4. **Performance monitoring**
   - Track AI API response times
   - Monitor chat history size
   - Alert bij lange conversaties

### 5.2 ⚠️ Overwegen

1. **Hybrid Intent Detection**
   - Local patterns voor P1 intents (dagnotitie, zoeken)
   - AI chat voor P2 intents en follow-up vragen

2. **Conversation Context Window**
   - Max 20 messages in API call (zoals gespecificeerd)
   - Summarization voor oudere messages

3. **Artifact Persistence**
   - Sla open artifacts op in localStorage
   - Herstel bij page reload

### 5.3 ❌ Niet Doen (YAGNI)

1. **Geen volledige rewrite**
   - Bestaande blocks blijven werken
   - Alleen wrapper en layout wijzigen

2. **Geen nieuwe voice engine**
   - Bestaande Deepgram implementatie is voldoende

3. **Geen real-time collaboration**
   - Niet nodig voor MVP

---

## 6. Conclusie

### Haalbaarheid: ✅ **HAALBAAR**

Het v3.0 redesign is haalbaar binnen 6-8 weken met 1 developer. De bestaande foundation is sterk en kan worden hergebruikt. De grootste uitdagingen zijn:

1. **Chat API ontwikkeling** (1.5 week)
2. **AI prompt engineering** (iteratief, doorlopend)
3. **State management complexiteit** (manageable met Zustand)

### Success Criteria

- [ ] Split-screen layout werkt op desktop/tablet/mobile
- [ ] Conversatie voelt natuurlijk (niet robotisch)
- [ ] Artifacts openen binnen 2 seconden na intent detection
- [ ] AI-filtering voor psychiater heeft >90% accuracy
- [ ] Performance: <500ms voor local patterns, <3s voor AI responses

### Volgende Stappen

1. ✅ **Go/No-Go beslissing** op basis van deze analyse
2. ✅ **Bouwplan v3.0** opstellen met gedetailleerde stories
3. ✅ **Sprint planning** voor Fase 1-5
4. ✅ **AI prompt engineering** starten (parallel met development)

---

## Bijlagen

### A. Bestaande Componenten Overzicht

```
components/swift/
├── command-center/
│   ├── command-center.tsx       ✅ Herbruikbaar (layout wijzigen)
│   ├── context-bar.tsx          ✅ Direct herbruikbaar
│   ├── command-input.tsx        ⚠️ Aanpassen naar chat input
│   ├── canvas-area.tsx          ⚠️ Vervangen door artifact-area
│   └── recent-strip.tsx         ❓ Verwijderen of integreren
├── blocks/
│   ├── dagnotitie-block.tsx     ✅ Direct herbruikbaar
│   ├── zoeken-block.tsx         ✅ Direct herbruikbaar
│   ├── overdracht-block.tsx     ⚠️ Uitbreiden met AI-filtering
│   └── patient-context-card.tsx ✅ Direct herbruikbaar
```

### B. Nieuwe Componenten Overzicht

```
components/swift/
├── chat/                        🆕 Nieuw
│   ├── chat-panel.tsx
│   ├── chat-message.tsx
│   ├── chat-action-link.tsx
│   └── streaming-indicator.tsx
├── artifacts/                   🆕 Nieuw
│   ├── artifact-container.tsx   (wrapper met tabs)
│   └── artifact-tab.tsx
└── shared/                      🆕 Nieuw
    ├── linked-evidence.tsx
    └── relevance-badge.tsx
```

### C. API Routes Overzicht

```
app/api/
├── swift/                       🆕 Nieuw
│   └── chat/
│       └── route.ts             (medical scribe chatbot)
├── intent/
│   └── classify/                ✅ Bestaat (herbruikbaar)
└── overdracht/
    └── generate/                ✅ Bestaat (uitbreiden met filtering)
```

---

**Einde analyse**

