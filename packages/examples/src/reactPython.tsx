import React from 'react';
import ReactDOM from 'react-dom/client';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { UserConfig } from 'monaco-editor-wrapper';

import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js';

import { buildWorkerDefinition } from 'monaco-editor-workers';
import { Uri, commands } from 'vscode';
import { MonacoLanguageClient } from 'monaco-languageclient';

buildWorkerDefinition('../../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

/**
 * Code is intentionally incorrect - language server will pick this up on connection and highlight the error
 */
const code = `def main():
    return pass`;

const rootElem = document.getElementById('root')!;
const userConfig: UserConfig = {
    htmlElement: rootElem,
    languageClientConfig: {
        options: {
            name: 'Python Language Server Example',
            $type: 'WebSocket',
            host: 'localhost',
            port: 30000,
            path: 'pyright',
            extraParams: {
                authorization: 'UserAuth'
            },
            secured: false,
            startOptions: {
                onCall: (languageClient?: MonacoLanguageClient ) => {
                    setTimeout(()=>{
                        ['pyright.restartserver', 'pyright.organizeimports'].forEach((cmdName) => {
                            commands.registerCommand(cmdName, (...args: unknown[]) => {
                                languageClient?.sendRequest('workspace/executeCommand', { command: cmdName, arguments: args });
                            });
                        });
                    },250);
                },
                reportStatus: true,
            }
        }, configurationOptions: {
            workspaceFolder: {
                index: 0,
                name: 'workspace',
                uri: Uri.parse('/tmp/')
            },
        },
    },
    wrapperConfig: {
        serviceConfig: {enableModelService: true,
            enableThemeService: true,
            enableTextmateService: true,
            configureConfigurationService: {
                defaultWorkspaceUri: '/tmp/'
            },
            enableLanguagesService: true,
            // enableKeybindingsService: true,
            debugLogging: true
        },
        editorAppConfig: {
            $type: 'vscodeApi',
            extension:{
                name: 'python-client',
                publisher: 'monaco-languageclient-project',
                version: '1.0.0',
                engines: {
                    vscode: '^1.81.5'
                },
                contributes: {
                    languages: [{
                        id: 'python',
                        extensions: ['.py', 'pyi'],
                        aliases: ['python'],
                        mimetypes: ['application/python'],
                    }],
                    commands: [{
                        command: 'pyright.restartserver',
                        title: 'Pyright: Restart Server',
                        category: 'Pyright'
                    },
                    {
                        command: 'pyright.organizeimports',
                        title: 'Pyright: Organize Imports',
                        category: 'Pyright'
                    }],
                    keybindings: [{
                        key: 'ctrl+k',
                        command: 'pyright.restartserver',
                        when: 'editorTextFocus'
                    }]
                }
            },
            languageId: 'python',
            codeUri: '/tmp/python.py',
            userConfiguration: {
                json: JSON.stringify({'workbench.colorTheme': 'Default Dark Modern'})
            },
            useDiffEditor: false,
            code: code,
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
