# Test Plan — Swag Labs E-commerce Demo

**Version:** 1.0
**Status:** In Review
**Author:** Laura Tejada
**Last updated:** 20.07.2026
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

| Risk                                                                                                                                              | Likelihood | Impact | Priority    | Mitigation                                                                                                                               |
| :------------------------------------------------------------------------------------------------------------------------------------------------ | :--------- | :----- | :---------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **E2E checkout funnel fails silently** <br>_(Users cannot complete a purchase due to button click failures or state drops)_                       | Medium     | High   | 🔴 Critical | Automate the full happy-path E2E checkout; implement explicit waits on checkout page transitions.                                        |
| **Data leakage between active sessions** <br>_(A user can view or alter the shopping cart contents of a completely different user)_               | Low        | High   | 🔴 Critical | Automate a multi-context test: log in as User A, add items, log out, log in as User B, and assert the cart is empty.                     |
| **Flaky or broken third-party static assets** <br>_(Product images or styling elements fail to load, showing broken links or incorrect graphics)_ | High       | Medium | 🟡 Medium   | Implement automated asset verification tests checking that image `src` paths resolve properly and don't default to broken templates.     |
| **State loss during workflow navigation** <br>_(Cart items disappear when navigating via the browser back button or using 'Continue Shopping')_   | Medium     | Medium | 🟡 Medium   | Design specific state-preservation assertions across all multi-page transition paths (Inventory → Cart → Checkout).                      |
| **Session tokens expire prematurely** <br>_(Logged-in sessions drop abruptly mid-transaction, forcing users back to the login page)_              | Low        | Medium | 🟡 Medium   | Create a localized regression test to assert cookie/session token persistence across delayed automated steps.                            |
| **Flaky locator elements due to dynamic text** <br>_(Test suite breaks frequently because selectors rely on mutable UI text labels)_              | High       | Low    | 🟢 Low      | Enforce a strict selector hierarchy within the Page Object Model, prioritizing standard test attributes (`data-test`) over text strings. |
| **Missing required input validation** <br>_(Checkout forms allow missing first name, last name, or postal code parameters)_                       | Medium     | Low    | 🟢 Low      | Implement data-driven negative test cases validating that every required form field triggers an explicit error state.                    |

---

## 4. Test approach

### 4.1 Test levels

| Level            | Approach                                                                                                                                                                         | Owner           |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------- |
| **Unit**         | Isolated component validation. _Note: As SauceDemo is a third-party mock application, internal framework unit testing is out of scope._                                          | Dev Team (N/A)  |
| **Integration**  | Automated verification of data persistence between browser contexts and multi-user session boundaries via Playwright's local/session storage hooks.                              | QA (Automation) |
| **System (E2E)** | Automated cross-page workflows (Login → Inventory → Cart → Checkout Completion) utilizing the Page Object Model (POM) in Playwright + TypeScript.                                | QA (Automation) |
| **Exploratory**  | Unscripted, time-boxed charter sessions focusing on identifying asset anomalies, visual regression footprints, and edge-case behavior variations across different user profiles. | QA (Manual)     |

### 4.2 Test types

| Type               | In scope?  | Notes                                                                                                                                             |
| :----------------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| Functional         | ✅ Yes     | Validates that core e-commerce capabilities work as designed for standard user profiles.                                                          |
| Regression         | ✅ Yes     | Triggered via local execution during development; planned for automated CI execution during a proper @regression tag.                             |
| API                | ❌ No      | SauceDemo operates entirely client-side with mock static data; no backend API layer exists to test.                                               |
| Performance / Load | ⬜ Partial | Baseline SLA gating to track explicit performance degradation workflows (specifically targeting the `performance_glitch_user`).                   |
| Security           | ⬜ Partial | Validation of fundamental session state isolation and basic route-bypass prevention (preventing unauthenticated navigation to `/inventory.html`). |
| Accessibility      | ✅ Yes     | Automated WCAG 2.0/2.1 AA compliance scans using @axe-core/playwright on core pages.                                                              |
| Visual regression  | ✅ Yes     | Automated visual snapshot testing using Playwright's native `toHaveScreenshot` matcher on core static views.                                      |

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
| **Dependencies**     | Node.js runtime, Playwright Test Runner engine, framework-level npm packages (`@axe-core/playwright`, `dotenv`).                                                |

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
| **Multi-User Data/State Leakage** <br>_(Validating cart isolation across browser sessions)_   | ✅ Yes     | High-impact security risk; verified using Playwright multi-context orchestration.                        |
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

| Trigger                    | Command / Tag                                                   | Scope Included                            | Pipeline Target Action                                                                                                            |
| :------------------------- | :-------------------------------------------------------------- | :---------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| **Every Push / PR**        | `npm run test:smoke`                                            | `@smoke`                                  | Fast feedback loop validating core authentication and critical happy-path purchase paths.                                         |
| **PR Merge Queue Gate**    | `npm run test:regression`                                       | `@regression` + `e2e` + `@a11y`           | Executes deep functional validation, e2e critical user journeys, routing security checks, and automated WCAG accessibility scans. |
| **Daily Nightly Schedule** | `npm test` / `npm run test:visual` / `npm run test:problematic` | `Full Suite` + `@visual` + `@problematic` | Runs cross-browser regressions, heavy pixel-perfect snapshot comparisons, and single-worker performance/flaw testing.             |

### 8.2 Failure handling & reporting architecture

- **Gating Strategy:** Pull Request merging is strictly blocked dynamically via GitHub branch protection rules if any workflow step within the `test:smoke` or `test:regression` pipeline suites reports a failure status.
- **Artifact Retention:** Playwright trace logs, execution console footprints, videos, and native HTML reports are packaged securely as compressed zip workspace artifacts for every unique pipeline execution.
- **Reporting Access:** The framework triggers an automated pipeline step upon test completion to output a link to the Playwright report overview directly inside the active GitHub Actions console runner.
- **Alert Escalation:** Automated status notifications are pushed immediately via GitHub Actions triggers directly to the repository contributors on step failures, detailing the specific script stack trace breakdown.

### 8.3 Execution script matrix

| Command                                                  | Targeted Tag                              | Operational Purpose                                                                                                |
| :------------------------------------------------------- | :---------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| `npm test`                                               | `Full Suite`                              | Runs the complete suite across all three core browser engines in parallel, excluding tags @visual and @problematic |
| `npm run test:chromium` / `test:firefox` / `test:webkit` | `Single Browser`                          | Targets a specific engine during local debugging; excludes isolated profile tests.                                 |
| `npm run test:smoke`                                     | `@smoke`                                  | Fast validation runner checking baseline happy-path core workflows.                                                |
| `npm run test:regression`                                | `@regression`                             | Deep-dive gate runner validating functional paths, security hooks, and asset mappings.                             |
| `npm run test:e2e`                                       | `@e2e`                                    | Executes critical user journey behaviors                                                                           |
| `npm run test:a11y`                                      | `@a11y`                                   | Executes dedicated automated WCAG accessibility audits using Axe-core.                                             |
| `npm run test:visual`                                    | `@visual`                                 | Triggers pixel-perfect snapshot layout comparisons using the native Playwright engine.                             |
| `npm run test:problematic`                               | `@problematic`                            | Runs edge-case behavior suites on a single worker to isolate dynamic application flaws safely.                     |
| `npm run test:ci`                                        | `@regression` + `@e2e` + `@a11y`          | Executes deep functional validation for gating release testing readiness                                           |
| `npm run test:nightly`                                   | `Full Suite` + `@visual` + `@problematic` | Executes the full suite across browsers, pixel snapshot comparisons, and single-worker edge-case tests             |

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
- [ ] Static user credentials and dynamic `Faker.js` utility scripts are configured and working

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
| **Race conditions when running `problem_user` tests in parallel** <br>_(Shared browser contexts or parallel workers interfering with state assertions)_          | Medium | Medium     | Tag problem profile tests with `@problem-user` and run them on a single worker (`workers: 1`) to ensure strict execution isolation.                                                                                                                               |
| **Test suite fragility from brittle text or DOM locators** <br>_(Tests breaking due to minor copy updates, case changes, or DOM structural shifts)_              | High   | Medium     | Enforce Playwright's official locator hierarchy in Page Objects: prioritize semantic Accessible Role selectors (`getByRole`, `getByLabel`, `getByPlaceholder()`, `getByText()`), reserving `getByTestId` (`data-test`) for ambiguous containers or dynamic lists. |

---

## 14. Sign-off

| Role             | Name | Date | Signature |
| ---------------- | ---- | ---- | --------- |
| QA Lead          |      |      |           |
| Product Owner    |      |      |           |
| Engineering Lead |      |      |           |

---
