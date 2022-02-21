// Monaco Editor Imports
import * as monaco from 'monaco-editor-core';

import editorWorker from 'monaco-editor-core/esm/vs/editor/editor.worker?worker&inline';

import { MonacoLanguageClient, MessageConnection, CloseAction, ErrorAction, MonacoServices, createConnection } from '@codingame/monaco-languageclient';
import { listen } from '@codingame/monaco-jsonrpc';
import normalizeUrl from 'normalize-url';

export type WebSocketConfigOptions = {
    wsSecured: boolean;
    wsHost: string;
    wsPort: number;
    wsPath: string;
}

export class CodeEditorConfig {

    useDiffEditor = false;

    monacoEditorOptions: Record<string, unknown> | undefined = {
        code: '',
        languageId: 'javascript',
        theme: 'vs-light',
        readOnly: false
    };
    webSocketOptions: WebSocketConfigOptions = {
        wsSecured: false,
        wsHost: 'localhost',
        wsPort: 8080,
        wsPath: ''
    };
    monacoDiffEditorOptions: Record<string, unknown> | undefined = {
        diffEditorOriginal: ['default', 'text/plain'],
        diffEditorModified: ['default', 'text/plain']
    };

    languageDef: monaco.languages.IMonarchLanguage | undefined = undefined;
    themeData: monaco.editor.IStandaloneThemeData | undefined = undefined;
}

export class WorkerOverride {

    // static worker load override functions
    static getEditorWorker() {
        return new editorWorker();
    }
}

export class MonacoLanguageClientWrapper {

    private editor: monaco.editor.IStandaloneCodeEditor | undefined;
    private diffEditor: monaco.editor.IStandaloneDiffEditor | undefined;

    private editorConfig: CodeEditorConfig = new CodeEditorConfig();

    getEditorConfig() {
        return this.editorConfig;
    }

    setTheme(theme: string) {
        monaco.editor.setTheme(theme);
    }

    setUseDiffEditor(useDiffEditor: boolean) {
        this.editorConfig.useDiffEditor = useDiffEditor;
    }

    updateBasicConfigItems(languageId: string | undefined, code: string | undefined, theme: string | undefined) {
        if (this.editorConfig.monacoEditorOptions) {
            if (languageId) this.editorConfig.monacoEditorOptions.languageId = languageId;
            if (code) this.editorConfig.monacoEditorOptions.code = code;
            if (theme) this.editorConfig.monacoEditorOptions.theme = theme;
        }
    }

    updateWebSocketOptions(wsSecured: boolean, wsHost: string, wsPort: number, wsPath: string) {
        if (wsSecured) this.editorConfig.webSocketOptions.wsSecured = wsSecured;
        if (wsHost) this.editorConfig.webSocketOptions.wsHost = wsHost;
        if (wsPort) this.editorConfig.webSocketOptions.wsPort = wsPort;
        if (wsPath) this.editorConfig.webSocketOptions.wsPath = wsPath;
    }

    startEditor(container?: HTMLElement, dispatchEvent?: (event: Event) => boolean) {
        // register Worker function
        this.defineMonacoEnvironment();

        if (this.editorConfig.useDiffEditor) {
            this.diffEditor = monaco.editor.createDiffEditor(container!);
        }
        else {
            this.editor = monaco.editor.create(container!);
            this.editor.getModel()!.onDidChangeContent(() => {
                if (dispatchEvent) {
                    dispatchEvent(new CustomEvent('ChangeContent', { detail: {} }));
                }
            });
        }
        this.updateEditor();

        this.installMonaco();
        this.establishWebSocket(this.editorConfig.webSocketOptions);

        this.editor?.getModel()!.onDidChangeContent(() => {
            if (dispatchEvent) {
                dispatchEvent(new CustomEvent('ChangeContent', { detail: {} }));
            }
        });
    }

    updateEditor() {
        if (this.editorConfig.useDiffEditor) {
            this.updateDiffEditor();
        }
        else {
            this.updateMainEditor();
        }
    }

    private updateMainEditor() {
        const languageId = this.editorConfig.monacoEditorOptions ? this.editorConfig.monacoEditorOptions.languageId as string : undefined;
        const theme = this.editorConfig.monacoEditorOptions ? this.editorConfig.monacoEditorOptions.theme as string : undefined;

        // apply monarch definitions
        if (this.editorConfig.languageDef && languageId) {
            monaco.languages.register({ id: languageId });
            monaco.languages.setMonarchTokensProvider(languageId, this.editorConfig.languageDef);
        }
        if (this.editorConfig.themeData && theme) {
            monaco.editor.defineTheme(theme, this.editorConfig.themeData);
        }

        const options = this.editorConfig.monacoEditorOptions as monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions;
        this.editor?.updateOptions(options);

        const currentModel = this.editor?.getModel();
        if (languageId && currentModel && currentModel.getLanguageId() !== languageId) {
            monaco.editor.setModelLanguage(currentModel, languageId);
        }

        const code = this.editorConfig.monacoEditorOptions ? this.editorConfig.monacoEditorOptions.code as string: undefined;
        if (code) this.editor?.setValue(code);
    }

    private updateDiffEditor() {
        const options = this.editorConfig.monacoDiffEditorOptions as monaco.editor.IDiffEditorOptions;
        this.diffEditor?.updateOptions(options);
        this.updateDiffModels();
    }

    private updateDiffModels() {
        if (this.editorConfig.monacoDiffEditorOptions) {
            const diffEditorOriginal = this.editorConfig.monacoDiffEditorOptions.diffEditorOriginal as [string, string];
            const diffEditorModified = this.editorConfig.monacoDiffEditorOptions.diffEditorModified as [string, string];

            const originalModel = monaco.editor.createModel(diffEditorOriginal[0], diffEditorOriginal[1]);
            const modifiedModel = monaco.editor.createModel(diffEditorModified[0], diffEditorModified[1]);

            this.diffEditor?.setModel({
                original: originalModel,
                modified: modifiedModel
            });
        }
    }

    private defineMonacoEnvironment() {
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

    private installMonaco() {
        // install Monaco language client services
        if (monaco) MonacoServices.install(monaco);
    }

    private establishWebSocket(websocketConfig: WebSocketConfigOptions) {
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
        const languageId = this.editorConfig.monacoEditorOptions ? this.editorConfig.monacoEditorOptions.languageId as string : '';
        return new MonacoLanguageClient({
            name: 'Sample Language Client',
            clientOptions: {
                // use a language id as a document selector
                documentSelector: [languageId],
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

    private createUrl(websocketConfig: WebSocketConfigOptions) {
        const protocol = websocketConfig.wsSecured ? 'wss' : 'ws';
        return normalizeUrl(`${protocol}://${websocketConfig.wsHost}:${websocketConfig.wsPort}/${websocketConfig.wsPath}`);
    }

}

export { monaco };
