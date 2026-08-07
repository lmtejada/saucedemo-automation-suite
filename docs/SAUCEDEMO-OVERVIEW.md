# SauceDemo — Application Overview

A field guide to [SauceDemo](https://www.saucedemo.com), the application this repo tests: what it does, the user profiles it ships for QA practice, and — the main point of this document — a scannable catalog of where its behavior diverges from what a real production e-commerce app would do, with the expected real-world behavior spelled out for each one.

**Why this document exists:** SauceDemo has no published spec. Everything below was established by reading the app's actual behavior — manually and through this automation suite. Where something looks like a bug but isn't (see [§5](#5-looks-like-a-bug-isnt-a-bug)), that distinction was reached deliberately. This doc, along with the full [defect log](TEST-CASES.md#defect-log) and [risk register](TEST-PLAN.md#3-risk-assessment) it's drawn from, is meant to show that reasoning, not just the conclusions.

---

## Contents

- [1. What is SauceDemo](#1-what-is-saucedemo)
- [2. User profiles](#2-user-profiles)
- [3. Application map](#3-application-map)
- [4. Known defects](#4-known-defects)
- [5. Looks like a bug, isn't a bug](#5-looks-like-a-bug-isnt-a-bug)
- [6. Future work](#6-future-work)
- [7. Where to go deeper](#7-where-to-go-deeper)

---

## 1. What is SauceDemo

Sauce Labs' public sample storefront, purpose-built as a QA training/demo target. It simulates a small e-commerce flow — login, browse, cart, checkout — and intentionally ships a handful of broken or quirky user profiles so testers have real things to find.

**What it is not:** a real application with a backend or an account system. There's no server-side persistence, no real orders, no per-user data isolation — the "database" is `localStorage` and a handful of hardcoded credentials. That single fact explains several behaviors in [§5](#5-looks-like-a-bug-isnt-a-bug) that would otherwise look alarming.

|                |                                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| **URL**        | https://www.saucedemo.com                                                                                   |
| **Auth model** | Plain `session-username` cookie, fixed ~10-minute TTL, does not renew on activity                           |
| **Data model** | None server-side — cart lives in `localStorage["cart-contents"]`, scoped to the browser origin              |
| **Catalog**    | 6 fixed products (Backpack, Bike Light, Bolt T-Shirt, Fleece Jacket, Onesie, `Test.allTheThings()` T-Shirt) |
| **Checkout**   | 3-step funnel: shipping info → order overview → confirmation, no real payment                               |

---

## 2. User profiles

SauceDemo's login accepts a fixed set of usernames (all sharing one password) that each toggle a different set of front-end quirks. This is the mechanism that makes the app useful for QA practice — it's a deliberate feature, not a bug.

| Username                  | What happens                                                                                                                    | Purpose                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `standard_user`           | Everything works as expected                                                                                                    | Baseline/happy-path profile                             |
| `locked_out_user`         | Blocked at login with an explicit `Epic sadface: Sorry, this user has been locked out.` error                                   | Negative-path / account-lockout testing                 |
| `performance_glitch_user` | Logs in successfully but with several seconds of artificial delay                                                               | Latency/SLA and dynamic-wait testing                    |
| `problem_user`            | Logs in fine, but the UI misbehaves in several distinct ways once inside — see [§4](#4-known-defects) (BUG-004 through BUG-011) | Deliberately broken profile — the app's main "bug farm" |

`invalid_user` / blank credentials aren't real profiles — they're just negative-path test fixtures for the login form's own validation (see TC-002 in [TEST-CASES.md](TEST-CASES.md#tc-002--login-attempt-with-invalid-credentials)).

---

## 3. Application map

```
Login  →  Inventory (product list)  →  Item detail
                │                            │
                ▼                            ▼
              Cart  ───────────────────────►  Cart
                │
                ▼
     Checkout step 1 (shipping info)
                │
                ▼
     Checkout step 2 (order overview)
                │
                ▼
        Checkout complete
```

**Sidebar menu** (every page): All Items · About · Logout · Reset App State.

**Sort options** on the inventory page: Name (A–Z / Z–A), Price (low–high / high–low).

---

## 4. Known defects

Bugs confirmed during this suite's development, each with the automated test case that pins it down (currently `test.skip`'d against the real defect, so the suite documents the gap without failing CI on someone else's bug). Full repro steps live in the [defect log](TEST-CASES.md#defect-log); this table adds the "how it should behave in a real app" framing.

| ID      | Severity    | What happens today                                                                                                                                            | What a real app should do                                                                                                                           | Linked TC |
| ------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| BUG-003 | 🔴 Critical | Checkout completes and shows "Thank you for your order!" for a **$0.00 / empty cart**                                                                         | Checkout should be blocked (or the button disabled) when the cart has zero items                                                                    | TC-027    |
| BUG-010 | 🟠 High     | For `problem_user`, clicking a product's name/image opens the **wrong product's** detail page — one product is entirely unreachable ("Item Not Found")        | Clicking a product should always open that exact product's detail page                                                                              | TC-037    |
| BUG-004 | 🟠 High     | For `problem_user`, the checkout shipping form drops the First Name value into Last Name and leaves Last Name blank, so validation blocks the funnel entirely | Each form field should hold exactly what the user typed into it                                                                                     | TC-028    |
| BUG-001 | 🟡 Medium   | Postal Code accepts a whitespace-only value (`"   "`) and lets checkout proceed                                                                               | Required-field validation should reject whitespace-only input the same as empty input                                                               | TC-013    |
| BUG-002 | 🟡 Medium   | Canceling checkout at step two and resuming loses the previously entered shipping info                                                                        | Form state entered earlier in a funnel should be retained if the user backs out and resumes                                                         | TC-023    |
| BUG-005 | 🟡 Medium   | For `problem_user`, all 6 product images resolve to the same broken placeholder asset                                                                         | Each product should render its own distinct image                                                                                                   | TC-018    |
| BUG-006 | 🟡 Medium   | For `problem_user`, the sort dropdown selection has no effect on product order                                                                                | Selecting a sort option should reorder the visible list accordingly                                                                                 | TC-030    |
| BUG-007 | 🟡 Medium   | For `problem_user`, "Remove" on the inventory page is a no-op — item stays in the cart                                                                        | Clicking Remove should remove the item from the cart and update the badge/button immediately                                                        | TC-031    |
| BUG-008 | 🟡 Medium   | "Reset App State" empties the cart but leaves "Remove" buttons stuck instead of reverting to "Add to cart"                                                    | Resetting app state should return every control to a state consistent with the (now-empty) cart                                                     | TC-033    |
| BUG-009 | 🟡 Medium   | Revisiting the login page while already authenticated still shows a live login form, and submitting new credentials silently overwrites the active session    | An already-authenticated user hitting the login route should be redirected back into their session, not re-shown a form that can silently hijack it | TC-034    |
| BUG-011 | 🟡 Medium   | For `problem_user`, "Add to cart" is a no-op for exactly half the catalog (3 of 6 products), identically on the inventory and item-detail pages               | Add to cart should work identically for every product in the catalog                                                                                | TC-038    |

**11 open defects**, all confirmed and reproduced, none faked or assumed — see [Session 1](TEST-CASES.md#session-1--problem_user-divergence-sweep) and [Session 3](TEST-CASES.md#session-3--problem_user-item-detail-page-investigation) in the exploratory log for how BUG-005 through BUG-011 were traced. Two further accessibility defects are tracked separately — see the [accessibility defect log](TEST-CASES.md#accessibility-defect-log).

---

## 5. Looks like a bug, isn't a bug

Two behaviors are easy to misdiagnose as security or data-integrity bugs on first look. Both were investigated deliberately and ruled out — worth stating explicitly so the reasoning is visible.

**Cart/session data isn't isolated between users on the same browser profile.**
Log in as User A, add items to the cart, log out, and log in as User B in the same browser profile — User B sees User A's cart. This is because `cart-contents` is a single `localStorage` value scoped to the browser origin, not to a user or session — and SauceDemo has no backend or account model for it to belong to in the first place. There was never a product intention for switching identity to isolate cart data, so treating this as a data-leak bug would be testing a requirement the app never had. See the [Session 2 write-up](TEST-CASES.md#session-2--cross-tab-session-guard-investigation) and [TC-039](TEST-CASES.md#tc-039--cart-contents-deliberately-persist-in-localstorage-after-logout) for the test that pins this down as intentional, and the TEST-PLAN [risk-assessment note](TEST-PLAN.md#3-risk-assessment) for the full reasoning (an earlier draft test case, TC-020, asserting isolation was removed for exactly this reason).

**Session cookie expires ~10 minutes after login, always, regardless of activity.**
Measured directly from captured storage state: a fixed, non-sliding TTL (~599.7s) from login time, not an inactivity timeout. It's a real, reproducible characteristic — and it does explain real-world "why was I logged out" reports — but there's no published spec confirming it's a deliberate security decision rather than an implementation default. The suite ([TC-017](TEST-CASES.md#tc-017--session-token-persistence-across-a-delayed-multi-step-workflow)) therefore asserts the thing that's actually a reasonable requirement regardless — no _false_ early logout during a normal-speed workflow — without pinning a test to the exact 10-minute number.

---

## 6. Future work

Directions the suite could grow into next, beyond its current scope.

- **Expand security testing.** Currently route-bypass (TC-003) and the session guard (TC-034, `test.skip`'d against BUG-009). Could add: cookie-flag checks (`HttpOnly`/`Secure`/`SameSite` on `session-username`) and basic XSS/input-sanitization probes on the checkout form.
- **Add screen reader and full keyboard-navigation testing.** `@axe-core/playwright` covers static DOM/ARIA issues; real assistive-tech behavior and keyboard/focus coverage beyond the one existing control (the inventory sort dropdown) would need either logged manual screen-reader passes (VoiceOver/NVDA) as exploratory sessions, or scripted keyboard-only walkthroughs (Tab order, Enter/Space activation).
- **Add mobile/responsive coverage.** Every Playwright project currently runs a fixed 1920×1080 desktop viewport. Could add a `devices['iPhone 13']`-style project alongside the desktop ones, plus a handful of layout/interaction smoke tests at that viewport.
- **Add offline/network-interrupt scenarios.** Could use `page.context().setOffline(true)` and route interception to simulate a dropped connection mid-checkout or a failed asset load, then assert graceful degradation.
- **Add test sharding.** The suite currently runs as one block per browser project. Could split via Playwright's `--shard` flag across parallel CI jobs, starting with the cross-browser main-gate run, to cut wall-clock time as the suite grows.

---

## 7. Where to go deeper

| Doc                                    | What's in it                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [TEST-PLAN.md](TEST-PLAN.md)           | Strategy, full risk register, CI/CD gating, entry/exit criteria                                        |
| [TEST-CASES.md](TEST-CASES.md)         | Every test case (TC-XXX), the full defect log, and exploratory session logs with root-cause narratives |
| [TEST-FRAMEWORK.md](TEST-FRAMEWORK.md) | Repo structure, conventions, and the rationale behind non-obvious engineering decisions                |
| [README.md](../README.md)              | Setup, scripts, CI workflows                                                                           |
