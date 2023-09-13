import { editor, Uri } from 'monaco-editor';
import { createConfiguredEditor, createConfiguredDiffEditor, createModelReference, ITextFileEditorModel } from 'vscode/monaco';
import { IReference } from 'vscode/service-override/editor';
import { UserConfig, WrapperConfig } from './wrapper.js';
import { updateUserConfiguration as vscodeUpdateUserConfiguration } from 'vscode/service-override/configuration';
import { EditorAppConfigClassic } from './editorAppClassic.js';
import { EditorAppConfigVscodeApi } from './editorAppVscodeApi.js';

export type ModelUpdate = {
    languageId: string;
    code?: string;
    codeUri?: string;
    codeOriginal?: string;
    codeOriginalUri?: string;
}

export type EditorAppBaseConfig = ModelUpdate & {
    useDiffEditor: boolean;
    domReadOnly?: boolean;
    readOnly?: boolean;
    userConfiguration?: UserConfiguration;
}

export type EditorAppType = 'vscodeApi' | 'classic';

export type UserConfiguration = {
    json: string;
}

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

    protected buildConfig(userConfig: UserConfig): EditorAppBaseConfig {
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
            userConfiguration: userAppConfig.userConfiguration ?? {
                json: '{}'
            }
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

        const modelUpdateType = isModelUpdateRequired(this.getConfig(), modelUpdate);

        if (modelUpdateType === ModelUpdateType.code) {
            this.updateAppConfig(modelUpdate);
            if (this.getConfig().useDiffEditor) {
                this.diffEditor?.getModifiedEditor().setValue(modelUpdate.code ?? '');
                this.diffEditor?.getOriginalEditor().setValue(modelUpdate.codeOriginal ?? '');
            } else {
                this.editor.setValue(modelUpdate.code ?? '');
            }
        } else if (modelUpdateType === ModelUpdateType.model) {
            this.updateAppConfig(modelUpdate);
            await this.updateEditorModel();
        }
        return Promise.resolve();
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
        if (isModelUpdateRequired(this.getConfig(), modelUpdate)) {
            this.updateAppConfig(modelUpdate);
            await this.updateDiffEditorModel();
        }
        return Promise.resolve();
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
        config.languageId = modelUpdate.languageId;
        config.code = modelUpdate.code;
        config.codeUri = modelUpdate.codeUri;
        config.codeOriginal = modelUpdate.codeOriginal;
        config.codeOriginalUri = modelUpdate.codeOriginalUri;
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

    async updateUserConfiguration(config: UserConfiguration) {
        if (config.json) {
            return vscodeUpdateUserConfiguration(config.json);
        }
        return Promise.reject(new Error('Supplied config is undefined'));
    }

    abstract getAppType(): string;
    abstract init(): Promise<void>;
    abstract createEditors(container: HTMLElement): Promise<void>;
    abstract getConfig(): EditorAppConfigClassic | EditorAppConfigVscodeApi;
    abstract disposeApp(): void;
}

export const isVscodeApiEditorApp = (wrapperConfig: WrapperConfig) => {
    return wrapperConfig.editorAppConfig?.$type === 'vscodeApi';
};

export const isCodeUpdateRequired = (config: EditorAppBaseConfig, modelUpdate: ModelUpdate) => {
    let updateRequired = modelUpdate.code !== undefined && modelUpdate.code !== config.code;
    updateRequired = updateRequired || modelUpdate.codeOriginal !== config.codeOriginal;
    return updateRequired ? ModelUpdateType.code : ModelUpdateType.none;
};

export const isModelUpdateRequired = (config: EditorAppBaseConfig, modelUpdate: ModelUpdate): ModelUpdateType => {
    const codeUpdate = isCodeUpdateRequired(config, modelUpdate);
    let updateRequired = modelUpdate.languageId !== config.languageId;
    updateRequired = updateRequired || modelUpdate.codeUri !== config.codeUri;
    updateRequired = updateRequired || modelUpdate.codeOriginalUri !== config.codeOriginalUri;
    return updateRequired ? ModelUpdateType.model : codeUpdate;
};

export enum ModelUpdateType {
    none,
    code,
    model
}

export const isAppConfigDifferent = (orgConfig: EditorAppConfigClassic | EditorAppConfigVscodeApi,
    config: EditorAppConfigClassic | EditorAppConfigVscodeApi, includeModelData: boolean, includeEditorOptions: boolean): boolean => {

    // this is done by hand, ModelUpdate is only considered if flag is set
    let different = includeModelData ? isModelUpdateRequired(orgConfig, config) !== ModelUpdateType.none : false;
    if (orgConfig.$type === config.$type) {
        if (orgConfig.$type === 'classic' && config.$type === 'classic') {
            different = different || orgConfig.automaticLayout !== config.automaticLayout;
            different = different || orgConfig.domReadOnly !== config.domReadOnly;
            if (includeEditorOptions === true) {
                different = different || orgConfig.diffEditorOptions !== config.diffEditorOptions;
                different = different || orgConfig.editorOptions !== config.editorOptions;
            }
            different = different || orgConfig.languageDef !== config.languageDef;
            different = different || orgConfig.languageExtensionConfig !== config.languageExtensionConfig;
            different = different || orgConfig.readOnly !== config.readOnly;
            different = different || orgConfig.theme !== config.theme;
            different = different || orgConfig.themeData !== config.themeData;
            different = different || orgConfig.useDiffEditor !== config.useDiffEditor;
        } else if (orgConfig.$type === 'vscodeApi' && config.$type === 'vscodeApi') {
            different = different || orgConfig.domReadOnly !== config.domReadOnly;
            different = different || orgConfig.extension !== config.extension;
            different = different || orgConfig.extensionFilesOrContents !== config.extensionFilesOrContents;
            different = different || orgConfig.readOnly !== config.readOnly;
            different = different || orgConfig.useDiffEditor !== config.useDiffEditor;
            different = different || orgConfig.userConfiguration !== config.userConfiguration;
        }
    } else {
        throw new Error('Provided configurations are not of the same type.');
    }
    return different;
};
