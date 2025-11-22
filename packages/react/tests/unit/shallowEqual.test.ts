import { describe, it, expect } from 'vitest';
import { shallowEqual } from '../../src/utils/shallowEqual';

describe('shallowEqual', () => {
  describe('primitive comparisons', () => {
    it('returns true for identical references', () => {
      const options = { radius: 20 };
      expect(shallowEqual(options, options)).toBe(true);
    });

    it('returns true for both undefined', () => {
      expect(shallowEqual(undefined, undefined)).toBe(true);
    });

    it('returns false when one is undefined', () => {
      expect(shallowEqual(undefined, { radius: 20 })).toBe(false);
      expect(shallowEqual({ radius: 20 }, undefined)).toBe(false);
    });

    it('returns true for equal radius values', () => {
      expect(shallowEqual({ radius: 20 }, { radius: 20 })).toBe(true);
    });

    it('returns false for different radius values', () => {
      expect(shallowEqual({ radius: 20 }, { radius: 40 })).toBe(false);
    });

    it('returns true for equal smoothing values', () => {
      expect(shallowEqual({ smoothing: 0.8 }, { smoothing: 0.8 })).toBe(true);
    });

    it('returns false for different smoothing values', () => {
      expect(shallowEqual({ smoothing: 0.5 }, { smoothing: 0.9 })).toBe(false);
    });
  });

  describe('border comparisons', () => {
    it('returns true when both borders are undefined', () => {
      expect(shallowEqual({ radius: 20 }, { radius: 20 })).toBe(true);
    });

    it('returns true for same border reference', () => {
      const border = { width: 2, color: 'red' };
      expect(shallowEqual({ border }, { border })).toBe(true);
    });

    it('returns false when one border is undefined', () => {
      expect(
        shallowEqual(
          { radius: 20 },
          { radius: 20, border: { width: 2, color: 'red' } }
        )
      ).toBe(false);
      expect(
        shallowEqual(
          { radius: 20, border: { width: 2, color: 'red' } },
          { radius: 20 }
        )
      ).toBe(false);
    });

    it('returns true for equal border values', () => {
      expect(
        shallowEqual(
          { border: { width: 2, color: 'red' } },
          { border: { width: 2, color: 'red' } }
        )
      ).toBe(true);
    });

    it('returns false for different border width', () => {
      expect(
        shallowEqual(
          { border: { width: 1, color: 'red' } },
          { border: { width: 2, color: 'red' } }
        )
      ).toBe(false);
    });

    it('returns false for different border color', () => {
      expect(
        shallowEqual(
          { border: { width: 2, color: 'red' } },
          { border: { width: 2, color: 'blue' } }
        )
      ).toBe(false);
    });
  });

  describe('combined options', () => {
    it('returns true for fully equal options', () => {
      expect(
        shallowEqual(
          { radius: 24, smoothing: 0.9, border: { width: 2, color: '#3b82f6' } },
          { radius: 24, smoothing: 0.9, border: { width: 2, color: '#3b82f6' } }
        )
      ).toBe(true);
    });

    it('returns false when any value differs', () => {
      const base = { radius: 24, smoothing: 0.9, border: { width: 2, color: '#3b82f6' } };

      expect(shallowEqual(base, { ...base, radius: 20 })).toBe(false);
      expect(shallowEqual(base, { ...base, smoothing: 0.5 })).toBe(false);
      expect(shallowEqual(base, { ...base, border: { width: 1, color: '#3b82f6' } })).toBe(false);
      expect(shallowEqual(base, { ...base, border: { width: 2, color: 'red' } })).toBe(false);
    });
  });
});
