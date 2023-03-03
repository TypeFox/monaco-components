import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, Ref, ref } from 'lit/directives/ref.js';

import { getMonacoCss } from 'monaco-editor-wrapper/monaco-css';
import { WebSocketConfigOptions, WorkerConfigOptions, MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';

@customElement('monaco-editor-comp')
export class MonacoEditorWebComponent extends LitElement {

    private container: Ref<HTMLElement> = createRef();
    private monacoWrapper = new MonacoEditorLanguageClientWrapper(false, this.id);
    private monacoEditorOptions: Record<string, unknown> = {
        readOnly: false
    };
    private monacoDiffEditorOptions: Record<string, unknown> = {
        readOnly: false
    };
    private languageDef: unknown | undefined = undefined;
    private themeData: unknown | undefined = undefined;

    @property({ reflect: true }) code = '';
    @property({ reflect: true }) languageId = 'javascript';
    @property({ reflect: true }) modifiedCode = '';
    @property({ reflect: true }) modifiedLanguageId = 'javascript';
    @property({ reflect: true }) theme = 'vs-light';
    @property({ type: Boolean, reflect: true }) automaticLayout = true;

    @property({ type: Boolean, reflect: true }) enableInlineConfig = false;
    @property({ type: Boolean, reflect: true }) useDiffEditor = false;

    @property({ type: Boolean, reflect: true }) useLanguageClient = false;
    @property({ type: Boolean, reflect: true }) useWebSocket = true;

    @property({ type: Boolean, reflect: true }) wsSecured = false;
    @property({ reflect: true }) wsHost = 'localhost';
    @property({ type: Number, reflect: true }) wsPort = 8080;
    @property({ reflect: true }) wsPath = '';

    @property({ type: String, reflect: true }) workerURL = '';
    @property({ type: String, reflect: true }) useModuleWorker = false;
    @property({ type: String, reflect: true }) workerName = '';

    static override styles = css`
        :host {
            --editor-width: 100%;
            --editor-height: 100%;
        }
        main {
            width: var(--editor-width);
            height: var(--editor-height);
        }
    `;

    override render() {
        return html`
        <style>${getMonacoCss()}</style>
        <style>${MonacoEditorWebComponent.styles}</style>
        <main ${ref(this.container)} id="monacoContainer${this.id}" class="main"></main>
        `;
    }

    setCode(code: string): void {
        this.code = code;
    }

    setLanguageId(languageId: string): void {
        this.languageId = languageId;
    }

    setModifiedCode(modifiedCode: string): void {
        this.modifiedCode = modifiedCode;
    }

    setModifiedLanguageId(modifiedLanguageId: string): void {
        this.modifiedLanguageId = modifiedLanguageId;
    }

    setTheme(theme: string): void {
        this.theme = theme;
    }

    setAutomaticLayout(automaticLayout: boolean): void {
        this.automaticLayout = automaticLayout;
    }

    setUseLanguageClient(useLanguageClient: boolean) {
        this.useLanguageClient = useLanguageClient;
    }

    setUseWebSocket(useWebSocket: boolean) {
        this.useWebSocket = useWebSocket;
    }

    setWsSecured(wsSecured: boolean) {
        this.wsSecured = wsSecured;
    }

    setWsHost(wsHost: string) {
        this.wsHost = wsHost;
    }

    setWsPort(wsPort: number) {
        this.wsPort = wsPort;
    }

    setWsPath(wsPath: string) {
        this.wsPath = wsPath;
    }

    setWorkerURL(workerURL: string) {
        this.workerURL = workerURL;
    }

    setUseModuleWorker(useModuleWorker: boolean) {
        this.useModuleWorker = useModuleWorker;
    }

    setWorkerName(workerName: string) {
        this.workerName = workerName;
    }

    setLanguageDef(languageDef: unknown) {
        this.languageDef = languageDef;
    }

    setThemeData(themeData: unknown) {
        this.themeData = themeData;
    }

    setUseDiffEditor(useDiffEditor: boolean) {
        this.useDiffEditor = useDiffEditor;
    }

    startEditor(reloadInlineConfig: boolean) {
        this.syncPropertiesAndEditorConfig(reloadInlineConfig);
        this.monacoWrapper.startEditor(this.container.value!);
        this.registerListeners();
    }

    updateDiffEditorContent(code: string, languageId: string, modifiedCode: string, modifiedLanguageId: string) {
        this.setCode(code);
        this.setLanguageId(languageId);
        this.setModifiedCode(modifiedCode);
        this.setModifiedLanguageId(modifiedLanguageId);
    }

    loadInlineConfig() {
        if (this.isEnableInlineConfig()) {
            this.retrieveMonacoEditorOptions();
            this.retrieveMonacoDiffEditorOptions();
            this.retrieveLanguageClientOptions();
        }
    }

    updateLayout() {
        this.monacoWrapper.updateLayout();
    }

    private syncPropertiesAndEditorConfig(reloadInlineConfig: boolean) {
        if (reloadInlineConfig) {
            this.loadInlineConfig();
        }

        const wrapperConfig = this.monacoWrapper.getEditorConfig();
        wrapperConfig.setMainLanguageId(this.languageId);
        wrapperConfig.setMainCode(this.code);
        if (this.modifiedCode) {
            wrapperConfig.setDiffCode(this.modifiedCode);
        }
        if (this.modifiedLanguageId) {
            wrapperConfig.setDiffLanguageId(this.modifiedLanguageId);
        }
        wrapperConfig.setTheme(this.theme);
        wrapperConfig.setAutomaticLayout(this.automaticLayout);
        wrapperConfig.setMonacoEditorOptions(this.monacoEditorOptions);

        wrapperConfig.setUseLanguageClient(this.useLanguageClient === true);
        wrapperConfig.setUseWebSocket(this.useWebSocket === true);

        let lcConfigOptions: WebSocketConfigOptions | WorkerConfigOptions;
        if (wrapperConfig.isUseWebSocket()) {
            lcConfigOptions = wrapperConfig.getDefaultWebSocketConfig();
            lcConfigOptions.wsSecured = this.wsSecured === true;
            lcConfigOptions.wsHost = this.wsHost;
            lcConfigOptions.wsPort = this.wsPort;
            lcConfigOptions.wsPath = this.wsPath;
        }
        else {
            lcConfigOptions = wrapperConfig.getDefaultWorkerConfig();
            if (this.workerURL) {
                lcConfigOptions.workerURL = this.workerURL;
            }
            lcConfigOptions.workerType = this.useModuleWorker ? 'module' : 'classic';
            if (this.workerName) {
                lcConfigOptions.workerName = this.workerName;
            }
        }
        wrapperConfig.setLanguageClientConfigOptions(lcConfigOptions);

        wrapperConfig.setUseDiffEditor(this.useDiffEditor || false);
        if (wrapperConfig.isUseDiffEditor()) {
            wrapperConfig.setMonacoDiffEditorOptions(this.monacoDiffEditorOptions);
        }

        if (this.languageDef) {
            this.monacoWrapper.getMonacoConfig().setMonarchTokensProvider(this.languageDef);
        }
        if (this.themeData) {
            this.monacoWrapper.getMonacoConfig().setEditorThemeData(this.themeData);
        }
    }

    private buildAndCallConfigFunction(basename: string, loggingName: string): Record<string, unknown> | undefined {
        const winRec = window as unknown as Record<string, unknown>;
        const funcName = basename;
        const funcNamePlusId = `${funcName}${this.id}`;
        if (Object.prototype.hasOwnProperty.call(window, funcName) && typeof winRec[funcName] === 'function') {
            console.log(`Using config supplied by ${funcName} for ${loggingName}.`);
            return (winRec[funcName] as () => Record<string, unknown>)();
        } else if (Object.prototype.hasOwnProperty.call(winRec, funcNamePlusId) && typeof winRec[funcNamePlusId] === 'function') {
            console.log(`Using config supplied by ${funcNamePlusId} for ${loggingName}.`);
            return (winRec[funcNamePlusId] as () => Record<string, unknown>)();
        }
        else {
            return undefined;
        }
    }

    private retrieveMonacoEditorOptions() {
        if (!this.isEnableInlineConfig()) return;

        const options = this.buildAndCallConfigFunction('getMonacoEditorOptions', 'editor');
        this.setMonacoEditorOptions(options);
    }

    setMonacoEditorOptions(options: Record<string, unknown> | undefined) {
        if (!options) return;

        if (options.code) {
            this.setCode(options.code as string);
        }
        if (options.languageId) {
            this.setLanguageId(options.languageId as string);
        }
        if (options.theme) {
            this.setTheme(options.theme as string);
            // ensure theme is removed from global config object and kept separate
            options.theme = undefined;
        }
        for (const [k, v] of Object.entries(options)) {
            this.monacoEditorOptions[k] = v;
        }
    }

    private retrieveMonacoDiffEditorOptions() {
        if (!this.isEnableInlineConfig()) return;

        const options = this.buildAndCallConfigFunction('getMonacoDiffEditorOptions', 'diff editor');
        this.setMonacoDiffEditorOptions(options);
    }

    setMonacoDiffEditorOptions(options: Record<string, unknown> | undefined) {
        if (!options) return;

        if (options.code) {
            this.setCode(options.code as string);
        }
        if (options.languageId) {
            this.setLanguageId(options.languageId as string);
        }
        if (options.modifiedCode) {
            this.setModifiedCode(options.modifiedCode as string);
        }
        if (options.modifiedLanguageId) {
            this.setModifiedLanguageId(options.modifiedLanguageId as string);
        }
        if (options.theme) {
            this.setTheme(options.theme as string);
        }
        for (const [k, v] of Object.entries(options)) {
            this.monacoDiffEditorOptions[k] = v;
        }
    }

    private retrieveLanguageClientOptions() {
        if (!this.isEnableInlineConfig()) return;

        const options = this.buildAndCallConfigFunction('getLanguageClientOptions', 'language server connection');
        this.setLanguageClientOptions(options);
    }

    setLanguageClientOptions(options: Record<string, unknown> | undefined) {
        if (!options) return;

        if (this.useWebSocket) {
            const input = options as WebSocketConfigOptions;
            this.setWsSecured(input.wsSecured === true);
            if (input.wsHost) {
                this.setWsHost(input.wsHost);
            }
            if (input.wsPort) {
                this.setWsPort(input.wsPort);
            }
            if (input.wsPath) {
                this.setWsPath(input.wsPath);
            }
        } else {
            const input = options as WorkerConfigOptions;
            if (input.workerURL) {
                this.setWorkerURL(input.workerURL);
            }
            if (input.workerType) {
                this.setUseModuleWorker(input.workerType === 'module');
            }
            if (input.workerName) {
                this.setWorkerName(input.workerName);
            }
        }
    }

    private isEnableInlineConfig() {
        const content = this.children.length === 1 ? this.children[0] : undefined;
        return content instanceof HTMLScriptElement && this.enableInlineConfig;
    }

    override firstUpdated() {
        this.startEditor(true);
    }

    registerListeners() {
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', (e) => {
                this.setTheme(e.matches ? 'vs-dark' : 'vs-light');
                this.monacoWrapper.updateTheme(this.monacoWrapper.getEditorConfig().getTheme());
            });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'monaco-editor-comp': MonacoEditorWebComponent;
    }
}
