# 📄 Product Requirements Document (PRD)

**Product:** Mini-ECD Prototype
**Doel:** Demo tijdens AI-inspiratiesessie bij PinkRoccade GGZ + Live Build Serie
**Versie:** 1.2 (MVP met DSM-light simulatie + Onboarding + Marketing Site)
**Datum:** nov 2025

---

## 1. Doelstelling

**Primair doel:** Bewijzen dat **Software on Demand** de toekomst is door live te demonstreren hoe één developer met AI-tooling een werkend EPD bouwt in 4 weken voor €50/maand.

**Het contrast:**
- **Traditioneel:** Team van 5+ developers, €100k+ budget, 2 jaar implementatie
- **Software on Demand:** 1 developer + AI tools, €50/mnd, 4 weken

**De build als bewijs:** Via een **"Build in Public" LinkedIn-serie** tonen we elke week concrete voortgang. Het mini-ECD (intake → probleemclassificatie → behandelplan) dient als herkenbaar voorbeeld uit de GGZ-sector, maar de boodschap is universeel: **custom software is nu voor iedereen betaalbaar en snel leverbaar**.

**Secundair doel:** Positioneren van ikbenlit.nl als expert in Software on Demand en AI-gedreven development.

---

## 2. Doelgroep

**Primaire doelgroep (LinkedIn Build Serie):**
* **Ondernemers & MKB** → bewijzen dat custom software betaalbaar is
* **IT-managers & CTO's** → alternatief voor dure development teams
* **Startup founders** → snel MVP bouwen zonder €100k+ investment
* **Developers** → leren hoe AI-tooling development versnelt

**Secundaire doelgroep (EPD use case):**
* **GGZ-professionals** → herkenbaar voorbeeld, potentiële early adopters
* **Consultants** → inzicht in mogelijkheden voor hun klanten

**Tertaire doelgroep:**
* **Investeerders** → tonen van nieuwe development economics
* **Potentiële klanten ikbenlit.nl** → Software on Demand consultancy

---

## 3. Kernfunctionaliteiten (MVP)

### 3.1 EPD Core Features

1. **Cliënt inschrijven**
   * Velden: Voornaam, Achternaam, Geboortedatum.
   * Automatische ClientID.
   * Verschijnt in Cliëntenlijst.

2. **Overzicht (Cliëntdashboard)**
   * Tegels:
     * Basisgegevens: ClientID, Naam, Geboortedatum.
     * Intake: verkorte weergave laatste intakeverslag.
     * Probleemprofiel: DSM-light categorie + severity-badge.
     * Behandelplan: doelen in bullets + status.
     * Afspraken: laatste afspraak + eerstvolgende 3 afspraken.
   * Configuratie: gebruiker kan via een instellingen-knop kiezen welke tegels zichtbaar zijn.

3. **Intake-verslag maken**
   * Rich text editor (TipTap).
   * Tags: Intake / Evaluatie / Plan.
   * Opslaan & koppelen aan cliënt.

4. **Probleemprofiel (DSM-light simulatie)**
   * Dropdown categorieën (simulatie DSM-5 hoofdcategorieën):
     * Stemming / Depressieve klachten
     * Angststoornissen
     * Gedrags- en impulsstoornissen
     * Middelengebruik / Verslaving
     * Cognitieve stoornissen
     * Context / Psychosociaal
   * Severity: Laag / Middel / Hoog.
   * Vrij veld: opmerkingen.
   * **AI-suggestie:** intake analyseren → voorstel categorie + severity.

5. **AI-ondersteuning bij verslag**
   * Knoppen:
     * *Samenvatten* (in bullets).
     * *Verbeter leesbaarheid* (B1-niveau).
     * *Extract problemen* (AI vult categorie/severity suggestie in).

6. **AI-voorstel behandelplan**
   * Genereert secties: Doelen, Interventies, Frequentie/Duur, Meetmomenten.
   * Gebruiker kan bewerken of accepteren.

7. **Mini-agenda (optioneel, stretch)**
   * Afspraak plannen gekoppeld aan cliënt.

8. **Rapport export (stretch)**
   * PDF: cliëntgegevens + intake + probleemprofiel + behandelplan.

### 3.2 Onboarding & UX Guidance (NIEUW)

**Doel:** Onderscheiden van legacy EPD's met slechte onboarding door slimme, context-aware begeleiding.

1. **Eenmalige Walkthrough**
   * Start automatisch bij eerste login
   * Skipbaar + opnieuw starten via user menu
   * Stappen (3 minuten totaal):
     1. Welkom + AI-waarde uitleg (15 sec)
     2. Cliënt aanmaken (live demo, 45 sec)
     3. Intake schrijven + AI samenvatten (60 sec)
     4. Dashboard tonen (30 sec)
     5. "Je bent klaar!" + link naar docs

2. **Context-aware Tooltips**
   * Verschijnen automatisch bij eerste gebruik van complexe features
   * Dismissable met "Toon niet meer" optie
   * Voorbeelden:
     * Eerste keer AI-knop → "AI kan je intake samenvatten in 5 seconden"
     * Eerste keer DSM-dropdown → "Laat AI een suggestie doen op basis van intake"
     * Eerste keer publiceren → "Dit maakt het plan definitief en verhoogt versienummer"

3. **Help-iconen op vaste plekken**
   * Klein (?) icoontje naast complexe features
   * Hover = korte tooltip, klik = uitgebreidere uitleg
   * Locaties:
     * DSM-light categorieën uitleg
     * SMART doelen criteria
     * Severity-bepaling richtlijnen
     * AI-features (waarom/wanneer gebruiken)

**Technische basis:**
* State tracking in localStorage: `{ onboardingCompleted: boolean, tooltipsSeen: string[] }`
* Centraal config bestand voor alle guidance content
* Herbruikbare componenten: `<OnboardingProvider>`, `<Tooltip id="">`, `<HelpIcon topic="">`
* Library: react-joyride voor walkthrough

**Voordelen voor demo:**
* Direct contrast met "200-pagina PDF handleiding" van legacy systemen
* Zichtbaar verschil in gebruikerservaring
* Laat zien hoe moderne UX werkt

### 3.3 Marketing Website (Build in Public Hub)

**Doel:** Centrale hub voor LinkedIn Build Serie + lead generation voor Software on Demand consultancy.

**Structuur binnen zelfde Next.js app:**

1. **Landing Page** (`/`)
   * **Hero Section:**
     - "Software on Demand: Van idee naar werkend product in weken, niet maanden"
     - Live counter: "Week X van 4 | Y uur development | €Z kosten"
     - Comparison table: "Traditioneel vs. Software on Demand"
   
   * **The Problem:**
     - Enterprise software: €100k+ budgets, 2 jaar implementatie
     - Vendor lock-in, rigide roadmaps, verouderde tech stacks
     - Kleine bedrijven kunnen custom software niet betalen
   
   * **The Solution:**
     - AI-assisted development: 10x sneller, 95% goedkoper
     - One-developer teams met AI tools = enterprise quality
     - Pay-as-you-grow: €50/mnd start, scale when needed
   
   * **Live Proof (EPD Example):**
     - "Zie hoe we een €100k EPD bouwen voor €50/mnd"
     - Real-time progress updates
     - Transparante cost tracking
   
   * **Stack Showcase:**
     - Next.js + Claude AI + Supabase = modern foundation
     - "Same tools big tech uses, now for small business"
   
   * **CTA's:**
     - Primary: "Volg de build op LinkedIn"
     - Secondary: "Bespreek jouw Software on Demand project"
     - Tertiary: "Probeer live demo"

2. **Build Log** (`/build-log`)
   * **Week-by-week breakdown:**
     - Week 1: "Foundation - 8 uur, €0 kosten"
     - Week 2: "AI Integration - 12 uur, €25 API kosten"
     - Week 3: "Core Features - 15 uur, €35 API kosten"
     - Week 4: "Polish & Launch - 10 uur, €15 kosten"
   
   * **Per entry:**
     - What we built (features delivered)
     - How we built it (tools, AI prompts, decisions)
     - Time spent vs. traditional estimate
     - Code snippets (educational value)
     - Challenges & solutions (authenticity)
     - LinkedIn post embedded
   
   * **Running totals:**
     - Total development hours
     - Total costs (infrastructure + AI)
     - Features completed
     - Traditional estimate comparison

3. **Live Demo** (`/demo`)
   * "Try it yourself" pitch
   * Demo credentials (read-only access)
   * Video walkthrough (2 min)
   * Feature comparison with enterprise EPD's
   * "This took 4 weeks. Traditional build: 24 months"

4. **Software on Demand Explained** (`/how-it-works`)
   * What is Software on Demand
   * When it makes sense (vs. SaaS, vs. traditional custom)
   * Pricing model transparency
   * Case study: EPD build breakdown
   * ROI calculator (interactive)

5. **Request Your Build** (`/contact`)
   * Lead capture form
   * "Describe your software need in 3 sentences"
   * Estimated timeline + cost preview
   * Calendar booking for intake call
   * Trust signals: LinkedIn recommendations, previous builds

**Content Strategy:**
* Wekelijkse LinkedIn post → immediate blog entry
* Radical transparency: share costs, time, failures
* Educational focus: teach while you build
* Open-source key components (drive traffic + credibility)

**Conversion Funnel:**
```
LinkedIn Post → Landing Page → Build Log → "Request Your Build"
                            ↓
                     Live Demo → Conviction → Contact
```

**Metrics Tracking:**
- Visitor source (LinkedIn, organic, direct)
- Time on build-log pages
- Demo usage (how many try it)
- Form submissions
- LinkedIn follower growth correlation

---

## 4. Build & Demo Flows

**Wekelijkse LinkedIn Build Flow:**

**Week 1: Foundation & First Intake**
1. Setup Next.js + Supabase + Claude API
2. Database schema + eerste cliënt aanmaken
3. Intake editor met TipTap werkend
4. **LinkedIn post:** "Van 0 naar werkende intake in 8 uur"

**Week 2: AI Integration**
1. AI samenvatting implementeren
2. Probleem extractie met source highlighting
3. DSM-light classificatie
4. **LinkedIn post:** "AI genereert samenvatting in 3 seconden vs. 30 minuten handmatig"

**Week 3: Treatment Planning**
1. Behandelplan generatie
2. SMART doelen formulering
3. Versioning & publicatie flow
4. **LinkedIn post:** "Complete behandelplan in 10 minuten vs. 2 uur traditioneel"

**Week 4: Polish & Launch**
1. Onboarding system
2. Dashboard met configureerbare tegels
3. Performance optimalisatie
4. **LinkedIn post:** "Van idee naar werkend product: 4 weken, €200 totaal"

**Live Demo Flow (voor geïnteresseerden):**
1. Login met demo credentials
2. Onboarding walkthrough (3 min)
3. Nieuwe cliënt → Intake → AI samenvatten (2 min)
4. Probleemprofiel met AI-suggestie (2 min)
5. Behandelplan genereren & publiceren (2 min)
6. Dashboard tonen met alle data (1 min)
**Totaal: 10 minuten hands-on**

---

## 5. Niet in scope

*   Autorisaties en rollenbeheer (demo auth only).
*   Externe koppelingen (Teams, TOPdesk, etc.).
*   Volledige DSM-5 implementatie (alleen simulatie).
*   Dit prototype is geen gevalideerd medisch hulpmiddel en dient enkel voor demonstratiedoeleinden.
*   Marketing website SEO optimalisatie (fase 1).
*   Analytics/tracking op marketing site (tenzij simpel via Vercel Analytics).

---

## 6. Technische randvoorwaarden

* **Framework:** Next.js (App Router) - single repo voor marketing + EPD
* **Styling:** Tailwind CSS
* **Database:** Supabase (PostgreSQL)
* **AI:** Claude AI (Anthropic)
* **Hosting:** Vercel (EU region)
* **Onboarding:** react-joyride + custom tooltip system
* **Marketing:** Dezelfde Next.js app, `/marketing` routes

**Routing structuur:**
```
/app
  /(marketing)
    /page.tsx              → Landing
    /build-log/page.tsx    → Timeline
    /demo/page.tsx         → Demo info
  /(app)
    /clients/...           → Protected EPD
```

---

## 7. Succescriteria

**Bewijs van Software on Demand concept:**
* ✅ Werkend EPD gebouwd in max 4 weken part-time (80-120 uur totaal)
* ✅ Totale kosten ≤ €200 (infrastructure + AI API)
* ✅ Maandelijkse run-kosten ≤ €50
* ✅ Feature-pariteit met basis EPD flow (intake → plan)
* ✅ Performance vergelijkbaar met enterprise EPD's (<3s loads, <5s AI)

**LinkedIn Build Serie impact:**
* 🎯 Minimaal 250 LinkedIn volgers gedurende build
* 🎯 Gemiddeld 100+ likes per wekelijkse post
* 🎯 Minimaal 10 comments/post met inhoudelijke vragen
* 🎯 5+ shares per post (viral potential)
* 🎯 3+ media vermeldingen of podcast invites

**Business impact (ikbenlit.nl):**
* 💰 Minimaal 10 leads voor Software on Demand consultancy
* 💰 2+ contracten binnen 2 maanden na launch
* 💰 Case study gebruikt in minimaal 3 pitches
* 💰 Landing page conversie >5% (visitor → lead)

**Technische kwaliteit:**
* ⚙️ 0 critical bugs tijdens live demo's
* ⚙️ >80% code coverage op business logic
* ⚙️ Lighthouse score >90 op marketing site
* ⚙️ Mobile responsive op alle schermen
* ⚙️ WCAG AA toegankelijkheid

**Proof points voor messaging:**
* 📊 "X% sneller dan traditionele development"
* 📊 "Y% goedkoper dan enterprise EPD"
* 📊 "Z uur totale development tijd vs. W maanden traditioneel"
* 📊 "Maandelijkse kosten €50 vs. €X.000 enterprise licentie"

---

## 8. Risico's

**Build & Technical:**
* **Scope creep:** Blijf bij MVP features, geen "nice to have" tijdens 4 weken
* **AI-output inconsistent:** Prompt versioning + fallback strategies
* **Time underestimation:** Buffer 20% extra voor onverwachte issues
* **Claude API costs exceed budget:** Implement caching + rate limiting

**Marketing & Messaging:**
* **LinkedIn engagement laag:** Backup content strategie, paid promotion indien nodig
* **Verkeerde doelgroep bereikt:** A/B test messaging, refine targeting
* **Sceptici: "AI code is slechte code":** Show test coverage, performance metrics, live demo
* **Traditional developers defensive:** Frame als evolution, not replacement

**Business Impact:**
* **Geen leads binnen 2 weken:** Adjust CTA's, offer free consultation
* **Leads maar geen conversies:** Re-evaluate pricing/positioning
* **Concurrent bouwt sneller/goedkoper:** Emphasize quality + domain expertise

**Privacy & Compliance:**
* **Fictieve data lijkt te echt:** Disclaimer op elke pagina, obvious fake names
* **GDPR issues met LinkedIn tracking:** Comply with cookie consent, minimal tracking

**Mitigatie:**
- Weekly retrospective: wat werkt, wat niet
- Transparent over setbacks in build-log (authenticity)
- Pre-written backup posts if week goes badly
- Video demo backup if live demo fails

---

## 9. Roadmap (post-demo)

**EPD uitbreidingen:**
* Autorisaties en auditlog.
* Trendanalyse (stemming/voortgang).
* Integratie met PinkRoccade modules.
* Compliance en security uitbreiden.

**Marketing site:**
* SEO optimalisatie voor zoekwoorden
* Lead magnet (gratis "AI in Healthcare" whitepaper)
* Case study pagina met ROI berekening
* Video testimonials van demo deelnemers
* Newsletter signup voor wekelijkse updates

**LinkedIn serie vervolg:**
* Post-launch: "Wat we leerden" reflectie
* Cost breakdown transparantie
* Open-source delen van componenten
* Follow-up serie: "Van prototype naar productie"

---

## 10. Meetbare doelen

| Categorie | Metric | Target | Meetmoment |
|-----------|--------|--------|------------|
| **Build Efficiency** | Total development hours | ≤120h (part-time 4 wks) | Week 4 |
| **Build Efficiency** | Cost per feature | <€50/feature | Week 4 |
| **Build Efficiency** | Traditional estimate | >500h (proof of 4x speed) | Week 4 |
| **Cost Proof** | Total build cost | ≤€200 | Week 4 |
| **Cost Proof** | Monthly run cost | ≤€50 | Month 1-3 |
| **Cost Proof** | Cost vs enterprise EPD | >99% cheaper | Week 4 |
| **LinkedIn Impact** | Followers gained | 250+ | Week 4 |
| **LinkedIn Impact** | Avg post engagement | 100+ likes, 10+ comments | Per week |
| **LinkedIn Impact** | Share rate | 5+ shares/post | Per week |
| **LinkedIn Impact** | Profile views | 500+/week | Week 2-4 |
| **Lead Generation** | Software on Demand inquiries | 10+ | Within 2 weeks post-launch |
| **Lead Generation** | Qualified leads | 5+ | Within 4 weeks |
| **Lead Generation** | Conversion to contract | 2+ | Within 8 weeks |
| **Lead Generation** | Landing page conversion | >5% | Continuous |
| **Technical Quality** | Lighthouse performance | >90 | Week 4 |
| **Technical Quality** | Code coverage | >80% business logic | Week 4 |
| **Technical Quality** | Critical bugs | 0 | Week 4 |
| **Technical Quality** | API response time | <5s (AI), <1s (CRUD) | Week 4 |
| **Proof Validation** | Live demo success rate | >95% | Post-launch |
| **Proof Validation** | User onboarding completion | >70% | Month 1 |
| **Media Attention** | Podcast/interview invites | 3+ | Within 8 weeks |
| **Media Attention** | Blog/article mentions | 5+ | Within 12 weeks |

---

## 11. Stakeholders & Communicatie

| Stakeholder | Interesse | Communicatie | Priority |
|-------------|-----------|--------------|----------|
| **LinkedIn netwerk** | Software on Demand proof | Wekelijkse posts + live updates | Critical |
| **Potentiële klanten** | Custom software affordability | Landing page + demo + case study | Critical |
| **ikbenlit.nl prospects** | AI consultancy services | Website + LinkedIn + sales funnel | High |
| **Developers** | AI-assisted development learning | Build-log technical details + code snippets | Medium |
| **GGZ professionals** | EPD use case validation | Optional feedback, niet primary focus | Low |
| **Media/Podcasts** | Thought leadership | Press kit + interview availability | Medium |
| **Traditional dev agencies** | Market disruption awareness | Indirect via content, not confrontational | Low |

---

## Wijzigingslog

| Versie | Datum | Wijzigingen |
|--------|-------|-------------|
| 1.0 | aug 2025 | Initiële versie MVP |
| 1.1 | aug 2025 | DSM-light simulatie toegevoegd |
| 1.2 | nov 2025 | Onboarding system + Marketing website geïntegreerd, LinkedIn Build Serie strategie toegevoegd |
