import 'monaco-editor/esm/vs/editor/edcore.main.js';
import { editor, Uri } from 'monaco-editor/esm/vs/editor/editor.api.js';

import { MonacoLanguageClient, MonacoServices } from 'monaco-languageclient';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver-protocol/browser.js';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient/lib/common/client.js';
import normalizeUrl from 'normalize-url';

import type { } from 'css-font-loading-module';

import { MonacoVscodeApiActivtion, MonacoVscodeApiWrapper } from './monacoVscodeApiWrapper.js';
import { MonacoEditorWrapper } from './monacoEditorWrapper.js';

export type WebSocketConfigOptions = {
    wsSecured: boolean;
    wsHost: string;
    wsPort: number;
    wsPath: string;
}

export type WorkerConfigOptions = {
    workerURL: string;
    workerType: 'classic' | 'module';
    workerName?: string;
}

export type LanguageContent = {
    languageId: string;
    code: string;
    useDiffEditor: boolean;
    codeModified?: string;
}

export type GlobalConfig = {
    useVscodeConfig: boolean;
    vscodeActivationConfig?: MonacoVscodeApiActivtion;
    id?: string;
    content: LanguageContent;
    theme?: string;
    automaticLayout?: boolean;
    languageClient?: {
        useWebSocket: boolean;
        options?: WebSocketConfigOptions | WorkerConfigOptions;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initializationOptions?: any;
    }
}

export type RuntimeConfig = {
    id: string;
    useVscodeConfig: boolean;
    theme: string;
    automaticLayout: boolean;
    content: LanguageContent;
    languageClient: {
        enabled: boolean;
        useWebSocket: boolean;
        options: WebSocketConfigOptions | WorkerConfigOptions;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initializationOptions?: any;
    }
}

export class MonacoEditorLanguageClientWrapper {

    private editor: editor.IStandaloneCodeEditor | undefined;
    private monacoEditorOptions: editor.IStandaloneEditorConstructionOptions = {};
    private diffEditor: editor.IStandaloneDiffEditor | undefined;
    private monacoDiffEditorOptions: editor.IStandaloneDiffEditorConstructionOptions = {};

    private languageClient: MonacoLanguageClient | undefined;
    private worker: Worker | undefined;
    private messageTransports: MessageTransports | undefined;

    private monacoEditorWrapper = new MonacoEditorWrapper();
    private monacoVscodeApiWrapper = new MonacoVscodeApiWrapper();
    private runtimeConfig: RuntimeConfig;

    constructor(config: GlobalConfig) {
        if (config.content.useDiffEditor) {
            if (!config.content.codeModified) {
                throw new Error('Use diff editor was used without a valid config.');
            }
        }

        // this configuration always contains proper values
        const useWebsockets = config.languageClient?.useWebSocket === true;
        this.runtimeConfig = {
            id: config.id ?? Math.floor(Math.random() * 101).toString(),
            useVscodeConfig: config.useVscodeConfig,
            theme: config.theme ?? 'vs-light',
            automaticLayout: config.automaticLayout === true,
            content: {
                languageId: config.content.languageId,
                code: config.content.code ?? '',
                useDiffEditor: config.content.useDiffEditor === true
            },
            languageClient: {
                enabled: config.languageClient !== undefined,
                useWebSocket: useWebsockets,
                options: config.languageClient?.options ?? (useWebsockets ? this.creatDefaultWebSocketConfig() : this.createDefaultWorkerConfig())
            }
        };
        if (config.content.codeModified) {
            this.runtimeConfig.content.codeModified = config.content.codeModified;
        }
        if (config.languageClient?.initializationOptions) {
            this.runtimeConfig.languageClient.initializationOptions = config.languageClient.initializationOptions;
        }

        if (this.runtimeConfig.useVscodeConfig) {
            this.monacoVscodeApiWrapper.init(config.vscodeActivationConfig);
        } else {
            this.monacoEditorWrapper.init();
        }
    }

    getRuntimeConfig() {
        return this.runtimeConfig;
    }

    getMonacoEditorWrapper() {
        return this.monacoEditorWrapper;
    }

    getMonacoVscodeApiWrapper() {
        return this.monacoVscodeApiWrapper;
    }

    getEditor(): editor.IStandaloneCodeEditor | undefined {
        return this.editor;
    }

    getDiffEditor(): editor.IStandaloneDiffEditor | undefined {
        return this.diffEditor;
    }

    getLanguageClient(): MonacoLanguageClient | undefined {
        return this.languageClient;
    }

    getMonacoEditorOptions() {
        return this.monacoEditorOptions;
    }

    setMonacoEditorOptions(monacoEditorOptions: editor.IStandaloneEditorConstructionOptions): void {
        this.monacoEditorOptions = monacoEditorOptions;
    }

    getMonacoDiffEditorOptions() {
        return this.monacoDiffEditorOptions;
    }

    setMonacoDiffEditorOptions(monacoDiffEditorOptions: editor.IStandaloneDiffEditorConstructionOptions): void {
        this.monacoDiffEditorOptions = monacoDiffEditorOptions;
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

    /**
     * This methods updates the theme. If the given provide theme is not available this will not work.
     * @param theme the theme name
     */
    updateTheme(theme: string) {
        editor.setTheme(theme);
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
        if (this.runtimeConfig.languageClient.enabled) {
            return haveEditor && this.languageClient !== undefined && this.languageClient.isRunning();
        }
        else {
            return haveEditor;
        }
    }

    startEditor(container?: HTMLElement): Promise<string> {
        console.log(`Starting monaco-editor (${this.runtimeConfig.id})`);
        if (!container) {
            return Promise.reject(new Error('No HTMLElement was provided.'));
        }

        // dispose old instances (try both, no need for swap)
        this.disposeEditor();
        this.disposeDiffEditor();

        this.applyConfig();

        if (this.runtimeConfig.content.useDiffEditor) {
            this.createDiffEditor(container);
        } else {
            this.createEditor(container);
        }

        const lcc = this.runtimeConfig.languageClient;
        if (lcc) {
            console.log('Enabling monaco-languageclient');
            this.installMonaco();
            return this.startLanguageClientConnection(lcc.options);
        } else {
            return Promise.resolve('All fine. monaco-languageclient is not used.');
        }
    }

    private applyConfig(): void {
        if (this.runtimeConfig.useVscodeConfig) {
            this.monacoVscodeApiWrapper.setup();
        } else {
            this.monacoEditorWrapper.updateMonacoConfig(this.runtimeConfig.content.languageId, this.runtimeConfig.theme);
        }
    }

    dispose(): Promise<string> {
        this.disposeEditor();
        this.disposeDiffEditor();

        if (this.runtimeConfig.languageClient) {
            return this.disposeLanguageClient();
        }
        else {
            return Promise.resolve('Monaco editor has been disposed');
        }
    }

    async restartLanguageClient(): Promise<string> {
        await this.disposeLanguageClient();
        this.applyConfig();
        return this.startLanguageClientConnection(this.runtimeConfig.languageClient.options);
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
        const runtimeConfig = this.runtimeConfig;
        const languageId = runtimeConfig.content.languageId;
        const mainUri = Uri.parse(`inmemory:///model${runtimeConfig.id}.${languageId}`);
        const model = editor.getModel(mainUri);
        if (model === null || !this.monacoEditorOptions.model) {
            this.monacoEditorOptions.model = editor.createModel(runtimeConfig.content.code, languageId, mainUri);
        }
        this.monacoEditorOptions.automaticLayout = runtimeConfig.automaticLayout;

        if (runtimeConfig.useVscodeConfig) {
            this.editor = this.monacoVscodeApiWrapper.createEditor(container!, this.monacoEditorOptions);
        } else {
            this.editor = this.monacoEditorWrapper.createEditor(container, this.monacoEditorOptions);
        }
    }

    private createDiffEditor(container: HTMLElement) {
        const runtimeConfig = this.runtimeConfig;
        this.monacoDiffEditorOptions.automaticLayout = runtimeConfig.automaticLayout;

        if (runtimeConfig.useVscodeConfig) {
            this.diffEditor = this.monacoVscodeApiWrapper.createDiffEditor(container, this.monacoDiffEditorOptions);
        } else {
            this.diffEditor = this.monacoEditorWrapper.createDiffEditor(container, this.monacoDiffEditorOptions);
        }

        const languageId = runtimeConfig.content.languageId;
        const mainCode = runtimeConfig.content.code;
        const modifiedCode = runtimeConfig.content.codeModified;
        const mainUri = Uri.parse(`inmemory:///model${runtimeConfig.id}.${languageId}`);
        const modifiedUri = Uri.parse(`inmemory:///modelDiff${runtimeConfig.id}.${languageId}`);

        let originalModel = editor.getModel(mainUri);
        if (originalModel === null) {
            originalModel = editor.createModel(mainCode, languageId, mainUri);
        }

        let modifiedModel = editor.getModel(modifiedUri);
        if (modifiedModel === null) {
            modifiedModel = editor.createModel(modifiedCode!, languageId, modifiedUri);
        }

        this.diffEditor.setModel({
            original: originalModel,
            modified: modifiedModel
        });
    }

    updateLayout() {
        if (this.runtimeConfig.content.useDiffEditor) {
            this.diffEditor?.layout();
        }
        else {
            this.editor?.layout();
        }
    }

    private installMonaco() {
        // install Monaco language client services
        try {
            MonacoServices.get();
        }
        catch (e: unknown) {
            // install only if services are not yet available (exception will happen only then)
            MonacoServices.install();
            console.log(`Component (${this.runtimeConfig.id}): Installed MonacoServices`);
        }
    }

    private startLanguageClientConnection(lcConfigOptions: WebSocketConfigOptions | WorkerConfigOptions): Promise<string> {
        if (this.languageClient && this.languageClient.isRunning()) {
            return Promise.resolve('monaco-languageclient already running!');
        }

        return new Promise((resolve, reject) => {
            if ((lcConfigOptions as WebSocketConfigOptions).wsHost) {
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
                documentSelector: [this.runtimeConfig.content.languageId],
                // disable the default error handler
                errorHandler: {
                    error: () => ({ action: ErrorAction.Continue }),
                    closed: () => ({ action: CloseAction.DoNotRestart })
                },
                // allow to initialize the language client with user specific options
                initializationOptions: this.runtimeConfig.languageClient.initializationOptions
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

    private creatDefaultWebSocketConfig(): WebSocketConfigOptions {
        return {
            wsSecured: false,
            wsHost: 'localhost',
            wsPort: 8080,
            wsPath: ''
        };
    }

    private createDefaultWorkerConfig(): WorkerConfigOptions {
        return {
            workerURL: '',
            workerType: 'classic',
            workerName: 'WrapperWorker'
        };
    }
}
