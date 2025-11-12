# Contributing to CornerKit

Thank you for your interest in contributing to CornerKit! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Code Style](#code-style)
- [Project Structure](#project-structure)

---

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- **Be respectful**: Treat everyone with respect and kindness
- **Be collaborative**: Work together to improve the project
- **Be constructive**: Provide helpful feedback and suggestions
- **Be inclusive**: Welcome contributors of all backgrounds and experience levels

## Getting Started

### Prerequisites

- **Node.js**: 16.0.0 or higher
- **npm**: 7.0.0 or higher
- **Git**: 2.20.0 or higher

### Initial Setup

1. **Fork the repository**:
   ```bash
   # Click "Fork" button on GitHub
   ```

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/cornerkit.git
   cd cornerkit/packages/core
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Verify setup**:
   ```bash
   npm test                  # Run unit tests
   npm run build             # Build production bundle
   npm run type-check        # Run TypeScript compiler
   ```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/my-new-feature
# or
git checkout -b fix/bug-description
```

**Branch naming conventions**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add/update tests for your changes
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run integration tests
npm run test:integration

# Check test coverage
npm run test:coverage

# Run type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <description>
git commit -m "feat(api): add support for individual corner radii"
git commit -m "fix(clippath): resolve rounding errors in path generation"
git commit -m "docs(readme): update API examples"
```

**Commit types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or modifications
- `chore`: Maintenance tasks

---

## Testing

### Unit Tests

Unit tests use **Vitest** and **happy-dom**:

```bash
npm test                    # Run all unit tests
npm test -- validator       # Run specific test file
npm run test:coverage       # Generate coverage report
```

**Writing unit tests**:

```typescript
import { describe, it, expect } from 'vitest';
import { validateRadius } from '../utils/validator';

describe('validateRadius', () => {
  it('should clamp negative values to 0', () => {
    expect(validateRadius(-5)).toBe(0);
  });

  it('should return valid radius unchanged', () => {
    expect(validateRadius(20)).toBe(20);
  });
});
```

### Integration Tests

Integration tests use **Playwright**:

```bash
npm run test:integration        # Run all integration tests
npm run test:integration:ui     # Run with UI mode
```

**Writing integration tests**:

```typescript
import { test, expect } from '@playwright/test';

test('should apply squircle to element', async ({ page }) => {
  await page.goto('/tests/integration/fixtures/test-page.html');

  await page.evaluate(() => {
    const el = document.getElementById('test-element');
    window.ck.apply(el, { radius: 20, smoothing: 0.8 });
  });

  const clipPath = await page.evaluate(() => {
    const el = document.getElementById('test-element');
    return window.getComputedStyle(el).clipPath;
  });

  expect(clipPath).toContain('path(');
});
```

### Test Coverage Requirements

- **Core rendering logic**: >90% coverage
- **Integration code**: >85% coverage
- **All new code**: Must include tests

---

## Submitting Changes

### 1. Push Your Branch

```bash
git push origin feature/my-new-feature
```

### 2. Create a Pull Request

1. Go to the [CornerKit repository](https://github.com/cornerkit/cornerkit)
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template:
   - **Description**: What changes were made and why
   - **Related Issues**: Link any related issues
   - **Testing**: How you tested your changes
   - **Screenshots**: If applicable

### 3. PR Checklist

Before submitting, ensure:

- [ ] Tests pass (`npm test` and `npm run test:integration`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Lint passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main
- [ ] No merge conflicts
- [ ] Bundle size is within limits (`npm run verify-bundle-size`)
- [ ] Security checks pass (no eval, innerHTML, network requests)

### 4. Code Review Process

- A maintainer will review your PR
- Address any feedback or requested changes
- Once approved, your PR will be merged

---

## Code Style

### TypeScript Guidelines

- **Use TypeScript strict mode**: All code must type-check
- **Explicit types**: Prefer explicit types over inference
- **No `any`**: Avoid `any` type unless absolutely necessary
- **Interfaces over types**: Use interfaces for object shapes

```typescript
// Good
interface SquircleConfig {
  radius: number;
  smoothing: number;
}

function apply(element: HTMLElement, config: SquircleConfig): void {
  // implementation
}

// Avoid
function apply(element: any, config: any) {
  // implementation
}
```

### Code Formatting

We use **Prettier** for consistent formatting:

```bash
npm run format
```

Configuration (`.prettierrc`):
- **Indent**: 2 spaces
- **Line width**: 100 characters
- **Quotes**: Single quotes
- **Semicolons**: Yes
- **Trailing commas**: ES5

### Naming Conventions

- **Variables/Functions**: camelCase (`validateRadius`, `updateClipPath`)
- **Classes**: PascalCase (`CornerKit`, `ClipPathRenderer`)
- **Constants**: SCREAMING_SNAKE_CASE (`DEFAULT_CONFIG`, `MAX_RADIUS`)
- **Private members**: Prefix with `_` (`_registry`, `_detector`)
- **Types/Interfaces**: PascalCase (`SquircleConfig`, `RendererTier`)

---

## Project Structure

```
packages/core/
├── src/
│   ├── core/
│   │   ├── config.ts         # Default configuration
│   │   ├── detector.ts       # Browser capability detection
│   │   └── registry.ts       # Element tracking
│   ├── renderers/
│   │   ├── clippath.ts       # Tier 3: SVG clip-path
│   │   ├── fallback.ts       # Tier 4: border-radius
│   │   ├── houdini.ts        # Tier 2: Paint API (Phase 2)
│   │   └── native.ts         # Tier 1: CSS corner-shape (Phase 2)
│   ├── math/
│   │   ├── superellipse.ts   # Superellipse formula
│   │   └── path-generator.ts # SVG path generation
│   ├── utils/
│   │   ├── validator.ts      # Input validation
│   │   └── logger.ts         # Development warnings
│   └── index.ts              # Main entry point
├── tests/
│   ├── unit/                 # Unit tests (Vitest)
│   └── integration/          # Integration tests (Playwright)
├── dist/                     # Build output (generated)
├── scripts/                  # Build and utility scripts
├── rollup.config.js          # Rollup bundler configuration
├── vitest.config.ts          # Vitest test configuration
├── playwright.config.ts      # Playwright test configuration
└── tsconfig.json             # TypeScript configuration
```

---

## Performance Guidelines

- **Bundle size**: Core library must be <5KB gzipped
- **Render time**: <10ms per element for Tier 3 (clip-path)
- **Initialization**: <100ms total
- **Memory**: Use WeakMap for element registry (automatic GC)
- **Cleanup**: Always clean up ResizeObserver on remove/destroy

---

## Security Guidelines

- **No eval or Function**: Never use `eval()` or `new Function()`
- **No innerHTML**: Use safe DOM APIs only
- **Input validation**: Always validate user input
- **No network requests**: Library must work offline
- **No data storage**: No localStorage, sessionStorage, or cookies
- **CSP compatible**: Must work with strict Content Security Policies

---

## Documentation Guidelines

- **JSDoc comments**: Document all public APIs
- **Examples**: Include usage examples in documentation
- **README updates**: Update README for API changes
- **CHANGELOG**: Add entries for all user-facing changes

```typescript
/**
 * Applies a squircle effect to the specified element.
 *
 * @param element - The HTML element to apply the squircle to
 * @param config - Configuration options for the squircle
 * @returns void
 *
 * @example
 * ```typescript
 * const ck = new CornerKit();
 * ck.apply('.button', { radius: 20, smoothing: 0.8 });
 * ```
 */
apply(element: HTMLElement | string, config?: Partial<SquircleConfig>): void {
  // implementation
}
```

---

## Release Process

*Note: This section is for maintainers only.*

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. GitHub Actions will automatically publish to npm

---

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/cornerkit/cornerkit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cornerkit/cornerkit/discussions)
- **Documentation**: [README.md](README.md)

---

## License

By contributing to CornerKit, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to CornerKit! Your efforts help make the web more beautiful. 🎨
