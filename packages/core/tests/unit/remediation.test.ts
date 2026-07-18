/**
 * Regression tests for the core library remediation
 * (docs/core-library-review, WP3: API correctness fixes)
 *
 * Covers findings:
 * - F7:  instance-level (constructor) border config is applied
 * - F8:  border: null removes a border via update()
 * - F9:  reduced-motion watcher survives destroy() + reuse
 * - F10: applyAll() continues after a per-element failure
 * - F11: borders fall back to plain clip-path on void/replaced elements
 * - F12: reduced-motion restore only strips cornerKit's own transition entry
 * - F22: inspect() returns a deep copy of the border config
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CornerKit from '../../src/index';

/** Give a happy-dom element real dimensions so renderers run */
function sizeElement(element: HTMLElement, width = 200, height = 100): void {
  Object.defineProperty(element, 'offsetWidth', { value: width, configurable: true });
  Object.defineProperty(element, 'offsetHeight', { value: height, configurable: true });
}

function createSizedDiv(): HTMLElement {
  const element = document.createElement('div');
  sizeElement(element);
  document.body.appendChild(element);
  return element;
}

describe('Core remediation regressions (WP3)', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    global.CSS = {
      supports: vi.fn((property: string, value: string) => {
        return property === 'clip-path' && value.includes('path');
      }),
    } as any;

    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    consoleWarnSpy.mockRestore();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  // ==========================================================================
  // F7: instance-level border configuration
  // ==========================================================================
  describe('F7: constructor border config is applied', () => {
    it('applies an instance-level border object as fallback', () => {
      const ck = new CornerKit({ border: { width: 2, color: 'red' } });
      const element = createSizedDiv();

      ck.apply(element);

      expect(ck.inspect(element)?.config.border).toEqual({ width: 2, color: 'red' });
      expect(element.querySelector('.cornerkit-border')).not.toBeNull();
    });

    it('applies legacy instance-level borderWidth/borderColor as fallback', () => {
      const ck = new CornerKit({ borderWidth: 3, borderColor: 'blue' });
      const element = createSizedDiv();

      ck.apply(element);

      expect(ck.inspect(element)?.config.border).toEqual({ width: 3, color: 'blue' });
    });

    it('per-element border overrides the instance-level border', () => {
      const ck = new CornerKit({ border: { width: 2, color: 'red' } });
      const element = createSizedDiv();

      ck.apply(element, { border: { width: 4, color: 'green' } });

      expect(ck.inspect(element)?.config.border).toEqual({ width: 4, color: 'green' });
    });

    it('border: null disables the instance-level border for one element', () => {
      const ck = new CornerKit({ border: { width: 2, color: 'red' } });
      const element = createSizedDiv();

      ck.apply(element, { border: null });

      expect(ck.inspect(element)?.config.border).toBeUndefined();
      expect(element.querySelector('.cornerkit-border')).toBeNull();
    });
  });

  // ==========================================================================
  // F8: border removal via update()
  // ==========================================================================
  describe('F8: update() with border: null removes the border', () => {
    it('removes the border config and its SVG', () => {
      const ck = new CornerKit();
      const element = createSizedDiv();

      ck.apply(element, { border: { width: 2, color: 'red' } });
      expect(element.querySelector('.cornerkit-border')).not.toBeNull();

      ck.update(element, { border: null });

      expect(ck.inspect(element)?.config.border).toBeUndefined();
      expect(element.querySelector('.cornerkit-border')).toBeNull();
      // Element falls back to plain clip-path rendering
      expect(element.style.clipPath).not.toBe('');
    });
  });

  // ==========================================================================
  // F9: reduced-motion watcher survives destroy()
  // ==========================================================================
  describe('F9: reduced-motion watcher is recreated after destroy()', () => {
    it('re-registers the media query listener on next apply()', () => {
      const addListenerSpy = vi.fn();
      const removeListenerSpy = vi.fn();
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        addEventListener: addListenerSpy,
        removeEventListener: removeListenerSpy,
      });

      const ck = new CornerKit();
      expect(addListenerSpy).toHaveBeenCalledTimes(1);

      ck.destroy();
      expect(removeListenerSpy).toHaveBeenCalledTimes(1);

      const element = createSizedDiv();
      ck.apply(element);

      // The watcher must be alive again after destroy() + apply()
      expect(addListenerSpy).toHaveBeenCalledTimes(2);
    });
  });

  // ==========================================================================
  // F10: applyAll() error containment
  // ==========================================================================
  describe('F10: applyAll() continues after a per-element failure', () => {
    it('applies squircles to remaining elements when one fails', () => {
      const ck = new CornerKit();

      const buttons = [1, 2, 3].map(() => {
        const button = document.createElement('button');
        button.className = 'btn';
        sizeElement(button);
        document.body.appendChild(button);
        return button;
      });

      // First apply() call throws; subsequent calls run the real implementation
      const applySpy = vi.spyOn(ck, 'apply').mockImplementationOnce(() => {
        throw new Error('boom');
      });

      expect(() => ck.applyAll('.btn')).not.toThrow();

      expect(applySpy).toHaveBeenCalledTimes(3);
      expect(ck.inspect(buttons[0])).toBeNull();
      expect(ck.inspect(buttons[1])).not.toBeNull();
      expect(ck.inspect(buttons[2])).not.toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('applyAll(): failed to apply'),
        expect.anything()
      );
    });
  });

  // ==========================================================================
  // F11: borders on void/replaced elements
  // ==========================================================================
  describe('F11: border on void/replaced elements falls back to clip-path', () => {
    it('does not insert a border SVG into an <input> and warns', () => {
      const ck = new CornerKit();
      const input = document.createElement('input');
      sizeElement(input);
      document.body.appendChild(input);

      ck.apply(input, { border: { width: 2, color: 'red' } });

      // No border SVG child, no forced-transparent background
      expect(input.querySelector('.cornerkit-border')).toBeNull();
      expect(input.style.backgroundColor).not.toBe('transparent');
      // Squircle shape still applied via plain clip-path
      expect(input.style.clipPath).not.toBe('');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Borders are not supported on <input>')
      );
    });

    it('still renders the border SVG on a regular <div>', () => {
      const ck = new CornerKit();
      const element = createSizedDiv();

      ck.apply(element, { border: { width: 2, color: 'red' } });

      expect(element.querySelector('.cornerkit-border')).not.toBeNull();
    });
  });

  // ==========================================================================
  // F12: reduced-motion restore preserves user transitions
  // ==========================================================================
  describe('F12: reduced-motion restore keeps user clip-path transitions', () => {
    it('only removes the exact "clip-path 0s" entry cornerKit added', () => {
      let preferenceListener: ((event: { matches: boolean }) => void) | undefined;
      window.matchMedia = vi.fn().mockReturnValue({
        matches: true, // reduced motion ON at construction
        addEventListener: vi.fn((_type: string, listener: (event: { matches: boolean }) => void) => {
          preferenceListener = listener;
        }),
        removeEventListener: vi.fn(),
      });

      const ck = new CornerKit();
      const element = createSizedDiv();
      ck.apply(element);

      // cornerKit disabled clip-path transitions for reduced motion
      expect(element.style.transition).toContain('clip-path 0s');

      // User later adds their own clip-path transition alongside ours
      element.style.transition = 'clip-path 0s, clip-path 4s ease';

      // User turns reduced motion OFF
      preferenceListener?.({ matches: false });

      // Ours is gone, the user's own transition survives
      expect(element.style.transition).not.toContain('clip-path 0s,');
      expect(element.style.transition).toContain('clip-path 4s ease');
    });
  });

  // ==========================================================================
  // Border configs are cloned on intake (no aliasing of caller objects)
  // ==========================================================================
  describe('border configs are cloned on intake', () => {
    it('mutating the constructor border object does not affect applied elements', () => {
      const sharedBorder = { width: 2, color: 'red' };
      const ck = new CornerKit({ border: sharedBorder });
      const element = createSizedDiv();

      ck.apply(element);
      sharedBorder.width = 99;
      sharedBorder.color = 'hotpink';

      expect(ck.inspect(element)?.config.border).toEqual({ width: 2, color: 'red' });
    });

    it('mutating the border object passed to apply() does not affect managed state', () => {
      const ck = new CornerKit();
      const element = createSizedDiv();
      const border = { width: 3, color: 'blue' };

      ck.apply(element, { border });
      border.width = 99;

      expect(ck.inspect(element)?.config.border?.width).toBe(3);
    });

    it('elements sharing the instance-level default get independent configs', () => {
      const ck = new CornerKit({ border: { width: 2, color: 'red' } });
      const first = createSizedDiv();
      const second = createSizedDiv();

      ck.apply(first);
      ck.apply(second);
      ck.update(first, { border: { width: 5, color: 'green' } });

      expect(ck.inspect(first)?.config.border?.width).toBe(5);
      expect(ck.inspect(second)?.config.border?.width).toBe(2);
    });
  });

  // ==========================================================================
  // Legacy borderWidth: 0 means "no border"
  // ==========================================================================
  describe('legacy zero border width', () => {
    it('does not create a border for borderWidth: 0 with a color', () => {
      const ck = new CornerKit();
      const element = createSizedDiv();

      ck.apply(element, { borderWidth: 0, borderColor: 'red' });

      expect(ck.inspect(element)?.config.border).toBeUndefined();
      expect(element.querySelector('.cornerkit-border')).toBeNull();
    });

    it('removes an existing border via update() with borderWidth: 0', () => {
      const ck = new CornerKit();
      const element = createSizedDiv();

      ck.apply(element, { border: { width: 2, color: 'red' } });
      expect(element.querySelector('.cornerkit-border')).not.toBeNull();

      ck.update(element, { borderWidth: 0 });

      expect(ck.inspect(element)?.config.border).toBeUndefined();
      expect(element.querySelector('.cornerkit-border')).toBeNull();
    });
  });

  // ==========================================================================
  // F22: inspect() deep copy
  // ==========================================================================
  describe('F22: inspect() returns a deep copy of border config', () => {
    it('mutating the returned border does not affect live config', () => {
      const ck = new CornerKit();
      const element = createSizedDiv();

      ck.apply(element, {
        border: {
          width: 2,
          gradient: [
            { offset: '0%', color: '#3b82f6' },
            { offset: '100%', color: '#8b5cf6' },
          ],
        },
      });

      const info = ck.inspect(element);
      expect(info?.config.border?.width).toBe(2);

      // Mutate the returned copies
      info!.config.border!.width = 99;
      info!.config.border!.gradient![0]!.color = 'hotpink';

      const fresh = ck.inspect(element);
      expect(fresh?.config.border?.width).toBe(2);
      expect(fresh?.config.border?.gradient?.[0]?.color).toBe('#3b82f6');
    });
  });
});
