import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);
import { monaco, vscode, MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper/allLanguages';

// helper functions for adding monaco styles with embedded codicon TTF
MonacoEditorLanguageClientWrapper.addMonacoStyles('monaco-editor-styles');
const client = new MonacoEditorLanguageClientWrapper();

const languageId = 'typescript';
let codeMain = `function sayHello(): string {
    return "Hello";
};`;
let codeDiff = `function sayGoodbye(): string {
    return "Goodbye";
};`;
let toggleDiff = true;

function startEditor() {
    if (client.isStarted()) {
        alert('Editor was already started!');
        return;
    }

    const editorConfig = client.getEditorConfig();
    editorConfig.setMainLanguageId(languageId);
    editorConfig.setMainCode(codeMain);
    editorConfig.setTheme('vs-dark');

    editorConfig.setMonacoEditorOptions({
        glyphMargin: true,
        guides: {
            bracketPairs: true
        },
        lightbulb: {
            enabled: true
        },
    });

    client.startEditor(document.getElementById('monaco-editor-root') as HTMLElement)
        .then((s: unknown) => {
            console.log(s);
            logEditorInfo(client);
            toggleSwapDiffButton(true);

            vscode.commands.getCommands().then((x) => {
                console.log('Currently registered # of vscode commands: ' + x.length);
            });
        })
        .catch((e: Error) => console.error(e));
}

function swapEditors() {
    const editorConfig = client.getEditorConfig();
    updateCode();
    editorConfig.setUseDiffEditor(toggleDiff);
    editorConfig.setMainLanguageId(languageId);
    editorConfig.setMainCode(codeMain);
    editorConfig.setDiffLanguageId(languageId);
    editorConfig.setDiffCode(codeDiff);

    client.startEditor(document.getElementById('monaco-editor-root') as HTMLElement)
        .then((s: string) => {
            toggleDiff = !toggleDiff;
            console.log(s);
            logEditorInfo(client);
        })
        .catch((e: Error) => console.error(e));
}

async function disposeEditor() {
    toggleSwapDiffButton(false);
    client.reportStatus();
    updateCode();
    await client.dispose()
        .then(() => {
            client.reportStatus();
        });
}

function toggleSwapDiffButton(enabled: boolean) {
    const button = document.getElementById('button-swap') as HTMLButtonElement;
    if (button !== null) {
        button.disabled = !enabled;
    }
}

function updateCode() {
    const main = client.getMainCode();
    const diff = client.getDiffCode();
    if (main) {
        codeMain = main;
    }
    if (diff) {
        codeDiff = diff;
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
