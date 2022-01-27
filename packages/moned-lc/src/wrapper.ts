// Monaco Editor Imports
import * as monaco from 'monaco-editor-core';

import styles from 'monaco-editor-core/min/vs/editor/editor.main.css';

import editorWorker from 'monaco-editor-core/esm/vs/editor/editor.worker?worker';

function baseWorkerDefinition(monWin: monaco.Window) {
    if (!monWin) return;

    monWin.MonacoEnvironment = {
        getWorker: (_: string, _label: string) => {
            return new editorWorker();
        },
    };
}

import { MonacoWrapperDef } from 'moned-base';

import { MonacoLanguageClient, MessageConnection, CloseAction, ErrorAction, MonacoServices, createConnection } from '@codingame/monaco-languageclient';
import { listen } from '@codingame/monaco-jsonrpc';
import normalizeUrl from 'normalize-url';

import { MonedLCCodeEditorConfig, WebSocketConf } from './main';

export class MonacoLanguageClientWrapper implements MonacoWrapperDef {

    private monWin: monaco.Window;

    private editor?: monaco.editor.IStandaloneCodeEditor;

    private editorConfig: MonedLCCodeEditorConfig;

    constructor(editorConfig: MonedLCCodeEditorConfig) {
        this.monWin = self as monaco.Window;
        this.editorConfig = editorConfig;
        baseWorkerDefinition(this.monWin);
    }

    updateEditorConfig(editorConfig: MonedLCCodeEditorConfig) {
        this.editorConfig = editorConfig;
    }

    startEditor(container?: HTMLElement, dispatchEvent?: (event: Event) => boolean) {
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
        const options = this.editorConfig.buildEditorConf();
        this.editor?.updateOptions(options as monaco.editor.IStandaloneEditorConstructionOptions);

        const currentModel = this.editor?.getModel();
        if (currentModel && currentModel.getLanguageId() !== this.editorConfig.languageId) {
            monaco.editor.setModelLanguage(currentModel, this.editorConfig.languageId);
        }
        this.editor?.setValue(this.editorConfig.code);
    }

    registerMonarchTokensProvider(languageDef: monaco.languages.IMonarchLanguage) {
        monaco.languages.register({ id: this.editorConfig.languageId });
        monaco.languages.setMonarchTokensProvider(this.editorConfig.languageId, languageDef);
    }

    registerEditorTheme(themeData: monaco.editor.IStandaloneThemeData) {
        monaco.editor.defineTheme(this.editorConfig.theme, themeData);
    }

    setTheme(theme: string) {
        monaco.editor.setTheme(theme);
    }

    installMonaco() {
        // install Monaco language client services
        if (monaco) MonacoServices.install(monaco);
    }

    establishWebSocket(websocketConfig: WebSocketConf) {
        // create the web socket
        const url = this.createUrl(websocketConfig);
        const webSocket = new WebSocket(url);
        /*
                new ReconnectingWebSocket(url, [], {
                    maxReconnectionDelay: 10000,
                    minReconnectionDelay: 1000,
                    reconnectionDelayGrowFactor: 1.3,
                    connectionTimeout: 10000,
                    maxRetries: Infinity,
                    debug: false
                });
        */
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
                documentSelector: ['json'],
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

export { monaco, styles, baseWorkerDefinition };
