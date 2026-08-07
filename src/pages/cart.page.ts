import { Locator, Page } from '@playwright/test';

import { ProductDetails } from '@app-types/app';
import { CartItemComponent } from '@pages/components/cart-item.component';
import { NavigationComponent } from '@pages/components/navigation.component';

/**
 * Page Object for the cart page at /cart.html.
 * Contains locators and methods for interacting with the cart items.
 */
export class CartPage {
    private readonly page: Page;
    public readonly nav: NavigationComponent;
    public readonly pageContainer: Locator;
    public readonly cartItems: Locator;
    public readonly checkoutButton: Locator;
    public readonly continueShoppingButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nav = new NavigationComponent(page);

        // ==================== Locators ====================

        this.pageContainer = page.getByTestId('cart-contents-container');
        this.cartItems = page.getByTestId('inventory-item');
        this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
        this.continueShoppingButton = page.getByRole('button', {
            name: 'Continue Shopping',
        });
    }

    // ==================== Actions ====================

    /**
     * Navigates to the cart page.
     * Waits for the Checkout button to be visible, confirming the SPA has
     * finished hydrating rather than just reaching DOM content loaded state.
     * Used as the readiness canary since it renders regardless of cart contents.
     *
     * @returns {Promise<void>} Resolves when navigation is complete.
     */
    async open(): Promise<void> {
        await this.page.goto('/cart.html', {
            waitUntil: 'domcontentloaded',
        });
        await this.pageContainer.waitFor({ state: 'visible' });
    }

    /**
     * Retrieves the count of cart items displayed on the page.
     *
     * @returns {Promise<number>} Resolves with the number of cart items.
     */
    async getCartItemsCount(): Promise<number> {
        return await this.cartItems.count();
    }

    /**
     * Retrieves a cart item component by its name.
     *
     * @param {string} itemName - The name of the cart item to retrieve.
     * @returns {Promise<CartItemComponent | null>} Resolves with the CartItemComponent if found, otherwise null.
     */
    async getCartItemByName(
        itemName: string
    ): Promise<CartItemComponent | null> {
        const item = this.cartItems.filter({ hasText: itemName });
        return item ? new CartItemComponent(this.page, item) : null;
    }

    /**
     * Lists all cart items on the page.
     *
     * @returns {Promise<ProductDetails[]>} Resolves with an array of product details.
     */
    async listAllCartItems(): Promise<ProductDetails[]> {
        const itemsCount = await this.getCartItemsCount();
        const items: ProductDetails[] = [];

        for (let i = 0; i < itemsCount; i++) {
            // eslint-disable-next-line playwright/no-nth-methods
            const itemLocator = this.cartItems.nth(i);
            const itemComponent = new CartItemComponent(this.page, itemLocator);
            const itemDetails = await itemComponent.getItemDetails();
            items.push(itemDetails);
        }

        return items;
    }

    /**
     * Clicks the checkout button to proceed to the checkout page.
     *
     * @returns {Promise<void>} Resolves once the checkout button is clicked.
     */
    async checkout(): Promise<void> {
        await this.checkoutButton.click();
    }

    /**
     * Clicks the continue shopping button to return to the inventory page.
     *
     * @returns {Promise<void>} Resolves once the continue shopping button is clicked.
     */
    async continueShopping(): Promise<void> {
        await this.continueShoppingButton.click();
    }
}
