# 🚀 Bouwplan — Auth Flow Incrementele Uitbreiding

**Projectnaam:** Mini EPD - Auth Features Toevoegen
**Versie:** v1.0 (Incrementeel)
**Datum:** 18-01-2025
**Auteur:** Colin (met Claude Code)
**Scope:** Alleen TOEVOEGEN wat ontbreekt (geen refactor van bestaande code)

---

## 1. Wat Hebben We Al? ✅

**Bestaande Features (BLIJVEN ZOALS ZE ZIJN):**
- ✅ Login page met split-screen design (bento grid + form)
- ✅ Magic Link login (signup + login in één)
- ✅ Password login (demo accounts)
- ✅ Quick demo button (auto-fill + submit)
- ✅ Toggle tussen magic/demo
- ✅ Success/error messaging
- ✅ Auth callback handler (`/auth/callback`)
- ✅ Logout handler (`/auth/logout`)
- ✅ Middleware (route protection)
- ✅ Supabase integration

**Wat Ontbreekt:**
- ❌ Password reset flow (forgot password)
- ❌ Set password optie (na magic link signup)
- ❌ "Wachtwoord vergeten?" link op login page

---

## 2. Wat Gaan We TOEVOEGEN?

### **Minimale Toevoegingen (Production-Ready Auth):**

| Feature | Wat | Waarom | Tijd |
|---------|-----|--------|------|
| Password Reset | Forgot password → email → new password | Must-have voor production | 2 uur |
| Set Password | Optioneel password instellen na magic link | Power users willen sneller inloggen | 1 uur |
| Links Toevoegen | "Wachtwoord vergeten?" link in login form | UX improvement | 10 min |

**Totaal: ~3 uur werk**

---

## 3. Epics & Stories (Minimaal)

| Epic ID | Titel | Wat Doen We? | Stories | Tijd |
|---------|-------|--------------|---------|------|
| E1 | Password Reset Flow | 2 nieuwe pagina's + 1 email template | 3 | 2 uur |
| E2 | Set Password (Optional) | 1 nieuwe pagina + link in onboarding | 2 | 1 uur |
| E3 | UX Polish | Link toevoegen + testing | 1 | 15 min |

**Totaal: 3 uur werk, 6 stories**

---

## 4. Epic 1 — Password Reset Flow

**Wat:** Users kunnen vergeten wachtwoord resetten via email.

| Story ID | Wat Bouwen? | Bestanden | Story Points |
|----------|-------------|-----------|--------------|
| E1.S1 | Reset request page | `app/reset-password/page.tsx` (NIEUW) | 2 |
| E1.S2 | Update password page | `app/update-password/page.tsx` (NIEUW) | 3 |
| E1.S3 | Email template configureren | Supabase dashboard (config) | 1 |

### E1.S1 - Reset Request Page

**Nieuw bestand:** `app/reset-password/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`
      })

      if (error) throw error
      setSent(true)

    } catch (err: any) {
      setError(err.message || 'Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm text-center space-y-4">
          <div className="text-5xl mb-4">✉️</div>
          <h1 className="text-2xl font-bold text-slate-900">Email Verstuurd!</h1>
          <p className="text-slate-600">
            Check je inbox voor de reset link. De link is 1 uur geldig.
          </p>
          <p className="text-sm text-slate-500">
            Niet ontvangen? Check je spam folder.
          </p>
          <Link
            href="/login"
            className="inline-block mt-4 text-teal-600 hover:text-teal-700 font-medium"
          >
            ← Terug naar login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Wachtwoord Vergeten?
          </h1>
          <p className="text-slate-600">
            Geen probleem! Vul je email in en we sturen je een reset link.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleResetRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jouw@email.nl"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Verzenden...' : 'Stuur Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Terug naar login
          </Link>
        </div>
      </div>
    </div>
  )
}
```

### E1.S2 - Update Password Page

**Nieuw bestand:** `app/update-password/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      return
    }

    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens zijn')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)

    } catch (err: any) {
      setError(err.message || 'Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm text-center space-y-4">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-slate-900">Wachtwoord Gewijzigd!</h1>
          <p className="text-slate-600">
            Je wordt doorgestuurd naar de login pagina...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Nieuw Wachtwoord Instellen
          </h1>
          <p className="text-slate-600">
            Kies een sterk wachtwoord (minimaal 8 tekens).
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nieuw Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bevestig Wachtwoord
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Wachtwoord Wijzigen...' : 'Wachtwoord Wijzigen'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

### E1.S3 - Email Template Configureren

**Waar:** Supabase Dashboard → Authentication → Email Templates → Reset Password

**Template:**
```html
<h2>Wachtwoord Resetten</h2>

<p>Je hebt een wachtwoord reset aangevraagd voor je Mini EPD account.</p>

<a href="{{ .ConfirmationURL }}"
   style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
  Reset Wachtwoord
</a>

<p style="color: #64748b; font-size: 14px;">
  Deze link is 1 uur geldig. Heb je deze reset niet aangevraagd? Negeer deze email.
</p>
```

---

## 5. Epic 2 — Set Password (Optional)

**Wat:** Na magic link signup kunnen users een password instellen.

| Story ID | Wat Bouwen? | Bestanden | Story Points |
|----------|-------------|-----------|--------------|
| E2.S1 | Set password page | `app/set-password/page.tsx` (NIEUW) | 2 |
| E2.S2 | Link toevoegen | Update `app/auth/callback/route.ts` | 1 |

### E2.S1 - Set Password Page

**Nieuw bestand:** `app/set-password/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      return
    }

    if (password.length < 8) {
      setError('Wachtwoord minimaal 8 tekens')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      router.push('/epd/clients')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSkip() {
    router.push('/epd/clients')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Stel een Wachtwoord In (Optioneel)
        </h1>
        <p className="text-slate-600 mb-6">
          Met een wachtwoord kun je sneller inloggen zonder magic link.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 tekens"
              minLength={8}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bevestig Wachtwoord
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              minLength={8}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Instellen...' : 'Wachtwoord Instellen'}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-slate-600 hover:text-slate-900 text-sm font-medium py-2"
          >
            Sla over (blijf magic link gebruiken)
          </button>
        </form>
      </div>
    </div>
  )
}
```

### E2.S2 - Update Callback Handler

**Bestand:** `app/auth/callback/route.ts`

**Wat wijzigen:**
```typescript
// TOEVOEGEN aan einde van success flow:

if (data.user) {
  // Check if new user (first login)
  const isNewUser = new Date(data.user.created_at).getTime() ===
                    new Date(data.user.last_sign_in_at || '').getTime()

  if (isNewUser) {
    // Optie: redirect naar set-password voor nieuwe users
    return NextResponse.redirect(`${requestUrl.origin}/set-password`)
  }

  // Bestaande redirect naar dashboard
  return NextResponse.redirect(`${requestUrl.origin}/epd/clients`)
}
```

---

## 6. Epic 3 — UX Polish

**Wat:** Kleine verbeteringen aan bestaande login page.

| Story ID | Wat Doen? | Bestand | Story Points |
|----------|-----------|---------|--------------|
| E3.S1 | "Wachtwoord vergeten?" link toevoegen | `app/login/page.tsx` | 1 |

### E3.S1 - Forgot Password Link

**Bestand:** `app/login/page.tsx` (line ~346)

**TOEVOEGEN na password input field:**

```typescript
{/* Password Input */}
<div>
  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
    Password
  </label>
  <input
    id="password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••"
    required
    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
  />
  {/* NIEUW: Forgot password link */}
  <div className="mt-1 text-right">
    <a
      href="/reset-password"
      className="text-xs text-slate-600 hover:text-teal-600"
    >
      Wachtwoord vergeten?
    </a>
  </div>
</div>
```

---

## 7. Checklist - Wat Moet Er Gebeuren?

### **Nieuwe Bestanden Aanmaken:**
- [ ] `app/reset-password/page.tsx` (E1.S1)
- [ ] `app/update-password/page.tsx` (E1.S2)
- [ ] `app/set-password/page.tsx` (E2.S1)

### **Bestaande Bestanden Wijzigen:**
- [ ] `app/login/page.tsx` - Voeg "Wachtwoord vergeten?" link toe (E3.S1)
- [ ] `app/auth/callback/route.ts` - Optionele redirect naar set-password (E2.S2)

### **Supabase Configuratie:**
- [ ] Email template configureren (E1.S3)
- [ ] Test reset email wordt verstuurd

### **Testing:**
- [ ] Test forgot password flow (request → email → reset)
- [ ] Test set password na magic link signup
- [ ] Test alle links werken
- [ ] Test error handling (wrong email, weak password, etc.)

---

## 8. Implementatie Volgorde

**Stap 1:** Password Reset (E1) - 2 uur
1. Maak `reset-password/page.tsx`
2. Maak `update-password/page.tsx`
3. Configureer email template in Supabase
4. Test hele flow

**Stap 2:** Set Password (E2) - 1 uur
1. Maak `set-password/page.tsx`
2. Update `auth/callback/route.ts`
3. Test flow

**Stap 3:** UX Polish (E3) - 15 min
1. Voeg "Wachtwoord vergeten?" link toe
2. Final testing

**Totaal: ~3 uur werk**

---

## 9. Testing Checklist

| Test Case | Scenario | Expected |
|-----------|----------|----------|
| TC1 | Click "Wachtwoord vergeten?" | Redirect naar /reset-password |
| TC2 | Submit valid email for reset | Email sent, success message |
| TC3 | Click reset link in email | Redirect naar /update-password |
| TC4 | Set new password (valid) | Success, redirect to login |
| TC5 | Set new password (mismatch) | Error: "Wachtwoorden komen niet overeen" |
| TC6 | Set new password (too short) | Error: "Minimaal 8 tekens" |
| TC7 | Magic link signup (new user) | Redirect naar /set-password |
| TC8 | Skip set password | Redirect naar /epd/clients |
| TC9 | Set password after signup | Success, redirect to dashboard |

---

## 10. Wat NIET Doen

❌ **Bestaande login page NIET refactoren**
❌ **GEEN nieuwe UI components maken** (gebruik bestaande styling)
❌ **GEEN email verification** (nice-to-have, niet kritiek)
❌ **GEEN OAuth/SSO** (overkill voor prototype)
❌ **GEEN complexe state management** (useState is prima)

---

## 11. Definition of Done

✅ **E1-E3 compleet wanneer:**
- 3 nieuwe pagina's werken (reset-password, update-password, set-password)
- "Wachtwoord vergeten?" link zichtbaar op login page
- Email template geconfigureerd in Supabase
- Alle flows getest en werkend
- Geen breaking changes aan bestaande auth
- Git commit: `feat: Add password reset and set password flows`

---

**Status:** ⏳ Ready for Implementation
**Geschatte Tijd:** 3 uur
**Next Step:** Maak eerst `app/reset-password/page.tsx`
