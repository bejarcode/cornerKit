# Contributing to cornerKit

Thank you for your interest in contributing to cornerKit! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and considerate
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Assume good intentions
- Report unacceptable behavior to the maintainers

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- A code editor (VS Code recommended)

### Initial Setup

1. Fork the repository on GitHub

2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/cornerkit.git
cd cornerkit
```

3. Add upstream remote:
```bash
git remote add upstream https://github.com/cornerkit/cornerkit.git
```

4. Install dependencies:
```bash
npm install
```

5. Run development build:
```bash
npm run dev
```

6. Run tests:
```bash
npm test
```

### Monorepo Structure

cornerKit uses a monorepo structure with npm workspaces:

```
cornerkit/
├── packages/
│   ├── core/              # Main library
│   ├── react/             # React integration (future)
│   ├── vue/               # Vue integration (future)
│   └── web-component/     # Web Component (future)
├── examples/              # Usage examples
├── docs/                  # Documentation
└── specs/                 # Feature specifications
```

## Development Workflow

### Creating a Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/my-feature
```

### Development Commands

```bash
# Development mode (watch)
npm run dev

# Build for production
npm run build

# Run unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Check bundle size
npm run size
```

### Making Changes

1. Make your changes in small, focused commits
2. Write tests for new functionality
3. Ensure all tests pass: `npm test`
4. Update documentation if needed
5. Run linter: `npm run lint`
6. Build the project: `npm run build`

## Project Structure

```
packages/core/
├── src/
│   ├── core/
│   │   ├── detector.ts       # Browser capability detection
│   │   ├── registry.ts       # Element tracking
│   │   ├── config.ts         # Configuration
│   │   └── types.ts          # TypeScript types
│   ├── renderers/
│   │   ├── clippath.ts       # SVG clip-path renderer
│   │   └── fallback.ts       # border-radius fallback
│   ├── math/
│   │   ├── figma-squircle.ts # Figma algorithm
│   │   └── path-generator.ts # SVG path generation
│   ├── utils/
│   │   ├── validator.ts      # Input validation
│   │   └── logger.ts         # Development logging
│   └── index.ts              # Main entry point
├── tests/
│   ├── unit/                 # Unit tests (Vitest)
│   └── integration/          # Integration tests (Playwright)
├── dist/                     # Build output
├── package.json
├── tsconfig.json
├── rollup.config.js
└── vitest.config.ts
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Prefer `interface` over `type` for object shapes
- Use `const` assertions where appropriate
- Export types alongside implementations

```typescript
// Good
export interface SquircleConfig {
  radius: number;
  smoothing: number;
}

export function apply(element: Element, config: SquircleConfig): void {
  // Implementation
}
```

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Maximum line length: 100 characters
- Use trailing commas in multiline objects/arrays

```typescript
// Good
const config = {
  radius: 16,
  smoothing: 0.6,
};
```

### Naming Conventions

- `camelCase` for variables, functions, and methods
- `PascalCase` for classes, interfaces, and types
- `UPPER_SNAKE_CASE` for constants
- Prefix private methods with underscore: `_privateMethod()`

```typescript
const DEFAULT_RADIUS = 16;

interface SquircleConfig {
  radius: number;
}

class CornerKit {
  private _registry: WeakMap<Element, SquircleConfig>;

  public apply(element: Element): void {
    this._applyInternal(element);
  }

  private _applyInternal(element: Element): void {
    // Implementation
  }
}
```

### Comments

- Use JSDoc for public APIs
- Explain "why", not "what"
- Keep comments up-to-date

```typescript
/**
 * Apply squircle styling to an element
 *
 * @param element - DOM element to apply styling to
 * @param config - Squircle configuration
 * @throws {Error} If element is invalid
 */
export function apply(element: Element, config: SquircleConfig): void {
  // Use WeakMap to avoid memory leaks when elements are removed
  this._registry.set(element, config);
}
```

## Testing Guidelines

### Unit Tests

- Test one thing per test
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies

```typescript
import { describe, it, expect } from 'vitest';
import { smoothingToExponent } from './figma-squircle';

describe('smoothingToExponent', () => {
  it('should convert smoothing 0.6 to iOS 7 standard', () => {
    // Arrange
    const smoothing = 0.6;

    // Act
    const result = smoothingToExponent(smoothing);

    // Assert
    expect(result).toBeCloseTo(4.25);
  });
});
```

### Integration Tests

- Test real browser behavior
- Use Playwright for DOM interactions
- Test visual output when possible

```typescript
import { test, expect } from '@playwright/test';

test('should apply squircle to element', async ({ page }) => {
  await page.goto('http://localhost:3000/test');

  const element = page.locator('#test-element');
  const clipPath = await element.evaluate((el) =>
    window.getComputedStyle(el).clipPath
  );

  expect(clipPath).toContain('path');
});
```

### Coverage Requirements

- Unit tests: >90% coverage for core library
- Integration tests: >85% coverage for critical paths
- Run coverage: `npm run test:coverage`

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no functional changes)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling

**Examples:**

```
feat(clippath): add Figma algorithm implementation

Implements Figma's corner smoothing using arc + cubic bezier curves.
Each corner consists of 1 circular arc and 2 bezier curves for smooth transitions.

Default smoothing: 0.6 (iOS 7 standard per Figma API)

Refs: #123
```

```
fix(registry): prevent memory leak with WeakMap

Switched from Map to WeakMap for element tracking to allow garbage
collection when elements are removed from DOM.

Closes: #456
```

### Atomic Commits

- Each commit should be a single logical change
- Keep commits small and focused
- Commit often, push when ready

## Pull Request Process

### Before Submitting

1. Update your branch with latest upstream:
```bash
git fetch upstream
git rebase upstream/main
```

2. Ensure all tests pass:
```bash
npm test
npm run test:integration
```

3. Check build:
```bash
npm run build
```

4. Update documentation if needed

### Creating a Pull Request

1. Push your branch to your fork:
```bash
git push origin feature/my-feature
```

2. Create PR on GitHub with:
   - Clear title describing the change
   - Description explaining:
     - What changed and why
     - How to test the changes
     - Screenshots/GIFs if applicable
     - Breaking changes (if any)
   - Link to related issues

### PR Template

```markdown
## Description

Brief description of changes

## Motivation

Why this change is needed

## Changes

- Change 1
- Change 2

## Testing

How to test these changes:

1. Step 1
2. Step 2

## Screenshots

(if applicable)

## Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] All tests passing
- [ ] Build successful
- [ ] No lint errors
- [ ] Bundle size checked
```

### Review Process

- Maintainers will review your PR
- Address feedback by pushing new commits
- Once approved, maintainers will merge

## Release Process

Releases are handled by maintainers following semantic versioning:

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features, backwards compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes, backwards compatible

### Preparing for Release

1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Create git tag: `git tag -a v1.0.0 -m "Release v1.0.0"`
4. Push tag: `git push upstream v1.0.0`
5. Publish to npm: `npm publish`

## Development Tips

### Debugging

Enable debug mode:
```typescript
const ck = new CornerKit({ debug: true });
```

### Performance Profiling

Check render times:
```typescript
const ck = new CornerKit({ logPerformance: true });
```

### Bundle Size Analysis

```bash
npm run size
npm run analyze
```

### VS Code Extensions

Recommended extensions:
- ESLint
- Prettier
- TypeScript + JavaScript
- Playwright Test Runner

## Getting Help

- **Documentation**: [cornerkit.dev](https://cornerkit.dev)
- **Discussions**: [GitHub Discussions](https://github.com/cornerkit/cornerkit/discussions)
- **Issues**: [GitHub Issues](https://github.com/cornerkit/cornerkit/issues)

## Recognition

Contributors are recognized in:
- `CHANGELOG.md` for each release
- GitHub contributors page
- Release notes

Thank you for contributing to cornerKit! 🎉
