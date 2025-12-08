# Release Notes: Verpleegkundige Rapportage & Overdracht Module

**Versie:** 1.0
**Datum:** 8 december 2025
**Module:** Verpleegrapportage

---

## Samenvatting

Deze release introduceert een volledig vernieuwde module voor verpleegkundige rapportage met geïntegreerde overdrachtsfunctionaliteit. De module biedt verpleegkundigen een efficiënte werkwijze voor het vastleggen van zorgnotities, het voorbereiden van overdrachten en het genereren van AI-gestuurde samenvattingen.

---

## Nieuwe Functionaliteiten

### 1. Verpleegrapportage Overzicht

**Route:** `/epd/verpleegrapportage`

Een master-detail scherm met patiëntenlijst en detailweergave:

- **Patiëntenlijst** met alertindicatoren:
  - Aantal hoge risico's (rood)
  - Aantal gemarkeerde overdrachtsnotities (groen)
  - Filter op "Alle" of "Met alerts"

- **Detailweergave per patiënt:**
  - Compacte header met naam, leeftijd en geslacht
  - Prominente weergave van hoge risico's bovenaan
  - Incidentwaarschuwingen
  - Rapportages timeline
  - AI Samenvatting sidebar

- **Periodeselectie:** 1 dag, 3 dagen, 7 dagen, 14 dagen

---

### 2. Zorgnotities Module

**Route:** `/epd/verpleegrapportage/zorgnotities`

Centrale werkplek voor het invoeren en beheren van verpleegkundige notities:

#### Ronde Overzicht
- Sidebar met alle patiënten van de ronde
- Per patiënt: aantal notities en overdrachtsnotities
- Risico-indicator voor hoog-risico patiënten
- Snelle selectie door klikken

#### Invoerformulier
- **5 categorieën:** Medicatie, ADL/verzorging, Gedragsobservatie, Incident, Algemene observatie
- Compacte textarea met karakterteller (max 500)
- Tijdstip aanpasbaar (standaard: huidige tijd)
- **Overdracht toggle** - markeer notities voor overdracht
- Directe verzending met Send-knop

#### Timeline Weergave
- Groepering per dag (Vandaag, Gisteren, datum)
- Groepering per dagdeel met iconen:
  - 🌙 Nacht (00:00-07:00)
  - 🌅 Ochtend (07:00-12:00)
  - ☀️ Middag (12:00-17:00)
  - 🌇 Avond (17:00-24:00)
- **Inline bewerken** - wijzig categorie, inhoud en overdrachtstatus
- **Verwijderen** met bevestigingsmelding
- **Quick toggle** - overdracht aan/uit zonder edit mode

---

### 3. AI Samenvatting voor Overdracht

Gegenereerd door Claude AI op basis van alle beschikbare patiëntgegevens:

- **Beknopte samenvatting** (1-2 zinnen)
- **Aandachtspunten** (max 5) met:
  - Urgentievlag voor kritieke items
  - Bronverwijzing (type, datum, label)
- **Actiepunten** (max 3) voor de volgende dienst
- Generatietijd en -duur zichtbaar
- Ververs-knop voor nieuwe generatie

---

### 4. Rapportages Timeline

Uniforme tijdlijn voor alle rapportagetypen:

- **Rapportagetypen in de database:**
  - **Verpleegkundig** - Korte notities (max 500 tekens) met categorieën in `structured_data.category`
  - **Andere types** - Langere rapportages (20-5000 tekens): Voortgang, Observatie, Incident, Medicatie, Contact, Crisis, Intake, Behandeladvies, Vrije notitie

- **Structuur:**
  - `reports.type` - Database kolom met CHECK constraint (10 mogelijke waarden)
  - `structured_data.category` - Alleen voor type='verpleegkundig' (medicatie, adl, gedrag, incident, observatie)
  - De categorieën zijn labels/subcategorieën binnen verpleegkundige notities

- **Visuele kenmerken:**
  - Kleurcodering per type
  - Categorie-badges voor verpleegkundige notities (uit structured_data)
  - Overdracht-indicator (✓)
  - Tijdstip per item
  - Auteur indien beschikbaar

---

### 5. Risico Weergave

Prominente weergave van actieve risico's:

- **Risicotypen:** Valrisico, Decubitus, Ondervoeding, Delier, Infectie, Suïcidaliteit, Agressie, Dwalen
- **Risiconiveaus:** Zeer hoog, Hoog, Gemiddeld, Laag
- Kleurcodering: rood (hoog/zeer hoog), oranje (gemiddeld), groen (laag)
- Rationale/toelichting per risico

---

## API Endpoints

### Reports API (`/api/reports`)

| Methode | Endpoint | Beschrijving |
|---------|----------|--------------|
| GET | `/api/reports` | Ophalen rapportages met filters |
| POST | `/api/reports` | Nieuwe rapportage aanmaken |
| PATCH | `/api/reports/[id]` | Rapportage bijwerken |
| DELETE | `/api/reports/[id]` | Rapportage verwijderen (soft-delete) |

**Query parameters GET:**
- `patientId` - Patient UUID (verplicht)
- `type` - Filter op enkel type
- `types` - Kommagescheiden lijst van types
- `startDate`, `endDate` - Datumbereik (YYYY-MM-DD)
- `includeInHandover` - Filter op overdrachtsmarkering

### Overdracht API (`/api/overdracht`)

| Methode | Endpoint | Beschrijving |
|---------|----------|--------------|
| GET | `/api/overdracht/patients` | Patiënten met activiteit |
| GET | `/api/overdracht/[patientId]` | Patiënt detail voor overdracht |
| POST | `/api/overdracht/generate` | Genereer AI samenvatting |

---

## Technische Details

### Dienstdatum Berekening
Notities aangemaakt vóór 07:00 worden toegewezen aan de vorige dag (nachtdienst logica).

### Soft-Delete
Verwijderde rapportages worden niet definitief verwijderd maar gemarkeerd met `deleted_at` timestamp voor audit trail.

### Categorieën in Structured Data
Verpleegkundige notities (type='verpleegkundig') slaan de categorie op in `structured_data.category` als een label/subcategorie. Dit is anders dan de `type` kolom:
- **`type`** - Database constraint met 10 mogelijke waarden (rapportagetypen)
- **`structured_data.category`** - Alleen voor verpleegkundige notities (medicatie, adl, gedrag, incident, observatie)

In de praktijk zijn er twee hoofdcategorieën:
1. Verpleegkundige notities (type='verpleegkundig') - korte notities met categorie-labels
2. Andere rapportages - langere rapportages zonder categorie-labels

### AI Integratie
- Model: Claude Sonnet (claude-sonnet-4-20250514)
- Validatie: Zod schema voor gestructureerde output
- Logging: AI events worden opgeslagen voor monitoring

---

## Migratie

### Van nursing_logs naar reports
De voormalige `nursing_logs` tabel is geconsolideerd naar de `reports` tabel met `type='verpleegkundig'`. Dit zorgt voor:
- Uniforme API voor alle rapportagetypen
- Consistente filtering en weergave
- Vereenvoudigde queries

---

## Bekende Beperkingen

- Vitale functies module is voorbereid maar nog niet actief
- Offline werken wordt nog niet ondersteund
- PDF export van samenvattingen is gepland voor volgende release

---

## Screenshots

### Verpleegrapportage Overzicht
```
┌──────────────────┬─────────────────────────────────────────┐
│ Patiënten (5)    │ Jan de Vriesh         [badges] [Dossier]│
│                  ├─────────────────────────────────────────┤
│ ⚠️ Jan de Vriesh │ ⚠️ Hoge risico's (1)                    │
│    Colin Lit     │    Hoog | suïcidaliteit                 │
│    ...           ├─────────────────────────────────────────┤
│                  │ Rapportages      │ AI Samenvatting      │
│                  │ Vandaag          │ Gegenereerd met      │
│                  │ 🌙 Avond         │ Claude AI            │
│                  │ • 22:10 Incident │                      │
│                  │ • 21:57 Observ.  │ [Genereer]           │
└──────────────────┴─────────────────┴──────────────────────┘
```

---

## Feedback

Voor vragen of feedback over deze module, neem contact op met het ontwikkelteam.
