import * as monaco from 'monaco-editor';

import styles from 'monaco-editor/min/vs/editor/editor.main.css';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

function baseWorkerDefinition(_basePath: string, monWin: monaco.Window) {
    if (!monWin) return;

    monWin.MonacoEnvironment = {
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
}

import { CodeEditorConfig, MonacoWrapperDef } from 'moned-base';

export class MonacoWrapper implements MonacoWrapperDef {

    private monWin: monaco.Window;

    private editor?: monaco.editor.IStandaloneCodeEditor;

    private editorConfig: CodeEditorConfig;

    constructor(editorConfig: CodeEditorConfig) {
        this.monWin = self as monaco.Window;
        this.editorConfig = editorConfig;
        this.redefineWorkers('', baseWorkerDefinition);
    }

    redefineWorkers(basePath: string, workerDefinitionFunc: (basePath: string, monWin: monaco.Window) => void) {
        workerDefinitionFunc(basePath, this.monWin);
    }

    updateEditorConfig(editorConfig: CodeEditorConfig) {
        this.editorConfig = editorConfig;
    }

    startEditor(container?: HTMLElement, dispatchEvent?: (event: Event) => boolean) {
        this.editor = monaco.editor.create(container!);
        //this.updateEditor();

        this.editor.getModel()!.onDidChangeContent(() => {
            if (dispatchEvent) {
                dispatchEvent(new CustomEvent('ChangeContent', { detail: {} }));
            }
        });
    }

    updateEditor() {
        const options = this.editorConfig.buildEditorConf();
        this.editor?.updateOptions(options as monaco.editor.IStandaloneEditorConstructionOptions);

        const currentModel = this.editor?.getModel();
        if (currentModel && currentModel.getLanguageId() !== this.editorConfig.languageId) {
            monaco.editor.setModelLanguage(currentModel, this.editorConfig.languageId);
        }
        this.editor?.setValue(this.editorConfig.code);
    }

    setTheme(theme: string) {
        monaco.editor.setTheme(theme);
    }

}

export { styles, baseWorkerDefinition };
