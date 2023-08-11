import { describe, expect, test } from 'vitest';
import { EditorAppClassic, MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';

import { buildWorkerDefinition } from 'monaco-editor-workers';
import { createBaseConfig, createMonacoEditorDiv } from './helper.js';
buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

describe('Test MonacoEditorLanguageClientWrapper', () => {

    test('New wrapper has undefined editor', () => {
        const wrapper = new MonacoEditorLanguageClientWrapper();
        expect(wrapper.getEditor()).toBeUndefined();
    });

    test('New wrapper has undefined diff editor', () => {
        const wrapper = new MonacoEditorLanguageClientWrapper();
        expect(wrapper.getDiffEditor()).toBeUndefined();
    });

    test('Check default values', async () => {
        createMonacoEditorDiv();
        const wrapper = new MonacoEditorLanguageClientWrapper();
        await wrapper.start(createBaseConfig('classic'));

        const app = wrapper.getMonacoEditorApp() as EditorAppClassic;
        expect(app).toBeDefined();
        expect(app.getAppType()).toBe('classic');

        const appConfig = app.getConfig();
        expect(appConfig.automaticLayout).toBeTruthy();
        expect(appConfig.theme).toBe('vs-light');
    });
});
