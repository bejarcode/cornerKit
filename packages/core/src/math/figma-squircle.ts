/**
 * Figma Squircle Implementation
 * Based on Figma's corner smoothing algorithm using arc + cubic bezier curves
 *
 * Reference: figma-squircle npm package
 * Algorithm credit: MartinRGB for reverse-engineering Figma's math
 *
 * Each corner consists of:
 * - A circular arc in the middle
 * - Two cubic Bézier curves on each end (for smooth transitions)
 */

interface CornerPathParams {
  a: number;  // Control point distance 1 (2 * b)
  b: number;  // Control point distance 2
  c: number;  // Transition distance 1
  d: number;  // Transition distance 2
  p: number;  // Total corner path length
  arcSectionLength: number;  // Arc length
  cornerRadius: number;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate path parameters for a corner using Figma's algorithm
 *
 * @param cornerRadius - Corner radius in pixels
 * @param cornerSmoothing - Smoothing factor 0-1 (0.6 = iOS squircle)
 * @returns Path parameters for drawing the corner
 */
export function getPathParamsForCorner(
  cornerRadius: number,
  cornerSmoothing: number
): CornerPathParams {
  // Total corner path length
  const p = (1 + cornerSmoothing) * cornerRadius;

  // Arc angle in degrees (90° when smoothing=0, 0° when smoothing=1)
  const arcMeasure = 90 * (1 - cornerSmoothing);

  // Length of the arc section
  const arcSectionLength =
    Math.sin(toRadians(arcMeasure / 2)) * cornerRadius * Math.sqrt(2);

  // Angle between arc and bezier curve
  const angleAlpha = (90 - arcMeasure) / 2;

  // Distance from P3 to P4 (connection point)
  const p3ToP4Distance = cornerRadius * Math.tan(toRadians(angleAlpha / 2));

  // Angle for bezier control point calculation
  const angleBeta = 45 * cornerSmoothing;

  // Bezier control point distances
  const c = p3ToP4Distance * Math.cos(toRadians(angleBeta));
  const d = c * Math.tan(toRadians(angleBeta));

  // Bezier handle lengths
  // The remaining length after arc and transitions is split into 3 parts (1/3 for b, 2/3 for a)
  const b = (p - arcSectionLength - c - d) / 3;
  const a = 2 * b;

  return {
    a,
    b,
    c,
    d,
    p,
    arcSectionLength,
    cornerRadius,
  };
}

/**
 * Round number to 2 decimal places for SVG path optimization
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Generate SVG path commands for top-right corner
 */
export function drawTopRightCorner(params: CornerPathParams): string {
  const { cornerRadius, a, b, c, d, arcSectionLength } = params;

  if (cornerRadius === 0) {
    return `l ${round(params.p)} 0`;
  }

  // First bezier curve (horizontal to arc transition)
  // Then arc
  // Then second bezier curve (arc to vertical transition)
  return `
    c ${round(a)} 0 ${round(a + b)} 0 ${round(a + b + c)} ${round(d)}
    a ${round(cornerRadius)} ${round(cornerRadius)} 0 0 1 ${round(arcSectionLength)} ${round(arcSectionLength)}
    c ${round(d)} ${round(c)} ${round(d)} ${round(b + c)} ${round(d)} ${round(a + b + c)}
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Generate SVG path commands for bottom-right corner
 */
export function drawBottomRightCorner(params: CornerPathParams): string {
  const { cornerRadius, a, b, c, d, arcSectionLength } = params;

  if (cornerRadius === 0) {
    return `l 0 ${round(params.p)}`;
  }

  return `
    c 0 ${round(a)} 0 ${round(a + b)} ${round(-d)} ${round(a + b + c)}
    a ${round(cornerRadius)} ${round(cornerRadius)} 0 0 1 ${round(-arcSectionLength)} ${round(arcSectionLength)}
    c ${round(-c)} ${round(d)} ${round(-b - c)} ${round(d)} ${round(-a - b - c)} ${round(d)}
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Generate SVG path commands for bottom-left corner
 */
export function drawBottomLeftCorner(params: CornerPathParams): string {
  const { cornerRadius, a, b, c, d, arcSectionLength } = params;

  if (cornerRadius === 0) {
    return `l ${round(-params.p)} 0`;
  }

  return `
    c ${round(-a)} 0 ${round(-a - b)} 0 ${round(-a - b - c)} ${round(-d)}
    a ${round(cornerRadius)} ${round(cornerRadius)} 0 0 1 ${round(-arcSectionLength)} ${round(-arcSectionLength)}
    c ${round(-d)} ${round(-c)} ${round(-d)} ${round(-b - c)} ${round(-d)} ${round(-a - b - c)}
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Generate SVG path commands for top-left corner
 */
export function drawTopLeftCorner(params: CornerPathParams): string {
  const { cornerRadius, a, b, c, d, arcSectionLength } = params;

  if (cornerRadius === 0) {
    return `l 0 ${round(-params.p)}`;
  }

  return `
    c 0 ${round(-a)} 0 ${round(-a - b)} ${round(d)} ${round(-a - b - c)}
    a ${round(cornerRadius)} ${round(cornerRadius)} 0 0 1 ${round(arcSectionLength)} ${round(-arcSectionLength)}
    c ${round(c)} ${round(-d)} ${round(b + c)} ${round(-d)} ${round(a + b + c)} ${round(-d)}
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Generate complete squircle SVG path using Figma's algorithm
 *
 * @param width - Element width in pixels
 * @param height - Element height in pixels
 * @param radius - Corner radius in pixels
 * @param smoothing - Corner smoothing 0-1 (0.6 = iOS squircle, default 0.6)
 * @returns SVG path string
 */
export function generateFigmaSquirclePath(
  width: number,
  height: number,
  radius: number,
  smoothing: number = 0.6
): string {
  // Clamp radius to element dimensions
  const clampedRadius = Math.min(radius, width / 2, height / 2);

  // Clamp smoothing to valid range
  const clampedSmoothing = Math.max(0, Math.min(1, smoothing));

  // Calculate path parameters for all corners (assume uniform corners for now)
  const topLeftParams = getPathParamsForCorner(clampedRadius, clampedSmoothing);
  const topRightParams = getPathParamsForCorner(clampedRadius, clampedSmoothing);
  const bottomRightParams = getPathParamsForCorner(clampedRadius, clampedSmoothing);
  const bottomLeftParams = getPathParamsForCorner(clampedRadius, clampedSmoothing);

  // Build the complete path
  // Start from top-right corner, move counter-clockwise
  const path = `
    M ${round(width - topRightParams.p)} 0
    ${drawTopRightCorner(topRightParams)}
    L ${round(width)} ${round(height - bottomRightParams.p)}
    ${drawBottomRightCorner(bottomRightParams)}
    L ${round(bottomLeftParams.p)} ${round(height)}
    ${drawBottomLeftCorner(bottomLeftParams)}
    L 0 ${round(topLeftParams.p)}
    ${drawTopLeftCorner(topLeftParams)}
    Z
  `.replace(/\s+/g, ' ').trim();

  return path;
}
