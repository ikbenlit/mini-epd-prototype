# 📄 Product Requirements Document (PRD) — Agenda Module

**Projectnaam:** Mini-EPD Agenda Module  
**Versie:** v1.0  
**Datum:** 02-12-2024  
**Auteur:** Colin

---

## 1. Doelstelling

🎯 **Doel van deze sectie:** Beschrijf waarom dit product of prototype wordt gebouwd en wat het beoogde resultaat is.

### Waarom deze module?

De agenda is het **kloppend hart** van elk EPD-systeem. Zonder agenda geen structuur, geen overzicht, geen efficiënte praktijkvoering. Voor het AI Speedrun project is de agenda module cruciaal omdat het:

1. **De workflow compleet maakt**: Intake → Behandelplan → Afspraken → Verslaglegging → Herhaal
2. **Dagelijks gebruik afdwingt**: Een EPD zonder agenda wordt niet gebruikt, want behandelaars hebben dit elke dag nodig
3. **AI-integratie natuurlijk maakt**: Afspraak → AI-verslag in 1 klik, naadloos in de dagelijkse workflow
4. **Geloofwaardigheid toevoegt**: "Zonder agenda is het geen echt EPD" — dit maakt het prototype serieus

### Wat willen we bereiken?

Een **werkende agenda module** die behandelaars:
- Laat plannen, verzetten en annuleren van afspraken
- Koppelt aan patiëntendossiers én verslagen (bidirectioneel)
- Waarschuwt bij dubbele boekingen (maar niet blokkeert — flexibiliteit!)
- Integreert met bestaande intake/rapportage flows

**Type oplevering:** MVP voor AI Speedrun demo + basis voor productieversie

**Kernboodschap voor demo:**
> "Dit is geen speeltje — dit is een werkend EPD waar je morgen mee aan de slag kunt. Hier is mijn agenda voor deze week, klik, nieuwe afspraak, patient selecteren, opslaan. En nu direct een verslag maken. Dat is AI in de praktijk."

---

## 2. Doelgroep

🎯 **Doel:** Schets wie de eindgebruikers, stakeholders en testers zijn.

### Primaire gebruikers (direct)

**1. Behandelaars in de GGZ**
- **Behoefte:** Overzicht van hun dag/week, snel afspraken plannen, direct verslagen kunnen maken
- **Pijnpunten met huidige systemen:** 
  - Te veel klikken om een afspraak te maken
  - Geen koppeling tussen afspraak en verslag
  - Geen waarschuwing bij dubbele boekingen
  - Slow and clunky interfaces
- **Wat ze willen zien:** "Kan ik hier echt mijn praktijk mee runnen?"

**2. Praktijkassistenten / Secretaresses**
- **Behoefte:** Afspraken inplannen voor behandelaars, overzicht van beschikbaarheid
- **Pijnpunten:** Veel telefoontjes, handmatige planning, geen real-time updates
- **Opmerking:** Dit is stretch voor MVP — focus ligt op single-user (behandelaar)

### Secundaire stakeholders (indirect)

**3. Zorgmanagers / Praktijkhouders**
- **Interesse:** Kan dit hun praktijk efficiënter maken?
- **Vraag:** "Hoeveel kost dit vs. PinkRoccade/Nedap?"
- **Demo-moment:** Laten zien hoe snel afspraken worden ingepland vs. legacy systemen

**4. Developers / Tech Managers**
- **Interesse:** Hoe is dit gebouwd? Wat kan AI echt?
- **Vraag:** "Hoeveel werk is dit geweest? Kan ons team dit ook?"
- **Demo-moment:** Transparantie over buildtime, tech stack, AI-gebruik

**5. Potentiële klanten (via LinkedIn)**
- **Interesse:** Proof of concept dat "Software on Demand" werkt
- **Vraag:** "Is dit echt in 4 weken gebouwd?"
- **Demo-moment:** Build metrics, transparante timeline

### Persona's

**Persona 1: Marieke (Psycholoog, 38 jaar)**
- Zelfstandig gevestigd, 3 dagen per week cliënten
- Gebruikt nu Google Agenda + Word voor verslagen
- Frustratie: "Ik moet alles dubbel invoeren en kan niks terugvinden"
- Wens: "Gewoon een simpel systeem waar alles bij elkaar staat"

**Persona 2: Bas (Psychiater, 52 jaar)**
- Werkt in instelling met Nedap ECD
- Frustratie: "Het kost me 5 minuten om een afspraak te maken, en dan crasht het nog"
- Wens: "Iets wat gewoon werkt, zoals Outlook maar dan met verslagen"

---

## 3. Kernfunctionaliteiten (MVP-scope)

🎯 **Doel:** Afbakenen van de minimale werkende functies.

### Must-Have (MVP)

1. **Kalenderweergave**
   - **Input:** Datum selectie
   - **Output:** Dag/Week/Werkdagen view met afspraken
   - **Interactie:** Klikken op tijdslot = nieuwe afspraak, klikken op afspraak = details
   - **Demo-waarde:** "Dit is mijn agenda, net als Outlook"

2. **Afspraak maken**
   - **Input:** Patient, datum/tijd, type afspraak (intake/behandeling/follow-up)
   - **Output:** Nieuwe afspraak in kalender
   - **Interactie:** Modal form, patient zoeken, tijd kiezen
   - **Demo-waarde:** "Kijk hoe snel dit gaat — patient zoeken, tijd kiezen, klaar"

3. **Dubbele boeking waarschuwing**
   - **Input:** Overlappende tijden voor zelfde behandelaar
   - **Output:** Warning met overzicht bestaande afspraken + optie om toch in te plannen
   - **Interactie:** Dialog met "Wijzigen" of "Toch inplannen" knoppen
   - **Demo-waarde:** "Het systeem waarschuwt me, maar ik kan het overrulen — flexibiliteit!"

4. **Afspraak verzetten & annuleren**
   - **Input:** Drag-drop (desktop) of Edit button (mobile)
   - **Output:** Gewijzigde tijd of status 'cancelled'
   - **Interactie:** Confirm dialog bij grote wijzigingen
   - **Demo-waarde:** "Even snel een afspraak verzetten, done"

5. **Patient koppeling**
   - **Input:** Patient search (naam/BSN)
   - **Output:** Patient geselecteerd, afspraak gekoppeld
   - **Interactie:** Autocomplete search in modal
   - **Demo-waarde:** "Alle patiëntgegevens direct beschikbaar"

6. **Afspraak ↔ Verslag koppeling (bidirectioneel)**
   - **Input:** "Maak verslag" button in afspraak detail
   - **Output:** Verslag editor met afspraak pre-filled
   - **Interactie:** Click-through tussen afspraak en verslag
   - **Demo-waarde:** **"DIT is waar AI echt helpt — afspraak gehad, 1 klik, verslag maken"**

### Nice-to-Have (Stretch voor MVP)

7. **(Stretch) Recent patients dropdown**
   - Laatste 5 patiënten snel selecteren
   - Demo-waarde: Extra snelheid voor repeat gebruikers

8. **(Stretch) Color coding per type**
   - Intake = blauw, Behandeling = groen, etc.
   - Demo-waarde: Visueel overzicht

9. **(Stretch) Mini calendar sidebar**
   - Maandoverzicht met navigatie
   - Demo-waarde: Extra polish, maar niet essentieel

### Expliciet NIET in MVP

- ❌ Recurring appointments (herhaling)
- ❌ Multi-practitioner view (agenda's van meerdere behandelaars)
- ❌ Email/SMS notificaties naar patiënten
- ❌ Patient portal (patiënten zelf afspraken maken)
- ❌ Wachtlijstbeheer
- ❌ Video call integratie

---

## 4. Gebruikersflows (Demo- of MVP-flows)

🎯 **Doel:** Laten zien hoe de gebruiker stap-voor-stap door het systeem gaat.

### Flow 1: Nieuwe afspraak maken (Snelste pad)

**Scenario:** Behandelaar krijgt patient aan de telefoon, wil snel afspraak inplannen

1. **Start:** Behandelaar kijkt naar agenda (week view)
2. **Actie:** Klikt op lege tijdslot (bijv. donderdag 14:00)
3. **Systeem:** Modal opent met pre-filled datum/tijd
4. **Actie:** Typt patient naam in zoekbalk: "Jan de"
5. **Systeem:** Autocomplete toont "Jan de Vries (12-03-1985)"
6. **Actie:** Selecteert patient, kiest type "Behandeling", klikt "Opslaan"
7. **Systeem:** Afspraak verschijnt in kalender
8. **Resultaat:** Afspraak ingepland in ~10 seconden

**Demo-tijd:** 15 seconden (met uitleg: 30 sec)

### Flow 2: Afspraak maken met dubbele boeking

**Scenario:** Behandelaar vergist zich, wil afspraak maken op al bezet tijdslot

1. **Start:** Behandelaar klikt op tijdslot 14:00 (al bezet met andere patient)
2. **Systeem:** Modal opent, behandelaar vult patient "Maria Jansen" in
3. **Actie:** Klikt "Opslaan"
4. **Systeem:** ⚠️ Warning toont: "Let op: dubbele boeking — Je hebt al een afspraak: Jan de Vries - 14:00 (Intake)"
5. **Beslismoment:** Behandelaar ziet twee opties:
   - "Wijzigen" → terug naar form, andere tijd kiezen
   - "Toch inplannen" → override, beide afspraken staan er
6. **Actie:** Klikt "Wijzigen", kiest 15:00
7. **Systeem:** Geen warning, afspraak wordt opgeslagen
8. **Resultaat:** Conflict voorkomen, afspraak correct ingepland

**Demo-tijd:** 30 seconden (laat zien: systeem helpt je, maar dwingt niet af)

### Flow 3: Afspraak → Verslag (De AI-kracht)

**Scenario:** Behandelaar heeft zojuist intake gehad, wil direct verslag maken

1. **Start:** Behandelaar klikt op afspraak in kalender (net geweest: 10:00-11:00)
2. **Systeem:** Afspraak detail popup toont:
   - Patient: Jan de Vries
   - Type: Intakegesprek
   - Notities: [leeg of korte aantekeningen]
   - **Button: "📝 Maak verslag"**
3. **Actie:** Klikt "Maak verslag"
4. **Systeem:** Navigeert naar Rapportage module met:
   - Patient pre-filled: Jan de Vries
   - Type pre-selected: Intake verslag
   - Afspraak linked: 02-12-2024 10:00
5. **Actie:** Behandelaar gebruikt AI-transcriptie of typt verslag
6. **Systeem:** AI genereert structuur, samenvatting, suggesties
7. **Actie:** Behandelaar bewerkt, klikt "Opslaan"
8. **Systeem:** Verslag opgeslagen + automatisch gekoppeld aan afspraak
9. **Resultaat:** In agenda: afspraak toont nu 📝 icon (verslag aanwezig)

**Demo-tijd:** 45 seconden (zonder verslag schrijven, alleen workflow tonen)

**Demo-impact:** 🔥 **DIT is de killer feature** — naadloze integratie afspraak ↔ verslag ↔ AI

### Flow 4: Afspraak verzetten (Desktop drag-drop)

**Scenario:** Patient belt, kan niet op dinsdag, moet naar woensdag

1. **Start:** Behandelaar ziet afspraak op dinsdag 14:00
2. **Actie:** Klikt en houdt vast op afspraak card
3. **Systeem:** Afspraak wordt "draggable", cursor changes
4. **Actie:** Sleept naar woensdag 15:00 tijdslot
5. **Systeem:** Confirm dialog: "Afspraak verzetten naar wo 03-12 15:00?"
6. **Actie:** Klikt "Ja, verplaatsen"
7. **Systeem:** Afspraak verplaatst, conflict check uitgevoerd (geen warning)
8. **Resultaat:** Afspraak staat nu op woensdag 15:00

**Demo-tijd:** 10 seconden (visual impressive)

---

## 5. Niet in Scope

🎯 **Doel:** Duidelijk maken wat (nog) niet wordt gebouwd.

### Features die NIET in MVP zitten

**1. Multi-user & Rechtenbeheer**
- Geen rollen (admin/behandelaar/assistent)
- Geen gebruikersbeheer (toevoegen/verwijderen users)
- Geen rechten per patient/afspraak
- **Reden:** MVP is single-user demo, complexiteit te hoog voor Speedrun

**2. Patient Portal & Self-Service**
- Patiënten kunnen niet zelf afspraken maken
- Geen patient login
- Geen afspraak bevestigingen/herinneringen via email/SMS
- **Reden:** Focus ligt op behandelaar workflow, patient side is apart product

**3. Advanced Scheduling**
- Geen recurring appointments (wekelijks, maandelijks)
- Geen wachtlijstbeheer
- Geen automatische slot-filling
- Geen "find first available" functie
- **Reden:** Te complex voor MVP, weinig demo-waarde

**4. External Integrations**
- Geen Google Calendar sync
- Geen Outlook sync
- Geen Teams integratie
- Geen iCal export
- **Reden:** Integraties vragen maanden werk, geen core functionaliteit

**5. Advanced Analytics**
- Geen no-show tracking
- Geen bezettingsgraad dashboard
- Geen revenue/billing integratie
- **Reden:** Dit is post-MVP "nice to have"

**6. Video Call Features**
- Geen ingebouwde video calling
- Geen Zoom/Teams meeting links automatisch genereren
- **Reden:** Complex, weinig meerwaarde voor demo

**7. Production-Grade Features**
- Geen audit logging (wie heeft wat gewijzigd)
- Geen versioning van afspraken
- Geen backup/restore functionaliteit
- Geen advanced error recovery
- **Reden:** MVP is demo, niet productie-ready

### Waarom deze keuzes?

**Principe:** Focus op **snelheid** en **demo-impact**, niet op completeness.

De agenda module moet:
✅ Werken voor 1 behandelaar  
✅ Integreren met bestaande intake/rapportage flows  
✅ Laten zien dat AI naadloos past in dagelijkse workflow  
✅ Indruk maken: "Dit is geen speeltje, dit werkt écht"

**Niet:**
❌ Alle edge cases afvangen  
❌ Multi-tenant ready zijn  
❌ Productie-grade security/performance  
❌ Feature parity met legacy systemen

---

## 6. Succescriteria

🎯 **Doel:** Objectieve meetlat voor een geslaagde oplevering.

### Demo Succescriteria

**1. Demo Flow Compleetheid**
- [ ] Volledige flow 1-4 werkend zonder bugs
- [ ] Demo kan in **< 5 minuten** worden gedaan (inclusief uitleg)
- [ ] Geen "let's pretend" moments — alles werkt écht
- [ ] Mobile view werkt (backup als desktop faalt)

**2. AI Integratie Showcase**
- [ ] Afspraak → Verslag flow werkt in **< 3 clicks**
- [ ] AI-generated content zichtbaar in verslag
- [ ] Bidirectionele link werkt (afspraak ↔ verslag beide kanten)

**3. Gebruikerservaring**
- [ ] Conflict warning toont correcte info (patient naam, tijd)
- [ ] Patient search werkt met **< 500ms response time**
- [ ] Drag-drop feels responsive (< 100ms visual feedback)
- [ ] Geen UI glitches op demo tijdstip

**4. Technische Stabiliteit**
- [ ] Geen crashes tijdens demo flow
- [ ] Database queries < 2 seconden
- [ ] Timezone handling correct (NL-tijd in UI, UTC in DB)

### LinkedIn Content Succescriteria

**5. Viral Potential**
- [ ] Screenshot-worthy moments (bijv. conflict warning, AI-verslag)
- [ ] "Build in public" metrics: X story points, Y hours, €Z kosten
- [ ] Quote-worthy moment: "4 weken, €50/maand, volledig werkend EPD"

**6. Geloofwaardigheid**
- [ ] Live demo URL werkt (vercel deployment)
- [ ] Code op GitHub (public repo)
- [ ] Geen fake data in screenshots (echte-looking test data)

### Post-Demo Validatie

**7. User Feedback**
- [ ] Minimaal 1 zorgprofessional test het live
- [ ] Feedback verzameld: "Zou je dit gebruiken?"
- [ ] Top 3 missing features geïdentificeerd

**8. Technical Learnings**
- [ ] AI prompt quality documented (wat werkte, wat niet)
- [ ] Performance bottlenecks geïdentificeerd
- [ ] Timezone edge cases getest (zomertijd transitie)

### Kwantitatieve Metrics

| Metric | Target | Stretch |
|--------|--------|---------|
| **Demo tijd** | < 5 min | < 3 min |
| **Page load tijd** | < 2s | < 1s |
| **Afspraak maken** | < 10 sec | < 5 sec |
| **Patient search response** | < 500ms | < 200ms |
| **LinkedIn impressions** | 5,000 | 10,000 |
| **Engagement rate** | 2% | 5% |
| **Inbound leads** | 2 | 5 |

---

## 7. Risico's & Mitigatie

🎯 **Doel:** Risico's vroeg signaleren en plannen hoe ermee om te gaan.

### Technische Risico's

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| **FullCalendar styling conflicts** | Middel | Middel | Prototype early (week 1), CSS isolation strategy, fallback naar simpeler calendar |
| **Timezone bugs** | Middel | Hoog | Test zomertijd transitie (29 maart), gebruik date-fns-tz, TIMESTAMPTZ in DB |
| **Performance bij veel afspraken** | Laag | Middel | Query optimization met indices, date range filtering, pagination if needed |
| **Drag-drop mobile UX** | Hoog | Laag | Accept limitation: desktop-only drag, mobile uses Edit button |
| **Conflict detection edge cases** | Middel | Middel | Document assumptions, test concurrent edits, graceful degradation |

### Scope & Planning Risico's

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| **Scope creep** | Hoog | Hoog | **Hard blocker:** PRD is frozen. Extra features → post-MVP backlog |
| **Underestimated complexity** | Middel | Hoog | Buffer 20% op story points, drop stretch features first |
| **Demo prep time onderschat** | Middel | Middel | Test demo flow 2 dagen voor launch, record backup video |
| **Integration breaking changes** | Laag | Hoog | Freeze intake/rapportage modules week voor agenda start |

### Demo & Marketing Risico's

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| **Live demo fails** | Middel | Hoog | Pre-record video backup, test deployment morning-of, have fallback slides |
| **LinkedIn post flops** | Middel | Middel | A/B test headlines, post at optimal time (dinsdag 9:00), engage in comments |
| **Negative feedback** | Laag | Middel | Respond professionally, use as learning, "building in public = warts and all" |
| **Competitor copies idea** | Laag | Laag | Accept risk, speed-to-market is advantage, open source = marketing |

### Data & Privacy Risico's

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| **Demo data looks fake** | Middel | Middel | Use realistic names/dates, Nederlandse context, avoid "Test User 1" |
| **Accidentally expose PII** | Laag | Hoog | **Only use fake data**, sanitize screenshots, no real BSN/medical info |
| **GDPR concerns** | Laag | Middel | Demo data only, privacy policy placeholder, mention "demo purposes" |

### Mitigation Strategies

**1. Technical Blockers (FullCalendar, Timezone)**
- **Week 1 Action:** Spike FullCalendar integration, confirm it works
- **Fallback:** If FullCalendar too complex → simple custom grid view (bare minimum)
- **Test Plan:** Timezone edge case tests (E5.S3) before launch

**2. Scope Management**
- **Weekly Check:** "Are we building MVP or nice-to-have?"
- **Decision Rule:** "Does this feature appear in demo flow? No → backlog"
- **Communication:** Update Mission Control daily with scope decisions

**3. Demo Insurance**
- **T-2 days:** Full dry-run with fresh browser
- **T-1 day:** Record backup video (Plan B)
- **Demo day:** Local fallback if Vercel down, screenshots ready

**4. Marketing Hedge**
- **Content Calendar:** 3 LinkedIn posts drafted in advance
- **Engagement Plan:** Reply to every comment within 1 hour
- **Narrative Pivot:** If build too fast → "How I did it", if too slow → "Lessons learned"

---

## 8. Roadmap / Vervolg (Post-MVP)

🎯 **Doel:** Richting geven aan toekomstige uitbreidingen.

### Fase 1: MVP Launch (Week 1-2 van Agenda Build)
- ✅ Basic calendar views (dag/week/werkdagen)
- ✅ Afspraak CRUD (make, edit, cancel)
- ✅ Conflict detection met override
- ✅ Afspraak ↔ Verslag koppeling
- ✅ Patient search

**Output:** Demo-ready agenda voor AI Speedrun showcase

---

### Fase 2: Production Readiness (Post-Speedrun, Week +4-8)

**Prioriteit: Hoog** (als klant interesse toont)

1. **Multi-User Support**
   - Rollenbeheer (admin, behandelaar, assistent)
   - User management (toevoegen/verwijderen)
   - Per-user agenda view
   - **Business Value:** Nodig voor praktijken met >1 behandelaar

2. **Security Hardening**
   - Row Level Security (RLS) policies
   - Audit logging (wie deed wat wanneer)
   - Session management
   - **Business Value:** Compliance voor echte zorgdata

3. **Performance Optimization**
   - Query optimization
   - Caching strategie
   - Pagination voor grote datasets
   - **Business Value:** Schaalbaar naar 100+ afspraken/dag

4. **Error Handling & Monitoring**
   - Sentry integratie
   - Graceful degradation
   - Retry mechanisms
   - **Business Value:** Productie-grade stabiliteit

**Effort:** ~3-4 weken (1 FTE)  
**Business Case:** Nodig voor betalende klanten

---

### Fase 3: Feature Parity (Month 3-4)

**Prioriteit: Middel** (nice-to-have, niet blocker)

1. **Advanced Scheduling**
   - Recurring appointments (wekelijks/maandelijks)
   - Wachtlijstbeheer
   - "Find first available" slot
   - **Business Value:** Efficiency boost voor drukke praktijken

2. **Patient Communications**
   - Email herinneringen (24u voor afspraak)
   - SMS notificaties (optioneel)
   - Cancellation confirmations
   - **Business Value:** Reduce no-shows (vaak 10-20% in GGZ)

3. **Multi-Practitioner View**
   - Agenda van meerdere behandelaars naast elkaar
   - Resource allocation (kamers, apparatuur)
   - Team scheduling
   - **Business Value:** Voor grotere praktijken/instellingen

4. **Reporting & Analytics**
   - Bezettingsgraad dashboard
   - No-show tracking
   - Revenue per practitioner (indien billing)
   - **Business Value:** Management insights

**Effort:** ~4-6 weken (1 FTE)  
**Business Case:** Upsell opportunity, premium features

---

### Fase 4: Ecosystem Integration (Month 5-6)

**Prioriteit: Laag** (tenzij strategische partnerships)

1. **Calendar Sync**
   - Google Calendar sync (two-way)
   - Outlook sync
   - iCal export
   - **Business Value:** Reduce double-entry, increase adoption

2. **Video Call Integration**
   - Zoom meeting auto-generation
   - Teams meeting links
   - In-browser video (WebRTC)
   - **Business Value:** COVID-era feature, online consulten

3. **External System Integration**
   - PinkRoccade koppeling (indien klant vraagt)
   - Nedap ECD import/export
   - Zorgdomein connectie
   - **Business Value:** Migration path van legacy systemen

**Effort:** ~6-12 weken (1 FTE)  
**Business Case:** Vereist voor enterprise deals

---

### Fase 5: Patient Self-Service (Month 7-9)

**Prioriteit: Hoog** (maar separate product)

1. **Patient Portal**
   - Inloggen met DigiD
   - Eigen afspraken bekijken
   - Afspraken maken (binnen beschikbare slots)
   - Afspraken annuleren (met policy)
   - **Business Value:** Reduce admin workload, 24/7 booking

2. **Patient Experience**
   - Intake formulieren online invullen
   - Documenten uploaden (verwijsbrieven, etc.)
   - Vragenlijsten invullen (ROM, etc.)
   - **Business Value:** Efficiency, patient empowerment

**Effort:** ~8-12 weken (1 FTE)  
**Business Case:** Dit kan separate SaaS product zijn

---

### Strategic Considerations

**Build vs. Integrate Decision Tree:**

```
Feature request
    │
    ├─ Is it core to EPD?
    │   ├─ Yes → Build it
    │   └─ No → Can we integrate?
    │       ├─ Yes → Use API/webhook
    │       └─ No → Deprioritize
    │
    └─ Does it differentiate us?
        ├─ Yes → Build it (competitive advantage)
        └─ No → Buy/integrate (focus on AI)
```

**Example:**
- Video calling → **Integrate** (Zoom API)
- AI-powered scheduling → **Build** (our secret sauce)
- Billing/invoicing → **Integrate** (Mollie, etc.)
- Treatment plan generation → **Build** (core AI value)

---

### Parking Lot (Ideas, geen commitment)

- AI-powered "optimal scheduling" (ML-based slot recommendations)
- Predictive no-show scoring (AI flags high-risk appointments)
- Voice-controlled agenda ("Schedule Jan de Vries for Thursday 2pm")
- WhatsApp integration for reminders
- Apple Health / Google Fit data import (for lifestyle coaching)
- Group session management (multiple patients per appointment)

**Criteria for moving from Parking Lot → Roadmap:**
1. Customer explicitly asks for it (at least 3 requests)
2. Clear business case (revenue, retention, or viral potential)
3. Feasible effort (< 4 weeks build time)

---

## 9. Bijlagen & Referenties

🎯 **Doel:** Bronnen koppelen voor context en consistentie.

### Interne Documenten

**Strategisch:**
- [AI Speedrun Manifesto](link) — Overall projectvisie
- [Mission Control v1](link) — Project status tracking
- [Build Metrics Tracking](link) — Transparante build log

**Functioneel:**
- FO Mini-EPD v2.0 — Volledige functionele specificatie
- TO Mini-EPD v1.2 — Technische architectuur
- PRD Intake Module v1 — Hoe intake werkt (dependency)
- PRD Rapportage Module v1 — Hoe verslagen werken (integration point)

**Technisch:**
- Bouwplan Agenda Module v1.1 — Gedetailleerde technische implementatie (dit volgt ná PRD approval)
- API Access Mini-ECD — AI integratie documentatie
- Database Schema FHIR GGZ — Data model

**UX/UI:**
- UX Stylesheet — Design system & component library
- Interface Design Plan — Wireframes en user flows
- Mocks UI Flow — Visual designs

### Externe Referenties

**Standards & Compliance:**
- [FHIR R4 Encounter Resource](https://www.hl7.org/fhir/encounter.html) — Healthcare data standard
- [ISO 8601 DateTime](https://en.wikipedia.org/wiki/ISO_8601) — Date/time formatting
- [IANA Time Zones](https://www.iana.org/time-zones) — Timezone database

**Technology:**
- [FullCalendar Documentation](https://fullcalendar.io/docs) — Calendar library we'll use
- [shadcn/ui Components](https://ui.shadcn.com/docs/components) — UI component library
- [Supabase Auth](https://supabase.com/docs/guides/auth) — Authentication
- [date-fns](https://date-fns.org/) — Date manipulation library

**Inspiration & Benchmarks:**
- [Cal.com](https://cal.com) — Open-source scheduling (UI inspiration)
- [Calendly](https://calendly.com) — Modern scheduling UX (simplicity benchmark)
- [Acuity Scheduling](https://acuityscheduling.com) — Healthcare scheduling features
- Google Calendar — De facto standard, users expect this UX

### Competitive Analysis (Legacy GGZ Systems)

**Why we're better:**

| Feature | PinkRoccade | Nedap ECD | Zorgdomein | **Mini-EPD** |
|---------|-------------|-----------|------------|--------------|
| Afspraak maken | 5+ clicks, slow | 4-5 clicks | 6+ clicks | **2-3 clicks** |
| Dubbele boeking | Hard block | Warning | Hard block | **Warning + override** |
| Afspraak ↔ Verslag | Manual link | No link | Manual link | **1-click bidirectioneel** |
| AI-assisted verslag | ❌ | ❌ | ❌ | **✅ Core feature** |
| Mobile UX | Terrible | Desktop-only | Barely works | **Responsive + optimized** |
| Load time | 5-10s | 3-5s | 4-8s | **< 2s** |
| Training tijd | 2-4 dagen | 1-2 dagen | 2-3 dagen | **< 10 minuten** |
| Kosten | €200-400/maand | €150-300/maand | €180-350/maand | **€50/maand** |

**Key Differentiators:**
1. 🚀 **Speed:** Zowel UX als development speed
2. 🤖 **AI Integration:** Naadloos, niet als afterthought
3. 💰 **Price:** 1/4e van legacy systemen
4. 🎯 **Focus:** Alleen wat je nodig hebt, geen bloat

---

### Contact & Feedback

**Product Owner:** Colin  
**Email:** [email]  
**LinkedIn:** [profile]  
**GitHub Repo:** [link to public repo]

**Feedback Welcome:**
- 💬 DM op LinkedIn
- 🐛 GitHub Issues voor bugs
- 💡 Feature requests via Google Form [link]

---

**Document Status:** ✅ Approved  
**Next Step:** → Bouwplan Agenda Module v1.1 (technische uitwerking)

**Changelog:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 02-12-2024 | Colin | Initiële PRD — scope, flows, success criteria gedefinieerd |
