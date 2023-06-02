// support all editor features
import 'monaco-editor/esm/vs/editor/edcore.main.js';
import { languages } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { MonacoEditorLanguageClientWrapper, UserConfig } from 'monaco-editor-wrapper';

export const wrapper = new MonacoEditorLanguageClientWrapper();

export const startEditor = async (userConfig: UserConfig, codeMain: string, codeOrg?: string) => {
    if (wrapper.isStarted()) {
        alert('Editor was already started!');
        return;
    }
    configureCodeEditors(userConfig, codeMain, codeOrg);
    toggleSwapDiffButton(true);
    await restartEditor(userConfig);
};

export const swapEditors = async (userConfig: UserConfig, codeMain: string, codeOrg?: string) => {
    userConfig.editorConfig.useDiffEditor = !userConfig.editorConfig.useDiffEditor;
    saveMainCode(!userConfig.editorConfig.useDiffEditor);
    configureCodeEditors(userConfig, codeMain, codeOrg);
    await restartEditor(userConfig);
};

export const disposeEditor = async (userConfig: UserConfig) => {
    wrapper.reportStatus();
    toggleSwapDiffButton(false);
    const useDiffEditor = userConfig.editorConfig.useDiffEditor;
    const codeMain = saveMainCode(useDiffEditor);

    await wrapper.dispose();
    console.log(wrapper.reportStatus().join('\n'));
    return codeMain;
};

const restartEditor = async (userConfig: UserConfig) => {
    await wrapper.start(userConfig);
    logEditorInfo(userConfig);
};

const configureCodeEditors = (userConfig: UserConfig, codeMain: string, codeOrg?: string) => {
    if (userConfig.editorConfig.useDiffEditor) {
        userConfig.editorConfig.code = codeMain;
        userConfig.editorConfig.codeOriginal = codeOrg;
    } else {
        userConfig.editorConfig.code = codeMain;
    }
};

const saveMainCode = (saveFromDiff: boolean) => {
    if (saveFromDiff) {
        return wrapper.getModel(true)!.getValue();
    } else {
        return wrapper.getModel()!.getValue();
    }
};

const toggleSwapDiffButton = (enabled: boolean) => {
    const button = document.getElementById('button-swap') as HTMLButtonElement;
    if (button !== null) {
        button.disabled = !enabled;
    }
};

const logEditorInfo = (userConfig: UserConfig) => {
    console.log(`# of configured languages: ${languages.getLanguages().length}`);
    console.log(`Main code: ${wrapper.getModel(true)!.getValue()}`);
    if (userConfig.editorConfig.useDiffEditor) {
        console.log(`Modified code: ${wrapper.getModel()!.getValue()}`);
    }
};
