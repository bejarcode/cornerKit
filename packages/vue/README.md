# @cornerkit/vue

Vue 3 components, composables, and directives for iOS-style squircle corners.

[![npm version](https://badge.fury.io/js/@cornerkit%2Fvue.svg)](https://www.npmjs.com/package/@cornerkit/vue)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@cornerkit/vue)](https://bundlephobia.com/package/@cornerkit/vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Three API styles**: Component, Composable, and Directive
- **Full TypeScript support** with IntelliSense
- **SSR-safe**: Works with Nuxt 3 out of the box
- **Zero runtime dependencies**: Only peer dependencies (Vue 3, @cornerkit/core)
- **Tiny bundle**: < 2KB gzipped

## Installation

```bash
npm install @cornerkit/vue @cornerkit/core
```

```bash
pnpm add @cornerkit/vue @cornerkit/core
```

```bash
yarn add @cornerkit/vue @cornerkit/core
```

## Quick Start

### Component (Recommended)

The simplest way to add squircle corners:

```vue
<script setup>
import { Squircle } from '@cornerkit/vue';
</script>

<template>
  <Squircle :radius="20" :smoothing="0.8">
    <button>iOS-style Button</button>
  </Squircle>
</template>
```

### Composable

For more control or existing components:

```vue
<script setup>
import { useSquircle } from '@cornerkit/vue';

const { ref: cardRef, update, remove } = useSquircle({
  radius: 24,
  smoothing: 0.85
});
</script>

<template>
  <div ref="cardRef" class="card">
    Content with squircle corners
  </div>
</template>
```

### Directive

For inline usage without wrapper:

```vue
<script setup>
import { vSquircle } from '@cornerkit/vue';
</script>

<template>
  <button v-squircle="{ radius: 20, smoothing: 0.8 }">
    Squircle Button
  </button>

  <!-- Shorthand (radius only) -->
  <div v-squircle="24" class="card">
    Quick squircle
  </div>
</template>
```

## API Reference

### `<Squircle>` Component

Declarative component for applying squircle corners.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `radius` | `number` | `20` | Corner radius in pixels |
| `smoothing` | `number` | `0.8` | Curve smoothness (0-1) |
| `border` | `{ width: number, color: string }` | - | Optional border styling |
| `tag` | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render |

#### Examples

```vue
<!-- Basic usage -->
<Squircle :radius="24">Content</Squircle>

<!-- As a button -->
<Squircle tag="button" :radius="16" @click="handleClick">
  Click me
</Squircle>

<!-- With border -->
<Squircle
  :radius="20"
  :smoothing="0.9"
  :border="{ width: 2, color: '#3b82f6' }"
>
  Card with border
</Squircle>

<!-- Access DOM element -->
<script setup>
const squircleRef = ref(null);
onMounted(() => console.log(squircleRef.value?.el));
</script>
<template>
  <Squircle ref="squircleRef">Content</Squircle>
</template>
```

### `useSquircle()` Composable

Composable for imperative squircle control.

#### Signature

```typescript
function useSquircle(options?: UseSquircleOptions): UseSquircleReturn;

interface UseSquircleOptions {
  radius?: number;
  smoothing?: number;
  border?: { width: number; color: string };
}

interface UseSquircleReturn {
  ref: Ref<HTMLElement | null>;
  update: (options: Partial<SquircleOptions>) => void;
  remove: () => void;
}
```

#### Examples

```vue
<script setup>
import { ref } from 'vue';
import { useSquircle } from '@cornerkit/vue';

// Basic usage
const { ref: cardRef } = useSquircle({ radius: 24 });

// With reactive options
const radius = ref(20);
const { ref: reactiveRef } = useSquircle({ radius: radius.value });

// Manual control
const { ref: controlRef, update, remove } = useSquircle({ radius: 20 });
function makeRounder() {
  update({ radius: 40 });
}

// Multiple instances
const { ref: ref1 } = useSquircle({ radius: 20 });
const { ref: ref2 } = useSquircle({ radius: 30 });
</script>

<template>
  <div ref="cardRef">Card 1</div>
  <div ref="reactiveRef">Card 2</div>
  <div ref="controlRef">Card 3</div>
  <button @click="makeRounder">Make Rounder</button>
</template>
```

### `v-squircle` Directive

Custom directive for inline squircle application.

#### Value Types

```typescript
type VSquircleValue = SquircleOptions | number;
```

#### Examples

```vue
<script setup>
import { vSquircle } from '@cornerkit/vue';
</script>

<template>
  <!-- Full config -->
  <div v-squircle="{ radius: 20, smoothing: 0.8 }">Full config</div>

  <!-- Number shorthand -->
  <div v-squircle="24">Radius only</div>

  <!-- With border -->
  <div v-squircle="{ radius: 20, border: { width: 2, color: 'blue' } }">
    With border
  </div>

  <!-- Reactive value -->
  <div v-squircle="config">Reactive</div>
</template>
```

#### Global Registration

```typescript
// main.ts
import { createApp } from 'vue';
import { vSquircle } from '@cornerkit/vue';
import App from './App.vue';

const app = createApp(App);
app.directive('squircle', vSquircle);
app.mount('#app');
```

## Borders & Hover Effects (v1.1.0+)

The `border` prop (component, composable, and directive) passes straight
through to `@cornerkit/core` (v1.2+ API), so every border style works: solid,
dashed, dotted, custom dash patterns, and gradients.

```vue
<template>
  <!-- Dashed border -->
  <Squircle :radius="20" :border="{ width: 2, color: '#6b7280', style: 'dashed' }">
    Drop zone
  </Squircle>

  <!-- Gradient border -->
  <Squircle
    :radius="24"
    :border="{
      width: 3,
      gradient: [
        { offset: '0%', color: '#3b82f6' },
        { offset: '100%', color: '#8b5cf6' },
      ],
    }"
  >
    Featured card
  </Squircle>

  <!-- Explicitly no border (overrides instance defaults / removes on update) -->
  <Squircle :radius="20" :border="null">Content</Squircle>
</template>
```

**Hover effects need no props** (core v1.3+): the border stroke and background
resolve through CSS custom properties, so plain CSS restyles them:

```css
.cta:hover {
  --ck-border-color: #8b5cf6;  /* border stroke on hover */
  --ck-background: #1e293b;    /* squircle background on hover */
}
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  SquircleProps,
  SquircleExpose,
  SquircleOptions,
  SquircleBorderConfig,
  UseSquircleOptions,
  UseSquircleReturn,
  VSquircleValue,
  VSquircleDirective,
} from '@cornerkit/vue';
```

## SSR / Nuxt 3

Works out of the box with Nuxt 3 and other SSR frameworks:

```vue
<!-- pages/index.vue -->
<script setup>
import { Squircle } from '@cornerkit/vue';
</script>

<template>
  <Squircle :radius="20">
    <NuxtLink to="/about">About</NuxtLink>
  </Squircle>
</template>
```

No special configuration needed - all DOM operations are deferred to `onMounted`.

## Common Patterns

### Card Component

```vue
<script setup>
import { Squircle } from '@cornerkit/vue';

defineProps<{
  title: string;
}>();
</script>

<template>
  <Squircle :radius="16" :smoothing="0.8" class="card">
    <h3>{{ title }}</h3>
    <slot />
  </Squircle>
</template>

<style scoped>
.card {
  padding: 1.5rem;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
```

### Button with Hover Effect

```vue
<script setup>
import { ref, computed } from 'vue';
import { Squircle } from '@cornerkit/vue';

const isHovered = ref(false);
const radius = computed(() => isHovered.value ? 24 : 16);
</script>

<template>
  <Squircle
    tag="button"
    :radius="radius"
    :smoothing="0.85"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    Hover me
  </Squircle>
</template>
```

### List with v-for

```vue
<script setup>
import { Squircle } from '@cornerkit/vue';

const items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
];
</script>

<template>
  <Squircle
    v-for="item in items"
    :key="item.id"
    :radius="12"
    class="list-item"
  >
    {{ item.name }}
  </Squircle>
</template>
```

## Browser Support

Supports all browsers that Vue 3 supports. The underlying `@cornerkit/core` library uses progressive enhancement to choose the best rendering method.

## Related Packages

- [@cornerkit/core](https://www.npmjs.com/package/@cornerkit/core) - Framework-agnostic core library
- [@cornerkit/react](https://www.npmjs.com/package/@cornerkit/react) - React components and hooks

## License

MIT
