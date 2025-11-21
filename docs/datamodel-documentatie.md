# Datamodel Mini-ECD: FHIR-compliant GGZ Dossier

**Versie:** 1.1  
**Datum:** 21 november 2024  
**Status:** In ontwikkeling

---

## Overzicht

Het Mini-ECD gebruikt een datamodel gebaseerd op **FHIR (Fast Healthcare Interoperability Resources)**, de internationale standaard voor uitwisseling van zorggegevens. Dit maakt toekomstige integratie met MedMIJ (patiëntportalen) en Koppeltaal (eHealth apps) mogelijk zonder grote aanpassingen.

Het datamodel bestaat uit **13 kernonderdelen** die samen het complete GGZ-traject ondersteunen: van aanmelding tot behandelplan, inclusief doelen, toestemmingen en belangrijke waarschuwingen.

---

## De 13 bouwstenen van het dossier

### 1. **Behandelaren** (`practitioners`)
**Wat is het?**  
Alle zorgprofessionals die in het systeem werken: psychologen, psychiaters, gz-psychologen, verpleegkundigen, etc.

**Belangrijkste gegevens:**
- BIG-nummer (indien geregistreerd)
- AGB-code
- Naam en voorletters
- Kwalificaties (bijv. "GZ-psycholoog", "Psychotherapeut")
- Contactgegevens

**Waarom FHIR?**  
In FHIR heet dit een **Practitioner** resource. Dit maakt het mogelijk om behandelaren later uit te wisselen met andere systemen (bijvoorbeeld voor verwijzingen).

---

### 2. **Instellingen** (`organizations`)
**Wat is het?**  
De GGZ-organisaties zelf: jouw instelling, maar ook externe organisaties waarmee je samenwerkt.

**Belangrijkste gegevens:**
- AGB-code instelling
- KVK-nummer
- Naam en eventuele nevenvestigingen
- Contactgegevens en adres

**Waarom FHIR?**  
In FHIR heet dit een **Organization** resource. Nodig voor facturatie, verwijzingen en juridische verantwoordelijkheid.

---

### 3. **Cliënten** (`patients`)
**Wat is het?**  
De patiënten/cliënten die behandeling krijgen.

**Belangrijkste gegevens:**
- BSN (verplicht)
- Naam, geboortedatum, geslacht
- Adres en contactgegevens
- Verzekeringsgegevens
- Huisarts (naam + AGB-code)
- Noodcontactpersoon

**Waarom FHIR?**  
In FHIR heet dit een **Patient** resource. Dit is de basis voor alle andere gegevens in het dossier. Het correspondeert met de Nederlandse **ZIB Patient** (ZorgInformatieBouwsteen).

**Privacy:**  
BSN wordt versleuteld opgeslagen en is alleen toegankelijk voor geautoriseerde behandelaren.

---

### 4. **Contactmomenten** (`encounters`)
**Wat is het?**  
Elk contact tussen cliënt en behandelaar: intakegesprek, behandelsessie, telefonisch consult, etc.

**Belangrijkste gegevens:**
- Type contact (intake, diagnostiek, behandeling, crisis)
- Status (gepland, bezig, afgerond)
- Wanneer (start- en eindtijd)
- Wie (behandelaar + cliënt)
- Waar (polikliniek, online, kliniek)
- Waarom (aanmeldingsreden, klachten)

**Waarom FHIR?**  
In FHIR heet dit een **Encounter** resource. Dit is cruciaal omdat alle andere gegevens (diagnoses, observaties, behandelplannen) gekoppeld worden aan een specifiek contactmoment. Hierdoor kun je later zien: "Deze diagnose is gesteld tijdens de intake van 15 maart 2024".

Dit correspondeert met de Nederlandse **ZIB Contact**.

---

### 5. **Diagnoses** (`conditions`)
**Wat is het?**  
De vastgestelde diagnoses volgens DSM-5 of ICD-10. Dit kunnen zowel definitieve diagnoses zijn als voorlopige diagnoses.

**Belangrijkste gegevens:**
- DSM-5 code (bijv. "F32.2")
- Omschrijving (bijv. "Depressieve episode, ernstig")
- Status (actief, in remissie, opgelost)
- Ernst (mild, matig, ernstig)
- Zekerheid (voorlopig, bevestigd, uitgesloten)
- Wanneer ontstaan / wanneer opgelost
- Wie stelde de diagnose vast
- Bij welk contactmoment

**Waarom FHIR?**  
In FHIR heet dit een **Condition** resource. Dit onderscheidt tussen "encounter diagnosis" (gesteld tijdens een specifiek contact) en "problem list item" (langlopend probleem op de problemlijst).

Dit correspondeert met de Nederlandse **ZIB Problem**.

**Voorbeeld:**  
Een cliënt meldt zich aan met depressieve klachten. Na de intake wordt voorlopig "F32.2 - Depressieve episode, ernstig" vastgesteld. Na behandeling verandert de status naar "in remissie".

---

### 6. **Observaties & Metingen** (`observations`)
**Wat is het?**  
Alle metingen, scores, risico-inschattingen en observaties tijdens de behandeling.

**Belangrijkste gegevens:**
- Wat werd geobserveerd (bijv. "Suïcidaliteit", "PHQ-9 score", "Bloeddruk")
- Uitkomst (bijv. "Hoog risico", "Score: 18 punten", "120/80")
- Interpretatie (normaal, afwijkend hoog, afwijkend laag)
- Wanneer gemeten
- Door wie
- Bij welk contactmoment

**Categorieën:**
- **ROM-metingen**: PHQ-9, GAD-7, OQ-45, etc.
- **Risico-inschattingen**: Suïcidaliteit, agressie, verwaarlozing
- **Middelengebruik**: Alcohol, drugs, medicatie
- **Vitale functies**: Bloeddruk, hartslag (indien relevant)
- **Sociale anamnese**: Werk, relatie, financiën

**Waarom FHIR?**  
In FHIR heet dit een **Observation** resource. Dit is een zeer flexibele resource die allerlei soorten metingen kan bevatten. Door standaard codes te gebruiken (SNOMED, LOINC) kunnen deze later gedeeld worden met andere systemen.

Dit correspondeert met de Nederlandse **ZIB Alert** en **ZIB LaboratoryTestResult**.

**Voorbeeld:**  
- ROM-vragenlijst PHQ-9 ingevuld: score 18 (matig-ernstige depressie)
- Risico-inschatting: "Suïcidale gedachten aanwezig, geen concrete plannen" → interpretatie: matig risico

---

### 7. **Medicatie** (`medication_statements`)
**Wat is het?**  
De medicatie die de cliënt gebruikt of heeft gebruikt. Dit kan voorgeschreven zijn door de psychiater, maar ook medicatie van de huisarts.

**Belangrijkste gegevens:**
- Medicijnnaam (bijv. "Sertraline 50mg tablet")
- ATC-code (internationale medicijncode)
- Status (actief, gestopt, gepland)
- Dosering (bijv. "1 tablet 's ochtends")
- Toedieningsweg (oraal, intraveneus, etc.)
- Startdatum / stopdatum
- Reden van gebruik (bijv. "Depressie")

**Waarom FHIR?**  
In FHIR heet dit een **MedicationStatement** resource. Dit registreert wat de patiënt daadwerkelijk gebruikt (niet wat voorgeschreven is - dat zou een MedicationRequest zijn).

Dit correspondeert met de Nederlandse **ZIB MedicationUse** en is onderdeel van het **MedicatieProces 9.0**.

**Let op:**  
Voor volledige medicatiegeschiedenis moet later gekoppeld worden met het Landelijk Schakelpunt (LSP) of andere medicatieservices.

---

### 8. **Behandelplannen** (`care_plans`)
**Wat is het?**  
Het overzicht van de geplande behandeling: wat gaan we doen, waarom, en met welk doel?

**Belangrijkste gegevens:**
- Titel (bijv. "Behandelplan depressie")
- Beschrijving van de aanpak
- Status (concept, actief, afgerond, gestopt)
- Looptijd (startdatum - einddatum)
- Behandeldoelen (bijv. "PHQ-9 score < 10", "Herstel dagelijks functioneren")
- Welke diagnoses worden behandeld
- Wie is de regiebehandelaar
- Welk zorgteam is betrokken

**Waarom FHIR?**  
In FHIR heet dit een **CarePlan** resource. Dit is de container voor alle behandelactiviteiten en koppelt diagnoses aan interventies.

Dit correspondeert met de Nederlandse **ZIB TreatmentDirective**.

**Koppeltaal-integratie:**  
Dit is ook de resource die Koppeltaal gebruikt om eHealth-apps te koppelen aan de behandeling. Bijvoorbeeld: "Opdracht: 3x per week mindfulness oefening via app X".

---

### 9. **Behandelactiviteiten** (`care_plan_activities`)
**Wat is het?**  
De concrete activiteiten binnen een behandelplan: gesprekken, medicatie, huiswerkopdrachten, ROM-metingen, etc.

**Belangrijkste gegevens:**
- Omschrijving (bijv. "Individuele CGT sessies", "ROM-meting PHQ-9")
- Status (nog niet gestart, gepland, bezig, afgerond)
- Planning (bijv. "1x per week, 12 sessies")
- Uitvoerende behandelaar
- Locatie (polikliniek, online, kliniek)
- Voortgang (vrije tekst updates)

**Waarom FHIR?**  
In FHIR heet dit **CarePlan.activity**. Dit is onderdeel van de CarePlan resource en beschrijft de "wat en wanneer" van de behandeling.

**Voorbeeld activiteiten:**
- Individuele CGT: 1x/week, 12 sessies
- Medicatie: Sertraline 50mg dagelijks
- ROM-meting: Elke 4 weken PHQ-9 invullen
- Huiswerk: Dagboek bijhouden

---

### 10. **Toestemmingen & Wilsverklaringen** (`consents`)
**Wat is het?**  
Alle toestemmingen van de cliënt: voor behandeling, voor gegevensuitwisseling (AVG), wilsverklaringen (niet-reanimeren, euthanasie-verklaring, etc.).

**Belangrijkste gegevens:**
- Type toestemming (behandeling, privacy/AVG, wilsverklaring, onderzoek)
- Status (actief, ingetrokken, afgewezen)
- Categorie (niet-reanimeren, advance directive, noodgevallen-only)
- Datum en wie gaf toestemming
- Geldigheid (startdatum - einddatum)
- Wat mag wel/niet (toegang, delen, correctie)
- Met wie mag gedeeld worden (specifieke behandelaren, organisaties)
- Documenten (ondertekende verklaring als PDF)

**Waarom FHIR?**  
In FHIR heet dit een **Consent** resource. Dit correspondeert met de Nederlandse **ZIB AdvanceDirective**.

**AVG-compliance:**  
Dit is cruciaal voor AVG-naleving. Hiermee registreer je:
- Toestemming voor behandeling (informed consent)
- Toestemming voor delen met huisarts/andere zorgverleners
- Intrekking van toestemming
- Wilsverklaringen die juridisch bindend zijn

**Voorbeelden:**
- "Toestemming behandeling depressie" (informed consent)
- "Geen toestemming delen met huisarts" (privacy)
- "Niet-reanimeren verklaring" (wilsverklaring)
- "Toestemming opname behandelgegevens in landelijke uitwisseling" (MedMIJ)

---

### 11. **Waarschuwingen & Alerts** (`flags`)
**Wat is het?**  
Belangrijke waarschuwingen die behandelaren **direct** moeten zien bij het openen van een dossier. Denk aan veiligheidsrisico's, allergieën, of gedragswaarschuwingen.

**Belangrijkste gegevens:**
- Type waarschuwing (veiligheid, klinisch, gedrag, infectie, allergie)
- Alert inhoud (bijv. "Suïciderisico", "Agressie naar hulpverleners")
- Prioriteit (hoog, middel, laag)
- Status (actief, inactief)
- Geldigheid (startdatum - einddatum)
- Wie maakte de alert
- Gerelateerde diagnoses of observaties

**Waarom FHIR?**  
In FHIR heet dit een **Flag** resource. Dit correspondeert met de Nederlandse **ZIB Alert**.

**Verschil met Observations:**  
Observations zijn metingen/bevindingen. Flags zijn **actieve waarschuwingen** die aandacht vragen.

**Categorieën:**
- **Safety (veiligheid)**: Suïciderisico, zelfverwaarlozing, valrisico
- **Clinical (klinisch)**: Ernstige allergie voor medicatie, infectiegevaar
- **Behavioral (gedrag)**: Agressie naar hulpverleners, grensoverschrijdend gedrag
- **Administrative**: Geen-toon status (privacy), wanbetaler

**Voorbeeld flags:**
- 🔴 "HOOG SUÏCIDERISICO - Concrete plannen, middelen aanwezig"
- 🟠 "Agressie naar vrouwelijke hulpverleners - Alleen mannelijke behandelaar"
- 🟡 "Allergie: Penicilline - anafylactische shock"
- ⚪ "Geen toestemming contact familie - Privacy verzoek"

**In de UI:**  
Flags worden prominent weergegeven (rood banner bovenaan dossier) zodat ze niet gemist kunnen worden.

---

### 12. **Documenten** (`document_references`)
**Wat is het?**  
Alle documenten in het dossier: intakeverslagen, behandelplannen, brieven aan huisarts, ROM-rapporten, etc.

**Belangrijkste gegevens:**
- Type document (intakeverslag, behandelplan, brief, rapport)
- Status (concept, definitief, vervangen)
- Datum
- Auteur (behandelaar)
- Gekoppeld aan welk contactmoment
- Content (Markdown tekst, PDF, of link naar bestand)

**Waarom FHIR?**  
In FHIR heet dit een **DocumentReference** resource. Dit zorgt ervoor dat documenten doorzoekbaar zijn en gekoppeld kunnen worden aan specifieke momenten in de behandeling.

**MedMIJ-integratie:**  
Via MedMIJ kunnen cliënten later hun eigen documenten ophalen in een persoonlijke gezondheidsomgeving (PGO-app).

---

## Hoe hangen deze onderdelen samen?

```
Cliënt (Patient)
  │
  ├─── heeft Toestemmingen (Consents) ⚠️ AVG-compliant
  │
  ├─── heeft Waarschuwingen (Flags) 🚨 Altijd zichtbaar
  │
  └─── heeft Contactmomenten (Encounters)
         │
         ├─── leidt tot Diagnoses (Conditions)
         │      └─── ondersteund door Observaties (Observations)
         │
         ├─── gebruikt Medicatie (MedicationStatements)
         │
         ├─── krijgt Behandelplan (CarePlan)
         │      ├─── met Doelen (Goals) 🎯 Meetbaar
         │      └─── met Activiteiten (CarePlanActivities)
         │
         └─── resulteert in Documenten (DocumentReferences)

Uitgevoerd door Behandelaar (Practitioner)
Binnen Instelling (Organization)
```

**Nieuwe verbindingen:**
- **Goals** zijn gekoppeld aan **CarePlan** en **Conditions**
- **Goals** worden gemeten via **Observations** (ROM-scores)
- **Flags** zijn gekoppeld aan **Conditions** en **Observations** (wat veroorzaakt de alert)
- **Consents** bepalen wie **DocumentReferences** mag inzien

---

## Waarom FHIR gebruiken?

### **1. Toekomstbestendig**
FHIR is de internationale standaard voor zorggegevens. Alle moderne zorgsystemen ondersteunen dit. Door vanaf dag 1 FHIR-compliant te bouwen, kunnen we later makkelijk integreren met:
- MedMIJ (patiëntportalen)
- Koppeltaal (eHealth apps)
- Landelijk Schakelpunt (LSP)
- Andere GGZ-instellingen
- Huisartseninformatiesystemen

### **2. Herbruikbaarheid**
Elk onderdeel ("resource") kan apart uitgewisseld worden. Bijvoorbeeld:
- Huisarts vraagt diagnoses op via FHIR API
- Cliënt haalt eigen medicatielijst op via MedMIJ
- eHealth app ontvangt behandelplan via Koppeltaal

### **3. Geen vendor lock-in**
Omdat we een open standaard gebruiken, zijn we niet afhankelijk van één leverancier. Data kan altijd geëxporteerd en geïmporteerd worden in FHIR-formaat.

### **4. Bewezen technologie**
FHIR wordt wereldwijd gebruikt door duizenden ziekenhuizen, klinieken en zorginstellingen. Alle grote EPD-leveranciers ondersteunen het.

---

## MedMIJ & Koppeltaal: Wat betekent dit?

### **MedMIJ - Patiëntportalen**
MedMIJ is het Nederlandse afsprakenstelsel waarmee patiënten hun medische gegevens kunnen ophalen in een PGO-app (Persoonlijke Gezondheidsomgeving).

**Voor GGZ is de "Basisgegevens GGZ 2.0" specificatie relevant:**
- 24 zorginformatiebouwstenen (ZIBs)
- Inclusief: diagnoses, medicatie, behandelplan, contactmomenten

**Ons datamodel ondersteunt dit omdat:**
- Alle velden volgen de MedMIJ FHIR profielen
- DSM-5 codes zijn opgenomen
- Juridische status kan vastgelegd worden
- Medicatie volgens MedicatieProces 9.0

**In de toekomst kunnen we:**
- Een FHIR API bouwen die MedMIJ-compliant is
- Cliënten toegang geven tot hun eigen dossier via een PGO-app
- Automatisch gegevens uitwisselen met andere zorgaanbieders

### **Koppeltaal - eHealth Apps**
Koppeltaal is de standaard waarmee GGZ-instellingen eHealth apps kunnen koppelen aan hun EPD.

**Voorbeeld:**
Behandelaar schrijft voor: "Doe dagelijks de mindfulness oefening in app MindDistrict"
→ Koppeltaal zorgt dat dit automatisch in het EPD en in de app komt te staan
→ Voortgang komt automatisch terug in het EPD

**Ons datamodel ondersteunt dit omdat:**
- CarePlan resource volgt Koppeltaal specificaties
- Activities kunnen gekoppeld worden aan externe apps
- Status updates worden automatisch verwerkt

---

## Privacy & Beveiliging

### **Encryptie**
- BSN wordt versleuteld opgeslagen
- Communicatie via HTTPS/TLS

### **Toegangscontrole (RLS)**
- Behandelaren zien alleen hun eigen cliënten
- Cliënten kunnen later hun eigen data inzien (via patiëntenportaal)
- Auditlog houdt bij wie wat wanneer heeft bekeken

### **AVG-compliance**
- Recht op inzage: cliënt kan eigen data opvragen
- Recht op vergetelheid: data kan verwijderd worden
- Logging: alle acties worden gelogd
- Bewaartermijnen: automatische archivering na X jaar

---

## Technische implementatie

### **Database: PostgreSQL (Supabase)**
- Type-safe met ENUMs voor statussen
- Automatische timestamps (created_at, updated_at)
- Foreign keys voor relaties
- Indexes voor performance

### **Veldnamen volgen FHIR**
Bijvoorbeeld:
- `name_family` → Patient.name.family
- `code_code` → Condition.code.coding.code
- `clinical_status` → Condition.clinicalStatus

Dit maakt het later makkelijk om FHIR JSON te genereren.

### **Later: FHIR API endpoints**
```
GET /fhir/Patient/{id}
GET /fhir/Encounter?patient={id}
GET /fhir/Condition?patient={id}
GET /fhir/CarePlan?patient={id}
```

---

## Wat betekent dit voor gebruikers?

### **Voor behandelaren:**
- Alle data is logisch gestructureerd
- Diagnoses zijn gekoppeld aan intake-moment
- Behandelplan volgt automatisch uit diagnose
- ROM-scores zijn zichtbaar in tijdlijn

### **Voor cliënten (in toekomst):**
- Eigen dossier inzien via app
- Behandelplan en afspraken zien
- ROM-vragenlijsten invullen via app
- Resultaten direct naar behandelaar

### **Voor beheerders:**
- Export naar andere systemen is mogelijk
- Backups bevatten FHIR-compliant data
- Audits en rapportages zijn eenvoudig
- Geen vendor lock-in

---

## Roadmap

### **Fase 1: MVP (nu)**
✅ Database schema met alle FHIR resources  
✅ Intake → Diagnose → Behandelplan workflow  
✅ Basis toegangscontrole  

### **Fase 2: Basis functionaliteit**
🔲 UI voor alle resources  
🔲 AI-assistentie voor intake  
🔲 ROM-metingen integratie  

### **Fase 3: Integraties**
🔲 FHIR API endpoints  
🔲 MedMIJ aansluiting (patiëntportaal)  
🔲 Koppeltaal aansluiting (eHealth apps)  
🔲 LSP medicatie-uitwisseling  

---

## Referenties

- **FHIR Specificatie:** https://hl7.org/fhir/
- **MedMIJ GGZ:** https://informatiestandaarden.nictiz.nl/wiki/MedMij:V2020.01/OntwerpGGZ
- **Koppeltaal:** https://www.koppeltaal.nl/
- **ZIBs (ZorgInformatieBouwstenen):** https://zibs.nl/
- **DSM-5 Codes:** American Psychiatric Association
- **MedicatieProces 9.0:** https://informatiestandaarden.nictiz.nl/wiki/mp:V9

---

**Laatst bijgewerkt:** 21 november 2024  
**Auteur:** Colin Lit (ikbenlit.nl)  
**Project:** AI Speedrun - Mini-ECD
