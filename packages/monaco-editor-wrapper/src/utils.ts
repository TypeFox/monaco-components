import { WebSocketConfigOptions, WebSocketConfigOptionsUrl } from './wrapper.js';

export const createUrl = (config: WebSocketConfigOptions | WebSocketConfigOptionsUrl) => {
    let buildUrl = '';
    if ((config as WebSocketConfigOptionsUrl).url) {
        const options = config as WebSocketConfigOptionsUrl;
        if (!options.url.startsWith('ws://') && !options.url.startsWith('wss://')) {
            throw new Error(`This is not a proper websocket url: ${options.url}`);
        }
        options.url = options.url.replace(':80', '');
        buildUrl = options.url;
    } else {
        const options = config as WebSocketConfigOptions;
        const protocol = options.secured ? 'wss' : 'ws';
        buildUrl = `${protocol}://${options.host}`;
        if (options.port) {
            if (options.port !== 80) {
                buildUrl += `:${options.port}`;
            }
        }
        if (options.path) {
            buildUrl += `/${options.path}`;
        }
    }
    return buildUrl;
};
