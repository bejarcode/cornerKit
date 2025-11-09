/**
 * CornerKit Core Library
 * Main entry point for applying iOS-style squircle corners to HTML elements
 *
 * @packageDocumentation
 */

import { CapabilityDetector, RendererTier } from './core/detector';
import { ElementRegistry, type ManagedElement } from './core/registry';
import { DEFAULT_CONFIG, type SquircleConfig, type ManagedElementInfo } from './core/types';
import { ClipPathRenderer } from './renderers/clippath';
import { FallbackRenderer } from './renderers/fallback';
import { validateRadius, validateSmoothing, validateElement } from './utils/validator';
import { warn } from './utils/logger';
import { hasSquircleAttribute, parseDataAttributes } from './utils/data-attributes';
import { prefersReducedMotion, watchReducedMotionPreference } from './utils/accessibility';

/**
 * CornerKit Main API Class
 * FR-001, FR-002: Apply squircles to HTML elements with progressive enhancement
 *
 * Example:
 * ```typescript
 * const ck = new CornerKit({ radius: 24, smoothing: 0.9 });
 * ck.apply('#my-button');
 * ```
 */
export default class CornerKit {
  /**
   * Global default configuration for this instance
   * FR-028, FR-029: Defaults to { radius: 20, smoothing: 0.8 }
   */
  private globalConfig: SquircleConfig;

  /**
   * Capability detector singleton
   * Determines which rendering tier to use
   */
  private detector: CapabilityDetector;

  /**
   * Element registry (WeakMap-based)
   * Tracks all managed elements and their observers
   */
  private registry: ElementRegistry;

  /**
   * Renderer instances
   * Lazy-initialized on first use
   */
  private clipPathRenderer?: ClipPathRenderer;
  private fallbackRenderer?: FallbackRenderer;

  /**
   * IntersectionObserver instance for auto() lazy loading
   * Stored to enable cleanup and prevent memory leaks
   */
  private autoObserver?: IntersectionObserver;

  /**
   * Cached reduced motion preference
   * Checked once on init, then updated via watcher (not per-element)
   * Prevents performance degradation from repeated matchMedia calls
   */
  private reducedMotionEnabled: boolean;

  /**
   * Cleanup function for reduced motion preference watcher
   * Called in destroy() to prevent memory leaks
   */
  private reducedMotionWatcher?: () => void;

  /**
   * FR-001: Constructor - Initialize CornerKit with optional global configuration
   *
   * @param config - Optional global configuration overrides
   *
   * @example
   * ```typescript
   * // With defaults
   * const ck1 = new CornerKit();
   *
   * // With custom globals
   * const ck2 = new CornerKit({ radius: 24, smoothing: 0.9 });
   * ```
   */
  constructor(config?: Partial<SquircleConfig>) {
    // Initialize global config with defaults + user overrides
    this.globalConfig = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    // Validate global config
    this.globalConfig.radius = validateRadius(this.globalConfig.radius);
    this.globalConfig.smoothing = validateSmoothing(this.globalConfig.smoothing);

    // Initialize detector and registry
    this.detector = CapabilityDetector.getInstance();
    this.registry = new ElementRegistry();

    // FR-042: Cache reduced motion preference (single check, not per-element)
    this.reducedMotionEnabled = prefersReducedMotion();

    // Watch for changes to reduced motion preference
    this.reducedMotionWatcher = watchReducedMotionPreference((matches) => {
      this.reducedMotionEnabled = matches;
      // Update all managed elements when preference changes
      this.updateAllReducedMotion();
    });
  }

  /**
   * FR-002: Apply squircle to a single element
   *
   * @param elementOrSelector - HTMLElement or CSS selector string
   * @param config - Optional per-element configuration overrides
   *
   * @throws TypeError if element is invalid
   * @throws Error if selector matches 0 or multiple elements
   *
   * @example
   * ```typescript
   * const ck = new CornerKit();
   *
   * // Apply to element reference
   * const button = document.getElementById('my-button');
   * ck.apply(button);
   *
   * // Apply to CSS selector
   * ck.apply('#my-button');
   *
   * // Apply with custom config
   * ck.apply('#my-button', { radius: 32, smoothing: 0.9 });
   * ```
   */
  apply(elementOrSelector: HTMLElement | string, config?: Partial<SquircleConfig>): void {
    // FR-038, FR-039: Validate and resolve element
    const element = this.resolveElement(elementOrSelector);

    // FR-030: Validate and merge config (global defaults + per-element overrides)
    const mergedConfig: SquircleConfig = {
      radius: validateRadius(config?.radius ?? this.globalConfig.radius),
      smoothing: validateSmoothing(config?.smoothing ?? this.globalConfig.smoothing),
      tier: config?.tier ?? this.globalConfig.tier,
    };

    // Detect tier (or use forced tier from config)
    const tier = mergedConfig.tier || this.detector.detectTier();

    // Store original transition for restoration on remove()
    const originalTransition = element.style.transition;

    // Apply squircle using appropriate renderer
    if (tier === RendererTier.CLIPPATH) {
      // Ensure we have ClipPath renderer
      if (!this.clipPathRenderer) {
        this.clipPathRenderer = new ClipPathRenderer();
      }

      // ClipPath renderer returns ResizeObserver
      // Pass reducedMotion option to renderer (cached value, not repeated matchMedia calls)
      const observer = this.clipPathRenderer.apply(
        element,
        mergedConfig,
        { reducedMotion: this.reducedMotionEnabled }, // FR-042: Pass as option
        // Callback for dimension updates
        (el, width, height) => {
          this.registry.updateDimensions(el, width, height);
        },
        // Callback to get current config (prevents stale closure)
        () => {
          const managed = this.registry.get(element);
          return managed ? managed.config : mergedConfig;
        }
      );

      // Register element with observer and original styles
      this.registry.register(
        element,
        mergedConfig,
        tier,
        observer,
        undefined, // no intersectionObserver yet
        { transition: originalTransition } // Store for restoration
      );
    } else {
      // Fallback renderer (no observers)
      if (!this.fallbackRenderer) {
        this.fallbackRenderer = new FallbackRenderer();
      }

      this.fallbackRenderer.apply(element, mergedConfig);

      // Register element without observers
      this.registry.register(
        element,
        mergedConfig,
        tier,
        undefined, // no resizeObserver
        undefined, // no intersectionObserver
        { transition: originalTransition } // Store for restoration
      );
    }
  }

  /**
   * FR-003: Apply squircles to all elements matching a selector
   * Batch application method for applying the same config to multiple elements
   *
   * @param selector - CSS selector string
   * @param config - Optional configuration overrides (applies to all matched elements)
   *
   * @throws TypeError if selector is invalid
   *
   * @example
   * ```typescript
   * const ck = new CornerKit();
   *
   * // Apply to all buttons
   * ck.applyAll('.button');
   *
   * // Apply to all buttons with custom config
   * ck.applyAll('.button', { radius: 24, smoothing: 0.9 });
   * ```
   */
  applyAll(selector: string, config?: Partial<SquircleConfig>): void {
    // T142: Validate selector is a string
    if (typeof selector !== 'string') {
      throw new TypeError(`cornerKit: Selector must be a string, got ${typeof selector}`);
    }

    // Validate selector is non-empty
    if (selector.trim() === '') {
      throw new TypeError('cornerKit: Selector must be a non-empty string');
    }

    try {
      // T143: Query all matching elements
      const elements = document.querySelectorAll(selector);

      // T145: Handle 0 matches - no-op with warning
      if (elements.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          warn(`Selector "${selector}" matched 0 elements. No squircles applied.`);
        }
        return;
      }

      // T144: Iterate and apply squircle to each element
      elements.forEach((element) => {
        // Validate each element is an HTMLElement
        if (element instanceof HTMLElement) {
          this.apply(element, config);
        } else {
          // Skip non-HTMLElements (e.g., SVGElements) with warning
          if (process.env.NODE_ENV === 'development') {
            warn(
              `Skipping non-HTMLElement in applyAll(): ${element.constructor.name}. Only HTMLElements are supported.`
            );
          }
        }
      });
    } catch (error) {
      // Handle invalid CSS selector syntax
      if (error instanceof DOMException || (error as Error).name === 'SyntaxError') {
        throw new TypeError(`cornerKit: Invalid CSS selector: "${selector}"`);
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * FR-004: Auto-discover and apply squircles to all elements with data-squircle attribute
   * Uses IntersectionObserver for lazy loading (FR-024, FR-025)
   * Elements in viewport are processed immediately, off-screen elements are deferred
   *
   * Can be called multiple times to process newly added elements.
   * Previous IntersectionObserver is automatically cleaned up.
   *
   * @example
   * ```html
   * <div data-squircle data-squircle-radius="24" data-squircle-smoothing="0.9">
   *   Content
   * </div>
   * ```
   * ```typescript
   * const ck = new CornerKit();
   * ck.auto(); // Automatically discovers and applies squircles
   *
   * // Later, after adding more elements:
   * ck.auto(); // Processes new elements, cleans up old observer
   * ```
   */
  auto(): void {
    // T166: Query all elements with data-squircle attribute
    const elements = document.querySelectorAll('[data-squircle]');

    // T174: Handle 0 matches - no-op (no error)
    if (elements.length === 0) {
      return;
    }

    // Disconnect previous observer to prevent memory leaks
    if (this.autoObserver) {
      this.autoObserver.disconnect();
      this.autoObserver = undefined;
    }

    // Collect off-screen elements that need lazy loading
    const offScreenElements: HTMLElement[] = [];

    // Process each element
    elements.forEach((element) => {
      if (!(element instanceof HTMLElement)) {
        // Skip non-HTMLElements (e.g., SVGElements)
        return;
      }

      // T175: Prevent duplicate processing (check if already managed)
      if (this.registry.has(element)) {
        return;
      }

      // T169: Parse data attributes
      const config = parseDataAttributes(element);

      // T170: Check if element is currently visible in viewport
      const rect = element.getBoundingClientRect();
      const isVisible =
        rect.top >= -50 && // 50px above viewport
        rect.left >= -50 && // 50px left of viewport
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 50 && // 50px below viewport
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) + 50; // 50px right of viewport

      if (isVisible) {
        // T170: Apply immediately for visible elements
        this.apply(element, config);
      } else {
        // T171: Collect off-screen elements for lazy loading
        offScreenElements.push(element);
      }
    });

    // T167: Only create IntersectionObserver if there are off-screen elements
    if (offScreenElements.length > 0) {
      // rootMargin: '50px' means elements 50px away from viewport will trigger
      this.autoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // T168: Check if entry is intersecting (entering viewport)
            if (entry.isIntersecting && entry.target instanceof HTMLElement) {
              const element = entry.target;

              // T175: Prevent duplicate processing
              if (this.registry.has(element)) {
                this.autoObserver?.unobserve(element);
                return;
              }

              // T169: Parse data attributes for configuration
              const config = parseDataAttributes(element);

              // Apply squircle
              this.apply(element, config);

              // T173: Unobserve after apply to prevent repeated triggers
              this.autoObserver?.unobserve(element);
            }
          });
        },
        {
          rootMargin: '50px', // FR-024: 50px lookahead for smooth loading
        }
      );

      // Observe all off-screen elements
      offScreenElements.forEach((element) => {
        this.autoObserver!.observe(element);
      });
    }

    // Note: Observer is stored in this.autoObserver and cleaned up on next auto() call
    // T177: Observer disconnection also happens in registry.delete() when remove() is called
  }

  /**
   * FR-005: Update squircle configuration for a managed element
   * Merges new config with existing config and re-renders without recreating observers
   *
   * @param elementOrSelector - HTMLElement or CSS selector string
   * @param config - Partial configuration to update
   *
   * @throws TypeError if element is invalid
   * @throws Error if element is not managed by CornerKit
   *
   * @example
   * ```typescript
   * const ck = new CornerKit();
   * ck.apply('#button');
   *
   * // Later, update only the radius
   * ck.update('#button', { radius: 32 });
   *
   * // Update multiple properties
   * ck.update('#button', { radius: 40, smoothing: 0.95 });
   * ```
   */
  update(elementOrSelector: HTMLElement | string, config: Partial<SquircleConfig>): void {
    // T197: Validate and resolve element
    const element = this.resolveElement(elementOrSelector);

    // T198: Get managed data (combines has() + get() check)
    const managed = this.registry.get(element);
    if (!managed) {
      throw new Error(
        `cornerKit: Cannot update element - element is not managed by CornerKit. Call apply() first.`
      );
    }

    // T200: Validate new config values
    const validatedConfig: Partial<SquircleConfig> = {};

    if (config.radius !== undefined) {
      validatedConfig.radius = validateRadius(config.radius);
    }

    if (config.smoothing !== undefined) {
      validatedConfig.smoothing = validateSmoothing(config.smoothing);
    }

    // Allow tier override (for advanced users)
    if (config.tier !== undefined) {
      validatedConfig.tier = config.tier;
    }

    // Early return if no changes
    if (Object.keys(validatedConfig).length === 0) {
      return;
    }

    // T201: Update registry with merged config
    // Registry.update() returns the updated ManagedElement
    const updatedManaged = this.registry.update(element, validatedConfig);
    if (!updatedManaged) {
      throw new Error('cornerKit: Internal error - failed to update registry');
    }

    // T202: Re-render with updated config using helper method
    // T203: Preserve observers - we don't disconnect/reconnect, just update the visual
    this.updateElementStyling(element, updatedManaged.config, updatedManaged.tier);

    // Note: ResizeObserver remains attached and will automatically use the
    // updated config on next resize (getConfig callback in clippath.ts)
  }

  /**
   * FR-006: Remove squircle from element and clean up all observers
   * Restores element to its original unstyled state and frees up resources
   *
   * @param elementOrSelector - HTMLElement or CSS selector string
   *
   * @throws TypeError if element is invalid
   * @throws Error if element is not managed by CornerKit
   *
   * @example
   * ```typescript
   * const ck = new CornerKit();
   * ck.apply('#button');
   *
   * // Later, remove the squircle
   * ck.remove('#button');
   * ```
   */
  remove(elementOrSelector: HTMLElement | string): void {
    // T242: Validate and resolve element
    const element = this.resolveElement(elementOrSelector);

    // T243: Get managed data (combines has() + get() check)
    const managed = this.registry.get(element);
    if (!managed) {
      throw new Error(
        `cornerKit: Cannot remove element - element is not managed by CornerKit. Element may have already been removed or never had squircle applied.`
      );
    }

    // T246: Remove styling using helper method and restore original transition
    this.removeElementStyling(element, managed.tier, managed.originalStyles?.transition);

    // T247: Delete from registry (this also disconnects observers)
    this.registry.delete(element);
  }

  /**
   * FR-008: Destroy all squircles and clean up all resources
   * Removes all managed elements and allows re-initialization
   *
   * After calling destroy(), the CornerKit instance can still be used
   * (apply() will work again with fresh state)
   *
   * @example
   * ```typescript
   * const ck = new CornerKit();
   * ck.applyAll('.button');
   *
   * // Later, clean up everything
   * ck.destroy();
   *
   * // Instance can be reused
   * ck.apply('#new-button');
   * ```
   */
  destroy(): void {
    // T274: Iterate registry and get all managed elements
    const elements = this.registry.getAllElements();

    // T276: Remove styling from all elements and restore original styles
    // Note: Observer cleanup is handled by clear() below
    elements.forEach((element) => {
      const managed = this.registry.get(element);
      if (managed) {
        this.removeElementStyling(element, managed.tier, managed.originalStyles?.transition);
      }
    });

    // T277: Clear registry (disconnects all observers and removes all elements)
    this.registry.clear();

    // Disconnect auto() observer if it exists
    if (this.autoObserver) {
      this.autoObserver.disconnect();
      this.autoObserver = undefined;
    }

    // Cleanup reduced motion watcher to prevent memory leaks
    if (this.reducedMotionWatcher) {
      this.reducedMotionWatcher();
      this.reducedMotionWatcher = undefined;
    }

    // T278: Instance remains usable - no need to reinitialize anything
    // Registry is cleared but detector and globalConfig remain intact
    // This allows destroy() + apply() to work without creating a new instance
  }

  /**
   * FR-007: Inspect a managed element and return its current configuration
   * Retrieve information about an element's squircle configuration, tier, and dimensions
   *
   * @param elementOrSelector - HTMLElement or CSS selector string
   * @returns ManagedElementInfo object with config, tier, and dimensions
   *
   * @throws TypeError if element is invalid
   * @throws Error if element is not managed by CornerKit
   *
   * @example
   * ```typescript
   * const ck = new CornerKit();
   * ck.apply('#button', { radius: 24 });
   *
   * // Later, inspect the element
   * const info = ck.inspect('#button');
   * console.log(info.config.radius); // 24
   * console.log(info.tier); // 'clippath'
   * console.log(info.dimensions); // { width: 200, height: 50 }
   * ```
   */
  inspect(elementOrSelector: HTMLElement | string): ManagedElementInfo {
    // T259: Validate and resolve element
    const element = this.resolveElement(elementOrSelector);

    // T260: Get managed data (check if element is managed)
    const managed = this.registry.get(element);
    if (!managed) {
      throw new Error(
        `cornerKit: Cannot inspect element - element is not managed by CornerKit. Call apply() first.`
      );
    }

    // T261: Return element information
    return {
      config: { ...managed.config }, // Return copy to prevent mutation
      tier: managed.tier,
      dimensions: {
        width: managed.lastDimensions?.width ?? element.offsetWidth,
        height: managed.lastDimensions?.height ?? element.offsetHeight,
      },
    };
  }

  /**
   * Remove styling from element using appropriate renderer
   * Internal helper to eliminate code duplication
   *
   * @param element - HTMLElement to remove styling from
   * @param tier - Renderer tier to use
   * @param originalTransition - Optional original transition to restore
   */
  private removeElementStyling(
    element: HTMLElement,
    tier: RendererTier,
    originalTransition?: string
  ): void {
    if (tier === RendererTier.CLIPPATH) {
      if (!this.clipPathRenderer) {
        this.clipPathRenderer = new ClipPathRenderer();
      }
      this.clipPathRenderer.remove(element, originalTransition);
    } else {
      // Fallback renderer
      if (!this.fallbackRenderer) {
        this.fallbackRenderer = new FallbackRenderer();
      }
      this.fallbackRenderer.remove(element);
      // Restore original transition for fallback too
      if (originalTransition !== undefined) {
        element.style.transition = originalTransition;
      }
    }
  }

  /**
   * Update element styling using appropriate renderer
   * Internal helper to eliminate code duplication
   *
   * @param element - HTMLElement to update
   * @param config - Squircle configuration
   * @param tier - Renderer tier to use
   */
  private updateElementStyling(
    element: HTMLElement,
    config: SquircleConfig,
    tier: RendererTier
  ): void {
    if (tier === RendererTier.CLIPPATH) {
      if (!this.clipPathRenderer) {
        this.clipPathRenderer = new ClipPathRenderer();
      }
      this.clipPathRenderer.update(element, config);
    } else {
      // Fallback renderer
      if (!this.fallbackRenderer) {
        this.fallbackRenderer = new FallbackRenderer();
      }
      this.fallbackRenderer.update(element, config);
    }
  }

  /**
   * FR-042: Update all managed elements when reduced motion preference changes
   * Called by watcher when user changes OS preference
   *
   * @private
   */
  private updateAllReducedMotion(): void {
    const elements = this.registry.getAllElements();

    elements.forEach((element) => {
      const managed = this.registry.get(element);
      if (!managed || managed.tier !== RendererTier.CLIPPATH) {
        return;
      }

      // Apply or remove reduced motion styling based on current preference
      if (!this.clipPathRenderer) {
        this.clipPathRenderer = new ClipPathRenderer();
      }

      // Re-apply with current reduced motion preference
      // The renderer handles the transition modification
      const existing = element.style.transition || '';

      if (this.reducedMotionEnabled) {
        // Add clip-path 0s if not already present
        if (!existing.includes('clip-path')) {
          element.style.transition = existing
            ? `${existing}, clip-path 0s`
            : 'clip-path 0s';
        }
      } else {
        // Remove clip-path 0s and restore original
        if (existing.includes('clip-path 0s')) {
          const restored = existing
            .split(',')
            .map(s => s.trim())
            .filter(s => !s.startsWith('clip-path'))
            .join(', ');
          element.style.transition = restored || (managed.originalStyles?.transition ?? '');
        }
      }
    });
  }

  /**
   * Resolve element from string selector or validate HTMLElement
   * FR-038, FR-039: Input validation and selector resolution
   *
   * @param elementOrSelector - HTMLElement or CSS selector
   * @returns Resolved HTMLElement
   * @throws TypeError if invalid type
   * @throws Error if selector is invalid or matches wrong number of elements
   */
  private resolveElement(elementOrSelector: HTMLElement | string): HTMLElement {
    // If it's already an HTMLElement, validate and return
    if (typeof elementOrSelector !== 'string') {
      if (!validateElement(elementOrSelector)) {
        throw new TypeError(
          `cornerKit: Expected HTMLElement or string, got ${typeof elementOrSelector}`
        );
      }
      return elementOrSelector;
    }

    // It's a string selector - query the DOM
    const selector = elementOrSelector;

    // Validate selector is non-empty
    if (selector.trim() === '') {
      throw new TypeError('cornerKit: Selector must be a non-empty string');
    }

    try {
      // Query for element
      const element = document.querySelector(selector);

      // Check if element exists
      if (!element) {
        throw new Error(`cornerKit: Selector "${selector}" matched 0 elements`);
      }

      // Validate it's an HTMLElement (not SVGElement, etc.)
      if (!(element instanceof HTMLElement)) {
        throw new TypeError(
          `cornerKit: Selector "${selector}" must match an HTMLElement, got ${element.constructor.name}`
        );
      }

      // Check for multiple matches (best practice warning)
      const allMatches = document.querySelectorAll(selector);
      if (allMatches.length > 1) {
        warn(
          `Selector "${selector}" matched ${allMatches.length} elements. Only the first will be used. Consider using a more specific selector or apply() with HTMLElement reference.`
        );
      }

      return element;
    } catch (error) {
      // Handle invalid CSS selector syntax
      if (error instanceof DOMException || (error as Error).name === 'SyntaxError') {
        throw new TypeError(`cornerKit: Invalid CSS selector: "${selector}"`);
      }

      // Re-throw other errors (e.g., our custom errors)
      throw error;
    }
  }


  /**
   * Static method: Check browser support for rendering tiers
   * Can be called without creating an instance
   *
   * @returns Object with boolean flags for each tier
   *
   * @example
   * ```typescript
   * const support = CornerKit.supports();
   * console.log(support.clippath); // true
   * console.log(support.native); // false (Chrome 139+ only)
   * ```
   */
  static supports(): {
    native: boolean;
    houdini: boolean;
    clippath: boolean;
    fallback: boolean;
  } {
    const detector = CapabilityDetector.getInstance();
    const support = detector.supports();

    return {
      native: support.native,
      houdini: support.houdini,
      clippath: support.clippath,
      fallback: support.fallback,
    };
  }
}

// Re-export types for convenience
export type { SquircleConfig, ManagedElement, ManagedElementInfo };
export { RendererTier };

// Re-export data attribute utilities for convenience
export { hasSquircleAttribute, parseDataAttributes, parseRadius, parseSmoothing } from './utils/data-attributes';
