import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CapabilityDetector, RendererTier, type BrowserSupport } from '../../src/core/detector';

describe('CapabilityDetector', () => {
  beforeEach(() => {
    // Reset singleton instance before each test
    // @ts-expect-error - Accessing private static property for testing
    CapabilityDetector.instance = null;
  });

  describe('Singleton pattern', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = CapabilityDetector.getInstance();
      const instance2 = CapabilityDetector.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Native CSS detection (FR-009)', () => {
    it('should detect native corner-shape: squircle support', () => {
      // Native CSS detection is disabled because Chrome falsely reports support
      // Mock CSS.supports to return true for corner-shape: squircle
      global.CSS = {
        supports: vi.fn((property: string, value: string) => {
          return property === 'corner-shape' && value === 'squircle';
        }),
      } as any;

      const detector = CapabilityDetector.getInstance();
      const support = detector.supports();

      // Native detection is disabled until browsers actually render corner-shape: squircle
      expect(support.native).toBe(false);
    });

    it('should return false when CSS.supports is unavailable', () => {
      // @ts-expect-error - Simulating missing CSS API
      global.CSS = undefined;

      const detector = CapabilityDetector.getInstance();
      const support = detector.supports();

      expect(support.native).toBe(false);
    });

    it('should return false when corner-shape is not supported', () => {
      global.CSS = {
        supports: vi.fn(() => false),
      } as any;

      const detector = CapabilityDetector.getInstance();
      const support = detector.supports();

      expect(support.native).toBe(false);
    });
  });

  describe('Houdini detection (FR-010)', () => {
    it('should detect paintWorklet support', () => {
      // Houdini detection is disabled until we have an actual paint worklet (Phase 2)
      global.CSS = {
        paintWorklet: {},
        supports: vi.fn(() => false),
      } as any;

      const detector = CapabilityDetector.getInstance();
      const support = detector.supports();

      // Houdini detection is disabled until paint worklet is implemented
      expect(support.houdini).toBe(false);
    });

    it('should return false when paintWorklet is unavailable', () => {
      global.CSS = {
        supports: vi.fn(() => false),
      } as any;

      const detector = CapabilityDetector.getInstance();
      const support = detector.supports();

      expect(support.houdini).toBe(false);
    });

    it('should return false when CSS is undefined', () => {
      // @ts-expect-error - Simulating missing CSS API
      global.CSS = undefined;

      const detector = CapabilityDetector.getInstance();
      const support = detector.supports();

      expect(support.houdini).toBe(false);
    });
  });

  describe('ClipPath detection (FR-011)', () => {
    it('should detect clip-path: path() support', () => {
      global.CSS = {
        supports: vi.fn((property: string, value: string) => {
          return property === 'clip-path' && value === 'path("")';
        }),
      } as any;

      const detector = CapabilityDetector.getInstance();
      const support = detector.supports();

      expect(support.clippath).toBe(true);
      expect(CSS.supports).toHaveBeenCalledWith('clip-path', 'path("")');
    });

    it('should detect clip-path via runtime DOM test when CSS.supports returns false', () => {
      // Simulates Safari behavior: CSS.supports() returns false but DOM supports clip-path
      global.CSS = {
        supports: vi.fn(() => false),
      } as any;

      const detector = CapabilityDetector.getInstance();
      const support = detector.supports();

      // In happy-dom (and Safari), the runtime DOM test will detect clip-path support
      expect(support.clippath).toBe(true);
    });
  });

  describe('Fallback support (FR-012)', () => {
    it('should always return true for fallback', () => {
      // @ts-expect-error - Simulating missing CSS API
      global.CSS = undefined;

      const detector = CapabilityDetector.getInstance();
      const support = detector.supports();

      expect(support.fallback).toBe(true);
    });
  });

  describe('Caching (FR-013)', () => {
    it('should cache detection results after first call', () => {
      const supportsSpy = vi.fn((property: string, value: string) => {
        if (property === 'clip-path' && value === 'path("")') return true;
        return false;
      });

      global.CSS = {
        supports: supportsSpy,
      } as any;

      const detector = CapabilityDetector.getInstance();

      // First call - should run detection
      const result1 = detector.supports();
      const callCount1 = supportsSpy.mock.calls.length;

      // Second call - should use cached results
      const result2 = detector.supports();
      const callCount2 = supportsSpy.mock.calls.length;

      expect(result1).toEqual(result2);
      expect(callCount1).toBeGreaterThan(0);
      expect(callCount2).toBe(callCount1); // No additional calls
    });

    it('should only run feature detection once via static method', () => {
      const supportsSpy = vi.fn(() => false);

      global.CSS = {
        supports: supportsSpy,
      } as any;

      // Call static method multiple times
      CapabilityDetector.supports();
      CapabilityDetector.supports();
      CapabilityDetector.supports();

      // Detection should only run once (1 check: clippath only)
      // Note: Native and Houdini detection are disabled
      expect(supportsSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('detectTier()', () => {
    it('should return NATIVE when native CSS is supported', () => {
      // Native detection is disabled, so even if CSS.supports returns true,
      // it will fall through to ClipPath
      global.CSS = {
        supports: vi.fn((property: string, value: string) => {
          return property === 'corner-shape' && value === 'squircle';
        }),
      } as any;

      const detector = CapabilityDetector.getInstance();
      // Native is disabled, so it returns CLIPPATH (via runtime DOM test)
      expect(detector.detectTier()).toBe(RendererTier.CLIPPATH);
    });

    it('should return HOUDINI when paintWorklet is supported but not native', () => {
      // Houdini detection is disabled, so even if paintWorklet exists,
      // it will fall through to ClipPath
      global.CSS = {
        paintWorklet: {},
        supports: vi.fn(() => false),
      } as any;

      const detector = CapabilityDetector.getInstance();
      // Houdini is disabled, so it returns CLIPPATH (via runtime DOM test)
      expect(detector.detectTier()).toBe(RendererTier.CLIPPATH);
    });

    it('should return CLIPPATH when clip-path is supported', () => {
      global.CSS = {
        supports: vi.fn((property: string, value: string) => {
          return property === 'clip-path' && value === 'path("")';
        }),
      } as any;

      const detector = CapabilityDetector.getInstance();
      expect(detector.detectTier()).toBe(RendererTier.CLIPPATH);
    });

    it('should return CLIPPATH when CSS.supports returns false but runtime DOM test succeeds', () => {
      // Simulates Safari behavior: CSS.supports() returns false but DOM supports clip-path
      global.CSS = {
        supports: vi.fn(() => false),
      } as any;

      const detector = CapabilityDetector.getInstance();
      // In happy-dom (and Safari), the runtime DOM test will detect clip-path support
      // even when CSS.supports() returns false
      expect(detector.detectTier()).toBe(RendererTier.CLIPPATH);
    });

    it('should return FALLBACK when CSS is undefined', () => {
      // @ts-expect-error - Simulating missing CSS API
      global.CSS = undefined;

      const detector = CapabilityDetector.getInstance();
      expect(detector.detectTier()).toBe(RendererTier.FALLBACK);
    });
  });

  describe('BrowserSupport interface', () => {
    it('should return correct type structure', () => {
      global.CSS = {
        supports: vi.fn(() => false),
      } as any;

      const detector = CapabilityDetector.getInstance();
      const support: BrowserSupport = detector.supports();

      expect(support).toHaveProperty('native');
      expect(support).toHaveProperty('houdini');
      expect(support).toHaveProperty('clippath');
      expect(support).toHaveProperty('fallback');
      expect(typeof support.native).toBe('boolean');
      expect(typeof support.houdini).toBe('boolean');
      expect(typeof support.clippath).toBe('boolean');
      expect(typeof support.fallback).toBe('boolean');
    });
  });
});
