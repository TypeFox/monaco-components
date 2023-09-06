import { editor } from 'monaco-editor';
import { initServices, wasVscodeApiInitialized, InitializeServiceConfig, MonacoLanguageClient } from 'monaco-languageclient';
import { EditorAppVscodeApi, EditorAppConfigVscodeApi } from './editorAppVscodeApi.js';
import { EditorAppClassic, EditorAppConfigClassic } from './editorAppClassic.js';
import { VscodeUserConfiguration, isVscodeApiEditorApp } from './editorAppBase.js';
import { LanguageClientConfig, LanguageClientWrapper } from './languageClientWrapper.js';
import { Logger, LoggerConfig } from './logger.js';

export type WrapperConfig = {
    serviceConfig?: InitializeServiceConfig;
    editorAppConfig: EditorAppConfigVscodeApi | EditorAppConfigClassic;
};

export type UserConfig = {
    id?: string;
    htmlElement: HTMLElement;
    loggerConfig?: LoggerConfig;
    wrapperConfig: WrapperConfig;
    languageClientConfig?: LanguageClientConfig;
}

export type ModelUpdate = {
    languageId?: string;
    code?: string;
    uri?: string;
    codeOriginal?: string;
    codeOriginalUri?: string;
}

/**
 * This class is responsible for the overall ochestration.
 * It inits, start and disposes the editor apps and the language client (if configured) and provides
 * access to all required components.
 */
export class MonacoEditorLanguageClientWrapper {

    private id: string;
    private htmlElement: HTMLElement;

    private editorApp: EditorAppClassic | EditorAppVscodeApi | undefined;
    private languageClientWrapper: LanguageClientWrapper;
    private serviceConfig: InitializeServiceConfig;
    private logger: Logger;

    private async init(userConfig: UserConfig) {
        if (userConfig.wrapperConfig.editorAppConfig.useDiffEditor && !userConfig.wrapperConfig.editorAppConfig.codeOriginal) {
            throw new Error('Use diff editor was used without a valid config.');
        }

        this.id = userConfig.id ?? Math.floor(Math.random() * 101).toString();
        this.htmlElement = userConfig.htmlElement;
        this.logger = new Logger(userConfig.loggerConfig);
        this.serviceConfig = userConfig.wrapperConfig.serviceConfig ?? {};

        // always set required services if not configure
        this.serviceConfig.enableModelService = this.serviceConfig.enableModelService ?? true;
        this.serviceConfig.configureConfigurationService = this.serviceConfig.configureConfigurationService ?? {
            defaultWorkspaceUri: '/tmp/'
        };

        // overrule debug log flag
        this.serviceConfig.debugLogging = this.logger.isEnabled() && (this.serviceConfig.debugLogging || this.logger.isDebugEnabled());

        if (wasVscodeApiInitialized()) {
            this.logger.debug('No service init on restart', this.serviceConfig.debugLogging);
        } else {
            this.logger.debug('Init Services', this.serviceConfig.debugLogging);
            await initServices(this.serviceConfig);
        }

        this.languageClientWrapper = new LanguageClientWrapper(userConfig.languageClientConfig, this.logger);
    }

    async start(userConfig: UserConfig) {
        await this.init(userConfig);

        // Always dispose old instances before start
        this.editorApp?.disposeApp();

        if (isVscodeApiEditorApp(userConfig.wrapperConfig)) {
            this.editorApp = new EditorAppVscodeApi(this.id, userConfig, this.logger);
        } else {
            this.editorApp = new EditorAppClassic(this.id, userConfig, this.logger);
        }
        this.languageClientWrapper.init(this.editorApp.getConfig().languageId);
        this.logger.info(`Starting monaco-editor (${this.id})`);

        await this.editorApp?.init();
        await this.editorApp.createEditors(this.htmlElement);

        if (this.languageClientWrapper.haveLanguageClientConfig()) {
            await this.languageClientWrapper.start();
        }
    }

    isStarted(): boolean {
        // fast-fail
        if (!this.editorApp?.haveEditor()) {
            return false;
        }

        if (this.languageClientWrapper.haveLanguageClient()) {
            return this.languageClientWrapper.isStarted();
        }
        return true;
    }

    getMonacoEditorApp() {
        return this.editorApp;
    }

    getEditor(): editor.IStandaloneCodeEditor | undefined {
        return this.editorApp?.getEditor();
    }

    getDiffEditor(): editor.IStandaloneDiffEditor | undefined {
        return this.editorApp?.getDiffEditor();
    }

    getLanguageClient(): MonacoLanguageClient | undefined {
        return this.languageClientWrapper.getLanguageClient();
    }

    getModel(original?: boolean): editor.ITextModel | undefined {
        return this.editorApp?.getModel(original);
    }

    getWorker(): Worker | undefined {
        return this.languageClientWrapper.getWorker();
    }

    async updateModel(modelUpdate: ModelUpdate): Promise<void> {
        await this.editorApp?.updateModel(modelUpdate);
    }

    async updateDiffModel(modelUpdate: ModelUpdate): Promise<void> {
        await this.editorApp?.updateDiffModel(modelUpdate);
    }

    async updateEditorOptions(options: editor.IEditorOptions & editor.IGlobalEditorOptions | VscodeUserConfiguration): Promise<void> {
        if (this.editorApp) {
            await this.editorApp.updateEditorOptions(options);
        } else {
            await Promise.reject('Update was called when editor wrapper was not correctly configured.');
        }
    }

    public reportStatus() {
        const status: string[] = [];
        status.push('Wrapper status:');
        status.push(`Editor: ${this.editorApp?.getEditor()}`);
        status.push(`DiffEditor: ${this.editorApp?.getDiffEditor()}`);
        return status;
    }

    async dispose(): Promise<void> {
        this.editorApp?.disposeApp();

        if (this.languageClientWrapper.haveLanguageClient()) {
            await this.languageClientWrapper.disposeLanguageClient(false);
            this.editorApp = undefined;
            await Promise.resolve('Monaco editor and languageclient completed disposed.');
        }
        else {
            await Promise.resolve('Monaco editor has been disposed.');
        }
    }

    updateLayout() {
        this.editorApp?.updateLayout();
    }

}
