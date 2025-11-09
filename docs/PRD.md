# cornerKit Core Library - Product Requirements Document

**Product Name:** cornerKit Core (@cornerkit/core)
**Version:** 1.0.0
**Last Updated:** 2025-01-08
**Status:** Planning Phase
**Product Type:** NPM JavaScript Library

---

## Executive Summary

cornerKit is a lightweight (<5KB gzipped), zero-dependency, framework-agnostic JavaScript library that brings iOS-style squircle corners to any web project. It provides a simple API for developers while automatically detecting browser capabilities and using the best available rendering method through a 4-tier progressive enhancement system.

**Target Audience:** Frontend developers, design system engineers, and web agencies building modern web applications.

**Distribution:** NPM registry, CDN (unpkg, jsDelivr), framework-specific packages (@cornerkit/react, @cornerkit/vue).

---

## Problem Statement

### Current State

Modern web design increasingly adopts iOS design language, particularly the smooth, continuous curves known as "squircles" (a portmanteau of "square" and "circle"). These are mathematically superellipses with specific parameters that create aesthetically pleasing corners.

**Current limitations:**

1. **CSS `border-radius`** only produces circular arcs, not true squircles
2. **SVG solutions** require complex manual path generation and don't scale responsively
3. **Image-based approaches** are inflexible and have performance issues
4. **Native CSS `corner-shape: squircle`** is only available in Chrome 139+ (not yet released)
5. **Existing libraries** are either framework-specific, too large, or lack progressive enhancement

### Impact

- **Developers** waste time implementing complex workarounds
- **Design systems** can't accurately replicate iOS design language
- **E-commerce sites** (especially Shopify stores) can't achieve premium visual effects without custom development
- **Performance** suffers from inefficient implementations

---

## Solution

cornerKit provides a production-ready solution with:

1. **4-Tier Progressive Enhancement**
   - Tier 1: Native CSS `corner-shape: squircle` (Chrome 139+, future)
   - Tier 2: CSS Houdini Paint API (Chrome 65+, Edge 79+)
   - Tier 3: SVG `clip-path` with dynamic path generation (all modern browsers)
   - Tier 4: `border-radius` fallback (universal, including IE11)

2. **Framework Integrations**
   - Vanilla JavaScript API
   - React component + hook
   - Vue 3 component
   - Web Component
   - Shopify Liquid snippets

3. **Shopify Theme App Extension**
   - Zero-code installation for merchants
   - Visual theme editor integration
   - Pre-built blocks (buttons, cards, images)

---

## Target Users

### Primary Personas

#### 1. **Frontend Developer (Emma)**

**Demographics:**
- Age: 26-38
- Role: Senior Frontend Engineer at a SaaS company
- Experience: 5-10 years web development
- Stack: React, TypeScript, modern tooling

**Psychographics:**
- Efficiency-focused, values developer experience
- Quality-conscious, reads library source code
- Community-engaged, active on GitHub/Twitter
- Performance-obsessed, monitors bundle sizes

**Goals:**
- Implement iOS-style design system across React app
- Maintain <100KB total bundle size
- Ship features quickly without compromising quality
- Use tools with excellent TypeScript support

**Pain Points:**
- Current squircle solutions are framework-specific or too heavy
- Figma designs show squircles but no easy implementation path
- Manual SVG path generation is error-prone and time-consuming
- Existing libraries lack proper TypeScript definitions

**Success Criteria:**
- <5KB bundle size for core library
- Full TypeScript support with strict mode
- Works seamlessly with existing React components
- Install and implement in <10 minutes

**Quote:**
> "I need a library that just works. Give me TypeScript types, keep it under 5KB, and let me get back to building features."

---

#### 2. **Design System Engineer (Marcus)**

**Demographics:**
- Age: 28-42
- Role: Lead Design Systems Engineer at Fortune 500 company
- Experience: 8-15 years, specialized in component libraries
- Stack: Monorepo, React, Vue, Web Components

**Psychographics:**
- Architecture-focused, thinks in systems
- Collaboration-driven, works cross-functionally
- Standards-oriented, creates guidelines
- Future-thinking, plans for 3-5 year adoption

**Goals:**
- Create reusable component library with squircle support
- Support React, Vue, and vanilla JS from single codebase
- Maintain consistent visual output across frameworks
- Ensure accessibility and performance standards

**Pain Points:**
- Need consistent implementation across multiple frameworks
- Existing libraries are framework-specific (can't share code)
- Custom implementation means maintaining separate codebases
- Design team expects pixel-perfect iOS-style corners

**Success Criteria:**
- Framework-agnostic core library
- Tree-shakeable exports (only import what you use)
- Well-documented API with examples
- Battle-tested (>85% code coverage)

**Quote:**
> "I'm building a design system for 200+ engineers. I need one library that works everywhere, not five different implementations."

---

#### 3. **Indie Developer (Alex)**

**Demographics:**
- Age: 22-35
- Role: Freelance developer / indie hacker
- Experience: 2-7 years web development
- Stack: Next.js, Tailwind CSS, modern frameworks

**Psychographics:**
- Pragmatic, ships fast
- Design-conscious, wants professional results
- Community-oriented, shares work on Twitter/Reddit
- Cost-conscious, prefers free/affordable tools

**Goals:**
- Add polished visual effects to portfolio and side projects
- Create professional-looking products quickly
- Learn modern web development techniques
- Build impressive demos for potential clients

**Pain Points:**
- Limited time, needs solutions that work out of the box
- Design skills are good but not perfect
- Complex libraries have steep learning curves
- Budget constraints (can't hire designers)

**Success Criteria:**
- Works in <5 minutes from npm install
- Good documentation with copy-paste examples
- Looks professional without design skills
- Free or very affordable

**Quote:**
> "I saw squircle corners on Apple's website and want them on my portfolio. I don't want to spend a weekend figuring it out."

### Secondary Personas

#### 4. **Web Agency Developer**
- **Role:** Full-stack developer at web agency
- **Goals:** Deliver client projects efficiently
- **Pain Points:** Clients want modern design, limited budget per project
- **Success Criteria:** Fast implementation, reliable across browsers, client-friendly

#### 5. **Open Source Maintainer**
- **Role:** Maintains popular UI component library
- **Goals:** Add squircle support to existing components
- **Pain Points:** Need lightweight dependency, must work with existing architecture
- **Success Criteria:** Small bundle impact, tree-shakeable, well-tested

---

## Core Requirements

### Must Have (P0)

#### Functional Requirements

✅ **Progressive Enhancement**
- Automatically detect browser capabilities
- Use best available rendering tier
- Graceful degradation to border-radius
- No JavaScript errors in any browser

✅ **Framework Agnostic**
- Core library: Pure JavaScript (no dependencies)
- Works in vanilla JS, React, Vue, Svelte, Angular
- No framework-specific code in core

✅ **Performance**
- <5KB gzipped bundle size (core library)
- <10ms render time per element (Tier 3)
- <100ms initial load time
- Lazy loading with Intersection Observer
- Debounced resize handling

✅ **TypeScript Support**
- Full type definitions (.d.ts files)
- Strict mode compatible
- Exported types for all public APIs
- IntelliSense support in VSCode

✅ **Browser Support**
- 95%+ of global traffic (as of 2024)
- Modern browsers: Chrome, Firefox, Safari, Edge
- Mobile: iOS Safari 14+, Chrome Mobile
- Fallback: IE11 (border-radius only)

#### Non-Functional Requirements

✅ **API Design**
- Simple, intuitive API
- Consistent naming conventions
- Chainable methods where appropriate
- Error handling with helpful messages

✅ **Documentation**
- Comprehensive README with examples
- API reference with TypeScript signatures
- Migration guide from other solutions
- Video tutorials (nice to have)

✅ **Testing**
- >85% code coverage
- Unit tests (Vitest)
- Visual regression tests (Playwright)
- Cross-browser testing

✅ **Build System**
- Multiple output formats: UMD, ESM, CJS
- Source maps for debugging
- Minified and non-minified versions
- Tree-shakeable exports

---

### Should Have (P1)

#### Framework Integrations

🔲 **React Integration**
- `<Squircle>` component
- `useSquircle()` hook
- TypeScript support
- React 16.8+ compatibility

🔲 **Vue Integration**
- `<Squircle>` component
- Composables API
- TypeScript support
- Vue 3 compatibility

🔲 **Web Component**
- `<squircle-shape>` custom element
- Framework-agnostic
- Shadow DOM support
- Attribute-based configuration

#### Shopify Integration

🔲 **Theme App Extension**
- One-click installation from App Store
- Theme editor blocks (button, card, image)
- Liquid snippets
- Zero code required for merchants
- Works with all OS 2.0 themes

🔲 **Shopify Features**
- Metafield support for per-product settings
- Theme color scheme integration
- Responsive settings (mobile/tablet/desktop)
- Performance optimization for product pages

#### Advanced Features

🔲 **Animation Support**
- Smooth transitions between radius/smoothing values
- CSS transition compatibility
- JavaScript animation API
- Scroll-driven animations

🔲 **Responsive Configuration**
- Breakpoint-based radius
- Container query support
- Media query integration

---

### Nice to Have (P2)

🔲 **Visual Tools**
- Online playground/configurator
- Figma plugin for design handoff
- Storybook documentation
- CodePen/CodeSandbox examples

🔲 **Advanced Math**
- Custom superellipse exponents
- Asymmetric corners (different radius per corner)
- Path export for design tools

🔲 **Performance Analytics**
- Built-in performance monitoring
- Debug mode with render metrics
- Bundle size analyzer

---

## Success Metrics

### Launch Metrics (3 Months)

| Metric | Target | Measurement |
|--------|--------|-------------|
| NPM Downloads | 1,000/week | npm-stat.com |
| GitHub Stars | 500+ | GitHub API |
| Bundle Size | <5KB gzipped | bundlephobia.com |
| Test Coverage | >85% | Codecov |
| TypeScript Strict | 100% | tsc --noEmit |
| Browser Support | 95%+ users | caniuse.com |

### Growth Metrics (6 Months)

| Metric | Target | Measurement |
|--------|--------|-------------|
| NPM Downloads | 5,000/week | npm-stat.com |
| Production Sites | 100+ | Public GitHub dependents |
| Shopify Installs | 50+ merchants | Shopify Partner Dashboard |
| Documentation Visits | 1,000/month | Analytics |

### Quality Metrics (Ongoing)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lighthouse Performance | 100/100 | Lighthouse CI |
| Zero Runtime Errors | 99.9% | Sentry |
| Average Render Time | <10ms | Performance API |
| First Contentful Paint | <1s | Web Vitals |

---

## User Stories

### Developers

**Story 1: Quick Start**
```
As a frontend developer,
I want to add squircle corners to my buttons in under 5 minutes,
So that I can quickly prototype iOS-style designs.

Acceptance Criteria:
- Install via npm/yarn
- Import library
- Apply to element with one line of code
- See squircle corners immediately
```

**Story 2: Framework Integration**
```
As a React developer,
I want to use a <Squircle> component that works like native React,
So that it integrates seamlessly with my existing codebase.

Acceptance Criteria:
- Import React component
- Use standard React props
- TypeScript autocomplete works
- No performance degradation
```

**Story 3: TypeScript Support**
```
As a TypeScript developer,
I want full type definitions and IntelliSense,
So that I catch errors during development.

Acceptance Criteria:
- All APIs have type definitions
- IntelliSense shows parameter hints
- Strict mode compatible
- No 'any' types
```

### Shopify Merchants

**Story 4: Zero-Code Installation**
```
As a Shopify merchant,
I want to add squircle buttons without touching code,
So that I can improve my store's design myself.

Acceptance Criteria:
- Install from Shopify App Store
- Add blocks in theme editor
- Configure visually (sliders, color pickers)
- See changes in real-time preview
```

**Story 5: Theme Compatibility**
```
As a Shopify merchant using Dawn theme,
I want squircles to inherit my theme colors,
So that they match my existing design.

Acceptance Criteria:
- Automatically uses theme colors
- Respects theme spacing
- Works with theme customizer
- No layout conflicts
```

### Design System Teams

**Story 6: Multi-Framework Support**
```
As a design system engineer,
I want one library that works across React, Vue, and vanilla JS,
So that I don't maintain separate implementations.

Acceptance Criteria:
- Single source of truth
- Consistent API across frameworks
- Same visual output
- Shared configuration
```

---

## Technical Constraints

### Performance Constraints

- **Bundle Size:** Core library must be <5KB gzipped
- **Render Time:** <10ms per element on modern hardware
- **Memory:** No memory leaks, proper cleanup on destroy
- **FPS:** Animations maintain 60fps on mid-range devices

### Browser Constraints

- **No Polyfills:** Don't include polyfills in library (user responsibility)
- **Feature Detection:** Use feature detection, not browser detection
- **Graceful Degradation:** Always provide fallback

### Compatibility Constraints

- **Zero Dependencies:** Core library has zero runtime dependencies
- **Framework Versions:**
  - React: 16.8+ (hooks support)
  - Vue: 3.0+ only
  - TypeScript: 5.0+

### Deployment Constraints

- **NPM:** Must publish to npm registry
- **CDN:** Available via unpkg/jsdelivr
- **Shopify:** Comply with Theme App Extension requirements

---

## Out of Scope (V1)

❌ **Not included in initial release:**

- Angular integration (may add in v1.1)
- Svelte integration (may add in v1.1)
- Server-side rendering (SSR) support
- Custom path algorithms beyond superellipse
- Accessibility features beyond standard HTML
- Internationalization (i18n)
- Figma/Sketch plugins
- WordPress plugin
- CLI tool for code generation

---

## Dependencies

### External Dependencies

**Core Library:**
- None (zero dependencies)

**Development:**
- TypeScript 5.0+
- Rollup 4.0+ (bundler)
- Vitest (testing)
- Playwright (e2e testing)
- ESLint + Prettier (linting)

**Shopify Extension:**
- Shopify CLI 3.0+
- @shopify/app (dev dependency)

---

## Risks & Mitigation

### Technical Risks

**Risk 1: Browser Compatibility Issues**
- **Impact:** High
- **Probability:** Medium
- **Mitigation:** Comprehensive cross-browser testing, feature detection, graceful fallbacks

**Risk 2: Performance Degradation**
- **Impact:** High
- **Probability:** Low
- **Mitigation:** Performance budgets, lazy loading, debouncing, benchmarking

**Risk 3: Framework Updates Breaking Integrations**
- **Impact:** Medium
- **Probability:** Medium
- **Mitigation:** Pin peer dependency versions, automated testing, community feedback

### Business Risks

**Risk 4: Low Adoption**
- **Impact:** High
- **Probability:** Medium
- **Mitigation:** Strong documentation, examples, community engagement, Shopify app for distribution

**Risk 5: Competition from Native CSS**
- **Impact:** Medium
- **Probability:** High (inevitable)
- **Mitigation:** Position as polyfill, automatic upgrade path to native when available

---

## Timeline & Milestones

### Phase 1: Core Library (Weeks 1-2)
- ✅ Setup TypeScript project
- ✅ Implement superellipse math
- ✅ Build capability detector
- ✅ Create clip-path renderer
- ✅ Write unit tests (>85% coverage)

### Phase 2: Progressive Enhancement (Week 3)
- ⬜ Implement Houdini Paint Worklet
- ⬜ Add native CSS renderer
- ⬜ Create fallback renderer
- ⬜ Add tier selection logic
- ⬜ Performance benchmarks

### Phase 3: Framework Integrations (Week 4)
- ⬜ React component + hook
- ⬜ Vue component
- ⬜ Web Component
- ⬜ Documentation

### Phase 4: Shopify Integration (Weeks 5-6)
- ⬜ Setup Theme App Extension
- ⬜ Create Liquid blocks
- ⬜ Build theme editor schemas
- ⬜ Merchant documentation

### Phase 5: Testing & Polish (Week 7)
- ⬜ Visual regression tests
- ⬜ Cross-browser testing
- ⬜ Performance optimization
- ⬜ Bundle size optimization

### Phase 6: Launch (Week 8)
- ⬜ NPM publish
- ⬜ Documentation website
- ⬜ Shopify App Store submission
- ⬜ Marketing (Product Hunt, Twitter, Reddit)

---

## Open Questions

1. **Licensing:** MIT vs Apache 2.0?
   - **Decision:** MIT (more permissive, better for adoption)

2. **Package Naming:** `cornerkit`, `squircle-kit`, or `@cornerkit/core`?
   - **Decision:** `cornerkit` for simplicity, scoped packages for integrations

3. **React Peer Dependency:** Support React 16.8 or require 18+?
   - **Decision:** Support 16.8+ for wider compatibility

4. **Shopify Pricing:** Free or paid app?
   - **Decision:** Free with optional premium features later

---

## Appendix

### References

- [iOS Design Guidelines](https://developer.apple.com/design/)
- [Superellipse Mathematics](https://en.wikipedia.org/wiki/Superellipse)
- [CSS Houdini Paint API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Painting_API)
- [Shopify Theme App Extensions](https://shopify.dev/docs/apps/online-store/theme-app-extensions)

### Related Work

- [figma-squircle](https://github.com/PavelLaptev/figma-squircle) - Figma plugin
- [react-native-figma-squircle](https://github.com/evgenyrodionov/react-native-figma-squircle) - React Native only
- [smooth-corners](https://github.com/wopian/smooth-corners) - CSS Houdini only

### Glossary

- **Squircle:** A superellipse with exponent n=4, creating smooth continuous curves
- **Superellipse:** Mathematical curve defined by |x/a|^n + |y/b|^n = 1
- **Progressive Enhancement:** Design approach where basic functionality works everywhere, enhanced features for capable browsers
- **Tree-shaking:** Build optimization that removes unused code
