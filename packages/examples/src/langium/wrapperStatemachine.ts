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

    // init first worker regularly
    const stateMachineWorkerRegular = loadStatemachinWorkerRegular();
    const langiumGlobalConfig = await createLangiumGlobalConfig(stateMachineWorkerRegular);
    await wrapper.initAndStart(langiumGlobalConfig, document.getElementById('monaco-editor-root'));

    // init second worker with port for client and worker
    const stateMachineWorkerPort = loadStatemachinWorkerPort();
    // use callback to receive message back from worker independent of the message channel the LSP is using
    stateMachineWorkerPort.onmessage = (event) => {
        console.log('Received message from worker: ' + event.data);
    };
    const channel = new MessageChannel();
    stateMachineWorkerPort.postMessage({
        port: channel.port2
    }, [channel.port2]);

    const langiumGlobalConfig2 = await createLangiumGlobalConfig(stateMachineWorkerPort, channel.port1);
    await wrapper2.initAndStart(langiumGlobalConfig2, document.getElementById('monaco-editor-root2'));

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

export const run = async () => {
    try {
        document.querySelector('#button-start')?.addEventListener('click', startEditor);
        document.querySelector('#button-dispose')?.addEventListener('click', disposeEditor);
    } catch (e) {
        console.error(e);
    }
};

export const loadStatemachinWorkerRegular = () => {
    // Language Server preparation
    const workerUrl = new URL('./src/langium/worker/statemachine-server.ts', window.location.href);
    console.log(`Langium worker URL: ${workerUrl}`);

    return new Worker(workerUrl, {
        type: 'module',
        name: 'Statemachine Server Regular',
    });
};

export const loadStatemachinWorkerPort = () => {
    // Language Server preparation
    const workerUrl = new URL('./src/langium/worker/statemachine-server-port.ts', window.location.href);
    console.log(`Langium worker URL: ${workerUrl}`);

    return new Worker(workerUrl, {
        type: 'module',
        name: 'Statemachine Server Port',
    });
};
