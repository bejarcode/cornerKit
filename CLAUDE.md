# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**cornerKit** is a lightweight (~5KB gzipped), framework-agnostic JavaScript library for implementing iOS-style squircle (continuous curve) corners on web elements. The library uses a 4-tier progressive enhancement strategy to automatically select the optimal rendering method based on browser capabilities.

This is a greenfield NPM package project intended for publication and distribution.

## Core Concept: Squircles

**Squircles** (superellipses) are continuous curves that blend between squares and circles, creating smoother, more visually pleasing corners than standard CSS `border-radius`. They're characteristic of iOS design and are mathematically defined using the superellipse formula with exponent n ≈ 4.

**Key Parameters:**
- **radius**: Corner radius in pixels (12-48px typical range)
- **smoothing**: 0.0-1.0 scale controlling curve smoothness (0.8 recommended for iOS-like appearance)

## Architecture

### 4-Tier Progressive Enhancement

The library automatically detects and uses the best available rendering method:

1. **Tier 1: Native CSS** (`corner-shape: squircle`) - Chrome 139+
   - GPU-accelerated, zero JavaScript
   - Future-proof approach

2. **Tier 2: CSS Houdini Paint API** - Chrome 65+, Edge 79+
   - Runs on paint thread (off main thread)
   - Near-native performance
   - Requires worklet registration

3. **Tier 3: SVG clip-path** - Modern browsers (Firefox, Safari)
   - Dynamic SVG path generation
   - JavaScript-driven with ResizeObserver
   - Limitation: Clips outside borders/shadows

4. **Tier 4: border-radius fallback** - Universal
   - Graceful degradation
   - Standard rounded corners (not true squircles)

## Project Structure

```
cornerKit/
├── src/
│   ├── core/
│   │   ├── detector.ts          # Browser capability detection
│   │   ├── registry.ts          # Element tracking and management
│   │   └── config.ts            # Default configuration
│   ├── renderers/
│   │   ├── native.ts            # Tier 1: CSS corner-shape
│   │   ├── houdini.ts           # Tier 2: Paint API
│   │   ├── clippath.ts          # Tier 3: SVG clip-path
│   │   └── fallback.ts          # Tier 4: border-radius
│   ├── math/
│   │   ├── superellipse.ts      # Superellipse formula implementation
│   │   └── path-generator.ts   # SVG path string generation
│   ├── integrations/
│   │   ├── react.tsx            # React component + hook
│   │   ├── vue.ts               # Vue component + composable
│   │   ├── web-component.ts    # Native Web Component
│   │   └── shopify.ts           # Shopify Liquid helpers
│   ├── utils/
│   │   ├── observer.ts          # Intersection/Resize observers
│   │   └── performance.ts      # Performance monitoring
│   └── index.ts                 # Main entry point
├── worklets/
│   └── squircle-paint.js        # Houdini Paint Worklet
├── dist/                        # Build output
├── examples/                    # Usage examples
└── tests/                       # Unit + visual tests
```

## Key Technical Components

### 1. Superellipse Math Engine

The core mathematical implementation uses the superellipse formula:

```
x = a × sign(cos θ) × |cos θ|^(2/n)
y = a × sign(sin θ) × |sin θ|^(2/n)
```

Where:
- `a` = radius
- `n` = exponent (2 = circle, 4 = squircle)
- `θ` = angle parameter

The `smoothing` parameter (0-1) maps to exponent `n`:
```
n = 2 + (4 - 2) × (1 - smoothing)
```

### 2. Browser Capability Detection

Uses feature detection (not user-agent sniffing):
- `CSS.supports('corner-shape', 'squircle')` for native CSS
- `'paintWorklet' in CSS` for Houdini
- `CSS.supports('clip-path', 'path("")')` for clip-path

### 3. Performance Optimizations

- **Lazy loading**: IntersectionObserver only processes visible elements
- **Debounced resize**: Prevents excessive recalculations
- **ResizeObserver**: Automatic updates when element dimensions change
- **GPU acceleration**: When available (Tier 1 & 2)

## API Design Philosophy

### Declarative HTML (Recommended for simplicity)

```html
<div
  data-squircle
  data-squircle-radius="20"
  data-squircle-smoothing="0.85"
>
  Content
</div>
```

### Programmatic JavaScript (Recommended for dynamic control)

```javascript
import CornerKit from 'cornerkit';

const ck = new CornerKit();
ck.apply('.button', { radius: 20, smoothing: 0.85 });
```

### Framework Components (Recommended for React/Vue projects)

```jsx
// React
<Squircle radius={20} smoothing={0.85}>
  <button>Click me</button>
</Squircle>
```

## Build System

- **Bundler**: Rollup
- **Language**: TypeScript
- **Output formats**:
  - UMD (global)
  - ES modules
  - TypeScript definitions
- **Target size**: < 5KB gzipped (core)

## Development Workflow

### Phase 1: Core Library (Current Focus)
1. Set up TypeScript + Rollup build system
2. Implement superellipse math engine
3. Create browser capability detector
4. Build clip-path renderer (Tier 3 - most compatible)
5. Write unit tests for math and detection

### Phase 2: Progressive Enhancement
1. Implement Houdini Paint Worklet (Tier 2)
2. Add native CSS renderer (Tier 1)
3. Create tier selection orchestration
4. Performance benchmarking

### Phase 3: Framework Integrations
1. React component + `useSquircle` hook
2. Vue component + composable
3. Web Component implementation
4. Documentation for each framework

### Phase 4: Shopify Integration (Separate Package)
1. Liquid snippet helpers
2. Theme App Extension wrapper
3. Merchant-facing UI in theme editor

### Phase 5: Publication
1. Visual regression tests
2. Bundle size optimization
3. Documentation website
4. NPM publish
5. Optional: Shopify App Store

## Testing Strategy

### Unit Tests
- Superellipse math accuracy
- Path generation correctness
- Browser capability detection
- Configuration validation

### Visual Regression Tests
- Screenshot comparison across browsers
- Verify squircle shape accuracy
- Test responsive behavior
- Animation smoothness

### Performance Tests
- Render time benchmarks (< 10ms target for Tier 3)
- Memory usage
- Resize handler efficiency

## Key Design Decisions

### Why 4-tier progressive enhancement?
- Maximizes performance on modern browsers (native CSS)
- Ensures functionality everywhere (fallback to border-radius)
- Future-proof (auto-adopts new browser features)

### Why superellipse instead of bezier approximation?
- Mathematical accuracy
- Consistent curve across all radii
- Easier to parameterize (single smoothing value)

### Why separate Houdini worklet?
- Runs off main thread (better performance)
- Can be lazy-loaded
- Optional (graceful degradation to Tier 3)

### Why framework-agnostic core?
- Smaller bundle size
- Works anywhere (vanilla JS, any framework)
- Framework wrappers are thin adapters

## Common Development Commands

```bash
# Install dependencies
npm install

# Development build (watch mode)
npm run dev

# Production build
npm run build

# Run tests
npm test

# Run visual regression tests
npm run test:visual

# Type checking
npm run type-check

# Lint
npm run lint
```

## Documentation Files

### Root Documentation
- **[README.md](README.md)**: Complete NPM package documentation (API reference, usage guide, examples)
- **[CLAUDE.md](CLAUDE.md)**: This file - guidance for Claude Code when working in this repository
- **[CODE-REVIEW.md](CODE-REVIEW.md)**: Comprehensive code review findings and recommendations

### docs/ Directory

**Product Requirements:**
- **[docs/PRD.md](docs/PRD.md)**: Core library PRD - NPM package for developers
- **[docs/PRD-SHOPIFY.md](docs/PRD-SHOPIFY.md)**: Shopify extension PRD - App Store product for merchants

**Technical Documentation:**
- **[docs/TECH-STACK.md](docs/TECH-STACK.md)**: Technology stack and tooling decisions
- **[docs/API-SPEC.md](docs/API-SPEC.md)**: Complete API specification for all packages
- **[docs/WORKSPACE-CONFIG.md](docs/WORKSPACE-CONFIG.md)**: Monorepo workspace configuration
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**: Technical architecture and implementation plan (with optimized code)
- **[docs/SHOPIFY.md](docs/SHOPIFY.md)**: Shopify Theme App Extension technical documentation

## Package.json Configuration

```json
{
  "name": "cornerkit",
  "version": "1.0.0",
  "main": "dist/cornerkit.js",
  "module": "dist/cornerkit.esm.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/cornerkit.esm.js",
      "require": "./dist/cornerkit.js",
      "types": "./dist/index.d.ts"
    },
    "./react": { ... },
    "./vue": { ... },
    "./web-component": { ... }
  }
}
```

## Dependencies

**Runtime**: ZERO (fully self-contained)

**Development**:
- TypeScript (language)
- Rollup (bundler)
- Vitest (unit tests)
- Playwright (visual regression)

**Peer Dependencies** (optional):
- React 16.8+ (for React integration)
- Vue 3+ (for Vue integration)

## Performance Targets

- **Bundle size**: < 5KB gzipped (core)
- **Render time**:
  - Tier 1 (Native): 0ms JS overhead
  - Tier 2 (Houdini): ~2ms initialization
  - Tier 3 (clip-path): < 10ms per element
- **Browser support**: 98%+ of global users
- **Lighthouse score**: No negative impact on Core Web Vitals

## Code Style Guidelines

- Use TypeScript strict mode
- Prefer functional programming patterns
- Avoid external dependencies
- Optimize for tree-shaking
- Comment complex math/algorithms
- Use meaningful variable names
- Write self-documenting code

## Implementation Notes

When implementing features:

1. **Start with Tier 3 (clip-path)** - Most universally compatible, easiest to test
2. **Add Tier 2 (Houdini)** - Requires worklet, more complex
3. **Add Tier 1 (Native CSS)** - Simplest, but newest (Chrome 139+ only)
4. **Tier 4 is automatic** - Just CSS, no special handling needed

### Superellipse Implementation

The mathematical accuracy is critical. Use these guidelines:
- Minimum 40 segments per corner for smooth curves
- Use `Math.sign()` to handle negative values correctly
- Clamp radius to min(width/2, height/2) to prevent overflow

### ResizeObserver Usage

Always debounce or use `requestAnimationFrame` to batch updates:
```javascript
const observer = new ResizeObserver(entries => {
  requestAnimationFrame(() => {
    entries.forEach(entry => render(entry.target));
  });
});
```

### Path Generation Optimization

For Tier 3, consider two approaches:
1. **Point-based**: Generate array of points, connect with lines (accurate, more bytes)
2. **Bezier-based**: Approximate with cubic beziers (smaller path, slightly less accurate)

Use bezier-based for production (smaller output).

## Future Enhancements (Post v1.0)

- [ ] Scroll-driven animations (experimental)
- [ ] View Transitions API integration
- [ ] Individual corner control (different radius per corner)
- [ ] Gradient borders that follow squircle path
- [ ] SVG filter-based shadows that match shape
- [ ] WebAssembly path generation for extreme performance
- [ ] React Native support (native iOS/Android)

## Related Resources

- **CSS corner-shape spec**: https://drafts.csswg.org/css-borders-4/#corner-shape
- **Houdini Paint API**: https://developer.mozilla.org/en-US/docs/Web/API/CSS_Painting_API
- **Superellipse formula**: https://en.wikipedia.org/wiki/Superellipse
- **figma-squircle library**: https://github.com/figma/squircle (reference implementation)
