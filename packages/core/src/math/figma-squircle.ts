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
 * @param roundingAndSmoothingBudget - Maximum space available for the corner path
 * @param preserveSmoothing - If true, maintain smoothing aesthetic by adjusting bezier handles instead of reducing smoothing
 * @returns Path parameters for drawing the corner
 */
export function getPathParamsForCorner(
  cornerRadius: number,
  cornerSmoothing: number,
  roundingAndSmoothingBudget: number = Infinity,
  preserveSmoothing: boolean = true
): CornerPathParams {
  // Total corner path length
  let p = (1 + cornerSmoothing) * cornerRadius;

  // When there's not enough space (p > budget), we have two options:
  // 1. preserveSmoothing = false (Figma's default): reduce smoothing to fit budget
  //    This changes the arcMeasure angle, making corners look like circular arcs
  // 2. preserveSmoothing = true: keep original smoothing, adjust bezier handles
  //    This maintains the squircle aesthetic even when space is limited
  if (!preserveSmoothing && p > roundingAndSmoothingBudget) {
    const maxCornerSmoothing = roundingAndSmoothingBudget / cornerRadius - 1;
    cornerSmoothing = Math.max(0, Math.min(cornerSmoothing, maxCornerSmoothing));
    p = Math.min(p, roundingAndSmoothingBudget);
  }

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
  let b = (p - arcSectionLength - c - d) / 3;
  let a = 2 * b;

  // Adjust bezier handles if preserveSmoothing is enabled and we exceed the budget
  // This maintains the squircle S-curve characteristic while fitting within space constraints
  if (preserveSmoothing && p > roundingAndSmoothingBudget) {
    // Calculate how much we need to scale down
    const scaleFactor = roundingAndSmoothingBudget / p;

    // Proportionally scale all components to maintain smooth curve character
    // This keeps the relative proportions between a, b, c, d the same
    // This approach maintains the smooth S-curve without kinks
    const scaledA = a * scaleFactor;
    const scaledB = b * scaleFactor;
    const scaledC = c * scaleFactor;
    const scaledD = d * scaleFactor;
    const scaledArcLength = arcSectionLength * scaleFactor;

    // Use proportional scaling - this maintains smooth curves
    // by keeping the same relative proportions between all parameters
    return {
      a: scaledA,
      b: scaledB,
      c: scaledC,
      d: scaledD,
      p: roundingAndSmoothingBudget,
      arcSectionLength: scaledArcLength,
      cornerRadius,
    };
  }

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
  // Then arc (skip if degenerate to avoid rendering artifacts)
  // Then second bezier curve (arc to vertical transition)
  const arcCommand = arcSectionLength > 0.01
    ? `a ${round(cornerRadius)} ${round(cornerRadius)} 0 0 1 ${round(arcSectionLength)} ${round(arcSectionLength)}`
    : '';

  return `
    c ${round(a)} 0 ${round(a + b)} 0 ${round(a + b + c)} ${round(d)}
    ${arcCommand}
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

  const arcCommand = arcSectionLength > 0.01
    ? `a ${round(cornerRadius)} ${round(cornerRadius)} 0 0 1 ${round(-arcSectionLength)} ${round(arcSectionLength)}`
    : '';

  return `
    c 0 ${round(a)} 0 ${round(a + b)} ${round(-d)} ${round(a + b + c)}
    ${arcCommand}
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

  const arcCommand = arcSectionLength > 0.01
    ? `a ${round(cornerRadius)} ${round(cornerRadius)} 0 0 1 ${round(-arcSectionLength)} ${round(-arcSectionLength)}`
    : '';

  return `
    c ${round(-a)} 0 ${round(-a - b)} 0 ${round(-a - b - c)} ${round(-d)}
    ${arcCommand}
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

  const arcCommand = arcSectionLength > 0.01
    ? `a ${round(cornerRadius)} ${round(cornerRadius)} 0 0 1 ${round(arcSectionLength)} ${round(-arcSectionLength)}`
    : '';

  return `
    c 0 ${round(-a)} 0 ${round(-a - b)} ${round(d)} ${round(-a - b - c)}
    ${arcCommand}
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

  // Calculate the budget for rounding and smoothing
  // Each corner's path extends along the edge, so budget is half the edge length
  const horizontalBudget = width / 2;
  const verticalBudget = height / 2;

  // Calculate path parameters for all corners with budget constraints
  // Top-left and top-right share the top edge, so they compete for width/2
  // Left and right edges have height/2 budget
  const topLeftParams = getPathParamsForCorner(clampedRadius, clampedSmoothing, Math.min(horizontalBudget, verticalBudget));
  const topRightParams = getPathParamsForCorner(clampedRadius, clampedSmoothing, Math.min(horizontalBudget, verticalBudget));
  const bottomRightParams = getPathParamsForCorner(clampedRadius, clampedSmoothing, Math.min(horizontalBudget, verticalBudget));
  const bottomLeftParams = getPathParamsForCorner(clampedRadius, clampedSmoothing, Math.min(horizontalBudget, verticalBudget));

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

/**
 * Generate squircle path with inset offset
 * Feature 006: Used for dotted borders to avoid clip-path anti-aliasing artifacts
 *
 * The inset path is generated by shrinking all coordinates inward by the inset amount,
 * creating a path that sits inside the original squircle boundary.
 *
 * @param width - Element width in pixels
 * @param height - Element height in pixels
 * @param radius - Corner radius in pixels
 * @param smoothing - Smoothing factor 0-1 (0.6 = iOS squircle)
 * @param inset - Inset amount in pixels (shifts path inward)
 * @returns SVG path string for inset squircle
 */
export function generateFigmaSquirclePathWithInset(
  width: number,
  height: number,
  radius: number,
  smoothing: number,
  inset: number
): string {
  // Adjust dimensions for inset
  const w = width - inset * 2;
  const h = height - inset * 2;

  // Handle degenerate case where inset is too large
  if (w <= 0 || h <= 0) {
    return `M ${round(inset)},${round(inset)} Z`;
  }

  // Clamp radius to adjusted dimensions
  const r = Math.min(radius, w / 2, h / 2);

  // Clamp smoothing to valid range
  const s = Math.max(0, Math.min(1, smoothing));

  // Calculate path parameters using same algorithm as main function
  const p = (1 + s) * r;
  const arcMeasure = 90 * (1 - s);
  const arcLength = Math.sin(toRadians(arcMeasure / 2)) * r * Math.sqrt(2);
  const angleAlpha = (90 - arcMeasure) / 2;
  const p3ToP4 = r * Math.tan(toRadians(angleAlpha / 2));
  const angleBeta = 45 * s;
  const c = p3ToP4 * Math.cos(toRadians(angleBeta));
  const d = c * Math.tan(toRadians(angleBeta));
  const b = (p - arcLength - c - d) / 3;
  const a = 2 * b;

  const i = inset; // shorthand for offset

  // Generate path with inset offset applied to all absolute coordinates
  // The path is translated by (inset, inset) to position it correctly
  const path = `
    M ${round(w - p + i)} ${round(i)}
    c ${round(a)} 0 ${round(a + b)} 0 ${round(a + b + c)} ${round(d)}
    a ${round(r)} ${round(r)} 0 0 1 ${round(arcLength)} ${round(arcLength)}
    c ${round(d)} ${round(c)} ${round(d)} ${round(b + c)} ${round(d)} ${round(a + b + c)}
    L ${round(w + i)} ${round(h - p + i)}
    c 0 ${round(a)} 0 ${round(a + b)} ${round(-d)} ${round(a + b + c)}
    a ${round(r)} ${round(r)} 0 0 1 ${round(-arcLength)} ${round(arcLength)}
    c ${round(-c)} ${round(d)} ${round(-b - c)} ${round(d)} ${round(-a - b - c)} ${round(d)}
    L ${round(p + i)} ${round(h + i)}
    c ${round(-a)} 0 ${round(-a - b)} 0 ${round(-a - b - c)} ${round(-d)}
    a ${round(r)} ${round(r)} 0 0 1 ${round(-arcLength)} ${round(-arcLength)}
    c ${round(-d)} ${round(-c)} ${round(-d)} ${round(-b - c)} ${round(-d)} ${round(-a - b - c)}
    L ${round(i)} ${round(p + i)}
    c 0 ${round(-a)} 0 ${round(-a - b)} ${round(d)} ${round(-a - b - c)}
    a ${round(r)} ${round(r)} 0 0 1 ${round(arcLength)} ${round(-arcLength)}
    c ${round(c)} ${round(-d)} ${round(b + c)} ${round(-d)} ${round(a + b + c)} ${round(-d)}
    Z
  `.replace(/\s+/g, ' ').trim();

  return path;
}
