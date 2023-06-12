import { MonacoEditorBase } from './editor.js';
import { editor, languages } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { MonacoEditorWrapper } from './wrapper.js';
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

export type EditorClassicConfig = {
    languageExtensionConfig?: MonacoLanguageExtensionConfig;
    languageDef?: languages.IMonarchLanguage;
    themeData?: editor.IStandaloneThemeData;
}

export class EditorClassic extends MonacoEditorBase implements MonacoEditorWrapper {

    async init() {
        const wrapperConfig = this.monacoConfig as EditorClassicConfig;

        // register own language first
        const extLang = wrapperConfig?.languageExtensionConfig;
        if (extLang) {
            languages.register(extLang);
        }

        const languageRegistered = languages.getLanguages().filter(x => x.id === this.editorConfig.languageId);
        if (languageRegistered.length === 0) {
            // this is only meaningful for languages supported by monaco out of the box
            languages.register({
                id: this.editorConfig.languageId
            });
        }

        // apply monarch definitions
        const tokenProvider = wrapperConfig?.languageDef;
        if (tokenProvider) {
            languages.setMonarchTokensProvider(this.editorConfig.languageId, tokenProvider);
        }
        const themeData = wrapperConfig?.themeData;
        if (themeData) {
            editor.defineTheme(this.editorConfig.theme, themeData);
        }
        editor.setTheme(this.editorConfig.theme);

        console.log('Init of MonacoConfig was completed.');
        return Promise.resolve();
    }

    async updateConfig(options: editor.IEditorOptions & editor.IGlobalEditorOptions) {
        this.editor?.updateOptions(options);
    }
}
