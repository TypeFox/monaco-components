import { EditorAppBase } from './editor.js';
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

export type EditorAppConfigClassic = {
    editorAppType: 'classic';
    languageExtensionConfig?: MonacoLanguageExtensionConfig;
    languageDef?: languages.IMonarchLanguage;
    themeData?: editor.IStandaloneThemeData;
}

export class EditorAppClassic extends EditorAppBase implements MonacoEditorWrapper {

    static APP_TYPE = 'classic';

    static createEmptyConfig() {
        return {
            editorAppType: EditorAppClassic.APP_TYPE
        } as EditorAppConfigClassic;
    }

    getAppType() {
        return EditorAppClassic.APP_TYPE;
    }

    async init() {
        const wrapperConfig = this.editorAppConfig === undefined ? EditorAppClassic.createEmptyConfig() : this.editorAppConfig as EditorAppConfigClassic;

        // register own language first
        const extLang = wrapperConfig?.languageExtensionConfig;
        if (extLang) {
            languages.register(extLang);
        }

        const languageRegistered = languages.getLanguages().filter(x => x.id === this.editorContentConfig.languageId);
        if (languageRegistered.length === 0) {
            // this is only meaningful for languages supported by monaco out of the box
            languages.register({
                id: this.editorContentConfig.languageId
            });
        }

        // apply monarch definitions
        const tokenProvider = wrapperConfig?.languageDef;
        if (tokenProvider) {
            languages.setMonarchTokensProvider(this.editorContentConfig.languageId, tokenProvider);
        }
        const themeData = wrapperConfig?.themeData;
        if (themeData) {
            editor.defineTheme(this.editorContentConfig.theme!, themeData);
        }
        editor.setTheme(this.editorContentConfig.theme!);

        console.log('Init of MonacoConfig was completed.');
        return Promise.resolve();
    }

    async updateConfig(options: editor.IEditorOptions & editor.IGlobalEditorOptions) {
        this.editor?.updateOptions(options);
    }
}
