# Waarde-Analyse Ephemeral UI EPD

**Document:** Waar ligt de waarde en hoe implementeren?
**Datum:** december 2024
**Auteurs:** Product Owner, Klant (GGZ Zorginstelling), UX Designer

---

## 1. Klant Perspectief: De Zorginstelling

### 1.1 De Pijn van Vandaag

**Citaten uit het veld:**

> "Mijn verpleegkundigen besteden 40% van hun tijd aan administratie. Dat is tijd die niet naar de cliënt gaat."
> — Teamleider GGZ

> "We hebben een EPD met 200 schermen. Niemand kent ze allemaal. Nieuwe medewerkers doen er 3 maanden over om het te leren."
> — ICT Manager

> "Na een crisis-interventie moet ik 20 minuten typen. Terwijl ik eigenlijk bij de volgende cliënt moet zijn."
> — SPV'er

### 1.2 Waar Ligt de Echte Waarde?

**Waarde = Tijd terug naar de zorg**

| Activiteit | Nu (minuten) | Ephemeral (minuten) | Besparing |
|------------|--------------|---------------------|-----------|
| Dagnotitie na ADL | 3-5 | 0.5 | **80%** |
| Rapportage na gesprek | 8-15 | 2-3 | **75%** |
| Overdracht maken | 20-30 | 5 | **80%** |
| Patiënt opzoeken | 1-2 | 0.2 | **85%** |
| Navigeren naar juiste scherm | 0.5-1 per actie | 0 | **100%** |

**Rekenvoorbeeld voor 1 afdeling (10 FTE):**
- 10 medewerkers × 8 notities/dag × 3 min besparing = **4 uur/dag terug**
- Per jaar: **1000+ uur** extra zorgcontact

### 1.3 Wat de Klant Wil Zien

**Primair:**
1. **Snelheid** - "Ik zeg iets, het staat erin"
2. **Betrouwbaarheid** - "Het begrijpt me, ook in GGZ-taal"
3. **Geen gedoe** - "Ik hoef niet na te denken over het systeem"

**Secundair:**
4. Overdracht die zichzelf schrijft
5. Minder training voor nieuwe medewerkers
6. Voice input (handsfree tijdens zorg)

**Niet gevraagd maar wel gewaardeerd:**
- AI-suggesties ("wil je de arts informeren?")
- Proactieve alerts ("let op: 3 valincidenten deze week")

### 1.4 Waarde Prioritering door Klant

```
████████████████████████████████ HOOGSTE WAARDE
█ 1. Snelle dagnotities (voice)
█ 2. Rapportage na gesprek
█ 3. Automatische overdracht
████████████████████████████ HOGE WAARDE
█ 4. Patiënt snel vinden
█ 5. Context-aware (weet welke dienst)
████████████████████ GEMIDDELDE WAARDE
█ 6. Behandelplan assistentie
█ 7. Agenda integratie
████████████ LAGERE WAARDE
█ 8. Metingen invoer
█ 9. Intake ondersteuning
```

### 1.5 Klant Conclusie

**Meeste waarde:** De drie "high-frequency, low-complexity" taken:
1. **Dagnotitie** - 10-20x per dag per medewerker
2. **Rapportage** - 3-5x per dag per behandelaar
3. **Overdracht** - 2-3x per dag per afdeling

**Implementatie advies:** Begin hier. Dit is waar 80% van de tijdwinst zit.

---

## 2. Product Owner Perspectief: Waarde vs. Effort

### 2.1 Value/Effort Matrix

```
                    HOGE WAARDE
                         │
     ┌───────────────────┼───────────────────┐
     │                   │                   │
     │   QUICK WINS      │   BIG BETS        │
     │   ────────────    │   ────────────    │
     │   • Dagnotitie    │   • Intent API    │
     │   • Zoeken        │   • Voice flow    │
     │   • Context bar   │   • Overdracht AI │
     │                   │                   │
LAGE ├───────────────────┼───────────────────┤ HOGE
EFFORT                   │                   │ EFFORT
     │                   │                   │
     │   FILL-INS        │   MONEY PITS      │
     │   ────────────    │   ────────────    │
     │   • Metingen      │   • Intake wizard │
     │   • Agenda view   │   • Behandelplan  │
     │   • Recent badges │   • Full ambient  │
     │                   │                   │
     └───────────────────┼───────────────────┘
                         │
                    LAGE WAARDE
```

### 2.2 Waarde Drivers per Bouwblok

| Bouwblok | Frequentie | Tijdwinst | Effort | **Waarde Score** |
|----------|------------|-----------|--------|------------------|
| **Dagnotitie** | 20x/dag | 80% | Laag | ⭐⭐⭐⭐⭐ |
| **Zoeken** | 15x/dag | 85% | Laag | ⭐⭐⭐⭐⭐ |
| **Rapportage** | 5x/dag | 75% | Medium | ⭐⭐⭐⭐ |
| **Overdracht** | 2x/dag | 80% | Medium | ⭐⭐⭐⭐ |
| **Agenda** | 3x/dag | 50% | Laag | ⭐⭐⭐ |
| **Metingen** | 2x/dag | 60% | Laag | ⭐⭐⭐ |
| **Behandelplan** | 1x/week | 40% | Hoog | ⭐⭐ |
| **Intake** | 1x/maand | 30% | Hoog | ⭐ |

### 2.3 MVP Definitie op Basis van Waarde

**MVP = Hoogste waarde, laagste effort**

```
┌─────────────────────────────────────────────────────────────┐
│                     MVP SCOPE                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MUST: Command Center + Intent                              │
│  ├── Text input                                             │
│  ├── Voice input (Deepgram bestaand)                        │
│  └── Fallback blok-picker                                   │
│                                                             │
│  MUST: Dagnotitie Blok ⭐⭐⭐⭐⭐                              │
│  ├── Quick entry form                                       │
│  ├── Categorie pre-select uit intent                        │
│  ├── Patient pre-fill                                       │
│  └── 1-click save                                           │
│                                                             │
│  MUST: Zoeken Blok ⭐⭐⭐⭐⭐                                   │
│  ├── Patient search (cmdk)                                  │
│  ├── Quick actions per result                               │
│  └── Set active patient                                     │
│                                                             │
│  SHOULD: Rapportage Blok ⭐⭐⭐⭐                              │
│  ├── Wrapper rond bestaande ReportComposer                  │
│  ├── Voice dictation                                        │
│  └── AI structurering                                       │
│                                                             │
│  COULD: Overdracht Blok ⭐⭐⭐⭐                               │
│  └── AI samenvatting (API bestaat al)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Wat NIET in MVP

| Blok | Reden voor uitstel |
|------|-------------------|
| Behandelplan | Laag-frequent, hoog-complex, bestaande UI voldoet |
| Intake | Zeer laag-frequent, wizard is complex |
| Metingen | Lage waarde-perceptie bij klant |
| Agenda | Bestaande agenda werkt, lage urgentie |

### 2.5 Release Strategie

**Week 1-2: Foundation**
- Command Center shell
- Intent API (basic)
- Dagnotitie blok

**Week 3: Core Value**
- Zoeken blok
- Rapportage blok
- Voice refinement

**Week 4: Demo Polish**
- Overdracht blok
- Animaties
- Demo scenario's

**Post-Demo: Iterate**
- Metrics verzamelen
- Intent accuracy verbeteren
- Overige blokken op basis van feedback

---

## 3. UX Designer Perspectief: Waarde in de Interactie

### 3.1 Waar Ontstaat Waarde in de UX?

**Waarde = Friction verwijderen**

De grootste UX-waarde zit niet in features, maar in het **elimineren van stappen**:

```
TRADITIONEEL EPD:
Login → Dashboard → Menu → Submenu → Patiënten → Zoeken →
Selecteer → Menu → Rapportage → Type selecteren → Formulier →
Invullen → Validatie fixen → Opslaan → Bevestiging

= 14 stappen, 12+ klikken, 3-5 minuten

EPHEMERAL UI:
Command Center → "Notitie voor Jan" → Invullen → Opslaan

= 4 stappen, 2 klikken, 30 seconden
```

### 3.2 De Vijf Waarde-Momenten

**Moment 1: De Eerste Seconde**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│      Goedemiddag. Wat wil je doen?                          │
│      ___________________________________________________    │
│                                                             │
│      💡 "notitie jan", "overdracht", "zoek marie"          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

WAARDE: Geen keuze-stress. Geen menu's. Eén vraag.
```

**Moment 2: De Herkenning**
```
User: "notitie voor Jan"

System:
┌─────────────────────────────────────────────────────────────┐
│  📝 Dagnotitie voor Jan de Vries                           │
│  ─────────────────────────────────────────────────────────  │
│  Categorie: [ADL ▼]  Tijd: [14:32]                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ _                                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Opslaan]                                                  │
└─────────────────────────────────────────────────────────────┘

WAARDE: "Het begreep me!" Patient al ingevuld. Direct typen.
```

**Moment 3: De Voice Flow**
```
User klikt 🎤

┌─────────────────────────────────────────────────────────────┐
│  🔴 Luistert...                                             │
│                                                             │
│  "Mevrouw heeft goed gegeten, medicatie ingenomen,          │
│   was wat onrustig vanmorgen maar nu stabiel"               │
│                                                             │
│  [Stop] [Opnieuw]                                           │
└─────────────────────────────────────────────────────────────┘

WAARDE: Handen vrij. Praten is sneller dan typen.
        Natuurlijke taal, geen formulier-denken.
```

**Moment 4: De Bevestiging**
```
Na opslaan:

┌─────────────────────────────────────────────────────────────┐
│  ✓ Notitie opgeslagen                          [Ongedaan]  │
└─────────────────────────────────────────────────────────────┘

Recent: [Jan - Notitie ✓ 14:32]

WAARDE: Zekerheid. "Het staat erin." Undo als vangnet.
```

**Moment 5: De Volgende Actie**
```
System: Klaar. Wat nu?
        ___________________________________________________

        Suggestie: Je hebt nog 2 patiënten met openstaande notities

WAARDE: Flow behouden. Niet terug naar start.
        Proactief helpen.
```

### 3.3 Waarde-Killers (Anti-Patterns)

| Anti-Pattern | Waarom Slecht | Oplossing |
|--------------|---------------|-----------|
| "Weet je het zeker?" dialoog | Vertraagt, twijfel zaaien | Undo in plaats van confirm |
| Verplichte velden | Blokkeert snelle invoer | Alleen patient verplicht |
| Modal op modal | Cognitive overload | Max 1 laag diep |
| Laden... spinner | Wachten = frustratie | Optimistic UI |
| "Sessie verlopen" | Werk kwijt | Auto-save drafts |

### 3.4 Implementatie: Waarde-First Design

**Principe 1: Progressive Disclosure**
```
Stap 1: Minimaal formulier (alleen tekst)
        ↓
Stap 2: Optionele details (categorie, tijd) - collapsed
        ↓
Stap 3: Geavanceerd (tags, links) - hidden by default
```

**Principe 2: Defaults die Kloppen**
```typescript
// Pre-fill logica
const defaults = {
  patient: context.activePatient || extractFromIntent(input),
  category: inferCategory(input), // "medicatie" → Medicatie
  time: new Date(), // Nu
  includeInHandover: true, // Standaard aan
}
```

**Principe 3: Keyboard-First, Voice-Enhanced**
```
Enter     = Opslaan (als er tekst is)
Escape    = Sluiten (met draft save)
Tab       = Volgende veld
Cmd+K     = Terug naar Command input
Spacebar  = Start/stop voice (in input)
```

**Principe 4: Feedback Loops**
```
Input     → Instant echo (wat het systeem hoorde)
Processing→ Subtle indicator (geen blocking spinner)
Success   → Toast + sound + Recent update
Error     → Inline, niet modal, met fix-suggestie
```

### 3.5 Waarde Meten

**Metrics die waarde bewijzen:**

| Metric | Target | Hoe Meten |
|--------|--------|-----------|
| Time-to-first-input | <2 sec | Timestamp command → blok open |
| Task completion time | <30 sec (notitie) | Blok open → save |
| Intent accuracy | >90% | Correct blok / totaal attempts |
| Voice adoption | >40% | Voice inputs / totaal inputs |
| Fallback usage | <15% | Blok-picker clicks / totaal |
| Error rate | <5% | Failed saves / totaal saves |

### 3.6 UX Implementatie Prioriteit

```
WEEK 1: Core Interaction
├── Command input component
├── Voice indicator states
├── Block container met animaties
└── Success/error feedback

WEEK 2: Waarde-Blokken
├── Dagnotitie (minimalist form)
├── Zoeken (cmdk + patient cards)
└── Pre-fill animations

WEEK 3: Polish
├── Microinteracties
├── Keyboard shortcuts
├── Fallback blok-picker
└── Onboarding hints

WEEK 4: Demo Ready
├── Happy path perfectioneren
├── Edge case handling
├── Performance tuning
└── Demo scenario walkthroughs
```

---

## 4. Gezamenlijke Waarde-Conclusie

### 4.1 Waar Ligt de Meeste Waarde?

**Top 3 Waarde-Dragers:**

| # | Feature | Waarde Reden |
|---|---------|--------------|
| 1 | **Voice Dagnotitie** | Hoogste frequentie (20x/dag), grootste tijdwinst (80%), laagste effort |
| 2 | **Instant Zoeken** | Elimineert navigatie volledig, elke actie begint met "wie" |
| 3 | **Smart Pre-fill** | "Het systeem begrijpt me" - emotionele waarde + tijdwinst |

**Waarde Piramide:**

```
                    ▲
                   /│\
                  / │ \
                 /  │  \
                /   │   \    DELIGHT
               / AI │    \   "Het systeem denkt mee"
              /  suggestie \
             /──────────────\
            /                \
           /    Pre-fill      \   SATISFACTION
          /   Voice input      \  "Het begrijpt me"
         /   Snelle feedback    \
        /────────────────────────\
       /                          \
      /      Intent herkenning     \   BASIC
     /       Blok openen            \  "Het werkt"
    /        Opslaan lukt            \
   /──────────────────────────────────\
```

### 4.2 Implementatie Volgorde op Basis van Waarde

```
FASE 1: "Het werkt" (Basic)
─────────────────────────
• Command Center layout
• Text input → Intent → Blok openen
• Dagnotitie blok (simpel form)
• Opslaan + bevestiging

FASE 2: "Het begrijpt me" (Satisfaction)
────────────────────────────────────────
• Voice input integratie
• Patient pre-fill uit intent
• Categorie herkenning
• Zoeken blok

FASE 3: "Het denkt mee" (Delight)
─────────────────────────────────
• Rapportage met AI structurering
• Overdracht met AI samenvatting
• Suggesties ("wil je ook...?")
• Context-aware hints
```

### 4.3 Concrete Implementatie Aanbevelingen

**1. Start met Dagnotitie, niet Rapportage**

*Waarom:*
- Dagnotitie is simpeler (1 tekstveld)
- Hogere frequentie = sneller feedback
- Sneller "waarde-bewijs" voor stakeholders
- Rapportage kan als "upgrade" komen

**2. Bouw Zoeken als Fundament**

```typescript
// Zoeken is de basis voor alles
"notitie jan"     → Zoek Jan → Open Dagnotitie
"gesprek met jan" → Zoek Jan → Open Rapportage
"overdracht jan"  → Zoek Jan → Open Overdracht

// Zonder goede zoek = geen pre-fill = geen waarde
```

**3. Voice is Must-Have, niet Nice-to-Have**

*Klant citaat:*
> "Ik draag handschoenen, ik heb net iemand gewassen,
> ik kan niet gaan typen. Voice is geen luxe."

*Implementatie:*
- Voice input in Command Center (dag 1)
- Voice in Dagnotitie tekstveld (dag 1)
- Deepgram werkt al - alleen UI koppelen

**4. Pre-fill is de "Magie"**

```typescript
// Dit is het WOW-moment
Input: "Jan heeft medicatie gehad"

Resultaat:
├── Patient: Jan de Vries (auto-selected)
├── Categorie: Medicatie (auto-selected)
├── Tekst: "heeft medicatie gehad" (pre-filled)
└── Tijd: 14:32 (current time)

// User hoeft alleen: review → save
```

**5. Fallback = Vertrouwen**

```
Als intent mislukt:
┌─────────────────────────────────────────────────────────────┐
│  Ik begreep dat niet helemaal.                             │
│                                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│  │  📝    │ │  🔍    │ │  📋    │ │  🔄    │               │
│  │Notitie │ │ Zoeken │ │Rapport │ │Overdr. │               │
│  └────────┘ └────────┘ └────────┘ └────────┘               │
│                                                             │
│  Of probeer opnieuw: ____________________________          │
└─────────────────────────────────────────────────────────────┘

// Nooit een doodlopende straat
```

### 4.4 Success Criteria (Waarde-Based)

| Stakeholder | Success = |
|-------------|-----------|
| **Klant** | "Mijn team is 30 min/dag sneller klaar met admin" |
| **Zorgverlener** | "Ik hoef niet meer na te denken over het systeem" |
| **PO** | "Demo leidt tot concrete vervolgafspraak" |
| **UX** | "Users raken de fallback-picker zelden aan" |

---

## 5. Actieplan

### Week 1: Foundation + Eerste Waarde
- [ ] Command Center layout
- [ ] Dagnotitie blok (simpel)
- [ ] Basic intent classification
- [ ] Voice input in Command

### Week 2: Core Waarde
- [ ] Zoeken blok (cmdk)
- [ ] Patient pre-fill
- [ ] Categorie herkenning
- [ ] Fallback blok-picker

### Week 3: Waarde Uitbreiden
- [ ] Rapportage blok
- [ ] AI structurering
- [ ] Overdracht blok
- [ ] Microinteracties

### Week 4: Demo + Metrics
- [ ] Demo scenario's perfectioneren
- [ ] Waarde-metrics implementeren
- [ ] LinkedIn content
- [ ] Stakeholder presentatie

---

*De meeste waarde zit in de eenvoudigste dingen: snel een notitie maken,
snel iemand vinden, en het gevoel dat het systeem je begrijpt.*
