import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: [
            {
                find: 'vscode',
                replacement: path.resolve(__dirname, 'node_modules/@codingame/monaco-languageclient/lib/vscode-compatibility')
            }
        ]
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/main.ts'),
            name: 'MonacoEditorLanguageClient',
            fileName: (format) => `moned-lc.${format}.js`,
        },
        rollupOptions: {
            external: ['vscode'],
            output: {
                inlineDynamicImports: true,
                name: 'MonacoEditorLanguageClient',
                exports: 'named',
                globals: {
                    vscode: 'vscode'
                }
            }
        },
    },
    server: {
        port: 30000
    }
});
