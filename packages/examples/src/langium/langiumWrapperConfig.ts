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

    const worker = new Worker(workerUrl, {
        type: 'module',
        name: 'Statemachine LS',
    });

    return {
        htmlElement: htmlElement,
        wrapperConfig: {
            serviceConfig: {
                enableThemeService: true,
                enableTextmateService: true,
                enableModelService: true,
                configureEditorOrViewsServiceConfig: {
                },
                configureConfigurationServiceConfig: {
                    defaultWorkspaceUri: '/tmp/'
                },
                enableLanguagesService: true,
                // enable quick access "F1" and add required keybindings service
                enableQuickaccessService: true,
                enableKeybindingsService: true,
                debugLogging: true
            },
            editorAppConfig: {
                editorAppType: 'vscodeApi',
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
    "editor.fontSize": 14,
    "editor.lightbulb.enabled": true,
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
            workerConfigOptions: worker
        }
    };
};
