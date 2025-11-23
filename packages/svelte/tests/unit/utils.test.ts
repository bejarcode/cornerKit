/**
 * Utility function tests for @cornerkit/svelte
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isBrowser, normalizeParams, buildConfig, optionsEqual } from '../../src/utils';
import type { SquircleOptions } from '../../src/types';

describe('Utils', () => {
  describe('isBrowser', () => {
    const originalWindow = global.window;
    const originalDocument = global.document;

    afterEach(() => {
      // Restore globals
      global.window = originalWindow;
      global.document = originalDocument;
    });

    it('should return true in browser environment', () => {
      // happy-dom provides window and document
      expect(isBrowser()).toBe(true);
    });

    it('should return false when window is undefined', () => {
      // @ts-expect-error - intentionally setting to undefined for test
      global.window = undefined;
      expect(isBrowser()).toBe(false);
    });
  });

  describe('normalizeParams', () => {
    it('should return empty object for undefined', () => {
      expect(normalizeParams(undefined)).toEqual({});
    });

    it('should return empty object for null', () => {
      // @ts-expect-error - testing null case
      expect(normalizeParams(null)).toEqual({});
    });

    it('should convert number to radius-only object', () => {
      expect(normalizeParams(20)).toEqual({ radius: 20 });
    });

    it('should convert zero to radius-only object', () => {
      expect(normalizeParams(0)).toEqual({ radius: 0 });
    });

    it('should pass through object options unchanged', () => {
      const options: SquircleOptions = {
        radius: 24,
        smoothing: 0.9,
        border: { width: 2, color: '#000' },
      };

      expect(normalizeParams(options)).toEqual(options);
    });

    it('should pass through partial object options', () => {
      const options: SquircleOptions = { smoothing: 0.5 };
      expect(normalizeParams(options)).toEqual(options);
    });
  });

  describe('buildConfig', () => {
    it('should return empty object for empty options', () => {
      expect(buildConfig({})).toEqual({});
    });

    it('should return empty object for undefined', () => {
      expect(buildConfig(undefined)).toEqual({});
    });

    it('should include radius when provided', () => {
      expect(buildConfig({ radius: 20 })).toEqual({ radius: 20 });
    });

    it('should include smoothing when provided', () => {
      expect(buildConfig({ smoothing: 0.8 })).toEqual({ smoothing: 0.8 });
    });

    it('should transform border to borderWidth and borderColor', () => {
      const config = buildConfig({
        border: { width: 2, color: '#3b82f6' },
      });

      expect(config).toEqual({
        borderWidth: 2,
        borderColor: '#3b82f6',
      });
    });

    it('should include all options when provided', () => {
      const config = buildConfig({
        radius: 24,
        smoothing: 0.9,
        border: { width: 1, color: 'black' },
      });

      expect(config).toEqual({
        radius: 24,
        smoothing: 0.9,
        borderWidth: 1,
        borderColor: 'black',
      });
    });
  });

  describe('optionsEqual', () => {
    it('should return true for same reference', () => {
      const options: SquircleOptions = { radius: 20 };
      expect(optionsEqual(options, options)).toBe(true);
    });

    it('should return true for both undefined', () => {
      expect(optionsEqual(undefined, undefined)).toBe(true);
    });

    it('should return false when one is undefined', () => {
      expect(optionsEqual({ radius: 20 }, undefined)).toBe(false);
      expect(optionsEqual(undefined, { radius: 20 })).toBe(false);
    });

    it('should return true for equal options', () => {
      const a: SquircleOptions = { radius: 20, smoothing: 0.8 };
      const b: SquircleOptions = { radius: 20, smoothing: 0.8 };
      expect(optionsEqual(a, b)).toBe(true);
    });

    it('should return false for different radius', () => {
      const a: SquircleOptions = { radius: 20 };
      const b: SquircleOptions = { radius: 24 };
      expect(optionsEqual(a, b)).toBe(false);
    });

    it('should return false for different smoothing', () => {
      const a: SquircleOptions = { smoothing: 0.8 };
      const b: SquircleOptions = { smoothing: 0.9 };
      expect(optionsEqual(a, b)).toBe(false);
    });

    it('should return true for equal borders', () => {
      const a: SquircleOptions = {
        radius: 20,
        border: { width: 2, color: '#000' },
      };
      const b: SquircleOptions = {
        radius: 20,
        border: { width: 2, color: '#000' },
      };
      expect(optionsEqual(a, b)).toBe(true);
    });

    it('should return false for different border width', () => {
      const a: SquircleOptions = {
        border: { width: 1, color: '#000' },
      };
      const b: SquircleOptions = {
        border: { width: 2, color: '#000' },
      };
      expect(optionsEqual(a, b)).toBe(false);
    });

    it('should return false for different border color', () => {
      const a: SquircleOptions = {
        border: { width: 2, color: '#000' },
      };
      const b: SquircleOptions = {
        border: { width: 2, color: '#fff' },
      };
      expect(optionsEqual(a, b)).toBe(false);
    });

    it('should return false when only one has border', () => {
      const a: SquircleOptions = { radius: 20 };
      const b: SquircleOptions = {
        radius: 20,
        border: { width: 2, color: '#000' },
      };
      expect(optionsEqual(a, b)).toBe(false);
    });
  });
});
