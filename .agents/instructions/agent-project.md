---
id: project
title: 'Project-specific instructions'
load_when: 'anything specific to this project: its own conventions, guardrails, environments or vocabulary not covered by another section'
triggers: []
paths: []
---

# Project-specific instructions

> Project-owned overlay. The boilerplate delivers this file once and never overwrites it; every other file in this folder is synced from upstream. Write this project's own rules here, one heading per topic, instead of editing `AGENTS.md` or a synced section. Knowledge about the system under test belongs in a project context skill (`<aspect>-context`), not here.

Add `triggers:` regex sources to the frontmatter above when a rule here should be routed by keyword (the hook reads them), and keep every `NEVER` / `MUST` line reachable: cite `Rule #N`, binding: `/<skill>`, or enforced: `bun run <script>` (checked by `bun run instructions:check`).

## Project context skills

One row per skill this project authored: the `<aspect>-context` skills `project-context` mode `context-skill` creates, and any other skill the project added. The skill router in `agent-skills-and-mcps.md` is synced, so `bun sync` overwrites a row written there; this file is never overwritten. Add each skill's trigger phrases to `triggers:` above as regex sources too, so the hook routes this file when a prompt names them. `bun run instructions:check` fails a row whose `.agents/skills/<slug>/SKILL.md` does not exist.

| Skill | Trigger | Purpose |
|---|---|---|

## Project Assessment (Phase 1)

Assessment Date: 2026-11-11

Target: `../upex-bunkai-tms` (Next.js 15 App Router + Supabase, single repo).

### Testing Maturity: 2/4
- Current state: Moderate (strong unit and DB-integration tests, no E2E layer, no CI run)
- Test files: 415 (`*.test.ts(x)` colocated under `app/`, `lib/`, `components/`, plus `middleware.test.ts`; some `*.db.test.ts` hit the database)
- Frameworks: `bun test` (happy-dom registrator for components); no Playwright or other E2E in the target
- Coverage: unknown (no coverage tooling or report found)

### Documentation State: Complete
- README: yes (`README.md`)
- API docs: yes (`.context/SRS/api-contracts.yaml`, `api/openapi.json`, `/api/docs`)
- Architecture: yes (`.context/SRS/architecture-specs.md`, `.context/ADR/`)
- Setup guide: yes (`.context/business/project-dev-guide.md`, `docs/setup/`)

### Code Quality
- [x] ESLint: configured (`eslint.config.js`, antfu config)
- [x] Prettier: configured (`.prettierrc`)
- [x] TypeScript: strict (`tsconfig.json`)
- [x] Pre-commit hooks: configured (`.husky/pre-commit`, `.husky/pre-push`, lint-staged)

### CI/CD Maturity: None
- No `.github/workflows` in the target repo; deploys go through Vercel (`vercel.json`). Quality gates exist only as local husky hooks.

### Identified Risks

| Risk | Severity | Evidence (path only) | Mitigation |
|------|----------|----------------------|------------|
| No CI pipeline in the repo: tests, types and lint run only on developer machines | HIGH | `.husky/pre-push` (no `.github/workflows/`) | Confirm where CI runs; if nowhere, QA regression suite becomes the only automated gate |
| No end-to-end automation of the user journeys (login, ATC authoring, run execution, billing) | MEDIUM | `app/(app)/` (no E2E specs in target) | Build KATA E2E/API suite in this repo (Phase 4 of onboarding) |
| Business rules live in SQL RPC functions and RLS policies, 122 migrations, hard to cover from the UI alone | MEDIUM | `supabase/migrations/` | Add API and DB-level checks through `dbhub` once it connects |
| Contract drift between hand-written and generated OpenAPI | MEDIUM | `.context/SRS/api-contracts.yaml`, `api/openapi.json` | Pick the authoritative source; keep `openapi:check` as the gate |
| Secret-pattern grep hits (token/secret/password assigned to a literal): all in test fixtures or design-token pages, none in runtime source; values not inspected | LOW | `app/api/v1/projects/[id]/tracker-settings/route.test.ts`, `app/api/v1/workspaces/[id]/jira-connection/check/route.test.ts`, `lib/supabase/realtime-auth.test.ts`, `components/providers/auth-context.test.ts`, `app/design-tokens/page.tsx` | Human to confirm they are fakes; no `.env` file is tracked (only `.env.example` and `*.schema`) |
| Dependency audit not run in discovery | LOW | `package.json` | Run `bun audit` before Phase 2 |

No HIGH hardcoded-secret risk was found.

### Phase Prioritization

- Phase 1: Normal -- docs are rich but partly legacy boilerplate prose; code was treated as the source of truth
- Phase 2: Extended -- logic sits in SQL RPCs, RLS and 112 route handlers
- Phase 3: Extended -- no CI in the target repo; infra map must record the Vercel and Supabase setup
- Phase 4: Normal -- PRD, SRS and API contract already exist in the target

### Blockers
- [ ] `dbhub` and `openapi` MCP servers did not connect; live schema and spec unverified (action: fix env, restart the session)
- [ ] `.agents/project.yaml` api_url, tms_cli, issue_tracker and board fields still null
