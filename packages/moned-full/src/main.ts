import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, Ref, ref } from 'lit/directives/ref.js';

import * as monaco from 'monaco-editor';

import styles from 'monaco-editor/min/vs/editor/editor.main.css';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

(self as monaco.Window).MonacoEnvironment = {

    getWorker: (_: string, label: string) => {
        if (label === 'json') {
            return new jsonWorker();
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return new cssWorker();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new htmlWorker();
        }
        if (label === 'typescript' || label === 'javascript') {
            return new tsWorker();
        }
        return new editorWorker();
    },
};

import { CodeEditor, CodeEditorConfig, DefaultCodeEditorConfig } from 'moned-base';

export interface CodeEditorFull extends CodeEditor {

    updateCodeEditorConfig(codeEditorConfig: CodeEditorConfig | undefined | null): void;

}

@customElement('moned-full')
export class CodeEditorFullImpl extends LitElement implements CodeEditorFull {

    private container: Ref<HTMLElement> = createRef();
    private editorConfig: CodeEditorConfig;

    private editor?: monaco.editor.IStandaloneCodeEditor;

    @property() languageId?;
    @property() code?;
    @property() theme?;
    @property({ type: Boolean }) readOnly?;

    constructor() {
        super();
        this.editorConfig = new DefaultCodeEditorConfig();

        // set proper defaults based on the default editor config
        this.languageId = this.editorConfig.languageId;
        this.code = this.editorConfig.code;
        this.theme = this.editorConfig.theme;
        this.readOnly = this.editorConfig.readOnly;
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
    }

    startEditor() {
        this.editor = monaco.editor.create(this.container.value!);
        this.updateEditor();

        this.editor.getModel()!.onDidChangeContent(() => {
            this.dispatchEvent(new CustomEvent('ChangeContent', { detail: {} }));
        });

        this.registerListeners();
    }

    updateEditor() {
        const options = this.editorConfig.buildEditorConf() as monaco.editor.IStandaloneEditorConstructionOptions;
        this.editor?.updateOptions(options);

        const currentModel = this.editor?.getModel();
        if (currentModel) {
            monaco.editor.setModelLanguage(currentModel, this.editorConfig.languageId);
            this.editor?.setValue(this.editorConfig.code);
        }
    }

    firstUpdated() {
        this.syncPropertiesAndEditorConfig();

        this.startEditor();
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
        'moned-full': CodeEditorFullImpl;
    }
}
