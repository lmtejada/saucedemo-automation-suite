import { Locator, Page } from '@playwright/test';

import { ProductDetails } from '@app-types/app';
import { InventoryItemComponent } from '@pages/components/inventory-item.component';
import { NavigationComponent } from '@pages/components/navigation.component';

/**
 * Page Object for the inventory page at /inventory.html.
 * Contains locators and methods for interacting with the inventory items.
 */
export class InventoryPage {
    private readonly page: Page;
    public readonly nav: NavigationComponent;
    public readonly productsSort: Locator;
    public readonly inventoryList: Locator;
    public readonly inventoryItems: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nav = new NavigationComponent(page);

        // ==================== Locators ====================

        this.productsSort = page.getByTestId('product-sort-container');
        this.inventoryList = page.getByTestId('inventory-list');
        this.inventoryItems = page.getByTestId('inventory-item');
    }

    // ==================== Actions ====================

    /**
     * Navigates to the inventory page.
     * Waits for the page to reach DOM content loaded state.
     *
     * @returns {Promise<void>} Resolves when navigation is complete.
     */
    async open(): Promise<void> {
        await this.page.goto('/inventory.html', {
            waitUntil: 'domcontentloaded',
        });
    }

    /**
     * Retrieves the count of inventory items displayed on the page.
     *
     * @returns {Promise<number>} Resolves with the number of inventory items.
     */
    async getInventoryItemsCount(): Promise<number> {
        return await this.inventoryItems.count();
    }

    /**
     * Retrieves an inventory item component by its name.
     *
     * @param {string} itemName - The name of the inventory item to retrieve.
     * @returns {Promise<InventoryItemComponent | null>} Resolves with the InventoryItemComponent if found, otherwise null.
     */
    async getInventoryItemByName(
        itemName: string
    ): Promise<InventoryItemComponent | null> {
        const item = this.inventoryItems.filter({ hasText: itemName });
        return item ? new InventoryItemComponent(this.page, item) : null;
    }

    /**
     * Lists all inventory items data on the page.
     *
     * @returns {Promise<ProductDetails[]>} Resolves with an array of product details.
     */
    async listAllItemsData(): Promise<ProductDetails[]> {
        const itemsCount = await this.getInventoryItemsCount();
        const items: ProductDetails[] = [];

        for (let i = 0; i < itemsCount; i++) {
            // eslint-disable-next-line playwright/no-nth-methods
            const itemLocator = this.inventoryItems.nth(i);
            const itemComponent = new InventoryItemComponent(
                this.page,
                itemLocator
            );
            const itemDetails = await itemComponent.getItemDetails();
            items.push(itemDetails);
        }

        return items;
    }

    /**
     * Lists all inventory items on the page.
     *
     * @returns {Promise<InventoryItemComponent[]>} Resolves with an array of product details.
     */
    async listAllInventoryItems(): Promise<InventoryItemComponent[]> {
        const itemsCount = await this.getInventoryItemsCount();
        const items: InventoryItemComponent[] = [];

        for (let i = 0; i < itemsCount; i++) {
            // eslint-disable-next-line playwright/no-nth-methods
            const itemLocator = this.inventoryItems.nth(i);
            const itemComponent = new InventoryItemComponent(
                this.page,
                itemLocator
            );
            items.push(itemComponent);
        }

        return items;
    }
}
