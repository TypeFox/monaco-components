import React, { CSSProperties } from 'react';
import { MonacoEditorLanguageClientWrapper, UserConfig } from 'monaco-editor-wrapper';
import 'monaco-editor/esm/vs/editor/edcore.main.js';
import { IDisposable } from 'monaco-editor/esm/vs/editor/editor.api.js';
import * as vscode from 'vscode';

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
    private isStarting?: Promise<string>;

    constructor(props: MonacoEditorProps) {
        super(props);
        this.containerElement = undefined;
    }

    override componentDidMount() {
        this.destroyMonaco().then(() => {
            this.initMonaco();
        });
    }

    override componentDidUpdate(prevProps: MonacoEditorProps) {
        const { className, userConfig } = this.props;
        const { wrapper } = this;

        if (prevProps.className !== className && this.containerElement) {
            this.containerElement.className = className ?? '';
        }
        const prevUrl = prevProps.userConfig.languageClientConfig.workerConfigOptions?.url;
        const url = userConfig.languageClientConfig.workerConfigOptions?.url;
        if (prevUrl !== url) {
            this.destroyMonaco().then(() => this.initMonaco());
        } else {
            if (wrapper !== null) {
                // TODO: we need to update the wrapper config
                wrapper.updateWrapperConfig();
                wrapper.updateEditorConfig();
            }

            /*
            wrapper!.startEditor();
            wrapper!.getRuntimeConfig().editorConfig.languageId = languageId;
            const monacoEditorWrapper = wrapper!.getMonacoEditorWrapper();
            monacoEditorWrapper.setMonarchTokensProvider(syntax);
            // eslint-disable-next-line dot-notation
            monacoEditorWrapper.updateMonacoConfig(languageId, wrapper!.getRuntimeConfig().theme);
            const model = innerEditor.getModel();
            if (model && text !== model.getValue()) {
                model.setValue(text);
            }
*/
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
            this.wrapper.init(userConfig);

            this.isStarting = this.wrapper.startEditor();
            await this.isStarting;

            onLoading && onLoading();
            onLoad && this.isStarting.then(() => onLoad());

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
