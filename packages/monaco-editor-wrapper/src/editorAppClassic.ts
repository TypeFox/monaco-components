import { EditorAppBase, EditorAppBaseConfig, EditorAppType } from './editorAppBase.js';
import { editor, languages } from 'monaco-editor';
import { UserConfig } from './wrapper.js';
import { Logger } from './logger.js';
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

export type EditorAppConfigClassic = EditorAppBaseConfig & {
    $type: 'classic';
    automaticLayout?: boolean;
    theme?: editor.BuiltinTheme | string;
    editorOptions?: editor.IStandaloneEditorConstructionOptions;
    diffEditorOptions?: editor.IStandaloneDiffEditorConstructionOptions;
    languageExtensionConfig?: MonacoLanguageExtensionConfig;
    languageDef?: languages.IMonarchLanguage;
    themeData?: editor.IStandaloneThemeData;
};

/**
 * The classic monaco-editor app uses the classic monaco-editor configuration.
 */
export class EditorAppClassic extends EditorAppBase {

    private editorOptions: editor.IStandaloneEditorConstructionOptions;
    private diffEditorOptions: editor.IStandaloneDiffEditorConstructionOptions;
    private config: EditorAppConfigClassic;
    private logger: Logger | undefined;

    constructor(id: string, userConfig: UserConfig, logger?: Logger) {
        super(id);
        this.logger = logger;
        this.config = this.buildConfig(userConfig) as EditorAppConfigClassic;
        const userInput = userConfig.wrapperConfig.editorAppConfig as EditorAppConfigClassic;
        // default to vs-light
        this.config.theme = userInput.theme ?? 'vs-light';
        // default to true
        this.config.automaticLayout = userInput.automaticLayout ?? true;

        this.editorOptions = userInput.editorOptions ?? {};
        this.editorOptions.automaticLayout = userInput.automaticLayout ?? true;

        this.diffEditorOptions = userInput.diffEditorOptions ?? {};
        this.diffEditorOptions.automaticLayout = userInput.automaticLayout ?? true;

        this.config.languageExtensionConfig = userInput.languageExtensionConfig ?? undefined;
        this.config.languageDef = userInput.languageDef ?? undefined;
        this.config.themeData = userInput.themeData ?? undefined;
    }

    getAppType(): EditorAppType {
        return 'classic';
    }

    getConfig(): EditorAppConfigClassic {
        return this.config;
    }

    async createEditors(container: HTMLElement): Promise<void> {
        if (this.config.useDiffEditor) {
            await this.createDiffEditor(container, this.diffEditorOptions);
        } else {
            await this.createEditor(container, this.editorOptions);
        }
    }

    async init() {
        // register own language first
        const extLang = this.config.languageExtensionConfig;
        if (extLang) {
            languages.register(extLang);
        }

        const languageRegistered = languages.getLanguages().filter(x => x.id === this.config.languageId);
        if (languageRegistered.length === 0) {
            // this is only meaningful for languages supported by monaco out of the box
            languages.register({
                id: this.config.languageId
            });
        }

        // apply monarch definitions
        const tokenProvider = this.config.languageDef;
        if (tokenProvider) {
            languages.setMonarchTokensProvider(this.config.languageId, tokenProvider);
        }
        const themeData = this.config.themeData;
        if (themeData) {
            editor.defineTheme(this.config.theme!, themeData);
        }
        editor.setTheme(this.config.theme!);

        this.logger?.info('Init of MonacoConfig was completed.');
        return Promise.resolve();
    }

    async updateEditorOptions(options: editor.IEditorOptions & editor.IGlobalEditorOptions) {
        this.updateMonacoEditorOptions(options);
    }

    disposeApp(): void {
        this.disposeEditor();
        this.disposeDiffEditor();
    }
}
