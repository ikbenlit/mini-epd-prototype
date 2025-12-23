# 🧩 Functioneel Ontwerp (FO) — Swift: Contextual UI EPD

**Projectnaam:** Swift — Contextual UI EPD  
**Versie:** v1.0  
**Datum:** 23-12-2024  
**Auteur:** Colin Lit  

---

## 1. Doel en relatie met het PRD

🎯 **Doel van dit document:**
Dit Functioneel Ontwerp beschrijft **hoe** Swift uit het PRD functioneel werkt — wat de gebruiker ziet, doet en ervaart. Waar het PRD het concept en de architectuur beschrijft, laat dit FO zien hoe elke interactie in de praktijk werkt.

📘 **Relatie met andere documenten:**
- **PRD:** `nextgen-epd-prd-ephemeral-ui-epd.md` — Wat en waarom
- **UX/UI:** `ux-ui-design-ephemeral-ui-epd-v2.1.md` — Visuele specificaties
- **Taken analyse:** `taken-en-vragen-analyse.md` — Frequentie en prioritering

**Kernprincipe:**
> De gebruiker navigeert niet door menu's. De gebruiker spreekt of typt een intentie — en het juiste bouwblok verschijnt, voorgevuld met relevante data.

---

## 2. Overzicht van de belangrijkste onderdelen

🎯 **Doel:** Overzicht van alle modules en hun relaties.

### 2.1 Systeemcomponenten

| # | Component | Beschrijving | Type |
|---|-----------|--------------|------|
| 1 | **Command Center** | Hoofdscherm met één input | Scherm |
| 2 | **Context Bar** | Dienst, patiënt, user info | UI Zone |
| 3 | **Canvas Area** | Waar blocks verschijnen | UI Zone |
| 4 | **Recent Strip** | Laatste acties quick access | UI Zone |
| 5 | **Command Input** | Tekst + voice input | UI Zone |
| 6 | **Intent Engine** | Classificeert gebruikersinput | Backend |
| 7 | **Context Manager** | Beheert sessie context | Backend |

### 2.2 Bouwblokken (Blocks)

| Prio | Block | Functie | Trigger voorbeelden |
|------|-------|---------|---------------------|
| P1 | **DagnotatieBlock** | Snelle notitie invoer | "notitie jan medicatie" |
| P1 | **ZoekenBlock** | Patiënt zoeken | "zoek marie" |
| P1 | **PatientContextCard** | Patiënt overzicht | Na zoeken / selectie |
| P1 | **OverdrachtBlock** | Dienst overdracht | "overdracht maken" |
| P2 | **RapportageBlock** | Behandelrapportage | "gesprek gehad met jan" |
| P2 | **AgendaBlock** | Afspraken | "mijn afspraken" |
| P2 | **MetingenBlock** | Vitale functies | "bloeddruk invoeren" |
| P3 | **IntakeWizard** | Nieuwe patiënt intake | "nieuwe intake" |
| P3 | **BehandelplanBlock** | Behandelplan | "behandelplan jan" |
| P3 | **RisicoBlock** | Risicotaxatie | "risico jan" |
| P3 | **ContactenBlock** | Contactpersonen | "contacten jan" |

### 2.3 Systeem Blocks

| Block | Functie | Trigger |
|-------|---------|---------|
| **HelpBlock** | Hulp en voorbeelden | "help", "wat kan ik" |
| **FallbackPicker** | Visuele keuze bij onduidelijkheid | Lage confidence |

---

## 3. User Stories

🎯 **Doel:** Beschrijven wat gebruikers moeten kunnen doen, vanuit hun perspectief.

### 3.1 P1: Kritieke Stories (MVP Week 1-2)

| ID | Rol | Doel / Actie | Verwachte waarde | Prio |
|----|-----|--------------|------------------|------|
| US-01 | Verpleegkundige | Dagnotitie maken door te spreken/typen | Registratie in 15 sec ipv 5 min | 🔴 P1 |
| US-02 | Verpleegkundige | Patiënt zoeken op naam | Direct vinden zonder navigatie | 🔴 P1 |
| US-03 | Verpleegkundige | Patiënt context zien na selectie | Alles relevante in één oogopslag | 🔴 P1 |
| US-04 | Verpleegkundige | Overdracht maken einde dienst | Complete overdracht in 5 min | 🔴 P1 |
| US-05 | Alle gebruikers | Weten wat het systeem kan | "help" toont mogelijkheden | 🔴 P1 |
| US-06 | Alle gebruikers | Kiezen als systeem niet begrijpt | Visuele fallback picker | 🔴 P1 |

### 3.2 P2: Belangrijke Stories (MVP Week 3-4)

| ID | Rol | Doel / Actie | Verwachte waarde | Prio |
|----|-----|--------------|------------------|------|
| US-07 | Behandelaar | Rapportage schrijven na gesprek | Dicteren + AI samenvatting | 🟡 P2 |
| US-08 | Behandelaar | Agenda bekijken | Afspraken vandaag/week | 🟡 P2 |
| US-09 | Verpleegkundige | Meting invoeren | Vitals met trend indicator | 🟡 P2 |
| US-10 | Behandelaar | Diagnose/plan van patiënt zien | Via PatientContextCard | 🟡 P2 |

### 3.3 P3: Post-MVP Stories

| ID | Rol | Doel / Actie | Verwachte waarde | Prio |
|----|-----|--------------|------------------|------|
| US-11 | Behandelaar | Nieuwe intake starten | Wizard begeleidt proces | 🟢 P3 |
| US-12 | Behandelaar | Behandelplan maken/bewerken | AI-gegenereerd, bewerkbaar | 🟢 P3 |
| US-13 | Verpleegkundige | Risicotaxatie invullen | Gestructureerd formulier | 🟢 P3 |
| US-14 | Behandelaar | Contactpersonen beheren | Noodcontact, familie | 🟢 P3 |

---

## 4. Functionele werking per onderdeel

🎯 **Doel:** Per component beschrijven wat de gebruiker kan doen en wat het systeem doet.

### 4.1 Command Center (Hoofdscherm)

**Beschrijving:**
Het enige scherm van de applicatie. Geen sidebar, geen menu's. Alles gebeurt via één input.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Context Bar: Dienst | Patiënt dropdown | User]          48px │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    [Active Block Area]                          │
│                    Blocks verschijnen hier                      │
│                    Centered, responsive width                   │
│                                                          Flex   │
├─────────────────────────────────────────────────────────────────┤
│  [Recent Strip: laatste acties als badges]                48px │
├─────────────────────────────────────────────────────────────────┤
│  [Command Input: 🎤 Typ of spreek wat je wilt doen...]    64px │
└─────────────────────────────────────────────────────────────────┘
```

**Gedrag:**
- Bij laden: Command Input heeft focus
- Keyboard shortcut `⌘K` focust input vanaf elke plek
- Blocks verschijnen met fade+scale animatie
- Slechts één block actief tegelijk (of gestapeld met z-index)

---

### 4.2 Context Bar

**Functie:** Toont essentiële context: welke dienst, welke patiënt actief, wie ingelogd.

**Elementen:**

| Element | Locatie | Gedrag |
|---------|---------|--------|
| Dienst indicator | Links | "🌅 Ochtend \| 8 ptn" — kleur per shift |
| Actieve patiënt | Midden-rechts | Dropdown voor quick-switch |
| User | Rechts | Initialen, klik → logout |

**Dienst bepaling:**

| Dienst | Tijd | Kleur | Icon |
|--------|------|-------|------|
| Ochtend | 07:00-15:00 | Amber #F59E0B | 🌅 |
| Middag | 15:00-23:00 | Blue #3B82F6 | 🌤️ |
| Nacht | 23:00-07:00 | Indigo #6366F1 | 🌙 |

**Patiënt Dropdown:**
- Toont huidige selectie (of "Geen patiënt")
- Recent bekeken patiënten (max 5)
- Zoek optie onderaan
- "Clear" optie om selectie te wissen

---

### 4.3 Command Input

**Functie:** Het hart van de interface — tekst én voice input.

**States:**

| State | Weergave | Trigger |
|-------|----------|---------|
| Default | "🎤 Typ of spreek wat je wilt doen..." | — |
| Typing | Cursor, getypte tekst | Keyboard input |
| Listening | 🔴 + waveform + live transcript | Mic click of spatie (bij leeg) |
| Processing | ⏳ spinner + "Even kijken..." | Na submit |

**Acties:**

| Input | Actie |
|-------|-------|
| `Enter` | Submit naar Intent Engine |
| `Escape` | Clear input / close block |
| `↑` | Vorige command (history) |
| `Space` (leeg) | Start voice |
| Mic click | Toggle voice recording |

**Voice Flow:**
1. User klikt mic of drukt spatie (bij lege input)
2. Deepgram start streaming transcription
3. Live transcript verschijnt in input
4. Pauze detectie (1.5 sec stilte) → auto-submit
5. Of user klikt "Stop" → submit

---

### 4.4 Intent Engine

**Functie:** Classificeert gebruikersinput naar intent + entities.

**Input:**
```typescript
{
  text: string;           // "notitie jan medicatie gegeven"
  context: {
    activePatient?: Patient;
    currentShift: 'ochtend' | 'middag' | 'nacht';
    recentPatients: Patient[];
  }
}
```

**Output:**
```typescript
{
  intent: IntentType;      // 'dagnotitie'
  confidence: number;      // 0.94
  entities: {
    patientName?: string;  // "jan"
    patientId?: string;    // "uuid-123" (als gevonden)
    category?: string;     // "medicatie"
    content?: string;      // "gegeven"
    date?: string;
  };
  clarificationNeeded: boolean;
  clarificationQuestion?: string;
}
```

**Intent Types:**

| Intent | Block | Confidence drempel |
|--------|-------|-------------------|
| `dagnotitie` | DagnotatieBlock | 0.7 |
| `zoeken` | ZoekenBlock | 0.7 |
| `overdracht` | OverdrachtBlock | 0.8 |
| `rapportage` | RapportageBlock | 0.7 |
| `agenda` | AgendaBlock | 0.7 |
| `metingen` | MetingenBlock | 0.7 |
| `intake` | IntakeWizard | 0.8 |
| `behandelplan` | BehandelplanBlock | 0.8 |
| `risico` | RisicoBlock | 0.8 |
| `patient_info` | PatientContextCard | 0.7 |
| `help` | HelpBlock | 0.9 |
| `onbekend` | FallbackPicker | < 0.5 |

**Clarification Flow:**
- Confidence < drempel → vraag om verduidelijking
- Meerdere patient matches → toon selector
- Geen patient bij patient-required intent → vraag welke patient

---

### 4.5 DagnotatieBlock

**Functie:** Snelle notitie invoer — meest gebruikte actie (10-20x per dag).

**Trigger patterns:**
- "notitie [patient]"
- "[patient] medicatie gegeven"
- "incident bij [patient]"
- "[patient] heeft goed gegeten"

**Pre-fill logica:**

| Extracted | Pre-fill |
|-----------|----------|
| patient_name → match | Patient selector |
| "medicatie" keyword | Category = Medicatie |
| "gegeten", "ADL" | Category = ADL |
| "incident", "agressie" | Category = Incident |
| Overige tekst | Notitie veld |

**Form velden:**

| Veld | Type | Verplicht | Default |
|------|------|-----------|---------|
| Patient | Dropdown + search | Ja | Pre-filled of activePatient |
| Categorie | Button group | Ja | Extracted of Algemeen |
| Notitie | Textarea | Ja | Extracted content |
| Tijd | Time picker | Ja | Nu |
| In overdracht | Checkbox | Nee | false |

**Categorieën:**

| Categorie | Icon | Kleur | Keyboard |
|-----------|------|-------|----------|
| Medicatie | 💊 | Amber | 1 |
| ADL | 🍽️ | Green | 2 |
| Observatie | 👁️ | Blue | 3 |
| Incident | ⚠️ | Red | 4 |
| Algemeen | 💬 | Gray | 5 |

**Acties:**

| Knop | Actie | Keyboard |
|------|-------|----------|
| Opslaan | POST naar API, sluit block | `⌘Enter` |
| Annuleren | Sluit block zonder opslaan | `Escape` |

**Na opslaan:**
1. Toast: "✓ Notitie opgeslagen"
2. Block verdwijnt (200ms animatie)
3. Recent strip: badge "[📝 Jan-Med]"
4. Input krijgt focus voor volgende actie

**API:**
```
POST /api/reports
Body: {
  patient_id: string,
  type: 'nursing_log',
  category: string,
  content: string,
  timestamp: datetime,
  include_in_handover: boolean
}
```

---

### 4.6 ZoekenBlock

**Functie:** Patiënt zoeken en selecteren.

**Trigger patterns:**
- "zoek [naam]"
- "wie is [naam]"
- "vind [naam]"

**Gedrag:**
1. Block opent met zoekterm pre-filled
2. Live search (debounced 300ms)
3. Resultaten tonen met relevante info
4. Klik of Enter selecteert patiënt

**Resultaat card bevat:**
- Naam (highlighted match)
- Leeftijd
- Kamer/locatie
- Laatste activiteit ("2 uur geleden")
- Alert badge indien aanwezig

**Na selectie:**
1. ZoekenBlock sluit
2. PatientContextCard opent automatisch
3. Context Bar update: patient dropdown toont selectie
4. Recent strip: badge "[🔍 Jan]"

**Empty state:**
"Geen patiënten gevonden voor '[zoekterm]'"

**API:**
```
GET /api/patients/search?q={zoekterm}
Response: Patient[] met relevance score
```

---

### 4.7 PatientContextCard

**Functie:** Compact overzicht van alles relevant voor één patiënt.

**Trigger:**
- Automatisch na patiënt selectie
- "info [patient]", "dossier [patient]"
- Klik op patiënt in dropdown

**Secties (adaptive - alleen tonen als data aanwezig):**

| Sectie | Data | Bron |
|--------|------|------|
| Header | Naam, leeftijd, kamer, opnamedatum | patients |
| Alert | Actieve alerts/risico's | risk_assessments |
| Laatste notities | 3 meest recente | reports |
| Vitals | Vandaag gemeten | vitals |
| Diagnose | Hoofddiagnose + ernst | conditions |
| Behandelplan | Status, sessie X/Y, volgende eval | care_plans |
| Contacten | Primaire contact | contacts |

**Quick Actions (onderaan):**
```
[📝 Notitie] [📋 Rapport] [📊 Meting] [📄 Plan] [📞 Contact]
```

Klik op quick action → opent betreffende block met patient pre-filled.

**API:**
```
GET /api/patients/{id}/context
Response: {
  patient: Patient,
  alerts: Alert[],
  recentNotes: Report[],
  vitals: Vital[],
  diagnosis: Condition,
  carePlan: CarePlan,
  contacts: Contact[]
}
```

---

### 4.8 OverdrachtBlock

**Functie:** Multi-patiënt overdracht met AI-samenvattingen.

**Trigger patterns:**
- "overdracht maken"
- "dienst klaar"
- "samenvatting voor collega"

**Proactive trigger:**
- 30 minuten voor dienst einde → suggestie banner

**Layout:**
- Header: "Overdracht [Ochtend] → [Middag]" + tijdrange
- Accordion per patiënt (expanded als alert aanwezig)
- AI samenvatting per patiënt
- Bronverwijzingen naar originele notities
- Footer: Kopieer / E-mail / Afronden

**Per patiënt accordion:**

| Element | Beschrijving |
|---------|--------------|
| Header | Naam + alert badge |
| Summary | AI-gegenereerde samenvatting |
| Bronnen | "📎 3 notities" — klik opent details |
| Bewerken | Inline edit van samenvatting |

**AI Samenvatting:**
- Gegenereerd op basis van: nursing_logs, vitals, rapportages
- Tijdrange: huidige dienst (default 8 uur)
- Max 3 zinnen per patiënt
- Aandachtspunten prominent

**Acties:**

| Knop | Actie |
|------|-------|
| Kopieer alles | Alle samenvattingen naar clipboard |
| E-mail | Open mail client met content |
| Afronden | Markeer overdracht compleet |

**API:**
```
POST /api/overdracht/generate
Body: {
  patientIds: string[],
  shiftStart: datetime,
  shiftEnd: datetime
}
Response: {
  summaries: { patientId: string, summary: string, sources: Source[] }[]
}
```

---

### 4.9 RapportageBlock

**Functie:** Uitgebreide behandelrapportage met rich text en AI.

**Trigger patterns:**
- "rapportage"
- "gesprek gehad met [patient]"
- "behandelgesprek"

**Form velden:**

| Veld | Type | Default |
|------|------|---------|
| Patient | Dropdown | Pre-filled of activePatient |
| Type | Button group | Gesprek |
| Inhoud | Rich text (TipTap) | Leeg of transcript |
| Datum/tijd | DateTime | Nu |

**Rapportage types:**
- Gesprek
- Evaluatie
- Telefonisch
- Consult
- Familie

**Rich text toolbar:**
- Bold, Italic
- Bullet list, Numbered list
- Quote
- H1, H2
- 🎤 Dicteer knop

**AI acties:**

| Actie | Beschrijving | Output |
|-------|--------------|--------|
| ✨ Samenvatten | Bullets van kernpunten | Zijpaneel |
| 📖 B1-niveau | Herschrijf leesbaar | Zijpaneel |
| 🔍 Problemen | Extraheer klinische issues | Zijpaneel |

**AI Zijpaneel:**
- Verschijnt rechts van editor
- Preview van AI output
- Knoppen: Invoegen, Kopiëren, Verwerp

**API:**
```
POST /api/reports
Body: {
  patient_id: string,
  type: 'rapportage',
  subtype: string,
  content: string (HTML),
  timestamp: datetime
}
```

---

### 4.10 AgendaBlock

**Functie:** Afspraken overzicht en beheer.

**Trigger patterns:**
- "agenda"
- "afspraken vandaag"
- "wie zie ik deze week"
- "afspraken [patient]"

**Layout:**
- Navigatie: [◀ Gisteren] [Vandaag] [Morgen ▶]
- View toggle: [Dag] [Week]
- Lijst van afspraken met tijden

**Per afspraak:**
- Tijd (09:00 - 09:50)
- Patiëntnaam
- Type afspraak
- Quick actions: [Open dossier] [Notitie]

**Acties:**
- Klik op afspraak → open PatientContextCard
- [+ Nieuwe afspraak] → AfspraakBlock (P4)

**API:**
```
GET /api/appointments?date={date}&practitionerId={id}
Response: Appointment[]
```

---

### 4.11 MetingenBlock

**Functie:** Vitale functies invoeren.

**Trigger patterns:**
- "bloeddruk invoeren"
- "meting [patient]"
- "vitals"
- "temperatuur"

**Form velden:**

| Veld | Type | Validatie |
|------|------|-----------|
| Patient | Dropdown | Verplicht |
| Type | Button group | Verplicht |
| Waarde(s) | Number input(s) | Per type |
| Tijd | DateTime | Default: nu |
| Opmerking | Textarea | Optioneel |

**Meting types:**

| Type | Velden | Eenheid |
|------|--------|---------|
| Bloeddruk | Systolisch, Diastolisch | mmHg |
| Pols | BPM | /min |
| Temperatuur | Temp | °C |
| Gewicht | Kg | kg |
| Glucose | mmol/L | mmol/L |
| Saturatie | % | SpO2 |

**Trend indicator:**
Na invoer: vergelijk met vorige meting
- ↑ Hoger dan vorige
- ↓ Lager dan vorige
- → Gelijk

**API:**
```
POST /api/vitals
Body: {
  patient_id: string,
  type: string,
  values: Record<string, number>,
  timestamp: datetime,
  notes?: string
}
```

---

### 4.12 HelpBlock

**Functie:** Toont wat het systeem kan.

**Trigger patterns:**
- "help"
- "wat kan ik doen"
- "hoe werkt dit"

**Inhoud:**
Gegroepeerde voorbeelden per categorie:
- 📝 Notities: "notitie jan medicatie"
- 🔍 Zoeken: "zoek marie"
- 🔄 Overdracht: "overdracht maken"
- 📋 Rapportage: "gesprek gehad"
- 📅 Agenda: "afspraken vandaag"
- etc.

---

### 4.13 FallbackPicker

**Functie:** Visuele keuze wanneer intent onduidelijk is.

**Trigger:**
- Intent confidence < 0.5
- Intent = 'onbekend'

**Layout:**
Grid van 8-10 opties met icon + label.
Keyboard shortcuts 1-9 voor snelle selectie.

**Opties:**
```
[📝 Notitie] [🔍 Zoeken] [🔄 Overdracht] [📋 Rapport]
[📅 Agenda]  [📊 Meting] [👤 Dossier]   [📄 Intake]
[⚠️ Risico]  [💡 Help]
```

---

### 4.14 Recent Strip

**Functie:** Quick access naar recente acties.

**Gedrag:**
- Max 5 badges zichtbaar
- Nieuwste links
- Horizontal scroll voor meer
- Klik = heropen context

**Badge types:**

| Type | Icon | Kleur | Klik actie |
|------|------|-------|------------|
| Dagnotitie | 📝 | Category kleur | Open PatientContextCard |
| Zoeken | 🔍 | Gray | Open PatientContextCard |
| Overdracht | 🔄 | Blue | Open OverdrachtBlock |
| Rapportage | 📋 | Green | Open RapportageBlock |

---

## 5. UI-overzicht (visuele structuur)

🎯 **Doel:** Globale schermopbouw en component hiërarchie.

### 5.1 Hoofdlayout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🌅 Ochtend | 8 ptn              Jan de Vries ▼      👤 SV │ │
│  └───────────────────────────────────────────────────────────┘ │
│                        CONTEXT BAR (48px)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                                                                 │
│                    ┌─────────────────────┐                      │
│                    │                     │                      │
│                    │    ACTIVE BLOCK     │                      │
│                    │    (Small: 480px)   │                      │
│                    │    (Medium: 640px)  │                      │
│                    │    (Large: 900px)   │                      │
│                    │                     │                      │
│                    └─────────────────────┘                      │
│                                                                 │
│                         CANVAS AREA (flex)                      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Recent: [📝 Jan-Med] [🔄 Overdracht] [🔍 Marie]           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                       RECENT STRIP (48px)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🎤  Typ of spreek wat je wilt doen...                ⌘K  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                       COMMAND INPUT (64px)                      │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Block Sizes

| Size | Max-width | Use case |
|------|-----------|----------|
| Small | 480px | Quick entry (notitie, zoeken, meting) |
| Medium | 640px | Forms (rapportage, behandelplan) |
| Large | 900px | Overzichten (overdracht, agenda) |
| XLarge | 1100px | Wizards (intake) |

### 5.3 Block Container

Alle blocks gebruiken dezelfde wrapper:

```
┌─────────────────────────────────────────────────────────────────┐
│  [Icon] [Title]                                     [−] [×]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                        BLOCK CONTENT                            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                           [Cancel] [Save]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Interacties met AI (functionele beschrijving)

🎯 **Doel:** Waar AI in de flow voorkomt en wat de gebruiker ziet.

### 6.1 Intent Classification

| Locatie | Trigger | Input | Output |
|---------|---------|-------|--------|
| Command Input | Submit | Tekst/transcript | Intent + entities + confidence |

### 6.2 Content AI

| Locatie | AI-actie | Trigger | Output |
|---------|----------|---------|--------|
| RapportageBlock | Samenvatten | Klik knop | Bullets in zijpaneel |
| RapportageBlock | B1-niveau | Klik knop | Herschreven tekst |
| RapportageBlock | Extract problemen | Klik knop | Categorie + severity |
| OverdrachtBlock | Genereer samenvatting | Per patiënt accordion | 3-zin summary |
| BehandelplanBlock | Genereer plan | Klik knop | Doelen + interventies |
| IntakeWizard | Suggestie diagnose | Na anamnese stap | ICD-10 code + rationale |

### 6.3 AI Response Handling

**Alle AI outputs:**
1. Tonen in dedicated preview area (niet direct in form)
2. User moet expliciet accepteren/invoegen
3. Bewerken altijd mogelijk
4. Annuleren zonder gevolgen

**Loading state:**
- Skeleton loader in output area
- "AI denkt na..." indicator
- Non-blocking (user kan annuleren)

**Error handling:**
- "Kon niet verwerken. Probeer opnieuw."
- Retry knop
- Fallback naar handmatige invoer

---

## 7. Proactieve Triggers

🎯 **Doel:** Wanneer het systeem zelf UI toont zonder expliciete vraag.

| Trigger | Conditie | Actie |
|---------|----------|-------|
| Dienst start | Login of shift wissel | Suggestie: OverdrachtLezenBlock |
| Dienst einde | 30 min voor einde | Banner: "Overdracht maken?" |
| Patiënt geselecteerd | Na zoeken/klik | Auto-open PatientContextCard |
| Afspraak nadert | 15 min voor afspraak | Suggestie: patiënt openen |
| Alert aanwezig | Patiënt met actief risico | Alert banner in PatientContextCard |

**Suggestie Banner:**
```
┌───────────────────────────────────────────────────────────────┐
│ 🕐 Dienst eindigt over 30 min. Overdracht maken?              │
│                                        [Ja] [Later] [×]       │
└───────────────────────────────────────────────────────────────┘
```

- Niet-blokkerend (user kan negeren)
- "Later" = herinner over 15 min
- "×" = niet meer voor deze dienst

---

## 8. States & Error Handling

### 8.1 Block States

| State | Weergave |
|-------|----------|
| Loading | Skeleton loader |
| Ready | Form/content |
| Submitting | Disabled + spinner |
| Success | Toast + close |
| Error | Inline error message |

### 8.2 Network Errors

| Situatie | Gedrag |
|----------|--------|
| API timeout | "Verbinding verbroken. Probeer opnieuw." + retry |
| 401 Unauthorized | Redirect naar login |
| 500 Server error | "Er ging iets mis. Probeer later opnieuw." |
| Offline | Banner bovenin: "Geen internetverbinding" |

### 8.3 Validation Errors

| Veld | Validatie | Foutmelding |
|------|-----------|-------------|
| Patient | Verplicht | "Selecteer een patiënt" |
| Notitie | Min 5 karakters | "Voer een notitie in" |
| Bloeddruk | 50-250 / 30-150 | "Waarde buiten bereik" |

---

## 9. Gebruikersrollen en rechten

🎯 **Doel:** Welke rollen toegang hebben tot welke onderdelen.

| Rol | Toegang | Beperkingen |
|-----|---------|-------------|
| Verpleegkundige | Dagnotitie, Zoeken, Overdracht, Metingen | Geen behandelplan bewerken |
| Behandelaar | Alle blocks | Alleen eigen patiënten bewerken |
| Psychiater | Alle blocks + diagnose | Alleen eigen patiënten |
| Demo-user | Alle blocks (fictieve data) | Alleen lezen |

---

## 10. Keyboard Shortcuts

| Shortcut | Actie | Scope |
|----------|-------|-------|
| `⌘K` | Focus command input | Global |
| `Escape` | Sluit actieve block | Block open |
| `Enter` | Submit form | Form focused |
| `⌘Enter` | Opslaan | In form |
| `1-5` | Selecteer categorie | DagnotatieBlock |
| `1-9` | Selecteer optie | FallbackPicker |
| `↑` `↓` | Navigeer resultaten | ZoekenBlock |
| `Space` | Start voice (lege input) | Command Input |

---

## 11. Navigatie & Toegang

🎯 **Doel:** Beschrijven hoe gebruikers Swift bereiken en kiezen.

### 11.1 User Journey naar Swift

```
LANDINGSPAGINA (/)
        │
        │  Storytelling + Demo
        │
        ▼
LOGIN PAGINA (/login)
        │
        │  ┌─────────────────────────────────────┐
        │  │ Kies je werkwijze:                  │
        │  │                                     │
        │  │ ○ ✨ Swift — Spreek of typ          │
        │  │ ○ 📋 Klassiek — Menu's en forms     │
        │  │                                     │
        │  │ ☐ Onthoud mijn keuze               │
        │  └─────────────────────────────────────┘
        │
        ├──────────────────┬───────────────────┐
        ▼                  ▼                   │
  /epd/swift         /epd/dashboard            │
  (Command Center)   (Klassiek EPD)            │
                                               │
                                               │
                        GEEN TOGGLE ◄──────────┘
                        binnen interface
```

### 11.2 Landingspagina Elementen

De landingspagina introduceert Swift via storytelling:

| Element | Functie |
|---------|---------|
| **Hero** | Probleem: "40% admin tijd" → Oplossing: "1 zin, klaar" |
| **Interactive Demo** | Probeer Swift zonder login |
| **Side-by-side** | 12 klikken klassiek vs 1 zin Swift |
| **Video** | Demo van dagnotitie flow |
| **CTA** | "Aan de slag" → /login |

### 11.3 Login Pagina met Interface Keuze

De login pagina bevat een interface selector:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [Bestaand login formulier - email, wachtwoord]                 │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Kies je werkwijze:                                            │
│                                                                 │
│  ┌───────────────────────┐   ┌───────────────────────┐         │
│  │ ✨ Swift              │   │ 📋 Klassiek           │         │
│  │                       │   │                       │         │
│  │ Spreek of typ wat je  │   │ Vertrouwde menu's     │         │
│  │ wilt — het systeem    │   │ en formulieren        │         │
│  │ begrijpt              │   │                       │         │
│  │                       │   │                       │         │
│  │ "notitie jan med" →   │   │ Dashboard → Patient   │         │
│  │ klaar in 15 sec       │   │ → Tab → Form → Save   │         │
│  └───────────────────────┘   └───────────────────────┘         │
│                                                                 │
│  ☐ Onthoud mijn keuze                                          │
│                                                                 │
│                                       [Inloggen]               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.4 Redirect Gedrag

| Situatie | Gedrag |
|----------|--------|
| Nieuwe user, geen preference | Toon keuze op login pagina |
| User met preference + "onthoud" | Direct door naar gekozen interface |
| User naar `/epd` | Redirect naar preference of dashboard |
| Uitgelogd | Terug naar login met keuze optie |

### 11.5 Geen Toggle in Interface

Er is **geen mogelijkheid** om binnen Swift of Klassiek EPD te wisselen naar de andere interface:

- Geen toggle button in Swift
- Geen toggle button in Klassiek EPD
- Om te wisselen: uitloggen → opnieuw inloggen → andere keuze

**Rationale:**
- Voorkomt verwarring over "waar ben ik"
- Gebruiker committed aan één ervaring
- Admin kan preference aanpassen indien nodig

### 11.6 Admin Beheer

Alleen admins kunnen de interface preference van andere users wijzigen:

| Actie | Wie | Waar |
|-------|-----|------|
| Eigen preference instellen | Alle users | Login pagina |
| Preference andere user wijzigen | Admin | Admin panel |
| Geforceerd naar Swift/Klassiek | Admin | Admin panel |

---

## 12. Bijlagen & Referenties

**Projectdocumenten:**
- PRD: `swift-prd.md`
- UX/UI: `swift-ux-v2.1.md`
- TO: `to-swift-v1.md`
- Taken analyse: `taken-en-vragen-analyse.md`

**Bestaande documentatie:**
- Database schema: Supabase migrations
- Bestaande FO overdracht: `fo-overdracht-dashboard-v1_1.md` (archive)

---

## Wijzigingslog

| Versie | Datum | Wijzigingen |
|--------|-------|-------------|
| 1.0 | 23-12-2024 | Initiële versie op basis van PRD en UX/UI v2.1 |
| 1.1 | 23-12-2024 | Hernoemd naar Swift, toegevoegd: Navigatie & Toegang sectie |