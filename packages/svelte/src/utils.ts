/**
 * Utility functions for @cornerkit/svelte
 */

import type { SquircleOptions, SquircleActionOptions } from './types';

/**
 * Check if running in browser environment.
 * Used for SSR safety.
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Normalize action parameters to SquircleOptions.
 * Supports both full object and number shorthand.
 *
 * @param params - Action parameters (object or number)
 * @returns Normalized SquircleOptions object
 *
 * @example
 * ```ts
 * normalizeParams(20); // { radius: 20 }
 * normalizeParams({ radius: 20, smoothing: 0.8 }); // { radius: 20, smoothing: 0.8 }
 * normalizeParams(undefined); // {}
 * ```
 */
export function normalizeParams(
  params: SquircleActionOptions | undefined
): SquircleOptions {
  if (params === undefined || params === null) {
    return {};
  }

  if (typeof params === 'number') {
    return { radius: params };
  }

  return params;
}

/**
 * Build CornerKit config object from SquircleOptions.
 * Transforms border config to the format expected by @cornerkit/core.
 *
 * @param options - Squircle options
 * @returns Configuration object for CornerKit
 */
export function buildConfig(options: SquircleOptions = {}): Record<string, unknown> {
  const config: Record<string, unknown> = {};

  if (options.radius !== undefined) {
    config.radius = options.radius;
  }

  if (options.smoothing !== undefined) {
    config.smoothing = options.smoothing;
  }

  if (options.border) {
    config.borderWidth = options.border.width;
    config.borderColor = options.border.color;
  }

  return config;
}

/**
 * Check if two SquircleOptions objects are equal.
 * Used to avoid unnecessary updates.
 *
 * @param a - First options object
 * @param b - Second options object
 * @returns True if options are equal
 */
export function optionsEqual(
  a: SquircleOptions | undefined,
  b: SquircleOptions | undefined
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;

  if (a.radius !== b.radius) return false;
  if (a.smoothing !== b.smoothing) return false;

  // Compare border
  if (!a.border && !b.border) return true;
  if (!a.border || !b.border) return false;
  if (a.border.width !== b.border.width) return false;
  if (a.border.color !== b.border.color) return false;

  return true;
}
