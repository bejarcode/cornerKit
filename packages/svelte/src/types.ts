/**
 * @cornerkit/svelte Type Definitions
 * @packageDocumentation
 */

import type { BorderConfig, GradientStop } from '@cornerkit/core';

/**
 * Border configuration for squircle elements.
 * Delegates to @cornerkit/core's BorderConfig (v1.2+ API): supports
 * solid, dashed, and dotted styles, custom dash patterns, and gradients.
 *
 * @example
 * ```ts
 * const border: SquircleBorderConfig = {
 *   width: 2,
 *   color: '#3b82f6',
 *   style: 'dashed'
 * };
 *
 * const gradient: SquircleBorderConfig = {
 *   width: 3,
 *   gradient: [
 *     { offset: '0%', color: '#3b82f6' },
 *     { offset: '100%', color: '#8b5cf6' }
 *   ]
 * };
 * ```
 */
export type SquircleBorderConfig = BorderConfig;

// Re-export the core border types for convenience
export type { BorderConfig, GradientStop };

/**
 * Core squircle options shared across component and action.
 *
 * @example
 * ```ts
 * const options: SquircleOptions = {
 *   radius: 24,
 *   smoothing: 0.9,
 *   border: { width: 1, color: 'gray' }
 * };
 * ```
 */
export interface SquircleOptions {
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
   * Optional border configuration (core v1.2+ API): solid, dashed, dotted,
   * custom dash patterns, and gradients. Pass `null` to explicitly disable
   * a border (e.g. to override an instance-level default, or to remove an
   * existing border on update).
   *
   * Hover styling needs no props: set the CSS custom properties
   * `--ck-border-color` / `--ck-background` in a `:hover` rule (core v1.3+).
   */
  border?: SquircleBorderConfig | null;
}

/**
 * Props for the <Squircle> component.
 *
 * @example
 * ```svelte
 * <Squircle radius={20} smoothing={0.85}>
 *   <button>Click me</button>
 * </Squircle>
 * ```
 */
export interface SquircleProps extends SquircleOptions {
  /**
   * Additional class names to apply to the wrapper element.
   */
  class?: string;
}

/**
 * Options for the squircle action.
 * Accepts either a full options object or a number shorthand for radius.
 *
 * @example
 * ```svelte
 * <!-- Full config -->
 * <div use:squircle={{ radius: 20, smoothing: 0.8 }}>
 *
 * <!-- Shorthand (radius only) -->
 * <div use:squircle={24}>
 * ```
 */
export type SquircleActionOptions = SquircleOptions | number;

/**
 * Return type from the squircle action.
 * Conforms to Svelte's action contract.
 */
export interface SquircleActionReturn {
  /**
   * Called when action parameters change.
   * @param params - New parameters
   */
  update(params: SquircleActionOptions): void;

  /**
   * Called when element is removed from DOM.
   * Cleans up CornerKit instance.
   */
  destroy(): void;
}

/**
 * Type signature for the squircle action function.
 */
export type SquircleAction = (
  node: HTMLElement,
  params?: SquircleActionOptions
) => SquircleActionReturn;
