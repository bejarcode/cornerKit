# cornerKit - Technology Stack

**Version:** 1.0.0
**Last Updated:** 2025-01-08

---

## Overview

cornerKit uses a modern, performance-focused technology stack with zero runtime dependencies for the core library. The project is structured as a monorepo with separate packages for the core library and Shopify integration.

---

## Monorepo Structure

### Package Manager: **pnpm** (Recommended)

**Why pnpm:**
- ✅ Faster installation (disk space efficient)
- ✅ Strict dependency resolution (avoids phantom dependencies)
- ✅ Native workspace support
- ✅ Better performance than npm/yarn

**Alternative:** npm workspaces (if pnpm not available)

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

### Build Orchestration: **Turborepo** (Optional)

**Why Turborepo:**
- ✅ Parallel builds across packages
- ✅ Intelligent caching
- ✅ Remote caching support
- ✅ Task pipeline orchestration

**Alternative:** npm scripts with `concurrently`

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false
    }
  }
}
```

---

## Core Library (`packages/core`)

### Language: **TypeScript 5.0+**

**Configuration:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": false,
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

**Why TypeScript:**
- ✅ Type safety for library consumers
- ✅ Better IDE support (IntelliSense)
- ✅ Self-documenting code
- ✅ Catch errors at compile time

### Bundler: **Rollup 4.0+**

**Plugins:**
```json
{
  "devDependencies": {
    "rollup": "^4.9.0",
    "@rollup/plugin-typescript": "^11.1.5",
    "@rollup/plugin-node-resolve": "^15.2.3",
    "@rollup/plugin-terser": "^0.4.4",
    "rollup-plugin-dts": "^6.1.0"
  }
}
```

**Output Formats:**
1. **ESM (ES Modules)** - `dist/cornerkit.esm.js`
   - Modern imports: `import CornerKit from 'cornerkit'`
   - Tree-shakeable
   - Target: ES2020

2. **UMD (Universal Module Definition)** - `dist/cornerkit.js`
   - Browser `<script>` tags
   - Global: `window.CornerKit`
   - Target: ES2015 (broader compatibility)

3. **CJS (CommonJS)** - `dist/cornerkit.cjs`
   - Node.js `require()`
   - Server-side usage
   - Target: ES2015

4. **Type Definitions** - `dist/index.d.ts`
   - TypeScript type declarations
   - Bundled with rollup-plugin-dts

**Rollup Configuration:**
```javascript
export default [
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/cornerkit.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      typescript({
        declaration: false
      }),
      resolve(),
      terser()
    ]
  },
  // UMD build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/cornerkit.js',
      format: 'umd',
      name: 'CornerKit',
      sourcemap: true
    },
    plugins: [
      typescript({
        declaration: false
      }),
      resolve(),
      terser()
    ]
  },
  // Type definitions
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
];
```

**Why Rollup:**
- ✅ Best for libraries (vs webpack for apps)
- ✅ Tree-shaking built-in
- ✅ Multiple output formats
- ✅ Smaller bundles than webpack

### Testing Framework: **Vitest**

**Dependencies:**
```json
{
  "devDependencies": {
    "vitest": "^1.1.0",
    "@vitest/ui": "^1.1.0",
    "@vitest/coverage-v8": "^1.1.0",
    "happy-dom": "^12.10.3"
  }
}
```

**Configuration:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts'
      ],
      threshold: {
        branches: 85,
        functions: 85,
        lines: 85,
        statements: 85
      }
    }
  }
});
```

**Why Vitest:**
- ✅ Fast (uses Vite under the hood)
- ✅ Jest-compatible API
- ✅ Native TypeScript support
- ✅ Built-in coverage
- ✅ Watch mode

### E2E Testing: **Playwright**

**Dependencies:**
```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "playwright": "^1.40.0"
  }
}
```

**Configuration:**
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ]
});
```

**Why Playwright:**
- ✅ Cross-browser testing (Chrome, Firefox, Safari)
- ✅ Visual regression testing
- ✅ Modern API
- ✅ Fast execution
- ✅ Auto-wait for elements

### Linting: **ESLint 8+**

**Dependencies:**
```json
{
  "devDependencies": {
    "eslint": "^8.56.0",
    "@typescript-eslint/parser": "^6.18.0",
    "@typescript-eslint/eslint-plugin": "^6.18.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.29.1"
  }
}
```

**Configuration:**
```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
```

### Formatting: **Prettier**

**Configuration:**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

### Documentation: **TypeDoc**

**Dependencies:**
```json
{
  "devDependencies": {
    "typedoc": "^0.25.6"
  }
}
```

**Configuration:**
```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs",
  "exclude": ["**/*.test.ts"],
  "plugin": ["typedoc-plugin-markdown"]
}
```

---

## Framework Integrations

### React Integration (`packages/react`)

**Dependencies:**
```json
{
  "peerDependencies": {
    "react": "^16.8.0 || ^17.0.0 || ^18.0.0",
    "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0"
  },
  "dependencies": {
    "@cornerkit/core": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.5"
  }
}
```

**Why these versions:**
- ✅ Support React 16.8+ (hooks)
- ✅ Works with React 17 and 18
- ✅ Peer dependencies (not bundled)

### Vue Integration (`packages/vue`)

**Dependencies:**
```json
{
  "peerDependencies": {
    "vue": "^3.0.0"
  },
  "dependencies": {
    "@cornerkit/core": "workspace:*"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/test-utils": "^2.4.3"
  }
}
```

**Why Vue 3 only:**
- ✅ Composition API
- ✅ Better TypeScript support
- ✅ Smaller bundle size

### Web Component (`packages/web-component`)

**Dependencies:**
```json
{
  "dependencies": {
    "@cornerkit/core": "workspace:*"
  }
}
```

**Target:**
- ES2020 (native custom elements)
- No polyfills (user responsibility)

---

## Shopify Extension (`packages/shopify`)

### Platform: **Shopify Theme App Extension**

**Requirements:**
- Shopify CLI 3.0+
- Online Store 2.0 theme compatibility
- App Bridge 3.0+

**Dependencies:**
```json
{
  "dependencies": {
    "@cornerkit/core": "workspace:*"
  },
  "devDependencies": {
    "@shopify/cli": "^3.51.0",
    "@shopify/app": "^3.51.0",
    "@shopify/theme": "^3.51.0"
  }
}
```

### Languages

**Liquid Templates:**
- Shopify's templating language
- Used for blocks and snippets
- Server-side rendering

**JavaScript:**
- Client-side initialization
- Theme editor integration
- Event handling

**CSS:**
- Component styles
- Theme integration
- Responsive design

### Extension Structure

```
extensions/cornerkit-theme/
├── assets/
│   ├── cornerkit.min.js       # From @cornerkit/core
│   ├── cornerkit-init.js      # Shopify initialization
│   └── cornerkit-styles.css   # Component styles
│
├── blocks/
│   ├── squircle-button.liquid
│   ├── squircle-card.liquid
│   └── squircle-image.liquid
│
├── snippets/
│   ├── squircle.liquid
│   └── squircle-wrapper.liquid
│
├── locales/
│   ├── en.default.json
│   ├── es.json
│   └── fr.json
│
└── config/
    └── settings_schema.json
```

---

## Development Tools

### Version Management: **Changesets**

**Why Changesets:**
- ✅ Manages versions across monorepo packages
- ✅ Automatic changelog generation
- ✅ Semantic versioning
- ✅ GitHub integration

**Configuration:**
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
  "ignore": []
}
```

### Git Hooks: **Husky + lint-staged**

**Dependencies:**
```json
{
  "devDependencies": {
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0"
  }
}
```

**Configuration:**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

**Hooks:**
- `pre-commit`: Run lint-staged
- `pre-push`: Run tests
- `commit-msg`: Validate commit message format

---

## CI/CD Pipeline

### Platform: **GitHub Actions**

### Workflows

#### 1. **Test & Lint** (on every push)
```yaml
name: Test & Lint

on: [push, pull_request]

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
      - run: pnpm install
      - run: pnpm test
      - run: pnpm lint
      - run: pnpm type-check
```

#### 2. **Visual Regression Tests** (on PR)
```yaml
name: Visual Tests

on: [pull_request]

jobs:
  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: npx playwright install --with-deps
      - run: pnpm test:visual
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

#### 3. **Publish to NPM** (on release tag)
```yaml
name: Publish

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm install
      - run: pnpm build
      - run: pnpm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### 4. **Deploy Shopify Extension** (on main merge)
```yaml
name: Deploy Shopify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g @shopify/cli
      - run: shopify app deploy
        env:
          SHOPIFY_CLI_TOKEN: ${{ secrets.SHOPIFY_TOKEN }}
```

---

## Performance Monitoring

### Bundle Analysis: **bundlephobia**

- Automatic size checks on PRs
- Track bundle size over time
- Fail build if >5KB gzipped

### Performance Testing: **Lighthouse CI**

```yaml
# .lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:5173"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1000 }]
      }
    }
  }
}
```

### Error Tracking: **Sentry** (Optional)

- Runtime error monitoring
- Performance metrics
- User feedback

---

## Documentation Website

### Framework: **VitePress**

**Why VitePress:**
- ✅ Fast (Vite-powered)
- ✅ Markdown-based
- ✅ Vue 3 components in docs
- ✅ Built-in search

**Structure:**
```
docs/
├── .vitepress/
│   ├── config.ts
│   └── theme/
├── guide/
│   ├── getting-started.md
│   ├── installation.md
│   └── usage.md
├── api/
│   ├── core.md
│   ├── react.md
│   └── vue.md
└── examples/
    ├── basic.md
    └── advanced.md
```

### Hosting: **Vercel** or **Netlify**

- Automatic deployments from main branch
- Preview deployments for PRs
- Custom domain support

---

## Package Publishing

### NPM Registry

**Package Names:**
- `@cornerkit/core` - Core library
- `@cornerkit/react` - React integration
- `@cornerkit/vue` - Vue integration
- `@cornerkit/web-component` - Web Component

### CDN Distribution

**unpkg:**
```html
<script src="https://unpkg.com/@cornerkit/core@latest/dist/cornerkit.js"></script>
```

**jsDelivr:**
```html
<script src="https://cdn.jsdelivr.net/npm/@cornerkit/core@latest/dist/cornerkit.js"></script>
```

---

## Summary

### Core Dependencies (Zero Runtime Dependencies)
```json
{
  "dependencies": {}
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "typescript": "^5.3.3",
    "rollup": "^4.9.0",
    "@rollup/plugin-typescript": "^11.1.5",
    "vitest": "^1.1.0",
    "@playwright/test": "^1.40.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "turbo": "^1.11.0",
    "@changesets/cli": "^2.27.0"
  }
}
```

### Browser Targets
- **Modern Browsers:** ES2020
- **Legacy Support:** ES2015 (UMD build)
- **TypeScript:** ES2020 + DOM libs

### Bundle Size Goals
- **Core Library:** <5KB gzipped
- **React Integration:** <2KB additional
- **Vue Integration:** <2KB additional
- **Total (with core):** <9KB for any integration
