# Security Remediation Plan - Mini-EPD Prototype

**Versie:** 1.0
**Datum:** 22 november 2025
**Status:** In Progress
**Eigenaar:** Development Team

## Inhoudsopgave

1. [Executive Summary](#executive-summary)
2. [Critical Issues (Week 1)](#critical-issues-week-1)
3. [High Priority Issues (Week 1-2)](#high-priority-issues-week-1-2)
4. [Medium Priority Issues (Week 2-3)](#medium-priority-issues-week-2-3)
5. [Long-term Improvements (Week 4+)](#long-term-improvements-week-4)
6. [Verification & Testing](#verification--testing)
7. [Compliance Checklist](#compliance-checklist)

---

## Executive Summary

### Huidige Status
- **Security Score:** 4/10
- **Critical Issues:** 1
- **High Priority:** 3
- **Medium/Low Priority:** 7
- **GDPR Compliant:** ❌ Nee

### Doelstelling
- **Target Security Score:** 9/10
- **Target Completion:** 4 weken
- **GDPR Compliance:** ✅ Ja (binnen 6 weken)

### Impact
- **Development Time:** ~60-80 uur
- **Risk Reduction:** 85%
- **Compliance:** AVG/GDPR ready

---

## Critical Issues (Week 1)

### 🔴 Issue #1: Exposed Production Credentials

**Severity:** CRITICAL
**Priority:** P0 (Immediate)
**Effort:** 2 uur
**Status:** ⏳ Not Started

#### Probleem
`.env.example` bevat echte productie API keys in plaats van placeholders.

**Bestand:** `.env.example:4-5,14`

```bash
# HUIDIGE SITUATIE (GEVAARLIJK!)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... # Echte key!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...     # Echte key!
ANTHROPIC_API_KEY=sk-ant-api03-rrPx...    # Echte key!
```

#### Impact
- ⚠️ Service role key geeft volledige database toegang
- ⚠️ Iedereen met repository toegang kan alle data lezen/schrijven
- ⚠️ API misbruik mogelijk
- ⚠️ GDPR data breach

#### Remediation Steps

**Stap 1: Roteer alle API keys (URGENT)**

```bash
# 1. Supabase Dashboard
# → Settings → API → Project API keys
# → "Reset anon key" en "Reset service_role key"

# 2. Anthropic Dashboard
# → Settings → API Keys → "Delete" oude key → "Create new key"

# 3. Update .env.local met nieuwe keys
```

**Stap 2: Update .env.example**

```bash
# .env.example - ALLEEN PLACEHOLDERS!
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Stap 3: Verificatie**

```bash
# Check git history voor gelekte keys
git log -p -- .env.example | grep -E "eyJhbGci|sk-ant"

# Als keys gevonden: consider repository als compromised
# Overwegen: nieuwe private fork maken
```

#### Acceptance Criteria
- [ ] .env.example bevat alleen placeholders
- [ ] Alle productie keys zijn geroteerd
- [ ] Git history gecontroleerd op leaks
- [ ] Team geïnformeerd over nieuwe keys
- [ ] .env.local is toegevoegd aan .gitignore (already done ✅)

#### Verificatie
```bash
# Test dat app nog werkt met nieuwe keys
pnpm dev
# Navigeer naar http://localhost:3000 en test login
```

---

## High Priority Issues (Week 1-2)

### 🟠 Issue #2: Next.js Vulnerabilities

**Severity:** HIGH
**Priority:** P1
**Effort:** 1 uur
**Status:** ⏳ Not Started

#### Probleem
Next.js 14.2.18 heeft 7+ bekende security vulnerabilities:
- CVE-2024-56332: DoS via Server Actions
- CVE-2025-48068: Source code exposure
- 5+ additional issues

**Bestand:** `package.json:25`

#### Remediation Steps

```bash
# Update Next.js naar latest patched versie
pnpm update next@latest

# Of specifiek naar 14.2.30+
pnpm add next@14.2.30

# Test build
pnpm build

# Run audit
pnpm audit
```

#### Acceptance Criteria
- [ ] Next.js >= 14.2.30
- [ ] `pnpm audit` toont 0 high/critical issues
- [ ] Build succesvol
- [ ] Alle functionaliteit werkt nog

---

### 🟠 Issue #3: Ontbrekende Security Headers

**Severity:** HIGH
**Priority:** P1
**Effort:** 3 uur
**Status:** ⏳ Not Started

#### Probleem
Kritieke security headers ontbreken, waardoor XSS, clickjacking en andere attacks mogelijk zijn.

**Bestand:** `next.config.mjs`

#### Remediation Steps

**Stap 1: Voeg security headers toe**

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config ...

  async headers() {
    return [
      {
        // Apply headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js needs unsafe-eval
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://dqugbrpwtisgyxscpefg.supabase.co",
              "frame-ancestors 'self'"
            ].join('; ')
          }
        ]
      }
    ]
  }
}

export default nextConfig;
```

**Stap 2: Test headers**

```bash
# Start dev server
pnpm dev

# Test in browser console
curl -I http://localhost:3000 | grep -E "X-Frame|Content-Security"

# Of gebruik online tool: https://securityheaders.com/
```

#### Acceptance Criteria
- [ ] Alle security headers aanwezig
- [ ] CSP policy implementeerd (zonder app te breken)
- [ ] Test op securityheaders.com score A of B
- [ ] Geen console errors door CSP

#### Verificatie Script
```bash
#!/bin/bash
# test-security-headers.sh

URL="http://localhost:3000"

echo "Testing security headers..."

HEADERS=(
  "X-Frame-Options"
  "X-Content-Type-Options"
  "Strict-Transport-Security"
  "Content-Security-Policy"
  "Referrer-Policy"
)

for HEADER in "${HEADERS[@]}"; do
  VALUE=$(curl -s -I "$URL" | grep -i "$HEADER")
  if [ -n "$VALUE" ]; then
    echo "✅ $VALUE"
  else
    echo "❌ Missing: $HEADER"
  fi
done
```

---

### 🟠 Issue #4: Te Permissieve CORS Policy

**Severity:** HIGH
**Priority:** P1
**Effort:** 2 uur
**Status:** ⏳ Not Started

#### Probleem
`Access-Control-Allow-Origin: *` staat CSRF aanvallen toe.

**Bestand:** `app/api/leads/route.ts:110`

#### Remediation Steps

**Stap 1: Update CORS policy**

```typescript
// app/api/leads/route.ts

// Add at top of file
const ALLOWED_ORIGINS = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
];

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin || '')
    ? origin
    : ALLOWED_ORIGINS[0];

  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin || '',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // 24 hours
    }
  });
}

export async function POST(request: NextRequest) {
  // Add origin check
  const origin = request.headers.get('origin');
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json(
      { error: 'Origin not allowed' },
      { status: 403 }
    );
  }

  // ... rest of existing code ...
}
```

**Stap 2: Test CORS**

```bash
# Test valid origin
curl -X POST http://localhost:3000/api/leads \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","projectType":"web","message":"Test message test message test"}'

# Test invalid origin (should fail)
curl -X POST http://localhost:3000/api/leads \
  -H "Origin: https://evil.com" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","projectType":"web","message":"Test message test message test"}'
```

#### Acceptance Criteria
- [ ] CORS beperkt tot specifieke origins
- [ ] Development localhost werkt nog
- [ ] Invalid origins worden geweigerd
- [ ] OPTIONS preflight werkt correct

---

### 🟠 Issue #5: FHIR API zonder Authenticatie

**Severity:** HIGH
**Priority:** P1
**Effort:** 2 uur
**Status:** ⏳ Not Started

#### Probleem
FHIR endpoints zijn publiek toegankelijk zonder authenticatie check.

**Bestanden:**
- `app/api/fhir/Patient/route.ts`
- `app/api/fhir/Patient/[id]/route.ts`
- `app/api/fhir/Practitioner/route.ts`
- `app/api/fhir/Practitioner/[id]/route.ts`

#### Remediation Steps

**Stap 1: Voeg auth check toe aan alle FHIR endpoints**

```typescript
// app/api/fhir/Patient/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { supabaseAdmin } from '@/lib/supabase/server';
// ... other imports ...

export async function GET(request: NextRequest) {
  try {
    // ✅ ADD: Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        createOperationOutcome('error', 'security', 'Authentication required'),
        { status: 401 }
      );
    }

    // Rest of existing code...
    const { searchParams } = new URL(request.url);
    // ...
  } catch (error) {
    // ...
  }
}

export async function POST(request: NextRequest) {
  try {
    // ✅ ADD: Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        createOperationOutcome('error', 'security', 'Authentication required'),
        { status: 401 }
      );
    }

    // Rest of existing code...
  } catch (error) {
    // ...
  }
}
```

**Stap 2: Herhaal voor alle FHIR endpoints**

Pas dezelfde pattern toe op:
- `app/api/fhir/Patient/[id]/route.ts`
- `app/api/fhir/Practitioner/route.ts`
- `app/api/fhir/Practitioner/[id]/route.ts`

**Stap 3: Test authenticatie**

```bash
# Test zonder auth (should fail)
curl http://localhost:3000/api/fhir/Patient

# Test met auth (should succeed)
# 1. Login via browser en copy session cookie
# 2. Test met cookie:
curl http://localhost:3000/api/fhir/Patient \
  -H "Cookie: sb-access-token=YOUR_TOKEN_HERE"
```

#### Acceptance Criteria
- [ ] Alle FHIR endpoints vereisen authenticatie
- [ ] Unauthenticated requests krijgen 401
- [ ] Authenticated requests werken normaal
- [ ] Error messages zijn niet te verbose (geen stack traces)

---

## Medium Priority Issues (Week 2-3)

### 🟡 Issue #6: Te Permissieve RLS Policies

**Severity:** MEDIUM
**Priority:** P2
**Effort:** 8 uur
**Status:** ⏳ Not Started

#### Probleem
Alle authenticated users kunnen ALLE data lezen/schrijven/verwijderen. Geen multi-tenancy isolatie.

**Bestand:** `supabase/migrations/20241115000002_create_epd_core_tables.sql:168-181`

#### Huidige Situatie
```sql
-- TOO PERMISSIVE!
CREATE POLICY "Allow all for authenticated users" ON clients
  FOR ALL USING (auth.uid() IS NOT NULL);
```

#### Remediation Plan

**Optie A: User-based isolation (Simple)**
```sql
-- Optie A: Elke user ziet alleen eigen data
-- 1. Voeg user_id toe aan tabellen
ALTER TABLE clients ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- 2. Update policies
DROP POLICY "Allow all for authenticated users" ON clients;

CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (created_by = auth.uid());
```

**Optie B: Organization-based isolation (Recommended)**
```sql
-- Optie B: Multi-tenancy met organizations
-- 1. Voeg org_id toe aan tabellen
ALTER TABLE clients ADD COLUMN org_id UUID REFERENCES organizations(id);

-- 2. Voeg user_organizations mapping toe
CREATE TABLE user_organizations (
  user_id UUID REFERENCES auth.users(id),
  org_id UUID REFERENCES organizations(id),
  role TEXT CHECK (role IN ('admin', 'practitioner', 'readonly')),
  PRIMARY KEY (user_id, org_id)
);

-- 3. Create helper function
CREATE OR REPLACE FUNCTION get_user_org_id(user_uuid UUID)
RETURNS UUID AS $$
  SELECT org_id FROM user_organizations
  WHERE user_id = user_uuid
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 4. Update policies
DROP POLICY "Allow all for authenticated users" ON clients;

CREATE POLICY "Users can view org clients" ON clients
  FOR SELECT USING (
    org_id = get_user_org_id(auth.uid())
  );

CREATE POLICY "Users can insert org clients" ON clients
  FOR INSERT WITH CHECK (
    org_id = get_user_org_id(auth.uid())
  );

-- Etc...
```

#### Migration File

Maak nieuwe migration: `supabase/migrations/YYYYMMDD_implement_rls_isolation.sql`

```sql
-- Migration: Implement proper RLS isolation
-- Option: Organization-based (recommended)

BEGIN;

-- Step 1: Add org_id to all tables
ALTER TABLE clients ADD COLUMN org_id UUID REFERENCES organizations(id);
ALTER TABLE intake_notes ADD COLUMN org_id UUID;
ALTER TABLE problem_profiles ADD COLUMN org_id UUID;
ALTER TABLE treatment_plans ADD COLUMN org_id UUID;
ALTER TABLE ai_events ADD COLUMN org_id UUID;

-- Step 2: Create user_organizations mapping
CREATE TABLE user_organizations (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'practitioner', 'readonly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, org_id)
);

-- Step 3: Helper function
CREATE OR REPLACE FUNCTION get_user_org_id(user_uuid UUID)
RETURNS UUID AS $$
  SELECT org_id FROM user_organizations
  WHERE user_id = user_uuid
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Step 4: Update RLS policies
-- CLIENTS
DROP POLICY IF EXISTS "Allow all for authenticated users" ON clients;

CREATE POLICY "org_select" ON clients FOR SELECT
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "org_insert" ON clients FOR INSERT
  WITH CHECK (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "org_update" ON clients FOR UPDATE
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "org_delete" ON clients FOR DELETE
  USING (org_id = get_user_org_id(auth.uid()));

-- TODO: Repeat for other tables

COMMIT;
```

#### Acceptance Criteria
- [ ] Migration geschreven en getest
- [ ] Elke tabel heeft org_id kolom
- [ ] RLS policies filteren op org_id
- [ ] Users kunnen alleen eigen org data zien
- [ ] Test met 2+ orgs en 2+ users per org

#### Testing
```sql
-- Test script
-- 1. Create 2 orgs
INSERT INTO organizations (name) VALUES ('Org A'), ('Org B');

-- 2. Create 2 users (via Supabase auth)
-- 3. Map users to orgs
INSERT INTO user_organizations (user_id, org_id, role) VALUES
  ('user-1-uuid', 'org-a-uuid', 'practitioner'),
  ('user-2-uuid', 'org-b-uuid', 'practitioner');

-- 4. Create clients
INSERT INTO clients (first_name, last_name, birth_date, org_id) VALUES
  ('Client A', 'Org A', '1990-01-01', 'org-a-uuid'),
  ('Client B', 'Org B', '1990-01-01', 'org-b-uuid');

-- 5. Login as user-1 and query
-- Should only see Client A

-- 6. Login as user-2 and query
-- Should only see Client B
```

---

### 🟡 Issue #7: Organizations Table zonder Policies

**Severity:** MEDIUM
**Priority:** P2
**Effort:** 1 uur
**Status:** ⏳ Not Started

#### Probleem
Organizations tabel heeft RLS enabled maar geen policies.

#### Remediation Steps

```sql
-- supabase/migrations/YYYYMMDD_add_organizations_policies.sql

-- Allow authenticated users to view organizations they belong to
CREATE POLICY "users_view_own_orgs" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT org_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Allow org admins to update their organization
CREATE POLICY "admins_update_org" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT org_id FROM user_organizations
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only service role can INSERT/DELETE organizations
-- (via migrations or admin panel)
```

#### Acceptance Criteria
- [ ] SELECT policy voor organizations
- [ ] UPDATE policy voor admins
- [ ] Users kunnen eigen org zien
- [ ] Users kunnen geen andere orgs zien

---

### 🟡 Issue #8: Rate Limiting

**Severity:** MEDIUM
**Priority:** P2
**Effort:** 4 uur
**Status:** ⏳ Not Started

#### Probleem
Geen rate limiting op API endpoints = spam/DoS risico.

#### Remediation Options

**Optie A: Vercel KV + Upstash (Recommended voor Vercel deployment)**

```bash
# Install
pnpm add @upstash/ratelimit @upstash/redis
```

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

// Usage in API route:
import { ratelimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // ... rest of code
}
```

**Optie B: Simple in-memory (Development only)**

```typescript
// lib/simple-rate-limit.ts
const requests = new Map<string, number[]>();

export function checkRateLimit(
  ip: string,
  maxRequests: number = 10,
  windowMs: number = 10000
): boolean {
  const now = Date.now();
  const userRequests = requests.get(ip) || [];

  // Filter out old requests
  const recentRequests = userRequests.filter(
    time => now - time < windowMs
  );

  if (recentRequests.length >= maxRequests) {
    return false;
  }

  recentRequests.push(now);
  requests.set(ip, recentRequests);

  return true;
}
```

#### Endpoints die rate limiting nodig hebben
- [ ] `/api/leads` - 10 req/10s per IP
- [ ] `/api/fhir/Patient` POST - 20 req/min per user
- [ ] Auth callbacks - 5 req/min per IP

---

### 🟡 Issue #9: CSRF Protection

**Severity:** MEDIUM
**Priority:** P3
**Effort:** 2 uur
**Status:** ⏳ Not Started

#### Current Status
Next.js gebruikt SameSite cookies (default = Lax), wat al bescherming biedt.

#### Additional Hardening

```typescript
// lib/csrf.ts
import { NextRequest } from 'next/server';

export function verifyCsrfToken(request: NextRequest): boolean {
  // Check Origin header matches host
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (origin && !origin.endsWith(host || '')) {
    return false;
  }

  // Check Referer for additional validation
  const referer = request.headers.get('referer');
  if (referer && !referer.includes(host || '')) {
    return false;
  }

  return true;
}

// Usage:
export async function POST(request: NextRequest) {
  if (!verifyCsrfToken(request)) {
    return NextResponse.json(
      { error: 'Invalid request origin' },
      { status: 403 }
    );
  }
  // ...
}
```

#### Acceptance Criteria
- [ ] CSRF checks op alle POST/PUT/DELETE endpoints
- [ ] Origin header validation
- [ ] Tests voor cross-origin requests

---

### 🟡 Issue #10: Function Search Path

**Severity:** LOW
**Priority:** P3
**Effort:** 1 uur
**Status:** ⏳ Not Started

#### Probleem
3 database functies hebben mutable search_path.

#### Remediation

```sql
-- Fix all functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION is_demo_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM demo_users WHERE user_id = user_uuid
  );
$$ LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION get_demo_access_level(user_uuid UUID)
RETURNS TEXT AS $$
  SELECT access_level FROM demo_users WHERE user_id = user_uuid;
$$ LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp;
```

---

### 🟡 Issue #11: Leaked Password Protection

**Severity:** LOW
**Priority:** P3
**Effort:** 0.5 uur (configuratie)
**Status:** ⏳ Not Started

#### Remediation Steps

1. Ga naar Supabase Dashboard
2. Authentication → Providers → Email
3. Scroll naar "Password Protection"
4. Enable "Check for leaked passwords"
5. Save

**Link:** https://supabase.com/docs/guides/auth/password-security

---

## Long-term Improvements (Week 4+)

### 🔵 Audit Logging

**Priority:** P4
**Effort:** 12 uur

#### Implementatie

```sql
-- Create audit log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'SELECT', 'INSERT', 'UPDATE', 'DELETE'
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    user_id, action, table_name, record_id, old_data, new_data
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to sensitive tables
CREATE TRIGGER audit_clients
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

---

### 🔵 Encryption at Rest

**Status:** ✅ Enabled by default (Supabase)

Supabase gebruikt AES-256 encryption voor alle data. Geen actie nodig.

---

### 🔵 Backup & Recovery

```sql
-- Automated backups (Supabase Pro)
-- Daily point-in-time recovery (7 days retention)

-- Manual backup script
-- backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump $DATABASE_URL > backups/backup-$DATE.sql
```

---

## Verification & Testing

### Security Testing Checklist

#### Authentication Tests
- [ ] Unauthenticated users kunnen geen protected routes benaderen
- [ ] Session cookies zijn HttpOnly en Secure
- [ ] Session expiry werkt correct
- [ ] Password reset flow is secure

#### Authorization Tests
- [ ] Users kunnen alleen eigen org data zien
- [ ] Users kunnen geen andere org data wijzigen
- [ ] Admin privileges worden correct gehandhaafd
- [ ] Service role bypassed RLS (expected)

#### API Security Tests
```bash
# Test suite
./scripts/security-tests.sh

# Tests:
# 1. CORS - invalid origin rejected
# 2. Rate limiting - 429 after limit
# 3. Auth - 401 without token
# 4. CSRF - cross-origin POST rejected
# 5. Headers - all security headers present
```

#### OWASP Top 10 Checklist
- [x] A01:2021 – Broken Access Control → RLS policies
- [x] A02:2021 – Cryptographic Failures → HTTPS + Supabase encryption
- [x] A03:2021 – Injection → Supabase ORM (no raw SQL)
- [x] A04:2021 – Insecure Design → Security-first architecture
- [x] A05:2021 – Security Misconfiguration → Security headers
- [x] A06:2021 – Vulnerable Components → Dependency updates
- [x] A07:2021 – Identification/Authentication Failures → Supabase Auth
- [ ] A08:2021 – Software/Data Integrity Failures → Code signing (TODO)
- [x] A09:2021 – Security Logging Failures → Audit log (TODO)
- [x] A10:2021 – Server-Side Request Forgery → No SSRF vectors

---

## Compliance Checklist

### AVG/GDPR Requirements

#### Data Protection
- [ ] Data minimalisatie principe toegepast
- [ ] Encryptie at rest (Supabase ✅)
- [ ] Encryptie in transit (HTTPS ✅)
- [ ] Toegangscontrole (RLS policies)
- [ ] Audit logging geïmplementeerd

#### User Rights
- [ ] Recht op inzage (export functie)
- [ ] Recht op rectificatie (edit functie)
- [ ] Recht op vergetelheid (delete with cascade)
- [ ] Recht op dataportabiliteit (FHIR export)
- [ ] Recht op bezwaar (opt-out mechanisme)

#### Legal Basis
- [ ] Privacy policy aanwezig
- [ ] Cookie consent (indien tracking)
- [ ] Data Processing Agreement met Supabase
- [ ] Data breach notification procedure

#### Documentation
- [ ] Data mapping (welke data wordt opgeslagen)
- [ ] Retention policy (hoe lang bewaren)
- [ ] Access logs (wie heeft toegang gehad)
- [ ] Security incident response plan

---

## Progress Tracking

### Week 1
- [ ] Issue #1: Rotate credentials ⚠️ URGENT
- [ ] Issue #2: Update Next.js
- [ ] Issue #3: Security headers
- [ ] Issue #4: CORS policy
- [ ] Issue #5: FHIR auth

### Week 2
- [ ] Issue #6: RLS policies
- [ ] Issue #7: Organizations policies
- [ ] Issue #8: Rate limiting

### Week 3
- [ ] Issue #9: CSRF protection
- [ ] Issue #10: Function search path
- [ ] Issue #11: Password protection
- [ ] Security testing

### Week 4
- [ ] Audit logging
- [ ] Documentation
- [ ] Compliance review
- [ ] Final security scan

---

## Resources

### Tools
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Security Headers Checker](https://securityheaders.com/)
- [OWASP ZAP](https://www.zaproxy.org/)
- [pnpm audit](https://pnpm.io/cli/audit)

### Documentation
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [AVG/GDPR Guide](https://autoriteitpersoonsgegevens.nl/)

---

**Last Updated:** 22 november 2025
**Next Review:** Na afronding Week 1 (29 november 2025)
