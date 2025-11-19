# Webpack Module Resolution Error

**Error:** `Cannot read properties of undefined (reading 'call')`

## Root Cause

Dit is een **bekend probleem in Next.js 15-16** wanneer Server Components direct Client Components importeren met named exports.

### Wat gebeurt er technisch?

1. **Server Component** (bijv. `layout.tsx`) importeert een **Client Component** (met `'use client'` directive)
2. Webpack bundelt de Client Component in een aparte chunk voor client-side hydration
3. Next.js maakt een proxy module op de Server/Client boundary
4. Bij het laden van de webpack chunk verwacht de loader een functie export
5. Door timing/caching issues is de export soms `undefined`
6. Dit geeft: `TypeError: Cannot read properties of undefined (reading 'call')`

## Wanneer treedt dit op?

### Situaties die dit veroorzaken:

1. **Direct import van Client Component in Server Component**
   ```tsx
   // layout.tsx (Server Component)
   import { ClientComponent } from './client-component' // ❌ PROBLEEM
   ```

2. **Named exports met 'use client'**
   ```tsx
   // client-component.tsx
   'use client'
   export function ClientComponent() { ... } // ❌ Kan problemen geven
   ```

3. **Webpack caching issues** na HMR (Hot Module Reload)

4. **Type imports die conflicteren**
   ```tsx
   import type { Props } from './client-component' // Kan webpack verwarren
   import { ClientComponent } from './client-component'
   ```

## Oplossingen

### Optie 1: Wrapper Component (GEKOZEN)

Maak een tussenlaag die de import isoleert:

```tsx
// client-component-wrapper.tsx
import { ClientComponent } from './client-component'

export default function ClientComponentWrapper(props) {
  return <ClientComponent {...props} />
}

// layout.tsx (Server Component)
import ClientComponent from './client-component-wrapper' // ✅ WERKT
```

**Voordelen:**
- Eenvoudig
- Geen code wijzigingen in originele component
- Isoleert webpack module boundary

**Nadelen:**
- Extra bestand nodig
- Iets meer boilerplate

### Optie 2: Default Export

Wijzig Client Component naar default export:

```tsx
// client-component.tsx
'use client'

function ClientComponent() { ... }

export default ClientComponent // ✅ Default export

// layout.tsx
import ClientComponent from './client-component' // ✅ WERKT
```

**Voordelen:**
- Geen extra bestanden
- Webpack handelt default exports beter af

**Nadelen:**
- Originele component moet aangepast worden
- Inconsistent als je meerdere exports nodig hebt

### Optie 3: Dynamic Import (NIET AANBEVOLEN voor layouts)

```tsx
// layout.tsx
import dynamic from 'next/dynamic'

const ClientComponent = dynamic(
  () => import('./client-component').then(mod => mod.ClientComponent)
)
// Note: SSR false kan NIET in Server Components
```

**Nadelen:**
- Kan niet `ssr: false` gebruiken in Server Components
- Loading state issues
- Niet geschikt voor kritieke UI componenten

### Optie 4: Clean Cache en Rebuild

Soms is het gewoon cache corruptie:

```bash
rm -rf .next node_modules
pnpm install
npm run dev
```

## Preventie: Best Practices

### 1. Gebruik default exports voor Client Components

```tsx
// ✅ GOED
'use client'
export default function MyClientComponent() { ... }

// ❌ VERMIJD
'use client'
export function MyClientComponent() { ... }
```

### 2. Maak wrapper components voor complexe imports

Als je een Client Component in een Server Component layout nodig hebt:

```
app/
  layout.tsx (Server)
  components/
    client-sidebar.tsx ('use client')
    client-sidebar-wrapper.tsx (wrapper)
```

### 3. Splits type imports

```tsx
// ✅ GOED
import type { Props } from './types'
import ClientComponent from './client-component'

// ❌ VERMIJD mixed imports
import { type Props, ClientComponent } from './client-component'
```

### 4. Clear cache bij persistente errors

```bash
rm -rf .next
npm run dev
```

### 5. Check webpack chunks

Als de error blijft terugkomen, check webpack output:

```bash
# In terminal met dev server
# Kijk naar compile output voor errors
```

## Specifieke Case: Release Sidebar

**Probleem:**
- `app/(marketing)/releases/layout.tsx` (Server) importeerde direct `ReleaseSidebar` (Client)
- Named export + 'use client' combinatie
- Webpack module 356 resolution failure

**Oplossing:**
Wrapper component gemaakt: `release-sidebar-wrapper.tsx`

**Bestanden:**
```
app/(marketing)/releases/
├── layout.tsx                            # Server Component
├── components/
│   ├── release-sidebar.tsx              # Client Component (named export)
│   └── release-sidebar-wrapper.tsx      # Wrapper (default export)
```

**Code:**
```tsx
// layout.tsx
import ReleaseSidebar from './components/release-sidebar-wrapper' // ✅

// release-sidebar-wrapper.tsx
import { ReleaseSidebar } from './release-sidebar'
export default function ReleaseSidebarWrapper(props) {
  return <ReleaseSidebar {...props} />
}
```

## Gerelateerde Issues

- Next.js issue: https://github.com/vercel/next.js/issues/...
- Webpack module federation issues met RSC
- Fast Refresh compatibility met Server/Client boundaries

## Andere Plekken in Codebase

Deze Client Components gebruiken momenteel named exports en kunnen hetzelfde probleem geven:

```
app/(marketing)/components/
  - auth-code-handler.tsx
  - hero-section-client.tsx
  - reading-progress.tsx
  - marketing-shader.tsx
  - minimal-nav.tsx

app/epd/clients/components/
  - client-form.tsx
  - client-list.tsx

app/epd/clients/[id]/components/
  - client-tabs.tsx
  - intake-tab.tsx
  - plan-tab.tsx
  - profile-tab.tsx
```

**Actie:** Check of deze geïmporteerd worden in Server Components. Zo ja, overweeg wrappers of default exports.

## Quick Reference

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| `undefined reading 'call'` | Named export Client in Server | Use wrapper or default export |
| Intermittent/disappears on refresh | Webpack cache | Clear .next, restart |
| Only in production build | SSR/hydration mismatch | Check dynamic imports |
| After HMR (file save) | Fast Refresh issue | Full reload or restart dev |

## Samenvatting

**Root cause:** Next.js Server/Client Component boundary + webpack module chunking + named exports = module resolution failure

**Best fix:** Wrapper component met default export

**Prevention:**
1. Default exports voor Client Components
2. Wrappers voor Server → Client imports in layouts
3. Clean cache bij persistente problemen
4. Vermijd mixed type/component imports
