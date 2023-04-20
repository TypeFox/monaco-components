import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

// support all editor features
import 'monaco-editor/esm/vs/editor/edcore.main.js';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { disposeEditor, startEditor, swapEditors } from './common.js';

const languageId = 'typescript';
const codeOrg = `function sayHello(): string {
    return "Hello";
};`;
let codeMain = `function sayGoodbye(): string {
    return "Goodbye";
};`;

const monacoEditorConfig: editor.IStandaloneEditorConstructionOptions = {
    glyphMargin: true,
    guides: {
        bracketPairs: true
    },
    lightbulb: {
        enabled: true
    }
};

const userConfig = {
    htmlElement: document.getElementById('monaco-editor-root') as HTMLElement,
    wrapperConfig: {
        useVscodeConfig: false
    },
    languageClientConfig: {
        enabled: false
    },
    editorConfig: {
        languageId: languageId,
        code: codeOrg,
        useDiffEditor: false,
        codeOriginal: codeMain,
        editorOptions: monacoEditorConfig,
        diffEditorOptions: monacoEditorConfig,
        theme: 'vs-dark',
        automaticLayout: true
    }
};

try {
    document.querySelector('#button-start')?.addEventListener('click', () => {
        startEditor(userConfig, codeMain, codeOrg);
    });
    document.querySelector('#button-swap')?.addEventListener('click', () => {
        swapEditors(userConfig, codeMain, codeOrg);
    });
    document.querySelector('#button-dispose')?.addEventListener('click', async () => {
        codeMain = await disposeEditor(userConfig);
    });

    startEditor(userConfig, codeMain, codeOrg);
} catch (e) {
    console.error(e);
}
