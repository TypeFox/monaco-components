import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, Ref, ref } from 'lit/directives/ref.js';

import { monacoStyles, MonacoWrapper, WorkerOverride } from './wrapper';

@customElement('monaco-editor-comp')
export class CodeEditor extends LitElement {

    private container: Ref<HTMLElement> = createRef();

    private monacoWrapper;

    @property({ reflect: true }) languageId? = 'javascript';
    @property({ reflect: true }) code? = '';
    @property({ reflect: true }) theme? = 'vs-light';
    @property({ type: Boolean, reflect: true }) enableInlineConfig? = false;
    @property({ type: Boolean, reflect: true }) useDiffEditor? = false;

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

    updateCodeEditorConfig() {
        const config = this.monacoWrapper.getEditorConfig();
        this.languageId = config.monacoEditorOptions?.languageId as string;
        this.code = config.monacoEditorOptions?.code as string;
        this.theme = config.monacoEditorOptions?.theme as string;
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

    firstUpdated() {
        this.startEditor();
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
        if (this.enableInlineConfig) {
            this.retrieveMoncaoEditorOptions();
            this.retrieveMoncaoDiffEditorOptions();
            this.monacoWrapper.setUseDiffEditor(this.useDiffEditor || false);
        }
    }

    private retrieveMoncaoEditorOptions() {
        if (!this.isEnableInlineConfig()) return;

        const winRec = window as unknown as Record<string, unknown>;
        if (Object.prototype.hasOwnProperty.call(winRec, 'getMonacoEditorOptions') && typeof winRec.getMonacoEditorOptions === 'function') {
            this.monacoWrapper.getEditorConfig().monacoEditorOptions = winRec.getMonacoEditorOptions();
            console.log('Using config supplied by getMonacoEditorOptions for editor.');
        }
    }

    private retrieveMoncaoDiffEditorOptions() {
        if (!this.isEnableInlineConfig()) return;

        const winRec = window as unknown as Record<string, unknown>;
        if (Object.prototype.hasOwnProperty.call(winRec, 'getMonacoDiffEditorOptions') && typeof winRec.getMonacoDiffEditorOptions === 'function') {
            this.monacoWrapper.getEditorConfig().monacoDiffEditorOptions = winRec.getMonacoDiffEditorOptions();
            console.log('Using config supplied by getMonacoDiffEditorOptions for diff editor.');
        }
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
