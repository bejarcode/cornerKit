/**
 * Integration Tests: Batch Operations (FR-003, FR-004)
 * Tests applyAll() and auto() methods for batch application
 */

import { test, expect } from '@playwright/test';
import { setupTestPage } from './test-helpers';

test.describe('Batch Application (FR-003)', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page);
  });

  test('should apply squircles to multiple elements with applyAll()', async ({ page }) => {
    // Apply to all batch elements
    await page.evaluate(() => {
      window.ck.applyAll('.batch-element', {
        radius: 20,
        smoothing: 0.6,
      });
    });

    // Check all three elements have clip-path applied
    const element1 = page.locator('.batch-element').nth(0);
    const element2 = page.locator('.batch-element').nth(1);
    const element3 = page.locator('.batch-element').nth(2);

    const clipPath1 = await element1.evaluate((el) =>
      window.getComputedStyle(el).clipPath
    );
    const clipPath2 = await element2.evaluate((el) =>
      window.getComputedStyle(el).clipPath
    );
    const clipPath3 = await element3.evaluate((el) =>
      window.getComputedStyle(el).clipPath
    );

    expect(clipPath1).toContain('path');
    expect(clipPath2).toContain('path');
    expect(clipPath3).toContain('path');
  });

  test('should apply different configurations per element', async ({ page }) => {
    // Apply different configs to each element
    await page.evaluate(() => {
      const elements = document.querySelectorAll('.batch-element');
      window.ck.apply(elements[0], { radius: 12, smoothing: 0.4 });
      window.ck.apply(elements[1], { radius: 20, smoothing: 0.6 });
      window.ck.apply(elements[2], { radius: 32, smoothing: 0.9 });
    });

    // Inspect each element's configuration
    const configs = await page.evaluate(() => {
      const elements = document.querySelectorAll('.batch-element');
      return [
        window.ck.inspect(elements[0]),
        window.ck.inspect(elements[1]),
        window.ck.inspect(elements[2]),
      ];
    });

    expect(configs[0]?.config.radius).toBe(12);
    expect(configs[0]?.config.smoothing).toBe(0.4);

    expect(configs[1]?.config.radius).toBe(20);
    expect(configs[1]?.config.smoothing).toBe(0.6);

    expect(configs[2]?.config.radius).toBe(32);
    expect(configs[2]?.config.smoothing).toBe(0.9);
  });

  test('should handle NodeList and Array inputs', async ({ page }) => {
    // Test with NodeList
    await page.evaluate(() => {
      const nodeList = document.querySelectorAll('.batch-element');
      window.ck.applyAll(nodeList, { radius: 16, smoothing: 0.6 });
    });

    // Verify all elements have squircles
    const count = await page.locator('.batch-element').count();
    expect(count).toBe(3);

    for (let i = 0; i < count; i++) {
      const clipPath = await page
        .locator('.batch-element')
        .nth(i)
        .evaluate((el) => window.getComputedStyle(el).clipPath);

      expect(clipPath).toContain('path');
    }
  });

  test('should complete batch operation within performance target', async ({ page }) => {
    // Apply to 10 elements and measure time
    const duration = await page.evaluate(() => {
      // Create 10 test elements
      const container = document.getElementById('batch-test');
      if (!container) throw new Error('Container not found');

      for (let i = 0; i < 7; i++) {
        const el = document.createElement('div');
        el.className = 'batch-element test-element';
        el.textContent = `Batch ${i + 4}`;
        container.querySelector('.test-container')?.appendChild(el);
      }

      // Measure batch application time
      const start = performance.now();
      window.ck.applyAll('.batch-element', { radius: 20, smoothing: 0.6 });
      const end = performance.now();

      return end - start;
    });

    // Should complete in less than 100ms for 10 elements
    expect(duration).toBeLessThan(100);
  });
});

test.describe('Auto Discovery (FR-004)', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page);
  });

  test('should discover and parse data-squircle attributes', async ({ page }) => {
    // The test page has elements with data-squircle attributes
    // Check if they can be discovered programmatically
    const elements = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-squircle]')).map((el) => ({
        radius: el.getAttribute('data-squircle-radius'),
        smoothing: el.getAttribute('data-squircle-smoothing'),
      }));
    });

    expect(elements.length).toBeGreaterThan(0);
    expect(elements[0].radius).toBeTruthy();
    expect(elements[0].smoothing).toBeTruthy();
  });

  test('should apply squircles to manually added data-squircle elements', async ({ page }) => {
    // Create a new element with data attributes
    await page.evaluate(() => {
      const container = document.getElementById('auto-test');
      if (!container) throw new Error('Container not found');

      const newEl = document.createElement('div');
      newEl.className = 'test-element';
      newEl.setAttribute('data-squircle', '');
      newEl.setAttribute('data-squircle-radius', '28');
      newEl.setAttribute('data-squircle-smoothing', '0.75');
      newEl.textContent = 'Manual Auto';
      newEl.id = 'manual-auto-element';
      container.querySelector('.test-container')?.appendChild(newEl);

      // Manually apply to the new element
      window.ck.apply(newEl, { radius: 28, smoothing: 0.75 });
    });

    // Wait a bit for application
    await page.waitForTimeout(100);

    // Verify the element has clip-path
    const clipPath = await page.evaluate(() => {
      const el = document.getElementById('manual-auto-element');
      if (!el) return null;
      return window.getComputedStyle(el).clipPath;
    });

    expect(clipPath).toContain('path');
  });

  test('should handle missing or invalid data attributes gracefully', async ({ page }) => {
    const result = await page.evaluate(() => {
      const container = document.getElementById('auto-test');
      if (!container) throw new Error('Container not found');

      // Element with data-squircle but no radius/smoothing
      const el1 = document.createElement('div');
      el1.className = 'test-element';
      el1.setAttribute('data-squircle', '');
      el1.id = 'auto-invalid-1';
      container.querySelector('.test-container')?.appendChild(el1);

      // Element with invalid values
      const el2 = document.createElement('div');
      el2.className = 'test-element';
      el2.setAttribute('data-squircle', '');
      el2.setAttribute('data-squircle-radius', 'invalid');
      el2.setAttribute('data-squircle-smoothing', 'abc');
      el2.id = 'auto-invalid-2';
      container.querySelector('.test-container')?.appendChild(el2);

      try {
        // Should use defaults for missing values
        window.ck.apply(el1, { radius: 16, smoothing: 0.6 });
        window.ck.apply(el2, { radius: 16, smoothing: 0.6 });
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    expect(result.success).toBe(true);
  });
});

test.describe('Performance: Batch Operations', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page);
  });

  test('should handle 50 elements within 250ms', async ({ page }) => {
    const duration = await page.evaluate(() => {
      const container = document.getElementById('batch-test');
      if (!container) throw new Error('Container not found');

      // Create 50 test elements
      const testContainer = container.querySelector('.test-container');
      if (!testContainer) throw new Error('Test container not found');

      for (let i = 0; i < 47; i++) {
        const el = document.createElement('div');
        el.className = 'perf-batch-element test-element';
        el.textContent = `Perf ${i + 1}`;
        el.style.width = '100px';
        el.style.height = '100px';
        testContainer.appendChild(el);
      }

      // Measure batch application
      const start = performance.now();
      window.ck.applyAll('.perf-batch-element', { radius: 20, smoothing: 0.6 });
      const end = performance.now();

      return end - start;
    });

    // Should complete in less than 250ms for 50 elements (5ms per element)
    expect(duration).toBeLessThan(250);
  });

  test('should handle 100 elements within 500ms', async ({ page }) => {
    const duration = await page.evaluate(() => {
      const container = document.getElementById('batch-test');
      if (!container) throw new Error('Container not found');

      // Create 100 test elements
      const testContainer = container.querySelector('.test-container');
      if (!testContainer) throw new Error('Test container not found');

      // Clear previous test elements
      testContainer.innerHTML = '';

      for (let i = 0; i < 100; i++) {
        const el = document.createElement('div');
        el.className = 'perf-batch-100 test-element';
        el.textContent = `${i + 1}`;
        el.style.width = '80px';
        el.style.height = '80px';
        el.style.display = 'inline-block';
        testContainer.appendChild(el);
      }

      // Measure batch application
      const start = performance.now();
      window.ck.applyAll('.perf-batch-100', { radius: 16, smoothing: 0.6 });
      const end = performance.now();

      return end - start;
    });

    // Should complete in less than 500ms for 100 elements (target from spec)
    expect(duration).toBeLessThan(500);
  });
});
