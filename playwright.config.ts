import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

import { StorageStatePaths } from '@enums/app';

/**
 * Load environment variables from .env file.
 * Defaults to .env.dev if ENVIRONMENT is not set.
 * Skipped on CI: workflows inject APP_URL/USER_NAME/USER_PASSWORD (etc.)
 * directly as job env vars, and no .env.* file is checked in for CI to read.
 *
 * Usage:
 *   ENVIRONMENT=staging npx playwright test
 */
if (!process.env.CI) {
    const environment = process.env.ENVIRONMENT ?? 'dev';
    const environmentPath = `.env.${environment}`;

    dotenv.config({ path: environmentPath });
}

/**
 * Playwright Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './tests',

    // Pattern stores snapshots alongside or inside the spec's folder
    snapshotPathTemplate: '{testDir}/__snapshots__/{testFileName}/{arg}{ext}',

    /* Run tests in files in parallel */
    fullyParallel: true,

    /* Fail the build on CI if you accidentally left test.only in the source code */
    forbidOnly: !!process.env.CI,

    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,

    /* Limit parallel workers on CI for stability */
    workers: process.env.CI ? 1 : undefined,

    /* Reporter configuration */
    reporter: process.env.CI
        ? [['html', { open: 'never' }]]
        : [['html', { open: 'on-failure' }]],

    /* Shared settings for all projects */
    use: {
        /* Base URL - uncomment and set if using relative URLs */
        baseURL: process.env.APP_URL,

        /* App marks elements with data-test (not the default data-testid) */
        testIdAttribute: 'data-test',

        /* Collect trace when retrying the failed test */
        trace: 'on-first-retry',

        /* Screenshot on failure */
        screenshot: 'only-on-failure',

        /* Video on failure */
        video: 'retain-on-failure',

        /* Action timeout */
        actionTimeout: 10000,

        /* Navigation timeout */
        navigationTimeout: 30000,
    },

    /* Test timeout */
    timeout: 60000,

    /* Expect timeout */
    expect: {
        timeout: 10000,
        toHaveScreenshot: {
            // Allow minor sub-pixel rendering differences (e.g., 0.2% variance)
            maxDiffPixelRatio: 0.02,
            // Antialiasing option helps avoid small font-smoothing flags
            threshold: 0.2,
        },
    },

    /* Configure projects */
    projects: [
        {
            name: 'auth',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
            },
            testMatch: /.*auth\.setup\.ts$/,
        },

        /* Cart setup project - seeds the pre-filled cart storage state, depends on authentication step */
        {
            name: 'cart-setup',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
                storageState: StorageStatePaths.APP,
            },
            testMatch: /.*cart\.setup\.ts$/,
            dependencies: ['auth'],
        },

        /* Main test project - Chrome */
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
                storageState: StorageStatePaths.APP,
            },
            dependencies: ['auth', 'cart-setup'],
        },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                viewport: { width: 1920, height: 1080 },
                storageState: StorageStatePaths.APP,
            },
            dependencies: ['auth', 'cart-setup'],
        },
        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
                viewport: { width: 1920, height: 1080 },
                storageState: StorageStatePaths.APP,
            },
            dependencies: ['auth', 'cart-setup'],
        },
    ],
});
