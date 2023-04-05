import { editor, languages } from 'monaco-editor/esm/vs/editor/editor.api.js';

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

export class MonacoEditorWrapper {

    private languageExtensionConfig: MonacoLanguageExtensionConfig | undefined;
    private languageDef: languages.IMonarchLanguage | undefined = undefined;
    private themeData: editor.IStandaloneThemeData | undefined = undefined;

    async init() {
        console.log('Basic init of MonacoConfig was completed.');
    }

    setLanguageExtensionConfig(languageExtensionConfig: MonacoLanguageExtensionConfig): void {
        this.languageExtensionConfig = languageExtensionConfig;
    }

    getLanguageExtensionConfig(): MonacoLanguageExtensionConfig | undefined {
        return this.languageExtensionConfig;
    }

    getMonarchTokensProvider(): languages.IMonarchLanguage | undefined {
        return this.languageDef;
    }

    setMonarchTokensProvider(languageDef: unknown): void {
        this.languageDef = languageDef as languages.IMonarchLanguage;
    }

    setEditorThemeData(themeData: unknown): void {
        this.themeData = themeData as editor.IStandaloneThemeData;
    }

    getEditorThemeData(): editor.IStandaloneThemeData | undefined {
        return this.themeData;
    }

    updateMonacoConfig(languageId: string, theme: string) {
        // register own language first
        const extLang = this.getLanguageExtensionConfig();
        if (extLang) {
            languages.register(this.getLanguageExtensionConfig() as languages.ILanguageExtensionPoint);
        }

        const languageRegistered = languages.getLanguages().filter(x => x.id === languageId);
        if (languageRegistered.length === 0) {
            // this is only meaningful for languages supported by monaco out of the box
            languages.register({ id: languageId });
        }

        // apply monarch definitions
        const tokenProvider = this.getMonarchTokensProvider();
        if (tokenProvider) {
            languages.setMonarchTokensProvider(languageId, tokenProvider);
        }
        const themeData = this.getEditorThemeData();
        if (themeData) {
            editor.defineTheme(theme, themeData);
        }

        editor.setTheme(theme);
    }

    createEditor(container: HTMLElement, options?: editor.IStandaloneEditorConstructionOptions) {
        return editor.create(container!, options);
    }

    createDiffEditor(container: HTMLElement, options?: editor.IStandaloneDiffEditorConstructionOptions) {
        return editor.createDiffEditor(container!, options);
    }
}
