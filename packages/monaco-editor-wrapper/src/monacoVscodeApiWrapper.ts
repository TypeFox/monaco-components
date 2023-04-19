import { updateUserConfiguration } from 'vscode/service-override/configuration';
import { registerExtension, IExtensionManifest } from 'vscode/extensions';
import { EditorConfig, MonacoEditorWrapper } from './wrapper.js';
import 'vscode/default-extensions/theme-defaults';

export type VscodeUserConfiguration = {
    json?: string;
}

export type MonacoVscodeApiWrapperConfig = {
    extension?: IExtensionManifest | object;
    extensionFiles?: Map<string, URL>;
    userConfiguration?: VscodeUserConfiguration;
}

export class MonacoVscodeApiWrapper implements MonacoEditorWrapper {

    async init(_editorConfig: EditorConfig, wrapperConfig: MonacoVscodeApiWrapperConfig) {
        console.log(window.location.href);

        if (wrapperConfig.extension) {
            const extension = wrapperConfig.extension as IExtensionManifest;
            const { registerFile: registerExtensionFile } = registerExtension(extension);
            if (wrapperConfig.extensionFiles) {
                for (const entry of wrapperConfig.extensionFiles) {
                    registerExtensionFile(entry[0], async () => {
                        const json = entry[1].href;
                        return (await fetch(json)).text();
                    });
                }
            }
        }

        return this.updateConfig(wrapperConfig.userConfiguration ?? {})
            .then(() => {
                console.log('Init of VscodeApiConfig was completed.');
                return Promise.resolve();
            })
            .catch(e => {
                return Promise.reject(e);
            });
    }

    async updateConfig(config: VscodeUserConfiguration) {
        if (config.json) {
            return updateUserConfiguration(config.json);
        }
    }

}
