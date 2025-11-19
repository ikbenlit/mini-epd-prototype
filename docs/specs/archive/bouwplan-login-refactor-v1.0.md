# 🚀 Bouwplan — Login Refactor: Email + Wachtwoord Primair

**Projectnaam:** Mini EPD Demo Platform - Login Optimalisatie
**Versie:** v1.0
**Datum:** 18-01-2025
**Auteur:** Colin (met Claude Code)
**Scope:** Login page herontwerp (Email+Password primair, Magic Link secundair)

---

## 1. Doel en Context

🎯 **Doel:** De login flow optimaliseren voor een demo platform door Email + Wachtwoord de primaire methode te maken in plaats van Magic Link.

📘 **Toelichting:**
Het huidige login scherm heeft Magic Link als primaire methode, maar voor een **demo platform** is dit suboptimaal omdat prospects direct willen inloggen zonder email roundtrip. We maken Email + Password de primaire methode en verplaatsen Magic Link naar een secundaire optie.

**Huidige situatie:**
- Magic Link is default (toggle nodig voor demo login)
- Demo credentials verborgen achter extra click
- 2-3 extra clicks voor demo users
- Conditional rendering met `showDemoLogin` state

**Gewenste situatie:**
- Email + Password formulier als primair scherm
- One-click demo login prominent zichtbaar
- Magic Link als minimale fallback (kleine link onderaan)
- Focus op snelheid: Quick Demo button is de CTA

**Context:**
- Dit is een DEMO platform, geen productie EPD
- Primaire use case: Prospects willen snel kijken
- Secundaire use case: Serieuze trial users maken eigen account
- Magic Link blijft beschikbaar voor zero-password signup

---

## 2. Uitgangspunten

### 2.2 Projectkaders

- **Tijd:** 2-3 uur voor volledige implementatie + testing
- **Team:** 1 developer (zelfstandig uit te voeren)
- **Demo accounts:** Bestaande demo users blijven ongewijzigd
- **Breaking changes:** GEEN - Alle bestaande auth flows blijven werken
- **Deployment:** Auto-deploy via Vercel na git push

### 2.3 Programmeer Uitgangspunten

**Code Quality Principles:**
- ✅ **DRY:** Hergebruik bestaande auth functies (`loginWithPassword`, `loginWithMagicLink`)
- ✅ **KISS:** Eenvoudige layout refactor, geen complexe state management
- ✅ **SOC:** UI changes in page.tsx, auth logic blijft in lib/auth/client.ts
- ✅ **YAGNI:** Alleen login UI optimalisatie, geen extra conversion features

**Security:**
- Demo credentials blijven in info box (niet hardcoded in code)
- Bestaande Supabase auth flows blijven ongewijzigd
- Geen nieuwe environment variables nodig

**Bestaande Bestanden (NIET wijzigen):**
```
lib/auth/client.ts        - Auth functies
lib/auth/server.ts        - Server auth
middleware.ts             - Route protection
app/auth/callback/route.ts - Magic link callback
app/auth/logout/route.ts  - Logout handler
components/ui/button.tsx  - UI components
```

**Te Wijzigen Bestanden:**
```
app/login/page.tsx        - Volledige UI refactor
```

---

## 3. Epics & Stories Overzicht

🎯 **Doel:** De bouw opdelen in logische epics (fases) met stories (subfases).

| Epic ID | Titel | Doel | Status | Stories | Geschatte Tijd |
|---------|-------|------|--------|---------|----------------|
| E1 | Login UI Refactor | Email+Password primair maken | ⏳ To Do | 3 | 1-2 uur |
| E2 | Demo UX Verbetering | One-click demo + betere copy | ⏳ To Do | 2 | 30 min |
| E3 | Testing & Verificatie | Alle flows testen | ⏳ To Do | 2 | 30 min |

**Totale schatting:** 2-3 uur werk

---

## 4. Epics & Stories (Uitwerking)

### Epic 1 — Login UI Refactor

**Epic Doel:** Email + Password formulier wordt de primaire login methode zonder toggle logic.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|-----------------|
| E1.S1 | Verwijder conditional toggle logic | `showDemoLogin` state verwijderd, geen toggle buttons meer | ⏳ | — | 2 |
| E1.S2 | Herstructureer page layout | Email+Password primair, Magic Link achter kleine link | ⏳ | E1.S1 | 3 |
| E1.S3 | Update copy & labels | Focus op Quick Demo, Magic Link minimaal | ⏳ | E1.S2 | 1 |

**Technical Notes:**

**E1.S1 - Toggle Logic Aanpassen:**
```typescript
// VERWIJDER:
const [showDemoLogin, setShowDemoLogin] = useState(false)

// VERVANG door:
const [showMagicLink, setShowMagicLink] = useState(false)

// VERWIJDER oude toggle buttons:
<button onClick={() => setShowDemoLogin(true)}>Login met Demo Account</button>
<button onClick={() => setShowDemoLogin(false)}>← Terug</button>

// NIEUWE logic:
// Default = Email+Password form zichtbaar
// showMagicLink = true → Toon Magic Link form in plaats van password form
```

**E1.S2 - Layout Herstructureren:**
```
NIEUWE STRUCTUUR:
┌─────────────────────────────────────────┐
│  Header: "Login"                        │
├─────────────────────────────────────────┤
│  [QuickDemoButton - zie E2.S1]         │
│                                         │
│  ─── of vul handmatig in ───           │
│                                         │
│  Email: [________________]             │
│  Password: [________________]          │
│  [Login Button]                        │
│                                         │
│  [Demo Credentials Info Box - E2.S2]   │
│                                         │
│  Liever zonder wachtwoord?             │
│  [Gebruik magic link →]                │
└─────────────────────────────────────────┘

MAGIC LINK FLOW (na click op link):
- Conditional state: showMagicLink = true
- Toon email input + "Stuur Magic Link" button
- "← Terug naar login" link
```

**E1.S3 - Copy Updates:**
```typescript
// OUD → NIEUW
"🔑 Demo Account Login" → "Login"
"📧 Login met Magic Link" → [VERBORGEN achter link]
"Login met Demo Account" → [VERWIJDERD - QuickDemoButton vervangt dit]
"Snelle Demo Login" → "🚀 Start Demo (geen registratie)"

// NIEUW
"Liever zonder wachtwoord?" → Link onderaan
"Gebruik magic link →" → Toont magic link formulier
```

---

### Epic 2 — Demo UX Verbetering

**Epic Doel:** Demo gebruikers kunnen met één click inloggen zonder formulier in te vullen.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|-----------------|
| E2.S1 | Implementeer QuickDemoButton | One-click demo login zonder form invullen | ⏳ | E1.S2 | 3 |
| E2.S2 | Voeg credentials info box toe | Demo credentials zichtbaar voor manual login | ⏳ | E1.S2 | 2 |

**Technical Notes:**

**E2.S1 - QuickDemoButton Component:**
```typescript
// Inline component in app/login/page.tsx
// (of aparte component indien herbruikbaar elders)

function QuickDemoButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleQuickDemo() {
    setLoading(true)
    try {
      const result = await loginWithPassword(
        'demo@mini-ecd.demo',
        'Demo2024!'
      )

      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Ingelogd! Redirect naar EPD...'
        })
        setTimeout(() => router.push('/epd/clients'), 1000)
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Login mislukt. Probeer opnieuw.'
      })
      setLoading(false)
    }
  }

  return (
    <Button
      size="lg"
      className="w-full bg-teal-600 hover:bg-teal-700"
      onClick={handleQuickDemo}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Demo laden...
        </>
      ) : (
        <>
          🚀 Start Demo (geen registratie)
        </>
      )}
    </Button>
  )
}
```

**E2.S2 - Credentials Info Box:**
```typescript
// Info card onder password form, boven Magic Link divider

<div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2">
  <p className="text-sm font-medium text-slate-700">
    Demo Account Credentials:
  </p>
  <div className="text-xs text-slate-600 space-y-1">
    <p>📧 Email: <code className="bg-white px-2 py-1 rounded">demo@mini-ecd.demo</code></p>
    <p>🔒 Wachtwoord: <code className="bg-white px-2 py-1 rounded">Demo2024!</code></p>
  </div>
  <p className="text-xs text-slate-500 italic">
    💡 Of gebruik de "Start Demo" knop voor directe toegang
  </p>
</div>
```

---

### Epic 3 — Testing & Verificatie

**Epic Doel:** Alle login flows werken correct na refactor zonder regressies.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Afhankelijkheden | Story Points |
|----------|--------------|---------------------|--------|------------------|-----------------|
| E3.S1 | Test alle login flows | Alle 3 methoden werken zonder errors | ⏳ | E2.S2 | 2 |
| E3.S2 | Responsive & accessibility check | Werkt op mobile, keyboard navigatie OK | ⏳ | E3.S1 | 1 |

**Technical Notes:**

**E3.S1 - Login Flow Test Scenarios:**

| Test Case | Scenario | Expected Result | Status |
|-----------|----------|-----------------|--------|
| TC1 | Click "Start Demo" button | Direct inloggen → redirect /epd/clients | ⏳ |
| TC2 | Manual login (demo credentials) | Formulier submit → success → redirect | ⏳ |
| TC3 | Magic link (geldig email) | "Check je email" message → email ontvangen | ⏳ |
| TC4 | Invalid password | Error message: "Ongeldige inloggegevens" | ⏳ |
| TC5 | Empty fields | Validation error | ⏳ |
| TC6 | Network error | User-friendly error message | ⏳ |

**E3.S2 - Responsive & Accessibility Checklist:**

**Responsive:**
- [ ] 320px viewport (iPhone SE): Layout niet broken
- [ ] 768px viewport (iPad): Twee-kolom layout werkt
- [ ] 1920px viewport (Desktop): Maximale breedte begrensd

**Accessibility:**
- [ ] Tab-order logisch: QuickDemo → Email → Password → Login → MagicLink Email → Send
- [ ] Focus states zichtbaar (outline/ring)
- [ ] Error messages hebben `role="alert"`
- [ ] Buttons hebben duidelijke labels
- [ ] Contrast ratio > 4.5:1 (WCAG AA)
- [ ] Screen reader test: NVDA/VoiceOver leest alles voor

**Browser Testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (macOS + iOS)
- [ ] Edge (latest)

---

## 5. Kwaliteit & Testplan

🎯 **Doel:** Vastleggen hoe de kwaliteit van de refactor wordt geborgd.

### Manual Test Checklist (voor deployment)

**Happy Flows:**
- [ ] Quick demo button: Click → Loading state → Success → Redirect /epd/clients
- [ ] Manual email+password: Type credentials → Submit → Redirect
- [ ] Magic link: Enter email → Submit → "Check email" message → Email ontvangen

**Error Flows:**
- [ ] Wrong password: Error message "Ongeldige inloggegevens"
- [ ] Invalid email format: Validation error
- [ ] Network timeout: User-friendly error
- [ ] Rate limit (4 emails/hour): Supabase error handled

**UI/UX:**
- [ ] Loading states show spinners
- [ ] Success messages turn teal-50 background
- [ ] Error messages turn red-50 background
- [ ] All text readable (contrast check)
- [ ] No console errors/warnings
- [ ] No layout shift during loading

**Regression Testing:**
- [ ] Existing demo accounts still work
- [ ] `/auth/callback` magic link flow unchanged
- [ ] Middleware still protects `/epd/*` routes
- [ ] Logout still works (`/auth/logout`)
- [ ] Session refresh in middleware works

---

## 6. Risico's & Mitigatie

🎯 **Doel:** Risico's vroeg signaleren en voorzien van oplossingen.

| Risico | Kans | Impact | Mitigatie | Owner |
|--------|------|--------|-----------|-------|
| Breaking change in login flow | Laag | Hoog | - Behoud alle bestaande auth functies<br>- Test beide flows grondig<br>- Rollback plan ready | Developer |
| Demo credentials exposure | Middel | Laag | - Info box toont credentials (is OK voor demo)<br>- Geen hardcoded passwords in source<br>- RLS policies beschermen database | Developer |
| Magic link users verward | Middel | Laag | - Duidelijke "Of gebruik Magic Link" sectie<br>- Behoud alle bestaande UX voor magic link | Developer |
| Mobile layout breaks | Laag | Middel | - Test op 320px viewport<br>- Use responsive Tailwind classes<br>- Max-width container | Developer |
| Supabase rate limit tijdens testing | Hoog | Laag | - Use demo account voor testing (geen magic link)<br>- Test magic link max 1x per test run | Developer |
| Accessibility regression | Middel | Middel | - Tab-order testing<br>- Screen reader check<br>- WCAG contrast check | Developer |

---

## 7. Definition of Done

**Epic 1-3 zijn compleet wanneer:**

✅ **Functional Requirements:**
- Email + Password is primair formulier (bovenaan pagina)
- Quick demo button werkt (one-click login)
- Magic Link optie minimaal zichtbaar (kleine link)
- Demo credentials info box zichtbaar
- Alle 3 login methoden getest en werkend
- Focus op Quick Demo als primaire CTA

✅ **Quality Requirements:**
- Geen console errors/warnings
- Mobile responsive (320px - 1920px)
- Accessible (keyboard nav + screen reader)
- Loading states correct
- Error messages user-friendly

✅ **Code Quality:**
- Bestaande auth functies ongewijzigd
- Clean code (geen commented code)
- Consistent Tailwind styling
- Type-safe (TypeScript errors = 0)

✅ **Documentation:**
- Git commit message: `feat: Login UI refactor - Email+Password primair`
- Code comments voor complexe logica
- Dit bouwplan bijgewerkt met "✅ Gereed" status

✅ **Deployment:**
- Lokaal getest (npm run dev)
- Git commit + push
- Vercel auto-deploy succesvol
- Production smoke test uitgevoerd

---

## 8. Implementatie Volgorde

**Aanbevolen volgorde:**

1. **E1.S1** - Verwijder toggle logic (15 min)
   - Clean up `showDemoLogin` state
   - Verwijder toggle buttons

2. **E1.S2** - Herstructureer layout (30 min)
   - Email+Password form bovenaan
   - Dividers toevoegen
   - Magic Link onderaan

3. **E1.S3** - Update copy (10 min)
   - Alle labels updaten
   - Verwarrende tekst verwijderen

4. **E2.S1** - QuickDemoButton (20 min)
   - Component implementeren
   - Loading states
   - Error handling

5. **E2.S2** - Credentials info box (10 min)
   - Styled info card
   - Demo credentials display

6. **E3.S1** - Test alle flows (20 min)
   - Happy flows
   - Error flows
   - Regression tests

7. **E3.S2** - Responsive + A11y (15 min)
   - Mobile viewport test
   - Keyboard navigation
   - Screen reader check

**Total: ~2 uur**

---

## 9. Referenties

**Mission Control Documents:**
- **PRD:** `docs/specs/prd-mini-ecd-v1.2.md`
- **FO:** `docs/specs/fo-mini-ecd-v2.md`
- **TO:** `docs/specs/to-mini-ecd-v1_2.md`
- **Auth Setup:** `docs/AUTH_SETUP.md`

**Code References:**
- Login page: `app/login/page.tsx` (TE WIJZIGEN)
- Auth client: `lib/auth/client.ts` (ONGEWIJZIGD)
- Auth server: `lib/auth/server.ts` (ONGEWIJZIGD)
- Middleware: `middleware.ts` (ONGEWIJZIGD)

**External Resources:**
- Repository: `https://github.com/[org]/15-mini-epd-prototype`
- Deployment: Vercel (auto-deploy on push)
- Supabase Project: `dqugbrpwtisgyxscpefg` (EU region)

---

## 10. Versiehistorie

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 18-01-2025 | Colin | Initiële versie - Login refactor bouwplan |

---

**Status:** ⏳ Ready for Implementation
**Next Steps:** Start met E1.S1 (toggle logic verwijderen)
