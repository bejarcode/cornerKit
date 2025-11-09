/**
 * Superellipse Math Engine
 * Implements the mathematical formulas for generating squircle curves
 * Based on the superellipse formula with parametric equations
 */

export interface SuperellipsePoint {
  x: number;
  y: number;
}

/**
 * FR-014: Convert smoothing parameter (0-1) to superellipse exponent
 * Formula: n = 2 + (4 - 2) × (1 - smoothing)
 *
 * @param smoothing - Value between 0 and 1 (0 = square, 1 = circle)
 * @returns Exponent n (2 = circle, 4 = square)
 *
 * Examples:
 * - smoothing = 0.0 → n = 4.0 (square corners)
 * - smoothing = 0.5 → n = 3.0 (moderate squircle)
 * - smoothing = 0.8 → n = 2.4 (iOS-like, DEFAULT)
 * - smoothing = 1.0 → n = 2.0 (perfect circle)
 */
export function smoothingToExponent(smoothing: number): number {
  // Clamp smoothing to [0, 1] range
  const s = Math.max(0, Math.min(1, smoothing));

  // Map: smoothing=0 → n=4 (square), smoothing=1 → n=2 (circle)
  return 2 + (4 - 2) * (1 - s);
}

/**
 * FR-015: Generate points on superellipse curve for a single corner
 * Uses the parametric superellipse formula:
 *   x = a × sign(cos θ) × |cos θ|^(2/n)
 *   y = b × sign(sin θ) × |sin θ|^(2/n)
 *
 * @param width - Element width in pixels
 * @param height - Element height in pixels
 * @param radius - Corner radius in pixels
 * @param exponent - Superellipse exponent (n)
 * @param corner - Which corner: 0=top-left, 1=top-right, 2=bottom-right, 3=bottom-left
 * @param numPoints - Number of points to generate (default: 8 for smooth bezier approximation)
 * @returns Array of points forming the corner curve
 */
export function generateCornerPoints(
  width: number,
  height: number,
  radius: number,
  exponent: number,
  corner: 0 | 1 | 2 | 3,
  numPoints: number = 8
): SuperellipsePoint[] {
  const points: SuperellipsePoint[] = [];

  // Clamp radius to element dimensions
  const clampedRadius = Math.min(radius, width / 2, height / 2);

  // Corner rotation angles (FR-015)
  // 0° = top-left, 90° = top-right, 180° = bottom-right, 270° = bottom-left
  const rotationAngles = [0, 90, 180, 270];
  const angleOffset = (rotationAngles[corner] * Math.PI) / 180;

  // Generate points along the curve
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1); // Parametric value [0, 1]
    const theta = (Math.PI / 2) * t + angleOffset; // Angle from 0 to 90 degrees (+ rotation)

    // Superellipse formula
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    const x = clampedRadius * Math.sign(cosTheta) * Math.pow(Math.abs(cosTheta), 2 / exponent);
    const y = clampedRadius * Math.sign(sinTheta) * Math.pow(Math.abs(sinTheta), 2 / exponent);

    points.push({ x, y });
  }

  return points;
}

/**
 * Generate all corner points for a complete squircle
 *
 * @param width - Element width in pixels
 * @param height - Element height in pixels
 * @param radius - Corner radius in pixels
 * @param smoothing - Smoothing factor 0-1 (default: 0.8)
 * @returns Object with points for all 4 corners
 */
export function generateSquircleCorners(
  width: number,
  height: number,
  radius: number,
  smoothing: number = 0.8
): {
  topLeft: SuperellipsePoint[];
  topRight: SuperellipsePoint[];
  bottomRight: SuperellipsePoint[];
  bottomLeft: SuperellipsePoint[];
} {
  const exponent = smoothingToExponent(smoothing);

  return {
    topLeft: generateCornerPoints(width, height, radius, exponent, 0),
    topRight: generateCornerPoints(width, height, radius, exponent, 1),
    bottomRight: generateCornerPoints(width, height, radius, exponent, 2),
    bottomLeft: generateCornerPoints(width, height, radius, exponent, 3),
  };
}
