import { test as base } from '@playwright/test';

import { CartPage } from '@pages/cart.page';
import { InventoryPage } from '@pages/inventory.page';
import { LoginPage } from '@pages/login.page';

/**
 * Framework fixtures for page objects.
 * Add new page object types here as you create them.
 */
export type FrameworkFixtures = {
    /** Login page object */
    loginPage: LoginPage;
    /** Inventory page object */
    inventoryPage: InventoryPage;
    /** Cart page object */
    cartPage: CartPage;
};

/**
 * Extended test with page object fixtures.
 * Import this in your test files to access page objects.
 */
export const test = base.extend<FrameworkFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    inventoryPage: async ({ page }, use) => {
        await use(new InventoryPage(page));
    },

    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
});
