/**
 * Core Type Definitions
 * Central location for all public and internal types used across cornerKit
 */

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
   * Optional: Force specific renderer tier
   * Normally auto-detected, but can be overridden for testing
   * @optional
   */
  tier?: 'native' | 'houdini' | 'clippath' | 'fallback';
}

/**
 * Partial configuration for user inputs
 * Allows users to provide partial configs that will be merged with defaults
 */
export type PartialSquircleConfig = Partial<SquircleConfig>;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Readonly<Required<Omit<SquircleConfig, 'tier'>>> = {
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
  tier: 'native' | 'houdini' | 'clippath' | 'fallback';

  /**
   * Current element dimensions (width x height in pixels)
   * Cached from last ResizeObserver update or initial application
   */
  dimensions: {
    width: number;
    height: number;
  };
}
