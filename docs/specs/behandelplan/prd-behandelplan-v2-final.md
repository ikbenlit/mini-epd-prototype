# 📄 Product Requirements Document (PRD) — Behandelplan Module

**Projectnaam:** Mini-ECD Prototype - AI Speedrun  
**Versie:** v2.0 (volgens template, incl. Leefgebieden)  
**Datum:** 2 december 2024  
**Auteur:** Colin Lit

**Changelog:**
- v2.0: Herstructurering volgens PRD template, duidelijke MVP/post-MVP scheiding, expliciete UX sectie
- v1.1: Leefgebieden methodiek toegevoegd
- v1.0: Initiële versie

---

## 1. Doelstelling

🎯 **Doel van deze sectie:** Beschrijf waarom dit product of prototype wordt gebouwd en wat het beoogde resultaat is.

### 1.1 Waarom

Huidige EPD-systemen behandelen het behandelplan als een statisch administratief document dat:
- Eenmalig wordt geschreven en zelden wordt geëvalueerd
- Geen duidelijke koppeling heeft met het feitelijke behandelproces
- Voor cliënten ontoegankelijk of onbegrijpelijk is
- Voor behandelaars veel handmatig schrijfwerk kost (30+ minuten)
- Niet helpt bij het structureren van de daadwerkelijke zorg

**Resultaat:** Het behandelplan is een "vinkje voor de administratie" in plaats van een levend werkdocument.

### 1.2 Wat

Een **werkend MVP-behandelplan** dat demonstreert hoe AI:
1. **Tijdsbesparing** realiseert: van 30+ minuten naar 2-5 minuten
2. **Kwaliteitsverbetering** biedt: SMART-doelen, evidence-based interventies, recovery-gericht
3. **Transparantie** creëert: cliënt kan eigen plan begrijpen en volgen
4. **Praktische workflow** ondersteunt: intake → diagnose → behandelplan → sessies → evaluatie

### 1.3 Voor Wie

Dit is een **demo-prototype** voor:
- **AI Speedrun LinkedIn Serie** - Build in public content
- **Product Owners & GGZ Managers** - AI-toegevoegde waarde zien
- **Zorgprofessionals** - Herkenbare workflow met directe meerwaarde
- **Developers** - Inspiratie voor AI-integratie in healthcare

### 1.4 Type Release

**MVP Prototype** - Focus op demo-readiness en core value proposition. Geen productie-systeem.

---

## 2. Doelgroep

🎯 **Doel:** Schets wie de eindgebruikers, stakeholders en testers zijn.

### 2.1 Primaire Gebruikers (voor Demo)

**Behandelaar (GGZ-professional)**
- **Rol:** Psycholoog, psychiater, POH-GGZ, verpleegkundig specialist
- **Behoefte:** Snel behandelplan opstellen zonder kwaliteit in te leveren
- **Pijnpunten:** 
  - Te veel schrijfwerk
  - Moeilijk om SMART-doelen te formuleren
  - Leeg vel syndroom ("waar begin ik?")
  - Veel copy-paste van oude plannen
- **Gebruik in demo:** Primaire gebruiker die hele flow doorloopt

**Cliënt (patiënt/deelnemer)**
- **Rol:** Persoon in GGZ-behandeling
- **Behoefte:** Begrijpen wat er gaat gebeuren, waar we naar toewerken
- **Pijnpunten:**
  - Behandelplan vol vakjargon
  - Onduidelijk wat verwachting is
  - Plan voelt als "van de behandelaar", niet van mij
- **Gebruik in demo:** Cliëntportaal-weergave als laatste stap

### 2.2 Secundaire Stakeholders

**Product Owner / Manager**
- Inzicht in AI als enabler (niet vervanger)
- ROI-berekening: 30 min → 5 min = 83% tijdsbesparing

**Developer / Tech Lead**
- Inspiratie voor AI-integratie patterns
- Ziet hoe AI prompt engineering werkt in praktijk

**LinkedIn Audience**
- Leert van transparant development proces
- Ziet concrete AI-toepassing in healthcare

---

## 3. Kernfunctionaliteiten (MVP-scope)

🎯 **Doel:** Afbakenen van de minimale werkende functies.

### 3.1 MUST HAVE (Week 3 - Core MVP)

#### F-01: AI Behandelplan Generatie
**Input:**
- Intake-notities (vrije tekst uit rich text editor)
- DSM-categorie (uit Diagnose module)
- Severity (Laag/Middel/Hoog)
- Leefgebieden scores (7 domeinen met score 1-5 + prioriteit)

**AI Processing:**
- Claude 3.5 Sonnet API call
- Gestructureerde prompt met context
- JSON response volgens schema
- Response tijd: < 5 seconden

**Output:**
- Behandelstructuur (duur, frequentie, aantal sessies)
- 2-4 SMART doelen (elk gekoppeld aan leefgebied)
- Evidence-based interventies per doel
- Sessie-planning (grove indeling, 8-12 sessies)
- 2 evaluatiemomenten (tussentijds + eind)
- Veiligheidsplan (bij severity "Hoog")

**Status:** Concept (bewerkbaar, niet gepubliceerd)

---

#### F-02: Leefgebieden Tracking

**7 Levensdomeinen:**
1. Dagelijkse Levensverrichtingen (DLV) - Zelfzorg, structuur
2. Wonen - Woonsituatie, veiligheid
3. Werk/Dagbesteding - Baan, opleiding, vrijwilligerswerk
4. Sociaal netwerk - Familie, vrienden, relaties
5. Vrijetijd/Zingeving - Hobby's, levensdoel, spiritualiteit
6. Financiën - Schulden, inkomen, budgettering
7. Lichamelijke gezondheid - Slaap, beweging, voeding

**Intake-fase:**
- Formulier met 7 leefgebieden
- Per gebied: score 1-5 (slider), toelichting (tekst), prioriteit (dropdown)
- Opslaan in intake data (JSONB veld)

**Behandelplan-fase:**
- Spindiagram (Recharts radar chart)
- 3 lijnen: Baseline (grijs), Huidig (blauw), Doel (groen gestippeld)
- Elk doel heeft leefgebied-tag (emoji + label)

**Evaluatie-fase:**
- Update "Huidig" scores
- Spindiagram update in real-time
- Zichtbaar welke gebieden verbeteren/achter blijven

---

#### F-03: SMART Doelen (Behandelaar-versie)

**Per doel:**
- Titel (kort, 1 zin)
- Beschrijving (SMART-uitwerking, 2-3 zinnen)
- Leefgebied-tag (dlv/wonen/werk/sociaal/vrijetijd/financien/gezondheid)
- Prioriteit (hoog/middel/laag)
- Meetbaarheid (hoe meten we vooruitgang?)
- Tijdslijn (binnen X weken)
- Status (niet_gestart/bezig/gehaald/bijgesteld)
- Voortgang (0-100% progress bar)

**Acties:**
- [Bewerk]: Inline editing
- [↻ Regenereer]: AI genereert alternatief
- [+]: Handmatig doel toevoegen
- [🗑️]: Verwijderen

**AI-gedrag:**
- Focus op prioriteit "Hoog" leefgebieden
- Mix van verschillende leefgebieden (niet alles op 1 domein)
- Concreet en meetbaar (geen vage termen)

---

#### F-04: Cliënt-vriendelijke Doelen (B1-taal)

**Per doel EXTRA veld:**
- "Cliënt-versie" in B1-Nederlands
- Geen jargon, concrete voorbeelden

**Voorbeeld:**
```
Behandelaar: "Reductie van vermijdingsgedrag met 50% binnen 8 weken"
Cliënt: "Ik ga weer naar de supermarkt zonder paniek te krijgen"
```

**Validatie:**
- AI genereert automatisch cliënt-versie
- Behandelaar kan aanpassen
- Cliëntportaal toont alleen cliënt-versies

---

#### F-05: Evidence-based Interventies

**Per interventie:**
- Naam (CGT, Exposure, EMDR, ACT, Schematherapie, IPT, etc.)
- Beschrijving (2-3 zinnen)
- Rationale (waarom past dit bij deze cliënt?)
- Gekoppelde doelen (welke doelen worden hiermee benaderd?)

**AI-mapping:**
| DSM-Categorie | Primaire Interventies | Severity → Intensiteit |
|---------------|----------------------|------------------------|
| Angststoornissen | CGT, Exposure, ACT | Hoog → 12-16 sessies |
| Stemmingsklachten | CGT, IPT, Gedragsactivatie | Middel → 8-12 sessies |
| Trauma/PTSS | EMDR, Narratieve therapie | Hoog → 12+ sessies |
| Persoonlijkheid | Schematherapie, MBT | Hoog → 20+ sessies |

---

#### F-06: Sessie-planning

**Tabel-weergave:**
| # | Focus | Datum | Status | Gekoppelde Doelen | Notities |
|---|-------|-------|--------|-------------------|----------|
| 1 | Psycho-educatie angst | 15-11 | ✓ Afgerond | Doel 1, 2 | Ging goed |
| 2 | Start exposure oefeningen | 22-11 | ⏵ Gepland | Doel 2 | - |
| 3 | Exposure + huiswerk review | 29-11 | ⏵ Gepland | Doel 2 | - |

**Functionaliteit:**
- AI genereert grove planning (Sessie 1-2: X, Sessie 3-6: Y, etc.)
- Behandelaar kan aanpassen, toevoegen, verwijderen
- Status wijzigen: Gepland → Afgerond/No-show/Verzet/Geannuleerd
- Korte notitie na sessie (optioneel)

---

#### F-07: Evaluatiemomenten

**Minimaal 2 evaluaties:**
1. Tussentijdse evaluatie (na ca. 1/3 behandeling)
2. Eindevaluatie (einde behandeling)

**Per evaluatie:**
- Type (tussentijds/eind/crisis)
- Geplande datum (automatisch berekend, aanpasbaar)
- Werkelijke datum (invullen bij uitvoeren)
- Status (gepland/afgerond/overgeslagen)
- Uitkomst (vrije tekst, 2-5 zinnen)
- Aanpassingen (wat is gewijzigd in plan?)
- ROM-scores (optioneel, indien beschikbaar)
- Leefgebieden update (nieuwe scores voor "Huidig")

**Triggers:**
- Bij evaluatiedatum: visuele indicator in UI
- Na evaluatie: optie om nieuwe versie te starten (v2)

---

#### F-08: Versie-beheer

**Statussen:**
- **Concept**: Bewerkbaar, niet zichtbaar voor cliënt
- **Actief**: Gepubliceerd, zichtbaar voor cliënt, nog bewerkbaar
- **In evaluatie**: Evaluatiemoment gepland/bezig
- **Afgerond**: Behandeling afgerond, plan gearchiveerd
- **Gearchiveerd**: Bij nieuwe versie wordt oude versie gearchiveerd

**Versie-nummering:**
- v1, v2, v3, etc.
- Bij significante wijziging (na evaluatie, nieuwe doelen): nieuwe versie starten
- Oude versies blijven zichtbaar (read-only)

**Versie-overzicht:**
```
┌─────────────────────────────────────────────────┐
│ Versie | Status    | Datum      | Behandelaar  │
│────────┼───────────┼────────────┼──────────────│
│ v2     │ ● Actief  │ 15-11-2024 │ Jansen, M.   │
│ v1     │ Afgerond  │ 01-10-2024 │ Jansen, M.   │
└─────────────────────────────────────────────────┘
```

---

#### F-09: Concept → Actief Publicatie

**Workflow:**
1. Behandelaar genereert plan (of maakt handmatig)
2. Plan is in status "Concept"
3. Behandelaar reviewt en bewerkt
4. Knop "Publiceer" → Plan wordt "Actief"
5. Publicatiedatum wordt vastgelegd
6. Plan is nu zichtbaar in cliëntportaal

**Validatie voor publicatie:**
- Minimaal 1 doel ingevuld
- Minimaal 1 interventie gekoppeld
- Behandelstructuur compleet
- Evaluatiemomenten gepland

---

#### F-10: Micro-regeneratie

**Per sectie/item een [↻ Regenereer] knop:**
- Behandelaar kan specifiek onderdeel laten hergenereren
- AI behoudt context van rest van plan
- Optioneel: korte instructie meegeven ("maak concreter", "focus op werk")

**Voorbeeld:**
- Doel 2 past niet goed → klik [↻ Regenereer]
- Popup: "Geef optioneel extra instructie" (tekstveld)
- AI genereert nieuw voorstel voor Doel 2
- Behandelaar accepteert of verwerpt

---

### 3.2 SHOULD HAVE (Week 3 - Nice to have)

#### F-11: Crisis/Veiligheidsplan
**Trigger:** Alleen bij severity "Hoog"
**Inhoud:**
- Waarschuwingssignalen (3-5 items)
- Coping strategieën (3-5 items)
- Belangrijke contacten (behandelaar, crisis, 113)
- Restricties (bijv. "Geen alcohol tijdens behandeling")

**Zichtbaar voor cliënt:** Ja, prominente weergave met urgentie-styling

---

#### F-12: Betrokkenen
**Wie:** Partner, werkgever, huisarts, etc.
**Per betrokkene:**
- Naam
- Rol/relatie
- Betrokkenheid bij behandeling (tekst)

**Voorbeeld:** "Partner aanwezig bij intake en evaluaties"

---

#### F-13: Behandelaar Notities (intern)
**Niet zichtbaar voor cliënt**
- Vrij tekstveld voor interne aantekeningen
- Bijv. "Let op: vermijdt oogcontact, mogelijk trauma-gerelateerd"

---

### 3.3 COULD HAVE (Week 3 - Stretch goals)

#### F-14: Manual Mode (zonder AI)
- Behandelaar kan volledig handmatig plan opstellen
- Leeg canvas met secties
- Voor als AI-output niet passend is

---

#### F-15: Templates
- Vooraf ingevulde templates voor veelvoorkomende behandeltypes
- Bijv. "CGT Angststoornissen 12 sessies"
- Behandelaar past aan voor specifieke cliënt

---

#### F-16: Copy from Previous
- Delen kopiëren uit eerder behandelplan van deze cliënt
- Bijv. als cliënt terugkeert na afronding

---

#### F-17: Diff View
- Verschil tussen versies visualiseren
- Wat is gewijzigd van v1 naar v2?

---

## 4. Gebruikersflows (Demo- en MVP-flows)

🎯 **Doel:** Laten zien hoe de gebruiker stap-voor-stap door het systeem gaat.

### Flow 1: Happy Path — Intake → Behandelplan (Demo-ready)

**Tijd:** < 3 minuten totaal

```
┌─────────────────────────────────────────────────────────┐
│ 1. Behandelaar voltooit intake                         │
│    → Rich text editor met notities                     │
│    → Leefgebieden formulier invullen (7 domeinen)      │
│    → Slaat op                                           │
│    ↓                                                    │
│ 2. Navigeert naar Diagnose tab                         │
│    → Klikt [AI ⚡ Analyseer intake]                     │
│    → AI genereert DSM-categorie + Severity (3 sec)     │
│    ↓                                                    │
│ 3. Accepteert of bewerkt diagnose                      │
│    → Slaat probleemprofiel op                          │
│    ↓                                                    │
│ 4. Navigeert naar Behandelplan tab                     │
│    → Ziet: "⚡ AI kan een concept genereren"           │
│    → Klikt [Genereer Behandelplan]                     │
│    ↓                                                    │
│ 5. AI genereert compleet plan (< 5 sec)                │
│    → 3 SMART doelen (verdeeld over leefgebieden)       │
│    → 2 Interventies (CGT, Exposure)                    │
│    → 8 Sessies met focus per sessie                    │
│    → 2 Evaluatiemomenten                               │
│    → Spindiagram met leefgebieden                      │
│    ↓                                                    │
│ 6. Behandelaar reviewt en past aan (optioneel)         │
│    → Doel 2 niet passend? Klik [↻ Regenereer]          │
│    → Bewerk teksten inline                             │
│    ↓                                                    │
│ 7. Klikt [Accepteer & Publiceer]                       │
│    → Plan v1 wordt actief                              │
│    → Zichtbaar in cliëntportaal                        │
└─────────────────────────────────────────────────────────┘
```

**Demo-highlight momenten:**
- **Moment 1:** Leefgebieden spindiagram visualiseert problematiek
- **Moment 2:** AI generatie in real-time (< 5 sec, teller tonen)
- **Moment 3:** Doelen hebben leefgebied-tags (recovery-gericht)
- **Moment 4:** Cliënt-versie in simpele taal (B1-niveau)

---

### Flow 2: Regeneratie van specifiek onderdeel

**Tijd:** < 30 seconden

```
┌─────────────────────────────────────────────────────────┐
│ 1. Behandelaar vindt Doel 2 niet passend                │
│    → Klik [↻ Regenereer] bij Doel 2                     │
│    ↓                                                    │
│ 2. Popup verschijnt                                     │
│    → "Geef optioneel instructie voor AI" (tekstveld)    │
│    → Behandelaar typt: "maak meer gefocust op werk"     │
│    → Klik [Regenereer]                                  │
│    ↓                                                    │
│ 3. AI genereert alternatief doel (< 3 sec)              │
│    → Behoudt context van rest van plan                  │
│    → Nieuw doel focust op werksituatie                  │
│    ↓                                                    │
│ 4. Behandelaar kiest                                    │
│    → [Accepteer nieuw voorstel] of [Behoud origineel]   │
└─────────────────────────────────────────────────────────┘
```

---

### Flow 3: Evaluatie → Nieuwe Versie

**Tijd:** ~5 minuten

```
┌─────────────────────────────────────────────────────────┐
│ 1. Tussentijdse evaluatie gepland (week 4)              │
│    → Indicator in UI: "⏰ Evaluatie vandaag"            │
│    → Klik [Evaluatie invullen]                          │
│    ↓                                                    │
│ 2. Evaluatie-formulier                                  │
│    → Uitkomst (vrije tekst): "Goed op weg..."          │
│    → Leefgebieden scores updaten (spindiagram update)   │
│    → Voortgang per doel: Doel 1 60%, Doel 2 40%         │
│    ↓                                                    │
│ 3. Beslissing                                           │
│    → [Ga door met huidig plan] (kleine aanpassingen)    │
│    → [Start nieuwe versie v2] (grote wijzigingen)       │
│    ↓                                                    │
│ 4. Indien nieuwe versie                                 │
│    → v1 wordt "Afgerond"                                │
│    → v2 start als concept (kopie van v1)                │
│    → Behandelaar past aan, publiceert                   │
└─────────────────────────────────────────────────────────┘
```

---

### Flow 4: Cliënt bekijkt eigen plan (Cliëntportaal)

**Tijd:** ~2 minuten bekijken

```
┌─────────────────────────────────────────────────────────┐
│ 1. Cliënt logt in op portaal                            │
│    → Ziet eigen dashboard                               │
│    → Tab "Mijn Behandelplan"                            │
│    ↓                                                    │
│ 2. Behandelplan-overzicht in B1-taal                    │
│    → "Waar we aan werken" (doelen in eigen woorden)     │
│    → Spindiagram: "Hoe het met je gaat" (visueel)       │
│    → "Wat we gaan doen" (interventies uitgelegd)        │
│    → "Planning" (wanneer zijn de gesprekken)            │
│    ↓                                                    │
│ 3. Acties                                               │
│    → [Print dit plan]                                   │
│    → [Stel een vraag] (chat met behandelaar)            │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Niet in Scope

🎯 **Doel:** Duidelijk maken wat (nog) niet wordt gebouwd.

### 5.1 Definitief NIET in MVP (Week 3)

1. **ROM-vragenlijst afname binnen systeem**
   - Reden: Complexe vragenlijsten (OQ-45, PHQ-9) zijn apart domein
   - Alternatief: Alleen scores tonen als ze er zijn, verwijzing naar externe tool

2. **Multi-disciplinaire behandelplannen (MDO)**
   - Reden: Vereist samenwerking tussen meerdere behandelaars, complexe workflows
   - Alternatief: Enkelvoudige behandelaar alleen

3. **DBC/ZPM declaratie-koppeling**
   - Reden: Vereist integratie met zorgadministratie-systemen
   - Alternatief: Niet nodig voor demo

4. **Medicatie-management**
   - Reden: Apart domein met eigen complexiteit (medicatiehistorie, interacties)
   - Alternatief: Niet in behandelplan MVP

5. **Real-time samenwerking (concurrent editing)**
   - Reden: Technisch complex, WebSockets/multiplayer sync
   - Alternatief: Laatste opslag wint, audit trail toont wie wat wijzigde

6. **Notificaties/Reminders via email/SMS**
   - Reden: Vereist notification service, scheduling
   - Alternatief: Alleen visuele indicators in UI

7. **Integratie met externe agenda's** (Google Calendar, Outlook)
   - Reden: OAuth flows, sync complexity
   - Alternatief: Handmatige datums in systeem

8. **Cliënt kan plan aanpassen/suggesties doen**
   - Reden: UX flow voor "suggest changes" nog niet uitgewerkt
   - Alternatief: Cliënt kan alleen lezen, niet wijzigen (MVP)

9. **Terugvalpreventieplan als apart document**
   - Reden: Kan onderdeel zijn van behandelplan
   - Alternatief: Opnemen in laatste sessie-planning of veiligheidsplan

10. **Fancy voortgangsgrafieken en dashboards**
    - Reden: Recharts charts zijn nice-to-have, niet essentieel
    - Alternatief: Simpele progress bars (0-100%) en spindiagram

11. **Productie-grade audit logging**
    - Reden: Demo-only, geen compliance vereist
    - Alternatief: Basis audit trail (wie, wat, wanneer)

12. **Meerdere AI providers (model switching)**
    - Reden: Alleen Claude 3.5 Sonnet voor MVP
    - Alternatief: Hardcoded model, geen keuze

---

## 6. Succescriteria

🎯 **Doel:** Objectieve meetlat voor een geslaagde oplevering.

### 6.1 Demo Succescriteria (Week 3 Oplevering)

**Performance:**
- [ ] AI behandelplan generatie: < 5 seconden
- [ ] Page load behandelplan: < 1 seconde
- [ ] Spindiagram render: < 500ms
- [ ] Auto-save behandelplan: < 500ms response time

**Functionaliteit:**
- [ ] Happy Path werkt zonder errors (intake → diagnose → behandelplan → publiceer)
- [ ] AI genereert plan in ≥80% van gevallen bruikbaar zonder grote edits
- [ ] Micro-regeneratie werkt per onderdeel
- [ ] Leefgebieden spindiagram toont 3 lijnen (baseline, huidig, doel)
- [ ] Doelen hebben leefgebied-tags en zijn verdeeld over minimaal 2 verschillende gebieden
- [ ] Cliëntportaal toont behandelplan in B1-taal

**UX/UI:**
- [ ] Behandelplan-pagina werkt op tablet (belangrijkste use case)
- [ ] Spindiagram is begrijpelijk zonder uitleg voor ≥80% testgebruikers
- [ ] Cliënt-versie doelen zijn begrijpelijk voor ≥90% testgebruikers (B1-validatie)
- [ ] Demo flow doorlooptijd: intake → behandelplan < 3 minuten

**Content:**
- [ ] Dummy-data voor 3 cliënten met behandelplannen (verschillende severities)
- [ ] Help-tooltips bij complexe velden (SMART-criteria, severity, leefgebieden)
- [ ] Onboarding hint wijst op AI-generatie feature

**Technical:**
- [ ] Database schema geïmplementeerd (incl. leefgebieden JSONB)
- [ ] API endpoints beschikbaar (CRUD behandelplan)
- [ ] Row-level security policies actief
- [ ] Audit trail logt alle wijzigingen (wie, wat, wanneer)

---

### 6.2 Post-MVP Succescriteria (Productie)

**Tijdsbesparing:**
- Traditioneel handmatig: 30+ minuten
- Met AI: < 5 minuten
- **Besparing: 83%**

**Kwaliteit:**
- Plan voldoet aan richtlijnen in ≥95% van gevallen
- Behandelaar-tevredenheid: ≥4/5 sterren
- Cliënt kan plan begrijpen zonder uitleg: ≥90%

**Adoptie:**
- ≥70% behandelaars gebruikt AI-generatie feature
- ≥50% behandelaars past micro-regeneratie toe
- Sessie-planning wordt in ≥60% van plannen gebruikt

---

## 7. Risico's & Mitigatie

🎯 **Doel:** Risico's vroeg signaleren en plannen hoe ermee om te gaan.

| # | Risico | Impact | Kans | Mitigatie |
|---|--------|--------|------|-----------|
| **R-01** | **AI genereert onzinnig/gevaarlijk plan** | 🔴 Hoog | 🟡 Laag | • Duidelijke prompt engineering met voorbeelden<br>• Behandelaar reviewt ALTIJD (AI is suggestie, geen besluit)<br>• Validatie: plan moet minimaal 1 doel, 1 interventie bevatten<br>• Fallback: behandelaar kan handmatig plan maken |
| **R-02** | **Behandelaar vindt AI-plan niet bruikbaar** | 🟠 Hoog | 🟡 Middel | • Manual mode beschikbaar (volledig handmatig)<br>• Micro-regeneratie per onderdeel (niet alles opnieuw)<br>• Templates als alternatief<br>• User feedback tijdens testing → prompt verbeteren |
| **R-03** | **Leefgebieden spindiagram te complex** | 🟡 Middel | 🟡 Middel | • Uitleg bij eerste gebruik (tooltip/walkthrough)<br>• Hover toont details per gebied<br>• Kan verborgen worden als niet gewenst<br>• Test met niet-technische gebruikers |
| **R-04** | **Versie-beheer wordt te complex** | 🟡 Middel | 🟡 Middel | • Start simpel: v1, v2, v3 (geen branching)<br>• Diff-view is optioneel (stretch)<br>• Duidelijke labels: "Actief", "Afgerond"<br>• Max 5-10 versies verwacht, overzichtelijk |
| **R-05** | **Cliënt begrijpt B1-taal niet** | 🟡 Middel | 🟢 Laag | • Test cliënt-versies met echte cliënten<br>• Behandelaar kan aanpassen na AI-generatie<br>• Voorbeelden in UI (hover/tooltip)<br>• Versie voor lage geletterdheid (post-MVP) |
| **R-06** | **Sessie-planning wordt niet gebruikt** | 🟢 Laag | 🟡 Middel | • Sessie-planning is optioneel, niet verplicht<br>• AI genereert grove planning (makkelijk starten)<br>• Behandelaar kan ook alleen evaluaties bijhouden |
| **R-07** | **AI API rate limits / downtime** | 🟠 Hoog | 🟢 Laag | • Error handling: duidelijke foutmeldingen<br>• Retry logic (3x met backoff)<br>• Fallback: "AI tijdelijk niet beschikbaar, probeer later of maak handmatig"<br>• Cached responses voor demo (pre-generated) |
| **R-08** | **Scope creep (te veel features)** | 🟡 Middel | 🟠 Hoog | • Strikte PRD met "Niet in Scope" sectie<br>• Weekly review: focus op MVP<br>• Post-MVP backlog voor ideeën<br>• Demo-readiness prioriteit #1 |
| **R-09** | **Privacy concerns (test met echte data)** | 🔴 Hoog | 🟢 Laag | • ALLEEN demo-data (fictieve cliënten)<br>• Duidelijke disclaimer in UI: "Demo-omgeving"<br>• Geen productie-data tijdens Speedrun |
| **R-10** | **Time crunch Week 3** | 🟡 Middel | 🟡 Middel | • Prioriteer Must Have > Should Have > Could Have<br>• Spindiagram kan laatste dag (1 uur werk)<br>• Manual mode kan post-MVP<br>• Focus: 1 perfecte demo-flow |

**Mitigatie Overzicht:**
- 🔴 Hoog impact: Behandelaar blijft decision maker (AI = tool)
- 🟠 Middel impact: Fallbacks en optionaliteit
- 🟢 Laag impact: Monitoring en duidelijke scope

---

## 8. Roadmap / Vervolg (Post-MVP)

🎯 **Doel:** Richting geven aan toekomstige uitbreidingen.

### 8.1 Week 4 (Direct na MVP)

**Polish & Testing:**
- User testing met 2-3 GGZ-professionals
- Feedback verwerken in prompt engineering
- Bug fixes naar aanleiding van testing
- Performance optimalisatie (lazy loading, caching)

---

### 8.2 Fase 2: Productie-ready maken (Maand 2)

**Veiligheid & Compliance:**
- Full audit logging (GGZ-dossier eisen)
- Logging van AI-interacties (traceability)
- Encryptie at rest voor behandelplannen
- Backup & restore procedures

**Rollen & Rechten:**
- Behandelaar-rollen (psycholoog, psychiater, POH)
- Supervisor kan plannen reviewen
- Team-leads hebben overzicht
- Cliënt-toegang per behandelaar instellen

**ROM-integratie:**
- Import ROM-scores (OQ-45, PHQ-9, etc.)
- Toon scores in spindiagram als extra laag
- Link evaluatiemomenten aan ROM-afname
- Trendgrafiek ROM-scores over tijd

---

### 8.3 Fase 3: Geavanceerde features (Maand 3-4)

**Multi-disciplinaire plannen (MDO):**
- Meerdere behandelaars kunnen bijdragen
- Rol-specifieke doelen (psycholoog, psychiater, maatschappelijk werk)
- Shared ownership van plan
- Notificaties bij wijzigingen

**Terugvalpreventie module:**
- Apart document gegenereerd na behandeling
- Waarschuwingssignalen + actieplan
- Cliënt kan zelf bijwerken (self-management)
- Trigger bij crisis: "Bekijk je terugvalplan"

**Trendanalyse & BI:**
- Dashboard behandelaar: welke interventies werken best
- Organisatie-niveau: gemiddelde behandelduur per DSM-categorie
- Leefgebieden-analyse: waar zitten meeste knelpunten
- AI-effectiviteit: hoe vaak wordt AI-plan gebruikt vs. aangepast

**Notificaties & Reminders:**
- Email/SMS bij naderende evaluatie
- Cliënt reminder voor sessie (opt-in)
- Behandelaar reminder voor niet-ingevulde evaluaties
- Weekly digest: "3 plannen te evalueren deze week"

---

### 8.4 Fase 4: Integraties (Maand 5-6)

**Externe systemen:**
- Koppeling met bestaande EPD's (PinkRoccade, Nedap, Zorgdomein)
- FHIR-compliance (CarePlan resource)
- MedMij/Koppeltaal koppelingen
- API voor externe tools

**Agenda-integratie:**
- Google Calendar sync voor sessies
- Outlook integratie
- iCal export voor cliënt

**DBC/Declaratie:**
- Automatische DBC-registratie bij starten plan
- Koppeling sessies aan DBC-productcodes
- Export naar zorgadministratie

---

### 8.5 Backlog Ideeën (Toekomst)

**AI-uitbreidingen:**
- Voice-to-text voor intake (tijdens gesprek)
- AI-suggesties tijdens sessie ("Misschien wil je doel 2 bijstellen")
- Predictive analytics: "Gebaseerd op vergelijkbare cliënten, verwachte behandelduur 10 weken"

**Cliënt-participatie:**
- Cliënt kan voortgang zelf updaten ("Hoe ging het deze week?")
- Cliënt kan suggesties doen voor doelen
- Dagboek-functie voor cliënt (tussen sessies)

**Gamification:**
- Voortgangsbadges voor cliënt ("3 sessies voltooid!")
- Visuele mijlpalen in behandeling
- Shared celebration bij behaalde doelen

---

## 9. UX/UI Specificatie

🎯 **Doel:** Expliciete beschrijving van user experience en interface design.

### 9.1 Design Principes

**Behandelaar-perspectief:**
1. **Efficiency first**: Minimale clicks, snelle toegang
2. **Control over AI**: AI is hulp, geen baas
3. **Progressive disclosure**: Complexiteit verbergen tot nodig
4. **Tablet-optimized**: Veel behandelaars werken op iPad

**Cliënt-perspectief:**
1. **Simplicity**: Geen jargon, duidelijke taal
2. **Visual over text**: Spindiagram > lange teksten
3. **Empowerment**: Inzicht = controle over eigen proces
4. **Accessible**: WCAG 2.1 AA, B1-taalniveau

---

### 9.2 Kleurenschema (uit UX Stylesheet)

**Primary colors:**
- Primary Blue: `#3b82f6` (buttons, links, actieve elementen)
- Primary Dark: `#1e40af` (hover states)

**Status colors:**
- Success Green: `#10b981` (afgerond, behaald)
- Warning Orange: `#f59e0b` (prioriteit hoog, let op)
- Error Red: `#ef4444` (severity hoog, crisis)
- Info Blue: `#60a5fa` (concept, in bewerking)

**Neutral colors:**
- Gray 900: `#111827` (headings)
- Gray 700: `#374151` (body text)
- Gray 500: `#6b7280` (secondary text)
- Gray 300: `#d1d5db` (borders)
- Gray 100: `#f3f4f6` (backgrounds)

**Leefgebieden colors:**
- DLV: `#8b5cf6` (paars)
- Wonen: `#ec4899` (roze)
- Werk: `#f59e0b` (oranje)
- Sociaal: `#3b82f6` (blauw)
- Vrijetijd: `#10b981` (groen)
- Financiën: `#eab308` (geel)
- Gezondheid: `#ef4444` (rood)

---

### 9.3 Typography

**Fonts:**
- Primary: `Inter` (sans-serif, schermgeoptimaliseerd)
- Monospace: `'Courier New', monospace` (voor code/data)

**Sizes:**
- H1: `32px` / `2rem` - bold (Page titles)
- H2: `24px` / `1.5rem` - semibold (Section headers)
- H3: `20px` / `1.25rem` - semibold (Subsection headers)
- Body: `16px` / `1rem` - regular (Default text)
- Small: `14px` / `0.875rem` - regular (Labels, captions)
- Tiny: `12px` / `0.75rem` - regular (Timestamps, metadata)

---

### 9.4 Behandelplan Hoofdpagina - Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
│ Mini-ECD Logo    [Bas Jansen ▼]      [Zoek cliënt...]      │
│                  ID: CL0002 | 20-11-1992                    │
├─────────────────────────────────────────────────────────────┤
│ SIDEBAR         │ MAIN CONTENT                              │
│                 │                                           │
│ ← Cliënten      │ ┌───────────────────────────────────────┐│
│ ─────────       │ │ Behandelplan v2                       ││
│ □ Dashboard     │ │ Status: ● Actief sinds 15-11-2024     ││
│ □ Intake        │ │ [Bewerken] [Nieuwe Versie] [Print]    ││
│ □ Diagnose      │ └───────────────────────────────────────┘│
│ ■ Behandelplan  │                                           │
│ □ Rapportage    │ 📋 Behandelstructuur                      │
│                 │ ┌───────────────────────────────────────┐│
│                 │ │ Duur: 8 weken                         ││
│                 │ │ Frequentie: Wekelijks                 ││
│                 │ │ Sessies: 8                            ││
│                 │ │ Vorm: Individueel                     ││
│                 │ └───────────────────────────────────────┘│
│                 │                                           │
│                 │ 🌐 Leefgebieden Overzicht                 │
│                 │ ┌───────────────────────────────────────┐│
│                 │ │  [SPINDIAGRAM: 7-hoekige radar]       ││
│                 │ │                                       ││
│                 │ │         Gezondheid (4)                ││
│                 │ │              │                        ││
│                 │ │    DLV (3) ──┼── Wonen (4)           ││
│                 │ │            ╱ │ ╲                     ││
│                 │ │  Financiën(3)─●─ Werk (2) ⚠️         ││
│                 │ │            ╲ │ ╱                     ││
│                 │ │    Vrijetijd ─┴─ Sociaal (2) ⚠️      ││
│                 │ │       (3)                            ││
│                 │ │                                       ││
│                 │ │ ━━ Baseline (grijs - start)          ││
│                 │ │ ── Huidig (blauw - week 4)           ││
│                 │ │ ·· Doel (groen gestippeld - week 8)  ││
│                 │ └───────────────────────────────────────┘│
│                 │                                           │
│                 │ 🎯 SMART Doelen (3)                       │
│                 │ ┌───────────────────────────────────────┐│
│                 │ │ 1. [💼 Werk] Terugkeer 4 dagen/week   ││
│                 │ │    "Ik werk weer 4 dagen zonder panic"││
│                 │ │    Voortgang: ██████░░░░ 60%          ││
│                 │ │    Status: Bezig | Deadline: 8 weken  ││
│                 │ │    [Bewerk] [↻ Regenereer] [Details▼]││
│                 │ ├───────────────────────────────────────┤│
│                 │ │ 2. [👥 Sociaal] 1x/week activiteit    ││
│                 │ │    "Ik zie elke week een vriend"      ││
│                 │ │    Voortgang: ████░░░░░░ 40%          ││
│                 │ │    Status: Bezig | Deadline: 8 weken  ││
│                 │ │    [Bewerk] [↻ Regenereer] [Details▼]││
│                 │ ├───────────────────────────────────────┤│
│                 │ │ 3. [🏃 DLV] Dagstructuur opbouwen     ││
│                 │ │    "Ik sta elke dag op voor 9 uur"    ││
│                 │ │    Voortgang: ███░░░░░░░ 30%          ││
│                 │ │    Status: Bezig | Deadline: 8 weken  ││
│                 │ │    [Bewerk] [↻ Regenereer] [Details▼]││
│                 │ └───────────────────────────────────────┘│
│                 │                                           │
│                 │ 💡 Interventies                           │
│                 │ ┌───────────────────────────────────────┐│
│                 │ │ • CGT - Cognitieve herstructurering   ││
│                 │ │   Gekoppeld aan: Doel 1, 2            ││
│                 │ │   [Details ▼]                         ││
│                 │ ├───────────────────────────────────────┤│
│                 │ │ • Exposure therapie (gradueel)        ││
│                 │ │   Gekoppeld aan: Doel 2               ││
│                 │ │   [Details ▼]                         ││
│                 │ └───────────────────────────────────────┘│
│                 │                                           │
│                 │ 📅 Sessie-planning (8 sessies)            │
│                 │ ┌───────────────────────────────────────┐│
│                 │ │ # | Focus          | Datum  | Status  ││
│                 │ │───┼────────────────┼────────┼─────────││
│                 │ │ 1 | Psycho-educatie| 15-11  |✓Afgerond││
│                 │ │ 2 | Start exposure | 22-11  |⏵Gepland ││
│                 │ │ 3 | Exposure +     | 29-11  |⏵Gepland ││
│                 │ │ 4 | ...            | ...    | ...     ││
│                 │ │                                       ││
│                 │ │ [+ Sessie toevoegen]                  ││
│                 │ └───────────────────────────────────────┘│
│                 │                                           │
│                 │ 📊 Evaluatiemomenten                      │
│                 │ ┌───────────────────────────────────────┐│
│                 │ │ ⏰ Tussentijds: 13-12-2024            ││
│                 │ │    Status: Gepland                    ││
│                 │ │    [Evaluatie invullen]               ││
│                 │ ├───────────────────────────────────────┤│
│                 │ │ ⏰ Eind: 10-01-2025                   ││
│                 │ │    Status: Gepland                    ││
│                 │ └───────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

### 9.5 Micro-interacties

**Doel Regeneratie:**
1. User klikt [↻ Regenereer] bij Doel 2
2. Doel 2 card "pulseert" licht (opacity animation)
3. Modal popup verschijnt met fade-in (200ms)
4. Tekstveld heeft focus, placeholder: "Geef extra instructie (optioneel)"
5. User typt instructie
6. Klikt [Regenereer] knop
7. Modal toont loader (spinner + "AI genereert nieuw voorstel...")
8. Na 2-3 sec: nieuw voorstel verschijnt met slide-in
9. User ziet [Accepteer] en [Behoud origineel] knoppen
10. Bij accepteren: smooth transition naar nieuw doel
11. Toast notification: "Doel 2 bijgewerkt"

**Spindiagram Interactie:**
1. Hover over gebied (bijv. "Werk")
2. Highlight die sectie in chart (opacity +20%)
3. Tooltip verschijnt met:
   - "Werk/Dagbesteding"
   - "Baseline: 2/5 - Werkt 4 dagen, verzuim toegenomen"
   - "Huidig: 3/5 - Terug naar 3 dagen, minder verzuim"
   - "Doel: 4/5 - Weer 4 dagen stabiel"
4. Click op gebied: scroll naar gekoppelde doelen (smooth scroll)

**Sessie Afvinken:**
1. User klikt status-dropdown bij Sessie 2
2. Dropdown opent met opties: Afgerond, No-show, Verzet, Geannuleerd
3. User selecteert "Afgerond"
4. Status wijzigt naar ✓ (groen check)
5. Notities-veld wordt zichtbaar (slide-down)
6. User kan korte notitie typen
7. Auto-save na 2 seconden inactiviteit
8. Check mark verschijnt in notities-veld: "Opgeslagen"

---

### 9.6 Responsive Design (Tablet)

**Breakpoints:**
- Desktop: ≥1024px (sidebar + main content naast elkaar)
- Tablet: 768-1023px (sidebar collapsible)
- Mobile: <768px (niet primair, maar basis support)

**Tablet layout:**
- Sidebar wordt "hamburger menu" (☰) in header
- Main content full-width
- Spindiagram blijft zichtbaar, maar kleinere radius (300px → 250px)
- Doelen kaarten stapelen verticaal
- Sessie-tabel horizontaal scrollable

---

### 9.7 Accessibility (WCAG 2.1 AA)

**Keyboard navigation:**
- Tab order logisch (top → bottom, left → right)
- Focus indicators duidelijk (blue outline 2px)
- Enter/Space triggeren buttons
- Escape sluit modals

**Screen readers:**
- Alt teksten voor spindiagram (beschrijvende tabel als fallback)
- ARIA labels voor interactive elements
- Heading hierarchy correct (H1 → H2 → H3)
- Form labels expliciet gekoppeld aan inputs

**Color contrast:**
- Text op white: minimaal 4.5:1 ratio
- Status colors: voldoen aan contrast eisen
- Severity "Hoog" (rood): niet alleen kleur, ook icon (⚠️)

**B1-taalniveau (cliënt-versies):**
- Zinnen max 15-20 woorden
- Geen moeilijke woorden (jargon, Latijn)
- Actieve vorm ("Je gaat oefenen" ipv "Er zal worden geoefend")
- Concrete voorbeelden ("supermarkt" ipv "sociale situaties")

---

### 9.8 Loading States & Feedback

**AI Generatie (5 seconden):**
```
┌─────────────────────────────────────┐
│ ⚡ AI genereert behandelplan...     │
│                                     │
│ [====================   ] 80%       │
│                                     │
│ Analyseren van intake-notities ✓    │
│ Bepalen behandelfocus ✓             │
│ Genereren SMART doelen ⏳            │
│ Interventies koppelen ...           │
│ Sessie-planning opstellen ...       │
└─────────────────────────────────────┘
```

**Auto-save Indicator:**
- Kleine indicator rechtsbovenin: "Opgeslagen 2 sec geleden"
- Bij typen: "Aan het opslaan..."
- Check mark bij succes: "✓ Opgeslagen"

**Error States:**
- AI niet beschikbaar: "AI tijdelijk niet beschikbaar. Je kunt handmatig een plan opstellen of het later opnieuw proberen."
- Validatie fout: Inline error onder veld (rood, met icon)
- Network error: Toast notification onderaan: "Verbinding verloren. Controleer je internet."

---

### 9.9 Empty States

**Geen behandelplan:**
```
┌───────────────────────────────────────┐
│                                       │
│         📋                            │
│                                       │
│    Nog geen behandelplan              │
│                                       │
│    Vul eerst de intake en diagnose    │
│    in, dan kan AI een behandelplan   │
│    genereren.                         │
│                                       │
│    [Naar Intake]  [Naar Diagnose]    │
│                                       │
└───────────────────────────────────────┘
```

**Geen sessies gepland:**
```
┌───────────────────────────────────────┐
│  Nog geen sessies gepland             │
│  AI genereert een grove planning,     │
│  die je daarna kunt aanpassen.        │
│                                       │
│  [+ Sessie toevoegen]                 │
└───────────────────────────────────────┘
```

---

### 9.10 Cliëntportaal - Vereenvoudigde Weergave

**Layout Verschillen:**
- **Sidebar:** Minder opties (Dashboard, Mijn Plan, Afspraken, Contact)
- **Taal:** Alles in B1-Nederlands
- **Acties:** Alleen read-only, geen edit buttons
- **Spindiagram:** Labels uitgeschreven ("Dagelijks leven" ipv "DLV")
- **Doelen:** Alleen cliënt-versies tonen
- **Interventies:** Uitleg in eenvoudige taal + waarom dit helpt

**Voorbeeld Doel in Cliëntportaal:**
```
┌───────────────────────────────────────┐
│ 💼 Werk                               │
│                                       │
│ Ik werk weer 4 dagen per week         │
│ zonder paniek te krijgen              │
│                                       │
│ Hoe gaat het?                         │
│ ██████░░░░ 60% behaald                │
│                                       │
│ Wat doen we?                          │
│ • Oefenen met werk-situaties          │
│ • Ontspanningstechnieken leren        │
│ • Stapje voor stapje opbouwen         │
│                                       │
│ Wanneer klaar?                        │
│ Over 4 weken (8 januari)              │
└───────────────────────────────────────┘
```

---

## 10. Bijlagen & Referenties

🎯 **Doel:** Bronnen koppelen voor context en consistentie.

### 10.1 Interne Documenten

**Project Management:**
- [Mission Control / Build Plan](./bouwplan-ai-speedrun-v1.md) - Wekelijkse planning
- [FO v2.0](./fo-mini-ecd-v2.md) - Functioneel Ontwerp complete EPD
- [TO v1.2](./to-mini-ecd-v1_2.md) - Technisch Ontwerp (database, API)
- [UX Stylesheet](./ux-stylesheet.md) - Kleuren, typography, componenten
- [API Access Document](./api-acces-mini-ecd.md) - Claude API setup

**Eerdere PRD's:**
- [PRD AI Prefill Behandelplan v1](./prd-ai-prefill-behandelplan-v1.md) - Eerste versie
- [PRD Behandelplan v1.1](./prd-behandelplan-v1_1-leefgebieden.md) - Met leefgebieden

---

### 10.2 Externe Bronnen

**GGZ Richtlijnen & Standaarden:**
- [Multidisciplinaire Richtlijnen GGZ](https://www.ggzrichtlijnen.nl/) - Evidence-based interventies
- [DSM-5](https://www.psychiatrie.nl/dsm-5) - Diagnostische classificatie
- [FHIR CarePlan Resource](http://hl7.org/fhir/careplan.html) - Technische standaard
- [ROM in GGZ](https://www.ggzstandaarden.nl/rom) - Routine Outcome Monitoring

**AI & Prompting:**
- [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering) - Best practices
- [Claude API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api) - Technical reference

**UX/UI Resources:**
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility guidelines
- [Recharts Documentation](https://recharts.org/en-US/) - Spindiagram library
- [B1-taalniveau criteria](https://www.cito.nl/kennis-en-innovatie/leesniveaus/b1-taal) - Nederlandse taalstandaard

---

### 10.3 Tools & Libraries

**Frontend:**
- Next.js 15 (React framework)
- TailwindCSS + shadcn/ui (styling)
- Recharts (spindiagram)
- Tiptap (rich text editor)

**Backend:**
- Supabase (database + auth)
- Claude 3.5 Sonnet API (AI generation)
- PostgreSQL (data storage)

**Development:**
- pnpm (package manager)
- TypeScript (type safety)
- Playwright (E2E testing)

---

**Document Status:** Final v2.0  
**Volgende Review:** Na Week 3 development  
**Eigenaar:** Colin van Zeeland  
**Contact:** colin@ikbenlit.nl
