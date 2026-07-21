import { expect, test } from '@fixtures/app';

test.describe(
    'framework sanity check',
    { tag: ['@smoke', '@e2e', '@a11y'] },
    () => {
        test('playwright test runner initializes successfully', async () => {
            expect(true).toBe(true);
        });
    }
);

test.describe('visual rendering sanity check', { tag: '@visual' }, () => {
    test.beforeEach(async ({ page, loginPage }) => {
        await loginPage.open();

        // Enforce consistent viewport dimensions for visual tests
        await page.setViewportSize({ width: 1280, height: 720 });
    });

    test('login page - Core Layout Structure Renders', async ({ page }) => {
        // High-level visual snapshot check
        await expect(page).toHaveScreenshot('login-page-render.png');
    });

    test('inventory page - Primary Structural Layout Renders', async ({
        page,
        loginPage,
    }) => {
        // Quick login to reach inventory
        await loginPage.login({
            username: process.env.USER_NAME!,
            password: process.env.USER_PASSWORD!,
        });

        await page.waitForURL('**/inventory.html');

        // Visual snapshot check
        await expect(page).toHaveScreenshot('inventory-page-render.png');
    });
});
