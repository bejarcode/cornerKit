# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.1] - 2026-07-19

### Fixed
- Documentation only, no code changes:
  - Browser support table now reflects actual behavior (all modern browsers render via the SVG ClipPath tier; Native CSS and Houdini tiers are roadmap items, not active)
  - Bundle analysis example updated to current sizes and the 6.5 KB budget
  - Test counts corrected (433 unit / 67 integration), coverage figure unified at 86.4%
  - Removed reference to a non-published report file; clarified the 0.8 smoothing default

## [1.3.0] - 2026-07-18

### Added
- **Border hover effects via CSS custom properties** ([#4](https://github.com/bejarcode/cornerKit/issues/4)) - Restyle borders from plain CSS, no JavaScript:
  - `--ck-border-color` drives the border stroke (works with solid, dashed, dotted, and gradient borders)
  - `--ck-background` drives the squircle background rendered in border mode
  - Configured values remain the fallback whenever the variables are not set
  - Example: `.btn:hover { --ck-border-color: hotpink }`
- **Development builds with console warnings** - Consumers now get cornerKit's developer warnings in dev mode:
  - ESM: served automatically via the `development` export condition (Vite, webpack, modern bundlers)
  - CJS/Node: `NODE_ENV`-based runtime switch in the package entry
  - Production builds remain warning-free and minified
- **`border: null`** - Explicitly remove a border via `update()`, or override an instance-level border default per element in `apply()`
- **Instance-level border defaults** - `new CornerKit({ border: {...} })` (and legacy `borderWidth`/`borderColor`) now applies to every element, matching radius/smoothing behavior

### Fixed
- **CJS entry was broken**: `require('@cornerkit/core')` returned an empty object (`"type": "module"` made Node parse the UMD file as ESM). `main`/`exports.require` now point to a real CommonJS entry and return the class directly
- **CDN/UMD global was not constructible**: `window.CornerKit` is now the class itself, so `new CornerKit()` works from a script tag as documented (named exports are attached as statics; `CornerKit.default` remains for compatibility)
- **TypeScript under `moduleResolution: node16`**: CJS consumers no longer hit TS1479; a dedicated `index.d.cts` ships alongside `index.d.ts`, with `types`-first export conditions
- `applyAll()` no longer aborts the remaining batch when one element fails to render
- `destroy()` no longer permanently disables reduced-motion tracking; instance reuse works as documented
- Reduced-motion preference changes no longer strip clip-path transitions the user defined themselves
- Borders configured on void/replaced elements (`img`, `input`, `select`, ...) no longer leave the element with a forced-transparent background; the squircle now falls back to plain clip-path rendering with a dev warning
- `inspect()` returns deep copies; mutating the returned config can no longer corrupt managed state
- Border configs are cloned on intake; mutating an object after passing it to `apply()`/`update()`/the constructor no longer leaks into applied elements
- Legacy `borderWidth: 0` with a color no longer renders a 1px border (explicit zero now means "no border")
- Dotted/inset border paths now share size clamping and degenerate-arc handling with the outer path, keeping shapes consistent on small elements and at `smoothing: 1`

### Changed
- Bundle size budget is now **< 6.5 KB gzipped** (currently ~6.0 KB UMD). History: < 5 KB (v1.1 core), < 6 KB (v1.2 borders), < 6.5 KB (hover hooks + fixes)
- `exports` map restructured with nested `types`-first conditions (`import`/`require` x `types`/`development`/`default`)

## [1.2.0] - 2025-12-07

### Added
- **SVG-based border rendering** - Complete rewrite of border system using layered SVG paths
  - Eliminates anti-aliasing fringe on dark backgrounds (SC-001)
  - SVG contains background fill path + border stroke path
  - SVG positioned with `z-index: -1` and parent uses `isolation: isolate`
- **New border styles** - Support for solid, dashed, and dotted borders
  - Solid: Default style with clean edges
  - Dashed: 8px dash / 4px gap pattern (`border.style: 'dashed'`)
  - Dotted: Round dots using inset path rendering (`border.style: 'dotted'`)
- **Custom dash patterns** - Configure via `border.dashArray` (e.g., `'12 6'`)
- **Gradient borders** - Linear gradients with configurable color stops
  - `border.gradient: [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#8b5cf6' }]`
  - Default direction: top-left to bottom-right
- **Border data attributes** - Declarative HTML configuration
  - `data-squircle-border-width="2"`
  - `data-squircle-border-color="#3b82f6"`
  - `data-squircle-border-style="dashed"`
- **Border validation** - Width clamped to 1-8px range, invalid colors fall back to transparent
- **Background capture** - Preserves background-image and box-shadow during border rendering

### Changed
- **New nested border API** - Configuration uses `border: { width, color, style, dashArray, gradient }`
- **Backward compatible** - Legacy `borderWidth` and `borderColor` still work
- **Bundle size** - Increased to ~5.8 KB gzipped (under 6KB target per SC-004)
- **CSS framework compatibility** - Uses `!important` for critical styles to prevent Tailwind conflicts

### Technical Details
- Dotted borders use inset path rendering (no clip-path) to avoid artifacts through gaps
- Background fill extends with stroke to cover anti-aliased edges in gaps
- ResizeObserver updates borders on element resize within 16ms frame timing
- 412 unit tests + 66 integration tests passing
- Works consistently across Chrome 90+, Firefox 90+, Safari 14+, Edge 90+

### Migration Guide
```javascript
// Old API (still works)
ck.apply(element, { borderWidth: 2, borderColor: '#3b82f6' })

// New API (recommended)
ck.apply(element, {
  border: {
    width: 2,
    color: '#3b82f6',
    style: 'solid' // or 'dashed', 'dotted'
  }
})
```

## [1.1.0] - 2025-11-18

### Added
- **Border support** - Squircle borders that follow the curve path using pseudo-element rendering
  - New `borderWidth` config option (pixels)
  - New `borderColor` config option (any valid CSS color)
  - Borders extend outward from element boundaries (outer stroke positioning)
  - Automatic background preservation using individual CSS properties
  - Interactive border controls in playground (toggle, width slider, color picker)
  - Code generation updated to include border parameters

### Changed
- Bundle size increased from 3.66 KB to 4.58 KB gzipped (+0.92 KB for border feature)
- Pseudo-element architecture: `::before` for border (z-index: 0), `::after` for background (z-index: 1)
- Elements with borders automatically get `position: relative` if needed
- Child elements positioned with `z-index: 2` to stay on top of border layers

### Technical Details
- Border rendering uses layered pseudo-elements to work around clip-path masking
- Background split into individual CSS properties (backgroundColor, backgroundImage, etc.)
- Original background stored in dataset to prevent recapture issues
- Performance: ~0.4ms additional render time per bordered element

## [1.0.3] - 2025-11-17

### Fixed
- Fixed 100% smoothing spike artifact - corners no longer show thin lines at maximum smoothing
- Implemented proportional scaling for large radius values - maintains smooth S-curves when space is constrained
- Fixed Chrome false-positive native CSS detection - disabled corner-shape: squircle detection until browsers actually render it
- Disabled Houdini Paint API detection - waiting for actual paint worklet implementation in Phase 2
- Improved FOUC (Flash of Unstyled Content) prevention for demo website

### Changed
- Enhanced Figma squircle algorithm with preserveSmoothing mode (default: true)
- When corner radius is large relative to element dimensions, bezier handles are proportionally scaled instead of reducing smoothing
- This maintains the characteristic iOS-style continuous S-curve even when space is limited

## [1.0.2] - 2025-11-16

### Fixed
- Safari clip-path detection now uses runtime feature test as fallback
- Safari's CSS.supports() incorrectly returns false for path(), causing fallback to border-radius
- Added dual detection: CSS.supports first, then runtime element test for Safari compatibility
- Safari 13.1+ now correctly uses SVG clip-path tier instead of border-radius fallback

### Added
- Interactive demo website at https://bejarcode.github.io/cornerKit/
- Live playground with adjustable radius and smoothing sliders
- Visual gallery with 36+ UI component examples
- Side-by-side comparison: squircles vs standard border-radius
- Browser compatibility detector
- Code generator for 5 formats (Vanilla JS, HTML, TypeScript, React, Vue)

## [1.0.0] - 2025-11-12

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
- Exceptionally small bundle size (27% under 5KB target):
  - ESM: 3.66 KB gzipped
  - UMD: 3.78 KB gzipped
  - CJS: 3.69 KB gzipped
- ResizeObserver integration with RAF debouncing for 60fps updates
- IntersectionObserver for lazy loading (auto() method)
- WeakMap-based element registry for automatic garbage collection
- 1px update threshold to prevent unnecessary recalculations
- Automated bundle size monitoring in CI

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
- 313 unit tests with 100% pass rate
- 97.9% code coverage for core rendering logic (>90% target exceeded)
- 46/47 integration tests passing (97.9% success rate)
- Vitest test framework with happy-dom for unit tests
- Playwright for integration and visual regression tests
- Performance benchmarks (<10ms render, <100ms init, 60fps resize)
- All core functionality validated across browsers

### Security
- **A+ Security Rating** - Zero production vulnerabilities
- Zero network requests (100% offline operation)
- No eval(), Function(), or innerHTML usage
- No localStorage, sessionStorage, or cookies
- CSP compatible (no unsafe-inline or unsafe-eval)
- No data collection, analytics, or telemetry
- Input validation for all user-provided values
- GDPR/CCPA compliant by design
- OWASP Top 10 compliant
- Automated security audits in CI

### Technical Details
- Language: TypeScript 5.3+ with strict mode
- Build: Rollup with terser minification
- Output formats: ESM, UMD, CJS + TypeScript definitions
- Source maps included for all builds
- Tree-shakeable with sideEffects: false
- Node.js: >= 16.0.0

### Performance Metrics
- Bundle size: 3.66 KB gzipped (ESM), 3.78 KB (UMD), 3.69 KB (CJS)
- Render time: 7.3ms average per element (27% faster than 10ms target)
- Init time: 42ms (58% faster than 100ms target)
- Batch performance: 403ms for 100 elements (19% faster than 500ms target)
- 60fps maintained during resize operations (14.2ms per frame)
- All 15 success criteria met or exceeded

### CI/CD & Automation
- Automated bundle size monitoring with PR comments
- Security audits on every push/PR + weekly scans
- Integration test suite with Playwright
- Code coverage tracking
- TypeScript strict mode validation
- npm audit for dependency security

### Documentation
- Comprehensive README with full API reference
- Installation instructions (npm/pnpm/yarn)
- Quick start guide (<5 minutes, actual: 2 minutes)
- Configuration reference with recommended values
- Accessibility best practices guide
- Browser compatibility matrix
- TypeScript usage examples
- Security & privacy guarantees
- Advanced usage patterns
- CONTRIBUTING.md with developer guidelines
- SECURITY-AUDIT.md with A+ security rating details
- SUCCESS-CRITERIA-REPORT.md with all 15 criteria verification
- Working vanilla JavaScript example with interactive demo
- CHANGELOG.md following Keep a Changelog format

[Unreleased]: https://github.com/bejarcode/cornerkit/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/bejarcode/cornerkit/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/bejarcode/cornerkit/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/bejarcode/cornerkit/compare/v1.0.0...v1.0.2
[1.0.0]: https://github.com/bejarcode/cornerkit/releases/tag/v1.0.0
