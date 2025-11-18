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
 * Extended ResizeObserver interface with cleanup method
 * Allows cancelling pending requestAnimationFrame callbacks
 */
export interface ResizeObserverWithCleanup extends ResizeObserver {
  /**
   * Cleanup method to cancel pending animations before disconnect
   * Must be called before disconnect() to prevent race conditions
   */
  cleanup(): void;
}

/**
 * ClipPath Renderer Class
 * FR-018 to FR-022: SVG clip-path implementation with ResizeObserver
 */
export class ClipPathRenderer {
  private static borderStylesInjected = false;

  /**
   * Inject global CSS styles for squircle borders (once per page)
   * Uses ::before for border layer, ::after for content background
   * Main element has NO clip-path to allow pseudo-elements to show
   */
  private static injectBorderStyles(): void {
    if (this.borderStylesInjected || typeof document === 'undefined') {
      return;
    }

    const style = document.createElement('style');
    style.id = 'cornerkit-border-styles';
    style.textContent = `
      [data-squircle-border]::before {
        content: '';
        position: absolute;
        top: calc(var(--squircle-border-width, 0px) * -1);
        left: calc(var(--squircle-border-width, 0px) * -1);
        width: calc(100% + var(--squircle-border-width, 0px) * 2);
        height: calc(100% + var(--squircle-border-width, 0px) * 2);
        background: var(--squircle-border-color, transparent);
        clip-path: var(--squircle-border-path);
        z-index: 0;
        pointer-events: none;
        border-radius: 0;
      }
      [data-squircle-border]::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--squircle-content-bg-color, transparent);
        background-image: var(--squircle-content-bg-image, none);
        background-size: var(--squircle-content-bg-size, auto);
        background-position: var(--squircle-content-bg-position, 0% 0%);
        background-repeat: var(--squircle-content-bg-repeat, repeat);
        clip-path: var(--squircle-content-path);
        z-index: 1;
        pointer-events: none;
        border-radius: 0;
      }
      [data-squircle-border] > * {
        position: relative;
        z-index: 2;
      }
    `;
    document.head.appendChild(style);
    this.borderStylesInjected = true;
  }

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
  ): ResizeObserverWithCleanup {
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

    // Remove border properties
    this.removeBorderProperties(element);

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
    const { radius, smoothing, borderWidth, borderColor } = config;

    // Get current element dimensions
    const width = element.offsetWidth;
    const height = element.offsetHeight;

    // Skip rendering for zero-dimension elements
    if (width < 1 || height < 1) {
      return;
    }

    // Generate SVG path string
    const path = generateSquirclePath(width, height, radius, smoothing);

    // Handle border rendering via ::before and ::after pseudo-elements
    if (borderWidth && borderWidth > 0 && borderColor) {
      // Inject global border styles (once per page)
      ClipPathRenderer.injectBorderStyles();

      // DON'T apply clip-path to main element - let pseudo-elements handle it
      // This prevents the parent's clip-path from cutting off the border
      element.style.clipPath = 'none';

      // Calculate border path (for the ::before element which is larger)
      const borderElementWidth = width + borderWidth * 2;
      const borderElementHeight = height + borderWidth * 2;
      const borderPath = generateSquirclePath(
        borderElementWidth,
        borderElementHeight,
        radius + borderWidth, // Increase radius proportionally
        smoothing
      );

      // Capture original background ONLY ONCE (before we set it to transparent)
      // This prevents recapturing the transparent value on subsequent updates
      if (!element.dataset['squircleOriginalBg']) {
        const computedStyle = getComputedStyle(element);

        // Store individual background properties in CSS variables
        element.style.setProperty('--squircle-content-bg-color', computedStyle.backgroundColor);
        element.style.setProperty('--squircle-content-bg-image', computedStyle.backgroundImage);
        element.style.setProperty('--squircle-content-bg-size', computedStyle.backgroundSize);
        element.style.setProperty('--squircle-content-bg-position', computedStyle.backgroundPosition);
        element.style.setProperty('--squircle-content-bg-repeat', computedStyle.backgroundRepeat);

        // Mark as captured
        element.dataset['squircleOriginalBg'] = 'captured';
      }

      // Set CSS custom properties for pseudo-elements (border path updates on resize)
      element.style.setProperty('--squircle-border-width', `${borderWidth}px`);
      element.style.setProperty('--squircle-border-color', borderColor);
      element.style.setProperty('--squircle-border-path', `path('${borderPath}')`);
      element.style.setProperty('--squircle-content-path', `path('${path}')`);

      // Make main element's background transparent (::after will show it)
      element.style.background = 'transparent';

      // Mark element for border styling and ensure position context
      element.dataset['squircleBorder'] = 'true';
      const computedStyle = getComputedStyle(element);
      const computedPosition = computedStyle.position;
      if (computedPosition === 'static') {
        element.style.position = 'relative';
      }
    } else {
      // No borders - apply clip-path directly to element
      element.style.clipPath = `path('${path}')`;
      // Remove border properties if not configured
      this.removeBorderProperties(element);
    }
  }

  /**
   * Remove border-related CSS properties from element
   * @param element - Target HTMLElement
   */
  private removeBorderProperties(element: HTMLElement): void {
    element.style.removeProperty('--squircle-border-width');
    element.style.removeProperty('--squircle-border-color');
    element.style.removeProperty('--squircle-border-path');
    element.style.removeProperty('--squircle-content-path');
    element.style.removeProperty('--squircle-content-bg-color');
    element.style.removeProperty('--squircle-content-bg-image');
    element.style.removeProperty('--squircle-content-bg-size');
    element.style.removeProperty('--squircle-content-bg-position');
    element.style.removeProperty('--squircle-content-bg-repeat');
    delete element.dataset['squircleBorder'];
    delete element.dataset['squircleOriginalBg'];
    // Note: We don't restore element.style.background here because
    // the element will get the standard clip-path instead
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
  ): ResizeObserverWithCleanup {
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

    // Add cleanup method to cancel pending animations
    // This prevents race conditions where pending rafId callbacks execute after disconnect()
    const wrappedObserver = observer as ResizeObserverWithCleanup;
    wrappedObserver.cleanup = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    return wrappedObserver;
  }
}
