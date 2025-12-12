# 🧩 Functioneel Ontwerp (FO) – Diagnose Module

**Projectnaam:** Diagnose Module - Mini EPD
**Versie:** v1.1
**Datum:** 11-12-2024
**Auteur:** Colin Lit

---

## 1. Doel en relatie met het PRD

🎯 **Doel van dit document:**
Het Functioneel Ontwerp beschrijft **hoe** de diagnosemodule in de praktijk werkt voor GGZ-professionals. Dit document vertaalt de requirements uit het PRD naar concrete schermen, acties en interacties.

📘 **Toelichting aan de lezer:**
Dit FO beschrijft de diagnose-functionaliteit voor het prototype met **ICD-10 classificatie** (publiek domein) als basis en optionele DSM-5 referentie. De focus ligt op een eenvoudige, werkende flow voor demo-doeleinden.

**Relatie met PRD:**
Dit FO implementeert de requirements uit `prd-diagnose-module-v1.md` (v1.1), specifiek:
- ICD-10 classificatie browser (PRD 3.1)
- Diagnose registratie met DSM-5 referentieveld (PRD 3.2)
- AI-ondersteuning (PRD 3.3) — optioneel voor prototype

> **Licentie-opmerking:** DSM-5 vereist licentie. Dit prototype gebruikt ICD-10 (publiek domein).

---

## 2. Overzicht van de belangrijkste onderdelen

1. **Diagnose Tab** (binnen Intake) — Hoofdlocatie voor diagnose-registratie
2. **ICD-10 Code Zoeken** — Autocomplete met GGZ-subset (~50 codes)
3. **Diagnose Invoer Modal** — Formulier voor nieuwe/bewerken diagnose
4. **Diagnose Detail Card** — Weergave per geregistreerde diagnose
5. *(Optioneel)* **AI Diagnose Assistent** — Suggesties op basis van intake

---

## 3. Userstories (Prototype)

| ID | Rol | Doel / Actie | Verwachte waarde | Prioriteit |
|----|------|---------------|------------------|-------------|
| US-01 | Psycholoog | ICD-10 code zoeken op beschrijving | Snel juiste code vinden | Hoog |
| US-02 | Psycholoog | ICD-10 code zoeken op code (F32) | Direct navigeren bij bekende code | Hoog |
| US-03 | Psycholoog | Hoofddiagnose markeren | Duidelijke prioritering | Hoog |
| US-04 | Psycholoog | Nevendiagnose(s) toevoegen | Comorbiditeit vastleggen | Hoog |
| US-05 | Psycholoog | Ernst classificeren | Behandelniveau bepalen | Hoog |
| US-06 | Psycholoog | DSM-5 referentie toevoegen | Eigen notatie mogelijk | Middel |
| US-07 | Psycholoog | Onderbouwing vastleggen | Klinische redenering documenteren | Middel |
| US-08 | Psycholoog | Diagnose bewerken/verwijderen | Correcties doorvoeren | Hoog |
| US-09 | Systeem | Diagnoses tonen in overdracht | Relevante info voor collega's | Hoog |

---

## 4. Functionele werking per onderdeel

### 4.1 Diagnose Tab (binnen Intake)

**Locatie:** `/epd/patients/[id]/intakes/[intakeId]/diagnosis`

**Schermopbouw:**
```
┌─────────────────────────────────────────────────────────────┐
│ Diagnoses                                                    │
│ Registreer DSM-5 diagnoses gekoppeld aan deze intake.       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─ Hoofddiagnose ────────────────────────────────────────┐  │
│ │ F32.1 — Depressieve stoornis, matig          [Bewerk]  │  │
│ │ Ernst: Matig | Status: Actief | 15 nov 2024            │  │
│ │ "Voldoet aan 6/9 criteria, significant functioneel..." │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌─ Nevendiagnose ────────────────────────────────────────┐  │
│ │ F41.1 — Gegeneraliseerde angststoornis       [Bewerk]  │  │
│ │ Ernst: Licht | Status: Actief | 15 nov 2024            │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ [+ Nieuwe diagnose]              [AI › Analyseer intake]    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Functionaliteit:**

**Diagnoselijst:**
- Toont alle diagnoses gekoppeld aan deze intake
- Hoofddiagnose bovenaan met visuele markering (badge/border)
- Per diagnose: code, beschrijving, ernst, status, datum
- Optionele notitie ingeklapt, uitklappen via chevron
- Acties per kaart: Bewerk, Verwijder

**Lege staat:**
- Tekst: "Nog geen diagnoses geregistreerd."
- Prominente [+ Nieuwe diagnose] knop

**Acties:**
- [+ Nieuwe diagnose] → Opent diagnose-invoer modal
- [AI › Analyseer intake] → Start AI-analyse, toont suggesties

---

### 4.2 Diagnose Invoer Modal

**Trigger:** Klik op [+ Nieuwe diagnose] of [Bewerk]

**Schermopbouw:**
```
┌─────────────────────────────────────────────────────────────┐
│ Nieuwe diagnose                                      [✕]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ICD-10 Code *                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔍 Zoek op code of beschrijving...                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─ Veelgebruikt ─────────────────────────────────────────┐  │
│ │ F32.1  Matige depressieve episode                      │  │
│ │ F41.1  Gegeneraliseerde angststoornis                  │  │
│ │ F43.1  Posttraumatische stressstoornis                 │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ Ernst *                          Diagnose type              │
│ ┌──────────────────────┐        ┌──────────────────────┐   │
│ │ Matig            ▼   │        │ ○ Hoofddiagnose      │   │
│ └──────────────────────┘        │ ● Nevendiagnose      │   │
│                                  └──────────────────────┘   │
│                                                              │
│ Status                                                      │
│ ┌──────────────────────┐                                   │
│ │ Actief           ▼   │                                   │
│ └──────────────────────┘                                   │
│                                                              │
│ DSM-5 referentie (optioneel)                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Major Depressive Disorder, moderate                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Onderbouwing / Notities                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Patiënt presenteert met sombere stemming, verminderde  │ │
│ │ interesse en slaapproblemen sinds 3 maanden...          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│                              [Annuleren]  [Opslaan]         │
└─────────────────────────────────────────────────────────────┘
```

**Velden:**

| Veld | Type | Verplicht | Opties/Validatie |
|------|------|-----------|------------------|
| ICD-10 Code | Autocomplete | Ja | Zoeken in ~50 GGZ codes |
| Ernst | Dropdown | Ja | Licht, Matig, Ernstig |
| Diagnose type | Radio | Ja | Hoofddiagnose, Nevendiagnose |
| Status | Dropdown | Ja | Actief, In remissie, Opgelost |
| DSM-5 referentie | Text input | Nee | Vrije tekst voor DSM-5 equivalent |
| Onderbouwing | Textarea | Nee | Max 500 tekens |

**Gedrag:**
- Bij invoer in zoekveld: live filtering van ICD-10 codelijst
- Selectie code: vult automatisch beschrijving in
- Bij wijzigen bestaande: velden voorgevuld
- Validatie: minimaal code + ernst verplicht
- Maximaal 1 hoofddiagnose per intake (toggle andere om bij selectie)

---

### 4.3 ICD-10 Code Zoeken (Inline Autocomplete)

**Trigger:** Focus op code-zoekveld in modal

**Gedrag:**
Voor het prototype gebruiken we een eenvoudige inline autocomplete in plaats van een aparte browser/drawer.

```
┌─────────────────────────────────────────────────────────────┐
│ ICD-10 Code *                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ depre                                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ F32.0  Lichte depressieve episode                      │ │
│ │ F32.1  Matige depressieve episode                  ←   │ │
│ │ F32.2  Ernstige depressieve episode zonder psychose    │ │
│ │ F32.3  Ernstige depressieve episode met psychose       │ │
│ │ F33.0  Recidiverende depressie, lichte episode         │ │
│ │ F33.1  Recidiverende depressie, matige episode         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Functionaliteit:**

**Zoeken:**
- Zoekt op code (F32, F41.1) en beschrijving (depressie, angst)
- Client-side filtering van ~50 GGZ codes
- Debounce 200ms
- Max 8 resultaten in dropdown

**Snelkeuze (bij leeg veld):**
- Toon top 5 veelgebruikte GGZ-diagnoses
- Depressie (F32.1), Angst (F41.1), PTSS (F43.1), etc.

**Selectie:**
- Klik of Enter: selecteert code, vult beschrijving in
- Escape: sluit dropdown

---

### 4.4 AI Diagnose Assistent (Optioneel - Post-MVP)

> **Prototype scope:** AI-suggesties zijn optioneel voor de eerste versie. Focus eerst op de handmatige invoer-flow. Onderstaande specificatie is voor een latere iteratie.

**Trigger:** Klik op [AI › Analyseer intake]

**Schermopbouw (indien geïmplementeerd):**
```
┌─────────────────────────────────────────────────────────────┐
│ AI Diagnose Suggesties                               [✕]    │
├─────────────────────────────────────────────────────────────┤
│ ⚠️ Dit zijn suggesties ter ondersteuning. De clinicus      │
│    neemt altijd de eindbeslissing.                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─ Suggestie 1 ──────────────────────────────────────────┐  │
│ │ F32.1 — Matige depressieve episode                     │  │
│ │                                                         │  │
│ │ Onderbouwing:                                          │  │
│ │ • "Patiënt meldt al 3 maanden somber te zijn"          │  │
│ │ • "Verminderde interesse in dagelijkse activiteiten"   │  │
│ │                                                         │  │
│ │ [Overnemen]                                            │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌─ Suggestie 2 ──────────────────────────────────────────┐  │
│ │ F41.1 — Gegeneraliseerde angststoornis                 │  │
│ │ ...                                                     │  │
│ │ [Overnemen]                                            │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Vereenvoudigde flow voor prototype:**
- Input: intake-notities + anamnese
- Output: 2-3 ICD-10 suggesties met onderbouwing
- Actie: [Overnemen] opent modal met voorgevulde code

---

### 4.5 Diagnose Overzicht (Post-MVP)

> **Prototype scope:** Patiënt-breed diagnose-overzicht is post-MVP. Voor het prototype zijn diagnoses alleen zichtbaar binnen de intake waar ze zijn geregistreerd.

**Toekomstige locatie:** `/epd/patients/[id]/diagnoses`

Voor nu volstaat de diagnose-tab binnen de intake.

---

### 4.6 Diagnose Detail Card

**Component voor weergave in lijsten:**

```
┌─────────────────────────────────────────────────────────────┐
│ F32.1 — Depressieve stoornis, matig            HOOFD  [⋮]  │
├─────────────────────────────────────────────────────────────┤
│ Ernst: Matig        Status: Actief        15 nov 2024      │
├─────────────────────────────────────────────────────────────┤
│ ▼ Onderbouwing                                              │
│ Patiënt voldoet aan 6 van de 9 DSM-5 criteria voor een     │
│ depressieve episode. Significant functioneel verlies op     │
│ werk en in sociale relaties.                                │
└─────────────────────────────────────────────────────────────┘
```

**Elementen:**
- Code + beschrijving (altijd zichtbaar)
- Type badge: HOOFD (groen) of geen (nevendiagnose)
- Status badge: kleurcodering per status
- Ernst, status, datum regel
- Onderbouwing: standaard ingeklapt, uitklappen via chevron
- Context menu [⋮]: Bewerk, Status wijzigen, Verwijderen

**Status kleuren:**
| Status | Badge kleur |
|--------|-------------|
| Actief | Groen |
| In remissie | Blauw |
| Opgelost | Grijs |
| Ingevoerd-in-fout | Rood/doorgestreept |

---

## 5. UI-overzicht (visuele structuur)

### Diagnose Tab Layout (Prototype)
```
┌─────────────────────────────────────────────────────────────────────┐
│ [← Terug naar intake]                              Jan de Vries     │
├─────────────────────────────────────────────────────────────────────┤
│ Contacts │ Kindcheck │ Risico │ Anamnese │ Onderzoek │ DIAGNOSE │ Advies │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Diagnoses                                                          │
│  Registreer diagnoses gekoppeld aan deze intake.                    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ [Diagnose Card - Hoofddiagnose]                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ [Diagnose Card - Nevendiagnose]                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  [+ Nieuwe diagnose]                                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

> **Prototype:** De [AI › Analyseer intake] knop is optioneel en kan in een latere iteratie worden toegevoegd.

---

## 6. Interacties met AI (Optioneel - Post-MVP)

> **Prototype scope:** AI-functionaliteit is optioneel voor de eerste versie. Onderstaande tabel beschrijft de beoogde functionaliteit voor een latere iteratie.

| Locatie | AI-actie | Trigger | Output |
|---------|----------|---------|--------|
| Diagnose Tab | Analyseer intake | Klik [AI › Analyseer] | 2-3 ICD-10 suggesties met onderbouwing |

**Vereenvoudigde flow:**
1. Gebruiker klikt [AI › Analyseer intake]
2. Systeem analyseert intake-notities + anamnese
3. Toont 2-3 ICD-10 suggesties met citaten
4. Gebruiker klikt [Overnemen] → opent modal met voorgevulde code

---

## 7. Gebruikersrollen en rechten (Prototype)

| Rol | Toegang | Acties |
|-----|---------|--------|
| Demo-user | Alle patiënten | Volledig CRUD |

> **Prototype:** Geen rollen-onderscheid. Alle gebruikers hebben volledige toegang tot demo-data.

---

## 8. States en Feedback

### Lege staten
| Context | Weergave |
|---------|----------|
| Geen diagnoses | "Nog geen diagnoses geregistreerd." + [+ Nieuwe diagnose] |
| Geen zoekresultaten | "Geen codes gevonden voor '{query}'" |

### Succes feedback
| Actie | Feedback |
|-------|----------|
| Diagnose opgeslagen | Toast: "Diagnose opgeslagen" |
| Diagnose verwijderd | Toast: "Diagnose verwijderd" |

### Error feedback
| Fout | Weergave |
|------|----------|
| Opslaan mislukt | Inline error |
| Validatiefout | Inline onder veld |

---

## 9. Bijlagen & Referenties

### Gerelateerde documenten
- PRD Diagnose Module v1.1 (`docs/specs/diagnose/prd-diagnose-module-v1.md`)
- FO Screening & Intake (`docs/specs/screening-intake/fo-screening-intake-v1_0.md`)
- UX Stylesheet (`docs/specs/ux-stylesheet.md`)

### Bestaande implementatie
- `app/epd/patients/[id]/intakes/[intakeId]/diagnosis/` — Huidige diagnose-tab
- `app/epd/patients/[id]/intakes/[intakeId]/actions.ts` — Server actions
- `lib/supabase/database.types.ts` — conditions tabel

### Component referenties
- shadcn/ui: Dialog, Command (voor autocomplete), Badge, Card
- Lucide icons: Search, Plus, ChevronDown

### Externe bronnen
- [WHO-FIC Nederland - ICD-10/DSM-5 mapping](https://www.whofic.nl/dsm-5icd-10)
- [ICD-10-GM codelijst](https://www.dimdi.de/dynamic/de/klassifikationen/icd/icd-10-gm/) (publiek domein)

---

*Document laatst bijgewerkt: 11-12-2024*
