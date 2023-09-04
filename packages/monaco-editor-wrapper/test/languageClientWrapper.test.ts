import { describe, expect, test } from 'vitest';
import { LanguageClientConfig, LanguageClientWrapper } from 'monaco-editor-wrapper';

describe('Test LanguageClientWrapper', () => {

    test('Not Running after construction', () => {
        const languageClientWrapper = new LanguageClientWrapper();
        expect(languageClientWrapper.haveLanguageClient()).toBeFalsy();
        expect(languageClientWrapper.haveLanguageClientConfig()).toBeFalsy();
        expect(languageClientWrapper.isStarted()).toBeFalsy();
    });

    test('Constructor: no config', async () => {
        const languageClientWrapper = new LanguageClientWrapper();
        expect(async () => {
            await languageClientWrapper.start();
        }).rejects.toEqual({
            message: 'languageClientWrapper (undefined): Unable to start monaco-languageclient. No configuration was provided.',
            error: 'No error was provided.'
        });
    });

    test('Dispose: direct worker is cleaned up afterwards', async () => {

        /**
         * Helper to generate a quick worker from a function blob
         */
        function createWorkerFromFunction(fn: () => void): Worker {
            return new Worker(URL.createObjectURL(
                new Blob([`(${fn.toString()})()`], { type: 'application/javascript' })
            ));
        }

        // create a web worker to pass to the wrapper
        const worker = createWorkerFromFunction(() => {
            console.info('Hello');
        });

        // setup the wrapper
        const languageClientWrapper = new LanguageClientWrapper({
            options: {
                $type: 'WorkerDirect',
                worker
            }
        });

        // start up & verify (don't wait for start to finish, just roll past it, we only care about the worker)
        languageClientWrapper.start();
        expect(languageClientWrapper.getWorker()).toBeTruthy();

        // dispose & verify
        languageClientWrapper.disposeLanguageClient();
        expect(languageClientWrapper.getWorker()).toBeUndefined();
        // no further way to verify post-terminate, but the worker should be disposed once no longer present
    });

    test('Constructor: config', async () => {
        const languageClientConfig: LanguageClientConfig = {
            options: {
                $type: 'WebSocketUrl',
                url: 'ws://localhost:12345/Tester'
            }
        };
        const languageClientWrapper = new LanguageClientWrapper(languageClientConfig);
        expect(languageClientWrapper.haveLanguageClientConfig()).toBeTruthy();
    });

    test('Start: unreachable url', async () => {
        const languageClientConfig: LanguageClientConfig = {
            options: {
                $type: 'WebSocketUrl',
                url: 'ws://localhost:12345/Tester',
                name: 'test-unreachable'
            }
        };
        const languageClientWrapper = new LanguageClientWrapper(languageClientConfig);
        expect(languageClientWrapper.haveLanguageClientConfig()).toBeTruthy();
        await expect(languageClientWrapper.start()).rejects.toEqual({
            message: 'languageClientWrapper (test-unreachable): Websocket connection failed.',
            error: 'No error was provided.'
        });
    });

    test('Only unreachable worker url', async () => {
        const prom = new Promise((_resolve, reject) => {
            const worker = new Worker('aBogusUrl');

            worker.onerror = () => {
                reject('error');
            };
        });
        await expect(prom).rejects.toEqual('error');
    });

    test('Start: unreachable worker url', async () => {
        const languageClientConfig: LanguageClientConfig = {
            options: {
                $type: 'WorkerConfig',
                url: new URL('http://localhost:63315'),
                type: 'classic'
            }
        };
        const languageClientWrapper = new LanguageClientWrapper(languageClientConfig);
        expect(languageClientWrapper.haveLanguageClientConfig()).toBeTruthy();
        await expect(languageClientWrapper.start()).rejects.toEqual({
            message: 'languageClientWrapper (unnamed): Illegal worker configuration detected. Potentially the url is wrong.',
            error: 'No error was provided.'
        });
    });

});
