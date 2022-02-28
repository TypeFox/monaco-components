import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, Ref, ref } from 'lit/directives/ref.js';

import { monaco, MonacoLanguageClientWrapper, WorkerOverride } from './wrapper';

import monacoStyles from 'monaco-editor-core/min/vs/editor/editor.main.css';
import { WebSocketConfigOptions } from '.';

@customElement('monaco-editor-lc-comp')
export class CodeEditorLanguageClient extends LitElement {

    private container: Ref<HTMLElement> = createRef();

    private monacoWrapper;

    @property({ reflect: true }) code? = '';
    @property({ reflect: true }) languageId? = 'javascript';
    @property({ reflect: true }) modifiedCode? = '';
    @property({ reflect: true }) modifiedLanguageId? = 'javascript';
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

    private updateCodeEditorConfig() {
        const config = this.monacoWrapper.getEditorConfig();
        this.code = config.codeOriginal[0];
        this.languageId = config.codeOriginal[1];
        this.modifiedCode = config.codeModified[0];
        this.modifiedLanguageId = config.codeModified[1];
        this.theme = config.monacoEditorOptions?.theme as string;

        this.wsSecured = config.webSocketOptions.wsSecured;
        this.wsHost = config.webSocketOptions.wsHost;
        this.wsPort = config.webSocketOptions.wsPort;
        this.wsPath = config.webSocketOptions.wsPath;
    }

    setCode(code: string): void {
        this.code = code;
        this.monacoWrapper.getEditorConfig().codeOriginal[0] = code;
    }

    setLanguageId(languageId: string): void {
        this.languageId = languageId;
        this.monacoWrapper.getEditorConfig().codeOriginal[1] = languageId;
    }

    setModifiedCode(modifiedCode: string): void {
        this.modifiedCode = modifiedCode;
        this.monacoWrapper.getEditorConfig().codeModified[0] = modifiedCode;
    }

    setModifiedLanguageId(modifiedLanguageId: string): void {
        this.modifiedLanguageId = modifiedLanguageId;
        this.monacoWrapper.getEditorConfig().codeModified[1] = modifiedLanguageId;
    }

    setTheme(theme: string): void {
        this.theme = theme;
        this.monacoWrapper.getEditorConfig().monacoEditorOptions.theme = theme;
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

    private startEditor() {
        this.syncPropertiesAndEditorConfig(true);
        this.monacoWrapper.startEditor(this.container.value!, this.dispatchEvent);
        this.registerListeners();
    }

    updateEditor() {
        this.syncPropertiesAndEditorConfig(false);
        this.monacoWrapper.updateEditor();
    }

    swapEditors(useDiffEditor: boolean): void {
        this.useDiffEditor = useDiffEditor;
        this.syncPropertiesAndEditorConfig(false);
        this.monacoWrapper.swapEditors(this.container.value!, this.dispatchEvent);
    }

    updateDiffEditorContent(diffEditorOriginal: [string, string], diffEditorModified: [string, string]) {
        this.setCode(diffEditorOriginal[0]);
        this.setLanguageId(diffEditorOriginal[1]);
        this.setModifiedCode(diffEditorModified[0]);
        this.setModifiedLanguageId(diffEditorModified[1]);
    }

    private syncPropertiesAndEditorConfig(initial: boolean) {
        if (this.isEnableInlineConfig() && initial) {
            this.retrieveMonacoEditorOptions();
            this.retrieveMonacoDiffEditorOptions();
            this.retrieveWebSocketOptions();
        }
        this.monacoWrapper.setUseDiffEditor(this.useDiffEditor || false);
    }

    private retrieveMonacoEditorOptions() {
        if (!this.isEnableInlineConfig()) return;

        const winRec = window as unknown as Record<string, unknown>;
        if (Object.prototype.hasOwnProperty.call(winRec, 'getMonacoEditorOptions') && typeof winRec.getMonacoEditorOptions === 'function') {
            const options = winRec.getMonacoEditorOptions();
            this.setMonacoEditorOptions(options);
            console.log('Using config supplied by getMonacoEditorOptions for editor.');
        }
    }

    public setMonacoEditorOptions(options: Record<string, unknown>) {
        this.setCode(options.code as string);
        this.setLanguageId(options.languageId as string);
        this.monacoWrapper.getEditorConfig().monacoEditorOptions = options;
    }

    private retrieveMonacoDiffEditorOptions() {
        if (!this.isEnableInlineConfig()) return;

        const winRec = window as unknown as Record<string, unknown>;
        if (Object.prototype.hasOwnProperty.call(winRec, 'getMonacoDiffEditorOptions') && typeof winRec.getMonacoDiffEditorOptions === 'function') {
            const options = winRec.getMonacoDiffEditorOptions();
            this.setMonacoDiffEditorOptions(options);
            console.log('Using config supplied by getMonacoDiffEditorOptions for diff editor.');
        }
    }

    public setMonacoDiffEditorOptions(options: Record<string, unknown>) {
        this.setCode((options.diffEditorOriginal as [string, string])[0]);
        this.setLanguageId((options.diffEditorOriginal as [string, string])[1]);
        this.setModifiedCode((options.diffEditorModified as [string, string])[0]);
        this.setModifiedLanguageId((options.diffEditorModified as [string, string])[1]);
        this.monacoWrapper.getEditorConfig().monacoDiffEditorOptions = options;
    }

    private retrieveWebSocketOptions() {
        if (!this.isEnableInlineConfig()) return;

        const winRec = window as unknown as Record<string, unknown>;
        if (Object.prototype.hasOwnProperty.call(winRec, 'getWebSocketOptions') && typeof winRec.getWebSocketOptions === 'function') {
            this.setWebSocketOptions(winRec.getWebSocketOptions());
            console.log('Using config supplied by getWebSocketOptions for diff editor.');
        }
    }

    public setWebSocketOptions(options: Record<string, unknown>) {
        this.monacoWrapper.getEditorConfig().webSocketOptions = options as WebSocketConfigOptions;
    }

    private isEnableInlineConfig() {
        const content = this.children.length === 1 ? this.children[0] : undefined;
        return content instanceof HTMLScriptElement && this.enableInlineConfig;
    }

    registerMonarchTokensProvider(languageId: string, languageDef: unknown) {
        this.setLanguageId(languageId);
        this.monacoWrapper.getEditorConfig().languageDef = languageDef as monaco.languages.IMonarchLanguage;
    }

    registerEditorTheme(theme: string, themeData: unknown) {
        this.setTheme(theme);
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
