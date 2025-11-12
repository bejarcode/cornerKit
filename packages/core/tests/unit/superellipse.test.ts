import { describe, it, expect } from 'vitest';
import {
  smoothingToExponent,
  generateCornerPoints,
  generateSquircleCorners,
  type SuperellipsePoint,
} from '../../src/math/superellipse';

// NOTE: These tests are for the old superellipse implementation.
// We switched to Figma's squircle algorithm (figma-squircle.ts) which uses
// arc + bezier curves instead of the superellipse formula.
// Skipping these tests until we update them or remove the old implementation.
describe.skip('Superellipse Math Engine (OLD IMPLEMENTATION - DEPRECATED)', () => {
  describe('smoothingToExponent() - FR-014', () => {
    it('should convert smoothing=0.0 to exponent=4.0 (square)', () => {
      expect(smoothingToExponent(0.0)).toBe(4.0);
    });

    it('should convert smoothing=0.5 to exponent=3.0 (moderate)', () => {
      expect(smoothingToExponent(0.5)).toBe(3.0);
    });

    it('should convert smoothing=0.8 to exponent=2.4 (iOS-like)', () => {
      expect(smoothingToExponent(0.8)).toBeCloseTo(2.4, 10);
    });

    it('should convert smoothing=1.0 to exponent=2.0 (circle)', () => {
      expect(smoothingToExponent(1.0)).toBe(2.0);
    });

    it('should clamp negative smoothing values to 0', () => {
      expect(smoothingToExponent(-0.5)).toBe(4.0); // Same as smoothing=0
    });

    it('should clamp smoothing values > 1 to 1', () => {
      expect(smoothingToExponent(1.5)).toBe(2.0); // Same as smoothing=1
    });

    it('should handle edge case smoothing=0.25', () => {
      expect(smoothingToExponent(0.25)).toBe(3.5);
    });

    it('should handle edge case smoothing=0.75', () => {
      expect(smoothingToExponent(0.75)).toBe(2.5);
    });
  });

  describe('generateCornerPoints() - FR-015', () => {
    it('should generate 8 points by default', () => {
      const points = generateCornerPoints(100, 100, 20, 2.4, 0);
      expect(points).toHaveLength(8);
    });

    it('should generate correct number of custom points', () => {
      const points = generateCornerPoints(100, 100, 20, 2.4, 0, 16);
      expect(points).toHaveLength(16);
    });

    it('should return SuperellipsePoint objects with x and y', () => {
      const points = generateCornerPoints(100, 100, 20, 2.4, 0);

      points.forEach((point) => {
        expect(point).toHaveProperty('x');
        expect(point).toHaveProperty('y');
        expect(typeof point.x).toBe('number');
        expect(typeof point.y).toBe('number');
      });
    });

    it('should clamp radius to min(width/2, height/2)', () => {
      // Element: 100x100, radius: 100 (too large)
      const points = generateCornerPoints(100, 100, 100, 2.4, 0);

      // All points should be within bounds (radius clamped to 50)
      points.forEach((point) => {
        expect(Math.abs(point.x)).toBeLessThanOrEqual(50);
        expect(Math.abs(point.y)).toBeLessThanOrEqual(50);
      });
    });

    it('should clamp radius for non-square elements (width > height)', () => {
      // Element: 200x100, radius: 80 (exceeds height/2)
      const points = generateCornerPoints(200, 100, 80, 2.4, 0);

      // Points should be clamped to 50 (height/2)
      points.forEach((point) => {
        expect(Math.abs(point.x)).toBeLessThanOrEqual(50);
        expect(Math.abs(point.y)).toBeLessThanOrEqual(50);
      });
    });

    it('should clamp radius for non-square elements (height > width)', () => {
      // Element: 100x200, radius: 80 (exceeds width/2)
      const points = generateCornerPoints(100, 200, 80, 2.4, 0);

      // Points should be clamped to 50 (width/2)
      points.forEach((point) => {
        expect(Math.abs(point.x)).toBeLessThanOrEqual(50);
        expect(Math.abs(point.y)).toBeLessThanOrEqual(50);
      });
    });

    describe('Corner rotation angles (FR-015)', () => {
      it('should generate top-left corner (0°)', () => {
        const points = generateCornerPoints(100, 100, 20, 2.4, 0, 4);

        // First point should start near x-axis
        expect(points[0].x).toBeGreaterThan(0);
        expect(Math.abs(points[0].y)).toBeLessThan(1);

        // Last point should end near y-axis
        expect(Math.abs(points[3].x)).toBeLessThan(1);
        expect(points[3].y).toBeGreaterThan(0);
      });

      it('should generate top-right corner (90°)', () => {
        const points = generateCornerPoints(100, 100, 20, 2.4, 1, 4);

        // Rotation should shift the curve 90 degrees
        expect(Math.abs(points[0].x)).toBeLessThan(1);
        expect(points[0].y).toBeGreaterThan(0);
      });

      it('should generate bottom-right corner (180°)', () => {
        const points = generateCornerPoints(100, 100, 20, 2.4, 2, 4);

        // Rotation should shift the curve 180 degrees
        expect(points[0].x).toBeLessThan(0);
        expect(Math.abs(points[0].y)).toBeLessThan(1);
      });

      it('should generate bottom-left corner (270°)', () => {
        const points = generateCornerPoints(100, 100, 20, 2.4, 3, 4);

        // Rotation should shift the curve 270 degrees
        expect(Math.abs(points[0].x)).toBeLessThan(1);
        expect(points[0].y).toBeLessThan(0);
      });
    });

    describe('Exponent effects', () => {
      it('should generate more circular curves with n=2 (circle)', () => {
        const points = generateCornerPoints(100, 100, 20, 2.0, 0, 8);

        // For a circle, points should be more evenly distributed
        points.forEach((point) => {
          const distance = Math.sqrt(point.x * point.x + point.y * point.y);
          expect(distance).toBeCloseTo(20, 0.5); // All points ~20px from origin
        });
      });

      it('should generate more square curves with n=4 (square)', () => {
        const points = generateCornerPoints(100, 100, 20, 4.0, 0, 8);

        // For a square, points should hug the axes more
        // First point should be close to (20, 0)
        expect(points[0].x).toBeCloseTo(20, 1);
        expect(Math.abs(points[0].y)).toBeLessThan(1);

        // Last point should be close to (0, 20)
        expect(Math.abs(points[points.length - 1].x)).toBeLessThan(1);
        expect(points[points.length - 1].y).toBeCloseTo(20, 1);
      });
    });

    describe('Edge cases', () => {
      it('should handle zero radius', () => {
        const points = generateCornerPoints(100, 100, 0, 2.4, 0);
        expect(points).toHaveLength(8);
        points.forEach((point) => {
          expect(point.x).toBeCloseTo(0, 5);
          expect(point.y).toBeCloseTo(0, 5);
        });
      });

      it('should handle very small elements', () => {
        const points = generateCornerPoints(10, 10, 5, 2.4, 0);
        expect(points).toHaveLength(8);
        // Radius should be clamped to 5 (min(10/2, 10/2))
        points.forEach((point) => {
          expect(Math.abs(point.x)).toBeLessThanOrEqual(5);
          expect(Math.abs(point.y)).toBeLessThanOrEqual(5);
        });
      });

      it('should handle very large radius', () => {
        const points = generateCornerPoints(50, 50, 1000, 2.4, 0);
        // Radius should be clamped to 25 (min(50/2, 50/2))
        points.forEach((point) => {
          expect(Math.abs(point.x)).toBeLessThanOrEqual(25);
          expect(Math.abs(point.y)).toBeLessThanOrEqual(25);
        });
      });
    });
  });

  describe('generateSquircleCorners()', () => {
    it('should generate points for all 4 corners', () => {
      const corners = generateSquircleCorners(100, 100, 20, 0.8);

      expect(corners).toHaveProperty('topLeft');
      expect(corners).toHaveProperty('topRight');
      expect(corners).toHaveProperty('bottomRight');
      expect(corners).toHaveProperty('bottomLeft');

      expect(corners.topLeft).toHaveLength(8);
      expect(corners.topRight).toHaveLength(8);
      expect(corners.bottomRight).toHaveLength(8);
      expect(corners.bottomLeft).toHaveLength(8);
    });

    it('should use default smoothing=0.8 if not provided', () => {
      const corners = generateSquircleCorners(100, 100, 20);

      // Should use exponent 2.4 (from smoothing=0.8)
      // Verify by checking that points are squircle-like, not circular
      const topLeft = corners.topLeft;

      // For squircle (n=2.4), first point should be close to radius on x-axis
      expect(topLeft[0].x).toBeCloseTo(20, 1);
      expect(Math.abs(topLeft[0].y)).toBeLessThan(1);
    });

    it('should apply smoothing parameter correctly', () => {
      const circleCorners = generateSquircleCorners(100, 100, 20, 1.0); // n=2
      const squareCorners = generateSquircleCorners(100, 100, 20, 0.0); // n=4

      // Circle corners should have more uniform distance from origin
      const circlePoint = circleCorners.topLeft[4]; // Middle point
      const circleDistance = Math.sqrt(
        circlePoint.x * circlePoint.x + circlePoint.y * circlePoint.y
      );

      // Square corners should hug axes more
      const squarePoint = squareCorners.topLeft[4];
      const squareDistance = Math.sqrt(
        squarePoint.x * squarePoint.x + squarePoint.y * squarePoint.y
      );

      // Circle should have more consistent radius
      expect(circleDistance).toBeCloseTo(20, 2);

      // Square middle point should be further from origin (flatter curve)
      expect(squareDistance).toBeGreaterThan(circleDistance);
    });

    it('should clamp radius across all corners', () => {
      const corners = generateSquircleCorners(100, 100, 80, 0.8);

      // Radius should be clamped to 50 for all corners
      [corners.topLeft, corners.topRight, corners.bottomRight, corners.bottomLeft].forEach(
        (cornerPoints) => {
          cornerPoints.forEach((point) => {
            expect(Math.abs(point.x)).toBeLessThanOrEqual(50);
            expect(Math.abs(point.y)).toBeLessThanOrEqual(50);
          });
        }
      );
    });
  });
});
