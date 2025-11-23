# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed - 2025-11-22

#### Route Consolidatie: `/clients/` → `/patients/`

**Migratie:** Consolideer beide routes naar één FHIR-compliant `/patients/` route met Custom API voor Intakes.

**Wijzigingen:**
- **Routes:** Alle `/epd/clients/*` routes zijn gemigreerd naar `/epd/patients/*`
  - `/epd/clients` → `/epd/patients`
  - `/epd/clients/[id]` → `/epd/patients/[id]`
  - `/epd/clients/[id]/intakes` → `/epd/patients/[id]/intakes`
  - `/epd/clients/[id]/intakes/[intakeId]` → `/epd/patients/[id]/intakes/[intakeId]`

- **Backward Compatibility:** 
  - Catch-all redirect route toegevoegd: `/epd/clients/[...path]/route.ts`
  - Alle oude `/clients/` URLs worden automatisch doorgestuurd naar `/patients/`
  - Query parameters worden behouden tijdens redirects

- **Intake Module:**
  - Volledige Intake module gemigreerd van `/clients/` naar `/patients/`
  - Custom API geïmplementeerd: `/api/intakes`
  - Type definitions toegevoegd: `lib/types/intake.ts`
  - Server actions refactored naar API-based: `app/epd/patients/[id]/intakes/actions.ts`

- **Code Archive:**
  - Oude `/clients/` code gearchiveerd naar `app/epd/_archive/clients_backup_20251122/`
  - Alleen redirect routes blijven actief voor backward compatibility

**Breaking Changes:**
- Nieuwe code moet `/epd/patients/` routes gebruiken
- Oude `/epd/clients/` routes werken nog via redirects, maar worden deprecated

**Migration Guide:**
Zie `docs/migratie-clients-naar-patients.md` voor volledige migratie details.

**Files Changed:**
- `app/epd/patients/[id]/intakes/` - Nieuwe Intake module
- `app/epd/clients/[...path]/route.ts` - Catch-all redirect
- `app/epd/clients/page.tsx` - Root redirect
- `lib/types/intake.ts` - Type definitions
- `app/api/intakes/` - Custom API routes
- `docs/specs/UI/bouwplan-mini-epd-v1.0.md` - Route references updated

