import 'monaco-editor/esm/vs/editor/editor.all.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js';
import { editor, Uri } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { createConfiguredEditor, createConfiguredDiffEditor, createModelReference, ITextFileEditorModel } from 'vscode/monaco';
import { IReference } from 'vscode/service-override/editor';
import { ModelUpdate, UserConfig, WrapperConfig } from './wrapper.js';

export type VscodeUserConfiguration = {
    json?: string;
}

export type EditorAppConfig = {
    languageId: string;
    code: string;
    codeUri?: string;
    useDiffEditor: boolean;
    codeOriginal?: string;
    codeOriginalUri?: string;
}

export type EditorAppType = 'vscodeApi' | 'classic';

export abstract class EditorAppBase {

    private id: string;
    protected appConfig: EditorAppConfig;

    protected editor: editor.IStandaloneCodeEditor | undefined;
    protected diffEditor: editor.IStandaloneDiffEditor | undefined;

    protected editorOptions: editor.IStandaloneEditorConstructionOptions;
    protected diffEditorOptions: editor.IStandaloneDiffEditorConstructionOptions;

    private modelRef: IReference<ITextFileEditorModel> | undefined;
    private modelOriginalRef: IReference<ITextFileEditorModel> | undefined;

    constructor(id: string, userConfig: UserConfig) {
        this.id = id;
        console.log(`Starting monaco-editor (${this.id})`);

        const userAppConfig = userConfig.wrapperConfig.editorAppConfig;
        this.appConfig = {
            languageId: userAppConfig.languageId,
            code: userAppConfig.code ?? '',
            codeOriginal: userAppConfig.codeOriginal ?? '',
            useDiffEditor: userAppConfig.useDiffEditor === true,
            codeUri: userAppConfig.codeUri ?? undefined,
            codeOriginalUri: userAppConfig.codeOriginalUri ?? undefined,
        };
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

    async createEditors(container: HTMLElement): Promise<void> {
        if (this.appConfig.useDiffEditor) {
            this.diffEditor = createConfiguredDiffEditor(container!, this.diffEditorOptions);
            await this.updateDiffEditorModel();
        } else {
            this.editor = createConfiguredEditor(container!, this.editorOptions);
            await this.updateEditorModel();
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
        if (this.appConfig.useDiffEditor) {
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
        await this.updateEditorModel();
    }

    private async updateEditorModel(): Promise<void> {
        this.modelRef?.dispose();

        const uri: Uri = this.getEditorUri('code');
        this.modelRef = await createModelReference(uri, this.appConfig.code) as unknown as IReference<ITextFileEditorModel>;
        this.modelRef.object.setLanguageId(this.appConfig.languageId);
        if (this.editor) {
            this.editor.setModel(this.modelRef.object.textEditorModel);
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
        promises.push(createModelReference(uri, this.appConfig.code));
        promises.push(createModelReference(uriOriginal, this.appConfig.codeOriginal));

        const refs = await Promise.all(promises);
        this.modelRef = refs[0] as unknown as IReference<ITextFileEditorModel>;
        this.modelRef.object.setLanguageId(this.appConfig.languageId);
        this.modelOriginalRef = refs[1] as unknown as IReference<ITextFileEditorModel>;
        this.modelOriginalRef.object.setLanguageId(this.appConfig.languageId);

        if (this.diffEditor && this.modelRef.object.textEditorModel !== null && this.modelOriginalRef.object.textEditorModel !== null) {
            this.diffEditor?.setModel({
                original: this.modelOriginalRef!.object!.textEditorModel,
                modified: this.modelRef!.object!.textEditorModel
            });
        }
    }

    private updateEditorConfig(modelUpdate: ModelUpdate) {
        if (modelUpdate.code !== undefined) {
            this.appConfig.code = modelUpdate.code;
        }

        if (modelUpdate.languageId !== undefined) {
            this.appConfig.languageId = modelUpdate.languageId;
        }

        if (modelUpdate.uri !== undefined) {
            this.appConfig.codeUri = modelUpdate.uri;
        }

        if (modelUpdate.codeOriginal !== undefined) {
            this.appConfig.codeOriginal = modelUpdate.codeOriginal;
        }

        if (modelUpdate.codeOriginalUri !== undefined) {
            this.appConfig.codeOriginalUri = modelUpdate.codeOriginalUri;
        }
    }

    getEditorUri(uriType: 'code' | 'codeOriginal') {
        const uri = uriType === 'code' ? this.appConfig.codeUri : this.appConfig.codeOriginalUri;
        if (uri) {
            return Uri.parse(uri);
        } else {
            return Uri.parse(`/tmp/model${uriType === 'codeOriginal' ? 'Original' : ''}${this.id}.${this.appConfig.languageId}`);
        }
    }

    updateLayout() {
        if (this.appConfig.useDiffEditor) {
            this.diffEditor?.layout();
        } else {
            this.editor?.layout();
        }
    }

    abstract getAppType(): string;
    abstract init(): Promise<void>;
    abstract updateConfig(options: editor.IEditorOptions & editor.IGlobalEditorOptions | VscodeUserConfiguration): void;
    abstract getAppConfig(): EditorAppConfig;
}

export const isVscodeApiEditorApp = (wrapperConfig: WrapperConfig) => {
    return wrapperConfig.editorAppConfig?.editorAppType === 'vscodeApi';
};
