import * as monaco from 'monaco-editor';

import styles from 'monaco-editor/min/vs/editor/editor.main.css';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

function baseWorkerDefinition(monWin: monaco.Window) {
    console.log(monWin);
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

    console.log(monWin.MonacoEnvironment);
}

export class MonacoWrapper {

    private monWin: monaco.Window;

    private editor?: monaco.editor.IStandaloneCodeEditor;

    constructor() {
        this.monWin = self as monaco.Window;
        this.redefineWorkers(baseWorkerDefinition);
    }

    redefineWorkers(workerDefinitionFunc: (monWin: monaco.Window) => void) {
        workerDefinitionFunc(this.monWin);
    }

    startEditor(container?: HTMLElement, dispatchEvent?: (event: Event) => boolean) {
        this.editor = monaco.editor.create(container!);
        //this.updateEditor();

        this.editor.getModel()!.onDidChangeContent(() => {
            if (dispatchEvent) {
                dispatchEvent(new CustomEvent('ChangeContent', { detail: {} }));
            }
        });
        //this.registerListeners();
    }

    updateEditor(options: unknown, languageId: string, code: string) {
        //const options = this.editorConfig.buildEditorConf();
        this.editor?.updateOptions(options as monaco.editor.IStandaloneEditorConstructionOptions);

        const currentModel = this.editor?.getModel();
        if (currentModel && currentModel.getLanguageId() !== languageId) {
            monaco.editor.setModelLanguage(currentModel, languageId);
            this.editor?.setValue(code);
        }
    }

    setTheme(theme: string) {
        monaco.editor.setTheme(theme);
    }

}

export { styles, baseWorkerDefinition };
