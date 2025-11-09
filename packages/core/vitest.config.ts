import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    environmentOptions: {
      happyDOM: {
        settings: {
          disableComputedStyleRendering: false,
        },
      },
    },
    env: {
      NODE_ENV: 'development',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '*.config.*',
        'examples/',
      ],
      thresholds: {
        // Core rendering logic: >90% coverage
        'src/core/': {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
        'src/math/': {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
        'src/renderers/': {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
        // Integration code: >85% coverage
        'src/utils/': {
          lines: 85,
          functions: 85,
          branches: 85,
          statements: 85,
        },
      },
    },
  },
});
