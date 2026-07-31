import { expect, test } from '@fixtures/app';

import { StorageStatePaths } from '@enums/app';
import { sortProductsByName, sortProductsByPrice } from '@utils/products';

import INVENTORY_PRODUCTS from '@test-data/static/products.json';

test.describe('inventory feature', () => {
    test.beforeEach(async ({ inventoryPage }) => {
        await inventoryPage.open();
    });

    test.describe('functional tests @regression', () => {
        test(
            '[Smoke]: inventory page loads successfully and displays the products list',
            { tag: ['@smoke', '@regression'] },
            async ({ page, inventoryPage }) => {
                await expect(page).toHaveURL(/inventory\.html/);
                await expect(inventoryPage.nav.headingTitle).toBeVisible();

                const headingTitle = await inventoryPage.nav.getHeadingTitle();
                expect(headingTitle).toBe('Products');

                await expect(inventoryPage.productsSort).toBeVisible();
                await expect(inventoryPage.inventoryList).toBeVisible();

                await expect(
                    inventoryPage.getInventoryItemsCount()
                ).resolves.toBeGreaterThan(0);
            }
        );

        test(
            '[Regression]: verify product information is displayed correctly',
            { tag: '@regression' },
            async ({ inventoryPage }) => {
                for (const product of INVENTORY_PRODUCTS) {
                    const inventoryItem =
                        await inventoryPage.getInventoryItemByName(
                            product.name
                        );
                    const itemDetails = await inventoryItem!.getItemDetails();

                    expect(itemDetails).toEqual({
                        name: product.name,
                        description: product.description,
                        price: product.price,
                    });
                }
            }
        );

        test(
            '[TC-007]: adding a product to the cart updates the cart count and displays the remove button',
            { tag: ['@smoke', '@regression'] },
            async ({ inventoryPage }) => {
                const firstProduct = await inventoryPage.getInventoryItemByName(
                    INVENTORY_PRODUCTS[0].name
                );
                await firstProduct!.addToCart();

                await expect(inventoryPage.nav.getCartCount()).resolves.toBe(1);
                await expect(firstProduct!.addToCartButton).toBeHidden();
                await expect(firstProduct!.removeFromCartButton).toBeVisible();
            }
        );

        test(
            '[TC-008]: removing a product from the cart updates the cart count and displays the add button',
            { tag: ['@smoke', '@regression'] },
            async ({ inventoryPage }) => {
                const firstProduct = await inventoryPage.getInventoryItemByName(
                    INVENTORY_PRODUCTS[0].name
                );

                await firstProduct!.addToCart();
                await expect(inventoryPage.nav.getCartCount()).resolves.toBe(1);

                await firstProduct!.removeFromCart();
                await expect(inventoryPage.nav.getCartCount()).resolves.toBe(0);

                await expect(firstProduct!.addToCartButton).toBeVisible();
                await expect(firstProduct!.removeFromCartButton).toBeHidden();
            }
        );

        test(
            '[Smoke]: clicking the shopping cart link navigates to the cart page',
            { tag: ['@smoke', '@regression'] },
            async ({ page, inventoryPage }) => {
                await inventoryPage.nav.goToShoppingCart();

                await expect(page).toHaveURL(/cart\.html/);
            }
        );
    });

    test.describe('product sorting functionality', () => {
        test(
            '[TC-006]: sort products by name (A to Z)',
            { tag: '@regression' },
            async ({ inventoryPage }) => {
                await inventoryPage.productsSort.selectOption('az');

                const sortedProducts = await inventoryPage.listAllItemsData();

                const expectedSortedNames = sortProductsByName(
                    INVENTORY_PRODUCTS,
                    'az'
                );

                expect(sortedProducts).toEqual(expectedSortedNames);
            }
        );

        test(
            '[TC-006]: sort products by name (Z to A)',
            { tag: '@regression' },
            async ({ inventoryPage }) => {
                await inventoryPage.productsSort.selectOption('za');

                const sortedProducts = await inventoryPage.listAllItemsData();

                const expectedSortedNames = sortProductsByName(
                    INVENTORY_PRODUCTS,
                    'za'
                );

                expect(sortedProducts).toEqual(expectedSortedNames);
            }
        );

        test(
            '[TC-006]: sort products by price (low to high)',
            { tag: '@regression' },
            async ({ inventoryPage }) => {
                await inventoryPage.productsSort.selectOption('lohi');

                const sortedProducts = await inventoryPage.listAllItemsData();

                const expectedSortedPrices = sortProductsByPrice(
                    INVENTORY_PRODUCTS,
                    'lohi'
                );

                expect(sortedProducts).toEqual(expectedSortedPrices);
            }
        );

        test(
            '[TC-006]: sort products by price (high to low)',
            { tag: '@regression' },
            async ({ inventoryPage }) => {
                await inventoryPage.productsSort.selectOption('hilo');

                const sortedProducts = await inventoryPage.listAllItemsData();

                const expectedSortedPrices = sortProductsByPrice(
                    INVENTORY_PRODUCTS,
                    'hilo'
                );

                expect(sortedProducts).toEqual(expectedSortedPrices);
            }
        );
    });

    test.describe('problem_user feature quirks @problematic', () => {
        test.use({ storageState: StorageStatePaths.PROBLEM_USER });

        test(
            '[TC-018]: product images should be distinct per product',
            { tag: '@problematic' },
            async ({ inventoryPage }) => {
                // eslint-disable-next-line playwright/no-skipped-test
                test.skip(
                    true,
                    'Bug found: every product image resolves to the same broken asset for problem_user'
                );

                const items = await inventoryPage.listAllInventoryItems();
                const imageSrcs = await Promise.all(
                    items.map((item) => item.getImageSrc())
                );

                expect(new Set(imageSrcs).size).toBe(INVENTORY_PRODUCTS.length);
            }
        );

        test(
            '[TC-030]: sort dropdown reorders products',
            { tag: '@problematic' },
            async ({ inventoryPage }) => {
                // eslint-disable-next-line playwright/no-skipped-test
                test.skip(
                    true,
                    'Bug found: selecting any sort option does not reorder the product list for problem_user'
                );

                await inventoryPage.productsSort.selectOption('za');

                const sortedProducts = await inventoryPage.listAllItemsData();

                const expectedSortedNames = sortProductsByName(
                    INVENTORY_PRODUCTS,
                    'za'
                );

                expect(sortedProducts).toEqual(expectedSortedNames);
            }
        );

        test(
            '[TC-031]: remove button on the inventory page removes the item from the cart',
            { tag: '@problematic' },
            async ({ inventoryPage }) => {
                // eslint-disable-next-line playwright/no-skipped-test
                test.skip(
                    true,
                    'Bug found: clicking Remove on the inventory page does not remove the item from the cart for problem_user'
                );

                const firstProduct = await inventoryPage.getInventoryItemByName(
                    INVENTORY_PRODUCTS[0].name
                );

                await firstProduct!.addToCart();
                await expect(inventoryPage.nav.getCartCount()).resolves.toBe(1);

                await firstProduct!.removeFromCart();
                await expect(inventoryPage.nav.getCartCount()).resolves.toBe(0);

                await expect(firstProduct!.addToCartButton).toBeVisible();
                await expect(firstProduct!.removeFromCartButton).toBeHidden();
            }
        );
    });
});
