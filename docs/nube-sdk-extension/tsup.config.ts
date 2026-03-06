import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.tsx'],
    format: ['iife'],
    globalName: 'NubeSDKCheckoutExtension',
    outExtension() {
        return {
            js: '.global.js',
        }
    },
    clean: true,
    dts: false,
    minify: true,
    platform: 'browser',
    noExternal: [/.*/], // Bundle all dependencies
    treeshake: true,
    replaceNodeEnv: true,
});
