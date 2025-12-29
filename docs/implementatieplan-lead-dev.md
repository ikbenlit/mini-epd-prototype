# Implementatieplan - codebase stabilisatie (lead dev)

Datum: 2025-12-29
Owner: lead dev
Status: draft

## Doel
De codebase consistent, voorspelbaar en onderhoudbaar maken, met focus op build stabiliteit,
duidelijke type-sources en het verwijderen van dubbele of ongebruikte onderdelen.

## Context en uitgangspunten
- We beperken de scope tot stabilisatie en onderhoud (geen nieuwe features).
- Geen nieuwe dependencies of migraties zonder expliciet akkoord.
- Kleine, reviewbare changes per fase om regressies te beperken.
- Types en docs moeten dezelfde bron van waarheid volgen.

## Scope
In scope:
- Build en styling configuratie normaliseren.
- Supabase types en documentatie harmoniseren.
- Archief routes uit app/ halen of expliciet isoleren.
- Duplicaten en ongebruikte onderdelen opruimen.
- Validatie en minimale guardrails toevoegen.

Out of scope:
- Nieuwe UI features of redesigns.
- Grote database schema wijzigingen.
- Performance tuning buiten concrete issues.

## Beslissingen nodig (voor start)
1) Tailwind stack: v3 of v4, en welke PostCSS config blijft.
2) Canonical supabase types file en generator (database.types.ts vs types.ts).
3) Definitieve plek voor archief code (buiten app/ of in docs/).

## Fase 0 - Alignment en inventarisatie (0.5 dag)
Doel: scope en keuzes vastleggen.
Taken:
- Keuzes bevestigen voor Tailwind, Supabase types en archief locatie.
- Afbakening van bestanden die we willen behouden of verwijderen.
Acceptatiecriteria:
- Keuzes vastgelegd in dit document (beslissingen sectie bijgewerkt).

## Fase 1 - Build en styling cleanup (1-2 dagen)
Doel: 1 bron van waarheid voor PostCSS en Tailwind.
Taken:
- Dubbele PostCSS config verwijderen en 1 config overhouden.
- Tailwind dependency set consistent maken met gekozen versie.
- globals.css.backup status bepalen (verwijderen of archiveren buiten app/).
Acceptatiecriteria:
- Build gebruikt 1 PostCSS config en 1 Tailwind variant.
- Geen dubbele of conflicterende CSS entrypoints.

## Fase 2 - Supabase types en docs (1 dag)
Doel: types en documentatie in sync.
Taken:
- Canonical types file kiezen.
- scripts en docs bijwerken zodat generator naar de juiste file schrijft.
- lib/supabase/index.ts export laten verwijzen naar de gekozen types file.
Acceptatiecriteria:
- types:generate schrijft naar de gekozen file.
- Alle imports verwijzen naar dezelfde type bron.
- Docs verwijzen naar dezelfde workflow.

## Fase 3 - Routing hygiene en archief (1-2 dagen)
Doel: legacy code niet meer routable in Next.
Taken:
- app/epd/_archive verplaatsen buiten app/ (bijv. docs/ of archive/).
- Eventuele redirect routes behouden in app/ waar nodig.
- Verwijzingen in docs updaten naar nieuwe archief locatie.
Acceptatiecriteria:
- Geen /epd/_archive routes in runtime.
- Legacy code blijft beschikbaar voor referentie buiten app/.

## Fase 4 - Duplicaten en ongebruikte onderdelen (1 dag)
Doel: dubbele helpers en ongebruikte componenten verwijderen of consolideren.
Taken:
- period-utils consolideren en importen alignen.
- rapportage-workspace vs rapportage-workspace-v2 keuze vastleggen en opruimen.
- Snelle scan voor overige duidelijke duplicaten met lage impact.
Acceptatiecriteria:
- Een set period utils met consistente API.
- Geen ongebruikte componenten in hoofdpad.

## Fase 5 - Validatie en guardrails (0.5-1 dag)
Doel: minimale zekerheid dat we niets breken.
Taken:
- pnpm lint en pnpm build draaien.
- Handmatige QA op kernflows (login, patients, rapportage, agenda).
- Documenteren van checks in CHANGELOG of korte release note.
Acceptatiecriteria:
- Lint en build groen.
- Handmatige checks gedocumenteerd.

## Risicos en mitigatie
- Build regressies door Tailwind switch -> kleine PRs en snelle rollback.
- Type regressies door types file wijziging -> importen met rg checken.
- Archief code nog nodig -> verplaatsen ipv verwijderen.

## Definition of Done
- 1 build pipeline voor CSS (PostCSS + Tailwind).
- 1 canonical Supabase types file met up to date docs.
- Geen archief routes in app/ runtime.
- Duplicaten en unused code opgeruimd.
- Lint/build groen en QA notes beschikbaar.

## Open vragen
- Welke Tailwind versie heeft voorkeur?
- Welke types file is de bron van waarheid?
- Waar moet archief code definitief landen?
