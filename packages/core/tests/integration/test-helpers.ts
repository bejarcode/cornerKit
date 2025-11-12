/**
 * Integration Test Helpers
 * Shared utilities for integration tests
 */

import { Page } from '@playwright/test';

/**
 * Navigate to test page and wait for CornerKit to initialize
 * Provides detailed error information if initialization fails
 */
export async function setupTestPage(page: Page, timeout = 10000): Promise<void> {
  await page.goto('/tests/integration/fixtures/test-page.html');

  try {
    await page.waitForFunction(() => window.cornerKitReady === true, {
      timeout,
    });
  } catch (error) {
    // Try to gather diagnostic information about the failure
    let diagnostics = null;
    try {
      diagnostics = await page.evaluate(() => ({
        cornerKitReady: window.cornerKitReady,
        hasCornerKit: !!window.CornerKit,
        hasInstance: !!window.ck,
        error: window.cornerKitError,
        url: window.location.href,
        readyState: document.readyState,
      }));
    } catch (diagError) {
      diagnostics = {
        error: 'Could not gather diagnostics',
        reason: diagError.message,
        pageIsClosed: true,
      };
    }

    throw new Error(
      `CornerKit initialization timeout after ${timeout}ms.\n` +
      `Diagnostics: ${JSON.stringify(diagnostics, null, 2)}\n` +
      `Original error: ${error.message}\n` +
      `Hint: Check if the webServer started correctly and if the module import is successful`
    );
  }
}

/**
 * Extended Window interface with CornerKit globals
 */
declare global {
  interface Window {
    CornerKit: any;
    ck: any;
    cornerKitReady: boolean;
    cornerKitError: {
      stage: string;
      message: string;
      stack: string;
      timestamp: string;
    } | null;
  }
}
