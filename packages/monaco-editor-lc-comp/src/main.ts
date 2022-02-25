import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, Ref, ref } from 'lit/directives/ref.js';

import { monaco, MonacoLanguageClientWrapper, WorkerOverride } from './wrapper';

import monacoStyles from 'monaco-editor-core/min/vs/editor/editor.main.css';

@customElement('monaco-editor-lc-comp')
export class CodeEditorLanguageClient extends LitElement {

    private container: Ref<HTMLElement> = createRef();

    private monacoWrapper;

    @property({ reflect: true }) languageId? = 'javascript';
    @property({ reflect: true }) code? = '';
    @property({ reflect: true }) theme? = 'vs-light';
    @property({ type: Boolean, reflect: true }) enableInlineConfig? = false;
    @property({ type: Boolean, reflect: true }) useDiffEditor? = false;

    @property({ type: Boolean, reflect: true }) wsSecured? = false;
    @property({ reflect: true }) wsHost = 'localhost';
    @property({ type: Number, reflect: true }) wsPort = 8080;
    @property({ reflect: true }) wsPath = '';

    constructor() {
        super();
        this.monacoWrapper = new MonacoLanguageClientWrapper();

        // set proper defaults based on the default editor config
        this.updateCodeEditorConfig();
    }

    static override styles = css`
        :host {
            --editor-width: 100%;
            --editor-height: 100vh;
        }
        main {
            width: var(--editor-width);
            height: var(--editor-height);
        }
    `;

    override render() {
        return html`
        <style>${monacoStyles}</style>
        <style>${CodeEditorLanguageClient.styles}</style>
        <main ${ref(this.container)} id="monacoContainer${this.id}" class="main"></main>
        `;
    }

    updateCodeEditorConfig() {
        const config = this.monacoWrapper.getEditorConfig();
        this.languageId = config.monacoEditorOptions?.languageId as string;
        this.code = config.monacoEditorOptions?.code as string;
        this.theme = config.monacoEditorOptions?.theme as string;

        this.wsSecured = config.webSocketOptions.wsSecured;
        this.wsHost = config.webSocketOptions.wsHost;
        this.wsPort = config.webSocketOptions.wsPort;
        this.wsPath = config.webSocketOptions.wsPath;
    }

    setCode(code: string): void {
        this.code = code;
    }

    setTheme(theme: string): void {
        this.theme = theme;
    }

    setLanguageId(languageId: string): void {
        this.languageId = languageId;
    }

    private startEditor() {
        this.syncPropertiesAndEditorConfig();
        this.monacoWrapper.startEditor(this.container.value!, this.dispatchEvent);
        this.registerListeners();
    }

    updateEditor() {
        this.syncPropertiesAndEditorConfig();
        this.monacoWrapper.updateEditor();
    }

    private syncPropertiesAndEditorConfig() {
        this.monacoWrapper.updateBasicConfigItems(this.languageId, this.code, this.theme);
        this.monacoWrapper.updateWebSocketOptions(this.wsSecured || false, this.wsHost, this.wsPort, this.wsPath);
        if (this.enableInlineConfig) {
            this.retrieveMonacoEditorOptions();
            this.retrieveMonacoDiffEditorOptions();
            this.retrieveWebSocketOptions();
            this.monacoWrapper.setUseDiffEditor(this.useDiffEditor || false);
        }
    }

    private retrieveMonacoEditorOptions() {
        if (!this.isEnableInlineConfig()) return;

        const winRec = window as unknown as Record<string, unknown>;
        if (Object.prototype.hasOwnProperty.call(winRec, 'getMonacoEditorOptions') && typeof winRec.getMonacoEditorOptions === 'function') {
            this.monacoWrapper.getEditorConfig().monacoEditorOptions = winRec.getMonacoEditorOptions();
            console.log('Using config supplied by getMonacoEditorOptions for editor.');
        }
    }

    private retrieveMonacoDiffEditorOptions() {
        if (!this.isEnableInlineConfig()) return;

        const winRec = window as unknown as Record<string, unknown>;
        if (Object.prototype.hasOwnProperty.call(winRec, 'getMonacoDiffEditorOptions') && typeof winRec.getMonacoDiffEditorOptions === 'function') {
            this.monacoWrapper.getEditorConfig().monacoDiffEditorOptions = winRec.getMonacoDiffEditorOptions();
            console.log('Using config supplied by getMonacoDiffEditorOptions for diff editor.');
        }
    }

    private retrieveWebSocketOptions() {
        if (!this.isEnableInlineConfig()) return;

        const winRec = window as unknown as Record<string, unknown>;
        if (Object.prototype.hasOwnProperty.call(winRec, 'getWebSocketOptions') && typeof winRec.getWebSocketOptions === 'function') {
            this.monacoWrapper.getEditorConfig().webSocketOptions = winRec.getWebSocketOptions();
            console.log('Using config supplied by getWebSocketOptions for diff editor.');
        }
    }

    private isEnableInlineConfig() {
        const content = this.children.length === 1 ? this.children[0] : undefined;
        return content instanceof HTMLScriptElement && this.enableInlineConfig;
    }

    registerMonarchTokensProvider(languageId: string, languageDef: unknown) {
        this.languageId = languageId;
        this.monacoWrapper.getEditorConfig().languageDef = languageDef as monaco.languages.IMonarchLanguage;
    }

    registerEditorTheme(themeName: string, themeData: unknown) {
        this.theme = themeName;
        this.monacoWrapper.getEditorConfig().themeData = themeData as monaco.editor.IStandaloneThemeData;
    }

    firstUpdated() {
        this.startEditor();
    }

    registerListeners() {
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', (e) => {
                this.monacoWrapper.setTheme(e.matches ? 'vs-dark' : 'vs-light');
            });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'monaco-editor-lc-comp': CodeEditorLanguageClient;
    }
}

export { WorkerOverride };
