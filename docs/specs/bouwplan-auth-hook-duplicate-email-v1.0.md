# 🔐 Bouwplan — Auth Hook voor Duplicate Email Detection

**Projectnaam:** Mini EPD - Auth Hook Implementatie
**Versie:** v1.0 (Code-First Approach)
**Datum:** 18-01-2025
**Auteur:** Colin (met Claude Code)
**Scope:** Server-side duplicate email detection via Auth Hook - Volledig in code waar mogelijk

---

## 1. Filosofie: Code-First Approach

**Principe:**
- ✅ Alles wat mogelijk is in code/migrations → komt in code
- ✅ Geen handmatige Dashboard configuratie waar mogelijk
- ✅ Flexibel voor toekomstige auth provider switches
- ✅ Herhaalbaar en version controlled

**Realiteit:**
- Functie: Volledig in SQL migrations ✅
- Hook link: Vereist Dashboard configuratie (Supabase limietatie) ⚠️
- Oplossing: Setup script + duidelijke documentatie

---

## 2. Probleem Statement

**Huidige Situatie:**
- Bij signup met bestaand emailadres (bijv. `colin.lit@gmail.com`) krijgt gebruiker succesmelding
- Geen email wordt verzonden (omdat account al bestaat)
- Gebruiker denkt dat account is aangemaakt maar krijgt geen verificatie email
- Verwarrende UX

**Root Cause:**
- Supabase geeft geen error bij duplicate email als "Email confirmation" AAN staat
- Dit is een security feature (email enumeration prevention)
- Client-side detection is onbetrouwbaar (werkt alleen als password correct is)

**Oplossing:**
- Implementeer `before-user-created` Auth Hook
- Server-side check of email al bestaat in database
- Return custom error message als email al geregistreerd is

---

## 3. Wat Gaan We Bouwen?

| Component | Wat | Waar | Status |
|-----------|-----|------|--------|
| Postgres Function | Database functie | `supabase/migrations/` | ✅ Volledig in code |
| Setup Script | Automatiseer hook link | `scripts/setup-auth-hook.ts` | ✅ Code-based |
| README | Documentatie | `docs/AUTH_HOOK_SETUP.md` | ✅ Documentatie |
| Error Handling | Client-side updates | `app/login/page.tsx` | ✅ Code |

**Totaal: ~2.5 uur werk**

---

## 4. Technische Keuze: Postgres Function vs HTTP Edge Function

### **Optie A: Postgres Function (AANBEVOLEN) ✅**
**Voordelen:**
- ✅ Geen extra dependencies nodig
- ✅ Direct database access (sneller)
- ✅ Makkelijk te onderhouden (SQL in migrations)
- ✅ Geen extra hosting/configuration
- ✅ Past bij bestaande setup (je hebt al migrations)

**Nadelen:**
- ⚠️ Moet SQL schrijven (maar is simpel)

### **Optie B: HTTP Edge Function**
**Voordelen:**
- ✅ TypeScript (bekende taal)
- ✅ Meer flexibiliteit voor complexe logica

**Nadelen:**
- ❌ Extra setup nodig (Supabase Functions)
- ❌ Extra deployment step
- ❌ Meer complexiteit

**Beslissing: Postgres Function (Optie A)**

---

## 5. Implementatie Plan

### **Epic 1: Volledig Code-Based Setup**

| Story ID | Wat Bouwen? | Bestanden | Story Points |
|----------|-------------|-----------|--------------|
| E1.S1 | Create hook function | `supabase/migrations/YYYYMMDDHHMMSS_auth_hook_duplicate_email.sql` | 2 |
| E1.S2 | Setup script voor hook link | `scripts/setup-auth-hook.ts` | 2 |
| E1.S3 | Documentatie | `docs/AUTH_HOOK_SETUP.md` | 1 |
| E1.S4 | Update client error handling | `app/login/page.tsx` | 1 |

---

## 6. Epic 1 — Implementatie Details

### **E1.S1 - Create Hook Function (Volledig in Migrations)**

**Bestand:** `supabase/migrations/20250118120000_auth_hook_duplicate_email.sql`

**Wat doet de functie:**
1. Ontvangt signup event van Supabase Auth
2. Haalt email adres uit event payload
3. Valideert email (niet NULL/empty)
4. Normaliseert email (lowercase + trim)
5. Checkt of email al bestaat in `auth.users` table (case-insensitive)
6. Als email bestaat → return error object
7. Als email nieuw is → return empty object (allow signup)

**SQL Code:**
```sql
-- ============================================================================
-- Auth Hook: Duplicate Email Detection
-- ============================================================================
-- Deze functie wordt aangeroepen VOOR een nieuwe user wordt aangemaakt.
-- Checkt of het emailadres al bestaat en blokkeert signup indien nodig.
--
-- Hook Type: before-user-created
-- Flexibel: Werkt met elke auth provider die Postgres functies ondersteunt
-- ============================================================================

create or replace function public.hook_check_duplicate_email(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  user_email text;
  email_exists boolean;
begin
  -- Extract email from event payload
  user_email := event->'user'->>'email';
  
  -- Validate email is not null or empty
  if user_email is null or trim(user_email) = '' then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'message', 'Email adres is verplicht.',
        'http_code', 400
      )
    );
  end if;
  
  -- Normalize email (lowercase, trim) for consistent checking
  user_email := lower(trim(user_email));
  
  -- Check if email already exists in auth.users (case-insensitive)
  select exists(
    select 1 
    from auth.users 
    where lower(email) = user_email
  ) into email_exists;
  
  -- If email exists, reject signup with error
  if email_exists then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'message', 'Dit emailadres is al geregistreerd. Probeer in te loggen of gebruik "Wachtwoord vergeten?".',
        'http_code', 400
      )
    );
  end if;
  
  -- Email doesn't exist, allow signup
  return '{}'::jsonb;
end;
$$;

-- Grant execute permission to Supabase Auth service
grant execute
  on function public.hook_check_duplicate_email
  to supabase_auth_admin;

-- Revoke from other roles (security)
revoke execute
  on function public.hook_check_duplicate_email
  from authenticated, anon, public;

-- Add comment for documentation
comment on function public.hook_check_duplicate_email is 
  'Auth hook voor duplicate email detection. Wordt aangeroepen via Supabase Auth Hooks (before-user-created).';
```

**Waarom `set search_path`?**
- Zorgt dat `auth.users` correct wordt gevonden
- Voorkomt "table not found" errors
- Best practice voor security definer functies

**MVP Verbeteringen:**
- ✅ NULL/empty email check (voorkomt crashes)
- ✅ Email normalisatie (lowercase + trim voor consistentie)
- ✅ Case-insensitive duplicate check (Email@Example.com = email@example.com)

---

### **E1.S2 - Setup Script (Automatiseer Hook Link)**

**Bestand:** `scripts/setup-auth-hook.ts`

**Doel:** Automatiseer hook link configuratie waar mogelijk

```typescript
#!/usr/bin/env tsx
/**
 * Setup Script: Configure Auth Hook Link
 * 
 * Dit script configureert de link tussen Supabase Auth Hook en onze Postgres functie.
 * 
 * Helaas ondersteunt Supabase Management API nog geen Auth Hooks configuratie,
 * dus dit script geeft instructies voor handmatige configuratie.
 * 
 * In de toekomst kan dit worden geautomatiseerd zodra Supabase API dit ondersteunt.
 */

import { supabaseAdmin } from '@/lib/supabase/server'

async function setupAuthHook() {
  console.log('🔐 Auth Hook Setup Script\n')
  
  // Check if function exists by trying to call it with a test payload
  // This is more reliable than querying pg_proc directly
  const { error } = await supabaseAdmin.rpc('hook_check_duplicate_email', {
    event: JSON.stringify({
      user: {
        email: 'test@example.com'
      }
    })
  })
  
  // If function doesn't exist, we'll get a "function does not exist" error
  // If it exists but returns an error, that's fine - we just want to check existence
  if (error && error.message?.includes('does not exist')) {
    console.error('❌ Function niet gevonden:', error.message)
    console.log('\n📝 Stap 1: Run eerst de migration:')
    console.log('   supabase db push')
    console.log('   Of via Supabase Dashboard → SQL Editor')
    return
  }
  
  console.log('✅ Function exists: hook_check_duplicate_email')
  console.log('\n📝 Stap 2: Configureer hook link in Supabase Dashboard:')
  console.log('   1. Ga naar: https://supabase.com/dashboard/project/YOUR_PROJECT/auth/hooks')
  console.log('   2. Klik "Add hook"')
  console.log('   3. Selecteer:')
  console.log('      - Hook Type: before-user-created')
  console.log('      - Hook Name: check-duplicate-email')
  console.log('      - Hook Function: hook_check_duplicate_email')
  console.log('      - Hook URL: (leeg laten)')
  console.log('   4. Klik "Save"')
  console.log('\n💡 Tip: Deze stap moet handmatig omdat Supabase Management API')
  console.log('   Auth Hooks configuratie nog niet ondersteunt.')
  console.log('\n✅ Setup compleet! Test met: pnpm run test:auth-hook')
}

setupAuthHook().catch(console.error)
```

**Toevoegen aan `package.json`:**
```json
{
  "scripts": {
    "setup:auth-hook": "tsx scripts/setup-auth-hook.ts"
  }
}
```

---

### **E1.S3 - Documentatie**

**Bestand:** `docs/AUTH_HOOK_SETUP.md`

```markdown
# Auth Hook Setup Guide

## Overzicht

Deze hook detecteert duplicate emails VOOR een user wordt aangemaakt, 
waardoor gebruikers direct feedback krijgen als hun email al geregistreerd is.

## Setup (Eerste Keer)

### Stap 1: Deploy Migration

\`\`\`bash
# Via Supabase CLI (aanbevolen)
supabase db push

# Of via Dashboard
# Ga naar SQL Editor → Run migration file
\`\`\`

### Stap 2: Configureer Hook Link

**Helaas moet dit handmatig via Dashboard** (Supabase ondersteunt dit nog niet via API):

1. Ga naar: [Supabase Dashboard → Auth → Hooks](https://supabase.com/dashboard/project/_/auth/hooks)
2. Klik "Add hook"
3. Vul in:
   - **Hook Type:** \`before-user-created\`
   - **Hook Name:** \`check-duplicate-email\`
   - **Hook Function:** \`hook_check_duplicate_email\`
   - **Hook URL:** (leeg laten)
4. Klik "Save"

### Stap 3: Test

\`\`\`bash
pnpm run setup:auth-hook
\`\`\`

## Herhaalbaarheid

- ✅ Functie code staat in migrations (version controlled)
- ⚠️ Hook link moet per omgeving handmatig worden geconfigureerd
- 📝 Documentatie staat in Git

## Toekomstige Verbeteringen

Zodra Supabase Management API Auth Hooks ondersteunt, kunnen we:
- Hook link volledig automatiseren
- Setup script uitbreiden met API calls
- CI/CD pipeline voor hook configuratie

## Flexibiliteit

De functie is geschreven in standaard PostgreSQL, waardoor:
- ✅ Werkt met elke auth provider die Postgres functies ondersteunt
- ✅ Makkelijk te migreren naar andere auth systemen
- ✅ Geen vendor lock-in voor de logica zelf
```

---

### **E1.S4 - Update Client Error Handling**

**Bestand:** `app/login/page.tsx`

**Wat wijzigen:**
- Update error handling om hook error messages te tonen
- Hook errors komen binnen via `error.message`
- Verbeter UX door automatisch naar login mode te switchen bij duplicate email

**Verbeterde code:**
```typescript
catch (error: any) {
  const errorMessage = error.message || 'Er ging iets mis. Probeer opnieuw.'
  
  // Check if it's a duplicate email error from hook
  if (errorMessage.includes('al geregistreerd')) {
    setMessage({
      type: 'error',
      text: errorMessage
    })
    // Switch to login mode after 2 seconds
    setTimeout(() => {
      setMode('login')
      setPassword('')
      setConfirmPassword('')
    }, 2000)
  } else {
    setMessage({
      type: 'error',
      text: errorMessage
    })
  }
}
```

---

## 7. Implementatie Volgorde

**Stap 1: Create Migration** (30 min)
1. Maak `supabase/migrations/20250118120000_auth_hook_duplicate_email.sql`
2. Deploy via `supabase db push` of Dashboard

**Stap 2: Create Setup Script** (30 min)
1. Maak `scripts/setup-auth-hook.ts`
2. Test script: `pnpm run setup:auth-hook`

**Stap 3: Create Documentation** (15 min)
1. Maak `docs/AUTH_HOOK_SETUP.md`
2. Update main README met link

**Stap 4: Configure Hook Link** (5 min)
1. Run setup script voor instructies
2. Volg Dashboard stappen

**Stap 5: Update Client** (15 min)
1. Verbeter error handling
2. Test duplicate email scenario

**Stap 6: Testing** (30 min)
1. Test signup met nieuw email → moet werken
2. Test signup met bestaand email → moet error geven
3. Test signup met bestaand email + verkeerd password → moet error geven
4. Test signup met bestaand email + correct password → moet error geven (want account bestaat al)

**Totaal: ~2.5 uur werk**

---

## 8. Testing Checklist

| Test Case | Scenario | Expected Result |
|-----------|----------|-----------------|
| TC1 | Signup met nieuw email | Account aangemaakt, email verzonden |
| TC2 | Signup met bestaand email | Error: "Dit emailadres is al geregistreerd..." |
| TC3 | Signup met bestaand email (case variant: Email@Example.com) | Error: "Dit emailadres is al geregistreerd..." |
| TC4 | Signup met lege/NULL email | Error: "Email adres is verplicht." |
| TC5 | Hook disabled → signup met bestaand email | Oude gedrag (geen error, maar ook geen email) |

---

## 9. Voordelen van Code-First Aanpak

✅ **Version Control**: Functie code staat in Git
✅ **Herhaalbaar**: Migrations kunnen opnieuw worden gedraaid
✅ **Documentatie**: Alles staat in code en docs
✅ **Flexibel**: Makkelijk te migreren naar andere auth providers
✅ **Team-vriendelijk**: Iedereen ziet wat er gebeurt
✅ **CI/CD Ready**: Migrations kunnen geautomatiseerd worden
✅ **Server-side**: Veilig, kan niet worden omzeild door client
✅ **Betrouwbaar**: Werkt altijd, ongeacht password
✅ **Duidelijke UX**: Gebruiker krijgt direct feedback
✅ **Security**: Behoudt email enumeration protection voor andere scenario's
✅ **Performance**: Direct database check, geen extra HTTP calls

---

## 10. Limitaties & Workarounds

**Limitaties:**
- ⚠️ Hook link configuratie kan niet volledig in code (Supabase limietatie)
- ⚠️ Setup script geeft alleen instructies (geen API beschikbaar)

**Workarounds:**
- ✅ Duidelijke documentatie voor handmatige stap
- ✅ Setup script valideert dat functie bestaat
- ✅ Toekomst-proof: zodra API beschikbaar is, kunnen we automatiseren

---

## 11. Alternatieve Aanpakken (Niet Aanbevolen)

### **Optie X: Email Confirmation UIT zetten**
- ❌ Minder secure (email enumeration mogelijk)
- ✅ Wel makkelijker duplicate detection
- **Niet aanbevolen voor production**

### **Optie Y: Client-side login check (huidige aanpak)**
- ⚠️ Werkt alleen als password correct is
- ⚠️ Extra API call
- ⚠️ Kan niet onderscheiden tussen "nieuw account" en "verkeerd password"
- **Acceptabel voor prototype, niet voor production**

---

## 12. Definition of Done

✅ **Epic 1 compleet wanneer:**
- Postgres functie bestaat en werkt (in migrations)
- Setup script werkt en geeft duidelijke instructies
- Documentatie compleet en up-to-date
- Hook geconfigureerd in Supabase Dashboard
- Test signup met bestaand email geeft error
- Test signup met nieuw email werkt normaal
- Error messages zijn gebruiksvriendelijk
- Geen breaking changes aan bestaande auth flow
- Git commit: `feat: Add auth hook for duplicate email detection`

---

## 13. MVP vs Production

**Wat zit er in MVP (huidige plan):**
- ✅ Duplicate email detection
- ✅ NULL/empty email validation
- ✅ Case-insensitive matching
- ✅ Email normalisatie (lowercase + trim)
- ✅ Duidelijke error messages
- ✅ Setup script voor validatie

**Wat komt later (Production - Optioneel):**
- [ ] Rate limiting op hook (voorkom abuse)
- [ ] Logging tabel voor duplicate attempts
- [ ] Analytics: hoeveel duplicate attempts per dag?
- [ ] Monitoring/alerting voor hook failures
- [ ] Custom error messages per scenario

---

**Status:** ⏳ Ready for Implementation
**Geschatte Tijd:** 2.5 uur
**Next Step:** Maak migration file `supabase/migrations/20250118120000_auth_hook_duplicate_email.sql`

