import { editor, languages } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { EditorConfig } from './wrapper.js';

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

export type MonacoEditorWrapperConfig = {
    languageExtensionConfig?: MonacoLanguageExtensionConfig;
    languageDef?: languages.IMonarchLanguage;
    themeData?: editor.IStandaloneThemeData;
}

export class MonacoEditorWrapper {

    async init(editorConfig: EditorConfig, runtimeConfig: MonacoEditorWrapperConfig) {
        this.updateWrapperConfig(editorConfig, runtimeConfig);

        console.log('Init of MonacoConfig was completed.');
    }

    async updateWrapperConfig(editorConfig: EditorConfig, runtimeConfig: MonacoEditorWrapperConfig) {
        // register own language first
        const extLang = runtimeConfig?.languageExtensionConfig;
        if (extLang) {
            languages.register(extLang);
        }

        const languageRegistered = languages.getLanguages().filter(x => x.id === editorConfig.languageId);
        if (languageRegistered.length === 0) {
            // this is only meaningful for languages supported by monaco out of the box
            languages.register({ id: editorConfig.languageId });
        }

        // apply monarch definitions
        const tokenProvider = runtimeConfig?.languageDef;
        if (tokenProvider) {
            languages.setMonarchTokensProvider(editorConfig.languageId, tokenProvider);
        }
        const themeData = runtimeConfig?.themeData;
        if (themeData) {
            editor.defineTheme(editorConfig.theme, themeData);
        }
        editor.setTheme(editorConfig.theme);
    }

    createEditor(container: HTMLElement, options?: editor.IStandaloneEditorConstructionOptions) {
        return editor.create(container!, options);
    }

    createDiffEditor(container: HTMLElement, options?: editor.IStandaloneDiffEditorConstructionOptions) {
        return editor.createDiffEditor(container!, options);
    }
}
