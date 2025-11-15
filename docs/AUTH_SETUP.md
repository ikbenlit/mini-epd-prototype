# 🔐 Authentication Setup Guide

**Project:** AI Speedrun - Mini-ECD Prototype
**Epic:** E2 - Database & Auth
**Story:** E2.S3 - Demo auth flow
**Last Updated:** 2024-11-15

---

## Overview

This document describes the authentication implementation for the EPD prototype, including magic link login and demo user accounts.

---

## Authentication Methods

### 1. Magic Link (Primary Method)

Users can sign in using email-only authentication:

1. User enters email on `/login`
2. Supabase sends magic link to email
3. User clicks link → auto-logged in
4. **New users:** Account is automatically created on first magic link request

**Benefits:**
- No password to remember
- More secure than traditional passwords
- Better UX for demo environment
- Auto-creates accounts (no separate signup flow needed)

---

### 2. Demo Accounts (For Presentations)

Pre-configured demo accounts for public demos and presentations:

| Email | Password | Access Level | Purpose |
|-------|----------|--------------|---------|
| demo@mini-ecd.demo | Demo2024! | interactive | Main demo account - full CRUD |
| readonly@mini-ecd.demo | Demo2024! | read_only | View-only for public demos |
| presenter@mini-ecd.demo | Demo2024! | presenter | Live presentations |

**Access Levels:**
- `read_only`: Can view all data, cannot create/edit/delete
- `interactive`: Full CRUD access to all features
- `presenter`: Full access + special presenter features (future)

---

## Setup Instructions

### 1. Environment Variables

Ensure these are set in your `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dqugbrpwtisgyxscpefg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Service role key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Create Demo Users

Run the seed script to create demo user accounts:

```bash
# Make sure you have tsx installed
pnpm add -D tsx

# Run the seed script
tsx scripts/seed-demo-users.ts
```

**Expected output:**
```
🌱 Starting demo user seed...

Creating user: demo@mini-ecd.demo...
  ✅ Created auth user: xxx-xxx-xxx
  ✅ Created demo_users entry
  ✨ demo@mini-ecd.demo ready!

Creating user: readonly@mini-ecd.demo...
  ✅ Created auth user: xxx-xxx-xxx
  ✅ Created demo_users entry
  ✨ readonly@mini-ecd.demo ready!

Creating user: presenter@mini-ecd.demo...
  ✅ Created auth user: xxx-xxx-xxx
  ✅ Created demo_users entry
  ✨ presenter@mini-ecd.demo ready!

✅ Demo user seed complete!
```

### 3. Configure Supabase Auth Settings

Go to Supabase Dashboard → Authentication → Settings:

#### Email Templates

Customize the magic link email template:

**Subject:** "Login to Mini-ECD"

**Body:**
```html
<h2>Je magic link is klaar!</h2>
<p>Klik op de knop hieronder om in te loggen bij Mini-ECD:</p>
<p><a href="{{ .ConfirmationURL }}">Login naar EPD</a></p>
<p>Of kopieer deze link naar je browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p><small>Deze link is 1 uur geldig.</small></p>
```

#### Redirect URLs

Add these redirect URLs under "Redirect URLs":

```
http://localhost:3000/auth/callback
https://yourdomain.com/auth/callback
```

#### Email Auth Settings

- ✅ Enable Email provider
- ✅ Confirm email: OFF (for demo convenience)
- ✅ Secure email change: ON
- ⏱️ Rate limits: Default (4 emails per hour)

---

## File Structure

```
app/
  login/
    page.tsx                      # Login UI (magic link + demo login)
  auth/
    callback/
      route.ts                    # Handles magic link callback
    logout/
      route.ts                    # Logout endpoint

lib/
  auth/
    client.ts                     # Client-side auth helpers
    server.ts                     # Server-side auth helpers
  database.types.ts               # Generated Supabase types

middleware.ts                     # Route protection
scripts/
  seed-demo-users.ts              # Demo user creation script
```

---

## Usage Examples

### Client-Side (React Components)

```typescript
import {
  loginWithMagicLink,
  loginWithPassword,
  logout,
  getUser,
  isDemoUser
} from '@/lib/auth/client'

// Magic link login
async function handleMagicLink(email: string) {
  const result = await loginWithMagicLink(email)
  console.log(result.message) // "Check je email voor de magic link!"
}

// Demo account login
async function handleDemoLogin() {
  await loginWithPassword('demo@mini-ecd.demo', 'Demo2024!')
  router.push('/clients')
}

// Check current user
const user = await getUser()
const isDemo = await isDemoUser()

// Logout
await logout() // Redirects to /login
```

### Server-Side (API Routes, Server Components)

```typescript
import {
  requireAuth,
  getUser,
  canWrite,
  getDemoUserInfo
} from '@/lib/auth/server'

// Require authentication in API route
export async function GET() {
  const session = await requireAuth() // Throws if not authenticated
  // ... handle request
}

// Check write permissions
export async function POST() {
  const hasWriteAccess = await canWrite()

  if (!hasWriteAccess) {
    return NextResponse.json(
      { error: 'Read-only demo account cannot create data' },
      { status: 403 }
    )
  }

  // ... create resource
}

// Get demo user info
const demoInfo = await getDemoUserInfo()
if (demoInfo) {
  console.log(`Access level: ${demoInfo.access_level}`)
  console.log(`Usage count: ${demoInfo.usage_count}`)
}
```

---

## Route Protection

Routes are protected via `middleware.ts`:

### Public Routes (No Auth Required)
- `/` - Landing page
- `/login` - Login page
- `/epd` - EPD demo info
- `/contact` - Contact form
- `/auth/callback` - Auth callback

### Protected Routes (Auth Required)
- `/clients` - Client list
- `/clients/*` - Client details, intake, etc.
- Any other route not in public list

**Behavior:**
- ✅ Unauthenticated → Redirect to `/login?redirect=/original-path`
- ✅ Authenticated on `/login` → Redirect to `/clients`
- ✅ Session auto-refreshed in middleware

---

## Security Features

### ✅ Implemented

1. **RLS Policies**: All database queries filtered by `auth.uid()`
2. **Session Management**: Auto-refresh tokens via middleware
3. **Secure Cookies**: HTTP-only, secure flags set
4. **CSRF Protection**: Built-in Next.js CSRF protection
5. **Rate Limiting**: Supabase default (4 emails/hour)
6. **Demo User Tracking**: Usage count and last login tracked

### 🔒 Production Enhancements

For production deployment:

1. **Email Confirmation**: Enable email confirmation
2. **Password Requirements**: Enforce strong passwords
3. **MFA**: Add multi-factor authentication
4. **Session Timeout**: Implement auto-logout after inactivity
5. **IP Whitelisting**: Restrict demo accounts to specific IPs
6. **Audit Logging**: Enhanced tracking of all auth events

---

## Demo User Management

### Checking Demo Status

```typescript
// Check if user is demo user
const isDemo = await isDemoUser()

// Get access level
const accessLevel = await getDemoAccessLevel()
// Returns: 'read_only' | 'interactive' | 'presenter' | null
```

### Restricting Actions

```typescript
// In API route
const demoInfo = await getDemoUserInfo()

if (demoInfo?.access_level === 'read_only') {
  return NextResponse.json(
    { error: 'This demo account is read-only' },
    { status: 403 }
  )
}
```

### Resetting Demo Accounts

To reset a demo account (clear data, reset usage):

```sql
-- Reset usage count
UPDATE demo_users
SET usage_count = 0, last_login_at = NULL
WHERE access_level = 'interactive';

-- Or via Supabase Dashboard: Authentication → Users → Delete user data
```

---

## Troubleshooting

### Issue: Magic link not arriving

**Causes:**
- Email in spam folder
- Rate limit exceeded (4 emails/hour)
- Email provider blocking Supabase emails

**Solutions:**
1. Check spam folder
2. Wait 1 hour and try again
3. Use demo account instead
4. Configure custom SMTP in Supabase

### Issue: "Invalid login credentials"

**Causes:**
- Wrong email/password for demo account
- Demo user not created yet

**Solutions:**
1. Check credentials match exactly (case-sensitive)
2. Run seed script: `tsx scripts/seed-demo-users.ts`
3. Verify in Supabase Dashboard → Authentication → Users

### Issue: Redirect loop on /login

**Causes:**
- Middleware configuration error
- Session cookie issues

**Solutions:**
1. Clear browser cookies
2. Check middleware.ts public routes config
3. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct

### Issue: "Row violates RLS policy" errors

**Causes:**
- User not properly authenticated
- Session expired
- RLS policies misconfigured

**Solutions:**
1. Logout and login again
2. Check `auth.uid()` returns valid UUID
3. Verify RLS policies allow user access

---

## Testing Checklist

### Magic Link Flow
- [ ] Can enter email on /login
- [ ] Magic link email received
- [ ] Clicking link redirects to /clients
- [ ] Session persists after page refresh
- [ ] New users auto-created on first login

### Demo Account Flow
- [ ] Can login with demo@mini-ecd.demo
- [ ] Can login with readonly@mini-ecd.demo
- [ ] Interactive account can create/edit data
- [ ] Read-only account blocked from editing
- [ ] Demo usage tracked in demo_users table

### Route Protection
- [ ] /clients redirects to /login when not authenticated
- [ ] /login redirects to /clients when authenticated
- [ ] Public routes accessible without auth
- [ ] Session auto-refreshes

### Logout
- [ ] Logout clears session
- [ ] Redirects to /login
- [ ] Cannot access protected routes after logout

---

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- Build Plan: `docs/specs/bouwplan-ai-speedrun-marketing-first-v1.1.md` Epic 2
- Technical Design: `docs/specs/to-mini-ecd-v1_2.md` § 5.7

---

**Status:** ✅ Implemented and Ready for Testing
**Next Steps:** E2.S4 - Seed data script (clients + dossiers)
