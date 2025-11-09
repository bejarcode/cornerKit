/**
 * Unit Tests: Development Logger
 * Tests for logger.ts
 * Coverage target: >85% (integration code)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  warn,
  error,
  info,
  warnInvalidRadius,
  warnInvalidSmoothing,
  warnInvalidDataAttribute,
  warnZeroDimensions,
  warnDetachedElement,
  warnDuplicateApply,
  warnMultipleMatches,
  warnNoMatches,
  warnInvalidSelector,
  warnNonHTMLElement,
  warnInvalidElement,
  warnPerformance,
  warnUnsupportedFeature,
  warnOnce,
  clearWarningCache,
  hasWarned,
} from '../../src/utils/logger';

describe('logger', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    clearWarningCache();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleInfoSpy.mockRestore();
  });

  // T057: Test development mode - warnings are logged
  describe('warn()', () => {
    it('should log warning in development mode', () => {
      warn('Test warning');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[cornerKit] Test warning');
    });

    it('should log warning with context', () => {
      const context = { foo: 'bar', count: 42 };
      warn('Test warning', context);
      expect(consoleWarnSpy).toHaveBeenCalledWith('[cornerKit] Test warning', context);
    });

    it('should prefix all warnings with [cornerKit]', () => {
      warn('Message');
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('[cornerKit]'));
    });
  });

  describe('error()', () => {
    it('should log error (always, even in production)', () => {
      error('Test error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[cornerKit] Test error');
    });

    it('should log error with context', () => {
      const context = { errorCode: 500 };
      error('Test error', context);
      expect(consoleErrorSpy).toHaveBeenCalledWith('[cornerKit] Test error', context);
    });

    it('should prefix all errors with [cornerKit]', () => {
      error('Message');
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('[cornerKit]'));
    });
  });

  describe('info()', () => {
    it('should log info in development mode', () => {
      info('Test info');
      expect(consoleInfoSpy).toHaveBeenCalledWith('[cornerKit] Test info');
    });

    it('should log info with context', () => {
      const context = { version: '1.0.0' };
      info('Test info', context);
      expect(consoleInfoSpy).toHaveBeenCalledWith('[cornerKit] Test info', context);
    });
  });

  // T053: Test specific warning functions
  describe('specific warnings', () => {
    it('should warn about invalid radius', () => {
      warnInvalidRadius(-10, 20);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid radius')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Using default: 20')
      );
    });

    it('should warn about invalid smoothing', () => {
      warnInvalidSmoothing(2, 0.8);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid smoothing')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Using default: 0.8')
      );
    });

    it('should warn about invalid data attribute', () => {
      const div = document.createElement('div');
      div.id = 'test-element';
      div.className = 'test-class';

      warnInvalidDataAttribute(div, 'data-squircle-radius', 'invalid');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid data attribute'),
        expect.objectContaining({
          element: 'DIV',
          id: 'test-element',
          className: 'test-class',
        })
      );
    });
  });

  // T054: Test element-specific warnings
  describe('element warnings', () => {
    it('should warn about zero or very small dimensions', () => {
      const div = document.createElement('div');
      div.id = 'zero-size';

      warnZeroDimensions(div);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('zero or very small dimensions'),
        expect.objectContaining({
          element: 'DIV',
          id: 'zero-size',
          width: 0,
          height: 0,
        })
      );
    });

    it('should warn about detached element', () => {
      const div = document.createElement('div');
      div.id = 'detached';

      warnDetachedElement(div);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('not attached to the DOM'),
        expect.objectContaining({
          element: 'DIV',
          id: 'detached',
          isConnected: false,
        })
      );
    });

    it('should warn about duplicate apply', () => {
      const div = document.createElement('div');
      div.id = 'duplicate';

      warnDuplicateApply(div);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('already has squircle applied'),
        expect.objectContaining({
          element: 'DIV',
          id: 'duplicate',
        })
      );
    });
  });

  // T054: Test selector warnings
  describe('selector warnings', () => {
    it('should warn about multiple matches', () => {
      warnMultipleMatches('.item', 5);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('matched 5 elements')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Only the first will be used')
      );
    });

    it('should warn about no matches', () => {
      warnNoMatches('#nonexistent');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('matched 0 elements')
      );
    });

    it('should warn about invalid selector', () => {
      warnInvalidSelector('###invalid');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid CSS selector syntax')
      );
    });

    it('should warn about non-HTML element', () => {
      warnNonHTMLElement('svg', 'SVGElement');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('matched non-HTML element')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('SVGElement')
      );
    });

    it('should warn about invalid element', () => {
      warnInvalidElement('not-an-element');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid element')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Expected HTMLElement')
      );
    });
  });

  // T054: Test performance and feature warnings
  describe('performance and feature warnings', () => {
    it('should warn about performance with many elements', () => {
      warnPerformance(150, 100);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Applying squircles to 150 elements')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('threshold: 100')
      );
    });

    it('should warn about unsupported features', () => {
      warnUnsupportedFeature('clip-path', 'border-radius');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('does not support clip-path')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Using fallback: border-radius')
      );
    });
  });

  // T060: Test warning suppression
  describe('warning suppression', () => {
    it('should suppress duplicate warnings with warnOnce()', () => {
      warnOnce('Duplicate warning');
      warnOnce('Duplicate warning');
      warnOnce('Duplicate warning');

      // Should only be called once
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[cornerKit] Duplicate warning'
      );
    });

    it('should allow different warnings with warnOnce()', () => {
      warnOnce('Warning 1');
      warnOnce('Warning 2');
      warnOnce('Warning 3');

      // Should be called three times (different messages)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(3);
    });

    it('should use custom key for warning suppression', () => {
      warnOnce('Dynamic message 1', 'key-1');
      warnOnce('Dynamic message 2', 'key-1');
      warnOnce('Dynamic message 3', 'key-1');

      // Should only be called once (same key)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    it('should track warned messages with hasWarned()', () => {
      expect(hasWarned('test-warning')).toBe(false);

      warnOnce('Test', 'test-warning');

      expect(hasWarned('test-warning')).toBe(true);
    });

    it('should clear warning cache with clearWarningCache()', () => {
      warnOnce('Test warning', 'test-key');
      expect(hasWarned('test-key')).toBe(true);

      clearWarningCache();
      expect(hasWarned('test-key')).toBe(false);

      // Warning should be logged again after cache clear
      consoleWarnSpy.mockClear();
      warnOnce('Test warning', 'test-key');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });
  });

  // T059: Test helpful, actionable messages
  describe('message quality', () => {
    it('should provide helpful messages for invalid radius', () => {
      warnInvalidRadius(-10, 20);

      const call = consoleWarnSpy.mock.calls[0][0];
      expect(call).toContain('Invalid radius');
      expect(call).toContain('-10');
      expect(call).toContain('default: 20');
    });

    it('should provide helpful messages for invalid smoothing', () => {
      warnInvalidSmoothing('invalid', 0.8);

      const call = consoleWarnSpy.mock.calls[0][0];
      expect(call).toContain('Invalid smoothing');
      expect(call).toContain('[0, 1]');
      expect(call).toContain('default: 0.8');
    });

    it('should provide actionable advice for multiple matches', () => {
      warnMultipleMatches('.item', 5);

      const call = consoleWarnSpy.mock.calls[0][0];
      expect(call).toContain('more specific selector');
      expect(call).toContain('HTMLElement reference');
    });

    it('should provide context for element warnings', () => {
      const div = document.createElement('div');
      div.id = 'test';
      div.className = 'my-class';

      warnZeroDimensions(div);

      const context = consoleWarnSpy.mock.calls[0][1];
      expect(context).toMatchObject({
        element: 'DIV',
        id: 'test',
        className: 'my-class',
      });
    });
  });

  // T058: Verify warnings work in development but are stripped in production
  describe('development vs production', () => {
    it('should log warnings in development mode', () => {
      // We're in development mode (set in vitest.config.ts)
      warn('Development warning');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should always log errors (even in production)', () => {
      error('Critical error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    // Note: We can't test production mode behavior here because NODE_ENV
    // is set to 'development' in vitest.config.ts. In production builds,
    // all `if (process.env.NODE_ENV === 'development')` blocks are
    // eliminated by Rollup dead code elimination.
  });
});
