import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js';
import { EditorAppConfigClassic, LanguageClientError, MonacoEditorLanguageClientWrapper, UserConfig } from 'monaco-editor-wrapper';
import { buildWorkerDefinition } from 'monaco-editor-workers';

buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

const wrapper42 = new MonacoEditorLanguageClientWrapper();
const wrapper43 = new MonacoEditorLanguageClientWrapper();
const wrapper44 = new MonacoEditorLanguageClientWrapper();

const wrapper42Config: UserConfig = {
    id: '42',
    wrapperConfig: {
        serviceConfig: {
            userServices: {
                ...getKeybindingsServiceOverride()
            },
            debugLogging: true
        },
        editorAppConfig: {
            $type: 'classic',
            languageId: 'text/plain',
            useDiffEditor: true,
            codeOriginal: `This line is equal.
This number is different 2002
Misspeelled!
Same again.`,
            code: `This line is equal.
This number is different 2022
Misspelled!
Same again.`
        }
    },
    languageClientConfig: {
        options: {
            $type: 'WebSocket',
            name: 'wrapper42 language client',
            host: 'localhost',
            port: 30000,
            path: 'sampleServer',
            secured: false
        }
    }
};

const wrapper43Config: UserConfig = {
    id: '43',
    wrapperConfig: {
        serviceConfig: {
            userServices: {
                ...getKeybindingsServiceOverride()
            },
            debugLogging: true
        },
        editorAppConfig: {
            $type: 'classic',
            languageId: 'text/plain',
            useDiffEditor: true,
            codeOriginal: 'This line is equal.\nThis number is different 3022.\nMisspelled!Same again.',
            code: 'This line is equal.\nThis number is different 3002.\nMisspelled!Same again.',
            editorOptions: {
                lineNumbers: 'off'
            },
            diffEditorOptions: {
                lineNumbers: 'off'
            }
        }
    }
};

const wrapper44Config: UserConfig = {
    id: '44',
    wrapperConfig: {
        serviceConfig: {
            userServices: {
                ...getKeybindingsServiceOverride()
            },
            debugLogging: true
        },
        editorAppConfig: {
            $type: 'classic',
            languageId: 'javascript',
            useDiffEditor: false,
            theme: 'vs-dark',
            code: `function logMe() {
    console.log('Hello monaco-editor-wrapper!');
};`,
            editorOptions: {
                minimap: {
                    enabled: true
                }
            }
        }
    }
};

const startWrapper42 = async () => {
    await wrapper42.start(wrapper42Config, document.getElementById('monaco-editor-root-42'));
    console.log('wrapper42 was started.');
};

const startWrapper43 = async () => {
    await wrapper43.start(wrapper43Config, document.getElementById('monaco-editor-root-43'));
    console.log('wrapper43 was started.');
};
const startWrapper44 = async () => {
    await wrapper44.start(wrapper44Config, document.getElementById('monaco-editor-root-44'));
    console.log('wrapper44 was started.');

};

const sleepOne = (milliseconds: number) => {
    setTimeout(async () => {
        alert(`Updating editors after ${milliseconds}ms`);

        wrapper42Config.languageClientConfig = undefined;
        const appConfig42 = wrapper42Config.wrapperConfig.editorAppConfig as EditorAppConfigClassic;
        appConfig42.languageId = 'javascript';
        appConfig42.useDiffEditor = false;
        appConfig42.code = `function logMe() {
    console.log('Hello swap editors!');
};`;
        const w42Start = wrapper42.start(wrapper42Config, document.getElementById('monaco-editor-root-42'));

        const w43Start = wrapper43.updateDiffModel({
            languageId: 'javascript',
            code: 'text 5678',
            codeOriginal: 'text 1234'
        });

        const appConfig44 = wrapper44Config.wrapperConfig.editorAppConfig as EditorAppConfigClassic;
        appConfig44.languageId = 'text/plain';
        appConfig44.useDiffEditor = true;
        appConfig44.codeOriginal = 'oh la la la!';
        appConfig44.code = 'oh lo lo lo!';
        // This affects all editors globally and is only effective
        // if it is not in contrast to one configured later
        appConfig44.theme = 'vs-light';
        const w44Start = wrapper44.start(wrapper44Config, document.getElementById('monaco-editor-root-44'));

        await w42Start;
        console.log('Restarted wrapper42.');
        await w43Start;
        console.log('Updated diffmodel of wrapper43.');
        await w44Start;
        console.log('Restarted wrapper44.');
    }, milliseconds);
};

const sleepTwo = (milliseconds: number) => {
    setTimeout(async () => {
        alert(`Updating last editor after ${milliseconds}ms`);

        const appConfig44 = wrapper44Config.wrapperConfig.editorAppConfig as EditorAppConfigClassic;
        appConfig44.useDiffEditor = false;
        appConfig44.theme = 'vs-dark';

        await wrapper44.start(wrapper44Config, document.getElementById('monaco-editor-root-44'));
        console.log('Restarted wrapper44.');
    }, milliseconds);
};

try {
    await startWrapper43();
    await startWrapper44();
    try {
        await startWrapper42();
    } catch (e) {
        console.log(`Catched expected connection error: ${(e as LanguageClientError).message}`);
    }

    // change the editors config, content or swap normal and diff editors after five seconds
    sleepOne(5000);

    // change last editor to regular mode
    sleepTwo(10000);
} catch (e) {
    console.error(e);
}

