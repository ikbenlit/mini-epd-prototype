# Release Notes: Verpleegkundige Rapportage & Overdracht Module

**Versie:** 1.0  
**Datum:** 8 december 2025  
**Voor:** Verpleegkundigen en zorgverleners

---

## Wat is er nieuw?

We hebben een volledig nieuwe module gelanceerd voor verpleegkundige rapportage en overdracht. Deze module helpt je om sneller en efficiënter zorgnotities vast te leggen, overdrachten voor te bereiden en belangrijke informatie te delen met je collega's.

---

## Belangrijkste Nieuwe Functies

### 1. Verpleegkundige notities invoeren en beheren (Rapportage)

**Waar te vinden:** Via het menu "Verpleegrapportage" → "Rapportage" (dit is de standaard landing page)

Dit is je centrale werkplek voor het vastleggen van alle verpleegkundige notities van vandaag.

#### Ronde overzicht in de sidebar
- Zie alle patiënten van je ronde in één oogopslag
- Per patiënt zie je:
  - Hoeveel notities er vandaag zijn (grijze badge)
  - Hoeveel voor overdracht zijn gemarkeerd (groene badge)
- Hoog-risico patiënten worden gemarkeerd met een waarschuwingsindicator
- Klik op een patiënt om direct te beginnen met noteren

#### Notitie invoeren
Verpleegkundige notities zijn korte, snelle observaties (maximaal 500 tekens) die je tijdens je ronde maakt. Je kunt notities maken in **5 categorieën:**
- **Medicatie** (blauw) - Medicatie-gerelateerde observaties
- **ADL/verzorging** (groen) - Activiteiten van het dagelijks leven
- **Gedragsobservatie** (paars) - Gedrag en stemming
- **Incident** (rood) - Incidenten en bijna-incidenten
- **Algemene observatie** (grijs) - Overige belangrijke observaties

**Hoe werkt het:**
1. Selecteer een patiënt uit de "Ronde overzicht" lijst
2. Bij een hoog-risico patiënt zie je direct een rode waarschuwing
3. Kies een categorie via de gekleurde pills (standaard: Algemene observatie)
4. Typ je notitie in het tekstveld (maximaal 500 tekens - je ziet een teller)
5. Klik op "Overdracht" als deze notitie belangrijk is voor de volgende dienst
6. Klik op de verzendknop (pijl-icoon)

**Let op:** Deze notities worden opgeslagen als "verpleegkundige rapportage" in het systeem. Voor uitgebreidere verslaglegging gebruik je de rapportage-functionaliteit in het patiëntdossier.

#### Notities bekijken en bewerken
Alle notities van vandaag worden getoond in een visuele tijdlijn onder het invoerformulier, gegroepeerd per dagdeel:

- **Dagdelen met iconen:**
  - **Nacht** (00:00-07:00) - maanpictogram (paars)
  - **Ochtend** (07:00-12:00) - zonsopgangpictogram (amber)
  - **Middag** (12:00-17:00) - zonpictogram (geel)
  - **Avond** (17:00-24:00) - zonsondergangpictogram (oranje)

- **Statistieken boven de tijdlijn:**
  - Totaal aantal notities
  - Aantal gemarkeerd voor overdracht

**Wat kun je doen:**
- **Bewerken:** Klik op het potlood-icoon (verschijnt bij hover) om categorie, inhoud of overdrachtstatus te wijzigen
- **Overdracht aan/uit zetten:** Klik op het vinkje-icoon naast de categorie voor snelle toggle
- **Verwijderen:** Klik op het prullenbak-icoon (verschijnt bij hover) - er wordt om bevestiging gevraagd

**Tip:** Notities die je vóór 07:00 's ochtends maakt, worden automatisch toegewezen aan de vorige dag (voor nachtdienst).

---

### 2. Overdracht overzicht

**Waar te vinden:** Via het menu "Verpleegrapportage" → "Overdracht"

Het overzichtsscherm voor het voorbereiden van overdrachten met AI-samenvatting:

- **Patiëntenlijst links** toont:
  - Alle patiënten met recente activiteit
  - Aantal hoge risico's per patiënt (rode indicator)
  - Aantal notities gemarkeerd voor overdracht (groene indicator)
  - Periodeselectie: kies 24 uur, 3 dagen, 1 week of 2 weken
  - Filter om alleen patiënten met alerts te tonen

- **Detailweergave rechts** toont per patiënt:
  - Compacte header met naam, leeftijd en geslacht
  - Quick-link naar volledig patiëntdossier
  - Badge met aantal hoge risico's en overdracht-items
  - Prominente risico-alerts bovenaan (rood blok bij hoge risico's)
  - Waarschuwing bij incidenten in de periode
  - Alle rapportages in een visuele tijdlijn
  - AI-gestuurde samenvatting voor overdracht (in sidebar)

**Tip:** Gebruik de filter "Met alerts" om snel patiënten te vinden die extra aandacht nodig hebben.

---

### 3. AI-gestuurde samenvatting voor overdracht

**Waar te vinden:** In het Overdracht-scherm, rechts naast de rapportages tijdlijn

De AI-samenvatting helpt je om snel een overzicht te krijgen van een patiënt voor overdracht aan de volgende dienst.

**Wat krijg je:**
- **Geselecteerde periode** wordt getoond in de header (bijv. "24 uur", "3 dagen")
- **Beknopte samenvatting** (1-2 zinnen) met de belangrijkste punten
- **Aandachtspunten** (maximaal 5) met:
  - Urgentievlag (rode rand) voor kritieke items
  - Klikbare bronverwijzing naar de originele rapportage
  - Type bron en datum
- **Actiepunten** (maximaal 3) voor de volgende dienst

**Hoe werkt het:**
1. Selecteer een patiënt in het Overdracht overzicht
2. Klik op "Genereer samenvatting" om de AI-samenvatting te starten
3. De samenvatting wordt gegenereerd op basis van de geselecteerde periode
4. Klik op een bronverwijzing om direct naar die rapportage te scrollen (met highlight-effect)
5. Klik op "Vernieuwen" voor een nieuwe samenvatting

**Metadata:** Onderaan zie je wanneer de samenvatting is gegenereerd en hoe lang dit duurde.

**Tip:** De AI kijkt naar alle rapportages en risico's van de geselecteerde periode. Wijzig de periode bovenaan de patiëntenlijst om meer of minder context mee te nemen.

---

### 4. Rapportages tijdlijn

Alle rapportages worden getoond in een visuele tijdlijn met dagdeel-groepering.

**Wat is het verschil tussen notities en rapportages?**

Het systeem kent twee soorten invoer:

1. **Verpleegkundige notities** (korte notities, max 500 tekens)
   - Deze maak je via de "Rapportage" module
   - Hebben een categorie: Medicatie, ADL/verzorging, Gedragsobservatie, Incident, of Algemene observatie
   - Zijn bedoeld voor snelle, korte observaties tijdens je ronde
   - Kunnen gemarkeerd worden voor overdracht

2. **Rapportages** (langere rapportages, 20-5000 tekens)
   - Deze maak je via het patiëntdossier
   - Verschillende types: Voortgang, Observatie, Incident, Medicatie, Contact, Crisis, Intake, Behandeladvies, Vrije notitie
   - Zijn bedoeld voor uitgebreidere verslaglegging

**In de tijdlijn zie je:**
- Alle rapportages gegroepeerd per dag (Vandaag, Gisteren, of datum)
- Per dag verder gegroepeerd per dagdeel (Avond, Middag, Ochtend, Nacht)
- Visuele tijdlijn met gekleurde nodes (rood voor incidenten)
- Verpleegkundige notities tonen een gekleurde categorie-badge
- Andere rapportages tonen hun type-badge (bijv. "Voortgang", "Observatie")
- Notities gemarkeerd voor overdracht hebben een groen ✓ indicator
- Tijdstip en auteur bij elke rapportage

**Header statistieken:**
- Totaal aantal rapportages in de periode
- Aantal gemarkeerd voor overdracht (groene badge)
- Aantal incidenten (rode badge)

**Tip:** Gebruik de periodeselectie in de patiëntenlijst om verder terug te kijken in de tijd.

---

### 5. Risico's overzicht

Actieve hoge risico's worden prominent getoond in een rood blok bovenaan het patiëntdetailscherm.

**Ondersteunde risicotypen:**
- Valrisico
- Decubitus
- Ondervoeding
- Delier
- Infectie
- Suïciderisico
- Agressie
- Weglopen

**Risiconiveaus:**
- **Zeer hoog** - Donkerrode kleur, met waarschuwingsicoon
- **Hoog** - Oranje kleur, met waarschuwingsicoon
- **Matig** - Amber kleur, met info-icoon
- **Laag** - Groene kleur, met info-icoon

Bij elk risico zie je ook de rationale of toelichting waarom dit risico is vastgesteld.

**Weergave:**
- In het detailscherm: hoge risico's worden getoond in een prominent rood blok met alle details
- In de patiëntenlijst: rode badge toont het aantal hoge risico's per patiënt

**Tip:** Risico's worden automatisch getoond in de patiëntenlijst, zodat je direct ziet welke patiënten extra aandacht nodig hebben. Gebruik de filter "Met alerts" om alleen deze patiënten te tonen.

---

## Hoe begin ik?

### Stap 1: Ga naar Rapportage voor je ronde
1. Navigeer via het menu naar "Verpleegrapportage" (of klik direct op "Rapportage")
2. Je ziet direct alle patiënten in het "Ronde overzicht"
3. Selecteer een patiënt om te beginnen met noteren

### Stap 2: Maak je eerste notitie
1. Selecteer een patiënt uit de lijst
2. Kies een categorie via de gekleurde pills
3. Typ je notitie (max 500 tekens)
4. Klik op "Overdracht" als het belangrijk is voor de volgende dienst
5. Klik op de verzendknop

### Stap 3: Bereid overdracht voor
1. Ga naar "Verpleegrapportage" → "Overdracht"
2. Selecteer de gewenste periode (standaard: 24 uur)
3. Klik op een patiënt om de details te zien
4. Klik op "Genereer samenvatting" voor een AI-overdracht
5. Controleer of alle belangrijke notities zijn gemarkeerd voor overdracht (✓ indicator)
6. Klik op bronverwijzingen in de AI-samenvatting om direct naar de originele rapportage te gaan

---

## Veelgestelde Vragen

**V: Kan ik notities achteraf nog aanpassen?**
A: Ja, klik op het potlood-icoon bij een notitie in de tijdlijn (verschijnt bij hover). Je kunt categorie, inhoud en overdrachtstatus wijzigen.

**V: Wat gebeurt er als ik een notitie verwijder?**
A: Notities worden niet definitief verwijderd, maar gemarkeerd als verwijderd (soft delete). Dit is voor de audit trail. Neem contact op met je leidinggevende als je een notitie per ongeluk hebt verwijderd.

**V: Hoe werkt de AI-samenvatting?**
A: De AI analyseert alle beschikbare rapportages en risico's van de geselecteerde periode en maakt een beknopte samenvatting. Elke aandachtspunt heeft een klikbare bronverwijzing zodat je de originele informatie kunt controleren. Klik op "Vernieuwen" voor een nieuwe generatie.

**V: Kan ik op de bronverwijzingen klikken?**
A: Ja! Klik op een bronverwijzing (bijv. "Verpleegkundig") in de AI-samenvatting om direct naar die rapportage te scrollen. De rapportage krijgt een paars highlight-effect zodat je hem makkelijk kunt vinden.

**V: Kan ik offline werken?**
A: Nee, offline werken wordt nog niet ondersteund. Zorg voor een stabiele internetverbinding.

**V: Kan ik de samenvatting exporteren naar PDF?**
A: Deze functionaliteit komt in een volgende release beschikbaar.

**V: Wat is het verschil tussen verpleegkundige notities en andere rapportages?**
A: Verpleegkundige notities zijn korte, snelle observaties (max 500 tekens) die je via de "Rapportage" module maakt. Ze hebben een categorie-label (medicatie, ADL, gedrag, etc.) en worden opgeslagen als type "verpleegkundig". Andere rapportages (zoals voortgang, intake, behandeladvies) zijn uitgebreidere verslagen (20-5000 tekens) die je via het patiëntdossier maakt. Beide verschijnen in de Overdracht tijdlijn.

**V: Waarom zie ik in de Rapportage module alleen notities van vandaag?**
A: De Rapportage module is ontworpen voor het invoeren van notities tijdens je ronde, dus toont alleen vandaag. Voor een historisch overzicht ga je naar "Overdracht" waar je de periode kunt aanpassen.

**V: Hoe weet ik welke periode de AI-samenvatting gebruikt?**
A: De geselecteerde periode wordt getoond onder de titel "AI Samenvatting" (bijv. "24 uur", "3 dagen"). Deze periode komt overeen met de periodeselectie in de patiëntenlijst.

---

## Tips voor efficiënt gebruik

1. **Markeer belangrijke notities direct voor overdracht** - Klik op "Overdracht" bij het invoeren van een notitie. Dit bespaart tijd bij het voorbereiden van overdracht.
2. **Gebruik de filter "Met alerts"** - In het Overdracht-scherm kun je snel patiënten vinden die extra aandacht nodig hebben.
3. **Controleer de AI-samenvatting** - De AI geeft een goede basis, maar blijf altijd je eigen professionele oordeel gebruiken. Klik op bronverwijzingen om de originele informatie te verifiëren.
4. **Maak notities direct na een observatie** - Zo vergeet je niets en blijft de informatie accuraat.
5. **Gebruik de juiste categorie** - Kies de categorie die het beste past (Medicatie, ADL, Gedrag, Incident, Observatie). Dit helpt bij het vinden en filteren van informatie later.
6. **Bekijk de badges in de patiëntenlijst** - De grijze badge toont totaal notities, de groene badge toont overdracht-items. Zo zie je direct wie al gedocumenteerd is.
7. **Pas de periode aan voor meer context** - Bij complexe patiënten kan het helpen om 3 dagen of 1 week te bekijken in plaats van 24 uur.

---

## Feedback en ondersteuning

Heb je vragen, opmerkingen of suggesties over deze nieuwe module? Neem contact op met:
- Je leidinggevende
- De helpdesk
- Het ontwikkelteam via het feedbackformulier

We horen graag wat je ervan vindt en hoe we het kunnen verbeteren!

---

**Veel succes met de nieuwe module!**

