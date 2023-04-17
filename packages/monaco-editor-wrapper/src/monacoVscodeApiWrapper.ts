import { updateUserConfiguration } from 'vscode/service-override/configuration';
import { registerExtension, IExtensionManifest } from 'vscode/extensions';
import { createConfiguredEditor, createConfiguredDiffEditor } from 'vscode/monaco';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';
import 'vscode/default-extensions/theme-defaults';

export type MonacoVscodeApiWrapperConfig = {
    extension: IExtensionManifest | object;
    extensionFiles?: Map<string, URL>;
    userConfiguration?: string;
}

export class MonacoVscodeApiWrapper {

    async init(runtimeConfig: MonacoVscodeApiWrapperConfig) {
        console.log(window.location.href);

        const extension = runtimeConfig.extension as IExtensionManifest;
        const { registerFile: registerExtensionFile } = registerExtension(extension);
        if (runtimeConfig.extensionFiles) {
            for (const entry of runtimeConfig.extensionFiles) {
                registerExtensionFile(entry[0], async () => {
                    const json = entry[1].href;
                    return (await fetch(json)).text();
                });
            }
        }

        return this.updateWrapperConfig(runtimeConfig)
            .then(() => {
                console.log('Init of VscodeApiConfig was completed.');
                return Promise.resolve();
            })
            .catch(e => {
                return Promise.reject(e);
            });
    }

    async updateWrapperConfig(runtimeConfig: MonacoVscodeApiWrapperConfig) {
        if (runtimeConfig.userConfiguration) {
            return updateUserConfiguration(runtimeConfig.userConfiguration);
        }
    }

    createEditor(container: HTMLElement, options?: editor.IStandaloneEditorConstructionOptions) {
        return createConfiguredEditor(container!, options);
    }

    createDiffEditor(container: HTMLElement, options?: editor.IStandaloneDiffEditorConstructionOptions) {
        return createConfiguredDiffEditor(container!, options);
    }
}
