import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for CornerKit Integration Tests
 * Tests squircle rendering across multiple browsers
 * FR-053 to FR-056: Cross-browser testing
 */
export default defineConfig({
  testDir: './tests/integration',

  // Run tests sequentially to avoid overwhelming http-server
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Use single worker to prevent http-server overload
  // Even 2 workers can cause timeouts when tests from different files run concurrently
  workers: 1,

  // Reporter to use
  reporter: 'html',

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    // Port 5273 is deliberately NOT a common dev-server default (Vite uses
    // 5173): with reuseExistingServer enabled, a foreign server on the port
    // would be silently reused and every fixture request would miss.
    baseURL: 'http://localhost:5273',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment below for cross-browser testing (requires: npx playwright install)
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
  ],

  // Run local dev server before starting the tests
  webServer: {
    command: 'npx http-server -p 5273 -c-1 --cors',
    url: 'http://localhost:5273',
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },
});
