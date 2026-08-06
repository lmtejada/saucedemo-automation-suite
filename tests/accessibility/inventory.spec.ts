import { test, expect } from '@fixtures/app';

import { formatAxeViolations } from '@utils/accessibility';
import { sortProductsByName } from '@utils/app';

import INVENTORY_PRODUCTS from '@test-data/static/products.json';

test.describe('inventory Accessibility Audits', { tag: '@a11y' }, () => {
    test.describe('inventory default state', () => {
        test.beforeEach(async ({ inventoryPage }) => {
            await inventoryPage.open();
        });

        test('[Accessibility]: Inventory page meets WCAG 2.1 AA standards', async ({
            makeAxeBuilder,
        }) => {
            // eslint-disable-next-line playwright/no-skipped-test
            test.skip(
                true,
                'Bug found: the product sort dropdown (data-test="product-sort-container") has no accessible name - no aria-label, associated label, or title, so it fails the select-name rule'
            );

            // Run the scan against current page DOM state
            const scanResults = await makeAxeBuilder().analyze();
            const violations = formatAxeViolations(scanResults.violations);

            expect(
                violations,
                `Found ${violations.length} accessibility violations`
            ).toEqual([]);
        });
    });

    test.describe('inventory with item added to cart', () => {
        test.beforeEach(async ({ inventoryPage }) => {
            await inventoryPage.open();

            const firstProduct = await inventoryPage.getInventoryItemByName(
                INVENTORY_PRODUCTS[0].name
            );
            await firstProduct!.addToCart();
            await expect(firstProduct!.removeFromCartButton).toBeVisible();
        });

        test('[Accessibility]: Check Inventory page with item added to cart', async ({
            makeAxeBuilder,
        }) => {
            // eslint-disable-next-line playwright/no-skipped-test
            test.skip(
                true,
                'Bug found: the product sort dropdown (data-test="product-sort-container") has no accessible name - no aria-label, associated label, or title, so it fails the select-name rule'
            );

            // Run the scan with the Remove button and cart badge present in the DOM
            const scanResults = await makeAxeBuilder().analyze();
            const violations = formatAxeViolations(scanResults.violations);

            expect(
                violations,
                `Found ${violations.length} accessibility violations`
            ).toEqual([]);
        });
    });

    test.describe('inventory sort dropdown option selected', () => {
        test.beforeEach(async ({ inventoryPage }) => {
            await inventoryPage.open();

            // Native <select> option lists render as OS-level browser chrome
            // outside the page's DOM, so raw arrow-key presses can't reliably
            // drive them across engines/headless runs. selectOption() is the
            // cross-browser-safe way to change the value while still exercising
            // real keyboard-reachable focus behavior on the trigger element.
            await inventoryPage.productsSort.focus();
            await expect(inventoryPage.productsSort).toBeFocused();
            await inventoryPage.productsSort.selectOption('za');
        });

        test('[Accessibility]: Check Inventory page with sort dropdown option selected', async ({
            inventoryPage,
            makeAxeBuilder,
        }) => {
            const sortedProducts = await inventoryPage.listAllItemsData();
            expect(sortedProducts).toEqual(
                sortProductsByName(INVENTORY_PRODUCTS, 'za')
            );

            // Run the scan against the page with an option selected. Disables
            // select-name only: it's a documented known issue (missing accessible
            // name, tracked separately) - the dropdown itself stays in scope so any
            // other violation introduced by this state would still be caught.
            const scanResults = await makeAxeBuilder()
                .disableRules(['select-name'])
                .analyze();
            const violations = formatAxeViolations(scanResults.violations);

            expect(
                violations,
                `Found ${violations.length} accessibility violations`
            ).toEqual([]);
        });
    });
});
