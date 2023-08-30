import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import {fileURLToPath, URL} from 'url';
import { Socket } from 'net';
import express from 'express';
import { IWebSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { createConnection, createServerProcess, forward } from 'vscode-ws-jsonrpc/server';
import { Message, InitializeRequest, InitializeParams } from 'vscode-languageserver';
import {dirname} from 'path';
import path from 'path';

const serverName = 'KOTLIN_SERVER'; // Change the server name

const launchLanguageServer = (socket: IWebSocket) => {
    // Start the Kotlin Language Server as an external process
    const kotlinServerExecutable = path.join(getLocalDirectory(import.meta.url), 'server/bin/kotlin-language-server');

    const serverConnection = createServerProcess(serverName, kotlinServerExecutable, []);

    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);

    const socketConnection = createConnection(reader, writer, () => socket.dispose());
    if (serverConnection) {
        forward(socketConnection, serverConnection, message => {
            if (Message.isRequest(message)) {
                console.log(`${serverName} Server received:`);
                console.log(message);
                if (message.method === InitializeRequest.type.method) {
                    const initializeParams = message.params as InitializeParams;
                    initializeParams.processId = process.pid;
                }
            }
            if (Message.isResponse(message)) {
                console.log(`${serverName} Server sent:`);
                console.log(message);
            }
            return message;
        });
    }
};

const run = () => {
    process.on('uncaughtException', function(err: any) {
        console.error('Uncaught Exception: ', err.toString());
        if (err.stack) {
            console.error(err.stack);
        }
    });

    // Create the express application
    const app = express();
    // Serve the static content, i.e. index.html
    const dir = getLocalDirectory(import.meta.url);
    app.use(express.static(dir));
    // Start the server
    const server = app.listen(30000);
    // Create the WebSocket server
    const wss = new WebSocketServer({
        noServer: true,
        perMessageDeflate: false
    });

    server.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
        const baseURL = `http://${request.headers.host}/`;
        const pathname = request.url ? new URL(request.url, baseURL).pathname : undefined;
        if (pathname === '/kotlin') { // Change the path
            wss.handleUpgrade(request, socket, head, webSocket => {
                const socket: IWebSocket = {
                    send: content => webSocket.send(content, error => {
                        if (error) {
                            throw error;
                        }
                    }),
                    onMessage: cb => webSocket.on('message', (data) => {
                        cb(data);
                    }),
                    onError: cb => webSocket.on('error', cb),
                    onClose: cb => webSocket.on('close', cb),
                    dispose: () => webSocket.close()
                };
                // Launch the server when the WebSocket is opened
                if (webSocket.readyState === webSocket.OPEN) {
                    launchLanguageServer(socket);
                } else {
                    webSocket.on('open', () => {
                        launchLanguageServer(socket);
                    });
                }
            });
        }
    });
};

function getLocalDirectory(referenceUrl: string | URL) {
    const __filename = fileURLToPath(referenceUrl);
    return dirname(__filename);
}

run();
