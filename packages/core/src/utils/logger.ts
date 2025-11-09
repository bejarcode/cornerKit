/**
 * Development Logger
 * Provides helpful warnings during development that are stripped in production
 * Uses process.env.NODE_ENV checks for dead code elimination (Decision 5 from research.md)
 */

/**
 * Log levels for cornerKit
 */
export enum LogLevel {
  WARN = 'warn',
  ERROR = 'error',
  INFO = 'info',
}

/**
 * FR-034: Development warning logger
 * Warnings are only logged in development mode and completely stripped in production
 *
 * @param message - Warning message to log
 * @param context - Optional context object for additional details
 *
 * Security: All warning strings are eliminated in production builds via Rollup
 * Performance: Zero runtime cost in production (dead code elimination)
 */
export function warn(message: string, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    const prefix = '[cornerKit]';
    if (context) {
      console.warn(`${prefix} ${message}`, context);
    } else {
      console.warn(`${prefix} ${message}`);
    }
  }
}

/**
 * Error logger (always logged, even in production)
 * Use for critical errors that developers must know about
 *
 * @param message - Error message to log
 * @param context - Optional context object for additional details
 */
export function error(message: string, context?: Record<string, unknown>): void {
  const prefix = '[cornerKit]';
  if (context) {
    console.error(`${prefix} ${message}`, context);
  } else {
    console.error(`${prefix} ${message}`);
  }
}

/**
 * Info logger (development only)
 * Use for helpful development information
 *
 * @param message - Info message to log
 * @param context - Optional context object for additional details
 */
export function info(message: string, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    const prefix = '[cornerKit]';
    if (context) {
      console.info(`${prefix} ${message}`, context);
    } else {
      console.info(`${prefix} ${message}`);
    }
  }
}

// ============================================================================
// Specific Warning Functions
// ============================================================================

/**
 * FR-035: Warn about invalid radius
 */
export function warnInvalidRadius(radius: unknown, defaultValue: number): void {
  warn(
    `Invalid radius: ${radius}. Expected non-negative number. Using default: ${defaultValue}`
  );
}

/**
 * FR-036: Warn about invalid smoothing
 */
export function warnInvalidSmoothing(smoothing: unknown, defaultValue: number): void {
  warn(
    `Invalid smoothing: ${smoothing}. Expected number in range [0, 1]. Using default: ${defaultValue}`
  );
}

/**
 * FR-034: Warn about invalid data attributes
 */
export function warnInvalidDataAttribute(
  element: HTMLElement,
  attribute: string,
  value: unknown
): void {
  warn(`Invalid data attribute value on element: ${attribute}="${value}"`, {
    element: element.tagName,
    id: element.id || undefined,
    className: element.className || undefined,
  });
}

/**
 * T054: Warn about zero or very small dimension elements
 * These won't be visible but may indicate developer error
 */
export function warnZeroDimensions(element: HTMLElement): void {
  warn('Element has zero or very small dimensions (width or height < 1px). Squircle will not be visible.', {
    element: element.tagName,
    id: element.id || undefined,
    className: element.className || undefined,
    width: element.offsetWidth,
    height: element.offsetHeight,
  });
}

/**
 * T054: Warn about detached elements
 * Elements not in the DOM may not render correctly
 */
export function warnDetachedElement(element: HTMLElement): void {
  warn('Element is not attached to the DOM. It may not render correctly.', {
    element: element.tagName,
    id: element.id || undefined,
    className: element.className || undefined,
    isConnected: element.isConnected,
  });
}

/**
 * T054: Warn about duplicate apply() calls
 * Calling apply() on the same element multiple times will update the configuration
 */
export function warnDuplicateApply(element: HTMLElement): void {
  warn('Element already has squircle applied. Configuration will be updated.', {
    element: element.tagName,
    id: element.id || undefined,
    className: element.className || undefined,
  });
}

/**
 * Warn about selector matching multiple elements
 */
export function warnMultipleMatches(selector: string, count: number): void {
  warn(
    `Selector "${selector}" matched ${count} elements. Only the first will be used. Consider using a more specific selector or apply() with HTMLElement reference.`
  );
}

/**
 * Warn about selector matching zero elements
 */
export function warnNoMatches(selector: string): void {
  warn(`Selector "${selector}" matched 0 elements.`);
}

/**
 * Warn about invalid CSS selector syntax
 */
export function warnInvalidSelector(selector: string): void {
  warn(`Invalid CSS selector syntax: "${selector}"`);
}

/**
 * Warn about non-HTML element (SVG, MathML, etc.)
 */
export function warnNonHTMLElement(selector: string, elementType: string): void {
  warn(
    `Selector "${selector}" matched non-HTML element: ${elementType}. cornerKit only supports HTMLElement.`
  );
}

/**
 * Warn about invalid element type
 */
export function warnInvalidElement(element: unknown): void {
  const type = element === null ? 'null' : typeof element;
  const constructor = (element as any)?.constructor?.name ?? 'unknown';
  warn(`Invalid element: Expected HTMLElement, got ${type}. Element type: ${constructor}`);
}

/**
 * Warn about performance (too many elements)
 */
export function warnPerformance(elementCount: number, threshold: number): void {
  warn(
    `Applying squircles to ${elementCount} elements (threshold: ${threshold}). Consider using IntersectionObserver for better performance with auto().`
  );
}

/**
 * Warn about unsupported browser features
 */
export function warnUnsupportedFeature(feature: string, fallback: string): void {
  warn(`Browser does not support ${feature}. Using fallback: ${fallback}`);
}

// ============================================================================
// Warning Suppression
// ============================================================================

/**
 * T060: Track warnings to prevent duplicate messages
 * Prevents console spam from repeated warnings
 */
const warnedMessages = new Set<string>();

/**
 * Warn once (suppress duplicate warnings)
 * Useful for warnings that might fire repeatedly in loops
 *
 * @param message - Warning message
 * @param key - Unique key for this warning (defaults to message)
 */
export function warnOnce(message: string, key?: string): void {
  if (process.env.NODE_ENV === 'development') {
    const warningKey = key || message;
    if (!warnedMessages.has(warningKey)) {
      warn(message);
      warnedMessages.add(warningKey);
    }
  }
}

/**
 * Clear warning suppression cache
 * Useful for tests or when you want to see warnings again
 */
export function clearWarningCache(): void {
  if (process.env.NODE_ENV === 'development') {
    warnedMessages.clear();
  }
}

/**
 * Check if warning has been logged before
 */
export function hasWarned(key: string): boolean {
  if (process.env.NODE_ENV === 'development') {
    return warnedMessages.has(key);
  }
  return false;
}
