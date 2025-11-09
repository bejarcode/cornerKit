/**
 * SVG Path Generator
 * Generates optimized SVG path strings for squircle clip-paths
 * Uses bezier-based approximation for smaller bundle size (Decision 1 from research.md)
 */

import { generateSquircleCorners, type SuperellipsePoint } from './superellipse';

/**
 * FR-016, FR-017: Generate SVG path string for a squircle shape
 * Uses bezier-based approximation for optimal bundle size (~43% smaller than point-based)
 *
 * @param width - Element width in pixels
 * @param height - Element height in pixels
 * @param radius - Corner radius in pixels (will be clamped to min(width/2, height/2))
 * @param smoothing - Smoothing factor 0-1 (default: 0.8)
 * @returns SVG path string ready for clip-path CSS property
 *
 * Example output: "M 10,0 L 90,0 C 95,0 100,5 100,10 L 100,90 C 100,95 95,100 90,100 L 10,100 C 5,100 0,95 0,90 L 0,10 C 0,5 5,0 10,0 Z"
 */
export function generateSquirclePath(
  width: number,
  height: number,
  radius: number,
  smoothing: number = 0.8
): string {
  // FR-017: Radius clamping happens inside generateSquircleCorners
  // This prevents overflow and ensures visual correctness
  const clampedRadius = Math.min(radius, width / 2, height / 2);

  // Handle edge cases: zero dimensions or radius
  if (width <= 0 || height <= 0 || clampedRadius <= 0) {
    // Return a simple rectangle path for degenerate cases
    return `M 0,0 L ${round(width)},0 L ${round(width)},${round(height)} L 0,${round(height)} Z`;
  }

  // Generate corner points using superellipse formula
  const corners = generateSquircleCorners(width, height, clampedRadius, smoothing);

  // Build optimized SVG path using cubic bezier curves
  // Each corner is approximated with 2-3 bezier segments for smooth curves
  const path = buildBezierPath(
    width,
    height,
    clampedRadius,
    corners.topLeft,
    corners.topRight,
    corners.bottomRight,
    corners.bottomLeft
  );

  return path;
}

/**
 * Build optimized bezier-based SVG path from corner points
 * FR-016: Uses cubic bezier curves (C command) instead of line segments (L command)
 * This produces smaller path strings (~60% fewer coordinates) with smoother curves
 *
 * @param width - Element width in pixels
 * @param height - Element height in pixels
 * @param radius - Corner radius in pixels (already clamped)
 * @param topLeft - Points for top-left corner
 * @param topRight - Points for top-right corner
 * @param bottomRight - Points for bottom-right corner
 * @param bottomLeft - Points for bottom-left corner
 * @returns Optimized SVG path string
 */
function buildBezierPath(
  width: number,
  height: number,
  radius: number,
  topLeft: SuperellipsePoint[],
  topRight: SuperellipsePoint[],
  bottomRight: SuperellipsePoint[],
  bottomLeft: SuperellipsePoint[]
): string {
  const hw = width / 2;
  const hh = height / 2;

  // Helper to convert corner-relative coordinates to absolute SVG coordinates
  const toAbsolute = (point: SuperellipsePoint, cornerX: number, cornerY: number) => ({
    x: cornerX + point.x,
    y: cornerY + point.y,
  });

  // Corner centers in absolute coordinates
  const corners = {
    topLeft: { x: radius, y: radius },
    topRight: { x: width - radius, y: radius },
    bottomRight: { x: width - radius, y: height - radius },
    bottomLeft: { x: radius, y: height - radius },
  };

  // Convert corner points to absolute coordinates
  const tlPoints = topLeft.map((p) => toAbsolute(p, corners.topLeft.x, corners.topLeft.y));
  const trPoints = topRight.map((p) => toAbsolute(p, corners.topRight.x, corners.topRight.y));
  const brPoints = bottomRight.map((p) => toAbsolute(p, corners.bottomRight.x, corners.bottomRight.y));
  const blPoints = bottomLeft.map((p) => toAbsolute(p, corners.bottomLeft.x, corners.bottomLeft.y));

  // Build path using bezier approximation
  // Strategy: Use cubic bezier curves to approximate the superellipse
  // Each corner uses 2 bezier curves for smooth approximation

  const parts: string[] = [];

  // Start at the end of top-left corner (right edge)
  const startPoint = tlPoints[tlPoints.length - 1];
  parts.push(`M ${round(startPoint.x)},${round(startPoint.y)}`);

  // Top edge: Line to start of top-right corner
  const topRightStart = trPoints[0];
  parts.push(`L ${round(topRightStart.x)},${round(topRightStart.y)}`);

  // Top-right corner: Bezier curve
  parts.push(createCornerBezier(trPoints));

  // Right edge: Line to start of bottom-right corner
  const bottomRightStart = brPoints[0];
  parts.push(`L ${round(bottomRightStart.x)},${round(bottomRightStart.y)}`);

  // Bottom-right corner: Bezier curve
  parts.push(createCornerBezier(brPoints));

  // Bottom edge: Line to start of bottom-left corner
  const bottomLeftStart = blPoints[0];
  parts.push(`L ${round(bottomLeftStart.x)},${round(bottomLeftStart.y)}`);

  // Bottom-left corner: Bezier curve
  parts.push(createCornerBezier(blPoints));

  // Left edge: Line to start of top-left corner
  const topLeftStart = tlPoints[0];
  parts.push(`L ${round(topLeftStart.x)},${round(topLeftStart.y)}`);

  // Top-left corner: Bezier curve (completes the shape)
  parts.push(createCornerBezier(tlPoints));

  // Close path
  parts.push('Z');

  return parts.join(' ');
}

/**
 * Create cubic bezier approximation for a corner curve
 * Uses tangent-based control point calculation for mathematically accurate curves
 *
 * Based on cubic bezier approximation theory: control points should lie along
 * the tangent lines at the curve endpoints, positioned at ~1/3 of the chord length
 *
 * @param points - Corner points from superellipse formula (typically 8 points)
 * @returns SVG bezier command string
 */
function createCornerBezier(points: Array<{ x: number; y: number }>): string {
  if (points.length < 4) {
    // Fallback: Not enough points, use line segments
    return points.map((p) => `L ${round(p.x)},${round(p.y)}`).join(' ');
  }

  const segments: string[] = [];

  // Split into 2 bezier segments for smooth approximation
  const mid = Math.floor(points.length / 2);

  // First bezier segment: approximates first half of the curve
  const seg1 = createCubicBezierSegment(
    points.slice(0, mid + 1) // Include mid point
  );
  segments.push(seg1);

  // Second bezier segment: approximates second half of the curve
  const seg2 = createCubicBezierSegment(
    points.slice(mid) // Start from mid point
  );
  segments.push(seg2);

  return segments.join(' ');
}

/**
 * Create a single cubic bezier segment from a series of points
 * Calculates control points using tangent direction and chord length
 *
 * @param points - Points to approximate (should have at least 2 points)
 * @returns SVG cubic bezier command
 */
function createCubicBezierSegment(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) {
    return '';
  }

  const p0 = points[0]; // Start point
  const p3 = points[points.length - 1]; // End point

  // Calculate tangent at start point (direction from p0 to next point)
  const tangent1 = calculateTangent(points, 0);

  // Calculate tangent at end point (direction from previous point to p3)
  const tangent2 = calculateTangent(points, points.length - 1);

  // Calculate chord length (distance from start to end)
  const chordLength = Math.sqrt((p3.x - p0.x) ** 2 + (p3.y - p0.y) ** 2);

  // Position control points at ~1/3 of chord length along tangents
  // This ratio (0.33) provides good approximation for smooth curves
  // Can be adjusted: larger = more curved, smaller = flatter
  const controlPointDistance = chordLength * 0.33;

  // First control point: p0 + tangent1 * distance
  const cp1 = {
    x: p0.x + tangent1.x * controlPointDistance,
    y: p0.y + tangent1.y * controlPointDistance,
  };

  // Second control point: p3 - tangent2 * distance
  // (subtract because tangent2 points forward from p3's perspective)
  const cp2 = {
    x: p3.x - tangent2.x * controlPointDistance,
    y: p3.y - tangent2.y * controlPointDistance,
  };

  return `C ${round(cp1.x)},${round(cp1.y)} ${round(cp2.x)},${round(cp2.y)} ${round(p3.x)},${round(p3.y)}`;
}

/**
 * Calculate normalized tangent direction at a point
 * Uses central differences for interior points, forward/backward for endpoints
 *
 * @param points - Array of points
 * @param index - Index of point to calculate tangent at
 * @returns Normalized tangent vector
 */
function calculateTangent(
  points: Array<{ x: number; y: number }>,
  index: number
): { x: number; y: number } {
  let dx: number;
  let dy: number;

  if (index === 0) {
    // Start point: use forward difference
    dx = points[1].x - points[0].x;
    dy = points[1].y - points[0].y;
  } else if (index === points.length - 1) {
    // End point: use backward difference
    dx = points[index].x - points[index - 1].x;
    dy = points[index].y - points[index - 1].y;
  } else {
    // Interior point: use central difference for better accuracy
    dx = points[index + 1].x - points[index - 1].x;
    dy = points[index + 1].y - points[index - 1].y;
  }

  // Normalize the tangent vector
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: dx / length,
    y: dy / length,
  };
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
 * @param smoothing - Smoothing factor 0-1
 * @returns CSS clip-path value
 *
 * Example: "path('M 10,0 L 90,0 ...')"
 */
export function generateClipPath(
  width: number,
  height: number,
  radius: number,
  smoothing: number = 0.8
): string {
  const path = generateSquirclePath(width, height, radius, smoothing);
  return `path('${path}')`;
}
