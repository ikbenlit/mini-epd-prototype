# Mission Control — Bouwplan Behandelplan Module

**Projectnaam:** Mini-EPD Prototype - Behandelplan Module
**Versie:** v1.0
**Datum:** 03-12-2024
**Auteur:** Colin Lit

---

## 1. Doel en context

**Doel:**
Een werkende MVP Behandelplan module bouwen die demonstreert hoe AI:
- **Tijdsbesparing** realiseert: van 30+ minuten naar 2-5 minuten
- **Kwaliteitsverbetering** biedt: SMART-doelen, evidence-based interventies
- **Transparantie** creëert: cliënt kan eigen plan begrijpen (B1-taal)
- **Praktische workflow** ondersteunt: intake → diagnose → behandelplan

**Context:**
Deze module is onderdeel van de AI Speedrun LinkedIn Serie. Het prototype demonstreert AI-toegevoegde waarde voor zorgprofessionals, product owners en developers.

**Gerelateerde documenten:**
- [PRD Behandelplan v2.0](./prd-behandelplan-v2-final.md)
- [FO Behandelplan v1.0](./fo-behandelplan-v1.md)
- [TO Behandelplan v1.0](./to-behandelplan-v1.md)

---

## 2. Uitgangspunten

### 2.1 Technische Stack

| Component | Technologie | Status |
|-----------|-------------|--------|
| **Frontend** | Next.js 14.2 + TailwindCSS + shadcn/ui | ✅ Bestaand |
| **Backend** | Next.js API Routes + Server Actions | ✅ Bestaand |
| **Database** | Supabase PostgreSQL + RLS | ✅ Bestaand |
| **AI/ML** | Claude 3.5 Sonnet (Anthropic) | ✅ Bestaand |
| **Hosting** | Vercel | ✅ Bestaand |
| **Auth** | Supabase Auth | ✅ Bestaand |
| **Icons** | Lucide React | ✅ Bestaand |
| **Editor** | TipTap | ✅ Bestaand |
| **Validation** | Zod | ✅ Bestaand |
| **Charts** | Recharts | ⏳ Stretch goal |

### 2.2 Projectkaders

| Kader | Waarde |
|-------|--------|
| **Tijd** | 14-19 uur bouwtijd voor MVP |
| **Budget** | €0 extra (bestaande API keys) |
| **Team** | 1 developer + AI assistentie |
| **Data** | Fictieve demo-data (geen productiegegevens) |
| **Doel** | Werkende demo voor LinkedIn serie |

### 2.3 Gekozen Aanpak

- **Foundation first**: Types en database migraties eerst, dan UI
- **Simpele visualisatie**: Progress bars i.p.v. radar chart (stretch)
- **Simple JSON**: Geen streaming, enkele API call met loading state

### 2.4 Programmeer Uitgangspunten

**Code Quality Principles:**

- **DRY (Don't Repeat Yourself)**
  - Herbruikbare leefgebieden componenten
  - Centrale types voor behandelplan structuur
  - Utility functions voor score berekeningen

- **KISS (Keep It Simple, Stupid)**
  - Simple JSON API (geen streaming complexity)
  - Progress bars i.p.v. radar chart
  - Bestaande UI patterns hergebruiken

- **SOC (Separation of Concerns)**
  - Types in `/lib/types/behandelplan.ts`
  - AI prompts in `/lib/ai/behandelplan-prompt.ts`
  - Server actions in `/app/epd/patients/[id]/behandelplan/actions.ts`
  - UI components in `/components/behandelplan/`

- **YAGNI (You Aren't Gonna Need It)**
  - Geen versie-diff view (stretch)
  - Geen real-time collaboration
  - Geen notificaties/reminders

**Development Practices:**

- **Error Handling**
  - Try-catch op alle AI calls
  - Fallback naar manual mode bij AI failure
  - User-friendly foutmeldingen

- **Security**
  - ANTHROPIC_API_KEY in environment
  - RLS policies op care_plans
  - Zod validation op alle inputs

- **Performance**
  - AI response < 8 seconden
  - Skeleton loaders tijdens generatie
  - Optimistic updates voor status

---

## 3. Epics & Stories Overzicht

| Epic ID | Titel | Doel | Status | Stories | Geschat |
|---------|-------|------|--------|---------|---------|
| E0 | Foundation | Types, database schema | ✅ Done | 3 | 2-3 uur |
| E1 | Leefgebieden | Intake formulier + score weergave | ✅ Done | 3 | 3-4 uur |
| E2 | AI Generatie | Claude API endpoint + prompts | ✅ Done | 3 | 3-4 uur |
| E3 | Behandelplan UI | Pagina + componenten | ⏳ To Do | 5 | 6-8 uur |
| E4 | Stretch | Micro-regeneratie, radar chart | ⏳ Optioneel | 3 | 3-5 uur |

**Totaal MVP (E0-E3):** 14-19 uur
**Totaal met Stretch:** 17-24 uur

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 — Foundation (Types & Database)

**Epic Doel:** Solide basis met TypeScript types en database schema uitbreiding.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E0.S1 | Leefgebieden types maken | `lib/types/leefgebieden.ts` met LifeDomain, LifeDomainScore types | ✅ | — | 1 |
| E0.S2 | Behandelplan types maken | `lib/types/behandelplan.ts` met SmartGoal, Intervention, GeneratedPlan types + Zod schemas | ✅ | E0.S1 | 2 |
| E0.S3 | Database migratie | `care_plans` uitgebreid met version, behandelstructuur, evaluatiemomenten; `intakes` met life_domains | ✅ | E0.S2 | 2 |

**Technical Notes:**
```typescript
// lib/types/leefgebieden.ts
export type LifeDomain = 'dlv' | 'wonen' | 'werk' | 'sociaal' | 'vrijetijd' | 'financien' | 'gezondheid'

export interface LifeDomainScore {
  domain: LifeDomain
  baseline: number      // 1-5
  current: number       // 1-5
  target: number        // 1-5
  notes: string
  priority: 'laag' | 'middel' | 'hoog'
}
```

**Deliverables:**
- [x] `lib/types/leefgebieden.ts`
- [x] `lib/types/behandelplan.ts`
- [x] Database migratie via Supabase MCP (cloud-only, geen lokale instantie)
- [x] Gegenereerde database types via `mcp__supabase__generate_typescript_types`

---

### Epic 1 — Leefgebieden Componenten

**Epic Doel:** Formulier voor intake + visuele weergave van scores.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E1.S1 | Leefgebieden formulier | 7 sliders (1-5), toelichting velden, prioriteit dropdowns | ✅ | E0.S3 | 3 |
| E1.S2 | Leefgebieden scores weergave | 7 progress bars met kleuren, baseline vs current indicator | ✅ | E0.S1 | 2 |
| E1.S3 | Leefgebieden badge component | Gekleurde tag per domein met emoji | ✅ | E0.S1 | 1 |

**Technical Notes:**
```typescript
// Kleuren per leefgebied
const DOMAIN_COLORS = {
  dlv: '#8b5cf6',        // paars
  wonen: '#ec4899',      // roze
  werk: '#f59e0b',       // oranje
  sociaal: '#3b82f6',    // blauw
  vrijetijd: '#10b981',  // groen
  financien: '#eab308',  // geel
  gezondheid: '#ef4444', // rood
}
```

**Deliverables:**
- [x] `components/behandelplan/leefgebieden-form.tsx`
- [x] `components/behandelplan/leefgebieden-scores.tsx`
- [x] `components/behandelplan/leefgebieden-badge.tsx`
- [x] `components/behandelplan/index.ts` (exports)

---

### Epic 2 — AI Generatie

**Epic Doel:** Claude API endpoint voor behandelplan generatie.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E2.S1 | Prompt engineering | System prompt + user prompt templates, evidence-based mapping | ✅ | E0.S2 | 2 |
| E2.S2 | Generate endpoint | `POST /api/behandelplan/generate` retourneert JSON, < 8 sec response | ✅ | E2.S1 | 3 |
| E2.S3 | AI event logging | Calls loggen naar `ai_events` tabel | ✅ | E2.S2 | 1 |

**Technical Notes:**
```typescript
// Prompt structuur
const messages = [
  { role: 'system', content: BEHANDELPLAN_SYSTEM_PROMPT },
  { role: 'user', content: buildUserPrompt(context) },
];

// AI settings
const settings = {
  model: 'claude-3-5-sonnet-20240620',
  max_tokens: 4096,
  temperature: 0.3,  // Consistent maar niet robotisch
};
```

**Deliverables:**
- [x] `lib/ai/behandelplan-prompt.ts`
- [x] `lib/ai/intervention-mapping.ts`
- [x] `app/api/behandelplan/generate/route.ts`

---

### Epic 3 — Behandelplan UI

**Epic Doel:** Werkende behandelplan pagina met alle componenten.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E3.S1 | Behandelplan pagina | Placeholder vervangen, data loading, status weergave | ⏳ | E2.S2 | 2 |
| E3.S2 | Generate button + flow | Button triggert AI, loading state, resultaat weergave | ⏳ | E3.S1 | 2 |
| E3.S3 | SMART doelen sectie | Goal cards met progress, status, leefgebied badge | ⏳ | E3.S1, E1.S3 | 3 |
| E3.S4 | Interventies sectie | Intervention cards met gekoppelde doelen | ⏳ | E3.S3 | 2 |
| E3.S5 | Server actions | Create, update, delete, publish behandelplan | ⏳ | E3.S1 | 2 |

**Technical Notes:**
```
/app/epd/patients/[id]/behandelplan/
├── page.tsx              # Server component
├── actions.ts            # Server actions
└── components/
    ├── behandelplan-view.tsx
    ├── generate-button.tsx
    ├── goals-section.tsx
    ├── goal-card.tsx
    └── interventions-section.tsx
```

**Deliverables:**
- [ ] `app/epd/patients/[id]/behandelplan/page.tsx` (vervangen)
- [ ] `app/epd/patients/[id]/behandelplan/actions.ts`
- [ ] `components/behandelplan/behandelplan-view.tsx`
- [ ] `components/behandelplan/generate-button.tsx`
- [ ] `components/behandelplan/goals-section.tsx`
- [ ] `components/behandelplan/goal-card.tsx`
- [ ] `components/behandelplan/interventions-section.tsx`

---

### Epic 4 — Stretch Goals (Optioneel)

**Epic Doel:** Extra features indien tijd beschikbaar.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | SP |
|----------|--------------|---------------------|--------|------------------|----|
| E4.S1 | Micro-regeneratie | Per doel [↻] knop, modal met instructie, nieuw voorstel | ⏳ | E3.S3 | 3 |
| E4.S2 | Radar chart | Recharts installeren, 3-lijn spindiagram | ⏳ | E1.S2 | 3 |
| E4.S3 | Sessie-planning | Tabel met 8-12 sessies, status per sessie | ⏳ | E3.S1 | 2 |

**Technical Notes:**
- Recharts: `pnpm add recharts`
- Regenerate endpoint: `POST /api/behandelplan/regenerate-section`

---

## 5. Kwaliteit & Testplan

### Test Types

| Test Type | Scope | Tools | Status |
|-----------|-------|-------|--------|
| Unit Tests | Types, utilities | Vitest | ⏳ Nice to have |
| Integration | API endpoints | Manual + curl | ✅ Required |
| Smoke Tests | Happy flow | Manual checklist | ✅ Required |
| Performance | AI response time | Network tab | ✅ Required |

### Manual Test Checklist (Demo)

**Pre-conditions:**
- [ ] Patient bestaat met intake data
- [ ] Diagnose/probleemprofiel is ingevuld
- [ ] Leefgebieden scores zijn ingevuld

**Happy Flow:**
- [ ] Behandelplan pagina laadt zonder errors
- [ ] "Genereer Behandelplan" knop is zichtbaar
- [ ] AI genereert plan binnen 8 seconden
- [ ] 2-4 SMART doelen worden getoond
- [ ] Doelen hebben leefgebied badges
- [ ] Interventies zijn gekoppeld aan doelen
- [ ] B1-taal versie is beschikbaar per doel
- [ ] Plan kan worden opgeslagen
- [ ] Status kan worden gewijzigd (concept → actief)

**Error Scenarios:**
- [ ] Geen intake data → "Vul eerst intake in" melding
- [ ] AI API error → "AI niet beschikbaar" melding + retry optie
- [ ] Validatie error → Inline error messages

---

## 6. Demo & Presentatieplan

### Demo Scenario

**Duur:** 5-7 minuten
**Doelgroep:** LinkedIn audience (product owners, developers, zorgprofessionals)

**Flow:**

1. **Context** (30 sec)
   - "Behandelplan schrijven kost 30+ minuten"
   - "AI kan dit reduceren naar 2-5 minuten"

2. **Leefgebieden invullen** (1 min)
   - Toon 7 domeinen met sliders
   - Prioriteiten instellen
   - Opslaan

3. **AI Generatie** (2 min)
   - Klik op "Genereer Behandelplan"
   - Toon loading state met timer
   - Resultaat verschijnt (< 5 sec)

4. **Resultaat bekijken** (2 min)
   - SMART doelen met leefgebied tags
   - B1-taal versie voor cliënt
   - Evidence-based interventies
   - Behandelstructuur

5. **Aanpassen** (1 min)
   - Doel bewerken
   - Status wijzigen
   - Publiceren

**Key Highlights:**
- Tijdsbesparing: 30 min → 5 min
- Kwaliteit: SMART-criteria automatisch
- Transparantie: B1-taal voor cliënt

---

## 7. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| AI genereert invalide JSON | Middel | Hoog | Zod validation, retry (2x), fallback message | Dev |
| AI response > 8 seconden | Laag | Middel | Timeout handling, loading feedback | Dev |
| Leefgebieden UI te complex | Middel | Middel | Simpele sliders, geen radar chart (MVP) | Dev |
| Database migratie faalt | Laag | Hoog | Test lokaal eerst, rollback script | Dev |
| Prompt geeft slechte output | Middel | Hoog | Itereren op prompt, few-shot examples | Dev |
| Scope creep | Hoog | Middel | Strikte MVP scope, stretch als optioneel | Dev |

---

## 8. Implementatie Volgorde

```
Week 1 (14-19 uur totaal)
├── Dag 1: E0 - Foundation (2-3 uur)
│   ├── E0.S1: Leefgebieden types
│   ├── E0.S2: Behandelplan types
│   └── E0.S3: Database migratie
│
├── Dag 2: E1 - Leefgebieden (3-4 uur)
│   ├── E1.S1: Formulier component
│   ├── E1.S2: Scores weergave
│   └── E1.S3: Badge component
│
├── Dag 3: E2 - AI Generatie (3-4 uur)
│   ├── E2.S1: Prompt engineering
│   ├── E2.S2: Generate endpoint
│   └── E2.S3: Event logging
│
└── Dag 4-5: E3 - UI (6-8 uur)
    ├── E3.S1: Behandelplan pagina
    ├── E3.S2: Generate button
    ├── E3.S3: Doelen sectie
    ├── E3.S4: Interventies sectie
    └── E3.S5: Server actions

Optioneel (indien tijd):
└── E4 - Stretch Goals
    ├── E4.S1: Micro-regeneratie
    ├── E4.S2: Radar chart
    └── E4.S3: Sessie-planning
```

---

## 9. Referenties

### Mission Control Documents
- **PRD** — [prd-behandelplan-v2-final.md](./prd-behandelplan-v2-final.md)
- **FO** — [fo-behandelplan-v1.md](./fo-behandelplan-v1.md)
- **TO** — [to-behandelplan-v1.md](./to-behandelplan-v1.md)
- **UX/UI** — [ux-stylesheet.md](../ux-stylesheet.md)

### Bestaande Code
- API pattern: `/app/api/reports/classify/route.ts`
- Server actions: `/app/epd/patients/[id]/intakes/[intakeId]/actions.ts`
- Types pattern: `/lib/types/report.ts`
- AI integration: `/app/api/docs/chat/route.ts`

### External Resources
- Repository: `github.com/[org]/15-mini-epd-prototype`
- Anthropic Docs: https://docs.anthropic.com/claude/reference
- Supabase Docs: https://supabase.com/docs

---

## 10. Glossary & Abbreviations

| Term | Betekenis |
|------|-----------|
| SMART | Specifiek, Meetbaar, Acceptabel, Realistisch, Tijdgebonden |
| B1-taal | Taalniveau begrijpelijk voor algemeen publiek |
| Leefgebieden | 7 levensdomeinen volgens herstelgerichte zorg |
| DSM | Diagnostic and Statistical Manual (diagnose classificatie) |
| RLS | Row Level Security (Supabase) |
| FHIR | Fast Healthcare Interoperability Resources |
| Care Plan | FHIR resource voor behandelplan |
| SP | Story Points |
| MVP | Minimum Viable Product |

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 03-12-2024 | Colin Lit | Initiële versie |
| v1.1 | 04-12-2024 | Colin Lit | Epic 0, 1, 2 afgerond - status bijgewerkt |
