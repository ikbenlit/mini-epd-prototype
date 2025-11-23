## 2025-11-23 — Clients → Patients datafix + seeds (Colin)
- Clients die na de hoofdrelease nog in `clients` stonden opgespoord met `clients LEFT JOIN patients` sanity check (Supabase SQL editor)
- Idempotente blok uit `20241121_migrate_legacy_to_fhir.sql` opnieuw gedraaid zodat alle ontbrekende clients nu als patients bestaan
- Verification DO-block uitgevoerd zodat de teller op 0 missing clients staat en de migratie gelogd
- Default organisatie opnieuw gezaaid met `pnpm tsx scripts/seed-organization.ts` (env geladen via `.env.local`)

## 2026-02-XX — Screening Intake Fase 1 & 2 (Colin)
- TipTap placeholder hints toegevoegd + styled zodat behandeladvies-sectie guidance toont
- Metadata-sectie, afrondingsworkflow en behandelaarselecties bouwden de behandeladvies-tab af
- Intake-tabs (contact, kindcheck, risico, anamnese, onderzoeken/ROM, diagnose, behandeladvies) compleet met Supabase CRUD
- Status dropdowns gecorrigeerd (bezig/afgerond) en dokument flows afgerond
- Supabase migratiestappen wachten nog op einde maintenance (fase 0 runbook ligt klaar)

## 2025-11-23 — Universele Rapportage backend + modal (Colin)
- API: `/api/reports` (GET/POST) + `/api/reports/[reportId]` (GET/PATCH/DELETE) + `/api/reports/classify` staan, met Zod-validatie en soft delete
- Supabase: `reports` tabel + migratie + RLS policies uitgerold, types toegevoegd in `lib/supabase/database.types.ts`
- Server actions: `app/epd/patients/[id]/rapportage/actions.ts` + gedeelde `lib/server/api-client.ts` houden fetch logic DRY
- UI: shadcn-dialog gebaseerd Rapportage Modal met textarea, speech recorder, AI-analyse en save flow (E2.S1)

## 2025-11-23 — ClientSidebar duplicate cleanup (Colin)
- **Bug fix**: Dubbele sidebar (EPDSidebar + ClientSidebar) in patient detail routes verwijderd
- ClientSidebar (`app/epd/patients/[id]/components/client-sidebar.tsx`) blijkt 100% duplicate van EPDSidebar Level 2 navigatie
- EPDSidebar is al context-aware: detecteert patient routes en switcht automatisch tussen Level 1 (behandelaar) en Level 2 (patient) navigatie
- Verwijderd: ClientSidebar component (117 regels) + EPDLayoutClient wrapper (conditionele sidebar hiding)
- Vereenvoudigd: patient detail layout gebruikt nu alleen PatientLayoutClient zonder eigen sidebar rendering
- Resultaat: Eén sidebar component die automatisch switcht, -117 regels duplicate code, DRY principle hersteld

## 2025-11-23 — EPDHeader patient selector cleanup (Colin)
- **Bug fix**: Dubbele patient naam in UI (EPDHeader top bar + ClientHeader) verwijderd
- Design conflict ontstaan tijdens parallel development: EPDHeader (Epic 1) en ClientHeader (Epic 2) toonden beide patient naam
- EPDHeader's patient selector (center section met naam, ID, geboortedatum) was redundant na toevoegen ClientHeader
- Verwijderd: Patient fetch logic (useState, useEffect), patient selector UI, onnodige imports uit EPDHeader
- Component ownership verduidelijkt: EPDHeader = algemene navigatie (logo, search), ClientHeader = patient context (naam, status, acties)
- Resultaat: EPDHeader vereenvoudigd van 91 naar 34 regels (-57 regels), duidelijke separation of concerns

## 2025-11-23 — Reports created_by foreign key fix (Colin)
- **Bug fix**: Foreign key constraint violation bij opslaan rapportages
- Probleem: `reports.created_by` had FK constraint naar `practitioners.id`, maar code sloeg `auth.uid()` op
- Root cause: Practitioners tabel heeft `user_id` kolom, maar alle demo records hebben `user_id: null` (geen link naar auth users)
- Error: `insert or update on table "reports" violates foreign key constraint "reports_created_by_fkey"`
- Oplossing (prototype): Foreign key constraints verwijderd voor `created_by` en `updated_by` kolommen
- Migratie: `20251123_fix_reports_created_by_constraint.sql` toegepast via Supabase MCP
- Resultaat: Rapportages kunnen nu opgeslagen worden met auth user ID zonder FK constraint
- **Note voor productie**: In productie zou je practitioners.user_id vullen en FK constraints herstellen voor data integriteit

