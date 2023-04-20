import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

import * as vscode from 'vscode';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { createLangiumGlobalConfig } from './langiumWrapperConfig.js';

const wrapper = new MonacoEditorLanguageClientWrapper();

const startEditor = async () => {
    if (wrapper.isStarted()) {
        alert('Editor was already started!');
        return;
    }
    const langiumGlobalConfig = await createLangiumGlobalConfig(document.getElementById('monaco-editor-root') as HTMLElement);
    await wrapper.start(langiumGlobalConfig);
    vscode.commands.getCommands().then((x) => {
        console.log('Currently registered # of vscode commands: ' + x.length);
    });
};

const disposeEditor = async () => {
    wrapper.reportStatus();
    await wrapper.dispose();
    console.log(wrapper.reportStatus().join('\n'));
};

try {
    document.querySelector('#button-start')?.addEventListener('click', startEditor);
    document.querySelector('#button-dispose')?.addEventListener('click', disposeEditor);

    startEditor();
} catch (e) {
    console.error(e);
}
