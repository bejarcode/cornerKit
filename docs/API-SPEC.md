# cornerKit - API Specification

**Version:** 1.0.0
**Last Updated:** 2025-01-08

---

## Table of Contents

- [Core API](#core-api)
- [TypeScript Types](#typescript-types)
- [React API](#react-api)
- [Vue API](#vue-api)
- [Web Component API](#web-component-api)
- [Shopify Liquid API](#shopify-liquid-api)

---

## Core API

### Constructor

#### `new CornerKit(options?)`

Creates a new CornerKit instance with optional global configuration.

**Signature:**
```typescript
constructor(options?: CornerKitOptions): CornerKit
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options` | `CornerKitOptions` | `{}` | Global configuration options |

**Example:**
```javascript
import CornerKit from '@cornerkit/core';

const ck = new CornerKit({
  radius: 16,
  smoothing: 0.8,
  lazyLoad: true,
  debug: false
});
```

---

### Instance Methods

#### `.apply(selector, config?)`

Applies squircle styling to a single element.

**Signature:**
```typescript
apply(selector: string | Element, config?: SquircleConfig): void
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `selector` | `string \| Element` | Yes | CSS selector or DOM element |
| `config` | `SquircleConfig` | No | Element-specific configuration |

**Example:**
```javascript
// Using selector
ck.apply('#my-button', {
  radius: 20,
  smoothing: 0.85
});

// Using element reference
const button = document.querySelector('#my-button');
ck.apply(button, {
  radius: 20,
  smoothing: 0.85
});
```

**Returns:** `void`

**Throws:**
- `TypeError` if selector is invalid
- `Error` if element not found

---

#### `.applyAll(selector, config?)`

Applies squircle styling to multiple elements.

**Signature:**
```typescript
applyAll(selector: string, config?: SquircleConfig): void
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `selector` | `string` | Yes | CSS selector |
| `config` | `SquircleConfig` | No | Configuration for all matched elements |

**Example:**
```javascript
ck.applyAll('.squircle-card', {
  radius: 24,
  smoothing: 0.9
});
```

**Returns:** `void`

---

#### `.auto(options?)`

Automatically applies squircle styling to all `[data-squircle]` elements.

**Signature:**
```typescript
auto(options?: AutoOptions): void
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options` | `AutoOptions` | `{}` | Auto-detection options |

**Example:**
```javascript
// Initialize with defaults
ck.auto();

// With custom root element
ck.auto({
  rootElement: document.querySelector('#app'),
  observeDOM: true
});
```

**HTML:**
```html
<div
  data-squircle
  data-squircle-radius="20"
  data-squircle-smoothing="0.85"
>
  Content
</div>
```

**Returns:** `void`

---

#### `.update(selector, config)`

Updates the configuration of an existing squircle element.

**Signature:**
```typescript
update(selector: string | Element, config: Partial<SquircleConfig>): void
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `selector` | `string \| Element` | Yes | CSS selector or DOM element |
| `config` | `Partial<SquircleConfig>` | Yes | Partial configuration to merge |

**Example:**
```javascript
// Animate on hover
button.addEventListener('mouseenter', () => {
  ck.update(button, { radius: 24, smoothing: 0.95 });
});

button.addEventListener('mouseleave', () => {
  ck.update(button, { radius: 16, smoothing: 0.85 });
});
```

**Returns:** `void`

---

#### `.remove(selector)`

Removes squircle styling from an element.

**Signature:**
```typescript
remove(selector: string | Element): void
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `selector` | `string \| Element` | Yes | CSS selector or DOM element |

**Example:**
```javascript
ck.remove('#my-button');
```

**Returns:** `void`

---

#### `.inspect(selector)`

Returns diagnostic information about a squircle element.

**Signature:**
```typescript
inspect(selector: string | Element): SquircleInfo | null
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `selector` | `string \| Element` | Yes | CSS selector or DOM element |

**Example:**
```javascript
const info = ck.inspect('#my-button');
console.log(info);
// {
//   tier: 'clippath',
//   radius: 20,
//   smoothing: 0.85,
//   dimensions: { width: 200, height: 48 },
//   performance: { lastRenderTime: 5.2 }
// }
```

**Returns:** `SquircleInfo | null`

---

#### `.destroy()`

Cleans up all observers and removes all squircle styling.

**Signature:**
```typescript
destroy(): void
```

**Example:**
```javascript
// Cleanup when component unmounts
ck.destroy();
```

**Returns:** `void`

---

## TypeScript Types

### `CornerKitOptions`

Global configuration for CornerKit instance.

```typescript
interface CornerKitOptions {
  /**
   * Default corner radius in pixels
   * @default 16
   */
  radius?: number;

  /**
   * Default smoothing factor (0-1)
   * - 0 = sharp corners (n=4, squircle)
   * - 1 = very smooth (n=2, circle)
   * @default 0.8
   */
  smoothing?: number;

  /**
   * Enable lazy loading with Intersection Observer
   * @default true
   */
  lazyLoad?: boolean;

  /**
   * Debounce delay for resize events in milliseconds
   * @default 150
   */
  debounceResize?: number;

  /**
   * Prefer native CSS corner-shape when available
   * @default true
   */
  preferNative?: boolean;

  /**
   * Enable Houdini Paint API when available
   * @default true
   */
  enableHoudini?: boolean;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Log performance metrics
   * @default false
   */
  logPerformance?: boolean;
}
```

---

### `SquircleConfig`

Per-element squircle configuration.

```typescript
interface SquircleConfig {
  /**
   * Corner radius in pixels
   * Must be >= 0
   */
  radius: number;

  /**
   * Smoothing factor (0-1)
   * - 0 = sharp (squircle)
   * - 1 = smooth (circle)
   * Must be between 0 and 1
   */
  smoothing: number;

  /**
   * Fill color (optional)
   * Any valid CSS color value
   */
  fill?: string;

  /**
   * Stroke color (optional)
   * Any valid CSS color value
   */
  stroke?: string;

  /**
   * Stroke width in pixels (optional)
   * @default 0
   */
  strokeWidth?: number;
}
```

---

### `AutoOptions`

Options for auto-detection mode.

```typescript
interface AutoOptions {
  /**
   * Root element to search within
   * @default document.body
   */
  rootElement?: Element;

  /**
   * Observe DOM changes and auto-apply to new elements
   * @default false
   */
  observeDOM?: boolean;

  /**
   * Intersection Observer options for lazy loading
   */
  intersectionOptions?: IntersectionObserverInit;
}
```

---

### `RenderTier`

Enum representing the rendering method used.

```typescript
enum RenderTier {
  /**
   * Native CSS corner-shape: squircle
   * Browser: Chrome 139+
   */
  NATIVE = 'native',

  /**
   * CSS Houdini Paint API
   * Browser: Chrome 65+, Edge 79+
   */
  HOUDINI = 'houdini',

  /**
   * SVG clip-path with dynamic path generation
   * Browser: All modern browsers
   */
  CLIPPATH = 'clippath',

  /**
   * Standard CSS border-radius fallback
   * Browser: Universal
   */
  FALLBACK = 'fallback'
}
```

---

### `SquircleInfo`

Diagnostic information about a squircle element.

```typescript
interface SquircleInfo {
  /**
   * Rendering tier being used
   */
  tier: RenderTier;

  /**
   * Current corner radius
   */
  radius: number;

  /**
   * Current smoothing factor
   */
  smoothing: number;

  /**
   * Element dimensions
   */
  dimensions: {
    width: number;
    height: number;
  };

  /**
   * Performance metrics
   */
  performance: {
    /**
     * Last render time in milliseconds
     */
    lastRenderTime: number;

    /**
     * Total renders since initialization
     */
    renderCount: number;

    /**
     * Average render time in milliseconds
     */
    avgRenderTime: number;
  };

  /**
   * Whether element is currently visible
   */
  isVisible: boolean;

  /**
   * Whether element is connected to DOM
   */
  isConnected: boolean;
}
```

---

## React API

### Component: `<Squircle>`

A React component that renders an element with squircle corners.

**Import:**
```typescript
import { Squircle } from '@cornerkit/react';
```

**Props:**
```typescript
interface SquircleProps {
  /**
   * HTML element type to render
   * @default 'div'
   */
  as?: React.ElementType;

  /**
   * Corner radius in pixels
   * @default 16
   */
  radius?: number;

  /**
   * Smoothing factor (0-1)
   * @default 0.8
   */
  smoothing?: number;

  /**
   * Fill color
   */
  fill?: string;

  /**
   * CSS class name
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: React.CSSProperties;

  /**
   * Animation configuration
   */
  animate?: AnimationConfig;

  /**
   * Children elements
   */
  children?: React.ReactNode;

  /**
   * All other HTML attributes
   */
  [key: string]: any;
}
```

**Example:**
```tsx
import { Squircle } from '@cornerkit/react';

function MyButton() {
  return (
    <Squircle
      as="button"
      radius={20}
      smoothing={0.85}
      fill="#000000"
      className="my-button"
      onClick={() => console.log('clicked')}
    >
      Click me
    </Squircle>
  );
}
```

---

### Hook: `useSquircle()`

A React hook for applying squircle styling to existing elements.

**Import:**
```typescript
import { useSquircle } from '@cornerkit/react';
```

**Signature:**
```typescript
function useSquircle(config: SquircleConfig): React.RefObject<HTMLElement>
```

**Example:**
```tsx
import { useSquircle } from '@cornerkit/react';

function MyCard() {
  const ref = useSquircle({
    radius: 24,
    smoothing: 0.9
  });

  return (
    <div ref={ref} className="card">
      Content
    </div>
  );
}
```

**With State:**
```tsx
import { useState } from 'react';
import { useSquircle } from '@cornerkit/react';

function AnimatedButton() {
  const [isHovered, setIsHovered] = useState(false);

  const ref = useSquircle({
    radius: isHovered ? 24 : 16,
    smoothing: isHovered ? 0.95 : 0.85
  });

  return (
    <button
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      Hover me
    </button>
  );
}
```

---

### Type: `AnimationConfig`

Configuration for animated transitions.

```typescript
interface AnimationConfig {
  /**
   * Animation duration in milliseconds
   * @default 300
   */
  duration?: number;

  /**
   * Easing function
   * @default 'ease-out'
   */
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | string;

  /**
   * Delay before animation starts
   * @default 0
   */
  delay?: number;
}
```

---

## Vue API

### Component: `<Squircle>`

A Vue 3 component for rendering squircle elements.

**Import:**
```typescript
import { Squircle } from '@cornerkit/vue';
```

**Props:**
```typescript
interface SquircleProps {
  /**
   * HTML element type to render
   * @default 'div'
   */
  as?: string;

  /**
   * Corner radius in pixels
   * @default 16
   */
  radius?: number;

  /**
   * Smoothing factor (0-1)
   * @default 0.8
   */
  smoothing?: number;

  /**
   * Fill color
   */
  fill?: string;

  /**
   * CSS class
   */
  class?: string;

  /**
   * Inline styles
   */
  style?: Record<string, string | number>;
}
```

**Example:**
```vue
<template>
  <Squircle
    as="button"
    :radius="20"
    :smoothing="0.85"
    fill="#000000"
    class="my-button"
    @click="handleClick"
  >
    Click me
  </Squircle>
</template>

<script setup lang="ts">
import { Squircle } from '@cornerkit/vue';

const handleClick = () => {
  console.log('clicked');
};
</script>
```

---

### Composable: `useSquircle()`

A Vue 3 composable for applying squircle styling.

**Import:**
```typescript
import { useSquircle } from '@cornerkit/vue';
```

**Signature:**
```typescript
function useSquircle(
  config: Ref<SquircleConfig> | SquircleConfig
): {
  ref: Ref<HTMLElement | null>;
  update: (newConfig: Partial<SquircleConfig>) => void;
}
```

**Example:**
```vue
<template>
  <div ref="elementRef" class="card">
    Content
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSquircle } from '@cornerkit/vue';

const { ref: elementRef, update } = useSquircle({
  radius: 24,
  smoothing: 0.9
});

// Update programmatically
const handleHover = () => {
  update({ radius: 32 });
};
</script>
```

---

## Web Component API

### Element: `<squircle-shape>`

A native Web Component for squircle elements.

**Import:**
```javascript
import '@cornerkit/web-component';
```

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `radius` | `number` | `16` | Corner radius in pixels |
| `smoothing` | `number` | `0.8` | Smoothing factor (0-1) |
| `fill` | `string` | - | Fill color |
| `stroke` | `string` | - | Stroke color |
| `stroke-width` | `number` | `0` | Stroke width |

**Example:**
```html
<squircle-shape radius="20" smoothing="0.85" fill="#ffffff">
  <button>Click me</button>
</squircle-shape>
```

**JavaScript API:**
```javascript
const squircle = document.querySelector('squircle-shape');

// Get/set properties
squircle.radius = 32;
squircle.smoothing = 0.9;

// Listen to events
squircle.addEventListener('tier-changed', (e) => {
  console.log('Now using tier:', e.detail.tier);
});

squircle.addEventListener('render', (e) => {
  console.log('Rendered in:', e.detail.renderTime, 'ms');
});
```

**Custom Events:**

| Event | Detail | Description |
|-------|--------|-------------|
| `tier-changed` | `{ tier: RenderTier }` | Fired when rendering tier changes |
| `render` | `{ renderTime: number }` | Fired after each render |
| `error` | `{ error: Error }` | Fired on render errors |

---

## Shopify Liquid API

### Snippet: `squircle.liquid`

Renders a squircle element in Shopify themes.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `tag` | `string` | `'div'` | HTML tag to render |
| `class` | `string` | `''` | CSS class names |
| `radius` | `number` | `16` | Corner radius in pixels |
| `smoothing` | `number` | `0.8` | Smoothing factor |
| `content` | `string` | `''` | Inner content |
| `attributes` | `string` | `''` | Additional HTML attributes |

**Example:**
```liquid
{% render 'squircle',
  tag: 'button',
  class: 'product-cta',
  radius: 20,
  smoothing: 0.85,
  content: 'Add to Cart',
  attributes: 'data-product-id="{{ product.id }}"'
%}
```

**Output:**
```html
<button
  class="squircle product-cta"
  data-squircle
  data-squircle-radius="20"
  data-squircle-smoothing="0.85"
  data-product-id="123456789"
  style="--squircle-radius: 20px; --squircle-smoothing: 0.85;"
>
  Add to Cart
</button>
```

---

### Snippet: `squircle-wrapper.liquid`

Renders a squircle with advanced styling options.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `radius` | `number` | `20` | Corner radius |
| `smoothing` | `number` | `0.8` | Smoothing factor |
| `fill` | `string` | `'white'` | Background color |
| `stroke` | `string` | `''` | Border color |
| `stroke_width` | `number` | `0` | Border width |
| `shadow` | `boolean` | `false` | Enable shadow |
| `content` | `string` | `''` | Inner content |

**Example:**
```liquid
{% render 'squircle-wrapper',
  radius: 24,
  smoothing: 0.85,
  fill: '#ffffff',
  stroke: '#e5e7eb',
  stroke_width: 1,
  shadow: true,
  content: product_card_html
%}
```

---

## Error Handling

### Error Types

All errors thrown by cornerKit are instances of standard `Error` with descriptive messages.

```typescript
try {
  ck.apply('#invalid-selector', { radius: -10 });
} catch (error) {
  console.error(error.message);
  // "Invalid radius: must be >= 0"
}
```

### Common Errors

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `"Invalid radius: must be >= 0"` | Negative radius value | Use non-negative number |
| `"Invalid smoothing: must be between 0 and 1"` | Smoothing out of range | Use value between 0-1 |
| `"Element not found"` | Selector didn't match any elements | Check selector string |
| `"Element not connected to DOM"` | Trying to render detached element | Ensure element is in DOM |

---

## Browser Compatibility

### Feature Detection

cornerKit automatically detects browser capabilities:

```javascript
import { detectCapabilities, RenderTier } from '@cornerkit/core';

const tier = detectCapabilities();

if (tier === RenderTier.NATIVE) {
  console.log('Native CSS squircles supported!');
} else if (tier === RenderTier.HOUDINI) {
  console.log('Using Houdini Paint API');
} else if (tier === RenderTier.CLIPPATH) {
  console.log('Using SVG clip-path');
} else {
  console.log('Falling back to border-radius');
}
```

---

## Migration Guide

### From border-radius

**Before:**
```css
.button {
  border-radius: 16px;
}
```

**After:**
```javascript
import CornerKit from '@cornerkit/core';

const ck = new CornerKit();
ck.apply('.button', { radius: 16, smoothing: 0.8 });
```

### From figma-squircle

**Before:**
```javascript
import { getSuperellipsePath } from 'figma-squircle';

const path = getSuperellipsePath({
  width: 200,
  height: 100,
  cornerRadius: 20,
  cornerSmoothing: 0.8
});
```

**After:**
```javascript
import CornerKit from '@cornerkit/core';

const ck = new CornerKit();
ck.apply('#my-element', { radius: 20, smoothing: 0.8 });
// Path generation handled automatically
```

---

## Performance Best Practices

1. **Use lazy loading for off-screen elements:**
   ```javascript
   const ck = new CornerKit({ lazyLoad: true });
   ```

2. **Debounce resize events:**
   ```javascript
   const ck = new CornerKit({ debounceResize: 150 });
   ```

3. **Destroy instances when done:**
   ```javascript
   componentWillUnmount() {
     ck.destroy();
   }
   ```

4. **Batch updates:**
   ```javascript
   // Good: Single applyAll call
   ck.applyAll('.card', { radius: 24 });

   // Avoid: Multiple individual calls
   document.querySelectorAll('.card').forEach(el => {
     ck.apply(el, { radius: 24 });
   });
   ```

---

## Versioning

cornerKit follows [Semantic Versioning 2.0.0](https://semver.org/):

- **Major (1.x.x):** Breaking API changes
- **Minor (x.1.x):** New features, backwards compatible
- **Patch (x.x.1):** Bug fixes, backwards compatible
