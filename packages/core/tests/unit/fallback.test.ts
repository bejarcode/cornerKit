/**
 * Unit Tests: Fallback Renderer
 * Tests for renderers/fallback.ts
 * Coverage target: >85%
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FallbackRenderer } from '../../src/renderers/fallback';
import type { SquircleConfig } from '../../src/core/types';

describe('FallbackRenderer', () => {
  let renderer: FallbackRenderer;

  beforeEach(() => {
    renderer = new FallbackRenderer();
  });

  // T087: Test apply() - verify borderRadius is set
  describe('apply()', () => {
    it('should set border-radius style on element', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      renderer.apply(element, config);

      expect(element.style.borderRadius).toBe('20px');
    });

    it('should apply with different radius values', () => {
      const element = document.createElement('div');

      const configs: SquircleConfig[] = [
        { radius: 0, smoothing: 0.8 },
        { radius: 10, smoothing: 0.8 },
        { radius: 50, smoothing: 0.8 },
        { radius: 100, smoothing: 0.8 },
      ];

      configs.forEach((config) => {
        renderer.apply(element, config);
        expect(element.style.borderRadius).toBe(`${config.radius}px`);
      });
    });

    it('should ignore smoothing parameter', () => {
      const element = document.createElement('div');

      // Different smoothing values should produce same result
      const config1: SquircleConfig = { radius: 20, smoothing: 0 };
      const config2: SquircleConfig = { radius: 20, smoothing: 0.5 };
      const config3: SquircleConfig = { radius: 20, smoothing: 1 };

      renderer.apply(element, config1);
      const borderRadius1 = element.style.borderRadius;

      renderer.apply(element, config2);
      const borderRadius2 = element.style.borderRadius;

      renderer.apply(element, config3);
      const borderRadius3 = element.style.borderRadius;

      // All should be the same (smoothing is ignored)
      expect(borderRadius1).toBe('20px');
      expect(borderRadius2).toBe('20px');
      expect(borderRadius3).toBe('20px');
    });

    it('should work on detached elements', () => {
      const element = document.createElement('div');
      // Element not attached to DOM

      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      // Should not throw
      expect(() => renderer.apply(element, config)).not.toThrow();
      expect(element.style.borderRadius).toBe('20px');
    });
  });

  // T088: Test update() - verify borderRadius updates
  describe('update()', () => {
    it('should update border-radius with new radius', () => {
      const element = document.createElement('div');

      const config1: SquircleConfig = { radius: 20, smoothing: 0.8 };
      const config2: SquircleConfig = { radius: 32, smoothing: 0.9 };

      renderer.apply(element, config1);
      expect(element.style.borderRadius).toBe('20px');

      renderer.update(element, config2);
      expect(element.style.borderRadius).toBe('32px');
    });

    it('should work without prior apply', () => {
      const element = document.createElement('div');

      const config: SquircleConfig = { radius: 24, smoothing: 0.8 };

      // Should work even if apply() was never called
      renderer.update(element, config);
      expect(element.style.borderRadius).toBe('24px');
    });

    it('should handle zero radius', () => {
      const element = document.createElement('div');

      const config: SquircleConfig = { radius: 0, smoothing: 0.8 };

      renderer.update(element, config);
      expect(element.style.borderRadius).toBe('0px');
    });
  });

  // T089: Test remove() - verify borderRadius is reset
  describe('remove()', () => {
    it('should reset border-radius to empty string', () => {
      const element = document.createElement('div');

      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      renderer.apply(element, config);
      expect(element.style.borderRadius).not.toBe('');

      renderer.remove(element);
      expect(element.style.borderRadius).toBe('');
    });

    it('should work on element without border-radius', () => {
      const element = document.createElement('div');

      // Should not throw
      expect(() => renderer.remove(element)).not.toThrow();
      expect(element.style.borderRadius).toBe('');
    });

    it('should work multiple times', () => {
      const element = document.createElement('div');

      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      renderer.apply(element, config);
      renderer.remove(element);
      renderer.remove(element); // Second removal should be safe

      expect(element.style.borderRadius).toBe('');
    });
  });

  // T090: Test edge cases
  describe('edge cases', () => {
    it('should handle very large radius values', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 10000, smoothing: 0.8 };

      renderer.apply(element, config);
      expect(element.style.borderRadius).toBe('10000px');
    });

    it('should handle very small radius values', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 0.5, smoothing: 0.8 };

      renderer.apply(element, config);
      expect(element.style.borderRadius).toBe('0.5px');
    });

    it('should handle fractional radius values', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 12.5, smoothing: 0.8 };

      renderer.apply(element, config);
      expect(element.style.borderRadius).toBe('12.5px');
    });

    it('should overwrite existing border-radius', () => {
      const element = document.createElement('div');
      element.style.borderRadius = '10px';

      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      renderer.apply(element, config);
      expect(element.style.borderRadius).toBe('20px');
    });

    it('should not create observers (static rendering)', () => {
      const element = document.createElement('div');
      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      // Apply method should not return observer (unlike ClipPath renderer)
      const result = renderer.apply(element, config);
      expect(result).toBeUndefined();
    });
  });

  // Additional coverage tests
  describe('configuration variations', () => {
    it('should handle typical iOS button radius (12-24px)', () => {
      const element = document.createElement('div');

      const iosRadii = [12, 16, 20, 24];

      iosRadii.forEach((radius) => {
        const config: SquircleConfig = { radius, smoothing: 0.8 };
        renderer.apply(element, config);
        expect(element.style.borderRadius).toBe(`${radius}px`);
      });
    });

    it('should handle typical card radius (8-16px)', () => {
      const element = document.createElement('div');

      const cardRadii = [8, 12, 16];

      cardRadii.forEach((radius) => {
        const config: SquircleConfig = { radius, smoothing: 0.8 };
        renderer.apply(element, config);
        expect(element.style.borderRadius).toBe(`${radius}px`);
      });
    });
  });

  // Integration-style tests
  describe('realistic usage patterns', () => {
    it('should support apply -> update -> remove workflow', () => {
      const element = document.createElement('div');

      // Apply
      renderer.apply(element, { radius: 20, smoothing: 0.8 });
      expect(element.style.borderRadius).toBe('20px');

      // Update
      renderer.update(element, { radius: 24, smoothing: 0.9 });
      expect(element.style.borderRadius).toBe('24px');

      // Remove
      renderer.remove(element);
      expect(element.style.borderRadius).toBe('');
    });

    it('should support multiple apply calls (idempotent update)', () => {
      const element = document.createElement('div');

      renderer.apply(element, { radius: 20, smoothing: 0.8 });
      renderer.apply(element, { radius: 20, smoothing: 0.8 });
      renderer.apply(element, { radius: 20, smoothing: 0.8 });

      expect(element.style.borderRadius).toBe('20px');
    });

    it('should support batch application to multiple elements', () => {
      const elements = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
      ];

      const config: SquircleConfig = { radius: 20, smoothing: 0.8 };

      elements.forEach((element) => {
        renderer.apply(element, config);
        expect(element.style.borderRadius).toBe('20px');
      });
    });
  });
});
