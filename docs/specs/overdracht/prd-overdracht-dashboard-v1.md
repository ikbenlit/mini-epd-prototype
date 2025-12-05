# 📄 Product Requirements Document (PRD) – Verpleegkundige Overdracht Dashboard

**Projectnaam:** Verpleegkundige Overdracht Dashboard
**Versie:** v1.0
**Datum:** 05-12-2024
**Auteur:** Colin Lit

---

## 1. Doelstelling

🎯 **Doel:** Een dashboard voor verpleegkundigen die dagelijks meerdere overdrachten doen aan artsen. Het dashboard bundelt alle relevante patiëntinformatie (metingen, rapportages, medicatie, risico's) in overzichtelijke blokken en biedt een AI-functie om automatisch een beknopte overdracht-samenvatting te genereren.

**Focus:** Snelheid en efficiëntie - verpleegkundigen hebben weinig tijd en moeten snel de juiste informatie kunnen vinden en overdragen.

**Type:** MVP/Prototype met AI-integratie

> Een verpleegkundige doet gemiddeld 6 overdrachten per dag aan artsen. Met dit dashboard kan zij in 30 seconden een complete overdracht genereren, inclusief AI-samenvatting met aandachtspunten en actiepunten.

---

## 2. Doelgroep

🎯 **Doel:** Schets wie de eindgebruikers, stakeholders en testers zijn.

**Primaire gebruikers:**
- **Verpleegkundigen (GGZ):** Doen ~6 overdrachten per dag aan artsen/collega's. Hebben behoefte aan snel overzicht van patiëntstatus, wijzigingen en aandachtspunten.

**Secundaire gebruikers:**
- **Artsen:** Ontvangen de overdracht, willen beknopte maar complete informatie.
- **Teamleiders:** Overzicht van alle patiënten en eventuele alerts.

**Kernbehoeften:**
- Snel overzicht van alle patiënten die overgedragen moeten worden
- Per patiënt: vitale functies, recente notities, medicatie, risico's
- AI-hulp om overdracht samen te vatten in 30 seconden

---

## 3. Kernfunctionaliteiten (MVP-scope)

🎯 **Doel:** Afbakenen van de minimale werkende functies.

### 3.1 Niveau 1: Behandelaar Overzicht (`/epd/overdracht/`)

| # | Functie | Beschrijving |
|---|---------|--------------|
| 1 | **Patiëntenlijst** | Grid van alle actieve patiënten met afspraken/encounters vandaag |
| 2 | **Quick Stats per patiënt** | Naam, leeftijd, aantal alerts, recente activiteit |
| 3 | **Filter op alerts** | Toon alleen patiënten met hoog risico of afwijkende metingen |
| 4 | **Doorklik naar detail** | Navigatie naar patiënt-specifiek overdracht scherm |

### 3.2 Niveau 2: Patiënt Detail (`/epd/overdracht/[patientId]`)

| # | Functie | Beschrijving |
|---|---------|--------------|
| 5 | **Vitale functies blok** | Metingen van vandaag (bloeddruk, hartslag, temperatuur, O2, ademhaling) |
| 6 | **Rapportages blok** | Recente notities en observaties (laatste 24 uur) |
| 7 | **Medicatie blok** | Huidige medicatie en recente wijzigingen *(placeholder voor MVP)* |
| 8 | **Risico's blok** | Actieve risicotaxaties met ernst-niveau |
| 9 | **AI Samenvatting blok** | Compact blok met "Genereer samenvatting" knop |

### 3.3 AI Integratie

| # | Functie | Beschrijving |
|---|---------|--------------|
| 10 | **Overdracht Generator** | AI genereert beknopte overdracht op basis van alle informatieblokken |
| 11 | **Gestructureerde output** | Samenvatting (max 3 zinnen) + aandachtspunten + actiepunten |
| 12 | **Urgentie markering** | Urgente zaken gemarkeerd met [URGENT] |

---

## 4. Gebruikersflows (Demo- of MVP-flows)

🎯 **Doel:** Laten zien hoe de gebruiker stap-voor-stap door het systeem gaat.

### Flow 1: Dagelijkse Overdracht

```
1. Verpleegkundige opent Overdracht pagina
2. Ziet grid van alle patiënten voor vandaag
3. Filtert eventueel op "Met alerts"
4. Klikt op patiënt voor detail view
5. Bekijkt informatieblokken (vitals, reports, risico's)
6. Klikt "Genereer samenvatting"
7. AI maakt beknopte overdracht
8. Verpleegkundige gebruikt samenvatting voor mondelinge/schriftelijke overdracht
```

### Flow 2: Snelle Check bij Alert

```
1. Verpleegkundige ziet rode badge op patiënt-card (hoog risico)
2. Klikt direct door naar detail
3. Ziet welke vitale functies afwijkend zijn
4. Checkt bijbehorende rapportages
5. Neemt direct actie of escaleert
```

---

## 5. Niet in Scope

🎯 **Doel:** Duidelijk maken wat (nog) niet wordt gebouwd.

| Feature | Reden exclusie |
|---------|----------------|
| Medicatie-invoer | Alleen weergave, CRUD is aparte module |
| Multi-afdeling view | Te complex voor MVP, alleen eigen patiënten |
| Historische trends | Geen grafieken of lange termijn overzichten |
| Notificaties/push | Geen realtime alerts |
| Print/export | Geen PDF of print functionaliteit |
| Rechten per rol | Geen onderscheid verpleegkundige/arts (komt later) |
| Metingen invoer | Aparte functionaliteit, hier alleen weergave |

---

## 6. Succescriteria

🎯 **Doel:** Objectieve meetlat voor een geslaagde oplevering.

- [ ] Overzicht laadt binnen 2 seconden
- [ ] Patiënt detail toont alle 4 informatieblokken correct
- [ ] AI samenvatting genereert binnen 5 seconden
- [ ] AI output is begrijpelijk en medisch relevant
- [ ] Navigatie tussen overzicht en detail werkt vlot
- [ ] Alerts (hoog risico, afwijkende vitals) zijn direct zichtbaar
- [ ] Empty states bij ontbrekende data zijn informatief

---

## 7. Risico's & Mitigatie

🎯 **Doel:** Risico's vroeg signaleren en plannen hoe ermee om te gaan.

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| AI samenvatting te lang/vaag | Hoog | Strikte prompt met max lengte, testen met echte data |
| Geen vitale functies in systeem | Middel | Graceful empty state, instructie om metingen toe te voegen |
| Medicatie tabel bestaat niet | Middel | Placeholder blok met "Binnenkort beschikbaar" |
| Performance bij veel patiënten | Middel | Parallel queries, pagination indien nodig |
| Risico's gekoppeld aan intake ipv patient | Laag | Query via intake tabel |

---

## 8. Roadmap / Vervolg (Post-MVP)

🎯 **Doel:** Richting geven aan toekomstige uitbreidingen.

| Fase | Feature | Beschrijving |
|------|---------|--------------|
| 2 | Medicatie module | Volledige CRUD voor medicatie |
| 3 | Trend grafieken | Vitale functies over tijd |
| 4 | PDF export | Formele overdracht documenten |
| 5 | Agenda integratie | Koppeling met encounters/afspraken |
| 6 | Notificaties | Alerts bij kritieke waarden |
| 7 | Multi-afdeling | Overzicht meerdere afdelingen |

---

## 9. Bijlagen & Referenties

🎯 **Doel:** Bronnen koppelen voor context en consistentie.

### Bestaande Code Patterns

| Pattern | Locatie | Hergebruik voor |
|---------|---------|-----------------|
| AI integratie | `/app/api/behandelplan/generate/route.ts` | Overdracht generator |
| Server actions | `/app/epd/patients/[id]/behandelplan/actions.ts` | Data fetching |
| Card components | `/components/ui/card.tsx` | Informatieblokken |
| AI Button | `/components/ui/ai-button.tsx` | Genereer knop |

### Database Tabellen

| Tabel | Gebruik |
|-------|---------|
| `observations` | Vitale functies (FHIR-compliant) |
| `reports` | Rapportages/notities |
| `risk_assessments` | Risico's (via intakes) |
| `conditions` | Diagnoses |
| `patients`, `encounters` | Basis data |

### Gerelateerde Documentatie

- FO (Functioneel Ontwerp) – *nog te schrijven*
- TO (Technisch Ontwerp) – *nog te schrijven*
- `docs/specs/ai-integratie/` – AI prompt patterns
- `docs/design/datamodel-documentatie.md` – Database schema

---

## Changelog

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 05-12-2024 | Colin | Initieel PRD |
