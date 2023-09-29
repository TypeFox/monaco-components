import { Uri } from 'vscode';
import getConfigurationServiceOverride from '@codingame/monaco-vscode-configuration-service-override';
import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';
import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import { whenReady } from '@codingame/monaco-vscode-theme-defaults-default-extension';
import { useOpenEditorStub } from 'monaco-languageclient';
import { UserConfig } from 'monaco-editor-wrapper';
import { getTextContent } from '../../common.js';
import { loadLangiumWorker } from '../wrapperLangium.js';

export const setupLangiumClientVscodeApi = async (): Promise<UserConfig> => {
    const code = await getTextContent(new URL('./src/langium/content/example.langium', window.location.href));

    const extensionFilesOrContents = new Map<string, string | URL>();
    const langiumLanguageConfig = new URL('./src/langium/config/langium.configuration.json', window.location.href);
    const langiumTextmateGrammar = await getTextContent(new URL('./src/langium/config/langium.tmLanguage.json', window.location.href));
    // test both url and string content
    extensionFilesOrContents.set('/langium-configuration.json', langiumLanguageConfig);
    extensionFilesOrContents.set('/langium-grammar.json', langiumTextmateGrammar);

    const langiumWorker = loadLangiumWorker();
    return {
        htmlElement: document.getElementById('monaco-editor-root') as HTMLElement,
        wrapperConfig: {
            serviceConfig: {
                userServices: {
                    ...getThemeServiceOverride(),
                    ...getTextmateServiceOverride(),
                    ...getConfigurationServiceOverride(Uri.file('/workspace')),
                    ...getEditorServiceOverride(useOpenEditorStub),
                    ...getKeybindingsServiceOverride()
                },
                debugLogging: true
            },
            editorAppConfig: {
                $type: 'vscodeApi',
                languageId: 'langium',
                code: code,
                useDiffEditor: false,
                extensions: [{
                    config: {
                        name: 'langium-example',
                        publisher: 'monaco-editor-wrapper-examples',
                        version: '1.0.0',
                        engines: {
                            vscode: '*'
                        },
                        contributes: {
                            languages: [{
                                id: 'langium',
                                extensions: ['.langium'],
                                aliases: ['langium', 'LANGIUM'],
                                configuration: './langium-configuration.json'
                            }],
                            grammars: [{
                                language: 'langium',
                                scopeName: 'source.langium',
                                path: './langium-grammar.json'
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
                    }),
                    awaitReadiness: [whenReady]
                }
            }
        },
        languageClientConfig: {
            options: {
                $type: 'WorkerDirect',
                worker: langiumWorker
            }
        }
    };
};
