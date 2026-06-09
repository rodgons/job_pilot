# Memory — Phase 1 Complete + Database Schema

Last updated: 2026-06-09 15:38 PDT

## What was built

**Session work:**
- Fixed progress tracker (was incorrectly showing phantom features 05-17 already completed; now accurate: Phase 1 items 01-04 done)
- Architected Feature 04: Database Schema using architect skill
- Created `database/schema.sql` — 192 lines of PostgreSQL DDL with:
  - `profiles` table (25 columns) — user profile data, primary key references `auth.users(id)`
  - `agent_runs` table (7 columns) — job search run history
  - `jobs` table (28 columns) — discovered jobs with scoring and company research
  - `agent_logs` table (6 columns) — agent operation logs
  - RLS policies on all tables (3 per table: SELECT/UPDATE/DELETE filtering by `auth.uid()`)
  - Indexes on user_id and foreign keys for performance
  - DROP TABLE IF EXISTS safety for re-runs
- Created `resumes` storage bucket via `npx @insforge/cli storage create-bucket resumes --private`
- Executed schema import via `npx @insforge/cli db import database/schema.sql` — 4 tables, 12 RLS policies created
- Verified all tables and policies exist in InsForge backend
- Committed both schema.sql and progress tracker updates to git

## Decisions made

- Database schema as single `database/schema.sql` file (not separate migration files) — simpler atomic execution
- RLS policies in schema.sql immediately after each table (not separate file) — ensures tables never exist unprotected
- RLS logic: SELECT/UPDATE/DELETE filter by `(auth.uid() = user_id)` or `(auth.uid() = id)` for profiles; INSERT unrestricted (app enforces correct user_id server-side)
- Used `npx @insforge/cli db import` for schema execution (not `db query`, which is for ad-hoc queries)
- Used `--private` flag for storage bucket (not `--authenticated`, which doesn't exist in CLI)
- Progress tracker now shows only completed work; tracker.md is single source of truth for build status
- InsForge CLI logged in and project linked (project ID: 5976155d-ca52-443f-b192-244a8bab23c2)

## Problems solved

- Found correct InsForge CLI command for schema execution (`db import`, not bare `sql`)
- Found correct storage bucket flag for authenticated access (`--private`, not `--authenticated`)
- Corrected progress tracker false completion state — restored accuracy of Phase 1 completion

## Current state

- Phase 1 complete (items 01-04):
  - [x] 01 Homepage
  - [x] 02 Auth
  - [x] 03 PostHog Initialization
  - [x] 04 Database Schema
- All 4 tables in InsForge backend, verified via `npx @insforge/cli db tables`
- All 12 RLS policies active, verified via `npx @insforge/cli db policies`
- Resumes bucket private and ready for uploads
- `pnpm run build` passes (from previous session)
- `pnpm lint` passes (from previous session)
- Git history clean with feature commits
- `.env.local` active in IDE (contains NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY from backend setup)

## Next session starts with

Phase 2 — Profile Page.

Feature 05: Build complete profile page UI (`src/app/profile/page.tsx`) with mock data (no save logic yet).

From build-plan.md:
- Profile needs attention banner at top with completion percentage ring, missing field tags (PHONE, LOCATION, EDUCATION)
- Resume section with drag/drop upload area, Generate Resume button, Select Resume button
- Profile Information form with sections: Personal Info, Professional Info, Work Experience (up to 3 roles), Education, Job Preferences
- All fields from profiles table schema visible (25 columns)
- Save Profile button at bottom (wired but no-op for this feature)
- Use shadcn/ui components where possible for consistency with previous features

Use architect skill to surface decisions before coding.

## Open questions

- None currently. All Phase 1 infrastructure in place.
