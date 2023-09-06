import { UserConfig } from 'monaco-editor-wrapper';
import { loadStatemachinWorker } from '../wrapperStatemachine.js';
import { getTextContent } from '../../common.js';

export const createLangiumGlobalConfig = async (htmlElement: HTMLElement): Promise<UserConfig> => {
    const code = await getTextContent(new URL('./src/langium/content/example.statemachine', window.location.href));

    const extensionFilesOrContents = new Map<string, string | URL>();
    const statemachineLanguageConfig = new URL('../../../node_modules/langium-statemachine-dsl/language-configuration.json', window.location.href);
    const responseStatemachineTm = new URL('../../../node_modules/langium-statemachine-dsl/syntaxes/statemachine.tmLanguage.json', window.location.href);
    extensionFilesOrContents.set('/statemachine-configuration.json', statemachineLanguageConfig);
    extensionFilesOrContents.set('/statemachine-grammar.json', responseStatemachineTm);

    const stateMachineWorker = loadStatemachinWorker();

    return {
        htmlElement: htmlElement,
        wrapperConfig: {
            serviceConfig: {
                enableThemeService: true,
                enableTextmateService: true,
                enableModelService: true,
                configureEditorOrViewsService: {
                },
                configureConfigurationService: {
                    defaultWorkspaceUri: '/tmp/'
                },
                enableLanguagesService: true,
                enableKeybindingsService: true,
                debugLogging: true
            },
            editorAppConfig: {
                $type: 'vscodeApi',
                languageId: 'statemachine',
                code: code,
                useDiffEditor: false,
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
                        }]
                    }
                },
                extensionFilesOrContents: extensionFilesOrContents,
                userConfiguration: {
                    json: `{
    "workbench.colorTheme": "Default Dark Modern",
    "editor.guides.bracketPairsHorizontal": "active",
    "editor.lightbulb.enabled": true
}`
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
