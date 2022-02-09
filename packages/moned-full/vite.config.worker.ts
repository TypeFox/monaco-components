import path from 'path';
import { defineConfig } from 'vite';

const config = defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/workerBuilder.js'),
            name: 'moned-workers',
            fileName: (format) => `moned-workers.${format}.js`,
            formats: ['es']
        },
        outDir: 'dist',
        emptyOutDir: false
    }
});

export default config;
