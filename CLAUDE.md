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
├── .specify/                    # Spec-kit configuration
│   ├── memory/
│   │   └── constitution.md     # Project constitution (10 principles)
│   └── templates/              # Spec-kit templates
├── specs/                      # Feature specifications
│   └── 001-core-library/
│       ├── spec.md            # Feature specification (60 functional requirements)
│       ├── plan.md            # Implementation plan (architecture decisions)
│       ├── tasks.md           # Task breakdown (390 atomic tasks)
│       ├── research.md        # Technical decisions (7 key choices)
│       ├── data-model.md      # Entity definitions
│       ├── quickstart.md      # Developer onboarding guide
│       ├── contracts/
│       │   ├── api.md        # API contract
│       │   └── types.ts      # TypeScript definitions contract
│       └── checklists/
│           └── requirements.md
├── docs/                       # Product & technical documentation
│   ├── PRD.md
│   ├── PRD-SHOPIFY.md
│   ├── TECH-STACK.md
│   ├── API-SPEC.md
│   ├── WORKSPACE-CONFIG.md
│   ├── ARCHITECTURE.md
│   ├── SHOPIFY.md
│   └── ROADMAP.md            # 43 features across 6 phases
├── packages/core/             # Monorepo package (Feature 001)
│   ├── src/
│   │   ├── core/
│   │   │   ├── detector.ts   # Browser capability detection
│   │   │   ├── registry.ts   # Element tracking and management
│   │   │   └── config.ts     # Default configuration
│   │   ├── renderers/
│   │   │   ├── clippath.ts   # Tier 3: SVG clip-path (PRIMARY)
│   │   │   ├── fallback.ts   # Tier 4: border-radius
│   │   │   ├── houdini.ts    # Tier 2: Paint API (Phase 2)
│   │   │   └── native.ts     # Tier 1: CSS corner-shape (Phase 2)
│   │   ├── math/
│   │   │   ├── superellipse.ts    # Superellipse formula
│   │   │   └── path-generator.ts  # SVG path generation
│   │   ├── utils/
│   │   │   ├── validator.ts       # Input validation
│   │   │   └── logger.ts          # Development warnings
│   │   └── index.ts               # Main entry point
│   ├── tests/
│   │   ├── unit/                  # Unit tests (>90% coverage target)
│   │   └── integration/           # Integration tests (Playwright)
│   ├── package.json               # Zero runtime dependencies
│   ├── tsconfig.json              # TypeScript strict mode
│   ├── rollup.config.js           # ESM/UMD/CJS builds
│   └── vitest.config.ts           # Test configuration
├── examples/                      # Usage examples
└── README.md                      # NPM package documentation
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

This project uses **spec-kit** (GitHub's Spec-Driven Development toolkit) for structured feature development.

### Spec-Kit Workflow

```
Constitution → Specify → Plan → Tasks → Implement
```

1. **Constitution** (`.specify/memory/constitution.md`) - 10 core principles governing all decisions
2. **Specify** (`/specify`) - Generate feature specifications with requirements and user stories
3. **Plan** (`/plan`) - Create implementation plans with architecture decisions
4. **Tasks** (`/tasks`) - Break down into atomic, actionable tasks (1-4 hours each)
5. **Implement** (`/implement`) - Execute tasks systematically with tests

### Current Project Status

**Feature 001: Core Library** (Phase 1 - In Progress)
- ✅ Constitution v1.1.0 created (10 principles)
- ✅ Specification complete ([specs/001-core-library/spec.md](specs/001-core-library/spec.md))
- ✅ Implementation plan complete ([specs/001-core-library/plan.md](specs/001-core-library/plan.md))
- ✅ Task breakdown complete ([specs/001-core-library/tasks.md](specs/001-core-library/tasks.md)) - 390 tasks
- ✅ Setup phase complete (T001-T010) - TypeScript, Rollup, Vitest configured
- 🔄 **Next**: Phase 2 (Foundational) - T011-T060 (Detector, Math, Path Gen, Validation)

**Roadmap** ([docs/ROADMAP.md](docs/ROADMAP.md)):
- Phase 1: Core Library (Features 001-010) - 4 weeks
- Phase 2: Framework Integrations (Features 011-020) - 3 weeks
- Phase 3: Advanced Features (Features 021-030) - 3 weeks
- Phase 4: Shopify Extension (Features 031-035) - 2 weeks
- Phase 5: Developer Experience (Features 036-040) - 2 weeks
- Phase 6: Final Polish (Features 041-043) - 1 week

### Implementation Phases (Feature 001)

**Phase 1A: Foundation** (T011-T060)
- Browser capability detector
- Superellipse math engine
- SVG path generator
- Input validator
- Development logger

**Phase 1B: Rendering** (T061-T110)
- ClipPath renderer (Tier 3 - primary implementation)
- Fallback renderer (Tier 4)
- Element registry with WeakMap
- ResizeObserver integration

**Phase 1C: API & Integration** (T111-T140)
- Main API (CornerKit class)
- Data attribute support
- Build system (Rollup)
- Unit tests (>90% coverage)

**Phase 2-4: User Stories** (T141-T292)
- Batch application (applyAll, auto)
- Dynamic updates (update, resize handling)
- Cleanup (remove, inspect, destroy)
- Accessibility features

**Phase 5: Final Polish** (T293-T390)
- Integration tests (Playwright)
- Performance benchmarks
- Bundle size optimization (<5KB)
- Documentation and release

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

### Spec-Kit Commands

```bash
# Create project constitution (one-time setup)
/constitution

# Generate feature specification
/specify

# Create implementation plan
/plan

# Break down into tasks
/tasks

# Start implementation
/implement
```

### Build & Test Commands

```bash
# Install dependencies
npm install

# Development build (watch mode)
npm run dev

# Production build
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run visual regression tests
npm run test:visual

# Type checking
npm run type-check

# Lint
npm run lint

# Check bundle size
npm run size
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
- **[docs/ROADMAP.md](docs/ROADMAP.md)**: Master roadmap - 43 features across 6 phases

**Technical Documentation:**
- **[docs/TECH-STACK.md](docs/TECH-STACK.md)**: Technology stack and tooling decisions
- **[docs/API-SPEC.md](docs/API-SPEC.md)**: Complete API specification for all packages
- **[docs/WORKSPACE-CONFIG.md](docs/WORKSPACE-CONFIG.md)**: Monorepo workspace configuration
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**: Technical architecture and implementation plan (with optimized code)
- **[docs/SHOPIFY.md](docs/SHOPIFY.md)**: Shopify Theme App Extension technical documentation

### specs/ Directory (Spec-Kit Features)

**Feature 001: Core Library** (Current)
- **[specs/001-core-library/spec.md](specs/001-core-library/spec.md)**: Complete specification (60 functional requirements, 4 user stories)
- **[specs/001-core-library/plan.md](specs/001-core-library/plan.md)**: Implementation plan (3 phases, constitution compliance)
- **[specs/001-core-library/tasks.md](specs/001-core-library/tasks.md)**: Task breakdown (390 atomic tasks)
- **[specs/001-core-library/research.md](specs/001-core-library/research.md)**: Technical decisions (7 key architecture choices)
- **[specs/001-core-library/data-model.md](specs/001-core-library/data-model.md)**: Entity definitions (SquircleConfig, RendererTier, etc.)
- **[specs/001-core-library/quickstart.md](specs/001-core-library/quickstart.md)**: Developer onboarding (<5 min setup guide)
- **[specs/001-core-library/contracts/api.md](specs/001-core-library/contracts/api.md)**: API contract (8 methods, error handling)
- **[specs/001-core-library/contracts/types.ts](specs/001-core-library/contracts/types.ts)**: TypeScript type definitions contract

### .specify/ Directory (Spec-Kit Configuration)

- **[.specify/memory/constitution.md](.specify/memory/constitution.md)**: Project constitution v1.1.0 (10 principles)
- **[.specify/templates/](.specify/templates/)**: Spec-kit command templates

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

### Spec-Kit Methodology

**Follow this order for Feature 001:**
1. **Phase 1A: Foundation** - Core infrastructure (detector, math, path gen, validation)
2. **Phase 1B: Rendering** - ClipPath (Tier 3) and Fallback (Tier 4) renderers
3. **Phase 1C: API** - CornerKit class, data attributes, build system
4. **Phases 2-4: User Stories** - Batch, dynamic, cleanup functionality
5. **Phase 5: Polish** - Integration tests, performance, documentation

**Tier Implementation Priority:**
1. **Start with Tier 3 (clip-path)** - Primary implementation, most compatible, easiest to test
2. **Add Tier 4 (fallback)** - Simple border-radius for IE11/older browsers
3. **Defer Tier 2 (Houdini)** - Phase 2 (requires worklet, more complex)
4. **Defer Tier 1 (Native CSS)** - Phase 2 (newest, Chrome 139+ only)

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
- **spec-kit**: https://github.com/github/spec-kit (Spec-Driven Development toolkit)

## Constitution Principles (v1.1.0)

The project follows 10 core principles defined in [.specify/memory/constitution.md](.specify/memory/constitution.md):

1. **Zero Dependencies** - Core library has zero runtime dependencies
2. **Performance First** - <5KB bundle, <10ms render, <100ms init
3. **Progressive Enhancement** - 4-tier system (Native→Houdini→ClipPath→Fallback)
4. **Framework Agnostic** - Vanilla TypeScript core, framework wrappers separate
5. **Type Safety** - TypeScript strict mode, >90% coverage for core, >85% for integration
6. **Developer Experience** - <5 min quickstart, excellent documentation
7. **Browser Compatibility** - 98%+ support with graceful degradation
8. **Accessibility** - WCAG 2.1 AA compliant, preserve focus rings, respect reduced motion
9. **Security** - No eval/innerHTML, input validation, CSP compatible
10. **Privacy** - No data collection, no network requests, GDPR/CCPA compliant

All implementation decisions must align with these principles.
