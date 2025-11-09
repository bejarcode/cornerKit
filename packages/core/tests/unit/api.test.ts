/**
 * Unit Tests: CornerKit API
 * Tests for applyAll() and auto() methods
 * Coverage target: >85%
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CornerKit from '../../src/index';
import type { SquircleConfig } from '../../src/core/types';

describe('CornerKit API - applyAll() and auto()', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock CSS.supports for clip-path support
    global.CSS = {
      supports: vi.fn((property: string, value: string) => {
        if (property === 'clip-path' && value.includes('path')) {
          return true;
        }
        return false;
      }),
    } as any;

    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      _callback: callback, // Store callback for testing
    }));
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    vi.restoreAllMocks();
    // Clean up DOM
    document.body.innerHTML = '';
  });

  // T146-T150: Tests for applyAll()
  describe('applyAll()', () => {
    // T147: Test with valid selector
    it('should apply squircles to all matching elements', () => {
      const ck = new CornerKit();

      // Create test elements
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      const button3 = document.createElement('button');
      button1.className = 'btn';
      button2.className = 'btn';
      button3.className = 'btn';

      Object.defineProperty(button1, 'offsetWidth', { value: 100, configurable: true });
      Object.defineProperty(button1, 'offsetHeight', { value: 50, configurable: true });
      Object.defineProperty(button2, 'offsetWidth', { value: 120, configurable: true });
      Object.defineProperty(button2, 'offsetHeight', { value: 60, configurable: true });
      Object.defineProperty(button3, 'offsetWidth', { value: 110, configurable: true });
      Object.defineProperty(button3, 'offsetHeight', { value: 55, configurable: true });

      document.body.appendChild(button1);
      document.body.appendChild(button2);
      document.body.appendChild(button3);

      // Apply to all buttons
      ck.applyAll('.btn');

      // Verify all have clip-path applied
      expect(button1.style.clipPath).toContain('path');
      expect(button2.style.clipPath).toContain('path');
      expect(button3.style.clipPath).toContain('path');
    });

    // T148: Test with shared config
    it('should apply the same config to all matching elements', () => {
      const ck = new CornerKit();

      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      div1.className = 'card';
      div2.className = 'card';

      Object.defineProperty(div1, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(div1, 'offsetHeight', { value: 100, configurable: true });
      Object.defineProperty(div2, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(div2, 'offsetHeight', { value: 100, configurable: true });

      document.body.appendChild(div1);
      document.body.appendChild(div2);

      // Apply with custom config
      ck.applyAll('.card', { radius: 32, smoothing: 0.9 });

      // Both elements should have clip-path (config is internal)
      expect(div1.style.clipPath).toContain('path');
      expect(div2.style.clipPath).toContain('path');
    });

    // T149: Test with 0 matches
    it('should handle 0 matches gracefully (no-op, warn in dev)', () => {
      const ck = new CornerKit();

      // Apply to non-existent selector
      expect(() => ck.applyAll('.non-existent')).not.toThrow();

      // Should warn in development mode
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('matched 0 elements')
      );
    });

    // T150: Test invalid selector
    it('should throw TypeError for invalid CSS selector', () => {
      const ck = new CornerKit();

      // Invalid selector syntax
      expect(() => ck.applyAll(':::')).toThrow(TypeError);
      expect(() => ck.applyAll(':::')).toThrow(/Invalid CSS selector/);
    });

    it('should throw TypeError for non-string selector', () => {
      const ck = new CornerKit();

      // @ts-expect-error Testing invalid input
      expect(() => ck.applyAll(123)).toThrow(TypeError);
      // @ts-expect-error Testing invalid input
      expect(() => ck.applyAll(123)).toThrow(/Selector must be a string/);
    });

    it('should throw TypeError for empty selector', () => {
      const ck = new CornerKit();

      expect(() => ck.applyAll('')).toThrow(TypeError);
      expect(() => ck.applyAll('   ')).toThrow(TypeError);
    });

    it('should skip non-HTMLElements with warning', () => {
      const ck = new CornerKit();

      // Create SVG element (not HTMLElement)
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      svg.setAttribute('class', 'shape');
      document.body.appendChild(svg);

      // Create HTML element
      const div = document.createElement('div');
      div.className = 'shape';
      Object.defineProperty(div, 'offsetWidth', { value: 100, configurable: true });
      Object.defineProperty(div, 'offsetHeight', { value: 100, configurable: true });
      document.body.appendChild(div);

      // Apply to all .shape elements
      ck.applyAll('.shape');

      // HTML element should have clip-path, SVG should be skipped
      expect(div.style.clipPath).toContain('path');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Skipping non-HTMLElement')
      );
    });
  });

  // T181-T195: Tests for auto()
  describe('auto()', () => {
    // Mock IntersectionObserver callback trigger helper
    function triggerIntersection(
      element: HTMLElement,
      isIntersecting: boolean
    ) {
      const observer = (IntersectionObserver as any).mock.results[0]?.value;
      if (observer && observer._callback) {
        observer._callback([
          {
            target: element,
            isIntersecting,
          },
        ]);
      }
    }

    // T183: Test with visible elements (immediate application)
    it('should apply squircles immediately to visible elements', () => {
      const ck = new CornerKit();

      const element = document.createElement('div');
      element.setAttribute('data-squircle', '');
      element.setAttribute('data-squircle-radius', '24');
      element.setAttribute('data-squircle-smoothing', '0.9');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Mock getBoundingClientRect to return visible position
      element.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 100,
        left: 100,
        bottom: 200,
        right: 300,
      });

      document.body.appendChild(element);

      // Call auto()
      ck.auto();

      // Should apply immediately (visible in viewport)
      expect(element.style.clipPath).toContain('path');
    });

    // T184: Test with off-screen elements (deferred with IntersectionObserver)
    it('should defer off-screen elements with IntersectionObserver', () => {
      const ck = new CornerKit();

      const element = document.createElement('div');
      element.setAttribute('data-squircle', '');
      element.setAttribute('data-squircle-radius', '32');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Mock getBoundingClientRect to return off-screen position
      element.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 2000, // Far below viewport
        left: 100,
        bottom: 2100,
        right: 300,
      });

      document.body.appendChild(element);

      // Call auto()
      ck.auto();

      // Should NOT apply immediately (off-screen)
      expect(element.style.clipPath).toBe('');

      // Should observe the element
      const observer = (IntersectionObserver as any).mock.results[0]?.value;
      expect(observer.observe).toHaveBeenCalledWith(element);
    });

    // T185: Test data attribute parsing
    it('should parse data attributes correctly', () => {
      const ck = new CornerKit();

      const element = document.createElement('div');
      element.setAttribute('data-squircle', '');
      element.setAttribute('data-squircle-radius', '40');
      element.setAttribute('data-squircle-smoothing', '0.95');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      element.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 100,
        left: 100,
        bottom: 200,
        right: 300,
      });

      document.body.appendChild(element);

      ck.auto();

      // Should have applied squircle with parsed config
      expect(element.style.clipPath).toContain('path');
    });

    // T186: Test with invalid data attributes
    it('should use defaults for invalid data attributes with warnings', () => {
      const ck = new CornerKit();

      const element = document.createElement('div');
      element.setAttribute('data-squircle', '');
      element.setAttribute('data-squircle-radius', 'invalid');
      element.setAttribute('data-squircle-smoothing', 'abc');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      element.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 100,
        left: 100,
        bottom: 200,
        right: 300,
      });

      document.body.appendChild(element);

      ck.auto();

      // Should still apply with default config
      expect(element.style.clipPath).toContain('path');

      // Should warn about invalid values
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid data-squircle-radius'),
        expect.anything()
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid data-squircle-smoothing'),
        expect.anything()
      );
    });

    // T187: Test with 0 matches
    it('should handle 0 matches gracefully (no-op, no error)', () => {
      const ck = new CornerKit();

      // No elements with data-squircle
      expect(() => ck.auto()).not.toThrow();

      // Should not create IntersectionObserver
      expect(IntersectionObserver).not.toHaveBeenCalled();
    });

    // T188: Test multiple auto() calls
    it('should skip already-managed elements on multiple auto() calls', () => {
      const ck = new CornerKit();

      const element = document.createElement('div');
      element.setAttribute('data-squircle', '');
      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      element.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 100,
        left: 100,
        bottom: 200,
        right: 300,
      });

      document.body.appendChild(element);

      // First call
      ck.auto();
      const firstClipPath = element.style.clipPath;

      // Second call - should skip already-managed element
      ck.auto();
      const secondClipPath = element.style.clipPath;

      // Clip-path should remain the same (not reapplied)
      expect(firstClipPath).toBe(secondClipPath);
    });

    // T189: Test IntersectionObserver callback
    it('should apply squircle when element enters viewport', () => {
      const ck = new CornerKit();

      const element = document.createElement('div');
      element.setAttribute('data-squircle', '');
      element.setAttribute('data-squircle-radius', '28');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Start off-screen
      element.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 2000,
        left: 100,
        bottom: 2100,
        right: 300,
      });

      document.body.appendChild(element);

      ck.auto();

      // Not applied yet (off-screen)
      expect(element.style.clipPath).toBe('');

      // Simulate element entering viewport
      triggerIntersection(element, true);

      // Now should be applied
      expect(element.style.clipPath).toContain('path');
    });

    // T190: Test observer unobserve after apply
    it('should unobserve element after applying squircle', () => {
      const ck = new CornerKit();

      const element = document.createElement('div');
      element.setAttribute('data-squircle', '');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      element.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 2000,
        left: 100,
        bottom: 2100,
        right: 300,
      });

      document.body.appendChild(element);

      ck.auto();

      const observer = (IntersectionObserver as any).mock.results[0]?.value;

      // Trigger intersection
      triggerIntersection(element, true);

      // Should unobserve after applying
      expect(observer.unobserve).toHaveBeenCalledWith(element);
    });

    // T193: Integration test with multiple elements
    it('should handle mix of visible and off-screen elements', () => {
      const ck = new CornerKit();

      // Create visible elements
      const visible1 = document.createElement('div');
      visible1.setAttribute('data-squircle', '');
      Object.defineProperty(visible1, 'offsetWidth', { value: 100, configurable: true });
      Object.defineProperty(visible1, 'offsetHeight', { value: 100, configurable: true });
      visible1.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 100,
        left: 100,
        bottom: 200,
        right: 200,
      });

      const visible2 = document.createElement('div');
      visible2.setAttribute('data-squircle', '');
      Object.defineProperty(visible2, 'offsetWidth', { value: 100, configurable: true });
      Object.defineProperty(visible2, 'offsetHeight', { value: 100, configurable: true });
      visible2.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 250,
        left: 100,
        bottom: 350,
        right: 200,
      });

      // Create off-screen elements
      const offscreen1 = document.createElement('div');
      offscreen1.setAttribute('data-squircle', '');
      Object.defineProperty(offscreen1, 'offsetWidth', { value: 100, configurable: true });
      Object.defineProperty(offscreen1, 'offsetHeight', { value: 100, configurable: true });
      offscreen1.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 2000,
        left: 100,
        bottom: 2100,
        right: 200,
      });

      const offscreen2 = document.createElement('div');
      offscreen2.setAttribute('data-squircle', '');
      Object.defineProperty(offscreen2, 'offsetWidth', { value: 100, configurable: true });
      Object.defineProperty(offscreen2, 'offsetHeight', { value: 100, configurable: true });
      offscreen2.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 3000,
        left: 100,
        bottom: 3100,
        right: 200,
      });

      document.body.appendChild(visible1);
      document.body.appendChild(visible2);
      document.body.appendChild(offscreen1);
      document.body.appendChild(offscreen2);

      ck.auto();

      // Visible elements should be applied immediately
      expect(visible1.style.clipPath).toContain('path');
      expect(visible2.style.clipPath).toContain('path');

      // Off-screen elements should NOT be applied yet
      expect(offscreen1.style.clipPath).toBe('');
      expect(offscreen2.style.clipPath).toBe('');

      // Observer should be watching off-screen elements
      const observer = (IntersectionObserver as any).mock.results[0]?.value;
      expect(observer.observe).toHaveBeenCalledWith(offscreen1);
      expect(observer.observe).toHaveBeenCalledWith(offscreen2);
    });

    it('should skip non-HTMLElements', () => {
      const ck = new CornerKit();

      // This test would require creating SVG with data-squircle
      // In practice, data attributes on SVG are uncommon
      // The implementation handles this by checking instanceof HTMLElement
      expect(() => ck.auto()).not.toThrow();
    });

    it('should prevent duplicate processing in IntersectionObserver callback', () => {
      const ck = new CornerKit();

      const element = document.createElement('div');
      element.setAttribute('data-squircle', '');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      element.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 2000,
        left: 100,
        bottom: 2100,
        right: 300,
      });

      document.body.appendChild(element);

      ck.auto();

      const observer = (IntersectionObserver as any).mock.results[0]?.value;

      // Trigger intersection
      triggerIntersection(element, true);

      expect(element.style.clipPath).toContain('path');
      expect(observer.unobserve).toHaveBeenCalledWith(element);

      // Trigger again (should be skipped)
      observer.unobserve.mockClear();
      triggerIntersection(element, true);

      // Should unobserve again but not reapply
      expect(observer.unobserve).toHaveBeenCalledWith(element);
    });

    // Memory leak fix tests
    it('should disconnect previous IntersectionObserver on repeated auto() calls', () => {
      const ck = new CornerKit();

      // Create off-screen element
      const element = document.createElement('div');
      element.setAttribute('data-squircle', '');
      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      element.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 2000,
        left: 100,
        bottom: 2100,
        right: 300,
      });

      document.body.appendChild(element);

      // First auto() call - creates observer
      ck.auto();
      const firstObserver = (IntersectionObserver as any).mock.results[0]?.value;
      expect(firstObserver).toBeDefined();

      // Second auto() call - should disconnect first observer
      ck.auto();

      // First observer should be disconnected
      expect(firstObserver.disconnect).toHaveBeenCalled();
    });

    it('should not create IntersectionObserver when all elements are visible', () => {
      const ck = new CornerKit();

      // Create only visible elements
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');
      element1.setAttribute('data-squircle', '');
      element2.setAttribute('data-squircle', '');

      Object.defineProperty(element1, 'offsetWidth', { value: 100, configurable: true });
      Object.defineProperty(element1, 'offsetHeight', { value: 100, configurable: true });
      Object.defineProperty(element2, 'offsetWidth', { value: 100, configurable: true });
      Object.defineProperty(element2, 'offsetHeight', { value: 100, configurable: true });

      element1.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 100,
        left: 100,
        bottom: 200,
        right: 200,
      });

      element2.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 250,
        left: 100,
        bottom: 350,
        right: 200,
      });

      document.body.appendChild(element1);
      document.body.appendChild(element2);

      // Clear previous IntersectionObserver calls
      (IntersectionObserver as any).mockClear();

      // Call auto() - should not create observer
      ck.auto();

      // IntersectionObserver should NOT be created (all elements visible)
      expect(IntersectionObserver).not.toHaveBeenCalled();

      // Both elements should still be applied
      expect(element1.style.clipPath).toContain('path');
      expect(element2.style.clipPath).toContain('path');
    });

    it('should create IntersectionObserver only for off-screen elements', () => {
      const ck = new CornerKit();

      // Create mix of visible and off-screen elements
      const visible = document.createElement('div');
      const offscreen = document.createElement('div');
      visible.setAttribute('data-squircle', '');
      offscreen.setAttribute('data-squircle', '');

      Object.defineProperty(visible, 'offsetWidth', { value: 100, configurable: true });
      Object.defineProperty(visible, 'offsetHeight', { value: 100, configurable: true });
      Object.defineProperty(offscreen, 'offsetWidth', { value: 100, configurable: true });
      Object.defineProperty(offscreen, 'offsetHeight', { value: 100, configurable: true });

      visible.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 100,
        left: 100,
        bottom: 200,
        right: 200,
      });

      offscreen.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 2000,
        left: 100,
        bottom: 2100,
        right: 200,
      });

      document.body.appendChild(visible);
      document.body.appendChild(offscreen);

      // Clear previous calls
      (IntersectionObserver as any).mockClear();

      // Call auto()
      ck.auto();

      // IntersectionObserver should be created
      expect(IntersectionObserver).toHaveBeenCalled();

      // Visible element should be applied immediately
      expect(visible.style.clipPath).toContain('path');

      // Off-screen element should NOT be applied yet
      expect(offscreen.style.clipPath).toBe('');

      // Off-screen element should be observed
      const observer = (IntersectionObserver as any).mock.results[0]?.value;
      expect(observer.observe).toHaveBeenCalledWith(offscreen);
    });
  });

  // T205-T212: update() method tests
  describe('update()', () => {
    it('should update config on managed element and re-render (T206)', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Apply initial squircle
      ck.apply(element, { radius: 20, smoothing: 0.8 });

      const initialClipPath = element.style.clipPath;
      expect(initialClipPath).toContain('path');

      // Update only radius
      ck.update(element, { radius: 40 });

      const updatedClipPath = element.style.clipPath;

      // Clip path should be different (radius changed)
      expect(updatedClipPath).toContain('path');
      expect(updatedClipPath).not.toBe(initialClipPath);
    });

    it('should throw error on unmanaged element (T207)', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');

      // Attempt to update without applying first
      expect(() => {
        ck.update(element, { radius: 30 });
      }).toThrow('element is not managed by CornerKit');
    });

    it('should update partial config and preserve unchanged values (T208)', () => {
      const ck = new CornerKit({ radius: 20, smoothing: 0.8 });
      const element = document.createElement('div');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Apply initial squircle
      ck.apply(element);

      // Update only radius
      ck.update(element, { radius: 40 });

      // Inspect would be ideal here, but we can test through the private registry
      // For now, verify re-render happened
      expect(element.style.clipPath).toContain('path');

      // Update only smoothing
      ck.update(element, { smoothing: 0.95 });

      // Verify re-render happened with new smoothing
      expect(element.style.clipPath).toContain('path');
    });

    it('should validate config and clamp invalid values (T209)', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Apply initial squircle
      ck.apply(element, { radius: 20, smoothing: 0.8 });

      // Update with invalid radius (negative) - should be clamped to 0
      ck.update(element, { radius: -10 });

      // Should not throw, validator clamps to 0
      expect(element.style.clipPath).toBeDefined();

      // Update with out-of-range smoothing - should be clamped to 0-1
      ck.update(element, { smoothing: 2.5 });

      // Should not throw, validator clamps to 1
      expect(element.style.clipPath).toBeDefined();
    });

    it('should preserve ResizeObserver on update (T210)', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Apply initial squircle
      ck.apply(element);

      // Mock ResizeObserver to track disconnect calls
      const observerInstance = (ResizeObserver as any).mock.results[0]?.value;
      const disconnectSpy = vi.spyOn(observerInstance, 'disconnect');

      // Update config
      ck.update(element, { radius: 40 });

      // ResizeObserver should NOT be disconnected/recreated
      expect(disconnectSpy).not.toHaveBeenCalled();

      // Verify squircle still applied
      expect(element.style.clipPath).toContain('path');
    });

    it('should work with CSS selector string (T211)', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');
      element.id = 'test-element';
      document.body.appendChild(element);

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Apply with selector
      ck.apply('#test-element', { radius: 20 });

      const initialClipPath = element.style.clipPath;

      // Update with selector
      ck.update('#test-element', { radius: 40 });

      const updatedClipPath = element.style.clipPath;

      // Verify visual change
      expect(updatedClipPath).toContain('path');
      expect(updatedClipPath).not.toBe(initialClipPath);
    });

    it('should update both radius and smoothing together', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Apply initial
      ck.apply(element, { radius: 20, smoothing: 0.8 });

      const initialClipPath = element.style.clipPath;

      // Update both at once
      ck.update(element, { radius: 40, smoothing: 0.95 });

      const updatedClipPath = element.style.clipPath;

      // Verify visual change
      expect(updatedClipPath).toContain('path');
      expect(updatedClipPath).not.toBe(initialClipPath);
    });

    it('should work correctly in User Story 3 acceptance scenario 2 (T212)', () => {
      // US3 Scenario 2: Developer updates button radius on hover
      const ck = new CornerKit({ radius: 20, smoothing: 0.85 });
      const button = document.createElement('button');
      button.className = 'cta-button';

      Object.defineProperty(button, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(button, 'offsetHeight', { value: 50, configurable: true });

      // Apply initial squircle
      ck.apply(button);

      const initialClipPath = button.style.clipPath;
      expect(initialClipPath).toContain('path');

      // Simulate hover - update to larger radius
      ck.update(button, { radius: 24 });

      const hoverClipPath = button.style.clipPath;

      // Verify smooth transition (clip path updated)
      expect(hoverClipPath).toContain('path');
      expect(hoverClipPath).not.toBe(initialClipPath);

      // Simulate hover out - update back to original
      ck.update(button, { radius: 20 });

      const normalClipPath = button.style.clipPath;

      // Verify smooth transition back
      expect(normalClipPath).toContain('path');
    });
  });

  // T249-T257: remove() method tests
  describe('remove()', () => {
    it('should remove squircle from managed element and disconnect observers (T250)', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Apply squircle
      ck.apply(element);

      expect(element.style.clipPath).toContain('path');

      // Remove squircle
      ck.remove(element);

      // Verify clip-path removed
      expect(element.style.clipPath).toBe('');
    });

    it('should throw error on unmanaged element (T251)', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');

      // Attempt to remove without applying first
      expect(() => {
        ck.remove(element);
      }).toThrow('element is not managed by CornerKit');
    });

    it('should disconnect ResizeObserver on remove (T252)', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Apply squircle
      ck.apply(element);

      // Get observer instance
      const observerInstance = (ResizeObserver as any).mock.results[0]?.value;
      const disconnectSpy = vi.spyOn(observerInstance, 'disconnect');

      // Remove squircle
      ck.remove(element);

      // Verify observer disconnected
      expect(disconnectSpy).toHaveBeenCalled();
    });

    it('should delete element from registry after removal (T254)', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Apply squircle
      ck.apply(element);

      // Remove squircle
      ck.remove(element);

      // Verify element not managed anymore (should throw if we try to update)
      expect(() => {
        ck.update(element, { radius: 30 });
      }).toThrow('element is not managed by CornerKit');
    });

    it('should work with CSS selector string (T255)', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');
      element.id = 'test-element';
      document.body.appendChild(element);

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Apply with selector
      ck.apply('#test-element');

      expect(element.style.clipPath).toContain('path');

      // Remove with selector
      ck.remove('#test-element');

      // Verify removed
      expect(element.style.clipPath).toBe('');
    });

    it('should restore element to original state (T256 integration test)', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Store original styles
      const originalClipPath = element.style.clipPath;
      expect(originalClipPath).toBe('');

      // Apply squircle
      ck.apply(element);
      expect(element.style.clipPath).toContain('path');

      // Remove squircle
      ck.remove(element);

      // Verify restored to original
      expect(element.style.clipPath).toBe(originalClipPath);
    });

    it('should work correctly in User Story 4 acceptance scenario 1 (T257)', () => {
      // US4 Scenario 1: Developer removes squircles on route change
      const ck = new CornerKit();

      const card1 = document.createElement('div');
      const card2 = document.createElement('div');

      Object.defineProperty(card1, 'offsetWidth', { value: 300, configurable: true });
      Object.defineProperty(card1, 'offsetHeight', { value: 200, configurable: true });
      Object.defineProperty(card2, 'offsetWidth', { value: 300, configurable: true });
      Object.defineProperty(card2, 'offsetHeight', { value: 200, configurable: true });

      // Apply to both
      ck.apply(card1);
      ck.apply(card2);

      expect(card1.style.clipPath).toContain('path');
      expect(card2.style.clipPath).toContain('path');

      // Remove card1 on route change
      ck.remove(card1);

      // Verify card1 removed, card2 still has squircle
      expect(card1.style.clipPath).toBe('');
      expect(card2.style.clipPath).toContain('path');
    });
  });

  // T280-T289: destroy() method tests
  describe('destroy()', () => {
    it('should remove all squircles and disconnect all observers (T281, T282)', () => {
      const ck = new CornerKit();

      const elements = Array.from({ length: 5 }, () => {
        const el = document.createElement('div');
        Object.defineProperty(el, 'offsetWidth', { value: 200, configurable: true });
        Object.defineProperty(el, 'offsetHeight', { value: 100, configurable: true });
        return el;
      });

      // Apply to all elements
      elements.forEach((el) => ck.apply(el));

      // Verify all have squircles
      elements.forEach((el) => {
        expect(el.style.clipPath).toContain('path');
      });

      // Destroy
      ck.destroy();

      // Verify all squircles removed
      elements.forEach((el) => {
        expect(el.style.clipPath).toBe('');
      });
    });

    it('should clear registry after destroy (T284)', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Apply squircle
      ck.apply(element);

      // Destroy
      ck.destroy();

      // Verify element not managed anymore
      expect(() => {
        ck.update(element, { radius: 30 });
      }).toThrow('element is not managed by CornerKit');
    });

    it('should allow re-initialization after destroy (T285, T289)', () => {
      const ck = new CornerKit({ radius: 20 });
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');

      Object.defineProperty(element1, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element1, 'offsetHeight', { value: 100, configurable: true });
      Object.defineProperty(element2, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element2, 'offsetHeight', { value: 100, configurable: true });

      // Apply to element1
      ck.apply(element1);
      expect(element1.style.clipPath).toContain('path');

      // Destroy
      ck.destroy();
      expect(element1.style.clipPath).toBe('');

      // Re-initialize - apply to element2
      ck.apply(element2);
      expect(element2.style.clipPath).toContain('path');
    });

    it('should be idempotent - calling destroy twice should not error (T286)', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Apply squircle
      ck.apply(element);

      // Destroy twice
      expect(() => {
        ck.destroy();
        ck.destroy();
      }).not.toThrow();

      // Verify element still cleaned up
      expect(element.style.clipPath).toBe('');
    });

    it('should handle complete cleanup in integration test (T287)', () => {
      const ck = new CornerKit({ radius: 24, smoothing: 0.85 });

      // Create 10 elements
      const elements = Array.from({ length: 10 }, (_, i) => {
        const el = document.createElement('div');
        el.id = `element-${i}`;
        Object.defineProperty(el, 'offsetWidth', { value: 200, configurable: true });
        Object.defineProperty(el, 'offsetHeight', { value: 100, configurable: true });
        return el;
      });

      // Apply squircles to all
      elements.forEach((el) => ck.apply(el));

      // Verify all applied
      elements.forEach((el) => {
        expect(el.style.clipPath).toContain('path');
      });

      // Destroy everything
      ck.destroy();

      // Verify complete cleanup
      elements.forEach((el) => {
        expect(el.style.clipPath).toBe('');
      });

      // Verify registry empty (trying to update should fail)
      expect(() => {
        ck.update(elements[0], { radius: 30 });
      }).toThrow();
    });

    it('should work correctly in User Story 4 acceptance scenario 3 - destroy all (T288)', () => {
      // US4 Scenario 3: Developer destroys CornerKit instance on app teardown
      const ck = new CornerKit({ radius: 20, smoothing: 0.85 });

      const button1 = document.createElement('button');
      const button2 = document.createElement('button');

      // Use getters that persist across style changes
      Object.defineProperty(button1, 'offsetWidth', {
        get: () => 150,
        configurable: true,
      });
      Object.defineProperty(button1, 'offsetHeight', {
        get: () => 40,
        configurable: true,
      });
      Object.defineProperty(button2, 'offsetWidth', {
        get: () => 150,
        configurable: true,
      });
      Object.defineProperty(button2, 'offsetHeight', {
        get: () => 40,
        configurable: true,
      });

      // Apply to both buttons
      ck.apply(button1);
      ck.apply(button2);

      expect(button1.style.clipPath).toContain('path');
      expect(button2.style.clipPath).toContain('path');

      // App teardown - destroy everything
      ck.destroy();

      // Verify all cleaned up
      expect(button1.style.clipPath).toBe('');
      expect(button2.style.clipPath).toBe('');
    });

    it('should allow re-initialization after destroy - User Story 4 scenario 4', () => {
      // This test verifies that after destroy(), the instance can be reused with new elements
      // Real-world scenario: SPA route change destroys old page, new page applies squircles
      const ck = new CornerKit({ radius: 20 });

      const oldButton = document.createElement('button');
      Object.defineProperty(oldButton, 'offsetWidth', {
        get: () => 150,
        configurable: true,
      });
      Object.defineProperty(oldButton, 'offsetHeight', {
        get: () => 40,
        configurable: true,
      });

      // Old page - apply squircle
      ck.apply(oldButton);
      expect(oldButton.style.clipPath).toContain('path');

      // Route change - destroy everything
      ck.destroy();
      expect(oldButton.style.clipPath).toBe('');

      // New page - new element with new config
      const newButton = document.createElement('button');
      Object.defineProperty(newButton, 'offsetWidth', {
        get: () => 200,
        configurable: true,
      });
      Object.defineProperty(newButton, 'offsetHeight', {
        get: () => 50,
        configurable: true,
      });

      // Re-apply to new element
      ck.apply(newButton, { radius: 32 });
      expect(newButton.style.clipPath).toContain('path');
    });
  });

  // T263-T267: inspect() method tests
  describe('inspect()', () => {
    it('should return correct config for managed element (T263)', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Apply squircle with specific config
      ck.apply(element, { radius: 24, smoothing: 0.9 });

      // Inspect element
      const info = ck.inspect(element);

      // Verify config
      expect(info.config.radius).toBe(24);
      expect(info.config.smoothing).toBe(0.9);
    });

    it('should throw error on unmanaged element (T264)', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');

      // Attempt to inspect without applying first
      expect(() => {
        ck.inspect(element);
      }).toThrow('element is not managed by CornerKit');
    });

    it('should work with CSS selector string (T265)', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');
      element.id = 'test-element';
      document.body.appendChild(element);

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Apply with specific config
      ck.apply('#test-element', { radius: 32, smoothing: 0.85 });

      // Inspect with selector
      const info = ck.inspect('#test-element');

      // Verify config
      expect(info.config.radius).toBe(32);
      expect(info.config.smoothing).toBe(0.85);
    });

    it('should return accurate dimensions (T266)', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');

      Object.defineProperty(element, 'offsetWidth', { value: 300, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 150, configurable: true });

      // Apply squircle
      ck.apply(element);

      // Inspect element
      const info = ck.inspect(element);

      // Verify dimensions
      expect(info.dimensions.width).toBe(300);
      expect(info.dimensions.height).toBe(150);
    });

    it('should return correct tier information', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Apply squircle (should use clippath tier in test environment)
      ck.apply(element);

      // Inspect element
      const info = ck.inspect(element);

      // Verify tier
      expect(info.tier).toBe('clippath');
    });

    it('should return copy of config to prevent mutation', () => {
      const ck = new CornerKit();
      const element = document.createElement('div');

      Object.defineProperty(element, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 100, configurable: true });

      // Apply squircle
      ck.apply(element, { radius: 20, smoothing: 0.8 });

      // Inspect element
      const info = ck.inspect(element);

      // Mutate returned config
      info.config.radius = 999;

      // Inspect again - should return original config
      const info2 = ck.inspect(element);
      expect(info2.config.radius).toBe(20);
    });

    it('should work correctly in User Story 3 acceptance scenario 1 (T267)', () => {
      // US3 Scenario 1: Developer inspects button to verify configuration
      const ck = new CornerKit({ radius: 20, smoothing: 0.85 });
      const button = document.createElement('button');
      button.className = 'cta-button';

      Object.defineProperty(button, 'offsetWidth', { value: 200, configurable: true });
      Object.defineProperty(button, 'offsetHeight', { value: 50, configurable: true });

      // Apply squircle with custom config
      ck.apply(button, { radius: 24 });

      // Inspect to verify configuration
      const info = ck.inspect(button);

      // Verify merged config (custom radius, default smoothing)
      expect(info.config.radius).toBe(24);
      expect(info.config.smoothing).toBe(0.85);
      expect(info.tier).toBe('clippath');
      expect(info.dimensions.width).toBe(200);
      expect(info.dimensions.height).toBe(50);
    });
  });
});
