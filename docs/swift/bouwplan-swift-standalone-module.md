# Mission Control - Bouwplan

Projectnaam: Swift Standalone Module (MVP)  
Versie: v1.0  
Datum: 27-12-2025  
Auteur: Colin Lit  

---

## 1. Doel en context
Doel: Swift loskoppelen van de klassieke EPD layout zodat de Swift UI full-screen draait zonder sidebar.  
Toelichting: Swift is een aparte modus (conversational scribe) die focus en ruimte nodig heeft. In de huidige app router erft `/epd/swift` de EPD layout, waardoor de sidebar blijft staan. Dit plan brengt Swift onder een eigen route group, behoudt dezelfde URL, en voorkomt regressies in het klassieke EPD.

Belangrijke overwegingen:
- Lead dev: zuivere layout scheiding via route group, minimale impact, geen conditionele layout hacks.
- UX: full-screen focus, duidelijke entry/exit, geen dubbele navigatie, consistente context bar.
- PO: MVP scope, beperkte wijzigingen, geen nieuwe features of dependencies.
- Besluit: route group is akkoord (27-12-2025).

UX flow (MVP):
- Toegang via login: interface-voorkeur bepaalt redirect (Swift -> /epd/swift, klassiek -> /epd/clients).
- Deep link naar /epd/swift zonder sessie: login volgt en redirect gaat alsnog op basis van interface-voorkeur.
- Terug naar EPD: context bar link naar /epd.
- Schakelen vanuit klassiek EPD: Swift staat als item in de EPD sidebar.

---

## 2. Uitgangspunten

### 2.1 Technische Stack
- Frontend: Next.js App Router + React + TypeScript
- Styling: Tailwind CSS
- State: Zustand
- Auth: Supabase Auth
- API: Next.js route handlers (SSE voor Swift chat)
- Hosting: Vercel

### 2.2 Projectkaders
- Scope (MVP): alleen layout/routing scheiding + minimale navigatie checks.
- Out of scope: nieuwe Swift features, redesign van chat/artifacts, nieuwe AI flows.
- Geen nieuwe dependencies zonder akkoord.
- Geen database migraties nodig.
- URL `/epd/swift` blijft gelijk voor deep links.
- Klassiek EPD moet onveranderd blijven.

### 2.3 Programmeer Uitgangspunten
Code quality principles:
- DRY: shared layout helpers en routes hergebruiken waar logisch.
- KISS: route group boven conditionele rendering.
- SOC: Swift layout los van EPD layout, geen cross-coupling.
- YAGNI: geen extra features buiten layout scheiding.

Development practices:
- Geen nieuwe dependencies of migrations zonder akkoord.
- Keep server components default; alleen client waar nodig.
- Duidelijke error handling bij auth redirect.
- UI blijft Tailwind-only, geen styling drift.

---

## 3. Epics & Stories Overzicht
| Epic ID | Titel | Doel | Status | Stories | Opmerkingen |
|---------|-------|------|--------|---------|-------------|
| E0 | Product/UX alignment | Scope en UX flows vastleggen | Done | 2 | Route group akkoord |
| E1 | Routing & layout scheiding | Swift los van EPD layout | Done | 4 | `/epd/swift` blijft |
| E2 | Navigatie & toegang | Entry/exit flows borgen | Done | 3 | MVP only |
| E3 | Swift shell polish | Full-screen gedrag + responsive | Done | 3 | Geen redesign |
| E4 | QA & docs | Validatie en documentatie | To Do | 3 | Manual checks |

---

## 4. Epics & Stories (Uitwerking)

### Epic 0 - Product/UX alignment
Epic doel: beslissen over aanpak en de MVP scope vastleggen.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E0.S1 | Besluit en scope vastleggen | Keuze voor route group vastgelegd + out of scope lijst | Done | - | 2 |
| E0.S2 | UX entry/exit flow vastleggen | Flow voor toegang en terug naar EPD gedocumenteerd | Done | E0.S1 | 2 |

Technical notes:
- Geen code changes voor E0; alleen documentatie en alignment.

### Epic 1 - Routing & layout scheiding
Epic doel: Swift UI draait full-screen buiten EPD layout.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E1.S1 | Route group toevoegen | `app/(swift)` bestaat en `/epd/swift` blijft werken | Done | E0.S1 | 3 |
| E1.S2 | Swift layout isoleren | Swift layout rendert full-screen zonder sidebar | Done | E1.S1 | 3 |
| E1.S3 | Auth guard borgen | Ongeauth users redirect naar `/login` zoals nu | Done | E1.S2 | 2 |
| E1.S4 | EPD layout regressie check | Klassiek EPD layout ongewijzigd | Done | E1.S2 | 2 |

Technical notes:
- Geen nieuwe dependencies.
- Route group moet alleen Swift raken, niet EPD.
- EPDHeader wordt niet gebruikt in Swift; ContextBar is de top bar.

### Epic 2 - Navigatie & toegang
Epic doel: gebruikers kunnen Swift starten en verlaten zonder verwarring.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E2.S1 | Entry points controleren | Links naar `/epd/swift` werken (EPD menu/login) | Done | E1.S2 | 2 |
| E2.S2 | Exit back-link verifiëren | Context bar link naar `/epd` blijft consistent | Done | E1.S2 | 1 |
| E2.S3 | Deep link gedrag | Directe URL naar `/epd/swift` werkt met auth | Done | E1.S3 | 2 |

Technical notes:
- Geen nieuwe navigatie items tenzij nodig voor MVP.

### Epic 3 - Swift shell polish
Epic doel: full-screen ervaring is clean en consistent.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E3.S1 | Full-screen layout check | Geen sidebar spacing of EPD padding zichtbaar | Done | E1.S2 | 2 |
| E3.S2 | Responsive gedrag check | Chat/artifacts stacken op mobiel zoals nu | Done | E1.S2 | 2 |
| E3.S3 | Visuele consistentie | Context bar en offline banner correct gepositioneerd | Done | E1.S2 | 1 |

Technical notes:
- Geen redesign of nieuwe UI componenten.

### Epic 4 - QA & docs
Epic doel: MVP kwaliteit borgen en documentatie bijwerken.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|--------------|
| E4.S1 | Manual QA checklist | Alle kritieke flows handmatig getest | To Do | E3.S2 | 2 |
| E4.S2 | Bouwplan en docs bijwerken | Bouwplan + korte notitie in docs/swift | To Do | E4.S1 | 1 |
| E4.S3 | Release note (kort) | Interne note met UX impact | To Do | E4.S1 | 1 |

Technical notes:
- Gebruik `pnpm lint` voor basis check (geen extra tests).

---

## 5. Kwaliteit & Testplan

Test types:
| Test Type | Scope | Tools | Verantwoordelijke |
|-----------|-------|-------|-------------------|
| Lint | App code | pnpm lint | Developer |
| Smoke tests | Routing + auth + UX flows | Manual checklist | Developer/PO |
| Responsive check | Layout op mobile/desktop | Browser devtools | UX |

Manual test checklist:
- [ ] `/epd/swift` laadt zonder sidebar
- [ ] EPDHeader en DocsChatWidget zijn niet zichtbaar in Swift
- [ ] Ongeauth redirect naar `/login`
- [ ] Entry vanuit EPD werkt
- [ ] Back-link naar `/epd` werkt
- [ ] Chat input werkt, artifacts openen
- [ ] Mobile: chat en artifacts stacken correct
- [ ] Deep link naar `/epd/swift` volgt interface-voorkeur na login

---

## 6. Demo & Presentatieplan
Doel: korte interne demo van de standalone Swift ervaring.

Flow:
1. Open `/epd/swift` (full-screen, no sidebar)
2. Start een chat en open artifact
3. Ga terug naar `/epd` via context bar

Backup:
- Gebruik screenshots als live demo faalt.

---

## 7. Risico's & Mitigatie
| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| Route group breekt `/epd` routing | Laag | Hoog | Isoleren in `app/(swift)` en regression check | Lead dev |
| Auth redirect mismatch | Middel | Middel | E1.S3 + manual QA | Lead dev |
| UX verwarring over modus | Middel | Middel | Duidelijke back-link + docs | UX |
| Scope creep (extra features) | Hoog | Middel | MVP guardrails in E0 | PO |
| Mobile layout regressie | Laag | Middel | E3.S2 + devtools check | UX |

---

## 8. Evaluatie & Lessons Learned
Na oplevering documenteren:
- Was de mode-scheiding duidelijk voor users?
- Zijn entry/exit flows logisch?
- Zijn er regressies in klassiek EPD?

---

## 9. Referenties
- Docs: `docs/swift/fo-swift-medical-scribe-v3.md`
- Docs: `docs/swift/v3-redesign-met-huidige-styling.md`
- Docs: `docs/swift/e0-design-tokens-and-components.md`
- Code: `app/epd/layout.tsx`
- Code: `app/(swift)/epd/swift/layout.tsx`
- Code: `components/swift/command-center/command-center.tsx`

---

## 10. Glossary & Abbreviations
| Term | Betekenis |
|------|-----------|
| Epic | Grote feature of fase in development |
| Story | Kleine uitvoerbare taak binnen een epic |
| MVP | Minimum Viable Product |
| EPD | Elektronisch Patient Dossier |
| SSE | Server-Sent Events |

---

Versiehistorie:
| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 27-12-2025 | Colin Lit | Initiele versie |
