# Test Plan Epic 3 - P1 Blocks

**Datum:** 24-12-2024  
**Status:** Ready for Testing  
**Epic:** E3 - P1 Blocks (E3.S0-S6)

---

## Setup

1. **Start development server:**
   ```bash
   pnpm dev
   ```

2. **Open browser:**
   - Navigeer naar `http://localhost:3000`
   - Log in (of gebruik demo account)
   - Kies "Swift" interface preference
   - Je komt op `/epd/swift`

---

## Test Checklist

### E3.S0 - CanvasArea Block Rendering ✅

- [ ] **Empty State**
  - [ ] Wanneer geen block actief is, zie je de empty state met voorbeeld commando's
  - [ ] Empty state heeft "Wat wil je doen?" tekst

- [ ] **Block Transitions**
  - [ ] Wanneer een block opent, zie je een smooth fade-in animatie
  - [ ] Wanneer een block sluit, zie je een smooth fade-out animatie
  - [ ] Geen flickering tussen blocks

- [ ] **PatientContextCard Auto-Display**
  - [ ] Wanneer je een patiënt selecteert in ZoekenBlock, verschijnt PatientContextCard automatisch
  - [ ] PatientContextCard toont patiënt naam in header

---

### E3.S1 - Block Container ✅

- [ ] **Container Styling**
  - [ ] Alle blocks hebben een donkere achtergrond (slate-800)
  - [ ] Blocks hebben een border (slate-700)
  - [ ] Blocks hebben shadow-2xl

- [ ] **Close Button**
  - [ ] Elke block heeft een X button rechtsboven
  - [ ] Hover over X button verandert kleur
  - [ ] Klik op X sluit het block
  - [ ] ESC toets sluit ook het block

- [ ] **Sizes**
  - [ ] DagnotatieBlock heeft size "md"
  - [ ] ZoekenBlock heeft size "md"
  - [ ] OverdrachtBlock heeft size "lg"
  - [ ] PatientContextCard heeft size "lg"

- [ ] **Animations**
  - [ ] Container heeft fade-in animatie
  - [ ] Content heeft stagger animatie (items verschijnen na elkaar)
  - [ ] Close button heeft hover/tap animaties

---

### E3.S2 - DagnotatieBlock ✅

- [ ] **Patient Search**
  - [ ] Typ "jan" in patient search veld
  - [ ] Na ~300ms zie je zoekresultaten
  - [ ] Resultaten tonen naam, geboortedatum, BSN
  - [ ] Klik op een patiënt selecteert deze

- [ ] **Category Selector**
  - [ ] 5 categorie buttons zijn zichtbaar: medicatie, adl, gedrag, incident, observatie
  - [ ] Klik op een categorie selecteert deze (visuele feedback)
  - [ ] Alleen één categorie kan geselecteerd zijn

- [ ] **Text Input**
  - [ ] Textarea is beschikbaar
  - [ ] Character counter toont "0 / 500"
  - [ ] Typ tekst → counter update
  - [ ] Max 500 karakters (kan niet meer typen)

- [ ] **Include in Handover**
  - [ ] Checkbox "Opnemen in overdracht" is zichtbaar
  - [ ] Checkbox kan aangevinkt worden

- [ ] **Save Functionality**
  - [ ] Klik "Opslaan" zonder patiënt → error message
  - [ ] Klik "Opslaan" zonder categorie → error message
  - [ ] Klik "Opslaan" zonder tekst → error message
  - [ ] Vul alles in en klik "Opslaan"
  - [ ] Success toast verschijnt
  - [ ] Block sluit automatisch na ~500ms

- [ ] **Prefill Data**
  - [ ] Typ "notitie jan medicatie" in command input
  - [ ] DagnotatieBlock opent met "jan" voorgevuld in patient search
  - [ ] Categorie "medicatie" is geselecteerd

---

### E3.S3 - Patient Search API ✅

- [ ] **API Endpoint**
  - [ ] Open DevTools → Network tab
  - [ ] Typ in ZoekenBlock of DagnotatieBlock
  - [ ] Request naar `/api/patients/search?q=...` wordt gemaakt
  - [ ] Response heeft `patients` array met `matchScore`

- [ ] **Search Functionality**
  - [ ] Zoek op naam: "jan" → resultaten met "Jan" in naam
  - [ ] Zoek op BSN: "123456789" → resultaten met deze BSN
  - [ ] Zoek op clientnummer: "12345" → resultaten met dit nummer
  - [ ] Zoek op deel van naam: "mar" → resultaten met "Marie", "Maria", etc.

- [ ] **Match Scoring**
  - [ ] Exacte naam match heeft hogere score
  - [ ] Resultaten zijn gesorteerd op matchScore (hoogste eerst)

- [ ] **Error Handling**
  - [ ] Zoek op "x" (te kort) → geen request
  - [ ] Network error → error message in UI

---

### E3.S4 - ZoekenBlock ✅

- [ ] **Search Input**
  - [ ] Typ in search input veld
  - [ ] Debouncing werkt (geen request bij elke toetsaanslag)
  - [ ] Loading indicator tijdens zoeken

- [ ] **Search Results**
  - [ ] Resultaten verschijnen in dropdown
  - [ ] Elke resultaat toont: avatar, naam, geboortedatum, BSN, clientnummer
  - [ ] Max 5 resultaten getoond

- [ ] **Patient Selection**
  - [ ] Klik op een patiënt in resultaten
  - [ ] Loading indicator tijdens ophalen volledige data
  - [ ] Success toast: "Patiënt geselecteerd"
  - [ ] Block sluit automatisch
  - [ ] PatientContextCard verschijnt automatisch

- [ ] **Store Integration**
  - [ ] Na selectie is `activePatient` gezet in store
  - [ ] Recent action is toegevoegd: "Patiënt geselecteerd: [naam]"

- [ ] **Empty State**
  - [ ] Geen resultaten → "Geen patiënten gevonden" message
  - [ ] Te korte query → geen resultaten

---

### E3.S5 - PatientContextCard ✅

- [ ] **Auto-Open**
  - [ ] Na patiënt selectie in ZoekenBlock verschijnt PatientContextCard automatisch
  - [ ] PatientContextCard heeft patiënt naam in header

- [ ] **Loading State**
  - [ ] Tijdens laden zie je "Context laden..." met spinner

- [ ] **Notities Sectie**
  - [ ] Laatste 5 reports worden getoond
  - [ ] Elke notitie toont: type badge, overdracht indicator, datum/tijd, content preview
  - [ ] Content is gelimiteerd tot 2 regels (line-clamp-2)

- [ ] **Vitals Sectie**
  - [ ] Vitale functies van vandaag worden getoond
  - [ ] Grid layout (2 kolommen)
  - [ ] Abnormale waarden hebben amber achtergrond
  - [ ] Elke vital toont: naam, waarde, eenheid, tijdstip

- [ ] **Diagnoses Sectie**
  - [ ] Actieve diagnoses worden getoond
  - [ ] Elke diagnose toont: naam, startdatum (indien beschikbaar)

- [ ] **Risico's Sectie**
  - [ ] Risk assessments worden getoond
  - [ ] Risico badges met kleurcodering (rood voor hoog, amber voor gemiddeld)
  - [ ] Elke badge toont: type + niveau

- [ ] **Empty State**
  - [ ] Geen data beschikbaar → "Geen context beschikbaar voor deze patiënt"

- [ ] **Error Handling**
  - [ ] API error → error message met retry optie

---

### E3.S6 - OverdrachtBlock ✅

- [ ] **Patients List**
  - [ ] Lijst van patiënten met activiteit wordt geladen
  - [ ] Loading state tijdens laden
  - [ ] Elke patiënt toont: naam, alert count, risico indicator

- [ ] **Period Selector**
  - [ ] 4 period buttons: Vandaag, 3 dagen, 1 week, 2 weken
  - [ ] Geselecteerde periode heeft visuele feedback
  - [ ] Beschrijving onder buttons update bij selectie

- [ ] **Active Patient Filter**
  - [ ] Wanneer `activePatient` is gezet, toont alleen die patiënt
  - [ ] Wanneer geen `activePatient`, toont alle patiënten

- [ ] **Generate Summary**
  - [ ] Klik "Genereer" button voor een patiënt
  - [ ] Loading state: "Samenvatting wordt gegenereerd..."
  - [ ] Na ~3-5 seconden verschijnt samenvatting

- [ ] **Summary Display**
  - [ ] **Samenvatting**: AI-gegenereerde tekst in grijze box
  - [ ] **Aandachtspunten**: Lijst met urgentie badges
    - [ ] Urgente punten hebben rode border + alert icon
    - [ ] Bron type badges (observatie, rapportage, verpleegkundig, risico)
    - [ ] Bronverwijzingen met datum + label
  - [ ] **Actiepunten**: Checklist met acties
  - [ ] **Footer**: Tijdstip generatie + duration, refresh button

- [ ] **Error Handling**
  - [ ] API error → error message met "Opnieuw proberen" button
  - [ ] Network error → toast notification

- [ ] **Refresh**
  - [ ] Klik "Vernieuwen" button → nieuwe samenvatting wordt gegenereerd

---

## Cross-Feature Tests

- [ ] **Keyboard Shortcuts**
  - [ ] ESC sluit actieve block
  - [ ] Cmd+K focust command input

- [ ] **Animations**
  - [ ] Alle transitions zijn smooth (geen janky animaties)
  - [ ] Geen layout shifts tijdens animaties

- [ ] **Error States**
  - [ ] Network errors tonen user-friendly messages
  - [ ] Validation errors zijn duidelijk
  - [ ] Retry functionaliteit werkt

- [ ] **Performance**
  - [ ] Blocks openen binnen 100ms
  - [ ] API calls zijn debounced waar nodig
  - [ ] Geen onnodige re-renders

---

## Known Issues / Notes

- [ ] Noteer hier eventuele issues die je tegenkomt
- [ ] Noteer verbeteringen die je zou willen zien

---

## Test Resultaten

**Tester:** _________________  
**Datum:** _________________  
**Status:** ⏳ In Progress / ✅ Passed / ❌ Failed

**Totaal:** ___ / ___ tests passed

