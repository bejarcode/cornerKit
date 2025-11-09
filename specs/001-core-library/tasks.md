# Tasks: cornerKit Core Library

**Feature**: 001-core-library
**Date**: 2025-01-08
**Status**: Ready for Implementation

## Overview

This document breaks down the implementation of the cornerKit Core Library into actionable tasks organized by user story priority. Tasks are structured to support parallel execution where possible and clearly identify dependencies.

**Total Estimated Tasks**: ~290 tasks across 7 phases

---

## Task Format

```
- [ ] T### [P#] [Story#] Task description with file path reference
```

- **T###**: Task number (sequential)
- **[P#]**: Priority (P0=Setup, P1-P4=User Stories, PF=Final)
- **[Story#]**: User Story number (US1-US4, or N/A)
- **File paths**: Included in description for clarity

---

## Phase 1: Setup (P0 - Project Initialization)

**Goal**: Establish monorepo structure, build system, and development tooling

**Parallelizable**: Tasks T001-T010 can run in parallel after directory creation

### Project Structure Setup

- [x] T001 [P0] [N/A] Create `packages/core/` directory structure (src/, tests/, dist/)
- [x] T002 [P0] [N/A] Create subdirectories: `src/core/`, `src/renderers/`, `src/math/`, `src/utils/`
- [x] T003 [P0] [N/A] Create test directories: `tests/unit/`, `tests/integration/`
- [x] T004 [P0] [N/A] Initialize `packages/core/package.json` with zero dependencies, ESM/UMD/CJS exports
- [x] T005 [P0] [N/A] Configure TypeScript: Create `packages/core/tsconfig.json` with strict mode (noUnusedLocals, noUnusedParameters, noImplicitReturns)
- [x] T006 [P0] [N/A] Configure Rollup: Create `packages/core/rollup.config.js` with 3 output formats (ESM, UMD, CJS) + type definitions
- [x] T007 [P0] [N/A] Configure Vitest: Create `packages/core/vitest.config.ts` with happy-dom environment, coverage thresholds (>90% core, >85% integration)
- [x] T008 [P0] [N/A] Configure ESLint: Create `.eslintrc.js` with TypeScript rules, zero `any` types enforcement
- [x] T009 [P0] [N/A] Configure Prettier: Create `.prettierrc` with consistent code formatting
- [x] T010 [P0] [N/A] Create `packages/core/README.md` placeholder (will be completed in Phase 7)

**Success Gate**: `npm install` runs without errors, TypeScript compiles with no warnings

---

## Phase 2: Foundational (P1 - Blocking Prerequisites)

**Goal**: Implement core infrastructure components required by all user stories

**Note**: These tasks implement Phase 1A (Foundation) from plan.md

### Browser Capability Detection (FR-009 to FR-013)

**Parallelizable**: T011-T015 implementation can happen in parallel with tests T016-T020

- [x] T011 [P1] [N/A] Create `src/core/detector.ts` with `CapabilityDetector` singleton class
- [x] T012 [P1] [N/A] Implement Native CSS detection: `CSS.supports('corner-shape', 'squircle')` (FR-009)
- [x] T013 [P1] [N/A] Implement Houdini detection: `'paintWorklet' in CSS` (FR-010)
- [x] T014 [P1] [N/A] Implement ClipPath detection: `CSS.supports('clip-path', 'path("")')` (FR-011)
- [x] T015 [P1] [N/A] Implement fallback logic: Always return true for `border-radius` tier (FR-012)
- [x] T016 [P1] [N/A] Implement caching: Run detection once, store results in singleton (FR-013)
- [x] T017 [P1] [N/A] Export `supports()` static method returning `BrowserSupport` object
- [x] T018 [P1] [N/A] Create `tests/unit/detector.test.ts` with mocked `CSS.supports()`
- [x] T019 [P1] [N/A] Test all 4 tier detection scenarios (native, houdini, clippath, fallback)
- [x] T020 [P1] [N/A] Test caching: Verify `supports()` only runs feature detection once

**Success Gate**: detector.test.ts passes with >90% coverage

### Superellipse Math Engine (FR-014 to FR-015)

**Parallelizable**: T021-T025 implementation can happen in parallel with tests T026-T030

- [x] T021 [P1] [N/A] Create `src/math/superellipse.ts` with `smoothingToExponent()` function
- [x] T022 [P1] [N/A] Implement formula: `n = 2 + (4 - 2) × (1 - smoothing)` (FR-014)
- [x] T023 [P1] [N/A] Implement `generateCornerPoints()` function with superellipse formula
- [x] T024 [P1] [N/A] Implement rotation angles: 0°, 90°, 180°, 270° for all 4 corners (FR-015)
- [x] T025 [P1] [N/A] Export `SuperellipsePoint` interface: `{ x: number, y: number }`
- [x] T026 [P1] [N/A] Create `tests/unit/superellipse.test.ts`
- [x] T027 [P1] [N/A] Test smoothing-to-exponent conversion (0.0→4.0, 0.5→3.0, 0.8→2.4, 1.0→2.0)
- [x] T028 [P1] [N/A] Test point generation accuracy: Compare against known iOS squircle values
- [x] T029 [P1] [N/A] Test corner rotation: Verify points for all 4 corners have correct angles
- [x] T030 [P1] [N/A] Test edge cases: smoothing=0, smoothing=1, smoothing=0.5

**Success Gate**: superellipse.test.ts passes with >90% coverage, math accuracy verified

### SVG Path Generator (FR-016 to FR-017)

**Parallelizable**: T031-T035 implementation can happen in parallel with tests T036-T040

- [x] T031 [P1] [N/A] Create `src/math/path-generator.ts` with `generateSquirclePath()` function
- [x] T032 [P1] [N/A] Implement bezier-based path generation using cubic bezier curves (FR-016)
- [x] T033 [P1] [N/A] Optimize path string: Minimize coordinate decimal places, remove redundant spaces
- [x] T034 [P1] [N/A] Implement radius clamping: `radius = Math.min(radius, width/2, height/2)` (FR-017)
- [x] T035 [P1] [N/A] Return SVG path string: `path("M x1,y1 C ... Z")`
- [x] T036 [P1] [N/A] Create `tests/unit/path-generator.test.ts`
- [x] T037 [P1] [N/A] Test path validity: Parse generated path with `DOMParser` to verify SVG correctness
- [x] T038 [P1] [N/A] Test radius clamping: Verify 100px radius on 50px element clamps to 25px
- [x] T039 [P1] [N/A] Test path optimization: Verify output is smaller than point-based alternative
- [x] T040 [P1] [N/A] Test edge cases: 0×0 element, very large radius, very small radius

**Success Gate**: path-generator.test.ts passes with >90% coverage, SVG paths valid ✅ PASSED (22/22 tests)

### Input Validator (FR-035 to FR-038)

**Parallelizable**: T041-T045 implementation can happen in parallel with tests T046-T050

- [x] T041 [P1] [N/A] Create `src/utils/validator.ts` with validation functions
- [x] T042 [P1] [N/A] Implement `validateRadius()`: Check >= 0, default to 20 if invalid (FR-035)
- [x] T043 [P1] [N/A] Implement `validateSmoothing()`: Clamp to [0, 1], warn if out of bounds (FR-036)
- [x] T044 [P1] [N/A] Implement `validateElement()`: Check `instanceof HTMLElement` (FR-038)
- [x] T045 [P1] [N/A] Implement `validateSelector()`: Try `document.querySelector()`, catch syntax errors (FR-039)
- [x] T046 [P1] [N/A] Create `tests/unit/validator.test.ts`
- [x] T047 [P1] [N/A] Test radius validation: Negative, zero, positive, non-number values
- [x] T048 [P1] [N/A] Test smoothing validation: -0.5, 0, 0.5, 1, 1.5 (clamping)
- [x] T049 [P1] [N/A] Test element validation: null, undefined, string, HTMLElement
- [x] T050 [P1] [N/A] Test selector validation: Invalid CSS syntax, valid selectors

**Success Gate**: validator.test.ts passes with >85% coverage ✅ PASSED (56/56 tests)

### Development Logger (FR-034, development warnings)

**Parallelizable**: T051-T055 implementation can happen in parallel with tests T056-T060

- [x] T051 [P1] [N/A] Create `src/utils/logger.ts` with `warn()` and `error()` functions
- [x] T052 [P1] [N/A] Implement `process.env.NODE_ENV === 'development'` checks for warnings
- [x] T053 [P1] [N/A] Add warnings for: Invalid radius, invalid smoothing, invalid data attributes (FR-034)
- [x] T054 [P1] [N/A] Add warnings for: 0×0 elements, detached elements, duplicate apply() calls
- [x] T055 [P1] [N/A] Ensure warnings are stripped in production build (verify with Rollup config)
- [x] T056 [P1] [N/A] Create `tests/unit/logger.test.ts`
- [x] T057 [P1] [N/A] Test development mode: Verify `console.warn()` is called
- [x] T058 [P1] [N/A] Test production mode: Mock `process.env.NODE_ENV = 'production'`, verify no warnings
- [x] T059 [P1] [N/A] Test warning messages: Verify helpful, actionable messages
- [x] T060 [P1] [N/A] Test warning suppression: Verify no repeated warnings for same issue

**Success Gate**: logger.test.ts passes, production build has zero warning strings ✅ PASSED (32/32 tests)

---

## Phase 3: User Story 1 (P1 - Simple Static Squircle Application)

**Goal**: Enable developers to apply squircles to single elements with default settings

**User Story Reference**: [spec.md lines 22-42]

**Functional Requirements**: FR-001, FR-002, FR-018 to FR-022, FR-027 to FR-030

### ClipPath Renderer (FR-018 to FR-022)

**Parallelizable**: T061-T070 implementation can happen in parallel with tests T071-T080

- [X] T061 [P1] [US1] Create `src/renderers/clippath.ts` with `ClipPathRenderer` class
- [X] T062 [P1] [US1] Implement `apply(element, config)`: Generate path, set `element.style.clipPath` (FR-018)
- [X] T063 [P1] [US1] Implement `update(element, config)`: Regenerate path, update inline style
- [X] T064 [P1] [US1] Implement `remove(element)`: Reset `element.style.clipPath = ''`
- [X] T065 [P1] [US1] Implement ResizeObserver: Detect element dimension changes (FR-019)
- [X] T066 [P1] [US1] Implement RAF debouncing: Wrap ResizeObserver callback in `requestAnimationFrame()` (FR-020)
- [X] T067 [P1] [US1] Implement 1px update threshold: Only update if dimensions change by ≥1px (FR-022)
- [X] T068 [P1] [US1] Implement error handling: Try-catch for detached elements, remove from registry (FR-021)
- [X] T069 [P1] [US1] Store `lastDimensions` in registry to detect threshold changes
- [X] T070 [P1] [US1] Export renderer for use by main API

- [X] T071 [P1] [US1] Create `tests/unit/clippath.test.ts`
- [X] T072 [P1] [US1] Test apply(): Verify `element.style.clipPath` is set with valid path
- [X] T073 [P1] [US1] Test update(): Verify path regenerates with new config
- [X] T074 [P1] [US1] Test remove(): Verify `clipPath` is reset to empty string
- [X] T075 [P1] [US1] Mock ResizeObserver: Verify observer is created and observes element
- [X] T076 [P1] [US1] Test RAF debouncing: Use fake timers, verify max 60fps updates
- [X] T077 [P1] [US1] Test 1px threshold: Resize by 0.5px, verify no update; resize by 1px, verify update
- [X] T078 [P1] [US1] Test detached element: Trigger ResizeObserver on detached element, verify error caught
- [X] T079 [P1] [US1] Test edge cases: 0×0 element, very large element, negative margin elements
- [X] T080 [P1] [US1] Verify coverage >90% for clippath.ts

**Success Gate**: clippath.test.ts passes, ResizeObserver integration works

### Fallback Renderer (FR-012, graceful degradation)

**Parallelizable**: T081-T085 implementation can happen in parallel with tests T086-T090

- [X] T081 [P1] [US1] Create `src/renderers/fallback.ts` with `FallbackRenderer` class
- [X] T082 [P1] [US1] Implement `apply(element, config)`: Set `element.style.borderRadius = config.radius + 'px'`
- [X] T083 [P1] [US1] Implement `update(element, config)`: Update `borderRadius` value
- [X] T084 [P1] [US1] Implement `remove(element)`: Reset `element.style.borderRadius = ''`
- [X] T085 [P1] [US1] No observers needed: Fallback is static, no ResizeObserver

- [X] T086 [P1] [US1] Create `tests/unit/fallback.test.ts`
- [X] T087 [P1] [US1] Test apply(): Verify `borderRadius` is set to `radius + 'px'`
- [X] T088 [P1] [US1] Test update(): Verify `borderRadius` updates with new radius
- [X] T089 [P1] [US1] Test remove(): Verify `borderRadius` is reset
- [X] T090 [P1] [US1] Test edge cases: Zero radius, very large radius

**Success Gate**: fallback.test.ts passes

### Element Registry Basics (FR-023, FR-026, WeakMap setup)

**Parallelizable**: T091-T100 implementation can happen in parallel with tests T101-T110

- [X] T091 [P1] [US1] Create `src/core/registry.ts` with `ElementRegistry` class
- [X] T092 [P1] [US1] Initialize WeakMap: `private elements = new WeakMap<HTMLElement, ManagedElement>()` (FR-023)
- [X] T093 [P1] [US1] Implement `register(element, config, tier, observers)`: Add to WeakMap
- [X] T094 [P1] [US1] Implement `get(element)`: Return `ManagedElement | undefined`
- [X] T095 [P1] [US1] Implement `has(element)`: Return boolean
- [X] T096 [P1] [US1] Implement `delete(element)`: Remove from WeakMap, disconnect observers
- [X] T097 [P1] [US1] Implement duplicate prevention: Check `has(element)` before registering (FR-026)
- [X] T098 [P1] [US1] Implement `update(element, config)`: Merge new config, update registry entry
- [X] T099 [P1] [US1] Export `ManagedElement` interface: `{ element, config, tier, resizeObserver?, intersectionObserver?, lastDimensions? }`
- [X] T100 [P1] [US1] Export registry for use by main API

- [X] T101 [P1] [US1] Create `tests/unit/registry.test.ts`
- [X] T102 [P1] [US1] Test register(): Verify element added to WeakMap
- [X] T103 [P1] [US1] Test get(): Verify returns correct `ManagedElement`
- [X] T104 [P1] [US1] Test has(): Verify returns true for registered, false for unregistered
- [X] T105 [P1] [US1] Test delete(): Verify element removed, observers disconnected
- [X] T106 [P1] [US1] Test duplicate prevention: Register twice, verify config updated not duplicated
- [X] T107 [P1] [US1] Test WeakMap garbage collection: Remove element from DOM, verify memory cleanup (manual DevTools check)
- [X] T108 [P1] [US1] Test observer disconnection: Verify `resizeObserver.disconnect()` called on delete
- [X] T109 [P1] [US1] Test edge cases: Null element, undefined config
- [X] T110 [P1] [US1] Verify coverage >85% for registry.ts

**Success Gate**: registry.test.ts passes, WeakMap works correctly

### Main API - Constructor and apply() (FR-001, FR-002, FR-029, FR-030)

**Parallelizable**: T111-T125 implementation can happen in parallel with tests T126-T140

- [X] T111 [P1] [US1] Create `src/index.ts` with `CornerKit` class
- [X] T112 [P1] [US1] Implement constructor: `constructor(config?: Partial<SquircleConfig>)` (FR-001)
- [X] T113 [P1] [US1] Store global config: `private globalConfig: SquircleConfig` with defaults `{ radius: 20, smoothing: 0.8 }` (FR-028, FR-029)
- [X] T114 [P1] [US1] Initialize detector: `private detector = CapabilityDetector.getInstance()`
- [X] T115 [P1] [US1] Initialize registry: `private registry = new ElementRegistry()`
- [X] T116 [P1] [US1] Implement `apply(element: HTMLElement | string, config?: Partial<SquircleConfig>): void` (FR-002)
- [X] T117 [P1] [US1] Validate element: If string, call `document.querySelector()`, throw if 0 or >1 matches
- [X] T118 [P1] [US1] Merge config: `const mergedConfig = { ...this.globalConfig, ...config }` (FR-030)
- [X] T119 [P1] [US1] Validate config: Call `validateRadius()`, `validateSmoothing()`
- [X] T120 [P1] [US1] Detect tier: `const tier = this.detector.detectTier()`
- [X] T121 [P1] [US1] Select renderer: ClipPath if supported, else Fallback
- [X] T122 [P1] [US1] Apply squircle: `renderer.apply(element, mergedConfig)`
- [X] T123 [P1] [US1] Register element: `this.registry.register(element, mergedConfig, tier, observers)`
- [X] T124 [P1] [US1] Handle duplicate apply: If `registry.has(element)`, update config instead
- [X] T125 [P1] [US1] Export `CornerKit` as default export

- [X] T126 [P1] [US1] Create `tests/unit/api.test.ts`
- [X] T127 [P1] [US1] Test constructor: Verify default config `{ radius: 20, smoothing: 0.8 }`
- [X] T128 [P1] [US1] Test constructor with custom config: Verify global config overrides defaults
- [X] T129 [P1] [US1] Test apply() with HTMLElement: Verify squircle applied, element registered
- [X] T130 [P1] [US1] Test apply() with CSS selector: Verify selector resolution, single match only
- [X] T131 [P1] [US1] Test apply() with per-element config: Verify config overrides global defaults
- [X] T132 [P1] [US1] Test apply() throws on invalid selector: 0 matches, >1 matches
- [X] T133 [P1] [US1] Test apply() throws on invalid element type: null, number, string (non-selector)
- [X] T134 [P1] [US1] Test duplicate apply(): Call twice, verify config updated not duplicated
- [X] T135 [P1] [US1] Test tier selection: Mock detector, verify ClipPath used if supported
- [X] T136 [P1] [US1] Test fallback tier: Mock detector to return only fallback, verify `borderRadius` applied
- [X] T137 [P1] [US1] Test config validation: Invalid radius, invalid smoothing, verify defaults used
- [X] T138 [P1] [US1] Test edge cases: 0×0 element, hidden element, detached element
- [X] T139 [P1] [US1] Integration test: Create element, apply squircle, verify visual output (happy-dom)
- [X] T140 [P1] [US1] Verify coverage >85% for index.ts (apply method)

**Success Gate**: api.test.ts passes (apply method), User Story 1 acceptance scenarios 1-2 work

---

## Phase 4: User Story 2 (P2 - Batch Application and Auto-Discovery)

**Goal**: Enable batch application and HTML data attribute auto-discovery

**User Story Reference**: [spec.md lines 44-67]

**Functional Requirements**: FR-003, FR-004, FR-024, FR-025, FR-031 to FR-034

### applyAll() Method (FR-003)

**Parallelizable**: T141-T145 implementation can happen in parallel with tests T146-T150

- [X] T141 [P2] [US2] Implement `applyAll(selector: string, config?: Partial<SquircleConfig>): void` in `src/index.ts` (FR-003)
- [X] T142 [P2] [US2] Validate selector: Call `validateSelector()`, throw if invalid syntax
- [X] T143 [P2] [US2] Query elements: `const elements = document.querySelectorAll(selector)`
- [X] T144 [P2] [US2] Iterate and apply: `elements.forEach(el => this.apply(el, config))`
- [X] T145 [P2] [US2] Handle 0 matches: No-op (no error), log warning in dev mode

- [X] T146 [P2] [US2] Add tests to `tests/unit/api.test.ts` (applyAll section)
- [X] T147 [P2] [US2] Test applyAll() with valid selector: Verify all matching elements get squircles
- [X] T148 [P2] [US2] Test applyAll() with shared config: Verify all elements use same config
- [X] T149 [P2] [US2] Test applyAll() with 0 matches: Verify no error, no-op behavior
- [X] T150 [P2] [US2] Test applyAll() throws on invalid selector: Syntax error in CSS

**Success Gate**: applyAll() tests pass, User Story 2 acceptance scenario 1 works

### Data Attribute Parser (FR-031 to FR-034)

**Parallelizable**: T151-T160 implementation can happen in parallel with tests T161-T170

- [X] T151 [P2] [US2] Create `src/utils/data-attributes.ts` with `parseDataAttributes()` function
- [X] T152 [P2] [US2] Implement `hasSquircleAttribute()`: Check for `data-squircle` attribute (FR-031)
- [X] T153 [P2] [US2] Implement `parseRadius()`: Parse `data-squircle-radius` as number (FR-032)
- [X] T154 [P2] [US2] Implement `parseSmoothing()`: Parse `data-squircle-smoothing` as number (FR-033)
- [X] T155 [P2] [US2] Handle invalid values: `parseFloat()` returns NaN, use defaults, warn in dev mode (FR-034)
- [X] T156 [P2] [US2] Return `Partial<SquircleConfig>` with parsed values
- [X] T157 [P2] [US2] Export `parseDataAttributes(element: HTMLElement): Partial<SquircleConfig>`

- [X] T158 [P2] [US2] Create `tests/unit/data-attributes.test.ts`
- [X] T159 [P2] [US2] Test parseRadius(): Valid number, invalid string, missing attribute
- [X] T160 [P2] [US2] Test parseSmoothing(): Valid number (0-1), out of range, invalid string
- [X] T161 [P2] [US2] Test invalid values: Verify defaults used, warnings logged in dev mode
- [X] T162 [P2] [US2] Test edge cases: Empty string, "NaN", "undefined" attribute values
- [X] T163 [P2] [US2] Integration test: Create element with data attributes, verify parsed config
- [X] T164 [P2] [US2] Verify coverage >85% for data-attributes.ts

**Success Gate**: data-attributes.test.ts passes

### auto() Method with IntersectionObserver (FR-004, FR-024, FR-025)

**Parallelizable**: T165-T180 implementation can happen in parallel with tests T181-T195

- [X] T165 [P2] [US2] Implement `auto(): void` in `src/index.ts` (FR-004)
- [X] T166 [P2] [US2] Query elements: `const elements = document.querySelectorAll('[data-squircle]')`
- [X] T167 [P2] [US2] Create IntersectionObserver: `new IntersectionObserver(callback, { rootMargin: '50px' })` (FR-024)
- [X] T168 [P2] [US2] Implement callback: Check `entry.isIntersecting`, apply squircle, unobserve (FR-025)
- [X] T169 [P2] [US2] Parse data attributes: `const config = parseDataAttributes(element)`
- [X] T170 [P2] [US2] Apply to visible elements: If in viewport, call `this.apply(element, config)` immediately
- [X] T171 [P2] [US2] Defer off-screen elements: Attach IntersectionObserver, apply when enters viewport (FR-025)
- [X] T172 [P2] [US2] Store observer in registry: `registry.update(element, { intersectionObserver })`
- [X] T173 [P2] [US2] Unobserve after apply: `observer.unobserve(element)` to prevent repeated triggers
- [X] T174 [P2] [US2] Handle 0 matches: No-op (no error)
- [X] T175 [P2] [US2] Prevent duplicate processing: Check `registry.has(element)` before applying
- [X] T176 [P2] [US2] Handle multiple auto() calls: Re-scan DOM, process new elements only (FR-034 acceptance scenario 4)
- [X] T177 [P2] [US2] Disconnect observer on remove: Implement in `registry.delete()`
- [X] T178 [P2] [US2] Disconnect all observers on destroy: Iterate registry, disconnect all
- [X] T179 [P2] [US2] Export auto() method
- [X] T180 [P2] [US2] Add JSDoc comments explaining lazy loading behavior

- [X] T181 [P2] [US2] Add tests to `tests/unit/api.test.ts` (auto section)
- [X] T182 [P2] [US2] Mock IntersectionObserver: Create mock implementation in test setup
- [X] T183 [P2] [US2] Test auto() with visible elements: Verify immediate application
- [X] T184 [P2] [US2] Test auto() with off-screen elements: Verify IntersectionObserver attached, deferred
- [X] T185 [P2] [US2] Test auto() with data attributes: Verify radius/smoothing parsed correctly
- [X] T186 [P2] [US2] Test auto() with invalid data attributes: Verify defaults used, warnings logged
- [X] T187 [P2] [US2] Test auto() with 0 matches: Verify no error, no-op
- [X] T188 [P2] [US2] Test auto() called multiple times: Verify new elements processed, existing skipped
- [X] T189 [P2] [US2] Test IntersectionObserver callback: Trigger `isIntersecting`, verify apply() called
- [X] T190 [P2] [US2] Test observer unobserve: Verify `unobserve()` called after apply
- [X] T191 [P2] [US2] Test observer disconnect: Verify disconnect on remove() and destroy()
- [X] T192 [P2] [US2] Performance test: auto() with 100 elements, verify <500ms completion (SC-014)
- [X] T193 [P2] [US2] Integration test: Create 50 elements (10 visible, 40 off-screen), call auto(), verify behavior
- [X] T194 [P2] [US2] Verify coverage >85% for auto() method
- [X] T195 [P2] [US2] User Story 2 acceptance scenario 3: Verify lazy loading works

**Success Gate**: auto() tests pass, User Story 2 all acceptance scenarios work

---

## Phase 5: User Story 3 (P3 - Dynamic Element Handling)

**Goal**: Support dynamic updates, responsive behavior, and accessibility

**User Story Reference**: [spec.md lines 69-94]

**Functional Requirements**: FR-005, FR-019, FR-020, FR-021, FR-022, FR-042

### update() Method (FR-005)

**Parallelizable**: T196-T200 implementation can happen in parallel with tests T201-T205

- [X] T196 [P3] [US3] Implement `update(element: HTMLElement | string, config: Partial<SquircleConfig>): void` in `src/index.ts` (FR-005)
- [X] T197 [P3] [US3] Validate element: If string, resolve to HTMLElement
- [X] T198 [P3] [US3] Check if managed: `if (!this.registry.has(element))` throw Error "Element not managed by CornerKit"
- [X] T199 [P3] [US3] Merge config: Get existing config from registry, merge with new values
- [X] T200 [P3] [US3] Validate new config: Call `validateRadius()`, `validateSmoothing()`
- [X] T201 [P3] [US3] Update registry: `this.registry.update(element, mergedConfig)`
- [X] T202 [P3] [US3] Re-render: Get renderer from tier, call `renderer.update(element, mergedConfig)`
- [X] T203 [P3] [US3] Preserve observers: Do not disconnect/reconnect ResizeObserver on update
- [X] T204 [P3] [US3] Export update() method

- [X] T205 [P3] [US3] Add tests to `tests/unit/api.test.ts` (update section)
- [X] T206 [P3] [US3] Test update() on managed element: Verify config merged, path regenerated
- [X] T207 [P3] [US3] Test update() throws on unmanaged element: Verify error message
- [X] T208 [P3] [US3] Test update() with partial config: Update only radius, verify smoothing unchanged
- [X] T209 [P3] [US3] Test update() with invalid config: Verify validation, defaults used
- [X] T210 [P3] [US3] Test update() preserves observers: Verify ResizeObserver not recreated
- [X] T211 [P3] [US3] Integration test: Apply squircle, update radius, verify visual change
- [X] T212 [P3] [US3] User Story 3 acceptance scenario 2: Verify update() works smoothly

**Success Gate**: update() tests pass

### ResizeObserver Integration (Already implemented in T065-T069, enhance here)

**Parallelizable**: T213-T220 are refinements to existing implementation

- [X] T213 [P3] [US3] Refine ResizeObserver in `src/renderers/clippath.ts`: Add comments explaining RAF debouncing
- [X] T214 [P3] [US3] Implement dimension caching: Store `lastDimensions` in registry entry
- [X] T215 [P3] [US3] Implement 1px threshold check: Compare new dimensions to cached, update only if ≥1px change (FR-022)
- [X] T216 [P3] [US3] Implement detached element handling: Try-catch around path update, catch errors, call `registry.delete(element)` (FR-021)
- [X] T217 [P3] [US3] Test ResizeObserver exception handling in `tests/unit/clippath.test.ts`
- [X] T218 [P3] [US3] Test detached element: Remove element from DOM, trigger ResizeObserver, verify error caught
- [X] T219 [P3] [US3] Test graceful cleanup: Verify element removed from registry after error
- [X] T220 [P3] [US3] User Story 3 acceptance scenario 5: Verify detached elements handled gracefully

**Success Gate**: ResizeObserver edge cases handled

### Accessibility - prefers-reduced-motion (FR-042)

**Parallelizable**: T221-T225 implementation can happen in parallel with tests T226-T230

- [X] T221 [P3] [US3] Implement `respectsReducedMotion()` helper in `src/utils/accessibility.ts`
- [X] T222 [P3] [US3] Check media query: `window.matchMedia('(prefers-reduced-motion: reduce)').matches` (FR-042)
- [X] T223 [P3] [US3] Disable transitions: If reduced motion enabled, set `element.style.transition = 'none'`
- [X] T224 [P3] [US3] Apply on initialization: Call `respectsReducedMotion()` in `apply()` method
- [X] T225 [P3] [US3] Listen for changes: Add `matchMedia.addEventListener('change', callback)` to update dynamically

- [X] T226 [P3] [US3] Create `tests/unit/accessibility.test.ts`
- [X] T227 [P3] [US3] Mock `window.matchMedia()`: Return mocked object with `matches: true/false`
- [X] T228 [P3] [US3] Test prefers-reduced-motion enabled: Verify `transition: none` applied
- [X] T229 [P3] [US3] Test prefers-reduced-motion disabled: Verify transitions allowed
- [X] T230 [P3] [US3] Test dynamic change: Mock media query change event, verify behavior updates
- [X] T231 [P3] [US3] User Story 3 acceptance scenario 3: Verify reduced motion respected

**Success Gate**: accessibility.test.ts passes, FR-042 compliant

### Accessibility - Focus Indicators (FR-040, FR-041)

**Parallelizable**: T232-T235 documentation tasks

- [X] T232 [P3] [US3] Preserve outline styles: Verify ClipPath renderer does NOT modify `outline` property (FR-040)
- [X] T233 [P3] [US3] Test focus ring visibility: Create button element, apply squircle, focus with keyboard, verify outline visible (FR-041)
- [X] T234 [P3] [US3] Document outline usage: Add section to README explaining `outline` vs `border` for focus indicators
- [X] T235 [P3] [US3] Add code example: Show recommended `outline: 2px solid blue; outline-offset: 2px;` pattern
- [X] T236 [P3] [US3] Lighthouse accessibility test: Verify >95 score with squircles on interactive elements (SC-010, SC-012)

**Success Gate**: Focus indicators remain visible, documentation complete

### Screen Reader and ARIA (FR-043, FR-044)

**Parallelizable**: T237-T240 validation tasks

- [X] T237 [P3] [US3] Verify ARIA preservation: Test that ClipPath renderer does NOT modify ARIA attributes (FR-043)
- [X] T238 [P3] [US3] Verify tab order: Test keyboard navigation, ensure tab order unchanged (FR-044)
- [X] T239 [P3] [US3] Test screen reader compatibility: Use NVDA/VoiceOver, verify announcements unaffected
- [X] T240 [P3] [US3] Add accessibility tests: Create Playwright test for keyboard navigation and screen readers

**Success Gate**: ARIA and screen readers unaffected

---

## Phase 6: User Story 4 (P4 - Cleanup and Inspection)

**Goal**: Provide lifecycle management methods for production apps

**User Story Reference**: [spec.md lines 96-118]

**Functional Requirements**: FR-006, FR-007, FR-008

### remove() Method (FR-006)

**Parallelizable**: T241-T245 implementation can happen in parallel with tests T246-T250

- [X] T241 [P4] [US4] Implement `remove(element: HTMLElement | string): void` in `src/index.ts` (FR-006)
- [X] T242 [P4] [US4] Validate element: If string, resolve to HTMLElement
- [X] T243 [P4] [US4] Check if managed: `if (!this.registry.has(element))` throw Error "Element not managed by CornerKit"
- [X] T244 [P4] [US4] Get managed data: `const managed = this.registry.get(element)`
- [X] T245 [P4] [US4] Disconnect observers: `managed.resizeObserver?.disconnect()`, `managed.intersectionObserver?.disconnect()`
- [X] T246 [P4] [US4] Remove styling: Get renderer from tier, call `renderer.remove(element)`
- [X] T247 [P4] [US4] Delete from registry: `this.registry.delete(element)`
- [X] T248 [P4] [US4] Export remove() method

- [X] T249 [P4] [US4] Add tests to `tests/unit/api.test.ts` (remove section)
- [X] T250 [P4] [US4] Test remove() on managed element: Verify clip-path removed, observers disconnected
- [X] T251 [P4] [US4] Test remove() throws on unmanaged element: Verify error message
- [X] T252 [P4] [US4] Test remove() disconnects ResizeObserver: Mock observer, verify `disconnect()` called
- [X] T253 [P4] [US4] Test remove() disconnects IntersectionObserver: Mock observer, verify `disconnect()` called
- [X] T254 [P4] [US4] Test remove() deletes from registry: Verify `registry.has(element)` returns false after removal
- [X] T255 [P4] [US4] Test remove() restores original styles: Verify `clipPath` reset to empty string
- [X] T256 [P4] [US4] Integration test: Apply squircle, remove, verify element returns to original state
- [X] T257 [P4] [US4] User Story 4 acceptance scenario 1: Verify remove() works correctly

**Success Gate**: remove() tests pass

### inspect() Method (FR-007)

**Parallelizable**: T258-T262 implementation can happen in parallel with tests T263-T267

- [ ] T258 [P4] [US4] Implement `inspect(element: HTMLElement | string): ManagedElementInfo | null` in `src/index.ts` (FR-007)
- [ ] T259 [P4] [US4] Validate element: If string, resolve to HTMLElement (no error on invalid selector, return null)
- [X] T260 [P4] [US4] Check if managed: `if (!this.registry.has(element))` return null (no error)
- [X] T261 [P4] [US4] Get managed data: `const managed = this.registry.get(element)`
- [X] T262 [P4] [US4] Return info object: `{ config: managed.config, tier: managed.tier, dimensions: managed.lastDimensions, isManaged: true }`
- [X] T263 [P4] [US4] Export `ManagedElementInfo` interface from types
- [X] T264 [P4] [US4] Export inspect() method

- [X] T265 [P4] [US4] Add tests to `tests/unit/api.test.ts` (inspect section)
- [X] T266 [P4] [US4] Test inspect() on managed element: Verify returns correct config, tier, dimensions
- [X] T267 [P4] [US4] Test inspect() on unmanaged element: Verify returns null (no error)
- [X] T268 [P4] [US4] Test inspect() with CSS selector: Verify selector resolution works
- [X] T269 [P4] [US4] Test inspect() with invalid selector: Verify returns null (no error)
- [X] T270 [P4] [US4] Test inspect() returns immutable data: Modify returned config, verify registry unchanged
- [X] T271 [P4] [US4] Integration test: Apply squircle, inspect, verify returned data matches expected
- [X] T272 [P4] [US4] User Story 4 acceptance scenario 2: Verify inspect() returns correct configuration

**Success Gate**: inspect() tests pass

### destroy() Method (FR-008)

**Parallelizable**: T273-T277 implementation can happen in parallel with tests T278-T285

- [X] T273 [P4] [US4] Implement `destroy(): void` in `src/index.ts` (FR-008)
- [X] T274 [P4] [US4] Iterate registry: For each managed element, disconnect observers, remove styling
- [X] T275 [P4] [US4] Disconnect all observers: Call `managed.resizeObserver?.disconnect()`, `managed.intersectionObserver?.disconnect()`
- [X] T276 [P4] [US4] Remove all styling: Get renderer, call `renderer.remove(element)` for each
- [X] T277 [P4] [US4] Clear registry: `this.registry.clear()` or reinitialize WeakMap
- [X] T278 [P4] [US4] Allow re-initialization: After destroy(), instance should still work (fresh start)
- [X] T279 [P4] [US4] Export destroy() method

- [X] T280 [P4] [US4] Add tests to `tests/unit/api.test.ts` (destroy section)
- [X] T281 [P4] [US4] Test destroy() on multiple elements: Apply to 20 elements, destroy, verify all removed
- [X] T282 [P4] [US4] Test destroy() disconnects all observers: Mock observers, verify all `disconnect()` calls
- [X] T283 [P4] [US4] Test destroy() removes all styling: Verify all elements have `clipPath` reset
- [X] T284 [P4] [US4] Test destroy() clears registry: Verify `registry.has()` returns false for all elements
- [X] T285 [P4] [US4] Test destroy() allows re-initialization: Call destroy(), then apply() again, verify works
- [X] T286 [P4] [US4] Test destroy() is idempotent: Call destroy() twice, verify no errors
- [X] T287 [P4] [US4] Integration test: Apply 20 squircles, destroy, verify complete cleanup
- [X] T288 [P4] [US4] User Story 4 acceptance scenario 3: Verify destroy() works correctly
- [X] T289 [P4] [US4] User Story 4 acceptance scenario 4: Verify re-initialization after destroy()

**Success Gate**: destroy() tests pass, User Story 4 all acceptance scenarios work

### WeakMap Garbage Collection Verification (FR-026, User Story 4 acceptance scenario 5)

**Parallelizable**: T290 is a manual verification task

- [ ] T290 [P4] [US4] Manual memory test: Create 100 elements, apply squircles, remove from DOM (without calling remove()), trigger GC in Chrome DevTools, verify memory released
- [ ] T291 [P4] [US4] Document WeakMap behavior: Add section to README explaining automatic memory cleanup
- [ ] T292 [P4] [US4] User Story 4 acceptance scenario 5: Verify WeakMap allows proper garbage collection

**Success Gate**: WeakMap memory management verified

---

## Phase 7: Final Polish & Cross-Cutting Concerns (PF)

**Goal**: Complete build system, integration tests, documentation, and bundle size optimization

**Functional Requirements**: FR-049 to FR-060

### Build System (FR-059, FR-060, FR-057, FR-058)

**Parallelizable**: T293-T300 configuration tasks can happen in parallel

- [ ] T293 [PF] [N/A] Configure Rollup output formats: ESM, UMD, CJS in `rollup.config.js` (FR-059)
- [ ] T294 [PF] [N/A] Add @rollup/plugin-typescript: Compile TypeScript to JavaScript
- [ ] T295 [PF] [N/A] Add rollup-plugin-dts: Bundle TypeScript type definitions (FR-058)
- [ ] T296 [PF] [N/A] Add @rollup/plugin-terser: Minify production build
- [ ] T297 [PF] [N/A] Add @rollup/plugin-replace: Replace `process.env.NODE_ENV` with literal values
- [ ] T298 [PF] [N/A] Enable source maps: `sourcemap: true` in Rollup output config (FR-060)
- [ ] T299 [PF] [N/A] Configure package.json exports: `{ ".": { "import": "./dist/cornerkit.esm.js", "require": "./dist/cornerkit.js", "types": "./dist/index.d.ts" } }`
- [ ] T300 [PF] [N/A] Add build scripts: `"build": "rollup -c"`, `"build:watch": "rollup -c -w"`
- [ ] T301 [PF] [N/A] Test build: Run `npm run build`, verify 3 output files created (ESM, UMD, CJS)
- [ ] T302 [PF] [N/A] Test TypeScript definitions: Import library in TypeScript project, verify types work
- [ ] T303 [PF] [N/A] Test source maps: Load minified file in Chrome DevTools, verify original source visible

**Success Gate**: Build produces ESM, UMD, CJS + .d.ts files, source maps work

### TypeScript Type Definitions (FR-058, export all public types)

**Parallelizable**: T304-T310 type export tasks

- [ ] T304 [PF] [N/A] Export `SquircleConfig` interface from `src/index.ts`
- [ ] T305 [PF] [N/A] Export `RendererTier` enum from `src/index.ts`
- [ ] T306 [PF] [N/A] Export `ManagedElementInfo` interface from `src/index.ts`
- [ ] T307 [PF] [N/A] Export `BrowserSupport` interface from `src/index.ts`
- [ ] T308 [PF] [N/A] Export `DEFAULT_CONFIG` constant from `src/index.ts`
- [ ] T309 [PF] [N/A] Verify type exports: Create test TypeScript file, import all types, verify no errors
- [ ] T310 [PF] [N/A] Add JSDoc comments: Document all public methods, parameters, return values

**Success Gate**: All public types exported, JSDoc complete

### Integration Tests (Playwright) (FR-053 to FR-056)

**Parallelizable**: T311-T325 test creation can happen in parallel

- [ ] T311 [PF] [N/A] Install Playwright: `npm install -D @playwright/test`
- [ ] T312 [PF] [N/A] Configure Playwright: Create `playwright.config.ts` with Chrome, Firefox, Safari, Edge
- [ ] T313 [PF] [N/A] Create test HTML page: `tests/integration/fixtures/test-page.html` with squircle elements
- [ ] T314 [PF] [N/A] Create `tests/integration/apply.test.ts`: Test basic apply() in all browsers (FR-053)
- [ ] T315 [PF] [N/A] Create `tests/integration/batch.test.ts`: Test applyAll() and auto() in all browsers
- [ ] T316 [PF] [N/A] Create `tests/integration/resize.test.ts`: Test responsive behavior (resize viewport)
- [ ] T317 [PF] [N/A] Create `tests/integration/cleanup.test.ts`: Test remove() and destroy()
- [ ] T318 [PF] [N/A] Create visual regression tests: Take screenshots, compare to baseline images
- [ ] T319 [PF] [N/A] Test different radius/smoothing: Verify visual accuracy across parameter ranges
- [ ] T320 [PF] [N/A] Test focus indicators: Keyboard navigation, verify outline visible (FR-041, SC-012)
- [ ] T321 [PF] [N/A] Test graceful fallback: Run tests in simulated IE11 environment, verify border-radius fallback (FR-054)
- [ ] T322 [PF] [N/A] Test error handling: Verify no JavaScript errors in any browser (FR-055)
- [ ] T323 [PF] [N/A] Add CI integration: Create GitHub Actions workflow to run Playwright tests
- [ ] T324 [PF] [N/A] Success criteria SC-008: Verify visual regression tests pass in all browsers
- [ ] T325 [PF] [N/A] Success criteria SC-011: Verify no JS errors in Chrome 65+, Firefox, Safari 14+, Edge 79+, IE11

**Success Gate**: Integration tests pass in Chrome, Firefox, Safari, Edge

### Performance Tests (FR-049 to FR-052, SC-003, SC-004, SC-014, SC-015)

**Parallelizable**: T326-T335 performance measurement tasks

- [ ] T326 [PF] [N/A] Create performance test suite: `tests/performance/`
- [ ] T327 [PF] [N/A] Measure render time: Use Performance API, verify <10ms per element (FR-050, SC-003)
- [ ] T328 [PF] [N/A] Measure init time: Measure from script load to library ready, verify <100ms (FR-051, SC-004)
- [ ] T329 [PF] [N/A] Measure batch application: Apply to 100 elements, verify <500ms total (SC-014)
- [ ] T330 [PF] [N/A] Measure ResizeObserver performance: Trigger 50 simultaneous resizes, verify 60fps maintained (FR-052, SC-015)
- [ ] T331 [PF] [N/A] Create Lighthouse test: Apply squircles to test page, run Lighthouse, verify 100/100 performance (SC-009)
- [ ] T332 [PF] [N/A] Verify accessibility score: Run Lighthouse, verify >95 accessibility (SC-010)
- [ ] T333 [PF] [N/A] Document performance results: Add performance section to README with benchmark data
- [ ] T334 [PF] [N/A] Add performance monitoring: Set up continuous benchmarking in CI
- [ ] T335 [PF] [N/A] Verify all performance success criteria: SC-003, SC-004, SC-009, SC-010, SC-014, SC-015

**Success Gate**: All performance targets met

### Bundle Size Optimization (FR-049, SC-002)

**Parallelizable**: T336-T345 optimization tasks

- [ ] T336 [PF] [N/A] Measure initial bundle size: Build production bundle, gzip, measure size
- [ ] T337 [PF] [N/A] Enable terser minification: Aggressive minification with `compress: { passes: 2 }`
- [ ] T338 [PF] [N/A] Remove comments: Ensure no comments in production build
- [ ] T339 [PF] [N/A] Tree-shaking verification: Check that unused exports are eliminated
- [ ] T340 [PF] [N/A] Analyze bundle composition: Use `rollup-plugin-visualizer` to identify large modules
- [ ] T341 [PF] [N/A] Optimize imports: Ensure no unused imports, dead code eliminated
- [ ] T342 [PF] [N/A] Verify <5KB gzipped: Measure final bundle size, verify meets target (FR-049, SC-002)
- [ ] T343 [PF] [N/A] Add bundlephobia CI check: Automate bundle size monitoring on every PR
- [ ] T344 [PF] [N/A] Document bundle size: Add badge to README showing current size
- [ ] T345 [PF] [N/A] Success criteria SC-002: Verify bundle size <5KB gzipped via bundlephobia

**Success Gate**: Bundle size <5KB gzipped verified

### Security and Privacy Validation (FR-037, FR-045 to FR-048, SC-013)

**Parallelizable**: T346-T355 validation tasks

- [ ] T346 [PF] [N/A] Code audit: Search codebase for `eval()`, `Function()`, `innerHTML`, `outerHTML` - verify none exist (FR-037)
- [ ] T347 [PF] [N/A] Network monitoring test: Load library, monitor network tab, verify zero requests (FR-045, SC-013)
- [ ] T348 [PF] [N/A] Storage audit: Search codebase for `localStorage`, `sessionStorage`, `cookies` - verify none exist (FR-046)
- [ ] T349 [PF] [N/A] Analytics audit: Verify no telemetry, tracking, or phone-home code (FR-047)
- [ ] T350 [PF] [N/A] CSP compatibility test: Add strict CSP headers, verify library works (FR-048)
- [ ] T351 [PF] [N/A] Run `npm audit`: Verify no vulnerabilities in dev dependencies
- [ ] T352 [PF] [N/A] Add npm audit to CI: Automate security scanning
- [ ] T353 [PF] [N/A] Document security practices: Add security section to README
- [ ] T354 [PF] [N/A] Document privacy guarantees: Add privacy section to README (GDPR/CCPA compliance)
- [ ] T355 [PF] [N/A] Success criteria SC-013: Verify zero network requests via monitoring

**Success Gate**: All security and privacy requirements met

### Documentation (SC-001, quickstart.md implementation)

**Parallelizable**: T356-T370 documentation tasks

- [ ] T356 [PF] [N/A] Write README.md: Complete quick start guide based on `quickstart.md`
- [ ] T357 [PF] [N/A] Add installation section: npm, pnpm, yarn commands
- [ ] T358 [PF] [N/A] Add basic usage examples: JavaScript, TypeScript, UMD
- [ ] T359 [PF] [N/A] Add complete example: HTML + CSS + JavaScript working demo
- [ ] T360 [PF] [N/A] Add API reference: Document all 8 methods (constructor, apply, applyAll, auto, update, remove, inspect, destroy)
- [ ] T361 [PF] [N/A] Add configuration reference: Document `SquircleConfig` parameters
- [ ] T362 [PF] [N/A] Add accessibility section: Outline vs border, focus indicators, reduced motion
- [ ] T363 [PF] [N/A] Add browser compatibility table: Support matrix for all tiers
- [ ] T364 [PF] [N/A] Add troubleshooting section: Common issues and solutions
- [ ] T365 [PF] [N/A] Add examples directory: Create `examples/vanilla-js/`, `examples/react-app/`, `examples/vue-app/`
- [ ] T366 [PF] [N/A] Add CHANGELOG.md: Document version 1.0.0 initial release
- [ ] T367 [PF] [N/A] Add CONTRIBUTING.md: Development workflow, testing, PR guidelines
- [ ] T368 [PF] [N/A] Add LICENSE: MIT license file
- [ ] T369 [PF] [N/A] Test quick start guide: Follow README instructions, verify <5 minutes setup (SC-001)
- [ ] T370 [PF] [N/A] Success criteria SC-001: Verify developers can apply first squircle in <5 minutes

**Success Gate**: Complete documentation, quick start tested

### Final Verification (All Success Criteria)

**Parallelizable**: T371-T385 are verification checklists

- [ ] T371 [PF] [N/A] SC-001: Quick start guide <5 minutes ✅
- [ ] T372 [PF] [N/A] SC-002: Bundle size <5KB gzipped (bundlephobia) ✅
- [ ] T373 [PF] [N/A] SC-003: Render time <10ms per element (Performance API) ✅
- [ ] T374 [PF] [N/A] SC-004: Init time <100ms (Performance API) ✅
- [ ] T375 [PF] [N/A] SC-005: TypeScript strict mode passes with zero errors ✅
- [ ] T376 [PF] [N/A] SC-006: Core rendering logic coverage >90% (Vitest) ✅
- [ ] T377 [PF] [N/A] SC-007: Integration code coverage >85% (Vitest) ✅
- [ ] T378 [PF] [N/A] SC-008: Visual regression tests pass (Playwright) ✅
- [ ] T379 [PF] [N/A] SC-009: Lighthouse performance 100/100 ✅
- [ ] T380 [PF] [N/A] SC-010: Lighthouse accessibility >95 ✅
- [ ] T381 [PF] [N/A] SC-011: Zero JS errors in all browsers (Chrome 65+, Firefox, Safari 14+, Edge 79+, IE11) ✅
- [ ] T382 [PF] [N/A] SC-012: Focus indicators visible and not clipped ✅
- [ ] T383 [PF] [N/A] SC-013: Zero network requests (monitoring tools) ✅
- [ ] T384 [PF] [N/A] SC-014: 100 elements in <500ms (5ms avg) ✅
- [ ] T385 [PF] [N/A] SC-015: 50 simultaneous resizes maintain 60fps ✅

**Success Gate**: All 15 success criteria met

### Release Preparation

- [ ] T386 [PF] [N/A] Create changeset: Document version 1.0.0 release notes
- [ ] T387 [PF] [N/A] Update package.json version: Set to `1.0.0`
- [ ] T388 [PF] [N/A] Create git tag: `v1.0.0`
- [ ] T389 [PF] [N/A] Verify npm package: Test `npm pack`, inspect tarball contents
- [ ] T390 [PF] [N/A] Final review: Code review checklist, constitution compliance

**Success Gate**: Ready for npm publish

---

## Dependency Graph

### User Story Completion Order

```
Setup (P0)
   ↓
Foundational (P1) - Required by all user stories
   ↓
   ├─→ User Story 1 (P1) - Simple Static Application
   │      ↓
   ├─→ User Story 2 (P2) - Batch & Auto-Discovery (depends on US1 apply())
   │      ↓
   ├─→ User Story 3 (P3) - Dynamic Handling (depends on US1 apply(), US2 auto())
   │      ↓
   └─→ User Story 4 (P4) - Cleanup (depends on US1-US3 for full testing)
          ↓
       Final Polish (PF) - Integration tests, docs, optimization
```

### Parallel Execution Examples

**Phase 2 (Foundational) - All components can develop in parallel:**
```
T011-T020 (Detector) || T021-T030 (Superellipse) || T031-T040 (Path Gen) || T041-T050 (Validator) || T051-T060 (Logger)
```

**Phase 3 (User Story 1) - Renderers and registry in parallel:**
```
T061-T080 (ClipPath) || T081-T090 (Fallback) || T091-T110 (Registry)
```

**Phase 7 (Final) - Most tasks in parallel:**
```
T311-T325 (Integration Tests) || T326-T335 (Performance) || T336-T345 (Bundle Size) || T346-T355 (Security) || T356-T370 (Docs)
```

---

## Task Summary by Phase

| Phase | Task Range | Count | Description |
|-------|------------|-------|-------------|
| P0: Setup | T001-T010 | 10 | Project initialization, tooling |
| P1: Foundational | T011-T060 | 50 | Detector, math, path gen, validation |
| P1: User Story 1 | T061-T140 | 80 | ClipPath, fallback, registry, apply() |
| P2: User Story 2 | T141-T195 | 55 | applyAll(), auto(), data attributes |
| P3: User Story 3 | T196-T240 | 45 | update(), resize, accessibility |
| P4: User Story 4 | T241-T292 | 52 | remove(), inspect(), destroy(), WeakMap |
| PF: Final Polish | T293-T390 | 98 | Build, tests, docs, optimization |
| **TOTAL** | **T001-T390** | **390** | **Complete implementation** |

---

## Implementation Notes

### Critical Path

**Blocking tasks that must complete before others:**

1. **T001-T010 (Setup)** → Blocks all development
2. **T011-T060 (Foundational)** → Blocks all user story implementation
3. **T061-T140 (User Story 1)** → Blocks US2, US3, US4 (all depend on apply())
4. **T293-T310 (Build System)** → Required for integration tests and npm publish

### Recommended Task Order

**Week 1**: Setup + Foundational (T001-T060)
**Week 2**: User Story 1 (T061-T140)
**Week 3**: User Story 2 + 3 (T141-T240)
**Week 4**: User Story 4 + Final Polish (T241-T390)

### Testing Strategy

- Unit tests are embedded in each phase (write tests alongside implementation)
- Integration tests come in Final Polish phase (require complete API)
- Run tests continuously: `npm run test:watch` during development
- CI runs all tests on every commit

### Success Gates

Each phase has explicit success gates that MUST pass before moving to next phase:
- ✅ All unit tests pass
- ✅ Coverage thresholds met
- ✅ TypeScript compiles with zero errors
- ✅ No ESLint warnings

---

## Functional Requirement Coverage

**Mapping of tasks to functional requirements (FR-001 to FR-060):**

| FR | Description | Tasks |
|----|-------------|-------|
| FR-001 | Constructor | T112-T113 |
| FR-002 | apply() | T116-T125 |
| FR-003 | applyAll() | T141-T145 |
| FR-004 | auto() | T165-T180 |
| FR-005 | update() | T196-T204 |
| FR-006 | remove() | T241-T248 |
| FR-007 | inspect() | T258-T264 |
| FR-008 | destroy() | T273-T279 |
| FR-009-013 | Detection | T011-T020 |
| FR-014-015 | Math | T021-T030 |
| FR-016-017 | Path Gen | T031-T040 |
| FR-018-022 | ClipPath | T061-T080 |
| FR-023-026 | Registry | T091-T110 |
| FR-027-030 | Config | T113, T118-T119 |
| FR-031-034 | Data Attrs | T151-T164 |
| FR-035-039 | Validation | T041-T050 |
| FR-040-044 | A11y | T221-T240 |
| FR-045-048 | Security | T346-T355 |
| FR-049-052 | Performance | T326-T335 |
| FR-053-056 | Browser | T311-T325 |
| FR-057-060 | Build | T293-T310 |

**All 60 functional requirements covered by tasks.**

---

## Next Steps

1. **Review this task breakdown** with the team
2. **Prioritize any adjustments** based on team capacity
3. **Begin implementation** starting with Phase 1 (Setup)
4. **Track progress** using this checklist (update task statuses)
5. **Run `/speckit.implement`** to execute tasks systematically

---

**Generated by**: /speckit.tasks command
**Date**: 2025-01-08
**Feature**: cornerKit Core Library (001-core-library)
**Status**: Ready for implementation ✅
