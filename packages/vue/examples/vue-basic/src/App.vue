<script setup lang="ts">
import { ref, computed } from 'vue';
import { Squircle, useSquircle, vSquircle } from '@cornerkit/vue';

// Interactive controls state
const radius = ref(20);
const smoothing = ref(0.8);
const borderEnabled = ref(false);
const borderWidth = ref(2);
const borderColor = ref('#000000');

// useSquircle composable example
const { ref: hookRef } = useSquircle({
  radius: 24,
  smoothing: 0.9,
});

// Computed border config
const borderConfig = computed(() =>
  borderEnabled.value
    ? { width: borderWidth.value, color: borderColor.value }
    : undefined
);

// Code example
const codeExample = computed(() => {
  const borderPart = borderEnabled.value
    ? `\n      :border="{ width: ${borderWidth.value}, color: '${borderColor.value}' }"`
    : '';
  return `// Using the Squircle component
import { Squircle } from '@cornerkit/vue';

<Squircle
  :radius="${radius.value}"
  :smoothing="${smoothing.value}"${borderPart}
>
  Content goes here
</Squircle>

// Using the useSquircle composable
import { useSquircle } from '@cornerkit/vue';

const { ref: squircleRef } = useSquircle({
  radius: 24,
  smoothing: 0.9,
});

<div ref="squircleRef">Content</div>

// Using the v-squircle directive
import { vSquircle } from '@cornerkit/vue';

<div v-squircle="{ radius: 20, smoothing: 0.8 }">
  Content
</div>`;
});

function handleButtonClick() {
  alert('Button clicked!');
}
</script>

<template>
  <div class="container">
    <header>
      <h1>@cornerkit/vue Example</h1>
      <p>Vue 3 components, composables, and directives for iOS-style squircle corners</p>
    </header>

    <main>
      <!-- Demo Grid -->
      <section class="demo-grid">
        <!-- Basic Squircle Component -->
        <Squircle class="demo-card card-blue" :radius="20" :smoothing="0.8">
          <h3>Basic Squircle</h3>
          <p>radius: 20px, smoothing: 0.8</p>
          <code>&lt;Squircle :radius="20" :smoothing="0.8"&gt;</code>
        </Squircle>

        <!-- High Smoothing -->
        <Squircle class="demo-card card-purple" :radius="20" :smoothing="0.95">
          <h3>High Smoothing</h3>
          <p>radius: 20px, smoothing: 0.95</p>
          <code>&lt;Squircle :radius="20" :smoothing="0.95"&gt;</code>
        </Squircle>

        <!-- With Border -->
        <Squircle
          class="demo-card card-pink"
          :radius="20"
          :smoothing="0.8"
          :border="{ width: 3, color: '#ffffff' }"
        >
          <h3>With Border</h3>
          <p>radius: 20px, border: 3px white</p>
          <code>&lt;Squircle :border="{ width: 3, color: '#fff' }"&gt;</code>
        </Squircle>

        <!-- useSquircle Composable -->
        <div ref="hookRef" class="demo-card card-amber">
          <h3>useSquircle Composable</h3>
          <p>radius: 24px, smoothing: 0.9</p>
          <code>const { ref } = useSquircle({ radius: 24 })</code>
        </div>
      </section>

      <!-- Directive Examples -->
      <section class="directive-section">
        <h2>v-squircle Directive</h2>
        <p class="section-description">Apply squircle corners directly with the v-squircle directive</p>

        <div class="directive-grid">
          <div v-squircle="{ radius: 16, smoothing: 0.8 }" class="directive-card card-teal">
            <h3>Object Syntax</h3>
            <code>v-squircle="{ radius: 16, smoothing: 0.8 }"</code>
          </div>

          <div v-squircle="24" class="directive-card card-indigo">
            <h3>Number Shorthand</h3>
            <code>v-squircle="24"</code>
          </div>

          <div
            v-squircle="{ radius: 20, border: { width: 2, color: '#ffffff' } }"
            class="directive-card card-rose"
          >
            <h3>With Border</h3>
            <code>v-squircle="{ radius: 20, border: {...} }"</code>
          </div>
        </div>
      </section>

      <!-- Polymorphic Examples -->
      <section class="polymorphic-section">
        <h2>Polymorphic Component</h2>
        <p class="section-description">The Squircle component supports any HTML element via the `tag` prop</p>

        <div class="polymorphic-grid">
          <Squircle
            tag="button"
            class="squircle-button"
            :radius="12"
            :smoothing="0.85"
            @click="handleButtonClick"
          >
            Click Me (button)
          </Squircle>

          <Squircle
            tag="a"
            href="https://github.com/bejarcode/cornerKit"
            target="_blank"
            rel="noopener noreferrer"
            class="squircle-link"
            :radius="12"
            :smoothing="0.85"
          >
            GitHub Link (a)
          </Squircle>

          <Squircle
            tag="input"
            type="text"
            placeholder="Type here... (input)"
            class="squircle-input"
            :radius="10"
            :smoothing="0.8"
          />
        </div>
      </section>

      <!-- Interactive Controls -->
      <section class="controls">
        <h2>Interactive Demo</h2>

        <div class="control-panel">
          <div class="control-group">
            <label for="radius-slider">
              Radius: <span>{{ radius }}px</span>
            </label>
            <input
              id="radius-slider"
              type="range"
              min="0"
              max="50"
              v-model.number="radius"
            />
          </div>

          <div class="control-group">
            <label for="smoothing-slider">
              Smoothing: <span>{{ smoothing.toFixed(2) }}</span>
            </label>
            <input
              id="smoothing-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              v-model.number="smoothing"
            />
          </div>

          <!-- Border Controls -->
          <div class="border-controls-wrapper">
            <div class="border-toggle">
              <label for="border-toggle">Enable Border</label>
              <input
                id="border-toggle"
                type="checkbox"
                v-model="borderEnabled"
              />
            </div>

            <div v-if="borderEnabled" class="border-controls">
              <div class="control-group">
                <label for="border-width-slider">
                  Border Width: <span>{{ borderWidth }}px</span>
                </label>
                <input
                  id="border-width-slider"
                  type="range"
                  min="1"
                  max="10"
                  v-model.number="borderWidth"
                />
              </div>

              <div class="control-group">
                <label for="border-color-picker">
                  Border Color: <span>{{ borderColor }}</span>
                </label>
                <input
                  id="border-color-picker"
                  type="color"
                  v-model="borderColor"
                />
              </div>
            </div>
          </div>

          <Squircle
            class="interactive-demo"
            :radius="radius"
            :smoothing="smoothing"
            :border="borderConfig"
          >
            <h3>Interactive Squircle</h3>
            <p>Adjust the controls above</p>
          </Squircle>
        </div>
      </section>

      <!-- Code Example -->
      <section class="code-example">
        <h2>Usage Example</h2>
        <pre><code>{{ codeExample }}</code></pre>
      </section>
    </main>

    <footer>
      <p>
        <a href="https://github.com/bejarcode/cornerKit" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        |
        <a
          href="https://github.com/bejarcode/cornerKit/tree/main/packages/vue#readme"
          target="_blank"
          rel="noopener noreferrer"
        >
          Documentation
        </a>
        |
        <a href="https://www.npmjs.com/package/@cornerkit/vue" target="_blank" rel="noopener noreferrer">
          npm
        </a>
      </p>
    </footer>
  </div>
</template>
