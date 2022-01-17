import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/main.ts'),
            name: 'MonacoEditorBase',
            fileName: (format) => `moned-base.${format}.js`,
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
                name: 'MonacoEditorBase',
                exports: 'named'
            }
        },
    },
    server: {
        port: 20001
    }
});
