/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018-2022 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import 'vscode/default-extensions/theme-defaults';
import { MonacoEditorLanguageClientWrapper, UserConfig } from 'monaco-editor-wrapper';
import { buildWorkerDefinition } from 'monaco-editor-workers';
import { LangiumMonarchContent } from './config/langium.monarch.js';

buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers/', new URL('', window.location.href).href, false);

let wrapper: MonacoEditorLanguageClientWrapper | undefined;

export const setupLangiumClientVscodeApi = async (): Promise<UserConfig> => {
    const code = await getTextContent(new URL('./src/langium/content/example.langium', window.location.href));

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

export const setupLangiumClientClassic = async (): Promise<UserConfig> => {
    const code = await getTextContent(new URL('./src/langium/content/example.langium', window.location.href));

    // Language Server preparation
    const workerUrl = new URL('./src/servers/langium-server.ts', window.location.href);
    console.log(`Langium worker URL: ${workerUrl}`);

    const worker = new Worker(workerUrl, {
        type: 'module',
        name: 'Langium LS',
    });

    return {
        htmlElement: document.getElementById('monaco-editor-root') as HTMLElement,
        loggerConfig: {
            enabled: true,
            debugEnabled: true
        },
        wrapperConfig: {
            serviceConfig: {
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
                $type: 'classic',
                languageId: 'langium',
                code: code,
                useDiffEditor: false,
                editorOptions: {
                    glyphMargin: true,
                    guides: {
                        bracketPairs: true
                    },
                    lightbulb: {
                        enabled: true
                    },
                    theme: 'vs-dark',
                    'semanticHighlighting.enabled': true
                },
                languageExtensionConfig: { id: 'langium' },
                languageDef: LangiumMonarchContent
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

const getTextContent = async (url: URL) => {
    const response = await fetch(url.href);
    return response.text();
};

try {
    document.querySelector('#button-start-classic')?.addEventListener('click', async () => {
        await startLangiumClientClassic();
    });
    document.querySelector('#button-start-vscode-api')?.addEventListener('click', async () => {
        await startLangiumClientVscodeApi();
    });
    document.querySelector('#button-dispose')?.addEventListener('click', async () => {
        await disposeEditor();
    });
} catch (e) {
    console.error(e);
}

export const startLangiumClientVscodeApi = async () => {
    try {
        if (checkStarted()) return;
        const config = await setupLangiumClientVscodeApi();
        wrapper = new MonacoEditorLanguageClientWrapper();
        wrapper.start(config);
    } catch (e) {
        console.log(e);
    }
};

export const startLangiumClientClassic = async () => {
    try {
        if (checkStarted()) return;
        const config = await setupLangiumClientClassic();
        wrapper = new MonacoEditorLanguageClientWrapper();
        wrapper.start(config);
    } catch (e) {
        console.log(e);
    }
};

const checkStarted = () => {
    if (wrapper?.isStarted()) {
        alert('Editor was already started!');
        return true;
    }
    return false;
};

export const disposeEditor = async () => {
    if (!wrapper) return;
    wrapper.reportStatus();
    await wrapper.dispose();
    wrapper = undefined;
};
