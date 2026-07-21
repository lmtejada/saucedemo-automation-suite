import { expect, test } from '@fixtures/app';

test.describe('sanity check', () => {
    test(
        'playwright test runner initializes successfully',
        { tag: ['@smoke', '@e2e', '@a11y'] },
        async () => {
            expect(true).toBe(true);
        }
    );
});
