import { Page } from '@playwright/test';

import { test, expect } from '@fixtures/app';

import { StorageStatePaths } from '@enums/app';
import { CartPage } from '@pages/cart.page';
import { A11yScenario, formatAxeViolations } from '@utils/accessibility';

const CART_A11Y_SCENARIOS: A11yScenario<{
    page: Page;
    cartPage: CartPage;
    resetCart: () => Promise<void>;
}>[] = [
    {
        title: '[Accessibility]: Cart page with items meets WCAG 2.1 AA standards',
        setup: async ({ cartPage }): Promise<void> => {
            await cartPage.open();
        },
    },
    {
        title: '[Accessibility]: Check Cart page empty state',
        setup: async ({ page, cartPage, resetCart }): Promise<void> => {
            await cartPage.open();
            await resetCart();
            await page.reload();
            await cartPage.pageContainer.waitFor({ state: 'visible' });
        },
    },
];

test.describe('cart Accessibility Audits', { tag: '@a11y' }, () => {
    // This suite exercises a pre-filled cart, so it opts into the seeded cart state.
    test.use({ storageState: StorageStatePaths.CART });

    for (const scenario of CART_A11Y_SCENARIOS) {
        test(
            scenario.title,
            async ({ page, cartPage, resetCart, makeAxeBuilder }) => {
                // eslint-disable-next-line playwright/no-skipped-test
                test.skip(
                    Boolean(scenario.skipReason),
                    scenario.skipReason ?? ''
                );

                await scenario.setup({ page, cartPage, resetCart });

                const scanResults = await makeAxeBuilder()
                    .disableRules(scenario.disableRules ?? [])
                    .analyze();
                const violations = formatAxeViolations(scanResults.violations);

                expect(
                    violations,
                    `Found ${violations.length} accessibility violations`
                ).toEqual([]);
            }
        );
    }
});
