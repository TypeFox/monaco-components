import { EditorVscodeApi, EditorVscodeApiConfig, VscodeUserConfiguration } from './editorVscodeApi.js';
import { EditorClassic, EditorClassicConfig } from './editorClassic.js';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { InitializeServiceConfig, initServices, MonacoLanguageClient, wasVscodeApiInitialized } from 'monaco-languageclient';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver-protocol/browser.js';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient/lib/common/client.js';
import normalizeUrl from 'normalize-url';

export type WebSocketCallOptions = {
    /** Adds handle on languageClient */
    onCall: () => void;
    /** Reports Status Of Language Client */
    reportStatus?: boolean;
}

export type WebSocketConfigOptions = {
    secured: boolean;
    host: string;
    port: number;
    path: string;
    startOptions?: WebSocketCallOptions;
    stopOptions?: WebSocketCallOptions;
}

export type WorkerConfigOptions = {
    url: URL;
    type: 'classic' | 'module';
    name?: string;
};

export type EditorConfig = {
    languageId: string;
    code: string;
    uri?: string;
    useDiffEditor: boolean;
    theme: string;
    automaticLayout?: boolean;
    codeOriginal?: string;
    codeOriginalUri?: string;
    editorOptions?: editor.IStandaloneEditorConstructionOptions;
    diffEditorOptions?: editor.IStandaloneDiffEditorConstructionOptions;
}

export type LanguageClientConfig = {
    enabled: boolean;
    useWebSocket?: boolean;
    webSocketConfigOptions?: WebSocketConfigOptions;
    workerConfigOptions?: WorkerConfigOptions | Worker;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initializationOptions?: any;
}

export type UserConfig = {
    id?: string;
    htmlElement: HTMLElement;
    wrapperConfig: {
        useVscodeConfig: boolean;
        serviceConfig?: InitializeServiceConfig;
        monacoVscodeApiConfig?: EditorVscodeApiConfig;
        monacoEditorConfig?: EditorClassicConfig;
    },
    editorConfig: EditorConfig;
    languageClientConfig: LanguageClientConfig;
}

export type ModelUpdate = {
    languageId?: string;
    code?: string;
    uri?: string;
    codeOriginal?: string;
    codeOriginalUri?: string;
}

export interface MonacoEditorWrapper {
    init(): Promise<void>;
    updateConfig(options: editor.IEditorOptions & editor.IGlobalEditorOptions | VscodeUserConfiguration): void;
}

export class MonacoEditorLanguageClientWrapper {

    private languageClient: MonacoLanguageClient | undefined;
    private worker: Worker | undefined;

    private editor: EditorClassic | EditorVscodeApi | undefined;

    private id: string;
    private htmlElement: HTMLElement;
    private useVscodeConfig: boolean;
    private serviceConfig: InitializeServiceConfig;
    private languageClientConfig: LanguageClientConfig;

    private init(userConfig: UserConfig) {
        if (userConfig.editorConfig.useDiffEditor) {
            if (!userConfig.editorConfig.codeOriginal) {
                throw new Error('Use diff editor was used without a valid config.');
            }
        }

        this.id = userConfig.id ?? Math.floor(Math.random() * 101).toString();
        this.htmlElement = userConfig.htmlElement;
        this.useVscodeConfig = userConfig.wrapperConfig.useVscodeConfig;

        this.languageClientConfig = {
            enabled: userConfig.languageClientConfig.enabled,
            useWebSocket: userConfig.languageClientConfig.useWebSocket === true,
        };
        if (userConfig.languageClientConfig.enabled) {
            if (userConfig.languageClientConfig.initializationOptions) {
                this.languageClientConfig.initializationOptions = userConfig.languageClientConfig.initializationOptions;
            }
            if (userConfig.languageClientConfig.useWebSocket) {
                if (userConfig.languageClientConfig.webSocketConfigOptions) {
                    this.languageClientConfig.webSocketConfigOptions = userConfig.languageClientConfig.webSocketConfigOptions;
                } else {
                    throw new Error('webSocketConfigOptions were not provided. Aborting...');
                }
            } else {
                if (userConfig.languageClientConfig.workerConfigOptions) {
                    this.languageClientConfig.workerConfigOptions = userConfig.languageClientConfig.workerConfigOptions;
                } else {
                    throw new Error('workerConfigOptions were not provided. Aborting...');
                }
            }
        }

        this.serviceConfig = userConfig.wrapperConfig.serviceConfig ?? {};

        // always set required services if not configure
        this.serviceConfig.enableFilesService = this.serviceConfig.enableFilesService ?? true;
        this.serviceConfig.enableModelService = this.serviceConfig.enableModelService ?? true;
        this.serviceConfig.configureEditorOrViewsServiceConfig = this.serviceConfig.configureEditorOrViewsServiceConfig ?? {
            enableViewsService: false,
            useDefaultOpenEditorFunction: true
        };
        this.serviceConfig.configureConfigurationServiceConfig = this.serviceConfig.configureConfigurationServiceConfig ?? {
            defaultWorkspaceUri: '/tmp/'
        };
    }

    async start(userConfig: UserConfig) {
        this.init(userConfig);

        // Always dispose old instances before start
        this.editor?.disposeEditor();
        this.editor?.disposeDiffEditor();

        if (this.useVscodeConfig) {
            this.editor = new EditorVscodeApi(this.id, userConfig);
        } else {
            this.editor = new EditorClassic(this.id, userConfig);
        }
        await (wasVscodeApiInitialized() ? Promise.resolve('No service init on restart') : initServices(this.serviceConfig));
        await this.editor?.init();
        await this.editor.createEditors(this.htmlElement);

        const lcc = this.languageClientConfig;
        if (lcc.enabled) {
            console.log('Starting monaco-languageclient');
            await this.startLanguageClientConnection(lcc);
        } else {
            await Promise.resolve('All fine. monaco-languageclient is not used.');
        }
    }

    isStarted(): boolean {
        // fast-fail
        if (!this.editor?.haveEditor()) {
            return false;
        }

        if (this.languageClientConfig.enabled) {
            return this.languageClient !== undefined && this.languageClient.isRunning();
        }
        return true;
    }

    getMonacoEditorWrapper() {
        return this.editor;
    }

    getEditor(): editor.IStandaloneCodeEditor | undefined {
        return this.editor?.getEditor();
    }

    getDiffEditor(): editor.IStandaloneDiffEditor | undefined {
        return this.editor?.getDiffEditor();
    }

    getLanguageClient(): MonacoLanguageClient | undefined {
        return this.languageClient;
    }

    getModel(original?: boolean): editor.ITextModel | undefined {
        return this.editor?.getModel(original);
    }

    getWorker(): Worker | undefined {
        return this.worker;
    }

    async updateModel(modelUpdate: ModelUpdate): Promise<void> {
        await this.editor?.updateModel(modelUpdate);
    }

    async updateDiffModel(modelUpdate: ModelUpdate): Promise<void> {
        await this.editor?.updateDiffModel(modelUpdate);
    }

    async updateEditorOptions(options: editor.IEditorOptions & editor.IGlobalEditorOptions | VscodeUserConfiguration): Promise<void> {
        if (this.editor) {
            await this.editor.updateConfig(options);
        } else {
            await Promise.reject('Update was called when editor wrapper was not correctly configured.');
        }
    }

    /**
     * Restart the languageclient with options to control worker handling
     *
     * @param updatedWorker Set a new worker here that should be used. keepWorker has no effect theb
     * @param keepWorker Set to true if worker should not be disposed
     */
    async restartLanguageClient(updatedWorker?: Worker, keepWorker?: boolean): Promise<void> {
        if (updatedWorker) {
            await this.disposeLanguageClient(false);
        } else {
            await this.disposeLanguageClient(keepWorker);
        }
        this.worker = updatedWorker;
        await this.startLanguageClientConnection(this.languageClientConfig);
    }

    public reportStatus() {
        const status: string[] = [];
        status.push('Wrapper status:');
        status.push(`Editor: ${this.editor?.getEditor()}`);
        status.push(`DiffEditor: ${this.editor?.getDiffEditor()}`);
        status.push(`LanguageClient: ${this.languageClient}`);
        status.push(`Worker: ${this.worker}`);
        return status;
    }

    async dispose(): Promise<void> {
        this.editor?.disposeEditor();
        this.editor?.disposeDiffEditor();

        if (this.languageClientConfig.enabled) {
            await this.disposeLanguageClient(false);
            this.editor = undefined;
            await Promise.resolve('Monaco editor and languageclient completed disposed.');
        }
        else {
            await Promise.resolve('Monaco editor has been disposed.');
        }
    }

    public async disposeLanguageClient(keepWorker?: boolean): Promise<void> {
        if (this.languageClient && this.languageClient.isRunning()) {
            try {
                await this.languageClient.dispose();
                if (keepWorker === undefined || keepWorker === false) {
                    this.worker?.terminate();
                    this.worker = undefined;
                }
                this.languageClient = undefined;
                await Promise.resolve('monaco-languageclient and monaco-editor were successfully disposed.');
            } catch (e) {
                await Promise.reject(`Disposing the monaco-languageclient resulted in error: ${e}`);
            }
        }
        else {
            await Promise.reject('Unable to dispose monaco-languageclient: It is not yet started.');
        }
    }

    updateLayout() {
        this.editor?.updateLayout();
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
                    if ((workerConfigOptions as WorkerConfigOptions).url) {
                        const workerConfig = workerConfigOptions as WorkerConfigOptions;
                        this.worker = new Worker(new URL(workerConfig.url, window.location.href).href, {
                            type: workerConfig.type,
                            name: workerConfig.name
                        });
                    } else {
                        this.worker = workerConfigOptions as Worker;
                    }
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
        messageTransports.reader.onClose(async () => {
            await this.languageClient?.stop();
            const stopOptions = this.languageClientConfig?.webSocketConfigOptions?.stopOptions;
            if (stopOptions) {
                stopOptions.onCall();
                if (stopOptions.reportStatus) {
                    console.log(this.reportStatus().join('\n'));
                }
            }
        });

        try {
            await this.languageClient.start();
            const startOptions = this.languageClientConfig?.webSocketConfigOptions?.startOptions;
            if (startOptions) {
                startOptions.onCall();
                if (startOptions.reportStatus) {
                    console.log(this.reportStatus().join('\n'));
                }
            }
        } catch (e) {
            const errorMsg = `monaco-languageclient start was unsuccessful: ${e}`;
            reject(errorMsg);
        }
        const msg = 'monaco-languageclient was successfully started.';
        resolve(msg);
    }

    private createLanguageClient(transports: MessageTransports): MonacoLanguageClient {
        return new MonacoLanguageClient({
            name: 'Monaco Wrapper Language Client',
            clientOptions: {
                // use a language id as a document selector
                documentSelector: [this.editor!.getEditorConfig().languageId],
                // disable the default error handler
                errorHandler: {
                    error: () => ({ action: ErrorAction.Continue }),
                    closed: () => ({ action: CloseAction.DoNotRestart })
                },
                // allow to initialize the language client with user specific options
                initializationOptions: this.languageClientConfig.initializationOptions
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
