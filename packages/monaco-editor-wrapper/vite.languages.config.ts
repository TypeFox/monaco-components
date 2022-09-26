import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/languages.ts'),
            name: 'monaco-editor-wrapper-languages',
            fileName: () => 'languages.js',
            formats: ['es']
        },
        outDir: 'bundle',
        assetsDir: 'bundle/assets',
        emptyOutDir: false,
        cssCodeSplit: false,
        rollupOptions: {
            external: [
                'monaco-editor-workers',
                //'monaco-editor',
                //'monaco-editor/esm/vs/editor/editor.api.js',
                //'monaco-editor/esm/vs/editor/editor.all.js'
            ],
            output: {
                inlineDynamicImports: true,
                name: 'monaco-editor-wrapper-languages',
                exports: 'named',
                sourcemap: false,
                assetFileNames: (assetInfo) => {
                    return `assets/${assetInfo.name}`;
                }
            }
        }
    }
});
