# Functioneel Ontwerp (FO) — Behandelplan Module

**Projectnaam:** Mini-EPD Prototype - AI Speedrun
**Versie:** v1.0
**Datum:** 03-12-2024
**Auteur:** Colin Lit

---

## 1. Doel en relatie met het PRD

**Doel van dit document:**
Dit Functioneel Ontwerp beschrijft **hoe** de Behandelplan module uit het PRD functioneel werkt — wat de behandelaar ziet, doet en ervaart bij het genereren en beheren van behandelplannen met AI-ondersteuning.

**Relatie met PRD:**
- PRD: `prd-behandelplan-v2-final.md` — beschrijft *wat* en *waarom*
- FO (dit document): beschrijft *hoe* dit in de praktijk werkt

**Scope:**
- MVP-functionaliteit (Fase 1-4 uit implementatieplan)
- Foundation first aanpak (types → componenten → AI → UI)
- Simpele leefgebieden visualisatie (progress bars, geen radar chart)
- Simple JSON API (geen streaming)

---

## 2. Overzicht van de belangrijkste onderdelen

De Behandelplan module bestaat uit de volgende onderdelen:

| # | Onderdeel | Beschrijving |
|---|-----------|--------------|
| 1 | **Leefgebieden Intake** | Formulier voor 7 levensdomeinen met scores en prioriteiten |
| 2 | **AI Generatie** | Knop om behandelplan te laten genereren op basis van intake + diagnose |
| 3 | **Behandelplan Overzicht** | Hoofdpagina met structuur, doelen, interventies |
| 4 | **SMART Doelen** | Lijst van 2-4 behandeldoelen met voortgang |
| 5 | **Interventies** | Evidence-based interventies gekoppeld aan doelen |
| 6 | **Sessie-planning** | Tabel met geplande sessies (stretch) |
| 7 | **Evaluatiemomenten** | Tussentijdse en eindevaluatie (stretch) |

---

## 3. User Stories

### Primaire User Stories (MVP)

| ID | Rol | Doel / Actie | Verwachte waarde | Prioriteit |
|----|-----|--------------|------------------|------------|
| US-01 | Behandelaar | Leefgebieden scores invullen bij intake | Gestructureerd beeld van cliëntsituatie | Hoog |
| US-02 | Behandelaar | AI behandelplan laten genereren | Van 30 min naar 2-5 min tijdsbesparing | Hoog |
| US-03 | Behandelaar | SMART doelen bekijken en aanpassen | Kwaliteitsverbetering, passend bij cliënt | Hoog |
| US-04 | Behandelaar | Interventies koppelen aan doelen | Evidence-based behandeling | Hoog |
| US-05 | Behandelaar | Specifiek doel laten regenereren | Fijnafstelling zonder alles opnieuw | Middel |
| US-06 | Behandelaar | Plan publiceren (concept → actief) | Cliënt kan plan inzien | Middel |

### Secundaire User Stories (Stretch)

| ID | Rol | Doel / Actie | Verwachte waarde | Prioriteit |
|----|-----|--------------|------------------|------------|
| US-07 | Behandelaar | Sessie-planning invullen | Overzicht behandeltraject | Laag |
| US-08 | Behandelaar | Evaluatiemoment vastleggen | Voortgang meten en bijsturen | Laag |
| US-09 | Cliënt | Eigen behandelplan bekijken (B1-taal) | Transparantie en begrip | Laag |

---

## 4. Functionele werking per onderdeel

### 4.1 Leefgebieden Intake

**Locatie:** Onderdeel van intake-flow of aparte tab binnen cliëntdossier

**Functionaliteit:**
- Formulier met 7 levensdomeinen (leefgebieden)
- Per domein:
  - **Score slider:** 1-5 (1 = zeer problematisch, 5 = goed)
  - **Toelichting:** Vrij tekstveld voor context
  - **Prioriteit:** Dropdown (Laag / Middel / Hoog)

**De 7 Leefgebieden:**

| # | Domein | Emoji | Kleur | Voorbeeldvragen |
|---|--------|-------|-------|-----------------|
| 1 | Dagelijkse Levensverrichtingen (DLV) | 🏠 | `#8b5cf6` | Zelfzorg, structuur, dagritme |
| 2 | Wonen | 🏡 | `#ec4899` | Woonsituatie, veiligheid thuis |
| 3 | Werk/Dagbesteding | 💼 | `#f59e0b` | Baan, opleiding, vrijwilligerswerk |
| 4 | Sociaal netwerk | 👥 | `#3b82f6` | Familie, vrienden, relaties |
| 5 | Vrijetijd/Zingeving | 🎯 | `#10b981` | Hobby's, levensdoel, spiritualiteit |
| 6 | Financiën | 💰 | `#eab308` | Schulden, inkomen, budgettering |
| 7 | Lichamelijke gezondheid | 🏃 | `#ef4444` | Slaap, beweging, voeding |

**Gedrag:**
- Opslaan: Data wordt opgeslagen als JSONB in intake/care_plan record
- Validatie: Alle 7 domeinen moeten een score hebben
- Weergave: Na opslaan worden scores getoond als progress bars met kleuren

**States:**
- **Leeg:** "Vul de leefgebieden in om een compleet beeld te krijgen"
- **Gedeeltelijk:** Waarschuwing bij minder dan 7 domeinen
- **Compleet:** Groen vinkje, klaar voor behandelplan generatie

---

### 4.2 AI Behandelplan Generatie

**Locatie:** Behandelplan tab binnen cliëntdossier

**Trigger:** Knop `[⚡ Genereer Behandelplan]`

**Voorwaarden:**
- Intake notities aanwezig (uit rich text editor)
- Diagnose/probleemprofiel ingevuld (DSM-categorie + severity)
- Leefgebieden scores ingevuld (7 domeinen)

**Input naar AI:**
```
- Intake tekst (samenvatting of volledige notities)
- DSM-categorie (bijv. "Angststoornissen")
- Severity niveau (Laag / Middel / Hoog)
- Leefgebieden scores met prioriteiten
- Optioneel: extra instructies van behandelaar
```

**AI Processing:**
- Model: Claude 3.5 Sonnet
- Response tijd: < 5 seconden
- Output: Gestructureerde JSON

**Output van AI:**
1. **Behandelstructuur:** Duur, frequentie, aantal sessies, vorm
2. **SMART Doelen:** 2-4 doelen verdeeld over leefgebieden
3. **Interventies:** Evidence-based, gekoppeld aan doelen
4. **Sessie-planning:** Grove indeling (8-12 sessies)
5. **Evaluatiemomenten:** Tussentijds + eind
6. **Veiligheidsplan:** Alleen bij severity "Hoog"

**UI tijdens generatie:**
```
┌─────────────────────────────────────┐
│ ⚡ Behandelplan wordt gegenereerd...│
│                                     │
│ [████████████░░░░░░░] 75%          │
│                                     │
│ Even geduld, dit duurt ~5 seconden │
└─────────────────────────────────────┘
```

**Na generatie:**
- Plan verschijnt in bewerkbare vorm
- Status: "Concept" (niet gepubliceerd)
- Behandelaar kan reviewen en aanpassen

---

### 4.3 Behandelplan Overzicht (Hoofdpagina)

**Locatie:** `/epd/patients/[id]/behandelplan`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
│ Behandelplan v1                    Status: ● Concept        │
│ [Bewerken] [Publiceer] [Nieuwe Versie]                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 📋 BEHANDELSTRUCTUUR                                        │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Duur: 8 weken | Frequentie: Wekelijks | Sessies: 8     ││
│ │ Vorm: Individueel                                       ││
│ └─────────────────────────────────────────────────────────┘│
│                                                              │
│ 🌐 LEEFGEBIEDEN OVERZICHT                                   │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ DLV          ████████░░ 4/5  Baseline: 3               ││
│ │ Wonen        ████████░░ 4/5  Baseline: 4               ││
│ │ Werk ⚠️      ████░░░░░░ 2/5  Baseline: 2  [Prioriteit] ││
│ │ Sociaal ⚠️   ████░░░░░░ 2/5  Baseline: 2  [Prioriteit] ││
│ │ Vrijetijd    ██████░░░░ 3/5  Baseline: 3               ││
│ │ Financiën    ██████░░░░ 3/5  Baseline: 3               ││
│ │ Gezondheid   ████████░░ 4/5  Baseline: 4               ││
│ └─────────────────────────────────────────────────────────┘│
│                                                              │
│ 🎯 SMART DOELEN (3)                                         │
│ [Doel cards - zie 4.4]                                      │
│                                                              │
│ 💡 INTERVENTIES (2)                                         │
│ [Interventie cards - zie 4.5]                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Acties:**
- `[Bewerken]`: Opent inline editing modus
- `[Publiceer]`: Wijzigt status naar "Actief", zichtbaar voor cliënt
- `[Nieuwe Versie]`: Maakt v2 aan op basis van huidige versie

**Status indicatoren:**
- 🔵 Concept - Bewerkbaar, niet zichtbaar voor cliënt
- 🟢 Actief - Gepubliceerd, zichtbaar voor cliënt
- 🟡 In evaluatie - Evaluatiemoment gepland
- ⚫ Afgerond - Behandeling afgerond

---

### 4.4 SMART Doelen

**Weergave per doel:**
```
┌───────────────────────────────────────────────────────────┐
│ 💼 Werk                                          Prioriteit│
│                                                    [Hoog] │
│ Terugkeer naar 4 werkdagen per week                       │
│                                                           │
│ "Ik werk weer 4 dagen zonder paniek te krijgen"           │
│ (cliënt-versie)                                           │
│                                                           │
│ Voortgang: ██████░░░░ 60%                                │
│ Status: Bezig | Deadline: 8 weken                         │
│                                                           │
│ Meetbaarheid: Aantal werkdagen per week bijhouden         │
│                                                           │
│ [Bewerk] [↻ Regenereer] [Details ▼]                      │
└───────────────────────────────────────────────────────────┘
```

**Velden per doel:**
| Veld | Type | Beschrijving |
|------|------|--------------|
| Titel | Tekst | Korte beschrijving (1 zin) |
| Beschrijving | Tekst | SMART-uitwerking (2-3 zinnen) |
| Cliënt-versie | Tekst | B1-taal versie voor cliënt |
| Leefgebied | Tag | DLV/Wonen/Werk/Sociaal/etc. |
| Prioriteit | Dropdown | Hoog/Middel/Laag |
| Meetbaarheid | Tekst | Hoe meten we vooruitgang? |
| Tijdslijn | Getal | Binnen X weken |
| Status | Dropdown | Niet gestart/Bezig/Gehaald/Bijgesteld |
| Voortgang | Slider | 0-100% |

**Acties:**
- `[Bewerk]`: Inline editing van alle velden
- `[↻ Regenereer]`: AI genereert alternatief doel (zie 4.6)
- `[Details ▼]`: Uitklappen voor SMART-details
- `[+]`: Handmatig doel toevoegen
- `[🗑️]`: Doel verwijderen

**AI-gedrag bij generatie:**
- Focust op leefgebieden met prioriteit "Hoog"
- Verdeelt doelen over minimaal 2 verschillende domeinen
- Maakt concrete, meetbare doelen (geen vage termen)
- Genereert automatisch B1-taal cliënt-versie

---

### 4.5 Interventies

**Weergave per interventie:**
```
┌───────────────────────────────────────────────────────────┐
│ 🧠 Cognitieve Gedragstherapie (CGT)                       │
│                                                           │
│ Beschrijving:                                             │
│ Identificeren en uitdagen van negatieve gedachtenpatronen │
│ die angst en vermijding in stand houden.                  │
│                                                           │
│ Rationale:                                                │
│ CGT is de eerste keuze behandeling bij angststoornissen   │
│ met sterke evidentie voor effectiviteit.                  │
│                                                           │
│ Gekoppeld aan: [💼 Doel 1] [👥 Doel 2]                    │
│                                                           │
│ [Bewerk] [Details ▼]                                      │
└───────────────────────────────────────────────────────────┘
```

**Velden per interventie:**
| Veld | Type | Beschrijving |
|------|------|--------------|
| Naam | Tekst | CGT, Exposure, EMDR, ACT, etc. |
| Beschrijving | Tekst | Uitleg van de interventie |
| Rationale | Tekst | Waarom past dit bij deze cliënt? |
| Gekoppelde doelen | Multi-select | Welke doelen worden benaderd? |

**AI-mapping (evidence-based):**
| DSM-Categorie | Primaire Interventies | Sessies bij Hoog |
|---------------|----------------------|------------------|
| Angststoornissen | CGT, Exposure, ACT | 12-16 sessies |
| Stemmingsklachten | CGT, IPT, Gedragsactivatie | 8-12 sessies |
| Trauma/PTSS | EMDR, Narratieve therapie | 12+ sessies |
| Persoonlijkheid | Schematherapie, MBT | 20+ sessies |

---

### 4.6 Micro-regeneratie (Stretch)

**Trigger:** Klik op `[↻ Regenereer]` bij specifiek doel of interventie

**Flow:**
```
┌─────────────────────────────────────────────────────────────┐
│ ↻ Doel regenereren                                    [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Huidige doel:                                               │
│ "Terugkeer naar 4 werkdagen per week"                       │
│                                                             │
│ Extra instructie voor AI (optioneel):                       │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Maak meer gefocust op geleidelijke opbouw               ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│                    [Annuleren] [↻ Regenereer]               │
└─────────────────────────────────────────────────────────────┘
```

**Na regeneratie:**
```
┌─────────────────────────────────────────────────────────────┐
│ Nieuw voorstel:                                             │
│                                                             │
│ "Stapsgewijze opbouw naar 4 werkdagen via 2→3→4 schema"    │
│                                                             │
│ [Behoud origineel] [✓ Accepteer nieuw voorstel]            │
└─────────────────────────────────────────────────────────────┘
```

**Gedrag:**
- AI behoudt context van rest van plan
- Alleen het specifieke onderdeel wordt vervangen
- Toast notification bij succes: "Doel bijgewerkt"

---

### 4.7 Publicatie Workflow

**Statussen:**
```
Concept ──→ Actief ──→ In evaluatie ──→ Afgerond
              │                            │
              └──→ Gearchiveerd ←──────────┘
                   (bij nieuwe versie)
```

**Validatie voor publicatie:**
- ✓ Minimaal 1 doel ingevuld
- ✓ Minimaal 1 interventie gekoppeld
- ✓ Behandelstructuur compleet (duur, frequentie)
- ✓ Evaluatiemomenten gepland (tussentijds + eind)

**Publicatie actie:**
1. Behandelaar klikt `[Publiceer]`
2. Systeem valideert compleetheid
3. Bij succes: status → "Actief", publicatiedatum vastgelegd
4. Toast: "Behandelplan gepubliceerd"
5. Plan zichtbaar in cliëntportaal

**Versie-beheer:**
- Nummering: v1, v2, v3, etc.
- Bij "Nieuwe Versie": huidige → "Gearchiveerd", nieuwe kopie → "Concept"
- Oude versies blijven zichtbaar (read-only)

---

## 5. UI-overzicht (visuele structuur)

### Behandelplan Pagina Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                           │
│ Mini-EPD Logo    [Cliëntnaam ▼]         [Zoek...]   [Profiel]   │
├─────────────────┬───────────────────────────────────────────────┤
│ SIDEBAR         │ MAIN CONTENT                                   │
│                 │                                                 │
│ ← Cliënten      │ ┌───────────────────────────────────────────┐ │
│ ─────────       │ │ Behandelplan v1          Status: Concept  │ │
│ □ Dashboard     │ │ [Bewerken] [Publiceer] [Print]            │ │
│ □ Intake        │ └───────────────────────────────────────────┘ │
│ □ Diagnose      │                                                │
│ ■ Behandelplan  │ ┌── Behandelstructuur ──────────────────────┐ │
│ □ Rapportage    │ │ Duur: 8 weken | Freq: Wekelijks | 8 sess  │ │
│ □ Agenda        │ └───────────────────────────────────────────┘ │
│                 │                                                │
│                 │ ┌── Leefgebieden ────────────────────────────┐ │
│                 │ │ [Progress bars met scores per domein]      │ │
│                 │ └───────────────────────────────────────────┘ │
│                 │                                                │
│                 │ ┌── SMART Doelen ────────────────────────────┐ │
│                 │ │ [Doel 1 - Werk]                            │ │
│                 │ │ [Doel 2 - Sociaal]                         │ │
│                 │ │ [Doel 3 - DLV]                             │ │
│                 │ │ [+ Doel toevoegen]                         │ │
│                 │ └───────────────────────────────────────────┘ │
│                 │                                                │
│                 │ ┌── Interventies ────────────────────────────┐ │
│                 │ │ [CGT] [Exposure]                           │ │
│                 │ └───────────────────────────────────────────┘ │
│                 │                                                │
├─────────────────┴───────────────────────────────────────────────┤
│ FOOTER: Auto-saved 2 sec ago                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Responsive (Tablet)

```
┌─────────────────────────────────────────────┐
│ [☰] Mini-EPD    Cliëntnaam    [Zoek]       │
├─────────────────────────────────────────────┤
│                                             │
│ Behandelplan v1                             │
│ Status: ● Concept                           │
│ [Bewerken] [Publiceer]                      │
│                                             │
│ ┌── Behandelstructuur ────────────────────┐│
│ │ Duur: 8 weken | Wekelijks | 8 sessies   ││
│ └─────────────────────────────────────────┘│
│                                             │
│ ┌── Leefgebieden ─────────────────────────┐│
│ │ [Compacte progress bars]                ││
│ └─────────────────────────────────────────┘│
│                                             │
│ ┌── Doelen ───────────────────────────────┐│
│ │ [Gestapelde doel cards]                 ││
│ └─────────────────────────────────────────┘│
│                                             │
└─────────────────────────────────────────────┘
```

---

## 6. Interacties met AI (functionele beschrijving)

| Locatie | AI-actie | Trigger | Input | Output |
|---------|----------|---------|-------|--------|
| Behandelplan tab | Genereer plan | Klik `[⚡ Genereer]` | Intake + diagnose + leefgebieden | Compleet behandelplan (JSON) |
| Doel card | Regenereer doel | Klik `[↻ Regenereer]` | Context plan + instructie | Alternatief doel |
| Interventie card | Regenereer interventie | Klik `[↻ Regenereer]` | Context plan + instructie | Alternatieve interventie |
| Doel card | Genereer cliënt-versie | Automatisch bij nieuw doel | Behandelaar-tekst | B1-taal versie |

### AI Response Format

```typescript
interface AIGeneratedPlan {
  behandelstructuur: {
    duur: string           // "8 weken"
    frequentie: string     // "Wekelijks"
    aantalSessies: number  // 8
    vorm: string           // "Individueel"
  }
  doelen: Array<{
    id: string
    title: string
    description: string    // SMART uitwerking
    clientVersion: string  // B1-taal
    lifeDomain: string     // "werk" | "sociaal" | etc.
    priority: string       // "hoog" | "middel" | "laag"
    measurability: string
    timelineWeeks: number
  }>
  interventies: Array<{
    name: string
    description: string
    rationale: string
    linkedGoalIds: string[]
  }>
  evaluatiemomenten: Array<{
    type: string           // "tussentijds" | "eind"
    weekNumber: number
  }>
  veiligheidsplan?: {      // Alleen bij severity "Hoog"
    waarschuwingssignalen: string[]
    copingStrategieen: string[]
    contacten: string[]
  }
}
```

---

## 7. Gebruikersrollen en rechten

| Rol | Toegang tot | Acties | Beperkingen |
|-----|------------|--------|-------------|
| Behandelaar | Eigen cliëntdossiers | Volledig CRUD, AI generatie | Alleen eigen cliënten |
| Behandelaar (collega) | Gedeelde cliënten | Lezen, commentaar | Geen bewerken |
| Cliënt | Eigen behandelplan | Alleen lezen | Ziet B1-versie, geen edit |
| Demo-user | Alle fictieve data | Lezen + AI testen | Geen opslaan |

---

## 8. States en Foutafhandeling

### Empty States

**Geen behandelplan:**
```
┌───────────────────────────────────────────┐
│                  📋                        │
│                                           │
│    Nog geen behandelplan                  │
│                                           │
│    Vul eerst de intake en diagnose in,    │
│    dan kan AI een behandelplan genereren. │
│                                           │
│    [Naar Intake]  [Naar Diagnose]         │
└───────────────────────────────────────────┘
```

**Incomplete voorwaarden:**
```
┌───────────────────────────────────────────┐
│ ⚠️ Nog niet klaar voor behandelplan       │
│                                           │
│ □ Intake notities ✓                       │
│ □ Diagnose/probleemprofiel ✗              │
│ □ Leefgebieden scores ✗                   │
│                                           │
│ Vul de ontbrekende onderdelen in.         │
└───────────────────────────────────────────┘
```

### Error States

| Situatie | Bericht | Actie |
|----------|---------|-------|
| AI niet beschikbaar | "AI tijdelijk niet beschikbaar" | Retry knop, handmatig alternatief |
| Validatie fout | Inline error onder veld | Focus op fout veld |
| Netwerk error | Toast: "Verbinding verloren" | Auto-retry, lokale opslag |
| Rate limit | "Even wachten..." | Countdown timer |

### Loading States

**AI generatie:**
```
⚡ Behandelplan wordt gegenereerd...
[████████████░░░░░░░] 75%
Even geduld, dit duurt ~5 seconden
```

**Auto-save:**
- Tijdens typen: "Opslaan..."
- Na succes: "✓ Opgeslagen 2 sec geleden"

---

## 9. Bijlagen & Referenties

### Interne Documenten
- [PRD Behandelplan v2.0](./prd-behandelplan-v2-final.md) — Requirements
- [Implementatieplan](~/.claude/plans/) — Technische aanpak
- [UX Stylesheet](../ux-stylesheet.md) — Kleuren, typography

### Technische Specificaties
- Database: `treatment_plans` tabel met JSONB structuur
- API: `/api/behandelplan/generate` (POST, JSON response)
- AI Model: Claude 3.5 Sonnet

### Externe Bronnen
- [GGZ Richtlijnen](https://www.ggzrichtlijnen.nl/) — Evidence-based interventies
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/) — Accessibility

---

**Document Status:** v1.0 Draft
**Volgende Review:** Na implementatie Fase 1-2
**Eigenaar:** Colin Lit