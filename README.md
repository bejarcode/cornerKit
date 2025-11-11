# cornerKit

> Pixel-perfect iOS-style squircle corners for the web

[![Bundle Size](https://img.shields.io/badge/bundle-3.6KB%20gzipped-success)](https://bundlephobia.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

A lightweight (**3.6KB gzipped**), framework-agnostic JavaScript library for creating pixel-perfect iOS-style squircle corners using **Figma's corner smoothing algorithm**. Zero dependencies, full TypeScript support, and automatic responsive handling.

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
- [Advanced Usage](#advanced-usage)
  - [Performance Optimization](#performance-optimization)
  - [Responsive Design](#responsive-design)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

---

## Features

✨ **Pixel-Perfect Figma Algorithm**
- Implements Figma's corner smoothing (arc + cubic bezier curves)
- Default smoothing: 0.6 (iOS 7 standard per Figma API)
- SVG `clip-path` rendering for modern browsers
- `border-radius` fallback for universal support

🎯 **Developer Experience**
- Zero dependencies
- Framework agnostic vanilla JavaScript
- TypeScript support with full type definitions
- Tree-shakeable ES modules
- Declarative HTML attributes or programmatic API

⚡ **Performance**
- **3.6KB gzipped** - 26% under 5KB target
- Lazy loading with Intersection Observer
- Automatic resize handling with ResizeObserver
- Render time: <10ms per element

🎨 **Flexible Configuration**
- Configurable radius and smoothing parameters
- Per-element customization via `data-squircle` attributes
- Dynamic updates with `update()` method
- Automatic responsive handling

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
  data-squircle-smoothing="0.6"
>
  Beautiful squircle corners
</div>
```

---

## Browser Support

| Browser | Rendering Method | Performance | Notes |
|---------|------------------|-------------|-------|
| Chrome 90+ | SVG `clip-path` | ⚡ Fast | ~5-10ms render time |
| Firefox 90+ | SVG `clip-path` | ⚡ Fast | ~5-10ms render time |
| Safari 14+ | SVG `clip-path` | ⚡ Fast | ~5-10ms render time |
| Edge 90+ | SVG `clip-path` | ⚡ Fast | ~5-10ms render time |
| IE 11 | `border-radius` | ✅ Works | Standard rounded corners |
| Older browsers | `border-radius` | ✅ Works | Graceful degradation |

**Total Coverage**: 98%+ of global users

**Note**: Future versions will add Native CSS `corner-shape` (Chrome 139+) and Houdini Paint API support for enhanced performance.

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
  smoothing?: number;           // Default: 0.6 (0-1 scale, iOS 7 standard)

  // Performance
  lazyLoad?: boolean;           // Default: true
  debounceResize?: number;      // Default: 150 (ms)
  observeResize?: boolean;      // Default: true

  // Debug
  debug?: boolean;              // Default: false
  logPerformance?: boolean;     // Default: false

  // Callbacks
  onElementProcessed?: (element: Element, config: SquircleConfig) => void;
  onError?: (error: Error, element?: Element) => void;
}
```

**Example:**

```javascript
const ck = new CornerKit({
  radius: 20,
  smoothing: 0.6,
  lazyLoad: true,
  debug: process.env.NODE_ENV === 'development',
  onElementProcessed: (element, config) => {
    console.log(`Applied squircle to ${element.tagName}`);
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

Controls the "squircleness" of the curve using Figma's corner smoothing algorithm.

- **Type**: `number`
- **Default**: `0.6` (iOS 7 standard per Figma API)
- **Range**: `0.0` to `1.0`
- **Scale**:
  - `0.0` = Perfect circle
  - `0.4` = Moderate curve
  - `0.6` = iOS 7 standard (recommended)
  - `0.85-0.95` = Common Figma values (stronger squircle)
  - `1.0` = Maximum squircle effect

**Algorithm:**

Uses Figma's arc + cubic bezier curve approach:
- Arc angle: `90° × (1 - smoothing)`
- Each corner: 1 arc + 2 bezier curves
- Total corner path: `(1 + smoothing) × radius`

**Example:**

```javascript
// Perfect circle
ck.apply('.avatar', { smoothing: 0.0 });

// iOS 7 standard (recommended)
ck.apply('.card--ios', { smoothing: 0.6 });

// Figma 90% (stronger squircle)
ck.apply('.card--figma', { smoothing: 0.9 });
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
ck.apply('#my-button', { radius: 20, smoothing: 0.6 });

// Direct element reference
const button = document.querySelector('.cta-button');
ck.apply(button, { radius: 24, smoothing: 0.6 });
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
ck.applyAll('button', { radius: 12, smoothing: 0.6 });

// All cards
ck.applyAll('.card', { radius: 24, smoothing: 0.6 });

// NodeList
const cards = document.querySelectorAll('.product-card');
ck.applyAll(cards, { radius: 20, smoothing: 0.6 });
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
  data-squircle-smoothing="0.6"
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
ck.apply('.button', { radius: 16, smoothing: 0.6 });

// Later, update only radius
ck.update('.button', { radius: 20 });

// Animate smoothing on hover
button.addEventListener('mouseenter', () => {
  ck.update(button, { smoothing: 0.9 });
});

button.addEventListener('mouseleave', () => {
  ck.update(button, { smoothing: 0.6 });
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
  CLIPPATH = 'clippath',  // SVG clip-path
  FALLBACK = 'fallback'   // border-radius
}
```

**Example:**

```javascript
const tier = ck.getTier();

if (tier === 'clippath') {
  console.log('Using SVG clip-path rendering');
} else if (tier === 'fallback') {
  console.log('Using border-radius fallback');
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
  smoothing: 0.6,
  lazyLoad: true,
  debug: process.env.NODE_ENV === 'development'
};

const ck = new CornerKit(options);

const config: SquircleConfig = {
  radius: 24,
  smoothing: 0.6
};

ck.apply('.card', config);

const info: SquircleInfo | null = ck.inspect('.card');
if (info) {
  const tier: RenderTier = info.tier;
  console.log(`Rendering tier: ${tier}`);
}
```

---

## Advanced Usage

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
  radius: 20,
  smoothing: 0.6
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

## Examples

### Example 1: Button with Hover Animation

```javascript
import CornerKit from 'cornerkit';

const ck = new CornerKit();
const button = document.querySelector('.cta-button');

ck.apply(button, { radius: 16, smoothing: 0.6 });

button.addEventListener('mouseenter', () => {
  ck.update(button, { radius: 20, smoothing: 0.9 });
});

button.addEventListener('mouseleave', () => {
  ck.update(button, { radius: 16, smoothing: 0.6 });
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
    data-squircle-smoothing="0.6"
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

ck.apply(card, { radius: 20, smoothing: 0.6 });

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
  ck.apply(modal, { radius: 0, smoothing: 0.3 });

  // Animate to final state
  requestAnimationFrame(() => {
    ck.update(modal, { radius: 24, smoothing: 0.6 });
  });
});
```

```css
.modal {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Framework Integrations (Coming Soon)

v1.0 focuses on the core vanilla JavaScript implementation. Framework integrations will be added in future releases:

- **React** (v1.1): `<Squircle>` component and `useSquircle` hook
- **Vue** (v1.2): `<Squircle>` component and `useSquircle` composable
- **Svelte** (v1.3): Native Svelte component
- **Web Components** (v1.4): Custom `<squircle-shape>` element

For now, you can use the core API with any framework:

```javascript
// React example
import { useEffect, useRef } from 'react';
import CornerKit from 'cornerkit';

function Card({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const ck = new CornerKit();
    ck.apply(ref.current, { radius: 20, smoothing: 0.6 });

    return () => ck.destroy();
  }, []);

  return <div ref={ref}>{children}</div>;
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

- **Figma's corner smoothing algorithm** - Arc + cubic bezier curve approach
- **MartinRGB** - Reverse-engineering Figma's squircle mathematics
- **figma-squircle** npm package - Reference implementation
- **iOS design language** - Inspiration for continuous curves
- **Piet Hein** - Original superellipse formula research

---

## Support

- 📖 [Documentation](https://cornerkit.dev)
- 💬 [Discussions](https://github.com/yourusername/cornerkit/discussions)
- 🐛 [Issue Tracker](https://github.com/yourusername/cornerkit/issues)
- 📧 [Email Support](mailto:support@cornerkit.dev)

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.
