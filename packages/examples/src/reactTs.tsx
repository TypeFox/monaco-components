import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react/allLanguages';
import { GlobalConfig } from 'monaco-editor-wrapper';

const globalConfig: GlobalConfig = {
    wrapperConfig: {
        useVscodeConfig: false,
        monacoEditorConfig: {
        },
    },
    editorConfig: {
        languageId: 'typescript',
        useDiffEditor: false,
        automaticLayout: true,
        theme: 'vs-dark',
        code: `function sayHello(): string {
    return "Hello";
};`
    },
    languageClientConfig: {
        enabled: false
    }
};

const comp = <MonacoEditorReactComp
    globalConfig={globalConfig}
    style={{
        'paddingTop': '5px',
        'height': '80vh',
        'width': '100%'
    }}
/>;

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(comp);
