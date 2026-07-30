/**
 * auth.setup.ts
 * Logs in to SauceDemo via the UI once and saves the resulting storage
 * state so the main test suite can start already authenticated.
 */

import { expect, test } from '@fixtures/app';

import { StorageStatePaths } from '@enums/app';

test.describe('auth setup', () => {
    test('authenticate as standard user', async ({ page, loginPage }) => {
        await loginPage.open();

        await loginPage.login({
            username: process.env.USER_NAME!,
            password: process.env.USER_PASSWORD!,
        });

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(page.getByTestId('inventory-container')).toBeVisible();

        await page.context().storageState({ path: StorageStatePaths.APP });
    });

    test('authenticate as performance_glitch_user', async ({
        page,
        loginPage,
    }) => {
        await loginPage.open();

        await loginPage.login({
            username: process.env.PERFORMANCE_USER_NAME!,
            password: process.env.USER_PASSWORD!,
        });

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(page.getByTestId('inventory-container')).toBeVisible();

        await page
            .context()
            .storageState({ path: StorageStatePaths.PERFORMANCE_USER });
    });

    test('authenticate as problem_user', async ({ page, loginPage }) => {
        await loginPage.open();

        await loginPage.login({
            username: process.env.PROBLEM_USER_NAME!,
            password: process.env.USER_PASSWORD!,
        });

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(page.getByTestId('inventory-container')).toBeVisible();

        await page
            .context()
            .storageState({ path: StorageStatePaths.PROBLEM_USER });
    });
});
