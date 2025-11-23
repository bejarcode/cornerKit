/**
 * @cornerkit/svelte
 *
 * Svelte components and actions for iOS-style squircle corners.
 *
 * @example
 * ```svelte
 * <script>
 *   import { Squircle, squircle } from '@cornerkit/svelte';
 * </script>
 *
 * <!-- Component usage -->
 * <Squircle radius={20} smoothing={0.8}>
 *   <button>Click me</button>
 * </Squircle>
 *
 * <!-- Action usage -->
 * <div use:squircle={{ radius: 20 }}>Content</div>
 *
 * <!-- Action shorthand -->
 * <div use:squircle={24}>Content</div>
 * ```
 *
 * @packageDocumentation
 */

// Component
export { default as Squircle } from './Squircle.svelte';

// Action
export { squircle } from './action';

// Types
export type {
  SquircleOptions,
  SquircleProps,
  SquircleActionOptions,
  SquircleActionReturn,
  SquircleAction,
  SquircleBorderConfig,
} from './types';
