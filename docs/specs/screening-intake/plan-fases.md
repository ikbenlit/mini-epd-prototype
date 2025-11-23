# 📋 Screening & Intake – Fasenplan

Dit document geeft een beknopt overzicht van de resterende werkpakketten, opgesplitst in fasen en subfasen. Het vult het bestaande implementatieplan aan met een snel te scannen roadmap.

## Fase 0 – Schema & Deploy (on hold)
- 0.1: Supabase migration repair (wacht tot maintenance klaar is)
- 0.2: `supabase db pull/push` + seeds
- 0.3: Smoke-tests (`curl /api/fhir` en `/api/intakes`)

## Fase 1 – Screening (afgerond)
- 1.1: Activiteitenlog + hulpvraag (gereed)
- 1.2: Document upload/store (gereed)
- 1.3: Screeningsbesluit + status sync + verwijsbrief-warning (gereed)

## Fase 2 – Intake Details (huidige focus)
- 2.1: Routing + tab shells (gereed)
- 2.2: Contactmomenten (CRUD op `encounters`)
- 2.3: Kindcheck JSONB editor
- 2.4: Risicotaxaties (`risk_assessments`)
- 2.5: Anamnese, Onderzoeken, ROM editors
- 2.6: Diagnoses & behandeladvies (TipTap, metadata)
- 2.7: Intake kaarten uitbreiden met contactcount/diagnose/status

## Fase 3 – Diagnose & Advies verdieping
- 3.1: Validaties + DSM-code helpers
- 3.2: Workflow “intake afronden” (checkbox + status change)
- 3.3: Koppeling naar behandelplan-tab

## Fase 4 – QA & Roll-out
- 4.1: Regressietests + documentatie update
- 4.2: Accessibility/contrast check
- 4.3: Release notes, training, screenshot-updates

Gebruik dit document als snelle referentie; details en acceptatiecriteria blijven in `implementatieplan-screening-intake.md` staan.
