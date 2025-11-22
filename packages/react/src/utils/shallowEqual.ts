/**
 * Shallow comparison utility for squircle options.
 * @internal
 */

import type { UseSquircleOptions } from '../types';

/**
 * Shallow comparison for options objects.
 * Returns true if all values are equal.
 *
 * @param prev - Previous options
 * @param next - Next options
 * @returns True if options are shallowly equal
 */
export function shallowEqual(
  prev: UseSquircleOptions | undefined,
  next: UseSquircleOptions | undefined
): boolean {
  // Same reference or both undefined/null
  if (prev === next) return true;

  // One is undefined/null, other is not
  if (!prev || !next) return false;

  // Compare primitive values
  if (prev.radius !== next.radius) return false;
  if (prev.smoothing !== next.smoothing) return false;

  // Compare border objects
  const prevBorder = prev.border;
  const nextBorder = next.border;

  // Both undefined or same reference
  if (prevBorder === nextBorder) return true;

  // One is undefined, other is not
  if (!prevBorder || !nextBorder) return false;

  // Compare border properties
  if (prevBorder.width !== nextBorder.width) return false;
  if (prevBorder.color !== nextBorder.color) return false;

  return true;
}
