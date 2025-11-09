/**
 * Accessibility Utilities
 * FR-042: Respect prefers-reduced-motion user preference
 */

/**
 * T221, T222: Check if user prefers reduced motion
 * Uses window.matchMedia to detect the prefers-reduced-motion media query
 *
 * @returns true if user has enabled reduced motion preference
 *
 * @example
 * ```typescript
 * if (prefersReducedMotion()) {
 *   // Disable transitions/animations
 *   element.style.transition = 'none';
 * }
 * ```
 */
export function prefersReducedMotion(): boolean {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }

  // FR-042: Check media query for reduced motion preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * T223, T224: Apply reduced motion preferences to an element
 * Disables CSS transitions if user prefers reduced motion
 *
 * @deprecated This function is deprecated and will be removed in v2.0.
 * Reduced motion is now handled automatically by CornerKit renderers.
 * You don't need to call this function manually.
 *
 * @param element - Target HTMLElement
 *
 * @example
 * ```typescript
 * const button = document.querySelector('button');
 * applyReducedMotionPreference(button);
 * ```
 */
export function applyReducedMotionPreference(element: HTMLElement): void {
  if (prefersReducedMotion()) {
    // T223: Disable transitions for users who prefer reduced motion
    element.style.transition = 'none';
  }
}

/**
 * T225: Listen for changes to reduced motion preference
 * Allows dynamic updates when user changes system preferences
 *
 * @param callback - Function to call when preference changes
 * @returns Cleanup function to remove the listener
 *
 * @example
 * ```typescript
 * const cleanup = watchReducedMotionPreference((matches) => {
 *   console.log('Reduced motion preference changed:', matches);
 *   if (matches) {
 *     // Disable animations
 *   } else {
 *     // Enable animations
 *   }
 * });
 *
 * // Later, cleanup when no longer needed
 * cleanup();
 * ```
 */
export function watchReducedMotionPreference(
  callback: (matches: boolean) => void
): () => void {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {}; // No-op cleanup function
  }

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // T225: Listen for changes to the media query
  const listener = (event: MediaQueryListEvent) => {
    callback(event.matches);
  };

  // Use addEventListener if available (modern browsers)
  // Fallback to addListener for older browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', listener);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(listener);
  }

  // Return cleanup function
  return () => {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', listener);
    } else if (mediaQuery.removeListener) {
      mediaQuery.removeListener(listener);
    }
  };
}
