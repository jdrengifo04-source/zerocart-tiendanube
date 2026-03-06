import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.tsx'],
    format: ['iife'],
    target: 'es2020',
    clean: true,
    minify: true, // Tiendanube recommends minifying
    sourcemap: false,
    outExtension: () => ({ js: '.global.js' }),
});
