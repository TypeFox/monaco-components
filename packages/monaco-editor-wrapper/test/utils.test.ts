import { describe, expect, test } from 'vitest';
import { createUrl } from '../src/utils.js';

describe('createUrl', () => {

    test('test createUrl: ws', () => {
        const url = createUrl({
            secured: false,
            host: 'localhost',
            port: 3000,
            path: 'sampleServer'
        });

        expect(url).toBe('ws://localhost:3000/sampleServer');
    });

    test('test createUrl: wss', () => {
        const url = createUrl({
            secured: true,
            host: 'localhost',
            port: 3000,
            path: 'sampleServer'
        });

        expect(url).toBe('wss://localhost:3000/sampleServer');
    });

    test('test createUrl: wss, no port, with path', () => {
        const url = createUrl({
            secured: true,
            host: 'localhost',
            path: 'sampleServer'
        });

        expect(url).toBe('wss://localhost/sampleServer');
    });

    test('test createUrl: wss, with port, no path', () => {
        const url = createUrl({
            secured: true,
            host: 'localhost',
            port: 3000
        });

        expect(url).toBe('wss://localhost:3000');
    });

    test('test createUrl: wss, no port, no path', () => {
        const url = createUrl({
            secured: true,
            host: 'localhost'
        });

        expect(url).toBe('wss://localhost');
    });

    test('test createUrl: ws, normalize port 80', () => {
        const url = createUrl({
            secured: false,
            host: 'localhost',
            port: 80
        });

        expect(url).toBe('ws://localhost');
    });

    test('test createUrl: ws, normalize port 80, with path', () => {
        const url = createUrl({
            secured: false,
            host: 'localhost',
            port: 80,
            path: 'sampleServer'
        });

        expect(url).toBe('ws://localhost/sampleServer');
    });

    test('test createUrl: optionsUrl: ws', () => {
        const url = createUrl({
            url: 'ws://localhost:3000/sampleServer'
        });

        expect(url).toBe('ws://localhost:3000/sampleServer');
    });

    test('test createUrl: optionsUrl: wss', () => {
        const url = createUrl({
            url: 'wss://localhost:3000/sampleServer'
        });

        expect(url).toBe('wss://localhost:3000/sampleServer');
    });

    test('test createUrl: optionsUrl, with port, no path', () => {
        const url = createUrl({
            url: 'wss://localhost:3000'
        });

        expect(url).toBe('wss://localhost:3000');
    });

    test('test createUrl: optionsUrl, no port, with path', () => {
        const url = createUrl({
            url: 'ws://localhost/sampleServer'
        });

        expect(url).toBe('ws://localhost/sampleServer');
    });

    test('test createUrl: optionsUrl, no port, no path', () => {
        const url = createUrl({
            url: 'wss://www.testme.com'
        });

        expect(url).toBe('wss://www.testme.com');
    });

    test('test createUrl: ws, normalize port 80', () => {
        const url = createUrl({
            url: 'ws://www.testme.com:80'
        });

        expect(url).toBe('ws://www.testme.com');
    });

    test('test createUrl: ws, normalize port 80, with path', () => {
        const url = createUrl({
            url: 'ws://www.testme.com:80/sampleServer'
        });

        expect(url).toBe('ws://www.testme.com/sampleServer');
    });

    test('test createUrl: ws, not proper url', () => {
        expect(() => createUrl({
            url: 'http://www.testme.com:80/sampleServer'
        })).toThrowError('This is not a proper websocket url: http://www.testme.com:80/sampleServer');
    });
});
