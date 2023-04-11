// support all editor features
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { editor, Uri } from 'monaco-editor/esm/vs/editor/edcore.main.js';

import { MonacoLanguageClient, MonacoServices } from 'monaco-languageclient';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver-protocol/browser.js';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient/lib/common/client.js';
import normalizeUrl from 'normalize-url';

import { MonacoVscodeApiWrapper, MonacoVscodeApiWrapperConfig } from './monacoVscodeApiWrapper.js';
import { MonacoEditorWrapper, MonacoEditorWrapperConfig } from './monacoEditorWrapper.js';

export type WebSocketConfigOptions = {
    secured: boolean;
    host: string;
    port: number;
    path: string;
}

export type WorkerConfigOptions = {
    url: URL;
    type: 'classic' | 'module';
    name?: string;
}

export type EditorConfig = {
    languageId: string;
    code: string;
    useDiffEditor: boolean;
    theme: string;
    automaticLayout: boolean;
    codeModified?: string;
    editorOptions?: editor.IStandaloneEditorConstructionOptions;
    diffEditorOptions?: editor.IStandaloneDiffEditorConstructionOptions;
}

export type LanguageClientConfig = {
    enabled: boolean;
    useWebSocket?: boolean;
    webSocketConfigOptions?: WebSocketConfigOptions;
    workerConfigOptions?: WorkerConfigOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initializationOptions?: any;
}

export type GlobalConfig = {
    id?: string;
    wrapperConfig: {
        useVscodeConfig: boolean;
        monacoVscodeApiConfig?: MonacoVscodeApiWrapperConfig;
        monacoEditorConfig?: MonacoEditorWrapperConfig;
    },
    editorConfig: EditorConfig;
    languageClientConfig: LanguageClientConfig;
}

export type RuntimeConfig = {
    id: string;
    wrapperConfig: {
        useVscodeConfig: boolean;
        monacoVscodeApiConfig?: MonacoVscodeApiWrapperConfig;
        monacoEditorConfig?: MonacoEditorWrapperConfig;
    },
    editorConfig: EditorConfig;
    languageClientConfig: LanguageClientConfig;
}

export class MonacoEditorLanguageClientWrapper {

    private editor: editor.IStandaloneCodeEditor | undefined;
    private diffEditor: editor.IStandaloneDiffEditor | undefined;

    private languageClient: MonacoLanguageClient | undefined;
    private worker: Worker | undefined;

    private monacoEditorWrapper = new MonacoEditorWrapper();
    private monacoVscodeApiWrapper = new MonacoVscodeApiWrapper();
    private runtimeConfig: RuntimeConfig;

    init(config: GlobalConfig) {
        if (config.editorConfig.useDiffEditor) {
            if (!config.editorConfig.codeModified) {
                throw new Error('Use diff editor was used without a valid config.');
            }
        }

        // It is ensured that the runtime configuration always contains proper values
        this.runtimeConfig = {
            id: config.id ?? Math.floor(Math.random() * 101).toString(),
            wrapperConfig: {
                useVscodeConfig: config.wrapperConfig.useVscodeConfig,
            },
            editorConfig: {
                languageId: config.editorConfig.languageId,
                code: config.editorConfig.code ?? '',
                useDiffEditor: config.editorConfig.useDiffEditor === true,
                theme: config.editorConfig.theme ?? 'vs-light',
                automaticLayout: config.editorConfig.automaticLayout === true,
                editorOptions: config.editorConfig.editorOptions ?? {},
                diffEditorOptions: config.editorConfig.diffEditorOptions ?? {}
            },
            languageClientConfig: {
                enabled: config.languageClientConfig.enabled,
                useWebSocket: config.languageClientConfig.useWebSocket === true,
            }
        };
        if (config.editorConfig.codeModified) {
            this.runtimeConfig.editorConfig.codeModified = config.editorConfig.codeModified;
        }
        if (config.editorConfig.editorOptions) {
            this.runtimeConfig.editorConfig.editorOptions = config.editorConfig.editorOptions;
        }
        if (config.editorConfig.diffEditorOptions) {
            this.runtimeConfig.editorConfig.diffEditorOptions = config.editorConfig.diffEditorOptions;
        }
        if (config.languageClientConfig.enabled) {
            if (config.languageClientConfig.initializationOptions) {
                this.runtimeConfig.languageClientConfig.initializationOptions = config.languageClientConfig.initializationOptions;
            }
            if (config.languageClientConfig.useWebSocket) {
                if (config.languageClientConfig.webSocketConfigOptions) {
                    this.runtimeConfig.languageClientConfig.webSocketConfigOptions = config.languageClientConfig.webSocketConfigOptions;
                } else {
                    throw new Error('webSocketConfigOptions were not provided. Aborting...');
                }
            } else {
                if (config.languageClientConfig.workerConfigOptions) {
                    this.runtimeConfig.languageClientConfig.workerConfigOptions = config.languageClientConfig.workerConfigOptions;
                } else {
                    throw new Error('workerConfigOptions were not provided. Aborting...');
                }
            }
        }

        if (this.runtimeConfig.wrapperConfig.useVscodeConfig) {
            if (config.wrapperConfig.monacoVscodeApiConfig) {
                this.runtimeConfig.wrapperConfig.monacoVscodeApiConfig = config.wrapperConfig.monacoVscodeApiConfig;
                this.monacoVscodeApiWrapper.init(config.wrapperConfig.monacoVscodeApiConfig);
            } else {
                throw new Error('monacoVscodeApiConfig was not provided. Aborting...');
            }
        } else {
            if (config.wrapperConfig.monacoEditorConfig) {
                this.runtimeConfig.wrapperConfig.monacoEditorConfig = config.wrapperConfig.monacoEditorConfig;
            } else {
                this.runtimeConfig.wrapperConfig.monacoEditorConfig = {};
            }
            this.monacoEditorWrapper.init(this.runtimeConfig.editorConfig, this.runtimeConfig.wrapperConfig.monacoEditorConfig);
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

    isStarted(): boolean {
        const haveEditor = this.editor !== undefined || this.diffEditor !== undefined;
        // fast-fail
        if (!haveEditor) {
            return false;
        }

        if (this.runtimeConfig.languageClientConfig.enabled) {
            return this.languageClient !== undefined && this.languageClient.isRunning();
        }
        return true;
    }

    startEditor(container?: HTMLElement): Promise<string> {
        console.log(`Starting monaco-editor (${this.runtimeConfig.id})`);
        if (!container) {
            return Promise.reject(new Error('No HTMLElement was provided.'));
        }

        // dispose old instances (try both, no need for swap)
        this.disposeEditor();
        this.disposeDiffEditor();
        this.updateWrapperConfig();

        if (this.runtimeConfig.editorConfig.useDiffEditor) {
            this.createDiffEditor(container);
        } else {
            this.createEditor(container);
        }

        const lcc = this.runtimeConfig.languageClientConfig;
        if (lcc.enabled) {
            console.log('Enabling monaco-languageclient');
            this.installMonaco();
            return this.startLanguageClientConnection(lcc);
        } else {
            return Promise.resolve('All fine. monaco-languageclient is not used.');
        }
    }

    updateEditorConfig(): void {
        // TODO: here language and text need to be updated
    }

    updateWrapperConfig(): void {
        if (this.runtimeConfig.wrapperConfig.useVscodeConfig) {
            this.monacoVscodeApiWrapper.updateWrapperConfig(this.runtimeConfig.wrapperConfig.monacoVscodeApiConfig!);
        } else {
            this.monacoEditorWrapper.updateWrapperConfig(this.runtimeConfig.editorConfig, this.runtimeConfig.wrapperConfig.monacoEditorConfig!);
        }
    }

    dispose(): Promise<string> {
        this.disposeEditor();
        this.disposeDiffEditor();

        if (this.runtimeConfig.languageClientConfig.enabled) {
            return this.disposeLanguageClient();
        }
        else {
            return Promise.resolve('Monaco editor has been disposed');
        }
    }

    async restartLanguageClient(): Promise<string> {
        await this.disposeLanguageClient();
        this.updateWrapperConfig();
        return this.startLanguageClientConnection(this.runtimeConfig.languageClientConfig);
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
        const languageId = runtimeConfig.editorConfig.languageId;
        const mainUri = Uri.parse(`inmemory:///model${runtimeConfig.id}.${languageId}`);
        const model = editor.getModel(mainUri);
        if (model === null || !runtimeConfig.editorConfig.editorOptions.model) {
            runtimeConfig.editorConfig.editorOptions.model = editor.createModel(runtimeConfig.editorConfig.code, languageId, mainUri);
        }
        runtimeConfig.editorConfig.editorOptions.automaticLayout = runtimeConfig.editorConfig.automaticLayout;

        if (runtimeConfig.wrapperConfig.useVscodeConfig) {
            this.editor = this.monacoVscodeApiWrapper.createEditor(container!, runtimeConfig.editorConfig.editorOptions);
        } else {
            this.editor = this.monacoEditorWrapper.createEditor(container, runtimeConfig.editorConfig.editorOptions);
        }
    }

    private createDiffEditor(container: HTMLElement) {
        const runtimeConfig = this.runtimeConfig;
        runtimeConfig.editorConfig.diffEditorOptions.automaticLayout = runtimeConfig.editorConfig.automaticLayout;

        if (runtimeConfig.wrapperConfig.useVscodeConfig) {
            this.diffEditor = this.monacoVscodeApiWrapper.createDiffEditor(container, runtimeConfig.editorConfig.diffEditorOptions);
        } else {
            this.diffEditor = this.monacoEditorWrapper.createDiffEditor(container, runtimeConfig.editorConfig.diffEditorOptions);
        }

        const languageId = runtimeConfig.editorConfig.languageId;
        const mainCode = runtimeConfig.editorConfig.code;
        const modifiedCode = runtimeConfig.editorConfig.codeModified;
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
        if (this.runtimeConfig.editorConfig.useDiffEditor) {
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

    private startLanguageClientConnection(languageClientConfig: LanguageClientConfig): Promise<string> {
        if (this.languageClient && this.languageClient.isRunning()) {
            return Promise.resolve('monaco-languageclient already running!');
        }

        return new Promise((resolve, reject) => {
            if (languageClientConfig.useWebSocket) {
                const url = this.createUrl(languageClientConfig.webSocketConfigOptions!);
                const webSocket = new WebSocket(url);

                webSocket.onopen = () => {
                    const socket = toSocket(webSocket);
                    const messageTransports = {
                        reader: new WebSocketMessageReader(socket),
                        writer: new WebSocketMessageWriter(socket)
                    };
                    this.handleLanguageClientStart(messageTransports, resolve, reject);
                };
            } else {
                if (!this.worker) {
                    const workerConfigOptions = languageClientConfig.workerConfigOptions!;
                    this.worker = new Worker(new URL(workerConfigOptions.url, window.location.href).href, {
                        type: workerConfigOptions.type,
                        name: workerConfigOptions.name,
                    });
                }
                const messageTransports = {
                    reader: new BrowserMessageReader(this.worker),
                    writer: new BrowserMessageWriter(this.worker)
                };
                this.handleLanguageClientStart(messageTransports, resolve, reject);
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
                documentSelector: [this.runtimeConfig.editorConfig.languageId],
                // disable the default error handler
                errorHandler: {
                    error: () => ({ action: ErrorAction.Continue }),
                    closed: () => ({ action: CloseAction.DoNotRestart })
                },
                // allow to initialize the language client with user specific options
                initializationOptions: this.runtimeConfig.languageClientConfig.initializationOptions
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
        const protocol = config.secured ? 'wss' : 'ws';
        return normalizeUrl(`${protocol}://${config.host}:${config.port}/${config.path}`);
    }
}
