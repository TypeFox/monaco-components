import { GlobalConfig } from 'monaco-editor-wrapper';

export const createLangiumGlobalConfig = async (): Promise<GlobalConfig> => {
    const exampleStatemachineUrl = new URL('./src/langium/example.statemachine', window.location.href).href;
    const responseStatemachine = await fetch(exampleStatemachineUrl);
    const code = await responseStatemachine.text();

    const extensionFiles = new Map<string, URL>();
    const statemachineLanguageConfig = new URL('../../../node_modules/langium-statemachine-dsl/language-configuration.json', window.location.href);
    const responseStatemachineTm = new URL('../../../node_modules/langium-statemachine-dsl/syntaxes/statemachine.tmLanguage.json', window.location.href);
    extensionFiles.set('/statemachine-configuration.json', statemachineLanguageConfig);
    extensionFiles.set('/statemachine-grammar.json', responseStatemachineTm);

    // Language Server preparation
    const workerUrl = new URL('./dist/worker/statemachineServerWorker.js', window.location.href);
    console.log(`Langium worker URL: ${workerUrl}`);

    return {
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
