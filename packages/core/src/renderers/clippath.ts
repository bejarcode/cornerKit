/**
 * ClipPath Renderer (Tier 3)
 * Renders squircles using SVG clip-path with ResizeObserver
 * Primary implementation for modern browsers (Firefox, Safari, Chrome, Edge)
 */

import { generateSquirclePath } from '../math/path-generator';
import type { SquircleConfig, RenderOptions } from '../core/types';
import { warn, warnZeroDimensions, warnDetachedElement } from '../utils/logger';
import { hasZeroDimensions, isDetached } from '../utils/validator';

/**
 * Callback function signature for dimension updates
 * Called when element dimensions change beyond threshold
 */
export type DimensionUpdateCallback = (
  element: HTMLElement,
  width: number,
  height: number
) => void;

/**
 * ClipPath Renderer Class
 * FR-018 to FR-022: SVG clip-path implementation with ResizeObserver
 */
export class ClipPathRenderer {
  /**
   * FR-018: Apply squircle clip-path to an element
   * Generates SVG path and sets element.style.clipPath
   *
   * @param element - Target HTMLElement
   * @param config - Squircle configuration
   * @param options - Render options (reduced motion, etc.)
   * @param onDimensionUpdate - Callback for dimension changes
   * @param getConfig - Callback to get current config (for dynamic updates)
   * @returns ResizeObserver instance for this element (to be stored in registry)
   */
  apply(
    element: HTMLElement,
    config: SquircleConfig,
    options?: RenderOptions,
    onDimensionUpdate?: DimensionUpdateCallback,
    getConfig?: () => SquircleConfig
  ): ResizeObserver {
    // Check for zero dimensions (development warning)
    if (hasZeroDimensions(element)) {
      warnZeroDimensions(element);
    }

    // Check if element is detached (development warning)
    if (isDetached(element)) {
      warnDetachedElement(element);
    }

    // FR-042: Handle reduced motion preference
    // Only disable clip-path transitions, don't overwrite user's other transitions
    if (options?.reducedMotion) {
      this.applyReducedMotion(element);
    }

    // Generate and apply initial clip-path
    this.updateClipPath(element, config);

    // FR-019: Create ResizeObserver to detect dimension changes
    const observer = this.createResizeObserver(element, onDimensionUpdate, getConfig);
    observer.observe(element);

    return observer;
  }

  /**
   * Update squircle configuration and re-render
   * Regenerates path with new config
   *
   * @param element - Target HTMLElement
   * @param config - New squircle configuration
   */
  update(element: HTMLElement, config: SquircleConfig): void {
    this.updateClipPath(element, config);
  }

  /**
   * Remove squircle clip-path from element
   * Resets element.style.clipPath and optionally restores original transition
   *
   * @param element - Target HTMLElement
   * @param originalTransition - Original transition value to restore (if any)
   */
  remove(element: HTMLElement, originalTransition?: string): void {
    element.style.clipPath = '';

    // Restore original transition if provided
    if (originalTransition !== undefined) {
      element.style.transition = originalTransition;
    }
  }

  /**
   * Generate SVG path and update element's clip-path style
   * Internal helper method used by apply() and update()
   *
   * @param element - Target HTMLElement
   * @param config - Squircle configuration
   */
  private updateClipPath(element: HTMLElement, config: SquircleConfig): void {
    const { radius, smoothing } = config;

    // Get current element dimensions
    const width = element.offsetWidth;
    const height = element.offsetHeight;

    // Skip rendering for zero-dimension elements
    if (width < 1 || height < 1) {
      return;
    }

    // Generate SVG path string
    const path = generateSquirclePath(width, height, radius, smoothing);

    // Apply clip-path CSS property
    element.style.clipPath = `path('${path}')`;
  }

  /**
   * FR-042: Apply reduced motion preferences
   * Disables clip-path transitions without overwriting user's other transitions
   *
   * @param element - Target HTMLElement
   */
  private applyReducedMotion(element: HTMLElement): void {
    const existing = element.style.transition || '';

    // Only modify if clip-path transition not already disabled
    if (!existing.includes('clip-path')) {
      // Append clip-path with 0s duration to existing transitions
      element.style.transition = existing
        ? `${existing}, clip-path 0s`
        : 'clip-path 0s';
    }
  }

  /**
   * FR-019, FR-020, FR-022: Create ResizeObserver with RAF debouncing and 1px threshold
   * Automatically updates clip-path when element dimensions change
   *
   * @param element - Target HTMLElement
   * @param onDimensionUpdate - Optional callback for tracking dimension changes
   * @param getConfig - Optional callback to get current config (prevents stale closure)
   * @returns ResizeObserver instance
   */
  private createResizeObserver(
    element: HTMLElement,
    onDimensionUpdate?: DimensionUpdateCallback,
    getConfig?: () => SquircleConfig
  ): ResizeObserver {
    // Store last dimensions to implement 1px threshold (FR-022)
    let lastWidth = element.offsetWidth;
    let lastHeight = element.offsetHeight;
    let rafId: number | null = null;

    const observer = new ResizeObserver((entries) => {
      // FR-020: Debounce with requestAnimationFrame (max 60fps updates)
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        for (const entry of entries) {
          // FR-021: Error handling for detached elements
          try {
            const target = entry.target as HTMLElement;

            // Get new dimensions
            const newWidth = target.offsetWidth;
            const newHeight = target.offsetHeight;

            // FR-022: Only update if dimensions changed by ≥1px
            const widthDelta = Math.abs(newWidth - lastWidth);
            const heightDelta = Math.abs(newHeight - lastHeight);

            if (widthDelta >= 1 || heightDelta >= 1) {
              // Get current config (fresh from registry if callback provided)
              const currentConfig = getConfig ? getConfig() : { radius: 0, smoothing: 0.8 };

              // Update clip-path with current config
              this.updateClipPath(target, currentConfig);

              // Notify registry of dimension change (updates lastDimensions)
              onDimensionUpdate?.(target, newWidth, newHeight);

              // Store new dimensions for next comparison
              lastWidth = newWidth;
              lastHeight = newHeight;
            }
          } catch (error) {
            // FR-021: Handle errors (e.g., element removed from DOM)
            if (process.env.NODE_ENV === 'development') {
              warn('ResizeObserver error: Element may have been removed from DOM', {
                error: error instanceof Error ? error.message : String(error),
              });
            }

            // Disconnect observer for this element
            observer.disconnect();
          }
        }

        rafId = null;
      });
    });

    return observer;
  }
}
