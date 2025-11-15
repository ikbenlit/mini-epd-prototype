# 🧩 Functioneel Ontwerp (FO) – Mini-ECD Prototype

**Projectnaam:** Mini-ECD Prototype
**Versie:** v1.0 (MVP)
**Datum:** 09-11-2025
**Auteur:** Ontwikkelteam PinkRoccade GGZ

---

## 1. Doel en relatie met het PRD

🎯 **Doel van dit document:**
Het Functioneel Ontwerp (FO) beschrijft **hoe** de Mini-ECD applicatie functioneel werkt — wat de gebruiker ziet, doet en ervaart tijdens de AI-inspiratiesessie. Waar het PRD uitlegt *wat en waarom*, laat het FO zien *hoe dit in de praktijk werkt*.

📘 **Context:**
Dit FO ondersteunt de demo van max. 10 minuten waarbij we de kernflow **intake → probleemclassificatie → behandelplan** demonstreren met AI-ondersteuning. Het richt zich op de herkenbare ECD-workflow voor GGZ-professionals, met fictieve data en vereenvoudigde autorisatie.

**Relatie met andere documenten:**
- **PRD**: definieert de vereisten en scope
- **TO (Technisch Ontwerp)**: beschrijft de technische implementatie (Next.js, Supabase, Claude AI)
- **UX Stylesheet**: specificeert kleuren en styling
- **API Access**: documenteert de AI endpoints

---

## 2. Overzicht van de belangrijkste onderdelen

De applicatie bestaat uit de volgende hoofdonderdelen:

1. **Cliëntenlijst** — overzicht van alle cliënten met zoek- en filterfunctionaliteit
2. **Cliëntdossier / Dashboard** — configureerbare tegels met overzicht per cliënt
3. **Intakeverslag** — rich text editor met AI-ondersteuning
4. **Probleemprofiel (DSM-light)** — categorisatie en severity-bepaling
5. **Behandelplan** — gestructureerd plan met doelen, interventies en meetmomenten
6. *(Stretch)* **Mini-agenda** — afspraken koppelen aan cliënt
7. *(Stretch)* **Rapportage** — PDF export van dossier

---

## 3. User Stories

### Primaire User Stories (MVP)

| ID | Rol | Doel / Actie | Verwachte waarde | Prioriteit |
|----|------|---------------|------------------|-------------|
| US-01 | Behandelaar | Nieuwe cliënt aanmaken met basisgegevens | Kan direct starten met intake | Hoog |
| US-02 | Behandelaar | Intakeverslag schrijven in rich text editor | Flexibel notuleren met opmaak | Hoog |
| US-03 | Behandelaar | Intakeverslag samenvatten met AI | Tijdbesparing, sneller overzicht | Hoog |
| US-04 | Behandelaar | Leesbaarheid verbeteren naar B1-niveau met AI | Cliëntvriendelijke communicatie | Middel |
| US-05 | Behandelaar | AI-suggestie krijgen voor DSM-light categorie en severity | Snellere en consistentere classificatie | Hoog |
| US-06 | Behandelaar | Behandelplan genereren op basis van intake/profiel | Efficiënter plannen, SMART-doelen | Hoog |
| US-07 | Behandelaar | Gegenereerd plan bewerken en publiceren | Controle over eindresultaat | Hoog |
| US-08 | Behandelaar | Configureren welke dashboard-tegels zichtbaar zijn | Personalisatie werkruimte | Laag |

### Secundaire User Stories (Stakeholders)

| ID | Rol | Doel / Actie | Verwachte waarde | Prioriteit |
|----|------|---------------|------------------|-------------|
| US-09 | Product Owner | Demo-flow doorlopen tijdens workshop | Begrijpt AI-toegevoegde waarde | Hoog |
| US-10 | Developer | Zien hoe AI in ECD-proces geïntegreerd is | Inspiratie voor eigen implementaties | Middel |
| US-11 | Manager | Overzicht van cliëntdossiers bekijken | Inzicht in werkprocessen | Laag |

---

## 4. Functionele werking per onderdeel

### 4.1 Cliëntenlijst

**Doel:** Overzicht van alle geregistreerde cliënten met mogelijkheid om nieuwe cliënten toe te voegen.

**Functionaliteit:**
- **Weergave:**
  - Tabel met kolommen: ClientID, Naam (Voornaam + Achternaam), Geboortedatum, Laatste update
  - Zoekbalk bovenaan voor filteren op naam of ClientID
  - Knop **+ Nieuwe cliënt** rechtsboven

- **Acties:**
  - Klik op rij → navigeert naar Cliëntdossier (Dashboard)
  - Klik **+ Nieuwe cliënt** → opent modal/drawer met formulier:
    - Velden: Voornaam (verplicht), Achternaam (verplicht), Geboortedatum (datum picker)
    - Knop **Annuleren** | **Opslaan**
    - Bij opslaan: ClientID wordt automatisch gegenereerd (UUID)

- **States:**
  - **Leeg-staat:** "Nog geen cliënten. Klik op '+ Nieuwe cliënt' om te starten."
  - **Laden:** Skeleton loaders voor tabelrijen
  - **Fout:** Toast-melding "Kon cliënten niet laden. Probeer opnieuw."

---

### 4.2 Cliëntdossier / Dashboard

**Doel:** Overzichtspagina per cliënt met configureerbare informatie-tegels.

**Structuur:**
- **Topbalk:**
  - Breadcrumb: Cliënten > [Naam cliënt]
  - Rechtsboven: Knop **Instellingen** (tandwiel-icoon) → opent tegel-configuratie modal

- **Linkernavigatie (verticaal):**
  - Menu-items: Overzicht (actief) | Intakes | Probleemprofiel | Behandelplan | *(Afspraken)*
  - Actieve item heeft blauwe accent-bar en lichte achtergrond

- **Middenpaneel (tegels):**
  - Configureerbare tegels (via instellingen aan/uit te zetten):
    1. **Basisgegevens** — ClientID, Naam, Geboortedatum
    2. **Laatste Intake** — titel, datum, eerste 3 regels + "Lees meer..."
    3. **Probleemprofiel** — DSM-light categorie badge + severity badge (Laag/Middel/Hoog)
    4. **Behandelplan** — status (Concept/Gepubliceerd), aantal doelen, laatst bijgewerkt
    5. **Afspraken** — laatste afspraak + eerstvolgende 3 afspraken (optioneel, stretch)

**Interacties:**
- Klik op tegel → navigeert naar desbetreffende sectie (bv. Intake-tegel → Intakes tab)
- **Instellingen modal:**
  - Checkboxes per tegel om zichtbaarheid in/uit te schakelen
  - Knop **Opslaan** → slaat voorkeur op (per gebruiker, lokaal)

---

### 4.3 Intakeverslag

**Doel:** Creëren en bewerken van intake-notities met rich text en AI-ondersteuning.

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Topbalk: Cliëntnaam | [Opslaan] [AI-acties ▼]           │
├───────────────┬─────────────────────────────────────────┤
│ Linkernav     │  Editor (hoofdpaneel)   │ AI-rail       │
│ (tabs)        │  TipTap rich text       │ (rechts)      │
│               │                         │               │
├───────────────┴─────────────────────────┴───────────────┤
│ Toast area (meldingen)                                  │
└─────────────────────────────────────────────────────────┘
```

**Hoofdpaneel (Editor):**
- **Formulier boven editor:**
  - Titel (optioneel): "Intake [datum]"
  - Tag dropdown: Intake | Evaluatie | Plan

- **TipTap rich text editor:**
  - Toolbar: Bold, Italic, Underline, Bullet list, Numbered list, Blockquote
  - Placeholder: "Noteer hier de intake-informatie..."
  - Auto-save indicator: "Opgeslagen om [tijd]" onder editor

- **Knoppen onder editor:**
  - **Opslaan** (primair, blauw) — slaat verslag op
  - **AI-acties** dropdown (secundair, grijs):
    - Samenvatten
    - Verbeter leesbaarheid (B1)
    - Extract problemen

**AI-rail (rechterpaneel):**
- **Initieel:** Leeg met prompt "Selecteer een AI-actie om te beginnen"

- **Na AI-actie:**
  - **Header:** "AI-resultaat: [actienaam]" + loading spinner tijdens verwerking
  - **Content area:**
    - Voor **Samenvatten**: Bulletpoints van samenvatting
    - Voor **Leesbaarheid**: Herschreven tekst (diff-weergave optioneel)
    - Voor **Extract**: Voorgestelde categorie + severity + bronzinnen (highlighted in editor)
  - **Acties:**
    - **Invoegen** (primair) — voegt resultaat in editor toe
    - **Kopiëren** (secundair) — kopieert naar clipboard
    - **Annuleren** (ghost) — verwerpt resultaat

**States & feedback:**
- **AI bezig:** Non-blocking spinner in AI-rail + "Genereren..." melding
- **AI fout:** Foutmelding in rail: "Kon niet verwerken. Probeer opnieuw." + retry-knop
- **Opslaan gelukt:** Groene toast "Verslag opgeslagen"
- **Opslaan mislukt:** Rode toast "Kon niet opslaan. Controleer verbinding."

**AI Source Highlighting (voor Extract):**
- Bronzinnen die AI gebruikt heeft worden gehighlight in de editor (lichtgele achtergrond)
- Highlights verdwijnen bij Invoegen, Annuleren of nieuwe AI-actie

**Keyboard shortcuts:**
- `Ctrl/Cmd+S`: Opslaan
- `Ctrl/Cmd+K`: Zoeken in tekst
- `Ctrl/Cmd+N`: Nieuw verslag

---

### 4.4 Probleemprofiel (DSM-light)

**Doel:** Categoriseren van problematiek volgens vereenvoudigde DSM-classificatie met severity-bepaling.

**Layout:**
- **Formulier (links, 60%):**
  - **Categorie** (dropdown, verplicht):
    - Stemming / Depressieve klachten
    - Angststoornissen
    - Gedrags- en impulsstoornissen
    - Middelengebruik / Verslaving
    - Cognitieve stoornissen
    - Context / Psychosociaal
  - **Severity** (button group of slider):
    - Laag (grijs badge)
    - Middel (geel badge)
    - Hoog (rood badge)
  - **Opmerkingen** (textarea, optioneel): vrij tekstveld voor notities
  - **Bronverslag** (readonly): "Gebaseerd op intake [titel] van [datum]"

- **AI-suggestie paneel (rechts, 40%):**
  - **Trigger:** Knop **AI › Analyseer intake**
  - **Output:**
    - Voorgestelde categorie (highlight)
    - Voorgestelde severity (highlight)
    - Rationale (korte uitleg, 2-3 zinnen)
    - Bronzinnen (quotes uit intake)
  - **Acties:**
    - **Accepteer suggestie** — vult formulier automatisch in
    - **Negeer** — sluit suggestie paneel

**States:**
- **Geen profiel:** "Nog geen probleemprofiel. Start met AI-analyse of vul handmatig in."
- **AI bezig:** Skeleton loader in suggestie-paneel
- **Opgeslagen:** Groene melding "Probleemprofiel opgeslagen" → activeert Behandelplan tab

---

### 4.5 Behandelplan

**Doel:** Genereren en bewerken van een gestructureerd behandelplan met SMART-doelen.

**Structuur:**
- **Header:**
  - Versie-indicator: "Concept" (oranje badge) of "Versie X – Gepubliceerd" (groene badge)
  - Publicatiedatum (indien gepubliceerd)

- **Vier secties (cards/accordions):**

  1. **Doelen**
     - Lijst van doelen (bullets, bewerkbaar)
     - Voorbeeld: "Cliënt ervaart minder angstklachten in sociale situaties binnen 3 maanden"
     - **Micro-AI-actie:** Knop **↻ Regenereer** per doel

  2. **Interventies**
     - Lijst van interventies
     - Voorbeeld: "Cognitieve gedragstherapie (CGT), 12 sessies"
     - **Micro-AI-actie:** Knop **↻ Regenereer** per interventie

  3. **Frequentie/Duur**
     - Tekstveld met suggestie
     - Voorbeeld: "Wekelijks, 12 weken, 50 minuten per sessie"

  4. **Meetmomenten**
     - Lijst van evaluatiemomenten
     - Voorbeeld: "Na 4 sessies, na 8 sessies, afsluiting na 12 sessies"

**Initiële generatie:**
- **Trigger:** Knop **AI › Genereer behandelplan** (alleen zichtbaar als probleemprofiel bestaat)
- **Input:** Gebruikt intake-notities + probleemprofiel als context
- **Output:** Vult alle vier secties met voorstellen
- **Feedback:** "Plan gegenereerd. Bekijk en bewerk indien nodig." (blauwe info-toast)

**Bewerken:**
- Alle velden/bullets zijn inline bewerkbaar (contentEditable of input fields)
- **Auto-save:** Elke wijziging wordt automatisch opgeslagen als concept

**Publiceren:**
- **Knop:** **Publiceer v[N]** (rechtsboven)
- **Validatie:** Controleer of alle secties gevuld zijn
- **Actie:**
  - Wijzigt status van "Concept" naar "Gepubliceerd"
  - Verhoogt versienummer
  - Timestamp van publicatie
  - Concept wordt read-only; nieuwe wijzigingen maken nieuwe versie aan
- **Feedback:** "Behandelplan v1 gepubliceerd" (groene toast)

**States:**
- **Geen plan:** "Nog geen behandelplan. Genereer met AI of start handmatig."
- **Concept:** Oranje badge, bewerkbaar
- **Gepubliceerd:** Groene badge, read-only met knop **Nieuwe versie**

---

### 4.6 Mini-agenda (stretch, optioneel)

**Doel:** Afspraken koppelen aan cliënt voor planning en follow-up.

**Functionaliteit:**
- Kalenderweergave (week of maand)
- **Nieuwe afspraak:**
  - Datum/tijd picker
  - Type afspraak (dropdown): Intake | Evaluatie | Behandeling
  - Locatie (optioneel)
  - Notities (optioneel)
- **Weergave in dashboard:** laatste + eerstvolgende 3 afspraken

---

### 4.7 Rapportage (stretch, optioneel)

**Doel:** PDF export van volledige cliëntdossier voor archivering of delen.

**Functionaliteit:**
- **Knop:** **Exporteer als PDF** in cliënt-menu
- **Inhoud:**
  - Basisgegevens
  - Alle intakes (chronologisch)
  - Probleemprofiel
  - Behandelplan (gepubliceerde versie)
  - *(Optioneel)* Afspraken
- **Output:** Downloads PDF met professionele opmaak (logo, headers, footers)

---

## 5. UI-overzicht (visuele structuur)

### Globale layout (alle schermen)

```
┌──────────────────────────────────────────────────────────────┐
│ Topbalk: Logo | Breadcrumb | Zoeken | User menu             │
├───────────────┬──────────────────────────────────────────────┤
│ Linkernav     │  Middenpaneel (content area)                 │
│ (indien actief│  → Dashboard: tegels                         │
│  in dossier)  │  → Intake: editor + AI-rail                  │
│               │  → Profiel: formulier + suggestie            │
│ Overzicht     │  → Plan: secties met doelen/interventies     │
│ Intakes       │                                              │
│ Profiel       │                                              │
│ Plan          │                                              │
│ (Afspraken)   │                                              │
├───────────────┴──────────────────────────────────────────────┤
│ Toast area (rechtsonder): meldingen (success/error/info)    │
└──────────────────────────────────────────────────────────────┘
```

### Cliëntenlijst (geen linkernav)

```
┌──────────────────────────────────────────────────────────────┐
│ Topbalk: Logo | Zoeken | [+ Nieuwe cliënt]                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Cliëntenlijst                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │ ID    │ Naam             │ Geboortedatum │ Update │     │
│  ├───────┼──────────────────┼───────────────┼────────┤     │
│  │ C-001 │ Jan de Vries     │ 15-03-1985    │ 2u     │     │
│  │ C-002 │ Maria Jansen     │ 22-07-1990    │ 1d     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Intake-editor met AI-rail

```
┌──────────────────────────────────────────────────────────────┐
│ Jan de Vries | [Opslaan] [AI-acties ▼]                      │
├───────────────┬─────────────────────┬────────────────────────┤
│ Overzicht     │ Editor              │ AI-rail               │
│ Intakes ●     │ ┌─────────────────┐ │ ┌──────────────────┐ │
│ Profiel       │ │ Titel: [.......]│ │ │ AI-resultaat:    │ │
│ Plan          │ │ Tag: [Intake ▼] │ │ │ Samenvatting     │ │
│               │ └─────────────────┘ │ │                  │ │
│               │                     │ │ • Punt 1         │ │
│               │ Rich text area...   │ │ • Punt 2         │ │
│               │                     │ │                  │ │
│               │                     │ │ [Invoegen]       │ │
│               │                     │ │ [Annuleren]      │ │
│               │                     │ └──────────────────┘ │
│               │ [Opslaan]           │                      │
├───────────────┴─────────────────────┴────────────────────────┤
│ Toast: "Verslag opgeslagen" (groen)                         │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Interacties met AI (functionele beschrijving)

| Locatie | AI-actie | Trigger | Input | Output | Feedback |
|----------|-----------|----------|--------|---------|----------|
| **Intake-editor** | Samenvatten | Klik op **AI › Samenvatten** | TipTap JSON (intake-tekst) | 5-8 bullets in NL | Preview in AI-rail → Invoegen/Annuleren |
| **Intake-editor** | Leesbaarheid (B1) | Klik op **AI › Verbeter leesbaarheid** | TipTap JSON | Herschreven tekst (B1-niveau) | Preview in AI-rail → Invoegen/Annuleren |
| **Intake-editor** | Extract problemen | Klik op **AI › Extract problemen** | TipTap JSON | Categorie + severity + rationale + bronzinnen | Suggestie in AI-rail + highlights in editor |
| **Probleemprofiel** | Analyseer intake | Klik op **AI › Analyseer intake** | Intake-tekst (laatste verslag) | Voorgestelde categorie + severity + rationale | Suggestie-paneel rechts → Accepteren/Negeren |
| **Behandelplan** | Genereer plan | Klik op **AI › Genereer behandelplan** | Intake + probleemprofiel | 4 secties (doelen, interventies, frequentie, meetmomenten) | Vult alle secties → bewerkbaar |
| **Behandelplan** | Regenereer doel | Klik op **↻** bij specifiek doel | Context (huidige doelen + intake) | Nieuw geformuleerd doel (SMART) | Vervangt huidige doel → bewerkbaar |

**AI-processing states:**
- **Bezig:** Non-blocking spinner + "Genereren..." tekst
- **Succes:** Output verschijnt in preview/suggestie-area
- **Fout:** Rode melding "Kon niet verwerken" + retry-knop
- **Timeout:** "AI-actie duurde te lang. Probeer opnieuw."

**AI-highlights (Extract problemen):**
- Bronzinnen krijgen lichtgele achtergrond in editor
- Highlights verdwijnen bij: Invoegen, Annuleren, of nieuwe AI-actie
- Implementatie: TipTap Decorations API

---

## 7. Gebruikersrollen en rechten

**MVP:** Vereenvoudigde autorisatie — alle authenticated users hebben volledige toegang (demo-omgeving).

| Rol | Toegang tot | Beperkingen | Implementatie |
|------|--------------|-------------|---------------|
| **Demo-user** (MVP) | Alle cliëntdossiers, alle functies | Alleen fictieve data | Supabase Auth, RLS policy: `auth.uid() IS NOT NULL` |

**Post-MVP (Roadmap):**

| Rol | Toegang tot | Beperkingen |
|------|--------------|-------------|
| **Behandelaar** | Eigen cliëntdossiers + gedeelde dossiers | Kan alleen eigen dossiers bewerken |
| **Manager** | Alle dossiers (read-only) | Geen bewerkingen, alleen rapportages |
| **Admin** | Alles | Volledige CRUD + gebruikersbeheer |

**Toekomstige implementatie:**
- Multi-tenant: `org_id` kolom in alle tables
- RLS policies: `auth.jwt() ->> 'org_id' = org_id`
- Role-based access: `auth.jwt() ->> 'role'` checks

---

## 8. UX-specificaties (koppeling met stylesheet)

**Kleurgebruik (zie `/docs/ux-stylesheet.md`):**
- **Primary actions:** `#3B82F6` (blauw) — Opslaan, Publiceren, Invoegen
- **Secondary actions:** `#334155` (grijs) — Annuleren, Terug
- **Success feedback:** `#16A34A` (groen) — toasts, badges
- **Warning/Concept:** `#EAB308` (geel) — concept-status
- **Error:** `#DC2626` (rood) — foutmeldingen

**Module-accenten:**
- Afspraken: groen (`#E8F8EF` bg, `#16A34A` accent)
- Medicatie/Herinneringen: geel (`#FEF6DC` bg, `#F59E0B` accent)
- Lab/Resultaten: oranje (`#FFEBDC` bg, `#F97316` accent)

**Toegankelijkheid:**
- Alle tekst voldoet aan WCAG AA contrast (min. 4.5:1)
- Focus rings altijd zichtbaar (2px `#3B82F6`)
- Keyboard navigation volledig ondersteund
- Status niet alleen met kleur: iconen + labels combineren

---

## 9. Demo-scenario (10 minuten)

**Voorbereiding:** Database seeden met 2-3 fictieve cliënten (1 met partial data, 1 leeg).

### Flow A: Nieuwe cliënt → Intake → AI Samenvatten (4 min)
1. **Start:** Cliëntenlijst (0:00)
2. Klik **+ Nieuwe cliënt** → vul in: "Test Demo", "Testpersoon", "01-01-1990" → Opslaan (0:30)
3. Navigeer naar nieuwe cliënt → klik **Intakes** tab (0:45)
4. Klik **+ Nieuw verslag** → typ demo-intake (vooraf geprepareerde tekst plakken) (1:30)
5. Klik **AI › Samenvatten** → toon preview in AI-rail (2:00)
6. Klik **Invoegen** → samenvatting verschijnt in editor (2:30)
7. Klik **Opslaan** → toast "Verslag opgeslagen" (3:00)

### Flow B: Probleemprofiel genereren → AI suggestie (3 min)
8. Klik **Probleemprofiel** tab (3:15)
9. Klik **AI › Analyseer intake** → toon suggestie (categorie, severity, rationale) (4:00)
10. Highlights verschijnen in editor (source highlighting demo) (4:30)
11. Klik **Accepteer suggestie** → vult formulier (4:45)
12. Klik **Opslaan** → groene toast + Behandelplan tab wordt actief (5:00)

### Flow C: Behandelplan genereren → Bewerken → Publiceren (3 min)
13. Klik **Behandelplan** tab (5:15)
14. Klik **AI › Genereer behandelplan** → toon alle vier secties (6:00)
15. Bewerk één doel handmatig → auto-save indicator (6:45)
16. Klik **Publiceer v1** → status wijzigt naar "Gepubliceerd" (7:30)
17. Navigeer terug naar **Overzicht** → toon dashboard met tegels (8:00)
18. **(Optioneel)** Demo PDF export (8:30)

**Afsluiting:** Q&A + discussie AI-toegevoegde waarde (8:30-10:00)

---

## 10. Bijlagen & Referenties

**Gerelateerde documenten:**
- [PRD (Product Requirements Document)](./prd-mini-ecd.md)
- [TO (Technisch Ontwerp)](./to-mini-ecd.md)
- [UX/UI Stylesheet](./ux-stylesheet.md)
- [API Access Document](./api-acces-mini-ecd.md)

**Externe referenties:**
- TipTap editor: https://tiptap.dev
- Supabase documentatie: https://supabase.com/docs
- Next.js App Router: https://nextjs.org/docs/app
- Claude AI API: https://docs.anthropic.com/claude/reference

---

**Wijzigingslog:**
- v1.0 (09-11-2025): Initiële versie voor MVP demo
