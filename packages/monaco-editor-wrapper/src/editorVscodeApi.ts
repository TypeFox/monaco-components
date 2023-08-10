import { EditorAppBase, EditorAppConfig, EditorAppType, VscodeUserConfiguration } from './editor.js';
import { updateUserConfiguration } from 'vscode/service-override/configuration';
import { registerExtension, IExtensionManifest, ExtensionHostKind } from 'vscode/extensions';
import 'vscode/default-extensions/theme-defaults';
import { UserConfig } from './wrapper.js';

export type EditorAppConfigVscodeApi = EditorAppConfig & {
    editorAppType: 'vscodeApi';
    extension?: IExtensionManifest | object;
    extensionFilesOrContents?: Map<string, string | URL>;
    userConfiguration?: VscodeUserConfiguration;
};

export class EditorAppVscodeApi extends EditorAppBase {

    constructor(id: string, userConfig: UserConfig) {
        super(id, userConfig);
        const userInput = userConfig.wrapperConfig.editorAppConfig as EditorAppConfigVscodeApi;
        this.getAppConfig().userConfiguration = userInput.userConfiguration ?? undefined;
        this.getAppConfig().extension = userInput.extension ?? undefined;
        this.getAppConfig().extensionFilesOrContents = userInput.extensionFilesOrContents ?? undefined;
    }

    getAppType(): EditorAppType {
        return 'vscodeApi';
    }

    getAppConfig(): EditorAppConfigVscodeApi {
        return this.appConfig as EditorAppConfigVscodeApi;
    }

    async init() {
        if (this.getAppConfig().extension) {
            const extension = this.getAppConfig().extension as IExtensionManifest;
            const { registerFileUrl } = registerExtension(extension, ExtensionHostKind.LocalProcess);
            const extensionFilesOrContents = this.getAppConfig().extensionFilesOrContents;
            if (extensionFilesOrContents) {
                for (const entry of extensionFilesOrContents) {
                    registerFileUrl(entry[0], EditorAppVscodeApi.verifyUrlorCreateDataUrl(entry[1]));
                }
            }
        }

        await this.updateConfig(this.getAppConfig().userConfiguration ?? {});
        console.log('Init of VscodeApiConfig was completed.');
    }

    static verifyUrlorCreateDataUrl(input: string | URL) {
        return (input instanceof URL) ? input.href : new URL(`data:text/plain;base64,${btoa(input)}`).href;
    }

    async updateConfig(config: VscodeUserConfiguration) {
        if (config.json) {
            return updateUserConfiguration(config.json);
        }
    }

}
