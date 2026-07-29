import { expect, test } from '@fixtures/app';

import { FORM_DEFAULT_DATA } from '@test-data/factories/checkout-customer-form.factory';
import { parsePriceString } from '@utils/common';

import INVENTORY_PRODUCTS from '@test-data/static/products.json';

test.describe('checkout journey @e2e', () => {
    test.describe('single-item purchase journey @e2e', () => {
        test.beforeEach(async ({ inventoryPage }) => {
            await inventoryPage.open();
        });

        test(
            '[TC-012]: Complete full checkout purchase flow',
            { tag: '@e2e' },
            async ({
                inventoryPage,
                cartPage,
                checkoutStepOnePage,
                checkoutStepTwoPage,
                checkoutCompletePage,
            }) => {
                const product = INVENTORY_PRODUCTS[5];
                const inventoryItem =
                    await inventoryPage.getInventoryItemByName(product.name);
                await inventoryItem!.addToCart();

                // Navigate to Cart and check Item
                await cartPage.nav.goToShoppingCart();
                const cartItems = await cartPage.listAllCartItems();
                expect(cartItems).toEqual([{ ...product, quantity: 1 }]);
                await cartPage.checkout();

                // Complete Step One Form
                await checkoutStepOnePage.fillForm(FORM_DEFAULT_DATA);
                await checkoutStepOnePage.continueCheckout();

                // Verify Step Two Calculations & Finish
                const orderSummaryDetails =
                    await checkoutStepTwoPage.getOrderSummaryDetails();

                expect(parsePriceString(orderSummaryDetails.subtotal)).toBe(
                    15.99
                );
                expect(parsePriceString(orderSummaryDetails.tax)).toBe(1.28);
                expect(parsePriceString(orderSummaryDetails.total)).toBe(17.27);

                await checkoutStepTwoPage.finishCheckout();

                // Assert Final Confirmation
                expect(await checkoutCompletePage.getHeaderText()).toBe(
                    'Thank you for your order!'
                );
            }
        );
    });

    test.describe('multi-item purchase journey @e2e', () => {
        const productsToAdd = [
            INVENTORY_PRODUCTS[0],
            INVENTORY_PRODUCTS[3],
            INVENTORY_PRODUCTS[4],
        ];

        test.beforeEach(async ({ inventoryPage }) => {
            // Add products on inventory page
            await inventoryPage.open();

            for (const product of productsToAdd) {
                const inventoryItem =
                    await inventoryPage.getInventoryItemByName(product.name);
                await inventoryItem!.addToCart();
            }
        });

        test(
            '[TC-022]: Complete full checkout purchase flow',
            { tag: '@e2e' },
            async ({
                cartPage,
                checkoutStepOnePage,
                checkoutStepTwoPage,
                checkoutCompletePage,
            }) => {
                // Navigate through Cart
                await cartPage.nav.goToShoppingCart();
                await expect(cartPage.cartItems).toHaveCount(
                    productsToAdd.length
                );
                await cartPage.checkout();

                // Complete Step One Form
                await checkoutStepOnePage.fillForm(FORM_DEFAULT_DATA);
                await checkoutStepOnePage.continueCheckout();

                // Verify Step Two Calculations & Finish
                const orderSummaryDetails =
                    await checkoutStepTwoPage.getOrderSummaryDetails();

                expect(parsePriceString(orderSummaryDetails.subtotal)).toBe(
                    87.97
                );
                expect(parsePriceString(orderSummaryDetails.tax)).toBe(7.04);
                expect(parsePriceString(orderSummaryDetails.total)).toBe(95.01);

                await checkoutStepTwoPage.finishCheckout();

                // Assert Final Confirmation
                expect(await checkoutCompletePage.getHeaderText()).toBe(
                    'Thank you for your order!'
                );
            }
        );

        test(
            '[TC-023]: Abandon checkout on Step One & resume',
            { tag: '@e2e' },
            async ({
                cartPage,
                checkoutStepOnePage,
                checkoutStepTwoPage,
                checkoutCompletePage,
            }) => {
                // Navigate through Cart
                await cartPage.nav.goToShoppingCart();
                await expect(cartPage.cartItems).toHaveCount(
                    productsToAdd.length
                );

                // Get Cart State and Start Checkout
                const cartItemsBefore = await cartPage.listAllCartItems();
                await cartPage.checkout();

                // Abandon checkout on Step One Page and check Cart State
                await checkoutStepOnePage.cancelCheckout();
                const cartItemsAfter = await cartPage.listAllCartItems();
                expect(cartItemsAfter).toEqual(cartItemsBefore);
                expect(await cartPage.getCartItemsCount()).toBe(3);

                // Resume checkout from Cart Page
                await cartPage.checkout();

                // Complete Step One Form
                await checkoutStepOnePage.fillForm(FORM_DEFAULT_DATA);
                await checkoutStepOnePage.continueCheckout();

                // Verify Step Two Calculations & Finish
                const orderSummaryDetails =
                    await checkoutStepTwoPage.getOrderSummaryDetails();

                expect(parsePriceString(orderSummaryDetails.subtotal)).toBe(
                    87.97
                );
                expect(parsePriceString(orderSummaryDetails.tax)).toBe(7.04);
                expect(parsePriceString(orderSummaryDetails.total)).toBe(95.01);

                await checkoutStepTwoPage.finishCheckout();

                // Assert Final Confirmation
                expect(await checkoutCompletePage.getHeaderText()).toBe(
                    'Thank you for your order!'
                );
            }
        );

        test(
            '[TC-023]: Abandon checkout on Step Two & resume',
            { tag: '@e2e' },
            async ({
                cartPage,
                checkoutStepOnePage,
                checkoutStepTwoPage,
                checkoutCompletePage,
            }) => {
                // Navigate through Cart
                await cartPage.nav.goToShoppingCart();
                await expect(cartPage.cartItems).toHaveCount(
                    productsToAdd.length
                );

                // Get Cart State and start checkout
                const cartItemsBefore = await cartPage.listAllCartItems();
                await cartPage.checkout();

                // Complete Step One Form
                await checkoutStepOnePage.fillForm(FORM_DEFAULT_DATA);
                await checkoutStepOnePage.continueCheckout();

                // Abandon checkout on Step Two Page and check Cart State
                await checkoutStepTwoPage.cancelCheckout();
                await cartPage.nav.goToShoppingCart();
                const cartItemsAfter = await cartPage.listAllCartItems();
                expect(cartItemsAfter).toEqual(cartItemsBefore);
                expect(await cartPage.getCartItemsCount()).toBe(3);

                // Resume checkout from Cart Page
                await cartPage.checkout();

                // Filled shipping form data again
                await checkoutStepOnePage.fillForm(FORM_DEFAULT_DATA);
                await checkoutStepOnePage.continueCheckout();

                // Verify Step Two Calculations & Finish
                const orderSummaryDetails =
                    await checkoutStepTwoPage.getOrderSummaryDetails();

                expect(parsePriceString(orderSummaryDetails.subtotal)).toBe(
                    87.97
                );
                expect(parsePriceString(orderSummaryDetails.tax)).toBe(7.04);
                expect(parsePriceString(orderSummaryDetails.total)).toBe(95.01);

                await checkoutStepTwoPage.finishCheckout();

                // Assert Final Confirmation
                expect(await checkoutCompletePage.getHeaderText()).toBe(
                    'Thank you for your order!'
                );
            }
        );

        test(
            '[TC-023]: Abandon checkout on Step Two, check filled form data & resume',
            { tag: '@e2e' },
            async ({
                cartPage,
                checkoutStepOnePage,
                checkoutStepTwoPage,
                checkoutCompletePage,
            }) => {
                // eslint-disable-next-line playwright/no-skipped-test
                test.skip(
                    true,
                    'Bug found: Filled form data is not preserved after aborting the checkout'
                );

                // Navigate through Cart
                await cartPage.nav.goToShoppingCart();
                await expect(cartPage.cartItems).toHaveCount(
                    productsToAdd.length
                );

                // Get Cart State and start checkout
                const cartItemsBefore = await cartPage.listAllCartItems();
                await cartPage.checkout();

                // Complete Step One Form
                await checkoutStepOnePage.fillForm(FORM_DEFAULT_DATA);
                await checkoutStepOnePage.continueCheckout();

                // Abandon checkout on Step Two Page and check Cart State
                await checkoutStepTwoPage.cancelCheckout();
                await cartPage.nav.goToShoppingCart();
                const cartItemsAfter = await cartPage.listAllCartItems();
                expect(cartItemsAfter).toEqual(cartItemsBefore);
                expect(await cartPage.getCartItemsCount()).toBe(3);

                // Resume checkout from Cart Page
                await cartPage.checkout();

                // Check shipping form is already filled and continue
                const filledFormData =
                    await checkoutStepOnePage.getFilledFormData();
                expect(filledFormData).toEqual(FORM_DEFAULT_DATA);
                await checkoutStepOnePage.continueCheckout();

                // Verify Step Two Calculations & Finish
                const orderSummaryDetails =
                    await checkoutStepTwoPage.getOrderSummaryDetails();

                expect(parsePriceString(orderSummaryDetails.subtotal)).toBe(
                    87.97
                );
                expect(parsePriceString(orderSummaryDetails.tax)).toBe(7.04);
                expect(parsePriceString(orderSummaryDetails.total)).toBe(95.01);

                await checkoutStepTwoPage.finishCheckout();

                // Assert Final Confirmation
                expect(await checkoutCompletePage.getHeaderText()).toBe(
                    'Thank you for your order!'
                );
            }
        );
    });
});
