# cornerKit

> iOS-style squircle corners for the web with zero dependencies

[![npm version](https://img.shields.io/npm/v/cornerkit.svg)](https://www.npmjs.com/package/cornerkit)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/cornerkit)](https://bundlephobia.com/package/cornerkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A lightweight (~5KB gzipped), framework-agnostic JavaScript library for creating smooth, continuous squircle corners—the signature curved corners popularized by Apple's iOS design language. cornerKit automatically detects browser capabilities and uses the optimal rendering method for each environment.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Browser Support](#browser-support)
- [API Reference](#api-reference)
  - [Core API](#core-api)
  - [Configuration Options](#configuration-options)
  - [Methods](#methods)
- [Framework Integrations](#framework-integrations)
  - [React](#react)
  - [Vue](#vue)
  - [Web Components](#web-components)
  - [Svelte](#svelte)
- [Advanced Usage](#advanced-usage)
  - [Custom Renderers](#custom-renderers)
  - [Performance Optimization](#performance-optimization)
  - [Responsive Design](#responsive-design)
- [Progressive Enhancement Strategy](#progressive-enhancement-strategy)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

---

## Features

✨ **4-Tier Progressive Enhancement**
- Native CSS `corner-shape` (Chrome 139+)
- CSS Houdini Paint API (Chrome 65+, Edge)
- SVG `clip-path` with dynamic paths (Modern browsers)
- `border-radius` fallback (Universal)

🎯 **Developer Experience**
- Zero dependencies
- Framework agnostic (React, Vue, Svelte, vanilla JS)
- TypeScript support with full type definitions
- Tree-shakeable ES modules
- Declarative HTML attributes or programmatic API

⚡ **Performance**
- Lazy loading with Intersection Observer
- GPU-accelerated when available
- Automatic resize handling with debouncing
- < 5KB gzipped bundle size

🎨 **Flexible Configuration**
- Configurable radius and smoothing parameters
- Per-element customization
- Responsive breakpoint support
- Container query compatibility
- Animatable properties

---

## Installation

### npm

```bash
npm install cornerkit
```

### yarn

```bash
yarn add cornerkit
```

### pnpm

```bash
pnpm add cornerkit
```

### CDN

```html
<!-- ES Module -->
<script type="module">
  import CornerKit from 'https://cdn.jsdelivr.net/npm/cornerkit/+esm';
</script>

<!-- UMD (Global) -->
<script src="https://cdn.jsdelivr.net/npm/cornerkit"></script>
```

---

## Quick Start

### Vanilla JavaScript

```javascript
import CornerKit from 'cornerkit';

// Initialize
const ck = new CornerKit();

// Apply to element
ck.apply('#my-button', {
  radius: 20,
  smoothing: 0.85
});

// Or use declarative HTML attributes
ck.auto(); // Finds all [data-squircle] elements
```

```html
<!-- Declarative HTML -->
<div
  data-squircle
  data-squircle-radius="20"
  data-squircle-smoothing="0.85"
>
  Beautiful squircle corners
</div>
```

### React

```jsx
import { Squircle } from 'cornerkit/react';

function MyButton() {
  return (
    <Squircle
      as="button"
      radius={20}
      smoothing={0.85}
      className="btn"
    >
      Click me
    </Squircle>
  );
}
```

### Vue

```vue
<template>
  <Squircle :radius="20" :smoothing="0.85">
    <button>Click me</button>
  </Squircle>
</template>

<script setup>
import { Squircle } from 'cornerkit/vue';
</script>
```

---

## Browser Support

| Browser | Rendering Tier | Performance | Notes |
|---------|----------------|-------------|-------|
| Chrome 139+ | Native CSS `corner-shape` | ⚡⚡⚡ Fastest | GPU-accelerated, 0ms JS |
| Chrome 65-138 | Houdini Paint API | ⚡⚡ Very Fast | Paint thread, ~2ms |
| Firefox 90+ | `clip-path` | ⚡ Fast | Main thread, ~5-10ms |
| Safari 14+ | `clip-path` | ⚡ Fast | Main thread, ~5-10ms |
| Edge 79+ | Houdini Paint API | ⚡⚡ Very Fast | Paint thread, ~2ms |
| IE 11 | `border-radius` fallback | ✅ Works | No squircle, rounded corners |

**Total Coverage**: 98%+ of global users

---

## API Reference

### Core API

#### `new CornerKit(options)`

Creates a new cornerKit instance.

**Parameters:**

```typescript
interface CornerKitOptions {
  // Default styling
  radius?: number;              // Default: 16 (px)
  smoothing?: number;           // Default: 0.8 (0-1 scale)

  // Performance
  lazyLoad?: boolean;           // Default: true
  debounceResize?: number;      // Default: 150 (ms)
  observeResize?: boolean;      // Default: true

  // Rendering preferences
  preferNative?: boolean;       // Default: true
  enableHoudini?: boolean;      // Default: true
  forceRenderer?: RenderTier;   // Override auto-detection

  // Debug
  debug?: boolean;              // Default: false
  logPerformance?: boolean;     // Default: false

  // Callbacks
  onTierDetected?: (tier: RenderTier) => void;
  onElementProcessed?: (element: Element, config: SquircleConfig) => void;
  onError?: (error: Error, element?: Element) => void;
}
```

**Example:**

```javascript
const ck = new CornerKit({
  radius: 20,
  smoothing: 0.85,
  lazyLoad: true,
  debug: process.env.NODE_ENV === 'development',
  onTierDetected: (tier) => {
    console.log(`Using ${tier} rendering`);
  }
});
```

---

### Configuration Options

#### `radius`

The corner radius in pixels.

- **Type**: `number`
- **Default**: `16`
- **Range**: `0` to `Infinity` (practical limit: half of smallest dimension)
- **Recommended Values**:
  - Buttons: `12-16px`
  - Cards: `20-28px`
  - Large containers: `32-48px`
  - Avatar badges: `~20% of container size`

**Example:**

```javascript
ck.apply('.button', { radius: 14 });
ck.apply('.card', { radius: 24 });
ck.apply('.avatar', { radius: 40 });
```

#### `smoothing`

Controls the "squircleness" of the curve—how much it deviates from a standard circle.

- **Type**: `number`
- **Default**: `0.8`
- **Range**: `0.0` to `1.0`
- **Scale**:
  - `0.0` = Sharp corners (square with minimal rounding)
  - `0.5` = Moderate squircle
  - `0.8` = iOS-style squircle (recommended)
  - `1.0` = Nearly circular (ellipse)

**Mathematical Relationship:**

The smoothing value maps to the superellipse exponent `n`:
```
n = 2 + (4 - 2) × (1 - smoothing)
```

Where:
- `n = 2`: Ellipse/circle
- `n = 4`: Perfect squircle
- Higher `n`: More rectangular

**Example:**

```javascript
// Sharp, subtle curve
ck.apply('.card--sharp', { smoothing: 0.5 });

// iOS-like (recommended)
ck.apply('.card--ios', { smoothing: 0.8 });

// Very smooth, almost circular
ck.apply('.card--smooth', { smoothing: 0.95 });
```

---

### Methods

#### `apply(selector, config)`

Applies squircle styling to a single element or the first matching element.

**Parameters:**
- `selector` (string | Element): CSS selector or DOM element
- `config` (SquircleConfig): Configuration object

**Returns:** `void`

**Example:**

```javascript
// String selector
ck.apply('#my-button', { radius: 20, smoothing: 0.85 });

// Direct element reference
const button = document.querySelector('.cta-button');
ck.apply(button, { radius: 24, smoothing: 0.9 });
```

---

#### `applyAll(selector, config)`

Applies squircle styling to all matching elements.

**Parameters:**
- `selector` (string | NodeList | Element[]): CSS selector, NodeList, or array of elements
- `config` (SquircleConfig): Configuration object

**Returns:** `void`

**Example:**

```javascript
// All buttons
ck.applyAll('button', { radius: 12, smoothing: 0.8 });

// All cards
ck.applyAll('.card', { radius: 24, smoothing: 0.85 });

// NodeList
const cards = document.querySelectorAll('.product-card');
ck.applyAll(cards, { radius: 20 });
```

---

#### `auto(options)`

Automatically discovers and applies squircles to elements with `data-squircle` attributes.

**Parameters:**
- `options` (AutoOptions): Optional configuration

```typescript
interface AutoOptions {
  rootElement?: Element;        // Default: document.documentElement
  observeMutations?: boolean;   // Default: false (watch for new elements)
  attributePrefix?: string;     // Default: 'data-squircle'
}
```

**Returns:** `void`

**Example:**

```javascript
// Basic usage
ck.auto();

// With mutation observer (SPA support)
ck.auto({ observeMutations: true });

// Scoped to container
ck.auto({ rootElement: document.querySelector('.app') });
```

**HTML:**

```html
<div
  data-squircle
  data-squircle-radius="20"
  data-squircle-smoothing="0.85"
>
  Auto-detected squircle
</div>
```

---

#### `update(selector, config)`

Updates the configuration of an existing squircle element.

**Parameters:**
- `selector` (string | Element): CSS selector or DOM element
- `config` (Partial<SquircleConfig>): Partial configuration (only changed properties)

**Returns:** `void`

**Example:**

```javascript
// Initial application
ck.apply('.button', { radius: 16, smoothing: 0.8 });

// Later, update only radius
ck.update('.button', { radius: 20 });

// Animate smoothing on hover
button.addEventListener('mouseenter', () => {
  ck.update(button, { smoothing: 0.95 });
});

button.addEventListener('mouseleave', () => {
  ck.update(button, { smoothing: 0.8 });
});
```

---

#### `remove(selector)`

Removes squircle styling from an element and cleans up observers.

**Parameters:**
- `selector` (string | Element): CSS selector or DOM element

**Returns:** `void`

**Example:**

```javascript
// Remove from single element
ck.remove('#my-button');

// Remove from element reference
const card = document.querySelector('.card');
ck.remove(card);
```

---

#### `inspect(selector)`

Returns detailed information about a squircle element's configuration and rendering state.

**Parameters:**
- `selector` (string | Element): CSS selector or DOM element

**Returns:** `SquircleInfo | null`

```typescript
interface SquircleInfo {
  tier: RenderTier;              // Which rendering method is used
  config: SquircleConfig;        // Current configuration
  dimensions: {
    width: number;
    height: number;
  };
  performance: {
    lastRenderTime: number;      // ms
    renderCount: number;
  };
  element: Element;
}
```

**Example:**

```javascript
const info = ck.inspect('#my-button');

if (info) {
  console.log(`Rendering with: ${info.tier}`);
  console.log(`Radius: ${info.config.radius}px`);
  console.log(`Smoothing: ${info.config.smoothing}`);
  console.log(`Last render: ${info.performance.lastRenderTime}ms`);
}
```

---

#### `getTier()`

Returns the detected rendering tier for the current browser.

**Returns:** `RenderTier`

```typescript
enum RenderTier {
  NATIVE = 'native',      // CSS corner-shape
  HOUDINI = 'houdini',    // Paint API
  CLIPPATH = 'clippath',  // SVG clip-path
  FALLBACK = 'fallback'   // border-radius
}
```

**Example:**

```javascript
const tier = ck.getTier();

if (tier === 'native') {
  console.log('Browser supports native CSS squircles!');
} else if (tier === 'houdini') {
  console.log('Using Houdini Paint API for GPU acceleration');
}
```

---

#### `destroy()`

Destroys the cornerKit instance, removing all event listeners and observers.

**Returns:** `void`

**Example:**

```javascript
// Cleanup on unmount (React example)
useEffect(() => {
  const ck = new CornerKit();
  ck.auto();

  return () => {
    ck.destroy();
  };
}, []);
```

---

## Framework Integrations

### React

#### Installation

The React integration is included with the main package:

```bash
npm install cornerkit
```

#### `<Squircle>` Component

A wrapper component that renders children inside a squircle container.

**Props:**

```typescript
interface SquircleProps {
  // Styling
  radius?: number;
  smoothing?: number;

  // HTML attributes
  as?: keyof JSX.IntrinsicElements;  // Default: 'div'
  className?: string;
  style?: React.CSSProperties;

  // Animation
  animate?: boolean | {
    duration?: number;               // ms, default: 300
    easing?: string;                 // CSS easing, default: 'ease-out'
  };

  // Events
  onClick?: React.MouseEventHandler;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;

  // Children
  children?: React.ReactNode;

  // Advanced
  forceRenderer?: RenderTier;
  onRendered?: (tier: RenderTier) => void;
}
```

**Example:**

```tsx
import { Squircle } from 'cornerkit/react';

function ProductCard({ product }) {
  return (
    <Squircle
      as="article"
      radius={24}
      smoothing={0.85}
      className="product-card"
      animate={{ duration: 400, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </Squircle>
  );
}
```

#### `useSquircle` Hook

A React hook for applying squircles to existing elements via refs.

**Signature:**

```typescript
function useSquircle(
  config?: SquircleConfig,
  deps?: React.DependencyList
): React.RefObject<HTMLElement>
```

**Example:**

```tsx
import { useSquircle } from 'cornerkit/react';

function CustomButton({ children }) {
  const [isHovered, setIsHovered] = useState(false);

  const ref = useSquircle({
    radius: isHovered ? 24 : 16,
    smoothing: 0.85,
  }, [isHovered]);

  return (
    <button
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
}
```

#### Advanced React Example

```tsx
import { Squircle, useSquircle, SquircleProvider } from 'cornerkit/react';

// App-level configuration
function App() {
  return (
    <SquircleProvider defaultRadius={20} defaultSmoothing={0.85}>
      <ProductGrid />
    </SquircleProvider>
  );
}

// Component using context defaults
function ProductCard({ product }) {
  const [radius, setRadius] = useState(20);

  return (
    <Squircle
      radius={radius}
      smoothing={0.85}
      animate
      onMouseEnter={() => setRadius(28)}
      onMouseLeave={() => setRadius(20)}
    >
      <img src={product.image} />
      <h3>{product.name}</h3>
    </Squircle>
  );
}
```

---

### Vue

#### Installation

```bash
npm install cornerkit
```

#### `<Squircle>` Component

**Props:**

```typescript
interface SquircleProps {
  radius?: number;
  smoothing?: number;
  as?: string;              // Default: 'div'
  animate?: boolean;
  forceRenderer?: RenderTier;
}
```

**Example:**

```vue
<template>
  <Squircle
    :radius="20"
    :smoothing="0.85"
    as="button"
    :animate="true"
    @click="handleClick"
  >
    <slot />
  </Squircle>
</template>

<script setup>
import { Squircle } from 'cornerkit/vue';

const handleClick = () => {
  console.log('Clicked!');
};
</script>
```

#### Composable: `useSquircle`

```vue
<template>
  <div ref="squircleRef" class="card">
    {{ content }}
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useSquircle } from 'cornerkit/vue';

const props = defineProps({
  radius: { type: Number, default: 20 }
});

const squircleRef = useSquircle({
  radius: props.radius,
  smoothing: 0.85
});

// Update when props change
watch(() => props.radius, (newRadius) => {
  squircleRef.update({ radius: newRadius });
});
</script>
```

---

### Web Components

#### Installation & Registration

```javascript
import 'cornerkit/web-component';
```

This automatically registers the `<squircle-shape>` custom element.

#### Usage

```html
<squircle-shape radius="20" smoothing="0.85" fill="#ffffff">
  <button>Click me</button>
</squircle-shape>
```

#### Attributes

- `radius`: Number (px)
- `smoothing`: Number (0-1)
- `fill`: CSS color
- `animate`: Boolean attribute

#### JavaScript API

```javascript
const squircle = document.querySelector('squircle-shape');

// Get/set properties
console.log(squircle.radius);
squircle.radius = 32;
squircle.smoothing = 0.9;

// Listen to events
squircle.addEventListener('rendered', (e) => {
  console.log('Rendered with tier:', e.detail.tier);
});

squircle.addEventListener('tier-changed', (e) => {
  console.log('Tier changed to:', e.detail.newTier);
});
```

---

### Svelte

#### Example

```svelte
<script>
  import { onMount } from 'svelte';
  import CornerKit from 'cornerkit';

  let squircleElement;
  let radius = 20;

  onMount(() => {
    const ck = new CornerKit();
    ck.apply(squircleElement, { radius, smoothing: 0.85 });

    return () => ck.destroy();
  });

  $: if (squircleElement) {
    // Update on radius change
    const ck = new CornerKit();
    ck.update(squircleElement, { radius });
  }
</script>

<div bind:this={squircleElement} class="card">
  <slot />
</div>
```

---

## Advanced Usage

### Custom Renderers

Create custom rendering strategies for specific use cases.

```typescript
import { CornerKit, RenderTier, Renderer } from 'cornerkit';

class CustomRenderer implements Renderer {
  tier = 'custom' as RenderTier;

  apply(element: Element, config: SquircleConfig): void {
    // Custom implementation
  }

  remove(element: Element): void {
    // Cleanup
  }

  update(element: Element, config: Partial<SquircleConfig>): void {
    // Update logic
  }
}

const ck = new CornerKit();
ck.registerRenderer(new CustomRenderer());
```

---

### Performance Optimization

#### Lazy Loading

Only process elements when they enter the viewport:

```javascript
const ck = new CornerKit({
  lazyLoad: true,  // Default: true
  observeResize: true
});

ck.auto();
```

#### Debounced Resize Handling

Prevent excessive recalculations during window resize:

```javascript
const ck = new CornerKit({
  debounceResize: 250  // ms, default: 150
});
```

#### Disable Observers for Static Content

If content doesn't change size:

```javascript
const ck = new CornerKit({
  observeResize: false,
  lazyLoad: false
});
```

#### Manual Performance Control

```javascript
// Suspend all processing
ck.suspend();

// Perform batch operations
elements.forEach(el => {
  ck.apply(el, config);
});

// Resume processing
ck.resume();
```

---

### Responsive Design

#### Using Data Attributes

```html
<!-- Responsive radius -->
<div
  data-squircle
  data-squircle-radius-sm="12"
  data-squircle-radius-md="16"
  data-squircle-radius-lg="24"
  data-squircle-radius-xl="32"
></div>
```

```javascript
const ck = new CornerKit({
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  }
});

ck.auto();
```

#### Container Queries

```css
.card {
  container-type: inline-size;
}
```

```javascript
ck.apply('.card', {
  radius: 'auto',  // Automatically scales with container
  smoothing: 0.85
});
```

#### Programmatic Responsive Control

```javascript
const updateSquircles = () => {
  const width = window.innerWidth;

  if (width < 768) {
    ck.update('.card', { radius: 12 });
  } else if (width < 1024) {
    ck.update('.card', { radius: 20 });
  } else {
    ck.update('.card', { radius: 28 });
  }
};

window.addEventListener('resize', updateSquircles);
updateSquircles();
```

---

## Progressive Enhancement Strategy

cornerKit uses a 4-tier progressive enhancement strategy to ensure optimal performance across all browsers:

### Tier 1: Native CSS `corner-shape`

**Browser Support**: Chrome 139+

**Implementation**:
```css
@supports (corner-shape: squircle) {
  .element {
    border-radius: 16px;
    corner-shape: squircle;
  }
}
```

**Performance**: ⚡⚡⚡
- GPU-accelerated
- Zero JavaScript overhead
- Native browser rendering
- Fully animatable

---

### Tier 2: CSS Houdini Paint API

**Browser Support**: Chrome 65+, Edge 79+

**Implementation**:
```javascript
// Worklet registration
CSS.paintWorklet.addModule('squircle-paint.js');
```

```css
.element {
  background: paint(squircle);
  --squircle-radius: 16px;
  --squircle-smoothing: 0.8;
}
```

**Performance**: ⚡⚡
- Runs on paint thread (off main thread)
- GPU-accelerated
- Animatable CSS properties
- ~2ms initialization

---

### Tier 3: SVG `clip-path`

**Browser Support**: All modern browsers (Firefox 90+, Safari 14+, etc.)

**Implementation**:
```javascript
// Dynamic SVG path generation
const path = generateSquirclePath(width, height, radius, smoothing);
element.style.clipPath = `path('${path}')`;
```

**Performance**: ⚡
- Runs on main thread
- Requires JavaScript
- ResizeObserver for dynamic updates
- ~5-10ms per element

**Limitations**:
- Clips outside borders and shadows
- Not suitable for elements with `box-shadow` or `border`

---

### Tier 4: `border-radius` Fallback

**Browser Support**: Universal (IE11, older browsers)

**Implementation**:
```css
.element {
  border-radius: 16px;
}
```

**Performance**: ✅
- No squircle curve (standard rounded corners)
- Zero JavaScript
- Universally supported
- Graceful degradation

---

## Examples

### Example 1: Button with Hover Animation

```javascript
import CornerKit from 'cornerkit';

const ck = new CornerKit();
const button = document.querySelector('.cta-button');

ck.apply(button, { radius: 16, smoothing: 0.8 });

button.addEventListener('mouseenter', () => {
  ck.update(button, { radius: 20, smoothing: 0.9 });
});

button.addEventListener('mouseleave', () => {
  ck.update(button, { radius: 16, smoothing: 0.8 });
});
```

```css
.cta-button {
  transition: transform 0.3s ease;
}

.cta-button:hover {
  transform: scale(1.05);
}
```

---

### Example 2: Product Card Grid

```html
<div class="product-grid">
  <article
    class="product-card"
    data-squircle
    data-squircle-radius="24"
    data-squircle-smoothing="0.85"
  >
    <img src="product1.jpg" alt="Product 1">
    <h3>Product Name</h3>
    <p>$99.99</p>
  </article>

  <!-- More cards... -->
</div>
```

```javascript
import CornerKit from 'cornerkit';

const ck = new CornerKit({ lazyLoad: true });
ck.auto();
```

---

### Example 3: Avatar with Badge

```html
<div class="avatar-container" data-squircle data-squircle-radius="40">
  <img src="avatar.jpg" alt="User">
  <span class="badge" data-squircle data-squircle-radius="8">3</span>
</div>
```

```javascript
const ck = new CornerKit();
ck.auto();
```

```css
.avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: red;
  color: white;
  padding: 4px 8px;
}
```

---

### Example 4: Responsive Card

```javascript
import CornerKit from 'cornerkit';

const ck = new CornerKit();
const card = document.querySelector('.card');

const updateRadius = () => {
  const width = card.offsetWidth;

  if (width < 200) {
    ck.update(card, { radius: 12 });
  } else if (width < 400) {
    ck.update(card, { radius: 20 });
  } else {
    ck.update(card, { radius: 28 });
  }
};

ck.apply(card, { radius: 20, smoothing: 0.85 });

// Update on resize
const observer = new ResizeObserver(updateRadius);
observer.observe(card);
```

---

### Example 5: Animated Modal

```javascript
import CornerKit from 'cornerkit';

const ck = new CornerKit();
const modal = document.querySelector('.modal');

// Animate entry
modal.addEventListener('show', () => {
  ck.apply(modal, { radius: 0, smoothing: 0.5 });

  // Animate to final state
  requestAnimationFrame(() => {
    ck.update(modal, { radius: 24, smoothing: 0.85 });
  });
});
```

```css
.modal {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## TypeScript Support

cornerKit is written in TypeScript and includes complete type definitions.

```typescript
import CornerKit, {
  CornerKitOptions,
  SquircleConfig,
  RenderTier,
  SquircleInfo
} from 'cornerkit';

const options: CornerKitOptions = {
  radius: 20,
  smoothing: 0.85,
  lazyLoad: true,
  debug: process.env.NODE_ENV === 'development'
};

const ck = new CornerKit(options);

const config: SquircleConfig = {
  radius: 24,
  smoothing: 0.9
};

ck.apply('.card', config);

const info: SquircleInfo | null = ck.inspect('.card');
if (info) {
  const tier: RenderTier = info.tier;
  console.log(`Rendering tier: ${tier}`);
}
```

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/cornerkit.git
cd cornerkit

# Install dependencies
npm install

# Run development build
npm run dev

# Run tests
npm test

# Run visual regression tests
npm run test:visual

# Build for production
npm run build
```

### Project Structure

```
cornerkit/
├── src/
│   ├── core/           # Core detection and registry
│   ├── renderers/      # Rendering implementations
│   ├── math/           # Superellipse math
│   ├── integrations/   # Framework wrappers
│   └── index.ts        # Main entry
├── tests/
│   ├── unit/           # Unit tests
│   └── visual/         # Visual regression
├── examples/           # Usage examples
└── docs/               # Documentation
```

---

## License

MIT © [Your Name]

---

## Acknowledgments

- Superellipse formula based on work by Piet Hein
- Inspired by iOS design language
- Built with insights from the CSS Houdini specification

---

## Support

- 📖 [Documentation](https://cornerkit.dev)
- 💬 [Discussions](https://github.com/yourusername/cornerkit/discussions)
- 🐛 [Issue Tracker](https://github.com/yourusername/cornerkit/issues)
- 📧 [Email Support](mailto:support@cornerkit.dev)

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.
