# Functioneel Ontwerp (FO) – AI Documentatie Assistent

**Projectnaam:** Mini-ECD – AI Documentatie Assistent
**Versie:** v1.0
**Datum:** 01-12-2025
**Auteur:** Colin van der Heijden

---

## 1. Doel en relatie met het PRD

**Doel van dit document:**
Dit Functioneel Ontwerp beschrijft **hoe** de AI Documentatie Assistent functioneel werkt — wat de gebruiker ziet, doet en ervaart. Waar het PRD (`prd-ai-docs-assistent-v1.md`) uitlegt *wat en waarom*, laat dit FO zien *hoe dit in de praktijk werkt*.

**Toelichting aan de lezer:**
De AI Documentatie Assistent is een floating chat widget die eindgebruikers van het EPD helpt door vragen te beantwoorden op basis van de systeemdocumentatie. Dit is de eerste AI-integratie in het Mini-ECD prototype en dient als fundament voor toekomstige AI features.

---

## 2. Overzicht van de belangrijkste onderdelen

1. **Floating Trigger Button** — Amber knop rechtsonder om widget te openen
2. **Chat Panel** — Uitklapbaar gesprekspaneel
3. **Message List** — Weergave van conversatie (gebruiker + assistent)
4. **Input Area** — Tekstveld voor vragen stellen
5. **Streaming Response** — Real-time weergave van AI antwoorden

---

## 3. Userstories

| ID | Rol | Doel / Actie | Verwachte waarde | Prioriteit |
|----|------|---------------|------------------|-------------|
| US-01 | Behandelaar | Vraag stellen over EPD functie | Direct antwoord zonder zoeken | Hoog |
| US-02 | Verpleegkundige | Uitleg krijgen over onbekende functie | Zelfstandig werken zonder collega's te storen | Hoog |
| US-03 | Nieuwe medewerker | Systeem leren kennen via vragen | Interactieve onboarding | Hoog |
| US-04 | Behandelaar | Vervolgvraag stellen | Context behouden in gesprek | Middel |
| US-05 | Developer | Technische vraag over API | Snelle referentie zonder docs te openen | Middel |
| US-06 | Alle gebruikers | Widget sluiten | Terug naar werk zonder afleiding | Hoog |

**User Story Details:**

> **US-01:** Als behandelaar wil ik een vraag kunnen stellen over het EPD zodat ik direct antwoord krijg zonder door documentatie te hoeven zoeken.

> **US-02:** Als verpleegkundige wil ik uitleg kunnen vragen over een functie die ik niet ken zodat ik zelfstandig verder kan werken.

> **US-03:** Als nieuwe medewerker wil ik via vragen het systeem leren kennen zodat ik sneller productief ben.

---

## 4. Functionele werking per onderdeel

### 4.1 Floating Trigger Button

**Locatie:** Rechtsonder in het scherm, altijd zichtbaar binnen EPD (`/epd/*` routes)

**Gedrag:**
- Amber gradient knop (56x56px) met Sparkles icon
- Hover: lichte kleurverandering
- Klik: opent chat panel, knop verdwijnt
- Altijd bovenop andere content (z-index: 50)

**States:**
| State | Weergave |
|-------|----------|
| Default | Amber gradient met wit icon |
| Hover | Donkerder amber |
| Widget open | Knop verborgen |

---

### 4.2 Chat Panel

**Afmetingen:** 384px breed × max 80vh hoog

**Structuur:**
```
┌────────────────────────────────────┐
│ Header: titel + sluit-knop         │
├────────────────────────────────────┤
│                                    │
│ Message List (scrollbaar)          │
│                                    │
│                                    │
├────────────────────────────────────┤
│ Input Area: tekstveld + verzenden  │
└────────────────────────────────────┘
```

**Header:**
- Sparkles icon + "Documentatie Assistent" tekst
- X-knop rechts om te sluiten
- Amber/amber-100 achtergrond gradient

**Gedrag bij openen:**
1. Panel verschijnt met slide-in animatie (van onder)
2. Welkomstbericht wordt getoond (indien eerste keer)
3. Focus gaat naar input veld

**Gedrag bij sluiten:**
- Klik op X-knop → panel verdwijnt
- Trigger button verschijnt weer
- Conversatie blijft behouden (sessie)

---

### 4.3 Message List

**Weergave van berichten:**

| Type | Positie | Styling |
|------|---------|---------|
| Gebruiker | Rechts uitgelijnd | `bg-amber-100`, rounded |
| Assistent | Links uitgelijnd | `bg-slate-100`, rounded |

**Welkomstbericht (eerste bericht):**
```
Hallo! Ik ben de documentatie assistent voor het Mini-ECD.

Stel gerust vragen over hoe het systeem werkt, bijvoorbeeld:
• Hoe maak ik een nieuwe intake aan?
• Hoe werkt de spraakherkenning?
• Waar vind ik de screening resultaten?
```

**Scroll gedrag:**
- Automatisch scrollen naar nieuwste bericht
- Gebruiker kan omhoog scrollen door historie
- Bij nieuw bericht: scroll naar beneden

**Streaming weergave:**
- Tekst verschijnt woord-voor-woord
- Pulserende cursor aan einde tijdens streaming
- Cursor verdwijnt wanneer response compleet is

---

### 4.4 Input Area

**Componenten:**
- Textarea (auto-resize, max 4 regels)
- Verzend-knop (amber, pijl icon)

**Interacties:**

| Actie | Resultaat |
|-------|-----------|
| Enter | Verstuur bericht |
| Shift + Enter | Nieuwe regel |
| Klik verzend-knop | Verstuur bericht |
| Leeg bericht versturen | Geen actie |

**States:**

| State | Textarea | Verzend-knop |
|-------|----------|--------------|
| Idle | Enabled, placeholder | Enabled (amber) |
| Typing | Enabled, tekst zichtbaar | Enabled |
| Loading | Disabled | Disabled (grijs) |
| Error | Enabled | Enabled |

**Placeholder tekst:** "Stel een vraag..."

---

### 4.5 Streaming Response

**Proces:**
1. Gebruiker verstuurt vraag
2. Input wordt disabled
3. Nieuw assistent-bericht verschijnt (leeg)
4. Tekst streamt woord-voor-woord in
5. Bij completion: input wordt enabled

**Visuele feedback tijdens streaming:**
- Pulserende cursor (`▊`) aan einde van tekst
- Tekst verschijnt met ~50ms interval per chunk

**Timeout:**
- Na 30 seconden zonder response: toon foutmelding
- Gebruiker kan opnieuw proberen

---

## 5. UI-overzicht (visuele structuur)

### Widget Gesloten
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              EPD Interface                      │
│                                                 │
│                                                 │
│                                                 │
│                                         ┌─────┐ │
│                                         │ ✨  │ │
│                                         └─────┘ │
└─────────────────────────────────────────────────┘
                                          ↑
                                    Trigger Button
```

### Widget Open
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              EPD Interface                      │
│                                                 │
│                        ┌────────────────────────┤
│                        │ ✨ Docs Assistent   ✕ │
│                        ├────────────────────────┤
│                        │ Welkomstbericht...     │
│                        │                        │
│                        │ ┌──────────────────┐   │
│                        │ │ Hoe maak ik...   │←──│── User
│                        │ └──────────────────┘   │
│                        │                        │
│                        │ ┌──────────────────┐   │
│                        │ │ Om een intake... │←──│── Assistant
│                        │ │ ...              │   │
│                        │ └──────────────────┘   │
│                        ├────────────────────────┤
│                        │ [Stel een vraag...] ➤  │
│                        └────────────────────────┘
└─────────────────────────────────────────────────┘
```

---

## 6. Interacties met AI (functionele beschrijving)

| Locatie | AI-actie | Trigger | Output |
|---------|----------|---------|--------|
| Chat widget | Vraag beantwoorden | Gebruiker verstuurt bericht | Streaming tekst-antwoord |
| Chat widget | Vervolgvraag beantwoorden | Gebruiker stuurt vervolgvraag | Context-aware antwoord |
| Chat widget | Buiten scope afhandelen | Vraag niet in documentatie | Eerlijk "weet ik niet" + suggesties |

### AI Gedragsregels

**Wel doen:**
- Antwoorden baseren op de 14 MDX documentatiebestanden
- Nederlands schrijven
- Bullet points gebruiken voor stappen
- Verwijzen naar specifieke menu's en knoppen
- Eerlijk zeggen als informatie ontbreekt

**Niet doen:**
- Informatie verzinnen die niet in de documentatie staat
- Medisch advies geven
- Behandelsuggesties doen
- Engels antwoorden (tenzij gevraagd)

### Beschikbare Knowledge Base

De assistent heeft toegang tot deze documentatie:

| Bestand | Onderwerp |
|---------|-----------|
| `authentication.mdx` | Inloggen en authenticatie |
| `client-management.mdx` | Cliëntbeheer |
| `intake-system.mdx` | Intake proces |
| `screening-system.mdx` | Screening functionaliteit |
| `treatment-planning.mdx` | Behandelplannen |
| `interface-design.mdx` | UI uitleg |
| `spraakgestuurde-verslaglegging.mdx` | Spraakfuncties (NL) |
| `voice-controlled-reporting.mdx` | Spraakfuncties (EN) |
| `verpleegkundige-overdracht.mdx` | Overdracht workflow |
| `fhir-datamodel.mdx` | Data model |
| `fhir-api.mdx` | API documentatie |
| `release-notes-system.mdx` | Release notes |
| `build-errors-fix.mdx` | Troubleshooting |
| `webpack-module-resolution.mdx` | Technische docs |

---

## 7. Gebruikersrollen en rechten

| Rol | Toegang tot widget | Beperkingen |
|-----|-------------------|-------------|
| Behandelaar | Ja, binnen EPD | Geen |
| Verpleegkundige | Ja, binnen EPD | Geen |
| Admin | Ja, binnen EPD | Geen |
| Niet-ingelogd | Nee | Widget niet zichtbaar |

**Authenticatie:** Widget is alleen zichtbaar voor ingelogde gebruikers binnen `/epd/*` routes.

---

## 8. Error States en Edge Cases

### Error States

| Situatie | Weergave | Gebruikersactie |
|----------|----------|-----------------|
| API timeout (>30s) | "Het duurt langer dan verwacht. Probeer het opnieuw." | Retry knop |
| API error | "Er ging iets mis. Probeer het later opnieuw." | Retry knop |
| Netwerk offline | "Geen internetverbinding." | - |
| Rate limit | "Te veel verzoeken. Wacht even." | Automatisch retry |

### Edge Cases

| Situatie | Gedrag |
|----------|--------|
| Zeer lange vraag (>2000 chars) | Vraag wordt afgekapt met waarschuwing |
| Lege vraag | Verzenden geblokkeerd |
| Alleen spaties | Behandeld als lege vraag |
| Snelle opeenvolgende vragen | Vorige request wordt geannuleerd |
| Browser tab wisselen | Streaming gaat door |
| Page refresh | Conversatie verloren (sessie-based) |

---

## 9. Bijlagen & Referenties

### Project Documentatie

- PRD AI Documentatie Assistent (`prd-ai-docs-assistent-v1.md`)
- PRD AI Pre-fill Behandelplan (`prd-ai-prefill-behandelplan-v1.md`)
- UX Stylesheet (`ux-stylesheet.md`)
- Technisch Ontwerp Mini-ECD (`to-mini-ecd-v1_2.md`)

### Externe Referenties

- [Claude API Documentation](https://docs.anthropic.com)
- [Anthropic Streaming Guide](https://docs.anthropic.com/en/api/streaming)

---

## Appendix A: Conversatie Voorbeelden

### Voorbeeld 1: Intake Vraag

**Gebruiker:** "Hoe maak ik een nieuwe intake aan?"

**Assistent:**
```
Om een nieuwe intake aan te maken:

1. Ga naar het cliëntdossier via **Cliënten** in het hoofdmenu
2. Selecteer de gewenste cliënt
3. Klik op het tabblad **Intake**
4. Klik op de knop **Nieuwe Intake**
5. Vul de intake-informatie in het formulier
6. Klik op **Opslaan** om de intake te bewaren

Je kunt ook spraakherkenning gebruiken om de intake
in te spreken via de microfoon-knop.
```

### Voorbeeld 2: Buiten Scope

**Gebruiker:** "Wat is de beste behandeling voor depressie?"

**Assistent:**
```
Die informatie heb ik niet. Ik kan alleen helpen met
vragen over hoe het Mini-ECD systeem werkt.

Misschien kan ik je helpen met:
• Hoe maak ik een behandelplan aan?
• Hoe voeg ik een diagnose toe?
• Hoe werkt de screening functie?
```

### Voorbeeld 3: Technische Vraag

**Gebruiker:** "Welke FHIR resources worden ondersteund?"

**Assistent:**
```
Het Mini-ECD ondersteunt de volgende FHIR R4 resources:

**Kern resources:**
• Patient — Cliëntgegevens
• Practitioner — Behandelaren
• Encounter — Contactmomenten
• Condition — Diagnoses/problemen
• Observation — Metingen en observaties
• CarePlan — Behandelplannen

Zie de API documentatie voor endpoints en voorbeelden.
```

---

*Document gegenereerd als onderdeel van AI Speedrun — Week 3*
