/**
 * @cornerkit/vue
 *
 * Vue 3 components, composables, and directives for iOS-style squircle corners.
 * A thin wrapper around @cornerkit/core with full TypeScript support.
 *
 * @packageDocumentation
 */

// Components
export { default as Squircle } from './Squircle.vue';

// Composables
export { useSquircle } from './useSquircle';

// Directives
export { vSquircle } from './directive';

// Types
export type {
  SquircleProps,
  SquircleExpose,
  SquircleOptions,
  SquircleBorderConfig,
  UseSquircleOptions,
  UseSquircleReturn,
  VSquircleValue,
  VSquircleDirective,
} from './types';

// Re-exports from @cornerkit/core for convenience
export { DEFAULT_CONFIG, RendererTier } from '@cornerkit/core';
export type { SquircleConfig, ManagedElementInfo } from '@cornerkit/core';
