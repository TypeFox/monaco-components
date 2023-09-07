import { EditorAppBase, EditorAppBaseConfig, EditorAppType, VscodeUserConfiguration } from './editorAppBase.js';
import { updateUserConfiguration } from 'vscode/service-override/configuration';
import { registerExtension, IExtensionManifest, ExtensionHostKind } from 'vscode/extensions';
import 'vscode/default-extensions/theme-defaults';
import { UserConfig } from './wrapper.js';
import { verifyUrlorCreateDataUrl } from './utils.js';
import { IDisposable } from 'monaco-editor';
import { Logger } from './logger.js';

export type EditorAppConfigVscodeApi = EditorAppBaseConfig & {
    $type: 'vscodeApi';
    extension?: IExtensionManifest | object;
    extensionFilesOrContents?: Map<string, string | URL>;
    userConfiguration?: VscodeUserConfiguration;
};

type ExtensionResult = {
    id: string;
    registerFileUrl: (path: string, url: string) => IDisposable;
    dispose(): Promise<void>;
};

/**
 * The vscode-apo monaco-editor app uses vscode user and extension configuration for monaco-editor.
 */
export class EditorAppVscodeApi extends EditorAppBase {

    private config: EditorAppConfigVscodeApi;
    private extensionResult: ExtensionResult;
    private logger: Logger | undefined;

    constructor(id: string, userConfig: UserConfig, logger?: Logger) {
        super(id);
        this.logger = logger;
        this.config = this.buildConfig(userConfig) as EditorAppConfigVscodeApi;
        const userInput = userConfig.wrapperConfig.editorAppConfig as EditorAppConfigVscodeApi;
        this.config.userConfiguration = userInput.userConfiguration ?? undefined;
        this.config.extension = userInput.extension ?? undefined;
        this.config.extensionFilesOrContents = userInput.extensionFilesOrContents ?? undefined;
    }

    getAppType(): EditorAppType {
        return 'vscodeApi';
    }

    getConfig(): EditorAppConfigVscodeApi {
        return this.config;
    }

    async createEditors(container: HTMLElement): Promise<void> {
        if (this.config.useDiffEditor) {
            await this.createDiffEditor(container);
        } else {
            await this.createEditor(container);
        }
    }

    async init() {
        if (this.config.extension) {
            const extension = this.config.extension as IExtensionManifest;
            this.extensionResult = registerExtension(extension, ExtensionHostKind.LocalProcess);
            const extensionFilesOrContents = this.config.extensionFilesOrContents;
            if (extensionFilesOrContents) {
                for (const entry of extensionFilesOrContents) {
                    this.extensionResult.registerFileUrl(entry[0], verifyUrlorCreateDataUrl(entry[1]));
                }
            }
        }

        await this.updateEditorOptions(this.config.userConfiguration ?? {});
        this.logger?.info('Init of VscodeApiConfig was completed.');
    }

    async updateEditorOptions(config: VscodeUserConfiguration) {
        if (config.json) {
            return updateUserConfiguration(config.json);
        }
    }

    disposeApp(): void {
        this.disposeEditor();
        this.disposeDiffEditor();
        this.extensionResult.dispose();
    }
}
