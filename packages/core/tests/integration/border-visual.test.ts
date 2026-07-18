import { test, expect } from '@playwright/test';
import { setupTestPage } from './test-helpers';

/**
 * Integration Tests: Border Rendering (Feature 006)
 * Visual tests for SVG-based border rendering
 * T021: Solid border visual tests
 * T025: Dashed border visual tests
 */

test.beforeEach(async ({ page }) => {
  await setupTestPage(page);
});

test.describe('Solid Border Rendering (T021)', () => {
  test('should apply solid border with SVG', async ({ page }) => {
    // Apply squircle with solid border
    await page.evaluate(() => {
      const element = document.getElementById('solid-border-element');
      window.ck.apply(element, {
        radius: 24,
        smoothing: 0.6,
        border: { width: 2, color: '#3b82f6' }
      });
    });

    // Verify SVG border element is created (uses .cornerkit-border class)
    const hasBorderSvg = await page.locator('#solid-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      return svg !== null;
    });
    expect(hasBorderSvg).toBe(true);

    // Verify element has transparent background (SVG handles it)
    const bgColor = await page.locator('#solid-border-element').evaluate((el: HTMLElement) => {
      return el.style.backgroundColor;
    });
    expect(bgColor).toBe('transparent');

    // Verify isolation context is set
    const isolation = await page.locator('#solid-border-element').evaluate((el: HTMLElement) => {
      return el.style.isolation;
    });
    expect(isolation).toBe('isolate');

    // Take screenshot for visual verification
    const element = page.locator('#solid-border-element');
    await expect(element).toBeVisible();
  });

  test('should render solid border on dark background without fringe', async ({ page }) => {
    // Apply squircle with border on dark background element
    await page.evaluate(() => {
      const element = document.getElementById('dark-bg-solid');
      window.ck.apply(element, {
        radius: 20,
        smoothing: 0.6,
        border: { width: 2, color: '#60a5fa' }
      });
    });

    // Verify SVG border is present
    const hasBorderSvg = await page.locator('#dark-bg-solid').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      return svg !== null;
    });
    expect(hasBorderSvg).toBe(true);

    // Verify NO CSS clip-path is applied (prevents anti-aliasing fringe)
    const clipPath = await page.locator('#dark-bg-solid').evaluate((el: HTMLElement) => {
      return el.style.clipPath;
    });
    expect(clipPath).toBe('');

    // Verify element is visible with proper dimensions
    const element = page.locator('#dark-bg-solid');
    await expect(element).toBeVisible();
    const box = await element.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThan(0);
  });

  test('should capture and restore background color', async ({ page }) => {
    // Apply border, then remove and check restoration
    const originalBg = await page.evaluate(() => {
      const element = document.getElementById('solid-border-element');
      const computed = getComputedStyle(element!);
      return computed.backgroundColor;
    });

    // Apply squircle with border
    await page.evaluate(() => {
      const element = document.getElementById('solid-border-element');
      window.ck.apply(element, {
        radius: 24,
        smoothing: 0.6,
        border: { width: 2, color: '#3b82f6' }
      });
    });

    // Verify background is transparent while border is active
    const transparentBg = await page.locator('#solid-border-element').evaluate((el: HTMLElement) => {
      return el.style.backgroundColor;
    });
    expect(transparentBg).toBe('transparent');

    // Remove squircle
    await page.evaluate(() => {
      const element = document.getElementById('solid-border-element');
      window.ck.remove(element);
    });

    // Verify SVG is removed
    const hasBorderSvgAfter = await page.locator('#solid-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      return svg !== null;
    });
    expect(hasBorderSvgAfter).toBe(false);
  });
});

test.describe('Dashed Border Rendering (T025)', () => {
  test('should apply dashed border style', async ({ page }) => {
    // Apply squircle with dashed border
    await page.evaluate(() => {
      const element = document.getElementById('dashed-border-element');
      window.ck.apply(element, {
        radius: 24,
        smoothing: 0.6,
        border: { width: 2, color: '#10b981', style: 'dashed' }
      });
    });

    // Verify SVG border element is created
    const hasBorderSvg = await page.locator('#dashed-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      return svg !== null;
    });
    expect(hasBorderSvg).toBe(true);

    // Verify stroke-dasharray is applied for dashed style (select border path with fill=none)
    const hasDashArray = await page.locator('#dashed-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      if (!svg) return false;
      // Border path has fill="none", background path has fill with color
      const borderPath = svg.querySelector('path[fill="none"]');
      if (!borderPath) return false;
      const dashArray = borderPath.getAttribute('stroke-dasharray');
      return dashArray !== null && dashArray !== '';
    });
    expect(hasDashArray).toBe(true);

    // Take screenshot for visual verification
    const element = page.locator('#dashed-border-element');
    await expect(element).toBeVisible();
  });

  test('should apply dashed border on dark background', async ({ page }) => {
    // Apply squircle with dashed border on dark background
    await page.evaluate(() => {
      const element = document.getElementById('dark-bg-dashed');
      window.ck.apply(element, {
        radius: 20,
        smoothing: 0.6,
        border: { width: 2, color: '#34d399', style: 'dashed' }
      });
    });

    // Verify SVG border is present
    const hasBorderSvg = await page.locator('#dark-bg-dashed').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      return svg !== null;
    });
    expect(hasBorderSvg).toBe(true);

    // Verify element is visible
    const element = page.locator('#dark-bg-dashed');
    await expect(element).toBeVisible();
  });

  test('should apply dotted border style', async ({ page }) => {
    // Apply squircle with dotted border
    await page.evaluate(() => {
      const element = document.getElementById('dotted-border-element');
      window.ck.apply(element, {
        radius: 24,
        smoothing: 0.6,
        border: { width: 2, color: '#f59e0b', style: 'dotted' }
      });
    });

    // Verify SVG border element is created
    const hasBorderSvg = await page.locator('#dotted-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      return svg !== null;
    });
    expect(hasBorderSvg).toBe(true);

    // Verify stroke-linecap is round for dotted style (select border path with fill=none)
    const hasRoundLinecap = await page.locator('#dotted-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      if (!svg) return false;
      const borderPath = svg.querySelector('path[fill="none"]');
      if (!borderPath) return false;
      const linecap = borderPath.getAttribute('stroke-linecap');
      return linecap === 'round';
    });
    expect(hasRoundLinecap).toBe(true);
  });

  test('should apply custom dashArray', async ({ page }) => {
    // Apply squircle with custom dash pattern
    await page.evaluate(() => {
      const element = document.getElementById('dashed-border-element');
      window.ck.apply(element, {
        radius: 24,
        smoothing: 0.6,
        border: { width: 2, color: '#8b5cf6', dashArray: '12 6' }
      });
    });

    // Verify custom dashArray is applied (select border path with fill=none)
    const dashArray = await page.locator('#dashed-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      if (!svg) return null;
      const borderPath = svg.querySelector('path[fill="none"]');
      if (!borderPath) return null;
      return borderPath.getAttribute('stroke-dasharray');
    });
    expect(dashArray).toBe('12 6');
  });

  test('should use custom dashArray over style preset when both specified', async ({ page }) => {
    // When both style: 'dashed' and dashArray are provided, dashArray should win
    await page.evaluate(() => {
      const element = document.getElementById('dashed-border-element');
      window.ck.apply(element, {
        radius: 24,
        smoothing: 0.6,
        border: { width: 2, color: '#8b5cf6', style: 'dashed', dashArray: '12 6' }
      });
    });

    // Verify custom dashArray (12 6) is used, NOT dashed preset (8 4)
    const dashArray = await page.locator('#dashed-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      if (!svg) return null;
      const borderPath = svg.querySelector('path[fill="none"]');
      if (!borderPath) return null;
      return borderPath.getAttribute('stroke-dasharray');
    });
    expect(dashArray).toBe('12 6');
  });
});

test.describe('Gradient Border Rendering', () => {
  test('should apply gradient border', async ({ page }) => {
    // Apply squircle with gradient border
    await page.evaluate(() => {
      const element = document.getElementById('gradient-border-element');
      window.ck.apply(element, {
        radius: 24,
        smoothing: 0.6,
        border: {
          width: 3,
          gradient: [
            { offset: '0%', color: '#3b82f6' },
            { offset: '100%', color: '#8b5cf6' }
          ]
        }
      });
    });

    // Verify SVG border element is created
    const hasBorderSvg = await page.locator('#gradient-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      return svg !== null;
    });
    expect(hasBorderSvg).toBe(true);

    // Verify linearGradient definition exists
    const hasGradientDef = await page.locator('#gradient-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      if (!svg) return false;
      const gradient = svg.querySelector('linearGradient');
      return gradient !== null;
    });
    expect(hasGradientDef).toBe(true);

    // Verify gradient has correct stops
    const stopCount = await page.locator('#gradient-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      if (!svg) return 0;
      const stops = svg.querySelectorAll('linearGradient stop');
      return stops.length;
    });
    expect(stopCount).toBe(2);
  });
});

test.describe('Border Resize Handling (T042)', () => {
  test('should update border SVG viewBox on resize', async ({ page }) => {
    // Apply squircle with border
    await page.evaluate(() => {
      const element = document.getElementById('solid-border-element');
      window.ck.apply(element, {
        radius: 24,
        smoothing: 0.6,
        border: { width: 2, color: '#3b82f6' }
      });
    });

    // Get initial viewBox
    const initialViewBox = await page.locator('#solid-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      return svg?.getAttribute('viewBox');
    });

    // Verify initial viewBox exists
    expect(initialViewBox).toBeTruthy();

    // Resize the element
    await page.evaluate(() => {
      const element = document.getElementById('solid-border-element') as HTMLElement;
      element.style.width = '300px';
      element.style.height = '200px';
    });

    // Wait for ResizeObserver to trigger
    await page.waitForTimeout(150);

    // Get updated viewBox
    const updatedViewBox = await page.locator('#solid-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      return svg?.getAttribute('viewBox');
    });

    // ViewBox should be updated to match new dimensions
    expect(updatedViewBox).toBeTruthy();
    expect(updatedViewBox).not.toBe(initialViewBox);
    expect(updatedViewBox).toContain('300');
    expect(updatedViewBox).toContain('200');
  });

  test('should maintain border style during resize', async ({ page }) => {
    // Apply dashed border
    await page.evaluate(() => {
      const element = document.getElementById('dashed-border-element');
      window.ck.apply(element, {
        radius: 24,
        smoothing: 0.6,
        border: { width: 2, color: '#10b981', style: 'dashed' }
      });
    });

    // Get initial dash array
    const initialDashArray = await page.locator('#dashed-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      const borderPath = svg?.querySelector('path[fill="none"]');
      return borderPath?.getAttribute('stroke-dasharray');
    });

    expect(initialDashArray).toBeTruthy();

    // Resize element
    await page.evaluate(() => {
      const element = document.getElementById('dashed-border-element') as HTMLElement;
      element.style.width = '280px';
      element.style.height = '180px';
    });

    await page.waitForTimeout(150);

    // Verify dash array is preserved
    const afterResizeDashArray = await page.locator('#dashed-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      const borderPath = svg?.querySelector('path[fill="none"]');
      return borderPath?.getAttribute('stroke-dasharray');
    });

    expect(afterResizeDashArray).toBeTruthy();
    expect(afterResizeDashArray).toBe(initialDashArray);
  });

  test('should maintain gradient during resize', async ({ page }) => {
    // Apply gradient border
    await page.evaluate(() => {
      const element = document.getElementById('gradient-border-element');
      window.ck.apply(element, {
        radius: 24,
        smoothing: 0.6,
        border: {
          width: 3,
          gradient: [
            { offset: '0%', color: '#3b82f6' },
            { offset: '100%', color: '#8b5cf6' }
          ]
        }
      });
    });

    // Verify gradient exists initially
    const initialGradient = await page.locator('#gradient-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      const gradient = svg?.querySelector('linearGradient');
      const stops = gradient?.querySelectorAll('stop');
      return {
        exists: !!gradient,
        stopCount: stops?.length || 0
      };
    });

    expect(initialGradient.exists).toBe(true);
    expect(initialGradient.stopCount).toBe(2);

    // Resize element
    await page.evaluate(() => {
      const element = document.getElementById('gradient-border-element') as HTMLElement;
      element.style.width = '250px';
      element.style.height = '170px';
    });

    await page.waitForTimeout(150);

    // Verify gradient is preserved after resize
    const afterResizeGradient = await page.locator('#gradient-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      const gradient = svg?.querySelector('linearGradient');
      const stops = gradient?.querySelectorAll('stop');
      return {
        exists: !!gradient,
        stopCount: stops?.length || 0
      };
    });

    expect(afterResizeGradient.exists).toBe(true);
    expect(afterResizeGradient.stopCount).toBe(2);
  });

  test('should handle rapid resize with border without errors', async ({ page }) => {
    // Apply border
    await page.evaluate(() => {
      const element = document.getElementById('solid-border-element');
      window.ck.apply(element, {
        radius: 24,
        smoothing: 0.6,
        border: { width: 2, color: '#ef4444' }
      });
    });

    // Perform rapid resizes
    const result = await page.evaluate(async () => {
      const element = document.getElementById('solid-border-element') as HTMLElement;
      let errorOccurred = false;

      try {
        for (let i = 0; i < 10; i++) {
          element.style.width = `${200 + i * 10}px`;
          element.style.height = `${150 + i * 5}px`;
        }

        // Wait for debouncing to complete
        await new Promise(resolve => setTimeout(resolve, 200));

        // Check if SVG still exists and is valid
        const svg = element.querySelector('svg.cornerkit-border');
        if (!svg) {
          return { success: false, error: 'SVG not found after rapid resize' };
        }

        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    });

    expect(result.success).toBe(true);
  });
});

test.describe('Border Dynamic Updates', () => {
  test('should update border configuration dynamically', async ({ page }) => {
    // Apply initial solid border
    await page.evaluate(() => {
      const element = document.getElementById('solid-border-element');
      window.ck.apply(element, {
        radius: 24,
        smoothing: 0.6,
        border: { width: 2, color: '#3b82f6' }
      });
    });

    // Verify initial border (select border path with fill=none)
    let borderColor = await page.locator('#solid-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      if (!svg) return null;
      const borderPath = svg.querySelector('path[fill="none"]');
      if (!borderPath) return null;
      return borderPath.getAttribute('stroke');
    });
    expect(borderColor).toBe('#3b82f6');

    // Update to different border color
    await page.evaluate(() => {
      const element = document.getElementById('solid-border-element');
      window.ck.update(element, {
        border: { width: 3, color: '#ef4444' }
      });
    });

    // Verify updated border
    borderColor = await page.locator('#solid-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      if (!svg) return null;
      const borderPath = svg.querySelector('path[fill="none"]');
      if (!borderPath) return null;
      return borderPath.getAttribute('stroke');
    });
    expect(borderColor).toBe('#ef4444');
  });

  test('should switch from border to no-border', async ({ page }) => {
    // Apply with border
    await page.evaluate(() => {
      const element = document.getElementById('solid-border-element');
      window.ck.apply(element, {
        radius: 24,
        smoothing: 0.6,
        border: { width: 2, color: '#3b82f6' }
      });
    });

    // Verify border exists
    let hasBorderSvg = await page.locator('#solid-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      return svg !== null;
    });
    expect(hasBorderSvg).toBe(true);

    // Remove squircle and re-apply without border
    // Note: update() with undefined doesn't remove border due to config merging
    // The proper way is to remove() and apply() again
    await page.evaluate(() => {
      const element = document.getElementById('solid-border-element');
      window.ck.remove(element);
      window.ck.apply(element, {
        radius: 24,
        smoothing: 0.6
        // No border property = no border
      });
    });

    // Verify border is removed and clip-path is applied
    hasBorderSvg = await page.locator('#solid-border-element').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      return svg !== null;
    });
    expect(hasBorderSvg).toBe(false);

    const clipPath = await page.locator('#solid-border-element').evaluate((el: HTMLElement) => {
      return el.style.clipPath;
    });
    expect(clipPath).toContain('path');
  });
});

test.describe('Border Data Attributes (T050)', () => {
  test('should apply solid border via data attributes using auto()', async ({ page }) => {
    // Scroll element into view so auto() treats it as visible (not deferred)
    await page.locator('#border-attr-solid').scrollIntoViewIfNeeded();

    // Call auto() to discover and apply elements with data attributes
    await page.evaluate(() => {
      window.ck.auto();
    });

    // Wait for auto() processing
    await page.waitForTimeout(100);

    // Verify SVG border element is created for solid border
    const hasBorderSvg = await page.locator('#border-attr-solid').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      return svg !== null;
    });
    expect(hasBorderSvg).toBe(true);

    // Verify border color from data attribute
    const borderColor = await page.locator('#border-attr-solid').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      const borderPath = svg?.querySelector('path[fill="none"]');
      return borderPath?.getAttribute('stroke');
    });
    expect(borderColor).toBe('#3b82f6');

    // Verify config was parsed correctly
    const config = await page.evaluate(() => {
      const el = document.getElementById('border-attr-solid');
      return window.ck.inspect(el)?.config;
    });
    expect(config?.radius).toBe(24);
    expect(config?.smoothing).toBe(0.6);
    expect(config?.border?.width).toBe(2);
    expect(config?.border?.color).toBe('#3b82f6');
  });

  test('should apply dashed border via data attributes', async ({ page }) => {
    // Scroll element into view so auto() treats it as visible (not deferred)
    await page.locator('#border-attr-dashed').scrollIntoViewIfNeeded();

    await page.evaluate(() => {
      window.ck.auto();
    });

    await page.waitForTimeout(100);

    // Verify dashed border has dash array
    const hasDashArray = await page.locator('#border-attr-dashed').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      const borderPath = svg?.querySelector('path[fill="none"]');
      const dashArray = borderPath?.getAttribute('stroke-dasharray');
      return dashArray !== null && dashArray !== '';
    });
    expect(hasDashArray).toBe(true);

    // Verify config
    const config = await page.evaluate(() => {
      const el = document.getElementById('border-attr-dashed');
      return window.ck.inspect(el)?.config;
    });
    expect(config?.border?.style).toBe('dashed');
    expect(config?.border?.color).toBe('#10b981');
  });

  test('should apply dotted border via data attributes', async ({ page }) => {
    // Scroll element into view so auto() treats it as visible (not deferred)
    await page.locator('#border-attr-dotted').scrollIntoViewIfNeeded();

    await page.evaluate(() => {
      window.ck.auto();
    });

    await page.waitForTimeout(100);

    // Verify dotted border has round linecap
    const hasRoundLinecap = await page.locator('#border-attr-dotted').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      const borderPath = svg?.querySelector('path[fill="none"]');
      return borderPath?.getAttribute('stroke-linecap') === 'round';
    });
    expect(hasRoundLinecap).toBe(true);

    // Verify config
    const config = await page.evaluate(() => {
      const el = document.getElementById('border-attr-dotted');
      return window.ck.inspect(el)?.config;
    });
    expect(config?.border?.style).toBe('dotted');
    expect(config?.border?.color).toBe('#f59e0b');
  });

  test('should use default width when only border-color is specified', async ({ page }) => {
    // Scroll element into view so auto() treats it as visible (not deferred)
    await page.locator('#border-attr-color-only').scrollIntoViewIfNeeded();

    await page.evaluate(() => {
      window.ck.auto();
    });

    await page.waitForTimeout(100);

    // Verify border was created
    const hasBorderSvg = await page.locator('#border-attr-color-only').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      return svg !== null;
    });
    expect(hasBorderSvg).toBe(true);

    // Verify config has default width of 1
    const config = await page.evaluate(() => {
      const el = document.getElementById('border-attr-color-only');
      return window.ck.inspect(el)?.config;
    });
    expect(config?.border?.width).toBe(1);
    expect(config?.border?.color).toBe('#ef4444');
  });

  test('should not create border when only width is specified (no color)', async ({ page }) => {
    // Scroll test container into view so dynamically added element is visible
    await page.locator('#border-data-attr-test').scrollIntoViewIfNeeded();

    // Add element dynamically with only width attribute (no color)
    await page.evaluate(() => {
      const container = document.getElementById('border-data-attr-test')?.querySelector('.test-container');
      const el = document.createElement('div');
      el.id = 'border-width-only';
      el.setAttribute('data-squircle', '');
      el.setAttribute('data-squircle-border-width', '3');
      el.style.cssText = 'width: 150px; height: 100px; background: #1a1a2e;';
      container?.appendChild(el);

      // Apply via auto()
      window.ck.auto();
    });

    await page.waitForTimeout(100);

    // Verify no border SVG was created (color is required)
    const hasBorderSvg = await page.locator('#border-width-only').evaluate((el: HTMLElement) => {
      const svg = el.querySelector('svg.cornerkit-border');
      return svg !== null;
    });
    expect(hasBorderSvg).toBe(false);

    // Verify element still has clip-path (squircle applied, just no border)
    const hasClipPath = await page.locator('#border-width-only').evaluate((el: HTMLElement) => {
      return el.style.clipPath !== '';
    });
    expect(hasClipPath).toBe(true);
  });
});

test.describe('Border CSS Custom Properties (issue #4: hover effects)', () => {
  test('should restyle border and background via CSS variables on hover', async ({ page }) => {
    // User-land CSS: hover restyles border and background via variables only
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = `
        #solid-border-element:hover {
          --ck-border-color: rgb(255, 0, 0);
          --ck-background: rgb(0, 0, 255);
        }
      `;
      document.head.appendChild(style);

      const element = document.getElementById('solid-border-element');
      window.ck.apply(element, {
        radius: 24,
        smoothing: 0.6,
        border: { width: 3, color: '#3b82f6' }
      });
    });

    const readPaint = () =>
      page.locator('#solid-border-element').evaluate((el: HTMLElement) => {
        const borderPath = el.querySelector('svg.cornerkit-border path[fill="none"]');
        const paths = el.querySelectorAll('svg.cornerkit-border path');
        const bgPath = Array.from(paths).find(
          (p) => p.getAttribute('fill') && p.getAttribute('fill') !== 'none'
        );
        return {
          stroke: borderPath ? getComputedStyle(borderPath).stroke : null,
          bgFill: bgPath ? getComputedStyle(bgPath).fill : null,
        };
      });

    // Before hover: configured border color and captured background
    const before = await readPaint();
    expect(before.stroke).toBe('rgb(59, 130, 246)');
    expect(before.bgFill).toBe('rgb(26, 26, 46)');

    // Hover: CSS variables take over with no JavaScript involved
    await page.hover('#solid-border-element');
    const hovered = await readPaint();
    expect(hovered.stroke).toBe('rgb(255, 0, 0)');
    expect(hovered.bgFill).toBe('rgb(0, 0, 255)');

    // Un-hover deterministically: scroll back to the page top first so the
    // element cannot sit under the (0, 0) corner, then move the mouse there
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.move(0, 0);
    const restored = await readPaint();
    expect(restored.stroke).toBe('rgb(59, 130, 246)');
    expect(restored.bgFill).toBe('rgb(26, 26, 46)');
  });
});
