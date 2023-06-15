import { MonacoEditorLanguageClientWrapper, UserConfig, WorkerConfigOptions } from 'monaco-editor-wrapper';
import { IDisposable } from 'monaco-editor/esm/vs/editor/editor.api.js';
import * as vscode from 'vscode';
import React, { CSSProperties } from 'react';

export type MonacoEditorProps = {
    style?: CSSProperties;
    className?: string;
    userConfig: UserConfig,
    onTextChanged?: (text: string, isDirty: boolean) => void;
    onLoading?: () => void;
    onLoad?: () => void;
}

export class MonacoEditorReactComp extends React.Component<MonacoEditorProps> {

    private wrapper: MonacoEditorLanguageClientWrapper = new MonacoEditorLanguageClientWrapper();
    private containerElement?: HTMLDivElement;
    private _subscription: IDisposable | null = null;
    private isStarting?: Promise<void>;

    constructor(props: MonacoEditorProps) {
        super(props);
        this.containerElement = undefined;
    }

    override async componentDidMount() {
        await this.handleReinit();
    }

    private async handleReinit() {
        await this.destroyMonaco();
        await this.initMonaco();
    }

    override async componentDidUpdate(prevProps: MonacoEditorProps) {
        const { className, userConfig } = this.props;
        const { wrapper } = this;

        if (prevProps.className !== className && this.containerElement) {
            this.containerElement.className = className ?? '';
        }

        let mustReInit = false;
        const prevWorkerOptions = prevProps.userConfig.languageClientConfig.workerConfigOptions;
        const currentWorkerOptions = userConfig.languageClientConfig.workerConfigOptions;
        const prevIsWorker = (prevWorkerOptions as Worker)?.postMessage !== undefined;
        const currentIsWorker = (currentWorkerOptions as Worker)?.postMessage !== undefined;
        const prevIsWorkerConfig = (prevWorkerOptions as WorkerConfigOptions)?.url !== undefined;
        const currentIsWorkerConfig = (currentWorkerOptions as WorkerConfigOptions)?.url !== undefined;

        // check if both are configs and the workers are both undefined
        if (prevIsWorkerConfig && prevIsWorker === undefined && currentIsWorkerConfig && currentIsWorker === undefined) {
            mustReInit = (prevWorkerOptions as WorkerConfigOptions).url !== (currentWorkerOptions as WorkerConfigOptions).url;
        // check if both are workers and configs are both undefined
        } else if (prevIsWorkerConfig === undefined && prevIsWorker && currentIsWorkerConfig === undefined && currentIsWorker) {
            mustReInit = (prevWorkerOptions as Worker) !== (currentWorkerOptions as Worker);
        // previous was worker and current config is not or the other way around
        } else if (prevIsWorker && currentIsWorkerConfig || prevIsWorkerConfig && currentIsWorker) {
            mustReInit = true;
        }

        if (mustReInit) {
            await this.handleReinit();
        } else {
            if (wrapper !== null) {
                let restarted = false;

                // we need to restart if the editor wrapper config changed
                if (userConfig.wrapperConfig.useVscodeConfig) {
                    if (prevProps.userConfig.wrapperConfig.monacoVscodeApiConfig !==
                        userConfig.wrapperConfig.monacoVscodeApiConfig) {
                        restarted = true;
                        await this.handleReinit();
                    }
                } else {
                    if (prevProps.userConfig.wrapperConfig.monacoEditorConfig !==
                        userConfig.wrapperConfig.monacoEditorConfig) {
                        restarted = true;
                        await this.handleReinit();
                    }
                }

                if (!restarted) {
                    const options = userConfig.editorConfig.editorOptions;
                    const prevOptions = prevProps.userConfig.editorConfig.editorOptions;
                    if (options !== prevOptions) {
                        wrapper.updateEditorOptions(userConfig.editorConfig.editorOptions ?? {});
                    }

                    const languageId = userConfig.editorConfig.languageId;
                    const prevLanguageId = prevProps.userConfig.editorConfig.languageId;
                    const code = userConfig.editorConfig.code;
                    const prevCode = prevProps.userConfig.editorConfig.code;
                    if (languageId !== prevLanguageId && code !== prevCode) {
                        this.wrapper.updateModel({
                            languageId: languageId,
                            code: code
                        });
                    }
                }

            }
        }
    }

    override componentWillUnmount() {
        this.destroyMonaco();
    }

    private assignRef = (component: HTMLDivElement) => {
        this.containerElement = component;
    };

    private async destroyMonaco(): Promise<void> {
        if (this.wrapper) {
            await this.isStarting;
            try {
                await this.wrapper.dispose();
            } catch {
                // This is fine
                // Sometimes the language client throws an error during disposal
                // This should not prevent us from continue working
            }
        }
        if (this._subscription) {
            this._subscription.dispose();
        }
    }

    private async initMonaco() {
        const {
            className,
            userConfig,
            onTextChanged,
            onLoading,
            onLoad,
        } = this.props;

        if (this.containerElement) {
            this.containerElement.className = className ?? '';

            userConfig.htmlElement = this.containerElement;
            this.isStarting = this.wrapper.start(userConfig);
            await this.isStarting;

            onLoading && onLoading();
            onLoad && this.isStarting?.then(() => onLoad());

            if (onTextChanged) {
                const model = this.wrapper.getModel();
                if (model) {
                    const verifyModelContent = () => {
                        const modelText = model.getValue();
                        onTextChanged(modelText, modelText !== userConfig.editorConfig.code);
                    };

                    this._subscription = model.onDidChangeContent(() => {
                        verifyModelContent();
                    });
                    // do it initially
                    verifyModelContent();
                }
            }
        }
    }

    updateLayout(): void {
        this.wrapper.updateLayout();
    }

    getEditorWrapper() {
        return this.wrapper;
    }

    /**
     * Executes a custom LSP command by name with args, and returns the result
     * @param cmd Command to execute
     * @param args Arguments to pass along with this command
     * @returns The result of executing this command in the language server
     */
    executeCommand(cmd: string, ...args: unknown[]): Thenable<unknown> {
        return vscode.commands.executeCommand(cmd, ...args);
    }

    override render() {
        return (
            <div
                ref={this.assignRef}
                style={this.props.style}
                className={this.props.className}
            />
        );
    }
}
