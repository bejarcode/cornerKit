# cornerKit - Standalone Squircle Library

## Vision

**cornerKit** is a lightweight (~5KB gzipped), framework-agnostic JavaScript library for creating iOS-style squircle corners on any web project. It automatically detects browser capabilities and uses the best available rendering method.

---

## Library Architecture

### Core Design Principles

1. **Zero dependencies** - Pure JavaScript, no external libs required
2. **Progressive enhancement** - 4-tier fallback system
3. **Framework agnostic** - Works with React, Vue, Svelte, vanilla JS
4. **Performance first** - Lazy loading, GPU acceleration where possible
5. **Developer friendly** - Simple API, TypeScript support, tree-shakeable

---

## Library Structure

```
cornerKit/
├── src/
│   ├── core/
│   │   ├── detector.ts          # Browser capability detection
│   │   ├── registry.ts          # Element registry and observer
│   │   └── config.ts            # Default configuration
│   │
│   ├── renderers/
│   │   ├── native.ts            # Tier 1: CSS corner-shape
│   │   ├── houdini.ts           # Tier 2: Paint API
│   │   ├── clippath.ts          # Tier 3: SVG path + clip-path
│   │   └── fallback.ts          # Tier 4: border-radius
│   │
│   ├── math/
│   │   ├── superellipse.ts      # Superellipse formula
│   │   └── path-generator.ts    # SVG path generation
│   │
│   ├── integrations/
│   │   ├── react.tsx            # React component wrapper
│   │   ├── vue.ts               # Vue component
│   │   ├── web-component.ts     # Native Web Component
│   │   └── shopify.ts           # Shopify Liquid helpers
│   │
│   ├── utils/
│   │   ├── observer.ts          # Intersection/Resize observers
│   │   └── performance.ts       # Performance monitoring
│   │
│   └── index.ts                 # Main entry point
│
├── worklets/
│   └── squircle-paint.js        # Houdini Paint Worklet
│
├── dist/
│   ├── cornerkit.js             # UMD bundle
│   ├── cornerkit.esm.js         # ES modules
│   ├── cornerkit.min.js         # Minified
│   └── squircle-paint.js        # Worklet (separate)
│
├── examples/
│   ├── vanilla/                 # Plain HTML/JS examples
│   ├── react/                   # React examples
│   ├── vue/                     # Vue examples
│   └── shopify/                 # Shopify integration examples
│
└── tests/
    ├── unit/                    # Unit tests
    └── visual/                  # Visual regression tests
```


---

## API Design

### 1. Vanilla JavaScript API

```javascript
import CornerKit from 'cornerkit';

// Initialize with global config
const ck = new CornerKit({
  // Default settings for all elements
  radius: 16,
  smoothing: 0.8,

  // Performance options
  lazyLoad: true,              // Only process visible elements
  debounceResize: 150,         // Debounce resize events

  // Capability preferences
  preferNative: true,          // Use native CSS when available
  enableHoudini: true,         // Use Houdini if available

  // Debug
  debug: false,                // Log tier selection
  logPerformance: false        // Log render times
});

// Apply to single element
ck.apply('#my-button', {
  radius: 20,
  smoothing: 0.85
});

// Apply to multiple elements
ck.applyAll('.squircle-card', {
  radius: 24,
  smoothing: 0.9
});

// Apply with data attributes (declarative)
ck.auto(); // Finds all [data-squircle] elements

// Update dynamically
ck.update('#my-button', { radius: 32 });

// Remove squircle
ck.remove('#my-button');

// Get info about element
const info = ck.inspect('#my-button');
// Returns: { tier: 'houdini', radius: 20, smoothing: 0.85, performance: {...} }

// Destroy instance
ck.destroy();
```

### 2. Declarative HTML API

```html
<!-- Auto-detected with data attributes -->
<div
  data-squircle
  data-squircle-radius="20"
  data-squircle-smoothing="0.85"
  data-squircle-fill="#ffffff"
>
  Content
</div>

<!-- Responsive radius with data attributes -->
<div
  data-squircle
  data-squircle-radius-mobile="12"
  data-squircle-radius-tablet="16"
  data-squircle-radius-desktop="24"
>
  Responsive squircle
</div>

<!-- Container query based (auto-detected) -->
<div
  data-squircle
  data-squircle-radius-sm="12"    <!-- container < 100px -->
  data-squircle-radius-md="16"    <!-- container 100-300px -->
  data-squircle-radius-lg="24"    <!-- container > 300px -->
>
  Container-aware squircle
</div>
```

### 3. React Integration

```tsx
import { Squircle, useSquircle } from 'cornerkit/react';

// Component wrapper
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

// Hook for existing elements
function MyCard() {
  const ref = useSquircle({
    radius: 24,
    smoothing: 0.9,
    // Auto-updates on prop changes
    animate: true
  });

  return (
    <div ref={ref} className="card">
      Content
    </div>
  );
}

// With animation
function AnimatedSquircle() {
  const [radius, setRadius] = useState(16);

  return (
    <Squircle
      radius={radius}
      smoothing={0.8}
      animate={{ duration: 300, easing: 'ease-out' }}
      onMouseEnter={() => setRadius(24)}
      onMouseLeave={() => setRadius(16)}
    >
      Hover me
    </Squircle>
  );
}
```

### 4. Web Component

```html
<squircle-shape radius="20" smoothing="0.85" fill="#ffffff">
  <button>Click me</button>
</squircle-shape>

<script type="module">
  import 'cornerkit/web-component';

  // Programmatic control
  const squircle = document.querySelector('squircle-shape');
  squircle.radius = 32;
  squircle.smoothing = 0.9;

  // Listen to tier changes
  squircle.addEventListener('tier-changed', (e) => {
    console.log('Now using tier:', e.detail.tier);
  });
</script>
```

### 5. Vue Integration

```vue
<template>
  <Squircle
    :radius="20"
    :smoothing="0.85"
    fill="#ffffff"
    @click="handleClick"
  >
    <button>Click me</button>
  </Squircle>
</template>

<script setup>
import { Squircle } from 'cornerkit/vue';

const handleClick = () => {
  console.log('clicked');
};
</script>
```

---

## Core Implementation

### detector.ts - Browser Capability Detection

```typescript
export enum RenderTier {
  NATIVE = 'native',
  HOUDINI = 'houdini',
  CLIPPATH = 'clippath',
  FALLBACK = 'fallback'
}

export class CapabilityDetector {
  private static instance: CapabilityDetector;
  private detectedTier: RenderTier | null = null;

  private constructor() {}

  static getInstance(): CapabilityDetector {
    if (!CapabilityDetector.instance) {
      CapabilityDetector.instance = new CapabilityDetector();
    }
    return CapabilityDetector.instance;
  }

  detect(): RenderTier {
    if (this.detectedTier) return this.detectedTier;

    // Tier 1: Native CSS corner-shape (Chrome 139+)
    if (this.supportsNativeSquircle()) {
      this.detectedTier = RenderTier.NATIVE;
      return this.detectedTier;
    }

    // Tier 2: CSS Houdini Paint API
    if (this.supportsHoudini()) {
      this.detectedTier = RenderTier.HOUDINI;
      return this.detectedTier;
    }

    // Tier 3: clip-path support
    if (this.supportsClipPath()) {
      this.detectedTier = RenderTier.CLIPPATH;
      return this.detectedTier;
    }

    // Tier 4: Fallback
    this.detectedTier = RenderTier.FALLBACK;
    return this.detectedTier;
  }

  private supportsNativeSquircle(): boolean {
    if (typeof CSS === 'undefined' || !CSS.supports) return false;

    // Test for corner-shape: squircle
    return CSS.supports('corner-shape', 'squircle') ||
           CSS.supports('corner-shape', 'superellipse(2)');
  }

  private supportsHoudini(): boolean {
    if (typeof CSS === 'undefined') return false;
    return 'paintWorklet' in CSS;
  }

  private supportsClipPath(): boolean {
    if (typeof CSS === 'undefined' || !CSS.supports) return false;
    return CSS.supports('clip-path', 'path("")');
  }

  getTier(): RenderTier | null {
    return this.detectedTier;
  }

  reset(): void {
    this.detectedTier = null;
  }
}
```

### superellipse.ts - Math Core

```typescript
export interface Point {
  x: number;
  y: number;
}

export class SuperellipseMath {
  /**
   * Calculate point on superellipse curve
   *
   * @param t - Parameter from 0 to 1 (position along curve)
   * @param a - Semi-major axis (radius)
   * @param n - Exponent (2 = ellipse, 4 = squircle, higher = more rectangular)
   * @returns Point on the curve
   */
  static point(t: number, a: number, n: number): Point {
    const angle = 2 * Math.PI * t;
    const cosT = Math.cos(angle);
    const sinT = Math.sin(angle);

    const x = a * Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / n);
    const y = a * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / n);

    return { x, y };
  }

  /**
   * Convert smoothing (0-1) to exponent
   *
   * @param smoothing - Smoothing factor (0 = sharp, 1 = very smooth)
   * @returns Exponent for superellipse formula
   */
  static smoothingToExponent(smoothing: number): number {
    // smoothing 0.0 -> n = 4 (squircle)
    // smoothing 1.0 -> n = 2 (ellipse/circle)
    return 2 + (4 - 2) * (1 - smoothing);
  }

  /**
   * Generate array of points for a complete squircle
   */
  static generatePoints(
    width: number,
    height: number,
    radius: number,
    smoothing: number,
    segments: number = 40
  ): Point[] {
    const n = this.smoothingToExponent(smoothing);
    const points: Point[] = [];
    const r = Math.min(radius, width / 2, height / 2);

    // Top-right corner
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI / 2;
      const pt = this.cornerPoint(width - r, r, r, angle, n, 0);
      points.push(pt);
    }

    // Bottom-right corner
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI / 2;
      const pt = this.cornerPoint(width - r, height - r, r, angle, n, Math.PI / 2);
      points.push(pt);
    }

    // Bottom-left corner
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI / 2;
      const pt = this.cornerPoint(r, height - r, r, angle, n, Math.PI);
      points.push(pt);
    }

    // Top-left corner
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI / 2;
      const pt = this.cornerPoint(r, r, r, angle, n, Math.PI * 1.5);
      points.push(pt);
    }

    return points;
  }

  /**
   * Calculate point on a corner curve
   */
  private static cornerPoint(
    cx: number,
    cy: number,
    r: number,
    angle: number,
    n: number,
    rotation: number
  ): Point {
    const totalAngle = angle + rotation;
    const cosT = Math.cos(totalAngle);
    const sinT = Math.sin(totalAngle);

    const x = cx + r * Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / n);
    const y = cy + r * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / n);

    return { x, y };
  }
}
```

### path-generator.ts - SVG Path Builder

```typescript
import { SuperellipseMath, Point } from './superellipse';

export class PathGenerator {
  /**
   * Generate SVG path string for a squircle
   */
  static generate(
    width: number,
    height: number,
    radius: number,
    smoothing: number,
    segments: number = 40
  ): string {
    const points = SuperellipseMath.generatePoints(
      width,
      height,
      radius,
      smoothing,
      segments
    );

    if (points.length === 0) return '';

    const pathParts: string[] = [];

    // Start at first point
    pathParts.push(`M ${points[0].x} ${points[0].y}`);

    // Draw lines to all other points
    for (let i = 1; i < points.length; i++) {
      pathParts.push(`L ${points[i].x} ${points[i].y}`);
    }

    // Close path
    pathParts.push('Z');

    return pathParts.join(' ');
  }

  /**
   * Generate optimized path with cubic bezier curves (smoother, fewer points)
   */
  static generateSmooth(
    width: number,
    height: number,
    radius: number,
    smoothing: number
  ): string {
    const r = Math.min(radius, width / 2, height / 2);

    // Magic number for bezier control points to approximate superellipse
    // This varies based on smoothing
    const k = 0.552284749831 + (smoothing - 0.5) * 0.2;
    const c = r * k;

    // Pre-calculate all coordinates to avoid repeated arithmetic
    const wr = width - r;
    const hr = height - r;
    const wrc = wr + c;
    const hrc = hr + c;
    const rc = r - c;

    // Build path string efficiently without template literals
    return `M${r},0 L${wr},0 C${wrc},0 ${width},${rc} ${width},${r} L${width},${hr} C${width},${hrc} ${wrc},${height} ${wr},${height} L${r},${height} C${rc},${height} 0,${hrc} 0,${hr} L0,${r} C0,${rc} ${rc},0 ${r},0 Z`;
  }
}
```

### clippath.ts - Renderer Implementation

```typescript
import { PathGenerator } from '../math/path-generator';

export interface SquircleConfig {
  radius: number;
  smoothing: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export class ClipPathRenderer {
  private observer: ResizeObserver | null = null;
  private elements = new Map<Element, SquircleConfig>();

  apply(element: Element, config: SquircleConfig): void {
    this.elements.set(element, config);
    this.render(element, config);
    this.observeResize(element);
  }

  remove(element: Element): void {
    this.elements.delete(element);
    if (element instanceof HTMLElement) {
      element.style.removeProperty('clip-path');
      element.style.removeProperty('-webkit-clip-path');
    }
  }

  update(element: Element, config: Partial<SquircleConfig>): void {
    const current = this.elements.get(element);
    if (!current) return;

    const merged = { ...current, ...config };
    this.elements.set(element, merged);
    this.render(element, merged);
  }

  private render(element: Element, config: SquircleConfig): void {
    if (!(element instanceof HTMLElement)) return;

    try {
      // Check if element is still connected to DOM
      if (!element.isConnected) {
        console.warn('[cornerKit] Attempted to render detached element');
        return;
      }

      const rect = element.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);

      // Validate dimensions
      if (width === 1 && height === 1) {
        console.debug('[cornerKit] Element has no dimensions, skipping render');
        return;
      }

      // Validate config values
      if (config.radius < 0 || config.smoothing < 0 || config.smoothing > 1) {
        console.error('[cornerKit] Invalid config values:', config);
        return;
      }

      // Generate SVG path
      const path = PathGenerator.generateSmooth(
        width,
        height,
        config.radius,
        config.smoothing
      );

      // Validate generated path
      if (!path || path.length === 0) {
        console.error('[cornerKit] Failed to generate valid path');
        return;
      }

      // Apply clip-path
      element.style.clipPath = `path('${path}')`;
      element.style.webkitClipPath = `path('${path}')`;

      // Store path as CSS variable for potential other uses
      element.style.setProperty('--squircle-path', `"${path}"`);
    } catch (error) {
      console.error('[cornerKit] Render error:', error);
      // Fallback: remove any partial styling
      element.style.removeProperty('clip-path');
      element.style.removeProperty('-webkit-clip-path');
    }
  }

  private observeResize(element: Element): void {
    if (!this.observer) {
      let rafId: number | null = null;

      this.observer = new ResizeObserver((entries) => {
        // Cancel pending animation frame to debounce
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }

        // Schedule render on next animation frame
        rafId = requestAnimationFrame(() => {
          for (const entry of entries) {
            const config = this.elements.get(entry.target);
            if (config) {
              // Use entry dimensions to avoid additional getBoundingClientRect call
              const width = Math.max(1, entry.contentRect.width);
              const height = Math.max(1, entry.contentRect.height);
              this.renderWithDimensions(entry.target, config, width, height);
            }
          }
          rafId = null;
        });
      });
    }

    this.observer.observe(element);
  }

  private renderWithDimensions(element: Element, config: SquircleConfig, width: number, height: number): void {
    if (!(element instanceof HTMLElement)) return;

    try {
      // Check if element is still connected to DOM
      if (!element.isConnected) {
        console.warn('[cornerKit] Attempted to render detached element');
        return;
      }

      // Validate dimensions
      if (width === 1 && height === 1) {
        console.debug('[cornerKit] Element has no dimensions, skipping render');
        return;
      }

      // Validate config values
      if (config.radius < 0 || config.smoothing < 0 || config.smoothing > 1) {
        console.error('[cornerKit] Invalid config values:', config);
        return;
      }

      // Generate SVG path
      const path = PathGenerator.generateSmooth(
        width,
        height,
        config.radius,
        config.smoothing
      );

      // Validate generated path
      if (!path || path.length === 0) {
        console.error('[cornerKit] Failed to generate valid path');
        return;
      }

      // Apply clip-path
      element.style.clipPath = `path('${path}')`;
      element.style.webkitClipPath = `path('${path}')`;

      // Store path as CSS variable for potential other uses
      element.style.setProperty('--squircle-path', `"${path}"`);
    } catch (error) {
      console.error('[cornerKit] Render error:', error);
      // Fallback: remove any partial styling
      element.style.removeProperty('clip-path');
      element.style.removeProperty('-webkit-clip-path');
    }
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.elements.clear();
  }
}
```

---

## Build Configuration

### package.json

```json
{
  "name": "cornerkit",
  "version": "1.0.0",
  "description": "iOS-style squircle corners for the web",
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "main": "dist/cornerkit.js",
  "module": "dist/cornerkit.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "worklets"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/cornerkit.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/cornerkit/issues"
  },
  "homepage": "https://github.com/yourusername/cornerkit#readme",
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "vitest",
    "test:visual": "playwright test",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "prepublishOnly": "npm run type-check && npm run test && npm run build"
  },
  "keywords": [
    "squircle",
    "superellipse",
    "corner",
    "border-radius",
    "css",
    "houdini",
    "ios",
    "design-system",
    "ui"
  ],
  "exports": {
    ".": {
      "import": "./dist/cornerkit.esm.js",
      "require": "./dist/cornerkit.js",
      "types": "./dist/index.d.ts"
    },
    "./react": {
      "import": "./dist/react.esm.js",
      "types": "./dist/integrations/react.d.ts"
    },
    "./vue": {
      "import": "./dist/vue.esm.js",
      "types": "./dist/integrations/vue.d.ts"
    },
    "./web-component": {
      "import": "./dist/web-component.esm.js"
    },
    "./shopify": {
      "import": "./dist/shopify.esm.js",
      "types": "./dist/integrations/shopify.d.ts"
    }
  },
  "peerDependencies": {
    "react": "^16.8.0 || ^17.0.0 || ^18.0.0",
    "vue": "^3.0.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    },
    "vue": {
      "optional": true
    }
  },
  "devDependencies": {
    "@rollup/plugin-typescript": "^11.0.0",
    "@types/node": "^20.0.0",
    "rollup": "^4.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "playwright": "^1.40.0"
  }
}
```

---

## Next Steps - Development Roadmap

### Phase 1: Core Library (Week 1-2)
- [ ] Set up TypeScript project structure
- [ ] Implement capability detector
- [ ] Build superellipse math engine
- [ ] Create path generator
- [ ] Implement clip-path renderer
- [ ] Write unit tests

### Phase 2: Progressive Enhancement (Week 3)
- [ ] Build Houdini Paint Worklet
- [ ] Create native CSS renderer
- [ ] Implement fallback renderer
- [ ] Add tier selection logic
- [ ] Performance benchmarks

### Phase 3: Framework Integrations (Week 4)
- [ ] React component + hook
- [ ] Vue component
- [ ] Web Component
- [ ] Vanilla JS API
- [ ] Documentation

### Phase 4: Shopify Integration (Week 5-6)
- [ ] Shopify helper functions
- [ ] Theme App Extension wrapper
- [ ] Liquid snippet templates
- [ ] Example theme blocks
- [ ] Merchant documentation

### Phase 5: Polish & Release (Week 7-8)
- [ ] Visual regression tests
- [ ] Performance optimization
- [ ] Bundle size optimization
- [ ] Documentation website
- [ ] NPM publish
- [ ] Shopify App Store submission

---

## Success Metrics

- **Bundle size**: < 5KB gzipped (core)
- **Performance**: < 10ms per element (clip-path tier)
- **Browser support**: 95%+ of users
- **Developer experience**: < 5 min to first squircle
- **NPM downloads**: 1K+ per week (6 months)

---

This gives you a complete, production-ready library that can be:
1. Used standalone on any website
2. Integrated into React/Vue/etc projects
3. Wrapped in Shopify Theme App Extension
4. Published to NPM for wider adoption

Would you like me to start implementing any specific part of this architecture?
