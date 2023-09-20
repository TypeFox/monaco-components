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
    theme: 'vs-dark',
    renderSideBySide: false
};

const userConfig: UserConfig = {
    htmlElement: document.getElementById('monaco-editor-root') as HTMLElement,
    wrapperConfig: {
        serviceConfig: {
            enableKeybindingsService: true,
            debugLogging: true
        },
        editorAppConfig: {
            $type: 'classic',
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
        if (wrapper.getMonacoEditorApp()?.getConfig().codeUri === codeUri) {
            updateModel({
                code: codeOriginal,
                codeUri: codeOriginalUri,
                languageId: 'typescript',
            });
        } else {
            updateModel({
                code: code,
                codeUri: codeUri,
                languageId: 'typescript',
            });
        }
    });
    document.querySelector('#button-dispose')?.addEventListener('click', async () => {
        if (wrapper.getMonacoEditorApp()?.getConfig().codeUri === codeUri) {
            code = await disposeEditor(userConfig.wrapperConfig.editorAppConfig.useDiffEditor);
        } else {
            codeOriginal = await disposeEditor(userConfig.wrapperConfig.editorAppConfig.useDiffEditor);
        }
    });

    startEditor(userConfig, code, codeOriginal);
} catch (e) {
    console.error(e);
}
