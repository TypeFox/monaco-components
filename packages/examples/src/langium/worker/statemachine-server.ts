import { start } from './startLanguageServer.js';

declare const self: DedicatedWorkerGlobalScope;

start(self, 'statemachine-server');
