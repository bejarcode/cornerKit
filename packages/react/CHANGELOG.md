# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-07-19

### Added
- **Full border API pass-through** to `@cornerkit/core` v1.2+: `style` (`'solid' | 'dashed' | 'dotted'`), `dashArray`, and `gradient` now work from the `border` prop. Previously the border object was silently downgraded to width/color only
- **`border: null`** explicitly disables a border (overrides instance-level defaults, removes an existing border on update)
- `SquircleBorderConfig` is now an alias of core's `BorderConfig`; `BorderConfig` and `GradientStop` are re-exported

### Changed
- Requires `@cornerkit/core ^1.3.1`
- Border equality checks now cover `style`, `dashArray`, and `gradient` (avoids redundant core updates on re-render)

### Notes
- Hover effects need no new props: set `--ck-border-color` / `--ck-background` in a CSS `:hover` rule (core v1.3+ renders borders through CSS custom properties)

## [1.0.0] - 2025-11-22

### Added

#### Core Features
- Initial release of @cornerkit/react
- React integration for iOS-style squircle corners
- Zero runtime dependencies beyond React and @cornerkit/core

#### Components
- `Squircle` component with full TypeScript support
  - Polymorphic `as` prop for rendering as any HTML element
  - Supports all HTML attributes for the rendered element
  - Forward ref support for imperative access
  - Default renders as `<div>`

#### Hooks
- `useSquircle` hook for imperative usage with refs
  - Returns a ref to attach to any element
  - Automatic cleanup on unmount
  - Options for radius, smoothing, and border configuration

#### Border Support
- Full border support matching @cornerkit/core
  - `border.width` - Border width in pixels
  - `border.color` - Border color (any CSS color value)
  - Borders follow squircle curve path

#### SSR Support
- Server-side rendering safe implementation
- Lazy loading of @cornerkit/core on client only
- No hydration mismatches

#### TypeScript Support
- Full TypeScript definitions included
- Polymorphic component types with proper element inference
- Strict mode compatible

### Technical Details
- Peer dependencies: React 16.8+ (hooks support required), @cornerkit/core 1.0+
- Build formats: ESM, UMD, CJS + TypeScript definitions
- Bundle size: ~2KB gzipped (excluding peer dependencies)
- 63 unit tests with 100% pass rate

### Testing
- Vitest test framework with React Testing Library
- Unit tests for Squircle component (23 tests)
- Unit tests for useSquircle hook (18 tests)
- Unit tests for utilities (22 tests)
- SSR simulation tests

[Unreleased]: https://github.com/bejarcode/cornerkit/compare/react-v1.0.0...HEAD
[1.0.0]: https://github.com/bejarcode/cornerkit/releases/tag/react-v1.0.0
