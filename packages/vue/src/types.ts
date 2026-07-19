/**
 * @cornerkit/vue Type Definitions
 * @packageDocumentation
 */

import type { Ref, Directive } from 'vue';
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
 * Core squircle options shared across component, composable, and directive.
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
 * ```vue
 * <Squircle :radius="20" :smoothing="0.85" tag="button">
 *   Click me
 * </Squircle>
 * ```
 */
export interface SquircleProps extends SquircleOptions {
  /**
   * HTML element type to render.
   * @default 'div'
   *
   * Accepts any valid HTML element tag name.
   */
  tag?: keyof HTMLElementTagNameMap;
}

/**
 * Exposed properties from the <Squircle> component.
 * Access via template ref.
 *
 * @example
 * ```vue
 * <script setup>
 * const squircleRef = ref<SquircleExpose | null>(null);
 * onMounted(() => console.log(squircleRef.value?.el));
 * </script>
 * <template>
 *   <Squircle ref="squircleRef">Content</Squircle>
 * </template>
 * ```
 */
export interface SquircleExpose {
  /**
   * The underlying DOM element.
   */
  el: HTMLElement | null;
}

/**
 * Options for the useSquircle() composable.
 * Can be reactive (refs/computed) for automatic updates.
 *
 * @example
 * ```ts
 * const options: UseSquircleOptions = {
 *   radius: 24,
 *   smoothing: 0.9,
 *   border: { width: 1, color: 'gray' }
 * };
 * ```
 */
export interface UseSquircleOptions extends SquircleOptions {}

/**
 * Return type from useSquircle() composable.
 *
 * @example
 * ```ts
 * const { ref, update, remove } = useSquircle({ radius: 24 });
 * // Attach ref to element, update/remove as needed
 * ```
 */
export interface UseSquircleReturn {
  /**
   * Template ref to attach to the target element.
   */
  ref: Ref<HTMLElement | null>;

  /**
   * Manually update squircle options.
   * @param options - Partial options to update
   */
  update: (options: Partial<SquircleOptions>) => void;

  /**
   * Manually remove the squircle effect.
   */
  remove: () => void;
}

/**
 * Directive value type for v-squircle.
 * Accepts either a full options object or a number shorthand for radius.
 *
 * @example
 * ```vue
 * <!-- Full config -->
 * <div v-squircle="{ radius: 20, smoothing: 0.8 }">
 *
 * <!-- Shorthand (radius only) -->
 * <div v-squircle="24">
 * ```
 */
export type VSquircleValue = SquircleOptions | number;

/**
 * Type definition for the v-squircle directive.
 */
export type VSquircleDirective = Directive<HTMLElement, VSquircleValue>;
