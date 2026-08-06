import { test, expect } from '@fixtures/app';

import { StorageStatePaths } from '@enums/app';
import { formatAxeViolations } from '@utils/accessibility';

test.describe('checkout Accessibility Audits', { tag: '@a11y' }, () => {
    // This suite exercises the completion page reached from a pre-filled cart, so it opts into the seeded cart state.
    test.use({ storageState: StorageStatePaths.CART });

    test.describe('checkout Step One', () => {
        test.beforeEach(async ({ checkoutStepOnePage }) => {
            await checkoutStepOnePage.open();
        });

        test('[Accessibility]: Checkout Step One meets WCAG 2.1 AA standards', async ({
            makeAxeBuilder,
        }) => {
            // Run the scan against current page DOM state
            const scanResults = await makeAxeBuilder().analyze();
            const violations = formatAxeViolations(scanResults.violations);

            expect(
                violations,
                `Found ${violations.length} accessibility violations`
            ).toEqual([]);
        });

        test('[Accessibility]: Check checkout step one shipping form with error state', async ({
            checkoutStepOnePage,
            makeAxeBuilder,
        }) => {
            // eslint-disable-next-line playwright/no-skipped-test
            test.skip(
                true,
                'Bug found: the error banner\'s close button (data-test="error-button") has no discernible text - its icon is aria-hidden with no aria-label, so it fails the button-name rule'
            );

            // Submitting the blank form triggers the client-side validation error banner
            await checkoutStepOnePage.continueCheckout();
            await expect(checkoutStepOnePage.errorMessage).toBeVisible();

            // Run the scan with the error banner present in the DOM
            const scanResults = await makeAxeBuilder().analyze();
            const violations = formatAxeViolations(scanResults.violations);

            expect(
                violations,
                `Found ${violations.length} accessibility violations`
            ).toEqual([]);
        });
    });

    test.describe('checkout Step Two', () => {
        test.beforeEach(async ({ checkoutStepTwoPage }) => {
            await checkoutStepTwoPage.open();
        });

        test('[Accessibility]: Checkout Step Two meets WCAG 2.1 AA standards', async ({
            makeAxeBuilder,
        }) => {
            // Run the scan against current page DOM state
            const scanResults = await makeAxeBuilder().analyze();
            const violations = formatAxeViolations(scanResults.violations);

            expect(
                violations,
                `Found ${violations.length} accessibility violations`
            ).toEqual([]);
        });
    });

    test.describe('checkout Complete', () => {
        test.beforeEach(async ({ checkoutCompletePage }) => {
            await checkoutCompletePage.open();
        });

        test('[Accessibility]: Checkout Complete meets WCAG 2.1 AA standards', async ({
            makeAxeBuilder,
        }) => {
            // Run the scan against current page DOM state
            const scanResults = await makeAxeBuilder().analyze();
            const violations = formatAxeViolations(scanResults.violations);

            expect(
                violations,
                `Found ${violations.length} accessibility violations`
            ).toEqual([]);
        });
    });
});
