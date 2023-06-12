import { UserConfig } from 'monaco-editor-wrapper';

export const createLangiumGlobalConfig = async (htmlElement: HTMLElement): Promise<UserConfig> => {
    const exampleStatemachineUrl = new URL('./src/langium/example.statemachine', window.location.href).href;
    const responseStatemachine = await fetch(exampleStatemachineUrl);
    const code = await responseStatemachine.text();

    const extensionFilesOrContents = new Map<string, string | URL>();
    const statemachineLanguageConfig = new URL('../../../node_modules/langium-statemachine-dsl/language-configuration.json', window.location.href);
    const responseStatemachineTm = new URL('../../../node_modules/langium-statemachine-dsl/syntaxes/statemachine.tmLanguage.json', window.location.href);
    extensionFilesOrContents.set('/statemachine-configuration.json', statemachineLanguageConfig);
    extensionFilesOrContents.set('/statemachine-grammar.json', await (await fetch(responseStatemachineTm)).text());

    // Language Server preparation
    const workerUrl = new URL('./dist/worker/statemachineServerWorker.js', window.location.href);
    console.log(`Langium worker URL: ${workerUrl}`);

    return {
        htmlElement: htmlElement,
        wrapperConfig: {
            useVscodeConfig: true,
            serviceConfig: {
                enableThemeService: true,
                enableTextmateService: true,
                enableModelService: true,
                configureEditorOrViewsServiceConfig: {
                    enableViewsService: false,
                    useDefaultOpenEditorFunction: true
                },
                configureConfigurationServiceConfig: {
                    defaultWorkspaceUri: '/tmp/'
                },
                enableKeybindingsService: true,
                enableLanguagesService: true,
                debugLogging: true
            },
            monacoVscodeApiConfig: {
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
                extensionFilesOrContents: extensionFilesOrContents,
                userConfiguration: {
                    json: `{
    "workbench.colorTheme": "Default Dark+ Experimental",
    "editor.fontSize": 14,
    "editor.lightbulb.enabled": true,
    "editor.lineHeight": 20,
    "editor.guides.bracketPairsHorizontal": "active",
    "editor.lightbulb.enabled": true
}`
                }
            }
        },
        editorConfig: {
            languageId: 'statemachine',
            code: code,
            useDiffEditor: false,
            automaticLayout: true,
            theme: 'vs-dark',
        },
        languageClientConfig: {
            enabled: true,
            useWebSocket: false,
            workerConfigOptions: {
                url: workerUrl,
                type: 'module',
                name: 'Statemachine LS',
            }
        }
    };
};
