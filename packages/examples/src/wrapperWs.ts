import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

// support all editor features
import 'monaco-editor/esm/vs/editor/edcore.main.js';
import { languages } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';

const languageId = 'json';
let codeMain = `{
    "$schema": "http://json.schemastore.org/coffeelint",
    "line_endings": {"value": "windows"}
}`;
const codeOrg = `{
    "$schema": "http://json.schemastore.org/coffeelint",
    "line_endings": {"value": "unix"}
}`;
const wrapper = new MonacoEditorLanguageClientWrapper();

const monacoEditorConfig = {
    glyphMargin: true,
    guides: {
        bracketPairs: true
    },
    lightbulb: {
        enabled: true
    },
};

const userConfig = {
    htmlElement: document.getElementById('monaco-editor-root') as HTMLElement,
    wrapperConfig: {
        useVscodeConfig: false,
        monacoEditorConfig: {
            languageExtensionConfig: {
                id: 'json',
                extensions: ['.json', '.jsonc'],
                aliases: ['JSON', 'json'],
                mimetypes: ['application/json']
            }
        }
    },
    editorConfig: {
        languageId: languageId,
        code: codeMain,
        useDiffEditor: false,
        codeOriginal: codeOrg,
        editorOptions: monacoEditorConfig,
        diffEditorOptions: monacoEditorConfig,
        theme: 'vs-dark',
        automaticLayout: true
    },
    languageClientConfig: {
        enabled: true,
        useWebSocket: true,
        webSocketConfigOptions: {
            host: 'localhost',
            port: 3000,
            path: 'sampleServer',
            secured: false
        }
    }
};

const startEditor = async () => {
    if (wrapper.isStarted()) {
        alert('Editor was already started!');
        return;
    }

    wrapper.start(userConfig)
        .then(() => {
            logEditorInfo(wrapper);
        })
        .catch((e: Error) => console.error(e));

    configureCodeEditors();
    toggleSwapDiffButton(true);
};

function configureCodeEditors() {
    if (userConfig.editorConfig.useDiffEditor) {
        userConfig.editorConfig.code = codeMain;
        userConfig.editorConfig.codeOriginal = codeOrg;
    } else {
        userConfig.editorConfig.code = codeMain;
    }
}

function saveMainCode(saveFromDiff: boolean, saveFromMain: boolean) {
    if (saveFromDiff) {
        codeMain = wrapper.getModel(true)!.getValue();
    }
    if (saveFromMain) {
        codeMain = wrapper.getModel()!.getValue();
    }
}

function swapEditors() {
    userConfig.editorConfig.useDiffEditor = !userConfig.editorConfig.useDiffEditor;
    saveMainCode(!userConfig.editorConfig.useDiffEditor, false);
    configureCodeEditors();

    wrapper.start(userConfig)
        .then(() => {
            logEditorInfo(wrapper);
        })
        .catch((e: Error) => console.error(e));
}

async function disposeEditor() {
    wrapper.reportStatus();
    toggleSwapDiffButton(false);
    const useDiffEditor = userConfig.editorConfig.useDiffEditor;
    saveMainCode(useDiffEditor, !useDiffEditor);
    await wrapper.dispose()
        .then(() => {
            console.log(wrapper.reportStatus().join('\n'));
        })
        .catch((e: Error) => console.error(e));
}

function toggleSwapDiffButton(enabled: boolean) {
    const button = document.getElementById('button-swap') as HTMLButtonElement;
    if (button !== null) {
        button.disabled = !enabled;
    }
}

function logEditorInfo(client: MonacoEditorLanguageClientWrapper) {
    console.log(`# of configured languages: ${languages.getLanguages().length}`);
    console.log(`Main code: ${client.getModel(true)!.getValue()}`);
    if (userConfig.editorConfig.useDiffEditor) {
        console.log(`Modified code: ${client.getModel()!.getValue()}`);
    }
}

document.querySelector('#button-start')?.addEventListener('click', startEditor);
document.querySelector('#button-swap')?.addEventListener('click', swapEditors);
document.querySelector('#button-dispose')?.addEventListener('click', disposeEditor);

startEditor();
