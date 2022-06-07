import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, Ref, ref } from 'lit/directives/ref.js';

import { getMonacoCss, MonacoLanguageClientWrapper, WebSocketConfigOptions } from './wrapper';

@customElement('monaco-editor-comp')
export class CodeEditorLanguageClient extends LitElement {

    private container: Ref<HTMLElement> = createRef();

    private monacoWrapper = new MonacoLanguageClientWrapper(this.id);

    @property({ reflect: true }) code = '';
    @property({ reflect: true }) languageId = 'javascript';
    @property({ reflect: true }) modifiedCode?= '';
    @property({ reflect: true }) modifiedLanguageId?= 'javascript';
    @property({ reflect: true }) theme = 'vs-light';
    @property({ type: Boolean, reflect: true }) enableInlineConfig?= false;
    @property({ type: Boolean, reflect: true }) useDiffEditor?= false;
    @property({ type: Boolean, reflect: true }) useLanguageClient?= false;

    @property({ type: Boolean, reflect: true }) wsSecured?= false;
    @property({ reflect: true }) wsHost = 'localhost';
    @property({ type: Number, reflect: true }) wsPort = 8080;
    @property({ reflect: true }) wsPath = '';

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
        <style>${CodeEditorLanguageClient.styles}</style>
        <main ${ref(this.container)} id="monacoContainer${this.id}" class="main"></main>
        `;
    }

    setCode(code: string): void {
        this.code = code;
        this.monacoWrapper.getEditorConfig().setMainCode(code);
    }

    setLanguageId(languageId: string): void {
        this.languageId = languageId;
        this.monacoWrapper.getEditorConfig().setMainLanguageId(languageId);
    }

    setModifiedCode(modifiedCode: string): void {
        this.modifiedCode = modifiedCode;
        this.monacoWrapper.getEditorConfig().setDiffCode(modifiedCode);
    }

    setModifiedLanguageId(modifiedLanguageId: string): void {
        this.modifiedLanguageId = modifiedLanguageId;
        this.monacoWrapper.getEditorConfig().setDiffLanguageId(modifiedLanguageId);
    }

    setTheme(theme: string): void {
        this.theme = theme;
        this.monacoWrapper.getEditorConfig().theme = theme;
    }

    setWsSecured(wsSecured: boolean) {
        this.wsSecured = wsSecured;
        this.monacoWrapper.getEditorConfig().webSocketOptions.wsSecured = wsSecured;
    }

    setWsHost(wsHost: string) {
        this.wsHost = wsHost;
        this.monacoWrapper.getEditorConfig().webSocketOptions.wsHost = wsHost;
    }

    setWsPort(wsPort: number) {
        this.wsPort = wsPort;
        this.monacoWrapper.getEditorConfig().webSocketOptions.wsPort = wsPort;
    }

    setWsPath(wsPath: string) {
        this.wsPath = wsPath;
        this.monacoWrapper.getEditorConfig().webSocketOptions.wsPath = wsPath;
    }

    setUseLanguageClient(useLanguageClient: boolean) {
        this.useLanguageClient = useLanguageClient;
        this.monacoWrapper.getEditorConfig().useLanguageClient = useLanguageClient;
    }

    private startEditor(reloadInlineConfig: boolean) {
        this.syncPropertiesAndEditorConfig(reloadInlineConfig);
        this.monacoWrapper.startEditor(this.container.value!, this.dispatchEvent);
        this.registerListeners();
    }

    updateEditor(reloadInlineConfig: boolean) {
        this.syncPropertiesAndEditorConfig(reloadInlineConfig);
        this.monacoWrapper.updateEditor();
    }

    swapEditors(options: { useDiffEditor: boolean, reloadInlineConfig: boolean }): void {
        this.useDiffEditor = options.useDiffEditor;
        this.syncPropertiesAndEditorConfig(options.reloadInlineConfig);
        this.monacoWrapper.swapEditors(this.container.value!, this.dispatchEvent);
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
            this.retrieveWebSocketOptions();
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
            wrapperConfig.setMainCode(this.modifiedCode);
        }
        if (this.modifiedLanguageId) {
            wrapperConfig.setDiffLanguageId(this.modifiedLanguageId);
        }
        wrapperConfig.theme = this.theme;
        wrapperConfig.webSocketOptions = {
            wsSecured: this.wsSecured === true,
            wsHost: this.wsHost,
            wsPort: this.wsPort,
            wsPath: this.wsPath
        };
        wrapperConfig.useLanguageClient = this.useLanguageClient === true;

        this.monacoWrapper.setUseDiffEditor(this.useDiffEditor || false);
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
        this.monacoWrapper.getEditorConfig().monacoEditorOptions = options;
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
        this.monacoWrapper.getEditorConfig().monacoDiffEditorOptions = options;
    }

    private retrieveWebSocketOptions() {
        if (!this.isEnableInlineConfig()) return;

        const options = this.buildAndCallConfigFunction('getWebSocketOptions', 'language server connection');
        this.setMonacoEditorOptions(options);
    }

    setWebSocketOptions(options: Record<string, unknown>) {
        this.monacoWrapper.getEditorConfig().webSocketOptions = options as WebSocketConfigOptions;
    }

    private isEnableInlineConfig() {
        const content = this.children.length === 1 ? this.children[0] : undefined;
        return content instanceof HTMLScriptElement && this.enableInlineConfig;
    }

    registerMonarchTokensProvider(languageId: string, languageDef: unknown) {
        this.monacoWrapper.getEditorConfig().registerMonarchTokensProvider(languageId, languageDef);
    }

    registerEditorTheme(theme: string, themeData: unknown) {
        this.monacoWrapper.getEditorConfig().registerEditorTheme(theme, themeData);
    }

    firstUpdated() {
        this.startEditor(true);
    }

    registerListeners() {
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', (e) => {
                this.setTheme(e.matches ? 'vs-dark' : 'vs-light');
                this.monacoWrapper.updateTheme();
            });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'monaco-editor-comp': CodeEditorLanguageClient;
    }
}
