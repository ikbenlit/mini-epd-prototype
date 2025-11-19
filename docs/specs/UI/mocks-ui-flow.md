# Mini-ECD Interface Mocks & User Flow

## Navigation Architecture: Two-Level System

**LEVEL 1: Behandelaar Context** - Praktijkbeheerder overstijgend
- Dashboard → Behandelaar overzicht (caseload, taken, berichten)
- Cliënten → Zoeken, filteren, recent bekeken
- Agenda → Behandelaar agenda (alle afspraken)
- Rapportage → BI dashboards (KPI's, statistieken)

**LEVEL 2: Client Dossier Context** - Individuele cliënt focus
- Dashboard → Dossier overzicht (laatste info, afspraken)
- Intake → Gesprekken en notities
- Diagnose → DSM-classificatie, probleemprofiel
- Behandelplan → SMART doelen, interventies
- Rapportage → Client voortgang en metrics

## User Flow Overview
```
START: Behandelaar Dashboard (Level 1)
  ↓
[Sidebar: Dashboard | Cliënten | Agenda | Rapportage]
  ↓
Klik "Cliënten"
  ↓
[Cliënten Lijst met zoek/filter] ←────────────────┐
  ↓ (klik op cliënt rij)                         │
  ↓                                              │
⚡ CONTEXT SWITCH naar Level 2 ⚡                  │
  ↓                                              │
[Sidebar verandert]                              │
[Header toont: "Bas Jansen ▼"]                   │
  ↓                                              │
[Client Dashboard - Bas Jansen] ←──────┐        │
  ↓                                     │        │
[Sidebar: ← Cliënten | Dashboard | Intake | ... ]│
  ↓                                     │        │
  ├─→ [Intake]                          │        │
  ├─→ [Diagnose]                        │        │
  ├─→ [Behandelplan]                    │        │
  └─→ [Rapportage]                      │        │
       ↓                                │        │
  (sidebar menu switch binnen dossier)─┘        │
       ↓                                         │
  (klik "← Cliënten" in sidebar)────────────────┘
       ↓
⚡ CONTEXT SWITCH terug naar Level 1 ⚡
       ↓
  [Terug naar Cliënten Lijst]
       ↓
  (header dropdown "Bas Jansen ▼") → Quick switch naar andere client
       ↓
  [Client Dashboard - Anna de Vries]
```

---

## LEVEL 1 MOCKS: Behandelaar Context

---

## Mock 1A: Behandelaar Dashboard (Entry Point)
```
┌────────────────────────────────────────────────────────────────┐
│  Mini-ECD                                    [Zoek cliënt...]  │
└────────────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────────────────────────────┐
│             │                                                  │
│ Dashboard ◄ │  Dashboard                                       │
│ Cliënten    │  Welkom terug, Dr. van den Berg                 │
│ Agenda      │                                                  │
│ Rapportage  │  ┌──────────────┬──────────────┬──────────────┐ │
│             │  │ Caseload     │ Aandachts-   │ Berichten    │ │
│             │  │ 24 actief    │ punten: 3    │ 2 nieuw      │ │
│             │  │ 2 wachtlijst │              │              │ │
│             │  └──────────────┴──────────────┴──────────────┘ │
│             │                                                  │
│             │  Behandelplannen concept:                        │
│             │  • Bas Jansen - Review nodig                     │
│             │  • Anna de Vries - Nog opstellen                 │
│             │                                                  │
│             │  Aankomende afspraken (vandaag):                 │
│             │  • 14:00 - Peter Smit (Intake)                   │
│             │  • 16:30 - Bas Jansen (Sessie 3)                 │
│             │                                                  │
└─────────────┴──────────────────────────────────────────────────┘

User actions:
→ Bekijk caseload overzicht en statistieken
→ Klik op aandachtspunt: navigeer naar relevante pagina
→ Klik op client naam: navigeer naar client dossier (Level 2 switch)
→ Sidebar navigatie naar andere Level 1 schermen

Note: Detailed content to be further defined.
```

---

## Mock 1B: Cliënten Lijst
```
┌────────────────────────────────────────────────────────────────┐
│  Mini-ECD                                    [Zoek cliënt...]  │
└────────────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────────────────────────────┐
│             │                                                  │
│ Dashboard   │  Cliënten               [+ Nieuwe Cliënt]       │
│ Cliënten ◄  │                                                  │
│ Agenda      │  [Zoek op naam, BSN, of cliënt ID...........]   │
│ Rapportage  │  [Filters: Afdeling ▼ | Team ▼ | Status ▼]     │
│             │                                                  │
│             │  Recent bekeken:                                 │
│             │  [Bas J.] [Anna dV.] [Peter S.]                 │
│             │                                                  │
│             │  Naam          ID      Geb        Status         │
│             │  ────────────────────────────────────────        │
│             │  Bas Jansen    CL0002  20-11-1992 ● Actief      │
│             │  Anna de Vries CL0001  15-03-1988 ● Actief      │
│             │  Peter Smit    CL0003  22-07-1995 ● Wachtlijst  │
│             │  Maria Jansen  CL0004  11-09-1990 ● Actief      │
│             │                                                  │
│             │                                                  │
└─────────────┴──────────────────────────────────────────────────┘

User actions:
→ Type in zoekbalk: filters lijst real-time (naam, BSN, ID, geboortedatum)
→ Selecteer filters: Afdeling, Team, Status
→ Klik recent bekeken: snel naar die client
→ Klik op rij (bijv. Bas Jansen): ⚡ CONTEXT SWITCH → Client Dossier (Level 2)
→ Klik [+ Nieuwe Cliënt]: open modal/form om nieuwe cliënt toe te voegen
```

---

## Mock 1C: Behandelaar Agenda
```
┌────────────────────────────────────────────────────────────────┐
│  Mini-ECD                                    [Zoek cliënt...]  │
└────────────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────────────────────────────┐
│             │                                                  │
│ Dashboard   │  Agenda                     [+ Nieuwe Afspraak]  │
│ Cliënten    │  Week 46 | 13-19 Nov 2025           [< Vorige >]│
│ Agenda    ◄ │                                                  │
│ Rapportage  │  [Kalender weergave placeholder]                 │
│             │                                                  │
│             │  Vandaag - 19 november 2025:                     │
│             │  ┌────────────────────────────────────────────┐  │
│             │  │ 14:00-15:00 Peter Smit - Intake           │  │
│             │  │ 16:30-17:30 Bas Jansen - Sessie 3         │  │
│             │  └────────────────────────────────────────────┘  │
│             │                                                  │
│             │  Morgen - 20 november:                           │
│             │  ┌────────────────────────────────────────────┐  │
│             │  │ 10:00-11:00 Anna de Vries - Evaluatie     │  │
│             │  └────────────────────────────────────────────┘  │
└─────────────┴──────────────────────────────────────────────────┘

User actions:
→ Bekijk agenda (week/maand weergave)
→ Klik op afspraak: bekijk details of navigeer naar client dossier
→ Klik [+ Nieuwe Afspraak]: open afspraak formulier
→ Navigeer tussen weken met [< >] knoppen

Note: Detailed calendar component to be specified.
```

---

## Mock 1D: Behandelaar Rapportage
```
┌────────────────────────────────────────────────────────────────┐
│  Mini-ECD                                    [Zoek cliënt...]  │
└────────────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────────────────────────────┐
│             │                                                  │
│ Dashboard   │  Rapportage                    [Exporteer PDF]  │
│ Cliënten    │  Overzicht praktijk statistieken                │
│ Agenda      │                                                  │
│ Rapportage◄ │  ┌──────────────┬──────────────┬──────────────┐ │
│             │  │ Totaal       │ Gemiddelde   │ Wachtlijst   │ │
│             │  │ Cliënten     │ Behandel-    │ Wachttijd    │ │
│             │  │ 26           │ duur: 12 wk  │ 2 weken      │ │
│             │  └──────────────┴──────────────┴──────────────┘ │
│             │                                                  │
│             │  [Graph: Cliënten over tijd]                     │
│             │  [Graph: Behandelduur distributie]               │
│             │  [Graph: Diagnose categorieën]                   │
│             │                                                  │
└─────────────┴──────────────────────────────────────────────────┘

User actions:
→ Bekijk BI dashboards en KPI's
→ Interactie met grafieken (zoom, filter)
→ Klik [Exporteer PDF]: download rapport
→ Filter op periode, afdeling, team

Note: Detailed BI components and metrics to be defined.
```

---

## LEVEL 2 MOCKS: Client Dossier Context

**Context:** User heeft op een cliënt geklikt in de cliëntenlijst
**State:** Sidebar en Header zijn veranderd naar client-specifieke weergave

---

## Mock 2A: Client Dashboard (Dossier Overzicht - Bas Jansen)
```
┌────────────────────────────────────────────────────────────────┐
│  Mini-ECD     Bas Jansen ▼                  [Zoek cliënt...]  │
│               ID: CL0002 | Geb: 20-11-1992                     │
└────────────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────────────────────────────┐
│             │                                                  │
│ ← Cliënten  │  Dossier Overzicht                              │
│ ─────────   │                                                  │
│ Dashboard ◄ │  ┌──────────────┬──────────────┬──────────────┐ │
│ Intake      │  │Cliëntinfo    │Laatste Intake│Diagnose      │ │
│ Diagnose    │  │              │              │              │ │
│ Behandel    │  │ID: CL0002    │12-10-2023    │Ernst: Hoog ● │ │
│ Rapportage  │  │Naam: Bas J.  │14:30         │Angststoornis │ │
│             │  │Geb: 20-11-92 │              │Panietstoornis│ │
│             │  │Leeftijd: 31  │"Bas komt op  │met agorafobie│ │
│             │  │Verz: [naam]  │gesprek..."   │              │ │
│             │  │BSN: [nummer] │              │              │ │
│             │  │              │Bekijk →      │Bekijk →      │ │
│             │  └──────────────┴──────────────┴──────────────┘ │
│             │                                                  │
│             │  ┌────────────────────────────────────────────┐  │
│             │  │ Behandelplan              Status: Concept  │  │
│             │  │                                           │  │
│             │  │ SMART Doelen (3):                         │  │
│             │  │ • Verminderen paniekeaanvallen            │  │
│             │  │ • Uitbreiden sociale activiteiten         │  │
│             │  │ • Verbeteren coping strategieën           │  │
│             │  │                                           │  │
│             │  │ Interventies: CGT, Exposure therapie      │  │
│             │  │                            Bekijk plan →  │  │
│             │  └────────────────────────────────────────────┘  │
│             │                                                  │
│             │  ┌────────────────────────────────────────────┐  │
│             │  │ Afspraken                                 │  │
│             │  │                                           │  │
│             │  │ Afgelopen Afspraak                        │  │
│             │  │ │ 14-11-2025, 16:26 - Intake (60 min)     │  │
│             │  │                                           │  │
│             │  │ Komende Afspraken                         │  │
│             │  │ │ 22-11-2025, 16:26 - Psycho-educatie     │  │
│             │  │ │ 29-11-2025, 16:26 - Exposure therapie   │  │
│             │  │ │ 06-12-2025, 16:26 - Evaluatie gesprek   │  │
│             │  └────────────────────────────────────────────┘  │
│             │                                                  │
└─────────────┴──────────────────────────────────────────────────┘

User actions:
→ Klik "← Cliënten": ⚡ CONTEXT SWITCH terug naar Level 1 (cliëntenlijst)
→ Klik "Bas Jansen ▼": dropdown met recente cliënten voor quick switch
→ Type in [Zoek cliënt]: autocomplete zoeken, direct switchen naar andere client
→ Klik sidebar item (bijv. Intake): navigeer binnen client dossier
→ Klik "Bekijk →" links: navigeer naar detail sectie
→ Klik [+ Maak behandelplan]: open behandelplan wizard (als leeg)
```

---

## Mock 2B: Intake (Client Dossier - Bas Jansen)
```
┌────────────────────────────────────────────────────────────────┐
│  Mini-ECD     Bas Jansen ▼                  [Zoek cliënt...]  │
│               ID: CL0002 | Geb: 20-11-1992                     │
└────────────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────────────────────────────┐
│             │                                                  │
│ ← Cliënten  │  Intake                     [+ Nieuwe Intake]   │
│ ─────────   │                                                  │
│ Dashboard   │  Datum      Type        Status    Samenvatting  │
│ Intake    ◄ │  ─────────────────────────────────────────────  │
│ Diagnose    │                                                  │
│ Behandel    │  12-10-2023 Intake      ●Afgerond               │
│ Rapportage  │  14:30      gesprek                             │
│             │             Eerste intake. Cliënt presenteert   │
│             │             zich met angst- en paniekkl...      │
│             │                                      [Bekijk]   │
│             │  ───────────────────────────────────────────────│
│             │                                                  │
│             │  05-10-2023 Telefonisch ●Afgerond               │
│             │  10:15      intake                              │
│             │             Korte telefonische screening.       │
│             │             Doorverwijzing naar intake...       │
│             │                                      [Bekijk]   │
│             │  ───────────────────────────────────────────────│
│             │                                                  │
│             │  28-09-2023 Intake      ●Afgerond               │
│             │  16:00      gesprek                             │
│             │             Geen show. Cliënt niet verschenen,  │
│             │             geen afmelding...                   │
│             │                                      [Bekijk]   │
│             │                                                  │
└─────────────┴──────────────────────────────────────────────────┘

User actions:
→ Klik [+ Nieuwe Intake]: open TipTap editor voor nieuwe intake notitie
→ Klik [Bekijk]: open intake detail slide-in panel (zie Mock 2F)
→ Hover over rij: highlight, [Bekijk] button wordt prominent
→ Sidebar navigatie: blijf binnen client dossier context
→ Klik "← Cliënten": terug naar Level 1
```

---

## Mock 2C: Diagnose (Client Dossier - Bas Jansen)
```
┌────────────────────────────────────────────────────────────────┐
│  Mini-ECD     Bas Jansen ▼                  [Zoek cliënt...]  │
│               ID: CL0002 | Geb: 20-11-1992                     │
└────────────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────────────────────────────┐
│             │                                                  │
│ ← Cliënten  │  Diagnose & Probleemprofiel   [AI Analyse]      │
│ ─────────   │                                                  │
│ Dashboard   │  DSM-light Categorieën:                          │
│ Intake      │                                                  │
│ Diagnose  ◄ │  ┌──────────┬──────────┬──────────┐             │
│ Behandel    │  │ Stemming │  Angst   │ Gedrag   │             │
│ Rapportage  │  │  ○○○○○   │  ●●●●○   │  ○○○○○   │             │
│             │  │  Geen    │  Hoog    │  Geen    │             │
│             │  └──────────┴──────────┴──────────┘             │
│             │  ┌──────────┬──────────┬──────────┐             │
│             │  │ Middelen │ Cognitief│ Context  │             │
│             │  │  ○○○○○   │  ○○○○○   │  ●●○○○   │             │
│             │  │  Geen    │  Geen    │  Middel  │             │
│             │  └──────────┴──────────┴──────────┘             │
│             │                                                  │
│             │  Hoofddiagnose:                                  │
│             │  ┌────────────────────────────────────────────┐  │
│             │  │ Panietstoornis met agorafobie             │  │
│             │  │ Ernst: Hoog ●●●●○                         │  │
│             │  │                                           │  │
│             │  │ Bron: Intake 12-10-2023                   │  │
│             │  │ Observaties: Frequente aanvallen, sterke │  │
│             │  │ vermijding openbare ruimtes               │  │
│             │  └────────────────────────────────────────────┘  │
│             │                                                  │
└─────────────┴──────────────────────────────────────────────────┘

User actions:
→ Klik [AI Analyse]: genereer/update diagnose classificatie
→ Bekijk DSM-categorieën met ernst indicatie
→ Klik op categorie: bekijk details en bronnen
→ Bewerk diagnose handmatig indien nodig

Note: Week 3 feature - AI-powered classification
```

---

## Mock 2D: Behandelplan (Client Dossier - Bas Jansen)
```
┌────────────────────────────────────────────────────────────────┐
│  Mini-ECD     Bas Jansen ▼                  [Zoek cliënt...]  │
│               ID: CL0002 | Geb: 20-11-1992                     │
└────────────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────────────────────────────┐
│             │                                                  │
│ ← Cliënten  │  Behandelplan        [Genereer Plan] [v1▼]      │
│ ─────────   │  Status: Actief | Laatste update: 15-10-2023    │
│ Dashboard   │                                                  │
│ Intake      │  1. SMART Doelen                                 │
│ Diagnose    │  ┌────────────────────────────────────────────┐  │
│ Behandel  ◄ │  │ Doel 1: Verminderen paniekeaanvallen       │  │
│ Rapportage  │  │ Van 3x/week naar max 1x/week binnen 8 wk   │  │
│             │  │ Voortgang: ████████░░░░ 67%               │  │
│             │  │                                           │  │
│             │  │ Doel 2: Uitbreiden sociale activiteiten    │  │
│             │  │ Zelfstandig boodschappen binnen 6 weken    │  │
│             │  │ Voortgang: ████░░░░░░░░ 33%               │  │
│             │  └────────────────────────────────────────────┘  │
│             │                                                  │
│             │  2. Interventies                                 │
│             │  ┌────────────────────────────────────────────┐  │
│             │  │ • CGT - Cognitieve herstructurering        │  │
│             │  │ • Exposure therapie (gradueel)             │  │
│             │  │ • Ontspanningstechnieken                   │  │
│             │  └────────────────────────────────────────────┘  │
│             │                                                  │
│             │  3. Frequentie: Wekelijks, 12 sessies           │
│             │  4. Meetmomenten: Week 4, 8, 12                  │
│             │                                                  │
└─────────────┴──────────────────────────────────────────────────┘

User actions:
→ Klik [Genereer Plan]: AI genereert behandelplan op basis van intake+diagnose
→ Klik [v1▼]: bekijk of wissel tussen plan versies
→ Bewerk doelen, interventies, frequentie
→ Track voortgang per doel
→ Exporteer plan naar PDF

Note: Week 3 feature - AI plan generator
```

---

## Mock 2E: Rapportage (Client Dossier - Bas Jansen)
```
┌────────────────────────────────────────────────────────────────┐
│  Mini-ECD     Bas Jansen ▼                  [Zoek cliënt...]  │
│               ID: CL0002 | Geb: 20-11-1992                     │
└────────────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────────────────────────────┐
│             │                                                  │
│ ← Cliënten  │  Rapportage & Voortgang      [Exporteer PDF]    │
│ ─────────   │                                                  │
│ Dashboard   │  ┌──────────────┬──────────────┬──────────────┐ │
│ Intake      │  │ Behandel-    │ Sessies      │ Algehele     │ │
│ Diagnose    │  │ duur         │ Voltooid     │ Voortgang    │ │
│ Behandel    │  │ 8 weken      │ 6 van 12     │ 67%          │ │
│ Rapportage◄ │  └──────────────┴──────────────┴──────────────┘ │
│             │                                                  │
│             │  Doelvoortgang over tijd:                        │
│             │  [Line graph showing progress on goals]          │
│             │                                                  │
│             │  Sessie overzicht:                               │
│             │  ┌────────────────────────────────────────────┐  │
│             │  │ 12-10 Intake      ✓ Aanwezig               │  │
│             │  │ 19-10 Sessie 1    ✓ Aanwezig               │  │
│             │  │ 26-10 Sessie 2    ✓ Aanwezig               │  │
│             │  │ 02-11 Sessie 3    ✓ Aanwezig               │  │
│             │  │ 09-11 Sessie 4    ✗ No-show                │  │
│             │  │ 16-11 Sessie 5    ✓ Aanwezig               │  │
│             │  └────────────────────────────────────────────┘  │
│             │                                                  │
└─────────────┴──────────────────────────────────────────────────┘

User actions:
→ Bekijk voortgang visualisaties
→ Filter op periode, doel, interventie
→ Klik [Exporteer PDF]: download rapport voor dossier
→ Bekijk attendance en sessie details

Note: Content and metrics to be further defined.
```

---

## Mock 2F: Intake Detail (Slide-in Panel)
```
┌────────────────────────────────────────────────────────────────┐
│  Mini-ECD     Bas Jansen ▼                  [Zoek cliënt...]  │
│               ID: CL0002 | Geb: 20-11-1992                     │
└────────────────────────────────────────────────────────────────┘
┌─────────────┬──────────────────────────┬───────────────────────┐
│             │                          │                       │
│ ← Cliënten  │  Intake      [+ Nieuwe]  │ Intake - 12-10-2023 ✕ │
│ ─────────   │                          │ ─────────────────────│
│ Dashboard   │  Datum    Type    Status │ Algemene informatie  │
│ Intake    ◄ │  ───────────────────     │                      │
│ Diagnose    │                          │ Datum & tijd:        │
│ Behandel    │  12-10 Intake ●Afgr.     │ 12-10-2023, 14:30    │
│ Rapportage  │  [row highlighted]       │                      │
│             │         [Bekijk]         │ Type: Intake gesprek │
│             │  ─────────────────       │ Behandelaar: [naam]  │
│             │                          │ Duur: 60 minuten     │
│             │  05-10 Telef. ●Afgr.     │                      │
│             │         [Bekijk]         │ ───────────────────  │
│             │  ─────────────────       │                      │
│             │                          │ Gespreksnotities     │
│             │  28-09 Intake ●Afgr.     │                      │
│             │         [Bekijk]         │ Bas komt op gesprek  │
│             │                          │ vanwege spannings-   │
│             │                          │ klachten en paniek-  │
│             │                          │ aanvallen. Hij be-   │
│             │                          │ schrijft situaties   │
│             │                          │ in het openbaar...   │
│             │                          │                      │
│             │                          │ Anamnese: Klachten   │
│             │                          │ bestaan sinds 1 jaar │
│             │                          │ Begonnen na stress-  │
│             │                          │ volle periode...     │
│             │                          │                      │
│             │                          │ [scrollable content] │
│             │                          │                      │
│             │                          │ ───────────────────  │
│             │                          │                      │
│             │                          │ [Verwijderen] [Bewerken]│
│             │                          │                      │
└─────────────┴──────────────────────────┴───────────────────────┘

User actions:
→ Klik ✕: sluit panel, terug naar Intakes lijst
→ Klik [Bewerken]: open intake in edit mode
→ Klik [Verwijderen]: confirmatie dialog → verwijder intake
→ Scroll in panel: bekijk volledige notities
→ Klik buiten panel (op main content): sluit panel
```

---

## Mock 2G: Client Switcher (Dropdown from Header)

**Context:** Alleen beschikbaar in Level 2 (Client Dossier Context)

```
┌────────────────────────────────────────────────────────────────┐
│  Mini-ECD   ┌─────────────────────────┐  [Zoek cliënt...]    │
│             │ Bas Jansen ▼            │                       │
│             │ ID: CL0002 | 20-11-1992 │                       │
│             ├─────────────────────────┤                       │
│             │ Recente cliënten:       │                       │
│             │ ─────────────────────   │                       │
│             │ ● Anna de Vries         │                       │
│             │   CL0001 | 15-03-1988   │                       │
│             │                         │                       │
│             │ ● Peter Smit            │                       │
│             │   CL0003 | 22-07-1995   │                       │
│             │                         │                       │
│             │ ● Maria Jansen          │                       │
│             │   CL0004 | 11-09-1990   │                       │
│             │                         │                       │
│             │ ─────────────────────   │                       │
│             │ [Alle cliënten →]       │                       │
│             └─────────────────────────┘                       │
└────────────────────────────────────────────────────────────────┘

User actions:
→ Klik op naam in dropdown: switch naar die cliënt (blijf op zelfde sectie)
  Bijv: Op Intake pagina van Bas → klik Anna → ga naar Intake pagina van Anna
→ Klik [Alle cliënten →]: ⚡ CONTEXT SWITCH naar Level 1 (cliëntenlijst)
→ Klik buiten dropdown: sluit dropdown
→ Type in zoekbalk: autocomplete met alle cliënten

Note: Recent cliënten worden automatisch bijgewerkt bij navigatie
```

---

## Complete User Flow Scenarios

### Scenario 1: Start applicatie → Client dossier bekijken
```
1. User logt in en start op [Behandelaar Dashboard] (Level 1)
2. Bekijk caseload overzicht en aandachtspunten
3. Klik sidebar "Cliënten"
4. Navigeer naar [Cliënten Lijst]
5. Type "Bas" in zoekbalk, zie gefilterde resultaten
6. Klik op "Bas Jansen" rij
7. ⚡ CONTEXT SWITCH naar Level 2
8. Sidebar verandert: "← Cliënten | Dashboard | Intake | ..."
9. Header toont: "Bas Jansen ▼ | ID: CL0002 | Geb: 20-11-1992"
10. Bekijk [Client Dashboard - Bas Jansen] met overzicht
```

### Scenario 2: Nieuwe intake toevoegen
```
1. User zit in [Client Dashboard - Bas Jansen] (Level 2)
2. Klik sidebar "Intake"
3. Navigeer naar [Intake - Bas Jansen]
4. Klik [+ Nieuwe Intake]
5. TipTap editor opent voor nieuwe notitie
6. Type gespreknotities met rich text formatting
7. Klik [AI Samenvatting] (optioneel, Week 3 feature)
8. AI genereert samenvatting in 5 seconden
9. Klik [Opslaan]
10. Nieuwe intake verschijnt bovenaan lijst met status badge
```

### Scenario 3: Tussen cliënten switchen tijdens werk
```
1. User zit in [Intake - Bas Jansen] (Level 2)
2. Klik "Bas Jansen ▼" in header center
3. Dropdown opent met recente cliënten
4. Klik "Anna de Vries"
5. Blijf in Level 2, navigeer naar [Intake - Anna de Vries]
6. Sidebar blijft client-specifiek, header update naar Anna's gegevens
```

### Scenario 4: Van client dossier terug naar behandelaar overzicht
```
1. User zit in [Behandelplan - Bas Jansen] (Level 2)
2. Klaar met werk aan behandelplan
3. Klik "← Cliënten" in sidebar
4. ⚡ CONTEXT SWITCH terug naar Level 1
5. Sidebar verandert: "Dashboard | Cliënten | Agenda | Rapportage"
6. Header center wordt leeg (geen client dropdown)
7. Navigeer naar [Cliënten Lijst]
8. User kan nieuwe client selecteren of naar ander Level 1 scherm
```

### Scenario 5: Behandelplan genereren met AI
```
1. User zit in [Client Dashboard - Bas Jansen] (Level 2)
2. Bekijk diagnose card: "Ernst: Hoog - Panietstoornis"
3. Bekijk behandelplan card: "Geen behandelplan gevonden"
4. Klik [+ Maak behandelplan]
5. Navigeer naar [Behandelplan - Bas Jansen]
6. Klik [Genereer Plan] button
7. AI analyseert intake notities + diagnose
8. Plan wordt gegenereerd met SMART doelen en interventies
9. User beoordeelt en past aan indien nodig
10. Klik [Opslaan als Concept] of [Publiceren]
11. Plan verschijnt op Client Dashboard met status badge
```

### Scenario 6: Intake detail bekijken en bewerken
```
1. User zit in [Intake - Bas Jansen] (Level 2)
2. Klik [Bekijk] bij intake van 12-10-2023
3. Slide-in panel opent aan rechterkant (400px breed)
4. Bekijk algemene informatie en volledige gespreksnotities
5. Scroll door notities, lees AI samenvatting (indien aanwezig)
6. Klik [Bewerken] in panel footer
7. TipTap editor opent in bewerkmodus
8. Wijzig notities, voeg toe, pas formatting aan
9. Klik [Opslaan]
10. Panel sluit, terug naar [Intake - Bas Jansen] lijst
11. Gewijzigde intake toont "Bewerkt" timestamp
```

### Scenario 7: Quick search tussen contexten
```
1. User zit in [Behandelaar Dashboard] (Level 1)
2. Type "CL0002" in header zoekbalk
3. Autocomplete toont "Bas Jansen - CL0002 | 20-11-1992"
4. Klik op resultaat
5. ⚡ CONTEXT SWITCH naar Level 2
6. Navigeer direct naar [Client Dashboard - Bas Jansen]
7. Header en sidebar passen zich aan

Alternative vanaf Level 2:
1. User zit in [Diagnose - Anna de Vries] (Level 2)
2. Type "Peter" in header zoekbalk
3. Autocomplete toont "Peter Smit - CL0003"
4. Klik op resultaat
5. Blijf in Level 2, navigeer naar [Diagnose - Peter Smit]
```

---

## Navigation Rules

### Context Switching (Level 1 ↔ Level 2):

**Van Level 1 naar Level 2:**
- Trigger: Klik op een client rij in cliëntenlijst
- Effect: Sidebar verandert naar client-specifiek menu
- Effect: Header center toont client dropdown "Bas Jansen ▼"
- Navigeert naar: Client Dashboard (dossier overzicht)

**Van Level 2 naar Level 1:**
- Trigger: Klik "← Cliënten" button in sidebar
- Effect: Sidebar verandert terug naar behandelaar menu
- Effect: Header center wordt leeg/disabled
- Navigeert naar: Cliënten Lijst
- Keyboard shortcut: Esc (of Alt+C)

### Sidebar Behavior:

**In Level 1 (Behandelaar Context):**
- Menu items: Dashboard | Cliënten | Agenda | Rapportage
- Geen "← Cliënten" button
- Active state op huidige pagina
- Navigatie blijft binnen Level 1

**In Level 2 (Client Dossier Context):**
- "← Cliënten" button bovenaan (back to Level 1)
- Divider
- Menu items: Dashboard | Intake | Diagnose | Behandelplan | Rapportage
- Active state op huidige sectie
- Navigatie blijft binnen hetzelfde client dossier
- Switchen tussen clients via header dropdown blijft in Level 2

### Header Client Dropdown:

**Alleen beschikbaar in Level 2:**
- Toont geselecteerde client: "Bas Jansen ▼"
- Sub-text: "ID: CL0002 | Geb: 20-11-1992"
- Dropdown inhoud:
  - Recente cliënten (laatste 3-5 bezocht)
  - Divider
  - "Alle cliënten →" link (navigeert naar Level 1)
- Switchen behoudt huidige sectie type
  - Bijv: Intake van Bas → klik Anna → Intake van Anna
- Keyboard shortcut: Alt+K

**In Level 1:**
- Geen client dropdown (of disabled/grayed out)
- Optioneel: Behandelaar naam/info

### Header Zoekbalk:

**Beschikbaar in beide levels:**
- Live autocomplete tijdens typen
- Zoekt op: naam, BSN, cliënt ID, geboortedatum
- Toont: Naam - ID | Geboortedatum in resultaten
- Keyboard shortcut: Cmd/Ctrl+K

**Gedrag in Level 1:**
- Enter of klik op resultaat: Switch naar Level 2, navigeer naar Client Dashboard

**Gedrag in Level 2:**
- Enter of klik op resultaat: Blijf in Level 2, switch naar gekozen client
- Behoudt huidige sectie (blijf op Intake als je op Intake zat)

### Active State Indicators:

**Sidebar:**
- Highlighted background (licht blauw/grijs)
- Bold text
- Left border accent (3px teal/blauw)
- Icon kleurt mee

**Tab/Section:**
- Visual feedback dat huidige sectie actief is
- Breadcrumb (optioneel) toont pad

### URL Structure & Browser Back:

**URL patterns:**
```
Level 1:
/epd/dashboard           → Behandelaar dashboard
/epd/clients             → Cliënten lijst
/epd/agenda              → Behandelaar agenda
/epd/reports             → Rapportage/BI

Level 2:
/epd/clients/CL0002           → Client dashboard
/epd/clients/CL0002/intake    → Intake sectie
/epd/clients/CL0002/diagnose  → Diagnose sectie
/epd/clients/CL0002/plan      → Behandelplan
/epd/clients/CL0002/reports   → Client rapportage
```

**Browser back button:**
- Werkt zoals verwacht door URL geschiedenis
- Van Level 2 terug naar vorige Level 2 pagina
- Van Client Dashboard terug naar Cliënten Lijst (Level 1)
- Sidebar en header passen zich automatisch aan op basis van URL

---

## State Persistence

### User komt terug in app:
- Heropent laatste bezochte scherm (via localStorage of session)
- Als dat Level 2 was: herstel client context (sidebar + header)
- Als dat Level 1 was: toon behandelaar context
- Als sessie verlopen: start bij [Behandelaar Dashboard] (Level 1)

### Browser refresh:
- URL bepaalt welk scherm en context
- URL parsing detecteert automatisch Level 1 vs Level 2
- Sidebar en header worden automatisch geconfigureerd

**Level 1 URL's:**
```
/epd/dashboard    → Behandelaar dashboard
/epd/clients      → Cliënten lijst
/epd/agenda       → Behandelaar agenda
/epd/reports      → BI rapportage
```

**Level 2 URL's:**
```
/epd/clients/CL0002           → Client dashboard (Bas)
/epd/clients/CL0002/intake    → Intake van Bas
/epd/clients/CL0002/diagnose  → Diagnose van Bas
/epd/clients/CL0002/plan      → Behandelplan van Bas
```

### Recent clients lijst:
- Opgeslagen in localStorage: `recent_clients: string[]`
- Wordt bijgewerkt bij elke client view (Level 2 entry)
- Max 5 items
- Gesorteerd op laatst bezocht (nieuwste bovenaan)
- Format per item:
```typescript
{
  id: string;           // "CL0002"
  name: string;         // "Bas Jansen"
  birthDate: string;    // "20-11-1992"
  lastVisited: Date;    // timestamp
}
```

### Context State Management:
- Global state tracks: `currentContext: 'behandelaar' | 'client'`
- If context === 'client', also track: `selectedClientId: string`
- Sidebar component subscribes to context changes
- Header component subscribes to context + selectedClient changes
- Context changes trigger sidebar/header re-render

### Scroll Position & Form State:
- Scroll position bewaard per pagina (Level 1 en Level 2 apart)
- Formulieren met unsaved changes: waarschuwing bij navigatie
- TipTap editor: auto-save draft elke 30 seconden (localStorage)

### URL Query Parameters (optioneel):
- Tab states: `/epd/clients/CL0002?tab=intake`
- Filter states: `/epd/clients?status=actief&team=team-a`
- Sorting: `/epd/clients?sortBy=name&order=asc`