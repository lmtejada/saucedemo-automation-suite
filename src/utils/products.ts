import { ProductDetails } from '@app-types/app';

/**
 * Sorts inventory products alphabetically by name. Mutates and returns the input array.
 *
 * @param products - The list of products to sort.
 * @param sortOption - `'az'` for ascending, `'za'` for descending; any other value returns the list unchanged.
 * @returns The sorted list of products.
 */
export function sortProductsByName(
    products: Array<ProductDetails>,
    sortOption: string
): Array<ProductDetails> {
    switch (sortOption) {
        case 'az':
            return products.sort((a, b) => a.name.localeCompare(b.name));

        case 'za':
            return products.sort((a, b) => b.name.localeCompare(a.name));

        default:
            return products;
    }
}

/**
 * Sorts inventory products by price. Mutates and returns the input array.
 *
 * @param products - The list of products to sort.
 * @param sortOption - `'lohi'` for ascending, `'hilo'` for descending; any other value returns the list unchanged.
 * @returns The sorted list of products.
 */
export function sortProductsByPrice(
    products: Array<ProductDetails>,
    sortOption: string
): Array<ProductDetails> {
    switch (sortOption) {
        case 'lohi':
            return products.sort((a, b) => a.price - b.price);
        case 'hilo':
            return products.sort((a, b) => b.price - a.price);
        default:
            return products;
    }
}
