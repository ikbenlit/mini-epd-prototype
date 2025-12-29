# 🧩 Functioneel Ontwerp (FO) – Swift Intent System V2

**Projectnaam:** Swift Intent Architecture V2
**Versie:** v2.0 (Draft)
**Datum:** 29-12-2025
**Auteur:** Colin Lit (Antigravity AI)

---

## 1. Doel en relatie met het PRD
🎯 **Doel van dit document:**
Dit FO beschrijft de functionele werking van de "Next Gen" Swift Intent Architectuur. Waar V1 focuste op snelheid en basiscommando's ("Reactive"), focust V2 op contextbegrip, meervoudige intenties en proactieve ondersteuning ("Agentic").

📘 **Relatie tot vorige documentatie:**
Dit document vervangt de architectuur uit `architecture-intent-scalability.md` (Strategie 1: Strict Hierarchy) en kiest voor de **Hybride Route** (Strategie 5 + Agentic extensions) zoals besproken in de UX Evaluatie.

---

## 2. Overzicht van de belangrijkste onderdelen
🎯 **Architectuurmodel:** "The Swift Cortex"
Het systeem bestaat uit drie samenwerkende lagen die elk een andere rol spelen in de interactie:

1.  **Layer 1: The Reflex Arc (De Snelle Reflex)**
    *   *Rol:* Directe uitvoering van simpele, veelvoorkomende commando's.
    *   *Voorbeeld:* "Afspraken vandaag", "Navigeer dossier".

2.  **Layer 2: The Intent Orchestrator (Het Brein)**
    *   *Rol:* AI-gedreven analyse voor complexe zinnen, context-disambiguatie en **Multi-Intents**.
    *   *Voorbeeld:* "Zeg Jan af **en** maak een notitie."

3.  **Layer 3: The Safety Net & Suggestion Engine (De Partner)**
    *   *Rol:* Proactieve business logic die *na* een actie meedenkt.
    *   *Voorbeeld:* Na "Wondzorg registratie" → Suggestie: "Wondcontrole inplannen?"

---

## 3. Userstories

**User Story Template:**
> Als [rol] wil ik [actie] zodat [waarde].

| ID | Rol | Doel / Actie | Context / Voorbeeld | Prioriteit |
|----|------|---------------|-------------------|-------------|
| **US-V2-01** | Vpk | **Multi-Intent** commando's geven | "Meld Jan af voor vandaag **en** bel zijn huisarts." | Hoog |
| **US-V2-02** | Vpk | **Context-aware** begrepen worden | "Plan wondzorg **morgen**" (Snap dat 'morgen' refereert aan *mijn* agenda). | Hoog |
| **US-V2-03** | Regie | **Proactieve checks** op veiligheid | Bij voorschrijven lithium: "Check laatste nierfunctie?" | Middel |
| **US-V2-04** | Psych | **Impliciete intenties** verwerkt zien | "Patiënt was suïcidaal" → Systeem oppert crisisprotocol start. | Hoog |
| **US-V2-05** | Vpk | Geen "Computer says no" ervaring | Bij twijfel: vraag verduidelijking i.p.v. "Ik begrijp het niet". | Hoog |

---

## 4. Functionele werking per onderdeel

### 4.1 Layer 1: The Reflex Arc (Local First)
*   **Trigger:** Elke gebruikersinput (spraak/tekst).
*   **Werking:** Checkt razendsnel (<20ms) of de input matcht met een `Local Pattern` (Regex).
*   **Conditie:** Alleen bij **Confidence > 0.9** (vrijwel zeker) voert hij direct uit.
*   **Fallback:** Bij twijfel (<0.9) of geen match → *Direct doorsturen naar Layer 2*.

### 4.2 Layer 2: The Intent Orchestrator (AI Router)
*   **Trigger:** Input die te complex of dubbelzinnig is voor Layer 1.
*   **Input Context:** Ontvangt niet alleen de zin, maar ook: `ActivePatient`, `CurrentView`, `Time`.
*   **Werking:**
    1.  Analyseert intentie(s).
    2.  Splits samengestelde zinnen ("En", "Daarna") in een **Action Chain**.
    3.  Extraheert entities (Wie, Wanneer, Wat).
*   **Output:** Een lijst van uit te voeren acties: `[ActionA, ActionB]`.

### 4.3 Layer 3: The Safety Net (Post-Action Logic)
*   **Trigger:** Succesvolle afronding van een intent (bijv. `CreateAppointment` klaar).
*   **Werking:** Draait `Domain Rules` op de uitgevoerde actie.
*   **UI:** Toont een **Suggestion Toast** of **Card** ("Wil je ook...?").
*   **Voorbeeld:**
    *   *Actie:* Medicatie gestart.
    *   *Rule:* "Nieuwe medicatie vereist evaluatie na 2 weken."
    *   *Suggestie:* "Evaluatie afspraak inplannen over 14 dagen?"

---

## 5. UI-overzicht (Flow)

De UI past zich aan op basis van de complexiteit van de intentie.

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Input: "Zeg Jan af en maak notitie: grieperig"           │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Processing (Cortex): "1 moment, ik verwerk 2 acties..."  │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Execution UI (Stacked Cards)                             │
│ ┌──────────────────────────────────────┐                    │
│ │ ✅ Afspraak Jan (14:00) Geannuleerd  │                    │
│ └──────────────────────────────────────┘                    │
│ ┌──────────────────────────────────────┐                    │
│ │ 📝 Concept Notitie: "grieperig"      │ [Bevestigen]       │
│ └──────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Safety Net (Proactive Toast)                             │
│ 💡 "Wil je de griep-poli waarschuwen?"   [Ja, doe maar] [X] │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Interacties met AI (Specificaties)

| Component | Trigger | AI Model | Prompt Strategie | Output Structuur |
|-----------|---------|----------|------------------|------------------|
| **Reflex** | User Input | *Geen (Regex)* | N.v.t. | `SingleIntent` |
| **Cortex** | Complex Input | Claude 3.5 Haiku | "You are an Orchestrator. Output a JSON list of intents." | `Array<IntentAction>` |
| **Safety** | Action Done | Regelset / Small AI | "Based on this action, what is the protocol?" | `Suggestion | null` |

### 6.1 Multi-Intent Data Model
Het systeem moet worden omgebouwd van `Single Intent` naar `Intent Chain`:

**Oud:**
```typescript
interface Result { intent: SwiftIntent }
```

**Nieuw:**
```typescript
interface IntentChain {
  originalInput: string;
  actions: IntentAction[];
}

interface IntentAction {
  intent: SwiftIntent;
  entities: ExtractedEntities;
  status: 'pending' | 'success' | 'failed';
  requiresConfirmation: boolean;
}
```

---

## 7. Migratie & Roadmap

### Fase 1: Hybrid Foundation (Week 1-2)
*   Implementatie van de **Reflex/Cortex switch**.
*   Zorgen dat *alle* twijfelgevallen naar de AI gaan (geen "Unknown" errors meer).
*   Context object (`ActivePatient`) meegeven aan AI.

### Fase 2: Orchestration (Week 3-4)
*   Refactor frontend om `IntentChain` (lijstjes) te ondersteunen.
*   Prompt engineering voor multi-intent herkenning ("En", "Daarna").

### Fase 3: Proactivity (Maand 2)
*   Bouwen van de `Safety Net` listeners.
*   Protocollen toevoegen voor Medicatie en Wondzorg.

---

## 8. Bijlagen & Referenties
*   **PRD/Vision:** `docs/swift/ux-simulation-intent-next-level.md`
*   **Technical Base:** `lib/swift/intent-classifier-ai.ts`
*   **Legacy Docs:** `docs/swift/intent-architecture-v2-proposal.md`
