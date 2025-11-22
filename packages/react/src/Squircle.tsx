/**
 * Squircle Component
 *
 * Declarative React component for applying iOS-style squircle corners.
 * Supports polymorphic rendering via the `as` prop with full TypeScript support.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Squircle radius={24}>Content</Squircle>
 *
 * // As a button
 * <Squircle as="button" radius={16} onClick={handleClick}>
 *   Click me
 * </Squircle>
 *
 * // With border
 * <Squircle
 *   radius={20}
 *   smoothing={0.9}
 *   border={{ width: 2, color: '#3b82f6' }}
 * >
 *   Styled content
 * </Squircle>
 * ```
 */

import React, {
  forwardRef,
  useRef,
  useLayoutEffect,
  useEffect,
  createElement,
} from 'react';
import type { SquircleProps, UseSquircleOptions } from './types';
import { isBrowser } from './utils/ssr';
import { shallowEqual } from './utils/shallowEqual';

/**
 * Internal component implementation using forwardRef.
 * Separated to allow proper typing of the polymorphic component.
 */
const SquircleInner = forwardRef<
  HTMLElement,
  SquircleProps<keyof JSX.IntrinsicElements>
>(function Squircle(props, forwardedRef) {
  const {
    as: Component = 'div',
    radius,
    smoothing,
    border,
    children,
    ...restProps
  } = props;

  // Internal ref for CornerKit management
  const internalRef = useRef<HTMLElement | null>(null);
  const instanceRef = useRef<import('@cornerkit/core').default | null>(null);
  const optionsRef = useRef<UseSquircleOptions | undefined>({ radius, smoothing, border });

  // Determine which effect to use at render time (not module load time)
  // This prevents SSR hydration mismatches
  const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  // Initialize and update CornerKit
  useIsomorphicLayoutEffect(() => {
    // SSR guard - only run in browser
    if (!isBrowser()) return;

    const element = internalRef.current;
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
        const currentOptions: UseSquircleOptions = { radius, smoothing, border };
        const config = {
          radius,
          smoothing,
          ...(border && {
            borderWidth: border.width,
            borderColor: border.color,
          }),
        };

        // Create new instance or update existing
        if (!instanceRef.current) {
          instanceRef.current = new CornerKit();
          instanceRef.current.apply(element, config);
        } else if (!shallowEqual(optionsRef.current, currentOptions)) {
          instanceRef.current.update(element, config);
        }

        optionsRef.current = currentOptions;
      } catch {
        // Silently handle import errors in SSR environments
      }
    };

    initCornerKit();

    // Cleanup function - cancel pending async operation
    return () => {
      isActive = false;
    };
  }, [radius, smoothing, border?.width, border?.color]);

  // Cleanup on unmount
  useIsomorphicLayoutEffect(() => {
    return () => {
      if (instanceRef.current) {
        const element = internalRef.current;
        if (element) {
          instanceRef.current.remove(element);
        }
        instanceRef.current = null;
      }
    };
  }, []);

  // Create the element with ref callback that handles both internal and forwarded refs
  return createElement(
    Component,
    {
      ...restProps,
      ref: (node: HTMLElement | null) => {
        internalRef.current = node;
        // Update the forwarded ref
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
    },
    children
  );
});

/**
 * Squircle component with polymorphic `as` prop support.
 *
 * Renders as any HTML element with full TypeScript support for
 * element-specific attributes.
 *
 * @typeParam T - HTML element type to render (default: 'div')
 *
 * @example
 * ```tsx
 * // Default div
 * <Squircle radius={24}>Content</Squircle>
 *
 * // As button with onClick
 * <Squircle as="button" radius={16} onClick={() => {}}>
 *   Click me
 * </Squircle>
 *
 * // As input with type
 * <Squircle as="input" radius={8} type="text" placeholder="Enter..." />
 * ```
 */
export const Squircle = SquircleInner as <
  T extends keyof JSX.IntrinsicElements = 'div'
>(
  props: SquircleProps<T> & { ref?: React.ForwardedRef<HTMLElementTagNameMap[T & keyof HTMLElementTagNameMap] | HTMLElement> }
) => JSX.Element | null;
