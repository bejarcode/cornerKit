/**
 * SSR Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSSRApp, defineComponent, h, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import Squircle from '../../src/Squircle.vue';
import { useSquircle } from '../../src/useSquircle';
import { vSquircle } from '../../src/directive';

describe('SSR Compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Squircle Component', () => {
    it('renders slot content without errors', async () => {
      const App = defineComponent({
        components: { Squircle },
        template: '<Squircle :radius="20">Hello World</Squircle>',
      });

      const app = createSSRApp(App);
      const html = await renderToString(app);

      expect(html).toContain('Hello World');
    });

    it('renders as correct element type', async () => {
      const App = defineComponent({
        components: { Squircle },
        template: '<Squircle tag="button" :radius="20">Click me</Squircle>',
      });

      const app = createSSRApp(App);
      const html = await renderToString(app);

      expect(html).toContain('<button');
      expect(html).toContain('Click me');
      expect(html).toContain('</button>');
    });

    it('passes through attributes during SSR', async () => {
      const App = defineComponent({
        components: { Squircle },
        template: '<Squircle class="my-class" data-testid="test">Content</Squircle>',
      });

      const app = createSSRApp(App);
      const html = await renderToString(app);

      expect(html).toContain('class="my-class"');
      expect(html).toContain('data-testid="test"');
    });

    it('does not cause errors with border prop', async () => {
      const App = defineComponent({
        components: { Squircle },
        template: `
          <Squircle
            :radius="20"
            :smoothing="0.9"
            :border="{ width: 2, color: 'blue' }"
          >
            Content with border
          </Squircle>
        `,
      });

      const app = createSSRApp(App);
      const html = await renderToString(app);

      expect(html).toContain('Content with border');
    });

    it('renders nested components', async () => {
      const App = defineComponent({
        components: { Squircle },
        template: `
          <Squircle :radius="20">
            <Squircle :radius="10">Nested</Squircle>
          </Squircle>
        `,
      });

      const app = createSSRApp(App);
      const html = await renderToString(app);

      expect(html).toContain('Nested');
    });
  });

  describe('useSquircle Composable', () => {
    it('does not cause errors during SSR', async () => {
      const App = defineComponent({
        setup() {
          const { ref: cardRef } = useSquircle({ radius: 24 });
          return { cardRef };
        },
        template: '<div ref="cardRef">Content</div>',
      });

      const app = createSSRApp(App);
      const html = await renderToString(app);

      expect(html).toContain('Content');
    });

    it('returns functional ref during SSR', async () => {
      const App = defineComponent({
        setup() {
          const { ref: cardRef, update, remove } = useSquircle({ radius: 20 });

          // These should be callable without errors
          expect(typeof update).toBe('function');
          expect(typeof remove).toBe('function');

          return { cardRef };
        },
        template: '<div ref="cardRef">Content</div>',
      });

      const app = createSSRApp(App);
      const html = await renderToString(app);

      expect(html).toContain('Content');
    });

    it('multiple composables work during SSR', async () => {
      const App = defineComponent({
        setup() {
          const { ref: ref1 } = useSquircle({ radius: 20 });
          const { ref: ref2 } = useSquircle({ radius: 30 });
          return { ref1, ref2 };
        },
        template: `
          <div>
            <div ref="ref1">Card 1</div>
            <div ref="ref2">Card 2</div>
          </div>
        `,
      });

      const app = createSSRApp(App);
      const html = await renderToString(app);

      expect(html).toContain('Card 1');
      expect(html).toContain('Card 2');
    });
  });

  describe('v-squircle Directive', () => {
    it('does not cause errors during SSR', async () => {
      const App = defineComponent({
        directives: { squircle: vSquircle },
        template: '<div v-squircle="20">Content</div>',
      });

      const app = createSSRApp(App);
      const html = await renderToString(app);

      expect(html).toContain('Content');
    });

    it('works with object syntax during SSR', async () => {
      const App = defineComponent({
        directives: { squircle: vSquircle },
        template: '<div v-squircle="{ radius: 20, smoothing: 0.8 }">Content</div>',
      });

      const app = createSSRApp(App);
      const html = await renderToString(app);

      expect(html).toContain('Content');
    });

    it('multiple directives work during SSR', async () => {
      const App = defineComponent({
        directives: { squircle: vSquircle },
        template: `
          <div>
            <div v-squircle="20">Card 1</div>
            <div v-squircle="{ radius: 30 }">Card 2</div>
          </div>
        `,
      });

      const app = createSSRApp(App);
      const html = await renderToString(app);

      expect(html).toContain('Card 1');
      expect(html).toContain('Card 2');
    });
  });

  describe('Hydration', () => {
    it('component HTML is suitable for hydration', async () => {
      const App = defineComponent({
        components: { Squircle },
        template: '<Squircle :radius="20" class="squircle-card">Hydration Test</Squircle>',
      });

      const app = createSSRApp(App);
      const html = await renderToString(app);

      // Should have proper structure for hydration
      expect(html).toContain('<div');
      expect(html).toContain('class="squircle-card"');
      expect(html).toContain('Hydration Test');
      expect(html).toContain('</div>');
    });

    it('no hydration mismatch warnings expected', async () => {
      // This test verifies the HTML structure is deterministic
      const App = defineComponent({
        components: { Squircle },
        template: '<Squircle :radius="20">Content</Squircle>',
      });

      const app1 = createSSRApp(App);
      const html1 = await renderToString(app1);

      const app2 = createSSRApp(App);
      const html2 = await renderToString(app2);

      // Same component should produce identical HTML
      expect(html1).toBe(html2);
    });
  });

  describe('Complex scenarios', () => {
    it('mixed usage in same app', async () => {
      const App = defineComponent({
        components: { Squircle },
        directives: { squircle: vSquircle },
        setup() {
          const { ref: composableRef } = useSquircle({ radius: 24 });
          return { composableRef };
        },
        template: `
          <div>
            <Squircle :radius="20">Component</Squircle>
            <div ref="composableRef">Composable</div>
            <div v-squircle="30">Directive</div>
          </div>
        `,
      });

      const app = createSSRApp(App);
      const html = await renderToString(app);

      expect(html).toContain('Component');
      expect(html).toContain('Composable');
      expect(html).toContain('Directive');
    });

    it('conditional rendering during SSR', async () => {
      const App = defineComponent({
        components: { Squircle },
        setup() {
          const show = ref(true);
          return { show };
        },
        template: `
          <div>
            <Squircle v-if="show" :radius="20">Shown</Squircle>
            <Squircle v-else :radius="30">Hidden</Squircle>
          </div>
        `,
      });

      const app = createSSRApp(App);
      const html = await renderToString(app);

      expect(html).toContain('Shown');
      expect(html).not.toContain('Hidden');
    });

    it('list rendering during SSR', async () => {
      const App = defineComponent({
        components: { Squircle },
        setup() {
          const items = ref(['A', 'B', 'C']);
          return { items };
        },
        template: `
          <div>
            <Squircle v-for="item in items" :key="item" :radius="20">
              {{ item }}
            </Squircle>
          </div>
        `,
      });

      const app = createSSRApp(App);
      const html = await renderToString(app);

      expect(html).toContain('A');
      expect(html).toContain('B');
      expect(html).toContain('C');
    });
  });
});
