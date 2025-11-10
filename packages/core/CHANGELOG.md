# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-11-10

### Added

#### Core Features
- Initial release of @cornerkit/core
- iOS-style squircle corners with mathematically accurate superellipse curves
- 4-tier progressive enhancement system:
  - Tier 1: Native CSS `corner-shape: squircle` (Chrome 139+, future)
  - Tier 2: CSS Houdini Paint API (deferred to Phase 2)
  - Tier 3: SVG clip-path (current primary implementation)
  - Tier 4: border-radius fallback (universal support)

#### API Methods
- `constructor(config?)` - Initialize with optional global configuration
- `apply(element, config?)` - Apply squircle to single element
- `applyAll(selector, config?)` - Batch application to multiple elements
- `auto()` - Auto-discover via data-squircle attributes with lazy loading
- `update(element, config)` - Update configuration for managed element
- `remove(element)` - Remove squircle and cleanup observers
- `inspect(element)` - Get current configuration and state
- `destroy()` - Remove all squircles and cleanup resources
- `CornerKit.supports()` - Static method to check browser support

#### Configuration
- `radius` parameter: Corner radius in pixels (default: 20)
- `smoothing` parameter: 0-1 scale controlling curve smoothness (default: 0.8)
- Global defaults configurable per instance
- Per-element configuration overrides

#### Performance Optimizations
- Zero runtime dependencies
- Bundle size: ~4KB gzipped (ESM/UMD/CJS)
- ResizeObserver integration with RAF debouncing for 60fps updates
- IntersectionObserver for lazy loading (auto() method)
- WeakMap-based element registry for automatic garbage collection
- 1px update threshold to prevent unnecessary recalculations

#### Accessibility Features
- Focus indicator preservation (outline properties never modified)
- Automatic prefers-reduced-motion support
- ARIA attribute preservation
- Tab order unchanged
- Screen reader compatible
- WCAG 2.1 AA compliant

#### Developer Experience
- Full TypeScript support with strict mode
- Comprehensive type definitions included
- 8 exported types: SquircleConfig, ManagedElementInfo, BrowserSupport, etc.
- JSDoc documentation on all public methods
- Data attribute support for declarative HTML
- <5 minute quick start guide

#### Browser Support
- Chrome 65+ (ClipPath tier)
- Firefox latest 2 versions (ClipPath tier)
- Safari 14+ (ClipPath tier)
- Edge 79+ (ClipPath tier)
- IE 11 (border-radius fallback tier)
- 98%+ global browser coverage

#### Testing
- 340 unit tests with 100% pass rate
- 99% code coverage (>90% target exceeded)
- Vitest test framework with happy-dom
- All core functionality validated

### Security
- Zero network requests (100% offline operation)
- No eval(), Function(), or innerHTML usage
- No localStorage, sessionStorage, or cookies
- CSP compatible (no unsafe-inline or unsafe-eval)
- No data collection, analytics, or telemetry
- Input validation for all user-provided values
- GDPR/CCPA compliant by design

### Technical Details
- Language: TypeScript 5.3+ with strict mode
- Build: Rollup with terser minification
- Output formats: ESM, UMD, CJS + TypeScript definitions
- Source maps included for all builds
- Tree-shakeable with sideEffects: false
- Node.js: >= 16.0.0

### Performance Metrics
- Bundle size: 3.84 KB gzipped (ESM), 3.96 KB (UMD), 3.87 KB (CJS)
- Render time: <10ms per element (target met)
- Init time: <100ms (target met)
- 60fps maintained during resize operations

### Documentation
- Comprehensive README with full API reference
- Installation instructions (npm/pnpm/yarn)
- Quick start guide (<5 minutes)
- Configuration reference with recommended values
- Accessibility best practices guide
- Browser compatibility matrix
- TypeScript usage examples
- Security & privacy guarantees
- Advanced usage patterns

[Unreleased]: https://github.com/cornerkit/cornerkit/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/cornerkit/cornerkit/releases/tag/v1.0.0
