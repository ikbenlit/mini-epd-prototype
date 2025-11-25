# Component Organisatie Strategie

## Overzicht

Dit project gebruikt de **colocation pattern** voor component organisatie, een best practice in Next.js App Router architectuur.

## Twee Component Locaties

### 1. Centrale Components (`/components`)

**Doel:** Herbruikbare, generieke components die door meerdere delen van de app gebruikt worden.

**Structuur:**
```
components/
├── ui/                          # Algemene UI componenten (shadcn/ui)
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   └── ...
├── speech-recorder-streaming.tsx  # Herbruikbare feature component
├── confidence-text.tsx           # Herbruikbare display component
└── rich-text-editor.tsx         # Herbruikbare editor component
```

**Criteria voor centrale components:**
- ✅ Gebruikt in 2+ verschillende features/routes
- ✅ Geen specifieke business logic voor één feature
- ✅ Generiek en configureerbaar via props
- ✅ Zou in een component library kunnen zitten

**Voorbeelden:**
```typescript
// ✅ Gebruikt in behandeladvies, rapportage, en andere features
import { SpeechRecorderStreaming } from '@/components/speech-recorder-streaming';

// ✅ Generieke UI component
import { Button } from '@/components/ui/button';
```

### 2. Route-Specifieke Components (`/app/.../components`)

**Doel:** Feature-specifieke components die alleen gebruikt worden binnen één route of feature.

**Structuur:**
```
app/
└── epd/
    ├── components/              # Gedeeld binnen EPD module
    │   └── epd-sidebar.tsx
    └── patients/
        ├── components/          # Gedeeld binnen patients feature
        │   ├── patient-list.tsx
        │   └── patient-form.tsx
        └── [id]/
            └── rapportage/
                └── components/  # Specifiek voor rapportage feature
                    ├── report-composer.tsx
                    ├── report-timeline.tsx
                    └── rapportage-workspace.tsx
```

**Criteria voor route-specifieke components:**
- ✅ Gebruikt alleen binnen één feature/route
- ✅ Bevat feature-specifieke business logic
- ✅ Tight coupling met de parent route
- ✅ Geen hergebruik in andere features

**Voorbeelden:**
```typescript
// ✅ Alleen gebruikt in rapportage feature
import { ReportComposer } from './components/report-composer';

// ✅ Specifieke business logic voor behandeladvies
import { TreatmentAdviceForm } from './components/treatment-advice-form';
```

## Hiërarchie & Scope

Components worden georganiseerd op basis van hun **reuse scope**:

```
┌─────────────────────────────────────────────────────────┐
│ /components                                              │
│ ↳ App-wide herbruikbare components                      │
│   (gebruikt in 2+ features)                             │
└─────────────────────────────────────────────────────────┘
         ↓ imports van
┌─────────────────────────────────────────────────────────┐
│ /app/epd/components                                      │
│ ↳ EPD module-wide components                            │
│   (gedeeld tussen patient, intake, rapportage)          │
└─────────────────────────────────────────────────────────┘
         ↓ imports van
┌─────────────────────────────────────────────────────────┐
│ /app/epd/patients/components                            │
│ ↳ Patient feature components                            │
│   (gedeeld tussen patient routes)                       │
└─────────────────────────────────────────────────────────┘
         ↓ imports van
┌─────────────────────────────────────────────────────────┐
│ /app/epd/patients/[id]/rapportage/components           │
│ ↳ Rapportage page-specifieke components                │
│   (alleen gebruikt in rapportage)                       │
└─────────────────────────────────────────────────────────┘
```

## Statistieken (Huidige State)

- **Centrale components**: 18 components
- **Route-specifieke components**: 56 components
- **Duplicaten**: 0 ✅

## Voordelen van Deze Aanpak

### 1. **Betere Code Organisation**
- Components staan dichtbij waar ze gebruikt worden
- Makkelijker te vinden en te onderhouden
- Duidelijke scope en ownership

### 2. **Betere Performance**
- Kleinere bundles per route (code splitting)
- Alleen relevante components worden geladen
- Tree-shaking werkt beter

### 3. **Betere Developer Experience**
- Minder zoeken in grote component directories
- Duidelijk wanneer een component herbruikbaar is
- Makkelijker refactoren

### 4. **Schaalbaarheid**
- Nieuwe features kunnen onafhankelijk components toevoegen
- Geen "god component folder" met 100+ bestanden
- Teams kunnen parallel werken zonder conflicts

## Decision Tree: Waar plaats ik een component?

```
Wordt de component gebruikt in 2+ verschillende features?
│
├─ Ja → Is het een generieke UI component (button, dialog, etc)?
│       │
│       ├─ Ja → /components/ui/{name}.tsx
│       │
│       └─ Nee → /components/{name}.tsx
│
└─ Nee → Wordt het gedeeld binnen een feature module?
          │
          ├─ Ja → /app/{feature}/components/{name}.tsx
          │
          └─ Nee → /app/{feature}/{subfeature}/components/{name}.tsx
```

## Voorbeelden

### ✅ Goed: SpeechRecorderStreaming in centrale folder

**Waarom?** Gebruikt in meerdere features:
```typescript
// app/epd/patients/[id]/rapportage/components/report-composer.tsx
import { SpeechRecorderStreaming } from '@/components/speech-recorder-streaming';

// app/epd/patients/[id]/intakes/[intakeId]/behandeladvies/components/treatment-advice-form.tsx
import { SpeechRecorderStreaming } from '@/components/speech-recorder-streaming';
```

### ✅ Goed: ReportComposer in rapportage/components

**Waarom?** Alleen gebruikt in rapportage feature:
```typescript
// app/epd/patients/[id]/rapportage/page.tsx
import { ReportComposer } from './components/report-composer';
```

### ❌ Fout: Generieke Button in route folder

```typescript
// ❌ NIET DOEN
// app/epd/patients/components/button.tsx
export function Button() { ... }

// ✅ WEL DOEN
// components/ui/button.tsx
export function Button() { ... }
```

### ❌ Fout: Feature-specifieke component in centrale folder

```typescript
// ❌ NIET DOEN
// components/report-composer.tsx (alleen gebruikt in rapportage)

// ✅ WEL DOEN
// app/epd/patients/[id]/rapportage/components/report-composer.tsx
```

## Refactoring Workflow

### Wanneer een route-component herbruikbaar wordt:

1. **Identificeer hergebruik**
   ```bash
   # Check waar component gebruikt wordt
   grep -r "import.*ComponentName" app/
   ```

2. **Verplaats naar centrale folder**
   ```bash
   mv app/feature/components/component.tsx components/
   ```

3. **Update alle imports**
   ```typescript
   // Van:
   import { Component } from '../components/component';

   // Naar:
   import { Component } from '@/components/component';
   ```

4. **Generaliseer indien nodig**
   - Verwijder feature-specifieke logic
   - Maak configureerbaar via props
   - Update TypeScript types

### Wanneer een centrale component feature-specifiek wordt:

(Dit komt zelden voor, maar kan gebeuren)

1. Check of component echt nergens anders gebruikt wordt
2. Verplaats naar meest specifieke route waar het gebruikt wordt
3. Update imports

## Related Patterns

### Server vs Client Components

```typescript
// Server Component (default in app/)
export default function ReportPage() { ... }

// Client Component (expliciet markeren)
'use client';
export function ReportComposer() { ... }
```

Route-specifieke components kunnen zowel server als client components zijn.
Centrale components zijn meestal client components (interactief).

### Composition Pattern

Route-specifieke components kunnen centrale components gebruiken:

```typescript
// app/epd/patients/[id]/rapportage/components/report-composer.tsx
import { SpeechRecorderStreaming } from '@/components/speech-recorder-streaming';
import { Button } from '@/components/ui/button';

export function ReportComposer() {
  return (
    <div>
      <SpeechRecorderStreaming />
      <Button>Save</Button>
    </div>
  );
}
```

## Best Practices

1. **Start route-specifiek** - Begin met components in route folders, verplaats alleen naar centraal als er echt hergebruik is
2. **Gebruik absolute imports** - `@/components/...` voor centrale, relative voor route-specifieke
3. **Avoid premature abstraction** - Wacht tot een component 2x gebruikt wordt voordat je het generaliseert
4. **Keep it colocated** - Plaats components zo dichtbij mogelijk bij waar ze gebruikt worden
5. **Document reusability** - Als een component generiek is, documenteer dan het gebruik in JSDoc

## Tools & Commands

### Find all components in a route:
```bash
find app/epd/patients/[id]/rapportage -name "*.tsx" -type f
```

### Check component usage:
```bash
grep -r "import.*ComponentName" app/
```

### Count components per location:
```bash
find components -name "*.tsx" | wc -l
find app -path "*/components/*" -name "*.tsx" | wc -l
```

## References

- [Next.js App Router: Project Organization](https://nextjs.org/docs/app/building-your-application/routing/colocation)
- [React: Thinking in React](https://react.dev/learn/thinking-in-react)
- [Component Composition Patterns](https://www.patterns.dev/react/compound-pattern)

---

**Last Updated:** 2024-11-24
**Status:** Active pattern in gebruik
