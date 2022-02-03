import * as monaco from 'monaco-editor';

import monacoStyles from 'monaco-editor/min/vs/editor/editor.main.css';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker&inline';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

import { CodeEditorConfig, MonacoWrapperDef } from 'moned-base';

export class WorkerOverride {

    // static worker load override functions
    static getEditorWorker() {
        return new editorWorker();
    }

    static getTsWorker() {
        return new tsWorker();
    }

    static getHtmlWorker() {
        return new htmlWorker();
    }

    static getCssWorker() {
        return new cssWorker();
    }

    static getJsonWorker() {
        return new jsonWorker();
    }

}

export class MonacoWrapper implements MonacoWrapperDef {

    private editor?: monaco.editor.IStandaloneCodeEditor;
    private editorConfig: CodeEditorConfig;

    constructor(editorConfig: CodeEditorConfig) {
        this.editorConfig = editorConfig;
    }

    updateEditorConfig(editorConfig: CodeEditorConfig) {
        this.editorConfig = editorConfig;
    }

    startEditor(container?: HTMLElement, dispatchEvent?: (event: Event) => boolean) {
        this.defineMonacoEnvironment();
        this.editor = monaco.editor.create(container!, { language: this.editorConfig.languageId });
        this.updateEditor();

        this.editor.getModel()!.onDidChangeContent(() => {
            if (dispatchEvent) {
                dispatchEvent(new CustomEvent('ChangeContent', { detail: {} }));
            }
        });
    }

    updateEditor() {
        // configure options
        this.editor?.updateOptions({
            readOnly: this.editorConfig.readOnly,
        });
        this.editor?.setValue(this.editorConfig.code);
        this.setTheme(this.editorConfig.theme);

        const currentModel = this.editor?.getModel();
        if (currentModel && currentModel.getLanguageId() !== this.editorConfig.languageId) {
            monaco.editor.setModelLanguage(currentModel, this.editorConfig.languageId);
        }
    }

    setTheme(theme: string) {
        monaco.editor.setTheme(theme);
    }

    defineMonacoEnvironment() {
        const getWorker = (_: string, label: string) => {
            console.log('getWorker: workerId: ' + _ + ' label: ' + label);

            if (label === 'typescript' || label === 'javascript') {
                return WorkerOverride.getTsWorker();
            }
            if (label === 'html' || label === 'handlebars' || label === 'razor') {
                return WorkerOverride.getHtmlWorker();
            }
            if (label === 'css' || label === 'scss' || label === 'less') {
                return WorkerOverride.getCssWorker();
            }
            if (label === 'json') {
                return WorkerOverride.getJsonWorker();
            }
            return WorkerOverride.getEditorWorker();
        };

        const monWin = (self as monaco.Window);
        if (monWin) {
            if (!monWin.MonacoEnvironment) {
                monWin.MonacoEnvironment = {
                    getWorker: getWorker
                };
            }
            else {
                monWin.MonacoEnvironment.getWorker = getWorker;
            }
        }
    }

}

export { monacoStyles };
