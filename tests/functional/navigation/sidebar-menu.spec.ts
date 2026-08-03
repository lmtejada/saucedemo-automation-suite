import { expect, test } from '@fixtures/app';

import INVENTORY_PRODUCTS from '@test-data/static/products.json';

test.describe('navigation feature', () => {
    test.describe('functional tests @regression', () => {
        test.beforeEach(async ({ inventoryPage }) => {
            await inventoryPage.open();
        });

        test(
            '[TC-015]: clean application logout and session state reset',
            { tag: ['@smoke', '@regression'] },
            async ({ page, inventoryPage }) => {
                await inventoryPage.nav.openMenu();
                await expect(inventoryPage.nav.logoutLink).toBeVisible();

                await inventoryPage.nav.logoutLink.click();
                await expect(page).toHaveURL(/\/(index\.html)?$/);

                // The app authenticates via a `session-username` cookie; it does not
                // store the session token in localStorage or sessionStorage.
                const cookies = await page.context().cookies();
                expect(
                    cookies.find((cookie) => cookie.name === 'session-username')
                ).toBeUndefined();

                const clientStorageToken = await page.evaluate(() => ({
                    local: localStorage.getItem('session-username'),
                    session: sessionStorage.getItem('session-username'),
                }));

                expect(clientStorageToken.local).toBeNull();
                expect(clientStorageToken.session).toBeNull();

                await page.goBack();
                await expect(page).toHaveURL(/\/(index\.html)?$/);
            }
        );

        test(
            '[TC-032]: "All Items" link returns the user to the inventory page',
            { tag: '@regression' },
            async ({ page, cartPage, inventoryPage }) => {
                await cartPage.open();
                await expect(page).toHaveURL(/cart\.html/);

                await cartPage.nav.goToAllItems();

                await expect(page).toHaveURL(/inventory\.html/);
                await expect(inventoryPage.inventoryList).toBeVisible();
                await expect(
                    inventoryPage.getInventoryItemsCount()
                ).resolves.toBeGreaterThan(0);
            }
        );

        test(
            '[TC-033]: "Reset App State" restores inventory items to their "Add to cart" state',
            { tag: '@regression' },
            async ({ inventoryPage }) => {
                // eslint-disable-next-line playwright/no-skipped-test
                test.skip(
                    true,
                    'Bug found: Reset App State empties the cart but leaves the inventory item\'s button stuck on "Remove"'
                );

                const firstProduct = await inventoryPage.getInventoryItemByName(
                    INVENTORY_PRODUCTS[0].name
                );
                await firstProduct!.addToCart();
                await expect(inventoryPage.nav.getCartCount()).resolves.toBe(1);

                await inventoryPage.nav.resetAppState();

                await expect(inventoryPage.nav.getCartCount()).resolves.toBe(0);
                await expect(firstProduct!.addToCartButton).toBeVisible();
                await expect(firstProduct!.removeFromCartButton).toBeHidden();
            }
        );
    });
});
