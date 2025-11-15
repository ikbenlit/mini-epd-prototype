🧩 Functioneel Ontwerp (FO) — Mini-ECD Prototype
Projectnaam: Mini-ECD Prototype
Versie: v2.0 (MVP + Onboarding + Marketing Site)
Datum: 15-11-2025
Auteur: Ontwikkelteam AI Speedrun

1. Doel en relatie met het PRD
🎯 Doel van dit document:
Het Functioneel Ontwerp (FO) beschrijft hoe de Mini-ECD applicatie functioneel werkt — wat de gebruiker ziet, doet en ervaart tijdens de AI-inspiratiesessie én de LinkedIn Build Serie. Waar het PRD uitlegt wat en waarom, laat het FO zien hoe dit in de praktijk werkt.
📘 Context:
Dit FO ondersteunt twee hoofddoelen:

EPD Demo: Kernflow intake → probleemclassificatie → behandelplan met AI-ondersteuning
Build in Public: Marketing website die het development proces transparant toont voor LinkedIn audience

Nieuw in v2.0:

Onboarding systeem (walkthrough + context-aware tooltips)
Marketing website routes (landing, build-log, demo info, contact)
UX-guidance systeem dat onderscheidt van legacy EPD's

Relatie met andere documenten:

PRD v1.2: definieert de vereisten en scope (inclusief Software on Demand strategie)
TO (Technisch Ontwerp): beschrijft de technische implementatie
UX Stylesheet: specificeert kleuren en styling
Bouwplan: phased development plan


2. Overzicht van de belangrijkste onderdelen
De applicatie bestaat uit twee hoofdsecties:
A. Marketing Website (Public)

Landing Page — Software on Demand pitch met live build metrics
Build Log — Week-by-week transparant development proces
Live Demo Info — Demo credentials en walkthrough video
How It Works — Software on Demand explainer + ROI calculator
Contact/Request — Lead generation met intake form

B. EPD Application (Protected)

Cliëntenlijst — overzicht met zoek/filter
Cliëntdossier / Dashboard — configureerbare tegels
Intakeverslag — rich text editor met AI-ondersteuning
Probleemprofiel (DSM-light) — categorisatie en severity
Behandelplan — gestructureerd plan met SMART-doelen
Onboarding System — walkthrough + tooltips + help-iconen
(Stretch) Mini-agenda — afspraken
(Stretch) Rapportage — PDF export


3. User Stories
Marketing Website User Stories
IDRolDoel / ActieVerwachte waardePrioriteitUS-12BezoekerLanding page bekijken met live build metricsBegrijpen Software on Demand conceptHoogUS-13BezoekerBuild-log doorlopenTransparantie over development procesHoogUS-14BezoekerDemo info en credentials vindenKunnen proberen zonder accountMiddelUS-15LeadContact formulier invullenSoftware on Demand project aanvragenHoogUS-16LezerHow It Works lezen met ROI calculatorBeslissen of geschikt voor eigen caseMiddel
EPD User Stories (Primair)
IDRolDoel / ActieVerwachte waardePrioriteitUS-01BehandelaarNieuwe cliënt aanmaken met basisgegevensKan direct starten met intakeHoogUS-02BehandelaarIntakeverslag schrijven in rich text editorFlexibel notuleren met opmaakHoogUS-03BehandelaarIntakeverslag samenvatten met AITijdbesparing, sneller overzichtHoogUS-04BehandelaarLeesbaarheid verbeteren naar B1-niveau met AICliëntvriendelijke communicatieMiddelUS-05BehandelaarAI-suggestie krijgen voor DSM-light categorie en severitySnellere en consistentere classificatieHoogUS-06BehandelaarBehandelplan genereren op basis van intake/profielEfficiënter plannen, SMART-doelenHoogUS-07BehandelaarGegenereerd plan bewerken en publicerenControle over eindresultaatHoogUS-08BehandelaarDashboard-tegels configurerenPersonalisatie werkruimteLaagUS-17GebruikerOnboarding walkthrough doorlopenSnel werkend zonder handleidingHoogUS-18GebruikerContext-aware help zien bij complexe featuresBegrijpen zonder documentatieMiddelUS-19GebruikerHelp-iconen gebruiken voor uitlegOn-demand informatieLaag
Secundaire User Stories (Stakeholders)
IDRolDoel / ActieVerwachte waardePrioriteitUS-20Product OwnerDemo-flow doorlopen tijdens workshopBegrijpt AI-toegevoegde waardeHoogUS-21DeveloperZien hoe AI in ECD-proces geïntegreerd isInspiratie voor eigen implementatiesMiddelUS-22LinkedIn FollowerBuild progress volgenLeren van transparant developmentHoog

4. Functionele werking per onderdeel
SECTIE A: MARKETING WEBSITE
4.1 Landing Page (/)
Doel: Software on Demand concept verkopen via EPD build als proof.
Structuur:
┌─────────────────────────────────────────────────────────────┐
│ Header: Logo | Build Log | Demo | Contact                   │
├─────────────────────────────────────────────────────────────┤
│ HERO SECTION                                                │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ "Software on Demand: Van idee naar product in weken" │   │
│ │                                                       │   │
│ │ Live Counter:                                         │   │
│ │ Week 3 van 4 | 65 uur development | €135 kosten      │   │
│ │                                                       │   │
│ │ [Volg op LinkedIn] [Probeer Live Demo]               │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ COMPARISON TABLE                                            │
│ ┌───────────────┬─────────────────┬──────────────────────┐  │
│ │               │ Traditioneel    │ Software on Demand   │  │
│ ├───────────────┼─────────────────┼──────────────────────┤  │
│ │ Tijd          │ 12-24 maanden   │ 4 weken              │  │
│ │ Kosten        │ €100.000+       │ €200 (build)         │  │
│ │ Team          │ 5+ developers   │ 1 dev + AI tools     │  │
│ │ Run costs     │ €5.000+/mnd     │ €50/mnd              │  │
│ └───────────────┴─────────────────┴──────────────────────┘  │
│                                                             │
│ THE PROBLEM                                                 │
│ • Enterprise software: onbetaalbaar voor MKB               │
│ • Vendor lock-in en rigide roadmaps                        │
│ • 2 jaar wachten op custom features                        │
│                                                             │
│ THE SOLUTION                                                │
│ • AI-assisted development: 10x sneller                     │
│ • One-dev teams = enterprise quality                       │
│ • Pay-as-you-grow vanaf €50/mnd                            │
│                                                             │
│ LIVE PROOF: EPD BUILD                                       │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Week 1: Foundation ✓      8 uur    €0              │     │
│ │ Week 2: AI Integration ✓  12 uur   €25             │     │
│ │ Week 3: Core Features →   15 uur   €35             │     │
│ │ Week 4: Polish & Launch   10 uur   €15 (estimate)  │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ STACK SHOWCASE                                              │
│ [Next.js] [Claude AI] [Supabase] [Vercel]                  │
│ "Same tools big tech uses, now for small business"         │
│                                                             │
│ CTA SECTION                                                 │
│ [Volg de build op LinkedIn] (Primary)                      │
│ [Bespreek jouw project] (Secondary)                        │
│ [Probeer live demo] (Tertiary)                             │
└─────────────────────────────────────────────────────────────┘
Functionaliteit:

Live Counter: Updates wekelijks (hardcoded, geen real-time)
Comparison Table: Visual emphasis op contrast (rood vs groen)
CTA tracking: Click events naar analytics
Responsive: Mobile-first design
Scroll animations: Subtle fade-ins voor engagement

States:

Loading: Skeleton voor counter area
Mobile: Stack vertically, simplified table
No JS: Graceful degradation, static content


4.2 Build Log (/build-log)
Doel: Transparant week-by-week development proces tonen.
Layout:
┌─────────────────────────────────────────────────────────────┐
│ Breadcrumb: Home > Build Log                                │
├─────────────────────────────────────────────────────────────┤
│ RUNNING TOTALS DASHBOARD                                    │
│ ┌──────────┬──────────┬──────────┬──────────────────────┐   │
│ │ 45 uur   │ €160     │ 8 feat.  │ vs 500h traditional │   │
│ │ totaal   │ kosten   │ done     │ (9x sneller)        │   │
│ └──────────┴──────────┴──────────┴──────────────────────┘   │
│                                                             │
│ TIMELINE (newest first)                                     │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ WEEK 3: CORE FEATURES (Nov 11-15)                   │     │
│ │ ───────────────────────────────────────────────      │     │
│ │ Status: In Progress | 15 uur | €35 API kosten       │     │
│ │                                                      │     │
│ │ What we built:                                       │     │
│ │ ✓ Treatment plan generation                         │     │
│ │ ✓ SMART goals formulation                           │     │
│ │ ✓ Versioning & publish flow                         │     │
│ │ → Dashboard with tiles (in progress)                │     │
│ │                                                      │     │
│ │ How we built it:                                     │     │
│ │ • Claude AI prompt voor SMART-doelen:               │     │
│ │   [Code snippet collapsed - click to expand]        │     │
│ │ • Supabase JSONB voor plan storage                  │     │
│ │ • Optimistic UI updates met Zustand                 │     │
│ │                                                      │     │
│ │ Time vs Traditional:                                 │     │
│ │ [Chart: 15h actual vs 80h traditional estimate]     │     │
│ │                                                      │     │
│ │ Challenges & Solutions:                              │     │
│ │ • Challenge: SMART criteria validation              │     │
│ │   Solution: Zod schema + AI double-check            │     │
│ │ • Challenge: Version conflicts                      │     │
│ │   Solution: Optimistic locking met updated_at       │     │
│ │                                                      │     │
│ │ [Embedded LinkedIn Post]                            │     │
│ │ [View on LinkedIn →]                                │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ WEEK 2: AI INTEGRATION (Nov 4-8)                    │     │
│ │ [Similar structure, collapsed by default]           │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ WEEK 1: FOUNDATION (Oct 28 - Nov 1)                 │     │
│ │ [Similar structure, collapsed by default]           │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
Functionaliteit:

Accordion per week: Expand/collapse voor leesbaarheid
Code snippets: Syntax highlighting met copy button
Charts: Simple bar charts (Chart.js) voor tijd vergelijking
LinkedIn embeds: iframe voor posts (fallback: screenshot + link)
Share buttons: Per week delen op social media
RSS feed: Voor developers die updates willen volgen

Per Entry bevat:

Status badge (Done ✓ | In Progress → | Planned ○)
Uren besteed + API kosten
Features delivered (checkmarks)
Technical implementation details
Time comparison chart
Challenges & solutions (leer-aspect)
Embedded LinkedIn post

States:

Loading: Skeleton voor timeline entries
No entries yet: "Week 1 starting soon..." placeholder
Error loading embed: Fallback naar screenshot


4.3 Live Demo Info (/demo)
Doel: Bezoekers informeren over demo + credentials geven.
Layout:
┌─────────────────────────────────────────────────────────────┐
│ "Probeer het zelf" HERO                                     │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Video Walkthrough (2 min)                             │   │
│ │ [▶ Play]                                              │   │
│ │                                                       │   │
│ │ Demo Credentials:                                     │   │
│ │ Email: demo@aispeedrun.nl                            │   │
│ │ Password: Demo2025!                                   │   │
│ │ [Copy] [Launch Demo →]                               │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ WHAT YOU'LL SEE                                             │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ 1. Onboarding walkthrough (3 min)                    │     │
│ │ 2. Create new client                                 │     │
│ │ 3. Write intake + AI summarize                       │     │
│ │ 4. AI problem extraction                             │     │
│ │ 5. Generate treatment plan                           │     │
│ │ 6. Publish & dashboard view                          │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ FEATURE COMPARISON                                          │
│ ┌───────────────────┬──────────────┬─────────────────────┐  │
│ │ Feature           │ Enterprise   │ AI Speedrun (4wks)  │  │
│ ├───────────────────┼──────────────┼─────────────────────┤  │
│ │ Intake editor     │ ✓ Basic      │ ✓ Rich text         │  │
│ │ AI summarize      │ ✗            │ ✓ 5 sec             │  │
│ │ DSM classification│ ✓ Manual     │ ✓ AI-assisted       │  │
│ │ Treatment plans   │ ✓ Templates  │ ✓ AI-generated      │  │
│ │ Onboarding        │ ✗ PDF manual │ ✓ Interactive 3min  │  │
│ │ Setup time        │ 6 months     │ Instant (demo)      │  │
│ └───────────────────┴──────────────┴─────────────────────┘  │
│                                                             │
│ "This took 4 weeks. Traditional build: 24 months."          │
│                                                             │
│ [Start Demo] [Contact voor eigen build]                    │
└─────────────────────────────────────────────────────────────┘
Functionaliteit:

Video player: YouTube embed of custom player
Copy credentials: One-click copy buttons
Launch demo: Direct link naar /clients (auto-login indien credentials gekopieerd)
Feature comparison: Toggle voor meer details per feature
CTA tracking: Conversie naar contact form

States:

Demo offline: "Temporarily unavailable" message + contact CTA
Video loading: Poster image met play overlay
Mobile: Video full-width, credentials in expandable card


4.4 How It Works (/how-it-works)
Doel: Software on Demand concept uitleggen + interactive ROI calculator.
Structuur:
┌─────────────────────────────────────────────────────────────┐
│ WHAT IS SOFTWARE ON DEMAND                                  │
│ • Custom software zonder vast dev team                      │
│ • AI-assisted development = 10x sneller                     │
│ • Pay-as-you-grow pricing model                             │
│ • Same quality as enterprise, fraction of cost              │
│                                                             │
│ WHEN IT MAKES SENSE                                         │
│ ┌──────────────┬────────────────┬─────────────────────┐     │
│ │ Use Case     │ SaaS           │ Software on Demand  │     │
│ ├──────────────┼────────────────┼─────────────────────┤     │
│ │ Generic need │ ✓ Best choice  │ Overkill            │     │
│ │ Custom flow  │ Limited        │ ✓ Perfect fit       │     │
│ │ Integration  │ Via APIs       │ ✓ Native            │     │
│ │ Control      │ Vendor decides │ ✓ You decide        │     │
│ │ Cost (year1) │ €5-50k         │ €200 + €600/yr      │     │
│ └──────────────┴────────────────┴─────────────────────┘     │
│                                                             │
│ PRICING MODEL TRANSPARENCY                                  │
│ One-time build: €150-500 (depends on complexity)           │
│ Monthly run: €50-150 (infrastructure + AI usage)            │
│ Updates: €50/hour on-demand                                 │
│                                                             │
│ CASE STUDY: EPD BUILD BREAKDOWN                             │
│ [Interactive expandable sections per week]                  │
│ Week 1: €0 (setup) | Week 2: €25 (AI) | etc.               │
│                                                             │
│ ROI CALCULATOR (INTERACTIVE)                                │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Hoeveel uur per week bespaar je? [____] uur         │     │
│ │ Wat is je uurtarief? €[____]                        │     │
│ │ Hoeveel gebruikers? [____]                          │     │
│ │                                                      │     │
│ │ ══ RESULTATEN ══                                     │     │
│ │ Besparing per maand: €[calculated]                  │     │
│ │ Break-even: [X] maanden                             │     │
│ │ ROI jaar 1: [Y]%                                     │     │
│ │                                                      │     │
│ │ [Download rapport] [Bespreek met expert]            │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
Functionaliteit:

Interactive calculator: Real-time berekening bij input change
Download rapport: PDF met calculation details
Comparison toggles: Show/hide details per scenario
CTA: Calculator results → contact form pre-filled

Calculator Logic:
typescriptsavings_per_month = hours_saved_per_week * 4 * hourly_rate * num_users
build_cost = 200 // simplified for demo
monthly_run = 50
break_even_months = build_cost / (savings_per_month - monthly_run)
roi_year1 = ((savings_per_month * 12 - build_cost - monthly_run * 12) / build_cost) * 100
```

---

### 4.5 Contact / Request (`/contact`)

**Doel:** Lead generation voor Software on Demand projecten.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ "Beschrijf jouw software need in 3 zinnen"                  │
│                                                             │
│ INTAKE FORM                                                 │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ Naam: [________________]                            │     │
│ │ Email: [________________]                           │     │
│ │ Bedrijf: [________________]                         │     │
│ │                                                      │     │
│ │ Wat wil je bouwen? (max 500 chars)                  │     │
│ │ [________________________________]                  │     │
│ │ [________________________________]                  │     │
│ │                                                      │     │
│ │ Voor hoeveel gebruikers? [____]                     │     │
│ │                                                      │     │
│ │ Budget indicatie:                                    │     │
│ │ ( ) €0-1k  ( ) €1-5k  ( ) €5-10k  ( ) >€10k         │     │
│ │                                                      │     │
│ │ ══ GESCHATTE TIMELINE & KOSTEN ══                    │     │
│ │ Gebaseerd op je input:                              │     │
│ │ • Bouwtijd: 3-6 weken                               │     │
│ │ • Kosten: €300-800                                  │     │
│ │ • Run: €50-100/mnd                                  │     │
│ │                                                      │     │
│ │ [Verstuur aanvraag]                                 │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ OF PLAN EEN GESPREK                                         │
│ [Calendly embed - 30min intake call]                       │
│                                                             │
│ TRUST SIGNALS                                               │
│ ┌──────────────┬──────────────┬──────────────────────┐      │
│ │ "Colin heeft │ "Binnen 3    │ "Van €100k project   │      │
│ │ ons AI-tool  │ weken live,  │ naar €500. Mind =    │      │
│ │ in 2 weken   │ werkt perfect│ blown."              │      │
│ │ gebouwd"     │ voor ons"    │                      │      │
│ │ - Jan, MKB   │ - Sarah, HR  │ - Tom, Startup       │      │
│ └──────────────┴──────────────┴──────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

**Functionaliteit:**
- **Smart estimates**: Based on description length + user count
- **Form validation**: Zod schema, real-time feedback
- **Calendly integration**: Embedded booking widget
- **Pre-fill from calculator**: If coming from ROI page
- **Email notification**: To Colin + auto-reply to lead
- **CRM integration**: Store in database voor follow-up

**States:**
- **Validating**: Inline error messages
- **Submitting**: Loading spinner on button
- **Success**: "Thanks! We'll contact you within 24h" + confirmation email
- **Error**: "Something went wrong. Email directly: colin@ikbenlit.nl"

---

### SECTIE B: EPD APPLICATION

### 4.6 Cliëntenlijst

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

### 4.7 Cliëntdossier / Dashboard

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
  - Knop **Opslaan** → slaat voorkeur op (localStorage)

---

### 4.8 Intakeverslag

**Doel:** Creëren en bewerken van intake-notities met rich text en AI-ondersteuning.

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│ Topbalk: Cliëntnaam | [Opslaan] [AI-acties ▼]                │
├───────────────┬──────────────────────────┬───────────────────┤
│ Linkernav     │  Editor (hoofdpaneel)    │ AI-rail           │
│ (tabs)        │  TipTap rich text        │ (rechts)          │
│               │                          │                   │
│ Overzicht     │ [Titel: ___________]     │ [AI-resultaat     │
│ Intakes ●     │ [Tag: Intake ▼]          │  area]            │
│ Profiel       │                          │                   │
│ Plan          │ Rich text toolbar:       │ [Preview]         │
│               │ [B][I][U][•][1.]["]      │                   │
│               │                          │ [Invoegen]        │
│               │ Editor content area...   │ [Kopiëren]        │
│               │                          │ [Annuleren]       │
│               │ [Opgeslagen om 14:32]    │                   │
├───────────────┴──────────────────────────┴───────────────────┤
│ Toast area (rechtsonder): meldingen                          │
└──────────────────────────────────────────────────────────────┘
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
- Implementatie: TipTap Decorations API

**Keyboard shortcuts:**
- `Ctrl/Cmd+S`: Opslaan
- `Ctrl/Cmd+K`: Zoeken in tekst
- `Ctrl/Cmd+N`: Nieuw verslag

---

### 4.9 Probleemprofiel (DSM-light)

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
  - **Severity** (button group):
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

### 4.10 Behandelplan

**Doel:** Genereren en bewerken van een gestructureerd behandelplan met SMART-doelen.

**Structuur:**
- **Header:**
  - Versie-indicator: "Concept" (oranje badge) of "Versie X — Gepubliceerd" (groene badge)
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

### 4.11 Onboarding System (NIEUW)

**Doel:** Moderne, context-aware begeleiding die onderscheidt van legacy EPD's met PDF-handleidingen.

#### 4.11.1 Eenmalige Walkthrough

**Trigger:** Auto-start bij eerste login (check localStorage: `onboardingCompleted`)

**Flow (5 stappen, 3 minuten totaal):**
```
┌─────────────────────────────────────────────────────────────┐
│ STAP 1: WELKOM (15 sec)                                     │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ [Spotlight op logo]                                   │   │
│ │                                                       │   │
│ │ 👋 Welkom bij AI Speedrun EPD                        │   │
│ │                                                       │   │
│ │ Deze tool bespaart je uren administratie per week    │   │
│ │ dankzij slimme AI-ondersteuning. Laten we je in 3    │   │
│ │ minuten laten zien hoe het werkt.                    │   │
│ │                                                       │   │
│ │ [Overslaan] [Volgende →]                             │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STAP 2: CLIËNT AANMAKEN (45 sec)                            │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ [Spotlight op "+ Nieuwe cliënt" knop]                 │   │
│ │                                                       │   │
│ │ Eerst maken we een cliënt aan. Klik hier om te       │   │
│ │ beginnen. Het systeem genereert automatisch een      │   │
│ │ uniek ClientID.                                       │   │
│ │                                                       │   │
│ │ [Terug] [Volgende →]                                 │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ [Modal opens - form auto-filled with demo data]            │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Voornaam: Demo                                        │   │
│ │ Achternaam: Gebruiker                                 │   │
│ │ Geboortedatum: 01-01-1990                            │   │
│ │                                                       │   │
│ │ → Klik "Opslaan" om door te gaan                     │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STAP 3: INTAKE SCHRIJVEN + AI (60 sec)                      │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ [Spotlight op Intakes tab]                            │   │
│ │                                                       │   │
│ │ Nu schrijven we een intake. Let op: de AI kan deze   │   │
│ │ automatisch samenvatten in seconden!                 │   │
│ │                                                       │   │
│ │ [Editor opens met voorbeeld tekst pre-filled]        │   │
│ │                                                       │   │
│ │ → Klik op "AI › Samenvatten" om magie te zien        │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ [AI rail shows result]                                      │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Zie je? In 3 seconden een overzichtelijke            │   │
│ │ samenvatting. Klik "Invoegen" om toe te voegen.      │   │
│ │                                                       │   │
│ │ [Terug] [Volgende →]                                 │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STAP 4: DASHBOARD (30 sec)                                  │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ [Spotlight op Overzicht tab]                          │   │
│ │                                                       │   │
│ │ Het dashboard toont alle belangrijke info in          │   │
│ │ configureerbare tegels. Klik op het tandwiel-icoon   │   │
│ │ om te kiezen wat je wilt zien.                        │   │
│ │                                                       │   │
│ │ [Terug] [Volgende →]                                 │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STAP 5: KLAAR! (30 sec)                                     │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 🎉 Je bent klaar!                                     │   │
│ │                                                       │   │
│ │ Je weet nu hoe je:                                    │   │
│ │ ✓ Cliënten aanmaakt                                  │   │
│ │ ✓ Intakes schrijft met AI-hulp                       │   │
│ │ ✓ Het dashboard gebruikt                             │   │
│ │                                                       │   │
│ │ Volgende stappen:                                     │   │
│ │ • Probeer probleemclassificatie met AI              │   │
│ │ • Genereer een behandelplan                          │   │
│ │ • Bekijk de documentatie voor meer features          │   │
│ │                                                       │   │
│ │ [Documentatie] [Tour opnieuw] [Start werken!]       │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Functionaliteit:**
- **Progress indicator**: "Stap 2 van 5" bovenaan
- **Skip at any time**: "Overslaan" knop altijd zichtbaar
- **Keyboard navigation**: Pijltjestoetsen voor vorige/volgende
- **Persistence**: `localStorage.setItem('onboardingCompleted', 'true')`
- **Restart optie**: In user menu "Tour opnieuw starten"
- **Implementation**: react-joyride library

**States:**
- **First-time user**: Auto-start walkthrough
- **Returning user**: No walkthrough, tooltips still active
- **Skipped**: Can restart from user menu
- **Completed**: Badge in user menu "✓ Onboarding voltooid"

#### 4.11.2 Context-aware Tooltips

**Doel:** Just-in-time hulp bij eerste gebruik van complexe features.

**Trigger voorbeelden:**

1. **Eerste keer AI-knop (Samenvatten)**
```
┌─────────────────────────────────────┐
│ [AI › Samenvatten]                  │
│  ↑                                  │
│ ┌─────────────────────────────────┐ │
│ │ 💡 AI kan je intake samenvatten │ │
│ │ in 5 seconden. Probeer het!     │ │
│ │                                 │ │
│ │ [Begrepen] [Toon niet meer]     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

2. **Eerste keer DSM-dropdown**
```
┌─────────────────────────────────────┐
│ Categorie: [Selecteer... ▼]        │
│  ↑                                  │
│ ┌─────────────────────────────────┐ │
│ │ 💡 Onzeker? Klik "AI › Analyseer│ │
│ │ intake" voor een suggestie.     │ │
│ │                                 │ │
│ │ [Begrepen] [Toon niet meer]     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

3. **Eerste keer publiceren**
```
┌─────────────────────────────────────┐
│ [Publiceer v1]                      │
│  ↑                                  │
│ ┌─────────────────────────────────┐ │
│ │ ⚠️  Dit maakt het plan definitief│ │
│ │ en verhoogt het versienummer.   │ │
│ │ Wijzigingen hierna maken v2.    │ │
│ │                                 │ │
│ │ [Begrepen] [Toon niet meer]     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
Functionaliteit:

Trigger: First time element comes into view + user hovers/focuses
Dismissal: "Begrepen" → hide this tooltip
Permanent dismiss: "Toon niet meer" → add to tooltipsSeen array
Positioning: Smart positioning (above/below/left/right based on viewport)
Accessibility: aria-describedby, keyboard dismissible

State management:
typescriptlocalStorage.tooltipsSeen = [
  'ai-summarize-btn',
  'dsm-dropdown',
  'publish-btn',
  // etc.
]
```

#### 4.11.3 Help-iconen

**Doel:** On-demand uitleg voor complexe features.

**Locaties:**

1. **DSM-light categorieën**
```
┌──────────────────────────────────────────┐
│ Categorie: [Angststoornissen ▼] (?)     │
│                                ↑         │
│ [Hover tooltip:]                         │
│ Klik voor uitleg DSM-categorieën         │
│                                          │
│ [Click → expandable panel:]              │
│ ┌────────────────────────────────────┐   │
│ │ DSM-light Categorieën              │   │
│ │ ─────────────────────────────────  │   │
│ │ • Stemming/Depressie: [uitleg...]  │   │
│ │ • Angst: [uitleg...]               │   │
│ │ • Gedrag/Impuls: [uitleg...]       │   │
│ │ [etc.]                             │   │
│ │                                    │   │
│ │ [Sluiten]                          │   │
│ └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

2. **SMART doelen criteria**
```
┌──────────────────────────────────────────┐
│ Doelen (?)                               │
│        ↑                                 │
│ [Panel toont SMART uitleg:]              │
│ S - Specifiek                            │
│ M - Meetbaar                             │
│ A - Acceptabel                           │
│ R - Realistisch                          │
│ T - Tijdgebonden                         │
└──────────────────────────────────────────┘
```

3. **Severity-bepaling richtlijnen**
```
┌──────────────────────────────────────────┐
│ Severity: ( ) Laag (?) ( ) Middel ( ) Hoog│
│                    ↑                      │
│ [Panel:]                                  │
│ Laag: Lichte symptomen, minimale impact   │
│ Middel: Matige symptomen, dagelijkse      │
│         impact                            │
│ Hoog: Ernstige symptomen, grote           │
│       beperkingen                         │
└──────────────────────────────────────────┘
Functionaliteit:

Icon: Small (?) naast labels
Hover: Korte 1-line tooltip
Click: Expandable panel met uitgebreide uitleg
Positioning: Panel appears as popover, auto-positioned
Accessibility: aria-label, keyboard accessible

Implementation:
typescript<HelpIcon topic="dsm-categories" />
// Fetches content from /lib/help-content.ts

const helpContent = {
  'dsm-categories': {
    hover: 'Klik voor uitleg DSM-categorieën',
    panel: '<detailed HTML content>'
  },
  'smart-goals': { ... },
  'severity': { ... }
}
```

---

### 4.12 Mini-agenda (stretch, optioneel)

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

### 4.13 Rapportage (stretch, optioneel)

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

### Globale layout Marketing Site
```
┌──────────────────────────────────────────────────────────────┐
│ Header: Logo | Build Log | Demo | How It Works | Contact    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [Route-specific content area]                               │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Footer: © 2025 | ikbenlit.nl | Privacy | LinkedIn           │
└──────────────────────────────────────────────────────────────┘
```

### Globale layout EPD App
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

6. Interacties met AI (functionele beschrijving)
LocatieAI-actieTriggerInputOutputFeedbackIntake-editorSamenvattenKlik op AI › SamenvattenTipTap JSON (intake-tekst)5-8 bullets in NLPreview in AI-rail → Invoegen/AnnulerenIntake-editorLeesbaarheid (B1)Klik op AI › Verbeter leesbaarheidTipTap JSONHerschreven tekst (B1-niveau)Preview in AI-rail → Invoegen/AnnulerenIntake-editorExtract problemenKlik op AI › Extract problemenTipTap JSONCategorie + severity + rationale + bronzinnenSuggestie in AI-rail + highlights in editorProbleemprofielAnalyseer intakeKlik op AI › Analyseer intakeIntake-tekst (laatste verslag)Voorgestelde categorie + severity + rationaleSuggestie-paneel rechts → Accepteren/NegerenBehandelplanGenereer planKlik op AI › Genereer behandelplanIntake + probleemprofiel4 secties (doelen, interventies, frequentie, meetmomenten)Vult alle secties → bewerkbaarBehandelplanRegenereer doelKlik op ↻ bij specifiek doelContext (huidige doelen + intake)Nieuw geformuleerd doel (SMART)Vervangt huidige doel → bewerkbaar
AI-processing states:

Bezig: Non-blocking spinner + "Genereren..." tekst
Succes: Output verschijnt in preview/suggestie-area
Fout: Rode melding "Kon niet verwerken" + retry-knop
Timeout: "AI-actie duurde te lang. Probeer opnieuw."


7. Gebruikersrollen en rechten
MVP: Vereenvoudigde autorisatie — alle authenticated users hebben volledige toegang (demo-omgeving).
RolToegang totBeperkingenImplementatieDemo-user (MVP)Alle cliëntdossiers, alle functiesAlleen fictieve dataSupabase Auth, RLS policy: auth.uid() IS NOT NULLPublic visitorMarketing site onlyCannot access EPD appNo auth required for / routes
Post-MVP (Roadmap):
RolToegang totBeperkingenBehandelaarEigen cliëntdossiers + gedeelde dossiersKan alleen eigen dossiers bewerkenManagerAlle dossiers (read-only)Geen bewerkingen, alleen rapportagesAdminAllesVolledige CRUD + gebruikersbeheer

8. UX-specificaties (koppeling met stylesheet)
Kleurgebruik (zie /docs/ux-stylesheet.md):

Primary actions: #3B82F6 (blauw) — Opslaan, Publiceren, Invoegen
Secondary actions: #334155 (grijs) — Annuleren, Terug
Success feedback: #16A34A (groen) — toasts, badges
Warning/Concept: #EAB308 (geel) — concept-status
Error: #DC2626 (rood) — foutmeldingen

Module-accenten:

Afspraken: groen (#E8F8EF bg, #16A34A accent)
Medicatie/Herinneringen: geel (#FEF6DC bg, #F59E0B accent)
Lab/Resultaten: oranje (#FFEBDC bg, #F97316 accent)

Onboarding specifiek:

Walkthrough spotlight: Dark overlay rgba(0,0,0,0.5) + highlighted element
Tooltip background: #FFFFFF met shadow-lg
Progress dots: Active #3B82F6, inactive #E2E8F0

Toegankelijkheid:

Alle tekst voldoet aan WCAG AA contrast (min. 4.5:1)
Focus rings altijd zichtbaar (2px #3B82F6)
Keyboard navigation volledig ondersteund
Status niet alleen met kleur: iconen + labels combineren


9. Demo-scenario
Marketing Site Demo (5 min)
0:00-1:00: Landing Page

Scroll through hero → comparison table
Show live build counter
Click "Probeer Live Demo"

1:00-2:30: Build Log

Expand Week 2 entry
Show code snippet + time comparison chart
Emphasize transparency

2:30-3:30: How It Works

Interact with ROI calculator
Input: 5 uur/week, €75/uur, 3 gebruikers
Show: €900/mnd besparing, break-even 1 maand, ROI 5400%

3:30-5:00: Contact Form

Fill in demo lead
Show auto-estimate update
Submit → success message

EPD Demo (10 min)
Voorbereiding: Database seeden met 2-3 fictieve cliënten (1 met partial data, 1 leeg).
Flow A: Onboarding + Nieuwe cliënt → Intake → AI Samenvatten (5 min)

Start: Login met demo credentials (0:00)
Onboarding auto-start → doorloop 5 stappen (0:00-3:00)

Skip option getoond maar niet gebruikt
Live demo van walkthrough flow


Klik + Nieuwe cliënt → vul in: "Test Demo", "Testpersoon", "01-01-1990" → Opslaan (3:30)
Navigeer naar nieuwe cliënt → klik Intakes tab (3:45)
Context-aware tooltip verschijnt bij AI-knop (first-time) (4:00)
Klik + Nieuw verslag → typ demo-intake (vooraf geprepareerde tekst plakken) (4:30)
Klik AI › Samenvatten → toon preview in AI-rail (5:00)
Klik Invoegen → samenvatting verschijnt in editor (5:30)
Klik Opslaan → toast "Verslag opgeslagen" (6:00)

Flow B: Probleemprofiel genereren → AI suggestie (2 min)

Klik Probleemprofiel tab (6:15)
Help-icon tooltip bij DSM-dropdown (hover demo) (6:30)
Klik AI › Analyseer intake → toon suggestie (categorie, severity, rationale) (7:00)
Highlights verschijnen in editor (source highlighting demo) (7:30)
Klik Accepteer suggestie → vult formulier (7:45)
Klik Opslaan → groene toast + Behandelplan tab wordt actief (8:00)

Flow C: Behandelplan genereren → Publiceren (2 min)

Klik Behandelplan tab (8:15)
Klik AI › Genereer behandelplan → toon alle vier secties (8:45)
Bewerk één doel handmatig → auto-save indicator (9:15)
Tooltip bij publiceer-knop (first-time warning) (9:30)
Klik Publiceer v1 → status wijzigt naar "Gepubliceerd" (9:45)
Navigeer terug naar Overzicht → toon dashboard met tegels (10:00)

Afsluiting: Q&A + discussie AI-toegevoegde waarde (10:00-15:00)

10. Bijlagen & Referenties
Gerelateerde documenten:

PRD v1.2 (Product Requirements Document)
TO (Technisch Ontwerp)
UX/UI Stylesheet
API Access Document
Bouwplan

Externe referenties:

TipTap editor: https://tiptap.dev
Supabase documentatie: https://supabase.com/docs
Next.js App Router: https://nextjs.org/docs/app
Claude AI API: https://docs.anthropic.com/claude/reference
react-joyride (onboarding): https://docs.react-joyride.com/

Help content configuratie:

Centraal bestand: /src/lib/help-content.ts
Per topic: hover text + panel HTML
Makkelijk uitbreidbaar voor nieuwe features


11. Wijzigingen t.o.v. v1.0
Versie 2.0 toevoegingen:
Marketing Website (nieuw)

Landing page met live build metrics + comparison table
Build log met week-by-week transparency
Live demo info page met credentials
How It Works explainer + interactive ROI calculator
Contact/Request lead generation form

Onboarding System (nieuw)

Eenmalige walkthrough (5 stappen, 3 minuten)
Context-aware tooltips bij complexe features
Help-iconen met on-demand uitleg
localStorage state management
Restart optie via user menu

UX Improvements

Modern guidance vs legacy PDF-handleidingen
Just-in-time learning instead of upfront training
Progressive disclosure van complexiteit

Demo Scenario Update

Marketing site demo (5 min) toegevoegd
EPD demo nu inclusief onboarding flow
Totaal 15 minuten (was 10)

Technical Architecture

Route structuur: /(marketing) vs /(app)
Shared Next.js app voor beide
Public/protected route splitting
react-joyride library voor walkthrough


Wijzigingslog:

v2.0 (15-11-2025): Marketing website + onboarding system toegevoegd
v1.0 (09-11-2025): Initiële versie voor MVP demo
</document_content></document>

Perfect! Het herziene FO v2.0 integreert nu:
✅ Marketing website (5 nieuwe secties)
✅ Onboarding systeem (walkthrough + tooltips + help-iconen)
✅ Bijgewerkte user stories (US-12 t/m US-22)
✅ Uitgebreide demo-scenario's (15 min totaal)
✅ Route architectuur (marketing vs app split)
Alle nieuwe PRD v1.2 requirements zijn nu functioneel uitgewerkt. Klaar voor development volgens het bouwplan!