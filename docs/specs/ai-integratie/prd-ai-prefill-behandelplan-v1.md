# 📄 Product Requirements Document (PRD) — AI Pre-fill Behandelplan

**Projectnaam:** Mini-ECD – AI Pre-fill Behandelplan  
**Versie:** v1.0  
**Datum:** 30-11-2025  
**Auteur:** Colin Lit
**Status:** Draft – Ready for Review

---

## 1. Doelstelling

🎯 **Doel van deze sectie:** Beschrijf waarom dit product wordt gebouwd en wat het beoogde resultaat is.

📘 **Toelichting:** Een intelligent pre-fill systeem dat automatisch behandelplanconcepten genereert op basis van intake-notities en probleemprofielen. De focus ligt op het drastisch verminderen van administratieve last terwijl klinische kwaliteit behouden blijft.

> **Kernbelofte:** Van 30+ minuten handmatig behandelplan schrijven naar <5 minuten review en publiceren.

**Type:** MVP Feature binnen Mini-ECD Prototype (Week 3-4 AI Speedrun)

---

## 2. Doelgroep

🎯 **Doel:** Schets wie de eindgebruikers en stakeholders zijn.

### Primaire gebruikers

| Rol | Behoefte | Pijnpunt nu |
|-----|----------|-------------|
| **GGZ Behandelaar** | Snel bruikbaar behandelplan | 30+ min typen per plan |
| **Regiebehandelaar** | Review & accorderen | Wachten op aanlevering |

### Secundaire stakeholders

- **Demo-bezoekers:** Product owners/managers die AI-mogelijkheden willen zien
- **Developers:** Technische professionals geïnteresseerd in AI-integratie patterns
- **Zorgverzekeraars:** (toekomst) Compliance met zorgstandaarden

---

## 3. Kernfunctionaliteiten (MVP-scope)

🎯 **Doel:** Afbakenen van de minimale werkende functies.

### 3.1 Automatische Draft Generatie

| Aspect | Specificatie |
|--------|--------------|
| **Trigger** | Probleemprofiel opgeslagen → AI genereert draft |
| **Input** | Intake-notities + DSM-categorie + Severity |
| **Output** | Concept behandelplan (4 secties) |
| **Timing** | On-demand bij navigatie naar Behandelplan tab |

### 3.2 SMART Doelen Generatie

1. AI extraheert concrete klachten uit intake-notities
2. Genereert 2-4 SMART-doelen afgestemd op DSM-categorie en severity
3. Elk doel bevat:
   - **S**pecifiek gedrag/situatie
   - **M**eetbaar criterium (frequentie, intensiteit)
   - **A**cceptabel voor cliënt
   - **R**ealistisch binnen behandelkader
   - **T**ijdgebonden (X weken)

**Voorbeeld output:**
> "Cliënt ervaart maximaal 1 paniekaanval per week (nu: 3x/week) binnen 8 weken behandeling"

### 3.3 Evidence-based Interventie Mapping

| DSM-Categorie | Primaire Interventies | Severity → Intensiteit |
|---------------|----------------------|------------------------|
| Angststoornissen | CGT, Exposure, ACT | Hoog → 12-16 sessies |
| Stemmingsklachten | CGT, IPT, Gedragsactivatie | Middel → 8-12 sessies |
| Trauma/PTSS | EMDR, Narratieve therapie | Hoog → 12+ sessies |
| Persoonlijkheid | Schematherapie, MBT | Hoog → 20+ sessies |

### 3.4 Micro-AI Regeneratie

- Per sectie/item een **[↻ Regenereer]** knop
- Behandelaar kan specifieke onderdelen laten hergenereren
- Behoudt context van overige secties
- Optioneel: korte instructie meegeven ("maak concreter", "focus op werk")

### 3.5 *(Stretch)* ROM Score Integratie

- Indien ROM-scores beschikbaar: meenemen in doelbepaling
- Baseline scores automatisch toevoegen aan meetmomenten
- Suggestie voor ROM-instrument bij evaluatiemomenten

---

## 4. Gebruikersflows (Demo- en MVP-flows)

🎯 **Doel:** Laten zien hoe de gebruiker stap-voor-stap door het systeem gaat.

### Flow 1: Happy Path — Intake → Behandelplan

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Behandelaar voltooit intake en slaat notities op        │
│    ↓                                                        │
│ 2. Klikt [AI › Analyseer intake]                           │
│    ↓                                                        │
│ 3. Probleemprofiel wordt gegenereerd (DSM + Severity)      │
│    ↓                                                        │
│ 4. Accepteert/bewerkt profiel → Slaat op                   │
│    ↓                                                        │
│ 5. Navigeert naar Behandelplan tab                         │
│    ↓                                                        │
│ 6. Ziet: "⚡ AI heeft een concept klaargezet"              │
│    ↓                                                        │
│ 7. Reviewt SMART-doelen, past aan indien nodig             │
│    ↓                                                        │
│ 8. Klikt [Accepteer & Publiceer] → Plan v1 actief          │
└─────────────────────────────────────────────────────────────┘
```

**Doorlooptijd:** < 3 minuten (vs. 30+ minuten traditioneel)

### Flow 2: Regeneratie van specifiek onderdeel

1. Behandelaar vindt Doel 2 niet passend
2. Klikt **[↻ Regenereer]** bij Doel 2
3. AI genereert alternatief doel met zelfde context
4. Behandelaar selecteert nieuw voorstel of bewerkt handmatig

### Flow 3: Handmatige start (geen AI)

1. Behandelaar opent Behandelplan zonder probleemprofiel
2. Ziet melding: *"Geen concept beschikbaar. Vul eerst probleemprofiel in of start handmatig."*
3. Keuze: **[Naar Probleemprofiel]** of **[Start leeg plan]**

---

## 5. Niet in Scope

🎯 **Doel:** Duidelijk maken wat (nog) niet wordt gebouwd.

| Feature | Reden |
|---------|-------|
| Volledige DSM-5 classificatie | Alleen DSM-light (6 categorieën) voor prototype |
| Multi-disciplinaire plannen (MDO) | Complexiteit, geen meerwaarde voor demo |
| DBC/ZPM declaratie-koppeling | Vereist externe integraties |
| Real-time collaboration | Technisch complex, lage prioriteit |
| Volledige ROM-vragenlijst afname | Alleen scores indien al beschikbaar |
| Productie audit logging | Demo-only, geen compliance vereist |
| Meerdere AI providers | Alleen Claude voor nu |

---

## 6. Succescriteria

🎯 **Doel:** Objectieve meetlat voor een geslaagde oplevering.

| Criterium | Target | Meetmethode |
|-----------|--------|-------------|
| **AI Response Time** | < 5 seconden | Console timing |
| **Draft Kwaliteit** | ≥ 80% bruikbaar zonder grote edits | User feedback |
| **Tijdsbesparing** | Van 30+ min → < 5 min | Stopwatch demo |
| **Demo Doorlooptijd** | Intake → Plan in < 3 min | Live demo |
| **Error Rate** | < 5% API failures | Error logging |
| **User Acceptance** | Min. 2 testers positief | Feedback forms |

---

## 7. Risico's & Mitigatie

🎯 **Doel:** Risico's vroeg signaleren en plannen hoe ermee om te gaan.

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| **AI output klinisch onbruikbaar** | 🔴 Hoog | Prompts testen met GGZ-professionals; few-shot examples; "AI Concept" label |
| **Hallucinaties in doelen/interventies** | 🟡 Middel | Strikte JSON schema validatie; verplichte menselijke review |
| **API rate limits / kosten** | 🟡 Middel | Caching van drafts; prompt optimalisatie voor tokens |
| **Trage response (>10s)** | 🟡 Middel | Streaming response; skeleton loaders; timeout handling |
| **Scope creep ("nog even dit erbij")** | 🟡 Middel | Strikte PRD; "Post-MVP" parkeren |
| **Privacy concerns demo-data** | 🟢 Laag | Alleen fictieve cliëntdata gebruiken |

---

## 8. Roadmap / Vervolg (Post-MVP)

🎯 **Doel:** Richting geven aan toekomstige uitbreidingen.

### Fase 2: Enhanced AI (Q1 2026)

1. **Background Generation** — Draft al genereren bij opslaan probleemprofiel
2. **Template Bibliotheek** — Voorgedefinieerde templates per diagnose
3. **Prompt Tuning** — A/B testen van verschillende prompt strategieën

### Fase 3: Clinical Intelligence (Q2 2026)

4. **Sessie-over-Sessie Tracking** — AI vergelijkt voortgang vs. doelen
5. **ROM Integratie** — Automatische vragenlijst afname en scoring
6. **Risico Detectie** — Flagging bij zorgwekkende patronen

### Fase 4: Compliance & Scale (Q3 2026)

7. **Zorgstandaard Compliance** — Check tegen GGZ richtlijnen
8. **Multi-provider Support** — OpenAI/Gemini fallback
9. **Audit Trail** — Volledige logging voor verantwoording

---

## 9. Bijlagen & Referenties

🎯 **Doel:** Bronnen koppelen voor context en consistentie.

### Project Documentatie

- PRD Mini-ECD v1.2 (`prd-mini-ecd-v1_2.md`)
- Functioneel Ontwerp v2 (`fo-mini-ecd-v2.md`)
- Technisch Ontwerp (`to-mini-ecd-v1_2.md`)
- UX Stylesheet (`ux-stylesheet.md`)
- Live Transcriptie FO (`fo-live-transcriptie-v1.md`)
- FHIR GGZ Schema (`20241121_fhir_ggz_schema.sql`)

### Externe Referenties

- [Claude API Documentation](https://docs.anthropic.com)
- [GGZ Zorgstandaarden](https://www.ggzstandaarden.nl)
- [SMART Doelen Framework](https://www.ggzstandaarden.nl/generieke-modules/individueel-zorgplan)

---

## Appendix A: Technische Specificatie

### A.1 Data Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Intake Notities │────▶│                  │────▶│  Behandelplan    │
│  (document_ref)  │     │   Claude API     │     │  Draft (JSONB)   │
├──────────────────┤     │                  │     ├──────────────────┤
│  Probleemprofiel │────▶│  /v1/messages    │     │  - doelen[]      │
│  (DSM + Severity)│     │                  │     │  - interventies[]│
└──────────────────┘     └──────────────────┘     │  - frequentie    │
                                                   │  - meetmomenten[]│
                                                   └──────────────────┘
```

### A.2 API Endpoint

```
POST /api/ai/generate-behandelplan
```

**Request:**
```json
{
  "clientId": "uuid",
  "intakeIds": ["uuid", "uuid"],
  "probleemProfiel": {
    "categorie": "Angststoornissen",
    "severity": "Hoog",
    "opmerkingen": "Paniekaanvallen 3x/week, vermijding openbare ruimtes"
  }
}
```

**Response:**
```json
{
  "success": true,
  "draft": {
    "doelen": [
      {
        "id": "doel-1",
        "tekst": "Frequentie paniekaanvallen verminderen van 3x/week naar max 1x/week",
        "tijdslimiet": "8 weken",
        "meetbaar": "Dagboekregistratie"
      }
    ],
    "interventies": [
      {
        "id": "int-1",
        "naam": "Cognitieve Gedragstherapie (CGT)",
        "sessies": 12,
        "rationale": "Evidence-based voor paniekstoornis"
      }
    ],
    "frequentie": "Wekelijks, 50 minuten per sessie",
    "meetmomenten": [
      { "moment": "Baseline", "week": 0 },
      { "moment": "Tussentijds", "week": 4 },
      { "moment": "Tussentijds", "week": 8 },
      { "moment": "Afsluiting", "week": 12 }
    ]
  },
  "metadata": {
    "model": "claude-sonnet-4-20250514",
    "tokens_used": 1847,
    "generation_time_ms": 3200
  }
}
```

### A.3 Claude Prompt Template (Conceptueel)

```
Je bent een ervaren GGZ-behandelaar die behandelplannen opstelt volgens 
de Nederlandse zorgstandaarden.

## Context
- Intake notities: {intakeContent}
- DSM-categorie: {categorie}
- Severity: {severity}
- Aanvullende opmerkingen: {opmerkingen}

## Opdracht
Genereer een behandelplan concept met:

1. **SMART Doelen** (2-4 stuks)
   - Specifiek, Meetbaar, Acceptabel, Realistisch, Tijdgebonden
   - Gebaseerd op de hoofdklachten uit de intake
   
2. **Interventies**
   - Evidence-based methoden passend bij de diagnose
   - Inclusief geschat aantal sessies
   
3. **Frequentie en Duur**
   - Behandelintensiteit afgestemd op severity
   
4. **Meetmomenten**
   - Evaluatieschema voor voortgangsbewaking

## Output Format
Antwoord ALLEEN met valid JSON volgens het schema.
```

---

## Appendix B: UI States

### Behandelplan Tab States

| State | Weergave | Actie |
|-------|----------|-------|
| **Geen profiel** | "Vul eerst probleemprofiel in" | [Naar Profiel] |
| **Generating** | Skeleton loader + "AI genereert..." | Wacht |
| **Draft ready** | "⚡ AI Concept" badge + content | Review/Edit |
| **Error** | "Genereren mislukt" + retry | [Probeer opnieuw] |
| **Concept** | Oranje badge, bewerkbaar | [Publiceer] |
| **Gepubliceerd** | Groene badge, read-only | [Nieuwe versie] |

---

*Document gegenereerd als onderdeel van AI Speedrun — Week 3*
