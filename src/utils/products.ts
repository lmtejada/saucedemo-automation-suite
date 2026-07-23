import { ProductDetails } from '@app-types/app';

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
