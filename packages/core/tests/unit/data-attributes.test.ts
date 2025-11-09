/**
 * Unit Tests: Data Attribute Parser
 * Tests for utils/data-attributes.ts
 * Coverage target: >85%
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  hasSquircleAttribute,
  parseRadius,
  parseSmoothing,
  parseDataAttributes,
} from '../../src/utils/data-attributes';

describe('Data Attribute Parser', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  // T158: Test hasSquircleAttribute()
  describe('hasSquircleAttribute()', () => {
    it('should return true if element has data-squircle attribute', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle', '');

      expect(hasSquircleAttribute(element)).toBe(true);
    });

    it('should return false if element does not have data-squircle attribute', () => {
      const element = document.createElement('div');

      expect(hasSquircleAttribute(element)).toBe(false);
    });

    it('should return true even with value', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle', 'true');

      expect(hasSquircleAttribute(element)).toBe(true);
    });
  });

  // T159: Test parseRadius()
  describe('parseRadius()', () => {
    it('should parse valid radius number', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-radius', '24');

      expect(parseRadius(element)).toBe(24);
    });

    it('should parse float radius', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-radius', '24.5');

      expect(parseRadius(element)).toBe(24.5);
    });

    it('should return undefined for missing attribute', () => {
      const element = document.createElement('div');

      expect(parseRadius(element)).toBeUndefined();
    });

    it('should return undefined and warn for invalid string', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-radius', 'invalid');

      expect(parseRadius(element)).toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid data-squircle-radius'),
        expect.anything()
      );
    });

    it('should return undefined and warn for empty string', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-radius', '');

      expect(parseRadius(element)).toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should parse zero radius', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-radius', '0');

      expect(parseRadius(element)).toBe(0);
    });

    it('should parse negative radius (validation happens later)', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-radius', '-10');

      // Parser just returns the number, validation happens in CornerKit
      expect(parseRadius(element)).toBe(-10);
    });
  });

  // T160: Test parseSmoothing()
  describe('parseSmoothing()', () => {
    it('should parse valid smoothing number in range 0-1', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-smoothing', '0.85');

      expect(parseSmoothing(element)).toBe(0.85);
    });

    it('should parse 0', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-smoothing', '0');

      expect(parseSmoothing(element)).toBe(0);
    });

    it('should parse 1', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-smoothing', '1');

      expect(parseSmoothing(element)).toBe(1);
    });

    it('should return undefined for missing attribute', () => {
      const element = document.createElement('div');

      expect(parseSmoothing(element)).toBeUndefined();
    });

    it('should return undefined and warn for invalid string', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-smoothing', 'invalid');

      expect(parseSmoothing(element)).toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid data-squircle-smoothing'),
        expect.anything()
      );
    });

    it('should parse out-of-range values (validation happens later)', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-smoothing', '2');

      // Parser just returns the number, validation happens in CornerKit
      expect(parseSmoothing(element)).toBe(2);
    });

    it('should return undefined and warn for empty string', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-smoothing', '');

      expect(parseSmoothing(element)).toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  // T161: Test invalid values with warnings
  describe('invalid values and warnings', () => {
    it('should warn with element context for invalid radius', () => {
      const element = document.createElement('div');
      element.id = 'test-element';
      element.className = 'test-class';
      element.setAttribute('data-squircle-radius', 'NaN');

      parseRadius(element);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid data-squircle-radius'),
        expect.objectContaining({
          element: 'DIV',
          id: 'test-element',
          className: 'test-class',
          value: 'NaN',
        })
      );
    });

    it('should warn with element context for invalid smoothing', () => {
      const element = document.createElement('div');
      element.id = 'smooth-element';
      element.setAttribute('data-squircle-smoothing', 'undefined');

      parseSmoothing(element);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid data-squircle-smoothing'),
        expect.objectContaining({
          element: 'DIV',
          id: 'smooth-element',
          value: 'undefined',
        })
      );
    });
  });

  // T162: Test edge cases
  describe('edge cases', () => {
    it('should handle "NaN" string literal', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-radius', 'NaN');

      expect(parseRadius(element)).toBeUndefined();
    });

    it('should handle "undefined" string literal', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-smoothing', 'undefined');

      expect(parseSmoothing(element)).toBeUndefined();
    });

    it('should handle whitespace', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-radius', '  24  ');

      // parseFloat trims whitespace automatically
      expect(parseRadius(element)).toBe(24);
    });

    it('should handle scientific notation', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-radius', '2e1'); // 20

      expect(parseRadius(element)).toBe(20);
    });
  });

  // T163: Integration test for parseDataAttributes()
  describe('parseDataAttributes()', () => {
    it('should parse both radius and smoothing', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-radius', '32');
      element.setAttribute('data-squircle-smoothing', '0.9');

      const config = parseDataAttributes(element);

      expect(config).toEqual({
        radius: 32,
        smoothing: 0.9,
      });
    });

    it('should parse only radius', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-radius', '24');

      const config = parseDataAttributes(element);

      expect(config).toEqual({
        radius: 24,
      });
    });

    it('should parse only smoothing', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-smoothing', '0.85');

      const config = parseDataAttributes(element);

      expect(config).toEqual({
        smoothing: 0.85,
      });
    });

    it('should return empty object if no attributes', () => {
      const element = document.createElement('div');

      const config = parseDataAttributes(element);

      expect(config).toEqual({});
    });

    it('should omit invalid values', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-radius', '24');
      element.setAttribute('data-squircle-smoothing', 'invalid');

      const config = parseDataAttributes(element);

      // Only radius is included, invalid smoothing is omitted
      expect(config).toEqual({
        radius: 24,
      });
    });

    it('should handle all invalid values', () => {
      const element = document.createElement('div');
      element.setAttribute('data-squircle-radius', 'abc');
      element.setAttribute('data-squircle-smoothing', 'def');

      const config = parseDataAttributes(element);

      // Both invalid, return empty object
      expect(config).toEqual({});
    });
  });
});
