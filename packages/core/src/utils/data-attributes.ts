/**
 * Data Attribute Parser
 * Utilities for parsing squircle configuration from HTML data attributes
 * FR-031 to FR-034: Data attribute support
 * Feature 006: Border attribute support (US6)
 */

import type { SquircleConfig, BorderConfig } from '../core/types';
import { warn } from './logger';

/** Valid border style values */
const VALID_BORDER_STYLES = ['solid', 'dashed', 'dotted'] as const;
type BorderStyleValue = typeof VALID_BORDER_STYLES[number];

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
 * T046: Parse border width from data-squircle-border-width attribute
 * Feature 006: Border attribute support
 *
 * @param element - HTMLElement to parse
 * @returns Parsed border width value, or undefined if not set or invalid
 */
export function parseBorderWidth(element: HTMLElement): number | undefined {
  const value = element.getAttribute('data-squircle-border-width');

  if (value === null) {
    return undefined;
  }

  const parsed = parseFloat(value);

  if (Number.isNaN(parsed)) {
    if (process.env.NODE_ENV === 'development') {
      warn(`Invalid data-squircle-border-width value: "${value}". Expected a number. Using default.`, {
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
 * T047: Parse border color from data-squircle-border-color attribute
 * Feature 006: Border attribute support
 *
 * @param element - HTMLElement to parse
 * @returns Parsed border color value, or undefined if not set or empty
 */
export function parseBorderColor(element: HTMLElement): string | undefined {
  const value = element.getAttribute('data-squircle-border-color');

  if (value === null) {
    return undefined;
  }

  const trimmed = value.trim();

  if (trimmed === '') {
    return undefined;
  }

  return trimmed;
}

/**
 * T048: Parse border style from data-squircle-border-style attribute
 * Feature 006: Border attribute support
 *
 * @param element - HTMLElement to parse
 * @returns Parsed border style ('solid' | 'dashed' | 'dotted'), or undefined if not set or invalid
 */
export function parseBorderStyle(element: HTMLElement): BorderStyleValue | undefined {
  const value = element.getAttribute('data-squircle-border-style');

  if (value === null) {
    return undefined;
  }

  const trimmed = value.trim().toLowerCase();

  if (trimmed === '') {
    return undefined;
  }

  if (!VALID_BORDER_STYLES.includes(trimmed as BorderStyleValue)) {
    if (process.env.NODE_ENV === 'development') {
      warn(`Invalid data-squircle-border-style value: "${value}". Expected 'solid', 'dashed', or 'dotted'. Using default.`, {
        element: element.tagName,
        id: element.id || undefined,
        className: element.className || undefined,
        value,
      });
    }
    return undefined;
  }

  return trimmed as BorderStyleValue;
}

/**
 * T049: Parse all squircle configuration from element data attributes
 * Combines all data-squircle-* attributes into a Partial<SquircleConfig>
 * Feature 006: Includes border attribute support
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
 *
 * @example Border attributes
 * ```html
 * <div data-squircle data-squircle-border-width="2" data-squircle-border-color="#3b82f6" data-squircle-border-style="dashed">
 * ```
 * ```typescript
 * const config = parseDataAttributes(element);
 * // { border: { width: 2, color: '#3b82f6', style: 'dashed' } }
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

  // T049: Parse border attributes
  const borderWidth = parseBorderWidth(element);
  const borderColor = parseBorderColor(element);
  const borderStyle = parseBorderStyle(element);

  // Build BorderConfig if we have at least a color (width defaults to 1 if not provided)
  // Per spec: color is required unless gradient is provided (gradient not supported via data attributes)
  if (borderColor !== undefined) {
    const border: BorderConfig = {
      width: borderWidth !== undefined ? borderWidth : 1, // Default width to 1
      color: borderColor,
    };

    // Only add style if provided
    if (borderStyle !== undefined) {
      border.style = borderStyle;
    }

    config.border = border;
  } else if (borderWidth !== undefined && borderColor === undefined) {
    // Width without color - don't create border config
    // This matches the behavior where color is required
    // Note: Per spec research.md section 10, gradient borders require JavaScript API
  }

  return config;
}
