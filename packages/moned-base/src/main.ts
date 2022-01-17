export type CodeEditorConfig = {
    language: string;
    code?: string;
    theme: string
    readOnly: boolean;
    buildConf(): unknown;
    isDark(): boolean;
}

export class DefaultCodeEditorConfig implements CodeEditorConfig {

    language: string = 'javascript';
    code?: string | undefined;
    theme: string = 'vs-light';
    readOnly: boolean = false;

    buildConf() {
        return {
            value: this.code,
            language: this.language,
            theme: this.theme,
            automaticLayout: true,
            readOnly: this.readOnly,
        }
    }

    isDark() {
        return (
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
        );
    }
}

export interface CodeEditor {

    getCodeEditorConfig(): CodeEditorConfig;

    loadComponentProperties(): void;

    updateCodeEditorConfig(codeEditorConfig: CodeEditorConfig | undefined | null): void;

    registerListeners(): void;

}

export type CodeEditorFullType = 'CodeEditorFull';

export interface CodeEditorFull extends CodeEditor {

    getCodeEditorType(): CodeEditorFullType;

}

export type CodeEditorLCType = 'CodeEditorLanguageClient';

export interface CodeEditorLanguageClient extends CodeEditor {

    getCodeEditorType(): CodeEditorLCType;

    getFixedLanguageName(): string;

}
