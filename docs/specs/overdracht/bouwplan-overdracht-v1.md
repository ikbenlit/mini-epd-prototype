# Mission Control - Bouwplan Overdracht Dashboard

**Projectnaam:** Verpleegkundige Overdracht Dashboard
**Versie:** v1.0
**Datum:** 05-12-2024
**Auteur:** Colin Lit

---

## 1. Doel en context

**Doel:** Een werkend MVP bouwen van het Overdracht Dashboard met Dagregistratie Module. Verpleegkundigen kunnen snel patiëntinformatie overzien en met AI-hulp een beknopte overdracht genereren in 30 seconden.

**Context:**
- Verpleegkundigen doen gemiddeld 6 overdrachten per dag
- Huidige workflow is tijdrovend en foutgevoelig
- Dit dashboard bundelt vitals, rapportages, dagnotities en risico's
- AI genereert gestructureerde samenvattingen met bronverwijzingen

**Relatie met andere documenten:**
- PRD: `prd-overdracht-dashboard-v1.md` - scope en requirements
- FO: `fo-overdracht-dashboard-v1.1.md` - functionele specificatie
- TO: `to-overdracht-dashboard-v1.md` - technische architectuur

---

## 2. Uitgangspunten

### 2.1 Technische Stack

| Component | Technologie | Status |
|-----------|-------------|--------|
| Frontend | Next.js 15 (App Router) | Bestaand |
| Backend | Next.js API Routes | Bestaand |
| Database | Supabase (PostgreSQL) | Bestaand |
| AI | Claude claude-sonnet-4-20250514 (Anthropic) | Bestaand |
| Styling | TailwindCSS + shadcn/ui | Bestaand |
| Validation | Zod | Bestaand |
| Auth | Supabase Auth + RLS | Bestaand |

### 2.2 Projectkaders

- **Nieuwe dependencies:** Geen (alles aanwezig)
- **Database:** 1 nieuwe tabel (`nursing_logs`)
- **Routes:** 2 nieuwe secties (`/epd/overdracht/`, `/epd/dagregistratie/`)
- **API endpoints:** 5 nieuwe endpoints
- **Data:** Demo data beschikbaar (patients, encounters, reports)

### 2.3 Programmeer Uitgangspunten

**Code Quality Principles:**
- **DRY:** Hergebruik bestaande componenten (Card, Badge, AIButton)
- **KISS:** Eenvoudige Server Components waar mogelijk
- **SOC:** API logic in `/api/`, UI in `/app/epd/`, types in `/lib/types/`
- **YAGNI:** Alleen MVP features, geen "nice to have"

**Bestaande Patterns:**
- AI integratie: `app/api/behandelplan/generate/route.ts`
- CRUD API: `app/api/reports/route.ts`
- Form components: `app/epd/patients/[id]/screening/`
- Card layouts: `components/ui/card.tsx`

---

## 3. Epics & Stories Overzicht

| Epic ID | Titel | Doel | Status | Stories | Complexiteit |
|---------|-------|------|--------|---------|--------------|
| E0 | Database Setup | nursing_logs tabel + RLS | ⏳ To Do | 2 | Laag |
| E1 | API Nursing Logs | CRUD endpoints voor dagnotities | ⏳ To Do | 2 | Laag |
| E2 | API Overdracht | Endpoints voor overdracht data + AI | ⏳ To Do | 3 | Middel |
| E3 | Dagregistratie UI | Quick entry module | ⏳ To Do | 3 | Middel |
| E4 | Overdracht Overzicht | Patiënten grid | ⏳ To Do | 2 | Middel |
| E5 | Overdracht Detail | Info blokken + AI samenvatting | ⏳ To Do | 4 | Middel |
| E6 | Integratie & Polish | Sidebar, navigatie, testing | ⏳ To Do | 3 | Laag |

**Totaal:** 19 stories

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 - Database Setup
**Epic Doel:** nursing_logs tabel aanmaken met RLS policies en indexes.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E0.S1 | nursing_logs tabel aanmaken | Tabel bestaat met alle kolommen uit TO, indexes aanwezig | ⏳ | - | 2 |
| E0.S2 | RLS policies implementeren | SELECT/INSERT/UPDATE/DELETE policies actief, alleen eigen logs muteerbaar | ⏳ | E0.S1 | 2 |

**Technical Notes:**
- Migratie via `npx supabase migration new create_nursing_logs`
- Kolommen: id, patient_id, shift_date, timestamp, category, content, include_in_handover, created_by
- Categories: medicatie, adl, gedrag, incident, observatie

---

### Epic 1 - API Nursing Logs
**Epic Doel:** CRUD endpoints voor dagnotities.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E1.S1 | GET/POST /api/nursing-logs | Ophalen per patient+date, aanmaken met Zod validatie | ⏳ | E0.S2 | 3 |
| E1.S2 | PATCH/DELETE /api/nursing-logs/[id] | Update eigen logs, soft delete | ⏳ | E1.S1 | 2 |

**Technical Notes:**
- Pattern volgen van `app/api/reports/route.ts`
- Zod schema: CreateNursingLogSchema, UpdateNursingLogSchema
- shift_date automatisch bepalen op basis van timestamp

---

### Epic 2 - API Overdracht
**Epic Doel:** Endpoints voor overdracht overzicht, detail en AI generatie.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E2.S1 | GET /api/overdracht/patients | Retourneert patiënten met encounters vandaag + alert counts | ⏳ | E0.S2 | 3 |
| E2.S2 | GET /api/overdracht/[patientId] | Retourneert patient + vitals + reports + logs + risks + conditions | ⏳ | E1.S1 | 5 |
| E2.S3 | POST /api/overdracht/generate | AI samenvatting met bronverwijzingen, logging naar ai_events | ⏳ | E2.S2 | 5 |

**Technical Notes:**
- E2.S2: Parallel queries via Promise.all()
- E2.S3: Pattern van `behandelplan/generate`, nieuwe prompt in `lib/ai/overdracht-prompt.ts`
- AI output: { samenvatting, aandachtspunten[], actiepunten[] }

---

### Epic 3 - Dagregistratie UI
**Epic Doel:** Quick entry module voor verpleegkundige notities.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E3.S1 | Dagregistratie page | Route `/epd/dagregistratie/[patientId]`, lijst van notities vandaag | ⏳ | E1.S2 | 3 |
| E3.S2 | Quick entry form | Categorie dropdown, tijd, tekst (max 500), overdracht checkbox | ⏳ | E3.S1 | 5 |
| E3.S3 | Edit/Delete functionality | Inline edit, confirm delete dialog | ⏳ | E3.S2 | 3 |

**Technical Notes:**
- Icons per categorie: Pill (medicatie), Utensils (adl), User (gedrag), AlertTriangle (incident), FileText (observatie)
- Kleuren: red (incident), blue (medicatie), green (adl), purple (gedrag), gray (observatie)
- Optimistic UI updates

---

### Epic 4 - Overdracht Overzicht
**Epic Doel:** Grid van patiënten met alerts voor overdracht.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E4.S1 | Overdracht overzicht page | Route `/epd/overdracht/`, grid van PatientCards, filter tabs | ⏳ | E2.S1 | 5 |
| E4.S2 | PatientCard component | Naam, leeftijd, alert badge (rood=hoog risico), doorklik | ⏳ | E4.S1 | 3 |

**Technical Notes:**
- Filter tabs: "Alle patiënten", "Met alerts"
- Alert count = high_risk_count + abnormal_vitals_count + marked_logs_count
- Responsive grid: 1 col mobile, 2 col tablet, 3-4 col desktop

---

### Epic 5 - Overdracht Detail
**Epic Doel:** Patiënt detail pagina met informatieblokken en AI samenvatting.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E5.S1 | Overdracht detail page | Route `/epd/overdracht/[patientId]`, patient header, 2-kolom layout | ⏳ | E2.S2 | 3 |
| E5.S2 | Info blokken: Vitals + Reports | VitalsBlock (metingen vandaag), ReportsBlock (24u) | ⏳ | E5.S1 | 5 |
| E5.S3 | Info blokken: Logs + Risks | NursingLogsBlock (gemarkeerd), RisksBlock (actief) | ⏳ | E5.S2 | 5 |
| E5.S4 | AI Samenvatting blok | AIButton "Genereer samenvatting", loading state, output met bronnen | ⏳ | E2.S3, E5.S3 | 5 |

**Technical Notes:**
- Linker kolom: Vitals, Reports, Logs, Risks (scrollable)
- Rechter kolom: AI Samenvatting (sticky)
- Bronverwijzingen klikbaar naar originele record
- Empty states per blok

---

### Epic 6 - Integratie & Polish
**Epic Doel:** Sidebar link, navigatie en testing.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afh. | SP |
|----------|--------------|---------------------|--------|------|----|
| E6.S1 | Sidebar uitbreiden | "Overdracht" link in EPD sidebar met alert badge | ⏳ | E4.S1 | 1 |
| E6.S2 | Navigatie links | Link van dagregistratie naar overdracht en vice versa | ⏳ | E5.S3 | 2 |
| E6.S3 | Smoke testing | Alle flows werken, geen console errors, performance OK | ⏳ | E6.S2 | 3 |

**Technical Notes:**
- Sidebar icon: ClipboardList (lucide)
- Badge toont totaal aantal alerts
- Test met bestaande demo patients

---

## 5. Kwaliteit & Testplan

### Test Types

| Test Type | Scope | Verantwoordelijke |
|-----------|-------|-------------------|
| Manual Testing | Alle flows | Developer |
| TypeScript | Type checking | Build process |
| RLS Testing | Database policies | Developer |

### Manual Test Checklist

**Dagregistratie:**
- [ ] Nieuwe notitie aanmaken werkt
- [ ] Categorie selectie werkt
- [ ] "Opnemen in overdracht" checkbox werkt
- [ ] Edit notitie werkt
- [ ] Delete notitie werkt (met confirm)
- [ ] Lijst refresht na mutatie

**Overdracht Overzicht:**
- [ ] Grid toont patiënten met encounters vandaag
- [ ] Alert badges tonen correct aantal
- [ ] Filter "Met alerts" werkt
- [ ] Doorklik naar detail werkt

**Overdracht Detail:**
- [ ] Patient header toont naam, leeftijd, diagnose
- [ ] Vitals blok toont metingen vandaag (of empty state)
- [ ] Reports blok toont laatste 24u (of empty state)
- [ ] Nursing logs blok toont gemarkeerde notities
- [ ] Risks blok toont actieve risico's
- [ ] AI samenvatting genereert binnen 5 sec
- [ ] Bronverwijzingen in AI output zijn correct

**Performance:**
- [ ] Overzicht laadt < 2 sec
- [ ] Detail laadt < 1.5 sec
- [ ] AI response < 5 sec

---

## 6. Succescriteria (uit PRD)

- [ ] Overzicht laadt binnen 2 seconden
- [ ] Patiënt detail toont alle 6 informatieblokken correct (incl. dagnotities)
- [ ] Dagregistratie form submit < 1 seconde
- [ ] AI samenvatting genereert binnen 5 seconden
- [ ] AI output is begrijpelijk en medisch relevant
- [ ] AI integreert dagnotities correct in samenvatting
- [ ] Navigatie tussen overzicht, detail en dagregistratie werkt vlot
- [ ] Alerts (hoog risico, afwijkende vitals, gemarkeerde notities) zijn direct zichtbaar
- [ ] Empty states bij ontbrekende data zijn informatief

---

## 7. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| AI samenvatting te lang/vaag | Middel | Hoog | Strikte prompt, max tokens, testen |
| Geen vitale functies in systeem | Hoog | Laag | Graceful empty state |
| Performance bij veel data | Laag | Middel | Indexes, parallel queries |
| AI hallucinaties | Laag | Hoog | Bronverwijzingen verplicht |
| VPK vergeet notities markeren | Middel | Middel | UI hint, standaard checkbox |

---

## 8. Niet in Scope (MVP)

| Feature | Reden |
|---------|-------|
| Medicatie-invoer | Alleen weergave, aparte module |
| Historische trends | Geen grafieken |
| PDF export | Komt later |
| Notificaties | Geen realtime alerts |
| Multi-afdeling | Te complex |
| Rechten per rol | Beperkt onderscheid VPK/arts |

---

## 9. Referenties

### Mission Control Documents

| Document | Status |
|----------|--------|
| PRD Overdracht Dashboard v1.0 | Gereed |
| FO Overdracht Dashboard v1.1 | Gereed |
| TO Overdracht Dashboard v1.0 | Gereed |
| Bouwplan v1.0 | Gereed (dit document) |

### Code Locaties

| Wat | Locatie |
|-----|---------|
| AI prompt pattern | `lib/ai/behandelplan-prompt.ts` |
| API route pattern | `app/api/reports/route.ts` |
| shadcn components | `components/ui/` |
| EPD layout | `app/epd/layout.tsx` |
| Sidebar | `app/epd/components/epd-sidebar.tsx` |

---

## 10. Glossary

| Term | Betekenis |
|------|-----------|
| Overdracht | Mondelinge/schriftelijke informatieoverdracht tussen diensten |
| VPK | Verpleegkundige |
| Dagnotitie | Korte registratie tijdens dienst (nursing_log) |
| Alert | Signaal voor aandacht (hoog risico, afwijking, incident) |
| Handover | Engelse term voor overdracht |

---

## Changelog

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 05-12-2024 | Colin | Initieel bouwplan gebaseerd op PRD, FO en TO |
