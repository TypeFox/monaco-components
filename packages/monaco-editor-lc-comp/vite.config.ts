import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: [
            {
                find: 'vscode',
                replacement: path.resolve(__dirname, '../../node_modules/@codingame/monaco-languageclient/lib/vscode-compatibility')
            }
        ]
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/main.ts'),
            name: 'monaco-editor-lc-comp',
            fileName: () => `monaco-editor-lc-comp.js`,
            formats: ['es']
        },
        emptyOutDir: false,
        cssCodeSplit: false,
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
                name: 'monaco-editor-lc-comp',
                exports: 'named',
                sourcemap: false,
                globals: {
                    vscode: 'vscode'
                }
            }
        }
    },
    server: {
        port: 20003
    }
});
