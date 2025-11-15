# 🎨 Design Review: Dot Shader Background Component

**Datum:** 15-11-2024  
**Review Team:** Design & UX  
**Vraag:** Kan het dot-shader-background component gebruikt worden voor marketingpagina en/of EPD app?

---

## 📋 Context Analyse

### Manifesto Kernwaarden
- **Innovatie & Disruptie:** "AI gaat software eten" - technologische vooruitgang centraal
- **Snelheid:** "4 weken vs 12 maanden" - efficiency en moderniteit
- **Bewijs door doen:** "Beste manier om toekomst te voorspellen is hem bouwen"
- **Digitale transformatie:** Software on Demand als nieuwe realiteit

### UX Stylesheet Principes
- **Lage cognitieve belasting:** Focus op content, niet op decoratie
- **Toegankelijkheid:** WCAG AA contrast, geen afleidende elementen
- **"Less is more":** Accentpalet bewust klein gehouden → minder visuele ruis
- **Functioneel design:** Elke visuele keuze moet doel dienen

### Shader Component Eigenschappen
- **Technisch:** Three.js shader met WebGL rendering
- **Visueel:** Geanimeerde dots met mouse trail interactie
- **Performance:** High-performance mode, GPU-accelerated
- **Theme support:** Dark/light mode compatible
- **Subtiel:** Lage opacity (0.025-0.15), niet dominant

---

## 🎯 Design Team Advies

### ✅ **AANBEVELING: Strategische Inzet**

Het design team adviseert **gecontroleerd gebruik** van het shader component, met duidelijke context-specifieke richtlijnen:

---

## 📍 Marketing Website: **JA, met voorwaarden**

### Waarom het werkt:
1. **Manifesto alignment:** Het component straalt technologische innovatie uit - perfect voor "Software on Demand" messaging
2. **Differentiatie:** Visueel onderscheidend van traditionele SaaS-landing pages
3. **Engagement:** Mouse trail interactie verhoogt tijd op pagina
4. **Credibility:** Toont technische vaardigheid zonder te overdrijven

### Implementatie Richtlijnen:

**Hero Section (Primaire Inzet)**
- ✅ Shader als full-screen achtergrond achter hero content
- ✅ Zeer lage opacity (0.02-0.05) - subtiel, niet dominant
- ✅ Content overlay met sterke contrast (wit op donker, of donker op licht)
- ✅ Performance: Lazy load alleen wanneer hero in viewport

**Secties (Secundaire Inzet)**
- ⚠️ Optioneel in "How it Works" of "Technology" secties
- ❌ NIET in comparison tables, ROI calculator, of formulier secties
- ❌ NIET op mobile (performance + UX overwegingen)

**Technische Aanpassingen Nodig:**
```typescript
// Marketing-specifieke configuratie
const marketingConfig = {
  dotOpacity: 0.03,        // Zeer subtiel
  gridSize: 80,            // Fijner grid voor eleganter effect
  disableMouseTrail: false, // Interactiviteit behouden
  performanceMode: 'high', // GPU optimization
  mobileFallback: 'gradient' // Fallback voor mobile
}
```

**Contrast Check:**
- Tekst op shader achtergrond moet voldoen aan WCAG AA (4.5:1)
- Gebruik semi-transparante overlay indien nodig
- Test met verschillende tekstgroottes

---

## 🏥 EPD App: **NEE, tenzij zeer subtiel**

### Waarom het risicovol is:
1. **Cognitieve belasting:** Medische professionals hebben focus nodig - animaties zijn afleidend
2. **UX Stylesheet conflict:** Direct tegenstrijdig met "lage cognitieve belasting" principe
3. **Toegankelijkheid:** Kan problemen veroorzaken voor gebruikers met motion sensitivity
4. **Performance:** Elke milliseconde telt in productie-omgevingen

### Uitzondering: Onboarding/Welcome Screen
- ✅ **Alleen** op eerste login/welcome screen
- ✅ Zeer korte duur (3-5 seconden), dan fade-out
- ✅ Optioneel: "Skip animation" knop voor toegankelijkheid
- ❌ **NOOIT** tijdens actieve workflows (intake, profiel, behandelplan)

**Implementatie Als Uitzondering:**
```typescript
// EPD-specifieke configuratie (alleen welcome)
const epdWelcomeConfig = {
  dotOpacity: 0.01,        // Extreem subtiel
  gridSize: 120,           // Zeer fijn grid
  disableMouseTrail: true, // Geen interactiviteit
  autoFadeOut: true,       // Fade na 3 seconden
  skipButton: true,       // Toegankelijkheid
  reducedMotion: true      // Respecteer prefers-reduced-motion
}
```

---

## 🎨 Stylesheet Matching Analyse

### Kleuren Compatibiliteit

**Light Theme Match:**
- ✅ Shader bg: `#F4F5F5` matcht stylesheet `#F8FAFC` (zeer dichtbij)
- ✅ Shader dots: `#e1e1e1` matcht border kleur `#E2E8F0` (harmonisch)
- ⚠️ Aanpassing nodig: Shader moet exact `#F8FAFC` gebruiken voor consistency

**Dark Theme Match:**
- ✅ Shader bg: `#121212` is acceptabel voor dark mode
- ✅ Shader dots: `#FFFFFF` met lage opacity werkt goed
- ⚠️ Stylesheet heeft geen dark mode spec gedefinieerd - dit moet eerst worden uitgewerkt

**Aanbevolen Aanpassingen:**
```typescript
// Update shader theme colors om exact te matchen
const getThemeColors = () => {
  switch (theme) {
    case 'light':
      return {
        dotColor: '#E2E8F0',      // Match border color
        bgColor: '#F8FAFC',       // Match app background
        dotOpacity: 0.03           // Zeer subtiel voor marketing
      }
    case 'dark':
      return {
        dotColor: '#475569',      // Match secondary text
        bgColor: '#0F172A',        // Match primary text (inverted)
        dotOpacity: 0.02           // Nog subtieler voor dark
      }
  }
}
```

---

## ⚖️ "Less is More" vs "Digital Innovation"

### Design Team Consensus:

**Marketing Website:**
- **"Less is more"** geldt voor **content en copy** - niet voor visuele impact
- Shader component kan **strategisch** gebruikt worden om innovatie te communiceren
- **Voorwaarde:** Het moet de boodschap versterken, niet afleiden
- **Test:** A/B test met en zonder shader - meet engagement metrics

**EPD App:**
- **"Less is more"** is hier **absoluut** - elke pixel moet functioneel zijn
- Shader component is **decoratief** en voegt geen functionele waarde toe
- **Uitzondering:** Welcome screen kan één keer indruk maken, daarna weg

---

## 📊 Risico Analyse

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| **Performance impact** | Medium | Hoog | Lazy loading, mobile fallback, performance monitoring |
| **Toegankelijkheid issues** | Medium | Hoog | `prefers-reduced-motion` respecteren, skip optie |
| **Cognitieve overload** | Hoog | Medium | Zeer lage opacity, alleen hero section |
| **Stylesheet mismatch** | Laag | Laag | Kleuren aanpassen naar exacte stylesheet waarden |
| **Mobile performance** | Hoog | Medium | Automatische fallback naar gradient |

---

## ✅ Finale Aanbeveling

### Marketing Website: **GO** ✅
- Implementeer in hero section met zeer lage opacity
- Pas kleuren aan naar exacte stylesheet waarden
- Voeg mobile fallback toe
- Monitor performance metrics
- Test toegankelijkheid met screen readers

### EPD App: **NO GO** ❌
- **Behalve:** Welcome screen (één keer, met skip optie)
- Focus op functioneel design volgens UX stylesheet
- Gebruik subtiele gradients of solid colors voor achtergronden

### Implementatie Prioriteit:
1. **Week 1:** Marketing hero section met shader (als MVP)
2. **Week 2:** Performance optimalisatie + mobile fallback
3. **Week 4:** A/B test resultaten evalueren
4. **Post-launch:** Beslissing over permanente implementatie

---

## 🎯 Design Principes Samenvatting

**Voor Marketing:**
> "Innovatie moet zichtbaar zijn, maar niet opdringerig"

**Voor EPD:**
> "Elke visuele keuze moet de gebruiker helpen, niet afleiden"

**Algemeen:**
> "Technologie moet de boodschap dienen, niet domineren"

---

**Design Team Sign-off:**  
✅ Marketing website: Goedkeuring met voorwaarden  
❌ EPD app: Afwijzing (behalve welcome screen)  
📝 Stylesheet aanpassingen: Vereist voor consistency

