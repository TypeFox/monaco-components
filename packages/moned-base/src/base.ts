export type CodeEditorConfig = {
    languageId: string;
    code: string;
    theme: string
    readOnly: boolean;

    isDark(): boolean;
}

export class DefaultCodeEditorConfig implements CodeEditorConfig {

    code = '';
    languageId = 'javascript';
    theme = 'vs-light';
    readOnly = false;

    isDark() {
        return (
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
        );
    }
}

export interface CodeEditor {

    getCodeEditorType(): string;

    registerListeners(): void;

    setCode(code: string): void;

    setTheme(theme: string): void;

    setLanguageId(languageId: string): void;

    updateEditor(): void;
}

export interface MonacoWrapperDef {

    updateEditorConfig(editorConfig: CodeEditorConfig): void;

    startEditor(container?: HTMLElement, dispatchEvent?: (event: Event) => boolean): void;

    updateEditor(): void;

    // need for direct or event based theme switching
    setTheme(theme: string): void;

}
