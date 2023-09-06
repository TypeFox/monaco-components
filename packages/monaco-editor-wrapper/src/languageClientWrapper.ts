import { MonacoLanguageClient } from 'monaco-languageclient';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver-protocol/browser.js';
import { CloseAction, ErrorAction, MessageTransports, State } from 'vscode-languageclient/lib/common/client.js';
import { createUrl } from './utils.js';
import { $ConfigurationOptions } from 'vscode-languageclient/lib/common/configuration.js';
import { Logger } from './logger.js';

export type WebSocketCallOptions = {
    /** Adds handle on languageClient */
    onCall: (languageClient?: MonacoLanguageClient) => void;
    /** Reports Status Of Language Client */
    reportStatus?: boolean;
}

export type LanguageClientConfigBase = {
    name?: string;
}

export type LanguageClientConfigType = 'WebSocket' | 'WebSocketUrl' | 'WorkerConfig' | 'Worker';

export type WebSocketUrl = LanguageClientConfigBase & {
    secured: boolean;
    host: string;
    port?: number;
    path?: string;
}

export type WebSocketConfigOptions = LanguageClientConfigBase & {
    $type: 'WebSocket'
    secured: boolean;
    host: string;
    port?: number;
    path?: string;
    extraParams?: Record<string, string | number | Array<string | number>>;
    startOptions?: WebSocketCallOptions;
    stopOptions?: WebSocketCallOptions;
}

export type WebSocketConfigOptionsUrl = LanguageClientConfigBase & {
    $type: 'WebSocketUrl'
    url: string;
    startOptions?: WebSocketCallOptions;
    stopOptions?: WebSocketCallOptions;
}

export type WorkerConfigOptions = LanguageClientConfigBase & {
    $type: 'WorkerConfig'
    url: URL;
    type: 'classic' | 'module';
};

export type WorkerConfigDirect = LanguageClientConfigBase & {
    $type: 'WorkerDirect';
    worker: Worker;
};

export type LanguageClientConfig = {
    options: WebSocketConfigOptions | WebSocketConfigOptionsUrl | WorkerConfigOptions | WorkerConfigDirect;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initializationOptions?: any;
    configurationOptions?: $ConfigurationOptions
}

export type LanguageClientError = {
    message: string;
    error: Error | string;
};

export class LanguageClientWrapper {

    private languageClient: MonacoLanguageClient | undefined;
    private languageClientConfig?: LanguageClientConfig;
    private worker: Worker | undefined;
    private languageId: string | undefined;
    private name;
    private logger: Logger | undefined;

    constructor(languageClientConfig?: LanguageClientConfig, logger?: Logger) {
        if (languageClientConfig) {
            this.languageClientConfig = languageClientConfig;
            this.name = this.languageClientConfig.options.name ?? 'unnamed';
        }
        this.logger = logger;
    }

    haveLanguageClient(): boolean {
        return this.languageClient !== undefined;
    }

    haveLanguageClientConfig(): boolean {
        return this.languageClientConfig !== undefined;
    }

    getLanguageClient(): MonacoLanguageClient | undefined {
        return this.languageClient;
    }

    getWorker(): Worker | undefined {
        return this.worker;
    }

    isStarted(): boolean {
        return this.languageClient !== undefined && this.languageClient?.isRunning();
    }

    init(languageId: string) {
        this.languageId = languageId;
    }

    async start() {
        if (this.languageClientConfig) {
            return this.startLanguageClientConnection();
        } else {
            const languageClientError: LanguageClientError = {
                message: `languageClientWrapper (${this.name}): Unable to start monaco-languageclient. No configuration was provided.`,
                error: 'No error was provided.'
            };
            return Promise.reject(languageClientError);
        }
    }

    /**
     * Restart the languageclient with options to control worker handling
     *
     * @param updatedWorker Set a new worker here that should be used. keepWorker has no effect then, as we want to dispose of the prior workers
     * @param keepWorker Set to true if worker should not be disposed
     */
    async restartLanguageClient(updatedWorker?: Worker, keepWorker?: boolean): Promise<void> {
        if (updatedWorker) {
            await this.disposeLanguageClient(false);
        } else {
            await this.disposeLanguageClient(keepWorker);
        }
        this.worker = updatedWorker;
        if (this.languageClientConfig) {
            this.logger?.info('Re-Starting monaco-languageclient');
            return this.startLanguageClientConnection();
        } else {
            const languageClientError: LanguageClientError = {
                message: `languageClientWrapper (${this.name}): Unable to restart languageclient. No configuration was provided.`,
                error: 'No error was provided.'
            };
            return Promise.reject(languageClientError);
        }
    }

    private startLanguageClientConnection(): Promise<void> {
        if (this.languageClient && this.languageClient.isRunning()) {
            this.logger?.info('monaco-languageclient already running!');
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const lcConfig = this.languageClientConfig?.options;
            if (lcConfig?.$type === 'WebSocket' || lcConfig?.$type === 'WebSocketUrl') {
                const url = createUrl(lcConfig);
                const webSocket = new WebSocket(url);

                webSocket.onopen = () => {
                    const socket = toSocket(webSocket);
                    const messageTransports = {
                        reader: new WebSocketMessageReader(socket),
                        writer: new WebSocketMessageWriter(socket)
                    };
                    this.handleLanguageClientStart(messageTransports, resolve, reject);
                };
                webSocket.onerror = (ev: Event) => {
                    const languageClientError: LanguageClientError = {
                        message: `languageClientWrapper (${this.name}): Websocket connection failed.`,
                        error: (ev as ErrorEvent).error ?? 'No error was provided.'
                    };
                    reject(languageClientError);
                };
            } else {
                if (!this.worker) {
                    if (lcConfig?.$type === 'WorkerConfig') {
                        const workerConfig = lcConfig as WorkerConfigOptions;
                        this.worker = new Worker(new URL(workerConfig.url, window.location.href).href, {
                            type: workerConfig.type,
                            name: workerConfig.name
                        });

                        this.worker.onerror = (ev) => {
                            const languageClientError: LanguageClientError = {
                                message: `languageClientWrapper (${this.name}): Illegal worker configuration detected. Potentially the url is wrong.`,
                                error: ev.error ?? 'No error was provided.'
                            };
                            reject(languageClientError);
                        };
                    } else {
                        const workerDirectConfig = lcConfig as WorkerConfigDirect;
                        this.worker = workerDirectConfig.worker;
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
        resolve: () => void,
        reject: (reason?: unknown) => void) {

        this.languageClient = this.createLanguageClient(messageTransports);
        const lcConfig = this.languageClientConfig?.options;
        messageTransports.reader.onClose(async () => {
            await this.languageClient?.stop();
            if ((lcConfig?.$type === 'WebSocket' || lcConfig?.$type === 'WebSocketUrl') && lcConfig?.stopOptions) {
                const stopOptions = lcConfig?.stopOptions;
                stopOptions.onCall(this.getLanguageClient());
                if (stopOptions.reportStatus) {
                    this.logger?.info(this.reportStatus().join('\n'));
                }
            }
        });

        try {
            await this.languageClient.start();
            if ((lcConfig?.$type === 'WebSocket' || lcConfig?.$type === 'WebSocketUrl') && lcConfig?.startOptions) {
                const startOptions = lcConfig?.startOptions;
                startOptions.onCall(this.getLanguageClient());
                if (startOptions.reportStatus) {
                    this.logger?.info(this.reportStatus().join('\n'));
                }
            }
        } catch (e) {
            const languageClientError: LanguageClientError = {
                message: `languageClientWrapper (${this.name}): Start was unsuccessful.`,
                error: (e as Error) ?? 'No error was provided.'
            };
            reject(languageClientError);
        }
        this.logger?.info(`languageClientWrapper (${this.name}): Started successfully.`);
        resolve();
    }

    private createLanguageClient(transports: MessageTransports): MonacoLanguageClient {
        return new MonacoLanguageClient({
            name: this.languageClientConfig?.options.name ?? 'Monaco Wrapper Language Client',
            clientOptions: {
                // use a language id as a document selector
                documentSelector: [this.languageId!],
                // disable the default error handler
                errorHandler: {
                    error: () => ({ action: ErrorAction.Continue }),
                    closed: () => ({ action: CloseAction.DoNotRestart })
                },
                // allow to initialize the language client with user specific options
                initializationOptions: this.languageClientConfig?.initializationOptions,

                ...(this.languageClientConfig?.configurationOptions ?? {})
            },
            // create a language client connection from the JSON RPC connection on demand
            connectionProvider: {
                get: () => {
                    return Promise.resolve(transports);
                }
            }
        });
    }

    private disposeWorker(keepWorker?: boolean) {
        if (keepWorker === undefined || keepWorker === false) {
            this.worker?.terminate();
            this.worker = undefined;
        }
    }

    public async disposeLanguageClient(keepWorker?: boolean): Promise<void> {
        // If there is no language client, try to terminate the worker
        if (!this.languageClient) {
            this.disposeWorker(keepWorker);
            return Promise.resolve();
        }

        // then attempt to dispose the LC
        if (this.languageClient && this.languageClient.isRunning()) {
            try {
                await this.languageClient.dispose();
                this.disposeWorker(keepWorker);
                this.languageClient = undefined;
                this.logger?.info('monaco-languageclient and monaco-editor were successfully disposed.');
                return Promise.resolve();
            } catch (e) {
                const languageClientError: LanguageClientError = {
                    message: `languageClientWrapper (${this.name}): Disposing the monaco-languageclient resulted in error.`,
                    error: (e as Error) ?? 'No error was provided.'
                };
                return Promise.reject(languageClientError);
            }
        }
        else {
            const languageClientError: LanguageClientError = {
                message: `languageClientWrapper (${this.name}): Unable to dispose monaco-languageclient: It is not yet started.`,
                error: 'No error was provided.'
            };
            return Promise.reject(languageClientError);
        }
    }

    reportStatus() {
        const status: string[] = [];
        const languageClient = this.getLanguageClient();
        status.push('LanguageClientWrapper status:');
        status.push(`LanguageClient: ${languageClient?.name ?? 'Language Client'} is in a '${State[languageClient?.state ?? 1]}' state`);
        return status;
    }
}
