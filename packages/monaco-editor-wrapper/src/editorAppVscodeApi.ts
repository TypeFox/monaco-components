import type * as vscode from 'vscode';
import { EditorAppBase, EditorAppBaseConfig, EditorAppType } from './editorAppBase.js';
import { registerExtension, IExtensionManifest, ExtensionHostKind } from 'vscode/extensions';
import { UserConfig } from './wrapper.js';
import { verifyUrlorCreateDataUrl } from './utils.js';
import { IDisposable } from 'monaco-editor';
import { Logger } from './logger.js';

export type ExtensionConfig = {
    config: IExtensionManifest | object;
    filesOrContents?: Map<string, string | URL>;
};

export type EditorAppConfigVscodeApi = EditorAppBaseConfig & {
    $type: 'vscodeApi';
    extensions?: ExtensionConfig[];
};

export type RegisterExtensionResult = {
    id: string;
    dispose(): Promise<void>;
    whenReady(): Promise<void>;
}

interface RegisterLocalExtensionResult extends RegisterExtensionResult {
    registerFileUrl: (path: string, url: string) => IDisposable;
}

export type RegisterLocalProcessExtensionResult = RegisterLocalExtensionResult & {
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
        this.config.extensions = userInput.extensions ?? undefined;
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
        // await all extenson that should be ready beforehand
        await this.awaitReadiness(this.config.userConfiguration);

        if (this.config.extensions) {
            const allPromises: Array<Promise<void>> = [];
            for (const extensionConfig of this.config.extensions) {
                this.extensionRegisterResult = registerExtension(extensionConfig.config as IExtensionManifest, ExtensionHostKind.LocalProcess);
                if (extensionConfig.filesOrContents && Object.hasOwn(this.extensionRegisterResult, 'registerFileUrl')) {
                    for (const entry of extensionConfig.filesOrContents) {
                        (this.extensionRegisterResult as RegisterLocalExtensionResult).registerFileUrl(entry[0], verifyUrlorCreateDataUrl(entry[1]));
                    }
                }
                allPromises.push(this.extensionRegisterResult.whenReady());
            }
            await Promise.all(allPromises);
        }

        // buildConfig ensures userConfiguration is available
        await this.updateUserConfiguration(this.config.userConfiguration);
        this.logger?.info('Init of VscodeApiConfig was completed.');
    }

    disposeApp(): void {
        this.disposeEditor();
        this.disposeDiffEditor();
        this.extensionRegisterResult?.dispose();
    }
}
