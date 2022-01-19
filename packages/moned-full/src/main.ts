import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, Ref, ref } from 'lit/directives/ref.js';

// -- Monaco Editor Imports --
import * as monaco from 'monaco-editor';

import styles from 'monaco-editor/min/vs/editor/editor.main.css';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

(self as monaco.Window).MonacoEnvironment = {

    getWorker: (label: string) => {
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

import { CodeEditorFull, CodeEditorFullType, CodeEditorConfig, DefaultCodeEditorConfig } from 'moned-base';

@customElement('moned-full')
export class CodeEditorFullImpl extends LitElement implements CodeEditorFull {

    private container: Ref<HTMLElement> = createRef();
    private editorConfig: CodeEditorConfig = new DefaultCodeEditorConfig();

    editor?: monaco.editor.IStandaloneCodeEditor;

    @property({ type: String }) language?: string;
    @property() code?: string;
    @property() theme?: string;
    @property({ type: Boolean, attribute: 'readOnly' }) readOnly?: boolean;

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

    getCodeEditorType(): CodeEditorFullType {
        return 'CodeEditorFull';
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
        this.editor.getModel()!.onDidChangeContent(() => {
            this.dispatchEvent(new CustomEvent('change', { detail: {} }));
        });
        this.registerListeners();
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
