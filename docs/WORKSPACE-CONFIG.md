# cornerKit - Monorepo Workspace Configuration

**Version:** 1.0.0
**Last Updated:** 2025-01-08

---

## Overview

cornerKit uses a monorepo architecture with multiple packages managed by pnpm workspaces and Turborepo. This document provides complete configuration for setting up and managing the workspace.

---

## Directory Structure

```
cornerKit/
├── packages/
│   ├── core/                    # @cornerkit/core - Main library
│   ├── react/                   # @cornerkit/react - React integration
│   ├── vue/                     # @cornerkit/vue - Vue integration
│   ├── web-component/           # @cornerkit/web-component
│   └── shopify/                 # @cornerkit/shopify - Shopify extension
│
├── docs/                        # Documentation
│   ├── PRD.md
│   ├── TECH-STACK.md
│   ├── API-SPEC.md
│   ├── WORKSPACE-CONFIG.md
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── SHOPIFY.md
│   └── CLAUDE.md
│
├── examples/                    # Example implementations
│   ├── vanilla-js/
│   ├── react-app/
│   ├── vue-app/
│   └── shopify-theme/
│
├── .changeset/                  # Changesets config
├── .github/                     # GitHub Actions
├── .husky/                      # Git hooks
│
├── package.json                 # Root package.json
├── pnpm-workspace.yaml          # Workspace configuration
├── turbo.json                   # Turborepo configuration
├── tsconfig.json                # Root TypeScript config
├── .eslintrc.cjs                # Root ESLint config
├── .prettierrc                  # Prettier config
└── .gitignore                   # Git ignore rules
```

---

## Root Configuration Files

### `package.json`

```json
{
  "name": "cornerkit-monorepo",
  "version": "0.0.0",
  "private": true,
  "description": "cornerKit monorepo - iOS-style squircle corners for the web",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/cornerkit.git"
  },
  "license": "MIT",
  "author": "Your Name <your.email@example.com>",
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "test": "turbo run test",
    "test:visual": "turbo run test:visual",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "format": "prettier --write \"**/*.{ts,tsx,js,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,json,md}\"",
    "clean": "turbo run clean && rm -rf node_modules",
    "prepare": "husky install",
    "changeset": "changeset",
    "version": "changeset version",
    "publish:packages": "turbo run build && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "@types/node": "^20.10.6",
    "eslint": "^8.56.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "prettier": "^3.1.1",
    "turbo": "^1.11.0",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.12.1"
}
```

---

### `pnpm-workspace.yaml`

```yaml
packages:
  # All packages in the packages directory
  - 'packages/*'

  # Examples (optional, can be excluded from publishing)
  - 'examples/*'
```

---

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [
    "tsconfig.json",
    ".eslintrc.cjs"
  ],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        "dist/**",
        ".next/**",
        "!.next/cache/**"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "inputs": [
        "src/**/*.ts",
        "src/**/*.tsx",
        "tests/**/*.ts",
        "tests/**/*.tsx"
      ]
    },
    "test:visual": {
      "dependsOn": ["build"],
      "cache": false
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

---

### `tsconfig.json` (Root)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": false,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "incremental": true
  },
  "exclude": [
    "node_modules",
    "dist",
    "build",
    ".turbo"
  ]
}
```

---

### `.eslintrc.cjs`

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint',
    'import'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': ['warn', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true
    }],
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always',
      'alphabetize': {
        'order': 'asc',
        'caseInsensitive': true
      }
    }]
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    '.turbo',
    'coverage'
  ]
};
```

---

### `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf",
  "overrides": [
    {
      "files": "*.md",
      "options": {
        "proseWrap": "always"
      }
    }
  ]
}
```

---

### `.gitignore`

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
.next/
.turbo/

# Testing
coverage/
.vitest/
playwright-report/
test-results/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Misc
.cache/
.temp/
```

---

## Package Configurations

### Core Package (`packages/core/package.json`)

```json
{
  "name": "@cornerkit/core",
  "version": "1.0.0",
  "description": "iOS-style squircle corners for the web",
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "main": "./dist/cornerkit.js",
  "module": "./dist/cornerkit.esm.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/cornerkit.esm.js",
      "require": "./dist/cornerkit.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "@rollup/plugin-node-resolve": "^15.2.3",
    "@rollup/plugin-terser": "^0.4.4",
    "@rollup/plugin-typescript": "^11.1.5",
    "@types/node": "^20.10.6",
    "@vitest/coverage-v8": "^1.1.0",
    "@vitest/ui": "^1.1.0",
    "happy-dom": "^12.10.3",
    "rollup": "^4.9.0",
    "rollup-plugin-dts": "^6.1.0",
    "typescript": "^5.3.3",
    "vitest": "^1.1.0"
  },
  "keywords": [
    "squircle",
    "superellipse",
    "corner",
    "border-radius",
    "css",
    "houdini",
    "ios"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/cornerkit.git",
    "directory": "packages/core"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

---

### React Package (`packages/react/package.json`)

```json
{
  "name": "@cornerkit/react",
  "version": "1.0.0",
  "description": "React integration for cornerKit",
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "main": "./dist/index.js",
  "module": "./dist/index.esm.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "vitest run",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "clean": "rm -rf dist"
  },
  "peerDependencies": {
    "react": "^16.8.0 || ^17.0.0 || ^18.0.0",
    "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0"
  },
  "dependencies": {
    "@cornerkit/core": "workspace:*"
  },
  "devDependencies": {
    "@rollup/plugin-node-resolve": "^15.2.3",
    "@rollup/plugin-typescript": "^11.1.5",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "rollup": "^4.9.0",
    "typescript": "^5.3.3"
  },
  "keywords": [
    "react",
    "squircle",
    "cornerkit",
    "component"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/cornerkit.git",
    "directory": "packages/react"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

---

### Vue Package (`packages/vue/package.json`)

```json
{
  "name": "@cornerkit/vue",
  "version": "1.0.0",
  "description": "Vue 3 integration for cornerKit",
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "main": "./dist/index.js",
  "module": "./dist/index.esm.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "vitest run",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "clean": "rm -rf dist"
  },
  "peerDependencies": {
    "vue": "^3.0.0"
  },
  "dependencies": {
    "@cornerkit/core": "workspace:*"
  },
  "devDependencies": {
    "@rollup/plugin-node-resolve": "^15.2.3",
    "@rollup/plugin-typescript": "^11.1.5",
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/test-utils": "^2.4.3",
    "rollup": "^4.9.0",
    "typescript": "^5.3.3",
    "vue": "^3.3.0"
  },
  "keywords": [
    "vue",
    "vue3",
    "squircle",
    "cornerkit",
    "component"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/cornerkit.git",
    "directory": "packages/vue"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

---

### Shopify Package (`packages/shopify/package.json`)

```json
{
  "name": "@cornerkit/shopify",
  "version": "1.0.0",
  "private": true,
  "description": "Shopify Theme App Extension for cornerKit",
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "scripts": {
    "build": "shopify app build",
    "dev": "shopify app dev",
    "deploy": "shopify app deploy",
    "clean": "rm -rf .shopify"
  },
  "dependencies": {
    "@cornerkit/core": "workspace:*"
  },
  "devDependencies": {
    "@shopify/app": "^3.51.0",
    "@shopify/cli": "^3.51.0",
    "@shopify/theme": "^3.51.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/cornerkit.git",
    "directory": "packages/shopify"
  }
}
```

---

## Changesets Configuration

### `.changeset/config.json`

```json
{
  "$schema": "https://unpkg.com/@changesets/config@2.3.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": [
    "@cornerkit/shopify"
  ]
}
```

---

## Git Hooks (Husky)

### `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### `.husky/pre-push`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm type-check
pnpm test
```

### `lint-staged` Configuration (in root package.json)

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{js,json,md,yaml,yml}": [
      "prettier --write"
    ]
  }
}
```

---

## Development Workflow

### Initial Setup

```bash
# Install pnpm globally
npm install -g pnpm

# Clone repository
git clone https://github.com/yourusername/cornerkit.git
cd cornerkit

# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Development

```bash
# Start dev mode for all packages (parallel)
pnpm dev

# Start dev for specific package
pnpm --filter @cornerkit/core dev

# Run tests in watch mode
pnpm --filter @cornerkit/core test:watch
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @cornerkit/core build

# Clean all build artifacts
pnpm clean
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @cornerkit/react test

# Run visual regression tests
pnpm test:visual

# Coverage report
pnpm --filter @cornerkit/core test:coverage
```

### Linting & Formatting

```bash
# Lint all packages
pnpm lint

# Format all files
pnpm format

# Check formatting
pnpm format:check
```

---

## Publishing Workflow

### 1. Create Changeset

```bash
# Create a new changeset
pnpm changeset

# Follow prompts:
# - Select packages to bump
# - Choose version bump type (major/minor/patch)
# - Write summary of changes
```

### 2. Version Bump

```bash
# Update versions based on changesets
pnpm version

# This will:
# - Update package.json versions
# - Update dependencies
# - Generate CHANGELOG.md files
# - Remove consumed changesets
```

### 3. Publish

```bash
# Build and publish to NPM
pnpm publish:packages

# This will:
# - Build all packages
# - Publish to NPM
# - Create git tags
```

### 4. Git Workflow

```bash
# Commit version changes
git add .
git commit -m "chore: release packages"

# Push with tags
git push --follow-tags
```

---

## Internal Package Dependencies

### How it Works

Packages use `workspace:*` protocol for internal dependencies:

```json
{
  "dependencies": {
    "@cornerkit/core": "workspace:*"
  }
}
```

**During Development:**
- Always uses latest local version
- Changes in core instantly reflected in dependent packages
- No need to rebuild/reinstall

**During Publishing:**
- `workspace:*` is replaced with actual version number
- Example: `"@cornerkit/core": "^1.0.0"`
- Published packages reference correct NPM versions

---

## Continuous Integration

### GitHub Actions Workflows

**Location:** `.github/workflows/`

#### `ci.yml` - Main CI Pipeline

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build
```

#### `release.yml` - Release Pipeline

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    if: "!contains(github.event.head_commit.message, 'ci skip')"

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v2

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org'

      - run: pnpm install

      - run: pnpm build

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm publish:packages
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Troubleshooting

### Common Issues

**Issue:** `workspace:*` not resolving
**Solution:** Run `pnpm install` in root directory

**Issue:** TypeScript can't find types from other packages
**Solution:** Build the dependency first: `pnpm --filter @cornerkit/core build`

**Issue:** Turbo cache issues
**Solution:** Clear cache: `pnpm turbo run build --force`

**Issue:** Changesets not working
**Solution:** Ensure `.changeset` directory exists and config is valid

---

## Best Practices

1. **Always run `pnpm install` from root** - Never in individual packages
2. **Use filters for package-specific commands** - `pnpm --filter <package> <command>`
3. **Build dependencies first** - Turbo handles this automatically
4. **Create changesets for all changes** - Required for version management
5. **Test locally before pushing** - Run `pnpm test` and `pnpm build`
6. **Keep dependencies updated** - Use `pnpm update -r` regularly

---

## Summary

This monorepo configuration provides:

✅ **Unified Workspace** - All packages in one repository
✅ **Efficient Development** - Parallel builds, shared configs
✅ **Type Safety** - Shared TypeScript configuration
✅ **Automated Publishing** - Changesets for version management
✅ **Quality Assurance** - Linting, formatting, testing
✅ **CI/CD Integration** - GitHub Actions workflows
✅ **Internal Dependencies** - Seamless package linking

The configuration follows industry best practices and scales well as the project grows.
