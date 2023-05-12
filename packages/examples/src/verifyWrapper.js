//import langauges export to get the wrapper with all languages
import { MonacoEditorLanguageClientWrapper } from '../libs/monaco-editor-wrapper/indexAllLanguages.js';
import { buildWorkerDefinition } from '../libs/monaco-editor-workers/index.js';
buildWorkerDefinition('../libs/monaco-editor-workers/workers', import.meta.url, false);

const wrapper42 = new MonacoEditorLanguageClientWrapper();
const startWrapper42 = () => {
    wrapper42.init({
        id: '42',
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
            languageId: 'javascript',
            useDiffEditor: true,
            theme: 'vs-dark',
            automaticLayout: true,
            code: `function logOriginal() {
    console.log('Hello original editor!');
};`,
            codeModified: `function logModified() {
    console.log('Hello modified editor!');
};`
        }
    });
    wrapper42.startEditor(document.getElementById('monaco-editor-root'));
};

startWrapper42();
