import { expect, test } from '@fixtures/app';

import { StorageStatePaths } from '@enums/app';

import INVENTORY_PRODUCTS from '@test-data/static/products.json';

test.describe('shopping cart feature', () => {
    test.describe('functional tests @regression', () => {
        // This suite exercises a pre-filled cart, so it opts into the seeded cart state.
        test.use({ storageState: StorageStatePaths.CART });

        test.beforeEach(async ({ cartPage }) => {
            await cartPage.open();
        });

        test(
            '[Regression]: cart page loads successfully and displays the products list',
            { tag: '@regression' },
            async ({ page, cartPage }) => {
                await expect(page).toHaveURL(/cart\.html/);
                await expect(cartPage.nav.headingTitle).toBeVisible();

                const headingTitle = await cartPage.nav.getHeadingTitle();
                expect(headingTitle).toBe('Your Cart');

                await expect(cartPage.checkoutButton).toBeVisible();
                await expect(cartPage.continueShoppingButton).toBeVisible();
                await expect(cartPage.getCartItemsCount()).resolves.toBe(3);
            }
        );

        test(
            '[TC-010]: removing an item from within the cart updates the UI list and badge count without needing a page refresh',
            { tag: '@regression' },
            async ({ cartPage }) => {
                const cartItem = await cartPage.getCartItemByName(
                    INVENTORY_PRODUCTS[0].name
                );

                await cartItem!.removeFromCart();

                await expect(cartPage.getCartItemsCount()).resolves.toBe(2);
                await expect(cartPage.nav.getCartCount()).resolves.toBe(2);
            }
        );

        test(
            '[Regression]: cart page load successfully with empty state',
            { tag: '@regression' },
            async ({ page, cartPage, resetCart }) => {
                await resetCart();
                await page.reload();

                await expect(page).toHaveURL(/cart\.html/);
                await expect(cartPage.nav.headingTitle).toBeVisible();

                const headingTitle = await cartPage.nav.getHeadingTitle();
                expect(headingTitle).toBe('Your Cart');

                await expect(cartPage.checkoutButton).toBeVisible();
                await expect(cartPage.continueShoppingButton).toBeVisible();
                await expect(cartPage.getCartItemsCount()).resolves.toBe(0);
            }
        );

        test(
            '[TC-011]: the Continue Shopping button successfully returns the user to the inventory page with their current cart state preserved',
            { tag: '@regression' },
            async ({ page, cartPage, inventoryPage }) => {
                const cartItemsBefore = await cartPage.listAllCartItems();
                const cartCountBefore = await cartPage.nav.getCartCount();

                await cartPage.continueShopping();

                await expect(page).toHaveURL(/inventory\.html/);
                await expect(inventoryPage.nav.getCartCount()).resolves.toBe(
                    cartCountBefore
                );

                await cartPage.open();

                const cartItemsAfter = await cartPage.listAllCartItems();
                expect(cartItemsAfter).toEqual(cartItemsBefore);
            }
        );
    });

    test.describe('test user journey @smoke', () => {
        test.beforeEach(async ({ cartPage }) => {
            await cartPage.open();
        });

        test(
            '[TC-009]: add products from the inventory page and navigate to the cart verifying the exact items were added',
            { tag: '@smoke' },
            async ({ inventoryPage, cartPage }) => {
                await inventoryPage.open();

                const productsToAdd = [
                    INVENTORY_PRODUCTS[0],
                    INVENTORY_PRODUCTS[3],
                ];

                for (const product of productsToAdd) {
                    const inventoryItem =
                        await inventoryPage.getInventoryItemByName(
                            product.name
                        );
                    await inventoryItem!.addToCart();
                }

                await cartPage.nav.goToShoppingCart();

                const cartItems = await cartPage.listAllCartItems();
                expect(cartItems).toEqual(
                    productsToAdd.map((product) => ({
                        ...product,
                        quantity: 1,
                    }))
                );
            }
        );
    });
});
