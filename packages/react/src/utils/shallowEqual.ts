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

  // Both undefined/null or same reference
  if (prevBorder === nextBorder) return true;

  // One is unset (undefined or null), other is not
  // (null vs undefined also lands here: explicit "no border" differs from unset)
  if (!prevBorder || !nextBorder) return false;

  // Compare border properties (core v1.2+ API)
  if (prevBorder.width !== nextBorder.width) return false;
  if (prevBorder.color !== nextBorder.color) return false;
  if (prevBorder.style !== nextBorder.style) return false;
  if (prevBorder.dashArray !== nextBorder.dashArray) return false;

  // Compare gradient stops by value
  const prevGradient = prevBorder.gradient;
  const nextGradient = nextBorder.gradient;
  if (prevGradient !== nextGradient) {
    if (!prevGradient || !nextGradient) return false;
    if (prevGradient.length !== nextGradient.length) return false;
    for (let i = 0; i < prevGradient.length; i++) {
      if (
        prevGradient[i]?.offset !== nextGradient[i]?.offset ||
        prevGradient[i]?.color !== nextGradient[i]?.color
      ) {
        return false;
      }
    }
  }

  return true;
}
