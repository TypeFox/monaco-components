import path from 'path';
import { defineConfig } from 'vite';

const config = defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, '../../../node_modules/monaco-editor/esm/vs/editor/editor.worker.js'),
            name: 'editorWorker',
            fileName: (format) => `workers/editorWorker-${format}.js`,
            formats: ['iife', 'es']
        },
        outDir: 'dist',
        emptyOutDir: false
    }
});

export default config;
