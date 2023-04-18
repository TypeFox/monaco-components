// support all editor features
import 'monaco-editor/esm/vs/editor/edcore.main.js';
import { editor, Uri } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { createConfiguredEditor, createConfiguredDiffEditor, createModelReference } from 'vscode/monaco';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver-protocol/browser.js';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient/lib/common/client.js';
import normalizeUrl from 'normalize-url';
import { MonacoVscodeApiWrapper, MonacoVscodeApiWrapperConfig, VscodeUserConfiguration } from './monacoVscodeApiWrapper.js';
import { DirectMonacoEditorWrapper, DirectMonacoEditorWrapperConfig } from './monacoEditorWrapper.js';
import { IReference, ITextFileEditorModel } from 'vscode/service-override/modelEditor';

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
    automaticLayout?: boolean;
    codeOriginal?: string;
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

export type UserConfig = {
    id?: string;
    htmlElement: HTMLElement;
    wrapperConfig: {
        useVscodeConfig: boolean;
        monacoVscodeApiConfig?: MonacoVscodeApiWrapperConfig;
        monacoEditorConfig?: DirectMonacoEditorWrapperConfig;
    },
    editorConfig: EditorConfig;
    languageClientConfig: LanguageClientConfig;
}

export interface MonacoEditorWrapper {
    init(restart: boolean, editorConfig: EditorConfig, wrapperConfig: MonacoVscodeApiWrapperConfig | DirectMonacoEditorWrapperConfig): Promise<void>;
    updateConfig(options: editor.IEditorOptions & editor.IGlobalEditorOptions | VscodeUserConfiguration): void;
}

export class MonacoEditorLanguageClientWrapper {

    private editor: editor.IStandaloneCodeEditor | undefined;
    private diffEditor: editor.IStandaloneDiffEditor | undefined;

    private editorOptions: editor.IStandaloneEditorConstructionOptions;
    private diffEditorOptions: editor.IStandaloneDiffEditorConstructionOptions;

    private modelRef: IReference<ITextFileEditorModel> | undefined;
    private modelOriginalRef: IReference<ITextFileEditorModel> | undefined;

    private languageClient: MonacoLanguageClient | undefined;
    private worker: Worker | undefined;

    private monacoEditorWrapper: DirectMonacoEditorWrapper | MonacoVscodeApiWrapper | undefined;

    private wasStarted = false;
    private id: string;
    private htmlElement: HTMLElement;
    private useVscodeConfig: boolean;
    private monacoConfig: MonacoVscodeApiWrapperConfig | DirectMonacoEditorWrapperConfig;
    private editorConfig: EditorConfig;
    private languageClientConfig: LanguageClientConfig;

    async start(userConfig: UserConfig): Promise<string> {
        this.init(userConfig);
        return this.startInternal();
    }

    private init(userConfig: UserConfig) {
        if (userConfig.editorConfig.useDiffEditor) {
            if (!userConfig.editorConfig.codeOriginal) {
                throw new Error('Use diff editor was used without a valid config.');
            }
        }

        this.id = userConfig.id ?? Math.floor(Math.random() * 101).toString();
        this.htmlElement = userConfig.htmlElement;
        this.useVscodeConfig = userConfig.wrapperConfig.useVscodeConfig;
        this.editorConfig = {
            languageId: userConfig.editorConfig.languageId,
            code: userConfig.editorConfig.code ?? '',
            codeOriginal: userConfig.editorConfig.codeOriginal ?? '',
            useDiffEditor: userConfig.editorConfig.useDiffEditor === true,
            theme: userConfig.editorConfig.theme ?? 'vs-light',
            automaticLayout: userConfig.editorConfig.automaticLayout ?? true,
        };

        this.editorOptions = userConfig.editorConfig.editorOptions ?? {};
        this.editorOptions.automaticLayout = this.editorConfig.automaticLayout;

        this.diffEditorOptions = userConfig.editorConfig.diffEditorOptions ?? {};
        this.diffEditorOptions.automaticLayout = this.editorConfig.automaticLayout;

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

        if (this.useVscodeConfig) {
            this.monacoConfig = userConfig.wrapperConfig.monacoVscodeApiConfig ?? {};
        } else {
            this.monacoConfig = userConfig.wrapperConfig.monacoEditorConfig ?? {};
        }
    }

    private async startInternal(): Promise<string> {
        console.log(`Starting monaco-editor (${this.id})`);

        // dispose old instances (try both, no need for swap)
        this.disposeEditor();
        this.disposeDiffEditor();

        this.monacoEditorWrapper = this.useVscodeConfig ? new MonacoVscodeApiWrapper() : new DirectMonacoEditorWrapper();
        return this.monacoEditorWrapper.init(this.wasStarted, this.editorConfig, this.monacoConfig)
            .then(() => {
                let promise: Promise<void>;
                if (this.editorConfig.useDiffEditor) {
                    promise = this.createDiffEditor(this.htmlElement);
                } else {
                    promise = this.createEditor(this.htmlElement);
                }
                return promise.then(() => {
                    this.wasStarted = true;
                    const lcc = this.languageClientConfig;
                    if (lcc.enabled) {
                        console.log('Starting monaco-languageclient');
                        return this.startLanguageClientConnection(lcc);
                    } else {
                        return Promise.resolve('All fine. monaco-languageclient is not used.');
                    }
                });
            });
    }

    isStarted(): boolean {
        const haveEditor = this.editor !== undefined || this.diffEditor !== undefined;
        // fast-fail
        if (!haveEditor) {
            return false;
        }

        if (this.languageClientConfig.enabled) {
            return this.languageClient !== undefined && this.languageClient.isRunning();
        }
        return true;
    }

    getMonacoEditorWrapper() {
        return this.monacoEditorWrapper;
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

    getModel(original?: boolean): editor.ITextModel | undefined {
        if (this.editorConfig.useDiffEditor) {
            const model = this.diffEditor?.getModel();
            return (original === true) ? model?.original : model?.modified;
        } else {
            return this.editor?.getModel() ?? undefined;
        }
    }

    updateModel(modelUpdate: {
        languageId: string;
        code: string;
    }): Promise<void> {
        if (!this.editor) {
            return Promise.reject(new Error('You cannot update the editor model, because the regular editor is not configured.'));
        }
        this.editorConfig.languageId = modelUpdate.languageId;
        this.editorConfig.code = modelUpdate.code;
        return this.updateEditorModel(true);
    }

    updateDiffModel(modelUpdate: {
        languageId: string;
        code: string;
        codeOriginal: string;
    }): Promise<void> {
        if (!this.diffEditor) {
            return Promise.reject(new Error('You cannot update the diff editor models, because the diffEditor is not configured.'));
        }
        this.editorConfig.languageId = modelUpdate.languageId;
        this.editorConfig.code = modelUpdate.code;
        this.editorConfig.codeOriginal = modelUpdate.codeOriginal;
        return this.updateDiffEditorModel();
    }

    updateEditorOptions(options: editor.IEditorOptions & editor.IGlobalEditorOptions | VscodeUserConfiguration): Promise<void> {
        if (this.monacoEditorWrapper) {
            return this.monacoEditorWrapper.updateConfig(options)
                .then(() => {
                    if (this.useVscodeConfig) {
                        this.editor?.updateOptions(options as editor.IEditorOptions & editor.IGlobalEditorOptions);
                    }
                });
        } else {
            return Promise.reject('Update was called when editor wrapper was not correctly configured.');
        }
    }

    async restartLanguageClient(): Promise<string> {
        await this.disposeLanguageClient();
        return this.startLanguageClientConnection(this.languageClientConfig);
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

    async dispose() {
        this.disposeEditor();
        this.disposeDiffEditor();

        if (this.languageClientConfig.enabled) {
            return this.disposeLanguageClient()
                .then(() => {
                    this.monacoEditorWrapper = undefined;
                    return Promise.resolve('Successfully completed dispose.');
                });
        }
        else {
            return Promise.resolve('Monaco editor has been disposed.');
        }
    }

    public async disposeLanguageClient(): Promise<string> {
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

    updateLayout() {
        if (this.editorConfig.useDiffEditor) {
            this.diffEditor?.layout();
        } else {
            this.editor?.layout();
        }
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

    private async createEditor(container: HTMLElement): Promise<void> {
        return this.updateEditorModel(false)
            .then(() => {
                this.editor = createConfiguredEditor(container!, this.editorOptions);
            });
    }

    private async updateEditorModel(updateEditor: boolean): Promise<void> {
        this.modelRef?.dispose();

        const uri = Uri.parse(`/tmp/model${this.id}.${this.editorConfig.languageId}`);
        return createModelReference(uri, this.editorConfig.code)
            .then((m) => {
                this.modelRef = m as unknown as IReference<ITextFileEditorModel>;
                this.modelRef.object.setLanguageId(this.editorConfig.languageId);
                this.editorOptions!.model = this.modelRef.object.textEditorModel;
                if (updateEditor && this.editor) {
                    this.editor.setModel(this.editorOptions!.model);
                }
            });
    }

    private createDiffEditor(container: HTMLElement) {
        this.diffEditor = createConfiguredDiffEditor(container!, this.editorConfig.diffEditorOptions);
        return this.updateDiffEditorModel();
    }

    private async updateDiffEditorModel(): Promise<void> {
        this.modelRef?.dispose();
        this.modelOriginalRef?.dispose();

        const uri = Uri.parse(`/tmp/model${this.id}.${this.editorConfig.languageId}`);
        const uriOriginal = Uri.parse(`/tmp/modelOriginal${this.id}.${this.editorConfig.languageId}`);

        return createModelReference(uri, this.editorConfig.code)
            .then((m) => {
                this.modelRef = m as unknown as IReference<ITextFileEditorModel>;
                this.modelRef.object.setLanguageId(this.editorConfig.languageId);
                createModelReference(uriOriginal, this.editorConfig.codeOriginal);
            })
            .then((m) => {
                this.modelOriginalRef = m as unknown as IReference<ITextFileEditorModel>;
                this.modelOriginalRef.object.setLanguageId(this.editorConfig.languageId);
                if (this.diffEditor) {
                    if (this.modelRef?.object.textEditorModel !== null && this.modelOriginalRef.object.textEditorModel !== null) {
                        this.diffEditor?.setModel({
                            original: this.modelOriginalRef!.object!.textEditorModel,
                            modified: this.modelRef!.object!.textEditorModel
                        });
                    }
                }
            });
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
                documentSelector: [this.editorConfig.languageId],
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
