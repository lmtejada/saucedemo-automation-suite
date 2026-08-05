# SauceDemo Automation Suite

Playwright + TypeScript test automation scaffold for [SauceDemo](https://www.saucedemo.com), Sauce Labs' sample e-commerce storefront used for QA practice and demos.

**Stack:** Playwright · TypeScript · ESLint + Prettier · Husky + lint-staged · GitHub Actions

📊 **[Live test report →](https://lmtejada.github.io/saucedemo-automation-suite/report/)**

---

## At a glance

|                   |                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Coverage**      | 59 tests across 11 spec files: smoke, regression, e2e, security, performance, accessibility, visual                                              |
| **Defect log**    | 11 documented defects, incl. root-cause investigations in the [exploratory testing sessions](docs/TEST-CASES.md#exploratory-testing-session-log) |
| **Cross-browser** | Chromium, Firefox, WebKit                                                                                                                        |
| **CI/CD**         | Push: lint + typecheck + smoke.<br>Push to `main`: full regression + e2e + a11y gate.<br>PR to `main`: full suite across all 3 browsers.         |
| **Design**        | Page Object Model, custom fixtures, storage-state auth/cart seeding, path-aliased architecture                                                   |
| **Quality gates** | ESLint rules enforcing web-first assertions, no hard waits, no `test.only`, semantic locators                                                    |
| **Docs**          | [Test Plan](docs/TEST-PLAN.md) · [Test Cases](docs/TEST-CASES.md) · [Test Framework](docs/TEST-FRAMEWORK.md)                                     |

---

## Getting Started

### Prerequisites

- Node.js `v22.22.3` (see `.nvmrc`; run `nvm use`)

### Setup

```bash
npm install
npx playwright install --with-deps
cp .env.example .env.dev   # fill in APP_URL, API_URL, and user/admin credentials
```

Environment files are selected by the `ENVIRONMENT` variable (defaults to `dev`, loading `.env.dev`):

```bash
ENVIRONMENT=staging npx playwright test
```

---

## Folder Structure

```
saucedemo-automation-suite/
├── .github/workflows/    # CI: installs deps/browsers, runs the suite, uploads HTML report
├── .husky/               # Runs lint-staged before each commit
├── src/
│   ├── pages/                # Page Object Model
│   ├── fixtures/             # Playwright fixture composition
│   ├── enums/ types/ utils/  # Shared constants, interfaces, helpers
│   └── test-data/            # Static fixtures + data factories
├── tests/
│   ├── functional/           # Feature-level specs
│   ├── e2e/                  # Full multi-page journey specs
│   └── *.setup.ts            # Playwright setup projects (auth, cart seeding)
├── eslint.config.mts     # Flat ESLint config
├── playwright.config.ts  # Playwright projects, reporters, storage state setup
├── tsconfig.json         # TypeScript compiler options + path aliases
└── package.json          # Scripts and dependencies
```

See [docs/TEST-FRAMEWORK.md](docs/TEST-FRAMEWORK.md) for the full structure, path-alias reference, and naming conventions.

---

## Available Scripts

| Command                                                  | Targeted Suite / Tag                                     | Operational Purpose                                                                            |
| :------------------------------------------------------- | :------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| `npm test`                                               | `Full Suite` excluding `@visual` and `@problematic` tags | Runs the complete suite across all three core browser engines in parallel.                     |
| `npm run test:chromium` / `test:firefox` / `test:webkit` | `Single Browser`                                         | Targets a specific engine during local debugging; excludes isolated profile tests.             |
| `npm run test:smoke`                                     | `@smoke`                                                 | Fast validation runner checking baseline happy-path core workflows.                            |
| `npm run test:regression`                                | `@regression`                                            | Deep-dive gate runner validating functional paths, security hooks, and asset mappings.         |
| `npm run test:e2e`                                       | `@e2e`                                                   | Automated cross-page workflows                                                                 |
| `npm run test:a11y`                                      | `@a11y`                                                  | Executes dedicated automated WCAG accessibility audits using Axe-core.                         |
| `npm run test:visual`                                    | `@visual`                                                | Triggers pixel-perfect snapshot layout comparisons across all 3 browser engines.               |
| `npm run test:problematic`                               | `@problematic`                                           | Runs edge-case behavior suites on a single worker to isolate dynamic application flaws safely. |
| `npm run test:debug`                                     | N / A                                                    | Run in Playwright's debug/inspector mode                                                       |
| `npm run test:ui`                                        | N / A                                                    | Run with Playwright's UI mode                                                                  |
| `npm run test:headed`                                    | N / A                                                    | Run headed (excludes `@problematic` tests)                                                     |
| `npm run test:ci`                                        | `@regression` + `@e2e` + `@a11y`                         | Executes deep functional validation for gating release testing readiness                       |
| `npm run report`                                         | N / A                                                    | Open the last HTML report                                                                      |
| `npm run codegen -- <url>`                               | N / A                                                    | Record actions, generate locators                                                              |
| `npm run lint` / `lint:fix`                              | N / A                                                    | Lint (and auto-fix) the codebase                                                               |
| `npm run format`                                         | N / A                                                    | Format the codebase with Prettier                                                              |

Tag-based scripts rely on `@tag` annotations in test titles (e.g. `test('... @smoke', ...)`), which will be added as specs are written.

---

## Visual Regression Testing

Visual snapshots live in `tests/__snapshots__/` (one folder per spec file) and are checked into git as the approved baseline.

- Run visual tests locally: `npm run test:visual`
- Update baselines locally: `npm run test:visual:update`

**Snapshots must be generated on the same OS CI runs on (Ubuntu).** A baseline captured locally on macOS/Windows will fail in CI due to font-rendering differences, even when the layout hasn't actually changed. To update the committed baselines correctly:

1. Push your branch.
2. Trigger the **"Update Playwright Visual Snapshots"** workflow manually from the Actions tab (`workflow_dispatch`), targeting your branch.
3. It regenerates snapshots inside GitHub's Ubuntu runner and commits them straight back to your branch (commit message: `chore(visual): update visual regression snapshots [skip ci]`).
4. Pull the updated snapshots locally before continuing.

Never hand-commit snapshots generated on a local macOS/Windows machine — they will not match the Ubuntu baseline CI compares against.

---

## Accessibility Testing

Accessibility checks run via the `@a11y` tag: `npm run test:a11y`.

Today, only a placeholder framework check carries this tag — real WCAG 2.1 AA scans (via `@axe-core/playwright`) are planned but not yet implemented (see TC-021 in [docs/TEST-CASES.md](docs/TEST-CASES.md)). Once real a11y specs are added, tag them `@a11y` and they'll be picked up by this same script with no further wiring needed.

---

## Code Quality

- **ESLint** (`eslint.config.mts`) enforces TypeScript strictness and a set of Playwright best practices — no hard waits (`no-wait-for-timeout`), web-first assertions, no `test.only`/skipped tests, semantic locators over raw/nth-based ones, no `console` usage, and more.
- **Prettier** enforces consistent formatting (tabs, single quotes, 80-char width).
- **Husky + lint-staged** run ESLint and Prettier on staged files before each commit.

See [docs/TEST-FRAMEWORK.md](docs/TEST-FRAMEWORK.md) for the full lint-rule rationale and the path-alias system.

## CI/CD

Five GitHub Actions workflows:

- **`on_branch_push.yml`** — runs on every push, to any branch: lints (`npm run lint`), typechecks (`npm run typecheck`), and runs `npm run test:smoke` (`@smoke`, chromium only). Fast sanity check so breakages surface immediately, before a PR even exists.
- **`playwright.yml`** — runs on every push to `main`/`master` (not on PRs — that's `test:main-gate`'s job, see below). Runs `npm run test:ci` (`@regression` + `@e2e` + `@a11y`, chromium only), uploads the HTML report as a workflow artifact (30-day retention) and deploys the report to GitHub Pages, published at **https://lmtejada.github.io/saucedemo-automation-suite/report/**.
- **`on_main_pr.yml`** — runs on PRs targeting `main`. Runs `npm run test:main-gate` (the full suite excluding `@problematic`, across chromium/firefox/webkit). This is the exhaustive cross-browser check that catches breaking changes — including browser-specific ones — before they reach `main`. Its report is also deployed to GitHub Pages, published at **https://lmtejada.github.io/saucedemo-automation-suite/changes-report/**.
- **`playwright-snapshots.yml`** — manual (`workflow_dispatch`) trigger that regenerates visual snapshots inside the Ubuntu runner and commits them back to the triggering branch. See [Visual Regression Testing](#visual-regression-testing) above.
- **`pr-summary.yml`** — runs [PR-Agent](https://github.com/qodo-ai/pr-agent) (via Gemini) on PR open/reopen/ready-for-review to auto-generate the PR description. Auto-review and auto-improve are disabled by default, but either can be triggered on demand by commenting `/review` or `/improve` on the PR. Requires a `GEMINI_API_KEY` repo secret.
