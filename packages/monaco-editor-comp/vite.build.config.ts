import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: [
            {
                find: 'vscode',
                replacement: path.resolve(__dirname, '../../node_modules/monaco-languageclient/lib/vscode-compatibility')
            }
        ]
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/main.ts'),
            name: 'monaco-editor-comp',
            fileName: () => 'bundle/index.js',
            formats: ['es']
        },
        outDir: 'dist',
        assetsDir: 'dist/assets',
        emptyOutDir: false,
        cssCodeSplit: false,
        rollupOptions: {
            external: [
                /*
                'monaco-editor/esm/vs/editor/editor.api',
                'monaco-editor/esm/vs/editor/editor.all.js',
                'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js',
                'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js',
                'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js',
                'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js',
                'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js',
                'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js',
                'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js',
                'monaco-editor/esm/vs/editor/standalone/browser/quickInput/standaloneQuickInputService.js',
                'monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js',
                'monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js',
                'monaco-editor/esm/vs/language/typescript/monaco.contribution',
                'monaco-editor/esm/vs/language/html/monaco.contribution',
                'monaco-editor/esm/vs/language/css/monaco.contribution',
                'monaco-editor/esm/vs/language/json/monaco.contribution',
                'monaco-editor/esm/vs/basic-languages/monaco.contribution',
                'monaco-languageclient',
                '@codingame/monaco-jsonrpc',
*/
                'monaco-editor-workers'
            ],
            output: {
                inlineDynamicImports: true,
                name: 'monaco-editor-comp',
                exports: 'named',
                sourcemap: false,
                assetFileNames: (assetInfo) => {
                    return `assets/${assetInfo.name}`;
                },
            }
        },
    },
    server: {
        port: 20003
    }
});
