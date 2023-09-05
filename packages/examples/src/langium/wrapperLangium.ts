/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018-2022 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import 'vscode/default-extensions/theme-defaults';
import { MonacoEditorLanguageClientWrapper, UserConfig } from 'monaco-editor-wrapper';
import { buildWorkerDefinition } from 'monaco-editor-workers';

export const setupLangiumClient = async (): Promise<UserConfig> => {
    const exampleLangiumUrl = new URL('./src/langium/content/example.langium', window.location.href).href;
    const responseLangium = await fetch(exampleLangiumUrl);
    const code = await responseLangium.text();

    const extensionFilesOrContents = new Map<string, string | URL>();
    const langiumLanguageConfig = new URL('./src/langium/config/langium.configuration.json', window.location.href);
    const langiumTextmateGrammar = new URL('./src/langium/config/langium.tmLanguage.json', window.location.href);
    // test both url and string content
    extensionFilesOrContents.set('/langium-configuration.json', langiumLanguageConfig);
    extensionFilesOrContents.set('/langium-grammar.json', await (await fetch(langiumTextmateGrammar)).text());

    // Language Server preparation
    const workerUrl = new URL('./src/servers/langium-server.ts', window.location.href);
    console.log(`Langium worker URL: ${workerUrl}`);

    const worker = new Worker(workerUrl, {
        type: 'module',
        name: 'Langium LS',
    });

    return {
        htmlElement: document.getElementById('monaco-editor-root') as HTMLElement,
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
                languageId: 'langium',
                code: code,
                useDiffEditor: false,
                extension: {
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
                worker
            }
        }
    };
};

export const startLangiumClient = async () => {
    try {
        buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers/', new URL('', window.location.href).href, false);
        const config = await setupLangiumClient();
        const wrapper = new MonacoEditorLanguageClientWrapper();
        wrapper.start(config);
    } catch (e) {
        console.log(e);
    }
};
