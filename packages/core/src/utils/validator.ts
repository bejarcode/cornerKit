/**
 * Input Validator
 * Validates and sanitizes user inputs for the CornerKit API
 * Ensures security and data integrity (FR-035 to FR-039)
 */

import { warn } from './logger';
import type { SquircleConfig } from '../core/types';

/**
 * FR-035: Validate radius parameter
 * Ensures radius is a non-negative number
 *
 * @param radius - User-provided radius value
 * @param defaultRadius - Default value to use if invalid (default: 20)
 * @returns Valid radius value
 *
 * Behavior:
 * - If radius < 0: Return default (20) and warn in development
 * - If radius is NaN/null/undefined: Return default and warn
 * - Otherwise: Return radius as-is
 */
export function validateRadius(radius: unknown, defaultRadius: number = 20): number {
  // Check if radius is a valid number
  if (typeof radius !== 'number' || isNaN(radius) || !isFinite(radius)) {
    warn(`Invalid radius: ${radius}. Expected non-negative number. Using default: ${defaultRadius}`);
    return defaultRadius;
  }

  // Check if radius is non-negative
  if (radius < 0) {
    warn(`Radius must be >= 0, got ${radius}. Using default: ${defaultRadius}`);
    return defaultRadius;
  }

  return radius;
}

/**
 * FR-036: Validate smoothing parameter
 * Ensures smoothing is in valid range [0, 1]
 *
 * @param smoothing - User-provided smoothing value
 * @param defaultSmoothing - Default value to use if invalid (default: 0.8)
 * @returns Valid smoothing value, clamped to [0, 1]
 *
 * Behavior:
 * - If smoothing < 0: Clamp to 0 and warn in development
 * - If smoothing > 1: Clamp to 1 and warn in development
 * - If smoothing is NaN/null/undefined: Return default and warn
 * - Otherwise: Return smoothing as-is
 */
export function validateSmoothing(smoothing: unknown, defaultSmoothing: number = 0.8): number {
  // Check if smoothing is a valid number
  if (typeof smoothing !== 'number' || isNaN(smoothing) || !isFinite(smoothing)) {
    warn(`Invalid smoothing: ${smoothing}. Expected number in range [0, 1]. Using default: ${defaultSmoothing}`);
    return defaultSmoothing;
  }

  // Clamp to [0, 1] range
  if (smoothing < 0) {
    warn(`Smoothing ${smoothing} is less than 0. Clamping to 0.`);
    return 0;
  }

  if (smoothing > 1) {
    warn(`Smoothing ${smoothing} is greater than 1. Clamping to 1.`);
    return 1;
  }

  return smoothing;
}

/**
 * FR-038: Validate element parameter
 * Ensures element is a valid HTMLElement instance
 *
 * @param element - User-provided element value
 * @returns true if valid HTMLElement, false otherwise
 *
 * Security: Prevents prototype pollution by checking instanceof
 */
export function validateElement(element: unknown): element is HTMLElement {
  // Check if element is an HTMLElement instance
  // Using instanceof is safe and prevents prototype pollution
  if (!(element instanceof HTMLElement)) {
    warn(
      `Invalid element: Expected HTMLElement, got ${typeof element}. Element type: ${
        element?.constructor?.name ?? 'unknown'
      }`
    );
    return false;
  }

  return true;
}

/**
 * FR-039: Validate and query CSS selector
 * Safely queries the DOM for a single element matching the selector
 *
 * @param selector - CSS selector string
 * @returns HTMLElement if found, null otherwise
 * @throws Error if selector syntax is invalid or matches multiple elements
 *
 * Security: Uses try-catch to prevent selector injection attacks
 * Best Practice: Validates that exactly one element matches
 */
export function validateSelector(selector: string): HTMLElement | null {
  // Validate selector is a non-empty string
  if (typeof selector !== 'string' || selector.trim() === '') {
    warn(`Invalid selector: Expected non-empty string, got ${typeof selector}`);
    throw new TypeError('Selector must be a non-empty string');
  }

  try {
    // Query for matching elements
    const element = document.querySelector(selector);

    // Check if element exists
    if (!element) {
      warn(`Selector "${selector}" matched 0 elements`);
      throw new Error(`Selector "${selector}" matched 0 elements`);
    }

    // Validate it's an HTMLElement (not SVGElement, etc.)
    if (!(element instanceof HTMLElement)) {
      warn(`Selector "${selector}" matched non-HTML element: ${element.constructor.name}`);
      throw new TypeError(
        `Selector "${selector}" must match an HTMLElement, got ${element.constructor.name}`
      );
    }

    // Check if selector matches multiple elements (best practice warning)
    const allMatches = document.querySelectorAll(selector);
    if (allMatches.length > 1) {
      warn(
        `Selector "${selector}" matched ${allMatches.length} elements. Only the first will be used. Consider using a more specific selector or apply() with HTMLElement reference.`
      );
    }

    return element;
  } catch (error) {
    // Handle invalid CSS selector syntax
    if (error instanceof DOMException || (error as Error).name === 'SyntaxError') {
      warn(`Invalid CSS selector syntax: "${selector}"`);
      throw new TypeError(`Invalid CSS selector: "${selector}"`);
    }

    // Re-throw other errors (e.g., our custom errors)
    throw error;
  }
}

/**
 * Validate configuration object
 * Used internally to sanitize partial config objects
 *
 * @param config - Partial configuration object
 * @returns Validated and sanitized configuration
 */
export function validateConfig(config: {
  radius?: unknown;
  smoothing?: unknown;
  tier?: unknown;
}): SquircleConfig {
  const validated: SquircleConfig = {
    radius: validateRadius(config.radius),
    smoothing: validateSmoothing(config.smoothing),
  };

  // Validate tier if provided
  if (config.tier !== undefined) {
    const validTiers = ['native', 'houdini', 'clippath', 'fallback'];
    if (typeof config.tier === 'string' && validTiers.includes(config.tier)) {
      validated.tier = config.tier as 'native' | 'houdini' | 'clippath' | 'fallback';
    } else {
      warn(
        `Invalid tier: ${config.tier}. Expected one of: ${validTiers.join(', ')}. Tier will be auto-detected.`
      );
    }
  }

  return validated;
}

/**
 * Check if element has zero or very small dimensions
 * Used to warn developers about invisible or barely visible elements
 *
 * @param element - HTMLElement to check
 * @returns true if element has width or height less than 1px
 *
 * Note: Uses < 1 instead of === 0 to catch fractional pixel elements (e.g., 0.5px)
 * that won't render properly with clip-path
 */
export function hasZeroDimensions(element: HTMLElement): boolean {
  const width = element.offsetWidth;
  const height = element.offsetHeight;

  return width < 1 || height < 1;
}

/**
 * Check if element is detached from the DOM
 * Detached elements may not render correctly
 *
 * @param element - HTMLElement to check
 * @returns true if element is not connected to document
 */
export function isDetached(element: HTMLElement): boolean {
  return !element.isConnected;
}
