import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      outDir: 'dist',
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CornerKitVue',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'cornerkit-vue.esm.js';
        if (format === 'cjs') return 'cornerkit-vue.js';
        if (format === 'umd') return 'cornerkit-vue.umd.js';
        return `cornerkit-vue.${format}.js`;
      },
    },
    rollupOptions: {
      external: ['vue', '@cornerkit/core'],
      output: {
        globals: {
          vue: 'Vue',
          '@cornerkit/core': 'CornerKit',
        },
        exports: 'named',
      },
    },
    sourcemap: true,
    minify: false,
  },
});
