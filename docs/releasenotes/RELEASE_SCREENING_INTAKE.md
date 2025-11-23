# Release Notes – Screening & Intake (Preview)

## Highlights
- Screening-tab compleet: activiteitenlog, hulpvraag en documentupload draaien volledig; screeningsbesluit synchroniseert automatisch de patiëntstatus en waarschuwt bij ontbrekende verwijsbrief.
- Intake-detailtabs gerealiseerd: contactmomenten, kindcheck, risicotaxatie, anamnese, onderzoeken/ROM, diagnose en behandeladvies hebben elk hun eigen CRUD-flow met Supabase.
- Behandeladvies heeft nu een TipTap-editor met sectie-suggesties, metadata-paneel (datum, psycholoog, afdeling, zorgprogramma) en afrondingsworkflow (checkbox + vervolgopties) inclusief link naar de behandelplan-tab.

## Known Issues / TODO
- Supabase maintenance blokkeert voorlopig de `migration repair/db push` stappen; uitvoeren zodra maintenance klaar is.
- Diagnose-tab mist nog validatie voor DSM-code + sortering; staat gepland in Fase 3.
- Intakekaarten tonen nog geen contact/diagnose-tellers en statusbadges (“bezig/afgerond”); volgt na data-analyse.

## QA & Ops
- Frontend/CRUD flows zijn handmatig getest; lint faalt nog door ontbrekend `eslint-config-next/core-web-vitals`.
- Ops-log geüpdatet in `docs/release/ops-log.md`.
- Nieuwe API-docs onder `docs/api/intakes-api.md`.
