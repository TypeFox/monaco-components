import type * as vscode from 'vscode';
import { IDisposable, editor } from 'monaco-editor';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import { whenReady as whenReadyTheme } from '@codingame/monaco-vscode-theme-defaults-default-extension';
import { EditorAppBase, EditorAppBaseConfig, EditorAppType } from './editorAppBase.js';
import { registerExtension, IExtensionManifest, ExtensionHostKind } from 'vscode/extensions';
import { UserConfig } from './wrapper.js';
import { verifyUrlorCreateDataUrl } from './utils.js';
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
    private extensionRegisterResults: Map<string, RegisterLocalProcessExtensionResult | RegisterExtensionResult | undefined> = new Map();
    private logger: Logger | undefined;

    constructor(id: string, userConfig: UserConfig, logger?: Logger) {
        super(id);
        this.logger = logger;
        this.config = this.buildConfig(userConfig) as EditorAppConfigVscodeApi;
        const userInput = userConfig.wrapperConfig.editorAppConfig as EditorAppConfigVscodeApi;
        this.config.extensions = userInput.extensions ?? undefined;
    }

    getAppType(): EditorAppType {
        return 'vscodeApi';
    }

    getConfig(): EditorAppConfigVscodeApi {
        return this.config;
    }

    getExtensionRegisterResult(extensionName: string) {
        return this.extensionRegisterResults.get(extensionName);
    }

    override specifyService(): editor.IEditorOverrideServices {
        return {
            ...getThemeServiceOverride(),
            ...getTextmateServiceOverride()
        };
    }

    async createEditors(container: HTMLElement): Promise<void> {
        if (this.config.useDiffEditor) {
            await this.createDiffEditor(container);
        } else {
            await this.createEditor(container);
        }
    }

    override async init() {
        // await all extensions that should be ready beforehand
        // always await theme extension
        const awaitReadiness = (this.config.awaitExtensionReadiness ?? []).concat(whenReadyTheme);
        await this.awaitReadiness(awaitReadiness);

        if (this.config.extensions) {
            const allPromises: Array<Promise<void>> = [];
            for (const extensionConfig of this.config.extensions) {
                const manifest = extensionConfig.config as IExtensionManifest;
                const extRegResult = registerExtension(manifest, ExtensionHostKind.LocalProcess);
                this.extensionRegisterResults.set(manifest.name, extRegResult);
                if (extensionConfig.filesOrContents && Object.hasOwn(extRegResult, 'registerFileUrl')) {
                    for (const entry of extensionConfig.filesOrContents) {
                        (extRegResult as RegisterLocalExtensionResult).registerFileUrl(entry[0], verifyUrlorCreateDataUrl(entry[1]));
                    }
                }
                allPromises.push(extRegResult.whenReady());
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
        this.extensionRegisterResults.forEach((k) => k?.dispose());
    }
}
