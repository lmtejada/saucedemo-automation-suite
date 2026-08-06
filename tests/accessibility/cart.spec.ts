import { test, expect } from '@fixtures/app';

import { StorageStatePaths } from '@enums/app';
import { formatAxeViolations } from '@utils/accessibility';

test.describe('cart Accessibility Audits', { tag: '@a11y' }, () => {
    // This suite exercises a pre-filled cart, so it opts into the seeded cart state.
    test.use({ storageState: StorageStatePaths.CART });

    test.describe('cart with items', () => {
        test.beforeEach(async ({ cartPage }) => {
            await cartPage.open();
        });

        test('[Accessibility]: Cart page with items meets WCAG 2.1 AA standards', async ({
            makeAxeBuilder,
        }) => {
            // Run the scan against current page DOM state
            const scanResults = await makeAxeBuilder().analyze();
            const violations = formatAxeViolations(scanResults.violations);

            expect(
                violations,
                `Found ${violations.length} accessibility violations`
            ).toEqual([]);
        });
    });

    test.describe('cart empty state', () => {
        test.beforeEach(async ({ page, cartPage, resetCart }) => {
            await cartPage.open();
            await resetCart();
            await page.reload();
            await cartPage.pageContainer.waitFor({ state: 'visible' });
        });

        test('[Accessibility]: Check Cart page empty state', async ({
            makeAxeBuilder,
        }) => {
            // Run the scan against current page DOM state
            const scanResults = await makeAxeBuilder().analyze();
            const violations = formatAxeViolations(scanResults.violations);

            expect(
                violations,
                `Found ${violations.length} accessibility violations`
            ).toEqual([]);
        });
    });
});
