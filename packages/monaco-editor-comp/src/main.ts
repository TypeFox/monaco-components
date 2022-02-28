import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, Ref, ref } from 'lit/directives/ref.js';

import { monacoStyles, MonacoWrapper, WorkerOverride } from './wrapper';

@customElement('monaco-editor-comp')
export class CodeEditor extends LitElement {

    private container: Ref<HTMLElement> = createRef();

    private monacoWrapper;

    @property({ reflect: true }) code? = '';
    @property({ reflect: true }) languageId? = 'javascript';
    @property({ reflect: true }) modifiedCode? = '';
    @property({ reflect: true }) modifiedLanguageId? = 'javascript';
    @property({ reflect: true }) theme? = 'vs-light';
    @property({ type: Boolean, reflect: true }) enableInlineConfig?= false;
    @property({ type: Boolean, reflect: true }) useDiffEditor?= false;

    constructor() {
        super();
        this.monacoWrapper = new MonacoWrapper();

        // set proper defaults based on the default editor config
        this.updateCodeEditorConfig();
    }

    static override styles = css`
        :host {
            --editor-width: 100%;
            --editor-height: 100vh;
        }
        .main {
            width: var(--editor-width);
            height: var(--editor-height);
        }
    `;

    override render() {
        return html`
        <style>${monacoStyles}</style>
        <div ${ref(this.container)} id="monacoContainer${this.id}" class="main"></div>
        `;
    }

    private updateCodeEditorConfig() {
        const config = this.monacoWrapper.getEditorConfig();
        this.code = config.codeOriginal[0];
        this.languageId = config.codeOriginal[1];
        this.modifiedCode = config.codeModified[0];
        this.modifiedLanguageId = config.codeModified[1];
        this.theme = config.monacoEditorOptions?.theme as string;
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

    firstUpdated() {
        this.startEditor();
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

    private isEnableInlineConfig() {
        const content = this.children.length === 1 ? this.children[0] : undefined;
        return content instanceof HTMLScriptElement && this.enableInlineConfig;
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
        'monaco-editor-comp': CodeEditor;
    }
}

export { WorkerOverride };
