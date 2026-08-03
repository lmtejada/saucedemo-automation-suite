import { expect, test } from '@fixtures/app';

import { StorageStatePaths } from '@enums/app';

import INVENTORY_PRODUCTS from '@test-data/static/products.json';

test.describe('inventory details feature', () => {
    test.beforeEach(async ({ inventoryPage }) => {
        await inventoryPage.open();
    });

    test.describe('item detail page navigation @regression', () => {
        test(
            "[TC-035]: clicking a product's name navigates to its own detail page with matching data",
            { tag: '@regression' },
            async ({ page, inventoryPage, inventoryDetailsPage }) => {
                for (const product of INVENTORY_PRODUCTS) {
                    await inventoryPage.open();

                    // Navigate to the product's detail page via its name link
                    const inventoryItem =
                        await inventoryPage.getInventoryItemByName(
                            product.name
                        );
                    await inventoryItem!.viewDetails();

                    await expect(page).toHaveURL(/inventory-item\.html/);

                    // Assert the detail page shows the matching product's data
                    const itemDetails =
                        await inventoryDetailsPage.getItemDetails();

                    expect(itemDetails).toEqual({
                        name: product.name,
                        description: product.description,
                        price: product.price,
                    });
                }
            }
        );

        test(
            "[TC-035]: clicking a product's image navigates to its own detail page",
            { tag: '@regression' },
            async ({ page, inventoryPage, inventoryDetailsPage }) => {
                const product = INVENTORY_PRODUCTS[0];
                const inventoryItem =
                    await inventoryPage.getInventoryItemByName(product.name);
                // Navigate to the product's detail page via its image link
                await inventoryItem!.itemImage.click();

                await expect(page).toHaveURL(/inventory-item\.html/);

                // Assert the detail page shows the matching product's data
                const itemDetails = await inventoryDetailsPage.getItemDetails();

                expect(itemDetails).toEqual({
                    name: product.name,
                    description: product.description,
                    price: product.price,
                });
            }
        );

        test(
            '[TC-035]: "Back to products" returns to the inventory page',
            { tag: '@regression' },
            async ({ page, inventoryPage, inventoryDetailsPage }) => {
                const product = INVENTORY_PRODUCTS[0];
                const inventoryItem =
                    await inventoryPage.getInventoryItemByName(product.name);
                // Navigate to the product's detail page
                await inventoryItem!.viewDetails();
                await expect(page).toHaveURL(/inventory-item\.html/);

                // Navigate back to the inventory page
                await inventoryDetailsPage.backToProducts();
                await expect(page).toHaveURL(/inventory\.html/);
            }
        );

        test(
            '[TC-035]: navigating to a non-existent item id shows an ITEM NOT FOUND state',
            { tag: '@regression' },
            async ({ inventoryDetailsPage }) => {
                await inventoryDetailsPage.open(999);

                await expect(
                    inventoryDetailsPage.isItemNotFound()
                ).resolves.toBe(true);
            }
        );
    });

    test.describe('cart actions on the item detail page @regression', () => {
        test(
            '[TC-036]: adding to cart from the item detail page stays in sync with the inventory list',
            { tag: '@regression' },
            async ({ inventoryPage, inventoryDetailsPage }) => {
                const product = INVENTORY_PRODUCTS[1];
                const inventoryItem =
                    await inventoryPage.getInventoryItemByName(product.name);
                // Navigate to the product's detail page
                await inventoryItem!.viewDetails();

                // Add to cart from the detail page
                await inventoryDetailsPage.item.addToCart();
                await expect(
                    inventoryDetailsPage.nav.getCartCount()
                ).resolves.toBe(1);

                await expect(
                    inventoryDetailsPage.item.addToCartButton
                ).toBeHidden();
                await expect(
                    inventoryDetailsPage.item.removeFromCartButton
                ).toBeVisible();

                // Navigate back to the inventory list and assert state stayed in sync
                await inventoryPage.open();
                const listItem = await inventoryPage.getInventoryItemByName(
                    product.name
                );
                await expect(listItem!.removeFromCartButton).toBeVisible();
                await expect(inventoryPage.nav.getCartCount()).resolves.toBe(1);
            }
        );

        test(
            '[TC-036]: removing from cart on the item detail page stays in sync with the inventory list',
            { tag: '@regression' },
            async ({ inventoryPage, inventoryDetailsPage }) => {
                const product = INVENTORY_PRODUCTS[1];
                const inventoryItem =
                    await inventoryPage.getInventoryItemByName(product.name);
                // Add to cart from the inventory list
                await inventoryItem!.addToCart();
                await expect(inventoryPage.nav.getCartCount()).resolves.toBe(1);

                // Navigate to the same product's detail page
                const sameItem = await inventoryPage.getInventoryItemByName(
                    product.name
                );
                await sameItem!.viewDetails();

                // Remove from cart on the detail page
                await inventoryDetailsPage.item.removeFromCart();
                await expect(
                    inventoryDetailsPage.nav.getCartCount()
                ).resolves.toBe(0);
                await expect(
                    inventoryDetailsPage.item.addToCartButton
                ).toBeVisible();

                // Navigate back to the inventory list and assert state stayed in sync
                await inventoryPage.open();
                const listItem = await inventoryPage.getInventoryItemByName(
                    product.name
                );
                await expect(listItem!.addToCartButton).toBeVisible();
            }
        );

        test(
            '[TC-036]: opening the detail page for an item already in the cart shows the Remove button',
            { tag: '@regression' },
            async ({ inventoryPage, inventoryDetailsPage }) => {
                const product = INVENTORY_PRODUCTS[0];
                const inventoryItem =
                    await inventoryPage.getInventoryItemByName(product.name);
                // Add to cart from the inventory list
                await inventoryItem!.addToCart();

                // Navigate to the same product's detail page
                const sameItem = await inventoryPage.getInventoryItemByName(
                    product.name
                );
                await sameItem!.viewDetails();

                // Check the button state on the detail page reflects the cart state
                await expect(
                    inventoryDetailsPage.item.removeFromCartButton
                ).toBeVisible();
                await expect(
                    inventoryDetailsPage.item.addToCartButton
                ).toBeHidden();
            }
        );
    });

    test.describe('problem_user feature quirks @problematic', () => {
        test.use({ storageState: StorageStatePaths.PROBLEM_USER });

        test(
            '[TC-037]: item detail page navigation resolves to the wrong product',
            { tag: '@problematic' },
            async ({ page, inventoryPage, inventoryDetailsPage }) => {
                // eslint-disable-next-line playwright/no-skipped-test
                test.skip(
                    true,
                    "Bug found: clicking a product's name or image on the inventory page navigates to a different product's detail page for problem_user (BUG-010)"
                );

                for (const product of INVENTORY_PRODUCTS) {
                    await inventoryPage.open();

                    // Navigate to the product's detail page from the inventory list
                    const inventoryItem =
                        await inventoryPage.getInventoryItemByName(
                            product.name
                        );
                    await inventoryItem!.viewDetails();
                    await expect(page).toHaveURL(/inventory-item\.html/);

                    // Assert the detail page resolves to the same product
                    const itemDetails =
                        await inventoryDetailsPage.getItemDetails();
                    expect(itemDetails.name).toBe(product.name);
                }
            }
        );

        test(
            '[TC-038]: "Add to cart" works for every product on the item detail page',
            { tag: '@problematic' },
            async ({ inventoryPage, inventoryDetailsPage, resetCart }) => {
                // eslint-disable-next-line playwright/no-skipped-test
                test.skip(
                    true,
                    'Bug found: "Add to cart" on the item detail page is a no-op for half of the catalog for problem_user (BUG-011)'
                );

                const itemCount = await inventoryPage.getInventoryItemsCount();

                for (let id = 0; id < itemCount; id++) {
                    // Navigate directly by id to bypass BUG-010's navigation mismatch.
                    await inventoryDetailsPage.open(id);
                    // Add to cart from the detail page
                    await inventoryDetailsPage.item.addToCart();

                    await expect(
                        inventoryDetailsPage.nav.getCartCount()
                    ).resolves.toBe(1);
                    await expect(
                        inventoryDetailsPage.item.addToCartButton
                    ).toBeHidden();
                    await expect(
                        inventoryDetailsPage.item.removeFromCartButton
                    ).toBeVisible();

                    // Reset cart state before moving on to the next product
                    await resetCart();
                }
            }
        );
    });
});
