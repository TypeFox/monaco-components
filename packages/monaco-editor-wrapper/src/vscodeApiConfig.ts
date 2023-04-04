import { StandaloneServices } from 'vscode/services';
import getModelEditorServiceOverride from 'vscode/service-override/modelEditor';
import getNotificationServiceOverride from 'vscode/service-override/notifications';
import getDialogsServiceOverride from 'vscode/service-override/dialogs';
import getConfigurationServiceOverride, { updateUserConfiguration as vscodeUpdateUserConfiguration } from 'vscode/service-override/configuration';
import getKeybindingsServiceOverride, { updateUserKeybindings } from 'vscode/service-override/keybindings';
import { registerExtension, IExtensionManifest } from 'vscode/extensions';
import getTextmateServiceOverride from 'vscode/service-override/textmate';
import getLanguagesServiceOverride from 'vscode/service-override/languages';
import getTokenClassificationServiceOverride from 'vscode/service-override/tokenClassification';
import getLanguageConfigurationServiceOverride from 'vscode/service-override/languageConfiguration';
import getThemeServiceOverride from 'vscode/service-override/theme';
import getAudioCueServiceOverride from 'vscode/service-override/audioCue';

import { createConfiguredEditor, createConfiguredDiffEditor } from 'vscode/monaco';

import { loadAllDefaultThemes } from './helpers/themeLocalHelper.js';

export type MonacoVscodeApiActivtion = {
    basePath: string,
    enableModelEditorService: boolean;
    // notificationService and dialogsService are enabled by default
    enableConfigurationService: boolean;
    enableKeybindingsService: boolean;
    enableTextmateService: boolean;
    // theme service is required
    enableTokenClassificationService: boolean;
    enableLanguageConfigurationService: boolean;
};

export class VscodeApiConfig {

    private extensionManifest: IExtensionManifest;
    private extensionFiles: Map<string, URL>;

    private activationConfig: MonacoVscodeApiActivtion | undefined;

    private userConfigurationJson: string | undefined;
    private keybindingsJson: string | undefined;

    async init(input?: MonacoVscodeApiActivtion) {
        console.log(window.location.href);
        this.activationConfig = {
            basePath: input?.basePath ?? '.',
            enableModelEditorService: input?.enableModelEditorService ?? true,
            enableConfigurationService: input?.enableConfigurationService ?? true,
            enableKeybindingsService: input?.enableKeybindingsService ?? true,
            enableTextmateService: input?.enableTextmateService ?? true,
            enableTokenClassificationService: input?.enableTokenClassificationService ?? true,
            enableLanguageConfigurationService: input?.enableLanguageConfigurationService ?? true,
        };

        const modelService = this.activationConfig.enableModelEditorService ? getModelEditorServiceOverride(async (model, options) => {
            console.log('trying to open a model', model, options);
            return undefined;
        }) : undefined;
        const configurationService = this.activationConfig.enableModelEditorService ? getConfigurationServiceOverride() : undefined;
        const keybindingsService = this.activationConfig.enableKeybindingsService ? getKeybindingsServiceOverride() : undefined;

        const textmateService = this.activationConfig.enableTextmateService ? getTextmateServiceOverride() : undefined;
        const tokenClassificationService = this.activationConfig.enableTokenClassificationService ? getTokenClassificationServiceOverride() : undefined;
        let languageConfigurationService;
        let languageService;
        if (tokenClassificationService) {
            languageConfigurationService = getLanguageConfigurationServiceOverride();
            languageService = getLanguagesServiceOverride();
        }

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
            ...languageService,
            ...getAudioCueServiceOverride()
        });
        console.log('Basic init of VscodeApiConfig was completed.');
    }

    async setup() {
        const { registerFile: registerExtensionFile } = registerExtension(this.extensionManifest);
        for (const entry of this.extensionFiles) {
            registerExtensionFile(entry[0], async () => {
                const json = entry[1].href;
                return (await fetch(json)).text();
            });
        }

        const themesUrl = new URL(this.activationConfig?.basePath + '/resources/themes', window.location.href).href;
        console.log(`Themes are loaded from: ${themesUrl}`);
        await loadAllDefaultThemes(themesUrl);

        if (this.userConfigurationJson) {
            void vscodeUpdateUserConfiguration(this.userConfigurationJson);
        }

        if (this.activationConfig?.enableKeybindingsService && this.keybindingsJson) {
            void updateUserKeybindings(this.keybindingsJson);
        }
    }

    setExtensionConfiguration(manifest: IExtensionManifest, files: Map<string, URL>): void {
        this.extensionManifest = manifest;
        this.extensionFiles = files;
    }

    setUserConfiguration(configurationJson: string) {
        this.userConfigurationJson = configurationJson;
    }

    setUserKeybindings(keybindingsJson: string) {
        this.keybindingsJson = keybindingsJson;
    }

    createEditor(container: HTMLElement, automaticLayout: boolean) {
        return createConfiguredEditor(container!, {
            automaticLayout
        });
    }

    createDiffEditor(container: HTMLElement, automaticLayout: boolean) {
        return createConfiguredDiffEditor(container!, {
            automaticLayout
        });
    }
}
