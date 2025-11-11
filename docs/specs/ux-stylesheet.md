# 🎨 Kleur Stylesheet – Mini‑ECD (v2, UX‑geoptimaliseerd)

> Doel: consistente, toegankelijke kleuren met **lage cognitieve belasting**. Accentpalet teruggebracht tot **3 modules** (Afspraken, Medicatie/Herinneringen, Lab/Resultaten). Inclusief duidelijke states en contrastrichtlijnen.

---

## 🌐 Basiskleuren

* **App‑achtergrond**: `#F8FAFC`
* **Oppervlak (kaarten/modals)**: `#FFFFFF`
* **Sub‑oppervlak** (sekundair paneel/right‑rail): `#F1F5F9`
* **Tekst primair**: `#0F172A`
* **Tekst secundair**: `#475569`
* **Borders/Dividers**: `#E2E8F0`

**WCAG tip:** tekst op witte of zachte pastelfondsen ≥ `#0F172A` / `#1E293B` voor AA‑contrast.

---

## 🔹 Merk & Primaire UI

* **Primary / Brand**: `#3B82F6`

  * Hover: `#2563EB`
  * Active: `#1D4ED8`
  * Subtle bg (chips, empty‑states): `#EFF6FF`
  * On‑Primary text/icon: `#FFFFFF`

* **Neutral CTA (secundair/terug)**: `#334155`

  * Hover: `#1F2937`
  * On‑Neutral: `#FFFFFF`

---

## 📊 Module‑accenten (gereduceerd)

Gebruik **max. drie** accentfamilies. Pastel voor kaarten + een verzadigd accent voor iconen/teksten.

1. **Afspraken**

* Card bg: `#E8F8EF`
* Accent (icon/label): `#16A34A`
* Border: `#CDECDC`

2. **Medicatie / Herinneringen**

* Card bg: `#FEF6DC`
* Accent: `#F59E0B`
* Border: `#F6E7B6`

3. **Lab / Resultaten**

* Card bg: `#FFEBDC`
* Accent: `#F97316`
* Border: `#FFD2B8`

> **Toegankelijkheid:** tekst op pastelkaarten in **donkergrijs `#0F172A`**. Accentkleur enkel voor iconen/badges/kleine headings.

---

## ⚠️ Status & Feedback

* **Success**: `#16A34A`
* **Warning**: `#EAB308`
* **Error**: `#DC2626`
* **Info**: `#3B82F6`

**Subtle backgrounds**

* Success subtle: `#ECFDF5`
* Warning subtle: `#FEFCE8`
* Error subtle: `#FEF2F2`
* Info subtle: `#EFF6FF`

**Toasts/alerts**

* Tekst: `#0F172A`
* Icon: statuskleur
* Border: statuskleur op 30% (bijv. mix met wit)

---

## 🏷️ Badges & Labels (Severity DSM‑light)

* **Laag**: bg `#E5E7EB`, text `#374151`
* **Middel**: bg `#FEF3C7`, text `#92400E`
* **Hoog**: bg `#FEE2E2`, text `#991B1B`

---

## ✍️ Formulieren & Invoervelden

* **Input bg**: `#FFFFFF`
* **Input text**: `#0F172A`
* **Placeholder**: `#94A3B8`
* **Border default**: `#CBD5E1`
* **Border hover**: `#94A3B8`
* **Focus**: 2px ring `#3B82F6` + 1px inset border `#2563EB`
* **Disabled**: bg `#F1F5F9`, text `#94A3B8`, border `#E2E8F0`
* **Invalid**: border `#DC2626`, help‑text `#B91C1C`

**Select/Dropdown**

* Menu bg: `#FFFFFF`
* Hover option: `#F1F5F9`
* Active/selected: left bar `#3B82F6`

---

## 🧩 Component‑states (Buttons/Links/Cards)

**Primary button**

* Default: bg `#3B82F6`, text `#FFFFFF`
* Hover: bg `#2563EB`
* Active: bg `#1D4ED8`
* Disabled: bg `#BFDBFE`, text `#FFFFFF` @ 70%

**Secondary button**

* Default: bg `#334155`, text `#FFFFFF`
* Hover: bg `#1F2937`
* Disabled: bg `#CBD5E1`, text `#FFFFFF` @ 60%

**Ghost button**

* Text: `#334155`; hover bg: `#F1F5F9`

**Links**

* Default: `#2563EB`
* Hover/Focus: underline + `#1D4ED8`
* Visited: `#4F46E5`

**Cards**

* Default: bg `#FFFFFF`, border `#E2E8F0`, shadow sm
* Hoverable variant: shadow md + translateY(‑1px)

---

## 🗺️ Navigatie

* **Sidebar item**

  * Default text: `#334155`
  * Active: text `#0F172A`, bg `#E2E8F0`, left accent bar `#3B82F6`
  * Disabled: text `#94A3B8`

* **Topbar**

  * Bg: `#FFFFFF`, border‑bottom: `#E2E8F0`

---

## 🌫️ Elevation & Focus

* **Shadows**

  * sm: `0 1px 2px rgba(15,23,42,0.06)`
  * md: `0 2px 6px rgba(15,23,42,0.08)`
  * lg: `0 8px 20px rgba(15,23,42,0.10)`

* **Focus ring (universeel)**: 2px `#3B82F6` buiten het element + 1px contrast‑border.

---

## ♿ Toegankelijkheidsrichtlijnen

* Minimale contrastverhouding **AA**:

  * Body‑tekst op wit ≥ 4.5:1 (gebruik `#0F172A`/`#1E293B`)
  * Tekst op gekleurde knoppen altijd **wit** (`#FFFFFF`) en check contrast.
* Gebruik niet alleen kleur: combineer status met **icoon**, **label** of **shape**.
* Focus is altijd zichtbaar (geen `outline: none`).

---

## 🔧 Semantische tokens (aliasing)

Gebruik semantische namen in code i.p.v. ruwe HEX‑waarden:

* `--color-bg`, `--color-surface`, `--color-text`, `--color-border`
* `--color-brand`, `--color-brand-hover`, `--color-info`, `--color-success`, `--color-warning`, `--color-error`
* `--color-module-appointments`, `--color-module-meds`, `--color-module-labs`

---

## 📌 Notities

* Accentpalet bewust klein gehouden → minder visuele ruis, sneller scannen.
* Kaarten tonen **accent** alleen in icoon/badge of kleine titel; content blijft donker op licht voor leesbaarheid.
* Voor donker thema kunnen bovenstaande waarden gespiegeld worden met lichtere teksten en donkerder oppervlakken.
