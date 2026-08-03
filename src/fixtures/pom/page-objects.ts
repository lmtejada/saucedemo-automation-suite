import { test as base } from '@playwright/test';

import { CartPage } from '@pages/cart.page';
import { CheckoutCompletePage } from '@pages/checkout-complete-page';
import { CheckoutStepOnePage } from '@pages/checkout-step-one.page';
import { CheckoutStepTwoPage } from '@pages/checkout-step-two.page';
import { InventoryDetailsPage } from '@pages/inventory-details.page';
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
    /** Inventory Item Details page object */
    inventoryDetailsPage: InventoryDetailsPage;
    /** Cart page object */
    cartPage: CartPage;
    /** Checkout Step One page object */
    checkoutStepOnePage: CheckoutStepOnePage;
    /** Checkout Step Two page object */
    checkoutStepTwoPage: CheckoutStepTwoPage;
    /** Checkou Complete page object */
    checkoutCompletePage: CheckoutCompletePage;
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

    inventoryDetailsPage: async ({ page }, use) => {
        await use(new InventoryDetailsPage(page));
    },

    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },

    checkoutStepOnePage: async ({ page }, use) => {
        await use(new CheckoutStepOnePage(page));
    },

    checkoutStepTwoPage: async ({ page }, use) => {
        await use(new CheckoutStepTwoPage(page));
    },

    checkoutCompletePage: async ({ page }, use) => {
        await use(new CheckoutCompletePage(page));
    },
});
