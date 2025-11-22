/**
 * useSquircle Hook
 *
 * React hook for imperatively applying squircle corners to elements.
 * Returns a ref to attach to the target DOM element.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const squircleRef = useSquircle<HTMLDivElement>({
 *     radius: 24,
 *     smoothing: 0.9
 *   });
 *
 *   return <div ref={squircleRef}>Content</div>;
 * }
 * ```
 */

import { useRef, useLayoutEffect, useEffect } from 'react';
import type { UseSquircleOptions, UseSquircleReturn } from './types';
import { isBrowser } from './utils/ssr';
import { shallowEqual } from './utils/shallowEqual';

/**
 * React hook for applying squircle corners to an element.
 *
 * @typeParam T - The HTML element type the ref will be attached to
 * @param options - Configuration options for the squircle
 * @returns A ref object to attach to the target element
 *
 * @example
 * ```tsx
 * // Basic usage
 * const ref = useSquircle({ radius: 24 });
 * return <div ref={ref}>Content</div>;
 *
 * // With border
 * const ref = useSquircle({
 *   radius: 20,
 *   smoothing: 0.9,
 *   border: { width: 2, color: '#3b82f6' }
 * });
 * ```
 */
export function useSquircle<T extends HTMLElement = HTMLDivElement>(
  options?: UseSquircleOptions
): UseSquircleReturn<T> {
  const elementRef = useRef<T | null>(null);
  const instanceRef = useRef<import('@cornerkit/core').default | null>(null);
  const optionsRef = useRef<UseSquircleOptions | undefined>(options);

  // Determine which effect to use - must be consistent between SSR and client
  // Using useLayoutEffect directly and letting React handle the warning in SSR
  // is the recommended approach for visual effects that must run before paint
  const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  // Initialize and update CornerKit
  useIsomorphicLayoutEffect(() => {
    // SSR guard - only run in browser
    if (!isBrowser()) return;

    const element = elementRef.current;
    if (!element) return;

    // Track if effect is still active for cleanup
    let isActive = true;

    // Dynamically import CornerKit to support SSR
    const initCornerKit = async () => {
      try {
        const CornerKit = (await import('@cornerkit/core')).default;

        // Check if effect was cleaned up during async import
        if (!isActive) return;

        // Build config from options
        const config = {
          radius: options?.radius,
          smoothing: options?.smoothing,
          ...(options?.border && {
            borderWidth: options.border.width,
            borderColor: options.border.color,
          }),
        };

        // Create new instance or update existing
        if (!instanceRef.current) {
          instanceRef.current = new CornerKit();
          instanceRef.current.apply(element, config);
        } else if (!shallowEqual(optionsRef.current, options)) {
          instanceRef.current.update(element, config);
        }

        optionsRef.current = options;
      } catch {
        // Silently handle import errors in SSR environments
      }
    };

    initCornerKit();

    // Cleanup function - cancel pending async operation
    return () => {
      isActive = false;
    };
  }, [options?.radius, options?.smoothing, options?.border?.width, options?.border?.color]);

  // Cleanup on unmount
  useIsomorphicLayoutEffect(() => {
    return () => {
      if (instanceRef.current) {
        const element = elementRef.current;
        if (element) {
          instanceRef.current.remove(element);
        }
        instanceRef.current = null;
      }
    };
  }, []);

  return elementRef;
}
