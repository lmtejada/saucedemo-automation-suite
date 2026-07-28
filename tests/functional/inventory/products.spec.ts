import { expect, test } from '@fixtures/app';

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

                const cartCount = await inventoryPage.nav.getCartCount();
                const removeButton = firstProduct!.removeFromCartButton;

                expect(firstProduct).toBeDefined();
                expect(cartCount).toBe(1);

                await expect(removeButton).toBeVisible();
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
                await firstProduct!.removeFromCart();

                const cartCount = await inventoryPage.nav.getCartCount();
                const addButton = firstProduct!.addToCartButton;

                expect(firstProduct).toBeDefined();
                expect(cartCount).toBe(0);

                await expect(addButton).toBeVisible();
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

                const sortedProducts =
                    await inventoryPage.listAllInventoryItems();

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

                const sortedProducts =
                    await inventoryPage.listAllInventoryItems();

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

                const sortedProducts =
                    await inventoryPage.listAllInventoryItems();

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

                const sortedProducts =
                    await inventoryPage.listAllInventoryItems();

                const expectedSortedPrices = sortProductsByPrice(
                    INVENTORY_PRODUCTS,
                    'hilo'
                );

                expect(sortedProducts).toEqual(expectedSortedPrices);
            }
        );
    });
});
