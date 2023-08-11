import { EditorAppBase, EditorAppBaseConfig, EditorAppType, VscodeUserConfiguration } from './editorAppBase.js';
import { updateUserConfiguration } from 'vscode/service-override/configuration';
import { registerExtension, IExtensionManifest, ExtensionHostKind } from 'vscode/extensions';
import 'vscode/default-extensions/theme-defaults';
import { UserConfig } from './wrapper.js';

export type EditorAppConfigVscodeApi = EditorAppBaseConfig & {
    editorAppType: 'vscodeApi';
    extension?: IExtensionManifest | object;
    extensionFilesOrContents?: Map<string, string | URL>;
    userConfiguration?: VscodeUserConfiguration;
};

/**
 * The vscode-apo monaco-editor app uses vscode user and extension configuration for monaco-editor.
 */
export class EditorAppVscodeApi extends EditorAppBase {

    private config: EditorAppConfigVscodeApi;

    constructor(id: string, userConfig: UserConfig) {
        super(id);
        this.config = this.buildConfig(userConfig) as EditorAppConfigVscodeApi;
        const userInput = userConfig.wrapperConfig.editorAppConfig as EditorAppConfigVscodeApi;
        this.config.userConfiguration = userInput.userConfiguration ?? undefined;
        this.config.extension = userInput.extension ?? undefined;
        this.config.extensionFilesOrContents = userInput.extensionFilesOrContents ?? undefined;
    }

    getAppType(): EditorAppType {
        return 'vscodeApi';
    }

    getConfig(): EditorAppConfigVscodeApi {
        return this.config;
    }

    async createEditors(container: HTMLElement): Promise<void> {
        if (this.config.useDiffEditor) {
            this.createDiffEditor(container);
        } else {
            this.createEditor(container);
        }
    }

    async init() {
        if (this.config.extension) {
            const extension = this.config.extension as IExtensionManifest;
            const { registerFileUrl } = registerExtension(extension, ExtensionHostKind.LocalProcess);
            const extensionFilesOrContents = this.config.extensionFilesOrContents;
            if (extensionFilesOrContents) {
                for (const entry of extensionFilesOrContents) {
                    registerFileUrl(entry[0], EditorAppVscodeApi.verifyUrlorCreateDataUrl(entry[1]));
                }
            }
        }

        await this.updateEditorOptions(this.config.userConfiguration ?? {});
        console.log('Init of VscodeApiConfig was completed.');
    }

    static verifyUrlorCreateDataUrl(input: string | URL) {
        return (input instanceof URL) ? input.href : new URL(`data:text/plain;base64,${btoa(input)}`).href;
    }

    async updateEditorOptions(config: VscodeUserConfiguration) {
        if (config.json) {
            return updateUserConfiguration(config.json);
        }
    }

}