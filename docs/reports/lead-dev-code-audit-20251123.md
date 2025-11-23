# Lead Developer Code Audit — 2025-11-23

## Scope & Context
- **Repository:** Mini EPD Prototype (branch `intake`)
- **Audit Focus:** Architectural integrity (SoC, DRY, layering) plus readiness for sustained build/deploy
- **Source Material:** `app/`, `components/`, `lib/`, API routes, and the recent migration artifacts

## Strengths Observed
1. **Clear migration boundary:** Active patient/intake flows now live entirely under `/app/epd/patients`, while legacy `/clients` code is quarantined in `/app/epd/_archive`.
2. **API-first intake module:** `app/api/intakes/*` and the companion server actions (`app/epd/patients/[id]/intakes/actions.ts`) enforce a clean separation between UI and data operations.
3. **Consistent validation:** All new API routes use Zod schemas with user-friendly Dutch error text.
4. **Documentation quality:** `docs/migratie-clients-naar-patients.md` and `docs/api/intakes-api.md` give any new engineer a full runbook of schema, run-order, and testing expectations.

## Findings (Ordered by Priority)

### 1. Archive still participates in builds (P0 — fixed, monitor)
- Even though the `/app/epd/_archive` tree is no longer part of the product, TypeScript and ESLint were still compiling it (see errors referencing `app/epd/_archive/…/layout.tsx`). We have now excluded the folder via `tsconfig.json` + `.eslintignore`, but any new archive directory must also be listed there.
- **Follow-up:** add a short note to `docs/migratie-clients-naar-patients.md` so future migrations remember to update `tsconfig` when archiving modules.

### 2. Repeated HTTP plumbing in server actions (P1)
- `getBaseUrl`, `getCookieHeader`, and the JSON/HTML error parsing logic are duplicated across all functions in `app/epd/patients/[id]/intakes/actions.ts` (~150 LOC). Similar patterns will surface once screening actions are added.
- **Recommendation:** extract a shared helper (e.g. `lib/server/api-client.ts`) that encapsulates base URL resolution, cookie forwarding, and error translation. That keeps the actions thin and reduces future bugs when auth/headers change.

### 3. API and server actions couple to environment shape (P1)
- Several modules assume `NEXT_PUBLIC_APP_URL` is set and fall back to `http://localhost:3000`. On Vercel this works, maar voor self-hosted environments is het fragiel. Missende envs geven pas tijdens runtime een generieke “Failed to fetch intake”.
- **Recommendation:** enforce mandatory env vars at boot (throw if undefined) and consider using `headers().get('x-forwarded-host')` via a centralized helper. Document required envs in `.env.example`.

### 4. UI components mixing layout and business concerns (P2)
- Example: `components/ui/hero-section-2.tsx` manages animation, icon markup, CTA links, and address display in één component (~200 LOC). Maintaining SOC would be easier if we split icon rendering (`InfoIcon`), CTA button groups, and background art into composable subcomponents.
- **Recommendation:** move static SVG/icon logic into a small data-driven config or re-use the existing icon library to keep the hero component declarative.

### 5. Background media bypasses Next Image optimizations (P2)
- `HeroSection`’s right-hand visual uses `backgroundImage` CSS. That bypasses Next’s image pipeline and caching, and cannot generate responsive sizes. For consistent performance we should either switch to `<Image>` with `fill` + CSS clip-path, or explicitly justify the unoptimized usage with documentation.

### 6. Testing gap post-migratie (P2)
- According to the migration plan (Fase 5) no functionele/API/regressie tests are checked off yet. With the new API layer this is risky: a breaking change in `app/api/intakes` would go unnoticed until manual QA.
- **Recommendation:** add at least smoke tests (Playwright or Vitest) covering GET/POST `/api/intakes` and the patient intake UI flow. Capture the results in `docs/reports/tests-<date>.md`.

### 7. Service-role Supabase usage (Info)
- `supabaseAdmin` (lib/supabase/server.ts) correctly keeps the service key server-side, maar sommige API routes (e.g. screening documents delete) have no rate-limiting or auditing. Not urgent, but log future admin actions and consider narrowing privileges via Postgres roles if this goes to production.

## Recommended Next Steps
1. **Formalize archive exclusion** in developer docs + CI (tsconfig/eslint done today).
2. **Introduce shared API fetch helper** to keep server actions DRY and prepare for more endpoints.
3. **Document mandatory env vars** and fail fast when missing.
4. **Modularize HeroSection** and adopt `<Image>` for all hero media to stay aligned with Next performance guidance.
5. **Schedule Fase 5 testing** with logged outcomes; treat it as exit criteria for the branch merge.

## Appendix
- Build output after fixes: `pnpm lint` and `pnpm build` pass locally (see CLI logs 2025-11-23, 16:40 CET).
- Report authored by Lead Dev. Stored at `docs/reports/lead-dev-code-audit-20251123.md`.
