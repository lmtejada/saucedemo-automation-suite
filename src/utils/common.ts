import { OrderSummaryDetails } from '@app-types/app';

/**
 * Converts a string into a lowercase, hyphen-separated slug (e.g. "Item Total" -> "item-total").
 * Splits on non-word characters and on camelCase word boundaries before joining.
 *
 * @param txt - The input string to normalize.
 * @returns The slugified string.
 */
export function snakeCase(txt: string): string {
    return txt
        .replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map((word) => word.toLowerCase())
        .join('-');
}

/**
 * Builds a `data-testid`-style identifier for an order summary field, using its slugified
 * key plus a `-label` or `-value` suffix depending on whether the record is a label or a value.
 *
 * @param record - The order summary field to build the identifier for.
 * @returns The generated test id, e.g. `item-total-label`.
 */
export function buildLabelTestId(record: OrderSummaryDetails): string {
    const label = snakeCase(record.key);
    return record.isLabelText ? `${label}-label` : `${label}-value`;
}

/**
 * Extracts the first decimal price value found in a currency-formatted string.
 *
 * @param text - Text containing a price, e.g. "Item total: $39.98".
 * @returns The parsed numeric value, or 0 if no price pattern is found.
 */
export function parsePriceString(text: string): number {
    const match = text.match(/\d+\.\d+/);
    return match ? parseFloat(match[0]) : 0;
}
