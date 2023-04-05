import { editor, Uri } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { MonacoVscodeApiActivtion, VscodeApiConfig } from './vscodeApiConfig.js';
import { MonacoConfig } from './monacoConfig.js';

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
    }
}

export class CodeEditorConfig {

    private monacoConfig = new MonacoConfig();
    private vscodeApiConfig = new VscodeApiConfig();

    private monacoEditorOptions: editor.IStandaloneEditorConstructionOptions = {};
    private monacoDiffEditorOptions: editor.IStandaloneDiffEditorConstructionOptions = {};
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
                options: config.languageClient?.options ?? (useWebsockets ? this.getDefaultWebSocketConfig() : this.getDefaultWorkerConfig())
            }
        };
        if (config.content.codeModified) {
            this.runtimeConfig.content.codeModified = config.content.codeModified;
        }

        if (this.runtimeConfig.useVscodeConfig) {
            this.vscodeApiConfig.init(config.vscodeActivationConfig);
        } else {
            this.monacoConfig.init();
        }
    }

    getRuntimeConfig() {
        return this.runtimeConfig;
    }

    getMonacoConfig() {
        return this.monacoConfig;
    }

    getVscodeApiConfig() {
        return this.vscodeApiConfig;
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

    applyConfig(): void {
        if (this.runtimeConfig.useVscodeConfig) {
            this.vscodeApiConfig.setup();
        } else {
            this.monacoConfig.updateMonacoConfig(this.runtimeConfig.content.languageId, this.runtimeConfig.theme);
        }
    }

    startEditor(container: HTMLElement): editor.IStandaloneCodeEditor {
        const languageId = this.runtimeConfig.content.languageId;
        const mainUri = Uri.parse(`inmemory:///model${this.runtimeConfig.id}.${languageId}`);
        const model = editor.getModel(mainUri);
        if (model === null || !this.monacoEditorOptions.model) {
            this.monacoEditorOptions.model = editor.createModel(this.runtimeConfig.content.code, languageId, mainUri);
        }
        this.monacoEditorOptions.automaticLayout = this.runtimeConfig.automaticLayout;

        if (this.runtimeConfig.useVscodeConfig) {
            return this.vscodeApiConfig.createEditor(container!, this.monacoEditorOptions);
        } else {
            return this.monacoConfig.createEditor(container, this.monacoEditorOptions);
        }
    }

    startDiffEditor(container: HTMLElement): editor.IStandaloneDiffEditor {
        this.monacoDiffEditorOptions.automaticLayout = this.runtimeConfig.automaticLayout;

        let diffEditor;
        if (this.runtimeConfig.useVscodeConfig) {
            diffEditor = this.vscodeApiConfig.createDiffEditor(container, this.monacoDiffEditorOptions);
        } else {
            diffEditor = this.monacoConfig.createDiffEditor(container, this.monacoDiffEditorOptions);
        }

        const languageId = this.runtimeConfig.content.languageId;
        const mainCode = this.runtimeConfig.content.code;
        const modifiedCode = this.runtimeConfig.content.codeModified;
        const mainUri = Uri.parse(`inmemory:///model${this.runtimeConfig.id}.${languageId}`);
        const modifiedUri = Uri.parse(`inmemory:///modelDiff${this.runtimeConfig.id}.${languageId}`);

        let originalModel = editor.getModel(mainUri);
        if (originalModel === null) {
            originalModel = editor.createModel(mainCode, languageId, mainUri);
        }

        let modifiedModel = editor.getModel(modifiedUri);
        if (modifiedModel === null) {
            modifiedModel = editor.createModel(modifiedCode!, languageId, modifiedUri);
        }

        diffEditor.setModel({
            original: originalModel,
            modified: modifiedModel
        });
        return diffEditor;
    }
}
