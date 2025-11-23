import { afterEach, vi } from 'vitest';
import { config } from '@vue/test-utils';

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Configure Vue Test Utils
config.global.stubs = {};

// Mock @cornerkit/core for unit tests
vi.mock('@cornerkit/core', () => ({
  default: class MockCornerKit {
    private elements = new Map<HTMLElement, object>();

    apply(element: HTMLElement | string, config?: object) {
      const el = typeof element === 'string'
        ? document.querySelector(element) as HTMLElement
        : element;
      if (el) {
        this.elements.set(el, config || {});
        el.style.clipPath = 'path("M0,0")'; // Mock clip-path
      }
      return this;
    }

    update(element: HTMLElement | string, config?: object) {
      const el = typeof element === 'string'
        ? document.querySelector(element) as HTMLElement
        : element;
      if (el && this.elements.has(el)) {
        this.elements.set(el, { ...this.elements.get(el), ...config });
      }
      return this;
    }

    remove(element: HTMLElement | string) {
      const el = typeof element === 'string'
        ? document.querySelector(element) as HTMLElement
        : element;
      if (el) {
        this.elements.delete(el);
        el.style.clipPath = '';
      }
      return this;
    }

    destroy() {
      this.elements.forEach((_, el) => {
        el.style.clipPath = '';
      });
      this.elements.clear();
    }

    inspect(element: HTMLElement) {
      return this.elements.get(element) || null;
    }
  },
  DEFAULT_CONFIG: {
    radius: 20,
    smoothing: 0.8,
  },
  RendererTier: {
    NATIVE: 1,
    HOUDINI: 2,
    CLIPPATH: 3,
    FALLBACK: 4,
  },
}));
