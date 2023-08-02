import { disposeEditor, startEditor, swapEditors } from './common.js';

import 'vscode/default-extensions/theme-defaults';
import 'vscode/default-extensions/json';

import { buildWorkerDefinition } from 'monaco-editor-workers';
import { WrapperConfig } from 'monaco-editor-wrapper';

buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

const languageId = 'json';
let codeMain = `{
    "$schema": "http://json.schemastore.org/coffeelint",
    "line_endings": {"value": "windows"}
}`;
const codeOrg = `{
    "$schema": "http://json.schemastore.org/coffeelint",
    "line_endings": {"value": "unix"}
}`;

const monacoEditorConfig = {
    glyphMargin: true,
    guides: {
        bracketPairs: true
    },
    lightbulb: {
        enabled: true
    },
};

const userConfig = {
    htmlElement: document.getElementById('monaco-editor-root') as HTMLElement,
    wrapperConfig: {
        serviceConfig: {
            // enable quick access "F1" and add required keybindings service
            enableQuickaccessService: true,
            enableKeybindingsService: true,
            enableThemeService: true,
            enableTextmateService: true,
            enableLanguagesService: true,
            debugLogging: true
        },
        editorAppConfig: {
            editorAppType: 'classic',
            languageExtensionConfig: {
                id: 'json',
                extensions: ['.json', '.jsonc'],
                aliases: ['JSON', 'json'],
                mimetypes: ['application/json']
            }
        }
    } as WrapperConfig,
    editorConfig: {
        languageId: languageId,
        code: codeMain,
        useDiffEditor: false,
        codeOriginal: codeOrg,
        editorOptions: monacoEditorConfig,
        diffEditorOptions: monacoEditorConfig,
        theme: 'vs-dark',
        automaticLayout: true
    },
    languageClientConfig: {
        enabled: true,
        useWebSocket: true,
        webSocketConfigOptions: {
            url: 'ws://localhost:3000/sampleServer',
            startOptions: {
                onCall: () => {
                    console.log('Connected to socket.');
                },
                reportStatus: true
            },
            stopOptions: {
                onCall: () => {
                    console.log('Disconnected from socket.');
                },
                reportStatus: true
            }
        }
    }
};

try {
    document.querySelector('#button-start')?.addEventListener('click', () => {
        startEditor(userConfig, codeMain, codeOrg);
    });
    document.querySelector('#button-swap')?.addEventListener('click', () => {
        swapEditors(userConfig, codeMain, codeOrg);
    });
    document.querySelector('#button-dispose')?.addEventListener('click', async () => {
        codeMain = await disposeEditor(userConfig);
    });

    startEditor(userConfig, codeMain, codeOrg);
} catch (e) {
    console.error(e);
}
