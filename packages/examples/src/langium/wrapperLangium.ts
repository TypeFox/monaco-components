import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

import * as vscode from 'vscode';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { BrowserMessageReader, BrowserMessageWriter, Message } from 'vscode-languageserver/browser.js';

const client = new MonacoEditorLanguageClientWrapper(true);

const languageId = 'statemachine';
let codeMain = '';

async function startEditor() {
    if (client.isStarted()) {
        alert('Editor was already started!');
        return;
    }

    const statemachineLanguageConfig = new URL('../../node_modules/langium-statemachine-dsl/language-configuration.json', window.location.href).href;
    const statemachineTmUrl = new URL('../../node_modules/langium-statemachine-dsl/syntaxes/statemachine.tmLanguage.json', window.location.href).href;
    const exampleStatemachineUrl = new URL('./src/langium/example.statemachine', window.location.href).href;

    const responseLanguageConfig = await fetch(statemachineLanguageConfig);
    const responseStatemachineTm = await fetch(statemachineTmUrl);
    const responseStatemachine = await fetch(exampleStatemachineUrl);
    codeMain = await responseStatemachine.text();

    const editorConfig = client.getEditorConfig();
    editorConfig.setMainLanguageId(languageId);
    editorConfig.setMainCode(codeMain);
    editorConfig.setUseLanguageClient(true);
    editorConfig.setUseWebSocket(false);

    const vscodeApiConfig = client.getVscodeApiConfig();
    vscodeApiConfig.setLanguages([{
        id: languageId,
        extensions: [
            `.${languageId}`
        ],
        aliases: [
            'Statemachine',
            languageId
        ],
        configuration: './statemachine-configuration.json'
    }]);
    vscodeApiConfig.setLanguageConfiguration('/statemachine-configuration.json', () => responseLanguageConfig.text());

    vscodeApiConfig.setGrammars([{
        language: languageId,
        scopeName: 'source.statemachine',
        path: './statemachine-grammar.json'
    }], (grammar) => {
        switch (grammar.language) {
            case languageId:
                return responseStatemachineTm.text();
            default:
                return Promise.reject(new Error(`Grammar language ${grammar.language} not found!`));
        }
    });

    vscodeApiConfig.setUserConfiguration(`{
        "workbench.colorTheme": "Dark+ (Experimental)",
        "editor.fontSize": 14,
        "editor.lightbulb.enabled": true,
        "editor.lineHeight": 20,
        "editor.guides.bracketPairsHorizontal": "active",
        "editor.lightbulb.enabled": true
    }`);

    vscodeApiConfig.setUserKeybindings(`[
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
    ]`);

    // Language Server preparation
    const langiumWorkerUrl = new URL('./dist/worker/statemachineServerWorker.js', window.location.href).href;
    //const langiumWorkerUrl = new URL('../../node_modules/langium-statemachine-dsl/src/language-server/main-browser.ts', window.location.href).href;
    console.log(`Langium worker URL: ${langiumWorkerUrl}`);
    const lsWorker = new Worker(langiumWorkerUrl, {
        type: 'module',
        name: 'Statemachine LS'
    });

    // test if external creation works
    const reader = new BrowserMessageReader(lsWorker);
    const writer = new BrowserMessageWriter(lsWorker);
    client.setWorker(lsWorker, { reader: reader, writer: writer });

    client.startEditor(document.getElementById('monaco-editor-root') as HTMLElement)
        .then((s: unknown) => {
            console.log(s);
            client.getMessageTransports()?.reader?.listen((x: Message) => {
                console.log(x);
            });
            vscode.commands.getCommands().then((x) => {
                console.log('Currently registered # of vscode commands: ' + x.length);
            });
        })
        .catch((e: Error) => console.error(e));
}

async function disposeEditor() {
    client.reportStatus();
    await client.dispose()
        .then(() => {
            console.log(client.reportStatus().join('\n'));
        })
        .catch((e: Error) => console.error(e));
}

document.querySelector('#button-start')?.addEventListener('click', startEditor);
document.querySelector('#button-dispose')?.addEventListener('click', disposeEditor);

startEditor();
