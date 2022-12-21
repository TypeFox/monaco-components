import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);
import { monaco, vscode, MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver/browser.js';

const client = new MonacoEditorLanguageClientWrapper();

const languageId = 'plaintext';
let codeMain = `#ff0000 (red)
#00ff00 (green)
#0000ff (blue)`;
const codeOrg = `#ffff00 (yellow)
#00ff00 (green)
#0000ff (blue)`;
let useDiffEditor = true;

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
    configureCodeEditors();
    editorConfig.setTheme('vs-dark');

    editorConfig.setUseLanguageClient(true);
    editorConfig.setUseWebSocket(false);
    const monacoEditorConfig = {
        glyphMargin: true,
        guides: {
            bracketPairs: true
        },
        lineHeight: 30,
        lightbulb: {
            enabled: true
        },
    };
    editorConfig.setMonacoEditorOptions(monacoEditorConfig);
    editorConfig.setMonacoDiffEditorOptions(monacoEditorConfig);
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

    toggleSwapDiffButton(true);
    client.startEditor(document.getElementById('monaco-editor-root') as HTMLElement)
        .then((s: unknown) => {
            console.log(s);
            logEditorInfo(client);
            client.getMessageTransports()?.reader?.listen(x => console.log(x));

            vscode.commands.getCommands().then((x) => {
                console.log('Currently registered # of vscode commands: ' + x.length);
            });
        })
        .catch((e: Error) => console.error(e));
}

function configureCodeEditors() {
    const editorConfig = client.getEditorConfig();
    editorConfig.setUseDiffEditor(useDiffEditor);
    if (useDiffEditor) {
        editorConfig.setMainLanguageId(languageId);
        editorConfig.setMainCode(codeOrg);
        editorConfig.setDiffLanguageId(languageId);
        editorConfig.setDiffCode(codeMain);
    } else {
        editorConfig.setMainLanguageId(languageId);
        editorConfig.setMainCode(codeMain);
    }
}

function saveMainCode(saveFromDiff: boolean, saveFromMain: boolean) {
    if (saveFromDiff) {
        codeMain = client.getDiffCode()!;
    }
    if (saveFromMain) {
        codeMain = client.getMainCode()!;
    }
}

function swapEditors() {
    useDiffEditor = !useDiffEditor;
    saveMainCode(!useDiffEditor, false);
    configureCodeEditors();

    client.startEditor(document.getElementById('monaco-editor-root') as HTMLElement)
        .then((s: string) => {
            console.log(s);
            logEditorInfo(client);
        })
        .catch((e: Error) => console.error(e));
}

async function disposeEditor() {
    client.reportStatus();
    toggleSwapDiffButton(false);
    saveMainCode(useDiffEditor, !useDiffEditor);
    await client.dispose()
        .then(() => {
            console.log(client.reportStatus().join('\n'));
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
    console.log(`# of configured languages: ${monaco.languages.getLanguages().length}`);
    console.log(`Main code: ${client.getMainCode()}`);
    console.log(`Modified code: ${client.getDiffCode()}`);
}

document.querySelector('#button-start')?.addEventListener('click', startEditor);
document.querySelector('#button-swap')?.addEventListener('click', swapEditors);
document.querySelector('#button-dispose')?.addEventListener('click', disposeEditor);

startEditor();
