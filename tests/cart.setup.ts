/**
 * auth.setup.ts
 * Logs in to SauceDemo via the UI once and saves the resulting storage
 * state so the main test suite can start already authenticated.
 */

import { expect, test } from '@fixtures/app';

import { StorageStatePaths } from '@enums/app';

test.describe('cart setup', () => {
    test('seed cart state snapshot', async ({ page, cartPage }) => {
        await page.goto('/');
        await page.evaluate(() => {
            // Seeds 3 items in the cart
            localStorage.setItem('cart-contents', '[4,0,5]');
        });

        await cartPage.open();
        await expect(page).toHaveURL(/cart\.html/);
        expect(await cartPage.getCartItemsCount()).toBe(3);

        // Save storage state to a JSON file
        await page.context().storageState({ path: StorageStatePaths.CART });
    });
});
