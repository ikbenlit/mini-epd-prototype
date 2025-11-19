# 🚀 Bouwplan — Volledige Auth Flow + Demo Account

**Projectnaam:** Mini EPD Demo Platform - Complete Authenticatie Systeem
**Versie:** v1.0
**Datum:** 18-01-2025
**Auteur:** Colin (met Claude Code)
**Scope:** Production-ready auth flow met signup, login, password reset + demo account convenience

---

## 1. Doel en Context

🎯 **Doel:** Een complete, production-ready authenticatie flow bouwen die professionele development skills showcaset, met een demo account voor quick access.

📘 **Toelichting:**

**Portfolio Waarde:**
- Demonstreert full-stack auth expertise
- Security best practices (password hashing, email verification, rate limiting)
- Professional UX (duidelijke error states, loading indicators, success feedback)
- Production-ready mindset (edge cases, error handling, rollback scenarios)

**Feature Scope:**
1. ✅ **Signup Flow** - Magic Link (passwordless onboarding)
2. ✅ **Login Flow** - Email + Password (returning users)
3. ✅ **Password Reset** - Forgot password → Email → New password
4. ✅ **Email Verification** - Confirm email na signup
5. ✅ **Demo Account** - One-click quick access
6. ✅ **Session Management** - Auto-refresh, secure cookies, logout

**User Journeys:**
- **Recruiter/Prospect:** Quick Demo → Impressed → Account aanmaken
- **New User:** Email → Magic Link → Account created → Onboarding
- **Returning User:** Email + Password → Dashboard
- **Forgot Password:** Reset link → New password → Login

---

## 2. Uitgangspunten

### 2.1 Technische Stack

**Bestaand (blijft):**
- Next.js 16.0.1 + React 19 + TypeScript
- Supabase Auth (backend)
- Tailwind CSS (styling)
- Vercel (hosting)

**Nieuw (toe te voegen):**
- Zod voor form validation
- React Hook Form (optioneel - betere UX)
- Email templates (Supabase)

### 2.2 Projectkaders

- **Tijd:** 8-10 uur voor volledige implementatie + testing
- **Team:** 1 developer (zelfstandig uit te voeren)
- **Breaking changes:** GEEN - Bestaande auth blijft werken tijdens migratie
- **Deployment:** Phased rollout (feature flags mogelijk)
- **Security:** Production standards (OWASP top 10)

### 2.3 Programmeer Uitgangspunten

**Code Quality:**
- ✅ **DRY:** Herbruikbare auth componenten en hooks
- ✅ **KISS:** Gebruik Supabase built-in features waar mogelijk
- ✅ **SOC:** Auth logic gescheiden van UI components
- ✅ **YAGNI:** Geen OAuth/SSO (kan later), focus op email auth

**Security Principles:**
- Passwords NOOIT in plain text (Supabase handled dit)
- Rate limiting op sensitive endpoints
- HTTPS only (Vercel default)
- Secure session cookies (HTTP-only, SameSite)
- Input validation (email format, password strength)
- CSRF protection (Next.js built-in)

**UX Principles:**
- Loading states op alle async operaties
- Clear error messages (user-friendly, geen technical jargon)
- Success feedback (toasts/messages)
- Keyboard accessible (tab order, focus states)
- Mobile responsive (touch-friendly buttons)

---

## 3. Epics & Stories Overzicht

| Epic ID | Titel | Doel | Status | Stories | Geschatte Tijd |
|---------|-------|------|--------|---------|----------------|
| E1 | Login/Signup Page Refactor | Unified auth page met tabs/modes | ⏳ To Do | 4 | 2 uur |
| E2 | Signup Flow (Magic Link) | Passwordless account creation | ⏳ To Do | 3 | 2 uur |
| E3 | Login Flow (Password) | Returning user login | ⏳ To Do | 2 | 1 uur |
| E4 | Password Reset Flow | Forgot password → reset email → update | ⏳ To Do | 4 | 2.5 uur |
| E5 | Email Verification | Confirm email after signup | ⏳ To Do | 2 | 1 uur |
| E6 | Demo Account | Quick access button | ⏳ To Do | 2 | 1 uur |
| E7 | Testing & Polish | All flows tested, edge cases handled | ⏳ To Do | 3 | 1.5 uur |

**Totale schatting:** 9-11 uur werk

---

## 4. Epics & Stories (Uitwerking)

### Epic 1 — Login/Signup Page Refactor

**Epic Doel:** Unified auth page die signup, login en demo ondersteunt met duidelijke modes.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E1.S1 | Design nieuwe page structuur | Wireframe + component breakdown | ⏳ | 1 |
| E1.S2 | Implementeer mode switcher | Toggle tussen "Nieuw account" / "Inloggen" | ⏳ | 2 |
| E1.S3 | Basis form components | Email input, password input, submit button | ⏳ | 2 |
| E1.S4 | Error/success messaging | Toast/banner component voor feedback | ⏳ | 2 |

**Technical Notes:**

**E1.S1 - Page Structuur:**
```
┌──────────────────────────────────────────┐
│  Mini EPD - Professioneel Elektronisch  │
│  Patiënten Dossier                       │
├──────────────────────────────────────────┤
│                                          │
│  [🎭 Quick Demo - Bekijk Prototype]     │  ← Prominent, secundair
│                                          │
│  ────── of ──────                        │
│                                          │
│  ( ) Nieuw account aanmaken             │  ← Radio/Tab
│  (•) Inloggen                            │
│                                          │
│  📧 Email                                │
│  [_________________________]            │
│                                          │
│  🔒 Wachtwoord                           │  ← Alleen bij "Inloggen"
│  [_________________________]            │
│                                          │
│  [Inloggen] of [Account Aanmaken]       │  ← Dynamic button text
│                                          │
│  Wachtwoord vergeten? [Reset]           │  ← Link naar /reset-password
│                                          │
└──────────────────────────────────────────┘
```

**E1.S2 - Mode State Management:**
```typescript
type AuthMode = 'signup' | 'login'

const [mode, setMode] = useState<AuthMode>('login') // Default = login

// Dynamic UI based on mode
const showPasswordField = mode === 'login'
const buttonText = mode === 'login' ? 'Inloggen' : 'Account Aanmaken'
const submitHandler = mode === 'login' ? handleLogin : handleSignup
```

**E1.S3 - Form Components:**
```typescript
// Input component met validation states
<Input
  type="email"
  label="Email"
  value={email}
  onChange={setEmail}
  error={emailError}
  required
/>

<Input
  type="password"
  label="Wachtwoord"
  value={password}
  onChange={setPassword}
  error={passwordError}
  showStrength={mode === 'login' ? false : true}
  required
/>
```

**E1.S4 - Messaging System:**
```typescript
// Toast/banner component
type Message = {
  type: 'success' | 'error' | 'info'
  text: string
  duration?: number
}

// Usage examples:
showMessage({
  type: 'success',
  text: 'Check je email voor de magic link!'
})

showMessage({
  type: 'error',
  text: 'Email of wachtwoord incorrect'
})
```

---

### Epic 2 — Signup Flow (Magic Link)

**Epic Doel:** Passwordless signup via magic link in email (Supabase OTP).

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E2.S1 | Implementeer signup handler | Email submit → Supabase OTP → Success message | ⏳ | 3 |
| E2.S2 | Email callback handler | Magic link → account created → redirect dashboard | ⏳ | 2 |
| E2.S3 | Custom email template | Branded email met clear CTA | ⏳ | 2 |

**Technical Notes:**

**E2.S1 - Signup Handler:**
```typescript
// app/login/page.tsx

async function handleSignup(email: string) {
  setLoading(true)

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
        data: {
          // Optional: Store extra user metadata
          source: 'web_signup',
          timestamp: new Date().toISOString(),
        }
      }
    })

    if (error) throw error

    setMessage({
      type: 'success',
      text: `Check je email (${email}) voor de magic link!`
    })

    // Optional: Track analytics
    trackEvent('signup_initiated', { email })

  } catch (error) {
    setMessage({
      type: 'error',
      text: error.message || 'Signup mislukt. Probeer opnieuw.'
    })
  } finally {
    setLoading(false)
  }
}
```

**E2.S2 - Callback Handler:**
```typescript
// app/auth/callback/route.ts (EXISTING - update if needed)

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createServerClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if this is first login (new user)
      const isNewUser = data.user.created_at === data.user.last_sign_in_at

      if (isNewUser) {
        // Redirect to onboarding
        return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
      } else {
        // Redirect to dashboard
        return NextResponse.redirect(`${requestUrl.origin}/epd/clients`)
      }
    }
  }

  // Error fallback
  return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`)
}
```

**E2.S3 - Email Template (Supabase Dashboard):**
```html
<!-- Supabase → Authentication → Email Templates → Magic Link -->

<h2>Welkom bij Mini EPD!</h2>

<p>Je hebt een account aangemaakt. Klik op de knop hieronder om je email te bevestigen en in te loggen:</p>

<a href="{{ .ConfirmationURL }}"
   style="background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
  Bevestig Email & Login
</a>

<p style="color: #64748b; font-size: 14px;">
  Deze link is 1 uur geldig. Heb je deze email niet aangevraagd? Negeer deze email.
</p>

<p style="color: #64748b; font-size: 12px; margin-top: 24px;">
  Mini EPD - Professioneel Elektronisch Patiënten Dossier
</p>
```

---

### Epic 3 — Login Flow (Password)

**Epic Doel:** Returning users kunnen inloggen met email + wachtwoord.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E3.S1 | Implementeer login handler | Email + password → Supabase auth → redirect | ⏳ | 2 |
| E3.S2 | Set password flow | Na magic link signup → optie om password te setten | ⏳ | 3 |

**Technical Notes:**

**E3.S1 - Login Handler:**
```typescript
// app/login/page.tsx

async function handleLogin(email: string, password: string) {
  setLoading(true)

  // Validation
  if (!email || !password) {
    setMessage({
      type: 'error',
      text: 'Vul email en wachtwoord in'
    })
    setLoading(false)
    return
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    setMessage({
      type: 'success',
      text: 'Ingelogd! Redirect naar dashboard...'
    })

    // Track analytics
    trackEvent('login_success', { method: 'password' })

    // Redirect after 500ms
    setTimeout(() => {
      router.push('/epd/clients')
    }, 500)

  } catch (error) {
    setMessage({
      type: 'error',
      text: 'Email of wachtwoord incorrect'
    })

    // Track failed login (rate limiting check)
    trackEvent('login_failed', { email })

  } finally {
    setLoading(false)
  }
}
```

**E3.S2 - Set Password Flow:**
```typescript
// app/set-password/page.tsx (NEW)

'use client'

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSetPassword() {
    // Validation
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Wachtwoorden komen niet overeen' })
      return
    }

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Wachtwoord moet minimaal 8 tekens zijn' })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'Wachtwoord ingesteld! Je kunt nu inloggen met email en wachtwoord.'
      })

      setTimeout(() => router.push('/epd/clients'), 2000)

    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <h1>Stel een wachtwoord in</h1>
        <p>Gebruik dit wachtwoord om later in te loggen</p>

        <Input
          type="password"
          label="Nieuw wachtwoord"
          value={password}
          onChange={setPassword}
          showStrength
        />

        <Input
          type="password"
          label="Bevestig wachtwoord"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        <Button onClick={handleSetPassword} loading={loading}>
          Wachtwoord Instellen
        </Button>

        <button onClick={() => router.push('/epd/clients')}>
          Sla over (blijf magic link gebruiken)
        </button>
      </div>
    </div>
  )
}
```

---

### Epic 4 — Password Reset Flow

**Epic Doel:** Users kunnen vergeten wachtwoord resetten via email link.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E4.S1 | Reset request page | Email input → Send reset link | ⏳ | 2 |
| E4.S2 | Reset email template | Branded email met reset link | ⏳ | 1 |
| E4.S3 | Reset password page | New password form + validation | ⏳ | 3 |
| E4.S4 | Update password handler | Supabase update + redirect | ⏳ | 2 |

**Technical Notes:**

**E4.S1 - Reset Request Page:**
```typescript
// app/reset-password/page.tsx

'use client'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleResetRequest() {
    if (!email) {
      setMessage({ type: 'error', text: 'Vul je email in' })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`
      })

      if (error) throw error

      setSent(true)
      setMessage({
        type: 'success',
        text: `Reset link verstuurd naar ${email}. Check je inbox!`
      })

    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <h2>Email verstuurd! ✉️</h2>
        <p>Check je inbox voor de reset link.</p>
        <p className="text-sm text-slate-600">
          Niet ontvangen? Check je spam folder of
          <button onClick={() => setSent(false)}>probeer opnieuw</button>
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <h1>Wachtwoord Vergeten</h1>
        <p>Vul je email in en we sturen je een reset link.</p>

        <Input
          type="email"
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="jouw@email.com"
        />

        <Button onClick={handleResetRequest} loading={loading} fullWidth>
          Stuur Reset Link
        </Button>

        <Link href="/login" className="text-sm text-teal-600">
          ← Terug naar login
        </Link>
      </div>
    </div>
  )
}
```

**E4.S2 - Reset Email Template:**
```html
<!-- Supabase → Authentication → Email Templates → Reset Password -->

<h2>Wachtwoord Resetten</h2>

<p>Je hebt een wachtwoord reset aangevraagd voor je Mini EPD account.</p>

<a href="{{ .ConfirmationURL }}"
   style="background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
  Reset Wachtwoord
</a>

<p style="color: #64748b; font-size: 14px;">
  Deze link is 1 uur geldig. Heb je deze reset niet aangevraagd? Negeer deze email - je wachtwoord blijft ongewijzigd.
</p>
```

**E4.S3 - Update Password Page:**
```typescript
// app/update-password/page.tsx

'use client'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleUpdatePassword() {
    // Validation
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Wachtwoorden komen niet overeen' })
      return
    }

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Wachtwoord minimaal 8 tekens' })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'Wachtwoord gewijzigd! Je kunt nu inloggen.'
      })

      setTimeout(() => router.push('/login'), 2000)

    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <h1>Nieuw Wachtwoord Instellen</h1>

        <Input
          type="password"
          label="Nieuw wachtwoord"
          value={password}
          onChange={setPassword}
          showStrength
        />

        <Input
          type="password"
          label="Bevestig wachtwoord"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        <Button onClick={handleUpdatePassword} loading={loading} fullWidth>
          Wachtwoord Wijzigen
        </Button>
      </div>
    </div>
  )
}
```

---

### Epic 5 — Email Verification

**Epic Doel:** Confirm email na signup (security + anti-spam).

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E5.S1 | Enable email confirmation | Supabase settings + email template | ⏳ | 1 |
| E5.S2 | Unverified state handling | Block app access until confirmed | ⏳ | 2 |

**Technical Notes:**

**E5.S1 - Enable Confirmation:**
```bash
# Supabase Dashboard:
# Authentication → Settings → Email Auth
# ✅ Enable email confirmations
# ✅ Secure email change
```

**E5.S2 - Verification Check:**
```typescript
// middleware.ts (UPDATE)

export async function middleware(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if email is verified
  if (user && !user.email_confirmed_at) {
    // Redirect to verification notice page
    return NextResponse.redirect(new URL('/verify-email', request.url))
  }

  // Rest of middleware logic...
}
```

```typescript
// app/verify-email/page.tsx (NEW)

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false)

  async function resendVerification() {
    setResending(true)
    // Trigger resend via Supabase
    await supabase.auth.resend({
      type: 'signup',
      email: user.email
    })
    setResending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md text-center space-y-6">
        <h1>Email Verificatie Vereist</h1>
        <p>Check je inbox voor de verificatie link.</p>

        <Button onClick={resendVerification} loading={resending}>
          Verstuur Opnieuw
        </Button>

        <Link href="/login">← Terug naar login</Link>
      </div>
    </div>
  )
}
```

---

### Epic 6 — Demo Account

**Epic Doel:** Quick demo access button voor recruiters/prospects.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E6.S1 | QuickDemoButton component | One-click demo login | ⏳ | 2 |
| E6.S2 | Demo mode indicator | Banner in EPD app | ⏳ | 1 |

**Technical Notes:**

**E6.S1 - Quick Demo Button:**
```typescript
// app/login/components/quick-demo-button.tsx

export function QuickDemoButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleQuickDemo() {
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@mini-ecd.demo',
        password: 'Demo2024!'
      })

      if (error) throw error

      trackEvent('demo_access')
      router.push('/epd/clients?demo=true')

    } catch (error) {
      setMessage({ type: 'error', text: 'Demo login mislukt' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleQuickDemo}
      disabled={loading}
      className="w-full py-3 px-4 bg-amber-100 border-2 border-amber-300 rounded-lg hover:bg-amber-200 transition-colors"
    >
      {loading ? (
        <Loader2 className="animate-spin mx-auto" />
      ) : (
        <span className="flex items-center justify-center gap-2">
          🎭 Quick Demo - Bekijk Prototype
        </span>
      )}
    </button>
  )
}
```

**E6.S2 - Demo Banner:**
```typescript
// app/epd/components/demo-banner.tsx

export function DemoBanner() {
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  if (!isDemo) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <span className="text-sm text-amber-800">
          🎭 Je bekijkt het prototype met demo data
        </span>
        <Link
          href="/login"
          className="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          Maak gratis account →
        </Link>
      </div>
    </div>
  )
}
```

---

### Epic 7 — Testing & Polish

**Epic Doel:** Alle flows grondig testen + edge cases + UX polish.

| Story ID | Beschrijving | Acceptatiecriteria | Status | Story Points |
|----------|--------------|---------------------|--------|--------------|
| E7.S1 | Test alle happy flows | Signup, login, reset, demo werken | ⏳ | 2 |
| E7.S2 | Test error scenarios | Network errors, invalid input, rate limits | ⏳ | 2 |
| E7.S3 | UX polish | Loading states, animations, responsive | ⏳ | 2 |

**Test Cases:**

| Test ID | Flow | Scenario | Expected Result |
|---------|------|----------|-----------------|
| TC1 | Signup | Valid email → Magic link | Success message, email sent |
| TC2 | Signup | Invalid email format | Validation error |
| TC3 | Signup | Email already exists | "Account bestaat al - probeer in te loggen" |
| TC4 | Login | Valid credentials | Redirect to dashboard |
| TC5 | Login | Invalid password | "Email of wachtwoord incorrect" |
| TC6 | Login | Unverified email | Redirect to verify-email page |
| TC7 | Password Reset | Valid email | Reset link sent |
| TC8 | Password Reset | Email not found | Still show success (security) |
| TC9 | Password Reset | Weak new password | Validation error "Min 8 characters" |
| TC10 | Demo | Quick demo button | Instant login, redirect with ?demo=true |
| TC11 | Session | Auto-refresh token | Session stays valid 24h+ |
| TC12 | Logout | Click logout | Session cleared, redirect to login |

---

## 5. Kwaliteit & Testplan

### Security Checklist

- [ ] Passwords hashed (Supabase handles)
- [ ] Rate limiting on sensitive endpoints
- [ ] HTTPS only (Vercel default)
- [ ] HTTP-only secure cookies
- [ ] Input validation (email, password strength)
- [ ] CSRF protection (Next.js built-in)
- [ ] No sensitive data in client-side code
- [ ] Error messages don't leak info ("Email or password incorrect" not "Email not found")

### Performance Checklist

- [ ] Auth state loaded < 500ms
- [ ] Form submissions < 2s response
- [ ] Optimistic UI updates
- [ ] Debounced email validation
- [ ] Code splitting (lazy load auth pages)

### UX Checklist

- [ ] Clear loading states (spinners)
- [ ] Success feedback (toasts/messages)
- [ ] Error messages user-friendly
- [ ] Keyboard accessible (tab order)
- [ ] Mobile responsive (touch targets)
- [ ] Focus management (auto-focus first input)
- [ ] Password visibility toggle
- [ ] Password strength indicator

---

## 6. Routes & File Structure

### New Routes

```
app/
├── login/page.tsx                    # Main auth page (signup/login/demo)
├── reset-password/page.tsx           # Request reset link
├── update-password/page.tsx          # Set new password (from email)
├── set-password/page.tsx             # Set password after magic link signup
├── verify-email/page.tsx             # Email verification notice
├── onboarding/page.tsx               # First-time user onboarding (optional)
├── auth/
│   ├── callback/route.ts             # Magic link callback (EXISTING)
│   └── logout/route.ts               # Logout handler (EXISTING)
```

### Components

```
components/auth/
├── auth-form.tsx                     # Main form component
├── quick-demo-button.tsx             # Demo access button
├── password-strength.tsx             # Password strength indicator
├── auth-message.tsx                  # Success/error message component
└── mode-switcher.tsx                 # Toggle between signup/login
```

---

## 7. Supabase Configuration

### Email Templates (To Configure)

1. **Confirm Signup** (Magic Link)
2. **Reset Password**
3. **Email Change Confirmation**

### Settings (To Enable)

```bash
# Supabase Dashboard → Authentication → Settings

✅ Enable email confirmations
✅ Enable email change confirmations
✅ Secure email change (require password)

# Email Auth Settings
Rate limit: 4 emails per hour (default)
Confirmation expiry: 1 hour
```

### RLS Policies (Verify)

```sql
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update own profile
CREATE POLICY "Users can update own data" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## 8. Risico's & Mitigatie

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| Email delivery issues | Middel | Hoog | - Demo account fallback<br>- "Resend email" buttons<br>- Clear "check spam" messaging |
| Rate limiting blocks users | Laag | Middel | - Increase Supabase limits<br>- Clear error message with wait time |
| Password reset abuse | Middel | Laag | - Rate limiting (built-in)<br>- Track suspicious activity |
| Email enumeration | Middel | Laag | - Same message for existing/non-existing emails<br>- No "email not found" errors |
| Session hijacking | Laag | Hoog | - HTTP-only cookies<br>- Short token expiry<br>- Secure flag on cookies |
| Broken magic links | Laag | Middel | - 24h expiry (reasonable)<br>- Clear error page<br>- "Request new link" option |

---

## 9. Definition of Done

**All Epics (E1-E7) zijn compleet wanneer:**

✅ **Functional Requirements:**
- Signup flow werkt (magic link → account created)
- Login flow werkt (email + password → dashboard)
- Password reset flow werkt (request → email → new password)
- Email verification enforced (unverified users blocked)
- Demo account accessible (one-click)
- Session management werkt (auto-refresh, logout)

✅ **Security Requirements:**
- All OWASP top 10 addressed
- No sensitive data in client code
- Rate limiting active
- Secure cookies configured

✅ **UX Requirements:**
- All flows tested on mobile + desktop
- Loading states smooth
- Error messages clear
- Keyboard accessible
- No console errors

✅ **Code Quality:**
- TypeScript strict mode (no `any`)
- Reusable components extracted
- Error handling comprehensive
- Code commented where complex

✅ **Documentation:**
- README updated with auth flow docs
- Environment variables documented
- Supabase setup guide created

✅ **Deployment:**
- Tested on staging environment
- Production deployment successful
- Smoke tests passed
- Rollback plan ready

---

## 10. Implementatie Volgorde

**Aanbevolen phased rollout:**

### **Phase 1: Foundation (3-4 uur)**
1. E1.S1-S4: Refactor login page
2. E2.S1-S2: Signup flow (magic link)
3. E3.S1: Login flow (password)

**Checkpoint:** Basic signup + login werkt

### **Phase 2: Password Management (2-3 uur)**
4. E4.S1-S4: Password reset flow
5. E3.S2: Set password after signup

**Checkpoint:** Complete password lifecycle

### **Phase 3: Security & Demo (2 uur)**
6. E5.S1-S2: Email verification
7. E6.S1-S2: Demo account + banner

**Checkpoint:** Production-ready security

### **Phase 4: Polish (1-2 uur)**
8. E7.S1-S3: Testing + UX polish

**Checkpoint:** All flows tested, ready to showcase

**Total: 8-11 uur**

---

## 11. Referenties

**Mission Control Documents:**
- **PRD:** `docs/specs/prd-mini-ecd-v1.2.md`
- **TO:** `docs/specs/to-mini-ecd-v1_2.md`

**External Resources:**
- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- Next.js SSR Auth: https://supabase.com/docs/guides/auth/server-side
- OWASP Top 10: https://owasp.org/www-project-top-ten/

**Code References:**
- Login page: `app/login/page.tsx` (MAJOR REFACTOR)
- Auth callback: `app/auth/callback/route.ts` (MINOR UPDATE)
- Middleware: `middleware.ts` (UPDATE - email verification check)
- Auth client: `lib/auth/client.ts` (EXTEND)

---

## 12. Versiehistorie

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| v1.0 | 18-01-2025 | Colin | Initiële versie - Volledige auth flow bouwplan |

---

**Status:** ⏳ Ready for Implementation
**Next Steps:** Start met E1.S1 (Design nieuwe page structuur)
**Portfolio Value:** 🔥🔥🔥🔥🔥 (High - showcases full-stack auth expertise)
