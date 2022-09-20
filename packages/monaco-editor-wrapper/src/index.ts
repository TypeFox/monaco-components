import 'monaco-editor/esm/vs/editor/editor.all.js';

// select features
import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickInput/standaloneQuickInputService.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js';

// add workers
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
import 'monaco-editor/esm/vs/language/html/monaco.contribution';
import 'monaco-editor/esm/vs/language/css/monaco.contribution';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';

// support all basic-languages
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

import { getMonacoCss } from './generated/css.js';
import { getCodiconTtf } from './generated/ttf.js';

import { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices, MessageTransports, MessageWriter, MessageReader } from 'monaco-languageclient';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver-protocol/browser.js';
import normalizeUrl from 'normalize-url';

import type { } from 'css-font-loading-module';

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

/**
 * This is derived from:
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.ILanguageExtensionPoint.html
 */
export type LanguageExtensionConfig = {
    id: string;
    extensions?: string[];
    filenames?: string[];
    filenamePatterns?: string[];
    firstLine?: string;
    aliases?: string[];
    mimetypes?: string[];
}

export class CodeEditorConfig {

    private useDiffEditor = false;
    private codeOriginal: [string, string] = ['', 'javascript'];
    private codeModified: [string, string] = ['', 'javascript'];
    private languageExtensionConfig: LanguageExtensionConfig | undefined;
    private theme = 'vs-light';
    private monacoEditorOptions: Record<string, unknown> = {
        readOnly: false
    };
    private monacoDiffEditorOptions: Record<string, unknown> = {
        readOnly: false
    };

    // languageclient related configuration
    private useLanguageClient = false;
    // create config type web socket / web worker
    private useWebSocket = true;
    private lcConfigOptions = this.useWebSocket ? this.getDefaultWebSocketConfig() : this.getDefaultWorkerConfig();

    private languageDef: monaco.languages.IMonarchLanguage | undefined = undefined;
    private themeData: monaco.editor.IStandaloneThemeData | undefined = undefined;

    isUseDiffEditor(): boolean {
        return this.useDiffEditor;
    }

    setUseDiffEditor(useDiffEditor: boolean): void {
        this.useDiffEditor = useDiffEditor;
    }

    isUseLanguageClient(): boolean {
        return this.useLanguageClient;
    }

    setUseLanguageClient(useLanguageClient: boolean): void {
        this.useLanguageClient = useLanguageClient;
    }

    isUseWebSocket(): boolean {
        return this.useWebSocket;
    }

    setUseWebSocket(useWebSocket: boolean): void {
        this.useWebSocket = useWebSocket;
    }

    getTheme(): string {
        return this.theme;
    }

    setTheme(theme: string): void {
        this.theme = theme;
    }

    getMainLanguageId(): string {
        return this.codeOriginal[1];
    }

    setMainLanguageId(languageId: string): void {
        this.codeOriginal[1] = languageId;
    }

    getMainCode(): string {
        return this.codeOriginal[0];
    }

    setMainCode(code: string): void {
        this.codeOriginal[0] = code;
    }

    getDiffLanguageId(): string {
        return this.codeModified[1];
    }

    setDiffLanguageId(languageId: string): void {
        this.codeModified[1] = languageId;
    }

    getDiffCode(): string {
        return this.codeModified[0];
    }

    setDiffCode(code: string): void {
        this.codeModified[0] = code;
    }

    setLanguageExtensionConfig(languageExtensionConfig: LanguageExtensionConfig): void {
        this.languageExtensionConfig = languageExtensionConfig;
    }

    getLanguageExtensionConfig(): LanguageExtensionConfig | undefined {
        return this.languageExtensionConfig;
    }

    getMonacoEditorOptions(): monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions {
        return this.monacoEditorOptions;
    }

    setMonacoEditorOptions(monacoEditorOptions: Record<string, unknown>): void {
        this.monacoEditorOptions = monacoEditorOptions;
    }

    getMonacoDiffEditorOptions(): monaco.editor.IDiffEditorOptions & monaco.editor.IGlobalEditorOptions {
        return this.monacoDiffEditorOptions;
    }

    setMonacoDiffEditorOptions(monacoDiffEditorOptions: Record<string, unknown>): void {
        this.monacoDiffEditorOptions = monacoDiffEditorOptions;
    }

    getMonarchTokensProvider(): monaco.languages.IMonarchLanguage | undefined {
        return this.languageDef;
    }

    setMonarchTokensProvider(languageDef: unknown): void {
        this.languageDef = languageDef as monaco.languages.IMonarchLanguage;
    }

    setEditorThemeData(themeData: unknown): void {
        this.themeData = themeData as monaco.editor.IStandaloneThemeData;
    }

    getEditorThemeData(): monaco.editor.IStandaloneThemeData | undefined {
        return this.themeData;
    }

    getLanguageClientConfigOptions(): WebSocketConfigOptions | WorkerConfigOptions {
        return this.lcConfigOptions;
    }

    setLanguageClientConfigOptions(lcConfigOptions: WebSocketConfigOptions | WorkerConfigOptions): void {
        this.lcConfigOptions = lcConfigOptions;
    }

    getDefaultWebSocketConfig(): WebSocketConfigOptions {
        return {
            wsSecured: false,
            wsHost: 'localhost',
            wsPort: 8080,
            wsPath: ''
        };
    }

    getDefaultWorkerConfig(): WorkerConfigOptions {
        return {
            workerURL: '',
            workerType: 'classic',
            workerName: 'WrapperWorker'
        };
    }
}

export type WorkerCommunitcationConfig = {
    reader: MessageReader,
    writer: MessageWriter
};

export class MonacoEditorLanguageClientWrapper {

    private editor: monaco.editor.IStandaloneCodeEditor | undefined;
    private diffEditor: monaco.editor.IStandaloneDiffEditor | undefined;
    private editorConfig: CodeEditorConfig = new CodeEditorConfig();
    private languageClient: MonacoLanguageClient | undefined;
    private worker: Worker | undefined;
    private workerCommunitcationConfig: WorkerCommunitcationConfig | undefined;
    private dispatchEvent: ((event: Event) => boolean) | undefined;

    private id: string;

    constructor(id?: string) {
        this.id = id ?? '42';
    }

    getEditorConfig() {
        return this.editorConfig;
    }

    getMonaco() {
        return monaco;
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

    updateTheme() {
        monaco.editor.setTheme(this.editorConfig.getTheme());
    }

    setWorker(worker: Worker, workerCommunitcationConfig?: WorkerCommunitcationConfig) {
        this.worker = worker;
        if (workerCommunitcationConfig) {
            this.workerCommunitcationConfig = workerCommunitcationConfig;
        }
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

    startEditor(container?: HTMLElement, dispatchEvent?: (event: Event) => boolean): Promise<string> {
        console.log(`Starting monaco-editor (${this.id})`);
        this.dispatchEvent = dispatchEvent;

        if (this.editorConfig.isUseDiffEditor()) {
            this.diffEditor = monaco.editor.createDiffEditor(container!);
        }
        else {
            this.editor = monaco.editor.create(container!);
        }
        this.updateEditor();

        if (this.editorConfig.isUseLanguageClient()) {
            console.log('Enabling monaco-languageclient');
            this.installMonaco();
            return this.startLanguageClientConnection(this.editorConfig.getLanguageClientConfigOptions());
        }
        else {
            return Promise.resolve('All fine. monaco-languageclient is not used.');
        }

    }

    dispose(): Promise<string> {
        if (this.editorConfig.isUseLanguageClient()) {
            return this.disposeLanguageClient();
        }
        else {
            this.disposeEditor();
            this.disposeDiffEditor();
            return Promise.resolve('Monaco editor has been disposed');
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
            model?.modified.dispose();
            model?.original.dispose();
            this.diffEditor.dispose();
            this.diffEditor = undefined;
        }
    }

    public reportStatus() {
        console.log(`Editor ${this.editor}`);
        console.log(`DiffEditor ${this.diffEditor}`);
        console.log(`LanguageClient ${this.languageClient}`);
        console.log(`Worker ${this.worker}`);
    }

    private async disposeLanguageClient(): Promise<string> {
        if (this.languageClient && this.languageClient.isRunning()) {
            this.disposeEditor();
            this.disposeDiffEditor();

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

    swapEditors(container?: HTMLElement, dispatchEvent?: (event: Event) => boolean): Promise<string> {
        if (this.editorConfig.isUseDiffEditor()) {
            this.disposeEditor();
            if (!this.diffEditor) {
                return this.startEditor(container, dispatchEvent);
            }
        }
        else {
            this.disposeDiffEditor();
            if (!this.editor) {
                return this.startEditor(container, dispatchEvent);
            }
        }
        return Promise.resolve('Nothing to do.');
    }

    updateEditor() {
        if (this.editorConfig.isUseDiffEditor()) {
            this.updateDiffEditor();
        }
        else {
            this.updateMainEditor();
        }
    }

    private updateMainEditor() {
        this.updateCommonEditorConfig();
        const options = this.editorConfig.getMonacoEditorOptions();
        this.editor?.updateOptions(options);
        this.updateMainModel();
        this.updateLayout();
    }

    private updateMainModel(): void {
        if (this.editor) {
            const languageId = this.editorConfig.getMainLanguageId();
            const model = monaco.editor.createModel(this.editorConfig.getMainCode(), languageId,
                monaco.Uri.parse(`inmemory://model.${languageId}`));
            this.editor.setModel(model);
            this.editor.getModel()!.onDidChangeContent(() => {
                if (this.dispatchEvent) {
                    this.dispatchEvent(new CustomEvent('ChangeContent', { detail: {} }));
                }
            });
        }
    }

    private updateDiffEditor() {
        this.updateCommonEditorConfig();
        const options = this.editorConfig.getMonacoDiffEditorOptions();
        this.diffEditor?.updateOptions(options);
        this.updateDiffModels();
        this.updateLayout();
    }

    private updateCommonEditorConfig() {
        const languageId = this.editorConfig.getMainLanguageId();

        // register own language first
        const extLang = this.editorConfig.getLanguageExtensionConfig();
        if (extLang) {
            //(monaco.languages as Record<string, unknown>)[extLang.id] = undefined;
            monaco.languages.register(this.editorConfig.getLanguageExtensionConfig() as monaco.languages.ILanguageExtensionPoint);
        }

        const languageRegistered = monaco.languages.getLanguages().filter(x => x.id === languageId);
        if (languageRegistered.length === 0) {
            // this is only meaningful for languages supported by monaco out of the box
            monaco.languages.register({ id: languageId });
        }

        // apply monarch definitions
        const tokenProvider = this.editorConfig.getMonarchTokensProvider();
        if (tokenProvider) {
            monaco.languages.setMonarchTokensProvider(languageId, tokenProvider);
        }
        const themeData = this.editorConfig.getEditorThemeData();
        if (themeData) {
            monaco.editor.defineTheme(this.editorConfig.getTheme(), themeData);
        }
        this.updateTheme();
    }

    private updateDiffModels() {
        if (this.diffEditor) {
            const originalModel = monaco.editor.createModel(this.editorConfig.getMainCode(), this.editorConfig.getMainLanguageId());
            const modifiedModel = monaco.editor.createModel(this.editorConfig.getDiffCode(), this.editorConfig.getDiffLanguageId());

            this.diffEditor.setModel({
                original: originalModel,
                modified: modifiedModel
            });
        }
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

        let reader: WebSocketMessageReader | BrowserMessageReader;
        let writer: WebSocketMessageWriter | BrowserMessageWriter;

        return new Promise((resolve, reject) => {
            if (this.editorConfig.isUseWebSocket()) {
                const webSocketConfigOptions = lcConfigOptions as WebSocketConfigOptions;
                const url = this.createUrl(webSocketConfigOptions);
                const webSocket = new WebSocket(url);

                webSocket.onopen = () => {
                    const socket = toSocket(webSocket);
                    const reader = new WebSocketMessageReader(socket);
                    const writer = new WebSocketMessageWriter(socket);
                    this.handleLanguageClientStart(reader, writer, resolve, reject);
                };
            } else {
                const workerConfigOptions = lcConfigOptions as WorkerConfigOptions;
                if (!this.worker) {
                    this.worker = new Worker(new URL(workerConfigOptions.workerURL, window.location.href).href, {
                        type: workerConfigOptions.workerType,
                        name: workerConfigOptions.workerName,
                    });
                }
                if (this.workerCommunitcationConfig) {
                    this.handleLanguageClientStart(this.workerCommunitcationConfig.reader, this.workerCommunitcationConfig.writer, resolve, reject);
                } else {
                    reader = new BrowserMessageReader(this.worker);
                    writer = new BrowserMessageWriter(this.worker);
                    this.handleLanguageClientStart(reader, writer, resolve, reject);
                }
            }
        });
    }

    private async handleLanguageClientStart(reader: MessageReader, writer: MessageWriter,
        resolve: (value: string) => void,
        reject: (reason?: unknown) => void) {

        this.languageClient = this.createLanguageClient({ reader, writer });
        reader.onClose(() => this.languageClient?.stop());

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
                }
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

    static addCodiconTtf(): void {
        const ttf = getCodiconTtf();
        const codicon = new FontFace('Codicon', `url(${ttf})`);
        codicon.load().then(l => {
            document.fonts.add(l);
            document.body.style.fontFamily = '"Codicon", Arial';
            console.log('Loaded Codicon TTF font');
        }).catch((e: Error) => {
            throw e;
        });
    }

}
