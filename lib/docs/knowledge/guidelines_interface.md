# Interface Handleiding

Het Mini-EPD heeft een two-level context systeem. Desktop-first, geoptimaliseerd voor professioneel gebruik in een klinische omgeving.

## Two-Level Context System

### Level 1: Behandelaar Context

**Wanneer:** Geen cliënt geselecteerd

**Navigatie in linkerzijbalk:**
- **Dashboard** - Caseload overzicht en taken
- **Cliënten** - Zoeken en selecteren
- **Agenda** - Alle afspraken
- **Rapportage** - BI dashboards

**Use Case:** Behandelaar krijgt overzicht van de hele caseload, plant afspraken, en ziet aandachtspunten.

### Level 2: Client Dossier Context

**Wanneer:** Cliënt geselecteerd (via klik op cliënt in lijst)

**Navigatie wijzigt naar:**
- **← Cliënten** - Terug naar behandelaar context
- **Dashboard** - Dossier overzicht
- **Basisgegevens** - NAW en contactgegevens
- **Intakes** - Gesprekken en notities
- **Screening** - Hulpvraag en besluit
- **Diagnose** - DSM classificatie
- **Behandelplan** - SMART doelen en interventies
- **Rapportage** - Cliënt-specifieke verslagen

**Use Case:** Behandelaar werkt intensief met een specifieke cliënt.

## Typische Navigatie Workflow

1. **Start** - Je begint op het behandelaar dashboard met overzicht van je caseload
2. **Cliënt selecteren** - Klik op "Cliënten" in het menu
3. **Dossier openen** - Klik op een cliënt om het dossier te openen
4. **Context wijzigt** - Het menu toont nu cliënt-specifieke opties
5. **Door dossier navigeren** - Gebruik het menu om tussen secties te wisselen
6. **Terug naar overzicht** - Klik op "← Cliënten" om terug te gaan
7. **Snel wisselen** - Gebruik de dropdown in de header voor andere cliënt
8. **Zoeken** - Gebruik de zoekbalk rechtsboven om direct naar een cliënt te springen

## Layout Structuur

### Header (bovenaan)
- **Links:** Logo/branding "Mini-ECD"
- **Midden:** Client selector (toont geselecteerde cliënt met ID)
- **Rechts:** Zoekbalk "Zoek cliënt..."

### Sidebar (links, 240px)
Context-aware menu dat wijzigt afhankelijk van level 1 of 2.

### Main Content (rechts)
- Witte achtergrond
- 32px padding
- Scrollbare inhoud

## Veelgebruikte Schermen

### Behandelaar Dashboard (Level 1)
Toont:
- Caseload overzicht (aantal actieve cliënten)
- Aandachtspunten en urgente taken
- Behandelplannen in concept status
- Aankomende afspraken

### Cliëntenlijst (Level 1)
Features:
- Zoekbalk met filters (Afdeling, Team, Status)
- Recent bekeken cliënten (quick access)
- Tabel met: Naam | ID | Geboortedatum | Status | Laatste Contact
- "Nieuwe Cliënt" button rechtsboven

### Client Dashboard (Level 2)
Card grid met:
- Cliëntinformatie (ID, naam, geboortedatum)
- Laatste intake samenvatting
- Diagnose en ernst indicatie
- Behandelplan status
- Komende afspraken

## Veelgebruikte Knoppen

| Knop | Functie |
|------|---------|
| **+ Nieuw** / **+ Nieuwe [Item]** | Nieuw item aanmaken |
| **Bewerken** | Gegevens wijzigen |
| **Opslaan** | Wijzigingen bewaren |
| **Annuleren** | Wijzigingen ongedaan maken |
| **Bekijk** | Details openen |
| **Verwijderen** | Item verwijderen (met bevestiging) |

## Status Badges

Badges tonen de status met kleur:
- **Groen** (Actief/Afgerond) - Successtatus
- **Geel** (Concept/Wachtlijst) - In afwachting
- **Rood** (Hoog risico) - Ernst indicatie
- **Blauw** (Type indicator) - Informatief

## Intake Detail Panel

Bij klikken op "Bekijk" bij een intake schuift een panel in vanaf rechts (400px):
- Header met datum en sluitknop
- Algemene informatie (datum, tijd, type, duur)
- Gespreksnotities (scrollbaar)
- AI Samenvatting (indien beschikbaar)
- Bewerken en Verwijderen acties onderaan

## Tips voor Efficiënt Werken

1. **Gebruik de zijbalk** voor snelle navigatie tussen secties
2. **Client dropdown** in header voor snel wisselen tussen cliënten
3. **Zoekbalk** rechtsboven om direct naar een cliënt te springen
4. **Recent bekeken** in cliëntenlijst voor snelle toegang
5. **Sla regelmatig op** - sommige velden slaan niet automatisch op

## Toegankelijkheid

**Toetsenbord navigatie:**
- Alle knoppen en links zijn bereikbaar met Tab
- Logische volgorde door de pagina
- Duidelijk zichtbare focus indicatie

**Kleurgebruik:**
- Voldoende contrast voor leesbaarheid
- Status badges zijn ook zonder kleur te onderscheiden

## Wat zit er NIET in de MVP?

- Mobile/tablet versie (alleen desktop)
- Dark mode
- Geavanceerde filters en bulk acties
- Export naar PDF/CSV
- Push notificaties
