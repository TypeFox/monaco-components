import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
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

const userConfig: UserConfig = {
    wrapperConfig: {
        serviceConfig: {
            userServices: {
                ...getKeybindingsServiceOverride(),
            },
            debugLogging: true
        },
        editorAppConfig: {
            $type: 'extended',
            languageId: languageId,
            code: codeMain,
            useDiffEditor: false,
            codeOriginal: codeOrg,
            // Ensure all required extensions are loaded before setting up the language extension
            awaitExtensionReadiness: [whenReadyJson],
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
    const htmlElement = document.getElementById('monaco-editor-root');
    document.querySelector('#button-start')?.addEventListener('click', () => {
        startEditor(userConfig, htmlElement, codeMain, codeOrg);
    });
    document.querySelector('#button-swap')?.addEventListener('click', () => {
        swapEditors(userConfig, htmlElement, codeMain, codeOrg);
    });
    document.querySelector('#button-dispose')?.addEventListener('click', async () => {
        codeMain = await disposeEditor(userConfig.wrapperConfig.editorAppConfig.useDiffEditor);
    });

    startEditor(userConfig, htmlElement, codeMain, codeOrg);
} catch (e) {
    console.error(e);
}
