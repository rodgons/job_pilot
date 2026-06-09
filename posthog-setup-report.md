<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into JobPilot. PostHog is initialized client-side via `instrumentation-client.ts` (the recommended Next.js 15.3+ pattern) with a reverse proxy through `/relay/*` to reduce ad-blocker interference. A server-side PostHog client (`src/lib/posthog-server.ts`) captures auth events directly from API routes. Client-side tracking uses lightweight `"use client"` wrapper components to avoid converting server components. Users are identified on the dashboard page via `UserIdentifier`, and PostHog's anonymous state is reset on sign-out via `SignOutButton`.

| Event | Description | File |
|---|---|---|
| `get_started_clicked` | User clicks "Get Started" or "Start for free" on the landing page | `src/app/page.tsx` (via `GetStartedLink`) |
| `find_first_match_clicked` | User clicks "Find Your First Match" on the landing page | `src/app/page.tsx` (via `FindFirstMatchLink`) |
| `oauth_sign_in_clicked` | User clicks an OAuth provider button (Google or GitHub) on the login page | `src/app/login/page.tsx` (via `OAuthProviderButton`) |
| `sign_in_completed` | OAuth sign-in flow completed successfully — user authenticated | `src/app/callback/route.ts` |
| `sign_in_failed` | OAuth sign-in flow failed at the callback stage | `src/app/callback/route.ts` |
| `signed_out` | Authenticated user signs out | `src/app/api/auth/logout/route.ts` |
| `set_up_profile_clicked` | Authenticated user clicks "Set up profile" on the Find Jobs page | `src/app/find-jobs/page.tsx` (via `SetUpProfileLink`) |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/432465/dashboard/1690765)
- [Sign-in Funnel (wizard)](https://us.posthog.com/project/432465/insights/dhr3Fvx6) — Conversion rate from OAuth click to successful sign-in
- [Daily Sign-ins (wizard)](https://us.posthog.com/project/432465/insights/TOEnYBTY) — Successful sign-in volume over time
- [Sign-in Failures (wizard)](https://us.posthog.com/project/432465/insights/JyhVR6Ay) — Failed sign-in attempts; spikes may indicate auth issues
- [Landing Page Engagement (wizard)](https://us.posthog.com/project/432465/insights/TKrxPJxm) — CTA click volume (Get Started + Find First Match)
- [Sign-outs (wizard)](https://us.posthog.com/project/432465/insights/ze0rnG9a) — Daily sign-out count; rising trend relative to sign-ins can signal churn

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
