import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react/allLanguages';
import { UserConfig } from 'monaco-editor-wrapper';

const userConfig: UserConfig = {
    htmlElement: document.getElementById('root')!,
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

const onTextChanged = (text: string, isDirty: boolean) => {
    console.log(`Dirty? ${isDirty} Content: ${text}`);
};

const comp = <MonacoEditorReactComp
    userConfig={userConfig}
    style={{
        'paddingTop': '5px',
    }}
    onTextChanged={onTextChanged}
/>;

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(comp);
