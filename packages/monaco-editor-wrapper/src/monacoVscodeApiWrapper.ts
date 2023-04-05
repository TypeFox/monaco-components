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
// import getDebugServiceOverride from 'vscode/service-override/debug';
import { createConfiguredEditor, createConfiguredDiffEditor } from 'vscode/monaco';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
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

export class MonacoVscodeApiWrapper {

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
            enableLanguagesService: input?.enableLanguagesService ?? true,
            enableLanguageConfigurationService: input?.enableLanguageConfigurationService ?? true,
            enableAudioCueService: input?.enableAudioCueService ?? true,
            // deactivate debugservices for now
            enableDebugService: false,
        };

        const modelService = this.activationConfig.enableModelEditorService ? getModelEditorServiceOverride(async (model, options) => {
            console.log('Trying to open a model', model, options);
            return undefined;
        }) : {};
        const configurationService = this.activationConfig.enableModelEditorService ? getConfigurationServiceOverride() : {};
        const keybindingsService = this.activationConfig.enableKeybindingsService ? getKeybindingsServiceOverride() : {};

        const textmateService = this.activationConfig.enableTextmateService ? getTextmateServiceOverride() : {};
        const tokenClassificationService = this.activationConfig.enableTokenClassificationService ? getTokenClassificationServiceOverride() : {};
        let languageConfigurationService;
        let languagesService;
        // tokenClassificationService requires languagesService and languageConfigurationService
        if (this.activationConfig.enableTokenClassificationService) {
            languagesService = getLanguagesServiceOverride();
            languageConfigurationService = getLanguageConfigurationServiceOverride();
        } else {
            languagesService = this.activationConfig.enableLanguagesService ? getLanguagesServiceOverride() : {};
            languageConfigurationService = this.activationConfig.enableLanguageConfigurationService ? getLanguageConfigurationServiceOverride() : {};
        }
        const audioCueService = this.activationConfig.enableAudioCueService ? getAudioCueServiceOverride() : {};
        // const debugService = this.activationConfig.enableDebugService ? getDebugServiceOverride() : undefined
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

    createEditor(container: HTMLElement, options?: monaco.editor.IStandaloneEditorConstructionOptions) {
        return createConfiguredEditor(container!, options);
    }

    createDiffEditor(container: HTMLElement, options?: monaco.editor.IStandaloneDiffEditorConstructionOptions) {
        return createConfiguredDiffEditor(container!, options);
    }
}
