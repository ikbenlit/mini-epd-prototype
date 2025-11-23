# QA Checklist — Universele Rapportage Split View

Use this checklist to validate Epic 3 (Integration & Testing). Test op zowel desktop (≥1280px) als mobiel (<1024px, devtools responsive).

## Happy Flow (Voice)
- [ ] Klik “Nieuwe rapportage” in header → composer scrollt in view.
- [ ] Start spraakopname, spreek 2+ zinnen, stop opname → transcript staat in textarea.
- [ ] Klik “Analyseer met AI” → badge toont type + confidence (>0.8).
- [ ] Klik “Opslaan” → toast verschijnt, KPI + timeline updaten, composer reset.

## Happy Flow (Manual)
- [ ] Navigeer naar composer via header of tabs (mobiel).
- [ ] Typ >20 karakters tekst, klik “Analyseer” → AI stelt type voor.
- [ ] Pas type handmatig aan, klik “Opslaan” → timeline toont nieuwe entry met correct type.

## Override / Referentie
- [ ] Selecteer bestaande timeline-entry → referentiekaart verschijnt.
- [ ] Klik “Voeg referentie toe” → quote block met meta + link wordt ingevoegd.

## Error Scenarios
- [ ] Deepgram offline (simulate network offline voor `/api/deepgram/transcribe`) → composer toont fout + instructie; user kan gewoon typen.
- [ ] Claude offline (abort `/api/reports/classify`) → composer toont toast + fallback type `vrije_notitie`.
- [ ] Save error (force 500 via devtools) → destructieve toast + draft blijft behouden.

## Autosave & Draft
- [ ] Typ tekst, wacht 1s → “Automatisch opgeslagen HH:MM” verschijnt.
- [ ] Refresh pagina → inhoud & type hersteld uit draft.
- [ ] Opslaan → draft wordt verwijderd, indicator reset.

## Filters & Timeline
- [ ] Zoekveld filtert op content en AI-redenaties.
- [ ] Type-, auteur-, datumfilters en AI-chips werken gecombineerd; resetknop herstelt alles.
- [ ] “Meer rapportages laden” voegt extra entries toe; selectie blijft behouden na delete.

## Mobile Drawer
- [ ] Tabs tonen “Timeline” en “Nieuwe rapportage”; active tab heeft shadow.
- [ ] Wissel tabs → selectie/draft blijft behouden.
- [ ] “← Terug naar timeline” knop beschikbaar in composer-tab.

## Performance Spot Checks
- [ ] Composer scroll/focus <100 ms (Chrome DevTools Performance).
- [ ] GET/POST `/api/reports` binnen targets (<500ms / <800ms p95) op lokaal stack.

Documenteer resultaten + eventuele bugs in ops-log.
