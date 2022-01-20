export type CodeEditorConfig = {
    languageId: string;
    code: string;
    theme: string
    readOnly: boolean;

    buildEditorConf(): unknown;
    isDark(): boolean;
}

export class DefaultCodeEditorConfig implements CodeEditorConfig {

    code = '';
    languageId = 'javascript';
    theme = 'vs-light';
    readOnly = false;

    buildEditorConf() {
        return {
            language: this.languageId,
            value: this.code,
            theme: this.theme,
            automaticLayout: true,
            readOnly: this.readOnly
        };
    }

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

    syncPropertiesAndEditorConfig(): void;

    startEditor(): void;

}
