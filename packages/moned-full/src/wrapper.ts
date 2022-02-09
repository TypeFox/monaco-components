import 'monaco-editor/esm/vs/editor/editor.all.js';

import monacoStyles from 'monaco-editor/min/vs/editor/editor.main.css';

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

//@ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker&inline';

import { CodeEditorConfig, MonacoWrapperDef } from '../../moned-base/src/base';

/*
type MonacoEvent = {
    event: monaco.editor.IEditorMouseEvent;
}

type KeyOfType<T, V> = keyof {
    [P in keyof T as T[P] extends V ? P : never]: any
}

function test<K>(key: KeyOfType<Test, (e: K) => void>, value: K) {

}
*/

export class WorkerOverride {

    // static worker load override functions
    static getEditorWorker() {
        return new editorWorker();
    }

    static getTsWorker() {
        // Vite will not transform this instruction, so defineWorkers can override in production
        return new Worker('ts.worker.js', { type: 'module' });
    }

    static getHtmlWorker() {
        // Vite will not transform this instruction, so defineWorkers can override in production
        return new Worker('html.worker.js', { type: 'module' });
    }

    static getCssWorker() {
        // Vite will not transform this instruction, so defineWorkers can override in production
        return new Worker('css.worker.js', { type: 'module' });
    }

    static getJsonWorker() {
        // Vite will not transform this instruction, so defineWorkers can override in production
        return new Worker('json.worker.js', { type: 'module' });
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
        // register Worker function
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

            switch (label) {
                case 'typescript':
                case 'javascript':
                    return WorkerOverride.getTsWorker();
                case 'html':
                case 'handlebars':
                case 'razor':
                    return WorkerOverride.getHtmlWorker();
                case 'css':
                case 'scss':
                case 'less':
                    return WorkerOverride.getCssWorker();
                case 'json':
                    return WorkerOverride.getJsonWorker();
                default:
                    return WorkerOverride.getEditorWorker();
            }
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
