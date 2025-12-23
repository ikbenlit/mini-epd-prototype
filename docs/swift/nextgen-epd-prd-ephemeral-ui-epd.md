# 📄 Product Requirements Document (PRD)

**Product:** Ephemeral UI EPD - "Het Vergankelijke EPD"
**Doel:** AI Speedrun Deel 2 - Demonstreren van context-aware, on-demand interfaces voor GGZ
**Versie:** 1.0
**Datum:** december 2024

---

## 1. Doelstelling

### Primair doel
Bouwen van een **Ephemeral UI EPD**: een systeem waarin de interface niet permanent is, maar **on-demand verschijnt** op basis van wat de gebruiker wil doen. De gebruiker navigeert niet door menu's, maar spreekt of typt een intentie - en het juiste "bouwblok" verschijnt.

### Het contrast met traditionele EPD's

| Aspect | Traditioneel EPD | Ephemeral UI EPD |
|--------|------------------|------------------|
| Navigatie | 47 menu-items, tabbladen, submenu's | Eén input: "wat wil je doen?" |
| Interface | Altijd alles zichtbaar | Alleen wat je nu nodig hebt |
| Leren | 200-pagina handleiding | Zero learning curve |
| Klikken | 12 klikken voor rapportage | 1 zin of voice command |
| Context | Gebruiker moet context onthouden | Systeem begrijpt context |

### Secundair doel
- Positioneren als thought leader op het snijvlak van AI en healthcare UX
- Demonstreren van Vercel AI SDK Generative UI capabilities
- Concrete showcase voor gesprekken met Nedap, Medicore, etc.

---

## 2. Wat is Ephemeral UI?

### Definitie
Ephemeral UI ("vergankelijke interface") betekent dat interface-elementen:
1. **On-demand verschijnen** - alleen wanneer nodig
2. **Context-aware zijn** - weten wie je bent, welke patiënt, welk moment
3. **Verdwijnen na gebruik** - geen permanente schermvervuiling
4. **Voorgedefinieerd zijn** - geen willekeurig gegenereerde UI, maar geteste bouwblokken

### Onze interpretatie voor GGZ
We bouwen **geen** volledig AI-gegenereerde interfaces (te onvoorspelbaar voor zorg).
We bouwen **wel** een set van **voorgedefinieerde UI-bouwblokken** die:
- Door AI worden geselecteerd op basis van gebruikersintentie
- Automatisch worden gevuld met relevante data
- Na voltooiing verdwijnen of minimaliseren

---

## 3. Bestaande basis (uit Speedrun 1)

### Wat we al hebben
Uit het Mini-ECD en Overdracht Dashboard:

**Database (Supabase PostgreSQL):**
- `clients` - patiëntgegevens
- `intakes` - intakeverslagen
- `problem_profiles` - DSM-light classificaties
- `treatment_plans` - behandelplannen met versioning
- `nursing_logs` - verpleegkundige dagregistraties
- `appointments` - afspraken (basis)
- `vitals` - vitale functies metingen
- `risk_assessments` - risicotaxaties

**AI Functionaliteit:**
- Samenvatten van tekst
- Leesbaarheid verbeteren (B1)
- Problemen extraheren uit intake
- Behandelplan genereren
- Overdracht samenvatting genereren

**Tech Stack:**
- Next.js 15 (App Router)
- Supabase (Auth + DB)
- Claude API (Anthropic)
- TailwindCSS + shadcn/ui
- TipTap rich text editor
- Deepgram (speech-to-text)

### Wat we hergebruiken
- Volledige database schema
- Alle bestaande API routes
- AI prompts en functionaliteit
- Authenticatie en autorisatie
- Bestaande UI componenten (als bouwblokken)

---

## 4. De Bouwblokken

### 4.1 Overzicht van UI Bouwblokken

| # | Bouwblok | Trigger voorbeelden | Data input | Output |
|---|----------|---------------------|------------|--------|
| 1 | **Rapportage** | "gesprek gehad", "notitie maken" | patient_id, transcript/tekst | Opgeslagen rapportage |
| 2 | **Intake** | "nieuwe cliënt", "intake" | basisgegevens, verwijzing | Intake + patient record |
| 3 | **Behandelplan** | "behandelplan", "doelen opstellen" | patient_id, diagnose | Treatment plan |
| 4 | **Overdracht** | "overdracht", "dienst eindigt" | patient_id[], tijdrange | Samenvatting |
| 5 | **Dagnotitie** | "medicatie gegeven", "incident" | patient_id, categorie | Nursing log entry |
| 6 | **Zoeken** | "zoek", "wie is", "vind" | zoekterm | Patient card(s) |
| 7 | **Agenda** | "afspraken", "planning", "wanneer" | datum, behandelaar | Agenda view |
| 8 | **Metingen** | "vitale functies", "meting invoeren" | patient_id, type | Vitals entry |

### 4.2 Bouwblok Specificaties

#### Bouwblok 1: Rapportage
**Trigger patterns:**
- "Ik heb net een gesprek gehad met [naam]"
- "Notitie voor [naam]"
- "Rapportage maken"

**UI Componenten:**
- Patient selector (indien niet gespecificeerd)
- Rich text editor (TipTap)
- AI-knoppen: Samenvatten, Structureren, B1-niveau
- Tag selector (Gesprek/Observatie/Telefonisch/etc.)
- Save + Close actie

**Pre-fill logica:**
- Als patient genoemd: voorselect patient
- Als "gesprek": tag = Gesprek
- Als transcript meegegeven: vul editor

**Na voltooiing:**
- Opslaan in `intakes` of `nursing_logs`
- Toon bevestiging
- Minimaliseer naar "Laatste: [titel]" badge
- Klaar voor volgende actie

---

#### Bouwblok 2: Intake
**Trigger patterns:**
- "Nieuwe cliënt"
- "Intake starten"
- "Aanmelding verwerken"

**UI Componenten:**
- Stap 1: Basisgegevens (naam, geboortedatum)
- Stap 2: Verwijsgegevens (optioneel)
- Stap 3: Intake editor met AI-ondersteuning
- Stap 4: AI-suggestie voor probleemprofiel

**Pre-fill logica:**
- Als naam genoemd: vul naam in
- Als verwijsbrief geüpload: extract data

**Na voltooiing:**
- Patient aangemaakt
- Intake opgeslagen
- Probleemprofiel concept aangemaakt
- Navigeer naar volgende stap of minimaliseer

---

#### Bouwblok 3: Behandelplan
**Trigger patterns:**
- "Behandelplan opstellen voor [naam]"
- "Doelen formuleren"
- "Plan maken"

**UI Componenten:**
- Patient context header
- Diagnose/probleemprofiel samenvatting
- AI-gegenereerd plan (bewerkbaar)
- SMART doelen editor
- Interventies selector
- Versie management (concept/gepubliceerd)

**Pre-fill logica:**
- Laad bestaand probleemprofiel
- Laad recente intakes voor context
- Genereer voorstel met AI

**Na voltooiing:**
- Plan opgeslagen (concept of gepubliceerd)
- Toon bevestiging met versienummer

---

#### Bouwblok 4: Overdracht
**Trigger patterns:**
- "Overdracht maken"
- "Dienst eindigt"
- "Samenvatting voor collega"

**UI Componenten:**
- Multi-patient selector (of "mijn patiënten vandaag")
- Tijdrange selector (afgelopen X uur)
- Per patient: collapsible summary
- AI-samenvatting met bronverwijzingen
- Export/print optie

**Pre-fill logica:**
- Selecteer patiënten van huidige gebruiker
- Default tijdrange: afgelopen 8 uur
- Laad relevante nursing_logs, vitals, rapportages

**Na voltooiing:**
- Overdracht gemarkeerd als compleet
- Optioneel: doorsturen naar collega

---

#### Bouwblok 5: Dagnotitie (Quick Entry)
**Trigger patterns:**
- "Medicatie gegeven aan [naam]"
- "Incident bij [naam]"
- "[naam] heeft goed gegeten"

**UI Componenten:**
- Minimale form: categorie, tekst, tijd
- Categorieën: Medicatie, ADL, Gedrag, Incident, Observatie
- Checkbox: "Opnemen in overdracht"
- Quick save (enter = opslaan)

**Pre-fill logica:**
- Extract patient uit zin
- Extract categorie uit keywords
- Tijd = nu (aanpasbaar)

**Na voltooiing:**
- Direct opgeslagen
- Toast bevestiging
- Klaar voor volgende notitie

---

#### Bouwblok 6: Zoeken
**Trigger patterns:**
- "Zoek [naam]"
- "Wie is [naam]"
- "Toon patiënt [naam]"

**UI Componenten:**
- Search results cards
- Per card: naam, geboortedatum, laatste contact, status
- Klik = open patient context
- "Geen resultaten" state

**Na selectie:**
- Set active patient context
- Toon relevante vervolgacties: "Wat wil je doen met [naam]?"

---

#### Bouwblok 7: Agenda
**Trigger patterns:**
- "Mijn afspraken vandaag"
- "Afspraken voor [naam]"
- "Planning deze week"

**UI Componenten:**
- Dag/week view toggle
- Afsprakenlijst met tijden
- Patient naam + type afspraak
- Quick actions: afspraak toevoegen

**Pre-fill logica:**
- Default: vandaag, huidige gebruiker
- Als patient genoemd: filter op patient

---

#### Bouwblok 8: Metingen
**Trigger patterns:**
- "Bloeddruk invoeren"
- "Vitale functies [naam]"
- "Gewicht meten"

**UI Componenten:**
- Meting type selector
- Waarde input met validatie
- Trend indicator (vs vorige meting)
- Quick save

---

## 5. De Orchestratielaag

### 5.1 Command Center Interface

**Het centrale scherm:**
```
┌─────────────────────────────────────────────────────────┐
│  [🎤] Wat wil je doen?                          [user] │
│  _____________________________________________________ │
│                                                         │
│  Context: Dienst ochtend | 8 patiënten | 3 todo's      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                  │   │
│  │           [Actief Bouwblok verschijnt hier]     │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Recent: [Jan - Rapportage] [Overdracht 14:00]         │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Intent Classification

**Flow:**
```
[User Input: tekst of voice]
         ↓
[AI Intent Classifier]
         ↓
    ┌────┴────┐
    ↓         ↓
[Intent]  [Entities]
    ↓         ↓
[Route naar Bouwblok + Pre-fill data]
         ↓
[Render Bouwblok Component]
```

**Intent Classification Prompt:**
```
Je bent een intent classifier voor een GGZ EPD systeem.

Analyseer de gebruikersinput en return JSON:
{
  "intent": "rapportage|intake|behandelplan|overdracht|dagnotitie|zoeken|agenda|metingen|onbekend",
  "confidence": 0.0-1.0,
  "entities": {
    "patient_name": string | null,
    "date": string | null,
    "category": string | null,
    "action_type": string | null
  },
  "clarification_needed": boolean,
  "clarification_question": string | null
}

Gebruikersinput: "{input}"
```

### 5.3 Context Management

**Actieve context bevat:**
- `current_user`: ingelogde behandelaar
- `active_patient`: laatst geselecteerde patiënt (sticky)
- `active_shift`: huidige dienst info
- `recent_actions`: laatste 5 acties (voor "recent" badge)
- `pending_items`: openstaande taken

**Context wordt gebruikt voor:**
- Pre-filling van bouwblokken
- Suggesties bij ambigue input
- "Bedoelde je [patient X]?" bij onduidelijkheid

---

## 6. Voice Interface

### 6.1 Speech-to-Text Flow
```
[Mic Button Click]
      ↓
[Deepgram Streaming STT]
      ↓
[Live Transcription Display]
      ↓
[User confirms / auto-submit na pauze]
      ↓
[Intent Classification]
      ↓
[Bouwblok]
```

### 6.2 Voice Commands
- Wake phrase niet nodig (expliciete mic button)
- Continu luisteren tijdens bouwblok voor dicteren
- "Klaar" of "Opslaan" als voice command

---

## 7. Technische Architectuur

### 7.1 Nieuwe Routes

```
/app
  /(app)
    /command-center
      /page.tsx              # Hoofdscherm met input
      /components/
        CommandInput.tsx     # Tekst + voice input
        BuildingBlock.tsx    # Container voor actief blok
        ContextBar.tsx       # Context info display
        RecentActions.tsx    # Recent items
    
    /api
      /intent
        /classify/route.ts   # AI intent classification
      /context
        /route.ts            # Get/set user context
```

### 7.2 Building Blocks als Components

```
/components/building-blocks/
  /rapportage/
    RapportageBlock.tsx
    RapportageBlock.types.ts
  /intake/
    IntakeBlock.tsx
    IntakeBlock.types.ts
  /behandelplan/
    BehandelplanBlock.tsx
  /overdracht/
    OverdrachtBlock.tsx
  /dagnotitie/
    DagnotitieBlock.tsx
  /zoeken/
    ZoekenBlock.tsx
  /agenda/
    AgendaBlock.tsx
  /metingen/
    MetingenBlock.tsx
  
  /shared/
    BlockContainer.tsx       # Wrapper met header, minimize, close
    BlockHeader.tsx
    PatientSelector.tsx
    ConfirmationToast.tsx
```

### 7.3 State Management

```typescript
// stores/commandCenterStore.ts
interface CommandCenterState {
  // Active block
  activeBlock: BlockType | null;
  blockData: Record<string, any>;
  
  // Context
  activePatient: Patient | null;
  recentActions: Action[];
  
  // Input
  inputMode: 'text' | 'voice';
  isListening: boolean;
  transcript: string;
  
  // Actions
  setActiveBlock: (block: BlockType, data?: any) => void;
  closeBlock: () => void;
  setActivePatient: (patient: Patient) => void;
  addRecentAction: (action: Action) => void;
}
```

---

## 8. User Flows

### 8.1 Happy Path: Rapportage na gesprek

```
1. User opent Command Center
2. Ziet: lege input, context "Ochtend dienst, 8 patiënten"
3. Spreekt: "Ik heb net een gesprek gehad met Jan de Vries"
4. Systeem:
   - Herkent intent: rapportage
   - Herkent entity: patient = "Jan de Vries"
   - Zoekt patient in DB
   - Opent Rapportage bouwblok met Jan geselecteerd
5. User dicteert inhoud gesprek
6. Klikt "AI Samenvatten"
7. Review en opslaan
8. Bouwblok minimaliseert
9. Klaar voor volgende actie
```

### 8.2 Ambigue Input

```
1. User typt: "notitie"
2. Systeem: confidence < 0.7, geen patient
3. Toont: "Voor welke patiënt wil je een notitie maken?"
4. User: "Jan"
5. Systeem: meerdere "Jan" in DB
6. Toont: selector met matches
7. User selecteert
8. Opent Dagnotitie bouwblok
```

### 8.3 Context Switch

```
1. User werkt in Rapportage voor Jan
2. Spreekt: "Wacht, even medicatie noteren voor Piet"
3. Systeem:
   - Herkent nieuwe intent + patient
   - Vraagt: "Rapportage voor Jan opslaan als concept?"
4. User: "Ja"
5. Rapportage minimized als "Jan - Concept"
6. Dagnotitie opent voor Piet
7. Na opslaan: "Terug naar Jan's rapportage?"
```

---

## 9. Niet in Scope (v1)

- Volledige voice-only mode (voice is input, niet navigatie)
- Multi-user realtime collaboration
- Offline mode
- Native mobile app (wel responsive web)
- Integratie met externe EPD's (later: FHIR)
- Volledig geautomatiseerde workflows (user blijft in control)
- AI-gegenereerde UI componenten (alleen voorgedefinieerde blokken)

---

## 10. Succescriteria

### Functioneel
- [ ] 8 bouwblokken werkend met pre-fill
- [ ] Intent classification >85% accuracy op test set
- [ ] Voice input werkend met Deepgram
- [ ] Context persistence binnen sessie
- [ ] Gemiddeld <3 interacties tot taak compleet

### Performance
- [ ] Intent classification <500ms
- [ ] Bouwblok render <200ms
- [ ] Voice transcription realtime (<100ms latency)

### UX
- [ ] Zero training needed voor basis flows
- [ ] "Dit voelt als magie" feedback van test users
- [ ] 50% minder klikken vs traditionele navigatie (gemeten)

### Business
- [ ] Demo-ready voor Nedap gesprek (7 jan)
- [ ] LinkedIn content: 4 posts over ephemeral UI concept
- [ ] Minimaal 2 concrete interesse-uitingen van GGZ partijen

---

## 11. Fasering

### Fase 1: Foundation (Week 1)
- [ ] Command Center basis UI
- [ ] Intent classification API
- [ ] 2 bouwblokken: Rapportage + Dagnotitie
- [ ] Context management basis

### Fase 2: Core Blocks (Week 2)
- [ ] Voice input integratie
- [ ] Bouwblokken: Zoeken, Overdracht, Behandelplan
- [ ] Pre-fill logica uitbreiden
- [ ] Recent actions tracking

### Fase 3: Polish (Week 3)
- [ ] Bouwblokken: Intake, Agenda, Metingen
- [ ] Animaties en transitions
- [ ] Error handling en edge cases
- [ ] Performance optimalisatie

### Fase 4: Demo Ready (Week 4)
- [ ] End-to-end testing
- [ ] Demo script en scenario's
- [ ] Documentation
- [ ] LinkedIn content

---

## 12. Risico's

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| Intent classification onnauwkeurig | Hoog | Fallback naar handmatige selectie, train op GGZ vocabulaire |
| Voice transcription slecht in Nederlands | Middel | Deepgram NL model testen, fallback naar tekst |
| Gebruikers missen "overzicht" | Middel | Dashboard/overzicht als alternatieve entry point |
| Te veel edge cases | Hoog | Focus op 3-5 happy paths voor demo |
| Performance AI calls | Middel | Caching, streaming responses |

---

## 13. Appendix: Intent Training Data (voorbeelden)

```json
[
  {"input": "gesprek gehad met jan de vries", "intent": "rapportage", "entities": {"patient_name": "jan de vries"}},
  {"input": "notitie maken", "intent": "dagnotitie", "entities": {}},
  {"input": "nieuwe patient aanmelden", "intent": "intake", "entities": {}},
  {"input": "overdracht voor de avonddienst", "intent": "overdracht", "entities": {}},
  {"input": "zoek marie", "intent": "zoeken", "entities": {"patient_name": "marie"}},
  {"input": "mijn afspraken vandaag", "intent": "agenda", "entities": {"date": "today"}},
  {"input": "bloeddruk 140/90 bij piet", "intent": "metingen", "entities": {"patient_name": "piet", "measurement_type": "bloeddruk"}},
  {"input": "behandelplan opstellen", "intent": "behandelplan", "entities": {}}
]
```

---

## Wijzigingslog

| Versie | Datum | Wijzigingen |
|--------|-------|-------------|
| 1.0 | dec 2024 | Initiële versie |