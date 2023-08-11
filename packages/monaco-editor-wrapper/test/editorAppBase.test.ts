import { describe, expect, test } from 'vitest';
import { isVscodeApiEditorApp } from 'monaco-editor-wrapper';
import { createWrapperConfig } from './helper.js';

describe('Test MonacoEditorLanguageClientWrapper', () => {

    test('isVscodeApiEditorApp: empty EditorAppConfigClassic', () => {
        const wrapperConfig = createWrapperConfig('classic');
        expect(isVscodeApiEditorApp(wrapperConfig)).toBeFalsy();
    });

    test('isVscodeApiEditorApp: empty EditorAppConfigVscodeApi', () => {
        const wrapperConfig = createWrapperConfig('vscodeApi');
        expect(isVscodeApiEditorApp(wrapperConfig)).toBeTruthy();
    });
});
