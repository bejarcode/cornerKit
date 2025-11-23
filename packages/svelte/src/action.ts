/**
 * squircle Action
 *
 * Svelte action for applying squircle corners directly to elements.
 * Supports both full configuration objects and number shorthand for radius-only.
 *
 * @example
 * ```svelte
 * <script>
 *   import { squircle } from '@cornerkit/svelte';
 * </script>
 *
 * <!-- Full configuration -->
 * <div use:squircle={{ radius: 20, smoothing: 0.8 }}>Content</div>
 *
 * <!-- Number shorthand (radius only) -->
 * <div use:squircle={24}>Content</div>
 *
 * <!-- With border -->
 * <div use:squircle={{ radius: 20, border: { width: 2, color: '#3b82f6' } }}>
 *   Content
 * </div>
 * ```
 */

import type {
  SquircleActionOptions,
  SquircleActionReturn,
  SquircleOptions,
} from './types';
import { isBrowser, normalizeParams, buildConfig, optionsEqual } from './utils';

/**
 * Svelte action for applying squircle corners to an element.
 *
 * @param node - The DOM element to apply squircle to
 * @param params - Configuration options (object or number shorthand)
 * @returns Action return object with update and destroy callbacks
 *
 * @example
 * ```svelte
 * <!-- Basic usage -->
 * <div use:squircle={{ radius: 20 }}>Content</div>
 *
 * <!-- Shorthand -->
 * <div use:squircle={20}>Content</div>
 *
 * <!-- Reactive updates -->
 * <script>
 *   let radius = 20;
 * </script>
 * <div use:squircle={{ radius }}>Content</div>
 * <input type="range" bind:value={radius} />
 * ```
 */
export function squircle(
  node: HTMLElement,
  params?: SquircleActionOptions
): SquircleActionReturn {
  // CornerKit instance (lazy loaded)
  let ck: import('@cornerkit/core').default | null = null;

  // Current options (for tracking changes)
  let currentOptions: SquircleOptions = normalizeParams(params);

  // Track if initial apply is in progress to prevent race conditions
  let applyInProgress = false;

  /**
   * Apply squircle effect to the node.
   */
  async function apply(): Promise<void> {
    if (!isBrowser() || applyInProgress) return;

    applyInProgress = true;

    try {
      const CornerKit = (await import('@cornerkit/core')).default;
      const config = buildConfig(currentOptions);

      if (!ck) {
        ck = new CornerKit();
        ck.apply(node, config);
      } else {
        ck.update(node, config);
      }
    } catch (error) {
      // Log errors in development (Vite injects import.meta.env)
      if (import.meta.env?.DEV) {
        console.warn('[@cornerkit/svelte] Failed to apply squircle:', error);
      }
    } finally {
      applyInProgress = false;
    }
  }

  /**
   * Update squircle with new parameters.
   */
  function update(newParams: SquircleActionOptions): void {
    const newOptions = normalizeParams(newParams);

    // Skip update if options haven't changed
    if (optionsEqual(newOptions, currentOptions)) {
      return;
    }

    currentOptions = newOptions;

    if (ck && isBrowser()) {
      const config = buildConfig(currentOptions);
      ck.update(node, config);
    } else if (!applyInProgress) {
      // Instance not yet created and no apply in progress, apply from scratch
      apply();
    }
  }

  /**
   * Clean up squircle effect.
   */
  function destroy(): void {
    if (ck) {
      ck.remove(node);
      ck = null;
    }
  }

  // Initial application
  apply();

  return {
    update,
    destroy,
  };
}
