import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'monaco-editor-comp',
            fileName: () => 'index.js',
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
                name: 'monaco-editor-comp',
                exports: 'named',
                sourcemap: false,
                assetFileNames: (assetInfo) => {
                    return `assets/${assetInfo.name}`;
                },
            }
        },
    },
    server: {
        port: 20003
    }
});
