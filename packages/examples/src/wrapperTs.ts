import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

// support all editor features
import 'monaco-editor/esm/vs/editor/edcore.main.js';
import { editor, languages } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper/allLanguages';

const languageId = 'typescript';
const codeOrg = `function sayHello(): string {
    return "Hello";
};`;
let codeMain = `function sayGoodbye(): string {
    return "Goodbye";
};`;

const monacoEditorConfig: editor.IStandaloneEditorConstructionOptions = {
    glyphMargin: true,
    guides: {
        bracketPairs: true
    },
    lightbulb: {
        enabled: true
    }
};

const userConfig = {
    htmlElement: document.getElementById('monaco-editor-root') as HTMLElement,
    wrapperConfig: {
        useVscodeConfig: false
    },
    languageClientConfig: {
        enabled: false
    },
    editorConfig: {
        languageId: languageId,
        code: codeOrg,
        useDiffEditor: false,
        codeOriginal: codeMain,
        editorOptions: monacoEditorConfig,
        diffEditorOptions: monacoEditorConfig,
        theme: 'vs-dark',
        automaticLayout: true
    }
};

const wrapper = new MonacoEditorLanguageClientWrapper();

const startEditor = async () => {
    if (wrapper.isStarted()) {
        alert('Editor was already started!');
        return;
    }
    configureCodeEditors();

    toggleSwapDiffButton(true);
    await wrapper.start(userConfig)
        .then(() => {
            logEditorInfo(wrapper);
        })
        .catch((e: Error) => console.error(e));
};

const configureCodeEditors = () => {
    if (userConfig.editorConfig.useDiffEditor) {
        userConfig.editorConfig.code = codeMain;
        userConfig.editorConfig.codeOriginal = codeOrg;
    } else {
        userConfig.editorConfig.code = codeMain;
    }
};

const swapEditors = async () => {
    userConfig.editorConfig.useDiffEditor = !userConfig.editorConfig.useDiffEditor;
    codeMain = wrapper.getModel()!.getValue();
    configureCodeEditors();

    await wrapper.start(userConfig)
        .then(() => {
            logEditorInfo(wrapper);
        })
        .catch((e: Error) => console.error(e));
};

const disposeEditor = async () => {
    wrapper.reportStatus();
    toggleSwapDiffButton(false);
    codeMain = wrapper.getModel()!.getValue();
    await wrapper.dispose()
        .then(() => {
            console.log(wrapper.reportStatus().join('\n'));
        })
        .catch((e: Error) => console.error(e));
};

const toggleSwapDiffButton = (enabled: boolean) => {
    const button = document.getElementById('button-swap') as HTMLButtonElement;
    if (button !== null) {
        button.disabled = !enabled;
    }
};

const logEditorInfo = (client: MonacoEditorLanguageClientWrapper) => {
    console.log(`# of configured languages: ${languages.getLanguages().length}`);
    console.log(`Main code: ${client.getModel(true)!.getValue()}`);
    if (userConfig.editorConfig.useDiffEditor) {
        console.log(`Modified code: ${client.getModel()!.getValue()}`);
    }
};

document.querySelector('#button-start')?.addEventListener('click', startEditor);
document.querySelector('#button-swap')?.addEventListener('click', swapEditors);
document.querySelector('#button-dispose')?.addEventListener('click', disposeEditor);

startEditor();
