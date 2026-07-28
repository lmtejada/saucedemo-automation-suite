import { OrderSummaryDetails } from '@app-types/app';

export function snakeCase(txt: string): string {
    return txt
        .replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map((word) => word.toLowerCase())
        .join('-');
}

export function buildLabelTestId(record: OrderSummaryDetails): string {
    const label = snakeCase(record.key);
    return record.isLabelText ? `${label}-label` : `${label}-value`;
}

/*
 * Helper to extract numerical value from strings like "Item total: $39.98"
 */
export function parsePriceString(text: string): number {
    const match = text.match(/\d+\.\d+/);
    return match ? parseFloat(match[0]) : 0;
}
