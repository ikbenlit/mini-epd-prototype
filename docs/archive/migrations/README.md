# Archived Migrations & Schema Snapshots

Deze directory bevat migrations en schema snapshots die niet meer actief gebruikt worden als migrations, maar behouden blijven voor referentie.

## Schema Snapshots

Deze bestanden zijn **niet bedoeld om uit te voeren** als migrations, maar dienen als documentatie van het huidige database schema:

- **`20251122-current-db-scheme.sql`** - Snapshot van database schema (2025-11-22)
- **`20251122-supabase-scheme.sql`** - Actueel database schema snapshot (2025-11-22)

⚠️ **Waarschuwing:** Deze bestanden bevatten een WARNING dat ze niet uitgevoerd moeten worden. Ze zijn alleen voor documentatie/referentie doeleinden.

## Test Files

- **`20241115000003_test_rls_policies.sql`** - Test queries voor RLS policies verificatie (niet een echte migration)

## Waarom gearchiveerd?

Deze bestanden zijn gearchiveerd omdat:
1. Ze geen echte migrations zijn (snapshots/test files)
2. Ze niet uitgevoerd moeten worden door Supabase CLI
3. Ze alleen voor documentatie/referentie dienen
4. Ze de migrations directory vervuilen

## Actieve Migrations

Actieve migrations staan in `/supabase/migrations/` en worden uitgevoerd door Supabase CLI.

