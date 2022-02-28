// Monaco Editor Imports
import * as monaco from 'monaco-editor-core';

import editorWorker from 'monaco-editor-core/esm/vs/editor/editor.worker?worker&inline';

import { MonacoLanguageClient, MessageConnection, CloseAction, ErrorAction, MonacoServices, createConnection } from 'monaco-languageclient';
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
    codeOriginal: [string, string] = ['', 'javascript'];
    codeModified: [string, string] = ['default', 'text/plain'];
    monacoEditorOptions: Record<string, unknown> = {
        theme: 'vs-light',
        readOnly: false
    };
    webSocketOptions: WebSocketConfigOptions = {
        wsSecured: false,
        wsHost: 'localhost',
        wsPort: 8080,
        wsPath: ''
    };
    monacoDiffEditorOptions: Record<string, unknown> = {};
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
    }

    swapEditors(container?: HTMLElement, dispatchEvent?: (event: Event) => boolean): void {
        if (this.editorConfig.useDiffEditor) {
            if (this.editor) {
                this.editor?.dispose();
            }
            if (!this.diffEditor) {
                this.startEditor(container, dispatchEvent);
            }
        }
        else {
            if (this.diffEditor) {
                this.diffEditor?.dispose();
            }
            if (!this.editor) {
                this.startEditor(container, dispatchEvent);
            }
        }
    }

    updateEditor() {
        if (this.editorConfig.useDiffEditor) {
            this.updateDiffEditor();
        }
        else {
            this.updateMainEditor();
        }
    }

    updateDiffEditorContent(diffEditorOriginal: [string, string], diffEditorModified: [string, string]) {
        this.editorConfig.codeOriginal = diffEditorOriginal;
        this.editorConfig.codeModified = diffEditorModified;
        this.updateDiffEditor();
    }

    private updateMainEditor() {
        const languageId = this.editorConfig.codeOriginal[1];
        const theme = this.editorConfig.monacoEditorOptions.theme as string;

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

        if (this.editorConfig.codeOriginal[0]) this.editor?.setValue(this.editorConfig.codeOriginal[0]);
    }

    private updateDiffEditor() {
        const options = this.editorConfig.monacoDiffEditorOptions as monaco.editor.IDiffEditorOptions;
        this.diffEditor?.updateOptions(options);
        this.updateDiffModels();
    }

    private updateDiffModels() {
        if (this.diffEditor) {
            const originalModel = monaco.editor.createModel(this.editorConfig.codeOriginal[0], this.editorConfig.codeOriginal[1]);
            const modifiedModel = monaco.editor.createModel(this.editorConfig.codeModified[0], this.editorConfig.codeModified[1]);

            this.diffEditor.setModel({
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
        return new MonacoLanguageClient({
            name: 'Sample Language Client',
            clientOptions: {
                // use a language id as a document selector
                documentSelector: [this.editorConfig.codeOriginal[1]],
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
