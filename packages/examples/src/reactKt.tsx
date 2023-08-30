import React from 'react';
import ReactDOM from 'react-dom/client';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { UserConfig } from 'monaco-editor-wrapper';

import 'monaco-editor/esm/vs/basic-languages/kotlin/kotlin.contribution.js';

import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

const rootElem = document.getElementById('root')!;
const userConfig: UserConfig = {
    htmlElement: rootElem,
    wrapperConfig: {
        serviceConfig: {
            enableKeybindingsService: true,
            debugLogging: true
        },
        editorAppConfig: {
            $type: 'classic',
            languageId: 'kotlin',
            useDiffEditor: false,
            theme: 'vs-dark',
            code: `fun sayHello(): String {
    return "Hello";
}`,
            languageExtensionConfig: {
                id: 'kotlin',
                extensions: ['.kts', '.kt'],
                aliases: ['KOTLIN', 'kotlin'],
                mimetypes: ['text/x-kotlin-source', 'text/x-kotlin'],
            }
        }
    },
    languageClientConfig: {
        options: {
            $type: 'WebSocketUrl',
            url: 'ws://localhost:30000/kotlin',
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

const onTextChanged = (text: string, isDirty: boolean) => {
    console.log(`Dirty? ${isDirty} Content: ${text}`);
};

const comp = <MonacoEditorReactComp
    userConfig={userConfig}
    style={{
        'paddingTop': '5px',
        'height': '80vh'
    }}
    onTextChanged={onTextChanged}
/>;

const root = ReactDOM.createRoot(rootElem);
root.render(comp);
