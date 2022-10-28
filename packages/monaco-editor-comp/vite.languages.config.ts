import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/indexAllLanguages.ts'),
            name: 'monaco-editor-comp-languages',
            fileName: () => 'indexAllLanguages.js',
            formats: ['es']
        },
        outDir: 'bundle',
        assetsDir: 'bundle/assets',
        emptyOutDir: false,
        cssCodeSplit: false,
        rollupOptions: {
            external: [
                'monaco-editor-workers'
            ],
            output: {
                inlineDynamicImports: true,
                name: 'monaco-editor-comp-languages',
                exports: 'named',
                sourcemap: false,
                assetFileNames: (assetInfo) => {
                    return `assets/${assetInfo.name}`;
                }
            }
        }
    }
});
