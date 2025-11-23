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
