# @cornerkit/svelte

Svelte components and actions for iOS-style squircle (superellipse) corners.

[![npm version](https://img.shields.io/npm/v/@cornerkit/svelte.svg)](https://www.npmjs.com/package/@cornerkit/svelte)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@cornerkit/svelte)](https://bundlephobia.com/package/@cornerkit/svelte)

## Features

- **`<Squircle>` Component** - Declarative component with slot for content
- **`use:squircle` Action** - Apply squircle directly to any element
- **SSR Safe** - Works with SvelteKit out of the box
- **Svelte 3/4/5 Compatible** - Works with all modern Svelte versions (legacy mode for Svelte 5)
- **TypeScript Support** - Full type definitions with IntelliSense
- **Tiny Bundle** - ~2KB gzipped

## Installation

```bash
npm install @cornerkit/svelte @cornerkit/core
```

## Quick Start

### Component Usage

```svelte
<script>
  import { Squircle } from '@cornerkit/svelte';
</script>

<Squircle radius={20} smoothing={0.8}>
  <button>iOS-style button</button>
</Squircle>
```

### Action Usage

```svelte
<script>
  import { squircle } from '@cornerkit/svelte';
</script>

<!-- Full configuration -->
<div use:squircle={{ radius: 20, smoothing: 0.8 }}>
  Content with squircle corners
</div>

<!-- Number shorthand (radius only) -->
<div use:squircle={24}>
  Content with squircle corners
</div>
```

## API Reference

### `<Squircle>` Component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `radius` | `number` | `20` | Corner radius in pixels |
| `smoothing` | `number` | `0.8` | Curve smoothness (0-1) |
| `border` | `{ width: number, color: string }` | - | Optional border |
| `...` | - | - | All HTML attributes forwarded |

```svelte
<Squircle
  radius={24}
  smoothing={0.85}
  border={{ width: 2, color: '#3b82f6' }}
  class="my-card"
>
  <p>Card content</p>
</Squircle>
```

### `squircle` Action

Apply squircle corners directly to any element.

**Parameters:**
- `SquircleOptions | number` - Configuration object or radius shorthand

```svelte
<!-- Object configuration -->
<div use:squircle={{ radius: 20, smoothing: 0.8, border: { width: 1, color: 'gray' } }}>
  Content
</div>

<!-- Radius shorthand -->
<div use:squircle={20}>
  Content
</div>
```

**Reactive updates:**

```svelte
<script>
  import { squircle } from '@cornerkit/svelte';
  let radius = 20;
</script>

<input type="range" bind:value={radius} min="0" max="50" />
<div use:squircle={{ radius }}>
  Radius: {radius}px
</div>
```

## TypeScript

Full TypeScript support with exported types:

```svelte
<script lang="ts">
  import { Squircle, squircle } from '@cornerkit/svelte';
  import type { SquircleOptions, SquircleActionOptions } from '@cornerkit/svelte';

  const options: SquircleOptions = {
    radius: 20,
    smoothing: 0.8,
    border: { width: 2, color: '#000' }
  };
</script>

<Squircle {...options}>
  <button>Typed component</button>
</Squircle>
```

## SvelteKit / SSR

Works out of the box with SvelteKit. Squircle effects apply after hydration:

```svelte
<!-- +page.svelte -->
<script>
  import { Squircle } from '@cornerkit/svelte';
</script>

<Squircle radius={20}>
  <p>SSR-compatible content</p>
</Squircle>
```

## Examples

### Button Group

```svelte
<script>
  import { Squircle } from '@cornerkit/svelte';
</script>

<div class="flex gap-2">
  <Squircle radius={12}>
    <button class="px-4 py-2 bg-blue-500 text-white">Primary</button>
  </Squircle>
  <Squircle radius={12}>
    <button class="px-4 py-2 bg-gray-200">Secondary</button>
  </Squircle>
</div>
```

### Card with Image

```svelte
<script>
  import { squircle } from '@cornerkit/svelte';
</script>

<div use:squircle={24} class="overflow-hidden">
  <img src="/hero.jpg" alt="Hero" />
  <div class="p-4">
    <h2>Card Title</h2>
    <p>Card description...</p>
  </div>
</div>
```

### With Border

```svelte
<Squircle
  radius={20}
  smoothing={0.9}
  border={{ width: 2, color: '#e5e7eb' }}
  class="bg-white shadow-sm"
>
  <div class="p-6">
    Bordered card content
  </div>
</Squircle>
```

## Svelte Version Compatibility

| Version | Status | Notes |
|---------|--------|-------|
| Svelte 3.x | ✅ Supported | Full compatibility |
| Svelte 4.x | ✅ Supported | Recommended (tested) |
| Svelte 5.x | ✅ Supported | Works in legacy mode |

**Svelte 5 Note**: This package uses Svelte 4 syntax (`export let`, `$:` reactive statements) which works seamlessly in Svelte 5's legacy mode. No changes required.

## Browser Support

- Chrome 65+
- Firefox (latest 2 versions)
- Safari 14+
- Edge 79+

Older browsers gracefully degrade to standard `border-radius`.

## Related Packages

- [@cornerkit/core](https://www.npmjs.com/package/@cornerkit/core) - Core library (required peer dependency)
- [@cornerkit/react](https://www.npmjs.com/package/@cornerkit/react) - React integration
- [@cornerkit/vue](https://www.npmjs.com/package/@cornerkit/vue) - Vue 3 integration

## Running Examples

Check out the [examples directory](./examples/) for complete working examples:

```bash
# Build the package first
npm run build

# Run the basic example
cd examples/svelte-basic
npm install
npm run dev
```

## License

MIT
