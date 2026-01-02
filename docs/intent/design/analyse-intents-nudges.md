# 📊 Analyse: Intents & Nudges — Cortex V2

**Datum:** 01-01-2026  
**Status:** Analyse voor MVP uitbreiding  
**Auteur:** Colin Lit (met AI-assistentie)

---

## 1. Samenvatting

Dit document bevat een uitgebreide analyse van:
- De huidige geïmplementeerde intents en nudges in Cortex V2
- De EPD-functionaliteit die beschikbaar is voor nudge triggers
- Aanbevelingen voor nieuwe nudges gebaseerd op zorgprotocollen
- **Nieuw:** Analyse van query/overzicht intents voor rapportages, behandelplannen en risico's

**Conclusies:**
1. De huidige 7 intents dekken basis acties, maar missen **query/overzicht** functionaliteit
2. Er worden 7 nieuwe nudges aanbevolen om de "proactieve AI collega" beter te demonstreren
3. Er worden 4 nieuwe query intents aanbevolen voor overzichten (rapportages, behandelplan, risico's, dashboard)

---

## 2. Huidige Implementatie

### 2.1 Intents (7 + unknown)

| Intent | Nederlands Label | UI Block | Categorie | Status |
|--------|-----------------|----------|-----------|--------|
| `dagnotitie` | Notitie | ✅ `dagnotitie-block.tsx` | Actie | Volledig |
| `zoeken` | Patiënt zoeken | ✅ `zoeken-block.tsx` | Query | Volledig |
| `overdracht` | Overdracht | ✅ `overdracht-block.tsx` | Query | Volledig |
| `agenda_query` | Agenda | ⚠️ Via artifact | Query | Basis |
| `create_appointment` | Nieuwe afspraak | ⚠️ Via artifact | Actie | Basis |
| `cancel_appointment` | Afspraak annuleren | ⚠️ Via artifact | Actie | Basis |
| `reschedule_appointment` | Afspraak verzetten | ⚠️ Via artifact | Actie | Basis |
| `unknown` | Fallback | — | — | N.v.t. |

**Locatie:** `lib/cortex/types.ts`

### 2.2 Overzicht Mogelijkheden (Query Intents)

#### ✅ Wat WEL via spraak bereikbaar is

| Intent | Input Voorbeeld | Output |
|--------|-----------------|--------|
| `agenda_query` | "Agenda vandaag", "Afspraken deze week" | `AgendaListView` - lijst van afspraken met periode filter |
| `overdracht` | "Overdracht", "Samenvatting" | `OverdrachtBlock` - AI-samenvatting per patiënt met aandachtspunten |
| `zoeken` | "Zoek Jan", "Wie is Marie" | `ZoekenBlock` - patiënt zoekresultaten |

De **OverdrachtBlock** is krachtig:
- Genereert AI-samenvatting per patiënt
- Toont aandachtspunten met bronverwijzingen
- Toont actiepunten
- Filterbaar per periode (1d, 3d, 7d, 14d)
- Filterbaar per rol (verpleegkundige/psychiater)

#### ❌ Wat NIET via spraak bereikbaar is

| Gewenste Input | Huidige Status | Bestaande UI |
|----------------|----------------|--------------|
| "Toon rapportages van Jan" | ❌ Geen intent | `app/epd/patients/[id]/rapportage/` bestaat |
| "Wat is het behandelplan van Jan?" | ❌ Geen intent | `components/behandelplan/` bestaat |
| "Wat zijn de risico's van Jan?" | ❌ Geen intent | `RisksBlock` in verpleegrapportage bestaat |
| "Overzicht Jan" / "Dashboard Jan" | ❌ Geen intent | ✅ `PatientDashboardBlock` bestaat maar niet bereikbaar!

### 2.3 Nudges (2 protocol rules)

| ID | Naam | Trigger | Suggestie | Priority |
|----|------|---------|-----------|----------|
| `wondzorg-controle` | Wondcontrole na verzorging | `dagnotitie` + content bevat "wond" | "Wondcontrole inplannen over 3 dagen?" → `create_appointment` | medium |
| `medicatie-controle` | Medicatie controle na wijziging | `dagnotitie` + content bevat "medicatie" EN "gewijzigd" | "Medicatie evaluatie inplannen over 1 week?" → `create_appointment` | medium |

**Locatie:** `lib/cortex/nudge.ts`

---

## 3. EPD Functionaliteit Analyse

### 3.1 Beschikbare Modules

| Module | Pad | Relevante Data voor Nudges |
|--------|-----|---------------------------|
| **Rapportage** | `app/epd/patients/[id]/rapportage/` | Report types, categories |
| **Risico Taxatie** | `intakes/[intakeId]/risk/` | Risk types, risk levels |
| **Verpleegrapportage** | `app/epd/verpleegrapportage/` | Vitals, AI samenvatting |
| **Agenda** | `app/epd/agenda/` | Appointment types |
| **Intake** | `intakes/[intakeId]/` | Anamnese, diagnose, kindcheck |
| **Behandelplan** | `patients/[id]/behandelplan/` | Leefgebieden, doelen |
| **Screening** | `patients/[id]/screening/` | Hulpvraag, besluit |

### 3.2 Report Types (voor nudge triggers)

```typescript
// lib/types/report.ts
export const REPORT_TYPES = [
  'voortgang',
  'observatie',
  'incident',      // → Trigger voor MIC-melding
  'medicatie',     // → Trigger voor evaluatie
  'contact',
  'crisis',        // → Trigger voor team informeren
  'intake',
  'behandeladvies',
  'vrije_notitie',
  'verpleegkundig',
] as const;
```

### 3.3 Verpleegkundige Categorieën

```typescript
// lib/types/report.ts
export const VERPLEEGKUNDIG_CATEGORIES = [
  'medicatie',    // → Trigger voor medicatie nudges
  'adl',          // → Trigger voor zorgplan nudges
  'gedrag',       // → Trigger voor risico nudges
  'incident',     // → Trigger voor MIC nudges
  'observatie',
] as const;
```

### 3.4 Risk Types (in EPD)

```typescript
// app/epd/patients/[id]/intakes/[intakeId]/risk/components/risk-manager.tsx
const riskTypeOptions = [
  { value: 'suicidaliteit', label: 'Suïcidaliteit' },
  { value: 'agressie', label: 'Agressie' },
  { value: 'zelfverwaarlozing', label: 'Zelfverwaarlozing' },
  { value: 'middelenmisbruik', label: 'Middelenmisbruik' },
  { value: 'verward_gedrag', label: 'Verward gedrag' },
  { value: 'overig', label: 'Overig' },
];

// app/epd/verpleegrapportage/components/blocks/risks-block.tsx (verpleegkunde)
const riskTypes = {
  valrisico: 'Valrisico',
  decubitus: 'Decubitus',
  ondervoeding: 'Ondervoeding',
  delier: 'Delier',
  infectie: 'Infectie',
  suiciderisico: 'Suïciderisico',
  agressie: 'Agressie',
  weglopen: 'Weglopen',
};
```

### 3.5 Appointment Types

```typescript
// lib/cortex/types.ts
appointmentType?: 'intake' | 'behandeling' | 'follow-up' | 'telefonisch' |
                  'huisbezoek' | 'online' | 'crisis' | 'overig';
```

---

## 4. Aanbevelingen: Nieuwe Nudges

### 4.1 Overzicht Aanbevolen Nudges

| # | ID | Trigger Intent | Conditions | Suggestie | Priority |
|---|-----|---------------|------------|-----------|----------|
| 1 | `suicidaliteit-veiligheidsplan` | dagnotitie | content matches `suïcida\|zelfmoord\|zelfbeschadig` | Veiligheidsplan actualiseren | 🔴 high |
| 2 | `crisis-team-informeren` | dagnotitie | content matches `crisis\|noodgeval\|acuut` | Crisisteam informeren | 🔴 high |
| 3 | `incident-mic-melding` | dagnotitie | category = `incident` | MIC-melding invullen | 🔴 high |
| 4 | `gedrag-risico-update` | dagnotitie | category = `gedrag` + content matches `agressie\|dreigend\|verward` | Risicotaxatie bijwerken | 🟡 medium |
| 5 | `adl-zorgplan-update` | dagnotitie | category = `adl` + content matches `hulp nodig\|verslechter` | Zorgplan bijwerken | 🟡 medium |
| 6 | `intake-behandelplan` | create_appointment | appointmentType = `intake` | Behandelplan opstellen | 🔵 low |
| 7 | `handover-mark` | dagnotitie | content matches `let op\|belangrijk\|doorgeven` | Opnemen in overdracht | 🔵 low |

### 4.2 Gedetailleerde Specificaties

#### 🔴 HIGH Priority — Safety & Compliance

**1. suicidaliteit-veiligheidsplan**

```typescript
{
  id: 'suicidaliteit-veiligheidsplan',
  name: 'Veiligheidsplan bij suïcidaliteit',
  trigger: {
    intent: 'dagnotitie',
    conditions: [
      { 
        field: 'content', 
        operator: 'matches', 
        value: 'suïcida|zelfmoord|zelfbeschadig|automutil' 
      },
    ],
  },
  suggestion: {
    intent: 'dagnotitie',
    message: '⚠️ Veiligheidsplan actualiseren en risicotaxatie bijwerken?',
    prefillEntities: (source) => ({
      patientName: source.patientName,
      category: 'observatie',
    }),
  },
  priority: 'high',
  enabled: true,
  expiresAfterMs: 10 * 60 * 1000, // 10 minuten - urgent
}
```

**Rationale:** Vereist door GGZ-richtlijnen. Bij suïcidaliteit moet altijd het veiligheidsplan geëvalueerd worden.

---

**2. crisis-team-informeren**

```typescript
{
  id: 'crisis-team-informeren',
  name: 'Team informeren bij crisis',
  trigger: {
    intent: 'dagnotitie',
    conditions: [
      { 
        field: 'content', 
        operator: 'matches', 
        value: 'crisis|noodgeval|acuut|spoed' 
      },
    ],
  },
  suggestion: {
    intent: 'dagnotitie',
    message: '🚨 Crisisteam en dienstdoende psychiater informeren?',
    prefillEntities: (source) => ({
      patientName: source.patientName,
      category: 'incident',
    }),
  },
  priority: 'high',
  enabled: true,
  expiresAfterMs: 10 * 60 * 1000,
}
```

**Rationale:** Crisis situaties vereisen multidisciplinaire afstemming.

---

**3. incident-mic-melding**

```typescript
{
  id: 'incident-mic-melding',
  name: 'MIC-melding na incident',
  trigger: {
    intent: 'dagnotitie',
    conditions: [
      { field: 'category', operator: 'equals', value: 'incident' },
    ],
  },
  suggestion: {
    intent: 'dagnotitie',
    message: '⚠️ MIC-melding invullen voor dit incident?',
    prefillEntities: (source) => ({
      patientName: source.patientName,
      category: 'incident',
    }),
  },
  priority: 'high',
  enabled: true,
  expiresAfterMs: 15 * 60 * 1000,
}
```

**Rationale:** MIC (Melding Incidenten Cliënten) is wettelijk verplicht bij incidenten in de zorg.

---

#### 🟡 MEDIUM Priority — Protocol & Follow-up

**4. gedrag-risico-update**

```typescript
{
  id: 'gedrag-risico-update',
  name: 'Risicotaxatie bij gedragsverandering',
  trigger: {
    intent: 'dagnotitie',
    conditions: [
      { field: 'category', operator: 'equals', value: 'gedrag' },
      { 
        field: 'content', 
        operator: 'matches', 
        value: 'agressie|agressief|dreigend|onrustig|agitatie|verward' 
      },
    ],
  },
  suggestion: {
    intent: 'dagnotitie',
    message: '📋 Risicotaxatie bijwerken voor dit gedrag?',
    prefillEntities: (source) => ({
      patientName: source.patientName,
      category: 'observatie',
    }),
  },
  priority: 'medium',
  enabled: true,
  expiresAfterMs: 5 * 60 * 1000,
}
```

**Rationale:** Gedragsverandering kan indicatie zijn voor veranderd risicoprofiel.

---

**5. adl-zorgplan-update**

```typescript
{
  id: 'adl-zorgplan-update',
  name: 'Zorgplan update bij ADL wijziging',
  trigger: {
    intent: 'dagnotitie',
    conditions: [
      { field: 'category', operator: 'equals', value: 'adl' },
      { 
        field: 'content', 
        operator: 'matches', 
        value: 'hulp nodig|niet meer zelfstandig|verslechter|achteruit' 
      },
    ],
  },
  suggestion: {
    intent: 'dagnotitie',
    message: '🏠 Zorgplan/behandelplan bijwerken voor gewijzigde ADL?',
    prefillEntities: (source) => ({
      patientName: source.patientName,
      category: 'observatie',
    }),
  },
  priority: 'medium',
  enabled: true,
  expiresAfterMs: 5 * 60 * 1000,
}
```

**Rationale:** ADL-veranderingen moeten leiden tot zorgplan-aanpassingen.

---

#### 🔵 LOW Priority — Administratief & Workflow

**6. intake-behandelplan**

```typescript
{
  id: 'intake-behandelplan',
  name: 'Behandelplan na intake',
  trigger: {
    intent: 'create_appointment',
    conditions: [
      { field: 'appointmentType', operator: 'equals', value: 'intake' },
    ],
  },
  suggestion: {
    intent: 'dagnotitie',
    message: '📝 Behandelplan opstellen na de intake?',
    prefillEntities: (source) => ({
      patientName: source.patientName,
      category: 'observatie',
    }),
  },
  priority: 'low',
  enabled: true,
  expiresAfterMs: 30 * 60 * 1000, // 30 minuten
}
```

**Rationale:** Na een intake hoort een behandelplan opgesteld te worden.

---

**7. handover-mark**

```typescript
{
  id: 'handover-mark',
  name: 'Opnemen in overdracht',
  trigger: {
    intent: 'dagnotitie',
    conditions: [
      { 
        field: 'content', 
        operator: 'matches', 
        value: 'let op|belangrijk|doorgeven|overdracht|collega|volgende dienst' 
      },
    ],
  },
  suggestion: {
    intent: 'dagnotitie',
    message: '📋 Deze notitie opnemen in de dienst-overdracht?',
    prefillEntities: (source) => ({
      patientName: source.patientName,
    }),
  },
  priority: 'low',
  enabled: true,
  expiresAfterMs: 5 * 60 * 1000,
}
```

**Rationale:** Belangrijke informatie moet in de overdracht terechtkomen.

---

## 5. Totaaloverzicht na Implementatie

### 5.1 Alle Nudges (9 totaal)

| # | ID | Trigger | Priority | Expiry | Status |
|---|-----|---------|----------|--------|--------|
| 1 | `wondzorg-controle` | dagnotitie + "wond" | 🟡 medium | 5 min | ✅ Bestaand |
| 2 | `medicatie-controle` | dagnotitie + "medicatie" + "gewijzigd" | 🟡 medium | 5 min | ✅ Bestaand |
| 3 | `suicidaliteit-veiligheidsplan` | dagnotitie + suïcide keywords | 🔴 high | 10 min | 🆕 Nieuw |
| 4 | `crisis-team-informeren` | dagnotitie + crisis keywords | 🔴 high | 10 min | 🆕 Nieuw |
| 5 | `incident-mic-melding` | dagnotitie + category=incident | 🔴 high | 15 min | 🆕 Nieuw |
| 6 | `gedrag-risico-update` | dagnotitie + category=gedrag + agressie | 🟡 medium | 5 min | 🆕 Nieuw |
| 7 | `adl-zorgplan-update` | dagnotitie + category=adl + verslechtering | 🟡 medium | 5 min | 🆕 Nieuw |
| 8 | `intake-behandelplan` | create_appointment + type=intake | 🔵 low | 30 min | 🆕 Nieuw |
| 9 | `handover-mark` | dagnotitie + "belangrijk" keywords | 🔵 low | 5 min | 🆕 Nieuw |

### 5.2 Verdeling per Priority

- **🔴 HIGH (3):** Safety-gerelateerd, vereisen directe actie
- **🟡 MEDIUM (4):** Protocol-gerelateerd, binnen dienst afhandelen
- **🔵 LOW (2):** Administratief, handig maar niet urgent

### 5.3 Verdeling per Trigger Intent

- **dagnotitie (8):** Meeste nudges triggeren op notities
- **create_appointment (1):** Na intake afspraak

---

## 6. Demo Impact

### 6.1 Uitgebreide Demo Scene 4

Met de nieuwe nudges kan de demo uitgebreid worden:

| Stap | Input | Verwachte Nudge | Priority |
|------|-------|-----------------|----------|
| 4a | "Wond verzorgd, ziet er goed uit" | Wondcontrole inplannen | 🟡 medium |
| 4b | "Patient was vandaag erg agressief" | Risicotaxatie bijwerken | 🟡 medium |
| 4c | "Incident: patient gevallen in gang" | MIC-melding invullen | 🔴 high |
| 4d | "Crisis: acute suïcidaliteit gemeld" | Veiligheidsplan + team | 🔴 high |

### 6.2 Demo Script Aanpassing

```markdown
### Scene 4: Proactiviteit (uitgebreid - 2.5 min)

**Stap 1:** "Wond verzorgd, ziet er goed uit"
→ NudgeToast (medium/oranje): "Wondcontrole inplannen over 3 dagen?"
**Highlight:** "Systeem kent zorgprotocollen"

**Stap 2:** "Patient was vandaag agressief naar medepatiënt"  
→ NudgeToast (medium/oranje): "Risicotaxatie bijwerken?"
**Highlight:** "Gedrag wordt gekoppeld aan risico-assessment"

**Stap 3:** "Crisis: patient spreekt over suïcide"
→ NudgeToast (high/rood): "⚠️ Veiligheidsplan actualiseren?"
**Highlight:** "Hoge prioriteit suggesties vallen direct op"
```

### 6.3 Potentiële Demo met Query Intents

Als de query intents geïmplementeerd worden:

```markdown
### Scene 5: Informatie Ophalen (1.5 min)

**Stap 1:** "Overzicht Jan"
→ PatientDashboardBlock met basisgegevens, intakes, afspraken
**Highlight:** "Direct patiëntinformatie zonder klikken"

**Stap 2:** "Wat zijn de risico's?"
→ Risico overzicht met levels en maatregelen
**Highlight:** "Contextueel - weet dat we over Jan praten"

**Stap 3:** "Toon rapportages van deze week"
→ Gefilterde rapportage lijst
**Highlight:** "Natuurlijke tijdsaanduiding werkt"
```

---

## 7. Technische Implementatie

### 7.1 Benodigde Wijzigingen

| Bestand | Actie |
|---------|-------|
| `lib/cortex/nudge.ts` | 7 nieuwe `ProtocolRule` entries toevoegen |
| `components/cortex/command-center/nudge-toast.tsx` | Styling voor high priority (rood) verifiëren |
| `docs/intent/demo-script-cortex-v2.md` | Demo script uitbreiden met nieuwe scenes |

### 7.2 Backward Compatibility

Alle nieuwe nudges zijn **additief** - bestaande functionaliteit blijft werken. De feature flag `CORTEX_NUDGE` moet `true` zijn om nudges te tonen.

---

## 8. Aanbevelingen: Nieuwe Query Intents

### 8.1 Overzicht Aanbevolen Query Intents

| # | Intent | Input Voorbeelden | Output | Prioriteit |
|---|--------|-------------------|--------|------------|
| 1 | `patient_overview` | "Overzicht Jan", "Dashboard Marie" | `PatientDashboardBlock` (bestaat al!) | 🔴 Hoog |
| 2 | `rapportage_query` | "Toon rapportages van Jan", "Notities deze week" | Rapportage lijst met filters | 🟡 Middel |
| 3 | `behandelplan_query` | "Wat is het behandelplan?", "Toon doelen" | Behandelplan overzicht | 🟡 Middel |
| 4 | `risico_query` | "Wat zijn de risico's?", "Risicotaxatie" | Risico overzicht | 🟡 Middel |

### 8.2 Gedetailleerde Specificaties Query Intents

#### 🔴 HIGH Priority — `patient_overview`

**Waarom hoog?** De UI (`PatientDashboardBlock`) bestaat al, alleen de intent routing ontbreekt.

**Input voorbeelden:**
- "Overzicht Jan"
- "Dashboard Marie"
- "Patiëntoverzicht"

**Pattern matching (Reflex):**
```typescript
patient_overview: [
  { pattern: /^overzicht\s+\w+/i, weight: 1.0 },
  { pattern: /^dashboard\s+\w+/i, weight: 1.0 },
  { pattern: /^pati[eë]nt(en)?overzicht\b/i, weight: 0.9 },
  { pattern: /^toon\s+(alles|info)\s+(van\s+)?\w+/i, weight: 0.85 },
]
```

**Entities:**
```typescript
{
  patientName: string;
}
```

**Output:** `PatientDashboardBlock` - toont:
- Basisgegevens (naam, geboortedatum, BSN)
- Recente intakes
- Agenda afspraken
- Actief behandelplan (doelen/interventies count)

---

#### 🟡 MEDIUM Priority — `rapportage_query`

**Input voorbeelden:**
- "Toon rapportages van Jan"
- "Wat is er gerapporteerd deze week?"
- "Rapportages vandaag"
- "Notities van Marie"

**Pattern matching (Reflex):**
```typescript
rapportage_query: [
  { pattern: /^(toon\s+)?rapportages?\b/i, weight: 1.0 },
  { pattern: /^wat\s+is\s+er\s+gerapporteerd\b/i, weight: 0.95 },
  { pattern: /^overzicht\s+notities\b/i, weight: 0.9 },
  { pattern: /^rapportages?\s+(van\s+)?\w+/i, weight: 0.9 },
  { pattern: /^notities\s+(van\s+)?\w+/i, weight: 0.85 },
]
```

**Entities:**
```typescript
{
  patientName?: string;
  dateRange?: { start: Date; end: Date; label: string };
  category?: VerpleegkundigCategory; // optioneel filter
}
```

**Benodigde UI:** `RapportageQueryBlock` (nieuw) - lijst van rapportages met:
- Periode filter (vandaag, week, maand)
- Categorie filter (medicatie, adl, gedrag, etc.)
- Sorteer opties (datum, categorie)

---

#### 🟡 MEDIUM Priority — `behandelplan_query`

**Input voorbeelden:**
- "Wat is het behandelplan van Jan?"
- "Toon doelen van Marie"
- "Behandelplan"
- "Welke interventies heeft Jan?"

**Pattern matching (Reflex):**
```typescript
behandelplan_query: [
  { pattern: /^(toon\s+)?behandelplan\b/i, weight: 1.0 },
  { pattern: /^wat\s+(zijn|is)\s+(het\s+)?behandelplan\b/i, weight: 0.95 },
  { pattern: /^(toon\s+)?doelen\b/i, weight: 0.9 },
  { pattern: /^(toon\s+)?interventies\b/i, weight: 0.9 },
  { pattern: /^behandelplan\s+(van\s+)?\w+/i, weight: 0.9 },
]
```

**Entities:**
```typescript
{
  patientName?: string;
  queryFocus?: 'doelen' | 'interventies' | 'leefgebieden' | 'alles';
}
```

**Benodigde UI:** `BehandelplanQueryBlock` (nieuw) of hergebruik `BehandelplanView`:
- Hulpvraag weergave
- Leefgebieden scores
- Doelen lijst
- Interventies lijst

---

#### 🟡 MEDIUM Priority — `risico_query`

**Input voorbeelden:**
- "Wat zijn de risico's van Jan?"
- "Toon risicotaxatie"
- "Risico's"
- "Veiligheidsplan"

**Pattern matching (Reflex):**
```typescript
risico_query: [
  { pattern: /^(toon\s+)?risico['']?s?\b/i, weight: 1.0 },
  { pattern: /^wat\s+zijn\s+(de\s+)?risico['']?s?\b/i, weight: 0.95 },
  { pattern: /^risicotaxatie\b/i, weight: 0.95 },
  { pattern: /^veiligheidsplan\b/i, weight: 0.8 },
  { pattern: /^risico['']?s?\s+(van\s+)?\w+/i, weight: 0.9 },
]
```

**Entities:**
```typescript
{
  patientName?: string;
  riskType?: 'suicidaliteit' | 'agressie' | 'valrisico' | 'all';
}
```

**Benodigde UI:** Hergebruik `RisksBlock` uit verpleegrapportage:
- Risico's gesorteerd op niveau (zeer_hoog → laag)
- Met rationale en maatregelen
- High risk count badge

---

### 8.3 Implementatie Impact Query Intents

| Intent | Types Wijziging | Patterns Wijziging | UI Wijziging | Complexiteit |
|--------|----------------|-------------------|--------------|--------------|
| `patient_overview` | ✅ Toevoegen | ✅ Toevoegen | ❌ Bestaat al | **Laag** |
| `rapportage_query` | ✅ Toevoegen | ✅ Toevoegen | 🆕 Nieuw block | **Middel** |
| `behandelplan_query` | ✅ Toevoegen | ✅ Toevoegen | ⚠️ Wrap bestaand | **Middel** |
| `risico_query` | ✅ Toevoegen | ✅ Toevoegen | ⚠️ Wrap bestaand | **Middel** |

---

## 9. Toekomstige Uitbreidingen (Post-MVP)

### 9.1 Potentiële Nieuwe Actie Intents

| Intent | Use Case | Prioriteit |
|--------|----------|------------|
| `medicatie_toediening` | "Geef Jan zijn medicatie" | Medium |
| `vitals_registratie` | "Bloeddruk Jan 120/80" | Medium |
| `taak_aanmaken` | "Herinnering morgen 10:00" | Low |
| `bericht_sturen` | "Mail naar huisarts" | Low |

### 9.2 Potentiële Nieuwe Nudges

| ID | Trigger | Suggestie |
|----|---------|-----------|
| `vitals-afwijkend` | Vitals met H/L interpretatie | Arts informeren |
| `lithium-lab` | Medicatie notitie + "lithium" | Lab aanvragen |
| `overdracht-einde-dienst` | Einde dienst nadert | Overdracht schrijven |
| `kindcheck-reminder` | Na intake met kinderen | Kindcheck uitvoeren |

---

## 10. Referenties

- Bouwplan: `docs/intent/bouwplan-cortex-v2.md`
- Architecture: `docs/intent/architecture-cortex-v2.md`
- MVP User Stories: `docs/intent/mvp-userstories-intent-system.md`
- Huidige nudge implementatie: `lib/cortex/nudge.ts`
- Intent types: `lib/cortex/types.ts`
- Reflex classifier: `lib/cortex/reflex-classifier.ts`
- Report types: `lib/types/report.ts`
- Risk types: `app/epd/patients/[id]/intakes/[intakeId]/risk/components/risk-manager.tsx`
- PatientDashboardBlock: `components/cortex/blocks/patient-dashboard-block.tsx`
- OverdrachtBlock: `components/cortex/blocks/overdracht-block.tsx`
- BehandelplanView: `components/behandelplan/behandelplan-view.tsx`
- RisksBlock: `app/epd/verpleegrapportage/components/blocks/risks-block.tsx`

---

## Versiehistorie

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 01-01-2026 | Colin Lit | Initiële analyse document |
| v1.1 | 01-01-2026 | Colin Lit | Query intents analyse toegevoegd (rapportage, behandelplan, risico, dashboard) |

