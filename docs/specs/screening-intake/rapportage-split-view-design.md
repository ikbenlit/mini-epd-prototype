# Universele Rapportage — Split Timeline Composer

Context: gesprek met behandelaren/psychiaters toonde dat rapportages schrijven en overzicht houden tegelijk nodig is. Deze mock beschrijft een layout waarbij timeline en composer gelijktijdig zichtbaar blijven.

## UX Principes

1. **Context behouden** – timeline altijd zichtbaar; geen modal die context blokkeert.
2. **Snelle wissel** – klik op entry synchroniseert composer en toont referenties.
3. **Mobiele pariteit** – tabs/drawer zodat schrijven en lezen in één flow blijft.
4. **State veilig** – concepten autosaven; switching verliest content niet.

## Desktop Mock

```
┌───────────────────────────────┬───────────────────────────────┐
│ Timeline kolom (40%)          │ Composer kolom (60%)          │
│ ┌────────── Rapportage filter │ ┌──────────── Nieuwe rapportage│
│ │ Zoeken  [🔍___________]     │ │ Emma de Vries • Vrije notitie│
│ │ Type   [• Alle ▼]          │ │ ---------------------------   │
│ └──────────────────────────── │ │ [textarea................]   │
│ ┌── Entry ─────────────────── │ │ AI badge + dropdown         │
│ │ 09:12 • Sophie (AI 92%)    │ │ Rapportagetype [▼]          │
│ │ Behandeladvies snippet     │ │ Speech recorder + attach    │
│ └──────────────────────────── │ │ Footer: Opslaan • Analyseer │
│ Scrollbare lijst met badges  │ │ Sticky action bar           │
└───────────────────────────────┴───────────────────────────────┘
```
- Clicking an entry previews full text in a slide-out panel or inline expansion.
- Filters (type, author, date) pin to top of timeline.
- Composer sticky footer shows save status + autosave timestamp.

## Mobile Mock

```
┌──────────────┐
│ Tabs         │
│ [Timeline] [Rapportage+] │
├──────────────┤
│ Timeline tab │
│ cards stack  │
└────┬─────────┘
     ▼ swipe up opens composer drawer
┌──────────────┐
│ Rapportage   │
│ textarea     │
│ AI panel     │
│ Save / AI btn│
└──────────────┘
```
- Drawer covers 75% height so top timeline remains slightly visible.
- Swipe down or "Terug naar timeline" button closes drawer without losing draft.

## Interacties

- **Select entry → composer reference**: clicking "Referentie toevoegen" inserts a quote block with metadata (author, time).
- **Autosave badge**: top-right of composer shows "Automatisch opgeslagen 13:42".
- **AI context chips**: timeline entries show AI confidence badges; clicking them filters timeline by type.

## Open vragen

1. Hoeveel entries tonen we per pagina? (voorstel: 50 + virtuele scroll)
2. Benodigd? inline edit van bestaande rapportages? (nu read-only)
3. Notificatie bij gelijktijdig schrijven door meerdere behandelaren?

Deze mock dient als richting voor UI implementatie; visuele uitwerking kan in Figma plaatsvinden met shadcn/ui componenten.

## Actieplan

1. **UX refinement**  
   - Bouw Figma-variant voor desktop split view en mobiele drawer.  
   - Valideer met 2 behandelaren of de voorgestelde flows voldoen.

2. **Component architectuur**  
   - Refactor rapportage route naar layout met `TimelinePane` + `ComposerPane`.  
   - Introduceer context/state voor draft + selectie (bijv. `useReportDraft`).

3. **Timeline functionaliteit**  
   - Implement filters (zoek, type, auteur, datum).  
   - Voeg inline preview/slide-out voor entries toe.  
   - Onderzoek virtualized list (React Virtual) voor >50 items.

4. **Composer upgrades**  
   - Sticky footer met status + autosave indicator.  
   - "Referentie toevoegen" waarmee geselecteerde entry als quote block wordt ingevoegd.  
   - Drawer/tab ervaring op mobiel.

5. **State & autosave**  
   - Drafts opslaan in localStorage of Supabase temp table.  
   - Toon laatste autosave + unsaved changes waarschuwing bij navigeren.

6. **Testing & rollout**  
   - Schrijf QA checklist (desktop/mobile).  
   - Monitor gebruikersfeedback tijdens pilot, focus op contextswitch-snelheid.
