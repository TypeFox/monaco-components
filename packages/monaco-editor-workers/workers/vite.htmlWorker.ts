import path from 'path';
import { defineConfig } from 'vite';

const config = defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, '../../../node_modules/monaco-editor/esm/vs/language/html/html.worker.js'),
            name: 'htmlWorker',
            fileName: (format) => `workers/htmlWorker-${format}.js`,
            formats: ['iife', 'es']
        },
        outDir: 'dist',
        emptyOutDir: false
    }
});

export default config;
