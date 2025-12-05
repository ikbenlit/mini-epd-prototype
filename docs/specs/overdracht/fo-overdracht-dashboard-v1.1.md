# 🧩 Functioneel Ontwerp (FO) — Verpleegkundige Overdracht Dashboard

**Projectnaam:** Verpleegkundige Overdracht Dashboard  
**Versie:** v1.1 (met Dagregistratie Module)  
**Datum:** 05-12-2024  
**Auteur:** Colin Lit

---

## 1. Doel en relatie met het PRD

🎯 **Doel van dit document:**
Dit Functioneel Ontwerp beschrijft **hoe** het Overdracht Dashboard uit het PRD functioneel zal werken — wat de verpleegkundige ziet, doet en ervaart. Waar het PRD uitlegt *wat en waarom*, laat dit FO zien *hoe dit in de praktijk werkt*.

📘 **Relatie met PRD:**
- PRD-referentie: `prd-overdracht-dashboard-v1.md`
- Dit FO is de functionele uitwerking van PRD secties 3 (Kernfunctionaliteiten) en 4 (Gebruikersflows)

**Kernprincipe:**
> Elke getoonde informatie moet **traceerbaar** zijn naar de bron. De gebruiker moet kunnen zien waar data vandaan komt en kunnen doorklikken naar het originele record.

**Nieuw in v1.1:**
> **Dagregistratie Module** - Verpleegkundigen kunnen tijdens hun dienst snelle notities maken (medicatie, ADL, gedrag, incidenten) en markeren welke relevant zijn voor overdracht. Dit scheidt operationele dagregistratie van behandelrapportages die in het decursus komen.

---

## 2. Overzicht van de belangrijkste onderdelen

🎯 **Doel:** Kort overzicht van schermen en componenten binnen het Overdracht Dashboard.

| # | Onderdeel | Beschrijving | Route |
|---|-----------|--------------|-------|
| 1 | **Overdracht Overzicht** | Grid van alle patiënten voor vandaag | `/epd/overdracht/` |
| 2 | **Patiënt Detail** | Informatieblokken + AI samenvatting | `/epd/overdracht/[patientId]` |
| 3 | **Dagregistratie Module** | Snelle verpleegkundige notities met overdracht-markering | `/epd/dagregistratie/[patientId]` |
| 4 | **Vitale Functies Blok** | Metingen vandaag met trend indicators | Detail pagina |
| 5 | **Rapportages Blok** | Behandelrapportages (24u) met bronlinks | Detail pagina |
| 6 | **Dagnotities Blok** | Verpleegkundige registraties vandaag | Detail pagina |
| 7 | **Medicatie Blok** | Huidige medicatie *(placeholder)* | Detail pagina |
| 8 | **Risico's Blok** | Actieve risicotaxaties | Detail pagina |
| 9 | **AI Samenvatting Blok** | Gegenereerde overdracht met bronverwijzingen | Detail pagina |

---

## 3. User Stories

🎯 **Doel:** Beschrijven wat gebruikers moeten kunnen doen, vanuit hun perspectief.

### MVP User Stories (origineel)

| ID | Rol | Doel / Actie | Verwachte waarde | Prio |
|----|-----|--------------|------------------|------|
| **OD-US01** | Verpleegkundige | Overzicht zien van alle patiënten voor vandaag | Weet wie ik moet overdragen | 🔴 Hoog |
| **OD-US02** | Verpleegkundige | Filteren op patiënten met alerts | Focus op urgente cases | 🔴 Hoog |
| **OD-US03** | Verpleegkundige | Doorklikken naar patiënt detail | Zie alle relevante info | 🔴 Hoog |
| **OD-US04** | Verpleegkundige | Vitale functies zien met afwijkingen gemarkeerd | Direct zien wat er aan de hand is | 🔴 Hoog |
| **OD-US05** | Verpleegkundige | Recente rapportages lezen | Context voor overdracht | 🔴 Hoog |
| **OD-US06** | Verpleegkundige | Doorklikken naar originele rapportage | Bronverificatie | 🔴 Hoog |
| **OD-US07** | Verpleegkundige | Risico's zien met ernst-niveau | Weet wat aandacht nodig heeft | 🟡 Middel |
| **OD-US08** | Verpleegkundige | AI-samenvatting genereren | Snelle overdracht in 30 sec | 🔴 Hoog |
| **OD-US09** | Verpleegkundige | In AI-samenvatting bronnen zien | Weet waar info vandaan komt | 🔴 Hoog |
| **OD-US10** | Verpleegkundige | Vanuit AI-samenvatting doorklikken naar bron | Kan details checken | 🟡 Middel |

### Nieuwe User Stories (Dagregistratie)

| ID | Rol | Doel / Actie | Verwachte waarde | Prio |
|----|-----|--------------|------------------|------|
| **OD-US11** | Verpleegkundige | Tijdens dienst snelle notitie toevoegen | Registreer gebeurtenis direct | 🔴 Hoog |
| **OD-US12** | Verpleegkundige | Notitie categoriseren (medicatie/ADL/gedrag/incident) | Heldere structuur | 🔴 Hoog |
| **OD-US13** | Verpleegkundige | Markeren welke notities relevant zijn voor overdracht | Controle over wat gedeeld wordt | 🔴 Hoog |
| **OD-US14** | Verpleegkundige | Overzicht van dagnotities zien | Snel terugkijken wat er gebeurd is | 🔴 Hoog |
| **OD-US15** | Verpleegkundige | Dagnotitie bewerken/verwijderen | Correctie mogelijk | 🟡 Middel |
| **OD-US16** | Psychiater | Alleen relevante notities in overdracht zien | Geen informatie-overload | 🔴 Hoog |
| **OD-US17** | Psychiater | AI-samenvatting inclusief dagnotities | Compleet beeld van dienst | 🔴 Hoog |

---

## 4. Functionele werking per onderdeel

🎯 **Doel:** Per hoofdonderdeel beschrijven wat de gebruiker kan doen en wat het systeem doet.

### 4.1 Dagregistratie Module (NIEUW)

**Route:** `/epd/dagregistratie/[patientId]`

**Doel:** Snelle registratie tijdens dienst van operationele gebeurtenissen die relevant kunnen zijn voor overdracht, maar niet in het behandelverloop (decursus) horen.

**Functionaliteit:**

| Actie | Beschrijving | Systeem reactie |
|-------|--------------|-----------------|
| **Nieuwe notitie** | Klik "+ Registratie" | Toon quick-entry form |
| **Categorie selecteren** | Dropdown: Medicatie, ADL, Gedrag, Incident, Observatie | Icoon + kleurcodering |
| **Tijd instellen** | Standaard: nu, Aanpasbaar | Timestamp registratie |
| **Tekst invoeren** | Kort tekstveld (max 500 chars) | Autosave draft |
| **Overdracht markeren** | Checkbox "Opnemen in overdracht" | Badge in lijst |
| **Opslaan** | Submit form | Insert nursing_log, refresh lijst |
| **Bewerken** | Klik op notitie | Inline edit mode |
| **Verwijderen** | Trash icon | Confirm dialog → delete |

**UI Componenten:**

```
┌─────────────────────────────────────────┐
│ Dagregistratie - Jan de Vries           │
│ Donderdag 5 december 2024                │
├─────────────────────────────────────────┤
│ [+ Nieuwe registratie]    Filter: [Alle]│
├─────────────────────────────────────────┤
│                                          │
│ 14:30 🔴 Incident           [Overdracht] │
│ Verbale escalatie bij groepsactiviteit  │
│ Collega heeft de-escalatie gedaan       │
│ [Bewerken] [Verwijderen]                 │
│                                          │
│ 12:00 💊 Medicatie         [Overdracht]  │
│ Lithium geweigerd - "Voel me goed"      │
│ [Bewerken] [Verwijderen]                 │
│                                          │
│ 08:00 💊 Medicatie                       │
│ Olanzapine 10mg toegediend conform       │
│ [Bewerken] [Verwijderen]                 │
│                                          │
│ 07:30 🍽️ ADL                            │
│ Ontbijt volledig genuttigd               │
│ [Bewerken] [Verwijderen]                 │
│                                          │
└─────────────────────────────────────────┘
```

**Quick Entry Form:**

```
┌─────────────────────────────────────┐
│ Nieuwe registratie                   │
├─────────────────────────────────────┤
│ Categorie: [Incident ▼]             │
│   💊 Medicatie                       │
│   🍽️ ADL/verzorging                 │
│   👤 Gedragsobservatie               │
│   🔴 Incident                        │
│   📝 Algemene observatie             │
│                                      │
│ Tijd: [14:30] [Nu]                  │
│                                      │
│ Omschrijving:                        │
│ ┌─────────────────────────────────┐ │
│ │ Patiënt werd geprikkeld tijdens │ │
│ │ groepsactiviteit, verbale        │ │
│ │ escalatie. Collega heeft...      │ │
│ └─────────────────────────────────┘ │
│ 234 / 500 karakters                  │
│                                      │
│ ☑️ Opnemen in overdracht            │
│                                      │
│ [Annuleren]  [Opslaan]              │
└─────────────────────────────────────┘
```

**Data Flow:**

```
User input
    ↓
nursing_logs table
    ↓
Overdracht Detail (indien marked)
    ↓
AI Samenvatting (contextueel)
```

---

### 4.2 Overdracht Overzicht (`/epd/overdracht/`)

**Context:** Level 1 - Alle patiënten voor vandaag

[Rest blijft hetzelfde als origineel FO]

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│ EPD Sidebar │              Overdracht                           │
│             │                                                    │
│ ┌─────────┐ │ ┌──────────────────────────────────────────────┐ │
│ │Dashboard│ │ │ Overdracht                      🔴 3 alerts │ │
│ │─────────│ │ │ Donderdag 5 december 2024 · 8 patiënten     │ │
│ │Cliënten │ │ ├──────────────────────────────────────────────┤ │
│ │─────────│ │ │ [Alle patiënten (8)]  [Met alerts (3)]      │ │
│ │Agenda   │ │ ├──────────────────────────────────────────────┤ │
│ │─────────│ │ │                                              │ │
│ │►Overdracht│ │  ┌─────────  ┌─────────  ┌─────────         │ │
│ │─────────│ │ │  │ Jan V.  │  │ Marie K.│  │ Piet B. │       │ │
│ │Rapportage│ │ │  │ 🔴 2    │  │   OK    │  │ 🟡 1    │       │ │
│ └─────────┘ │ │  │ 67 jaar │  │ 45 jaar │  │ 52 jaar │       │ │
│             │ │  │ [→]     │  │ [→]     │  │ [→]     │       │ │
│             │ │  └─────────  └─────────  └─────────         │ │
└─────────────────────────────────────────────────────────────────┘
```

**Patiënt Card Inhoud:**

| Element | Toelichting |
|---------|-------------|
| Naam | Voornaam + initiaal achternaam |
| Alert badge | 🔴 Aantal hoog-risico items |
| Leeftijd | Berekend uit geboortedatum |
| Klik | → Navigeer naar detail pagina |

**Filter Functionaliteit:**

```typescript
// Pseudo-code
if (filter === 'met-alerts') {
  patients = patients.filter(p => 
    p.high_risk_count > 0 || 
    p.abnormal_vitals_count > 0 ||
    p.marked_nursing_logs > 0  // NIEUW
  )
}
```

---

### 4.3 Patiënt Detail (`/epd/overdracht/[patientId]`)

**Context:** Level 2 - specifieke patiënt overdracht informatie

**Layout (uitgebreid met Dagnotities blok):**

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Terug naar overzicht                                          │
├─────────────────────────────────────────────────────────────────┤
│ Jan de Vries                                                    │
│ ♂ 67 jaar · Depressieve stoornis, recidiverend                 │
├────────────────────────────────┬────────────────────────────────┤
│                                │                                │
│  ┌─ Vitale Functies ────────┐ │  ┌─ AI Samenvatting ────────┐ │
│  │ ...                       │ │  │                           │ │
│  └───────────────────────────┘ │  │  [Genereer samenvatting]  │ │
│                                │  │                           │ │
│  ┌─ Rapportages ─────────────┐ │  │  Samenvatting...          │ │
│  │ Behandelverslagen (24u)   │ │  │                           │ │
│  │ [3 rapportages]           │ │  │  Aandachtspunten:         │ │
│  └───────────────────────────┘ │  │  • Medicatie geweigerd    │ │
│                                │  │  • Incident vanmiddag     │ │
│  ┌─ Dagnotities ─────────────┐ │  │                           │ │  ← NIEUW
│  │ VPK registraties vandaag  │ │  │  Actiepunten:             │ │
│  │ [5 notities, 2 relevant]  │ │  │  • Bloeddruk checken      │ │
│  │ → [Dagregistratie]        │ │  │                           │ │
│  └───────────────────────────┘ │  └───────────────────────────┘ │
│                                │                                │
│  ┌─ Medicatie ───────────────┐ │                                │
│  │ [Placeholder]             │ │                                │
│  └───────────────────────────┘ │                                │
│                                │                                │
│  ┌─ Risico's ────────────────┐ │                                │
│  │ ...                       │ │                                │
│  └───────────────────────────┘ │                                │
│                                │                                │
└────────────────────────────────┴────────────────────────────────┘
```

---

### 4.4 Dagnotities Blok (NIEUW)

**Doel:** Toon relevante verpleegkundige registraties in overdracht context

**Inhoud:**

```
┌─ Dagnotities ─────────────────────────────────────┐
│ Verpleegkundige registraties vandaag               │
│                                                    │
│ 14:30 🔴 Incident                   [Overdracht]  │
│ Verbale escalatie bij groepsactiviteit            │
│ Collega heeft de-escalatie gedaan                 │
│ Bron: nursing_logs/789                            │
│                                                    │
│ 12:00 💊 Medicatie                  [Overdracht]  │
│ Lithium geweigerd - "Voel me goed"                │
│ Bron: nursing_logs/788                            │
│                                                    │
│ [Toon alle registraties (5)] → /dagregistratie/   │
└────────────────────────────────────────────────────┘
```

**Business Rules:**

| Regel | Implementatie |
|-------|---------------|
| Toon alleen gemarkeerde notities | `WHERE include_in_handover = true` |
| Sorteer chronologisch (nieuw → oud) | `ORDER BY timestamp DESC` |
| Max 5 items inline | Rest via link naar dagregistratie |
| Urgentie kleuren | 🔴 Incident > 💊 Medicatie > 👤 Gedrag > 🍽️ ADL |

---

## 5. Interacties met AI (functionele beschrijving)

🎯 **Doel:** Uitleggen waar AI in de flow voorkomt en wat de gebruiker ziet.

### 5.1 AI Overdracht Generator (uitgebreid)

| Aspect | Beschrijving |
|--------|--------------|
| **Locatie** | AI Samenvatting blok op patiënt detail pagina |
| **Trigger** | Klik op "Genereer samenvatting" button |
| **Input context** | Vitals (vandaag) + Reports (24u) + **Nursing Logs (marked)** + Risks (actief) + Conditions (actief) |
| **Processing** | ~3-5 seconden, progress indicator |
| **Output** | Samenvatting + aandachtspunten (met bronnen) + actiepunten |

### 5.2 AI Prompt Strategie (aangepast)

**System Prompt Kernpunten:**
- Rol: Ervaren verpleegkundige die overdrachten maakt
- Taal: Nederlands, zakelijk, beknopt
- Focus: Veranderingen, zorgen, actiepunten
- **Bronvermelding:** Bij elk aandachtspunt de databron vermelden
- **Nieuwe data:** Verwerk nursing_logs als operationele context

**Context Structuur voor AI (uitgebreid):**

```
PATIENT: [naam], [leeftijd] jaar

DIAGNOSES:
- [diagnose 1] (source: conditions/[id])
- [diagnose 2] (source: conditions/[id])

VITALE FUNCTIES (vandaag):
- Bloeddruk: 145/92 mmHg [VERHOOGD] (source: observations/[id], 14:30)
- Hartslag: 78 bpm [NORMAAL] (source: observations/[id], 14:30)

RAPPORTAGES (laatste 24u):
- [14:15] Voortgangsnotitie: "..." (source: reports/[id])
- [09:30] Contactmoment: "..." (source: reports/[id])

DAGREGISTRATIES (dienst vandaag, relevant voor overdracht):  ← NIEUW
- [14:30] [INCIDENT] Verbale escalatie bij groepsactiviteit... (source: nursing_logs/789)
- [12:00] [MEDICATIE] Lithium geweigerd - "Voel me goed" (source: nursing_logs/788)

RISICO'S:
- [HOOG] Suïcidaliteit: "..." (source: risk_assessments/[id])
- [MIDDEL] Zelfverwaarlozing: "..." (source: risk_assessments/[id])
```

**Expected Output (voorbeeld):**

```json
{
  "samenvatting": "67-jarige man met recidiverende depressie. Medicatie-therapietrouw problematisch vandaag (Lithium geweigerd), incident vanmiddag met verbale escalatie.",
  "aandachtspunten": [
    {
      "tekst": "Lithium medicatie geweigerd om 12:00 - patiënt geeft aan zich goed te voelen",
      "urgent": false,
      "bron": {
        "type": "dagnotitie",
        "id": "nursing-788",
        "datum": "05-12-2024 12:00",
        "label": "Medicatie registratie"
      }
    },
    {
      "tekst": "Incident 14:30 - verbale escalatie tijdens groepsactiviteit, de-escalatie door collega",
      "urgent": true,
      "bron": {
        "type": "dagnotitie",
        "id": "nursing-789",
        "datum": "05-12-2024 14:30",
        "label": "Incident registratie"
      }
    },
    {
      "tekst": "Bloeddruk verhoogd (145/92) - monitoring nodig",
      "urgent": false,
      "bron": {
        "type": "observatie",
        "id": "obs-456",
        "datum": "05-12-2024 14:30",
        "label": "Vitale functies"
      }
    }
  ],
  "actiepunten": [
    "Overleg arts over medicatie-weigering en compliance",
    "Bloeddruk controleren over 2 uur",
    "Evalueer triggers voor incident in behandelplan"
  ]
}
```

---

## 6. Database Schema (NIEUW)

🎯 **Doel:** Duidelijk maken welke nieuwe data-structuren nodig zijn.

### 6.1 Nieuwe Tabel: nursing_logs

```sql
CREATE TABLE nursing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Timing
  shift_date DATE NOT NULL,  -- Voor filtering per dienst
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Content
  category TEXT NOT NULL CHECK (category IN ('medicatie', 'adl', 'gedrag', 'incident', 'observatie')),
  content TEXT NOT NULL,  -- Max 500 chars in UI
  
  -- Overdracht
  include_in_handover BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_nursing_logs_patient ON nursing_logs(patient_id);
CREATE INDEX idx_nursing_logs_shift ON nursing_logs(shift_date);
CREATE INDEX idx_nursing_logs_handover ON nursing_logs(patient_id, include_in_handover);
```

**Verschil met reports tabel:**

| Aspect | reports | nursing_logs |
|--------|---------|--------------|
| **Doel** | Behandelverloof (decursus) | Operationele dagregistratie |
| **Lengte** | Lang (rich text) | Kort (max 500 chars) |
| **Levensduur** | Jaren | Dagen/weken |
| **In overdracht** | Soms | Frequent |
| **Gebruiker** | Behandelaar + VPK | Voornamelijk VPK |

---

## 7. Gebruikersflows (uitgebreid)

🎯 **Doel:** Laten zien hoe de gebruiker stap-voor-stap door het systeem gaat.

### Flow 1: Dagelijkse Overdracht (aangepast)

```
1. Verpleegkundige opent Overdracht pagina
2. Ziet grid van alle patiënten voor vandaag
3. Filtert eventueel op "Met alerts"
4. Klikt op patiënt voor detail view
5. Bekijkt informatieblokken:
   - Vitals
   - Behandelrapportages
   - Dagnotities (NIEUW)
   - Risico's
6. Klikt "Genereer samenvatting"
7. AI maakt beknopte overdracht (incl. dagnotities)
8. Verpleegkundige gebruikt samenvatting voor overdracht aan psychiater
```

### Flow 2: Registratie Tijdens Dienst (NIEUW)

```
1. Verpleegkundige tijdens dienst: gebeurtenis met patiënt
2. Opent Dagregistratie module voor die patiënt
3. Klikt "+ Nieuwe registratie"
4. Vult in:
   - Categorie (bijv. Incident)
   - Tijd (standaard: nu)
   - Omschrijving (kort, 2-3 zinnen)
   - ☑️ "Opnemen in overdracht"
5. Slaat op
6. Notitie verschijnt in lijst met [Overdracht] badge
7. Aan eind dienst: notitie automatisch in overdracht-view
```

### Flow 3: Psychiater Bekijkt Overdracht (NIEUW)

```
1. Psychiater opent Overdracht dashboard
2. Ziet lijst met patiënten waarvan VPK dienst had
3. Opent patiënt detail
4. Bekijkt Dagnotities blok:
   - Ziet alleen gemarkeerde items
   - Leest 2 incidenten + 1 medicatie-weigering
5. Klikt "Genereer samenvatting"
6. AI vat samen: "Vandaag 2 incidenten, medicatie geweigerd, verhoogde bloeddruk"
7. Psychiater bespreekt met VPK of patiënt
```

---

## 8. Gebruikersrollen en rechten

🎯 **Doel:** Beschrijven welke rollen toegang hebben.

### MVP: Uniform toegangsmodel

| Rol | Dagregistratie | Overdracht Dashboard | Beperkingen |
|-----|----------------|---------------------|-------------|
| Verpleegkundige | Volledige CRUD | Volledige functionaliteit | Alleen eigen patiënten |
| Psychiater | Read-only | Volledige functionaliteit | Alleen eigen patiënten |

### Data Scoping (uitgebreid)

- **Patiënten:** Gefilterd op actieve encounters vandaag
- **Reports:** Gefilterd op `created_by` of team-toegang
- **Nursing Logs:** Gefilterd op shift_date (vandaag) en `created_by`
- **Risico's:** Via intake → patient relatie

---

## 9. Niet in Scope (aangepast)

🎯 **Doel:** Duidelijk maken wat (nog) niet wordt gebouwd.

| Feature | Reden exclusie |
|---------|----------------|
| Medicatie-invoer | Alleen weergave, CRUD is aparte module |
| Templating dagnotities | Vrije tekst is sneller voor MVP |
| Historische dagnotities | Alleen vandaag, archivering later |
| Multi-afdeling view | Te complex voor MVP, alleen eigen patiënten |
| Historische trends | Geen grafieken of lange termijn overzichten |
| Notificaties/push | Geen realtime alerts |
| Print/export | Geen PDF of print functionaliteit |
| Rechten per rol | Beperkt onderscheid VPK/arts (komt later) |
| Metingen invoer | Aparte functionaliteit, hier alleen weergave |
| Dicteer-functie | Typen is snel genoeg voor korte notities |

---

## 10. Succescriteria (uitgebreid)

🎯 **Doel:** Objectieve meetlat voor een geslaagde oplevering.

- [ ] Overzicht laadt binnen 2 seconden
- [ ] Patiënt detail toont alle 6 informatieblokken correct (incl. dagnotities)
- [ ] Dagregistratie form submit < 1 seconde
- [ ] AI samenvatting genereert binnen 5 seconden
- [ ] AI output is begrijpelijk en medisch relevant
- [ ] AI integreert dagnotities correct in samenvatting
- [ ] Navigatie tussen overzicht, detail en dagregistratie werkt vlot
- [ ] Alerts (hoog risico, afwijkende vitals, markeerde notities) zijn direct zichtbaar
- [ ] Empty states bij ontbrekende data zijn informatief
- [ ] Dagnotities met [Overdracht] badge zijn duidelijk herkenbaar

---

## 11. Risico's & Mitigatie (uitgebreid)

🎯 **Doel:** Risico's vroeg signaleren en plannen hoe ermee om te gaan.

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| AI samenvatting te lang/vaag | Hoog | Strikte prompt met max lengte, testen met echte data |
| Geen vitale functies in systeem | Middel | Graceful empty state, instructie om metingen toe te voegen |
| Medicatie tabel bestaat niet | Middel | Placeholder blok met "Binnenkort beschikbaar" |
| Performance bij veel patiënten | Middel | Parallel queries, pagination indien nodig |
| Risico's gekoppeld aan intake ipv patient | Laag | Query via intake tabel |
| VPK vergeet notities markeren | Hoog | AI pre-selectie als backup |
| Dubbele registratie (reports + nursing_logs) | Middel | Duidelijke UI scheiding + training |
| Nursing_logs niet archiveren | Laag | Auto-delete na 30 dagen (fase 2) |

---

## 12. Roadmap / Vervolg (Post-MVP)

🎯 **Doel:** Richting geven aan toekomstige uitbreidingen.

| Fase | Feature | Beschrijving |
|------|---------|--------------|
| 2 | Medicatie module | Volledige CRUD voor medicatie, koppeling met nursing_logs |
| 3 | Templates dagnotities | Snelle keuzes: "Medicatie conform", "Eetpatroon normaal" |
| 4 | Archivering | Auto-delete nursing_logs > 30 dagen, export naar archief |
| 5 | Trend grafieken | Vitale functies over tijd |
| 6 | PDF export | Formele overdracht documenten |
| 7 | Agenda integratie | Koppeling met encounters/afspraken |
| 8 | Notificaties | Alerts bij kritieke waarden |
| 9 | Multi-afdeling | Overzicht meerdere afdelingen |
| 10 | Spraak-naar-tekst | Dicteer dagnotities (Deepgram integratie) |

---

## 13. Bijlagen & Referenties

🎯 **Doel:** Linken naar gerelateerde documenten.

### Interne Documenten

| Document | Status |
|----------|--------|
| PRD Overdracht Dashboard v1.0 | ✅ Gereed |
| FO Overdracht Dashboard v1.1 | ✅ Gereed (dit document) |
| TO Overdracht Dashboard | 📋 Nog te schrijven |
| UX Stylesheet | ✅ Beschikbaar |

### Database Tabellen (uitgebreid)

| Tabel | Velden gebruikt | Nieuw? |
|-------|-----------------|--------|
| `nursing_logs` | id, patient_id, shift_date, timestamp, category, content, include_in_handover, created_by | ✅ Ja |
| `observations` | id, patient_id, code_display, value_quantity_value, interpretation_code, effective_datetime | Bestaand |
| `reports` | id, patient_id, type, content, created_at, created_by | Bestaand |
| `risk_assessments` | id, intake_id, risk_type, risk_level, rationale, measures, assessment_date | Bestaand |
| `conditions` | id, patient_id, code_display, clinical_status | Bestaand |
| `patients` | id, name_given, name_family, birth_date, gender | Bestaand |
| `encounters` | id, patient_id, period_start, type_display | Bestaand |

### Externe Referenties

| Bron | Gebruik |
|------|---------|
| shadcn/ui | Card, Button, Badge, Form components |
| Lucide React | Icons (Pill, Utensils, User, AlertTriangle) |
| Anthropic Claude API | AI samenvatting generatie |
| Supabase RLS | Row-level security voor nursing_logs |

### UI Component Hergebruik

| Component | Locatie | Hergebruik voor |
|-----------|---------|-----------------|
| Quick Entry Form | Rapportage module | Nursing logs form |
| Badge component | Risico's | Overdracht marker |
| Card layout | Behandelplan | Informatie blokken |
| AI Button | Behandelplan | Genereer samenvatting |

---

## Changelog

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.1 | 05-12-2024 | Colin | Dagregistratie module toegevoegd, nursing_logs tabel, uitgebreide flows |
| v1.0 | 05-12-2024 | Colin | Initieel FO met focus op traceerbaarheid en bronvermelding |

---

**Einde Functioneel Ontwerp - Overdracht Dashboard v1.1**
