import { describe, expect, test } from 'vitest';
import { MonacoEditorLanguageClientWrapper } from '../src/wrapper.js';

describe('Test MonacoEditorLanguageClientWrapper', () => {

    const wrapper = new MonacoEditorLanguageClientWrapper();

    test('New wrapper has undefined editor', () => {
        expect(wrapper.getEditor()).toBeUndefined();
    });

    test('New wrapper has undefined diff editor', () => {
        expect(wrapper.getDiffEditor()).toBeUndefined();
    });

});
