import { describe, expect, test } from 'vitest';
import { verifyUrlorCreateDataUrl } from 'monaco-editor-wrapper';

describe('Test EditorAppVscodeApi', () => {

    test('verifyUrlorCreateDataUrl: url', () => {
        const url = new URL('./editorVscodeApi.test.ts', import.meta.url);
        expect(verifyUrlorCreateDataUrl(url)).toBe(url.href);
    });

    test('verifyUrlorCreateDataUrl: url', async () => {
        const url = new URL('../../../node_modules/langium-statemachine-dsl/syntaxes/statemachine.tmLanguage.json', window.location.href);
        const text = await (await fetch(url)).text();
        expect(verifyUrlorCreateDataUrl(text)).toBe(`data:text/plain;base64,${btoa(text)}`);
    });

});
