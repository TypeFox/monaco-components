import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

import * as vscode from 'vscode';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { BrowserMessageReader, BrowserMessageWriter, Message } from 'vscode-languageserver/browser.js';

const exampleStatemachineUrl = new URL('./src/langium/example.statemachine', window.location.href).href;
const responseStatemachine = await fetch(exampleStatemachineUrl);
const codeMain = await responseStatemachine.text();

const wrapper = new MonacoEditorLanguageClientWrapper({
    useVscodeConfig: true,
    vscodeActivationConfig: {
        basePath: '../monaco-editor-wrapper',
        enableModelEditorService: true,
        enableConfigurationService: true,
        enableKeybindingsService: true,
        enableTextmateService: true,
        enableTokenClassificationService: true,
        enableLanguageConfigurationService: true
    },
    content: {
        languageId: 'statemachine',
        code: codeMain,
        useDiffEditor: false
    },
    languageClient: {
        useWebSocket: false
    }
});

const startEditor = async () => {
    if (wrapper.isStarted()) {
        alert('Editor was already started!');
        return;
    }

    const editorConfig = wrapper.getEditorConfig();
    const vscodeApiConfig = editorConfig.getVscodeApiConfig();
    const languageId = editorConfig.getRuntimeConfig().content.languageId;

    const extension = {
        name: 'langium-example',
        publisher: 'monaco-languageclient-project',
        version: '1.0.0',
        engines: {
            vscode: '*'
        },
        contributes: {
            languages: [{
                id: languageId,
                extensions: [
                    `.${languageId}`
                ],
                aliases: [
                    languageId
                ],
                configuration: './statemachine-configuration.json'
            }],
            grammars: [{
                language: languageId,
                scopeName: 'source.statemachine',
                path: './statemachine-grammar.json'
            }],
            keybindings: [{
                key: 'ctrl+p',
                command: 'editor.action.quickCommand',
                when: 'editorTextFocus'
            }, {
                key: 'ctrl+shift+c',
                command: 'editor.action.commentLine',
                when: 'editorTextFocus'
            }]
        }
    };

    const extensionFiles = new Map<string, URL>();
    const statemachineLanguageConfig = new URL('../../../node_modules/langium-statemachine-dsl/language-configuration.json', window.location.href);
    const responseStatemachineTm = new URL('../../../node_modules/langium-statemachine-dsl/syntaxes/statemachine.tmLanguage.json', window.location.href);
    extensionFiles.set('/statemachine-configuration.json', statemachineLanguageConfig);
    extensionFiles.set('/statemachine-grammar.json', responseStatemachineTm);
    vscodeApiConfig.setExtensionConfiguration(extension, extensionFiles);

    vscodeApiConfig.setUserConfiguration(`{
        "workbench.colorTheme": "Dark+ (Experimental)",
        "editor.fontSize": 14,
        "editor.lightbulb.enabled": true,
        "editor.lineHeight": 20,
        "editor.guides.bracketPairsHorizontal": "active",
        "editor.lightbulb.enabled": true
    }`);

    // Language Server preparation
    const langiumWorkerUrl = new URL('./dist/worker/statemachineServerWorker.js', window.location.href).href;
    console.log(`Langium worker URL: ${langiumWorkerUrl}`);
    const lsWorker = new Worker(langiumWorkerUrl, {
        type: 'module',
        name: 'Statemachine LS'
    });

    // test if external creation works
    const reader = new BrowserMessageReader(lsWorker);
    const writer = new BrowserMessageWriter(lsWorker);
    wrapper.setWorker(lsWorker, { reader: reader, writer: writer });

    wrapper.startEditor(document.getElementById('monaco-editor-root') as HTMLElement)
        .then((s: unknown) => {
            console.log(s);
            wrapper.getMessageTransports()?.reader?.listen((x: Message) => {
                console.log(x);
            });
            vscode.commands.getCommands().then((x) => {
                console.log('Currently registered # of vscode commands: ' + x.length);
            });
        })
        .catch((e: Error) => console.error(e));
};

const disposeEditor = async () => {
    wrapper.reportStatus();
    await wrapper.dispose()
        .then(() => {
            console.log(wrapper.reportStatus().join('\n'));
        })
        .catch((e: Error) => console.error(e));
};

document.querySelector('#button-start')?.addEventListener('click', startEditor);
document.querySelector('#button-dispose')?.addEventListener('click', disposeEditor);

startEditor();
