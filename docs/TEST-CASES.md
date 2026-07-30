# Test Cases Suite — Sauce Demo

**Type:** Functional | Regression | Exploratory <br>
**Priority:** 🔴 High | 🟡 Medium | 🟢 Low <br>
**Automated:** Yes / No <br>
**Test Status:** ⬜ Not run | ✅ Pass | ❌ Fail | ⏭ Skipped | 🚧 Blocked <br>

## 1. Authentication Module

### TC-001 — Successful login with standard_user

**Feature:** Authentication<br>
**Type:** Functional<br>
**Priority:** 🔴 High<br>
**Automated:** Yes<br>
**Automation reference:** `tests/functional/auth/login.spec.ts` — Scenario: "successful login as standard_user"<br>
**Tags:** `@smoke` `@regression` `@e2e`<br>

**Preconditions:**

- Application base URL is accessible.
- Browser storage and cookies are completely cleared.

**Test steps:**

| Step | Action                                        | Expected result                                                         |
| ---- | --------------------------------------------- | ----------------------------------------------------------------------- |
| 1    | Navigate to `https://www.saucedemo.com/`      | Login page `/index.html` is displayed with username and password fields |
| 2    | Enter `standard_user` into the username input | Field accepts input                                                     |
| 3    | Enter `secret_sauce` into the password input  | Field accepts masked input                                              |
| 4    | Click the "Login" button                      | Form submits and browser navigates to `/inventory.html`                 |
| 5    | Verify inventory container visibility         | Product collection grid and header logo are visible                     |

**Expected result:**
Successful authentication redirects user to inventory page and establishes a valid session.

**Actual result:**

**Test data:**

| Field    | Value           |
| -------- | --------------- |
| Username | `standard_user` |
| Password | `secret_sauce`  |

**Notes:**
Primary happy-path entry point for standard user workflows.

**Status:** ✅ Pass

---

### TC-005 — SLA verification for performance_glitch_user

**Feature:** Authentication / SLA<br>
**Type:** Functional<br>
**Priority:** 🟡 Medium<br>
**Automated:** Yes<br>
**Automation reference:** `tests/functional/auth/login.spec.ts` — Scenario: "login latency check for performance_glitch_user"<br>
**Tags:** `@regression` `@problematic`<br>

**Preconditions:**

- Application base URL is accessible.

**Test steps:**

| Step | Action                                            | Expected result                                       |
| ---- | ------------------------------------------------- | ----------------------------------------------------- |
| 1    | Navigate to `https://www.saucedemo.com/`          | Login page is displayed                               |
| 2    | Enter `performance_glitch_user` in username field | Field accepts input                                   |
| 3    | Enter `secret_sauce` in password field            | Field accepts masked input                            |
| 4    | Start execution timer and click "Login"           | Login request triggers                                |
| 5    | Wait for `/inventory.html` URL and stop timer     | Navigation completes successfully within 10,000ms SLA |

**Expected result:**
Authentication succeeds and redirects to inventory within framework SLA benchmark limits.

**Actual result:**

**Test data:**

| Field    | Value                     |
| -------- | ------------------------- |
| Username | `performance_glitch_user` |
| Password | `secret_sauce`            |

**Notes:**
Used to test dynamic waiting mechanisms and performance log thresholds. Run on a single worker to prevent parallel timeout noise.

**Status:** ✅ Pass

---

### TC-017 — Session token persistence across a delayed multi-step workflow

**Feature:** Authentication / Session Management<br>
**Type:** Regression<br>
**Priority:** 🟡 Medium<br>
**Automated:** Yes<br>
**Automation reference:** Planned — `tests/functional/auth/session-persistence.spec.ts`<br>
**Tags:** `@regression` `@security`<br>

**Preconditions:**

- User is authenticated as `standard_user` and active on `/inventory.html`.

**Test steps:**

| Step | Action                                                                                                                         | Expected result                                                        |
| ---- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| 1    | Capture the session cookie / local storage auth token immediately after login                                                  | Token value recorded                                                   |
| 2    | Navigate through Inventory → Cart → Checkout step one → Checkout step two, allowing natural page-load transitions between each | No forced logout or redirect to `/index.html` occurs at any transition |
| 3    | Re-capture the session cookie / local storage auth token after the final transition                                            | Token value is unchanged and still valid                               |
| 4    | Assert no unauthenticated redirect occurred at any point during the sequence                                                   | User remains on the authenticated flow throughout                      |

**Expected result:**
The session token remains valid and unchanged across a multi-step workflow with real navigation delay between steps; the user is never dropped back to the login page mid-transaction.

**Actual result:**

**Test data:**

| Field    | Value           |
| -------- | --------------- |
| Username | `standard_user` |
| Password | `secret_sauce`  |

**Notes:**
Delay is produced organically via real multi-page navigation rather than an artificial wait, consistent with the project's `playwright/no-wait-for-timeout` lint rule (no hard waits).

**Status:** ⬜ Not run

---

## 2. Inventory / Products Module

### TC-006 — Dynamic product sorting DOM resequencing

**Feature:** Inventory / Products<br>
**Type:** Functional<br>
**Priority:** 🟡 Medium<br>
**Automated:** Yes<br>
**Automation reference:** `tests/functional/inventory/products.spec.ts` — Scenario: "product sorting functionality" (sort by name A-Z/Z-A, price low-high/high-low)<br>
**Tags:** `@regression` `@e2e`<br>

**Preconditions:**

- User is authenticated as `standard_user` on `/inventory.html`.

**Test steps:**

| Step | Action                                       | Expected result                                      |
| ---- | -------------------------------------------- | ---------------------------------------------------- |
| 1    | Observe default product order                | Products are sorted A-Z by default                   |
| 2    | Select "Name (Z to A)" from sorting dropdown | DOM element sequence updates to alphabetical reverse |
| 3    | Select "Price (low to high)" from dropdown   | Items sort numerically by price ascending            |
| 4    | Select "Price (high to low)" from dropdown   | Items sort numerically by price descending           |

**Expected result:**
Selecting sorting dropdown options immediately changes the DOM order of inventory items matching the selected criterion.

**Actual result:**

**Test data:**

| Field           | Value                                                                  |
| --------------- | ---------------------------------------------------------------------- |
| Sorting Options | Name (A to Z), Name (Z to A), Price (low to high), Price (high to low) |

**Notes:**
DOM sequence should be asserted programmatically using item names and numerical price parsing.

**Status:** ✅ Pass

---

### TC-007 — Add item to cart state transition

**Feature:** Inventory / Products<br>
**Type:** Functional<br>
**Priority:** 🔴 High<br>
**Automated:** Yes<br>
**Automation reference:** `tests/functional/inventory/products.spec.ts` — Scenario: "adding a product to the cart updates the cart count and displays the remove button"<br>
**Tags:** `@smoke` `@regression` `@e2e`<br>

**Preconditions:**

- User is authenticated as `standard_user` on `/inventory.html` with an empty cart.

**Test steps:**

| Step | Action                            | Expected result                            |
| ---- | --------------------------------- | ------------------------------------------ |
| 1    | Locate "Sauce Labs Backpack" card | Card displays "Add to cart" button         |
| 2    | Click "Add to cart" button        | Button text toggles to "Remove"            |
| 3    | Observe top navigation cart icon  | Shopping cart badge increments from 0 to 1 |

**Expected result:**
Adding an item updates the button state to "Remove" and increments the cart badge count by 1.

**Actual result:**

**Test data:**

| Field     | Value               |
| --------- | ------------------- |
| Item Name | Sauce Labs Backpack |

**Notes:**
Validates UI state transition before navigating to cart view.

**Status:** ✅ Pass

---

### TC-008 — Remove item directly from inventory view

**Feature:** Inventory / Products<br>
**Type:** Functional<br>
**Priority:** 🟡 Medium<br>
**Automated:** Yes<br>
**Automation reference:** `tests/functional/inventory/products.spec.ts` — Scenario: "removing a product from the cart updates the cart count and displays the add button"<br>
**Tags:** `@regression` `@e2e`<br>

**Preconditions:**

- User is authenticated on `/inventory.html` with at least 1 item added to cart.

**Test steps:**

| Step | Action                                  | Expected result                                  |
| ---- | --------------------------------------- | ------------------------------------------------ |
| 1    | Locate item with active "Remove" button | Item displays "Remove" button                    |
| 2    | Click "Remove" button                   | Button reverts back to "Add to cart"             |
| 3    | Observe shopping cart badge             | Badge count decrements by 1 (or disappears if 0) |

**Expected result:**
Removing an item directly from inventory resets the action button to "Add to cart" and decrements the cart badge count.

**Actual result:**

**Test data:**

| Field     | Value               |
| --------- | ------------------- |
| Item Name | Sauce Labs Backpack |

**Notes:**
`problem_user` profile fails this test due to intentionally broken button handlers.

**Status:** ✅ Pass

---

### TC-018 — Product image asset integrity verification

**Feature:** Inventory / Products<br>
**Type:** Functional<br>
**Priority:** 🟡 Medium<br>
**Automated:** Yes<br>
**Automation reference:** Planned — `tests/functional/inventory/asset-integrity.spec.ts`<br>
**Tags:** `@regression`<br>

**Preconditions:**

- User is authenticated on `/inventory.html`.

**Test steps:**

| Step | Action                                                                  | Expected result                                                               |
| ---- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1    | Query all product image elements on the inventory grid                  | All `<img>` nodes located                                                     |
| 2    | For each image, read `naturalWidth`/`naturalHeight` via `page.evaluate` | Each image resolves to a real, non-broken resource                            |
| 3    | Assert `naturalWidth` is greater than 0 for every image                 | No broken image placeholders present                                          |
| 4    | Repeat the same check while authenticated as `problem_user`             | Known broken asset(s) are explicitly asserted/documented, not silently passed |

**Expected result:**
All product images on the inventory page resolve to valid, non-broken image resources for `standard_user`; the documented broken-image behavior for `problem_user` is explicitly captured as a known difference rather than a silent pass.

**Actual result:**

**Test data:**

| Field | Value                           |
| ----- | ------------------------------- |
| Users | `standard_user`, `problem_user` |

**Notes:**
`problem_user` is documented to intentionally serve a broken image asset — this test asserts the _difference_ between profiles rather than treating any broken image as a blanket failure.

**Status:** ⬜ Not run

---

## 3. Shopping Cart Module

### TC-009 — Data integrity verification between Inventory and Cart

**Feature:** Shopping Cart<br>
**Type:** Functional<br>
**Priority:** 🔴 High<br>
**Automated:** Yes<br>
**Automation reference:** `tests/functional/cart/shopping-cart.spec.ts` — Scenario: "add products from the inventory page and navigate to the cart verifying the exact items were added"<br>
**Tags:** `@smoke` `@regression` `@e2e`<br>

**Preconditions:**

- User is on `/inventory.html`.

**Test steps:**

| Step | Action                                                 | Expected result                                                   |
| ---- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| 1    | Capture Title, Description, and Price of selected item | Details stored in execution memory                                |
| 2    | Click "Add to cart" for selected item                  | Item added to cart state                                          |
| 3    | Click shopping cart badge icon                         | Navigates to `/cart.html`                                         |
| 4    | Assert cart item attributes against captured data      | Title, description, and price match inventory source data exactly |

**Expected result:**
Selected inventory item data matches cart view data with 100% data integrity.

**Actual result:**

**Test data:**

| Field        | Value                                      |
| ------------ | ------------------------------------------ |
| Target Items | Sauce Labs Backpack, Sauce Labs Bike Light |

**Notes:**
Guarantees data model consistency across page boundaries.

**Status:** ✅ Pass

---

### TC-010 — Dynamic item removal within cart page

**Feature:** Shopping Cart<br>
**Type:** Functional<br>
**Priority:** 🟡 Medium<br>
**Automated:** Yes<br>
**Automation reference:** `tests/functional/cart/shopping-cart.spec.ts` — Scenario: "removing an item from within the cart updates the UI list and badge count without needing a page refresh"<br>
**Tags:** `@regression` `@e2e`<br>

**Preconditions:**

- User is on `/cart.html` with 2 items inside cart.

**Test steps:**

| Step | Action                                    | Expected result                                |
| ---- | ----------------------------------------- | ---------------------------------------------- |
| 1    | Click "Remove" button for first cart item | Item row is removed from DOM immediately       |
| 2    | Observe cart list container               | Remaining item is visible without page refresh |
| 3    | Check shopping cart header badge          | Badge count decrements from 2 to 1             |

**Expected result:**
Removing an item inside `/cart.html` immediately removes the DOM node and updates badge count without requiring full page reload.

**Actual result:**

**Test data:**

| Field              | Value |
| ------------------ | ----- |
| Initial Cart Count | 2     |

**Notes:**
Ensures reactive client-side rendering functions correctly.

**Status:** ✅ Pass

---

### TC-011 — Cart state preservation on "Continue Shopping" navigation

**Feature:** Shopping Cart<br>
**Type:** Functional<br>
**Priority:** 🟡 Medium<br>
**Automated:** Yes<br>
**Automation reference:** `tests/functional/cart/shopping-cart.spec.ts` — Scenario: "the Continue Shopping button successfully returns the user to the inventory page with their current cart state preserved"<br>
**Tags:** `@regression` `@e2e`<br>

**Preconditions:**

- User is on `/cart.html` with items added to cart.

**Test steps:**

| Step | Action                                 | Expected result                                              |
| ---- | -------------------------------------- | ------------------------------------------------------------ |
| 1    | Observe cart item list and badge count | Cart active state verified                                   |
| 2    | Click "Continue Shopping" button       | Browser redirects back to `/inventory.html`                  |
| 3    | Observe cart badge and button states   | Cart badge count and "Remove" button states remain preserved |

**Expected result:**
Returning to inventory via "Continue Shopping" preserves active cart state completely.

**Actual result:**

**Test data:**

| Field         | Value               |
| ------------- | ------------------- |
| Retained Item | Sauce Labs Backpack |

**Notes:**
Validates browser history/session storage persistence during navigation.

**Status:** ✅ Pass

---

### TC-019 — Cart state preservation via browser back-button navigation

**Feature:** Shopping Cart<br>
**Type:** Functional<br>
**Priority:** 🟡 Medium<br>
**Automated:** Yes<br>
**Automation reference:** Planned — `tests/functional/cart/shopping-cart.spec.ts` — Scenario: Cart state preserved via browser back-button navigation<br>
**Tags:** `@regression`<br>

**Preconditions:**

- User is on `/cart.html` with items already added to cart.

**Test steps:**

| Step | Action                                                                                             | Expected result                                        |
| ---- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 1    | Observe cart item list and badge count                                                             | Cart active state verified                             |
| 2    | Navigate to `/inventory.html`, then trigger the browser's native back navigation (`page.goBack()`) | Browser returns to `/cart.html`                        |
| 3    | Observe cart badge and item list after back-navigation                                             | Cart badge count and item list are identical to step 1 |
| 4    | Assert no duplicate or missing item rows                                                           | Cart item count is unchanged                           |

**Expected result:**
Using the browser's native back button to return to the cart preserves the exact cart state, with no item loss or duplication.

**Actual result:**

**Test data:**

| Field         | Value               |
| ------------- | ------------------- |
| Retained Item | Sauce Labs Backpack |

**Notes:**
Complements TC-011, which covers the "Continue Shopping" button path; this covers the native back-button/history path called out separately in TEST-PLAN §3.

**Status:** ⬜ Not run

---

### TC-020 — Cross-session cart/data isolation between distinct users

**Feature:** Shopping Cart / Security<br>
**Type:** Negative / Security<br>
**Priority:** 🔴 High<br>
**Automated:** Yes<br>
**Automation reference:** Planned — `tests/functional/cart/session-isolation.spec.ts`<br>
**Tags:** `@security` `@regression`<br>

**Preconditions:**

- Two distinct browser contexts are available, each capable of an independent authenticated session.

**Test steps:**

| Step | Action                                                      | Expected result                             |
| ---- | ----------------------------------------------------------- | ------------------------------------------- |
| 1    | Log in as User A (`standard_user`) in browser context 1     | Authenticated, lands on `/inventory.html`   |
| 2    | Add 2 items to cart as User A                               | Cart badge shows `2`                        |
| 3    | Log in as User B in a completely separate browser context 2 | Authenticated, lands on `/inventory.html`   |
| 4    | Observe cart badge and `/cart.html` contents for User B     | Cart badge shows `0` and cart page is empty |

**Expected result:**
No cart items, badge counts, or session data leak from User A's session into User B's independently authenticated session.

**Actual result:**

**Test data:**

| Field  | Value                                       |
| ------ | ------------------------------------------- |
| User A | `standard_user` (browser context 1)         |
| User B | second distinct account (browser context 2) |

**Notes:**
Directly automates the 🔴 Critical risk in TEST-PLAN §3 ("Data leakage between active sessions"). Implement using Playwright's multi-`BrowserContext` orchestration (per TEST-PLAN §7.2) rather than logout/login in the same context, so storage-level isolation is verified, not just UI state.

**Status:** ⬜ Not run

---

## 4. Checkout Workflows

### TC-012 — Complete End-to-End purchase flow

**Feature:** Checkout Workflows<br>
**Type:** Functional<br>
**Priority:** 🔴 High<br>
**Automated:** Yes<br>
**Automation reference:** `tests/e2e/checkout-e2e.spec.ts` — Scenario: "complete full checkout purchase flow"<br>
**Tags:** `@smoke` `@regression` `@e2e`<br>

**Preconditions:**

- User authenticated on `/inventory.html`.

**Test steps:**

| Step | Action                                                       | Expected result                                 |
| ---- | ------------------------------------------------------------ | ----------------------------------------------- |
| 1    | Add item to cart and navigate to `/cart.html`                | Cart view displays item                         |
| 2    | Click "Checkout" button                                      | Navigates to `/checkout-step-one.html`          |
| 3    | Fill First Name, Last Name, Postal Code and click "Continue" | Navigates to `/checkout-step-two.html` overview |
| 4    | Verify Overview items, Subtotal, Tax, and Total              | Mathematical total equals subtotal + tax        |
| 5    | Click "Finish" button                                        | Navigates to `/checkout-complete.html`          |
| 6    | Assert confirmation header text                              | Header displays "Thank you for your order!"     |

**Expected result:**
User successfully completes multi-step checkout workflow and reaches order confirmation page.

**Actual result:**

**Test data:**

| Field       | Value |
| ----------- | ----- |
| First Name  | Jane  |
| Last Name   | Doe   |
| Postal Code | 90210 |

**Notes:**
Primary critical path revenue-generating journey.

**Status:** ✅ Pass

---

### TC-014 — Financial and tax mathematical total calculation

**Feature:** Checkout Workflows<br>
**Type:** Functional<br>
**Priority:** 🔴 High<br>
**Automated:** Yes<br>
**Automation reference:** `tests/functional/checkout/order-summary.spec.ts` — Scenario: "verify cart items total calculation"<br>
**Tags:** `@regression` `@e2e`<br>

**Preconditions:**

- User is on `/checkout-step-two.html` with multiple items added.

**Test steps:**

| Step | Action                                                     | Expected result                                              |
| ---- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| 1    | Programmatically sum individual item prices                | Calculated Item Total computed                               |
| 2    | Read displayed "Item total" text from page                 | Displayed Item Total matches programmatically calculated sum |
| 3    | Read displayed "Tax" value                                 | Tax rate parsed successfully                                 |
| 4    | Add Item Total + Tax and compare against displayed "Total" | Sum matches displayed "Total: $XX.XX" exactly                |

**Expected result:**
Application's displayed Total equals Item Total plus Tax calculated across selected catalog items.

**Actual result:**

**Test data:**

| Field           | Value                                  |
| --------------- | -------------------------------------- |
| Multi-item Cart | Backpack ($29.99) + Bike Light ($9.99) |

**Notes:**
Parses DOM currency strings using floating point assertions.

**Status:** ✅ Pass

---

## 5. Full User Journeys (E2E)

_Multi-page, cross-module journeys that exercise the funnel end to end. See also TC-012 in Checkout Workflows above — the baseline single-item happy path — which lives alongside these under `tests/e2e/`._

### TC-022 — Multi-item purchase journey with funnel-wide total verification

**Feature:** Full User Journey / Checkout<br>
**Type:** Functional<br>
**Priority:** 🔴 High<br>
**Automated:** Yes<br>
**Automation reference:** `tests/e2e/checkout-e2e.spec.ts` — Scenario: "[TC-022]: complete full checkout purchase flow" (adds 3 items, asserts subtotal, tax, and total through to order confirmation)<br>
**Tags:** `@e2e` `@regression`<br>

**Preconditions:**

- User is authenticated as `standard_user` on `/inventory.html` with an empty cart.

**Test steps:**

| Step | Action                                                                                          | Expected result                                                  |
| ---- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1    | Add 3 distinct items to cart from `/inventory.html`                                             | Cart badge shows `3`                                             |
| 2    | Navigate to `/cart.html` and verify all 3 items are listed                                      | Cart lists exactly the 3 selected items with correct prices      |
| 3    | Click "Checkout", fill required fields, click "Continue"                                        | Navigates to `/checkout-step-two.html` overview                  |
| 4    | Programmatically sum the 3 item prices and compare against displayed Item total, Tax, and Total | Displayed values match the calculated sum across all 3 items     |
| 5    | Click "Finish"                                                                                  | Navigates to `/checkout-complete.html` with confirmation message |

**Expected result:**
A multi-item cart carries correct, consistent totals across every step of the funnel through to order confirmation.

**Actual result:**

**Test data:**

| Field | Value                                                               |
| ----- | ------------------------------------------------------------------- |
| Items | Sauce Labs Backpack, Sauce Labs Bike Light, Sauce Labs Bolt T-Shirt |

**Notes:**
Complements TC-012 (single-item happy path) and TC-014 (isolated step-two math check) by validating totals stay correct across the _entire_ funnel, not just one page, with more than one item.

**Status:** ✅ Pass

---

### TC-023 — Abandon checkout mid-funnel and resume shopping

**Feature:** Full User Journey / Checkout<br>
**Type:** Functional<br>
**Priority:** 🟡 Medium<br>
**Automated:** Yes<br>
**Automation reference:** `tests/e2e/checkout-e2e.spec.ts` — Scenarios: "[TC-023]: Abandon checkout on Step One & resume" and "[TC-023]: Abandon checkout on Step Two & resume" (full cancel→resume→complete journeys), plus unit-level cancel checks in `tests/functional/checkout/shipping.spec.ts` (step one) and `tests/functional/checkout/order-summary.spec.ts` (step two)<br>
**Tags:** `@e2e` `@regression`<br>

**Preconditions:**

- User is authenticated as `standard_user` with 3 items already in cart.

**Test steps:**

| Step | Action                                                         | Expected result                                      |
| ---- | -------------------------------------------------------------- | ---------------------------------------------------- |
| 1    | From `/cart.html`, click "Checkout" then "Cancel" on step one  | User is returned to `/cart.html`                     |
| 2    | Verify cart contents and badge count                           | Both items remain in the cart, badge still shows `2` |
| 3    | Click "Checkout" again, fill required fields, click "Continue" | Navigates to `/checkout-step-two.html`               |
| 4    | Click "Cancel" on the overview step                            | User is returned to `/inventory.html`                |
| 5    | Verify cart badge from the inventory page                      | Badge still shows `2`, no items were lost            |

**Expected result:**
Cancelling checkout at either step returns the user to the expected prior page without losing any cart contents.

**Actual result:**

**Test data:**

| Field | Value                                      |
| ----- | ------------------------------------------ |
| Items | Sauce Labs Backpack, Sauce Labs Bike Light |

**Notes:**
A third variant — "[TC-023]: Abandon checkout on Step Two, check filled form data & resume" — is currently `test.skip`'d due to a discovered bug (filled shipping form data is not preserved after aborting checkout); see BUG-002 in the Defect log.

**Status:** ✅ Pass (1 of 3 chained scenarios skipped — known bug, see Defect log)

---

### TC-024 — Remove item mid-funnel and resume checkout

**Feature:** Full User Journey / Checkout<br>
**Type:** Functional<br>
**Priority:** 🟡 Medium<br>
**Automated:** Yes<br>
**Automation reference:** Planned — `tests/e2e/checkout-e2e.spec.ts` — Scenario: Removing an item mid-funnel updates totals on resumed checkout<br>
**Tags:** `@e2e` `@regression`<br>

**Preconditions:**

- User is authenticated as `standard_user` with 2 items in cart.

**Test steps:**

| Step | Action                                                            | Expected result                                                   |
| ---- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1    | Proceed to checkout step one and click "Cancel" to return to cart | User lands on `/cart.html` with both items listed                 |
| 2    | Remove one item directly from `/cart.html`                        | Cart badge decrements to `1`, only 1 item remains                 |
| 3    | Resume checkout: fill required fields, click "Continue"           | Navigates to `/checkout-step-two.html`                            |
| 4    | Verify Item total, Tax, and Total on the overview                 | Totals reflect only the single remaining item, not the original 2 |

**Expected result:**
Totals recalculated after a mid-funnel cart edit are correct and never reflect stale/removed items.

**Actual result:**

**Test data:**

| Field | Value                                      |
| ----- | ------------------------------------------ |
| Items | Sauce Labs Backpack, Sauce Labs Bike Light |

**Notes:**
Guards against a class of bug where checkout totals are computed once and cached rather than derived live from current cart state.

**Status:** ⬜ Not run

---

### TC-025 — Post-purchase state reset verification

**Feature:** Full User Journey / Checkout<br>
**Type:** Functional<br>
**Priority:** 🟡 Medium<br>
**Automated:** Yes<br>
**Automation reference:** Partially covered — `tests/functional/checkout/order-complete.spec.ts` — Scenario: "the Back Home button successfully returns the user to the inventory page" only asserts the URL redirect; it does not yet assert the cart badge/`/cart.html` are actually empty (steps 2–4 below still Planned)<br>
**Tags:** `@e2e` `@regression`<br>

**Preconditions:**

- User has just completed the happy-path purchase in TC-012 and is on `/checkout-complete.html`.

**Test steps:**

| Step | Action                                     | Expected result                               |
| ---- | ------------------------------------------ | --------------------------------------------- |
| 1    | Click "Back Home" on the confirmation page | Navigates to `/inventory.html`                |
| 2    | Observe the shopping cart badge            | Badge shows no count (cart is empty)          |
| 3    | Navigate to `/cart.html` directly          | Cart page displays no items                   |
| 4    | Re-add a previously purchased item         | Item can be added again as a fresh cart entry |

**Expected result:**
Completing an order fully resets cart state; no items or stale badge counts carry over past the confirmation page.

**Actual result:**

**Test data:**

N/A — continuation of TC-012's flow.

**Notes:**
TC-012 stops verifying at the confirmation message; this covers the remainder of that same journey's lifecycle, which was previously unverified.

**Status:** 🚧 Blocked (partial automation only — cart-empty assertion still missing)

---

### TC-026 — Full purchase journey for `performance_glitch_user` within SLA

**Feature:** Full User Journey / Performance<br>
**Type:** Functional<br>
**Priority:** 🔴 High<br>
**Automated:** Yes<br>
**Automation reference:** Planned — `tests/e2e/checkout-e2e.spec.ts` — Scenario: performance_glitch_user completes full funnel within SLA<br>
**Tags:** `@e2e` `@performance` `@problematic`<br>

**Preconditions:**

- Application base URL is accessible.

**Test steps:**

| Step | Action                                                                               | Expected result                                                           |
| ---- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| 1    | Log in as `performance_glitch_user`                                                  | Authenticated, lands on `/inventory.html`                                 |
| 2    | Start a timer, then add an item to cart and proceed through checkout to confirmation | Full funnel (Inventory → Cart → Info → Overview → Confirmation) completes |
| 3    | Stop the timer once the confirmation message is visible                              | Total elapsed time is within the agreed SLA threshold                     |
| 4    | Assert the confirmation message text                                                 | Displays "Thank you for your order!"                                      |

**Expected result:**
`performance_glitch_user` can complete the entire purchase funnel — not just login — within the SLA threshold, with no step timing out.

**Actual result:**

**Test data:**

| Field    | Value                     |
| -------- | ------------------------- |
| Username | `performance_glitch_user` |
| Password | `secret_sauce`            |

**Notes:**
TEST-PLAN §3's Critical mitigation calls for automating "the full happy-path E2E checkout daily" specifically to catch this profile's induced delays; TC-005 only covers this user's _login_ SLA, not the full funnel where a timeout is more likely to actually surface.

**Status:** ⬜ Not run

---

## 6. Application Sidebar & Lifecycle

### TC-015 — Clean application logout and session state reset

**Feature:** Lifecycle<br>
**Type:** Functional<br>
**Priority:** 🔴 High<br>
**Automated:** Yes<br>
**Automation reference:** Planned — `tests/functional/lifecycle/logout.spec.ts` — no logout test currently exists anywhere in the suite<br>
**Tags:** `@smoke` `@regression`<br>

**Preconditions:**

- User authenticated and active on `/inventory.html`.

**Test steps:**

| Step | Action                                                             | Expected result                                          |
| ---- | ------------------------------------------------------------------ | -------------------------------------------------------- |
| 1    | Click hamburger sidebar icon (`#react-burger-menu-btn`)            | Sidebar menu slides open                                 |
| 2    | Click "Logout" sidebar link                                        | Session invalidated and user redirected to `/index.html` |
| 3    | Attempt direct browser back-button navigation to `/inventory.html` | Guard redirects user back to `/index.html`               |

**Expected result:**
Logging out via sidebar menu clears application session state and prevents unauthenticated back-navigation.

**Actual result:**

**Test data:**

| Field  | Value  |
| ------ | ------ |
| Action | Logout |

**Notes:**
Ensures authentication guards and storage resets trigger cleanly.

**Status:** ⬜ Not run

---

## 7. Visual Regression

### TC-016 — Baseline visual rendering sanity check

**Feature:** Visual Regression<br>
**Type:** Functional<br>
**Priority:** 🟡 Medium<br>
**Automated:** Yes<br>
**Automation reference:** `tests/sanity.spec.ts` — Scenario: "visual rendering sanity check" (login page & inventory page structural layout renders)<br>
**Tags:** `@visual`<br>

**Preconditions:**

- Viewport set to standard resolution (1280x720).

**Test steps:**

| Step | Action                                                      | Expected result                                               |
| ---- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| 1    | Navigate to `/index.html` and trigger visual assertion      | Login page layout matches `login-page-render.png` snapshot    |
| 2    | Log in as `standard_user` and navigate to `/inventory.html` | Inventory layout matches `inventory-page-render.png` snapshot |

**Expected result:**
Core page structural layouts match Ubuntu CI visual baseline snapshots within pixel tolerance limits.

**Actual result:**

**Test data:**

| Field    | Value    |
| -------- | -------- |
| Viewport | 1280x720 |

**Notes:**
Generated and executed in Ubuntu CI runner to prevent OS font-rendering anti-aliasing diffs.

**Status:** ✅ Pass

---

## 8. Accessibility

### TC-021 — WCAG 2.1 AA compliance audit on core pages

**Feature:** Accessibility<br>
**Type:** Functional<br>
**Priority:** 🟡 Medium<br>
**Automated:** Yes<br>
**Automation reference:** Planned — `tests/functional/a11y/wcag-audit.spec.ts`<br>
**Tags:** `@a11y`<br>

**Preconditions:**

- `@axe-core/playwright` is installed and configured (currently not present in `package.json` — see Notes).

**Test steps:**

| Step | Action                                                                                             | Expected result                                                   |
| ---- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1    | Navigate to `/index.html` (login page) and run an Axe accessibility scan                           | Zero critical/serious WCAG 2.1 AA violations reported             |
| 2    | Authenticate, navigate to `/inventory.html`, run an Axe scan                                       | Zero critical/serious WCAG 2.1 AA violations reported             |
| 3    | Navigate to `/cart.html`, run an Axe scan                                                          | Zero critical/serious WCAG 2.1 AA violations reported             |
| 4    | Navigate through checkout steps one/two and `/checkout-complete.html`, running an Axe scan on each | Zero critical/serious WCAG 2.1 AA violations reported on any step |

**Expected result:**
All core application pages pass automated Axe-core WCAG 2.1 AA scanning with no critical or serious violations.

**Actual result:**

**Test data:**

N/A

**Notes:**
Requires adding `@axe-core/playwright` as a dependency before this can be implemented. Any pre-existing violations discovered on first run should be logged in the Defect log, not silently accepted as a baseline.

**Status:** ⬜ Not run

---

## 9. Negative Test Cases

### TC-002 — Login attempt with invalid credentials

**Feature:** Authentication<br>
**Type:** Negative<br>
**Priority:** 🔴 High<br>
**Automated:** Yes<br>
**Automation reference:** `tests/functional/auth/login.spec.ts` — Scenario: "error message on invalid credentials - invalid credentials" (data-driven)<br>
**Tags:** `@smoke` `@regression`<br>

**Preconditions:**

- Application base URL is accessible.

**Test steps:**

| Step | Action                                     | Expected result                                                                           |
| ---- | ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| 1    | Navigate to `https://www.saucedemo.com/`   | Login page is displayed                                                                   |
| 2    | Enter `invalid_user` into username input   | Field accepts input                                                                       |
| 3    | Enter `wrong_password` into password input | Field accepts masked input                                                                |
| 4    | Click "Login" button                       | Form submission fails; error container displays                                           |
| 5    | Verify error banner text                   | Text matches: `Epic sadface: Username and password do not match any user in this service` |

**Expected result:**
System rejects invalid credentials and displays explicit error message banner.

**Actual result:**

**Test data:**

| Field    | Value            |
| -------- | ---------------- |
| Username | `invalid_user`   |
| Password | `wrong_password` |

**Status:** ✅ Pass

---

### TC-003 — Direct route bypass without active session

**Feature:** Authentication / Security<br>
**Type:** Negative<br>
**Priority:** 🔴 High<br>
**Automated:** Yes<br>
**Automation reference:** `tests/functional/auth/login.spec.ts` — Scenario: "redirect unauthenticated user attempting to bypass to /inventory.html"<br>
**Tags:** `@regression` `@security`<br>

**Preconditions:**

- Browser context has zero cookies, `localStorage`, or `sessionStorage` tokens.

**Test steps:**

| Step | Action                                                                      | Expected result                                                                                     |
| ---- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1    | Navigate directly to `https://www.saucedemo.com/inventory.html` via URL bar | Navigation interrupted                                                                              |
| 2    | Observe URL location                                                        | Browser redirected back to `/` or `/index.html`                                                     |
| 3    | Verify error banner message                                                 | Error banner displays: `Epic sadface: You can only access 'inventory.html' when you are logged in.` |

**Expected result:**
Unauthenticated direct navigation to protected route is blocked and redirected to login page with explicit error.

**Actual result:**

**Status:** ✅ Pass

---

### TC-004 — Authentication attempt with locked_out_user profile

**Feature:** Authentication<br>
**Type:** Negative<br>
**Priority:** 🔴 High<br>
**Automated:** Yes<br>
**Automation reference:** `tests/functional/auth/login.spec.ts` — Scenario: "error message on invalid credentials - locked out user" (data-driven)<br>
**Tags:** `@regression`<br>

**Preconditions:**

- Application base URL is accessible.

**Test steps:**

| Step | Action                                    | Expected result                                                        |
| ---- | ----------------------------------------- | ---------------------------------------------------------------------- |
| 1    | Navigate to `https://www.saucedemo.com/`  | Login page displayed                                                   |
| 2    | Enter `locked_out_user` in username field | Field accepts input                                                    |
| 3    | Enter `secret_sauce` in password field    | Field accepts masked input                                             |
| 4    | Click "Login" button                      | Entry is barred; error banner displays                                 |
| 5    | Assert error banner text                  | Message matches: `Epic sadface: Sorry, this user has been locked out.` |

**Expected result:**
Locked out user is barred entry and receives specific account status error message.

**Actual result:**

**Test data:**

| Field    | Value             |
| -------- | ----------------- |
| Username | `locked_out_user` |
| Password | `secret_sauce`    |

**Status:** ✅ Pass

---

### TC-013 — Checkout step one required-field validation (all combinations)

**Feature:** Checkout Workflows<br>
**Type:** Negative<br>
**Priority:** 🟡 Medium<br>
**Automated:** Yes<br>
**Automation reference:** `tests/functional/checkout/shipping.spec.ts` — Scenario: "validation: ${scenario.description}", data-driven over `VALIDATION_SCENARIOS` in `checkout-customer-form.factory.ts`, mirroring the negative-login data-driven pattern in `login.spec.ts`<br>
**Tags:** `@regression`<br>

**Preconditions:**

- User is on `/checkout-step-one.html` with items in cart.

**Test steps (applied per data row):**

| Step | Action                                                                                            | Expected result                                        |
| ---- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 1    | Fill in only the fields marked with a value in the row; leave the field(s) marked _[blank]_ empty | Inputs accept the provided values                      |
| 2    | Click "Continue" button                                                                           | Form submission is blocked                             |
| 3    | Assert visible error message container                                                            | Banner text matches the row's "Expected error message" |

**Expected result:**
Submitting checkout step one with any required field left blank blocks form submission and displays the field-specific validation error banner. When multiple fields are blank simultaneously, the first missing field in form order (First Name → Last Name → Postal Code) takes precedence, matching the application's validation order.

**Actual result:**

**Test data:**

| #   | First Name | Last Name | Postal Code               | Expected error message                                                  |
| --- | ---------- | --------- | ------------------------- | ----------------------------------------------------------------------- |
| 1   | _[blank]_  | Doe       | 90210                     | `Error: First Name is required`                                         |
| 2   | Jane       | _[blank]_ | 90210                     | `Error: Last Name is required`                                          |
| 3   | Jane       | Doe       | _[blank]_                 | `Error: Postal Code is required`                                        |
| 4   | _[blank]_  | _[blank]_ | _[blank]_                 | `Error: First Name is required`                                         |
| 5   | Jane       | Doe       | `"   "` (whitespace only) | `Error: Postal Code is required` — currently `test.skip`'d, see BUG-001 |

**Notes:**
Intentionally documented as a single test case data-driven over all four combinations, rather than one TC per field — the automation is a straightforward parametrized loop, the same pattern already used for the negative login scenarios in `login.spec.ts`. A fifth scenario (whitespace-only Postal Code) was added during implementation and is currently `test.skip`'d due to a discovered validation bug — see BUG-001 in the Defect log.

**Status:** ✅ Pass (4 of 5 scenarios — 1 skipped, known bug, see Defect log)

---

### TC-027 — Checkout should be blocked when the cart is empty

**Feature:** Shopping Cart / Checkout Workflows<br>
**Type:** Negative<br>
**Priority:** 🔴 High<br>
**Automated:** Yes<br>
**Automation reference:** `tests/functional/cart/shopping-cart.spec.ts` — Scenario: "the Checkout button should not allow completing an order with an empty cart" — currently `test.skip`'d, see BUG-003<br>
**Tags:** `@regression`<br>

**Preconditions:**

- User is authenticated as `standard_user` with an empty cart (cart contents cleared).

**Test steps:**

| Step | Action                                                                                        | Expected result                                                             |
| ---- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1    | Navigate to `/cart.html` with 0 items in cart                                                 | Cart page displays no items                                                 |
| 2    | Observe the "Checkout" button                                                                 | Button is disabled or hidden, since there is nothing to purchase            |
| 3    | If clicked anyway, attempt to complete the full funnel (fill shipping form, continue, finish) | Funnel is blocked at some step; user cannot reach `/checkout-complete.html` |

**Expected result:**
A user cannot complete a purchase — or reach an order confirmation — with zero items in their cart.

**Actual result:**
The "Checkout" button is visible and enabled with an empty cart. Clicking it proceeds through the entire funnel: the shipping form accepts input, the overview page displays `Item total: $0`, `Tax: $0.00`, `Total: $0.00`, and clicking "Finish" reaches `/checkout-complete.html` with "Thank you for your order!" — a fully "completed" $0.00 order for nothing.

**Test data:**

N/A — reproduced with the default seeded cart cleared to 0 items.

**Notes:**
Found via exploratory testing, not originally documented in this suite. See BUG-003 in the Defect log.

**Status:** ⏭ Skipped (known bug)

---

## Defect log

_Bugs found during this test execution cycle. Link to the issue tracker._

| ID      | Title                                                                  | Severity    | Steps to reproduce                                                                                                                                                                                                                                                                                                                                                  | Linked TC | Status  |
| ------- | ---------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------- |
| BUG-001 | Checkout step one accepts whitespace-only Postal Code                  | 🟡 Medium   | 1. Add an item to cart and open `/checkout-step-one.html`. 2. Fill First Name and Last Name with valid values. 3. Enter only spaces (e.g. `"   "`) into Postal Code. 4. Click Continue. Actual: form submits to `/checkout-step-two.html` instead of blocking with `Error: Postal Code is required`.                                                                | TC-013    | 🔴 Open |
| BUG-002 | Shipping form data not preserved after aborting checkout from step two | 🟡 Medium   | 1. Add items to cart, checkout, and fill/submit the step-one shipping form. 2. On `/checkout-step-two.html`, click "Cancel" (returns to `/inventory.html`). 3. Resume checkout via Cart → Checkout, landing back on `/checkout-step-one.html`. Actual: shipping form fields are empty instead of retaining the previously entered First Name/Last Name/Postal Code. | TC-023    | 🔴 Open |
| BUG-003 | Checkout completes successfully with an empty cart ($0.00 order)       | 🔴 Critical | 1. Clear the cart to 0 items and open `/cart.html`. 2. Click "Checkout" (button is enabled). 3. Fill the shipping form and click "Continue" — overview shows `Item total: $0`, `Tax: $0.00`, `Total: $0.00`. 4. Click "Finish". Actual: navigates to `/checkout-complete.html` with "Thank you for your order!" — a full order confirmation for nothing.            | TC-027    | 🔴 Open |

---

## Exploratory testing session log

_For unscripted sessions run alongside the scripted suite._

**Session date:**<br>
**Tester:**<br>
**Charter:** _e.g. "Explore the fund transfer flow focusing on edge cases around account limits and concurrent transfers"_<br>
**Duration:**<br>
**Coverage notes:**<br>
**Bugs found:**<br>
**Areas needing follow-up:**<br>

---

## Test execution summary

_Filled in after a full test run. Used as input to the test completion report._

| Metric             | Value                                                         |
| ------------------ | ------------------------------------------------------------- |
| Total test cases   |                                                               |
| Passed             |                                                               |
| Failed             |                                                               |
| Blocked            |                                                               |
| Skipped            |                                                               |
| Pass rate          |                                                               |
| Critical bugs open |                                                               |
| High bugs open     |                                                               |
| Recommendation     | ✅ Release / ❌ Do not release / ⚠️ Release with known issues |

**Notes:**
_Anything a product owner or engineering lead needs to know before making the release decision_
