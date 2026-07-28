import { expect, test } from '@fixtures/app';

import { StorageStatePaths } from '@enums/app';

test.describe('checkout feature - Order Complete', () => {
    test.describe('functional tests @regression', () => {
        // This suite exercises the completion page reached from a pre-filled cart, so it opts into the seeded cart state.
        test.use({ storageState: StorageStatePaths.CART });

        test.beforeEach(async ({ checkoutCompletePage }) => {
            await checkoutCompletePage.open();
        });

        test(
            '[Regression]: checkout complete page loads successfully',
            { tag: '@regression' },
            async ({ page, checkoutCompletePage }) => {
                await expect(page).toHaveURL(/checkout-complete\.html/);
                await expect(
                    checkoutCompletePage.nav.headingTitle
                ).toBeVisible();

                expect(await checkoutCompletePage.nav.getHeadingTitle()).toBe(
                    'Checkout: Complete!'
                );
                expect(await checkoutCompletePage.getHeaderText()).toBe(
                    'Thank you for your order!'
                );
                expect(await checkoutCompletePage.getContentText()).toBe(
                    'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
                );

                await expect(checkoutCompletePage.backHomeButton).toBeVisible();
            }
        );

        test(
            '[Regression]: the Back Home button successfully returns the user to the inventory page',
            { tag: '@regression' },
            async ({ page, checkoutCompletePage }) => {
                await checkoutCompletePage.navigateToHome();
                await expect(page).toHaveURL(/inventory\.html/);
            }
        );
    });
});
