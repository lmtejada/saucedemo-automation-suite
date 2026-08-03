import type { Cookie, Page } from '@playwright/test';

/**
 * Reads the `session-username` auth cookie from the given page's browser context.
 */
export async function getSessionCookie(
    page: Page
): Promise<Cookie | undefined> {
    const cookies = await page.context().cookies();
    return cookies.find((cookie) => cookie.name === 'session-username');
}
