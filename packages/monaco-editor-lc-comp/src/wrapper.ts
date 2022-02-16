// Monaco Editor Imports
import * as monaco from 'monaco-editor-core';

import monacoStyles from 'monaco-editor-core/min/vs/editor/editor.main.css';

import editorWorker from 'monaco-editor-core/esm/vs/editor/editor.worker?worker&inline';

import { MonacoLanguageClient, MessageConnection, CloseAction, ErrorAction, MonacoServices, createConnection } from '@codingame/monaco-languageclient';
import { listen } from '@codingame/monaco-jsonrpc';
import normalizeUrl from 'normalize-url';

import { CodeEditorConfig } from './main';

export type WebSocketConf = {
    secured: boolean;
    host: string;
    port: number;
    path: string;
}

export class WorkerOverride {

    // static worker load override functions
    static getEditorWorker() {
        return new editorWorker();
    }

}

export class MonacoLanguageClientWrapper {

    private editor?: monaco.editor.IStandaloneCodeEditor;
    private editorConfig: CodeEditorConfig;

    constructor(editorConfig: CodeEditorConfig) {
        this.editorConfig = editorConfig;
    }

    updateEditorConfig(editorConfig: CodeEditorConfig) {
        this.editorConfig = editorConfig;
    }

    startEditor(container?: HTMLElement, dispatchEvent?: (event: Event) => boolean) {
        this.defineMonacoEnvironment();
        this.editor = monaco.editor.create(container!);
        this.updateEditor();

        this.installMonaco();
        this.establishWebSocket(this.editorConfig.webSocket);

        this.editor.getModel()!.onDidChangeContent(() => {
            if (dispatchEvent) {
                dispatchEvent(new CustomEvent('ChangeContent', { detail: {} }));
            }
        });
    }

    updateEditor() {
        // apply monarch definitions
        if (this.editorConfig.languageDef) {
            monaco.languages.register({ id: this.editorConfig.languageId });
            monaco.languages.setMonarchTokensProvider(this.editorConfig.languageId, this.editorConfig.languageDef);
        }
        if (this.editorConfig.themeData) {
            monaco.editor.defineTheme(this.editorConfig.theme, this.editorConfig.themeData);
        }

        // configure options
        this.editor?.updateOptions({
            readOnly: this.editorConfig.readOnly,
        });
        this.editor?.setValue(this.editorConfig.code);
        this.setTheme(this.editorConfig.theme);

        const currentModel = this.editor?.getModel();
        if (currentModel && currentModel.getLanguageId() !== this.editorConfig.languageId) {
            monaco.editor.setModelLanguage(currentModel, this.editorConfig.languageId);
        }
    }

    setTheme(theme: string) {
        monaco.editor.setTheme(theme);
    }

    defineMonacoEnvironment() {
        const getWorker = (_: string, label: string) => {
            console.log('getWorker: workerId: ' + _ + ' label: ' + label);
            return WorkerOverride.getEditorWorker();
        };

        const monWin = (self as monaco.Window);
        if (monWin) {
            if (!monWin.MonacoEnvironment) {
                monWin.MonacoEnvironment = {
                    getWorker: getWorker
                };
            }
            else {
                monWin.MonacoEnvironment.getWorker = getWorker;
            }
        }
    }

    installMonaco() {
        // install Monaco language client services
        if (monaco) MonacoServices.install(monaco);
    }

    establishWebSocket(websocketConfig: WebSocketConf) {
        // create the web socket
        const url = this.createUrl(websocketConfig);
        const webSocket = new WebSocket(url);

        // listen when the web socket is opened
        listen({
            webSocket,
            onConnection: connection => {
                console.log('Connected');

                // create and start the language client
                const languageClient = this.createLanguageClient(connection);
                const disposable = languageClient.start();
                connection.onClose(() => disposable.dispose());
            }
        });
    }

    private createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
        return new MonacoLanguageClient({
            name: 'Sample Language Client',
            clientOptions: {
                // use a language id as a document selector
                documentSelector: [this.editorConfig.languageId],
                // disable the default error handler
                errorHandler: {
                    error: () => ErrorAction.Continue,
                    closed: () => CloseAction.DoNotRestart
                }
            },
            // create a language client connection from the JSON RPC connection on demand
            connectionProvider: {
                get: (errorHandler, closeHandler) => {
                    return Promise.resolve(createConnection(connection, errorHandler, closeHandler));
                }
            }
        });
    }

    private createUrl(websocketConfig: WebSocketConf) {
        const protocol = websocketConfig.secured ? 'wss' : 'ws';
        return normalizeUrl(`${protocol}://${websocketConfig.host}:${websocketConfig.port}/${websocketConfig.path}`);
    }

}

export { monaco, monacoStyles };
