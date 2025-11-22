/**
 * @cornerkit/react
 *
 * React components and hooks for iOS-style squircle corners.
 * A thin wrapper around @cornerkit/core with full TypeScript support.
 *
 * @packageDocumentation
 */

// Components
export { Squircle } from './Squircle';

// Hooks
export { useSquircle } from './useSquircle';

// Types
export type {
  SquircleProps,
  UseSquircleOptions,
  UseSquircleReturn,
  SquircleBorderConfig,
} from './types';

// Re-exports from @cornerkit/core for convenience
export { DEFAULT_CONFIG, RendererTier } from '@cornerkit/core';
export type { SquircleConfig, ManagedElementInfo } from '@cornerkit/core';
