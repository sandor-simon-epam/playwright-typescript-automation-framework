import { defineConfig, devices } from '@playwright/test';
import { config } from './utils/EnvConfig';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['allure-playwright'], ['junit', { outputFile: 'test-results/junit.xml' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Test timeout from environment */
  timeout: config.timeouts.test,

  /* Configure projects for major browsers */
  projects: [
    // Setup project - run once to capture cookie consent state
    {
      name: 'setup',
      testDir: './tests/auth',
      testMatch: '**/cookieConsent.setup.ts',
      use: {
        baseURL: config.ui.baseUrl,
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      timeout: config.timeouts.apiTest,
      use: {
        baseURL: config.api.baseUrl,
      },
    },
    {
      name: 'e2e',
      testDir: './tests/ui',
      timeout: config.timeouts.e2eTest,
      fullyParallel: false,
      dependencies: ['setup'], // Run setup first
      use: {
        ...devices['Desktop Chrome'],
        baseURL: config.ui.baseUrl,
        actionTimeout: config.timeouts.action,
        navigationTimeout: config.timeouts.navigation,
        // Use saved storage state to avoid cookie consent modal
        storageState: config.storageStatePath,
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
