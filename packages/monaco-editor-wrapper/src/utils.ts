import { WebSocketConfigOptions } from './wrapper.js';

export const createUrl = (config: WebSocketConfigOptions) => {
    const protocol = config.secured ? 'wss' : 'ws';
    let buildUrl = `${protocol}://${config.host}`;
    if (config.port) {
        if (config.port !== 80) {
            buildUrl += `:${config.port}`;
        }
    }
    if (config.path) {
        buildUrl += `/${config.path}`;
    }
    return buildUrl;
};
