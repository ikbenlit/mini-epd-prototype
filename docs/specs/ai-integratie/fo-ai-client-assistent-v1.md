# 🧩 Functioneel Ontwerp (FO) – AI Cliënt Assistent

**Projectnaam:** Mini-ECD – AI Cliënt Assistent
**Versie:** v1.0
**Datum:** 01-12-2025
**Auteur:** Colin Lit

---

## 1. Doel en relatie met het PRD

**Doel van dit document:**
Dit FO beschrijft hoe de AI Cliënt Assistent functioneel werkt vanuit gebruikersperspectief. Het PRD beschrijft *wat* we bouwen (cliënt-aware chat), dit FO laat zien *hoe* de gebruiker dit ervaart.

**Scope (prototype):**
Gebaseerd op de huidige data in het EPD:
- **21 rapportages** (16 vrije notities, 5 behandeladviezen)
- **9 intakes** (7 Volwassenen, 1 Jeugd)
- **5 screenings** (1 geschikt, 1 niet geschikt, 3 open)
- **0 risico-assessments** (tabel bestaat, geen data)

---

## 2. Overzicht van de onderdelen

| Onderdeel | Beschrijving | Status |
|-----------|--------------|--------|
| **Chat Widget** | Bestaande floating widget rechtsonder | Uitbreiden |
| **Cliënt Indicator** | Header die toont welke cliënt actief is | Nieuw |
| **Cliënt Suggesties** | Voorbeeldvragen over de actieve cliënt | Nieuw |
| **Vraagtype Detectie** | Herkent of vraag over cliënt of systeem gaat | Nieuw |

---

## 3. User Stories

| ID | Rol | Doel / Actie | Verwachte waarde | Prioriteit |
|----|-----|--------------|------------------|------------|
| US-01 | Behandelaar | Samenvatting van rapportages opvragen | Snel overzicht voor consult | Hoog |
| US-02 | Behandelaar | Behandeladvies opvragen | Inzicht in geadviseerde zorg | Hoog |
| US-03 | Verpleegkundige | Recente notities bekijken | Overdracht voorbereiding | Hoog |
| US-04 | Intaker | Hulpvraag en screening status opvragen | Intake afronden | Middel |
| US-05 | Behandelaar | Documentatie-vraag stellen vanuit dossier | Hulp bij EPD gebruik | Middel |

---

## 4. Functionele werking per onderdeel

### 4.1 Chat Widget (uitgebreid)

**Huidige situatie:**
- Floating button rechtsonder (amber, sparkles icon)
- Beantwoordt alleen documentatie-vragen
- Toont 3 categorieën met voorbeeldvragen

**Nieuwe situatie:**
- Detecteert automatisch of gebruiker in cliëntdossier zit
- Toont cliënt-indicator in header wanneer in dossier
- Schakelt tussen cliënt- en documentatie-suggesties
- Beantwoordt vragen over de actieve cliënt

### 4.2 Cliënt Indicator

**Locatie:** Header van chat widget, onder "EPD Assistent"

**Weergave:**
```
┌─────────────────────────────┐
│ ✨ EPD Assistent            │
│ 📋 Dossier: Jan de Vries    │  ← Nieuw: cliënt indicator
└─────────────────────────────┘
```

**Gedrag:**
| Context | Indicator |
|---------|-----------|
| In cliëntdossier | `📋 Dossier: [Cliëntnaam]` |
| Buiten dossier | Geen indicator (alleen "EPD Assistent") |

### 4.3 Cliënt Suggesties

**Wanneer tonen:** Bij eerste opening chat in cliëntdossier, alleen welkomstbericht zichtbaar

**Categorieën en vragen (gebaseerd op beschikbare data):**

| Categorie | Icon | Voorbeeldvragen |
|-----------|------|-----------------|
| **Rapportages** | 📝 | "Geef een samenvatting van de rapportages", "Wat is er de laatste tijd genoteerd?", "Zijn er behandeladviezen?" |
| **Intake & Behandeling** | 🏥 | "Wat is het behandeladvies?", "Op welke afdeling loopt de intake?", "Is de intake afgerond?" |
| **Screening** | 📋 | "Wat was de hulpvraag?", "Wat is de screeningbeslissing?", "Is de cliënt geschikt bevonden?" |

**Interactie:**
1. Gebruiker ziet 3 categorieën (knoppen)
2. Klik op categorie → toont 3 voorbeeldvragen
3. Klik op vraag → vraag wordt direct verstuurd
4. "Terug" knop om naar categorieën te gaan

### 4.4 Vraagtype Detectie

**Doel:** Bepalen of een vraag over de cliënt of over het systeem gaat

**Gedrag:**

| Vraag | Detectie | Actie |
|-------|----------|-------|
| "Geef een samenvatting van de rapportages" | Cliënt | Beantwoord met cliëntdata |
| "Hoe maak ik een intake aan?" | Documentatie | Beantwoord met systeemdocumentatie |
| "Wat zijn de risico's?" | Cliënt | Beantwoord met cliëntdata (of "geen data") |
| "Hoe werkt de spraakherkenning?" | Documentatie | Beantwoord met systeemdocumentatie |

**Edge cases:**
| Situatie | Gedrag |
|----------|--------|
| Ambigue vraag in dossier | Default naar documentatie, toon hint |
| Cliënt-vraag buiten dossier | "Open eerst een cliëntdossier om vragen te stellen" |
| Data ontbreekt | "Er zijn nog geen [rapportages/risico's] voor deze cliënt" |

---

## 5. UI-overzicht

### 5.1 Chat Widget Layout

```
┌─────────────────────────────────────┐
│ ✨ EPD Assistent              [X]   │  ← Header
│ 📋 Dossier: Jan de Vries            │  ← Cliënt indicator (nieuw)
├─────────────────────────────────────┤
│                                     │
│ [Welkomstbericht]                   │  ← Messages area
│                                     │
│ [Gebruiker vraag]            →      │
│ [Assistent antwoord]         ←      │
│                                     │
├─────────────────────────────────────┤
│ Kies een onderwerp:                 │  ← Suggesties (context-aware)
│ [📝 Rapportages]                    │
│ [🏥 Intake & Behandeling]           │
│ [📋 Screening]                      │
├─────────────────────────────────────┤
│ [Typ een vraag...        ] [Send]   │  ← Input
└─────────────────────────────────────┘
```

### 5.2 Suggestie Flow (twee stappen)

**Stap 1: Categorieën**
```
Kies een onderwerp:
┌──────────────────────┐
│ 📝 Rapportages       │
├──────────────────────┤
│ 🏥 Intake & Behandeling │
├──────────────────────┤
│ 📋 Screening         │
└──────────────────────┘
```

**Stap 2: Vragen (na klik op categorie)**
```
← Terug
📝 Rapportages
┌────────────────────────────────────┐
│ Geef een samenvatting van de       │
│ rapportages                        │
├────────────────────────────────────┤
│ Wat is er de laatste tijd genoteerd?│
├────────────────────────────────────┤
│ Zijn er behandeladviezen?          │
└────────────────────────────────────┘
```

### 5.3 Context Switching

| Locatie in EPD | Chat Gedrag |
|----------------|-------------|
| Dashboard (geen cliënt) | Documentatie-modus, standaard suggesties |
| Cliëntdossier | Cliënt-modus, cliënt-indicator, cliënt-suggesties |
| Cliënt → Dashboard | Terug naar documentatie-modus |

---

## 6. Interacties met AI

### 6.1 Cliënt-vragen

| Vraag | AI Context | Verwacht Antwoord |
|-------|------------|-------------------|
| "Samenvatting rapportages" | Laatste 5 reports | Bullets per rapportage met datum en type |
| "Wat is het behandeladvies?" | intakes.treatment_advice | Advies, programma, afdeling |
| "Wat was de hulpvraag?" | screenings.request_for_help | Hulpvraag tekst of "niet ingevuld" |
| "Zijn er risico's?" | risk_assessments (leeg) | "Er zijn nog geen risico-assessments" |

### 6.2 Voorbeeld Antwoorden

**Vraag: "Geef een samenvatting van de rapportages"**

```
De laatste rapportages voor Jan de Vries:

📝 28-11-2025 - Vrije notitie
Cliënt ervaart stemming als overwegend somber, maar benoemt ook
positieve momenten tijdens sport. Slaapproblemen blijven aandachtspunt.

📝 25-11-2025 - Vrije notitie
Gesprek over terugvalpreventie. Cliënt toont inzet en motivatie.

📋 22-11-2025 - Behandeladvies
Doorzetten naar behandeling, FACT programma, afdeling Volwassenen.
```

**Vraag: "Wat is het behandeladvies?"**

```
Het behandeladvies voor Jan de Vries:

• Advies: Doorzetten naar behandeling
• Programma: FACT
• Afdeling: Volwassenen
• Uitkomst: In zorg

Dit advies is vastgelegd bij intake "Intake Depressie" (afgerond).
```

**Vraag: "Wat zijn de risico's?"**

```
Er zijn nog geen risico-assessments vastgelegd voor Jan de Vries.

Risico-assessments kunnen worden toegevoegd via de intake of
het tabblad 'Risico's' in het cliëntdossier.
```

### 6.3 Foutafhandeling

| Situatie | Gebruiker ziet |
|----------|----------------|
| Geen rapportages | "Er zijn nog geen rapportages voor [naam]" |
| API error | "Er ging iets mis. Probeer het opnieuw." |
| Rate limit bereikt | Countdown timer + uitleg (bestaand) |

---

## 7. Gebruikersrollen en rechten

**Prototype scope:** Alle ingelogde gebruikers hebben dezelfde rechten.

| Rol | Toegang Chat | Cliënt Data |
|-----|--------------|-------------|
| Behandelaar | ✅ | Eigen cliënten (via RLS) |
| Demo-user | ✅ | Fictieve demo-cliënten |

**Security:**
- Cliënt-ID komt uit URL/PatientContext (betrouwbaar)
- RLS policies op database niveau
- Geen cliëntdata in logs

---

## 8. Configuratie Suggesties

### 8.1 Cliënt Suggesties (nieuw)

```typescript
const CLIENT_SUGGESTION_CATEGORIES = [
  {
    id: 'rapportages',
    label: 'Rapportages',
    icon: '📝',
    questions: [
      'Geef een samenvatting van de rapportages',
      'Wat is er de laatste tijd genoteerd?',
      'Zijn er behandeladviezen?',
    ],
  },
  {
    id: 'intake',
    label: 'Intake & Behandeling',
    icon: '🏥',
    questions: [
      'Wat is het behandeladvies?',
      'Op welke afdeling loopt de intake?',
      'Is de intake afgerond?',
    ],
  },
  {
    id: 'screening',
    label: 'Screening',
    icon: '📋',
    questions: [
      'Wat was de hulpvraag?',
      'Wat is de screeningbeslissing?',
      'Is de cliënt geschikt bevonden?',
    ],
  },
]
```

### 8.2 Documentatie Suggesties (bestaand, behouden)

```typescript
const DOC_SUGGESTION_CATEGORIES = [
  {
    id: 'clienten',
    label: 'Cliënten & Dossiers',
    icon: '👤',
    questions: [
      'Hoe maak ik een nieuwe cliënt aan?',
      'Hoe zoek ik een bestaande cliënt?',
      'Hoe open ik een cliëntdossier?',
    ],
  },
  // ... bestaande categorieën
]
```

---

## 9. Acceptatiecriteria

### 9.1 Functioneel

| Criterium | Test |
|-----------|------|
| Cliënt-indicator toont correcte naam | Open dossier → check header |
| Cliënt-suggesties verschijnen in dossier | Open chat in dossier → zie 3 categorieën |
| Documentatie-suggesties buiten dossier | Open chat op dashboard → zie bestaande categorieën |
| Vraag over rapportages werkt | Stel vraag → ontvang samenvatting |
| Ontbrekende data wordt gemeld | Vraag naar risico's → "geen data" bericht |

### 9.2 Niet-functioneel

| Criterium | Target |
|-----------|--------|
| Eerste antwoord | < 3 seconden |
| Context laden | < 200ms |
| Correcte cliënt | 100% (via URL) |

---

## 10. Bijlagen & Referenties

### Projectdocumenten

| Document | Locatie |
|----------|---------|
| PRD | `docs/specs/ai-integratie/prd-ai-client-assistent-v1.md` |
| TO | `docs/specs/ai-integratie/to-ai-client-assistent-v1.md` |
| Bestaande chat widget | `components/docs-chat/docs-chat-widget.tsx` |
| Bestaande suggesties | `components/docs-chat/chat-suggestions.tsx` |

### Data beschikbaarheid (prototype)

| Tabel | Rows | Bruikbaar voor vragen |
|-------|------|----------------------|
| reports | 21 | ✅ Samenvatting rapportages |
| intakes | 9 | ✅ Behandeladvies, status |
| screenings | 5 | ✅ Hulpvraag, beslissing |
| risk_assessments | 0 | ⚠️ "Geen data" response |

---

## Versiehistorie

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 01-12-2025 | Colin Lit | Initiële versie, prototype scope |
