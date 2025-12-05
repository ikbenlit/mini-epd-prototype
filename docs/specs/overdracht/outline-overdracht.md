# Verpleegkundige Overdracht Dashboard

## Implementatieplan

### Stap 1: PRD aanmaken
Maak folder en PRD bestand:
- `docs/specs/overdracht/prd-overdracht-dashboard-v1.md`

### Stap 2: Implementatie (na PRD)
Zie technisch plan onderaan.

---

## PRD Content (te schrijven naar docs/specs/overdracht/prd-overdracht-dashboard-v1.md)

```markdown
# 📄 Product Requirements Document (PRD) – Verpleegkundige Overdracht Dashboard

**Projectnaam:** Verpleegkundige Overdracht Dashboard
**Versie:** v1.0
**Datum:** 05-12-2024
**Auteur:** Colin Lit

---

## 1. Doelstelling

Een dashboard voor verpleegkundigen die dagelijks meerdere overdrachten doen aan artsen. Het dashboard bundelt alle relevante patiëntinformatie (metingen, rapportages, medicatie, risico's) in overzichtelijke blokken en biedt een AI-functie om automatisch een beknopte overdracht-samenvatting te genereren.

**Focus:** Snelheid en efficiëntie - verpleegkundigen hebben weinig tijd en moeten snel de juiste informatie kunnen vinden en overdragen.

**Type:** MVP/Prototype met AI-integratie

---

## 2. Doelgroep

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

### 3.1 Niveau 1: Behandelaar Overzicht
1. **Patiëntenlijst:** Grid van alle actieve patiënten met afspraken/encounters vandaag
2. **Quick Stats per patiënt:** Naam, leeftijd, aantal alerts, recente activiteit
3. **Filter op alerts:** Toon alleen patiënten met hoog risico of afwijkende metingen
4. **Doorklik naar detail:** Navigatie naar patiënt-specifiek overdracht scherm

### 3.2 Niveau 2: Patiënt Detail
5. **Informatieblokken:**
   - **Vitale functies:** Metingen van vandaag (bloeddruk, hartslag, temperatuur, O2, ademhaling)
   - **Rapportages:** Recente notities en observaties (laatste 24 uur)
   - **Medicatie:** Huidige medicatie en recente wijzigingen *(placeholder voor MVP)*
   - **Risico's:** Actieve risicotaxaties met ernst-niveau

6. **AI Samenvatting Blok:**
   - Eén compact blok met "Genereer samenvatting" knop
   - AI genereert beknopte overdracht op basis van alle informatieblokken
   - Output: samenvatting (max 3 zinnen) + aandachtspunten + actiepunten
   - Kan opnieuw gegenereerd worden bij nieuwe data

### 3.3 AI Integratie
7. **Overdracht Generator:**
   - Input: vitals + reports + risks + diagnoses
   - Output: gestructureerde JSON met samenvatting, aandachtspunten, actiepunten
   - Taal: Nederlands, zakelijk, beknopt
   - Markering van urgente zaken met [URGENT]

---

## 4. Gebruikersflows

### Flow 1: Dagelijkse Overdracht
1. Verpleegkundige opent Overdracht pagina
2. Ziet grid van alle patiënten voor vandaag
3. Filtert eventueel op "Met alerts"
4. Klikt op patiënt voor detail view
5. Bekijkt informatieblokken (vitals, reports, risico's)
6. Klikt "Genereer samenvatting"
7. AI maakt beknopte overdracht
8. Verpleegkundige gebruikt samenvatting voor mondelinge/schriftelijke overdracht

### Flow 2: Snelle Check bij Alert
1. Verpleegkundige ziet rode badge op patiënt-card (hoog risico)
2. Klikt direct door naar detail
3. Ziet welke vitale functies afwijkend zijn
4. Checkt bijbehorende rapportages
5. Neemt direct actie of escaleert

---

## 5. Niet in Scope

- **Medicatie-invoer:** Alleen weergave, geen CRUD (aparte module)
- **Multi-afdeling view:** Alleen eigen patiënten
- **Historische trends:** Geen grafieken of lange termijn overzichten
- **Notificaties/push:** Geen realtime alerts
- **Print/export:** Geen PDF of print functionaliteit
- **Rechten per rol:** Geen onderscheid verpleegkundige/arts (komt later)

---

## 6. Succescriteria

- [ ] Overzicht laadt binnen 2 seconden
- [ ] Patiënt detail toont alle 4 informatieblokken correct
- [ ] AI samenvatting genereert binnen 5 seconden
- [ ] AI output is begrijpelijk en medisch relevant
- [ ] Navigatie tussen overzicht en detail werkt vlot
- [ ] Alerts (hoog risico, afwijkende vitals) zijn direct zichtbaar

---

## 7. Risico's & Mitigatie

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| AI samenvatting te lang/vaag | Hoog | Strikte prompt met max lengte, testen met echte data |
| Geen vitale functies in systeem | Middel | Graceful empty state, instructie om metingen toe te voegen |
| Medicatie tabel bestaat niet | Middel | Placeholder blok met "Binnenkort beschikbaar" |
| Performance bij veel patiënten | Middel | Parallel queries, pagination indien nodig |

---

## 8. Roadmap / Vervolg (Post-MVP)

- **Fase 2:** Medicatie module met volledige CRUD
- **Fase 3:** Trend grafieken voor vitale functies over tijd
- **Fase 4:** Export naar PDF voor formele overdracht
- **Fase 5:** Integratie met agenda (koppeling encounters)
- **Fase 6:** Notificaties bij kritieke waarden

---

## 9. Bijlagen & Referenties

- **Bestaande AI integratie:** `/app/api/behandelplan/generate/route.ts` (prompt pattern)
- **Database schema:** `observations`, `reports`, `risk_assessments` tabellen
- **UI componenten:** `/components/ui/ai-button.tsx`, Card components
- **Gerelateerde docs:** `docs/specs/ai-integratie/`, `docs/design/datamodel-documentatie.md`
```

---

## Technisch Plan (na PRD goedkeuring)

### Route Structuur
```
/epd/overdracht/               → Level 1: Overzicht
/epd/overdracht/[patientId]    → Level 2: Detail
```

### Te maken bestanden
1. `docs/specs/overdracht/prd-overdracht-dashboard-v1.md` (PRD)
2. `/lib/types/handover.ts` (types)
3. `/app/epd/overdracht/actions.ts` (server actions)
4. `/app/epd/overdracht/page.tsx` (overzicht)
5. `/app/epd/overdracht/[patientId]/page.tsx` (detail)
6. `/app/api/overdracht/generate/route.ts` (AI endpoint)
7. `/components/overdracht/*.tsx` (UI componenten)
8. Update `/app/epd/components/epd-sidebar.tsx` (navigatie)
