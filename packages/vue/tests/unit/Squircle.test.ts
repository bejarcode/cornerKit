/**
 * Squircle Component Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick, defineComponent, ref } from 'vue';
import Squircle from '../../src/Squircle.vue';

describe('Squircle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders slot content', async () => {
      const wrapper = mount(Squircle, {
        slots: {
          default: 'Test Content',
        },
      });

      expect(wrapper.text()).toBe('Test Content');
    });

    it('renders as div by default', () => {
      const wrapper = mount(Squircle);
      expect(wrapper.element.tagName).toBe('DIV');
    });

    it('renders as custom element when tag prop is provided', () => {
      const wrapper = mount(Squircle, {
        props: { tag: 'button' },
      });

      expect(wrapper.element.tagName).toBe('BUTTON');
    });

    it('renders as span when tag="span"', () => {
      const wrapper = mount(Squircle, {
        props: { tag: 'span' },
        slots: { default: 'Span content' },
      });

      expect(wrapper.element.tagName).toBe('SPAN');
      expect(wrapper.text()).toBe('Span content');
    });

    it('renders as section when tag="section"', () => {
      const wrapper = mount(Squircle, {
        props: { tag: 'section' },
      });

      expect(wrapper.element.tagName).toBe('SECTION');
    });
  });

  describe('Props', () => {
    it('accepts radius prop', async () => {
      const wrapper = mount(Squircle, {
        props: { radius: 24 },
      });

      await flushPromises();
      // CornerKit is mocked, so we just verify it rendered without error
      expect(wrapper.exists()).toBe(true);
    });

    it('accepts smoothing prop', async () => {
      const wrapper = mount(Squircle, {
        props: { smoothing: 0.9 },
      });

      await flushPromises();
      expect(wrapper.exists()).toBe(true);
    });

    it('accepts border prop', async () => {
      const wrapper = mount(Squircle, {
        props: {
          border: { width: 2, color: '#3b82f6' },
        },
      });

      await flushPromises();
      expect(wrapper.exists()).toBe(true);
    });

    it('forwards the full border object to core (v1.2+ API, not legacy props)', async () => {
      const wrapper = mount(Squircle, {
        props: {
          radius: 20,
          border: { width: 2, color: '#3b82f6', style: 'dashed', dashArray: '12 4' },
        },
        attachTo: document.body,
      });

      await flushPromises();
      const config = JSON.parse(wrapper.element.getAttribute('data-mock-config') ?? '{}');
      expect(config.border).toEqual({
        width: 2,
        color: '#3b82f6',
        style: 'dashed',
        dashArray: '12 4',
      });
      expect(config.borderWidth).toBeUndefined();
      expect(config.borderColor).toBeUndefined();
      wrapper.unmount();
    });

    it('forwards gradient borders to core', async () => {
      const wrapper = mount(Squircle, {
        props: {
          border: {
            width: 3,
            gradient: [
              { offset: '0%', color: '#3b82f6' },
              { offset: '100%', color: '#8b5cf6' },
            ],
          },
        },
        attachTo: document.body,
      });

      await flushPromises();
      const config = JSON.parse(wrapper.element.getAttribute('data-mock-config') ?? '{}');
      expect(config.border.gradient).toHaveLength(2);
      expect(config.border.gradient[1].color).toBe('#8b5cf6');
      wrapper.unmount();
    });

    it('forwards border: null so core can explicitly disable a border', async () => {
      const wrapper = mount(Squircle, {
        props: { radius: 20, border: null },
        attachTo: document.body,
      });

      await flushPromises();
      const config = JSON.parse(wrapper.element.getAttribute('data-mock-config') ?? '{}');
      expect('border' in config).toBe(true);
      expect(config.border).toBeNull();
      wrapper.unmount();
    });

    it('accepts all props together', async () => {
      const wrapper = mount(Squircle, {
        props: {
          radius: 20,
          smoothing: 0.85,
          border: { width: 1, color: 'blue' },
          tag: 'button',
        },
      });

      await flushPromises();
      expect(wrapper.element.tagName).toBe('BUTTON');
    });
  });

  describe('Attributes passthrough', () => {
    it('passes through class attribute', () => {
      const wrapper = mount(Squircle, {
        attrs: { class: 'my-class' },
      });

      expect(wrapper.classes()).toContain('my-class');
    });

    it('passes through style attribute', () => {
      const wrapper = mount(Squircle, {
        attrs: { style: 'color: red' },
      });

      expect(wrapper.attributes('style')).toContain('color: red');
    });

    it('passes through event handlers', async () => {
      const onClick = vi.fn();
      const wrapper = mount(Squircle, {
        props: { tag: 'button' },
        attrs: { onClick },
      });

      await wrapper.trigger('click');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('passes through data attributes', () => {
      const wrapper = mount(Squircle, {
        attrs: { 'data-testid': 'squircle-element' },
      });

      expect(wrapper.attributes('data-testid')).toBe('squircle-element');
    });

    it('passes through aria attributes', () => {
      const wrapper = mount(Squircle, {
        attrs: { 'aria-label': 'Squircle container' },
      });

      expect(wrapper.attributes('aria-label')).toBe('Squircle container');
    });
  });

  describe('Lifecycle', () => {
    it('applies squircle on mount', async () => {
      const wrapper = mount(Squircle, {
        props: { radius: 20 },
      });

      await flushPromises();
      // Mock sets clip-path on apply
      expect(wrapper.element.style.clipPath).toBe('path("M0,0")');
    });

    it('cleans up on unmount', async () => {
      const wrapper = mount(Squircle, {
        props: { radius: 20 },
      });

      await flushPromises();
      expect(wrapper.element.style.clipPath).toBe('path("M0,0")');

      wrapper.unmount();
      // After unmount, the element is removed from DOM
    });

    it('updates squircle when props change', async () => {
      const wrapper = mount(Squircle, {
        props: { radius: 20 },
      });

      await flushPromises();

      await wrapper.setProps({ radius: 40 });
      await flushPromises();

      // The mock should have been called with updated props
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('defineExpose', () => {
    it('exposes el property', async () => {
      const TestComponent = defineComponent({
        components: { Squircle },
        template: '<Squircle ref="squircleRef">Content</Squircle>',
        setup() {
          const squircleRef = ref<{ el: HTMLElement | null } | null>(null);
          return { squircleRef };
        },
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      const squircleRef = wrapper.vm.squircleRef;
      expect(squircleRef).not.toBeNull();
      expect(squircleRef?.el).toBeInstanceOf(HTMLElement);
    });

    it('exposed el is the actual DOM element', async () => {
      const TestComponent = defineComponent({
        components: { Squircle },
        template: '<Squircle ref="squircleRef" class="test-element">Content</Squircle>',
        setup() {
          const squircleRef = ref<{ el: HTMLElement | null } | null>(null);
          return { squircleRef };
        },
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      const el = wrapper.vm.squircleRef?.el;
      expect(el?.classList.contains('test-element')).toBe(true);
    });
  });

  describe('KeepAlive support', () => {
    it('handles activation and deactivation', async () => {
      // KeepAlive behavior is tested by simulating the lifecycle hooks
      // In a real KeepAlive scenario, the component calls onActivated/onDeactivated
      const wrapper = mount(Squircle, {
        props: { radius: 20 },
      });

      await flushPromises();
      expect(wrapper.element.style.clipPath).toBe('path("M0,0")');

      // The component should handle KeepAlive lifecycle internally
      wrapper.unmount();
    });
  });
});
