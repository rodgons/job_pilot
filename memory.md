# Memory — Feature 07 Resume Extraction

Last updated: 2026-06-30

## What was built

- Completed Feature 07: AI Profile Extraction from Resume.
- Added dependencies in `package.json` / `pnpm-lock.yaml`: `@google/genai` and `pdf-parse@1.1.1`.
- Added `extractProfile()` server action in `src/actions/profile.ts`.
- Added server-side PDF parsing from the authenticated user's private InsForge Storage resume.
- Added Gemini profile extraction with structured JSON output and validation.
- Added `Extract Profile` UI flow in `src/components/profile/ProfilePageClient.tsx`.
- Added extracted-profile types in `src/types/profile.ts`.
- Added `src/types/pdf-parse.d.ts` for the safe `pdf-parse/lib/pdf-parse.js` import.
- Updated `context/progress-tracker.md` so Feature 07 is complete and Feature 08 is next.

## Decisions made

- Extraction fills the profile form only; it does not save automatically. User must review and click Save Profile.
- The authenticated email remains authoritative and is not overwritten by resume extraction.
- `pdf-parse@1.1.1` is intentionally used instead of v2 because v2 has bundling/runtime issues under Next/Turbopack server actions.
- Import `pdf-parse/lib/pdf-parse.js`, not the package root, to avoid the v1 package index debug behavior.
- Gemini extraction uses `gemini-2.5-flash`, JSON response mode, and schema validation.
- Gemini thinking is disabled for this deterministic extraction call with `thinkingConfig: { thinkingBudget: 0 }`.

## Problems solved

- Raw `JSON.parse` errors were leaking to the page. Fixed by sanitizing extraction errors before returning to the client.
- Gemini returned truncated JSON during extraction. Diagnosed from logs showing a 249-character response ending at `"skills":["`. Fixed by increasing `maxOutputTokens` to `4096`, reducing resume input text length, and disabling Gemini thinking.
- Extraction validation was too strict for partial/null model output. Fixed by normalizing missing strings, nullable fields, arrays, and `yearsExperience` before validation.
- Added diagnostic logging for PDF parse failures, short extracted text, Gemini request failures, and Gemini response parse failures. Client also logs extraction errors in browser console.

## Current state

- Feature 07 is implemented and verified.
- `pnpm run lint` passes.
- `pnpm run build` passes.
- There are uncommitted changes for Feature 07 and related fixes.
- Playwright is not configured in this repo, so browser automation was not used.
- Current stage: Phase 2 complete through Feature 07.

## Next session starts with

Start Feature 08: Resume PDF Generation from Profile.

Implement `POST /api/resume/generate` to read the current profile, use Gemini to generate polished resume content, render a PDF with `@react-pdf/renderer`, upload it to InsForge Storage at `resumes/{user_id}/resume.pdf`, and update the profile resume URL/key.

## Open questions

- Confirm whether to keep the temporary extraction diagnostic console logs long-term or remove/reduce them after extraction is stable.
