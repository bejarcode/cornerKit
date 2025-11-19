# Implementation Plan: cornerKit Core Library

**Branch**: `001-core-library` | **Date**: 2025-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-core-library/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build the foundational @cornerkit/core NPM package - a lightweight (<5KB gzipped), zero-dependency JavaScript library for iOS-style squircle corners. The library implements a 4-tier progressive enhancement system (Native CSS → Houdini → ClipPath → Fallback) with automatic browser capability detection, providing a simple API (`apply()`, `applyAll()`, `auto()`) for applying squircles to HTML elements. Focus on Phase 1: ClipPath renderer (Tier 3) as the primary implementation, with comprehensive input validation, accessibility preservation (focus rings), and performance optimization (lazy loading, ResizeObserver debouncing).

## Technical Context

**Language/Version**: TypeScript 5.0+ (strict mode enabled, target: ES2020 for ESM, ES2015 for UMD/CJS)
**Primary Dependencies**: ZERO runtime dependencies (core principle - constitution requirement)
**Storage**: N/A (in-memory registry only using WeakMap for element tracking)
**Testing**: Vitest (unit tests, happy-dom environment), Playwright (cross-browser visual regression)
**Target Platform**: Browser (Chrome 65+, Firefox latest 2, Safari 14+, Edge 79+, IE11 fallback)
**Project Type**: NPM library (monorepo package at `packages/core/`)
**Performance Goals**:
  - Bundle size <5KB gzipped (enforced in CI)
  - Render time <10ms per element
  - Initial load <100ms
  - 60fps maintained during ResizeObserver updates (RAF debouncing)
**Constraints**:
  - Zero runtime dependencies (violates bundle if any added)
  - No eval(), innerHTML, or unsafe code (CSP compatible)
  - No network requests (100% offline)
  - Preserve focus indicators (accessibility requirement)
  - TypeScript strict mode (no `any` types allowed)
**Scale/Scope**:
  - Support 100+ elements per page with lazy loading
  - 60 functional requirements (8 API methods, 4 renderers, security, accessibility, privacy)
  - 4 user stories (P1: simple apply, P2: batch/auto, P3: dynamic/resize, P4: cleanup/inspect)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Zero Dependencies ✅ PASS
- **Requirement**: Core library MUST have zero runtime dependencies
- **Status**: COMPLIANT
- **Evidence**:
  - package.json `dependencies: {}` (enforced in constitution)
  - All functionality implemented in-house (superellipse math, path generation, tier detection)
  - Dev dependencies only for build/test tooling (TypeScript, Rollup, Vitest, Playwright)

### Principle II: Performance First ✅ PASS
- **Requirement**: <5KB gzipped, <10ms render, <100ms init
- **Status**: COMPLIANT
- **Evidence**:
  - Bundle budget enforced via bundlephobia CI checks (FR-049, SC-002)
  - Performance API benchmarks for render time (FR-050, SC-003)
  - Lazy loading with IntersectionObserver (FR-024-025)
  - ResizeObserver debouncing with RAF (FR-020, FR-052)
  - Bezier-based path generation (smaller than point-based, FR-016)

### Principle III: Progressive Enhancement (4-Tier System) ✅ PASS
- **Requirement**: Support Native CSS, Houdini, ClipPath, Fallback
- **Status**: COMPLIANT
- **Evidence**:
  - Tier detection via CSS.supports() and feature detection (FR-009-013)
  - Phase 1 focuses on ClipPath renderer (Tier 3) as primary implementation
  - Houdini (Tier 2) and Native CSS (Tier 1) deferred to Phase 2 (out of scope per spec)
  - Fallback (Tier 4) uses border-radius (FR-012, FR-054)

### Principle IV: Framework Agnostic ✅ PASS
- **Requirement**: Core library pure JavaScript, wrappers separate
- **Status**: COMPLIANT
- **Evidence**:
  - Core library is vanilla TypeScript/JavaScript (no React/Vue/etc.)
  - Framework wrappers (React, Vue, Web Component) deferred to Phase 3 (out of scope)
  - Tree-shakeable exports (FR-059)

### Principle V: Type Safety ✅ PASS
- **Requirement**: TypeScript strict mode, >85% coverage (>90% for core)
- **Status**: COMPLIANT
- **Evidence**:
  - TypeScript 5.0+ with strict mode enabled (FR-057, SC-005)
  - Zero `any` types allowed (constitution requirement)
  - >90% coverage for core rendering logic (FR-014-022, SC-006)
  - >85% coverage for integration code (FR-023-026, SC-007)
  - .d.ts type definitions generated (FR-058)

### Principle VI: Developer Experience ✅ PASS
- **Requirement**: Works in <5 minutes, excellent documentation
- **Status**: COMPLIANT
- **Evidence**:
  - Simple API: apply(), applyAll(), auto() (FR-002-004)
  - Sensible defaults: radius=20, smoothing=0.8 (FR-028)
  - Data attribute support for declarative HTML (FR-031-034)
  - Quick start target: <5 minutes to first squircle (SC-001)

### Principle VII: Browser Compatibility ✅ PASS
- **Requirement**: 95%+ browser support with graceful degradation
- **Status**: COMPLIANT
- **Evidence**:
  - Chrome 65+, Firefox latest 2, Safari 14+, Edge 79+ (FR-053)
  - IE11 fallback to border-radius (FR-054)
  - Feature detection, no user-agent sniffing (FR-056)
  - Playwright tests across all target browsers (SC-008)

### Principle VIII: Accessibility ✅ PASS
- **Requirement**: Preserve focus rings, respect prefers-reduced-motion
- **Status**: COMPLIANT
- **Evidence**:
  - Focus indicators preserved (FR-040-041, SC-012)
  - prefers-reduced-motion support (FR-042)
  - No interference with ARIA/screen readers (FR-043-044)
  - Lighthouse accessibility >95 (SC-010)

### Principle IX: Security ✅ PASS
- **Requirement**: No eval/innerHTML, input validation, CSP compatible
- **Status**: COMPLIANT
- **Evidence**:
  - No eval(), Function(), innerHTML usage (FR-037)
  - Input validation: radius >= 0, smoothing [0,1] (FR-035-036)
  - CSP compatible (no unsafe-inline, no unsafe-eval, FR-048)
  - npm audit in CI (SC-013 implies no vulnerabilities)

### Principle X: Privacy ✅ PASS
- **Requirement**: No data collection, no network requests
- **Status**: COMPLIANT
- **Evidence**:
  - No network requests (FR-045, SC-013)
  - No localStorage/sessionStorage/cookies (FR-046)
  - No analytics/telemetry (FR-047)
  - GDPR/CCPA compliant (100% offline operation)

### Summary
**ALL GATES PASSED** - No constitution violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-core-library/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── api.md          # CornerKit class API contract
│   └── types.ts        # TypeScript type definitions contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Monorepo package structure (pnpm workspaces)
packages/core/
├── src/
│   ├── core/
│   │   ├── detector.ts          # Browser capability detection (Tier 1-4)
│   │   ├── registry.ts          # WeakMap element registry + observers
│   │   └── config.ts            # Default configuration (radius: 20, smoothing: 0.8)
│   │
│   ├── renderers/
│   │   ├── clippath.ts          # Tier 3: SVG clip-path (PRIMARY IMPLEMENTATION)
│   │   └── fallback.ts          # Tier 4: border-radius fallback
│   │   # NOTE: native.ts (Tier 1) and houdini.ts (Tier 2) deferred to Phase 2
│   │
│   ├── math/
│   │   ├── superellipse.ts      # Superellipse formula (smoothing → exponent)
│   │   └── path-generator.ts   # SVG path generation (bezier-based)
│   │
│   ├── utils/
│   │   ├── validator.ts         # Input validation (radius, smoothing, elements)
│   │   └── logger.ts            # Development mode warnings
│   │
│   └── index.ts                 # Main entry point (CornerKit class export)
│
├── tests/
│   ├── unit/
│   │   ├── detector.test.ts
│   │   ├── superellipse.test.ts
│   │   ├── path-generator.test.ts
│   │   ├── clippath.test.ts
│   │   ├── registry.test.ts
│   │   └── api.test.ts
│   │
│   └── integration/
│       ├── apply.test.ts
│       ├── batch.test.ts
│       ├── resize.test.ts
│       └── cleanup.test.ts
│
├── dist/                        # Build output (gitignored)
│   ├── cornerkit.esm.js        # ES modules
│   ├── cornerkit.js            # UMD
│   ├── cornerkit.cjs           # CommonJS
│   └── index.d.ts              # Type definitions
│
├── package.json                # Zero dependencies, ESM/UMD/CJS exports
├── tsconfig.json               # Strict mode enabled
├── rollup.config.js            # 3 output formats + types
├── vitest.config.ts            # Test configuration
└── README.md                   # Quick start guide
```

**Structure Decision**: Using **monorepo package structure** (Option 1 variant) as defined in workspace-config.md. The core library lives in `packages/core/` as part of the cornerKit monorepo managed by pnpm workspaces. This structure supports future packages (React, Vue, Web Component, Shopify) while maintaining the core library as the foundational dependency-free package.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - All constitution checks passed. No violations to justify.

## Phase 0: Research

See [research.md](./research.md) for detailed findings.

### Research Summary

**Key Decisions Made:**

1. **Bezier vs Point-Based Path Generation** → Bezier-based
   - Rationale: Smaller SVG path strings (fewer bytes)
   - Evidence: Bezier curves approximate squircles with ~8 control points vs 40+ discrete points
   - Impact: Reduces bundle size (contributes to <5KB goal)

2. **WeakMap vs Map for Element Registry** → WeakMap
   - Rationale: Automatic garbage collection when elements removed from DOM
   - Evidence: Prevents memory leaks in SPAs (FR-026, User Story 4 acceptance scenario 5)
   - Impact: Better memory management, no manual cleanup needed

3. **ResizeObserver Debouncing Strategy** → requestAnimationFrame
   - Rationale: Ensures updates run at most once per frame (60fps)
   - Evidence: Standard browser optimization pattern (FR-020, FR-052)
   - Impact: Smooth visual updates without performance degradation

4. **Lazy Loading Strategy** → IntersectionObserver
   - Rationale: Only process visible elements initially
   - Evidence: Browser API designed for viewport detection (FR-024-025)
   - Impact: Fast initial page load even with 100+ squircle elements

5. **Development Mode Detection** → process.env.NODE_ENV check
   - Rationale: Enable warnings in dev, disable in production
   - Evidence: Standard bundler convention (Rollup, Webpack, Vite all support)
   - Impact: Helpful DX without production bundle bloat

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

**Entity Summary:**

1. **SquircleConfig** - User-provided configuration object
   - Fields: radius (number), smoothing (number), tier (optional string)
   - Validation: radius >= 0, smoothing [0, 1]

2. **RendererTier** - Enumeration of rendering methods
   - Values: 'native', 'houdini', 'clippath', 'fallback'

3. **ManagedElement** - Internal registry entry
   - Fields: element (WeakRef), config (SquircleConfig), observers (ResizeObserver, IntersectionObserver)

4. **SuperellipsePoint** - Coordinate pair for curve generation
   - Fields: x (number), y (number)

### API Contracts

See [contracts/](./contracts/) for complete API specifications.

**API Summary:**

- **CornerKit Class Constructor** - Initialize with optional global config
- **apply(element, config?)** - Apply squircle to single element
- **applyAll(selector, config?)** - Apply to all matching elements
- **auto()** - Discover and apply via data-squircle attributes
- **update(element, config)** - Update existing squircle configuration
- **remove(element)** - Remove squircle and cleanup observers
- **inspect(element)** - Get current configuration for element
- **destroy()** - Remove all squircles and disconnect all observers

### Quick Start

See [quickstart.md](./quickstart.md) for developer onboarding guide.

**Quick Start Summary:**
1. Install: `npm install @cornerkit/core`
2. Import: `import CornerKit from '@cornerkit/core'`
3. Apply: `const ck = new CornerKit(); ck.apply('.button')`
4. Result: iOS-style squircle corners in <5 minutes

## Implementation Phases

### Phase 1A: Foundation (Features 001-004)

**Goal**: Establish core infrastructure for tier detection, math, and path generation

**Components:**
1. **Browser Capability Detector** (detector.ts)
   - Detect Native CSS, Houdini, ClipPath, Fallback support
   - Singleton pattern with cached results
   - Feature detection via CSS.supports()

2. **Superellipse Math Engine** (superellipse.ts)
   - Convert smoothing (0-1) to exponent (2-4): `n = 2 + (4-2) * (1-smoothing)`
   - Generate points on superellipse curve for each corner
   - Handle rotation angles: 0°, 90°, 180°, 270°

3. **SVG Path Generator** (path-generator.ts)
   - Generate bezier-based SVG path strings
   - Optimize for minimal output size
   - Clamp radius to min(width/2, height/2)

4. **Input Validator** (utils/validator.ts)
   - Validate radius >= 0, smoothing [0, 1]
   - Validate HTMLElement instances
   - Validate CSS selectors

**Success Criteria:**
- detector.test.ts passes (tier detection works)
- superellipse.test.ts passes (math accurate)
- path-generator.test.ts passes (valid SVG paths)

### Phase 1B: Rendering (Features 005-006)

**Goal**: Implement ClipPath renderer and element registry with observers

**Components:**
1. **ClipPath Renderer** (renderers/clippath.ts)
   - Apply clip-path: path() styling via inline styles
   - ResizeObserver integration with RAF debouncing
   - Error handling for detached elements (try-catch)
   - Update threshold: 1px dimension change

2. **Fallback Renderer** (renderers/fallback.ts)
   - Apply border-radius for IE11 and old browsers
   - No observers needed (static)

3. **Element Registry** (registry.ts)
   - WeakMap-based element tracking
   - IntersectionObserver for lazy loading
   - Prevent duplicate entries (update config instead)

**Success Criteria:**
- clippath.test.ts passes (clip-path applied correctly)
- registry.test.ts passes (elements tracked, observers work)
- resize.test.ts passes (ResizeObserver updates clip-path)

### Phase 1C: API & Integration (Features 007-010)

**Goal**: Implement public API and data attribute support

**Components:**
1. **Main API** (index.ts - CornerKit class)
   - Constructor with global config
   - apply(), applyAll(), auto(), update(), remove(), inspect(), destroy()
   - Delegate to appropriate renderer based on detected tier

2. **Data Attribute Support** (utils/data-attributes.ts)
   - Parse data-squircle, data-squircle-radius, data-squircle-smoothing
   - Invalid value handling (warnings in dev mode)

3. **Build System** (rollup.config.js)
   - Output: ESM, UMD, CJS formats
   - Type definitions bundled (rollup-plugin-dts)
   - Source maps included
   - Tree-shakeable exports

4. **Unit Tests** (tests/unit/)
   - >90% coverage for core rendering logic
   - >85% coverage for integration code
   - Mock browser APIs (CSS.supports, ResizeObserver, IntersectionObserver)

**Success Criteria:**
- api.test.ts passes (all 8 methods work)
- batch.test.ts passes (applyAll, auto work)
- cleanup.test.ts passes (remove, destroy work)
- Bundle size <5KB gzipped (verified via bundlephobia)
- Type-check passes with strict mode
- Coverage thresholds met

## Testing Strategy

### Unit Tests (Vitest)

**Test Environment**: happy-dom (lightweight DOM implementation)

**Coverage Requirements:**
- Core rendering logic (detector, superellipse, path-generator, clippath): >90%
- Integration code (registry, API methods, data attributes): >85%
- Exclude: examples/, dist/

**Mocking Strategy:**
- Mock CSS.supports() for tier detection tests
- Mock ResizeObserver for resize tests
- Mock IntersectionObserver for lazy loading tests
- Use fake timers for RAF debouncing tests

**Key Test Files:**
- detector.test.ts - Tier detection logic
- superellipse.test.ts - Math accuracy (compare against known values)
- path-generator.test.ts - SVG path validity (parse with DOMParser)
- clippath.test.ts - clip-path application (check inline styles)
- registry.test.ts - Element tracking (WeakMap, observers)
- api.test.ts - All public methods (apply, update, remove, etc.)
- batch.test.ts - applyAll(), auto() with multiple elements
- resize.test.ts - ResizeObserver updates (trigger resize, verify path change)
- cleanup.test.ts - remove(), destroy() (verify observers disconnected)

### Integration Tests (Playwright)

**Browser Matrix:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest, via WebKit)
- Edge (latest)

**Visual Regression Tests:**
- Compare screenshots of squircle elements vs reference images
- Test across different radius/smoothing values
- Test responsive behavior (resize viewport)
- Test accessibility (focus indicators visible)

**Performance Tests:**
- Measure render time (should be <10ms per element)
- Measure init time (should be <100ms)
- Measure batch application (100 elements in <500ms)

## Performance Optimization

### Bundle Size Strategy

**Target**: <5KB gzipped

**Techniques:**
1. Tree-shakeable exports (ES modules)
2. Bezier-based paths (smaller than point-based)
3. Aggressive minification (terser)
4. No comments in production build
5. Rollup code splitting (if needed)

**Monitoring:**
- bundlephobia CI checks on every PR
- Track size over time with size-limit

### Runtime Performance Strategy

**Lazy Loading:**
- IntersectionObserver for off-screen elements
- Only process visible elements initially
- Process off-screen elements when they enter viewport

**Debouncing:**
- ResizeObserver callbacks use RAF
- Prevents excessive recalculations (max 60fps)
- Batch multiple resize events into single update

**Memory Management:**
- WeakMap for element registry (auto garbage collection)
- Disconnect observers on remove()
- Clear registry on destroy()

## Risk Mitigation

**Risk 1: Bundle Size Exceeds 5KB**
- Mitigation: Continuous monitoring with bundlephobia, aggressive minification, bezier paths
- Contingency: Remove optional features (data attribute parsing), defer to Phase 2

**Risk 2: Focus Ring Clipping**
- Mitigation: Use outline instead of border for focus indicators, test with keyboard navigation
- Contingency: Document outline-offset recommendation, add to README

**Risk 3: ResizeObserver Exceptions**
- Mitigation: Try-catch blocks around callbacks, remove detached elements from registry
- Contingency: Graceful degradation (no auto-resize, manual update() required)

**Risk 4: Browser Compatibility Issues**
- Mitigation: Playwright test matrix, feature detection, graceful fallback
- Contingency: Expand fallback tier to cover more edge cases

## Next Steps

After completing this plan:
1. Run `/speckit.tasks` to generate task breakdown
2. Implement tasks in order (Phase 1A → 1B → 1C)
3. Ensure all tests pass and coverage thresholds met
4. Verify bundle size <5KB before merging to main
5. Create changesets for version 1.0.0 release
