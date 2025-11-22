import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isBrowser, isServer, canUseDOM } from '../../src/utils/ssr';

describe('SSR Detection Utilities', () => {
  const originalWindow = global.window;
  const originalDocument = global.document;

  describe('isBrowser', () => {
    it('returns true when window and document are defined', () => {
      expect(isBrowser()).toBe(true);
    });

    it('returns false when window is undefined', () => {
      // @ts-expect-error - Testing SSR environment
      delete global.window;
      expect(isBrowser()).toBe(false);
      global.window = originalWindow;
    });
  });

  describe('isServer', () => {
    it('returns false when window is defined', () => {
      expect(isServer()).toBe(false);
    });

    it('returns true when window is undefined', () => {
      // @ts-expect-error - Testing SSR environment
      delete global.window;
      expect(isServer()).toBe(true);
      global.window = originalWindow;
    });
  });

  describe('canUseDOM', () => {
    it('returns true when window, document, and document.body exist', () => {
      expect(canUseDOM()).toBe(true);
    });

    it('returns false when window is undefined', () => {
      // @ts-expect-error - Testing SSR environment
      delete global.window;
      expect(canUseDOM()).toBe(false);
      global.window = originalWindow;
    });

    it('returns false when document.body is null', () => {
      const originalBody = document.body;
      Object.defineProperty(document, 'body', {
        value: null,
        writable: true,
        configurable: true,
      });
      expect(canUseDOM()).toBe(false);
      Object.defineProperty(document, 'body', {
        value: originalBody,
        writable: true,
        configurable: true,
      });
    });
  });
});
