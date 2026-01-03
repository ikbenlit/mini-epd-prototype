# UX Analyse: Patient Selectie in Cortex

**Datum:** 2025-01-03
**Auteur:** Colin Lit + Claude
**Status:** Analyse compleet, ready for implementation planning

---

## 1. Probleemstelling

### Huidige Flow

```
User: "Notitie medicatie Jan"
           |
Cortex: "Welke patient bedoel je?"
           |
[ZoekenBlock opent in artifact area]
           |
User klikt op "Jan de Vries"
           |
[Patient wordt actief, ZoekenBlock sluit]
           |
User moet OPNIEUW "notitie medicatie" typen
           |
[DagnotatieBlock opent, maar zonder prefill!]
```

### Pain Points

| # | Pain Point | Ernst | Omschrijving |
|---|------------|-------|--------------|
| 1 | Twee-staps flow | Hoog | Chat vraagt, apart venster, klik, terug naar notitie |
| 2 | Context verlies | Hoog | activePatient uit store wordt NIET gebruikt in DagnotatieBlock |
| 3 | Dubbele zoekfunctie | Medium | ZoekenBlock en DagnotatieBlock hebben beide patient search |
| 4 | Geen inline disambiguatie | Hoog | Moet naar apart panel switchen |
| 5 | Clarification niet geimplementeerd | Hoog | resolveClarification() doet niets na selectie |
| 6 | Geen re-processing | Hoog | Na patient selectie moet user opnieuw intent typen |

---

## 2. Oplossingsrichtingen

### 2.1 @Mention Systeem (P1)

Type `@` gevolgd door naam voor autocomplete dropdown in chat input.

```
+-----------------------------------------------------+
| Notitie voor @jan                                   |
|                  +----------------------+           |
|                  | Jan de Vries (52)    |           |
|                  | Jan Bakker (34)      |           |
|                  | Jan Pieterse (67)    |           |
|                  +----------------------+           |
+-----------------------------------------------------+
```

**Voordelen:**
- Disambiguatie voor verzenden, niet erna
- Bekende UX pattern (Slack, GitHub, Discord)
- Patient ID direct beschikbaar voor AI
- Geen extra API calls na submit

### 2.2 Persistent Patient Sidebar (P1)

Altijd zichtbare patient lijst aan de linkerkant.

```
+----------+----------------------------------------+
| Zoek     |                                        |
+----------|         Chat Panel                     |
| Recent   |                                        |
| -------- |                                        |
| * Jan    |  User: Notitie medicatie               |
| * Marie  |  Cortex: Ik maak een notitie...        |
| * Piet   |                                        |
|          |                                        |
| Alle A-Z |        Artifact Area                   |
| -------- |                                        |
| Bakker   |  +- DagnotatieBlock ----------------+  |
| Berg, M  |  | Patient: Jan de Vries            |  |
| De Vrie. |  | Categorie: Medicatie             |  |
| ...      |  +----------------------------------+  |
+----------+----------------------------------------+
```

**Layout Wijziging:**
- Huidig: Chat (40%) + Artifact (60%)
- Nieuw: Sidebar (15%) + Chat (35%) + Artifact (50%)

### 2.3 Preview-First Confirmation (P2)

Toon complete preview in chat, direct opslaan zonder artifact.

```
+-----------------------------------------------+
| Cortex:                                       |
|                                               |
|  +- Notitie Preview -----------------------+ |
|  | Jan de Vries (52)           [wijzig]    | |
|  | Categorie: Medicatie        [wijzig]    | |
|  | "Medicatie gegeven volgens schema"      | |
|  |                                         | |
|  |  [Opslaan]  [Uitgebreid]  [Annuleer]    | |
|  +-----------------------------------------+ |
+-----------------------------------------------+
```

---

## 3. Implementatie Roadmap

### Fase 1: Foundation (Week 1) - 10 SP

| Story | Beschrijving | SP |
|-------|--------------|---:|
| F1.S1 | Patient Sidebar layout wijziging (15/35/50 split) | 3 |
| F1.S2 | PatientSidebar component skeleton | 2 |
| F1.S3 | Patient search in sidebar (hergebruik API) | 2 |
| F1.S4 | Recent patients sectie | 2 |
| F1.S5 | Click-to-select activePatient | 1 |

### Fase 2: @Mention Systeem (Week 2) - 13 SP

| Story | Beschrijving | SP |
|-------|--------------|---:|
| F2.S1 | @-detectie in CommandInput | 2 |
| F2.S2 | PatientMentionDropdown component | 3 |
| F2.S3 | Patient search API integratie (debounced) | 2 |
| F2.S4 | Mention chip rendering in input | 3 |
| F2.S5 | Mention data meesturen naar chat API | 2 |
| F2.S6 | AI prompt update voor mentions | 1 |

### Fase 3: Smart Defaults (Week 3) - 10 SP

| Story | Beschrijving | SP |
|-------|--------------|---:|
| F3.S1 | DagnotatieBlock: auto-use activePatient | 2 |
| F3.S2 | Alle blocks: activePatient als default | 3 |
| F3.S3 | PendingIntent state in store | 2 |
| F3.S4 | Re-process na patient selectie | 3 |

### Fase 4: Preview Cards (Week 4) - 12 SP

| Story | Beschrijving | SP |
|-------|--------------|---:|
| F4.S1 | PreviewCard component design | 3 |
| F4.S2 | Inline edit in preview card | 3 |
| F4.S3 | Direct save van preview card | 2 |
| F4.S4 | Uitgebreid - open artifact flow | 2 |
| F4.S5 | AI prompt update voor preview generation | 2 |

**Totaal: 45 SP (~4 weken)**

---

## 4. Technische Details

### 4.1 Store Uitbreiding

```typescript
// stores/cortex-store.ts
interface CortexStore {
  // Bestaand
  activePatient: Patient | null;

  // Nieuw
  recentPatients: Patient[];           // Max 5
  pendingIntent: PendingIntent | null; // Bewaar intent tijdens disambiguatie
  patientSidebarOpen: boolean;         // Collapse state

  // Acties
  addRecentPatient: (patient: Patient) => void;
  setPendingIntent: (intent: PendingIntent | null) => void;
  togglePatientSidebar: () => void;
}

interface PendingIntent {
  originalMessage: string;
  intent: CortexIntent;
  entities: Partial<ExtractedEntities>;
  awaitingPatientSelection: boolean;
}
```

### 4.2 API Wijzigingen

```typescript
// app/api/cortex/chat/route.ts
const RequestSchema = z.object({
  message: z.string(),
  messages: z.array(ChatMessageSchema).optional(),
  context: z.object({...}).optional(),
  // Nieuw
  mentions: z.array(z.object({
    patientId: z.string().uuid(),
    patientName: z.string(),
    position: z.object({ start: z.number(), end: z.number() }),
  })).optional(),
});
```

### 4.3 Component Structuur

```
components/cortex/
+-- patient-sidebar/
|   +-- patient-sidebar.tsx
|   +-- patient-list.tsx
|   +-- patient-list-item.tsx
|   +-- patient-search-input.tsx
|   +-- recent-patients.tsx
+-- command-center/
    +-- patient-mention-dropdown.tsx  (nieuw)
    +-- mention-chip.tsx              (nieuw)
```

---

## 5. UI/UX Specificaties

### 5.1 Patient Sidebar

- **Desktop (>1024px):** 240px vast, collapsible naar 48px, Cmd+B toggle
- **Tablet (768-1024px):** Overlay mode, swipe gesture
- **Mobile (<768px):** Bottom sheet

### 5.2 @Mention Dropdown

- **Trigger:** @ karakter in input
- **Minimale query:** 1 karakter na @
- **Debounce:** 200ms
- **Max resultaten:** 5
- **Keyboard:** Up/Down, Enter, Escape

### 5.3 Mention Chip Styling

```css
.mention-chip {
  display: inline-flex;
  padding: 2px 6px;
  background: amber-100;
  border: 1px solid amber-300;
  border-radius: 4px;
}
```

---

## 6. Success Metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| Clicks voor patient selectie | 3-4 | 1-2 |
| Tijd tot notitie opgeslagen | ~15 sec | ~8 sec |
| "Welke patient?" prompts | ~40% | <10% |

---

## 7. Volgende Stappen

1. [ ] Review met Colin - prioriteiten bevestigen
2. [ ] Design mockups maken
3. [ ] Bouwplan schrijven voor Fase 1 + 2
4. [ ] Start implementatie Patient Sidebar
5. [ ] Parallel: @mention dropdown prototype

---

**Gerelateerde Documenten:**
- `docs/archive/swift/bouwplan-swift-v3.md`
- `stores/cortex-store.ts`
- `components/cortex/blocks/zoeken-block.tsx`
