/**
 * Type definition tests for @cornerkit/svelte
 */

import { describe, it, expect } from 'vitest';
import type {
  SquircleOptions,
  SquircleProps,
  SquircleActionOptions,
  SquircleBorderConfig,
  SquircleActionReturn,
} from '../../src/types';

describe('Type Definitions', () => {
  describe('SquircleBorderConfig', () => {
    it('should accept valid border config', () => {
      const border: SquircleBorderConfig = {
        width: 2,
        color: '#3b82f6',
      };

      expect(border.width).toBe(2);
      expect(border.color).toBe('#3b82f6');
    });

    it('should accept various color formats', () => {
      const borders: SquircleBorderConfig[] = [
        { width: 1, color: '#000' },
        { width: 1, color: 'rgb(0,0,0)' },
        { width: 1, color: 'rgba(0,0,0,0.5)' },
        { width: 1, color: 'hsl(0,0%,0%)' },
        { width: 1, color: 'black' },
      ];

      borders.forEach((border) => {
        expect(typeof border.color).toBe('string');
      });
    });
  });

  describe('SquircleOptions', () => {
    it('should accept all optional properties', () => {
      const options: SquircleOptions = {};
      expect(options.radius).toBeUndefined();
      expect(options.smoothing).toBeUndefined();
      expect(options.border).toBeUndefined();
    });

    it('should accept radius only', () => {
      const options: SquircleOptions = { radius: 20 };
      expect(options.radius).toBe(20);
    });

    it('should accept full configuration', () => {
      const options: SquircleOptions = {
        radius: 24,
        smoothing: 0.9,
        border: { width: 2, color: 'blue' },
      };

      expect(options.radius).toBe(24);
      expect(options.smoothing).toBe(0.9);
      expect(options.border?.width).toBe(2);
    });
  });

  describe('SquircleProps', () => {
    it('should extend SquircleOptions', () => {
      const props: SquircleProps = {
        radius: 20,
        smoothing: 0.8,
        class: 'my-class',
      };

      expect(props.radius).toBe(20);
      expect(props.class).toBe('my-class');
    });
  });

  describe('SquircleActionOptions', () => {
    it('should accept number shorthand', () => {
      const options: SquircleActionOptions = 20;
      expect(options).toBe(20);
    });

    it('should accept full object', () => {
      const options: SquircleActionOptions = {
        radius: 20,
        smoothing: 0.8,
      };

      expect(typeof options).toBe('object');
    });
  });

  describe('SquircleActionReturn', () => {
    it('should have update and destroy methods', () => {
      const mockReturn: SquircleActionReturn = {
        update: () => {},
        destroy: () => {},
      };

      expect(typeof mockReturn.update).toBe('function');
      expect(typeof mockReturn.destroy).toBe('function');
    });
  });
});
