import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import * as vscode from 'vscode';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper/allLanguages';
import { StandaloneServices } from 'vscode/services';
import getNotificationServiceOverride from 'vscode/service-override/notifications';
import getDialogServiceOverride from 'vscode/service-override/dialogs';
import getKeybindingsServiceOverride, { updateUserKeybindings } from 'vscode/service-override/keybindings';

StandaloneServices.initialize({
    ...getNotificationServiceOverride(document.body),
    ...getDialogServiceOverride(),
    ...getKeybindingsServiceOverride(),
});

const client = new MonacoEditorLanguageClientWrapper(false);

const languageId = 'typescript';
let codeMain = `function sayHello(): string {
    return "Hello";
};`;
const codeOrg = `function sayGoodbye(): string {
    return "Goodbye";
};`;
let useDiffEditor = false;

function startEditor() {
    if (client.isStarted()) {
        alert('Editor was already started!');
        return;
    }

    const editorConfig = client.getEditorConfig();
    configureCodeEditors();
    editorConfig.setTheme('vs-dark');

    const monacoEditorConfig = {
        glyphMargin: true,
        guides: {
            bracketPairs: true
        },
        lightbulb: {
            enabled: true
        }
    } as monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions;

    editorConfig.setMonacoEditorOptions(monacoEditorConfig);
    editorConfig.setMonacoDiffEditorOptions(monacoEditorConfig);

    toggleSwapDiffButton(true);
    client.startEditor(document.getElementById('monaco-editor-root') as HTMLElement)
        .then((s: unknown) => {
            console.log(s);
            logEditorInfo(client);

            const keybindingsModel = monaco.editor.createModel(
                `[
                  {
                    "key": "ctrl+p",
                    "command": "editor.action.quickCommand",
                    "when": "editorTextFocus"
                  },
                  {
                    "key": "ctrl+shift+c",
                    "command": "editor.action.commentLine",
                    "when": "editorTextFocus"
                  }
                ]`, 'json', monaco.Uri.file('/keybindings.json'));

            updateUserKeybindings(keybindingsModel.getValue());

            vscode.commands.getCommands().then((x) => {
                console.log('Currently registered # of vscode commands: ' + x.length);
            });
        })
        .catch((e: Error) => console.error(e));
}

function configureCodeEditors() {
    const editorConfig = client.getEditorConfig();
    editorConfig.setUseDiffEditor(useDiffEditor);
    if (useDiffEditor) {
        editorConfig.setMainLanguageId(languageId);
        editorConfig.setMainCode(codeOrg);
        editorConfig.setDiffLanguageId(languageId);
        editorConfig.setDiffCode(codeMain);
    } else {
        editorConfig.setMainLanguageId(languageId);
        editorConfig.setMainCode(codeMain);
    }
}

function saveMainCode(saveFromDiff: boolean, saveFromMain: boolean) {
    if (saveFromDiff) {
        codeMain = client.getDiffCode()!;
    }
    if (saveFromMain) {
        codeMain = client.getMainCode()!;
    }
}

function swapEditors() {
    useDiffEditor = !useDiffEditor;
    saveMainCode(!useDiffEditor, false);
    configureCodeEditors();

    client.startEditor(document.getElementById('monaco-editor-root') as HTMLElement)
        .then((s: string) => {
            console.log(s);
            logEditorInfo(client);
        })
        .catch((e: Error) => console.error(e));
}

async function disposeEditor() {
    client.reportStatus();
    toggleSwapDiffButton(false);
    saveMainCode(useDiffEditor, !useDiffEditor);
    await client.dispose()
        .then(() => {
            console.log(client.reportStatus().join('\n'));
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
