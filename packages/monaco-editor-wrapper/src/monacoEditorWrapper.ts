import { editor, languages } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { EditorConfig, MonacoEditorWrapper } from './wrapper.js';
import { initServices } from 'monaco-languageclient';

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

export type DirectMonacoEditorWrapperConfig = {
    languageExtensionConfig?: MonacoLanguageExtensionConfig;
    languageDef?: languages.IMonarchLanguage;
    themeData?: editor.IStandaloneThemeData;
}

export class DirectMonacoEditorWrapper implements MonacoEditorWrapper {

    async init(restart: boolean, editorConfig: EditorConfig, wrapperConfig: DirectMonacoEditorWrapperConfig) {
        restart ? await Promise.resolve() : await initServices({
            enableModelEditorService: true,
            modelEditorServiceConfig: {
                useDefaultFunction: true
            },
            enableConfigurationService: true,
            configurationServiceConfig: {
                defaultWorkspaceUri: '/tmp/'
            },
        })
            .then(() => {
                // register own language first
                const extLang = wrapperConfig?.languageExtensionConfig;
                if (extLang) {
                    languages.register(extLang);
                }

                const languageRegistered = languages.getLanguages().filter(x => x.id === editorConfig.languageId);
                if (languageRegistered.length === 0) {
                    // this is only meaningful for languages supported by monaco out of the box
                    languages.register({ id: editorConfig.languageId });
                }

                // apply monarch definitions
                const tokenProvider = wrapperConfig?.languageDef;
                if (tokenProvider) {
                    languages.setMonarchTokensProvider(editorConfig.languageId, tokenProvider);
                }
                const themeData = wrapperConfig?.themeData;
                if (themeData) {
                    editor.defineTheme(editorConfig.theme, themeData);
                }
                editor.setTheme(editorConfig.theme);

                console.log('Init of MonacoConfig was completed.');
                return Promise.resolve();
            });
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async updateConfig(_options: editor.IEditorOptions & editor.IGlobalEditorOptions) {
        // nothing
    }

}
