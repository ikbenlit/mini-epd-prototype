# 📄 Product Requirements Document (PRD) – AI Cliënt Assistent

**Projectnaam:** Mini-ECD – AI Cliënt Assistent
**Versie:** v1.0
**Datum:** 01-12-2025
**Auteur:** Colin Lit

---

## 1. Doelstelling

**Probleem:** Behandelaren besteden veel tijd aan het navigeren door verschillende schermen om informatie over een cliënt te verzamelen. Bij een overdracht of voorbereiding op een consult moeten zij:
- Rapportages doorbladeren
- Risico-assessments opzoeken
- Behandeladviezen teruglezen
- Screeningresultaten checken

**Oplossing:** De bestaande AI Documentatie Assistent uitbreiden met cliënt-awareness. Wanneer een behandelaar in een cliëntdossier zit, kan de assistent vragen beantwoorden over díe specifieke cliënt.

**Voorbeeld interacties:**
> "Geef een samenvatting van de laatste rapportages"
> "Wat zijn de risico's van deze cliënt?"
> "Wat staat er in het behandeladvies?"

**Type:** MVP-uitbreiding op bestaande feature (AI Documentatie Assistent)

---

## 2. Doelgroep

| Rol | Situatie | Behoefte |
|-----|----------|----------|
| **Behandelaar** | Voorbereiding op consult | Snel overzicht van recente rapportages en behandeladvies |
| **Verpleegkundige** | Overdracht dienst | Risico's en actuele status checken |
| **Intaker** | Afsluiten intake | Samenvatting van screeningresultaat en hulpvraag |
| **Regiebehandelaar** | Caseload review | Per cliënt snel de status kunnen opvragen |

**Kernbehoefte:** Informatie opvragen via natuurlijke taal, zonder te navigeren door meerdere schermen.

---

## 3. Kernfunctionaliteiten (MVP-scope)

### 3.1 Automatische cliënt-herkenning
De assistent weet automatisch over welke cliënt je praat op basis van het dossier waarin je zit. Geen handmatige selectie nodig.

**Gedrag:**
- In dossier van Jan de Vries → assistent beantwoordt vragen over Jan de Vries
- Buiten cliëntdossier → assistent beantwoordt alleen documentatie-vragen

### 3.2 Cliënt-indicator in chat
De gebruiker ziet duidelijk dat de assistent in "cliënt-modus" staat:

```
┌─────────────────────────────┐
│ ✨ EPD Assistent            │
│ 📋 Dossier: Jan de Vries    │  ← Zichtbaar wanneer in dossier
└─────────────────────────────┘
```

### 3.3 Ondersteunde vragen

| Categorie | Voorbeeldvragen |
|-----------|-----------------|
| **Rapportages** | "Samenvatting van de rapportages", "Wat is er de laatste tijd genoteerd?" |
| **Risico's** | "Wat zijn de risico's?", "Is er suïciderisico?" |
| **Behandeladvies** | "Wat is het behandeladvies?", "Welke zorg is geadviseerd?" |
| **Screening** | "Wat was de hulpvraag?", "Is de screening afgerond?" |
| **Overzicht** | "Geef een samenvatting van dit dossier" |

### 3.4 Context-aware suggesties
Wanneer je in een cliëntdossier zit, toont de assistent relevante voorbeeldvragen:
- "Geef een samenvatting van de rapportages"
- "Wat zijn de risico's?"
- "Wat staat in het behandeladvies?"

### 3.5 Gescheiden vraagtypen
De assistent beantwoordt óf vragen over de cliënt óf vragen over het systeem, niet gemengd. Dit voorkomt verwarring.

| Vraag | Type | Antwoord gebaseerd op |
|-------|------|----------------------|
| "Wat zijn de risico's?" | Cliënt | Dossiergegevens |
| "Hoe maak ik een intake aan?" | Systeem | Documentatie |

---

## 4. Gebruikersflows

### Flow 1: Snelle cliënt-check voor consult
```
Behandelaar opent dossier van cliënt
    ↓
Ziet chat-widget rechtsonder, header toont "Dossier: Jan de Vries"
    ↓
Klikt op suggestie "Wat zijn de risico's?"
    ↓
Assistent toont overzicht: "Jan heeft 2 risico-assessments:
• Suïciderisico: laag (beoordeeld 15-11-2025)
• Agressierisico: middel (beoordeeld 10-11-2025)"
```

### Flow 2: Overdracht voorbereiding
```
Verpleegkundige opent dossier
    ↓
Vraagt: "Geef een samenvatting van de laatste rapportages"
    ↓
Assistent toont: "De laatste 3 rapportages:
• 28-11: Stabiele stemming, medicatie ongewijzigd
• 25-11: Gesprek over terugvalpreventie
• 22-11: Contactmoment familie, zorgen over isolatie"
```

### Flow 3: Documentatie-vraag vanuit dossier
```
Gebruiker is in dossier maar vraagt: "Hoe werkt de spraakherkenning?"
    ↓
Systeem herkent: dit is een documentatie-vraag
    ↓
Bestaande documentatie-flow wordt gevolgd
    ↓
Antwoord komt uit systeemdocumentatie, niet uit cliëntdossier
```

---

## 5. Niet in Scope

| Uitgesloten | Reden |
|-------------|-------|
| **Schrijven naar dossier** | Privacy, audit trail vereisten |
| **Medisch advies geven** | Liability, AI mag niet adviseren |
| **Multi-cliënt vergelijkingen** | Complexiteit, privacy |
| **Historische trends** | "Hoe ging het vorige maand?" - te complex voor MVP |
| **Bijlagen/PDF's lezen** | Technische complexiteit |
| **Gemengde vragen** | "Hoe maak ik een intake voor deze cliënt?" - te ambigu |

---

## 6. Succescriteria

| Criterium | Meetbaar doel |
|-----------|---------------|
| **Cliënt correct herkend** | 100% - als je in dossier zit, moet juiste cliënt actief zijn |
| **Vraagtype correct** | >90% correcte classificatie (cliënt vs. documentatie) |
| **Responstijd** | Eerste woord binnen 3 seconden |
| **Data-integriteit** | Alleen data van actieve cliënt wordt getoond |
| **Gebruikersacceptatie** | Positieve feedback in demo |

---

## 7. Risico's & Mitigatie

| Risico | Impact | Kans | Mitigatie |
|--------|--------|------|-----------|
| **Verkeerde cliëntdata tonen** | Kritiek | Laag | Cliënt-ID uit betrouwbare context (URL), niet uit vraag |
| **AI hallucineert informatie** | Hoog | Middel | Strikte prompt: "alleen beschikbare data, zeg eerlijk als info ontbreekt" |
| **Privacy-schending** | Kritiek | Laag | Bestaande autorisatie, RLS, geen logging van cliëntdata |
| **Ambigue vragen** | Middel | Middel | Duidelijke vraagtype-detectie, bij twijfel → documentatie-modus |
| **Te veel data in context** | Middel | Laag | Maximum 5 items per categorie laden |

---

## 8. Roadmap / Vervolg (Post-MVP)

### Fase 2: Uitgebreidere context
- Diagnoses en condities
- Contactmomenten/encounters
- Behandelplan doelen en voortgang
- Medicatie-overzicht

### Fase 3: Slimme acties
- "Start een rapportage op basis van dit gesprek"
- Suggesties voor behandelplan-updates
- Pre-fill formulieren met AI

### Fase 4: Caseload-niveau
- "Welke cliënten hebben hoog risico?"
- Overzicht van openstaande acties
- Prioritering suggesties

---

## 9. Bijlagen & Referenties

### Gerelateerde documenten
| Document | Beschrijving |
|----------|--------------|
| `prd-ai-docs-assistent-v1.md` | PRD van basis documentatie assistent |
| `fo-ai-docs-assistent-v1.md` | Functioneel ontwerp chat widget |
| `bouwplan-ai-docs-assistent-v1.md` | Technisch implementatieplan v1 |

### Beschikbare cliëntdata (voor context)
- **Rapportages** - Vrije notities en behandeladviezen
- **Intakes** - Behandeladviezen, notities, status
- **Risico-assessments** - Type, niveau, onderbouwing
- **Screening** - Hulpvraag, beslissing

---

## Versiehistorie

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 01-12-2025 | Colin Lit | Initiële versie |
