/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018-2022 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { buildWorkerDefinition } from 'monaco-editor-workers';
import 'vscode/default-extensions/theme-defaults';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { setupLangiumClientVscodeApi } from './config/wrapperLangiumVscode.js';
import { setupLangiumClientClassic } from './config/wrapperLangiumClassic.js';

buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers/', new URL('', window.location.href).href, false);

let wrapper: MonacoEditorLanguageClientWrapper | undefined;

export const run = async () => {
    try {
        document.querySelector('#button-start-classic')?.addEventListener('click', async () => {
            await startLangiumClientClassic();
        });
        document.querySelector('#button-start-vscode-api')?.addEventListener('click', async () => {
            await startLangiumClientVscodeApi();
        });
        document.querySelector('#button-dispose')?.addEventListener('click', async () => {
            await disposeEditor();
        });
    } catch (e) {
        console.error(e);
    }
};

export const startLangiumClientVscodeApi = async () => {
    try {
        if (checkStarted()) return;
        const config = await setupLangiumClientVscodeApi();
        wrapper = new MonacoEditorLanguageClientWrapper();
        wrapper.start(config);
    } catch (e) {
        console.log(e);
    }
};

export const startLangiumClientClassic = async () => {
    try {
        if (checkStarted()) return;
        const config = await setupLangiumClientClassic();
        wrapper = new MonacoEditorLanguageClientWrapper();
        wrapper.start(config);
    } catch (e) {
        console.log(e);
    }
};

const checkStarted = () => {
    if (wrapper?.isStarted()) {
        alert('Editor was already started!');
        return true;
    }
    return false;
};

export const disposeEditor = async () => {
    if (!wrapper) return;
    wrapper.reportStatus();
    await wrapper.dispose();
    wrapper = undefined;
};

export const loadLangiumWorker = () => {
    // Language Server preparation
    const workerUrl = new URL('./src/servers/langium-server.ts', window.location.href);
    console.log(`Langium worker URL: ${workerUrl}`);

    return new Worker(workerUrl, {
        type: 'module',
        name: 'Langium LS',
    });
};
