import 'monaco-editor/esm/vs/editor/editor.all.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js';
import { editor, Uri } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { createConfiguredEditor, createConfiguredDiffEditor, createModelReference, ITextFileEditorModel } from 'vscode/monaco';
import { IReference } from 'vscode/service-override/editor';
import { EditorContentConfig, ModelUpdate, UserConfig, WrapperConfig } from './wrapper.js';
import { EditorAppConfigVscodeApi } from './editorVscodeApi.js';
import { EditorAppConfigClassic } from './editorClassic.js';

export type VscodeUserConfiguration = {
    json?: string;
}

export abstract class EditorAppBase {

    private id: string;
    protected editorContentConfig: EditorContentConfig;
    protected editorAppConfig: EditorAppConfigVscodeApi | EditorAppConfigClassic | undefined;

    protected editor: editor.IStandaloneCodeEditor | undefined;
    protected diffEditor: editor.IStandaloneDiffEditor | undefined;

    private editorOptions: editor.IStandaloneEditorConstructionOptions;
    private diffEditorOptions: editor.IStandaloneDiffEditorConstructionOptions;

    private modelRef: IReference<ITextFileEditorModel> | undefined;
    private modelOriginalRef: IReference<ITextFileEditorModel> | undefined;

    constructor(id: string, userConfig: UserConfig) {
        this.id = id;
        console.log(`Starting monaco-editor (${this.id})`);

        this.editorContentConfig = {
            languageId: userConfig.editorContentConfig.languageId,
            code: userConfig.editorContentConfig.code ?? '',
            codeOriginal: userConfig.editorContentConfig.codeOriginal ?? '',
            useDiffEditor: userConfig.editorContentConfig.useDiffEditor === true,
            theme: userConfig.editorContentConfig.theme ?? 'vs-light',
            automaticLayout: userConfig.editorContentConfig.automaticLayout ?? true,
            codeUri: userConfig.editorContentConfig.codeUri ?? undefined,
            codeOriginalUri: userConfig.editorContentConfig.codeOriginalUri ?? undefined
        };
        this.editorAppConfig = userConfig.wrapperConfig.editorAppConfig;

        this.editorOptions = userConfig.editorContentConfig.editorOptions ?? {};
        this.editorOptions.automaticLayout = userConfig.editorContentConfig.automaticLayout;

        this.diffEditorOptions = userConfig.editorContentConfig.diffEditorOptions ?? {};
        this.diffEditorOptions.automaticLayout = userConfig.editorContentConfig.automaticLayout;
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
        return this.editorContentConfig;
    }

    async createEditors(container: HTMLElement): Promise<void> {
        if (this.editorContentConfig.useDiffEditor) {
            this.diffEditor = createConfiguredDiffEditor(container!, this.editorContentConfig.diffEditorOptions);
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
        if (this.editorContentConfig.useDiffEditor) {
            return ((original === true) ? this.modelOriginalRef?.object.textEditorModel : this.modelRef?.object.textEditorModel) ?? undefined;
        } else {
            return this.modelRef?.object.textEditorModel ?? undefined;
        }
    }

    async updateModel(modelUpdate: ModelUpdate): Promise<void> {
        if (!this.editor) {
            return Promise.reject(new Error('You cannot update the editor model, because the regular editor is not configured.'));
        }

        this.updateEditorConfig(modelUpdate);
        await this.updateEditorModel(true);
    }

    private async updateEditorModel(updateEditor: boolean): Promise<void> {
        this.modelRef?.dispose();

        const uri: Uri = this.getEditorUri('code');
        this.modelRef = await createModelReference(uri, this.editorContentConfig.code) as unknown as IReference<ITextFileEditorModel>;
        this.modelRef.object.setLanguageId(this.editorContentConfig.languageId);
        this.editorOptions.model = this.modelRef.object.textEditorModel;
        if (updateEditor && this.editor) {
            this.editor.setModel(this.editorOptions.model);
        }
    }

    async updateDiffModel(modelUpdate: ModelUpdate): Promise<void> {
        if (!this.diffEditor) {
            return Promise.reject(new Error('You cannot update the diff editor models, because the diffEditor is not configured.'));
        }

        this.updateEditorConfig(modelUpdate);
        return this.updateDiffEditorModel();
    }

    private async updateDiffEditorModel(): Promise<void> {
        this.modelRef?.dispose();
        this.modelOriginalRef?.dispose();

        const uri: Uri = this.getEditorUri('code');
        const uriOriginal: Uri = this.getEditorUri('codeOriginal');

        const promises = [];
        promises.push(createModelReference(uri, this.editorContentConfig.code));
        promises.push(createModelReference(uriOriginal, this.editorContentConfig.codeOriginal));

        const refs = await Promise.all(promises);
        this.modelRef = refs[0] as unknown as IReference<ITextFileEditorModel>;
        this.modelRef.object.setLanguageId(this.editorContentConfig.languageId);
        this.modelOriginalRef = refs[1] as unknown as IReference<ITextFileEditorModel>;
        this.modelOriginalRef.object.setLanguageId(this.editorContentConfig.languageId);

        if (this.diffEditor && this.modelRef.object.textEditorModel !== null && this.modelOriginalRef.object.textEditorModel !== null) {
            this.diffEditor?.setModel({
                original: this.modelOriginalRef!.object!.textEditorModel,
                modified: this.modelRef!.object!.textEditorModel
            });
        }
    }

    private updateEditorConfig(modelUpdate: ModelUpdate) {
        if (modelUpdate.code !== undefined) {
            this.editorContentConfig.code = modelUpdate.code;
        }

        if (modelUpdate.languageId !== undefined) {
            this.editorContentConfig.languageId = modelUpdate.languageId;
        }

        if (modelUpdate.uri !== undefined) {
            this.editorContentConfig.codeUri = modelUpdate.uri;
        }

        if (modelUpdate.codeOriginal !== undefined) {
            this.editorContentConfig.codeOriginal = modelUpdate.codeOriginal;
        }

        if (modelUpdate.codeOriginalUri !== undefined) {
            this.editorContentConfig.codeOriginalUri = modelUpdate.codeOriginalUri;
        }
    }

    getEditorUri(uriType: 'code' | 'codeOriginal') {
        const uri = uriType === 'code' ? this.editorContentConfig.codeUri : this.editorContentConfig.codeOriginalUri;
        if (uri) {
            return Uri.parse(uri);
        } else {
            return Uri.parse(`/tmp/model${uriType === 'codeOriginal' ? 'Original' : ''}${this.id}.${this.editorContentConfig.languageId}`);
        }
    }

    updateLayout() {
        if (this.editorContentConfig.useDiffEditor) {
            this.diffEditor?.layout();
        } else {
            this.editor?.layout();
        }
    }

    abstract getAppType(): string;
    abstract init(): Promise<void>;
    abstract updateConfig(options: editor.IEditorOptions & editor.IGlobalEditorOptions | VscodeUserConfiguration): void;
}

export const isVscodeApiEditorApp = (wrapperConfig: WrapperConfig) => {
    return wrapperConfig.editorAppConfig?.editorAppType === 'vscodeApi';
};
