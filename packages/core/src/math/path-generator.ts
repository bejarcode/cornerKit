/**
 * SVG Path Generator
 * Generates optimized SVG path strings for squircle clip-paths
 * Uses Figma's corner smoothing algorithm (arc + cubic bezier curves)
 *
 * Algorithm: Each corner uses an arc + 2 cubic bezier curves for smooth transitions
 * Reference: figma-squircle npm package, MartinRGB's Figma research
 */

import { generateFigmaSquirclePath } from './figma-squircle';

/**
 * FR-016, FR-017: Generate SVG path string for a squircle shape
 * Uses Figma's corner smoothing algorithm for pixel-perfect iOS-style squircles
 *
 * IMPORTANT: smoothing=0.6 matches iOS 7 squircles (per Figma API docs)
 *
 * @param width - Element width in pixels
 * @param height - Element height in pixels
 * @param radius - Corner radius in pixels (will be clamped to min(width/2, height/2))
 * @param smoothing - Smoothing factor 0-1 (default: 0.6 for iOS squircles)
 * @returns SVG path string ready for clip-path CSS property
 *
 * Algorithm: Each corner = arc + 2 cubic bezier curves
 * - smoothing=0: Perfect circle corners (90° arc, no beziers)
 * - smoothing=0.6: iOS 7 squircles (recommended default)
 * - smoothing=1: Maximum smoothing (no arc, all beziers)
 */
export function generateSquirclePath(
  width: number,
  height: number,
  radius: number,
  smoothing: number = 0.6
): string {
  // Handle edge cases: zero dimensions or radius
  if (width <= 0 || height <= 0 || radius <= 0) {
    // Return a simple rectangle path for degenerate cases
    return `M 0,0 L ${round(width)},0 L ${round(width)},${round(height)} L 0,${round(height)} Z`;
  }

  // Use Figma's algorithm (handles clamping internally)
  return generateFigmaSquirclePath(width, height, radius, smoothing);
}

/**
 * FR-033: Optimize path string by rounding coordinates to minimize decimal places
 * Rounds to 2 decimal places for optimal balance between precision and bundle size
 *
 * @param value - Coordinate value
 * @returns Rounded value
 */
function round(value: number): number {
  // Round to 2 decimal places
  // This provides sub-pixel precision (~0.01px) while keeping path strings small
  return Math.round(value * 100) / 100;
}

/**
 * Generate CSS clip-path value from SVG path string
 * Wraps the path in path() function for CSS compatibility
 *
 * @param width - Element width in pixels
 * @param height - Element height in pixels
 * @param radius - Corner radius in pixels
 * @param smoothing - Smoothing factor 0-1 (default: 0.6 for iOS squircles)
 * @returns CSS clip-path value
 *
 * Example: "path('M 10,0 L 90,0 ...')"
 */
export function generateClipPath(
  width: number,
  height: number,
  radius: number,
  smoothing: number = 0.6
): string {
  const path = generateSquirclePath(width, height, radius, smoothing);
  return `path('${path}')`;
}
