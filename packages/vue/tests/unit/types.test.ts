/**
 * TypeScript Type Tests
 *
 * These tests verify that types are correctly exported and usable.
 * They are compile-time tests - if they compile, the types are correct.
 */

import { describe, it, expect } from 'vitest';
import { ref, type Ref } from 'vue';
import type {
  SquircleProps,
  SquircleExpose,
  SquircleOptions,
  SquircleBorderConfig,
  UseSquircleOptions,
  UseSquircleReturn,
  VSquircleValue,
  VSquircleDirective,
} from '../../src/types';
import { useSquircle } from '../../src/useSquircle';
import { vSquircle } from '../../src/directive';
import Squircle from '../../src/Squircle.vue';

describe('Type Definitions', () => {
  describe('SquircleBorderConfig', () => {
    it('accepts valid border config', () => {
      const border: SquircleBorderConfig = {
        width: 2,
        color: '#3b82f6',
      };

      expect(border.width).toBe(2);
      expect(border.color).toBe('#3b82f6');
    });

    it('width must be number', () => {
      const border: SquircleBorderConfig = {
        width: 1,
        color: 'blue',
      };

      expect(typeof border.width).toBe('number');
    });

    it('color must be string', () => {
      const border: SquircleBorderConfig = {
        width: 1,
        color: 'rgba(0, 0, 0, 0.5)',
      };

      expect(typeof border.color).toBe('string');
    });
  });

  describe('SquircleOptions', () => {
    it('all properties are optional', () => {
      const options1: SquircleOptions = {};
      const options2: SquircleOptions = { radius: 20 };
      const options3: SquircleOptions = { smoothing: 0.8 };
      const options4: SquircleOptions = { border: { width: 1, color: 'red' } };

      expect(options1).toBeDefined();
      expect(options2.radius).toBe(20);
      expect(options3.smoothing).toBe(0.8);
      expect(options4.border?.width).toBe(1);
    });

    it('accepts full config', () => {
      const options: SquircleOptions = {
        radius: 24,
        smoothing: 0.9,
        border: { width: 2, color: '#3b82f6' },
      };

      expect(options.radius).toBe(24);
      expect(options.smoothing).toBe(0.9);
      expect(options.border?.color).toBe('#3b82f6');
    });
  });

  describe('SquircleProps', () => {
    it('extends SquircleOptions', () => {
      const props: SquircleProps = {
        radius: 20,
        smoothing: 0.8,
        border: { width: 1, color: 'blue' },
      };

      expect(props.radius).toBe(20);
    });

    it('includes tag property', () => {
      const props: SquircleProps = {
        tag: 'button',
        radius: 20,
      };

      expect(props.tag).toBe('button');
    });

    it('tag accepts HTML element names', () => {
      const divProps: SquircleProps = { tag: 'div' };
      const buttonProps: SquircleProps = { tag: 'button' };
      const sectionProps: SquircleProps = { tag: 'section' };
      const spanProps: SquircleProps = { tag: 'span' };

      expect(divProps.tag).toBe('div');
      expect(buttonProps.tag).toBe('button');
      expect(sectionProps.tag).toBe('section');
      expect(spanProps.tag).toBe('span');
    });
  });

  describe('SquircleExpose', () => {
    it('has el property', () => {
      const exposed: SquircleExpose = {
        el: null,
      };

      expect(exposed.el).toBeNull();
    });

    it('el can be HTMLElement', () => {
      const element = document.createElement('div');
      const exposed: SquircleExpose = {
        el: element,
      };

      expect(exposed.el).toBeInstanceOf(HTMLElement);
    });
  });

  describe('UseSquircleOptions', () => {
    it('is same as SquircleOptions', () => {
      const options: UseSquircleOptions = {
        radius: 20,
        smoothing: 0.8,
        border: { width: 1, color: 'red' },
      };

      expect(options.radius).toBe(20);
    });
  });

  describe('UseSquircleReturn', () => {
    it('has correct shape', () => {
      const result: UseSquircleReturn = {
        ref: ref<HTMLElement | null>(null),
        update: () => {},
        remove: () => {},
      };

      expect(result.ref).toBeDefined();
      expect(typeof result.update).toBe('function');
      expect(typeof result.remove).toBe('function');
    });

    it('ref is Ref<HTMLElement | null>', () => {
      const result: UseSquircleReturn = {
        ref: ref<HTMLElement | null>(null),
        update: (_options) => {},
        remove: () => {},
      };

      expect(result.ref.value).toBeNull();
    });

    it('update accepts Partial<SquircleOptions>', () => {
      const result: UseSquircleReturn = {
        ref: ref<HTMLElement | null>(null),
        update: (options: Partial<SquircleOptions>) => {
          // Type check: options is correctly typed
          if (options.radius) {
            expect(typeof options.radius).toBe('number');
          }
        },
        remove: () => {},
      };

      result.update({ radius: 30 });
      result.update({ smoothing: 0.9 });
      result.update({});
    });
  });

  describe('VSquircleValue', () => {
    it('accepts number', () => {
      const value: VSquircleValue = 24;
      expect(value).toBe(24);
    });

    it('accepts SquircleOptions', () => {
      const value: VSquircleValue = {
        radius: 20,
        smoothing: 0.8,
      };

      expect(typeof value).toBe('object');
    });

    it('accepts full options object', () => {
      const value: VSquircleValue = {
        radius: 20,
        smoothing: 0.8,
        border: { width: 2, color: 'blue' },
      };

      if (typeof value === 'object') {
        expect(value.border?.width).toBe(2);
      }
    });
  });

  describe('VSquircleDirective', () => {
    it('is a valid directive type', () => {
      const directive: VSquircleDirective = vSquircle;
      expect(directive).toBeDefined();
    });
  });

  describe('useSquircle composable', () => {
    it('returns correctly typed value', () => {
      // This is a compile-time test
      const result = useSquircle({ radius: 20 });

      expect(result).toHaveProperty('ref');
      expect(result).toHaveProperty('update');
      expect(result).toHaveProperty('remove');
    });

    it('accepts undefined options', () => {
      const result = useSquircle();
      expect(result).toBeDefined();
    });

    it('accepts reactive options', () => {
      const radius = ref(20);
      const result = useSquircle({ radius: radius.value });
      expect(result).toBeDefined();
    });
  });

  describe('Squircle component', () => {
    it('is a valid Vue component', () => {
      expect(Squircle).toBeDefined();
      expect(typeof Squircle).toBe('object');
    });
  });

  describe('Type inference', () => {
    it('update method infers partial options correctly', () => {
      const { update } = useSquircle({ radius: 20 });

      // These should compile without errors
      update({ radius: 30 });
      update({ smoothing: 0.9 });
      update({ border: { width: 1, color: 'red' } });
      update({ radius: 30, smoothing: 0.9 });
      update({});
    });
  });
});
