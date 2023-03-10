/* eslint-disable @typescript-eslint/no-explicit-any */
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

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

export type LanguageDescription = {
    code: string;
    languageId: string;
}

export class CodeEditorConfig {

    private useDiffEditor = false;
    private codeOriginal: LanguageDescription = { code: '', languageId: 'javascript' };
    private codeModified: LanguageDescription = { code: '', languageId: 'javascript' };
    private theme = 'vs-light';
    private automaticLayout = true;
    private monacoEditorOptions: monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions & monaco.editor.IStandaloneEditorConstructionOptions = {};
    private monacoDiffEditorOptions: monaco.editor.IDiffEditorOptions & monaco.editor.IGlobalEditorOptions & monaco.editor.IStandaloneDiffEditorConstructionOptions = {};

    // languageclient related configuration
    private useLanguageClient = false;
    private initializationOptions: any = undefined;
    // create config type web socket / web worker
    private useWebSocket = true;
    private lcConfigOptions = this.useWebSocket ? this.getDefaultWebSocketConfig() : this.getDefaultWorkerConfig();

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
        return this.codeOriginal.languageId;
    }

    setMainLanguageId(languageId: string): void {
        this.codeOriginal.languageId = languageId;
    }

    getMainCode(): string {
        return this.codeOriginal.code;
    }

    setMainCode(code: string): void {
        this.codeOriginal.code = code;
    }

    getDiffLanguageId(): string {
        return this.codeModified.languageId;
    }

    setDiffLanguageId(languageId: string): void {
        this.codeModified.languageId = languageId;
    }

    getDiffCode(): string {
        return this.codeModified.code;
    }

    setDiffCode(code: string): void {
        this.codeModified.code = code;
    }

    isAutomaticLayout() {
        return this.automaticLayout;
    }

    setAutomaticLayout(automaticLayout: boolean) {
        this.automaticLayout = automaticLayout;
    }

    getMonacoEditorOptions() {
        return this.monacoEditorOptions;
    }

    setMonacoEditorOptions(monacoEditorOptions: monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions): void {
        this.monacoEditorOptions = monacoEditorOptions;
    }

    getMonacoDiffEditorOptions() {
        return this.monacoDiffEditorOptions;
    }

    setMonacoDiffEditorOptions(monacoDiffEditorOptions: monaco.editor.IDiffEditorOptions & monaco.editor.IGlobalEditorOptions): void {
        this.monacoDiffEditorOptions = monacoDiffEditorOptions;
    }

    getLanguageClientConfigOptions(): WebSocketConfigOptions | WorkerConfigOptions {
        return this.lcConfigOptions;
    }

    setLanguageClientConfigOptions(lcConfigOptions: WebSocketConfigOptions | WorkerConfigOptions): void {
        this.lcConfigOptions = lcConfigOptions;
    }

    getInitializationOptions(): any {
        return this.initializationOptions;
    }

    setInitializationOptions(options: any): void {
        this.initializationOptions = options;
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
