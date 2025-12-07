# CornerKit

> Bring iOS-style squircle corners to your web applications

[![npm version](https://img.shields.io/npm/v/@cornerkit/core)](https://www.npmjs.com/package/@cornerkit/core)
[![Bundle Size](https://img.shields.io/badge/bundle%20size-5.50%20KB-success)](https://bundlephobia.com/package/@cornerkit/core)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue)](https://www.typescriptlang.org/)
[![Security: A+](https://img.shields.io/badge/security-A%2B-success)](SECURITY.md)
[![Test Coverage](https://img.shields.io/badge/coverage-97.9%25-brightgreen)](packages/core/tests/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Live Demo](https://bejarcode.github.io/cornerKit/)** - Interactive playground with 36+ UI examples

CornerKit is a lightweight JavaScript library that brings the smooth, continuous curve corners (squircles) from iOS design to the web. At just **5.50 KB gzipped** with **zero runtime dependencies**, it delivers pixel-perfect rounded corners that look better than standard CSS `border-radius`.

## Live Demo

**[Try the Interactive Demo →](https://bejarcode.github.io/cornerKit/)**

Experiment with squircles in real-time, see side-by-side comparisons, and generate ready-to-use code snippets.

## Why Squircles?

**Standard `border-radius`** creates circular arcs that can look harsh and disconnect from the straight edges.

**Squircles** (superellipses) create smooth, continuous curves that transition naturally from straight edges to corners—the same mathematical curves used in iOS design, Figma, and modern UI systems.

## Quick Start

### Installation

```bash
npm install @cornerkit/core
```

### Basic Usage

```javascript
import CornerKit from '@cornerkit/core';

const ck = new CornerKit();

// Apply to any element
ck.apply('.card', {
  radius: 24,        // Corner size in pixels
  smoothing: 0.6,    // iOS standard smoothness (0-1)
  border: {          // Optional: SVG-based border (v1.2.0+)
    width: 2,
    color: '#000'
  }
});
```

### HTML Data Attributes

```html
<div
  data-squircle
  data-squircle-radius="24"
  data-squircle-smoothing="0.6"
>
  Beautiful squircle corners, automatically applied!
</div>

<script type="module">
  import CornerKit from '@cornerkit/core';
  const ck = new CornerKit();
  ck.auto(); // Discovers and applies squircles
</script>
```

## Why CornerKit?

### Exceptionally Tiny
- **5.50 KB gzipped** (ESM) - includes SVG border rendering
- **Zero runtime dependencies**
- Tree-shakeable ES modules
- Smaller than most icon libraries

### Blazing Fast
- **7.3ms** render time (27% faster than 10ms target)
- **42ms** initialization (58% faster than 100ms target)
- **60fps maintained** during resizes
- 100 elements in **403ms**

### Universal Compatibility
- **98%+ browser support** via progressive enhancement
- Chrome 23+, Firefox 54+, Safari 13+, Edge 18+
- IE11 fallback with graceful degradation
- Automatic capability detection

### Production Ready
- **412/412 unit tests passing** (100%)
- **66/67 integration tests passing** (98.5%)
- **84.9% code coverage**
- Memory leak prevention with WeakMap registry
- A+ security rating (zero vulnerabilities)

### Framework Agnostic
Works seamlessly with:
- Vanilla JavaScript
- React
- Vue 3
- Svelte
- Angular
- Any framework or no framework

## Framework Packages

### React (@cornerkit/react)

Official React integration with dedicated components and hooks.

```bash
npm install @cornerkit/react
```

```jsx
import { Squircle, useSquircle } from '@cornerkit/react';

// Component approach (recommended)
function App() {
  return (
    <Squircle radius={24} smoothing={0.6} className="card">
      Beautiful squircle corners!
    </Squircle>
  );
}

// Polymorphic - render as any element
<Squircle as="button" radius={16} onClick={handleClick}>
  Click me
</Squircle>

// Hook approach for custom components
function CustomCard() {
  const ref = useSquircle({ radius: 24, smoothing: 0.6 });
  return <div ref={ref}>Content</div>;
}

// With borders
<Squircle
  radius={24}
  border={{ width: 2, color: '#e5e7eb' }}
>
  Card with border
</Squircle>
```

**[Full @cornerkit/react documentation →](packages/react/README.md)**

### Vue 3 (@cornerkit/vue)

Official Vue 3 integration with component, composable, and directive.

```bash
npm install @cornerkit/vue
```

```vue
<script setup>
import { Squircle, useSquircle, vSquircle } from '@cornerkit/vue';
</script>

<template>
  <!-- Component approach (recommended) -->
  <Squircle :radius="24" :smoothing="0.6" class="card">
    Beautiful squircle corners!
  </Squircle>

  <!-- Render as any element -->
  <Squircle tag="button" :radius="16" @click="handleClick">
    Click me
  </Squircle>

  <!-- Directive approach -->
  <div v-squircle="{ radius: 20, smoothing: 0.8 }">
    Directive-based squircle
  </div>
</template>
```

**[Full @cornerkit/vue documentation →](packages/vue/README.md)**

### Svelte (@cornerkit/svelte)

Official Svelte integration with component and action.

```bash
npm install @cornerkit/svelte
```

```svelte
<script>
  import { Squircle, squircle } from '@cornerkit/svelte';
</script>

<!-- Component approach (recommended) -->
<Squircle radius={24} smoothing={0.6} class="card">
  Beautiful squircle corners!
</Squircle>

<!-- Action approach -->
<div use:squircle={{ radius: 20, smoothing: 0.8 }}>
  Action-based squircle
</div>

<!-- Shorthand action (radius only) -->
<button use:squircle={16}>Click me</button>
```

**[Full @cornerkit/svelte documentation →](packages/svelte/README.md)**

### Core Library (Manual Integration)

For frameworks without dedicated packages or custom integrations, use @cornerkit/core directly.

**[Full @cornerkit/core documentation →](packages/core/README.md)**

## API Highlights

```javascript
const ck = new CornerKit();

// Apply to single element
ck.apply('#button', { radius: 20, smoothing: 0.6 });

// Apply to multiple elements
ck.applyAll('.card', { radius: 24, smoothing: 0.6 });

// Auto-discover via data attributes
ck.auto();

// Update existing squircle
ck.update('#button', { radius: 32 });

// Remove squircle
ck.remove('#button');

// Get current state
const info = ck.inspect('#button');
console.log(info.config); // { radius: 32, smoothing: 0.6 }
```

## Border Support (v1.2.0+)

CornerKit v1.2.0 introduces SVG-based border rendering that eliminates anti-aliasing fringe on dark backgrounds and supports **solid**, **dashed**, **dotted**, and **gradient** styles.

### Basic Border Usage

```javascript
const ck = new CornerKit();

// Solid border
ck.apply('.card', {
  radius: 24,
  smoothing: 0.6,
  border: { width: 2, color: '#e5e7eb' }
});

// Dashed border
ck.apply('.upload-zone', {
  radius: 20,
  border: { width: 2, color: '#6b7280', style: 'dashed' }
});

// Dotted border
ck.apply('.badge', {
  radius: 12,
  border: { width: 3, color: '#10b981', style: 'dotted' }
});

// Gradient border
ck.apply('.featured', {
  radius: 24,
  border: {
    width: 3,
    gradient: [
      { offset: '0%', color: '#3b82f6' },
      { offset: '100%', color: '#8b5cf6' }
    ]
  }
});
```

### HTML Data Attributes

```html
<div
  data-squircle
  data-squircle-radius="24"
  data-squircle-border-width="2"
  data-squircle-border-color="#e5e7eb"
  data-squircle-border-style="dashed"
>
  Card with dashed squircle border
</div>
```

### Migration from v1.1

Legacy `borderWidth` and `borderColor` props still work:

```javascript
// Old API (v1.1) - still works
ck.apply('.card', { borderWidth: 2, borderColor: '#e5e7eb' });

// New API (v1.2) - recommended
ck.apply('.card', { border: { width: 2, color: '#e5e7eb' } });
```

### CSS Framework Compatibility

Works with CSS frameworks that use `!important` (like Tailwind CSS):

```html
<!-- Works correctly with Tailwind's important mode -->
<div class="bg-blue-50 p-4" data-squircle data-squircle-border-width="2">
  Content
</div>
```

## Performance Benchmarks

All metrics verified by automated tests on 2020 MacBook Pro (M1):

| Metric | Target | Actual | Performance |
|--------|--------|--------|-------------|
| Bundle size (ESM) | <6KB | 5.50 KB | 8% under budget |
| Single element render | <10ms | 7.3ms | 27% faster |
| Initialization | <100ms | 42ms | 58% faster |
| 100 elements batch | <500ms | 403ms | 19% faster |
| Resize performance | 60fps | 14.2ms/frame | Maintains 60fps |

## Security & Privacy

- **A+ Security Rating** - Zero production vulnerabilities
- **OWASP Top 10 compliant**
- No network requests (100% offline)
- No data collection (GDPR/CCPA compliant)
- CSP compatible (no `unsafe-eval` or `unsafe-inline`)
- No `eval()`, `Function()`, or `innerHTML`

## Browser Support

| Browser | Version | Implementation | Status |
|---------|---------|----------------|--------|
| Chrome | 139+ | Native CSS `corner-shape` | Future |
| Chrome | 65+ | Houdini Paint API | Phase 2 |
| Chrome | 23+ | SVG clip-path | Current |
| Firefox | 54+ | SVG clip-path | Current |
| Safari | 13+ | SVG clip-path | Current |
| Edge | 79+ | Houdini Paint API | Phase 2 |
| Edge | 18+ | SVG clip-path | Current |
| IE11 | All | border-radius fallback | Current |

**Coverage**: 98%+ of global browser usage with automatic capability detection.

## TypeScript Support

Full TypeScript definitions included:

```typescript
import CornerKit, {
  SquircleConfig,
  ManagedElementInfo,
  BrowserSupport
} from '@cornerkit/core';

const ck = new CornerKit({
  radius: 24,
  smoothing: 0.6
});

const config: SquircleConfig = {
  radius: 32,
  smoothing: 0.8
};

ck.apply('.card', config);
```

## Documentation

- **[Complete API Reference](packages/core/README.md)** - Full documentation with examples
- **[Installation Guide](packages/core/README.md#installation)** - npm, yarn, pnpm, CDN
- **[Quick Start](packages/core/README.md#quick-start)** - Get started in under 2 minutes
- **[Framework Integration](packages/core/README.md#framework-integration)** - React, Vue, Svelte, Angular
- **[Configuration Guide](packages/core/README.md#configuration-guide)** - radius and smoothing parameters
- **[Performance Details](packages/core/README.md#performance-benchmarks)** - Comprehensive benchmarks
- **[Browser Compatibility](packages/core/README.md#browser-support)** - Full compatibility matrix
- **[Security Audit](packages/core/security/SECURITY-AUDIT.md)** - A+ security rating details
- **[Contributing Guide](packages/core/CONTRIBUTING.md)** - How to contribute

## Examples

Working examples with interactive demos:

- **[Vanilla JavaScript](packages/core/examples/vanilla-js/)** - Pure HTML/CSS/JS implementation
- **[React](packages/react/examples/)** - Squircle component and useSquircle hook demos
- **[Vue 3](packages/vue/examples/)** - Squircle component, useSquircle composable, and v-squircle directive demos
- **[Svelte](packages/svelte/examples/)** - Squircle component and squircle action demos

## CDN Usage

```html
<!-- ES Module -->
<script type="module">
  import CornerKit from 'https://cdn.jsdelivr.net/npm/@cornerkit/core@1.2.0/dist/cornerkit.esm.js';
  const ck = new CornerKit();
  ck.apply('.card', { radius: 24, smoothing: 0.6 });
</script>

<!-- UMD (Global) -->
<script src="https://cdn.jsdelivr.net/npm/@cornerkit/core@1.2.0/dist/cornerkit.js"></script>
<script>
  const ck = new CornerKit();
  ck.apply('.card', { radius: 24, smoothing: 0.6 });
</script>
```

## Accessibility

- **WCAG 2.1 AA compliant**
- Preserves focus indicators (outline never modified)
- Respects `prefers-reduced-motion`
- Screen reader compatible
- No impact on semantics or tab order
- ARIA attributes preserved

## Contributing

We welcome contributions! Please see our [Contributing Guide](packages/core/CONTRIBUTING.md) for details.

```bash
# Clone and install
git clone https://github.com/bejarcode/cornerkit.git
cd cornerkit/packages/core
npm install

# Run tests
npm test                       # Unit tests
npm run test:integration       # Integration tests
npm run test:performance       # Performance benchmarks

# Build
npm run build                  # Production build
npm run analyze-bundle         # Bundle size analysis
```

## Roadmap

- **Phase 1**: Core library + Demo website ✅ Complete
- **Phase 2**: Framework wrappers ✅ Complete
  - React (@cornerkit/react) ✅ Complete
  - Vue (@cornerkit/vue) ✅ Complete
  - Svelte (@cornerkit/svelte) ✅ Complete
- **Phase 3**: Shopify Theme App Extension
- **Phase 4**: Future (Native CSS, Houdini, advanced features)

## License

MIT - Victor Bejar / bejarllc

See [LICENSE](LICENSE) for details.

## Acknowledgments

- **Figma** for squircle algorithm research
- **Apple** for pioneering squircle design in iOS
- **The Houdini CSS Working Group** for the Paint API

---

<div align="center">

**[Documentation](packages/core/README.md)** • **[npm Package](https://www.npmjs.com/package/@cornerkit/core)** • **[GitHub](https://github.com/bejarcode/cornerkit)** • **[Issues](https://github.com/bejarcode/cornerkit/issues)**

</div>
