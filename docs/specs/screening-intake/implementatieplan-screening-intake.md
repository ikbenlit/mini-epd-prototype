# 📆 Gefaseerd Implementatieplan — Screening & Intake

Dit plan bouwt voort op het Functioneel Ontwerp (`fo-screening-intake-v1_0.md`) en het bouwplan (`bouwplan-screening-intake-v1.0.md`). Elk faseblok beschrijft scope, deliverables, afhankelijkheden en validatie zodat duidelijk is wanneer een epic “Done” mag worden verklaard.

---

## Fase 0 — Schema & Migratie Align (Week 0) 🟡 _(plan klaar, uitvoering wacht op Supabase maintenance)_
**Scope:** Repo en Supabase in sync brengen met de documentatie.
- 🟢 Migreer `docs/archive/migrations/20251122-supabase-scheme.sql` naar echte SQL-migraties in `supabase/migrations/`.
- 🟡 Voer migraties uit op alle omgevingen; documenteer eventuele datafixes (oude `clients` → `patients`).
- 🟢 Update `docs/migratie-clients-naar-patients.md` met runbook + status (RLS tests, API-doc, console-checks).
- 🟡 Valideer met `supabase db diff` en korte CRUD smoke-test op `/api/intakes` zodra maintenance voorbij is.

✅ **DoD:** Schone installaties krijgen identiek schema, API’s werken lokaal, documentatie verwijst naar juiste migratiebestanden.

---

## Fase 1 — Screening Module (E3) (Week 1) 🟢 _(document upload + warning actief)_
**Scope:** UI + opslag voor activiteitenlog, documentbeheer, hulpvraag en screeningsbesluit.
- 🟢 Backend: CRUD server actions + `/api/screenings` endpoints volgens FO §4.3 en data model FO §10.2–10.4.
- 🟢 Frontend: activiteitenlog, hulpvraag en document upload/delete live.
- 🟢 Statuskoppeling van screeningsbesluit naar `patients.status` geïmplementeerd.
- 🟢 UX-warning bij ontbrekende verwijsbrief vóór besluit.

✅ **DoD:** Alle vier secties functioneel, bestanden worden opgeslagen, statusbadge in header verandert correct, manual test checklist items “Screening doorlopen” en “Besluit nemen” afgevinkt.

---

## Fase 2 — Intake Details (E5) (Week 2–3) 🟢 _(routing + CRUD opgezet)_
**Scope:** Alle intake-subtabs uit FO §4.4.4–4.4.10 inclusief nieuwe tabroutes.
- 🟢 Routing child routes (`/contacts`, `/kindcheck`, `/risk`, `/anamnese`, `/onderzoeken`, `/rom`, `/diagnose`, `/behandeladvies`).
- 🟢 Contactmomenten UI/CRUD op `encounters`.
- 🟢 Kindcheck & Risicotaxaties formulieren (JSONB + `risk_assessments`).
- 🟢 Anamnese/Onderzoeken/ROM tabfunctionaliteit (gedeelde component + Supabase mutaties).
- 🟢 Diagnoses (`conditions`) en Behandeladvies (`intakes.treatment_advice`).
- 🟡 Intakekaart metrics (#contactmomenten, diagnoses, status “bezig/afgerond”).

✅ **DoD:** Alle tabs renderen data uit DB, formulieren schrijven terug, status `bezig/afgerond` sluit aan op FO §8.3, manual checklist items “Intake starten”, “Contactmoment toevoegen” en “Intake afronden” geslaagd.

---

## Fase 3 — Diagnose & Behandeladvies (E6) (Week 4) 🟡 _(metadata + tiptap live, diagnose nog te doen)_
**Scope:** DSM-5 diagnose registratie, behandeladvies en statuskoppeling.
- 🔧 Diagnose tab: CRUD op `conditions`/`diagnoses` tabel met validatie (code + omschrijving + ernst). Ondersteun sortering/primair/secundair.
- 🟢 Behandeladvies tab: TipTap editor + metadata-paneel (datum, psycholoog, afdeling, zorgprogramma, behandelaar).
- 🟡 Afrondingsworkflow: checkbox “Intake afronden” + vervolgkeuze (in zorg / doorverwijzen / extra diagnostiek), automatisch einddatum zetten en intake-status -> `afgerond`.
- 🟢 Koppeling naar behandelplan: button/link om advies door te zetten naar tab “Behandelplan”.
- 🟢 Voorbereiding spraak-naar-tekst: editor accepteert vrije tekst + placeholders.

✅ **DoD:** Diagnoses zichtbaar in intake-overzicht + diagnose tab, behandeladvies opslaan + locking, status-flow getest inclusief notifications/toasts.

---

## Fase 4 — QA, Documentatie & Roll-out (Week 5) 🔵 _(Nog te doen)_
**Scope:** Validatie, handover en support.
- Testmatrix: volledige regressie over cliëntenlijst, screening, intake tabs, diagnose & advies; documenteer in `docs/testing/screening-intake-regressie.md`.
- Accessibility & contrast check via `scripts/test-contrast.ts` (voor nieuwe UI-blokken).
- Bijwerken van FO/bouwplan/changelog met “v1.1” status + screenshots.
- Training/handover: korte Loom of stappenplan voor behandelaars/secretaresses.

✅ **DoD:** Alle open checkboxen in `docs/migratie-clients-naar-patients.md` en bouwplan test checklist afgevinkt; release notes vermeld live datum en bekende risico’s.

---

## Overkoepelende aandachtspunten
- **Data consistentie:** Reuse Supabase RLS policies; voer `supabase tests` of handmatige RLS-checks per fase.
- **Roles & rechten (prototype):** Houd basisrolstatus aan (secretaresse vult screening, psycholoog intake), maar focus op UX-flows; fijnmazige autorisatie volgt later.
- **Status uniformiteit:** Gebruik overal dezelfde enumeraties (`planned/active/finished/cancelled` voor patiënten, `bezig/afgerond` voor intakes). Update UI-badges en API’s in Fase 1.
- **DX:** Houd server actions/API’s symmetrisch (FHIR vs Custom) en documenteer nieuwe endpoints onder `docs/api/`.
