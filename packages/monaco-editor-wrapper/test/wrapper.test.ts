import { describe, expect, test } from 'vitest';
import { EditorAppClassic, MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { createBaseConfig, createMonacoEditorDiv } from './helper.js';
import { buildWorkerDefinition } from 'monaco-editor-workers';

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
        await wrapper.start(createBaseConfig('classic'), document.getElementById('monaco-editor-root'));

        const app = wrapper.getMonacoEditorApp() as EditorAppClassic;
        expect(app).toBeDefined();

        const appConfig = app.getConfig();
        expect(appConfig.automaticLayout).toBeTruthy();
        expect(appConfig.theme).toBe('vs-light');
    });

    test('No HTML in Userconfig', async () => {
        createMonacoEditorDiv();
        const wrapper = new MonacoEditorLanguageClientWrapper();
        await expect(async () => {
            await wrapper.start(createBaseConfig('classic'), null);
        }).rejects.toThrowError('No HTMLElement provided for monaco-editor.');
    });
});
