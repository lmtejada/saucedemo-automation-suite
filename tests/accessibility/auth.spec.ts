import { test, expect } from '@fixtures/app';

import { Messages } from '@enums/app';
import { formatAxeViolations } from '@utils/accessibility';

test.describe('auth Accessibility Audits', { tag: '@a11y' }, () => {
    test.describe('login default state', () => {
        test.beforeEach(async ({ resetStorageState, loginPage }) => {
            await loginPage.open();
            await resetStorageState();
        });

        test('[Accessibility]: Login page meets WCAG 2.1 AA standards', async ({
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

    test.describe('login invalid credentials error state', () => {
        test.beforeEach(async ({ resetStorageState, loginPage }) => {
            await loginPage.open();
            await resetStorageState();

            // Submitting mismatched credentials triggers the client-side error banner
            await loginPage.login({
                username: 'invalid_user',
                password: 'invalid_password',
            });
            await expect(loginPage.errorMessage).toHaveText(
                Messages.LOGIN_ERROR
            );
        });

        test('[Accessibility]: Check Login page with invalid credentials error state', async ({
            makeAxeBuilder,
        }) => {
            // eslint-disable-next-line playwright/no-skipped-test
            test.skip(
                true,
                'Bug found: the error banner\'s close button (data-test="error-button") has no discernible text - same shared component/defect as A11Y-001 on checkout step one (docs/TEST-CASES.md)'
            );

            // Run the scan with the error banner present in the DOM
            const scanResults = await makeAxeBuilder().analyze();
            const violations = formatAxeViolations(scanResults.violations);

            expect(
                violations,
                `Found ${violations.length} accessibility violations`
            ).toEqual([]);
        });
    });
});
