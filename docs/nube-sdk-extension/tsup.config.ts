import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.tsx'],
    format: ['esm'],
    minify: true,
    clean: true,
    bundle: true,
    noExternal: [/(.*)/], // bundle everything
    outExtension: () => ({ js: '.global.js' })
});
