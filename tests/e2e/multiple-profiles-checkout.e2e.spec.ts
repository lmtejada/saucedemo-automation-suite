import { expect, test } from '@fixtures/app';

import { StorageStatePaths } from '@enums/app';
import { FORM_DEFAULT_DATA } from '@test-data/factories/checkout-customer-form.factory';

import INVENTORY_PRODUCTS from '@test-data/static/products.json';

test.describe('checkout journey with multiple users profile @e2e', () => {
    test.describe('performance user @e2e', () => {
        test.use({ storageState: StorageStatePaths.PERFORMANCE_USER });

        test.beforeEach(async ({ inventoryPage }) => {
            await inventoryPage.open();
        });

        test(
            '[TC-026]: Full purchase journey for `performance_glitch_user` within SLA',
            { tag: ['@e2e', '@performance', '@problematic'] },
            async ({
                page,
                inventoryPage,
                cartPage,
                checkoutStepOnePage,
                checkoutStepTwoPage,
            }) => {
                const SLA_THRESHOLD_MS = 15000; // 15 seconds for the full funnel

                const product = INVENTORY_PRODUCTS[0];
                const startTime = Date.now();

                // Add item to cart
                const inventoryItem =
                    await inventoryPage.getInventoryItemByName(product.name);
                await inventoryItem!.addToCart();

                // Proceed through the full checkout funnel
                await inventoryPage.nav.goToShoppingCart();
                await cartPage.checkout();
                await expect(page).toHaveURL(/checkout-step-one\.html/);

                await checkoutStepOnePage.fillForm(FORM_DEFAULT_DATA);
                await checkoutStepOnePage.continueCheckout();
                await expect(page).toHaveURL(/checkout-step-two\.html/);

                await checkoutStepTwoPage.finishCheckout();
                await expect(page).toHaveURL(/checkout-complete\.html/);

                // Assert Checkout duration
                const duration = Date.now() - startTime;
                expect(duration).toBeLessThan(SLA_THRESHOLD_MS);
            }
        );
    });

    test.describe('problem user @e2e', () => {
        test.use({ storageState: StorageStatePaths.PROBLEM_USER });

        test.beforeEach(async ({ inventoryPage }) => {
            await inventoryPage.open();
        });

        test(
            '[TC-028]: Complete full checkout purchase flow',
            { tag: ['@e2e', '@problematic'] },
            async ({
                page,
                inventoryPage,
                cartPage,
                checkoutStepOnePage,
                checkoutStepTwoPage,
            }) => {
                // eslint-disable-next-line playwright/no-skipped-test
                test.skip(
                    true,
                    'Bug found: shipping form mis-fills for problem_user, blocking checkout at step one'
                );

                const product = INVENTORY_PRODUCTS[0];

                // Add item to cart
                const inventoryItem =
                    await inventoryPage.getInventoryItemByName(product.name);
                await inventoryItem!.addToCart();

                // Proceed through the full checkout funnel
                await inventoryPage.nav.goToShoppingCart();
                await cartPage.checkout();
                await expect(page).toHaveURL(/checkout-step-one\.html/);

                await checkoutStepOnePage.fillForm(FORM_DEFAULT_DATA);
                await checkoutStepOnePage.continueCheckout();
                await expect(page).toHaveURL(/checkout-step-two\.html/);

                await checkoutStepTwoPage.finishCheckout();
                await expect(page).toHaveURL(/checkout-complete\.html/);
            }
        );
    });
});
