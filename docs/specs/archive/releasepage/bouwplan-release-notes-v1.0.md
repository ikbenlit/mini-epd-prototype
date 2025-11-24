# 🚀 Bouwplan: Release Notes Feature

**Projectnaam:** Release Notes Pagina
**Versie:** v1.0
**Datum:** 19-11-2024
**Auteur:** Colin + AI

---

## 1. Doel en Context

Toevoegen van een dedicated release notes pagina aan de AI Speedrun website om transparantie te bieden over ontwikkelvoortgang. De pagina past in de "build in public" filosofie en biedt:

- **Overzichtspagina** met lijst van alle releases
- **Detail paginas** per week met uitgebreide release notes
- **Sidebar navigatie** (standard software docs stijl)
- **Links vanuit timeline** naar release details

---

## 2. Uitgangspunten

### 2.1 Technische Stack
- **Frontend:** Next.js 15 (bestaand) + TailwindCSS
- **Content:** MDX bestanden in `/content/nl/releases/` met frontmatter
- **Content Parser:** `next-mdx-remote` of `@next/mdx` voor MDX rendering
- **Routing:** `/releases` (overview) + `/releases/[category]` (detail per functionaliteit)
- **Components:** ReleaseSidebar, MDXContent wrapper
- **Layout:** Marketing layout met sidebar
- **Navigatie:** Thematisch op functionaliteit (niet chronologisch op weken)
- **Images:** `/public/releases/[category]/` voor screenshots en visuals

### 2.2 Projectkaders
- **Tijd:** 2-3 uur implementatie
- **Budget:** €0 (bestaande stack)
- **Scope:** MVP - basis release notes zonder fancy features
- **Design:** Standard docs-stijl (links sidebar + content)

### 2.3 Programmeer Uitgangspunten
- **DRY:** Hergebruik bestaande timeline data waar mogelijk
- **KISS:** Simpele layout, geen onnodige animaties
- **SOC:** Content schemas apart, components herbruikbaar
- **Mobile-first:** Horizontal scroll nav op mobile, sidebar op desktop

---

## 3. Epics & Stories Overzicht

| Epic ID | Titel | Doel | Status | Stories | Geschatte tijd |
|---------|-------|------|--------|---------|----------------|
| E1 | Content Schema | Release data structuur | ⏳ | 2 | 30 min |
| E2 | Route Structure | Pages en layouts | ⏳ | 3 | 45 min |
| E3 | Components | Sidebar + content | ⏳ | 2 | 45 min |
| E4 | Integration | Timeline links + nav | ⏳ | 2 | 30 min |

**Totaal geschat:** 2.5 uur

---

## 4. Epics & Stories (Uitwerking)

### Epic 1 — Content Schema

| Story | Beschrijving | Acceptatie | Status |
|-------|--------------|------------|--------|
| E1.S1 | MDX template maken | Release note template met frontmatter + content secties | ⏳ |
| E1.S2 | Content categories definiëren | Logische indeling functionaliteiten (Auth, Dashboard, AI, etc.) | ⏳ |
| E1.S3 | MDX parser setup | next-mdx-remote configureren voor content rendering | ⏳ |

**MDX Template:**
```mdx
---
title: "Authentication & User Management"
category: "authentication"
group: "foundation"
version: "0.1.0"
releaseDate: "2024-11-15"
status: "completed"
description: "Login, signup en password reset functionaliteit"
---

## Overview
Korte beschrijving van wat er is gebouwd in deze release...

## Features

### Login Flow
![Login screenshot](/releases/authentication/login-screen.png)

Beschrijving van de login functionaliteit:
- Email/password login
- Demo account optie
- Error handling

Code voorbeeld (optioneel):
```tsx
const handleLogin = async (email, password) => {
  // implementation
}
```

### Signup Flow
[Details over signup...]

## Technical Notes
- Supabase Auth integratie
- RLS policies voor security
- Client-side validation

## Related Links
- [Timeline Week 1](/timeline#week-1)
- [Database Schema](/docs/schema)
```

**Voorbeeld categorieën:**
- `authentication` - Login, signup, password reset
- `client-management` - CRUD operations voor cliënten
- `dashboard` - EPD dashboard en navigatie
- `ai-features` - AI integraties (samenvatting, classificatie, plannen)
- `infrastructure` - Database, hosting, performance
- `design-system` - UI components en styling

---

### Epic 2 — Route Structure

| Story | Beschrijving | Acceptatie | Status |
|-------|--------------|------------|--------|
| E2.S1 | Layout maken | `app/(marketing)/releases/layout.tsx` met sidebar | ⏳ |
| E2.S2 | Overview page | `app/(marketing)/releases/page.tsx` met lijst (read MDX frontmatter) | ⏳ |
| E2.S3 | Detail pages | `app/(marketing)/releases/[category]/page.tsx` met MDX rendering | ⏳ |

**Structuur:**
```
# Code structuur
app/(marketing)/releases/
├── layout.tsx              # Sidebar wrapper
├── page.tsx               # Overview (lijst van alle MDX files)
├── [category]/
│   └── page.tsx           # MDX content renderer
└── components/
    ├── release-sidebar.tsx
    └── mdx-components.tsx  # Custom components voor MDX

# Content structuur
content/nl/releases/
├── authentication.mdx
├── client-management.mdx
├── dashboard.mdx
├── ai-features.mdx
├── infrastructure.mdx
└── design-system.mdx

# Assets structuur
public/releases/
├── authentication/
│   ├── login-screen.png
│   └── signup-flow.png
├── ai-features/
│   ├── summary-demo.gif
│   └── classification.png
└── ...
```

**URL voorbeelden:**
- `/releases` - Overview alle functionaliteiten (parsed MDX frontmatter)
- `/releases/authentication` - Renders `authentication.mdx`
- `/releases/ai-features` - Renders `ai-features.mdx`
- `/releases/dashboard` - Renders `dashboard.mdx`

---

### Epic 3 — Components

| Story | Beschrijving | Acceptatie | Status |
|-------|--------------|------------|--------|
| E3.S1 | ReleaseSidebar | Fixed sidebar desktop, horizontal scroll mobile, reads MDX files | ⏳ |
| E3.S2 | MDX Components | Custom components voor images, code blocks, callouts | ⏳ |
| E3.S3 | Typography styling | Prose styling voor MDX content (tailwindcss/typography) | ⏳ |

**Features:**
- Sidebar auto-generated from MDX files in `/content/nl/releases/`
- Active state in sidebar
- Mobile-responsive
- Status indicators (completed/in progress/planned) from frontmatter
- Custom MDX components:
  - Images met caption
  - Code blocks met syntax highlighting
  - Callout boxes (info, warning, success)
  - YouTube/video embeds (optional)

---

### Epic 4 — Integration

| Story | Beschrijving | Acceptatie | Status |
|-------|--------------|------------|--------|
| E4.S1 | Timeline links | "Release notes →" link per week in timeline | ⏳ |
| E4.S2 | Nav menu | "Releases" link in header nav | ⏳ |

**Changes:**
- `timeline.tsx`: Add link per week
- `navigation.json`: Add releases link
- Test navigation flow

---

## 5. Design Specs (Compact)

**Layout:**
```
┌────────────────────────────────────────┐
│ Header (existing)                       │
├──────────────┬─────────────────────────┤
│ Sidebar      │ Main Content            │
│              │                         │
│ Overview     │ # Release Notes         │
│ ──────       │                         │
│ Foundation   │ [Category cards...]     │
│ ├─ Auth      │                         │
│ ├─ Database  │                         │
│ Features     │                         │
│ ├─ Dashboard │                         │
│ ├─ Clients   │                         │
│ ├─ AI        │                         │
│ Infrastructure                          │
│ ├─ Hosting   │                         │
│ ├─ Design    │                         │
└──────────────┴─────────────────────────┘
```

**Sidebar structuur (thematisch):**
- **Foundation** (basis setup)
  - Authentication
  - Database & Schema
  - Environment Setup
- **Core Features** (EPD functionaliteit)
  - Dashboard & Navigation
  - Client Management
  - AI Integrations
- **Infrastructure** (ondersteunend)
  - Hosting & Deployment
  - Design System
  - Performance

**Mobile:** Horizontal scroll tabs boven content

**Content styling:**
- `@tailwindcss/typography` plugin voor prose content
- Custom MDX components styled met Tailwind
- Images responsive met captions
- Code blocks met syntax highlighting (shiki/prism)
- Heading anchors voor deep linking

**Colors:**
- Teal accents (consistent met brand)
- Slate backgrounds for code blocks
- White background for main content
- Prose styles voor text readability

---

## 6. Acceptatiecriteria

### Must Have:
- [ ] `/releases` toont overzicht gegroepeerd per categorie
- [ ] `/releases/[category]` toont detail van specifieke functionaliteit
- [ ] Sidebar heeft thematische grouping (Foundation, Features, Infrastructure)
- [ ] Sidebar werkt op desktop (fixed) met collapsible sections
- [ ] Mobile heeft horizontal scroll nav met categorieën
- [ ] Timeline linkt naar relevante release categories
- [ ] "Releases" link in header nav
- [ ] Active states in navigatie

### Nice to Have (later):
- RSS feed
- Search functie
- Filters (features/fixes/improvements)
- Changelog syntax highlighting

---

## 7. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| Content duplicatie met timeline | Middel | Laag | Hergebruik timeline data, extend met extra fields |
| Mobile nav niet intuïtief | Middel | Middel | Test met gebruiker, voeg tooltips toe indien nodig |
| SEO voor individuele releases | Laag | Laag | Metadata per release page toevoegen |

---

## 8. Implementatie Volgorde

1. **E1.S1:** MDX template maken + voorbeeld content
2. **E1.S2:** Categorieën definiëren (authentication, dashboard, ai-features, etc.)
3. **E1.S3:** MDX parser setup (next-mdx-remote of @next/mdx)
4. **E2.S1:** Layout component met sidebar (thematische grouping)
5. **E3.S1:** ReleaseSidebar component (auto-generated from MDX files)
6. **E3.S2:** Custom MDX components (images, code, callouts)
7. **E3.S3:** Typography styling (@tailwindcss/typography)
8. **E2.S2:** Overview page (list van MDX frontmatter)
9. **E2.S3:** Detail page (MDX renderer)
10. **E4.S1:** Timeline integration (link naar relevante categories)
11. **E4.S2:** Navigation update (releases link)

---

## 9. Referenties

**Bestaande Componenten:**
- `app/(marketing)/components/build-timeline.tsx` - Timeline component
- `content/nl/timeline.json` - Timeline data
- `app/(marketing)/layout.tsx` - Marketing layout

**Design Inspiratie:**
- Next.js docs (https://nextjs.org/docs)
- Vercel changelog (https://vercel.com/changelog)
- Linear releases (https://linear.app/releases)

---

## 10. Versiehistorie

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 19-11-2024 | Colin + AI | Initiële versie - compact bouwplan |
| v1.1 | 19-11-2024 | Colin + AI | Update: thematische indeling ipv chronologisch |
| v1.2 | 19-11-2024 | Colin + AI | Update: MDX/Markdown content ipv JSON/cards |
