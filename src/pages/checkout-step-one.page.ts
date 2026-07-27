import { Locator, Page } from '@playwright/test';

import { CUSTOMER_FORM_FIELDS, CustomerForm } from '@app-types/app';

import { NavigationComponent } from './components/navigation.component';

/**
 * Page Object for the First Step page in Checkout workflow at /checkout-step-one.html.
 * Contains locators and methods for interacting with the customer form data.
 */
export class CheckoutStepOnePage {
    private readonly page: Page;
    public readonly nav: NavigationComponent;
    public readonly formContainer: Locator;
    public readonly errorMessage: Locator;
    public readonly continueButton: Locator;
    public readonly cancelButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nav = new NavigationComponent(page);

        this.formContainer = page.getByTestId('checkout-info-container');
        this.errorMessage = page.getByTestId('error');
        this.continueButton = page.getByRole('button', { name: 'Continue' });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    }

    /**
     * Navigates to the Checkout Step One page.
     * Waits for the page to reach DOM content loaded state.
     *
     * @returns {Promise<void>} Resolves when navigation is complete.
     */
    async open(): Promise<void> {
        await this.page.goto('/checkout-step-one.html', {
            waitUntil: 'domcontentloaded',
        });
    }

    /**
     * Retrieves the number of rendered text inputs in the customer form.
     *
     * @returns {Promise<number>} Resolves with the number of inputs.
     */
    async getFormInputCount(): Promise<number> {
        return await this.formContainer.getByRole('textbox').count();
    }

    /**
     * Retrieves the value of a given field.
     *
     * @returns {Promise<Locator>} Resolves with the Locator for the field.
     */
    async getFieldLocator(fieldName: keyof CustomerForm): Promise<Locator> {
        return this.page.getByTestId(fieldName);
    }

    /**
     * Fills the customer's form with the data provided.
     *
     * @returns {Promise<void>} Resolves once the form is filled.
     */
    async fillForm(data: CustomerForm): Promise<void> {
        for (const [field, value] of Object.entries(data)) {
            if (value !== undefined) {
                const fieldLocator = await this.getFieldLocator(
                    field as keyof CustomerForm
                );

                await fieldLocator.fill(value);
            }
        }
    }

    /**
     * Lists all fields from the customer form.
     *
     * @returns {Promise<CustomerForm>} Resolves with a Customer Form Data object.
     */
    async getFilledFormData(): Promise<CustomerForm> {
        const formData = {} as CustomerForm;

        for (const field of CUSTOMER_FORM_FIELDS) {
            const fieldLocator = await this.getFieldLocator(
                field as keyof CustomerForm
            );

            formData[field as keyof CustomerForm] =
                await fieldLocator.inputValue();
        }

        return formData;
    }

    /**
     * Clicks the continue button to proceed with the checkout workflow.
     *
     * @returns {Promise<void>} Resolves once the continue button is clicked.
     */
    async continueCheckout(): Promise<void> {
        await this.continueButton.click();
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
