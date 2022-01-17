import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/main.ts'),
            name: 'MonacoEditorFull',
            fileName: (format) => `moned-full.${format}.js`,
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
                name: 'MonacoEditorFull',
                exports: 'named'
            }
        },
    },
    server: {
        port: 20002
    }
});
