<script setup lang="ts">
/**
 * Squircle Component
 *
 * Declarative Vue 3 component for applying iOS-style squircle corners.
 * Supports polymorphic rendering via the `tag` prop.
 *
 * @example
 * ```vue
 * <!-- Basic usage -->
 * <Squircle :radius="24">Content</Squircle>
 *
 * <!-- As a button -->
 * <Squircle tag="button" :radius="16" @click="handleClick">
 *   Click me
 * </Squircle>
 *
 * <!-- With border -->
 * <Squircle
 *   :radius="20"
 *   :smoothing="0.9"
 *   :border="{ width: 2, color: '#3b82f6' }"
 * >
 *   Styled content
 * </Squircle>
 * ```
 */

import {
  ref,
  watch,
  onMounted,
  onUnmounted,
  onActivated,
  onDeactivated,
  useAttrs,
  type PropType,
} from 'vue';
import type { SquircleExpose, SquircleBorderConfig } from './types';

// Props definition using runtime declaration for build tool compatibility
const props = defineProps({
  /**
   * Corner radius in pixels.
   */
  radius: {
    type: Number as PropType<number>,
    default: undefined,
  },
  /**
   * Curve smoothness from 0.0 to 1.0.
   */
  smoothing: {
    type: Number as PropType<number>,
    default: undefined,
  },
  /**
   * Optional border configuration.
   */
  border: {
    type: Object as PropType<SquircleBorderConfig>,
    default: undefined,
  },
  /**
   * HTML element type to render.
   */
  tag: {
    type: String as PropType<keyof HTMLElementTagNameMap>,
    default: 'div',
  },
});

// Get $attrs for passthrough
const attrs = useAttrs();

// Internal element reference
const elementRef = ref<HTMLElement | null>(null);

// CornerKit instance
let instance: import('@cornerkit/core').default | null = null;

// Track if component is still active (for async cleanup)
let isActive = true;

/**
 * Check if running in browser environment.
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Build CornerKit config from props.
 */
function buildConfig(): object {
  return {
    radius: props.radius,
    smoothing: props.smoothing,
    ...(props.border && {
      borderWidth: props.border.width,
      borderColor: props.border.color,
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

    const config = buildConfig();

    if (!instance) {
      instance = new CornerKit();
      instance.apply(element, config);
    } else {
      instance.update(element, config);
    }
  } catch {
    // Silently handle import errors in SSR environments
  }
}

/**
 * Remove squircle effect.
 */
function removeSquircle(): void {
  if (instance && elementRef.value) {
    instance.remove(elementRef.value);
  }
}

// Apply squircle when component mounts
onMounted(() => {
  applySquircle();
});

// Watch for prop changes
watch(
  () => ({
    radius: props.radius,
    smoothing: props.smoothing,
    borderWidth: props.border?.width,
    borderColor: props.border?.color,
  }),
  () => {
    if (elementRef.value && instance) {
      applySquircle();
    }
  }
);

// Cleanup on unmount
onUnmounted(() => {
  isActive = false;
  removeSquircle();
  instance = null;
});

// KeepAlive support
onActivated(() => {
  applySquircle();
});

onDeactivated(() => {
  removeSquircle();
});

// Expose element to parent
defineExpose<SquircleExpose>({
  get el() {
    return elementRef.value;
  },
});

// Disable attribute inheritance (we handle it manually)
defineOptions({
  inheritAttrs: false,
});
</script>

<template>
  <component
    :is="tag"
    ref="elementRef"
    v-bind="attrs"
  >
    <slot />
  </component>
</template>
