import 'monaco-editor/esm/vs/editor/editor.all.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

import { createConfiguredEditor, createConfiguredDiffEditor } from 'vscode/monaco';

import { getMonacoCss } from './generated/css.js';

import { MonacoLanguageClient, MonacoServices } from 'monaco-languageclient';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver-protocol/browser.js';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient/lib/common/client.js';
import normalizeUrl from 'normalize-url';

import type { } from 'css-font-loading-module';

import { MonacoVscodeApiActivtion, VscodeApiConfig } from './vscodeApiConfig.js';
import { MonacoConfig } from './monacoConfig.js';
import type { WebSocketConfigOptions, WorkerConfigOptions } from './codeEditorConfig.js';
import { CodeEditorConfig } from './codeEditorConfig.js';

export class MonacoEditorLanguageClientWrapper {

    private editor: monaco.editor.IStandaloneCodeEditor | undefined;
    private diffEditor: monaco.editor.IStandaloneDiffEditor | undefined;
    private editorConfig: CodeEditorConfig = new CodeEditorConfig();
    private languageClient: MonacoLanguageClient | undefined;
    private worker: Worker | undefined;
    private messageTransports: MessageTransports | undefined;
    private id: string;

    private useVscodeConfig: boolean;
    private monacoConfig = new MonacoConfig();
    private vscodeApiConfig = new VscodeApiConfig();

    constructor(config: {
        useVscodeConfig: boolean,
        vscodeActivationConfig?: MonacoVscodeApiActivtion,
        id?: string
    }) {
        this.id = config.id ?? Math.floor(Math.random() * 101).toString();
        this.useVscodeConfig = config.useVscodeConfig;

        if (this.useVscodeConfig) {
            this.vscodeApiConfig.init(config.vscodeActivationConfig);
        } else {
            this.monacoConfig.init();
        }
    }

    getEditorConfig() {
        return this.editorConfig;
    }

    getMonacoConfig() {
        return this.monacoConfig;
    }

    getVscodeApiConfig() {
        return this.vscodeApiConfig;
    }

    getEditor(): monaco.editor.IStandaloneCodeEditor | undefined {
        return this.editor;
    }

    getDiffEditor(): monaco.editor.IStandaloneDiffEditor | undefined {
        return this.diffEditor;
    }

    getLanguageClient(): MonacoLanguageClient | undefined {
        return this.languageClient;
    }

    getMainCode(): string | undefined {
        if (this.editor) {
            return this.editor?.getValue();
        } else {
            return this.diffEditor?.getOriginalEditor().getValue();
        }
    }

    getDiffCode(): string | undefined {
        return this.diffEditor?.getModifiedEditor().getValue();
    }

    updateTheme(theme: string) {
        monaco.editor.setTheme(theme);
    }

    setWorker(worker: Worker, messageTransports?: MessageTransports) {
        this.worker = worker;
        if (messageTransports) {
            this.messageTransports = messageTransports;
        }
    }

    getMessageTransports(): MessageTransports | undefined {
        return this.messageTransports;
    }

    isStarted(): boolean {
        const haveEditor = this.editor !== undefined || this.diffEditor !== undefined;
        if (this.editorConfig.isUseLanguageClient()) {
            return haveEditor && this.languageClient !== undefined && this.languageClient.isRunning();
        }
        else {
            return haveEditor;
        }
    }

    startEditor(container?: HTMLElement): Promise<string> {
        console.log(`Starting monaco-editor (${this.id})`);
        if (!container) {
            return Promise.reject(new Error('No HTMLElement was provided.'));
        }

        // dispose old instances (try both, no need for swap)
        this.disposeEditor();
        this.disposeDiffEditor();

        if (this.useVscodeConfig) {
            this.vscodeApiConfig.setup();
        } else {
            this.monacoConfig.updateMonacoConfig(this.editorConfig.getMainLanguageId(), this.editorConfig.getTheme());
        }

        if (this.editorConfig.isUseDiffEditor()) {
            this.createDiffEditor(container);
        } else {
            this.createEditor(container);
        }

        if (this.editorConfig.isUseLanguageClient()) {
            console.log('Enabling monaco-languageclient');
            this.installMonaco();
            return this.startLanguageClientConnection(this.editorConfig.getLanguageClientConfigOptions());
        } else {
            return Promise.resolve('All fine. monaco-languageclient is not used.');
        }
    }

    dispose(): Promise<string> {
        this.disposeEditor();
        this.disposeDiffEditor();

        if (this.editorConfig.isUseLanguageClient()) {
            return this.disposeLanguageClient();
        }
        else {
            return Promise.resolve('Monaco editor has been disposed');
        }
    }

    async restartLanguageClient(): Promise<string> {
        await this.disposeLanguageClient();
        if (!this.useVscodeConfig) {
            this.monacoConfig.updateMonacoConfig(this.editorConfig.getMainLanguageId(), this.editorConfig.getTheme());
        }
        return this.startLanguageClientConnection(this.editorConfig.getLanguageClientConfigOptions());
    }

    private disposeEditor() {
        if (this.editor) {
            const model = this.editor.getModel();
            model?.dispose();
            this.editor.dispose();
            this.editor = undefined;
        }
    }

    private disposeDiffEditor() {
        if (this.diffEditor) {
            const model = this.diffEditor.getModel();
            model?.modified?.dispose();
            model?.original?.dispose();
            this.diffEditor.dispose();
            this.diffEditor = undefined;
        }
    }

    public reportStatus() {
        const status: string[] = [];
        status.push('Wrapper status:');
        status.push(`Editor: ${this.editor}`);
        status.push(`DiffEditor: ${this.diffEditor}`);
        status.push(`LanguageClient: ${this.languageClient}`);
        status.push(`Worker: ${this.worker}`);
        return status;
    }

    private async disposeLanguageClient(): Promise<string> {
        if (this.languageClient && this.languageClient.isRunning()) {
            return await this.languageClient.dispose()
                .then(() => {
                    this.worker?.terminate();
                    this.worker = undefined;
                    this.languageClient = undefined;
                    return 'monaco-languageclient and monaco-editor were successfully disposed';
                })
                .catch((e: Error) => {
                    return `Disposing the monaco-languageclient resulted in error: ${e}`;
                });
        }
        else {
            return Promise.reject('Unable to dispose monaco-languageclient: It is not yet started.');
        }
    }

    private createEditor(container: HTMLElement): void {
        const languageId = this.editorConfig.getMainLanguageId();
        const mainUri = monaco.Uri.parse(`inmemory:///model${this.id}.${languageId}`);
        let model = monaco.editor.getModel(mainUri);
        if (model === null) {
            model = monaco.editor.createModel(this.editorConfig.getMainCode(), languageId, mainUri);
        }

        const options = this.editorConfig.getMonacoEditorOptions();
        if (options.automaticLayout === undefined) {
            options.automaticLayout = this.editorConfig.isAutomaticLayout();
        }
        options.model = model;

        if (this.useVscodeConfig) {
            this.editor = createConfiguredEditor(container!, options);
        } else {
            this.editor = monaco.editor.create(container!, options);
        }
    }

    private createDiffEditor(container: HTMLElement) {
        const mainUri = monaco.Uri.parse(`inmemory:///model${this.id}.${this.editorConfig.getMainLanguageId()}`);
        const diffUri = monaco.Uri.parse(`inmemory:///modelDiff${this.id}.${this.editorConfig.getMainLanguageId()}`);

        let originalModel = monaco.editor.getModel(mainUri);
        if (originalModel === null) {
            originalModel = monaco.editor.createModel(this.editorConfig.getMainCode(), this.editorConfig.getMainLanguageId(), mainUri);
        }

        let modifiedModel = monaco.editor.getModel(diffUri);
        if (modifiedModel === null) {
            modifiedModel = monaco.editor.createModel(this.editorConfig.getDiffCode(), this.editorConfig.getDiffLanguageId(), diffUri);
        }

        const options = this.editorConfig.getMonacoDiffEditorOptions();
        if (options.automaticLayout === undefined) {
            options.automaticLayout = this.editorConfig.isAutomaticLayout();
        }

        if (this.useVscodeConfig) {
            this.diffEditor = createConfiguredDiffEditor(container!, options);
        } else {
            this.diffEditor = monaco.editor.createDiffEditor(container!, options);
        }

        this.diffEditor.setModel({
            original: originalModel,
            modified: modifiedModel
        });
    }

    updateLayout() {
        if (this.editorConfig.isUseDiffEditor()) {
            this.diffEditor?.layout();
        }
        else {
            this.editor?.layout();
        }
    }

    private installMonaco() {
        // install Monaco language client services
        if (monaco) {
            try {
                MonacoServices.get();
            }
            catch (e: unknown) {
                // install only if services are not yet available (exception will happen only then)
                MonacoServices.install();
                console.log(`Component (${this.id}): Installed MonacoServices`);
            }
        }
    }

    private startLanguageClientConnection(lcConfigOptions: WebSocketConfigOptions | WorkerConfigOptions): Promise<string> {
        if (this.languageClient && this.languageClient.isRunning()) {
            return Promise.resolve('monaco-languageclient already running!');
        }

        return new Promise((resolve, reject) => {
            if (this.editorConfig.isUseWebSocket()) {
                const webSocketConfigOptions = lcConfigOptions as WebSocketConfigOptions;
                const url = this.createUrl(webSocketConfigOptions);
                const webSocket = new WebSocket(url);

                webSocket.onopen = () => {
                    const socket = toSocket(webSocket);
                    this.messageTransports = {
                        reader: new WebSocketMessageReader(socket),
                        writer: new WebSocketMessageWriter(socket)
                    };
                    this.handleLanguageClientStart(this.messageTransports, resolve, reject);
                };
            } else {
                const workerConfigOptions = lcConfigOptions as WorkerConfigOptions;
                if (!this.worker) {
                    this.worker = new Worker(new URL(workerConfigOptions.workerURL, window.location.href).href, {
                        type: workerConfigOptions.workerType,
                        name: workerConfigOptions.workerName,
                    });
                }
                if (!this.messageTransports) {
                    this.messageTransports = {
                        reader: new BrowserMessageReader(this.worker),
                        writer: new BrowserMessageWriter(this.worker)
                    };
                }
                this.handleLanguageClientStart(this.messageTransports, resolve, reject);
            }
        });
    }

    private async handleLanguageClientStart(messageTransports: MessageTransports,
        resolve: (value: string) => void,
        reject: (reason?: unknown) => void) {

        this.languageClient = this.createLanguageClient(messageTransports);
        messageTransports.reader.onClose(() => this.languageClient?.stop());

        await this.languageClient.start()
            .then(() => {
                const msg = 'monaco-languageclient was successfully started.';
                resolve(msg);
            })
            .catch((e: Error) => {
                const errorMsg = `monaco-languageclient start was unsuccessful: ${e.message}`;
                reject(errorMsg);
            });
    }

    private createLanguageClient(transports: MessageTransports): MonacoLanguageClient {
        return new MonacoLanguageClient({
            name: 'Monaco Wrapper Language Client',
            clientOptions: {
                // use a language id as a document selector
                documentSelector: [this.editorConfig.getMainLanguageId()],
                // disable the default error handler
                errorHandler: {
                    error: () => ({ action: ErrorAction.Continue }),
                    closed: () => ({ action: CloseAction.DoNotRestart })
                },
                // allow to initialize the language client with user specific options
                initializationOptions: this.editorConfig.getInitializationOptions()
            },
            // create a language client connection from the JSON RPC connection on demand
            connectionProvider: {
                get: () => {
                    return Promise.resolve(transports);
                }
            }
        });
    }

    private createUrl(config: WebSocketConfigOptions) {
        const protocol = config.wsSecured ? 'wss' : 'ws';
        return normalizeUrl(`${protocol}://${config.wsHost}:${config.wsPort}/${config.wsPath}`);
    }

    static addMonacoStyles(idOfStyleElement: string) {
        const style = document.createElement('style');
        style.id = idOfStyleElement;
        style.innerHTML = getMonacoCss();
        document.head.appendChild(style);
    }

}
