import { describe, expect, test } from 'vitest';
import { MonacoEditorLanguageClientWrapper, UserConfig } from 'monaco-editor-wrapper';

import { buildWorkerDefinition } from 'monaco-editor-workers';
buildWorkerDefinition('../../../node_modules/monaco-editor-workers/dist/workers', import.meta.url, false);

const createMonacoEditorDiv = () => {
    const div = document.createElement('div');
    div.id = 'monaco-editor-root';
    document.body.insertAdjacentElement('beforeend', div);
};

const createBaseConfig = (): UserConfig => {
    return {
        htmlElement: document.getElementById('monaco-editor-root') as HTMLElement,
        wrapperConfig: {},
        languageClientConfig: {
            enabled: false
        },
        editorContentConfig: {
            languageId: 'typescript',
            code: '',
            useDiffEditor: false
        }
    };
};

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
        await wrapper.start(createBaseConfig());
        expect(wrapper.getMonacoEditorApp()?.getEditorConfig().automaticLayout).toBeTruthy();
        expect(wrapper.getMonacoEditorApp()?.getEditorConfig().theme).toBe('vs-light');
        expect(wrapper.getMonacoEditorApp()?.getAppType()).toBe('classic');
    });
});
