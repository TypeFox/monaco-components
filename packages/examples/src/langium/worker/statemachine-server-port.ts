import { start } from './startLanguageServer.js';

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = async (event: MessageEvent) => {
    const data = event.data;
    if (data.port) {
        start(data.port, 'statemachine-server-port');

        setTimeout(() => {
            // test independen communication
            self.postMessage('started');
        }, 1000);
    }
};
