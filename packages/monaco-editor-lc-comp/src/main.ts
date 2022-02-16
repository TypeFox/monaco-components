import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, Ref, ref } from 'lit/directives/ref.js';

import { monaco, monacoStyles, WebSocketConf, MonacoLanguageClientWrapper, WorkerOverride } from './wrapper';

export class CodeEditorConfig {
    code = '';
    languageId = 'javascript';
    theme = 'vs-light';
    readOnly = false;

    webSocket: WebSocketConf = {
        secured: false,
        host: 'localhost',
        port: 8080,
        path: ''
    };
    languageDef: monaco.languages.IMonarchLanguage | undefined = undefined;
    themeData: monaco.editor.IStandaloneThemeData | undefined = undefined;

    isDark() {
        return (
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
        );
    }
}

@customElement('monaco-editor-lc-comp')
export class CodeEditorLanguageClient extends LitElement {

    private container: Ref<HTMLElement> = createRef();
    private editorConfig: CodeEditorConfig;

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
        this.editorConfig = new CodeEditorConfig();

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
        <style>${monacoStyles}</style>
        <style>${CodeEditorLanguageClient.styles}</style>
        <main ${ref(this.container)}></main>
        `;
    }

    getCodeEditorType(): string {
        return 'CodeEditorLanguageClient';
    }

    updateCodeEditorConfig(codeEditorConfig: CodeEditorConfig) {
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
        this.monacoWrapper.updateEditorConfig(this.editorConfig);
        this.monacoWrapper.startEditor(this.container.value!, this.dispatchEvent);

        this.registerListeners();
    }

    updateEditor() {
        this.syncPropertiesAndEditorConfig();
        this.monacoWrapper.updateEditorConfig(this.editorConfig);
        this.monacoWrapper.updateEditor();
    }

    registerMonarchTokensProvider(languageId: string, languageDef: unknown) {
        this.languageId = languageId;
        this.editorConfig.languageDef = languageDef as monaco.languages.IMonarchLanguage;
    }

    registerEditorTheme(themeName: string, themeData: unknown) {
        this.theme = themeName;
        this.editorConfig.themeData = themeData as monaco.editor.IStandaloneThemeData;
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
        'monaco-editor-lc-comp': CodeEditorLanguageClient;
    }
}

export { WorkerOverride };
