import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react/allLanguages';

const languageId = 'typescript';
const codeMain = `function sayHello(): string {
    return "Hello";
};`;
const comp = <MonacoEditorReactComp
    languageId={languageId}
    text={codeMain}
    style={{
        'paddingTop': '5px',
        'height': '100%',
        'width': '100%'
    }}
/>;

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(comp);
