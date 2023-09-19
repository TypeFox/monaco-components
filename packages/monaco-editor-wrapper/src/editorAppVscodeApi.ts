import type * as vscode from 'vscode';
import { EditorAppBase, EditorAppBaseConfig, EditorAppType } from './editorAppBase.js';
import { registerExtension, IExtensionManifest, ExtensionHostKind } from 'vscode/extensions';
import { UserConfig } from './wrapper.js';
import { verifyUrlorCreateDataUrl } from './utils.js';
import { IDisposable } from 'monaco-editor';
import { Logger } from './logger.js';

export type EditorAppConfigVscodeApi = EditorAppBaseConfig & {
    $type: 'vscodeApi';
    extension?: IExtensionManifest | object;
    extensionFilesOrContents?: Map<string, string | URL>;
};

export type RegisterExtensionResult = {
    id: string;
    registerFileUrl: (path: string, url: string) => IDisposable;
    dispose(): Promise<void>;
}

export type RegisterLocalProcessExtensionResult = RegisterExtensionResult & {
    getApi(): Promise<typeof vscode>;
    setAsDefaultApi(): Promise<void>;
};

/**
 * The vscode-apo monaco-editor app uses vscode user and extension configuration for monaco-editor.
 */
export class EditorAppVscodeApi extends EditorAppBase {

    private config: EditorAppConfigVscodeApi;
    private extensionRegisterResult: RegisterLocalProcessExtensionResult | RegisterExtensionResult | undefined;
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

    getExtensionRegisterResult() {
        return this.extensionRegisterResult;
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
            this.extensionRegisterResult = registerExtension(extension, ExtensionHostKind.LocalProcess);
            const extensionFilesOrContents = this.config.extensionFilesOrContents;
            if (extensionFilesOrContents) {
                for (const entry of extensionFilesOrContents) {
                    this.extensionRegisterResult.registerFileUrl(entry[0], verifyUrlorCreateDataUrl(entry[1]));
                }
            }
        }

        // buildConfig ensures userConfiguration is available
        await this.updateUserConfiguration(this.config.userConfiguration!);
        this.logger?.info('Init of VscodeApiConfig was completed.');
    }

    disposeApp(): void {
        this.disposeEditor();
        this.disposeDiffEditor();
        this.extensionRegisterResult?.dispose();
    }
}
