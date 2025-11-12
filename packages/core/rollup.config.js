import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import dts from 'rollup-plugin-dts';

const production = process.env.NODE_ENV === 'production';

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

const baseConfig = {
  input: 'src/index.ts',
  external: [], // Zero dependencies
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
      preventAssignment: true,
    }),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false, // Types handled by separate config
    }),
  ],
};

export default [
  // ESM build
  {
    ...baseConfig,
    output: {
      file: 'dist/cornerkit.esm.js',
      format: 'es',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
      ...baseConfig.plugins,
      production && terser(terserConfig),
    ].filter(Boolean),
  },

  // UMD build
  {
    ...baseConfig,
    output: {
      file: 'dist/cornerkit.js',
      format: 'umd',
      name: 'CornerKit',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
      ...baseConfig.plugins,
      production && terser(terserConfig),
    ].filter(Boolean),
  },

  // CommonJS build
  {
    ...baseConfig,
    output: {
      file: 'dist/cornerkit.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
      ...baseConfig.plugins,
      production && terser(terserConfig),
    ].filter(Boolean),
  },

  // TypeScript definitions
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
