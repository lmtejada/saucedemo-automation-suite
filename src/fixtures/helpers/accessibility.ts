import AxeBuilder from '@axe-core/playwright';
import { test as base, expect } from '@playwright/test';

type AccessibilityFixtures = {
    makeAxeBuilder: () => AxeBuilder;
};

export const test = base.extend<AccessibilityFixtures>({
    makeAxeBuilder: async ({ page }, use) => {
        // Factory function pre-configured for WCAG 2.0/2.1 AA
        // eslint-disable-next-line func-style
        const makeAxeBuilder = (): AxeBuilder =>
            new AxeBuilder({ page }).withTags([
                'wcag2a',
                'wcag2aa',
                'wcag21a',
                'wcag21aa',
            ]);

        await use(makeAxeBuilder);
    },
});

export { expect };
