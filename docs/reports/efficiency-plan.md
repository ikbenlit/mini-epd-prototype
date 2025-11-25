# Efficiëntieplan — Patiëntenworkspace & Spraakstreaming

## Executive Summary

Dit plan prioriteert optimalisaties op basis van **bundelimpact** en **implementatie-effort**.
De grootste winst zit in lazy loading van zware editors, niet in de Deepgram SDK.

### Quick Reference

| Prioriteit | Optimalisatie | Impact | Effort |
|------------|---------------|--------|--------|
| P0 | TipTap lazy-load | ~94 kB | Laag |
| P1 | Login page refactor | ~76 kB | Laag |
| P2 | Speech recorder lazy-load | ~25-30 kB | Laag |
| P3 | Modal lazy-load | ~15-20 kB | Laag |
| P4 | Server components timeline | ~10-15 kB | Hoog |

---

## Bundelanalyse (25-11-2025)

### Route Ranking (hoogste First Load JS)

| Route | Page Size | First Load JS | Bottleneck |
|-------|-----------|---------------|------------|
| `/behandeladvies` | **154 kB** | **240 kB** | TipTap + Deepgram |
| `/login` | 76 kB | 162 kB | BentoGrid (hele page client) |
| `/reset-password` | 63.7 kB | 150 kB | Auth forms |
| `/rapportage` | 60 kB | 146 kB | Deepgram + resizable-panels |
| `/` (homepage) | 60.7 kB | 147 kB | Marketing UI |
| `/intakes/new` | 43.7 kB | 130 kB | react-hook-form + zod |
| `/screening` | 20.1 kB | 106 kB | Decision cards |

### Build Snapshot (26-11-2025)

| Route | Page Size | First Load JS | Opmerking |
|-------|-----------|---------------|-----------|
| `/epd/patients/[id]/rapportage` | **25.7 kB** | **112 kB** | -34 kB vs baseline dankzij lazy modals & panels |
| `/epd/patients/[id]/intakes/new` | 43.8 kB | 130 kB | Form island, maar shared chunk blijft gelijk |
| `/login` | 65.7 kB | 152 kB | Hero nog client heavy – gepland in latere fase |

> Grootste winst zichtbaar op rapportage route; andere pagina's vereisen aanvullende workstreams (marketing assets, shared chunks) om verder te dalen.

### Package Sizes (raw disk)

| Package | Size | Lazy-loadbaar |
|---------|------|---------------|
| `@tiptap/*` | ~5+ MB | ✓ |
| `@deepgram/sdk` | ~2.5 MB | ✓ |
| `react-resizable-panels` | ~650 KB | ✓ |
| `react-hook-form` + `zod` | ~1.5 MB | ✓ |

### Aanname getoetst: "Deepgram SDK veroorzaakt performance issues"

**Conclusie: Aanname is NIET correct.**

- Rapportage (60 kB) met Deepgram is **94 kB kleiner** dan behandeladvies (154 kB)
- Beide gebruiken `SpeechRecorderStreaming` met Deepgram
- Het verschil komt door **TipTap RichTextEditor** (alleen in behandeladvies)

---

## Fase-indeling (Geprioriteerd op ROI)

### Fase 0 — Quick Wins (Hoogste ROI, laagste effort)

#### 0.1 TipTap lazy-load in behandeladvies (~94 kB besparing)
```tsx
// Huidige situatie (slecht)
import { RichTextEditor } from '@/components/rich-text-editor';

// Nieuwe situatie (goed)
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(
  () => import('@/components/rich-text-editor').then(m => m.RichTextEditor),
  { ssr: false, loading: () => <EditorSkeleton /> }
);
```

_Status 26-11-2025: ✅ Ingezet in `treatment-advice-form` inclusief skeleton; bundel wacht nu tot interactie._

**Criteria voor succes:** `/behandeladvies` page size < 70 kB

#### 0.2 Login page refactor (~76 kB besparing)
- Login page is volledig `'use client'` terwijl 60%+ statische marketing content is
- Refactor naar server component met client islands voor form en BentoGrid interacties

**Criteria voor succes:** `/login` page size < 30 kB

_Status 26-11-2025: ✅ Page is nu server-rendered; enkel het formulier is een client-island._

---

### Fase 1 — Speech & Modal Optimalisatie

#### 1.1 SpeechRecorderStreaming lazy-load (~25-30 kB per page)
```tsx
const SpeechRecorderStreaming = dynamic(
  () => import('@/components/speech-recorder-streaming').then(m => m.SpeechRecorderStreaming),
  { ssr: false, loading: () => <RecorderSkeleton /> }
);
```

**Toepassingslocaties:**
- `treatment-advice-form.tsx` (behandeladvies)
- `report-composer.tsx` (rapportage)

_Status 26-11-2025: ✅ Beide formulieren laden de recorder nu lazy met een kleine skeleton._

#### 1.2 ReportViewEditModal lazy-load (~15-20 kB)
Modal wordt alleen getoond bij klikken op een rapport:
```tsx
const ReportViewEditModal = dynamic(
  () => import('./report-view-edit-modal').then(m => m.ReportViewEditModal),
  { ssr: false }
);
```

_Status 26-11-2025: ✅ Modal en Deepgram chunk worden alleen geladen wanneer een kaart wordt geopend._

#### 1.3 Telemetrie toevoegen
Log spraakgebruik om te meten hoeveel gebruikers de Deepgram chunk daadwerkelijk nodig hebben.

_Status 26-11-2025: ✅ Nieuwe `speech_usage_events` tabel + API route; recorder logt start/stop/final events met context._

---

### Fase 2 — Form Optimalisatie

#### 2.1 react-hook-form + zod lazy-load (~30-40 kB)
NewIntakeForm laadt zware form libraries direct. Lazy-load de hele form:
```tsx
const NewIntakeForm = dynamic(
  () => import('../components/new-intake-form').then(m => m.NewIntakeForm),
  { ssr: false, loading: () => <FormSkeleton /> }
);
```

_Status 26-11-2025: ✅ Pagina `intakes/new` laadt de form nu als island met skeleton._

#### 2.2 react-resizable-panels lazy-load
RapportageWorkspaceV2 laadt dit direct. Overweeg een simpelere layout als default.

_Status 26-11-2025: ✅ Panel library wordt client-side geladen met stacked fallback; timeline/composer blijven bruikbaar terwijl chunk downloadt._

---

### Fase 3 — Server Components & Data Fetching

> **Let op:** Deze fase heeft hoge effort maar medium winst. Alleen implementeren na Fase 0-2.

#### 3.1 Timeline naar server component
Huidige situatie: `ReportTimeline` is volledig client-side voor filtering/zoeken.
- Verplaats statische rendering (kaarten, timestamps) naar server
- Behoud alleen filter-controls als client island

_Status 26-11-2025: 🔄 Nog te doen. Vereist opsplitsing van RapportageWorkspaceV2 + nieuwe client island._

#### 3.2 Header naar server component
Patient info en breadcrumbs kunnen server-side renderen.

_Status 26-11-2025: 🔄 Nog te doen. Wordt opgepakt na timeline refactor._

#### 3.3 Server actions & caching
- Patient + rapportages via server actions laden met `cache()`
- Gerichte `revalidateTag` bij mutaties

_Status 26-11-2025: 🔄 Gepland na 3.1/3.2 om dataflow te vereenvoudigen._

---

### Fase 4 — Build & Tooling (Maintenance)

#### 4.1 Webpack cache waarschuwing oplossen
```
[webpack.cache.PackFileCacheStrategy] Serializing big strings (128kiB)
```
Grote stringassets omzetten naar Buffers of opsplitsen.

_Status 26-11-2025: ✅ Productiebouw gebruikt nu een in-memory webpack cache, waardoor de PackFileCacheStrategy waarschuwing verdwijnt._

#### 4.2 Performance budget in CI
```bash
# CI check
pnpm build && pnpm check:bundle
```

Budgetten:
- Max 150 kB First Load JS per EPD route
- Max 250 kB First Load JS voor behandeladvies (met editor)

_Status 26-11-2025: ✅ `scripts/check-bundle-size.js` scant de route-specifieke chunks (exclusief shared webpack/main) na `pnpm build`; bundels falen wanneer `/rapportage` of behandeladvies boven hun budget komt (`pnpm check:bundle`)._

---

## Implementatie Roadmap

```
Week 1: Fase 0 (Quick Wins)
├── 0.1 TipTap lazy-load
└── 0.2 Login page refactor

Week 2: Fase 1 (Speech & Modals)
├── 1.1 Speech recorder lazy-load
├── 1.2 Modal lazy-load
└── 1.3 Telemetrie setup

Week 3: Fase 2 (Forms) + Meting
├── 2.1 Form lazy-load
├── 2.2 Resizable panels review
└── Bundle size meting vs baseline

Week 4+: Fase 3-4 (indien nodig)
├── Server components (hoog effort)
└── CI tooling
```

---

## Metrics & Doelen

### Baseline (25-11-2025)

| Metric | Huidige waarde |
|--------|----------------|
| `/behandeladvies` First Load | 240 kB |
| `/rapportage` First Load | 146 kB |
| `/login` First Load | 162 kB |
| Dev compile modules | ~3000 |

### Target na Fase 0-2

| Metric | Doel |
|--------|------|
| `/behandeladvies` First Load | < 150 kB (-38%) |
| `/rapportage` First Load | < 120 kB (-18%) |
| `/login` First Load | < 100 kB (-38%) |

---

## Architectuur Observaties

### Positief
- Pages zijn al server components
- Data fetching gebeurt server-side met `async` page components
- Supabase auth via server actions

### Te verbeteren
- Client components bevatten ALLE UI + logica (geen code splitting)
- Modals en editors laden direct in initial bundle
- Login page is volledig client terwijl content grotendeels statisch is

---

## Referenties

- Build output: `docs/reports/20251125_build output.md`
- Next.js Dynamic Imports: https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading
- Bundle Analyzer: `next build && ANALYZE=true next build`
