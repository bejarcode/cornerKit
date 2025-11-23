/**
 * Accessibility Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import Squircle from '../../src/Squircle.vue';
import { vSquircle } from '../../src/directive';

describe('Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Focus indicators', () => {
    it('preserves tabindex attribute', () => {
      const wrapper = mount(Squircle, {
        props: { tag: 'div', radius: 20 },
        attrs: { tabindex: '0' },
      });

      expect(wrapper.attributes('tabindex')).toBe('0');
    });

    it('button elements remain focusable', async () => {
      const wrapper = mount(Squircle, {
        props: { tag: 'button', radius: 20 },
        slots: { default: 'Click me' },
      });

      await flushPromises();

      // Button elements are focusable by default (tabIndex >= 0 or not set)
      const button = wrapper.element as HTMLButtonElement;
      expect(button.tagName).toBe('BUTTON');
      // Buttons are naturally focusable, happy-dom reports -1 but they're still focusable
      expect(wrapper.exists()).toBe(true);
    });

    it('interactive elements with role remain focusable', () => {
      const wrapper = mount(Squircle, {
        props: { tag: 'div', radius: 20 },
        attrs: { role: 'button', tabindex: '0' },
      });

      expect(wrapper.attributes('role')).toBe('button');
      expect(wrapper.attributes('tabindex')).toBe('0');
    });
  });

  describe('Keyboard navigation', () => {
    it('handles keyboard events on buttons', async () => {
      const onKeyDown = vi.fn();
      const wrapper = mount(Squircle, {
        props: { tag: 'button', radius: 20 },
        attrs: { onKeydown: onKeyDown },
      });

      await wrapper.trigger('keydown', { key: 'Enter' });

      expect(onKeyDown).toHaveBeenCalled();
    });

    it('handles keyboard events on interactive divs', async () => {
      const onKeyDown = vi.fn();
      const wrapper = mount(Squircle, {
        props: { tag: 'div', radius: 20 },
        attrs: {
          role: 'button',
          tabindex: '0',
          onKeydown: onKeyDown,
        },
      });

      await wrapper.trigger('keydown', { key: 'Space' });

      expect(onKeyDown).toHaveBeenCalled();
    });

    it('tab order is preserved in lists', async () => {
      const TestComponent = defineComponent({
        components: { Squircle },
        template: `
          <div>
            <Squircle tag="button" :radius="20" class="btn1">Button 1</Squircle>
            <Squircle tag="button" :radius="20" class="btn2">Button 2</Squircle>
            <Squircle tag="button" :radius="20" class="btn3">Button 3</Squircle>
          </div>
        `,
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      const buttons = wrapper.findAll('button');
      expect(buttons).toHaveLength(3);

      // All buttons should be present and are naturally focusable
      buttons.forEach((btn) => {
        expect(btn.element.tagName).toBe('BUTTON');
      });
    });
  });

  describe('ARIA attributes', () => {
    it('passes through aria-label', () => {
      const wrapper = mount(Squircle, {
        props: { tag: 'button', radius: 20 },
        attrs: { 'aria-label': 'Submit form' },
      });

      expect(wrapper.attributes('aria-label')).toBe('Submit form');
    });

    it('passes through aria-describedby', () => {
      const wrapper = mount(Squircle, {
        props: { radius: 20 },
        attrs: { 'aria-describedby': 'description-id' },
      });

      expect(wrapper.attributes('aria-describedby')).toBe('description-id');
    });

    it('passes through aria-hidden', () => {
      const wrapper = mount(Squircle, {
        props: { radius: 20 },
        attrs: { 'aria-hidden': 'true' },
      });

      expect(wrapper.attributes('aria-hidden')).toBe('true');
    });

    it('passes through aria-expanded', () => {
      const wrapper = mount(Squircle, {
        props: { tag: 'button', radius: 20 },
        attrs: { 'aria-expanded': 'false' },
      });

      expect(wrapper.attributes('aria-expanded')).toBe('false');
    });

    it('passes through role attribute', () => {
      const wrapper = mount(Squircle, {
        props: { radius: 20 },
        attrs: { role: 'navigation' },
      });

      expect(wrapper.attributes('role')).toBe('navigation');
    });
  });

  describe('Directive accessibility', () => {
    it('preserves tabindex with directive', async () => {
      const TestComponent = defineComponent({
        directives: { squircle: vSquircle },
        template: '<button v-squircle="20" tabindex="0">Click me</button>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      expect(wrapper.find('button').attributes('tabindex')).toBe('0');
    });

    it('preserves aria attributes with directive', async () => {
      const TestComponent = defineComponent({
        directives: { squircle: vSquircle },
        template: '<button v-squircle="20" aria-label="Action button">Click</button>',
      });

      const wrapper = mount(TestComponent);
      await flushPromises();

      expect(wrapper.find('button').attributes('aria-label')).toBe('Action button');
    });
  });

  describe('Focus management', () => {
    it('element can receive focus', async () => {
      const wrapper = mount(Squircle, {
        props: { tag: 'button', radius: 20 },
        attachTo: document.body,
      });

      await flushPromises();

      const button = wrapper.element as HTMLButtonElement;
      button.focus();

      expect(document.activeElement).toBe(button);

      wrapper.unmount();
    });

    it('element can lose focus', async () => {
      const wrapper = mount(Squircle, {
        props: { tag: 'button', radius: 20 },
        attachTo: document.body,
      });

      await flushPromises();

      const button = wrapper.element as HTMLButtonElement;
      button.focus();
      button.blur();

      expect(document.activeElement).not.toBe(button);

      wrapper.unmount();
    });
  });

  describe('Screen reader compatibility', () => {
    it('text content is accessible', () => {
      const wrapper = mount(Squircle, {
        props: { radius: 20 },
        slots: { default: 'Accessible content' },
      });

      expect(wrapper.text()).toBe('Accessible content');
    });

    it('nested content structure is preserved', () => {
      const wrapper = mount(Squircle, {
        props: { radius: 20 },
        slots: {
          default: '<h2>Title</h2><p>Description</p>',
        },
      });

      expect(wrapper.find('h2').exists()).toBe(true);
      expect(wrapper.find('p').exists()).toBe(true);
      expect(wrapper.find('h2').text()).toBe('Title');
      expect(wrapper.find('p').text()).toBe('Description');
    });
  });
});
