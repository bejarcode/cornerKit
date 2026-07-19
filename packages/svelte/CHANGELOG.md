# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-07-19

### Added
- **Full border API pass-through** to `@cornerkit/core` v1.2+: `style` (`'solid' | 'dashed' | 'dotted'`), `dashArray`, and `gradient` now work from the `border` prop in the component and action. Previously the border object was silently downgraded to width/color only
- **`border: null`** explicitly disables a border (overrides instance-level defaults, removes an existing border on update)
- `SquircleBorderConfig` is now an alias of core's `BorderConfig`; `BorderConfig` and `GradientStop` are re-exported

### Changed
- Requires `@cornerkit/core ^1.3.1`
- `optionsEqual` now compares `style`, `dashArray`, and `gradient` (avoids redundant core updates on reactive changes)

### Notes
- Hover effects need no new props: set `--ck-border-color` / `--ck-background` in a CSS `:hover` rule (core v1.3+ renders borders through CSS custom properties)

## [1.0.0] - 2025-11-22

### Added
- Initial release: `<Squircle>` component and `use:squircle` action
- Svelte 3/4/5 support, SvelteKit SSR compatible, full TypeScript definitions
