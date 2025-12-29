# UX Simulatie: Intent System "Next Level"

**Betreft:** Brainstormsessie voor de volgende fase van de Swift Intent Architectuur.
**Doel:** Het systeem transformeren van "Command-Response" naar "Proactive Assistant".
**Deelnemers:**
*   **PO (Product Owner):** Focus op waarde, haalbaarheid en roadmap.
*   **UX (UX Specialist):** Focus op interactie, vertrouwen en de "Invisible Interface".
*   **Vpk (Verpleegkundige):** Focus op snelheid, handen-vrij werken, administratieve lastenverlichting.
*   **Psych (Psycholoog):** Focus op nuance, cliënt-context, emotionele lading en rapportage.
*   **Regie (Psychiater/Regiebehandelaar):** Focus op veiligheid, medicatie, complexiteit en het grote plaatje.

---

## 1. De Huidige Stand van Zaken

**PO:** "Welkom allen. Even een recap: ons huidige systeem is *snel*. We snappen commando's als 'Maak afspraak' en 'Schrijf dagnotitie' binnen 100ms. De basis staat. Maar Colin en ik willen weten: wat is het *volgende niveau*? Waar lopen jullie in de praktijk nog tegenaan?"

**Vpk:** "Het is snel, ja. Maar het voelt nog wel als een *computer*. Ik moet commando's geven. Als ik een cliënt heb gewassen en een wond heb verzorgd, moet ik zeggen: *'Maak notitie: wond verzorgd'* én daarna *'Plan wondcontrole over 3 dagen'*. Waarom snapt hij niet dat bij een 'vochtige wond' er *altijd* een controle hoort?"

**UX:** "Interessant. Je wilt toe naar **impliciete intents**. Het systeem moet snappen dat Actie A vaak Actie B impliceert."

## 2. Diepgang & Context (De Psycholoog)

**Psych:** "Mij gaat het om de inhoud. Ik spreek cliënten die suïcidaal kunnen zijn. Als ik dicteer: *'Cliënt oogt somber, spreekt over uitzichtloosheid'*, dan wil ik niet dat Swift alleen maar zegt: 'Notitie opgeslagen'. Ik wil dat hij met me meedenkt. 'Moet ik het signaleringsplan updaten?' of 'Wil je de crisisdienst bellen?'."

**PO:** "Oef, dat is spannend. Dan gaan we van 'uitvoeren' naar 'adviseren'. Durven we dat aan qua liability?"

**Regie:** "We *moeten* dat aandurven, als 'Safety Net'. Kijk, ik schrijf medicatie voor. Als ik zeg: *'Start Lithium 400mg'*, dan verwacht ik dat Swift direct checkt: 'Hé, de laatste nierfunctie is van 6 maanden geleden. Lab aanvragen?'. Nu is het systeem passief. Ik wil een **actieve partner**."

## 3. Complexe Flows & Agentic Behavior

**UX:** "We hebben het hier over een fundamentele shift.
*   Niveau 1 (Nu): **Reactive**. Jij vraagt, wij draaien.
*   Niveau 2 (Wens): **Agentic**. Het systeem *begrijpt* processen en *stelt voor*."

**Vpk:** "En mag het ook minder 'gescheiden' zijn? Nu zit ik in 'Agenda modus' of 'Dossier modus'. Soms wil ik zeggen: *'Jan voelt zich niet lekker, ik meld hem af voor therapie en bel zijn huisarts'*. Dat zijn drie dingen: Notitie, Agenda wijziging, Taak aanmaken. Nu struikelt Swift daarover."

**PO:** "Multi-intent support. Dat staat op de backlog, maar is technisch pittig."

**UX:** "Voor de gebruiker bestaat er geen backlog. Voor de gebruiker is het één handeling: 'Reageer op situatie Jan'. Als wij ze dwingen dat op te knippen in drie spraakopdrachten, zijn we een obstakel."

**Regie:** "Precies. 'Ontlasten' betekent dat ik mijn *intentie* uitspreek, niet mijn *administratie*. Mijn intentie is 'Zorg voor Jan regelen'. De administratie (agenda, brief, notitie) is jullie probleem."

## 4. Nuance & "Smart Patterns"

**Psych:** "Nog iets kleins: toon. Als ik een notitie maak over een agressie-incident, is mijn stemgebruik anders. Kan Swift dat niet markeren? 'Let op: emotionele lading hoog'. En dat hij dat bij de overdracht aan de avonddienst highlight?"

**UX:** "Sentiment analysis als metadata bij intents. Heel vet. Dan wordt de intent 'Maak notitie' verrijkt met `severity: high`."

**Vpk:** "En alsjeblieft, stop met die eindeloze bevestigingsvragen voor dingen die ik elke dag doe. Als ik zeg 'Rapportage ADL ok', hoef ik niet te horen 'Wil je een rapportage maken met tekst ADL ok?'. Ja, natuurlijk. *Just do it*."

**PO:** "Klinkt als 'Adaptive Confidence'. Als je iets vaak doet, hoeft het systeem minder te vragen."

---

## 5. Synthese: Het Nieuwe "Level"

Op basis van dit gesprek identificeren we drie pijlers voor de optimalisatie:

### Pijler 1: Chain of Thought & Multi-Intents
De gebruiker denkt niet in silo's.
*   **Use Case:** "Zeg afspraak af en maak notitie dat hij ziek is."
*   **Oplossing:** Een "Orchestrator" die de zin opsplitst en meerdere intents parallel of sequentieel afvuurt.

### Pijler 2: Context-Aware Proactivity (The Safety Net)
Swift moet "weten" wat medisch logisch is.
*   **Use Case:** "Start medicatie X" -> Systeem checkt lab/interacties. "Wond verzorgd" -> Systeem suggereert vervolgafspraak.
*   **Oplossing:** `Intent Triggers`. Een intent kan een *andere* intent triggeren als suggestie (een "Follow-up Action").

### Pijler 3: Adaptive & Invisible Interface
Minder frictie voor power users.
*   **Use Case:** Geen bevestiging voor routine-taken, wel voor afwijkende zaken.
*   **Oplossing:** User-specific confidence thresholds. Het systeem leert wat *jij* normaal vindt.

---

## 6. Advies aan Tech (Colin)

1.  **Bouw een 'Intent Chainer':** Support voor `[Intent A] AND [Intent B]` in één uiting.
2.  **Implementeer 'Follow-up Suggestions':** Na succesvolle afronding van Intent A, kan de UI (of spraak) direct vragen: "Wil je ook Intent B doen?" (o.b.v. regels of AI).
3.  **Context Injectie:** De intent-classifier moet niet alleen de *zin* krijgen, maar ook de *huidige cliënt-status* (bijv. "Laatste labwaardes", "Openstaande agenda"). Dit maakt de AI slimmer zonder trager te worden.

**UX Conclusie:** "We stoppen met het bouwen van een 'Spraakgestuurd Toetsenbord'. We gaan bouwen aan een **AI Collega**."
