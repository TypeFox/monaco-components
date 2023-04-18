import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);
import { MonacoEditorLanguageClientWrapper, UserConfig } from 'monaco-editor-wrapper';

const wrapper42 = new MonacoEditorLanguageClientWrapper();
const wrapper43 = new MonacoEditorLanguageClientWrapper();
const wrapper44 = new MonacoEditorLanguageClientWrapper();

const wrapper42Config: UserConfig = {
    id: '42',
    htmlElement: document.getElementById('monaco-editor-root-42') as HTMLElement,
    wrapperConfig: {
        useVscodeConfig: false
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
};

const wrapper43Config: UserConfig = {
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
        editorOptions: {
            lineNumbers: 'off'
        },
        diffEditorOptions: {
            lineNumbers: 'off'
        }
    }
};

const wrapper44Config: UserConfig = {
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
};

const startWrapper42 = () => {
    wrapper42.start(wrapper42Config)
        .then(() => console.log('wrapper42 was started.'))
        .catch((e: Error) => console.error(e));
};

const startWrapper43 = () => {
    wrapper43.start(wrapper43Config)
        .then(() => console.log('wrapper43 was started.'))
        .catch((e: Error) => console.error(e));
};

const startWrapper44 = () => {
    wrapper44.start(wrapper44Config)
        .then(() => console.log('wrapper44 was started.'))
        .catch((e: Error) => console.error(e));
};

startWrapper42();
startWrapper43();
startWrapper44();

const sleepOne = (milliseconds: number) => {
    setTimeout(async () => {
        alert(`Updating editors after ${milliseconds}ms`);

        // TODO: Update model can only work on same editor
        wrapper42Config.editorConfig.languageId = 'javascript';
        wrapper42Config.editorConfig.useDiffEditor = false;
        wrapper42Config.editorConfig.code = `function logMe() {

    console.log('Hello swap editors!');
};`;
        wrapper42.start(wrapper44Config)
            .catch((e: Error) => console.error(e));

        await wrapper43.updateDiffModel({
            languageId: 'javascript',
            code: 'text 5678',
            codeOriginal: 'text 1234'
        })
            .then(() => console.log('Updated diffmodel of wrapper43.'));

        wrapper44Config.editorConfig.languageId = 'text/plain';
        wrapper44Config.editorConfig.useDiffEditor = true;
        wrapper44Config.editorConfig.codeOriginal = 'oh la la la!';
        wrapper44Config.editorConfig.code = 'oh lo lo lo!';
        // This affects all editors globally and is only effective
        // if it is not in contrast to one configured later
        wrapper44Config.editorConfig.theme = 'vs-light';
        wrapper44.start(wrapper44Config)
            .then(() => console.log('Restarted wrapper44.'))
            .catch((e: Error) => console.error(e));
    }, milliseconds);
};
// change the editors config, content or swap normal and diff editors after five seconds
sleepOne(5000);

const sleepTwo = (milliseconds: number) => {
    setTimeout(() => {
        alert(`Updating last editor after ${milliseconds}ms`);

        wrapper44Config.editorConfig.useDiffEditor = false;
        wrapper44Config.editorConfig.theme = 'vs-dark';
        wrapper44.start(wrapper44Config)
            .then(() => console.log('Restarted wrapper44.'))
            .catch((e: Error) => console.error(e));
    }, milliseconds);
};
sleepTwo(10000);
