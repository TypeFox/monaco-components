import { describe, expect, test } from 'vitest';
import { WebSocketConfigOptions, WebSocketConfigOptionsUrl, createUrl } from 'monaco-editor-wrapper';

describe('createUrl', () => {

    test('test createUrl: ws', () => {
        const url = createUrl({
            secured: false,
            host: 'localhost',
            port: 30000,
            path: 'sampleServer'
        } as WebSocketConfigOptions);

        expect(url).toBe('ws://localhost:30000/sampleServer');
    });

    test('test createUrl: wss', () => {
        const url = createUrl({
            secured: true,
            host: 'localhost',
            port: 30000,
            path: 'sampleServer'
        } as WebSocketConfigOptions);

        expect(url).toBe('wss://localhost:30000/sampleServer');
    });

    test('test createUrl: wss, no port, with path', () => {
        const url = createUrl({
            secured: true,
            host: 'localhost',
            path: 'sampleServer'
        } as WebSocketConfigOptions);

        expect(url).toBe('wss://localhost/sampleServer');
    });

    test('test createUrl: wss, with port, no path', () => {
        const url = createUrl({
            secured: true,
            host: 'localhost',
            port: 30000
        } as WebSocketConfigOptions);

        expect(url).toBe('wss://localhost:30000');
    });

    test('test createUrl: wss, no port, no path', () => {
        const url = createUrl({
            secured: true,
            host: 'localhost'
        } as WebSocketConfigOptions);

        expect(url).toBe('wss://localhost');
    });

    test('test createUrl: ws, normalize port 80', () => {
        const url = createUrl({
            secured: false,
            host: 'localhost',
            port: 80
        } as WebSocketConfigOptions);

        expect(url).toBe('ws://localhost');
    });

    test('test createUrl: ws, normalize port 80, with path', () => {
        const url = createUrl({
            secured: false,
            host: 'localhost',
            port: 80,
            path: 'sampleServer'
        } as WebSocketConfigOptions);

        expect(url).toBe('ws://localhost/sampleServer');
    });

    test('test createUrl: optionsUrl: ws', () => {
        const url = createUrl({
            url: 'ws://localhost:30000/sampleServer'
        } as WebSocketConfigOptionsUrl);

        expect(url).toBe('ws://localhost:30000/sampleServer');
    });

    test('test createUrl: optionsUrl: wss', () => {
        const url = createUrl({
            url: 'wss://localhost:30000/sampleServer'
        } as WebSocketConfigOptionsUrl);

        expect(url).toBe('wss://localhost:30000/sampleServer');
    });

    test('test createUrl: optionsUrl, with port, no path', () => {
        const url = createUrl({
            url: 'wss://localhost:30000'
        } as WebSocketConfigOptionsUrl);

        expect(url).toBe('wss://localhost:30000');
    });

    test('test createUrl: optionsUrl, no port, with path', () => {
        const url = createUrl({
            url: 'ws://localhost/sampleServer'
        } as WebSocketConfigOptionsUrl);

        expect(url).toBe('ws://localhost/sampleServer');
    });

    test('test createUrl: optionsUrl, no port, no path', () => {
        const url = createUrl({
            url: 'wss://www.testme.com'
        } as WebSocketConfigOptionsUrl);

        expect(url).toBe('wss://www.testme.com');
    });

    test('test createUrl: ws, not proper url', () => {
        expect(() => createUrl({
            url: 'http://www.testme.com:30000/sampleServer'
        } as WebSocketConfigOptionsUrl)).toThrowError('This is not a proper websocket url: http://www.testme.com:30000/sampleServer');
    });

});
