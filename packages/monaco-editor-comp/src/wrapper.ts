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

    monacoEditorOptions: Record<string, unknown> | undefined = {
        code: '',
        languageId: 'javascript',
        theme: 'vs-light',
        readOnly: false
    };
    monacoDiffEditorOptions: Record<string, unknown> | undefined = {
        diffEditorOriginal: ['default', 'text/plain'],
        diffEditorModified: ['default', 'text/plain']
    };

}

export class MonacoWrapper {

    private editor: monaco.editor.IStandaloneCodeEditor | undefined;
    private diffEditor: monaco.editor.IStandaloneDiffEditor | undefined;

    private editorConfig: CodeEditorConfig = new CodeEditorConfig();

    getEditorConfig() {
        return this.editorConfig;
    }

    setTheme(theme: string) {
        monaco.editor.setTheme(theme);
    }

    setUseDiffEditor(useDiffEditor: boolean) {
        this.editorConfig.useDiffEditor = useDiffEditor;
    }

    updateBasicConfigItems(languageId: string | undefined, code: string | undefined, theme: string | undefined) {
        if (this.editorConfig.monacoEditorOptions) {
            if (languageId) this.editorConfig.monacoEditorOptions.languageId = languageId;
            if (code) this.editorConfig.monacoEditorOptions.code = code;
            if (theme) this.editorConfig.monacoEditorOptions.theme = theme;
        }
    }

    startEditor(container?: HTMLElement, dispatchEvent?: (event: Event) => boolean) {
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

        const languageId = this.editorConfig.monacoEditorOptions ? this.editorConfig.monacoEditorOptions.languageId as string : undefined;
        const currentModel = this.editor?.getModel();
        if (languageId && currentModel && currentModel.getLanguageId() !== languageId) {
            monaco.editor.setModelLanguage(currentModel, languageId);
        }

        const code = this.editorConfig.monacoEditorOptions ? this.editorConfig.monacoEditorOptions.code as string: undefined;
        if (code) this.editor?.setValue(code);
    }

    private updateDiffEditor() {
        const options = this.editorConfig.monacoDiffEditorOptions as monaco.editor.IDiffEditorOptions;
        this.diffEditor?.updateOptions(options);
        this.updateDiffModels();
    }

    private updateDiffModels() {
        if (this.editorConfig.monacoDiffEditorOptions) {
            const diffEditorOriginal = this.editorConfig.monacoDiffEditorOptions.diffEditorOriginal as [string, string];
            const diffEditorModified = this.editorConfig.monacoDiffEditorOptions.diffEditorModified as [string, string];

            const originalModel = monaco.editor.createModel(diffEditorOriginal[0], diffEditorOriginal[1]);
            const modifiedModel = monaco.editor.createModel(diffEditorModified[0], diffEditorModified[1]);

            this.diffEditor?.setModel({
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

export { monacoStyles };
