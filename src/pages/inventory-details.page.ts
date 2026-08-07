import { Locator, Page } from '@playwright/test';

import { ProductDetails } from '@app-types/app';
import { InventoryItemComponent } from '@pages/components/inventory-item.component';
import { NavigationComponent } from '@pages/components/navigation.component';

/**
 * Page Object for the item detail page at /inventory-item.html.
 * Contains locators and methods for interacting with a single product's detail view.
 */
export class InventoryDetailsPage {
    private readonly page: Page;
    public readonly nav: NavigationComponent;
    public readonly pageContainer: Locator;
    public readonly item: InventoryItemComponent;
    public readonly backToProductsButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nav = new NavigationComponent(page);
        this.item = new InventoryItemComponent(
            page,
            page.getByTestId('inventory-item')
        );

        // ==================== Locators ====================

        this.pageContainer = page.getByTestId('inventory-container');
        this.backToProductsButton = page.getByTestId('back-to-products');
    }

    // ==================== Actions ====================

    /**
     * Navigates to the item detail page.
     * Waits for the page container to be visible, confirming the SPA has
     * finished hydrating rather than just reaching DOM content loaded state.
     *
     * @param {number} [id] - The product id to open (the `id` query param on /inventory-item.html). Omit to navigate without one.
     * @returns {Promise<void>} Resolves when navigation is complete.
     */
    async open(id?: number): Promise<void> {
        const query = id !== undefined ? `?id=${id}` : '';
        await this.page.goto(`/inventory-item.html${query}`, {
            waitUntil: 'domcontentloaded',
        });
        await this.pageContainer.waitFor({ state: 'visible' });
    }

    /**
     * Retrieves the displayed product's details.
     *
     * @returns {Promise<ProductDetails>} Resolves with the item's details.
     */
    async getItemDetails(): Promise<ProductDetails> {
        return await this.item.getItemDetails();
    }

    /**
     * Determines whether the page is rendering the "ITEM NOT FOUND" state
     * rather than a valid product (e.g. after navigating to a non-existent id).
     *
     * @returns {Promise<boolean>} Resolves with true if the item was not found.
     */
    async isItemNotFound(): Promise<boolean> {
        const name = await this.item.itemName.innerText();
        return name === 'ITEM NOT FOUND';
    }

    /**
     * Clicks the "Back to products" button to return to the inventory page.
     *
     * @returns {Promise<void>} Resolves once the button is clicked.
     */
    async backToProducts(): Promise<void> {
        await this.backToProductsButton.click();
    }
}
