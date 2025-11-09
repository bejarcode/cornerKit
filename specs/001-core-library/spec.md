# Feature Specification: cornerKit Core Library

**Feature Branch**: `001-core-library`
**Created**: 2025-01-08
**Status**: Draft
**Input**: User description: "cornerKit Core Library (@cornerkit/core) - Build the foundational NPM package that provides iOS-style squircle corners with zero dependencies and <5KB bundle size."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Simple Static Squircle Application (Priority: P1)

A frontend developer wants to apply iOS-style squircle corners to existing HTML elements on a static webpage (buttons, cards, images) using a simple JavaScript API.

**Why this priority**: This is the core value proposition - making it trivially easy to add squircles to any element. This represents the minimum viable product that delivers immediate visual value.

**Independent Test**: Can be fully tested by initializing the library, calling `apply()` on a single element with default settings, and visually verifying squircle corners appear. Delivers immediate visual enhancement without any additional features.

**Acceptance Scenarios**:

1. **Given** a developer has installed the library via npm, **When** they import CornerKit and call `apply()` on a button element with default settings, **Then** the button displays iOS-style squircle corners using the optimal rendering method for their browser
2. **Given** a developer calls `apply()` with custom radius and smoothing values, **When** the element is rendered, **Then** the squircle corners reflect the specified parameters accurately
3. **Given** the library detects browser capabilities, **When** the page loads in different browsers (Chrome, Firefox, Safari, Edge), **Then** the appropriate rendering tier is selected automatically (Native CSS, Houdini, clip-path, or border-radius fallback)
4. **Given** a developer applies squircles to an element, **When** they inspect the element in DevTools, **Then** they can see the applied clip-path or appropriate styling without breaking existing CSS
5. **Given** an element has existing focus styles, **When** squircles are applied, **Then** focus indicators remain visible and are not clipped by the squircle path

---

### User Story 2 - Batch Application and Auto-Discovery (Priority: P2)

A frontend developer wants to apply squircles to multiple elements at once using CSS selectors or automatically via data attributes, reducing boilerplate initialization code.

**Why this priority**: After proving the core functionality works (P1), developers need efficient ways to apply squircles to many elements. This significantly improves developer experience and reduces repetitive code.

**Independent Test**: Can be fully tested by using `applyAll()` with a CSS selector to target multiple elements, or by adding `data-squircle` attributes to elements and calling `auto()`. Delivers batch processing efficiency independently of dynamic updates.

**Acceptance Scenarios**:

1. **Given** a page with 10 buttons all sharing a class `.cta-button`, **When** the developer calls `applyAll('.cta-button', config)`, **Then** all 10 buttons receive squircle corners with the specified configuration
2. **Given** elements have `data-squircle` attributes with inline configuration (`data-squircle-radius="20"`), **When** the developer calls `auto()`, **Then** squircles are applied automatically using the per-element configuration
3. **Given** a page has 50 elements with `data-squircle` attributes scattered across the document, **When** the developer calls `auto()`, **Then** only visible elements are processed immediately (lazy loading via IntersectionObserver) and off-screen elements are processed when they enter the viewport
4. **Given** the developer sets global default configuration, **When** they call `apply()` or `applyAll()` without explicit config, **Then** the global defaults are used for radius and smoothing

---

### User Story 3 - Dynamic Element Handling (Priority: P3)

A frontend developer working with a single-page application (SPA) needs squircles to adapt when elements are resized, updated, or when new elements are added dynamically to the DOM.

**Why this priority**: Modern web applications are dynamic. After core functionality (P1) and batch application (P2) work, supporting responsive and dynamic scenarios is essential for SPA adoption.

**Independent Test**: Can be fully tested by applying squircles to an element, then resizing it (e.g., via responsive breakpoints or JavaScript width changes) and verifying the clip-path updates automatically. Delivers responsive behavior independently of other features.

**Acceptance Scenarios**:

1. **Given** an element with squircles applied, **When** the element is resized (e.g., viewport change, CSS animation, JavaScript width update), **Then** the squircle path regenerates automatically using ResizeObserver and requestAnimationFrame debouncing
2. **Given** a developer calls `update(element, newConfig)`, **When** the element is already managed, **Then** the squircle re-renders with the new radius/smoothing values smoothly
3. **Given** the user has `prefers-reduced-motion` enabled in their OS settings, **When** squircles are updated or animated, **Then** transitions and animations are disabled, respecting the accessibility preference
4. **Given** a developer dynamically creates new elements with `data-squircle` attributes, **When** they call `auto()` again, **Then** new elements are discovered and processed without affecting existing managed elements
5. **Given** an element becomes detached from the DOM, **When** the ResizeObserver attempts to update it, **Then** the error is caught gracefully and the element is removed from the managed registry

---

### User Story 4 - Cleanup and Inspection (Priority: P4)

A frontend developer needs to remove squircles from specific elements, inspect the current configuration of managed elements, and properly destroy all library resources when cleaning up (e.g., SPA route changes).

**Why this priority**: After core application features (P1-P3) work, developers need lifecycle management for production applications. This is less critical than getting squircles working but essential for professional use.

**Independent Test**: Can be fully tested by applying squircles, then calling `remove(element)` and verifying the clip-path is removed and original styles restored. Calling `destroy()` and verifying all observers are disconnected. Delivers cleanup capabilities independently.

**Acceptance Scenarios**:

1. **Given** an element with squircles applied, **When** the developer calls `remove(element)`, **Then** the clip-path styling is removed, the element is removed from the registry, and observers are disconnected for that element
2. **Given** multiple managed elements, **When** the developer calls `inspect(element)`, **Then** they receive the current configuration object (radius, smoothing, tier) for that specific element
3. **Given** the library is managing 20 elements, **When** the developer calls `destroy()`, **Then** all clip-paths are removed, all observers (ResizeObserver, IntersectionObserver) are disconnected, and the registry is cleared
4. **Given** a developer calls `destroy()` during SPA cleanup, **When** they later re-initialize the library on a new route, **Then** a fresh instance is created with no memory of previous elements
5. **Given** an element is removed from the DOM without calling `remove()` first, **When** the garbage collector runs, **Then** WeakMap-based references allow proper memory cleanup without leaks

---

### Edge Cases

- **What happens when an element has dimensions of 0×0px?** The library should skip rendering (no clip-path applied) and log a warning in development mode.
- **What happens when radius exceeds element dimensions (e.g., 100px radius on 50px element)?** The library should clamp radius to `min(width/2, height/2)` to prevent invalid paths.
- **What happens when smoothing is outside 0-1 range?** Input validation should clamp smoothing to [0, 1] and log a warning in development mode.
- **What happens when a developer calls `apply()` on the same element twice with different configs?** The second call should update the configuration, not create duplicate observers or registry entries.
- **What happens when an element is hidden (`display: none`) when `apply()` is called?** The library should store the configuration but defer rendering until the element becomes visible (detected via IntersectionObserver).
- **What happens in Internet Explorer 11 or very old browsers?** The library detects no clip-path support and gracefully falls back to `border-radius`, providing standard rounded corners without JavaScript errors.
- **What happens when a developer provides an invalid color string?** Input validation should detect invalid CSS colors and either use a safe default or skip that property with a warning.
- **What happens when CSS `transform` or `clip-path` is already applied to the element?** The library should preserve existing transforms and only override `clip-path`, documenting this limitation in the README.
- **What happens when hundreds of elements have `data-squircle` on initial page load?** IntersectionObserver lazy loading should prevent performance issues by only processing visible elements initially, deferring off-screen elements.

## Requirements *(mandatory)*

### Functional Requirements

**Core API**:
- **FR-001**: Library MUST export a CornerKit class that can be instantiated with optional global configuration
- **FR-002**: Library MUST provide an `apply(element, config?)` method that applies squircle corners to a single HTMLElement
- **FR-003**: Library MUST provide an `applyAll(selector, config?)` method that applies squircles to all elements matching a CSS selector
- **FR-004**: Library MUST provide an `auto()` method that discovers and applies squircles to all elements with `data-squircle` attributes
- **FR-005**: Library MUST provide an `update(element, config)` method that updates the configuration for an already-managed element
- **FR-006**: Library MUST provide a `remove(element)` method that removes squircle styling from an element and cleans up observers
- **FR-007**: Library MUST provide an `inspect(element)` method that returns the current configuration object for a managed element
- **FR-008**: Library MUST provide a `destroy()` method that removes all squircles, disconnects all observers, and clears the registry

**Browser Detection**:
- **FR-009**: Library MUST detect Native CSS `corner-shape: squircle` support using `CSS.supports()`
- **FR-010**: Library MUST detect CSS Houdini Paint API support by checking for `'paintWorklet' in CSS`
- **FR-011**: Library MUST detect SVG clip-path support using `CSS.supports('clip-path', 'path("")')`
- **FR-012**: Library MUST default to `border-radius` fallback when no modern features are detected
- **FR-013**: Capability detection MUST run once on initialization and cache results for performance

**Math and Path Generation**:
- **FR-014**: Library MUST convert smoothing parameter (0-1 range) to superellipse exponent using formula `n = 2 + (4 - 2) × (1 - smoothing)`
- **FR-015**: Library MUST generate superellipse coordinates using the formula for each corner with proper rotation angles (0°, 90°, 180°, 270°)
- **FR-016**: Library MUST generate optimized SVG path strings using bezier curves for smaller output than point-based paths
- **FR-017**: Library MUST clamp radius to `min(elementWidth/2, elementHeight/2)` to prevent invalid paths

**ClipPath Renderer (Primary Implementation)**:
- **FR-018**: Library MUST apply clip-path styling using inline styles or CSS custom properties
- **FR-019**: Library MUST use ResizeObserver to detect element dimension changes
- **FR-020**: ResizeObserver callbacks MUST be debounced using requestAnimationFrame to prevent performance issues
- **FR-021**: Library MUST handle detached DOM elements gracefully (catch errors, remove from registry)
- **FR-022**: Library MUST update clip-path when element dimensions change by at least 1px (threshold to prevent excessive updates)

**Element Registry and Lazy Loading**:
- **FR-023**: Library MUST maintain an internal registry (WeakMap preferred) of managed elements and their configurations
- **FR-024**: Library MUST use IntersectionObserver for lazy loading when `auto()` is called with many elements
- **FR-025**: Library MUST process only visible elements immediately and defer off-screen elements until they enter the viewport
- **FR-026**: Registry MUST prevent duplicate entries (calling `apply()` twice on same element updates config, not duplicates)

**Configuration**:
- **FR-027**: Configuration object MUST support `radius` (number, pixels), `smoothing` (number, 0-1), and optional `tier` override
- **FR-028**: Default configuration MUST be `radius: 20, smoothing: 0.8` (iOS-like appearance)
- **FR-029**: Library MUST accept global configuration at instantiation: `new CornerKit({ radius: 24, smoothing: 0.85 })`
- **FR-030**: Per-element configuration MUST override global defaults

**Data Attribute Support**:
- **FR-031**: Library MUST parse `data-squircle` attribute as boolean flag for auto-discovery
- **FR-032**: Library MUST parse `data-squircle-radius` attribute as number (pixels)
- **FR-033**: Library MUST parse `data-squircle-smoothing` attribute as number (0-1 range)
- **FR-034**: Invalid data attribute values MUST be ignored with a warning logged in development mode

**Input Validation and Security**:
- **FR-035**: Library MUST validate that `radius` is a non-negative number, defaulting to 20 if invalid
- **FR-036**: Library MUST clamp `smoothing` to [0, 1] range, warning if out of bounds
- **FR-037**: Library MUST NOT use `eval()`, `Function()`, `innerHTML`, or `outerHTML` at any point
- **FR-038**: Library MUST validate element is an HTMLElement instance before processing
- **FR-039**: Library MUST validate selectors (for `applyAll()`) don't execute arbitrary code

**Accessibility**:
- **FR-040**: Library MUST preserve existing `outline` styles to ensure focus indicators remain visible
- **FR-041**: Library MUST NOT clip focus rings (use outline-offset if necessary)
- **FR-042**: Library MUST respect `prefers-reduced-motion` media query by disabling transitions and animations when enabled
- **FR-043**: Library MUST NOT interfere with ARIA attributes, roles, or screen reader accessibility
- **FR-044**: Library MUST NOT alter tab order or keyboard navigation

**Privacy and Security**:
- **FR-045**: Library MUST NOT make any network requests (100% offline operation)
- **FR-046**: Library MUST NOT access localStorage, sessionStorage, or cookies
- **FR-047**: Library MUST NOT collect, transmit, or store any user data or analytics
- **FR-048**: Library MUST be compatible with strict Content Security Policy (no unsafe-inline, no unsafe-eval)

**Performance**:
- **FR-049**: Bundle size (minified + gzipped) MUST be under 5KB
- **FR-050**: Rendering a squircle on a single element MUST complete in under 10ms on modern hardware
- **FR-051**: Initial library load MUST complete in under 100ms
- **FR-052**: ResizeObserver updates MUST be debounced to run at most once per frame (60fps)

**Browser Compatibility**:
- **FR-053**: Library MUST work without errors in Chrome 65+, Firefox (latest 2 versions), Safari 14+, Edge 79+
- **FR-054**: Library MUST provide graceful fallback to `border-radius` in Internet Explorer 11
- **FR-055**: Library MUST NOT throw JavaScript errors in any supported browser
- **FR-056**: Library MUST use feature detection, never user-agent sniffing

**TypeScript and Build**:
- **FR-057**: Library MUST be written in TypeScript with strict mode enabled
- **FR-058**: Library MUST export TypeScript type definitions (.d.ts files)
- **FR-059**: Library MUST build to ESM, UMD, and CJS formats
- **FR-060**: Library MUST include source maps for debugging

### Key Entities

- **SquircleConfig**: Represents the configuration for a squircle effect (radius: number, smoothing: number, tier?: string)
- **RendererTier**: Enumeration of rendering methods (Native, Houdini, ClipPath, Fallback)
- **ManagedElement**: Internal registry entry tracking an element, its config, and its observers
- **SuperellipsePoint**: Coordinate pair (x, y) representing a point on the superellipse curve

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can install the library via npm and apply their first squircle corner in under 5 minutes following the README quick start guide
- **SC-002**: Bundle size is verified to be under 5KB gzipped using bundlephobia.com automated checks
- **SC-003**: Rendering a squircle on a single element completes in under 10ms as measured by Performance API benchmarks
- **SC-004**: Library initialization completes in under 100ms as measured from script execution to ready state
- **SC-005**: TypeScript type-checking passes with strict mode enabled and zero errors
- **SC-006**: Test coverage for core rendering logic (superellipse math, path generation, tier detection) exceeds 90%
- **SC-007**: Test coverage for integration code (registry, observers, API methods) exceeds 85%
- **SC-008**: Cross-browser visual regression tests pass in Playwright for Chrome, Firefox, Safari, and Edge
- **SC-009**: Lighthouse performance score remains 100/100 with the library active on a test page
- **SC-010**: Lighthouse accessibility score exceeds 95 with squircles applied to interactive elements
- **SC-011**: Library works without JavaScript errors in all supported browsers (Chrome 65+, Firefox latest 2, Safari 14+, Edge 79+, IE11 fallback)
- **SC-012**: Focus indicators remain visible and are not clipped on interactive elements with squircles applied
- **SC-013**: Network traffic monitoring confirms zero network requests originate from the core library
- **SC-014**: Applying squircles to 100 elements completes in under 500ms (5ms average per element)
- **SC-015**: ResizeObserver handles 50 simultaneous element resizes without frame drops (maintains 60fps)

## Assumptions

- Developers using this library have basic knowledge of JavaScript/TypeScript and npm package management
- Target browsers have JavaScript enabled (graceful degradation for no-JS is out of scope)
- Elements receiving squircles are visible in the DOM (hidden elements via `display: none` will be deferred)
- Developers will use a module bundler (Webpack, Rollup, Vite) or native ESM imports (UMD available for legacy `<script>` tag usage)
- Performance targets are based on mid-range desktop/laptop hardware (2020+ era processors)
- The library will be used primarily for decorative purposes (squircle corners), not critical UI functionality
- Developers using data attributes understand basic HTML data attribute syntax
- Browser support percentages reflect 2024+ traffic patterns (IE11 usage <1%)

## Out of Scope

**Explicitly excluded from this phase (future phases)**:
- Houdini Paint Worklet implementation (Phase 2)
- Native CSS `corner-shape: squircle` renderer (Phase 2)
- React component wrapper (Phase 3 - separate package @cornerkit/react)
- Vue component wrapper (Phase 3 - separate package @cornerkit/vue)
- Web Component wrapper (Phase 3 - separate package @cornerkit/web-component)
- Shopify Theme App Extension (Phase 4 - separate package @cornerkit/shopify)
- Server-side rendering (SSR) support
- Animation APIs (scroll-driven animations, CSS transitions)
- Individual corner radius control (different radius per corner)
- Gradient fills following squircle path
- Drop shadows matching squircle shape
- CLI tool for code generation
- Figma/Sketch design plugins

## Dependencies

**Runtime Dependencies**: ZERO (core principle of the library)

**Development Dependencies**:
- TypeScript 5.0+ (language and type-checking)
- Rollup 4.0+ (bundler optimized for libraries)
- Vitest (unit testing framework)
- Playwright (cross-browser visual regression testing)
- ESLint + @typescript-eslint/* (linting)
- Prettier (code formatting)
- @rollup/plugin-typescript (TypeScript compilation)
- @rollup/plugin-terser (minification)
- rollup-plugin-dts (type definition bundling)
- happy-dom (DOM testing environment for Vitest)

**Browser APIs Used** (all feature-detected):
- `CSS.supports()` for capability detection
- `IntersectionObserver` for lazy loading (graceful degradation without it)
- `ResizeObserver` for responsive updates (graceful degradation without it)
- `requestAnimationFrame` for debounced updates
- `WeakMap` for element registry (memory-safe references)

## Risks and Mitigation

**Risk 1: Bundle Size Exceeds 5KB**
- **Impact**: High - Violates core principle, reduces adoption
- **Probability**: Medium - Math and path generation code can be verbose
- **Mitigation**:
  - Use tree-shaking with Rollup
  - Implement bezier-based paths (smaller than point-based)
  - Aggressive minification with terser
  - Pre-calculate constants at build time
  - Continuous monitoring with bundlephobia CI checks

**Risk 2: Browser Compatibility Issues**
- **Impact**: High - Limits adoption, damages reputation
- **Probability**: Medium - Subtle CSS/JavaScript differences across browsers
- **Mitigation**:
  - Comprehensive Playwright test matrix (Chrome, Firefox, Safari, Edge)
  - Feature detection instead of user-agent sniffing
  - Graceful fallback tiers
  - Manual testing on physical devices
  - BrowserStack for additional coverage

**Risk 3: Performance Degradation with Many Elements**
- **Impact**: High - Poor performance limits use cases
- **Probability**: Medium - ResizeObserver can be expensive
- **Mitigation**:
  - IntersectionObserver lazy loading for off-screen elements
  - requestAnimationFrame debouncing for resize updates
  - Performance budgets enforced in tests
  - Benchmark tests with 100+ elements
  - WeakMap registry for efficient lookups

**Risk 4: Focus Ring Clipping**
- **Impact**: High - Accessibility violation (WCAG failure)
- **Probability**: Medium - clip-path clips everything outside the path
- **Mitigation**:
  - Use `outline` instead of `border` for focus indicators
  - Document outline-offset recommendations
  - Automated axe-core accessibility tests
  - Manual screen reader testing
  - Lighthouse accessibility score tracking

**Risk 5: ResizeObserver Exceptions with Detached Elements**
- **Impact**: Medium - Can cause console errors in SPAs
- **Probability**: High - Common in dynamic applications
- **Mitigation**:
  - Try-catch blocks around ResizeObserver callbacks
  - Remove detached elements from registry
  - WeakMap allows garbage collection
  - Comprehensive error handling tests
  - Documentation on proper cleanup

**Risk 6: TypeScript Strict Mode Violations**
- **Impact**: Medium - Reduces type safety, developer experience
- **Probability**: Low - Can be enforced from start
- **Mitigation**:
  - Enable strict mode from project inception
  - Pre-commit hooks run type-check
  - CI fails on type errors
  - Zero `any` types allowed
  - Explicit return types on public APIs

## Notes

- This specification focuses on WHAT the library must do, not HOW to implement it (no technology-specific implementation details)
- All acceptance scenarios are testable without knowing the internal implementation
- Success criteria are measurable and technology-agnostic where possible
- The library is the foundation for all other cornerKit packages - changes here affect the entire monorepo
- Priority ordering reflects incremental value delivery: P1 is MVP, P2-P4 build on core functionality
- Each user story can be implemented, tested, and deployed independently
