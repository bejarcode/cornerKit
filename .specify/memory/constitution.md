<!--
Sync Impact Report:
- Version: 1.0.0 → 1.1.0 (MINOR - Added principles and clarifications)
- Amendment Date: 2025-01-08
- Principles Added:
  - VIII. Accessibility (WCAG 2.1 AA compliance, screen reader support)
  - IX. Security (No XSS, input validation, CSP compatible)
  - X. Privacy (No data collection, GDPR/CCPA compliant)
- Sections Modified:
  - Pre-commit Hooks: MUST → RECOMMENDED (developer flexibility)
  - Coverage Thresholds: Added tiered approach (90% core, 85% integrations, 0% examples)
  - Governance: Added Backwards Compatibility Policy (deprecation process)
- Templates Status:
  ✅ plan-template.md - Must now check accessibility and security gates
  ✅ spec-template.md - Requirements should include accessibility acceptance criteria
  ✅ tasks-template.md - Tasks must include accessibility and security testing
- Follow-up TODOs:
  - Add accessibility testing guide to docs/
  - Create security review checklist for PRs
  - Update Shopify extension with privacy policy
-->

# cornerKit Constitution

## Core Principles

### I. Zero Dependencies

**Rule**: The core library (@cornerkit/core) MUST have exactly zero runtime dependencies.

**Rationale**: Dependencies introduce:
- Bundle size bloat (violates <5KB target)
- Security vulnerabilities requiring constant updates
- Breaking changes beyond our control
- Increased maintenance burden
- Slower installation times

**Implementation**:
- Core library package.json `dependencies: {}`
- All required functionality implemented in-house
- Dev dependencies permitted for build/test tooling only
- Framework integrations may depend on @cornerkit/core + peer dependencies
- Violation of this principle requires explicit approval and justification in plan.md

**Verification**:
- CI checks package.json dependencies field is empty object
- Build fails if any runtime import from node_modules detected
- Bundle analysis confirms zero external code

### II. Performance First

**Rule**: Performance budgets are non-negotiable and MUST be enforced at build time.

**Budgets**:
- Core library: <5KB gzipped (bundle size)
- Render time: <10ms per element on modern hardware
- Initial load: <100ms from script execution to first paint
- Framework integrations: <2KB additional beyond core
- Memory: No leaks, proper cleanup on element removal
- FPS: Animations maintain 60fps on mid-range devices

**Rationale**: Performance directly impacts user experience and conversion rates. A slow library will not be adopted regardless of features.

**Implementation**:
- bundlephobia integration in CI fails builds exceeding 5KB
- Performance API benchmarks in test suite
- Lazy loading with IntersectionObserver for off-screen elements
- Debounced resize handlers (requestAnimationFrame)
- GPU acceleration where available (Tier 1 & 2)

**Verification**:
- Automated bundle size checks on every PR
- Lighthouse CI enforces 100/100 performance score
- Benchmark tests measure render time

### III. Progressive Enhancement (4-Tier System)

**Rule**: The library MUST implement a 4-tier progressive enhancement strategy, automatically detecting and using the best available rendering method.

**Tier 1: Native CSS** (`corner-shape: squircle`)
- Chrome 139+ (when available)
- GPU-accelerated, zero JavaScript overhead
- Detection: `CSS.supports('corner-shape', 'squircle')`

**Tier 2: CSS Houdini Paint API**
- Chrome 65+, Edge 79+
- Runs on paint thread (off main thread)
- Detection: `'paintWorklet' in CSS`
- Requires worklet registration

**Tier 3: SVG clip-path** (Primary Implementation)
- All modern browsers (Firefox, Safari, Chrome, Edge)
- Dynamic path generation via JavaScript
- ResizeObserver for responsive updates
- Detection: `CSS.supports('clip-path', 'path("")')`

**Tier 4: border-radius fallback**
- Universal compatibility (IE11+)
- Standard rounded corners (not true squircles)
- Graceful degradation, no JavaScript errors

**Rationale**: Users have different browsers; we must serve all while optimizing for modern capabilities.

**Implementation**:
- Capability detector runs once on init
- Tier selection cached per session
- No user-agent sniffing (feature detection only)
- Each tier self-contained (no shared rendering code)

**Verification**:
- Cross-browser testing matrix (Playwright)
- Manual testing on target browsers
- Automated tier selection tests

### IV. Framework Agnostic

**Rule**: The core library MUST be pure JavaScript with zero framework dependencies. Framework integrations are thin wrappers around the core.

**Architecture**:
```
@cornerkit/core (vanilla JS, zero deps)
    ↓ consumed by
@cornerkit/react (React wrapper, depends on core)
@cornerkit/vue (Vue wrapper, depends on core)
@cornerkit/web-component (Web Component wrapper, depends on core)
```

**Rationale**: Maximizes reach, reduces duplication, ensures consistent behavior across all frameworks.

**Implementation**:
- Core library exports pure functions and classes
- No JSX, Vue templates, or framework-specific syntax in core
- Framework integrations use core API, not reimplementations
- Single source of truth for squircle math and rendering
- Tree-shakeable exports enable importing only needed parts

**Verification**:
- Core library compiles without React/Vue/etc installed
- Integration tests verify identical output across frameworks
- Bundle analysis confirms no framework code in core

### V. Type Safety

**Rule**: TypeScript strict mode MUST be enabled for all packages, with >85% test coverage enforced.

**TypeScript Requirements**:
- `strict: true` in tsconfig.json
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- Zero `any` types (use `unknown` + type guards)
- All public APIs have exported type definitions
- `.d.ts` files generated for all packages

**Test Coverage Requirements** (Tiered Approach):
- **Core rendering logic**: >90% coverage (critical path - superellipse math, tier detection, renderers)
- **Integration packages**: >85% coverage (React, Vue, Web Component wrappers)
- **Utilities and helpers**: >85% coverage (observers, performance monitors)
- **Example/demo code**: 0% coverage (not production code, excluded from thresholds)

**Coverage Types** (all measured):
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

**Test Types**:
- Unit tests (Vitest) for all logic
- Integration tests (Playwright) for visual output
- Contract tests for framework integrations

**Rationale**: Type safety catches errors at compile time. High test coverage ensures reliability and prevents regressions.

**Implementation**:
- `tsc --noEmit` runs in CI, fails on type errors
- Vitest coverage thresholds fail builds below 85%
- Codecov integration tracks coverage over time
- Pre-commit hooks run type-check

**Verification**:
- CI runs `pnpm type-check` (must pass)
- CI runs `pnpm test --coverage` (must meet thresholds)
- Coverage reports uploaded to Codecov

### VI. Developer Experience

**Rule**: Library MUST be installable and functional in under 5 minutes with excellent documentation.

**API Design Principles**:
- Simple, intuitive API (declarative > imperative)
- Consistent naming conventions across all packages
- Helpful error messages with actionable guidance
- Sensible defaults (radius: 20px, smoothing: 0.8)
- Zero configuration required for basic usage

**Documentation Requirements**:
- Comprehensive README with quick start
- API reference with TypeScript signatures
- Live examples (CodeSandbox/CodePen)
- Video tutorials for common use cases
- Migration guides from alternatives
- Troubleshooting section for common issues

**Quick Start Target**:
```bash
# User should go from 0 to working squircle in <5 minutes
npm install cornerkit
# Add 3 lines of code
# See squircle corners
```

**Rationale**: Great DX drives adoption. If developers struggle to get started, they'll choose alternatives.

**Implementation**:
- Clear, concise documentation
- Working examples in docs
- IntelliSense support (TypeScript definitions)
- Minimal required configuration
- Progressive disclosure (simple cases easy, advanced cases possible)

**Verification**:
- Onboarding tests with new developers (time-to-first-squircle)
- Documentation reviews before releases
- GitHub issues monitoring for DX complaints

### VII. Browser Compatibility

**Rule**: Library MUST support 95%+ of global browser traffic with graceful degradation.

**Supported Browsers** (as of 2024):
- **Chrome**: 65+ (Houdini support)
- **Firefox**: Latest 2 versions
- **Safari**: 14+ (iOS and macOS)
- **Edge**: 79+ (Chromium-based)
- **Mobile Safari**: iOS 14+
- **Chrome Mobile**: Latest 2 versions
- **Fallback**: IE11 (border-radius only, no JS errors)

**Compatibility Strategy**:
- Feature detection, never user-agent sniffing
- Graceful degradation (Tier 4 fallback)
- No polyfills bundled (user responsibility)
- No runtime errors in any browser
- Visual regression tests across browsers

**Rationale**: Users access sites from various devices/browsers. We must work everywhere.

**Implementation**:
- Playwright tests on Chrome, Firefox, Safari, Edge
- BrowserStack for real device testing
- Can I Use database consultation
- Progressive enhancement ensures baseline works universally

**Verification**:
- Automated cross-browser testing in CI
- Visual regression screenshots comparison
- Manual testing on physical devices
- Analytics tracking (no error spikes on any browser)

### VIII. Accessibility

**Rule**: Library MUST not break accessibility or introduce barriers for users with disabilities.

**Requirements**:
- Squircles must not interfere with screen readers
- Focus indicators preserved (not clipped by clip-path)
- Keyboard navigation unaffected
- ARIA attributes and roles respected
- Color contrast maintained for text/borders
- Reduced motion preference honored (`prefers-reduced-motion`)
- Touch targets meet minimum size requirements (44×44px mobile)

**Rationale**: 15% of users have disabilities. Accessible design is inclusive design and often required by law (ADA, WCAG 2.1 AA compliance).

**Implementation**:
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Audit with axe DevTools or Lighthouse accessibility score
- Ensure clip-path doesn't clip focus rings (use outline instead of border)
- Respect `prefers-reduced-motion` media query for animations
- Document accessibility considerations in README
- Use semantic HTML (native elements over divs)
- Preserve document outline and heading hierarchy

**Verification**:
- Lighthouse accessibility score >95
- Manual screen reader testing (VoiceOver on iOS/macOS, NVDA on Windows)
- Automated axe-core tests in CI
- Keyboard navigation testing (tab order, focus visibility)
- Color contrast checker (WCAG AA minimum 4.5:1)

### IX. Security

**Rule**: Library MUST follow secure coding practices and not introduce vulnerabilities.

**Requirements**:
- No use of `eval()`, `Function()`, or `new Function()`
- No `innerHTML` or `outerHTML` manipulation
- No external resource loading (images, scripts, fonts)
- Input validation on all user-provided values (radius, smoothing, colors)
- No prototype pollution vulnerabilities
- Dependabot enabled for dev dependency updates
- CSP (Content Security Policy) compatible
- No XSS attack vectors

**Rationale**: Security vulnerabilities damage user trust, library adoption, and can harm end users. Open source libraries are high-value targets for supply chain attacks.

**Implementation**:
- Static analysis with ESLint security plugins (`eslint-plugin-security`)
- Input sanitization: validate radius >= 0, smoothing 0-1, colors are valid CSS
- Use `textContent` instead of `innerHTML`
- No dynamic script generation
- Regular security audits before major releases
- OWASP Top 10 awareness and training
- Subresource Integrity (SRI) for CDN-hosted builds

**Verification**:
- `npm audit` runs in CI (no high/critical vulnerabilities)
- Snyk scanning enabled (automated vulnerability detection)
- Manual code review for security patterns (no eval, no innerHTML)
- Penetration testing for Shopify extension
- CSP compliance testing (no unsafe-inline, no unsafe-eval)

### X. Privacy

**Rule**: Library MUST NOT collect, transmit, or store user data without explicit consent.

**Requirements**:
- No analytics or telemetry in core library
- No network requests (no phone-home behavior)
- No localStorage/sessionStorage/cookies usage
- No fingerprinting or tracking
- GDPR/CCPA compliant (especially for Shopify extension)
- Privacy policy required for Shopify App Store

**Rationale**: User privacy is a fundamental right. Data collection requires consent and compliance with global regulations (GDPR, CCPA, PIPEDA).

**Implementation**:
- Core library is 100% offline (no network activity)
- Shopify extension may collect anonymized usage stats with opt-in only
- Privacy policy in Shopify extension docs
- Clear disclosure of any data processing
- EU/California privacy law compliance
- Data minimization principle (collect only what's necessary)
- Right to erasure support (for Shopify extension)

**Verification**:
- Network traffic monitoring confirms no requests from core library
- Privacy policy reviewed by legal (for Shopify extension)
- GDPR compliance checklist
- App Store privacy disclosure accurate and complete
- No localStorage/sessionStorage access in core library code

## Technical Standards

### Package Structure

**Monorepo Organization** (pnpm workspaces):
```
packages/
├── core/              # @cornerkit/core (zero deps)
├── react/             # @cornerkit/react (peer: react 16.8+)
├── vue/               # @cornerkit/vue (peer: vue 3+)
├── web-component/     # @cornerkit/web-component (zero deps)
└── shopify/           # @cornerkit/shopify (private, not published)
```

**Required Files** (every package):
- `package.json` with exports field
- `tsconfig.json` extending root config
- `README.md` with usage examples
- `dist/` output directory (gitignored)
- `.d.ts` type definitions

**Forbidden**:
- Circular dependencies between packages
- Duplicate code (use shared utilities in core)
- Framework-specific code in core package

### Build System

**Bundler**: Rollup 4.0+ (optimized for libraries)

**Output Formats**:
- ESM (ES modules): `dist/[package].esm.js`
- UMD (browser global): `dist/[package].js`
- CJS (CommonJS): `dist/[package].cjs`
- Types: `dist/index.d.ts`

**Build Requirements**:
- Source maps for debugging
- Minified and non-minified versions
- Tree-shakeable exports
- Target: ES2020 (ESM), ES2015 (UMD/CJS for compat)

### Testing Requirements

**Test Types**:
1. **Unit Tests** (Vitest) - Fast, isolated logic tests
2. **Integration Tests** (Playwright) - Cross-browser visual tests
3. **Contract Tests** - Framework integration API tests
4. **Performance Tests** - Bundle size, render time benchmarks

**Coverage Thresholds** (enforced):
- Lines: >85%
- Branches: >85%
- Functions: >85%
- Statements: >85%

**Test Organization**:
```
tests/
├── unit/           # Fast, isolated tests
├── integration/    # Browser-based tests
├── contract/       # API contract tests
└── visual/         # Screenshot comparison tests
```

### Code Quality

**Linting**: ESLint 8+ with TypeScript plugin
- No `any` types (error)
- Explicit return types on public APIs (warn)
- No unused variables (error)
- Import ordering enforced (error)

**Formatting**: Prettier
- Single quotes
- 2 space indentation
- Trailing commas (ES5)
- 100 character line width
- Semicolons required

**Pre-commit Hooks** (Husky + lint-staged):

Pre-commit hooks are **RECOMMENDED** but not required. Projects may configure hooks based on team preferences and workflow.

**Recommended Configuration**:
- ESLint auto-fix on staged files
- Prettier auto-format on staged files
- Type-check on commit (fast, no full build)

**Rationale**: Teams have different workflows. Some prefer IDE-based linting, others prefer commit hooks. The minimum requirement is that pre-push checks MUST pass.

**Minimum Requirement**: At minimum, pre-push checks MUST pass (see Development Workflow section).

## Development Workflow

### Version Management

**Semantic Versioning** (SemVer):
- MAJOR: Breaking API changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

**Changesets Workflow**:
1. Developer creates changeset: `pnpm changeset`
2. Describes changes and selects packages
3. Commits changeset with feature code
4. On merge to main: Changesets bot creates PR
5. PR updates versions and generates CHANGELOG
6. Merge PR triggers automated NPM publish

**Version Constraints**:
- All workspace packages versioned together
- `@cornerkit/core` version drives others
- Internal dependencies use `workspace:*` protocol

### Git Workflow

**Branch Strategy**:
- `main`: Production-ready code (protected)
- `feature/[name]`: Feature development
- `fix/[name]`: Bug fixes
- `docs/[name]`: Documentation updates

**Commit Messages** (Conventional Commits):
- `feat: add Vue 3 composable API`
- `fix: resolve Safari 14 clip-path bug`
- `docs: update React examples`
- `chore: bump dependencies`
- `test: add cross-browser visual tests`

**Pre-commit Checks** (must pass):
- Lint staged files
- Format staged files
- Type-check (fast mode)

**Pre-push Checks** (must pass):
- Full type-check: `pnpm type-check`
- All tests: `pnpm test`

### Pull Request Requirements

**Required Checks** (CI):
- ✅ Type-check passes (`tsc --noEmit`)
- ✅ Linting passes (`eslint`)
- ✅ Tests pass with >85% coverage
- ✅ Bundle size <5KB (core package)
- ✅ Lighthouse performance 100/100
- ✅ Visual regression tests pass (Playwright)

**Required Reviews**:
- 1+ approval from core maintainer
- No unresolved conversations
- No merge conflicts

**PR Description Must Include**:
- What changed and why
- Testing performed
- Screenshots/videos for visual changes
- Breaking changes called out explicitly
- Migration guide if breaking changes

### Release Process

**NPM Publish** (automated):
1. Changesets PR merged to main
2. GitHub Actions builds all packages
3. Runs full test suite
4. Publishes to NPM registry
5. Creates GitHub release with changelog
6. Git tags created (e.g., `@cornerkit/core@1.2.3`)

**Shopify Extension Deploy** (manual):
1. Update Shopify extension code
2. Test in development store
3. Run `shopify app deploy`
4. Submit to Shopify App Store review (if needed)

## Governance

### Constitution Authority

This constitution is the single source of truth for all cornerKit development practices. When conflicts arise between this document and other guidance:

1. **Constitution supersedes all** - README, docs, comments, verbal agreements
2. **Amendments require justification** - Changes must be documented in Sync Impact Report
3. **Violations must be justified** - plan.md Complexity Tracking table required

### Amendment Process

**Who Can Propose**: Any contributor

**Amendment Steps**:
1. Create GitHub issue proposing change with rationale
2. Discuss with core team and community
3. If approved, update constitution with version bump:
   - MAJOR: Remove/redefine core principles (breaking)
   - MINOR: Add new principles or sections
   - PATCH: Clarifications, wording fixes
4. Update Sync Impact Report at top of file
5. Propagate changes to templates (plan, spec, tasks)
6. Create PR with constitution + template updates
7. Require 2+ core maintainer approvals

### Compliance

**Enforcement**:
- All PRs reviewed against constitution principles
- CI enforces technical standards automatically
- Violations blocked at review stage
- Exceptions require explicit justification in plan.md

**Review Cadence**:
- Constitution reviewed quarterly (Jan, Apr, Jul, Oct)
- Principles assessed for relevance and effectiveness
- Updates proposed based on lessons learned
- Community feedback incorporated

### Simplicity Principle

**YAGNI (You Aren't Gonna Need It)**: Complexity must be justified.

When adding complexity (new package, abstraction, dependency, pattern):
1. Document in plan.md Complexity Tracking table
2. Explain why needed now (not hypothetically)
3. Explain why simpler alternatives insufficient
4. Get approval from 2+ core maintainers

**Default Answer**: Start simple. Add complexity only when proven necessary.

### Backwards Compatibility Policy

**Goal**: Minimize breaking changes and provide clear migration paths when they occur.

**Deprecation Process**:

1. **Deprecation Announcement** (Version N.x.x)
   - Mark feature as deprecated in code
   - Add `console.warn()` in development mode (not production)
   - Update CHANGELOG with deprecation notice
   - Document replacement/alternative in migration guide
   - Add JSDoc `@deprecated` tag with migration instructions

2. **Deprecation Period** (1 major version)
   - Deprecated feature remains fully functional
   - Documentation shows both old (deprecated) and new approach
   - Migration guide actively promoted
   - Community notified via GitHub discussions/Twitter

3. **Removal** (Next major version N+1.0.0)
   - Remove deprecated feature
   - CHANGELOG prominently lists breaking changes
   - Migration guide updated with before/after examples
   - Major version bump (SemVer MAJOR)

**Example**:
```
v1.5.0: Deprecate oldMethod(), introduce newMethod()
v1.6.0-v1.9.x: Both methods work, warnings in dev mode
v2.0.0: Remove oldMethod(), only newMethod() available
```

**Exceptions**:
- Security vulnerabilities may be removed immediately (patch release)
- Critical bugs may require emergency breaking changes (document extensively)
- Experimental features (clearly marked) have no deprecation guarantee

---

**Version**: 1.1.0 | **Ratified**: 2025-01-08 | **Last Amended**: 2025-01-08
