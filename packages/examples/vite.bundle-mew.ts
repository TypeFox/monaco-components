import { resolve } from 'path';
import { defineConfig } from 'vite';

const config = defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, './src/verifyPrepare.ts'),
            name: 'mer',
            fileName: () => 'mew.js',
            formats: ['es']
        },
        outDir: resolve(__dirname, 'libs/monaco-editor-wrapper'),
        assetsDir: resolve(__dirname, 'libs/monaco-editor-wrapper/assets'),
        emptyOutDir: true,
        cssCodeSplit: false,
        commonjsOptions: {
            strictRequires: true
        },
        rollupOptions: {
            output: {
                name: 'mer',
                exports: 'named',
                sourcemap: false,
                assetFileNames: (assetInfo) => {
                    return `assets/${assetInfo.name}`;
                }
            }
        }
    },
    resolve: {
        alias: {
            path: 'path-browserify'
        }
    },
    assetsInclude: ['**/*.wasm']
});

export default config;
