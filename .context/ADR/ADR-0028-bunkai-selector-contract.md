# ADR-0028 — Bunkai UI tests locate elements by the app's existing `data-testid` convention

- **Status:** Accepted
- **Date:** 2026-11-13
- **Deciders:** QA lead (confirmed at the project-discovery Phase 2 checkpoint)
- **Tags:** selector-contract, ui, project-under-test
- **Supersedes:** —
- **Superseded by:** —

---

## Context

Discovered by `/project-discovery` Phase 2 on 2026-11-12, not decided in that session. The target repo `../upex-bunkai-tms` already carries 1283 `data-testid` attributes in 162 files under `components/` and `app/`, 249 of them dynamic (`data-testid={…}`), in kebab-case with a feature prefix (`test-`, `chat-`, `atc-`, `home-`, `billing-`, `runner-`, `bug-`, `run-`). The UI has no i18n bundle, so visible text is hard-coded English and can change with copy edits.

## Decision

We will locate Bunkai UI elements with `getByTestId` on the app's existing `data-testid` values first, then accessible roles and labels, and visible text only as a last resort. When an element a test needs has no test id, the gap is raised with the app team rather than worked around with CSS or XPath selectors.

## Consequences

- **Positive:** selectors survive copy and layout changes; the convention already exists, so no app change is needed to start.
- **Negative / trade-offs:** the suite depends on developers keeping test ids stable; a renamed id breaks tests silently until they run.
- **Neutral / follow-ups:** a missing test id becomes a small request to the app team; dynamic ids need their generation rule documented when a test relies on one.

## Alternatives considered

- **Role and text selectors first** — more user-centric, but brittle here because copy is hard-coded and not localized.
- **CSS / XPath selectors** — couple tests to markup structure; rejected.

## References

- Target repo: `components/`, `app/` (`data-testid` occurrences)
- `infra-context` map, section `architecture`
