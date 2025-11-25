# 🧩 Functioneel Ontwerp (FO) – Real-Time Speech Transcription met Deepgram SDK

**Projectnaam:** Real-Time Speech Transcription
**Versie:** v2.0 (Editor-First Design)
**Datum:** 24-11-2025
**Auteur:** Claude Code (met input van Colin)

---

## 1. Doel en relatie met het PRD

🎯 **Doel van dit document:**
Dit Functioneel Ontwerp beschrijft de migratie van de huidige REST-based batch transcriptie naar real-time streaming transcriptie met de Deepgram SDK. Het document legt uit **hoe** de gebruiker (clinicus/behandelaar) de nieuwe real-time speech-to-text functionaliteit zal ervaren tijdens het dicteren van medische rapportages en behandelplannen.

📘 **Context:**
- **Huidige situatie:** Audio wordt opgenomen als blob, na opname geüpload en getranscribeerd (2-5+ seconden latency)
- **Nieuwe situatie:** Audio wordt real-time gestreamed via WebSocket, tekst verschijnt live tijdens het spreken (<500ms latency)
- **Belangrijkste verbetering:** Direct visuele feedback, professionele UX met waveform visualisatie, confidence indicators, en slimme auto-pause functionaliteit

📄 **Relatie tot andere documenten:**
- **Analyse:** `docs/specs/speech/analyse-deepgram.md` - Technische analyse van migratie impact
- **Implementatie:** Te ontwikkelen Technisch Ontwerp (TO)
- **Context:** Dit wordt gebruikt in Report Composer en Treatment Advice Form componenten

---

## 2. Overzicht van de belangrijkste onderdelen

De nieuwe real-time speech transcriptie bestaat uit de volgende hoofdonderdelen:

### Core Components
1. **Rapportage Editor (full-width)** - Primaire werkgebied voor het maken en bewerken van rapportages
2. **Speech Recorder Component (streaming)** - Inline opname met WebSocket verbinding
3. **Quick Action Buttons** - Snelle knoppen voor veelgebruikte rapportage types
4. **Timeline Sidebar (opt-in)** - Collapsible geschiedenis van rapportages
5. **Filters (on-demand)** - Verborgen, te openen via zoeken

### Speech Features
6. **Waveform Visualizer** - Real-time audio volume visualisatie
7. **Confidence Indicators** - Markering van onzekere woorden
8. **Smart Insertion Logic** - Veilig invoegen in bestaande teksten
9. **Auto-Pause Mechanisme** - Automatisch pauzeren na stilte
10. **Connection Status Indicator** - Visuele feedback van verbindingsstatus

### Backend
11. **Token Proxy Endpoint** - Veilige API key management (server-side)

---

## 3. User Stories

**User Story Template:**
> Als [rol/gebruiker] wil ik [doel of actie] zodat [reden/waarde].

### Primaire User Stories

| ID | Rol | Doel / Actie | Verwachte waarde | Prioriteit |
|----|------|---------------|------------------|-------------|
| US-01 | Behandelaar | Real-time tekst zien tijdens dicteren | Direct feedback, weet dat het werkt | Hoog |
| US-02 | Behandelaar | Waveform zien tijdens opname | Visual bevestiging dat microfoon werkt | Hoog |
| US-03 | Behandelaar | Onzekere woorden gemarkeerd zien | Kan direct corrigeren tijdens dicteren | Hoog |
| US-04 | Behandelaar | Veilig dicteren in bestaande rapportage | Geen risico op per ongeluk overschrijven | Hoog |
| US-05 | Behandelaar | Automatisch pauzeren na stilte | Voorkomt lange stiltes, natuurlijke workflow | Middel |
| US-06 | Behandelaar | Verbindingsstatus zien | Weet of transcriptie actief is | Middel |
| US-07 | Behandelaar | Pauzeren en hervatten zonder data verlies | Flexibele workflow, kan onderbreken | Middel |
| US-08 | Behandelaar | Partial transcript behouden bij fout | Verlies nooit werk, zelfs bij netwerkproblemen | Hoog |
| **US-09** | **Behandelaar** | **Snel nieuwe rapportage starten met quick button** | **Minder clicks, snellere workflow** | **Hoog** |
| **US-10** | **Behandelaar** | **Timeline alleen tonen als nodig** | **Geen afleiding tijdens schrijven** | **Hoog** |
| **US-11** | **Behandelaar** | **Eenvoudig bestaande rapportage bekijken en editen** | **Geen verwarring tussen view/edit modes** | **Hoog** |
| **US-12** | **Behandelaar** | **Filters alleen zien als ik zoek** | **Cleaner interface, minder overwhelm** | **Middel** |

### Uitgewerkte User Stories

**US-01: Real-time feedback**
> Als behandelaar wil ik de tekst real-time zien verschijnen tijdens het dicteren, zodat ik direct zie dat de transcriptie werkt en of medische termen correct worden herkend.

**US-04: Veilig dicteren**
> Als behandelaar wil ik veilig kunnen dicteren in een bestaande rapportage zonder risico op overschrijven, zodat ik vertrouwen heb dat mijn bestaande werk beschermd is.

**US-08: Data behoud**
> Als behandelaar wil ik dat mijn transcript behouden blijft als de verbinding wegvalt, zodat ik niet al mijn gedicteerde werk verlies bij netwerkproblemen.

**US-09: Quick actions (v2)**
> Als behandelaar wil ik met één klik een nieuwe "Vrije notitie" kunnen starten, zodat ik niet elke keer via een dropdown het type hoef te selecteren.

**US-10: Timeline opt-in (v2)**
> Als behandelaar wil ik de timeline alleen zien als ik ernaar zoek, zodat ik niet wordt afgeleid tijdens het schrijven van een nieuwe rapportage.

**US-11: Unified view/edit (v2)**
> Als behandelaar wil ik een rapportage kunnen openen om te lezen, en daarna direct kunnen editen zonder modal te sluiten en opnieuw te openen, zodat mijn workflow vloeiend blijft.

**US-12: Filters on-demand (v2)**
> Als behandelaar wil ik alleen filters zien als ik op 'Zoeken' klik, zodat mijn scherm niet vol staat met controls die ik zelden nodig heb.

---

## 4. Functionele werking per onderdeel

### 4.1 Rapportage Pagina Layout (Editor-First Design)

**Initiële staat - Editor focus (geen timeline zichtbaar):**
```
┌───────────────────────────────────────────────────────────────────┐
│ [< Cliënten] Jan de Vries  Screening  Geb: 18-11-1972       21:14│
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Nieuwe rapportage maken:                                         │
│  [+ Vrije notitie] [+ Intake] [+ Behandelplan] [Andere... ▼]    │
│                                                  [📋 Timeline]    │← Toggle
│                                                  [🔍 Zoeken]      │← Filters
│                                                                   │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Type: Vrije notitie                                              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ 🎤 Opname  ◯ Niet verbonden                           [⚙]  ││
│  │ [🎤 Start opname]                                            ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  Beschrijf wat je wilt vastleggen...                         ││
│  │                                                              ││
│  │                                                              ││
│  │                                                              ││
│  │                                                              ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│  [💾 Opslaan]  [🤖 Analyseer met AI ▼]                           │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Key principles v2:**
1. **Editor krijgt volledige breedte** - Geen split attention
2. **Timeline is opt-in** - Klik [📋 Timeline] om te openen
3. **Filters zijn hidden** - Klik [🔍 Zoeken] om te openen
4. **Quick actions bovenaan** - Common types als directe knoppen
5. **Focus op creatie** - Primary task is nieuwe rapportage maken

### 4.2 Quick Action Buttons

**Locatie:** Bovenaan editor, direct onder page header

**Gedrag:**
- Klik [+ Vrije notitie] → Start direct nieuwe vrije notitie (type pre-selected)
- Klik [+ Intake] → Start direct nieuw intake verslag
- Klik [+ Behandelplan] → Start direct nieuw behandelplan
- Klik [Andere... ▼] → Dropdown met alle andere types

**Visuele feedback na klik:**
```
┌───────────────────────────────────────────────────────────────┐
│ [+ Vrije notitie] [+ Intake] [+ Behandelplan] [Andere... ▼] │
│                     ↑ Active (emerald-500 background)        │
└───────────────────────────────────────────────────────────────┘

Editor updates naar:
  Type: Intake verslag ← Pre-selected
  [Textarea ready voor input]
```

**Smart defaults:**
- Onthoud laatste type (localStorage)
- Meest gebruikte types eerst (kan analytics-based worden)
- Voor 90% van use cases: 1 click om te starten

**Rationale:**
- 80/20 regel: Meeste users maken dezelfde 3-4 types rapportages
- Vermijdt dropdown navigeren elke keer
- Snellere workflow (1 vs 2 clicks)

### 4.3 Timeline Sidebar (Opt-In)

**Trigger:** Klik [📋 Timeline] button rechtsboven

**Layout met timeline open:**
```
┌──────────────────────────────────────┬──────────────────────────┐
│ RAPPORTAGE EDITOR                    │ 📋 TIJDLIJN        [✕]  │
│                                      │                          │
│ [+ Vrije notitie] [+ Intake] [...▼] │ [🔍] [_______________]   │← Search
│                                      │                          │
│ Type: Vrije notitie                  │ ┌──────────────────────┐│
│                                      │ │ 📄 Vrije notitie     ││
│ [🎤 Speech recorder...]              │ │ 23-11, 21:43         ││
│                                      │ │ Dit is de eerste...  ││
│ [Textarea...]                        │ │                      ││
│                                      │ │ [Bekijk rapport]     ││← Single action
│                                      │ └──────────────────────┘│
│ [Actions...]                         │                          │
│                                      │ ┌──────────────────────┐│
│                                      │ │ 📄 Intake verslag    ││
│                                      │ │ 22-11, 14:20         ││
└──────────────────────────────────────┴──────────────────────────┘
         70%                                   30%
```

**Gedrag:**
- Timeline slides in van rechts (300ms animation)
- Editor width shrinks naar 70% (smooth transition)
- Timeline is scrollbaar (independent scroll van editor)
- Klik [✕] → Timeline slides out, editor expands naar 100%

**Timeline Card Design:**
```
┌──────────────────────────────┐
│ 📄 Vrije notitie             │ ← Icon + type
│ 23-11-2025, 21:43            │ ← Timestamp
│ ongeveer 20 uur geleden      │ ← Relative time
│ ────────────────────────────  │
│ Dit is de eerste rapportage  │ ← Preview (first 2 lines)
│ voor Jan de Vries...         │
│                              │
│ [Bekijk rapport]             │ ← Single action (unified)
└──────────────────────────────┘
```

**Rationale - Single [Bekijk] button:**
- Geen [Bewerk] button meer (verwarrend)
- Klik rapport → Opens in modal (read mode)
- Modal heeft [✏️ Bewerken] knop als nodig
- Unified view/edit flow (zie sectie 4.6)

**State:**
- Timeline open/closed state opgeslagen in localStorage
- User preference persists tussen sessies
- Optional: Resizable divider (drag tussen editor en timeline)

### 4.4 Filters (On-Demand)

**Trigger:** Klik [🔍 Zoeken] button rechtsboven

**Gedrag optie A: Expandable filter bar**
```
Collapsed (default):
┌───────────────────────────────────────────┐
│ [+ Quick actions...]      [📋][🔍 Zoeken]│
└───────────────────────────────────────────┘

Klik [🔍 Zoeken] →

Expanded:
┌───────────────────────────────────────────────────────────┐
│ [+ Quick actions...]                      [📋][🔍 Zoeken]│
├───────────────────────────────────────────────────────────┤
│ 🔍 Filters                                                │
│ Type: [Alle ▼]  Auteur: [Alle ▼]  Van: [__]  T/m: [__]  │
│ AI: ○ Alles  ○ Met AI  ○ Handmatig        [Reset]       │
└───────────────────────────────────────────────────────────┘
```

**Gedrag optie B: Filter in timeline**
```
Timeline open + klik [🔍] in timeline header:
┌──────────────────────────┐
│ 📋 TIJDLIJN        [✕]  │
│                          │
│ [🔍] [_______________]   │← Search always visible in timeline
│                          │
│ [▼ Filters]              │← Expandable advanced filters
│                          │
│ [Rapportages...]         │
└──────────────────────────┘
```

**Aanbeveling: Optie B** (Filters in timeline sidebar)
- Filters zijn contextual bij timeline
- Niet op main editor (keeps editor clean)
- Timeline is toch al opt-in, filters zijn secondary to that

**Smart filter behavior:**
- Bij < 10 rapportages: Geen filters nodig, hide completely
- Bij > 10 rapportages: Toon [🔍] in timeline
- Search is fuzzy: zoekt in title, content, type

### 4.5 Speech Recorder Component (Inline, Compact)

**Initiële staat (niet aan het opnemen):**
```
┌──────────────────────────────────────────────────────────┐
│ 🎤 Opname  ◯ Niet verbonden                        [⚙]  │
│ [🎤 Start opname]                                        │
└──────────────────────────────────────────────────────────┘
```

**Gedrag bij klikken op "Start opname":**
1. Systeem vraagt microfoon permissie (indien nog niet gegeven)
2. Cursor springt automatisch naar einde van tekstveld
3. Status indicator wordt ◐ Geel "Verbinden..."
4. WebSocket verbinding wordt opgezet met Deepgram
5. Status wordt ● Groen "Verbonden & streaming"
6. Waveform visualisatie start
7. Tekst verschijnt live tijdens spreken

**Actieve opname staat:**
```
┌─────────────────────────────────────┐
│ Spraakopname                        │
│ ● Verbonden & streaming        [⚙]  │
│                                     │
│ De patiënt presenteert zich met     │ ← Final (zwart, normaal)
│ klachten van langdurige vermoeidh.. │ ← Interim (grijs, italic)
│                                     │
│ ━━━━━━━━●━━━━━━━━━━━━━━━━━         │ ← Waveform
│                                     │
│ [⏸ Pauzeer]  [⏹ Stop]              │
└─────────────────────────────────────┘
```

**Tekst differentiatie:**
- **Interim tekst** (real-time, nog niet definitief):
  - Kleur: `text-slate-500` (grijs)
  - Font-style: `italic`
  - Font-weight: `400` (normaal)
  - Wordt continu geüpdatet tijdens spreken

- **Final tekst** (definitief, na zinsbeëindiging):
  - Kleur: `text-slate-900` (zwart)
  - Font-style: `normal`
  - Font-weight: `500` (medium bold)
  - Locked in, wordt niet meer gewijzigd

**Animaties:**
- Nieuwe woorden fade in met 200ms ease-out
- Interim → Final transitie met 300ms spring animatie
- Smooth scroll naar nieuwste tekst

### 4.2 Waveform Visualizer

**Gedrag:**
- Canvas-based visualisatie (60fps)
- Toont audio volume in real-time
- Bar-style waveform zoals WhatsApp voice messages
- Smooth animaties met spring physics

**Visuele feedback:**
```
Stil:        ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁
Zacht:       ▂▃▂▁▂▃▂▁▂▃▂▁▂▃▂▁▂▃▂
Normaal:     ▄▅▆▅▄▃▄▅▆▅▄▃▄▅▆▅▄▃▄
Luid:        ▆▇█▇▆▅▆▇█▇▆▅▆▇█▇▆▅▆
```

**Kleuren:**
- Bars: `slate-700` (standaard)
- Active bar (huidige positie): `emerald-500`
- Tijdens stilte: bars worden transparanter

**Functie:**
- Visuele bevestiging dat microfoon audio oppikt
- Helpt gebruiker zien of ze hard genoeg spreken
- Professional uitstraling (zoals moderne opname-apps)

### 4.3 Confidence Indicators

**Wanneer getoond:**
- Alleen voor final tekst (niet voor interim)
- Automatisch voor woorden met confidence < 0.9

**Visuele markering:**

**High confidence (≥0.9):** Geen markering
```
De patiënt heeft een diagnose van GAD
```

**Medium confidence (0.7-0.9):** Gele onderstreping
```
De patiënt heeft een diagnose van ˜GAD˜
                                    ↑
                          Hover tooltip:
                          Zekerheid: 78%
```

**Low confidence (<0.7):** Oranje onderstreping + suggestie
```
De patiënt heeft een diagnose van ˜GAT˜
                                    ↑
                          Hover tooltip:
                          Zekerheid: 65%
                          Bedoelde je: GAD, gat?
                          Klik om te herhalen
```

**Interactie:**
- Hover over gemarkeerd woord → tooltip met confidence %
- Klik op woord → optie om dit deel opnieuw te dicteren
- Kan genegeerd worden (is alleen suggestie)

**Medische context:**
- Medische afkortingen worden automatisch CAPS (DSM, SSRI, GAD)
- Smart formatting voor Nederlandse interpunctie
- Patiëntnamen uit context (indien beschikbaar via props)

### 4.4 Smart Insertion Logic (Overschrijf-preventie)

**Probleem:** Gebruiker opent bestaande rapportage en wil dicteren → risico dat bestaande tekst overschreven wordt.

**Oplossing:** Automatische cursor-naar-einde + visuele feedback

**Flow bij starten opname:**

**Scenario A: Leeg tekstveld**
```
1. User klikt [Start opname]
2. Start direct met opnemen
3. Tekst verschijnt vanaf begin
```

**Scenario B: Bestaand tekst, cursor aan einde**
```
1. User klikt [Start opname]
2. Groen glow rond tekstgebied
3. Tekst verschijnt aan einde (waar cursor al stond)
```

**Scenario C: Bestaand tekst, cursor NIET aan einde**
```
1. User klikt [Start opname]
2. Cursor springt automatisch naar einde
3. Korte notificatie: "Cursor verplaatst naar einde"
4. Groen glow rond tekstgebied
5. Tekst verschijnt aan einde
```

**Visuele feedback tijdens dictaat:**
```
┌─────────────────────────────────────┐
│ Rapportage                          │ ← Groene border tijdens dictaat
│ [Bestaande tekst...]                │
│                                     │
│ [Live transcriptie hier...]         │
│ █ ← Cursor (groen bolletje)         │
│                                     │
│ 🟢 Aan het dicteren                 │
└─────────────────────────────────────┘
```

**CSS/Styling tijdens dictaat-modus:**
- Border: `border-emerald-500 border-2`
- Subtle glow: `shadow-emerald-500/20`
- Cursor indicator: Groen bolletje naast cursor

**Na stoppen:**
- Groene border verdwijnt
- Tekst blijft staan
- Cursor blijft op positie
- Gebruiker kan handmatig verder typen/editen

### 4.6 Unified View/Edit Modal (Bestaande Rapportages)

**Trigger:** Klik [Bekijk rapport] in timeline card

**Modal opent in Read mode (default):**
```
              ┌─────────────────────────────────────────┐
              │ Vrije notitie                           │
              │ 23-11-2025, 21:43                       │
              │                                          │
              │ [✏️] [📋 Dupliceer] [🗑] [✕]           │← Actions
              ├─────────────────────────────────────────┤
              │                                         │
              │ Dit is de eerste rapportage voor        │← Read-only content
              │ Jan de Vries op é plek.                │
              │                                         │
              │ [Content...]                            │
              │                                         │
              │                                         │
              ├─────────────────────────────────────────┤
              │                         [Sluiten]       │
              └─────────────────────────────────────────┘
```

**Klik [✏️ Bewerken] → Modal wordt editable:**
```
              ┌─────────────────────────────────────────┐
              │ Vrije notitie (bewerken)                │
              │ 23-11-2025, 21:43                       │
              │                                          │
              │ [💾] [❌] [✕]                            │← Edit actions
              ├─────────────────────────────────────────┤
              │ 🎤 Opname  ◯ Niet verbonden        [⚙] │← Speech recorder
              │ [🎤 Start opname om door te gaan]       │
              ├─────────────────────────────────────────┤
              │ ┌─────────────────────────────────────┐ │
              │ │ Dit is de eerste rapportage voor    │ │← Editable textarea
              │ │ Jan de Vries op é plek. █           │ │← Cursor
              │ │                                     │ │
              │ │ [Kan verder typen of dicteren...]   │ │
              │ └─────────────────────────────────────┘ │
              ├─────────────────────────────────────────┤
              │ [💾 Opslaan wijzigingen] [❌ Annuleren] │
              └─────────────────────────────────────────┘
```

**Flow:**
1. User kli

kt [Bekijk rapport] in timeline
2. Modal opent overlay over editor (70% width, centered)
3. **Default = Read mode:** Alleen lezen, geen edit
4. User klikt [✏️ Bewerken]:
   - Modal transformeert naar edit mode (smooth transition)
   - Speech recorder verschijnt bovenaan
   - Content wordt editable textarea
   - Actions veranderen naar [Opslaan]/[Annuleren]
5. User kan:
   - Typen in textarea
   - Dicteren via speech recorder (cursor gaat naar einde)
   - Klik [Opslaan] → Save + modal blijft open (success toast)
   - Klik [Annuleren] → Discard changes, terug naar read mode
   - Klik [✕] → Close modal (met unsaved warning indien nodig)

**Unsaved changes protection:**
```
User editeert text, klikt [✕] zonder te saven:

              ┌───────────────────────────────┐
              │ Niet opgeslagen wijzigingen   │
              │                               │
              │ Wil je de wijzigingen opslaan?│
              │                               │
              │ [💾 Opslaan]                  │
              │ [🗑 Verwijderen]              │
              │ [← Terug naar bewerken]       │
              └───────────────────────────────┘
```

**Rationale unified view/edit:**
- Gebruiker hoeft niet te raden: view of edit?
- Start altijd met lezen (meest voorkomend)
- Als edit nodig: 1 click [✏️]
- Same context, geen modal sluiten/heropenen
- Clear state: read icons vs edit icons

**Extra features in modal:**
- [📋 Dupliceer]: Kopieer rapport naar nieuwe rapportage in editor
- [🗑 Verwijder]: Delete rapport (met confirmation)
- Keyboard shortcuts: `E` = Edit, `Esc` = Close

### 4.7 Auto-Pause Mechanisme

**Trigger:** 3 seconden stilte (geen spraak gedetecteerd)

**Gedrag:**
1. Deepgram endpointing detecteert stilte
2. Na 3 seconden → automatisch pauzeren
3. WebSocket blijft verbonden (geen reconnect nodig)
4. Audio streaming stopt
5. UI update naar "gepauzeerd" staat

**Gepauzeerde staat:**
```
┌─────────────────────────────────────┐
│ Spraakopname                        │
│ ● Verbonden                    [⚙]  │
│                                     │
│ [Transcriptie tot nu toe...]        │
│                                     │
│ ⏸ Automatisch gepauzeerd            │
│    (3 seconden stilte)              │
│                                     │
│ [▶ Hervat opname]  [⏹ Stop]        │
└─────────────────────────────────────┘
```

**Hervatten:**
- Klik [▶ Hervat opname]
- Audio streaming start onmiddellijk (geen nieuwe verbinding)
- Waveform hervat
- Transcriptie gaat verder waar het stopte

**Voordelen:**
- Voorkomt lange stiltes in transcript
- Natuurlijke workflow (denken tijdens dicteren)
- Geen data verlies
- Geen reconnection overhead

**Configuratie:**
- Deepgram endpointing: `3000ms` (3 seconden)
- User kan niet handmatig instellen (fixed voor consistentie)

### 4.6 Connection Status Indicator

**Altijd zichtbaar** in rechterbovenhoek van component:

**Stati en kleuren:**

| Status | Icoon | Kleur | Betekenis |
|--------|-------|-------|-----------|
| Niet verbonden | ◯ | `text-slate-400` | Niet aan het opnemen |
| Verbinden... | ◐ | `text-amber-500` | WebSocket aan het opzetten |
| Verbonden | ● | `text-emerald-500` | Actief aan het streamen |
| Herverbinden... | ⚠ | `text-orange-500` | Netwerk probleem, aan het reconnecten |
| Fout | ✕ | `text-red-500` | Fout opgetreden |

**Interactie:**
- Geen interactie bij groen/grijs
- Bij oranje (herverbinden): toon "Herverbinden... transcript blijft behouden"
- Bij rood (fout): toon [Opnieuw proberen] button

**Fout scenario met recovery:**
```
┌─────────────────────────────────────┐
│ Spraakopname                        │
│ ✕ Verbinding verloren          [⚙]  │
│                                     │
│ [Transcript tot nu toe behouden]    │
│                                     │
│ ⚠ Netwerkfout: kon niet verbinden   │
│    met Deepgram                     │
│                                     │
│ [🔄 Opnieuw proberen]  [💾 Bewaar]  │
└─────────────────────────────────────┘
```

**Auto-reconnect logica:**
- Bij netwerk drop: automatisch 3x reconnect proberen
- Tussen pogingen: 1s, 2s, 4s backoff
- Audio wordt gebufferd tijdens reconnect
- Partial transcript altijd behouden
- Na 3 pogingen: toon manual retry button

### 4.7 Pause & Resume Controls

**Beschikbare acties tijdens opname:**

**[⏸ Pauzeer]** - Handmatig pauzeren
- Stopt audio streaming
- Behoudt WebSocket verbinding
- Transcript blijft zichtbaar
- Kan hervatten zonder data verlies

**[⏹ Stop]** - Definitief stoppen
- Stopt audio streaming
- Sluit WebSocket verbinding
- Transcript wordt naar parent component gestuurd (via `onTranscript` callback)
- Reset component naar initiële staat

**[▶ Hervat]** - Hervatten na pause
- Hervat audio streaming
- Gaat verder waar gestopt
- Geen nieuwe verbinding nodig

**Flow voorbeeld:**
```
[Start] → Opname loopt → [Pauzeer] → Gepauzeerd → [Hervat] → Opname loopt → [Stop] → Klaar
                            ↓
                      (na 3s stilte: auto-pause)
```

---

## 5. UI-overzicht (visuele structuur) - v2 Editor-First

### 5.1 Pagina Layout - Default (Geen Timeline)

**Editor heeft volledige breedte, focus op creatie:**

```
┌─────────────────────────────────────────────────────────────────────┐
│ [< Cliënten] Jan de Vries  Screening  Geb: 18-11-1972       21:14  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Nieuwe rapportage maken:                                           │
│  [+ Vrije notitie] [+ Intake] [+ Behandelplan] [Andere... ▼]      │
│                                                  [📋 Timeline]      │
│                                                  [🔍 Zoeken]        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Type: Vrije notitie                                                │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ 🎤 Opname  ● Verbonden & streaming                      [⚙]  ││
│  │ ━━━━━━━━●━━━━━━━━  [⏸ Pauzeer] [⏹ Stop]                     ││ ← Speech inline
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │                                                                ││
│  │  De patiënt presenteert zich met klachten van                  ││ ← Live tekst
│  │  langdurige vermoeidheid...                                    ││
│  │                                                                ││
│  │                                                                ││
│  │                                                                ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  [💾 Opslaan]  [🤖 Analyseer met AI ▼]                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                          100% width
```

### 5.2 Pagina Layout - Met Timeline Open

**Timeline sidebar rechts, editor links (70/30 split):**

```
┌──────────────────────────────────────┬──────────────────────────────┐
│ RAPPORTAGE EDITOR                    │ 📋 TIJDLIJN            [✕]  │
│                                      │                              │
│ [+ Vrije notitie] [+ Intake] [...▼] │ [🔍] [_______________]       │
│                                      │                              │
│ Type: Vrije notitie                  │ ┌──────────────────────────┐│
│                                      │ │ 📄 Vrije notitie         ││
│ ┌──────────────────────────────────┐ │ │ 23-11, 21:43             ││
│ │ 🎤 Opname ● Verbonden      [⚙] ││ │ │ Dit is de eerste...      ││
│ │ ━━━━●━━━ [⏸][⏹]              ││ │ │                          ││
│ └──────────────────────────────────┘ │ │ [Bekijk rapport]         ││
│                                      │ └──────────────────────────┘│
│ ┌──────────────────────────────────┐ │                              │
│ │ [Textarea met live tekst...]     ││ │ ┌──────────────────────────┐│
│ │                                  ││ │ │ 📄 Intake verslag        ││
│ │                                  ││ │ │ 22-11, 14:20             ││
│ └──────────────────────────────────┘ │ │ [Bekijk rapport]         ││
│                                      │ └──────────────────────────┘│
│ [💾][🤖 AI ▼]                        │                              │
│                                      │ [+ Nieuwe rapportage]        │
└──────────────────────────────────────┴──────────────────────────────┘
           70%                                    30%
```

### 5.3 Modal - View/Edit Unified

**Modal overlay (70% viewport width, centered):**

```
        ┌───────────────────────────────────────────────┐
        │ Vrije notitie                                 │
        │ 23-11-2025, 21:43                             │
        │                                               │
        │ [✏️ Bewerken] [📋 Dupliceer] [🗑] [✕]        │
        ├───────────────────────────────────────────────┤
        │                                               │
        │ Dit is de eerste rapportage voor              │← Read mode
        │ Jan de Vries op é plek.                      │
        │                                               │
        │ Lorem ipsum dolor sit amet...                 │
        │                                               │
        │                                               │
        ├───────────────────────────────────────────────┤
        │                              [Sluiten]        │
        └───────────────────────────────────────────────┘

                     ↓ Klik [✏️ Bewerken]

        ┌───────────────────────────────────────────────┐
        │ Vrije notitie (bewerken)                      │
        │ 23-11-2025, 21:43                             │
        │                                               │
        │ [💾 Opslaan] [❌ Annuleren] [✕]               │
        ├───────────────────────────────────────────────┤
        │ 🎤 Opname  ◯ Niet verbonden          [⚙]    │← Speech added
        │ [🎤 Start opname om door te gaan]             │
        ├───────────────────────────────────────────────┤
        │ ┌───────────────────────────────────────────┐ │
        │ │ Dit is de eerste rapportage voor          │ │← Editable
        │ │ Jan de Vries op é plek. █                │ │
        │ │                                           │ │
        │ │ Lorem ipsum dolor sit amet...             │ │
        │ └───────────────────────────────────────────┘ │
        ├───────────────────────────────────────────────┤
        │ [💾 Opslaan wijzigingen] [❌ Annuleren]       │
        └───────────────────────────────────────────────┘
```

### 5.4 Responsive Gedrag - v2

**Desktop (>1200px):**
- Full layout zoals hierboven
- Timeline 30%, Editor 70% (resizable optional)
- Modal 70% viewport width

**Laptop (1024px-1200px):**
- Timeline 35%, Editor 65%
- Modal 80% viewport width
- Quick actions blijven horizontaal

**Tablet (768px-1024px):**
- Timeline 40%, Editor 60%
- Of: Toggle tussen Timeline OR Editor (niet beide)
- Modal 90% viewport width
- Quick actions 2 regels (2x2 grid)

**Mobile (<768px):**
- Stack layout:
  - Header met patient info (sticky)
  - Quick actions (vertical stack of horizontal scroll)
  - Editor (full width)
  - Timeline in drawer (slide from bottom)
- Modal fullscreen
- Speech recorder compact (waveform smaller)

### 5.5 Interactie States

**Editor tijdens dictaat:**
- Groene border (`border-emerald-500`)
- Subtle glow (`shadow-emerald-500/20`)
- Cursor indicator groen bolletje

**Timeline card - Active (being edited in modal):**
- Emerald border (`border-emerald-500`)
- Emerald background (`bg-emerald-50/50`)
- Visual link naar open modal

**Quick action button - Active:**
- Emerald background (`bg-emerald-500`)
- White text (`text-white`)
- Bold font (`font-semibold`)

**Timeline sidebar - States:**
- Closed: Editor 100% width
- Opening: 300ms slide-in animation from right
- Open: Editor 70%, Timeline 30%
- Closing: 300ms slide-out animation to right
- Smooth width transitions on editor

### 5.6 Empty States

**Timeline leeg:**
```
┌────────────────────────────┐
│ 📋 TIJDLIJN          [✕]  │
│                            │
│   📄                       │
│   Nog geen rapportages     │
│                            │
│   Maak je eerste           │
│   rapportage in het        │
│   editor paneel →          │
│                            │
│                            │
│ [+ Nieuwe rapportage]      │
└────────────────────────────┘
```

**Editor zonder type selected:**
```
┌───────────────────────────────────┐
│  Kies een type om te beginnen:   │
│  [+ Vrije notitie] [+ Intake]    │
│  [+ Behandelplan] [Andere... ▼]  │
└───────────────────────────────────┘
```

---

## 6. Interacties met AI (functionele beschrijving)

### 6.1 AI Context voor Speech Transcription

**Deepgram AI features gebruikt:**

| Feature | Configuratie | Doel | User-facing impact |
|---------|--------------|------|-------------------|
| Live Streaming | WebSocket | Real-time audio verwerking | Tekst verschijnt tijdens spreken |
| Interim Results | `interim_results: true` | Voorlopige transcripties | Grijs/italic tekst live updates |
| Smart Format | `smart_format: true` | Auto punctuatie/capitalisatie | Nederlandse interpunctie correct |
| Endpointing | `endpointing: 3000` | Detecteer spraakpauzes | Auto-pause na 3 sec stilte |
| Language | `language: nl` | Nederlandse taal model | Correcte Nederlandse herkenning |
| Model | `model: nova-2` | Laatste Deepgram model | Beste accuracy voor Nederlands |
| Utterances | `utterances: true` | Word-level timestamps + confidence | Confidence indicators per woord |

### 6.2 Confidence Score Processing

**AI Output → UI Mapping:**

```javascript
// Deepgram stuurt per word:
{
  word: "gegeneraliseerde",
  confidence: 0.76,
  start: 1.234,
  end: 1.789
}

// UI toont:
"gegeneraliseerde" met gele onderstreping
Tooltip: "Zekerheid: 76%"
```

**Drempelwaarden:**
- ≥0.9: Geen markering (high confidence)
- 0.7-0.9: Gele onderstreping (medium confidence)
- <0.7: Oranje markering + suggestie (low confidence)

### 6.3 Medical Terminology Enhancement (toekomstig)

**Mogelijke AI uitbreidingen voor v2:**
- Custom medical dictionary voor Nederlandse GGZ termen
- Patient naam herkenning uit context
- DSM-5 classificatie auto-correct
- Medicatie namen CAPS formatting
- Sectie detectie ("Anamnese:", "Diagnose:", etc.)

**Niet in v1, maar voorbereid in architectuur**

---

## 7. Gebruikersrollen en rechten

**Voor deze feature:** Geen specifieke rol-differentiatie nodig.

**Aanname:**
- Alle behandelaars die toegang hebben tot Report Composer en Treatment Advice Form kunnen spraakopname gebruiken
- Geen aparte permissies voor speech-to-text
- Eventueel: audit logging van dictaat gebruik (in toekomst)

**Privacy overwegingen:**
- Audio wordt **niet** opgeslagen op onze servers
- Direct gestreamed naar Deepgram (SSL/TLS encrypted)
- Transcript wordt opgeslagen als onderdeel van rapportage/behandelplan (bestaand gedrag)
- Deepgram DPA (Data Processing Agreement) moet gecheckt worden voor GDPR/AVG compliance

---

## 8. Ontwerpkeuzes en Rationale - v2 Editor-First Design

### 8.1 Design Philosophy: v1 → v2 Evolution

**v1 Design (Afgewezen):**
- Side-by-side timeline (35%) en editor (65%)
- Filters altijd zichtbaar bovenaan
- [Bewerk] en [Bekijk] als aparte knoppen
- Type selector elke keer handmatig kiezen

**Problemen met v1 (uit design review):**
- **Split attention:** Gebruiker moet beide panelen monitoren
- **Afleiding:** Timeline zichtbaar tijdens schrijven
- **Complexity overload:** Filters, timeline, editor allemaal tegelijk
- **Verwarrende flows:** Bewerk vs Bekijk decision upfront
- **Slow workflow:** Te veel clicks voor veelvoorkomende taken

**v2 Design (Gekozen):**
- **Editor-first:** Full-width default, focus op creatie
- **Opt-in complexity:** Timeline/filters alleen als nodig
- **Unified view/edit:** Één knop, smooth transition
- **Quick actions:** 1-click voor common types

**Kernprincipes v2:**
1. **Primary task first** - Nieuwe rapportage maken is belangrijkste use case
2. **Progressive disclosure** - Toon features on-demand
3. **Minimize clicks** - Optimize voor 80% use cases
4. **No split attention** - Één focus area tegelijk

### 8.2 Besluit: Timeline Opt-In (Rechts Sidebar)

**Gekozen:** Timeline als collapsible sidebar rechts

**Rationale:**
- **Editor is primair** - Nieuwe rapportage maken > oude bekijken
- **Geen afleiding** - Timeline default closed tijdens schrijven
- **Context on-demand** - Klik [📋 Timeline] als referentie nodig
- **Rechts placement** - Sidebar pattern (zoals VS Code, Notion)

**Afgewezen alternatieven:**
- **Timeline links (v1):** Suggereert dat timeline primair is (niet waar)
- **Timeline altijd zichtbaar:** Leidt af, split attention
- **Timeline als tab:** Te veel context switching, verlies editor inhoud

**Design review insights:**
- ✅ Frontend dev: "Minder complex dan side-by-side sync"
- ✅ UX designer: "Opt-in vermindert cognitive load"
- ✅ End user: "Ik wil niet afgeleid worden tijdens dicteren"

### 8.3 Besluit: Quick Action Buttons

**Gekozen:** [+ Vrije notitie] [+ Intake] [+ Behandelplan] [Andere... ▼]

**Rationale:**
- **80/20 regel:** 3-4 types = 80% van gebruik
- **1 click start:** Geen dropdown navigation
- **Visual affordance:** Knoppen zijn duidelijker dan dropdown
- **Remembers last used:** Meest gebruikte type highlighted

**Data assumptions (te valideren):**
- Vrije notities: ~50% van rapportages
- Intake: ~25%
- Behandelplan: ~15%
- Overige: ~10%

**Design review insights:**
- ✅ End user: "Ik maak meestal vrije notities, dit bespaart clicks"
- ✅ UX designer: "Duidelijke affordances, geen verborgen functionaliteit"

### 8.4 Besluit: Unified View/Edit Modal

**Gekozen:** Single [Bekijk rapport] → Modal met [✏️ Bewerken] optie

**Rationale:**
- **No upfront decision:** Gebruiker hoeft niet te kiezen tussen view/edit
- **Natural flow:** Eerst lezen (meest common), dan editen als nodig
- **Same context:** Blijf in dezelfde modal, geen context loss
- **Clear states:** Read vs Edit visueel distinct

**Afgewezen alternative (v1):**
- **[Bewerk] + [Bekijk] buttons:** Verwarrend, user moet raden
- **Direct edit:** Te risicovol, per ongeluk wijzigingen

**Flow comparison:**

| Scenario | v1 (split buttons) | v2 (unified modal) |
|----------|------|------|
| Rapport lezen | Klik [Bekijk] → Modal | Klik [Bekijk] → Modal |
| Rapport editen | Klik [Bewerk] → Editor laadt | Klik [Bekijk] → [✏️] → Editeer in modal |
| Lezen, ziet fout, wil editen | [✕] Modal → [Bewerk] → Re-load | [✏️] → Direct editbaar (1 click) |

**v2 is beter:** Minder clicks voor "bekijken dan editen" flow (meest common)

**Design review insights:**
- ✅ End user: "Ik wil rapport eerst zien voordat ik edit"
- ✅ UX designer: "Unified flow is duidelijker, minder decision fatigue"
- ✅ Frontend dev: "Gemakkelijker state management, één component"

### 8.5 Besluit: Filters On-Demand (In Timeline)

**Gekozen:** Filters verborgen, alleen in timeline wanneer >10 rapportages

**Rationale:**
- **Most users don't need filters:** <10 rapportages per patiënt typisch
- **Contextual:** Filters horen bij zoeken in timeline, niet bij editor
- **Clean interface:** Geen onnodige controls
- **Smart detection:** Toon alleen als relevant

**Gedrag:**
- <10 rapportages: Geen filter UI, alleen search
- >10 rapportages: [▼ Filters] expand optie verschijnt
- Timeline closed: Filters niet zichtbaar (irrelevant)

**Afgewezen alternative (v1):**
- **Filters altijd zichtbaar bovenaan:** Neemt 60px ruimte, laag usage
- **Filters in main toolbar:** Not contextual, altijd in zicht

**Design review insights:**
- ✅ End user: "Ik heb 5 rapportages, waarom zie ik al die filters?"
- ✅ UX designer: "Progressive disclosure principle - toon als nodig"

### 8.6 Besluit: Speech Inline (Bij Textarea)

**Gekozen:** Speech recorder compact, direct boven textarea

**Rationale:**
- **Proximity:** Bij waar tekst verschijnt (usability principle)
- **Inline:** Geen popup/modal/sidebar
- **Compact:** ~80px height collapsed, ~120px expanded
- **Live preview:** Zie waveform + tekst samen

**Design stays from original v1:**
- ✅ Auto cursor-naar-einde (veilig, geen overschrijven)
- ✅ Waveform visualizer (professional feedback)
- ✅ Confidence indicators (medical term validation)
- ✅ Auto-pause na 3 sec (natural pauses)

**No changes needed:** Speech recorder design was good in v1

### 8.7 Besluit: Mobile Strategy

**Gekozen:** Stack + drawer pattern

**Rationale:**
- **Editor full-width:** Primary task has full screen
- **Timeline in drawer:** Swipe up from bottom
- **Quick actions:** Horizontal scroll or 2x2 grid
- **Modal fullscreen:** Editing in modal takes full mobile screen

**Alternative considered:**
- **Tabs (Timeline | Editor):** Loses context, too much switching
- **Shrink both panels:** Everything too small, unusable

**Design review insights:**
- ✅ UX designer: "Mobile needs different paradigm, not just responsive"
- ⚠️ Frontend dev: "Drawer animation complexity, but doable"

### 8.8 Design Review Summary

**v2 solves v1 critical issues:**
1. ✅ **No split attention** - Editor full-width default
2. ✅ **No confusion** - Unified view/edit flow
3. ✅ **Faster workflow** - Quick actions, 1-click common tasks
4. ✅ **Less overwhelming** - Opt-in timeline/filters
5. ✅ **Clear hierarchy** - Editor = primary, timeline = secondary

**Remaining considerations:**
- ⚠️ **Unsaved changes:** Need warning dialog (planned)
- ⚠️ **Keyboard shortcuts:** Power users want efficiency (v2 feature)
- ⚠️ **Resizable timeline:** Users have different preferences (optional v1.1)

**Score evolution:**
- v1 design (rejected): 6/10 (good ideas, poor execution)
- v2 design (current): 8/10 (user-tested principles, clear hierarchy)

### 8.9 Implementation Priorities

**Must have (v1):**
1. Editor-first layout with full-width
2. Quick action buttons (top 3 types)
3. Timeline opt-in sidebar (collapsible)
4. Unified modal (view → edit flow)
5. Speech inline with all features (waveform, confidence, auto-pause)

**Should have (v1.1):**
6. Filters in timeline (smart show/hide)
7. Unsaved changes protection dialog
8. Keyboard shortcuts (E=edit, Esc=close, etc.)
9. Resizable timeline divider

**Nice to have (v2):**
10. Analytics-driven quick action order
11. Voice commands ("nieuwe paragraaf")
12. Duplicate rapport feature
13. Timeline infinite scroll/virtualization

---

## 9. Technische randvoorwaarden (interface met TO)

**Deze sectie is input voor het Technisch Ontwerp:**

### 9.1 API/Props Interface

**Speech Recorder Component Props:**
```typescript
interface SpeechRecorderStreamingProps {
  onTranscript: (transcript: string) => void;  // Callback voor final transcript
  onInterimTranscript?: (interim: string) => void;  // Optional: interim updates
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;

  // Optional: context voor AI enhancement
  patientName?: string;
  documentType?: 'rapport' | 'behandelplan' | 'intake';
}
```

### 9.2 Browser Requirements

**Minimum support:**
- Chrome/Edge 90+ (WebSocket + Web Audio API + MediaRecorder)
- Firefox 88+
- Safari 14+ (mogelijk beperkte ondersteuning)

**Fallback strategie:**
- Feature detection voor WebSocket/Web Audio
- Als niet ondersteund: terug naar oude REST API implementatie
- Duidelijke melding: "Je browser ondersteunt geen real-time transcriptie"

### 9.3 Performance Requirements

- Waveform: 60fps update rate
- Transcript latency: <500ms van spraak tot tekst verschijnt
- UI moet responsive blijven tijdens streaming (geen blocking)
- Memory: max 50MB voor component (audio buffering)

### 9.4 Security Requirements

- API key NOOIT in client code
- Token-based authentication voor WebSocket
- Tokens expire na 1 uur
- Rate limiting op token endpoint (max 10 tokens/user/hour)
- SSL/TLS voor alle verbindingen

---

## 10. Bijlagen & Referenties

**Interne documenten:**
- `docs/specs/speech/analyse-deepgram.md` - Technische analyse van migratie
- `docs/templates/fo_template.md` - Template gebruikt voor dit document

**Componenten die speech recorder gebruiken:**
- `app/epd/patients/[id]/rapportage/components/report-composer.tsx`
- `app/epd/patients/[id]/intakes/[intakeId]/behandeladvies/components/treatment-advice-form.tsx`

**Bestaande implementatie:**
- `components/speech-recorder.tsx` - Huidige REST-based versie
- `app/api/deepgram/transcribe/route.ts` - Huidige server-side endpoint

**Deepgram documentatie:**
- [Live Streaming Audio](https://developers.deepgram.com/docs/live-streaming-audio)
- [Interim Results](https://developers.deepgram.com/docs/interim-results)
- [Endpointing](https://developers.deepgram.com/docs/endpointing)
- [Smart Format](https://developers.deepgram.com/docs/smart-format)

**Design System:**
- shadcn/ui componenten (Button, Dialog, Toast)
- Tailwind CSS styling
- Lucide React icons

---

## 11. Open vragen en toekomstige iteraties

### Open vragen voor implementatie:
- [ ] Deepgram DPA review voor AVG/GDPR compliance
- [ ] Exacte placement: inline vs sidebar vs floating? (aanbeveling: inline)
- [ ] Mobile UX: fullscreen tijdens opname of blijft in place?
- [ ] Autosave integratie: triggert partial transcript autosave?

### Toekomstige v2 features:
- Medical dictionary custom voor Nederlandse GGZ termen
- Sectie auto-detectie ("Anamnese:", "Diagnose:", etc.)
- Voice commands ("nieuwe paragraaf", "verwijder laatste zin")
- Multi-speaker detection (als patiënt mee praat)
- Playback functie van opgenomen audio (vereist lokale opslag)
- Export naar audio file voor archivering

---

**Status:** Ready for Technical Design
**Next steps:** Technisch Ontwerp (TO) uitwerken + implementatie planning
