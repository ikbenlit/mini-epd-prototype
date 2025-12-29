# UX Evaluatie: Intent System Schaalbaarheid

**Betreft:** Evaluatie van `architecture-intent-scalability.md` vanuit gebruikersperspectief.  
**Deelnemers:** Product Owner (PO), UX Designer (UX), Klantvertegenwoordiger (Klant).

---

## 1. Simulatie Gesprek

**PO:** "Bedankt dat jullie er zijn. Tech heeft een plan gemaakt voor de schaalbaarheid van ons 'Intent System'. Kort gezegd: we gaan van 7 naar 35+ intents. Om dit snel te houden, adviseren de developers **Strategie 1: Een strikte hiërarchie**. Eerst bepalen we de categorie (bijv. 'Agenda' of 'Medicatie'), en dan pas de specifieke actie. Ze zeggen dat dit de performance met factor 5 verbetert. Klinkt goed, toch?"

**UX:** "Ho even. 'Performance' met factor 5... waar hebben we het over? Milliseconden?"

**PO:** "Eh, ja. Ze zeggen dat het teruggaat van 50ms naar 10ms."

**UX:** *Zucht.* "Voor een gebruiker is 50ms al 'direct'. Het menselijk brein neemt alles onder de 100ms waar als instant. Gaan we hier een complex hiërarchisch systeem bouwen om 40ms te winnen die niemand voelt? Mijn zorg is de rigiditeit. Wat als een gebruiker zegt: *'Plan wondzorg in voor morgen'*?"

**Klant:** "Precies. Dat is een dagelijkse zin. Is dat 'Planning' (agenda) of 'Zorg' (wondzorg)?"

**PO:** "In het technisch voorstel zou dat waarschijnlijk onder 'Planning' vallen, omdat het woord 'plan' erin zit. Maar als het systeem denkt dat het 'Zorg' is, vindt hij nooit de intent 'afspraak maken'."

**Klant:** "Als dat gebeurt, haken mijn mensen af. Ze gaan niet leren praten zoals de computer. Als ze twee keer 'Ik begrijp het niet' krijgen, typen ze het wel met de hand. En dan is de hele winst van dit spraaksysteem weg."

**UX:** "Dat is mijn punt. Een hiërarchie introduceert een **extra faalpunt**: de categorie-detectie. Als die fout is, is alles fout. Ik keek naar dat document en zag **Strategie 4: Compositional Intents** staan. Dat gaat over 'Actie' + 'Onderwerp'. Dat klinkt veel meer zoals mensen praten."

**PO:** "Klopt, maar tech zegt dat Strategie 4 'refactoring' vereist en complexer is om te bouwen."

**UX:** "Mag ik heel eerlijk zijn? We bouwen een 'Next Gen' EPD. Als we kiezen voor de makkelijkste technische oplossing die resulteert in een domme bot, falen we. Ik heb liever dat het 200ms duurt (nog steeds snel) en dat hij *alles* snapt, dan dat hij in 10ms de verkeerde categorie kiest."

**Klant:** "Eens. Wat staat er nog meer in? Iets met AI?"

**PO:** "Ja, **Strategie 5: Hybrid AI**. Daar gebruiken we een klein AI-model om de categorie te bepalen, en dan lokale logica voor de details. Dat duurt wel iets langer, ongeveer 100ms."

**UX:** "Kijk, dat wordt interessant! 100ms is nog steeds perfect binnen de UX-grenzen van 'responsief'. Maar een AI is veel slimmer in context begrijpen dan een lijstje trefwoorden. Als iemand zegt: *'Ik moet even kwijt dat Jan vandaag erg onrustig was tijdens het wassen'*, snapt een AI dat dit 'Rapportage' is, terwijl een zoekwoord-systeem misschien struikelt over 'wassen' en denkt dat het een taak is."

**Klant:** "Wat kost dat? Die AI tokens?"

**PO:** "Dat is een puntje. Lokale regex is gratis. AI kost geld per bericht. Maar we hebben het over kleine modelletjes (Haiku), dus de kosten vallen mee."

**Klant:** "Luister, een verpleegkundige kost 40 euro per uur. Als ze per dag 10 minuten besparen door vlekkeloze spraaksturing, mag dat systeem van mij best een paar cent per dag kosten. Betrouwbaarheid boven alles."

**UX:** "Conclusie voor mij: Die 'Strategie 1' (Hiërarchie op regex basis) voelt als *premature optimization*. Ze optimaliseren voor processortijd, niet voor gebruikerservaring. Ik stel voor dat we inzetten op flexibiliteit."

**PO:** "Dus jullie zeggen: focus niet op de pure snelheidswinst van Strategie 1, maar op de 'begrijpelijkheid' van Strategie 4 of 5?"

**UX:** "Ja. En ik wil een 'Fail-safe' garantie. Als het hiërarchische systeem twijfelt, mag het niet zeggen 'snap ik niet'. Dan moet het doorschakelen naar die bredere AI. De gebruiker mag *nooit* last hebben van onze database-structuur."

---

## 2. Synthese & Advies

Op basis van de evaluatie is dit de aanbevolen `User-Centric Architecture` koers:

### 1. Verwerp mic-optimalisatie ten koste van UX
Het verschil tussen 12ms en 50ms is irrelevant voor de eindgebruiker, maar een foutieve classificatie is fataal voor het vertrouwen. De "Recommended" status van **Strategie 1 (Strict Hierarchical)** wordt afgewezen als stand-alone oplossing.

### 2. Kies voor de Hybride Route (Strategie 5 + 1)
We adviseren een gelaagd model dat betrouwbaarheid voorop stelt:
*   **Layer 1 (Lokaal/Snel):** Gebruik high-confidence regex patrons voor overduidelijke commando's (b.v. "Maak afspraak" = Agenda). Dit vangt 80% af met 0ms latency.
*   **Layer 2 (AI Router):** Bij twijfel (conflicterende patterns) of complexe zinnen (b.v. "Plan wondzorg"), schakel direct door naar de AI Router (Strategie 5). De 100ms latency is acceptabel.

### 3. Lange Termijn: Compositional Thinking (Strategie 4)
De backend moet idealiter toe naar **Strategie 4 (Actie + Onderwerp)**.
*   Gebruikers denken in `Actie` (plannen, stoppen, starten) op een `Subject` (medicatie, afspraak).
*   Dit is robuuster dan rigide categorieën.

### 4. Actiepunten
1.  **UX Validatie Set:** Maak een lijst van 50 "dubbelzinnige" zinnen die categorieën kruisen (zoals "Plan wondzorg"). Test het systeem hiertegen.
2.  **Safety Net:** Implementeer de regel: *"Bij twijfel onder de 0.8 confidence -> Altijd AI Fallback gebruiken"*. Beter iets trager en goed, dan snel en fout.
