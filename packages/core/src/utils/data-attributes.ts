/**
 * Data Attribute Parser
 * Utilities for parsing squircle configuration from HTML data attributes
 * FR-031 to FR-034: Data attribute support
 */

import type { SquircleConfig } from '../core/types';
import { warn } from './logger';

/**
 * Check if element has the data-squircle attribute
 * FR-031: Recognize `data-squircle` attribute
 *
 * @param element - HTMLElement to check
 * @returns true if element has data-squircle attribute
 */
export function hasSquircleAttribute(element: HTMLElement): boolean {
  return element.hasAttribute('data-squircle');
}

/**
 * Parse radius from data-squircle-radius attribute
 * FR-032: Parse `data-squircle-radius` as number
 *
 * @param element - HTMLElement to parse
 * @returns Parsed radius value, or undefined if not set or invalid
 */
export function parseRadius(element: HTMLElement): number | undefined {
  const value = element.getAttribute('data-squircle-radius');

  if (value === null) {
    return undefined;
  }

  const parsed = parseFloat(value);

  // FR-034: Handle invalid values - return undefined, warn in dev mode
  if (Number.isNaN(parsed)) {
    if (process.env.NODE_ENV === 'development') {
      warn(`Invalid data-squircle-radius value: "${value}". Expected a number. Using default.`, {
        element: element.tagName,
        id: element.id || undefined,
        className: element.className || undefined,
        value,
      });
    }
    return undefined;
  }

  return parsed;
}

/**
 * Parse smoothing from data-squircle-smoothing attribute
 * FR-033: Parse `data-squircle-smoothing` as number (0-1)
 *
 * @param element - HTMLElement to parse
 * @returns Parsed smoothing value, or undefined if not set or invalid
 */
export function parseSmoothing(element: HTMLElement): number | undefined {
  const value = element.getAttribute('data-squircle-smoothing');

  if (value === null) {
    return undefined;
  }

  const parsed = parseFloat(value);

  // FR-034: Handle invalid values - return undefined, warn in dev mode
  if (Number.isNaN(parsed)) {
    if (process.env.NODE_ENV === 'development') {
      warn(`Invalid data-squircle-smoothing value: "${value}". Expected a number. Using default.`, {
        element: element.tagName,
        id: element.id || undefined,
        className: element.className || undefined,
        value,
      });
    }
    return undefined;
  }

  return parsed;
}

/**
 * Parse all squircle configuration from element data attributes
 * Combines all data-squircle-* attributes into a Partial<SquircleConfig>
 *
 * @param element - HTMLElement to parse
 * @returns Partial config object with parsed values (undefined fields omitted)
 *
 * @example
 * ```html
 * <div data-squircle data-squircle-radius="24" data-squircle-smoothing="0.9">
 * ```
 * ```typescript
 * const config = parseDataAttributes(element);
 * // { radius: 24, smoothing: 0.9 }
 * ```
 */
export function parseDataAttributes(element: HTMLElement): Partial<SquircleConfig> {
  const config: Partial<SquircleConfig> = {};

  // Parse radius if present
  const radius = parseRadius(element);
  if (radius !== undefined) {
    config.radius = radius;
  }

  // Parse smoothing if present
  const smoothing = parseSmoothing(element);
  if (smoothing !== undefined) {
    config.smoothing = smoothing;
  }

  return config;
}
