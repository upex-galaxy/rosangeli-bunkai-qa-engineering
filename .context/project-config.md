# Project Configuration

> Project: rosangeli-bunkai-qa-engineering (QA repo for the Bunkai TMS)
> Generated: 2026-11-11

## Repositories

| Repository | URL | Branch | Purpose |
|------------|-----|--------|---------|
| upex-bunkai-tms (single repo, frontend + API + DB migrations) | https://github.com/upex-galaxy/upex-bunkai-tms | main | Bunkai web application under test. Local path from this QA repo: `../upex-bunkai-tms` (read-only for QA discovery) |
| rosangeli-bunkai-qa-engineering | this repo | main | QA automation + agentic QA context (KATA, Playwright) |

Backend and frontend are one Next.js repo (`app/api/v1/**` route handlers + `app/(app)/**` pages); there is no separate backend repository.

## Tech Stack

### Frontend
- Framework: Next.js 15 (App Router), React 19 (`package.json`)
- Language: TypeScript (`tsconfig.json` has `strict: true`)
- Styling: Tailwind CSS 3.4, Radix UI primitives, shadcn-style `components/ui`, lucide-react, sonner
- State: server components + Supabase Realtime for runs; `@tanstack/react-table`, `@dnd-kit` for tables and drag ordering (no global store library found)

### Backend
- Framework: Next.js Route Handlers under `app/api/v1/*` (112 `route.ts` files); OpenAPI generated with `@asteasolutions/zod-to-openapi` + `zod` (`openapi:gen` script, `api/openapi.json`, `api/openapi-types.ts`)
- Language: TypeScript, runtime Bun for scripts/tests
- ORM: none. Data access is Supabase client (`@supabase/supabase-js`, `@supabase/ssr`) calling SQL RPC functions (`bunkai_*`) and RLS-protected tables

### Database
- Type: PostgreSQL
- Provider: Supabase (migrations in `supabase/migrations/`, 122 files, `0001` to `0123`)
- Access: `dbhub` MCP (declared in the target `dbhub.toml` / `.mcp.json`); connection values come from env names only, never from this file. Not reachable in this session (MCP connection closed), so the schema was read from migrations

### Infrastructure
- Cloud: Vercel (`vercel.json`; staging and production hosts below)
- CI/CD: no `.github/workflows` in the target repo (only local husky hooks). See Discovery Gaps
- Monitoring: not found in code
- Third parties: Stripe (billing, `lib/billing`), Resend (email, `lib/mail`), Jira Cloud import (`lib/jira`), Supabase Realtime

## Environments

| Environment | URL | Purpose | Access |
|-------------|-----|---------|--------|
| Local | http://localhost:3000 | Dev (`next dev`) | Direct |
| Staging | https://staging-upexbunkai.vercel.app | Pre-prod testing (default QA env) | Login required (credentials by env var name, not recorded here) |
| Production | https://upexbunkai.vercel.app (webapp domain from `.agents/project.yaml`) | Live | Read-only for QA; not set in `environments.production` yet |

All three environments share ONE Supabase project (MVP single-project tenancy): QA data written on staging is visible from local and production. See the `environments` section of the infra map.

API base URL (`api_url`): not set in `.agents/project.yaml` for any environment. The API is same-origin: `<web_url>/api/v1` (inferred from `app/api/v1`), with the Scalar docs page at `/api/docs` and the spec at `/api/openapi`.

## API Contract Source

| Item | Location (target repo) |
|------|------------------------|
| Authoritative spec (generated) | `public/openapi.json` (OpenAPI 3.1, 110 paths), written by `bun run openapi:gen` from `app/api/**/route.openapi.ts` (zod-to-openapi) |
| Live spec | `<web_url>/api/openapi` serves `public/openapi.json` (route `app/api/openapi/route.ts`); Scalar UI at `/api/docs` |
| Drift gate | `bun run openapi:check`, `bun run openapi:diff` (target repo) |
| Stale snapshot | `api/openapi.json` (78 paths) and `api/openapi-types.ts`, an older sync; not the source of truth |
| Hand-written design input | `.context/SRS/api-contracts.yaml`, self-labelled "not the live API contract"; drifted |
| QA side sync | `bun run api:sync` (this repo), pointed at the live spec or `public/openapi.json` |

Phase 2 (2026-11-12) confirmed `public/openapi.json` as authoritative from the generator config (`api/.openapi-config.json` → `localPath: public/openapi.json`).

## Tools and Access

- Issue tracker: Jira Cloud, site https://upexgalaxy74.atlassian.net, resolved via `acli`
- Project key: BK
- Database: `dbhub` MCP (target repo), roles `qa_inspector_ro` / `qa_inspector_rw` (migration `0085`); this QA session had no connection
- Docs: markdown under target `.context/` (PRD, SRS, business, ADR)

## Access Checklist

- [x] Repository read access (target repo readable locally)
- [ ] Database access (MCP): `dbhub` failed to connect in this session; schema read from migrations only
- [x] Issue tracker access: `bun run jira:check` green on 2026-11-13 (252 fields, 10 link types); BK-29 readable
- [ ] Staging environment reachable: not probed in Phase 1
- [ ] CI/CD visibility: no workflows in the target repo to observe

## Discovery Gaps

- [ ] `environments.staging.api_url` and others are null in `.agents/project.yaml`; confirm API base is same-origin `/api/v1`.
- [ ] Production `web_url` is not set in `environments.production`; only `webapp_domain` exists.
- [ ] No CI workflow found in the target repo; confirm whether CI lives elsewhere (Vercel checks, another repo).
- [ ] `dbhub`, `openapi` MCP servers failed to connect in this session; live DB state unverified.
- [ ] `backend_repo`, `frontend_repo`, `db_type`, `issue_tracker`, `tms_cli` are still null in `.agents/project.yaml` (single-repo app, PostgreSQL, Jira); to be filled by the human or the adaptation step.
