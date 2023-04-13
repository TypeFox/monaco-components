import { StandaloneServices } from 'vscode/services';
import getModelEditorServiceOverride from 'vscode/service-override/modelEditor';
import getNotificationServiceOverride from 'vscode/service-override/notifications';
import getDialogsServiceOverride from 'vscode/service-override/dialogs';
import getConfigurationServiceOverride, { updateUserConfiguration as vscodeUpdateUserConfiguration } from 'vscode/service-override/configuration';
import getKeybindingsServiceOverride from 'vscode/service-override/keybindings';
import { registerExtension, IExtensionManifest } from 'vscode/extensions';
import getTextmateServiceOverride from 'vscode/service-override/textmate';
import getLanguagesServiceOverride from 'vscode/service-override/languages';
import getTokenClassificationServiceOverride from 'vscode/service-override/tokenClassification';
import getLanguageConfigurationServiceOverride from 'vscode/service-override/languageConfiguration';
import getThemeServiceOverride from 'vscode/service-override/theme';
import getAudioCueServiceOverride from 'vscode/service-override/audioCue';
// import getDebugServiceOverride from 'vscode/service-override/debug';
import { createConfiguredEditor, createConfiguredDiffEditor } from 'vscode/monaco';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { loadAllDefaultThemes } from './helpers/themeLocalHelper.js';

export type MonacoVscodeApiActivtion = {
    // notificationService, dialogsService and themeService are enabled by default
    basePath: string,
    enableModelEditorService?: boolean;
    enableConfigurationService?: boolean;
    enableKeybindingsService?: boolean;
    enableTextmateService?: boolean;
    enableTokenClassificationService?: boolean;
    enableLanguagesService?: boolean;
    enableLanguageConfigurationService?: boolean;
    enableAudioCueService?: boolean;
    enableDebugService?: boolean;
};

export type MonacoVscodeApiWrapperConfig = {
    activationConfig: MonacoVscodeApiActivtion;
    extension: IExtensionManifest | object;
    extensionFiles?: Map<string, URL>;
    userConfiguration?: string;
}

export class MonacoVscodeApiWrapper {

    async init(runtimeConfig: MonacoVscodeApiWrapperConfig) {
        console.log(window.location.href);
        const activationInput = runtimeConfig.activationConfig;
        const activationConfig = {
            basePath: activationInput.basePath ?? '.',
            enableModelEditorService: activationInput.enableModelEditorService ?? true,
            enableConfigurationService: activationInput.enableConfigurationService ?? true,
            enableKeybindingsService: activationInput.enableKeybindingsService ?? true,
            enableTextmateService: activationInput.enableTextmateService ?? true,
            enableTokenClassificationService: activationInput.enableTokenClassificationService ?? true,
            enableLanguagesService: activationInput.enableLanguagesService ?? true,
            enableLanguageConfigurationService: activationInput.enableLanguageConfigurationService ?? true,
            enableAudioCueService: activationInput.enableAudioCueService ?? true,
            // deactivate debugservices for now
            enableDebugService: false,
        };

        const modelService = activationConfig.enableModelEditorService ? getModelEditorServiceOverride(async (model, options) => {
            console.log('Trying to open a model', model, options);
            return undefined;
        }) : {};
        const configurationService = activationConfig.enableModelEditorService ? getConfigurationServiceOverride() : {};
        const keybindingsService = activationConfig.enableKeybindingsService ? getKeybindingsServiceOverride() : {};

        const textmateService = activationConfig.enableTextmateService ? getTextmateServiceOverride() : {};
        const tokenClassificationService = activationConfig.enableTokenClassificationService ? getTokenClassificationServiceOverride() : {};
        let languageConfigurationService;
        let languagesService;

        // tokenClassificationService requires languagesService and languageConfigurationService
        if (activationConfig.enableTokenClassificationService) {
            languagesService = getLanguagesServiceOverride();
            languageConfigurationService = getLanguageConfigurationServiceOverride();
        } else {
            languagesService = activationConfig.enableLanguagesService ? getLanguagesServiceOverride() : {};
            languageConfigurationService = activationConfig.enableLanguageConfigurationService ? getLanguageConfigurationServiceOverride() : {};
        }
        const audioCueService = activationConfig.enableAudioCueService ? getAudioCueServiceOverride() : {};
        // const debugService = activationConfig.enableDebugService ? getDebugServiceOverride() : undefined
        const debugService = {};

        StandaloneServices.initialize({
            ...modelService,
            ...getNotificationServiceOverride(),
            ...getDialogsServiceOverride(),
            ...configurationService,
            ...keybindingsService,
            ...textmateService,
            ...getThemeServiceOverride(),
            ...tokenClassificationService,
            ...languageConfigurationService,
            ...languagesService,
            ...audioCueService,
            ...debugService
        });
        runtimeConfig.activationConfig = activationConfig;

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

        const themesUrl = new URL(runtimeConfig.activationConfig?.basePath + '/resources/themes', window.location.href).href;
        console.log(`Themes are loaded from: ${themesUrl}`);
        await loadAllDefaultThemes(themesUrl);

        if (!runtimeConfig.activationConfig.enableKeybindingsService && extension.contributes?.keybindings) {
            console.warn('Keybindings are set, but the KeybindingsService was not enabled.');
            extension.contributes.keybindings = [];
        }

        this.updateWrapperConfig(runtimeConfig);

        console.log('Init of VscodeApiConfig was completed.');
    }

    async updateWrapperConfig(runtimeConfig: MonacoVscodeApiWrapperConfig) {
        if (runtimeConfig.activationConfig.enableConfigurationService && runtimeConfig.userConfiguration) {
            void vscodeUpdateUserConfiguration(runtimeConfig.userConfiguration);
        }
    }

    createEditor(container: HTMLElement, options?: editor.IStandaloneEditorConstructionOptions) {
        return createConfiguredEditor(container!, options);
    }

    createDiffEditor(container: HTMLElement, options?: editor.IStandaloneDiffEditorConstructionOptions) {
        return createConfiguredDiffEditor(container!, options);
    }
}
