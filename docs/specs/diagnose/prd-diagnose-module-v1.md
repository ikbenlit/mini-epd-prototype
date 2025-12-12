# 📄 Product Requirements Document (PRD) – Diagnose Module

**Projectnaam:** Diagnose Module - Mini EPD
**Versie:** v1.1
**Datum:** 11-12-2024
**Auteur:** Colin Lit

---

## 1. Doelstelling

🎯 **Doel:** Een diagnosemodule bouwen voor het prototype die psychologen in staat stelt diagnoses gestructureerd vast te leggen met ICD-10 codes (publiek domein) en DSM-5 referenties.

📘 **Toelichting:**
De huidige diagnose-functionaliteit is minimaal: een simpel formulier met handmatige code-invoer. Deze MVP breidt dit uit naar een werkende module met:
- Doorzoekbare **ICD-10 classificatie** (publiek domein, geen licentie nodig)
- DSM-5 equivalent als referentieveld (vrije tekst)
- Meervoudige diagnoses per intake (hoofd- en nevendiagnoses)
- Status tracking (actief, in remissie, opgelost)
- AI-ondersteuning voor diagnose-suggesties

**Type:** Prototype voor demo en validatie.

> **Licentie-opmerking:** DSM-5 classificaties vallen onder licentie van Boom uitgevers. Voor productie is een licentie vereist. Dit prototype gebruikt ICD-10 (WHO, publiek domein) als primaire classificatie.

---

## 2. Doelgroep

🎯 **Primaire doelgroep:**
- **Psychologen / Regiebehandelaren:** Stellen diagnoses en hebben behoefte aan efficiënte classificatie met onderbouwing.
- **Psychiaters:** Valideren diagnoses, voegen specialistische classificaties toe.

📘 **Secundaire doelgroep:**
- **Product Owners & Managers:** Demo van AI-potentieel in diagnostisch proces.
- **Developers:** Referentie-implementatie voor medische classificatiesystemen.

**Persona's:**
> - **Marieke (GZ-psycholoog):** Wil snel DSM-5 codes kunnen vinden zonder handboek. Wil zien welke diagnoses passen bij de intake-bevindingen.
> - **Peter (Psychiater):** Wil comorbiditeit vastleggen met hoofd/nevendiagnose structuur. Heeft behoefte aan differentiaaldiagnostiek.

---

## 3. Kernfunctionaliteiten (MVP-scope)

### 3.1 ICD-10 Classificatie Browser
1. **Doorzoekbare codelijst:** Zoeken op code (F32.1) of beschrijving ("depressieve episode").
2. **Categorie navigatie:** Hiërarchische structuur (Hoofdgroep → Subgroep → Specifieke diagnose).
3. **Snelkeuze:** Veelvoorkomende GGZ-diagnoses (top 30).

### 3.2 Diagnose Registratie
4. **ICD-10 code:** Primaire classificatie (verplicht).
5. **DSM-5 referentie:** Optioneel vrije-tekst veld voor DSM-5 equivalent.
6. **Meervoudige diagnoses:** Hoofd- en nevendiagnoses (primair/secundair markering).
7. **Ernst classificatie:** Licht / Matig / Ernstig.
8. **Status tracking:** Actief / In remissie / Opgelost / Ingevoerd-in-fout.
9. **Notities veld:** Onderbouwing en klinische redenering.

### 3.3 AI-ondersteuning
10. **Diagnose-suggesties:** Op basis van intake-notities en anamnese (ICD-10 codes).
11. **Differentiaal-helper:** Toon vergelijkbare diagnoses met onderscheidende kenmerken.

### 3.4 Integratie
12. **Behandelplan-koppeling:** Diagnoses beschikbaar als input voor behandelplan.
13. **Overdracht-integratie:** Actieve diagnoses in overdrachtsamenvatting.

### *(Stretch / Post-prototype)*
- Volledige DSM-5 integratie (na licentie-afsluiting)
- Diagnose-overzicht patiënt-breed
- Versiebeheer diagnoses

---

## 4. Gebruikersflows (MVP-flows)

### Flow 1: Diagnose toevoegen via zoeken
```
1. Psycholoog opent Diagnose tab binnen intake
2. Klikt [+ Nieuwe diagnose]
3. Zoekt op "depressie" of "F32"
4. Selecteert "F32.1 - Depressieve stoornis, matig"
5. Vult ernst in (dropdown: matig)
6. Markeert als hoofddiagnose (toggle)
7. Voegt optionele notitie toe
8. Klikt [Opslaan]
```

### Flow 2: AI-suggestie gebruiken
```
1. Psycholoog opent Diagnose tab
2. Klikt [AI › Analyseer intake]
3. Systeem analyseert intake-notities + anamnese
4. Toont 2-4 diagnose-suggesties met confidence score
5. Per suggestie: onderbouwing uit intake-tekst (citaten)
6. Psycholoog selecteert relevante suggestie(s)
7. Past aan indien nodig → [Opslaan]
```

### Flow 3: Differentiaaldiagnose bekijken
```
1. Bij geselecteerde diagnose (bijv. F41.1 GAD)
2. Klikt [Differentiaal bekijken]
3. Toont gerelateerde diagnoses:
   - F41.0 Paniekstoornis
   - F43.1 PTSS
   - F32.1 Depressie met angstkenmerken
4. Per alternatief: kernverschillen uitgelicht
5. Psycholoog bevestigt of past diagnose aan
```

### Flow 4: Diagnose-overzicht raadplegen
```
1. Psycholoog opent Patiënt dossier
2. Navigeert naar Diagnoses sectie (L2 menu)
3. Ziet overzicht alle diagnoses (actief + historisch)
4. Filter op status: Actief / In remissie / Alle
5. Klik op diagnose → details + gekoppelde intake
```

---

## 5. Niet in Scope (Prototype)

| Feature | Reden |
|---------|-------|
| Volledige DSM-5 classificatie | Licentie vereist (Boom uitgevers) |
| DSM-5 criteria/checklists | Licentiegebonden content |
| Multi-disciplinaire validatie workflow | Complexiteit, geen meerwaarde voor demo |
| Automatische DBC/ZPM-koppeling | Vereist externe integraties |
| Medicatie-diagnose interacties | Buiten scope |
| ICD-11 ondersteuning | Nog niet gangbaar in NL GGZ |

---

## 6. Succescriteria

| Criterium | Meetbaar doel |
|-----------|---------------|
| Code-zoekfunctie | < 3 klikken van zoeken naar selectie |
| AI-suggesties | Relevante suggestie in top-3 bij 80% van intakes |
| Differentiaal | Toon minimaal 2 relevante alternatieven |
| Demo-flow | Volledige diagnose-registratie in < 60 seconden |
| Data-integriteit | Diagnoses correct gekoppeld aan intake + patiënt |
| Overdracht | Actieve diagnoses automatisch in AI-samenvatting |

---

## 7. Risico's & Mitigatie

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| AI-suggesties onjuist/onvolledig | Hoog | Duidelijke disclaimer, suggesties als hulpmiddel niet als diagnose |
| ICD-10 minder bekend bij GGZ | Laag | Codes zijn identiek aan DSM-5, alleen beschrijvingen verschillen |
| Complexe classificatie UI | Middel | Focus op top 30 GGZ-diagnoses, rest via zoeken |
| Performance bij grote codelijst | Laag | Client-side filtering + debounce |

---

## 8. Roadmap / Vervolg (Post-Prototype)

### Fase 2: DSM-5 Licentie
- Licentie afsluiten met Boom uitgevers
- DSM-5 beschrijvingen en criteria toevoegen
- Volledige DSM-5/ICD-10 mapping

### Fase 3: Verdieping
- Diagnose-overzicht patiënt-breed (over intakes)
- Versiebeheer diagnoses (audittrail)
- Comorbiditeit-visualisatie

### Fase 4: Compliance
- DBC/ZPM declaratie-integratie
- NEN 7510 logging
- Multi-disciplinaire validatie workflow (MDO)

---

## 9. Bijlagen & Referenties

### Bestaande documentatie
- FO Screening & Intake v1.0 (`docs/specs/screening-intake/fo-screening-intake-v1_0.md`)
- TO Mini EPD v1.2 (`docs/specs/to-mini-ecd-v1_2.md`)
- UX Stylesheet (`docs/specs/ux-stylesheet.md`)
- PRD AI Prefill Behandelplan (`docs/specs/ai-integratie/prd-ai-prefill-behandelplan-v1.md`)

### Bestaande implementatie
- `app/epd/patients/[id]/intakes/[intakeId]/diagnosis/` - Huidige diagnose-tab
- `lib/supabase/database.types.ts` - `conditions` tabel definitie
- `app/epd/patients/[id]/intakes/[intakeId]/actions.ts` - CRUD operaties

### Externe referenties
- [WHO-FIC Nederland - ICD-10/DSM-5 mapping](https://www.whofic.nl/dsm-5icd-10)
- [Zorgprestatiemodel - DSM-5 codelijst](https://www.zorgprestatiemodel.nl/aan-de-slag/downloads/)
- [ICD-10-GM codelijst](https://www.dimdi.de/dynamic/de/klassifikationen/icd/icd-10-gm/) (publiek domein)
- FHIR Condition Resource (R4)

---

## 10. Technische Uitgangspunten

### Database (bestaande `conditions` tabel)
```typescript
// Huidige velden (FHIR-inspired)
- code_code: string        // ICD-10 code (bijv. "F32.1")
- code_display: string     // ICD-10 beschrijving
- code_system: string      // 'ICD-10' (primair voor prototype)
- clinical_status: enum    // active | remission | resolved
- verification_status: enum // provisional | confirmed | entered-in-error
- severity_code: string
- severity_display: string
- onset_datetime: timestamp
- recorded_date: timestamp
- note: text
- patient_id: uuid
- encounter_id: uuid       // Gekoppelde intake
```

### Nieuwe velden (Prototype)
```typescript
- is_primary: boolean      // Hoofd- vs nevendiagnose
- dsm5_reference: text     // Optioneel: DSM-5 equivalent (vrije tekst)
```

### Statische data (JSON)
```typescript
// lib/data/icd10-ggz-codes.json
// Top ~50 GGZ-relevante ICD-10 codes met Nederlandse beschrijvingen
[
  { "code": "F32.0", "display": "Lichte depressieve episode", "category": "Depressie" },
  { "code": "F32.1", "display": "Matige depressieve episode", "category": "Depressie" },
  ...
]
```

### API Endpoints
```
GET  /api/diagnose/codes?q={search}  // Zoek ICD-10 codes (client-side fallback)
POST /api/diagnose/suggest           // AI suggesties (optioneel)
```

---

## 11. ICD-10 GGZ Code Subset (Prototype)

Focus op meest voorkomende GGZ-diagnoses (~50 codes). De ICD-10 codes zijn identiek aan DSM-5, alleen de beschrijvingen komen uit de WHO-classificatie (publiek domein).

| Categorie | ICD-10 Codes | Voorbeelden |
|-----------|--------------|-------------|
| **Depressieve stoornissen** | F32.x, F33.x | Depressieve episode (licht/matig/ernstig) |
| **Angststoornissen** | F40.x, F41.x | Sociale fobie, GAD, Paniekstoornis |
| **Trauma/stress** | F43.x | PTSS, Aanpassingsstoornis |
| **OCD** | F42.x | Obsessief-compulsieve stoornis |
| **Persoonlijkheid** | F60.x | Borderline, Antisociaal, Vermijdend |
| **Bipolair** | F31.x | Bipolaire stoornis |
| **ADHD** | F90.x | Aandachtstekortstoornis |
| **Autisme** | F84.x | Autismespectrumstoornis |
| **Eetstoornissen** | F50.x | Anorexia, Boulimia |

> **Opmerking:** Voor productie kunnen de volledige DSM-5 beschrijvingen worden toegevoegd na licentie-afsluiting.

---

## 12. AI Prompt Strategie (Optioneel)

### Diagnose-suggestie prompt
```
Je bent een klinisch ondersteuningssysteem voor GGZ-professionals.

CONTEXT:
- Intake notities: {intakeContent}
- Anamnese: {anamneseContent}

OPDRACHT:
Analyseer de informatie en geef maximaal 3 diagnose-suggesties met ICD-10 codes.

Per suggestie:
1. ICD-10 code en beschrijving
2. Onderbouwing met citaten uit de intake
3. Ernst-indicatie (licht/matig/ernstig)

BELANGRIJK:
- Dit zijn SUGGESTIES ter ondersteuning, geen diagnoses
- De clinicus neemt altijd de eindbeslissing
- Gebruik alleen ICD-10 codes uit de GGZ-subset (F-codes)
```

> **Prototype scope:** AI-suggesties zijn optioneel voor de eerste versie. Focus eerst op de handmatige invoer-flow.

---

*Document laatst bijgewerkt: 11-12-2024*
