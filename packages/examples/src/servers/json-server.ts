import { resolve } from 'path';
import { getLocalDirectory, runJsonServer } from 'monaco-languageclient-examples/node';

const baseDir = resolve(getLocalDirectory(import.meta.url));
const relativeDir = '../../../../node_modules/monaco-languageclient-examples/dist/json/server/json-server.js';
runJsonServer(baseDir, relativeDir);
