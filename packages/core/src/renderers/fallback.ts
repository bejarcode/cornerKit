/**
 * Fallback Renderer (Tier 4)
 * Renders corners using standard CSS border-radius
 * Graceful degradation for browsers without clip-path support (IE11, older browsers)
 */

import type { SquircleConfig } from '../core/types';

/**
 * Fallback Renderer Class
 * FR-012: border-radius fallback for universal compatibility
 *
 * Note: This renderer does NOT create true squircles - it uses standard rounded corners.
 * This is intentional graceful degradation for maximum browser compatibility.
 */
export class FallbackRenderer {
  /**
   * Apply border-radius to an element
   * Sets element.style.borderRadius with the configured radius
   *
   * @param element - Target HTMLElement
   * @param config - Squircle configuration (only radius is used, smoothing is ignored)
   */
  apply(element: HTMLElement, config: SquircleConfig): void {
    this.updateBorderRadius(element, config);
  }

  /**
   * Update border-radius configuration
   * Regenerates border-radius with new config
   *
   * @param element - Target HTMLElement
   * @param config - New squircle configuration
   */
  update(element: HTMLElement, config: SquircleConfig): void {
    this.updateBorderRadius(element, config);
  }

  /**
   * Remove border-radius from element
   * Resets element.style.borderRadius to empty string
   *
   * @param element - Target HTMLElement
   */
  remove(element: HTMLElement): void {
    element.style.borderRadius = '';
  }

  /**
   * Apply border-radius CSS property
   * Internal helper method used by apply() and update()
   *
   * @param element - Target HTMLElement
   * @param config - Squircle configuration
   */
  private updateBorderRadius(element: HTMLElement, config: SquircleConfig): void {
    const { radius } = config;
    // Note: smoothing is ignored in fallback mode (border-radius doesn't support it)
    element.style.borderRadius = `${radius}px`;
  }
}
