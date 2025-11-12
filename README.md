# CornerKit

> Bring iOS-style squircle corners to your web applications

[![npm version](https://img.shields.io/npm/v/@cornerkit/core)](https://www.npmjs.com/package/@cornerkit/core)
[![Bundle Size](https://img.shields.io/badge/bundle%20size-3.66%20KB-success)](https://bundlephobia.com/package/@cornerkit/core)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue)](https://www.typescriptlang.org/)
[![Security: A+](https://img.shields.io/badge/security-A%2B-success)](SECURITY.md)
[![Test Coverage](https://img.shields.io/badge/coverage-97.9%25-brightgreen)](packages/core/tests/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

CornerKit is a lightweight JavaScript library that brings the smooth, continuous curve corners (squircles) from iOS design to the web. At just **3.66 KB gzipped** with **zero runtime dependencies**, it delivers pixel-perfect rounded corners that look better than standard CSS `border-radius`.

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
  radius: 24,      // Corner size in pixels
  smoothing: 0.6   // iOS standard smoothness (0-1)
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
- **3.66 KB gzipped** (ESM) - 27% under 5KB budget
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
- **313/313 unit tests passing** (100%)
- **46/47 integration tests passing** (97.9%)
- **97.9% code coverage**
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

## Framework Examples

### React

```jsx
import { useEffect, useRef } from 'react';
import CornerKit from '@cornerkit/core';

function SquircleCard({ children, radius = 24 }) {
  const ref = useRef(null);
  const ckRef = useRef(null);

  useEffect(() => {
    if (!ckRef.current) {
      ckRef.current = new CornerKit();
    }
    ckRef.current.apply(ref.current, { radius, smoothing: 0.6 });

    return () => ckRef.current.remove(ref.current);
  }, [radius]);

  return <div ref={ref} className="card">{children}</div>;
}
```

### Vue 3

```vue
<template>
  <div ref="cardRef" class="card">
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import CornerKit from '@cornerkit/core';

const props = defineProps({
  radius: { type: Number, default: 24 }
});

const cardRef = ref(null);
let ck = null;

onMounted(() => {
  ck = new CornerKit();
  ck.apply(cardRef.value, { radius: props.radius, smoothing: 0.6 });
});

onBeforeUnmount(() => {
  if (ck && cardRef.value) {
    ck.remove(cardRef.value);
  }
});
</script>
```

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

## Performance Benchmarks

All metrics verified by automated tests on 2020 MacBook Pro (M1):

| Metric | Target | Actual | Performance |
|--------|--------|--------|-------------|
| Bundle size (ESM) | <5KB | 3.66 KB | 27% under budget |
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
- **React** (coming soon)
- **Vue 3** (coming soon)
- **Svelte** (coming soon)

## CDN Usage

```html
<!-- ES Module -->
<script type="module">
  import CornerKit from 'https://cdn.jsdelivr.net/npm/@cornerkit/core@1.0.0/dist/cornerkit.esm.js';
  const ck = new CornerKit();
  ck.apply('.card', { radius: 24, smoothing: 0.6 });
</script>

<!-- UMD (Global) -->
<script src="https://cdn.jsdelivr.net/npm/@cornerkit/core@1.0.0/dist/cornerkit.js"></script>
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

- **Phase 1**: Core library (Complete)
- **Phase 2**: Houdini Paint API + Native CSS support
- **Phase 3**: Framework wrappers (React, Vue, Svelte)
- **Phase 4**: Advanced features (per-corner control, animations)
- **Phase 5**: Shopify Theme App Extension
- **Phase 6**: Visual playground and documentation site

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

Made with ❤️ by the CornerKit team

</div>
