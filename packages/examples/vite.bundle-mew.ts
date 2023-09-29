import { resolve } from 'path';
import { defineConfig } from 'vite';

const config = defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, './src/verifyPrepare.ts'),
            name: 'mew',
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
                name: 'mew',
                exports: 'named',
                sourcemap: true,
                assetFileNames: (assetInfo) => {
                    return `assets/${assetInfo.name}`;
                }
            }
        }
    }
});

export default config;
