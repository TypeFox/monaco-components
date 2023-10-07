import * as vscode from 'vscode';
import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js';
import { disposeEditor, startEditor, swapEditors, updateModel, wrapper } from './common.js';
import { UserConfig } from 'monaco-editor-wrapper';
import { buildWorkerDefinition } from 'monaco-editor-workers';

buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

const codeUri = '/workspace/hello.ts';
let code = `function sayHello(): string {
    return "Hello";
};`;

const codeOriginalUri = '/workspace/goodbye.ts';
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
    wrapperConfig: {
        serviceConfig: {
            userServices: {
                ...getKeybindingsServiceOverride()
            },
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
    const htmlElement = document.getElementById('monaco-editor-root');
    document.querySelector('#button-start')?.addEventListener('click', () => {
        startEditor(userConfig, htmlElement, code, codeOriginal);
    });
    document.querySelector('#button-swap')?.addEventListener('click', () => {
        swapEditors(userConfig, htmlElement, code, codeOriginal);
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

    await startEditor(userConfig, htmlElement, code, codeOriginal);

    vscode.commands.getCommands().then((x) => {
        console.log(`Found ${x.length} commands`);
        const finding = x.find((elem) => elem === 'actions.find');
        console.log(`Found command: ${finding}`);
    });

    wrapper.getEditor()?.focus();
    await vscode.commands.executeCommand('actions.find');
} catch (e) {
    console.error(e);
}
