import { EditorAppBase, EditorAppConfig, EditorAppType } from './editor.js';
import { editor, languages } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { UserConfig } from './wrapper.js';
/**
 * This is derived from:
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.ILanguageExtensionPoint.html
 */
export type MonacoLanguageExtensionConfig = {
    id: string;
    extensions?: string[];
    filenames?: string[];
    filenamePatterns?: string[];
    firstLine?: string;
    aliases?: string[];
    mimetypes?: string[];
}

export type EditorAppConfigClassic = EditorAppConfig & {
    editorAppType: 'classic';
    automaticLayout?: boolean;
    theme?: string;
    editorOptions?: editor.IStandaloneEditorConstructionOptions;
    diffEditorOptions?: editor.IStandaloneDiffEditorConstructionOptions;
    languageExtensionConfig?: MonacoLanguageExtensionConfig;
    languageDef?: languages.IMonarchLanguage;
    themeData?: editor.IStandaloneThemeData;
};

export class EditorAppClassic extends EditorAppBase {

    constructor(id: string, userConfig: UserConfig) {
        super(id, userConfig);
        const userInput = userConfig.wrapperConfig.editorAppConfig as EditorAppConfigClassic;
        // default to vs-light
        this.getAppConfig().theme = userInput.theme ?? 'vs-light';
        // default to true
        this.getAppConfig().automaticLayout = userInput.automaticLayout ?? true;

        this.editorOptions = userInput.editorOptions ?? {};
        this.editorOptions.automaticLayout = userInput.automaticLayout ?? true;

        this.diffEditorOptions = userInput.diffEditorOptions ?? {};
        this.diffEditorOptions.automaticLayout = userInput.automaticLayout ?? true;

        this.getAppConfig().languageExtensionConfig = userInput.languageExtensionConfig ?? undefined;
        this.getAppConfig().languageDef = userInput.languageDef ?? undefined;
        this.getAppConfig().themeData = userInput.themeData ?? undefined;
    }

    getAppType(): EditorAppType {
        return 'classic';
    }

    getAppConfig(): EditorAppConfigClassic {
        return this.appConfig as EditorAppConfigClassic;
    }

    async init() {
        // register own language first
        const extLang = this.getAppConfig().languageExtensionConfig;
        if (extLang) {
            languages.register(extLang);
        }

        const languageRegistered = languages.getLanguages().filter(x => x.id === this.appConfig.languageId);
        if (languageRegistered.length === 0) {
            // this is only meaningful for languages supported by monaco out of the box
            languages.register({
                id: this.appConfig.languageId
            });
        }

        // apply monarch definitions
        const tokenProvider = this.getAppConfig().languageDef;
        if (tokenProvider) {
            languages.setMonarchTokensProvider(this.appConfig.languageId, tokenProvider);
        }
        const themeData = this.getAppConfig().themeData;
        if (themeData) {
            editor.defineTheme(this.getAppConfig().theme!, themeData);
        }
        editor.setTheme(this.getAppConfig().theme!);

        console.log('Init of MonacoConfig was completed.');
        return Promise.resolve();
    }

    async updateConfig(options: editor.IEditorOptions & editor.IGlobalEditorOptions) {
        this.editor?.updateOptions(options);
    }
}
