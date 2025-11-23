import typescript from '@rollup/plugin-typescript';
import vue from 'rollup-plugin-vue';
import dts from 'rollup-plugin-dts';

const external = ['vue', '@cornerkit/core'];

export default [
  // ESM and CJS builds
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/cornerkit-vue.esm.js',
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/cornerkit-vue.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
    ],
    external,
    plugins: [
      vue(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationDir: undefined,
      }),
    ],
  },
  // UMD build for browser
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/cornerkit-vue.umd.js',
      format: 'umd',
      name: 'CornerKitVue',
      sourcemap: true,
      globals: {
        vue: 'Vue',
        '@cornerkit/core': 'CornerKit',
      },
    },
    external,
    plugins: [
      vue(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationDir: undefined,
      }),
    ],
  },
  // Type definitions
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm',
    },
    external,
    plugins: [dts()],
  },
];
