/**
 * Accessibility Utilities Tests
 * T226-T231: Test prefers-reduced-motion functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  prefersReducedMotion,
  applyReducedMotionPreference,
  watchReducedMotionPreference,
} from '../../src/utils/accessibility';

describe('accessibility utilities', () => {
  // T227: Mock window.matchMedia for testing
  let matchMediaMock: MediaQueryList;
  let listeners: Array<(event: MediaQueryListEvent) => void> = [];

  beforeEach(() => {
    listeners = [];

    // Create a mock MediaQueryList
    matchMediaMock = {
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          listeners.push(listener);
        }
      }),
      removeEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          const index = listeners.indexOf(listener);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        }
      }),
      onchange: null,
      addListener: vi.fn(), // Legacy support
      removeListener: vi.fn(), // Legacy support
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;

    // Mock window.matchMedia
    vi.stubGlobal('matchMedia', vi.fn(() => matchMediaMock));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('prefersReducedMotion()', () => {
    // T228: Test prefers-reduced-motion enabled
    it('should return true when user prefers reduced motion', () => {
      matchMediaMock.matches = true;

      const result = prefersReducedMotion();

      expect(result).toBe(true);
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    // T229: Test prefers-reduced-motion disabled
    it('should return false when user does not prefer reduced motion', () => {
      matchMediaMock.matches = false;

      const result = prefersReducedMotion();

      expect(result).toBe(false);
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    it('should return false when window.matchMedia is not available', () => {
      vi.stubGlobal('matchMedia', undefined);

      const result = prefersReducedMotion();

      expect(result).toBe(false);
    });

    it('should return false in non-browser environments', () => {
      // Simulate Node.js environment
      const originalWindow = global.window;
      // @ts-expect-error - Testing undefined window
      delete global.window;

      const result = prefersReducedMotion();

      expect(result).toBe(false);

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('applyReducedMotionPreference()', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
    });

    // T228: Test transition disabled when reduced motion enabled
    it('should disable transitions when user prefers reduced motion', () => {
      matchMediaMock.matches = true;

      applyReducedMotionPreference(element);

      expect(element.style.transition).toBe('none');
    });

    // T229: Test transitions allowed when reduced motion disabled
    it('should not modify transitions when user does not prefer reduced motion', () => {
      matchMediaMock.matches = false;

      applyReducedMotionPreference(element);

      expect(element.style.transition).toBe('');
    });

    it('should handle elements gracefully when matchMedia is unavailable', () => {
      vi.stubGlobal('matchMedia', undefined);

      // Should not throw
      expect(() => applyReducedMotionPreference(element)).not.toThrow();

      // Should not modify transition
      expect(element.style.transition).toBe('');
    });
  });

  describe('watchReducedMotionPreference()', () => {
    // T230: Test dynamic change monitoring
    it('should call callback when preference changes', () => {
      const callback = vi.fn();

      watchReducedMotionPreference(callback);

      // Simulate media query change event
      const changeEvent = new Event('change') as MediaQueryListEvent;
      Object.defineProperty(changeEvent, 'matches', { value: true });

      listeners.forEach((listener) => listener(changeEvent));

      expect(callback).toHaveBeenCalledWith(true);
    });

    it('should call callback with false when preference is disabled', () => {
      const callback = vi.fn();

      watchReducedMotionPreference(callback);

      // Simulate media query change event
      const changeEvent = new Event('change') as MediaQueryListEvent;
      Object.defineProperty(changeEvent, 'matches', { value: false });

      listeners.forEach((listener) => listener(changeEvent));

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('should return cleanup function that removes listener', () => {
      const callback = vi.fn();

      const cleanup = watchReducedMotionPreference(callback);

      expect(listeners.length).toBe(1);

      // Call cleanup
      cleanup();

      expect(listeners.length).toBe(0);
      expect(matchMediaMock.removeEventListener).toHaveBeenCalled();
    });

    it('should handle multiple watchers independently', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const cleanup1 = watchReducedMotionPreference(callback1);
      const cleanup2 = watchReducedMotionPreference(callback2);

      expect(listeners.length).toBe(2);

      // Simulate change
      const changeEvent = new Event('change') as MediaQueryListEvent;
      Object.defineProperty(changeEvent, 'matches', { value: true });
      listeners.forEach((listener) => listener(changeEvent));

      expect(callback1).toHaveBeenCalledWith(true);
      expect(callback2).toHaveBeenCalledWith(true);

      // Cleanup first watcher
      cleanup1();
      expect(listeners.length).toBe(1);

      // Cleanup second watcher
      cleanup2();
      expect(listeners.length).toBe(0);
    });

    it('should return no-op cleanup when matchMedia is unavailable', () => {
      vi.stubGlobal('matchMedia', undefined);

      const callback = vi.fn();
      const cleanup = watchReducedMotionPreference(callback);

      // Should not throw
      expect(() => cleanup()).not.toThrow();
    });

    it('should support legacy addListener/removeListener API', () => {
      // Remove modern API
      matchMediaMock.addEventListener = undefined as any;
      matchMediaMock.removeEventListener = undefined as any;

      const callback = vi.fn();
      const cleanup = watchReducedMotionPreference(callback);

      expect(matchMediaMock.addListener).toHaveBeenCalled();

      cleanup();

      expect(matchMediaMock.removeListener).toHaveBeenCalled();
    });
  });

  // T231: User Story 3 acceptance scenario 3 - Integration test
  describe('User Story 3 acceptance: Reduced motion is respected', () => {
    it('should apply reduced motion preference when applying squircles', () => {
      matchMediaMock.matches = true;

      const element = document.createElement('button');
      element.textContent = 'Click me';

      // Apply reduced motion preference
      applyReducedMotionPreference(element);

      // Verify transition is disabled
      expect(element.style.transition).toBe('none');

      // Verify element is still accessible (can receive focus, etc.)
      expect(element.textContent).toBe('Click me');
      expect(element.tagName).toBe('BUTTON');
    });

    it('should dynamically update when preference changes', () => {
      const elements: HTMLElement[] = [];

      // Create test elements
      for (let i = 0; i < 3; i++) {
        const el = document.createElement('div');
        elements.push(el);
      }

      // Watch for changes
      const cleanup = watchReducedMotionPreference((matches) => {
        elements.forEach((el) => {
          if (matches) {
            el.style.transition = 'none';
          } else {
            el.style.transition = '';
          }
        });
      });

      // Simulate preference change to "reduce"
      matchMediaMock.matches = true;
      const changeEvent1 = new Event('change') as MediaQueryListEvent;
      Object.defineProperty(changeEvent1, 'matches', { value: true });
      listeners.forEach((listener) => listener(changeEvent1));

      // Verify all elements have transitions disabled
      elements.forEach((el) => {
        expect(el.style.transition).toBe('none');
      });

      // Simulate preference change to "no-preference"
      matchMediaMock.matches = false;
      const changeEvent2 = new Event('change') as MediaQueryListEvent;
      Object.defineProperty(changeEvent2, 'matches', { value: false });
      listeners.forEach((listener) => listener(changeEvent2));

      // Verify all elements have transitions enabled
      elements.forEach((el) => {
        expect(el.style.transition).toBe('');
      });

      cleanup();
    });
  });
});
