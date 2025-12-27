# Mission Control - Bouwplan

Projectnaam: Swift Agenda Planning Module  
Versie: v1.0  
Datum: 27-12-2025  
Auteur: Colin Lit  

---

## 1. Doel en context
Doel: een Swift Agenda Planning module bouwen waarmee gebruikers via chat afspraken kunnen opvragen, aanmaken, annuleren en verzetten, met een AgendaBlock artifact als visuele bevestiging.  
Toelichting: dit bouwt voort op het Swift conversatie‑model en hergebruikt de klassieke agenda (`/app/epd/agenda`) als full view. De Swift‑variant focust op snelle queries en quick actions.

---

## 2. Uitgangspunten

### 2.1 Technische Stack
- Frontend: Next.js App Router + React + TypeScript
- Styling: Tailwind CSS
- State: Zustand (Swift store)
- Backend: Next.js route handlers + Supabase (encounters)
- AI/Intent: Local regex + Claude Haiku fallback
- Auth: Supabase Auth (server-side guard)

### 2.2 Projectkaders
- Scope (MVP): agenda_query, create_appointment, cancel_appointment, reschedule_appointment + AgendaBlock.
- Out of scope: drag-and-drop, recurring, availability, conflict resolution UI, multi-practitioner.
- Geen nieuwe dependencies zonder akkoord.
- Geen database migraties in MVP.
- Reuse bestaande agenda actions waar mogelijk.

### 2.3 Programmeer uitgangspunten
- DRY: hergebruik `app/epd/agenda/actions.ts`.
- KISS: snelle API routes + simpele AgendaBlock UI.
- SOC: intent parsing, data fetching en UI gescheiden.
- YAGNI: alleen P1/P2 uit FO, geen extra planner features.

---

## 3. Epics & Stories Overzicht
| Epic ID | Titel | Doel | Status | Stories | Opmerkingen |
|---------|-------|------|--------|---------|-------------|
| E0 | Alignment & scope | MVP afbakenen en keuzes vastleggen | To Do | 2 | FO‑based |
| E1 | Intent & entity layer | Agenda intents + entities toevoegen | To Do | 4 | Swift intent stack |
| E2 | Date/time parsing | NLP‑helpers voor datum/tijd | To Do | 3 | Geen nieuwe deps |
| E3 | Backend integratie | Agenda data APIs + reuse actions | To Do | 4 | Auth vereist |
| E4 | AgendaBlock UI | List/create/cancel/reschedule views | To Do | 5 | Swift artifact |
| E5 | Chat orchestration | Action routing + prompt update | To Do | 3 | Swift chat API |
| E6 | QA & docs | Testplan + docs update | To Do | 3 | Manual QA |

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 — Alignment & scope
Epic doel: MVP scope, UX flows en beslissingen vastleggen.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E0.S1 | Scope + out-of-scope vastleggen | P1/P2 lijst bevestigd, OOS lijst bevestigd | To Do | - | 1 |
| E0.S2 | UX flow beschrijven | Entry/exit, artifact gedrag en fallback flows gedocumenteerd | To Do | E0.S1 | 2 |

---

### Epic 1 — Intent & entity layer
Epic doel: agenda intent types en entities toevoegen aan Swift.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E1.S1 | SwiftIntent uitbreiden | Nieuwe agenda intents toegevoegd in types/store | To Do | E0.S1 | 2 |
| E1.S2 | Local intent patterns | Regex patterns voor agenda intents in `intent-classifier.ts` | To Do | E1.S1 | 3 |
| E1.S3 | AI fallback prompt | Prompt in `intent-classifier-ai.ts` uitgebreid met agenda intents | To Do | E1.S1 | 3 |
| E1.S4 | Entities schema | `ExtractedEntities` uitgebreid met date/time/identifier | To Do | E1.S1 | 2 |

Technical notes:
- Houd `SwiftIntent` single source of truth (voorkom duplicatie).

---

### Epic 2 — Date/time parsing
Epic doel: datum/tijd interpretatie uit natuurlijke taal.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E2.S1 | Date parser utility | `lib/swift/date-time-parser.ts` met relatieve datums | To Do | E1.S4 | 3 |
| E2.S2 | Time parser utility | Tijd normalisatie (14:00, half drie) | To Do | E2.S1 | 2 |
| E2.S3 | Entity extraction hook | Entity extractor gebruikt parser output | To Do | E2.S2 | 2 |

---

### Epic 3 — Backend integratie
Epic doel: agenda data ontsluiten voor Swift blocks.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E3.S1 | Agenda query API | Endpoint voor afspraken op datumrange (auth) | To Do | E1.S4 | 3 |
| E3.S2 | Create appointment API | Endpoint die `createEncounter` aanroept | To Do | E3.S1 | 3 |
| E3.S3 | Cancel/reschedule API | Endpoints die `cancelEncounter`/`rescheduleEncounter` aanroepen | To Do | E3.S1 | 3 |
| E3.S4 | Patient match API | Fuzzy patiënt matching + disambiguation lijst | To Do | E1.S4 | 2 |

Technical notes:
- Reuse `app/epd/agenda/actions.ts` voor database logic.
- Auth guard via `createClient()` en `supabase.auth.getUser()`.

---

### Epic 4 — AgendaBlock UI
Epic doel: Swift artifact voor agenda flows.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E4.S1 | AgendaBlock skeleton | Block met tabs/modes (list/create/cancel/reschedule) | To Do | E3.S1 | 3 |
| E4.S2 | List view | Lijst met afspraken + empty state | To Do | E4.S1 | 3 |
| E4.S3 | Create form | Prefill + validatie + submit | To Do | E4.S1 | 5 |
| E4.S4 | Cancel view | Disambiguation + confirm flow | To Do | E4.S1 | 3 |
| E4.S5 | Reschedule view | Edit form met nieuwe tijd | To Do | E4.S1 | 3 |

---

### Epic 5 — Chat orchestration
Epic doel: agenda intents laten landen in juiste artifact.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E5.S1 | Action routing | Agenda intents openen AgendaBlock met juiste mode | To Do | E4.S1 | 2 |
| E5.S2 | Chat prompt update | `/api/swift/chat` prompt bevat agenda sectie + action format | To Do | E1.S3 | 2 |
| E5.S3 | Error states | User-friendly errors + link naar `/epd/agenda` | To Do | E3.S1 | 2 |

---

### Epic 6 — QA & docs
Epic doel: kwaliteit borgen en documentatie updaten.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E6.S1 | Manual test checklist | Scenarios uit FO opgenomen | To Do | E5.S3 | 2 |
| E6.S2 | Docs update | Bouwplan + release note bijgewerkt | To Do | E6.S1 | 1 |
| E6.S3 | Regression checks | Swift en klassieke agenda blijven werken | To Do | E6.S1 | 2 |

---

## 5. Kwaliteit & Testplan

Test types:
| Test Type | Scope | Tools | Verantwoordelijke |
|-----------|-------|-------|-------------------|
| Lint | App code | pnpm lint | Developer |
| Smoke tests | Agenda intents + artifact flows | Manual checklist | Developer/UX |
| Regression | /epd/agenda klassiek | Manual checklist | Developer |

Manual test checklist (MVP):
- "afspraken vandaag" → AgendaBlock list view
- "maak afspraak Jan morgen 14:00" → create form met prefill
- "annuleer afspraak Jan" → disambiguation indien nodig
- "verzet 14:00 naar 15:00" → reschedule form
- Link naar `/epd/agenda` werkt
- Geen auth → redirect naar `/login`

---

## 6. Demo & Presentatieplan
Doel: korte demo van agenda planning via Swift.

Flow:
1) "afspraken vandaag" → lijst
2) "maak afspraak met Jan morgen 14:00" → create form → submit
3) "annuleer afspraak Jan" → confirm

---

## 7. Risico's & Mitigatie
| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| Intent ambigu | Hoog | Middel | Disambiguation + fallback prompt | UX |
| Date/time parsing faalt | Middel | Middel | AI fallback + clear prompts | Dev |
| API auth issues | Laag | Hoog | Central auth guard + error messaging | Dev |
| Scope creep | Hoog | Middel | MVP guardrails | PO |

---

## 8. Evaluatie & Lessons Learned
Te documenteren na oplevering:
- Welke intents vaak misclassificeren?
- Hoe snel users afspraken kunnen plannen?
- Zijn extra agenda features nodig?

---

## 9. Referenties
- FO: `docs/swift/fo-swift-agenda-planning.md`
- Swift FO v3: `docs/swift/fo-swift-medical-scribe-v3.md`
- Agenda module: `app/epd/agenda`
- Swift chat: `app/api/swift/chat/route.ts`
- Intent classifier: `lib/swift/intent-classifier.ts`

---

## 10. Glossary & Abbreviations
| Term | Betekenis |
|------|-----------|
| Epic | Grote feature of fase |
| Story | Kleine uitvoerbare taak |
| MVP | Minimum Viable Product |
| FO | Functioneel Ontwerp |
| SSE | Server-Sent Events |

---

Versiehistorie:
| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 27-12-2025 | Colin Lit | Initiele versie |
