import { describe, expect, test } from 'vitest';
import { EditorAppClassic, isVscodeApiEditorApp } from 'monaco-editor-wrapper';
import { createBaseConfig, createWrapperConfig } from './helper.js';

describe('Test EditorAppBase', () => {

    test('isVscodeApiEditorApp: empty EditorAppConfigClassic', () => {
        const wrapperConfig = createWrapperConfig('classic');
        expect(isVscodeApiEditorApp(wrapperConfig)).toBeFalsy();
    });

    test('isVscodeApiEditorApp: empty EditorAppConfigVscodeApi', () => {
        const wrapperConfig = createWrapperConfig('vscodeApi');
        expect(isVscodeApiEditorApp(wrapperConfig)).toBeTruthy();
    });

    test('config defaults', () => {
        const config = createBaseConfig('classic');
        const app = new EditorAppClassic('config defaults', config);
        expect(app.getConfig().languageId).toEqual('typescript');
        expect(app.getConfig().code).toEqual('');
        expect(app.getConfig().codeOriginal).toEqual('');
        expect(app.getConfig().useDiffEditor).toBeFalsy();
        expect(app.getConfig().codeUri).toBeUndefined();
        expect(app.getConfig().codeOriginalUri).toBeUndefined();
        expect(app.getConfig().readOnly).toBeFalsy();
        expect(app.getConfig().domReadOnly).toBeFalsy();
        expect(app.getConfig().userConfiguration?.json).toEqual('{}');
    });

    test('config userConfiguration', () => {
        const config = createBaseConfig('classic');
        config.wrapperConfig.editorAppConfig.userConfiguration = {
            json: '{ "editor.semanticHighlighting.enabled": true }'
        };
        const app = new EditorAppClassic('config defaults', config);
        expect(app.getConfig().userConfiguration?.json).toEqual('{ "editor.semanticHighlighting.enabled": true }');
    });
});
