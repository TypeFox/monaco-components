import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { createLangiumGlobalConfig } from './langiumWrapperConfig.js';

const startEditor = async () => {
    const langiumGlobalConfig = await createLangiumGlobalConfig();
    const comp = <MonacoEditorReactComp
        globalConfig={langiumGlobalConfig}
        style={{
            'paddingTop': '5px',
            'height': '80vh',
            'width': '100%'
        }}
    />;

    const root = ReactDOM.createRoot(document.getElementById('root')!);
    root.render(comp);
};

startEditor();
