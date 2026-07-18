import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import dts from 'rollup-plugin-dts';
import { writeFileSync } from 'node:fs';

// Aggressive terser configuration for maximum bundle size optimization
const terserConfig = {
  compress: {
    passes: 3,
    pure_getters: true,
    unsafe: true,
    unsafe_arrows: true,
    unsafe_methods: true,
    unsafe_proto: true,
    drop_console: false, // Keep console.warn/error for production
    drop_debugger: true,
    ecma: 2020,
    module: true,
    toplevel: true,
    keep_fargs: false,
    keep_infinity: true,
  },
  mangle: {
    properties: false, // Don't mangle properties to preserve API
    toplevel: true, // Mangle top-level variables
  },
  format: {
    comments: false, // Remove all comments
    ecma: 2020,
  },
};

// Flatten the default export so consumers get the class directly:
// - UMD: window.CornerKit is the CornerKit class (not { default: class })
// - CJS: require('@cornerkit/core') returns the class (not { default: class })
// Named exports are attached to the class as static properties.
// `default` is kept self-referential for interop with default-import tooling.
// ES2020 baseline (see tsconfig target): every runtime that can parse the
// bundle has globalThis, so no existence check is needed.
const umdFlattenFooter =
  ';(function(g){var m=g.CornerKit;if(m&&m.default){var d=m.default;' +
  'for(var k in m)k!=="default"&&(d[k]=m[k]);d.default=d;g.CornerKit=d}})(globalThis);';

const cjsFlattenFooter =
  'if(typeof module!="undefined"&&module.exports&&module.exports.default){' +
  'var __ck=module.exports.default;for(var __k in module.exports)' +
  '__k!=="default"&&(__ck[__k]=module.exports[__k]);__ck.default=__ck;module.exports=__ck}';

// CJS runtime entry that picks the dev or prod bundle based on NODE_ENV,
// so Node/CJS consumers get development warnings in development (F5).
// ESM consumers get the same via the "development" export condition.
const cjsEntrySource = `'use strict';
if (process.env.NODE_ENV === 'development') {
  module.exports = require('./cornerkit.dev.cjs');
} else {
  module.exports = require('./cornerkit.cjs');
}
`;

const emitCjsEntry = {
  name: 'emit-cjs-entry',
  writeBundle() {
    writeFileSync(new URL('./dist/index.cjs', import.meta.url), cjsEntrySource);
  },
};

// Build-time environment baked into a bundle ('production' | 'development')
const makePlugins = (env) => [
  replace({
    'process.env.NODE_ENV': JSON.stringify(env),
    preventAssignment: true,
  }),
  // Bracket-notation variant (used in logger.ts to satisfy
  // noPropertyAccessFromIndexSignature). Needs empty delimiters because the
  // default \b word-boundary delimiters never match after "]".
  replace({
    "process.env['NODE_ENV']": JSON.stringify(env),
    delimiters: ['', ''],
    preventAssignment: true,
  }),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: false, // Types handled by separate config
  }),
];

const input = 'src/index.ts';
const external = []; // Zero dependencies

export default [
  // ===== Production bundles (minified, dev warnings stripped) =====
  // One TypeScript compile shared by all three output formats.
  {
    input,
    external,
    plugins: [...makePlugins('production'), terser(terserConfig), emitCjsEntry],
    output: [
      {
        file: 'dist/cornerkit.esm.js',
        format: 'es',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: 'dist/cornerkit.js',
        format: 'umd',
        name: 'CornerKit',
        sourcemap: true,
        exports: 'named',
        footer: umdFlattenFooter,
      },
      {
        file: 'dist/cornerkit.cjs',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        footer: cjsFlattenFooter,
      },
    ],
  },

  // ===== Development bundles (unminified, dev warnings included) =====
  // Served via the "development" export condition (Vite, webpack, modern
  // bundlers) and the dist/index.cjs runtime switch for Node/CJS consumers.
  {
    input,
    external,
    plugins: makePlugins('development'),
    output: [
      {
        file: 'dist/cornerkit.esm.dev.js',
        format: 'es',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: 'dist/cornerkit.dev.cjs',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        footer: cjsFlattenFooter,
      },
    ],
  },

  // ===== TypeScript definitions (shared by dev and prod) =====
  // Emitted twice: .d.ts for the import condition, .d.cts for the require
  // condition (needed because "type": "module" makes .d.ts ESM-typed under
  // node16 module resolution).
  {
    input,
    output: [
      { file: 'dist/index.d.ts', format: 'es' },
      { file: 'dist/index.d.cts', format: 'es' },
    ],
    plugins: [dts()],
  },
];
