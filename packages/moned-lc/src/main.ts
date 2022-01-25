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
    delayedStart: boolean
}

export class DefaultMonedLCCodeEditorConfig extends DefaultCodeEditorConfig implements MonedLCCodeEditorConfig {

    webSocket = {
        secured: false,
        host: 'localhost',
        port: 8080,
        path: ''
    };
    delayedStart = false;
}

export interface CodeEditorLanguageClient extends CodeEditor {

    getCodeEditorConfig(): MonedLCCodeEditorConfig;

    updateCodeEditorConfig(codeEditorConfig: MonedLCCodeEditorConfig | undefined | null): void;

}

@customElement('moned-lc')
export class CodeEditorLC extends LitElement implements CodeEditorLanguageClient {

    private container: Ref<HTMLElement> = createRef();
    private editorConfig: MonedLCCodeEditorConfig;

    private monacoWrapper;

    @property() languageId?;
    @property() code?;
    @property() theme?;
    @property({ type: Boolean }) readOnly?;
    @property({ type: Boolean }) delayedStart?;
    @property({ type: Boolean }) wsSecured?;
    @property() wsHost;
    @property({ type: Number }) wsPort;
    @property() wsPath;

    constructor() {
        super();
        this.editorConfig = new DefaultMonedLCCodeEditorConfig();

        // set proper defaults based on the default editor config
        this.languageId = this.editorConfig.languageId;
        this.code = this.editorConfig.code;
        this.theme = this.editorConfig.theme;
        this.readOnly = this.editorConfig.readOnly;
        this.delayedStart = this.editorConfig.delayedStart;

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
        this.delayedStart = this.editorConfig.delayedStart;

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
        this.syncPropertiesAndEditorConfig();
    }

    setTheme(theme: string): void {
        this.theme = theme;
        this.syncPropertiesAndEditorConfig();
    }

    setLanguageId(languageId: string): void {
        this.languageId = languageId;
        this.syncPropertiesAndEditorConfig();
    }

    syncPropertiesAndEditorConfig() {
        if (this.languageId) this.editorConfig.languageId = this.languageId;
        if (this.code) this.editorConfig.code = this.code;
        if (this.theme) this.editorConfig.theme = this.theme;
        if (this.readOnly === true) this.editorConfig.readOnly = this.readOnly;
        if (this.delayedStart === true) this.editorConfig.delayedStart = this.delayedStart;
        if (this.wsSecured === true) this.editorConfig.webSocket.secured = this.wsSecured;
        this.editorConfig.webSocket.host = this.wsHost;
        this.editorConfig.webSocket.port = this.wsPort;
        this.editorConfig.webSocket.path = this.wsPath;
    }

    registerMonarchTokensProvider(languageId: string, languageDef: monaco.languages.IMonarchLanguage) {
        this.languageId = languageId;
        this.syncPropertiesAndEditorConfig();
        this.monacoWrapper.updateEditorConfig(this.editorConfig);

        this.monacoWrapper.registerMonarchTokensProvider(languageDef);
    }

    registerEditorTheme(themeName: string, themeData: monaco.editor.IStandaloneThemeData) {
        this.theme = themeName;
        this.syncPropertiesAndEditorConfig();
        this.monacoWrapper.updateEditorConfig(this.editorConfig);

        this.monacoWrapper.registerEditorTheme(themeData);
    }

    startEditor() {
        this.monacoWrapper.startEditor(this.container.value!, this.dispatchEvent);

        this.registerListeners();
    }

    updateEditor() {
        this.monacoWrapper.updateEditor();
    }

    firstUpdated() {
        this.syncPropertiesAndEditorConfig();

        if (!this.editorConfig.delayedStart) {
            this.startEditor();
        }
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
        'moned-lc': CodeEditorLC;
    }
}
