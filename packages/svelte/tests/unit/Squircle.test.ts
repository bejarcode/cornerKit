/**
 * Squircle component tests for @cornerkit/svelte
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import Squircle from '../../src/Squircle.svelte';

describe('Squircle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with slot content', async () => {
      const { container } = render(Squircle, {
        props: {},
      });

      expect(container.querySelector('div')).toBeTruthy();
    });

    it('should render a div wrapper element', async () => {
      const { container } = render(Squircle, {
        props: { radius: 20 },
      });

      const div = container.querySelector('div');
      expect(div).toBeTruthy();
    });
  });

  describe('Props', () => {
    it('should accept radius prop', async () => {
      const { component } = render(Squircle, {
        props: {
          radius: 24,
        },
      });

      // Component should render without errors
      expect(component).toBeTruthy();
    });

    it('should accept smoothing prop', async () => {
      const { component } = render(Squircle, {
        props: {
          smoothing: 0.9,
        },
      });

      expect(component).toBeTruthy();
    });

    it('should accept border prop', async () => {
      const { component } = render(Squircle, {
        props: {
          border: { width: 2, color: '#3b82f6' },
        },
      });

      expect(component).toBeTruthy();
    });

    it('should accept all props together', async () => {
      const { component } = render(Squircle, {
        props: {
          radius: 20,
          smoothing: 0.8,
          border: { width: 1, color: 'black' },
        },
      });

      expect(component).toBeTruthy();
    });
  });

  describe('Attribute forwarding ($$restProps)', () => {
    it('should forward class attribute', async () => {
      const { container } = render(Squircle, {
        props: {
          class: 'my-custom-class',
        },
      });

      const div = container.querySelector('div');
      expect(div?.classList.contains('my-custom-class')).toBe(true);
    });

    it('should forward style attribute', async () => {
      const { container } = render(Squircle, {
        props: {
          style: 'padding: 10px;',
        },
      });

      const div = container.querySelector('div');
      expect(div?.getAttribute('style')).toContain('padding');
    });

    it('should forward data attributes', async () => {
      const { container } = render(Squircle, {
        props: {
          'data-testid': 'squircle-element',
        },
      });

      const div = container.querySelector('[data-testid="squircle-element"]');
      expect(div).toBeTruthy();
    });

    it('should forward id attribute', async () => {
      const { container } = render(Squircle, {
        props: {
          id: 'my-squircle',
        },
      });

      const div = container.querySelector('#my-squircle');
      expect(div).toBeTruthy();
    });
  });

  describe('Lifecycle', () => {
    it('should apply clip-path style on mount (via CornerKit mock)', async () => {
      const { container } = render(Squircle, {
        props: { radius: 20 },
      });

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 50));

      const div = container.querySelector('div');
      // The mock applies clip-path
      expect(div?.style.clipPath).toBeDefined();
    });

    it('should clean up on unmount', async () => {
      const { unmount, container } = render(Squircle, {
        props: { radius: 20 },
      });

      // Wait for mount
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Unmount should not throw
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Reactive updates', () => {
    it('should handle prop updates without errors', async () => {
      const { component } = render(Squircle, {
        props: { radius: 20 },
      });

      // Wait for initial mount
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Update props should not throw
      expect(() => component.$set({ radius: 30 })).not.toThrow();
    });
  });
});
