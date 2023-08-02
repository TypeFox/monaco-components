import { disposeEditor, startEditor, swapEditors, updateModel, wrapper } from './common.js';

import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js';

import { buildWorkerDefinition } from 'monaco-editor-workers';
import { UserConfig } from 'monaco-editor-wrapper';
buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

const codeUri = '/tmp/hello.ts';
let code = `function sayHello(): string {
    return "Hello";
};`;

const codeOriginalUri = '/tmp/goodbye.ts';
let codeOriginal = `function sayGoodbye(): string {
    return "Goodbye";
};`;

const monacoEditorConfig = {
    glyphMargin: true,
    guides: {
        bracketPairs: true
    },
    lightbulb: {
        enabled: true
    }
};

const userConfig: UserConfig = {
    htmlElement: document.getElementById('monaco-editor-root') as HTMLElement,
    wrapperConfig: {
        useVscodeConfig: false,
        serviceConfig: {
            // enable quick access "F1" and add required keybindings service
            enableQuickaccessService: true,
            enableKeybindingsService: true,
            debugLogging: true
        },
        monacoEditorConfig: {

        }
    },
    languageClientConfig: {
        enabled: false
    },
    editorConfig: {
        languageId: 'typescript',
        code: code,
        uri: codeUri,
        codeOriginal: codeOriginal,
        useDiffEditor: false,
        editorOptions: monacoEditorConfig,
        diffEditorOptions: monacoEditorConfig,
        theme: 'vs-dark',
        automaticLayout: true
    }
};

try {
    document.querySelector('#button-start')?.addEventListener('click', () => {
        startEditor(userConfig, code, codeOriginal);
    });
    document.querySelector('#button-swap')?.addEventListener('click', () => {
        swapEditors(userConfig, code, codeOriginal);
    });
    document.querySelector('#button-swap-code')?.addEventListener('click', () => {
        if (wrapper.getMonacoEditorWrapper()?.getEditorConfig().uri === codeUri) {
            updateModel({
                code: codeOriginal,
                uri: codeOriginalUri,
                languageId: 'typescript',
            });
        } else {
            updateModel({
                code: code,
                uri: codeUri,
                languageId: 'typescript',
            });
        }
    });
    document.querySelector('#button-dispose')?.addEventListener('click', async () => {
        if (wrapper.getMonacoEditorWrapper()?.getEditorConfig().uri === codeUri) {
            code = await disposeEditor(userConfig);
        } else {
            codeOriginal = await disposeEditor(userConfig);
        }
    });

    startEditor(userConfig, code, codeOriginal);
} catch (e) {
    console.error(e);
}
