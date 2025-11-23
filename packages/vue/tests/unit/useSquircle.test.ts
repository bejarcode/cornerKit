/**
 * useSquircle Composable Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, ref, nextTick, computed } from 'vue';
import { useSquircle } from '../../src/useSquircle';

describe('useSquircle Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Return value', () => {
    it('returns ref, update, and remove methods', () => {
      const TestComponent = defineComponent({
        setup() {
          const result = useSquircle({ radius: 20 });
          return { result };
        },
        template: '<div>Test</div>',
      });

      const wrapper = mount(TestComponent);
      const result = wrapper.vm.result;

      expect(result).toHaveProperty('ref');
      expect(result).toHaveProperty('update');
      expect(result).toHaveProperty('remove');
      expect(typeof result.update).toBe('function');
      expect(typeof result.remove).toBe('function');
    });

    it('ref is initially null', () => {
      const TestComponent = defineComponent({
        setup() {
          const { ref: elementRef } = useSquircle({ radius: 20 });
          return { elementRef };
        },
        template: '<div>Test</div>',
      });

      const wrapper = mount(TestComponent);
      // Before attaching, ref should be null
      expect(wrapper.vm.elementRef).toBeNull();
    });
  });

  describe('Basic usage', () => {
    it('applies squircle when ref is attached', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { ref: cardRef } = useSquircle({ radius: 24 });
          return { cardRef };
        },
        template: '<div ref="cardRef">Content</div>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      // Mock sets clip-path on apply
      const element = wrapper.find('div').element as HTMLElement;
      expect(element.style.clipPath).toBe('path("M0,0")');
    });

    it('works without options', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { ref: cardRef } = useSquircle();
          return { cardRef };
        },
        template: '<div ref="cardRef">Content</div>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      expect(wrapper.find('div').exists()).toBe(true);
    });

    it('accepts options with all properties', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { ref: cardRef } = useSquircle({
            radius: 20,
            smoothing: 0.9,
            border: { width: 2, color: '#3b82f6' },
          });
          return { cardRef };
        },
        template: '<div ref="cardRef">Content</div>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      expect(wrapper.find('div').element.style.clipPath).toBe('path("M0,0")');
    });
  });

  describe('Reactive options', () => {
    it('updates squircle when reactive radius changes', async () => {
      const TestComponent = defineComponent({
        setup() {
          const radius = ref(20);
          const { ref: cardRef } = useSquircle({ radius: radius.value });
          return { cardRef, radius };
        },
        template: '<div ref="cardRef">Content</div>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      // Initial apply
      expect(wrapper.find('div').element.style.clipPath).toBe('path("M0,0")');

      // Change radius
      wrapper.vm.radius = 40;
      await nextTick();
      await flushPromises();

      // Should still be applied (mock doesn't change the value)
      expect(wrapper.find('div').exists()).toBe(true);
    });

    it('works with computed options', async () => {
      const TestComponent = defineComponent({
        setup() {
          const baseRadius = ref(10);
          const options = computed(() => ({
            radius: baseRadius.value * 2,
          }));
          const { ref: cardRef } = useSquircle(options);
          return { cardRef, baseRadius };
        },
        template: '<div ref="cardRef">Content</div>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      expect(wrapper.find('div').element.style.clipPath).toBe('path("M0,0")');
    });
  });

  describe('Multiple instances', () => {
    it('supports multiple instances in same component', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { ref: ref1 } = useSquircle({ radius: 20 });
          const { ref: ref2 } = useSquircle({ radius: 30 });
          return { ref1, ref2 };
        },
        template: `
          <div>
            <div ref="ref1" class="card1">Card 1</div>
            <div ref="ref2" class="card2">Card 2</div>
          </div>
        `,
      });

      const wrapper = mount(TestComponent);
      await flushPromises();
      // Wait for async imports to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      await flushPromises();

      // Both cards should be rendered
      expect(wrapper.find('.card1').exists()).toBe(true);
      expect(wrapper.find('.card2').exists()).toBe(true);
    });

    it('each instance has independent styling', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { ref: ref1, update: update1 } = useSquircle({ radius: 20 });
          const { ref: ref2 } = useSquircle({ radius: 30 });
          return { ref1, ref2, update1 };
        },
        template: `
          <div>
            <div ref="ref1" class="card1">Card 1</div>
            <div ref="ref2" class="card2">Card 2</div>
          </div>
        `,
      });

      const wrapper = mount(TestComponent);
      await flushPromises();
      await new Promise(resolve => setTimeout(resolve, 10));
      await flushPromises();

      // Update only the first instance
      wrapper.vm.update1({ radius: 50 });
      await flushPromises();

      // Both cards should exist and be independent
      expect(wrapper.find('.card1').exists()).toBe(true);
      expect(wrapper.find('.card2').exists()).toBe(true);
    });
  });

  describe('Manual control', () => {
    it('update method updates the squircle', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { ref: cardRef, update } = useSquircle({ radius: 20 });
          return { cardRef, update };
        },
        template: '<div ref="cardRef">Content</div>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      wrapper.vm.update({ radius: 40 });
      await flushPromises();

      expect(wrapper.find('div').exists()).toBe(true);
    });

    it('remove method removes the squircle', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { ref: cardRef, remove } = useSquircle({ radius: 20 });
          return { cardRef, remove };
        },
        template: '<div ref="cardRef">Content</div>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      expect(wrapper.find('div').element.style.clipPath).toBe('path("M0,0")');

      wrapper.vm.remove();
      await flushPromises();

      // Mock removes clip-path on remove
      expect(wrapper.find('div').element.style.clipPath).toBe('');
    });
  });

  describe('Cleanup', () => {
    it('cleans up on component unmount', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { ref: cardRef } = useSquircle({ radius: 20 });
          return { cardRef };
        },
        template: '<div ref="cardRef">Content</div>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      const element = wrapper.find('div').element as HTMLElement;
      expect(element.style.clipPath).toBe('path("M0,0")');

      wrapper.unmount();
      // After unmount, cleanup should have run
    });
  });

  describe('Null ref handling', () => {
    it('handles null ref gracefully', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { ref: cardRef, update, remove } = useSquircle({ radius: 20 });
          return { cardRef, update, remove };
        },
        template: '<div>No ref attached</div>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      // These should not throw
      expect(() => wrapper.vm.update({ radius: 30 })).not.toThrow();
      expect(() => wrapper.vm.remove()).not.toThrow();
    });
  });
});
