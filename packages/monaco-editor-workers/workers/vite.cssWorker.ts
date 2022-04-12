import path from 'path';
import { defineConfig } from 'vite';

const config = defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, '../../../node_modules/monaco-editor/esm/vs/language/css/css.worker.js'),
            name: 'cssWorker',
            fileName: (format) => `workers/cssWorker-${format}.js`,
            formats: ['iife', 'es']
        },
        outDir: 'dist',
        emptyOutDir: false
    }
});

export default config;
