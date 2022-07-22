import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                monacoEditorLCComp: path.resolve(__dirname, '/packages/monaco-editor-comp/index.html'),
                monacoEditorLCCompAdvanced: path.resolve(__dirname, '/packages/monaco-editor-comp/advanced.html'),
                monacoEditorDirect: path.resolve(__dirname, '/packages/monaco-editor-comp/direct.html'),
                monacoEditorWorkers: path.resolve(__dirname, '/packages/monaco-editor-workers/index.html'),
            }
        }
    },
    resolve: {
        alias: {
            path: 'path-browserify'
        }
    },
    server: {
        port: 20001
    }
});
