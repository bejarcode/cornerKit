/**
 * Element Registry
 * Manages all elements with applied squircles using WeakMap
 * Provides lifecycle management and observer cleanup (FR-023, FR-026)
 */

import type { SquircleConfig } from './types';
import type { RendererTier } from './detector';
import { warnDuplicateApply } from '../utils/logger';

/**
 * ManagedElement Interface
 * Represents an element with squircle applied, including its configuration and observers
 */
export interface ManagedElement {
  /**
   * Reference to the DOM element
   * Stored in WeakMap key, but also kept here for convenience
   */
  element: HTMLElement;

  /**
   * Current configuration for this element
   * Merged from global defaults + per-element overrides
   */
  config: SquircleConfig;

  /**
   * Detected renderer tier for this element
   * Cached to avoid repeated detection
   */
  tier: RendererTier;

  /**
   * ResizeObserver instance for this element (optional)
   * Tracks dimension changes, triggers clip-path updates
   * Only used for CLIPPATH tier
   */
  resizeObserver?: ResizeObserver;

  /**
   * IntersectionObserver instance for this element (optional)
   * Used for lazy loading (auto() with many elements)
   * Disconnected after element enters viewport
   */
  intersectionObserver?: IntersectionObserver;

  /**
   * Current element dimensions (cached, optional)
   * Used to detect 1px threshold changes for updates
   */
  lastDimensions?: {
    width: number;
    height: number;
  };
}

/**
 * ElementRegistry Class
 * FR-023: Use WeakMap for automatic garbage collection
 * FR-026: Prevent duplicate application
 */
export class ElementRegistry {
  /**
   * WeakMap storing managed elements
   * Key: HTMLElement, Value: ManagedElement
   * Automatic garbage collection when elements removed from DOM
   */
  private elements = new WeakMap<HTMLElement, ManagedElement>();

  /**
   * Set tracking all registered elements
   * Allows iteration for destroy() while maintaining WeakMap benefits
   * Elements are removed from Set on delete() but WeakMap handles actual GC
   */
  private trackedElements = new Set<HTMLElement>();

  /**
   * FR-023: Register an element with squircle configuration
   * Adds element to WeakMap with its config, tier, and observers
   *
   * @param element - HTMLElement to register
   * @param config - Squircle configuration
   * @param tier - Renderer tier being used
   * @param resizeObserver - Optional ResizeObserver instance
   * @param intersectionObserver - Optional IntersectionObserver instance
   */
  register(
    element: HTMLElement,
    config: SquircleConfig,
    tier: RendererTier,
    resizeObserver?: ResizeObserver,
    intersectionObserver?: IntersectionObserver
  ): void {
    // FR-026: Check for duplicate registration
    if (this.has(element)) {
      // Warn in development mode
      warnDuplicateApply(element);

      // Get existing entry and update it instead of replacing
      const existing = this.get(element);
      if (existing) {
        // Disconnect old observers before replacing
        existing.resizeObserver?.disconnect();
        existing.intersectionObserver?.disconnect();

        // Update existing entry (more efficient than creating new object)
        existing.config = config;
        existing.tier = tier;
        existing.resizeObserver = resizeObserver;
        existing.intersectionObserver = intersectionObserver;
        existing.lastDimensions = {
          width: element.offsetWidth,
          height: element.offsetHeight,
        };
        return;
      }
    }

    // Create new managed element entry (only if not exists)
    const managed: ManagedElement = {
      element,
      config,
      tier,
      resizeObserver,
      intersectionObserver,
      lastDimensions: {
        width: element.offsetWidth,
        height: element.offsetHeight,
      },
    };

    // Store in WeakMap and tracking Set
    this.elements.set(element, managed);
    this.trackedElements.add(element);
  }

  /**
   * Get managed element data
   *
   * @param element - HTMLElement to lookup
   * @returns ManagedElement if found, undefined otherwise
   */
  get(element: HTMLElement): ManagedElement | undefined {
    return this.elements.get(element);
  }

  /**
   * Check if element is registered
   *
   * @param element - HTMLElement to check
   * @returns true if element is registered, false otherwise
   */
  has(element: HTMLElement): boolean {
    return this.elements.has(element);
  }

  /**
   * Delete element from registry and disconnect observers
   * Removes from WeakMap and disconnects ResizeObserver/IntersectionObserver
   *
   * @param element - HTMLElement to remove
   */
  delete(element: HTMLElement): void {
    const managed = this.get(element);

    if (managed) {
      // Disconnect observers
      managed.resizeObserver?.disconnect();
      managed.intersectionObserver?.disconnect();

      // Remove from WeakMap and tracking Set
      this.elements.delete(element);
      this.trackedElements.delete(element);
    }
  }

  /**
   * Update configuration for an existing managed element
   * Merges new config with existing config
   *
   * @param element - HTMLElement to update
   * @param config - Partial configuration to merge
   * @returns Updated ManagedElement, or undefined if element not registered
   */
  update(element: HTMLElement, config: Partial<SquircleConfig>): ManagedElement | undefined {
    const managed = this.get(element);

    if (!managed) {
      return undefined;
    }

    // Merge new config with existing config
    managed.config = {
      ...managed.config,
      ...config,
    };

    return managed;
  }

  /**
   * Update last dimensions for an element
   * Used by ResizeObserver to track dimension changes
   *
   * @param element - HTMLElement to update
   * @param width - New width
   * @param height - New height
   */
  updateDimensions(element: HTMLElement, width: number, height: number): void {
    const managed = this.get(element);

    if (managed) {
      managed.lastDimensions = { width, height };
    }
  }

  /**
   * Get all managed elements
   * Returns array of currently tracked elements
   *
   * @returns Array of HTMLElements currently managed
   */
  getAllElements(): HTMLElement[] {
    // Return array of tracked elements
    // Note: Some elements may have been garbage collected but not yet removed from Set
    // Filter to only return elements that still exist in WeakMap
    return Array.from(this.trackedElements).filter((el) => this.has(el));
  }

  /**
   * Clear all managed elements (disconnect all observers)
   * Iterates through tracked elements and removes each one
   */
  clear(): void {
    // Iterate through tracked elements and delete each
    const elements = Array.from(this.trackedElements);
    elements.forEach((element) => {
      this.delete(element);
    });
  }
}
