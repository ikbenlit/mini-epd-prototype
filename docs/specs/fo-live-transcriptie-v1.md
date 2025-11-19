# 🧩 Functioneel Ontwerp (FO) — Live Transcriptie & AI Verslag

**Projectnaam:** Mini-ECD - Live Transcriptie Feature  
**Versie:** v1.0  
**Datum:** 19-11-2024  
**Auteur:** Colin van der Heijden (AI Speedrun)  

---

## 1. Doel en relatie met het PRD
🎯 **Doel van dit document:**
Het Functioneel Ontwerp beschrijft **hoe** de live transcriptie en AI-verslag functionaliteit werkt binnen het Mini-ECD systeem. Dit document vertaalt de behoefte uit het PRD ("behandelaars willen minder tijd kwijt zijn aan typen") naar concrete gebruikerservaringen en schermflows.

📘 **Toelichting aan de lezer:**
Dit FO beschrijft twee nauw verbonden features:
1. **Live Transcriptie** - Real-time spraak-naar-tekst tijdens gesprekken (Deepgram)
2. **AI Verslag Structurering** - Transformatie van ruwe transcriptie naar gestructureerd verslag (Claude)

Deze features zijn dé showcase van "Software on Demand" - waar traditionele EPD's 30 minuten handmatig typen vereisen, doen wij dit in 2 minuten AI-tijd.

**Relatie met PRD v1.2:**
- User Story US-02: "Intakeverslag schrijven met AI-ondersteuning"
- Epic E4: "AI Integration" (Week 3)
- Succes criterium: "<5s AI response time"

---

## 2. Overzicht van de belangrijkste onderdelen
🎯 **Doel:** Inzicht in de nieuwe componenten binnen de bestaande EPD-structuur.

**Nieuwe componenten:**
1. **Live Opname Interface** - Microfoon controles, timer, real-time feedback
2. **Transcriptie Editor** - TipTap editor met live text streaming
3. **AI Verslag Generator** - Claude-powered structurering
4. **Audio Management** - Opslaan/deleten opnames (privacy)

**Bestaande componenten (aangepast):**
- Intake Editor - uitgebreid met opname-functionaliteit
- AI Rail - nieuwe actie "Structureer Verslag"
- Client Dashboard - toon opname-status

---

## 3. User Stories

🎯 **Doel:** Beschrijven wat gebruikers moeten kunnen doen vanuit hun perspectief.

| ID | Rol | Doel / Actie | Verwachte waarde | Prioriteit |
|----|------|---------------|------------------|-------------|
| US-10 | Behandelaar | Live opname starten tijdens gesprek | Handen vrij, focus op cliënt | Hoog |
| US-11 | Behandelaar | Real-time zien wat er getranscribeerd wordt | Vertrouwen dat het werkt | Hoog |
| US-12 | Behandelaar | Opname pauzeren (telefoon, onderbreking) | Geen irrelevante tekst in verslag | Middel |
| US-13 | Behandelaar | Transcriptie handmatig corrigeren | Controle over eindresultaat | Hoog |
| US-14 | Behandelaar | AI laten structureren tot verslag | Geen handmatig herstructureren | Hoog |
| US-15 | Behandelaar | Audio bewaren voor verificatie | Terughoren bij onduidelijkheid | Laag |
| US-16 | Demo-bezoeker | Live demo zien werken | Geloven dat het echt werkt | Kritiek |
| US-17 | Privacy Officer | Audio auto-delete na X dagen | AVG compliance | Middel |

---

## 4. Functionele werking per onderdeel

### 4.1 Live Opname Interface

**Functionaliteit:**
* Microfoon permissie vragen (browser native)
* Audio stream naar Deepgram websocket
* Real-time transcriptie ontvangen
* Visual feedback (recording indicator, timer)

**Schermopbouw:**
```
┌─────────────────────────────────────────────────────────┐
│ Intake: Lisa de Jong                  [🎤 OPNAME 00:12:34] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 🔴 Aan het opnemen...                           │  │
│  │                                                  │  │
│  │ Laatst: "...moeilijk weer inslapen"             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  [TipTap Editor - Real-time transcriptie]              │
│                                                         │
│  Client geeft aan dat ze al 3 maanden last heeft van   │
│  slaapproblemen. Ze wordt 's nachts wakker en kan      │
│  moeilijk weer inslapen...█                            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ [⏸️ Pauzeer]  [⏹️ Stop & Bewaar]  [🗑️ Annuleer]         │
└─────────────────────────────────────────────────────────┘
```

**States:**
- **Initieel**: Knop "🎤 Start Opname" boven editor
- **Permission gevraagd**: Modal "Geef toegang tot microfoon"
- **Recording**: Rode indicator, timer loopt, tekst verschijnt
- **Paused**: Gele indicator, timer gestopt, "Hervatten" knop
- **Stopped**: Transcriptie volledig, "Bewerken" of "AI Structureren"

**Interacties:**
1. **Start Opname**
   - Klik 🎤 Start Opname
   - Browser vraagt mic permission
   - Websocket verbinding naar Deepgram
   - Timer start (00:00:00)
   - Rode 🔴 indicator verschijnt

2. **Tijdens Opname**
   - Gebruiker praat
   - Deepgram stuurt tekst chunks terug
   - TipTap editor append tekst real-time
   - Laatste paar woorden highlighted (fade effect)
   - Handmatig typen/corrigeren is mogelijk

3. **Pauzeren**
   - Klik ⏸️ Pauzeer
   - Websocket blijft open maar stuurt geen audio
   - Timer stopt
   - Indicator wordt geel 🟡
   - Klik opnieuw → Hervatten

4. **Stoppen**
   - Klik ⏹️ Stop & Bewaar
   - Websocket sluit
   - Final transcriptie in editor
   - Audio lokaal opgeslagen (optioneel)
   - Overschakeling naar "Bewerk Modus"

5. **Annuleren**
   - Klik 🗑️ Annuleer
   - Confirmation: "Weet je het zeker?"
   - Bij ja: transcriptie verwijderen
   - Bij nee: doorgaan met opname

**Error Scenarios:**
- **Geen mic permission**: "Geef toegang tot microfoon om op te nemen"
- **Internet weg**: "Verbinding verbroken. Opname gepauzeerd."
- **Deepgram quota**: "Opname limiet bereikt. Schakel over naar typen?"
- **Browser niet ondersteund**: "Je browser ondersteunt geen opname"

---

### 4.2 Transcriptie Editor

**Functionaliteit:**
* TipTap editor met live text streaming
* Highlight recent toegevoegde tekst
* Manual editing tijdens/na opname
* Auto-save elke 30 seconden
* Undo/redo werkt met live input

**Schermopbouw:**
```
┌─────────────────────────────────────────────────────────┐
│ [TipTap Toolbar: B I U • 1. " ]                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Hoofdklacht:                                            │
│ Client geeft aan dat ze al 3 maanden last heeft van    │
│ slaapproblemen. Ze wordt gemiddeld 3-4 keer per nacht  │
│ wakker en kan dan moeilijk weer inslapen.              │
│                                                         │
│ Context:                                                │
│ De klachten zijn begonnen na een stressvolle periode   │
│ op het werk. [LIVE: Client vertelt dat...]█            │
│                                                         │
│ [Laatste update: zojuist • Auto-save actief]           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- **Live highlighting**: Laatste 20 woorden in lichtblauw, fade naar normaal
- **Typing indicator**: █ cursor pulseert tijdens transcriptie
- **Manual override**: Behandelaar kan tijdens opname typen/corrigeren
- **Smart paragraphs**: Deepgram smart formatting maakt alinea's
- **Timestamps** (optioneel): [00:12:34] markers voor navigatie

**States:**
- **Live transcriptie**: Tekst append + highlight
- **Paused**: Editor blijft bewerkbaar
- **Stopped**: Normale editor modus
- **Saving**: "Opslaan..." indicator
- **Saved**: "✓ Opgeslagen om 14:32"

---

### 4.3 AI Verslag Generator

**Functionaliteit:**
* Claude analyseert ruwe transcriptie
* Structureert in standaard verslag format
* Behoudt feitelijke informatie
* Voegt professionele tone toe

**Workflow:**
```
[Ruwe Transcriptie]
      ↓
[Klik "✨ AI Structureer Verslag"]
      ↓
[Claude verwerking 5-10s]
      ↓
[Preview in AI Rail]
      ↓
[Accepteren → Vervangt origineel]
[OF]
[Aanpassen → Handmatig bewerken]
```

**AI Rail Layout:**
```
┌─────────────────────────────────────┐
│ ✨ AI VERSLAG                       │
├─────────────────────────────────────┤
│                                     │
│ HOOFDKLACHT                         │
│ Cliënt presenteert zich met        │
│ slaapproblemen sinds 3 maanden.     │
│ Nachtelijk ontwaken 3-4x, moeilijk │
│ hervatten slaap.                    │
│                                     │
│ ANAMNESE                            │
│ • Onset na werkstress               │
│ • Geen eerdere slaapklachten        │
│ • Normale slaaphygiëne              │
│                                     │
│ OBSERVATIES                         │
│ • Alert en helder                   │
│ • Vermoeidheid zichtbaar            │
│                                     │
│ PLAN                                │
│ • Vervolgafspraak over 2 weken      │
│ • Slaapdagboek bijhouden            │
│                                     │
├─────────────────────────────────────┤
│ [✓ Accepteer & Vervang]             │
│ [📋 Kopieer]                        │
│ [✏️ Handmatig Aanpassen]            │
│ [❌ Annuleer]                        │
└─────────────────────────────────────┘
```

**Prompt Strategie (voor Claude):**
```
Systeem: Je bent een ervaren GGZ-behandelaar die transcripties 
omzet naar professionele verslagen.

Instructies:
- Structureer in: Hoofdklacht, Anamnese, Observaties, Plan
- Behoud alle feitelijke informatie
- Gebruik professionele maar toegankelijke taal (B1)
- Geen interpretaties, alleen feiten
- Max 400 woorden

Input: [ruwe transcriptie]
Output: [gestructureerd verslag in markdown]
```

**States:**
- **Idle**: Knop "✨ Structureer Verslag" beschikbaar
- **Processing**: Spinner + "AI analyseert..." (5-10s)
- **Preview**: Gestructureerd verslag in rail
- **Accepted**: Vervangt editor content
- **Error**: "Kon niet verwerken. Probeer opnieuw."

**Acties:**
- **Accepteer & Vervang**: Overschrijft originele transcriptie
- **Kopieer**: Naar clipboard (voor elders plakken)
- **Handmatig Aanpassen**: Opent in split-view (links origineel, rechts AI)
- **Annuleer**: Verwerpt AI-versie, behoudt origineel

---

### 4.4 Audio Management

**Functionaliteit:**
* Originele audio opslaan (optioneel)
* Replay functionaliteit
* Privacy-compliant auto-delete
* Storage in Supabase

**UI Elementen:**
```
┌─────────────────────────────────────┐
│ AUDIO OPNAME                        │
├─────────────────────────────────────┤
│ 📁 opname-2024-11-19-14-32.webm     │
│ Duur: 12:34 • 5.2 MB               │
│                                     │
│ [▶️ Afspelen]  [📥 Download]       │
│                                     │
│ ⚠️ Privacy:                         │
│ [ ] Audio bewaren voor verificatie  │
│ [ ] Auto-delete na 7 dagen          │
│                                     │
│ [💾 Opslaan]  [🗑️ Verwijderen]      │
└─────────────────────────────────────┘
```

**Privacy Flow:**
1. **Tijdens opname**: Audio lokaal in browser
2. **Streaming**: Naar Deepgram (niet bewaard door hen)
3. **Na stop**: 
   - Optie 1: Direct deleten (default)
   - Optie 2: Uploaden naar Supabase Storage
4. **Auto-delete**: Cron job verwijdert na X dagen

**Database Schema:**
```typescript
interface AudioRecording {
  id: uuid
  intake_note_id: uuid  // FK naar intake_notes
  storage_path: string  // Supabase Storage path
  duration_seconds: number
  file_size_bytes: number
  created_at: timestamp
  expires_at: timestamp // Auto-delete datum
  deleted: boolean
}
```

---

## 5. UI-overzicht (visuele structuur)

### 5.1 Intake met Live Opname (Volledig scherm)

```
┌──────────────────────────────────────────────────────────────────┐
│ Mini-ECD Logo    |  Intake: Lisa de Jong  |  [🎤 00:12:34] [⚙️] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌────────────────────┐  ┌─────────────────────────────────────┐ │
│ │ SIDEBAR NAV        │  │ EDITOR GEBIED                       │ │
│ │                    │  │                                     │ │
│ │ > Overzicht        │  │ [🔴 AAN HET OPNEMEN]                │ │
│ │ • Intakes          │  │                                     │ │
│ │   Profiel          │  │ [TipTap Editor met live tekst]      │ │
│ │   Plan             │  │                                     │ │
│ │   Afspraken        │  │ Client geeft aan dat ze al...       │ │
│ │                    │  │                                     │ │
│ │                    │  │                                     │ │
│ │                    │  │ [⏸️ Pauzeer] [⏹️ Stop] [🗑️ Annuleer]│ │
│ │                    │  │                                     │ │
│ └────────────────────┘  └─────────────────────────────────────┘ │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ [Toast Area: "✓ Auto-save om 14:32" ]                           │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 AI Verslag Generatie (Split View)

```
┌──────────────────────────────────────────────────────────────────┐
│ Mini-ECD Logo    |  Intake: Lisa de Jong  |  [✨ AI Actief] [⚙️]│
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌──────────────────────────────────┬─────────────────────────────┐
│ │ EDITOR (Originele Transcriptie) │ AI RAIL (Verslag)          │
│ │                                  │                            │
│ │ Client geeft aan dat ze al 3    │ ✨ GESTRUCTUREERD VERSLAG   │
│ │ maanden last heeft van slaap-   │                            │
│ │ problemen. Ze wordt gemiddeld    │ HOOFDKLACHT                │
│ │ 3-4 keer per nacht wakker...    │ Cliënt presenteert zich... │
│ │                                  │                            │
│ │ [250+ woorden ruwe tekst]        │ ANAMNESE                   │
│ │                                  │ • Onset na werkstress      │
│ │                                  │ • Geen eerdere klachten    │
│ │                                  │                            │
│ │                                  │ OBSERVATIES                │
│ │                                  │ • Alert en helder          │
│ │                                  │                            │
│ │                                  │ PLAN                       │
│ │                                  │ • Vervolgafspraak          │
│ │                                  │                            │
│ │                                  │ [✓ Accepteer & Vervang]    │
│ │                                  │ [📋 Kopieer]               │
│ │                                  │ [❌ Annuleer]              │
│ └──────────────────────────────────┴─────────────────────────────┘
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Interacties met AI (functionele beschrijving)

### 6.1 Deepgram (Speech-to-Text)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Klik "🎤 Start Opname" |
| **Input** | Live audio stream van microfoon |
| **Verwerking** | Deepgram Nova-2 model, Nederlands, smart formatting |
| **Output** | Real-time text chunks → append in editor |
| **Latency** | <500ms per chunk |
| **Feedback** | Live typing indicator + highlight recent text |
| **Cost** | €0,0043/min = €0,19 per 45-min gesprek |

**Technische flow:**
```
Browser Mic → Websocket → Deepgram API
                               ↓
                         Text chunks
                               ↓
                        TipTap Editor
```

### 6.2 Claude (Verslag Structurering)

| Aspect | Detail |
|--------|--------|
| **Trigger** | Klik "✨ Structureer Verslag" |
| **Input** | Ruwe transcriptie (TipTap JSON) |
| **Verwerking** | Claude 3.5 Sonnet met GGZ-verslag prompt |
| **Output** | Markdown gestructureerd verslag (4 secties) |
| **Latency** | 5-10 seconden |
| **Feedback** | Spinner → Preview in AI Rail → Accept/Edit |
| **Cost** | ~2000 tokens = €0,006 per verslag |

**Prompt template:**
```typescript
const PROMPT = `
Je bent een ervaren GGZ-behandelaar. Structureer deze 
transcriptie in een professioneel verslag.

STRUCTUUR:
1. HOOFDKLACHT - Waarom komt cliënt?
2. ANAMNESE - Achtergrond, ontstaan, context
3. OBSERVATIES - Wat viel op tijdens gesprek
4. PLAN - Vervolgstappen

REGELS:
- Behoud alle feiten
- B1 taalniveau (professioneel maar helder)
- Geen interpretaties
- Max 400 woorden

TRANSCRIPTIE:
${transcriptText}

OUTPUT (markdown format):
`;
```

---

## 7. Gebruikersrollen en rechten

| Rol | Toegang | Beperkingen |
|-----|---------|-------------|
| **Behandelaar** | Volledige opname + AI features | Alleen eigen cliënten |
| **Demo User** | Volledige opname + AI features | Alleen demo-data (fictief) |
| **Manager** | Alleen transcripties lezen | Geen opname starten |
| **Auditor** | Toegang tot audio (indien bewaard) | Read-only |

**Privacy niveau per rol:**
- Behandelaar: Kan audio bewaren/deleten
- Demo: Audio auto-delete na sessie
- Manager: Geen audio toegang
- Auditor: Alleen bij specifieke permissie

---

## 8. Demo Scenario (10 minuten)

### Scenario: GGZ Professional Demo

**Setup:**
- Demo account ingelogd
- Client "Demo Persoon" vooraf aangemaakt
- Microfoon getest (backup: pre-recorded audio)

**Flow:**

**[0:00 - 1:00] Intro & Context**
> "Traditioneel EPD: 30 minuten typen na gesprek. Wij: 2 minuten AI-tijd. Laten we het live zien."

**[1:00 - 3:00] Live Opname Demo**
1. Navigeer naar Intakes tab
2. Klik "🎤 Start Opname"
3. Browser vraagt microfoon → Toestaan
4. Begin praten (vooraf script):
   ```
   "Client geeft aan dat ze de afgelopen 3 maanden 
   last heeft van slaapproblemen. Ze wordt gemiddeld 
   3 tot 4 keer per nacht wakker en kan dan moeilijk 
   weer inslapen. De klachten zijn begonnen na een 
   stressvolle periode op het werk..."
   ```
5. Toon live verschijnende tekst in editor
6. Demonstreer Pauzeer functie (5 sec stilte)
7. Hervatten, nog 30 seconden verder praten
8. Stop opname

**[3:00 - 5:00] AI Verslag Generatie**
1. Toon ruwe transcriptie (250+ woorden)
2. Klik "✨ Structureer Verslag"
3. Wacht 5 seconden (toon spinner)
4. AI Rail toont gestructureerd verslag:
   - Hoofdklacht
   - Anamnese (bullets)
   - Observaties
   - Plan
5. Klik "Accepteer & Vervang"
6. Editor toont nu professioneel verslag

**[5:00 - 7:00] ROI Pitch**
```
┌────────────────────────────────────────┐
│ TRADITIONEEL  →  AI SPEEDRUN           │
├────────────────────────────────────────┤
│ 45 min gesprek       45 min gesprek    │
│ 30 min typen         2 min AI check    │
│ = 75 min totaal      = 47 min totaal   │
│                                        │
│ Kost: €31,25         Kost: €19,58      │
│ (behandelaar @€25/u) (+€0,19 AI)       │
│                                        │
│ BESPARING: 37% tijd, 38% kosten        │
└────────────────────────────────────────┘
```

**[7:00 - 9:00] Extra Features Tour**
- Toon audio bewaar-optie (privacy toggle)
- Toon auto-delete na 7 dagen
- Toon handmatig correctie tijdens opname
- Toon pause/resume workflow

**[9:00 - 10:00] Q&A & Next Steps**
> "Dit is week 2 van de build. Volgende week: behandelplan AI-generatie. Follow op LinkedIn!"

---

## 9. Edge Cases & Error Handling

| Scenario | Systeem Gedrag | User Feedback |
|----------|---------------|---------------|
| **Geen microfoon** | Disable opname-knop | "Geen microfoon gedetecteerd" |
| **Mic permission denied** | Show instructie | "Geef toegang via browser-instellingen" |
| **Internet valt weg** | Pause + buffer lokaal | "Verbinding verbroken, hervatten?" |
| **Deepgram quota op** | Switch naar manual | "Opname limiet bereikt, typ handmatig" |
| **Browser refresh tijdens opname** | Verlies opname | Warning: "Opname gaat verloren bij refresh" |
| **Claude API timeout** | Retry 1x, dan fail | "Verwerking duurde te lang, probeer opnieuw" |
| **Audio te groot (>25MB)** | Reject upload | "Audio te groot, max 45 minuten" |
| **Geen spraak gedetecteerd** | Timer stopt na 30s stilte | "Geen spraak gedetecteerd, pauzeren?" |

---

## 10. Performance & Kosten

### 10.1 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Deepgram latency** | <500ms per chunk | Websocket timestamp |
| **Editor update** | <100ms per chunk | React render time |
| **Claude verslag** | <10s total | API call duration |
| **Audio upload** | <5s voor 45 min | Supabase Storage speed |
| **UI responsiveness** | 60fps tijdens opname | Chrome DevTools |

### 10.2 Cost Breakdown

**Per gesprek (45 minuten):**
```
Deepgram transcriptie:  €0,19
Claude structurering:   €0,006
Supabase storage:       €0,001 (indien bewaard)
──────────────────────────────
Totaal per gesprek:     €0,197

Traditioneel alternatief:
30 min behandelaar tijd @ €25/uur = €12,50

ROI: 6.244% besparing
```

**Maandelijks (100 gesprekken):**
```
Deepgram:   €19,00
Claude:     €0,60
Storage:    €0,10
──────────────────
Totaal:     €19,70/maand

Traditioneel: €1.250/maand (behandelaar-tijd)
Besparing: €1.230/maand (98%)
```

**Binnen €50/maand budget?**
✅ Ja, zelfs met 250 gesprekken/maand = €49,25

---

## 11. Privacy & AVG Compliance

### 11.1 Data Flow

```
1. Audio opname → Browser (lokaal)
2. Stream → Deepgram (real-time, niet bewaard)
3. Transcriptie → Supabase EU (bewaard)
4. Audio → Optioneel Supabase Storage (bewaard)
5. Auto-delete → Cron job (na X dagen)
```

### 11.2 Privacy Measures

| Aspect | Implementatie |
|--------|---------------|
| **Audio storage** | Opt-in (default: niet bewaren) |
| **Deepgram policy** | Audio niet bewaard, GDPR compliant |
| **Supabase region** | EU (Frankfurt/London) |
| **Encryption** | At-rest + in-transit (TLS) |
| **Auto-delete** | Configureerbaar (7/14/30 dagen) |
| **Access control** | RLS policies (alleen eigen data) |
| **Audit log** | Wie heeft wanneer audio beluisterd |

### 11.3 Disclaimer (demo)

> **Demo Privacy Notice:**
> Deze demo gebruikt fictieve data. Voor productie:
> - Audio wordt niet bewaard door Deepgram
> - Opslag in EU-regio servers
> - Automatische verwijdering na [X] dagen
> - Volledige AVG-compliance

---

## 12. Technische Dependencies

| Component | Library/Service | Version | Kritiek |
|-----------|----------------|---------|---------|
| **Speech-to-Text** | Deepgram Nova-2 | Latest | Ja |
| **Editor** | TipTap (ProseMirror) | v2.x | Ja |
| **AI Structuur** | Claude 3.5 Sonnet | Latest | Ja |
| **Websocket** | Native Browser API | - | Ja |
| **Audio Storage** | Supabase Storage | - | Nee |
| **UI Components** | shadcn/ui | - | Nee |

**Fallback strategie:**
- Deepgram down → Manual typing
- Claude down → Save transcriptie, later structureren
- Websocket fail → Polling fallback (degraded UX)

---

## 13. Bijlagen & Referenties

**Gerelateerde documenten:**
- PRD v1.2 (Product Requirements Document)
- TO v1.2 (Technisch Ontwerp) - wordt aangevuld met dit FO
- UX Stylesheet - kleuren voor recording UI
- Bouwplan v1.1 - Epic E4 (Week 3)

**Externe referenties:**
- [Deepgram Docs](https://developers.deepgram.com/docs/getting-started-with-live-streaming-audio)
- [TipTap Docs](https://tiptap.dev/docs/editor/getting-started)
- [Claude API](https://docs.anthropic.com/claude/reference)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

**Demo assets:**
- Intake script (Nederlands, 3 minuten)
- Pre-recorded backup audio
- ROI calculator spreadsheet
- LinkedIn post templates (Week 2-3)

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 19-11-2024 | Colin | Initiële versie - Live Transcriptie & AI Verslag |

---

**Einde Functioneel Ontwerp - Live Transcriptie Feature**
