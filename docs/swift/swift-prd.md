# 📄 Product Requirements Document (PRD) — Contextual UI EPD

**Projectnaam:** Contextual UI EPD — "Het Slimme EPD"  
**Versie:** v1.0  
**Datum:** 23-12-2024  
**Auteur:** Colin Lit  

---

## 1. Doelstelling

🎯 **Doel van deze sectie:** Beschrijf waarom dit product of prototype wordt gebouwd en wat het beoogde resultaat is.

### Primair doel

Uitbreiden van het bestaande Speedrun EPD met **Contextual UI**: een systeem waarin voorgedefinieerde interface-componenten **automatisch verschijnen op basis van context** — wie je bent, welke patiënt actief is, welk moment van de dag het is, en wat je probeert te doen.

### Het kernprincipe

> **"Pre-built components, smart triggers"**
> 
> We genereren geen UI on-the-fly (te onvoorspelbaar voor zorg), maar tonen **geteste bouwblokken op het juiste moment**. De AI zit in het *bepalen wanneer* en het *vullen van content*, niet in het genereren van interface-elementen.

### Het contrast met traditionele EPD's

| Aspect | Traditioneel EPD | Contextual UI EPD |
|--------|------------------|-------------------|
| Navigatie | 47 menu-items, tabbladen, submenu's | Context bepaalt wat je ziet |
| Interface | Altijd alles zichtbaar | Alleen wat nu relevant is |
| Timing | Gebruiker zoekt zelf | Systeem toont proactief |
| Klikken | 12 klikken voor rapportage | 1 zin of automatisch |
| Context | Gebruiker moet onthouden | Systeem begrijpt situatie |

### Secundaire doelen

- Demonstreren van "intelligent interface" concept voor gesprekken met Nedap, Medicore, etc.
- LinkedIn content over next-gen EPD interfaces
- Technische showcase van context-aware React componenten
- Valideren of "proactieve UI" gewaardeerd wordt door zorgprofessionals

### Relatie met Speedrun EPD

Dit is **geen nieuw product** maar een uitbreiding op de bestaande codebase:
- Hergebruik van alle database schemas
- Hergebruik van bestaande API routes en AI-functionaliteit  
- Hergebruik van UI componenten (speech recorder, editors, etc.)
- Toevoeging van Context Engine en Trigger System

---

## 2. Doelgroep

🎯 **Doel:** Schets wie de eindgebruikers, stakeholders en testers zijn.

### Primaire gebruikers

| Rol | Behoeften | Pijnpunten vandaag |
|-----|-----------|-------------------|
| **Verpleegkundige** | Snelle notities tussen zorgmomenten | 40% tijd aan administratie, zoeken naar juiste scherm |
| **SPV/Behandelaar** | Rapportage na gesprek, overdracht | 20 min typen na crisis-interventie |
| **Teamleider** | Overzicht, overdracht ontvangen | Informatie verspreid over schermen |

### Secundaire stakeholders

| Rol | Interesse |
|-----|-----------|
| **ICT Manager** | Minder training nodig, snellere adoptie |
| **Product Owner (demo)** | AI-toegevoegde waarde zien |
| **Developer (inspiratie)** | Context-aware UI patterns leren |

### Gebruikerscontext

De interface moet werken in situaties waar:
- Handen bezet zijn (handschoenen, zorghandelingen)
- Tijd schaars is (tussen patiënten door)
- Concentratie elders ligt (na emotioneel gesprek)
- Meerdere patiënten tegelijk aandacht vragen

---

## 3. Kernfunctionaliteiten (MVP-scope)

🎯 **Doel:** Afbakenen van de minimale werkende functies.

### 3.1 Architectuur: De Drie Lagen

```
┌─────────────────────────────────────────────────────────┐
│  LAAG 1: CONTEXT ENGINE                                 │
│  Houdt bij: gebruiker, patiënt, tijd, dienst, recente   │
│  acties. Zustand store + Supabase realtime.             │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  LAAG 2: TRIGGER SYSTEM                                 │
│  Rules engine die bepaalt wanneer welk component        │
│  verschijnt. Combinatie van tijd, events, en intent.    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  LAAG 3: PRE-BUILT COMPONENTS                           │
│  Geteste UI-blokken die door triggers worden getoond    │
│  en automatisch worden gevuld met relevante data.       │
└─────────────────────────────────────────────────────────┘
```

### 3.2 MVP Componenten

| # | Component | Trigger | Data/AI | Prioriteit |
|---|-----------|---------|---------|------------|
| 1 | **Command Input** | Altijd zichtbaar (centraal) | Voice + text | Must |
| 2 | **DagnotatieBlock** | Intent "notitie" of voice | Pre-fill patiënt, categorie | Must |
| 3 | **ZoekenBlock** | Intent "zoek" of patiëntnaam | Fuzzy search results | Must |
| 4 | **PatientContextCard** | Patiënt geselecteerd | Laatste rapportages, alerts | Must |
| 5 | **RapportageBlock** | Intent "gesprek" of "rapportage" | AI-samenvatting optie | Should |
| 6 | **OverdrachtPanel** | Tijd = einde dienst OF intent | AI-samenvatting per patiënt | Should |
| 7 | **AgendaContextCard** | Afspraak binnen 15 min | Patiënt + laatste contact | Could |
| 8 | **FallbackPicker** | Lage intent confidence | Grid met alle opties | Must |

### 3.3 Context Engine Specificatie

```typescript
interface ContextState {
  // Gebruiker
  currentUser: {
    id: string;
    name: string;
    role: 'verpleegkundige' | 'behandelaar' | 'teamleider';
  };
  
  // Dienst
  currentShift: {
    type: 'ochtend' | 'middag' | 'avond' | 'nacht';
    startTime: Date;
    endTime: Date;
    patients: string[]; // IDs van toegewezen patiënten
  };
  
  // Actieve patiënt (sticky)
  activePatient: {
    id: string;
    name: string;
    lastContact: Date;
    alerts: Alert[];
  } | null;
  
  // Recente acties
  recentActions: Action[]; // Laatste 5-10
  
  // Tijd-gevoelige context
  upcomingAppointment: Appointment | null; // Binnen 30 min
  shiftEndingSoon: boolean; // < 1 uur tot einde
}
```

### 3.4 Trigger Rules Specificatie

| Trigger Type | Conditie | Actie | Prioriteit |
|--------------|----------|-------|------------|
| **Intent** | Voice/text input geclassificeerd | Open bijbehorend block | 1 (hoogste) |
| **Patient Select** | Patiënt aangeklikt/gevonden | Toon PatientContextCard | 2 |
| **Time: Appointment** | Afspraak binnen 15 min | Toon AgendaContextCard | 3 |
| **Time: Shift End** | < 1 uur tot einde dienst | Suggestie OverdrachtPanel | 4 |
| **Fallback** | Intent confidence < 0.7 | Toon FallbackPicker | 5 (laagste) |

### 3.5 Intent Classification

**Two-tier approach voor snelheid:**

```typescript
// Tier 1: Local keyword matching (< 10ms)
const quickMatch = (input: string): IntentResult | null => {
  const patterns = [
    { regex: /notitie|dagnotitie|noteren/i, intent: 'dagnotitie' },
    { regex: /zoek|vind|wie is/i, intent: 'zoeken' },
    { regex: /overdracht|dienst\s*(eindigt|klaar)/i, intent: 'overdracht' },
    { regex: /rapport|gesprek|consult/i, intent: 'rapportage' },
    { regex: /afspraken?|agenda|planning/i, intent: 'agenda' },
  ];
  // ... matching logic
};

// Tier 2: Claude API (fallback, < 500ms)
const aiClassify = async (input: string): Promise<IntentResult> => {
  // Alleen aangeroepen als quickMatch null of low confidence
};
```

**Entity Extraction:**

Naast intent ook extraheren:
- `patient_name`: "Jan de Vries", "mevrouw Jansen"
- `category`: "medicatie", "ADL", "incident"
- `time_reference`: "vandaag", "gisteren", "afgelopen dienst"

---

## 4. Gebruikersflows (Demo- of MVP-flows)

🎯 **Doel:** Laten zien hoe de gebruiker stap-voor-stap door het systeem gaat.

### Flow 1: Snelle Dagnotitie via Voice (30 seconden)

```
┌─────────────────────────────────────────────────────────┐
│ 1. Gebruiker opent Command Center                       │
│    → Ziet: lege input, context "Ochtend | 8 patiënten" │
├─────────────────────────────────────────────────────────┤
│ 2. Spreekt: "Notitie Jan de Vries medicatie gegeven"   │
│    → Deepgram transcribeert real-time                   │
├─────────────────────────────────────────────────────────┤
│ 3. System analyseert:                                   │
│    → Intent: dagnotitie (confidence 0.95)              │
│    → Patient: "Jan de Vries" → ID lookup               │
│    → Category: "Medicatie"                              │
│    → Text: "medicatie gegeven"                          │
├─────────────────────────────────────────────────────────┤
│ 4. DagnotatieBlock verschijnt:                         │
│    → Patient: Jan de Vries ✓ (pre-filled)              │
│    → Categorie: Medicatie ✓ (pre-filled)               │
│    → Tekst: "medicatie gegeven" ✓ (pre-filled)         │
│    → [Opslaan] knop highlighted                         │
├─────────────────────────────────────────────────────────┤
│ 5. Gebruiker: review → klik Opslaan                    │
│    → Toast: "Notitie opgeslagen"                        │
│    → Block verdwijnt                                    │
│    → Recent badge: "Jan - Medicatie" verschijnt        │
└─────────────────────────────────────────────────────────┘
```

### Flow 2: Patiënt Opzoeken + Context (45 seconden)

```
┌─────────────────────────────────────────────────────────┐
│ 1. Gebruiker typt: "Jan"                               │
│    → Intent: zoeken                                     │
│    → Query: "Jan"                                       │
├─────────────────────────────────────────────────────────┤
│ 2. ZoekenBlock verschijnt met matches:                 │
│    ┌──────────────────────────────────────────────┐    │
│    │ Jan de Vries      │ 15-03-1965 │ Laatst: 2u │    │
│    │ Jan Bakker        │ 22-08-1978 │ Laatst: 1d │    │
│    │ Jantine Smit      │ 04-11-1990 │ Laatst: 3d │    │
│    └──────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│ 3. Gebruiker klikt "Jan de Vries"                      │
│    → activePatient wordt gezet                          │
│    → ZoekenBlock sluit                                  │
├─────────────────────────────────────────────────────────┤
│ 4. PatientContextCard verschijnt:                      │
│    ┌──────────────────────────────────────────────┐    │
│    │ JAN DE VRIES (59)                            │    │
│    │ ─────────────────────────────────────────    │    │
│    │ Laatste contact: 2 uur geleden               │    │
│    │                                               │    │
│    │ Recente notities:                            │    │
│    │ • 09:15 Medicatie uitgereikt                 │    │
│    │ • Gisteren: Goed gesprek over ontslag        │    │
│    │                                               │    │
│    │ ⚠️ Let op: 2 valincidenten deze week         │    │
│    │                                               │    │
│    │ [Notitie] [Rapportage] [Behandelplan]        │    │
│    └──────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│ 5. Gebruiker klikt [Notitie]                           │
│    → DagnotatieBlock opent met Jan pre-filled          │
└─────────────────────────────────────────────────────────┘
```

### Flow 3: Automatische Overdracht Suggestie (proactief)

```
┌─────────────────────────────────────────────────────────┐
│ Context: Het is 15:15, dienst eindigt om 16:00         │
├─────────────────────────────────────────────────────────┤
│ 1. System detecteert: shiftEndingSoon = true           │
│    → Subtiele banner verschijnt:                        │
│    ┌──────────────────────────────────────────────┐    │
│    │ 🕐 Dienst eindigt over 45 min                │    │
│    │    Wil je alvast de overdracht voorbereiden? │    │
│    │    [Start overdracht] [Later]                │    │
│    └──────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│ 2. Gebruiker klikt [Start overdracht]                  │
│    → OverdrachtPanel opent                              │
├─────────────────────────────────────────────────────────┤
│ 3. OverdrachtPanel toont:                              │
│    ┌──────────────────────────────────────────────┐    │
│    │ OVERDRACHT OCHTEND → MIDDAG                   │    │
│    │ 08:00 - 16:00 | 8 patiënten                   │    │
│    │ ─────────────────────────────────────────     │    │
│    │                                               │    │
│    │ ▼ Jan de Vries                               │    │
│    │   AI-samenvatting: Rustige ochtend, medicatie│    │
│    │   uitgereikt zonder problemen. Let op val-   │    │
│    │   risico bij toiletbezoek.                   │    │
│    │   [Bronnen: 3 notities]                      │    │
│    │                                               │    │
│    │ ▼ Marie van den Berg                         │    │
│    │   AI-samenvatting: ...                       │    │
│    │                                               │    │
│    │ [Kopieer alles] [Verstuur naar collega]      │    │
│    └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Flow 4: Ambigue Input met Fallback

```
┌─────────────────────────────────────────────────────────┐
│ 1. Gebruiker typt: "medicatie"                         │
│    → Intent: onduidelijk (dagnotitie? metingen?)       │
│    → Confidence: 0.5                                    │
│    → Geen patiënt gespecificeerd                        │
├─────────────────────────────────────────────────────────┤
│ 2. FallbackPicker verschijnt:                          │
│    ┌──────────────────────────────────────────────┐    │
│    │ Wat wil je doen?                             │    │
│    │                                               │    │
│    │ ┌─────────┐  ┌─────────┐  ┌─────────┐       │    │
│    │ │ 📝      │  │ 🔍      │  │ 📋      │       │    │
│    │ │ Notitie │  │ Zoeken  │  │ Rapport │       │    │
│    │ └─────────┘  └─────────┘  └─────────┘       │    │
│    │                                               │    │
│    │ ┌─────────┐  ┌─────────┐  ┌─────────┐       │    │
│    │ │ 🔄      │  │ 📅      │  │ 💊      │       │    │
│    │ │Overdracht│ │ Agenda  │  │ Meting  │       │    │
│    │ └─────────┘  └─────────┘  └─────────┘       │    │
│    └──────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│ 3. Gebruiker klikt [Notitie]                           │
│    → DagnotatieBlock opent                              │
│    → "medicatie" ingevuld als tekst                     │
│    → Vraagt om patiënt te selecteren                    │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Niet in Scope

🎯 **Doel:** Duidelijk maken wat (nog) niet wordt gebouwd.

### Expliciet uitgesloten (v1)

| Feature | Reden |
|---------|-------|
| **Volledig voice-only navigatie** | Voice is input, niet navigatie. Te foutgevoelig. |
| **AI-gegenereerde UI componenten** | Onvoorspelbaar, niet geschikt voor zorg. Pre-built only. |
| **Ambient listening** | Privacy concerns, v2+ feature |
| **Multi-user realtime** | Complexiteit, niet nodig voor demo |
| **Offline mode** | Complexiteit, later toevoegen |
| **Behandelplan block** | Te complex, lage frequentie, bestaande UI voldoet |
| **Intake block** | Wizard is complex, 1x/maand, lage waarde voor MVP |
| **Metingen block** | Lage waarde-perceptie bij stakeholders |
| **Native mobile app** | Responsive web is voldoende |
| **FHIR/externe EPD integratie** | Post-MVP, apart project |

### Bewust versimpeld (v1)

| Aspect | Versimpeling |
|--------|--------------|
| **Diensten** | Hardcoded tijden (08-16, 16-23, 23-08) |
| **Patiënt-toewijzing** | Alle patiënten zichtbaar, geen restricties |
| **Alerts** | Alleen handmatig toegevoegd, geen automatische detectie |

---

## 6. Succescriteria

🎯 **Doel:** Objectieve meetlat voor een geslaagde oplevering.

### Functionele criteria

| Criterium | Target | Meetmethode |
|-----------|--------|-------------|
| Intent classification accuracy | > 85% | Test set van 50 voorbeelden |
| Voice transcription accuracy | > 90% | Handmatige review sample |
| Pre-fill correctheid | > 90% | Juiste patiënt/categorie |
| Fallback usage | < 25% | Picker clicks / totaal |
| "Notitie Jan medicatie" → save | < 30 sec | Timestamp logging |

### Performance criteria

| Criterium | Target |
|-----------|--------|
| Intent classification | < 500ms |
| Block render | < 200ms |
| Voice transcription latency | < 100ms |
| PatientContextCard laden | < 300ms |

### UX criteria

| Criterium | Target |
|-----------|--------|
| Klikken tot taak compleet | Gemiddeld < 3 |
| Training nodig | Zero (intuïtief) |
| "Dit voelt als magie" feedback | Minimaal 1 test user |

### Business criteria

| Criterium | Target |
|-----------|--------|
| Demo-ready | Ja, 3 scenario's foutloos |
| LinkedIn content | 2+ posts over concept |
| Stakeholder interesse | Minimaal 1 concrete vervolgvraag |

---

## 7. Risico's & Mitigatie

🎯 **Doel:** Risico's vroeg signaleren en plannen hoe ermee om te gaan.

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| **Intent classification onnauwkeurig** | Medium | Hoog | Fallback picker altijd beschikbaar, local-first matching |
| **Voice niet goed in Nederlands** | Laag | Medium | Deepgram NL model, tekst fallback altijd mogelijk |
| **Pre-fill verkeerde patiënt** | Medium | Hoog | Altijd confirmation tonen, nooit blind opslaan |
| **Context engine te complex** | Medium | Medium | Minimale context in v1, uitbreiden in v2 |
| **Gebruikers missen "overzicht"** | Medium | Medium | Bestaande patiëntenlijst als alternatieve entry |
| **Performance AI calls** | Medium | Medium | Local-first matching, streaming responses, caching |
| **Scope creep** | Hoog | Hoog | Strikte MVP scope, parking lot voor ideeën |
| **Demo deadline druk** | Medium | Hoog | Focus op 3 happy paths, polish later |

---

## 8. Roadmap / Vervolg (Post-MVP)

🎯 **Doel:** Richting geven aan toekomstige uitbreidingen.

### Fase 2: Extended Blocks (Post-MVP)

- **AgendaBlock** - Afspraken beheren, context bij naderende afspraak
- **BehandelplanBlock** - Wrapper rond bestaande functionaliteit
- **MetingenBlock** - Vitale functies invoer met trends

### Fase 3: Smart Triggers

- **Proactieve alerts** - "3 valincidenten, wil je een risico-analyse?"
- **Behandelplan reminder** - "Plan verloopt over 2 weken"
- **Automatische categorisatie** - ML-model voor notitie-types

### Fase 4: Team Features

- **Shift handover** - Gestructureerde overdracht workflow
- **Team dashboard** - Overzicht alle patiënten, alerts
- **Notificaties** - Push bij urgente updates

### Fase 5: Integraties

- **FHIR export** - Standaard zorgdata uitwisseling
- **Externe EPD sync** - Koppeling met Nedap, PinkRoccade
- **Calendar sync** - Google/Outlook afspraken importeren

---

## 9. Technische Architectuur (Overzicht)

### Nieuwe Routes

```
/app
  /(app)
    /command-center
      /page.tsx                    # Hoofdscherm
      /components/
        CommandInput.tsx           # Text + voice input
        BlockContainer.tsx         # Generic block wrapper
        FallbackPicker.tsx         # Block selection grid
        RecentActions.tsx          # Recent badges
    
    /api
      /intent
        /classify/route.ts         # Intent classification
      /context
        /route.ts                  # Get/set user context
      /patients
        /search/route.ts           # Fuzzy patient search
```

### Building Blocks

```
/components/building-blocks/
  /dagnotitie/
    DagnotatieBlock.tsx
  /zoeken/
    ZoekenBlock.tsx
    PatientCard.tsx
  /rapportage/
    RapportageBlock.tsx
  /overdracht/
    OverdrachtPanel.tsx
  /context/
    PatientContextCard.tsx
    AgendaContextCard.tsx
  /shared/
    BlockContainer.tsx
    BlockHeader.tsx
```

### State Management (Zustand)

```typescript
// stores/context-store.ts
interface ContextStore {
  // User & shift
  currentUser: User;
  currentShift: Shift;
  
  // Active patient (sticky)
  activePatient: Patient | null;
  setActivePatient: (patient: Patient | null) => void;
  
  // Recent actions
  recentActions: Action[];
  addRecentAction: (action: Action) => void;
  
  // Time-based context
  upcomingAppointment: Appointment | null;
  shiftEndingSoon: boolean;
}

// stores/command-center-store.ts
interface CommandCenterStore {
  // Active block
  activeBlock: BlockType | null;
  blockPrefill: Record<string, unknown>;
  
  // Input state
  inputValue: string;
  isListening: boolean;
  transcript: string;
  
  // Actions
  processInput: (text: string) => Promise<void>;
  openBlock: (type: BlockType, prefill?: object) => void;
  closeBlock: () => void;
}
```

---

## 10. Fasering & Sprint Planning

### Sprint 1: Foundation (Dag 1-2)

| Taak | Output | Uren |
|------|--------|------|
| Command Center page layout | `/app/command-center/page.tsx` | 2 |
| CommandInput component | Text + submit | 2 |
| Voice integratie | Mic button, Deepgram | 2 |
| Context store setup | Zustand store | 2 |
| BlockContainer wrapper | Generic frame | 1 |

**Deliverable:** Command Center opent, voice werkt, geen blocks nog.

### Sprint 2: Intent & Zoeken (Dag 3-4)

| Taak | Output | Uren |
|------|--------|------|
| Intent API route | `/api/intent/classify` | 3 |
| Local keyword matching | Quick patterns | 2 |
| Entity extraction | Patient name uit tekst | 2 |
| ZoekenBlock | Patient cards + select | 3 |
| FallbackPicker | Grid met icons | 2 |

**Deliverable:** "zoek jan" werkt, patient selectie mogelijk.

### Sprint 3: Dagnotitie Flow (Dag 5-6)

| Taak | Output | Uren |
|------|--------|------|
| DagnotatieBlock | Quick entry form | 3 |
| Pre-fill logic | Patient + categorie | 2 |
| Save flow + toast | Feedback | 1 |
| PatientContextCard | Na selectie tonen | 3 |
| Recent actions strip | Badges | 2 |

**Deliverable:** "notitie jan medicatie" werkt end-to-end.

### Sprint 4: Polish & Demo (Dag 7-8)

| Taak | Output | Uren |
|------|--------|------|
| RapportageBlock | Wrapper rond composer | 3 |
| OverdrachtPanel | AI-samenvatting | 4 |
| Animaties | Transitions | 2 |
| Demo scenario's | 3 happy paths | 2 |
| Bug fixes | Stability | 3 |

**Deliverable:** Demo-ready voor stakeholders.

### Totaal: ~42 uur over 8 dagen

---

## 11. Bijlagen & Referenties

🎯 **Doel:** Bronnen koppelen voor context en consistentie.

### Gerelateerde documenten

| Document | Locatie | Beschrijving |
|----------|---------|--------------|
| Ephemeral UI Research | `Ephemeral_UI_for_Healthcare...md` | Achtergrond contextual interfaces |
| PRD Ephemeral UI EPD | `nextgen-epd-prd-ephemeral-ui-epd.md` | Originele visie document |
| MVP Prioritering | `nextgen-epd-mvp-prioritering-ephemeral-ui.md` | Scope beslissingen |
| Waarde-analyse | `nextgen-epd-waarde-analyse-ephemeral-ui.md` | Klant & PO perspectief |
| FO Mini-ECD v2 | `fo-mini-ecd-v2.md` | Bestaande EPD functionaliteit |
| TO Mini-ECD | `to-mini-ecd-v1_2.md` | Technische basis |

### Bestaande codebase (hergebruik)

| Component | Locatie | Hergebruik |
|-----------|---------|------------|
| Speech Recorder | `components/speech-recorder.tsx` | 100% |
| Deepgram API | `api/deepgram/transcribe/route.ts` | 100% |
| Toast System | `lib/hooks/use-toast.ts` | 100% |
| Command (cmdk) | `components/ui/command.tsx` | 90% |
| Dagregistratie Form | `app/epd/dagregistratie/` | 80% |
| Report Types | `lib/types/report.ts` | 100% |

---

## Wijzigingslog

| Versie | Datum | Wijzigingen |
|--------|-------|-------------|
| 1.0 | 23-12-2024 | Initiële versie |