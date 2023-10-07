import { editor, Uri } from 'monaco-editor';
import { createConfiguredEditor, createConfiguredDiffEditor, createModelReference, ITextFileEditorModel } from 'vscode/monaco';
import { IReference } from '@codingame/monaco-vscode-editor-service-override';
import { updateUserConfiguration as vscodeUpdateUserConfiguration } from '@codingame/monaco-vscode-configuration-service-override';
import { WrapperConfig } from './wrapper.js';
import { EditorAppConfigClassic } from './editorAppClassic.js';
import { EditorAppConfigExtended } from './editorAppExtended.js';

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
    awaitExtensionReadiness?: Array<() => Promise<void>>;
}

export type EditorAppType = 'extended' | 'classic';

/**
 * This is the base class for both Monaco Ediotor Apps:
 * - EditorAppClassic
 * - EditorAppExtended
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

    protected buildConfig(userAppConfig: EditorAppConfigExtended | EditorAppConfigClassic): EditorAppBaseConfig {
        return {
            languageId: userAppConfig.languageId,
            code: userAppConfig.code ?? '',
            codeOriginal: userAppConfig.codeOriginal ?? '',
            useDiffEditor: userAppConfig.useDiffEditor === true,
            codeUri: userAppConfig.codeUri ?? undefined,
            codeOriginalUri: userAppConfig.codeOriginalUri ?? undefined,
            readOnly: userAppConfig.readOnly ?? false,
            domReadOnly: userAppConfig.domReadOnly ?? false,
            awaitExtensionReadiness: userAppConfig.awaitExtensionReadiness ?? undefined
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
        this.editor = createConfiguredEditor(container, editorOptions);
        await this.updateEditorModel();
    }

    protected async createDiffEditor(container: HTMLElement, diffEditorOptions?: editor.IStandaloneDiffEditorConstructionOptions): Promise<void> {
        this.diffEditor = createConfiguredDiffEditor(container, diffEditorOptions);
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
            return Uri.parse(`/workspace/model${uriType === 'codeOriginal' ? 'Original' : ''}${this.id}.${config.languageId}`);
        }
    }

    updateLayout() {
        if (this.getConfig().useDiffEditor) {
            this.diffEditor?.layout();
        } else {
            this.editor?.layout();
        }
    }

    async awaitReadiness(awaitExtensionReadiness?: Array<() => Promise<void>>) {
        if (awaitExtensionReadiness) {
            const allPromises: Array<Promise<void>> = [];
            for (const awaitReadiness of awaitExtensionReadiness) {
                allPromises.push(awaitReadiness());
            }
            return Promise.all(allPromises);
        }
        return Promise.resolve();
    }

    protected async updateUserConfiguration(json?: string) {
        if (json) {
            return vscodeUpdateUserConfiguration(json);
        }
        return Promise.resolve();
    }

    abstract getAppType(): string;
    abstract init(): Promise<void>;
    abstract specifyService(): editor.IEditorOverrideServices;
    abstract createEditors(container: HTMLElement): Promise<void>;
    abstract getConfig(): EditorAppConfigClassic | EditorAppConfigExtended;
    abstract disposeApp(): void;
}

export const isExtendedEditorApp = (wrapperConfig: WrapperConfig) => {
    return wrapperConfig.editorAppConfig?.$type === 'extended';
};

export const isCodeUpdateRequired = (config: EditorAppBaseConfig, modelUpdate: ModelUpdate) => {
    const updateRequired = (modelUpdate.code !== undefined && modelUpdate.code !== config.code) || modelUpdate.codeOriginal !== config.codeOriginal;
    return updateRequired ? ModelUpdateType.code : ModelUpdateType.none;
};

export const isModelUpdateRequired = (config: EditorAppBaseConfig, modelUpdate: ModelUpdate): ModelUpdateType => {
    const codeUpdate = isCodeUpdateRequired(config, modelUpdate);

    type ModelUpdateKeys = keyof typeof modelUpdate;
    const propsModelUpdate = ['languageId', 'codeUri', 'codeOriginalUri'];
    const propCompare = (name: string) => {
        return config[name as ModelUpdateKeys] !== modelUpdate[name as ModelUpdateKeys];
    };
    const updateRequired = propsModelUpdate.some(propCompare);
    return updateRequired ? ModelUpdateType.model : codeUpdate;
};

export enum ModelUpdateType {
    none,
    code,
    model
}

export const isAppConfigDifferent = (orgConfig: EditorAppConfigClassic | EditorAppConfigExtended,
    config: EditorAppConfigClassic | EditorAppConfigExtended, includeModelData: boolean, includeEditorOptions: boolean): boolean => {

    let different = includeModelData ? isModelUpdateRequired(orgConfig, config) !== ModelUpdateType.none : false;
    if (orgConfig.$type === config.$type) {

        type ClassicKeys = keyof typeof orgConfig;
        const propsClassic = ['useDiffEditor', 'readOnly', 'domReadOnly', 'awaitExtensionReadiness', 'automaticLayout', 'languageDef', 'languageExtensionConfig', 'theme', 'themeData'];
        const propsClassicEditorOptions = ['editorOptions', 'diffEditorOptions'];

        const propCompareClassic = (name: string) => {
            return orgConfig[name as ClassicKeys] !== config[name as ClassicKeys];
        };

        const propsVscode = ['useDiffEditor', 'readOnly', 'domReadOnly', 'awaitExtensionReadiness', 'userConfiguration', 'extensions'];
        type ExtendedKeys = keyof typeof orgConfig;
        const propCompareExtended = (name: string) => {
            return orgConfig[name as ExtendedKeys] !== config[name as ExtendedKeys];
        };

        if (orgConfig.$type === 'classic' && config.$type === 'classic') {
            different = different || propsClassic.some(propCompareClassic);
            if (includeEditorOptions) {
                different = different || propsClassicEditorOptions.some(propCompareClassic);
            }
        } else if (orgConfig.$type === 'extended' && config.$type === 'extended') {
            different = different || propsVscode.some(propCompareExtended);
        }
    } else {
        throw new Error('Provided configurations are not of the same type.');
    }
    return different;
};
