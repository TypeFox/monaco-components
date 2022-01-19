import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, Ref, ref } from 'lit/directives/ref.js';

// Monaco Editor Imports
import * as monaco from 'monaco-editor-core';
import styles from 'monaco-editor-core/min/vs/editor/editor.main.css';
import editorWorker from 'monaco-editor-core/esm/vs/editor/editor.worker?worker';

(self as monaco.Window).MonacoEnvironment = {
    getWorker: () => new editorWorker()
};

import { CodeEditor, CodeEditorConfig, DefaultCodeEditorConfig } from 'moned-base';
import { MonacoLanguageClientWrapper } from './lcwrapper';

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

    private editor?: monaco.editor.IStandaloneCodeEditor;
    private monacoLanguageClientWrapper: MonacoLanguageClientWrapper;

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
        this.monacoLanguageClientWrapper = new MonacoLanguageClientWrapper();

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

        monaco.languages.register({ id: this.editorConfig.languageId });
        monaco.languages.setMonarchTokensProvider(this.editorConfig.languageId, languageDef);
    }

    registerEditorTheme(themeName: string, themeData: monaco.editor.IStandaloneThemeData) {
        this.theme = themeName;
        this.syncPropertiesAndEditorConfig();

        monaco.editor.defineTheme(this.editorConfig.theme, themeData);
    }

    startEditor() {
        this.editor = monaco.editor.create(this.container.value!);
        this.updateEditor();

        this.monacoLanguageClientWrapper.installMonaco()
            .establishWebSocket(this.editorConfig.webSocket);

        this.editor.getModel()!.onDidChangeContent(() => {
            this.dispatchEvent(new CustomEvent('ChangeContent', { detail: {} }));
        });

        this.registerListeners();
    }

    updateEditor() {
        const options = this.editorConfig.buildConf() as monaco.editor.IStandaloneEditorConstructionOptions;
        console.log(this.editorConfig);
        console.log(options);
        this.editor?.updateOptions(options);

        const currentModel = this.editor?.getModel();
        if (currentModel) {
            monaco.editor.setModelLanguage(currentModel, this.editorConfig.languageId);
            this.editor?.setValue(this.editorConfig.code);
        }
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
                monaco.editor.setTheme(this.editorConfig.theme);
            });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'moned-lc': CodeEditorLC;
    }
}
