import { editor, Uri } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { createConfiguredEditor, createConfiguredDiffEditor, createModelReference, ITextFileEditorModel } from 'vscode/monaco';
import { IReference } from 'vscode/service-override/modelEditor';
import { EditorConfig, UserConfig } from './wrapper.js';
import { EditorVscodeApiConfig } from './editorVscodeApi.js';
import { EditorClassicConfig } from './editorClassic.js';

export class MonacoEditorBase {

    private id: string;
    protected editorConfig: EditorConfig;
    protected monacoConfig: EditorVscodeApiConfig | EditorClassicConfig;

    protected editor: editor.IStandaloneCodeEditor | undefined;
    protected diffEditor: editor.IStandaloneDiffEditor | undefined;

    private editorOptions: editor.IStandaloneEditorConstructionOptions;
    private diffEditorOptions: editor.IStandaloneDiffEditorConstructionOptions;

    private modelRef: IReference<ITextFileEditorModel> | undefined;
    private modelOriginalRef: IReference<ITextFileEditorModel> | undefined;

    constructor(id: string, userConfig: UserConfig) {
        this.id = id;
        console.log(`Starting monaco-editor (${this.id})`);

        this.editorConfig = {
            languageId: userConfig.editorConfig.languageId,
            code: userConfig.editorConfig.code ?? '',
            codeOriginal: userConfig.editorConfig.codeOriginal ?? '',
            useDiffEditor: userConfig.editorConfig.useDiffEditor === true,
            theme: userConfig.editorConfig.theme ?? 'vs-light',
            automaticLayout: userConfig.editorConfig.automaticLayout ?? true,
        };

        if (userConfig.wrapperConfig.useVscodeConfig) {
            this.monacoConfig = userConfig.wrapperConfig.monacoVscodeApiConfig ?? {};
        } else {
            this.monacoConfig = userConfig.wrapperConfig.monacoEditorConfig ?? {};
        }

        this.editorOptions = this.editorConfig.editorOptions ?? {};
        this.editorOptions.automaticLayout = this.editorConfig.automaticLayout;

        this.diffEditorOptions = this.editorConfig.diffEditorOptions ?? {};
        this.diffEditorOptions.automaticLayout = this.editorConfig.automaticLayout;
    }

    haveEditor() {
        return this.editor !== undefined || this.diffEditor !== undefined;
    }

    getEditor(): editor.IStandaloneCodeEditor | undefined {
        return this.editor;
    }

    getDiffEditor(): editor.IStandaloneDiffEditor | undefined {
        return this.diffEditor;
    }

    getEditorConfig() {
        return this.editorConfig;
    }

    async createEditors(container: HTMLElement): Promise<void> {
        if (this.editorConfig.useDiffEditor) {
            this.diffEditor = createConfiguredDiffEditor(container!, this.editorConfig.diffEditorOptions);
            await this.updateDiffEditorModel();
        } else {
            await this.updateEditorModel(false);
            this.editor = createConfiguredEditor(container!, this.editorOptions);
        }
    }

    disposeEditor() {
        if (this.editor) {
            this.modelRef?.dispose();
            this.editor.dispose();
            this.editor = undefined;
        }
    }

    disposeDiffEditor() {
        if (this.diffEditor) {
            this.modelRef?.dispose();
            this.modelOriginalRef?.dispose();
            this.diffEditor.dispose();
            this.diffEditor = undefined;
        }
    }

    getModel(original?: boolean): editor.ITextModel | undefined {
        if (this.editorConfig.useDiffEditor) {
            return ((original === true) ? this.modelOriginalRef?.object.textEditorModel : this.modelRef?.object.textEditorModel) ?? undefined;
        } else {
            return this.modelRef?.object.textEditorModel ?? undefined;
        }
    }

    async updateModel(modelUpdate: {
        languageId: string;
        code: string;
    }): Promise<void> {
        if (!this.editor) {
            return Promise.reject(new Error('You cannot update the editor model, because the regular editor is not configured.'));
        }
        this.editorConfig.languageId = modelUpdate.languageId;
        this.editorConfig.code = modelUpdate.code;
        await this.updateEditorModel(true);
    }

    private async updateEditorModel(updateEditor: boolean): Promise<void> {
        this.modelRef?.dispose();

        const uri = Uri.parse(`/tmp/model${this.id}.${this.editorConfig.languageId}`);
        this.modelRef = await createModelReference(uri, this.editorConfig.code) as unknown as IReference<ITextFileEditorModel>;
        this.modelRef.object.setLanguageId(this.editorConfig.languageId);
        this.editorOptions!.model = this.modelRef.object.textEditorModel;
        if (updateEditor && this.editor) {
            this.editor.setModel(this.editorOptions!.model);
        }
    }

    async updateDiffModel(modelUpdate: {
        languageId: string;
        code: string;
        codeOriginal: string;
    }): Promise<void> {
        if (!this.diffEditor) {
            return Promise.reject(new Error('You cannot update the diff editor models, because the diffEditor is not configured.'));
        }
        this.editorConfig.languageId = modelUpdate.languageId;
        this.editorConfig.code = modelUpdate.code;
        this.editorConfig.codeOriginal = modelUpdate.codeOriginal;
        return this.updateDiffEditorModel();
    }

    private async updateDiffEditorModel(): Promise<void> {
        this.modelRef?.dispose();
        this.modelOriginalRef?.dispose();

        const uri = Uri.parse(`/tmp/model${this.id}.${this.editorConfig.languageId}`);
        const uriOriginal = Uri.parse(`/tmp/modelOriginal${this.id}.${this.editorConfig.languageId}`);

        const promises = [];
        promises.push(createModelReference(uri, this.editorConfig.code));
        promises.push(createModelReference(uriOriginal, this.editorConfig.codeOriginal));

        const refs = await Promise.all(promises);
        this.modelRef = refs[0] as unknown as IReference<ITextFileEditorModel>;
        this.modelRef.object.setLanguageId(this.editorConfig.languageId);
        this.modelOriginalRef = refs[1] as unknown as IReference<ITextFileEditorModel>;
        this.modelOriginalRef.object.setLanguageId(this.editorConfig.languageId);

        if (this.diffEditor && this.modelRef.object.textEditorModel !== null && this.modelOriginalRef.object.textEditorModel !== null) {
            this.diffEditor?.setModel({
                original: this.modelOriginalRef!.object!.textEditorModel,
                modified: this.modelRef!.object!.textEditorModel
            });
        }
    }

    updateLayout() {
        if (this.editorConfig.useDiffEditor) {
            this.diffEditor?.layout();
        } else {
            this.editor?.layout();
        }
    }

}

