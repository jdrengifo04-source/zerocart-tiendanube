import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.tsx'],
    format: ['iife'],
    globalName: 'ZeroCartExtension',
    minify: true,
    clean: true,
    noExternal: [/(.*)/] // bundle everything
});
