import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        cssCodeSplit: false,
        rollupOptions: {
            external: [],
            output: {
                inlineDynamicImports: true,
                name: 'monaco-editor-verify',
                exports: 'named',
                sourcemap: false,
            }
        },
    },
    server: {
        port: 21001
    }
});
