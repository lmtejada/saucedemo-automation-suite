import { expect, test } from '@fixtures/app';

import { StorageStatePaths } from '@enums/app';

test.describe(
    'framework sanity check',
    { tag: ['@smoke', '@e2e', '@a11y'] },
    () => {
        test('[Smoke]: playwright test runner initializes successfully', async () => {
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

    test('[TC-016]: login page - Core Layout Structure Renders', async ({
        page,
    }) => {
        // High-level visual snapshot check
        await expect(page).toHaveScreenshot('login-page-render.png');
    });

    test('[TC-016]: inventory page - Primary Structural Layout Renders', async ({
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

test.describe('cart page visual rendering', { tag: '@visual' }, () => {
    // This suite exercises a pre-filled cart, so it opts into the seeded cart state.
    test.use({ storageState: StorageStatePaths.CART });

    test.beforeEach(async ({ page }) => {
        // Enforce consistent viewport dimensions for visual tests
        await page.setViewportSize({ width: 1280, height: 720 });
    });

    test('[TC-016]: cart page - Primary Structural Layout Renders', async ({
        page,
        cartPage,
    }) => {
        await cartPage.open();

        // Visual snapshot check
        await expect(page).toHaveScreenshot('cart-page-render.png');
    });
});

test.describe(
    'checkout complete page visual rendering',
    { tag: '@visual' },
    () => {
        test.beforeEach(async ({ page }) => {
            // Enforce consistent viewport dimensions for visual tests
            await page.setViewportSize({ width: 1280, height: 720 });
        });

        test('[TC-016]: checkout complete page - Primary Structural Layout Renders', async ({
            page,
            checkoutCompletePage,
        }) => {
            // Static confirmation content, identical regardless of navigation path
            // (see TC-003 on this app's lenient route guards) — no need to drive
            // the full checkout funnel just to render this page.
            await checkoutCompletePage.open();

            // Visual snapshot check
            await expect(page).toHaveScreenshot(
                'checkout-complete-page-render.png'
            );
        });
    }
);
