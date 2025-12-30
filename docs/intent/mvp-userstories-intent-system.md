# 🚀 MVP Userstories & Scope: Swift Cortex (Public Prototype)

**Betreft:** Scope voor de "Build in Public" fase van het Swift Intent System V2.
**Doel:** Een werkend, indrukwekkend prototype neerzetten dat de kernwaarde van "Agency" (Multi-intent & Context) demonstreert, zonder te verzanden in productie-complexiteit.

---

## 1. Scope Definitie

We splitsen de ontwikkeling in **MVP** (Wat we nu bouwen voor de publieke demo) en **Post-MVP** (Wat nodig is voor een veilig medisch productiesysteem).

### ✅ In Scope (MVP - "The Prototype")
*Focus: Wow-factor, core mechanics, demonstratie van intelligentie.*

1.  **Hybrid Architecture:** De naadloze switch tussen Layer 1 (Reflex) en Layer 2 (AI).
2.  **Multi-Intent:** Het kunnen verwerken van samengestelde zinnen ("Zeg af en maak notitie").
3.  **Context Awareness:** Het correct interpreteren van "hij", "deze", "morgen" o.b.v. de huidige schermstatus.
4.  **UI Feedback:** Visualisatie van het "denkproces" en gestapelde resultaten (Stacked Cards).
5.  **Basic Nudge:** Eén hardcoded voorbeeld van proactiviteit (bijv. "Wondcontrole suggestie") om het concept te tonen.

### ❌ Out of Scope (Post-MVP - "The Product")
*Focus: Veiligheid, robuustheid, edge-cases.*

1.  **Complete Medische Protocollen:** Geen volledige rule-engine voor alle ziektebeelden.
2.  **Complex Rollback:** Geen "Undo" knop voor database mutaties (wel confirmaties vooraf).
3.  **Offline Mode:** Het prototype gaat uit van internetverbinding.
4.  **Advanced Error Handling:** Geen automatische retry-mechanismes of fallbacks als de LLM down is.
5.  **Analytics & Learning:** Geen telemetry opslag voor model-training.

---

## 2. MVP User Stories

Deze stories zijn leidend voor de aankomende bouwfase.

### Thema 1: De Slimme Assistent (Core Intelligence)

| ID | Story | Acceptatie Criteria |
|----|-------|---------------------|
| **US-MVP-01** | Als gebruiker wil ik **twee acties in één zin** kunnen geven ("Zeg Jan af en mail de huisarts"), zodat ik niet hoef te wachten. | - Systeem herkent "en/daarna" signalen.<br>- UI toont twee losse acties in progressie.<br>- Beide acties worden uitgevoerd. |
| **US-MVP-02** | Als gebruiker wil ik naar **"deze patiënt"** of **"hij"** kunnen verwijzen, zodat ik natuurlijk kan spreken. | - Systeem gebruikt de `ActivePatient` uit de store om "hij" te invullen.<br>- Als er geen patiënt open staat, vraagt het systeem "Wie bedoel je?". |
| **US-MVP-03** | Als gebruiker wil ik **impliciete tijd** ("morgen", "volgende week") kunnen gebruiken, zodat ik geen datums hoef te noemen. | - "Morgen" wordt correct vertaald naar de datum van morgen.<br>- Context (huidige tijd) wordt meegestuurd naar de AI. |

### Thema 2: Hybride Snelheid (Architecture)

| ID | Story | Acceptatie Criteria |
|----|-------|---------------------|
| **US-MVP-04** | Als gebruiker wil ik dat simpele commando's (**"Agenda", "Zoek Jan"**) direct werken (<20ms), zodat het systeem niet traag voelt. | - Reflex Arc (Regex) vangt deze af.<br>- Geen AI spinner zichtbaar, directe actie. |
| **US-MVP-05** | Als gebruiker wil ik zien **dat het systeem nadenkt** bij complexe vragen, zodat ik weet dat ik moet wachten. | - Bij trage/AI acties (Layer 2) toont de UI direct een "Processing..." indicator.<br>- Geen "bevroren" scherm. |

### Thema 3: De Partner (Proactivity - Concept)

| ID | Story | Acceptatie Criteria |
|----|-------|---------------------|
| **US-MVP-06** | Als gebruiker wil ik een **proactieve suggestie** zien na een specifieke actie (bijv. wondzorg), zodat ik snap dat het systeem meedenkt. | - *Demo Case:* Na invoeren "Wondverzorging" toont systeem kaartje: "Afspraak wondcontrole inplannen?".<br>- Klikken op "Ja" opent direct het planningsscherm. |

---

## 3. Technische Randvoorwaarden (MVP)

*   **Model:** Claude 3.5 Haiku (via Anthropic API).
*   **Latency Target:** Reflex < 50ms, AI < 1.5s (acceptabel voor prototype).
*   **Data:** We gebruiken mock-data voor patiënten en agenda, geen echte EPD koppeling.

## 4. 'Build in Public' roadmap

1.  **Week 1:** De "Reflex" werkend krijgen (De basis).
2.  **Week 2:** De "Cortex" aansluiten (Multi-intent parsing demo).
3.  **Week 3:** De UI polijsten (Stacked Cards & Animaties) & Share video.
