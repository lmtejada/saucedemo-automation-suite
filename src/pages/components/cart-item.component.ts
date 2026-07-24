import { Locator, Page } from '@playwright/test';

import { ProductDetails } from '@app-types/app';

export class CartItemComponent {
    private readonly page: Page;
    public readonly itemName: Locator;
    public readonly itemDescription: Locator;
    public readonly itemPrice: Locator;
    public readonly itemQuantity: Locator;
    public readonly removeFromCartButton: Locator;

    constructor(page: Page, rootLocator: Locator) {
        this.page = page;

        // ==================== Locators ====================

        this.itemName = rootLocator.getByTestId('inventory-item-name');
        this.itemDescription = rootLocator.getByTestId('inventory-item-desc');
        this.itemPrice = rootLocator.getByTestId('inventory-item-price');
        this.itemQuantity = rootLocator.getByTestId('item-quantity');
        this.removeFromCartButton = rootLocator.getByRole('button', {
            name: `Remove`,
        });
    }

    // ==================== Actions ====================

    /**
     * Retrieves the details of the cart item.
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
            quantity: parseInt(await this.itemQuantity.innerText()),
        };
    }

    /**
     * Clicks the "Remove from Cart" button for the cart item.
     *
     * @returns {Promise<void>} Resolves once the button is clicked.
     */
    async removeFromCart(): Promise<void> {
        await this.removeFromCartButton.click();
    }
}
