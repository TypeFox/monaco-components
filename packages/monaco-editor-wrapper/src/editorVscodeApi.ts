import { MonacoEditorBase } from './editor.js';
import { updateUserConfiguration } from 'vscode/service-override/configuration';
import { registerExtension, IExtensionManifest, ExtensionHostKind } from 'vscode/extensions';
import 'vscode/default-extensions/theme-defaults';
import { MonacoEditorWrapper } from './wrapper.js';

export type VscodeUserConfiguration = {
    json?: string;
}

export type EditorAppConfigVscodeApi = {
    editorAppType: 'vscodeApi';
    extension?: IExtensionManifest | object;
    extensionFilesOrContents?: Map<string, string | URL>;
    userConfiguration?: VscodeUserConfiguration;
}

export class EditorVscodeApi extends MonacoEditorBase implements MonacoEditorWrapper {

    static createEmptyConfig() {
        return {
            editorAppType: 'vscodeApi'
        } as EditorAppConfigVscodeApi;
    }

    async init() {
        const wrapperConfig = this.editorAppConfig === undefined ? EditorVscodeApi.createEmptyConfig() : this.editorAppConfig as EditorAppConfigVscodeApi;

        if (wrapperConfig.extension) {
            const extension = wrapperConfig.extension as IExtensionManifest;
            const { registerFileUrl } = registerExtension(extension, ExtensionHostKind.LocalProcess);
            if (wrapperConfig.extensionFilesOrContents) {
                for (const entry of wrapperConfig.extensionFilesOrContents) {
                    registerFileUrl(entry[0], EditorVscodeApi.verifyUrlorCreateDataUrl(entry[1]));
                }
            }
        }

        await this.updateConfig(wrapperConfig.userConfiguration ?? {});
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
