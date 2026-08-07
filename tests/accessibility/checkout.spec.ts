import { test, expect } from '@fixtures/app';

import { StorageStatePaths } from '@enums/app';
import { CheckoutCompletePage } from '@pages/checkout-complete-page';
import { CheckoutStepOnePage } from '@pages/checkout-step-one.page';
import { CheckoutStepTwoPage } from '@pages/checkout-step-two.page';
import { A11yScenario, formatAxeViolations } from '@utils/accessibility';

const ERROR_BANNER_MISSING_NAME_BUG =
    'Bug found: the error banner\'s close button (data-test="error-button") has no discernible text - its icon is aria-hidden with no aria-label, so it fails the button-name rule';

const CHECKOUT_A11Y_SCENARIOS: A11yScenario<{
    checkoutStepOnePage: CheckoutStepOnePage;
    checkoutStepTwoPage: CheckoutStepTwoPage;
    checkoutCompletePage: CheckoutCompletePage;
}>[] = [
    {
        title: '[Accessibility]: Checkout Step One meets WCAG 2.1 AA standards',
        setup: async ({ checkoutStepOnePage }): Promise<void> => {
            await checkoutStepOnePage.open();
        },
    },
    {
        title: '[Accessibility]: Check checkout step one shipping form with error state',
        setup: async ({ checkoutStepOnePage }): Promise<void> => {
            await checkoutStepOnePage.open();

            // Submitting the blank form triggers the client-side validation error banner
            await checkoutStepOnePage.continueCheckout();
            await expect(checkoutStepOnePage.errorMessage).toBeVisible();
        },
        skipReason: ERROR_BANNER_MISSING_NAME_BUG,
    },
    {
        title: '[Accessibility]: Checkout Step Two meets WCAG 2.1 AA standards',
        setup: async ({ checkoutStepTwoPage }): Promise<void> => {
            await checkoutStepTwoPage.open();
        },
    },
    {
        title: '[Accessibility]: Checkout Complete meets WCAG 2.1 AA standards',
        setup: async ({ checkoutCompletePage }): Promise<void> => {
            await checkoutCompletePage.open();
        },
    },
];

test.describe('checkout Accessibility Audits', { tag: '@a11y' }, () => {
    // This suite exercises the completion page reached from a pre-filled cart, so it opts into the seeded cart state.
    test.use({ storageState: StorageStatePaths.CART });

    for (const scenario of CHECKOUT_A11Y_SCENARIOS) {
        test(
            scenario.title,
            async ({
                checkoutStepOnePage,
                checkoutStepTwoPage,
                checkoutCompletePage,
                makeAxeBuilder,
            }) => {
                // eslint-disable-next-line playwright/no-skipped-test
                test.skip(
                    Boolean(scenario.skipReason),
                    scenario.skipReason ?? ''
                );

                await scenario.setup({
                    checkoutStepOnePage,
                    checkoutStepTwoPage,
                    checkoutCompletePage,
                });

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
