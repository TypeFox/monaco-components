import { describe, expect, test } from 'vitest';
import { isVscodeApi } from '../src/editor.js';
import { WrapperConfig } from '../src/wrapper.js';
import { EditorClassic } from '../src/editorClassic.js';
import { EditorVscodeApi } from '../src/editorVscodeApi.js';

describe('Test MonacoEditorLanguageClientWrapper', () => {

    test('isVscodeApi: undefined => false', () => {
        const wrapperConfig = {};
        expect(isVscodeApi(wrapperConfig)).toBeFalsy();
    });

    test('isVscodeApi: empty EditorAppConfigClassic', () => {
        const wrapperConfig: WrapperConfig = {
            editorAppConfig: {
                editorAppType: 'classic'
            }
        };
        expect(isVscodeApi(wrapperConfig)).toBeFalsy();
    });

    test('isVscodeApi: empty EditorAppConfigClassic with helperfunction', () => {
        const wrapperConfig: WrapperConfig = {
            editorAppConfig: EditorClassic.createEmptyConfig()
        };
        expect(isVscodeApi(wrapperConfig)).toBeFalsy;
    });

    test('isVscodeApi: empty EditorAppConfigVscodeApi', () => {
        const wrapperConfig: WrapperConfig = {
            editorAppConfig: {
                editorAppType: 'vscodeApi'
            }
        };
        expect(isVscodeApi(wrapperConfig)).toBeTruthy();
    });

    test('isVscodeApi: empty EditorAppConfigVscodeApi with helperfunction', () => {
        const wrapperConfig: WrapperConfig = {
            editorAppConfig: EditorVscodeApi.createEmptyConfig()
        };
        expect(isVscodeApi(wrapperConfig)).toBeFalsy;
    });

});
