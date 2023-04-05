import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import * as vscode from 'vscode';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { Message } from 'vscode-languageserver/browser.js';

const languageId = 'json';
let codeMain = `{
    "$schema": "http://json.schemastore.org/coffeelint",
    "line_endings": {"value": "windows"}
}`;
const codeOrg = `{
    "$schema": "http://json.schemastore.org/coffeelint",
    "line_endings": {"value": "unix"}
}`;
const wrapper = new MonacoEditorLanguageClientWrapper({
    useVscodeConfig: false,
    theme: 'vs-dark',
    content: {
        languageId: languageId,
        code: codeMain,
        useDiffEditor: false,
        codeModified: codeOrg
    },
    languageClient: {
        useWebSocket: true,
        options: {
            wsHost: 'localhost',
            wsPort: 3000,
            wsPath: 'sampleServer',
            wsSecured: false
        }
    }
});

function startEditor() {
    if (wrapper.isStarted()) {
        alert('Editor was already started!');
        return;
    }

    const editorConfig = wrapper.getEditorConfig();
    const monacoConfig = editorConfig.getMonacoConfig();
    monacoConfig.setLanguageExtensionConfig({
        id: 'json',
        extensions: ['.json', '.jsonc'],
        aliases: ['JSON', 'json'],
        mimetypes: ['application/json']
    });
    configureCodeEditors();

    const monacoEditorConfig = {
        glyphMargin: true,
        guides: {
            bracketPairs: true
        },
        lightbulb: {
            enabled: true
        },
    };

    editorConfig.setMonacoEditorOptions(monacoEditorConfig);
    editorConfig.setMonacoDiffEditorOptions(monacoEditorConfig);

    toggleSwapDiffButton(true);
    wrapper.startEditor(document.getElementById('monaco-editor-root') as HTMLElement)
        .then((s: unknown) => {
            console.log(s);
            logEditorInfo(wrapper);
            wrapper.getMessageTransports()?.reader?.listen((x: Message) => {
                console.log(x);
            });

            vscode.commands.getCommands().then((x) => {
                console.log('Currently registered # of vscode commands: ' + x.length);
            });
        })
        .catch((e: Error) => console.error(e));
}

function configureCodeEditors() {
    const runtimeConfig = wrapper.getEditorConfig().getRuntimeConfig();
    if (runtimeConfig.content.useDiffEditor) {
        runtimeConfig.content.code = codeOrg;
        runtimeConfig.content.codeModified = codeMain;
    } else {
        runtimeConfig.content.code = codeMain;
    }
}

function saveMainCode(saveFromDiff: boolean, saveFromMain: boolean) {
    if (saveFromDiff) {
        codeMain = wrapper.getDiffCode()!;
    }
    if (saveFromMain) {
        codeMain = wrapper.getMainCode()!;
    }
}

function swapEditors() {
    const runtimeConfig = wrapper.getEditorConfig().getRuntimeConfig();
    runtimeConfig.content.useDiffEditor = !runtimeConfig.content.useDiffEditor;
    saveMainCode(!runtimeConfig.content.useDiffEditor, false);
    configureCodeEditors();

    wrapper.startEditor(document.getElementById('monaco-editor-root') as HTMLElement)
        .then((s: string) => {
            console.log(s);
            logEditorInfo(wrapper);
        })
        .catch((e: Error) => console.error(e));
}

async function disposeEditor() {
    wrapper.reportStatus();
    toggleSwapDiffButton(false);
    const useDiffEditor = wrapper.getEditorConfig().getRuntimeConfig().content.useDiffEditor;
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
    console.log(`# of configured languages: ${monaco.languages.getLanguages().length}`);
    console.log(`Main code: ${client.getMainCode()}`);
    console.log(`Modified code: ${client.getDiffCode()}`);
}

document.querySelector('#button-start')?.addEventListener('click', startEditor);
document.querySelector('#button-swap')?.addEventListener('click', swapEditors);
document.querySelector('#button-dispose')?.addEventListener('click', disposeEditor);

startEditor();
