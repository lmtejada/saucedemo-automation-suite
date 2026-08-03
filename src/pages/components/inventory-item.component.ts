import { Locator, Page } from '@playwright/test';

import { ProductDetails } from '@app-types/app';

export class InventoryItemComponent {
    private readonly page: Page;
    public readonly itemName: Locator;
    public readonly itemDescription: Locator;
    public readonly itemPrice: Locator;
    public readonly itemImage: Locator;
    public readonly addToCartButton: Locator;
    public readonly removeFromCartButton: Locator;

    constructor(page: Page, rootLocator: Locator) {
        this.page = page;

        // ==================== Locators ====================

        this.itemName = rootLocator.getByTestId('inventory-item-name');
        this.itemDescription = rootLocator.getByTestId('inventory-item-desc');
        this.itemPrice = rootLocator.getByTestId('inventory-item-price');
        this.itemImage = rootLocator.getByRole('img');
        this.addToCartButton = rootLocator.getByRole('button', {
            name: `Add to cart`,
        });
        this.removeFromCartButton = rootLocator.getByRole('button', {
            name: `Remove`,
        });
    }

    // ==================== Actions ====================

    /**
     * Retrieves the details of the inventory item.
     *
     * @returns {Promise<ProductDetails>} Resolves with the item's details.
     */
    async getItemDetails(): Promise<ProductDetails> {
        return {
            name: await this.itemName.innerText(),
            description: await this.itemDescription.innerText(),
            price: parseFloat(
                (await this.itemPrice.innerText()).replace('$', '')
            ),
        };
    }

    /**
     * Retrieves the image source of the inventory item.
     *
     * @returns {Promise<string | null>} Resolves with the image src attribute.
     */
    async getImageSrc(): Promise<string | null> {
        return await this.itemImage.getAttribute('src');
    }

    /**
     * Clicks the "Add to Cart" button for the inventory item.
     *
     * @returns {Promise<void>} Resolves once the button is clicked.
     */
    async addToCart(): Promise<void> {
        await this.addToCartButton.click();
    }

    /**
     * Clicks the "Remove from Cart" button for the inventory item.
     *
     * @returns {Promise<void>} Resolves once the button is clicked.
     */
    async removeFromCart(): Promise<void> {
        await this.removeFromCartButton.click();
    }

    /**
     * Clicks the item's name to navigate to its detail page.
     *
     * @returns {Promise<void>} Resolves once the click completes.
     */
    async viewDetails(): Promise<void> {
        await this.itemName.click();
    }
}
