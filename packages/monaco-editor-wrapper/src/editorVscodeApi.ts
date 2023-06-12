import { MonacoEditorBase } from './editor.js';
import { updateUserConfiguration } from 'vscode/service-override/configuration';
import { registerExtension, IExtensionManifest } from 'vscode/extensions';
import 'vscode/default-extensions/theme-defaults';
import { MonacoEditorWrapper } from './wrapper.js';

export type VscodeUserConfiguration = {
    json?: string;
}

export type EditorVscodeApiConfig = {
    extension?: IExtensionManifest | object;
    extensionFilesOrContents?: Map<string, string | URL>;
    userConfiguration?: VscodeUserConfiguration;
}

export class EditorVscodeApi extends MonacoEditorBase implements MonacoEditorWrapper {

    async init() {
        const wrapperConfig = this.monacoConfig as EditorVscodeApiConfig;
        if (wrapperConfig.extension) {
            const extension = wrapperConfig.extension as IExtensionManifest;
            const { registerFile: registerExtensionFile } = registerExtension(extension);
            if (wrapperConfig.extensionFilesOrContents) {
                for (const entry of wrapperConfig.extensionFilesOrContents) {
                    registerExtensionFile(entry[0], async () => {
                        const data = entry[1];
                        if (data instanceof URL) {
                            const json = data.href;
                            return (await fetch(json)).text();
                        } else {
                            return data;
                        }
                    });
                }
            }
        }

        await this.updateConfig(wrapperConfig.userConfiguration ?? {});
        console.log('Init of VscodeApiConfig was completed.');
    }

    async updateConfig(config: VscodeUserConfiguration) {
        if (config.json) {
            return updateUserConfiguration(config.json);
        }
    }

}
