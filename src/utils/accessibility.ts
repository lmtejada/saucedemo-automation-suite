import { Result } from 'axe-core';

import { FormattedViolation } from '@app-types/app';

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
