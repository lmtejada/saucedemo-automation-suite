# Test Plan — Swag Labs E-commerce Demo

**Version:** 1.4
**Status:** In Review
**Author:** Laura Tejada
**Last updated:** 03.08.2026
**Reviewed by:** Claude

---

## Content index

- [1. Introduction](#1-introduction)
    - [1.1 Purpose](#11-purpose)
    - [1.2 Scope](#12-scope)
- [2. Test objectives](#2-test-objectives)
- [3. Risk assessment](#3-risk-assessment)
- [4. Test approach](#4-test-approach)
    - [4.1 Test levels](#41-test-levels)
    - [4.2 Test types](#42-test-types)
    - [4.3 Test design techniques](#43-test-design-techniques)
- [5. Test environment](#5-test-environment)
- [6. Test data strategy](#6-test-data-strategy)
- [7. Automation strategy](#7-automation-strategy)
    - [7.1 What is automated](#71-what-is-automated)
    - [7.2 Automation stack](#72-automation-stack)
    - [7.3 What is tested manually](#73-what-is-tested-manually)
- [8. CI/CD integration](#8-cicd-integration)
    - [8.1 Workflow execution matrix](#81-workflow-execution-matrix)
    - [8.2 Failure handling & reporting architecture](#82-failure-handling--reporting-architecture)
    - [8.3 Execution script matrix](#83-execution-script-matrix)
- [9. Roles & responsibilities](#9-roles--responsibilities)
- [10. Schedule](#10-schedule)
- [11. Entry and exit criteria](#11-entry-and-exit-criteria)
    - [Entry criteria](#entry-criteria)
    - [Exit criteria](#exit-criteria)
- [12. Defect management](#12-defect-management)
    - [12.1 Severity definitions](#121-severity-definitions)
    - [12.2 Tracking workflow & template](#122-tracking-workflow--template)
- [13. Risks & assumptions](#13-risks--assumptions)
    - [13.1 Assumptions](#131-assumptions)
    - [13.2 Real-World Automation Risks](#132-real-world-automation-risks)
- [14. Sign-off](#14-sign-off)
- [15. Version history](#15-version-history)

---

## 1. Introduction

### 1.1 Purpose

This document defines the quality approach for the project SauceDemo: the standard, industry-recognized e-commerce storefront sandbox developed by Sauce Labs. It mimics a contemporary single-page React application with shifting states, inventory tracking, sorting capabilities, and validation parameters. This plan describes what will be tested, how it will be tested, and what risks have been identified and accepted.

### 1.2 Scope

**In scope:**

- Authentication module
- Inventory / Products module
- Shopping Cart module
- Checkout & Order confirmation Workflows
- Application Navigation & Lifecycle

---

## 2. Test objectives

- [ ] All critical user journeys pass without defects
- [ ] No open High or Critical severity bugs
- [ ] Smoke suite passes in CI on every push
- [ ] Regression suite passes before release

---

## 3. Risk assessment

| Risk                                                                                                                                                                                                                                                                                                                                                       | Likelihood                                                                 | Impact                                                                                                            | Priority    | Mitigation                                                                                                                                                                                                                                                                                                  |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **E2E checkout funnel fails silently** <br>_(Users cannot complete a purchase due to button click failures or state drops)_                                                                                                                                                                                                                                | Medium                                                                     | High                                                                                                              | 🔴 Critical | Automate the full happy-path E2E checkout; implement explicit waits on checkout page transitions.                                                                                                                                                                                                           |
| **Flaky or broken third-party static assets** <br>_(Product images or styling elements fail to load, showing broken links or incorrect graphics)_                                                                                                                                                                                                          | High                                                                       | Medium                                                                                                            | 🟡 Medium   | Implement automated asset verification tests checking that image `src` paths resolve properly and don't default to broken templates.                                                                                                                                                                        |
| **State loss during workflow navigation** <br>_(Cart items disappear when navigating via the browser back button or using 'Continue Shopping')_                                                                                                                                                                                                            | Medium                                                                     | Medium                                                                                                            | 🟡 Medium   | Design specific state-preservation assertions across all multi-page transition paths (Inventory → Cart → Checkout).                                                                                                                                                                                         |
| **Session cookie has a short, fixed TTL not backed by a documented spec** <br>_(The `session-username` cookie expires ~10 minutes after login — confirmed via captured storage state — and does not renew on activity; a user idling past that point is silently returned to `/index.html`)_                                                               | Medium                                                                     | Medium                                                                                                            | 🟡 Medium   | TC-017 asserts no _false_ early logout during a normal-speed workflow; the exact ~10-minute boundary is documented as an observed characteristic (see note below) rather than asserted as a hard requirement, since it's an unannounced third-party implementation detail that could change without notice. |
| **Login route lacks an authenticated-session guard** <br>_(Revisiting the login page while already authenticated silently allows a new login to overwrite the active session, with no confirmation)_                                                                                                                                                       | Low                                                                        | Low<br>_(no backend or real accounts — see note below)_                                                           | 🟡 Medium   | Automated via TC-034 (`tests/functional/auth/login.spec.ts`); currently `test.skip`'d pending a fix — tracked as BUG-009. See note below.                                                                                                                                                                   |
| **Item detail page navigation resolves to the wrong product** <br>_(Clicking a product's name or image can land the user on a completely different product's detail page — confirmed reproducible for `problem_user` across all 6 products, including one product whose own id renders "Item Not Found")_                                                  | Low<br>_(profile-specific — not observed for `standard_user`, see TC-035)_ | High<br>_(core detail-page navigation is unusable for the affected profile; one product is entirely unreachable)_ | 🟠 High     | Automated via TC-037 (`tests/functional/inventory/inventory-details.spec.ts`); currently `test.skip`'d pending a fix — tracked as BUG-010.                                                                                                                                                                  |
| **"Add to cart" silently fails for specific products** <br>_(For `problem_user`, half of the catalog — `Sauce Labs Bolt T-Shirt`, `Sauce Labs Fleece Jacket`, `Test.allTheThings() T-Shirt (Red)` — never actually adds to the cart, identically on both the inventory list and item detail pages; a user could believe an item was added when it wasn't)_ | Low<br>_(profile-specific)_                                                | Medium                                                                                                            | 🟡 Medium   | Automated via TC-038 (`tests/functional/inventory/inventory-details.spec.ts`); currently `test.skip`'d pending a fix — tracked as BUG-011. Likely shares a root cause with BUG-007; see the TC-038 note and Session 3's Additional Note (2026-08-03) in `docs/TEST-CASES.md`.                               |
| **Flaky locator elements due to dynamic text** <br>_(Test suite breaks frequently because selectors rely on mutable UI text labels)_                                                                                                                                                                                                                       | High                                                                       | Low                                                                                                               | 🟢 Low      | Enforce a strict selector hierarchy within the Page Object Model, prioritizing standard test attributes (`data-test`) over text strings.                                                                                                                                                                    |
| **Missing required input validation** <br>_(Checkout forms allow missing first name, last name, or postal code parameters)_                                                                                                                                                                                                                                | Medium                                                                     | Low                                                                                                               | 🟢 Low      | Implement data-driven negative test cases validating that every required form field triggers an explicit error state.                                                                                                                                                                                       |

**Note — cross-tab/cross-user session behavior: what's a risk here and what isn't.**

This area is easy to misdiagnose from manual testing alone (open two tabs, log in as different users, cart state looks "shared" — that alone doesn't tell you which of several things is actually happening). SauceDemo authenticates via a plain `session-username` cookie and keeps cart contents in `localStorage["cart-contents"]`, both scoped to the origin (`www.saucedemo.com`) and the browser profile, not to a tab or window. Given that:

- **Cross-user cart/session isolation was considered as a candidate risk and deliberately excluded, not just left uncovered.** SauceDemo has no backend and no per-account data model at all — `standard_user` / `problem_user` / etc. are login credentials that toggle which UI quirks render, not real tenant boundaries. There was never a product intention that switching identity should isolate or reset cart data, so a test asserting "cart should be empty after logging in as someone else" would be checking a requirement the app never had. This is why Impact is rated Low above, and why there's no dedicated isolation test case in this suite (an earlier draft of one, TC-020, was removed for exactly this reason).
- **A new tab or window of the same profile inheriting the current session automatically is expected, standard browser behavior** — cookies and `localStorage` are shared browser-wide per origin by design, for every site, not something SauceDemo does differently. It is not a risk and needs no mitigation.
- Separate browser contexts (distinct profiles, incognito windows) do get their own isolated cookie jar and `localStorage`, but that isolation is a guarantee of the browser/automation tool itself, not something SauceDemo implements — asserting it would be testing Playwright, not the product.
- The one genuine, narrow gap actually found here: the login route never checks for an existing valid `session-username` cookie before rendering the login form, so revisiting `/` while already authenticated silently lets a new login overwrite the existing session cookie with no confirmation. Tracked as BUG-009 / TC-034 (the risk row above).
- `sessionStorage`, by contrast, _is_ tab-isolated — SauceDemo doesn't use it for either auth or cart, which is part of why neither is isolated per tab today.

**Note — session cookie TTL: what's confirmed and what isn't.**

The `session-username` cookie's `expires` value was measured directly from captured Playwright storage state (`.auth/app/*.json`): consistently ~599.7 seconds (≈10 minutes) after login, across all three captured user profiles, and fixed from login time rather than sliding with activity. That part is a confirmed, reproducible fact about the app as it exists today — it also explains real-world reports of being logged out after stepping away from the app for a while.

What isn't confirmed is intent: whether this is a deliberate product decision (an inactivity/security timeout) or an incidental default from whatever cookie-setting mechanism SauceDemo's frontend uses. A fixed, non-renewing TTL is an unusual shape for a deliberate security timeout — those normally slide with activity — which points toward an implementation default rather than a spec. SauceDemo is a Sauce Labs-maintained public training sandbox with no published auth documentation, so intent can't be confirmed, and the number could change in a future deploy without notice.

Given that, TC-017 intentionally does not assert against the exact ~10-minute value — doing so would repeat the mistake already corrected once in this plan for TC-020 (§15, v1.1): pinning a test to an observed implementation artifact as though it were a guaranteed requirement. Instead, TC-017 asserts the thing that _is_ a reasonable requirement regardless of the underlying TTL: a normal-speed checkout workflow should never trigger a false early logout. See Session 2's Additional Note (`docs/TEST-CASES.md`, 2026-08-03) for the raw finding.

---

## 4. Test approach

### 4.1 Test levels

| Level            | Approach                                                                                                                                                                         | Owner           |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------- |
| **Unit**         | Isolated component validation. _Note: As SauceDemo is a third-party mock application, internal framework unit testing is out of scope._                                          | Dev Team (N/A)  |
| **Integration**  | Automated verification of data persistence across page transitions within a session, via Playwright's local/session storage hooks.                                               | QA (Automation) |
| **System (E2E)** | Automated cross-page workflows (Login → Inventory → Cart → Checkout Completion) utilizing the Page Object Model (POM) in Playwright + TypeScript.                                | QA (Automation) |
| **Exploratory**  | Unscripted, time-boxed charter sessions focusing on identifying asset anomalies, visual regression footprints, and edge-case behavior variations across different user profiles. | QA (Manual)     |

### 4.2 Test types

| Type               | In scope?  | Notes                                                                                                                                                                             |
| :----------------- | :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Functional         | ✅ Yes     | Validates that core e-commerce capabilities work as designed for standard user profiles.                                                                                          |
| Regression         | ✅ Yes     | Triggered via local execution during development; planned for automated CI execution during a proper @regression tag.                                                             |
| API                | ❌ No      | SauceDemo operates entirely client-side with mock static data; no backend API layer exists to test.                                                                               |
| Performance / Load | ⬜ Partial | Baseline SLA gating to track explicit performance degradation workflows (specifically targeting the `performance_glitch_user`).                                                   |
| Security           | ⬜ Partial | Validation of the authenticated-session guard on the login route (TC-034) and basic route-bypass prevention (preventing unauthenticated navigation to `/inventory.html`, TC-003). |
| Accessibility      | ✅ Yes     | Automated WCAG 2.0/2.1 AA compliance scans using @axe-core/playwright on core pages.                                                                                              |
| Visual regression  | ✅ Yes     | Automated visual snapshot testing using Playwright's native `toHaveScreenshot` matcher on core static views.                                                                      |

### 4.3 Test design techniques

- **Equivalence partitioning** — Applied to authentication input profiles (dividing credentials into valid standard profiles, locked-out profiles, and completely invalid data sets).
- **State transition** — Applied to the core shopping cart life cycle, tracking element transformations as items transition through state boundaries (e.g., Button: _Add to Cart_ → _Remove_; Cart Badge: _0_ → _1_).
- **User journey testing** — Applied to mapping standard end-to-end purchasing flows to ensure transactional integrity across the multi-step checkout funnel.
- **Error guessing** — Utilized during exploratory sessions to actively discover hidden application behaviors, asset discrepancies, and premature session termination bugs.

---

## 5. Test environment

| Property             | Value                                                                                                                                                           |
| :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Environment**      | Production Mock Demo                                                                                                                                            |
| **Base URL**         | https://www.saucedemo.com/                                                                                                                                      |
| **Browser(s)**       | Chromium (primary desktop/emulation), Firefox, WebKit                                                                                                           |
| **OS**               | Ubuntu Linux (GitHub Actions CI), macOS / Windows (Local development)                                                                                           |
| **Test data source** | **Static Files:** Strict predefined SauceLabs credentials & product inventories.<br>**Faker.js:** Dynamic runtime generation for checkout form validation data. |
| **Auth credentials** | Decoupled from logic using a local `.env` configuration file; mapped to standard environment variables within CI pipeline steps.                                |
| **Dependencies**     | Node.js runtime, Playwright Test Runner engine, framework-level npm packages (`@axe-core/playwright`, `@faker-js/faker`, `dotenv`).                             |

---

## 6. Test data strategy

- **Creation:** Mapped directly from pre-defined static user profiles (`standard_user`, `locked_out_user`, `problem_user`) managed within a decoupled environment configuration file. Dynamic transaction inputs (checkout names, postal codes) are generated instantly in memory at runtime via `Faker.js`.
- **Isolation:** Achieved completely at the browser level. Every individual Playwright test executes inside its own isolated `BrowserContext`. This simulates a completely fresh incognito window, ensuring cookies, local storage, and session data never leak between parallel test runs.
- **Cleanup:** Automated infrastructure cleanup is completely zero-maintenance because SauceDemo lacks a persistent database backend. Closing the Playwright browser page instantly destroys all operational state, eliminating the need for complex database deletion hooks.
- **Sensitive data:** Strictly zero real PII (Personally Identifiable Information) or real financial data is introduced. All customer checkout inputs, addresses, and dummy billing info are dynamically faked at runtime.
- **Known limitations:** The application relies on static, fixed inventories. We cannot dynamically inject new products or manipulate catalog prices via API hooks to test different product setup scenarios.

---

## 7. Automation strategy

### 7.1 What is automated

| Flow                                                                                          | Automated? | Reason                                                                                                   |
| :-------------------------------------------------------------------------------------------- | :--------- | :------------------------------------------------------------------------------------------------------- |
| **Authentication Loops** <br>_(Valid, invalid, locked out user states)_                       | ✅ Yes     | High frequency, core entry gate, high regression risk for daily tests runs.                              |
| **End-to-End Purchase Funnel** <br>_(Inventory → Cart → Info Form → Overview → Confirmation)_ | ✅ Yes     | The primary revenue-generating user journey; critical business path validation.                          |
| **Product Inventory Sorting** <br>_(A-Z, Z-A, price sequencing checks)_                       | ✅ Yes     | Stable DOM structure, high visual mutation risk across user accounts.                                    |
| **Accessibility Compliance Standards** <br>_(Base page layout audits)_                        | ✅ Yes     | Scalable automated scanning via Axe-core integration catches common DOM compliance bugs effortlessly.    |
| **Pixel-Perfect Visual Layouts** <br>_(Static login / inventory page structure comparisons)_  | ✅ Yes     | Natively supported by Playwright engine; essential for verifying asset states across edge case profiles. |

### 7.2 Automation stack

| Layer                            | Tool                           | Purpose                                                                                      |
| :------------------------------- | :----------------------------- | :------------------------------------------------------------------------------------------- |
| **E2E & System Core**            | Playwright Engine (TypeScript) | Primary automation framework handling test execution, browser lifecycle, and assertions.     |
| **Test Architecture Pattern**    | Page Object Model (POM)        | Design pattern keeping element-locators decoupled from functional assertion flows.           |
| **Accessibility Audit Engine**   | `@axe-core/playwright`         | Programmatic automated WCAG validation integrated into baseline navigation hooks.            |
| **Reporting Framework**          | Playwright HTML Reporter       | Comprehensive post-execution test metrics engine tracking console footprints and trace logs. |
| **CI/CD Orchestration Pipeline** | GitHub Actions                 | Triggers automated testing suites on active repository commits and scheduled test runs.      |

### 7.3 What is tested manually

- Ad-hoc session state variation tracking during exploratory boundary validation sessions.
- Accessibility checks (screen reader, keyboard navigation)
- UI evaluation on unique target physical mobile devices to verify fluid mobile responsiveness behavior.
- Edge-case browser window interrupt workflows (such as forced offline states or rapid manual navigation interrupts).

---

## 8. CI/CD integration

### 8.1 Workflow execution matrix

| Trigger                     | Command / Tag                                               | Scope Included                                       | Pipeline Target Action                                                                                                            |
| :-------------------------- | :---------------------------------------------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| **Every Push (any branch)** | `npm run lint` / `npm run typecheck` / `npm run test:smoke` | Lint + typecheck + `@smoke`                          | Sanity checks — fast feedback loop validating code quality and core happy-path purchase paths before a PR even exists.            |
| **Push to `main`/`master`** | `npm run test:ci`                                           | `@regression` + `@e2e` + `@a11y`                     | Executes deep functional validation, e2e critical user journeys, routing security checks, and automated WCAG accessibility scans. |
| **PR to `main`**            | `npm run test:main-gate`                                    | `Full Suite` (all browsers) excluding `@problematic` | Exhaustive cross-browser run to catch breaking changes — including visual and browser-specific ones — before they reach `main`.   |

### 8.2 Failure handling & reporting architecture

- **Gating Strategy:** Pull Request merging is strictly blocked dynamically via GitHub branch protection rules if any workflow step within the `test:smoke`, `test:ci`, or `test:main-gate` pipeline suites reports a failure status.
- **Artifact Retention:** Playwright trace logs, execution console footprints, videos, and native HTML reports are packaged securely as compressed zip workspace artifacts for every unique pipeline execution.
- **Reporting Access:** The framework triggers an automated pipeline step upon test completion to output a link to the Playwright report overview directly inside the active GitHub Actions console runner.
- **Alert Escalation:** Automated status notifications are pushed immediately via GitHub Actions triggers directly to the repository contributors on step failures, detailing the specific script stack trace breakdown.

### 8.3 Execution script matrix

| Command                                                  | Targeted Tag                     | Operational Purpose                                                                                                |
| :------------------------------------------------------- | :------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| `npm test`                                               | `Full Suite`                     | Runs the complete suite across all three core browser engines in parallel, excluding tags @visual and @problematic |
| `npm run test:chromium` / `test:firefox` / `test:webkit` | `Single Browser`                 | Targets a specific engine during local debugging; excludes isolated profile tests.                                 |
| `npm run test:smoke`                                     | `@smoke`                         | Fast validation runner checking baseline happy-path core workflows.                                                |
| `npm run test:regression`                                | `@regression`                    | Deep-dive gate runner validating functional paths, security hooks, and asset mappings.                             |
| `npm run test:e2e`                                       | `@e2e`                           | Executes critical user journey behaviors                                                                           |
| `npm run test:a11y`                                      | `@a11y`                          | Executes dedicated automated WCAG accessibility audits using Axe-core.                                             |
| `npm run test:visual`                                    | `@visual`                        | Triggers pixel-perfect snapshot layout comparisons using the native Playwright engine.                             |
| `npm run test:problematic`                               | `@problematic`                   | Runs edge-case behavior suites on a single worker to isolate dynamic application flaws safely.                     |
| `npm run test:ci`                                        | `@regression` + `@e2e` + `@a11y` | Executes deep functional validation for gating release testing readiness                                           |

---

## 9. Roles & responsibilities

| Role          | Person | Responsibility                               |
| ------------- | ------ | -------------------------------------------- |
| QA Lead       |        | Test plan, strategy, final sign-off          |
| QA Engineer   |        | Test case writing, automation implementation |
| Developer     |        | Unit test coverage, bug fixes                |
| Product Owner |        | Acceptance criteria, UAT sign-off            |

---

## 10. Schedule

| Milestone                     | Target date     | Status         |
| :---------------------------- | :-------------- | :------------- |
| **Test plan approved**        | Week 1 (Day 3)  | ✅ Complete    |
| **Test cases written**        | Week 1 (Day 5)  | ✅ Complete    |
| **Automation suite complete** | Week 3 (Day 15) | 🔄 In Progress |
| **Regression run passed**     | Week 4 (Day 18) | ⬜ Planned     |
| **UAT sign-off**              | Week 4 (Day 20) | ⬜ Planned     |
| **Release approved**          | Week 4 (Day 22) | ⬜ Planned     |

---

## 11. Entry and exit criteria

### Entry criteria

- [x] Test plan strategy and scope definitions are complete
- [x] Application target URL (`https://www.saucedemo.com/`) is stable and publicly accessible
- [x] Base Page Object Model (POM) architecture and Playwright dependencies are initialized in the repository
- [x] Static user credentials and dynamic `Faker.js` utility scripts are configured and working

### Exit criteria

- [ ] 100% of defined `@smoke`, `@regression`, `@a11y`, and `@visual` test scenarios are executed
- [ ] Zero open Critical or High severity defects remain in the core functional purchasing path
- [ ] Automated `@smoke` and `@regression` suites pass cleanly in the GitHub Actions CI pipeline
- [ ] Playwright HTML test execution report is published and attached to the repository documentation

---

## 12. Defect management

### 12.1 Severity definitions

| Severity        | Definition                                                                                | Application Context (SauceDemo)                                                                   |
| :-------------- | :---------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| 🔴 **Critical** | Core system functionality broken; blocks primary purchase funnel or exposes session data. | Login page throws 500/unhandled exceptions; checkout submit button is completely unclickable.     |
| 🟠 **High**     | Major feature broken or severely degraded with no reasonable workaround.                  | Items added to the cart silently disappear upon navigating to `/cart.html`.                       |
| 🟡 **Medium**   | Feature functional but exhibits unexpected behavior; viable workaround exists.            | `problem_user` broken product image assets; incorrect or missing validation error text banners.   |
| 🟢 **Low**      | Minor cosmetic, styling, or minor non-blocking usability issues.                          | Text alignment issues on lower-viewport resolutions; minor padding/margin shifts on footer links. |

### 12.2 Tracking workflow & template

- **Tracking Platform:** All application defects discovered during exploratory testing or automated pipeline execution are logged and tracked via **GitHub Issues**.
- **Defect Lifecycle:** Issues transition through standard states: `Open` → `In Progress` → `Under Review` → `Verified / Closed`.
- **Bug Report Template:** Standardized issue creation is enforced using a repository-level GitHub Issue Form template (`.github/ISSUE_TEMPLATE/bug_report.yml`).

---

## 13. Risks & assumptions

### 13.1 Assumptions

- **Public Site Stability:** SauceDemo (`https://www.saucedemo.com/`) will remain publicly accessible without requiring IP whitelisting or corporate VPN access.
- **Static DOM Identifiers:** Core interactions rely on SauceLabs maintaining standard `data-test` attributes (e.g., `data-test="username"`, `data-test="login-button"`).
- **Client-Side Statelessness:** Navigating to or refreshing the base URL resets the application state completely, removing the need to manage persistent database cleanup scripts.

### 13.2 Real-World Automation Risks

| Risk                                                                                                                                                             | Impact | Likelihood | Mitigation Strategy                                                                                                                                                                                                                                               |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :--------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **False positive failures on `performance_glitch_user`** <br>_(Hardcoded delays on this profile cause Playwright default action timeouts to expire)_             | High   | High       | Override default navigation timeouts specifically for the performance suite, using explicit `waitForURL` conditions instead of global test timeouts.                                                                                                              |
| **Flaky Visual Snapshots between OS environments** <br>_(Screenshots taken on macOS locally fail when run on Linux CI due to subtle font rendering differences)_ | Medium | High       | Run `npx playwright test --update-snapshots` inside a Docker container locally, or generate baseline images strictly within the Ubuntu GitHub Actions runner.                                                                                                     |
| **Race conditions when running `problem_user` tests in parallel** <br>_(Shared browser contexts or parallel workers interfering with state assertions)_          | Medium | Medium     | Tag problem profile tests with `@problematic` and run them on a single worker (`workers: 1`) to ensure strict execution isolation.                                                                                                                                |
| **Test suite fragility from brittle text or DOM locators** <br>_(Tests breaking due to minor copy updates, case changes, or DOM structural shifts)_              | High   | Medium     | Enforce Playwright's official locator hierarchy in Page Objects: prioritize semantic Accessible Role selectors (`getByRole`, `getByLabel`, `getByPlaceholder()`, `getByText()`), reserving `getByTestId` (`data-test`) for ambiguous containers or dynamic lists. |

---

## 14. Sign-off

| Role             | Name | Date | Signature |
| ---------------- | ---- | ---- | --------- |
| QA Lead          |      |      |           |
| Product Owner    |      |      |           |
| Engineering Lead |      |      |           |

---

## 15. Version history

| Version | Date       | Author       | Summary                                                                                                                                                                                                                |
| :------ | :--------- | :----------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-07-20 | Laura Tejada | Initial test plan.                                                                                                                                                                                                     |
| 1.1     | 2026-07-31 | Laura Tejada | Reworked the cross-session/cart isolation risk in §3 after investigation showed the original assumption didn't hold. See below.                                                                                        |
| 1.2     | 2026-08-03 | Laura Tejada | Replaced the speculative "session tokens expire prematurely" risk in §3 with a confirmed ~10-minute cookie TTL finding; rescoped TC-017 to avoid asserting against that undocumented implementation detail. See below. |
| 1.3     | 2026-08-03 | Laura Tejada | Added two risk rows to §3 covering item detail page defects found for `problem_user` (BUG-010, BUG-011); the item detail page had no prior test coverage at all. See below.                                            |
| 1.4     | 2026-08-03 | Laura Tejada | Corrected the BUG-011 risk row in §3 after automating TC-038 showed the original "detail-page-only" framing was based on a single, non-representative sample. See below.                                               |

### 1.1 — Cross-session/cart isolation risk corrected (2026-07-31)

**How it was:** §3 listed _"Data leakage between active sessions"_ (a user can view or alter a completely different user's cart contents) as a 🔴 Critical risk, mitigated by a planned multi-`BrowserContext` test (TC-020): log in as User A, add items, log in as User B in a separate context, assert User B's cart is empty. §4.1, §4.2, and §7.1 all referenced this as validated, in-scope security coverage.

**How it is now:** TC-020 was removed (it had never been automated — only a "Planned" reference existed). The risk row was replaced with a narrower one, _"Login route lacks an authenticated-session guard"_ (🟡 Medium), mitigated by TC-034 / BUG-009. §4.1, §4.2, and §7.1 were corrected to drop the now-inaccurate "multi-user session boundary" / "cart isolation" claims. A note was added directly under the risk table (§3) walking through cookie/`localStorage`/`sessionStorage` sharing behavior and why cross-user cart isolation isn't a valid requirement for this app.

**Why:** manual testing (opening SauceDemo in two tabs, logging in as different users) appeared to show cart and session state bleeding between tabs. Investigation traced this to two separate facts, not one bug: (1) cookies and `localStorage` are shared across every tab/window of the same browser profile — standard, expected browser behavior, not a defect; and (2) SauceDemo has no backend or per-account data model at all, so there was never a real requirement that switching login identity should isolate or reset cart data. TC-020 was, in effect, testing a browser/Playwright storage guarantee rather than application behavior, and its 🔴 Critical label overstated a risk the app was never designed to prevent. The one genuine gap found in this area — the login route never checking for an existing valid session before rendering the login form (BUG-009) — was kept and is now the sole risk entry for this area, correctly scoped as low impact given the app's actual architecture. Full reasoning lives in the §3 note.

### 1.2 — Session cookie TTL risk corrected (2026-08-03)

**How it was:** §3 carried a speculative risk, _"Session tokens expire prematurely"_ (🟡 Medium, Likelihood Low), based on no confirmed evidence — just a generic concern that a logged-in session might drop mid-transaction. Its mitigation was a planned regression test (TC-017) asserting session token persistence across a workflow with real navigation delay, but neither the risk nor the test had ever been checked against the app's actual cookie behavior.

**How it is now:** Inspected the `session-username` cookie's actual `expires` value in captured Playwright storage state and confirmed a fixed ~10-minute TTL from login (not a sliding inactivity timeout), consistent across all three captured user profiles. The §3 risk row was reworded to reflect this confirmed behavior, and a note was added below the risk table explaining what's confirmed (the TTL itself) versus what isn't (whether it's an intentional security decision or an incidental default). TC-017 was rescoped to assert only that a normal-speed workflow never produces a false early logout, without pinning an assertion to the exact undocumented TTL value.

**Why:** the original risk and test were written speculatively, before anyone had checked what SauceDemo's session cookie actually does. Once checked, the finding was real — a hard ~10-minute expiry does exist and does explain reports of being logged out after stepping away — but hard-coding a test assertion around that exact, unannounced number would repeat the same mistake already corrected once in this plan for TC-020 (v1.1): treating an observed implementation detail on a third-party demo sandbox as if it were a documented product requirement. The risk and test are now scoped to the part that's a legitimate, stable requirement (no false early logout during normal use) rather than the part that's just today's implementation detail (the exact TTL number).

### 1.3 — Item detail page navigation risk added (2026-08-03)

**How it was:** §3's risk table had no entry for the item detail page (`/inventory-item.html`) at all — the page had no page object, no test cases, and no automation, despite the Inventory/Products module being explicitly in scope (§1.2). It was an unexamined gap, not a deliberately excluded one.

**How it is now:** An exploratory session (`docs/TEST-CASES.md`, Session 3, 2026-08-03) established `standard_user` baseline behavior for the page and found two `problem_user`-specific defects: navigation from the inventory list lands on the wrong product's detail page for every one of the 6 products (one of which is entirely unreachable, returning "Item Not Found"), and "Add to cart" is a no-op specifically on the detail page while working correctly from the list. Two risk rows were added to §3 covering both. Four new test cases were documented (TC-035–038): two establishing `standard_user` baseline coverage, two tracking the `problem_user` defects (BUG-010, BUG-011) pending automation.

**Why:** the gap surfaced while investigating a user report that the inventory page's "Remove" button doesn't work for `problem_user` — which turned out to already be tracked as BUG-007 — but the investigation also revealed the item detail page itself had never been exercised by the suite at all, not even a baseline check that clicking a product shows that product's own data. Given the Inventory/Products module is explicitly in scope, leaving a core navigation path within it completely untested was a real coverage gap, not a judgment call to exclude it.

### 1.4 — BUG-011 risk row corrected (2026-08-03)

**How it was:** The v1.3 risk row described BUG-011 as "`problem_user`'s 'Add to cart' works correctly from the inventory list but is a no-op from the item detail page." This was based on one product (reached via click-through, itself subject to BUG-010's navigation mismatch) and a one-product control check on the list page.

**How it is now:** Automating TC-038 required exercising every product by id rather than one sample, which surfaced an alternating pattern instead: `Add to cart` is a no-op for `Sauce Labs Bolt T-Shirt`, `Sauce Labs Fleece Jacket`, and `Test.allTheThings() T-Shirt (Red)`, and works for `Sauce Labs Backpack`, `Sauce Labs Bike Light`, and `Sauce Labs Onesie` — identically on both the item detail page and the inventory list. The risk row in §3 was reworded to describe this as a per-product failure affecting both pages, not a detail-page-specific one. TC-038 in `docs/TEST-CASES.md` was rewritten to loop over every product id, and was verified to fail for the correct reason (with `test.skip` temporarily removed) before being finalized.

**Why:** the original risk and BUG-011 entry were written from a single passing/failing sample each, without checking whether that sample generalized — the same category of mistake this plan has now corrected three times (v1.1, v1.2, and this one), each time from testing a claim against the app's actual behavior rather than a first impression. Here, the control check on the list page happened to land on a working product, which made the detail page look uniquely broken when it wasn't. The corrected finding is also more actionable: it points toward a shared root cause with BUG-007 (both look like the same broken per-product click-handler binding responsible for BUG-010) rather than treating the detail page as its own isolated problem.

---
