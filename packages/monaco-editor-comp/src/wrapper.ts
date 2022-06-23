import 'monaco-editor/esm/vs/editor/editor.all.js';

// select features
import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickInput/standaloneQuickInputService.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js';

// add workers
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
import 'monaco-editor/esm/vs/language/html/monaco.contribution';
import 'monaco-editor/esm/vs/language/css/monaco.contribution';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';

// support all basic-languages
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { getMonacoCss } from './generated/css';
import { getCodiconTtf } from './generated/ttf';

import { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices, MessageTransports } from 'monaco-languageclient';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver-protocol/browser';
import normalizeUrl from 'normalize-url';

import type { } from 'css-font-loading-module';

export type LanguageClientConfigOptions = {
    useWebSocket: boolean;
    wsSecured: boolean;
    wsHost: string;
    wsPort: number;
    wsPath: string;
    workerURL?: string;
}

export class CodeEditorConfig {

    useDiffEditor = false;
    codeOriginal: [string, string] = ['', 'javascript'];
    codeModified: [string, string] = ['', 'javascript'];
    theme = 'vs-light';
    monacoEditorOptions: Record<string, unknown> = {
        readOnly: false
    };
    useLanguageClient = false;
    lcConfigOptions: LanguageClientConfigOptions = {
        useWebSocket: true,
        wsSecured: false,
        wsHost: 'localhost',
        wsPort: 8080,
        wsPath: ''
    };
    monacoDiffEditorOptions: Record<string, unknown> = {
        readOnly: false
    };
    languageDef: monaco.languages.IMonarchLanguage | undefined = undefined;
    themeData: monaco.editor.IStandaloneThemeData | undefined = undefined;

    setMainLanguageId(languageId: string): void {
        this.codeOriginal[1] = languageId;
    }

    setMainCode(code: string): void {
        this.codeOriginal[0] = code;
    }

    setDiffLanguageId(languageId: string): void {
        this.codeModified[1] = languageId;
    }

    setDiffCode(code: string): void {
        this.codeModified[0] = code;
    }

    setMonarchTokensProvider(languageDef: unknown) {
        this.languageDef = languageDef as monaco.languages.IMonarchLanguage;
    }

    setEditorThemeData(themeData: unknown) {
        this.themeData = themeData as monaco.editor.IStandaloneThemeData;
    }
}

export class MonacoEditorLanguageClientWrapper {

    private editor: monaco.editor.IStandaloneCodeEditor | undefined;
    private diffEditor: monaco.editor.IStandaloneDiffEditor | undefined;
    private editorConfig: CodeEditorConfig = new CodeEditorConfig();
    private languageClient: MonacoLanguageClient | undefined;

    private id: string;

    constructor(id: string) {
        this.id = id;
    }

    getEditorConfig() {
        return this.editorConfig;
    }

    updateTheme() {
        monaco.editor.setTheme(this.editorConfig.theme);
    }

    setUseDiffEditor(useDiffEditor: boolean) {
        this.editorConfig.useDiffEditor = useDiffEditor;
    }

    isUseDiffEditor(): boolean {
        return this.editorConfig.useDiffEditor;
    }

    startEditor(container?: HTMLElement, dispatchEvent?: (event: Event) => boolean) {
        console.log(`Starting monaco-editor (${this.id})`);

        if (this.editorConfig.useDiffEditor) {
            this.diffEditor = monaco.editor.createDiffEditor(container!);
        }
        else {
            this.editor = monaco.editor.create(container!);
            this.editor.getModel()!.onDidChangeContent(() => {
                if (dispatchEvent) {
                    dispatchEvent(new CustomEvent('ChangeContent', { detail: {} }));
                }
            });
        }
        this.updateEditor();

        if (this.editorConfig.useLanguageClient) {
            console.log('Enabling monaco-languageclient');
            this.installMonaco();
            this.startLanguageClientConnection(this.editorConfig.lcConfigOptions);
        }

    }

    swapEditors(container?: HTMLElement, dispatchEvent?: (event: Event) => boolean): void {
        if (this.editorConfig.useDiffEditor) {
            if (this.editor) {
                this.editor?.dispose();
                this.editor = undefined;
            }
            if (!this.diffEditor) {
                this.startEditor(container, dispatchEvent);
            }
        }
        else {
            if (this.diffEditor) {
                this.diffEditor?.dispose();
                this.diffEditor = undefined;
            }
            if (!this.editor) {
                this.startEditor(container, dispatchEvent);
            }
        }
    }

    updateEditor() {
        if (this.editorConfig.useDiffEditor) {
            this.updateDiffEditor();
        }
        else {
            this.updateMainEditor();
        }
    }

    private updateMainEditor() {
        this.updateCommonEditorConfig();
        const options = this.editorConfig.monacoEditorOptions as monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions;
        this.editor?.updateOptions(options);

        const currentModel = this.editor?.getModel();
        const languageId = this.editorConfig.codeOriginal[1];
        if (languageId && currentModel && currentModel.getLanguageId() !== languageId) {
            monaco.editor.setModelLanguage(currentModel, languageId);
        }

        if (this.editorConfig.codeOriginal[0]) {
            this.editor?.setValue(this.editorConfig.codeOriginal[0]);
        }
        this.updateLayout();
    }

    private updateDiffEditor() {
        this.updateCommonEditorConfig();
        const options = this.editorConfig.monacoDiffEditorOptions as monaco.editor.IDiffEditorOptions & monaco.editor.IGlobalEditorOptions;
        this.diffEditor?.updateOptions(options);
        this.updateDiffModels();
        this.updateLayout();
    }

    private updateCommonEditorConfig() {
        if (this.editorConfig.useLanguageClient) {
            const languageId = this.editorConfig.codeOriginal[1];

            // apply monarch definitions
            if (languageId) {
                monaco.languages.register({ id: languageId });
            }
            if (this.editorConfig.languageDef) {
                monaco.languages.setMonarchTokensProvider(languageId, this.editorConfig.languageDef);
            }
            if (this.editorConfig.themeData) {
                monaco.editor.defineTheme(this.editorConfig.theme as string, this.editorConfig.themeData);
            }
        }
        this.updateTheme();
    }

    private updateDiffModels() {
        if (this.diffEditor) {
            const originalModel = monaco.editor.createModel(this.editorConfig.codeOriginal[0], this.editorConfig.codeOriginal[1]);
            const modifiedModel = monaco.editor.createModel(this.editorConfig.codeModified[0], this.editorConfig.codeModified[1]);

            this.diffEditor.setModel({
                original: originalModel,
                modified: modifiedModel
            });
        }
    }

    updateLayout() {
        if (this.editorConfig.useDiffEditor) {
            this.diffEditor?.layout();
        }
        else {
            this.editor?.layout();
        }
    }

    private installMonaco() {
        // install Monaco language client services
        if (monaco) {
            try {
                MonacoServices.get();
            }
            catch (e: unknown) {
                // install only if services are not yet available (exception will happen only then)
                MonacoServices.install();
                console.log(`Component (${this.id}): Installed MonacoServices`);
            }
        }
    }

    private startLanguageClientConnection(lcConfigOptions: LanguageClientConfigOptions) {
        if (this.languageClient && this.languageClient.isRunning()) return;

        let reader: WebSocketMessageReader | BrowserMessageReader;
        let writer: WebSocketMessageWriter | BrowserMessageWriter;
        if (lcConfigOptions.useWebSocket) {
            const url = this.createUrl(lcConfigOptions);
            const webSocket = new WebSocket(url);

            webSocket.onopen = () => {
                const socket = toSocket(webSocket);
                const reader = new WebSocketMessageReader(socket);
                const writer = new WebSocketMessageWriter(socket);
                this.languageClient = this.createLanguageClient({ reader, writer });
                this.languageClient.start();
                reader.onClose(() => this.languageClient?.stop());
            };
        } else if (lcConfigOptions.workerURL) {
            const worker = new Worker(new URL(lcConfigOptions.workerURL, window.location.href).href);
            reader = new BrowserMessageReader(worker);
            writer = new BrowserMessageWriter(worker);
            this.languageClient = this.createLanguageClient({ reader, writer });
            this.languageClient.start();
            reader.onClose(() => this.languageClient?.stop());
        } else {
            throw new Error('No valid WebSocket or Web Worker configuration is available.');
        }
    }

    private createLanguageClient(transports: MessageTransports): MonacoLanguageClient {
        return new MonacoLanguageClient({
            name: 'Monaco Wrapper Language Client',
            clientOptions: {
                // use a language id as a document selector
                documentSelector: [this.editorConfig.codeOriginal[1]],
                // disable the default error handler
                errorHandler: {
                    error: () => ({ action: ErrorAction.Continue }),
                    closed: () => ({ action: CloseAction.DoNotRestart })
                }
            },
            // create a language client connection from the JSON RPC connection on demand
            connectionProvider: {
                get: () => {
                    return Promise.resolve(transports);
                }
            }
        });
    }

    private createUrl(lcConfigOptions: LanguageClientConfigOptions) {
        const protocol = lcConfigOptions.wsSecured ? 'wss' : 'ws';
        return normalizeUrl(`${protocol}://${lcConfigOptions.wsHost}:${lcConfigOptions.wsPort}/${lcConfigOptions.wsPath}`);
    }

    static addMonacoStyles(idOfStyleElement: string) {
        const style = document.createElement('style');
        style.id = idOfStyleElement;
        style.innerHTML = getMonacoCss();
        document.head.appendChild(style);
    }

    static addCodiconTtf(): void {
        const ttf = getCodiconTtf();
        const codicon = new FontFace('Codicon', `url(${ttf})`);
        codicon.load().then(l => {
            document.fonts.add(l);
            document.body.style.fontFamily = '"Codicon", Arial';
            console.log('Loaded Codicon TTF font');
        }).catch(e => {
            throw e;
        });
    }

}

export { getMonacoCss, getCodiconTtf };
