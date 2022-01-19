import { MonacoLanguageClient, MessageConnection, CloseAction, ErrorAction, MonacoServices, createConnection } from '@codingame/monaco-languageclient';

import * as monaco from 'monaco-editor-core';
import { listen } from '@codingame/monaco-jsonrpc';
import normalizeUrl from 'normalize-url';

import { WebSocketConf } from './main';

export class MonacoLanguageClientWrapper {

    installMonaco() {
        // install Monaco language client services
        if (monaco) MonacoServices.install(monaco);
        return this;
    }

    establishWebSocket(websocketConfig: WebSocketConf) {
        // create the web socket
        const url = this.createUrl(websocketConfig);
        const webSocket = new WebSocket(url);
        /*
                new ReconnectingWebSocket(url, [], {
                    maxReconnectionDelay: 10000,
                    minReconnectionDelay: 1000,
                    reconnectionDelayGrowFactor: 1.3,
                    connectionTimeout: 10000,
                    maxRetries: Infinity,
                    debug: false
                });
        */
        // listen when the web socket is opened
        listen({
            webSocket,
            onConnection: connection => {
                console.log('Connected');

                // create and start the language client
                const languageClient = this.createLanguageClient(connection);
                const disposable = languageClient.start();
                connection.onClose(() => disposable.dispose());
            }
        });

        return this;
    }

    private createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
        return new MonacoLanguageClient({
            name: 'Sample Language Client',
            clientOptions: {
                // use a language id as a document selector
                documentSelector: ['json'],
                // disable the default error handler
                errorHandler: {
                    error: () => ErrorAction.Continue,
                    closed: () => CloseAction.DoNotRestart
                }
            },
            // create a language client connection from the JSON RPC connection on demand
            connectionProvider: {
                get: (errorHandler, closeHandler) => {
                    return Promise.resolve(createConnection(connection, errorHandler, closeHandler));
                }
            }
        });
    }

    private createUrl(websocketConfig: WebSocketConf) {
        const protocol = websocketConfig.secured ? 'wss' : 'ws';
        return normalizeUrl(`${protocol}://${websocketConfig.host}:${websocketConfig.port}/${websocketConfig.path}`);
    }

}
