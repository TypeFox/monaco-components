import React from 'react';
import ReactDOM from 'react-dom/client';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { createLangiumGlobalConfig } from './langiumWrapperConfig.js';

import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

const startEditor = async () => {
    const langiumGlobalConfig = await createLangiumGlobalConfig(document.getElementById('root')!);
    const comp = <MonacoEditorReactComp
        userConfig={langiumGlobalConfig}
        style={{
            'paddingTop': '5px',
            'height': '80vh'
        }}
    />;

    const root = ReactDOM.createRoot(document.getElementById('root')!);
    root.render(comp);
};

try {
    startEditor();
} catch (e) {
    console.error(e);
}
