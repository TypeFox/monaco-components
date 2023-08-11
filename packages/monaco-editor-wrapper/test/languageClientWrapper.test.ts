import { describe, expect, test } from 'vitest';
import { LanguageClientConfig, LanguageClientWrapper } from 'monaco-editor-wrapper';

describe('Test LanguageClientWrapper', () => {

    test('Not Running after construction', () => {
        const languageClientWrapper = new LanguageClientWrapper();
        expect(languageClientWrapper.haveLanguageClient()).toBeFalsy();
        expect(languageClientWrapper.haveLanguageClientConfig()).toBeFalsy();
        expect(languageClientWrapper.isStarted()).toBeFalsy();
    });

    test('Start: no config', async () => {
        const languageClientWrapper = new LanguageClientWrapper();
        expect(async () => {
            await languageClientWrapper.start();
        }).rejects.toEqual('Unable to start monaco-languageclient. No configuration was provided.');
    });

    test('Start: config', async () => {
        const languageClientConfig: LanguageClientConfig = {
            options: {
                configType: 'WebSocketUrl',
                url: 'ws://localhost:3000/sampleServer'
            }
        };
        const languageClientWrapper = new LanguageClientWrapper(languageClientConfig);
        expect(languageClientWrapper.haveLanguageClientConfig()).toBeTruthy();
    });

});
