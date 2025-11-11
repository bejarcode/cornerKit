/**
 * Type declarations for integration test globals
 */

import type CornerKit from '../../src/index';

declare global {
  interface Window {
    CornerKit: typeof CornerKit;
    ck: InstanceType<typeof CornerKit>;
    cornerKitReady: boolean;
  }
}

export {};
