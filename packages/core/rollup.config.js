import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import dts from 'rollup-plugin-dts';

const production = process.env.NODE_ENV === 'production';

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
      production && terser({
        compress: {
          passes: 2,
          pure_getters: true,
          unsafe: true,
        },
        mangle: {
          properties: false,
        },
      }),
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
      production && terser({
        compress: {
          passes: 2,
          pure_getters: true,
          unsafe: true,
        },
        mangle: {
          properties: false,
        },
      }),
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
      production && terser({
        compress: {
          passes: 2,
          pure_getters: true,
          unsafe: true,
        },
        mangle: {
          properties: false,
        },
      }),
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
