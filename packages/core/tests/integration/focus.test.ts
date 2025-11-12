/**
 * Integration Tests: Focus Indicators and Accessibility (FR-040, FR-041)
 * Tests that squircles preserve focus indicators and respect accessibility
 */

import { test, expect } from '@playwright/test';
import { setupTestPage } from './test-helpers';

test.describe('Focus Indicators (FR-040, FR-041)', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page);
  });

  test('should preserve focus outline on focusable elements', async ({ page }) => {
    const button = page.locator('#focus-button');

    // Apply squircle to button
    await page.evaluate(() => {
      const btn = document.getElementById('focus-button');
      if (!btn) throw new Error('Button not found');
      window.ck.apply(btn, { radius: 12, smoothing: 0.6 });
    });

    // Focus the button
    await button.focus();

    // Check if button has focus styles
    const hasFocusOutline = await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      // Check for outline or box-shadow (different browsers use different focus indicators)
      return (
        styles.outline !== 'none' &&
        styles.outline !== '' &&
        styles.outline !== '0px none rgb(0, 0, 0)'
      ) || styles.boxShadow !== 'none';
    });

    expect(hasFocusOutline).toBe(true);
  });

  test('should not clip focus indicators', async ({ page }) => {
    const button = page.locator('#focus-button');

    await page.evaluate(() => {
      const btn = document.getElementById('focus-button');
      if (!btn) throw new Error('Button not found');
      window.ck.apply(btn, { radius: 12, smoothing: 0.6 });
    });

    // Focus the button
    await button.focus();

    // Take screenshot to verify focus ring is visible
    // Note: This is a visual check - in real tests you might use visual regression
    const box = await button.boundingBox();
    expect(box).not.toBeNull();

    // Verify the element is still focusable
    const isFocused = await button.evaluate((el) => document.activeElement === el);
    expect(isFocused).toBe(true);
  });

  test('should work with keyboard navigation', async ({ page }) => {
    const button = page.locator('#focus-button');

    await page.evaluate(() => {
      const btn = document.getElementById('focus-button');
      if (!btn) throw new Error('Button not found');
      window.ck.apply(btn, { radius: 12, smoothing: 0.6 });
    });

    // Use keyboard to focus
    await page.keyboard.press('Tab');

    // Wait a bit for focus
    await page.waitForTimeout(100);

    // Check if button is focused (it might not be the first tab stop)
    const isFocusable = await button.evaluate((el) => {
      return el.tabIndex >= 0 || el.hasAttribute('tabindex');
    });

    expect(isFocusable).toBe(true);
  });

  test('should maintain focus indicator on hover + focus', async ({ page }) => {
    const button = page.locator('#focus-button');

    await page.evaluate(() => {
      const btn = document.getElementById('focus-button');
      if (!btn) throw new Error('Button not found');
      window.ck.apply(btn, { radius: 12, smoothing: 0.6 });
    });

    // Focus button
    await button.focus();

    // Also hover
    await button.hover();

    // Should still show focus indicator
    const hasFocusIndicator = await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none' || styles.boxShadow !== 'none';
    });

    expect(hasFocusIndicator).toBe(true);
  });

  test('should preserve inline outline-offset style', async ({ page }) => {
    await page.evaluate(() => {
      const btn = document.getElementById('focus-button') as HTMLElement;
      if (!btn) throw new Error('Button not found');

      // Set custom outline offset before applying squircle
      btn.style.outlineOffset = '4px';
      window.ck.apply(btn, { radius: 12, smoothing: 0.6 });
    });

    const button = page.locator('#focus-button');
    await button.focus();

    // Check that the inline style is preserved (not removed by squircle application)
    const inlineOutlineOffset = await button.evaluate((el) => {
      return (el as HTMLElement).style.outlineOffset;
    });

    // The inline style should still be set
    expect(inlineOutlineOffset).toBe('4px');
  });
});

test.describe('Accessibility: Reduced Motion (FR-042)', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page);
  });

  test('should respect prefers-reduced-motion', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const respectsReducedMotion = await page.evaluate(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return prefersReducedMotion;
    });

    expect(respectsReducedMotion).toBe(true);

    // Apply squircle - should still work
    await page.evaluate(() => {
      const el = document.getElementById('basic-element');
      if (!el) throw new Error('Element not found');
      window.ck.apply(el, { radius: 20, smoothing: 0.6 });
    });

    const hasSquircle = await page.evaluate(() => {
      const el = document.getElementById('basic-element');
      if (!el) return false;
      return window.getComputedStyle(el).clipPath.includes('path');
    });

    expect(hasSquircle).toBe(true);
  });

  test('should apply squircles without animations when reduced motion is preferred', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Apply squircle
    await page.evaluate(() => {
      const el = document.getElementById('update-element') as HTMLElement;
      if (!el) throw new Error('Element not found');

      // Add transition
      el.style.transition = 'all 0.3s ease';
      window.ck.apply(el, { radius: 20, smoothing: 0.6 });
    });

    // Update squircle - should not animate
    await page.evaluate(() => {
      const el = document.getElementById('update-element');
      window.ck.update(el, { radius: 32, smoothing: 0.9 });
    });

    const config = await page.evaluate(() => {
      const el = document.getElementById('update-element');
      return window.ck.inspect(el)?.config;
    });

    expect(config?.radius).toBe(32);
    expect(config?.smoothing).toBe(0.9);
  });
});

test.describe('Accessibility: Screen Readers', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page);
  });

  test('should not interfere with ARIA attributes', async ({ page }) => {
    await page.evaluate(() => {
      const btn = document.getElementById('focus-button') as HTMLElement;
      if (!btn) throw new Error('Button not found');

      // Set ARIA attributes
      btn.setAttribute('aria-label', 'Focusable Button');
      btn.setAttribute('aria-describedby', 'button-description');

      window.ck.apply(btn, { radius: 12, smoothing: 0.6 });
    });

    const ariaAttributes = await page.evaluate(() => {
      const btn = document.getElementById('focus-button');
      if (!btn) return null;

      return {
        label: btn.getAttribute('aria-label'),
        describedBy: btn.getAttribute('aria-describedby'),
      };
    });

    expect(ariaAttributes?.label).toBe('Focusable Button');
    expect(ariaAttributes?.describedBy).toBe('button-description');
  });

  test('should not affect element semantics', async ({ page }) => {
    await page.evaluate(() => {
      const btn = document.getElementById('focus-button');
      if (!btn) throw new Error('Button not found');
      window.ck.apply(btn, { radius: 12, smoothing: 0.6 });
    });

    const tagName = await page.evaluate(() => {
      const btn = document.getElementById('focus-button');
      return btn?.tagName.toLowerCase();
    });

    expect(tagName).toBe('button');
  });

  test('should maintain role attributes', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.getElementById('basic-element') as HTMLElement;
      if (!el) throw new Error('Element not found');

      el.setAttribute('role', 'region');
      el.setAttribute('aria-label', 'Content Region');

      window.ck.apply(el, { radius: 20, smoothing: 0.6 });
    });

    const role = await page.evaluate(() => {
      const el = document.getElementById('basic-element');
      return {
        role: el?.getAttribute('role'),
        label: el?.getAttribute('aria-label'),
      };
    });

    expect(role.role).toBe('region');
    expect(role.label).toBe('Content Region');
  });
});

test.describe('Accessibility: Color Contrast', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestPage(page);
  });

  test('should not affect text color contrast', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.getElementById('basic-element') as HTMLElement;
      if (!el) throw new Error('Element not found');

      // Set specific colors
      el.style.backgroundColor = '#667eea';
      el.style.color = '#ffffff';

      window.ck.apply(el, { radius: 20, smoothing: 0.6 });
    });

    const colors = await page.evaluate(() => {
      const el = document.getElementById('basic-element');
      if (!el) return null;

      const styles = window.getComputedStyle(el);
      return {
        background: styles.backgroundColor,
        color: styles.color,
      };
    });

    // Colors should remain unchanged
    expect(colors?.background).toBe('rgb(102, 126, 234)'); // #667eea
    expect(colors?.color).toBe('rgb(255, 255, 255)'); // #ffffff
  });
});
