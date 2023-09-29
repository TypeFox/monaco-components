import { EditorAppClassic, MonacoEditorLanguageClientWrapper, UserConfig, WorkerConfigDirect, WorkerConfigOptions, isAppConfigDifferent } from 'monaco-editor-wrapper';
import { IDisposable } from 'monaco-editor';
import * as vscode from 'vscode';
import React, { CSSProperties } from 'react';

export type MonacoEditorProps = {
    style?: CSSProperties;
    className?: string;
    userConfig: UserConfig,
    onTextChanged?: (text: string, isDirty: boolean) => void;
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
        const prevWorkerOptions = prevProps.userConfig.languageClientConfig?.options;
        const currentWorkerOptions = userConfig.languageClientConfig?.options;
        const prevIsWorker = (prevWorkerOptions?.$type === 'WorkerDirect');
        const currentIsWorker = (currentWorkerOptions?.$type === 'WorkerDirect');
        const prevIsWorkerConfig = (prevWorkerOptions?.$type === 'WorkerConfig');
        const currentIsWorkerConfig = (currentWorkerOptions?.$type === 'WorkerConfig');

        // check if both are configs and the workers are both undefined
        if (prevIsWorkerConfig && prevIsWorker === undefined && currentIsWorkerConfig && currentIsWorker === undefined) {
            mustReInit = (prevWorkerOptions as WorkerConfigOptions).url !== (currentWorkerOptions as WorkerConfigOptions).url;
            // check if both are workers and configs are both undefined
        } else if (prevIsWorkerConfig === undefined && prevIsWorker && currentIsWorkerConfig === undefined && currentIsWorker) {
            mustReInit = (prevWorkerOptions as WorkerConfigDirect).worker !== (currentWorkerOptions as WorkerConfigDirect).worker;
            // previous was worker and current config is not or the other way around
        } else if (prevIsWorker && currentIsWorkerConfig || prevIsWorkerConfig && currentIsWorker) {
            mustReInit = true;
        }

        if (mustReInit) {
            await this.handleReinit();
        } else {
            if (wrapper !== null) {
                const prevConfig = prevProps.userConfig.wrapperConfig.editorAppConfig;
                const config = userConfig.wrapperConfig.editorAppConfig;
                const appConfigDifferent = isAppConfigDifferent(prevConfig, config, false, false);

                // we need to restart if the editor wrapper config changed
                if (appConfigDifferent) {
                    await this.handleReinit();
                } else {
                    // the function now ensure a model update is only required if something else than the code changed
                    this.wrapper.updateModel(userConfig.wrapperConfig.editorAppConfig);

                    if (prevConfig.$type === 'classic' && config.$type === 'classic') {
                        if (prevConfig.editorOptions !== config.editorOptions) {
                            (wrapper.getMonacoEditorApp() as EditorAppClassic).updateMonacoEditorOptions(config.editorOptions ?? {});
                        }
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
            onLoad,
        } = this.props;

        if (this.containerElement) {
            this.containerElement.className = className ?? '';

            this.isStarting = this.wrapper.start(userConfig, this.containerElement);
            await this.isStarting;

            // once awaiting isStarting is done onLoad is called if available
            onLoad && onLoad();

            if (onTextChanged) {
                const model = this.wrapper.getModel();
                if (model) {
                    const verifyModelContent = () => {
                        const modelText = model.getValue();
                        onTextChanged(modelText, modelText !== userConfig.wrapperConfig.editorAppConfig.code);
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
