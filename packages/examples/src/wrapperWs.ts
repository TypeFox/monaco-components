import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import { whenReady as whenReadyTheme } from '@codingame/monaco-vscode-theme-defaults-default-extension';
import { whenReady as whenReadyJson } from '@codingame/monaco-vscode-json-default-extension';
import { disposeEditor, startEditor, swapEditors } from './common.js';
import { UserConfig } from 'monaco-editor-wrapper';
import { buildWorkerDefinition } from 'monaco-editor-workers';

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

const userConfig: UserConfig = {
    htmlElement: document.getElementById('monaco-editor-root') as HTMLElement,
    wrapperConfig: {
        serviceConfig: {
            userServices: {
                ...getThemeServiceOverride(),
                ...getTextmateServiceOverride(),
                ...getKeybindingsServiceOverride(),
            },
            debugLogging: true
        },
        editorAppConfig: {
            $type: 'classic',
            languageId: languageId,
            code: codeMain,
            useDiffEditor: false,
            codeOriginal: codeOrg,
            editorOptions: monacoEditorConfig,
            diffEditorOptions: monacoEditorConfig,
            theme: 'vs-dark',
            // Ensure all required extensions are loaded before setting up the language extension
            awaitExtensionReadiness: [whenReadyTheme, whenReadyJson],
            languageExtensionConfig: {
                id: 'json',
                extensions: ['.json', '.jsonc'],
                aliases: ['JSON', 'json'],
                mimetypes: ['application/json']
            }
        }
    },
    languageClientConfig: {
        options: {
            $type: 'WebSocketUrl',
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
        codeMain = await disposeEditor(userConfig.wrapperConfig.editorAppConfig.useDiffEditor);
    });

    startEditor(userConfig, codeMain, codeOrg);
} catch (e) {
    console.error(e);
}
