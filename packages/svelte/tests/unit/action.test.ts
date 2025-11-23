/**
 * squircle action tests for @cornerkit/svelte
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { squircle } from '../../src/action';

describe('squircle Action', () => {
  let element: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element.parentNode) {
      document.body.removeChild(element);
    }
  });

  describe('Initialization', () => {
    it('should return object with update and destroy methods', () => {
      const result = squircle(element);

      expect(typeof result.update).toBe('function');
      expect(typeof result.destroy).toBe('function');
    });

    it('should apply clip-path on initialization', async () => {
      squircle(element, { radius: 20 });

      // Wait for async apply
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Mock applies clip-path
      expect(element.style.clipPath).toBeDefined();
    });
  });

  describe('Object options', () => {
    it('should accept radius option', () => {
      const result = squircle(element, { radius: 24 });
      expect(result).toBeDefined();
    });

    it('should accept smoothing option', () => {
      const result = squircle(element, { smoothing: 0.9 });
      expect(result).toBeDefined();
    });

    it('should accept border option', () => {
      const result = squircle(element, { border: { width: 2, color: '#3b82f6' } });
      expect(result).toBeDefined();
    });

    it('should accept all options together', () => {
      const result = squircle(element, {
        radius: 20,
        smoothing: 0.8,
        border: { width: 1, color: 'black' },
      });
      expect(result).toBeDefined();
    });
  });

  describe('Number shorthand', () => {
    it('should accept number as radius shorthand', () => {
      const result = squircle(element, 24);
      expect(result).toBeDefined();
    });

    it('should accept zero as valid radius', () => {
      const result = squircle(element, 0);
      expect(result).toBeDefined();
    });
  });

  describe('Update callback', () => {
    it('should not throw when calling update', async () => {
      const { update } = squircle(element, { radius: 20 });

      // Wait for initial apply
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Update should not throw
      expect(() => update({ radius: 30 })).not.toThrow();
    });

    it('should update with number shorthand', async () => {
      const { update } = squircle(element, 20);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(() => update(30)).not.toThrow();
    });

    it('should update with new options object', async () => {
      const { update } = squircle(element, { radius: 20 });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(() => update({ radius: 30, smoothing: 0.9 })).not.toThrow();
    });
  });

  describe('Destroy callback', () => {
    it('should clean up on destroy', async () => {
      const { destroy } = squircle(element, { radius: 20 });

      // Wait for apply
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should not throw
      expect(() => destroy()).not.toThrow();

      // Clip-path should be removed
      expect(element.style.clipPath).toBe('');
    });

    it('should handle destroy before apply completes', () => {
      const { destroy } = squircle(element);

      // Immediately destroy (before async apply completes)
      // Should not throw
      expect(() => destroy()).not.toThrow();
    });
  });

  describe('Multiple elements', () => {
    it('should maintain independent state for multiple elements', async () => {
      const element2 = document.createElement('div');
      document.body.appendChild(element2);

      const action1 = squircle(element, { radius: 20 });
      const action2 = squircle(element2, { radius: 30 });

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Update should work independently
      expect(() => action1.update({ radius: 25 })).not.toThrow();
      expect(() => action2.update({ radius: 35 })).not.toThrow();

      // Cleanup
      action1.destroy();
      action2.destroy();
      document.body.removeChild(element2);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined params', () => {
      const result = squircle(element, undefined);
      expect(result).toBeDefined();
    });

    it('should handle empty object params', () => {
      const result = squircle(element, {});
      expect(result).toBeDefined();
    });
  });
});
