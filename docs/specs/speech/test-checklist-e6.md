# 🧪 Test Checklist - Epic 6: Integration & Testing

**Datum:** 24-11-2025
**Tester:** [Naam]

---

## E6.S1 - Component Integration Tests

### Speech Recorder in Editor (report-composer.tsx)

| Test | Verwacht | ✅/❌ | Opmerkingen |
|------|----------|-------|-------------|
| Start opname → Cursor naar einde | Cursor springt naar einde van textarea | | |
| Start opname → Groene border | Textarea krijgt emerald border + shadow | | |
| Interim tekst → Grijs italic onder textarea | Live preview tijdens spreken | | |
| Stop opname → Border reset | Normale border keert terug | | |
| Transcript → Append aan content | Tekst wordt toegevoegd aan einde | | |

### Speech Recorder in Modal (report-view-edit-modal.tsx)

| Test | Verwacht | ✅/❌ | Opmerkingen |
|------|----------|-------|-------------|
| Edit mode → Speech recorder zichtbaar | Recorder verschijnt in bg-slate-50 sectie | | |
| Start opname → Groene border op textarea | Modal textarea krijgt emerald border | | |
| Transcript → Append aan content | Tekst wordt toegevoegd | | |
| Stop → Unsaved indicator verschijnt | Amber bolletje + tekst | | |

### State Synchronization

| Test | Verwacht | ✅/❌ | Opmerkingen |
|------|----------|-------|-------------|
| Nieuwe rapportage → Verschijnt in timeline | Report toegevoegd bovenaan lijst | | |
| Edit rapport → Timeline card update | Content preview update na save | | |
| Delete rapport → Verdwijnt uit timeline | Card verwijderd uit lijst | | |
| Duplicate → Content naar editor | Inhoud gekopieerd naar composer | | |

---

## E6.S2 - Dutch Medical Terms Test

### GGZ Terminologie Test

Spreek elk woord/zin in en controleer transcriptie:

| Term | Correct? | Confidence | Opmerkingen |
|------|----------|------------|-------------|
| "gegeneraliseerde angststoornis" | | | |
| "SSRI medicatie" | | | |
| "DSM-5 classificatie" | | | |
| "cognitieve gedragstherapie" | | | |
| "EMDR behandeling" | | | |
| "traumaverwerking" | | | |
| "depressieve episode" | | | |
| "bipolaire stoornis" | | | |
| "schizofrenie" | | | |
| "persoonlijkheidsstoornis" | | | |
| "dissociatieve identiteitsstoornis" | | | |
| "borderline persoonlijkheidsstoornis" | | | |
| "obsessief-compulsieve stoornis" | | | |
| "PTSS post-traumatische stressstoornis" | | | |
| "anorexia nervosa" | | | |

### Medische Zinnen Test

| Zin | Correct? | Issues |
|----|----------|--------|
| "De patiënt presenteert zich met klachten van angst en depressie" | | |
| "Behandeladvies: cognitieve gedragstherapie, 12 sessies" | | |
| "Diagnose volgens DSM-5: gegeneraliseerde angststoornis (F41.1)" | | |
| "Patiënt is gestart met SSRI medicatie (sertraline 50mg)" | | |
| "Verwijzing naar EMDR therapeut voor traumaverwerking" | | |

---

## E6.S3 - Browser Compatibility

### Desktop Browsers

| Browser | Versie | WebSocket | Web Audio | MediaRecorder | Streaming | Opmerkingen |
|---------|--------|-----------|-----------|---------------|-----------|-------------|
| Chrome | | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | |
| Firefox | | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | |
| Safari | | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | |
| Edge | | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | |

### Mobile Browsers

| Browser | Versie | Mic Access | Streaming | UI Responsive | Opmerkingen |
|---------|--------|------------|-----------|---------------|-------------|
| Chrome Mobile | | ✅/❌ | ✅/❌ | ✅/❌ | |
| Safari iOS | | ✅/❌ | ✅/❌ | ✅/❌ | |

---

## E6.S4 - Bug Bash & Polish

### Happy Flow Tests

**Test 1: Nieuwe Rapportage**
- [ ] Pagina laadt met editor full-width
- [ ] Quick action buttons zichtbaar
- [ ] Klik [+ Vrije notitie] → Type geselecteerd
- [ ] Start opname → Verbinding binnen 2 sec
- [ ] Spreek → Real-time tekst verschijnt
- [ ] Interim tekst is grijs italic
- [ ] Final tekst is zwart
- [ ] Stop → Transcript compleet
- [ ] Klik Opslaan → Toast verschijnt
- [ ] Rapportage in timeline (na refresh of real-time)

**Test 2: Bestaande Bewerken**
- [ ] Klik [Tijdlijn] → Sidebar slides in (smooth)
- [ ] Rapportages zichtbaar met preview
- [ ] Klik [Bekijk rapport] → Modal opent (read mode)
- [ ] Klik [✏️ Bewerken] → Edit mode (smooth transitie)
- [ ] Speech recorder verschijnt
- [ ] Dicteer → Tekst append aan einde
- [ ] Klik [Opslaan] → Toast + modal blijft open
- [ ] Klik [✕] → Modal sluit

**Test 3: Unsaved Changes**
- [ ] Edit rapport → Type tekst
- [ ] Klik [✕] → Dialog verschijnt
- [ ] Klik [Terug] → Modal blijft open, tekst intact
- [ ] Klik [Opslaan en sluiten] → Saved + modal sluit
- [ ] OF Klik [Wijzigingen verwijderen] → Discard + modal sluit

**Test 4: Network Resilience**
- [ ] Start opname
- [ ] Spreek 5 seconden
- [ ] Disconnect wifi (of throttle in DevTools)
- [ ] Status indicator wordt oranje "Herverbinden..."
- [ ] Partial transcript blijft zichtbaar
- [ ] Reconnect → Groen "Verbonden"
- [ ] Kan verder dicteren

### Known Issues / Bugs

| # | Beschrijving | Prioriteit | Status |
|---|--------------|------------|--------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

### UI Polish Items

| # | Item | Status |
|---|------|--------|
| 1 | Loading states consistent | |
| 2 | Error messages user-friendly | |
| 3 | Animations smooth (300ms) | |
| 4 | Keyboard navigation (Escape) | |
| 5 | Focus management correct | |

---

## Test Summary

| Category | Pass | Fail | Blocked |
|----------|------|------|---------|
| E6.S1 Component Integration | | | |
| E6.S2 Dutch Medical Terms | | | |
| E6.S3 Browser Compatibility | | | |
| E6.S4 Bug Bash & Polish | | | |

**Overall Status:** ⏳ In Progress / ✅ Pass / ❌ Fail

**Notes:**


---

**Sign-off:**
- Developer: 
- Date: 

