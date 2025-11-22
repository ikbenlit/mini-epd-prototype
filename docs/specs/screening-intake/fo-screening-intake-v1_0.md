# 🧩 Functioneel Ontwerp (FO) – Screening & Intake GGZ

**Projectnaam:** AI Speedrun - Mini EPD v1.2  
**Versie:** v1.0  
**Datum:** 21-11-2024  
**Auteur:** Colin (met Claude)  

---

## 1. Doel en relatie met het PRD

🎯 **Doel van dit document:**
Het Functioneel Ontwerp beschrijft **hoe** de screening- en intakeflow in de praktijk werkt voor GGZ-professionals. Dit document vertaalt de requirements uit het PRD naar concrete schermen, acties en interacties.

📘 **Toelichting aan de lezer:**
Dit FO beschrijft de basisflow voor screening en intake zonder AI-functionaliteit in eerste instantie. De focus ligt op het vastleggen van cliëntgegevens, activiteiten tijdens screening, en het documenteren van de intake met alle relevante onderdelen zoals contactmomenten, kindchecks, risicotaxaties, anamneses, onderzoeken, ROM-metingen, diagnoses en behandeladvies.

**Relatie met bestaande UI:**
De screening en intake functionaliteit wordt geïntegreerd in de bestaande two-level navigation structuur (Level 1: Behandelaar Context, Level 2: Client Dossier Context) zoals beschreven in de interface design documenten.

---

## 2. Overzicht van de belangrijkste onderdelen

1. Cliëntenbeheer (overzicht + aanmaken)
2. Cliëntdetail - Basisgegevens
3. **Screening** (activiteitenlog, documenten, hulpvraag, besluit)
4. **Intake** (overzicht + detail met tabs)
   - Contactmomenten
   - Kindchecks
   - Risicotaxaties
   - Anamneses
   - Onderzoeken
   - ROM onderzoeken
   - Diagnose
   - Behandeladvies
5. Diagnose (samenvatting)
6. Behandelplan

---

## 3. Userstories

| ID | Rol | Doel / Actie | Verwachte waarde | Prioriteit |
|----|------|---------------|------------------|-------------|
| US-01 | Secretaresse | Nieuwe cliënt aanmaken met basisgegevens | Start screeningsproces | Hoog |
| US-02 | Secretaresse | John Doe aanmaken voor crisissituaties | Opname mogelijk zonder volledige gegevens | Hoog |
| US-03 | Secretaresse | Activiteiten loggen tijdens screening | Volledig overzicht van contactmomenten | Hoog |
| US-04 | Secretaresse | Documenten uploaden (verwijsbrief, etc.) | Compleet dossier voor psycholoog | Hoog |
| US-05 | Psycholoog | Hulpvraag beschrijven | Heldere registratie van zorgvraag | Hoog |
| US-06 | Psycholoog | Screeningsbesluit nemen | Cliënt doorsturen naar intake | Hoog |
| US-07 | Psycholoog | Nieuwe intake aanmaken | Start intakeproces voor cliënt | Hoog |
| US-08 | Psycholoog | Contactmomenten vastleggen | Chronologisch overzicht van gesprekken | Hoog |
| US-09 | Psycholoog | Kindchecks uitvoeren en registreren | Veiligheid kinderen bewaken | Hoog |
| US-10 | Psycholoog | Risicotaxaties maken | Risico's inschatten en documenteren | Hoog |
| US-11 | Psycholoog | Anamnese afnemen en vastleggen | Volledigbeeld van voorgeschiedenis | Hoog |
| US-12 | Psycholoog | Onderzoeken registreren | Medische bevindingen documenteren | Middel |
| US-13 | Psycholoog | ROM-metingen toevoegen | Voortgang objectief meten | Middel |
| US-14 | Psycholoog | DSM-5 diagnose stellen | Correcte registratie voor behandeling | Hoog |
| US-15 | Psycholoog | Behandeladvies formuleren | Duidelijk advies richting behandeling | Hoog |
| US-16 | Psycholoog | Multiple intakes per cliënt beheren | Bij overplaatsing naar andere afdeling | Middel |
| US-17 | Beide | Cliëntstatus volgen | Inzicht waar cliënt zich in proces bevindt | Middel |

---

## 4. Functionele werking per onderdeel

### 4.1 Cliëntenbeheer

**Cliëntenlijst (Level 1)**
* Tabel met kolommen: Naam, BSN, Geboortedatum, Status, Laatst gewijzigd
* Filter op status: Alle / Planned / Active / Finished / Cancelled
* Zoekbalk: zoeken op naam of BSN
* Knop: *+ Nieuwe cliënt*
* Klik op rij → naar cliëntdetail (Level 2)

**Status badges:**
- `planned` → Badge "Screening" (geel/oranje)
- `active` → Badge "Actief" (groen)
- `finished` → Badge "Afgerond" (grijs)
- `cancelled` → Badge "Afgemeld" (rood)

**Nieuwe cliënt aanmaken**
* Formulier met velden:
  - Voornaam, achternaam (verplicht)
  - BSN (optioneel - kan leeg voor John Doe)
  - Geboortedatum (verplicht)
  - Adres, postcode, woonplaats
  - Telefoonnummer, email
  - Verzekeraar, polisnummer
  - Checkbox: *Dit is een John Doe (crisis)*
* Bij aanvinken John Doe: BSN wordt optioneel, melding "Gegevens kunnen later worden aangevuld"
* Knop: *Opslaan* → status wordt "planned", redirect naar cliëntdetail

---

### 4.2 Cliëntdetail - Basisgegevens (Level 2)

**Pagina-indeling:**
* Header: Naam cliënt, status badge, laatst gewijzigd
* Sidebar: ← Cliënten | Dashboard | Basisgegevens | Screening | Intake | Diagnose | Behandelplan | Rapportage
* Alle tabs zijn altijd zichtbaar, ongeacht status

**Tab: Basisgegevens**
* Toon alle cliëntinformatie in leesmodus
* Bij John Doe: waarschuwing "Incomplete gegevens - vul BSN aan zodra beschikbaar"
* Knop *Bewerken* → formulier wordt bewerkbaar
* Knop *Opslaan* → terug naar leesmodus

---

### 4.3 Screening (Level 2 - Tab)

**Tab: Screening**
Bevat vier secties:

**Sectie 1: Activiteitenlog**
* Tijdlijn met notities (nieuwste bovenaan)
* Per notitie: timestamp (automatisch), gebruikersnaam (automatisch), tekst
* Invoerveld onderaan: "Nieuwe activiteit toevoegen..."
* Knop: *Toevoegen* → notitie verschijnt direct in tijdlijn
* Voorbeelden: 
  - "Moeder gebeld, verwijsbrief volgt per post"
  - "School gesproken, concentratieproblemen bevestigd"
  - "Verwijsbrief ontvangen"
  - "Huisarts gecontacteerd voor medicatieoverzicht"

**Sectie 2: Documenten**
* Upload-zone: drag & drop of klik om bestand te kiezen
* Lijst geüploade documenten:
  - Bestandsnaam, datum upload, geüpload door
  - Download-icoon, verwijder-icoon
* Accepteert: PDF, DOC, DOCX, JPG, PNG
* Documenttypes: Verwijsbrief, Verhuisbericht, Indicatie gemeente, Overig

**Sectie 3: Hulpvraag**
* Groot tekstveld (textarea, geen rich text editor nodig)
* Label: "Beschrijving hulpvraag"
* Bewerkbaar door secretaresse én psycholoog
* Auto-save functionaliteit (optioneel)
* Placeholder: "Beschrijf de hulpvraag van de cliënt..."

**Sectie 4: Screeningsbesluit (alleen psycholoog)**
* Radio buttons:
  - ○ Geschikt voor intake
  - ○ Niet geschikt / doorverwijzen
* Indien geschikt → dropdown verschijnt: "Naar welke afdeling?"
  - Volwassenen
  - Jeugd (< 18 jaar)
  - Forensisch
  - Verslaving
  - Ouderen (65+)
  - FACT (Flexibele Assertive Community Treatment)
* Tekstveld: "Notities bij besluit"
* Knop: *Besluit opslaan*
* Bij opslaan geschikt → status wordt "active"
* Bij niet geschikt → status wordt "cancelled"

---

### 4.4 Intake (Level 2 - Tab)

#### 4.4.1 Intake Overzicht

**Layout: Kaarten per intake**

```
┌─────────────────────────────────────────────────┐
│ Intake - Aanvang zorg                           │
│ 12 oktober 2023 - 26 oktober 2023              │
│ Afdeling: Volwassenen                           │
│ Status: Afgerond ✓                              │
│                                                  │
│ 3 contactmomenten • Diagnose: F41.0, F32.1     │
│ [Bekijk details →]                              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Intake - Overplaatsing Forensisch              │
│ 15 januari 2024 - Lopend                        │
│ Afdeling: Forensisch                            │
│ Status: Bezig                                    │
│                                                  │
│ 1 contactmoment • Nog geen diagnose            │
│ [Bekijk details →]                              │
└─────────────────────────────────────────────────┘

[+ Nieuwe intake]
```

**Kaart inhoud:**
- Titel: "Intake - [Reden/Type]"
- Datum range: startdatum - einddatum (of "Lopend")
- Afdeling waar intake voor is
- Status: Bezig / Afgerond
- Samenvatting: aantal contactmomenten, diagnose indien aanwezig
- Knop: [Bekijk details →]

**Nieuwe intake aanmaken:**
* Klik op [+ Nieuwe intake]
* Modal/formulier met velden:
  - Titel/Reden (bijv. "Aanvang zorg", "Overplaatsing Forensisch")
  - Afdeling (dropdown)
  - Startdatum
  - Psycholoog/behandelaar
* Knop: *Aanmaken* → navigeert naar intake detail view

**User action:**
* Klik op kaart of [Bekijk details] → navigeert naar intake detail view

---

#### 4.4.2 Intake Detail View

**URL structuur:**
`/epd/clients/[clientId]/intake/[intakeId]`

**Header sectie:**
```
┌─────────────────────────────────────────────────┐
│ ← Terug naar intakes                            │
│                                                  │
│ Intake - Aanvang zorg                           │
│ 12 oktober 2023 - 26 oktober 2023              │
│ Afdeling: Volwassenen • Dr. van den Berg       │
│ Status: Afgerond ✓                    [Bewerken]│
└─────────────────────────────────────────────────┘
```

**Tab navigatie (horizontaal):**
```
[Algemeen] [Contactmomenten] [Kindcheck] [Risicotaxatie] 
[Anamnese] [Onderzoeken] [ROM] [Diagnose] [Behandeladvies]
```

---

#### 4.4.3 Tab: Algemeen

**Inhoud:**
* Algemene informatie intake
  - Startdatum
  - Einddatum (of "Lopend")
  - Afdeling
  - Behandelend psycholoog
  - Status
* Hulpvraag (overgenomen uit Screening tab)
  - Read-only weergave
  - Verwijzing: "Zie Screening tab voor volledige context"
* Screeningsbesluit (overgenomen uit Screening tab)
  - Read-only weergave
  - Toon besluit en notities
* Notities bij intake (vrij tekstveld)
  - Algemene opmerkingen over deze intake

**Bewerken:**
* Knop [Bewerken] rechtsboven
* Alleen aanpasbaar: notities, status, einddatum
* Hulpvraag en screeningsbesluit zijn read-only (kunnen alleen in Screening tab worden aangepast)

---

#### 4.4.4 Tab: Contactmomenten

**Overzicht:**
```
3 contactmomenten              [+ Nieuw contactmoment]

┌─────────────────────────────────────────────┐
│ 12-10-2023 - Intakegesprek                  │
│ 14:30 - 15:30 • Op locatie                  │
│ Dr. van den Berg                            │
│ [Bekijk/bewerk]                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 19-10-2023 - Aanvullend onderzoek           │
│ 10:00 - 11:00 • Op locatie                  │
│ Dr. van den Berg                            │
│ [Bekijk/bewerk]                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 26-10-2023 - Terugkoppeling                 │
│ 15:00 - 15:30 • Telefonisch                │
│ Dr. van den Berg                            │
│ [Bekijk/bewerk]                             │
└─────────────────────────────────────────────┘
```

**Nieuw contactmoment toevoegen:**
* Klik [+ Nieuw contactmoment]
* Formulier met velden:
  - Datum (datepicker)
  - Starttijd - Eindtijd
  - Type: Intakegesprek / Aanvullend onderzoek / Terugkoppeling / Telefonisch contact / Huisbezoek / Overig
  - Locatie: Op locatie / Telefonisch / Videobellen / Huisbezoek
  - Aanwezigen (tekstveld, bijv. "Cliënt, partner, moeder")
  - Gespreksnotities (groot tekstveld)
* Knop: *Opslaan*

**Contactmoment detail bekijken/bewerken:**
* Klik [Bekijk/bewerk] op kaart
* Slide-in panel van rechts OF expand kaart
* Toon alle velden in leesmodus
* Knop [Bewerken] → velden worden bewerkbaar
* Knop [Opslaan] → terug naar leesmodus

---

#### 4.4.5 Tab: Kindcheck

**Overzicht:**
```
2 kindchecks                   [+ Nieuwe kindcheck]

┌─────────────────────────────────────────────┐
│ Kindcheck 1                                 │
│ 12-10-2023 • Dr. van den Berg              │
│ Status: Geen zorgen                         │
│ [Bekijk/bewerk]                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Kindcheck 2                                 │
│ 19-10-2023 • Dr. van den Berg              │
│ Status: Monitoring nodig                    │
│ [Bekijk/bewerk]                             │
└─────────────────────────────────────────────┘
```

**Nieuwe kindcheck toevoegen:**
* Klik [+ Nieuwe kindcheck]
* Formulier met velden:
  - Datum check (datepicker)
  - Zijn er thuiswonende kinderen? (ja/nee)
  - Indien ja:
    - Aantal kinderen
    - Leeftijden kinderen
    - Zorgen over veiligheid/welzijn? (ja/nee)
    - Indien ja: toelichting (tekstveld)
    - Actie ondernomen? (ja/nee)
    - Indien ja: beschrijving actie
  - Status: Geen zorgen / Monitoring nodig / Melding gedaan / Overleg jeugdzorg
  - Notities (vrij tekstveld)
* Knop: *Opslaan*

---

#### 4.4.6 Tab: Risicotaxatie

**Overzicht:**
```
2 risicotaxaties               [+ Nieuwe risicotaxatie]

┌─────────────────────────────────────────────┐
│ Risicotaxatie - Suïcidaliteit              │
│ 12-10-2023 • Dr. van den Berg              │
│ Risico: Laag                                │
│ [Bekijk/bewerk]                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Risicotaxatie - Agressie                   │
│ 19-10-2023 • Dr. van den Berg              │
│ Risico: Gemiddeld                           │
│ [Bekijk/bewerk]                             │
└─────────────────────────────────────────────┘
```

**Nieuwe risicotaxatie toevoegen:**
* Klik [+ Nieuwe risicotaxatie]
* Formulier met velden:
  - Datum taxatie (datepicker)
  - Type risico (dropdown):
    - Suïcidaliteit
    - Agressie naar anderen
    - Zelfverwaarlozing
    - Middelenmisbruik
    - Verward gedrag
    - Overig
  - Risico-inschatting:
    - Laag / Gemiddeld / Hoog / Zeer hoog
  - Onderbouwing (tekstveld)
  - Maatregelen (tekstveld)
  - Evaluatiedatum (datepicker, optioneel)
  - Notities (vrij tekstveld)
* Knop: *Opslaan*

---

#### 4.4.7 Tab: Anamnese

**Overzicht:**
```
1 anamnese                     [+ Nieuwe anamnese]

┌─────────────────────────────────────────────┐
│ Psychiatrische anamnese                     │
│ 12-10-2023 • Dr. van den Berg              │
│ [Bekijk/bewerk]                             │
└─────────────────────────────────────────────┘
```

**Nieuwe anamnese toevoegen:**
* Klik [+ Nieuwe anamnese]
* Formulier met velden:
  - Datum (datepicker)
  - Type anamnese:
    - Psychiatrische anamnese
    - Sociale anamnese
    - Medische anamnese
    - Familieanamnese
    - Ontwikkelingsanamnese
    - Overig
  - Inhoud (groot tekstveld met rich text editor)
    - Secties kunnen zijn:
      - Klachten en hulpvraag
      - Voorgeschiedenis psychiatrie
      - Somatische voorgeschiedenis
      - Medicatie
      - Middelengebruik
      - Familie/sociale context
      - Opleiding/werk
      - Levensloop
      - Belangrijke gebeurtenissen
  - Notities (vrij tekstveld)
* Knop: *Opslaan*

---

#### 4.4.8 Tab: Onderzoeken

**Overzicht:**
```
3 onderzoeken                  [+ Nieuw onderzoek]

┌─────────────────────────────────────────────┐
│ Bloedonderzoek                              │
│ 13-10-2023 • Verwezen door Dr. van den Berg│
│ Uitslag: Binnen normale waarden            │
│ [Bekijk/bewerk]                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Neuropsychologisch onderzoek               │
│ 18-10-2023 • GZ-psycholoog Janssen         │
│ Uitslag: Zie rapport                        │
│ [Bekijk/bewerk]                             │
└─────────────────────────────────────────────┘
```

**Nieuw onderzoek toevoegen:**
* Klik [+ Nieuw onderzoek]
* Formulier met velden:
  - Datum onderzoek (datepicker)
  - Type onderzoek:
    - Bloedonderzoek
    - Neuropsychologisch onderzoek
    - Psychodiagnostiek
    - IQ-test
    - Persoonlijkheidsonderzoek
    - EEG/ECG/andere medische tests
    - Overig
  - Uitgevoerd door (tekstveld)
  - Reden onderzoek (tekstveld)
  - Bevindingen/uitslag (tekstveld of upload rapport)
  - Document uploaden (optioneel)
  - Notities (vrij tekstveld)
* Knop: *Opslaan*

---

#### 4.4.9 Tab: ROM

**Overzicht:**
```
2 ROM-metingen                 [+ Nieuwe ROM-meting]

┌─────────────────────────────────────────────┐
│ OQ-45 (Outcome Questionnaire)               │
│ 12-10-2023                                  │
│ Score: 67 (klinisch bereik)                 │
│ [Bekijk/bewerk]                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ PHQ-9 (Depressie vragenlijst)              │
│ 12-10-2023                                  │
│ Score: 14 (matig ernstig)                   │
│ [Bekijk/bewerk]                             │
└─────────────────────────────────────────────┘
```

**Nieuwe ROM-meting toevoegen:**
* Klik [+ Nieuwe ROM-meting]
* Formulier met velden:
  - Datum afname (datepicker)
  - Type vragenlijst (dropdown):
    - OQ-45 (Outcome Questionnaire)
    - PHQ-9 (Depressie)
    - GAD-7 (Angst)
    - HADS (Hospital Anxiety and Depression Scale)
    - SCL-90
    - HONOS (Health of the Nation Outcome Scales)
    - Overig
  - Score (numeriek veld)
  - Interpretatie (automatisch op basis van score, of handmatig)
  - Notities (vrij tekstveld)
  - Upload resultaat (PDF, optioneel)
* Knop: *Opslaan*

---

#### 4.4.10 Tab: Diagnose

**Overzicht:**
```
Diagnoses gesteld tijdens intake:

[+ Diagnose toevoegen]

┌─────────────────────────────────────────────┐
│ F41.0 - Paniekstoornis                      │
│ Datum: 26-10-2023                           │
│ Ernst: Matig                                │
│                                             │
│ Toelichting:                                │
│ Cliënt voldoet aan criteria voor           │
│ paniekstoornis. Frequente paniekaanvallen  │
│ met vermijdingsgedrag.                      │
│                                             │
│ [Bewerken] [Verwijderen]                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ F32.1 - Matige depressieve episode         │
│ Datum: 26-10-2023                           │
│ Ernst: Matig                                │
│                                             │
│ Toelichting:                                │
│ Depressieve klachten sinds 1 jaar,         │
│ verminderd functioneren op werk.            │
│                                             │
│ [Bewerken] [Verwijderen]                    │
└─────────────────────────────────────────────┘
```

**Diagnose toevoegen:**
* Klik [+ Diagnose toevoegen]
* Formulier met velden:
  - DSM-5 code zoeken (autocomplete zoekbalk)
    - Typ code (bijv. F41.0) of zoekterm (bijv. "paniek")
    - Dropdown toont matches
  - Geselecteerde diagnose toont: code + volledige omschrijving
  - Ernst: Licht / Matig / Ernstig / Zeer ernstig
  - Datum diagnose (datepicker)
  - Toelichting (tekstveld)
    - Waarom deze diagnose?
    - Welke criteria zijn van toepassing?
    - Relevante observaties
  - Status: Voorlopig / Definitief / Differentiaal diagnose
* Knop: *Opslaan*

**Diagnose bewerken/verwijderen:**
* Knop [Bewerken] → velden worden bewerkbaar
* Knop [Verwijderen] → bevestigingsmelding → diagnose wordt verwijderd

**Multiple diagnoses:**
* Er kunnen meerdere diagnoses worden toegevoegd
* Volgorde = relevantie (primair, secundair, etc.)
* Drag & drop om volgorde te wijzigen (optioneel, later)

---

#### 4.4.11 Tab: Behandeladvies

**Inhoud:**
```
Behandeladvies

Datum advies: 26-10-2023
Behandelend psycholoog: Dr. van den Berg

┌─────────────────────────────────────────────┐
│ [Rich text editor]                          │
│                                             │
│ Op basis van de intake wordt geadviseerd:  │
│                                             │
│ 1. Start cognitieve gedragstherapie        │
│    gericht op paniekstoornis               │
│                                             │
│ 2. Aanvullend medicatie-overleg met        │
│    psychiater (SSRI overwegen)             │
│                                             │
│ 3. Wekelijkse sessies, duur ca. 12-16      │
│    sessies                                  │
│                                             │
│ 4. ROM-metingen elke 4 weken               │
│                                             │
│ Doorzetten naar: Afdeling Volwassenen,     │
│ Zorgprogramma: Angststoornissen            │
│                                             │
└─────────────────────────────────────────────┘

[Bewerken]  [Opslaan]
```

**Velden:**
* Datum advies (automatisch, datepicker)
* Behandelend psycholoog (automatisch gevuld, aanpasbaar)
* Behandeladvies (rich text editor)
  - Aanbevolen behandelvorm
  - Frequentie en duur
  - Aanvullende interventies
  - Medicatie-overleg indien relevant
  - Monitoring en evaluatie
* Doorzetten naar:
  - Afdeling (dropdown: blijft dezelfde of wijzigt)
  - Zorgprogramma (dropdown)
  - Behandelaar (optioneel, dropdown met psychologen)
* Knop: *Opslaan*

**Status van intake:**
* Na invullen van behandeladvies kan intake worden afgerond
* Checkbox: "Intake afronden"
* Bij afronden: status intake wordt "Afgerond"
* Einddatum wordt automatisch ingevuld (huidige datum)

---

### 4.5 Diagnose tab (Level 2 - Overzicht alle diagnoses)

**Doel:** Overzicht van alle diagnoses gesteld tijdens alle intakes

**Inhoud:**
```
Overzicht diagnoses

Actieve diagnoses:

┌─────────────────────────────────────────────┐
│ F41.0 - Paniekstoornis                      │
│ Gesteld: 26-10-2023 (Intake - Aanvang zorg)│
│ Ernst: Matig                                │
│ [Bekijk in intake]                          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ F32.1 - Matige depressieve episode         │
│ Gesteld: 26-10-2023 (Intake - Aanvang zorg)│
│ Ernst: Matig                                │
│ [Bekijk in intake]                          │
└─────────────────────────────────────────────┘

Eerdere diagnoses:

┌─────────────────────────────────────────────┐
│ F43.1 - Posttraumatische stressstoornis    │
│ Gesteld: 15-06-2020 (Intake - Oude instell)│
│ Status: Hersteld                            │
│ [Bekijk in intake]                          │
└─────────────────────────────────────────────┘
```

**Functionaliteit:**
* Geaggregeerd overzicht van alle diagnoses uit alle intakes
* Gegroepeerd: Actieve diagnoses / Eerdere diagnoses
* Per diagnose: link naar intake waar deze is gesteld
* Geen directe bewerking (moet via Intake → Diagnose tab)

---

### 4.6 Behandelplan tab (Level 2)

**Inhoud:** (zoals eerder beschreven, niet gewijzigd)
* SMART doelen
* Interventies
* Frequentie en duur
* Meetmomenten

**Koppeling met Intake:**
* Behandeladvies uit meest recente intake wordt als basis gebruikt
* Behandelplan bouwt voort op diagnose en advies

---

## 5. UI-overzicht (visuele structuur)

### Level 1: Behandelaar Context

```
┌────────────────────────────────────────────────────────┐
│  Mini-ECD              [Zoek cliënt...]    [Avatar]    │
└────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────────────────────┐
│             │                                          │
│ Dashboard   │  Cliënten         [+ Nieuwe Cliënt]     │
│ Cliënten ◄  │                                          │
│ Agenda      │  [Filter: Status ▼]  [Zoek...]          │
│ Rapportage  │                                          │
│             │  Naam      BSN       Geb      Status     │
│             │  ─────────────────────────────────────   │
│             │  Bas J.    123...    20-11    ● Actief  │
│             │  Anna dV   456...    15-03    ● Actief  │
│             │  Peter S.  789...    22-07    ● Screening│
└─────────────┴──────────────────────────────────────────┘
```

### Level 2: Client Dossier - Tab Screening

```
┌────────────────────────────────────────────────────────┐
│  Mini-ECD    Bas Jansen ▼ [● Screening] [Zoek...]     │
└────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────────────────────┐
│             │                                          │
│← Cliënten   │  Screening                               │
│             │                                          │
│ Dashboard   │  ▼ Activiteitenlog                       │
│ Basisgegevens│  14-11 10:30 - Sandra: Moeder gebeld   │
│ Screening ◄ │  15-11 14:00 - John: Verwijsbrief ontv. │
│ Intake      │  [Nieuwe activiteit...]  [Toevoegen]    │
│ Diagnose    │                                          │
│ Behandelplan│  ▼ Documenten                            │
│ Rapportage  │  📄 Verwijsbrief_huisarts.pdf           │
│             │  [Upload document]                       │
│             │                                          │
│             │  ▼ Hulpvraag                             │
│             │  [Groot tekstveld...]                    │
│             │                                          │
│             │  ▼ Screeningsbesluit (psycholoog)        │
│             │  ○ Geschikt voor intake                  │
│             │  ○ Niet geschikt                         │
│             │  [Opslaan besluit]                       │
└─────────────┴──────────────────────────────────────────┘
```

### Level 2: Client Dossier - Tab Intake (Overzicht)

```
┌────────────────────────────────────────────────────────┐
│  Mini-ECD    Bas Jansen ▼ [● Actief]  [Zoek...]       │
└────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────────────────────┐
│             │                                          │
│← Cliënten   │  Intake                                  │
│             │                              [+ Nieuwe]  │
│ Dashboard   │  ┌────────────────────────────────────┐  │
│ Basisgegevens│ │ Intake - Aanvang zorg              │  │
│ Screening   │  │ 12-10-2023 - 26-10-2023            │  │
│ Intake    ◄ │  │ Afdeling: Volwassenen              │  │
│ Diagnose    │  │ Status: Afgerond ✓                 │  │
│ Behandelplan│  │ 3 contactmomenten • F41.0, F32.1   │  │
│ Rapportage  │  │ [Bekijk details →]                 │  │
│             │  └────────────────────────────────────┘  │
│             │                                          │
│             │  ┌────────────────────────────────────┐  │
│             │  │ Intake - Overplaatsing Forensisch  │  │
│             │  │ 15-01-2024 - Lopend                │  │
│             │  │ Status: Bezig                      │  │
│             │  │ [Bekijk details →]                 │  │
│             │  └────────────────────────────────────┘  │
└─────────────┴──────────────────────────────────────────┘
```

### Level 2: Client Dossier - Intake Detail (Tab Contactmomenten)

```
┌────────────────────────────────────────────────────────┐
│  Mini-ECD    Bas Jansen ▼ [● Actief]  [Zoek...]       │
└────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────────────────────┐
│             │ ← Terug naar intakes                     │
│← Cliënten   │                                          │
│             │ Intake - Aanvang zorg                    │
│ Dashboard   │ 12-10-2023 - 26-10-2023                  │
│ Basisgegevens│ Volwassenen • Dr. van den Berg          │
│ Screening   │                           [Bewerken]     │
│ Intake    ◄ │ ─────────────────────────────────────    │
│ Diagnose    │ [Algemeen] [Contactmomenten◄] [Kindcheck]│
│ Behandelplan│ [Risico] [Anamnese] [Onderzoeken] [ROM]  │
│ Rapportage  │ [Diagnose] [Behandeladvies]              │
│             │ ─────────────────────────────────────    │
│             │ 3 contactmomenten  [+ Nieuw contact]     │
│             │                                          │
│             │ ┌──────────────────────────────────────┐ │
│             │ │ 12-10-2023 - Intakegesprek           │ │
│             │ │ 14:30-15:30 • Op locatie             │ │
│             │ │ [Bekijk/bewerk]                      │ │
│             │ └──────────────────────────────────────┘ │
│             │                                          │
│             │ ┌──────────────────────────────────────┐ │
│             │ │ 19-10-2023 - Aanvullend onderzoek    │ │
│             │ │ [Bekijk/bewerk]                      │ │
│             │ └──────────────────────────────────────┘ │
└─────────────┴──────────────────────────────────────────┘
```

---

## 6. Interacties met AI (functionele beschrijving)

*In deze basisversie zijn er nog geen AI-functies. Deze sectie wordt later ingevuld wanneer AI-ondersteuning wordt toegevoegd voor:*
- Samenvatting contactmomenten
- Suggesties voor DSM-5 codes op basis van anamnese en gespreksnotities
- Genereren behandeladvies op basis van diagnose en intake
- Extractie hulpvraag uit documenten
- Risk assessment ondersteuning

---

## 7. Gebruikersrollen en rechten

| Rol | Toegang tot | Beperkingen |
|------|--------------|-------------|
| Secretaresse | Cliëntenbeheer, Basisgegevens, Screening (behalve besluit) | Kan geen screeningsbesluit nemen, geen toegang tot Intake detail |
| Psycholoog | Alles | Volledige toegang tot alle onderdelen |

**Rechtenmatrix details:**

| Functie | Secretaresse | Psycholoog |
|---------|--------------|------------|
| Cliënt aanmaken | ✅ | ✅ |
| Basisgegevens bewerken | ✅ | ✅ |
| Activiteit loggen | ✅ | ✅ |
| Document uploaden | ✅ | ✅ |
| Hulpvraag beschrijven | ✅ | ✅ |
| Screeningsbesluit | ❌ | ✅ |
| Intake aanmaken | ❌ | ✅ |
| Intake bewerken | ❌ | ✅ |
| Contactmomenten | ❌ | ✅ |
| Kindcheck | ❌ | ✅ |
| Risicotaxatie | ❌ | ✅ |
| Anamnese | ❌ | ✅ |
| Onderzoeken | ❌ | ✅ |
| ROM | ❌ | ✅ |
| Diagnose toevoegen | ❌ | ✅ |
| Behandeladvies | ❌ | ✅ |

---

## 8. Statussen en statusovergangen

### 8.1 Cliënt statussen (FHIR EpisodeOfCare compatible)

**Mogelijke statussen:**
1. **planned** - Aangemeld / In screening
2. **active** - Intake tot einde behandeling (in zorg)
3. **finished** - Behandeling afgerond
4. **cancelled** - Niet geschikt / afgemeld

**Status badges in UI:**
- `planned` → Badge "Screening" (oranje/geel, ●)
- `active` → Badge "Actief" (groen, ●)
- `finished` → Badge "Afgerond" (grijs, ●)
- `cancelled` → Badge "Afgemeld" (rood, ●)

**Waar zichtbaar:**
- Header Level 2 (naast cliëntnaam)
- Cliëntenlijst (kolom Status)
- Cliëntdetail - Basisgegevens

### 8.2 Statusflow

```
Nieuw aangemaakt → planned (Screening)
       ↓
Screeningsbesluit "geschikt" → active
       ↓
Intake(s) uitgevoerd → blijft active
       ↓
Behandeling → blijft active
       ↓
Behandeling afgerond → finished

Alternative flow:
Screeningsbesluit "niet geschikt" → cancelled
Cliënt meldt zich af → cancelled
```

**Automatische statuswijzigingen:**
- Bij aanmaken cliënt → `planned`
- Bij screeningsbesluit "geschikt voor intake" → `active`
- Bij screeningsbesluit "niet geschikt" → `cancelled`
- Bij afronden behandeling → `finished`

**Handmatige statuswijzigingen:**
- Psycholoog kan status handmatig wijzigen in Basisgegevens
- Bijvoorbeeld: van `active` naar `cancelled` als cliënt zich afmeldt
- Van `active` naar `finished` bij afronden behandeling

### 8.3 Intake statussen

**Per intake (niet te verwarren met cliënt status):**
- **Bezig** - Intake is gestart maar nog niet afgerond
- **Afgerond** - Intake is compleet, behandeladvies is gegeven

**Overgang:**
- Bij aanmaken intake → "Bezig"
- Na invullen behandeladvies + checkbox "Intake afronden" → "Afgerond"

---

## 9. Validaties en foutafhandeling

### 9.1 Verplichte velden bij aanmaken cliënt
- Voornaam, achternaam
- Geboortedatum
- BSN (behalve bij John Doe)

### 9.2 Validaties

**BSN validatie:**
- 9 cijfers
- Modulo-11 check (Nederlandse BSN validatie)
- Uniek binnen systeem

**Geboortedatum:**
- Niet in de toekomst
- Realistisch (bijv. niet ouder dan 120 jaar)

**Email (indien ingevuld):**
- Geldig emailformaat

**DSM-5 codes:**
- Moet bestaan in DSM-5 codering
- Format: Letter gevolgd door cijfers (bijv. F41.0)

### 9.3 Foutmeldingen

**Inline validatie:**
- Bij formulierveld (rood met icoon)
- Real-time feedback tijdens typen

**Toast-meldingen:**
- Systeemfouten
- Succesmeldingen na opslaan

**Bevestigingsdialogen:**
- Destructieve acties (verwijderen intake, diagnose, etc.)
- Status wijzigingen met grote impact

### 9.4 Edge cases

**John Doe zonder BSN:**
- Waarschuwing tonen in header
- Later aanvullen mogelijk via Basisgegevens
- Flag "incomplete_data" in systeem

**Duplicaat BSN:**
- Melding "Cliënt met dit BSN bestaat al"
- Link naar bestaande cliënt

**Ontbrekende documenten:**
- Geen blocker voor screening
- Wel waarschuwing bij screeningsbesluit: "Let op: nog geen verwijsbrief aanwezig"

**Multiple intakes:**
- Nieuwe intake kan alleen worden aangemaakt als cliënt status = `active`
- Vorige intake hoeft niet afgerond te zijn (kan parallel lopen)

**Screeningsbesluit wijzigen:**
- Waarschuwing als er al een intake is gestart
- "Let op: er is al een intake aangemaakt voor deze cliënt. Wijzigen kan invloed hebben op de intake."

---

## 10. Data requirements

### 10.1 Client
- id, voornaam, achternaam, bsn, geboortedatum
- adres, postcode, woonplaats
- telefoon, email
- verzekeraar, polisnummer
- status (planned/active/finished/cancelled)
- is_john_doe (boolean)
- created_at, updated_at, created_by

### 10.2 Screening
- client_id
- hulpvraag (text)
- besluit (geschikt/niet_geschikt)
- afdeling (indien geschikt)
- besluit_notities (text)
- besluit_datum, besluit_door

### 10.3 Screening Activiteit
- screening_id
- datum_tijd (timestamp)
- gebruiker (naam)
- activiteit (text)

### 10.4 Screening Document
- screening_id
- bestandsnaam, bestandstype, bestandsgrootte
- upload_datum, geupload_door
- document_type (verwijsbrief/verhuisbericht/indicatie/overig)
- file_path of blob

### 10.5 Intake
- id, client_id
- titel (bijv. "Aanvang zorg", "Overplaatsing Forensisch")
- afdeling
- psycholoog_id
- startdatum, einddatum (nullable)
- status (bezig/afgerond)
- notities (algemene notities)
- created_at, updated_at

### 10.6 Contactmoment
- id, intake_id
- datum, starttijd, eindtijd
- type (intakegesprek/aanvullend/terugkoppeling/telefonisch/etc)
- locatie (op_locatie/telefonisch/video/huisbezoek)
- aanwezigen (text)
- notities (text, rich text)
- created_at, updated_at, created_by

### 10.7 Kindcheck
- id, intake_id
- datum
- thuiswonende_kinderen (boolean)
- aantal_kinderen (int, nullable)
- leeftijden_kinderen (text, nullable)
- zorgen (boolean)
- zorgen_toelichting (text, nullable)
- actie_ondernomen (boolean, nullable)
- actie_beschrijving (text, nullable)
- status (geen_zorgen/monitoring/melding/overleg_jeugdzorg)
- notities (text)
- created_at, created_by

### 10.8 Risicotaxatie
- id, intake_id
- datum
- type_risico (suicidaliteit/agressie/zelfverwaarlozing/etc)
- risico_niveau (laag/gemiddeld/hoog/zeer_hoog)
- onderbouwing (text)
- maatregelen (text)
- evaluatiedatum (date, nullable)
- notities (text)
- created_at, created_by

### 10.9 Anamnese
- id, intake_id
- datum
- type (psychiatrisch/sociaal/medisch/familie/ontwikkeling/overig)
- inhoud (text, rich text)
- notities (text)
- created_at, created_by

### 10.10 Onderzoek
- id, intake_id
- datum
- type (bloedonderzoek/neuropsychologisch/psychodiagnostiek/etc)
- uitgevoerd_door (text)
- reden (text)
- bevindingen (text)
- document_id (nullable, link naar geupload rapport)
- notities (text)
- created_at, created_by

### 10.11 ROM Meting
- id, intake_id
- datum
- type_vragenlijst (OQ-45/PHQ-9/GAD-7/HADS/SCL-90/HONOS/overig)
- score (numeric)
- interpretatie (text)
- notities (text)
- document_id (nullable, link naar resultaat)
- created_at, created_by

### 10.12 Diagnose
- id, intake_id
- dsm5_code (string, bijv. "F41.0")
- dsm5_omschrijving (string, bijv. "Paniekstoornis")
- ernst (licht/matig/ernstig/zeer_ernstig)
- datum_diagnose
- toelichting (text)
- status (voorlopig/definitief/differentiaal)
- volgorde (int, voor primair/secundair)
- created_at, created_by

### 10.13 Behandeladvies
- id, intake_id (one-to-one)
- datum_advies
- psycholoog_id
- advies_tekst (text, rich text)
- afdeling_doorzetten (string)
- zorgprogramma (string)
- behandelaar_id (nullable)
- created_at, updated_at, created_by

---

## 11. Navigatie en URL structuur

### 11.1 Level 1 URLs (Behandelaar Context)
```
/epd/dashboard              → Behandelaar dashboard
/epd/clients                → Cliënten lijst
/epd/agenda                 → Agenda (toekomstig)
/epd/reports                → Rapportage (toekomstig)
```

### 11.2 Level 2 URLs (Client Dossier Context)
```
/epd/clients/[clientId]                    → Client dashboard
/epd/clients/[clientId]/basisgegevens      → Basisgegevens
/epd/clients/[clientId]/screening          → Screening tab
/epd/clients/[clientId]/intake             → Intake overzicht (kaarten)
/epd/clients/[clientId]/intake/[intakeId]  → Intake detail (met tabs)
/epd/clients/[clientId]/diagnose           → Diagnose overzicht
/epd/clients/[clientId]/behandelplan       → Behandelplan
/epd/clients/[clientId]/rapportage         → Rapportage
```

### 11.3 Intake detail sub-routes (optioneel, via tabs)
```
/epd/clients/[clientId]/intake/[intakeId]?tab=algemeen
/epd/clients/[clientId]/intake/[intakeId]?tab=contactmomenten
/epd/clients/[clientId]/intake/[intakeId]?tab=kindcheck
/epd/clients/[clientId]/intake/[intakeId]?tab=risicotaxatie
/epd/clients/[clientId]/intake/[intakeId]?tab=anamnese
/epd/clients/[clientId]/intake/[intakeId]?tab=onderzoeken
/epd/clients/[clientId]/intake/[intakeId]?tab=rom
/epd/clients/[clientId]/intake/[intakeId]?tab=diagnose
/epd/clients/[clientId]/intake/[intakeId]?tab=behandeladvies
```

---

## 12. Bijlagen & Referenties

**Verwijzingen:**
- PRD v1.2 (Product Requirements Document)
- TO v1.2 (Technisch Ontwerp)
- Build Plan AI Speedrun
- FHIR GGZ Schema (database structuur)
- Interface Design Plan (mocks-ui-flow.md)
- Interface Design Complete Specification (inteface-design-plan.md)

**Standaarden:**
- FHIR EpisodeOfCare (statussen)
- DSM-5 (diagnosecodes)
- Koppeltaal (toekomstige integratie)

**Volgende stappen:**
1. TO uitwerken voor database schema en API endpoints
2. UX/UI wireframes verfijnen voor intake detail tabs
3. Build plan Week 1-2: implementatie screening & intake basis
4. Build plan Week 2-3: AI-ondersteuning toevoegen

---

## 13. Out of Scope voor MVP

De volgende functionaliteit is bewust buiten scope gelaten voor de MVP:
- Agenda functionaliteit (contactmomenten worden handmatig toegevoegd)
- Automatische notificaties en herinneringen
- Export functionaliteit (PDF rapporten)
- Geïntegreerde ROM-afname (vragenlijsten worden extern afgenomen)
- Medicatie module
- Crisis/spoed-protocols
- Multi-user collaborative editing
- Uitgebreide rechten per afdeling/team
- Audit logging van wijzigingen
- Archivering en backup functionaliteit
- Templates voor intakes/anamneses
- Bulk acties op cliënten
- Geavanceerde zoekfilters
- Dashboard analytics voor behandelaar

Deze functionaliteiten kunnen post-MVP worden toegevoegd op basis van gebruikersfeedback.

---

**Einde Functioneel Ontwerp v1.0**
