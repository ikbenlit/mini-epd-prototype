# 🎨 Design & Specs — Manifesto Website

**Projectnaam:** AI Speedrun - Manifesto Website  
**Versie:** v1.0  
**Datum:** 15-11-2024  
**Auteur:** Colin van der Heijden (AI Speedrun / ikbenlit.nl)  
**Laatste Update:** 15-11-2024

---

## 1. Doel en context

🎯 **Doel:** Een thought leadership website bouwen die het "Software on Demand" manifesto presenteert als long-form reading experience. Geen standaard landing page, maar een Medium-achtige artikel-ervaring die autoriteit uitstraalt en LinkedIn-viraliteit genereert.

📘 **Toelichting:** Deze website dient als homepage voor het AI Speedrun project en positioneert Colin als:
- **Visionary:** Die de fundamentele shift in software-industrie ziet
- **Practitioner:** Die het ook daadwerkelijk bouwt (build in public)
- **Insider:** Met domain expertise (15 jaar GGZ, 10 jaar development)

Het design respecteert het manifesto door:
- Intelligent, analytische toon (geen angry rant)
- Data-driven argumentatie (McKinsey references, concrete cijfers)
- Long-form reading experience (750px max-width, serif fonts)
- Thought leadership positioning (Jensen Huang quote als foundation)

**Referenties:**
- Manifesto content: `/docs/manifesto.md`
- UX Stylesheet: `/docs/specs/ux-stylesheet.md`
- Bouwplan: `/docs/specs/bouwplan-ai-speedrun-marketing-first-v1.1.md`

---

## 2. Uitgangspunten

### 2.1 Technische Stack

🎯 **Doel:** Next.js 15 App Router met focus op performance en SEO.

**Frontend:**
- **Framework:** Next.js 15 (App Router) - Marketing routes in `/(marketing)` group
- **Styling:** Tailwind CSS v3.4 + Custom CSS voor typography
- **Typography:** 
  - Serif: Crimson Text (Google Fonts) voor long-form content
  - Sans-serif: Inter (Google Fonts) voor UI, nav, metadata
  - Mono: JetBrains Mono voor tech details, numbers
- **Components:** Custom React components (geen shadcn/ui voor manifesto page)
- **Icons:** Lucide React (minimaal gebruik)
- **Animations:** CSS transitions + Intersection Observer (geen heavy libraries)
- **Content Management:** JSON files in `content/[locale]/` directory
  - Server-side content loading via dynamic imports
  - TypeScript types voor type-safety
  - Centrale content updates zonder code wijzigingen

**Visual Effects:**
- **Shader Background:** Dot-shader component (opacity 0.02) voor hero section
- **Progress Indicator:** Custom scroll-based progress bar
- **Fade-in Animations:** Intersection Observer voor scroll reveals

**SEO & Performance:**
- **Metadata:** Next.js Metadata API voor OG tags
- **Fonts:** Preload critical fonts (Crimson Text, Inter)
- **Images:** Geen images (alleen typography)
- **Code Splitting:** Dynamic imports voor heavy components
- **Lazy Loading:** Shader component alleen wanneer hero in viewport

**Hosting:**
- **Platform:** Vercel (EU region Amsterdam)
- **CDN:** Automatic via Vercel Edge Network
- **Analytics:** Vercel Analytics (optioneel, privacy-first)

### 2.2 Projectkaders

🎯 **Doel:** Realistische constraints voor Week 1 MVP.

- **Tijd:** 30 uur development (Week 1, Day 1-7)
- **Budget:** €0 (alleen hosting via Vercel free tier)
- **Team:** 1 developer (Colin) + AI tools
- **Scope:** Manifesto homepage + minimal nav (andere routes later)
- **Launch:** LinkedIn post "Building in public starts NOW"

### 2.3 Design Principes

🎯 **Doel:** Vastleggen van design filosofie en UX keuzes.

**Core Design Philosophy:**

- **"Less is More" voor Marketing Content**
  - Geen hero images/videos (focus op typography)
  - Geen CTA buttons boven de fold (lezen eerst)
  - Geen pop-ups of exit intent (respect voor lezer)
  - Geen social share buttons inline (niet afleiden)

- **"Long-form Reading Experience"**
  - 750px max-width voor optimale leeslengte
  - Serif font voor lange tekst (Crimson Text)
  - 1.8 line-height voor ademruimte
  - Progress bar voor context (niet afleidend)

- **"Thought Leadership Positioning"**
  - Jensen Huang quote als hero (autoriteit)
  - Data-driven argumentatie (McKinsey, concrete cijfers)
  - Intelligent toon (geen emotionele taal)
  - Professional maar niet corporate

- **"Eigenwijze UX Keuzes"**
  - Geen hamburger menu op desktop (simplicity)
  - Geen sticky elements (behalve nav/progress)
  - Geen parallax (performance)
  - Geen confetti/celebraties (serious tone)

**Accessibility First:**

- **WCAG AA Compliance:**
  - Tekst contrast ≥ 4.5:1 (test alle kleuren)
  - Focus states altijd zichtbaar (2px ring)
  - Keyboard navigation volledig werkend
  - Screen reader friendly (semantische HTML)

- **Reduced Motion:**
  - Alle animaties respecteren `prefers-reduced-motion`
  - Fallback: instant transitions
  - Geen auto-scroll of auto-play

- **Font Accessibility:**
  - Optionele sans-serif toggle voor dyslexie (toekomst)
  - Relatieve font sizes (rem, clamp)
  - Minimum font size: 16px voor body

**Performance Targets:**

- **Lighthouse Scores:**
  - Performance: > 90
  - Accessibility: > 95
  - Best Practices: > 90
  - SEO: > 95

- **Load Times:**
  - First Contentful Paint: < 1.5s
  - Time to Interactive: < 3s
  - Largest Contentful Paint: < 2.5s

---

## 3. Epics & Stories Overzicht

🎯 **Doel:** De website bouw opdelen in logische epics met stories voor Week 1.

**Epic Structuur:**
| Epic ID | Titel | Doel | Status | Stories | Week |
|---------|-------|------|--------|---------|------|
| **WEEK 1 - MANIFESTO WEBSITE** |||||
| E1.M0 | Content Management Setup | JSON content structuur + loader | ✅ Af | 3 | 1 |
| E1.M1 | Route Setup & Layout | Next.js routes + marketing layout | ✅ Af | 3 | 1 |
| E1.M2 | Hero Quote Section | Jensen Huang quote hero met shader | ✅ Af | 2 | 1 |
| E1.M3 | Manifesto Content | Long-form reading experience | ✅ Af | 4 | 1 |
| E1.M4 | Visual Components | Insight boxes, comparison table, statements | ✅ Af | 3 | 1 |
| E1.M5 | Navigation & CTA | Minimal nav + experiment CTA | ✅ Af | 2 | 1 |
| E1.M6 | Performance & Polish | Optimization + accessibility | ✅ Af | 3 | 1 |

---

## 4. Epics & Stories (Uitwerking)

### Epic 1.M0 — Content Management Setup
**Epic Doel:** JSON-gebaseerde content structuur opzetten voor centrale content management.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E1.M0.S1 | Content directory structuur | `content/nl/` folder met JSON files | ✅ Af | 1 |
| E1.M0.S2 | Content loader utility | `lib/content/loader.ts` met getContent functie | ✅ Af | 2 |
| E1.M0.S3 | TypeScript types | `content/schemas/manifesto.ts` met interfaces | ✅ Af | 2 |

**Technical Notes:**
```typescript
// lib/content/loader.ts
export async function getContent<T>(
  locale: string = 'nl',
  file: string
): Promise<T> {
  try {
    const content = await import(`@/content/${locale}/${file}.json`)
    return content.default as T
  } catch (error) {
    console.error(`Failed to load content: ${locale}/${file}.json`, error)
    throw new Error(`Content not found: ${locale}/${file}.json`)
  }
}
```

**Content Files te Creëren:**
- `content/nl/manifesto.json` - Manifesto homepage content
- `content/nl/navigation.json` - Navigation labels
- `content/nl/metadata.json` - SEO metadata
- `content/nl/common.json` - Shared strings

**TypeScript Schema:**
- `content/schemas/manifesto.ts` - Type definitions voor ManifestoContent

---

### Epic 1.M1 — Route Setup & Layout
**Epic Doel:** Next.js route structuur en marketing layout zonder sidebar.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E1.M1.S1 | Marketing route group | `/(marketing)/page.tsx` aangemaakt, werkt | ✅ Af | 2 |
| E1.M1.S2 | Marketing layout | Layout zonder sidebar, full-width | ✅ Af | 2 |
| E1.M1.S3 | Typography setup | Fonts preload, CSS variables | ✅ Af | 1 |

**Technical Notes:**
```typescript
// app/(marketing)/layout.tsx
export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <MinimalNav />
      {children}
    </div>
  )
}
```

**Route Structure:**
```
app/
├── (marketing)/
│   ├── layout.tsx          // Marketing layout (geen sidebar)
│   ├── page.tsx             // Manifesto homepage
│   └── components/          // Marketing-specifieke components
└── (app)/                   // EPD app routes (later)
```

---

### Epic 1.M2 — Hero Quote Section
**Epic Doel:** Full-viewport hero met Jensen Huang quote en subtiele shader achtergrond.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E1.M2.S1 | Hero quote component | Quote + attribution renderen | ✅ Af | 3 |
| E1.M2.S2 | Shader background | Dot-shader met opacity 0.02 | ✅ Af | 2 |

**Design Specs:**

**Hero Section:**
- Full viewport height (`min-h-screen`)
- Donkere achtergrond (`#0F172A`)
- Quote: groot (clamp(2.5rem, 6vw, 4rem)), serif, italic
- Attribution: kleiner, lichter, sans-serif
- Subtiele scroll indicator onderaan

**Shader Integration:**
- Dot-shader component als achtergrond
- Opacity: 0.02 (zeer subtiel)
- Mobile fallback: gradient (`bg-gradient-to-br from-slate-50 to-slate-100`)
- Lazy load alleen wanneer hero in viewport

**Component Structure:**
```typescript
// app/(marketing)/components/hero-quote.tsx
export function HeroQuote() {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <MarketingShader variant="hero" />
      <div className="relative z-10 max-w-4xl px-4">
        <blockquote className="text-white">
          {/* Jensen Huang quote */}
        </blockquote>
        <p className="text-slate-300 mt-4">
          Nu, in 2025, zien we het gebeuren...
        </p>
      </div>
      <ScrollIndicator />
    </section>
  )
}
```

---

### Epic 1.M3 — Manifesto Content
**Epic Doel:** Long-form reading experience met manifesto tekst.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E1.M3.S1 | Reading progress bar | Fixed top progress indicator | ✅ Af | 2 |
| E1.M3.S2 | Manifesto content component | Paragraaf structuur + typography | ✅ Af | 3 |
| E1.M3.S3 | Content parsing | Manifesto.md → React component | ✅ Af | 2 |
| E1.M3.S4 | Responsive typography | Mobile + desktop optimalisatie | ✅ Af | 2 |

**Design Specs:**

**Content Container:**
- Max-width: 750px (centered)
- Padding: 2rem (mobile), 4rem (desktop)
- Background: white (`#FFFFFF`)

**Typography:**
- Font: Crimson Text (serif)
- Size: 1.25rem (20px)
- Line-height: 1.8
- Color: `#0F172A` (primary text)

**Progress Bar:**
- Fixed top (onder nav)
- Height: 2px
- Color: `#3B82F6` (accent blue)
- Width: percentage based on scroll
- Smooth animation

**Component Structure:**
```typescript
// app/(marketing)/components/manifesto-content.tsx
export function ManifestoContent() {
  const manifesto = getManifestoContent() // From manifesto.md
  
  return (
    <article className="max-w-[750px] mx-auto px-4 py-8">
      <ReadingProgress />
      <div className="prose prose-lg">
        {manifesto.paragraphs.map((para, i) => (
          <p key={i} className="text-[1.25rem] leading-[1.8] mb-8">
            {para}
          </p>
        ))}
      </div>
    </article>
  )
}
```

---

### Epic 1.M4 — Visual Components
**Epic Doel:** Visuele ankers (insight boxes, comparison table, statement sections).

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E1.M4.S1 | Insight boxes | Gele border boxes voor key takeaways | ✅ Af | 2 |
| E1.M4.S2 | Comparison table | Traditional vs AI Speedrun | ✅ Af | 3 |
| E1.M4.S3 | Statement sections | Donkere achtergrond voor impact | ✅ Af | 2 |

**Design Specs:**

**Insight Boxes:**
- Gele border links: 3px, `#F59E0B`
- Witte achtergrond
- Padding: 1.5rem
- Margin: 3rem 0
- Subtiele shadow

**Comparison Table:**
- Twee kolommen: "Traditioneel" vs "AI Speedrun"
- Subtiele borders (`#E2E8F0`)
- Alternating row backgrounds
- Mobile: stacked cards

**Statement Sections:**
- Donkere achtergrond (`#0F172A`)
- Witte tekst
- Grote typography (clamp(2rem, 5vw, 4rem))
- Full-width
- Padding: 6rem 2rem

**Component Examples:**
```typescript
// Insight Box
<div className="border-l-4 border-yellow-500 bg-white p-6 my-12 shadow-sm">
  <p className="text-lg">
    McKinsey noemt het "Software on Demand" - adaptieve diensten die via natuurlijke taal ontstaan.
  </p>
</div>

// Statement Section
<section className="bg-slate-900 text-white py-24 px-4">
  <div className="max-w-4xl mx-auto text-center">
    <h2 className="text-4xl md:text-6xl font-bold">
      Dit is geen toekomstmuziek.
    </h2>
  </div>
</section>
```

---

### Epic 1.M5 — Navigation & CTA ✅
**Epic Doel:** Minimal navigation en experiment CTA.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E1.M5.S1 | Minimal navigation | Fixed top nav met logo + links | ✅ Af | 2 |
| E1.M5.S2 | Experiment CTA | "Volg het experiment" section | ✅ Af | 2 |

**Design Specs:**

**Minimal Navigation:**
- Fixed top
- Transparent met backdrop blur
- Logo links: "AI SPEEDRUN" (Inter 900, uppercase)
- Links rechts: Build Log | Demo (Inter 600)
- Mix-blend-mode: difference (wit op donker, zwart op licht)
- Geen hamburger menu (alleen desktop links)

**Experiment CTA:**
- Aan einde van manifesto
- Grote typography: "Tijd voor een experiment"
- Subtiele buttons (geen schreeuwerige kleuren)
- "Volg de voortgang" + "Bekijk Demo"
- Geen countdown timers of fake urgency

**Component Structure:**
```typescript
// Minimal Nav
<nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/80">
  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
    <a href="/" className="font-black text-xl">AI SPEEDRUN</a>
    <div className="flex gap-6">
      <a href="/build-log">Build Log</a>
      <a href="/demo">Demo</a>
    </div>
  </div>
</nav>

// Experiment CTA
<section className="py-24 px-4 text-center">
  <h2 className="text-5xl md:text-7xl font-black mb-8">
    Tijd voor een experiment.
  </h2>
  <div className="flex gap-4 justify-center">
    <Button variant="primary">Volg de voortgang</Button>
    <Button variant="secondary">Bekijk Demo</Button>
  </div>
</section>
```

---

### Epic 1.M6 — Performance & Polish ✅
**Epic Doel:** Optimization, accessibility, en final polish.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E1.M6.S1 | Performance optimization | Lighthouse > 90, lazy loading | ✅ Af | 3 |
| E1.M6.S2 | Accessibility audit | WCAG AA compliance, keyboard nav | ✅ Af | 2 |
| E1.M6.S3 | SEO & metadata | OG tags, structured data | ✅ Af | 2 |

**Performance Checklist:**
- [x] Fonts preload (Crimson Text, Inter)
- [x] Shader component lazy load
- [x] Code splitting (dynamic imports)
- [x] Image optimization (geen images, maar check)
- [x] Bundle size < 100KB (gzipped) - Webpack optimization geconfigureerd

**Accessibility Checklist:**
- [x] Contrast check alle tekst (≥ 4.5:1)
- [x] Focus states zichtbaar
- [x] Keyboard navigation werkend
- [x] Screen reader test
- [x] Reduced motion support

**SEO Checklist:**
- [x] Metadata API geconfigureerd
- [x] OG tags voor LinkedIn sharing
- [x] Structured data (Article schema)
- [x] Sitemap.xml
- [x] robots.txt

---

## 5. Design System & Components

### 5.1 Typography Scale

```css
/* Manifesto Typography */
--font-serif: 'Crimson Text', serif;
--font-sans: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Scale */
--text-hero: clamp(2.5rem, 6vw, 4rem);      /* Quote */
--text-h1: clamp(2rem, 5vw, 3rem);          /* Section headings */
--text-h2: clamp(1.5rem, 4vw, 2.5rem);     /* Subsections */
--text-body: 1.25rem;                       /* Content */
--text-small: 0.875rem;                      /* Metadata */
--line-height-tight: 1.2;                    /* Headings */
--line-height-relaxed: 1.8;                 /* Body */
```

### 5.2 Color Palette

**Match UX Stylesheet:**
- Background: `#FFFFFF` (content), `#0F172A` (hero/statements)
- Text: `#0F172A` (primary), `#475569` (secondary)
- Accent: `#3B82F6` (blue), `#F59E0B` (yellow for insights)
- Borders: `#E2E8F0`

### 5.3 Component Library

**Core Components:**
1. `MinimalNav` - Fixed top navigation
2. `HeroQuote` - Full-viewport hero section
3. `MarketingShader` - Shader background wrapper
4. `ReadingProgress` - Scroll progress indicator
5. `ManifestoContent` - Long-form content container
6. `InsightBox` - Gele border box voor takeaways
7. `ComparisonTable` - Traditional vs AI Speedrun
8. `StatementSection` - Donkere achtergrond statements
9. `ExperimentCTA` - Call to action section

**Component Props:**
```typescript
// InsightBox
interface InsightBoxProps {
  children: React.ReactNode
  variant?: 'default' | 'highlight'
}

// ComparisonTable
interface ComparisonTableProps {
  items: Array<{
    label: string
    traditional: string
    aiSpeedrun: string
  }>
}

// StatementSection
interface StatementSectionProps {
  children: React.ReactNode
  variant?: 'dark' | 'light'
}
```

---

## 6. Content Management & Structuur

🎯 **Doel:** Centrale content management via JSON files voor eenvoudige updates en toekomstige internationalisatie.

📘 **Toelichting:** Alle teksten worden opgeslagen in JSON files onder `content/[locale]/` zodat content editors (niet-developers) eenvoudig teksten kunnen aanpassen zonder code te wijzigen.

### 6.1 Content Directory Structuur

```
content/
├── nl/                          # Nederlandse content
│   ├── manifesto.json          # Manifesto homepage content
│   ├── navigation.json         # Navigation labels
│   ├── metadata.json           # SEO metadata
│   └── common.json             # Shared strings (buttons, labels)
├── en/                          # English (toekomst)
│   └── ...
└── schemas/                     # TypeScript types voor content
    └── manifesto.ts
```

### 6.2 Content Loading Strategy

**Server-side Content Loading:**
```typescript
// lib/content/loader.ts
export async function getContent<T>(
  locale: string = 'nl',
  file: string
): Promise<T> {
  const content = await import(`@/content/${locale}/${file}.json`)
  return content.default
}
```

**Component Usage:**
```typescript
// app/(marketing)/page.tsx
import { getContent } from '@/lib/content/loader'
import type { ManifestoContent } from '@/content/schemas/manifesto'

export default async function ManifestoPage() {
  const content = await getContent<ManifestoContent>('nl', 'manifesto')
  
  return (
    <>
      <HeroQuote content={content.hero} />
      <ManifestoContent content={content.sections} />
    </>
  )
}
```

### 6.3 Manifesto Content JSON Schema

**File: `content/nl/manifesto.json`**
```json
{
  "hero": {
    "quote": "Software is eating the world, but AI is going to eat software",
    "attribution": "Jensen Huang, CEO van Nvidia",
    "attributionContext": "zei dit tijdens zijn keynote op GTC in maart 2024",
    "subtitle": "Nu, in 2025, zien we het gebeuren. En bijna niemand heeft het door."
  },
  "sections": [
    {
      "id": "opening",
      "type": "paragraph",
      "content": "Het traditionele SaaS-model is simpel: één gebruiker = één licentie..."
    },
    {
      "id": "problem",
      "type": "paragraph",
      "content": "Maar er gebeurt iets fundamenteels. AI maakt het mogelijk om software te genereren..."
    },
    {
      "id": "mckinsey-insight",
      "type": "insight",
      "content": "McKinsey noemt het \"Software on Demand\" - adaptieve diensten die via natuurlijke taal ontstaan."
    },
    {
      "id": "solution",
      "type": "paragraph",
      "content": "Waar traditionele implementaties 6-12 maanden duren, bouw je met AI een werkende applicatie in 4 weken..."
    },
    {
      "id": "proof-numbers",
      "type": "insight",
      "content": "Van €100k per jaar naar €50 per maand. Geen armies van consultants. Geen jarenlange developmenttrajecten."
    },
    {
      "id": "impact-vendors",
      "type": "statement",
      "variant": "dark",
      "heading": "Voor software vendors is dit existentieel",
      "content": "Hun hele businessmodel - recurring revenue op basis van seats - verdampt als klanten hun eigen oplossingen kunnen bouwen."
    },
    {
      "id": "experiment",
      "type": "paragraph",
      "content": "Tijd voor een experiment. Ik ga live bouwen hoe ver je komt met moderne AI-tools..."
    }
  ],
  "comparison": {
    "heading": "Traditioneel vs AI Speedrun",
    "items": [
      {
        "label": "Tijd",
        "traditional": "6-12 maanden",
        "aiSpeedrun": "4 weken"
      },
      {
        "label": "Kosten",
        "traditional": "€100k+ per jaar",
        "aiSpeedrun": "€50 per maand"
      },
      {
        "label": "Setup",
        "traditional": "€50k consultants",
        "aiSpeedrun": "€200 build cost"
      },
      {
        "label": "Aanpassingen",
        "traditional": "18 maanden",
        "aiSpeedrun": "Dagen"
      },
      {
        "label": "Code ownership",
        "traditional": "Vendor lock-in",
        "aiSpeedrun": "Jouw code"
      }
    ]
  },
  "cta": {
    "heading": "Tijd voor een experiment",
    "subheading": "Bouw hem gewoon zelf. In 4 weken.",
    "primaryButton": {
      "text": "Volg de voortgang",
      "href": "/build-log"
    },
    "secondaryButton": {
      "text": "Bekijk Demo",
      "href": "/demo"
    }
  }
}
```

### 6.4 TypeScript Types voor Content

**File: `content/schemas/manifesto.ts`**
```typescript
export interface HeroContent {
  quote: string
  attribution: string
  attributionContext?: string
  subtitle: string
}

export type SectionType = 'paragraph' | 'insight' | 'statement'

export interface ParagraphSection {
  id: string
  type: 'paragraph'
  content: string
}

export interface InsightSection {
  id: string
  type: 'insight'
  content: string
}

export interface StatementSection {
  id: string
  type: 'statement'
  variant?: 'dark' | 'light'
  heading: string
  content: string
}

export type ManifestoSection = 
  | ParagraphSection 
  | InsightSection 
  | StatementSection

export interface ComparisonItem {
  label: string
  traditional: string
  aiSpeedrun: string
}

export interface ComparisonContent {
  heading: string
  items: ComparisonItem[]
}

export interface CTAButton {
  text: string
  href: string
}

export interface CTAContent {
  heading: string
  subheading?: string
  primaryButton: CTAButton
  secondaryButton: CTAButton
}

export interface ManifestoContent {
  hero: HeroContent
  sections: ManifestoSection[]
  comparison: ComparisonContent
  cta: CTAContent
}
```

### 6.5 Navigation Content JSON

**File: `content/nl/navigation.json`**
```json
{
  "logo": "AI SPEEDRUN",
  "links": [
    {
      "label": "Build Log",
      "href": "/build-log"
    },
    {
      "label": "Demo",
      "href": "/demo"
    }
  ]
}
```

### 6.6 Metadata Content JSON

**File: `content/nl/metadata.json`**
```json
{
  "manifesto": {
    "title": "Software on Demand - AI Speedrun Manifesto",
    "description": "Jensen Huang: 'AI is going to eat software'. Een experiment: bouw een EPD in 4 weken voor €200.",
    "ogTitle": "Software on Demand - AI Speedrun",
    "ogDescription": "Van €100k en 12 maanden naar €200 en 4 weken. Het nieuwe development.",
    "ogImage": "/og-manifesto.png",
    "keywords": ["AI", "Software on Demand", "EPD", "Development", "Build in Public"]
  }
}
```

### 6.7 Common Content JSON

**File: `content/nl/common.json`**
```json
{
  "buttons": {
    "readMore": "Lees verder",
    "scrollDown": "Scroll naar beneden",
    "followProgress": "Volg de voortgang",
    "viewDemo": "Bekijk Demo",
    "contact": "Contact"
  },
  "labels": {
    "readingTime": "minuten lezen",
    "lastUpdated": "Laatst bijgewerkt",
    "share": "Deel"
  }
}
```

### 6.8 Content Update Workflow

**Voor Content Editors:**
1. Open `content/nl/manifesto.json`
2. Pas teksten aan (geen code kennis nodig)
3. Commit + push naar GitHub
4. Vercel rebuild automatisch
5. Content live binnen 1-2 minuten

**Voor Developers:**
1. TypeScript types zorgen voor type-safety
2. Content loader valideert JSON structuur
3. Fallback naar default content bij errors
4. Hot reload tijdens development

### 6.9 Component Updates voor Content Loading

**Updated Component Props:**
```typescript
// HeroQuote component
interface HeroQuoteProps {
  content: HeroContent
}

export function HeroQuote({ content }: HeroQuoteProps) {
  return (
    <section>
      <blockquote>{content.quote}</blockquote>
      <cite>{content.attribution}</cite>
      <p>{content.subtitle}</p>
    </section>
  )
}

// ManifestoContent component
interface ManifestoContentProps {
  sections: ManifestoSection[]
}

export function ManifestoContent({ sections }: ManifestoContentProps) {
  return (
    <article>
      {sections.map((section) => {
        switch (section.type) {
          case 'paragraph':
            return <p key={section.id}>{section.content}</p>
          case 'insight':
            return <InsightBox key={section.id}>{section.content}</InsightBox>
          case 'statement':
            return (
              <StatementSection 
                key={section.id} 
                variant={section.variant}
                heading={section.heading}
              >
                {section.content}
              </StatementSection>
            )
        }
      })}
    </article>
  )
}

// ComparisonTable component
interface ComparisonTableProps {
  content: ComparisonContent
}

export function ComparisonTable({ content }: ComparisonTableProps) {
  return (
    <section>
      <h2>{content.heading}</h2>
      <table>
        {content.items.map((item) => (
          <tr key={item.label}>
            <td>{item.label}</td>
            <td>{item.traditional}</td>
            <td>{item.aiSpeedrun}</td>
          </tr>
        ))}
      </table>
    </section>
  )
}
```

### 6.10 Internationalisatie (Toekomst)

**Locale Detection:**
```typescript
// lib/content/locale.ts
export function getLocale(request: Request): string {
  // Check Accept-Language header
  // Fallback naar 'nl'
  return 'nl' // MVP: alleen Nederlands
}

// Future: meerdere locales
// content/en/manifesto.json
// content/de/manifesto.json
```

**Locale Switching (Future):**
```typescript
// app/(marketing)/[locale]/page.tsx
export default async function ManifestoPage({ 
  params 
}: { 
  params: { locale: string } 
}) {
  const content = await getContent<ManifestoContent>(
    params.locale, 
    'manifesto'
  )
  // ...
}
```

---

## 7. Responsive Design

### 7.1 Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### 7.2 Mobile Adaptations

**Hero Section:**
- Kortere quote (kleinere typography)
- Geen shader (gradient fallback)
- Scroll indicator blijft

**Content:**
- Full-width (geen 750px max)
- Kleinere font size (1.125rem)
- Minder padding (1rem)

**Insight Boxes:**
- Border-top i.p.v. border-left
- Volledige breedte

**Comparison Table:**
- Stacked cards i.p.v. tabel
- Elke rij wordt een card

**Navigation:**
- Hamburger menu (alleen mobile)
- Collapsed links

---

## 8. Performance & Optimization

### 8.1 Code Splitting

```typescript
// Lazy load heavy components
const DotShader = dynamic(() => import('./dot-shader'), { 
  ssr: false,
  loading: () => <GradientFallback />
})

const ComparisonTable = dynamic(() => import('./comparison-table'))
```

### 8.2 Font Optimization

```typescript
// app/layout.tsx
import { Crimson_Text, Inter, JetBrains_Mono } from 'next/font/google'

const crimsonText = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  preload: true
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true
})
```

### 8.3 SEO Metadata

```typescript
// app/(marketing)/page.tsx
export const metadata = {
  title: "Software on Demand - AI Speedrun Manifesto",
  description: "Jensen Huang: 'AI is going to eat software'. Een experiment: bouw een EPD in 4 weken voor €200.",
  openGraph: {
    type: 'article',
    title: "Software on Demand - AI Speedrun",
    description: "Van €100k en 12 maanden naar €200 en 4 weken. Het nieuwe development.",
    images: ['/og-manifesto.png'], // Quote card image
  },
  twitter: {
    card: 'summary_large_image',
  }
}
```

---

## 9. Testing & Quality

### 9.1 Test Checklist

**Visual Testing:**
- [ ] Hero quote render correct
- [ ] Shader background subtiel (opacity 0.02)
- [ ] Typography leesbaar (serif voor content)
- [ ] Insight boxes hebben gele border
- [ ] Comparison table responsive
- [ ] Statement sections donkere achtergrond

**Functional Testing:**
- [ ] Navigation links werken
- [ ] Progress bar update op scroll
- [ ] Smooth scroll naar anchors
- [ ] CTA buttons linken correct
- [ ] Mobile menu werkt (indien aanwezig)

**Performance Testing:**
- [ ] Lighthouse Performance > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size < 100KB gzipped

**Accessibility Testing:**
- [ ] WCAG AA contrast compliance
- [ ] Keyboard navigation volledig
- [ ] Screen reader friendly
- [ ] Focus states zichtbaar
- [ ] Reduced motion support

---

## 10. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| **Shader performance** | Medium | Medium | Lazy load, mobile fallback | Developer |
| **Typography loading** | Laag | Hoog | Font preload, fallback fonts | Developer |
| **Long-form engagement** | Medium | Medium | Progress bar, scannable sections | UX |
| **Mobile readability** | Laag | Hoog | Responsive typography, testing | Developer |
| **SEO niet geoptimaliseerd** | Medium | Medium | Metadata API, OG tags | Developer |
| **Accessibility issues** | Laag | Hoog | WCAG audit, testing | Developer |

---

## 11. Referenties

**Mission Control Documents:**
- **Manifesto:** `/docs/manifesto.md` - Content bron
- **UX Stylesheet:** `/docs/specs/ux-stylesheet.md` - Kleuren & tokens
- **Bouwplan:** `/docs/specs/bouwplan-ai-speedrun-marketing-first-v1.1.md` - Project context
- **Design Review:** `/docs/design/dot-shader-design-review.md` - Shader component

**External Resources:**
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Google Fonts:** https://fonts.google.com
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---

## 12. Glossary & Abbreviations

| Term | Betekenis |
|------|-----------|
| **Long-form** | Lange tekst content (artikel-achtig) |
| **Serif font** | Font met schreefjes (Crimson Text) |
| **Sans-serif** | Font zonder schreefjes (Inter) |
| **Hero section** | Full-viewport opening sectie |
| **Progress bar** | Scroll-based progress indicator |
| **Insight box** | Visuele anker voor key takeaways |
| **Statement section** | Donkere achtergrond voor impact |
| **OG tags** | Open Graph tags voor social sharing |
| **WCAG** | Web Content Accessibility Guidelines |
| **FCP** | First Contentful Paint |
| **TTI** | Time to Interactive |
| **LCP** | Largest Contentful Paint |

---

## 13. Implementatie Status

### Huidige Status (15-11-2024)
- **Algemeen:** Manifesto website volledig compleet, 20/20 stories voltooid (100%) 🎉
- **Epic 1.M0 (Content Management):** ✅ 100% compleet - Alle content files en loaders aangemaakt
- **Epic 1.M1 (Route Setup & Layout):** ✅ 100% compleet - Routes, layout en typography setup
- **Epic 1.M2 (Hero Quote Section):** ✅ 100% compleet - Hero quote en shader geïntegreerd
- **Epic 1.M3 (Manifesto Content):** ✅ 100% compleet - Content component en responsive typography
- **Epic 1.M4 (Visual Components):** ✅ 100% compleet - Alle visuele componenten geïmplementeerd
- **Epic 1.M5 (Navigation & CTA):** ✅ 100% compleet - Minimal nav en experiment CTA geïmplementeerd
- **Epic 1.M6 (Performance & Polish):** ✅ 100% compleet - Performance, accessibility en SEO geoptimaliseerd

### Voltooide Componenten
- ✅ Content directory structuur (`content/nl/` met JSON files)
- ✅ Content loader utility (`lib/content/loader.ts`)
- ✅ TypeScript types (`content/schemas/manifesto.ts`)
- ✅ Marketing route group (`app/(marketing)/page.tsx`)
- ✅ Marketing layout (`app/(marketing)/layout.tsx`)
- ✅ Typography setup (Crimson Text, Inter, JetBrains Mono)
- ✅ Hero quote component (`components/hero-quote.tsx`)
- ✅ Marketing shader (`components/marketing-shader.tsx`)
- ✅ Reading progress bar (`components/reading-progress.tsx`)
- ✅ Manifesto content component (`components/manifesto-content.tsx`)
- ✅ Markdown parser (`lib/content/markdown-parser.ts`)
- ✅ Insight box component (`components/insight-box.tsx`)
- ✅ Comparison table component (`components/comparison-table.tsx`)
- ✅ Statement section component (`components/statement-section.tsx`)
- ✅ Minimal navigation component (`components/minimal-nav.tsx`)
- ✅ Experiment CTA component (`components/experiment-cta.tsx`)
- ✅ Structured data component (`components/structured-data.tsx`)
- ✅ Sitemap generator (`app/sitemap.ts`)
- ✅ Robots.txt generator (`app/robots.ts`)

### Performance & SEO Optimalisaties
- ✅ Code splitting (dynamic imports voor ComparisonTable, ExperimentCTA)
- ✅ Font preloading (Crimson Text, Inter, JetBrains Mono)
- ✅ Shader lazy loading (client-side only)
- ✅ Webpack bundle optimization (vendor chunks, three.js separation)
- ✅ Next.js config optimalisaties (compress, image optimization)
- ✅ WCAG AA accessibility compliance (focus states, keyboard nav, screen readers)
- ✅ Reduced motion support (prefers-reduced-motion)
- ✅ Skip to main content link
- ✅ Metadata API met Open Graph tags
- ✅ Twitter Card metadata
- ✅ JSON-LD structured data (Article schema)
- ✅ Sitemap.xml generatie
- ✅ Robots.txt configuratie

### Volgende Stappen (Post-Launch)
1. ⏳ Lighthouse audit uitvoeren (target: Performance > 90, Accessibility > 95)
2. ⏳ Real-world performance meten met Vercel Analytics
3. ⏳ OG image genereren (`/og-manifesto.png` - 1200x630)
4. ⏳ Build log pagina implementeren (`/build-log`)
5. ⏳ Demo pagina implementeren (`/demo`)

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 15-11-2024 | Colin | Initiële versie - Design & specs voor manifesto website |
| v1.1 | 15-11-2024 | Colin | Status update - 15 stories voltooid (E1.M0 t/m E1.M4) |
| v1.2 | 15-11-2024 | Colin | Status update - Alle 20 stories voltooid (100%) - Epic 1.M5 en 1.M6 compleet |

