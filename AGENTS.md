# Repository Guidelines

## Project Structure & Module Organization
Next.js App Router pages and layouts live in `app/`; start UI work in `app/page.tsx`. Reusable presentation pieces sit in `components/`, while `lib/` holds utilities plus Supabase clients under `lib/supabase/`. Content-first assets live in `content/` and `docs/`; prefer editing Markdown there before copying into React components. Static files (images, fonts, icons) belong in `public/`. Database migrations are versioned under `supabase/migrations/*.sql`, and helper scripts reside in `scripts/`.

## Build, Test, and Development Commands
- `pnpm dev`: launch the local dev server at `http://localhost:3000` with hot reload.
- `pnpm build`: produce a production bundle; fails on type or server-component errors.
- `pnpm start`: run the already built app locally for smoke checks.
- `pnpm lint`: execute ESLint with the Next.js preset across `app/`, `components/`, and `lib/`.
- `pnpm types:generate`: refresh Supabase typings into `lib/supabase/types.ts` once schema changes land.

## Coding Style & Naming Conventions
Use TypeScript with 2-space indentation and prefer single quotes where lint allows. Rely on Tailwind classes for styling and compose variants via `class-variance-authority` plus `tailwind-merge`. Keep server components default; add `"use client"` only when interactivity requires it. Components are PascalCase, helpers camelCase, hooks prefixed with `use`, and shared type files named `types.ts`. Keep imports grouped logically and remove unused exports before committing.

## Testing Guidelines
There is no full suite yet, so lean on `pnpm lint` plus manual QA in the browser. Validate Supabase connectivity using `lib/supabase/test-connection.ts` whenever credentials or policies change. For UI contrast checks or theming tweaks, run `scripts/test-contrast.ts`. Document manual steps taken when validating PRs, especially for auth or data flows.

## Commit & Pull Request Guidelines
Commit subjects are short, action-led (e.g., `feat: add login hero`, `fix: align tab spacing`). Keep each commit scoped to a single concern and mention why when behavior is non-obvious. PRs should describe the user-facing impact, include reproduction steps for bug fixes, and attach screenshots for UI changes. Note any Supabase migration touched and whether `pnpm types:generate` was executed.

## Security & Configuration Tips
Store secrets only in `.env.local`, following Next.js conventions (`NEXT_PUBLIC_` for safe client variables). When altering Supabase tables or policies, apply updates via `supabase/migrations/` and review Row Level Security before pushing. Delete hard-coded credentials from code and logs before submitting changes.
