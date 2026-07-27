import { Locator, Page } from '@playwright/test';

import { NavigationComponent } from './components/navigation.component';

/**
 * Page Object for the Checkout Complete page in Checkout workflow at /checkout-complete.html.
 * Contains locators and methods for interacting with content of the rendered page.
 */
export class CheckoutCompletePage {
    private readonly page: Page;
    public readonly nav: NavigationComponent;
    public readonly contentImage: Locator;
    public readonly contentHeader: Locator;
    public readonly contentText: Locator;
    public readonly backHomeButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nav = new NavigationComponent(page);

        this.contentImage = page.getByTestId('pony-express');
        this.contentHeader = page.getByTestId('complete-header');
        this.contentText = page.getByTestId('complete-text');
        this.backHomeButton = page.getByRole('button', { name: 'Back Home' });
    }

    /**
     * Navigates to the Checkout Complete page.
     * Waits for the page to reach DOM content loaded state.
     *
     * @returns {Promise<void>} Resolves when navigation is complete.
     */
    async open(): Promise<void> {
        await this.page.goto('/checkout-complete.html', {
            waitUntil: 'domcontentloaded',
        });
    }

    /**
     * Retrieves the text for the header rendered in the Complete Checkout page.
     *
     * @returns {Promise<string>} Resolves with the header text rendered in the page.
     */
    async getHeaderText(): Promise<string> {
        return this.contentHeader.innerText();
    }

    /**
     * Retrieves the text for the content rendered in the Complete Checkout page.
     *
     * @returns {Promise<string>} Resolves with the content text rendered in the page.
     */
    async getContentText(): Promise<string> {
        return this.contentText.innerText();
    }

    /**
     * Clicks the Back Home button after completing the checkout.
     *
     * @returns {Promise<void>} Resolves once the Back Home button is clicked.
     */
    async navigateToHome(): Promise<void> {
        await this.backHomeButton.click();
    }
}
