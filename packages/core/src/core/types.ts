/**
 * Core Type Definitions
 * Central location for all public and internal types used across cornerKit
 */

import { RendererTier } from './detector';

/**
 * Gradient color stop for gradient borders.
 * Feature 006: SVG-Based Border Rendering
 *
 * @example
 * ```typescript
 * const stops: GradientStop[] = [
 *   { offset: '0%', color: '#3b82f6' },
 *   { offset: '100%', color: '#8b5cf6' }
 * ];
 * ```
 */
export interface GradientStop {
  /**
   * Position in gradient.
   * Accepts percentage strings ('0%', '50%', '100%') or decimal numbers (0, 0.5, 1).
   */
  offset: string | number;

  /**
   * CSS color value at this stop.
   * Accepts any valid CSS color: hex, rgb, rgba, hsl, named colors.
   */
  color: string;
}

/**
 * Border configuration for squircle elements.
 * Feature 006: SVG-Based Border Rendering
 *
 * @example Solid border
 * ```typescript
 * const border: BorderConfig = {
 *   width: 2,
 *   color: '#3b82f6'
 * };
 * ```
 *
 * @example Dashed border
 * ```typescript
 * const border: BorderConfig = {
 *   width: 2,
 *   color: '#3b82f6',
 *   style: 'dashed'
 * };
 * ```
 *
 * @example Gradient border
 * ```typescript
 * const border: BorderConfig = {
 *   width: 3,
 *   gradient: [
 *     { offset: '0%', color: '#3b82f6' },
 *     { offset: '100%', color: '#8b5cf6' }
 *   ]
 * };
 * ```
 */
export interface BorderConfig {
  /**
   * Border width in pixels.
   * Values outside 1-8 range will be clamped.
   * @minimum 1
   * @maximum 8
   */
  width: number;

  /**
   * Border color as CSS color value.
   * Required unless `gradient` is provided.
   */
  color?: string;

  /**
   * Border style.
   * - 'solid': Continuous stroke (default)
   * - 'dashed': 8px dash / 4px gap pattern
   * - 'dotted': Round dots with 6px gap
   *
   * @default 'solid'
   */
  style?: 'solid' | 'dashed' | 'dotted';

  /**
   * Custom SVG dash pattern.
   * Overrides `style` if provided.
   * Format: 'dash gap' or 'dash gap dash gap ...'
   *
   * @example '12 6' - 12px dash, 6px gap
   * @example '4 2 8 2' - alternating pattern
   */
  dashArray?: string;

  /**
   * Gradient stops for gradient borders.
   * When provided, `color` is ignored.
   * Requires at least 2 stops.
   */
  gradient?: GradientStop[];
}

/**
 * Internal options for border SVG creation.
 * Not part of public API.
 */
export interface BorderRenderOptions {
  /** Element width in pixels */
  width: number;
  /** Element height in pixels */
  height: number;
  /** Corner radius */
  radius: number;
  /** Smoothing factor */
  smoothing: number;
  /** Border configuration */
  border: BorderConfig;
  /** Captured element background color (optional) */
  backgroundColor?: string;
}

/**
 * SquircleConfig Interface
 * Configuration object for squircle rendering
 *
 * From data-model.md and contracts/types.ts
 */
export interface SquircleConfig {
  /**
   * Corner radius in pixels
   * @minimum 0
   * @default 20
   */
  radius: number;

  /**
   * Smoothing factor (0 = square corners, 1 = circle)
   * Controls superellipse exponent: n = 2 + (4-2) * (1-smoothing)
   * @minimum 0
   * @maximum 1
   * @default 0.8
   */
  smoothing: number;

  /**
   * Border configuration (Feature 006)
   * Creates SVG-based border following squircle curve
   *
   * Pass `null` to explicitly disable the border:
   * - in `apply()`: overrides an instance-level (constructor) border default
   * - in `update()`: removes an existing border from the element
   * @optional
   */
  border?: BorderConfig | null;

  /**
   * @deprecated Use `border.width` instead
   * Optional: Border width in pixels
   * Creates a squircle-shaped border using ::before pseudo-element
   * @minimum 0
   * @optional
   */
  borderWidth?: number;

  /**
   * @deprecated Use `border.color` instead
   * Optional: Border color (any valid CSS color)
   * Only used when borderWidth is specified
   * @optional
   */
  borderColor?: string;

  /**
   * Optional: Force specific renderer tier
   * Normally auto-detected, but can be overridden for testing
   * @optional
   */
  tier?: RendererTier;
}

/**
 * Partial configuration for user inputs
 * Allows users to provide partial configs that will be merged with defaults
 */
export type PartialSquircleConfig = Partial<SquircleConfig>;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Readonly<Required<Pick<SquircleConfig, 'radius' | 'smoothing'>>> = {
  radius: 20,    // iOS-typical size for buttons
  smoothing: 0.8, // iOS-like appearance (n ≈ 2.4)
} as const;

/**
 * Renderer Tier Enum
 * Re-exported from detector.ts for convenience
 */
export { RendererTier } from './detector';

/**
 * Browser Support Interface
 * Re-exported from detector.ts for convenience
 */
export { BrowserSupport } from './detector';

/**
 * SuperellipsePoint Interface
 * Re-exported from superellipse.ts for convenience
 */
export type { SuperellipsePoint } from '../math/superellipse';

/**
 * RenderOptions Interface
 * Additional options passed to renderers for accessibility and behavior control
 */
export interface RenderOptions {
  /**
   * Whether user prefers reduced motion
   * When true, renderers should disable/minimize transitions
   */
  reducedMotion?: boolean;
}

/**
 * OriginalStyles Interface
 * Stores original element styles for restoration on remove()
 */
export interface OriginalStyles {
  /**
   * Original transition value before cornerKit modification
   */
  transition?: string;
}

/**
 * ManagedElementInfo Interface
 * Information returned by inspect() method about a managed element
 * FR-007: Inspect managed elements
 */
export interface ManagedElementInfo {
  /**
   * Current squircle configuration for this element
   */
  config: SquircleConfig;

  /**
   * Renderer tier being used for this element
   */
  tier: RendererTier;

  /**
   * Current element dimensions (width x height in pixels)
   * Cached from last ResizeObserver update or initial application
   */
  dimensions: {
    width: number;
    height: number;
  };
}
