# 🧩 Functioneel Ontwerp (FO) — Universele Rapportage

**Projectnaam:** Mini-ECD - Universele Rapportage Functie  
**Versie:** v1.0 (Week 2 MVP)  
**Datum:** 23-11-2024  
**Auteur:** Colin van der Heijden (AI Speedrun)  

---

## 1. Doel en relatie met het PRD
🎯 **Doel van dit document:**
Het Functioneel Ontwerp (FO) beschrijft **hoe** de Universele Rapportage functie werkt — dus wat de gebruiker ziet, doet en ervaart. Waar het PRD uitlegt *wat en waarom*, laat het FO zien *hoe dit in de praktijk werkt*.

📘 **Toelichting aan de lezer:**
De Universele Rapportage functie is een fundamenteel andere benadering van verslaglegging in EPD-systemen. In plaats van "zoek het juiste formulier → vul velden in → save", wordt het: "rapporteer wat je wilt vastleggen → AI begrijpt de context → klaar".

**Relatie met PRD v1.2:**
- Core thesis: "Software on Demand" — AI-first workflow design
- User Story: "Als behandelaar wil ik snel rapporteren zonder te zoeken naar formulieren"
- Succes criterium: "Van idee naar opgeslagen verslag in <30 seconden"

**Context binnen AI Speedrun:**
- **Week 2 MVP:** Text input + behandeladvies classificatie + tijdlijn
- **Week 3:** Voice input (Deepgram) + meerdere rapportage types
- **Week 4:** Structured data extraction + dashboard metrics

**Waarom dit anders is dan traditionele EPD's:**
- Traditioneel: 47 verschillende formulieren, elk met specifieke velden
- AI Speedrun: 1 universele functie, AI routeert automatisch naar juiste context

---

## 2. Overzicht van de belangrijkste onderdelen
🎯 **Doel:** kort overzicht van de modules en componenten binnen deze feature.

**Nieuwe componenten (Week 2):**
1. **Floating Action Button** — Universele toegang tot rapportage functie
2. **Rapportage Modal** — Input interface voor verslaglegging
3. **AI Classificatie Engine** — Detecteert type rapportage
4. **Tijdlijn Component** — Chronologische weergave alle rapportages
5. **Context Routing** — Automatisch plaatsen in juiste sectie

**Integratie met bestaande structuur:**
- Client Dashboard — tijdlijn widget + snelkoppeling
- Behandelplan tab — automatisch gevulde behandeladviezen
- Database — nieuwe `reports` tabel

---

## 3. User Stories (Week 2 MVP scope)

🎯 **Doel:** beschrijven wat gebruikers moeten kunnen doen, vanuit hun perspectief.

**User Story Template:**
> Als [rol/gebruiker] wil ik [doel of actie] zodat [reden/waarde].

**MVP Stories:**

| ID | Rol | Doel / Actie | Verwachte waarde | Prioriteit |
|----|------|---------------|------------------|-------------|
| US-20 | Behandelaar | Snel rapporteren vanaf elke plek in dossier | Geen zoeken naar juiste formulier | Hoog |
| US-21 | Behandelaar | AI laten detecteren wat voor type rapportage het is | Geen handmatig categoriseren | Hoog |
| US-22 | Behandelaar | Type handmatig kunnen wijzigen als AI verkeerd zit | Controle over eindresultaat | Hoog |
| US-23 | Behandelaar | Chronologische tijdlijn zien van alle rapportages | Overzicht van historiek | Hoog |
| US-24 | Behandelaar | Behandeladviezen automatisch in juiste sectie zien | Geen dubbel werk | Hoog |
| US-25 | Demo-bezoeker | Concept zien werken in <30 seconden | Begrijpen waarom dit beter is | Kritiek |
| US-26 | Product Owner | Uitbreidbaarheid naar meer types zien | Vertrouwen in schaalbaarheid | Middel |

**Post-MVP Stories (Week 3+):**

| ID | Rol | Doel / Actie | Verwachte waarde | Prioriteit |
|----|------|---------------|------------------|-------------|
| US-27 | Behandelaar | Voice input gebruiken tijdens gesprek | Handen vrij voor aantekeningen | Middel |
| US-28 | Behandelaar | Filteren op rapportage type | Snel specifieke verslagen vinden | Middel |
| US-29 | Behandelaar | Keyboard shortcut gebruiken | Nog sneller toegang | Laag |
| US-30 | Behandelaar | Structured data automatisch extraheren | Geen handmatig invullen velden | Middel |

---

## 4. Functionele werking per onderdeel

🎯 **Doel:** per hoofdonderdeel beschrijven wat de gebruiker kan doen en wat het systeem doet.

### 4.1 Floating Action Button (FAB)

**Doel:**  
Universele, altijd beschikbare toegang tot rapportage functie vanuit elk scherm binnen het clientdossier.

**Locatie:**
- Rechterboven in clientdossier interface
- Persistent (blijft zichtbaar bij scrollen)
- Alleen zichtbaar binnen clientdossier context

**Visueel:**
- Icoon: 🎤 (microfoon voor toekomstige voice functie)
- Label: "Rapporteer"
- Styling: Primary brand color, elevated (shadow)
- Hover state: Subtle scale + glow effect

**Gedrag:**
- Klik → opent Rapportage Modal
- Disabled state: Als geen client geselecteerd
- Tooltip (hover): "Snel rapporteren (Cmd+Shift+R)" *[Week 3]*

**States:**
```
Normal:     [🎤 Rapporteer]
Hover:      [🎤 Rapporteer] (110% scale)
Loading:    [⏳ Bezig...]
Disabled:   [🎤 Rapporteer] (50% opacity, geen pointer)
```

---

### 4.2 Rapportage Modal (Week 2 MVP)

**Doel:**  
Centrale interface voor het invoeren van rapportages met AI-ondersteuning.

**Trigger:**
- Klik op FAB
- Keyboard shortcut (Week 3): `Cmd+Shift+R` / `Ctrl+Shift+R`

**Modal structuur:**

**Header:**
```
┌─────────────────────────────────────────┐
│ 🎤 Nieuwe rapportage voor Emma de Vries│
│                                    [X]  │
└─────────────────────────────────────────┘
```

**Body (lege staat):**
```
┌─────────────────────────────────────────┐
│                                         │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │  Beschrijf wat je wilt            │ │
│  │  vastleggen...                    │ │
│  │                                   │ │
│  │  (minimaal 20 karakters)          │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  💡 Tip: Schrijf gewoon wat je wilt    │
│     vastleggen. AI herkent automatisch │
│     of het een behandeladvies is.      │
│                                         │
├─────────────────────────────────────────┤
│                   [Analyseer met AI]    │
└─────────────────────────────────────────┘
```

**Body (na invoer tekst):**
```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐ │
│  │ Op basis van het intakegesprek    │ │
│  │ advies ik een CGT traject van     │ │
│  │ 12 sessies met focus op...        │ │
│  │                               ▼   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Characters: 156 / 5000                 │
│                                         │
├─────────────────────────────────────────┤
│  [Annuleren]          [Analyseer]       │
└─────────────────────────────────────────┘
```

**Body (AI classificatie):**
```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐ │
│  │ Op basis van het intakegesprek    │ │
│  │ advies ik een CGT traject van     │ │
│  │ 12 sessies met focus op...        │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ✓ AI detecteert: 🎯 Behandeladvies    │
│                                         │
│  Type wijzigen:                         │
│  ┌─────────────────────────────────┐   │
│  │ 🎯 Behandeladvies            ▼ │   │
│  └─────────────────────────────────┘   │
│                                         │
│  └─ 🎯 Behandeladvies                   │
│     📝 Vrije notitie                    │
│                                         │
├─────────────────────────────────────────┤
│  [Annuleren]              [Opslaan]     │
└─────────────────────────────────────────┘
```

**Velden:**
- **Text Area**: Multi-line, auto-resize, 5000 character limit
- **Character Counter**: Live update, warning bij >4500 chars
- **Type Dropdown**: Manual override optie (Week 2: 2 types)
- **AI Confidence Badge**: Visual feedback (alleen intern, niet getoond)

**Validation:**
- Minimaal 20 karakters (voorkom "test" spam)
- Maximaal 5000 karakters
- Lege tekst → "Analyseer" knop disabled
- <20 chars → Error: "Te kort voor analyse (min. 20)"

**Button states:**
```
[Analyseer met AI]     → Primary, default
[⏳ Analyseren...]     → Loading state (1-2 sec)
[✓ Geanalyseerd]       → Success state (2 sec)
[Opslaan]              → Primary, na classificatie
[💾 Opslaan...]        → Loading tijdens save
[✓ Opgeslagen]         → Success, auto-close na 1 sec
```

**Edge cases:**
- AI error → Fallback: "Vrije notitie" + melding
- Netwerk timeout → Retry button + melding
- Client context verloren → Error: "Selecteer eerst een cliënt"

---

### 4.3 AI Classificatie (Week 2 MVP)

**Doel:**  
Automatisch herkennen of een rapportage een behandeladvies is of een vrije notitie.

**Technische flow:**
```
User input
    ↓
Validate (>20 chars)
    ↓
Send to Claude API
    ↓
Parse JSON response
    ↓
Show classification + confidence
    ↓
User confirms/overrides
    ↓
Save to database
```

**AI Prompt (approximately):**
```typescript
const CLASSIFICATION_PROMPT = `
Je bent een classificatie-assistent voor een GGZ EPD-systeem.

Classificeer de volgende rapportage als één van deze types:

**Behandeladvies:**
- Bevat een concreet behandelplan of voorstel
- Noemt doelen, interventies, aanpak
- Woorden zoals: "advies", "plan", "traject", "sessies", "behandeling"
- Voorbeelden: "Ik stel voor CGT, 12 sessies", "Behandelplan: ..."

**Vrije notitie:**
- Alles wat niet duidelijk een behandeladvies is
- Algemene observaties, opmerkingen, aantekeningen
- Geen concreet plan of voorstel

RAPPORTAGE:
"""
${userInput}
"""

Return ALLEEN dit JSON format, niets anders:
{
  "type": "behandeladvies" | "vrije_notitie",
  "confidence": 0.0 - 1.0,
  "reasoning": "Korte uitleg waarom (optioneel)"
}
`;
```

**Response handling:**
```typescript
type ClassificationResult = {
  type: 'behandeladvies' | 'vrije_notitie';
  confidence: number; // 0.0 - 1.0
  reasoning?: string;
}

// Confidence thresholds
if (confidence >= 0.85) {
  // High confidence - auto-suggest
  showClassification(result.type);
} else if (confidence >= 0.60) {
  // Medium confidence - show with warning
  showClassification(result.type, "AI is niet zeker, controleer type");
} else {
  // Low confidence - fallback
  showClassification('vrije_notitie', "AI kon type niet bepalen");
}
```

**Fallback scenario's:**
- API timeout → Default: "vrije_notitie"
- Parse error → Default: "vrije_notitie"
- Network error → Retry optie + fallback

**Performance target:**
- Response time: <2 seconden (95th percentile)
- Accuracy target: >85% correct classifications

---

### 4.4 Tijdlijn Component

**Doel:**  
Chronologische weergave van alle rapportages voor een cliënt, met snelle toegang tot details.

**Locatie:**
- Tab in clientdossier: "Tijdlijn"
- Widget op dashboard (laatste 3 items)

**Structuur:**

**Header:**
```
┌─────────────────────────────────────────┐
│ 📋 Tijdlijn                             │
│                                         │
│ Filter: [Alle types ▼]  [Zoeken 🔍]   │
└─────────────────────────────────────────┘
```

**Tijdlijn items:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
23 nov 2024 14:30
🎯 Behandeladvies

"Op basis van het intakegesprek advies 
ik een CGT traject van 12 sessies met 
focus op slaapproblematiek en..."

Door: Dr. van Dam
[Bekijk volledig] [Bewerk] [...]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
22 nov 2024 10:15  
📝 Vrije notitie

"Telefonisch contact met cliënt. 
Afspraak verzet naar donderdag..."

Door: Dr. van Dam
[Bekijk volledig] [Bewerk] [...]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Item componenten:**
- **Timestamp**: Datum + tijd (relatief: "2 uur geleden")
- **Type badge**: Icoon + label
- **Preview**: Eerste 120 karakters + "..."
- **Metadata**: Auteur (Week 3: + versie nummer)
- **Actions**: Bekijk, Bewerk, Menu (...)

**States:**
```
Normal:     Standaard weergave
Hover:      Subtle highlight + cursor pointer
Loading:    Skeleton placeholders
Empty:      "Nog geen rapportages voor deze cliënt"
```

**Interacties:**
- Klik op item → Open detail view (modal of side panel)
- Klik "Bewerk" → Open in rapportage modal (edit mode)
- Menu (...) → Verwijderen (met confirmatie)

**Lazy loading:**
- Toon eerste 10 items
- "Meer laden" knop onderaan
- Infinite scroll optie (Week 3)

---

### 4.5 Context Routing (automatische plaatsing)

**Doel:**  
Rapportages automatisch op de juiste plek in het dossier tonen, naast de chronologische tijdlijn.

**Week 2 scope:**
- Behandeladviezen verschijnen automatisch in "Behandelplan" tab
- Vrije notities blijven alleen in tijdlijn

**Behandelplan tab integratie:**
```
┌─────────────────────────────────────────┐
│ 🎯 Behandelplan                         │
│                                         │
│ Laatste advies: 23 nov 2024 14:30      │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ CGT traject, 12 sessies         │   │
│ │ Focus: slaapproblematiek        │   │
│ │                                 │   │
│ │ Doelen:                         │   │
│ │ - Verbeteren slaapkwaliteit     │   │
│ │ - Verminderen ruminatie         │   │
│ │                                 │   │
│ │ [Bewerk] [Nieuwe versie]        │   │
│ └─────────────────────────────────┘   │
│                                         │
│ Eerdere adviezen:                       │
│ - 20 nov 2024 (v1.0) [Bekijk]          │
└─────────────────────────────────────────┘
```

**Routing logica:**
```typescript
function routeReport(report: Report) {
  // Week 2: Simple routing
  if (report.type === 'behandeladvies') {
    // Show in both timeline AND behandelplan tab
    saveToTimeline(report);
    linkToBehandelplan(report);
  } else {
    // Only in timeline
    saveToTimeline(report);
  }
  
  // Week 3+: More types
  // 'intake' → Intake tab
  // 'voortgang' → Voortgang tab
  // 'crisis' → Crisis log + notification
  // etc.
}
```

**Versioning (Week 3):**
- Behandeladviezen krijgen versienummer (v1.0, v1.1, v2.0)
- Nieuwe rapportage = nieuwe versie of wijziging bestaande?
- User kan kiezen: "Nieuwe versie" vs "Bestaande bijwerken"

---

## 5. UI-overzicht (visuele structuur)

🎯 **Doel:** eenvoudig inzicht geven in de globale schermopbouw.

**Clientdossier met Universele Rapportage:**
```
┌──────────────────────────────────────────────────────────┐
│ Logo    Emma de Vries (34j, F)    [Zoeken] [User ▼]    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐  ┌─────────────────────────────────┐   │
│  │ Dashboard  │  │                                 │   │
│  │ Intake     │  │  Client Dashboard               │   │
│  │ Diagnose   │  │                                 │   │
│  │ Behandel   │  │  [Laatste activiteit widgets]   │   │
│  │ Tijdlijn   │  │                                 │   │
│  │            │  │                                 │   │
│  │            │  │                                 │   │
│  │            │  │                                 │   │
│  └────────────┘  └─────────────────────────────────┘   │
│                                                          │
│                               ┌──────────────────┐      │
│                               │ 🎤 Rapporteer    │ ←FAB │
│                               └──────────────────┘      │
└──────────────────────────────────────────────────────────┘
```

**Rapportage Modal (overlay):**
```
       ┌────────────────────────────────────────┐
       │ 🎤 Nieuwe rapportage voor Emma      [X]│
       ├────────────────────────────────────────┤
       │                                        │
       │  ┌──────────────────────────────────┐ │
       │  │ [User input text area]           │ │
       │  │                                  │ │
       │  └──────────────────────────────────┘ │
       │                                        │
       │  ✓ AI detecteert: 🎯 Behandeladvies   │
       │                                        │
       │  Type: [Behandeladvies ▼]             │
       │                                        │
       ├────────────────────────────────────────┤
       │  [Annuleren]            [Opslaan]      │
       └────────────────────────────────────────┘
```

**Tijdlijn tab:**
```
┌──────────────────────────────────────────────────────────┐
│ 📋 Tijdlijn          [Alle types ▼] [Zoeken 🔍]        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  23 nov 2024 14:30                                       │
│  🎯 Behandeladvies                                       │
│                                                          │
│  "Op basis van intakegesprek advies ik CGT..."          │
│                                                          │
│  Door: Dr. van Dam                                       │
│  [Bekijk volledig] [Bewerk] [...]                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                          │
│  22 nov 2024 10:15                                       │
│  📝 Vrije notitie                                        │
│  ...                                                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Interacties met AI (functionele beschrijving)

🎯 **Doel:** uitleggen waar AI in de flow voorkomt en wat de gebruiker ziet of verwacht.

| Locatie | AI-actie | Trigger | Input | Output | Response tijd |
|---------|----------|---------|-------|--------|---------------|
| Rapportage Modal | Classificatie | Klik "Analyseer" | User text (20-5000 chars) | Type + confidence | <2 sec |
| Behandelplan (Week 3) | Extractie | Auto na save | Behandeladvies text | SMART doelen, interventies | <3 sec |
| Tijdlijn (Week 3) | Samenvatting | Klik "Samenvatten" | Lang verslag | Bullets, highlights | <2 sec |

**Week 2 MVP: Alleen classificatie**

**Prompt structure:**
```typescript
System: "Je bent classificatie-assistent voor GGZ EPD"
User: "Classificeer: [user_text]"
Expected response: { type, confidence, reasoning }
```

**Error handling:**
- Timeout (>5 sec) → Retry once → Fallback to "vrije_notitie"
- Invalid JSON → Parse error → Fallback to "vrije_notitie"
- Rate limit → Queue request → Show "Even geduld..."

**User feedback:**
```
[Analyseren...]           ← Loading (spinner)
[✓ Geanalyseerd]          ← Success (1 sec)
[⚠️ Opnieuw proberen]     ← Error (retry button)
```

---

## 7. Database Schema (Week 2 MVP)

🎯 **Doel:** Gestructureerde opslag van rapportages met uitbreidbaarheid.

**Tabel: `reports`**
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Content
  type VARCHAR(50) NOT NULL, -- 'behandeladvies', 'vrije_notitie'
  content TEXT NOT NULL,     -- Raw user input
  
  -- AI metadata
  ai_confidence DECIMAL(3,2), -- 0.00 - 1.00
  ai_reasoning TEXT,          -- Optional AI explanation
  
  -- Structured data (Week 3+)
  structured_data JSONB,      -- Extracted entities, dates, etc.
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_at TIMESTAMPTZ,
  updated_by UUID REFERENCES users(id),
  
  -- Versioning (Week 3+)
  version VARCHAR(10),        -- e.g., "v1.0", "v2.1"
  parent_report_id UUID REFERENCES reports(id), -- For versioning
  
  -- Audio (Week 3+)
  audio_url TEXT,             -- Supabase Storage URL
  audio_duration_seconds INT,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  
  -- Indexes
  INDEX idx_reports_client (client_id),
  INDEX idx_reports_type (type),
  INDEX idx_reports_created (created_at DESC)
);
```

**Type values (Week 2):**
- `behandeladvies`: Treatment plan/advice
- `vrije_notitie`: Free-form note

**Type values (Week 3+):**
- `intake`: Initial intake report
- `voortgang`: Progress report
- `crisis`: Crisis/incident report
- `contact`: Contact moment (call, email)
- `medicatie`: Medication changes
- `mdo`: Multidisciplinary consultation

**Example data:**
```json
{
  "id": "abc-123",
  "client_id": "client-456",
  "type": "behandeladvies",
  "content": "Op basis van intakegesprek advies ik CGT traject...",
  "ai_confidence": 0.92,
  "ai_reasoning": "Bevat woorden: advies, traject, sessies",
  "structured_data": null, // Week 3+
  "created_at": "2024-11-23T14:30:00Z",
  "created_by": "user-789"
}
```

---

## 8. Gebruikersrollen en rechten

🎯 **Doel:** beschrijven welke rollen toegang hebben tot welke onderdelen.

| Rol | Toegang | Acties | Beperkingen |
|-----|---------|--------|-------------|
| **Behandelaar** | Eigen cliënten | Aanmaken, lezen, bewerken, verwijderen rapportages | Alleen eigen rapportages bewerken |
| **Manager** | Alle cliënten (read-only) | Lezen tijdlijnen | Geen wijzigingen |
| **Demo User** | Demo cliënten | Volledige toegang | Fictieve data only |

**Permissions check:**
```typescript
canCreateReport(user, client) {
  return user.clients.includes(client.id) || user.role === 'admin';
}

canEditReport(user, report) {
  return report.created_by === user.id || user.role === 'admin';
}

canDeleteReport(user, report) {
  return report.created_by === user.id || user.role === 'admin';
}
```

---

## 9. Flows & Scenario's

🎯 **Doel:** Concrete gebruiksscenario's uitwerken.

### 9.1 Happy Flow: Behandeladvies rapporteren

**Context:** Behandelaar heeft net intakegesprek gehad met nieuwe cliënt Emma (34j).

**Stappen:**
1. Open clientdossier Emma de Vries
2. Klik floating button "🎤 Rapporteer" (rechtsonder)
3. Modal opent met focus op text area
4. Typ: *"Op basis van het intakegesprek van vandaag advies ik een CGT traject van 12 sessies. Focus op slaapproblematiek en verminderen van ruminatie. Start met psycho-educatie over depressie en slaaphygiëne. Evaluatie na 6 sessies. Bij onvoldoende verbetering overleg met psychiater voor eventuele medicatie."*
5. Klik "Analyseer met AI"
6. Spinner 1-2 seconden
7. AI toont: "✓ AI detecteert: 🎯 Behandeladvies (92% zeker)"
8. Dropdown toont: "🎯 Behandeladvies" (pre-selected)
9. Klik "Opslaan"
10. Success melding: "✓ Opgeslagen"
11. Modal sluit automatisch na 1 sec
12. Rapportage verschijnt:
    - In tijdlijn (bovenaan)
    - In "Behandelplan" tab
13. Behandelaar ziet bevestiging toast: "Behandeladvies opgeslagen"

**Tijdsduur:** ~25 seconden (inclusief typen)

---

### 9.2 Alternative Flow: AI classificeert verkeerd

**Context:** Behandelaar schrijft verslag, maar AI herkent verkeerd type.

**Stappen:**
1. Open rapportage modal
2. Typ: *"Kort telefoontje gehad met Emma. Ze kan volgende week niet, afspraak verzet naar donderdag 15:00. Ze klonk opgeruimd."*
3. Klik "Analyseer"
4. AI toont: "✓ AI detecteert: 🎯 Behandeladvies (68% zeker)"
   - (AI ziet "afspraak" en "opgeruimd" als mogelijk behandelcontext)
5. **Gebruiker klikt dropdown**
6. Kiest: "📝 Vrije notitie"
7. Klik "Opslaan"
8. Verslag opgeslagen als vrije notitie
9. **Leermoment:** AI wordt niet getraind (out of scope), maar gebruiker had controle

**Tijdsduur:** ~30 seconden

---

### 9.3 Error Flow: Netwerk timeout

**Context:** Slechte internetverbinding tijdens classificatie.

**Stappen:**
1. Typ rapportage
2. Klik "Analyseer"
3. Spinner > 5 seconden
4. Timeout error
5. Melding: "⚠️ AI niet bereikbaar. Probeer opnieuw of kies handmatig een type."
6. Knoppen:
   - [Opnieuw proberen] ← Retry
   - [Handmatig kiezen] ← Skip AI, direct dropdown
7. Gebruiker kiest "Handmatig kiezen"
8. Dropdown actief, kiest type
9. Opslaan werkt normaal

**Fallback:** Rapportage wordt opgeslagen zonder AI-metadata, maar blijft functioneel.

---

### 9.4 Demo Scenario (LinkedIn video)

**Context:** 30-seconden demo voor LinkedIn post.

**Script:**
```
[Scherm: Client dossier open]
Voiceover: "Traditionele EPD's hebben 47 formulieren."

[Klik Rapporteer button]
Voiceover: "Wij hebben 1 knop."

[Typ snel behandeladvies]
Voiceover: "Je typt wat je denkt."

[Klik Analyseer]
Voiceover: "AI begrijpt wat het is."

[Klik Opslaan]
Voiceover: "En zet het automatisch op de juiste plek."

[Toon tijdlijn + behandelplan tab]
Voiceover: "25 seconden. Klaar."

[Fade to logo]
Text: "AI Speedrun EPD - Software on Demand"
```

**Belangrijke visuele elementen:**
- Smooth animaties
- Duidelijke button clicks
- AI classificatie badge (92%)
- Dual placement (tijdlijn + behandelplan)

---

## 10. Technische constraints & dependencies

🎯 **Doel:** Technische randvoorwaarden en afhankelijkheden.

**API Dependencies:**
- **Claude 3.5 Sonnet** (Anthropic API)
  - Endpoint: `/v1/messages`
  - Model: `claude-sonnet-4-20250514`
  - Rate limit: 50 requests/minute (tier 1)
  - Fallback: Queue + retry

**Database:**
- **Supabase PostgreSQL**
  - Row Level Security (RLS) enabled
  - Real-time subscriptions (Week 3+)

**Frontend:**
- **Next.js 15** (App Router)
- **React 19** (Server Components waar mogelijk)
- **shadcn/ui** components
- **TailwindCSS** styling

**Performance targets:**
- Modal open: <100ms
- AI classification: <2 sec (p95)
- Database save: <500ms
- Timeline render: <200ms (10 items)

**Browser support:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile: iOS Safari 14+, Chrome Android

---

## 11. Privacy & Security (AVG compliance)

🎯 **Doel:** Waarborgen van privacy en beveiliging.

**Data opslag:**
- Rapportages bevatten potentieel gevoelige medische informatie
- Encryptie at rest (Supabase default)
- Encryptie in transit (HTTPS/TLS 1.3)

**API communicatie:**
- Claude API: Data wordt NIET gebruikt voor training
- Anthropic heeft SOC 2 Type II certificering
- Data residency: EU servers waar mogelijk

**Toegangscontrole:**
- Row Level Security (RLS) op client_id
- User kan alleen eigen cliënten zien/bewerken
- Audit log voor alle wijzigingen (Week 3+)

**Soft delete:**
- Rapportages krijgen `deleted_at` timestamp
- Niet permanent verwijderd (herstel mogelijk)
- Permanent purge na 30 dagen (Week 4)

**GDPR rechten:**
- Recht op inzage: Tijdlijn export (Week 3+)
- Recht op verwijdering: Soft delete functie
- Recht op dataportabiliteit: JSON export (Week 4)

---

## 12. Testing & Acceptance Criteria

🎯 **Doel:** Definiëren wanneer de feature "klaar" is.

**Functional Tests:**
- [ ] FAB zichtbaar in alle clientdossier paginas
- [ ] Modal opent/sluit correct
- [ ] Text area accepteert 20-5000 karakters
- [ ] Validation errors tonen bij <20 chars
- [ ] AI classificatie werkt in >85% van testcases
- [ ] Dropdown manual override functioneert
- [ ] Save functie slaat op in database
- [ ] Tijdlijn toont nieuwe items direct
- [ ] Behandeladviezen verschijnen in Behandelplan tab
- [ ] Vrije notities alleen in tijdlijn

**Performance Tests:**
- [ ] Modal open <100ms
- [ ] AI response <2 sec (p95)
- [ ] Save operation <500ms
- [ ] Timeline render <200ms (10 items)

**Edge Cases:**
- [ ] Netwerk timeout handling
- [ ] AI parse error handling
- [ ] Concurrent edits (multiple tabs)
- [ ] Very long text (4900 chars)
- [ ] Special characters (emoji, unicode)

**Accessibility:**
- [ ] Keyboard navigatie werkt
- [ ] Screen reader compatible
- [ ] Focus states duidelijk
- [ ] ARIA labels correct

**Cross-browser:**
- [ ] Chrome/Edge latest
- [ ] Firefox latest
- [ ] Safari 14+
- [ ] Mobile Chrome/Safari

**Demo Readiness:**
- [ ] 30-sec demo scenario werkt smooth
- [ ] No bugs in happy flow
- [ ] Visual polish (animaties, spacing)
- [ ] Recording-ready UI

---

## 13. Roadmap & Uitbreidingen

🎯 **Doel:** Toekomstige iteraties en uitbreidmogelijkheden.

### Week 3 (Voice + Types)
- 🎤 Deepgram voice input integration
- 📋 Meer rapportage types (intake, voortgang, crisis, contact)
- 🔍 Filter/zoek functionaliteit in tijdlijn
- ⌨️ Keyboard shortcut (Cmd+Shift+R)
- 📊 Structured data extraction (DSM codes, medicatie)

### Week 4 (Polish + Analytics)
- ✨ Rich editor formatting in rapportages
- 📈 Dashboard widgets (rapportage stats)
- 🔔 Notificaties bij crisis rapportages
- 📄 PDF export van rapportages
- 🎬 Marketing video + LinkedIn posts

### Post-MVP (Future)
- 🧠 AI leren van correcties (feedback loop)
- 🔗 Cross-client insights (anonymized patterns)
- 📱 Mobile app (React Native)
- 🌐 Multi-language support (Engels)
- 🔐 Advanced permissions (team-based access)
- 📊 BI dashboard voor managers
- 🔄 Integraties (Zorgdomein, Ggz Standaarden)

---

## 14. Bijlagen & Referenties

🎯 **Doel:** linken naar de overige documenten binnen Mission Control.

**Interne documenten:**
- [PRD v1.2](./prd-mini-ecd-v1_2.md) - Product Requirements Document
- [TO v1.2](./to-mini-ecd-v1_2.md) - Technisch Ontwerp
- [FO v2.0](./fo-mini-ecd-v2.md) - Functioneel Ontwerp (basis applicatie)
- [FO Live Transcriptie](./fo-live-transcriptie-v1.md) - Voice input (Week 3)
- [UX Stylesheet](./ux-stylesheet.md) - Design system
- [Bouwplan v1.1](./bouwplan-ai-speedrun-v1.md) - Development roadmap
- [API Access](./api-access-mini-ecd.md) - Credentials en setup

**Externe referenties:**
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

**Demo assets:**
- LinkedIn post templates
- 30-second demo script
- Test rapportages (NL samples)
- Figma wireframes (optional)

---

**Versiehistorie:**

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 23-11-2024 | Colin van der Heijden | Initiële versie - Week 2 MVP scope |

---

**Einde Functioneel Ontwerp - Universele Rapportage Functie**