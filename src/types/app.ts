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
}
