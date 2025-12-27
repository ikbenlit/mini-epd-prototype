# Epic 0 — Design Tokens & Component Inventory

**Datum:** 27-12-2024
**Auteur:** AI Assistant
**Status:** ✅ Completed

---

## E0.S1 — Design Tokens Audit

🎯 **Doel:** Alle kleuren, spacing, typography gedocumenteerd voor v3.0 gebruik.

### Colors (blijven hetzelfde voor v3.0)

#### Base Colors
```css
--color-bg: #F8FAFC;              /* App background */
--color-surface: #FFFFFF;          /* Cards, blocks, surfaces */
--color-surface-secondary: #F1F5F9; /* Secondary surfaces */
--color-text: #0F172A;             /* Primary text (slate-900) */
--color-text-secondary: #475569;   /* Secondary text (slate-600) */
--color-border: #E2E8F0;           /* Borders (slate-200) */
```

#### Brand Colors (Teal-first Design System)
```css
--color-brand: #0F766E;            /* teal-700 - PRIMARY (5.47:1 WCAG AA) */
--color-brand-hover: #115E59;      /* teal-800 */
--color-brand-active: #0D9488;     /* teal-600 */
--color-brand-subtle: #F0FDFA;     /* teal-50 */
```

#### AI Feature Colors (Amber)
```css
--color-ai: #D97706;               /* amber-600 - PRIMARY AI (3.19:1 WCAG AA large) */
--color-ai-hover: #B45309;         /* amber-700 */
--color-ai-subtle: #FFFBEB;        /* amber-50 */
```

#### Status & Feedback Colors
```css
--color-success: #16A34A;          /* green-600 */
--color-success-subtle: #ECFDF5;   /* green-50 */
--color-warning: #EAB308;          /* yellow-500 */
--color-warning-subtle: #FEFCE8;   /* yellow-50 */
--color-error: #DC2626;            /* red-600 */
--color-error-subtle: #FEF2F2;     /* red-50 */
--color-info: #0F766E;             /* teal-700 - Brand consistency */
--color-info-subtle: #CCFBF1;      /* teal-100 */
```

#### Form/Input Colors
```css
--color-input-bg: #FFFFFF;
--color-input-text: #0F172A;
--color-input-placeholder: #94A3B8; /* slate-400 */
--color-input-border: #CBD5E1;      /* slate-300 */
--color-input-border-hover: #94A3B8;
--color-input-focus: #0F766E;       /* teal-700 */
--color-input-focus-border: #115E59; /* teal-800 */
--color-input-disabled-bg: #F1F5F9;
--color-input-disabled-text: #94A3B8;
```

---

### 🆕 NEW: Chat Message Colors (v3.0 only)

Voor de nieuwe chat interface:

```css
/* User messages (rechts, amber tint) */
--chat-user-bg: #FFFBEB;           /* amber-50 */
--chat-user-border: #FED7AA;       /* amber-200 */
--chat-user-text: #0F172A;         /* text-primary */

/* Assistant messages (links, slate tint) */
--chat-assistant-bg: #F1F5F9;      /* slate-100 */
--chat-assistant-border: #CBD5E1;  /* slate-300 */
--chat-assistant-text: #0F172A;    /* text-primary */

/* System messages (centered, subtle) */
--chat-system-text: #64748B;       /* slate-500 */

/* Error messages (links, red tint) */
--chat-error-bg: #FEF2F2;          /* red-50 */
--chat-error-border: #FECACA;      /* red-200 */
--chat-error-text: #991B1B;        /* red-800 */
```

**Tailwind classes voor chat messages:**
```tsx
const MESSAGE_STYLES = {
  user: {
    container: 'self-end bg-amber-50 border border-amber-200 text-slate-900',
    borderRadius: 'rounded-2xl rounded-tr-sm',
  },
  assistant: {
    container: 'self-start bg-slate-100 border border-slate-300 text-slate-900',
    borderRadius: 'rounded-2xl rounded-tl-sm',
  },
  system: {
    container: 'self-center text-slate-500 text-sm',
    borderRadius: '',
  },
  error: {
    container: 'self-start bg-red-50 border border-red-200 text-red-800',
    borderRadius: 'rounded-2xl',
  },
};
```

---

### Verpleegkundig Category Colors (blijven hetzelfde)

Gebruikt in DagnotatieBlock, OverdrachtBlock:

```typescript
export const CATEGORY_CONFIG = {
  medicatie: {
    label: 'Medicatie',
    icon: 'Pill',
    bgColor: 'bg-blue-100',      // #DBEAFE
    textColor: 'text-blue-700',  // #1D4ED8
  },
  adl: {
    label: 'ADL/verzorging',
    icon: 'Utensils',
    bgColor: 'bg-green-100',     // #DCFCE7
    textColor: 'text-green-700', // #15803D
  },
  gedrag: {
    label: 'Gedragsobservatie',
    icon: 'User',
    bgColor: 'bg-purple-100',    // #F3E8FF
    textColor: 'text-purple-700', // #7E22CE
  },
  incident: {
    label: 'Incident',
    icon: 'AlertTriangle',
    bgColor: 'bg-red-100',       // #FEE2E2
    textColor: 'text-red-700',   // #B91C1C
  },
  observatie: {
    label: 'Observatie',
    icon: 'Eye',
    bgColor: 'bg-slate-100',     // #F1F5F9
    textColor: 'text-slate-700', // #334155
  },
};
```

---

### Swift Shift Colors (blijven hetzelfde)

Gebruikt in ContextBar:

```typescript
const SHIFT_CONFIG = {
  ochtend: {
    icon: Sunrise,
    label: 'Ochtenddienst',
    color: 'text-amber-600',     // #D97706
  },
  middag: {
    icon: Sun,
    label: 'Middagdienst',
    color: 'text-yellow-600',    // #CA8A04
  },
  avond: {
    icon: Sunset,
    label: 'Avonddienst',
    color: 'text-orange-600',    // #EA580C
  },
  nacht: {
    icon: Moon,
    label: 'Nachtdienst',
    color: 'text-indigo-600',    // #4F46E5
  },
};
```

---

### Shadows (blijven hetzelfde)

```css
--shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.06);
--shadow-md: 0 2px 6px rgba(15, 23, 42, 0.08);
--shadow-lg: 0 8px 20px rgba(15, 23, 42, 0.10);
```

**Tailwind classes:**
- `shadow-sm` — Subtle shadows (cards, inputs)
- `shadow-md` — Medium shadows (dropdowns, popovers)
- `shadow-lg` — Large shadows (modals, dialogs)

---

### Border Radius (blijven hetzelfde)

```css
--radius: 0.625rem;  /* 10px - base radius */
```

**Tailwind classes:**
- `rounded-sm` — 4px (small elements)
- `rounded-md` — 8px (buttons, inputs)
- `rounded-lg` — 10px (cards, blocks)
- `rounded-2xl` — 16px (chat bubbles, large cards)
- `rounded-full` — 9999px (avatars, badges)

---

### Typography Scale

```css
/* Font sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */

/* Line heights */
--line-height-tight: 1.2;     /* Headings */
--line-height-relaxed: 1.8;   /* Body text */
```

**Tailwind classes:**
- `text-xs` — Metadata, labels
- `text-sm` — Secondary text, descriptions
- `text-base` — Body text (default)
- `text-lg` — Input fields, chat messages
- `text-xl` — Headings, titles

---

### Spacing Scale (blijven hetzelfde)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

**Tailwind classes:**
- `p-2` / `m-2` — 8px padding/margin
- `p-4` / `m-4` — 16px (most common)
- `p-6` / `m-6` — 24px (cards, blocks)
- `gap-4` — 16px gap in flex/grid

---

### 🎨 Design Token Usage in v3.0

#### Chat Panel
- Background: `bg-white` (`--color-surface`)
- Border right: `border-r border-slate-200` (`--color-border`)
- Width: `w-[40%]` (desktop), `w-full` (mobile)

#### Chat Messages
- User: `bg-amber-50 border-amber-200` (NEW)
- Assistant: `bg-slate-100 border-slate-300` (NEW)
- Padding: `p-3` (12px) of `p-4` (16px)
- Border radius: `rounded-2xl` met accent `rounded-tr-sm` (user) of `rounded-tl-sm` (assistant)

#### Artifact Area
- Background: `bg-slate-50` (`--color-surface-secondary`)
- Width: `w-[60%]` (desktop), `w-full` (mobile)

#### Artifact Container (bestaande blocks blijven ongewijzigd)
- Background: `bg-white`
- Border: `border border-slate-200`
- Border radius: `rounded-lg`
- Shadow: `shadow-lg`
- Padding: `p-6`

---

## E0.S2 — Component Inventory

🎯 **Doel:** Lijst van alle blocks die herbruikbaar zijn vs. nieuwe componenten voor v3.0.

### ✅ Bestaande Components (blijven ongewijzigd)

Deze components werken in v3.0 zonder wijzigingen (alleen de wrapper wijzigt):

| Component | Locatie | Functie | Wijzigingen v3.0 |
|-----------|---------|---------|------------------|
| **ContextBar** | `components/swift/command-center/context-bar.tsx` | Dienst, patient selector, user info | ✅ Geen wijzigingen |
| **OfflineBanner** | `components/swift/command-center/offline-banner.tsx` | Offline detectie en banner | ✅ Geen wijzigingen |
| **DagnotatieBlock** | `components/swift/blocks/dagnotitie-block.tsx` | Dagnotitie maken | ✅ Geen wijzigingen |
| **ZoekenBlock** | `components/swift/blocks/zoeken-block.tsx` | Patient zoeken | ✅ Geen wijzigingen |
| **OverdrachtBlock** | `components/swift/blocks/overdracht-block.tsx` | Dienst overdracht | ⚠️ Uitbreiding: AI-filtering (E5.S1) |
| **PatientContextCard** | `components/swift/blocks/patient-context-card.tsx` | Patient overzicht | ✅ Geen wijzigingen |
| **FallbackPicker** | `components/swift/blocks/fallback-picker.tsx` | Intent fallback | ✅ Geen wijzigingen |
| **BlockContainer** | `components/swift/blocks/block-container.tsx` | Generic wrapper voor blocks | ✅ Geen wijzigingen |

**Total:** 8 components blijven werken zoals ze zijn (behalve OverdrachtBlock met uitbreiding in E5).

---

### 🔄 Components die WIJZIGEN

| Component | Locatie | v2.1 Functie | v3.0 Wijziging |
|-----------|---------|--------------|----------------|
| **CommandCenter** | `components/swift/command-center/command-center.tsx` | 4-zone layout (context, canvas, recent, input) | → Split-screen layout (40/60) |
| **CommandInput** | `components/swift/command-center/command-input.tsx` | Single-line command input | → Multi-line chat input (onderaan chat panel) |
| **CanvasArea** | `components/swift/command-center/canvas-area.tsx` | Centered block display | → Vervangen door ArtifactArea (rechts, 60%) |
| **RecentStrip** | `components/swift/command-center/recent-strip.tsx` | Recent actions strip | → Verwijderen of integreren in chat history |

**Total:** 4 components wijzigen.

---

### 🆕 Nieuwe Components voor v3.0

Deze components moeten worden gebouwd:

| Component | Locatie | Functie | Epic | Story Points |
|-----------|---------|---------|------|--------------|
| **ChatPanel** | `components/swift/chat/chat-panel.tsx` | Scrollable message list, auto-scroll | E2 | 5 SP |
| **ChatMessage** | `components/swift/chat/chat-message.tsx` | Message bubble (user/assistant/system/error) | E2 | 3 SP |
| **ChatInput** | `components/swift/chat/chat-input.tsx` | Multi-line input onderaan chat | E2 | 2 SP |
| **StreamingIndicator** | `components/swift/chat/streaming-indicator.tsx` | Pulsating dots tijdens AI response | E2 | 1 SP |
| **ChatActionLink** | `components/swift/chat/chat-action-link.tsx` | Klikbare action links in chat | E3 | 1 SP |
| **ArtifactArea** | `components/swift/artifacts/artifact-area.tsx` | Right-side area (60%) voor blocks | E1 | 2 SP |
| **ArtifactContainer** | `components/swift/artifacts/artifact-container.tsx` | Wrapper met tabs (max 3 artifacts) | E4 | 5 SP |
| **ArtifactTab** | `components/swift/artifacts/artifact-tab.tsx` | Tab component voor artifact switching | E4 | 2 SP |
| **ArtifactPlaceholder** | `components/swift/artifacts/artifact-placeholder.tsx` | Placeholder: "Artifacts verschijnen hier" | E4 | 1 SP |
| **LinkedEvidence** | `components/swift/shared/linked-evidence.tsx` | Bronnotitie links met hover preview | E5 | 3 SP |

**Total:** 10 nieuwe components, **25 Story Points**

---

### 📊 Component Architecture (v3.0)

```
components/swift/
├── command-center/
│   ├── command-center.tsx         🔄 WIJZIGT - Split-screen layout
│   ├── context-bar.tsx            ✅ BLIJFT
│   └── offline-banner.tsx         ✅ BLIJFT
│
├── chat/                           🆕 NIEUW
│   ├── chat-panel.tsx
│   ├── chat-message.tsx
│   ├── chat-input.tsx
│   ├── streaming-indicator.tsx
│   └── chat-action-link.tsx
│
├── artifacts/                      🆕 NIEUW
│   ├── artifact-area.tsx
│   ├── artifact-container.tsx
│   ├── artifact-tab.tsx
│   └── artifact-placeholder.tsx
│
├── blocks/                         ✅ BLIJVEN
│   ├── dagnotitie-block.tsx
│   ├── zoeken-block.tsx
│   ├── overdracht-block.tsx       ⚠️ + AI-filtering (E5)
│   ├── patient-context-card.tsx
│   ├── fallback-picker.tsx
│   └── block-container.tsx
│
└── shared/                         🆕 NIEUW (partial)
    └── linked-evidence.tsx
```

---

### 🎯 Component Reuse Strategy

**Maximize reuse:**
1. ✅ **Alle blocks blijven werken** — Geen refactor nodig
2. ✅ **Context Bar blijft** — Shift colors, patient selector unchanged
3. ✅ **Offline Banner blijft** — Error handling unchanged
4. ✅ **Block styling blijft** — Category colors, sizes, shadows unchanged

**Minimize new code:**
1. 🆕 **Chat components** — 10 nieuwe components, maar simpel (message bubbles, input)
2. 🆕 **Artifact wrapper** — 4 components voor tab management
3. 🔄 **Layout refactor** — Alleen CommandCenter wijzigt naar split-screen

**Total new code estimate:**
- **New components:** ~600 LOC (10 components × ~60 LOC average)
- **Modified components:** ~200 LOC (4 components × ~50 LOC changes)
- **Total:** ~800 LOC (reasonable scope)

---

### ✅ E0.S1 & E0.S2 Complete

**E0.S1 - Design Tokens Audit:** ✅ Compleet
- Alle kleuren gedocumenteerd
- Chat message colors toegevoegd (NEW)
- Spacing, shadows, typography verified
- Verpleegkundig category colors verified
- Shift colors verified

**E0.S2 - Component Inventory:** ✅ Compleet
- 8 bestaande components blijven werken
- 4 components wijzigen (layout refactor)
- 10 nieuwe components nodig (~25 SP)
- Architecture diagram gemaakt

**Next:** E0.S3 - Medical scribe system prompt

---

## Referenties

- `app/globals.css` — Design tokens definitie
- `tailwind.config.ts` — Tailwind color palette
- `lib/types/report.ts` — Category config
- `components/swift/command-center/context-bar.tsx` — Shift config
- `components/swift/blocks/` — Bestaande blocks
