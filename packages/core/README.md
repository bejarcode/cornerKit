# @cornerkit/core

> Lightweight (~4KB gzipped), zero-dependency library for iOS-style squircle corners

[![npm version](https://img.shields.io/npm/v/@cornerkit/core.svg)](https://www.npmjs.com/package/@cornerkit/core)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@cornerkit/core)](https://bundlephobia.com/package/@cornerkit/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- ✅ **Zero dependencies** - Fully self-contained
- ✅ **~4KB gzipped** - Lightweight bundle size
- ✅ **TypeScript support** - Full type definitions included
- ✅ **4-tier progressive enhancement** - Native CSS → Houdini → ClipPath → Fallback
- ✅ **iOS-style squircles** - Mathematically accurate superellipse curves
- ✅ **Accessibility-first** - Preserves focus indicators, respects prefers-reduced-motion
- ✅ **Framework agnostic** - Works with vanilla JS, React, Vue, or any framework
- ✅ **Privacy-focused** - Zero network requests, no data collection

## Installation

```bash
# npm
npm install @cornerkit/core

# pnpm
pnpm add @cornerkit/core

# yarn
yarn add @cornerkit/core
```

## Quick Start

```javascript
import CornerKit from '@cornerkit/core';

// Create instance with defaults
const ck = new CornerKit();

// Apply squircle to an element
ck.apply('#my-button');

// Apply to all buttons
ck.applyAll('.button', { radius: 24, smoothing: 0.9 });
```

### HTML Data Attributes

```html
<!-- Declarative HTML approach -->
<div data-squircle data-squircle-radius="20" data-squircle-smoothing="0.8">
  Content with squircle corners
</div>

<script type="module">
import CornerKit from '@cornerkit/core';
const ck = new CornerKit();
ck.auto(); // Auto-discovers and applies squircles
</script>
```

## API Reference

### Constructor

```typescript
new CornerKit(config?: Partial<SquircleConfig>)
```

Create a new CornerKit instance with optional global defaults.

**Parameters:**
- `config` (optional): Global configuration for all squircles
  - `radius` (number): Corner radius in pixels (default: 20)
  - `smoothing` (number): Smoothing factor 0-1 (default: 0.8, iOS-like)

**Example:**
```javascript
// With defaults (radius: 20, smoothing: 0.8)
const ck1 = new CornerKit();

// With custom global defaults
const ck2 = new CornerKit({ radius: 24, smoothing: 0.9 });
```

---

### apply()

```typescript
apply(element: HTMLElement | string, config?: Partial<SquircleConfig>): void
```

Apply squircle corners to a single element.

**Parameters:**
- `element`: HTMLElement reference or CSS selector string
- `config` (optional): Per-element configuration overrides

**Throws:**
- `TypeError`: If element is invalid
- `Error`: If selector matches 0 or multiple elements

**Example:**
```javascript
const ck = new CornerKit();

// Apply to element reference
const button = document.getElementById('my-button');
ck.apply(button);

// Apply to CSS selector
ck.apply('#my-button');

// Apply with custom config
ck.apply('#my-button', { radius: 32, smoothing: 0.9 });
```

---

### applyAll()

```typescript
applyAll(selector: string, config?: Partial<SquircleConfig>): void
```

Apply squircles to all elements matching a selector.

**Parameters:**
- `selector`: CSS selector string
- `config` (optional): Configuration for all matched elements

**Throws:**
- `TypeError`: If selector is invalid

**Example:**
```javascript
const ck = new CornerKit();

// Apply to all buttons
ck.applyAll('.button');

// Apply to all cards with custom config
ck.applyAll('.card', { radius: 16, smoothing: 0.85 });
```

---

### auto()

```typescript
auto(): void
```

Auto-discover and apply squircles to all elements with `data-squircle` attribute. Uses IntersectionObserver for lazy loading (visible elements processed immediately, off-screen elements deferred).

Can be called multiple times to process newly added elements.

**Example:**
```html
<div data-squircle data-squircle-radius="24">Content</div>
```

```javascript
const ck = new CornerKit();
ck.auto(); // Discovers and applies squircles

// Later, after adding more elements:
ck.auto(); // Processes new elements
```

---

### update()

```typescript
update(element: HTMLElement | string, config: Partial<SquircleConfig>): void
```

Update squircle configuration for a managed element. Merges new config with existing and re-renders without recreating observers.

**Parameters:**
- `element`: HTMLElement reference or CSS selector string
- `config`: Partial configuration to update

**Throws:**
- `TypeError`: If element is invalid
- `Error`: If element is not managed by CornerKit

**Example:**
```javascript
const ck = new CornerKit();
ck.apply('#button');

// Later, update only the radius
ck.update('#button', { radius: 32 });

// Update multiple properties
ck.update('#button', { radius: 40, smoothing: 0.95 });
```

---

### remove()

```typescript
remove(element: HTMLElement | string): void
```

Remove squircle from element and clean up all observers. Restores element to original unstyled state.

**Parameters:**
- `element`: HTMLElement reference or CSS selector string

**Throws:**
- `TypeError`: If element is invalid
- `Error`: If element is not managed by CornerKit

**Example:**
```javascript
const ck = new CornerKit();
ck.apply('#button');

// Later, remove the squircle
ck.remove('#button');
```

---

### inspect()

```typescript
inspect(element: HTMLElement | string): ManagedElementInfo
```

Inspect a managed element and return its current configuration.

**Parameters:**
- `element`: HTMLElement reference or CSS selector string

**Returns:**
- `ManagedElementInfo`:
  - `config`: Current squircle configuration
  - `tier`: Renderer tier being used (`'clippath'` | `'fallback'`)
  - `dimensions`: Current element dimensions `{ width, height }`

**Throws:**
- `TypeError`: If element is invalid
- `Error`: If element is not managed by CornerKit

**Example:**
```javascript
const ck = new CornerKit();
ck.apply('#button', { radius: 24 });

const info = ck.inspect('#button');
console.log(info.config.radius); // 24
console.log(info.tier); // 'clippath'
console.log(info.dimensions); // { width: 200, height: 50 }
```

---

### destroy()

```typescript
destroy(): void
```

Remove all squircles and clean up all resources. Instance can be reused after destroy().

**Example:**
```javascript
const ck = new CornerKit();
ck.applyAll('.button');

// Later, clean up everything
ck.destroy();

// Instance can be reused
ck.apply('#new-button');
```

---

### Static Methods

#### CornerKit.supports()

```typescript
static supports(): { native: boolean; houdini: boolean; clippath: boolean; fallback: boolean; }
```

Check browser support for rendering tiers without creating an instance.

**Example:**
```javascript
const support = CornerKit.supports();
console.log(support.clippath); // true
console.log(support.native); // false (Chrome 139+ only)
```

## Configuration

### SquircleConfig

```typescript
interface SquircleConfig {
  radius: number;      // Corner radius in pixels (default: 20)
  smoothing: number;   // Smoothing factor 0-1 (default: 0.8)
  tier?: 'native' | 'houdini' | 'clippath' | 'fallback'; // Force specific renderer
}
```

**Recommended Values:**
- **radius**: 12-48px (typical iOS range)
- **smoothing**: 0.6-1.0
  - `0.8`: iOS-like appearance (recommended)
  - `0.6`: More pronounced squircle
  - `1.0`: Perfect circle
  - `0.0`: Square corners

## Accessibility

### Focus Indicators

CornerKit is designed with accessibility as a core principle. The library **preserves all focus indicators** and does not interfere with keyboard navigation.

#### ✅ What CornerKit Does

- Only modifies `clip-path` CSS property (for visual shape)
- **Never modifies** `outline`, `border`, or other focus-related properties
- Fully compatible with custom focus styles
- Works seamlessly with `:focus` and `:focus-visible` pseudo-classes

#### 💡 Recommended Focus Indicator Pattern

When applying squircles to interactive elements (buttons, links, inputs), use `outline` instead of `border` for focus indicators:

```css
/* ✅ Recommended: Use outline for focus indicators */
button {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

button:focus-visible {
  outline: 3px solid #0066cc;
  outline-offset: 3px;
}
```

```javascript
// Apply squircle to button
const ck = new CornerKit();
ck.apply('button', { radius: 12, smoothing: 0.85 });

// Focus indicator remains visible - outline is not affected!
```

#### Why `outline` instead of `border`?

- **`outline`**: Drawn outside the element, not affected by `clip-path` ✅
- **`border`**: Part of the element box, may be clipped by squircle shape ❌

### Reduced Motion Support

CornerKit automatically respects the `prefers-reduced-motion` user preference:

```javascript
// Users who prefer reduced motion will have transitions disabled
const ck = new CornerKit();
ck.apply('#button'); // Automatically disables transitions if user prefers reduced motion
```

## Browser Compatibility

| Browser | Version | Tier | Notes |
|---------|---------|------|-------|
| Chrome  | 65+     | ClipPath | Full support |
| Firefox | Latest 2 | ClipPath | Full support |
| Safari  | 14+     | ClipPath | Full support |
| Edge    | 79+     | ClipPath | Full support |
| IE 11   | ✓       | Fallback | border-radius fallback |

### Progressive Enhancement Tiers

1. **Tier 1: Native CSS** (`corner-shape: squircle`) - Chrome 139+ (future)
2. **Tier 2: Houdini Paint API** - Chrome 65+, Edge 79+ (Phase 2)
3. **Tier 3: SVG clip-path** - Modern browsers (current implementation)
4. **Tier 4: border-radius fallback** - All browsers including IE11

## Performance

- **Bundle size**: ~4KB gzipped (ESM/UMD/CJS)
- **Render time**: <10ms per element
- **Init time**: <100ms
- **Batch application**: 100 elements in <500ms
- **Responsive**: 60fps maintained during ResizeObserver updates

## TypeScript Support

Full TypeScript definitions included:

```typescript
import CornerKit, {
  type SquircleConfig,
  type ManagedElementInfo,
  type BrowserSupport,
  RendererTier,
  DEFAULT_CONFIG,
} from '@cornerkit/core';

const ck = new CornerKit({ radius: 24, smoothing: 0.9 });
const info: ManagedElementInfo = ck.inspect('#button');
```

## Security & Privacy

- ✅ No `eval()`, `Function()`, or `innerHTML`
- ✅ CSP compatible (no `unsafe-inline` or `unsafe-eval` required)
- ✅ Zero network requests
- ✅ No data collection, analytics, or telemetry
- ✅ GDPR/CCPA compliant (100% offline operation)

## Advanced Usage

### Responsive Squircles

```javascript
const ck = new CornerKit();
ck.apply('#responsive-card');
// ResizeObserver automatically updates squircle when element resizes
```

### Dynamic Updates

```javascript
const ck = new CornerKit();
ck.apply('#button', { radius: 20 });

// Update configuration later
ck.update('#button', { radius: 32 }); // Smooth transition
```

### Lazy Loading

```javascript
// Auto() uses IntersectionObserver for lazy loading
const ck = new CornerKit();
ck.auto(); // Visible elements processed immediately, off-screen deferred
```

## Examples

Complete working examples coming soon. For now, refer to the code examples in this README and the [Quick Start](#quick-start) section.

## Contributing

Contributions are welcome! Please open an issue to discuss proposed changes before submitting a pull request.

## License

MIT © cornerKit Contributors

## Links

- [GitHub Repository](https://github.com/cornerkit/cornerkit)
- [NPM Package](https://www.npmjs.com/package/@cornerkit/core)
- [Documentation](https://cornerkit.dev)
- [Issue Tracker](https://github.com/cornerkit/cornerkit/issues)
