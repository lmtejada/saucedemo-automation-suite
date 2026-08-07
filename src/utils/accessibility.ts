import { Result } from 'axe-core';

import { FormattedViolation } from '@app-types/app';

/**
 * A data-driven accessibility scan scenario: what state to put the page in
 * (setup), and how to treat a known violation in that state, if any.
 * TFixtures is the subset of Playwright fixtures the scenario's setup needs
 * (e.g. { inventoryPage: InventoryPage }) - each spec file declares its own.
 */
export type A11yScenario<TFixtures> = {
    title: string;
    setup: (fixtures: TFixtures) => Promise<void>;
    /** Set to skip the scan entirely for a known, already-logged defect. */
    skipReason?: string;
    /** Axe rule ids to disable for this scan only (e.g. a known issue on an
     * element that should stay in scope for every other rule). */
    disableRules?: string[];
};

/**
 * Formats the raw accessibility violations from axe-core into simplified format.
 *
 * @param violations - The list of raw accessibility violations from axe-core.
 * @returns An array of formatted accessibility violations.
 */
export function formatAxeViolations(
    violations: Result[]
): FormattedViolation[] {
    return violations.map((v) => ({
        id: v.id,
        impact: v.impact ?? 'unknown',
        description: v.description,
        helpUrl: v.helpUrl,
        elements: v.nodes.map((n) => n.target.join(' ')),
    }));
}
