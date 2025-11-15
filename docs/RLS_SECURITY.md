# 🔒 Row Level Security (RLS) Documentation

**Project:** AI Speedrun - Mini-ECD Prototype
**Epic:** E2 - Database & Auth
**Story:** E2.S2 - RLS policies implementeren
**Last Updated:** 2024-11-15

---

## Overview

This document describes the Row Level Security (RLS) implementation for the EPD core database tables. RLS is PostgreSQL's security feature that restricts which rows users can access in database queries.

### Security Model

- **Authentication Required:** All data access requires a valid Supabase authentication session
- **Authorization:** Checked via `auth.uid()` function which returns the authenticated user's UUID
- **MVP Level:** All authenticated users can access all data (suitable for demo/single-org)
- **Production Path:** Ready to extend with `org_id` filtering for multi-tenancy

---

## Tables & Policies

### 1. Clients Table

**Purpose:** Basic client information
**RLS Enabled:** ✅ Yes

#### Policies:

| Policy Name | Operation | Rule |
|------------|-----------|------|
| Authenticated users can view clients | SELECT | `auth.uid() IS NOT NULL` |
| Authenticated users can create clients | INSERT | `auth.uid() IS NOT NULL` |
| Authenticated users can update clients | UPDATE | `auth.uid() IS NOT NULL` |
| Authenticated users can delete clients | DELETE | `auth.uid() IS NOT NULL` |

**Production Enhancement:**
```sql
-- Add organization filtering
CREATE POLICY "Users can view own org clients"
  ON clients FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    org_id = (SELECT org_id FROM users WHERE id = auth.uid())
  );
```

---

### 2. Intake Notes Table

**Purpose:** TipTap/ProseMirror JSON content storage
**RLS Enabled:** ✅ Yes

#### Policies:

| Policy Name | Operation | Rule |
|------------|-----------|------|
| Authenticated users can view intake notes | SELECT | `auth.uid() IS NOT NULL` |
| Authenticated users can create intake notes | INSERT | `auth.uid() IS NOT NULL` |
| Authenticated users can update intake notes | UPDATE | `auth.uid() IS NOT NULL` |
| Authenticated users can delete intake notes | DELETE | `auth.uid() IS NOT NULL` |

**Security Features:**
- Full-text search index with Dutch language support
- Cascade delete when parent client is deleted
- Automatic `updated_at` trigger

---

### 3. Problem Profiles Table

**Purpose:** DSM-light categorization with severity scoring
**RLS Enabled:** ✅ Yes

#### Policies:

| Policy Name | Operation | Rule |
|------------|-----------|------|
| Authenticated users can view problem profiles | SELECT | `auth.uid() IS NOT NULL` |
| Authenticated users can create problem profiles | INSERT | `auth.uid() IS NOT NULL` |
| Authenticated users can update problem profiles | UPDATE | `auth.uid() IS NOT NULL` |
| Authenticated users can delete problem profiles | DELETE | `auth.uid() IS NOT NULL` |

**Data Constraints:**
- Category: Must be one of 6 DSM-light categories
- Severity: Must be 'laag', 'middel', or 'hoog'
- Cascade delete with parent client
- SET NULL on source note deletion

---

### 4. Treatment Plans Table

**Purpose:** Treatment plans with JSONB structure and versioning
**RLS Enabled:** ✅ Yes

#### Policies:

| Policy Name | Operation | Rule |
|------------|-----------|------|
| Authenticated users can view treatment plans | SELECT | `auth.uid() IS NOT NULL` |
| Authenticated users can create treatment plans | INSERT | `auth.uid() IS NOT NULL` |
| Authenticated users can update treatment plans | UPDATE | `auth.uid() IS NOT NULL` |
| Authenticated users can delete treatment plans | DELETE | `auth.uid() IS NOT NULL` |

**Versioning:**
- Each client can have multiple versions (v1, v2, etc.)
- Status: 'concept' (editable) or 'gepubliceerd' (locked)
- UNIQUE constraint on (client_id, version)

---

### 5. AI Events Table

**Purpose:** Telemetry and debugging for AI API calls
**RLS Enabled:** ✅ Yes
**Special:** Append-only (no UPDATE/DELETE for regular users)

#### Policies:

| Policy Name | Operation | Rule |
|------------|-----------|------|
| Authenticated users can view AI events | SELECT | `auth.uid() IS NOT NULL` |
| Authenticated users can create AI events | INSERT | `auth.uid() IS NOT NULL` |
| ~~UPDATE~~ | ❌ | Not allowed (audit trail) |
| ~~DELETE~~ | ❌ | Not allowed (audit trail) |

**Immutability:**
- Regular users cannot modify or delete AI events
- Ensures audit trail integrity
- Service role can bypass RLS for admin cleanup

---

## Testing RLS

### Test 1: Verify RLS is Enabled

```sql
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected Result:**
All 5 tables should show `rls_enabled: true`

### Test 2: Check Policy Count

```sql
SELECT
  tablename,
  COUNT(*) as policy_count,
  STRING_AGG(cmd, ', ' ORDER BY cmd) as commands
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename;
```

**Expected Result:**
- `ai_events`: 2 policies (INSERT, SELECT)
- Other tables: 4 policies each (DELETE, INSERT, SELECT, UPDATE)

### Test 3: Verify Authentication Check

```sql
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND qual NOT LIKE '%auth.uid()%';
```

**Expected Result:**
Empty (all policies use `auth.uid()` checks)

---

## TypeScript Integration

TypeScript types are auto-generated and available at `lib/database.types.ts`:

```typescript
import type { Database } from '@/lib/database.types'

// Usage with Supabase client
const supabase = createClient<Database>(url, key)

// Type-safe queries
const { data: clients } = await supabase
  .from('clients')
  .select('*')

// Insert with type checking
const { data: newClient } = await supabase
  .from('clients')
  .insert({
    first_name: 'John',
    last_name: 'Doe',
    birth_date: '1990-01-01'
  })
```

---

## Security Best Practices

### ✅ Current Implementation

1. **Secure by Default:** RLS enabled on all tables
2. **Authentication Required:** All policies check `auth.uid() IS NOT NULL`
3. **Separation of Concerns:** Separate policies for each operation (SELECT, INSERT, UPDATE, DELETE)
4. **Audit Trail:** AI events are append-only
5. **Foreign Key Constraints:** Automatic cleanup with CASCADE/SET NULL
6. **Type Safety:** Generated TypeScript types prevent runtime errors

### 🔄 Production Enhancements

When moving to production with multiple organizations:

1. **Add Organization Column:**
   ```sql
   ALTER TABLE clients ADD COLUMN org_id UUID REFERENCES organizations(id);
   ```

2. **Update Policies with Org Filtering:**
   ```sql
   CREATE POLICY "Users can view own org data"
     ON clients FOR SELECT
     USING (
       auth.uid() IS NOT NULL AND
       org_id = (SELECT org_id FROM users WHERE id = auth.uid())
     );
   ```

3. **Add Role-Based Access:**
   ```sql
   CREATE POLICY "Admins can view all"
     ON clients FOR SELECT
     USING (
       auth.uid() IS NOT NULL AND
       EXISTS (
         SELECT 1 FROM users
         WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
       )
     );
   ```

4. **Implement Row-Level Ownership:**
   ```sql
   CREATE POLICY "Users can update own records"
     ON intake_notes FOR UPDATE
     USING (author = auth.uid());
   ```

---

## Troubleshooting

### Issue: "new row violates row-level security policy"

**Cause:** Trying to insert/update data that doesn't satisfy RLS WITH CHECK
**Solution:** Ensure user is authenticated and data meets policy requirements

### Issue: No data returned despite existing rows

**Cause:** User not authenticated or RLS USING clause filters out all rows
**Solution:** Verify `auth.uid()` returns a valid UUID

### Issue: Service role queries still restricted

**Cause:** Using anon key instead of service role key
**Solution:** Use `SUPABASE_SERVICE_ROLE_KEY` for admin operations

```typescript
// Service role bypasses RLS
const supabase = createClient(url, serviceRoleKey)
```

---

## Migration History

| Migration | Date | Changes |
|-----------|------|---------|
| `20241115000002_create_epd_core_tables.sql` | 2024-11-15 | Initial RLS policies (demo-level) |
| `20241115000003_enhance_rls_policies.sql` | 2024-11-15 | Granular policies per operation + ai_events immutability |

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- Technical Design: `docs/specs/to-mini-ecd-v1_2.md` § 2.4
- Build Plan: `docs/specs/bouwplan-ai-speedrun-marketing-first-v1.1.md` Epic 2

---

**Status:** ✅ Implemented and Tested
**Next Steps:** E2.S3 - Demo auth flow
