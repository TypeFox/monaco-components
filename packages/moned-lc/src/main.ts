import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, Ref, ref } from 'lit/directives/ref.js';

import { CodeEditor, CodeEditorConfig, DefaultCodeEditorConfig } from 'moned-base';
import { monaco, styles, MonacoLanguageClientWrapper } from './wrapper';

export type WebSocketConf = {
    secured: boolean;
    host: string;
    port: number;
    path: string;
}

export type MonedLCCodeEditorConfig = CodeEditorConfig & {
    webSocket: WebSocketConf
}

export class DefaultMonedLCCodeEditorConfig extends DefaultCodeEditorConfig implements MonedLCCodeEditorConfig {
    webSocket = {
        secured: false,
        host: 'localhost',
        port: 8080,
        path: ''
    };
}

export interface CodeEditorLanguageClient extends CodeEditor {

    getCodeEditorConfig(): MonedLCCodeEditorConfig;

    updateCodeEditorConfig(codeEditorConfig: MonedLCCodeEditorConfig | undefined | null): void;

    registerMonarchTokensProvider(languageId: string, languageDef: unknown): void;

    registerEditorTheme(themeName: string, themeData: unknown): void;

}

@customElement('moned-lc')
export class CodeEditorLanguageClientImpl extends LitElement implements CodeEditorLanguageClient {

    private container: Ref<HTMLElement> = createRef();
    private editorConfig: MonedLCCodeEditorConfig;

    private monacoWrapper;

    @property({ reflect: true }) languageId?;
    @property({ reflect: true }) code?;
    @property({ reflect: true }) theme?;
    @property({ type: Boolean, reflect: true }) readOnly?;

    @property({ type: Boolean, reflect: true }) wsSecured?;
    @property({ reflect: true }) wsHost;
    @property({ type: Number, reflect: true }) wsPort;
    @property({ reflect: true }) wsPath;

    constructor() {
        super();
        this.editorConfig = new DefaultMonedLCCodeEditorConfig();

        // set proper defaults based on the default editor config
        this.languageId = this.editorConfig.languageId;
        this.code = this.editorConfig.code;
        this.theme = this.editorConfig.theme;
        this.readOnly = this.editorConfig.readOnly;

        this.wsSecured = this.editorConfig.webSocket.secured;
        this.wsHost = this.editorConfig.webSocket.host;
        this.wsPort = this.editorConfig.webSocket.port;
        this.wsPath = this.editorConfig.webSocket.path;

        this.monacoWrapper = new MonacoLanguageClientWrapper(this.editorConfig);
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
          <style>
            ${styles}
          </style>
          <main ${ref(this.container)}></main>
        `;
    }

    getCodeEditorType(): string {
        return 'CodeEditorLanguageClient';
    }

    updateCodeEditorConfig(codeEditorConfig: MonedLCCodeEditorConfig | undefined | null) {
        if (codeEditorConfig) {
            this.editorConfig = codeEditorConfig;
        }
        this.languageId = this.editorConfig.languageId;
        this.code = this.editorConfig.code;
        this.theme = this.editorConfig.theme;
        this.readOnly = this.editorConfig.readOnly;

        this.wsSecured = this.editorConfig.webSocket.secured;
        this.wsHost = this.editorConfig.webSocket.host;
        this.wsPort = this.editorConfig.webSocket.port;
        this.wsPath = this.editorConfig.webSocket.path;
    }

    getCodeEditorConfig() {
        return this.editorConfig;
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

    private syncPropertiesAndEditorConfig() {
        if (this.languageId) this.editorConfig.languageId = this.languageId;
        if (this.code) this.editorConfig.code = this.code;
        if (this.theme) this.editorConfig.theme = this.theme;
        if (this.readOnly === true) this.editorConfig.readOnly = this.readOnly;
        if (this.wsSecured === true) this.editorConfig.webSocket.secured = this.wsSecured;
        this.editorConfig.webSocket.host = this.wsHost;
        this.editorConfig.webSocket.port = this.wsPort;
        this.editorConfig.webSocket.path = this.wsPath;
    }

    private startEditor() {
        this.syncPropertiesAndEditorConfig();
        this.monacoWrapper.startEditor(this.container.value!, this.dispatchEvent);

        this.registerListeners();
    }

    updateEditor() {
        this.syncPropertiesAndEditorConfig();
        this.updateCodeEditorConfig(this.editorConfig);
        this.monacoWrapper.updateEditor();
    }

    registerMonarchTokensProvider(languageId: string, languageDef: unknown) {
        this.languageId = languageId;
        this.syncPropertiesAndEditorConfig();
        this.monacoWrapper.updateEditorConfig(this.editorConfig);

        // this is a hack and can lead to exceptions
        this.monacoWrapper.registerMonarchTokensProvider(languageDef as monaco.languages.IMonarchLanguage);
    }

    registerEditorTheme(themeName: string, themeData: unknown) {
        this.theme = themeName;
        this.syncPropertiesAndEditorConfig();
        this.monacoWrapper.updateEditorConfig(this.editorConfig);

        // this is a hack and can lead to exceptions
        this.monacoWrapper.registerEditorTheme(themeData as monaco.editor.IStandaloneThemeData);
    }

    firstUpdated() {
        this.startEditor();
    }

    registerListeners() {
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', () => {
                this.monacoWrapper.setTheme(this.editorConfig.theme);
            });
    }

}

declare global {
    interface HTMLElementTagNameMap {
        'moned-lc': CodeEditorLanguageClientImpl;
    }
}
