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

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker&inline';

export class WorkerOverride {

    // static worker load override functions
    static getEditorWorker() {
        return new editorWorker();
    }

    // generate empty instructions as default

    static getTsWorker() {
        // use this in vite 2.8.x: new URL('../../../node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url)
        return new Worker('ts.worker.js', { type: 'module' });
    }

    static getHtmlWorker() {
        return new Worker('html.worker.js', { type: 'module' });
    }

    static getCssWorker() {
        return new Worker('css.worker.js', { type: 'module' });
    }

    static getJsonWorker() {
        return new Worker('json.worker.js', { type: 'module' });
    }

}

export class CodeEditorConfig {

    useDiffEditor = false;
    codeOriginal: [string, string] = ['', 'javascript'];
    codeModified: [string, string] = ['', 'javascript'];
    theme = 'vs-light';
    monacoEditorOptions: Record<string, unknown> = {
        readOnly: false
    };
    monacoDiffEditorOptions: Record<string, unknown> = {
        readOnly: false
    };
}

export class MonacoWrapper {

    private editor: monaco.editor.IStandaloneCodeEditor | undefined;
    private diffEditor: monaco.editor.IStandaloneDiffEditor | undefined;
    private editorConfig: CodeEditorConfig = new CodeEditorConfig();

    private id: string;

    constructor(id: string) {
        this.id = id;
    }

    getEditorConfig() {
        return this.editorConfig;
    }

    updateTheme() {
        monaco.editor.setTheme(this.editorConfig.theme);
    }

    setUseDiffEditor(useDiffEditor: boolean) {
        this.editorConfig.useDiffEditor = useDiffEditor;
    }

    startEditor(container?: HTMLElement, dispatchEvent?: (event: Event) => boolean) {
        console.log(`Starting monaco-editor (${this.id})`);

        // register Worker function
        this.defineMonacoEnvironment();

        if (this.editorConfig.useDiffEditor) {
            this.diffEditor = monaco.editor.createDiffEditor(container!);
        }
        else {
            this.editor = monaco.editor.create(container!);
            this.editor.getModel()!.onDidChangeContent(() => {
                if (dispatchEvent) {
                    dispatchEvent(new CustomEvent('ChangeContent', { detail: {} }));
                }
            });
        }
        this.updateEditor();
    }

    swapEditors(container?: HTMLElement, dispatchEvent?: (event: Event) => boolean): void {
        if (this.editorConfig.useDiffEditor) {
            if (this.editor) {
                this.editor?.dispose();
            }
            if (!this.diffEditor) {
                this.startEditor(container, dispatchEvent);
            }
        }
        else {
            if (this.diffEditor) {
                this.diffEditor?.dispose();
            }
            if (!this.editor) {
                this.startEditor(container, dispatchEvent);
            }
        }
    }

    updateEditor() {
        if (this.editorConfig.useDiffEditor) {
            this.updateDiffEditor();
        }
        else {
            this.updateMainEditor();
        }
    }

    private updateMainEditor() {
        const options = this.editorConfig.monacoEditorOptions as monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions;
        this.editor?.updateOptions(options);
        this.updateTheme();

        const languageId = this.editorConfig.codeOriginal[1];
        const currentModel = this.editor?.getModel();
        if (languageId && currentModel && currentModel.getLanguageId() !== languageId) {
            monaco.editor.setModelLanguage(currentModel, languageId);
        }

        if (this.editorConfig.codeOriginal[0]) this.editor?.setValue(this.editorConfig.codeOriginal[0]);
    }

    private updateDiffEditor() {
        const options = this.editorConfig.monacoDiffEditorOptions as monaco.editor.IDiffEditorOptions & monaco.editor.IGlobalEditorOptions;
        this.diffEditor?.updateOptions(options);
        this.updateTheme();

        this.updateDiffModels();
    }

    private updateDiffModels() {
        if (this.diffEditor) {
            const originalModel = monaco.editor.createModel(this.editorConfig.codeOriginal[0], this.editorConfig.codeOriginal[1]);
            const modifiedModel = monaco.editor.createModel(this.editorConfig.codeModified[0], this.editorConfig.codeModified[1]);

            this.diffEditor.setModel({
                original: originalModel,
                modified: modifiedModel
            });
        }
    }

    private defineMonacoEnvironment() {
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

export { monaco, monacoStyles };
