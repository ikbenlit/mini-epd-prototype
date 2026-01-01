# 📱 LinkedIn Series: Cortex V2 - Het Intelligente EPD

**Project:** AI Speedrun → Cortex V2
**Totaal:** 11 posts + 4 optioneel
**Doelgroep:** Zorgprofessionals, ICT-managers, directie, psychiaters (70%) + Techies, leveranciers (30%)
**Toon:** Toegankelijk, concreet, herkenbaar - techniek waar nodig (duidelijk gelabeld)

---

## Fase 0: De Brug (1 post)

### Post 0: "We bewezen dat het kan. Nu de echte vraag."
**Doel:** Transitie van Speedrun naar nieuwe serie
**Doelgroep:** Iedereen die Speedrun volgde + nieuwe lezers

**Inhoud:**
- Korte recap: 4 weken, 118k regels code, werkend EPD
- Maar: tijdens het bouwen realiseerde ik me iets
- Ik bouwde nog steeds een *traditioneel* EPD
- De vraag is niet "kan AI software bouwen?" maar "wat moeten we eigenlijk bouwen?"
- Teaser: intent-driven EPD concept
- Aankondiging: komende weken deel ik de volgende stap

**Hook:** "118.000 regels code. En toch de verkeerde vraag beantwoord."

---

## Fase 1: De Visie (3 posts)

### Post 1: "Het probleem met EPD's is niet de techniek"
**Doel:** Herkenning creëren, probleem framen
**Doelgroep:** Verpleegkundigen, behandelaren, managers

**Inhoud:**
- Scenario 1: Verpleegkundige loopt ronde, wond verzorgd → 3 losse acties nodig
- Scenario 2: Psychiater begint dienst → 15 dossiers openen om te checken wat er vannacht gebeurde
- Scenario 3: Psycholoog dicteert notitie over suïcidaliteit → systeem slaat alleen op, denkt niet mee
- Kern: EPD's zijn gebouwd rond data-opslag, niet rond zorgprocessen
- Behandelaren passen zich aan het systeem aan, niet andersom

**Hook:** "Je wond is verzorgd. Nu nog 3 schermen, 2 menu's en een bevestigingsdialoog."

---

### Post 2: "Wat als je EPD gewoon snapt wat je bedoelt?"
**Doel:** Intent-driven concept introduceren
**Doelgroep:** Breed - iedereen die met EPD werkt

**Inhoud:**
- Voorbeeld: "Zeg Jan af en maak notitie dat hij griep heeft"
- Wat er nu gebeurt: systeem snapt het niet, of je moet 2 losse commando's geven
- Wat er zou moeten gebeuren: systeem herkent 2 acties, bevestigt, voert uit
- Dit is geen spraakherkenning - dit is *begrip*
- Technisch (kort): AI die intentie herkent, niet alleen woorden
- Vergelijking: het verschil tussen een rekenmachine en een collega

**Hook:** "Eén zin. Twee acties. Nul extra kliks."

---

### Post 3: "Een EPD dat meedenkt"
**Doel:** Proactiviteit concept introduceren
**Doelgroep:** Behandelaren, verpleegkundigen, regiebehandelaren

**Inhoud:**
- Voorbeeld 1: Wondzorg genoteerd → "Wondcontrole inplannen over 3 dagen?"
- Voorbeeld 2: Nieuwe medicatie gestart → "Evaluatie inplannen over 2 weken?"
- Voorbeeld 3: Signalen van crisis → "Signaleringsplan bekijken?"
- Cruciale nuance: suggesties, geen verplichtingen
- Het systeem leert wat jij routinematig doet
- Grens: behulpzaam vs. Clippy ("Ik zie dat je een brief schrijft...")

**Hook:** "Na 'wond verzorgd' zegt je EPD nu: niets. Wat als het meedacht?"

---

## Fase 2: De Bouw (5 posts)

### Post 4: "Snelheid waar het kan, intelligentie waar het moet"
**Doel:** Architectuur uitleggen (toegankelijk)
**Doelgroep:** ICT-managers, tech-geïnteresseerde behandelaren
**Label:** 🔧 *Iets technischer - maar relevant voor iedereen die snapt waarom systemen soms traag zijn*

**Inhoud:**
- Probleem: AI is slim maar niet instant
- Oplossing: twee sporen
  - Simpele commando's ("agenda vandaag") → direct, lokaal, <20ms
  - Complexe vragen ("zeg af en noteer") → AI denkt mee, ~400ms
- Het systeem beslist zelf welk spoor
- Vergelijking: reflexen vs. nadenken (je trekt je hand terug van vuur zonder na te denken)
- Resultaat: snelheid waar het kan, intelligentie waar het moet

**Hook:** "Soms moet je nadenken. Soms moet je gewoon snel zijn. Een goed systeem weet wanneer."

---

### Post 5: "Waarom 'ik snap het niet' geen optie is"
**Doel:** Betrouwbaarheid en vertrouwen
**Doelgroep:** Iedereen die ooit "commando niet herkend" zag

**Inhoud:**
- Frustratie: 2x "ik begrijp het niet" en je typt het wel met de hand
- Principe: het systeem doet *altijd* een poging
- Bij twijfel: vraag verduidelijking ("Bedoel je een notitie of een afspraak?")
- Bij meerdere opties: bied ze aan
- Nooit opgeven, altijd proberen te helpen
- Dit is hoe vertrouwen ontstaat: betrouwbaarheid

**Hook:** "'Commando niet herkend.' Drie woorden die ervoor zorgen dat niemand spraak meer gebruikt."

---

### Post 6: "Context is alles"
**Doel:** Context-awareness uitleggen
**Doelgroep:** Behandelaren, verpleegkundigen

**Inhoud:**
- Voorbeeld: "Maak notitie voor hem"
- Probleem: wie is "hem"?
- Oplossing: het systeem weet:
  - Welke patiënt je nu bekijkt (Marie)
  - Welk scherm je open hebt (dossier)
  - Wat je net deed (rapportage invoeren)
- "Hem" → Marie (want die staat open)
- "Morgen" → datum van morgen (niet "het woord morgen")
- Resultaat: natuurlijk praten, geen commando-syntax

**Hook:** "'Maak notitie voor hem.' Jij weet wie je bedoelt. Eindelijk je EPD ook."

---

### Post 7: "Van idee naar werkend systeem (met AI)"
**Doel:** Bouwproces delen
**Doelgroep:** ICT-managers, directie, leveranciers
**Label:** 🔧 *Voor de techneuten en beslissers*

**Inhoud:**
- Hoe ik dit bouw:
  1. Denken: wat is het doel? (PRD)
  2. Ontwerpen: hoe ervaart de gebruiker dit? (FO)
  3. Bouwen: AI als partner, niet als vervanger (TO)
- Tools: Claude, Cursor, Supabase
- AI rol: code genereren, reviewen, debuggen
- Mijn rol: richting bepalen, beslissingen nemen, kwaliteit bewaken
- Niet magie - wel een nieuwe manier van werken

**Hook:** "AI bouwt de code. Maar wie bepaalt wat er gebouwd wordt?"

---

### Post 8: "De meedenkende collega: waar ligt de grens?"
**Doel:** Ethische overwegingen bespreken
**Doelgroep:** Behandelaren, managers, beleidsmakers

**Inhoud:**
- Vragen die ik mezelf stel:
  - Wanneer is een suggestie behulpzaam vs. opdringerig?
  - Alert-moeheid: hoe voorkom je dat alles genegeerd wordt?
  - Verantwoordelijkheid: wat als het systeem iets mist?
  - Privacy: wat "weet" het systeem eigenlijk?
- Mijn aanpak:
  - Start conservatief (alleen kritieke suggesties)
  - Transparante redenering (waarom deze suggestie?)
  - Gebruiker blijft in control
- Geen definitieve antwoorden - wel de juiste vragen

**Hook:** "Een systeem dat meedenkt. Klinkt goed. Maar wanneer wordt het bemoeizucht?"

---

## Fase 3: Demo & Reflectie (3 posts)

### Post 9: "Het werkt. Kijk maar."
**Doel:** Bewijs leveren
**Doelgroep:** Iedereen

**Inhoud:**
- Video/GIF van werkende demo
- Flow: gebruiker spreekt → systeem detecteert 2 acties → voert uit → bevestigt → suggereert vervolg
- Eerlijk over wat nog niet perfect is
- Uitnodiging: feedback welkom

**Hook:** "Genoeg gepraat. Hier is het bewijs."

**Bijlage:** Demo video (30-60 sec)

---

### Post 10: "Waarom duurt alles 18 maanden?"
**Doel:** Status quo uitdagen
**Doelgroep:** Managers, directie, leveranciers

**Inhoud:**
- Als dit solo te bouwen is, waarom duren features bij leveranciers jaren?
- Eerlijk: wat mist er nog?
  - NEN7510 compliance
  - Integraties met bestaande systemen
  - Edge cases
  - Support en onderhoud
- Maar: de kern werkt. Nu.
- Vraag: waarom experimenteren we niet meer?
- Geen leverancier-bashing - wel een uitnodiging tot dialoog

**Hook:** "'Staat op de roadmap.' De vier woorden die innovatie in de zorg vertragen."

---

### Post 11: "Wat ik leerde over de toekomst van EPD's"
**Doel:** Serie afsluiten, vooruitkijken
**Doelgroep:** Iedereen

**Inhoud:**
- Learnings:
  - Intent-driven werkt
  - Context is cruciaal
  - Proactiviteit is krachtig maar delicaat
  - Het denken is het probleem, niet de techniek
- Wat nodig is voor productie:
  - Compliance
  - Integraties
  - Gebruikerstesten
- Grotere visie (teaser):
  - Geen schermen meer
  - Agents die het werk doen
  - Focus op de patiënt, niet het systeem
- Call to action: samenwerken, testen, of zelf beginnen met experimenteren

**Hook:** "De toekomst van EPD's is niet een beter scherm. Het is geen scherm."

---

## Optionele Posts (4)

### Optioneel A: "De bug die me een avond kostte"
**Wanneer:** Als er een goede technische struggle-story is
**Doelgroep:** 🔧 Techies, builders

**Inhoud:**
- Specifieke bug of uitdaging
- Hoe AI hielp (of juist niet)
- Wat ik leerde
- Relatable voor iedereen die ooit code debugde

---

### Optioneel B: "Privacy en AI in de zorg"
**Wanneer:** Als het onderwerp opkomt in reacties
**Doelgroep:** Managers, directie, beleidsmakers

**Inhoud:**
- Wat "weet" een AI-systeem?
- Waar gaat data naartoe?
- Hoe bouw je privacy-by-design?
- Geen juridisch advies - wel transparantie

---

### Optioneel C: "Geen schermen, maar agents"
**Wanneer:** Als grotere visie resoneert
**Doelgroep:** Visionairs, early adopters

**Inhoud:**
- Ephemeral UI: interfaces die ontstaan wanneer nodig
- Agents die taken uitvoeren
- De behandelaar focust op de patiënt
- Sci-fi? Nee, technisch nu al mogelijk

---

### Optioneel D: "Wat kost dit eigenlijk?"
**Wanneer:** Als kosten-vraag vaak komt
**Doelgroep:** Managers, directie

**Inhoud:**
- Breakdown: €200 budget, waar ging het heen?
- AI-kosten per interactie
- Vergelijking met traditionele development
- ROI-denken: wat kost tijd van behandelaren?

---

## Planning & Ritme

| Week | Posts | Focus |
|------|-------|-------|
| 1 | Post 0, 1, 2 | De brug + probleem + oplossing |
| 2 | Post 3, 4, 5 | Proactiviteit + architectuur + betrouwbaarheid |
| 3 | Post 6, 7, 8 | Context + bouwproces + ethiek |
| 4 | Post 9, 10, 11 | Demo + uitdaging + conclusie |

**Frequentie:** 3x per week (ma-wo-vr of di-do-za)
**Optionele posts:** Inspelen op reacties en momentum

---

## Technische Referenties (voor eigen gebruik)

De volgende documenten bevatten de technische details:
- `architecture-cortex-v2.md` - Volledige architectuur
- `fo-cortex-intent-system-v2.md` - Functioneel ontwerp
- `to-cortex-v2.md` - Technisch ontwerp
- `prd-cortex-v2.md` - Product requirements
- `review-cortex-v2.md` - Review rapport

**Let op:** Technische details alleen gebruiken waar relevant voor de post. Vertaal altijd naar concrete voorbeelden die behandelaren herkennen.

