# Review Rapport: Cortex & Intent System V2

**Datum:** 29-12-2025
**Betreft:** Review van `architecture-cortex-v2.md` en `fo-cortex-intent-system-v2.md`  
**Reviewers (Simulatie):** Architect, Backend Dev, Frontend Dev, UX Designer, QA Engineer

---

## 1. Algemene Conclusie
Het voorgestelde **Hyper-Hybrid model (Cortex)** is een sterke, volwassen architectuur die de grootste pijnpunten van V1 (traagheid bij simpele taken, domheid bij complexe taken) effectief oplost. De opsplitsing in drie lagen (Reflex, Orchestrator, Nudge) is logisch en schaalbaar.

**Oordeel:** ✅ **Go for launch**, mits onderstaande punten in acht worden genomen.

---

## 2. Feedback per Rol

### 🏗️ Software Architect / Lead
**Perspectief:** Systeemsamenhang, onderhoudbaarheid, risico's.

*   **Pros:**
    *   **Separation of Concerns:** De scheiding tussen deterministische regex (L1) en probabilistische AI (L2) beschermt de performance van basisfuncties.
    *   **Schaalbaarheid:** L2 is losgekoppeld; we kunnen het model (Claude Haiku) later vervangen door GPT-4o of een local model zonder L1 te breken.
    *   **Type Safety:** De definities voor `IntentChain` en `CortexContext` zijn robuust.
*   **Cons / Risico's:**
    *   **State Complexity:** Het beheren van een `IntentChain` (met statussen als `pending`, `executing`, `failed`) introduceert complexe state management logica. Wat als stap 1 slaagt maar stap 2 faalt? Rollback support (genoemd in L2 architecture overview) is complex om generiek te bouwen.
    *   **Drift:** Risico dat L1 (Regex) en L2 (AI) uit elkaar groeien. Als de AI "agenda" anders interpreteert dan de Regex.
*   **Advies:** Begin L2 zonder volledige rollback support (fail-forward of handmatige cleanup) om complexiteit te beperken.

### ⚙️ Backend Developer
**Perspectief:** Integratie, LLM API's, performance.

*   **Pros:**
    *   **Duidelijke API's:** De inputs en outputs voor de Orchestrator zijn helder gedefinieerd.
    *   **Model Keuze:** Claude 3.5 Haiku is inderdaad de sweet spot voor snelheid/kosten.
*   **Cons:**
    *   **Latency:** Zelfs met Haiku is ~400ms+ merkbaar. De UI "wachtstand" is cruciaal.
    *   **Error Handling:** Wat als de API 500't of timeout? De fallback strategie ontbreekt in de docs (terugvallen naar L1 of "Probeer later"?).
*   **Haalbaarheid:** Goed haalbaar. De prompts (`ORCHESTRATOR_SYSTEM_PROMPT`) zien er solide uit.

### 🎨 Frontend Developer
**Perspectief:** UI implementatie, feedback loops, React state.

*   **Pros:**
    *   **Store Integration:** Uitbreiding van `CortexStore` is logisch.
    *   **Reflex Snelheid:** Client-side regex betekent instant feedback (<20ms), wat de UX enorm verbetert.
*   **Cons:**
    *   **UI Complexiteit:** Het visualiseren van "Stacked Cards" voor multi-intents is nieuw. Hoe tonen we de voortgang van "Actie 1 klaar, Actie 2 bezig"?
    *   **Optimistic UI:** Bij L1 kunnen we optimistisch updaten. Bij L2 moeten we wachten. Deze hybride UX (soms direct, soms laden) kan inconsistent voelen als de transities niet soepel zijn.
*   **Vraag:** Moeten we de "Reflex" logica niet in een Web Worker draaien om de main thread vrij te houden, of is de regex simpel genoeg? (Waarschijnlijk simpel genoeg).

### 🧘 UX Designer / Product Owner
**Perspectief:** Gebruikerswaarde, duidelijkheid, "Magic" factor.

*   **Pros:**
    *   **Killer Feature:** Multi-intent ("Zeg af en email") is een enorme meerwaarde die de gebruiker tijd bespaart.
    *   **Proactivity:** De Nudge suggesties ("Wondcontrole inplannen?") transformeren het systeem van typemachine naar partner.
    *   **No Dead Ends:** Het doel "Nooit 'ik snap het niet' zeggen" is perfect.
*   **Cons / Risico's:**
    *   **Uncanny Valley:** Als L1 "dom" voelt en L2 "slim", snapt de gebruiker dan wanneer hij tegen wie praat?
    *   **Over-proactive:** Te veel Nudge suggesties worden irritant (Clippy effect). "Wil je dit opslaan?" "Wil je dat doen?".
*   **Advies:** Start Nudge met zeer conservatieve regels. Alleen medisch kritieke suggesties, geen administratieve "nagging".

### 🧪 QA Engineer / Tester
**Perspectief:** Testbaarheid, betrouwbaarheid.

*   **Pros:**
    *   **L1 is testbaar:** Regex is 100% voorspelbaar -> Unit tests zijn makkelijk.
*   **Cons:**
    *   **L2 is non-deterministisch:** AI output kan variëren. Hoe schrijven we E2E tests voor "Slimme interpretatie"?
    *   **Context Matrix:** De hoeveelheid combinaties van Context * Input is enorm.
*   **Advies:** We hebben een "Golden Dataset" nodig van 50+ complexe zinnen die we periodiek tegen de Orchestrator draaien om regressie (dommer worden) te meten.

---

## 3. Wat ontbreekt er / Moet erbij?

1.  **Rate Limiting & Cost Guard:** Er is geen mechanisme beschreven om misbruik of "runaway loops" (AI blijft zichzelf aanroepen) te voorkomen.
    *   *Actie:* Toevoegen aan architectuur (o.a. max requests per minuut per user).
2.  **Telemetry & Feedback Loop:** Hoe weten we of de AI fout zit?
    *   *Actie:* Voeg een simpele "Thumbs up/down" of "Undo" event tracking toe aan de IntentChain. Dit is cruciaal om de prompts te verbeteren.
3.  **Offline Mode:** Wat doet L2 (Orchestrator) als er geen internet is?
    *   *Actie:* Expliciete fallback: "Je bent offline. Alleen basiscommando's (L1) werken nu."

## 4. Wat kan er (voor nu) af?

1.  **"Severity" Sentiment Analysis** in `ExtractedEntities`:
    *   *Waarom:* Leuk, maar niet essentieel voor MVP. Maakt de prompt complexer en duurder. Eerst focussen op feit-extractie.
2.  **Complex Rollback Support:**
    *   *Waarom:* Het engineeren van een "Undo" voor een database-write of email-send is erg complex.
    *   *Alternatief:* Vraag gewoon bevestiging vooraf bij destructieve acties (zoals ook beschreven), dat is genoeg voor V2.

## 5. Eindoordeel Haalbaarheid

| Onderdeel | Haalbaarheid | Complexiteit |
|-----------|--------------|--------------|
| Layer 1 (Reflex) | ⭐⭐⭐⭐⭐ (Hoog) | Laag |
| Layer 2 (Orchestrator) | ⭐⭐⭐⭐ (Goed) | Middel |
| Layer 3 (Nudge) | ⭐⭐⭐⭐ (Goed) | Laag (als we simpel beginnen) |
| Multi-Intent Frontend | ⭐⭐⭐ (Uitdagend) | Hoog (UI flows) |

**Advies:** Start direct met **Fase 1 (Reflex + Basic Orchestrator)**. Schuif Layer 3 (Nudge) naar de volgende sprint om focus te houden op de core flow.

## 6. Concretie Actiepunten

Op basis van de bovenstaande analyse zijn dit de direct uit te voeren acties voor het team:

| Prio | Domein | Actie | Eigenaar |
|------|--------|-------|----------|
| 🔴 **Prio 1** | **Architectuur** | **Rate Limiting toevoegen**: Bescherm tegen LLM-kosten explosies (max req/min). | Architect / Backend |
| 🔴 **Prio 1** | **Backend** | **Error Fallback Strategie**: Wat gebeurt er als Claude 500't? (Fallback naar L1 of error msg). | Backend |
| 🟡 **Prio 2** | **QA** | **Golden Dataset**: Stel een lijst samen van 50 test-zinnen voor regressietests. | QA / PO |
| 🟡 **Prio 2** | **Frontend** | **Feedback Loop**: Voeg simpele 👍/👎 toe bij AI-acties voor latere analyse. | Frontend |
| 🟢 **Prio 3** | **Frontend** | **Offline Mode**: Detecteer connection loss en forceer L1-only modus. | Frontend |
| 🟢 **Prio 3** | **Scope** | **Schrappen**: Verwijder 'Severity Analysis' uit de prompt (te complex voor nu). | Backend / PO |
| 🟢 **Prio 3** | **Scope** | **Schrappen**: Verwijder complexe 'Rollback' logica, vertrouw op confirmatie-dialogen. | Architect |
