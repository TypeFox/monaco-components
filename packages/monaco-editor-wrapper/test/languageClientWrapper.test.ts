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
                $type: 'WebSocketUrl',
                url: 'ws://localhost:3000/sampleServer'
            }
        };
        const languageClientWrapper = new LanguageClientWrapper(languageClientConfig);
        expect(languageClientWrapper.haveLanguageClientConfig()).toBeTruthy();
    });

    test('Only bad worker url', async () => {
        const prom = new Promise((_resolve, reject) => {
            const worker = new Worker('aBogusUrl');

            worker.onerror = () => {
                reject('error');
            };
        });
        await expect(prom).rejects.toEqual('error');
    });

    test('Start: bad worker url', async () => {
        const languageClientConfig: LanguageClientConfig = {
            options: {
                $type: 'WorkerConfig',
                url: new URL('http://localhost:63315'),
                type: 'classic'
            }
        };
        const languageClientWrapper = new LanguageClientWrapper(languageClientConfig);
        expect(languageClientWrapper.haveLanguageClientConfig()).toBeTruthy();
        await expect(languageClientWrapper.start()).rejects.toBe('languageClientWrapper (unnamed): Illegal worker configuration detected. Potentially the url is wrong.');
    });

});
