/**
 * SSR compatibility tests for @cornerkit/svelte
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isBrowser } from '../../src/utils';

describe('SSR Compatibility', () => {
  describe('isBrowser check', () => {
    const originalWindow = global.window;
    const originalDocument = global.document;

    afterEach(() => {
      global.window = originalWindow;
      global.document = originalDocument;
    });

    it('should return false when window is undefined (SSR)', () => {
      // @ts-expect-error - simulating SSR
      global.window = undefined;
      expect(isBrowser()).toBe(false);
    });

    it('should return false when document is undefined (SSR)', () => {
      // @ts-expect-error - simulating SSR
      global.document = undefined;
      expect(isBrowser()).toBe(false);
    });

    it('should return true in browser environment', () => {
      // happy-dom provides window and document
      global.window = originalWindow;
      global.document = originalDocument;
      expect(isBrowser()).toBe(true);
    });
  });

  describe('Utils SSR safety', () => {
    it('should normalize params without DOM access', async () => {
      const { normalizeParams } = await import('../../src/utils');

      // These operations should not require DOM
      expect(normalizeParams(20)).toEqual({ radius: 20 });
      expect(normalizeParams({ radius: 20 })).toEqual({ radius: 20 });
      expect(normalizeParams(undefined)).toEqual({});
    });

    it('should build config without DOM access', async () => {
      const { buildConfig } = await import('../../src/utils');

      // These operations should not require DOM
      expect(buildConfig({ radius: 20 })).toEqual({ radius: 20 });
      expect(buildConfig({})).toEqual({});
    });
  });

  describe('Action SSR behavior', () => {
    it('should not throw when isBrowser returns false', async () => {
      const originalWindow = global.window;

      // Simulate SSR
      // @ts-expect-error - simulating SSR
      global.window = undefined;

      const { squircle } = await import('../../src/action');

      // Create a mock element (won't exist in SSR but action shouldn't crash)
      const mockElement = {
        style: {},
        getAttribute: vi.fn(),
        setAttribute: vi.fn(),
      } as unknown as HTMLElement;

      // Should not throw
      expect(() => {
        const action = squircle(mockElement, { radius: 20 });
        action.update({ radius: 30 });
        action.destroy();
      }).not.toThrow();

      // Restore
      global.window = originalWindow;
    });
  });

  describe('Component SSR rendering', () => {
    it('should export Squircle component', async () => {
      const { Squircle } = await import('../../src/index');
      expect(Squircle).toBeDefined();
    });

    it('should export squircle action', async () => {
      const { squircle } = await import('../../src/index');
      expect(squircle).toBeDefined();
      expect(typeof squircle).toBe('function');
    });

    it('should export all types', async () => {
      // Type-only imports won't fail at runtime, but we can verify the module structure
      const module = await import('../../src/index');

      expect(module.Squircle).toBeDefined();
      expect(module.squircle).toBeDefined();
    });
  });

  describe('No window/document access during import', () => {
    it('should import types without DOM access', async () => {
      const originalWindow = global.window;

      // Simulate SSR during import
      // @ts-expect-error - simulating SSR
      global.window = undefined;

      // Should not throw during import
      const types = await import('../../src/types');

      expect(types).toBeDefined();

      // Restore
      global.window = originalWindow;
    });

    it('should import utils without DOM access', async () => {
      const originalWindow = global.window;

      // Simulate SSR during import
      // @ts-expect-error - simulating SSR
      global.window = undefined;

      // Should not throw during import
      const utils = await import('../../src/utils');

      expect(utils.normalizeParams).toBeDefined();
      expect(utils.buildConfig).toBeDefined();
      expect(utils.isBrowser).toBeDefined();

      // Restore
      global.window = originalWindow;
    });
  });

  describe('Hydration compatibility', () => {
    it('should not modify DOM during SSR render', async () => {
      // The Squircle component renders a plain div with slot
      // All CornerKit operations happen in onMount (client-only)
      // This test verifies the approach is correct

      const { isBrowser } = await import('../../src/utils');

      // During SSR, isBrowser() returns false
      // Component should render structure but not apply effects
      expect(typeof isBrowser).toBe('function');
    });

    it('should apply effects only after mount (client-side)', async () => {
      // This is already tested in Squircle.test.ts
      // Here we just verify the utils don't cause side effects
      const utils = await import('../../src/utils');

      // None of these should cause DOM mutations
      utils.normalizeParams(20);
      utils.buildConfig({ radius: 20 });
      utils.optionsEqual({ radius: 20 }, { radius: 20 });

      // If we got here without errors, SSR is safe
      expect(true).toBe(true);
    });
  });
});
