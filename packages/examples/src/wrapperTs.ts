import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

// support all editor features
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { editor, languages } from 'monaco-editor/esm/vs/editor/edcore.main.js';

import * as vscode from 'vscode';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper/allLanguages';
import { StandaloneServices } from 'vscode/services';
import getNotificationServiceOverride from 'vscode/service-override/notifications';
import getDialogServiceOverride from 'vscode/service-override/dialogs';
import getKeybindingsServiceOverride from 'vscode/service-override/keybindings';

StandaloneServices.initialize({
    ...getNotificationServiceOverride(document.body),
    ...getDialogServiceOverride(),
    ...getKeybindingsServiceOverride(),
});

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

const wrapper = new MonacoEditorLanguageClientWrapper();
wrapper.init({
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
});

function startEditor() {
    if (wrapper.isStarted()) {
        alert('Editor was already started!');
        return;
    }
    configureCodeEditors();

    toggleSwapDiffButton(true);
    wrapper.startEditor()
        .then((s: unknown) => {
            console.log(s);
            logEditorInfo(wrapper);

            vscode.commands.getCommands().then((x) => {
                console.log('Currently registered # of vscode commands: ' + x.length);
            });
        })
        .catch((e: Error) => console.error(e));
}

function configureCodeEditors() {
    const runtimeConfig = wrapper.getUserConfig();
    if (runtimeConfig.editorConfig.useDiffEditor) {
        runtimeConfig.editorConfig.code = codeMain;
        runtimeConfig.editorConfig.codeOriginal = codeOrg;
    } else {
        runtimeConfig.editorConfig.code = codeMain;
    }
}

function saveMainCode(saveFromDiff: boolean, saveFromMain: boolean) {
    if (saveFromDiff) {
        codeMain = wrapper.getModel(true)!.getValue();
    }
    if (saveFromMain) {
        codeMain = wrapper.getModel()!.getValue();
    }
}

function swapEditors() {
    const runtimeConfig = wrapper.getUserConfig();
    runtimeConfig.editorConfig.useDiffEditor = !runtimeConfig.editorConfig.useDiffEditor;
    saveMainCode(!runtimeConfig.editorConfig.useDiffEditor, false);
    configureCodeEditors();

    wrapper.startEditor()
        .then((s: string) => {
            console.log(s);
            logEditorInfo(wrapper);
        })
        .catch((e: Error) => console.error(e));
}

async function disposeEditor() {
    wrapper.reportStatus();
    toggleSwapDiffButton(false);
    const useDiffEditor = wrapper.getUserConfig().editorConfig.useDiffEditor;
    saveMainCode(useDiffEditor, !useDiffEditor);
    await wrapper.dispose()
        .then(() => {
            console.log(wrapper.reportStatus().join('\n'));
        })
        .catch((e: Error) => console.error(e));
}

function toggleSwapDiffButton(enabled: boolean) {
    const button = document.getElementById('button-swap') as HTMLButtonElement;
    if (button !== null) {
        button.disabled = !enabled;
    }
}

function logEditorInfo(client: MonacoEditorLanguageClientWrapper) {
    console.log(`# of configured languages: ${languages.getLanguages().length}`);
    console.log(`Main code: ${client.getModel(true)!.getValue()}`);
    if (wrapper.getUserConfig().editorConfig.useDiffEditor) {
        console.log(`Modified code: ${client.getModel()!.getValue()}`);
    }
}

document.querySelector('#button-start')?.addEventListener('click', startEditor);
document.querySelector('#button-swap')?.addEventListener('click', swapEditors);
document.querySelector('#button-dispose')?.addEventListener('click', disposeEditor);

startEditor();
