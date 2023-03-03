import { StandaloneServices } from 'vscode/services';
import getModelEditorServiceOverride from 'vscode/service-override/modelEditor';
import getNotificationServiceOverride from 'vscode/service-override/notifications';
import getDialogsServiceOverride from 'vscode/service-override/dialogs';
import getConfigurationServiceOverride, { updateUserConfiguration as vscodeUpdateUserConfiguration } from 'vscode/service-override/configuration';
import getKeybindingsServiceOverride, { updateUserKeybindings } from 'vscode/service-override/keybindings';
import getTextmateServiceOverride, { ITMSyntaxExtensionPoint, setGrammars as vscodeSetGrammars } from 'vscode/service-override/textmate';
import getLanguagesServiceOverride, { IRawLanguageExtensionPoint, setLanguages as vscodeSetLanguages } from 'vscode/service-override/languages';
import getTokenClassificationServiceOverride from 'vscode/service-override/tokenClassification';
import getLanguageConfigurationServiceOverride, { setLanguageConfiguration as vscodeSetLanguageConfiguration } from 'vscode/service-override/languageConfiguration';
import getThemeServiceOverride from 'vscode/service-override/theme';

import { loadAllDefaultThemes } from 'monaco-languageclient/themeLocalHelper';

export class VscodeApiConfig {

    private onigFileUrl = new URL('../../node_modules/vscode-oniguruma/release/onig.wasm', window.location.href).href;
    private themesUrl = new URL('../monaco-editor-wrapper/resources/themes', window.location.href).href;

    private userConfigurationJson: string | undefined;
    private keybindingsJson: string | undefined;

    // grammars
    private grammarsConfig: {
        grammars?: ITMSyntaxExtensionPoint[] | undefined;
        getContentFunc?: ((grammar: ITMSyntaxExtensionPoint) => Promise<string>) | undefined;
    } = {};

    private languageConfig: {
        languages?: (Array<Partial<IRawLanguageExtensionPoint>>)
        path?: string,
        getConfiguration?: () => Promise<string>
    } = {};

    async init() {
        const responseOnig = await fetch(this.onigFileUrl);

        StandaloneServices.initialize({
            ...getModelEditorServiceOverride(async (model, options) => {
                console.log('trying to open a model', model, options);
                return undefined;
            }),
            ...getNotificationServiceOverride(),
            ...getDialogsServiceOverride(),
            ...getConfigurationServiceOverride(),
            ...getKeybindingsServiceOverride(),
            ...getTextmateServiceOverride(async () => {
                return await responseOnig.arrayBuffer();
            }),
            ...getThemeServiceOverride(),
            ...getTokenClassificationServiceOverride(),
            ...getLanguageConfigurationServiceOverride(),
            ...getLanguagesServiceOverride()
        });

        console.log('Basic init of VscodeApiConfig was completed.');
    }

    async setup() {
        if (this.languageConfig.languages) {
            vscodeSetLanguages(this.languageConfig.languages);
        }

        if (this.languageConfig.path && this.languageConfig.getConfiguration) {
            vscodeSetLanguageConfiguration(this.languageConfig.path, this.languageConfig.getConfiguration);
        }

        if (this.grammarsConfig.grammars && this.grammarsConfig.getContentFunc) {
            vscodeSetGrammars(this.grammarsConfig.grammars, this.grammarsConfig.getContentFunc);
        }

        await loadAllDefaultThemes(this.themesUrl);

        if (this.userConfigurationJson) {
            void vscodeUpdateUserConfiguration(this.userConfigurationJson);
        }

        if (this.keybindingsJson) {
            void updateUserKeybindings(this.keybindingsJson);
        }
    }

    setUserConfiguration(configurationJson: string) {
        this.userConfigurationJson = configurationJson;
    }

    setGrammars(grammars: ITMSyntaxExtensionPoint[], getContent: (grammar: ITMSyntaxExtensionPoint) => Promise<string>): void {
        this.grammarsConfig.grammars = grammars;
        this.grammarsConfig.getContentFunc = getContent;
    }

    setLanguages(languages: Array<Partial<IRawLanguageExtensionPoint>>): void {
        this.languageConfig.languages = languages;
    }

    setLanguageConfiguration(path: string, getConfiguration: () => Promise<string>): void {
        this.languageConfig.path = path;
        this.languageConfig.getConfiguration = getConfiguration;
    }

    setUserKeybindings(keybindingsJson: string) {
        this.keybindingsJson = keybindingsJson;
    }
}
