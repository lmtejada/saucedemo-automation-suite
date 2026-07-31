import { Locator, Page } from '@playwright/test';

export class NavigationComponent {
    private readonly page: Page;
    public readonly headingTitle: Locator;
    public readonly shoppingCartLink: Locator;
    public readonly cartCount: Locator;
    public readonly menuButton: Locator;
    public readonly allItemsLink: Locator;
    public readonly logoutLink: Locator;
    public readonly resetAppStateLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // ==================== Locators ====================

        this.headingTitle = page.getByTestId('title');
        this.shoppingCartLink = page.getByTestId('shopping-cart-link');
        this.cartCount = page.getByTestId('shopping-cart-badge');
        this.menuButton = page.getByRole('button', { name: 'Open Menu' });
        this.allItemsLink = page.getByRole('link', { name: 'All Items' });
        this.logoutLink = page.getByRole('link', { name: 'Logout' });
        this.resetAppStateLink = page.getByRole('link', {
            name: 'Reset App State',
        });
    }

    // ==================== Actions ====================

    /**
     * Retrieves the text of the heading title in the navigation bar.
     *
     * @returns {Promise<string>} Resolves with the heading title text.
     */
    async getHeadingTitle(): Promise<string> {
        return await this.headingTitle.innerText();
    }

    /**
     * Clicks the "Menu" button in the navigation bar.
     *
     * @returns {Promise<void>} Resolves once the button is clicked.
     */
    async openMenu(): Promise<void> {
        await this.menuButton.click();
    }

    /**
     * Clicks the "Logout" link in the navigation menu.
     *
     * @returns {Promise<void>} Resolves once the link is clicked.
     */
    async logout(): Promise<void> {
        await this.openMenu();
        await this.logoutLink.click();
    }

    /**
     * Clicks the "Shopping Cart" link in the navigation bar.
     *
     * @returns {Promise<void>} Resolves once the link is clicked.
     */
    async goToShoppingCart(): Promise<void> {
        await this.shoppingCartLink.click();
    }

    /**
     * Clicks the "All Items" link in the navigation menu.
     *
     * @returns {Promise<void>} Resolves once the link is clicked.
     */
    async goToAllItems(): Promise<void> {
        await this.openMenu();
        await this.allItemsLink.click();
    }

    /**
     * Clicks the "Reset App State" link in the navigation menu.
     *
     * @returns {Promise<void>} Resolves once the link is clicked.
     */
    async resetAppState(): Promise<void> {
        await this.openMenu();
        await this.resetAppStateLink.click();
    }

    /**
     * Retrieves the current count of items in the shopping cart.
     *
     * @returns {Promise<number>} Resolves with the number of items in the cart.
     */
    async getCartCount(): Promise<number> {
        // Return 0 safely if the badge isn't rendered
        const isVisible = await this.cartCount.isVisible();
        if (!isVisible) {
            return 0;
        }

        const text = await this.cartCount.innerText();
        return parseInt(text, 10);
    }
}
