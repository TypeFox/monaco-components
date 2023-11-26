import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'monaco-editor-wrapper',
            fileName: () => 'index.js',
            formats: ['es']
        },
        outDir: 'bundle',
        assetsDir: 'bundle/assets',
        emptyOutDir: true,
        cssCodeSplit: false,
        sourcemap: true,
        rollupOptions: {
            output: {
                name: 'monaco-editor-wrapper',
                exports: 'named',
                assetFileNames: (assetInfo) => {
                    return `assets/${assetInfo.name}`;
                }
            }
        }
    }
});
