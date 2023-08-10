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
    },
    theme: 'vs-dark'
};

const userConfig: UserConfig = {
    htmlElement: document.getElementById('monaco-editor-root') as HTMLElement,
    wrapperConfig: {
        serviceConfig: {
            // enable quick access "F1" and add required keybindings service
            enableQuickaccessService: true,
            enableKeybindingsService: true,
            debugLogging: true
        },
        editorAppConfig: {
            editorAppType: 'classic',
            languageId: 'typescript',
            code: code,
            codeUri: codeUri,
            codeOriginal: codeOriginal,
            useDiffEditor: false,
            editorOptions: monacoEditorConfig,
            diffEditorOptions: monacoEditorConfig
        }
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
        if (wrapper.getMonacoEditorApp()?.getAppConfig().codeUri === codeUri) {
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
        if (wrapper.getMonacoEditorApp()?.getAppConfig().codeUri === codeUri) {
            code = await disposeEditor(userConfig);
        } else {
            codeOriginal = await disposeEditor(userConfig);
        }
    });

    startEditor(userConfig, code, codeOriginal);
} catch (e) {
    console.error(e);
}
