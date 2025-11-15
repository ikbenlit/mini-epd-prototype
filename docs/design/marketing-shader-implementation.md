# 🚀 Marketing Shader Implementation Guide

**Doel:** Praktische implementatie van dot-shader component voor marketing website hero section.

---

## 📐 Design Specificaties

### Hero Section Layout

```
┌─────────────────────────────────────┐
│  [Shader Background - zeer subtiel] │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Hero Content Overlay       │   │
│  │  - Headline (wit/donker)    │   │
│  │  - Subheadline              │   │
│  │  - CTA Buttons              │   │
│  │  - Live Metrics Counter     │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Visuele Hiërarchie
1. **Shader:** Opacity 0.02-0.03 (bijna onzichtbaar, maar aanwezig)
2. **Content Overlay:** Semi-transparant of solid (afhankelijk van contrast)
3. **Tekst:** Hoog contrast (wit op donker, of donker op licht)

---

## 🔧 Technische Implementatie

### Stap 1: Aangepaste Marketing Variant

```typescript
// components/ui/marketing-shader-background.tsx
'use client'

import { DotScreenShader } from './dot-shader-background'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface MarketingShaderProps {
  variant?: 'hero' | 'section'
  className?: string
}

export function MarketingShader({ variant = 'hero', className }: MarketingShaderProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Fallback voor mobile of reduced motion
  if (!mounted || reducedMotion) {
    return (
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 ${className}`}
        aria-hidden="true"
      />
    )
  }

  // Desktop: shader component
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <DotScreenShader />
      {/* Subtle overlay voor betere tekst leesbaarheid */}
      <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 pointer-events-none" />
    </div>
  )
}
```

### Stap 2: Hero Section Component

```typescript
// app/(marketing)/components/hero-section.tsx
import { MarketingShader } from '@/components/ui/marketing-shader-background'
import { LiveMetricsCounter } from './live-metrics-counter'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Shader Background */}
      <MarketingShader variant="hero" className="z-0" />
      
      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6">
            Software on Demand
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-8">
            Van €100.000 en 12 maanden naar €200 en 4 weken
          </p>
          
          {/* Live Metrics */}
          <LiveMetricsCounter />
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Bekijk Demo
            </button>
            <button className="px-8 py-4 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition">
              Lees Manifesto
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
```

### Stap 3: Shader Component Aanpassingen

```typescript
// Aanpassingen in dot-shader-background.tsx voor marketing gebruik

// In Scene component, update getThemeColors:
const getThemeColors = () => {
  switch (theme) {
    case 'light':
      return {
        dotColor: '#E2E8F0',      // Match UX stylesheet border color
        bgColor: '#F8FAFC',        // Match UX stylesheet app background
        dotOpacity: 0.03           // Zeer subtiel voor marketing
      }
    case 'dark':
      return {
        dotColor: '#475569',       // Match secondary text
        bgColor: '#0F172A',        // Match primary text (inverted)
        dotOpacity: 0.02           // Nog subtieler
      }
    default:
      return {
        dotColor: '#E2E8F0',
        bgColor: '#F8FAFC',
        dotOpacity: 0.03
      }
  }
}

// Update gridSize voor eleganter effect
const gridSize = 80  // Fijner dan standaard 100
```

---

## 🎨 Styling Integratie

### Tailwind Classes voor Content Overlay

```css
/* Zorg voor goede contrast over shader */
.hero-content {
  /* Optioneel: semi-transparante achtergrond voor tekst */
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  
  /* Of: solid achtergrond met padding */
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### Contrast Check

**Test Scenario's:**
1. Wit tekst op shader achtergrond → Minimaal 4.5:1 contrast
2. Donker tekst op shader achtergrond → Minimaal 4.5:1 contrast
3. Met overlay → Contrast moet verbeteren

**Tools:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Browser DevTools → Accessibility panel

---

## 📱 Mobile Responsive

### Breakpoint Strategie

```typescript
// components/ui/marketing-shader-background.tsx

export function MarketingShader({ variant, className }: MarketingShaderProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // Tailwind md breakpoint
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mobile: gradient fallback (performance)
  if (isMobile) {
    return (
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 ${className}`}
        aria-hidden="true"
      />
    )
  }

  // Desktop: shader
  return <DotScreenShader />
}
```

**Reden:**
- Mobile GPU performance beperkt
- Batterij impact
- UX: Gebruikers verwachten snelle laadtijden op mobile

---

## ⚡ Performance Optimalisatie

### Lazy Loading

```typescript
import dynamic from 'next/dynamic'

// Lazy load shader alleen wanneer hero in viewport
const MarketingShader = dynamic(
  () => import('@/components/ui/marketing-shader-background').then(mod => mod.MarketingShader),
  { 
    ssr: false, // Client-side only
    loading: () => <div className="absolute inset-0 bg-slate-50" />
  }
)
```

### Intersection Observer

```typescript
// components/ui/marketing-shader-background.tsx
export function MarketingShader({ variant, className }: MarketingShaderProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  if (!shouldRender) {
    return <div ref={ref} className={`absolute inset-0 bg-slate-50 ${className}`} />
  }

  return <DotScreenShader />
}
```

---

## ♿ Toegankelijkheid

### Reduced Motion Support

```typescript
// Automatisch detecteren en respecteren
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (prefersReducedMotion) {
  // Geen animaties, statische gradient
  return <StaticGradientBackground />
}
```

### Skip Animation Knop

```typescript
// Optioneel: knop om animatie uit te zetten
<button 
  onClick={() => setAnimationEnabled(false)}
  className="sr-only focus:not-sr-only"
>
  Skip animatie
</button>
```

### ARIA Labels

```typescript
<div 
  className="absolute inset-0"
  aria-hidden="true"  // Decoratief element, niet voor screen readers
  role="presentation"
>
  <DotScreenShader />
</div>
```

---

## 📊 Monitoring & Metrics

### Performance Tracking

```typescript
// Track shader performance
useEffect(() => {
  const startTime = performance.now()
  
  // Na render
  requestAnimationFrame(() => {
    const renderTime = performance.now() - startTime
    if (renderTime > 100) {
      console.warn('Shader render tijd hoog:', renderTime)
      // Mogelijk fallback activeren
    }
  })
}, [])
```

### A/B Test Setup

```typescript
// Variant A: Met shader
// Variant B: Zonder shader (gradient)

const useShader = () => {
  // Cookie/localStorage based variant assignment
  const variant = localStorage.getItem('hero-variant') || 'A'
  return variant === 'A'
}
```

**Metrics te meten:**
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Bounce rate
- Engagement tijd
- Conversion rate

---

## ✅ Checklist

### Pre-Launch
- [ ] Shader opacity op 0.02-0.03 (zeer subtiel)
- [ ] Kleuren matchen exact UX stylesheet
- [ ] Mobile fallback geïmplementeerd
- [ ] Reduced motion support
- [ ] Contrast check gedaan (WCAG AA)
- [ ] Performance test (< 100ms render tijd)
- [ ] Lazy loading geïmplementeerd

### Post-Launch
- [ ] Performance monitoring actief
- [ ] A/B test resultaten analyseren
- [ ] Gebruikersfeedback verzamelen
- [ ] Accessibility audit uitgevoerd

---

## 🎯 Conclusie

Het shader component kan **strategisch** gebruikt worden op de marketing website, mits:
1. Zeer lage opacity (0.02-0.03)
2. Alleen in hero section
3. Mobile fallback aanwezig
4. Toegankelijkheid gewaarborgd
5. Performance geoptimaliseerd

**Resultaat:** Innovatieve uitstraling zonder UX compromissen.

