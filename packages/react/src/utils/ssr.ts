/**
 * SSR Detection Utilities
 *
 * Provides helpers for detecting server-side vs client-side environments.
 * Used to defer CornerKit initialization to client-side only.
 */

/**
 * Check if code is running in a browser environment.
 * Returns true if window and document are available.
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

/**
 * Check if code is running in a server environment (Node.js).
 * Returns true if window is not available.
 */
export const isServer = (): boolean => {
  return typeof window === 'undefined';
};

/**
 * Check if we can safely use DOM APIs.
 * This is more specific than isBrowser() as it also checks
 * that the document body exists (important for hydration).
 */
export const canUseDOM = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    document.body !== null
  );
};
