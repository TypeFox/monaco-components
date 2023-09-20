import ReactDOM from 'react-dom/client';
import React, { useState } from 'react';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { UserConfig } from 'monaco-editor-wrapper';

import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js';

import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

const EditorDemo: React.FC = () => {
    const logMessage = 'console.log(\'hello\')';
    const [content, setContent] = useState(logMessage);

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
                languageId: 'typescript',
                useDiffEditor: false,
                theme: 'vs-dark',
                code: content
            }
        }
    };

    const addConsoleMessage = () => {
        setContent(`${content}\n${logMessage}`);
    };

    const onTextChanged = (text: string, isDirty: boolean) => {
        console.log(`Dirty? ${isDirty} Content: ${text}`);
    };

    return (
        <>
            <button onClick={addConsoleMessage}>
                Update Code
            </button>
            <MonacoEditorReactComp
                userConfig={userConfig}
                style={{
                    'paddingTop': '5px',
                    'height': '80vh'
                }}
                onTextChanged={onTextChanged}
            />
        </>

    );
};

const comp = <EditorDemo />;
const rootElem = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElem);
root.render(comp);
