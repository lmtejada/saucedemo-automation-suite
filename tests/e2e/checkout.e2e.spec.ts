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
                await expect(
                    checkoutCompletePage.getHeaderText()
                ).resolves.toBe('Thank you for your order!');
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
                await expect(
                    checkoutCompletePage.getHeaderText()
                ).resolves.toBe('Thank you for your order!');
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
                await expect(cartPage.getCartItemsCount()).resolves.toBe(3);

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
                await expect(
                    checkoutCompletePage.getHeaderText()
                ).resolves.toBe('Thank you for your order!');
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
                await expect(cartPage.getCartItemsCount()).resolves.toBe(3);

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
                await expect(
                    checkoutCompletePage.getHeaderText()
                ).resolves.toBe('Thank you for your order!');
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
                await expect(cartPage.getCartItemsCount()).resolves.toBe(3);

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
                await expect(
                    checkoutCompletePage.getHeaderText()
                ).resolves.toBe('Thank you for your order!');
            }
        );
    });

    test.describe('boundary testing in purchase journey @e2e', () => {
        const productsToAdd = [INVENTORY_PRODUCTS[1], INVENTORY_PRODUCTS[4]];

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
            '[TC-024]: Remove item mid-funnel, resume',
            { tag: '@e2e' },
            async ({
                cartPage,
                checkoutStepOnePage,
                checkoutStepTwoPage,
                checkoutCompletePage,
            }) => {
                // Navigate through Cart
                await cartPage.nav.goToShoppingCart();
                const cartItemsBefore = await cartPage.listAllCartItems();
                await expect(cartPage.nav.getCartCount()).resolves.toBe(
                    productsToAdd.length
                );
                await cartPage.checkout();

                // Cancel Checkout and check Cart Items state
                await checkoutStepOnePage.cancelCheckout();
                const cartItemsAfter = await cartPage.listAllCartItems();
                expect(cartItemsAfter).toEqual(cartItemsBefore);
                await expect(cartPage.nav.getCartCount()).resolves.toBe(
                    productsToAdd.length
                );

                // Remove Item from Cart
                const cartItemToRemove = await cartPage.getCartItemByName(
                    productsToAdd[0].name
                );
                await cartItemToRemove?.removeFromCart();

                // Check Cart State after Item removal
                const newCartItems = await cartPage.listAllCartItems();
                expect(newCartItems).toEqual(cartItemsBefore.toSpliced(0, 1));
                await expect(cartPage.nav.getCartCount()).resolves.toBe(
                    newCartItems.length
                );

                // Resume Checkout process
                await cartPage.checkout();

                // Complete Step One Form
                await checkoutStepOnePage.fillForm(FORM_DEFAULT_DATA);
                await checkoutStepOnePage.continueCheckout();

                // Verify Step Two Calculations & Finish
                const orderSummaryDetails =
                    await checkoutStepTwoPage.getOrderSummaryDetails();
                const expectedTotals =
                    checkoutStepTwoPage.calculateTotalsFromItems(newCartItems);

                expect(parsePriceString(orderSummaryDetails.subtotal)).toBe(
                    expectedTotals.subtotal
                );
                expect(parsePriceString(orderSummaryDetails.tax)).toBe(
                    expectedTotals.tax
                );
                expect(parsePriceString(orderSummaryDetails.total)).toBe(
                    expectedTotals.total
                );

                await checkoutStepTwoPage.finishCheckout();

                // Assert Final Confirmation
                await expect(
                    checkoutCompletePage.getHeaderText()
                ).resolves.toBe('Thank you for your order!');
            }
        );

        test(
            '[TC-025]: Post-purchase state reset',
            { tag: '@e2e' },
            async ({
                page,
                inventoryPage,
                cartPage,
                checkoutStepOnePage,
                checkoutStepTwoPage,
                checkoutCompletePage,
            }) => {
                // Complete Checkout Steps and Check users lands in Checkout Complete Page
                await cartPage.nav.goToShoppingCart();
                await cartPage.checkout();
                await expect(page).toHaveURL(/checkout-step-one\.html/);
                await checkoutStepOnePage.fillForm(FORM_DEFAULT_DATA);
                await checkoutStepOnePage.continueCheckout();
                await expect(page).toHaveURL(/checkout-step-two\.html/);
                await checkoutStepTwoPage.finishCheckout();
                await expect(page).toHaveURL(/checkout-complete\.html/);

                // Navigate to Home page and check cart badge status
                await checkoutCompletePage.navigateToHome();
                await expect(page).toHaveURL(/inventory\.html/);
                await expect(inventoryPage.nav.getCartCount()).resolves.toBe(0);

                // Navigate to Cart and check Cart page displays no items
                await inventoryPage.nav.goToShoppingCart();
                const cartItems = await cartPage.listAllCartItems();
                expect(cartItems).toEqual([]);
                await cartPage.continueShopping();

                // Start a fresh cart session
                const inventoryItem =
                    await inventoryPage.getInventoryItemByName(
                        INVENTORY_PRODUCTS[1].name
                    );
                await inventoryItem!.addToCart();

                // Check the cart contains only the new Item added
                await inventoryPage.nav.goToShoppingCart();
                const newCartItems = await cartPage.listAllCartItems();
                expect(newCartItems).toEqual([
                    {
                        ...INVENTORY_PRODUCTS[1],
                        quantity: 1,
                    },
                ]);
            }
        );

        test(
            '[TC-027]: Checkout should be blocked when the cart is empty',
            { tag: '@e2e' },
            async ({
                page,
                cartPage,
                checkoutStepOnePage,
                checkoutStepTwoPage,
                resetCart,
            }) => {
                // eslint-disable-next-line playwright/no-skipped-test
                test.skip(
                    true,
                    'Bug found: a user can complete the full checkout funnel with an empty order'
                );

                await resetCart();
                await cartPage.open();

                // Full steps kept for when the fix lands and this test is unskipped
                await cartPage.checkout();
                await expect(page).toHaveURL(/checkout-step-one\.html/);
                await checkoutStepOnePage.fillForm(FORM_DEFAULT_DATA);
                await checkoutStepOnePage.continueCheckout();
                await expect(page).toHaveURL(/checkout-step-two\.html/);
                await checkoutStepTwoPage.finishCheckout();

                // Checkout process should not be completed on an empty cart
                await expect(page).not.toHaveURL(/checkout-complete\.html/);
            }
        );
    });
});
