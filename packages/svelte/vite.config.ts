import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    svelte(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.svelte'],
      outDir: 'dist',
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CornerKitSvelte',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'cornerkit-svelte.esm.js';
        if (format === 'cjs') return 'cornerkit-svelte.js';
        if (format === 'umd') return 'cornerkit-svelte.umd.js';
        return `cornerkit-svelte.${format}.js`;
      },
    },
    rollupOptions: {
      external: ['svelte', 'svelte/internal', '@cornerkit/core'],
      output: {
        globals: {
          svelte: 'Svelte',
          'svelte/internal': 'SvelteInternal',
          '@cornerkit/core': 'CornerKit',
        },
        exports: 'named',
      },
    },
    sourcemap: true,
    minify: false,
  },
  resolve: {
    dedupe: ['svelte'],
  },
});
