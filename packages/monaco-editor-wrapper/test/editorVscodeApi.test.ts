import { describe, expect, test } from 'vitest';
import { EditorAppVscodeApi } from 'monaco-editor-wrapper';

describe('Test EditorAppVscodeApi', () => {

    test('verifyUrlorCreateDataUrl: url', () => {
        const url = new URL('./editorVscodeApi.test.ts', import.meta.url);
        expect(EditorAppVscodeApi.verifyUrlorCreateDataUrl(url)).toBe(url.href);
    });

});
