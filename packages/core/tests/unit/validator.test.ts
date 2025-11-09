/**
 * Unit Tests: Input Validator
 * Tests for validator.ts
 * Coverage target: >85% (integration code)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateRadius,
  validateSmoothing,
  validateElement,
  validateSelector,
  validateConfig,
  hasZeroDimensions,
  isDetached,
} from '../../src/utils/validator';

describe('validateRadius', () => {
  // Mock console.warn to verify dev warnings
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  // T047: Test radius validation - positive values
  describe('positive values', () => {
    it('should accept positive radius', () => {
      expect(validateRadius(20)).toBe(20);
      expect(validateRadius(10)).toBe(10);
      expect(validateRadius(100)).toBe(100);
    });

    it('should accept zero radius', () => {
      expect(validateRadius(0)).toBe(0);
    });

    it('should accept decimal radius', () => {
      expect(validateRadius(20.5)).toBe(20.5);
      expect(validateRadius(0.1)).toBe(0.1);
    });
  });

  // T047: Test radius validation - negative values
  describe('negative values', () => {
    it('should reject negative radius and return default', () => {
      expect(validateRadius(-10)).toBe(20); // default
      expect(validateRadius(-0.5)).toBe(20);
    });

    it('should use custom default for negative radius', () => {
      expect(validateRadius(-10, 30)).toBe(30);
    });

    it('should warn in development mode for negative radius', () => {
      validateRadius(-10);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Radius must be >= 0')
      );
    });
  });

  // T047: Test radius validation - non-number values
  describe('non-number values', () => {
    it('should reject NaN and return default', () => {
      expect(validateRadius(NaN)).toBe(20);
    });

    it('should reject Infinity and return default', () => {
      expect(validateRadius(Infinity)).toBe(20);
      expect(validateRadius(-Infinity)).toBe(20);
    });

    it('should reject null and return default', () => {
      expect(validateRadius(null)).toBe(20);
    });

    it('should reject undefined and return default', () => {
      expect(validateRadius(undefined)).toBe(20);
    });

    it('should reject string and return default', () => {
      expect(validateRadius('20' as any)).toBe(20);
    });

    it('should reject object and return default', () => {
      expect(validateRadius({} as any)).toBe(20);
    });

    it('should warn in development mode for invalid types', () => {
      validateRadius('invalid' as any);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid radius')
      );
    });
  });
});

describe('validateSmoothing', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  // T048: Test smoothing validation - valid range [0, 1]
  describe('valid range', () => {
    it('should accept smoothing in [0, 1] range', () => {
      expect(validateSmoothing(0)).toBe(0);
      expect(validateSmoothing(0.5)).toBe(0.5);
      expect(validateSmoothing(0.8)).toBe(0.8);
      expect(validateSmoothing(1)).toBe(1);
    });

    it('should not warn for valid smoothing', () => {
      validateSmoothing(0.5);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  // T048: Test smoothing validation - clamping
  describe('clamping behavior', () => {
    it('should clamp smoothing < 0 to 0', () => {
      expect(validateSmoothing(-0.5)).toBe(0);
      expect(validateSmoothing(-1)).toBe(0);
      expect(validateSmoothing(-100)).toBe(0);
    });

    it('should clamp smoothing > 1 to 1', () => {
      expect(validateSmoothing(1.5)).toBe(1);
      expect(validateSmoothing(2)).toBe(1);
      expect(validateSmoothing(100)).toBe(1);
    });

    it('should warn when clamping negative smoothing', () => {
      validateSmoothing(-0.5);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Clamping to 0')
      );
    });

    it('should warn when clamping smoothing > 1', () => {
      validateSmoothing(1.5);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Clamping to 1')
      );
    });
  });

  // T048: Test smoothing validation - invalid types
  describe('invalid types', () => {
    it('should reject NaN and return default', () => {
      expect(validateSmoothing(NaN)).toBe(0.8);
    });

    it('should reject Infinity and return default', () => {
      expect(validateSmoothing(Infinity)).toBe(0.8);
    });

    it('should reject null and return default', () => {
      expect(validateSmoothing(null)).toBe(0.8);
    });

    it('should reject undefined and return default', () => {
      expect(validateSmoothing(undefined)).toBe(0.8);
    });

    it('should reject string and return default', () => {
      expect(validateSmoothing('0.5' as any)).toBe(0.8);
    });

    it('should use custom default for invalid types', () => {
      expect(validateSmoothing('invalid' as any, 0.5)).toBe(0.5);
    });
  });
});

describe('validateElement', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  // T049: Test element validation
  describe('valid HTMLElement', () => {
    it('should accept valid HTMLElement', () => {
      const div = document.createElement('div');
      expect(validateElement(div)).toBe(true);
    });

    it('should accept different HTML element types', () => {
      expect(validateElement(document.createElement('button'))).toBe(true);
      expect(validateElement(document.createElement('span'))).toBe(true);
      expect(validateElement(document.createElement('section'))).toBe(true);
    });
  });

  // T049: Test element validation - invalid types
  describe('invalid types', () => {
    it('should reject null', () => {
      expect(validateElement(null)).toBe(false);
    });

    it('should reject undefined', () => {
      expect(validateElement(undefined)).toBe(false);
    });

    it('should reject string', () => {
      expect(validateElement('div')).toBe(false);
    });

    it('should reject number', () => {
      expect(validateElement(123)).toBe(false);
    });

    it('should reject object', () => {
      expect(validateElement({})).toBe(false);
    });

    it('should reject array', () => {
      expect(validateElement([])).toBe(false);
    });

    it('should warn in development mode for invalid element', () => {
      validateElement('not-an-element');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid element')
      );
    });
  });
});

describe('validateSelector', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Clean up any existing test elements
    document.body.innerHTML = '';
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    document.body.innerHTML = '';
  });

  // T050: Test selector validation - valid selectors
  describe('valid selectors', () => {
    it('should accept valid CSS selector matching one element', () => {
      const div = document.createElement('div');
      div.id = 'test';
      document.body.appendChild(div);

      const result = validateSelector('#test');
      expect(result).toBe(div);
    });

    it('should accept class selector', () => {
      const div = document.createElement('div');
      div.className = 'my-class';
      document.body.appendChild(div);

      const result = validateSelector('.my-class');
      expect(result).toBe(div);
    });

    it('should accept attribute selector', () => {
      const div = document.createElement('div');
      div.setAttribute('data-test', 'value');
      document.body.appendChild(div);

      const result = validateSelector('[data-test="value"]');
      expect(result).toBe(div);
    });

    it('should accept complex selector', () => {
      const parent = document.createElement('div');
      parent.className = 'parent';
      const child = document.createElement('span');
      child.className = 'child';
      parent.appendChild(child);
      document.body.appendChild(parent);

      const result = validateSelector('.parent .child');
      expect(result).toBe(child);
    });
  });

  // T050: Test selector validation - invalid selectors
  describe('invalid selectors', () => {
    it('should throw for invalid CSS syntax', () => {
      expect(() => validateSelector('###invalid')).toThrow(TypeError);
      expect(() => validateSelector('###invalid')).toThrow(/Invalid CSS selector/);
    });

    it('should throw for empty string', () => {
      expect(() => validateSelector('')).toThrow(TypeError);
      expect(() => validateSelector('')).toThrow(/non-empty string/);
    });

    it('should throw for whitespace-only string', () => {
      expect(() => validateSelector('   ')).toThrow(TypeError);
    });

    it('should throw for non-string', () => {
      expect(() => validateSelector(123 as any)).toThrow(TypeError);
    });

    it('should warn for invalid syntax in development', () => {
      try {
        validateSelector('###invalid');
      } catch (e) {
        // Expected error
      }
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid CSS selector syntax')
      );
    });
  });

  // T050: Test selector validation - no matches
  describe('no matching elements', () => {
    it('should throw when selector matches 0 elements', () => {
      expect(() => validateSelector('#nonexistent')).toThrow(Error);
      expect(() => validateSelector('#nonexistent')).toThrow(/matched 0 elements/);
    });

    it('should warn in development when no matches', () => {
      try {
        validateSelector('#nonexistent');
      } catch (e) {
        // Expected error
      }
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('matched 0 elements')
      );
    });
  });

  // T050: Test selector validation - multiple matches
  describe('multiple matching elements', () => {
    it('should return first element when multiple match', () => {
      const div1 = document.createElement('div');
      div1.className = 'item';
      const div2 = document.createElement('div');
      div2.className = 'item';
      document.body.appendChild(div1);
      document.body.appendChild(div2);

      const result = validateSelector('.item');
      expect(result).toBe(div1); // First element
    });

    it('should warn when selector matches multiple elements', () => {
      const div1 = document.createElement('div');
      div1.className = 'item';
      const div2 = document.createElement('div');
      div2.className = 'item';
      document.body.appendChild(div1);
      document.body.appendChild(div2);

      validateSelector('.item');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('matched 2 elements')
      );
    });
  });
});

describe('validateConfig', () => {
  it('should validate and sanitize config object', () => {
    const result = validateConfig({ radius: 20, smoothing: 0.8 });
    expect(result.radius).toBe(20);
    expect(result.smoothing).toBe(0.8);
  });

  it('should use defaults for invalid values', () => {
    const result = validateConfig({ radius: -10, smoothing: 2 });
    expect(result.radius).toBe(20); // default
    expect(result.smoothing).toBe(1); // clamped
  });

  it('should accept valid tier', () => {
    const result = validateConfig({ radius: 20, smoothing: 0.8, tier: 'clippath' });
    expect(result.tier).toBe('clippath');
  });

  it('should ignore invalid tier', () => {
    const result = validateConfig({ radius: 20, smoothing: 0.8, tier: 'invalid' as any });
    expect(result.tier).toBeUndefined();
  });
});

describe('hasZeroDimensions', () => {
  it('should return true for element with zero width', () => {
    const div = document.createElement('div');
    // Don't append to DOM, so it has zero dimensions
    expect(hasZeroDimensions(div)).toBe(true);
  });

  it('should return true for element without layout dimensions', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    // happy-dom doesn't calculate dimensions from CSS, so offsetWidth/offsetHeight will be zero
    expect(hasZeroDimensions(div)).toBe(true);

    document.body.removeChild(div);
  });
});

describe('isDetached', () => {
  it('should return true for detached element', () => {
    const div = document.createElement('div');
    expect(isDetached(div)).toBe(true);
  });

  it('should return false for attached element', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    expect(isDetached(div)).toBe(false);

    document.body.removeChild(div);
  });

  it('should return true after element is removed', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    document.body.removeChild(div);

    expect(isDetached(div)).toBe(true);
  });
});
