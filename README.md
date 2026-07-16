# Project: SauceDemo UI & Hybrid Automation Suite

**App under test:** [SauceDemo](https://www.saucedemo.com)

The standard, industry-recognized e-commerce storefront sandbox developed by Sauce Labs. It mimics a contemporary single-page React application with shifting states, inventory tracking, sorting capabilities, and validation parameters.

**Stack:** Playwright (`WebFirst` Engine) · TypeScript · GitHub Actions · Allure Report

---

### 📦 What the Project Contains

| #   | Deliverable                            | Description                                                                                                                                                                                                |
| --- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Page Object Model (POM) Tier**       | A highly structured object abstraction layer separating UI selectors from your actual test logic, utilizing clean class structures.                                                                        |
| 2   | **E2E Core Journey Suite**             | Multi-browser scripts validating critical customer paths: login → catalog browsing → cart checkout forms → structural total calculations → dynamic confirmation screens.                                   |
| 3   | **Hybrid API-Injected Test Specs**     | Optimization layer where UI authentication steps are bypassed via background programmatic network injections, slashing execution times for deep-page validations.                                          |
| 4   | **Data-Driven Multi-Profile Matrices** | An execution loop that processes different user profile personas (standard, performance-glitch, locked-out) from an external JSON data object to assert unique front-end error and performance thresholds. |
| 5   | **Parallelized Pipeline Deployment**   | A continuous integration workflow configured to auto-spin up concurrent worker threads across Chromium, Firefox, and WebKit layout rendering engines inside clean containers.                              |

---
