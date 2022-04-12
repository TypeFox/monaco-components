import path from 'path';
import { defineConfig } from 'vite';

const config = defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, '../../../node_modules/monaco-editor/esm/vs/language/json/json.worker.js'),
            name: 'jsonWorker',
            fileName: (format) => `workers/jsonWorker-${format}.js`,
            formats: ['iife', 'es']
        },
        outDir: 'dist',
        emptyOutDir: false
    }
});

export default config;
