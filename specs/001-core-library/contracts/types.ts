/**
 * TypeScript Type Definitions Contract
 * @package @cornerkit/core
 * @version 1.0.0
 * @date 2025-01-08
 *
 * This file serves as the contract for all TypeScript types in the cornerKit core library.
 * These types MUST be implemented exactly as specified in src/core/types.ts
 */

// ============================================================================
// Public API Types (Exported)
// ============================================================================

/**
 * Configuration object for squircle appearance
 * @public
 */
export interface SquircleConfig {
  /**
   * Corner radius in pixels
   * @minimum 0
   * @default 20
   * @example 20, 24, 32, 48
   */
  radius: number;

  /**
   * Smoothing factor controlling the curve shape
   * 0.0 = square corners (exponent n=4)
   * 1.0 = circular corners (exponent n=2)
   * 0.8 = iOS-like appearance (exponent n≈2.4) - RECOMMENDED
   *
   * Maps to superellipse exponent: n = 2 + (4-2) * (1-smoothing)
   *
   * @minimum 0
   * @maximum 1
   * @default 0.8
   * @example 0.6, 0.7, 0.8, 0.9, 1.0
   */
  smoothing: number;

  /**
   * Optional: Force specific renderer tier
   * Normally auto-detected based on browser capabilities
   * Useful for testing or forcing specific rendering method
   *
   * @optional
   * @default undefined (auto-detect)
   */
  tier?: 'native' | 'houdini' | 'clippath' | 'fallback';
}

/**
 * Renderer tier enumeration (4-tier progressive enhancement)
 * @public
 */
export enum RendererTier {
  /**
   * Tier 1: Native CSS corner-shape: squircle
   * Browser Support: Chrome 139+ (when available)
   * Performance: GPU-accelerated, zero JavaScript overhead
   * Detection: CSS.supports('corner-shape', 'squircle')
   */
  NATIVE = 'native',

  /**
   * Tier 2: CSS Houdini Paint API
   * Browser Support: Chrome 65+, Edge 79+
   * Performance: Runs on paint thread (off main thread)
   * Detection: 'paintWorklet' in CSS
   * Note: Deferred to Phase 2
   */
  HOUDINI = 'houdini',

  /**
   * Tier 3: SVG clip-path (PRIMARY IMPLEMENTATION)
   * Browser Support: All modern browsers (Chrome 65+, Firefox, Safari 14+, Edge 79+)
   * Performance: JavaScript path generation, ResizeObserver updates
   * Detection: CSS.supports('clip-path', 'path("")')
   */
  CLIPPATH = 'clippath',

  /**
   * Tier 4: border-radius fallback
   * Browser Support: Universal (IE11+)
   * Performance: Standard CSS, no JavaScript overhead
   * Appearance: Rounded corners (not true squircles)
   */
  FALLBACK = 'fallback'
}

/**
 * Information about a managed element (returned by inspect())
 * @public
 */
export interface ManagedElementInfo {
  /**
   * Current configuration for this element
   * Merged from global defaults + per-element overrides
   */
  config: SquircleConfig;

  /**
   * Renderer tier being used for this element
   */
  tier: RendererTier;

  /**
   * Current element dimensions (cached)
   */
  dimensions: {
    width: number;
    height: number;
  };

  /**
   * Always true (distinguishes from null return)
   */
  isManaged: true;
}

/**
 * Browser capability support object (returned by CornerKit.supports())
 * @public
 */
export interface BrowserSupport {
  /**
   * Native CSS corner-shape: squircle support
   * Chrome 139+ (when available)
   */
  native: boolean;

  /**
   * CSS Houdini Paint API support
   * Chrome 65+, Edge 79+
   */
  houdini: boolean;

  /**
   * SVG clip-path support
   * All modern browsers
   */
  clippath: boolean;

  /**
   * border-radius fallback
   * Always true (universal support)
   */
  fallback: boolean;
}

// ============================================================================
// Main API Class
// ============================================================================

/**
 * cornerKit Core Library
 * Lightweight library for iOS-style squircle corners
 * @public
 */
export class CornerKit {
  /**
   * Create a new CornerKit instance
   * @param config - Optional global configuration (defaults: radius=20, smoothing=0.8)
   * @example
   * const ck = new CornerKit();
   * const ck2 = new CornerKit({ radius: 24, smoothing: 0.9 });
   */
  constructor(config?: Partial<SquircleConfig>);

  /**
   * Apply squircle corners to a single element
   * @param element - HTMLElement or CSS selector (must match exactly 1 element)
   * @param config - Optional per-element configuration overrides
   * @throws {TypeError} If element is not HTMLElement or invalid selector
   * @throws {Error} If selector matches 0 or >1 elements
   * @example
   * ck.apply('#my-button');
   * ck.apply(document.getElementById('my-button'));
   * ck.apply('#my-button', { radius: 32 });
   */
  apply(element: HTMLElement | string, config?: Partial<SquircleConfig>): void;

  /**
   * Apply squircles to all elements matching a CSS selector
   * @param selector - CSS selector (e.g., '.button', '[data-squircle]')
   * @param config - Optional shared configuration for all matched elements
   * @throws {TypeError} If selector is not a string
   * @throws {Error} If selector is invalid CSS syntax
   * @example
   * ck.applyAll('.button');
   * ck.applyAll('.card', { radius: 24, smoothing: 0.85 });
   */
  applyAll(selector: string, config?: Partial<SquircleConfig>): void;

  /**
   * Auto-discover and apply squircles to all elements with data-squircle attributes
   * Uses lazy loading (IntersectionObserver) for off-screen elements
   * Parses data-squircle-radius and data-squircle-smoothing attributes
   * @example
   * ck.auto();
   * // HTML: <div data-squircle data-squircle-radius="32"></div>
   */
  auto(): void;

  /**
   * Update configuration for an already-managed element
   * @param element - HTMLElement or CSS selector
   * @param config - New configuration (merged with existing)
   * @throws {TypeError} If element is not HTMLElement or invalid selector
   * @throws {Error} If element is not currently managed by CornerKit
   * @example
   * ck.apply('#my-button', { radius: 20 });
   * ck.update('#my-button', { radius: 32 }); // Change radius
   */
  update(element: HTMLElement | string, config: Partial<SquircleConfig>): void;

  /**
   * Remove squircle styling and clean up observers
   * @param element - HTMLElement or CSS selector
   * @throws {TypeError} If element is not HTMLElement or invalid selector
   * @throws {Error} If element is not currently managed by CornerKit
   * @example
   * ck.apply('#my-button');
   * ck.remove('#my-button'); // Remove squircle, restore original styles
   */
  remove(element: HTMLElement | string): void;

  /**
   * Get information about a managed element
   * @param element - HTMLElement or CSS selector
   * @returns ManagedElementInfo if element is managed, null otherwise
   * @example
   * const info = ck.inspect('#my-button');
   * if (info) {
   *   console.log('Radius:', info.config.radius);
   *   console.log('Tier:', info.tier);
   * }
   */
  inspect(element: HTMLElement | string): ManagedElementInfo | null;

  /**
   * Remove all squircles, disconnect all observers, and clear registry
   * Used for cleanup (e.g., SPA route changes)
   * Instance can still be used after destroy() (re-initialization)
   * @example
   * ck.applyAll('.button');
   * // Later: Clean up everything
   * ck.destroy();
   */
  destroy(): void;

  /**
   * Check which renderer tiers are supported in the current browser
   * Static method (no instance required)
   * @returns Object with boolean flags for each tier
   * @example
   * const support = CornerKit.supports();
   * console.log('Houdini support:', support.houdini);
   */
  static supports(): BrowserSupport;
}

// ============================================================================
// Internal Types (NOT exported in public API)
// ============================================================================

/**
 * Internal: Managed element entry in WeakMap registry
 * @internal
 */
interface ManagedElement {
  element: HTMLElement;
  config: SquircleConfig;
  tier: RendererTier;
  resizeObserver?: ResizeObserver;
  intersectionObserver?: IntersectionObserver;
  lastDimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Internal: Superellipse point coordinate
 * @internal
 */
interface SuperellipsePoint {
  x: number;
  y: number;
}

/**
 * Internal: Global configuration (extends SquircleConfig)
 * @internal
 */
interface GlobalConfig extends SquircleConfig {
  lazyLoad?: boolean;
  debounceResize?: number;
  debug?: boolean;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard: Check if value is a valid SquircleConfig
 * @internal
 */
export function isValidConfig(config: unknown): config is SquircleConfig {
  if (typeof config !== 'object' || config === null) return false;

  const c = config as any;
  return (
    typeof c.radius === 'number' &&
    c.radius >= 0 &&
    typeof c.smoothing === 'number' &&
    c.smoothing >= 0 &&
    c.smoothing <= 1 &&
    (c.tier === undefined ||
      ['native', 'houdini', 'clippath', 'fallback'].includes(c.tier))
  );
}

/**
 * Type guard: Check if value is an HTMLElement
 * @internal
 */
export function isHTMLElement(element: unknown): element is HTMLElement {
  return element instanceof HTMLElement;
}

/**
 * Type guard: Check if value is a valid CSS selector string
 * @internal
 */
export function isValidSelector(selector: unknown): selector is string {
  if (typeof selector !== 'string') return false;
  try {
    document.querySelector(selector);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Utility: Extract renderer tier from config or detect automatically
 * @internal
 */
export type ResolvedTier = Exclude<RendererTier, undefined>;

/**
 * Utility: Merge global and per-element configs
 * @internal
 */
export type MergedConfig = Required<Omit<SquircleConfig, 'tier'>> & {
  tier?: RendererTier;
};

// ============================================================================
// Validation Schemas (for runtime validation)
// ============================================================================

/**
 * Schema: SquircleConfig validation rules
 * @internal
 */
export const SquircleConfigSchema = {
  radius: {
    type: 'number',
    min: 0,
    default: 20,
    validate: (value: number) => value >= 0
  },
  smoothing: {
    type: 'number',
    min: 0,
    max: 1,
    default: 0.8,
    validate: (value: number) => value >= 0 && value <= 1
  },
  tier: {
    type: 'string',
    optional: true,
    enum: ['native', 'houdini', 'clippath', 'fallback'],
    validate: (value?: string) =>
      value === undefined ||
      ['native', 'houdini', 'clippath', 'fallback'].includes(value)
  }
} as const;

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default configuration values
 * @public
 */
export const DEFAULT_CONFIG: Required<Omit<SquircleConfig, 'tier'>> = {
  radius: 20,
  smoothing: 0.8
} as const;

/**
 * Default global configuration
 * @internal
 */
export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  ...DEFAULT_CONFIG,
  lazyLoad: true,
  debounceResize: undefined, // Uses RAF
  debug: process.env.NODE_ENV === 'development'
} as const;

// ============================================================================
// Type Exports Summary
// ============================================================================

/**
 * Public exports (available to library users):
 * - SquircleConfig
 * - RendererTier
 * - ManagedElementInfo
 * - BrowserSupport
 * - CornerKit (class)
 * - DEFAULT_CONFIG
 * - isValidConfig (utility)
 * - isHTMLElement (utility)
 * - isValidSelector (utility)
 *
 * Internal types (not exported):
 * - ManagedElement
 * - SuperellipsePoint
 * - GlobalConfig
 * - ResolvedTier
 * - MergedConfig
 * - SquircleConfigSchema
 * - DEFAULT_GLOBAL_CONFIG
 */

// ============================================================================
// TypeScript Compiler Options (for reference)
// ============================================================================

/**
 * Required tsconfig.json settings:
 * {
 *   "compilerOptions": {
 *     "strict": true,
 *     "noUnusedLocals": true,
 *     "noUnusedParameters": true,
 *     "noImplicitReturns": true,
 *     "noFallthroughCasesInSwitch": true,
 *     "target": "ES2020",
 *     "module": "ESNext",
 *     "moduleResolution": "node",
 *     "declaration": true,
 *     "declarationMap": true
 *   }
 * }
 */
