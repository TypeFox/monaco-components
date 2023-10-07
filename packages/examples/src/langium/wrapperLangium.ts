/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018-2022 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { setupLangiumClientExtended } from './config/wrapperLangiumExtended.js';
import { setupLangiumClientClassic } from './config/wrapperLangiumClassic.js';
import { buildWorkerDefinition } from 'monaco-editor-workers';

buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers/', new URL('', window.location.href).href, false);

let wrapper: MonacoEditorLanguageClientWrapper | undefined;

const htmlElement = document.getElementById('monaco-editor-root');
export const run = async () => {
    try {
        document.querySelector('#button-start-classic')?.addEventListener('click', startLangiumClientClassic);
        document.querySelector('#button-start-extended')?.addEventListener('click', startLangiumClientExtended);
        document.querySelector('#button-dispose')?.addEventListener('click', disposeEditor);
    } catch (e) {
        console.error(e);
    }
};

export const startLangiumClientExtended = async () => {
    try {
        if (checkStarted()) return;
        const config = await setupLangiumClientExtended();
        wrapper = new MonacoEditorLanguageClientWrapper();
        wrapper.start(config, htmlElement);
    } catch (e) {
        console.log(e);
    }
};

export const startLangiumClientClassic = async () => {
    try {
        if (checkStarted()) return;
        const config = await setupLangiumClientClassic();
        wrapper = new MonacoEditorLanguageClientWrapper();
        await wrapper.start(config, htmlElement!);
    } catch (e) {
        console.log(e);
    }
};

const checkStarted = () => {
    if (wrapper?.isStarted()) {
        alert('Editor was already started!\nPlease reload the page to test the alternative editor.');
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
