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
import 'monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js';

// add workers
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
import 'monaco-editor/esm/vs/language/html/monaco.contribution';
import 'monaco-editor/esm/vs/language/css/monaco.contribution';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';

// support all basic-languages
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices } from 'monaco-languageclient';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from '@codingame/monaco-jsonrpc';
import { MessageTransports } from 'monaco-languageclient';
import normalizeUrl from 'normalize-url';

export type WebSocketConfigOptions = {
    wsSecured: boolean;
    wsHost: string;
    wsPort: number;
    wsPath: string;
}

export class CodeEditorConfig {

    useDiffEditor = false;
    useLanguageClient = false;
    codeOriginal: [string, string] = ['', 'javascript'];
    codeModified: [string, string] = ['', 'javascript'];
    theme = 'vs-light';
    monacoEditorOptions: Record<string, unknown> = {
        readOnly: false
    };
    webSocketOptions: WebSocketConfigOptions = {
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

}

export class MonacoLanguageClientWrapper {

    private editor: monaco.editor.IStandaloneCodeEditor | undefined;
    private diffEditor: monaco.editor.IStandaloneDiffEditor | undefined;
    private editorConfig: CodeEditorConfig = new CodeEditorConfig();

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
            this.establishWebSocket(this.editorConfig.webSocketOptions);
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
            if (this.editorConfig.languageDef && languageId) {
                monaco.languages.register({ id: languageId });
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
                MonacoServices.install(monaco);
                console.log(`Component (${this.id}): Installed MonacoServices`);
            }
        }
    }

    private establishWebSocket(websocketConfig: WebSocketConfigOptions) {
        // create the web socket
        const url = this.createUrl(websocketConfig);
        const webSocket = new WebSocket(url);

        const socket = toSocket(webSocket);
        const reader = new WebSocketMessageReader(socket);
        const writer = new WebSocketMessageWriter(socket);
        const languageClient = this.createLanguageClient({
            reader,
            writer
        });
        languageClient.start();
        reader.onClose(() => languageClient.stop());
    }

    private createLanguageClient(transports: MessageTransports): MonacoLanguageClient {
        return new MonacoLanguageClient({
            name: 'Sample Language Client',
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

    private createUrl(websocketConfig: WebSocketConfigOptions) {
        const protocol = websocketConfig.wsSecured ? 'wss' : 'ws';
        return normalizeUrl(`${protocol}://${websocketConfig.wsHost}:${websocketConfig.wsPort}/${websocketConfig.wsPath}`);
    }

}
