import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

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

export class MonacoConfig {
    private languageExtensionConfig: MonacoLanguageExtensionConfig | undefined;
    private languageDef: monaco.languages.IMonarchLanguage | undefined = undefined;
    private themeData: monaco.editor.IStandaloneThemeData | undefined = undefined;

    async init() {
        console.log('Basic init of MonacoConfig was completed.');
    }

    setLanguageExtensionConfig(languageExtensionConfig: MonacoLanguageExtensionConfig): void {
        this.languageExtensionConfig = languageExtensionConfig;
    }

    getLanguageExtensionConfig(): MonacoLanguageExtensionConfig | undefined {
        return this.languageExtensionConfig;
    }

    getMonarchTokensProvider(): monaco.languages.IMonarchLanguage | undefined {
        return this.languageDef;
    }

    setMonarchTokensProvider(languageDef: unknown): void {
        this.languageDef = languageDef as monaco.languages.IMonarchLanguage;
    }

    setEditorThemeData(themeData: unknown): void {
        this.themeData = themeData as monaco.editor.IStandaloneThemeData;
    }

    getEditorThemeData(): monaco.editor.IStandaloneThemeData | undefined {
        return this.themeData;
    }

    updateMonacoConfig(languageId: string, theme: string) {
        // register own language first
        const extLang = this.getLanguageExtensionConfig();
        if (extLang) {
            monaco.languages.register(this.getLanguageExtensionConfig() as monaco.languages.ILanguageExtensionPoint);
        }

        const languageRegistered = monaco.languages.getLanguages().filter(x => x.id === languageId);
        if (languageRegistered.length === 0) {
            // this is only meaningful for languages supported by monaco out of the box
            monaco.languages.register({ id: languageId });
        }

        // apply monarch definitions
        const tokenProvider = this.getMonarchTokensProvider();
        if (tokenProvider) {
            monaco.languages.setMonarchTokensProvider(languageId, tokenProvider);
        }
        const themeData = this.getEditorThemeData();
        if (themeData) {
            monaco.editor.defineTheme(theme, themeData);
        }

        monaco.editor.setTheme(theme);
    }
}
