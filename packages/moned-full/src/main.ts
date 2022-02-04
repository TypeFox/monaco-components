import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, Ref, ref } from 'lit/directives/ref.js';

import { CodeEditor, CodeEditorConfig, DefaultCodeEditorConfig } from '../../moned-base/src/base';
import { monacoStyles, MonacoWrapper, WorkerOverride } from './wrapper';

export interface CodeEditorFull extends CodeEditor {

    updateCodeEditorConfig(codeEditorConfig: CodeEditorConfig | undefined | null): void;

}

@customElement('moned-full')
export class CodeEditorFullImpl extends LitElement implements CodeEditorFull {

    private container: Ref<HTMLElement> = createRef();
    private editorConfig: CodeEditorConfig;

    private monacoWrapper;

    @property({ reflect: true }) languageId?;
    @property({ reflect: true }) code?;
    @property({ reflect: true }) theme?;
    @property({ type: Boolean, reflect: true }) readOnly?;

    constructor() {
        super();
        this.editorConfig = new DefaultCodeEditorConfig();

        // set proper defaults based on the default editor config
        this.languageId = this.editorConfig.languageId;
        this.code = this.editorConfig.code;
        this.theme = this.editorConfig.theme;
        this.readOnly = this.editorConfig.readOnly;

        this.monacoWrapper = new MonacoWrapper(this.editorConfig);
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
        <main ${ref(this.container)}></main>
        `;
    }

    getCodeEditorType(): string {
        return 'CodeEditorFull';
    }

    updateCodeEditorConfig(codeEditorConfig: CodeEditorConfig | undefined | null) {
        if (codeEditorConfig) {
            this.editorConfig = codeEditorConfig;
            this.languageId = this.editorConfig.languageId;
            this.code = this.editorConfig.code;
            this.theme = this.editorConfig.theme;
            this.readOnly = this.editorConfig.readOnly;
        }
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
        this.editorConfig.readOnly = this.readOnly === true;
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
        'moned-full': CodeEditorFullImpl;
    }
}

export { WorkerOverride };
