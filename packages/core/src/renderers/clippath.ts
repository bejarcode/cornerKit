/**
 * ClipPath Renderer (Tier 3)
 * Renders squircles using SVG clip-path with ResizeObserver
 * Primary implementation for modern browsers (Firefox, Safari, Chrome, Edge)
 */

import { generateSquirclePath } from '../math/path-generator';
import type { SquircleConfig, RenderOptions } from '../core/types';
import { warn, warnOnce, warnZeroDimensions, warnDetachedElement } from '../utils/logger';
import { hasZeroDimensions, isDetached } from '../utils/validator';
import { createBorderSVG, removeBorderSVG, injectBorderStyles } from './border';

/**
 * Void and replaced elements that cannot render child content.
 * The SVG border technique inserts a child <svg>, so borders fall back to
 * plain clip-path rendering on these elements (a silent no-op border would
 * otherwise leave the element with a forced-transparent background).
 */
const BORDER_UNSUPPORTED_TAGS = new Set(
  'AREA AUDIO BASE BR CANVAS COL EMBED HR IFRAME IMG INPUT LINK META OBJECT SELECT SOURCE TEXTAREA TRACK VIDEO WBR'.split(
    ' '
  )
);

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
 * Feature 006: SVG-based border rendering (replaces pseudo-element approach)
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
   * Feature 006: Also removes SVG border if present and restores original styles
   *
   * @param element - Target HTMLElement
   * @param originalTransition - Original transition value to restore (if any)
   */
  remove(element: HTMLElement, originalTransition?: string): void {
    // Remove CSS clip-path
    element.style.clipPath = '';

    // Remove border SVG (Feature 006)
    removeBorderSVG(element);

    // Restore original background color if it was captured
    const originalBg = element.dataset['squircleOriginalBg'];
    const hadInlineBg = element.dataset['squircleHadInlineBg'] === 'true';
    if (originalBg !== undefined) {
      if (hadInlineBg) {
        // Restore original inline style value (without !important)
        element.style.backgroundColor = originalBg;
      } else {
        // Original was from CSS - remove inline style, let CSS cascade take over
        element.style.removeProperty('background-color');
      }
    }

    // Restore original background-image if it was captured
    const originalBgImage = element.dataset['squircleOriginalBgImage'];
    const hadInlineBgImage = element.dataset['squircleHadInlineBgImage'] === 'true';
    if (originalBgImage !== undefined) {
      if (hadInlineBgImage) {
        // Restore original inline style value (without !important)
        element.style.backgroundImage = originalBgImage;
      } else {
        // Original was from CSS - remove inline style, let CSS cascade take over
        element.style.removeProperty('background-image');
      }
    }

    // Restore original box-shadow if it was captured
    const originalShadow = element.dataset['squircleOriginalShadow'];
    const hadInlineShadow = element.dataset['squircleHadInlineShadow'] === 'true';
    if (originalShadow !== undefined) {
      if (hadInlineShadow) {
        // Restore original inline style value (without !important)
        element.style.boxShadow = originalShadow;
      } else {
        // Original was from CSS - remove inline style, let CSS cascade take over
        element.style.removeProperty('box-shadow');
      }
    }

    // Restore original position if we changed it (tracked via data attribute)
    if (element.dataset['squircleSetPosition'] === 'true') {
      element.style.position = '';
      delete element.dataset['squircleSetPosition'];
    }

    // Restore element styles modified for border rendering
    element.style.isolation = '';

    // Clean up border-related data attributes
    delete element.dataset['squircleOriginalBg'];
    delete element.dataset['squircleHadInlineBg'];
    delete element.dataset['squircleOriginalBgImage'];
    delete element.dataset['squircleHadInlineBgImage'];
    delete element.dataset['squircleOriginalShadow'];
    delete element.dataset['squircleHadInlineShadow'];

    // Restore original transition if provided
    if (originalTransition !== undefined) {
      element.style.transition = originalTransition;
    }
  }

  /**
   * Generate SVG path and update element's clip-path style
   * Feature 006: Uses SVG-based border rendering (replaces pseudo-element approach)
   *
   * @param element - Target HTMLElement
   * @param config - Squircle configuration
   */
  private updateClipPath(element: HTMLElement, config: SquircleConfig): void {
    const { radius, smoothing, border } = config;

    // Get current element dimensions
    const width = element.offsetWidth;
    const height = element.offsetHeight;

    // Skip rendering for zero-dimension elements
    if (width < 1 || height < 1) {
      return;
    }

    // Generate SVG path string
    const path = generateSquirclePath(width, height, radius, smoothing);

    // Border requested and renderable?
    const wantsBorder = !!(
      border &&
      border.width > 0 &&
      (border.color || (border.gradient && border.gradient.length >= 2))
    );

    // Void/replaced elements cannot host the border SVG; fall back to
    // plain clip-path so the element still gets its squircle shape
    const canHostBorder = !BORDER_UNSUPPORTED_TAGS.has(element.tagName);
    if (wantsBorder && !canHostBorder) {
      warnOnce(
        `Borders are not supported on <${element.tagName.toLowerCase()}> elements (they cannot render child content). Applying squircle without a border. Wrap the element in a container and apply the border to the wrapper instead.`,
        `border-unsupported-${element.tagName}`
      );
    }

    // Handle border rendering via SVG (Feature 006)
    if (wantsBorder && canHostBorder) {
      // Inject global border styles (once per page)
      injectBorderStyles();

      // Remove any existing border SVG before creating new one
      removeBorderSVG(element);

      // Capture background BEFORE making element transparent
      // Only capture once (check if not already captured)
      let backgroundColor: string | undefined;
      if (!element.dataset['squircleOriginalBg']) {
        // Track whether background was set via inline style (before we modify it)
        // This is needed for proper restoration later
        const hadInlineStyle = !!element.style.backgroundColor;
        const hadInlineImage = !!element.style.backgroundImage;
        const hadInlineShadow = !!element.style.boxShadow;
        const computedStyle = getComputedStyle(element);
        backgroundColor = computedStyle.backgroundColor;
        element.dataset['squircleOriginalBg'] = backgroundColor;
        element.dataset['squircleHadInlineBg'] = hadInlineStyle ? 'true' : 'false';
        // Also capture background-image (for gradients)
        const backgroundImage = computedStyle.backgroundImage;
        element.dataset['squircleOriginalBgImage'] = backgroundImage;
        element.dataset['squircleHadInlineBgImage'] = hadInlineImage ? 'true' : 'false';
        // Also capture box-shadow (would show through transparent background)
        const boxShadow = computedStyle.boxShadow;
        element.dataset['squircleOriginalShadow'] = boxShadow;
        element.dataset['squircleHadInlineShadow'] = hadInlineShadow ? 'true' : 'false';
      } else {
        backgroundColor = element.dataset['squircleOriginalBg'];
      }

      // Create border SVG
      const borderSvg = createBorderSVG({
        width,
        height,
        radius,
        smoothing,
        border,
        backgroundColor
      });

      // Insert SVG as first child (behind content due to z-index: -1)
      if (borderSvg) {
        element.insertBefore(borderSvg, element.firstChild);
      }

      // Make element background transparent (SVG handles it)
      // Use setProperty with !important to override CSS frameworks (like Tailwind with important: true)
      element.style.setProperty('background-color', 'transparent', 'important');
      // Also clear background-image (for gradients) since we're not clipping the element
      element.style.setProperty('background-image', 'none', 'important');
      // Clear box-shadow (would show through transparent background and outside squircle shape)
      element.style.setProperty('box-shadow', 'none', 'important');

      // Apply required CSS for stacking context (T016)
      // Check for 'static' or empty string (jsdom returns '' for unset position)
      const computedPosition = getComputedStyle(element).position;
      if (computedPosition === 'static' || computedPosition === '') {
        element.style.position = 'relative';
        // Track that we set the position so we can restore it later
        element.dataset['squircleSetPosition'] = 'true';
      }
      element.style.isolation = 'isolate';

      // DO NOT apply CSS clip-path when border is configured
      // This prevents anti-aliasing fringe on dark backgrounds
      element.style.clipPath = '';
    } else {
      // No border - apply standard CSS clip-path
      element.style.clipPath = `path('${path}')`;

      // Remove any existing border SVG
      removeBorderSVG(element);

      // Restore original background color if switching from border to no-border
      const originalBg = element.dataset['squircleOriginalBg'];
      const hadInlineBg = element.dataset['squircleHadInlineBg'] === 'true';
      if (originalBg !== undefined) {
        if (hadInlineBg) {
          // Restore original inline style value (without !important)
          element.style.backgroundColor = originalBg;
        } else {
          // Original was from CSS - remove inline style, let CSS cascade take over
          element.style.removeProperty('background-color');
        }
      }

      // Restore original background-image if switching from border to no-border
      const originalBgImage = element.dataset['squircleOriginalBgImage'];
      const hadInlineBgImage = element.dataset['squircleHadInlineBgImage'] === 'true';
      if (originalBgImage !== undefined) {
        if (hadInlineBgImage) {
          // Restore original inline style value (without !important)
          element.style.backgroundImage = originalBgImage;
        } else {
          // Original was from CSS - remove inline style, let CSS cascade take over
          element.style.removeProperty('background-image');
        }
      }

      // Restore original box-shadow if switching from border to no-border
      const originalShadow = element.dataset['squircleOriginalShadow'];
      const hadInlineShadow = element.dataset['squircleHadInlineShadow'] === 'true';
      if (originalShadow !== undefined) {
        if (hadInlineShadow) {
          // Restore original inline style value (without !important)
          element.style.boxShadow = originalShadow;
        } else {
          // Original was from CSS - remove inline style, let CSS cascade take over
          element.style.removeProperty('box-shadow');
        }
      }

      // Restore position if we set it
      if (element.dataset['squircleSetPosition'] === 'true') {
        element.style.position = '';
        delete element.dataset['squircleSetPosition'];
      }

      // Remove isolation context
      element.style.isolation = '';

      // Clean up border-related data attributes
      delete element.dataset['squircleOriginalBg'];
      delete element.dataset['squircleHadInlineBg'];
      delete element.dataset['squircleOriginalBgImage'];
      delete element.dataset['squircleHadInlineBgImage'];
      delete element.dataset['squircleOriginalShadow'];
      delete element.dataset['squircleHadInlineShadow'];
    }
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
            warn('ResizeObserver error: Element may have been removed from DOM', {
              error: error instanceof Error ? error.message : String(error),
            });

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
    wrappedObserver.cleanup = (): void => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    return wrappedObserver;
  }
}
