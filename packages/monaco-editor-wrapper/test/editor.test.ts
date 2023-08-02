import { describe, expect, test } from 'vitest';
import { isVscodeApiEditorApp, EditorAppClassic, EditorAppVscodeApi, WrapperConfig } from 'monaco-editor-wrapper';

describe('Test MonacoEditorLanguageClientWrapper', () => {

    test('isVscodeApiEditorApp: undefined => false', () => {
        const wrapperConfig = {};
        expect(isVscodeApiEditorApp(wrapperConfig)).toBeFalsy();
    });

    test('isVscodeApiEditorApp: empty EditorAppConfigClassic', () => {
        const wrapperConfig: WrapperConfig = {
            editorAppConfig: {
                editorAppType: 'classic'
            }
        };
        expect(isVscodeApiEditorApp(wrapperConfig)).toBeFalsy();
    });

    test('isVscodeApiEditorApp: empty EditorAppConfigClassic with helperfunction', () => {
        const wrapperConfig: WrapperConfig = {
            editorAppConfig: EditorAppClassic.createEmptyConfig()
        };
        expect(isVscodeApiEditorApp(wrapperConfig)).toBeFalsy;
    });

    test('isVscodeApiEditorApp: empty EditorAppConfigVscodeApi', () => {
        const wrapperConfig: WrapperConfig = {
            editorAppConfig: {
                editorAppType: 'vscodeApi'
            }
        };
        expect(isVscodeApiEditorApp(wrapperConfig)).toBeTruthy();
    });

    test('isVscodeApiEditorApp: empty EditorAppConfigVscodeApi with helperfunction', () => {
        const wrapperConfig: WrapperConfig = {
            editorAppConfig: EditorAppVscodeApi.createEmptyConfig()
        };
        expect(isVscodeApiEditorApp(wrapperConfig)).toBeFalsy;
    });

});
