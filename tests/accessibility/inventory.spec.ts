import { test, expect } from '@fixtures/app';

import { InventoryDetailsPage } from '@pages/inventory-details.page';
import { InventoryPage } from '@pages/inventory.page';
import { A11yScenario, formatAxeViolations } from '@utils/accessibility';
import { sortProductsByName } from '@utils/app';

import INVENTORY_PRODUCTS from '@test-data/static/products.json';

const SORT_DROPDOWN_MISSING_NAME_BUG =
    'Bug found: the product sort dropdown (data-test="product-sort-container") has no accessible name - no aria-label, associated label, or title, so it fails the select-name rule';

const INVENTORY_A11Y_SCENARIOS: A11yScenario<{
    inventoryPage: InventoryPage;
    inventoryDetailsPage: InventoryDetailsPage;
}>[] = [
    {
        title: '[Accessibility]: Inventory page meets WCAG 2.1 AA standards',
        setup: async ({ inventoryPage }): Promise<void> => {
            await inventoryPage.open();
        },
        skipReason: SORT_DROPDOWN_MISSING_NAME_BUG,
    },
    {
        title: '[Accessibility]: Check Inventory page with item added to cart',
        setup: async ({ inventoryPage }): Promise<void> => {
            await inventoryPage.open();

            const firstProduct = await inventoryPage.getInventoryItemByName(
                INVENTORY_PRODUCTS[0].name
            );
            await firstProduct!.addToCart();
            await expect(firstProduct!.removeFromCartButton).toBeVisible();
        },
        skipReason: SORT_DROPDOWN_MISSING_NAME_BUG,
    },
    {
        title: '[Accessibility]: Check Inventory page with sort dropdown option selected',
        setup: async ({ inventoryPage }): Promise<void> => {
            await inventoryPage.open();

            // Native <select> option lists render as OS-level browser chrome
            // outside the page's DOM, so raw arrow-key presses can't reliably
            // drive them across engines/headless runs. selectOption() is the
            // cross-browser-safe way to change the value while still exercising
            // real keyboard-reachable focus behavior on the trigger element.
            await inventoryPage.productsSort.focus();
            await expect(inventoryPage.productsSort).toBeFocused();
            await inventoryPage.productsSort.selectOption('za');

            const sortedProducts = await inventoryPage.listAllItemsData();
            expect(sortedProducts).toEqual(
                sortProductsByName(INVENTORY_PRODUCTS, 'za')
            );
        },
        // Disables select-name only: it's a documented known issue (missing
        // accessible name, tracked separately) - the dropdown itself stays in
        // scope so any other violation introduced by this state is still caught.
        disableRules: ['select-name'],
    },
    {
        title: '[Accessibility]: Inventory item detail page meets WCAG 2.1 AA standards',
        setup: async ({ inventoryDetailsPage }): Promise<void> => {
            await inventoryDetailsPage.open(4);
        },
    },
    {
        title: '[Accessibility]: Check Inventory item detail page with an ITEM NOT FOUND state',
        setup: async ({ inventoryDetailsPage }): Promise<void> => {
            await inventoryDetailsPage.open(999);
            await expect(inventoryDetailsPage.isItemNotFound()).resolves.toBe(
                true
            );
        },
    },
];

test.describe('inventory Accessibility Audits', { tag: '@a11y' }, () => {
    for (const scenario of INVENTORY_A11Y_SCENARIOS) {
        test(
            scenario.title,
            async ({ inventoryPage, inventoryDetailsPage, makeAxeBuilder }) => {
                // eslint-disable-next-line playwright/no-skipped-test
                test.skip(
                    Boolean(scenario.skipReason),
                    scenario.skipReason ?? ''
                );

                await scenario.setup({ inventoryPage, inventoryDetailsPage });

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
