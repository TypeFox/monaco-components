import * as vscode from 'vscode';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { createLangiumGlobalConfig } from './config/wrapperStatemachineConfig.js';

import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

const wrapper = new MonacoEditorLanguageClientWrapper();
const wrapper2 = new MonacoEditorLanguageClientWrapper();

const startEditor = async () => {
    if (wrapper.isStarted() && wrapper2.isStarted()) {
        alert('Editor was already started!');
        return;
    }
    const langiumGlobalConfig = await createLangiumGlobalConfig(document.getElementById('monaco-editor-root') as HTMLElement);
    await wrapper.start(langiumGlobalConfig);
    const langiumGlobalConfig2 = await createLangiumGlobalConfig(document.getElementById('monaco-editor-root2') as HTMLElement);
    await wrapper2.start(langiumGlobalConfig2);

    vscode.commands.getCommands().then((x) => {
        console.log('Currently registered # of vscode commands: ' + x.length);
    });
};

const disposeEditor = async () => {
    wrapper.reportStatus();
    await wrapper.dispose();
    console.log(wrapper.reportStatus().join('\n'));

    wrapper2.reportStatus();
    await wrapper2.dispose();
    console.log(wrapper2.reportStatus().join('\n'));
};

try {
    document.querySelector('#button-start')?.addEventListener('click', startEditor);
    document.querySelector('#button-dispose')?.addEventListener('click', disposeEditor);

    startEditor();
} catch (e) {
    console.error(e);
}

export const loadStatemachinWorker = () => {
    // Language Server preparation
    const workerUrl = new URL('./dist/worker/statemachineServerWorker.js', window.location.href);
    console.log(`Langium worker URL: ${workerUrl}`);

    return new Worker(workerUrl, {
        type: 'module',
        name: 'Statemachine LS',
    });
};
