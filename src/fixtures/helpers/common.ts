import { test as base } from '@playwright/test';

/**
 * Common fixtures for the test suite.
 * Add new fixture types here as you create them.
 */
export type CommonFixtures = {
    /** Resets the storage state of the browser context */
    resetStorageState: () => Promise<void>;
};

/**
 * Extended test with common fixtures.
 * Import this in your test files to access common utilities.
 */
export const test = base.extend<CommonFixtures>({
    resetStorageState: async ({ context, page }, use) => {
        await use(async () => {
            await context.clearCookies();
            await context.clearPermissions();
            await page.evaluate(() => {
                localStorage.clear();
                sessionStorage.clear();
            });
        });
    },
});
