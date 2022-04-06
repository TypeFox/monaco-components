import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: [
            {
                find: 'vscode',
                replacement: path.resolve(__dirname, './node_modules/monaco-languageclient/lib/vscode-compatibility')
            }
        ]
    },
    optimizeDeps: {
        // we need this as it is locally referenced/linked by the examples
        // if it is regular dependency resoled from npmjs this is not required
        include: ['monaco-languageclient']
    },
    build: {
        rollupOptions: {
            input: {
                monacoEditorComp: path.resolve(__dirname, '/packages/monaco-editor-comp/index.html'),
                monacoEditorLCComp: path.resolve(__dirname, '/packages/monaco-editor-lc-comp/index.html'),
                monacoEditorWorkers: path.resolve(__dirname, '/packages/monaco-editor-workers/index.html')
            }
        }
    },
    server: {
        port: 20001
    }
});
