import { Locator, Page } from '@playwright/test';

import { TestUser } from '@app-types/app';

/**
 * Page Object for the login page.
 * Contains locators and methods for interacting with the login form.
 */
export class LoginPage {
    private readonly page: Page;
    public readonly usernameInput: Locator;
    public readonly passwordInput: Locator;
    public readonly loginButton: Locator;
    public readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        // ==================== Locators ====================

        this.usernameInput = page.getByRole('textbox', { name: 'username' });
        this.passwordInput = page.getByRole('textbox', { name: 'password' });
        this.loginButton = page.getByRole('button', { name: 'login' });
        this.errorMessage = page.getByTestId('error');
    }

    // ==================== Actions ====================

    /**
     * Navigates to the login page.
     * Waits for the page to reach DOM content loaded state.
     *
     * @returns {Promise<void>} Resolves when navigation is complete.
     */
    async open(): Promise<void> {
        await this.page.goto('/', {
            waitUntil: 'domcontentloaded',
        });
    }

    /**
     * Fills the credentials and submits the login form.
     *
     * Does not wait for a login response: client-side field validation
     * (malformed or empty username) rejects the form before any request is
     * sent. Callers assert the resulting state with a web-first assertion.
     *
     * @param {string} username - The user's username.
     * @param {string} password - The user's password.
     * @returns {Promise<void>} Resolves once the form is submitted.
     */
    async login(user: TestUser): Promise<void> {
        await this.usernameInput.fill(user.username);
        await this.passwordInput.fill(user.password);
        await this.loginButton.click();
    }
}
