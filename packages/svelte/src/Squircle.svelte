<script lang="ts">
  /**
   * <Squircle> Component
   *
   * A Svelte component that applies iOS-style squircle corners to its children.
   * Wraps content in a div with squircle styling applied.
   *
   * @example
   * ```svelte
   * <Squircle radius={20} smoothing={0.8}>
   *   <button>Click me</button>
   * </Squircle>
   * ```
   */

  import { onMount, onDestroy } from 'svelte';
  import type { SquircleBorderConfig } from './types';
  import { isBrowser, buildConfig, optionsEqual } from './utils';

  // Props
  /**
   * Corner radius in pixels.
   * @default 20
   */
  export let radius: number | undefined = undefined;

  /**
   * Curve smoothness from 0.0 to 1.0.
   * @default 0.8
   */
  export let smoothing: number | undefined = undefined;

  /**
   * Optional border configuration.
   */
  export let border: SquircleBorderConfig | undefined = undefined;

  // Internal state
  let element: HTMLDivElement;
  let ck: import('@cornerkit/core').default | null = null;
  let mounted = false;
  let lastAppliedOptions: { radius?: number; smoothing?: number; border?: SquircleBorderConfig } | null = null;

  /**
   * Apply squircle effect to element.
   */
  async function applySquircle(newRadius?: number, newSmoothing?: number, newBorder?: SquircleBorderConfig): Promise<void> {
    if (!isBrowser() || !element) return;

    const options = { radius: newRadius, smoothing: newSmoothing, border: newBorder };

    // Skip if options haven't changed
    if (lastAppliedOptions && optionsEqual(options, lastAppliedOptions)) {
      return;
    }

    try {
      const CornerKit = (await import('@cornerkit/core')).default;
      const config = buildConfig(options);

      if (!ck) {
        ck = new CornerKit();
        ck.apply(element, config);
      } else {
        ck.update(element, config);
      }

      lastAppliedOptions = options;
    } catch (error) {
      // Log errors in development (Vite injects import.meta.env)
      if (import.meta.env?.DEV) {
        console.warn('[@cornerkit/svelte] Failed to apply squircle:', error);
      }
    }
  }

  /**
   * Remove squircle effect from element.
   */
  function removeSquircle(): void {
    if (ck && element) {
      ck.remove(element);
      ck = null;
      lastAppliedOptions = null;
    }
  }

  // Lifecycle
  onMount(() => {
    mounted = true;
    applySquircle(radius, smoothing, border);
  });

  onDestroy(() => {
    removeSquircle();
    mounted = false;
  });

  // Reactive updates when props change - explicitly reference props for Svelte reactivity
  $: if (mounted && element) {
    // Reference props directly so Svelte tracks them as dependencies
    applySquircle(radius, smoothing, border);
  }
</script>

<div bind:this={element} {...$$restProps}>
  <slot />
</div>
