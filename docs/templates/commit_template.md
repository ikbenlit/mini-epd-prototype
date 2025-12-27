# 📝 Commit Message Template

**Doel:** Consistente commit messages voor een begrijpelijke projectgeschiedenis.  
**Tip:** Blijf compact - body en footer zijn optioneel, alleen toevoegen als het nodig is voor duidelijkheid.

---

## Structuur

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Voorbeeld:**
```
feat(epd): voeg AI-samenvatting toe aan intakeverslag

Voegt een nieuwe knop toe in de rich text editor die de intake
automatisch samenvat met behulp van de AI API.

Closes #123
```

---

## Types

| Type | Beschrijving | Voorbeeld |
|------|--------------|-----------|
| `feat` | Nieuwe functionaliteit | `feat(epd): voeg behandelplan editor toe` |
| `fix` | Bug fix | `fix(auth): corrigeer redirect loop` |
| `docs` | Documentatie | `docs: update API documentatie` |
| `style` | Code formatting | `style: format code met prettier` |
| `refactor` | Code refactoring | `refactor(api): herstructureer error handling` |
| `perf` | Performance verbetering | `perf(db): optimaliseer query met index` |
| `test` | Tests | `test: voeg unit tests toe` |
| `chore` | Build/tooling | `chore: update dependencies` |
| `ci` | CI/CD | `ci: voeg GitHub Actions toe` |
| `build` | Build systeem | `build: configureer webpack` |
| `revert` | Revert commit | `revert: revert "feat: voeg X toe"` |

---

## Scopes

- `epd` - EPD features
- `auth` - Authenticatie/autor-isatie
- `api` - API endpoints
- `ui` - UI componenten
- `db` - Database migraties
- `docs` - Documentatie
- `swift` - Swift medical scribe
- `behandelplan` - Behandelplan
- `verpleegrapportage` - Verpleegrapportage

---

## Subject Regels

- ✅ Imperatief ("voeg toe", niet "toegevoegd")
- ✅ Maximaal 50 karakters
- ✅ Geen punt aan het einde
- ✅ Begin met kleine letter
- ✅ Beschrijf **wat**, niet **waarom**

**Goed:** `feat(epd): voeg AI-samenvatting toe`  
**Slecht:** `feat(epd): Voeg AI-samenvatting toe.` ← hoofdletter en punt

---

## Body (Optioneel)

**Tip:** Alleen toevoegen als de subject regel niet voldoende duidelijkheid geeft.

- Scheid van subject met lege regel
- Maximaal 72 karakters per regel
- Leg uit **waarom** en **hoe** (alleen indien nodig)
- Beschrijf edge cases indien relevant
- **Blijf compact** - vaak is alleen de subject regel voldoende

---

## Footer (Optioneel)

- `Closes #123` - Sluit issue automatisch
- `Fixes #456` - Fix issue
- `BREAKING CHANGE: beschrijving` - Breaking change

---

## Voorbeelden

### Feature
```
feat(swift): voeg voice commands toe

Voegt spraakherkenning toe voor commando's tijdens dicteren.
Ondersteunt "nieuwe sectie", "opslaan", en "annuleren".

Closes #234
```

### Bug Fix
```
fix(behandelplan): corrigeer opslaan leefgebieden scores

Het opslaan faalde wanneer er geen vorige scores waren.
Toegevoegd: check voor null/undefined waarden.

Fixes #567
```

### Breaking Change
```
feat(auth): migreer naar Supabase Auth v2

BREAKING CHANGE: `loginUser()` vervangen door `signInWithPassword()`

Migratie:
- Vervang `loginUser(email, password)` met `signInWithPassword(email, password)`
- Update imports van `@/lib/auth` naar `@/lib/auth/client`

Closes #890
```

---

## Tips

**✅ Do's:**
- Wees specifiek: `fix(epd): corrigeer null pointer` > `fix: bug fix`
- Gebruik scope voor duidelijkheid
- Verwijs naar issues met `Closes #123`
- Gebruik imperatief
- **Blijf compact** - vaak is alleen `type(scope): subject` voldoende

**❌ Don'ts:**
- Geen vage beschrijvingen (`fix: stuff`)
- Geen emoji's in commit message
- Geen verleden tijd ("voegde toe")
- Geen meerdere wijzigingen in één commit

---

## Git Configuratie

```bash
# Lokaal
git config commit.template .gitmessage

# Globaal
git config --global commit.template .gitmessage
```

Gebruik: `git commit` (zonder `-m`) opent editor met template.

---

**Zie `.gitmessage` voor de Git template.**
