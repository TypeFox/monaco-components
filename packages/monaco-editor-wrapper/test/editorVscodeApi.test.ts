import { describe, expect, test } from 'vitest';
import { EditorVscodeApi } from 'monaco-editor-wrapper';

describe('Test EditorAppVscodeApi', () => {

    test('verifyUrlorCreateDataUrl: url', () => {
        const url = new URL('./editorVscodeApi.test.ts', import.meta.url);
        expect(EditorVscodeApi.verifyUrlorCreateDataUrl(url)).toBe(url.href);
    });

    test('verifyUrlorCreateDataUrl: url', async () => {
        const url = new URL('../../../node_modules/langium-statemachine-dsl/syntaxes/statemachine.tmLanguage.json', window.location.href);
        const text = await (await fetch(url)).text();
        expect(EditorVscodeApi.verifyUrlorCreateDataUrl(text)).toBe(`data:text/plain;base64,${btoa(text)}`);
    });

});
