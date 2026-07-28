import { expect, test } from '@fixtures/app';

import { parsePriceString } from '@utils/common';

import INVENTORY_PRODUCTS from '@test-data/static/products.json';

test.describe('checkout journey @e2e', () => {
    test.beforeEach(async ({ inventoryPage }) => {
        await inventoryPage.open();
    });

    test(
        'complete full checkout purchase flow',
        { tag: '@e2e' },
        async ({
            inventoryPage,
            cartPage,
            checkoutStepOnePage,
            checkoutStepTwoPage,
            checkoutCompletePage,
        }) => {
            // Step 1: Add products on inventory page
            const productsToAdd = [
                INVENTORY_PRODUCTS[0],
                INVENTORY_PRODUCTS[3],
                INVENTORY_PRODUCTS[4],
            ];

            for (const product of productsToAdd) {
                const inventoryItem =
                    await inventoryPage.getInventoryItemByName(product.name);
                await inventoryItem!.addToCart();
            }

            // Step 2: Navigate through Cart
            await cartPage.nav.goToShoppingCart();
            await expect(cartPage.cartItems).toHaveCount(productsToAdd.length);
            await cartPage.checkout();

            // Step 3: Complete Step One Form
            await checkoutStepOnePage.fillForm({
                firstName: 'Laura',
                lastName: 'Doe',
                postalCode: '13583',
            });
            await checkoutStepOnePage.continueCheckout();

            // Step 4: Verify Step Two Calculations & Finish
            const orderSummaryDetails =
                await checkoutStepTwoPage.getOrderSummaryDetails();
            expect(parsePriceString(orderSummaryDetails.subtotal)).toBe(87.97);
            await checkoutStepTwoPage.finishCheckout();

            // Step 5: Assert Final Confirmation
            expect(await checkoutCompletePage.getHeaderText()).toBe(
                'Thank you for your order!'
            );
        }
    );
});
