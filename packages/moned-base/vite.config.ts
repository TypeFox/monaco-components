import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'moned-base',
            fileName: () => 'moned-base.js',
            formats: ['es']
        },
        outDir: 'dist',
        emptyOutDir: false,
        cssCodeSplit: false,
        rollupOptions: {
            external: [],
            output: {
                inlineDynamicImports: true,
                name: 'moned-base',
                exports: 'named',
                sourcemap: false,
            }
        }
    },
    server: {
        port: 20002
    }
});
