# SauceDemo Automation Suite

Playwright + TypeScript test automation scaffold for [SauceDemo](https://www.saucedemo.com), Sauce Labs' sample e-commerce storefront used for QA practice and demos.

**Stack:** Playwright · TypeScript · ESLint + Prettier · Husky + lint-staged · GitHub Actions

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
├── .github/
│   └── workflows/
│       └── playwright.yml      # CI: installs deps/browsers, runs the suite, uploads HTML report
├── .husky/
│   └── pre-commit               # Runs lint-staged before each commit
├── src/
│   ├── enums/
│   │   └── app.ts                # Shared enums (e.g. StorageStatePaths for auth state files)
│   └── test-data/
│       └── static/
│           └── users.json        # Static test data (user personas, credentials, etc.)
├── tests/
│   └── example.spec.ts           # Placeholder Playwright starter test
├── .env.example                  # Template for required environment variables
├── .env                          # Local env file (git-ignored; copy from .env.example)
├── eslint.config.mts             # Flat ESLint config (TypeScript + Playwright + Prettier rules)
├── playwright.config.ts          # Playwright projects, reporters, timeouts, storage state setup
├── tsconfig.json                 # TypeScript compiler options
└── package.json                  # Scripts and dependencies
```

---

## Available Scripts

| Command                                                  | Description                                                  |
| -------------------------------------------------------- | ------------------------------------------------------------ |
| `npm test`                                               | Run the full suite across all configured projects            |
| `npm run test:chromium` / `test:firefox` / `test:webkit` | Run against a single browser (excludes `@destructive` tests) |
| `npm run test:ci`                                        | Single-worker Chromium run, as used in CI                    |
| `npm run test:smoke` / `test:sanity` / `test:regression` | Run tests tagged `@smoke`, `@sanity`, or `@regression`       |
| `npm run test:api` / `test:e2e`                          | Run tests tagged `@api` or `@e2e`                            |
| `npm run test:destructive`                               | Run tests tagged `@destructive` (single worker)              |
| `npm run test:debug`                                     | Run in Playwright's debug/inspector mode                     |
| `npm run test:ui`                                        | Run with Playwright's UI mode                                |
| `npm run test:headed`                                    | Run headed (excludes `@destructive` tests)                   |
| `npm run report`                                         | Open the last HTML report                                    |
| `npm run lint` / `lint:fix`                              | Lint (and auto-fix) the codebase                             |
| `npm run format`                                         | Format the codebase with Prettier                            |

Tag-based scripts rely on `@tag` annotations in test titles (e.g. `test('... @smoke', ...)`), which will be added as specs are written.

---

## Code Quality

- **ESLint** (`eslint.config.mts`) enforces TypeScript strictness and a set of Playwright best practices — no hard waits (`no-wait-for-timeout`), web-first assertions, no `test.only`/skipped tests, semantic locators over raw/nth-based ones, no `console` usage, and more.
- **Prettier** enforces consistent formatting (tabs, single quotes, 80-char width).
- **Husky + lint-staged** run ESLint and Prettier on staged files before each commit.

## CI/CD

`.github/workflows/playwright.yml` runs on every push/PR to `main`/`master`: installs dependencies and browsers, runs `npx playwright test`, and uploads the HTML report as a workflow artifact (30-day retention).
