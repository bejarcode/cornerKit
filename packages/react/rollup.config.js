import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const external = ['react', 'react/jsx-runtime', '@cornerkit/core'];

export default [
  // ESM and CJS builds
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/cornerkit-react.esm.js',
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/cornerkit-react.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
    ],
    external,
    plugins: [
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
      file: 'dist/cornerkit-react.umd.js',
      format: 'umd',
      name: 'CornerKitReact',
      sourcemap: true,
      globals: {
        react: 'React',
        'react/jsx-runtime': 'jsxRuntime',
        '@cornerkit/core': 'CornerKit',
      },
    },
    external,
    plugins: [
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
