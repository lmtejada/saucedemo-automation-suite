/**
 * Typed shape for a test user's credentials and identity.
 */
export interface TestUser {
    readonly username: string;
    readonly password: string;
}

/**
 * Typed shape for a product's details as represented in the inventory.
 */
export interface ProductDetails {
    readonly name: string;
    readonly description: string;
    readonly price: number;
    readonly quantity?: number;
}

/**
 * Typed shape for customer's information data required during checkout
 */
export interface CustomerForm {
    firstName: string;
    lastName: string;
    postalCode: string;
}

/**
 * CustomerFormFields type is: "firstName" | "lastName" | "postalCode"
 */
export type CustomerFormFields = keyof CustomerForm;

/**
 * Enforce every key of CustomerForm is included
 */
export const CUSTOMER_FORM_FIELDS: (keyof CustomerForm)[] = [
    'firstName',
    'lastName',
    'postalCode',
];

/**
 * Typed shape for cart total details required during checkout
 */
export interface CartTotalDetails {
    subtotal: number;
    tax: number;
    total: number;
}

/**
 * Typed shape for order summary information required during checkout
 */
export interface OrderSummary {
    paymentInfo: string;
    shippingInfo: string;
    subtotal: string;
    tax: string;
    total: string;
}

/**
 * Typed shape for order summary detail item.
 */
export interface OrderSummaryDetails {
    key: keyof OrderSummary | keyof CartTotalDetails;
    isLabelText: boolean;
}

/**
 * Enforce every key of OrderSummary is included
 */
export const ORDER_SUMMARY_DETAILS: OrderSummaryDetails[] = [
    { key: 'paymentInfo', isLabelText: false },
    { key: 'shippingInfo', isLabelText: false },
    { key: 'subtotal', isLabelText: true },
    { key: 'tax', isLabelText: true },
    { key: 'total', isLabelText: true },
];

export const CART_TOTAL_DETAILS: OrderSummaryDetails[] = [
    { key: 'subtotal', isLabelText: true },
    { key: 'tax', isLabelText: true },
    { key: 'total', isLabelText: true },
];
