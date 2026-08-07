import { Locator, Page } from '@playwright/test';

import {
    CART_TOTAL_DETAILS,
    CartTotalDetails,
    ORDER_SUMMARY_DETAILS,
    OrderSummary,
    OrderSummaryDetails,
    ProductDetails,
} from '@app-types/app';
import { CartItemComponent } from '@pages/components/cart-item.component';
import { NavigationComponent } from '@pages/components/navigation.component';
import { buildLabelTestId, parsePriceString } from '@utils/app';

/**
 * Page Object for the Second Step page in Checkout workflow at /checkout-step-two.html.
 * Contains locators and methods for interacting with the cart items and the order summary details.
 */
export class CheckoutStepTwoPage {
    private readonly page: Page;
    public readonly nav: NavigationComponent;
    public readonly pageContainer: Locator;
    public readonly cartItems: Locator;
    public readonly finishButton: Locator;
    public readonly cancelButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nav = new NavigationComponent(page);

        // ==================== Locators ====================

        this.pageContainer = page.getByTestId('checkout-summary-container');
        this.cartItems = page.getByTestId('inventory-item');
        this.finishButton = page.getByRole('button', { name: 'Finish' });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    }

    // ==================== Actions ====================

    /**
     * Navigates to the Checkout Step Two page.
     * Waits for the page container to be visible, confirming the SPA has
     * finished hydrating rather than just reaching DOM content loaded state.
     *
     * @returns {Promise<void>} Resolves when navigation is complete.
     */
    async open(): Promise<void> {
        await this.page.goto('/checkout-step-two.html', {
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
     * Retrieves the value of a given label.
     *
     * @returns {Promise<Locator>} Resolves with the Locator for the field
     */
    async getLabelLocator(
        orderSummaryItem: OrderSummaryDetails
    ): Promise<Locator> {
        const labelTestId = buildLabelTestId(orderSummaryItem);
        return this.page.getByTestId(labelTestId);
    }

    /**
     * Lists all order summary details from the checkout step two page.
     *
     * @returns {Promise<OrderSummary>} Resolves with a Order Summary object.
     */
    async getOrderSummaryDetails(): Promise<OrderSummary> {
        const summaryDetails = {} as OrderSummary;

        for (const record of ORDER_SUMMARY_DETAILS) {
            const labelLocator = await this.getLabelLocator(record);

            summaryDetails[record.key as keyof OrderSummary] =
                await labelLocator.innerText();
        }

        return summaryDetails;
    }

    /**
     * Calculates item subtotal, estimated tax (8%), and grand total
     * from an array of ProductDetails.
     *
     * @param {ProductDetails[]} items List of items in the checkout summary.
     * @param {number} [taxRate=0.08] Tax rate decimal (Sauce Demo default is 8%).
     * @returns {CartTotalDetails} Formatted numerical totals rounded to 2 decimal places.
     */
    calculateTotalsFromItems(
        items: ProductDetails[],
        taxRate = 0.08
    ): CartTotalDetails {
        // Sum up unit prices
        const rawSubtotal = items.reduce((acc, item) => {
            return acc + item.price;
        }, 0);

        // Fix floating point precision by rounding to 2 decimal places
        const subtotal = Math.round(rawSubtotal * 100) / 100;
        const tax = Math.round(subtotal * taxRate * 100) / 100;
        const total = Math.round((subtotal + tax) * 100) / 100;

        return { subtotal, tax, total };
    }

    /**
     * Lists the cart price details information from the order summary section.
     *
     * @returns {Promise<CartTotalDetails>} Resolves with a Cart Total Details object.
     */
    async getCartPriceDetails(): Promise<CartTotalDetails> {
        const cartTotalDetails = {} as CartTotalDetails;

        for (const record of CART_TOTAL_DETAILS) {
            const labelLocator = await this.getLabelLocator(record);

            cartTotalDetails[record.key as keyof CartTotalDetails] =
                parsePriceString(await labelLocator.innerText());
        }

        return cartTotalDetails;
    }

    /**
     * Clicks the finish button to complete the checkout workflow.
     *
     * @returns {Promise<void>} Resolves once the finish button is clicked.
     */
    async finishCheckout(): Promise<void> {
        await this.finishButton.click();
    }

    /**
     * Clicks the cancel button to abort the checkout workflow.
     *
     * @returns {Promise<void>} Resolves once the cancel button is clicked.
     */
    async cancelCheckout(): Promise<void> {
        await this.cancelButton.click();
    }
}
