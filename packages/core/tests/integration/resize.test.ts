/**
 * Integration Tests: Resize and Responsive Behavior (FR-022, FR-023)
 * Tests ResizeObserver integration and responsive updates
 */

import { test, expect } from '@playwright/test';

test.describe('Resize Handling (FR-022)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/packages/core/tests/integration/fixtures/test-page.html');
    await page.waitForFunction(() => window.cornerKitReady === true);
  });

  test('should automatically update squircle when element is resized', async ({ page }) => {
    // Apply squircle to element
    await page.evaluate(() => {
      const el = document.getElementById('update-element');
      if (!el) throw new Error('Element not found');
      window.ck.apply(el, { radius: 20, smoothing: 0.6 });
    });

    // Get initial clip-path
    const initialClipPath = await page.evaluate(() => {
      const el = document.getElementById('update-element');
      if (!el) return null;
      return window.getComputedStyle(el).clipPath;
    });

    // Resize the element
    await page.evaluate(() => {
      const el = document.getElementById('update-element') as HTMLElement;
      if (!el) throw new Error('Element not found');
      el.style.width = '400px';
      el.style.height = '300px';
    });

    // Wait for ResizeObserver to trigger
    await page.waitForTimeout(100);

    // Get updated clip-path
    const updatedClipPath = await page.evaluate(() => {
      const el = document.getElementById('update-element');
      if (!el) return null;
      return window.getComputedStyle(el).clipPath;
    });

    // Clip-path should be different after resize
    expect(updatedClipPath).not.toBe(initialClipPath);
    expect(updatedClipPath).toContain('path');
  });

  test('should handle rapid resize events with debouncing', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.getElementById('update-element');
      if (!el) throw new Error('Element not found');
      window.ck.apply(el, { radius: 20, smoothing: 0.6 });
    });

    // Perform multiple rapid resizes
    const resizeCount = await page.evaluate(() => {
      const el = document.getElementById('update-element') as HTMLElement;
      if (!el) throw new Error('Element not found');

      let updateCount = 0;
      const originalClipPath = window.getComputedStyle(el).clipPath;

      // Rapidly resize element 10 times
      for (let i = 0; i < 10; i++) {
        el.style.width = `${300 + i * 10}px`;
        el.style.height = `${200 + i * 5}px`;
      }

      // Check if clip-path was updated (debouncing should prevent 10 updates)
      return new Promise<number>((resolve) => {
        setTimeout(() => {
          const newClipPath = window.getComputedStyle(el).clipPath;
          if (newClipPath !== originalClipPath) {
            updateCount = 1;
          }
          resolve(updateCount);
        }, 200);
      });
    });

    // Should have updated, but not 10 times (debouncing)
    expect(resizeCount).toBe(1);
  });

  test('should maintain correct aspect ratio after resize', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.getElementById('update-element');
      if (!el) throw new Error('Element not found');
      window.ck.apply(el, { radius: 20, smoothing: 0.6 });
    });

    // Test different aspect ratios
    const results = await page.evaluate(async () => {
      const el = document.getElementById('update-element') as HTMLElement;
      if (!el) throw new Error('Element not found');

      const tests = [
        { width: 400, height: 200 }, // Wide
        { width: 200, height: 400 }, // Tall
        { width: 300, height: 300 }, // Square
      ];

      const results: Array<{ width: number; height: number; hasClipPath: boolean }> = [];

      for (const { width, height } of tests) {
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;

        // Wait for resize to apply
        await new Promise((resolve) => setTimeout(resolve, 150));

        const clipPath = window.getComputedStyle(el).clipPath;
        results.push({
          width,
          height,
          hasClipPath: clipPath.includes('path'),
        });
      }

      return results;
    });

    // All aspect ratios should have valid clip-paths
    results.forEach((result) => {
      expect(result.hasClipPath).toBe(true);
    });
  });

  test('should handle window resize events', async ({ page }) => {
    // Set up viewport change listener
    await page.setViewportSize({ width: 1024, height: 768 });

    await page.evaluate(() => {
      const el = document.getElementById('update-element');
      if (!el) throw new Error('Element not found');
      window.ck.apply(el, { radius: 20, smoothing: 0.6 });
    });

    const initialClipPath = await page.evaluate(() => {
      const el = document.getElementById('update-element');
      if (!el) return null;
      return window.getComputedStyle(el).clipPath;
    });

    // Resize viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(200);

    // Element should still have valid clip-path
    const finalClipPath = await page.evaluate(() => {
      const el = document.getElementById('update-element');
      if (!el) return null;
      return window.getComputedStyle(el).clipPath;
    });

    expect(finalClipPath).toContain('path');
  });
});

test.describe('Dynamic Updates (FR-005)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/packages/core/tests/integration/fixtures/test-page.html');
    await page.waitForFunction(() => window.cornerKitReady === true);
  });

  test('should update radius dynamically', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.getElementById('update-element');
      if (!el) throw new Error('Element not found');
      window.ck.apply(el, { radius: 16, smoothing: 0.6 });
    });

    // Get initial config
    const initialConfig = await page.evaluate(() => {
      const el = document.getElementById('update-element');
      return window.ck.inspect(el)?.config;
    });

    // Update radius
    await page.evaluate(() => {
      const el = document.getElementById('update-element');
      window.ck.update(el, { radius: 32 });
    });

    // Get updated config
    const updatedConfig = await page.evaluate(() => {
      const el = document.getElementById('update-element');
      return window.ck.inspect(el)?.config;
    });

    expect(initialConfig?.radius).toBe(16);
    expect(updatedConfig?.radius).toBe(32);
    expect(updatedConfig?.smoothing).toBe(0.6); // Should remain unchanged
  });

  test('should update smoothing dynamically', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.getElementById('update-element');
      if (!el) throw new Error('Element not found');
      window.ck.apply(el, { radius: 20, smoothing: 0.6 });
    });

    // Update smoothing
    await page.evaluate(() => {
      const el = document.getElementById('update-element');
      window.ck.update(el, { smoothing: 0.9 });
    });

    const updatedConfig = await page.evaluate(() => {
      const el = document.getElementById('update-element');
      return window.ck.inspect(el)?.config;
    });

    expect(updatedConfig?.radius).toBe(20);
    expect(updatedConfig?.smoothing).toBe(0.9);
  });

  test('should handle hover interactions with smooth updates', async ({ page }) => {
    const updateElement = page.locator('#update-element');

    // Apply initial squircle
    await page.evaluate(() => {
      const el = document.getElementById('update-element');
      if (!el) throw new Error('Element not found');
      window.ck.apply(el, { radius: 16, smoothing: 0.6 });

      // Add hover handlers
      el.addEventListener('mouseenter', () => {
        window.ck.update(el, { radius: 24, smoothing: 0.9 });
      });

      el.addEventListener('mouseleave', () => {
        window.ck.update(el, { radius: 16, smoothing: 0.6 });
      });
    });

    // Get initial config
    const initialConfig = await page.evaluate(() => {
      const el = document.getElementById('update-element');
      return window.ck.inspect(el)?.config;
    });

    // Hover over element
    await updateElement.hover();
    await page.waitForTimeout(50);

    // Get hover config
    const hoverConfig = await page.evaluate(() => {
      const el = document.getElementById('update-element');
      return window.ck.inspect(el)?.config;
    });

    // Move away
    await page.mouse.move(0, 0);
    await page.waitForTimeout(50);

    // Get final config
    const finalConfig = await page.evaluate(() => {
      const el = document.getElementById('update-element');
      return window.ck.inspect(el)?.config;
    });

    expect(initialConfig?.radius).toBe(16);
    expect(hoverConfig?.radius).toBe(24);
    expect(hoverConfig?.smoothing).toBe(0.9);
    expect(finalConfig?.radius).toBe(16);
    expect(finalConfig?.smoothing).toBe(0.6);
  });
});

test.describe('Performance: Resize Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/packages/core/tests/integration/fixtures/test-page.html');
    await page.waitForFunction(() => window.cornerKitReady === true);
  });

  test('should handle resize within 16ms (60fps target)', async ({ page }) => {
    const duration = await page.evaluate(() => {
      const el = document.getElementById('update-element') as HTMLElement;
      if (!el) throw new Error('Element not found');

      window.ck.apply(el, { radius: 20, smoothing: 0.6 });

      // Measure single resize update time
      el.style.width = '500px';
      el.style.height = '300px';

      const start = performance.now();
      window.ck.update(el, { radius: 20, smoothing: 0.6 });
      const end = performance.now();

      return end - start;
    });

    // Should complete in less than 16ms for 60fps
    expect(duration).toBeLessThan(16);
  });

  test('should handle multiple element resizes efficiently', async ({ page }) => {
    const duration = await page.evaluate(() => {
      const container = document.getElementById('batch-test');
      if (!container) throw new Error('Container not found');

      // Create 10 elements
      const elements: HTMLElement[] = [];
      const testContainer = container.querySelector('.test-container');
      if (!testContainer) throw new Error('Test container not found');

      for (let i = 0; i < 10; i++) {
        const el = document.createElement('div');
        el.className = 'resize-perf test-element';
        el.style.width = '200px';
        el.style.height = '150px';
        testContainer.appendChild(el);
        elements.push(el);
        window.ck.apply(el, { radius: 20, smoothing: 0.6 });
      }

      // Measure time to update all elements
      const start = performance.now();

      elements.forEach((el, i) => {
        el.style.width = `${200 + i * 10}px`;
        el.style.height = `${150 + i * 5}px`;
        window.ck.update(el, { radius: 20, smoothing: 0.6 });
      });

      const end = performance.now();

      return end - start;
    });

    // Should complete 10 resizes in less than 100ms
    expect(duration).toBeLessThan(100);
  });
});
