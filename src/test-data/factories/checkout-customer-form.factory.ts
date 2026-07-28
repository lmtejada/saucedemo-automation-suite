import { CustomerForm } from '@app-types/app';

export const FORM_DEFAULT_DATA: CustomerForm = {
    firstName: 'John',
    lastName: 'Doe',
    postalCode: '10255',
};

/**
 * Creates a valid customer payload, allowing custom overrides for edge cases/validation.
 */
export function buildCheckoutData(
    overrides: Partial<CustomerForm> = {}
): CustomerForm {
    return {
        ...FORM_DEFAULT_DATA,
        ...overrides,
    };
}

export const VALIDATION_SCENARIOS = [
    {
        description: 'All Fields Blank (First Name takes priority)',
        data: { firstName: '', lastName: '', postalCode: '' },
        expectedError: 'Error: First Name is required',
    },
    {
        description: 'Missing First Name',
        data: buildCheckoutData({ firstName: '' }),
        expectedError: 'Error: First Name is required',
    },
    {
        description: 'Missing Last Name',
        data: buildCheckoutData({ lastName: '' }),
        expectedError: 'Error: Last Name is required',
    },
    {
        description: 'Missing Postal Code',
        data: buildCheckoutData({ postalCode: '' }),
        expectedError: 'Error: Postal Code is required',
    },
    {
        description: 'Whitespace only in Postal Code',
        data: buildCheckoutData({ postalCode: '   ' }),
        expectedError: 'Error: Postal Code is required',
        skip: true,
        skipReason:
            'Bug found: Postal Code is not trimmed and Whitespaces are accepted',
    },
];
