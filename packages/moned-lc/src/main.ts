import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, Ref, ref } from "lit/directives/ref.js";

// -- Monaco Editor Imports --
import * as monaco from 'monaco-editor-core';
import styles from "monaco-editor-core/min/vs/editor/editor.main.css";
import editorWorker from "monaco-editor-core/esm/vs/editor/editor.worker?worker";

// @ts-ignore
self.MonacoEnvironment = {
    // @ts-ignore
    getWorker(_: any, label: string) {
        return new editorWorker();
    },
};

// @ts-ignore
import * as vscode from "vscode";

import { MonacoLanguageClient, MessageConnection, CloseAction, ErrorAction, MonacoServices, createConnection } from '@codingame/monaco-languageclient';
// @ts-ignore
import { listen } from '@codingame/monaco-jsonrpc';
import normalizeUrl from 'normalize-url';
import ReconnectingWebSocket from 'reconnecting-websocket';

class MonacoLanguageClientBinding {

    registerLanguages() {
        if (!monaco) return;

        // register Monaco languages
        monaco.languages.register({
            id: 'json',
            extensions: ['.json', '.bowerrc', '.jshintrc', '.jscsrc', '.eslintrc', '.babelrc'],
            aliases: ['JSON', 'json'],
            mimetypes: ['application/json'],
        });
    }

    install() {
        if (!monaco) return;

        // install Monaco language client services
        MonacoServices.install(monaco);
    }

    create() {
        // create the web socket
        const url = this.createUrl('/sampleServer')
        const webSocket = new WebSocket(url);
        new ReconnectingWebSocket(url, [], {
            WebSocket: webSocket,
            maxReconnectionDelay: 10000,
            minReconnectionDelay: 1000,
            reconnectionDelayGrowFactor: 1.3,
            connectionTimeout: 10000,
            maxRetries: Infinity,
            debug: false
        });

        // listen when the web socket is opened
        listen({
            webSocket,
            onConnection: connection => {
                // create and start the language client
                const languageClient = this.createLanguageClient(connection);
                const disposable = languageClient.start();
                connection.onClose(() => disposable.dispose());
            }
        });
    }

    createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
        return new MonacoLanguageClient({
            name: "Sample Language Client",
            clientOptions: {
                // use a language id as a document selector
                documentSelector: ['json'],
                // disable the default error handler
                errorHandler: {
                    error: () => ErrorAction.Continue,
                    closed: () => CloseAction.DoNotRestart
                }
            },
            // create a language client connection from the JSON RPC connection on demand
            connectionProvider: {
                get: (errorHandler, closeHandler) => {
                    return Promise.resolve(createConnection(connection, errorHandler, closeHandler))
                }
            }
        });
    }

    createUrl(path: string): string {
        const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
        return normalizeUrl(`${protocol}://${location.host}${location.pathname}${path}`);
    }

}

import { CodeEditorLanguageClient, CodeEditorLCType, CodeEditorConfig, DefaultCodeEditorConfig } from 'moned-base';

@customElement('moned-lc')
export class CodeEditorLC extends LitElement implements CodeEditorLanguageClient {

    private container: Ref<HTMLElement> = createRef();
    private editorConfig: CodeEditorConfig = new DefaultCodeEditorConfig();

    editor?: monaco.editor.IStandaloneCodeEditor;
    private monacoLanguageClientBinding: MonacoLanguageClientBinding = new MonacoLanguageClientBinding();

    @property() language?: CodeEditorConfig["language"];
    @property() code?: CodeEditorConfig["code"];
    @property() theme?: CodeEditorConfig["theme"];
    @property({ type: Boolean, attribute: "readOnly" }) readOnly?: CodeEditorConfig["readOnly"];

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

    getCodeEditorType(): CodeEditorLCType {
        return 'CodeEditorLanguageClient';
    }

    getFixedLanguageName() {
        return 'MyLanguage'
    }

    updateCodeEditorConfig(codeEditorConfig: CodeEditorConfig | undefined | null) {
        if (codeEditorConfig) {
            this.editorConfig = codeEditorConfig;
        }
    }

    getCodeEditorConfig() {
        return this.editorConfig;
    }

    loadComponentProperties() {
        if (this.language) this.editorConfig.language = this.language;
        if (this.code) this.editorConfig.code = this.code;
        if (this.theme) this.editorConfig.theme = this.theme;
        if (this.readOnly) this.editorConfig.readOnly = this.readOnly;
    }

    firstUpdated() {
        this.loadComponentProperties();

        this.editor = monaco.editor.create(this.container.value!, this.editorConfig.buildConf() as monaco.editor.IStandaloneEditorConstructionOptions);
        this.monacoLanguageClientBinding.registerLanguages();

        this.editor.getModel()!.onDidChangeContent(() => {
            this.dispatchEvent(new CustomEvent("change", { detail: {} }));
        });
        this.registerListeners();
    }

    registerListeners() {
        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", () => {
                monaco.editor.setTheme(this.editorConfig.theme);
            });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "moned-lc": CodeEditorLC;
    }
}
