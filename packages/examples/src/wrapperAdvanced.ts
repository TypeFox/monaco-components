import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';

const wrapper42 = new MonacoEditorLanguageClientWrapper();
const wrapper43 = new MonacoEditorLanguageClientWrapper();
const wrapper44 = new MonacoEditorLanguageClientWrapper();

const startWrapper42 = () => {
    wrapper42.init({
        id: '42',
        wrapperConfig: {
            useVscodeConfig: false
        },
        htmlElement: document.getElementById('monaco-editor-root-42') as HTMLElement,
        languageClientConfig: {
            enabled: true,
            useWebSocket: true,
            webSocketConfigOptions: {
                host: 'localhost',
                port: 3000,
                path: 'sampleServer',
                secured: false
            }
        },
        editorConfig: {
            languageId: 'text/plain',
            useDiffEditor: true,
            theme: 'vs-light',
            automaticLayout: true,
            codeOriginal: `This line is equal.
This number is different 2002
Misspeelled!
Same again.`,
            code: `This line is equal.
This number is different 2022
Misspelled!
Same again.`
        }
    });

    wrapper42.startEditor()
        .catch((e: Error) => console.error(e));
};

const startWrapper43 = () => {
    wrapper43.init({
        id: '43',
        htmlElement: document.getElementById('monaco-editor-root-43') as HTMLElement,
        wrapperConfig: {
            useVscodeConfig: false
        },
        languageClientConfig: {
            enabled: false,
        },
        editorConfig: {
            languageId: 'text/plain',
            useDiffEditor: true,
            theme: 'vs-light',
            automaticLayout: true,
            codeOriginal: 'This line is equal.\nThis number is different 3022.\nMisspelled!Same again.',
            code: 'This line is equal.\nThis number is different 3002.\nMisspelled!Same again.',
            diffEditorOptions: {
                lineNumbers: 'off'
            }
        }
    });

    wrapper43.startEditor()
        .catch((e: Error) => console.error(e));
};

const startWrapper44 = () => {
    wrapper44.init({
        id: '44',
        htmlElement: document.getElementById('monaco-editor-root-44') as HTMLElement,
        wrapperConfig: {
            useVscodeConfig: false
        },
        languageClientConfig: {
            enabled: false,
        },
        editorConfig: {
            languageId: 'javascript',
            useDiffEditor: false,
            theme: 'vs-dark',
            automaticLayout: true,
            code: `function logMe() {
    console.log('Hello monaco-editor-comp!');
};`,
            editorOptions: {
                minimap: {
                    enabled: true
                }
            }
        }
    });

    wrapper44.startEditor()
        .catch((e: Error) => console.error(e));
};

startWrapper42();
startWrapper43();
startWrapper44();

const sleepOne = (milliseconds: number) => {
    setTimeout(() => {
        alert(`Updating editors after ${milliseconds}ms`);

        // TODO: Update model can only work on same editor
        const config42 = wrapper42.getUserConfig();
        config42.editorConfig.languageId = 'javascript';
        config42.editorConfig.useDiffEditor = false;
        config42.editorConfig.code = `function logMe() {

    console.log('Hello swap editors!');
};`;
        wrapper42.startEditor()
            .catch((e: Error) => console.error(e));

        wrapper43.updateModel({
            useDiffEditor: true,
            languageId: 'javascript',
            code: 'text 5678',
            codeOriginal: 'text 1234'
        });

        const config44 = wrapper44.getUserConfig();
        config44.editorConfig.languageId = 'text/plain';
        config44.editorConfig.useDiffEditor = true;
        config44.editorConfig.codeOriginal = 'oh la la la!';
        config44.editorConfig.code = 'oh lo lo lo!';
        // This affects all editors globally and is only effective
        // if it is not in contrast to one configured later
        config44.editorConfig.theme = 'vs-light';
        wrapper44.startEditor()
            .catch((e: Error) => console.error(e));
    }, milliseconds);
};
// change the editors config, content or swap normal and diff editors after five seconds
sleepOne(5000);

const sleepTwo = (milliseconds: number) => {
    setTimeout(() => {
        alert(`Updating last editor after ${milliseconds}ms`);

        const config44 = wrapper44.getUserConfig();
        config44.editorConfig.useDiffEditor = false;
        config44.editorConfig.theme = 'vs-dark';
        wrapper44.startEditor()
            .catch((e: Error) => console.error(e));
    }, milliseconds);
};
sleepTwo(10000);
