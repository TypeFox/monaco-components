import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver/browser.js';

// helper functions for adding Codicon TTF to document and monaco styles to head
MonacoEditorLanguageClientWrapper.addMonacoStyles('monaco-editor-styles');
MonacoEditorLanguageClientWrapper.addCodiconTtf();
const client = new MonacoEditorLanguageClientWrapper();

const languageId = 'plaintext';
const codeMain = `#ff0000 (red)
#00ff00 (green)
#0000ff (blue)`;
const codeDiff = `#ffff00 (yellow)
#00ff00 (green)
#0000ff (blue)`;
let toggleDiff = true;

function startEditor() {
    if (client.isStarted()) {
        alert('Editor was already started!');
        return;
    }

    const editorConfig = client.getEditorConfig();
    editorConfig.setLanguageExtensionConfig({
        id: 'plaintext',
        extensions: ['.txt'],
        aliases: ['PLAINTEXT', 'plaintext'],
        mimetypes: ['text/plain']
    });
    editorConfig.setMainLanguageId(languageId);
    editorConfig.setMainCode(codeMain);
    editorConfig.setTheme('vs-dark');

    editorConfig.setUseLanguageClient(true);
    editorConfig.setUseWebSocket(false);
    const workerURL = new URL('./src/serverWorker.ts', window.location.href).href;
    console.log(workerURL);

    const lsWorker = new Worker(workerURL, {
        type: 'module',
        name: 'LS'
    });

    // test if external creation works
    const reader = new BrowserMessageReader(lsWorker);
    const writer = new BrowserMessageWriter(lsWorker);
    client.setWorker(lsWorker, { reader: reader, writer: writer });

    client.startEditor(document.getElementById('monaco-editor-root') as HTMLElement)
        .then((s: unknown) => {
            console.log(s);
            console.log(`# of configured languages: ${client.getMonaco().languages.getLanguages().length}`);
        })
        .catch((e: Error) => console.error(e));

    // provoke a too early dispose
    setTimeout(() => {
        client.dispose()
            .then((s: unknown) => console.log(s))
            .catch((e: Error) => {
                console.log('The next error is expected behaviour as it was provoked:');
                console.error(e);
            });
    }, 10);
}

function swapEditors() {
    const editorConfig = client.getEditorConfig();
    editorConfig.setUseDiffEditor(toggleDiff);
    editorConfig.setMainLanguageId(languageId);
    editorConfig.setMainCode(codeMain);
    editorConfig.setDiffLanguageId(languageId);
    editorConfig.setDiffCode(codeDiff);

    client.swapEditors(document.getElementById('monaco-editor-root') as HTMLElement)
        .then((s: string) => {
            toggleDiff = !toggleDiff;
            console.log(s);
        })
        .catch((e: Error) => console.error(e));
}

async function disposeEditor() {
    client.reportStatus();
    await client.dispose()
        .then(() => {
            client.reportStatus();
        });
}

document.querySelector('#button-start')?.addEventListener('click', startEditor);
document.querySelector('#button-swap')?.addEventListener('click', swapEditors);
document.querySelector('#button-dispose')?.addEventListener('click', disposeEditor);

startEditor();
