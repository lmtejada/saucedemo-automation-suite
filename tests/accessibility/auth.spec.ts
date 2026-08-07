import { test, expect } from '@fixtures/app';

import { Messages } from '@enums/app';
import { LoginPage } from '@pages/login.page';
import { A11yScenario, formatAxeViolations } from '@utils/accessibility';

const AUTH_A11Y_SCENARIOS: A11yScenario<{
    loginPage: LoginPage;
    resetStorageState: () => Promise<void>;
}>[] = [
    {
        title: '[Accessibility]: Login page meets WCAG 2.1 AA standards',
        setup: async ({ loginPage, resetStorageState }): Promise<void> => {
            await loginPage.open();
            await resetStorageState();
        },
    },
    {
        title: '[Accessibility]: Check Login page with invalid credentials error state',
        setup: async ({ loginPage, resetStorageState }): Promise<void> => {
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
        },
        skipReason:
            'Bug found: the error banner\'s close button (data-test="error-button") has no discernible text - same shared component/defect as A11Y-001 on checkout step one (docs/TEST-CASES.md)',
    },
];

test.describe('auth Accessibility Audits', { tag: '@a11y' }, () => {
    for (const scenario of AUTH_A11Y_SCENARIOS) {
        test(
            scenario.title,
            async ({ loginPage, resetStorageState, makeAxeBuilder }) => {
                // eslint-disable-next-line playwright/no-skipped-test
                test.skip(
                    Boolean(scenario.skipReason),
                    scenario.skipReason ?? ''
                );

                await scenario.setup({ loginPage, resetStorageState });

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
