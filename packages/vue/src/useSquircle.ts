/**
 * useSquircle Composable
 *
 * Vue 3 composable for imperatively applying squircle corners to elements.
 * Returns a ref to attach to the target DOM element plus control methods.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useSquircle } from '@cornerkit/vue';
 *
 * const { ref: cardRef, update, remove } = useSquircle({
 *   radius: 24,
 *   smoothing: 0.9
 * });
 * </script>
 *
 * <template>
 *   <div ref="cardRef">Content with squircle corners</div>
 * </template>
 * ```
 */

import {
  ref,
  shallowRef,
  watch,
  onMounted,
  onUnmounted,
  toValue,
  type MaybeRefOrGetter,
} from 'vue';
import type { UseSquircleOptions, UseSquircleReturn, SquircleOptions } from './types';

/**
 * Check if running in browser environment.
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Vue 3 composable for applying squircle corners to an element.
 *
 * @param options - Configuration options for the squircle (can be reactive)
 * @returns Object containing ref, update, and remove methods
 *
 * @example
 * ```vue
 * <script setup>
 * // Basic usage
 * const { ref: myRef } = useSquircle({ radius: 24 });
 *
 * // With reactive options
 * const radius = ref(20);
 * const { ref: cardRef } = useSquircle({ radius });
 *
 * // With border
 * const { ref: borderRef } = useSquircle({
 *   radius: 20,
 *   smoothing: 0.9,
 *   border: { width: 2, color: '#3b82f6' }
 * });
 * </script>
 * ```
 */
export function useSquircle(
  options?: MaybeRefOrGetter<UseSquircleOptions> | UseSquircleOptions
): UseSquircleReturn {
  const elementRef = ref<HTMLElement | null>(null);
  const instanceRef = shallowRef<import('@cornerkit/core').default | null>(null);
  const currentOptionsRef = shallowRef<SquircleOptions>({});

  // Track if composable is still active (for async cleanup)
  let isActive = true;

  /**
   * Build CornerKit config from options.
   */
  function buildConfig(opts: UseSquircleOptions = {}): object {
    return {
      radius: opts.radius,
      smoothing: opts.smoothing,
      ...(opts.border && {
        borderWidth: opts.border.width,
        borderColor: opts.border.color,
      }),
    };
  }

  /**
   * Apply or update squircle effect.
   */
  async function applySquircle(): Promise<void> {
    if (!isBrowser() || !isActive) return;

    const element = elementRef.value;
    if (!element) return;

    try {
      const CornerKit = (await import('@cornerkit/core')).default;

      // Check if still active after async import
      if (!isActive) return;

      const opts = toValue(options) || {};
      const config = buildConfig(opts);

      if (!instanceRef.value) {
        instanceRef.value = new CornerKit();
        instanceRef.value.apply(element, config);
      } else {
        instanceRef.value.update(element, config);
      }

      currentOptionsRef.value = { ...opts };
    } catch {
      // Silently handle import errors in SSR environments
    }
  }

  /**
   * Manually update squircle options.
   */
  function update(newOptions: Partial<SquircleOptions>): void {
    if (!isBrowser() || !instanceRef.value || !elementRef.value) return;

    const merged = { ...currentOptionsRef.value, ...newOptions };
    const config = buildConfig(merged);
    instanceRef.value.update(elementRef.value, config);
    currentOptionsRef.value = merged;
  }

  /**
   * Manually remove the squircle effect.
   */
  function remove(): void {
    if (!instanceRef.value || !elementRef.value) return;

    instanceRef.value.remove(elementRef.value);
  }

  // Apply squircle when component mounts
  onMounted(() => {
    applySquircle();
  });

  // Watch for option changes (handles reactive options)
  watch(
    () => {
      const opts = toValue(options) || {};
      // Return a new object to trigger watch when values change
      return {
        radius: opts.radius,
        smoothing: opts.smoothing,
        borderWidth: opts.border?.width,
        borderColor: opts.border?.color,
      };
    },
    (newVal, oldVal) => {
      // Only update if there's an actual change and we have an instance
      if (elementRef.value && instanceRef.value) {
        const hasChanged =
          newVal.radius !== oldVal?.radius ||
          newVal.smoothing !== oldVal?.smoothing ||
          newVal.borderWidth !== oldVal?.borderWidth ||
          newVal.borderColor !== oldVal?.borderColor;

        if (hasChanged) {
          applySquircle();
        }
      }
    }
  );

  // Watch for element ref changes
  watch(elementRef, (newEl, oldEl) => {
    if (oldEl && instanceRef.value) {
      instanceRef.value.remove(oldEl);
    }
    if (newEl && instanceRef.value) {
      // Only re-apply if we already have an instance (post-mount)
      applySquircle();
    }
  });

  // Cleanup on unmount
  onUnmounted(() => {
    isActive = false;
    if (instanceRef.value && elementRef.value) {
      instanceRef.value.remove(elementRef.value);
    }
    instanceRef.value = null;
  });

  return {
    ref: elementRef,
    update,
    remove,
  };
}
