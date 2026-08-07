# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Docs map

- [docs/TEST-PLAN.md](docs/TEST-PLAN.md) — strategy, risk register, CI/CD gating, entry/exit criteria.
- [docs/TEST-FRAMEWORK.md](docs/TEST-FRAMEWORK.md) — folder structure, conventions, tagging, and the append-only Decision log (§10) explaining non-obvious engineering calls.
- [docs/TEST-CASES.md](docs/TEST-CASES.md) — every TC-XXX case, the defect log, exploratory session logs.
- [docs/SAUCEDEMO-OVERVIEW.md](docs/SAUCEDEMO-OVERVIEW.md) — application-under-test behavior notes and future work.

Check these before re-deriving something they already answer — e.g. don't recompute _why_ `test:ci` and `test:main-gate` run different scopes; that's in `TEST-FRAMEWORK.md` §10.

## CI workflows (.github/workflows/)

Five separate workflow files, each owning a distinct trigger with no overlap between them. Before changing CI behavior, check which file actually owns the trigger you're touching — a fix in one is not a fix in another, and two of these look similar enough to accidentally duplicate.

| File                                   | Trigger                                             | Runs                                                                                   | Report destination             |
| -------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------ |
| `playwright.yml` ("Playwright Tests")  | push to `main`                                      | `test:ci` — chromium only, `@regression`+`@e2e`+`@a11y`                                | GitHub Pages `report/`         |
| `on_main_pr.yml` ("Main Gate")         | PR to `main`                                        | `test:main-gate` — all 3 browsers, all tags except `@problematic` (includes `@visual`) | GitHub Pages `changes-report/` |
| `on_branch_push.yml` ("Sanity Checks") | push, any branch                                    | lint + typecheck + `test:smoke`                                                        | artifact only, no Pages deploy |
| `pr-summary.yml` ("PR Agent")          | PR opened/reopened/ready_for_review, issue comments | third-party PR Agent bot (auto-describes PRs) — not a test runner                      | n/a                            |
| `playwright-snapshots.yml`             | manual (`workflow_dispatch`) only                   | regenerates `@visual` snapshots, commits them back to the branch                       | n/a                            |

## Repo facts

- Default and only branch is `main` — there is no `master` branch, despite some legacy references to it in older configs.
