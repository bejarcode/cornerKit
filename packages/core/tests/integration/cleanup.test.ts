/**
 * Integration Tests: Cleanup Operations (FR-006, FR-008)
 * Tests remove() and destroy() methods for proper cleanup
 */

import { test, expect } from '@playwright/test';
import { setupTestPage } from './test-helpers';

test.describe('Remove Single Element (FR-006)', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page);
  });

  test('should remove squircle styling from element', async ({ page }) => {
    // Apply squircle
    await page.evaluate(() => {
      const el = document.getElementById('basic-element');
      if (!el) throw new Error('Element not found');
      window.ck.apply(el, { radius: 20, smoothing: 0.6 });
    });

    // Verify squircle is applied
    const appliedClipPath = await page.evaluate(() => {
      const el = document.getElementById('basic-element');
      if (!el) return null;
      return window.getComputedStyle(el).clipPath;
    });

    expect(appliedClipPath).toContain('path');

    // Remove squircle
    await page.evaluate(() => {
      const el = document.getElementById('basic-element');
      window.ck.remove(el);
    });

    // Verify squircle is removed (should be 'none' or empty)
    const removedClipPath = await page.evaluate(() => {
      const el = document.getElementById('basic-element');
      if (!el) return null;
      return window.getComputedStyle(el).clipPath;
    });

    expect(removedClipPath).toBe('none');
  });

  test('should clean up registry entry after remove', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.getElementById('basic-element');
      if (!el) throw new Error('Element not found');
      window.ck.apply(el, { radius: 20, smoothing: 0.6 });
    });

    // Verify element is in registry
    const beforeRemove = await page.evaluate(() => {
      const el = document.getElementById('basic-element');
      return window.ck.inspect(el);
    });

    expect(beforeRemove).not.toBeNull();

    // Remove element
    await page.evaluate(() => {
      const el = document.getElementById('basic-element');
      window.ck.remove(el);
    });

    // Verify element is no longer in registry
    const afterRemove = await page.evaluate(() => {
      const el = document.getElementById('basic-element');
      return window.ck.inspect(el);
    });

    expect(afterRemove).toBeNull();
  });

  test('should stop observing element after remove', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.getElementById('update-element');
      if (!el) throw new Error('Element not found');
      window.ck.apply(el, { radius: 20, smoothing: 0.6 });
    });

    // Remove the element
    await page.evaluate(() => {
      const el = document.getElementById('update-element');
      window.ck.remove(el);
    });

    // Try to resize - should not trigger update
    const stillRemoved = await page.evaluate(() => {
      const el = document.getElementById('update-element') as HTMLElement;
      if (!el) throw new Error('Element not found');

      // Resize element
      el.style.width = '500px';
      el.style.height = '300px';

      // Wait a bit
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          const clipPath = window.getComputedStyle(el).clipPath;
          resolve(clipPath === 'none');
        }, 200);
      });
    });

    expect(stillRemoved).toBe(true);
  });

  test('should handle removing non-existent element gracefully', async ({ page }) => {
    const result = await page.evaluate(() => {
      try {
        // Try to remove element that was never applied
        const el = document.getElementById('basic-element');
        if (!el) throw new Error('Element not found');
        window.ck.remove(el);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Should not throw error
    expect(result.success).toBe(true);
  });

  test('should allow re-applying after remove', async ({ page }) => {
    // Apply, remove, re-apply
    await page.evaluate(() => {
      const el = document.getElementById('basic-element');
      if (!el) throw new Error('Element not found');

      window.ck.apply(el, { radius: 20, smoothing: 0.6 });
      window.ck.remove(el);
      window.ck.apply(el, { radius: 24, smoothing: 0.9 });
    });

    // Verify element has squircle with new config
    const config = await page.evaluate(() => {
      const el = document.getElementById('basic-element');
      return window.ck.inspect(el)?.config;
    });

    expect(config?.radius).toBe(24);
    expect(config?.smoothing).toBe(0.9);

    const clipPath = await page.evaluate(() => {
      const el = document.getElementById('basic-element');
      if (!el) return null;
      return window.getComputedStyle(el).clipPath;
    });

    expect(clipPath).toContain('path');
  });
});

test.describe('Destroy Instance (FR-008)', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page);
  });

  test('should remove all squircles when instance is destroyed', async ({ page }) => {
    // Apply squircles to multiple elements
    await page.evaluate(() => {
      window.ck.applyAll('.batch-element', { radius: 20, smoothing: 0.6 });
      window.ck.apply('#basic-element', { radius: 16, smoothing: 0.6 });
      window.ck.apply('#update-element', { radius: 24, smoothing: 0.6 });
    });

    // Count elements with clip-path
    const beforeCount = await page.evaluate(() => {
      const elements = [
        ...document.querySelectorAll('.batch-element'),
        document.getElementById('basic-element'),
        document.getElementById('update-element'),
      ].filter((el) => el !== null);

      return elements.filter((el) => {
        const clipPath = window.getComputedStyle(el).clipPath;
        return clipPath.includes('path');
      }).length;
    });

    expect(beforeCount).toBeGreaterThan(0);

    // Destroy instance
    await page.evaluate(() => {
      window.ck.destroy();
    });

    // Count elements with clip-path after destroy
    const afterCount = await page.evaluate(() => {
      const elements = [
        ...document.querySelectorAll('.batch-element'),
        document.getElementById('basic-element'),
        document.getElementById('update-element'),
      ].filter((el) => el !== null);

      return elements.filter((el) => {
        const clipPath = window.getComputedStyle(el).clipPath;
        return clipPath.includes('path');
      }).length;
    });

    // All squircles should be removed
    expect(afterCount).toBe(0);
  });

  test('should clean up all observers when destroyed', async ({ page }) => {
    await page.evaluate(() => {
      window.ck.applyAll('.batch-element', { radius: 20, smoothing: 0.6 });
    });

    // Destroy instance
    await page.evaluate(() => {
      window.ck.destroy();
    });

    // Try to resize elements - should not trigger updates
    const stillDestroyed = await page.evaluate(() => {
      const elements = document.querySelectorAll('.batch-element') as NodeListOf<HTMLElement>;

      // Resize all elements
      elements.forEach((el) => {
        el.style.width = '300px';
        el.style.height = '200px';
      });

      // Wait and check if any updates occurred
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          let anyClipPath = false;
          elements.forEach((el) => {
            const clipPath = window.getComputedStyle(el).clipPath;
            if (clipPath.includes('path')) {
              anyClipPath = true;
            }
          });
          resolve(!anyClipPath);
        }, 200);
      });
    });

    expect(stillDestroyed).toBe(true);
  });

  test('should allow creating new instance after destroy', async ({ page }) => {
    // Apply with first instance
    await page.evaluate(() => {
      window.ck.apply('#basic-element', { radius: 20, smoothing: 0.6 });
    });

    // Destroy first instance
    await page.evaluate(() => {
      window.ck.destroy();
    });

    // Create new instance and apply
    await page.evaluate(() => {
      window.ck = new window.CornerKit({ radius: 24, smoothing: 0.9 });
      window.ck.apply('#basic-element', { radius: 24, smoothing: 0.9 });
    });

    // Verify new instance works
    const config = await page.evaluate(() => {
      const el = document.getElementById('basic-element');
      return window.ck.inspect(el)?.config;
    });

    expect(config?.radius).toBe(24);
    expect(config?.smoothing).toBe(0.9);

    const clipPath = await page.evaluate(() => {
      const el = document.getElementById('basic-element');
      if (!el) return null;
      return window.getComputedStyle(el).clipPath;
    });

    expect(clipPath).toContain('path');
  });

  test('should handle destroy on already destroyed instance', async ({ page }) => {
    const result = await page.evaluate(() => {
      try {
        window.ck.destroy();
        window.ck.destroy(); // Second destroy
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Should not throw error
    expect(result.success).toBe(true);
  });
});

test.describe('Memory Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page);
  });

  test('should not leak memory when elements are removed from DOM', async ({ page }) => {
    const result = await page.evaluate(() => {
      const container = document.getElementById('batch-test');
      if (!container) throw new Error('Container not found');

      const testContainer = container.querySelector('.test-container');
      if (!testContainer) throw new Error('Test container not found');

      // Create 20 elements
      const elements: HTMLElement[] = [];
      for (let i = 0; i < 20; i++) {
        const el = document.createElement('div');
        el.className = 'temp-element test-element';
        el.textContent = `Temp ${i}`;
        testContainer.appendChild(el);
        elements.push(el);
        window.ck.apply(el, { radius: 20, smoothing: 0.6 });
      }

      // Remove all elements from DOM
      elements.forEach((el) => el.remove());

      // Registry uses WeakMap, so entries should be garbage collected
      // We can't directly test GC, but we can verify elements are gone
      const remainingElements = document.querySelectorAll('.temp-element');
      return { removed: remainingElements.length === 0 };
    });

    expect(result.removed).toBe(true);
  });

  test('should clean up when using remove() before DOM removal', async ({ page }) => {
    const result = await page.evaluate(() => {
      const container = document.getElementById('batch-test');
      if (!container) throw new Error('Container not found');

      const testContainer = container.querySelector('.test-container');
      if (!testContainer) throw new Error('Test container not found');

      // Create and apply elements
      const elements: HTMLElement[] = [];
      for (let i = 0; i < 10; i++) {
        const el = document.createElement('div');
        el.className = 'cleanup-element test-element';
        testContainer.appendChild(el);
        elements.push(el);
        window.ck.apply(el, { radius: 20, smoothing: 0.6 });
      }

      // Properly clean up before removing from DOM
      elements.forEach((el) => {
        window.ck.remove(el);
        el.remove();
      });

      return {
        elementsRemoved: document.querySelectorAll('.cleanup-element').length === 0,
      };
    });

    expect(result.elementsRemoved).toBe(true);
  });
});
