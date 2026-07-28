import { expect, test } from '@fixtures/app';

import ORDER_DETAILS from '@test-data/static/order-details.json';

test.describe('checkout feature - step two: Order Summary', () => {
    test.describe('functional tests @regression', () => {
        test.beforeEach(async ({ checkoutStepTwoPage }) => {
            await checkoutStepTwoPage.open();
        });

        test(
            'checkout step two page loads successfully, display the cart items and the summary details',
            { tag: '@regression' },
            async ({ page, checkoutStepTwoPage }) => {
                await expect(page).toHaveURL(/checkout-step-two\.html/);
                await expect(
                    checkoutStepTwoPage.nav.headingTitle
                ).toBeVisible();

                const headingTitle =
                    await checkoutStepTwoPage.nav.getHeadingTitle();
                expect(headingTitle).toBe('Checkout: Overview');

                await expect(
                    checkoutStepTwoPage.getCartItemsCount()
                ).resolves.toBe(3);

                const orderSummaryDetails =
                    await checkoutStepTwoPage.getOrderSummaryDetails();
                expect(orderSummaryDetails).toEqual(ORDER_DETAILS[0]);

                await expect(checkoutStepTwoPage.finishButton).toBeVisible();
                await expect(checkoutStepTwoPage.cancelButton).toBeVisible();
            }
        );

        test(
            'verify cart items total calculation',
            { tag: ['@smoke', '@regression'] },
            async ({ checkoutStepTwoPage }) => {
                const expectedCartDetails = {
                    subtotal: 89.97,
                    tax: 7.2,
                    total: 97.17,
                };

                const cartItems = await checkoutStepTwoPage.listAllCartItems();
                const cartDetails =
                    checkoutStepTwoPage.calculateTotalsFromItems(cartItems);

                expect(cartDetails).toEqual(expectedCartDetails);
            }
        );

        test(
            'the Finish button successfully navigates the user to the Checkout Complete page',
            { tag: ['@smoke', '@regression'] },
            async ({ page, checkoutStepTwoPage }) => {
                await checkoutStepTwoPage.finishCheckout();
                await expect(page).toHaveURL(/checkout-complete\.html/);
            }
        );

        test(
            'the Cancel button successfully returns the user to the inventory page with their current cart state preserved',
            { tag: '@regression' },
            async ({ page, inventoryPage, checkoutStepTwoPage }) => {
                const cartCountBefore =
                    await checkoutStepTwoPage.nav.getCartCount();

                await checkoutStepTwoPage.cancelCheckout();

                await expect(page).toHaveURL(/inventory\.html/);
                await expect(inventoryPage.nav.getCartCount()).resolves.toBe(
                    cartCountBefore
                );
            }
        );
    });
});
