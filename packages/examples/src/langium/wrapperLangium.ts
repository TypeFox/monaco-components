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
    const langiumGlobalConfig = await createLangiumGlobalConfig();
    wrapper.init(langiumGlobalConfig);

    wrapper.startEditor(document.getElementById('monaco-editor-root') as HTMLElement)
        .then((s: unknown) => {
            console.log(s);

            vscode.commands.getCommands().then((x) => {
                console.log('Currently registered # of vscode commands: ' + x.length);
            });
        })
        .catch((e: Error) => console.error(e));
};

const disposeEditor = async () => {
    wrapper.reportStatus();
    await wrapper.dispose()
        .then(() => {
            console.log(wrapper.reportStatus().join('\n'));
        })
        .catch((e: Error) => console.error(e));
};

document.querySelector('#button-start')?.addEventListener('click', startEditor);
document.querySelector('#button-dispose')?.addEventListener('click', disposeEditor);

startEditor();
