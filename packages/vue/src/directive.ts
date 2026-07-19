/**
 * v-squircle Directive
 *
 * Vue 3 custom directive for applying squircle corners directly to elements.
 * Supports both object syntax and number shorthand.
 *
 * @example
 * ```vue
 * <script setup>
 * import { vSquircle } from '@cornerkit/vue';
 * </script>
 *
 * <template>
 *   <!-- Full config -->
 *   <button v-squircle="{ radius: 20, smoothing: 0.8 }">
 *     Squircle Button
 *   </button>
 *
 *   <!-- Shorthand (radius only) -->
 *   <div v-squircle="24" class="card">
 *     Quick squircle
 *   </div>
 * </template>
 * ```
 */

import type { Directive, DirectiveBinding } from 'vue';
import type { VSquircleValue, SquircleOptions } from './types';

/**
 * WeakMap to store CornerKit instances per element.
 * Using WeakMap ensures proper garbage collection when elements are removed.
 */
const instanceMap = new WeakMap<HTMLElement, import('@cornerkit/core').default>();

/**
 * Check if running in browser environment.
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Normalize directive value to SquircleOptions.
 * Supports both object and number shorthand.
 */
function normalizeValue(value: VSquircleValue): SquircleOptions {
  if (typeof value === 'number') {
    return { radius: value };
  }
  return value;
}

/**
 * Compare two directive values for equality.
 * Handles both number shorthand and object syntax.
 */
function valuesEqual(
  a: VSquircleValue | undefined | null,
  b: VSquircleValue | undefined | null
): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;

  const optA = normalizeValue(a);
  const optB = normalizeValue(b);

  return (
    optA.radius === optB.radius &&
    optA.smoothing === optB.smoothing &&
    optA.border?.width === optB.border?.width &&
    optA.border?.color === optB.border?.color
  );
}

/**
 * Build CornerKit config from options.
 */
function buildConfig(options: SquircleOptions): object {
  // `border` passes through unchanged so the full core v1.2+ API works
  // (style, dashArray, gradient) and `border: null` explicitly disables.
  return {
    radius: options.radius,
    smoothing: options.smoothing,
    ...(options.border !== undefined && { border: options.border }),
  };
}

/**
 * Apply squircle effect to element.
 */
async function applySquircle(
  el: HTMLElement,
  binding: DirectiveBinding<VSquircleValue>
): Promise<void> {
  if (!isBrowser()) return;

  try {
    const CornerKit = (await import('@cornerkit/core')).default;
    const options = normalizeValue(binding.value);
    const config = buildConfig(options);

    // Get or create CornerKit instance
    let instance = instanceMap.get(el);
    if (!instance) {
      instance = new CornerKit();
      instanceMap.set(el, instance);
      instance.apply(el, config);
    } else {
      instance.update(el, config);
    }
  } catch {
    // Silently handle import errors in SSR environments
  }
}

/**
 * Remove squircle effect from element.
 */
function removeSquircle(el: HTMLElement): void {
  const instance = instanceMap.get(el);
  if (instance) {
    instance.remove(el);
    instanceMap.delete(el);
  }
}

/**
 * v-squircle directive definition.
 *
 * @example
 * ```vue
 * <!-- Object syntax -->
 * <div v-squircle="{ radius: 20, smoothing: 0.8, border: { width: 2, color: 'blue' } }">
 *
 * <!-- Number shorthand -->
 * <div v-squircle="24">
 * ```
 */
export const vSquircle: Directive<HTMLElement, VSquircleValue> = {
  /**
   * Called when the directive is first bound to the element.
   */
  mounted(el, binding) {
    applySquircle(el, binding);
  },

  /**
   * Called when the directive value changes.
   */
  updated(el, binding) {
    // Only update if value actually changed (deep comparison for objects)
    if (!valuesEqual(binding.value, binding.oldValue)) {
      applySquircle(el, binding);
    }
  },

  /**
   * Called when the element is unmounted from the DOM.
   */
  unmounted(el) {
    removeSquircle(el);
  },
};
