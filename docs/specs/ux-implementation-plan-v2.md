# 🎨 UX Implementation Plan v2.0 - Teal Primary System

**Project:** AI Speedrun - Mini-EPD Prototype
**Versie:** v2.0 (Teal-First Design System)
**Datum:** 17-11-2024
**Auteur:** Colin Lit
**Context:** Showcase voor AI consultancy, niet productie EPD

---

## 1. Strategic Context & Design Rationale

### 1.1 Project Identity (Revised Understanding)

**Wat AI Speedrun ECHT is:**
- AI consultancy portfolio piece (NIET een EPD vendor)
- Technical demonstration van "Software on Demand" (NIET production healthcare tool)
- Build-in-public LinkedIn content machine (NIET end-user product)
- Proof-of-concept voor GGZ innovatiemanagers (NIET voor therapeuten)

**Target Audience:**
- ✅ GGZ innovatiemanagers & bestuurders (decision makers)
- ✅ Tech-savvy stakeholders (CTO's, IT managers)
- ✅ LinkedIn followers (build-in-public audience)
- ✅ Consultancy prospects (potential clients)
- ❌ NIET: Dagelijkse EPD gebruikers (therapeuten, psychologen)

**Business Goal:**
> Demonstrate AI expertise through rapid EPD development (€100k → €200, 12 months → 4 weeks) to attract GGZ consultancy clients.

### 1.2 Why Teal (#0D9488) as Primary Color

**Strategic Reasoning:**

| Criterion | Blue (#3B82F6) | Teal (#0D9488) | Violet (#5B47ED) | Winner |
|-----------|----------------|----------------|------------------|--------|
| **Differentiation** | Blends with traditional EPDs | Distinct but professional | Very bold, might alienate | **Teal** |
| **Innovation Signal** | Conservative, "old guard" | Modern, tech-forward | Cutting-edge, risky | **Teal** |
| **GGZ Appropriateness** | Expected, safe | Healthcare-adjacent, fresh | Too unconventional | **Teal** |
| **LinkedIn Visual Recall** | Generic screenshots | Recognizable brand color | Memorable but polarizing | **Teal** |
| **Demo Context** | Works but boring | Perfect for 10-min showcase | Strong but might distract | **Teal** |
| **Tailwind Integration** | Native (blue-600) | Native (teal-600) | Native (purple-600) | **Tie** |

**Decision:** Teal (#0D9488 / Tailwind teal-600) as primary brand color.

**Rationale:**
1. **Differentiates** from traditional EPD blue-sea (Chipsoft, Epic, Nexus)
2. **Signals innovation** without alienating conservative GGZ sector
3. **Modern aesthetic** (2020s design language, not dated #008080)
4. **LinkedIn-friendly** (visual brand consistency in screenshots)
5. **Tailwind-native** (free design system with teal-50 through teal-900)
6. **Demo-optimized** (visual impact for 10-minute showcases)

**Psychology:** Teal = Innovation + Clarity + Forward-thinking (without purple's "luxury" or blue's "corporate" baggage)

---

## 2. Color System Design

### 2.1 Primary Brand Colors

```css
/* Teal - Primary Brand (Innovation Signal) */
--color-brand-50: #F0FDFA;      /* Subtle backgrounds, hover states */
--color-brand-100: #CCFBF1;     /* Light backgrounds, disabled states */
--color-brand-200: #99F6E4;     /* Borders, dividers */
--color-brand-300: #5EEAD4;     /* Hover borders */
--color-brand-400: #2DD4BF;     /* Active states */
--color-brand-500: #14B8A6;     /* Base teal (lighter variant) */
--color-brand-600: #0D9488;     /* PRIMARY - Main brand color */
--color-brand-700: #0F766E;     /* Hover state for buttons */
--color-brand-800: #115E59;     /* Active state for buttons */
--color-brand-900: #134E4A;     /* Deep variant for text on light bg */
```

**Usage:**
- Primary CTAs (buttons, links)
- Focus states (input fields, interactive elements)
- Navigation highlights (active menu items)
- Brand elements (logo accents, hero sections)
- Timeline dots, progress indicators

### 2.2 AI Features - Amber Highlights

```css
/* Amber - AI Augmentation (Enhancement Signal) */
--color-ai-50: #FFFBEB;         /* Subtle AI suggestion backgrounds */
--color-ai-100: #FEF3C7;        /* AI suggestion panels */
--color-ai-200: #FDE68A;        /* AI highlight borders */
--color-ai-300: #FCD34D;        /* Hover states */
--color-ai-400: #FBBF24;        /* AI inline highlights */
--color-ai-500: #F59E0B;        /* PRIMARY - AI actions */
--color-ai-600: #D97706;        /* Hover state */
--color-ai-700: #B45309;        /* Active state */
--color-ai-800: #92400E;        /* Dark text on light bg */
--color-ai-900: #78350F;        /* Deep variant */
```

**Usage:**
- AI action buttons (gradient from-amber-500 to-amber-400)
- AI processing states (shimmer animations)
- AI suggestion badges ("AI" icon + amber glow)
- Inline AI highlights (selected text suggestions)

### 2.3 Neutral Base - Slate

```css
/* Slate - Professional Foundation */
--color-bg-app: #F8FAFC;        /* slate-50 - Main app background */
--color-surface: #FFFFFF;       /* White - Cards, panels */
--color-surface-secondary: #F1F5F9;  /* slate-100 - Secondary surfaces */

--color-border-subtle: #F1F5F9; /* slate-100 - Very subtle borders */
--color-border: #E2E8F0;        /* slate-200 - Default borders */
--color-border-strong: #CBD5E1; /* slate-300 - Emphasized borders */

--color-text-primary: #0F172A;  /* slate-900 - Headings, emphasis */
--color-text-secondary: #475569;/* slate-600 - Body text, labels */
--color-text-tertiary: #64748B; /* slate-500 - Metadata, captions */
--color-text-placeholder: #94A3B8; /* slate-400 - Input placeholders */
```

**Usage:**
- Background hierarchy (app → surface → cards)
- Text hierarchy (primary → secondary → tertiary)
- Border weights (subtle → default → strong)

### 2.4 Semantic Colors (Universal)

```css
/* Success - Green */
--color-success: #16A34A;       /* green-600 - Success states */
--color-success-subtle: #ECFDF5;/* green-50 - Success backgrounds */
--color-success-border: #86EFAC;/* green-300 - Success borders */

/* Warning - Yellow */
--color-warning: #EAB308;       /* yellow-500 - Warning states */
--color-warning-subtle: #FEFCE8;/* yellow-50 - Warning backgrounds */
--color-warning-border: #FDE047;/* yellow-300 - Warning borders */

/* Error - Red */
--color-error: #DC2626;         /* red-600 - Error states */
--color-error-subtle: #FEF2F2;  /* red-50 - Error backgrounds */
--color-error-border: #FCA5A5;  /* red-300 - Error borders */

/* Info - Teal (uses brand) */
--color-info: #0D9488;          /* teal-600 - Info states (brand color) */
--color-info-subtle: #CCFBF1;   /* teal-100 - Info backgrounds */
--color-info-border: #5EEAD4;   /* teal-300 - Info borders */
```

**Usage:**
- Toast notifications
- Form validation states
- Alert banners
- Status badges

### 2.5 Functional Module Colors (Behouden)

```css
/* Appointments Module - Green */
--color-module-appointments-bg: #E8F8EF;      /* green-100 variant */
--color-module-appointments-accent: #16A34A;  /* green-600 */
--color-module-appointments-border: #CDECDC;  /* green-200 variant */

/* Medications Module - Amber */
--color-module-meds-bg: #FEF6DC;              /* amber-100 variant */
--color-module-meds-accent: #F59E0B;          /* amber-500 */
--color-module-meds-border: #F6E7B6;          /* amber-200 variant */

/* Lab Results Module - Orange */
--color-module-labs-bg: #FFEBDC;              /* orange-100 variant */
--color-module-labs-accent: #F97316;          /* orange-500 */
--color-module-labs-border: #FFD2B8;          /* orange-200 variant */
```

**Usage:**
- EPD module cards (left-border accent pattern)
- Dashboard widgets
- Category badges

---

## 3. Typography System

### 3.1 Font Families (Behouden - Perfect)

```typescript
// Current font stack is excellent, no changes needed
--font-serif: 'Crimson Text', Georgia, serif;      // Storytelling, manifesto
--font-sans: 'Inter', system-ui, sans-serif;       // UI, body text
--font-mono: 'JetBrains Mono', 'Courier New', monospace; // Data, timestamps
```

**Rationale:**
- Crimson Text = elegant long-form reading (manifesto)
- Inter = clean UI workhorse (buttons, labels, forms)
- JetBrains Mono = technical credibility (IDs, timestamps, code)

### 3.2 Type Scale

```css
/* Display & Headings */
--text-display: clamp(2.5rem, 6vw, 4rem);    /* 40-64px - Hero headings */
  line-height: 1.1;
  letter-spacing: -0.02em;

--text-h1: clamp(2rem, 5vw, 3rem);           /* 32-48px - Page titles */
  line-height: 1.1;
  letter-spacing: -0.01em;

--text-h2: clamp(1.75rem, 4vw, 2.5rem);      /* 28-40px - Section headers */
  line-height: 1.2;
  font-weight: 600;

--text-h3: 1.5rem;                           /* 24px - Subsection headers */
  line-height: 1.3;
  font-weight: 600;

--text-h4: 1.125rem;                         /* 18px - Card headers */
  line-height: 1.4;
  font-weight: 600;

/* Body Text */
--text-body: 1rem;                           /* 16px - Default body */
  line-height: 1.5;

--text-body-lg: 1.125rem;                    /* 18px - Emphasized body */
  line-height: 1.6;

--text-body-sm: 0.875rem;                    /* 14px - Dense content */
  line-height: 1.5;

/* Utility Text */
--text-caption: 0.875rem;                    /* 14px - Metadata, timestamps */
  line-height: 1.4;

--text-overline: 0.75rem;                    /* 12px - Labels, badges */
  line-height: 1.4;
  letter-spacing: 0.08em;
  text-transform: uppercase;
```

### 3.3 Font Weight Strategy

```css
/* Inter weights for UI hierarchy */
--font-weight-normal: 400;      /* Body text, form inputs */
--font-weight-medium: 500;      /* Subtle emphasis, labels */
--font-weight-semibold: 600;    /* Buttons, card titles, h3-h4 */
--font-weight-bold: 700;        /* Important CTAs, h1-h2 */

/* Crimson Text for storytelling */
--font-weight-regular: 400;     /* Manifesto body */
--font-weight-semibold: 600;    /* Manifesto headings */

/* JetBrains Mono for data */
--font-weight-regular: 400;     /* Timestamps, IDs */
--font-weight-medium: 500;      /* Emphasized data points */
```

---

## 4. Component Patterns

### 4.1 Button System

#### Primary Button (Teal)
```tsx
<button className="
  px-6 py-3
  bg-teal-600 hover:bg-teal-700 active:bg-teal-800
  text-white font-sans font-semibold
  rounded-lg

  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2

  transition-colors duration-200

  disabled:opacity-50 disabled:cursor-not-allowed
">
  Primary Action
</button>
```

**Usage:** Main CTAs, form submissions, primary navigation actions

#### AI Action Button (Amber Gradient)
```tsx
<button className="
  px-6 py-3
  bg-gradient-to-r from-amber-500 to-amber-400
  hover:from-amber-600 hover:to-amber-500
  text-amber-900 font-sans font-semibold
  rounded-lg

  shadow-sm hover:shadow-md

  flex items-center gap-2

  transition-all duration-200
">
  <SparklesIcon className="w-5 h-5" />
  Generate with AI
</button>
```

**Usage:** AI-powered actions (summarize, categorize, generate plan)

#### Secondary Button (Neutral)
```tsx
<button className="
  px-6 py-3
  bg-slate-700 hover:bg-slate-800
  text-white font-sans font-semibold
  rounded-lg

  transition-colors duration-200
">
  Secondary Action
</button>
```

**Usage:** Alternative actions, cancel, back navigation

#### Ghost Button (Teal Outline)
```tsx
<button className="
  px-6 py-3
  bg-transparent hover:bg-teal-50
  text-teal-600 hover:text-teal-700
  border border-teal-600 hover:border-teal-700
  font-sans font-semibold
  rounded-lg

  transition-all duration-200
">
  Tertiary Action
</button>
```

**Usage:** Tertiary actions, filters, toggles

### 4.2 Input Fields

#### Standard Input
```tsx
<input className="
  w-full px-4 py-3
  bg-white border border-slate-200
  text-slate-900 placeholder:text-slate-400
  font-sans text-body-sm
  rounded-lg

  focus:outline-none
  focus:border-teal-600
  focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20

  disabled:bg-slate-100 disabled:text-slate-500

  transition-all duration-200
" />
```

#### AI-Enhanced Input (with suggestion indicator)
```tsx
<div className="relative">
  <input className="
    w-full px-4 py-3 pr-16
    bg-white border border-slate-200
    text-slate-900
    rounded-lg

    focus:border-teal-600
    focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20

    data-[ai-active]:border-amber-500
    data-[ai-active]:ring-amber-500
  " />

  <div className="absolute right-3 top-3">
    <span className="
      text-caption font-medium text-amber-600
      flex items-center gap-1
      px-2 py-0.5
      bg-amber-50 rounded
    ">
      <SparklesIcon className="w-4 h-4" />
      AI
    </span>
  </div>
</div>
```

### 4.3 Card System

#### Module Card (Semantic Left Border)
```tsx
<div className="
  bg-white
  border-l-[3px] border-l-teal-600
  border border-slate-200
  rounded-lg
  p-6

  hover:bg-teal-50 hover:shadow-md

  transition-all duration-200
">
  <div className="flex items-start gap-3">
    {/* Icon */}
    <div className="
      w-10 h-10
      bg-teal-100
      rounded-lg
      flex items-center justify-center
    ">
      <IconComponent className="w-5 h-5 text-teal-700" />
    </div>

    {/* Content */}
    <div className="flex-1">
      <h3 className="font-sans font-semibold text-h4 text-slate-900">
        Card Title
      </h3>
      <p className="font-mono text-caption text-slate-500 mt-1">
        Metadata or timestamp
      </p>
      <p className="font-sans text-body-sm text-slate-600 mt-2">
        Card description content
      </p>
    </div>
  </div>
</div>
```

**Variants:**
- `border-l-green-600` for appointments module
- `border-l-amber-500` for medications module
- `border-l-orange-500` for lab results module

#### Standard Card (No Accent)
```tsx
<div className="
  bg-white
  border border-slate-200
  rounded-lg
  p-6

  hover:shadow-md

  transition-shadow duration-200
">
  {/* Content */}
</div>
```

### 4.4 Badge System

```tsx
// Status Badge
<span className="
  inline-flex items-center gap-1
  px-2.5 py-0.5
  text-overline font-medium
  bg-teal-100 text-teal-700
  rounded-full
">
  Active
</span>

// AI Badge
<span className="
  inline-flex items-center gap-1
  px-2.5 py-0.5
  text-overline font-medium
  bg-amber-100 text-amber-700
  rounded-full
">
  <SparklesIcon className="w-3 h-3" />
  AI Generated
</span>

// Severity Badge (DSM)
<span className="
  inline-flex items-center
  px-2.5 py-0.5
  text-caption font-medium
  bg-red-100 text-red-700
  rounded
">
  Hoog
</span>
```

---

## 5. Motion & Animation Principles

### 5.1 Duration Scale

```typescript
export const motionDurations = {
  instant: '100ms',   // Micro-feedback (button press, checkbox toggle)
  fast: '200ms',      // Hover states, tooltips
  normal: '300ms',    // Panel opens, dropdown menus
  slow: '500ms',      // Modals, drawers
  glacial: '800ms',   // Marketing animations only (hero sections)
}
```

**Rules:**
- **EPD Interface:** Use `instant` to `normal` only (users want speed)
- **Marketing Site:** Can use up to `glacial` (storytelling allows slower pace)

### 5.2 Easing Functions

```css
/* Standard easing (default) */
--ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);

/* Decelerate (elements entering screen) */
--ease-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);

/* Accelerate (elements exiting screen) */
--ease-accelerate: cubic-bezier(0.4, 0.0, 1, 1);

/* Gentle (calm, therapeutic feel) */
--ease-gentle: cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

**Usage:**
- Standard: Most transitions
- Decelerate: Modals opening, panels sliding in
- Accelerate: Modals closing, panels sliding out
- Gentle: Marketing site, long-form content

### 5.3 AI-Specific Animations

#### "Thinking" Shimmer
```css
@keyframes ai-thinking {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.ai-processing {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(245, 158, 11, 0.1),
    transparent
  );
  background-size: 200% 100%;
  animation: ai-thinking 1.5s ease-in-out infinite;
}
```

**Usage:** Loading states for AI API calls

#### Fade-Slide-Up (AI Suggestions)
```css
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-suggestion-enter {
  animation: fadeSlideUp 400ms var(--ease-gentle);
}
```

**Usage:** AI suggestions appearing in right panel (AI-rail)

#### Pulse (AI Badge)
```css
@keyframes pulse-amber {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.ai-badge-pulse {
  animation: pulse-amber 2s ease-in-out infinite;
}
```

**Usage:** AI badge on active processing

### 5.4 Performance Guidelines

```typescript
// Prefer transforms over top/left
// GOOD:
transform: translateY(8px);

// BAD:
top: 8px;

// Prefer opacity over visibility
// GOOD:
opacity: 0; pointer-events: none;

// BAD:
display: none;

// Use will-change sparingly
.modal-enter {
  will-change: transform, opacity;
}

.modal-enter-done {
  will-change: auto; /* Remove after animation */
}
```

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Week 1 - Day 1-2)

**Priority: CRITICAL** - Breaking changes, full color swap

#### Task 1.1: Update Tailwind Config
**File:** `tailwind.config.ts`
**Time:** 30 min

```typescript
// Replace blue-based brand with teal
colors: {
  brand: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',   // PRIMARY
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  ai: colors.amber,      // Keep amber for AI features

  // Semantic colors (keep existing)
  success: colors.green,
  warning: colors.yellow,
  error: colors.red,

  // Info now uses brand teal
  info: {
    DEFAULT: '#0D9488',
    light: '#CCFBF1',
    dark: '#0F766E',
  },
}
```

#### Task 1.2: Update Global CSS Variables
**File:** `app/globals.css`
**Time:** 20 min

```css
@layer base {
  :root {
    /* Primary Brand - UPDATE from blue to teal */
    --primary: #0D9488;           /* was #3B82F6 */
    --primary-foreground: #FFFFFF;

    /* Info color - UPDATE to match brand */
    --info: #0D9488;              /* was #3B82F6 */

    /* Keep existing */
    --background: #F8FAFC;
    --foreground: #0F172A;
    --border: #E2E8F0;

    /* AI colors - KEEP */
    --ai-highlight: #F59E0B;
    --ai-subtle: #FEF3C7;

    /* Module colors - KEEP */
    --module-appointments: #16A34A;
    --module-meds: #F59E0B;
    --module-labs: #F97316;
  }

  .dark {
    /* Dark mode variants (if needed later) */
    --primary: #14B8A6;           /* Lighter teal for dark bg */
  }
}
```

#### Task 1.3: Test Contrast Ratios
**Tool:** WebAIM Contrast Checker
**Time:** 15 min

Verify WCAG AA compliance:
- [ ] Teal-600 (#0D9488) on white: 4.58:1 ✅ (AA Large Text)
- [ ] Teal-700 (#0F766E) on white: 5.77:1 ✅ (AA Normal Text)
- [ ] Teal-900 (#134E4A) on white: 11.32:1 ✅ (AAA)
- [ ] White on teal-600: 4.58:1 ✅ (AA Large Text)

**Action if needed:** Use teal-700 for small text on white, teal-600 for buttons with white text.

---

### Phase 2: Component Updates (Week 1 - Day 2-3)

**Priority: HIGH** - Visible user-facing changes

#### Task 2.1: Sign-In Component Refactor
**File:** `components/ui/sign-in.tsx`
**Time:** 1 hour

**Changes:**
```tsx
// Background
- className="bg-[#e8f4ef]"
+ className="bg-slate-50"

// Primary buttons
- className="bg-blue-600 hover:bg-blue-500"
+ className="bg-teal-600 hover:bg-teal-700"

// Links
- className="text-blue-400 hover:text-blue-300"
+ className="text-teal-400 hover:text-teal-300"

// Stat card 1 (Orange - Cost reduction)
- Content: "41% of recruiters..."
+ Content: "€100k → €200: 99.8% cost reduction"
+ Keep: bg-gradient-to-br from-orange-500 to-orange-400

// Stat card 2 (Green - Speed)
- Content: "76% of hiring managers..."
+ Content: "4 weeks: traditional takes 6 months"
- bg-green-500
+ bg-gradient-to-br from-teal-500 to-teal-400
```

**Before/After:**
- Before: Generic job-seeking stats with blue/green
- After: AI Speedrun specific metrics with teal/amber theme

#### Task 2.2: Timeline Component Update
**File:** `components/ui/timeline.tsx` (to be created from docs/design/timeline-comp.tsx)
**Time:** 1.5 hours

**Implementation:**
1. Copy timeline component from `docs/design/timeline-comp.tsx`
2. Update gradient:
```tsx
// Line gradient
- className="bg-gradient-to-t from-purple-500 via-blue-500"
+ className="bg-gradient-to-t from-teal-600 via-teal-500 to-transparent"

// Dots
- className="bg-white border-purple-200"
+ className="bg-white border-teal-200"

// Active dot
- className="bg-purple-600"
+ className="bg-teal-600"

// Timestamps (add mono font)
+ className="text-teal-600 font-mono text-caption"
```

3. Create content structure:
**File:** `content/nl/timeline.json`

```json
[
  {
    "weekNumber": 1,
    "title": "Week 1 • Nov 11-17",
    "status": "completed",
    "description": "Marketing site foundation opgezet. Hero section, manifesto content, database schema aangemaakt.",
    "metrics": {
      "developmentHours": 30,
      "infrastructureCost": 50
    },
    "achievements": [
      "Landing page met hero + statement",
      "EPD demo pagina met credentials",
      "Contact form + lead capture API",
      "Database schema (5 core tables)",
      "Supabase Auth + RLS policies"
    ]
  },
  {
    "weekNumber": 2,
    "title": "Week 2 • Nov 18-24",
    "status": "in_progress",
    "description": "EPD app foundation. Client management, auth flow, protected routes.",
    "metrics": {
      "developmentHours": 0,
      "infrastructureCost": 0
    },
    "achievements": []
  }
]
```

#### Task 2.3: Navigation Component Update
**File:** `app/(marketing)/components/minimal-nav.tsx`
**Time:** 30 min

**Changes:**
```tsx
// Active link styling
- className="text-blue-600"
+ className="text-teal-600"

// Hover states
- className="hover:text-blue-700"
+ className="hover:text-teal-700"

// Mobile menu button
- className="text-blue-600"
+ className="text-teal-600"
```

#### Task 2.4: Create AI Button Component
**File:** `components/ui/ai-button.tsx` (NEW)
**Time:** 20 min

```tsx
import { SparklesIcon } from 'lucide-react'

interface AIButtonProps {
  children: React.ReactNode
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
}

export function AIButton({ children, onClick, loading, disabled }: AIButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="
        px-6 py-3
        bg-gradient-to-r from-amber-500 to-amber-400
        hover:from-amber-600 hover:to-amber-500
        text-amber-900 font-sans font-semibold text-body-sm
        rounded-lg

        shadow-sm hover:shadow-md

        flex items-center justify-center gap-2

        disabled:opacity-50 disabled:cursor-not-allowed

        transition-all duration-200
      "
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-amber-900/20 border-t-amber-900 rounded-full animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <SparklesIcon className="w-5 h-5" />
          {children}
        </>
      )}
    </button>
  )
}
```

**Usage:**
```tsx
<AIButton onClick={handleAISummarize}>
  Generate Summary
</AIButton>
```

#### Task 2.5: Update Module Cards (EPD)
**Files:** Future EPD components
**Time:** 30 min

**Pattern:**
```tsx
// Appointments card
<div className="
  bg-white
  border-l-[3px] border-l-green-600
  border border-slate-200
  rounded-lg p-6
  hover:bg-green-50
">

// Medications card
<div className="
  bg-white
  border-l-[3px] border-l-amber-500
  border border-slate-200
  rounded-lg p-6
  hover:bg-amber-50
">

// Labs card
<div className="
  bg-white
  border-l-[3px] border-l-orange-500
  border border-slate-200
  rounded-lg p-6
  hover:bg-orange-50
">
```

---

### Phase 3: Marketing Site Integration (Week 1 - Day 3-4)

**Priority: MEDIUM** - Content updates, new sections

#### Task 3.1: Homepage Restructure
**File:** `app/(marketing)/page.tsx`
**Time:** 2 hours

**New Structure:**
```tsx
export default function HomePage() {
  return (
    <main>
      {/* 1. Hero Section - KEEP */}
      <HeroQuote />

      {/* 2. Statement Section - NEW */}
      <StatementSection />

      {/* 3. Timeline Section - NEW */}
      <TimelineSection />

      {/* 4. CTA Section - SIMPLIFIED */}
      <CTASection />
    </main>
  )
}
```

**Remove:**
- ManifestoContent (long-form moved to separate /about page if needed)
- ComparisonTable (moved to /epd page)
- Multiple InsightBox components

#### Task 3.2: Create Statement Section
**File:** `app/(marketing)/components/statement-section.tsx` (NEW)
**Time:** 1 hour

```tsx
export function StatementSection() {
  return (
    <section className="
      max-w-4xl mx-auto px-6 py-24
    ">
      <h2 className="
        font-serif font-semibold text-h1 text-slate-900
        mb-8
      ">
        Software on Demand: Van €100k naar €200
      </h2>

      <div className="
        font-serif text-body-lg text-slate-700
        space-y-6
        leading-loose
      ">
        <p>
          Enterprise software kost gemiddeld <strong>€100.000+</strong> en duurt
          <strong> 12-24 maanden</strong> om te bouwen. Voor een GGZ-praktijk met
          5 therapeuten is dit onbereikbaar.
        </p>

        <p>
          AI-powered development verandert dit. Met Claude als co-pilot, moderne
          frameworks, en cloud infrastructure bouwen we hetzelfde EPD in
          <strong> 4 weken</strong> voor <strong>€200</strong> totale kosten.
        </p>

        <p className="text-teal-700 font-semibold">
          Dit project is het bewijs. Volg hieronder de voortgang week voor week.
        </p>
      </div>
    </section>
  )
}
```

#### Task 3.3: Integrate Timeline Component
**File:** `app/(marketing)/components/timeline-section.tsx` (NEW)
**Time:** 1 hour

```tsx
import { Timeline } from '@/components/ui/timeline'
import { getContent } from '@/lib/content/loader'

export async function TimelineSection() {
  const timelineData = await getContent('nl', 'timeline')

  // Transform to Timeline component format
  const data = timelineData.map(week => ({
    title: week.title,
    content: (
      <div>
        <p className="text-slate-700 text-body-sm mb-4">
          {week.description}
        </p>

        {/* Metrics */}
        {week.metrics && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="text-overline text-teal-700 mb-1">Dev Hours</div>
              <div className="font-mono text-h3 text-teal-900">
                {week.metrics.developmentHours}
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-overline text-amber-700 mb-1">Cost</div>
              <div className="font-mono text-h3 text-amber-900">
                €{week.metrics.infrastructureCost}
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        {week.achievements && week.achievements.length > 0 && (
          <div className="space-y-2">
            {week.achievements.map((achievement, i) => (
              <div key={i} className="flex items-center gap-2 text-body-sm text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                {achievement}
              </div>
            ))}
          </div>
        )}
      </div>
    ),
  }))

  return (
    <section id="timeline" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="font-serif font-semibold text-h2 text-slate-900 mb-4 text-center">
          Build in Public: 4 Weken Progress
        </h2>
        <p className="font-sans text-body text-slate-600 mb-12 text-center max-w-2xl mx-auto">
          Transparantie vanaf dag 1. Volg elke week de voortgang,
          kosten, en geleerde lessen.
        </p>

        <Timeline data={data} />
      </div>
    </section>
  )
}
```

#### Task 3.4: Update CTA Section
**File:** Update existing CTA in homepage
**Time:** 20 min

**Simplified CTA:**
```tsx
<section className="py-24 bg-white">
  <div className="max-w-4xl mx-auto px-6 text-center">
    <h2 className="font-serif font-semibold text-h2 text-slate-900 mb-6">
      Klaar om te experimenteren?
    </h2>

    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      {/* Primary CTA */}
      <a
        href="/epd"
        className="
          px-8 py-4
          bg-teal-600 hover:bg-teal-700
          text-white font-sans font-semibold text-body
          rounded-lg
          transition-colors duration-200
        "
      >
        Bekijk het EPD Prototype
      </a>

      {/* Secondary CTA */}
      <a
        href="/contact"
        className="
          px-8 py-4
          bg-slate-700 hover:bg-slate-800
          text-white font-sans font-semibold text-body
          rounded-lg
          transition-colors duration-200
        "
      >
        Start een Project
      </a>
    </div>
  </div>
</section>
```

---

### Phase 4: Content Updates (Week 1 - Day 4)

**Priority: MEDIUM** - Supporting content

#### Task 4.1: Fix EPD Page Links
**File:** `app/(marketing)/epd/credentials-box.tsx`
**Time:** 5 min

```tsx
// Line 80 or wherever login link is
- href="/app/login"
+ href="/login"
```

#### Task 4.2: Update Navigation Content
**File:** `content/nl/navigation.json`
**Time:** 5 min

```json
{
  "logo": {
    "text": "AI Speedrun",
    "href": "/"
  },
  "links": [
    {
      "label": "Home",
      "href": "/"
    },
    {
      "label": "EPD Prototype",
      "href": "/epd"
    },
    {
      "label": "Contact",
      "href": "/contact"
    },
    {
      "label": "Login",
      "href": "/login"
    }
  ]
}
```

#### Task 4.3: Create Timeline Content
**File:** `content/nl/timeline.json` (NEW)
**Time:** 30 min

See Task 2.2 for structure. Populate with real Week 1 data.

---

### Phase 5: EPD App Foundation (Week 2 - Later)

**Priority: LOW** - Can be done in Week 2

#### Task 5.1: Coming Soon Dashboard
**File:** `app/epd/clients/page.tsx` (NEW)
**Time:** 45 min

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ClientsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-lg p-12 text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="font-sans font-bold text-h1 text-slate-900 mb-4">
          EPD Dashboard - Coming Week 2
        </h1>

        {/* Description */}
        <p className="font-sans text-body text-slate-600 mb-8">
          De EPD applicatie wordt momenteel gebouwd.
          Volg de voortgang op de <a href="/#timeline" className="text-teal-600 hover:underline">homepage timeline</a>.
        </p>

        {/* Timeline Preview */}
        <div className="bg-slate-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-sans font-semibold text-h4 text-slate-900 mb-4">
            Development Roadmap
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-sans font-medium text-body-sm text-slate-900">Week 1: Foundation ✓</div>
                <div className="font-sans text-caption text-slate-500">Marketing site, auth, database schema</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 border-2 border-teal-600 rounded-full flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-teal-600 rounded-full m-0.5 animate-pulse" />
              </div>
              <div>
                <div className="font-sans font-medium text-body-sm text-slate-900">Week 2: Client Management</div>
                <div className="font-sans text-caption text-slate-500">CRUD operations, client list, detail views</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 border-2 border-slate-300 rounded-full flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-sans font-medium text-body-sm text-slate-500">Week 3: AI Integration</div>
                <div className="font-sans text-caption text-slate-400">Intake editor, summarization, categorization</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 border-2 border-slate-300 rounded-full flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-sans font-medium text-body-sm text-slate-500">Week 4: Polish & Launch</div>
                <div className="font-sans text-caption text-slate-400">Onboarding, optimization, demo prep</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <a
            href="/epd"
            className="
              px-6 py-3
              bg-teal-600 hover:bg-teal-700
              text-white font-sans font-semibold
              rounded-lg
              transition-colors duration-200
            "
          >
            Terug naar Prototype Info
          </a>

          <a
            href="/auth/logout"
            className="
              px-6 py-3
              bg-slate-200 hover:bg-slate-300
              text-slate-700 font-sans font-semibold
              rounded-lg
              transition-colors duration-200
            "
          >
            Logout
          </a>
        </div>
      </div>
    </div>
  )
}
```

#### Task 5.2: Update Middleware Redirects
**File:** `middleware.ts`
**Time:** 10 min

```typescript
// Line 78-81: Update redirect target
if (user && pathname === '/login') {
  return NextResponse.redirect(new URL('/epd/clients', request.url))
}

// Ensure /epd/clients is protected
const publicRoutes = [
  '/', '/epd', '/contact', '/login',
  '/auth/callback', '/auth/logout'
]
// /epd/clients is NOT in publicRoutes, so it's protected ✓
```

---

### Phase 6: Documentation (Week 1 - Day 5)

**Priority: LOW** - Can be done async

#### Task 6.1: Update UX Stylesheet
**File:** `docs/specs/ux-stylesheet.md`
**Time:** 30 min

Document the new teal-first system with:
- Color palette updates
- Component examples
- Usage guidelines

#### Task 6.2: Create Component Library Doc
**File:** `docs/specs/component-library.md` (NEW)
**Time:** 1 hour

Document all reusable components:
- AIButton
- ModuleCard
- Timeline
- Badge variants
- Button variants

#### Task 6.3: Update Bouwplan
**File:** `docs/specs/bouwplan-ai-speedrun-marketing-first-v1.1.md`
**Time:** 15 min

Update status:
- E1 (Marketing Website): 100% complete → Mark timeline integration
- E2 (Database & Auth): Update progress

---

## 7. Testing & Quality Assurance

### 7.1 Visual Regression Checklist

**Manual Testing:**
- [ ] Homepage: Hero, statement, timeline, CTA flow correctly
- [ ] EPD page: Features, credentials, comparison table visible
- [ ] Contact page: Form submits, validation works
- [ ] Login page: Both flows work (magic link + demo)
- [ ] Coming Soon page: Roadmap displays, logout works

**Cross-Browser:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Responsive:**
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1440px)

### 7.2 Accessibility Audit

**WCAG AA Compliance:**
- [ ] Color contrast ≥ 4.5:1 for normal text
- [ ] Color contrast ≥ 3:1 for large text (18px+)
- [ ] Focus states visible (teal ring)
- [ ] Keyboard navigation works
- [ ] Screen reader labels present
- [ ] No color-only information (icons + text)

**Tools:**
- axe DevTools (Chrome extension)
- Lighthouse (built into Chrome DevTools)
- Color contrast analyzer

### 7.3 Performance Benchmarks

**Lighthouse Targets:**
- [ ] Performance: > 90
- [ ] Accessibility: 100
- [ ] Best Practices: > 95
- [ ] SEO: 100

**Core Web Vitals:**
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID (First Input Delay): < 100ms
- [ ] CLS (Cumulative Layout Shift): < 0.1

**Optimization:**
- Use next/image for all images
- Lazy load timeline component
- Code-split marketing vs EPD routes
- Minimize CSS (Tailwind purge)

---

## 8. Migration Checklist (Quick Reference)

### Global Changes
- [x] tailwind.config.ts: blue → teal brand colors
- [x] globals.css: --primary and --info variables
- [x] Test contrast ratios (WCAG AA)

### Component Updates
- [ ] Sign-in: bg, buttons, stats content
- [ ] Timeline: gradient, dots, timestamps
- [ ] MinimalNav: links, active states
- [ ] AIButton: create new component
- [ ] Module cards: left-border pattern

### Content Updates
- [ ] navigation.json: add Login link
- [ ] timeline.json: create Week 1 data
- [ ] epd/credentials-box: fix login href

### New Components
- [ ] StatementSection: homepage pitch
- [ ] TimelineSection: build-in-public
- [ ] Coming Soon page: /epd/clients

### Cleanup
- [ ] Remove long-form manifesto from homepage
- [ ] Move comparison table to /epd only
- [ ] Archive unused InsightBox components

---

## 9. Success Metrics

### Qualitative Goals
- **Visual Impact:** Screenshots are instantly recognizable as AI Speedrun brand
- **LinkedIn Shareability:** Timeline posts generate engagement
- **Demo Effectiveness:** 10-min demo flows smoothly without confusion
- **Brand Coherence:** Teal = innovation signal is clear to stakeholders

### Quantitative Targets
- **Lighthouse Performance:** > 90
- **Accessibility Score:** 100 (WCAG AA)
- **Load Time:** Homepage < 2s on 3G
- **Conversion:** > 5% contact form completion from landing

### Week 1 Review Questions
1. Does teal feel "innovative but trustworthy"?
2. Do GGZ stakeholders understand the AI Speedrun value prop?
3. Is the timeline section compelling for LinkedIn?
4. Does the Coming Soon page manage expectations well?

---

## 10. Rollback Plan (If Needed)

### If Teal Doesn't Work

**Scenario:** Stakeholder feedback is negative, teal feels wrong

**Quick Rollback (< 1 hour):**
1. Revert tailwind.config.ts: teal → blue
2. Revert globals.css: --primary back to #3B82F6
3. Git revert component changes
4. Deploy previous version

**Keep:** Timeline component, statement section, improved content
**Revert:** Only color changes

### Partial Rollback

**Scenario:** Teal works for marketing, not for EPD

**Hybrid Approach:**
- Marketing site: Keep teal (#0D9488)
- EPD app: Revert to blue (#3B82F6)
- Justification: "Bold vision (marketing) + Familiar execution (product)"

---

## 11. Next Steps (Week 2+)

### After Teal Implementation

**Week 2 Focus:**
1. Build actual EPD client list (replace Coming Soon)
2. Client detail page with tabs (intake, profile, plan)
3. Forms for client creation/editing

**Week 3 Focus:**
1. TipTap editor for intake notes
2. AI integration (Claude API endpoints)
3. AI-rail component for suggestions

**Week 4 Focus:**
1. Onboarding flow
2. Polish & optimization
3. Demo dry-run preparation

---

## 12. Resources & References

### Design System Documentation
- **Tailwind Docs:** https://tailwindcss.com/docs/customizing-colors
- **WCAG Contrast:** https://webaim.org/resources/contrastchecker/
- **Color Palette Tool:** https://coolors.co

### Inspiration
- **Linear:** https://linear.app (violet/purple primary)
- **Vercel:** https://vercel.com/design (systematic grays)
- **Notion:** https://notion.so (clean, minimal)

### Internal Docs
- FO v2.0: `docs/specs/fo-marketing-app-flow-v2.md`
- UX Stylesheet (current): `docs/specs/ux-stylesheet.md`
- Bouwplan: `docs/specs/bouwplan-ai-speedrun-marketing-first-v1.1.md`

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v2.0 | 17-11-2024 | Colin | Initial UX Implementation Plan with teal-first design system. Strategic pivot from blue to teal based on AI Speedrun positioning as consultancy showcase. |

---

**Status:** Ready for Implementation
**Next Action:** Begin Phase 1 (tailwind.config.ts update)
**Owner:** Colin Lit
**Timeline:** Week 1, Days 1-5
