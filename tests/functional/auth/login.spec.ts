import { expect, test } from '@fixtures/app';

import { Messages } from '@enums/app';

import USERS_CREDENTIALS from '@test-data/static/users.json';

/**
 * Mapping different invalid login scenarios to their expected error messages for validation purposes.
 */
const EXPECTED_ERROR_BY_DESCRIPTION: Record<string, Messages> = {
    'empty credentials': Messages.LOGIN_ERROR_EMPTY_USERNAME,
    'empty username': Messages.LOGIN_ERROR_EMPTY_USERNAME,
    'empty password': Messages.LOGIN_ERROR_EMPTY_PASSWORD,
    'invalid credentials': Messages.LOGIN_ERROR,
    'invalid password': Messages.LOGIN_ERROR,
    'locked out user': Messages.LOGIN_ERROR_LOCKED_OUT,
};

test.describe('authentication feature', () => {
    test.beforeEach(async ({ resetStorageState, loginPage }) => {
        await loginPage.open();
        await resetStorageState();
    });

    test.describe('functional tests @regression', () => {
        test(
            'successful login as standard_user',
            { tag: ['@smoke', '@regression'] },
            async ({ page, loginPage }) => {
                await loginPage.login({
                    username: process.env.USER_NAME!,
                    password: process.env.USER_PASSWORD!,
                });

                await expect(page).toHaveURL(/inventory\.html/);
            }
        );

        for (const { username, password, description } of USERS_CREDENTIALS) {
            test(
                `error message on invalid credentials - ${description}`,
                { tag: '@regression' },
                async ({ loginPage }) => {
                    await loginPage.login({
                        username,
                        password: password ?? process.env.USER_PASSWORD!,
                    });

                    await expect(loginPage.errorMessage).toHaveText(
                        EXPECTED_ERROR_BY_DESCRIPTION[description]
                    );
                }
            );
        }
    });

    test.describe('security tests @security', () => {
        test(
            'redirect unauthenticated user attempting to bypass to /inventory.html',
            { tag: ['@security', '@regression'] },
            async ({ page, loginPage }) => {
                await page.goto(`${process.env.APP_URL}/inventory.html`);

                await expect(loginPage.errorMessage).toHaveText(
                    Messages.LOGIN_REQUIRED
                );
                await expect(page).not.toHaveURL(/inventory\.html/);
            }
        );
    });

    test.describe('performance SLA tests @performance', () => {
        test(
            'login latency check for performance_glitch_user',
            { tag: ['@performance', '@problematic'] },
            async ({ page, loginPage }) => {
                const SLA_THRESHOLD_MS = 10000; // 10 seconds

                const startTime = Date.now();
                await loginPage.login({
                    username: 'performance_glitch_user',
                    password: process.env.USER_PASSWORD!,
                });
                await page.waitForURL(`${process.env.APP_URL}/inventory.html`);
                const duration = Date.now() - startTime;

                await expect(page).toHaveURL(/inventory\.html/);
                expect(duration).toBeLessThan(SLA_THRESHOLD_MS);
            }
        );
    });
});
