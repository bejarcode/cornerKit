/**
 * @cornerkit/react Type Definitions
 * @packageDocumentation
 */

import type { ComponentPropsWithRef, ReactNode, RefObject } from 'react';

/**
 * Border configuration for squircle elements.
 *
 * @example
 * ```tsx
 * const border: SquircleBorderConfig = {
 *   width: 2,
 *   color: '#3b82f6'
 * };
 * ```
 */
export interface SquircleBorderConfig {
  /**
   * Border width in pixels.
   * Must be >= 0. Negative values will be clamped to 0.
   */
  width: number;

  /**
   * Border color as a valid CSS color string.
   * Accepts hex, rgb, rgba, hsl, hsla, or named colors.
   */
  color: string;
}

/**
 * Options for the useSquircle() hook.
 *
 * @example
 * ```tsx
 * const options: UseSquircleOptions = {
 *   radius: 24,
 *   smoothing: 0.9,
 *   border: { width: 1, color: 'gray' }
 * };
 * ```
 */
export interface UseSquircleOptions {
  /**
   * Corner radius in pixels.
   * @default 20
   *
   * Values are clamped to [0, min(width/2, height/2)] based on element size.
   * Negative values will be clamped to 0 with a development warning.
   */
  radius?: number;

  /**
   * Curve smoothness from 0.0 to 1.0.
   * @default 0.8
   *
   * - 0.0 = circular corners (standard border-radius)
   * - 1.0 = maximum squircle smoothness (iOS-like)
   * - 0.8 = recommended for iOS-like appearance
   *
   * Values outside [0, 1] will be clamped with a development warning.
   */
  smoothing?: number;

  /**
   * Optional border configuration.
   * When provided, both width and color must be specified.
   */
  border?: SquircleBorderConfig;
}

/**
 * Return type from useSquircle() hook.
 * The ref should be attached to the target DOM element.
 *
 * @typeParam T - The HTML element type (default: HTMLDivElement)
 */
export type UseSquircleReturn<T extends HTMLElement = HTMLDivElement> = RefObject<T | null>;

/**
 * Props for the <Squircle> component.
 *
 * Combines UseSquircleOptions with polymorphic component props.
 * When using the `as` prop, all valid HTML attributes for that element
 * type will be accepted (with full TypeScript support).
 *
 * @typeParam T - HTML element type to render (default: 'div')
 *
 * @example
 * ```tsx
 * // As div (default)
 * <Squircle radius={24}>Content</Squircle>
 *
 * // As button with onClick
 * <Squircle as="button" radius={16} onClick={handleClick}>
 *   Click me
 * </Squircle>
 *
 * // As input with input-specific props
 * <Squircle
 *   as="input"
 *   radius={8}
 *   type="text"
 *   placeholder="Enter text..."
 * />
 * ```
 */
export type SquircleProps<T extends keyof JSX.IntrinsicElements = 'div'> =
  UseSquircleOptions & {
    /**
     * HTML element type to render.
     * @default 'div'
     *
     * Accepts any valid HTML element tag name.
     * Props will be typed according to the element type.
     */
    as?: T;

    /**
     * Child content to render inside the squircle element.
     */
    children?: ReactNode;
  } & Omit<ComponentPropsWithRef<T>, 'as' | 'children' | keyof UseSquircleOptions>;
