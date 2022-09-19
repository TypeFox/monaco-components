import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                monacoEditorWrapper: path.resolve(__dirname, '/packages/examples/wrapper.html'),
                monacoEditorComp: path.resolve(__dirname, '/packages/monaco-editor-comp/index.html'),
                monacoEditorCompAdvanced: path.resolve(__dirname, '/packages/monaco-editor-comp/advanced.html'),
                monacoEditorWorkers: path.resolve(__dirname, '/packages/monaco-editor-workers/index.html'),
            }
        },
        target: ['node16']
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
