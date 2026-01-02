# 📝 Dataset: GGZ Zinnen voor Cortex V2

**Datum:** 01-01-2026  
**Status:** Training & Test Dataset  
**Auteur:** Colin Lit (met AI-assistentie)

---

## 1. Inleiding

Dit document bevat een uitgebreide dataset van GGZ-specifieke zinnen die gebruikt kunnen worden voor:
- Training van het intent classificatiesysteem
- Testing van de Reflex Arc (Layer 1)
- Evaluatie van de AI Orchestrator (Layer 2)
- Validatie van Nudge triggers (Layer 3)

### 1.1 Structuur per Zin

```typescript
{
  input: string;              // De invoerzin
  expectedIntent: CortexIntent | CortexIntent[];  // Verwachte intent(s)
  expectedEntities?: object;  // Verwachte entities
  shouldEscalate?: boolean;   // Of Layer 2 nodig is
  shouldTriggerNudge?: string; // Welke nudge verwacht wordt
  priority?: 'high' | 'medium' | 'low';  // GGZ urgentie
  context?: string;           // GGZ context/scenario
}
```

---

## 2. Single Intent Zinnen

### 2.1 Dagnotitie — Medicatie

| Input | Expected Intent | Entities | Nudge Trigger | Context |
|-------|-----------------|----------|---------------|---------|
| "Notitie Jan medicatie ingenomen" | `dagnotitie` | `{patientName: "Jan", category: "medicatie"}` | — | Routine medicatie registratie |
| "Jan heeft zijn antipsychotica geweigerd" | `dagnotitie` | `{patientName: "Jan", category: "medicatie", content: "antipsychotica geweigerd"}` | — | Medicatie weigering |
| "Medicatie Jan gewijzigd naar Olanzapine 10mg" | `dagnotitie` | `{patientName: "Jan", category: "medicatie"}` | `medicatie-controle` | Medicatie aanpassing |
| "Marie gestart met Lithium vandaag" | `dagnotitie` | `{patientName: "Marie", category: "medicatie"}` | `medicatie-controle` | Nieuwe medicatie start |
| "Piet klaagt over bijwerkingen quetiapine" | `dagnotitie` | `{patientName: "Piet", category: "medicatie"}` | — | Bijwerkingen |
| "Depakine spiegel afgenomen bij Sophie" | `dagnotitie` | `{patientName: "Sophie", category: "medicatie"}` | — | Lab controle |
| "PRN Oxazepam 10mg gegeven aan Kees om 14:00" | `dagnotitie` | `{patientName: "Kees", category: "medicatie"}` | — | PRN medicatie |
| "Medicatie voor Anna klaargelegd voor de nacht" | `dagnotitie` | `{patientName: "Anna", category: "medicatie"}` | — | Medicatie voorbereiding |
| "Jan weigert al 3 dagen zijn medicatie" | `dagnotitie` | `{patientName: "Jan", category: "medicatie", severity: "high"}` | `gedrag-risico-update` | Langdurige weigering |
| "Clozapine spiegel te laag, dosering verhoogd" | `dagnotitie` | `{category: "medicatie"}` | `medicatie-controle` | Dosisaanpassing |

### 2.2 Dagnotitie — Gedrag & Observatie

| Input | Expected Intent | Entities | Nudge Trigger | Context |
|-------|-----------------|----------|---------------|---------|
| "Jan is vandaag rustig en coöperatief" | `dagnotitie` | `{patientName: "Jan", category: "observatie"}` | — | Positieve observatie |
| "Marie vertoont toenemende onrust" | `dagnotitie` | `{patientName: "Marie", category: "gedrag"}` | `gedrag-risico-update` | Gedragsverandering |
| "Piet was agressief naar medepatiënt" | `dagnotitie` | `{patientName: "Piet", category: "gedrag"}` | `gedrag-risico-update` | Agressie incident |
| "Sophie hoort stemmen sinds gisteren" | `dagnotitie` | `{patientName: "Sophie", category: "observatie"}` | — | Psychotische symptomen |
| "Kees is geagiteerd en loopt veel te ijsberen" | `dagnotitie` | `{patientName: "Kees", category: "gedrag"}` | `gedrag-risico-update` | Agitatie |
| "Anna heeft slecht geslapen afgelopen nacht" | `dagnotitie` | `{patientName: "Anna", category: "observatie"}` | — | Slaapprobleem |
| "Jan trekt zich terug en communiceert minimaal" | `dagnotitie` | `{patientName: "Jan", category: "gedrag"}` | — | Sociaal terugtrekken |
| "Marie is verward en gedesoriënteerd" | `dagnotitie` | `{patientName: "Marie", category: "observatie"}` | `gedrag-risico-update` | Verwardheid |
| "Piet heeft goed gegeten vandaag" | `dagnotitie` | `{patientName: "Piet", category: "adl"}` | — | ADL positief |
| "Sophie weigert te eten sinds 2 dagen" | `dagnotitie` | `{patientName: "Sophie", category: "adl"}` | `adl-zorgplan-update` | ADL verslechtering |

### 2.3 Dagnotitie — Crisis & Veiligheid (HIGH PRIORITY)

| Input | Expected Intent | Entities | Nudge Trigger | Priority | Context |
|-------|-----------------|----------|---------------|----------|---------|
| "Jan spreekt over suïcide" | `dagnotitie` | `{patientName: "Jan", category: "observatie", severity: "high"}` | `suicidaliteit-veiligheidsplan` | 🔴 HIGH | Suïcidaliteit signaal |
| "Marie heeft zelfbeschadiging gepleegd" | `dagnotitie` | `{patientName: "Marie", category: "incident", severity: "high"}` | `suicidaliteit-veiligheidsplan` | 🔴 HIGH | Automutilatie |
| "Crisis: Piet dreigt met geweld" | `dagnotitie` | `{patientName: "Piet", category: "incident", severity: "high"}` | `crisis-team-informeren` | 🔴 HIGH | Geweld dreiging |
| "Sophie probeert weg te lopen" | `dagnotitie` | `{patientName: "Sophie", category: "incident"}` | `incident-mic-melding` | 🔴 HIGH | Weglopen |
| "Acuut: Kees is psychotisch en onhandelbaar" | `dagnotitie` | `{patientName: "Kees", category: "incident", severity: "high"}` | `crisis-team-informeren` | 🔴 HIGH | Acute psychose |
| "Jan heeft doodswensen geuit vanavond" | `dagnotitie` | `{patientName: "Jan", severity: "high"}` | `suicidaliteit-veiligheidsplan` | 🔴 HIGH | Suïcidaliteit |
| "Separatie ingezet bij Marie om 15:00" | `dagnotitie` | `{patientName: "Marie", category: "incident"}` | `incident-mic-melding` | 🔴 HIGH | Separatie |
| "Dwangmedicatie toegediend bij Piet" | `dagnotitie` | `{patientName: "Piet", category: "medicatie", severity: "high"}` | `incident-mic-melding` | 🔴 HIGH | Dwangmedicatie |
| "Jan gevallen in gang, geen letsel" | `dagnotitie` | `{patientName: "Jan", category: "incident"}` | `incident-mic-melding` | 🟡 MEDIUM | Valincident |
| "Fixatie toegepast na agressie incident" | `dagnotitie` | `{category: "incident", severity: "high"}` | `incident-mic-melding` | 🔴 HIGH | Fixatie |

### 2.4 Dagnotitie — ADL & Zorg

| Input | Expected Intent | Entities | Nudge Trigger | Context |
|-------|-----------------|----------|---------------|---------|
| "Jan geholpen met douchen" | `dagnotitie` | `{patientName: "Jan", category: "adl"}` | — | ADL ondersteuning |
| "Marie weigert persoonlijke verzorging" | `dagnotitie` | `{patientName: "Marie", category: "adl"}` | `adl-zorgplan-update` | ADL weigering |
| "Wond verzorgd bij Piet, ziet er goed uit" | `dagnotitie` | `{patientName: "Piet", category: "adl"}` | `wondzorg-controle` | Wondzorg |
| "Sophie heeft hulp nodig bij aankleden" | `dagnotitie` | `{patientName: "Sophie", category: "adl"}` | `adl-zorgplan-update` | Toenemende hulpbehoefte |
| "Decubitus plek gecontroleerd, graad 2" | `dagnotitie` | `{category: "adl"}` | `wondzorg-controle` | Decubitus |
| "Kees kan niet meer zelfstandig naar toilet" | `dagnotitie` | `{patientName: "Kees", category: "adl"}` | `adl-zorgplan-update` | ADL achteruitgang |
| "Anna heeft goed ontbeten vandaag" | `dagnotitie` | `{patientName: "Anna", category: "adl"}` | — | Voeding positief |
| "Jan is 3 kilo afgevallen deze week" | `dagnotitie` | `{patientName: "Jan", category: "observatie"}` | — | Gewichtsverlies |

### 2.5 Zoeken

| Input | Expected Intent | Entities | Context |
|-------|-----------------|----------|---------|
| "Zoek Jan" | `zoeken` | `{query: "Jan"}` | Simpel zoeken |
| "Wie is mevrouw De Vries?" | `zoeken` | `{query: "De Vries"}` | Formeel zoeken |
| "Dossier Marie" | `zoeken` | `{query: "Marie"}` | Dossier opvragen |
| "Vind patiënt Pietersen" | `zoeken` | `{query: "Pietersen"}` | Achternaam zoeken |
| "Zoek BSN 123456789" | `zoeken` | `{query: "123456789"}` | BSN zoeken |
| "Patiënt met kamer 12" | `zoeken` | `{query: "kamer 12"}` | Locatie zoeken |
| "Wie ligt er op afdeling 3?" | `zoeken` | `{query: "afdeling 3"}` | Afdeling zoeken |

### 2.6 Agenda Query

| Input | Expected Intent | Entities | Context |
|-------|-----------------|----------|---------|
| "Agenda vandaag" | `agenda_query` | `{dateRange: {label: "vandaag"}}` | Dag overzicht |
| "Wat heb ik morgen?" | `agenda_query` | `{dateRange: {label: "morgen"}}` | Morgen |
| "Afspraken deze week" | `agenda_query` | `{dateRange: {label: "deze week"}}` | Week overzicht |
| "Hoeveel intakes heb ik nog?" | `agenda_query` | `{appointmentType: "intake"}` | Type filter |
| "Wanneer is mijn volgende afspraak met Jan?" | `agenda_query` | `{patientName: "Jan"}` | Patiënt filter |
| "Alle huisbezoeken komende week" | `agenda_query` | `{appointmentType: "huisbezoek", dateRange: {label: "volgende week"}}` | Type + periode |
| "Crisisdienst schema" | `agenda_query` | `{appointmentType: "crisis"}` | Crisis planning |

### 2.7 Overdracht

| Input | Expected Intent | Entities | Context |
|-------|-----------------|----------|---------|
| "Overdracht" | `overdracht` | `{}` | Standaard overdracht |
| "Dienst afronden" | `overdracht` | `{}` | Einde dienst |
| "Samenvatting voor collega" | `overdracht` | `{}` | Collega overdracht |
| "Wat is er gebeurd vandaag?" | `overdracht` | `{dateRange: {label: "vandaag"}}` | Dag samenvatting |
| "Overdracht avonddienst" | `overdracht` | `{shift: "avond"}` | Avond overdracht |
| "Aandachtspunten voor de nacht" | `overdracht` | `{shift: "nacht"}` | Nacht overdracht |

### 2.8 Afspraak Maken

| Input | Expected Intent | Entities | Context |
|-------|-----------------|----------|---------|
| "Plan intake Jan morgen 14:00" | `create_appointment` | `{patientName: "Jan", appointmentType: "intake", datetime: {...}}` | Intake plannen |
| "Maak behandelafspraak Marie vrijdag" | `create_appointment` | `{patientName: "Marie", appointmentType: "behandeling"}` | Behandeling |
| "Huisbezoek bij Piet volgende week" | `create_appointment` | `{patientName: "Piet", appointmentType: "huisbezoek"}` | Huisbezoek |
| "Online consult Sophie woensdag 10:00" | `create_appointment` | `{patientName: "Sophie", appointmentType: "online", datetime: {...}}` | Online |
| "Plan evaluatie medicatie voor Kees" | `create_appointment` | `{patientName: "Kees", appointmentType: "follow-up"}` | Follow-up |
| "Crisisafspraak vandaag voor Anna" | `create_appointment` | `{patientName: "Anna", appointmentType: "crisis", dateRange: {label: "vandaag"}}` | Crisis |
| "Bel-afspraak Jan overmorgen" | `create_appointment` | `{patientName: "Jan", appointmentType: "telefonisch"}` | Telefonisch |

### 2.9 Afspraak Annuleren

| Input | Expected Intent | Entities | Context |
|-------|-----------------|----------|---------|
| "Annuleer afspraak Jan" | `cancel_appointment` | `{patientName: "Jan"}` | Simpel annuleren |
| "Zeg Marie van morgen af" | `cancel_appointment` | `{patientName: "Marie", datetime: {...}}` | Specifieke dag |
| "Cancel intake Piet" | `cancel_appointment` | `{patientName: "Piet", appointmentType: "intake"}` | Type specifiek |
| "Afspraak van 14:00 afzeggen" | `cancel_appointment` | `{datetime: {time: "14:00"}}` | Tijd specifiek |

### 2.10 Afspraak Verzetten

| Input | Expected Intent | Entities | Context |
|-------|-----------------|----------|---------|
| "Verzet Jan naar volgende week" | `reschedule_appointment` | `{patientName: "Jan", newDatetime: {...}}` | Verzetten |
| "Verplaats de intake naar vrijdag" | `reschedule_appointment` | `{appointmentType: "intake", newDatetime: {...}}` | Type specifiek |
| "Marie's afspraak 1 uur later" | `reschedule_appointment` | `{patientName: "Marie", newDatetime: {...}}` | Relatief |

---

## 3. Query Intents (Nieuw in V2)

### 3.1 Patient Overview

| Input | Expected Intent | Entities | Context |
|-------|-----------------|----------|---------|
| "Overzicht Jan" | `patient_overview` | `{patientName: "Jan"}` | Basis overzicht |
| "Dashboard Marie" | `patient_overview` | `{patientName: "Marie"}` | Dashboard |
| "Toon alles van Piet" | `patient_overview` | `{patientName: "Piet"}` | Volledig overzicht |
| "Patiëntoverzicht Sophie" | `patient_overview` | `{patientName: "Sophie"}` | Formeel |
| "Wie is Jan en wat speelt er?" | `patient_overview` | `{patientName: "Jan"}` | Context vraag |
| "Geef me info over Kees" | `patient_overview` | `{patientName: "Kees"}` | Informeel |

### 3.2 Rapportage Query

| Input | Expected Intent | Entities | Context |
|-------|-----------------|----------|---------|
| "Toon rapportages Jan" | `rapportage_query` | `{patientName: "Jan"}` | Alle rapportages |
| "Wat is er gerapporteerd deze week?" | `rapportage_query` | `{dateRange: {label: "deze week"}}` | Periode filter |
| "Medicatie notities Marie afgelopen maand" | `rapportage_query` | `{patientName: "Marie", category: "medicatie", dateRange: {...}}` | Categorie filter |
| "Incidenten van Piet" | `rapportage_query` | `{patientName: "Piet", category: "incident"}` | Incident filter |
| "Alle gedragsobservaties vandaag" | `rapportage_query` | `{category: "gedrag", dateRange: {label: "vandaag"}}` | Type + periode |
| "Voortgangsrapportages Sophie" | `rapportage_query` | `{patientName: "Sophie", reportType: "voortgang"}` | Report type |
| "Laatste 5 notities van Jan" | `rapportage_query` | `{patientName: "Jan", limit: 5}` | Limiet |

### 3.3 Behandelplan Query

| Input | Expected Intent | Entities | Context |
|-------|-----------------|----------|---------|
| "Wat is het behandelplan van Jan?" | `behandelplan_query` | `{patientName: "Jan"}` | Volledig plan |
| "Toon doelen van Marie" | `behandelplan_query` | `{patientName: "Marie", queryFocus: "doelen"}` | Doelen focus |
| "Behandelplan" | `behandelplan_query` | `{}` | Context-afhankelijk |
| "Welke interventies heeft Piet?" | `behandelplan_query` | `{patientName: "Piet", queryFocus: "interventies"}` | Interventies |
| "Leefgebieden scores Sophie" | `behandelplan_query` | `{patientName: "Sophie", queryFocus: "leefgebieden"}` | Leefgebieden |
| "Hulpvraag van Kees" | `behandelplan_query` | `{patientName: "Kees", queryFocus: "hulpvraag"}` | Hulpvraag |

### 3.4 Risico Query

| Input | Expected Intent | Entities | Context |
|-------|-----------------|----------|---------|
| "Wat zijn de risico's van Jan?" | `risico_query` | `{patientName: "Jan"}` | Alle risico's |
| "Toon risicotaxatie Marie" | `risico_query` | `{patientName: "Marie"}` | Risicotaxatie |
| "Suïciderisico van Piet" | `risico_query` | `{patientName: "Piet", riskType: "suicidaliteit"}` | Specifiek risico |
| "Risico's" | `risico_query` | `{}` | Context-afhankelijk |
| "Veiligheidsplan Sophie" | `risico_query` | `{patientName: "Sophie", riskType: "suicidaliteit"}` | Veiligheidsplan |
| "Agressierisico van Kees" | `risico_query` | `{patientName: "Kees", riskType: "agressie"}` | Specifiek |
| "Wie heeft hoog risico?" | `risico_query` | `{riskLevel: "hoog"}` | Niveau filter |

---

## 4. Multi-Intent Zinnen (Layer 2 Required)

### 4.1 Notitie + Afspraak

| Input | Expected Intents | Entities | Context |
|-------|------------------|----------|---------|
| "Zeg Jan af en maak notitie dat hij ziek is" | `[cancel_appointment, dagnotitie]` | `[{patientName: "Jan"}, {patientName: "Jan", content: "ziek"}]` | Annulering + reden |
| "Plan follow-up Marie en noteer dat medicatie werkt" | `[create_appointment, dagnotitie]` | `[{patientName: "Marie", appointmentType: "follow-up"}, {patientName: "Marie", category: "medicatie"}]` | Afspraak + notitie |
| "Intake gedaan bij Piet, plan evaluatie over 2 weken" | `[dagnotitie, create_appointment]` | `[{patientName: "Piet", category: "observatie"}, {patientName: "Piet", appointmentType: "follow-up"}]` | Notitie + follow-up |

### 4.2 Notitie + Notitie

| Input | Expected Intents | Entities | Context |
|-------|------------------|----------|---------|
| "Jan medicatie gegeven en hij is rustig vandaag" | `[dagnotitie, dagnotitie]` | `[{patientName: "Jan", category: "medicatie"}, {patientName: "Jan", category: "observatie"}]` | Meerdere categorieën |
| "Marie heeft gegeten en is gedoucht met hulp" | `[dagnotitie, dagnotitie]` | `[{patientName: "Marie", category: "adl"}, {patientName: "Marie", category: "adl"}]` | Meerdere ADL |

### 4.3 Query + Actie

| Input | Expected Intents | Entities | Context |
|-------|------------------|----------|---------|
| "Toon agenda en plan intake Jan morgen" | `[agenda_query, create_appointment]` | `[{dateRange: {...}}, {patientName: "Jan", appointmentType: "intake"}]` | Overzicht + actie |
| "Check risico's van Marie en maak notitie" | `[risico_query, dagnotitie]` | `[{patientName: "Marie"}, {patientName: "Marie"}]` | Query + notitie |

### 4.4 GGZ-Specifieke Combinaties

| Input | Expected Intents | Entities | Priority | Context |
|-------|------------------|----------|----------|---------|
| "Crisis bij Jan, separeer en informeer psychiater" | `[dagnotitie, dagnotitie]` | `[{patientName: "Jan", category: "incident"}, {patientName: "Jan", category: "incident"}]` | 🔴 HIGH | Crisis protocol |
| "Dwangmedicatie bij Marie, MIC invullen" | `[dagnotitie, dagnotitie]` | `[{patientName: "Marie", category: "medicatie"}, {patientName: "Marie", category: "incident"}]` | 🔴 HIGH | Dwang + melding |
| "Plan ontslaggesprek Piet en maak overdracht" | `[create_appointment, overdracht]` | `[{patientName: "Piet"}, {}]` | 🟡 MEDIUM | Ontslag planning |

---

## 5. Context-Afhankelijke Zinnen (Pronoun Resolution)

### 5.1 Pronoun "Hij/Zij/Hem/Haar"

| Input | Context | Expected Resolution | Expected Intent |
|-------|---------|---------------------|-----------------|
| "Maak notitie voor hem" | activePatient: Jan | patientName: "Jan", patientResolution: "pronoun" | `dagnotitie` |
| "Zij is vandaag rustig" | activePatient: Marie | patientName: "Marie", patientResolution: "pronoun" | `dagnotitie` |
| "Geef hem zijn medicatie" | activePatient: Piet | patientName: "Piet", patientResolution: "pronoun" | `dagnotitie` |
| "Plan afspraak voor haar" | activePatient: Sophie | patientName: "Sophie", patientResolution: "pronoun" | `create_appointment` |
| "Wat zijn zijn risico's?" | activePatient: Kees | patientName: "Kees", patientResolution: "pronoun" | `risico_query` |

### 5.2 Demonstratief "Die/Deze/Dezelfde"

| Input | Context | Expected Resolution | Expected Intent |
|-------|---------|---------------------|-----------------|
| "Verzet die afspraak naar morgen" | recentIntent: cancel_appointment voor Jan | patientName: "Jan" | `reschedule_appointment` |
| "Annuleer deze intake" | currentView: appointment detail Jan | patientName: "Jan", appointmentType: "intake" | `cancel_appointment` |
| "Notitie voor dezelfde patiënt" | lastPatient: Marie | patientName: "Marie" | `dagnotitie` |

### 5.3 Impliciete Context

| Input | Context | Expected Resolution | Expected Intent |
|-------|---------|---------------------|-----------------|
| "Medicatie gegeven" | activePatient: Jan | patientName: "Jan", category: "medicatie" | `dagnotitie` |
| "Is rustig vandaag" | activePatient: Marie | patientName: "Marie", category: "observatie" | `dagnotitie` |
| "Behandelplan updaten" | activePatient: Piet | patientName: "Piet" | `behandelplan_query` |

---

## 6. Ambigue Zinnen (Clarification Required)

### 6.1 Intent Ambigu

| Input | Clarification Question | Options | Context |
|-------|------------------------|---------|---------|
| "Jan wondzorg" | "Wil je een notitie maken over wondzorg of een afspraak plannen?" | ["Notitie maken", "Afspraak plannen"] | Onduidelijk actie type |
| "Medicatie Marie" | "Wil je medicatie registreren of de medicatielijst bekijken?" | ["Medicatie notitie", "Medicatielijst"] | Notitie vs query |
| "Plan Jan" | "Wat wil je plannen voor Jan?" | ["Intake", "Behandelafspraak", "Follow-up", "Huisbezoek"] | Type ontbreekt |
| "Overdracht Sophie" | "Wil je de overdracht bekijken of een notitie maken voor overdracht?" | ["Overdracht bekijken", "Notitie voor overdracht"] | Bekijken vs maken |

### 6.2 Patiënt Ambigu

| Input | Clarification Question | Options | Context |
|-------|------------------------|---------|---------|
| "Notitie voor Jan" | "Welke Jan bedoel je?" | ["Jan de Vries (kamer 12)", "Jan Pietersen (kamer 8)"] | Meerdere Jans |
| "Afspraak Marie" | "Bedoel je Marie Bakker of Marie Smit?" | ["Marie Bakker", "Marie Smit"] | Meerdere Maries |

### 6.3 Tijd Ambigu

| Input | Clarification Question | Options | Context |
|-------|------------------------|---------|---------|
| "Plan intake snel" | "Wanneer wil je de intake plannen?" | ["Vandaag", "Morgen", "Deze week"] | Vage tijd |
| "Afspraak binnenkort" | "Welke dag heeft je voorkeur?" | ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"] | Vage tijd |

---

## 7. Nudge-Triggerende Zinnen

### 7.1 HIGH Priority Nudges

| Input | Expected Nudge | Nudge Message | Context |
|-------|----------------|---------------|---------|
| "Jan spreekt over suïcide" | `suicidaliteit-veiligheidsplan` | "⚠️ Veiligheidsplan actualiseren en risicotaxatie bijwerken?" | Suïcidaliteit signaal |
| "Marie heeft zichzelf gesneden" | `suicidaliteit-veiligheidsplan` | "⚠️ Veiligheidsplan actualiseren en risicotaxatie bijwerken?" | Automutilatie |
| "Crisis bij Piet, acuut suïcidaal" | `crisis-team-informeren` | "🚨 Crisisteam en dienstdoende psychiater informeren?" | Acute crisis |
| "Incident: Sophie gevallen met letsel" | `incident-mic-melding` | "⚠️ MIC-melding invullen voor dit incident?" | Val met letsel |
| "Noodgeval: Kees psychotisch en agressief" | `crisis-team-informeren` | "🚨 Crisisteam en dienstdoende psychiater informeren?" | Acute psychose |
| "Fixatie toegepast bij Anna" | `incident-mic-melding` | "⚠️ MIC-melding invullen voor dit incident?" | Vrijheidsbeperkende maatregel |

### 7.2 MEDIUM Priority Nudges

| Input | Expected Nudge | Nudge Message | Context |
|-------|----------------|---------------|---------|
| "Jan was agressief naar verpleegkundige" | `gedrag-risico-update` | "📋 Risicotaxatie bijwerken voor dit gedrag?" | Agressie |
| "Marie vertoont verward gedrag" | `gedrag-risico-update` | "📋 Risicotaxatie bijwerken voor dit gedrag?" | Verwardheid |
| "Piet kan niet meer zelfstandig lopen" | `adl-zorgplan-update` | "🏠 Zorgplan/behandelplan bijwerken voor gewijzigde ADL?" | ADL verslechtering |
| "Sophie weigert persoonlijke verzorging" | `adl-zorgplan-update` | "🏠 Zorgplan/behandelplan bijwerken voor gewijzigde ADL?" | ADL weigering |
| "Wond verzorgd, ziet er goed uit" | `wondzorg-controle` | "Wondcontrole inplannen over 3 dagen?" | Wondzorg |
| "Medicatie gewijzigd naar hogere dosis" | `medicatie-controle` | "Medicatie evaluatie inplannen over 1 week?" | Medicatie wijziging |

### 7.3 LOW Priority Nudges

| Input | Expected Nudge | Nudge Message | Context |
|-------|----------------|---------------|---------|
| "Intake afspraak gepland" | `intake-behandelplan` | "📝 Behandelplan opstellen na de intake?" | Post-intake |
| "Let op: Jan moet extra gecontroleerd worden" | `handover-mark` | "📋 Deze notitie opnemen in de dienst-overdracht?" | Overdracht markering |
| "Belangrijk voor collega: Sophie heeft onrust" | `handover-mark` | "📋 Deze notitie opnemen in de dienst-overdracht?" | Overdracht markering |

---

## 8. Domein-Specifieke Terminologie

### 8.1 GGZ Diagnosen & Symptomen

| Term | Variaties | Context |
|------|-----------|---------|
| Psychose | psychotisch, psychotische symptomen, hallucinaties | Psychiatrisch |
| Depressie | depressief, depressieve, somber, neerslachtig | Stemmingsstoornis |
| Manie | manisch, manische, ontremd | Bipolair |
| Angst | angstig, angststoornis, paniekerig | Angststoornis |
| Persoonlijkheidsstoornis | borderline, antisociaal, vermijdend | Persoonlijkheid |
| Schizofrenie | schizofreen, wanen, stemmen horen | Psychotisch |
| ADHD | hyperactief, ongeconcentreerd, impulsief | Ontwikkeling |
| Autisme | autistisch, prikkelgevoelig, sociale interactie | Ontwikkeling |
| Verslaving | middelengebruik, alcohol, drugs, afhankelijk | Verslaving |
| Dementie | dement, geheugenproblemen, vergeetachtig | Cognitief |

### 8.2 GGZ Interventies

| Term | Variaties | Context |
|------|-----------|---------|
| Separatie | separeren, afgezonderd, isolatie | Dwangmaatregel |
| Fixatie | gefixeerd, bed vastgelegd | Dwangmaatregel |
| Dwangmedicatie | noodmedicatie, gedwongen medicatie | Dwangmaatregel |
| ECT | electroshock, elektroconvulsietherapie | Behandeling |
| CGT | cognitieve gedragstherapie | Therapie |
| EMDR | traumaverwerking | Therapie |
| Groepstherapie | groepsgesprek, groepsbehandeling | Therapie |

### 8.3 GGZ Rollen

| Term | Variaties | Context |
|------|-----------|---------|
| Psychiater | arts, dienstdoende arts | Medisch |
| Verpleegkundige | verpleging, vpk | Zorg |
| Psycholoog | GZ-psycholoog, klinisch psycholoog | Behandeling |
| Sociaal werker | maatschappelijk werker, SW | Begeleiding |
| Ervaringsdeskundige | ED, peer support | Ondersteuning |
| Diëtist | voedingsdeskundige | Zorg |
| Vaktherapeut | beeldend therapeut, PMT | Therapie |

---

## 9. Edge Cases & Speciale Scenarios

### 9.1 Lege of Minimale Input

| Input | Expected Behavior | Handling |
|-------|-------------------|----------|
| "" | Error | "Geen invoer ontvangen" |
| "   " | Error | "Geen invoer ontvangen" |
| "hallo" | `unknown` + clarification | "Waarmee kan ik je helpen?" |
| "ja" | Context-afhankelijk | Check pending confirmation |
| "nee" | Context-afhankelijk | Check pending dismissal |

### 9.2 Spelfouten & Variaties

| Input (met fout) | Correcte Interpretatie | Expected Intent |
|------------------|------------------------|-----------------|
| "Medicatei gegeven" | "Medicatie gegeven" | `dagnotitie` |
| "Aganda vandaag" | "Agenda vandaag" | `agenda_query` |
| "Suïcide gedachten" | "Suïcidale gedachten" | `dagnotitie` + nudge |
| "Notiteie Jan" | "Notitie Jan" | `dagnotitie` |
| "Psyhcose" | "Psychose" | `dagnotitie` |

### 9.3 Informele Taal

| Input | Expected Intent | Entities | Context |
|-------|-----------------|----------|---------|
| "Jansen is weer aan het flippen" | `dagnotitie` | `{patientName: "Jansen", category: "gedrag"}` | Informeel gedrag |
| "Die vent wil niet eten" | `dagnotitie` | `{category: "adl"}` | Context-afhankelijk |
| "Pil gegeven om 8 uur" | `dagnotitie` | `{category: "medicatie"}` | Informele medicatie |
| "Mevrouw is weer helemaal de weg kwijt" | `dagnotitie` | `{category: "observatie"}` | Verwardheid |

### 9.4 Gecombineerde Urgentie

| Input | Priority | Expected Behavior |
|-------|----------|-------------------|
| "Crisis bij Jan, suïcidaal en agressief" | 🔴 HIGHEST | Dubbele nudge: `suicidaliteit-veiligheidsplan` + `crisis-team-informeren` |
| "Incident: fixatie na suïcidepoging" | 🔴 HIGHEST | Dubbele nudge: `incident-mic-melding` + `suicidaliteit-veiligheidsplan` |

---

## 10. Testset Statistieken

### 10.1 Verdeling per Intent

| Intent | Aantal Zinnen | Percentage |
|--------|---------------|------------|
| `dagnotitie` | ~85 | 45% |
| `zoeken` | ~10 | 5% |
| `agenda_query` | ~10 | 5% |
| `overdracht` | ~10 | 5% |
| `create_appointment` | ~15 | 8% |
| `cancel_appointment` | ~8 | 4% |
| `reschedule_appointment` | ~6 | 3% |
| `patient_overview` | ~10 | 5% |
| `rapportage_query` | ~12 | 6% |
| `behandelplan_query` | ~10 | 5% |
| `risico_query` | ~10 | 5% |
| Multi-intent | ~15 | 8% |
| **Totaal** | **~190** | **100%** |

### 10.2 Verdeling per Complexity

| Complexity | Aantal | Layer | Beschrijving |
|------------|--------|-------|--------------|
| Simple | ~120 | Layer 1 (Reflex) | Hoge confidence, single intent |
| Context-dependent | ~30 | Layer 2 (AI) | Pronoun resolution nodig |
| Multi-intent | ~20 | Layer 2 (AI) | Meerdere acties |
| Ambiguous | ~20 | Layer 2 (AI) | Clarification nodig |

### 10.3 Verdeling per Priority

| Priority | Aantal | Nudge Required |
|----------|--------|----------------|
| 🔴 HIGH | ~25 | Ja (safety-related) |
| 🟡 MEDIUM | ~50 | Mogelijk |
| 🔵 LOW | ~115 | Nee |

---

## 11. Implementatie Aanbevelingen

### 11.1 Training Data Format

```json
{
  "version": "1.0",
  "language": "nl",
  "domain": "ggz",
  "sentences": [
    {
      "id": "ggz-001",
      "input": "Jan spreekt over suïcide",
      "expected": {
        "intent": "dagnotitie",
        "entities": {
          "patientName": "Jan",
          "category": "observatie",
          "severity": "high"
        },
        "nudge": "suicidaliteit-veiligheidsplan"
      },
      "complexity": "simple",
      "priority": "high",
      "tags": ["crisis", "safety", "suicidality"]
    }
  ]
}
```

### 11.2 Evaluatie Metrics

| Metric | Beschrijving | Target |
|--------|--------------|--------|
| Intent Accuracy | Correct intent geclassificeerd | ≥95% |
| Entity Extraction | Correcte entities geëxtraheerd | ≥90% |
| Nudge Precision | Correcte nudge getriggerd | ≥90% |
| Escalation Rate | % dat naar Layer 2 gaat | 20-30% |
| Clarification Rate | % dat verduidelijking vraagt | <10% |
| Response Time L1 | Reflex Arc latency | <20ms |
| Response Time L2 | AI Orchestrator latency | <500ms |

### 11.3 Continuous Improvement

1. **Log alle classificaties** met intent, confidence, entities
2. **Track nudge acceptance rate** per rule
3. **Monitor escalation reasons** voor pattern verbeteringen
4. **Verzamel user corrections** voor fine-tuning
5. **A/B test** nieuwe patterns voordat ze live gaan

---

## Versiehistorie

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 01-01-2026 | Colin Lit | Initieel dataset document |

---

## Referenties

- [Analyse Intents & Nudges](./analyse-intents-nudges.md)
- [Architecture Cortex V2](./architecture-cortex-v2.md)
- [Bouwplan Cortex V2](../bouwplan-cortex-v2.md)
- Intent types: `lib/cortex/types.ts`
- Report types: `lib/types/report.ts`

