# ADR-0027 — Bunkai tests authenticate with a pre-provisioned account through headless sign-in or a PAT

- **Status:** Accepted
- **Date:** 2026-11-13
- **Deciders:** QA lead (confirmed at the project-discovery Phase 2 checkpoint)
- **Tags:** auth-in-tests, fixtures, project-under-test
- **Supersedes:** —
- **Superseded by:** —

---

## Context

Discovered by `/project-discovery` Phase 2 on 2026-11-12, not decided in that session. Evidence in the target repo `../upex-bunkai-tms`:

- Sign-up requires a 6-digit emailed OTP (`app/api/v1/auth/signup`, `app/api/v1/auth/confirm`); magic link needs a mailbox; OAuth needs real GitHub or Google accounts (`lib/auth/oauth.ts`). There is no captcha.
- `POST /api/v1/auth/signin` takes email and password and returns a session plus a freshly minted Personal Access Token, with no email step for a confirmed account.
- `/api/v1` accepts `Authorization: Bearer bk_pat_…` and treats a PAT exactly like a cookie session (ADR-0001 of the target; `lib/api/rls-parity.test.ts`). Browser pages use Supabase `sb-<ref>-auth-token` cookies written by `@supabase/ssr`.
- `workspace:admin` PATs cannot be minted headlessly (`lib/api/capabilities.ts`).
- The `check-email` endpoint is rate limited (10 per 60 s, `lib/auth/rate-limit.ts`), so a suite that logs in through the UI per test will trip it.

## Decision

We will authenticate Bunkai tests with pre-provisioned, already-confirmed accounts whose credentials come from `.env` by name. API tests call `POST /api/v1/auth/signin` once per role in setup and reuse the returned PAT; UI tests log in once per role in a setup project and reuse the stored browser state. No test creates an account through sign-up, magic link or OAuth, except a dedicated test of those flows.

## Consequences

- **Positive:** no mailbox or OAuth dependency; login runs once per role, not once per test, so the auth rate limit is not hit; API and UI tests share the same accounts.
- **Negative / trade-offs:** the accounts (one per workspace role) must exist on every environment before the suite runs, and admin-scope API calls need a cookie session, not a headless PAT.
- **Neutral / follow-ups:** sign-up, OTP and OAuth flows need their own strategy (mailbox API or manual coverage); `/test-framework-adaptation` wires this into the KATA setup projects.

## Alternatives considered

- **Create a fresh user per test through sign-up** — needs mailbox access for the OTP and is slow.
- **UI login in every test** — slow and trips the `check-email` rate limit.
- **Service-role key in tests** — bypasses RLS, so authorization would never be tested.

## References

- Target repo: `app/api/v1/auth/*`, `lib/api/middleware/bearer.ts`, `lib/api/capabilities.ts`, `lib/auth/rate-limit.ts`
- `infra-context` map, section `architecture` (`bun run context:map infra-context --section architecture`)
