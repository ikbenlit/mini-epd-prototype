# Cortex V2 Demo Script

**Duur:** 5 minuten
**Doelgroep:** Product stakeholders, developers, demo publiek
**Versie:** 1.0
**Datum:** 01-01-2026

---

## Pre-Demo Setup

### 1. Environment Check

```bash
# Start development server
pnpm dev
```

### 2. Feature Flags

Controleer `.env.local`:
```env
NEXT_PUBLIC_CORTEX_V2=true
NEXT_PUBLIC_CORTEX_MULTI_INTENT=true
NEXT_PUBLIC_CORTEX_NUDGE=true
```

### 3. Browser Setup

- Open `http://localhost:3000/epd/cortex`
- Login met test account
- Clear browser console (voor schone logs)

### 4. Test Data

Zorg dat de volgende patiënten beschikbaar zijn:
- **Jan de Vries** - Patiënt met afspraken vandaag
- **Marie van den Berg** - Patiënt zonder afspraken

---

## Demo Flow (5 minuten)

### Scene 1: Snelheid - Reflex Arc (30 sec)

**Doel:** Toon dat simpele commando's razendsnel worden afgehandeld.

**Actie:**
```
Typ: "agenda vandaag"
```

**Verwacht resultaat:**
- Direct resultaat (< 100ms)
- Agenda artifact opent met vandaag's afspraken
- Console toont: `[Reflex] Handled locally`

**Talking point:**
> "Simpele commando's worden lokaal afgehandeld zonder AI. Dat betekent milliseconden responstijd."

---

### Scene 2: Multi-Intent - Orchestrator (90 sec)

**Doel:** Toon dat het systeem meerdere intenties in één zin herkent.

**Actie:**
```
Typ: "Zeg de afspraak van Jan af en maak een notitie dat hij griep heeft"
```

**Verwacht resultaat:**
1. Korte "Even nadenken..." indicator (AI processing)
2. **ActionChainCard** verschijnt met 2 acties:
   - Actie 1: "Afspraak annuleren" (Jan) - Status: Confirming
   - Actie 2: "Dagnotitie" (Jan: griep) - Status: Pending
3. AI reasoning zichtbaar (inklapbaar)

**Demo stappen:**
1. Wijs op de 2 gedetecteerde acties
2. Klap AI reasoning open → toon "en" detectie
3. Klik "Bevestig" op actie 1
4. Observeer status change: Executing → Success
5. Actie 2 gaat automatisch naar "Confirming"
6. Klik "Bevestig" op actie 2
7. Chain completes, artifacts zijn geopend

**Talking point:**
> "Het systeem herkent automatisch dat dit twee aparte taken zijn. 'Zeg af' én 'maak notitie'. Beide worden sequentieel uitgevoerd."

---

### Scene 3: Context - Pronoun Resolution (60 sec)

**Doel:** Toon dat het systeem context gebruikt om pronouns te resolven.

**Voorbereiding:**
- Selecteer patiënt "Marie van den Berg" in de ContextBar

**Actie:**
```
Typ: "Maak een notitie voor haar: medicatie gegeven om 14:00"
```

**Verwacht resultaat:**
- AI resolves "haar" naar "Marie van den Berg"
- Dagnotitie artifact opent met Marie's gegevens ingevuld
- Console toont: `patientResolution: 'pronoun'`

**Talking point:**
> "Het systeem snapt dat 'haar' verwijst naar de actieve patiënt. Geen naam herhalen nodig."

---

### Scene 4: Proactiviteit - Nudge Suggestie (90 sec)

**Doel:** Toon proactieve suggesties op basis van medische protocollen.

**Actie:**
```
Typ: "Notitie Jan: wond verzorgd en verbonden, ziet er goed uit"
```

**Verwacht resultaat:**
1. Dagnotitie wordt opgeslagen
2. **NudgeToast** verschijnt (links-onder):
   - Bericht: "Wondcontrole inplannen over 3 dagen?"
   - Knoppen: "Ja, inplannen" / "Later"
   - Progress bar countdown (5 min expiry)
3. Klik "Ja, inplannen"
4. Agenda artifact opent met Jan's gegevens

**Talking point:**
> "Na wondzorg suggereert het systeem automatisch een controle-afspraak. Dit is gebaseerd op medische protocollen en voorkomt dat belangrijke follow-ups vergeten worden."

---

### Scene 5: Fallback - Clarificatie (30 sec)

**Doel:** Toon graceful handling van ambigue input.

**Actie:**
```
Typ: "Plan wondzorg"
```

**Verwacht resultaat:**
- **ClarificationCard** verschijnt:
  - Vraag: "Wil je een afspraak inplannen of een notitie maken?"
  - Opties: "Afspraak inplannen" / "Notitie maken"
- Selecteer een optie → flow gaat verder

**Talking point:**
> "Bij onduidelijkheid vraagt het systeem om verduidelijking in plaats van te raden. Dat is veiliger in een medische context."

---

## Backup Scenarios

### Als AI niet reageert (timeout)

**Symptoom:** Lange "Even nadenken..." zonder resultaat

**Actie:**
1. Wacht 5 seconden
2. Systeem valt automatisch terug op Reflex
3. Toon: "Graceful degradation - het systeem blijft werken"

**Talking point:**
> "Als de AI even niet beschikbaar is, valt het systeem terug op lokale verwerking. De gebruiker merkt nauwelijks iets."

---

### Als geen patiënt geselecteerd

**Symptoom:** Context resolution faalt

**Actie:**
```
Typ: "notitie jan medicatie gegeven"
```

**Verwacht:**
- Systeem extraheert "jan" expliciet uit de tekst
- Werkt zonder context

**Talking point:**
> "Ook zonder actieve patiënt werkt het systeem - het haalt de naam uit je invoer."

---

### Feature Flag Demo

**Doel:** Toon feature control

**Actie:**
1. Zet `NEXT_PUBLIC_CORTEX_NUDGE=false` in `.env.local`
2. Herstart dev server
3. Herhaal wondzorg notitie
4. **NudgeToast verschijnt NIET**

**Talking point:**
> "Alle V2 features zitten achter feature flags. We kunnen ze individueel in- of uitschakelen voor geleidelijke rollout."

---

## Closing Statement

> "Dit is Cortex V2: een systeem dat begrijpt wat je bedoelt, meerdere taken tegelijk aankan, context gebruikt voor slimme interpretatie, en proactief meedenkt op basis van protocollen.
>
> De architectuur is een three-layer systeem:
> - **Layer 1 (Reflex):** Razendsnelle lokale verwerking voor simpele taken
> - **Layer 2 (Orchestrator):** AI voor complexe, multi-intent analyse
> - **Layer 3 (Nudge):** Proactieve suggesties op basis van regels
>
> Dit is de transformatie van een 'spraakgestuurd toetsenbord' naar een echte AI Collega."

---

## Test Zinnen Referentie

### Simpele commando's (Reflex)
- `agenda vandaag`
- `zoek marie`
- `notitie jan medicatie`
- `overdracht`

### Multi-intent (Orchestrator)
- `Zeg Jan af en maak notitie dat hij griep heeft`
- `Zoek Marie en plan een afspraak`
- `Eerst overdracht maken en dan agenda bekijken`

### Context-dependent (Pronoun)
- `Maak notitie voor hem` (met actieve patiënt)
- `Verzet haar afspraak naar morgen`
- `Zoek die patiënt op`

### Nudge triggers
- `Notitie: wond verzorgd` → Wondcontrole suggestie
- `Notitie: medicatie gewijzigd` → Medicatie controle suggestie

### Ambigue input (Clarification)
- `Plan wondzorg`
- `Afspraak`
- `Jan`

---

## Technische Details

### Console Logging

Tijdens demo zijn deze logs zichtbaar:
```
[Reflex] Handled locally: agenda_query (0.95)
[Orchestrator] AI classification: 2 actions detected
[ChatPanel] Opening artifact: dagnotitie
[ChatPanel] Nudge suggestions: 1
[CommandCenter] Opening artifact from nudge: create_appointment
```

### Performance Metrics

| Actie | Target | Gemiddeld |
|-------|--------|-----------|
| Reflex classificatie | < 20ms | ~5ms |
| Orchestrator (AI) | < 3s | ~1-2s |
| Artifact open | < 100ms | ~50ms |

---

## Versiehistorie

| Versie | Datum | Wijziging |
|--------|-------|-----------|
| 1.0 | 01-01-2026 | Initiële versie |
