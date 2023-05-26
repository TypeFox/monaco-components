import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        target: 'esnext',
        rollupOptions: {
            input: {
                wrapperLangium: path.resolve(__dirname, '/packages/examples/wrapper_langium.html'),
                wrapperTs: path.resolve(__dirname, '/packages/examples/wrapper_ts.html'),
                wrapperWebSocket: path.resolve(__dirname, '/packages/examples/wrapper_ws.html'),
                wrapperAdvanced: path.resolve(__dirname, '/packages/examples/wrapper_adv.html'),
                react: path.resolve(__dirname, '/packages/examples/react.html'),
                reactTs: path.resolve(__dirname, '/packages/examples/react_ts.html'),
                workers: path.resolve(__dirname, '/packages/examples/workers.html'),
                verifyWrapper: path.resolve(__dirname, '/packages/examples/verify_wrapper.html'),
                verifyAlt: path.resolve(__dirname, '/packages/examples/verify_alt.html')
            }
        }
    },
    // enforce optimization
    optimizeDeps: {
        include: [
            'monaco-editor',
            'vscode',
            'vscode/extensions',
            'vscode/services',
            'vscode/monaco',
            'vscode/service-override/modelEditor',
            'vscode/service-override/notifications',
            'vscode/service-override/dialogs',
            'vscode/service-override/configuration',
            'vscode/service-override/keybindings',
            'vscode/service-override/textmate',
            'vscode/service-override/theme',
            'vscode/service-override/languages',
            'vscode/service-override/audioCue',
            'vscode/service-override/debug',
            'vscode/service-override/preferences',
            'vscode/service-override/snippets',
            'vscode/service-override/files',
            'vscode/default-extensions/theme-defaults',
            'vscode/default-extensions/javascript',
            'vscode/default-extensions/json'
        ]
    },
    resolve: {
        alias: {
            path: 'path-browserify'
        }
    },
    server: {
        origin: 'http://localhost:20001',
        port: 20001
    },
    assetsInclude: ['**/*.wasm']
});
