import { editor, Uri } from 'monaco-editor';
import { createConfiguredEditor, createConfiguredDiffEditor, createModelReference, ITextFileEditorModel } from 'vscode/monaco';
import { IReference } from 'vscode/service-override/editor';
import { ModelUpdate, UserConfig, WrapperConfig } from './wrapper.js';
import { EditorAppConfigClassic } from './editorAppClassic.js';
import { EditorAppConfigVscodeApi } from './editorAppVscodeApi.js';

export type VscodeUserConfiguration = {
    json?: string;
}

export type EditorAppBaseConfig = {
    languageId: string;
    code: string;
    codeUri?: string;
    useDiffEditor: boolean;
    codeOriginal?: string;
    codeOriginalUri?: string;
    domReadOnly?: boolean;
    readOnly?: boolean;
}

export type EditorAppType = 'vscodeApi' | 'classic';

/**
 * This is the base class for both Monaco Ediotor Apps:
 * - EditorAppClassic
 * - EditorAppVscodeApi
 *
 * It provides the generic functionality for both implementations.
 */
export abstract class EditorAppBase {

    private id: string;

    private editor: editor.IStandaloneCodeEditor | undefined;
    private diffEditor: editor.IStandaloneDiffEditor | undefined;

    private modelRef: IReference<ITextFileEditorModel> | undefined;
    private modelOriginalRef: IReference<ITextFileEditorModel> | undefined;

    constructor(id: string) {
        this.id = id;
    }

    protected buildConfig(userConfig: UserConfig) {
        const userAppConfig = userConfig.wrapperConfig.editorAppConfig;
        return {
            languageId: userAppConfig.languageId,
            code: userAppConfig.code ?? '',
            codeOriginal: userAppConfig.codeOriginal ?? '',
            useDiffEditor: userAppConfig.useDiffEditor === true,
            codeUri: userAppConfig.codeUri ?? undefined,
            codeOriginalUri: userAppConfig.codeOriginalUri ?? undefined,
            readOnly: userAppConfig.readOnly ?? false,
            domReadOnly: userAppConfig.domReadOnly ?? false,
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

    protected async createEditor(container: HTMLElement, editorOptions?: editor.IStandaloneEditorConstructionOptions): Promise<void> {
        this.editor = createConfiguredEditor(container!, editorOptions);
        await this.updateEditorModel();
    }

    protected async createDiffEditor(container: HTMLElement, diffEditorOptions?: editor.IStandaloneDiffEditorConstructionOptions): Promise<void> {
        this.diffEditor = createConfiguredDiffEditor(container!, diffEditorOptions);
        await this.updateDiffEditorModel();
    }

    protected disposeEditor() {
        if (this.editor) {
            this.modelRef?.dispose();
            this.editor.dispose();
            this.editor = undefined;
        }
    }

    protected disposeDiffEditor() {
        if (this.diffEditor) {
            this.modelRef?.dispose();
            this.modelOriginalRef?.dispose();
            this.diffEditor.dispose();
            this.diffEditor = undefined;
        }
    }

    getModel(original?: boolean): editor.ITextModel | undefined {
        if (this.getConfig().useDiffEditor) {
            return ((original === true) ? this.modelOriginalRef?.object.textEditorModel : this.modelRef?.object.textEditorModel) ?? undefined;
        } else {
            return this.modelRef?.object.textEditorModel ?? undefined;
        }
    }

    async updateModel(modelUpdate: ModelUpdate): Promise<void> {
        if (!this.editor) {
            return Promise.reject(new Error('You cannot update the editor model, because the regular editor is not configured.'));
        }

        this.updateAppConfig(modelUpdate);
        await this.updateEditorModel();
    }

    private async updateEditorModel(): Promise<void> {
        const config = this.getConfig();
        this.modelRef?.dispose();

        const uri: Uri = this.getEditorUri('code');
        this.modelRef = await createModelReference(uri, config.code) as unknown as IReference<ITextFileEditorModel>;
        this.modelRef.object.setLanguageId(config.languageId);
        if (this.editor) {
            this.editor.setModel(this.modelRef.object.textEditorModel);
        }
    }

    async updateDiffModel(modelUpdate: ModelUpdate): Promise<void> {
        if (!this.diffEditor) {
            return Promise.reject(new Error('You cannot update the diff editor models, because the diffEditor is not configured.'));
        }

        this.updateAppConfig(modelUpdate);
        return this.updateDiffEditorModel();
    }

    private async updateDiffEditorModel(): Promise<void> {
        const config = this.getConfig();
        this.modelRef?.dispose();
        this.modelOriginalRef?.dispose();

        const uri: Uri = this.getEditorUri('code');
        const uriOriginal: Uri = this.getEditorUri('codeOriginal');

        const promises = [];
        promises.push(createModelReference(uri, config.code));
        promises.push(createModelReference(uriOriginal, config.codeOriginal));

        const refs = await Promise.all(promises);
        this.modelRef = refs[0] as unknown as IReference<ITextFileEditorModel>;
        this.modelRef.object.setLanguageId(config.languageId);
        this.modelOriginalRef = refs[1] as unknown as IReference<ITextFileEditorModel>;
        this.modelOriginalRef.object.setLanguageId(config.languageId);

        if (this.diffEditor && this.modelRef.object.textEditorModel !== null && this.modelOriginalRef.object.textEditorModel !== null) {
            this.diffEditor?.setModel({
                original: this.modelOriginalRef!.object!.textEditorModel,
                modified: this.modelRef!.object!.textEditorModel
            });
        }
    }

    private updateAppConfig(modelUpdate: ModelUpdate) {
        const config = this.getConfig();
        if (modelUpdate.code !== undefined) {
            config.code = modelUpdate.code;
        }

        if (modelUpdate.languageId !== undefined) {
            config.languageId = modelUpdate.languageId;
        }

        if (modelUpdate.uri !== undefined) {
            config.codeUri = modelUpdate.uri;
        }

        if (modelUpdate.codeOriginal !== undefined) {
            config.codeOriginal = modelUpdate.codeOriginal;
        }

        if (modelUpdate.codeOriginalUri !== undefined) {
            config.codeOriginalUri = modelUpdate.codeOriginalUri;
        }
    }

    getEditorUri(uriType: 'code' | 'codeOriginal') {
        const config = this.getConfig();
        const uri = uriType === 'code' ? config.codeUri : config.codeOriginalUri;
        if (uri) {
            return Uri.parse(uri);
        } else {
            return Uri.parse(`/tmp/model${uriType === 'codeOriginal' ? 'Original' : ''}${this.id}.${config.languageId}`);
        }
    }

    updateLayout() {
        if (this.getConfig().useDiffEditor) {
            this.diffEditor?.layout();
        } else {
            this.editor?.layout();
        }
    }

    updateMonacoEditorOptions(options: editor.IEditorOptions & editor.IGlobalEditorOptions) {
        this.editor?.updateOptions(options);
    }

    abstract getAppType(): string;
    abstract init(): Promise<void>;
    abstract createEditors(container: HTMLElement): Promise<void>;
    abstract updateEditorOptions(options: editor.IEditorOptions & editor.IGlobalEditorOptions | VscodeUserConfiguration): void;
    abstract getConfig(): EditorAppConfigClassic | EditorAppConfigVscodeApi;
    abstract disposeApp(): void;
}

export const isVscodeApiEditorApp = (wrapperConfig: WrapperConfig) => {
    return wrapperConfig.editorAppConfig?.$type === 'vscodeApi';
};
