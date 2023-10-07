import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';
import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import { useOpenEditorStub } from 'monaco-languageclient';
import { UserConfig } from 'monaco-editor-wrapper';
import { loadStatemachinWorker } from '../wrapperStatemachine.js';
import { getTextContent } from '../../common.js';

export const createLangiumGlobalConfig = async (): Promise<UserConfig> => {
    const code = await getTextContent(new URL('./src/langium/content/example.statemachine', window.location.href));

    const extensionFilesOrContents = new Map<string, string | URL>();
    const statemachineLanguageConfig = new URL('../../../node_modules/langium-statemachine-dsl/language-configuration.json', window.location.href);
    const responseStatemachineTm = new URL('../../../node_modules/langium-statemachine-dsl/syntaxes/statemachine.tmLanguage.json', window.location.href);
    extensionFilesOrContents.set('/statemachine-configuration.json', statemachineLanguageConfig);
    extensionFilesOrContents.set('/statemachine-grammar.json', responseStatemachineTm);

    const stateMachineWorker = loadStatemachinWorker();

    return {
        wrapperConfig: {
            serviceConfig: {
                userServices: {
                    ...getEditorServiceOverride(useOpenEditorStub),
                    ...getKeybindingsServiceOverride()
                },
                debugLogging: true
            },
            editorAppConfig: {
                $type: 'vscodeApi',
                languageId: 'statemachine',
                code: code,
                useDiffEditor: false,
                extensions: [{
                    config: {
                        name: 'statemachine-example',
                        publisher: 'monaco-editor-wrapper-examples',
                        version: '1.0.0',
                        engines: {
                            vscode: '*'
                        },
                        contributes: {
                            languages: [{
                                id: 'statemachine',
                                extensions: ['.statemachine'],
                                aliases: ['statemachine', 'Statemachine'],
                                configuration: './statemachine-configuration.json'
                            }],
                            grammars: [{
                                language: 'statemachine',
                                scopeName: 'source.statemachine',
                                path: './statemachine-grammar.json'
                            }]
                        }
                    },
                    filesOrContents: extensionFilesOrContents
                }],
                userConfiguration: {
                    json: JSON.stringify({
                        'workbench.colorTheme': 'Default Dark Modern',
                        'editor.guides.bracketPairsHorizontal': 'active',
                        'editor.lightbulb.enabled': true
                    })
                }
            }
        },
        languageClientConfig: {
            options: {
                $type: 'WorkerDirect',
                worker: stateMachineWorker
            }
        }
    };
};
