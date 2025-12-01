# Mission Control — Bouwplan AI Documentatie Assistent

**Projectnaam:** Mini-ECD – AI Documentatie Assistent
**Versie:** v1.0
**Datum:** 01-12-2025
**Auteur:** Colin van der Heijden

---

## 1. Doel en context

**Doel:** Een floating chat widget bouwen die eindgebruikers van het EPD helpt door vragen te beantwoorden op basis van de systeemdocumentatie.

**Context:** Dit is de eerste AI-integratie in het Mini-ECD prototype. Het dient als fundament voor toekomstige AI features (zoals AI Pre-fill Behandelplan). De widget maakt documentatie direct toegankelijk via een conversatie-interface.

**Relatie met andere documenten:**
- PRD: `prd-ai-docs-assistent-v1.md` — Wat en waarom
- FO: `fo-ai-docs-assistent-v1.md` — Hoe het werkt voor gebruikers

---

## 2. Uitgangspunten

### 2.1 Technische Stack

| Laag | Technologie |
|------|-------------|
| **Frontend** | Next.js 14.2 + React + Tailwind CSS |
| **Backend** | Next.js API Routes (App Router) |
| **Database** | Supabase PostgreSQL (alleen voor auth check) |
| **AI** | Claude API (claude-sonnet-4-20250514) met streaming |
| **Hosting** | Vercel |
| **Icons** | Lucide React (Sparkles, X, Send) |

### 2.2 Projectkaders

| Aspect | Waarde |
|--------|--------|
| **Bouwtijd** | 1-2 dagen |
| **Team** | 1 developer |
| **Data** | Alleen bestaande MDX documentatie |
| **Scope** | MVP — chat widget met streaming responses |
| **Persistentie** | Sessie-only (geen database opslag) |

### 2.3 Programmeer Uitgangspunten

**Code Quality Principles:**

- **DRY** — Herbruikbare hook voor chat state, centrale prompt configuratie
- **KISS** — Eenvoudige fetch naar Claude API, geen SDK overhead
- **SOC** — UI componenten gescheiden van API logic en knowledge base
- **YAGNI** — Geen RAG, geen database opslag, geen multi-provider support

**Security:**
- API key alleen server-side (Next.js API route)
- Widget alleen voor ingelogde gebruikers
- Geen logging van conversaties

---

## 3. Epics & Stories Overzicht

| Epic ID | Titel | Doel | Status | Stories |
|---------|-------|------|--------|---------|
| E0 | Knowledge Base Content | FAQ's en guidelines in markdown | ✅ Done | 2 |
| E1 | Knowledge Services | CategoryDetector, KnowledgeLoader, PromptBuilder | ✅ Done | 3 |
| E2 | API Endpoint | Streaming Claude integratie | ✅ Done | 1 |
| E3 | Chat UI Components | Widget, messages, input | ✅ Done | 4 |
| E4 | Integratie & Testing | Widget in EPD, testen | ✅ Done | 2 |

**Totaal:** 12 stories, ~18 story points

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 — Knowledge Base Content

**Epic Doel:** Gestructureerde FAQ's en guidelines in markdown bestanden.

| Story ID | Beschrijving | Acceptatiecriteria | Status | SP |
|----------|--------------|---------------------|--------|-----|
| E0.S1 | FAQ markdown bestanden | 6 FAQ bestanden met Q&A per categorie | ✅ | 2 |
| E0.S2 | Guidelines bestanden | 2 guideline bestanden (interface, technisch) | ✅ | 1 |

**Deliverables:**
```
lib/docs/knowledge/
├── faq_clientbeheer.md      # Cliënt aanmaken, zoeken, verwijderen
├── faq_intake.md            # Intake starten, notities, spraak
├── faq_screening.md         # Screening resultaten, vragenlijsten
├── faq_behandelplan.md      # Plan maken, doelen, interventies
├── faq_spraak.md            # Microfoon, dicteren, transcriptie
├── faq_inloggen.md          # Login, wachtwoord, rechten
├── guidelines_interface.md   # UI uitleg, navigatie, menu's
└── guidelines_technisch.md   # FHIR API, data model (devs)
```

---

### Epic 1 — Knowledge Services

**Epic Doel:** Intelligente services voor dynamische knowledge loading.

| Story ID | Beschrijving | Acceptatiecriteria | Status | SP |
|----------|--------------|---------------------|--------|-----|
| E1.S1 | CategoryDetector | Keyword matching om relevante categorieën te bepalen | ✅ | 2 |
| E1.S2 | KnowledgeLoader | Laadt alleen relevante markdown bestanden | ✅ | 2 |
| E1.S3 | PromptBuilder | Combineert base prompt + relevante knowledge | ✅ | 2 |

**Deliverables:**
```
lib/docs/
├── category-detector.ts    # Analyseert vraag → categorieën
├── knowledge-loader.ts     # Laadt relevante knowledge
└── prompt-builder.ts       # Bouwt geoptimaliseerde prompt
```

**Category Mapping:**
```typescript
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  clientbeheer: ['cliënt', 'patient', 'aanmaken', 'zoeken', 'dossier'],
  intake: ['intake', 'gesprek', 'notitie', 'verslag'],
  screening: ['screening', 'vragenlijst', 'score', 'resultaat'],
  behandelplan: ['behandelplan', 'doel', 'interventie', 'plan'],
  spraak: ['spraak', 'microfoon', 'dicteren', 'stem', 'transcriptie'],
  inloggen: ['inloggen', 'wachtwoord', 'login', 'account'],
  interface: ['menu', 'knop', 'scherm', 'navigatie', 'waar vind'],
  technisch: ['api', 'fhir', 'endpoint', 'database', 'developer']
};
```

**Flow:**
```
Vraag: "Hoe maak ik een intake aan?"
         ↓
CategoryDetector → ['intake']
         ↓
KnowledgeLoader → laadt faq_intake.md
         ↓
PromptBuilder → base prompt + intake FAQ
         ↓
Claude API → streaming response
```

---

### Epic 2 — API Endpoint

**Epic Doel:** Streaming API endpoint met dynamische knowledge.

| Story ID | Beschrijving | Acceptatiecriteria | Status | SP |
|----------|--------------|---------------------|--------|-----|
| E2.S1 | Streaming endpoint | `POST /api/docs/chat` met dynamic knowledge, SSE stream | ✅ | 3 |

**Deliverables:**
```
app/api/docs/chat/
  route.ts               # Streaming API endpoint
```

**API Contract:**
```typescript
// Request
POST /api/docs/chat
{
  messages: Array<{ role: 'user' | 'assistant', content: string }>,
  userMessage: string
}

// Response: Server-Sent Events stream
event: content_block_delta
data: {"delta":{"text":"..."}}
```

---

### Epic 3 — Chat UI Components

**Epic Doel:** Complete chat widget UI volgens FO specificaties.

| Story ID | Beschrijving | Acceptatiecriteria | Status | SP |
|----------|--------------|---------------------|--------|-----|
| E3.S1 | Chat state hook | `use-docs-chat.ts` met messages, loading, sendMessage, streaming | ✅ | 2 |
| E3.S2 | Message list component | `chat-messages.tsx` met styling, auto-scroll, streaming cursor | ✅ | 1 |
| E3.S3 | Input component | `chat-input.tsx` met textarea, send, Enter/Shift+Enter | ✅ | 1 |
| E3.S4 | Widget container | `docs-chat-widget.tsx` met trigger, panel, header, animaties | ✅ | 2 |

**Deliverables:**
```
components/docs-chat/
  use-docs-chat.ts       # Custom hook
  chat-messages.tsx      # Message list
  chat-input.tsx         # Input area
  docs-chat-widget.tsx   # Main container
```

**UI Specs (uit FO):**

| Element | Specificatie |
|---------|--------------|
| Trigger button | 56x56px, amber gradient, Sparkles icon, `fixed bottom-6 right-6` |
| Panel | 384px breed, max 80vh, slide-in animatie |
| User messages | Rechts, `bg-amber-100`, rounded |
| Assistant messages | Links, `bg-slate-100`, rounded |
| Streaming | Pulserende cursor `▊` |

---

### Epic 4 — Integratie & Testing

**Epic Doel:** Widget geïntegreerd in EPD en getest.

| Story ID | Beschrijving | Acceptatiecriteria | Status | SP |
|----------|--------------|---------------------|--------|-----|
| E4.S1 | Widget integratie | `DocsChatWidget` in EPD layout, alleen ingelogde users | ✅ | 1 |
| E4.S2 | Smoke tests | Happy flow, error states, category detection werkt | ✅ | 1 |

**Te wijzigen bestand:**
```
app/epd/components/epd-layout-client.tsx
```

---

## 5. Kwaliteit & Testplan

### Test Types

| Test Type | Scope | Methode |
|-----------|-------|---------|
| Unit | Knowledge base loader | Console test |
| Integration | API endpoint | curl/Postman |
| Smoke | Volledige flow | Manual in browser |

### Manual Test Checklist

- [ ] Widget trigger button zichtbaar in EPD
- [ ] Klik opent chat panel met animatie
- [ ] Welkomstbericht wordt getoond
- [ ] Vraag versturen werkt (Enter + button)
- [ ] Streaming response verschijnt woord-voor-woord
- [ ] Vervolgvraag behoudt context
- [ ] X-knop sluit panel
- [ ] Conversatie blijft behouden na sluiten/openen
- [ ] Error state toont bij API failure
- [ ] Widget verdwijnt bij uitloggen

### Acceptatiecriteria (uit PRD)

| Criterium | Target |
|-----------|--------|
| First token | < 2 seconden |
| Volledige response | < 30 seconden |
| Error rate | < 5% |

---

## 6. Demo & Presentatieplan

**Duur:** 3 minuten
**Scenario:**

1. **Intro** (30s): "Dit is de documentatie assistent"
2. **Vraag 1** (45s): "Hoe maak ik een intake aan?" → streaming antwoord
3. **Vraag 2** (45s): "En hoe gebruik ik spraakherkenning?" → context behouden
4. **Edge case** (30s): "Wat is de beste behandeling?" → "weet ik niet" response
5. **Afsluiting** (30s): Widget sluiten, conversatie behouden

---

## 7. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| AI hallucineert | Middel | Hoog | Strikte system prompt, FAQ's eerst, "alleen uit docs" regel |
| Trage response | Laag | Middel | Streaming UX, timeout na 30s |
| Context te groot | Laag | Middel | ~119KB past in context window, monitoring |
| API rate limits | Laag | Middel | Sessie-based (geen caching nodig) |

---

## 8. Referenties

### Mission Control Documents

- **PRD:** `prd-ai-docs-assistent-v1.md`
- **FO:** `fo-ai-docs-assistent-v1.md`
- **Gerelateerd:** `prd-ai-prefill-behandelplan-v1.md`

### Bestaande Code Patterns

| Bestand | Pattern |
|---------|---------|
| `app/api/reports/classify/route.ts` | Claude API fetch pattern |
| `lib/mdx/documentatie.ts` | MDX loading met gray-matter |
| `components/ui/ai-button.tsx` | Amber AI styling |

### Externe Referenties

- [Claude API Docs](https://docs.anthropic.com)
- [Anthropic Streaming](https://docs.anthropic.com/en/api/streaming)

---

## 9. Glossary

| Term | Betekenis |
|------|-----------|
| SSE | Server-Sent Events (streaming protocol) |
| Knowledge Base | Verzameling documentatie voor AI context |
| FAQ | Frequently Asked Questions |
| Streaming | Real-time response, woord-voor-woord |

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 01-12-2025 | Colin van der Heijden | Initiële versie |
