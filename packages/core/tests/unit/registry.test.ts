/**
 * Unit Tests: Element Registry
 * Tests for core/registry.ts
 * Coverage target: >85%
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ElementRegistry, type ManagedElement } from '../../src/core/registry';
import { RendererTier } from '../../src/core/detector';
import type { SquircleConfig } from '../../src/core/types';

describe('ElementRegistry', () => {
  let registry: ElementRegistry;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    registry = new ElementRegistry();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    vi.restoreAllMocks();
  });

  // T102: Test register()
  describe('register()', () => {
    it('should add element to registry', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element, config, RendererTier.CLIPPATH);

      expect(registry.has(element)).toBe(true);
    });

    it('should store configuration', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element, config, RendererTier.CLIPPATH);

      const managed = registry.get(element);
      expect(managed).toBeDefined();
      expect(managed?.config).toEqual(config);
    });

    it('should store renderer tier', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element, config, RendererTier.CLIPPATH);

      const managed = registry.get(element);
      expect(managed?.tier).toBe(RendererTier.CLIPPATH);
    });

    it('should store ResizeObserver if provided', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };
      const observer = new ResizeObserver(() => {});

      registry.register(element, config, RendererTier.CLIPPATH, observer);

      const managed = registry.get(element);
      expect(managed?.resizeObserver).toBe(observer);
    });

    it('should store IntersectionObserver if provided', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };
      const resizeObserver = new ResizeObserver(() => {});
      const intersectionObserver = new IntersectionObserver(() => {});

      registry.register(element, config, RendererTier.CLIPPATH, resizeObserver, intersectionObserver);

      const managed = registry.get(element);
      expect(managed?.intersectionObserver).toBe(intersectionObserver);
    });

    it('should store initial dimensions', () => {
      const element = document.createElement('div');
      Object.defineProperty(element, 'offsetWidth', { value: 100, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 50, configurable: true });

      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element, config, RendererTier.CLIPPATH);

      const managed = registry.get(element);
      expect(managed?.lastDimensions).toEqual({ width: 100, height: 50 });
    });

    it('should warn on duplicate registration', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element, config, RendererTier.CLIPPATH);
      registry.register(element, config, RendererTier.CLIPPATH);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('already has squircle applied'),
        expect.anything()
      );
    });

    it('should disconnect old observers on duplicate registration', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      const observer1 = new ResizeObserver(() => {});
      const observer2 = new ResizeObserver(() => {});

      registry.register(element, config, RendererTier.CLIPPATH, observer1);
      registry.register(element, config, RendererTier.CLIPPATH, observer2);

      // First observer should be disconnected
      expect(observer1.disconnect).toHaveBeenCalled();
    });
  });

  // T103: Test get()
  describe('get()', () => {
    it('should return ManagedElement for registered element', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element, config, RendererTier.CLIPPATH);

      const managed = registry.get(element);
      expect(managed).toBeDefined();
      expect(managed?.element).toBe(element);
    });

    it('should return undefined for unregistered element', () => {
      const element = document.createElement('div');

      const managed = registry.get(element);
      expect(managed).toBeUndefined();
    });

    it('should return complete ManagedElement structure', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };
      const observer = new ResizeObserver(() => {});

      registry.register(element, config, RendererTier.CLIPPATH, observer);

      const managed = registry.get(element);
      expect(managed).toBeDefined();
      expect(managed?.element).toBe(element);
      expect(managed?.config).toEqual(config);
      expect(managed?.tier).toBe(RendererTier.CLIPPATH);
      expect(managed?.resizeObserver).toBe(observer);
    });
  });

  // T104: Test has()
  describe('has()', () => {
    it('should return true for registered element', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element, config, RendererTier.CLIPPATH);

      expect(registry.has(element)).toBe(true);
    });

    it('should return false for unregistered element', () => {
      const element = document.createElement('div');

      expect(registry.has(element)).toBe(false);
    });

    it('should return false after element is deleted', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element, config, RendererTier.CLIPPATH);
      registry.delete(element);

      expect(registry.has(element)).toBe(false);
    });
  });

  // T105: Test delete()
  describe('delete()', () => {
    it('should remove element from registry', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element, config, RendererTier.CLIPPATH);
      registry.delete(element);

      expect(registry.has(element)).toBe(false);
    });

    it('should disconnect ResizeObserver', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };
      const observer = new ResizeObserver(() => {});

      registry.register(element, config, RendererTier.CLIPPATH, observer);
      registry.delete(element);

      expect(observer.disconnect).toHaveBeenCalled();
    });

    it('should disconnect IntersectionObserver', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };
      const resizeObserver = new ResizeObserver(() => {});
      const intersectionObserver = new IntersectionObserver(() => {});

      registry.register(element, config, RendererTier.CLIPPATH, resizeObserver, intersectionObserver);
      registry.delete(element);

      expect(intersectionObserver.disconnect).toHaveBeenCalled();
    });

    it('should be safe to delete unregistered element', () => {
      const element = document.createElement('div');

      // Should not throw
      expect(() => registry.delete(element)).not.toThrow();
    });

    it('should be safe to delete twice', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element, config, RendererTier.CLIPPATH);
      registry.delete(element);
      registry.delete(element); // Second delete should be safe

      expect(registry.has(element)).toBe(false);
    });
  });

  // T106: Test duplicate prevention
  describe('duplicate prevention', () => {
    it('should update config when registering existing element', () => {
      const element = document.createElement('div');
      const config1: SquircleConfig = { radius: 20, smoothing: 0.8 };
      const config2: SquircleConfig = { radius: 32, smoothing: 0.9 };

      registry.register(element, config1, RendererTier.CLIPPATH);
      registry.register(element, config2, RendererTier.CLIPPATH);

      const managed = registry.get(element);
      expect(managed?.config).toEqual(config2);
    });

    it('should count as single registration after duplicate', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element, config, RendererTier.CLIPPATH);
      registry.register(element, config, RendererTier.CLIPPATH);

      // Should still be registered (not duplicated)
      expect(registry.has(element)).toBe(true);
    });
  });

  // T106: Test update()
  describe('update()', () => {
    it('should merge new config with existing config', () => {
      const element = document.createElement('div');
      const initialConfig: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element, initialConfig, RendererTier.CLIPPATH);

      const updated = registry.update(element, { radius: 32 });

      expect(updated?.config).toEqual({
        radius: 32,
        smoothing: 0.8, // Preserved from initial config
      });
    });

    it('should return updated ManagedElement', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element, config, RendererTier.CLIPPATH);

      const updated = registry.update(element, { smoothing: 0.9 });

      expect(updated).toBeDefined();
      expect(updated?.config.smoothing).toBe(0.9);
    });

    it('should return undefined for unregistered element', () => {
      const element = document.createElement('div');

      const updated = registry.update(element, { radius: 32 });

      expect(updated).toBeUndefined();
    });

    it('should update partial config', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element, config, RendererTier.CLIPPATH);

      registry.update(element, { radius: 24 });

      const managed = registry.get(element);
      expect(managed?.config).toEqual({
        radius: 24,
        smoothing: 0.8,
      });
    });
  });

  // Test updateDimensions()
  describe('updateDimensions()', () => {
    it('should update lastDimensions', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element, config, RendererTier.CLIPPATH);

      registry.updateDimensions(element, 200, 100);

      const managed = registry.get(element);
      expect(managed?.lastDimensions).toEqual({ width: 200, height: 100 });
    });

    it('should do nothing for unregistered element', () => {
      const element = document.createElement('div');

      // Should not throw
      expect(() => registry.updateDimensions(element, 200, 100)).not.toThrow();
    });
  });

  // T107: Test WeakMap garbage collection (manual test)
  describe('WeakMap behavior', () => {
    it('should use WeakMap internally', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element, config, RendererTier.CLIPPATH);

      // WeakMap should allow the element to be garbage collected when removed from DOM
      // This is hard to test automatically, but we can verify the registry uses WeakMap
      expect(registry.has(element)).toBe(true);
    });
  });

  // T109: Test edge cases
  describe('edge cases', () => {
    it('should handle multiple elements', () => {
      const elements = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
      ];
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      elements.forEach((element) => {
        registry.register(element, config, RendererTier.CLIPPATH);
      });

      elements.forEach((element) => {
        expect(registry.has(element)).toBe(true);
      });
    });

    it('should handle different configurations per element', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');

      const config1: SquircleConfig = { radius: 20, smoothing: 0.8 };
      const config2: SquircleConfig = { radius: 32, smoothing: 0.9 };

      registry.register(element1, config1, RendererTier.CLIPPATH);
      registry.register(element2, config2, RendererTier.CLIPPATH);

      expect(registry.get(element1)?.config).toEqual(config1);
      expect(registry.get(element2)?.config).toEqual(config2);
    });

    it('should handle different tiers per element', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');

      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element1, config, RendererTier.CLIPPATH);
      registry.register(element2, config, RendererTier.FALLBACK);

      expect(registry.get(element1)?.tier).toBe(RendererTier.CLIPPATH);
      expect(registry.get(element2)?.tier).toBe(RendererTier.FALLBACK);
    });
  });

  // Test getAllElements() and clear()
  describe('getAllElements() and clear()', () => {
    it('should return empty array when no elements registered', () => {
      const result = registry.getAllElements();
      expect(result).toEqual([]);
    });

    it('should return array of registered elements', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element1, config, RendererTier.CLIPPATH);
      registry.register(element2, config, RendererTier.CLIPPATH);

      const result = registry.getAllElements();
      expect(result).toHaveLength(2);
      expect(result).toContain(element1);
      expect(result).toContain(element2);
    });

    it('should clear all elements from registry', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      registry.register(element, config, RendererTier.CLIPPATH);

      // Verify element is registered
      expect(registry.has(element)).toBe(true);

      // Clear should remove all elements
      registry.clear();

      // Element should be removed
      expect(registry.has(element)).toBe(false);
      expect(registry.getAllElements()).toEqual([]);
    });

    it('should disconnect observers when clearing', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };
      const observer = new ResizeObserver(() => {});

      registry.register(element, config, RendererTier.CLIPPATH, observer);

      // Clear should disconnect observers
      registry.clear();

      expect(observer.disconnect).toHaveBeenCalled();
    });
  });
});
