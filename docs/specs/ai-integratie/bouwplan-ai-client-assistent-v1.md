# Bouwplan — AI Cliënt Assistent

**Projectnaam:** Mini-ECD – AI Cliënt Assistent
**Versie:** v1.0
**Datum:** 01-12-2025
**Auteur:** Colin Lit

---

## 1. Doel en context

**Doel:** Uitbreiding van de bestaande AI Documentatie Assistent met cliënt-awareness. Wanneer een behandelaar in een cliëntdossier zit, kan de assistent vragen beantwoorden over díe specifieke cliënt.

**Aanleiding:** Behandelaren besteden veel tijd aan het navigeren door verschillende schermen om informatie over een cliënt te verzamelen. Bij een overdracht of voorbereiding op een consult moeten zij rapportages doorbladeren, risico-assessments opzoeken, behandeladviezen teruglezen en screeningresultaten checken.

**Referenties:**
- PRD: `docs/specs/ai-integratie/prd-ai-client-assistent-v1.md`
- FO: `docs/specs/ai-integratie/fo-ai-client-assistent-v1.md`
- TO: `docs/specs/ai-integratie/to-ai-client-assistent-v1.md`

---

## 2. Uitgangspunten

### 2.1 Technische Stack
- **Frontend:** Next.js 15 + React + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL) met RLS
- **AI/ML:** Claude claude-sonnet-4-20250514 (Anthropic)
- **Hosting:** Vercel
- **Auth:** Supabase Auth
- **Streaming:** Server-Sent Events (SSE)

### 2.2 Projectkaders
- **Bouwtijd:** ~8-12 uur (MVP)
- **Team:** 1 developer
- **Data:** Bestaande demo-data (21 rapportages, 9 intakes, 5 screenings)
- **Doel:** Werkende cliënt-aware chat in bestaande docs-chat widget

### 2.3 Bestaande Infrastructuur (Hergebruik)
| Component | Status | Hergebruik |
|-----------|--------|------------|
| DocsChatWidget | ✅ Compleet | ~80% |
| Streaming (SSE) | ✅ Werkt | 100% |
| PatientContext | ✅ Werkt | 100% |
| Rate limiting | ✅ Werkt | 100% |
| Chat suggestions | ✅ Werkt | Uitbreiden |
| `/api/reports` | ✅ Bestaat | Direct bruikbaar |
| `/api/intakes` | ✅ Bestaat | Direct bruikbaar |
| `/api/screenings` | ✅ Bestaat | Direct bruikbaar |

### 2.4 Programmeer Uitgangspunten
- **DRY:** Hergebruik bestaande docs-chat componenten
- **KISS:** Minimale wijzigingen aan bestaande code
- **SOC:** Nieuwe modules in `lib/docs/` voor client-specifieke logica
- **YAGNI:** Alleen MVP features, geen toekomstige uitbreidingen

---

## 3. Epics & Stories Overzicht

| Epic ID | Titel | Doel | Status | Stories |
|---------|-------|------|--------|---------|
| E1 | Backend Modules | Context loader, detector, prompt builder | ✅ Done | 3 |
| E2 | API Uitbreiding | Chat endpoint uitbreiden met clientId | ✅ Done | 2 |
| E3 | Frontend Uitbreiding | Indicator, suggestions, hook aanpassing | ✅ Done | 3 |
| E4 | Testing & Refinement | Integratie testen, prompt tuning | ✅ Done | 2 |

---

## 4. Epics & Stories (Uitwerking)

### Epic 1 — Backend Modules
**Epic Doel:** Nieuwe modules voor cliënt-context laden, vraagtype detectie en prompt building.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E1.S1 | Client Context Loader | Laadt patient + reports + intakes + screenings uit Supabase | ✅ | — | 3 |
| E1.S2 | Question Type Detector | Detecteert 'client' vs 'documentation' vs 'ambiguous' | ✅ | — | 2 |
| E1.S3 | Client Prompt Builder | Bouwt system prompt met cliënt-context | ✅ | E1.S1 | 2 |

**Technical Notes:**

**E1.S1 - Client Context Loader** (`lib/docs/client-context-loader.ts`)
```typescript
interface ClientContext {
  patient: { name: string; birthDate: string; status: string }
  reports: Array<{ type: string; content: string; date: string }>
  intakes: Array<{ title: string; treatmentAdvice: object; status: string }>
  screening: { requestForHelp: string; decision: string } | null
  riskAssessments: Array<{ type: string; level: string; rationale: string }>
}

// Directe Supabase queries (niet via HTTP voor performance)
// Parallel laden: Promise.all([reports, intakes, screening, risks])
// Laatste 5 rapportages, 3 intakes, 1 screening
```

**E1.S2 - Question Type Detector** (`lib/docs/question-type-detector.ts`)
```typescript
const CLIENT_KEYWORDS = [
  'rapportage', 'risico', 'behandeladvies', 'screening',
  'hulpvraag', 'samenvatting', 'dossier', 'deze cliënt'
]
const DOC_KEYWORDS = [
  'hoe', 'waar', 'wat is', 'tutorial', 'handleiding',
  'functie', 'knop', 'menu', 'systeem', 'epd'
]
// Return: 'client' | 'documentation' | 'ambiguous'
```

**E1.S3 - Client Prompt Builder** (`lib/docs/client-prompt-builder.ts`)
- Strikte regels: alleen beschikbare data, geen hallucinatie
- Geen medisch advies
- Beknopt en professioneel
- Max 4000 tokens context

---

### Epic 2 — API Uitbreiding
**Epic Doel:** Bestaande chat endpoint uitbreiden met cliënt-awareness.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E2.S1 | Request schema uitbreiden | Accepteert optioneel `clientId` parameter | ✅ | E1.S1-S3 | 2 |
| E2.S2 | Routing logica | Bij client-vraag: client prompt, bij doc-vraag: bestaande flow | ✅ | E2.S1 | 3 |

**Technical Notes:**

**E2.S1 - Request Schema** (`app/api/docs/chat/route.ts`)
```typescript
// Huidige schema uitbreiden:
{
  messages: Array<{ role: 'user' | 'assistant', content: string }>,
  userMessage: string,
  clientId?: string  // Nieuw: UUID van actieve patiënt
}
```

**E2.S2 - Routing Logica**
```typescript
// Pseudocode:
const questionType = detectQuestionType(userMessage, !!clientId)

if (questionType === 'client' && clientId) {
  const context = await loadClientContext(clientId)
  const systemPrompt = buildClientPrompt(context, userMessage)
  // Skip ai_events logging (privacy)
} else {
  // Bestaande documentatie flow
  const categories = detectCategories(userMessage)
  const knowledgeSections = await loadKnowledgeSections(categories)
  const systemPrompt = buildSystemPrompt(knowledgeSections)
}
```

---

### Epic 3 — Frontend Uitbreiding
**Epic Doel:** UI aanpassingen voor cliënt-indicator en dynamische suggestions.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E3.S1 | useDocsChat hook uitbreiden | Stuurt clientId mee, exposed hasPatientContext | ✅ | E2.S2 | 2 |
| E3.S2 | Cliënt Indicator | Header toont "Dossier: [Naam]" wanneer in dossier | ✅ | E3.S1 | 1 |
| E3.S3 | Dynamische Suggestions | Cliënt-suggesties in dossier, doc-suggesties daarbuiten | ✅ | E3.S1 | 2 |

**Technical Notes:**

**E3.S1 - Hook Uitbreiding** (`components/docs-chat/use-docs-chat.ts`)
```typescript
import { usePatientContext } from '@/app/epd/components/patient-context'

// In hook:
const { patient } = usePatientContext()

// Bij sendMessage:
body: JSON.stringify({
  messages: recentMessages,
  userMessage,
  clientId: patient?.id  // Meesturen als patient actief
})

// Exposed voor UI:
return {
  ...state,
  hasPatientContext: !!patient,
  patientName: patient?.name?.[0]?.text || null
}
```

**E3.S2 - Cliënt Indicator** (`components/docs-chat/docs-chat-widget.tsx`)
```tsx
{hasPatientContext && patientName && (
  <div className="px-4 py-1 text-xs text-amber-700 bg-amber-50 border-b">
    Dossier: {patientName}
  </div>
)}
```

**E3.S3 - Dynamische Suggestions** (`components/docs-chat/chat-suggestions.tsx`)
```typescript
const CLIENT_SUGGESTION_CATEGORIES = [
  {
    id: 'rapportages',
    label: 'Rapportages',
    icon: 'FileText',
    questions: [
      'Geef een samenvatting van de rapportages',
      'Wat is er de laatste tijd genoteerd?',
      'Zijn er behandeladviezen?',
    ],
  },
  {
    id: 'intake',
    label: 'Intake & Behandeling',
    icon: 'Building2',
    questions: [
      'Wat is het behandeladvies?',
      'Op welke afdeling loopt de intake?',
      'Is de intake afgerond?',
    ],
  },
  {
    id: 'screening',
    label: 'Screening',
    icon: 'ClipboardList',
    questions: [
      'Wat was de hulpvraag?',
      'Wat is de screeningbeslissing?',
      'Is de cliënt geschikt bevonden?',
    ],
  },
]

// Props toevoegen:
interface ChatSuggestionsProps {
  onSelect: (question: string) => void
  disabled?: boolean
  mode?: 'client' | 'documentation'  // Nieuw
}
```

---

### Epic 4 — Testing & Refinement
**Epic Doel:** Integratie testen en prompt verfijning.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E4.S1 | Integratie tests | Happy flows werken voor alle 3 categorieën | ✅ | E3.S3 | 2 |
| E4.S2 | Prompt tuning | AI geeft accurate, beknopte antwoorden | ✅ | E4.S1 | 2 |

**Test Scenarios:**
1. Open dossier -> chat toont indicator + cliënt-suggesties
2. Vraag "Samenvatting rapportages" -> krijg rapportage overzicht
3. Vraag "Wat is het behandeladvies?" -> krijg intake info
4. Vraag "Hoe maak ik een intake?" -> krijg documentatie antwoord
5. Buiten dossier -> chat toont doc-suggesties

---

## 5. Kwaliteit & Testplan

### Acceptatiecriteria (uit PRD)
| Criterium | Target |
|-----------|--------|
| Cliënt correct herkend | 100% (via URL/PatientContext) |
| Vraagtype correct | >90% correcte classificatie |
| Eerste token | < 3 seconden |
| Context laden | < 200ms |
| Data-integriteit | Alleen data van actieve cliënt |

### Test Checklist
- [ ] Cliënt-indicator toont correcte naam in dossier
- [ ] Cliënt-suggesties verschijnen in dossier
- [ ] Doc-suggesties verschijnen buiten dossier
- [ ] Vraag over rapportages geeft correcte samenvatting
- [ ] Vraag over risico's toont "geen data" (0 rows)
- [ ] Doc-vraag vanuit dossier werkt normaal
- [ ] Rate limiting werkt nog steeds
- [ ] Streaming werkt nog steeds

---

## 6. Bestanden Overzicht

### Te wijzigen
| Bestand | Wijziging |
|---------|-----------|
| `app/api/docs/chat/route.ts` | clientId parameter, routing logica |
| `components/docs-chat/use-docs-chat.ts` | PatientContext integratie |
| `components/docs-chat/chat-suggestions.tsx` | mode prop, client categories |
| `components/docs-chat/docs-chat-widget.tsx` | Cliënt indicator |

### Nieuw aan te maken
| Bestand | Doel |
|---------|------|
| `lib/docs/client-context-loader.ts` | Laadt cliëntdata uit Supabase |
| `lib/docs/question-type-detector.ts` | Detecteert vraagtype |
| `lib/docs/client-prompt-builder.ts` | Bouwt AI prompt met context |

### Referentie (te lezen)
| Bestand | Waarom |
|---------|--------|
| `app/epd/components/patient-context.tsx` | PatientContext API |
| `lib/docs/prompt-builder.ts` | Bestaande prompt structuur |
| `lib/docs/knowledge-loader.ts` | Bestaande knowledge loading |

---

## 7. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| AI hallucineert informatie | Middel | Hoog | Strikte prompt: "alleen beschikbare data" |
| Geen risk_assessments data | Zeker | Laag | "Geen data" response (feature, niet bug) |
| Token overflow | Laag | Middel | Truncatie met limit (4000 tokens) |
| Verkeerde cliëntdata | Laag | Kritiek | clientId uit PatientContext (betrouwbaar) |
| Performance degradatie | Laag | Middel | Parallel queries, geen HTTP overhead |

---

## 8. Geschatte Doorlooptijd

| Epic | Schatting |
|------|-----------|
| E1 - Backend Modules | 3-4 uur |
| E2 - API Uitbreiding | 2-3 uur |
| E3 - Frontend Uitbreiding | 2-3 uur |
| E4 - Testing & Refinement | 1-2 uur |
| **Totaal** | **8-12 uur** |

---

## Versiehistorie

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 01-12-2025 | Colin Lit | Initiële versie op basis van PRD/FO/TO |
| v1.1 | 02-12-2025 | Colin Lit | E1 (Backend Modules) afgerond, E2 gestart |
