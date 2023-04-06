import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

import * as vscode from 'vscode';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';

const wrapper = new MonacoEditorLanguageClientWrapper();

const startEditor = async () => {
    if (wrapper.isStarted()) {
        alert('Editor was already started!');
        return;
    }

    const exampleStatemachineUrl = new URL('./src/langium/example.statemachine', window.location.href).href;
    const responseStatemachine = await fetch(exampleStatemachineUrl);
    const codeMain = await responseStatemachine.text();

    const extensionFiles = new Map<string, URL>();
    const statemachineLanguageConfig = new URL('../../../node_modules/langium-statemachine-dsl/language-configuration.json', window.location.href);
    const responseStatemachineTm = new URL('../../../node_modules/langium-statemachine-dsl/syntaxes/statemachine.tmLanguage.json', window.location.href);
    extensionFiles.set('/statemachine-configuration.json', statemachineLanguageConfig);
    extensionFiles.set('/statemachine-grammar.json', responseStatemachineTm);

    // Language Server preparation
    const langiumWorkerUrl = new URL('./dist/worker/statemachineServerWorker.js', window.location.href);
    console.log(`Langium worker URL: ${langiumWorkerUrl}`);

    wrapper.init({
        wrapperConfig: {
            useVscodeConfig: true,
            monacoVscodeApiConfig: {
                activationConfig: {
                    basePath: '../monaco-editor-wrapper'
                },
                extension: {
                    name: 'langium-example',
                    publisher: 'monaco-languageclient-project',
                    version: '1.0.0',
                    engines: {
                        vscode: '*'
                    },
                    contributes: {
                        languages: [{
                            id: 'statemachine',
                            extensions: [
                                '.statemachine'
                            ],
                            aliases: [
                                'statemachine',
                                'Statemachine'
                            ],
                            configuration: './statemachine-configuration.json'
                        }],
                        grammars: [{
                            language: 'statemachine',
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
                },
                extensionFiles: extensionFiles,
                userConfiguration: `{
                    "workbench.colorTheme": "Dark+ (Experimental)",
                    "editor.fontSize": 14,
                    "editor.lightbulb.enabled": true,
                    "editor.lineHeight": 20,
                    "editor.guides.bracketPairsHorizontal": "active",
                    "editor.lightbulb.enabled": true
                }`
            }
        },
        editorConfig: {
            languageId: 'statemachine',
            code: codeMain,
            useDiffEditor: false,
            automaticLayout: true,
            theme: 'vs-dark'
        },
        languageClientConfig: {
            enabled: true,
            useWebSocket: false,
            workerConfigOptions: {
                url: langiumWorkerUrl,
                type: 'module',
                name: 'Statemachine LS',
            }
        }
    });

    wrapper.startEditor(document.getElementById('monaco-editor-root') as HTMLElement)
        .then((s: unknown) => {
            console.log(s);

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
