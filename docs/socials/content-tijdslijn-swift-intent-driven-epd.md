# 📅 Content Tijdslijn: Swift Intent-Driven EPD

**Project:** Opvolging AI Speedrun  
**Centrale vraag:** Is het intent-driven EPD de volgende generatie?  
**Format:** Build in Public op LinkedIn  
**Auteur:** Colin Lit  
**Start:** Januari 2025

---

## De Rode Draad

**AI Speedrun (afgerond):**
> "Hoe ver kom je in 4 weken met AI-tooling?"
> → Antwoord: Je kunt de kernonderdelen van een traditioneel EPD bouwen.
> → Cliffhanger: "Maar hoe ziet het next-gen EPD er eigenlijk uit?"

**Swift (nu):**
> "Is het intent-driven EPD de volgende generatie?"
> → Onderzoek: Wat als je niet meer navigeert, maar gewoon zegt wat je wilt?
> → Build: Van concept naar werkend prototype
> → Validatie: Werkt dit voor echte zorgverleners?

---

## Fase 1: De Vraag Stellen (Week 1-2)

### Post 1: De Cliffhanger Oppakken
**Timing:** Week 1, dag 1  
**Type:** Tekst + afbeelding  
**Doel:** Aankondigen van het vervolg, de vraag scherp stellen

**Concept:**
```
𝐀𝐈 𝐒𝐏𝐄𝐄𝐃𝐑𝐔𝐍 𝟐.𝟎 - 𝐃𝐞 𝐯𝐫𝐚𝐚𝐠 𝐝𝐢𝐞 𝐛𝐥𝐞𝐞𝐟 𝐡𝐚𝐧𝐠𝐞𝐧

4 weken geleden sloot ik de AI Speedrun af met een werkend EPD-prototype.
95 commits. 118.000 regels code. Van intake tot behandelplan.

Maar het voelde als... een snellere versie van hetzelfde.

Dezelfde menu's. Dezelfde klikpaden. Dezelfde logica.
Alleen gebouwd met AI in plaats van een team van 10.

De vraag die bleef hangen:
𝑊𝑎𝑡 𝑎𝑙𝑠 𝑤𝑒 𝑛𝑖𝑒𝑡 𝑠𝑛𝑒𝑙𝑙𝑒𝑟 ℎ𝑒𝑡𝑧𝑒𝑙𝑓𝑑𝑒 𝑏𝑜𝑢𝑤𝑒𝑛, 𝑚𝑎𝑎𝑟 𝑖𝑒𝑡𝑠 𝑓𝑢𝑛𝑑𝑎𝑚𝑒𝑛𝑡𝑒𝑒𝑙 𝑎𝑛𝑑𝑒𝑟𝑠?

Dus ik ging graven. In de research. In de trends.
En ik stuitte op een term die steeds terugkwam:

**Intent-driven UI.**

Jakob Nielsen (ja, die van de 10 usability heuristics) noemt het 
"het eerste nieuwe UI-paradigma in 60 jaar."

Het idee: je vertelt het systeem niet meer *hoe* je iets moet doen.
Je vertelt het *wat* je wilt bereiken.

"Notitie voor Jan over de medicatie."
En het juiste scherm verschijnt. Met de juiste velden. Voor de juiste patiënt.

Geen menu's. Geen 12 klikken. Gewoon: zeggen wat je wilt.

Dit is mijn volgende experiment.

De komende weken ga ik uitzoeken:
- Werkt dit concept in de praktijk?
- Kun je het bouwen met de huidige AI-tooling?
- En belangrijker: willen zorgverleners dit eigenlijk?

Ik noem het **Swift** - omdat snelheid de kern is.

Volg mee. Ik deel alles. De successen én de momenten dat ik denk: 
dit werkt voor geen meter.

Eerste vraag aan jullie:
👇 Hoeveel klikken kost jouw meest voorkomende handeling in je EPD?
```

**Visual:** Screenshot van traditionele EPD-navigatie vs. één inputveld met "notitie Jan medicatie"

---

### Post 2: Het Probleem Concreet Maken
**Timing:** Week 1, dag 4  
**Type:** Carrousel (4-5 slides)  
**Doel:** Het probleem voelbaar maken voor de doelgroep

**Carrousel slides:**

**Slide 1:** "12 klikken voor één notitie"
**Slide 2:** De klikroute uitgetekend (Menu → Patiënten → Zoeken → Jan → Dossier → Rapportage → Nieuwe notitie → etc.)
**Slide 3:** "Wat als je gewoon zegt: 'Notitie Jan medicatie'?"
**Slide 4:** Het concept: één inputveld, systeem begrijpt intentie
**Slide 5:** "Dit ga ik de komende weken bouwen. Volg mee."

---

### Post 3: De Research Delen
**Timing:** Week 2, dag 1  
**Type:** Tekst + link naar bronnenonderzoek  
**Doel:** Autoriteit opbouwen, laten zien dat dit niet uit de lucht komt vallen

**Concept:**
```
𝐒𝐖𝐈𝐅𝐓 - 𝐖𝐚𝐭 𝐝𝐞 𝐞𝐱𝐩𝐞𝐫𝐭𝐬 𝐳𝐞𝐠𝐠𝐞𝐧

Voordat ik ga bouwen, wilde ik weten: 
ben ik gek, of zien anderen dit ook?

Dus ik dook in de research. Dit vond ik:

**Jakob Nielsen** (mei 2023):
"AI introduceert het 3e UI-paradigma in de computergeschiedenis.
Intent-based outcome specification."

**Nielsen Norman Group** (2024):
"Outcome-oriented design - designers definiëren constraints, 
AI genereert de interface."

**Google** (december 2024):
Rolt "Dynamic View" uit - Gemini genereert complete interfaces per prompt.

**Vercel**:
Open-sourcet hun Generative UI technologie van v0.dev.

De grote jongens bewegen allemaal dezelfde kant op.

Maar weet je wat ik nergens vond?

**Een implementatie voor healthcare.**

Epic doet AI voor notities schrijven. Oracle Health doet voice commands.
Maar niemand doet intent-driven navigatie in een EPD.

Niemand zegt: "notitie Jan" en krijgt direct het juiste scherm.

Dat is de gap. En dat is wat ik ga bouwen.

📎 Ik heb al mijn bronnen verzameld in een document.
Comment "BRONNEN" en ik stuur je de link.

Volgende week: de eerste regels code.
```

---

## Fase 2: De Bouw (Week 3-6)

### Post 4: Dag 1 - De Eerste Intentie
**Timing:** Week 3, dag 1  
**Type:** Video (30-60 sec) + tekst  
**Doel:** Laten zien dat het werkt, hype creëren

**Concept:**
```
𝐒𝐖𝐈𝐅𝐓 - 𝐃𝐚𝐠 𝟏: 𝐇𝐞𝐭 𝐰𝐞𝐫𝐤𝐭

Ik typte: "notitie Jan medicatie"

Het systeem:
1. Herkende de intentie (dagnotitie)
2. Vond de patiënt (Jan de Vries)  
3. Opende het juiste formulier
4. Vulde de context in

Tijd: 1.2 seconden.

[VIDEO: schermopname van de flow]

Oké, het is nog lelijk. De UI is basic.
Maar de kern werkt.

De AI begrijpt wat ik wil en geeft me direct waar ik moet zijn.

Dit is dag 1. 

De stack tot nu toe:
- Next.js voor de frontend
- Claude voor intent-classificatie
- ~200 regels code

Volgende stap: meerdere intenties herkennen.
"zoek Piet" / "overdracht" / "behandelplan Marie"

De vraag die ik mezelf stel:
Hoe ver kan ik komen voordat de complexiteit explodeert?

Wordt vervolgd. 🏃‍♂️
```

---

### Post 5: De Intenties Uitbreiden
**Timing:** Week 3, dag 4  
**Type:** Tekst + afbeelding (intent mapping diagram)  
**Doel:** Technische diepgang voor de nerds, toegankelijk voor de rest

**Concept:**
```
𝐒𝐖𝐈𝐅𝐓 - 𝟖 𝐢𝐧𝐭𝐞𝐧𝐭𝐢𝐞𝐬, 𝟏 𝐢𝐧𝐩𝐮𝐭𝐯𝐞𝐥𝐝

Deze week uitgebreid van 1 naar 8 intenties:

"notitie Jan"          → Dagnotitie opent voor Jan
"zoek Piet"            → Patiënt zoeken, resultaten tonen
"overdracht"           → Overdrachtsscherm met AI-samenvatting
"behandelplan Marie"   → Behandelplan Marie opent
"intake nieuwe"        → Nieuwe intake starten
"agenda vandaag"       → Dagagenda tonen
"medicatie Jan"        → Medicatie-overzicht Jan
"vitalen Piet"         → Vitale functies invoeren

Hoe werkt het onder de motorkap?

Stap 1: Snelle keyword-matching (~10ms)
"notitie" + naam = dagnotitie intent, hoge confidence

Stap 2: AI-fallback voor ambigue input (~200ms)
"ik heb net iets besproken met Jan" = AI bepaalt: dagnotitie

De truc: lokaal waar het kan, AI waar het moet.

Resultaat tot nu toe:
- 8 werkende intenties
- ~400 regels code
- Intent accuracy: ~90% op mijn testset

Wat nog moet:
- Ambigue namen ("Jan" → welke Jan?)
- Context-switching (midden in een taak iets anders doen)
- Voice input (dicteren in plaats van typen)

De echte test komt volgende week:
Ik ga het laten zien aan een verpleegkundige.

Spannend. Want dan weet ik of dit alleen cool is voor developers,
of ook echt nuttig voor de mensen die ermee moeten werken.
```

---

### Post 6: De Eerste Gebruikerstest
**Timing:** Week 4, dag 2  
**Type:** Tekst + quote van tester  
**Doel:** Validatie, social proof, kwetsbaarheid tonen

**Concept:**
```
𝐒𝐖𝐈𝐅𝐓 - "𝐃𝐢𝐭 𝐢𝐬 𝐰𝐚𝐭 𝐢𝐤 𝐚𝐥𝐭𝐢𝐣𝐝 𝐰𝐢𝐥𝐝𝐞"

Gisteren liet ik Swift zien aan [naam], verpleegkundige in de GGZ.

Haar eerste reactie toen ze "notitie Jan medicatie" typte 
en direct in het juiste scherm zat:

"Wacht. Dat is het? Geen menu's?"

Ik knikte.

"Dit is wat ik altijd wilde. Gewoon zeggen wat ik wil doen 
in plaats van zoeken waar het zit."

Toen de kritische vragen:
- "Wat als ik me vertype?" → Fuzzy matching, suggesties
- "Wat als er twee Jannen zijn?" → Keuzelijst
- "Wat met privacy?" → Alles lokaal, niets naar externe servers*

*behalve de AI-calls, maar die bevatten geen patiëntdata in dit prototype

Wat niet werkte:
- Voice input was te traag in haar test
- Sommige intenties waren niet intuïtief ("vitalen" vs "bloeddruk")
- Ze wilde kunnen praten, niet typen

Notities voor volgende iteratie:
1. Voice-first maken, typen als fallback
2. Synoniemen toevoegen aan intent-matching  
3. Sneltoetsen voor power users

Dit is waarom je bouwt in het openbaar.
Je krijgt feedback die je zelf nooit had bedacht.

[naam], bedankt voor je eerlijkheid. 🙏

Wie wil Swift ook testen? DM me.
```

---

### Post 7: Voice Input Toevoegen
**Timing:** Week 5, dag 1  
**Type:** Video (60 sec) + tekst  
**Doel:** Wow-moment, laten zien dat het next-level gaat

**Concept:**
```
𝐒𝐖𝐈𝐅𝐓 - 𝐍𝐮 𝐦𝐞𝐭 𝐬𝐭𝐞𝐦

"Notitie Jan, medicatie gegeven om 14 uur."

[VIDEO: Colin spreekt, systeem opent notitie met vooringevulde tekst]

Na de feedback van vorige week: voice-first.

Wat er gebeurt:
1. Deepgram vangt de spraak op (real-time)
2. Intent-classificatie bepaalt: dagnotitie voor Jan
3. De gesproken tekst wordt direct in de notitie gezet
4. Je hoeft alleen nog te reviewen en opslaan

Van spraak naar opgeslagen notitie: ~8 seconden.

Vergelijk dat met:
Menu → Patiënten → Zoeken → Jan → Dossier → Rapportage → 
Nieuwe notitie → Typen → Opslaan

Dat is ~45 seconden. Minstens.

De techniek:
- Deepgram Nova-2 voor Nederlands
- Streaming transcriptie (je ziet tekst verschijnen terwijl je praat)
- Lokale intent-classificatie + AI-fallback

Kosten: ~€0.01 per minuut spraak.

Wat ik leerde:
- Nederlandse spraakherkenning is verbazend goed geworden
- "Medicatie" wordt soms "Medicare" (lol)
- Push-to-talk werkt beter dan continuous listening

Volgende stap: testen in een echte omgeving.
Met achtergrondgeluid. Collega's die praten. Telefoons die rinkelen.

Daar gaat het spannend worden.
```

---

### Post 8: De Beperkingen Eerlijk Benoemen
**Timing:** Week 5, dag 4  
**Type:** Tekst  
**Doel:** Geloofwaardigheid door kwetsbaarheid, eerlijk zijn over wat niet werkt

**Concept:**
```
𝐒𝐖𝐈𝐅𝐓 - 𝐖𝐚𝐭 (𝐧𝐨𝐠) 𝐧𝐢𝐞𝐭 𝐰𝐞𝐫𝐤𝐭

Tijd voor eerlijkheid.

Swift is cool in een demo. Maar het is geen product.

Dit werkt nog niet:

**1. Complexe intenties**
"Maak een afspraak met Jan volgende week dinsdag om 14:00 
voor een medicatie-evaluatie"
→ Te veel variabelen. AI raakt in de war.

**2. Context over sessies heen**
Als je gisteren met Jan bezig was en vandaag terugkomt,
weet Swift dat niet. Elke sessie begint blanco.

**3. Fouten herstellen**
Als het systeem de verkeerde patiënt pakt, 
moet je handmatig terug. Geen "nee, ik bedoelde de andere Jan."

**4. Integratie met bestaande systemen**
Swift praat nu met zijn eigen database.
Niet met ChipSoft. Niet met Nedap. Niet met Epic.

**5. Wet- en regelgeving**
HIPAA? AVG? NEN7510? 
Dit is een prototype, geen gecertificeerd medisch hulpmiddel.

Waarom deel ik dit?

Omdat "build in public" niet alleen de successen is.
Het is ook eerlijk zijn over de gaten.

De vraag die ik mezelf stel:
Zijn dit oplosbare problemen, of fundamentele beperkingen van het concept?

Ik denk: oplosbaar. Maar het kost tijd.
Meer tijd dan 4 weken.

Dit wordt geen sprint meer. Dit wordt een marathon.

Wie heeft ervaring met het oplossen van deze problemen?
👇 Ik hoor graag hoe jullie dit aanpakken.
```

---

## Fase 3: De Reflectie (Week 6-8)

### Post 9: Terugblik - Wat Hebben We Geleerd?
**Timing:** Week 6, dag 2  
**Type:** Tekst + infographic  
**Doel:** Samenvatten, autoriteit claimen, community betrekken

**Concept:**
```
𝐒𝐖𝐈𝐅𝐓 - 𝟔 𝐰𝐞𝐤𝐞𝐧, 𝐰𝐚𝐭 𝐡𝐞𝐛𝐛𝐞𝐧 𝐰𝐞 𝐠𝐞𝐥𝐞𝐞𝐫𝐝?

De centrale vraag was:
"Is het intent-driven EPD de volgende generatie?"

Mijn antwoord na 6 weken bouwen:

**Ja, maar.**

✅ Het concept werkt
Van "notitie Jan medicatie" naar opgeslagen rapportage in 8 seconden.
Dat is geen science fiction meer. Dat is werkende code.

✅ Zorgverleners willen dit
Elke test-gebruiker zei varianten van:
"Waarom kan mijn EPD dit niet?"

✅ De technologie is er
Spraakherkenning, intent-classificatie, generative UI.
De bouwblokken bestaan. Je hoeft ze alleen te combineren.

❌ Maar het is niet plug-and-play
Integratie met bestaande EPD's is een nachtmerrie.
Certificering kost tijd en geld.
En de edge cases zijn eindeloos.

**De echte insight:**

Het gaat niet om een nieuw EPD bouwen.
Het gaat om een **laag** bovenop bestaande systemen.

Zoals Raycast bovenop macOS.
Zoals Superhuman bovenop email.

Een intent-driven interface die praat met whatever EPD eronder zit.

Dat is de volgende stap.

Wil je mee? Ik zoek:
- GGZ-organisaties die willen piloten
- EPD-leveranciers die willen samenwerken
- Developers die dit interessant vinden

DM staat open. 🚀
```

---

### Post 10: De Visie - Waar Gaat Dit Naartoe?
**Timing:** Week 7, dag 1  
**Type:** Tekst + concept visual  
**Doel:** Thought leadership, positioneren voor de lange termijn

**Concept:**
```
𝐇𝐨𝐞 𝐢𝐤 𝐝𝐞𝐧𝐤 𝐝𝐚𝐭 𝐄𝐏𝐃'𝐬 𝐞𝐫 𝐨𝐯𝐞𝐫 𝟓 𝐣𝐚𝐚𝐫 𝐮𝐢𝐭𝐳𝐢𝐞𝐧

Geen menu's met 47 opties.
Geen tabbladen die je moet onthouden.
Geen handleidingen van 200 pagina's.

In plaats daarvan:

**Je zegt wat je wilt. Het systeem doet de rest.**

"Bereid mijn spreekuur voor."
→ Alle relevante info van je patiënten staat klaar.

"Wat is er veranderd sinds mijn laatste dienst?"
→ AI-samenvatting van alle updates, gefilterd op wat voor jou relevant is.

"Start overdracht."
→ Voice-gestuurde rapportage die direct in het dossier komt.

Dit is niet mijn fantasie.

Dit is waar Google, Apple, en Microsoft allemaal naartoe werken.
Jakob Nielsen noemt het "het 3e UI-paradigma in 60 jaar."

Healthcare loopt altijd 10 jaar achter op consumer tech.

Maar dat hoeft niet.

De afgelopen weken heb ik laten zien dat de technologie er is.
De vraag is: wie durft het eerste te implementeren?

Ik zet mijn geld op de kleine, wendbare spelers.
Niet de dinosaurussen met legacy systemen.

De startups. De innovatieve zorginstellingen.
De mensen die snappen dat de huidige situatie onhoudbaar is.

Ben jij er één van? Laten we praten.
```

---

### Post 11: Call-to-Action - Wat Nu?
**Timing:** Week 8, dag 1  
**Type:** Tekst  
**Doel:** Leads genereren, concrete volgende stappen

**Concept:**
```
𝐒𝐖𝐈𝐅𝐓 - 𝐖𝐚𝐭 𝐧𝐮?

8 weken geleden begon ik met een vraag:
"Is het intent-driven EPD de volgende generatie?"

Nu heb ik:
- Een werkend prototype
- Validatie van 5 zorgverleners
- Een duidelijke visie op waar dit naartoe gaat
- En een inbox vol met "wanneer kan ik dit gebruiken?"

Het eerlijke antwoord: nog niet.

Swift is een prototype. Een proof of concept.
Geen product dat je morgen kunt kopen.

Maar ik wil het wel een product maken.

Daarom zoek ik:

**🏥 Zorgorganisaties**
Die willen piloten met intent-driven documentatie.
Klein beginnen. Eén afdeling. Echte feedback.

**🤝 EPD-leveranciers**
Die snappen dat de toekomst niet in meer features zit,
maar in betere interactie. Partnerschap > concurrentie.

**💻 Developers met zorg-ervaring**
Die dit net zo frustrerend vinden als ik
en er iets aan willen doen.

**📣 Mensen die dit verhaal willen delen**
Want verandering begint met bewustwording.

Dit is geen einde. Dit is een begin.

De AI Speedrun was het bewijs dat je snel kunt bouwen.
Swift is het bewijs dat je fundamenteel anders kunt bouwen.

De volgende stap is het bewijs dat het ook werkt in de echte wereld.

Wie doet mee?

---

P.S. Alle code, documentatie en bronnen die ik heb gebruikt:
[link naar repository of site]

Transparantie tot het einde. 🏃‍♂️
```

---

## Optionele Posts (tussentijds)

### Quick Win Posts
Korte updates als er iets cools gebeurt:

- **"Net een bug gefixt die 3 dagen kostte"** - Authenticiteit
- **"Iemand noemde dit 'magie'"** - Social proof
- **"Plot twist: dit idee bestaat al 60 jaar"** - Nielsen referentie
- **"Mijn vrouw vroeg wanneer ik weer normaal ga doen"** - Humor/menselijkheid

### Engagement Posts
Vragen aan de community:

- **"Wat is jouw meest gefrustreerde EPD-moment?"**
- **"Hoeveel tijd ben je kwijt aan navigeren vs. documenteren?"**
- **"Zou je voice-input gebruiken als het goed werkte?"**

### Educational Posts
Uitleg voor niet-techneuten:

- **"Intent-driven UI in 60 seconden uitgelegd"** - Carrousel
- **"Waarom je EPD voelt als software uit 2005"** - Achtergrond
- **"De 3 UI-paradigma's volgens Jakob Nielsen"** - Autoriteit

---

## Samenvattend

| Week | Post | Type | Doel |
|------|------|------|------|
| 1 | Cliffhanger oppakken | Tekst + visual | Aankondigen |
| 1 | Het probleem | Carrousel | Herkenning |
| 2 | De research | Tekst + link | Autoriteit |
| 3 | Dag 1: Het werkt | Video + tekst | Hype |
| 3 | Intenties uitbreiden | Tekst + diagram | Technisch |
| 4 | Eerste gebruikerstest | Tekst + quote | Validatie |
| 5 | Voice input | Video + tekst | Wow-moment |
| 5 | Beperkingen | Tekst | Eerlijkheid |
| 6 | Terugblik | Tekst + infographic | Samenvatten |
| 7 | De visie | Tekst + visual | Thought leadership |
| 8 | Call-to-action | Tekst | Leads |

---

## Toon & Stijl (consistent met AI Speedrun)

**Wel:**
- Eerste persoon ("ik bouw", niet "wij bouwen")
- Concrete cijfers en tijdsindicaties
- Eerlijk over wat niet werkt
- Retorische vragen die prikken
- Emoji's spaarzaam (max 2-3 per post)
- Bold/cursief voor nadruk
- Korte zinnen, witruimte
- CTA aan het einde

**Niet:**
- Corporate jargon ("synergy", "leverage")
- Overdreven claims ("revolutionair", "baanbrekend")
- Alleen maar successen delen
- Te technisch voor de doelgroep
- Lange lappen tekst zonder structuur

---

*Dit document is een levend plan - pas aan op basis van wat werkt en wat niet.*
