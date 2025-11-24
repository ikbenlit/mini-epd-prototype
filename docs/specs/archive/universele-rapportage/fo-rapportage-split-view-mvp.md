# 🧩 Functioneel Ontwerp (FO) – Universele Rapportage Split View MVP

**Projectnaam:** Mini-EPD – Universele Rapportage Split View  
**Versie:** v0.1 (concept MVP)  
**Datum:** 06-03-2025  
**Auteur:** Codex Agent  

---

## 1. Doel en relatie met het PRD
🎯 **Doel van dit document:**
Beschrijving van de functionele werking voor een MVP waarin behandelaren tegelijk een rapportage kunnen schrijven en eerdere notities kunnen raadplegen, passend binnen het bestaande PRD voor Universele Rapportage.

📘 **Toelichting aan de lezer:**
Het FO focust op de split-view workflow (timeline + composer). Technische keuzes (server actions, Supabase) staan elders. Gebruik dit document om scope-afbakening voor MVP (Week 3) af te stemmen.

---

## 2. Overzicht van de belangrijkste onderdelen
1. **Rapportage Header & Navigatie** – knop "Nieuwe rapportage" scrollt naar composer en linkt vanaf andere tabs.  
2. **KPI Tiles** – tonen kernstatistieken (totaal, AI, laatste activiteit).  
3. **Filterpaneel** – zoekveld, typefilter, (nog toe te voegen) auteur/datum-filter.  
4. **Timeline Lijst** – scrollbare lijst met kaartjes, selectie, soft delete.  
5. **Composer Paneel** – tekstarea, spraakinput, AI-classificatie, referenties.  
6. **Mobiele Drawer** – responsive variant waarin timeline↔composer gewisseld worden. *(Nog te bouwen)*

---

## 3. Userstories
| ID | Rol | Doel / Actie | Waarde | Prioriteit |
|----|-----|--------------|--------|------------|
| UR-01 | Behandelaar | Terwijl ik schrijf wil ik vorige rapportages kunnen inzien | Context houden, fouten voorkomen | Hoog |
| UR-02 | Behandelaar | Ik wil via filters snel de juiste notitie van collega vinden | Tijdsbesparing | Hoog |
| UR-03 | Behandelaar | Ik wil AI laten bepalen welk type rapport ik schrijf | Consistentie, minder fouten | Hoog |
| UR-04 | Behandelaar | Ik wil een geselecteerde notitie als quote aan mijn verslag toevoegen | Bronverwijzing, samenwerking | Middel |
| UR-05 | Behandelaar | Op mobiel wil ik vloeiend wisselen tussen lezen en schrijven | Onderweg kunnen rapporteren | Middel |
| UR-06 | PO | Ik wil weten hoeveel AI-notities er zijn per client | KPI/usage | Laag |

---

## 4. Functionele werking per onderdeel

### 4.1 Rapportage Header & Navigatie
* Header toont cliëntnaam, status, laatste wijziging; knop "Nieuwe rapportage".  
* Knop logica: staat gebruiker al op `/rapportage`, scroll dan naar composer (`#rapportage-composer` focus). Zo niet, navigeer naar rapportage en append hash zodat browser direct scrolt.  
* ID van de composer moet focusbaar zijn (`tabIndex=-1` zodat `focus()` werkt).

### 4.2 KPI Tiles
* Toont 3 cards (totaal rapportages, AI-geclassificeerde rapportages, laatste activiteit).  
* Data wordt client-side afgeleid uit `initialReports`.  
* Wanneer nieuwe rapportage wordt aangemaakt of verwijderd worden tiles realtime herberekend.  
* Lege état: tekst "Nog geen rapportages" + `—` voor laatste activiteit.

### 4.3 Filterpaneel
* Zoekveld filtert op tekst in body of AI reason.  
* Type-filter (dropdown) toont alle rapporttypes, standaard "Alle".  
* MVP-toevoegingen:  
  - Auteur-filter (dropdown met lijst van `created_by`).  
  - Datumfilter (van/tot) met quick-pills (Vandaag, 7d, 30d).  
  - Resetknop.

### 4.4 Timeline Lijst
* Kaartjes tonen type-badge, timestamp, maker, AI-confidence en contentpreview.  
* Klik of Enter/Space selecteert item en highlight border.  
* Delete-knop voert soft delete uit via server action, toont toast en verwijdert item lokaal.  
* MVP-toevoegingen:  
  - Inline "Expand" om volledige tekst te lezen zonder composer te verlaten.  
  - Paginatie of virtual scroll voor >50 items.  
  - Indicator welke notities AI-gegenereerd zijn (badge).  
  - Autorisatie-check (alleen eigen dossiers, reeds door Supabase RLS, maar lege states voor forbidden).

### 4.5 Composer Paneel
* Tekstveld (20–5000 chars), spraakrecorder (Deepgram), AI-classificatie, type dropdown.  
* Bottom bar toont status: "Concept wordt lokaal bijgehouden".  
* Opslaan: server action `createReport` → toast success, reset state, highlight nieuwe entry.  
* MVP-toevoegingen:  
  - Draft/autosave naar localStorage (per client) + timestamp, warning bij weg navigeren.  
  - Undo/redo per sessie.  
  - Attachments (placeholder).  
  - Loading skeleton zodat composer niet flasht bij SSR.

### 4.6 Referentie toevoegen
* Wanneer timeline-entry geselecteerd is, toont composer een "Geselecteerde rapportage" kaart.  
* "Voeg referentie toe" voegt quote block in met snippet + meta.  
* MVP: markeer binnen editor dat het een referentie is (bijv. blockquote-styling) en zorg dat quote 1-op-1 linkt terug naar bron (ID link).  
* Bij wisselen van selectie mag composer vragen of huidige quote moet worden vervangen.

### 4.7 Mobiele Drawer (nog bouwen)
* Tabbed header `[Timeline] [Rapportage+]`.  
* Timeline tab = stack van kaarten; verkeer identiek.  
* Rapportage tab opent composer in drawer (~75% hoogte) met drag handle en "Terug".  
* Autosave badge en AI-knoppen bewegen mee.  
* Sticky CTA in footer.

---

## 5. UI-overzicht (visuele structuur)
```
┌───────────────────────────────────────────────┐
│ Topbalk: cliëntnaam, acties, zoeken          │
├───────────────┬──────────────────────────────┤
│ Filters +     │  Composer                    │
│ Timeline (L)  │  - Header "Nieuwe ..."       │
│ - Search      │  - Textarea + speech         │
│ - Type pills  │  - AI badge + dropdown       │
│ - Timeline    │  - Referentie card           │
│               │  - Sticky buttons            │
├───────────────┴──────────────────────────────┤
│ Footer/Toasts │ Autosave msgs                │
└───────────────────────────────────────────────┘
```
Mobiel: tabs bovenaan, composer als drawer.

---

## 6. Interacties met AI
| Locatie | AI-actie | Trigger | Output |
|---------|----------|---------|--------|
| Composer | Classificatie | Knop "Analyseer met AI" | JSON `{ type, confidence, reasoning }`, toont in badge + dropdown default |
| Composer | Typekeuze | User accepteert AI-type | Dropdown wordt vooringevuld, user kan overschrijven |
| (Toekomst) Timeline filter | AI context chips | Klik op AI badge in kaart | Filtert timeline op dat type |

---

## 7. Gebruikersrollen en rechten
| Rol | Toegang | Beperkingen |
|-----|---------|-------------|
| Behandelaar | Rapportage workspace voor eigen cliënten | Alleen RLS-toegelaten dossiers, soft delete alleen eigen rapportages |
| Supervisor (optioneel) | Timeline lezen | Geen composer, geen delete |

---

## 8. Bijlagen & Referenties
- PRD Universele Rapportage v1.0  
- TO Universele Rapportage v1.0  
- Bouwplan Universele Rapportage v1.0  
- Rapportage Split View ontwerpnotities (docs/specs/screening-intake/rapportage-split-view-design.md)
