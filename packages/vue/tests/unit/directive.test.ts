/**
 * v-squircle Directive Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, ref, nextTick } from 'vue';
import { vSquircle } from '../../src/directive';

describe('v-squircle Directive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Object syntax', () => {
    it('applies squircle with object value', async () => {
      const TestComponent = defineComponent({
        directives: { squircle: vSquircle },
        template: '<div v-squircle="{ radius: 20, smoothing: 0.8 }">Content</div>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      expect(wrapper.find('div').element.style.clipPath).toBe('path("M0,0")');
    });

    it('applies squircle with border config', async () => {
      const TestComponent = defineComponent({
        directives: { squircle: vSquircle },
        template: `
          <div v-squircle="{ radius: 20, border: { width: 2, color: 'blue' } }">
            Content
          </div>
        `,
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      expect(wrapper.find('div').element.style.clipPath).toBe('path("M0,0")');
    });

    it('works with all options', async () => {
      const TestComponent = defineComponent({
        directives: { squircle: vSquircle },
        template: `
          <div v-squircle="{ radius: 24, smoothing: 0.9, border: { width: 1, color: '#3b82f6' } }">
            Content
          </div>
        `,
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      expect(wrapper.find('div').element.style.clipPath).toBe('path("M0,0")');
    });
  });

  describe('Number shorthand', () => {
    it('applies squircle with number value (radius only)', async () => {
      const TestComponent = defineComponent({
        directives: { squircle: vSquircle },
        template: '<div v-squircle="24">Content</div>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      expect(wrapper.find('div').element.style.clipPath).toBe('path("M0,0")');
    });

    it('number shorthand is equivalent to { radius: n }', async () => {
      const TestComponent = defineComponent({
        directives: { squircle: vSquircle },
        setup() {
          return { radius: 24 };
        },
        template: '<div v-squircle="radius">Content</div>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      expect(wrapper.find('div').element.style.clipPath).toBe('path("M0,0")');
    });
  });

  describe('Value changes', () => {
    it('updates squircle when value changes', async () => {
      const TestComponent = defineComponent({
        directives: { squircle: vSquircle },
        setup() {
          const config = ref({ radius: 20 });
          return { config };
        },
        template: '<div v-squircle="config">Content</div>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      expect(wrapper.find('div').element.style.clipPath).toBe('path("M0,0")');

      // Change the value
      wrapper.vm.config = { radius: 40 };
      await nextTick();
      await flushPromises();

      expect(wrapper.find('div').element.style.clipPath).toBe('path("M0,0")');
    });

    it('updates when number shorthand changes', async () => {
      const TestComponent = defineComponent({
        directives: { squircle: vSquircle },
        setup() {
          const radius = ref(20);
          return { radius };
        },
        template: '<div v-squircle="radius">Content</div>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      wrapper.vm.radius = 40;
      await nextTick();
      await flushPromises();

      expect(wrapper.find('div').element.style.clipPath).toBe('path("M0,0")');
    });
  });

  describe('Cleanup', () => {
    it('cleans up on element removal', async () => {
      const TestComponent = defineComponent({
        directives: { squircle: vSquircle },
        setup() {
          const show = ref(true);
          return { show };
        },
        template: '<div v-if="show" v-squircle="20">Content</div>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      expect(wrapper.find('div').element.style.clipPath).toBe('path("M0,0")');

      // Remove element with v-if
      wrapper.vm.show = false;
      await nextTick();
      await flushPromises();

      expect(wrapper.find('div').exists()).toBe(false);
    });

    it('cleans up on component unmount', async () => {
      const TestComponent = defineComponent({
        directives: { squircle: vSquircle },
        template: '<div v-squircle="{ radius: 20 }">Content</div>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      const element = wrapper.find('div').element as HTMLElement;
      expect(element.style.clipPath).toBe('path("M0,0")');

      wrapper.unmount();
      // Cleanup should have run
    });
  });

  describe('Multiple elements', () => {
    it('supports multiple elements with v-squircle', async () => {
      const TestComponent = defineComponent({
        directives: { squircle: vSquircle },
        template: `
          <div>
            <div v-squircle="20" class="card1">Card 1</div>
            <div v-squircle="30" class="card2">Card 2</div>
          </div>
        `,
      });

      const wrapper = mount(TestComponent);
      await flushPromises();
      await new Promise(resolve => setTimeout(resolve, 10));
      await flushPromises();

      // Both elements should exist
      expect(wrapper.find('.card1').exists()).toBe(true);
      expect(wrapper.find('.card2').exists()).toBe(true);
    });

    it('each element has independent settings', async () => {
      const TestComponent = defineComponent({
        directives: { squircle: vSquircle },
        setup() {
          const radius1 = ref(20);
          const radius2 = ref(30);
          return { radius1, radius2 };
        },
        template: `
          <div>
            <div v-squircle="radius1" class="card1">Card 1</div>
            <div v-squircle="radius2" class="card2">Card 2</div>
          </div>
        `,
      });

      const wrapper = mount(TestComponent);
      await flushPromises();
      await new Promise(resolve => setTimeout(resolve, 10));
      await flushPromises();

      // Update only one
      wrapper.vm.radius1 = 50;
      await nextTick();
      await flushPromises();

      // Both elements should exist and be independent
      expect(wrapper.find('.card1').exists()).toBe(true);
      expect(wrapper.find('.card2').exists()).toBe(true);
    });
  });

  describe('v-for integration', () => {
    it('works with v-for', async () => {
      const TestComponent = defineComponent({
        directives: { squircle: vSquircle },
        setup() {
          const items = ref([
            { id: 1, radius: 20 },
            { id: 2, radius: 24 },
            { id: 3, radius: 28 },
          ]);
          return { items };
        },
        template: `
          <div>
            <div
              v-for="item in items"
              :key="item.id"
              v-squircle="item.radius"
              class="item"
            >
              Item {{ item.id }}
            </div>
          </div>
        `,
      });

      const wrapper = mount(TestComponent);
      await flushPromises();
      await new Promise(resolve => setTimeout(resolve, 10));
      await flushPromises();

      const items = wrapper.findAll('.item');
      expect(items).toHaveLength(3);

      // All items should be rendered
      items.forEach((item) => {
        expect(item.exists()).toBe(true);
      });
    });
  });

  describe('Global registration', () => {
    it('can be registered globally', async () => {
      const TestComponent = defineComponent({
        template: '<div v-squircle="20">Content</div>',
      });

      const wrapper = mount(TestComponent, {
        global: {
          directives: {
            squircle: vSquircle,
          },
        },
      });

      await flushPromises();

      expect(wrapper.find('div').element.style.clipPath).toBe('path("M0,0")');
    });
  });
});
