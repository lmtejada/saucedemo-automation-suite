import { expect, test } from '@fixtures/app';

import {
    FORM_DEFAULT_DATA,
    VALIDATION_SCENARIOS,
} from '@test-data/factories/checkout-customer-form.factory';

test.describe('checkout feature - step one: shipping form', () => {
    test.describe('functional tests @regression', () => {
        test.beforeEach(async ({ checkoutStepOnePage }) => {
            await checkoutStepOnePage.open();
        });

        test(
            'checkout step one page loads successfully and displays the shipping form',
            { tag: '@regression' },
            async ({ page, checkoutStepOnePage }) => {
                await expect(page).toHaveURL(/checkout-step-one\.html/);
                await expect(
                    checkoutStepOnePage.nav.headingTitle
                ).toBeVisible();

                const headingTitle =
                    await checkoutStepOnePage.nav.getHeadingTitle();
                expect(headingTitle).toBe('Checkout: Your Information');

                await expect(checkoutStepOnePage.formContainer).toBeVisible();
                await expect(
                    checkoutStepOnePage.getFormInputCount()
                ).resolves.toBe(3);

                await expect(checkoutStepOnePage.continueButton).toBeVisible();
                await expect(checkoutStepOnePage.cancelButton).toBeVisible();
            }
        );

        test(
            'filling the form and clicking the Continue button successfully leads user to checkout step two page',
            { tag: ['@smoke', '@regression'] },
            async ({ page, checkoutStepOnePage }) => {
                await checkoutStepOnePage.fillForm(FORM_DEFAULT_DATA);
                expect(await checkoutStepOnePage.getFilledFormData()).toEqual(
                    FORM_DEFAULT_DATA
                );

                await checkoutStepOnePage.continueCheckout();
                await expect(page).toHaveURL(/checkout-step-two\.html/);
            }
        );

        test(
            'the Cancel button successfully returns the user to the cart page with their current cart state preserved',
            { tag: '@regression' },
            async ({ page, cartPage, checkoutStepOnePage }) => {
                const cartCountBefore =
                    await checkoutStepOnePage.nav.getCartCount();

                await checkoutStepOnePage.cancelCheckout();

                await expect(page).toHaveURL(/cart\.html/);
                await expect(cartPage.nav.getCartCount()).resolves.toBe(
                    cartCountBefore
                );
                await expect(cartPage.getCartItemsCount()).resolves.toBe(
                    cartCountBefore
                );
            }
        );
    });

    test.describe('validation scenarios @regression', () => {
        test.beforeEach(async ({ checkoutStepOnePage }) => {
            await checkoutStepOnePage.open();
        });

        for (const scenario of VALIDATION_SCENARIOS) {
            test(
                `validation: ${scenario.description}`,
                { tag: '@regression' },
                async ({ checkoutStepOnePage }) => {
                    // Skips the test automatically if scenario.skip is truthy
                    // eslint-disable-next-line playwright/no-skipped-test
                    test.skip(
                        Boolean(scenario.skip),
                        `Skipped: ${scenario.skipReason || 'Scenario marked as skipped'}`
                    );

                    await checkoutStepOnePage.fillForm(scenario.data);
                    await checkoutStepOnePage.continueCheckout();

                    // Assert error banner displays the correct message
                    await expect(checkoutStepOnePage.errorMessage).toHaveText(
                        scenario.expectedError
                    );
                }
            );
        }
    });
});
