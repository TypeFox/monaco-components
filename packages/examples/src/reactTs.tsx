import React from 'react';
import ReactDOM from 'react-dom/client';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { UserConfig } from 'monaco-editor-wrapper';

import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js';

import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

const rootElem = document.getElementById('root')!;
const userConfig: UserConfig = {
    htmlElement: rootElem,
    wrapperConfig: {
        serviceConfig: {
            // enable quick access "F1" and add required keybindings service
            enableQuickaccessService: true,
            enableKeybindingsService: true,
            debugLogging: true
        },
        editorAppConfig: {
            $type: 'classic',
            languageId: 'typescript',
            useDiffEditor: false,
            theme: 'vs-dark',
            code: `function sayHello(): string {
    return "Hello";
};`
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
