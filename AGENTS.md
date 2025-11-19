# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js app router pages, routes, and layout shell; start edits in `app/page.tsx`.
- `components/`: Shared UI building blocks (React + Tailwind variants) used across routes.
- `lib/`: Utilities and integrations (e.g., Supabase client/types in `lib/supabase/`).
- `content/`, `docs/`: Markdown/docs assets; update here before hardcoding copies in `app/`.
- `public/`: Static assets served at `/`; keep optimized exports here.
- `scripts/`: Maintenance helpers (e.g., `scripts/test-contrast.ts`).
- `supabase/`: Database config and migrations (`supabase/migrations/*.sql`).

## Build, Test, and Development Commands
- `pnpm dev` (or `npm run dev`): Start local server at `http://localhost:3000` with hot reload.
- `pnpm build`: Production bundle; fails on type errors for app and server components.
- `pnpm start`: Run the built app locally.
- `pnpm lint`: Run ESLint with Next.js rules over `app/`, `components/`, `lib/`.
- `pnpm types:generate`: Regenerate Supabase TS types into `lib/supabase/types.ts` (requires project access).

## Coding Style & Naming Conventions
- Language: TypeScript + React Server/Client Components; follow Next.js app router patterns.
- Formatting: 2-space indentation; prefer single quotes where lint allows; keep imports sorted logically.
- Styling: Tailwind-first; compose variants via `class-variance-authority` and `tailwind-merge`.
- Naming: PascalCase for components, camelCase for helpers, `useX` for hooks, `types.ts` for shared types.
- Keep client components marked with `"use client"` when needed; avoid client code in server contexts.

## Testing Guidelines
- No dedicated automated test harness yet; rely on `pnpm lint` and manual flows in the browser.
- For data paths, validate Supabase connections with `lib/supabase/test-connection.ts` or local SQL migrations.
- Add route- or component-level checks (e.g., contrast checks via `scripts/test-contrast.ts`) before shipping UI tweaks.

## Commit & Pull Request Guidelines
- Git history mixes short feature phrases and imperative summaries; keep new commits concise and action-led (e.g., `feat: add login hero` or `fix: align tab spacing`).
- Prefer scoped, single-purpose commits; include why when the change is non-obvious.
- PRs: describe user-facing impact, screenshots for UI changes, reproduction steps for bugs, and link issues/tasks when available.
- Note any Supabase schema changes and the migration file touched; mention if `types:generate` was rerun.

## Security & Configuration Tips
- Environment: keep secrets in `.env.local`; never commit them. Required keys follow Next.js/Supabase conventions (`NEXT_PUBLIC_` for client-safe values).
- When testing auth/DB flows, ensure Supabase policies (`supabase/migrations/*_policies.sql`) are applied and reviewed.
