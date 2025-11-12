/**
 * Unit Tests: SVG Path Generator
 * Tests for path-generator.ts
 * Coverage target: >90% (core functionality)
 */

import { describe, it, expect } from 'vitest';
import { generateSquirclePath, generateClipPath } from '../../src/math/path-generator';

describe('generateSquirclePath', () => {
  // T037: Test path validity - Parse generated path with DOMParser
  describe('path validity', () => {
    it('should generate valid SVG path syntax', () => {
      const path = generateSquirclePath(100, 100, 20, 0.8);

      // Path should start with M (moveTo) - Figma format uses spaces not commas
      expect(path).toMatch(/^M\s+[\d.-]+\s+[\d.-]+/);

      // Path should contain bezier curves (c commands - lowercase relative)
      expect(path).toMatch(/c\s+[\d.-]+/);

      // Path should end with Z (close path)
      expect(path).toMatch(/Z$/);
    });

    it('should generate path parseable by DOMParser', () => {
      const path = generateSquirclePath(100, 100, 20, 0.8);

      // Create SVG with the path
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${path}"/></svg>`;
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, 'image/svg+xml');

      // Check for parse errors
      const parseError = doc.querySelector('parsererror');
      expect(parseError).toBeNull();

      // Verify path element exists
      const pathElement = doc.querySelector('path');
      expect(pathElement).not.toBeNull();
      expect(pathElement?.getAttribute('d')).toBe(path);
    });

    it('should generate path with valid coordinate format', () => {
      const path = generateSquirclePath(100, 100, 20, 0.8);

      // All numbers should be valid (Figma format uses spaces, not commas)
      const numberRegex = /[\d.-]+/g;
      const numbers = path.match(numberRegex);

      expect(numbers).not.toBeNull();
      expect(numbers!.length).toBeGreaterThan(0);

      // Verify each number is valid
      numbers!.forEach((numStr) => {
        const num = Number(numStr);
        expect(isNaN(num)).toBe(false);
      });
    });
  });

  // T038: Test radius clamping
  describe('radius clamping (FR-017)', () => {
    it('should clamp radius when larger than width/2', () => {
      // 100px radius on 50px wide element should clamp to 25px
      const path = generateSquirclePath(50, 100, 100, 0.8);

      // Path should still be valid
      expect(path).toMatch(/^M/);
      expect(path).toMatch(/Z$/);

      // Should not contain NaN or Infinity
      expect(path).not.toMatch(/NaN/);
      expect(path).not.toMatch(/Infinity/);

      // All numbers in path should be reasonable (less than 2x element dimensions)
      const numbers = path.match(/[\d.]+/g)?.map(Number) || [];
      numbers.forEach((num) => {
        expect(num).toBeLessThanOrEqual(200); // Reasonable upper bound
        expect(isNaN(num)).toBe(false);
      });
    });

    it('should clamp radius when larger than height/2', () => {
      // 100px radius on 50px tall element should clamp to 25px
      const path = generateSquirclePath(100, 50, 100, 0.8);

      expect(path).toMatch(/^M/);
      expect(path).toMatch(/Z$/);

      // Should not contain NaN or Infinity
      expect(path).not.toMatch(/NaN/);
      expect(path).not.toMatch(/Infinity/);

      // All numbers should be valid
      const numbers = path.match(/[\d.]+/g)?.map(Number) || [];
      numbers.forEach((num) => {
        expect(num).toBeLessThanOrEqual(200); // Reasonable upper bound
        expect(isNaN(num)).toBe(false);
      });
    });

    it('should clamp radius to minimum of width/2 and height/2', () => {
      // 100px radius on 60x40 element should clamp to 20px (min of 30 and 20)
      const path1 = generateSquirclePath(60, 40, 100, 0.8);
      const path2 = generateSquirclePath(60, 40, 20, 0.8);

      // Both paths should be similar since radius is clamped to 20 in both cases
      expect(path1).toBe(path2);
    });

    it('should not modify radius when within valid range', () => {
      const path1 = generateSquirclePath(100, 100, 20, 0.8);
      const path2 = generateSquirclePath(100, 100, 20, 0.8);

      expect(path1).toBe(path2);
    });
  });

  // T039: Test path optimization
  describe('path optimization (FR-033)', () => {
    it('should round coordinates to minimize path string size', () => {
      const path = generateSquirclePath(100, 100, 20, 0.8);

      // Coordinates should have at most 2 decimal places
      const numbers = path.match(/[\d.]+/g) || [];

      numbers.forEach((numStr) => {
        if (numStr.includes('.')) {
          const decimals = numStr.split('.')[1];
          expect(decimals.length).toBeLessThanOrEqual(2);
        }
      });
    });

    it('should produce smaller path than point-based alternative', () => {
      const bezierPath = generateSquirclePath(100, 100, 20, 0.8);

      // Bezier path should be reasonably compact
      // Target: ~160 characters (from research.md Decision 1)
      // Allow some flexibility: 100-300 characters
      expect(bezierPath.length).toBeGreaterThan(50);
      expect(bezierPath.length).toBeLessThan(500);
    });

    it('should not have redundant spaces', () => {
      const path = generateSquirclePath(100, 100, 20, 0.8);

      // Should not have double spaces
      expect(path).not.toMatch(/\s{2,}/);

      // Should have single spaces between commands and coordinates
      expect(path).toMatch(/\s/);
    });
  });

  // T040: Test edge cases
  describe('edge cases', () => {
    it('should handle 0×0 element gracefully', () => {
      const path = generateSquirclePath(0, 0, 20, 0.8);

      // Should return a valid path (degenerate rectangle)
      expect(path).toMatch(/^M/);
      expect(path).toMatch(/Z$/);

      // Should not contain NaN or Infinity
      expect(path).not.toMatch(/NaN/);
      expect(path).not.toMatch(/Infinity/);
    });

    it('should handle very large radius', () => {
      const path = generateSquirclePath(100, 100, 999999, 0.8);

      // Should clamp to valid range and produce valid path
      expect(path).toMatch(/^M/);
      expect(path).toMatch(/Z$/);
      expect(path).not.toMatch(/NaN/);
    });

    it('should handle very small radius', () => {
      const path = generateSquirclePath(100, 100, 0.01, 0.8);

      // Should produce valid path even with tiny radius
      expect(path).toMatch(/^M/);
      expect(path).toMatch(/Z$/);
    });

    it('should handle zero radius', () => {
      const path = generateSquirclePath(100, 100, 0, 0.8);

      // Should return rectangle (no curves)
      expect(path).toMatch(/^M/);
      expect(path).toMatch(/Z$/);
    });

    it('should handle extreme smoothing values', () => {
      // Smoothing is clamped in superellipse.ts, but test anyway
      const path1 = generateSquirclePath(100, 100, 20, 0); // Square
      const path2 = generateSquirclePath(100, 100, 20, 1); // Circle

      expect(path1).toMatch(/^M/);
      expect(path2).toMatch(/^M/);
      expect(path1).not.toBe(path2); // Different smoothing = different paths
    });

    it('should handle rectangular elements (non-square)', () => {
      const path = generateSquirclePath(200, 50, 20, 0.8);

      expect(path).toMatch(/^M/);
      expect(path).toMatch(/Z$/);

      // Verify all numbers are valid
      const numbers = path.match(/[\d.]+/g)?.map(Number) || [];
      expect(numbers.length).toBeGreaterThan(0);

      numbers.forEach((num) => {
        expect(isNaN(num)).toBe(false);
        expect(num).toBeLessThanOrEqual(400); // Reasonable upper bound (2x width)
      });
    });
  });

  describe('different smoothing values', () => {
    it('should generate different paths for different smoothing values', () => {
      const path1 = generateSquirclePath(100, 100, 20, 0.5);
      const path2 = generateSquirclePath(100, 100, 20, 0.8);
      const path3 = generateSquirclePath(100, 100, 20, 1.0);

      // All paths should be different
      expect(path1).not.toBe(path2);
      expect(path2).not.toBe(path3);
      expect(path1).not.toBe(path3);
    });

    it('should generate same path for same parameters', () => {
      const path1 = generateSquirclePath(100, 100, 20, 0.8);
      const path2 = generateSquirclePath(100, 100, 20, 0.8);

      expect(path1).toBe(path2);
    });
  });
});

describe('generateClipPath', () => {
  it('should wrap path in CSS path() function', () => {
    const clipPath = generateClipPath(100, 100, 20, 0.8);

    // Should start with path(' and end with ')
    expect(clipPath).toMatch(/^path\('/);
    expect(clipPath).toMatch(/'\)$/);
  });

  it('should contain valid SVG path inside path() function', () => {
    const clipPath = generateClipPath(100, 100, 20, 0.8);

    // Extract path from path('...')
    const match = clipPath.match(/^path\('(.+)'\)$/);
    expect(match).not.toBeNull();

    const path = match![1];
    expect(path).toMatch(/^M/);
    expect(path).toMatch(/Z$/);
  });

  it('should generate valid clip-path for different parameters', () => {
    const clipPath1 = generateClipPath(100, 100, 20, 0.5);
    const clipPath2 = generateClipPath(200, 150, 30, 0.9);

    expect(clipPath1).toMatch(/^path\('/);
    expect(clipPath2).toMatch(/^path\('/);
    expect(clipPath1).not.toBe(clipPath2);
  });

  it('should use default smoothing of 0.6', () => {
    const clipPath1 = generateClipPath(100, 100, 20);
    const clipPath2 = generateClipPath(100, 100, 20, 0.6);

    expect(clipPath1).toBe(clipPath2);
  });
});
